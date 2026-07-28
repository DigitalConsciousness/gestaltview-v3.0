create table if not exists public.portrait_inference_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  triggered_by text not null check (triggered_by in ('cadence', 'threshold', 'manual')),
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed', 'insufficient_data', 'cooldown_blocked')),
  portrait_id uuid references public.profile_portraits(id) on delete set null,
  input_record_count integer not null default 0,
  input_window_start timestamptz,
  input_window_end timestamptz,
  llm_provider_used text,
  llm_model_used text,
  prompt_tokens integer,
  completion_tokens integer,
  validation_passed boolean,
  validation_errors jsonb not null default '{}'::jsonb,
  error_message text,
  duration_ms integer,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class r on r.oid = c.conrelid
    join pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'profile_portraits'
      and c.conname = 'profile_portraits_inference_run_id_fkey'
  ) then
    alter table public.profile_portraits
      add constraint profile_portraits_inference_run_id_fkey
      foreign key (inference_run_id)
      references public.portrait_inference_runs(id)
      on delete cascade;
  end if;
end
$$;

create index if not exists portrait_inference_runs_user_id_idx
  on public.portrait_inference_runs (user_id);

create index if not exists portrait_inference_runs_status_idx
  on public.portrait_inference_runs (status);

create index if not exists portrait_inference_runs_created_at_idx
  on public.portrait_inference_runs (created_at desc);

create index if not exists portrait_inference_runs_portrait_id_idx
  on public.portrait_inference_runs (portrait_id)
  where portrait_id is not null;

alter table public.portrait_inference_runs enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_inference_runs'
      and policyname = 'Users can read own portrait inference runs'
  ) then
    create policy "Users can read own portrait inference runs"
      on public.portrait_inference_runs
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_inference_runs'
      and policyname = 'Users can insert own manual portrait inference runs'
  ) then
    create policy "Users can insert own manual portrait inference runs"
      on public.portrait_inference_runs
      for insert
      with check (auth.uid() = user_id and triggered_by = 'manual');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_inference_runs'
      and policyname = 'Service role manages portrait inference runs'
  ) then
    create policy "Service role manages portrait inference runs"
      on public.portrait_inference_runs
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;
