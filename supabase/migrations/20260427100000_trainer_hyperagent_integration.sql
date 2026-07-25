-- Source: supabase_schema.zip/supabase/migrations/20260427100000_trainer_hyperagent_integration.sql
-- Canonicalized filename: 20260427100000_trainer_hyperagent_integration.sql

create extension if not exists pgcrypto;

alter table public.trainer_experiments
  add column if not exists execution_mode text not null default 'classic'
    check (execution_mode in ('classic', 'hyperagent')),
  add column if not exists connector_graph jsonb null,
  add column if not exists skill_graph jsonb null,
  add column if not exists memory_graph jsonb null;

alter table public.training_runs
  add column if not exists execution_mode text not null default 'classic'
    check (execution_mode in ('classic', 'hyperagent')),
  add column if not exists resolved_graph jsonb null,
  add column if not exists graph_observations jsonb null;

create table if not exists public.trainer_connectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  kind text not null
    check (kind in ('supabase', 'github', 'webhook', 'rag-index', 'runtime-api', 'other')),
  config jsonb not null default '{}'::jsonb,
  capabilities jsonb not null default '{}'::jsonb,
  created_by text not null default 'Keith',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_skills (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null,
  slug text not null unique,
  category text not null,
  default_connector_id uuid null references public.trainer_connectors(id) on delete set null,
  config jsonb not null default '{}'::jsonb,
  safety_profile jsonb not null default '{}'::jsonb,
  created_by text not null default 'Keith',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_memory_bindings (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid null references public.trainer_experiments(id) on delete cascade,
  embodiment_id text null,
  surface_kind text not null,
  surface_id text not null,
  mode text not null default 'read'
    check (mode in ('read', 'write', 'read-write')),
  created_by text not null default 'Keith',
  created_at timestamptz not null default now()
);

create or replace view public.trainer_memory_surfaces as
select
  'memory_entries'::text as surfacekind,
  me.id::text as surfaceid,
  left(coalesce(me.content, me.title, 'memory entry'), 120)::text as label,
  me.user_id::text as ownerid,
  me.source::text as sourceref,
  coalesce(me.tags, '{}'::text[]) as tags,
  me.updated_at as lastupdated
from public.memory_entries me
union all
select
  'knowledge_fragments'::text as surfacekind,
  kf.id::text as surfaceid,
  left(coalesce(kf.content, kf.source_file, 'knowledge fragment'), 120)::text as label,
  null::text as ownerid,
  kf.source_file::text as sourceref,
  coalesce(kf.tags, '{}'::text[]) as tags,
  kf.created_at as lastupdated
from public.knowledge_fragments kf
union all
select
  'ops_workbook_items'::text as surfacekind,
  ow.id::text as surfaceid,
  left(coalesce(ow.label, ow.row_key, 'workbook item'), 120)::text as label,
  null::text as ownerid,
  ow.sheet_name::text as sourceref,
  coalesce(
    array_remove(array[ow.category, ow.status, ow.priority, ow.phase], null),
    '{}'::text[]
  ) as tags,
  ow.updated_at as lastupdated
from public.ops_workbook_items ow;

create index if not exists trainer_connectors_kind_active_idx
  on public.trainer_connectors(kind, active, updated_at desc);

create index if not exists trainer_skills_category_updated_idx
  on public.trainer_skills(category, updated_at desc);

create index if not exists trainer_memory_bindings_experiment_idx
  on public.trainer_memory_bindings(experiment_id, created_at desc);

create index if not exists trainer_experiments_execution_mode_idx
  on public.trainer_experiments(execution_mode, updated_at desc);

create index if not exists training_runs_execution_mode_idx
  on public.training_runs(execution_mode, created_at desc);

do $$
declare
  governed_table text;
  policy_name text;
begin
  foreach governed_table in array array[
    'trainer_connectors',
    'trainer_skills',
    'trainer_memory_bindings'
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
