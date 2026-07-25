---
name: web-artifacts-builder
description: Build or refresh rich GestaltView artifact surfaces inside the current React runtime. Use this skill for exhibit-style artifacts, demo builds, and multi-component experiences that belong in `gestaltview-v2`, not as one-off standalone mockups.
---

# GestaltView Artifact Creator

Last reviewed: 2026-03-29

This folder now needs to point at actual GestaltView artifact surfaces instead of generic artifact advice. Treat artifact work as part of the existing app unless the task explicitly calls for a separate external deliverable.

## Inspect first
- `client/src/components/exhibits`
- `client/src/components/RapidPrototypeEngine.tsx`
- `client/src/pages/ExhibitsIndex.tsx`
- `client/src/index.css`
- `client/src/App.tsx`

## Current integrations
- Artifacts should land as React and Tailwind components within the live app rather than as orphan HTML files.
- Exhibit and prototype work often intersects Billy context, route wiring, and the public portfolio surfaces.
- Supabase only matters here when an artifact persists user data, gates access, or consumes live retrieval-backed state.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-exhibit-prototyping`
- `gestaltview-app-runtime`
- `gestaltview-context-architecture`

## Done when
- Artifact guidance points at current app surfaces and design patterns.
- Any live data, auth, or Billy dependency is explicit rather than implied.
