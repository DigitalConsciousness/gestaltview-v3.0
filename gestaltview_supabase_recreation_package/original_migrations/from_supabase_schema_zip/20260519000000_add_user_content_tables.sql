create extension if not exists pgcrypto;

create or replace function public.set_user_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journals_user_id_created_at_idx
  on public.journals (user_id, created_at desc);

drop trigger if exists trg_journals_set_updated_at on public.journals;
create trigger trg_journals_set_updated_at
before update on public.journals
for each row
execute function public.set_user_content_updated_at();

create table if not exists public.scrapbook_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_id uuid null references public.user_files(id) on delete set null,
  caption text null,
  created_at timestamptz not null default now()
);

create index if not exists scrapbook_items_user_id_created_at_idx
  on public.scrapbook_items (user_id, created_at desc);
create index if not exists scrapbook_items_file_id_idx
  on public.scrapbook_items (file_id);

create table if not exists public.blueprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'ready', 'exported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blueprints_user_id_created_at_idx
  on public.blueprints (user_id, created_at desc);
create index if not exists blueprints_status_idx
  on public.blueprints (status);

alter table if exists public.inner_world_artifacts
  add column if not exists blueprint_id uuid null,
  add column if not exists status text not null default 'active' check (status in ('active', 'archived'));

create index if not exists inner_world_artifacts_user_id_created_at_idx
  on public.inner_world_artifacts (user_id, created_at desc);
create index if not exists inner_world_artifacts_blueprint_id_idx
  on public.inner_world_artifacts (blueprint_id);
create index if not exists inner_world_artifacts_status_idx
  on public.inner_world_artifacts (status);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inner_world_artifacts_blueprint_id_fkey'
  ) then
    alter table public.inner_world_artifacts
      add constraint inner_world_artifacts_blueprint_id_fkey
      foreign key (blueprint_id)
      references public.blueprints(id)
      on delete set null;
  end if;
end $$;

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('memory', 'connection', 'insight', 'pattern', 'skill', 'emotion')),
  content_ref uuid null,
  significance_score double precision not null default 0.5 check (significance_score >= 0 and significance_score <= 1),
  linked_to uuid[] not null default '{}'::uuid[],
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists insights_user_id_created_at_idx
  on public.insights (user_id, created_at desc);
create index if not exists insights_type_idx
  on public.insights (type);
create index if not exists insights_status_idx
  on public.insights (status);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  room_renames jsonb not null default '{}'::jsonb,
  theme text not null default 'void',
  position_overrides jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_preferences_set_updated_at on public.user_preferences;
create trigger trg_user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute function public.set_user_content_updated_at();

alter table if exists public.journals enable row level security;
alter table if exists public.scrapbook_items enable row level security;
alter table if exists public.blueprints enable row level security;
alter table if exists public.inner_world_artifacts enable row level security;
alter table if exists public.insights enable row level security;
alter table if exists public.user_preferences enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'journals'
      and policyname = 'Users access own journals'
  ) then
    create policy "Users access own journals"
      on public.journals
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'scrapbook_items'
      and policyname = 'Users access own scrapbook'
  ) then
    create policy "Users access own scrapbook"
      on public.scrapbook_items
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'blueprints'
      and policyname = 'Users access own blueprints'
  ) then
    create policy "Users access own blueprints"
      on public.blueprints
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inner_world_artifacts'
      and policyname = 'Users access own artifacts'
  ) then
    create policy "Users access own artifacts"
      on public.inner_world_artifacts
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'insights'
      and policyname = 'Users access own insights'
  ) then
    create policy "Users access own insights"
      on public.insights
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_preferences'
      and policyname = 'Users access own preferences'
  ) then
    create policy "Users access own preferences"
      on public.user_preferences
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
