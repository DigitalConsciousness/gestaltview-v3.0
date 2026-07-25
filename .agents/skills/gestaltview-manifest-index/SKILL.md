---
name: gestaltview-manifest-index
description: Work on the implementation side of GestaltView's retrieval layer in `gestaltview-v2`. Use this skill for fragment tables, embedding dimensions, search RPCs, and tools that retrieve grounded context into Billy or related consumers.
---

# GestaltView Manifest Index

Last reviewed: 2026-03-29

Use this for the retrieval implementation itself rather than higher-level manifest navigation. The important sources are the current Supabase schema, Billy API helper layer, and ingestion tools.

## Inspect first
- `tools/retrieve_manifest_context.ts`
- `api/_lib/supabase.ts`
- `scripts/ingest_corpus.py`
- `supabase/schema.sql`
- `supabase/migrations/20260327094500_align_fragment_embeddings_to_768.sql`

## Current integrations
- The current retrieval stack uses `knowledge_fragments`, `skill_fragments`, and 768-dimensional vectors.
- Billy and external tools consume the same Supabase RPC layer for semantic retrieval plus text fallback.
- Package filtering and source attribution are part of the live contract and should not be dropped in docs or helper code.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-corpus-ingestion`
- `gestaltview-schema-supabase`
- `gestaltview-billy-api`

## Done when
- Retrieval docs match the current Supabase table and RPC reality.
- Embedding dimensions, package filtering, and fallback behavior stay accurate.
