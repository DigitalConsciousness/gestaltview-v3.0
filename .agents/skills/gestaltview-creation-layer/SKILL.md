---
name: gestaltview-creation-layer
description: Use when working on Creation Corner, multimodal artifact generation, generated artifact provenance, Art Teacher presence, gen-engine APIs, or routing outputs into Dynamic Inner World, External Scaffold, GATE, or exports.
---

# GestaltView Creation Layer

Last reviewed: 2026-06-01

Use this for the live Creation Corner and multimodal generation lane. The purpose is a room-native workshop: approved sources become reviewable artifacts with provenance, consent, deterministic fallbacks, and destination routing. Do not turn it into a generic prompt box or an unbounded generate-anything surface.

## Inspect first

- `GestaltView_Vision_Blueprint_Package/10_CREATION_LAYER/README.md`
- `GestaltView_Vision_Blueprint_Package/10_CREATION_LAYER/CREATION_CORNER_INTEGRATION_ADDENDUM.md`
- `GestaltView_Vision_Blueprint_Package/10_CREATION_LAYER/MULTIMODAL_CREATION_ENGINE_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/10_CREATION_LAYER/ART_TEACHER_AND_LIVE_DI_PRESENCE.md`
- `GestaltView_Vision_Blueprint_Package/10_CREATION_LAYER/CREATION_LAYER_CODEX_SPEC.md`
- `GestaltView_Vision_Blueprint_Package/08_MACHINE_READABLE/creation_layer_contracts.json`
- `shared/gen-engine/types.ts`
- `shared/gen-engine/core.ts`
- `api/gen-engine/`
- `api/creation-corner/blueprints.ts`
- `api/inner-world/artifacts.ts`
- `api/inner-world/files.ts`
- `client/src/pages/CreationCornerPage.tsx`

## Current integrations

- `shared/gen-engine/types.ts` owns source-room, consent, artifact, destination, synthesis-style, and provenance vocabulary.
- `shared/gen-engine/core.ts` owns deterministic health, fusion, resonance, artifact generation, ambient scan, export formatting, and bundle fallbacks.
- `api/gen-engine/*` exposes health, fusion, resonance, learning, prediction, lightning capture, artifact generation, and ambient scanning.
- `api/creation-corner/blueprints.ts` persists blueprint drafts for the room.
- `api/inner-world/artifacts.ts` and `api/inner-world/files.ts` are destination seams for made things.
- `client/src/pages/CreationCornerPage.tsx` is the current UI anchor for approved captures, blueprint drafting, output lanes, copy/download, and Neural Aurora treatment.

## Guardrails

- Require source material, source IDs, or explicit thin-source warnings before generation.
- Preserve original captures; generated artifacts are derivatives, not replacements.
- Keep consent fields visible when text, image, audio, video, emotion inference, or derivative signal storage are involved.
- Distinguish deterministic fallback behavior from model-assisted generation.
- Anchor the Art Teacher to the room/workbench; do not make it a floating generic assistant.
- Route outputs deliberately: Creation Corner, Dynamic Inner World, External Scaffold pending, download-only, or GATE package draft.

## Workflow

1. Load the Creation Layer supplement and `creation_layer_contracts.json` before changing artifacts or room behavior.
2. Verify whether the task is UI, shared contract, API, persistence, export, or destination routing.
3. Update shared types before API/client code when fields or artifact contracts change.
4. Run the lightest meaningful validation and update catalog/docs if the room contract changes.

## Compose with

- `gestaltview-vision-blueprint`
- `gestaltview-app-runtime`
- `gestaltview-schema-contracts`
- `gestaltview-manifest-index`
- `gestaltview-artifact-creator`

## Done when

- Artifacts carry provenance, consent posture, source links, destination, and content format.
- UI and API behavior match the blueprint's workshop/growing-chamber model.
- Dynamic Inner World, External Scaffold, GATE, and export paths are explicit rather than implied.
