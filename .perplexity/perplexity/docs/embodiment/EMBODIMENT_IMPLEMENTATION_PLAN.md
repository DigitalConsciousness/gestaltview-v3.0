# Embodiment Implementation Plan

## Phase 1: Inventory and framing

- Document the current profile registry.
- Record the runtime gaps without changing runtime code.
- Identify the contract boundaries that should remain untouched for Slice 1 and Slice 2.

## Phase 2: Validation hardening

- Add a standalone registry validator.
- Check slug format, slug/filename equality, duplicate slugs, required fields, generated sync, missing source profiles, and source profiles missing from generated output.
- Add package scripts for generation and validation.

## Phase 3: Artifact sync

- Regenerate `shared/embodiment/generated.ts` from the existing generator when source profiles change.
- Keep the generator as the source-of-truth writer until the runtime registry contract is intentionally redesigned.

## Phase 4: Runtime integration

- Introduce registry consumption guards in the runtime only after the profile registry itself is stable.
- Add room-aware digital intelligence integration in a later slice.
- Tighten shared types and index exports only when the next spec slice explicitly requires it.

## Acceptance Criteria for the Current Slice

- Documentation inventory files exist under `docs/embodiment/`.
- `npm run validate:embodiment` checks the registry and generated artifact.
- `npm run generate:embodiment` still uses the existing generator.
- `npm run build` remains green after the docs and script additions.
