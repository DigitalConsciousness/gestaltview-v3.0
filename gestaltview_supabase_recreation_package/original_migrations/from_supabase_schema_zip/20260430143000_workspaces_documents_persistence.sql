create extension if not exists pgcrypto;

create or replace function public.set_workspace_persistence_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.workspace_rooms (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  description text null,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member', 'viewer')),
  member_count integer not null default 1 check (member_count >= 0),
  recent_activity text not null default 'Workspace created.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_documents (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  workspace_id uuid null references public.workspace_rooms(id) on delete set null,
  filename text not null,
  file_size_bytes bigint not null default 0 check (file_size_bytes >= 0),
  file_type text not null default '',
  raw_text text null,
  analysis_status text not null default 'completed' check (
    analysis_status in ('pending', 'processing', 'completed', 'failed')
  ),
  analysis_summary text not null default '',
  key_points jsonb not null default '[]'::jsonb,
  topics text[] not null default '{}'::text[],
  sentiment text not null default 'unknown',
  word_count integer not null default 0 check (word_count >= 0),
  reading_time_minutes integer not null default 0 check (reading_time_minutes >= 0),
  analysis_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_rooms_user_id_idx
  on public.workspace_rooms (user_id, created_at desc);
create index if not exists workspace_documents_user_id_idx
  on public.workspace_documents (user_id, created_at desc);
create index if not exists workspace_documents_workspace_id_idx
  on public.workspace_documents (workspace_id, created_at desc);
create index if not exists workspace_documents_status_idx
  on public.workspace_documents (analysis_status);

drop trigger if exists trg_workspace_rooms_set_updated_at on public.workspace_rooms;
create trigger trg_workspace_rooms_set_updated_at
before update on public.workspace_rooms
for each row
execute function public.set_workspace_persistence_updated_at();

drop trigger if exists trg_workspace_documents_set_updated_at on public.workspace_documents;
create trigger trg_workspace_documents_set_updated_at
before update on public.workspace_documents
for each row
execute function public.set_workspace_persistence_updated_at();

alter table if exists public.workspace_rooms enable row level security;
alter table if exists public.workspace_documents enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where tablename = 'workspace_rooms'
      and policyname = 'Service role full access workspace_rooms'
  ) then
    create policy "Service role full access workspace_rooms"
      on public.workspace_rooms
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
    where tablename = 'workspace_documents'
      and policyname = 'Service role full access workspace_documents'
  ) then
    create policy "Service role full access workspace_documents"
      on public.workspace_documents
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;
