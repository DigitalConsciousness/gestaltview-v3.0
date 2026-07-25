---
name: gestaltview-exhibit-prototyping
description: Build or refine exhibit-heavy and showcase-oriented surfaces in `gestaltview-v2`. Use this skill for museum, showcase, and experiential UI work that should land inside the live app rather than in a detached prototype folder.
---

# GestaltView Exhibit Prototyping

Last reviewed: 2026-03-29

Use this for exhibit-style UI work, rapid prototypes, and public experiential pages inside the current app. The goal is to make bold surfaces that still fit the real runtime architecture.

## Inspect first
- `client/src/pages/ExhibitsIndex.tsx`
- `client/src/components/exhibits`
- `client/src/components/RapidPrototypeEngine.tsx`
- `client/src/components/HeroCanvas.tsx`
- `client/src/App.tsx`

## Current integrations
- Exhibits are routed React experiences with motion, 3D, and narrative-heavy components where present.
- Billy and context copy often intersect exhibit work and must stay aligned with shared runtime behavior.
- Supabase only matters when an exhibit captures user data, submissions, or gated interactions.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-artifact-creator`
- `gestaltview-app-runtime`
- `gestaltview-context-architecture`

## Done when
- Prototype or exhibit work fits the live route and component architecture.
- Any data, auth, or Billy dependency is explicit and implemented in the matching subsystem.
