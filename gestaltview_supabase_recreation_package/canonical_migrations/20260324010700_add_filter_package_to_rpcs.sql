-- Source: supabase_schema.zip/supabase/migrations/20260324010700_add_filter_package_to_rpcs.sql
-- Canonicalized filename: 20260324010700_add_filter_package_to_rpcs.sql

-- Migration: 20260324010700_add_filter_package_to_rpcs
-- Adds filter_package (tags array filter) to match_knowledge_fragments and
-- search_knowledge_fragments so the API can push package constraints into the
-- database instead of filtering in JavaScript post-retrieval.
--
-- Also updates the camelCase compat wrappers to pass the new param through.
-- Fully backward-compatible: filter_package defaults to NULL (no filter).

-- ─── match_knowledge_fragments (cosine similarity) ──────────────────────────

create or replace function match_knowledge_fragments(
  query_embedding vector(1536),
  match_count      int     default 8,
  filter_type      text    default null,
  filter_package   text    default null
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
    and (filter_type    is null or kf.document_type  = filter_type)
    and (filter_package is null or kf.tags            @> array[filter_package])
  order by kf.embedding <=> query_embedding
  limit match_count;
$$;

-- ─── search_knowledge_fragments (full-text search) ──────────────────────────

create or replace function search_knowledge_fragments(
  query_text     text,
  match_count    int     default 8,
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
  where to_tsvector('english', kf.content) @@ plainto_tsquery('english', query_text)
    and (filter_type    is null or kf.document_type = filter_type)
    and (filter_package is null or kf.tags          @> array[filter_package])
  order by rank desc
  limit match_count;
$$;

-- ─── camelCase compat wrappers (pass new param through) ─────────────────────

create or replace function matchknowledgefragments(
  queryembedding vector(1536),
  matchcount     int    default 8,
  filtertype     text   default null,
  filterpackage  text   default null
)
returns table (
  content      text,
  sourcefile   text,
  similarity   float,
  chunkindex   int,
  documenttype text,
  tags         text
)
language sql stable
as $$
  select
    m.content,
    m.source_file   as sourcefile,
    m.similarity,
    m.chunk_index   as chunkindex,
    m.document_type as documenttype,
    array_to_string(m.tags, ',') as tags
  from match_knowledge_fragments(queryembedding, matchcount, filtertype, filterpackage) m;
$$;

create or replace function searchknowledgefragments(
  querytext     text,
  matchcount    int    default 8,
  filtertype    text   default null,
  filterpackage text   default null
)
returns table (
  content      text,
  sourcefile   text,
  rank         float,
  chunkindex   int,
  documenttype text,
  tags         text
)
language sql stable
as $$
  select
    s.content,
    s.source_file   as sourcefile,
    s.rank,
    s.chunk_index   as chunkindex,
    s.document_type as documenttype,
    array_to_string(s.tags, ',') as tags
  from search_knowledge_fragments(querytext, matchcount, filtertype, filterpackage) s;
$$;
