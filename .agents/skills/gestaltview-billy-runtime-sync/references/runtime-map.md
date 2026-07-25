# Runtime map

## Primary files

- `TS Files/billy-runtime.ts`
- `api/billy.ts`
- `api/_lib/supabase.ts`
- `test/api/schema-contract.test.ts`
- `test/api/billy.test.ts`
- `AIFlow.md`
- `ArchitecturalStructure.md`
- `CurrentState.md`

## Responsibilities

- Runtime types and helper functions live in `TS Files/billy-runtime.ts`.
- API wrappers and convenience behavior live under `api/`.
- Contract expectations are enforced in `test/api/`.
- Root docs describe the intended production flow and ownership.

## Change taxonomy

- **Low risk:** docs-only clarification, comments, non-behavioral naming cleanup.
- **Medium risk:** test-only updates or prompt wording changes.
- **High risk:** type changes, package inference changes, retrieval parameter changes, schema-version changes.

## Validation expectation

Run Billy and schema tests together after meaningful runtime changes.
