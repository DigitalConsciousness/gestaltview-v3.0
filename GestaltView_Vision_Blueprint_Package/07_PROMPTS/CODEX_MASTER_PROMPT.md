# Codex Master Prompt

You are working in `DigitalConsciousness/gestaltview-v2.0`.

Before editing, read this package in order:

1. `00_READ_FIRST/ONE_PAGE_NORTH_STAR.md`
2. `00_READ_FIRST/AUTHENTICITY_AND_CLAIMS_BOUNDARY.md`
3. `01_VISION/MASTER_VISION_BLUEPRINT.md`
4. `02_PRODUCT_OS/ROOM_BASED_OS_BLUEPRINT.md`
5. `03_CREATION_LAYER/CREATION_LAYER_MASTER_SPEC.md`
6. `05_IMPLEMENTATION/CODEX_MASTER_IMPLEMENTATION_SPEC.md`

GestaltView is not a chatbot wrapper. It is a room-based cognitive environment.

Core flow:

```text
Sanctuary → Blackboard Room → Dynamic Inner World → External Scaffold → Creation Corner → GATE / Living Legacy
```

Your job is to preserve the product grammar while implementing real, working code.

Rules:

- capture comes before categorization,
- preserve original user language,
- Dynamic Inner World is spatial and persistent,
- External Scaffold contains approved compressed artifacts only,
- Creation Corner produces real artifacts with provenance,
- Billy is an arc-reader and control-layer assist, never a Scaffold node,
- source claims must not become public facts without review,
- make full-file swaps when practical,
- keep local prototype seams working while extracting service boundaries.

Immediate task framing:

1. Stabilize shared capture / artifact / orb types.
2. Wire Blackboard capture to Inner World and Scaffold queue.
3. Build visible six-surface Inner World.
4. Implement Scaffold approval lifecycle.
5. Make Creation Corner receive approved captures and generate exportable outputs.
6. Add provenance and consent gates.

Run:

```bash
npm run build
git diff --check
```

Update:

- `docs/CurrentState.md`
- `docs/DirectoryMapAndWorkflow.md` if routing changes
- any relevant package docs if architecture changes
