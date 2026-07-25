create extension if not exists pgcrypto;

create table if not exists public.resonance_events (
  event_id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_type text not null check (actor_type in ('user','billy','system','trainer','migration')),
  owner_user_id uuid null references auth.users(id) on delete cascade,
  subject_type text not null,
  subject_id text not null,
  room text null,
  pipeline_run_id uuid null references public.profile_pipeline_runs(run_id) on delete set null,
  consent_state jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resonance_events_owner_created_idx on public.resonance_events(owner_user_id, created_at desc);
create index if not exists resonance_events_type_created_idx on public.resonance_events(event_type, created_at desc);
create index if not exists resonance_events_subject_idx on public.resonance_events(subject_type, subject_id);

alter table if exists public.resonance_events enable row level security;

drop policy if exists "Users read their own resonance events" on public.resonance_events;
create policy "Users read their own resonance events"
on public.resonance_events for select
using (owner_user_id = auth.uid());

drop policy if exists "Service role manages resonance events" on public.resonance_events;
create policy "Service role manages resonance events"
on public.resonance_events for all to service_role
using (true) with check (true);

create or replace function public.gv_emit_resonance_event(
  p_event_type text,
  p_actor_type text,
  p_owner_user_id uuid,
  p_subject_type text,
  p_subject_id text,
  p_room text default null,
  p_pipeline_run_id uuid default null,
  p_consent_state jsonb default '{}'::jsonb,
  p_provenance jsonb default '{}'::jsonb,
  p_payload jsonb default '{}'::jsonb
) returns public.resonance_events
language plpgsql
security definer
set search_path = public
as $$
declare inserted public.resonance_events;
begin
  insert into public.resonance_events (
    event_type,
    actor_type,
    owner_user_id,
    subject_type,
    subject_id,
    room,
    pipeline_run_id,
    consent_state,
    provenance,
    payload
  )
  values (
    p_event_type,
    p_actor_type,
    p_owner_user_id,
    p_subject_type,
    p_subject_id,
    p_room,
    p_pipeline_run_id,
    p_consent_state,
    p_provenance,
    p_payload
  )
  returning * into inserted;
  return inserted;
end;
$$;
