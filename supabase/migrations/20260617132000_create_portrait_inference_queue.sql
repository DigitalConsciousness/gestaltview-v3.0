create table if not exists public.portrait_inference_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  triggered_by text not null default 'threshold'
    check (triggered_by in ('threshold', 'cadence', 'manual')),
  priority integer not null default 5
    check (priority between 1 and 10),
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'failed', 'skipped')),
  queued_at timestamptz not null default now(),
  picked_up_at timestamptz,
  completed_at timestamptz,
  run_id uuid references public.portrait_inference_runs(id) on delete set null
);

create unique index if not exists portrait_inference_queue_one_active_per_user_idx
  on public.portrait_inference_queue (user_id)
  where status in ('queued', 'processing');

create index if not exists portrait_inference_queue_status_idx
  on public.portrait_inference_queue (status, priority desc, queued_at asc);

create index if not exists portrait_inference_queue_user_id_idx
  on public.portrait_inference_queue (user_id);

alter table public.portrait_inference_queue enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_inference_queue'
      and policyname = 'Users can view own portrait queue status'
  ) then
    create policy "Users can view own portrait queue status"
      on public.portrait_inference_queue
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_inference_queue'
      and policyname = 'Service role manages portrait queue'
  ) then
    create policy "Service role manages portrait queue"
      on public.portrait_inference_queue
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;
