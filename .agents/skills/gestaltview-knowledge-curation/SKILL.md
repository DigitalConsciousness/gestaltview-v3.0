---
name: gestaltview-knowledge-curation
description: Curate repo-local knowledge assets, canonical docs, and snapshot outputs that shape understanding of `gestaltview-v2`. Use this skill when organizing `client/src/canonical`, wiki outputs, manifests, and other local knowledge surfaces that feed people or retrieval systems.
---

# GestaltView Knowledge Curation

Last reviewed: 2026-03-29

In this repo, knowledge curation is mostly about distilled outputs rather than the full raw corpus. Use it to keep local canonical docs, wiki snapshots, and retrieval-facing metadata consistent.

## Inspect first
- `client/src/canonical`
- `docs/wikis`
- `docs/Manifest.md`
- `config/corpus-map.json`
- `scripts/ingest_corpus.py`

## Current integrations
- Curated docs feed both human understanding and retrieval pipelines.
- Manifest and corpus-map files determine how repo content is packaged or ingested for Billy and related tools.
- Supabase becomes relevant when curation changes what should exist in `knowledge_fragments` or `skill_fragments`.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-transcript-synthesis`
- `gestaltview-manifest-indexing`
- `gestaltview-cross-repo-sync`

## Done when
- Local canonical, snapshot, and cross-repo reference materials are clearly distinguished.
- Retrieval consequences are documented whenever curated content changes should alter ingestion or search.
