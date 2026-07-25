# GestaltView Artifact Rendering Pipeline Audit

Date: 2026-06-17
Repo: DigitalConsciousness/gestaltview-v2.0
Scope: Codex artifact forge, export job drain, storage, and UI rendering/retrieval paths.

## Section 1 — Artifact Kind Registry

| kind | forge trigger | forge file | expected export formats |
|---|---|---|---|
| `session_recap` | Creation Corner `session_recap` selection; gen-engine target type `session-recap`; Sanctuary currently has recap UI language but no Codex insert path found. | `client/src/pages/CreationCornerPage.tsx` builds a Codex draft with `buildCreationCornerCodexArtifact`; `api/codex/forge.ts` persists it; legacy Python synthesis exists in `server/creation_corner_engine.py`. | Registry allows `html`, `pdf`, `mp3`, `json`; Creation Corner currently requests only `html`, `json`; drain only renders `html`, `json`. |
| `blueprint` | Creation Corner `blueprint_json` / `blueprint_md` selection from free text or selected blueprint. | `shared/codex/creationCorner.ts`; `api/codex/forge.ts`. | Registry allows `html`, `pdf`, `json`; Creation Corner requests only `html`, `json`. |
| `report_document` | Default Creation Corner markdown / report-like output. | `shared/codex/creationCorner.ts`; `api/codex/forge.ts`; prompt forge can also produce this kind through `forgeArtifact`. | Registry allows `html`, `pdf`; Creation Corner requests `html`, `json`, but `json` is not allowed for `report_document` by registry, so forge may seed an invalid pending JSON manifest if the draft already contains JSON. |
| `mind_map` | Creation Corner `mind_map` selection. | `shared/codex/creationCorner.ts`; `api/codex/forge.ts`. | Registry allows `html`, `png`, `gltf`; Creation Corner requests `html`, `json`, but `json` is not allowed for `mind_map`. |
| `share_card` | Creation Corner `share_card`, `marketing_copy`, `image`, or `image_prompt`. | `shared/codex/creationCorner.ts`; `api/codex/forge.ts`. | Registry allows `png`, `html`; Creation Corner requests `html`, `json`, but `json` is not allowed. |
| `code_module` | Creation Corner `code` selection. | `shared/codex/creationCorner.ts`; `api/codex/forge.ts`. | Registry allows `zip`, `html`, `json`; Creation Corner requests `html`, `json`. |
| `spatial_scene` | Defined in contract and renderer; no Creation Corner legacy mapping currently returns this kind. | Prompt forge can create it through `api/codex/forge.ts`; no direct UI trigger found. | Registry allows `html`, `png`, `gltf`. |
| `audio_narration` | Creation Corner `audio` / `audio_prompt` selection. | `shared/codex/creationCorner.ts`; `api/codex/forge.ts`. | Registry allows `mp3`, `wav`, `json`; Creation Corner requests `html`, `json`, but `html` is not allowed. |

The authoritative in-code kind list is the `ArtifactKind` enum in `shared/codex/contracts.ts`; there is no live query in this audit, so production-only kind values outside that enum must be discovered with the SQL in Section 7.

## Section 2 — Forge Pipeline Trace

### Creation Corner outputs (`report_document`, `blueprint`, `mind_map`, `share_card`, `code_module`, `audio_narration`, `session_recap`)

1. UI starts in `client/src/pages/CreationCornerPage.tsx` when `handleSynthesize` reads free text or a selected scaffold blueprint.
2. UI calls local shared gen-engine helpers (`synthesizeArtifact`, `scoreResonance`) and builds a Codex draft via `buildCreationCornerCodexArtifact`.
3. UI posts `artifact: codexDraft` and `exportFormats: ["html", "json"]` to `POST /api/codex/forge`.
4. `api/codex/forge.ts` parses the artifact through `CodexArtifactSchema` or calls OpenAI for prompt-only forge.
5. `acceptArtifact` derives allowed formats from `getAllowedExportFormats`, merges pending manifest items, inserts the artifact with `persistCodexArtifact`, then enqueues one `codex_jobs` row per chosen format through `enqueueCodexExportJob`.
6. `persistCodexArtifact` writes `codex_artifacts` fields: contract version, kind, title, slug, user/workspace IDs, security class, template key/version, body, provenance, source IDs, exports, meta, status, created_at, and updated_at.
7. If Supabase config is absent or the user is anonymous, the persistence layer writes to in-memory maps instead, which produces ephemeral `memory://` export paths later.

### Gen-engine artifact endpoint (legacy/current side path)

1. `api/gen-engine/artifacts.ts` accepts `POST /api/gen-engine/artifacts`.
2. It creates a generated artifact shell, optionally calls OpenAI, then calls `bridgeToCodex`.
3. `api/_lib/codexBridge.ts` writes to `created_artifacts` and `artifact_provenance_envelopes`, not `codex_artifacts` / `codex_jobs`.
4. No `enqueueCodexExportJob` call exists on this path, so it is not part of the Codex export drain pipeline.

### Python Creation Corner engine side path

1. `server/creation_corner_engine.py` exposes the legacy Python synthesis model and can persist Dynamic Inner World HTML through `persist_inner_world_artifact` when destination is `dynamic_inner_world`.
2. No insert into `codex_artifacts` and no `codex_jobs` enqueue call was found in the Python path.

### Sanctuary / onboarding / External Scaffold

- `client/src/pages/SanctuaryPage.tsx` contains session and recap-facing UI concepts but no Codex forge endpoint call was found.
- `client/src/components/BillyOnboardingPrompt.tsx` was checked for artifact forge triggers; no Codex forge path was found.
- `client/src/pages/ExternalScaffoldPage.tsx` is an artifact visualization/routing surface, not a Codex export retrieval surface.

## Section 3 — Drain Pipeline Trace

1. Drain entry points are the queue-wide Vercel cron `api/cron/codex-drain.ts`, `POST /api/codex/artifacts/[artifactId]/drain-exports`, and `POST /api/codex/jobs/[jobId]/run`.
2. The queue-wide cron calls the Supabase RPC `claim_codex_jobs`, whose migration uses `FOR UPDATE SKIP LOCKED` while atomically moving pending rows to `running`. No Supabase Edge Function / `Deno.serve` drain was found.
3. The cron only claims `pending` jobs, so already-stuck `running` jobs are not reclaimed by the queue-wide drain. The artifact-specific drain now repairs missing pending manifest jobs and reruns only drainable `html`/`json` jobs, including stale `running` jobs older than the configured timeout.
4. The runner loads a `codex_jobs` row and its `codex_artifacts` parent, marks the job `running`, renders through `renderCodexExport`, stores bytes, merges the manifest item into `codex_artifacts.exports`, and marks the job `ready`.
5. Rendering currently supports `html` and `json`. `pdf`, `png`, `mp3`, `wav`, `gltf`, and `zip` explicitly require dedicated durable adapters and fail if routed through the generic runner.
6. Storage path is `codex/<artifact_id>/<job_id>.<format>` when `CODEX_EXPORT_BUCKET` is configured. If the bucket env var is missing, the runner returns `memory://codex/...` without durable storage.
7. Failure increments `retryCount`, marks the job `failed`, and merges a failed export manifest item. It does not include the failure error on the artifact export item.
8. This audit added a stale-running guard to the artifact drain: only `running` jobs older than `CODEX_STALE_RUNNING_JOB_MS` (default 15 minutes) are rerun, preventing fresh active jobs from being double-processed while allowing timed-out jobs to be reclaimed.

## Section 4 — Storage & Retrieval Trace

| format | storage location | retrieval method | render component |
|---|---|---|---|
| `html` | Supabase Storage bucket from `CODEX_EXPORT_BUCKET`, path `codex/<artifact_id>/<job_id>.html`; otherwise `memory://codex/...`. | `api/codex/artifacts/[artifactId]/exports.ts` is a POST endpoint for requesting a new export job, despite the cron comment referring to signed URLs. No GET signed URL/proxy retrieval endpoint for ready Codex exports was found. Creation Corner displays source text and manifest status, not the stored HTML. Inner World mirroring stores HTML in `inner_world_artifacts`. | `CreationCornerPage` shows raw content in a `<pre>`; `ExternalScaffoldPage` renders its own scaffold artifacts; Codex HTML template renderer is in `shared/codex/templates/html.ts`. |
| `json` | Supabase Storage bucket from `CODEX_EXPORT_BUCKET`, path `codex/<artifact_id>/<job_id>.json`; otherwise `memory://codex/...`. | No downstream JSON fetch endpoint or corpus pickup reader was found. UI downloads local metadata JSON from client state instead of retrieving stored JSON. | No dedicated JSON rendering component found. |
| `pdf` | Not implemented in generic drain. | Dedicated worker adapter required; no working retrieval path found. | Not rendered. |
| `png` / `gltf` / `zip` / audio formats | Not implemented in generic drain. | Dedicated worker adapters required; no working retrieval path found. | Not rendered by Codex export path. |

Security: rendered HTML is escaped by the shared template. However, if stored Codex HTML is later displayed in the browser, it should be rendered in a sandboxed iframe with a tight `sandbox` attribute and a signed URL/proxy boundary. No such Codex export viewer was found in the current pages.

## Section 5 — Breakpoint Matrix

| Scenario | Correct? | Evidence | Fix needed? |
|---|---|---|---|
| Artifact created, html job enqueued, drain completes | Mostly works for `html` when allowed by kind and bucket env is set. | Forge enqueues jobs; runner renders HTML and updates artifact/job. | Keep queue-wide cron coverage, add stale-running recovery, and add export retrieval UI. |
| Artifact created, json job NOT enqueued | Previously silently stuck; now artifact drain repairs missing jobs for pending manifest items. | `ensureCodexExportJobsForArtifact` creates missing jobs for pending exports before running drain. | Run SQL backfill for existing production rows and keep repair in code. |
| Drain claims job, serverless times out, job stuck running | Queue-wide cron still cannot reclaim it; artifact-specific drain can now reclaim stale `running` jobs by `updatedAt`. | Claim RPC only selects `pending`; stale guard in artifact drain checks `CODEX_STALE_RUNNING_JOB_MS`. | Add queue-wide stale reset SQL/cron for non-manual recovery. |
| Artifact has `memory://` storage_path, frontend tries to load | No durable retrieval; old memory exports are likely lost. | Storage runner emits `memory://` when no bucket env exists; no UI fallback fetch path exists. | Mark old memory exports failed/stale and rerender from source content where possible. |
| `codex_artifacts.exports[]` not updated after job completes | Generic runner updates it on success/failure; hook also updates it. | `runCodexExportJob` merges `manifestItem` and calls `updateCodexArtifact`. | Add monitoring query for mismatches; include errors on failed export manifest items in future contract. |
| `session_recap` kind — same forge+drain flow? | Yes only through Creation Corner Codex draft path; not through Sanctuary recap UI. | Creation Corner maps `session_recap` to Codex kind. | Wire Sanctuary recap button to Codex forge if product wants session recaps stored/exported. |
| `report_document` kind — same flow? | Partially: Creation Corner default maps to `report_document`, but registry disallows JSON while UI/draft requests it. | Exporter registry for `report_document` is `html`, `pdf`. | Decide whether JSON should be allowed for all Codex artifacts or remove JSON pending seed for report documents. |
| `creation_corner` kind — same flow? | No such Codex kind in code. | Artifact kind enum does not contain `creation_corner`; it is a legacy artifact type / destination. | If production contains `kind='creation_corner'`, migrate/map it or extend the contract deliberately. |

## Section 6 — Remediation Plan

### Issue 1: Missing pending export jobs

- Root cause: artifact exports can contain pending manifest entries without a matching `codex_jobs` row.
- Files changed: `api/codex/_persistence.ts`, `api/codex/artifacts/[artifactId]/drain-exports.ts`.
- Code change: add `ensureCodexExportJobsForArtifact` and call it at the start of artifact drain.
- SQL: see Section 7 backfill query.
- Verification: run `pnpm exec tsc --noEmit --pretty false` and a route-level test or API call against an artifact with pending JSON/no job.

### Issue 2: Stale `running` jobs

- Root cause: the queue-wide claim RPC selects only `pending` rows and serverless death leaves `running` rows outside the cron claim set.
- Files changed: `api/codex/artifacts/[artifactId]/drain-exports.ts`.
- Code change: add a stale-running threshold and rerun only jobs older than the threshold.
- SQL: see Section 7 stuck-running update.
- Verification: set `CODEX_STALE_RUNNING_JOB_MS=1`, create/update a running job with old `updated_at`, then call artifact drain and confirm it leaves `running`.

### Issue 3: Ephemeral `memory://` paths

- Root cause: `CODEX_EXPORT_BUCKET` absence makes runner report a non-durable in-memory path.
- Files to change next: `workers/codex/runner.ts`, deployment env, and a future retrieval endpoint under `api/codex/artifacts/[artifactId]/exports/[format]`.
- Code change needed: fail closed in production when bucket is missing, or explicitly mark export as `failed` rather than `ready` with `memory://`.
- SQL: see Section 7 memory-path marking query.
- Verification: run drain with bucket unset in production-like env and assert it fails rather than stores `memory://`.

### Issue 4: Format registry mismatch

- Root cause: Creation Corner always seeds/requests `html` and `json`, but the registry allows different formats per kind.
- Files to change next: `shared/codex/creationCorner.ts`, `shared/codex/router.ts`, `client/src/pages/CreationCornerPage.tsx`.
- Code change needed: either allow `json` as a universal metadata export, or seed only `getAllowedExportFormats(kind)` intersection with the generic renderer's supported formats.
- SQL: backfill/cleanup should follow the chosen contract.
- Verification: create each artifact type and assert forge returns only registry-valid pending exports.

### Issue 5: No Codex export retrieval/viewer

- Root cause: pipeline stores exports but UI does not fetch signed URLs or render stored HTML/JSON.
- Files to change next: replace or extend `api/codex/artifacts/[artifactId]/exports.ts` with a GET signed-url/proxy retrieval endpoint; update `CreationCornerPage` and/or a Codex viewer component.
- Code change needed: signed URL/proxy endpoint, `memory://` fallback messaging, sandboxed iframe for HTML.
- SQL: none.
- Verification: render an HTML export, fetch signed URL through API, and load it in a sandboxed iframe.

## Section 7 — Data Fixes (SQL)

See `supabase/codex_artifact_data_fixes_2026-06-17.sql` for ready-to-run production-safe SQL.
