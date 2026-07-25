create table if not exists public.portrait_render_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portrait_id uuid not null references public.profile_portraits(id) on delete cascade,
  event_type text not null default 'view'
    check (event_type in ('view', 'share', 'export', 'delta_view')),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portrait_render_events_user_id_created_at_idx
  on public.portrait_render_events (user_id, created_at desc);

create index if not exists portrait_render_events_portrait_id_idx
  on public.portrait_render_events (portrait_id);

alter table public.portrait_render_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_render_events'
      and policyname = 'Users can read own portrait render events'
  ) then
    create policy "Users can read own portrait render events"
      on public.portrait_render_events
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_render_events'
      and policyname = 'Users can insert own portrait render events'
  ) then
    create policy "Users can insert own portrait render events"
      on public.portrait_render_events
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_render_events'
      and policyname = 'Service role manages portrait render events'
  ) then
    create policy "Service role manages portrait render events"
      on public.portrait_render_events
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;
