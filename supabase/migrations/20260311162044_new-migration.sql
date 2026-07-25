-- Source: supabase_schema.zip/supabase/migrations/20260311162044_new-migration.sql
-- Canonicalized filename: 20260311162044_new-migration.sql

-- GestaltView v2 — Manifest Index Layer + API persistence schema
-- © 2026 Keith Soyka / GestaltView

create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists app_users (
  id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists consciousness_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bucket_drops (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  content text not null,
  raw_text text,
  capture_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists musical_dna_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  song_title text not null,
  artist text not null,
  analysis text,
  empowerment_score numeric(5,4),
  created_at timestamptz not null default now()
);

create table if not exists tribunal_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  question text not null,
  participants text[] not null default '{}'::text[],
  provider text,
  response text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists billy_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  message text not null,
  response text,
  provider text,
  mode text not null default 'chat',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists processing_runs (
  run_id uuid primary key,
  tenant_id uuid not null,
  status text not null default 'running',
  model text,
  corpus_root text,
  documents_count int not null default 0,
  chunks_count int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  document_id uuid primary key,
  run_id uuid not null references processing_runs(run_id) on delete cascade,
  tenant_id uuid not null,
  path text not null,
  filename text not null,
  hash text not null unique,
  chunk_index int not null,
  total_chunks int not null,
  file_size_bytes int,
  content text not null,
  mime_type text,
  extracted_metadata jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(document_id) on delete cascade,
  model text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_fragments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  content_hash text unique,
  embedding vector(1536),
  source_file text not null,
  document_type text not null default 'General',
  chunk_index integer not null default 0,
  total_chunks integer not null default 1,
  char_count integer,
  tags text[] default '{}'::text[],
  created_at timestamptz default now()
);

create index if not exists bucket_drops_user_created_idx on bucket_drops (user_id, created_at desc);
create index if not exists musical_dna_user_created_idx on musical_dna_analyses (user_id, created_at desc);
create index if not exists tribunal_user_created_idx on tribunal_sessions (user_id, created_at desc);
create index if not exists billy_sessions_user_created_idx on billy_sessions (user_id, created_at desc);

create index if not exists documents_tenant_path_idx on documents (tenant_id, path);
create index if not exists documents_hash_idx on documents (hash);
create index if not exists embeddings_document_idx on embeddings (document_id);
create index if not exists embeddings_hnsw_idx on embeddings using hnsw (embedding vector_cosine_ops);

create index if not exists knowledge_fragments_content_fts on knowledge_fragments using gin (to_tsvector('english', content));
create index if not exists knowledge_fragments_doc_type_idx on knowledge_fragments (document_type);
create index if not exists knowledge_fragments_tags_idx on knowledge_fragments using gin (tags);
create index if not exists knowledge_fragments_embedding_idx on knowledge_fragments using hnsw (embedding vector_cosine_ops) with (m = 16, ef_construction = 64);

-- ---------------------------------------------------------------
-- NUCLEAR DROP: delete ALL overloads of these functions by name
-- regardless of signature, using OID-based catalog query.
-- This is the only reliable way to clear overloaded functions
-- when DROP FUNCTION IF EXISTS fails due to signature mismatch.
-- ---------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid, proname
    FROM pg_proc
    WHERE proname IN (
      'match_knowledge_fragments',
      'search_knowledge_fragments',
      'matchknowledgefragments',
      'searchknowledgefragments'
    )
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', r.oid::regprocedure);
  END LOOP;
END $$;

-- ---------------------------------------------------------------
-- Recreate canonical snake_case functions
-- ---------------------------------------------------------------

CREATE FUNCTION match_knowledge_fragments(
  query_embedding vector(1536),
  match_count int default 8,
  filter_type text default null
)
RETURNS TABLE (
  id uuid,
  content text,
  source_file text,
  document_type text,
  chunk_index int,
  tags text[],
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    1 - (kf.embedding <=> query_embedding) AS similarity
  FROM knowledge_fragments kf
  WHERE kf.embedding IS NOT NULL
    AND (filter_type IS NULL OR kf.document_type = filter_type)
  ORDER BY kf.embedding <=> query_embedding
  LIMIT match_count;
$$;

CREATE FUNCTION search_knowledge_fragments(
  query_text text,
  match_count int default 8,
  filter_type text default null
)
RETURNS TABLE (
  id uuid,
  content text,
  source_file text,
  document_type text,
  chunk_index int,
  tags text[],
  rank float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    ts_rank(to_tsvector('english', kf.content), plainto_tsquery('english', query_text)) AS rank
  FROM knowledge_fragments kf
  WHERE to_tsvector('english', kf.content) @@ plainto_tsquery('english', query_text)
    AND (filter_type IS NULL OR kf.document_type = filter_type)
  ORDER BY rank DESC
  LIMIT match_count;
$$;

-- ---------------------------------------------------------------
-- camelCase API wrappers — explicit ::vector(1536) cast pins the
-- overload so Postgres never hits an ambiguity error.
-- ---------------------------------------------------------------

CREATE FUNCTION matchknowledgefragments(
  queryembedding vector(1536),
  matchcount int default 8,
  filtertype text default null
)
RETURNS TABLE (
  content text,
  sourcefile text,
  similarity float,
  chunkindex int,
  documenttype text,
  tags text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    m.content,
    m.source_file  AS sourcefile,
    m.similarity,
    m.chunk_index  AS chunkindex,
    m.document_type AS documenttype,
    array_to_string(m.tags, ',') AS tags
  FROM match_knowledge_fragments(
    queryembedding::vector(1536),
    matchcount,
    filtertype
  ) m;
$$;

CREATE FUNCTION searchknowledgefragments(
  querytext text,
  matchcount int default 8,
  filtertype text default null
)
RETURNS TABLE (
  content text,
  sourcefile text,
  rank float,
  chunkindex int,
  documenttype text,
  tags text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    s.content,
    s.source_file   AS sourcefile,
    s.rank,
    s.chunk_index   AS chunkindex,
    s.document_type AS documenttype,
    array_to_string(s.tags, ',') AS tags
  FROM search_knowledge_fragments(querytext, matchcount, filtertype) s;
$$;

CREATE OR REPLACE VIEW knowledge_stats AS
SELECT
  document_type,
  count(*)            AS fragment_count,
  sum(char_count)     AS total_chars,
  count(DISTINCT source_file) AS file_count,
  max(created_at)     AS last_updated
FROM knowledge_fragments
GROUP BY document_type
ORDER BY fragment_count DESC;

ALTER TABLE app_users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_drops           ENABLE ROW LEVEL SECURITY;
ALTER TABLE musical_dna_analyses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribunal_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE billy_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_runs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_fragments    ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'knowledge_fragments' AND policyname = 'Public read knowledge fragments') THEN
    CREATE POLICY "Public read knowledge fragments" ON knowledge_fragments FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Service role full access documents') THEN
    CREATE POLICY "Service role full access documents" ON documents FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'embeddings' AND policyname = 'Service role full access embeddings') THEN
    CREATE POLICY "Service role full access embeddings" ON embeddings FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Ensure guest user exists for API defaults.
INSERT INTO app_users(id) VALUES ('guest-user') ON CONFLICT (id) DO NOTHING;
