# July 8 Runtime Hotfix Sweep Design

## Summary

This spec defines a comprehensive but bounded hotfix sweep for the July 8 runtime failures. The goal is to restore the core product spine without broad redesign:

`capture -> recognize signal -> preserve original -> render appropriately -> route artifact -> gallery-visible -> user can inspect/export`

The sweep covers render stability, Transcriptory state truthfulness, profile ingestion evidence gates, artifact gallery rendering contracts, Billy tone guardrails, Tribunal cultural-signal routing, Musical DNA local-first upload honesty, and environment hardening.

## Goals

1. Stop render and artifact surfaces from failing due to deploy-time module resolution problems.
2. Make runtime state transitions truthful so the UI does not claim success when persistence, transcription, or ingestion did not actually complete.
3. Ensure artifacts render through explicit viewer contracts rather than degrading into raw JSON or markdown blobs as the primary output.
4. Add routing guardrails so cultural signals are recognized before Tribunal-style interpretation and Billy does not default to canned therapeutic filler in ordinary product-failure contexts.
5. Make local and deployed environments diagnosable by classifying missing env vars by runtime impact instead of leaving failures implicit.

## Non-Goals For This Sweep

- Do not redesign the full DI orchestration stack during the hotfix.
- Do not introduce a universal tool-calling framework for every Digital Intelligence inside this incident pass.
- Do not broaden the July 8 repair work into a generalized “make every DI agentic” platform project before the runtime spine is stable again.

## Assumptions

- The July 8 package in `hotfix/july_8th/` is the source boundary for this sweep.
- Small shared helpers are allowed when they reduce repeated logic across the named hotfix surfaces.
- This is a repair pass, not a visual or architectural redesign.
- Local development may run in a degraded state when some protected or provider secrets are unavailable, but that degradation must be explicit.
- The user does not currently have `SESSION_SECRET`, `BILLY_API_SECRET`, or `BILLY_TRANSCRIPTION_URL`, but does have the other major runtime secrets.

## Current Failure Picture

### Render and deploy

- `api/render/decide.ts` currently imports `@shared/rendering`.
- `api/render/engine.ts` currently imports `../../packages/nextgen-rendering-engine/src/index`.
- The July 8 evidence package reports deploy-time `ERR_MODULE_NOT_FOUND` failures on both render endpoints.
- `vercel.json` includes `api/gen-engine/*.ts` support files but does not explicitly include render-route dependencies.

### Inner World and gallery

- `api/inner-world/artifacts.ts` directly selects `origin_di_id`.
- The July 8 evidence package indicates this column may be missing in the live table, which can turn valid artifact rows into API 500s.
- The client already has Artifact Gallery and Inner World artifact surfaces, but they are strongly biased toward ready HTML instead of a broader viewer contract.

### Transcriptory

- `api/transcriptory/captures.ts` currently accepts a client-provided `status` and can create rows in `processing`.
- `api/transcriptory/transcribe.ts` only claims `pending` or `failed` captures in the normal path.
- The evidence package shows rows stuck as `processing` with `processing_started_at = null`, no transcript, and no error.

### Profile ingestion

- `api/_lib/profileIngestion.ts` already has a meaningful section-aware synthesis path.
- It currently returns `status: complete` even when persistence or evidence quality is incomplete.
- The evidence package indicates `profile_upload` can violate the live `profile_ingestion_sources.source_type` constraint.

### Billy and Tribunal

- `api/billy.ts` has a single response assembly path after `routeLlm(...)`, which is a clean post-processing insertion point.
- Billy diagnose mode is separately gated by `BILLY_API_SECRET`.
- Tribunal requests route through `api/_lib/actionsHandler.ts`, which is the right place for a cultural-recognition preflight before generic interpretation.

### Musical DNA

- `client/src/hooks/useTrackUpload.ts` currently uploads to the server first when authenticated, then appends the stored file.
- This can make remote failure feel like total disappearance rather than an honest local-first state transition.

### Environment and secrets

- `scripts/codex-env.sh` is the current repo-local wrapper for hydrated commands.
- `scripts/env-loader.sh` loads `.env`, `.env.codex`, and `client/.env`.
- There is no literal `SECRET_PHRASE` runtime env in the surfaces reviewed for this design.
- `SESSION_SECRET` is a real session-cookie signing requirement.
- `BILLY_API_SECRET` is a real but optional gate for Billy diagnose mode.
- `BILLY_TRANSCRIPTION_URL` is a real but optional transcription provider path.

## Proposed Architecture

### 1. Render rescue and deploy hardening

Replace the current render handlers with the bounded hotfix versions in `hotfix/july_8th/proposed_full_file_swaps/api/render/`.

This does three things:

- keeps render imports on stable shared paths;
- removes the raw TypeScript package import from the deployed function path;
- preserves structured fallback behavior for scene-graph and markdown-style artifacts.

Also patch `vercel.json` so `api/render/*.ts` includes the runtime files needed in production.

### 2. Schema and API truthfulness

Land the July 8 SQL as a proper migration and align the API behavior to the new contract.

Key rules:

- new Transcriptory uploads without a transcript must start as `pending`, not caller-forced `processing`;
- stale `processing` rows with no actual claim metadata must be recoverable;
- profile ingestion must not signal meaningful completion without persisted sources or explicit partial-persistence warnings;
- Inner World artifact reads must fail gracefully or avoid brittle column assumptions when schema drift is detected.

### 3. Artifact viewer contract

Create a lightweight normalized artifact-view decision layer near the existing gallery and Inner World surfaces.

The normalized shape should support:

- `html`
- `markdown`
- `json_scene_graph`
- `audio`
- `image`
- `raw`

The important contract is behavioral, not nominal:

- render rich surfaces through a viewer;
- keep raw source inspectable but collapsed;
- never present a preserved blob as the final artifact unless the user explicitly opens raw source.

### 4. Meaning-routing guardrails

Add two routing defenses:

- a Billy response post-processor after the LLM response returns;
- a cultural-recognition preflight before Tribunal-style interpretation.

Billy should rewrite canned filler only in non-distress contexts such as runtime bugs or contract failures. Tribunal should detect likely lyric or quote signals and route to clarification instead of generic self-growth interpretation.

### 5. Local-first Musical DNA upload state

Refactor the track upload flow so the browser has a durable local truth before remote sync succeeds.

Required states:

- `selected`
- `local_ready`
- `syncing`
- `synced`
- `failed_remote`
- `rejected`

Remote sync should enrich local state, not determine whether the user perceives the upload as real.

### 6. Environment hardening and degraded-mode honesty

Treat env validation as part of the hotfix, not as side documentation.

The implementation should add a hotfix-focused env audit script that runs through `scripts/codex-env.sh` and reports status by runtime domain, not just by variable name.

The checker should distinguish:

- hard required for core runtime;
- required for session-backed local flows;
- optional but protected operations;
- optional providers that enable richer behavior but should degrade honestly when absent;
- worker tuning and durability settings.

## Env and Secret Policy

### Mixed local-secret strategy

Use a mixed strategy for local development:

- allow a documented dev-only placeholder for `SESSION_SECRET`;
- do not invent or require a fake `BILLY_API_SECRET`;
- do not invent or require a fake `BILLY_TRANSCRIPTION_URL`;
- mark Billy diagnose mode and transcription provider status as disabled or degraded when those values are absent.

### Core runtime vars

Required:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are foundational for persistence, browser auth, and many API surfaces.

### Session and protected ops

Required for session-backed local flows:

- `SESSION_SECRET`

Optional protected operation:

- `BILLY_API_SECRET`

If `SESSION_SECRET` is absent locally, the env checker should recommend a dev-only placeholder value and clearly note that session cookie signing will fail without it.

If `BILLY_API_SECRET` is absent, the checker should mark Billy diagnose mode unavailable while leaving ordinary Billy chat operational.

### Transcriptory providers

At least one of the following should exist for server-side transcription behavior:

- `ASSEMBLYAI_API_KEY`
- `BILLY_TRANSCRIPTION_URL`
- `GROQ_API_KEY`
- `HUGGINGFACE_API_KEY`
- `HF_API_TOKEN`

If none exist, the system should report that captures may persist but server-side transcription will not complete.

### Worker and export settings

Not secret, but operationally important:

- `TRAINER_WORKER_ID`
- `TRAINER_IDLE_DELAY_MS`
- `TRAINER_HEARTBEAT_MS`
- `TRAINER_QUEUE_HEALTH_TIMEOUT_MS`
- `CODEX_EXPORT_BUCKET`

These should be reported as:

- runnable with defaults;
- durable vs memory-only;
- tuned vs untuned.

## File-Level Plan

### Render and deploy

- `api/render/decide.ts`
- `api/render/engine.ts`
- `vercel.json`
- `shared/rendering/**` only if needed to support the swap cleanly

### Schema and runtime truthfulness

- new migration under the repo’s Supabase migration path
- `api/inner-world/artifacts.ts`
- `api/transcriptory/captures.ts`
- `api/transcriptory/transcribe.ts`
- `api/_lib/profileIngestion.ts`

### Artifact viewing

- `client/src/lib/innerWorldFiles.ts`
- `client/src/pages/ArtifactGalleryPage.tsx`
- `client/src/components/inner-world/InnerWorldArtifactGallery.tsx`
- `client/src/lib/rendering/fromArtifacts.ts`
- a small shared helper if needed for artifact-view normalization

### Meaning routing

- `api/billy.ts`
- `api/_lib/actionsHandler.ts`
- a new helper for cultural-signal recognition

### Musical DNA

- `client/src/hooks/useTrackUpload.ts`
- `client/src/components/MusicalDnaTrackUploadPanel.tsx`
- `client/src/lib/musicalDnaTracks.ts` if upload sync state belongs in the shared type

### Env audit

- `scripts/codex-env.sh` kept as the canonical wrapper
- likely a new `scripts/check-hotfix-env.*` helper
- optional `package.json` script wiring if that improves repeatability

## Implementation Phases

### Phase 0: Env audit and degraded-mode baseline

- Add the hotfix env check script.
- Document the dev-only `SESSION_SECRET` placeholder path.
- Classify missing Billy diagnose and transcription secrets as degraded, not as unknown failures.

### Phase 1: Render rescue

- Apply the full-file swaps.
- Patch `vercel.json`.
- Verify render endpoints now fail with bounded JSON errors or valid outputs rather than module-resolution 500s.

### Phase 2: Schema repair and state truthfulness

- Land the July 8 SQL migration.
- Fix Transcriptory create/claim logic.
- Tighten profile ingestion completion semantics.
- Make the Inner World artifact API resilient to schema mismatch.

### Phase 3: Artifact viewer contract

- Normalize artifact kind routing.
- Collapse raw source behind explicit inspection affordances.
- Merge local and server artifact visibility around the new contract.

### Phase 4: Meaning guardrails

- Add Billy tone post-processing.
- Add Tribunal cultural-recognition preflight.
- Verify lyric-like inputs route to clarification instead of generic therapeutic interpretation.

### Phase 5: Musical DNA local-first honesty

- Persist local track state immediately.
- Add explicit remote sync states and retry messaging.

### Phase 6: Validation and documentation

- Add or update focused tests on the repaired runtime paths.
- Run build and targeted test commands.
- Update current-state documentation if the repo’s process expects it after landing the sweep.

## Testing Strategy

- Use route-level tests for the render endpoints to prove they return bounded responses without deploy-path imports.
- Add Transcriptory tests for:
  - new captures defaulting to `pending`;
  - stale `processing` recovery claim;
  - visible failure state behavior where testable.
- Add profile ingestion tests that reject evidence-empty high-salience dimensions as meaningful completion.
- Add Billy and Tribunal tests that cover:
  - banned Billy filler in product-failure contexts;
  - lyric preflight routing for the Alice in Chains case;
  - non-lyric normal Tribunal flow still working.
- Add client tests or focused utility tests for:
  - artifact-view routing;
  - Musical DNA local-first sync states.
- Run env audit validation through `scripts/codex-env.sh`.

## Risks

- A literal file swap can drift from nearby shared helper assumptions if applied without reading the existing runtime seams.
- Schema resilience can accidentally hide a real migration problem if the fallback path is too silent.
- Billy tone rewriting must not flatten legitimate care language in actual distress contexts.
- Local-first upload state can become confusing if sync metadata is not surfaced cleanly in the panel copy.
- Env checks can become noise if they merely enumerate keys instead of describing the operational consequence of each missing value.

## Follow-On Slice: Shared DI Tool Calling

Once the runtime hotfix is stable, the next adjacent slice should add a shared grounding/tool-call contract for all DIs so they can stop defaulting to generic synthesis when the work really calls for inspection, browsing, or evidence gathering.

### Intent

The goal is not to let every DI do everything. The goal is to let any DI that needs grounding invoke a bounded set of shared tools through a common runtime contract, with provenance visible in the response.

### Initial capability set

- browser-style grounding for live page inspection and research
- retrieval over repo-local and runtime-local evidence
- optional structured actions for safe runtime operations

### Minimum contract

Each DI tool call should answer:

- what tool is being requested;
- why the DI believes grounding is needed;
- what evidence came back;
- whether the final answer is grounded, inferred, or degraded.

### Required constraints

- tool access must be policy-gated by DI, room, and request type;
- all tool-derived responses must expose provenance instead of pretending the DI “just knows”;
- failure to ground must degrade honestly rather than falling back to generic filler;
- browser and research capabilities should be shared infrastructure, not reimplemented separately for Billy, Tribunal, and every other DI.

### Recommended implementation order

1. shared tool-call policy and capability matrix
2. shared grounding response envelope with provenance
3. browser/research adapter for the first DI cohort
4. UI affordances that show when a DI grounded itself versus answered from memory or synthesis
5. expand to more DIs only after the contract is stable

## Deliverable Order

1. Add env audit and degraded-mode guidance.
2. Apply render hotfixes and deploy include patch.
3. Land SQL migration and runtime truthfulness repairs.
4. Normalize artifact viewer routing.
5. Add Billy and Tribunal guardrails.
6. Refactor Musical DNA upload to local-first sync honesty.
7. Validate with tests, build, and hotfix checklist items.
