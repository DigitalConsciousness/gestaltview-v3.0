create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

alter table public.training_runs
  add column if not exists blocked_reason text null,
  add column if not exists last_event_at timestamptz null,
  add column if not exists last_event_message text null;

alter table public.trainer_jobs
  add column if not exists worker_id text null,
  add column if not exists claimed_at timestamptz null,
  add column if not exists completed_at timestamptz null,
  add column if not exists last_heartbeat_at timestamptz null,
  add column if not exists max_attempts integer not null default 3,
  add column if not exists next_retry_at timestamptz not null default now(),
  add column if not exists lease_token uuid null default gen_random_uuid(),
  add column if not exists cancel_requested boolean not null default false;

alter table public.trainer_jobs
  drop constraint if exists trainer_jobs_status_check;

alter table public.trainer_jobs
  add constraint trainer_jobs_status_check
  check (status in ('queued', 'leased', 'done', 'failed', 'cancelled', 'retry_wait'));

create index if not exists trainer_jobs_status_retry_created_idx
  on public.trainer_jobs (status, next_retry_at, created_at);

create index if not exists trainer_jobs_run_idx
  on public.trainer_jobs (run_id);

create index if not exists trainer_jobs_lease_expires_idx
  on public.trainer_jobs (lease_expires_at);

create table if not exists public.trainer_workers (
  worker_id text primary key,
  status text not null default 'starting'
    check (status in ('starting', 'idle', 'busy', 'offline')),
  current_job_id uuid null references public.trainer_jobs(job_id) on delete set null,
  build_sha text null,
  host text null,
  started_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.trainer_job_events (
  event_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.training_runs(run_id) on delete cascade,
  job_id uuid null references public.trainer_jobs(job_id) on delete cascade,
  actor_type text not null check (actor_type in ('system', 'worker', 'admin')),
  actor_id text null,
  event_type text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists trainer_workers_status_heartbeat_idx
  on public.trainer_workers (status, last_heartbeat_at desc);

create index if not exists trainer_job_events_run_created_idx
  on public.trainer_job_events (run_id, created_at desc);

create index if not exists trainer_job_events_job_created_idx
  on public.trainer_job_events (job_id, created_at desc);

create or replace function public.claim_trainer_job(
  _worker_id text default null,
  _lease_seconds integer default 90
)
returns table (
  job_id uuid,
  run_id uuid,
  status text,
  attempts integer,
  lease_expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed public.trainer_jobs%rowtype;
begin
  update public.trainer_jobs
  set
    status = 'leased',
    attempts = public.trainer_jobs.attempts + 1,
    worker_id = _worker_id,
    claimed_at = coalesce(public.trainer_jobs.claimed_at, now()),
    last_heartbeat_at = now(),
    lease_expires_at = now() + make_interval(secs => greatest(_lease_seconds, 15)),
    next_retry_at = now(),
    cancel_requested = false,
    last_error = null,
    lease_token = gen_random_uuid()
  where public.trainer_jobs.job_id = (
    select tj.job_id
    from public.trainer_jobs tj
    where
      (
        tj.status in ('queued', 'retry_wait')
        and coalesce(tj.next_retry_at, now()) <= now()
      )
      or (
        tj.status = 'leased'
        and tj.lease_expires_at is not null
        and tj.lease_expires_at < now()
      )
    order by tj.created_at
    for update skip locked
    limit 1
  )
  returning * into claimed;

  if not found then
    return;
  end if;

  update public.training_runs
  set
    status = 'running',
    started_at = coalesce(started_at, now()),
    blocked_reason = null,
    last_event_at = now(),
    last_event_message = format('Worker %s claimed the queued job.', coalesce(_worker_id, 'unknown'))
  where public.training_runs.run_id = claimed.run_id;

  insert into public.trainer_job_events (
    run_id,
    job_id,
    actor_type,
    actor_id,
    event_type,
    message,
    payload
  )
  values (
    claimed.run_id,
    claimed.job_id,
    'worker',
    _worker_id,
    'job_claimed',
    format('Worker %s claimed the queued job.', coalesce(_worker_id, 'unknown')),
    jsonb_build_object('lease_expires_at', claimed.lease_expires_at)
  );

  job_id := claimed.job_id;
  run_id := claimed.run_id;
  status := claimed.status;
  attempts := claimed.attempts;
  lease_expires_at := claimed.lease_expires_at;
  return next;
end;
$$;

create or replace function public.heartbeat_trainer_worker(
  _worker_id text,
  _job_id uuid default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.trainer_workers (
    worker_id,
    status,
    current_job_id,
    last_heartbeat_at
  )
  values (
    _worker_id,
    case when _job_id is null then 'idle' else 'busy' end,
    _job_id,
    now()
  )
  on conflict (worker_id) do update
  set
    status = excluded.status,
    current_job_id = excluded.current_job_id,
    last_heartbeat_at = excluded.last_heartbeat_at;

  update public.trainer_jobs
  set last_heartbeat_at = now()
  where job_id = _job_id;
$$;

create or replace function public.repair_stale_trainer_jobs()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.trainer_workers
  set status = 'offline'
  where last_heartbeat_at < now() - interval '60 seconds'
    and status <> 'offline';

  update public.trainer_jobs
  set
    status = case when attempts >= max_attempts then 'failed' else 'retry_wait' end,
    lease_expires_at = null,
    worker_id = null,
    last_error = case
      when attempts >= max_attempts then 'Lease expired after max retry attempts.'
      else 'Lease expired; job returned to retry queue.'
    end,
    completed_at = case when attempts >= max_attempts then now() else completed_at end,
    next_retry_at = case
      when attempts >= max_attempts then next_retry_at
      else now() + interval '30 seconds'
    end
  where status = 'leased'
    and lease_expires_at is not null
    and lease_expires_at < now();

  update public.training_runs tr
  set
    status = case
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'failed'
      ) then 'failed'
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status in ('queued', 'retry_wait')
      ) then 'queued'
      else tr.status
    end,
    completed_at = case
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'failed'
      ) then coalesce(tr.completed_at, now())
      else tr.completed_at
    end,
    blocked_reason = case
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'failed'
      ) then 'Trainer job failed after stale lease repair.'
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'retry_wait'
      ) then 'Worker lease expired. Job moved to retry queue.'
      else tr.blocked_reason
    end,
    last_event_at = now(),
    last_event_message = case
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'failed'
      ) then 'Trainer job failed after stale lease repair.'
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'retry_wait'
      ) then 'Worker lease expired. Job moved to retry queue.'
      else tr.last_event_message
    end
  where tr.status in ('queued', 'running');
end;
$$;

create or replace view public.trainer_queue_health_v as
with job_counts as (
  select
    count(*) filter (where status = 'queued')::integer as queued_count,
    count(*) filter (where status = 'leased')::integer as leased_count,
    count(*) filter (where status = 'retry_wait')::integer as retry_wait_count,
    count(*) filter (where status = 'failed')::integer as failed_count,
    count(*) filter (
      where status = 'leased'
        and lease_expires_at is not null
        and lease_expires_at < now()
    )::integer as stale_lease_count,
    min(created_at) filter (where status = 'queued') as oldest_queued_at
  from public.trainer_jobs
),
worker_counts as (
  select
    count(*) filter (
      where status <> 'offline'
        and last_heartbeat_at >= now() - interval '60 seconds'
    )::integer as online_worker_count
  from public.trainer_workers
),
review_counts as (
  select
    count(*) filter (where status = 'awaiting_review')::integer as awaiting_review_count
  from public.training_runs
)
select
  job_counts.queued_count,
  job_counts.leased_count,
  job_counts.retry_wait_count,
  job_counts.failed_count,
  review_counts.awaiting_review_count,
  job_counts.stale_lease_count,
  worker_counts.online_worker_count,
  job_counts.oldest_queued_at
from job_counts, worker_counts, review_counts;

create or replace function public.trainer_queue_health()
returns table (
  queued_count integer,
  leased_count integer,
  retry_wait_count integer,
  failed_count integer,
  awaiting_review_count integer,
  stale_lease_count integer,
  online_worker_count integer,
  oldest_queued_at timestamptz
)
language sql
stable
set search_path = public
as $$
  select
    queued_count,
    leased_count,
    retry_wait_count,
    failed_count,
    awaiting_review_count,
    stale_lease_count,
    online_worker_count,
    oldest_queued_at
  from public.trainer_queue_health_v;
$$;

create or replace function public.trainer_search_study_sources(
  query_text text,
  limit_count integer default 24
)
returns table (
  source_file text,
  document_type text,
  fragment_id uuid,
  excerpt text,
  semantic_score numeric,
  keyword_score numeric,
  final_score numeric,
  tags text[]
)
language sql
stable
set search_path = public
as $$
  with ranked as (
    select
      kf.source_file,
      kf.document_type,
      kf.id as fragment_id,
      left(regexp_replace(coalesce(kf.content, ''), '\s+', ' ', 'g'), 600) as excerpt,
      coalesce(similarity(lower(kf.content), lower(query_text)), 0)::numeric as semantic_score,
      ts_rank(
        to_tsvector('english', coalesce(kf.content, '')),
        plainto_tsquery('english', query_text)
      )::numeric as keyword_score,
      (
        0.55 * coalesce(similarity(lower(kf.content), lower(query_text)), 0)
        + 0.20 * ts_rank(
          to_tsvector('english', coalesce(kf.content, '')),
          plainto_tsquery('english', query_text)
        )
        + 0.15 * case
          when lower(kf.document_type) in ('billy', 'plk', 'manifestindex') then 1
          when lower(kf.document_type) in ('architecture', 'documentation', 'product', 'api', 'diligence') then 0.7
          else 0.4
        end
        + 0.10 * case
          when lower(kf.source_file) like '%' || lower(query_text) || '%' then 1
          when lower(kf.source_file) like '%billy%' and lower(query_text) like '%billy%' then 0.8
          when lower(kf.source_file) like '%plk%' and lower(query_text) like '%plk%' then 0.8
          else 0.3
        end
      )::numeric as final_score,
      kf.tags
    from public.knowledge_fragments kf
    where
      query_text is not null
      and length(trim(query_text)) > 0
      and (
        to_tsvector('english', coalesce(kf.content, '')) @@ plainto_tsquery('english', query_text)
        or similarity(lower(kf.content), lower(query_text)) > 0.05
      )
  )
  select
    source_file,
    document_type,
    fragment_id,
    excerpt,
    semantic_score,
    keyword_score,
    final_score,
    tags
  from ranked
  order by final_score desc, source_file asc
  limit greatest(1, least(limit_count, 100));
$$;

grant execute on function public.claim_trainer_job(text, integer) to service_role;
grant execute on function public.heartbeat_trainer_worker(text, uuid) to service_role;
grant execute on function public.repair_stale_trainer_jobs() to service_role;
grant execute on function public.trainer_queue_health() to service_role;
grant execute on function public.trainer_search_study_sources(text, integer) to service_role;

do $$
declare
  governed_table text;
  policy_name text;
begin
  foreach governed_table in array array['trainer_workers', 'trainer_job_events']
  loop
    execute format('alter table public.%I enable row level security', governed_table);

    policy_name := format('Service role full access %s', governed_table);

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = governed_table
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to service_role using (true) with check (true)',
        policy_name,
        governed_table
      );
    end if;
  end loop;
end
$$;
