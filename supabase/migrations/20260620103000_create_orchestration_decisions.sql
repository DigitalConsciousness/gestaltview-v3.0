create extension if not exists pgcrypto;

create table if not exists public.orchestration_decisions (
  id uuid primary key default gen_random_uuid(),
  decision_id text not null unique,
  triggered_at timestamptz not null default now(),
  user_id text,
  trigger text not null,
  source_room text not null,
  detected_state text not null,
  support_level text not null,
  content_kind text not null,
  destination text not null,
  artifact_target_type text,
  artifact_destination text,
  synthesis_style text not null,
  processors text[] not null default '{}'::text[],
  export_formats text[] not null default '{}'::text[],
  next_action text not null,
  should_forge_artifact boolean not null default false,
  should_persist_signal boolean not null default false,
  should_update_profile boolean not null default false,
  should_update_scaffold boolean not null default false,
  confidence double precision not null default 0,
  user_facing_summary text not null,
  markers text[] not null default '{}'::text[],
  context_clues text[] not null default '{}'::text[],
  has_image boolean not null default false,
  has_audio boolean not null default false,
  has_video boolean not null default false,
  has_file boolean not null default false,
  input_payload jsonb not null default '{}'::jsonb,
  decision_payload jsonb not null default '{}'::jsonb,
  internal_diagnostics text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create index if not exists orchestration_decisions_triggered_at_idx
  on public.orchestration_decisions (triggered_at desc);

create index if not exists orchestration_decisions_user_id_triggered_at_idx
  on public.orchestration_decisions (user_id, triggered_at desc);

create index if not exists orchestration_decisions_trigger_idx
  on public.orchestration_decisions (trigger);

create index if not exists orchestration_decisions_destination_idx
  on public.orchestration_decisions (destination);

alter table public.orchestration_decisions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orchestration_decisions'
      and policyname = 'Service role full access orchestration decisions'
  ) then
    create policy "Service role full access orchestration decisions"
      on public.orchestration_decisions
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;
