-- Billy Knowledge Repository — Supabase Schema Migration
-- Run this in the Supabase SQL Editor before running the ingestion pipeline
-- https://ltajayfzlaevchxngkrm.supabase.co

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Main knowledge fragments table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_fragments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content         TEXT NOT NULL,
  content_hash    TEXT UNIQUE,              -- SHA-256 of content for dedup
  embedding       VECTOR(768),              -- EmbeddingGemma / text-embedding-004 family
  source_file     TEXT NOT NULL,            -- original filename
  document_type   TEXT NOT NULL DEFAULT 'General',  -- Protocol, PLK, Billy, etc.
  chunk_index     INTEGER NOT NULL DEFAULT 0,
  total_chunks    INTEGER NOT NULL DEFAULT 1,
  char_count      INTEGER,
  tags            TEXT[] DEFAULT '{}',      -- concept tags array
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
-- Full-text search index on content
CREATE INDEX IF NOT EXISTS knowledge_fragments_content_fts
  ON knowledge_fragments
  USING GIN (to_tsvector('english', content));

-- Index on document_type for filtering
CREATE INDEX IF NOT EXISTS knowledge_fragments_doc_type_idx
  ON knowledge_fragments (document_type);

-- Index on tags for filtering
CREATE INDEX IF NOT EXISTS knowledge_fragments_tags_idx
  ON knowledge_fragments USING GIN (tags);

-- HNSW index on embedding for fast approximate nearest-neighbor search
CREATE INDEX IF NOT EXISTS knowledge_fragments_embedding_idx
  ON knowledge_fragments
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ─── Semantic search function ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_knowledge_fragments(
  query_embedding VECTOR(768),
  match_count     INT DEFAULT 8,
  filter_type     TEXT DEFAULT NULL
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
LANGUAGE SQL STABLE
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
  WHERE
    kf.embedding IS NOT NULL
    AND (filter_type IS NULL OR kf.document_type = filter_type)
  ORDER BY kf.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ─── Full-text search function (fallback when no embedding) ───────────────────
CREATE OR REPLACE FUNCTION search_knowledge_fragments(
  query_text  TEXT,
  match_count INT DEFAULT 8,
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
LANGUAGE SQL STABLE
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
  WHERE
    to_tsvector('english', kf.content) @@ plainto_tsquery('english', query_text)
    AND (filter_type IS NULL OR kf.document_type = filter_type)
  ORDER BY rank DESC
  LIMIT match_count;
$$;

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE knowledge_fragments ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for Billy's browser-side queries)
CREATE POLICY "Public read access"
  ON knowledge_fragments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── Stats view ───────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW knowledge_stats AS
SELECT
  document_type,
  COUNT(*) AS fragment_count,
  SUM(char_count) AS total_chars,
  COUNT(DISTINCT source_file) AS file_count,
  MAX(created_at) AS last_updated
FROM knowledge_fragments
GROUP BY document_type
ORDER BY fragment_count DESC;

COMMENT ON TABLE knowledge_fragments IS
  'Billy Knowledge Repository — GestaltView corpus fragments with embeddings for semantic search. Part of the Manifest Index Layer architecture.';
