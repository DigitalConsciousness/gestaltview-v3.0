-- Phase 6 local package. Production application requires outside approval.
create table if not exists public.runtime_handoffs (
  handoff_id uuid primary key default gen_random_uuid(),
  contract_version text not null default 'gestaltview.runtime-handoff.v1',
  owner_id uuid not null references auth.users(id),
  source_room text not null,
  source_entity_type text not null,
  source_entity_id text not null,
  source_revision text,
  source_ref text not null,
  destination_room text not null,
  requested_action text not null,
  payload jsonb not null default '{"context":{},"references":[]}'::jsonb,
  selected_embodiments text[] not null default '{}',
  intent text not null,
  state text not null default 'prepared',
  idempotency_key text not null,
  material_fingerprint text not null,
  provenance jsonb not null,
  receipt jsonb,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint runtime_handoffs_contract_check
    check (contract_version = 'gestaltview.runtime-handoff.v1'),
  constraint runtime_handoffs_source_room_check check (source_room in (
    'blackboard','transcriptory','sanctuary','tribunal','creation_corner',
    'artifact_gallery','dynamic_inner_world','external_scaffold','orchestration'
  )),
  constraint runtime_handoffs_destination_room_check check (destination_room in (
    'blackboard','transcriptory','sanctuary','tribunal','creation_corner',
    'artifact_gallery','dynamic_inner_world','external_scaffold','orchestration'
  )),
  constraint runtime_handoffs_intent_check check (intent in (
    'continue','review','synthesize','render','stage','project'
  )),
  constraint runtime_handoffs_state_check check (state in (
    'prepared','offered','accepted','processing','completed',
    'declined','failed','cancelled','expired'
  )),
  constraint runtime_handoffs_owner_idempotency_key
    unique (owner_id, idempotency_key)
);

create table if not exists public.runtime_handoff_events (
  event_id uuid primary key default gen_random_uuid(),
  handoff_id uuid not null references public.runtime_handoffs(handoff_id) on delete cascade,
  owner_id uuid not null references auth.users(id),
  from_state text,
  to_state text not null,
  receipt jsonb,
  occurred_at timestamptz not null default now(),
  constraint runtime_handoff_events_state_check check (to_state in (
    'prepared','offered','accepted','processing','completed',
    'declined','failed','cancelled','expired'
  ))
);

create index runtime_handoffs_owner_state_idx
  on public.runtime_handoffs (owner_id, state, updated_at desc);
create index runtime_handoffs_source_idx
  on public.runtime_handoffs (owner_id, source_room, source_entity_type, source_entity_id);
create index runtime_handoffs_destination_state_idx
  on public.runtime_handoffs (owner_id, destination_room, state, updated_at desc);
create index runtime_handoffs_freshness_idx on public.runtime_handoffs (updated_at desc);
create index runtime_handoff_events_handoff_idx
  on public.runtime_handoff_events (handoff_id, occurred_at);

alter table public.runtime_handoffs enable row level security;
alter table public.runtime_handoff_events enable row level security;

create policy "runtime_handoffs_select_own" on public.runtime_handoffs
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "runtime_handoff_events_select_own" on public.runtime_handoff_events
  for select to authenticated using ((select auth.uid()) = owner_id);

create or replace function public.guard_runtime_handoff_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.owner_id <> new.owner_id then
    raise exception 'runtime handoff owner is immutable';
  end if;
  if old.state in ('accepted','processing','completed','declined','failed','cancelled','expired')
     and row(old.source_room, old.source_entity_type, old.source_entity_id,
             old.source_revision, old.source_ref)
         is distinct from
         row(new.source_room, new.source_entity_type, new.source_entity_id,
             new.source_revision, new.source_ref) then
    raise exception 'runtime handoff source is immutable after acceptance';
  end if;
  if old.state <> new.state and not (
    (old.state = 'prepared' and new.state in ('offered','cancelled','expired')) or
    (old.state = 'offered' and new.state in ('accepted','declined','cancelled','expired')) or
    (old.state = 'accepted' and new.state in ('processing','cancelled','expired')) or
    (old.state = 'processing' and new.state in ('completed','failed','cancelled','expired'))
  ) then
    raise exception 'invalid runtime handoff transition: % -> %', old.state, new.state;
  end if;
  if new.state = 'accepted' and old.state <> 'accepted' then
    new.accepted_at = now();
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger runtime_handoffs_guard
before update on public.runtime_handoffs
for each row execute function public.guard_runtime_handoff_transition();

create or replace function public.audit_runtime_handoff_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.state <> new.state then
    insert into public.runtime_handoff_events
      (handoff_id, owner_id, from_state, to_state, receipt)
    values
      (new.handoff_id, new.owner_id,
       case when tg_op = 'INSERT' then null else old.state end,
       new.state, new.receipt);
  end if;
  return new;
end;
$$;

create trigger runtime_handoffs_audit
after insert or update on public.runtime_handoffs
for each row execute function public.audit_runtime_handoff_transition();

-- Lifecycle writes are server-mediated so clients cannot forge transition
-- evidence. The service role bypasses RLS; every API query still filters owner_id.
grant select on public.runtime_handoffs to authenticated;
grant select on public.runtime_handoff_events to authenticated;
