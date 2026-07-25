---
name: gestaltview-repo-onboarding
description: Orient agents and operators inside the current `gestaltview-v2` repository. Use this skill when starting work, choosing first-read files, or explaining the fastest current path into the live runtime and current issue queue.
---

# GestaltView Repo Onboarding

Last reviewed: 2026-06-01

Use this when entering the repo and needing a minimal, current path to productive work. It should steer people into live runtime surfaces before they touch older docs or auxiliary folders.

## Inspect first
- `README.md`
- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/README.md`
- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/ONE_PAGE_NORTH_STAR.md`
- `docs/ContinuityStack.md`
- `docs/Workflows.md`
- `docs/CurrentState.md`
- `docs/ContextPersistenceChecklist.md`
- `docs/SessionHandoffPacket.md`
- `docs/ContextPersistenceProtocol.md`
- `Tuesday.md`
- `client/src/App.tsx`
- `package.json`
- `.agents/skills/INDEX.md`

## Current integrations
- Onboarding spans root docs, route map, scripts, and the presence of API and Supabase surfaces.
- The current issue queue lives in `Tuesday.md`, while `docs/CurrentState.md` and the context-persistence docs capture the active operational truth and handoff state.
- `GestaltView_Vision_Blueprint_Package/` is now a first-read doctrine source whenever onboarding work could affect room contracts, module language, governance, Creation Corner, Billy, or DI boundaries.
- The skills catalog and workflow docs shape how follow-up work is executed after orientation.
- Cross-repo references should be noted early but not confused with local ownership.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-repo-map`
- `gestaltview-vision-blueprint`
- `gestaltview-agents-context`
- `gestaltview-ecosystem-orchestrator`

## Done when
- The onboarding path points at the current repo rather than the old compendium layout.
- First-read docs and commands are all current and local.
