-- =============================================================================
-- GestaltView v2 — Supabase Schema
-- Single Source of Truth — Live Introspected
-- © 2026 Keith Soyka / GestaltView
--
-- Introspected from: project ltajayfzlaevchxngkrm
-- Last synced:       2026-03-29
--
-- Run this against a fresh Supabase project to reproduce the full schema.
-- All RLS policies use service_role for API access; anon is blocked by default.
--
-- TABLE INDEX
-- ── Core Auth & Users ─────────────────────────────────────────────────────
--  1.  app_users                 Anonymous session users (text PK)  1 row
--  2.  users                     Authenticated users (uuid → auth.users)  0 rows
-- ── Billy / AI ────────────────────────────────────────────────────────────
--  3.  billy_sessions            Full conversation log  18 rows
--  4.  founder_context           Keith's persistent PLK/session state  0 rows
--  5.  bucket_drops              Content capture queue  0 rows
-- ── RAG Corpus ────────────────────────────────────────────────────────────
--  6.  knowledge_fragments       Primary corpus (32,568 rows)
--  7.  skill_fragments           Skill corpus (4,012 rows)
--  8.  skills                    Skill registry/catalog  0 rows
-- ── Ingestion Pipeline ────────────────────────────────────────────────────
--  9.  documents                 Raw ingested docs (1,110 rows)
-- 10.  embeddings                Per-document embeddings (4,031 rows)
-- 11.  processing_runs           Pipeline run tracking (45 rows)
-- 12.  summaries                 Document summaries (surface/deep/gestalt)  0 rows
-- 13.  loom_annotations          Pipeline loom annotations  0 rows
-- 14.  concepts                  Concept graph nodes  0 rows
-- 15.  document_concepts         Document ↔ concept weights  0 rows
-- 16.  annotation_concepts       Annotation ↔ concept links  0 rows
-- ── Consciousness Profiles ────────────────────────────────────────────────
-- 17.  consciousness_profiles    User consciousness profile  0 rows
-- ── Exhibits ──────────────────────────────────────────────────────────────
-- 18.  musical_dna_analyses      Musical DNA exhibit  0 rows
-- 19.  tribunal_sessions         Digital Tribunal user sessions  0 rows
-- 20.  tribunal_events           Tribunal multi-agent events  0 rows
-- 21.  tribunal_evidence         Evidence links per tribunal event  0 rows
-- ── Commerce ──────────────────────────────────────────────────────────────
-- 22.  orders                    Shopify / purchase orders  0 rows
-- 23.  order_notes               Notes attached to orders  0 rows
-- 24.  uploads                   Files uploaded per order  0 rows
-- 25.  deliverables              Deliverable ZIPs per order  0 rows
--
-- RPC FUNCTIONS (6 overloads)
--  match_knowledge_fragments     (v1 — app-facing, sql, stable)
--  search_knowledge_fragments    (v1 — app-facing, sql, stable)
--  match_skill_fragments         (v1 — app-facing, sql, stable)
--  match_skill_fragments         (v2 — extended, plpgsql, threshold+tags)
--  search_skill_fragments        (v1 — app-facing, sql, stable)
--  search_skill_fragments        (v2 — extended, plpgsql, tags)
-- =============================================================================

-- Enable required extensions
create extension if not exists vector;
create extension if not exists pg_trgm;

-- =============================================================================
-- 1. app_users
-- Anonymous / session users identified by text ID.
-- FK target for billy_sessions, bucket_drops, musical_dna_analyses,
-- tribunal_sessions, and consciousness_profiles.
-- NOTE: user_id in these tables is TEXT (not uuid), referencing this table.
-- =============================================================================
create table if not exists app_users (
  id           text primary key,
  created_at   timestamptz not null default now()
);

alter table app_users enable row level security;

-- =============================================================================
-- 2. users
-- Authenticated users tied to Supabase auth.users.
-- Holds billing/subscription state (Stripe) and usage counters.
-- =============================================================================
create table if not exists users (
  id                      uuid primary key references auth.users(id),
  email                   text not null unique,
  tier                    text not null default 'free'
                          check (tier = any(array['free','core','pro','enterprise'])),
  stripe_customer_id      text unique,
  stripe_subscription_id  text,
  subscription_status     text default 'inactive'
                          check (subscription_status = any(
                            array['active','inactive','past_due','canceled','trialing']
                          )),
  billing_period_start    timestamptz,
  billy_query_count       integer not null default 0,
  is_admin                boolean not null default false,
  grace_until             timestamptz,  -- Grace period for past_due. NULL = no grace. Added 2026-03-21
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table users enable row level security;

-- =============================================================================
-- 3. billy_sessions
-- Full conversation log for every Billy interaction.
-- 18 rows live. user_id → app_users.id (text FK).
-- mode defaults to 'chat'. response and provider are nullable.
-- =============================================================================
create table if not exists billy_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references app_users(id),
  message     text not null,
  response    text,
  provider    text,
  mode        text not null default 'chat',
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists billy_sessions_user_id_idx    on billy_sessions (user_id);
create index if not exists billy_sessions_created_at_idx on billy_sessions (created_at desc);
create index if not exists billy_sessions_provider_idx   on billy_sessions (provider);

alter table billy_sessions enable row level security;

-- =============================================================================
-- 4. founder_context
-- Persistent PLK/session memory for Keith.
-- user_id is UUID → auth.users (NOT text — differs from other user tables).
-- One row per user. mode_preference defaults to 'synthesis'.
-- =============================================================================
create table if not exists founder_context (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references auth.users(id),
  plk_snapshot     jsonb not null default '{}'::jsonb,
  current_state    text,
  mode_preference  text not null default 'synthesis'
                   check (mode_preference = any(array['synthesis','chat'])),
  last_session_at  timestamptz,
  session_thread   text,
  confirmed_adult  boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists founder_context_user_id_idx on founder_context (user_id);

alter table founder_context enable row level security;

-- =============================================================================
-- 5. bucket_drops
-- Content capture drops (Billy bucket-drop UX).
-- Stores raw content + capture context. user_id → app_users.id (text FK).
-- NOTE: This is NOT a file queue — it's a content capture table.
-- =============================================================================
create table if not exists bucket_drops (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null references app_users(id),
  content          text not null,
  raw_text         text,
  capture_context  jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists bucket_drops_user_id_idx    on bucket_drops (user_id);
create index if not exists bucket_drops_created_at_idx on bucket_drops (created_at desc);

alter table bucket_drops enable row level security;

-- =============================================================================
-- 6. knowledge_fragments
-- Primary RAG corpus. 32,568 rows live.
-- Embeddings stored here directly (no separate join to embeddings table).
-- content_hash enforces deduplication. total_chunks / char_count for chunking.
-- =============================================================================
create table if not exists knowledge_fragments (
  id             uuid primary key default gen_random_uuid(),
  content        text not null,
  content_hash   text unique,
  embedding      vector,  -- dimension set by ingestion model (768 for Gemini text-embedding-004)
  source_file    text not null,
  document_type  text not null default 'General',
  chunk_index    integer not null default 0,
  total_chunks   integer not null default 1,
  char_count     integer,
  tags           text[] default '{}'::text[],
  created_at     timestamptz default now()
);

create index if not exists knowledge_fragments_embedding_idx
  on knowledge_fragments
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists knowledge_fragments_source_file_idx
  on knowledge_fragments (source_file);

create index if not exists knowledge_fragments_document_type_idx
  on knowledge_fragments (document_type);

create index if not exists knowledge_fragments_tags_idx
  on knowledge_fragments using gin (tags);

create index if not exists knowledge_fragments_content_fts_idx
  on knowledge_fragments
  using gin (to_tsvector('english', content));

alter table knowledge_fragments enable row level security;

-- =============================================================================
-- 7. skill_fragments
-- Skill-file RAG corpus. 4,012 rows live.
-- FK to documents.document_id (nullable — some rows predate the documents table).
-- Richer metadata vs knowledge_fragments: document_type, total_chunks, char_count.
-- =============================================================================
create table if not exists skill_fragments (
  id             uuid primary key default gen_random_uuid(),
  document_id    uuid references documents(document_id),
  content        text not null,
  content_hash   text,
  embedding      vector,
  source_file    text,
  document_type  text default 'Skill',
  skill_name     text,
  chunk_index    integer,
  total_chunks   integer,
  char_count     integer,
  tags           text[],
  created_at     timestamptz default now()
);

create index if not exists skill_fragments_embedding_idx
  on skill_fragments
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists skill_fragments_skill_name_idx  on skill_fragments (skill_name);
create index if not exists skill_fragments_document_id_idx on skill_fragments (document_id);
create index if not exists skill_fragments_tags_idx
  on skill_fragments using gin (tags);

create index if not exists skill_fragments_content_fts_idx
  on skill_fragments
  using gin (to_tsvector('english', content));

alter table skill_fragments enable row level security;

-- =============================================================================
-- 8. skills
-- Skill registry / catalog entries.
-- name is unique. tags array for filtering.
-- =============================================================================
create table if not exists skills (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  content     text not null,
  tags        text[] default '{}'::text[],
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table skills enable row level security;

-- =============================================================================
-- 9. documents
-- Raw ingested document chunks. 1,110 rows live.
-- FK target for skill_fragments, embeddings, summaries, document_concepts.
-- hash is unique (deduplication key).
-- =============================================================================
create table if not exists documents (
  document_id         uuid primary key default gen_random_uuid(),
  run_id              uuid not null references processing_runs(run_id),
  tenant_id           uuid not null,
  path                text not null,
  filename            text not null,
  hash                text not null unique,
  chunk_index         integer not null,
  total_chunks        integer not null,
  file_size_bytes     integer,
  content             text not null,
  mime_type           text,
  extracted_metadata  jsonb not null default '{}'::jsonb,
  provenance          jsonb not null default '{}'::jsonb,
  created_by          uuid,
  created_at          timestamptz not null default now()
);

create index if not exists documents_run_id_idx   on documents (run_id);
create index if not exists documents_filename_idx on documents (filename);
create index if not exists documents_hash_idx     on documents (hash);

alter table documents enable row level security;

-- =============================================================================
-- 10. embeddings
-- Per-document embedding vectors. 4,031 rows live.
-- Separate from knowledge_fragments (which embeds inline).
-- Linked to documents and processing_runs.
-- =============================================================================
create table if not exists embeddings (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(document_id),
  model       text not null,
  embedding   vector,
  run_id      uuid references processing_runs(run_id),
  created_at  timestamptz not null default now()
);

create index if not exists embeddings_document_id_idx on embeddings (document_id);
create index if not exists embeddings_run_id_idx      on embeddings (run_id);

alter table embeddings enable row level security;

-- =============================================================================
-- 11. processing_runs
-- Ingestion pipeline run tracking. 45 rows live.
-- Primary key is run_id (uuid). FK target for documents, embeddings,
-- summaries, and loom_annotations.
-- status defaults to 'running' (not 'pending').
-- =============================================================================
create table if not exists processing_runs (
  run_id           uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null,
  status           text not null default 'running'
                   check (status = any(array['running','complete','failed','pending'])),
  model            text,
  corpus_root      text,
  documents_count  integer not null default 0,
  chunks_count     integer not null default 0,
  created_by       uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists processing_runs_status_idx     on processing_runs (status);
create index if not exists processing_runs_updated_at_idx on processing_runs (updated_at desc);
create index if not exists processing_runs_tenant_id_idx  on processing_runs (tenant_id);

alter table processing_runs enable row level security;

-- =============================================================================
-- 12. summaries
-- LLM-generated summaries per document at surface / deep / gestalt levels.
-- =============================================================================
create table if not exists summaries (
  summary_id   uuid primary key default gen_random_uuid(),
  run_id       uuid not null references processing_runs(run_id),
  document_id  uuid not null references documents(document_id),
  level        text not null default 'surface'
               check (level = any(array['surface','deep','gestalt'])),
  content      text not null,
  created_at   timestamptz not null default now()
);

create index if not exists summaries_document_id_idx on summaries (document_id);
create index if not exists summaries_run_id_idx      on summaries (run_id);
create index if not exists summaries_level_idx       on summaries (level);

alter table summaries enable row level security;

-- =============================================================================
-- 13. loom_annotations
-- Annotations generated by the pipeline loom. Linked to processing_runs.
-- =============================================================================
create table if not exists loom_annotations (
  annotation_id  uuid primary key default gen_random_uuid(),
  run_id         uuid not null references processing_runs(run_id),
  type           text not null,
  content        text not null,
  created_at     timestamptz not null default now()
);

create index if not exists loom_annotations_run_id_idx on loom_annotations (run_id);
create index if not exists loom_annotations_type_idx   on loom_annotations (type);

alter table loom_annotations enable row level security;

-- =============================================================================
-- 14. concepts
-- Concept graph nodes. tenant-scoped.
-- =============================================================================
create table if not exists concepts (
  concept_id  uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null,
  name        text not null,
  canonical   text not null,
  created_at  timestamptz not null default now()
);

create index if not exists concepts_tenant_id_idx on concepts (tenant_id);
create index if not exists concepts_canonical_idx on concepts (canonical);

alter table concepts enable row level security;

-- =============================================================================
-- 15. document_concepts
-- Weighted join between documents and concepts.
-- =============================================================================
create table if not exists document_concepts (
  document_id  uuid not null references documents(document_id),
  concept_id   uuid not null references concepts(concept_id),
  weight       real not null default 1.0
               check (weight >= 0.0 and weight <= 1.0),
  primary key (document_id, concept_id)
);

alter table document_concepts enable row level security;

-- =============================================================================
-- 16. annotation_concepts
-- Join between loom_annotations and concepts.
-- =============================================================================
create table if not exists annotation_concepts (
  annotation_id  uuid not null references loom_annotations(annotation_id),
  concept_id     uuid not null references concepts(concept_id),
  primary key (annotation_id, concept_id)
);

alter table annotation_concepts enable row level security;

-- =============================================================================
-- 17. consciousness_profiles
-- User consciousness profile. user_id → app_users.id (text FK).
-- profile stored as jsonb blob.
-- =============================================================================
create table if not exists consciousness_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references app_users(id),
  profile     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists consciousness_profiles_user_id_idx on consciousness_profiles (user_id);

alter table consciousness_profiles enable row level security;

-- =============================================================================
-- 18. musical_dna_analyses
-- Musical DNA exhibit. user_id → app_users.id (text FK).
-- Stores song_title, artist, analysis text, empowerment_score.
-- =============================================================================
create table if not exists musical_dna_analyses (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null references app_users(id),
  song_title        text not null,
  artist            text not null,
  analysis          text,
  empowerment_score numeric,
  created_at        timestamptz not null default now()
);

create index if not exists musical_dna_analyses_user_id_idx    on musical_dna_analyses (user_id);
create index if not exists musical_dna_analyses_created_at_idx on musical_dna_analyses (created_at desc);

alter table musical_dna_analyses enable row level security;

-- =============================================================================
-- 19. tribunal_sessions
-- Digital Tribunal user-facing sessions. user_id → app_users.id (text FK).
-- question, participants array, provider, response, metadata.
-- =============================================================================
create table if not exists tribunal_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references app_users(id),
  question      text not null,
  participants  text[] not null default '{}'::text[],
  provider      text,
  response      text,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists tribunal_sessions_user_id_idx    on tribunal_sessions (user_id);
create index if not exists tribunal_sessions_created_at_idx on tribunal_sessions (created_at desc);

alter table tribunal_sessions enable row level security;

-- =============================================================================
-- 20. tribunal_events
-- Multi-agent tribunal events (internal orchestration layer).
-- Separate from tribunal_sessions (user-facing).
-- =============================================================================
create table if not exists tribunal_events (
  id                  uuid primary key default gen_random_uuid(),
  question            text not null,
  candidate_answers   jsonb not null default '[]'::jsonb,
  winning_answer_id   text,
  verdict_summary     text,
  triggering_agent    text,
  created_at          timestamptz not null default now()
);

create index if not exists tribunal_events_created_at_idx on tribunal_events (created_at desc);

alter table tribunal_events enable row level security;

-- =============================================================================
-- 21. tribunal_evidence
-- Evidence records linked to tribunal_events.
-- document_id and fragment_id are both nullable (cross-references).
-- =============================================================================
create table if not exists tribunal_evidence (
  id                uuid primary key default gen_random_uuid(),
  tribunal_event_id uuid not null references tribunal_events(id),
  document_id       uuid,
  fragment_id       uuid,
  weight            numeric not null default 1.0,
  comment           text,
  created_at        timestamptz not null default now()
);

create index if not exists tribunal_evidence_event_id_idx on tribunal_evidence (tribunal_event_id);

alter table tribunal_evidence enable row level security;

-- =============================================================================
-- 22. orders
-- Purchase / Shopify order records.
-- magic_token is the passwordless access mechanism per order.
-- =============================================================================
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  shopify_order_id text unique,
  customer_email   text not null,
  customer_name    text,
  product_name     text,
  order_status     text not null default 'pending',
  magic_token      text unique default (gen_random_uuid())::text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_customer_email_idx on orders (customer_email);
create index if not exists orders_magic_token_idx    on orders (magic_token);
create index if not exists orders_order_status_idx   on orders (order_status);

alter table orders enable row level security;

-- =============================================================================
-- 23. order_notes
-- Notes attached to an order.
-- =============================================================================
create table if not exists order_notes (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id),
  note       text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_notes_order_id_idx on order_notes (order_id);

alter table order_notes enable row level security;

-- =============================================================================
-- 24. uploads
-- Files uploaded per order.
-- =============================================================================
create table if not exists uploads (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id),
  file_name  text not null,
  file_url   text not null,
  created_at timestamptz not null default now()
);

create index if not exists uploads_order_id_idx on uploads (order_id);

alter table uploads enable row level security;

-- =============================================================================
-- 25. deliverables
-- Deliverable ZIP URLs per order.
-- =============================================================================
create table if not exists deliverables (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id),
  zip_url    text not null,
  created_at timestamptz not null default now()
);

create index if not exists deliverables_order_id_idx on deliverables (order_id);

alter table deliverables enable row level security;


-- =============================================================================
-- RPC FUNCTIONS (6 overloads — verbatim from live Supabase)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- match_knowledge_fragments  (v1 — app-facing)
-- Called by: api/_lib/supabase.ts → matchKnowledgeFragments()
-- Language: sql, STABLE
-- Uses: knowledge_fragments.embedding <=> cosine distance
-- Filters: document_type (filter_type), tags overlap (filter_package)
-- ---------------------------------------------------------------------------
create or replace function match_knowledge_fragments(
  query_embedding  vector,
  match_count      integer  default 8,
  filter_type      text     default null,
  filter_package   text     default null
)
returns table (
  id             uuid,
  content        text,
  source_file    text,
  document_type  text,
  chunk_index    integer,
  tags           text[],
  similarity     double precision
)
language sql
stable
set search_path to 'public', 'extensions'
as $$
  select
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    1 - (kf.embedding <=> query_embedding) as similarity
  from public.knowledge_fragments kf
  where kf.embedding is not null
    and (filter_type    is null or kf.document_type = filter_type)
    and (filter_package is null or kf.tags && array[filter_package])
  order by kf.embedding <=> query_embedding
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- search_knowledge_fragments  (v1 — app-facing)
-- Called by: api/_lib/supabase.ts → searchKnowledgeFragments()
-- Language: sql, STABLE
-- Uses: tsvector full-text search
-- ---------------------------------------------------------------------------
create or replace function search_knowledge_fragments(
  query_text      text,
  match_count     integer  default 8,
  filter_type     text     default null,
  filter_package  text     default null
)
returns table (
  id             uuid,
  content        text,
  source_file    text,
  document_type  text,
  chunk_index    integer,
  tags           text[],
  rank           double precision
)
language sql
stable
set search_path to 'public', 'extensions'
as $$
  select
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    ts_rank(
      to_tsvector('english', kf.content),
      plainto_tsquery('english', query_text)
    ) as rank
  from public.knowledge_fragments kf
  where
    to_tsvector('english', kf.content) @@ plainto_tsquery('english', query_text)
    and (filter_type    is null or kf.document_type = filter_type)
    and (filter_package is null or kf.tags && array[filter_package])
  order by rank desc
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- match_skill_fragments  (v1 — app-facing)
-- Called by: api/_lib/supabase.ts → matchSkillFragments()
-- Language: sql, STABLE
-- Uses: skill_fragments.embedding <=> cosine distance
-- Filters: skill_name exact or tags @> overlap
-- ---------------------------------------------------------------------------
create or replace function match_skill_fragments(
  query_embedding  vector,
  match_count      integer  default 8,
  filter_skill     text     default null
)
returns table (
  id           uuid,
  content      text,
  source_file  text,
  skill_name   text,
  chunk_index  integer,
  tags         text[],
  similarity   double precision
)
language sql
stable
set search_path to 'public', 'extensions'
as $$
  select
    sf.id,
    sf.content,
    sf.source_file,
    sf.skill_name,
    sf.chunk_index,
    sf.tags,
    1 - (sf.embedding <=> query_embedding) as similarity
  from skill_fragments sf
  where sf.embedding is not null
    and (
      filter_skill is null
      or sf.skill_name = filter_skill
      or (sf.tags @> array[filter_skill])
    )
  order by sf.embedding <=> query_embedding
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- match_skill_fragments  (v2 — extended, threshold + tags)
-- Richer return type: includes document_type, total_chunks, char_count.
-- Uses cosine threshold (default 0.70) for quality filtering.
-- STABLE PARALLEL SAFE.
-- ---------------------------------------------------------------------------
create or replace function match_skill_fragments(
  query_embedding   vector,
  match_threshold   double precision  default 0.70,
  match_count       integer           default 8,
  filter_skill_name text              default null,
  filter_tags       text[]            default null
)
returns table (
  id             uuid,
  content        text,
  skill_name     text,
  source_file    text,
  document_type  text,
  chunk_index    integer,
  total_chunks   integer,
  char_count     integer,
  tags           text[],
  similarity     double precision
)
language plpgsql
stable parallel safe
set search_path to 'public', 'extensions'
as $$
begin
  return query
  select
    sf.id,
    sf.content,
    sf.skill_name,
    sf.source_file,
    sf.document_type,
    sf.chunk_index,
    sf.total_chunks,
    sf.char_count,
    sf.tags,
    1 - (sf.embedding <=> query_embedding) as similarity
  from public.skill_fragments sf
  where
    sf.embedding is not null
    and (
      filter_skill_name is null
      or sf.skill_name = filter_skill_name
    )
    and (
      filter_tags is null
      or sf.tags && filter_tags
    )
    and 1 - (sf.embedding <=> query_embedding) >= match_threshold
  order by sf.embedding <=> query_embedding asc
  limit match_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- search_skill_fragments  (v1 — app-facing)
-- Called by: api/_lib/supabase.ts → searchSkillFragments()
-- Language: sql, STABLE
-- ---------------------------------------------------------------------------
create or replace function search_skill_fragments(
  query_text    text,
  match_count   integer  default 8,
  filter_skill  text     default null
)
returns table (
  id           uuid,
  content      text,
  source_file  text,
  skill_name   text,
  chunk_index  integer,
  tags         text[],
  rank         double precision
)
language sql
stable
set search_path to 'public', 'extensions'
as $$
  select
    sf.id,
    sf.content,
    sf.source_file,
    sf.skill_name,
    sf.chunk_index,
    sf.tags,
    ts_rank(to_tsvector('english', sf.content), plainto_tsquery('english', query_text)) as rank
  from skill_fragments sf
  where to_tsvector('english', sf.content) @@ plainto_tsquery('english', query_text)
    and (
      filter_skill is null
      or sf.skill_name = filter_skill
      or (sf.tags @> array[filter_skill])
    )
  order by rank desc
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- search_skill_fragments  (v2 — extended, tags filter)
-- Richer return type: includes document_type, total_chunks, char_count.
-- STABLE PARALLEL SAFE.
-- ---------------------------------------------------------------------------
create or replace function search_skill_fragments(
  search_query      text,
  match_count       integer  default 8,
  filter_skill_name text     default null,
  filter_tags       text[]   default null
)
returns table (
  id             uuid,
  content        text,
  skill_name     text,
  source_file    text,
  document_type  text,
  chunk_index    integer,
  total_chunks   integer,
  char_count     integer,
  tags           text[],
  rank           double precision
)
language plpgsql
stable parallel safe
set search_path to 'public', 'extensions'
as $$
begin
  return query
  select
    sf.id,
    sf.content,
    sf.skill_name,
    sf.source_file,
    sf.document_type,
    sf.chunk_index,
    sf.total_chunks,
    sf.char_count,
    sf.tags,
    ts_rank(
      to_tsvector('english', sf.content),
      plainto_tsquery('english', search_query)
    ) as rank
  from public.skill_fragments sf
  where
    to_tsvector('english', sf.content) @@ plainto_tsquery('english', search_query)
    and (
      filter_skill_name is null
      or sf.skill_name = filter_skill_name
    )
    and (
      filter_tags is null
      or sf.tags && filter_tags
    )
  order by rank desc
  limit match_count;
end;
$$;


-- =============================================================================
-- ROW LEVEL SECURITY — service_role full access on all tables
-- =============================================================================

create policy if not exists "service_role_all_app_users"
  on app_users for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_users"
  on users for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_billy_sessions"
  on billy_sessions for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_founder_context"
  on founder_context for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_bucket_drops"
  on bucket_drops for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_knowledge_fragments"
  on knowledge_fragments for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_skill_fragments"
  on skill_fragments for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_skills"
  on skills for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_documents"
  on documents for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_embeddings"
  on embeddings for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_processing_runs"
  on processing_runs for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_summaries"
  on summaries for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_loom_annotations"
  on loom_annotations for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_concepts"
  on concepts for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_document_concepts"
  on document_concepts for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_annotation_concepts"
  on annotation_concepts for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_consciousness_profiles"
  on consciousness_profiles for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_musical_dna_analyses"
  on musical_dna_analyses for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_tribunal_sessions"
  on tribunal_sessions for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_tribunal_events"
  on tribunal_events for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_tribunal_evidence"
  on tribunal_evidence for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_orders"
  on orders for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_order_notes"
  on order_notes for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_uploads"
  on uploads for all to service_role using (true) with check (true);

create policy if not exists "service_role_all_deliverables"
  on deliverables for all to service_role using (true) with check (true);


-- =============================================================================
-- NOTES
-- =============================================================================
--
-- USER ID TYPE INCONSISTENCY (intentional, do not "fix")
--   app_users.id         → text  (anonymous / session users)
--   users.id             → uuid  → auth.users (Supabase Auth)
--   founder_context.user_id → uuid → auth.users
--   billy_sessions.user_id  → text → app_users
--   bucket_drops.user_id    → text → app_users
--   consciousness_profiles.user_id → text → app_users
--   musical_dna_analyses.user_id   → text → app_users
--   tribunal_sessions.user_id      → text → app_users
--
-- This dual-identity model means pre-auth users interact via session text IDs
-- and authenticated users are linked to Supabase Auth UUIDs.
--
-- KNOWLEDGE vs SKILL FRAGMENTS
--   knowledge_fragments: inline embedding, created_at only (no updated_at live)
--   skill_fragments:     FK to documents, richer metadata, two RPC overloads
--
-- OVERLOADED RPCs
--   match_skill_fragments v1:  (query_embedding, match_count, filter_skill)
--   match_skill_fragments v2:  (query_embedding, match_threshold, match_count,
--                               filter_skill_name, filter_tags)
--   search_skill_fragments v1: (query_text, match_count, filter_skill)
--   search_skill_fragments v2: (search_query, match_count,
--                               filter_skill_name, filter_tags)
--   api/_lib/supabase.ts uses v1 for both. v2 is available for future use.
--
-- Embedding dimensions: not hard-coded in the live schema (just `vector`).
--   Ingestion pipeline sets dimensions at insert time.
--   Current model: Gemini text-embedding-004 (768 dims).
--
-- processing_runs.status defaults to 'running' (not 'pending') in production.
--
-- All API handlers use SUPABASE_SERVICE_ROLE_KEY. Never the anon key in prod.
-- =============================================================================
