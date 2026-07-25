create table if not exists public.memory_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.kit_users(id) on delete cascade,
  session_id text not null,
  key text not null,
  value jsonb not null,
  importance smallint not null default 2,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint memory_entries_importance_check
    check (importance between 1 and 5)
);

create index if not exists memory_entries_user_session_idx
  on public.memory_entries(user_id, session_id, created_at desc)
  where deleted_at is null;

create index if not exists memory_entries_key_idx
  on public.memory_entries(user_id, key)
  where deleted_at is null;

drop trigger if exists set_memory_entries_updated_at on public.memory_entries;
create trigger set_memory_entries_updated_at
before update on public.memory_entries
for each row execute function public.set_updated_at();
