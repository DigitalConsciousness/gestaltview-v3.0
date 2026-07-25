create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'file_room_origin'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.file_room_origin as enum (
      'blackboard',
      'creation_corner',
      'dynamic_inner_world',
      'external_scaffold',
      'unknown'
    );
  end if;
end $$;

create or replace function public.set_inner_world_files_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  mime_type text not null default '',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  storage_path text not null unique,
  room_origin public.file_room_origin not null default 'blackboard',
  tags text[] not null default '{}'::text[],
  preview_text text null,
  preview_html text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_files_user_id_created_at_idx
  on public.user_files (user_id, created_at desc);
create index if not exists user_files_room_origin_idx
  on public.user_files (room_origin, created_at desc);
create index if not exists user_files_mime_type_idx
  on public.user_files (mime_type);

create table if not exists public.inner_world_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text not null default '',
  source_file_id uuid null references public.user_files(id) on delete set null,
  html text not null,
  thumbnail_url text null,
  origin_room public.file_room_origin not null default 'dynamic_inner_world',
  evidence_node_ids text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inner_world_artifacts_user_id_created_at_idx
  on public.inner_world_artifacts (user_id, created_at desc);
create index if not exists inner_world_artifacts_origin_room_idx
  on public.inner_world_artifacts (origin_room, created_at desc);
create index if not exists inner_world_artifacts_source_file_id_idx
  on public.inner_world_artifacts (source_file_id);

drop trigger if exists trg_user_files_set_updated_at on public.user_files;
create trigger trg_user_files_set_updated_at
before update on public.user_files
for each row
execute function public.set_inner_world_files_updated_at();

drop trigger if exists trg_inner_world_artifacts_set_updated_at on public.inner_world_artifacts;
create trigger trg_inner_world_artifacts_set_updated_at
before update on public.inner_world_artifacts
for each row
execute function public.set_inner_world_files_updated_at();

alter table if exists public.user_files enable row level security;
alter table if exists public.inner_world_artifacts enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_files'
      and policyname = 'Users manage their own files'
  ) then
    create policy "Users manage their own files"
      on public.user_files
      for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_files'
      and policyname = 'Service role full access user_files'
  ) then
    create policy "Service role full access user_files"
      on public.user_files
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inner_world_artifacts'
      and policyname = 'Users manage their own inner world artifacts'
  ) then
    create policy "Users manage their own inner world artifacts"
      on public.inner_world_artifacts
      for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inner_world_artifacts'
      and policyname = 'Service role full access inner_world_artifacts'
  ) then
    create policy "Service role full access inner_world_artifacts"
      on public.inner_world_artifacts
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('user-files', 'user-files', false)
    on conflict (id) do nothing;
  end if;
end
$$;
