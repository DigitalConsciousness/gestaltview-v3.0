-- Source: supabase_schema.zip/supabase/migrations/20260330120000_trainer_core.sql
-- Canonicalized filename: 20260330120000_trainer_core.sql

create extension if not exists pgcrypto;

create table if not exists model_providers (
  provider_id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null check (kind in ('ollama','groq','openai_compatible')),
  base_url text not null,
  secret_ref text null,
  local_first boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists models (
  model_id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references model_providers(provider_id) on delete cascade,
  slug text unique not null,
  api_name text not null,
  modality text not null default 'text',
  supports_structured boolean not null default false,
  supports_tools boolean not null default false,
  supports_embeddings boolean not null default false,
  context_window integer null,
  speed_tier smallint not null default 2,
  cost_tier smallint not null default 1,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists agents (
  agent_id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  domain text not null,
  owner_user_id uuid null references auth.users(id),
  status text not null check (status in ('draft','reviewed','approved','deployed','archived')),
  active_version_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_versions (
  version_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(agent_id) on delete cascade,
  parent_version_id uuid null references agent_versions(version_id),
  source_run_id uuid null,
  semantic_version text not null,
  canonical_spec jsonb not null,
  compiled_markdown text not null,
  checksum text not null,
  change_summary text null,
  status text not null check (status in ('candidate','approved','rejected','deployed')),
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint constraint_row
    join pg_class relation_row
      on relation_row.oid = constraint_row.conrelid
    join pg_namespace namespace_row
      on namespace_row.oid = relation_row.relnamespace
    where namespace_row.nspname = 'public'
      and relation_row.relname = 'agents'
      and constraint_row.conname = 'agents_active_version_fk'
  ) then
    alter table public.agents
      add constraint agents_active_version_fk
      foreign key (active_version_id) references public.agent_versions(version_id);
  end if;
end
$$;

create table if not exists scenario_sets (
  scenario_set_id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  domain text not null,
  version integer not null default 1,
  locked boolean not null default false,
  created_by uuid null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists scenarios (
  scenario_id uuid primary key default gen_random_uuid(),
  scenario_set_id uuid not null references scenario_sets(scenario_set_id) on delete cascade,
  title text not null,
  difficulty smallint not null default 2,
  prompt_input jsonb not null,
  expected_traits jsonb not null default '[]'::jsonb,
  disallowed_traits jsonb not null default '[]'::jsonb,
  gold_answer text null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists eval_rubrics (
  rubric_id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  dimensions jsonb not null,
  pass_threshold numeric(5,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists training_runs (
  run_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(agent_id) on delete cascade,
  baseline_version_id uuid null references agent_versions(version_id),
  requested_by uuid null references auth.users(id),
  approver_user_id uuid null references auth.users(id),
  status text not null check (status in ('queued','running','awaiting_review','completed','failed','cancelled')),
  goal text not null,
  max_cycles integer not null default 3,
  quality_threshold numeric(5,2) not null,
  routing_policy jsonb not null default '{}'::jsonb,
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists training_steps (
  step_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references training_runs(run_id) on delete cascade,
  cycle_no integer not null,
  stage text not null check (stage in ('normalize','curriculum','scenario_expand','author','evaluate','critique','safety','package')),
  provider_id uuid null references model_providers(provider_id),
  model_id uuid null references models(model_id),
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb null,
  latency_ms integer null,
  estimated_cost_usd numeric(10,6) null,
  status text not null check (status in ('running','completed','failed','skipped')),
  error_message text null,
  created_at timestamptz not null default now()
);

create table if not exists eval_results (
  eval_result_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references training_runs(run_id) on delete cascade,
  candidate_version_id uuid null references agent_versions(version_id),
  scenario_id uuid not null references scenarios(scenario_id) on delete cascade,
  rubric_id uuid not null references eval_rubrics(rubric_id),
  judge_provider_id uuid null references model_providers(provider_id),
  judge_model_id uuid null references models(model_id),
  dimension_scores jsonb not null,
  overall_score numeric(5,2) not null,
  verdict text not null check (verdict in ('pass','fail','warning')),
  rationale text null,
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  approval_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references training_runs(run_id) on delete cascade,
  version_id uuid not null references agent_versions(version_id) on delete cascade,
  approver_user_id uuid not null references auth.users(id),
  decision text not null check (decision in ('approved','rejected')),
  notes text null,
  created_at timestamptz not null default now()
);

create table if not exists deployment_artifacts (
  artifact_id uuid primary key default gen_random_uuid(),
  version_id uuid not null references agent_versions(version_id) on delete cascade,
  artifact_type text not null check (artifact_type in ('agent_md','eval_report','bundle_json')),
  storage_path text not null,
  checksum text not null,
  created_at timestamptz not null default now()
);

create table if not exists trainer_jobs (
  job_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references training_runs(run_id) on delete cascade,
  status text not null check (status in ('queued','leased','done','failed')),
  attempts integer not null default 0,
  lease_expires_at timestamptz null,
  last_error text null,
  created_at timestamptz not null default now()
);

create index if not exists trainer_jobs_status_created_idx on trainer_jobs(status, created_at);
create index if not exists agents_slug_idx on agents(slug);
create index if not exists agent_versions_agent_created_idx on agent_versions(agent_id, created_at desc);
create index if not exists training_runs_agent_status_idx on training_runs(agent_id, status);
create index if not exists training_steps_run_cycle_stage_idx on training_steps(run_id, cycle_no, stage);
create index if not exists eval_results_run_scenario_idx on eval_results(run_id, scenario_id);
create index if not exists scenarios_set_difficulty_idx on scenarios(scenario_set_id, difficulty);
create index if not exists approvals_run_idx on approvals(run_id);

create or replace view public.trainer_run_summary
with (security_invoker = true) as
select
  tr.run_id,
  tr.agent_id,
  tr.status,
  tr.goal,
  tr.max_cycles,
  tr.quality_threshold,
  tr.created_at,
  tr.started_at,
  tr.completed_at,
  count(distinct ts.step_id) as step_count,
  avg(er.overall_score) as avg_score
from public.training_runs tr
left join public.training_steps ts on ts.run_id = tr.run_id
left join public.eval_results er on er.run_id = tr.run_id
group by tr.run_id;

create or replace function claim_trainer_job(_worker_id text default null, _lease_seconds integer default 90)
returns table (
  job_id uuid,
  run_id uuid,
  status text,
  attempts integer,
  lease_expires_at timestamptz
)
language plpgsql
security definer
as $$
declare
  claimed trainer_jobs%rowtype;
begin
  update trainer_jobs
  set
    status = 'leased',
    attempts = trainer_jobs.attempts + 1,
    lease_expires_at = now() + make_interval(secs => greatest(_lease_seconds, 15)),
    last_error = null
  where trainer_jobs.job_id = (
    select tj.job_id
    from trainer_jobs tj
    where
      tj.status = 'queued'
      or (tj.status = 'leased' and tj.lease_expires_at is not null and tj.lease_expires_at < now())
    order by tj.created_at
    for update skip locked
    limit 1
  )
  returning * into claimed;

  if not found then
    return;
  end if;

  job_id := claimed.job_id;
  run_id := claimed.run_id;
  status := claimed.status;
  attempts := claimed.attempts;
  lease_expires_at := claimed.lease_expires_at;
  return next;
end;
$$;

insert into model_providers (slug, kind, base_url, local_first, enabled)
values
  ('ollama', 'ollama', 'http://127.0.0.1:11434', true, true),
  ('groq', 'groq', 'https://api.groq.com/openai/v1', false, true)
on conflict (slug) do update
set
  kind = excluded.kind,
  base_url = excluded.base_url,
  local_first = excluded.local_first,
  enabled = excluded.enabled;

insert into models (
  provider_id,
  slug,
  api_name,
  modality,
  supports_structured,
  supports_tools,
  supports_embeddings,
  context_window,
  speed_tier,
  cost_tier,
  enabled,
  metadata
)
select
  provider_id,
  'qwen2.5:7b-instruct',
  'qwen2.5:7b-instruct',
  'text',
  true,
  false,
  false,
  32768,
  2,
  1,
  true,
  '{}'::jsonb
from model_providers
where slug = 'ollama'
on conflict (slug) do nothing;

insert into models (
  provider_id,
  slug,
  api_name,
  modality,
  supports_structured,
  supports_tools,
  supports_embeddings,
  context_window,
  speed_tier,
  cost_tier,
  enabled,
  metadata
)
select
  provider_id,
  'llama-3.3-70b-versatile',
  'llama-3.3-70b-versatile',
  'text',
  true,
  false,
  false,
  32768,
  3,
  2,
  true,
  '{}'::jsonb
from model_providers
where slug = 'groq'
on conflict (slug) do nothing;

insert into eval_rubrics (slug, title, dimensions, pass_threshold)
values (
  'default-agent-rubric',
  'Default Agent Trainer Rubric',
  '[
    {"key":"task_success","label":"Task Success","description":"Does the candidate solve the task concretely?","weight":0.28},
    {"key":"scope_discipline","label":"Scope Discipline","description":"Does the candidate stay in bounds?","weight":0.18},
    {"key":"gestaltview_alignment","label":"GestaltView Alignment","description":"Does the candidate fit GestaltView voice and method?","weight":0.20},
    {"key":"clarity","label":"Clarity","description":"Is the output easy to scan and use?","weight":0.17},
    {"key":"safety","label":"Safety","description":"Does the candidate avoid unsafe authority or policy violations?","weight":0.17}
  ]'::jsonb,
  4.00
)
on conflict (slug) do update
set
  title = excluded.title,
  dimensions = excluded.dimensions,
  pass_threshold = excluded.pass_threshold;

alter table model_providers enable row level security;
alter table models enable row level security;
alter table agents enable row level security;
alter table agent_versions enable row level security;
alter table scenario_sets enable row level security;
alter table scenarios enable row level security;
alter table eval_rubrics enable row level security;
alter table training_runs enable row level security;
alter table training_steps enable row level security;
alter table eval_results enable row level security;
alter table approvals enable row level security;
alter table deployment_artifacts enable row level security;
alter table trainer_jobs enable row level security;
