-- Source: supabase_schema.zip/supabase/migrations/20260321104300_fix_embedding_dims_768.sql
-- Canonicalized filename: 20260321104300_fix_embedding_dims_768.sql

-- GestaltView — Correct embedding dims to 768 (text-embedding-004, free tier)
-- Migration: 20260321104300_fix_embedding_dims_768.sql
-- 2026 Keith Soyka · GestaltView
--
-- WHY: ivfflat hard-caps at 2000 dims. gemini-embedding-001 outputs 3072 → fails.
-- FIX: Use Gemini text-embedding-004 (768-dim, free tier) + hnsw index.
--      hnsw handles 768 dims cleanly and is better for < 1M row corpora anyway.
--
-- Previous migration already altered knowledge_fragments.embedding to vector(3072).
-- This migration corrects it to vector(768) and creates the proper hnsw index.

-- Ensure extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------
-- 1. knowledge_fragments — correct to 768
-- -----------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE  table_name  = 'knowledge_fragments'
    AND    column_name = 'embedding'
  ) THEN
    ALTER TABLE knowledge_fragments
      ALTER COLUMN embedding TYPE vector(768);
    RAISE NOTICE 'knowledge_fragments.embedding → vector(768)';
  ELSE
    -- Table did not exist yet — create it now at the correct dims
    CREATE TABLE IF NOT EXISTS knowledge_fragments (
      id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      content        TEXT        NOT NULL,
      content_hash   TEXT        UNIQUE,
      embedding      vector(768),
      source_file    TEXT        NOT NULL,
      document_type  TEXT        NOT NULL DEFAULT 'General',
      chunk_index    INTEGER     NOT NULL DEFAULT 0,
      total_chunks   INTEGER     NOT NULL DEFAULT 1,
      char_count     INTEGER,
      tags           TEXT[]      DEFAULT '{}',
      created_at     TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE 'knowledge_fragments created at vector(768)';
  END IF;
END $$;

-- -----------------------------------------------------------------------
-- 2. embeddings table — correct to 768 if column exists
-- -----------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE  table_name  = 'embeddings'
    AND    column_name = 'embedding'
  ) THEN
    ALTER TABLE embeddings
      ALTER COLUMN embedding TYPE vector(768);
    RAISE NOTICE 'embeddings.embedding → vector(768)';
  ELSE
    RAISE NOTICE 'embeddings.embedding column not found — skipping';
  END IF;
END $$;

-- -----------------------------------------------------------------------
-- 3. Drop any old indexes (from previous failed attempts)
-- -----------------------------------------------------------------------
DROP INDEX IF EXISTS idx_knowledge_fragments_embedding;
DROP INDEX IF EXISTS knowledge_fragments_embedding_idx;
DROP INDEX IF EXISTS embeddings_hnsw_idx;

-- -----------------------------------------------------------------------
-- 4. hnsw index — works at 768 dims, no dimension ceiling issues
--    m=16, ef_construction=64 is the standard starting point
-- -----------------------------------------------------------------------
CREATE INDEX idx_knowledge_fragments_embedding
  ON knowledge_fragments
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- -----------------------------------------------------------------------
-- 5. Supporting indexes (all idempotent)
-- -----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS knowledge_fragments_content_fts
  ON knowledge_fragments USING GIN (to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS knowledge_fragments_doctype_idx
  ON knowledge_fragments (document_type);

CREATE INDEX IF NOT EXISTS knowledge_fragments_tags_idx
  ON knowledge_fragments USING GIN (tags);

-- -----------------------------------------------------------------------
-- 6. RPC: match_knowledge_fragments (vector cosine similarity)
--    Updated signature to vector(768)
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_knowledge_fragments(
  query_embedding vector(768),
  match_count     INT     DEFAULT 8,
  filter_type     TEXT    DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  content       TEXT,
  source_file   TEXT,
  document_type TEXT,
  chunk_index   INT,
  tags          TEXT[],
  similarity    FLOAT
)
LANGUAGE SQL STABLE AS $$
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

-- -----------------------------------------------------------------------
-- 7. RPC: search_knowledge_fragments (full-text fallback — unchanged)
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_knowledge_fragments(
  query_text  TEXT,
  match_count INT  DEFAULT 8,
  filter_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  content       TEXT,
  source_file   TEXT,
  document_type TEXT,
  chunk_index   INT,
  tags          TEXT[],
  rank          FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    ts_rank(
      to_tsvector('english', kf.content),
      plainto_tsquery('english', query_text)
    ) AS rank
  FROM knowledge_fragments kf
  WHERE to_tsvector('english', kf.content) @@ plainto_tsquery('english', query_text)
    AND (filter_type IS NULL OR kf.document_type = filter_type)
  ORDER BY rank DESC
  LIMIT match_count;
$$;

-- -----------------------------------------------------------------------
-- 8. RLS + policies (all guarded)
-- -----------------------------------------------------------------------
ALTER TABLE knowledge_fragments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'knowledge_fragments'
    AND   policyname = 'Public read knowledge fragments'
  ) THEN
    CREATE POLICY "Public read knowledge fragments"
      ON knowledge_fragments FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename  = 'knowledge_fragments'
    AND   policyname = 'Service role full access knowledge_fragments'
  ) THEN
    CREATE POLICY "Service role full access knowledge_fragments"
      ON knowledge_fragments FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- -----------------------------------------------------------------------
-- 9. Stamp
-- -----------------------------------------------------------------------
COMMENT ON COLUMN knowledge_fragments.embedding
  IS 'text-embedding-004 (Gemini) · 768-dim · free tier · 2026-03-21';

