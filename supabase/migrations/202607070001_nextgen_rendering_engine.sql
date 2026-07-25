create table if not exists public.render_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  source_room text,
  graph_id text not null,
  scene_graph jsonb not null,
  status text not null default 'queued' check (status in ('queued','rendering','completed','failed','cancelled')),
  diagnostics jsonb not null default '[]'::jsonb,
  manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.render_artifacts (
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

create index if not exists render_jobs_user_created_idx on public.render_jobs(user_id, created_at desc);
create index if not exists render_jobs_graph_id_idx on public.render_jobs(graph_id);
create index if not exists render_artifacts_job_idx on public.render_artifacts(render_job_id);

alter table public.render_jobs enable row level security;
alter table public.render_artifacts enable row level security;

do $$ begin
  create policy "render_jobs_owner_select" on public.render_jobs for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "render_jobs_owner_insert" on public.render_jobs for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "render_jobs_owner_update" on public.render_jobs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "render_artifacts_owner_select" on public.render_artifacts for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "render_artifacts_owner_insert" on public.render_artifacts for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
