-- Source: supabase_schema.zip/supabase/migrations/fix_rpc_conflict.sql
-- Canonicalized filename: 20260324010800_fix_rpc_conflict.sql

-- supabase/fix_rpc_conflict.sql — GestaltView v2
-- © 2026 Keith Soyka / GestaltView
--
-- RUN THIS IN SUPABASE SQL EDITOR (or via Management API).
--
-- Problem:  Two overloaded signatures exist for each RPC function,
--           causing PostgREST to return HTTP 300 (ambiguous function).
--
-- Fix:      Drop all overloads. Recreate as single canonical 4-param
--           versions with filter_package defaulting to NULL.
--           Fully backward-compatible — all existing callers work unchanged.
-- ============================================================

-- ── Step 1: Drop all overloads ───────────────────────────────────────────
drop function if exists match_knowledge_fragments(vector(1536), int, text);
drop function if exists match_knowledge_fragments(vector(1536), int, text, text);
drop function if exists search_knowledge_fragments(text, int, text);
drop function if exists search_knowledge_fragments(text, int, text, text);

-- ── Step 2: Canonical match_knowledge_fragments (vector similarity) ──────
create function match_knowledge_fragments(
  query_embedding  vector(1536),
  match_count      int     default 12,
  filter_type      text    default null,   -- document_type filter
  filter_package   text    default null    -- tags package filter
)
returns table (
  id            uuid,
  content       text,
  source_file   text,
  document_type text,
  chunk_index   int,
  tags          text[],
  similarity    float
)
language sql stable
as $$
  select
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    1 - (kf.embedding <=> query_embedding) as similarity
  from knowledge_fragments kf
  where kf.embedding is not null
    and (filter_type    is null or kf.document_type = filter_type)
    and (filter_package is null
         or kf.tags @> array[filter_package]
         or kf.tags @> array['package:' || filter_package])
  order by kf.embedding <=> query_embedding
  limit match_count;
$$;

-- ── Step 3: Canonical search_knowledge_fragments (full-text BM25) ────────
create function search_knowledge_fragments(
  query_text     text,
  match_count    int     default 12,
  filter_type    text    default null,
  filter_package text    default null
)
returns table (
  id            uuid,
  content       text,
  source_file   text,
  document_type text,
  chunk_index   int,
  tags          text[],
  rank          float
)
language sql stable
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
  from knowledge_fragments kf
  where to_tsvector('english', kf.content)
        @@ plainto_tsquery('english', query_text)
    and (filter_type    is null or kf.document_type = filter_type)
    and (filter_package is null
         or kf.tags @> array[filter_package]
         or kf.tags @> array['package:' || filter_package])
  order by rank desc
  limit match_count;
$$;

-- ── Verify ────────────────────────────────────────────────────────────────
-- Run this after applying the fix to confirm both RPCs resolve correctly:
--
-- select * from search_knowledge_fragments(
--   'Billy PLK consciousness', 3, null, null
-- );
--
-- select * from match_knowledge_fragments(
--   array_fill(0.0::float, array[1536])::vector(1536), 3, null, null
-- );

