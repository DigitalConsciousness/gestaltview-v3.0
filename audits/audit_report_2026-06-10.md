## Executive Summary

**Overall health score: 6/10.** GestaltView v2.0 has a coherent Vercel + Vite + Supabase runtime, with recent production fixes for Codex drain auth, gen-engine template exports, and Dynamic Inner World pagination in place. The architecture is powerful but uneven: newer surfaces such as Transcriptory and Inner World are session-scoped, while older and commercial/API surfaces still trust client-supplied identity, permissive CORS defaults, or parsed webhook payloads.

**Top 3 risks**

1. **Auth boundary drift across API routes.** Several routes that write or read user-associated data are not protected by `requireAuth()` / `getAuthUser()` and still accept `userId` / `user_id` from request bodies or headers.
2. **Background job concurrency is only partially idempotent.** Codex drain skips already-running jobs, but selection and transition are not atomic, so overlapping cron invocations can select the same pending job before either marks it running.
3. **Webhook and CORS hardening is inconsistent.** The primary Stripe webhook correctly validates a raw body, but the GATE delegated Stripe webhook reconstructs a payload from `req.body`; CORS defaults to `*` whenever `CORS_ORIGINS` is unset.

**Readiness statement:** The runtime is deployable with known guardrails, but it is not yet production-hardened for broad multi-user traffic until identity derivation, webhook raw-body handling, CORS defaults, and job locking are normalized.

## Phase 1: System Map & Component Breakdown

### Text-based critical data flows

#### 1. Billy message → LLM response → client

```text
client Billy UI / hooks
  -> POST /api/billy with message/query, optional mode, topK, room/embodiment hints
  -> api/billy.ts
      -> apply CORS
      -> getAuthUser(req) attempts signed cookie, then Supabase bearer token
      -> if auth missing, falls back to getUserId(req, body) from body.userId, x-user-id, or query.userId
      -> retrieval: embeddings + knowledge_fragments + skill_fragments + memory/founder context when possible
      -> build Billy runtime system prompt from requested embodiment profile + room
      -> routeLlm(prompt, context)
          -> provider cascade: Ollama -> Groq -> HuggingFace -> OpenRouter -> Gemini -> Anthropic -> OpenAI
          -> if no configured provider or all fail, returns offline-fallback text instead of throwing
      -> async logSession + memory/context updates
  -> JSON response envelope returned to client
```

**Magic behavior:** Billy is both public chat and authenticated memory surface. It can write session rows under a caller-provided `userId` when the session is absent, which is useful for anonymous demos but unsafe for user data boundaries.

#### 2. Transcriptory audio upload → AssemblyAI transcription → enrichment → capture row updated

```text
client/src/pages/TranscriptoryPage.tsx
  -> create local pending capture
  -> POST /api/transcriptory/captures to create authenticated pending capture
  -> POST /api/transcriptory/transcribe with raw audio body, X-Capture-Id, X-Filename
  -> api/transcriptory/transcribe.ts
      -> requireAuth(req) using signed GestaltView session token
      -> storage path = auth.id/captureId/timestamp-safeFileName
      -> private Supabase Storage bucket transcriptory_audio_files upload
      -> AssemblyAI /v2/upload
      -> AssemblyAI /v2/transcript with universal-3-pro/universal-2
      -> bounded polling loop: max 80 attempts, 2.5s delay outside tests
      -> routeLlm transcript summary/theme extraction
      -> related-capture token overlap query for same auth.id
      -> update transcriptory_captures where id=captureId and user_id=auth.id to status='ready'
  -> capture payload returned to client and replaces pending item
```

**Magic behavior:** `hasServerTranscriptionProvider()` advertises multiple provider families, but the handler only executes AssemblyAI; if AssemblyAI is missing while another provider key exists, the route returns `transcription_adapter_not_wired`.

#### 3. Gen-engine resonance / synthesis → artifact written to `inner_world_artifacts`

```text
client Creation Corner / gen-engine client
  -> scoreResonance POST /api/gen-engine/resonance
      -> local shared scoreResonance only; no DB write
  -> createArtifact POST /api/gen-engine/artifacts
      -> read body directly as Partial<ArtifactSynthesisRequest>
      -> create local artifact shell
      -> routeLlm for rendered content; local-template fallback on error
      -> bridgeToCodex writes legacy created_artifacts + artifact_provenance_envelopes
      -> client may also POST /api/codex/forge for Codex artifact + export jobs
  -> codex drain or explicit job run renders HTML
      -> workers/codex/runner.ts writes export to CODEX_EXPORT_BUCKET or memory:// fallback
      -> when job.format === html, runner upserts inner_world_artifacts with source_ref=codex artifact id
  -> /api/inner-world/artifacts GET returns latest authenticated artifacts with bounded pagination
```

**Important correction:** `/api/gen-engine/resonance` itself does not write `inner_world_artifacts`; the write happens through the Codex export runner's HTML mirror path or the direct `/api/inner-world/artifacts` POST path.

#### 4. Codex drain cron → jobs flushed from `codex_jobs`

```text
Vercel cron every 2 minutes
  -> GET/POST /api/cron/codex-drain
      -> production auth accepts x-vercel-cron: 1 OR Authorization: Bearer $CRON_SECRET
      -> REST select codex_jobs where status=pending order created_at asc limit 5
      -> for each selected job until 50s budget
          -> runCodexExportJob(job.id)
              -> get job + artifact
              -> update job status=running
              -> renderCodexExport
              -> store to CODEX_EXPORT_BUCKET or memory://
              -> if HTML, upsert inner_world_artifacts
              -> update artifact manifest + job status=ready
              -> on error, status=failed and retry_count++
  -> JSON drain summary
```

**Magic behavior:** The job selection uses Supabase REST directly while execution uses the shared persistence helper; there is no transactional claim step before marking a job running.

### Module responsibility table

| Directory / file | Confirmed responsibility | Undocumented or magic behavior | Data/request flow notes |
|---|---|---|---|
| `api/` | Vercel serverless routes for auth, Billy, gen-engine, Codex, Inner World, Transcriptory, Stripe, Trainer, modules, Gate, profile, workbook, documents, and cron. | Mixed generations of handlers: some use `requireAuth()`, some use async `getAuthUser()`, some directly trust request bodies. | Main deployed API surface through `vercel.json` catch-all rewrite and function include globs. |
| `api/_lib/` | Shared serverless utilities: auth, CORS, LLM router, Supabase helpers, Billy memory, embeddings, response helpers, rate limits. | `requireAuth()` is sync and only uses the signed GestaltView session token path; async `getAuthUser()` supports Supabase bearer tokens. | Most route-level security depends on choosing the correct helper. |
| `api/billy.ts` | Billy chat/retrieval endpoint with knowledge + skill search, memory, founder context, diagnostics, and LLM routing. | Falls back to `getUserId()` from body/header/query when unauthenticated. | Writes session/memory-adjacent data under the resolved user id. |
| `api/transcriptory/` | Authenticated capture CRUD and raw audio transcription/enrichment. | Non-AssemblyAI providers are detected as possible but not wired. | User id is derived from auth for DB writes; capture updates are scoped by `id` and `user_id`. |
| `api/gen-engine/` | Local gen-engine scoring, synthesis, ambient scan, export, fusion, learn, predict, lightning routes. | `resonance.ts` is public/local and not persistence-backed; `artifacts.ts` can accept `userId` from body. | Real Inner World persistence occurs through Codex mirror or Inner World route. |
| `api/inner-world/` | Authenticated Inner World artifact/file persistence and sharing. | Artifact POST upserts on `source_ref` only, which can collide across users unless DB constraint is composite or source refs are globally unique. | GET pagination defaults to 20 and clamps to 100. |
| `api/cron/` | Scheduled Codex export drain and provenance upgrade. | Codex drain has dual auth in production but no lock. | Registered in `vercel.json`: provenance every 2 hours, Codex drain every 2 minutes. |
| `api/stripe/` | Stripe checkout and subscription webhook handling. | Primary webhook is raw-body safe; GATE webhook path is separate and not raw-body safe. | `stripe/stripe-webhook.ts` is an alias to `stripe/webhook.ts`. |
| `api/gate/` | Agent Trainer package builder API, checkout, drafts, orders, Stripe webhook delegation. | If `GATE_ADMIN_KEY` is unset, admin-like mock payment is allowed by default. | `vercel.json` rewrites REST-shaped Gate URLs to single-file delegates. |
| `client/src/` | React + Vite SPA: pages, components, hooks, features, modules, local persistence helpers. | Many runtime features degrade to localStorage or local gen-engine fallbacks when APIs fail. | `appFetchJson()` sends credentials by default for session-cookie routes. |
| `shared/` | Cross-runtime domain contracts and pure logic: Billy prompts/types, gen-engine, Codex contracts/templates/renderers, embodiment registry/governance, modules. | Embodiment JSON source is compiled into `shared/embodiment/generated.ts`; runtime does not read JSON files directly. | Shared modules are imported by client and API handlers. |
| `server/` | Optional Express static server plus service-layer modules used by API handlers, especially Gate, Trainer, collaborators, model homes, workbook. | Also contains legacy Python engines that are not part of the Vercel request path. | `npm run server` serves `dist/public`; Vercel uses serverless API + static output instead. |
| `supabase/migrations/` | Schema evolution for profiles, Trainer, Gate, Codex, Transcriptory, Inner World, DI runtime, model homes, storage policies. | Multiple historical naming styles and some legacy fix files make order auditing harder. | Latest migrations include Transcriptory bucket and Codex/Inner World indexes. |
| `middleware.ts` | Vercel middleware for browser route redirects and API 401s on a narrow protected matcher set. | Does not protect most `/api/*` routes; route handlers must enforce their own auth. | Protected: dashboard/gravity/record/agent-trainer runtime/control-plane pages plus session/trainer/workbook/agents/collaborators APIs. |
| `instrument.js` | Sentry/Braintrust initialization wrapper and tracing helper. | Disabled unless relevant env vars are present; imported from server and LLM router. | Provides `traceBraintrust()` around `routeLlm()`. |
| `vercel.json` | Build/install/output config, cron registration, function include files, Gate rewrites, SPA fallback. | `.vercelignore` excludes tests and docs/wiki material from deployment. | Output is `dist/public`; framework is manually set to null. |
| `agents/` | Lightweight public agent/persona manifest files. | No clear active import chain found in runtime API/client for the shallow `agents/` assets. | Appears more like persona/config archive than deployed code. |
| `.agents/` | Codex/agent skill library and operating instructions for repository work. | Operational tooling, not deployed runtime; excluded from Vercel. | Used by human/AI operators in this workspace. |
| `agent_trainer/` | Sellable/package-corpus source library and Supabase manifest exports for Agent Trainer package builder. | Large manifest JSON appears to duplicate source content for ingestion/package building. | Referenced by ingestion scripts/docs; not directly imported by live app except as corpus source. |
| `embodiment_profiles/` | Canonical JSON/Markdown source profiles for embodiment generation. | Runtime source of truth is generated TypeScript, so JSON edits require sync/build step. | `scripts/sync-embodiment-profiles.ts` compiles JSON into shared registry. |
| `workers/` | Codex export activities/runner/workflows for export rendering and Inner World mirroring. | Temporal workflow spec exists, but current active path is serverless cron/direct run. | Imported by Codex job API and cron. |
| `worker/` | Trainer execution loop. | Singular/plural worker directories are both active but for different domains. | `npm run trainer:worker` executes `worker/trainer/main.ts`. |
| `billy_voice/` | Python voice/websocket/TTS support files. | Adjacent to `/api/voice/billy.ts` but no direct Vercel import chain found for all Python components. | Likely local/experimental voice pipeline support. |
| `context/` | Markdown operating context/handoff docs. | Not React context; naming can mislead. React contexts live under `client/src/contexts`. | Documentation-only runtime context. |
| `specs/` | Active and historical implementation specs, including this audit spec and production fix specs. | Specs may describe desired state rather than current state. | Useful for traceability, not deployed runtime. |
| `dist/` | Built/static public assets. | Tracked files exist despite `.gitignore` and `.vercelignore` excluding `dist`. | Build output should normally be regenerated by Vercel. |
| `requirements.txt` | Python tooling/runtime helper dependencies for scripts, migrations, ingestion, and legacy servers. | Not orphaned, but under-documented relative to many Python scripts with their own ad hoc dependencies. | `package.json` exposes `setup:python`. |
| `constants.ts` | Root-level re-export of lucide-react icons for Adaptive Layout components. | Name suggests app constants but actually exports icons. | Imported by legacy/root-relative client components. |
| `types.ts` | Root-level `LayoutPreferences` interface. | Duplicates the concept of shared types outside `shared/`. | Imported by Adaptive Layout page/components. |

## Phase 2: Critical & High Risk Gaps

| Surface | Finding | Evidence / current behavior | Risk | Fix shape |
|---|---|---|---|---|
| Auth/session | `api/billy.ts` writes/logs under `authUser?.id || getUserId(req, body)`, and `getUserId()` trusts `body.userId`, `x-user-id`, or query `userId`. | Public Billy can become user-associated without validated session. | P0 | Split anonymous Billy from authenticated memory writes; derive persistent user id only from `getAuthUser()` and use a non-persistent anonymous id otherwise. |
| Auth/session | `api/billy-bucket-drop.ts` writes `bucket_drops.user_id` from client-supplied identity with no auth. | Any caller can write rows for any `userId`. | P0 | Require auth for persisted bucket drops, or explicitly route anonymous drops to a server-generated anonymous namespace. |
| Auth/session | `api/gen-engine/artifacts.ts` accepts `body.userId` and passes it to artifact creation / `routeLlm()` context. | A caller can attribute generated artifacts to another id; persistence bridge uses legacy tables. | P1 | Require auth for user-bound artifact creation and ignore body user id; use authenticated id or anonymous sentinel. |
| Auth/session | `api/creation-corner/synthesize.ts` accepts `user_id` and uses it for generated artifact and resonance scoring. | Legacy route can misattribute artifacts/resonance context. | P1 | Add auth or remove user persistence semantics from this legacy endpoint. |
| Middleware | `middleware.ts` only matches a small route set; most data-touching `/api/*` routes bypass middleware. | Route-level auth is mandatory but inconsistently applied. | P1 | Treat middleware as UX guard only; add route-level auth inventory tests for every persisted user-data route. |
| Transcriptory | AssemblyAI polling is bounded (`MAX_POLL_ATTEMPTS = 80`) and therefore will not poll indefinitely. | Maximum wall time is about 200 seconds outside tests, which may exceed Vercel function ceilings. | P1 | Move long polling to background/job model or reduce attempts to fit the function timeout with resumable capture status. |
| Transcriptory | Storage path is correctly auth-prefixed but `captureId` is not syntactically validated before path construction. | Path remains under `auth.id/`, but malicious slashes in capture id could create confusing nested paths. | P2 | Validate capture id as UUID or safe slug before storage upload. |
| Transcriptory | Any failure after pending capture creation returns 502 but does not mark the capture row `failed`. | Captures can remain `status='processing'` forever after AssemblyAI, LLM, storage, or DB errors. | P1 | In catch block, update authenticated capture to `failed` with error metadata when `captureId` exists. |
| Transcriptory concurrency | Two transcribe requests for the same `captureId` both upload unique storage paths and race to update the same row. | Last finisher wins; earlier audio path/transcript can be overwritten. | P1 | Add status transition guard such as `pending -> processing -> ready/failed` and reject/ignore concurrent updates. |
| Gen-engine / templates | Production fix is present: `shared/codex/templates/index.ts` exports `./components.js` and `./html.js`. | Node/Vercel ESM resolution should no longer look for extensionless template modules. | P2 | Keep the production-fix test and add import-resolution smoke coverage for compiled output. |
| Inner World | `/api/inner-world/artifacts` GET defaults `limit=20`, clamps at 100, and applies `.range(offset, offset + limit - 1)`. | No client caller was found passing an unbounded `limit`; default path is bounded. | P2 | Add client contract test proving no `limit=1000` or unbounded helper path is introduced. |
| Inner World | Artifact POST upserts on `source_ref` alone while setting `user_id=auth.id`. | If DB uniqueness is global on `source_ref`, one user's source ref can overwrite/collide with another user's artifact. | P1 | Make conflict key composite (`user_id, source_ref`) and align DB unique index + upsert call. |
| Codex cron | Dual auth fix is present: production allows `x-vercel-cron: 1` or bearer `$CRON_SECRET`. | Manual bearer checks fail if `CRON_SECRET` remains unset; CurrentState flags it but no `.env.example` exists. | P2 | Add root `.env.example` / Vercel env checklist entry for `CRON_SECRET` and smoke-check it in deployment runbooks. |
| Codex cron concurrency | Pending job selection and `running` transition are not atomic. | Overlapping cron invocations can select the same pending jobs before either writes `running`. | P1 | Add a DB RPC/transaction that atomically claims pending jobs with `FOR UPDATE SKIP LOCKED` or conditional `status='pending'` update. |
| Stripe primary webhook | `api/stripe/webhook.ts` disables bodyParser, reads raw body, and calls `stripe.webhooks.constructEvent()` before processing. | Primary subscription webhook is correctly signature-validated. | P2 | Keep coverage; ensure Vercel config preserves raw body behavior. |
| GATE Stripe webhook | `api/gate/_handler.ts` constructs the Stripe event from `Buffer.from(JSON.stringify(req.body ?? {}))`. | If Vercel parses the body first, signature verification can fail or become brittle due to JSON reserialization. | P1 | Add `bodyParser:false` for delegated Gate webhook or separate raw-body webhook handler. |
| CORS | Shared `applyCorsHeaders()` defaults `Access-Control-Allow-Origin` to `*` when `CORS_ORIGINS` is unset. | Production misconfiguration silently opens cross-origin access for routes using this helper. | P1 | In production, fail closed or default to canonical configured host; keep wildcard only for explicit local/dev. |
| Input validation | Many routes use direct `req.body` reads without zod schemas (`api/billy.ts`, `api/gen-engine/artifacts.ts`, `api/creation-corner/synthesize.ts`, module demos). | Invalid shapes and oversized payloads rely on ad hoc trimming rather than central validation. | P2 | Add zod schemas per public/user-data route with size limits and normalized payloads. |
| Gate admin behavior | `isAdminRequest()` returns true when `GATE_ADMIN_KEY` is unset. | Mock-payment/admin behavior can be available by omission of env var. | P1 | In production, require `GATE_ADMIN_KEY` for admin-only or mock-payment actions. |

## Phase 3: Architectural Gaps & Missing Test Coverage

### Coverage map

| Surface | Has tests? | Existing coverage found | Minimum additional test contract |
|---|---:|---|---|
| Billy message routing (`api/billy/` / `api/billy.ts`) | Yes, partial | `api/__tests__/billy-api.test.ts`, `api/__tests__/billy.test.ts`, `api/__tests__/billy.name.test.ts`, `api/__tests__/endpoints.test.ts` | Add auth-boundary tests proving unauthenticated requests cannot write user-scoped rows using body/header `userId`; include one anonymous happy path. |
| Transcriptory transcribe endpoint | Yes, partial | `api/__tests__/transcriptory.test.ts`, `client/src/tests/transcriptory-api.test.ts` | Add stuck/poll-timeout status update test and concurrent same-capture test. |
| Gen-engine resonance | Yes, shared/local | `api/__tests__/gen-engine.test.ts` covers shared scoring; gen-engine room wiring tests exist client-side. | Add route-level malformed body test and explicit no-persistence contract or auth requirement. |
| Inner-world artifacts pagination | Yes | `api/__tests__/production-fix.test.ts` clamps `limit=1000` to range 25..124. | Add client helper test ensuring default fetch remains bounded and no caller passes unbounded limit. |
| Codex drain cron dual-auth | Yes | `api/__tests__/production-fix.test.ts` covers bearer fallback. | Add overlap/claim race test once DB claim RPC exists. |
| Stripe webhook handler | Partial | Stripe checkout tests exist; primary webhook code is raw-body safe. | Add webhook signature tests for both `api/stripe/webhook.ts` and GATE delegated webhook, including tampered body error path. |
| Auth middleware / session guard | Yes, partial | `client/src/tests/auth-redirect.test.ts`, dashboard/session tests, route guard logic in app. | Add API inventory test that all user-data route files call an approved auth helper. |
| Embodiment profile loading | Yes | `api/__tests__/embodiment.test.ts`, `tests/room-runtime-alignment.test.ts`, `client/src/tests/embodiment-runtime.test.ts` | Add generated-registry freshness test comparing JSON profile slugs to `shared/embodiment/generated.ts`. |

### Coupling narrative

- **LLM cascade (`routeLlm`)** is documented in-code and implemented as a free/local-first provider order: Ollama, Groq, HuggingFace, OpenRouter, Gemini, Anthropic, OpenAI. It fails closed with respect to exceptions escaping the route, but fails open from a product standpoint: if no provider is configured or all providers fail, it returns an `offline-fallback` response. User-visible behavior is therefore a synthetic fallback message, not an HTTP error.
- **Embodiment profiles** have two sources: JSON/Markdown source files in `embodiment_profiles/` and generated runtime TypeScript in `shared/embodiment/generated.ts`. Runtime imports use `shared/embodiment/index.ts`, which imports the generated registry. The seam is `scripts/sync-embodiment-profiles.ts`; without running it, JSON changes are not live.
- **Billy vs. gen-engine boundary** is conceptually clear but practically porous. Billy owns chat/retrieval, memory, founder context, and embodied response generation. Gen-engine owns artifact synthesis/scoring/export. Overlap appears through shared `routeLlm()`, user identity context, and downstream artifact paths that can end up in Inner World through Codex. Neither boundary currently enforces a single identity contract.
- **Creation Corner `freeText` JSON bug** appears partially fixed on the client: `CreationCornerPage.tsx` now uses blueprint markdown or raw `freeText` instead of `JSON.stringify(blueprint)`. The legacy API contract remains split: `api/creation-corner/synthesize.ts` expects `{ text, artifact_type, synthesis_style, destination, user_id }`, but the active client primarily calls `/api/gen-engine/artifacts` and `/api/codex/forge`. This means the old route can drift and still accept `user_id` while the UI-level fix does not exercise it.
- **`constants.ts` vs `shared/`** is not a true constants conflict; root `constants.ts` re-exports lucide icons and should be renamed or moved because its name implies domain constants. Shared constants are domain-specific inside submodules.
- **`types.ts` vs `shared/`** is mild drift risk: root `types.ts` only defines `LayoutPreferences`, imported by Adaptive Layout components. Runtime/domain types live under `shared/*/types.ts`. The root file should either move under `client/src` or become a proper shared UI type module.

## Phase 4: Actionable Refactor & Testing Plan

| File | Issue | Risk | Fix Shape |
|---|---|---:|---|
| `api/billy.ts`, `api/_lib/user.ts` | Billy can persist/log under request-supplied `userId` when auth is absent. | P0 | Derive persisted identity only from validated auth; isolate anonymous chat to non-user-scoped storage or no storage. |
| `api/billy-bucket-drop.ts` | Bucket drops write `user_id` from body/header/query without auth. | P0 | Require `getAuthUser()` / `requireAuth()` before DB write or use server-generated anonymous ids. |
| `api/gen-engine/artifacts.ts` | Artifact creation trusts `body.userId`. | P1 | Add auth to persisted/user-context artifact creation and ignore caller-supplied user id. |
| `api/creation-corner/synthesize.ts` | Legacy Creation Corner route trusts `body.user_id`. | P1 | Deprecate route or add auth/session-derived identity and zod validation. |
| `api/gate/_handler.ts` | GATE Stripe webhook reconstructs body before signature validation. | P1 | Use raw-body webhook handler with `bodyParser:false`, or route webhooks to a dedicated file. |
| `api/_lib/cors.ts` | Production CORS defaults to wildcard if `CORS_ORIGINS` is unset. | P1 | Fail closed or default to canonical host in production; require explicit wildcard for dev only. |
| `api/cron/codex-drain.ts`, `api/codex/_persistence.ts`, `workers/codex/runner.ts` | Codex job claim is not atomic across overlapping cron runs. | P1 | Introduce Supabase RPC/transaction to claim pending jobs with locking/conditional status update. |
| `api/transcriptory/transcribe.ts` | Failed transcription/enrichment leaves capture row processing forever. | P1 | On catch, update authenticated capture to `failed` with diagnostic error metadata. |
| `api/transcriptory/transcribe.ts` | Concurrent uploads for same capture are last-write-wins. | P1 | Add processing status claim and reject duplicate active transcription for the same capture. |
| `api/inner-world/artifacts.ts`, Supabase migration | Upsert conflict target is only `source_ref`. | P1 | Add composite unique key on `(user_id, source_ref)` and update upsert conflict target. |
| `api/gate/_handler.ts` | `GATE_ADMIN_KEY` unset means admin request checks pass. | P1 | In production, treat missing `GATE_ADMIN_KEY` as admin disabled, not admin open. |
| `api/transcriptory/transcribe.ts` | Bounded AssemblyAI loop can exceed serverless timeouts. | P1 | Convert to async job/polling model or cap attempts beneath Vercel function budget. |
| `api/billy.ts`, `api/gen-engine/artifacts.ts`, `api/creation-corner/synthesize.ts`, `api/transcriptory/*.ts` | Input validation is inconsistent and mostly ad hoc. | P2 | Add zod schemas and max-size limits for route bodies/headers/query params. |
| `docs/VERCEL_ENV_CHECKLIST.md`, root env docs | `CRON_SECRET` is referenced but no root `.env.example` exists. | P2 | Add env template/checklist entries for `CRON_SECRET`, `CORS_ORIGINS`, AssemblyAI, Codex bucket, Stripe secrets. |
| `api/__tests__/production-fix.test.ts`, new cron tests | Codex drain dual-auth is tested, but concurrency is not. | P2 | Add tests around atomic claim/RPC once implemented. |
| `api/__tests__/transcriptory.test.ts` | No stuck-job failure-row test. | P2 | Test timeout/provider error updates capture to failed. |
| `api/__tests__/stripe-webhook.test.ts` (new), `api/__tests__/gate.test.ts` | Webhook signature coverage is incomplete for both primary and GATE webhooks. | P2 | Add raw valid event, missing signature, tampered payload tests. |
| `api/__tests__/auth-inventory.test.ts` (new) | No inventory guard for user-data routes. | P2 | Static test scans route files for approved auth helper before DB/storage writes. |
| `workers/`, `worker/` | Plural and singular worker directories are both active but confusing. | P3 | Document naming: `worker/trainer` vs `workers/codex`, or consolidate under domain directories. |
| `agent_trainer/`, `agents/`, `.agents/` | Agent-related directories serve different audiences with unclear ownership. | P3 | Add repo map section explaining runtime vs package corpus vs operator skills/personas. |
| `dist/` | Build output is git-tracked despite ignore rules. | P3 | Remove tracked build artifacts and keep source static assets under `public/`. |
| `server/` Python files | Legacy Python engines coexist with TS/Vercel runtime. | P3 | Mark active scripts vs archived engines and move dead Python services under archive if unused. |
| `constants.ts` | Root file name hides that it only re-exports icons. | P4 | Rename/move to `client/src/lib/layoutIcons.ts` or similar. |
| `types.ts` | Root `LayoutPreferences` lives outside `shared` and `client/src`. | P4 | Move to client UI types or shared UI types and update imports. |
| `.gitignore` | Duplicate `dist/` and `node_modules` entries. | P4 | Clean ignore file after untracking build output. |

## Appendix: Dead Code & Redundancies

| Candidate | Status / rationale | Confidence |
|---|---|---:|
| `workers/` vs `worker/` | Not duplicate: `workers/codex` is active via cron/job APIs; `worker/trainer` is active via `npm run trainer:worker`. Naming is confusing but both are live. | High |
| `agent_trainer/` | Not dead: acts as package-builder/source-library corpus and ingestion source, not runtime code. Large manifest exports should be reviewed for bloat. | Medium |
| `agents/` | Likely low/no active runtime import chain in current Vercel app; appears to be persona/config assets. Keep until persona packaging ownership is clarified. | Medium |
| `.agents/` | Not runtime; active operator/AI skill system for this workspace and intentionally excluded from Vercel. | High |
| `dist/` | Generated build output should not be tracked. Static assets should move/remain in `public/`; tracked `dist/public/*` can likely be removed after confirming no only-copy assets. | High |
| `requirements.txt` | Not orphaned: `package.json` has `setup:python`, many scripts are Python, and server has legacy Python modules. Needs dependency accuracy audit, not deletion. | High |
| `agent_trainer.sh` | Not unreferenced: package scripts call it for Agent Trainer setup/status/test/worker. | High |
| `server/index.ts` | Optional local/static Express server; not Vercel primary path but referenced by `npm run server`. | High |
| `server/gestaltview_generative_engine.py`, `server/creation_corner_engine.py` | Likely legacy/adjacent Python engines; no current Vercel import chain found. Archive only after confirming no scripts/operators call them. | Medium |
| Root `constants.ts` | Misnamed tiny UI icon barrel; safe to move/rename with import updates. | High |
| Root `types.ts` | Tiny Adaptive Layout UI type; safe to move under client/shared UI types with import updates. | High |
