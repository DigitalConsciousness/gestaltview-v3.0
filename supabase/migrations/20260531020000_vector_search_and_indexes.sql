-- Source: supabase_schema.zip/supabase/migrations/20260531020000_vector_search_and_indexes.sql
-- Canonicalized filename: 20260531020000_vector_search_and_indexes.sql

-- =============================================================================
-- Migration: 20260531020000_vector_search_and_indexes.sql
-- Purpose  : Enable pgvector similarity search for the Generative Engine.
--            Creates match_memories RPC used by MemoryEntryRepository.
--            Adds performance indexes for bucket_drops, inner_world_artifacts.
-- Safe to re-run: all operations guarded with IF NOT EXISTS / OR REPLACE.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enable pgvector (idempotent)
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- 2. Ensure memory_entries.embedding is typed as vector(768)
--    (Only runs ALTER if the column exists as USER-DEFINED / untyped)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'memory_entries'
      AND column_name  = 'embedding'
      AND data_type    = 'USER-DEFINED'
  ) THEN
    ALTER TABLE memory_entries
      ALTER COLUMN embedding TYPE vector(768)
      USING embedding::vector(768);
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 3. match_memories RPC — cosine similarity search
--    Called by: MemoryEntryRepository.search_by_embedding
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding  vector(768),
  match_threshold  float,
  match_count      int,
  user_id_filter   text
)
RETURNS TABLE (
  id          uuid,
  user_id     text,
  title       text,
  content     text,
  similarity  float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.id,
    me.user_id,
    me.title,
    me.content,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM memory_entries me
  WHERE me.user_id = user_id_filter
    AND me.embedding IS NOT NULL
    AND 1 - (me.embedding <=> query_embedding) >= match_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. IVFFlat index for fast approximate cosine search on memory_entries
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_memory_entries_embedding
  ON memory_entries
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ---------------------------------------------------------------------------
-- 5. Supporting indexes for bucket_drops and inner_world_artifacts
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bucket_drops_stage_user
  ON bucket_drops (user_id, stage);

CREATE INDEX IF NOT EXISTS idx_inner_world_artifacts_user
  ON inner_world_artifacts (user_id, status);

-- ---------------------------------------------------------------------------
-- 6. Index for di_memory_events per-session retrieval
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_di_memory_events_session
  ON di_memory_events (session_id, created_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_di_memory_events_user_slug
  ON di_memory_events (user_id, di_slug, significance DESC NULLS LAST);

COMMENT ON FUNCTION match_memories IS
  'pgvector cosine similarity search for memory_entries. Used by MemoryEntryRepository.search_by_embedding.';
