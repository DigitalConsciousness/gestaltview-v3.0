-- Source: supabase_schema.zip/supabase/migrations/20260327094500_align_fragment_embeddings_to_768.sql
-- Canonicalized filename: 20260327094500_align_fragment_embeddings_to_768.sql

-- GestaltView — Align fragment retrieval to 768-dim EmbeddingGemma / text-embedding-004
-- Migration: 20260327094500_align_fragment_embeddings_to_768.sql
-- 2026 Keith Soyka · GestaltView
--
-- WHY:
-- - Ingestion moved to 768-dim embeddings (`google/embeddinggemma-300m` / Gemini `text-embedding-004`)
-- - Billy queries both knowledge_fragments and skill_fragments with one query vector
-- - Older checked-in schema/RPCs still encoded some 1536-dim signatures
--
-- RESULT:
-- - embeddings, knowledge_fragments, and skill_fragments all align to vector(768)
-- - match_knowledge_fragments and match_skill_fragments both accept vector(768)

create extension if not exists vector;

alter table if exists embeddings
  alter column embedding type vector(768);

alter table if exists knowledge_fragments
  alter column embedding type vector(768);

alter table if exists skill_fragments
  alter column embedding type vector(768);

drop index if exists embeddings_hnsw_idx;
drop index if exists idx_knowledge_fragments_embedding;
drop index if exists knowledge_fragments_embedding_idx;
drop index if exists idx_skill_fragments_embedding;
drop index if exists skill_fragments_embedding_idx;

create index if not exists knowledge_fragments_embedding_idx
  on knowledge_fragments using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists skill_fragments_embedding_idx
  on skill_fragments using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create or replace function match_knowledge_fragments(
  query_embedding vector(768),
  match_count int default 8,
  filter_type text default null,
  filter_package text default null
)
returns table (
  id uuid,
  content text,
  source_file text,
  document_type text,
  chunk_index int,
  tags text[],
  similarity float
)
language sql stable
set search_path = public, extensions
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
    and (filter_type is null or kf.document_type = filter_type)
    and (filter_package is null or kf.tags @> array[filter_package])
  order by kf.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function match_skill_fragments(
  query_embedding vector(768),
  match_count int default 8,
  filter_skill text default null
)
returns table (
  id uuid,
  content text,
  source_file text,
  skill_name text,
  chunk_index int,
  tags text[],
  similarity float
)
language sql stable
set search_path = public, extensions
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
      or sf.tags @> array[filter_skill]
    )
  order by sf.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function matchknowledgefragments(
  queryembedding vector(768),
  matchcount int default 8,
  filtertype text default null,
  filterpackage text default null
)
returns table (
  content text,
  sourcefile text,
  similarity float,
  chunkindex int,
  documenttype text,
  tags text
)
language sql stable
set search_path = public, extensions
as $$
  select
    m.content,
    m.source_file as sourcefile,
    m.similarity,
    m.chunk_index as chunkindex,
    m.document_type as documenttype,
    array_to_string(m.tags, ',') as tags
  from match_knowledge_fragments(queryembedding, matchcount, filtertype, filterpackage) m;
$$;

comment on column embeddings.embedding
  is '768-dim retrieval embedding aligned to EmbeddingGemma / text-embedding-004.';

comment on column knowledge_fragments.embedding
  is '768-dim retrieval embedding aligned to EmbeddingGemma / text-embedding-004.';

comment on column skill_fragments.embedding
  is '768-dim retrieval embedding aligned to EmbeddingGemma / text-embedding-004.';
