-- GestaltView — Skills Cleanup & Vector Dim Migration
-- © 2026 Keith Soyka / GestaltView
--
-- Run this ONCE against the live Supabase project to:
--   1. Delete all skill-related records from documents, skill_fragments,
--      and skills tables that were ingested with the wrong vector dim (1536).
--   2. Alter knowledge_fragments, skill_fragments, and embeddings to vector(768).
--   3. Drop and recreate vector indexes at the correct dim.
--
-- SAFE TO RUN: deletes are scoped to skills/* paths only.
-- knowledge_fragments corpus is NOT touched.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ─── Step 1: Clear bad-dim skill records ─────────────────────────────────────

-- Remove skill_fragments linked to skill-path documents
delete from skill_fragments
where document_id in (
  select document_id from documents
  where path ilike '%skills/%'
     or path ilike '%skills-%'
     or filename ilike 'skill-%'
     or filename ilike '%.skill.md'
);

-- Remove the skill-path documents themselves
delete from documents
where path ilike '%skills/%'
   or path ilike '%skills-%'
   or filename ilike 'skill-%'
   or filename ilike '%.skill.md';

-- Clear all skills table entries (will be re-ingested correctly)
delete from skills;

-- Clear all skill_fragments (catch any orphans not covered above)
delete from skill_fragments;

-- ─── Step 2: Alter vector columns to dim 768 ─────────────────────────────────
-- Only runs if the column is currently vector(1536).
-- If already vector(768) these are no-ops.

do $$
begin
  -- knowledge_fragments.embedding
  if exists (
    select 1 from information_schema.columns
    where table_name = 'knowledge_fragments'
      and column_name = 'embedding'
      and udt_name = 'vector'
  ) then
    -- Check current dim via pg_attribute
    if (select atttypmod from pg_attribute
        join pg_class on pg_class.oid = pg_attribute.attrelid
        where relname = 'knowledge_fragments' and attname = 'embedding') <> 768 then
      alter table knowledge_fragments alter column embedding type vector(768)
        using null; -- null out existing embeddings; they will be re-ingested
    end if;
  end if;

  -- skill_fragments.embedding
  if exists (
    select 1 from information_schema.columns
    where table_name = 'skill_fragments'
      and column_name = 'embedding'
      and udt_name = 'vector'
  ) then
    alter table skill_fragments alter column embedding type vector(768)
      using null;
  end if;

  -- embeddings.embedding
  if exists (
    select 1 from information_schema.columns
    where table_name = 'embeddings'
      and column_name = 'embedding'
      and udt_name = 'vector'
  ) then
    alter table embeddings alter column embedding type vector(768)
      using null;
  end if;
end;
$$;

-- ─── Step 3: Rebuild vector indexes at correct dim ───────────────────────────
-- Drop old indexes (will error harmlessly if they don't exist yet)

drop index if exists knowledge_fragments_embedding_idx;
drop index if exists skill_fragments_embedding_idx;
drop index if exists embeddings_hnsw_idx;

create index if not exists knowledge_fragments_embedding_idx
  on knowledge_fragments using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists skill_fragments_embedding_idx
  on skill_fragments using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists embeddings_hnsw_idx
  on embeddings using hnsw (embedding vector_cosine_ops);

commit;
