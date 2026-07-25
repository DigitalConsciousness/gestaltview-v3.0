create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'STUDIO',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint organizations_plan_check
    check (plan in ('SOLO_SPARK', 'STUDIO', 'GROWTH', 'ENTERPRISE'))
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null unique,
  segment text not null default 'business',
  theme_profile_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint workspaces_segment_check
    check (segment in ('solo', 'business', 'enterprise'))
);

create table if not exists public.theme_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  tokens jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

alter table public.workspaces
  drop constraint if exists workspaces_theme_profile_id_fkey;

alter table public.workspaces
  add constraint workspaces_theme_profile_id_fkey
  foreign key (theme_profile_id) references public.theme_profiles(id) on delete set null;

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.kit_users(id) on delete cascade,
  role text not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint workspace_members_role_check
    check (role in ('owner', 'admin', 'editor', 'viewer', 'auditor'))
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  slug text not null,
  mode text not null default 'default',
  status text not null default 'draft',
  default_domain text not null default 'general',
  theme_override jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint agents_workspace_slug_unique unique (workspace_id, slug)
);

create table if not exists public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid null references public.workspaces(id) on delete set null,
  entry_mode text not null,
  status text not null default 'in_progress',
  segment_recommendation text not null default 'business',
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  updated_at timestamptz not null default now(),
  constraint onboarding_sessions_entry_mode_check
    check (entry_mode in ('web', 'cli')),
  constraint onboarding_sessions_status_check
    check (status in ('in_progress', 'blocked', 'completed')),
  constraint onboarding_sessions_segment_check
    check (segment_recommendation in ('solo', 'business', 'enterprise'))
);

create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.onboarding_sessions(id) on delete cascade,
  task_key text not null,
  status text not null default 'pending',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint onboarding_tasks_session_task_unique unique (session_id, task_key),
  constraint onboarding_tasks_status_check
    check (status in ('pending', 'in_progress', 'completed', 'blocked'))
);

create table if not exists public.corpus_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid null references public.agents(id) on delete set null,
  lane text not null,
  source_type text not null,
  source_uri text not null,
  checksum text null,
  ingestion_status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint corpus_sources_lane_check
    check (lane in ('knowledge', 'code', 'product', 'context'))
);

create table if not exists public.corpus_fragments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid null references public.agents(id) on delete set null,
  source_id uuid not null references public.corpus_sources(id) on delete cascade,
  lane text not null,
  title text not null,
  content text not null,
  embedding vector(768) null,
  chunk_index integer not null default 0,
  tags text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint corpus_fragments_lane_check
    check (lane in ('knowledge', 'code', 'product', 'context'))
);

create table if not exists public.evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  suite_name text not null,
  score numeric not null default 0,
  status text not null default 'pending',
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table if not exists public.policy_packs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  rules jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid null references public.workspaces(id) on delete set null,
  actor_id uuid null references public.kit_users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.knowledge_fragments
  add column if not exists workspace_id uuid null references public.workspaces(id) on delete set null,
  add column if not exists agent_id uuid null references public.agents(id) on delete set null;

alter table public.memory_entries
  add column if not exists workspace_id uuid null references public.workspaces(id) on delete set null,
  add column if not exists agent_id uuid null references public.agents(id) on delete set null,
  add column if not exists scope text not null default 'user';

alter table public.memory_entries
  drop constraint if exists memory_entries_scope_check;

alter table public.memory_entries
  add constraint memory_entries_scope_check
  check (scope in ('user', 'shared', 'pinned'));

alter table public.usage_events
  add column if not exists workspace_id uuid null references public.workspaces(id) on delete set null,
  add column if not exists agent_id uuid null references public.agents(id) on delete set null;

create index if not exists organizations_plan_idx
  on public.organizations(plan)
  where deleted_at is null;

create index if not exists workspaces_org_segment_idx
  on public.workspaces(organization_id, segment)
  where deleted_at is null;

create index if not exists workspace_members_workspace_role_idx
  on public.workspace_members(workspace_id, role)
  where deleted_at is null;

create index if not exists agents_workspace_status_idx
  on public.agents(workspace_id, status)
  where deleted_at is null;

create index if not exists onboarding_sessions_workspace_status_idx
  on public.onboarding_sessions(workspace_id, status, started_at desc);

create index if not exists onboarding_tasks_session_status_idx
  on public.onboarding_tasks(session_id, status, updated_at desc);

create index if not exists corpus_sources_workspace_lane_idx
  on public.corpus_sources(workspace_id, lane, created_at desc)
  where deleted_at is null;

create index if not exists corpus_fragments_workspace_lane_idx
  on public.corpus_fragments(workspace_id, lane, created_at desc)
  where deleted_at is null;

create index if not exists corpus_fragments_embedding_idx
  on public.corpus_fragments
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists evaluation_runs_workspace_agent_idx
  on public.evaluation_runs(workspace_id, agent_id, created_at desc)
  where deleted_at is null;

create index if not exists audit_logs_org_workspace_idx
  on public.audit_logs(organization_id, workspace_id, created_at desc);

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

drop trigger if exists set_theme_profiles_updated_at on public.theme_profiles;
create trigger set_theme_profiles_updated_at
before update on public.theme_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_workspace_members_updated_at on public.workspace_members;
create trigger set_workspace_members_updated_at
before update on public.workspace_members
for each row execute function public.set_updated_at();

drop trigger if exists set_agents_updated_at on public.agents;
create trigger set_agents_updated_at
before update on public.agents
for each row execute function public.set_updated_at();

drop trigger if exists set_onboarding_sessions_updated_at on public.onboarding_sessions;
create trigger set_onboarding_sessions_updated_at
before update on public.onboarding_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_onboarding_tasks_updated_at on public.onboarding_tasks;
create trigger set_onboarding_tasks_updated_at
before update on public.onboarding_tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_corpus_sources_updated_at on public.corpus_sources;
create trigger set_corpus_sources_updated_at
before update on public.corpus_sources
for each row execute function public.set_updated_at();

drop trigger if exists set_corpus_fragments_updated_at on public.corpus_fragments;
create trigger set_corpus_fragments_updated_at
before update on public.corpus_fragments
for each row execute function public.set_updated_at();

drop trigger if exists set_evaluation_runs_updated_at on public.evaluation_runs;
create trigger set_evaluation_runs_updated_at
before update on public.evaluation_runs
for each row execute function public.set_updated_at();

drop trigger if exists set_policy_packs_updated_at on public.policy_packs;
create trigger set_policy_packs_updated_at
before update on public.policy_packs
for each row execute function public.set_updated_at();
