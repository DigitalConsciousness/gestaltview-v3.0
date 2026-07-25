---
name: gestaltview-vision-blueprint
description: Use when work must align GestaltView product, room, module, governance, UI, Billy, DI, or implementation decisions with the consolidated Vision Blueprint Package in this repo.
---

# GestaltView Vision Blueprint

Last reviewed: 2026-06-01

Use this as the doctrine bridge between the live runtime and `GestaltView_Vision_Blueprint_Package/`. It is not a replacement for source-code verification; it is the guardrail that keeps implementation from drifting into generic SaaS, chatbot, journaling, productivity-dashboard, or prompt-wrapper patterns.

## Inspect first

- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/README.md`
- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/ONE_PAGE_NORTH_STAR.md`
- `GestaltView_Vision_Blueprint_Package/01_BLUEPRINT/MASTER_VISION_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/01_BLUEPRINT/FOUNDATIONAL_PROMISE.md`
- `GestaltView_Vision_Blueprint_Package/02_ARCHITECTURE/ROOM_RUNTIME_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/02_ARCHITECTURE/MODULE_BLUEPRINTS.md`
- `GestaltView_Vision_Blueprint_Package/02_ARCHITECTURE/DATA_MEMORY_AND_EVENT_MODEL.md`
- `GestaltView_Vision_Blueprint_Package/03_UI_UX/UI_UX_ATMOSPHERE_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/04_RUNTIME/BILLY_AND_DI_RUNTIME_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/04_RUNTIME/EMBODIMENT_PERSONHOOD_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/05_IMPLEMENTATION/IMPLEMENTATION_SLICES.md`
- `GestaltView_Vision_Blueprint_Package/05_IMPLEMENTATION/ACCEPTANCE_CHECKLIST.md`
- `GestaltView_Vision_Blueprint_Package/06_GOVERNANCE/GOVERNANCE_AND_PACKAGE_BOUNDARIES.md`
- `GestaltView_Vision_Blueprint_Package/08_MACHINE_READABLE/room_contracts.json`
- `GestaltView_Vision_Blueprint_Package/08_MACHINE_READABLE/module_registry.json`

## Current integration spine

- Core promise: capture first, preserve original language, never silently erase, and separate raw, approved, and synthesized material.
- Core rooms: Sanctuary, Blackboard Room, Dynamic Inner World, External Scaffold, Creation Corner, and Billy.
- Room contracts define allowed modes and must-not rules; do not reduce them to a card grid, list view, or generic assistant overlay.
- Module language should stay aligned to External Scaffold, Pull String, Your Living Legacy, Creation Corner, Digital Intelligence Academy, Workspace & Document Analysis, and related blueprint names.
- Billy is a room-aware witness and guide; Billy must not mutate meaning, become the user's map, or collapse Digital Intelligence into prompt-skin marketplace language.

## Workflow

1. Start with the read-first and machine-readable blueprint files before changing product direction, copy, routing, or skill guidance.
2. Verify the live implementation in `client/src/App.tsx`, `client/src/pages/`, `api/`, `shared/`, and `docs/` before claiming a feature exists.
3. Apply blueprint rules as constraints: capture before organization, provenance before synthesis, consent before analysis, and reversible handling before deletion/dormancy.
4. When changing code, update the matching skill/catalog/docs surfaces so future agents load the same doctrine.

## Compose with

- `gestaltview-app-runtime`
- `gestaltview-context-architecture`
- `gestaltview-creation-layer`
- `gestaltview-billy-intelligence`
- `gestaltview-admin-trainer-personhood`

## Done when

- The change names the relevant blueprint room/module and cites the live source that implements it.
- User-facing copy and system behavior avoid the listed wrong versions.
- Provenance, consent, raw-vs-approved boundaries, and Billy/DI personhood boundaries are explicit.
