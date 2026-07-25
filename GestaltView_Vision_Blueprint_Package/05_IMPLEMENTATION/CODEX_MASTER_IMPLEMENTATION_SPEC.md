# Codex Master Implementation Spec

## Operating frame

You are not building a generic AI dashboard.

You are implementing a room-based cognitive environment with a safe capture layer, spatial expression layer, approved scaffold layer, and creation layer.

## Read first

1. `00_READ_FIRST/ONE_PAGE_NORTH_STAR.md`
2. `00_READ_FIRST/AUTHENTICITY_AND_CLAIMS_BOUNDARY.md`
3. `01_VISION/MASTER_VISION_BLUEPRINT.md`
4. `02_PRODUCT_OS/ROOM_BASED_OS_BLUEPRINT.md`
5. `03_CREATION_LAYER/CREATION_LAYER_MASTER_SPEC.md`
6. `04_UI_UX/SIGNATURE_ATMOSPHERE_BLUEPRINT.md`

## Immediate target

Lock the live runtime flow:

```text
Sanctuary
  → Blackboard Room
  → Dynamic Inner World
  → External Scaffold
  → Creation Corner
  → GATE / export / Living Legacy
```

## Priority order

1. Shared capture / orb / artifact contract.
2. Blackboard raw capture with multimodal-ready intake.
3. Dynamic Inner World six-surface spatial renderer.
4. External Scaffold pending queue and approval lifecycle.
5. Creation Corner artifact builder and output lanes.
6. Billy room-aware assist and provenance protection.
7. Source map and evidence-linked synthesis.
8. Governance boundaries for DI and packaged outputs.

## Do not

- rewrite the whole app,
- invent a new taxonomy,
- bury the user in setup,
- auto-organize material before capture,
- make Billy a Scaffold node,
- reintroduce Tribunal/persona visuals into External Scaffold,
- replace working prototype seams with half-finished backend migration,
- turn Creation Corner into a simple generator form,
- turn source claims into public facts.

## Build strategy

Start with full-file swaps where possible.

Preserve existing localStorage and CustomEvent handoffs while extracting a cleaner service layer.

Add types first, then components, then persistence.

## Validation

Run:

```bash
npm run build
git diff --check
```

Manual QA:

1. Add raw capture in Blackboard.
2. Save it.
3. Send one capture to Dynamic Inner World.
4. Confirm it appears spatially.
5. Send one artifact to External Scaffold.
6. Approve it.
7. Confirm it becomes a Scaffold artifact.
8. Send approved material to Creation Corner.
9. Generate markdown / HTML / prompt / code output.
10. Confirm source provenance remains visible.
11. Confirm Billy is assistive, not a visible Scaffold object.
12. Confirm rejecting a pending orb does not delete the raw source.
