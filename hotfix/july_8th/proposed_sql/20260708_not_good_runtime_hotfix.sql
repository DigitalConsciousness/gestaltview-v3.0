-- Not Good July 8 Runtime Hotfix
-- Purpose: repair schema drift and stuck runtime records without deleting user data.

begin;

-- 1) Inner World API selects this field. Add it if the live table lacks it.
alter table if exists public.inner_world_artifacts
  add column if not exists origin_di_id text;

-- 2) Blueprints endpoint expects this table. Create a safe baseline if missing.
create table if not exists public.blueprints (
  id text primary key,
  user_id uuid not null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'exported')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blueprints_user_updated
  on public.blueprints(user_id, updated_at desc);

alter table public.blueprints enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blueprints'
      and policyname = 'Users can read own blueprints'
  ) then
    create policy "Users can read own blueprints"
      on public.blueprints for select
      to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blueprints'
      and policyname = 'Users can write own blueprints'
  ) then
    create policy "Users can write own blueprints"
      on public.blueprints for all
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

-- 3) Profile source type check drift. The API emits profile_upload.
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.profile_ingestion_sources'::regclass
    and conname like '%source_type%check%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.profile_ingestion_sources drop constraint %I', constraint_name);
  end if;

  alter table public.profile_ingestion_sources
    add constraint profile_ingestion_sources_source_type_check
    check (
      source_type in (
        'profile_upload',
        'manual_text',
        'upload',
        'file',
        'memory',
        'plk',
        'conversation',
        'transcriptory',
        'musical_dna',
        'unknown'
      )
    );
end $$;

-- 4) Transcriptory stale processing repair.
-- Captures with processing status but no processing_started_at never got properly claimed.
update public.transcriptory_captures
set
  status = 'failed',
  transcript_status = 'failed',
  error_code = 'stale_processing_unclaimed',
  error_message = 'Capture was marked processing before the transcriber could claim it. Reset by runtime hotfix; upload can be retried.',
  processing_completed_at = now(),
  updated_at = now()
where
  status = 'processing'
  and transcript_status = 'processing'
  and processing_started_at is null
  and raw_transcript is null;

-- 5) Codex artifacts with ready export jobs should not remain invisible forever.
-- Conservative: only marks as ready if at least one html/json job exists.
update public.codex_artifacts ca
set
  status = 'ready',
  updated_at = now()
where
  ca.status = 'draft'
  and exists (
    select 1
    from public.codex_jobs cj
    where cj.artifact_id = ca.id
      and cj.status = 'ready'
      and cj.format in ('html', 'json')
  );

commit;
