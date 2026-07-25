-- GestaltView portable schema migration package
-- Generated from supabaseSchema.md at 2026-06-12T02:31:56+00:00
-- Source SHA256: 95af30d1a98f922ca55e32ec8f8401ab4a1401e52f60b9262ffcb9e292601df0
--
-- Design stance:
-- - This package creates a portable baseline for new Supabase/Postgres-compatible databases.
-- - It preserves tables, columns, primary keys, unique constraints, jsonb, arrays, and vector columns.
-- - It intentionally does NOT invent foreign keys or enum values that were not present in the source schema export.
-- - Custom enum-looking types are created as TEXT domains for portability; tighten them later when values are canonical.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Supabase usually supports pgvector. If the target does not, this creates a TEXT-domain fallback
-- named vector so the relational schema can still be applied. Use adapters/split_vector for real search.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
  WHEN undefined_file THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'vector' AND n.nspname = 'public'
    ) THEN
      CREATE DOMAIN public.vector AS text;
    END IF;
    RAISE NOTICE 'pgvector extension unavailable; created public.vector TEXT domain fallback.';
END $$;

DO $$ BEGIN
  CREATE DOMAIN "agent_code_generation_mode" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "agent_code_review_status" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "agent_knowledge_link_scope" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "agent_knowledge_link_type" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "agent_manifest_entry_type" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "agent_manifest_status" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "agent_memory_retention_policy" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "agent_memory_type" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "agent_relationship_type" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "archive_policy" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "collaborative_space_role" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "context_view_scope" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "embodiment_mutation_risk_level" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "embodiment_mutation_status" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "embodiment_mutation_type" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "evidence_source_type" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "identity_mutation_risk_level" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "identity_mutation_status" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "identity_mutation_type" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "identity_review_decision" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "identity_subject_kind" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "knowledge_asset_status" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "knowledge_asset_type" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "knowledge_asset_visibility" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "knowledge_classification" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "memory_kind" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "mutation_class" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "owner_scope" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "preference_kind" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE DOMAIN "review_status" AS text;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

