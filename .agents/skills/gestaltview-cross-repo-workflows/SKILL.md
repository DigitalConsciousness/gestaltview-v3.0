---
name: gestaltview-cross-repo-workflows
description: Design and maintain repeatable workflows that cross GestaltView repo boundaries. Use this skill for manifests, wiki refreshes, corpus handoffs, and coordination between runtime, compendium, and sibling product lanes.
---

# Cross-Repo Workflows

Last reviewed: 2026-03-29

Use this when the answer needs an operating procedure, not just a one-off repo map. The workflow should be expressed in terms of files and scripts that already exist in `gestaltview-v2`.

## Inspect first
- `README.md`
- `docs/ContinuityStack.md`
- `docs/Workflows.md`
- `scripts/generate_repo_manifest.py`
- `scripts/test-manifest-sync.sh`
- `config/corpus-map.json`
- `docs/gestaltview-v2.manifest.json`

## Current integrations
- Manifest generation and workflow docs are the local operating backbone for cross-repo coordination.
- Sibling repo references should resolve to concrete outputs such as manifests, wikis, or handoff notes rather than vague archive names.
- Supabase often acts as the integration layer when corpus, skills, or Billy context crosses repo lines.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-repo-onboarding`
- `gestaltview-current-state-maintenance`
- `gestaltview-manifest-indexing`

## Done when
- Workflow steps map to real scripts, manifests, and docs in this repo.
- Ownership and next actions are explicit whenever another repo is involved.
