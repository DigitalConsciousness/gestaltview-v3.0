---
name: gestaltview-corpus-ingestion
description: Maintain the ingestion path that turns external GestaltView corpus material into retrievable Supabase fragments. Use this skill when working on ingestion scripts, corpus maps, fragment tagging, embedding pipelines, or ingestion-facing docs.
---

# GestaltView Corpus Ingestion

Last reviewed: 2026-03-29

The corpus itself is often external to this repo, but the ingestion hooks and retrieval expectations are local. Use this skill for the current ingestion pipeline, not for stale seed scripts presented as canonical.

## Inspect first
- `scripts/ingest_corpus.py`
- `scripts/seed_billy_knowledge.py`
- `config/corpus-map.json`
- `api/_lib/supabase.ts`
- `supabase/schema.sql`

## Current integrations
- `scripts/ingest_corpus.py` is the current canonical ingestion pipeline and targets 768-dimensional embeddings.
- Legacy seed and migration scripts still exist and should be treated cautiously, especially when they hardcode credentials or old corpus paths.
- Supabase stores `knowledge_fragments`, `skill_fragments`, run metadata, and the RPC surfaces consumed by Billy and manifest tools.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-manifest-index`
- `gestaltview-schema-supabase`
- `gestaltview-cross-repo-workflows`

## Done when
- Ingestion guidance points to the current pipeline and schema surfaces.
- Legacy scripts are labeled as legacy instead of being presented as the primary path.
