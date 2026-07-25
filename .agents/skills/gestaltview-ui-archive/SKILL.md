---
name: gestaltview-ui-archive
description: Navigate legacy and prototype UI ideas that still influence the current `gestaltview-v2` runtime. Use this skill when reviving older exhibit or showcase patterns and translating them into the modern app.
---

# GestaltView UI Archive

Last reviewed: 2026-03-29

In this repo, the archive is mostly older exhibit or demo components and design docs rather than a separate frozen UI repository. Use this skill to convert legacy ideas into current implementation guidance.

## Inspect first
- `client/src/pages/ExhibitsIndex.tsx`
- `client/src/components/exhibits`
- `client/src/components/HeroCanvas.tsx`
- `docs/GestaltView Framework_ Visual Architecture Compendium.md`
- `gv_design_spec_package`

## Current integrations
- Archived ideas should be translated into current React, Tailwind, and Babylon-friendly components when revived.
- Route inventory and design docs determine whether an idea is already live, partially live, or still conceptual.
- Supabase is not usually primary here unless revived UI adds auth, tiering, or persistent data flows.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-exhibit-prototyping`
- `gestaltview-artifact-creator`
- `gestaltview-app-runtime`

## Done when
- Archived concept status is honest and current.
- Any revived UI work points at present implementation surfaces rather than dead paths.
