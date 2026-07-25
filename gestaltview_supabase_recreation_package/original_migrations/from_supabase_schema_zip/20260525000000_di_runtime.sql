create extension if not exists pgcrypto;

create table if not exists di_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  di_slug text not null,
  session_thread text,
  mode_preference text not null default 'synthesis',
  relational_depth double precision not null default 0,
  quirk_activations jsonb not null default '{}'::jsonb,
  last_session_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, di_slug)
);

create index if not exists di_sessions_di_slug_last_session_idx
  on di_sessions (di_slug, last_session_at desc);

alter table di_sessions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'di_sessions'
      and policyname = 'di_sessions_user_own'
  ) then
    create policy "di_sessions_user_own"
      on di_sessions
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create table if not exists di_memory_events (
  id uuid primary key default gen_random_uuid(),
  di_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid null references di_sessions(id) on delete set null,
  domain text not null,
  content text not null,
  memory_type text not null,
  significance double precision not null default 0.5,
  retrieval_weight double precision not null default 0.5,
  source text not null default 'session',
  created_at timestamptz not null default now()
);

create index if not exists di_memory_events_di_slug_created_at_idx
  on di_memory_events (di_slug, created_at desc);

alter table di_memory_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'di_memory_events'
      and policyname = 'di_memory_user_read'
  ) then
    create policy "di_memory_user_read"
      on di_memory_events
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'di_memory_events'
      and policyname = 'di_memory_service_write'
  ) then
    create policy "di_memory_service_write"
      on di_memory_events
      for insert
      with check (auth.role() = 'service_role');
  end if;
end $$;
