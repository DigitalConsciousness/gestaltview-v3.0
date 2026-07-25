---
name: gestaltview-cross-repo-sync
description: Coordinate factual synchronization between `gestaltview-v2` and companion repositories such as `GestaltView-Official-Compendium`, `Insight-Bot`, `SymbioCoder`, `Resume Rockstar`, and `GAICE`. Use this skill when source-of-truth or handoff boundaries need to be made explicit.
---

# GestaltView Cross-Repo Sync

Last reviewed: 2026-03-29

Use this when the work truly crosses repo boundaries. The job is to name ownership, artifacts, and follow-up paths clearly rather than to pretend unseen repos are mounted locally.

## Inspect first
- `README.md`
- `docs/CurrentState.md`
- `docs/gestaltview-v2.manifest.md`
- `config/corpus-map.json`
- `docs/wikis`

## Current integrations
- The runtime repo consumes corpus, evidence, and product context from sibling repos but does not automatically own those files.
- Manifest and wiki outputs help state what `gestaltview-v2` currently mirrors or references.
- Supabase retrieval can bridge external corpus material into local Billy flows, so sync claims should identify the data path instead of implying direct file access.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-cross-repo-workflows`
- `gestaltview-billy-runtime-sync`
- `gestaltview-current-state`

## Done when
- Every artifact names its source-of-truth repo and local consumption path.
- Cross-repo claims are grounded in local manifests, docs, or explicit handoff notes.
