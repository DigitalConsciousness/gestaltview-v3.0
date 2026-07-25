---
name: gestaltview-context-architecture
description: Explain GestaltView's mission, runtime boundaries, route map, Billy architecture, and design constraints using the current `gestaltview-v2` codebase. Use this skill when the task needs a canonical architectural explanation that matches present reality.
---

# GestaltView Context And Architecture

Last reviewed: 2026-06-01

Use this skill for system-level explanations that must survive technical scrutiny. Verify architecture from the repo because several older docs still lag the current route map, provider cascade, and Supabase shape.

## Inspect first
- `README.md`
- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/ONE_PAGE_NORTH_STAR.md`
- `GestaltView_Vision_Blueprint_Package/02_ARCHITECTURE/ROOM_RUNTIME_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/08_MACHINE_READABLE/room_contracts.json`
- `GestaltView_Vision_Blueprint_Package/08_MACHINE_READABLE/module_registry.json`
- `docs/ArchitecturalStructure.md`
- `docs/AIFlow.md`
- `docs/ContinuityStack.md`
- `docs/ContextPersistenceChecklist.md`
- `docs/SessionHandoffPacket.md`
- `docs/ContextPersistenceProtocol.md`
- `Tuesday.md`
- `client/src/App.tsx`
- `client/src/canonical`
- `shared/billy/runtime.ts`

## Current integrations
- Architecture spans a React and Vite client, Vercel API handlers, shared Billy modules, Supabase auth plus vector-search surfaces, and the Vision Blueprint room/module contract layer.
- The route map and product inventory live in `client/src/App.tsx` and the page tree under `client/src/pages/`.
- The current issue queue and handoff docs matter when architectural work crosses sessions, because they capture the live context that should not be reconstructed from memory.
- Canonical narrative docs under `client/src/canonical/` and `docs/` should not contradict what the runtime actually does.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-agents-context`
- `gestaltview-app-runtime`
- `gestaltview-vision-blueprint`
- `gestaltview-suite-orchestrator`

## Done when
- Architectural summaries match current source files and route inventory.
- Any stale documentation assumptions are corrected or explicitly called out.
