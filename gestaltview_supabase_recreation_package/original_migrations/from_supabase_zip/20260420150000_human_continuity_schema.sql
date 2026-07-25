-- GestaltView v2 -- Human continuity repair script
-- Post-state repair/backfill for the current schema snapshot in
-- FULL_PUBLIC_SCHEMA_4_29_26.sql.
-- Keeps the human/cognition/consciousness/personality layer aligned without
-- re-declaring tables that already exist in the live schema.

create extension if not exists pgcrypto;
create extension if not exists vector;
create extension if not exists pg_trgm with schema extensions;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.try_cast_uuid(input_text text)
returns uuid
language sql
immutable
as $$
  select case
    when input_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then input_text::uuid
    else null
  end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'mutation_class') then
    create type public.mutation_class as enum ('IMMUTABLE', 'REVIEW_GATED', 'EVIDENCE_PROMOTABLE', 'EPHEMERAL');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('NOT_REQUIRED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');
  end if;

  if not exists (select 1 from pg_type where typname = 'archive_policy') then
    create type public.archive_policy as enum ('retain', 'archive', 'redact', 'delete');
  end if;

  if not exists (select 1 from pg_type where typname = 'identity_mutation_type') then
    create type public.identity_mutation_type as enum (
      'constitution_patch',
      'autobiography_patch',
      'memory_append',
      'memory_patch',
      'memory_archive',
      'preference_upsert',
      'relationship_upsert',
      'presentation_patch',
      'governance_patch',
      'skill_update',
      'collaborative_memory_append',
      'rollback'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'identity_mutation_status') then
    create type public.identity_mutation_status as enum (
      'proposed',
      'approved',
      'rejected',
      'applied',
      'rolled_back'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'identity_mutation_risk_level') then
    create type public.identity_mutation_risk_level as enum ('low', 'medium', 'high');
  end if;

  if not exists (select 1 from pg_type where typname = 'identity_review_decision') then
    create type public.identity_review_decision as enum ('approved', 'rejected', 'needs_changes');
  end if;

  if not exists (select 1 from pg_type where typname = 'identity_subject_kind') then
    create type public.identity_subject_kind as enum (
      'human',
      'agent',
      'group',
      'workspace',
      'session',
      'artifact',
      'system'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'context_packet_kind') then
    create type public.context_packet_kind as enum (
      'bootstrap',
      'session',
      'reflection',
      'handoff',
      'review',
      'export'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'context_surface_kind') then
    create type public.context_surface_kind as enum (
      'prompt',
      'system',
      'memory',
      'profile',
      'relationship',
      'artifact',
      'view'
    );
  end if;
end
$$;

alter table public.app_users
  add column if not exists auth_user_id uuid,
  add column if not exists subject_id uuid,
  add column if not exists display_name text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.founder_context
  add column if not exists subject_id uuid,
  add column if not exists continuity_profile jsonb not null default '{}'::jsonb,
  add column if not exists cognition_profile jsonb not null default '{}'::jsonb,
  add column if not exists personality_profile jsonb not null default '{}'::jsonb,
  add column if not exists memory_profile jsonb not null default '{}'::jsonb,
  add column if not exists identity_profile jsonb not null default '{}'::jsonb,
  add column if not exists context_manifest jsonb not null default '{}'::jsonb,
  add column if not exists consent_policy jsonb not null default '{}'::jsonb;

alter table public.consciousness_profiles
  add column if not exists subject_id uuid,
  add column if not exists auth_user_id uuid,
  add column if not exists snapshot jsonb not null default '{}'::jsonb,
  add column if not exists source_manifest jsonb not null default '{}'::jsonb,
  add column if not exists confidence numeric(5,4) not null default 0.75;

alter table public.memory_entries
  add column if not exists subject_id uuid,
  add column if not exists auth_user_id uuid,
  add column if not exists source_kind text not null default 'manual',
  add column if not exists entry_state text not null default 'active' check (entry_state in ('active', 'review_required', 'archived')),
  add column if not exists emotional_valence numeric(5,4),
  add column if not exists consent_required boolean not null default true,
  add column if not exists source_asset_id uuid,
  add column if not exists provenance jsonb not null default '{}'::jsonb;

alter table public.human_identity_review_events
  add column if not exists subject_id uuid,
  add column if not exists auth_user_id uuid;

alter table public.human_identity_rollback_events
  add column if not exists subject_id uuid,
  add column if not exists auth_user_id uuid;

do $$
begin
  insert into public.identity_subjects (
    subject_kind,
    auth_user_id,
    display_name,
    canonical_name,
    description,
    metadata
  )
  select
    'human',
    u.id,
    coalesce(u.email, u.id::text),
    coalesce(u.email, u.id::text),
    'Backfilled from public.users',
    jsonb_build_object('source', 'public.users')
  from public.users u
  on conflict do nothing;

  insert into public.identity_subjects (
    subject_kind,
    auth_user_id,
    display_name,
    canonical_name,
    description,
    metadata
  )
  select
    'human',
    public.try_cast_uuid(a.id),
    coalesce(u.email, a.id),
    coalesce(u.email, a.id),
    'Backfilled from public.app_users',
    jsonb_build_object('source', 'public.app_users')
  from public.app_users a
  left join public.users u
    on u.id::text = a.id
  where public.try_cast_uuid(a.id) is not null
  on conflict do nothing;

  insert into public.identity_subjects (
    subject_kind,
    agent_id,
    display_name,
    canonical_name,
    description,
    metadata
  )
  select
    'agent',
    ag.agent_id,
    coalesce(ag.public_name, ag.title, ag.slug),
    coalesce(ag.public_name, ag.title, ag.slug),
    coalesce(ag.domain, ''),
    jsonb_build_object('source', 'public.agents')
  from public.agents ag
  on conflict do nothing;

  update public.app_users au
  set
    auth_user_id = coalesce(au.auth_user_id, public.try_cast_uuid(au.id)),
    display_name = coalesce(au.display_name, u.email, au.id),
    subject_id = coalesce(au.subject_id, s.subject_id)
  from public.users u
  join public.identity_subjects s
    on s.auth_user_id = u.id
  where u.id::text = au.id
    and (au.auth_user_id is null or au.display_name is null or au.subject_id is null);

  update public.identity_subjects s
  set app_user_id = au.id
  from public.app_users au
  where s.auth_user_id = public.try_cast_uuid(au.id)
    and s.app_user_id is null;

  update public.founder_context fc
  set subject_id = coalesce(fc.subject_id, s.subject_id)
  from public.identity_subjects s
  where s.auth_user_id = fc.user_id
    and fc.subject_id is null;

  update public.consciousness_profiles cp
  set
    auth_user_id = coalesce(cp.auth_user_id, public.try_cast_uuid(cp.user_id)),
    subject_id = coalesce(cp.subject_id, s.subject_id),
    snapshot = case
      when coalesce(cp.snapshot, '{}'::jsonb) = '{}'::jsonb then coalesce(cp.profile, '{}'::jsonb)
      else cp.snapshot
    end
  from public.identity_subjects s
  where s.auth_user_id = public.try_cast_uuid(cp.user_id)
    and (cp.auth_user_id is null or cp.subject_id is null);

  update public.memory_entries me
  set
    auth_user_id = coalesce(me.auth_user_id, public.try_cast_uuid(me.user_id)),
    subject_id = coalesce(me.subject_id, s.subject_id)
  from public.identity_subjects s
  where s.auth_user_id = public.try_cast_uuid(me.user_id)
    and (me.auth_user_id is null or me.subject_id is null);

  update public.human_identity_review_events rev
  set
    subject_id = coalesce(rev.subject_id, mut.subject_id),
    auth_user_id = coalesce(rev.auth_user_id, mut.auth_user_id)
  from public.human_identity_mutations mut
  where rev.mutation_id = mut.mutation_id
    and (rev.subject_id is null or rev.auth_user_id is null);

  update public.human_identity_rollback_events rb
  set
    subject_id = coalesce(rb.subject_id, mut.subject_id),
    auth_user_id = coalesce(rb.auth_user_id, mut.auth_user_id)
  from public.human_identity_mutations mut
  where rb.mutation_id = mut.mutation_id
    and (rb.subject_id is null or rb.auth_user_id is null);
end
$$;

create index if not exists identity_subjects_kind_updated_idx
  on public.identity_subjects (subject_kind, updated_at desc);

create index if not exists identity_subjects_auth_user_idx
  on public.identity_subjects (auth_user_id);

create index if not exists identity_subjects_app_user_idx
  on public.identity_subjects (app_user_id);

create index if not exists identity_subjects_agent_idx
  on public.identity_subjects (agent_id);

create index if not exists human_memory_records_subject_created_idx
  on public.human_memory_records (subject_id, created_at desc);

create index if not exists human_memory_records_auth_user_idx
  on public.human_memory_records (auth_user_id, created_at desc);

create index if not exists human_memory_records_kind_idx
  on public.human_memory_records (memory_kind);

create index if not exists human_memory_records_tags_idx
  on public.human_memory_records using gin (tags);

create index if not exists human_memory_records_embedding_idx
  on public.human_memory_records
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists human_memory_records_content_fts_idx
  on public.human_memory_records
  using gin (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(detail, '')
    )
  );

create index if not exists human_identity_evidence_subject_idx
  on public.human_identity_evidence (subject_id, created_at desc);

create index if not exists human_identity_evidence_auth_user_idx
  on public.human_identity_evidence (auth_user_id, created_at desc);

create index if not exists human_identity_mutations_subject_idx
  on public.human_identity_mutations (subject_id, created_at desc);

create index if not exists human_identity_mutations_status_idx
  on public.human_identity_mutations (status, created_at desc);

create index if not exists context_injection_rules_subject_idx
  on public.context_injection_rules (subject_id, surface, precedence desc);

create index if not exists context_injection_packets_subject_idx
  on public.context_injection_packets (subject_id, created_at desc);

create index if not exists context_injection_packets_kind_idx
  on public.context_injection_packets (packet_kind, surface);

create index if not exists human_context_views_subject_idx
  on public.human_context_views (subject_id, scope, updated_at desc);

alter table public.identity_subjects enable row level security;
alter table public.human_identity_profiles enable row level security;
alter table public.human_cognition_profiles enable row level security;
alter table public.human_consciousness_profiles enable row level security;
alter table public.human_personality_profiles enable row level security;
alter table public.human_context_views enable row level security;
alter table public.human_continuity_snapshots enable row level security;
alter table public.human_memory_records enable row level security;
alter table public.human_relationship_edges enable row level security;
alter table public.human_identity_evidence enable row level security;
alter table public.human_identity_mutations enable row level security;
alter table public.human_identity_review_events enable row level security;
alter table public.human_identity_rollback_events enable row level security;
alter table public.context_injection_rules enable row level security;
alter table public.context_injection_packets enable row level security;

do $$
declare
  secure_table text;
begin
  foreach secure_table in array array[
    'identity_subjects',
    'human_identity_profiles',
    'human_cognition_profiles',
    'human_consciousness_profiles',
    'human_personality_profiles',
    'human_context_views',
    'human_continuity_snapshots',
    'human_memory_records',
    'human_relationship_edges',
    'human_identity_evidence',
    'human_identity_mutations',
    'human_identity_review_events',
    'human_identity_rollback_events',
    'context_injection_rules',
    'context_injection_packets'
  ] loop
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = secure_table
        and policyname = 'service_role full access ' || secure_table
    ) then
      execute format(
        'create policy "service_role full access %I" on public.%I for all to service_role using (true) with check (true)',
        secure_table,
        secure_table
      );
    end if;
  end loop;
end
$$;

do $$
declare
  managed_table text;
begin
  foreach managed_table in array array[
    'identity_subjects',
    'human_identity_profiles',
    'human_cognition_profiles',
    'human_consciousness_profiles',
    'human_personality_profiles',
    'human_context_views',
    'human_continuity_snapshots',
    'human_memory_records',
    'human_relationship_edges',
    'human_identity_evidence',
    'human_identity_mutations',
    'human_identity_review_events',
    'human_identity_rollback_events',
    'context_injection_rules',
    'context_injection_packets'
  ] loop
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = managed_table
        and policyname = 'authenticated manage own ' || managed_table
    ) then
      if managed_table = 'identity_subjects' then
        execute format(
          'create policy "authenticated manage own %I" on public.%I for all to authenticated using (auth_user_id = auth.uid() or app_user_id = auth.uid()::text) with check (auth_user_id = auth.uid() or app_user_id = auth.uid()::text)',
          managed_table,
          managed_table
        );
      else
        execute format(
          'create policy "authenticated manage own %I" on public.%I for all to authenticated using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid())',
          managed_table,
          managed_table
        );
      end if;
    end if;
  end loop;
end
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'identity_subjects',
    'human_identity_profiles',
    'human_cognition_profiles',
    'human_consciousness_profiles',
    'human_personality_profiles',
    'human_context_views',
    'human_continuity_snapshots',
    'human_memory_records',
    'human_relationship_edges',
    'human_identity_evidence',
    'human_identity_mutations',
    'human_identity_review_events',
    'human_identity_rollback_events',
    'context_injection_rules',
    'context_injection_packets'
  ] loop
    execute format('drop trigger if exists set_updated_at_%I on public.%I', t, t);
    execute format(
      'create trigger set_updated_at_%I before update on public.%I for each row execute function public.touch_updated_at()',
      t,
      t
    );
  end loop;
end
$$;

notify pgrst, 'reload schema';
