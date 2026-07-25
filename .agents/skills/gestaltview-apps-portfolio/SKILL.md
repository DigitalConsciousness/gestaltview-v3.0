---
name: gestaltview-apps-portfolio
description: Map GestaltView's current product lanes and integrated demos as they exist in `gestaltview-v2`. Use this skill when the task is about the live portfolio map, route inventory, or how sibling products are represented in the public runtime.
---

# GestaltView Apps And Portfolio

Last reviewed: 2026-03-29

Use this when the question is 'what exists right now?' rather than how a single subsystem works. The portfolio is expressed through routes, demos, and documentation in `gestaltview-v2`, with other repos referenced as integrations or handoffs.

## Inspect first
- `README.md`
- `client/src/App.tsx`
- `client/src/pages/Home.tsx`
- `client/src/components/ResumeRockstarDemo.tsx`
- `client/src/components/SymbioCoderDemo.tsx`
- `docs/wikis`

## Current integrations
- The live portfolio is route-based, not maintained as a separate in-repo registry.
- Product-lane claims must match the current demos, exhibit pages, pricing surfaces, and routed entry points in `client/src/`.
- Supabase only enters portfolio work when tiering, authentication, or data storage is part of the lane being described.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-ecosystem-orchestrator`
- `gestaltview-app-runtime`
- `gestaltview-cross-repo-workflows`

## Done when
- The product map matches the current route and demo surfaces in this repo.
- Cross-repo references are labeled as integrations, not local implementations.
