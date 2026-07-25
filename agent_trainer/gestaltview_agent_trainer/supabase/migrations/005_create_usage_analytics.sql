create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.kit_users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create index if not exists usage_events_type_created_idx
  on public.usage_events(event_type, created_at desc)
  where deleted_at is null;

create index if not exists usage_events_user_created_idx
  on public.usage_events(user_id, created_at desc)
  where deleted_at is null;

drop trigger if exists set_usage_events_updated_at on public.usage_events;
create trigger set_usage_events_updated_at
before update on public.usage_events
for each row execute function public.set_updated_at();
