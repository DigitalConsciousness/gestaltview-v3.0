-- GestaltView portable schema migration package
-- Generated from supabaseSchema.md at 2026-06-12T02:31:56+00:00
-- Source SHA256: 95af30d1a98f922ca55e32ec8f8401ab4a1401e52f60b9262ffcb9e292601df0
--
-- Design stance:
-- - This package creates a portable baseline for new Supabase/Postgres-compatible databases.
-- - It preserves tables, columns, primary keys, unique constraints, jsonb, arrays, and vector columns.
-- - It intentionally does NOT invent foreign keys or enum values that were not present in the source schema export.
-- - Custom enum-looking types are created as TEXT domains for portability; tighten them later when values are canonical.

-- Optional pgvector index starter. Uncomment/tune after dimensions and distance metric are confirmed.
-- For 768-d embeddings, define vector(768) columns in a stricter follow-up migration first.

-- CREATE INDEX IF NOT EXISTS "idx_embeddings_embedding_ivfflat" ON "embeddings" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS "idx_knowledge_fragments_embedding_ivfflat" ON "knowledge_fragments" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS "idx_skill_fragments_embedding_ivfflat" ON "skill_fragments" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS "idx_memory_entries_embedding_ivfflat" ON "memory_entries" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS "idx_knowledge_asset_chunks_embedding_ivfflat" ON "knowledge_asset_chunks" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS "idx_human_memory_records_embedding_ivfflat" ON "human_memory_records" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
