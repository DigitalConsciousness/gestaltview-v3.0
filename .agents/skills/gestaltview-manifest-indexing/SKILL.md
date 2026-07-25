---
name: gestaltview-manifest-indexing
description: Maintain the metadata and navigation side of GestaltView's manifest layer in `gestaltview-v2`. Use this skill for repo manifests, route inventories, doc indexes, and the files that turn the repo into navigable context.
---

# GestaltView Manifest Indexing

Last reviewed: 2026-03-29

Use this for manifest and index metadata design, not low-level retrieval tables. Generated manifests are valuable outputs here, but they should never replace direct inspection of the underlying source files.

## Inspect first
- `scripts/generate_repo_manifest.py`
- `docs/gestaltview-v2.manifest.json`
- `docs/gestaltview-v2.manifest.md`
- `docs/Manifest.md`
- `config/MANIFESTINGEST.md`

## Current integrations
- Manifest generation scans app, API, shared, scripts, docs, and Supabase surfaces from the repo root.
- Generated outputs feed wiki, cross-repo, and retrieval-context workflows without becoming the only source of truth.
- Supabase and retrieval details should be described using the manifest only when backed by live schema and config files.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-manifest-index`
- `gestaltview-cross-repo-workflows`
- `gestaltview-workflow-operations`

## Done when
- Manifest and index docs reference the current generators and outputs.
- Generated files are treated as artifacts that summarize reality, not reality itself.
