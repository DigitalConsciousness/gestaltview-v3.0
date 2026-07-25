# Schema surfaces

## Contract and validation files

- `test/api/schema-contract.test.ts`
- `TS Files/billy-runtime.ts`
- `scripts/ingest_corpus.py`
- `CurrentState.md`

## Schema source collections

- `Schema/` — schema notes, exports, HTML/docx/text variants, helper scripts.
- `Prisma/` — Prisma schema variants and backups.

## Heuristics

- Prefer actively referenced test-backed shapes over older exported schema artifacts.
- Treat duplicate or date-stamped schema exports as context, not automatically canonical.
- When in doubt, use the runtime types plus tests to infer the active contract.
