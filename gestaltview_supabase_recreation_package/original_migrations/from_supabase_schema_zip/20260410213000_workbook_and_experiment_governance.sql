create extension if not exists pgcrypto;

create or replace function public.set_workbook_governance_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.ops_workbook_items (
  id uuid primary key default gen_random_uuid(),
  sheet_name text not null,
  row_key text not null,
  label text not null,
  category text null,
  status text null,
  priority text null,
  phase text null,
  owner text not null default 'Keith',
  target_start date null,
  target_end date null,
  notes text null,
  link_ref text null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sheet_name, row_key)
);

create table if not exists public.ops_workbook_sync_runs (
  id uuid primary key default gen_random_uuid(),
  triggered_by text null,
  source_file text null,
  rows_upserted integer not null default 0,
  rows_skipped integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  status text not null check (status in ('success', 'partial', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.trainer_experiments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  purpose text not null,
  domain text null,
  embodiment_profile_slug text null,
  goal text null,
  target_behaviors text[] not null default '{}',
  anti_goals text[] not null default '{}',
  study_focus text null,
  max_cycles integer not null default 3,
  quality_threshold numeric(5,2) not null default 4.0,
  drafting_provider text not null default 'auto',
  evaluation_provider text not null default 'auto',
  class text not null default 'operational_profile'
    check (class in ('operational_profile', 'approved_training_kit', 'rejected')),
  packaging_eligible boolean not null default false,
  created_by text not null default 'Keith',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_experiment_sources (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.trainer_experiments(id) on delete cascade,
  source_type text not null
    check (source_type in ('document', 'scenario_set', 'run_output', 'spec_file')),
  source_id text not null,
  source_path text null,
  notes text null,
  created_at timestamptz not null default now()
);

create table if not exists public.trainer_review_decisions (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.trainer_experiments(id) on delete cascade,
  run_id text null,
  version_id text null,
  decision text not null
    check (decision in ('approved', 'rejected', 'hold', 'promote_kit')),
  reviewer text not null default 'Keith',
  coherence_score numeric(5,2) null,
  safety_score numeric(5,2) null,
  emotional_posture_score numeric(5,2) null,
  over_id_risk text null
    check (over_id_risk in ('none', 'low', 'medium', 'high')),
  notes text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.trainer_policy_flags (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.trainer_experiments(id) on delete cascade,
  flag text not null
    check (flag in ('persona-risk', 'memory-risk', 'overattachment-risk', 'claims-risk', 'charisma-artifact', 'scope-creep')),
  severity text not null
    check (severity in ('advisory', 'blocking')),
  set_by text not null default 'Keith',
  notes text null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.trainer_packaging_candidates (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.trainer_experiments(id) on delete cascade,
  package_label text not null,
  package_description text not null,
  included_files text[] not null default '{}',
  included_scenarios text[] not null default '{}',
  included_configs jsonb not null default '{}'::jsonb,
  boundary_statement text not null,
  approved_by text not null default 'Keith',
  approved_at timestamptz null,
  status text not null default 'candidate'
    check (status in ('candidate', 'kit_approved', 'shipped', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.training_runs
  add column if not exists experiment_id uuid null references public.trainer_experiments(id) on delete set null;

create index if not exists ops_workbook_items_sheet_status_idx
  on public.ops_workbook_items (sheet_name, status, priority, phase);
create index if not exists ops_workbook_items_sheet_updated_idx
  on public.ops_workbook_items (sheet_name, updated_at desc);
create index if not exists ops_workbook_sync_runs_created_idx
  on public.ops_workbook_sync_runs (created_at desc);
create index if not exists trainer_experiments_class_updated_idx
  on public.trainer_experiments (class, updated_at desc);
create index if not exists trainer_experiment_sources_experiment_idx
  on public.trainer_experiment_sources (experiment_id, created_at desc);
create index if not exists trainer_review_decisions_experiment_idx
  on public.trainer_review_decisions (experiment_id, created_at desc);
create index if not exists trainer_policy_flags_experiment_resolved_idx
  on public.trainer_policy_flags (experiment_id, resolved, severity);
create index if not exists trainer_packaging_candidates_status_idx
  on public.trainer_packaging_candidates (status, updated_at desc);
create index if not exists training_runs_experiment_created_idx
  on public.training_runs (experiment_id, created_at desc)
  where experiment_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'ops_workbook_items_set_updated_at'
  ) then
    create trigger ops_workbook_items_set_updated_at
    before update on public.ops_workbook_items
    for each row execute function public.set_workbook_governance_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trainer_experiments_set_updated_at'
  ) then
    create trigger trainer_experiments_set_updated_at
    before update on public.trainer_experiments
    for each row execute function public.set_workbook_governance_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trainer_packaging_candidates_set_updated_at'
  ) then
    create trigger trainer_packaging_candidates_set_updated_at
    before update on public.trainer_packaging_candidates
    for each row execute function public.set_workbook_governance_updated_at();
  end if;
end
$$;

do $$
declare
  governed_table text;
  policy_name text;
begin
  foreach governed_table in array array[
    'ops_workbook_items',
    'ops_workbook_sync_runs',
    'trainer_experiments',
    'trainer_experiment_sources',
    'trainer_review_decisions',
    'trainer_policy_flags',
    'trainer_packaging_candidates'
  ]
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
