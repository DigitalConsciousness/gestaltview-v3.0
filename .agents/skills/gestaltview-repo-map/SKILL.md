---
name: gestaltview-repo-map
description: Map the actual `gestaltview-v2` repository before making changes. Use this skill for fast orientation, source-of-truth discovery, and distinguishing live runtime surfaces from generated or supporting artifacts.
---

# GestaltView Repo Map

Last reviewed: 2026-03-29

Use this skill to get factual orientation inside `gestaltview-v2` before editing. It should reflect the current directory tree and route or data surfaces, not the old compendium archive layout.

## Inspect first
- `README.md`
- `client/src/App.tsx`
- `api`
- `scripts`
- `supabase`
- `docs`
- `.agents/skills/INDEX.md`

## Current integrations
- Route map, API handler list, scripts, docs, and Supabase files together define the real repository.
- Generated manifests are helpful but should not replace direct inspection of the tree.
- Supabase is part of the core repo map because auth, pricing, retrieval, and migrations all depend on it.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-repo-onboarding`
- `gestaltview-agents-context`
- `gestaltview-workflow-operations`

## Done when
- Orientation output is grounded in current files.
- Canonical, generated, and archived or auxiliary material are clearly separated.
