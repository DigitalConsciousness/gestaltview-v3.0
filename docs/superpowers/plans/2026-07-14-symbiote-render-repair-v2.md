# Symbiote Render Repair v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the v2 Symbiote render repair into canonical repository paths, preserving source artifacts and producing durable, owner-scoped render receipts without applying or deploying the database migration.

**Architecture:** Reconcile the packaged full-file replacements into the existing API, shared orchestration, rendering package, and client helper. The API remains the persistence boundary; deterministic adapters create files, the API uploads their real bytes and writes receipts, and retrieval remains private and owner-scoped. The additive SQL contract is checked into the migration history but not executed.

**Tech Stack:** TypeScript ESM, React 19, Vite, Vitest, Zod, Supabase/Postgres/Storage, pnpm.

---

### Task 1: Establish package integrity and destination map

**Files:**
- Read: `GestaltView_Symbiote_Render_Repair_Package_v2.0.0.zip`
- Read: `package.json`
- Read: `supabase/migrations/`
- Create: canonical files listed in Tasks 2-7

- [ ] Extract the archive under `/tmp` for comparison only and run its `node scripts/validate-package.mjs`; require a successful manifest/hash/schema/script result.
- [ ] Confirm the worktree's pre-existing changes and preserve all unrelated user files.
- [ ] Compare each `repo_full_file_swaps/<path>` file with `<path>` and record whether it is new or overlapping.
- [ ] Confirm no destination file or import will reference the ZIP, `/tmp`, or an extracted package directory.

### Task 2: Add regression tests before production changes

**Files:**
- Create: `tests/shared/orchestration/execution.test.ts`
- Create: `tests/api/render-idempotency.test.ts`
- Create: `tests/api/render-request.test.ts`
- Create: `tests/api/render-user-id.test.ts`
- Create: `tests/nextgen-document-renderer.test.ts`
- Create: `tests/nextgen-orchestration.test.ts`

- [ ] Copy the six package tests byte-for-byte into the canonical test paths using repository patches.
- [ ] Run the six focused files with `pnpm exec vitest run tests/shared/orchestration/execution.test.ts tests/api/render-idempotency.test.ts tests/api/render-request.test.ts tests/api/render-user-id.test.ts tests/nextgen-document-renderer.test.ts tests/nextgen-orchestration.test.ts`.
- [ ] Confirm the baseline fails only where the v2 contract is absent; investigate any unrelated failure before modifying assertions.

### Task 3: Repair presentation evaluation and deterministic rendering

**Files:**
- Modify: `shared/orchestration/execution.ts`
- Modify: `packages/nextgen-rendering-engine/src/adapters/document.ts`
- Modify: `packages/nextgen-rendering-engine/src/adapters/orchestration.ts`
- Modify: `packages/nextgen-rendering-engine/src/core/types.ts`

- [ ] Reconcile the packaged `execution.ts` so content and HTML repetition are scored separately, structural hazards block, derivative duplicate segments are repaired deterministically, and original intake source remains unchanged.
- [ ] Reconcile `document.ts` so Markdown headings, paragraphs, lists, emphasis, code, and links render as safe HTML inside a complete document rather than escaped source.
- [ ] Reconcile target types and orchestration so every target carries required/optional intent, unsupported formats produce explicit diagnostics, backend failures are isolated, and any required failure prevents readiness.
- [ ] Run `pnpm exec vitest run tests/shared/orchestration/execution.test.ts tests/nextgen-document-renderer.test.ts tests/nextgen-orchestration.test.ts`; require all supplied assertions to pass.

### Task 4: Repair artifact byte handling

**Files:**
- Modify: `packages/nextgen-rendering-engine/src/core/artifacts.ts`
- Modify: `packages/nextgen-rendering-engine/src/server.ts`

- [ ] Reconcile artifact helpers so generated file bytes, MIME metadata, byte counts, SHA-256 values, backend identity, and correctly encoded private object paths are exposed to the server boundary.
- [ ] Ensure the server exports only the repaired server-side artifact helpers and does not expose service credentials or fabricate public URLs.
- [ ] Run `pnpm exec tsc -p packages/nextgen-rendering-engine/tsconfig.json`; require zero TypeScript errors.

### Task 5: Add canonical request, user resolution, and idempotency helpers

**Files:**
- Create: `api/render/request.ts`
- Create: `api/render/user-id.ts`
- Modify: `api/render/idempotency.ts`

- [ ] Add strict runtime parsing for `gestaltview.render-request.v2`, including target defaults and the explicitly temporary legacy Creation Corner translation.
- [ ] Add UUID owner resolution that accepts bearer UUIDs directly and maps a signed founder-session email only when the unique user lookup yields exactly one UUID.
- [ ] Reconcile idempotency hashing to include contract version, source family and ID, normalized target formats, authenticated user, complete scene-graph fingerprint, and optional client key.
- [ ] Run `pnpm exec vitest run tests/api/render-request.test.ts tests/api/render-user-id.test.ts tests/api/render-idempotency.test.ts`; require nine passing tests.

### Task 6: Reconcile durable render API and retrieval

**Files:**
- Modify: `api/render/engine.ts`
- Modify: `api/render/status.ts`
- Modify: `api/render/promote-to-gallery.ts`

- [ ] Reconcile `engine.ts` with the request/user/idempotency helpers, fixed source-family allowlist, owner-filtered queries, UUID jobs, valid state transitions, real-byte uploads, durable artifact receipts, and honest required/optional target status.
- [ ] Reconcile `status.ts` so only the owner can read the ledger and obtain five-minute signed private-object URLs.
- [ ] Reconcile `promote-to-gallery.ts` so only owner-scoped ready jobs with complete trusted HTML can create one idempotent Gallery projection from fetched private bytes.
- [ ] Audit every error path so authentication, validation, storage, receipt, or final-state persistence failure cannot return success.
- [ ] Re-run all six focused Vitest files and require 17 passing tests.

### Task 7: Add client, schemas, and unapplied database contract

**Files:**
- Modify: `client/src/lib/nextGenRenderClient.ts`
- Create: `schemas/gestaltview.render-request.v2.schema.json`
- Create: `schemas/gestaltview.render-result.v2.schema.json`
- Create: `supabase/migrations/202607130001_render_pipeline_contract_v2.sql`
- Create: `supabase/rollback/202607130001_render_pipeline_contract_v2.rollback.sql`

- [ ] Reconcile the client helper to submit the canonical v2 envelope and produce a compact user-facing receipt summary without exposing raw server credentials or requiring raw-response UI rendering.
- [ ] Add both JSON schemas as ordinary repository files and validate them through the package validator plus JSON parsing.
- [ ] Add the migration at its exact versioned migration path; do not execute it.
- [ ] Preserve the supplied conservative rollback under `supabase/rollback/`, matching the package's operational convention; do not execute it.
- [ ] Review SQL ordering so the old status constraint is dropped before historical `completed` rows are mapped to `ready` and the v2 constraint is installed.

### Task 8: Document repository reality

**Files:**
- Modify: `docs/CurrentState.md`

- [ ] Add a dated entry describing the locally integrated render v2 contract, canonical locations, focused coverage, and its not-yet-migrated/not-yet-deployed state.
- [ ] State that hosted authenticated storage, signed URL, Gallery projection, migration advisors, and preview deployment remain rollout gates.

### Task 9: Broad verification and evidence review

**Files:**
- Verify: all files changed by Tasks 2-8

- [ ] Run `pnpm exec tsc -p packages/nextgen-rendering-engine/tsconfig.json`; require success.
- [ ] Run `pnpm exec tsc --noEmit`; require success.
- [ ] Run `pnpm test`; require success or isolate and evidence a pre-existing unrelated failure without weakening tests.
- [ ] Run `pnpm run build`; require success.
- [ ] Run `git diff --check`; require no whitespace errors.
- [ ] Search all tracked source and test files for references to the archive name, `/tmp/gv-render-repair`, or `repo_full_file_swaps`; require none outside documentation that names the source package.
- [ ] Review the final diff for UUID ownership, allowlisted owner-scoped source queries, private storage paths, exact-byte upload, receipt durability, required/optional semantics, source preservation, and correct canonical directories.
- [ ] Report changed files, verification results, and remaining rollout gates; do not commit, push, deploy, apply SQL, or mutate external agent/skill state.
