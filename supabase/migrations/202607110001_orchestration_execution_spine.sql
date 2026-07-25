-- GestaltView orchestration execution spine
-- Date: 2026-07-11
-- Additive run/worker ledger for deterministic orchestration execution.

create table if not exists public.orchestration_runs (
  id uuid primary key default gen_random_uuid(),
  run_id text not null unique,
  decision_id text not null,
  user_id uuid,
  trigger text not null,
  source_room text not null,
  content_kind text not null,
  spawn_mode text not null default 'auto'
    check (spawn_mode in ('auto', 'approval')),
  gate_state text not null default 'auto'
    check (gate_state in ('auto', 'approval')),
  worker_count integer not null default 0 check (worker_count >= 0),
  run_status text not null default 'queued'
    check (run_status in ('queued', 'running', 'completed', 'failed', 'awaiting_approval')),
  input_payload jsonb not null default '{}'::jsonb,
  decision_payload jsonb not null default '{}'::jsonb,
  execution_payload jsonb not null default '{}'::jsonb,
  error_summary text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orchestration_worker_runs (
  id uuid primary key default gen_random_uuid(),
  run_id text not null references public.orchestration_runs(run_id) on delete cascade,
  worker_id text not null,
  label text not null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'done', 'failed', 'skipped')),
  summary text not null default '',
  depends_on text[] not null default array[]::text[],
  result_payload jsonb not null default '{}'::jsonb,
  error_summary text,
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, worker_id)
);

create index if not exists idx_orchestration_runs_user_created
  on public.orchestration_runs(user_id, created_at desc);
create index if not exists idx_orchestration_runs_status_created
  on public.orchestration_runs(run_status, created_at desc);
create index if not exists idx_orchestration_worker_runs_run_status
  on public.orchestration_worker_runs(run_id, status, created_at asc);

alter table public.orchestration_runs enable row level security;
alter table public.orchestration_worker_runs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orchestration_runs'
      and policyname = 'Users can read own orchestration runs'
  ) then
    create policy "Users can read own orchestration runs"
    on public.orchestration_runs for select
    to authenticated
    using (user_id = auth.uid());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orchestration_worker_runs'
      and policyname = 'Users can read own orchestration worker runs'
  ) then
    create policy "Users can read own orchestration worker runs"
    on public.orchestration_worker_runs for select
    to authenticated
    using (
      exists (
        select 1
        from public.orchestration_runs runs
        where runs.run_id = orchestration_worker_runs.run_id
          and runs.user_id = auth.uid()
      )
    );
  end if;
end
$$;

comment on table public.orchestration_runs is
  'Durable orchestration run envelopes and final execution receipts.';
comment on table public.orchestration_worker_runs is
  'Per-worker dependency, status, result, and failure evidence for orchestration runs.';
