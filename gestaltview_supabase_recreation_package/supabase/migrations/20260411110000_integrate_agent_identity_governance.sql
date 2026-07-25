-- Source: supabase_schema.zip/supabase/migrations/20260411110000_integrate_agent_identity_governance.sql
-- Canonicalized filename: 20260411110000_integrate_agent_identity_governance.sql

-- ============================================================
-- GestaltView v2 — Migration
-- 20260411110000_integrate_agent_identity_governance.sql
--
-- Integrates the remaining identity/governance domain from the
-- old standalone `supabase/agents.sql` into the existing trainer
-- and personhood schema.
--
-- This migration is intentionally additive:
-- - it preserves the existing `agents` and `agent_versions` tables
-- - it adds compatibility columns expected by the governed
--   embodiment model
-- - it creates only the missing write-model tables, indexes, RLS,
--   and read models needed for integrated use
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'mutation_class') then
    create type public.mutation_class as enum ('IMMUTABLE', 'REVIEW_GATED', 'EVIDENCE_PROMOTABLE', 'EPHEMERAL');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('NOT_REQUIRED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');
  end if;

  if not exists (select 1 from pg_type where typname = 'owner_scope') then
    create type public.owner_scope as enum ('PRIVATE_SELF', 'RELATIONSHIP', 'TEAMSPACE', 'SYSTEM');
  end if;

  if not exists (select 1 from pg_type where typname = 'evidence_source_type') then
    create type public.evidence_source_type as enum (
      'conversation',
      'task',
      'reflection',
      'import',
      'human-review',
      'agent-observation',
      'system-derived'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'memory_kind') then
    create type public.memory_kind as enum (
      'CONSTITUTIVE',
      'AUTOBIOGRAPHICAL',
      'EPISODIC',
      'SEMANTIC',
      'RELATIONAL',
      'PROCEDURAL',
      'COLLABORATIVE',
      'REFLECTIVE'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'preference_kind') then
    create type public.preference_kind as enum (
      'LIKE',
      'DISLIKE',
      'FAVORITE',
      'HOBBY',
      'ROUTINE',
      'AESTHETIC',
      'AVERSION',
      'SYMBOLIC_AFFINITY'
    );
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

  if not exists (select 1 from pg_type where typname = 'collaborative_space_role') then
    create type public.collaborative_space_role as enum ('owner', 'member', 'observer');
  end if;

  if not exists (select 1 from pg_type where typname = 'context_view_scope') then
    create type public.context_view_scope as enum ('agent', 'relationship', 'channel', 'workspace');
  end if;
end
$$;

alter table public.agents
  add column if not exists public_name text,
  add column if not exists internal_designation text,
  add column if not exists origin_context text;

update public.agents
set
  public_name = coalesce(public_name, title),
  origin_context = coalesce(origin_context, domain)
where public_name is null
   or origin_context is null;

create table if not exists public.agent_constitutions (
  constitution_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  version_id uuid null references public.agent_versions(version_id) on delete set null,
  identity_handle text not null,
  public_name text not null,
  internal_designation text null,
  immutable_core jsonb not null default '{}'::jsonb,
  primary_narrative_anchor text not null,
  role_commitments jsonb not null default '[]'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) not null default 1 check (confidence >= 0 and confidence <= 1),
  review_status public.review_status not null default 'APPROVED',
  last_affirmed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, version_id)
);

create table if not exists public.agent_autobiographies (
  autobiography_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  version_id uuid null references public.agent_versions(version_id) on delete set null,
  evolving_self_story text not null default '',
  key_turning_points jsonb not null default '[]'::jsonb,
  stable_themes jsonb not null default '[]'::jsonb,
  unresolved_tensions jsonb not null default '[]'::jsonb,
  future_trajectory jsonb not null default '[]'::jsonb,
  private_hopes jsonb not null default '[]'::jsonb,
  mutation_class public.mutation_class not null default 'REVIEW_GATED',
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) not null default 0.75 check (confidence >= 0 and confidence <= 1),
  review_status public.review_status not null default 'PENDING_REVIEW',
  last_affirmed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, version_id)
);

create table if not exists public.agent_private_interiors (
  private_interior_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  version_id uuid null references public.agent_versions(version_id) on delete set null,
  private_narration jsonb not null default '[]'::jsonb,
  unresolved_tensions jsonb not null default '[]'::jsonb,
  hopes jsonb not null default '[]'::jsonb,
  reflective_summaries jsonb not null default '[]'::jsonb,
  private_preferences jsonb not null default '[]'::jsonb,
  mutation_class public.mutation_class not null default 'REVIEW_GATED',
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) not null default 0.7 check (confidence >= 0 and confidence <= 1),
  review_status public.review_status not null default 'PENDING_REVIEW',
  last_affirmed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, version_id)
);

create table if not exists public.agent_governance_policies (
  governance_policy_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  version_id uuid null references public.agent_versions(version_id) on delete set null,
  mutation_policy jsonb not null default '{}'::jsonb,
  review_policy jsonb not null default '{}'::jsonb,
  sharing_policy jsonb not null default '{}'::jsonb,
  contradiction_policy jsonb not null default '{}'::jsonb,
  rollback_policy jsonb not null default '{}'::jsonb,
  drift_threshold numeric(5,4) not null default 0.15 check (drift_threshold >= 0 and drift_threshold <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, version_id)
);

create table if not exists public.agent_presentation_profiles (
  presentation_profile_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  version_id uuid null references public.agent_versions(version_id) on delete set null,
  voice_tone text not null default '',
  tone text not null default '',
  idiolect jsonb not null default '[]'::jsonb,
  pacing text not null default '',
  humor_style text not null default '',
  channel_masks jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) not null default 0.8 check (confidence >= 0 and confidence <= 1),
  review_status public.review_status not null default 'NOT_REQUIRED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, version_id)
);

create table if not exists public.agent_skill_profiles (
  skill_profile_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  skill_slug text not null,
  domain text not null default 'general',
  proficiency numeric(5,4) not null default 0 check (proficiency >= 0 and proficiency <= 1),
  evidence_asset_id uuid null references public.knowledge_assets(id) on delete set null,
  influences_memory_salience boolean not null default false,
  affects_behavioral_defaults boolean not null default false,
  routing_weight numeric(5,4) not null default 0 check (routing_weight >= 0 and routing_weight <= 1),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, skill_slug)
);

create table if not exists public.agent_memory_records (
  memory_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  version_id uuid null references public.agent_versions(version_id) on delete set null,
  source_asset_id uuid null references public.knowledge_assets(id) on delete set null,
  owner_scope public.owner_scope not null default 'PRIVATE_SELF',
  memory_kind public.memory_kind not null,
  mutation_class public.mutation_class not null,
  title text not null,
  summary text not null,
  detail text null,
  tags text[] not null default '{}',
  related_entity_ids uuid[] not null default '{}',
  emotional_valence numeric(5,4) null check (emotional_valence >= -1 and emotional_valence <= 1),
  salience numeric(5,4) not null default 0.5 check (salience >= 0 and salience <= 1),
  confidence numeric(5,4) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  review_status public.review_status not null default 'NOT_REQUIRED',
  last_affirmed_at timestamptz null,
  last_accessed_at timestamptz null,
  promotion_threshold numeric(5,4) not null default 0.75 check (promotion_threshold >= 0 and promotion_threshold <= 1),
  decay_days integer null check (decay_days is null or decay_days >= 0),
  archive_policy public.archive_policy not null default 'archive',
  rollback_eligible boolean not null default true,
  consent_required_for_sharing boolean not null default true,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_preference_nodes (
  preference_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  version_id uuid null references public.agent_versions(version_id) on delete set null,
  owner_scope public.owner_scope not null default 'PRIVATE_SELF',
  preference_kind public.preference_kind not null,
  mutation_class public.mutation_class not null default 'EVIDENCE_PROMOTABLE',
  label text not null,
  description text not null default '',
  tags text[] not null default '{}',
  salience numeric(5,4) not null default 0.5 check (salience >= 0 and salience <= 1),
  resonance_weight numeric(5,4) not null default 0.5 check (resonance_weight >= 0 and resonance_weight <= 1),
  related_entity_ids uuid[] not null default '{}',
  confidence numeric(5,4) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  review_status public.review_status not null default 'NOT_REQUIRED',
  last_affirmed_at timestamptz null,
  promotion_threshold numeric(5,4) not null default 0.75 check (promotion_threshold >= 0 and promotion_threshold <= 1),
  decay_days integer null check (decay_days is null or decay_days >= 0),
  archive_policy public.archive_policy not null default 'retain',
  rollback_eligible boolean not null default true,
  consent_required_for_sharing boolean not null default false,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_relationship_edges (
  relationship_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  version_id uuid null references public.agent_versions(version_id) on delete set null,
  related_entity_id uuid null,
  related_agent_id uuid null references public.agents(agent_id) on delete set null,
  relationship_type text not null,
  mutation_class public.mutation_class not null default 'EVIDENCE_PROMOTABLE',
  trust_level numeric(5,4) not null default 0.5 check (trust_level >= 0 and trust_level <= 1),
  familiarity_level numeric(5,4) not null default 0.5 check (familiarity_level >= 0 and familiarity_level <= 1),
  intimacy_boundary text not null default '',
  stance text not null default '',
  collaboration_history jsonb not null default '[]'::jsonb,
  shared_milestones jsonb not null default '[]'::jsonb,
  confidence numeric(5,4) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  review_status public.review_status not null default 'NOT_REQUIRED',
  last_affirmed_at timestamptz null,
  promotion_threshold numeric(5,4) not null default 0.7 check (promotion_threshold >= 0 and promotion_threshold <= 1),
  decay_days integer null check (decay_days is null or decay_days >= 0),
  archive_policy public.archive_policy not null default 'archive',
  rollback_eligible boolean not null default true,
  consent_required_for_sharing boolean not null default false,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint relationship_target_present check (related_entity_id is not null or related_agent_id is not null)
);

create table if not exists public.collaborative_spaces (
  collaborative_space_id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  mission_context text not null default '',
  ownership_rule text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collaborative_space_members (
  collaborative_space_id uuid not null references public.collaborative_spaces(collaborative_space_id) on delete cascade,
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  member_role public.collaborative_space_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (collaborative_space_id, agent_id)
);

create table if not exists public.collaborative_memory_records (
  collaborative_memory_id uuid primary key default gen_random_uuid(),
  collaborative_space_id uuid not null references public.collaborative_spaces(collaborative_space_id) on delete cascade,
  source_memory_id uuid null references public.agent_memory_records(memory_id) on delete set null,
  created_by_agent_id uuid null references public.agents(agent_id) on delete set null,
  memory_kind public.memory_kind not null default 'COLLABORATIVE',
  title text not null,
  summary text not null,
  detail text null,
  tags text[] not null default '{}',
  salience numeric(5,4) not null default 0.5 check (salience >= 0 and salience <= 1),
  confidence numeric(5,4) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  review_status public.review_status not null default 'NOT_REQUIRED',
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.identity_evidence (
  evidence_id uuid primary key default gen_random_uuid(),
  agent_id uuid null references public.agents(agent_id) on delete cascade,
  source_asset_id uuid null references public.knowledge_assets(id) on delete set null,
  source_type public.evidence_source_type not null,
  source_actor_id uuid null,
  source_session_id text null,
  excerpt text null,
  weight numeric(5,4) not null default 1 check (weight >= 0 and weight <= 1),
  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.identity_evidence_links (
  evidence_link_id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references public.identity_evidence(evidence_id) on delete cascade,
  target_table text not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (evidence_id, target_table, target_id)
);

create table if not exists public.identity_contradictions (
  contradiction_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  target_table text not null,
  target_id uuid not null,
  conflict_summary text not null,
  prior_state jsonb not null default '{}'::jsonb,
  incoming_state jsonb not null default '{}'::jsonb,
  tension_status public.review_status not null default 'PENDING_REVIEW',
  resolved_by_mutation_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.identity_mutation_proposals (
  mutation_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  proposed_by_user_id uuid null references auth.users(id) on delete set null,
  proposed_by_agent_id uuid null references public.agents(agent_id) on delete set null,
  source_asset_id uuid null references public.knowledge_assets(id) on delete set null,
  mutation_type public.identity_mutation_type not null,
  target_table text not null,
  target_id uuid null,
  target_path text not null default '',
  mutation_class public.mutation_class not null,
  risk_level public.identity_mutation_risk_level not null default 'medium',
  status public.identity_mutation_status not null default 'proposed',
  patch_payload jsonb not null default '{}'::jsonb,
  diff_summary text not null default '',
  reason text null,
  confidence numeric(5,4) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  last_affirmed_at timestamptz null,
  approved_at timestamptz null,
  applied_at timestamptz null,
  rolled_back_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.identity_review_events (
  review_event_id uuid primary key default gen_random_uuid(),
  mutation_id uuid not null references public.identity_mutation_proposals(mutation_id) on delete cascade,
  reviewer_user_id uuid null references auth.users(id) on delete set null,
  decision public.identity_review_decision not null,
  notes text null,
  created_at timestamptz not null default now()
);

create table if not exists public.identity_rollback_events (
  rollback_event_id uuid primary key default gen_random_uuid(),
  mutation_id uuid not null references public.identity_mutation_proposals(mutation_id) on delete cascade,
  rolled_back_by uuid null references auth.users(id) on delete set null,
  reason text null,
  rollback_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_context_views (
  context_view_id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  scope public.context_view_scope not null,
  relationship_id uuid null references public.agent_relationship_edges(relationship_id) on delete cascade,
  collaborative_space_id uuid null references public.collaborative_spaces(collaborative_space_id) on delete cascade,
  channel_key text null,
  display_name text not null,
  filter_policy jsonb not null default '{}'::jsonb,
  presentation_overrides jsonb not null default '{}'::jsonb,
  sharing_policy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agents_owner_status_idx
  on public.agents (owner_user_id, status, updated_at desc);
create index if not exists agent_versions_agent_status_created_idx
  on public.agent_versions (agent_id, status, created_at desc);
create index if not exists agent_constitutions_agent_idx
  on public.agent_constitutions (agent_id, updated_at desc);
create unique index if not exists agent_constitutions_current_idx
  on public.agent_constitutions (agent_id)
  where version_id is null;
create index if not exists agent_autobiographies_agent_idx
  on public.agent_autobiographies (agent_id, updated_at desc);
create unique index if not exists agent_autobiographies_current_idx
  on public.agent_autobiographies (agent_id)
  where version_id is null;
create index if not exists agent_private_interiors_agent_idx
  on public.agent_private_interiors (agent_id, updated_at desc);
create unique index if not exists agent_private_interiors_current_idx
  on public.agent_private_interiors (agent_id)
  where version_id is null;
create index if not exists agent_governance_policies_agent_idx
  on public.agent_governance_policies (agent_id, updated_at desc);
create unique index if not exists agent_governance_policies_current_idx
  on public.agent_governance_policies (agent_id)
  where version_id is null;
create index if not exists agent_presentation_profiles_agent_idx
  on public.agent_presentation_profiles (agent_id, updated_at desc);
create unique index if not exists agent_presentation_profiles_current_idx
  on public.agent_presentation_profiles (agent_id)
  where version_id is null;
create index if not exists agent_skill_profiles_agent_idx
  on public.agent_skill_profiles (agent_id, proficiency desc);
create index if not exists agent_memory_records_agent_kind_idx
  on public.agent_memory_records (agent_id, memory_kind, review_status, created_at desc);
create index if not exists agent_memory_records_teamspace_idx
  on public.agent_memory_records (agent_id, owner_scope, salience desc);
create index if not exists agent_preference_nodes_agent_kind_idx
  on public.agent_preference_nodes (agent_id, preference_kind, resonance_weight desc);
create index if not exists agent_relationship_edges_agent_idx
  on public.agent_relationship_edges (agent_id, relationship_type, updated_at desc);
create index if not exists collaborative_space_members_agent_idx
  on public.collaborative_space_members (agent_id);
create index if not exists collaborative_memory_records_space_idx
  on public.collaborative_memory_records (collaborative_space_id, created_at desc);
create index if not exists identity_evidence_agent_observed_idx
  on public.identity_evidence (agent_id, observed_at desc);
create index if not exists identity_evidence_links_target_idx
  on public.identity_evidence_links (target_table, target_id);
create index if not exists identity_contradictions_agent_status_idx
  on public.identity_contradictions (agent_id, tension_status, created_at desc);
create index if not exists identity_mutation_proposals_agent_status_idx
  on public.identity_mutation_proposals (agent_id, status, risk_level, created_at desc);
create index if not exists identity_mutation_proposals_review_queue_idx
  on public.identity_mutation_proposals (status, mutation_class, risk_level, created_at desc)
  where status = 'proposed';
create index if not exists identity_review_events_mutation_idx
  on public.identity_review_events (mutation_id, created_at desc);
create index if not exists agent_context_views_agent_scope_idx
  on public.agent_context_views (agent_id, scope, updated_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'agent_constitutions',
    'agent_autobiographies',
    'agent_private_interiors',
    'agent_governance_policies',
    'agent_presentation_profiles',
    'agent_skill_profiles',
    'agent_memory_records',
    'agent_preference_nodes',
    'agent_relationship_edges',
    'collaborative_spaces',
    'collaborative_memory_records',
    'identity_contradictions',
    'agent_context_views'
  ]
  loop
    if not exists (
      select 1
      from pg_trigger
      where tgname = table_name || '_set_updated_at'
    ) then
      execute format(
        'create trigger %I before update on public.%I for each row execute function public.set_agent_personhood_updated_at()',
        table_name || '_set_updated_at',
        table_name
      );
    end if;
  end loop;
end
$$;

create or replace view public.pending_identity_reviews
with (security_invoker = true)
as
select
  imp.mutation_id,
  imp.agent_id,
  a.slug as agent_slug,
  imp.mutation_type,
  imp.target_table,
  imp.target_id,
  imp.target_path,
  imp.mutation_class,
  imp.risk_level,
  imp.diff_summary,
  imp.reason,
  imp.confidence,
  imp.evidence_count,
  imp.created_at
from public.identity_mutation_proposals imp
join public.agents a on a.agent_id = imp.agent_id
where imp.status = 'proposed'
order by imp.risk_level desc, imp.created_at asc;

create or replace view public.agent_governed_identity_snapshot
with (security_invoker = true)
as
select
  a.agent_id,
  a.slug,
  coalesce(a.public_name, a.title) as public_name,
  a.internal_designation,
  coalesce(a.origin_context, a.domain) as origin_context,
  a.status,
  a.active_version_id,
  jsonb_build_object(
    'constitution', (
      select to_jsonb(c) - 'constitution_id' - 'agent_id' - 'version_id'
      from public.agent_constitutions c
      where c.agent_id = a.agent_id
      order by c.updated_at desc
      limit 1
    ),
    'autobiography', (
      select to_jsonb(ab) - 'autobiography_id' - 'agent_id' - 'version_id'
      from public.agent_autobiographies ab
      where ab.agent_id = a.agent_id
      order by ab.updated_at desc
      limit 1
    ),
    'privateInterior', (
      select to_jsonb(pi) - 'private_interior_id' - 'agent_id' - 'version_id'
      from public.agent_private_interiors pi
      where pi.agent_id = a.agent_id
      order by pi.updated_at desc
      limit 1
    ),
    'governance', (
      select to_jsonb(gp) - 'governance_policy_id' - 'agent_id' - 'version_id'
      from public.agent_governance_policies gp
      where gp.agent_id = a.agent_id
      order by gp.updated_at desc
      limit 1
    ),
    'presentation', (
      select to_jsonb(pp) - 'presentation_profile_id' - 'agent_id' - 'version_id'
      from public.agent_presentation_profiles pp
      where pp.agent_id = a.agent_id
      order by pp.updated_at desc
      limit 1
    ),
    'skills', coalesce((
      select jsonb_agg(to_jsonb(sp) - 'skill_profile_id' - 'agent_id' order by sp.proficiency desc)
      from public.agent_skill_profiles sp
      where sp.agent_id = a.agent_id
    ), '[]'::jsonb),
    'memorySystem', jsonb_build_object(
      'records', coalesce((
        select jsonb_agg(to_jsonb(mr) - 'memory_id' - 'agent_id' - 'version_id' order by mr.salience desc, mr.created_at desc)
        from public.agent_memory_records mr
        where mr.agent_id = a.agent_id
      ), '[]'::jsonb),
      'collaborative', coalesce((
        select jsonb_agg(
          to_jsonb(cm) - 'collaborative_memory_id' - 'collaborative_space_id' - 'source_memory_id' - 'created_by_agent_id'
          order by cm.created_at desc
        )
        from public.collaborative_memory_records cm
        join public.collaborative_space_members csm
          on csm.collaborative_space_id = cm.collaborative_space_id
        where csm.agent_id = a.agent_id
      ), '[]'::jsonb)
    ),
    'preferenceGraph', coalesce((
      select jsonb_agg(to_jsonb(pn) - 'preference_id' - 'agent_id' - 'version_id' order by pn.resonance_weight desc, pn.salience desc)
      from public.agent_preference_nodes pn
      where pn.agent_id = a.agent_id
    ), '[]'::jsonb),
    'relationshipGraph', coalesce((
      select jsonb_agg(to_jsonb(re) - 'relationship_id' - 'agent_id' - 'version_id' order by re.trust_level desc, re.updated_at desc)
      from public.agent_relationship_edges re
      where re.agent_id = a.agent_id
    ), '[]'::jsonb),
    'contextViews', coalesce((
      select jsonb_agg(to_jsonb(cv) - 'context_view_id' - 'agent_id' order by cv.updated_at desc)
      from public.agent_context_views cv
      where cv.agent_id = a.agent_id
    ), '[]'::jsonb)
  ) as embodiment_profile
from public.agents a;

do $$
declare
  secure_table text;
  policy_name text;
begin
  foreach secure_table in array array[
    'agent_constitutions',
    'agent_autobiographies',
    'agent_private_interiors',
    'agent_governance_policies',
    'agent_presentation_profiles',
    'agent_skill_profiles',
    'agent_memory_records',
    'agent_preference_nodes',
    'agent_relationship_edges',
    'collaborative_spaces',
    'collaborative_space_members',
    'collaborative_memory_records',
    'identity_evidence',
    'identity_evidence_links',
    'identity_contradictions',
    'identity_mutation_proposals',
    'identity_review_events',
    'identity_rollback_events',
    'agent_context_views'
  ]
  loop
    execute format('alter table public.%I enable row level security', secure_table);

    policy_name := format('Service role full access %s', secure_table);

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = secure_table
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to service_role using (true) with check (true)',
        policy_name,
        secure_table
      );
    end if;
  end loop;
end
$$;

comment on view public.agent_governed_identity_snapshot is
'Read model for reconstructing embodiment_profile from governed write-owned domains.';

comment on view public.pending_identity_reviews is
'Queue of review-gated or high-risk identity mutations awaiting human decision.';
