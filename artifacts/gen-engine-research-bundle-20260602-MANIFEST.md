# Gen Engine Research Bundle — 2026-06-02

This bundle collects the live GestaltView gen-engine implementation and adjacent Creation Corner wiring for research and collaboration.

## Included Areas

- Shared TypeScript engine contracts and deterministic core logic: `shared/gen-engine/`
- Vercel API routes: `api/gen-engine/`
- Creation Corner compatibility and blueprint endpoints: `api/creation-corner/`
- Dynamic Inner World destination seams: `api/inner-world/artifacts*`, `api/inner-world/files*`
- Client gen-engine adapters and room wiring: `client/src/lib/genEngineClient.ts`, `client/src/lib/genEngineRoomWiring.ts`
- Creation Corner page and workbench surfaces: `client/src/pages/CreationCornerPage.tsx`, `client/src/components/BlueprintGenerativeWorkbench.tsx`
- Blackboard and Dynamic Inner World integration surfaces that call the room wiring
- Focused tests for API, compatibility, room wiring, and Creation Corner controls
- Legacy/reference Python engines: `server/gestaltview_generative_engine.py`, `server/creation_corner_engine.py`
- Available specs/docs: `SPEC-GestaltView-Generative-Engine-v1.md`, `docs/GenerativeEngineIntegration.md`, `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/`
- Artifact creator reference assets under `.agents/skills/gestaltview-artifact-creator/`

## Not Present In This Checkout

The Creation Layer skill references `GestaltView_Vision_Blueprint_Package/10_CREATION_LAYER/` and `GestaltView_Vision_Blueprint_Package/08_MACHINE_READABLE/creation_layer_contracts.json`, but those paths are not present in this repo checkout. The available local equivalent is `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/`.
