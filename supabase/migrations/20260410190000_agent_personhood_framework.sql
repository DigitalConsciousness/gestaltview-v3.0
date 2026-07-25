-- Source: supabase_schema.zip/supabase/migrations/20260410190000_agent_personhood_framework.sql
-- Canonicalized filename: 20260410190000_agent_personhood_framework.sql

create extension if not exists pgcrypto;
create extension if not exists vector;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'knowledge_asset_type') then
    create type public.knowledge_asset_type as enum (
      'pdf',
      'md',
      'json',
      'transcript',
      'code',
      'note',
      'url_snapshot',
      'image',
      'audio',
      'other'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'knowledge_asset_visibility') then
    create type public.knowledge_asset_visibility as enum ('private', 'admin', 'approved_shared');
  end if;

  if not exists (select 1 from pg_type where typname = 'knowledge_asset_status') then
    create type public.knowledge_asset_status as enum ('draft', 'processed', 'approved', 'rejected', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_knowledge_link_type') then
    create type public.agent_knowledge_link_type as enum (
      'visible',
      'assigned',
      'curriculum',
      'inherited',
      'blocked',
      'manifest_backing'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_knowledge_link_scope') then
    create type public.agent_knowledge_link_scope as enum ('runtime', 'trainer', 'both', 'export');
  end if;

  if not exists (select 1 from pg_type where typname = 'knowledge_classification') then
    create type public.knowledge_classification as enum (
      'knowledge',
      'skill',
      'memory',
      'relationship_signal',
      'identity_proposal',
      'code_artifact',
      'asset_artifact'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'embodiment_mutation_type') then
    create type public.embodiment_mutation_type as enum (
      'memory_append',
      'skill_update',
      'relationship_update',
      'profile_patch',
      'ts_module_create',
      'ts_module_patch',
      'asset_attach',
      'manifest_rebuild'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'embodiment_mutation_risk_level') then
    create type public.embodiment_mutation_risk_level as enum ('low', 'medium', 'high');
  end if;

  if not exists (select 1 from pg_type where typname = 'embodiment_mutation_status') then
    create type public.embodiment_mutation_status as enum (
      'proposed',
      'approved',
      'rejected',
      'applied',
      'rolled_back'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_memory_type') then
    create type public.agent_memory_type as enum ('episodic', 'semantic', 'procedural', 'relational');
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_memory_retention_policy') then
    create type public.agent_memory_retention_policy as enum ('durable', 'decays', 'review_required');
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_relationship_type') then
    create type public.agent_relationship_type as enum (
      'collaborator',
      'mentor',
      'counterpart',
      'dependent',
      'shared_memory_peer'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_manifest_status') then
    create type public.agent_manifest_status as enum ('draft', 'active', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_manifest_entry_type') then
    create type public.agent_manifest_entry_type as enum (
      'profile_json',
      'memory_ref',
      'skill_ref',
      'relationship_ref',
      'asset_ref',
      'ts_module_ref',
      'prompt_ref',
      'config_ref'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_code_generation_mode') then
    create type public.agent_code_generation_mode as enum ('uploaded', 'generated', 'patched');
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_code_review_status') then
    create type public.agent_code_review_status as enum ('draft', 'approved', 'rejected', 'applied');
  end if;
end
$$;

create table if not exists public.knowledge_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  asset_type public.knowledge_asset_type not null default 'other',
  storage_path text not null,
  raw_text text null,
  checksum text not null,
  source_label text null,
  source_uri text null,
  uploaded_by uuid null references auth.users(id) on delete set null,
  visibility public.knowledge_asset_visibility not null default 'admin',
  status public.knowledge_asset_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_asset_chunks (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.knowledge_assets(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(768) null,
  token_count integer null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (asset_id, chunk_index)
);

create table if not exists public.knowledge_tags (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_asset_tags (
  asset_id uuid not null references public.knowledge_assets(id) on delete cascade,
  tag_id uuid not null references public.knowledge_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (asset_id, tag_id)
);

create table if not exists public.agent_knowledge_links (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  asset_id uuid not null references public.knowledge_assets(id) on delete cascade,
  link_type public.agent_knowledge_link_type not null default 'visible',
  scope public.agent_knowledge_link_scope not null default 'both',
  approved_by uuid null references auth.users(id) on delete set null,
  approved_at timestamptz null,
  notes text null,
  created_at timestamptz not null default now(),
  unique (agent_id, asset_id, link_type, scope)
);

create table if not exists public.knowledge_interpretations (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.knowledge_assets(id) on delete cascade,
  agent_id uuid null references public.agents(agent_id) on delete cascade,
  classification public.knowledge_classification not null,
  extracted_payload jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) null,
  produced_by_run_id uuid null references public.training_runs(run_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.embodiment_mutations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  source_asset_id uuid null references public.knowledge_assets(id) on delete set null,
  interpretation_id uuid null references public.knowledge_interpretations(id) on delete set null,
  mutation_type public.embodiment_mutation_type not null,
  target_path text not null default '',
  patch_payload jsonb not null default '{}'::jsonb,
  file_payload text null,
  diff_summary text not null default '',
  risk_level public.embodiment_mutation_risk_level not null default 'medium',
  status public.embodiment_mutation_status not null default 'proposed',
  approved_by uuid null references auth.users(id) on delete set null,
  approved_at timestamptz null,
  applied_version_id uuid null references public.agent_versions(version_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_memories (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  source_asset_id uuid null references public.knowledge_assets(id) on delete set null,
  memory_type public.agent_memory_type not null,
  summary text not null,
  detail_payload jsonb not null default '{}'::jsonb,
  salience numeric(5,4) not null default 0.5,
  retention_policy public.agent_memory_retention_policy not null default 'review_required',
  created_at timestamptz not null default now()
);

create table if not exists public.agent_skills (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  skill_slug text not null,
  proficiency numeric(5,4) not null default 0,
  evidence_asset_id uuid null references public.knowledge_assets(id) on delete set null,
  last_updated_by_mutation_id uuid null references public.embodiment_mutations(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, skill_slug)
);

create table if not exists public.agent_relationships (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  related_agent_id uuid not null references public.agents(agent_id) on delete cascade,
  relationship_type public.agent_relationship_type not null,
  trust_score numeric(5,4) not null default 0,
  familiarity_score numeric(5,4) not null default 0,
  protocol_notes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (agent_id, related_agent_id, relationship_type),
  constraint agent_relationships_distinct_agents check (agent_id <> related_agent_id)
);

create table if not exists public.agent_manifests (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  version_id uuid not null references public.agent_versions(version_id) on delete cascade,
  parent_manifest_id uuid null references public.agent_manifests(id) on delete set null,
  manifest_version text not null,
  status public.agent_manifest_status not null default 'draft',
  root_json jsonb not null,
  checksum text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_manifest_entries (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.agent_manifests(id) on delete cascade,
  entry_type public.agent_manifest_entry_type not null,
  logical_path text not null,
  source_table text not null,
  source_id uuid not null,
  content_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (manifest_id, logical_path)
);

create table if not exists public.agent_code_artifacts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(agent_id) on delete cascade,
  manifest_id uuid null references public.agent_manifests(id) on delete set null,
  source_asset_id uuid null references public.knowledge_assets(id) on delete set null,
  file_path text not null,
  language text not null default 'typescript',
  content text not null,
  checksum text not null,
  generation_mode public.agent_code_generation_mode not null,
  review_status public.agent_code_review_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, file_path, checksum)
);

create index if not exists knowledge_assets_status_created_idx
  on public.knowledge_assets (status, created_at desc);
create index if not exists knowledge_assets_visibility_status_idx
  on public.knowledge_assets (visibility, status);
create index if not exists knowledge_assets_checksum_idx
  on public.knowledge_assets (checksum);
create index if not exists knowledge_asset_chunks_asset_idx
  on public.knowledge_asset_chunks (asset_id, chunk_index);
create index if not exists knowledge_asset_chunks_embedding_idx
  on public.knowledge_asset_chunks
  using hnsw (embedding vector_cosine_ops)
  where embedding is not null;
create index if not exists knowledge_asset_chunks_content_fts_idx
  on public.knowledge_asset_chunks
  using gin (to_tsvector('english', content));
create index if not exists knowledge_asset_tags_tag_idx
  on public.knowledge_asset_tags (tag_id);
create index if not exists agent_knowledge_links_agent_scope_idx
  on public.agent_knowledge_links (agent_id, scope, link_type);
create index if not exists agent_knowledge_links_asset_idx
  on public.agent_knowledge_links (asset_id);
create index if not exists knowledge_interpretations_asset_idx
  on public.knowledge_interpretations (asset_id, classification);
create index if not exists knowledge_interpretations_agent_idx
  on public.knowledge_interpretations (agent_id, created_at desc)
  where agent_id is not null;
create index if not exists embodiment_mutations_agent_status_idx
  on public.embodiment_mutations (agent_id, status, created_at desc);
create index if not exists embodiment_mutations_source_asset_idx
  on public.embodiment_mutations (source_asset_id)
  where source_asset_id is not null;
create index if not exists agent_memories_agent_type_idx
  on public.agent_memories (agent_id, memory_type, created_at desc);
create index if not exists agent_memories_source_asset_idx
  on public.agent_memories (source_asset_id)
  where source_asset_id is not null;
create index if not exists agent_skills_agent_idx
  on public.agent_skills (agent_id, skill_slug);
create index if not exists agent_skills_evidence_asset_idx
  on public.agent_skills (evidence_asset_id)
  where evidence_asset_id is not null;
create index if not exists agent_relationships_agent_idx
  on public.agent_relationships (agent_id, relationship_type, updated_at desc);
create index if not exists agent_relationships_related_agent_idx
  on public.agent_relationships (related_agent_id);
create index if not exists agent_manifests_agent_status_created_idx
  on public.agent_manifests (agent_id, status, created_at desc);
create unique index if not exists agent_manifests_one_active_per_agent_idx
  on public.agent_manifests (agent_id)
  where status = 'active';
create index if not exists agent_manifest_entries_manifest_idx
  on public.agent_manifest_entries (manifest_id, entry_type);
create index if not exists agent_manifest_entries_source_idx
  on public.agent_manifest_entries (source_table, source_id);
create index if not exists agent_code_artifacts_agent_review_idx
  on public.agent_code_artifacts (agent_id, review_status, updated_at desc);
create index if not exists agent_code_artifacts_manifest_idx
  on public.agent_code_artifacts (manifest_id)
  where manifest_id is not null;

create or replace function public.set_agent_personhood_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'knowledge_assets_set_updated_at'
  ) then
    create trigger knowledge_assets_set_updated_at
    before update on public.knowledge_assets
    for each row execute function public.set_agent_personhood_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'agent_skills_set_updated_at'
  ) then
    create trigger agent_skills_set_updated_at
    before update on public.agent_skills
    for each row execute function public.set_agent_personhood_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'agent_code_artifacts_set_updated_at'
  ) then
    create trigger agent_code_artifacts_set_updated_at
    before update on public.agent_code_artifacts
    for each row execute function public.set_agent_personhood_updated_at();
  end if;
end
$$;

create or replace view public.active_agent_manifests as
select distinct on (am.agent_id)
  am.agent_id,
  a.slug,
  am.id as manifest_id,
  am.version_id,
  am.manifest_version,
  am.root_json,
  am.checksum,
  am.created_at
from public.agent_manifests am
join public.agents a on a.agent_id = am.agent_id
where am.status = 'active'
order by am.agent_id, am.created_at desc;

create or replace view public.manifest_file_pull as
select
  am.agent_id,
  a.slug,
  am.id as manifest_id,
  ame.logical_path,
  ame.entry_type,
  ame.source_table,
  ame.source_id,
  ame.content_hash,
  ame.metadata
from public.agent_manifests am
join public.agents a on a.agent_id = am.agent_id
join public.agent_manifest_entries ame on ame.manifest_id = am.id
where am.status = 'active';

create or replace view public.approved_library_assets_by_agent as
select
  akl.agent_id,
  a.slug as agent_slug,
  ka.id as asset_id,
  ka.title,
  ka.asset_type,
  ka.storage_path,
  ka.checksum,
  ka.source_label,
  ka.visibility,
  ka.status,
  akl.link_type,
  akl.scope,
  akl.approved_at,
  ka.created_at
from public.agent_knowledge_links akl
join public.agents a on a.agent_id = akl.agent_id
join public.knowledge_assets ka on ka.id = akl.asset_id
where ka.status = 'approved'
  and akl.link_type <> 'blocked'
  and akl.approved_at is not null;

create or replace view public.pending_embodiment_mutations as
select
  em.id,
  em.agent_id,
  a.slug as agent_slug,
  em.source_asset_id,
  em.interpretation_id,
  em.mutation_type,
  em.target_path,
  em.diff_summary,
  em.risk_level,
  em.status,
  em.created_at
from public.embodiment_mutations em
join public.agents a on a.agent_id = em.agent_id
where em.status = 'proposed';

do $$
declare
  personhood_table text;
  policy_name text;
begin
  foreach personhood_table in array array[
    'knowledge_assets',
    'knowledge_asset_chunks',
    'knowledge_tags',
    'knowledge_asset_tags',
    'agent_knowledge_links',
    'knowledge_interpretations',
    'embodiment_mutations',
    'agent_memories',
    'agent_skills',
    'agent_relationships',
    'agent_manifests',
    'agent_manifest_entries',
    'agent_code_artifacts'
  ]
  loop
    execute format('alter table public.%I enable row level security', personhood_table);

    policy_name := format('Service role full access %s', personhood_table);

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = personhood_table
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to service_role using (true) with check (true)',
        policy_name,
        personhood_table
      );
    end if;
  end loop;
end
$$;

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values
      ('agent-personhood-raw-uploads', 'agent-personhood-raw-uploads', false),
      ('agent-personhood-normalized-assets', 'agent-personhood-normalized-assets', false),
      ('agent-personhood-code-artifacts', 'agent-personhood-code-artifacts', false)
    on conflict (id) do nothing;
  end if;
end
$$;
