-- Phase 8 local package. Production application requires separate approval.
-- Extend the existing Sanctuary stores; do not create another content authority.

alter table public.journals
  add column if not exists source_kind text not null default 'authored',
  add column if not exists source_entity_ref text,
  add column if not exists archived_at timestamptz,
  add column if not exists revision bigint not null default 1,
  add constraint journals_source_kind_check
    check (source_kind in ('authored', 'transcriptory', 'imported', 'conflict_recovery'));

alter table public.scrapbook_items
  add column if not exists source_kind text not null default 'authored',
  add column if not exists source_entity_ref text,
  add column if not exists archived_at timestamptz,
  add column if not exists revision bigint not null default 1,
  add constraint scrapbook_items_source_kind_check
    check (source_kind in ('authored', 'transcriptory', 'imported', 'conflict_recovery'));

create table if not exists public.sanctuary_conflict_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  entity_kind text not null check (entity_kind in ('journal', 'scrapbook_item')),
  source_ref text not null,
  local_payload jsonb not null,
  remote_payload jsonb not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists journals_owner_active_idx
  on public.journals (user_id, updated_at desc) where archived_at is null;
create index if not exists scrapbook_items_owner_active_idx
  on public.scrapbook_items (user_id, updated_at desc) where archived_at is null;
create index if not exists sanctuary_conflicts_owner_open_idx
  on public.sanctuary_conflict_versions (owner_id, created_at desc)
  where resolved_at is null;

alter table public.sanctuary_conflict_versions enable row level security;

create policy "sanctuary_conflicts_select_own"
  on public.sanctuary_conflict_versions
  for select to authenticated
  using ((select auth.uid()) = owner_id);

revoke insert, update, delete on public.sanctuary_conflict_versions
  from anon, authenticated;
grant select on public.sanctuary_conflict_versions to authenticated;
grant select, insert, update, delete on public.sanctuary_conflict_versions
  to service_role;

create or replace function public.bump_sanctuary_revision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.revision = old.revision + 1;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journals_bump_revision on public.journals;
create trigger journals_bump_revision
before update on public.journals
for each row execute function public.bump_sanctuary_revision();

drop trigger if exists scrapbook_items_bump_revision on public.scrapbook_items;
create trigger scrapbook_items_bump_revision
before update on public.scrapbook_items
for each row execute function public.bump_sanctuary_revision();
