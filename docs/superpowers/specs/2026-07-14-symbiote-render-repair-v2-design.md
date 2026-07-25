# Symbiote Render Repair v2 Design

## Objective

Integrate the repository-facing contents of `GestaltView_Symbiote_Render_Repair_Package_v2.0.0.zip` into their canonical locations in this repository. The implementation must repair the presentation repetition gate and next-generation render path while preserving current compatible work and avoiding production mutations.

## Scope

The integration includes:

- render API endpoints and helpers under `api/render/`;
- next-generation rendering engine files under `packages/nextgen-rendering-engine/`;
- shared orchestration behavior under `shared/orchestration/`;
- the canonical client helper under `client/src/lib/`;
- focused regression tests under `tests/`;
- request and result schemas under an appropriate repository schema location;
- the additive SQL migration under `supabase/migrations/`;
- operator-facing current-state documentation.

Every delivered file will be copied or reconciled into its matching repository directory. Runtime code must not import from the ZIP, `/tmp`, or a retained extracted package directory.

The standalone Symbiote agent and render-engine skill JSON exports remain package artifacts. They will not be registered in this repository because no canonical in-repo import registry has been identified.

## Integration Strategy

Use a reconciled integration rather than a blind full-file replacement. Compare each packaged replacement with its current destination, preserve newer compatible behavior, and adopt the package contract where the two conflict within this repair's scope. New package files are added at the exact corresponding relative paths.

The API remains the persistence boundary. It authenticates and owner-scopes requests, validates canonical v2 or temporary legacy input, creates durable job and artifact receipts, uploads actual bytes to private storage, and reports success only after durable writes succeed.

## Render Contract

The render job state machine is `queued`, `validating`, `rendering`, `storing`, then terminal `ready`, `failed`, or `cancelled`. This change does not introduce a queue worker.

Targets carry format, MIME type, destination intent, optional render settings, and required/optional intent. A job is ready only when no structural failure occurred and every required target succeeded durably. Optional failures remain visible as warnings without erasing successful siblings.

Idempotency is scoped by user and includes contract version, source identity, normalized formats, the complete scene-graph fingerprint, and any client key. Repeated requests return the existing job, including failed jobs.

## Ownership and Storage

Bearer-authenticated users retain their Supabase UUID. A signed legacy founder session may resolve its normalized email through the unique user profile lookup, but rendering proceeds only when exactly one UUID owner is found.

Source adapters use a fixed table and owner-column allowlist. Private objects use `rendered/{userId}/{jobId}/{filename}` in `codex-exports`. Artifact receipts record byte count, SHA-256, MIME type, backend, bucket, and path. Status retrieval is owner-scoped and returns short-lived signed URLs; server credentials and public object URLs never reach the client.

## Presentation and Document Rendering

The presentation gate evaluates content and HTML separately. It blocks structural hazards such as empty output, raw JSON, metadata leakage, and incomplete HTML. Repetition-only defects are repaired deterministically in the derivative while the original intake source remains unchanged. The orchestration may continue after a successful repair.

The deterministic document adapter renders safe Markdown semantics into complete HTML rather than displaying escaped Markdown source.

## Gallery Projection

Gallery promotion remains an explicit second operation. It requires an owner-scoped ready job, fetches the actual private HTML bytes, validates a complete document from the trusted backend, and inserts at most one projection using a stable source idempotency key.

## Database Boundary

Place `202607130001_render_pipeline_contract_v2.sql` in `supabase/migrations/`. Do not apply it. Preserve the packaged rollback SQL as operational evidence in a repository-appropriate rollback location if that convention already exists; otherwise document its location in the source package rather than inventing an executable migration convention.

The implementation must not deploy, mutate production data, promote a live artifact, commit, push, or open a pull request without separate authorization.

## Error Handling

Authentication, validation, owner resolution, storage, and database failures must produce non-success responses. Backend target failures are isolated, but required-target failure makes the job fail. Durable partial successes remain inspectable. Unsupported optional targets produce warnings; unsupported required targets produce failed receipts.

## Verification

Verification proceeds from focused to broad:

1. Run the six supplied Vitest files and confirm all 17 tests pass or document stronger superseding coverage.
2. Type-check `packages/nextgen-rendering-engine`.
3. Run the root no-emit TypeScript check.
4. Run the full Vitest suite.
5. Run the production build.
6. Review the final diff for correct paths, owner scoping, private storage, server-only credentials, and absence of imports from the repair package.

Hosted smoke tests, migration execution, Supabase advisors, signed-download checks, and Gallery projection remain rollout gates because they require external mutation or deployed infrastructure.

## Completion Criteria

The repository contains the repair files in canonical directories; canonical and legacy requests parse; owner IDs are UUIDs; state and storage contracts match the unapplied migration; real bytes are persisted; required/optional receipts behave correctly; repetition repair preserves source; no endpoint reports success after a durable failure; focused checks, type checks, tests, and build pass or any pre-existing blocker is clearly evidenced.
