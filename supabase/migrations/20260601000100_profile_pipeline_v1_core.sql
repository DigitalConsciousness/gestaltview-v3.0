-- Source: supabase_schema.zip/supabase/migrations/20260601000100_profile_pipeline_v1_core.sql
-- Canonicalized filename: 20260601000100_profile_pipeline_v1_core.sql

create extension if not exists pgcrypto;

create table if not exists public.capture_events (
  capture_id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  room text not null,
  source_type text not null check (source_type in ('text','voice','audio','image','video','file','import','migration')),
  original_text text not null default '',
  normalized_text text null,
  metadata jsonb not null default '{}'::jsonb,
  consent_state jsonb not null default '{"tier":"private_default"}'::jsonb,
  preservation_status text not null default 'private' check (preservation_status in ('private','released','dormant','deleted_by_user')),
  explicit_delete_requested_by uuid null references auth.users(id),
  explicit_delete_requested_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scaffold_nodes (
  node_id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  review_state text not null default 'pending' check (review_state in ('pending','approved','denied','dormant','released')),
  source_capture_ids uuid[] not null default '{}'::uuid[],
  source_artifact_ids uuid[] not null default '{}'::uuid[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artifacts (
  artifact_id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  artifact_type text not null default 'markdown',
  source_capture_ids uuid[] not null default '{}'::uuid[],
  source_scaffold_node_ids uuid[] not null default '{}'::uuid[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.identity_claims (
  claim_id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  subject_type text not null default 'user',
  subject_id text null,
  claim_text text not null,
  review_state text not null default 'proposed' check (review_state in ('proposed','approved','rejected')),
  evidence_artifact_ids uuid[] not null default '{}'::uuid[],
  evidence_scaffold_node_ids uuid[] not null default '{}'::uuid[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint identity_claims_approval_requires_evidence check (
    review_state <> 'approved'
    or cardinality(evidence_artifact_ids) > 0
    or cardinality(evidence_scaffold_node_ids) > 0
  )
);

create table if not exists public.profile_pipeline_runs (
  run_id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  run_type text not null check (run_type in ('ingestion','synthesis','claim_promotion','embodiment_compile','migration')),
  status text not null default 'pending' check (status in ('pending','running','complete','failed','cancelled')),
  input_summary jsonb not null default '{}'::jsonb,
  output_summary jsonb not null default '{}'::jsonb,
  error_message text null,
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_pipeline_run_links (
  link_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.profile_pipeline_runs(run_id) on delete cascade,
  object_type text not null,
  object_id text not null,
  link_role text not null default 'source',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.provenance_envelopes (
  envelope_id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id text not null,
  content_hash text not null,
  canonicalization_method text not null default 'stable-json-v1',
  source_capture_ids uuid[] not null default '{}'::uuid[],
  source_artifact_ids uuid[] not null default '{}'::uuid[],
  source_scaffold_node_ids uuid[] not null default '{}'::uuid[],
  pipeline_run_id uuid null references public.profile_pipeline_runs(run_id) on delete set null,
  operations text[] not null default '{}'::text[],
  privacy_class text not null default 'private' check (privacy_class in ('private','shared','enterprise','public')),
  consent_state jsonb not null default '{"tier":"private_default"}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.provenance_links (
  link_id uuid primary key default gen_random_uuid(),
  envelope_id uuid not null references public.provenance_envelopes(envelope_id) on delete cascade,
  related_subject_type text not null,
  related_subject_id text not null,
  relationship text not null,
  created_at timestamptz not null default now()
);

alter table if exists public.capture_events
  add column if not exists room text not null default '',
  add column if not exists source_type text not null default 'text',
  add column if not exists original_text text not null default '',
  add column if not exists normalized_text text null,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists consent_state jsonb not null default '{"tier":"private_default"}'::jsonb,
  add column if not exists preservation_status text not null default 'private',
  add column if not exists explicit_delete_requested_by uuid null references auth.users(id),
  add column if not exists explicit_delete_requested_at timestamptz null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists user_id uuid null references auth.users(id) on delete cascade;

alter table if exists public.scaffold_nodes
  add column if not exists title text not null default '',
  add column if not exists body text not null default '',
  add column if not exists review_state text not null default 'pending',
  add column if not exists source_capture_ids uuid[] not null default '{}'::uuid[],
  add column if not exists source_artifact_ids uuid[] not null default '{}'::uuid[],
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists user_id uuid null references auth.users(id) on delete cascade;

alter table if exists public.artifacts
  add column if not exists user_id uuid null references auth.users(id) on delete cascade;

alter table if exists public.identity_claims
  add column if not exists subject_type text not null default 'user',
  add column if not exists subject_id text null,
  add column if not exists claim_text text not null default '',
  add column if not exists review_state text not null default 'proposed',
  add column if not exists evidence_artifact_ids uuid[] not null default '{}'::uuid[],
  add column if not exists evidence_scaffold_node_ids uuid[] not null default '{}'::uuid[],
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists user_id uuid null references auth.users(id) on delete cascade;

alter table if exists public.profile_pipeline_runs
  add column if not exists run_type text not null default 'ingestion',
  add column if not exists status text not null default 'pending',
  add column if not exists input_summary jsonb not null default '{}'::jsonb,
  add column if not exists output_summary jsonb not null default '{}'::jsonb,
  add column if not exists error_message text null,
  add column if not exists started_at timestamptz null,
  add column if not exists completed_at timestamptz null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists user_id uuid null references auth.users(id) on delete cascade;

alter table if exists public.profile_pipeline_run_links
  add column if not exists run_id uuid not null references public.profile_pipeline_runs(run_id) on delete cascade,
  add column if not exists object_type text not null default 'source',
  add column if not exists object_id text not null default '',
  add column if not exists link_role text not null default 'source',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.provenance_envelopes
  add column if not exists envelope_id uuid not null default gen_random_uuid();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'provenance_envelopes_envelope_id_key'
  ) then
    alter table public.provenance_envelopes
      add constraint provenance_envelopes_envelope_id_key unique (envelope_id);
  end if;
end
$$;

alter table if exists public.provenance_links
  add column if not exists envelope_id uuid null,
  add column if not exists related_subject_type text not null default '',
  add column if not exists related_subject_id text not null default '',
  add column if not exists relationship text not null default '',
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'provenance_links_envelope_id_fkey'
  ) then
    alter table public.provenance_links
      add constraint provenance_links_envelope_id_fkey
      foreign key (envelope_id) references public.provenance_envelopes(envelope_id) on delete cascade;
  end if;
end
$$;

create index if not exists capture_events_user_created_idx on public.capture_events(user_id, created_at desc);
create index if not exists capture_events_room_created_idx on public.capture_events(room, created_at desc);
create index if not exists scaffold_nodes_user_review_idx on public.scaffold_nodes(user_id, review_state, created_at desc);
create index if not exists artifacts_user_created_idx on public.artifacts(user_id, created_at desc);
create index if not exists identity_claims_user_review_idx on public.identity_claims(user_id, review_state, created_at desc);
create index if not exists profile_pipeline_runs_user_created_idx on public.profile_pipeline_runs(user_id, created_at desc);
create index if not exists profile_pipeline_run_links_run_idx on public.profile_pipeline_run_links(run_id, object_type);
create index if not exists provenance_envelopes_subject_idx on public.provenance_envelopes(subject_type, subject_id);
create index if not exists provenance_links_envelope_idx on public.provenance_links(envelope_id);

create or replace function public.gv_profile_pipeline_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.gv_capture_events_guard()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.original_text is distinct from old.original_text then
    raise exception 'capture_events.original_text is immutable';
  end if;

  if tg_op = 'UPDATE'
     and new.preservation_status = 'deleted_by_user'
     and old.preservation_status is distinct from 'deleted_by_user'
     and new.explicit_delete_requested_by is null then
    raise exception 'deleted_by_user requires explicit user action';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_capture_events_guard on public.capture_events;
create trigger trg_capture_events_guard
before update on public.capture_events
for each row execute function public.gv_capture_events_guard();

drop trigger if exists trg_capture_events_touch on public.capture_events;
create trigger trg_capture_events_touch before update on public.capture_events
for each row execute function public.gv_profile_pipeline_touch_updated_at();

drop trigger if exists trg_scaffold_nodes_touch on public.scaffold_nodes;
create trigger trg_scaffold_nodes_touch before update on public.scaffold_nodes
for each row execute function public.gv_profile_pipeline_touch_updated_at();

drop trigger if exists trg_artifacts_touch on public.artifacts;
create trigger trg_artifacts_touch before update on public.artifacts
for each row execute function public.gv_profile_pipeline_touch_updated_at();

drop trigger if exists trg_identity_claims_touch on public.identity_claims;
create trigger trg_identity_claims_touch before update on public.identity_claims
for each row execute function public.gv_profile_pipeline_touch_updated_at();
