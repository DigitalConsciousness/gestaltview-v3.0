-- Minimal v1-shaped fixture for testing the forward render v2 reconciliation.

create schema if not exists auth;
create schema if not exists storage;

create table auth.users (
  id uuid primary key
);

create table public.render_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  source_room text,
  graph_id text not null,
  scene_graph jsonb not null,
  status text not null default 'queued',
  diagnostics jsonb not null default '[]'::jsonb,
  manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint render_jobs_status_check
    check (status = any (array['queued', 'rendering', 'completed', 'failed', 'cancelled']))
);

create table public.render_artifacts (
  id uuid primary key default gen_random_uuid(),
  render_job_id uuid not null references public.render_jobs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  uri text not null,
  format text not null,
  backend text,
  bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.inner_world_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null,
  source_ref text unique,
  content_ref jsonb,
  created_at timestamptz not null default now()
);

create table storage.buckets (
  id text primary key,
  public boolean not null default false
);

alter table public.render_jobs enable row level security;
alter table public.render_artifacts enable row level security;
alter table public.inner_world_artifacts enable row level security;

create policy render_jobs_owner_select on public.render_jobs
  for select using (true);
create policy render_artifacts_owner_select on public.render_artifacts
  for select using (true);
create policy inner_world_owner_select on public.inner_world_artifacts
  for select using (true);

insert into auth.users (id)
values ('11111111-1111-4111-8111-111111111111');

insert into public.render_jobs (
  id,
  user_id,
  source_room,
  graph_id,
  scene_graph,
  status
)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'creation_corner',
  'fixture-v1',
  '{"schema":"nextgen.scene-graph.v1","graphId":"fixture-v1"}'::jsonb,
  'completed'
);

insert into public.render_artifacts (
  id,
  render_job_id,
  user_id,
  uri,
  format,
  backend,
  bytes
)
values (
  '33333333-3333-4333-8333-333333333333',
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'legacy://fixture.html',
  'html',
  'fixture-backend',
  12
);

insert into public.inner_world_artifacts (id, user_id, title, source_ref)
values (
  '44444444-4444-4444-8444-444444444444',
  '11111111-1111-4111-8111-111111111111',
  'Preserved legacy artifact',
  'legacy:fixture'
);

insert into storage.buckets (id, public)
values ('codex-exports', false);
