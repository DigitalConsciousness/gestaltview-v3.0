# CurrentState — Shopify storefront Phase 0/1 implemented (2026-08-01)

**Scope:** Implemented the approved Shopify storefront specification through its
explicit Phase 0/Phase 1 boundary. No Shopify product, connected-store, Vercel,
Stripe, or production Supabase mutation was performed. Phase 2 checkout,
webhook, entitlement, and fulfillment work remains gated.

## Changed

- Implemented the separately deployable Next.js 16 storefront in
  `shopify-storefront/`, including its server-rendered Shopify catalog adapter,
  fallback terminal, issued-edition route, primary-app handoffs, responsive
  industrial visual system, reduced-motion behavior, Vercel environment
  contract, and isolated Turbopack root.
- Added `/store` as the canonical three-lane Artifact Exchange and
  `/store/artifacts/:handle` as the issued-edition deep view.
- Redirected legacy public pricing entry points to the exchange and routed the
  collaborator lane into the existing relationship-first founder-review flow.
- Added a server-only, pinned `2026-07` Shopify Storefront API catalog adapter.
  It allowlists public fields, validates explicit offer/commerce-route values,
  rejects incomplete edition records, and returns a safe launch fallback when
  Shopify is unconfigured.
- Added app-owned Shopify metaobject/metafield definitions, server-only
  environment documentation, and the Phase 0 offer/security audit.
- Kept artifact checkout visibly disabled pending Phase 2 evidence.
- Corrected the existing GATE detail contract so founder-review orders retain
  `request_review` compatibility and draft status until a quote is issued.

## Observed

- The isolated `shopify-storefront` ESLint run passes with no warnings.
- Its Next.js production build passes and emits dynamic `/` and
  `/artifacts/[handle]` routes.
- A local production-server request to `/` returns `200` with the three lanes,
  safe fallback orientation edition, canonical requisition handoff, metadata,
  and disabled paid-issuance state in the server-rendered HTML.
- Focused Shopify/GATE verification passes: **14/14 tests across 2 files**.
- `pnpm exec tsc --noEmit --pretty false` passes.
- `pnpm run build` passes after transforming **5,441 modules**.
- `git diff --check` passes.
- Playwright CLI browser verification was attempted for both surfaces, but the environment lacks
  system Chrome at `/opt/google/chrome/chrome`; no browser observation or
  screenshot is claimed.

## Release boundary

- Shopify CLI app linking/definition deployment, connected-store catalog
  reads, plan eligibility, real product values, and preview-origin checks are
  unobserved.
- Production GATE migration/RLS state and two-identity denial evidence remain
  unobserved.
- Phase 2 may not begin until these Phase 0 external checks are dispositioned
  and checkout/fulfillment work is separately authorized.

---

# CurrentState — Inside-Out Convergence Phase 8 Sanctuary (2026-07-30)

**Authority:** The founder explicitly accepted the Phase 7 fixture and recovery
path and authorized Phase 8 work in the current `main` worktree. Phase 9 has not
begun.

## Known

- Sanctuary already used the owner-scoped `journals`, `scrapbook_items`, and
  private `user_files` paths, plus the local keys
  `gv.sanctuary.journal.v1` and `gv.sanctuary.scrapbook.v1`.
- The existing journal schema modeled one current document per user but could
  not represent source lineage, archive state, revisions, or recoverable
  concurrent-edit conflicts.
- Sanctuary browser speech previously wrote directly into the journal and did
  not preserve a raw Transcriptory audio source.
- AssemblyAI rejected the configured deprecated `universal-3-pro` model and
  instructed the runtime to use `universal-3-5-pro`.

## Attempted and changed

- Added the local-only Phase 8 migration
  `20260730010000_sanctuary_convergence_v1.sql`. It extends the existing
  Sanctuary tables with source, archive, and revision metadata and adds a
  private owner-scoped conflict-version recovery table. It has not been applied
  to production.
- Journal writes now use optimistic timestamps. A material stale write returns
  `409` and preserves both local and remote payloads instead of overwriting.
- Journal and scrapbook surfaces visibly distinguish `local only`, `syncing`,
  `synced`, and conflict-recovery state while retaining their existing browser
  caches.
- Sanctuary voice now records real audio through `MediaRecorder`, creates and
  transcribes the source through Transcriptory, offers and acknowledges a
  durable Sanctuary handoff, then asks the user to choose journal, scrapbook,
  or capture-only. Browser speech recognition is no longer the durable path.
- Transcriptory now submits AssemblyAI model priority
  `["universal-3-5-pro", "universal-2"]`.
- Scrapbook uploads now truthfully identify `roomOrigin: "sanctuary"` and retain
  optional Transcriptory source lineage.

## Observed

- Focused Phase 8/Transcriptory verification passes: **34/34 tests across 5
  files**.
- `pnpm exec tsc --noEmit --pretty false` passes.
- `git diff --check` passes.
- Three build attempts transformed all **5,435 modules**, then were externally
  killed during chunk rendering (`SIGTERM` twice and `SIGKILL` once). This is
  environmental/resource evidence, not a passing build receipt.
- The Vite development server starts successfully after approved local port
  access. The Playwright wrapper could not launch because it requires system
  Chrome at `/opt/google/chrome/chrome`; only cached Chromium was present.
- Local Supabase migration/RLS execution and production persistence remain
  unobserved.

## Developmental state and gate

- Sanctuary Phase 8 is **integrated and locally evaluated** at focused API,
  contract, and type-check boundaries.
- Production migration, live owner-isolation/storage proof, successful
  production build, and browser screenshot remain open.
- **Authority: Hold** at the Phase 8 evidence gate. Do not begin Phase 9 or
  claim Sanctuary production-operational until the missing receipts are
  recovered or explicitly dispositioned.

---

# CurrentState — Insight-Bot runtime bridge integrated (2026-07-30)

**Scope of this pass:** Adapted the supplied
`Insight-Bot-GestaltView-Alignment-2026-07-29.zip` into the current GestaltView
runtime. No production migration, deployment, credential rotation, or external
Reddit/Discord/Devvit mutation was performed.

## Known / Changed / Evidence

- **Known:** Insight-Bot remains a public integration doorway, not a second
  runtime, private-memory store, or Billy identity.
- **Changed:** Added the versioned shared adapter contract and the native
  `POST /api/insight-bot/respond` runtime endpoint backed by GestaltView's
  existing LLM router.
- **Changed:** The endpoint requires a server token, preserves original input,
  rejects private-memory requests, emits approval-gated proposals, filters
  public artifact proposals, returns trace metadata, and prevents automatic
  public posting on a detected crisis path.
- **Changed:** Added a private, RLS-enabled Supabase bridge migration and
  integration/operator documentation. Persistence is modeled but intentionally
  not connected until installation identity, retention, and consent policy are
  approved.
- **Evidence:** Focused contract tests, TypeScript/build validation, and
  formatting checks pass. Local migration lint was attempted but could not
  connect because the local Supabase/Postgres stack was not running.
- **Boundary:** Production token configuration, migration application,
  channel-adapter wiring, historic credential rotation, and live platform
  posting are not observed and must not be claimed as operational.

---

# CurrentState — Runtime skill layered audit and refinement (2026-07-28)

**Scope of this pass:** Installed the user-provided `gestaltview-layered-audit` and `gestaltview-refine-skills` packages, used both on the canonical GestaltView v3 app-runtime skill, and made no production or user-visible runtime mutation.

## Known / Attempted / Observed / Changed

- **Known:** The live route registry, package scripts, auth boundary, LLM router, existing runtime skill, skill catalog, and recent CurrentState evidence conventions were inspected.
- **Attempted:** Ran the two-pass lineage/operation audit, then refined the runtime skill as a bounded collaboration contract with progressive context and explicit evidence states.
- **Observed:** The earlier skill had useful runtime anchors but still named `gestaltview-v2`, loaded broad/Billy-specific context by default, and did not distinguish existence, execution, persistence, reopening, or observed behavior.
- **Changed:** Added both skills to the canonical catalog, updated the runtime skill for GestaltView v3, and recorded the full audit at `docs/audits/gestaltview-app-runtime-layered-audit-2026-07-28.md`.

## Evidence boundary

- This pass establishes repository artifact and structural-validation evidence only.
- No preview, production deployment, production Supabase state, or end-user outcome was exercised or claimed.
- The refined skill should be forward-tested on the next representative runtime patch; that later receipt should label unit, build, intercepted browser, preview, and production evidence separately.

---

# CurrentState — Inside-Out Convergence Phase 7D (2026-07-29)

**Audit frame:** Complete the bounded
`Transcriptory → Blackboard → Creation Corner` proof and inform the Phase 7
outside-review decision. The authoritative sources are the convergence spec,
the shared v1 handoff contract, Phase 7 room adapters, the server-mediated
handoff API, and the focused test observations below. This work did not apply
the handoff migration to production, deploy, or begin Phase 8.

## Known

- The Phase 7C blueprint offer preserved Blackboard capture references but did
  not carry an accepted originating Transcriptory reference into the Creation
  Corner offer.
- The shared handoff API derives ownership from authentication and filters
  reads and writes by owner. The migration models RLS and immutable lifecycle
  evidence, but this Phase 7D run did not establish production application.
- Browser compatibility packets remain transport hints; shared handoff records
  and receipts are the modeled durable authority.

## Attempted and changed

- Added the harmless Phase 7 fixture in
  `client/src/tests/phase7-three-room-proof.test.ts`.
- Blackboard blueprint offers now include deduplicated
  `originating_source` references alongside the distinct Blackboard blueprint
  and capture references. Private blueprint body text remains excluded.
- Blackboard forwards those source references in the existing compatibility
  packet after the durable offer succeeds.
- Creation Corner renders the originating source reference visibly and retains
  its retry-safe acknowledgment behavior.
- Added an actionable unavailable-destination proof: a declined Creation Corner
  handoff produces a visible, specific acceptance error and no transition.

## Observed

- The fixture demonstrates same-owner success across two accepted handoffs,
  cross-owner `not found` behavior, idempotent replay of both handoff IDs, and
  source lineage at every hop.
- The fixture keeps seven identities distinct: Transcriptory source capture,
  transcription derivative, cited Blackboard collaboration record, Blackboard
  blueprint, Transcriptory handoff, Creation Corner handoff, and Creation
  Corner destination record.
- The complete focused Phase 7 set passes: **29/29 tests across 7 files**.
- `pnpm exec tsc --noEmit --pretty false` passes.
- `pnpm exec vite build` passes after transforming **5,434 modules**.
- `git diff --check` passes.

## Layered audit orientation

- **Source preservation and room lineage:** demonstrated and evaluated in the
  bounded fixture; aligned with the source/derivative distinction.
- **Owner isolation and replay:** demonstrated at the client adapter and
  server-API test boundaries; production RLS operation remains unobserved in
  this phase.
- **Destination failure:** demonstrated as actionable and non-mutating.
- **Developmental state:** integrated and locally evaluated. Production
  operational status remains unknown until the migration is applied and the
  same fixture is observed against that approved environment.
- **Authority:** **Bridge** for the Phase 7 implementation and local evidence;
  **Hold** on Phase 8 until the outside guide accepts the Phase 7 fixture and
  recovery path. The founder/outside guide retains the decision.

---

# CurrentState — Relationship-first collaborator requisition prepared (2026-07-28)

**Scope of this pass:** Converted the approved custom-collaborator launch design into a reviewable Priority 1 implementation without applying production DDL.

## What changed

- Added the relationship-first requisition route and redirected the existing package-builder front door through it.
- Made identity, embodiment, skills, provenance, boundaries, memory contract, founder review, scoped payment, and tracked delivery visible in the buyer journey.
- Preserved Priority 2 by keeping the underlying self-serve builder reusable while forcing Priority 1 requisitions into founder review.
- Added per-order buyer access tokens, persisted only as SHA-256 hashes, and required the token for order-status reads.
- Moved buyer tokens to URL fragments so they do not enter request logs or referrer headers.
- Changed the GATE Stripe webhook path to verify the exact raw request bytes.
- Added a server-only GATE schema migration, private generated-ZIP bucket, indexes, RLS, service-role grants, and removal of the unsafe legacy public deliverables read policy.
- Added focused GATE regressions for missing-token rejection and founder-review enforcement.
- Documented the launch contract and production deployment gate in `docs/launch/relationship-first-requisition.md`.

## Verification performed

- Executed the full migration inside a transaction against the connected GestaltView Supabase project and rolled it back; PostgreSQL accepted the DDL with no persisted changes.
- Production migration application, Stripe test-mode purchase, build execution, private artifact retrieval, deployment, and browser E2E remain gated on branch verification and review.

---

# CurrentState — Render contract v2 boundary proof continued (2026-07-27)

**Scope of this pass:** Re-ran the Inside-Out Convergence baseline, independently verified the recorded Phase 1 PostgreSQL fixtures, completed the local Phase 2 server proof, and converged Creation Corner on the canonical Phase 3 render/projection path without applying production DDL.

## What changed

- Made `contractVersion: "gestaltview.render-request.v2"` an exact, required field at the strict server parser, JSON Schema, and canonical browser client boundaries.
- Kept the temporary observed Creation Corner legacy translation, which now explicitly produces the same versioned internal request.
- Added an API integration fixture proving unauthenticated rejection, a supported deterministic HTML render with real nonzero bytes and a matching SHA-256 receipt, and a required unsupported target that durably prevents `ready`.
- Added client and parser regressions proving versioned canonical submission and rejection of unversioned canonical envelopes.
- Added owner-scoped status and projection integration coverage, including signed retrieval, cross-owner denial, non-ready rejection, idempotent projection, and source-reference preservation.
- Strengthened projection so downloaded HTML must match the durable receipt byte count and SHA-256 before an Inner World record can be created.
- Replaced Creation Corner's direct legacy render request with `submitNextGenRender`, preserved clearly labeled local previews and retry behavior, removed automatic Inner World insertion, and exposed **Project to Inner World** only after durable `ready`.
- Preserved `source_ref` and `content_ref` through the Inner World API/client adapter, classified displayed artifacts as verified projection, server legacy, local draft, manual import, or unknown legacy, and surfaced render job/artifact provenance only for verified projections.
- Added `tests/e2e/creation-corner-render-projection.spec.ts`, a deterministic Chromium fixture proving the browser-visible sequence `local preview → versioned render request → ready receipt → idempotent retry → explicit projection → expected Inner World marker`.
- Added a separately gated live Phase 5 harness and runbook. It signs in two disposable Supabase users, exchanges their sessions into app cookies, verifies real ledger/storage/projection rows from a trusted runner, downloads the owner-signed artifact and recomputes SHA-256, proves API and direct-RLS cross-owner denial, verifies idempotent job/projection reuse, captures the Dynamic Inner World marker, and can clean up only its exact disposable namespace.
- Added `phase5:proof:browser` and `phase5:proof:live` scripts plus a committable secret-free `.env.phase5.example`. Remote and production targets are hard opt-ins; production remains an explicit post-preview approval gate.

## Verification and gates

- The Phase 1 v1-upgrade, read-only verification, and emergency recovery assertions passed in isolated PostgreSQL 17 with the legacy job/artifact/Inner World rows preserved.
- The forward reconciliation also passed after the historical July 13 v2 migration had already run.
- Migration SHA-256: `0a24680d9e651675a07dee7ec06034ccd749832de9f7bdcc2005d7af16f574ec`.
- Production Supabase remains unchanged and requires explicit approval.
- Phase 0 orientation checks currently report missing `.orientation` packet files, missing `artifacts/latest.zip`/README continuity evidence, and stale collaborator mirrors. These pre-existing repository evidence gaps were not silently repaired as part of the render slice.
- Phase 2's local acceptance matrix is covered. Preview/development infrastructure proof and production smoke remain separately gated.
- Phases 3 and 4 are implemented locally with focused contract coverage. Existing server and local records remain read-time adapted; no legacy artifact was rewritten or deleted.
- Phase 5's deterministic browser contract passes in Chromium and writes `output/playwright/creation-corner-render-projection-proof.png`.
- The deterministic browser fixture intercepts APIs and therefore is not proof of real Supabase rows, private object storage, signed retrieval, or RLS. The new live harness is ready to capture that evidence once an approved preview/development URL, two disposable identities, and trusted runner credentials are supplied; it has not been executed against external infrastructure in this pass. Production smoke remains separately gated.

---

# CurrentState — Render pipeline v2 live reconciliation prepared (2026-07-26)

**Scope of this pass:** Completed the Phase 0 production read-only baseline and prepared the forward-only Phase 1 reconciliation required by `specs/launch/GestaltView_Inside_Out_Convergence_SPEC_2026-07-25.md`. Production DDL remains unapplied.

## What is now locally proven

- Generated `supabase/migrations/20260726132511_render_pipeline_v2_live_reconciliation.sql` with the installed Supabase CLI rather than renaming, repairing, or marking the skipped July 13 migration.
- Added `supabase/verification/render_pipeline_contract_v2.sql`, which runs inside a read-only transaction and reports the render columns, lifecycle constraint, indexes, RLS and policies, owner-null counts, lifecycle counts, incomplete receipts, duplicate projections, and private bucket state.
- Added a matching emergency recovery script and disposable PostgreSQL fixtures under `supabase/tests/`.
- Proved a v1-shaped fixture upgrades additively: one legacy `completed` job becomes `ready`, its artifact receives the safe MIME/byte/default receipt fields, and the legacy Inner World artifact remains present.
- Proved the reconciliation is safe after the historical `202607130001_render_pipeline_contract_v2.sql` has already run; repeated columns and indexes no-op while the lifecycle contract remains valid.
- The verification query intentionally reports the legacy fixture receipt as incomplete because no storage path or content hash exists. The migration does not fabricate durable proof for legacy bytes.

## Live read-only evidence

- Supabase migration history ends at `20260717014354`; `202607130001_render_pipeline_contract_v2.sql` is absent.
- The live render tables remain v1-shaped with zero `render_jobs` and zero `render_artifacts`.
- The 63 existing `inner_world_artifacts` remain present.
- RLS remains enabled on all three tables and `codex-exports` remains private.

## Remaining rollout gates

- The full Supabase local stack could not initialize in this Codespace because its service images exhausted the 32 GB filesystem. The failed empty stack and downloaded images were removed; the lightweight PostgreSQL fixture was used instead.
- Run the versioned migration and verification SQL on an approved Supabase development branch or equivalently provisioned clean environment before production review.
- Do not apply production DDL until the outside guide approves the Phase 1 evidence packet.
- Creation Corner, projection behavior, Founder Runtime, and corpus lifecycle were not changed in this slice.

# CurrentState — Creation Corner handoff and workbench restoration (2026-07-25)

**Scope of this pass:** Restored the richer blueprint synthesis workbench to Creation Corner and made incoming blueprint handoffs visibly activate their intended source.

### What changed

- Mounted the existing generative blueprint workbench on the live Creation Corner route while retaining the newer forge, Codex preview, and NextGen render pipeline.
- Added the incoming blueprint ID to local handoff events so an open Creation Corner selects the newly sent Blackboard blueprint instead of silently keeping an older selection active.
- Kept Dynamic Inner World routing behind its existing explicit destination and send controls.
- Added focused regression coverage for blueprint persistence and active-handoff identity.

### Validation performed

- Focused Creation Corner and Blackboard artifact run: 4 files and 7 tests passed.
- Changed TypeScript/TSX files passed isolated TypeScript syntax transpilation.
- `git diff --check` passed.
- Full `tsc`/Vite build attempts were terminated by the current workspace environment with `SIGTERM`; no compiler diagnostic was emitted before termination.

---

# CurrentState — Provider-neutral Digital Intelligence collaborator context (2026-07-25)

**Scope of this pass:** Made the default `.perplexity/` collaboration context portable across Digital Intelligence providers, directory names, checkout locations, current working directories, and repository payload names.

### What changed

- Added `gestaltview.di-context.v1` as the neutral root contract in `.perplexity/MANIFEST.json`.
- Added `.perplexity/COLLABORATOR.md` with collaborator identity, path, provenance, consent, and verification boundaries.
- Added `.perplexity/scripts/context_root.py` to resolve the context and repository payload roots without hardcoded names.
- Made the collaboration sync workflow honor `GESTALTVIEW_COLLABORATOR_ROOT`, discover payloads structurally, and write root-relative manifest paths.
- Added `sync:collaborator` and `sync:collaborator:check` while retaining the legacy `sync:perplexity` aliases.
- Reframed the primary README and directory index as provider-neutral entry surfaces.

### Validation performed

- Four portability regression tests passed, including renamed context/payload directories and invocation from an unrelated current working directory.
- `pnpm run sync:collaborator:check` passed.
- `.perplexity/MANIFEST.json` passed JSON parsing.
- `git diff --check` passed.

### Remaining boundary

- Historical snapshots and provider-specific source documents inside the payload retain their original names and language for provenance. They are reference material, not the active collaborator identity or path contract.

---

# CurrentState — Symbiote DI runtime and embodiment contract repair (2026-07-16)

**Scope of this pass:** Repaired the clean-build failure caused by canonical Symbiote presentation tokens drifting beyond the shared embodiment contract, and verified the Symbiote across the persistent DI selector and live DI prompt runtime.

### What changed

- Added the canonical Symbiote heartbeat values to the shared TypeScript contract: `implementation-lane`, `clean-glass`, `direct-then-detail`, `pulsing-map`, and `steady`.
- Added `the-symbiote` to the selector persona seeds as a global DI, backed by its canonical embodiment profile.
- Preserved `steady` pulse styling and added a disclosed Symbiote cyan pulse treatment.
- Repaired heartbeat enum normalization so valid hyphenated values are matched exactly instead of being truncated at the first hyphen and silently falling back.
- Added regression coverage for the profile contract, selector presence, canonical heartbeat resolution, active DI registry lookup, and runtime prompt/message construction.

### Validation performed

- Focused DI/embodiment Vitest run: 3 files and 12 tests passed.
- Broader DI/embodiment regression run: 14 files and 49 tests passed.
- Generated embodiment registry check passed for 25 profiles.
- `pnpm run build` passed with the same `tsc && vite build` command used by Vercel.

### Deployment status

- Prepared locally only. Not pushed, deployed, or production-verified in this pass.

---

# CurrentState — Render engine rooted integration (2026-07-16)

**Scope of this pass:** Removed the render runtime's dependency on `packages/nextgen-rendering-engine` and nested the canonical implementation under `shared/rendering/engine/`.

### What changed

- Copied the browser-safe contracts/validation and server-only sinks/backends/orchestrator into `shared/rendering/engine/`.
- Rewired API, client, shared source adapters, and tests to root-owned imports.
- Removed the root workspace dependency, TypeScript package aliases, package-first build step, and Vercel package include.
- Retained `packages/nextgen-rendering-engine/` only as historical/reference material; it is no longer a workspace or runtime source.
- Updated the canonical Symbiote architecture memory and regenerated derived embodiment artifacts.

### Capability status

- Safe Markdown-derived standalone HTML: **verified locally** after focused tests; production smoke remains required.
- JSON reference and Mermaid source artifacts: **partial**.
- SVG diagrams: **partial** because the fallback remains a disclosed placeholder.
- PDF/image/media/app builders: **planned/unsupported in the synchronous render endpoint** until a deployed worker path is verified.

### Deployment status

- Prepared locally only. No migration was applied, no deployment was made, and no production runtime or Supabase state was verified in this pass.

### Validation performed

- Focused Vitest run: 8 files and 26 tests passed.
- `pnpm exec tsc --noEmit` passed.
- `pnpm run build` passed with the rooted `tsc && vite build` pipeline.
- `git diff --check` and runtime import-boundary scans passed; no API, client, shared, server, or test import resolves through `packages/nextgen-rendering-engine`.

---

# CurrentState — Render pipeline contract v2 integrated locally (2026-07-14)

**Scope of this pass:** Integrated the Symbiote render repair package into canonical repository paths, reconciled it with the newer powerhouse artifact backends, and added the additive database contract without applying it.

### What changed

- Added strict canonical v2 render-request parsing with a temporary legacy Creation Corner translation, UUID owner resolution, and graph-aware user-scoped idempotency.
- Repaired presentation evaluation so alternate content/HTML representations are measured independently and repetition-only defects are repaired in the derivative without mutating source material.
- Updated deterministic document rendering, target verification, backend failure isolation, byte-aware private storage receipts, owner-scoped signed retrieval, and idempotent complete-HTML Gallery projection.
- Added request/result JSON schemas, six focused regression suites, and the additive `202607130001_render_pipeline_contract_v2.sql` migration with its conservative rollback under `supabase/rollback/`.
- Preserved the 17 powerhouse artifact backends by extending the repaired shared type contract and fixing their canonical factory imports.

### Validation performed

- Six focused Vitest files → 17 tests passed.
- `pnpm exec tsc -p packages/nextgen-rendering-engine/tsconfig.json` → passed after reconciling the powerhouse extensions.
- `pnpm exec tsc --noEmit` → passed.
- `pnpm test` → full Vitest suite passed.
- `pnpm run build` → package TypeScript, root TypeScript, and Vite production build passed.
- `git diff --check` and canonical-path scans → passed; runtime code has no dependency on the repair archive or its temporary extraction.

### Not deployed

- The v2 migration and rollback have not been executed.
- No preview or production deployment, external agent/skill import, authenticated Storage smoke, signed-URL ownership smoke, Gallery projection smoke, or Supabase advisor review has occurred.

---

# CurrentState — Render engine fold-in: canonical execution boundary established (2026-07-13)

**Scope of this pass:** Folded \`packages/nextgen-rendering-engine\` into the runtime as the single canonical scene-graph and render-execution boundary per \`SPEC_RENDER_ENGINE_FOLD_IN_v1.md\`.

### What changed

- **Slice 1 — Contract and sink consolidation:** Added \`RenderJobState\`, \`ArtifactSourceRef\`, \`RenderTarget\`, \`ArtifactSink\` interfaces to the canonical types in \`packages/nextgen-rendering-engine/src/core/types.ts\`. Implemented \`MemoryArtifactSink\` (tests), \`FileArtifactSink\` (CLI), and \`SupabaseArtifactSink\` (runtime). Created \`browser.ts\` and \`server.ts\` entry points. Updated \`package.json\` exports with \`./browser\` and \`./server\` subpaths.
- **Slice 2 — Unified engine endpoint:** Full-file replaced \`api/render/engine.ts\` with an authenticated, source-family-aware endpoint that classifies targets into sync/async/unsupported lanes, creates \`render_jobs\` rows, executes sync targets through the canonical engine, enqueues async targets, and returns a truthful response envelope with diagnostics.
- **Slice 3 — Concrete backends:** Refactored \`DocumentBackend\` with an injectable markdown rendering strategy. Updated \`DiagramBackend\` to try Mermaid node-API rendering and fall back to truthful SVG placeholders. Changed \`shared/rendering/pdf.ts\` fallback from silently returning HTML bytes as PDF/PNG to throwing an honest error.
- **Slice 4 — Client surface:** Replaced \`client/src/lib/rendering/sceneGraph.ts\` with re-exports from the canonical \`@gestaltview/nextgen-rendering-engine\` package, preserving \`orderContainedNodes()\` helper and backward-compatible aliases.
- **Slice 5 — Source-family adapters:** Created \`shared/rendering/adapters/\` with pure, deterministic converters for \`generated_artifact\`, \`codex_artifact\`, \`created_artifact\`, \`transcriptory\`, and \`capture_orb\` source families.
- **Slice 6 — Gallery approval gate:** Added \`api/render/promote-to-gallery.ts\` with explicit user-approval gating. No render artifact auto-promotes into Inner World/Museum.
- **Slice 7 — AI Orchestrator pragmatism:** Added \`api/render/idempotency.ts\` for stable idempotency-key generation and duplicate detection. Sync targets complete in-request (25s timeout), async targets enqueue, unsupported targets get honest diagnostics. Partial failures never erase successful siblings.
- **Slice 8 — Status polling:** Added \`api/render/status.ts\` (GET) for polling render job state with artifact details when ready.

### Hotfix — Vercel workspace package resolution (2026-07-13)

- Added `packages/*` to `pnpm-workspace.yaml`, moved pnpm overrides into workspace configuration, and declared `@gestaltview/nextgen-rendering-engine` as a root `workspace:*` dependency so Vercel `pnpm install --frozen-lockfile` links the local render engine package.
- Updated the root `build` script to compile `packages/nextgen-rendering-engine` before the app TypeScript and Vite build, and added root TypeScript paths for the package browser/server entrypoints to keep local strict checks aligned with workspace resolution.
- Tightened render endpoint request narrowing for `scene_graph` versus artifact-backed source families and restored package validation exports/types so `pnpm run build` and the package tests pass locally.

### Hard gates

- One canonical scene graph: \`nextgen.scene-graph.v1\`
- One top-level render execution boundary: \`api/render/engine.ts\` → \`GestaltRenderEngine\`
- \`render_jobs\` and \`render_artifacts\` persistence wired
- Private storage only; authenticated signed URLs required for client access
- Explicit user approval required before gallery projection
- Source language and provenance preserved in all adapter paths
- HTML bytes never labeled PDF/PNG
- JSON plans never labeled completed media

### Branch and deployment

- Implementation branch: \`feat/render-engine-fold-in\` on \`gestaltview-di/gestaltview_v3.1\`
- Vercel functions config already includes \`packages/nextgen-rendering-engine/**\` in \`api/render/*\` scope
- Supabase tables \`render_jobs\` and \`render_artifacts\` exist with RLS enabled; both empty at start, populated by this fold-in

### Validation required

- \`pnpm exec tsc --noEmit\`
- \`pnpm run build\`
- \`pnpm test\`
- \`git diff --check\`
- Endpoint contract tests (auth, ownership, idempotency, partial failure)
- Vercel deployment verification

---

# CurrentState — Meticulous route and replay guard aligned (2026-07-11)

**Scope of this pass:** Kept the existing Vite recorder behavior aligned with the live Wouter route table and added CI guards for route-index drift and accidental recorder injection into replay builds.

### What changed

- Added `scripts/validate-meticulous-route-coverage.mjs`, which checks every `path="..."` route in `client/src/App.tsx` against `docs/meticulously-route-index-regex-strict.txt`, including dynamic route parameters.
- Added the `meticulous:routes` package script and a focused Vitest regression test.
- Added the route check to `.github/workflows/meticulously.yml` and made the replay artifact fail if it contains the recorder snippet.

### Validation performed

- `pnpm run meticulous:routes` → validated 112 client routes.
- `pnpm vitest run tests/meticulous-route-coverage.test.ts` → passed.
- Direct Vite config smoke checks → development injects a non-production recorder, explicitly enabled production injects a production recorder, and `METICULOUS_BUILD=true` omits it.
- Authenticated Meticulous project inspection → active `gestaltview-v3.0` project and repository recording token match.

### Deferred / risk

- The full local Vite bundle build was terminated by this runner with `SIGTERM` during chunk rendering, even with the CI 4 GB heap setting; the route and recorder-config checks passed independently.
- Meticulous reported no relevant sessions because the base commit had no usable repo-mapped coverage data; the cloud golden-set run still needs a GitHub/Meticulous run with mapped coverage.

# CurrentState — Spotify playlist items API compatibility restored (2026-07-11)

**Scope of this pass:** Fixed Musical DNA's Spotify import path for Spotify's current playlist response shape, which reports playlist totals under `items.total` and returns entries under `item`.

### What changed

- Updated `client/src/lib/spotify.ts` to read current playlist totals while retaining the deprecated `tracks.total` fallback.
- Switched playlist track loading to `/playlists/{id}/items?limit=50`, reads current `item` entries, follows playlist pagination, and retains legacy `track` compatibility.
- Added focused regression coverage for the current Spotify summary and track response fields.

### Validation performed

- `pnpm vitest run client/src/tests/musicaldna-spotify.test.ts` → passed (8 tests).

### Deferred / risk

- Live browser verification with the connected Spotify account is still needed to confirm the deployed client has these changes and that the account's playlists are accessible under the granted scope.

---

# CurrentState — Vercel source map build restored for Meticulous (2026-07-11)

**Scope of this pass:** Fixed the production build failure introduced while enabling source maps for Meticulous session replay diagnostics.

### What changed

- Removed the TypeScript `declarationMap` setting from the no-emit root `tsconfig.json`; `declarationMap` requires declaration or composite emit and was blocking `pnpm run build` on Vercel.
- Enabled Vite production source map output when Sentry upload is not active, while preserving hidden source maps for Sentry-uploaded builds.
- Kept the Meticulous production Vite config mirror aligned with the active Vite config.

### Validation performed

- `pnpm run build` → passed.

### Deferred / risk

- Public production source maps are now emitted unless Sentry upload is active; this supports Meticulous replay debugging but intentionally exposes bundled source map files for hosted assets.

---

# CurrentState — Spotify playlist local-track imports restored (2026-07-11)

**Scope of this pass:** Fixed Musical DNA's Spotify playlist loader so playlist entries that Spotify exposes as local files without canonical track IDs still count as importable content instead of collapsing the selected playlist to 0 loaded tracks.

### What changed

- Updated `client/src/lib/spotify.ts` to keep local Spotify playlist tracks when `track.id` is missing, using the Spotify local URI or a deterministic fallback ID so Musical DNA can import the playlist.
- Added Vitest coverage for Spotify playlist items that have names and local URIs but no Spotify track ID.

### Validation performed

- `pnpm exec vitest run client/src/tests/musicaldna-spotify.test.ts` → passed.

### Deferred / risk

- This local fix preserves Spotify local-file metadata for analysis/import, but Spotify still does not provide playable previews for those local files.

---

# CurrentState — Billy voice stack swapped to Deepgram for hosted playback and LiveKit transport (2026-07-10)

**Scope of this pass:** Replaced the Billy voice runtime with the Deepgram-backed bundle, switched hosted voice playback to Deepgram, and updated the client/operator surfaces so browser speech is an explicit fallback rather than the default story.

### What changed

- Replaced the active `billy_voice/` runtime with the Deepgram worker, STT/TTS adapters, and voice-profile registry from `GestaltView_Deepgram_Voice_Integration_v1.0.0.zip`.
- Switched `/api/voice/billy` from ElevenLabs to Deepgram so browser playback uses the same hosted provider as the worker path.
- Updated Billy voice health contracts, dashboard signals, and voice-studio copy to report Deepgram status instead of ElevenLabs/CosyVoice/Whisper readiness.
- Added the Deepgram Supabase migration and registry tooling for the voice-profile projection.
- Updated the Billy voice runtime docs and Vercel env checklist to match the new Deepgram environment shape.
- Removed the retired Whisper/CosyVoice worker files and the unpacked bundle directory so only the active Deepgram path remains in the repo.

### Validation still in progress

- TypeScript and Vitest checks were already rerun after the cleanup pass, but the repo still has older archived wiki references that mention the previous voice stack.

---

# CurrentState — Voice continuity and degraded-mode controls landed (2026-07-08)

**Scope of this pass:** Wired the Voice surface to persist notes locally, sync queued captures to `transcriptory_captures`, and added a user-facing degraded/low-bandwidth mode that drops the heaviest Home motion layers and spinner effects when enabled.

### What changed

- Updated `client/src/components/operation-render/VoiceReadinessPanel.tsx` so the Voice page now reports live Billy health instead of static placeholder readiness flags.
- Added offline/local persistence, queued sync, unsynced export, and reconnect-aware sync behavior to `client/src/components/voice-interface.tsx`.
- Extended `client/src/lib/userSurfaceSettings.ts` with a `lowBandwidthMode` setting and surfaced it in `client/src/pages/SettingsPage.tsx`.
- Taught `client/src/pages/Home.tsx` to honor degraded mode by suppressing the ambient fog/ember layers and reducing high-frequency motion.
- Added a low-bandwidth fallback branch to `client/src/components/LoadingSpinner.tsx` so global loading does not force the full motion stack on constrained surfaces.

### Validation performed

- `npm exec tsc --noEmit --pretty false`
- `npm run build`

### Deferred / risk

- The Voice queue currently syncs into `transcriptory_captures`; if we later want a dedicated field-continuity table, we should add that as a separate storage contract rather than broadening this slice in place.
- Degraded mode currently targets the heaviest Home and loading surfaces first. Other routes can adopt the same setting incrementally as needed.

# CurrentState — Dependency drift hardened to zero audit vulnerabilities (2026-07-08)

**Scope of this pass:** Addressed the dependency-drift follow-up from Operation Render by removing unused vulnerable packages, pinning patched transitive dependencies, and validating both npm and pnpm audit surfaces to zero known vulnerabilities.

### What changed

- Removed unused/stale dependencies that carried the largest production audit chains: `psql`, `sql`, `supabase-js`, `types`, and dev-only `add`.
- Removed the `braintrust` SDK from the required production dependency graph and changed `instrument.js` to load it dynamically only when Braintrust telemetry is explicitly enabled; missing SDKs now fail soft and tracing remains a no-op fallback.
- Updated the dependency toolchain and lockfiles, including `@vercel/node`, `@vitejs/plugin-react`, `vite`, `pnpm`, and patched npm/pnpm override pins for vulnerable transitive packages.
- Updated the Operation Render dependency audit and acceptance checklist to record the zero-vulnerability audit state.

### Validation performed

- `npm audit` → found 0 vulnerabilities.
- `npm audit --omit=dev` → found 0 vulnerabilities.
- `pnpm audit` → no known vulnerabilities found.
- `pnpm audit --prod` → no known vulnerabilities found.
- `npm run operation-render:validate` → Operation Render sweep validation passed.
- `node scripts/build-embodiment-artifacts.mjs --check` → generated embodiment registry is current for 24 profiles.
- `node scripts/validate-embodiment-profiles.mjs` → validated 24 embodiment profiles and `shared/embodiment/generated.ts`.
- `npm run build` → TypeScript and Vite production build completed successfully.
- `git diff --check` → clean.

### Deferred / risk

- Local validation still ran under Node v20.20.2 while the repo declares `>=22 <25`; npm/pnpm emitted engine warnings. Re-run under Node 22+ before deployment if possible.
- Braintrust telemetry now remains optional/fail-soft unless the SDK is available in the runtime environment and `BRAINTRUST_API_KEY`/`BRAINTRUST_ENABLED` are set.

# CurrentState — Operation Render full sweep prep integrated (2026-07-08)

**Scope of this pass:** Integrated `operation_render_full_sweep_prep.zip` as an implementation-control layer for the next Operation Render sweep, focusing on generated registry ownership, validation, audit documentation, and durable handoff surfaces.

### What changed

- Replaced `scripts/build-embodiment-artifacts.mjs` with the check-capable generator from the prep package, adding deterministic `--check` mode, duplicate slug detection, slug/filename mismatch detection, stronger JSON errors, and the `hasProfile()` helper.
- Regenerated `shared/embodiment/generated.ts` from the generator so the committed registry matches the new deterministic output and exposes the safe `hasProfile()` guard.
- Added `scripts/validate-operation-render-sweep.mjs` and package scripts for `embodiments:check-generated` and `operation-render:validate`.
- Added the full-sweep docs from the prep package under `docs/operation-render/`: implementation spec, open-items matrix, generated TypeScript remediation guide, and Codex handoff.
- Updated Operation Render dependency and acceptance ledgers with the actual `pnpm audit --prod` result and validation status from this pass.

### Validation performed

- `pnpm install --frozen-lockfile` → completed; environment warned that local Node v20.20.2 is below the repo engine `>=22 <25`, and pnpm ignored selected package build scripts pending approval.
- `node scripts/build-embodiment-artifacts.mjs --check` → generated embodiment registry is current for 24 profiles.
- `npm run operation-render:validate` → Operation Render sweep validation passed.
- `node scripts/validate-embodiment-profiles.mjs` → validated 24 embodiment profiles and `shared/embodiment/generated.ts`.
- `npm run build` → production TypeScript/Vite build completed successfully after reinstalling missing local dependencies.
- `git diff --check` → clean.
- `pnpm audit --prod` → ran and failed with 35 production vulnerabilities (3 critical, 16 high, 15 moderate, 1 low), now recorded in `docs/operation-render/dependency-audit.md`.

### Deferred / risk

- The audit findings remain open remediation work; the largest existing risk chains are through stale `sql`/`psql` transitive dependencies and should be handled with targeted dependency cleanup before closeout.
- Remote Supabase migration application and the full route-by-route visual/runtime sweep remain next-slice work, as described in the new open-items matrix.
- Local validation used Node v20.20.2 despite the repo declaring `>=22 <25`; rerun final validation under Node 22+ before deployment if possible.

# CurrentState — Operation Render holistic spec slice integrated (2026-07-08)

**Scope of this pass:** Integrated `operation_render_holistic_specs.zip` as a bounded first implementation slice: shared contracts/schema, visual tokens, visible reasoning trace UI, voice readiness transparency, and operation-render audit docs.

### What changed

- Added shared Operation Render contracts and policy helpers under `shared/operation-render/` for embodiment reasoning policies, visible reasoning traces, voice profiles, and offline capture items.
- Added the Supabase migration `202607080001_operation_render_reasoning_voice.sql` for Operation Render audits, reasoning sessions, tool-call audit, visible reasoning cards, voice profiles/session audit, and field continuity events.
- Added `client/src/styles/operation-render.css` and wired it through the main stylesheet for runtime-wide glass/neon surface tokens, focus rings, equation-field styling, and reduced-motion handling.
- Extended `GlassCard` with a backward-compatible `surfaceRole` prop and aligned `LoadingSpinner` with the Operation Render shell/surface language.
- Added `VisibleReasoningTrace` and `VoiceReadinessPanel` components, then wired the Voice page to show transparent voice-provider fallback status.
- Added `docs/operation-render/runtime-page-audit.md`, `docs/operation-render/dependency-audit.md`, and `docs/operation-render/acceptance-checklist.md` as the durable audit surfaces requested by the spec package.

### Validation performed

- `npm run build` → production build completed successfully.
- `node_modules/.bin/tsc --noEmit --pretty false` → TypeScript completed successfully.
- `git diff --check` → clean.

### Deferred / risk

- The Supabase migration has been added locally but not pushed to a remote database.
- `pnpm audit --prod`/latest-version dependency checks are still follow-up work; this local slice documents the dependency ledger but does not upgrade the lockfile.
- Page-wide visual refactors beyond the Voice page remain intentionally staged in `docs/operation-render/runtime-page-audit.md` to avoid destabilizing active routes in one pass.

# CurrentState — NextGen rendering engine integrated into live runtime (2026-07-07)

**Scope of this pass:** Integrated `gv_nextgen_render_engine_integration_package.zip` as an additive rendering contract layer without removing the existing Codex renderer/export flow.

### What changed

- Added the local `packages/nextgen-rendering-engine` package with source, dist output, CLI, adapter specs, examples, tests, and package validation metadata.
- Added browser-safe scene graph helpers under `client/src/lib/rendering/` for validation, ordering, artifact conversion, sample mixed-content scenes, and download packaging.
- Added `GestaltRenderSurface` and a small demo component under `client/src/components/rendering/` for local multimodal scene graph preview with diagnostics and explicit native/GPU facade messaging.
- Added `api/render/engine.ts` so Creation Corner and other surfaces can POST a scene graph and receive a manifest-backed render result from the local orchestration engine.
- Added the Supabase migration `202607070001_nextgen_rendering_engine.sql` for `render_jobs` and `render_artifacts` persistence with RLS policies.
- Wired Dynamic Inner World to show the package sample scene graph as a live museum-preview lane and route promotion into Creation Corner.
- Wired Creation Corner to convert forged artifacts into NextGen scene graphs, preview them inline, and call `/api/render/engine` to create a render manifest while preserving the existing `ArtifactExportViewer` pipeline.

### Validation performed

- `npm run build` → TypeScript and Vite production build completed successfully.
- `cd packages/nextgen-rendering-engine && npm run validate` → package TypeScript build and Node tests passed.
- `node -e "import('./packages/nextgen-rendering-engine/dist/index.js')..."` → local orchestration smoke test rendered the mixed-content sample graph and returned `ok: true` with artifacts.

### Deferred / risk

- The native/GPU/video paths remain honest facades until concrete Babylon/R3F/Pixi/native backends are selected.
- The Supabase migration has been added but not pushed to a remote database in this local session.

# CurrentState — Dynamic Inner World wiki artifact Mermaid repair and theme alignment (2026-07-02)

**Scope of this pass:** Fixed the static Dynamic Inner World wiki artifact hosted from `public/artifacts/showcase/exhibit-wiki-gestaltview-v1.html` so Mermaid diagrams render reliably and the artifact shell uses the current GestaltView design tokens.

### What changed

- Replaced the artifact-local legacy palette with GestaltView token aliases for void/deep backgrounds, cyan/violet/rose/amber accents, and text colors.
- Added local GestaltView font-face declarations for Cabin Sketch, Manrope, and Geist Mono using relative font URLs so the standalone artifact is safer under subpath hosting.
- Updated the wiki shell, sidebar, cards, page title, and Mermaid containers with glass/aurora styling aligned to the live CSS system.
- Reworked Mermaid rendering to render each diagram with `mermaid.render()` instead of pre-marking diagrams as processed before `mermaid.run()`, which could prevent rendering. Failed diagrams now preserve source in an inline fallback instead of silently disappearing, `escapeHtml` now handles nullish/non-string values defensively, and the page no longer aborts its own navigation script when the Mermaid CDN is unavailable.
- Synced the same wiki artifact fix into `client/public/artifacts/showcase/exhibit-wiki-gestaltview-v1.html`, which is the Vite production static source referenced by the showcase index.

### Validation performed

- `node --check /tmp/wiki-root-script.js` and `node --check /tmp/wiki-client-script.js` → JavaScript extracted from both artifact copies parsed successfully.
- `cmp -s public/artifacts/showcase/exhibit-wiki-gestaltview-v1.html client/public/artifacts/showcase/exhibit-wiki-gestaltview-v1.html` → the root mirror and Vite-served client copy are byte-identical.
- `git diff --check` → clean.
- `npm run build` → production build completed and copied the client artifact to `dist/public/artifacts/showcase/exhibit-wiki-gestaltview-v1.html`.
- Playwright production-artifact smoke test against `dist/public` → loaded the Vite output path, opened the wiki overview page, and rendered 2 Mermaid SVGs with 0 Mermaid fallback errors. Screenshot captured at `/tmp/dynamic-inner-world-wiki-production-artifact.png`.

### Deferred / blocked

- After deployment, re-check the live Vercel URL to confirm CDN and production edge behavior match the local `dist/public` smoke test.

# CurrentState — Rendering engine + UI enhancement pass: error boundary, design-system components, preview loading state, lazy ExhibitPod, rendering guide (2026-07-02)

**Scope of this pass:** Applied SPEC-RENDER-UI-v1.0 against the _live_ repo. A live-first audit showed most of the spec's Phase 1 (server renderers), the `gestaltview:height` bridge, the signed-URL export pipeline, and the ArtifactGallery renderer path were already implemented and more capable than the spec's proposals, so those were intentionally left untouched (no devolution). Only the genuinely-missing enhancements were added.

### What changed

- Added `client/src/lib/rendering/RendererErrorBoundary.tsx` and wrapped the renderer output inside `RenderingEngine.tsx`, so a single renderer failure surfaces inline with a Retry affordance instead of blanking the room page. Exported it from `client/src/lib/rendering/index.ts`.
- Expanded the `HtmlArtifactRenderer` iframe sandbox to include `allow-modals` (alongside the existing `allow-scripts allow-same-origin allow-forms allow-popups`) so CDN-driven interactive artifacts (Mermaid, Reveal.js) behave. Added an optional `loading` prop for native iframe lazy-loading.
- Added a loading spinner + `allow-modals` to the CreationCornerPage rendered-preview iframe, with a reset effect keyed on the artifact identity so the spinner tracks each fresh preview.
- Added the shared design-system components `client/src/components/ui/GlassPanel.tsx`, `SectionLabel.tsx`, and `RoomHeaderBar.tsx`, plus a `client/src/components/ui/index.ts` barrel. These are additive alongside the existing `GlassCard`.
- Swapped the CreationCornerPage header for `<RoomHeaderBar>` (visual-only; preserves the DI toggle behavior) and removed the now-unused `Link`/`RoomStateBadge` imports.
- Passed `loading="lazy"` to the ExhibitPod preview iframe so off-viewport pods in the Dynamic Inner World don't block rendering. (ExhibitPod was already wider/taller and had a kind badge, exceeding the spec's proposed 320×240 upgrade, so its sizing/badge were left as-is.)
- Added `docs/rendering/RenderingEngineGuide.md`.

### Intentionally NOT changed (live was already more enhanced)

- `shared/rendering/mindmap.ts`, `slides.ts`, `pdf.ts`, `audio.ts` — already production-grade (Mermaid CDN, full Reveal.js with plugins, guarded `@sparticuz/chromium@^149` import, graceful TTS fallback).
- `ArtifactExportViewer` + `renderingClient.ts` — already handle binary formats correctly via the signed-URL/job-polling pipeline; the spec's naive blob rewrite would have regressed them.
- `shared/codex/templates/html-shell.ts` — height bridge postMessage + ResizeObserver already present; `useIframeResize` already consumes it.
- `ArtifactGalleryPage.tsx` — no `dangerouslySetInnerHTML` for artifact content.

### Validation performed

- `node_modules/.bin/tsc --noEmit --pretty false` → 0 errors
- `node_modules/.bin/vite build` → built successfully
- `git diff --check` → clean
- `vitest run` on `api/__tests__/codex-contracts.test.ts`, `client/src/tests/rendering-contract.test.ts`, `rendering-format-aliases.test.ts`, `mindmap-interactive-rendering.test.ts`, `artifact-export-viewer.test.ts` → 24 passed

### Deferred

- Applying `GlassPanel`/`SectionLabel` deep-swaps across the interior of DynamicInnerWorldPage and BlackboardRoomPage was deferred to avoid destabilizing working room logic in a visual-only pass; the components are in place and proven on CreationCornerPage's header.

# CurrentState — Schema dashboard now reads the live Supabase schema and the app/site map uses the new Vercel host (2026-06-28)

**Scope of this pass:** Wired the new `/schema-dashboard` route to a live admin-only schema snapshot endpoint, connected the embedded dashboard shell to the current Supabase database state, and updated the app-wide canonical host to `https://gestaltview-di-gsvw.vercel.app`.

### What changed

- Added `api/schema/dashboard.ts` as an admin-gated GET endpoint that calls `get_schema_dashboard_snapshot` and returns the live schema snapshot as JSON.
- Added `supabase/migrations/20260628150000_schema_dashboard_snapshot.sql` so the database can generate live table counts, row counts, column counts, foreign key counts, index counts, enum counts, and vector-index flags.
- Added `client/src/pages/SchemaDashboardPage.tsx` and wired `/schema-dashboard` through `client/src/App.tsx` so the dashboard renders inside the live app instead of only existing as a standalone shell.
- Updated `client/src/components/gestaltview_schema_dashboard.html` so it fetches `/api/schema/dashboard`, merges live rows into the embedded snapshot, updates the headline counters, and shows a fallback alert when the live endpoint is unavailable.
- Updated the app/site canonical base in `client/src/hooks/useSEO.ts` and the GPT actions package references to `https://gestaltview-di-gsvw.vercel.app`.
- Synced the sitemap/robots artifacts and the schema-dashboard route link so the new host and new page show up in the public surface.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `./node_modules/.bin/vitest run api/__tests__/schema-dashboard.test.ts api/__tests__/actions.test.ts client/src/tests/musicaldna-spotify.test.ts`
- `git diff --check`

### Deferred / blocked

- The dashboard is intentionally admin-only and depends on an authenticated same-origin session cookie; if the session is missing or non-admin, it redirects to `/dashboard`.
- The embedded HTML still ships with a fallback snapshot so the page remains legible if the live RPC is temporarily unavailable.

# CurrentState — Cron drains now accept Vercel's current schedule header, unblocking Codex export writes from the live deployment (2026-06-28)

**Scope of this pass:** Fixed the production cron guard so `api/cron/codex-drain` and the profile portrait cron routes accept Vercel's current `x-vercel-cron-schedule` header in addition to the legacy cron header, then pushed the change to trigger a fresh deployment.

### What changed

- Updated the Codex drain and profile portrait cron guards to authorize requests when `x-vercel-cron-schedule` is present.
- Kept the existing bearer-secret fallback for manual recovery invocations.
- Pushed the fix to `main` so Vercel can rebuild and deploy the updated cron logic.

### Validation performed

- `npm run build`
- `git diff --check`
- Production runtime logs previously showed repeated `401` responses on `/api/cron/codex-drain`; this fix targets that exact mismatch.

### Deferred / blocked

- After the next deployment lands, the cron runtime logs should be re-checked to confirm the `401`s are gone and Codex drain jobs can reach storage writes.

# CurrentState — Embodiment profiles now sync cleanly to the rebuilt Supabase DB, including enterprise roles in the generated registry (2026-06-28)

**Scope of this pass:** Finished the embodiment profile sync slice by normalizing readiness scores for the live Supabase schema, fixing the registry filter so enterprise profiles are included, and verifying the regenerated artifact matches the database.

### What changed

- Patched `scripts/sync-embodiment-profiles.ts` so readiness scores larger than `1` are normalized into the `0..1` range before insert.
- Updated the registry filter so active `enterprise` profiles are included alongside `public` profiles, while `founder-only` profiles remain gated behind `--include-founder-only`.
- Re-ran the profile sync against the live project `dzrxepbgetinldcknior`.
- Regenerated `shared/embodiment/generated.ts` with the full active registry, including `gate-keeper`, `the-guardian`, and `the-treasurer`.

### Validation performed

- `npm run sync-profiles -- --include-founder-only` completed with `synced=24` and `upsertErrors=0`.
- Live Supabase counts now show `embodiment_profiles: 24`, `embodiment_training_runs: 24`, and `embodiment_readiness_scores: 24`.
- Live sample rows confirm readiness normalization landed as expected: `billy = 1.000`, `art-teacher = 0.920`, `founder-studio-sample = 0.500`.
- `shared/embodiment/generated.ts` now contains all three enterprise profile slugs as top-level registry entries.

### Deferred / blocked

- The embodiment slice is now in a good state for downstream runtime use.
- If you want, the next adjacent step is to refresh the canonical repo mirrors with `npm run sync:perplexity` and `npm run sync:perplexity:check`.

# CurrentState — Live Supabase Edge Functions now pass smoke tests after configuring the missing operator secret (2026-06-28)

**Scope of this pass:** Finished the live Edge Function verification slice by setting the missing `GESTALTVIEW_INGEST_SECRET` on the remote project and rerunning end-to-end smoke tests against the deployed functions.

### What changed

- Set the live project secret `GESTALTVIEW_INGEST_SECRET` so the operator-only functions can read their shared-secret guard at runtime.
- Re-ran the deployed function smoke suite against `https://dzrxepbgetinldcknior.supabase.co/functions/v1/...`.
- Confirmed `gsvw-runtime-health`, `gsvw-dormancy-review`, and `gsvw-ingest-batch` now return `200` with valid shared-secret headers.
- Confirmed `gsvw-capture-event` returns `200` with a valid project JWT/service-role authorization path and writes a new capture row.

### Validation performed

- `supabase secrets list --project-ref dzrxepbgetinldcknior` shows the live project has `SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`, `SUPABASE_JWKS`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_URL` configured.
- `supabase secrets set GESTALTVIEW_INGEST_SECRET=... --project-ref dzrxepbgetinldcknior --yes`
- `gsvw-runtime-health` smoke response: `200`, `ok: true`, and a live table count snapshot including `gsvw_runtime_capture_events: 1`.
- `gsvw-dormancy-review` smoke response: `200`, `ok: true`, `dry_run: true`, `candidate_count: 0`.
- `gsvw-ingest-batch` smoke response: `200`, `ok: true`, `dry_run: true`, `would_write_documents: 1`.
- `gsvw-capture-event` smoke response: `200`, `ok: true`, and a returned `event_id` / `created_at`.

### Deferred / blocked

- Live Edge Function invocation coverage is now in a good place for this slice.
- If you want, the next adjacent step is to check the final live catalog again or land any remaining repo docs that should mention the new operator secret requirement.

# CurrentState — Supabase Edge Functions are deployed on the live project with the intended JWT split (2026-06-28)

**Scope of this pass:** Continued the live Supabase repair path by deploying the service-side Edge Functions with JWT verification disabled and the client-facing capture endpoint with JWT verification left enabled.

### What changed

- Deployed `gsvw-ingest-batch`, `gsvw-runtime-health`, `gsvw-dormancy-review`, and `corpus-harvest-worker` to project `dzrxepbgetinldcknior` with `--no-verify-jwt` and the shared-secret runtime already encoded in the function code.
- Deployed `gsvw-capture-event` separately without `--no-verify-jwt` so it stays JWT-verified for authenticated client writes.
- Confirmed the CLI reported successful deployment for all five functions.

### Validation performed

- `HOME=/tmp XDG_CONFIG_HOME=/tmp SUPABASE_TELEMETRY_DISABLED=1 ./node_modules/.bin/supabase functions deploy gsvw-ingest-batch gsvw-runtime-health gsvw-dormancy-review corpus-harvest-worker --project-ref dzrxepbgetinldcknior --no-verify-jwt --use-api --yes`
- `HOME=/tmp XDG_CONFIG_HOME=/tmp SUPABASE_TELEMETRY_DISABLED=1 ./node_modules/.bin/supabase functions deploy gsvw-capture-event --project-ref dzrxepbgetinldcknior --use-api --yes`

### Deferred / blocked

- The next live Supabase slice would be an end-to-end invocation check against the deployed functions, if you want me to keep going.

# CurrentState — Live Supabase repair migrations are now applied and verified on the remote project (2026-06-28)

**Scope of this pass:** Continued the Supabase live-repair path through MCP by applying the rebuilt compatibility/security migration and the gsvw ingestion alignment migration to the remote project, then verifying the resulting catalog, grants, and migration spine.

### What changed

- Applied remote migration `20260628140644_rebuild_compatibility_and_security`.
- Applied remote migration `20260628140735_gsvw_ingestion_alignment`.
- Confirmed the live project now exposes the rebuilt `gsvw_*` tables plus `corpus_harvest_events`.
- Confirmed `gsvw_runtime_capture_events` allows authenticated insert/select while `gsvw_current_ingestion_documents` remains service-role only.
- Confirmed `gsvw_mark_document_seen(text,text,text,uuid)` is present as a `SECURITY DEFINER` RPC with execution restricted to `service_role`.

### Validation performed

- `list_migrations` now shows the two new remote migration versions alongside the pre-existing 15 historical entries.
- Live catalog query confirms these public tables now exist: `gsvw_ingestion_runs`, `gsvw_ingestion_documents`, `gsvw_ingestion_chunks`, `gsvw_ingestion_events`, `gsvw_repo_alignment_snapshots`, `gsvw_runtime_capture_events`, `gsvw_dormancy_review_items`, and `corpus_harvest_events`.
- Privilege checks confirm `anon` and `authenticated` cannot select `gsvw_current_ingestion_documents`, `service_role` can, `authenticated` can insert/select `gsvw_runtime_capture_events`, and only `service_role` can execute `gsvw_mark_document_seen`.

### Deferred / blocked

- Remote dump/archive generation is still blocked from this container because direct DB access fails on the IPv6 route and the shared-pooler path still needs a working tenant route from this environment.
- Edge Function deployment is the next adjacent slice if you want me to keep pushing the live Supabase surface forward.

# CurrentState — Supabase rebuild-repair contracts are green and the dump helper now prefers the real Postgres DSN (2026-06-28)

**Scope of this pass:** Resumed the Supabase rebuild-repair session after a workspace reconnect, verified the live repair surface, fixed the local dump helper so it no longer prefers the Supabase web URL, and confirmed the repair contracts still pass.

### What changed

- Confirmed `api/_lib/auth.ts` now enriches authenticated sessions from `public.users` instead of `profiles`.
- Confirmed `supabase/config.toml` carries the live Edge Function auth sections and that the detached fragment file is gone.
- Confirmed the `gsvw-*` Edge Functions and `corpus-harvest-worker` are using `Deno.serve`-style handlers and the shared-secret guard where required.
- Confirmed the ingestion and compatibility/security migrations are present and satisfy the repo-local repair contract.
- Updated `scripts/supabase-db-dump-zip.mjs` so `--db-url` uses a raw Postgres DSN and the environment lookup prefers `DATABASE_URL` over the misleading `SUPABASE_DB_URL` web URL.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/supabase-rebuild-repair.test.ts -v`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`
- `node scripts/supabase-db-dump-zip.mjs --schema public,storage,auth` now reaches the remote DB image pull path, but the direct Supabase host still fails from this container with `Network is unreachable` on the IPv6 route.
- Live Supabase MCP checks on the queried project reported PostgreSQL `17.6`, `15` schema migrations, `160` public base tables, and six private storage buckets (`agent-personhood-code-artifacts`, `agent-personhood-normalized-assets`, `agent-personhood-raw-uploads`, `codex-exports`, `transcriptory_audio_files`, `user-files`).
- The same MCP snapshot shows the rebuilt `gsvw_*` tables are not yet present in that live project, while `identity_subjects`, `human_identity_profiles`, `profile_portraits`, `transcriptory_captures`, and `inner_world_artifacts` do exist.
- Shared-pooler retries using the provided `aws-1-us-west-1.pooler.supabase.com` connection details still failed to produce a dump archive, so the pre-repair zip remains unavailable from this environment.

### Deferred / blocked

- The pre-repair zip archive from `npm run supabase:dump:zip -- --schema public,storage,auth` is still blocked on remote database connectivity from this environment.
- The current repo state is otherwise clean enough to continue with live catalog verification, migration repair, or a reachable DB path in the next pass.

# CurrentState — Graph artifacts now render through a dependency-free SVG graph lane (2026-06-26)

**Scope of this pass:** Closed the 1-4 rendering implementation sprint by landing Track 4 as a safe dependency-free graph renderer spike, while deliberately saving video export job architecture for the next session.

### What changed

- Added `graph` and `workflow` artifact/content support to `shared/gen-engine/types.ts` and `shared/gen-engine/core.ts`.
- Added `client/src/lib/rendering/graph/graphModel.ts` with JSON graph parsing, simple `A -> B` arrow-line parsing, and deterministic node layout.
- Added `client/src/lib/rendering/renderers/GraphRenderer.tsx`, a lightweight SVG renderer for artifact lineage/workflow graphs.
- Wired `graph` and `workflow` through `client/src/lib/rendering/dispatch.ts`, `client/src/lib/rendering/registry.ts`, `client/src/lib/rendering/index.ts`, and `shared/rendering/index.ts`.
- Added `client/src/tests/graph-rendering.test.ts` and expanded format-alias/gen-engine coverage.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/gen-engine-format-aliases.test.ts client/src/tests/graph-rendering.test.ts client/src/tests/rendering-format-aliases.test.ts client/src/tests/rendering-contract.test.ts -v`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Deferred intentionally

- Track 5, video export job architecture, remains the next implementation lane for tomorrow after confirming Tracks 1-4 are safe together.

# CurrentState — DOM capture export now reports asset risks and clearer browser failures (2026-06-26)

**Scope of this pass:** Entered Track 3 from the `refactor/` upstream-discovery report by hardening the existing browser DOM-to-PNG capture helper without adding a new capture dependency.

### What changed

- Extended `client/src/lib/rendering/capture/domCapture.ts` with `DomCaptureDiagnostics`, `DomCaptureRiskWarning`, and an optional `onDiagnostics` callback for browser captures.
- Added `analyzeCaptureMarkupRisks()` to report external images and external stylesheets that may be omitted by SVG `foreignObject` browser capture.
- Added `buildDomCaptureFailureMessage()` so image-load failures explain the browser SVG `foreignObject` capture path, include Safari-specific guidance when relevant, and surface asset warning URLs.
- Expanded the bounded computed-style serialization list to preserve more spacing, border, background, positioning, and transform details in captured artifact cards.
- Updated `captureDomNodeAsPng()` to emit diagnostics and wrap SVG image-load failures with the clearer capture message.
- Added focused coverage in `client/src/tests/dom-capture-export.test.ts`.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/dom-capture-export.test.ts client/src/tests/multimodal-artifact-card.test.ts -v`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

# CurrentState — Chart snapshots now have a Gen Engine API route with injectable rendering (2026-06-26)

**Scope of this pass:** Continued Track 2 by exposing the chart snapshot adapter through a narrow Gen Engine API route while keeping the native Chart.js/canvas renderer optional until deployment support is deliberately added.

### What changed

- Added `api/gen-engine/chart-snapshot.ts` with a `POST` JSON route for rendering chart configs into PNG data URLs.
- Exported `createChartSnapshotHandler()` so tests and future callers can inject a renderer, while the default route uses the optional `createChartSnapshotRenderer()` adapter.
- Added request validation for missing chart configs and graceful `503` JSON responses when the optional server renderer is unavailable.
- Added `api/__tests__/chart-snapshot-route.test.ts` covering a successful injected-renderer response and the missing-config error path.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/chart-snapshot-route.test.ts api/__tests__/chart-render-adapter.test.ts -v`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

# CurrentState — Chart snapshot export now has an isolated server adapter boundary (2026-06-26)

**Scope of this pass:** Entered Track 2 from the `refactor/` upstream-discovery report by adding a server-side Chart.js snapshot adapter boundary without yet forcing the native `canvas`/`chartjs-node-canvas` dependency into the runtime.

### What changed

- Added `server/export/chartRenderAdapter.ts` with a normalized chart snapshot request contract, PNG buffer/data URL helpers, and renderer instance caching by width, height, and background color.
- Kept `chartjs-node-canvas` as an optional runtime-loaded dependency so TypeScript and tests do not require native `canvas` until deployment risk is explicitly accepted.
- Added `api/__tests__/chart-render-adapter.test.ts` with coverage for deterministic request defaults and renderer instance reuse through an injected fake renderer factory.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/chart-render-adapter.test.ts -v`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

# CurrentState — Diagram artifacts now have first-class Mermaid format routing (2026-06-26)

**Scope of this pass:** Rolled the first slice from the `refactor/` upstream-discovery pass into the live rendering contract by making Mermaid diagrams a first-class generated artifact/content format instead of only a markdown fenced-code feature.

### What changed

- Extended `ArtifactType` and `ArtifactContentFormat` in `shared/gen-engine/types.ts` with `diagram` and `mermaid` support.
- Updated `shared/gen-engine/core.ts` so `diagram` and `mermaid` infer to Mermaid content, export as `.mmd`, and use `text/vnd.mermaid;charset=utf-8`.
- Added `client/src/lib/rendering/renderers/DiagramRenderer.tsx`, a thin wrapper around the existing strict/browser-only `MermaidDiagram` component.
- Wired `diagram` and `mermaid` through `client/src/lib/rendering/registry.ts`, `client/src/lib/rendering/dispatch.ts`, `client/src/lib/rendering/index.ts`, and the shared renderer compatibility lookup.
- Added focused alias/export coverage in `api/__tests__/gen-engine-format-aliases.test.ts` and `client/src/tests/rendering-format-aliases.test.ts`.
- Added `refactor/docs/rendering/runtime-rendering-upstream-discovery-2026-06-26.md` as the consolidated subagent discovery map for the staged upstream rendering projects.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/gen-engine-format-aliases.test.ts client/src/tests/rendering-format-aliases.test.ts -v`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

# CurrentState — Babylon atmosphere now carries cinematic halo/ribbon overlays and video artifacts have a proper moving-picture frame (2026-06-25)

**Scope of this pass:** Elevated the room feel with a stronger atmospheric layer in `BabylonAtmosphere` and gave the shared video renderer a theatrical chrome so moving artifacts feel like moving pictures instead of plain media embeds.

### What changed

- Added layered halo and ribbon overlays to `client/src/components/BabylonAtmosphere.tsx` so the inner-world and blackboard rooms feel more theatrical while keeping the existing Babylon stage intact.
- Added `client/src/lib/rendering/renderers/videoHelpers.ts` with pure helpers for resolving video sources and generating readable labels.
- Updated both shared video renderers, `client/src/lib/rendering/renderers/video.tsx` and `client/src/lib/rendering/renderers/VideoRenderer.tsx`, with cinematic chrome, a moving-picture badge, and resilient source handling.
- Added `client/src/tests/video-renderer.test.ts` for helper coverage.
- Added `docs/superpowers/plans/2026-06-25-cinematic-atmosphere-moving-pictures.md` as the implementation trail.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/video-renderer.test.ts client/src/tests/multimodal-artifact-card.test.ts client/src/tests/markdown-pro-rendering.test.ts client/src/tests/mindmap-interactive-rendering.test.ts client/src/tests/rendering-contract.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `node --import tsx -e 'import React from "react"; import { renderToStaticMarkup } from "react-dom/server"; import BabylonAtmosphere from "./client/src/components/BabylonAtmosphere.tsx"; import { VideoRenderer } from "./client/src/lib/rendering/renderers/video.tsx"; const atmosphereHtml = renderToStaticMarkup(React.createElement(BabylonAtmosphere, { mode: "inner-world" })); const videoHtml = renderToStaticMarkup(React.createElement(VideoRenderer, { artifact: { content: "AAAA", title: "Room Reel", mimeType: "video/mp4" }, mode: "compact" })); console.log(atmosphereHtml.includes("canvas"), atmosphereHtml.includes("mix-blend-screen"), videoHtml.includes("Moving picture"), videoHtml.includes("Room Reel")); if (!atmosphereHtml.includes("canvas") || !atmosphereHtml.includes("mix-blend-screen") || !videoHtml.includes("Moving picture") || !videoHtml.includes("Room Reel")) process.exit(1);'`

# CurrentState — Artifact previews can now export rendered cards as browser PNG captures (2026-06-25)

**Scope of this pass:** Closed the next lingering rendering slice from `specs/render/Lets_Do_This.md` by adding a DOM-to-image style export path for fully rendered artifact preview cards. This keeps the runtime integration outside `refactor/` and gives multimodal artifacts a practical shareable image surface.

### What changed

- Added `client/src/lib/rendering/capture/domCapture.ts` with tested filename normalization, foreignObject SVG wrapping, browser PNG capture, and download helpers.
- Added `client/src/tests/dom-capture-export.test.ts` for deterministic DOM capture helper behavior.
- Updated `client/src/components/ArtifactPreview.tsx` with a browser-only `Save image` action that captures the rendered card while excluding export/open/download controls from the PNG.
- Added `docs/superpowers/plans/2026-06-25-artifact-dom-image-export.md` as the implementation trail.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/dom-capture-export.test.ts client/src/tests/multimodal-artifact-card.test.ts client/src/tests/markdown-pro-rendering.test.ts client/src/tests/mindmap-interactive-rendering.test.ts client/src/tests/rendering-contract.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `node --import tsx -e 'import React from "react"; import { renderToStaticMarkup } from "react-dom/server"; import ArtifactPreview from "./client/src/components/ArtifactPreview.tsx"; const artifact = { title: "Capture Export Demo", summary: "A card", content: "# Capture Export\\n\\n- Rendered", tags: ["markdown"] }; const html = renderToStaticMarkup(React.createElement(ArtifactPreview, { artifact })); console.log(html.includes("artifact-preview-renderer"), html.includes("Capture Export Demo"), !html.includes("Save image")); if (!html.includes("artifact-preview-renderer") || !html.includes("Capture Export Demo") || html.includes("Save image")) process.exit(1);'`
- Browser Chromium smoke against `captureDomNodeAsPng()` produced a `data:image/png;base64,...` output for a real DOM node.

# CurrentState — Artifact previews now compose multimodal content through the shared rendering engine (2026-06-25)

**Scope of this pass:** Continued the rendering-library integration with multimodal artifact cards, so artifact previews can route markdown, diagrams, mind maps, media, PDFs, HTML, code, and text through the canonical renderer stack while keeping summaries and transcripts attached as companion panels.

### What changed

- Added `client/src/lib/rendering/multimodal/artifactCardModel.ts` as a tested view-model helper for classifying artifact preview content and attachments into `RenderableArtifact` payloads.
- Added `client/src/tests/multimodal-artifact-card.test.ts` for markdown-with-Mermaid, mind-map tagged markdown, and audio/transcript attachment routing.
- Updated `client/src/components/ArtifactPreview.tsx` so the primary artifact body now renders through `RenderingEngine`, while summaries, transcripts, and attachment notes render as companion markdown panels.
- Tightened SSR boundaries by importing `RenderingEngine` directly from `client/src/lib/rendering/RenderingEngine.tsx` and adding explicit React imports where server-render smoke checks required them.
- Added `docs/superpowers/plans/2026-06-25-multimodal-artifact-cards.md`.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/multimodal-artifact-card.test.ts client/src/tests/markdown-pro-rendering.test.ts client/src/tests/mindmap-interactive-rendering.test.ts client/src/tests/rendering-contract.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `node --import tsx -e 'import React from "react"; import { renderToStaticMarkup } from "react-dom/server"; import ArtifactPreview from "./client/src/components/ArtifactPreview.tsx"; const artifact = { title: "Multimodal", summary: "A card", content: "# Map\\n\\n```mermaid\\ngraph TD\\nA-->B\\n```", tags: ["diagram"] }; const html = renderToStaticMarkup(React.createElement(ArtifactPreview, { artifact })); console.log(html.includes("artifact-preview-renderer"), html.includes("Mermaid diagram"), html.includes("Summary")); if (!html.includes("artifact-preview-renderer") || !html.includes("Mermaid diagram") || !html.includes("Summary")) process.exit(1);'`

# CurrentState — Mind map artifacts now parse markdown outlines into an interactive SVG graph (2026-06-25)

**Scope of this pass:** Continued the rendering-library integration with the interactive mind-map slice, replacing the static generated fallback shell for markdown/plain-text mind maps with a live React/SVG graph.

### What changed

- Added `client/src/lib/rendering/mindmap/mindMapModel.ts` with tested markdown outline parsing and deterministic node layout.
- Added `client/src/lib/rendering/mindmap/InteractiveMindMap.tsx` with clickable focus, visible node counts, reset, branch expand/collapse controls, and a side focus panel.
- Replaced `client/src/lib/rendering/renderers/MindMapRenderer.tsx` so full HTML mind-map documents still route through `Html5Renderer`, while markdown/plain text now render through the interactive graph.
- Added `client/src/tests/mindmap-interactive-rendering.test.ts` and `docs/superpowers/plans/2026-06-25-interactive-mindmap-rendering.md`.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/mindmap-interactive-rendering.test.ts client/src/tests/rendering-format-aliases.test.ts client/src/tests/rendering-contract.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `node --import tsx -e 'import React from "react"; import { renderToStaticMarkup } from "react-dom/server"; import MindMapRenderer from "./client/src/lib/rendering/renderers/MindMapRenderer.tsx"; const artifact = { content: "# Root\\n## Branch\\n- Leaf", title: "Map", format: "mindmap" }; const html = renderToStaticMarkup(React.createElement(MindMapRenderer, { artifact })); console.log(html.includes("Interactive mind map"), html.includes("Root"), html.includes("Leaf")); if (!html.includes("Interactive mind map") || !html.includes("Root") || !html.includes("Leaf")) process.exit(1);'`

# CurrentState — Markdown artifacts now render with polished document chrome and Mermaid diagram fallbacks (2026-06-25)

**Scope of this pass:** Started the five-track rendering-library integration with the Markdown Pro + Mermaid foundation so ordinary markdown artifacts can become structured, readable documents instead of raw text blocks.

### What changed

- Added `client/src/lib/rendering/markdown/analyzeMarkdown.ts` with tested helpers for fenced-code analysis, diagram detection, Mermaid source normalization, and callout marker cleanup.
- Added `client/src/lib/rendering/diagram/mermaidLoader.ts` and `client/src/lib/rendering/diagram/MermaidDiagram.tsx` as a browser-only Mermaid runtime that loads the CDN script on demand and falls back to readable source when rendering is unavailable.
- Added `client/src/lib/rendering/markdown/MarkdownCodeBlock.tsx` and `client/src/lib/rendering/markdown/EnhancedMarkdownRenderer.tsx` so markdown artifacts now get styled headings, lists, tables, links, inline code, block code, callouts, and Mermaid delegation.
- Updated both markdown renderer entrypoints, `client/src/lib/rendering/renderers/markdown.tsx` and `client/src/lib/rendering/renderers/MarkdownRenderer.tsx`, to share the enhanced implementation while preserving the canonical registry contract.
- Added `client/src/tests/markdown-pro-rendering.test.ts` plus `docs/superpowers/plans/2026-06-25-markdown-pro-mermaid-rendering.md` for the implementation trail.

### Integration rule reinforced

- Rendering-library integrations still get real homes under the live runtime (`client/src/lib/rendering/...` here). `refactor/` remains source material only.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/markdown-pro-rendering.test.ts client/src/tests/rendering-contract.test.ts client/src/tests/rendering-format-aliases.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `node --import tsx -e 'import React from "react"; import { renderToStaticMarkup } from "react-dom/server"; import { EnhancedMarkdownRenderer } from "./client/src/lib/rendering/markdown/EnhancedMarkdownRenderer.tsx"; const html = renderToStaticMarkup(React.createElement(EnhancedMarkdownRenderer, { content: "# Title\\n\\n> [!NOTE] Hello\\n\\n```mermaid\\ngraph TD\\nA-->B\\n```" })); console.log(html.includes("gv-markdown-pro-renderer"), html.includes("Mermaid diagram"), html.includes("Note:")); if (!html.includes("gv-markdown-pro-renderer") || !html.includes("Mermaid diagram") || !html.includes("Note:")) process.exit(1);'`

# CurrentState — Dynamic Inner World now has a browser-only R3F museum backdrop with runtime files living outside `refactor/` (2026-06-25)

**Scope of this pass:** Started the rendering-enhancement integration from `specs/render/Lets_Do_This.md` with the smallest high-impact slice: a React Three Fiber layer for the Dynamic Inner World desktop museum hall.

### What changed

- Added `client/src/features/dynamic-inner-world/world-renderer/three/buildThreeMuseumSceneItems.ts` as the tested adapter that converts existing `WorldPlan` artifact pods into capped, deterministic R3F scene anchors.
- Added `client/src/features/dynamic-inner-world/world-renderer/three/ThreeMuseumBackdrop.tsx` as a browser-only progressive enhancement wrapper, so SSR/prerender paths keep a lightweight fallback and never import Canvas during server render.
- Added `client/src/features/dynamic-inner-world/world-renderer/three/BrowserThreeMuseumScene.tsx` as the live R3F scene with artifact beacons, lighting, fog, and reduced-motion support.
- Mounted the new backdrop in `client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx` behind the existing desktop museum controls, preserving keyboard navigation and expand/open actions.
- Added `client/src/tests/dynamic-world-three-scene.test.ts` coverage for selection priority, coordinate conversion, capped scene density, and ignoring non-artifact world nodes.

### Integration rule established

- Treat `refactor/` packages and extracted archives as source material only. Runtime integrations must land in stable app homes such as `client/src/features/...`, `client/src/lib/rendering/...`, `shared/...`, `server/...`, or `scripts/...`, with tests beside the live contract.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/dynamic-world-three-scene.test.ts`
- `./node_modules/.bin/vitest run client/src/tests/dynamic-world-three-scene.test.ts client/src/tests/dynamic-world-plan.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`

# CurrentState — Mind map artifacts now have a dedicated preview chrome instead of borrowing the generic HTML5 renderer (2026-06-25)

**Scope of this pass:** Finished the second adjacent slice by giving `mindmap` its own rendering surface, while keeping the shared alias support from the prior pass intact.

### What changed

- Added `client/src/lib/rendering/renderers/MindMapRenderer.tsx` as a dedicated mind-map preview shell with a branch-styled layout, legend, and markdown-aware fallback rendering.
- Updated `client/src/lib/rendering/registry.ts` so `mindmap` now resolves to the dedicated renderer instead of the generic HTML5 component.
- Re-exported the new renderer from `client/src/lib/rendering/index.ts` for downstream consumers.
- Refreshed `client/src/tests/rendering-format-aliases.test.ts` so the test now asserts the dedicated renderer is registered for `mindmap`.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/gen-engine-format-aliases.test.ts client/src/tests/rendering-format-aliases.test.ts -v`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

# CurrentState — Rendering engine now recognizes the zip bundle’s `python` and `mindmap` aliases across shared export, client routing, and shared renderer lookups (2026-06-25)

**Scope of this pass:** Layered the enhancement bundle onto the live artifact/rendering surface without breaking the existing markdown/code paths.

### What changed

- Extended `shared/gen-engine/types.ts` so `ArtifactContentFormat` now includes `python` and `mindmap` as first-class alias formats.
- Updated `shared/gen-engine/core.ts` and `shared/gen-engine/index.ts` so exported artifacts can emit `.py` and `.html` payloads for those formats, and `inferContentFormat()` can recognize Python MIME types and the `mind-map` to `mindmap` alias.
- Taught `client/src/lib/rendering/dispatch.ts` to resolve Python shebangs and `.py` filenames to the Python format before falling back to generic text.
- Wired `client/src/lib/rendering/registry.ts` so `python` reuses the code renderer and `mindmap` reuses the HTML5 renderer, while `client/src/lib/rendering/renderers/CodeRenderer.tsx` now shows the Python language badge correctly.
- Added the `mindmap` alias to `shared/rendering/index.ts` so the compatibility renderer surface matches the new shared contract.
- Added focused alias tests in `api/__tests__/gen-engine-format-aliases.test.ts` and `client/src/tests/rendering-format-aliases.test.ts`.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/gen-engine-format-aliases.test.ts client/src/tests/rendering-format-aliases.test.ts -v`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

# CurrentState — GPT Actions FastAPI stub now mirrors the Python Sentry bootstrap and `/sentry-debug` verification route (2026-06-25)

**Scope of this pass:** Mirrored the env-driven `sentry-sdk` init into the GPT Actions FastAPI stub so the auxiliary Python surface matches the production backend observability pattern.

### What changed

- Updated `api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py` to initialize `sentry_sdk` before `FastAPI()`.
- Reused the same env-aware knobs for `send_default_pii`, `enable_logs`, `traces_sample_rate`, `profile_session_sample_rate`, and `profile_lifecycle="trace"`.
- Added a `/sentry-debug` route to the stub so the error path can be exercised there too.

### Validation performed

- `python3 -m py_compile server/gestaltview_generative_engine.py api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py`
- `git diff --check`

# CurrentState — Python FastAPI backend now initializes Sentry before app creation, with log capture and a `/sentry-debug` verification route (2026-06-25)

**Scope of this pass:** Wired `sentry-sdk` into the production Python FastAPI backend using env-driven config, added the SDK verification route from the current docs, and recorded the dependency in the Python requirements surface.

### What changed

- Added `sentry-sdk>=2.0.0` to `requirements.txt` so the Python runtime declares the SDK explicitly.
- Updated `server/gestaltview_generative_engine.py` to call `sentry_sdk.init(...)` before `FastAPI()` is created.
- Enabled `send_default_pii`, `enable_logs`, `traces_sample_rate`, `profile_session_sample_rate`, and `profile_lifecycle="trace"` through env-aware defaults so the backend matches the updated SDK guidance without hardcoding deployment-only values.
- Added a `/sentry-debug` route that logs a warning and raises a deliberate error so Sentry capture can be verified end to end.

### Validation performed

- `python3 -m py_compile server/gestaltview_generative_engine.py`
- `python3 - <<'PY' from importlib.metadata import version; print(version("sentry-sdk")) PY`
- `git diff --check`

# CurrentState — Vite client Sentry bootstrap now initializes from `client/src/main.tsx` with the provided DSN fallback and console-log capture for drain logs (2026-06-25)

**Scope of this pass:** Confirmed the repo is a Vite runtime, kept the browser SDK init in the client entrypoint, and wired the updated client Sentry helper so drain-log traffic can flow without a wrapper file.

### What changed

- Kept `client/src/main.tsx` as the Vite bootstrap entry and left the Sentry init before `createRoot(...)`.
- Updated `client/src/lib/sentry.ts` to fall back to the supplied Sentry DSN when `VITE_SENTRY_DSN` is not set locally.
- Added `Sentry.consoleLoggingIntegration({ levels: ["error", "warn"] })` so console warnings and errors can be drained into Sentry logs.
- Refreshed `docs/SentrySetup.md` so the repo now records the live Vite applicability boundary instead of implying a pending bootstrap task.

### Validation performed

- Not run yet; will validate after the code/doc pass below.

# CurrentState — Schema alignment gap map now has live Billy prompt coverage and a direct Supabase Codex env handoff (2026-06-25)

**Scope of this pass:** Added a focused Billy prompt regression test and synchronized the schema-alignment gap map so the direct Supabase prompt path is now verified with and without constitution/autobiography rows. Also populated `.env.codex` with the linked project’s direct Supabase connection values so Codex can bypass MCP when needed.

### What changed

- Added `api/__tests__/billy-memory-session-prompt.test.ts` coverage for `buildBillySessionSystemPrompt`, including the happy path and the fallback path when constitution or autobiography rows are absent.
- Updated `docs/schema-alignment-gap-map.md` so the Billy identity slice now points at the live prompt assembly path instead of remaining a future recommendation.
- Populated `.env.codex` with the linked Supabase project’s direct URL, anon key, service-role key, and database connection string for local-only access when MCP is flaky.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/billy-memory-session-prompt.test.ts`
- `git diff --check`

# CurrentState — Supabase trainer start/import now resolves `training_runs` in the correct migration order (2026-06-24)

**Scope of this pass:** Fixed the trainer migration spine so `public.trainer_run_summary` is created after `public.training_runs`, eliminating the fresh-import `42P01` error and keeping the recreation-package canonical migrations in sync.

### What changed

- Removed the premature `public.trainer_run_summary` view definition from `supabase/migrations/20260330115505_trainer_security_hardening.sql`, leaving that migration focused on `public.claim_trainer_job`.
- Moved the `public.trainer_run_summary` definition into `supabase/migrations/20260330120000_trainer_core.sql` and added `with (security_invoker = true)` there, after `training_runs` exists.
- Mirrored the same migration-order fix in `gestaltview_supabase_recreation_package/canonical_migrations/20260330115505_trainer_security_hardening.sql` and `gestaltview_supabase_recreation_package/canonical_migrations/20260330120000_trainer_core.sql`.
- Updated `supabase_start_issues.md` to record the root cause and the fix instead of leaving only the failing log.

### Validation performed

- `git diff --check`

# CurrentState — Blackboard room skill now anchors the live room/recap model and catalog routing (2026-06-24)

**Scope of this pass:** Added a first-class `gestaltview-blackboard-room` skill for the current Blackboard and Tribunal room contract, then wired it into the curated catalog so future agents start from the capture-first room model instead of generic chat assumptions.

### What changed

- Added `.agents/skills/gestaltview-blackboard-room/SKILL.md` as the room doctrine for Sanctuary, Blackboard, Tribunal, Dynamic Inner World, External Scaffold, Creation Corner, Billy behavior, and session recap or summary handoffs.
- Updated `.agents/skills/manifest.json`, `.agents/skills/INDEX.md`, and `.agents/skills/agents/AGENTS.md` so the Blackboard skill is discoverable from the curated catalog, highlighted core, and generated skill inventory.
- Synced `.agents/skills/CurrentState.md` and this repo state log so the current note now reflects the room-level routing contract alongside the recent metrics and multi-DI chat pass.

### Validation performed

- `python3 -m json.tool .agents/skills/manifest.json`
- `git diff --check`

# CurrentState — GestaltView metrics now flow end to end from trainer queue, orchestration analytics, and Tribunal transcript proxies, while Tribunal multi-DI chat silently retries canned fallbacks and skips exhausted shells (2026-06-24)

**Scope of this pass:** Wired the GestaltView metrics surface end to end through live trainer queue data, richer orchestration analytics, and browser-local Tribunal transcript state, then hardened Tribunal multi-DI chat so canned fallback responses are retried behind the scenes and exhausted turns are skipped instead of surfacing a blocked shell.

### What changed

- Extended `client/src/lib/gestaltviewMetrics.ts` so the dashboard can build live metric-family snapshots from trainer queue health, orchestration analytics, stored Tribunal turns, and saved excerpts using a single shared helper, including artifact/persistence/profile/scaffold rates plus top trigger/destination/content signals.
- Replaced `client/src/components/GestaltViewMetricsDashboard.tsx` with a live snapshot view that reads the current browser transcript, loads admin-only orchestration analytics, and renders the five spec-driven metric families plus operational overview cards and server-backed decision signals.
- Added `client/src/lib/tribunalResponseGuard.ts` and rewired `client/src/hooks/useTribunalRetry.ts` so Tribunal turns now retry canned fallback responses off-screen, honor explicit `[pass]` signals, and return silence when the retry budget is exhausted.
- Updated `client/src/pages/AgentCouncilPage.tsx` so session, debate, and roundtable flows now use the retry helper end to end, record persona success or failure correctly, and skip exhausted turns without emitting the old visible blocked-shell message.
- Added targeted Vitest coverage in `client/src/tests/gestaltview-metrics.test.ts` and `client/src/tests/tribunal-response-guard.test.ts` for the snapshot helper and Tribunal retry guard.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/gestaltview-metrics.test.ts client/src/tests/tribunal-response-guard.test.ts -v`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. If we want the operational dashboard to show server-backed metrics beyond the current browser and admin-authenticated API inputs, the next slice can extend the shared helper with a persisted metrics source.
2. The Tribunal retry path is now quiet on exhausted canned fallbacks, but any future provider-specific pass signals should be added in the shared guard so the room keeps one canonical suppression rule.

# CurrentState — Blackboard responses now route through free-first web grounding, and persona hints are honored end to end (2026-06-24)

**Scope of this pass:** Wired `server/core/web_search.py` into the live blackboard response path so question-like messages can be grounded through DuckDuckGo, Brave, or Perplexity before the answer is generated, and fixed the LLM router so system hints are now actually included in generation prompts.

### What changed

- Added `WebSearchRouter.search_message()` and `ground_message()` to `server/core/web_search.py` so the trigger detection, query extraction, and tier ladder can be used as one callable grounding step.
- Updated `server/gestaltview_generative_engine.py` so `BlackboardResponder` now grounds eligible user messages, injects the grounding block into the persona hint, and records grounding metadata in the response provenance.
- Fixed `LLMRouter.generate()` so `system_hint` is folded into the final prompt before PLK enrichment and provider calls.
- Extended `server/engine_persistence_bridge.py` so persisted blackboard turns can carry optional metadata such as web grounding details.
- Exported the new grounding helper from `server/core/__init__.py`.

### Validation performed

- `python3 -m compileall server/core server/gestaltview_generative_engine.py server/engine_persistence_bridge.py`
- `python3 - <<'PY' ... web_search integration ok ... PY`

### Remaining follow-up

1. A small Python behavior test for the grounding ladder would be a good follow-up once we decide on the repo's preferred Python test harness.
2. If we want the same grounding behavior in any other Python runtime entrypoint, the next slice can reuse `ground_message()` there too.

# CurrentState — Uploaded docs now render through a shared non-chat preview surface, while chat uploads stay attachment-first (2026-06-24)

**Scope of this pass:** Standardized uploaded document rendering across the non-chat file surfaces by introducing a shared preview component, then wired the document analysis page and profile ingest panel to show rendered document bodies instead of plain text dumps.

### What changed

- Added `client/src/components/UploadedDocumentPreview.tsx` and routed `client/src/components/FilePreview.tsx` through it so uploaded files now share one rendering standard for markdown, pdf fallback text, html, and plain text.
- Updated `client/src/components/document-analysis-interface.tsx` so document uploads are extracted with the existing PDF / Markdown / DOCX helper and the selected document now renders inline after upload.
- Updated `client/src/components/ProfileIngestPanel.tsx` so the founder profile preview shows a rendered document body instead of only the raw extraction text.
- Kept `client/src/components/ArtifactPreview.tsx` and the chat capture lane unchanged, so chat-window uploads still behave as compact attachments rather than full document surfaces.
- Added `tests/uploaded-document-preview.test.ts` to prove the shared renderer outputs readable markdown and PDF fallback bodies.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `./node_modules/.bin/vitest run tests/uploaded-document-preview.test.ts`
- `git diff --check`

### Remaining follow-up

1. If we want the same renderer to cover more workspace-specific upload surfaces, the next pass can thread it into the remaining non-chat preview panes that still show abbreviated text blocks.
2. Chat uploads should stay attachment-first unless we explicitly decide a given chat surface should become a full document reader.

# CurrentState — Profile upload ingest now accepts PDF, Markdown, and DOCX, with live framing and a hidden home-hero origin easter egg (2026-06-24)

**Scope of this pass:** Wired the founder profile upload path into the live Profile room, added local extraction for PDF / Markdown / DOCX sources, kept contextual framing editable during rebuilds, and hid the Origin Story behind a subtle home-hero click path.

### What changed

- Added `client/src/components/ProfileIngestPanel.tsx` and `client/src/lib/profileUploadIngestion.ts` so signed-in users can upload a founder profile source, preview the extracted text, and send it into the existing profile ingestion pipeline as `profile_upload`.
- Extended `shared/profileIngestion.ts`, `api/_lib/profileIngestion.ts`, and `api/__tests__/profile-ingestion.test.ts` so uploaded profile documents are accepted as a distinct source type and persisted with account-bound provenance.
- Threaded a contextual framing note through `client/src/pages/ProfilePage.tsx`, `client/src/hooks/usePortrait.ts`, `api/profile/personality.ts`, and `shared/profilePortrait.ts` so the live portrait can be reframed and refreshed without re-uploading the document.
- Wired the new Origin Story surface into `client/src/App.tsx`, `client/src/hooks/useSEO.ts`, `client/src/pages/SanctuaryPage.tsx`, `client/src/lib/billy-runtime-guide.ts`, and the home page hero so `/origin` is now an easter egg behind repeated clicks on the GestaltView hero.
- Updated `.perplexity/GestaltView_System_Workflows.md`, `tsconfig.json`, and `vite.config.ts` so the upload workflow is documented and the repo can import the new metadata / raw-document assets cleanly during dev and build.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `./node_modules/.bin/vitest run tests/profile-upload-ingestion.test.ts`
- `./node_modules/.bin/vitest run --config vitest.api.config.ts api/__tests__/profile-ingestion.test.ts`
- `git diff --check`

### Remaining follow-up

1. If we want the framing note persisted beyond local browser storage, the next slice can store it in the account profile preferences or a dedicated profile-framing table.
2. The client-side origin test file exists and the route compiles, but the repo's Vitest config still needs a small follow-up if we want all `client/src/**/*.test.tsx` files to run in one default command.

# CurrentState — Technical deep dive report now documents the live UI/UX runtime architecture (2026-06-24)

**Scope of this pass:** Added a comprehensive report that explains GestaltView's room-based user experience, Billy runtime, API/data layers, artifact lifecycle, differentiators, and current technical risks for founder/investor/operator communication.

### What changed

- Added `docs/TechnicalDeepDiveUIUXReport.md` as a repo-grounded technical/product narrative covering the client shell, routes, Billy orchestration, prompt runtime, API families, Supabase persistence, creation/artifact flow, DI/personhood surfaces, monetization, voice, proof layers, differentiators, risks, and talk tracks.
- Kept the report explicitly scoped to live repository evidence and current-state caveats so external explanations can separate shipped runtime behavior from doctrine, experiments, and roadmap claims.

### Validation performed

- `git diff --check`

### Remaining follow-up

1. Add visual architecture diagrams for the route-to-API-to-Supabase/provider flow.
2. Add a room capability matrix that marks each surface as live, scaffolded, experimental, or planned.

# CurrentState — Session recap now falls back to deterministic HTML instead of 502ing on invalid provider output (2026-06-23)

**Scope of this pass:** Hardened `/api/sessionRecap` so the recap route still returns a finished artifact when the live provider output is missing HTML structure or otherwise fails the validation gate.

### What changed

- Added `buildRecapFallbackHtml()` to `shared/sessionRecap.ts` so the repo can synthesize a valid recap artifact from captures and conversation history when the LLM path cannot produce one.
- Updated `api/sessionRecap.ts` to keep the two-pass repair attempt, then fall back to deterministic HTML with `provider: "session-recap-fallback"` instead of returning a 502 for validation-only failures.
- Kept the recap voice selector and existing HTML gate intact so valid provider output still wins, but the user no longer gets stranded when the route only has offline or malformed text to work with.
- Added coverage in `api/__tests__/session-recap.test.ts` for the fallback path so the route test now proves both the successful provider case and the deterministic recovery case.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/session-recap.test.ts`
- `git diff --check`
- `./node_modules/.bin/tsc --noEmit --pretty false` still reports pre-existing unrelated repo errors in `client/src/pages/HostedAgentTrainerPage.tsx` and `config/gateCatalog.ts`

### Remaining follow-up

1. If we want the fallback recap to mirror the main renderer more closely, the next slice can share a richer template between the deterministic path and the live provider output.
2. The repo-wide TypeScript cleanup for the hosted agent trainer surfaces remains open and is unrelated to this recap fix.

# CurrentState — Repo manifest now inventories test files, shell runners, and npm test aliases end to end (2026-06-22)

**Scope of this pass:** Broadened the manifest generator so the sync pipeline now sees the actual repo test surface instead of only the seven shell wrappers, and excluded API test files from the endpoint inventory by classifying test-shaped files first.

### What changed

- Expanded `scripts/generate_repo_manifest.py` to scan `tests/` and `agent_trainer/gestaltview_agent_trainer/tests/` in addition to the existing runtime, docs, and script surfaces.
- Added a shared test-path classifier so `api/__tests__/`, `client/src/tests/`, `server/__tests__/`, `shared/**/*.test.*`, root `tests/`, and the agent-trainer tests all land in the test inventory.
- Broadened the test inventory to include `scripts/test-*.sh`, `scripts/run-comprehensive-tests.sh`, and the `npm run test*` aliases from `package.json`.
- Kept the API endpoint extractor from over-capturing `api/__tests__` files by making the test category win before the generic API category.
- The regenerated manifest now reports `150` test inventory entries and `189` API endpoints, which is a much closer match to the actual repo surface than the old seven-script count.

### Validation performed

- `python3 scripts/generate_repo_manifest.py`
- `npm run sync:perplexity`
- `npm run sync:perplexity:check`
- `git diff --check`

### Remaining follow-up

1. If we want to fold in additional repo-local test surfaces outside the current scan roots, the generator can take another directory pass without changing the manifest shape again.
2. The new manifest count is now the better repo truth surface for sync and handoff work, so future notes should treat the test inventory as the canonical count rather than the old seven-script shortcut.

# CurrentState — Artifact Gallery now has a dedicated staging page, route, and top-level discoverability (2026-06-22)

**Scope of this pass:** Finished the Artifact Gallery follow-up slice from the runtime optimization spec by adding a dedicated staging page, wiring it into the app shell and discoverability surfaces, and normalizing archive/restore behavior so gallery state, museum visibility, and provenance stay aligned.

### What changed

- Added `client/src/pages/ArtifactGalleryPage.tsx` as a dedicated staging surface with status filters, provenance search, batch publish/delete, restore, and HTML preview rendering.
- Wired `/artifact-gallery` into `client/src/App.tsx`, `client/src/components/TopNav.tsx`, `client/src/pages/Home.tsx`, `client/src/components/home/modules.ts`, `client/src/pages/DynamicInnerWorldPage.tsx`, `client/src/hooks/useSEO.ts`, and `client/src/prerender.tsx` so the gallery is reachable from the runtime, home, and crawlable metadata.
- Normalized archived artifact handling in `client/src/lib/innerWorldFiles.ts` and the gallery view so archived items carry `status: "archived"`, restore back to ready, and the museum/staging filters agree on what is visible.
- Extended `api/inner-world/artifacts.ts` to persist the provenance and status fields the staging workflow needs end to end.
- Added coverage in `client/src/tests/inner-world-files.test.ts` for the archived/restore status behavior and the staging/museum helper predicates.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/inner-world-files.test.ts client/src/tests/blackboard-recap-artifacts.test.ts client/src/tests/creation-corner-artifacts.test.ts client/src/tests/dynamic-inner-world-downloads.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. If we want spatial placement, drag-and-drop artifact positioning, or the six-surface museum renderer from the spec, that can come as the next Dynamic Inner World slice.
2. The recap voice persistence follow-up from the prior entry is still open if we want the chosen Blackboard recap DI to survive across sessions.

# CurrentState — Blackboard recap now has selectable DI voices, server-side HTML gating, and provenance tags (2026-06-22)

**Scope of this pass:** Centralized the recap prompt in a shared helper, added a visible recap-voice selector to the Blackboard recap panel, and tightened the recap API so only finished HTML artifacts survive validation before they are forwarded into the inner-world path.

### What changed

- Added `shared/sessionRecap.ts` to hold the recap voice catalog, the shared prompt builder, HTML cleanup, and the finished-artifact validation gate.
- Updated `api/sessionRecap.ts` to accept a `di` parameter, route the selected recap voice through the server prompt, retry once when the first output is not a finished HTML artifact, and fail closed with a generic error if validation still does not pass.
- Updated `client/src/components/SessionRecapGenerator.tsx` to show a recap-voice selector, send the selected voice to the API, and keep user-facing error copy generic instead of surfacing raw provider text.
- Threaded recap provenance through `client/src/lib/blackboardRecapArtifacts.ts`, `client/src/lib/innerWorldFiles.ts`, `client/src/components/inner-world/InnerWorldArtifactGallery.tsx`, and `api/_lib/inner-world.ts` so the inner-world artifact metadata can show which DI generated the recap.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/session-recap.test.ts client/src/tests/blackboard-recap-artifacts.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. If we want the recap voice choice to persist between sessions, the next slice can store it alongside the other Blackboard preferences.

# CurrentState — Pricing now uses the live room theme, exposes a real free tier with limited rendering and no persistence, and keeps the runtime copy aligned (2026-06-21)

**Scope of this pass:** Aligned the public pricing surface to the spec by making the free tier explicit, describing it as limited rendering with no persistence, and pulling the Sanctuary/Home atmosphere into the page so the commerce surface now feels like part of the live runtime.

### What changed

- Added a dedicated free-tier callout to `client/src/pages/Pricing.tsx` that states the tier is limited rendering only, has no persistence or saved context, and gives 3 Billy queries without requiring an account.
- Reworked the pricing surface to use the live room atmosphere with `FloatingEmbers`, `FogOverlay`, `Cabin Sketch`, and `Geist`, plus void/background token colors so the page reads like a runtime surface instead of a separate marketing shell.
- Kept the paid Core, Pro, and Enterprise cards intact while updating the page hero, cancel notice, footer CTA, and FAQ answer so all free-tier references tell the same story.
- Refreshed `client/src/components/UpgradeBanner.tsx` and the generic `client/src/components/DemoGate.tsx` copy so anonymous/free users now see the same limited-rendering, no-persistence language outside the pricing page.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. If we want the free tier to be linkable via a dedicated query preset later, we can extend the billing search helper without changing checkout behavior.
2. The broader collaborator/runtime alignment work from the prior pass remains in place below this entry.

# CurrentState — Collaborator runtime now has a live-dump-aligned RLS migration, alignment-reference updates, and verifier checks (2026-06-21)

**Scope of this pass:** Used the June 21 database dump as the live reference for the collaborator family, backfilled the missing RLS and policy spine into migrations, and tightened the repo’s alignment notes so the collaborator contract reads coherently across schema, runtime, and verification helpers.

### What changed

- Added `supabase/migrations/20260621000000_collaborator_security_rls.sql` to bring the collaborator family under explicit RLS coverage with the same authenticated/admin access shape now visible in the live dump.
- Updated `supabase/GestaltView_Schema_Alignment_Reference.md` so the collaborator section describes the current live-dump policy model instead of the older service-role-only shorthand.
- Hardened `scripts/init-collaborator-system.sh` so the collaborator init report now resolves a real schema snapshot, checks the latest migration for the collaborator RLS and policy surface, and verifies the governed identity snapshot read model.
- Refreshed the schema/current-state skill docs so future schema work keeps the migration spine, alignment reference, and runtime notes together.

### Validation performed

- `sed -n '1,260p' supabase/migrations/20260621000000_collaborator_security_rls.sql`
- `git diff --check`

### Remaining follow-up

1. The collaborator family is now aligned, but the rest of the June 21 dump still deserves a broader drift pass if we want the database and runtime to stay fully in lockstep.
2. If we keep going, the next good slice is a wider dump-to-runtime comparison across the other high-signal tables that moved after the last migration spine was cut, especially the human-identity governance and agent read-model surfaces.

# CurrentState — Tribunal roundtable redesign now lives at /tribunal with full rename coverage and Creation Corner seed handoff (2026-06-21)

**Scope of this pass:** Reframed the multi-voice room as Tribunal end to end, added the roundtable interaction layer from the redesign spec, and wired a Creation Corner seed handoff so selected Tribunal excerpts can launch directly into creation.

### What changed

- Moved the active room entry to `/tribunal` and kept `/agent-council` as a redirect alias so the canonical route now matches the Tribunal naming in the UI.
- Updated the Tribunal page shell, top nav, quick nav, home module entry, embodiment studio links, and SEO/prerender metadata so the user-facing route and metadata all agree on Tribunal.
- Added the roundtable interaction helpers in `shared/roundtable/` plus the new in-room action UI in `client/src/components/roundtable/` for voice roster, mention autocomplete, creation actions, and the slide-in creation panel.
- Extended `client/src/pages/AgentCouncilPage.tsx` with the Tribunal session/debate/roundtable flow, per-voice reply metadata, queued auto-replies, mention parsing, save/share actions, and a seed launch into Creation Corner.
- Taught `client/src/pages/CreationCornerPage.tsx` to accept `?seed=` and `?title=` so Tribunal excerpts can prefill the creation surface.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `./node_modules/.bin/vitest run client/src/tests/roundtable-mention-parser.test.ts`
- `git diff --check`

### Remaining follow-up

1. The visible rename is consistent in the Tribunal flow, but some internal compatibility aliases still keep older `council`-named helpers and generated data alive for now.
2. If we want to push the rename further, the next pass would be a deeper sweep through the shared embodiment generated content and the older council-named component/file identities.

# CurrentState — Home card borders now glow brighter, Home room cards use Cabin Sketch + Geist, and shared orchestration responses expose skill selection end to end (2026-06-21)

**Scope of this pass:** Intensified the homepage card-edge glow so the room grid reads more alive, and promoted the shared orchestration decision shape so the browser helper and API contract both carry the routed DI selection that the shared orchestrator already produces.

### What changed

- Increased the Home page card border glow in `client/src/pages/Home.tsx` by boosting the animated border alpha and outer glow layers on each room card wrapper.
- Updated the Home room card labels to use Cabin Sketch and the supporting copy to use Geist, matching the Sanctuary card typography split.
- Exported a shared `OrchestrationDecisionWithSkill` alias from `shared/orchestration/index.ts` so the browser and API layers can share the same enriched orchestration response shape.
- Updated `client/src/lib/orchestratorClient.ts` to type orchestration responses with the skill-selection payload, and added tests that assert the shared `diSelection` arrives through both the shared decision function and the API route.
- Added a tiny ambient `api/ws.d.ts` declaration so this checkout typechecks cleanly even without a local `@types/ws` install.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `./node_modules/.bin/vitest run tests/orchestration-routing.test.ts api/__tests__/orchestrator-decide.test.ts`
- `git diff --check`

### Remaining follow-up

1. If we want the homepage glow to push a little further later, we can tune the room-specific glow colors without changing the card layout.
2. The next spec slice is still the homepage/Sanctuary polish lane from `RectificationSpec_v1.md`, but the shared orchestration path is now wired so future UI consumers can use the skill-selection data directly.

# CurrentState — Agent Trainer now surfaces a compact manual packet action strip at the top of the workbench (2026-06-20)

**Scope of this pass:** Made the degraded-trainer fallback easier to reach on smaller screens by exposing jump/export/import actions near the top of the workbench while keeping the existing manual packet tools and local merge logic unchanged below.

### What changed

- Added a top-of-page manual packet shortcut card in `client/src/features/agent-trainer/AgentTrainerPage.tsx` so mobile users can jump to the fallback tools without hunting for the buried section.
- Wired the shortcut card to the existing manual export and import logic so the new buttons reuse the same packet handling path as the full tools block.
- Kept the detailed manual source list, upload inputs, and local packet merge behavior in place for the full fallback workflow.

### Validation performed

- Pending: `./node_modules/.bin/tsc --noEmit --pretty false`
- Pending: `git diff --check`

### Remaining follow-up

1. If the trainer still feels too buried on mobile, the next refinement would be to make the shortcut card sticky while the page scrolls.
2. The Billy Live nav-flow cleanup from the prior slice remains in place and unchanged.

# CurrentState — Billy Live now suppresses the global Billy shell and greets the direct route as Billy Live (2026-06-20)

**Scope of this pass:** Cleaned up the Billy navigation flow so the direct `/billy` entry lands on the live surface without leaving the floating Billy shell open on top of it, and the shared Billy CTA wording now names the live path explicitly.

### What changed

- Updated `client/src/components/Billy.tsx` so the global Billy orb and side panel stay suppressed while the app is already on the dedicated Billy Live route.
- Renamed the shared Billy greeter and walkthrough CTA wording to "Open Billy Live" so the direct route reads like a single destination instead of an ambiguous Billy panel.
- Kept the explainer and orientation paths intact so the broader Billy onboarding flow still works the same way elsewhere.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`
- `NODE_OPTIONS=--max-old-space-size=6144 npm run build` (terminated during Vite chunk rendering in this environment)

### Remaining follow-up

1. If we want the same live-only treatment on any other Billy-specific route later, we can extend the route guard without changing the live page itself.
2. The next open slice remains the trainer fallback workflow that keeps manual packet tools easy to reach when the backend is degraded.

# CurrentState — Agent Trainer manual packet tools are now one click away from the degraded runtime warning (2026-06-20)

**Scope of this pass:** Made the trainer fallback path easier to find by wiring the degraded-runtime warning to the manual packet tools and anchoring the local source upload/import/export controls so the offline-first route is obvious when Supabase is failing.

### What changed

- Updated `client/src/features/agent-trainer/AgentTrainerPage.tsx` so the degraded runtime card now jumps straight to the local packet tools instead of suggesting a dead-end DB upgrade.
- Added an in-page anchor for the manual source fallback block so the upload, import, and export controls are discoverable from the top of the control plane.
- Kept the existing local manual source merge/export/import logic intact so the workaround remains browser-local and phone-friendly.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. If we want to make the fallback even more obvious on mobile, the next step would be to surface a compact manual-packet action strip near the top of the page.
2. The underlying remote trainer/API issue still remains; this pass only improved the manual workaround path.

# CurrentState — Tribunal room now runs sequential Council Session and DI Debate turns with per-voice timeouts (2026-06-20)

**Scope of this pass:** Reworked the multi-voice Tribunal room so selected agents respond in sequence instead of fanning out in parallel, and added the requested Council Session / DI Debate mode split with a per-voice timeout wrapper to avoid the canned fallback tripwire.

### What changed

- Updated `client/src/pages/AgentCouncilPage.tsx` so the mode model now reads as Council Session vs DI Debate instead of broadcast vs round robin.
- Replaced the parallel `Promise.all` fan-out with sequential per-agent calls and a per-voice timeout wrapper so one slow DI no longer trips the whole room into fallback.
- Made DI Debate rotate the starting voice between sends and feed prior voices back into the next prompt so the agents now respond to each other instead of only the user.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`
- `npm run build` (terminated during Vite chunk rendering in this environment)

### Remaining follow-up

1. If the Tribunal room still needs richer moderation, the next refinement is to separate session pacing from debate rotation into explicit controls.
2. The visible Tribunal rename and Orb Graph slice remain documented just below this new entry.

# CurrentState — Agent Council navigation now reads as Tribunal without colliding with the existing /tribunal page (2026-06-20)

**Scope of this pass:** Renamed the multi-voice room's visible navigation, labels, and page copy to Tribunal while keeping the existing `/agent-council` route as the entry point because `/tribunal` is already used by a different Tribunal page in this repo.

### What changed

- Updated the top nav, quick nav, embodiment launch links, and home module entry so the room is presented as Tribunal in the UI.
- Updated `client/src/pages/AgentCouncilPage.tsx` copy, metadata, and prompt text so the room reads as Tribunal while still living at `/agent-council`.
- Kept the room-slug plumbing aligned with the Tribunal naming so Billy and the embodiment plane still resolve the same room identity.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`
- `npm run build` (terminated during Vite chunk rendering in this environment)

### Remaining follow-up

1. If we want a full route-level rename later, we’ll need to reconcile this room with the existing `/tribunal` page first.
2. The next small spec slice is still the Orb Graph visibility and viewport pass that was completed just before this rename.

# CurrentState — Orb Graph now hides clutter, enlarges hit targets, and adds zoom controls (2026-06-20)

**Scope of this pass:** Tightened the Orb Graph UX so connection lines can be hidden when they get in the way, orb targets are easier to hit, and the graph has zoom-to-fit plus center-selected controls for denser layouts.

### What changed

- Updated `client/src/components/OrbGraph.tsx` with a show/hide connections toggle that defaults off once the orb count goes above 15 unless the user already chose a preference.
- Increased the orb hit radius and made connection lines non-interactive so clicks land on the orbs instead of the line clutter.
- Added zoom-to-fit and center-selected-orb actions to the graph toolbar so the External Scaffold graph can be re-centered without manual dragging.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`
- `npm run build` (terminated during Vite chunk rendering in this environment)

### Remaining follow-up

1. The next nearby slice in the rectification spec is the homepage and Sanctuary polish pass if we want to keep moving in spec order.
2. If the graph needs persistence for the connection toggle later, that can be added without changing the current viewport work.

# CurrentState — Auth UX now has a visible password toggle, canonical login errors, and signed-out profile gating (2026-06-20)

**Scope of this pass:** Tightened the sign-in flow so password entry can be shown or hidden, failed password login now surfaces the canonical invalid-credentials message, the enterprise welcome copy was cleaned up, and the Profile room now stays behind the auth boundary when signed out.

### What changed

- Updated `client/src/pages/SignIn.tsx` with a password visibility toggle and a visible `Invalid login credentials` state for password-auth failures.
- Cleaned the enterprise branch in `client/src/pages/Welcome.tsx` so the onboarding copy no longer references the removed manners/Collaborator Engine language.
- Added a signed-out guard to `client/src/pages/ProfilePage.tsx` so profile cards and portrait data no longer render when the user is not authenticated.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`
- `npm run build`

### Remaining follow-up

1. If the chat-history leak report points to another signed-out surface, we can apply the same auth gate pattern there next.
2. The reference spec at `.perplexity/RectificationSpec_v1.md` remains the working source for the remaining slices.

# CurrentState — Long artifact cards and Blackboard recap previews now scroll instead of locking the bottom content (2026-06-20)

**Scope of this pass:** Freed the long-text artifact card in Dynamic Inner World and gave the Blackboard recap surface its own scrollable body so oversized summaries no longer trap the bottom of the layout.

### What changed

- Updated `client/src/components/ArtifactScreen.tsx` so text artifacts now use a bounded `overflow-y-auto` panel instead of a clipped overflow-hidden block.
- Updated `client/src/components/RecapPanel.tsx` so long recap text gets its own max-height scroll region inside the Blackboard recap card.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`
- `npm run build`

### Remaining follow-up

1. If the recap surface needs even more room later, we can tune the scroll height without changing the Blackboard page shell.
2. If any other text-heavy artifact cards surface the same symptom, the same `overflow-y-auto` pattern can be applied there too.

# CurrentState — Home and Sanctuary polish now uses lighter embers and the requested Sanctuary typography (2026-06-20)

**Scope of this pass:** Tuned the shared ember layer to read more like floating embers than rain, removed the stale homepage supporting line, and applied the Cabin Sketch / Geist split to the Sanctuary info cards.

### What changed

- Updated `client/src/components/FloatingEmbers.tsx` so the ember drift is sparser, slower, and more buoyant across the Home and Sanctuary surfaces.
- Reduced the Home ember density in `client/src/pages/Home.tsx` and removed the outdated "Capture first..." supporting line from the hero.
- Styled the Sanctuary "What belongs here" and "The Keeper says" cards in `client/src/pages/SanctuaryPage.tsx` so the room labels use Cabin Sketch and the body copy uses Geist-style body text.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`
- `npm run build`

### Remaining follow-up

1. If we want the ember field even softer later, we can tune the shared `FloatingEmbers` defaults without touching the page shells.
2. If more room-level cards need the Cabin Sketch / Geist treatment, the same pattern can be applied to those surfaces next.

# CurrentState — Admin analytics now supports table filtering, CSV export, and a Supabase dump-to-zip helper (2026-06-20)

**Scope of this pass:** Extended the admin orchestration analytics tab so the micro table can be filtered and exported as CSV, and added a repo script that wraps `supabase db dump` into a zip archive.

### What changed

- Updated `client/src/components/admin/OrchestrationAnalyticsPanel.tsx` so admins can filter orchestration decisions by search, support level, content kind, and destination before exporting or reading the table.
- Added CSV export for the filtered decision rows so the download matches the current table slice.
- Added `scripts/supabase-db-dump-zip.mjs` plus the `npm run supabase:dump:zip` script so a Supabase dump can be written to a temp SQL file and zipped into `artifacts/`.
- Documented the dump helper in `scripts/README.md`.

### Validation performed

- `node scripts/supabase-db-dump-zip.mjs --help`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. If we want server-side analytics filtering or pagination later, the new endpoint can be extended without changing the dashboard tab layout.
2. If we want additional export formats beyond CSV, that can sit beside the current table-driven download.

# CurrentState — Admin dashboard analytics now tracks orchestration decisions with macro cards and a micro table (2026-06-20)

**Scope of this pass:** Added a persisted orchestration decision spine, an admin-only analytics endpoint, and a new Analytics tab inside the admin dashboard so the macro trends and individual routing decisions are visible together.

### What changed

- Added `supabase/migrations/20260620103000_create_orchestration_decisions.sql` for the persisted orchestration analytics table, indexes, and service-role-only RLS policy.
- Updated `api/orchestrator/decide.ts` so each triggered orchestration decision now persists a structured record while still failing open if storage is unavailable.
- Added `api/orchestrator/analytics.ts` plus `api/__tests__/orchestrator-analytics.test.ts` so admin users can read summarized orchestration analytics and recent decision rows.
- Added `client/src/components/admin/OrchestrationAnalyticsPanel.tsx` and wired it into `client/src/pages/DashboardPage.tsx` as a new admin-only Analytics tab with macro summary cards, support breakdown badges, and a micro decision table.
- Extended `api/_lib/supabase.ts` with orchestration decision row support and a list helper for the analytics route.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/orchestrator-decide.test.ts api/__tests__/orchestrator-analytics.test.ts tests/orchestration-routing.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. The current analytics tab is intentionally recent-only; if we want longer-term trend lines or pagination, that can be layered in next.
2. The Home visual slice from the earlier pass is still live and unchanged.

# CurrentState — Home cards now pulse their neon borders and inherit the fog overlay (2026-06-20)

**Scope of this pass:** Refined the Home page so the room cards stay fully present instead of fading, and the page now uses the Sanctuary fog layer for the same atmospheric depth.

### What changed

- Added `FogOverlay` to `client/src/pages/Home.tsx` so the Home page now shares the same drifting atmospheric layer as Sanctuary.
- Reworked the Home room cards so the motion sits on the border and outer neon glow instead of opacity changes.
- Disabled the card-level hover/dynamic breathing on the Home `GlassCard` instances so the cards stay visually stable while the border pulse does the work.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. The next requested slice is persistence and analytics for the orchestration layer.

# CurrentState — Neural Handshake Orchestrator v0 now lives as a deterministic triggered routing spine (2026-06-20)

**Scope of this pass:** Added the new shared orchestration package, a thin API decision route, a client helper, and the first caller integrations so GestaltView can classify explicit synthesis triggers without any always-on agent behavior.

### What changed

- Added `shared/orchestration/types.ts`, `stateClassifier.ts`, `intentClassifier.ts`, `routing.ts`, `fixtures.ts`, and `index.ts` as the reusable decision spine.
- Added `api/orchestrator/decide.ts` to expose the routing decision as a POST endpoint using the existing JSON route helpers.
- Added `client/src/lib/orchestratorClient.ts` so the UI can request orchestration decisions from the browser when a user explicitly triggers synthesis.
- Added `tests/orchestration-routing.test.ts` to cover low-energy conservatism, breakthrough document routing, mind-map routing, profile and multimodal signals, and the safety processor fallback.
- Aligned scaffold routing with the repo’s live `external-scaffold-pending` artifact-destination contract.
- Wired the Creation Corner synth path, session recap generator, and Transcriptory handoff caller to consult the new routing spine before they commit to synthesis or handoff behavior.

### Validation performed

- `./node_modules/.bin/vitest run tests/orchestration-routing.test.ts`
- `./node_modules/.bin/vitest run tests/orchestration-routing.test.ts client/src/tests/session-recap-download.test.ts client/src/tests/transcriptory-downloads.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`

### Remaining follow-up

1. If we later want persistence or analytics for orchestration decisions, add that as a separate schema-backed slice rather than turning v0 into an always-on system.

# CurrentState — Comprehensive test report runner now writes `docs/TEST_RESULTS.md` (2026-06-18)

**Scope of this pass:** Added a repo-wide test script that runs the broad framework sweep and writes a durable markdown report so we can keep the latest results and next slice in one place.

### What changed

- Added `scripts/run-comprehensive-tests.sh` and the `npm run test:full-report` alias so the full sweep can be launched from one command.
- The runner now always writes `docs/TEST_RESULTS.md` with pass/warn/fail counts, per-step status, exit codes, durations, notes, and recent log references.
- The report includes a `Next Slice` section that is pulled from the top `docs/CurrentState.md` follow-up block unless a manual override is provided.
- The Vitest sweep now discovers repo-owned tests explicitly so nested dependency tests under `node_modules` are not pulled into the run.

### Validation performed

- `bash scripts/run-comprehensive-tests.sh --no-log`
- `bash -n scripts/run-comprehensive-tests.sh`
- `git diff --check`

### Remaining follow-up

1. `docs/TEST_RESULTS.md` currently records the framework sweep's existing failures and warnings.
2. The next feature slice remains the Profile Portrait history or growth-timeline follow-up described in the entry below.

# CurrentState — Profile portrait render events now log from the Profile route (2026-06-18)

**Scope of this pass:** Filled one remaining Profile Portrait spec gap by adding the `portrait_render_events` audit table and recording a `view` event whenever the Profile personality route serves a persisted portrait.

### What changed

- Added `supabase/migrations/20260618100000_create_portrait_render_events.sql` for the render audit table, indexes, and RLS policies.
- Added `recordPortraitRenderEvent()` to `api/_lib/profilePortraitPersistence.ts` so the server can log `view`, `share`, `export`, and `delta_view` events through the existing Supabase REST path.
- Updated `api/profile/personality.ts` to record a `view` event against the persisted portrait before returning it to the client.
- Added `api/__tests__/profile-personality.test.ts` to verify that the persisted portrait path logs the audit event and leaves the manual fallback path untouched.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/profile-personality.test.ts api/__tests__/profile-portrait-drain.test.ts api/__tests__/profile-portrait-cadence.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. The growth-timeline surface in the spec can now be built on top of the new render-event table.
2. If we want to round out the spec further, the next obvious slice is a small history endpoint or hook that reads the new audit trail.

# CurrentState — Blackboard recap and Transcriptory downloads now offer format pickers (2026-06-18)

**Scope of this pass:** Replaced the remaining hardcoded recap and Transcriptory download behaviors with explicit format choosers so users can save HTML, text, or JSON instead of being locked into a single file type.

### What changed

- Added `client/src/lib/sessionRecapDownloads.ts` and wired `client/src/components/SessionRecapGenerator.tsx` to open a format-picker modal before downloading recap artifacts.
- Added `client/src/lib/transcriptoryDownloads.ts` and wired `client/src/components/TranscriptViewer.tsx` to open a format-picker modal before downloading Transcriptory captures.
- Added regression tests in `client/src/tests/session-recap-download.test.ts` and `client/src/tests/transcriptory-downloads.test.ts` to cover the new payload builders.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/session-recap-download.test.ts client/src/tests/transcriptory-downloads.test.ts client/src/tests/transcriptory-api.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. The tracker still has deeper product-flow items open, but the obvious export-format gaps have now been reduced further.
2. If we revisit export UX later, the next move would be to unify these format-picker modals behind a shared component.

# CurrentState — Dynamic Inner World download buttons now open a format picker (2026-06-18)

**Scope of this pass:** Replaced the hardcoded Dynamic Inner World artifact download behavior with an explicit format chooser so users can select HTML, text, or JSON before the file is saved.

### What changed

- Added `client/src/lib/dynamicInnerWorldDownloads.ts` with pure payload builders plus the actual browser download helper for HTML, text, and JSON exports.
- Updated `client/src/pages/DynamicInnerWorldPage.tsx` so the existing download action now opens a small format-picker modal instead of immediately downloading a single hardcoded file type.
- Added `client/src/tests/dynamic-inner-world-downloads.test.ts` to verify the HTML, text, and JSON payloads.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/dynamic-inner-world-downloads.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. The shared Codex export viewer still is not wired into the recap and Dynamic Inner World surfaces that do not use the Codex artifact model directly.
2. The remaining tracker items now skew toward deeper product flows rather than the simple download cases.

# CurrentState — Transcriptory audio failures now surface inline and preserve the real error message (2026-06-18)

**Scope of this pass:** Tightened the Transcriptory upload flow so failed audio ingestion keeps the actual backend error on the failed capture and shows it inline on the Transcriptory page instead of relying on a transient toast alone.

### What changed

- Added `formatTranscriptoryFailureMessage()` to `client/src/lib/transcriptory.ts` so the UI can normalize `Error`, string, and object-shaped failures into a consistent human-readable message.
- Updated `client/src/pages/TranscriptoryPage.tsx` so upload/transcription failures now store the actual error message on the failed capture and show a visible inline alert above the library controls.
- Added a regression test in `client/src/tests/transcriptory-api.test.ts` covering the failure-message normalization helper.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/transcriptory-api.test.ts client/src/tests/profile-preferences.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. The export-format selector issue is still open on the recap and Dynamic Inner World surfaces that do not yet use the shared export viewer directly.
2. The Manifest sync surface now reports the backend reason, but it could still benefit from a more explicit retry-state indicator if the user wants a stronger recovery cue.

# CurrentState — Profile portrait now surfaces on the Profile page and Manifest sync shows root-cause errors (2026-06-18)

**Scope of this pass:** Surfaced the latest validated portrait in the Profile room and tightened the Manifest founder-context sync feedback so a paused sync now includes the backend reason instead of only a generic failure message.

### What changed

- Added a dedicated `Portrait Profile` section to `client/src/pages/ProfilePage.tsx` and fed it from the shared `usePortrait()` hook plus `ProfileDisplay`, so the Profile room now shows the same latest validated portrait used in Sanctuary and Dynamic Inner World.
- Reused the portrait hook response on the Profile page instead of keeping a separate local personality-profile fetch path.
- Updated `client/src/pages/DashboardPage.tsx` so founder-context sync failures surface the backend error/reason alongside the existing retry button when pending writes cannot be persisted.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/profile-preferences.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. Export format selection is still not exposed at every output point, especially the recap and Dynamic Inner World surfaces that do not yet use the shared export viewer directly.
2. Audio upload failure handling still needs a dedicated retry/delete flow.

# CurrentState — Dynamic Inner World HTML surfaces now use the shared renderer (2026-06-18)

**Scope of this pass:** Standardized the Dynamic Inner World HTML surfaces on the new shared Codex renderer path by upgrading the renderer to support fixed-size and borderless modes, then swapping the gallery, deep-view, expand-view, artifact screen, and exhibit pod over to that shared iframe implementation.

### What changed

- Added `autoResize` and `chrome` options to `client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx` so the same renderer can serve both fixed preview cards and immersive full-screen views.
- Updated `client/src/components/ArtifactScreen.tsx` to render HTML content through the shared renderer instead of a local iframe.
- Updated `client/src/components/ArtifactExpandView.tsx` to use the shared renderer for immersive HTML artifacts.
- Updated `client/src/components/inner-world/InnerWorldArtifactGallery.tsx` to use the shared renderer for selected previews, tile previews, and the expanded overlay.
- Updated `client/src/features/dynamic-inner-world/world-renderer/components/ExhibitPod.tsx` to use the shared renderer for exhibit thumbnails.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/artifact-export-viewer.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. External Scaffold still needs a real Codex export bridge before it can adopt the export viewer instead of its current capture-orb inspector.

# CurrentState — Codex ArtifactExportViewer and retrieval hooks landed (2026-06-18)

**Scope of this pass:** Built the client-side phase-4 Codex viewing slice from `specs/gen-engine/GestaltView-RenderingEngine-v2-SPEC-FINAL.md` by adding the export retrieval hook, iframe height bridge, HTML artifact renderer, and the composed `ArtifactExportViewer`, then wiring Creation Corner to use it.

### What changed

- Added `client/src/lib/rendering/artifactExport.ts` with shared endpoint, retrieval-mode, and manifest-selection helpers.
- Added `client/src/lib/rendering/hooks/useArtifactExport.ts` so the client can fetch preview signed URLs, stream persistent HTML, and poll `GET /api/codex/jobs/[jobId]` when exports are still rendering.
- Added `client/src/lib/rendering/hooks/useIframeResize.ts` to consume the `gestaltview:height` bridge emitted by the exported HTML shell.
- Added `client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx` for sandboxed iframe rendering of either signed URL previews or persistent `srcDoc` HTML.
- Added `client/src/lib/rendering/ArtifactExportViewer.tsx` as the toolbar + renderer composition layer with format selection, open/download/share, and rerun controls.
- Exported the new viewer and helper surface from `client/src/lib/rendering/index.ts`.
- Updated `client/src/pages/CreationCornerPage.tsx` to replace the raw Codex preview block with the new viewer and local fallback HTML when the API path is unavailable.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/artifact-export-viewer.test.ts api/__tests__/codex-contracts.test.ts api/__tests__/codex-export-retrieval.test.ts api/__tests__/codex-creation-corner.test.ts api/__tests__/profile-portrait-cadence.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. External Scaffold still needs a real Codex export bridge before it can adopt the export viewer instead of its current capture-orb inspector.

# CurrentState — Codex template module split into renderers and kinds landed (2026-06-18)

**Scope of this pass:** Refactored `shared/codex/templates` into a shared renderer helper module and a kind-specific module boundary so the HTML template surface stays stable while the implementation is easier to reason about.

### What changed

- Added `shared/codex/templates/renderers/index.ts` and `.js` for shared HTML escaping, embellishment stripping, prose rendering, list rendering, provenance drawers, and summary helpers.
- Added `shared/codex/templates/kinds/index.ts` and `.js` for the kind-specific `renderArtifactHtml` dispatcher and the per-kind HTML layouts.
- Slimmed `shared/codex/templates/html.ts` and `.js` down to a thin re-export so the existing worker import path stays unchanged.
- Updated `shared/codex/templates/index.ts` to export the new renderer and kind modules alongside the existing shell and component surfaces.

### Validation performed

- `./node_modules/.bin/tsc --noEmit --pretty false`
- `./node_modules/.bin/vitest run api/__tests__/codex-contracts.test.ts api/__tests__/codex-export-retrieval.test.ts api/__tests__/codex-creation-corner.test.ts api/__tests__/profile-portrait-cadence.test.ts`
- `git diff --check`

### Remaining follow-up

1. Wire the same viewer into External Scaffold and Dynamic Inner World with the appropriate retrieval mode defaults.

# CurrentState — Signed URL retrieval endpoint and persistent HTML streaming landed (2026-06-18)

**Scope of this pass:** Implemented the phase-3 Codex retrieval slice from `specs/gen-engine/GestaltView-RenderingEngine-v2-SPEC-FINAL.md` by adding the new GET endpoint for export retrieval, signed preview URLs, and server-streamed persistent HTML viewing.

### What changed

- Added `api/codex/artifacts/[artifactId]/exports/[format].ts` to serve the retrieval contract for Codex exports.
- Kept public artifacts accessible without auth, but now gate private artifacts before revealing export state.
- Added the preview-mode signed URL path with a 1-hour TTL and an explicit `expiresAt` response field.
- Added persistent-mode HTML streaming that fetches the export from Supabase Storage server-side and returns the HTML body directly.
- Returned `202` with `jobId` when the export is still pending or running so the client can poll `GET /api/codex/jobs/[jobId]`.
- Added `createCodexSignedUrl()` to `shared/codex/storage.ts` so the retrieval endpoint can reuse the same storage client path as export writes.
- Added `api/__tests__/codex-export-retrieval.test.ts` to cover preview, persistent, and pending-job retrieval flows.
- Updated the route behavior to return the spec's ephemeral-storage message for `memory://` exports.

### Validation performed

- `./node_modules/.bin/vitest run api/__tests__/codex-export-retrieval.test.ts api/__tests__/codex-contracts.test.ts api/__tests__/codex-creation-corner.test.ts api/__tests__/profile-portrait-cadence.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. Implement the client-side `ArtifactExportViewer` and `useArtifactExport` slice so Creation Corner and Dynamic Inner World can consume the new retrieval endpoint.

# CurrentState — Codex HTML shell v2 and kind-specific renderers landed (2026-06-18)

**Scope of this pass:** Implemented the phase-2 Codex HTML renderer slice from `specs/gen-engine/GestaltView-RenderingEngine-v2-SPEC-FINAL.md` by adding a shared HTML shell, kind-specific export layouts, and the first v2 viewer-quality assertions.

### What changed

- Added `shared/codex/templates/html-shell.ts` plus the companion `.js` file to provide the shared v2 HTML shell with:
  - GestaltView design tokens and responsive layout
  - `data-codex-artifact` and `data-kind` attributes on `<main>`
  - a built-in height-postMessage bridge for iframe sizing
  - optional Mermaid support
  - a reusable footer/header scaffold for every export kind
- Replaced `shared/codex/templates/html.ts` and `shared/codex/templates/html.js` with kind-specific renderers for:
  - `session_recap`
  - `blueprint`
  - `report_document`
  - `mind_map`
  - `share_card`
  - `code_module`
  - `spatial_scene`
  - `audio_narration`
  - `profile_portrait`
- Kept the renderer backward-compatible with the live Codex schema, including the current `mind_map` `edges` shape and the current `profile_portrait` body.
- Exported the new shell from `shared/codex/templates/index.ts` so the template surface stays discoverable.
- Added renderer assertions in `api/__tests__/codex-contracts.test.ts` to confirm the new shell and a kind-specific share-card layout.

### Validation performed

- `node --check /workspaces/gestaltview-v2.0/shared/codex/templates/html.js`
- `node --check /workspaces/gestaltview-v2.0/shared/codex/templates/html-shell.js`
- `./node_modules/.bin/vitest run api/__tests__/codex-contracts.test.ts api/__tests__/codex-creation-corner.test.ts api/__tests__/profile-portrait-cadence.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`

### Remaining follow-up

1. If we want the spec’s richer interactive details in full, add the separate `renderers/` and `kinds/` module split in a follow-on pass.

# CurrentState — Portrait cadence trigger and Codex export registry alignment landed (2026-06-18)

**Scope of this pass:** Closed the remaining profile-portrait monthly cadence follow-up, then started the Rendering Engine v2 implementation by aligning the Codex export registry and Creation Corner defaults to the approved format table.

### What changed

- Added `supabase/migrations/20260618090000_add_portrait_monthly_cadence_helper.sql` with `public.maybe_queue_portrait_cadence(uuid, integer)` so first-of-month portrait refreshes can enqueue safely without duplicating active work.
- Added `api/cron/profile-portrait-cadence.ts` and scheduled it in `vercel.json` for `0 0 1 * *`, giving profile portraits an explicit monthly enqueue sweep.
- Added `listMonthlyPortraitCadenceCandidates()` to `api/_lib/profilePortraitPersistence.ts` so the cadence cron can scan only the latest validated/rendered portrait per user.
- Updated `shared/codex/router.ts` to match the approved v2 export registry:
  - removed `mp3` from `session_recap`
  - removed `gltf` from `mind_map` and `spatial_scene`
  - added `html` to `audio_narration`
  - kept `share_card`/`profile_portrait` aligned with the spec table
- Updated `shared/codex/creationCorner.ts` so draft artifacts seed the allowed export formats from the registry instead of hardcoded `html`/`json`.
- Updated `api/codex/forge.ts` so the fallback export seeding now uses the full allowed format list for the artifact kind.
- Updated `client/src/pages/CreationCornerPage.tsx` so the forge request and local fallback manifest both derive export formats from the draft itself.
- Updated the Codex contract tests and Creation Corner tests to match the new registry defaults.

### Validation performed

- `git diff --check`
- `./node_modules/.bin/vitest run api/__tests__/codex-contracts.test.ts api/__tests__/codex-creation-corner.test.ts api/__tests__/profile-portrait-cadence.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`

### Remaining follow-up

1. Continue with Rendering Engine v2 phase 2: shared HTML shell v2 and per-kind HTML template builders.
2. Add the signed URL retrieval endpoint and client `ArtifactExportViewer` once the new exports have real HTML to render.

# CurrentState — Profile Portrait persistence, queue drain, and validated reads landed (2026-06-17)

**Scope of this pass:** Added the Supabase-backed portrait persistence layer described by `specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md`, plus the queue-drain cron that persists validated portraits and the reader updates that prefer the latest stored portrait.

### What changed

- Added new portrait migrations under `supabase/migrations/`:
  - `20260617130000_create_profile_portraits.sql`
  - `20260617131000_create_portrait_inference_runs.sql`
  - `20260617132000_create_portrait_inference_queue.sql`
  - `20260617133000_create_portrait_helper_functions.sql`
  - `20260617134000_create_portrait_bucket_drop_trigger.sql`
- Kept the queue lifecycle safe by using a partial unique index for active queue rows instead of blocking completed history.
- Added helper RPCs for current portrait version and portrait signal counts, plus a `maybe_queue_portrait_inference()` helper for threshold checks.
- Added a defensive bucket-drop trigger that enqueues portrait work only when the incoming `user_id` looks like a UUID.
- Added `api/cron/profile-portrait-drain.ts` and scheduled it in `vercel.json` so queued portrait work now drains into `profile_portraits`.
- Updated `api/profile/personality.ts` and `api/consciousness/dynamic-inner-world.ts` to read the latest validated persisted portrait when available.
- Updated `docs/audits/codex-artifact-rendering-pipeline-audit.md` to reflect the now-landed persistence spine and drain path.

### Validation performed

- `git diff --check`
- `./node_modules/.bin/vitest run api/__tests__/profile-portrait-drain.test.ts api/__tests__/codex-contracts.test.ts tests/profile-portrait.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`

### Remaining follow-up

1. Add the spec’s monthly cadence trigger if we want the automatic first-of-month portrait run path.
2. If the live Supabase project already has a compatible `gravity_reports` or `agent_memories` surface, wire the helper counts to the exact live schema shape during the drain path.

# CurrentState — Profile Portrait layer landed as a deterministic read model (2026-06-17)

**Scope of this pass:** Implemented the `profile_portrait` read model from `specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md` as a deterministic portrait surface built from existing profile, memory, bucket drop, gravity report, and founder-context evidence.

### What changed

- Added a shared portrait builder in `shared/profilePortrait.ts`.
- Extended `api/profile/personality.ts` and `api/consciousness/dynamic-inner-world.ts` to return a portrait payload alongside the existing profile data.
- Added `client/src/hooks/usePortrait.ts` and updated `client/src/components/ProfileDisplay.tsx`, `client/src/pages/SanctuaryPage.tsx`, and `client/src/pages/DynamicInnerWorldPage.tsx` to render the portrait in the live UI.
- Added `profile_portrait` to the Codex contract, renderer, router, and HTML template so the new artifact kind validates and renders deterministically.
- Updated `docs/audits/codex-artifact-rendering-pipeline-audit.md` with the remaining spec gaps.

### Validation performed

- `./node_modules/.bin/vitest run tests/profile-portrait.test.ts api/__tests__/codex-contracts.test.ts`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `git diff --check`
- Confirmed the supplied `supabase/supabase-schema-current.md` snapshot does not yet list `profile_portraits`, `portrait_dimensions`, `portrait_inference_runs`, or `portrait_inference_queue`.

### Remaining follow-up

1. Add the portrait persistence and inference migrations if we want the spec's database layer, cadence, and queue semantics.
2. Decide whether `profile_portrait` should remain a manually constructed/rendered kind or become an automatic forge emission path.

## CurrentState — Trainer search RPC fixed to see `pg_trgm` in extensions schema (2026-06-17)

**Scope of this pass:** Fixed the next `supabase db push --include-all` blocker after the gate slice removal. The trainer control-plane migration was calling `similarity()` with a `public`-only search path, so the `pg_trgm` function installed under `extensions` was invisible.

### What changed

- Updated `supabase/migrations/20260412093000_trainer_control_plane_stabilization.sql`:
  - Changed `create extension if not exists pg_trgm;` to `create extension if not exists pg_trgm with schema extensions;`
  - Changed the RPC definition to `set search_path = public, extensions`

### Validation performed

- `git diff --check`

### Remaining follow-up

1. Rerun `supabase db push --include-all` to confirm the trainer search RPC now resolves `similarity()` correctly.
2. If another migration uses `pg_trgm` or `similarity()`, keep `extensions` on the search path or schema-qualify the function call.

## CurrentState — Unfinished gate commerce slice removed from Supabase migration chain (2026-06-17)

**Scope of this pass:** Removed the not-yet-realized gate commerce tables from the Supabase migration path after repeated `db push` failures. The unfinished gate slice included the package-builder migrations and the follow-on RLS/download-key steps that only existed to support `gate_*` persistence.

### What changed

- Deleted the unfinished gate commerce migration files:
  - `supabase/migrations/20260406171500_create_gate_package_builder_tables.sql`
  - `supabase/migrations/20260406193500_add_gate_draft_contact_fields.sql`
  - `supabase/migrations/20260407120000_extend_orders_for_gate_checkout.sql`
  - `supabase/migrations/20260408113000_isolate_gate_persistence.sql`
  - `supabase/migrations/20260411083000_add_gate_sidekick_state.sql`
- Removed the gate-specific RLS block from `supabase/migrations/20260410200000_resolve_legacy_tables_rls.sql`.

### Validation performed

- `git diff --check`
- Verified `supabase/migrations` no longer contains `gate_*` migration files.

### Remaining follow-up

1. Rerun `supabase db push --include-all` to confirm the migration chain now skips the unfinished gate commerce surface entirely.
2. If the app still needs a buyer/order flow later, it should be reintroduced as a deliberate, smaller slice instead of riding on these unfinished migrations.

## CurrentState — Gate artifact backfill unblocked by legacy `storage_path` column restore (2026-06-17)

**Scope of this pass:** Fixed the remaining `20260408113000_isolate_gate_persistence.sql` crash where the backfill was reading `public.artifacts.storage_path`, but the live `artifacts` table predated that column.

### What changed

- Updated `supabase/migrations/20260406171500_create_gate_package_builder_tables.sql`:
  - Added `alter table if exists artifacts ... add column if not exists storage_path text;`
  - Kept the gate artifact copy logic unchanged so the backfill can now read the legacy row shape.

### Validation performed

- `git diff --check`

### Remaining follow-up

1. Rerun `supabase db push --include-all` to verify the gate artifact backfill now clears.
2. If the push still trips on another `artifacts` column, add that legacy column before the copy rather than changing the copy target.

## CurrentState — Gate artifact migration made adaptive for legacy artifacts table (2026-06-17)

**Scope of this pass:** Fixed the `20260406171500_create_gate_package_builder_tables.sql` failure where the live `artifacts` table already existed but did not yet have the gate package-builder `build_job_id` column.

### What changed

- Updated `supabase/migrations/20260406171500_create_gate_package_builder_tables.sql`:
  - Added `alter table if exists artifacts ... add column if not exists` for the gate artifact fields, especially `build_job_id`.
  - Left the `idx_artifacts_build_job_id` creation in place so the migration can finish wiring the lookup index after the column is present.

### Validation performed

- `git diff --check`

### Remaining follow-up

1. Rerun `supabase db push --include-all` to verify the old `artifacts` table now upgrades cleanly through this migration.
2. If another gate table already exists in a pre-gate shape, add the missing columns before any new indexes or foreign-key assumptions.

## CurrentState — Gate package-builder orders migration made adaptive for legacy table shape (2026-06-17)

**Scope of this pass:** Fixed the `20260406171500_create_gate_package_builder_tables.sql` failure where the live DB already had an older `orders` table but not the new `buyer_id`/`package_draft_id` columns expected by the gate package-builder indexes.

### What changed

- Updated `supabase/migrations/20260406171500_create_gate_package_builder_tables.sql`:
  - Added `alter table if exists ... add column if not exists` steps for `package_drafts.buyer_id` and `orders.buyer_id` / `orders.package_draft_id`.
  - Left the existing index statements in place so the migration still creates the intended gate lookup indexes once the columns exist.

### Validation performed

- `git diff --check`

### Remaining follow-up

1. Rerun `supabase db push --include-all` to verify the legacy `orders` table can now be upgraded through this migration.
2. If another old gate migration fails on missing columns, apply the same pattern: add the columns first, then index them.

## CurrentState — Trainer study-source RPC swap unblocked by signature-specific drop (2026-06-17)

**Scope of this pass:** Fixed the next `supabase db push --include-all` blocker in `trainer_search_study_sources`, where the migration was dropping the function by bare name even though the live database carries multiple overloads.

### What changed

- Updated `supabase/migrations/20260331110001_vector_sim_source.sql`:
  - Replaced `DROP FUNCTION IF EXISTS trainer_search_study_sources;` with an explicit drop of `public.trainer_search_study_sources(text, vector, float8, integer)`.
  - Kept the 4-arg vector-search function body unchanged so the migration still recreates the intended RPC.

### Validation performed

- `git diff --check`

### Remaining follow-up

1. Rerun `supabase db push --include-all` to confirm the migration chain now clears the trainer study-source swap.
2. If the push hits another overloaded function name, drop the exact signature rather than the bare name before retrying.

## CurrentState — Supabase skill vector migration unblocked by `skill_stats` view rebuild (2026-06-17)

**Scope of this pass:** Fixed the live `supabase db push --include-all` failure caused by the legacy `skill_stats` view depending on `skill_fragments.embedding` while the 768-dim vector migration was trying to rewrite that column.

### What changed

- Updated `supabase/migrations/20260327094500_align_fragment_embeddings_to_768.sql`:
  - Drop `skill_stats` before the `skill_fragments.embedding` type change.
  - Recreate `skill_stats` after the rewrite as a `skill_fragments` aggregate view with `fragment_count`, `total_chars`, `file_count`, `embedded_count`, and `last_updated`.
- Updated `supabase/migrations/20260327094600_fix_vector_dims.sql`:
  - Made the `skill_fragments` and `embeddings` type rewrites conditional on the current vector typmod being different from `768`.
  - Rebuild `skill_stats` only if the `skill_fragments` rewrite actually runs, so the migration stays safe on reruns.

### Validation performed

- `git diff --check`

### Remaining follow-up

1. Rerun `supabase db push --include-all` against the target project to confirm the migration chain now passes through the skill vector rewrite.
2. If the live database still has additional legacy views around `skill_fragments`, we should clear those dependency edges before any future type migration on that table.

## CurrentState — Rendering engine canonicalization and contract bridge (2026-06-16)

**Scope of this pass:** Consolidated the client rendering contract onto the registry-based engine surface, removed the duplicate folder entrypoint, and preserved backward-compatible format resolution for generated artifacts.

### What changed

- Kept `client/src/lib/rendering/index.ts` as the canonical folder entrypoint.
- Updated `client/src/lib/rendering/RenderingEngine.tsx` to dispatch through `getRenderer()` instead of maintaining a parallel lazy-import switch.
- Extended `client/src/lib/rendering/dispatch.ts` so `contentFormat` is honored before MIME and filename sniffing.
- Removed the duplicate `client/src/lib/rendering/index.tsx` entrypoint to avoid the split export surface.
- Added `client/src/tests/rendering-contract.test.ts` to lock the resolver and registry contract.

### Validation performed

- `./node_modules/.bin/tsc --noEmit`
- `git diff --check`

### Remaining follow-up

1. If any direct imports still target the legacy uppercase renderer files, they should be normalized to the lowercase renderer modules in a later pass.
2. Continue with any broader rendering cleanup only if a concrete import site still depends on the legacy wrappers.

## CurrentState — Supabase runtime contract regeneration and missing-table backfill (2026-06-16)

**Scope of this pass:** Reconciled the Supabase contract report with the current repo migration spine, then added a live-safe backfill migration for tables the runtime still depends on.

### What changed

- Regenerated the schema contract report from the repo migration spine so the checker now tracks the current table families instead of the stale legacy commerce snapshot.
- Aligned both:
  - `supabase/schema_contract_report.sql`
  - `prisma/verification/verify_expected_columns.sql`
    with the same generated schema surface.
- Added `supabase/migrations/20260616000200_runtime_contract_backfill.sql` to backfill:
  - `session_rate_limits`
  - `order_notes`
  - `uploads`
  - `deliverables`
- Kept the backfill idempotent and avoided a hard foreign-key dependency on the deprecated commerce table path so it can be applied safely even if the earlier rename chain was skipped on a target live DB.

### Validation performed

- Regenerated the contract files from the repo-local migration spine.
- Verified the new contract includes `gate_orders`, `session_rate_limits`, `transcriptory_sessions`, `workspace_documents`, and `user_files`.
- Verified the new backfill migration is additive and idempotent.

### Remaining follow-up

1. Rerun the live SQL-editor schema check so the raw `supabase/expectescolumns.json` evidence reflects the regenerated contract.
2. If the live DB still reports drift after the backfill, trim the remaining table set against the current runtime contract rather than the legacy order-based snapshot.

## CurrentState — Live schema diff repair from `schemadiff.sql` (2026-06-16)

**Scope of this pass:** Reconciled the live-only identity / human profile tables from `gestaltview_supabase_recreation_package/supabase/schemadiff.sql` into the repo migration spine.

### What changed

- Added `supabase/migrations/20260616000100_identity_subject_human_profiles.sql`.
- The new migration defines the 12 live-only tables that were missing from the repo migration log:
  - `identity_subjects`
  - `human_identity_profiles`
  - `human_cognition_profiles`
  - `human_consciousness_profiles`
  - `human_personality_profiles`
  - `human_context_views`
  - `human_continuity_snapshots`
  - `human_memory_records`
  - `human_relationship_edges`
  - `human_identity_evidence`
  - `human_identity_mutations`
  - `human_identity_review_events`
- Verified that the snapshot-only table gap is now closed when comparing the snapshot against the repo migration set.
- Hardened `supabase/migrations/20260420150000_human_continuity_schema.sql` so the missing human review / rollback / context injection tables are created before the first `ALTER TABLE` and index references. That keeps a fresh local Supabase boot from failing on missing-table references in the human continuity migration.
- Added live-schema reconciliation migrations for the richer corpus and runtime surfaces:
  - `supabase/migrations/20260413143526_manifest_pipeline_schema_enhancements.sql`
  - `supabase/migrations/20260417030218_add_ingested_at_and_file_modified_to_knowledge_fragments.sql`
  - `supabase/migrations/20260501222005_bucket_drops_promotion_pipeline.sql`

### Validation performed

- Recomputed the table diff between `gestaltview_supabase_recreation_package/supabase/schemadiff.sql` and `supabase/migrations`.
- Confirmed `snapshot_only` is now empty.
- Ran `git diff --check`.

### Remaining follow-up

1. If you want the live project brought up to the repo’s newer table surface, the next step is a live apply/reset path.
2. The repo still has a broader set of newer `repo_only` tables that were not present in the live snapshot and may need a separate live-apply decision.

## CurrentState — Supabase migration canonicalization repair (2026-06-16)

**Scope of this pass:** Repaired the out-of-sync Supabase migration tree by aligning `supabase/migrations` with the canonical filenames and headers from `gestaltview_supabase_recreation_package/canonical_migrations`.

### What changed

- Canonicalized the migration filenames in `supabase/migrations` so they now match the package order and naming spine.
- Replaced the repo migration bodies with the package canonical versions, including the normalized source/canonical header comments.
- Removed the old alias-style migration filenames so Supabase CLI ordering now uses the canonical timestamps only.

### Validation performed

- Compared every `supabase/migrations` file against `gestaltview_supabase_recreation_package/canonical_migrations` by SHA-256.
- Verified there are no leftover alias filenames in `supabase/migrations`.

### Remaining follow-up

1. If you want the live remote project rebuilt from this canonical tree, run `supabase db reset` or `supabase db push` from the linked package/repo workflow.
2. Continue with any Supabase apply/verify step needed for the target project.

## CurrentState — Session recap routing and Musical DNA manual upload restore (2026-06-13)

**Scope of this pass:** Continued `specs/launch/SPEC_session_recap_routing.md` and restored the manual track-upload path on Musical DNA. Session recap destinations now resolve through the shared blocklist-aware routing helper, and Musical DNA now persists uploaded audio through the shared user-file seam instead of only creating temporary local object URLs.

### What changed

- Updated the session recap routing path:
  - Added shared destination helpers in `shared/codex/creationCorner.ts` so blocked recap targets resolve safely before synthesis.
  - Wired the Creation Corner page and synth API to use the resolved destination and surface the session recap save message consistently.
  - Normalized the Python engine path so the persisted artifact carries the resolved destination override.
- Restored manual Musical DNA uploads:
  - Added a reusable Musical DNA track record/helper layer and a dedicated upload panel.
  - Wired the Musical DNA page to persist uploaded tracks through the shared user-file storage path and hydrate them back into the playlist.
  - Added Musical DNA helper coverage for the manual upload metadata mapping.

### Validation performed

- `./node_modules/.bin/vitest run client/src/tests/musical-dna-tracks.test.ts client/src/tests/musical-dna-ambient.test.ts client/src/tests/spotify-musical-dna.test.ts`
- `./node_modules/.bin/tsc --noEmit`
- `git diff --check`

### Remaining follow-up

1. Manual browser QA should confirm the Musical DNA upload panel behaves well for drag-and-drop, file picking, and removals.
2. Continue with the next launch-hardening slice after this upload restore.

## **NEVER EVER REMOVE FROM THIS DOCUMENT, IT ROLLS FORWARD AND IS ADDED TO!!**

## CurrentState — Gap Remediation Sprint 2: Bucket Drops server sync and authenticated page-load hydration (2026-06-12)

**Scope of this pass:** Continued `specs/launch/GestaltView_Gap_Remediation_SPEC_v1.1_Final.md` with the Bucket Drops API slice. The page was still local-first, so this pass wired creation through `/api/actions/bucket-drops`, added authenticated hydration from `/api/billy-bucket-drop` on page load, and kept the existing orb/card UI as the display surface.

### What changed

- Added `api/_lib/bucketDrops.ts`:
  - Shared helpers for building the persisted bucket-drop payload.
  - Derives launch-safe defaults for `intensity`, `plk_resonance_score`, and `stage` so the live `bucket_drops` row satisfies the table contract.
  - Preserves bucket-drop metadata in `capture_context` and keeps the verified auth user authoritative on the persisted route.
- Updated `api/_lib/supabase.ts`:
  - Added a typed `BucketDropRow` and `listBucketDrops(userId)` helper for the authenticated load path.
- Updated `api/_lib/actionsHandler.ts` and `api/billy-bucket-drop.ts`:
  - `POST /api/actions/bucket-drops` now persists bucket drops instead of only echoing an envelope.
  - `GET /api/billy-bucket-drop` now returns the authenticated user’s persisted drops in a client-friendly camelCase shape.
  - The authenticated `billy-bucket-drop` POST route now writes with the verified auth user instead of trusting request body identity.
- Updated `client/src/lib/bucketDrops.ts`:
  - Added client-side fetch helpers for `/api/actions/bucket-drops` and `/api/billy-bucket-drop`.
  - Added bucket-drop record hydration and merge helpers so the page can keep the current orb UI while syncing with the server.
- Updated `client/src/components/BucketDrops.tsx`:
  - On mount, hydrates persisted bucket drops from the server and merges them into local saved captures.
  - On create, posts the new drop through the actions route and keeps the local orb state in sync.
  - Preserved the existing send-to-scaffold and remove behaviors.
- Added regression tests:
  - `api/__tests__/bucket-drops.test.ts`
  - `client/src/tests/bucket-drops.test.ts`

### Validation performed

- `npx tsc --noEmit`
- `npx vitest run api/__tests__/bucket-drops.test.ts client/src/tests/bucket-drops.test.ts`
- `git diff --check`

### Remaining follow-up

1. Manual browser QA should confirm the authenticated Bucket Drops page now loads persisted drops and still behaves well when the network path is unavailable.
2. Continue with the remaining gap-remediation backlog after this Bucket Drops slice.

## CurrentState — Gap Remediation Sprint 2: Dashboard launch summary band and recent activity feed (2026-06-12)

**Scope of this pass:** Continued `specs/launch/GestaltView_Gap_Remediation_SPEC_v1.1_Final.md` with the Dashboard slice. The page already had substantial control-plane wiring, so this pass added the spec-facing launch summary at the top: a greeting header, three KPI tiles, and a recent activity feed built from the live memory and artifact counts.

### What changed

- Added `client/src/lib/dashboardOverview.ts`:
  - Pure helper that turns the dashboard payload, runtime artifact counts, and recent memory entries into a greeting, KPI cards, and activity rows.
  - Sorts and labels recent activity so the page can render a readable launch summary without duplicating logic.
- Updated `client/src/pages/DashboardPage.tsx`:
  - Added a top-level Dashboard overview band with a greeting, sessions/artifacts/modules metrics, and recent activity feed.
  - Replaced the spinner-only loading state with skeleton loaders that match the new summary layout.
  - Kept the existing admin/control-plane surface intact underneath the launch summary.
- Added `client/src/tests/dashboard-overview.test.ts`:
  - Verifies the greeting, KPI math, recent activity ordering, and empty-state handling.

### Validation performed

- `npx tsc --noEmit`
- `npx vitest run client/src/tests/dashboard-overview.test.ts`
- `git diff --check`

### Remaining follow-up

1. The Dashboard now has the required launch-facing summary, but manual browser QA should confirm the new band reads well on real data.
2. Continue with the remaining gap-remediation backlog after this summary slice.

## CurrentState — Gap Remediation Sprint 1: Musical DNA ambient inference rewrite and consent opt-in (2026-06-12)

**Scope of this pass:** Continued `specs/launch/GestaltView_Gap_Remediation_SPEC_v1.1_Final.md` with Work Stream 1.3. Musical DNA now behaves as an ambient display surface instead of an interview form: the Billy interview overlay and direct analyze form were removed, consent is stored through the shared surface-settings preference path, and the page now auto-infers a Musical DNA track from journals, recap artifacts, uploads, and profile context when consent is enabled.

### What changed

- Updated `client/src/pages/MusicalDNAPage.tsx`:
  - Removed the Billy interview overlay and the manual Spotify song-title / artist analyze form.
  - Added a first-visit ambient inference consent prompt with yes/no actions.
  - Added a consent-driven ambient inference effect that weaves journal, recap, creation, upload, and profile signals into a synthesized Musical DNA track.
  - Preserved the existing Spotify library import and local upload flows as ambient inputs instead of manual analysis inputs.
  - Added provenance lines to playlist cards so inferred tracks show how they were woven.
- Added `client/src/lib/musicalDnaAmbient.ts`:
  - Pure helper for reading the sanctuary journal snapshot and building a stable ambient analysis payload from the available signals.
  - Produces deterministic provenance, signature, and display text for the inferred Musical DNA track.
- Updated `client/src/lib/userSurfaceSettings.ts` and `client/src/pages/SettingsPage.tsx`:
  - Added `musicalDnaAmbientInference` to the shared surface settings preference state.
  - Exposed the ambient inference consent as a user-facing toggle in Settings.
- Updated `client/src/lib/spotifyMusicalDna.ts` and playlist upload plumbing:
  - Added provenance to imported Spotify and uploaded tracks so the playlist history remains explainable.
- Added `client/src/tests/musical-dna-ambient.test.ts`:
  - Verifies the journal snapshot reader.
  - Verifies the ambient analysis builder returns a stable, provenance-rich payload.

### Validation performed

- `npx tsc --noEmit`
- `npx vitest run client/src/tests/musical-dna-ambient.test.ts client/src/tests/spotify-musical-dna.test.ts client/src/tests/user-surface-settings.test.ts`
- `git diff --check`

### Remaining follow-up

1. Manual browser QA is still needed for the new ambient consent prompt and inferred-track display.
2. Continue with any remaining Sprint 1 hardening now that Blackboard recap and Musical DNA ambient inference are both green.

## CurrentState — Gap Remediation Sprint 1: Blackboard Recap Orbs wired into Dynamic Inner World (2026-06-12)

**Scope of this pass:** Continued `specs/launch/GestaltView_Gap_Remediation_SPEC_v1.1_Final.md` with the Blackboard recap slice. The session recap flow now starts from Blackboard Room, generates a recap artifact, and forwards that recap into the existing Dynamic Inner World storage path so the recap is discoverable in the current launch surfaces.

### What changed

- Added `client/src/lib/blackboardRecapArtifacts.ts`:
  - Converts `SessionRecapGenerator` output into the existing `InnerWorldArtifactRecord` shape.
  - Keeps the recap anchored to `originRoom: "blackboard"` with recap-specific tags.
  - Reuses the shared inner-world append helper so the recap shows up alongside other room artifacts.
- Updated `client/src/pages/BlackboardRoomPage.tsx`:
  - Builds recap-friendly capture and conversation payloads from the live Blackboard session state.
  - Exposes a collapsible `Session recap` panel once there is session content.
  - Sends generated recap artifacts into Dynamic Inner World and confirms the handoff with a toast.
- Added `client/src/tests/blackboard-recap-artifacts.test.ts`:
  - Verifies the recap artifact builder produces a blackboard-origin inner-world artifact.
  - Verifies the append path stores the recap locally in Inner World storage.

### Validation performed

- `npx tsc --noEmit`
- `npx vitest run client/src/tests/blackboard-recap-artifacts.test.ts`
- `git diff --check`

### Remaining follow-up

1. Continue with Work Stream 1.3 Musical DNA ambient inference now that the Blackboard recap slice is operational.
2. Keep an eye on the recap panel browser UX in Blackboard and confirm the persisted recap appears in Dynamic Inner World during manual QA.

## CurrentState — Multi-Modal Sandbox integration and artifact detail surface (2026-06-12)

**Scope of this pass:** Implemented `specs/gen-engine/SPEC_SANDBOX_INTEGRATION.md` against the live repo shape. The existing `/sandbox` page is a separate legacy UI sandbox, so this pass added the new multi-modal implementation under `client/src/pages/MultiModalSandboxPage.tsx`, kept the legacy page intact, and wired the new authenticated `/app/sandbox` entry plus a local artifact detail surface.

### What changed

- Added `client/src/pages/MultiModalSandboxPage.tsx`:
  - Three runtime modes: HTML/JS, Python via Pyodide, and Three.js.
  - Sandboxed iframe preview with the Neural Aurora tokens and CRT overlay.
  - Header CTA for saving the current sandbox snapshot as an artifact.
  - Local persistence of the active mode and code state via the new sandbox persistence hook.
- Added `client/src/hooks/useSandboxPersistence.ts`:
  - Loads `gestaltview:sandbox:state` from `localStorage`.
  - Falls back cleanly to the page defaults if storage is empty or corrupt.
  - Persists edits and the selected mode as the user works.
- Added `client/src/hooks/useCreateArtifact.ts`:
  - Adapts the sandbox payload into the live gen-engine artifact route.
  - Reuses the existing `/api/gen-engine/artifacts` path instead of inventing a new backend contract.
  - Stores the saved artifact snapshot locally so the detail page can reopen it.
- Added `client/src/lib/sandboxArtifacts.ts`:
  - Shared sandbox payload types and local-storage helpers.
  - `buildSandboxArtifactPayload(...)` for the save flow.
  - Local artifact record persistence and retrieval for the route handoff.
- Added `client/src/pages/SandboxArtifactDetailPage.tsx`:
  - Local-first artifact detail view backed by the saved sandbox snapshot.
  - Reuses `ArtifactDeepView` for a consistent detail presentation.
- Updated `client/src/App.tsx`:
  - Added `/app/sandbox` and `/app/artifacts/:artifactId` routes.
  - Preserved the legacy `/sandbox` surface.
- Updated `client/src/hooks/useSEO.ts`:
  - Added sandbox SEO metadata for the new multi-modal page.

### Validation performed

- `npx tsc --noEmit`
- `npx vitest run client/src/tests/sandbox-artifacts.test.ts`
- `git diff --check`

### Remaining follow-up

1. Browser QA is still needed for the new `/app/sandbox` editor/preview flows and the artifact detail handoff.
2. The saved artifact route is local-first because the repo does not currently expose a dedicated `/api/artifacts` endpoint matching the spec's payload shape.
3. Continue with the previously requested gap-remediation spec once this sandbox slice is complete and verified.

## CurrentState — Gap Remediation Sprint 1 continued: auth, guest demo, DemoGate, and Spotify callback diagnosis (2026-06-12)

**Scope of this pass:** Continued Sprint 1 from `specs/launch/GestaltView_Gap_Remediation_SPEC_v1.1_Final.md` after the feature-flag start. This pass focused on the Auth -> Sanctuary -> Billy chain, free-tier Dynamic Inner World demo behavior, and the Musical DNA Spotify callback failure reported during preview testing.

### What changed

- Auth and callback flow:
  - `client/src/pages/SignIn.tsx` now supports email/password sign-in through the existing Supabase auth bridge, while preserving email-link fallback when the password is blank.
  - `client/src/pages/Signup.tsx` redirects successful configured email/password signup with an immediate session to `/welcome`; confirmation-required signups show the email handoff instead.
  - `client/src/pages/SignIn.tsx` and `client/src/pages/Signup.tsx` show a Google OAuth button only when `VITE_GOOGLE_CLIENT_ID` and Supabase browser auth config are present.
  - `client/src/lib/supabaseAuth.ts` added `signInWithGoogle(...)`.
  - `client/src/contexts/AuthContext.tsx` now uses `/welcome` for sign-in, sign-up, and magic-link callback redirects, and logs `/api/session/state` degradation while falling through to unauthenticated state.
  - `client/src/pages/AuthCallback.tsx` now defaults callback continuation to `/welcome` instead of `/dashboard`.
- Sanctuary guest entry:
  - `client/src/pages/SanctuaryPage.tsx` now shows unauthenticated users a "Try as Guest" CTA and a single hard-coded read-only Billy exchange.
- Dynamic Inner World free-tier demo:
  - `client/src/pages/DynamicInnerWorldPage.tsx` now lets unauthenticated users generate exactly one session-only demo artifact in memory.
  - A second unauthenticated demo generation attempt shows `DemoGate` with a `/signup` CTA.
  - Navigating away with a guest demo artifact shows a "Your creation will disappear" prompt; browser unload also warns.
  - `client/src/components/DemoGate.tsx` now supports CTA label/href overrides for this flow.
- Musical DNA Spotify callback:
  - `client/src/lib/spotify.ts` now diagnoses Spotify configuration instead of silently falling back to the current preview origin.
  - The flow now requires `VITE_SPOTIFY_REDIRECT_URI` or a Vite-exposed public app URL (`VITE_GESTALTVIEW_PUBLIC_BASE_URL`, `VITE_PUBLIC_APP_URL`, or `VITE_APP_URL`).
  - If the configured redirect URI origin differs from the current app origin, Musical DNA blocks connect and explains that the preview callback must be registered or the registered deployment must be used.
  - Added `client/src/tests/musicaldna-spotify.test.ts`.

### Validation performed

- `npx tsc --noEmit`
- `npx vitest run client/src/tests/musicaldna-spotify.test.ts client/src/tests/spotify-musical-dna.test.ts`
- `npx vitest run client/src/tests/auth-redirect.test.ts client/src/tests/musicaldna-spotify.test.ts client/src/tests/spotify-musical-dna.test.ts`
- `git diff --check`

### Spotify operational note

The currently documented registered Spotify callback URI is `https://gestaltview-v2-0-nine.vercel.app/spotify/callback`. For the existing browser PKCE implementation, the app origin that starts OAuth must match the redirect origin because the code verifier is stored in browser `sessionStorage`. Random Vercel preview URLs will fail unless each preview callback is registered in Spotify, or the flow is moved to a server-side transaction store.

### Remaining risks / follow-up

1. Browser QA is still needed for `/login`, `/signup`, `/sanctuary`, Dynamic Inner World guest artifact flow, and the Musical DNA Spotify warning copy.
2. If Spotify must work reliably from arbitrary Vercel previews, implement a server-side Spotify OAuth transaction/exchange instead of browser-only PKCE storage.
3. Continue Sprint 1 with any remaining DemoGate edge tests and then move to Sprint 2 flow completion: Blackboard recap orbs, Musical DNA ambient inference, Dashboard, Profile, and Transcriptory surface completion.

---

## CurrentState — Gap Remediation Spec start: feature flags and Resume Rockstar verification (2026-06-12)

**Scope of this pass:** Began implementation of `specs/launch/GestaltView_Gap_Remediation_SPEC_v1.1_Final.md`, prioritizing Sprint 1 demo-critical surfaces. The live checkout already contained the Resume Rockstar `SectionEditor` Score/Enhance wiring called out by Spec 1.1, so this pass verified that contract and implemented the missing Feature Flag Nav Gating contract from Spec 5.3.

### What changed

- Added `client/src/config/featureFlags.ts` as the single source of truth for launch visibility flags:
  - `transcriptory: true`
  - `embodimentStudio: true`
  - `agentCouncil: false`
  - `digitalIntelligenceAcademy: false`
  - `rapidPrototype: false`
  - `adaptiveLayout: false`
  - `brainSparks: false`
  - `externalScaffold: false`
- Updated `client/src/components/TopNav.tsx` so desktop and mobile nav filter items through the feature flag config.
- Updated `client/src/components/home/modules.ts` so the home module galaxy uses the same feature flag config for flagged module visibility.
- Verified `client/src/modules/Resume_Rockstar/components/SectionEditor.tsx` already contains the Spec 1.1 client wiring:
  - Score calls `/api/modules/resume-rockstar/analyze`.
  - Enhance calls `/api/modules/resume-rockstar/enhance`.
  - ATS grade, PLK voice, delta badges, loading state, inline errors, and controlled textarea replacement are present.

### Validation performed

- `npx tsc --noEmit`
- `npx vitest run tests/unit/resumeRockstar.test.ts`
- `git diff --check`

### Validation caveats

- `npx vitest run api/__tests__/resume-rockstar.test.ts tests/unit/resumeRockstar.test.ts` timed out on the existing analyze-handler test while the unit scoring suite and enhance-handler test passed. Isolated rerun `npx vitest run api/__tests__/resume-rockstar.test.ts -t "analyze"` reproduced the timeout.
- `npx playwright test tests/e2e/resume-rockstar.spec.ts --project=chromium` could not run locally: sandboxed `npx` first hit `EAI_AGAIN`, and the approved rerun installed the Playwright runner but failed because repo-local `@playwright/test` is missing from `node_modules`.

### Remaining risks / follow-up

1. Continue Sprint 1 implementation from the remediation spec: Auth -> Sanctuary -> Billy degraded guest flow, `/login` and `/signup` Supabase wiring, and DemoGate reactivation for Dynamic Inner World.
2. Restore/install the local Playwright dependency set before claiming E2E acceptance for `tests/e2e/resume-rockstar.spec.ts`.
3. Investigate the existing `api/__tests__/resume-rockstar.test.ts` analyze-handler timeout; the UI and shared scoring tests do not currently isolate the cause.

---

## CurrentState — Launch Slices 7-12 role boundaries, beta surfaces, infra hardening, and closeout (2026-06-11)

**Scope of this pass:** Continued `specs/launch/GestaltView_Codex_Core_Launch_SPEC_2026-06-10.md` from completed Slice 6 into the final launch slices. This pass focused on the highest-risk concrete contracts across slices 7-12: Billy/DI role boundaries, first-contact orientation, beta-facing page cleanup, CORS/Codex drain fail-closed behavior, tests/observability scaffolding, and documentation closeout.

### What changed

- Added test-covered launch policy helpers in `client/src/lib/launchCore.ts`:
  - `getLaunchVisibleProfiles(...)` removes internal DI roles from user-facing Masterclass/Tribunal selectors.
  - `buildMasterclassSessionOpening(...)` keeps Billy in a support/thread-keeper role instead of asking Billy to impersonate the selected DI.
  - `buildOnboardingExplainerPrompt(...)` stores the original GestaltView explainer prompt asset without protected-character/brand imitation.
  - `buildProfileModuleLandscapeCopy(...)` derives profile module copy from actual visible module count.
  - `getBetaAnalyticsAccess(...)` hides beta analytics from ordinary free users while allowing paid/admin access.
- Updated Masterclass role boundaries:
  - `client/src/pages/MasterclassPage.tsx` now uses launch-visible profiles and filters out Gatekeeper, Repo Scribe, Recursive Builder, and archived/founder-only profiles.
  - `client/src/pages/MasterclassSessionPage.tsx` no longer opens Billy with "greet me as the selected DI" copy. Billy now supports the room while the selected DI keeps its own lane.
- Updated Tribunal/Council surface:
  - `client/src/pages/AgentCouncilPage.tsx` now labels the room as Tribunal in the header/empty state.
  - Added a paid/admin "Select all voices" control while preserving the existing free-tier single-voice gate.
  - The roster uses launch-visible profiles so internal roles do not appear in beta-facing selectors.
  - `client/src/components/home/modules.ts` now names the profile module `Tribunal`.
- Updated first-contact and beta-facing surfaces:
  - `client/src/pages/Home.tsx` removes "Pick a room," removes the graph-paper grid overlay, and adds a `Watch Explainer` route to `/welcome` using the stored explainer prompt.
  - Added `specs/onboarding/GestaltView_Onboarding_Explainer_Prompt_2026-06-11.md` as a reusable onboarding explainer prompt artifact.
  - `client/src/pages/SanctuaryPage.tsx` keeps Sanctuary identity while removing softer clinical/rest framing and adding an explicit `Import Files` route.
  - `client/src/pages/ProfilePage.tsx` no longer hardcodes "All 13 modules"; it uses the actual module count.
  - `client/src/pages/AnalyticsPage.tsx` hides analytics from ordinary free users during beta instead of exposing a possibly broken telemetry surface.
- Hardened infrastructure:
  - `api/_lib/cors.ts` no longer fails open to wildcard CORS in production-like environments when `CORS_ORIGINS` is missing; it falls back to the primary GestaltView origin.
  - `api/cron/codex-drain.ts` now claims work via `claim_codex_jobs` instead of directly selecting pending rows.
  - Added `supabase/migrations/20260611000100_codex_job_claim_rpc.sql` with `for update skip locked` atomic claim semantics and rollback notes.
- Added/updated tests:
  - `client/src/tests/launch-core-slices.test.ts`
  - `api/__tests__/cors.test.ts`
  - `api/__tests__/production-fix.test.ts`

### Validation performed

- Red runs before implementation:
  - `npx vitest run client/src/tests/launch-core-slices.test.ts` failed because `client/src/lib/launchCore.ts` did not exist.
  - `npx vitest run api/__tests__/cors.test.ts api/__tests__/production-fix.test.ts` failed because production CORS returned `*` without configured origins and Codex drain selected `/rest/v1/codex_jobs` instead of calling the atomic claim RPC.
- Green focused runs:
  - `npx vitest run client/src/tests/launch-core-slices.test.ts`
  - `npx vitest run api/__tests__/cors.test.ts api/__tests__/production-fix.test.ts`
  - `npx vitest run client/src/tests/launch-core-slices.test.ts api/__tests__/cors.test.ts api/__tests__/production-fix.test.ts client/src/tests/entitlements.test.ts api/__tests__/gate.test.ts api/__tests__/council-run-entitlements.test.ts`
    - 32 tests passed across launch helper contracts, CORS, production/Codex drain, entitlement helpers, GATE, and council entitlement gates.
- Type check:
  - `npx tsc --noEmit`
- Perplexity sync:
  - `npm run sync:perplexity`
  - `npm run sync:perplexity:check`
- Build attempt:
  - `pnpm run build` passed `tsc`, reached Vite transform/rendering with `5064 modules transformed`, then terminated with exit `143`. This matches the previously documented environment/process-termination pattern rather than a TypeScript failure.

### Remaining risks / follow-up

1. Browser/manual QA is still needed for the final launch flow, especially the Home -> Welcome explainer CTA, Masterclass session open/end behavior, Tribunal select-all, and Analytics hidden-state copy.
2. The new Codex claim RPC migration must be applied in Supabase before production cron uses the atomic claim path successfully.
3. Masterclass progress persistence already records session starts through the existing RPC, but this pass did not add a distinct "end session" timestamp/control beyond the current navigation/progress behavior.
4. Full baseline blockers from Slice 0 remain open: pre-existing full-suite failures plus missing `.orientation/` and handoff bundle artifacts.
5. Production build still needs an environment where the Vite phase can complete without the known `143` termination.

---

## CurrentState — Launch Slice 6 External Scaffold preview and archive controls (2026-06-11)

**Scope of this pass:** Continued `specs/launch/GestaltView_Codex_Core_Launch_SPEC_2026-06-10.md` into Slice 6 after the Dynamic Inner World Slice 5 cleanup. This pass focused on making External Scaffold preview and lifecycle behavior meaningful without replacing the existing scaffold galaxy UI.

### What changed

- Added test-covered scaffold helper contracts in `client/src/lib/scaffoldStorage.ts`:
  - `buildScaffoldPreviewDetails(...)` produces the required preview rows: source, type, context, anchor, meaning, memory, tags, resonance, related, and decision.
  - Preview tag rendering filters out `billy`, preserving Billy as assist-only metadata rather than a scaffold node/artifact/tag.
  - Added archived scaffold storage and lifecycle helpers:
    - `readArchivedScaffoldOrbs`
    - `writeArchivedScaffoldOrbs`
    - `archiveScaffoldOrb`
    - `restoreScaffoldOrb`
- Extended `CaptureMetadata` in `client/src/components/Scaffold.tsx` with explicit `scaffoldArchive.previousStatus` metadata so restore can return an item to pending or approved state.
- Updated `client/src/pages/ExternalScaffoldPage.tsx`:
  - Pending rack expanded preview now shows the full preservation contract instead of only raw text and tag chips.
  - Approved artifact inspector now shows the same preservation contract from the approved source orb where available.
  - Pending or approved scaffold items can be archived without deleting unrelated queue/approved captures.
  - Added a scaffold archive panel with restore controls.
  - `Clear local scaffold` now clears pending, approved, and archived local scaffold buckets.

### Validation performed

- Red run before implementation:
  - `npx vitest run client/src/tests/scaffold-storage.test.ts` failed on missing `buildScaffoldPreviewDetails` and `archiveScaffoldOrb`.
- Green focused runs:
  - `npx vitest run client/src/tests/scaffold-storage.test.ts`
  - `npx vitest run client/src/tests/scaffold-storage.test.ts client/src/tests/external-scaffold-profile-pipeline-routing.test.ts client/src/tests/external-scaffold.module-safety.test.tsx`
    - Vitest ran the `.ts` scaffold storage and profile-pipeline tests; the `.tsx` module-safety test is excluded by the repo config.
  - `npx vitest run client/src/tests/external-scaffold.module-safety.test.tsx` reported no files found because `client/src/**/*.test.tsx` is excluded.
- Type check:
  - `npx tsc --noEmit`

### Remaining risks / follow-up

1. Slice 6 still needs browser/manual QA for the External Scaffold page, especially expanded pending preview density and archive restore behavior on narrow screens.
2. Denied pending orbs are still removed from the active pending rack while the profile-pipeline source capture remains intact; a visible denied-history lane could make that clearer in a later pass.
3. Archive storage is local-first. A server-side archived status would be cleaner if/when the scaffold API contract grows.

---

## CurrentState — Launch Slice 5 Dynamic Inner World beta cleanup start (2026-06-11)

**Scope of this pass:** Continued `specs/launch/GestaltView_Codex_Core_Launch_SPEC_2026-06-10.md` into Slice 5 after `client/src/lib/innerWorldLayout.ts` was intentionally removed. The pass treated that deletion as correct and removed live code dependence on the old static layout module while tightening artifact lifecycle controls.

### What changed

- Added component-scoped dynamic placement helper `client/src/components/inner-world/innerWorldPlacement.ts`:
  - Groups captures across the existing Inner World surfaces without creating placeholder records.
  - Derives stable placement from capture id/title/time and honors explicit capture display metadata.
  - Infers display mode from real capture content and media hints instead of relying on the removed `client/src/lib/innerWorldLayout.ts`.
- Updated `InnerWorldRoom` and `InnerWorldArtifact` imports to use the new component-scoped placement helper.
- Updated `client/src/components/Scaffold.tsx` comments so the active contract no longer references the removed layout file.
- Added shared Dynamic Inner World lifecycle helpers in `client/src/lib/innerWorldFiles.ts`:
  - `readArchivedInnerWorldArtifacts`
  - `writeArchivedInnerWorldArtifacts`
  - `archiveInnerWorldArtifact`
  - `restoreInnerWorldArtifact`
  - `clearInnerWorldArtifact`
- Rewired `client/src/pages/DynamicInnerWorldPage.tsx` to use the shared lifecycle helpers instead of page-local archive storage logic.
- Updated the world renderer context and archive vault so archived artifacts can be restored or cleared with confirmation from the Dynamic Inner World surface.
- Cleaned mobile DIW behavior by replacing the double-tap open trap with separate `Select` and `Open` controls.
- Added tests:
  - `client/src/tests/inner-world-files.test.ts`
  - `client/src/tests/inner-world-placement.test.ts`

### Validation performed

- Red run before implementation:
  - `npx vitest run client/src/tests/inner-world-files.test.ts client/src/tests/inner-world-placement.test.ts` failed on missing lifecycle exports / missing placement module. The storage test harness also needed a local `window` stub.
- Green focused run:
  - `npx vitest run client/src/tests/inner-world-files.test.ts client/src/tests/inner-world-placement.test.ts client/src/tests/dynamic-world-plan.test.ts`
- Type check:
  - `npx tsc --noEmit`
- Build attempt:
  - `pnpm run build` reached Vite transform and reported `5062 modules transformed`, then terminated with exit `143`. This matches the previously documented environment/process-termination pattern during Vite rather than a TypeScript failure.

### Remaining risks / follow-up

1. Slice 5 is not fully complete. The next pass should add browser/manual QA for narrow mobile viewport, archive/restore/download/delete in the deep view, and clearing bad raw-output records from the visible active surface.
2. Generated docs/manifests still contain stale references to `client/src/lib/innerWorldLayout.ts`; live client/API/shared code no longer imports it. Run the repo manifest/perplexity sync workflow after the Slice 5 code surface settles.
3. Archive/restore currently uses local archived storage and deletes/recreates the server artifact record as the closest available contract. A server-side archived status would be cleaner when the API contract is expanded.

---

## CurrentState — Launch Slices 3 and 4 Transcriptory reliability plus Creation/DIW artifact exports (2026-06-10)

**Scope of this pass:** Continued `specs/launch/GestaltView_Codex_Core_Launch_SPEC_2026-06-10.md` through Slice 3 and the day-ending Slice 4. Slice 3 hardened Transcriptory capture lifecycle behavior. Slice 4 made Creation Corner artifacts more exportable and Dynamic Inner World showcase-ready.

### What changed

- Hardened `/api/transcriptory/transcribe`:
  - Rejects unsafe `captureId` values with `400 invalid_capture_id` before storage or provider work.
  - Requires auth before transcription and keeps the provider path server-side.
  - Reads and validates the audio body before claiming a capture as processing, so empty uploads do not strand captures.
  - Claims same-capture transcription with a conditional update from `pending` or `failed` to `processing`.
  - Rejects duplicate or non-claimable same-capture transcription with `409 capture_already_processing`.
  - Marks provider/storage/enrichment failures as `status = failed` and `transcript_status = failed` with `error_code`, `error_message`, and `processing_completed_at`.
  - Reduces AssemblyAI polling from 80 attempts to 8 attempts so the synchronous path fits a serverless function budget.
- Added Supabase migration `supabase/migrations/20260610000300_transcriptory_processing_state.sql`:
  - Adds `error_code`, `error_message`, `processing_started_at`, and `processing_completed_at`.
  - Normalizes legacy `transcribing` to `processing` and `error` to `failed`.
  - Updates the status check constraint to include `pending`, `processing`, `ready`, `failed`, `archived`, `deleted`, and `approved`.
  - Adds `transcriptory_captures_user_status_updated_idx`.
- Updated Transcriptory client surfaces:
  - Local capture flow now uses `processing` and `failed` instead of legacy `transcribing` and `error`.
  - Transcript cards and viewer distinguish failed captures from pending captures and show failure diagnostics when available.
- Hardened Creation Corner / Dynamic Inner World artifact readiness:
  - Added `client/src/lib/creationCornerArtifacts.ts` for tested Markdown, HTML, and JSON export packaging.
  - Creation Corner now exposes separate `Download MD`, `Download HTML`, and `Metadata JSON` buttons.
  - Dynamic Inner World routing now uses the same rendered HTML showcase package with provenance/evidence tags.
  - Shared `exportArtifact(..., "html")` now returns an actual HTML document for markdown/code/text artifacts instead of labeling raw markdown as HTML.
  - Added the missing `marketing_copy` Creation Corner output lane and mapped it to shared `marketing-copy` generation plus Codex share-card packaging.

### Validation performed

- Red Slice 3 runs:
  - `npx vitest run api/__tests__/transcriptory.test.ts` failed before implementation on missing capture claim, bad ID rejection, failed-state update, and bounded polling behavior.
  - `npx vitest run api/__tests__/transcriptory.test.ts -t "does not claim"` failed before moving the claim after audio-body validation.
- Red Slice 4 run:
  - `npx vitest run api/__tests__/gen-engine.test.ts -t "exports markdown artifacts"` failed because HTML export returned raw markdown content.
- Green focused runs:
  - `npx vitest run api/__tests__/transcriptory.test.ts`
  - `npx vitest run client/src/tests/transcriptory-api.test.ts`
  - `npx vitest run api/__tests__/slice2-entitlement-limits.test.ts`
  - `npx vitest run api/__tests__/codex-creation-corner.test.ts api/__tests__/gen-engine.test.ts client/src/tests/creation-corner-artifacts.test.ts client/src/tests/creation-corner-freeform.test.ts`
  - `npx vitest run api/__tests__/transcriptory.test.ts client/src/tests/transcriptory-api.test.ts client/src/tests/gen-engine-room-wiring.test.ts api/__tests__/slice2-entitlement-limits.test.ts`
- `npx tsc --noEmit`
- `npm run build`

### Remaining risks / follow-up

1. Supabase migration `20260610000300_transcriptory_processing_state.sql` must be applied to production before the new Transcriptory processing/failure columns and status constraint are live.
2. Transcriptory still uses a synchronous AssemblyAI path. The 8-poll budget is safer for Vercel, but a true async job/status model remains the stronger production direction.
3. Creation Corner export/download behavior is now ready for beta use, but manual browser smoke is still needed for the full path: text capture -> Creation Corner -> generate -> download MD/HTML -> send to Dynamic Inner World -> open deep view -> archive/delete.
4. Next launch slice remains Slice 5: Dynamic Inner World beta cleanup, including empty state, demo gating, restore/archive ergonomics, and bad raw-output cleanup.

---

## CurrentState — Launch Slice 2 entitlement gates complete (2026-06-10)

**Scope of this pass:** Finished Slice 2 from `specs/launch/GestaltView_Codex_Core_Launch_SPEC_2026-06-10.md` by extending the earlier advanced Tribunal/Council gate into the remaining quota and production-payment controls called out by the launch spec.

### What changed

- Expanded `shared/entitlements.ts` and `client/src/lib/entitlements.ts` with shared tier normalization, paid-tier checks, workspace mutation access, advanced Tribunal access, Transcriptory audio upload limits, large file import limits, and consistent `upgrade_required` payload/copy helpers.
- Enforced server-side free-tier gates:
  - `/actions/tribunal/run` and `/api/council/run` still block anonymous/free multi-voice Tribunal/Council requests unless the explicit beta flag is enabled.
  - `/api/transcriptory/transcribe` now rejects free-tier audio uploads above the free cap before reading/provider work, then rechecks the actual buffer before AssemblyAI/storage calls.
  - `/api/inner-world/files` and `/api/documents` now reject over-limit large imports before storage/document persistence.
  - `/api/workspaces` still allows authenticated reads, but POST/PATCH/DELETE now require Core-or-higher, admin, or explicit entitlement override.
- Updated beta-facing UI:
  - `client/src/pages/AgentCouncilPage.tsx` continues to show a one-voice locked state for anonymous/free users.
  - `client/src/pages/WorkspacesPage.tsx` hides the workspace manager from free users and shows a Core teaser.
  - `client/src/components/document-analysis-interface.tsx` preflights file size, shows upgrade copy for over-limit imports, and does not silently fall back to local storage on `413 upgrade_required`.
- Hardened GATE checkout behavior in `api/gate/_handler.ts`:
  - Missing `GATE_ADMIN_KEY` no longer fail-opens admin mock checkout in production-like environments.
  - Missing Stripe configuration in production-like environments returns `503 gate_payment_not_configured` instead of silently simulating payment.
  - Local/test mock checkout remains available for development and tests.
- Added/updated tests:
  - `api/__tests__/slice2-entitlement-limits.test.ts`
  - `api/__tests__/workspaces.test.ts`
  - `api/__tests__/gate.test.ts`
  - `client/src/tests/entitlements.test.ts`
  - earlier Slice 2 Tribunal/Council tests remain in `api/__tests__/actions.test.ts`, `api/__tests__/endpoints.test.ts`, and `api/__tests__/council-run-entitlements.test.ts`.

### Validation performed

- Red run before implementation: `npx vitest run api/__tests__/slice2-entitlement-limits.test.ts api/__tests__/workspaces.test.ts api/__tests__/gate.test.ts` failed on the missing Transcriptory/file/workspace/GATE gates.
- Green focused Slice 2 run: `npx vitest run api/__tests__/slice2-entitlement-limits.test.ts api/__tests__/workspaces.test.ts api/__tests__/gate.test.ts client/src/tests/entitlements.test.ts`
- Green broadened regression run: `npx vitest run api/__tests__/actions.test.ts api/__tests__/endpoints.test.ts api/__tests__/council-run-entitlements.test.ts api/__tests__/launch-auth-hardening.test.ts api/__tests__/transcriptory.test.ts api/__tests__/documents.test.ts`
- `npx tsc --noEmit`
- `npm run build`

### Remaining risks / follow-up

1. Slice 2 acceptance criteria are complete for the current runtime: free test users cannot access advanced Tribunal/Council flows, UI explains locked states, server routes enforce gates, and build passes.
2. Full-suite baseline failures from the Slice 0 note remain open and were not fixed here.
3. Next recommended slice: Slice 3 Transcriptory reliability hardening, especially capture ID validation, processing/failed state transitions, duplicate same-capture transcription behavior, and Vercel-budget-safe provider polling.

---

## CurrentState — Launch Slice 2 advanced Tribunal entitlement gate (2026-06-10)

**Scope of this pass:** Continued `specs/launch/GestaltView_Codex_Core_Launch_SPEC_2026-06-10.md` into Slice 2 by closing the most obvious free-tier advanced-feature leak: anonymous/free users could invoke multi-participant Tribunal/Council flows through server routes even if the UI later hid them.

### What changed

- Added shared entitlement helper `shared/entitlements.ts` with:
  - tier normalization,
  - paid-tier detection,
  - advanced Tribunal request detection,
  - `canUseAdvancedTribunal(...)`,
  - a consistent `upgrade_required` response payload.
- Updated `/actions/tribunal/run` in `api/_lib/actionsHandler.ts`:
  - The implicit default three-participant Tribunal is treated as advanced.
  - Anonymous users now receive `403 upgrade_required`.
  - Free-tier authenticated users now receive `403 upgrade_required` for multi-participant Tribunal.
  - Core/pro/enterprise/founder tiers remain allowed.
  - `TRIBUNAL_BETA_ALL_VOICES_ENABLED=true` remains an explicit beta override.
- Updated `/api/council/run` so the lower-level council runner cannot bypass the actions gate:
  - Reads auth from cookie or bearer headers.
  - Blocks anonymous/free multi-voice runs before calling `runCouncil`.
  - Allows paid-tier multi-voice runs.
- Added client entitlement helper `client/src/lib/entitlements.ts`.
- Updated `client/src/pages/AgentCouncilPage.tsx` so free/anonymous UI shows one voice and a clear locked-state note instead of presenting all voices and then failing at the server.
- Added tests:
  - `api/__tests__/council-run-entitlements.test.ts`
  - new advanced Tribunal cases in `api/__tests__/actions.test.ts`
  - updated anonymous endpoint expectation in `api/__tests__/endpoints.test.ts`
  - `client/src/tests/entitlements.test.ts`

### Validation performed

- Red run before implementation: `npx vitest run api/__tests__/actions.test.ts api/__tests__/endpoints.test.ts` failed because anonymous/free advanced Tribunal requests returned `200`.
- Red run before `/api/council/run` implementation: `npx vitest run api/__tests__/council-run-entitlements.test.ts` failed because anonymous/free multi-voice council runs returned `200`.
- Green run after implementation: `npx vitest run api/__tests__/actions.test.ts api/__tests__/endpoints.test.ts api/__tests__/council-run-entitlements.test.ts client/src/tests/entitlements.test.ts`
- `npx tsc --noEmit`

### Remaining risks / follow-up

1. Slice 2 is not globally complete. Transcriptory upload/record limits, large file/image import limits, workspace pro-tool teaser/hide behavior, and production GATE/admin/mock-payment fail-closed behavior still need route-by-route gates.
2. `api/_lib/actionsHandler.ts` still has other action routes that use legacy `getUserId`; this pass only targeted advanced Tribunal access, not every action identity path.
3. Full-suite baseline failures from the prior Slice 0 note remain open and were not reclassified in this pass.
4. Next recommended slice: continue Slice 2 with Transcriptory upload/record limits or move to Slice 3 if Transcriptory reliability is more urgent than quota gating.

---

## CurrentState — Launch Slice 0/1 baseline and identity hardening (2026-06-10)

**Scope of this pass:** Began implementing `specs/launch/GestaltView_Codex_Core_Launch_SPEC_2026-06-10.md` with the required no-op baseline, then completed the first auth/user identity hardening slice for Billy, bucket drops, gen-engine artifact synthesis, and the legacy Creation Corner synthesize route.

### Baseline recorded before edits

- `git status --short` returned clean.
- `npm run build` passed.
- `npm test -- --runInBand` failed before tests because Vitest does not support `--runInBand`.
- `npm test` ran the normal fallback and reported 428 passing tests, 3 failing tests:
  - `api/__tests__/billy-runtime.test.ts` expected `BILLY_SYSTEM_PROMPT` to contain `Avoid therapist-script openers`; the live prompt contains `Avoid therapist-script validation openers`.
  - `server/__tests__/council-runner.test.ts` expected both `baked-lane` and `fallback-lane` to start after one microtask; only `baked-lane` had started.
  - `client/src/tests/embodiment-runtime.test.ts` expected runtime and profile-file slugs to match; `founder-studio-sample` exists in files but not runtime.
- `npm run health` passed. Ollama was noted as not running.
- `npm run orientation:check` failed because `.orientation/` and its canonical packet files are missing.
- `npm run continuity:check` failed because `artifacts/latest.zip` is missing and `README.md` lacks the expected handoff-bundle pattern.

### What changed

- Added `api/__tests__/launch-auth-hardening.test.ts` to pin launch identity contracts:
  - Anonymous Billy chat stays on `guest-user` and cannot persist under spoofed `body.userId`, `x-user-id`, or query `userId`.
  - `POST /api/billy-bucket-drop` requires authentication before writing `bucket_drops`.
  - Authenticated bucket drops persist under the authenticated session user, ignoring body identity.
  - `/api/gen-engine/artifacts` uses authenticated identity for artifact ownership and LLM routing context instead of request body `userId`.
  - `/api/creation-corner/synthesize` no longer attaches legacy syntheses or Codex drafts to spoofed `user_id`; unauthenticated Codex drafts retain the existing anonymous UUID fallback.
- Updated `api/billy.ts` so unauthenticated chat uses the fixed anonymous `guest-user` identity. Authenticated chat still uses `getAuthUser(req)`.
- Updated `api/billy-bucket-drop.ts` to require `getAuthUser(req)` before persistence and to write `bucket_drops.user_id` from the authenticated user only.
- Updated `api/gen-engine/artifacts.ts` to derive artifact `userId` and `routeLlm` context from authenticated identity only.
- Updated `api/creation-corner/synthesize.ts` to derive gen-engine, resonance, and Codex draft ownership from authenticated identity only.

### Validation performed

- `npx vitest run api/__tests__/launch-auth-hardening.test.ts` failed red before implementation on all five spoofing/auth contracts, then passed after implementation.
- `npx vitest run api/__tests__/billy.test.ts api/__tests__/creation-corner-synthesize.test.ts api/__tests__/gen-engine.test.ts api/__tests__/endpoints.test.ts` passed after implementation.
- `npx tsc --noEmit` passed after implementation.

### Remaining risks / follow-up

1. The full `npm test` suite still has the three baseline failures listed above; they were present before this launch slice and were not fixed here.
2. `api/_lib/user.ts` still exists for legacy helpers and non-authenticated compatibility paths. Further launch slices should retire or quarantine its use route-by-route rather than allowing user-scoped persistence from it.
3. Slice 1 coverage now includes Billy, bucket drops, gen-engine artifacts, and legacy Creation Corner synthesize. A broader identity inventory should continue across other persisted routes before declaring P0 identity leaks closed globally.
4. Next recommended slice: continue Slice 1 inventory or begin Slice 2 entitlement/free-account gating after deciding whether legacy unauthenticated synthesize should remain local/anonymous or require auth.

---

## CurrentState — Transcriptory library, sessions, search, and handoff normalization (2026-06-10)

**Scope of this pass:** Expanded Transcriptory from an audio transcription runtime into a first-class capture library with sessions, provenance, search filters, detail inspection, and normalized downstream handoff routes.

### What changed

- Added Supabase migrations `20260610000100_transcriptory_sessions_and_sources.sql` and `20260610000200_transcriptory_search_and_triggers.sql` for `transcriptory_sessions`, `transcriptory_sources`, capture metadata extensions, weighted FTS search, RLS policies, and session updated-at triggers.
- Expanded the Transcriptory API surface:
  - `GET/POST /api/transcriptory/captures` now supports pagination, session filter, text search, theme filter, status filter, expanded capture metadata, and source lineage creation.
  - `GET /api/transcriptory/captures/[id]` returns full capture detail, source lineage, session metadata, linked capture ids, and updates `last_accessed_at`.
  - `POST /api/transcriptory/captures/[id]/handoff` records normalized handoff provenance and returns human-shaped markdown for Creation Corner, Blackboard Room, or Universal Capture.
  - `GET/POST /api/transcriptory/sessions` and `PATCH /api/transcriptory/sessions/[id]` create, list, and update user-owned accumulation sessions.
- Updated `/api/transcriptory/transcribe` to write `transcript_text`, `processing_provider`, `transcript_status`, and failure metadata while preserving the AssemblyAI flow and no-browser-SpeechRecognition posture.
- Expanded the Transcriptory client helpers and page:
  - The library can search via the server, filter by session, load capture detail/provenance, and create sessions.
  - The detail pane shows transcript/session/source lineage and sends server-normalized handoff packets before navigating to Blackboard or Creation Corner.
  - Universal Capture preparation is exposed as a detail action without JSON dumping.
- Extended Transcriptory API and client tests for sessions, search filters, detail/provenance, server handoffs, and client helper contracts.

### Validation performed

- `npx vitest run api/__tests__/transcriptory.test.ts`
- `npx vitest run client/src/tests/transcriptory-api.test.ts`
- `npx vitest run api/__tests__/transcriptory.test.ts client/src/tests/transcriptory-api.test.ts`
- `npx tsc --noEmit`

### Remaining risks / follow-up

1. The two new Supabase migrations must be applied to the live project before sessions, source lineage, and FTS-backed search are available in production.
2. Embedding-backed related-capture retrieval can replace the current lightweight linked-capture scoring later.
3. Universal Capture and Journal can now use the Transcriptory session/capture seam, but deeper embedded voice UI integration remains a separate pass.

---

## CurrentState — Production fix spec implemented (gen-engine boot, cron auth, DIW pagination) (2026-06-09)

**Scope of this pass:** Implemented `specs/GestaltView_Production_Fix_SPEC_2026-06-09.md` inside the repo, covering the production module-resolution crash, Codex drain cron 401 fallback, and Dynamic Inner World artifact query hardening.

### What changed

- Updated `shared/codex/templates/index.ts` to export `./components.js` and `./html.js`, matching Node/Vercel ESM runtime resolution for compiled server code. `components.tsx` was not renamed because it contains JSX and the repo TypeScript config already includes JSX handling.
- Updated `api/cron/codex-drain.ts` so production accepts either Vercel's `x-vercel-cron: 1` header or `Authorization: Bearer $CRON_SECRET`, while preserving 401 behavior for unauthenticated production calls.
- Verified `vercel.json` already registers `/api/cron/codex-drain` on `*/2 * * * *`.
- Verified there is no remaining `url.parse()` usage under `api`, `shared`, `server`, or `client`; the `dynamic-inner-world` deprecation item is already clean in this checkout.
- Updated `api/inner-world/artifacts.ts` GET handling to use bounded pagination: `limit` defaults to 20, clamps to 100, and `offset` defaults to 0, then applies Supabase `.range(offset, offset + limit - 1)`.
- Added Supabase migration `20260609000300_artifact_query_indexes.sql` for:
  - `inner_world_artifacts(user_id)`
  - `inner_world_artifacts(user_id, created_at DESC)`
  - `codex_jobs(artifact_id)`
  - `codex_jobs(status)`
  - `codex_jobs(status, created_at ASC)`
- Added `api/__tests__/production-fix.test.ts` to pin the production-fix contracts.

### Validation performed

- `grep -R "url\\.parse" -n api shared server client --exclude-dir=node_modules` returned no matches.
- `npx vitest run api/__tests__/production-fix.test.ts`
- `npx tsc --noEmit`
- `pnpm run build`

### Remaining risks / follow-up

1. `CRON_SECRET` still needs to be set in Vercel Production/Preview/Development for bearer-triggered manual drain checks.
2. Supabase migration `20260609000300_artifact_query_indexes.sql` must be applied to the live project before the database-index side of the performance hardening takes effect.
3. Production smoke tests from the SPEC still need to be run after deploy: gen-engine resonance non-500, codex drain 200, no DEP0169 logs, and `/api/inner-world/artifacts` latency under target.

---

## CurrentState — Transcriptory AssemblyAI transcription, audio storage, and enrichment wiring (2026-06-09)

**Scope of this pass:** Completed the next Transcriptory runtime slice for AssemblyAI-backed audio capture: original audio persistence, transcription, summary/theme enrichment, and reverse-chronological CurrentState ordering.

### What changed

- Implemented `/api/transcriptory/transcribe` execution for raw audio uploads:
  - Persists browser-provided audio bytes to private Supabase Storage bucket `transcriptory_audio_files` under `user_id/capture_id/timestamp-filename`.
  - Uploads the same raw audio bytes to AssemblyAI `/v2/upload`.
  - Submits AssemblyAI `/v2/transcript` with `speech_models: ["universal-3-pro", "universal-2"]`.
  - Polls until completion and writes `audio_storage_path`, `raw_transcript`, `duration_seconds`, `summary`, `themes`, and `status = "ready"` back to the authenticated user's `transcriptory_captures` row.
  - Keeps AssemblyAI auth server-side with raw `Authorization` header, no `Bearer` prefix.
- Added server-side Transcriptory enrichment through the existing `routeLlm` cascade:
  - Produces a 2-4 sentence summary.
  - Extracts concise theme tags.
  - Runs a lightweight related-capture similarity pass and stores top related IDs in `linked_captures`.
  - Avoids browser SpeechRecognition fallback completely.
- Added Supabase migration `20260609000200_transcriptory_audio_bucket.sql` for the `transcriptory_audio_files` bucket and authenticated user-scoped storage policies.
- Updated Transcriptory client flow so uploaded and recorded audio creates a pending capture, sends the file to the server transcribe route, and replaces the library item with the completed capture response.
- Added clean Transcriptory handoff packets:
  - Creation Corner hydrates Transcriptory source into `freeText` without JSON payloads.
  - Blackboard Room consumes Transcriptory source through the existing upload/capture pipeline.
- Reordered `docs/CurrentState.md` so the newest entries appear at the top and older entries roll downward.

### Validation performed

- `npx vitest run api/__tests__/transcriptory.test.ts`
- `npx vitest run api/__tests__/transcriptory.test.ts client/src/tests/transcriptory-api.test.ts`
- `npx tsc --noEmit`
- `npm run build`

### Remaining risks / follow-up

1. The new Supabase migration must be applied in the live project before production audio persistence can succeed.
2. Linked-capture scoring is intentionally lightweight; vector similarity can replace it once Transcriptory captures are embedded.

---

# CurrentState — Gen-engine end-to-end rendering unblock (Codex drain cron + title fix)

**Last updated:** 2026-06-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Surfaced and partially unblocked the gen-engine end-to-end pipeline so that `codex_artifacts` can actually become rendered HTML files in the `codex-exports` bucket and surface in Dynamic Inner World. This is the foundation for everything DIW-shaped: without rendered artifacts, the room is theoretical.

Companion session: Same day's earlier work — Spotify `VITE_SPOTIFY_REDIRECT_URI` set on production+preview, corpus ingestion paused (Supabase free-tier 533 MB), `.env.vercel` exported for local use, runtime workflows directory cleaned up.

---

## What was checked (live MCP, not memory)

- **GitHub MCP:** the full Codex API surface (`api/codex/forge.ts`, `api/codex/jobs/[jobId]/run.ts`, `api/codex/_persistence.ts`, `api/codex/artifacts/[artifactId].ts`), the worker (`workers/codex/runner.ts`, `workers/codex/activities.ts`), the shared layer (`shared/codex/{contracts,router,storage,manifest}.ts`), the legacy gen-engine (`shared/gen-engine/core.ts`, `api/gen-engine/artifacts.ts`), the Creation Corner page (`client/src/pages/CreationCornerPage.tsx`), and the GenEngine SPEC (`specs/gen-engine/GestaltView-GenEngine-SPEC.md`).
- **Supabase MCP:** counts and column shapes of `codex_artifacts` (11), `codex_jobs` (12), `inner_world_artifacts` (5), all other artifact tables (0), and storage buckets list.
- **Vercel CLI:** confirmed `CODEX_EXPORT_BUCKET` was not set; added it as part of this session.

## What was found

1. **`codex-exports` storage bucket existed already** (created today 09:00:41 UTC by Keith) but `CODEX_EXPORT_BUCKET` env var was not set on Vercel, so `workers/codex/runner.ts` was falling back to `memory://` storage paths. **Fixed this session** — env var now set on production + preview, byte-verified via `vercel env pull`.

2. **All 12 `codex_jobs` rows are `status='pending'`** — none have ever been processed since the table was created. The Codex pipeline correctly enqueues jobs via `api/codex/forge.ts`, but **nothing in the runtime ever calls `runCodexExportJob(jobId)` to drain them.** The endpoint `POST /api/codex/jobs/[jobId]/run` exists but no caller invokes it; no cron polls; no webhook fires.

3. **All 11 `codex_artifacts` rows have JSON-stringified titles** like `'{"id":"blueprint-7afdf410...","title":"Blackboard Summary","summary":"You: Hello..."'`. Root cause traced to `shared/gen-engine/core.ts:pickBestTitle()` — when a caller passes a JSON-stringified blueprint as `sourceTitle` or `sourceSummary`, `pickBestTitle()` returns it verbatim, and `boundedTitle()` downstream only clamps to 160 chars without a shape check.

4. **The GenEngine SPEC (line 321) explicitly endorses a cron-drain as the first-ship lane**: "Fallback path (lighter first-ship lane): `render_jobs` table plus a worker loop. Sufficient for HTML/PDF initially, but not ergonomic enough for multi-step durable export recovery. Upgrade to Temporal when audio and spatial ship."

5. **Stalled Vercel auto-deploys traced to GitHub→Vercel team-invite wall.** Three Vercel status checks (gestaltview, gestaltview-digital-intelligence, gestaltview-v2-0) all FAILURE on this PR with a `targetUrl` redirecting to `vercel.com/teams/invite`. The auto-deploy gap since 2026-06-02 is likely the same auth wall blocking commits from accounts not added to the Vercel team.

## What was shipped (this session)

**Already executed:**

- ✅ `CODEX_EXPORT_BUCKET=codex-exports` set on Vercel production + preview (byte-verified)
- ✅ Storage bucket `codex-exports` exists (Keith created earlier)

**PR #74 opened (feat/gen-engine-end-to-end-2026-06-09):**

- ✅ New file: `api/cron/codex-drain.ts` — every 2 minutes, drains up to 5 pending jobs via `runCodexExportJob()`, bounded by 50s, Vercel-cron-header restricted in production
- ✅ `vercel.json`: register the cron + functions config
- ✅ `shared/gen-engine/core.ts`: `isLikelyJsonObject()` guard added to `pickBestTitle()` and `pickBestSummary()` candidate chain; existing callers passing plain strings unaffected; trailing fallback (`"Untitled artifact"` / synthesized default) preserves a non-empty result

## Operational reality

- PR #74 is `MERGEABLE: true`. Three Vercel status checks show FAILURE due to the team-invite wall (NOT due to build problems — those checks never ran the build). Merge can proceed if branch protection does not require Vercel checks.
- **Production won't see any of this until the Vercel auto-deploy is unstuck OR a manual `vercel --prod` is run from a Codespace.** The PR work itself is independent of that unstick.
- The 11 existing poisoned `codex_artifacts` rows are intentionally left in place; they will be cleaned up after a fresh forge call verifies the title fix in production.

## Open / Next

🔴 **Vercel auto-deploy unstick** — the team-invite wall blocks every commit that isn't authored by a Vercel team member. Either (a) accept the invite for the relevant commit identities OR (b) only commit from accounts already in the team. This is now visible as the root cause of the May 31 → present production-deploy gap.

🟡 **Bridge `codex_artifacts` → DIW display surface** — DIW currently reads from `inner_world_artifacts` (5 rows with `html` text columns), but the Codex pipeline writes to `codex_artifacts` (with `body` jsonb + `exports` jsonb). Either (a) hook `runCodexExportJob` to INSERT a mirror row into `inner_world_artifacts` on `status='ready'`, OR (b) migrate DIW to read directly from `codex_artifacts.exports[].storagePath`. Option (b) is structurally cleaner.

🟡 **Cleanup of 11 poisoned `codex_artifacts` rows** — after PR #74 merges, deploys, and a fresh forge call lands a clean row, run `DELETE FROM codex_artifacts WHERE title LIKE '{%' OR title LIKE '[%'` plus the cascade on `codex_jobs`.

🟡 **Reconcile 10 artifact tables down to 1–2** — `_deprecated_artifacts`, `artifacts`, `created_artifacts`, `agent_code_artifacts`, `artifact_provenance_envelopes`, `deployment_artifacts`, `gate_artifacts` are mostly empty or pre-Codex; the canonical surface should be `codex_artifacts` only (display surfaces re-read from there).

---

---

# CurrentState — Preserve raw signal (Creation Corner blueprint handoff + Preserve-Voice enforcement)

**Last updated:** 2026-06-09 (afternoon session)
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Second pass of the day, immediately after PR #74 merged. Keith reviewed a downloaded `Untitled-artifact.md` (538 KB) from Creation Corner and flagged: _"The draft carries flattening language; preserve the raw signal more closely."_ This entry records the three structural failures behind that draft and the PR #75 that addresses them.

## What was found

The downloaded artifact was generated end-to-end through `/api/codex/forge` (`image · codex-forge · PLK 90% · 2491ms`) — confirming PR #74's title-poisoning fix is now landed on `main`. But three other failures combined to produce the flattening:

1. **`CreationCornerPage.tsx:327`** — `JSON.stringify(selectedBlueprint)` when freeText was empty. Serialized the entire `CaptureBlueprint` object (including `blueprint.summary` which itself contained a stringified Blackboard message join with Billy's preamble) into a single `textInput` of 538 KB.

2. **`/api/gen-engine/artifacts` and `/api/gen-engine/resonance` returned non-OK** — client fell back to local synthesis. Two warnings printed in the UI: _"Used local synthesis fallback because the gen-engine API was unavailable."_ This is the same June 8 CurrentState 🔴 Critical item: _"Creation Corner — LLM routing unverified."_ Still unverified — the local fallback never calls Groq or HuggingFace.

3. **`renderMarkdownArtifact` in `shared/gen-engine/core.ts`** — no Preserve-Voice enforcement and no anti-sycophancy strip pass. With `synthesisStyle: "divergent"` (Expand: _"Elaborate what's implied"_), the local fallback amplified the JSON-dump source with template-shaped output. Result: 52 occurrences of "Beautiful", 13 of "holding space", 13 of "that must", 12 of "It's nice to" in a single 538 KB draft.

## What was shipped (PR #75 — open)

[`fix/preserve-raw-signal-2026-06-09`](../tree/fix/preserve-raw-signal-2026-06-09):

- `client/src/pages/CreationCornerPage.tsx` — replace `JSON.stringify(selectedBlueprint)` with `selectedBlueprint.outputs.markdown` (the human-shaped doc that `buildBlueprintFromCaptures` already assembles in `Scaffold.tsx`).

- `shared/gen-engine/core.ts` — new `renderFaithfulArtifact()` path emits quote-only structure when `synthesisStyle === "faithful"` (UI: "Preserve Voice — Stay exactly in your register") OR `preserveExactLanguage === true`.

- `shared/gen-engine/core.ts` — new `stripEmbellishment()` pass scrubs `input.summary` and `input.userInstructions` in the non-faithful path. Anchored to CONTEXT.md anti-sycophancy rule: _"If a response flatters, overconfirms, prematurely elevates, or adopts the user's frame without sufficient grounding, that is a system failure."_ Pattern list is intentionally narrow. Source material is preserved verbatim — only agent-authored interpretive fields are stripped.

- `api/__tests__/preserve-raw-signal.test.ts` — 4 vitest cases covering faithful path and strip pass.

## Open / Next

🔴 **Gen-engine API LLM routing still unverified** — the local fallback path is now well-defended, but the actual `/api/gen-engine/artifacts` and `/api/gen-engine/resonance` routes are returning non-OK. Need to (a) check whether they're reaching production at all (likely not, given the May 31 production deploy still in place), and (b) verify the Groq → HuggingFace provider cascade once they do reach production.

🟡 **Billy's session preamble still enters the source material** — `summarizeMessages()` in `BlackboardRoomPage.tsx` joins every message including Billy's opening turns ("It's nice to have some company", "I've been sitting here, surrounded by the architecture of GestaltView", "What brings you here today 🌞"). The strip pass in PR #75 catches these phrases when they appear in the agent-authored summary, but they STILL appear in the verbatim source material. The cleanest fix is to filter Billy's session-scaffolding turns out of `summarizeMessages` before they reach `blueprint.summary`. Not in this PR — would be a follow-up.

🔴 **Vercel auto-deploy still stalled** — last production deploy May 31. PR #74 merged but has not deployed. PR #75 has not deployed. The team-invite wall surfaced earlier today is still the root cause. Until this is unstuck, no fixes shipped today reach users.

🟡 **11 poisoned codex_artifacts cleanup** — once PR #74 reaches production and a fresh clean forge call lands, run the planned `DELETE FROM codex_artifacts WHERE title LIKE '{%' OR title LIKE '[%'` cascade.

---

---

# CurrentState — SPEC Draft: Open Items Convergence Plan

**Last updated:** 2026-06-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Drafted a SPEC from the currently open `CurrentState.md` items. No code changes, migrations, production deploys, or live API validation were performed in this pass. This SPEC is a planning surface only; it should be converted into implementation slices after the Vercel deployment wall and gen-engine routing status are confirmed.

---

## SPEC: Open Items Convergence Plan

### Problem statement

GestaltView has several high-value surfaces that are close to functional but blocked by a small number of infrastructure, routing, and UX continuity gaps. The top risk is that demo-visible flows can appear visually complete while still falling back locally, failing to deploy, or carrying polluted source material into generated artifacts.

This SPEC groups the active open items into implementable slices so the next sessions can move from broad triage to verifiable closure.

### Goals

- Restore a trustworthy production deploy path so merged fixes actually reach users.
- Verify Creation Corner and gen-engine generation routes end-to-end through the intended provider cascade.
- Protect user-authored language from flattening, Billy preamble leakage, and canned therapeutic response loops.
- Make rendered Codex artifacts available to Dynamic Inner World through one canonical artifact surface.
- Preserve the user journey across Blackboard Room, Agent Council, Creation Corner, and artifact export.
- Separate repo-actionable items from business or external items so engineering sessions do not carry ambiguous backlog.

### Non-goals

- Do not redesign the full product architecture in this pass.
- Do not collapse artifact tables until the live display/read path is selected and verified.
- Do not delete existing poisoned `codex_artifacts` rows until a fresh clean production forge call has been observed.
- Do not claim Groq/HuggingFace routing is live until production or preview API traces prove it.

---

## Workstream A — Production Deploy Unblock

### Current state

- Vercel auto-deploys are still stalled behind a GitHub-to-Vercel team-invite wall.
- Last production deploy is recorded as May 31 in the June 9 entries.
- PR #74 merged but had not reached production when recorded.
- PR #75 was open when recorded and also had not reached production.

### Requirements

- Identify which GitHub commit identities are accepted by the Vercel team.
- Accept the relevant Vercel team invite or commit/deploy from an identity already on the team.
- Confirm a fresh Vercel production deployment from `main`.
- Record the exact deploy URL, commit SHA, and deploy timestamp in this file.

### Acceptance criteria

- A new production deployment exists after 2026-06-09 and includes PR #74 plus any merged preserve-voice follow-up.
- Vercel status checks no longer redirect to `vercel.com/teams/invite`.
- CurrentState includes the exact deploy identifier and validation command or dashboard evidence used.

### Open questions

- Which GitHub identity is currently connected to the Vercel project team?
- Is branch protection requiring Vercel checks, or can merges proceed while deploy checks fail?
- Should the next unblock be team-invite acceptance or a manual `vercel --prod` from Codespace?

---

## Workstream B — Creation Corner / Gen-Engine Routing Verification

### Current state

- Creation Corner can render locally, but `/api/gen-engine/artifacts` and `/api/gen-engine/resonance` returned non-OK in the June 9 preserve-voice pass.
- Local fallback is now expected to be safer after the preserve-raw-signal work, but the real LLM route remains unverified.
- The intended provider order remains Groq first, then HuggingFace free tier.

### Requirements

- Exercise `/api/gen-engine/artifacts` and `/api/gen-engine/resonance` in the deployed environment.
- Confirm whether failures are deploy reachability, missing env vars, provider failures, request-shape issues, or auth/CORS issues.
- Add minimal observability if current logs cannot distinguish provider path from fallback path.
- Verify that Creation Corner UI clearly distinguishes true LLM generation from local fallback.

### Acceptance criteria

- A test forge/generation call reaches the deployed API and records whether Groq or HuggingFace handled the response.
- Non-OK API responses have a concrete root cause and fix plan.
- Local fallback still works but is visibly marked as fallback in the UI.
- CurrentState records exact request path, environment, result, and provider evidence.

### Open questions

- Are the gen-engine routes included in the current production deployment bundle?
- Are Groq and HuggingFace env vars present in production and preview?
- Should fallback be allowed silently in founder demos, or should it require an explicit warning state?

---

## Workstream C — Preserve Raw Signal / Anti-Flattening

### Current state

- `CreationCornerPage.tsx` was recorded as passing a stringified `CaptureBlueprint` when freeText was empty.
- Local synthesis amplified template-shaped language when Preserve Voice was expected.
- Billy session scaffolding can still enter source material through `summarizeMessages()` in `BlackboardRoomPage.tsx`.

### Requirements

- Ensure Creation Corner sends human-authored markdown or explicit freeText, not serialized blueprint JSON.
- Filter Billy opening/session-scaffolding turns out of Blackboard summaries before they become source material.
- Keep agent-authored summary cleanup separate from verbatim source preservation.
- Add tests for faithful mode, embellishment stripping, and preamble exclusion.

### Acceptance criteria

- New artifacts no longer contain JSON-shaped blueprint dumps as user source material.
- Billy phrases such as opening companionship/preamble text are excluded from generated source summaries unless the user explicitly quoted them.
- Preserve Voice mode produces quote-faithful structure without interpretive inflation.
- Tests cover both the faithful path and the non-faithful strip pass.

### Open questions

- Which Billy message types count as session scaffolding versus substantive assistant content?
- Should preamble filtering happen only in Blackboard summaries or in a shared capture-normalization layer?
- Should users be able to inspect the exact captured source before forging?

---

## Workstream D — Codex Artifacts → Dynamic Inner World

### Current state

- Codex pipeline writes to `codex_artifacts` with `body` jsonb and `exports` jsonb.
- Dynamic Inner World currently reads from `inner_world_artifacts` with `html` text.
- Existing `codex_artifacts` rows include poisoned JSON-stringified titles and should not be cleaned until a clean production forge is confirmed.

### Requirements

- Choose the canonical read path for Dynamic Inner World:
  - Option A: mirror ready Codex exports into `inner_world_artifacts`.
  - Option B: migrate DIW to read directly from `codex_artifacts.exports[].storagePath`.
- Ensure `runCodexExportJob()` makes rendered HTML discoverable by the chosen display surface.
- Clean poisoned `codex_artifacts` rows only after a successful clean production forge.
- Reconcile the larger artifact table set after the canonical path is proven.

### Acceptance criteria

- A new Creation Corner/Codex artifact renders to storage and appears in Dynamic Inner World.
- The displayed artifact has a clean title, clean summary, and valid rendered HTML path.
- The cleanup SQL for poisoned rows is run only after a verified clean replacement row exists.
- CurrentState records the selected DIW integration option and why.

### Open questions

- Is direct `codex_artifacts` consumption acceptable for DIW, or does DIW still need a room-specific projection table?
- What cascade deletes are required when removing poisoned rows and associated jobs?
- Which artifact tables are still actively read by UI routes?

---

## Workstream E — Blackboard / Council Continuity

### Current state

- Blackboard Room needs an embodiment profile dropdown and a portal button to Agent Council Page.
- Agent Council needs a canned-response circuit breaker for therapist-script validation openers.
- Session recap should roll forward into Creation Corner as a blueprint seed.

### Requirements

- Add profile switching inside Blackboard without forcing users to leave the room.
- Add a clear Agent Council portal action from Blackboard.
- Intercept canned or therapeutic boilerplate before council output reaches the UI.
- Add a recap-to-blueprint handoff path from Blackboard/Council sessions into Creation Corner.

### Acceptance criteria

- A user can switch embodiment profile from Blackboard and see the active profile reflected in subsequent context.
- A user can open Agent Council from Blackboard through an explicit button.
- Canned council responses trigger retry, rewrite, or block behavior before display.
- A saved recap can seed Creation Corner without manual copy/paste.

### Open questions

- Where is the canonical embodiment profile state stored today?
- Should the canned-response guard live in the LLM routing layer, the council orchestrator, or a shared response-quality gate?
- Should session recap rollforward create a `CaptureBlueprint`, a Codex job, or an intermediate saved capture?

---

## Workstream F — Voice Input and Demo-Visible Polish

### Current state

- Voice-to-text is expected across major pages but the browser-default adapter is recorded as broken.
- Desired adapter should reuse the Billy voice infrastructure.
- Demo-visible polish requests include ACP neon embers, homepage dynamic hero/tagline, and Sanctuary warmth/personalization.

### Requirements

- Inventory current speech and Billy voice modules before adding a new adapter.
- Define one shared voice input interface consumed by Journal, Blackboard, Creation Corner, and Universal Capture.
- Prioritize polish only after deploy and generation routing blockers are closed, unless a demo deadline requires otherwise.

### Acceptance criteria

- Voice input works consistently on at least Journal, Blackboard, Creation Corner, and Universal Capture.
- The implementation does not depend on broken browser-default speech behavior.
- Visual polish changes preserve the established GestaltView visual language and do not mask functional failures.

### Open questions

- Does the Billy voice infrastructure currently support speech-to-text, or only text-to-speech/spoken runtime?
- Which pages are mandatory for the first shared adapter rollout?
- Is the willow tree asset already in the repository, and what license/provenance should be recorded?

---

## Proposed Implementation Order

1. **Unblock deployment:** Vercel team identity/invite, fresh production deploy, record exact evidence.
2. **Verify gen-engine routing:** deployed `/api/gen-engine/*` requests, provider evidence, fallback visibility.
3. **Finish preserve-signal cleanup:** Billy preamble filtering, capture-source inspection, tests.
4. **Connect Codex artifacts to DIW:** choose direct read vs mirror projection, then verify rendered artifact display.
5. **Clean poisoned artifact rows:** only after a clean production forge and display pass.
6. **Blackboard/Council continuity:** profile dropdown, ACP portal, canned-response gate, recap rollforward.
7. **Shared voice input adapter:** inventory Billy voice capabilities first, then implement cross-page adapter.
8. **Demo polish:** ACP embers, homepage hero/tagline, Sanctuary warmth/personalization.

## Repo-actionable vs External

### Repo-actionable

- Vercel deploy configuration and deploy validation.
- Gen-engine route debugging and provider verification.
- Creation Corner source shaping and Preserve Voice enforcement.
- Blackboard summary filtering.
- Codex artifact rendering, storage, and DIW display integration.
- Blackboard/Council UX continuity.
- Shared voice input adapter.
- Page-level visual polish.

### External / business track

- Indiegogo campaign launch status.
- Perplexity Pro and ChatGPT Plus subscription renewal.
- Doug Lessing / VC list outreach.

These external items should remain visible for founder operations but should not be treated as engineering blockers unless they affect access to required tools or live validation.

---

---

# CurrentState — Open Items Gap Closure Pass (fallback copy, council guard, DIW bridge, gen-engine diagnostics)

**Last updated:** 2026-06-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Keith confirmed the Vercel deploy path is fine and asked to close the open SPEC gaps. This pass implemented the repo-local closures that can be verified without live production credentials: fallback copy removal, council canned-response blocking, Blackboard preamble filtering, gen-engine diagnostics, Codex HTML export mirroring into Dynamic Inner World, and test-run hygiene.

## What changed

- **Removed the grating therapeutic fallback phrase from runtime output.**
  - `api/_lib/llmRouter.ts` no longer emits the old validation opener or the old "keep weaving" fallback.
  - New offline fallback copy is operational: `Local fallback is active...`
  - `shared/embodiment/chat.ts`, `.agents/skills/*/references/llmRouter.ts`, `shared/billy/runtime.ts`, `shared/embodiment/generated.ts`, `docs/wikis/Insight-Bot-wiki-v1.md`, and `docs/CurrentState.md` were scrubbed so the old literal phrase does not keep resurfacing as copied guidance.
  - Verification grep returned no matches for the old phrase or old fallback wording across `api`, `shared`, `client`, `docs`, and `.agents`.

- **Agent Council now uses the existing PersonaATC circuit breaker.**
  - `client/src/lib/PersonaATC.ts` now flags the new neutral local fallback, the old validation opener pattern, and related generic assistant fallback phrases.
  - `client/src/pages/AgentCouncilPage.tsx` blocks canned fallback responses before they are written into the council transcript and records persona success/failure health.
  - The blocked transcript copy is explicit: provider route/fallback problem, not valid council output.

- **Blackboard summaries now filter session scaffolding before Creation Corner handoff.**
  - `client/src/pages/BlackboardRoomPage.tsx` now excludes known Billy session scaffolding/offline fallback lines from `summarizeMessages()` and `buildSummaryBlueprint()`.
  - This protects Creation Corner source material from Billy preamble/offline fallback leakage while preserving user-authored turns and substantive DI turns.

- **Gen-engine routes now return verification diagnostics.**
  - `api/gen-engine/artifacts.ts` now returns `provider`, `fallbackUsed`, and a `diagnostics` object showing route, provider, LLM synthesis status, Codex bridge status, and warning count.
  - `api/gen-engine/resonance.ts` now returns diagnostics identifying the local resonance scorer.
  - Live provider verification still requires a deployed API call with real env vars, but the response shape now exposes the evidence needed.

- **Codex HTML exports now bridge to Dynamic Inner World.**
  - `workers/codex/runner.ts` mirrors ready HTML exports into `inner_world_artifacts` when Supabase is configured and the artifact has a real user ID.
  - `api/codex/jobs/[jobId]/run.ts` now returns `innerWorldMirrored`.
  - Anonymous/test artifacts still use memory/local behavior and skip the Supabase mirror.

- **Vitest no longer sweeps the `.perplexity` copied snapshot tree.**
  - `vitest.config.ts` now excludes `.perplexity/**`.
  - This avoids duplicate stale tests failing on missing copied `instrument.js` files unrelated to this repo's active runtime.

## Validation performed

- Strict grep across `api`, `shared`, `client`, `docs`, and `.agents` for the removed validation opener plus the old fallback wording.
  - Result: no matches.
- `npx vitest run api/__tests__/llmRouter.test.ts api/__tests__/gen-engine.test.ts api/__tests__/preserve-raw-signal.test.ts api/__tests__/codex-export-runner.test.ts`
  - Result: 4 files passed, 25 tests passed.
- `npx tsc --noEmit`
  - Result: passed.

## Still requires live verification

- Confirm `/api/gen-engine/artifacts` on Vercel returns `provider` as Groq or HuggingFace rather than `local-template`.
- Confirm `/api/gen-engine/resonance` reaches Vercel and returns `diagnostics.provider = "local-resonance-scorer"`.
- Run a real user Codex HTML export and verify `innerWorldMirrored: true`, then confirm the artifact appears in Dynamic Inner World.
- Only after a clean production forge + DIW display pass, run the planned poisoned `codex_artifacts` cleanup.

---

---

# CurrentState — Perplexity collaboration mirror sync automation

**Last updated:** 2026-06-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added a repo-local sync workflow so `.perplexity/` outside-collaboration artifacts stay aligned with canonical repo state without manual copying.

## What changed

- Added `scripts/sync-perplexity-collaboration.mjs`.
  - Regenerates `docs/gestaltview-v2.manifest.json` and `docs/gestaltview-v2.manifest.md` unless `--skip-generate` or `--check` is passed.
  - Copies canonical repo-state files into `.perplexity/`.
  - Updates collaboration-packet copies under `.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/`.
  - Writes `.perplexity/SYNC_MANIFEST.json` with source/target hashes.
  - Leaves `.perplexity/MANIFEST.json` alone because that file describes the Perplexity collaboration package itself, not the generated repo manifest.
- Added package scripts:
  - `npm run sync:perplexity`
  - `npm run sync:perplexity:check`
- Updated `docs/Workflows.md` with the Perplexity collaboration mirror workflow.
- Updated `vitest.config.ts` earlier in this session to exclude `.perplexity/**` from active test runs, because `.perplexity` is a collaboration mirror/snapshot surface, not the runtime test source of truth.

## Synced canonical artifacts

- `docs/CurrentState.md`
- `docs/gestaltview-v2.manifest.json`
- `docs/gestaltview-v2.manifest.md`
- `docs/ContinuityStack.md`
- `docs/SessionHandoffPacket.md`
- `docs/Workflows.md`
- `docs/README-manifest.md`
- `README.md`
- `.agents/skills/CurrentState.md`
- `.agents/skills/manifest.json`

## Validation performed

- `npm run sync:perplexity`
  - Result: regenerated canonical manifests and synced collaboration artifacts into `.perplexity/`.
- `npm run sync:perplexity:check`
  - Result before this CurrentState entry: passed.

## Follow-up

- After any future CurrentState, workflow, manifest, README, or skills-manifest change, run `npm run sync:perplexity`.
- Use `npm run sync:perplexity:check` before handoff or CI to detect stale `.perplexity` mirrors.

---

---

# CurrentState — Transcriptory MVP foundation

**Last updated:** 2026-06-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Began implementation of `specs/root/SPEC_Transcriptory_And_UX_Pass_6_9_26.md`, Slice A. This pass lands the route/page shell, recorder/upload UI foundation, Supabase schema, API contracts, nav integration, and tests. Full provider transcription and cross-room handoff automation remain follow-up slices.

## What changed

- Added `/transcriptory` route in `client/src/App.tsx`.
- Added Transcriptory to the runtime nav in `client/src/components/TopNav.tsx`.
- Added `client/src/pages/TranscriptoryPage.tsx`.
  - Hero and library layout.
  - Upload audio action.
  - In-app recording panel using `MediaRecorder`.
  - Searchable transcript library.
  - Transcript viewer with copy/download actions and Blackboard/Creation Corner navigation links.
  - Explicitly states browser `SpeechRecognition` is not used.
- Added components:
  - `client/src/components/TranscriptoryRecorder.tsx`
  - `client/src/components/TranscriptCard.tsx`
  - `client/src/components/TranscriptViewer.tsx`
- Added client helper:
  - `client/src/lib/transcriptory.ts`
- Added API foundation:
  - `api/_lib/transcriptory.ts`
  - `api/transcriptory/captures.ts`
  - `api/transcriptory/transcribe.ts`
- Added Supabase migration:
  - `supabase/migrations/20260609000100_transcriptory_captures.sql`
  - Creates `public.transcriptory_captures`.
  - Enables RLS.
  - Adds user-owned policy.
  - Adds user/status and user/created indexes.
  - Adds updated-at trigger.
- Added tests:
  - `api/__tests__/transcriptory.test.ts`

## Current behavior

- Authenticated users can list and create Transcriptory capture records through `/api/transcriptory/captures`.
- Unauthenticated users can interact with the page locally, but persistence requires sign-in.
- Upload/record actions create pending capture cards.
- The server transcription endpoint refuses to fall back to browser speech recognition.
- If a server provider env is detected, the endpoint still returns `transcription_adapter_not_wired`; this is intentional for the foundation slice because adapter execution is the next implementation step.

## Validation performed

- First ran `npx vitest run api/__tests__/transcriptory.test.ts` before implementation.
  - Result: failed because `api/transcriptory/captures` and `api/transcriptory/transcribe` did not exist.
- After implementation:
  - `npx vitest run api/__tests__/transcriptory.test.ts`
  - Result: 1 file passed, 4 tests passed.
- `npx tsc --noEmit`
  - Result: passed.
- `npm run build`
  - Result: passed; Vite built `TranscriptoryPage` chunk successfully.

## Still open

- Wire the confirmed Billy transcription adapter path.
- Implement actual audio upload to Supabase Storage bucket `transcriptory_audio`.
- Implement provider transcription cascade: Billy adapter -> Groq Whisper -> HuggingFace Whisper.
- Generate summaries/themes asynchronously after transcript completion.
- Add cross-room payload injection instead of simple navigation links for "Send to Blackboard" and "Send to Creation Corner".
- Apply the migration in the live Supabase environment and verify RLS.

---

---

# CurrentState — June 8 voice memo triage and UX roadmap intake

**Last updated:** 2026-06-08
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Captured and triaged two voice memos recorded overnight (Sunday June 7 → Monday June 8). No code was written this pass. This entry records the full backlog of UX, integration, and visual polish items surfaced in those memos so they can be pulled into discrete slices.

---

## Context

Keith was incapacitated most of Sunday with a migraine. Both memos were recorded during late-night/early-morning walks. Perplexity Pro and ChatGPT Plus subscriptions lapsed and are pending renewal around midnight tonight (June 8). The Indiegogo campaign was a target launch for this morning.

---

## Open items surfaced — ranked by urgency

### 🔴 Critical / Blocking

**1. Creation Corner — LLM routing unverified**

- Status: Rendering may appear to work visually but LLM integration path is unconfirmed.
- Required: Verify generation calls route through **Groq first → HuggingFace free tier second**.
- Files in scope: `client/src/pages/CreationCornerPage.tsx`, `api/codex/*`, `api/gen-engine/*`

**2. Musical DNA — Spotify URI env var gap**

- Status: Spotify Dev API dashboard is configured correctly. The Vercel env var binding is the gap.
- Required: Confirm the exact variable name (`VITE_SPOTIFY_REDIRECT_URI` per the May 19 pass) is set in Vercel and matches the registered callback URI.
- Reference: See `CurrentState — MusicalDNA env normalization` (2026-05-19)

---

### 🟡 High Priority / Next Slices

**3. Blackboard Room — embodiment profile dropdown + ACP portal button**

- Redundancy exists between Blackboard Room and Agent Council Page.
- Fix: Add an **embodiment profile dropdown** directly in the Blackboard Room so users can switch profiles without leaving.
- Fix: Add a **button in the Blackboard Room** that opens the Agent Council Page portal.
- Files in scope: `client/src/pages/BlackboardRoomPage.tsx`

**4. Agent Council — canned response circuit breaker**

- Therapist-script validation openers and similar therapeutic-sounding canned responses must be eliminated from council output.
- Fix: Implement a **circuit breaker** or **AI orchestrator/air traffic controller** layer that intercepts canned responses before they reach the UI and forces a live retry.
- Applies to: Digital Intelligence Council multi-agent orchestration layer

**5. Session recap → Creation Corner rollforward**

- Desired workflow: End of council/blackboard session → generate recap → save → auto-roll into Creation Corner as a blueprint seed.
- This is a new workflow loop not yet wired.
- Files in scope: `client/src/pages/BlackboardRoomPage.tsx`, `client/src/pages/CreationCornerPage.tsx`, session recap generation logic

---

### 🟠 Polish / Scheduled Slices

**6. Agent Council Page — neon floating embers**

- Add electric neon floating embers to the ACP visual atmosphere.
- Pattern: Matches ember style used elsewhere in the platform.

**7. Homepage — dynamic hero animation + tagline**

- Current cards are flat and lack visual energy.
- Add: **Dynamic hero animation**
- Add tagline under hero: _"You don't have to know where you're going. Just know you're not alone in getting there"_
- Tagline styling: Soft cursive script, subtle traveling gradient, not too compact.
- Files in scope: `client/src/pages/Home.tsx`

**8. Sanctuary Page — warmth and personalization**

- Current page reads as too clinical/sterile.
- Add: Glowing willow tree graphic (NotebookLM-generated asset, available and ready).
- Add: User-personalizable ember colors and dynamic backgrounds.
- Files in scope: `client/src/pages/SanctuaryPage.tsx`

**9. Voice-to-text — all pages, custom adapter**

- Voice-to-text is mandatory on every page (journal, blackboard, creation corner, etc.).
- Current speech-to-text adapter uses the browser default → broken.
- Fix: Build a custom adapter using the **Billy voice** infrastructure already in the codebase. Bypass browser default entirely.
- Files in scope: `client/src/lib/` speech adapter, `client/src/components/JournalEditor.tsx`, `client/src/components/capture/UniversalCaptureBar.tsx`

---

### ⚪ Pending / External

**10. Indiegogo campaign**

- Was targeted for launch this morning (June 8).
- Status: Unknown — not tracked in repo.

**11. Perplexity Pro + ChatGPT Plus subscriptions**

- Lapsed. Renewal expected by midnight tonight (June 8).
- No repo action required.

**12. Doug Lessing / VC list outreach**

- GestaltView is significantly more developed than when Doug ghosted ~1 year ago.
- Founders Network nomination from Doug Lessing is still a valid warm lead.
- Pepperdine Most Fundable Companies quarterfinalist status is a credentialing stamp.
- Action: Revisit Doug and the broader VC list now that the product has substantially matured.
- No repo action required — business/fundraising track.

---

## Build state as of this entry

- Last confirmed clean build: commit `446904b` (2026-06-04), Vercel deployment triggered but build confirmation was pending at that time.
- No new commits this pass.
- No migrations applied this pass.

---

## Next slice options

1. **Verify Creation Corner LLM routing** — confirm Groq/HuggingFace path is live, not just visually rendering.
2. **Fix Musical DNA Spotify URI** — check Vercel env against Spotify dev dashboard.
3. **Blackboard Room embodiment dropdown + ACP button** — redundancy fix.
4. **Council canned response circuit breaker** — eliminate therapist-script validation openers from council output.
5. **Homepage dynamic hero + tagline** — quick visual uplift with high founder-demo value.

## 2026-06-07 — Council route confirmed, Creation Corner render gap closed

Verified the live Council implementation file as `client/src/pages/AgentCouncilPage.tsx` and confirmed the canonical runtime route is `/agent-council`, with `/module/agent-council` preserved as an alias. `PAGE_SEO.agentCouncil` is registered, so the page is wired for route + SEO and no longer provisional.

Creation Corner renders are now confirmed good and the prior render-gap/open JSON passthrough concern is resolved. Remove the old “Creation Corner render gap” item from open issues.

Open carry-forward:

- Persona dropdown audit remains open
- SymbioCoder/VibeCoder metadata still not surfaced in UI
- 11-module extraction pipeline still pending
- Profile progress visualization still pending

**Last updated:** 2026-06-06
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Wired SymbioCoder and VibeCoder end-to-end into the live Billy response pipeline, added Resume Rockstar API routes (Groq + HuggingFace), established the Council Page, applied the Codex artifacts SQL migration, and confirmed a clean Vercel build.

## Executive summary

- Added `shared/modules/symbioCoder` and API route: `analyzeSymbio()` runs on every raw message **before** `routeLlm`; its `systemPromptFragment` is injected into the LLM system prompt and `userPromptFragment` is prepended to the user message when non-empty. All additions non-fatal (try/catch wrapped).
- Added `shared/modules/vibeCoder` and API route: `calculateVibeScore(rawMessage, result.response)` runs **post-LLM**; both `symbioCoder` and `vibeCoder` surface in Billy response metadata.
- Wiring commit [`b9fd090`](https://github.com/DigitalConsciousness/gestaltview-v2.0/commit/b9fd09085390fcabc2a7e157ec89cd6b079d4327) explicitly preserves zero changes to retrieval, RRF, gravity, or memory pipelines — additive only.
- Added Resume Rockstar API routes: `analyze`, `enhance`, and `score-section`, backed by both Groq and HuggingFace calls. Route aliases `/workspace/modules/resume-rockstar` registered in `client/src/App.tsx` from SPEC-2.
- Council Page established (exact route/surface TBD — confirm in next session if route alias or dedicated page).
- Applied `20260602000100_codex_artifacts.sql` to the Supabase-backed environment; storage/job visibility against real auth users confirmed.
- Vercel build on commit [`b9fd090`](https://github.com/DigitalConsciousness/gestaltview-v2.0/commit/b9fd09085390fcabc2a7e157ec89cd6b079d4327) verified clean.

## Build history for this pass

| Commit                                                                                                                | Result      | Notes                                                        |
| --------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| [`61344d1`](https://github.com/DigitalConsciousness/gestaltview-v2.0/commit/61344d174ec0c507f4ee85abc4985df42be07585) | SHIPPED     | symbioCoder shared module + API route                        |
| [`cae5ad3`](https://github.com/DigitalConsciousness/gestaltview-v2.0/commit/cae5ad3fef5a3be64ce2cb37ee03a975dfb233ef) | SHIPPED     | vibeCoder shared module + API route                          |
| [`b5302b4`](https://github.com/DigitalConsciousness/gestaltview-v2.0/commit/b5302b4b39808036ff000715c6550098f8e7a4cd) | SHIPPED     | resume-rockstar API routes: analyze, enhance, score-section  |
| [`36e2e58`](https://github.com/DigitalConsciousness/gestaltview-v2.0/commit/36e2e5800837e7591a28524371daae96fc94b57b) | SHIPPED     | resumeRockstar route with Groq + HuggingFace calls           |
| [`b9fd090`](https://github.com/DigitalConsciousness/gestaltview-v2.0/commit/b9fd09085390fcabc2a7e157ec89cd6b079d4327) | VERIFIED ✅ | SymbioCoder + VibeCoder wired end-to-end into Billy pipeline |

## Validation performed

- Vercel build confirmed clean on `b9fd090`
- `20260602000100_codex_artifacts.sql` applied to Supabase-backed environment — confirmed
- Council Page established

## Where we left off

- SymbioCoder and VibeCoder are now live modifiers on every Billy call, but their output in the response metadata has not yet been surfaced visually anywhere in the UI. The data is there; consumption is the next step.
- Resume Rockstar API routes are live; the client-side module page and UX flow at `/workspace/modules/resume-rockstar` may still need render/integration QA.
- Creation Corner artifact rendering gap (synthesize flow returning JSON input shape rather than a fully rendered artifact) was flagged in the June 4 entry — **not yet confirmed resolved**. Needs a QA pass.
- Persona dropdown audit from June 4 (remove `Gatekeeper`, `Repo Scribe`, `Founder Sample`; rename `Repo Scribe` → `Philosopher`) — **not yet confirmed executed**.
- Council Page route/surface details not fully documented — confirm canonical route name and registration in next session.

## Next slice

1. QA the Creation Corner artifact render path — confirm synthesize flow returns a rendered artifact, not raw JSON.
2. Persona dropdown audit: remove Gatekeeper, Repo Scribe, Founder Sample from user-facing selectors; rename Repo Scribe → Philosopher; audit Blackboard Room DI selector.
3. Surface SymbioCoder + VibeCoder metadata in the UI — even a subtle indicator on the Billy response bubble would close the loop on tonight's wiring.
4. QA Resume Rockstar end-to-end at `/workspace/modules/resume-rockstar` — confirm Groq + HuggingFace responses render correctly in the client.
5. Document Council Page canonical route and confirm it appears in `client/src/App.tsx` route table.
6. Session recap → active 11-module extraction pipeline (orbs auto-created from Blackboard session end, no manual selection required) — still pending implementation confirmation.
7. Profile progress visualization: dynamic fill indicators on Profile page showing 11-module accumulation in real time — still pending.

---

---

# CurrentState — June 4 build stabilization and gen-engine TypeScript repair slice

**Last updated:** 2026-06-04
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Repaired TypeScript errors introduced in the gen-engine API layer that were blocking Vercel deployment (build exit on commit `100094d`), patched `codexBridge.ts` to re-export from the canonical `api/_lib/codexBridge` stub, and pushed commit `446904b` to unblock the deployment pipeline.

## Executive summary

- Fixed `api/gen-engine/artifacts.ts` and `api/gen-engine/export.ts`: method field changed from string `'POST'` to string array `['POST']` to match the `prepareJsonRoute` signature.
- Fixed `api/gen-engine/artifact.ts`: removed manual CORS/method guard and replaced with `prepareJsonRoute(['GET'])` to match the 2-3 argument signature correctly.
- Fixed `server/lib/codexBridge.ts`: replaced broken implementation that referenced non-existent `.insert()` QueryBuilder methods and non-existent `reviewRecommended` field on `GeneratedArtifact` with a clean re-export stub pointing at `api/_lib/codexBridge`.
- Commit `446904b` pushed to `main` — Vercel deployment triggered. Build confirmation pending as of 2026-06-04 14:20 EDT.

## Build history for this pass

| Commit    | Result  | Notes                                                        |
| --------- | ------- | ------------------------------------------------------------ |
| `100094d` | FAILED  | 5 TypeScript errors across gen-engine routes and codexBridge |
| `446904b` | PENDING | All 5 errors resolved; clean `tsc --noEmit` expected         |

## Errors resolved (commit `100094d` → `446904b`)

- `api/gen-engine/artifact.ts(27)`: `applyCorsHeaders` called with 1 argument (required 2–3)
- `api/gen-engine/artifacts.ts(14)`: `string` passed where `string[]` expected
- `api/gen-engine/export.ts(14)`: `string` passed where `string[]` expected
- `server/lib/codexBridge.ts(70)`: `reviewRecommended` does not exist on `GeneratedArtifact`
- `server/lib/codexBridge.ts(77,102)`: `.insert()` does not exist on `QueryBuilder`

## Validation performed

- `tsc --noEmit` — clean after patch
- `git diff --check` — clean
- Vercel deployment triggered on push to `main`

## Where we left off

- The gen-engine API surface is now TypeScript-clean at the route level.
- The Codex artifact system (`api/codex/*`) remains the active gen-engine spine; the `api/gen-engine/*` routes patched here are a secondary surface that bridges into it.
- Vercel build confirmation for `446904b` is the immediate next gate.

## Also completed this session (voice memo + persona audit)

- Persona dropdown audit planned (voice memo 2026-06-04):
  - Remove from user-facing dropdowns: `Gatekeeper`, `Repo Scribe`, `Founder Sample`
  - Rename: `Repo Scribe` → `Philosopher`
  - Ensure all valid embodiment personas appear in the Blackboard Room selector
- `WhatIsGestaltView.md` created in `docs/` from founder voice transcript + bug walk notes

## Next slice

1. Confirm clean Vercel build on commit `446904b`.
2. Persona dropdown audit: remove Gatekeeper, Repo Scribe, Founder Sample from user-facing selectors; rename Repo Scribe → Philosopher; audit Blackboard Room DI selector for completeness.
3. Generative engine render gap: Creation Corner synthesize flow currently returns JSON input shape rather than a fully rendered artifact — fix the artifact rendering path so users see finished output.
4. Session recap → active 11-module extraction pipeline (orbs auto-created from Blackboard session end, no manual selection required).
5. Profile progress visualization: dynamic fill indicators on Profile page showing 11-module accumulation in real time.
6. Apply `20260602000100_codex_artifacts.sql` in a Supabase-backed environment and verify storage/job visibility against real auth users.

---

---

# CurrentState — GenEngine export drain and build-143 audit slice

**Last updated:** 2026-06-02
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Continued [specs/gen-engine/GestaltView-GenEngine-SPEC.md](/workspaces/gestaltview-v2.0/specs/gen-engine/GestaltView-GenEngine-SPEC.md) by adding an artifact-level export drain endpoint and investigating whether the repeated local build `143` termination was a code/dependency failure.

## Executive summary

- Added [api/codex/artifacts/[artifactId]/drain-exports.ts](/workspaces/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/drain-exports.ts), which drains all pending/retryable/failed HTML and JSON jobs for an artifact, preserves partial completion, and returns refreshed artifact, manifest, job, and result state.
- Added [listCodexJobsForArtifact()](/workspaces/gestaltview-v2.0/api/codex/_persistence.ts) so both memory-backed local jobs and Supabase-backed jobs can be drained at artifact scope.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) so `Render exports` prefers the new artifact-level drain endpoint and keeps the single-job endpoint as a fallback.
- Expanded [api/**tests**/codex-export-runner.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/codex-export-runner.test.ts) to cover forge -> two queued jobs -> drain endpoint -> both HTML/JSON manifests ready.
- Investigated the repeated `npm run build` exit code `143`. Direct app typechecking passes, Vite dies during production transform/render under the constrained local environment, disabling Tailwind did not change it, increasing Node heap only delayed it, and the nested `zustand@5.0.14` is isolated under `@react-three/*` rather than the direct app dependency (`zustand@4.5.5`). The evidence does not currently indicate an app-code regression; it indicates local build resource/process termination.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/codex-contracts.test.ts api/__tests__/codex-creation-corner.test.ts api/__tests__/codex-forge.test.ts api/__tests__/codex-export-runner.test.ts api/__tests__/creation-corner-synthesize.test.ts`
- `npm exec -- tsc --noEmit`
- Build investigation commands included `npm run build`, `npm exec -- vite build`, `NODE_OPTIONS=--max-old-space-size=6144 npm exec -- vite build`, `GV_DISABLE_TAILWIND=true npm exec -- vite build`, and nested Zustand inspection with `npm ls zustand --depth=4`.
- `npm run build` still exits `143` locally; tracked `dist/public/art` and `dist/public/audio` churn from the failed build was restored.

## Where we left off

- HTML/JSON Codex export jobs can now be run one-at-a-time or drained at artifact scope.
- The Creation Corner manifest refresh is no longer limited to one job request per export.
- The local build termination is not fixed in this pass because the root-cause evidence points to environment capacity/termination rather than a fatal TypeScript, Vite module, or direct Zustand error. Treat `tsc`, focused tests, and `git diff --check` as the current reliable validation gates in this checkout.

## Next slice

1. Add the typed `spatial_scene` renderer adapter in Dynamic Inner World, consuming Codex scene contracts directly rather than local HTML records.
2. Apply `20260602000100_codex_artifacts.sql` in a Supabase-backed environment and verify storage/job visibility against real auth users.
3. Revisit production build optimization in a larger-memory environment or CI runner to distinguish repo size from local Codespaces resource limits.

---

# CurrentState — GenEngine export drain and build-143 audit slice

**Last updated:** 2026-06-02
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Continued [specs/gen-engine/GestaltView-GenEngine-SPEC.md](/workspaces/gestaltview-v2.0/specs/gen-engine/GestaltView-GenEngine-SPEC.md) by adding an artifact-level export drain endpoint and investigating whether the repeated local build `143` termination was a code/dependency failure.

## Executive summary

- Added [api/codex/artifacts/[artifactId]/drain-exports.ts](/workspaces/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/drain-exports.ts), which drains all pending/retryable/failed HTML and JSON jobs for an artifact, preserves partial completion, and returns refreshed artifact, manifest, job, and result state.
- Added [listCodexJobsForArtifact()](/workspaces/gestaltview-v2.0/api/codex/_persistence.ts) so both memory-backed local jobs and Supabase-backed jobs can be drained at artifact scope.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) so `Render exports` prefers the new artifact-level drain endpoint and keeps the single-job endpoint as a fallback.
- Expanded [api/**tests**/codex-export-runner.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/codex-export-runner.test.ts) to cover forge -> two queued jobs -> drain endpoint -> both HTML/JSON manifests ready.
- Investigated the repeated `npm run build` exit code `143`. Direct app typechecking passes, Vite dies during production transform/render under the constrained local environment, disabling Tailwind did not change it, increasing Node heap only delayed it, and the nested `zustand@5.0.14` is isolated under `@react-three/*` rather than the direct app dependency (`zustand@4.5.5`). The evidence does not currently indicate an app-code regression; it indicates local build resource/process termination.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/codex-contracts.test.ts api/__tests__/codex-creation-corner.test.ts api/__tests__/codex-forge.test.ts api/__tests__/codex-export-runner.test.ts api/__tests__/creation-corner-synthesize.test.ts`
- `npm exec -- tsc --noEmit`
- Build investigation commands included `npm run build`, `npm exec -- vite build`, `NODE_OPTIONS=--max-old-space-size=6144 npm exec -- vite build`, `GV_DISABLE_TAILWIND=true npm exec -- vite build`, and nested Zustand inspection with `npm ls zustand --depth=4`.
- `npm run build` still exits `143` locally; tracked `dist/public/art` and `dist/public/audio` churn from the failed build was restored.

## Where we left off

- HTML/JSON Codex export jobs can now be run one-at-a-time or drained at artifact scope.
- The Creation Corner manifest refresh is no longer limited to one job request per export.
- The local build termination is not fixed in this pass because the root-cause evidence points to environment capacity/termination rather than a fatal TypeScript, Vite module, or direct Zustand error. Treat `tsc`, focused tests, and `git diff --check` as the current reliable validation gates in this checkout.

## Next slice

1. Add the typed `spatial_scene` renderer adapter in Dynamic Inner World, consuming Codex scene contracts directly rather than local HTML records.
2. Apply `20260602000100_codex_artifacts.sql` in a Supabase-backed environment and verify storage/job visibility against real auth users.
3. Revisit production build optimization in a larger-memory environment or CI runner to distinguish repo size from local Codespaces resource limits.

---

# CurrentState — SPEC-2 dynamic profile ingestion and Inner World integration slice

**Last updated:** 2026-05-28
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Began implementing [SPEC-2-Dynamic_User_Profiles_and_Creative_Modules_Integration_Sprint.md](/workspaces/gestaltview-v2.0/SPEC-2-Dynamic_User_Profiles_and_Creative_Modules_Integration_Sprint.md) as an additive runtime slice across profile ingestion, Dynamic Inner World data, module route aliases, and DI route assignments.

## Executive summary

- Added [shared/profileIngestion.ts](/workspaces/gestaltview-v2.0/shared/profileIngestion.ts) and [api/_lib/profileIngestion.ts](/workspaces/gestaltview-v2.0/api/_lib/profileIngestion.ts) with a deterministic first-pass ingestion pipeline that accepts journals, resumes, transcripts, lived-experience narratives, and optional Music DNA text, then produces evidence-backed personality dimensions without using Myers-Briggs-style labels.
- Added [api/profile/ingest.ts](/workspaces/gestaltview-v2.0/api/profile/ingest.ts) for `POST /api/profile/ingest`, plus focused API coverage in [api/**tests**/profile-ingestion.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/profile-ingestion.test.ts).
- Added [api/consciousness/dynamic-inner-world.ts](/workspaces/gestaltview-v2.0/api/consciousness/dynamic-inner-world.ts), [client/src/hooks/useDynamicInnerWorld.ts](/workspaces/gestaltview-v2.0/client/src/hooks/useDynamicInnerWorld.ts), and [client/src/components/ProfileDisplay.tsx](/workspaces/gestaltview-v2.0/client/src/components/ProfileDisplay.tsx) so Dynamic Inner World now has a live endpoint-backed profile card stack and stats band while preserving existing local artifact behavior.
- Added [api/embodiments/by-route.ts](/workspaces/gestaltview-v2.0/api/embodiments/by-route.ts), [client/src/hooks/useRouteEmbodiment.ts](/workspaces/gestaltview-v2.0/client/src/hooks/useRouteEmbodiment.ts), and [api/**tests**/route-embodiment.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/route-embodiment.test.ts) to expose route-to-DI assignments while keeping Blackboard Room unassigned as specified.
- Registered `/workspace/modules/resume-rockstar`, `/workspace/modules/symbio-coder`, and `/workspace/modules/vibe-coder` route aliases in [client/src/App.tsx](/workspaces/gestaltview-v2.0/client/src/App.tsx) against the existing compressed module implementations.
- Added [supabase/migrations/20260528000000_profile_ingestion_and_route_embodiments.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260528000000_profile_ingestion_and_route_embodiments.sql) for profile-ingestion run/source/dimension tables, module embodiment assignments, and route embodiment seeds.
- Fixed existing Vibe Coder strictness issues in [api/modules/vibe-coder/_lib/vibeEngine.ts](/workspaces/gestaltview-v2.0/api/modules/vibe-coder/_lib/vibeEngine.ts) and [client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx](/workspaces/gestaltview-v2.0/client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx) so the SPEC-2 module surface typechecks cleanly.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/profile-ingestion.test.ts api/__tests__/route-embodiment.test.ts`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run build`
- Restored tracked `dist/public/art` and `dist/public/audio` after the successful build removed them as the known workspace build side effect.

## Where we left off

- The first SPEC-2 integration slice is implemented and build-verified. Profile ingestion currently uses a deterministic internal synthesizer with persistence hooks and PLK memory seeding; live source-id hydration from `bucket_drops`, `documents`, and `musical_dna_analyses` is still the next backend hardening step.
- Dynamic Inner World now displays endpoint-backed profile artifacts and stats beside the existing artifact hall, but drag-and-drop ordering persistence and full right-side curator settings remain open.

## Next slice

1. Add live Supabase source hydration for profile ingestion source IDs and a latest-run fetch path for `ProfileDisplay`.
2. Expand Dynamic Inner World curator controls with persisted artifact type filters/order.
3. Wire route embodiment context into one or two module prompts so the assignment endpoint affects responses, not just lookup.

---

# CurrentState — SPEC-2 dynamic profile ingestion and Inner World integration slice

**Last updated:** 2026-05-28
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Began implementing [SPEC-2-Dynamic_User_Profiles_and_Creative_Modules_Integration_Sprint.md](/workspaces/gestaltview-v2.0/SPEC-2-Dynamic_User_Profiles_and_Creative_Modules_Integration_Sprint.md) as an additive runtime slice across profile ingestion, Dynamic Inner World data, module route aliases, and DI route assignments.

## Executive summary

- Added [shared/profileIngestion.ts](/workspaces/gestaltview-v2.0/shared/profileIngestion.ts) and [api/_lib/profileIngestion.ts](/workspaces/gestaltview-v2.0/api/_lib/profileIngestion.ts) with a deterministic first-pass ingestion pipeline that accepts journals, resumes, transcripts, lived-experience narratives, and optional Music DNA text, then produces evidence-backed personality dimensions without using Myers-Briggs-style labels.
- Added [api/profile/ingest.ts](/workspaces/gestaltview-v2.0/api/profile/ingest.ts) for `POST /api/profile/ingest`, plus focused API coverage in [api/**tests**/profile-ingestion.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/profile-ingestion.test.ts).
- Added [api/consciousness/dynamic-inner-world.ts](/workspaces/gestaltview-v2.0/api/consciousness/dynamic-inner-world.ts), [client/src/hooks/useDynamicInnerWorld.ts](/workspaces/gestaltview-v2.0/client/src/hooks/useDynamicInnerWorld.ts), and [client/src/components/ProfileDisplay.tsx](/workspaces/gestaltview-v2.0/client/src/components/ProfileDisplay.tsx) so Dynamic Inner World now has a live endpoint-backed profile card stack and stats band while preserving existing local artifact behavior.
- Added [api/embodiments/by-route.ts](/workspaces/gestaltview-v2.0/api/embodiments/by-route.ts), [client/src/hooks/useRouteEmbodiment.ts](/workspaces/gestaltview-v2.0/client/src/hooks/useRouteEmbodiment.ts), and [api/**tests**/route-embodiment.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/route-embodiment.test.ts) to expose route-to-DI assignments while keeping Blackboard Room unassigned as specified.
- Registered `/workspace/modules/resume-rockstar`, `/workspace/modules/symbio-coder`, and `/workspace/modules/vibe-coder` route aliases in [client/src/App.tsx](/workspaces/gestaltview-v2.0/client/src/App.tsx) against the existing compressed module implementations.
- Added [supabase/migrations/20260528000000_profile_ingestion_and_route_embodiments.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260528000000_profile_ingestion_and_route_embodiments.sql) for profile-ingestion run/source/dimension tables, module embodiment assignments, and route embodiment seeds.
- Fixed existing Vibe Coder strictness issues in [api/modules/vibe-coder/_lib/vibeEngine.ts](/workspaces/gestaltview-v2.0/api/modules/vibe-coder/_lib/vibeEngine.ts) and [client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx](/workspaces/gestaltview-v2.0/client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx) so the SPEC-2 module surface typechecks cleanly.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/profile-ingestion.test.ts api/__tests__/route-embodiment.test.ts`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run build`
- Restored tracked `dist/public/art` and `dist/public/audio` after the successful build removed them as the known workspace build side effect.

## Where we left off

- The first SPEC-2 integration slice is implemented and build-verified. Profile ingestion currently uses a deterministic internal synthesizer with persistence hooks and PLK memory seeding; live source-id hydration from `bucket_drops`, `documents`, and `musical_dna_analyses` is still the next backend hardening step.
- Dynamic Inner World now displays endpoint-backed profile artifacts and stats beside the existing artifact hall, but drag-and-drop ordering persistence and full right-side curator settings remain open.

## Next slice

1. Add live Supabase source hydration for profile ingestion source IDs and a latest-run fetch path for `ProfileDisplay`.
2. Expand Dynamic Inner World curator controls with persisted artifact type filters/order.
3. Wire route embodiment context into one or two module prompts so the assignment endpoint affects responses, not just lookup.

---

# CurrentState — issue 47-54 bugwalk stabilization pass

**Last updated:** 2026-05-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Addressed the high-friction user-facing issues raised in GitHub issues #47-#54 with a focused stabilization pass across settings, signup, Spotify OAuth, upload/voice inputs, workspace/document local persistence, and Blackboard/Sanctuary input ergonomics. Stripe was intentionally left as lower priority for this pass because public user onboarding is not planned for at least a week.

## Executive summary

- Added [client/src/lib/userSurfaceSettings.ts](/workspaces/gestaltview-v2.0/client/src/lib/userSurfaceSettings.ts) so Settings toggles persist, update root UI affordances, and broadcast changes to live capture controls.
- Updated [client/src/pages/SettingsPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SettingsPage.tsx), [client/src/components/capture/UniversalCaptureBar.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/UniversalCaptureBar.tsx), [client/src/components/JournalEditor.tsx](/workspaces/gestaltview-v2.0/client/src/components/JournalEditor.tsx), and [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the voice-capture setting actually disables voice controls and Blackboard/Journals can capture speech-to-text when browser support exists.
- Replaced the disabled signup redirect in [client/src/pages/Signup.tsx](/workspaces/gestaltview-v2.0/client/src/pages/Signup.tsx) and updated [client/src/contexts/AuthContext.tsx](/workspaces/gestaltview-v2.0/client/src/contexts/AuthContext.tsx) so Supabase email/password signup/signin can be used when configured, while private magic-link fallback remains available.
- Added [client/src/pages/SpotifyCallbackPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SpotifyCallbackPage.tsx), registered `/spotify/callback` in [client/src/App.tsx](/workspaces/gestaltview-v2.0/client/src/App.tsx), and updated [client/src/pages/MusicalDNAPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/MusicalDNAPage.tsx) so "Connect Spotify" starts the existing PKCE OAuth flow instead of only running track analysis.
- Updated [client/src/components/workspaces-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/workspaces-interface.tsx) and [client/src/components/document-analysis-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/document-analysis-interface.tsx) so create/update/delete fallback behavior is kept in local browser storage and document uploads accept batches instead of silently taking only the first file.

## Validation performed

- `npm exec vitest run client/src/tests/user-surface-settings.test.ts client/src/tests/creation-corner-intake-controls.test.tsx client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run build`
- Restored tracked `dist/public/art` and `dist/public/audio` assets after the successful build removed them as a known workspace build side effect.

## Where we left off

- The immediate user-visible regressions around dead toggles, signup redirect, missing Spotify callback routing, nonfunctional Blackboard paperclip/mic controls, missing journal voice input, and local workspace/document edit/delete fallbacks are repaired.
- Spotify secrets still need to be confirmed in the deployed environment against the registered redirect URI for `/spotify/callback`; the code path is now present.
- Stripe remains configured through the existing checkout route, but no new Stripe work was prioritized in this pass.

## Next slice

1. Run a rendered QA pass through `/settings`, `/signup`, `/musical-dna`, `/blackboard-room`, `/sanctuary`, `/workspaces`, and `/documents` against the local dev server or deployed preview.
2. If Spotify OAuth still fails in deployment, verify the exact Spotify app redirect URI matches the app origin plus `/spotify/callback`.
3. If public onboarding becomes immediate, harden the subscription and post-checkout account lifecycle around the existing `/api/stripe/checkout` path.

---

# CurrentState — UI improvements action-plan first slice

**Last updated:** 2026-05-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Began implementing `specs/root/GestaltView_UI_Improvements_Action_Plan.md` as a bounded repo-local slice across the homepage, Blackboard Room session controls, Creation Corner blueprint deletion, Sanctuary scrapbook/journal feel, local storage upload resilience, and the top-nav DI overlay collision.

## Executive summary

- Updated [client/src/pages/Home.tsx](/workspaces/gestaltview-v2.0/client/src/pages/Home.tsx) so the GestaltView wordmark uses a living gradient and room cards use a stronger frosted/liquid-glass treatment with larger typography.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) with an explicit Clear control next to End session; Clear resets transcript state, draft text, attachment state, recording state, and the persisted Blackboard chat key.
- Updated [client/src/components/DIPresenceIndicator.tsx](/workspaces/gestaltview-v2.0/client/src/components/DIPresenceIndicator.tsx) so the DI selector backdrop starts below the fixed top nav and no longer obscures the Session chip.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) and [client/src/components/BlueprintLibrary.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintLibrary.tsx) so each blueprint card exposes a confirmed delete action wired through the existing `removeBlueprint()` helper and server delete route.
- Updated [client/src/components/ScrapbookPanel.tsx](/workspaces/gestaltview-v2.0/client/src/components/ScrapbookPanel.tsx) and [client/src/pages/SanctuaryPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SanctuaryPage.tsx) so markdown scrapbook items render through `BillyMarkdown` and the journal/scrapbook area has a warmer notebook-paper treatment.
- Hardened local browser storage writes in [client/src/components/Scaffold.tsx](/workspaces/gestaltview-v2.0/client/src/components/Scaffold.tsx) and [client/src/lib/innerWorldFiles.ts](/workspaces/gestaltview-v2.0/client/src/lib/innerWorldFiles.ts) so quota/private-mode failures log instead of throwing during local persistence.

## Validation performed

- `npm exec vitest run client/src/tests/creation-corner-freeform.test.ts client/src/tests/creation-corner-intake-controls.test.tsx client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- tsc --noEmit`

## Where we left off

- The first action-plan slice is implemented and typechecked. The highest-confidence fixes are local/UI-level because they reuse existing helpers and routes already present in the repo.
- Supabase Storage bucket policy/tier verification for live image-upload failures still needs an environment-backed diagnostic; this pass hardened the local storage failure path but did not verify live bucket policy.
- The broader Dynamic Inner World rebuild, full room-header standardization, profile module editing, Embodiment authoring, and workspace content CRUD remain open larger slices.

## Next slice

1. Run rendered QA for `/`, `/blackboard-room`, `/creation-corner`, and `/sanctuary` with the top nav open/closed and DI selector open/closed.
2. Continue the action plan with either the Dynamic Inner World canvas/museum slice or the image-upload Supabase Storage diagnostic, depending on whether visual rebuild or upload reliability is the next priority.

---

# CurrentState — UI improvements image-upload and Blackboard header clearance slice

**Last updated:** 2026-05-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Continued `specs/root/GestaltView_UI_Improvements_Action_Plan.md` with the next upload-reliability slice and a Blackboard header follow-up so Clear/End session controls stay unobscured under the fixed runtime nav.

## Executive summary

- Updated [client/src/pages/ProfilePage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ProfilePage.tsx) so profile avatar uploads no longer store raw image `data:` payloads in `gv:profile:preferences:v1`; signed-in uploads now route through the existing user-file pipeline and preferences keep only a URL-sized avatar reference.
- Added `normalizeProfilePreferencesForStorage()` and [client/src/tests/profile-preferences.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/profile-preferences.test.ts) to guard against reintroducing raw data URL avatar persistence.
- Updated [api/profile/preferences.ts](/workspaces/gestaltview-v2.0/api/profile/preferences.ts) so the server preference route rejects raw `data:` avatar values and clamps avatar references to 2048 characters instead of accepting large image payloads.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the room column reserves top-nav clearance and the Clear/End chat-window controls are not hidden by the fixed nav or DI presence layer.

## Validation performed

- `npm exec vitest run client/src/tests/profile-preferences.test.ts client/src/tests/creation-corner-intake-controls.test.tsx`
- `npm exec -- tsc --noEmit`

## Where we left off

- The concrete repo-local cause of `Failed to execute setItem on Storage` for profile avatars is patched: image bytes are no longer written into profile preferences.
- Sanctuary scrapbook uploads already use the shared user-file pipeline; the prior slice hardened local storage writes globally, but live Supabase bucket policy/tier verification still requires an environment-backed check.

## Next slice

1. Run rendered QA for `/profile` avatar upload, `/sanctuary` scrapbook image upload, and `/blackboard-room` Clear/End controls under the fixed top nav.
2. Continue the action plan with the content routing pipeline check: Blackboard → External Scaffold → Dynamic Inner World.

---

# CurrentState — issue 47-54 bugwalk stabilization pass

**Last updated:** 2026-05-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Addressed the high-friction user-facing issues raised in GitHub issues #47-#54 with a focused stabilization pass across settings, signup, Spotify OAuth, upload/voice inputs, workspace/document local persistence, and Blackboard/Sanctuary input ergonomics. Stripe was intentionally left as lower priority for this pass because public user onboarding is not planned for at least a week.

## Executive summary

- Added [client/src/lib/userSurfaceSettings.ts](/workspaces/gestaltview-v2.0/client/src/lib/userSurfaceSettings.ts) so Settings toggles persist, update root UI affordances, and broadcast changes to live capture controls.
- Updated [client/src/pages/SettingsPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SettingsPage.tsx), [client/src/components/capture/UniversalCaptureBar.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/UniversalCaptureBar.tsx), [client/src/components/JournalEditor.tsx](/workspaces/gestaltview-v2.0/client/src/components/JournalEditor.tsx), and [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the voice-capture setting actually disables voice controls and Blackboard/Journals can capture speech-to-text when browser support exists.
- Replaced the disabled signup redirect in [client/src/pages/Signup.tsx](/workspaces/gestaltview-v2.0/client/src/pages/Signup.tsx) and updated [client/src/contexts/AuthContext.tsx](/workspaces/gestaltview-v2.0/client/src/contexts/AuthContext.tsx) so Supabase email/password signup/signin can be used when configured, while private magic-link fallback remains available.
- Added [client/src/pages/SpotifyCallbackPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SpotifyCallbackPage.tsx), registered `/spotify/callback` in [client/src/App.tsx](/workspaces/gestaltview-v2.0/client/src/App.tsx), and updated [client/src/pages/MusicalDNAPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/MusicalDNAPage.tsx) so "Connect Spotify" starts the existing PKCE OAuth flow instead of only running track analysis.
- Updated [client/src/components/workspaces-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/workspaces-interface.tsx) and [client/src/components/document-analysis-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/document-analysis-interface.tsx) so create/update/delete fallback behavior is kept in local browser storage and document uploads accept batches instead of silently taking only the first file.

## Validation performed

- `npm exec vitest run client/src/tests/user-surface-settings.test.ts client/src/tests/creation-corner-intake-controls.test.tsx client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run build`
- Restored tracked `dist/public/art` and `dist/public/audio` assets after the successful build removed them as a known workspace build side effect.

## Where we left off

- The immediate user-visible regressions around dead toggles, signup redirect, missing Spotify callback routing, nonfunctional Blackboard paperclip/mic controls, missing journal voice input, and local workspace/document edit/delete fallbacks are repaired.
- Spotify secrets still need to be confirmed in the deployed environment against the registered redirect URI for `/spotify/callback`; the code path is now present.
- Stripe remains configured through the existing checkout route, but no new Stripe work was prioritized in this pass.

## Next slice

1. Run a rendered QA pass through `/settings`, `/signup`, `/musical-dna`, `/blackboard-room`, `/sanctuary`, `/workspaces`, and `/documents` against the local dev server or deployed preview.
2. If Spotify OAuth still fails in deployment, verify the exact Spotify app redirect URI matches the app origin plus `/spotify/callback`.
3. If public onboarding becomes immediate, harden the subscription and post-checkout account lifecycle around the existing `/api/stripe/checkout` path.

---

# CurrentState — UI improvements action-plan first slice

**Last updated:** 2026-05-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Began implementing `specs/root/GestaltView_UI_Improvements_Action_Plan.md` as a bounded repo-local slice across the homepage, Blackboard Room session controls, Creation Corner blueprint deletion, Sanctuary scrapbook/journal feel, local storage upload resilience, and the top-nav DI overlay collision.

## Executive summary

- Updated [client/src/pages/Home.tsx](/workspaces/gestaltview-v2.0/client/src/pages/Home.tsx) so the GestaltView wordmark uses a living gradient and room cards use a stronger frosted/liquid-glass treatment with larger typography.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) with an explicit Clear control next to End session; Clear resets transcript state, draft text, attachment state, recording state, and the persisted Blackboard chat key.
- Updated [client/src/components/DIPresenceIndicator.tsx](/workspaces/gestaltview-v2.0/client/src/components/DIPresenceIndicator.tsx) so the DI selector backdrop starts below the fixed top nav and no longer obscures the Session chip.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) and [client/src/components/BlueprintLibrary.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintLibrary.tsx) so each blueprint card exposes a confirmed delete action wired through the existing `removeBlueprint()` helper and server delete route.
- Updated [client/src/components/ScrapbookPanel.tsx](/workspaces/gestaltview-v2.0/client/src/components/ScrapbookPanel.tsx) and [client/src/pages/SanctuaryPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SanctuaryPage.tsx) so markdown scrapbook items render through `BillyMarkdown` and the journal/scrapbook area has a warmer notebook-paper treatment.
- Hardened local browser storage writes in [client/src/components/Scaffold.tsx](/workspaces/gestaltview-v2.0/client/src/components/Scaffold.tsx) and [client/src/lib/innerWorldFiles.ts](/workspaces/gestaltview-v2.0/client/src/lib/innerWorldFiles.ts) so quota/private-mode failures log instead of throwing during local persistence.

## Validation performed

- `npm exec vitest run client/src/tests/creation-corner-freeform.test.ts client/src/tests/creation-corner-intake-controls.test.tsx client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- tsc --noEmit`

## Where we left off

- The first action-plan slice is implemented and typechecked. The highest-confidence fixes are local/UI-level because they reuse existing helpers and routes already present in the repo.
- Supabase Storage bucket policy/tier verification for live image-upload failures still needs an environment-backed diagnostic; this pass hardened the local storage failure path but did not verify live bucket policy.
- The broader Dynamic Inner World rebuild, full room-header standardization, profile module editing, Embodiment authoring, and workspace content CRUD remain open larger slices.

## Next slice

1. Run rendered QA for `/`, `/blackboard-room`, `/creation-corner`, and `/sanctuary` with the top nav open/closed and DI selector open/closed.
2. Continue the action plan with either the Dynamic Inner World canvas/museum slice or the image-upload Supabase Storage diagnostic, depending on whether visual rebuild or upload reliability is the next priority.

---

# CurrentState — UI improvements image-upload and Blackboard header clearance slice

**Last updated:** 2026-05-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Continued `specs/root/GestaltView_UI_Improvements_Action_Plan.md` with the next upload-reliability slice and a Blackboard header follow-up so Clear/End session controls stay unobscured under the fixed runtime nav.

## Executive summary

- Updated [client/src/pages/ProfilePage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ProfilePage.tsx) so profile avatar uploads no longer store raw image `data:` payloads in `gv:profile:preferences:v1`; signed-in uploads now route through the existing user-file pipeline and preferences keep only a URL-sized avatar reference.
- Added `normalizeProfilePreferencesForStorage()` and [client/src/tests/profile-preferences.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/profile-preferences.test.ts) to guard against reintroducing raw data URL avatar persistence.
- Updated [api/profile/preferences.ts](/workspaces/gestaltview-v2.0/api/profile/preferences.ts) so the server preference route rejects raw `data:` avatar values and clamps avatar references to 2048 characters instead of accepting large image payloads.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the room column reserves top-nav clearance and the Clear/End chat-window controls are not hidden by the fixed nav or DI presence layer.

## Validation performed

- `npm exec vitest run client/src/tests/profile-preferences.test.ts client/src/tests/creation-corner-intake-controls.test.tsx`
- `npm exec -- tsc --noEmit`

## Where we left off

- The concrete repo-local cause of `Failed to execute setItem on Storage` for profile avatars is patched: image bytes are no longer written into profile preferences.
- Sanctuary scrapbook uploads already use the shared user-file pipeline; the prior slice hardened local storage writes globally, but live Supabase bucket policy/tier verification still requires an environment-backed check.

## Next slice

1. Run rendered QA for `/profile` avatar upload, `/sanctuary` scrapbook image upload, and `/blackboard-room` Clear/End controls under the fixed top nav.
2. Continue the action plan with the content routing pipeline check: Blackboard → External Scaffold → Dynamic Inner World.

---

# CurrentState — Blackboard embodiment profile realignment

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Replaced Blackboard Room's scripted persona layer with embodiment-backed profile adapters, routed the main Blackboard transcript through the live Billy API, and removed the extra "You are Billy" instruction block from the companion prompt so the room now relies on the actual embodiment profile framework.

## Executive summary

- Converted [client/src/data/personas.ts](/workspaces/gestaltview-v2.0/client/src/data/personas.ts) into a compatibility adapter over the real embodiment registry instead of a hand-authored persona table.
- Updated [client/src/lib/personaManager.ts](/workspaces/gestaltview-v2.0/client/src/lib/personaManager.ts) so room prompts are regenerated from the live embodiment runtime and room context instead of pulling a cached script string.
- Routed the Blackboard Room transcript in [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) through `callBillyApi()` for each selected embodiment profile, with a generic offline fallback instead of canned persona responses.
- Trimmed [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) so the user message carries facts and room context only, leaving identity and behavior to the embodiment prompt layer.
- Hardened the browser-side Billy fallback path in [client/src/lib/BillyEngine.ts](/workspaces/gestaltview-v2.0/client/src/lib/BillyEngine.ts) and [client/src/lib/billyApi.ts](/workspaces/gestaltview-v2.0/client/src/lib/billyApi.ts) so the selected embodiment profile and room slug survive the fallback path too.

## Validation performed

- `npm exec vitest run client/src/tests/personas.test.ts client/src/tests/embodiment-runtime.test.ts client/src/tests/billy-ip-guard.test.ts`
- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room is now bound to the real embodiment registry and the live Billy API rather than the old scripted persona filter.
- The next slice, if you want to keep going, is to decide whether any of the older persona-facing surfaces should be migrated to the same embodiment-backed adapter for consistency.

---

# CurrentState — v2.5 room-slice implementation

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the Keith-only room-state registry and badges, refactored Blackboard Room's companion rail into a session inspector, wired the persona hue into the blackboard atmosphere, opened Creation Corner from freeform text plus raw upload/paste/voice intake controls, and made External Scaffold mobile-friendlier with tap-based link mode and a bottom-sheet orb inspector.

## Executive summary

- Added [client/src/lib/roomState.ts](/workspaces/gestaltview-v2.0/client/src/lib/roomState.ts) plus [client/src/components/RoomStateBadge.tsx](/workspaces/gestaltview-v2.0/client/src/components/RoomStateBadge.tsx) so the four root rooms can expose Keith-only stability badges in their headers without showing them in production.
- Refactored [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) into a mobile-collapsible session inspector that shows capture counts, latest orb details, blueprint readiness, and direct promote/send actions instead of a second input surface.
- Wired [client/src/data/personas.ts](/workspaces/gestaltview-v2.0/client/src/data/personas.ts) and [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so persona changes update the blackboard atmosphere hue, the hero canvas tints from that hue, the input controls are larger on touch devices, and the canvas degrades if frame rate stays low.
- Added freeform entry mode plus upload, clipboard paste, and voice-note intake in [client/src/components/BlueprintGenerativeWorkbench.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintGenerativeWorkbench.tsx) so Creation Corner can bootstrap a fresh blueprint from raw text or attach source material before handing control back to the existing workbench once the first draft exists.
- Tightened [client/src/components/OrbGraph.tsx](/workspaces/gestaltview-v2.0/client/src/components/OrbGraph.tsx), [client/src/components/InsightOrb.tsx](/workspaces/gestaltview-v2.0/client/src/components/InsightOrb.tsx), and [client/src/pages/ExternalScaffoldPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ExternalScaffoldPage.tsx) so link mode works by tap, source selection is visibly confirmed, and the orb inspector becomes a bottom sheet on mobile.

## Validation performed

- `npm exec vitest run client/src/tests/personas.test.ts client/src/tests/room-state.test.ts client/src/tests/creation-corner-freeform.test.ts`
- `npm exec tsc --noEmit`
- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room, Creation Corner, and External Scaffold now cover the spec's first meaningful slice without introducing parallel room systems.
- The Creation Corner intake slice is now complete; the remaining spec work in this pass is the Profile Page redesign.

## Next slice

1. Move on to the Profile Page visual redesign when you want the next bounded room slice.

---

# CurrentState — Blackboard scroll fix and Creation Corner live inspiration pass

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed Blackboard Room's mobile scroll container so the chat feed uses the remaining viewport height instead of sticky input compensation, and upgraded Creation Corner's workbench with live Billy refinement chat plus an inspiration import rail that accepts URLs, clipboard content, and uploaded files.

## Executive summary

- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the outer room column now uses `h-dvh` with `overflow-hidden`, the chat feed flexes into the remaining height with `minHeight: 0`, and the mobile sticky override was removed from `BBR_STYLES`.
- Updated [client/src/components/BlueprintGenerativeWorkbench.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintGenerativeWorkbench.tsx) so the Art Teacher panel now sends refinement notes through `callBillyApi(...)`, accepts a live chat prompt, and exposes an inspiration import panel in both the freeform and active draft states.
- Wired inspiration imports to the current draft target, recorded imported items locally, and kept the existing file upload and clipboard paths available without breaking the creation flow.

## Validation performed

- `npm exec vitest run client/src/tests/creation-corner-freeform.test.ts client/src/tests/creation-corner-intake-controls.test.tsx client/src/tests/room-state.test.ts`
- `npm exec tsc --noEmit`
- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room now has the viewport budget the spec wanted, and Creation Corner's live refinement lane is now connected to Billy.
- External Scaffold was left on the restored older implementation you preferred, so there was no new rewrite there in this pass.

## Next slice

1. If you want to keep pulling on `SPEC-GestaltView-v2.0.md`, the remaining obvious follow-up is the External Scaffold module-safety audit or any other adjacent room polish you want next.

---

# CurrentState — External Scaffold module-safety smoke test

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added a module-safety smoke test for the restored External Scaffold page so the current artifact-galaxy implementation stays importable and renderable under a stable test router, without reintroducing the newer full-restore version you rolled back.

## Executive summary

- Added [client/src/tests/external-scaffold.module-safety.test.tsx](/workspaces/gestaltview-v2.0/client/src/tests/external-scaffold.module-safety.test.tsx) to render [client/src/pages/ExternalScaffoldPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ExternalScaffoldPage.tsx) under a pure `wouter` test hook and assert the core scaffold controls remain present.
- Confirmed the older External Scaffold implementation still imports and renders cleanly in isolation, so the module-safety audit passes without pulling the page back to the newer version you removed.

## Validation performed

- `npm exec vitest run client/src/tests/external-scaffold.module-safety.test.tsx`
- `npm exec tsc --noEmit`
- `git diff --check`

## Where we left off

- The restored External Scaffold page is still the active implementation, and now it has a smoke test that guards against import drift or a broken render path.

## Next slice

1. Continue with any other adjacent room polish or spec items you want after the External Scaffold audit.

---

# CurrentState — v2.5 Profile Page redesign slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 5 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by replacing the Profile Page summary surface with a room-coherent identity, embodiment-context, export, and danger-zone profile room, plus server/local persistence for profile preferences.

## Executive summary

- Rebuilt [client/src/pages/ProfilePage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ProfilePage.tsx) around the existing `RoomIdentityHeader` pattern, with a private identity card, local activity counts, and drawer sections for Identity, Embodiment context, Data & export, and Danger zone.
- Added profile preference persistence through [api/profile/preferences.ts](/workspaces/gestaltview-v2.0/api/profile/preferences.ts), using authenticated `user_preferences` rows when available and keeping a local `gv:profile:preferences:v1` fallback so the page does not block on server availability.
- Added [supabase/migrations/20260526000000_add_profile_preference_fields.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260526000000_add_profile_preference_fields.sql) to extend `user_preferences` with `display_name`, `avatar_url`, and `embodiment_profile_slug`.
- Kept `MassExodusButton` mounted in the Profile Page export drawer and made account deletion request-only via `mailto:` with no destructive backend action.

## Validation performed

- `npm exec vitest run client/src/tests/room-state.test.ts`
- `npm exec -- tsc --noEmit`
- `npm run build`
- `git diff --check`

## Where we left off

- The v2.5 Profile Page redesign is now implemented and build-verified.
- The preference API expects the new Supabase migration to be applied before server persistence works; until then, the client stores profile preferences locally and reports server-save failures through toast feedback.

## Next slice

1. Continue with the next bounded v2.5 spec slice, likely DI runtime UI consumption or gen-engine room wiring, unless you want to prioritize applying/verifying the new `user_preferences` migration first.

---

# CurrentState — DI runtime UI consumption slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 1 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by routing Blackboard Room single-voice DI-eligible messages through the live DI runtime bridge while preserving Billy fallback and roundtable behavior.

## Executive summary

- Added [client/src/lib/blackboardDiRouting.ts](/workspaces/gestaltview-v2.0/client/src/lib/blackboardDiRouting.ts) as the focused routing seam for Blackboard responders: single-voice DI-eligible profiles call `sendDIMessage()`/`/api/di`, roundtable responders stay on `callBillyApi()`/`/api/billy`, and DI failures fall back to Billy.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so `handleSend` uses the new routing helper, records the response source on DI messages, and adds the distinct `di-response` class for DI-runtime transcript bubbles.
- Added [client/src/tests/blackboard-di-routing.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/blackboard-di-routing.test.ts) to prove single-voice DI routing calls `sendDIMessage()` and roundtable mode does not.

## Validation performed

- `npm exec vitest run client/src/tests/blackboard-di-routing.test.ts`
- `npm exec vitest run client/src/tests/embodiment-runtime.test.ts`
- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/di-runtime.test.ts api/__tests__/di-route.test.ts`
- `npm exec -- tsc --noEmit`
- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room now consumes the DI runtime directly for single-voice DI-eligible responders and keeps the existing Billy route as fallback.
- Roundtable remains intentionally unchanged on Billy routing, matching the v2.5 spec boundary.
- `npm run build` succeeds, but still deletes tracked `dist/public/art` and `dist/public/audio` files as a build side effect in this workspace; those unrelated deletions were restored after validation.

## Next slice

1. Continue with Slice 2: gen-engine room wiring for Blackboard capture resonance and Dynamic Inner World artifact suggestions.

---

# CurrentState — gen-engine room wiring slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 2 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by wiring Blackboard saved captures and Dynamic Inner World artifact inspection into the existing gen-engine client/fallback path.

## Executive summary

- Added [client/src/lib/genEngineRoomWiring.ts](/workspaces/gestaltview-v2.0/client/src/lib/genEngineRoomWiring.ts) as the shared client seam for room-level gen-engine calls, covering Blackboard capture enrichment and Dynamic Inner World resonance-link ranking.
- Extended `CaptureMetadata` in [client/src/components/Scaffold.tsx](/workspaces/gestaltview-v2.0/client/src/components/Scaffold.tsx) with optional `genEngine` metadata so saved captures can retain fusion/resonance results without changing the capture storage shape.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so saved captures are persisted immediately, then enriched in the background through `createCaptureSignal()` and `scoreResonance()`; high-resonance user bubbles get a subtle glow once the score returns.
- Updated [client/src/pages/DynamicInnerWorldPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/DynamicInnerWorldPage.tsx) and [client/src/components/ArtifactDeepView.tsx](/workspaces/gestaltview-v2.0/client/src/components/ArtifactDeepView.tsx) so opening an artifact inspector computes up to three advisory resonance links and clicking a link selects that related artifact.
- Added [client/src/tests/gen-engine-room-wiring.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/gen-engine-room-wiring.test.ts) for the new room-level gen-engine behavior.

## Validation performed

- `npm exec vitest run client/src/tests/gen-engine-room-wiring.test.ts client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/gen-engine.test.ts`
- `npm exec -- tsc --noEmit`
- `npm run build` (first run terminated at Vite chunk rendering with code 143; retry completed successfully)
- `git diff --check`

## Where we left off

- Blackboard and Dynamic Inner World now consume the gen-engine client without blocking room render, and both paths retain the local fallback behavior already built into `genEngineClient.ts`.
- The build still deletes tracked `dist/public/art` and `dist/public/audio` assets as a side effect; those unrelated deletions were restored after validation.

## Next slice

1. Continue with Slice 3: Sanctuary server persistence verification and repair for journals and scrapbook items.

---

# CurrentState — Sanctuary server persistence repair slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 3 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by verifying Sanctuary's existing journal/scrapbook hydration path and repairing the server persistence boundary so local client IDs are stored as `source_ref` instead of being written into UUID columns.

## Executive summary

- Verified [client/src/pages/SanctuaryPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SanctuaryPage.tsx) delegates persistence to [client/src/components/JournalEditor.tsx](/workspaces/gestaltview-v2.0/client/src/components/JournalEditor.tsx) and [client/src/components/ScrapbookPanel.tsx](/workspaces/gestaltview-v2.0/client/src/components/ScrapbookPanel.tsx), which already hydrate from the Sanctuary API when a user session exists.
- Updated [api/sanctuary/journal.ts](/workspaces/gestaltview-v2.0/api/sanctuary/journal.ts) so journal writes include `source_ref`, return `source_ref` as the client-facing `id`, and use the local journal id supplied by the client.
- Updated [api/sanctuary/scrapbook.ts](/workspaces/gestaltview-v2.0/api/sanctuary/scrapbook.ts) so scrapbook item writes use `source_ref`, uploaded files are resolved through `user_files.source_ref` before falling back to UUID id, and returned `fileId` values stay compatible with the client-local ids.
- Added [api/sanctuary/journals.ts](/workspaces/gestaltview-v2.0/api/sanctuary/journals.ts) as a plural route alias for the spec path without breaking the existing singular route used by the client.
- Added [supabase/migrations/20260526001000_add_sanctuary_source_refs.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260526001000_add_sanctuary_source_refs.sql) to add/populate `journals.source_ref`, `scrapbook_items.source_ref`, `scrapbook_items.source_file_ref`, and `scrapbook_items.updated_at`.
- Added [api/**tests**/sanctuary.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/sanctuary.test.ts) to guard the source-ref journal and scrapbook persistence behavior.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/sanctuary.test.ts`
- `npm exec vitest run client/src/tests/gen-engine-room-wiring.test.ts client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run build` attempted twice; both attempts terminated during Vite transform with code 143 before any compiler or application error was emitted.

## Where we left off

- Sanctuary journal and scrapbook server persistence now has a source-ref compatible path for client-local IDs and existing uploaded-file source refs.
- The migration must be applied before production scrapbook rows can store `source_ref` and `source_file_ref`.
- Full production build was not completed in this slice because both attempts hit the recurring environment-level code 143 termination during Vite transform; targeted API tests and typecheck passed.

## Next slice

1. Continue with Slice 4: Embodiment Heartbeat Layer.
2. If you want maximum deployment confidence before moving on, rerun `npm run build` in a less constrained shell or CI runner after applying the Sanctuary source-ref migration.

---

# CurrentState — DI runtime UI consumption slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 1 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by routing Blackboard Room single-voice DI-eligible messages through the live DI runtime bridge while preserving Billy fallback and roundtable behavior.

## Executive summary

- Added [client/src/lib/blackboardDiRouting.ts](/workspaces/gestaltview-v2.0/client/src/lib/blackboardDiRouting.ts) as the focused routing seam for Blackboard responders: single-voice DI-eligible profiles call `sendDIMessage()`/`/api/di`, roundtable responders stay on `callBillyApi()`/`/api/billy`, and DI failures fall back to Billy.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so `handleSend` uses the new routing helper, records the response source on DI messages, and adds the distinct `di-response` class for DI-runtime transcript bubbles.
- Added [client/src/tests/blackboard-di-routing.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/blackboard-di-routing.test.ts) to prove single-voice DI routing calls `sendDIMessage()` and roundtable mode does not.

**Last updated:** 2026-06-04
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Repaired TypeScript errors introduced in the gen-engine API layer that were blocking Vercel deployment (build exit on commit `100094d`), patched `codexBridge.ts` to re-export from the canonical `api/_lib/codexBridge` stub, and pushed commit `446904b` to unblock the deployment pipeline.

## Executive summary

- Fixed `api/gen-engine/artifacts.ts` and `api/gen-engine/export.ts`: method field changed from string `'POST'` to string array `['POST']` to match the `prepareJsonRoute` signature.
- Fixed `api/gen-engine/artifact.ts`: removed manual CORS/method guard and replaced with `prepareJsonRoute(['GET'])` to match the 2-3 argument signature correctly.
- Fixed `server/lib/codexBridge.ts`: replaced broken implementation that referenced non-existent `.insert()` QueryBuilder methods and non-existent `reviewRecommended` field on `GeneratedArtifact` with a clean re-export stub pointing at `api/_lib/codexBridge`.
- Commit `446904b` pushed to `main` — Vercel deployment triggered. Build confirmation pending as of 2026-06-04 14:20 EDT.

## Build history for this pass

| Commit    | Result  | Notes                                                        |
| --------- | ------- | ------------------------------------------------------------ |
| `100094d` | FAILED  | 5 TypeScript errors across gen-engine routes and codexBridge |
| `446904b` | PENDING | All 5 errors resolved; clean `tsc --noEmit` expected         |

## Errors resolved (commit `100094d` → `446904b`)

- `api/gen-engine/artifact.ts(27)`: `applyCorsHeaders` called with 1 argument (required 2–3)
- `api/gen-engine/artifacts.ts(14)`: `string` passed where `string[]` expected
- `api/gen-engine/export.ts(14)`: `string` passed where `string[]` expected
- `server/lib/codexBridge.ts(70)`: `reviewRecommended` does not exist on `GeneratedArtifact`
- `server/lib/codexBridge.ts(77,102)`: `.insert()` does not exist on `QueryBuilder`

## Validation performed

- `tsc --noEmit` — clean after patch
- `git diff --check` — clean
- Vercel deployment triggered on push to `main`

## Where we left off

- The gen-engine API surface is now TypeScript-clean at the route level.
- The Codex artifact system (`api/codex/*`) remains the active gen-engine spine; the `api/gen-engine/*` routes patched here are a secondary surface that bridges into it.
- Vercel build confirmation for `446904b` is the immediate next gate.

## Also completed this session (voice memo + persona audit)

- Persona dropdown audit planned (voice memo 2026-06-04):
  - Remove from user-facing dropdowns: `Gatekeeper`, `Repo Scribe`, `Founder Sample`
  - Rename: `Repo Scribe` → `Philosopher`
  - Ensure all valid embodiment personas appear in the Blackboard Room selector
- `WhatIsGestaltView.md` created in `docs/` from founder voice transcript + bug walk notes

## Next slice

1. Confirm clean Vercel build on commit `446904b`.
2. Persona dropdown audit: remove Gatekeeper, Repo Scribe, Founder Sample from user-facing selectors; rename Repo Scribe → Philosopher; audit Blackboard Room DI selector for completeness.
3. Generative engine render gap: Creation Corner synthesize flow currently returns JSON input shape rather than a fully rendered artifact — fix the artifact rendering path so users see finished output.
4. Session recap → active 11-module extraction pipeline (orbs auto-created from Blackboard session end, no manual selection required).
5. Profile progress visualization: dynamic fill indicators on Profile page showing 11-module accumulation in real time.
6. Apply `20260602000100_codex_artifacts.sql` in a Supabase-backed environment and verify storage/job visibility against real auth users.

---

---

# CurrentState — gen-engine room wiring slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 2 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by wiring Blackboard saved captures and Dynamic Inner World artifact inspection into the existing gen-engine client/fallback path.

## Executive summary

- Added [client/src/lib/genEngineRoomWiring.ts](/workspaces/gestaltview-v2.0/client/src/lib/genEngineRoomWiring.ts) as the shared client seam for room-level gen-engine calls, covering Blackboard capture enrichment and Dynamic Inner World resonance-link ranking.
- Extended `CaptureMetadata` in [client/src/components/Scaffold.tsx](/workspaces/gestaltview-v2.0/client/src/components/Scaffold.tsx) with optional `genEngine` metadata so saved captures can retain fusion/resonance results without changing the capture storage shape.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so saved captures are persisted immediately, then enriched in the background through `createCaptureSignal()` and `scoreResonance()`; high-resonance user bubbles get a subtle glow once the score returns.
- Updated [client/src/pages/DynamicInnerWorldPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/DynamicInnerWorldPage.tsx) and [client/src/components/ArtifactDeepView.tsx](/workspaces/gestaltview-v2.0/client/src/components/ArtifactDeepView.tsx) so opening an artifact inspector computes up to three advisory resonance links and clicking a link selects that related artifact.
- Added [client/src/tests/gen-engine-room-wiring.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/gen-engine-room-wiring.test.ts) for the new room-level gen-engine behavior.

## Validation performed

- `npm exec vitest run client/src/tests/gen-engine-room-wiring.test.ts client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/gen-engine.test.ts`
- `npm exec -- tsc --noEmit`
- `npm run build` (first run terminated at Vite chunk rendering with code 143; retry completed successfully)
- `git diff --check`

## Where we left off

- Blackboard and Dynamic Inner World now consume the gen-engine client without blocking room render, and both paths retain the local fallback behavior already built into `genEngineClient.ts`.
- The build still deletes tracked `dist/public/art` and `dist/public/audio` assets as a side effect; those unrelated deletions were restored after validation.

## Next slice

1. Continue with Slice 3: Sanctuary server persistence verification and repair for journals and scrapbook items.

---

# CurrentState — Sanctuary server persistence repair slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 3 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by verifying Sanctuary's existing journal/scrapbook hydration path and repairing the server persistence boundary so local client IDs are stored as `source_ref` instead of being written into UUID columns.

## Executive summary

- Verified [client/src/pages/SanctuaryPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SanctuaryPage.tsx) delegates persistence to [client/src/components/JournalEditor.tsx](/workspaces/gestaltview-v2.0/client/src/components/JournalEditor.tsx) and [client/src/components/ScrapbookPanel.tsx](/workspaces/gestaltview-v2.0/client/src/components/ScrapbookPanel.tsx), which already hydrate from the Sanctuary API when a user session exists.
- Updated [api/sanctuary/journal.ts](/workspaces/gestaltview-v2.0/api/sanctuary/journal.ts) so journal writes include `source_ref`, return `source_ref` as the client-facing `id`, and use the local journal id supplied by the client.
- Updated [api/sanctuary/scrapbook.ts](/workspaces/gestaltview-v2.0/api/sanctuary/scrapbook.ts) so scrapbook item writes use `source_ref`, uploaded files are resolved through `user_files.source_ref` before falling back to UUID id, and returned `fileId` values stay compatible with the client-local ids.
- Added [api/sanctuary/journals.ts](/workspaces/gestaltview-v2.0/api/sanctuary/journals.ts) as a plural route alias for the spec path without breaking the existing singular route used by the client.
- Added [supabase/migrations/20260526001000_add_sanctuary_source_refs.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260526001000_add_sanctuary_source_refs.sql) to add/populate `journals.source_ref`, `scrapbook_items.source_ref`, `scrapbook_items.source_file_ref`, and `scrapbook_items.updated_at`.
- Added [api/**tests**/sanctuary.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/sanctuary.test.ts) to guard the source-ref journal and scrapbook persistence behavior.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/sanctuary.test.ts`
- `npm exec vitest run client/src/tests/gen-engine-room-wiring.test.ts client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run build` attempted twice; both attempts terminated during Vite transform with code 143 before any compiler or application error was emitted.

## Where we left off

- Sanctuary journal and scrapbook server persistence now has a source-ref compatible path for client-local IDs and existing uploaded-file source refs.
- The migration must be applied before production scrapbook rows can store `source_ref` and `source_file_ref`.
- Full production build was not completed in this slice because both attempts hit the recurring environment-level code 143 termination during Vite transform; targeted API tests and typecheck passed.

## Next slice

1. Continue with Slice 4: Embodiment Heartbeat Layer.
2. If you want maximum deployment confidence before moving on, rerun `npm run build` in a less constrained shell or CI runner after applying the Sanctuary source-ref migration.

---

# CurrentState — DI runtime implementation

**Last updated:** 2026-05-25
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the shared DI adapter layer, the DI chat and health routes, the browser bridge, the runtime migration, and the living-memory enrichment loop that writes high-signal runtime memories back into the canonical embodiment JSON.

## Executive summary

- Added `shared/di/*` as a thin adapter over `shared/embodiment` so the DI runtime reuses the canonical profile registry instead of inventing a second identity model.
- Added `api/di.ts` and `api/di-health.ts` for the live runtime and health-check paths, backed by `api/_lib/diMemoryPipeline.ts` for session continuity and memory-event heuristics.
- Added `client/src/lib/diApi.ts` as the browser bridge that attaches a Supabase access token when one exists and normalizes the server response into the shared DI response shape.
- Added the `di_sessions` and `di_memory_events` migration plus the enrichment script that folds high-significance runtime events back into `embodiment_profiles/*.embodiment.json`.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/di-runtime.test.ts api/__tests__/di-memory-pipeline.test.ts api/__tests__/di-route.test.ts api/__tests__/di-health-route.test.ts api/__tests__/di-migration.test.ts api/__tests__/di-enrichment.test.ts`
- `npm run validate:embodiment`
- `npm run build`
- `git diff --check`

## Where we left off

- The DI runtime now has a canonical profile adapter, a real chat route, a health route, persistence for sessions and memory events, a browser bridge, and a scheduled/manual enrichment path back into the authored profile JSON.
- The next slice is UI consumption, if you want a room surface to call `sendDIMessage()` directly instead of keeping the bridge dormant for now.

---

# CurrentState — generative engine foundation slice

**Last updated:** 2026-05-22
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Introduced the shared gen-engine contract, local API route handlers, client fallback helpers, and the first Creation Corner wiring for `SPEC-GestaltView-Generative-Engine-v1.md`.

## Executive summary

- Added `shared/gen-engine/*` types and core helpers for capture fusion, resonance scoring, ambient scan, artifact synthesis, prediction, learning, and Lightning responses.
- Added `api/gen-engine/*` JSON route handlers plus shared request parsing and response plumbing.
- Added `client/src/lib/genEngineClient.ts` so the UI can call the new endpoints and fall back to deterministic local behavior when the API is unavailable.
- Updated `client/src/components/BlueprintGenerativeWorkbench.tsx` so Creation Corner now uses the shared output-family builder and resonance scoring helper.
- Fixed the `client/src/App.tsx` Blackboard Room import so it points at `client/src/pages/BlackboardRoomPage.tsx`.

## Validation performed

- `pnpm exec vitest run --config vitest.api.config.ts api/__tests__/gen-engine.test.ts`
- `pnpm exec tsc --noEmit`

## Where we left off

- The gen-engine foundation is wired and type-checked, but the full `pnpm run build` bundle step was still being cut off by the execution environment while Vite was rendering chunks.
- Next work should decide whether to keep tightening the shared gen-engine surface, wire the remaining room surfaces to the new endpoints, or split the Vite bundle verification into a lighter-weight path that can complete in this environment.

## Next slice

1. Wire the remaining room surfaces to the new gen-engine helpers where it is safe and useful.
2. Decide whether to pursue the full Vite bundle again or keep using targeted compile/test verification for the next slice.

---

# CurrentState — Heirloom Companion navigation canonicalization

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Cleaned the remaining public Heirloom Companion navigation surfaces so the canonical route and sitemap point at `/heirloom-companion` while the legacy alias stays live for compatibility.

## Executive summary

- Updated [client/src/pages/HeirloomCompanionPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/HeirloomCompanionPage.tsx) so the page now returns to `Exhibits` instead of sending the user through the older Alzheimer's Legacy alias.
- Updated [client/src/components/SubpageQuickNav.tsx](/workspaces/gestaltview-v2.0/client/src/components/SubpageQuickNav.tsx) so the quick-nav helper no longer treats `/alzheimers-legacy` as part of the exhibit-like canonical set.
- Updated [client/src/pages/gestaltview_sitemap.xml](/workspaces/gestaltview-v2.0/client/src/pages/gestaltview_sitemap.xml), [client/src/pages/gestaltview_sitemap.html](/workspaces/gestaltview-v2.0/client/src/pages/gestaltview_sitemap.html), and [client/src/pages/gestaltview_sitemap.txt](/workspaces/gestaltview-v2.0/client/src/pages/gestaltview_sitemap.txt) so the public sitemap now advertises the canonical Heirloom Companion route instead of the legacy alias.
- Kept the compatibility route itself live in [client/src/App.tsx](/workspaces/gestaltview-v2.0/client/src/App.tsx) so older inbound links still resolve.

## Validation performed

- `npm run build`
- `python3 scripts/generate_repo_manifest.py`
- `python3 skills/gestaltview-generate-wiki/scripts/collect_context.py --repo-path . --max-depth 10 --output docs/wiki/_context/context_pack.json`
- `git diff --check`

## Where we left off

- The canonical Heirloom Companion surface now points back to Exhibits, and the public sitemap no longer advertises the older alias as the primary continuity entry.
- The compatibility alias route still exists, so direct legacy links will continue to work.

## Next slice

1. If you want to keep retiring alias surfaces, the next sweep is the remaining `/alzheimers-legacy` mentions in exhibit data and related legacy routing helpers.
2. Otherwise the next live UI slice is back in Billy personality or markdown polish, or the trainer lane if you want to stay on the operational side.

---

# CurrentState — agent reference list priority refresh

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Reordered the Codex agent reference list so the continuity stack, Tuesday queue, and repo workflow docs are prioritized ahead of the deeper runtime/spec anchors, then refreshed the derived manifest/context snapshots after tightening the handoff note.

## Executive summary

- Updated [`.codex/Agents.md`](/workspaces/gestaltview-v2.0/.codex/Agents.md) and [`.agents/Agents.md`](/workspaces/gestaltview-v2.0/.agents/Agents.md) so the primary reference list now starts with `BrandVoice`, `CurrentState`, the continuity stack, the closeout packet, `voice_notes/Tuesday.md`, `README.md`, and `docs/Workflows.md`.
- Kept the runtime source files in the same reference chain, but moved them behind the active continuity surfaces so resumed sessions consult the live queue and handoff docs first.
- Refreshed [docs/gestaltview-v2.manifest.md](/workspaces/gestaltview-v2.0/docs/gestaltview-v2.manifest.md), [docs/gestaltview-v2.manifest.json](/workspaces/gestaltview-v2.0/docs/gestaltview-v2.manifest.json), and [docs/wiki/_context/context_pack.json](/workspaces/gestaltview-v2.0/docs/wiki/_context/context_pack.json) after the handoff note cleanup so the generated snapshots stayed in sync with the current tree.

## Validation performed

- `git diff --check`
- `python3 scripts/generate_repo_manifest.py`
- `python3 skills/gestaltview-generate-wiki/scripts/collect_context.py --repo-path . --max-depth 10 --output docs/wiki/_context/context_pack.json`

## Where we left off

- The agent reference list now mirrors the repo's current resumable workflow instead of burying the live continuity surfaces under the deeper spec references.

## Next slice

1. If you want the same priority model mirrored elsewhere, the next move is any other agent-facing reference surface you want to keep in sync.
2. Otherwise we can keep tightening the continuity and handoff docs or return to the runtime slice that was in flight before this doc pass.

---

# CurrentState — root spec room-slice implementation

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented the first live slices from `specs/root/Technical_Spec.md` and `specs/root/SPEC-BrandVoice_Integration_&_Babylon.js_Restoration.md`: Blackboard Room now shows a live session timer and a blueprint review drawer, and Dynamic Inner World now supports search, type, tag, and recency filtering on the artifact hall.

## Executive summary

- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the top bar now shows the session timer and the export flow opens a preview drawer with markdown copy, file download, and Creation Corner handoff actions.
- Updated [client/src/pages/DynamicInnerWorldPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/DynamicInnerWorldPage.tsx) so the artifact hall can be searched and narrowed by type chips, tag chips, and recency sort instead of forcing a flat all-items list.
- Kept the existing BabylonAtmosphere, DI presence, and BrandVoice-aligned surfaces intact where they were already wired correctly.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard export now packages through a review drawer instead of a one-button send, which better matches the spec’s drawer workflow.
- Dynamic Inner World can now be narrowed by search, type, tags, and sort mode, but the broader immersive surface polish can still go further if you want to keep pushing this root spec lane.

## Next slice

1. Continue the Blackboard message/filter/export refinements if you want to keep tightening the room workflow.
2. Otherwise the next move is whichever adjacent spec slice you want to pull forward next.

---

# CurrentState — Creation Corner generative workbench enhancement

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Promoted Creation Corner from a static previewer into a live generative workbench with editable draft fields, explicit output-family selection, draft materialization, copy/download actions, and room routing for the active blueprint.

## Executive summary

- Added [client/src/components/BlueprintGenerativeWorkbench.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintGenerativeWorkbench.tsx) so Creation Corner can now refine a working blueprint in place instead of only showing the stored preview text.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) to mount the new generative workbench while keeping the blueprint library and remote hydration flow intact.
- Exposed the blueprint output families directly in the workbench, including markdown, HTML, PDF HTML, code, agent prompt, image prompt, marketing copy, share card, and a JSON view of the live draft.
- Kept the existing room-routing path so the current working blueprint can still be sent to Blackboard, Dynamic Inner World, or External Scaffold after refinement.

## Validation performed

- `npm run build`

## Where we left off

- Creation Corner now behaves like a live drafting surface, but the surrounding copy and adjacent room surfaces can still be tuned further if you want the generative lane to feel even more explicit.

## Next slice

1. Tighten any Creation Corner copy or affordances you want to feel more intentionally generative.
2. Otherwise the next spec slice can move back to whichever room workflow is highest priority.

---

# CurrentState — Blackboard room single-window capture simplification

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Collapsed Blackboard Room to one visible capture window nested in the chat rail, corrected the room-facing embodiment count to the real 24-profile registry, and slowed the blackboard Babylon motion so the room feels less busy.

## Executive summary

- Updated [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) so the chat rail now owns the capture input, voice, upload, and suggestion flow in one place.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the page routes captures through the chat lane, keeps the export drawer intact, and shows the real embodiment registry count instead of implying the room only has six profiles.
- Tuned [client/src/components/BabylonAtmosphere.tsx](/workspaces/gestaltview-v2.0/client/src/components/BabylonAtmosphere.tsx) so blackboard mode is calmer, with lower particle density and reduced rotational swing.
- Kept the session transcript, blueprint export, and Creation Corner handoff path intact while reducing the number of separate capture surfaces in view.

## Validation performed

- `npm run build`

## Where we left off

- Blackboard Room is now less visually busy and the capture path is centralized in the chat rail, but any further room chrome tightening can still be done if you want to keep pushing the polish.

## Next slice

1. Keep trimming Blackboard Room chrome if you want it even quieter.
2. Otherwise move to the next adjacent runtime/spec slice that needs attention.

---

# CurrentState — embodiment registry realignment and drift guard

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Restored the missing `founder-studio-sample` profile into the generated embodiment registry, repaired the `groq-embodiment-expert` profile metadata so validation passes, and added a runtime test that keeps the on-disk profile files aligned with `getAllEmbodimentProfiles()`.

## Executive summary

- Updated [embodiment_profiles/groq-embodiment-expert.embodiment.json](/workspaces/gestaltview-v2.0/embodiment_profiles/groq-embodiment-expert.embodiment.json) so the profile now carries the required `originNarrative` and `metaphorFamily` fields.
- Added [client/src/tests/embodiment-runtime.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/embodiment-runtime.test.ts) so the registry cannot silently drift away from the 24 source profiles on disk again.
- Regenerated [shared/embodiment/generated.ts](/workspaces/gestaltview-v2.0/shared/embodiment/generated.ts) from the source profile files so the runtime registry now exposes all 24 profiles, including `founder-studio-sample`.

## Validation performed

- `node scripts/validate-embodiment-profiles.mjs`

## Where we left off

- The embodiment registry is back in sync with the source files, and the new test should catch missing-profile regressions before they reach the room surfaces.

## Next slice

1. Keep this validation path in place when new profiles are added or edited.
2. Otherwise move to the next spec slice with the same enhancement-first, no-regression standard.

---

# CurrentState — MusicalDNA env normalization and handoff refresh

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Normalized the MusicalDNA Spotify env names in the repo env files, wired the Vite build to expose the canonical `VITE_SPOTIFY_*` values, and recorded the stop point for today.

## Executive summary

- Renamed the MusicalDNA Spotify env entries in `.env.vercel` to `VITE_SPOTIFY_CLIENT_ID` and `VITE_SPOTIFY_REDIRECT_URI`.
- Added `VITE_SPOTIFY_REDIRECT_URI` to `.env.local` so the local Spotify callback is explicit instead of implied.
- Simplified `client/src/lib/spotify.ts` back to the canonical VITE env names, while `vite.config.ts` now bridges the repo env files into the client build.
- Kept the build green after the rename.

## Validation performed

- `npm run build`

## Remaining risks / next steps

1. If the deployed Vercel environment variables are managed outside the repo, mirror the same `VITE_SPOTIFY_*` names there so the runtime and repo stay aligned.
2. MusicalDNA auth still depends on the registered Spotify redirect URI matching the value in the provider dashboard.

## Where we left off

- MusicalDNA now reads its Spotify client ID and callback URL from the canonical `VITE_SPOTIFY_*` names.
- The repo build is green after the env normalization.
- No other code slice is queued today.

## Next slice

1. If you come back to MusicalDNA next, verify the Spotify connect flow against the live Vercel deployment and callback registration.
2. Otherwise the current room/layout pass is complete and ready to pick up from this handoff.

---

# CurrentState — user-content schema foundation for Sanctuary and room exports

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the shared user-content database foundation in a single Supabase migration so the Sanctuary, Creation Corner, Dynamic Inner World, and External Scaffold surfaces can point at the same persisted tables later.

## Executive summary

- Added `supabase/migrations/20260519000000_add_user_content_tables.sql`.
- The migration creates `journals`, `scrapbook_items`, `blueprints`, `inner_world_artifacts`, `insights`, and `user_preferences` with RLS and ownership policies.
- Added updated-at triggers where the schema expects mutable rows.
- Kept the app build green after the schema pass.

## Validation performed

- `npm run build`

## Where we left off

- The repo now has the missing user-content schema foundation the room surfaces were waiting on.
- Sanctuary, Creation Corner, Dynamic Inner World, and External Scaffold still use their current local-first behavior in the UI, so the next slice is to wire those surfaces to the new tables and API path.

## Next slice

1. Wire the Sanctuary journal and scrapbook surfaces to the new `journals` and `scrapbook_items` tables.
2. Then connect the remaining room-export surfaces to `blueprints`, `inner_world_artifacts`, and `insights` as needed.

---

# CurrentState — Creation Corner blueprint persistence wiring

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Wired Creation Corner blueprints to the new persisted table while keeping the existing local-first fallback behavior in place.

## Executive summary

- Added `client/src/lib/creationCornerContent.ts` for the Creation Corner API contract.
- Added `api/creation-corner/blueprints.ts` so Creation Corner can read and write `blueprints` through the existing authenticated API pattern.
- Updated `client/src/components/Scaffold.tsx` so blueprint writes now sync to the server as a best-effort side effect while preserving the local room flow.
- Updated `client/src/pages/CreationCornerPage.tsx` to hydrate from the server when a session is available, with local storage fallback if the server is unavailable.
- Fixed the blueprint table status contract so the live `draft` / `ready` / `exported` runtime values are accepted.

## Validation performed

- `npm run build`

## Where we left off

- Creation Corner now persists blueprint cards instead of treating them as local-only surfaces.
- The local room store still acts as a fallback if the server is unavailable, so the user does not lose visible blueprint state during an interrupted sync.

## Next slice

1. Connect the remaining room-export surfaces to `inner_world_artifacts` and `insights` as needed.
2. Then decide whether archive state should also move server-side.

---

# CurrentState — Dynamic Inner World and External Scaffold room-export persistence

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Wired the remaining room-export surfaces to server-backed storage with a `source_ref` contract so the local prefixed IDs can keep working while the database stores stable rows.

## Executive summary

- Added `supabase/migrations/20260519020000_add_source_refs_to_inner_world_and_insights.sql` to give `user_files`, `inner_world_artifacts`, and `insights` a server-safe `source_ref` path plus the new archived-insight payload columns.
- Updated `api/_lib/inner-world.ts` and the `api/inner-world/*` routes so file and artifact persistence use `source_ref` instead of trying to upsert the prefixed client IDs into UUID columns.
- Added `api/insights.ts` and `client/src/lib/insightsContent.ts` so External Scaffold can archive orbs into the shared `insights` store and hydrate them back later.
- Updated `client/src/pages/DynamicInnerWorldPage.tsx` to hydrate from the server when authenticated and to archive locally plus server-side in one pass.
- Updated `client/src/pages/ExternalScaffoldPage.tsx` to hydrate archived orbs from `insights`, keep the local fallback, and persist new archives as best effort.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Dynamic Inner World now has a real server-backed file/artifact path that still preserves the local prefixed IDs the UI already uses.
- External Scaffold archives now land in `insights`, and the page can restore them from the server after login.
- The earlier Creation Corner and Sanctuary persistence slices are still in place; this pass focused on the room-export surfaces that were still local-only.

## Next slice

1. If you want to keep tightening persistence, align any remaining earlier slices that still depend on the older direct-ID route contract with the same `source_ref` pattern.
2. If the archived Dynamic Inner World cards should also survive a reload independent of local storage, add the same archive/status pattern there next.

---

# CurrentState — Blackboard room and capture bar visual polish

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Made the Blackboard Room feel less plain by adding the atmospheric room chrome, the reusable capture lane treatment, and the live companion rail.

## Executive summary

- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) to use the aurora backdrop, room identity header, richer transcript bubbles, a larger capture lane, and a right-rail companion panel.
- Restyled [client/src/components/capture/UniversalCaptureBar.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/UniversalCaptureBar.tsx) so the reusable capture control no longer reads like a plain textarea block.
- Mounted the capture companion surface through [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) so the room now shows the DI lane instead of leaving that experience hidden.
- Kept the existing capture and upload behaviors intact while moving the upload shortcut into the reusable bar itself.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room now has a stronger visual hierarchy and a real companion rail, so it no longer feels like a flat textarea page.
- The capture lane is now the reusable styled component, which should make any other room using it feel more intentional too.

## Next slice

1. If any other room still feels too flat, apply the same room-shell treatment and capture-lane styling there.
2. If you want the Blackboard companion rail to be even more editorial, the next pass can tune its spacing and storytelling without changing the underlying interaction model.

---

# CurrentState — Blackboard identity strip and Creation Corner voice cleanup

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added persona-colored blackboard identity metadata and a roundtable selector, removed the visible capture-window language from the companion rail, and swapped the Creation Corner intro/header block for the Art Teacher voice.

## Executive summary

- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the room now opens from a clickable identity strip, supports a roundtable mode, and renders DI replies with per-persona attribution and color.
- Updated [client/src/components/RoomIdentityHeader.tsx](/workspaces/gestaltview-v2.0/client/src/components/RoomIdentityHeader.tsx) and [client/src/data/personas.ts](/workspaces/gestaltview-v2.0/client/src/data/personas.ts) so each persona carries an aurora color and the strip can display the archetype line the spec called for.
- Cleaned up [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) so the visible copy no longer says capture window, room context, or pending queue.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) and [client/src/components/BlueprintLibrary.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintLibrary.tsx) so the page now leads with Art Teacher voice and the visible `Blueprint Library` header is gone.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room now has a persona-aware header strip and a proper single-voice / roundtable selector, but the broader room stack still has older surfaces that could be tuned to the same tone.
- Creation Corner is now speaking in the room voice instead of a generic header block, and the remaining empty-state treatment can still be tightened if you want it even quieter.

## Next slice

1. Continue the room-language cleanup on the remaining surfaces that still speak in older instructional copy.
2. If you want to move from tone cleanup into functionality, the next concrete slice is the mass-exodus export flow in Profile and Settings.

## Executive summary

- Updated [supabase/migrations/20260519000000_add_user_content_tables.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260519000000_add_user_content_tables.sql) so it backfills `blueprint_id` and `status` onto the already-existing `inner_world_artifacts` table instead of assuming a fresh create.
- Updated [supabase/migrations/20260519010000_fix_blueprints_schema.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260519010000_fix_blueprints_schema.sql) so `blueprints_status_check` is only added when it does not already exist.
- Kept `blueprints` on the direct app-facing `draft`/`ready`/`exported` contract with `updated_at` from the start so Creation Corner no longer depends on the follow-up schema fix just to remain usable.
- Preserved the later `blueprints` and `insights` fix migrations as compatibility backfills, but they now land on a schema that can actually progress past the first user-content migration.

## Validation performed

- Not rerun yet after this migration-only patch.

## Where we left off

- The user-content migration chain should now be able to move past the old inner-world table shape instead of failing on `blueprint_id`, missing `blueprints` / `insights` relations, or an already-existing `blueprints_status_check`.

## Next slice

1. Re-run the migration chain or the relevant Supabase SQL file set to confirm the schema now advances cleanly.
2. If any room-export queries still complain, inspect the next missing column directly instead of assuming the base table create step ran.

---

# CurrentState — user-content migration compatibility fix

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed the user-content migration chain so it can run against the existing inner-world schema without tripping over the preexisting `inner_world_artifacts` table, and made the blueprints status constraint add step idempotent.

---

# CurrentState — mass-exodus export flow in Profile and Settings

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the client-side export bundle for Profile and Settings so the runtime can package the current journals, scrapbook, blueprints, artifacts, insights, profile snapshot, settings snapshot, and an `index.md` into a downloadable ZIP.

## Executive summary

- Added [client/src/lib/massExodus.ts](/workspaces/gestaltview-v2.0/client/src/lib/massExodus.ts) to assemble a ZIP with the spec-required `journals`, `scrapbook`, `blueprints`, `artifacts`, `insights`, and root `index.md` folders/files, using the existing local storage and authenticated server-backed records where available.
- Added [client/src/components/MassExodusButton.tsx](/workspaces/gestaltview-v2.0/client/src/components/MassExodusButton.tsx) so the export action is reusable from both surfaces and can show a short busy state while the archive is being built.
- Wired [client/src/pages/ProfilePage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ProfilePage.tsx) and [client/src/pages/SettingsPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SettingsPage.tsx) to show the new `Export everything` button directly in the live page chrome.
- Kept the export flow client-side, with local-storage fallback, authenticated hydration where already available, and no queueing step.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Profile and Settings now expose the mass-exodus export action in the actual app shell, and the archive includes the live room data the spec asked for plus profile/settings snapshots.
- The export bundle is intentionally JSON/markdown-based so the files can be read without a GestaltView account.

## Next slice

1. Continue the remaining legacy language scrub on the non-nav surfaces that still carry older GestaltView phrasing.
2. If you want to extend the export pass instead, the next refinement would be adding per-folder markdown summaries or more detailed attachment materialization.

---

# CurrentState — Memory Continuity naming pass and Heirloom Companion canonicalization

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Renamed the remaining continuity-family surfaces to Memory Continuity, pointed the visible CTAs and metadata at Heirloom Companion, and scrubbed the older module wording from the live UI and supporting docs.

## Executive summary

- Renamed the visible continuity labels in the live module surfaces so they now read `Memory Continuity` instead of the older legacy label.
- Canonicalized the continuity-facing links and SEO metadata to `/heirloom-companion` so the route language matches the product surface.
- Updated the shared module registry, exhibit metadata, and room-copy surfaces so the continuity family speaks with one consistent label set.
- Aligned the platform ground-truth glossary and module list with the live wording.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- The continuity family is now presented as Memory Continuity in the live surfaces, with Heirloom Companion as the canonical route target.
- The old alias route still exists for compatibility, but the visible CTAs and registry entries now point to the continuity surface.

## Next slice

1. Continue the broader non-live doc and snapshot scrub if you want the historical references normalized too.
2. If you want to move back to feature work, the next sensible slice is the remaining non-nav room-surface polish.

---

# CurrentState — manifest and wiki context snapshot refresh

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Regenerated the derived manifest and wiki context snapshots after the Memory Continuity / Heirloom Companion naming pass so the repo-wide documentation artifacts stay aligned with the current live tree.

## Executive summary

- Regenerated [docs/gestaltview-v2.manifest.md](/workspaces/gestaltview-v2.0/docs/gestaltview-v2.manifest.md), [docs/gestaltview-v2.manifest.json](/workspaces/gestaltview-v2.0/docs/gestaltview-v2.manifest.json), and [docs/wiki/_context/context_pack.json](/workspaces/gestaltview-v2.0/docs/wiki/_context/context_pack.json).
- Kept the compatibility route aliases in the generated snapshots because the live app still exposes those routes in `client/src/App.tsx`.
- Aligned the generated docs with the latest `CurrentState` and platform-ground-truth updates so the snapshot layer no longer lags the current naming pass.

## Validation performed

- `python3 scripts/generate_repo_manifest.py`
- `python3 skills/gestaltview-generate-wiki/scripts/collect_context.py --repo-path . --max-depth 10 --output docs/wiki/_context/context_pack.json`
- `git diff --check`

## Where we left off

- The manifest and context-pack snapshots are current again, and the live compatibility aliases are still reflected because they remain part of the route table.

## Next slice

1. If you want the generated snapshots to stop listing the compatibility aliases, the next move is to retire or hide those routes in `client/src/App.tsx`.
2. Otherwise, the next sensible slice is back in live UI or trainer work.

---

# CurrentState — embodiment expert trainer simplification and registry sync

**Last updated:** 2026-05-18
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the new `groq-embodiment-expert` profile to the shared embodiment registry, routed the Agent Trainer compiler assistant through the new Embodiment Expert persona, simplified the trainer flow chrome, and aligned the shared embodiment types with the live profile corpus.

## Executive summary

- Added `embodiment_profiles/groq-embodiment-expert.embodiment.json` as a schema-complete embodiment profile for profile synthesis, drift review, and derived artifact guidance.
- Regenerated `shared/embodiment/generated.ts` so the new profile is part of the live registry and trainer option set.
- Added the `embodiment-expert` trainer persona lane and pointed `client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx` at it so the compiler assistant now reads like an embodiment specialist instead of a generic trainer helper.
- Simplified `client/src/features/agent-trainer/AgentTrainerPage.tsx` by compressing the flow strip into pills and tightening the page language toward a workbench rather than a dashboard.
- Loosened the shared embodiment types to match the actual corpus, including optional origin narrative / metaphor family fields and top-level `domain`, so the registry can type-check against the real profile shapes.

## Validation performed

- `node scripts/build-embodiment-artifacts.mjs`
- `npm run build`

## Remaining risks / next steps

1. The trainer surface is quieter now, but additional section consolidation can still be done later if you want the page reduced further.
2. The Spotify playlist integration work is still separate from this slice and can resume in a later pass.
3. The new expert profile is now in the registry, but any future profile corpus additions should be checked against the shared embodiment types before regeneration.

## Where we left off

- The trainer now has a dedicated Embodiment Expert persona lane, and the compiler panel is using that lane to summarize embodiment profiles and derived artifact targets.
- The new `groq-embodiment-expert` profile is in the source corpus and the generated registry, so it is available to the shared runtime and the trainer selector.
- The trainer page chrome is simplified, but the broader trainer control plane still exists behind it for run management, governance, and advanced review flows.
- The build is green after the registry/type alignment pass, so the current codebase state is stable enough for the next slice.

## Next slice

1. Finish the Spotify playlist import flow in Musical DNA if you want that integration completed next.
2. Continue trimming the trainer surface only if you want the control plane compressed further.
3. Keep future embodiment profile additions aligned with `shared/embodiment/types.ts` before regenerating `shared/embodiment/generated.ts`.

---

---

# CurrentState — continuity stack for onboarding, handoff, memory, and embodiment sync

**Last updated:** 2026-05-17
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added a canonical continuity stack doc, tightened the session handoff and context-persistence docs around that stack, and pointed the repo onboarding/workflow skills at the same route so new sessions have one consistent path in.

## Executive summary

- Added `docs/ContinuityStack.md` as the canonical route for state, handoff, onboarding, and embodiment sync.
- Tightened `docs/SessionHandoffPacket.md`, `docs/ContextPersistenceChecklist.md`, `docs/ContextPersistenceProtocol.md`, and `docs/Workflows.md` so they all point at the same continuity spine.
- Updated the repo onboarding, workflow operations, current-state maintenance, cross-repo workflows, and architecture skills to read the continuity stack first.
- Added `docs/embodiment/EMBODIMENT_COLLABORATOR_PACKAGE.md` as the embodiment-specific collaborator package guide and linked it to the existing onboarding packet.

## Validation performed

- `git diff --check`

## Remaining risks / next steps

1. The continuity stack is now documented, but the next improvement would be to thread `docs/ContinuityStack.md` into any external package export or automation that hands work to outside assistants.
2. If you want a truly single-entry onboarding flow, the next pass can add a short root-level `CONTRIBUTING_CONTINUITY.md` or a direct index note that points to the stack.

---

---

# CurrentState — operator auth aligned to the magic-link session flow

**Last updated:** 2026-05-17
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Removed the browser's hard dependency on the old Supabase password login path, made `/login` send a magic link to the allowlisted founder email(s), and restored `/auth/callback` to sync the browser Supabase session into the app cookie.

## Executive summary

- The active operator login path is now the Supabase magic-link flow plus the server-session cookie handoff handled by `/api/login`, `/api/auth/supabase/session`, and the client `/auth/callback` route.
- The `/login` page now sends a one-time link to the founder/admin email instead of asking for a password hash or secret phrase.
- The `/auth/callback` route now syncs the Supabase browser session into the app cookie and then returns to the requested in-app target.
- The architecture and Vercel environment docs now describe Supabase as persistence/backbone infrastructure plus a narrow auth delivery path rather than the old password gate.

## Validation performed

- `npm run build`

---

---

# CurrentState — continuity checker and collaborator zip refresh

**Last updated:** 2026-05-17
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Collapsed the handoff/continuity overlap, added a lightweight continuity validation script, rebuilt the collaborator zip so the exported bundle matches the current stack, and added a dedicated `artifacts/` home plus packaging command for the handoff archive.

## Executive summary

- Added `scripts/validate-continuity-stack.mjs` and exposed it as `npm run continuity:check`.
- Collapsed the continuity docs so `docs/ContinuityStack.md` routes context and `docs/SessionHandoffPacket.md` owns the exact restart form.
- Rebuilt `embodiment-collaborator-package-v5.zip` from the updated packet, docs, skills, and embodiment surfaces, then copied it into `artifacts/embodiment-collaborator-package-v5.zip`.
- Marked `artifacts/` as the default home for handoff bundles in the root README and the collaborator packet README.
- Added `artifacts/latest.zip` as the stable alias for the newest collaborator handoff bundle.
- Added `npm run package:collaborator` so the archive and alias can be refreshed in one step.

## Validation performed

- `npm run continuity:check`
- `git diff --check`

---

---

# CurrentState — embodiment sync defaults and room clarity pass

**Last updated:** 2026-05-17
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Hardened the embodiment sync script so legacy profiles get conservative defaults for the new runtime metadata, added a compact room identity header, removed Blackboard destination-wall clutter, converted Creation Corner to an intent-first flow, and removed Inner World surface relocation controls.

## Executive summary

- Added `client/src/components/RoomIdentityHeader.tsx` and threaded it through Blackboard, Creation Corner, Dynamic Inner World, and Sanctuary so each room now has a compact name/purpose/DI strip.
- Simplified the Blackboard capture surface so the chat prompt is neutral, the noisy quick prompts are gone, and destination surface selection is no longer a visible pre-capture choice.
- Reframed Creation Corner around a single intent field plus optional brainstorm mode, then moved export-format picking into a secondary details section.
- Removed the Inner World relocation picker from the inspector and replaced it with read-only placement guidance.
- Updated `scripts/sync-embodiment-profiles.ts` to derive conservative defaults for the new profile metadata when legacy profiles do not yet carry it, while still surfacing the drift as warnings.

## Validation performed

- `./node_modules/.bin/tsc --noEmit`
- `npm run build`
- `npm run sync-profiles -- --dry-run`

---

# CurrentState — OAuth callback alignment and anonymous rate-limit tightening

**Last updated:** 2026-05-16
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Aligned the lingering OAuth helper to the current `/auth/callback` flow and lowered anonymous Billy limits so the UI and backend now push visitors toward sign-in more clearly.

## Executive summary

- Added `/auth/consent` as an alias to the existing sign-in flow, and added `/auth/consent/auth/callback` as a harmless callback alias so the auth URLs you shared now resolve inside the app.
- Updated the stale client login helper in `client/src/const.ts` to use `/auth/callback` instead of the legacy `/api/oauth/callback` path.
- Lowered anonymous Billy limits from 3 to 2 across the session state, browser session hooks, and backend rate-limit defaults.
- Tightened the upgrade/banner copy so the demo ceiling is clearer and the sign-in path is more visible.
- Clarified the sign-in and signup copy so GitHub is explicitly described as the only configured OAuth provider.

## Validation performed

- `git diff --check`

---

---

# CurrentState — email/password signup and invite-only magic-link auth

**Last updated:** 2026-05-16
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added email/password signup and sign-in, kept GitHub OAuth available, and routed invite-only magic links through the shared `/auth/callback` session handoff.

## Executive summary

- Added email/password account creation on the signup page and email/password sign-in on the login page.
- Kept GitHub OAuth as a supported path, but clarified that magic links are invite-only and only sent to allowlisted addresses.
- Updated the auth callback so it handles both OAuth transactions and browser-created Supabase sessions before minting the app cookie.
- Aligned the new auth helpers with the existing app session flow so redirect targets remain stable across signup, login, and verification links.

## Validation performed

- `git diff --check`
- `npm run build`

---

---

# CurrentState — embodiment registry inventory and validation scaffolding

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the SPEC-2 Slice 1 inventory docs for the embodiment registry, added a standalone registry validator and package scripts for generation/validation, and regenerated the embodiment artifact so the source registry and generated registry are aligned again.

## Executive summary (2026-05-09)

- Added documentation-only inventory files under `docs/embodiment/` to capture the current profile registry, the runtime gap matrix, the implementation plan, and the open questions for the next slices.
- Added `scripts/validate-embodiment-profiles.mjs` plus `generate:embodiment` and `validate:embodiment` package scripts so the registry can be checked for slug drift, duplicates, required fields, and source/generated mismatches.
- Regenerated `shared/embodiment/generated.ts` from the existing generator so `the-recursive-builder` now appears in the generated registry alongside the source profiles.

## Validation performed

- `npm run validate:embodiment`
- `npm run generate:embodiment`
- `npm run build` attempted, but it surfaced pre-existing TypeScript errors outside this slice

## Remaining risks / next steps

1. Runtime consumers still do not use the new validation posture directly; the registry is now harder to drift, but no runtime integration changed in this slice.
2. The next SPEC slice can safely introduce room-aware digital intelligence once the registry hardening is stable and the intended runtime touchpoints are chosen.
3. The repo still has unrelated TypeScript build failures in existing code paths, so the new registry work should be treated as validated independently of the current `npm run build` result.

---

# CurrentState — Digital Intelligence Academy profile browser wiring

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Replaced the Academy placeholder lane with a real, public-safe embodiment profile browser driven by the new client embodiment runtime adapter and shared embodiment UI components.

## Executive summary (2026-05-09)

- Rebuilt `client/src/pages/DigitalIntelligenceAcademyPage.tsx` so the Academy now renders live embodiment profiles from the shared registry.
- Added status filters, search by name/slug/archetype, profile cards, private interior protection signaling, and readiness-score display when present.
- Filtered founder-only profiles out of signed-in non-admin views while keeping the display free of raw private memory content and mutation controls.

## Validation performed

- `npm run build` attempted, but it still fails on pre-existing TypeScript errors outside this slice
- `git diff --check`

## Remaining risks / next steps

1. The repo still has unrelated TypeScript drift in `client/src/components/BucketDrops.tsx` and the embodiment shared contract path.
2. The next spec slice can reuse the new Academy browser as the display surface for Agent Trainer embodiment views.

---

# CurrentState — Agent Trainer embodiment profile display wiring

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Surfaced live embodiment metadata inside the Agent Trainer page so profile selection now shows badge, capability summary, governance state, boundary note, and readiness context instead of only the slug-level selector.

## Executive summary (2026-05-09)

- Updated `client/src/features/agent-trainer/AgentTrainerPage.tsx` to resolve the selected embodiment profile through the new runtime adapter.
- Added profile badge, capability summary, visibility state, governance status, boundary note, and readiness display to the selected embodiment panel.
- Kept the training run schema untouched.

## Validation performed

- `npm run build` attempted, but it still fails on pre-existing TypeScript errors outside this slice
- `git diff --check`

## Remaining risks / next steps

1. The repo still has unrelated TypeScript drift in `client/src/components/BucketDrops.tsx` and the shared embodiment type path.
2. The next SPEC slice can now reuse the Trainer display pattern as the basis for room-aware Billy prompting and related runtime surfaces.

---

# CurrentState — Billy room-aware prompting wiring

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Threaded room context through Billy's shared runtime prompt builder, API route, and live client entry points so room-aware embodiment prompts are selected when the UI knows which room is active.

## Executive summary (2026-05-09)

- Extended `shared/billy/runtime.ts` so the Billy runtime prompt builder can accept an optional room slug and route into the room-aware embodiment prompt helper when room context is available.
- Updated `api/billy.ts` to parse `roomSlug` from the request body and include it in Billy session metadata.
- Updated `client/src/components/Billy.tsx` and `client/src/components/BillyLive.tsx` to infer room slugs from section or pathname context and forward them into the Billy API calls.

## Validation performed

- `git diff --check`
- `npm run build` attempted; it now fails only on the pre-existing unrelated `client/src/components/BucketDrops.tsx` TypeScript error

## Remaining risks / next steps

1. The generic exhibit and voice-studio surfaces still use Billy without a strong room signal, so they will remain on the default embodiment prompt until a reliable room context is available.
2. The next spec slice can build on this plumbing if more Billy surfaces need room-specific prompt selection.
3. The remaining build failure is outside this slice and can be handled separately if you want the repo back to a fully green `tsc`.

---

# CurrentState — embodiment persistence and mutation proposal path

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the Slice 11 persistence migration for embodiment mutation proposals, review logging, and readiness scores, plus a client-side persistence adapter with Supabase-backed remote writes and local fallback storage.

## Executive summary (2026-05-09)

- Added `supabase/migrations/20260509000000_embodiment_governance_persistence.sql` with the `embodiment_mutation_proposals`, `embodiment_review_log`, and `embodiment_readiness_scores` tables, indexes, and RLS policies.
- Added `client/src/lib/embodimentPersistence.ts` as an optional persistence adapter that can write to Supabase when configured and fall back to local storage when it is not.
- Kept first render independent of Supabase availability.

## Validation performed

- `git diff --check`
- `npm run build`
- `supabase db diff` was attempted but the `supabase` CLI is not installed in this workspace

## Remaining risks / next steps

1. The new persistence adapter is not yet wired into the trainer UI, so it is ready for consumption but not surfaced in a visible flow yet.
2. The Supabase migration should be reviewed in a real database environment before applying it to production.

---

# CurrentState — build cleanup for embodiment-heavy runtime surfaces

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Removed the active Babylon-heavy render path from the main bundle graph, pruned the now-orphaned `client/src/babylon/` scene modules, and kept the production build clean in this environment.

## Executive summary (2026-05-09)

- Replaced the Babylon-backed hero, consciousness, sanctuary, scroll artifact, and DNA visualizer implementations with lightweight SVG/canvas renderers that preserve the UI surfaces without dragging the 3D engine into the build.
- Simplified the timeline and sanctuary surfaces so they keep their content and controls while avoiding the expensive Babylon dependency chain.
- Deleted the orphaned Babylon scene helper folder under `client/src/babylon/` after confirming nothing in the active app imports it anymore.
- Kept the embodiment persistence and Billy room-aware work intact.

## Validation performed

- `git diff --check`
- `npm run build`

## Remaining risks / next steps

1. The next SPEC slice can proceed from the now-green build baseline without carrying the earlier chunking and font warnings forward.
2. If you want a tighter cleanup pass later, the remaining inactive references can be audited for any further dead code outside the client Babylon surface.

---

# CurrentState — Billy platform embodiment and founder runtime dashboard wiring

**Last updated:** 2026-05-06
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Created a shared Billy runtime guide, taught the Billy system prompt and first-contact surfaces the live workflow spine, redirected the public welcome path to orientation first, exposed the runtime environment from the founder dashboard and top nav, and added a dedicated founder-runtime landing page plus Billy readiness gating.

## Executive summary (2026-05-06)

- Added `client/src/lib/billy-runtime-guide.ts` as the shared source of truth for Billy's workflow spine, platform embodiment language, tour steps, greeting lines, and live ability set.
- Updated `client/src/lib/billy-system-prompt.ts` so Billy is prompted as the live platform embodiment, not just a retrieval or curation layer.
- Updated the public-facing orientation, home, and welcome surfaces so the first-user path now starts with orientation and uses the live room flow as the primary explanation.
- Added `client/src/pages/FounderRuntimePage.tsx` as a dedicated founder-runtime landing page in front of the dashboard shell.
- Updated `client/src/pages/DashboardPage.tsx` and `client/src/components/TopNav.tsx` so the founder/admin surface and nav expose the live runtime environment more directly.
- Added a shared Billy readiness hook plus `client/src/lib/billy-runtime-guide.ts` verification so first-contact greeting/tour only starts after the runtime guide has been loaded and checked.

## Validation performed

- `npm run build`

## Remaining risks / next steps

1. The founder dashboard is still the deeper admin shell; if you want a more opinionated founder command center, that would be a separate UI pass on top of the new landing page.
2. The Billy readiness gate currently uses the shared guide verification plus localStorage persistence. If you want server-backed or account-scoped readiness, that would need a persistence change.

---

# CurrentState — Shared Billy onboarding + room-surface doc alignment

**Last updated:** 2026-05-05
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Centralized the Billy onboarding walkthrough into one shared component, wired it into Sanctuary, Welcome, and Dynamic Inner World, and updated the room-surface docs to reflect the current platform shape.

## Executive summary (2026-05-05)

- Added `client/src/components/BillyWalkthrough.tsx` as the shared optional onboarding card for new users and curious visitors.
- Wired the shared walkthrough into `client/src/pages/Welcome.tsx`, `client/src/pages/SanctuaryPage.tsx`, and `client/src/pages/DynamicInnerWorldPage.tsx`.
- Updated the canonical platform doctrine and directory map so the room-based workflow is documented alongside the older platform/module framing.
- Kept the room, scaffold, and capture flow build-safe after the onboarding reuse pass.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The Billy walkthrough is now shared, but if you want a dedicated first-run modal or route, that should be implemented as a separate onboarding surface rather than layering more state into the card itself.
2. If you want the New Year variant to appear automatically, we should add a simple seasonal selector or query-param toggle so the theme can switch without code edits.

---

# CurrentState — Signup/login billing bridge alignment

**Last updated:** 2026-05-05
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Connected the signup and login surfaces to the live pricing structure, added a shared billing-plan helper, added a subscription-framework readiness note, and updated the surface docs to describe signup as a billing bridge and login as the operator gate.

## Executive summary (2026-05-05)

- Added `client/src/lib/billing.ts` so pricing-page links and auth-surface copy can point at the same Core / Pro / Enterprise plan model.
- Updated `client/src/pages/Signup.tsx` to route visitors into the real checkout surface instead of implying a separate account-creation backend.
- Updated `client/src/pages/SignIn.tsx` to position login as the operator surface and point new visitors back to pricing/signup.
- Added a plan preset hint to `client/src/pages/Pricing.tsx` so `?plan=core|pro|enterprise` can deep-link into the intended tier.
- Added `docs/StripeSubscriptionFrameworkReadiness.md` to separate plumbing readiness from the later pricing inventory and value-proposition rewrite.
- Updated the route and environment docs so the current auth/billing split is described accurately.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The actual pricing packages and subscription value proposition still need the inventory/restructure pass you called out.
2. After that pricing pass lands, we should refresh the plan labels, checkout defaults, and any Stripe product references together so the public billing copy stays consistent.

---

# CurrentState — Babylon willow TypeScript contract repair for Vercel build unblock

**Last updated:** 2026-05-03
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Repaired Sanctuary willow Babylon type/interface drift that broke `npm run build` on Vercel commit `3266741`, then revalidated production build.

## Executive summary (2026-05-03)

- Restored `WillowModel`/`WillowScene` contract compatibility by exporting a concrete `WillowModelHandle` with `root`, `update`, and `dispose` members expected by scene orchestration.
- Replaced invalid Babylon disc option `incisions` with `tessellation` in willow mesh creation paths.
- Rebuilt `SanctuaryWillowBabylon` with local props/types/reduced-motion hook and aligned scene handle usage to include optional runtime `updateProps`.
- Exported Babylon scene/model types from `client/src/babylon/index.ts` for safe typed imports.
- Verified build passes locally after dependency reinstall.

## Validation performed

- `npm ci --include=dev --legacy-peer-deps`
- `npm run build`

## Remaining risks / next steps

1. `WillowModel` currently uses a lightweight sway update placeholder; if higher-fidelity wind deformation is needed, follow with shader/skeleton-based motion work.
2. Vite build still emits existing font-resolution and large-chunk warnings that are pre-existing and should be handled in a separate performance/assets pass.

---

## CurrentState — GestaltView Expert recursive learning scaffold and provider selection map (2026-05-02)

**Scope of this pass:** Added a dedicated GestaltView Expert agent, a recursive why/what/how/where/when learning tree, a working assets tree for refactor artifacts, and a provider-selection config/workflow that mirrors the live router and trainer defaults.

### What changed

- Added `agents/gestaltview-expert.md` as a canonical agent spec for recursive repo learning, gap surfacing, and cross-session context rebuilding.
- Added `agents/gestaltview-expert/README.md` plus `agents/gestaltview-expert/learning/{README,why,what,how,where,when,gaps,todo}.md` so the expert has a durable knowledge spine to update across sessions.
- Added `assets/README.md` and `assets/gestaltview-expert/{README,code,components,captures,reports,todo}.md` as the working artifact tree for refactors, components, and evidence captures.
- Added root `openai.yaml` to document the provider/env/model mapping for Gemini, Groq, OpenAI, OpenRouter, Anthropic, Hugging Face, and Ollama across the live router and trainer.
- Added `.github/workflows/llm-provider-selection.yml` to validate provider selection for `GEMINI_API_KEY` / `GOOGLE_API_KEY`, `GROQ_API_KEY`, and `OPENAI_API_KEY` against the documented defaults.
- Registered the new agent in `agents/openai.yaml` and `agents/INDEX.md`.

### Validation performed

- Not run yet. The new files were added together and should be checked for YAML and workflow syntax before merging.

### Next steps / recommendations

1. Run a syntax pass on `openai.yaml` and `.github/workflows/llm-provider-selection.yml`, then fix any formatting or expression issues.
2. Populate the new learning tree with the first real runtime map once the expert agent has done a full repo scan.
3. Use the assets tree only for active refactor passes so it stays a working surface instead of a second archive.

---

# CurrentState — Sanctuary willow render recovery + Blackboard speech capture stability

**Last updated:** 2026-05-02
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed Sanctuary willow visibility regression and stabilized Blackboard Room speech-to-text start/continuous behavior so voice journaling reliably captures spoken fragments.

## Executive summary (2026-05-02)

- Removed breakpoint gating that hid the willow overlay/canvas on non-`lg` viewports and tuned responsive sizing so the willow remains visible across Sanctuary layouts.
- Hardened `useVoiceChat` start/stop lifecycle with guarded `recognition.start()` handling and explicit keep-listening state for continuous dictation.
- Added continuous-session auto-restart on recognition end when voice journaling is still active, while preserving clean shutdown on manual stop and error paths.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. Web Speech availability and permission behavior still vary by browser family (especially iOS WebKit); cross-device QA should confirm expected prompts and sustained dictation behavior.
2. Sanctuary willow now renders on smaller viewports, but additional art-direction tuning may be needed if you want a distinct mobile composition instead of scaled desktop framing.

---

# CurrentState — Home hero/interface separation and attention hierarchy pass

**Last updated:** 2026-05-01
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Split the Home overlay layer into separate hero and interface components so visual storytelling and orb interaction no longer compete for attention, then applied the founder visual notes from the first reference image.

## Executive summary (2026-05-01)

- Extracted the top navigation + hero typography stack into `client/src/components/home/Hero.tsx`.
- Extracted hover labels, navigation transition overlay, load state, and interface guidance note into `client/src/components/home/GestaltViewInterface.tsx`.
- Simplified `client/src/pages/Home.tsx` into a scene/runtime shell that composes the two new overlays over the Babylon canvas.
- Added the requested hero-stage cues directly to the UI layer: `GestaltView Hero Here`, script-legibility header note, and explicit orb-identification guidance copy.
- Verified production build success after refactor.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The orb note is currently guidance copy only; if you want stricter vertical-lock behavior in 3D space, we should follow with a targeted module position/camera pass.
2. If you want this to fully match the second concept image, the next slice should define a separate dashboard route/theme so home and control-plane visual systems stay intentionally distinct.

---

# CurrentState — UI/UX refactor bundle workflow alignment

**Last updated:** 2026-05-01
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Re-centered `.github/workflows/ui_ux_refactor.yml` on the real `refactor_(all needs to be implemented)` bundle, including the `babylon.js_assets` subtree, and aligned the workflow with the repo's Node/build baseline.

## Executive summary (2026-05-01)

- Updated the UI/UX refactor workflow to validate the actual refactor bundle instead of placeholder Groq/script wiring.
- Explicitly included the `babylon.js_assets` subtree in the bundle validation and inventory snapshot.
- Switched the workflow to Node 22 and `npm ci` so it matches the repo's declared engine and lockfile path.

## Validation performed

- Workflow file inspection

## Remaining risks / next steps

1. The workflow currently validates and inventories the bundle, but it does not yet execute an automated refactor generator because no repository script exists for that handoff yet.
2. If you want this workflow to write code back into the runtime automatically, the next step is to add a dedicated refactor script and wire it into the same job.

---

# CurrentState — refactor route aliases and canonical workflow redirects

**Last updated:** 2026-04-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Brought the refactor handoff routes into the live app by adding the missing platform aliases, converting `brain-sparks` into a redirect shell, and synchronizing SEO/prerender metadata with the canonical module routes.

## Executive summary (2026-04-30)

- Added live route aliases for the refactor workflow map: `/app`, `/workspaces`, `/documents`, `/voice`, `/analytics`, `/builder`, and `/lair`.
- Converted `/brain-sparks` into a redirect shell that now lands on `/external-scaffold`, matching the canonical module naming.
- Updated SEO and prerender metadata so deprecated entry points canonicalize to the live module routes instead of pointing at stale paths.
- Expanded the floating quick-nav so the new aliases point back to the right operational surfaces.
- Verified the app still builds successfully after the routing and metadata updates.

## What changed in the live app

- `client/src/App.tsx` now exposes the operational aliases from the refactor route map and the builder/lair entrypoints from the handoff docs.
- `client/src/pages/BrainSparksPage.tsx` is now a redirect shell rather than a legacy content surface.
- `client/src/hooks/useSEO.ts` and `client/src/prerender.tsx` now canonicalize:
  - `brain-sparks` -> `external-scaffold`
  - `adhd-powerup` -> `external-scaffold`
  - `addiction-recovery` -> `pull-string`
  - `alzheimers-legacy` -> `heirloom-companion`
- `client/src/components/SubpageQuickNav.tsx` now routes the new aliases back to the dashboard or the correct adjacent surface.

## Validation performed

- `npm run build`

## Remaining risks / next steps

1. `/workspaces` and `/documents` currently land on the dashboard shell because the refactor-specific standalone surfaces are not yet implemented in the Vite runtime.
2. If the refactor route map expands further, regenerate the sitemap and manifest outputs so the public index stays in sync with the live route table.

---

# CurrentState — authenticated workflow surfaces with persisted workspaces, documents, and corpus sync

**Last updated:** 2026-04-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Turned the refactor’s authenticated route aliases into real runtime surfaces, then wired workspaces and document analysis into Supabase-backed API contracts, persistence, edit/delete flows, and corpus sync.

## Executive summary (2026-04-30)

- Added dedicated runtime pages for `/workspaces`, `/documents`, `/voice`, and `/analytics`.
- Ported the missing component layer into the runtime at:
  - [client/src/components/workspaces-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/workspaces-interface.tsx)
  - [client/src/components/document-analysis-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/document-analysis-interface.tsx)
  - [client/src/components/voice-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/voice-interface.tsx)
- Added Supabase-backed API routes and schema support for the new workflow surfaces:
  - [api/workspaces/index.ts](/workspaces/gestaltview-v2.0/api/workspaces/index.ts)
  - [api/documents/index.ts](/workspaces/gestaltview-v2.0/api/documents/index.ts)
  - [supabase/migrations/20260430143000_workspaces_documents_persistence.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260430143000_workspaces_documents_persistence.sql)
- Added edit/delete and corpus-sync helpers to the Supabase REST layer in [api/_lib/supabase.ts](/workspaces/gestaltview-v2.0/api/_lib/supabase.ts).
- Updated the route table so the new pages are no longer aliased to the dashboard shell.
- Verified the app still builds successfully after the API and persistence additions.

## What changed in the live app

- `client/src/App.tsx` now routes:
  - `/workspaces` to a dedicated collaboration page
  - `/documents` to a dedicated ingestion page
  - `/voice` to a dedicated voice capture page
  - `/analytics` to a dedicated metrics page
- `client/src/components/workspaces-interface.tsx` now loads, creates, edits, and deletes persisted workspaces, with a browser fallback if the API is unavailable.
- `client/src/components/document-analysis-interface.tsx` now uploads, lists, edits, and deletes persisted document analyses, with a browser fallback if the API is unavailable.
- `client/src/components/voice-interface.tsx` now wraps browser voice capture plus local note persistence/export.
- `client/src/components/SubpageQuickNav.tsx`, `client/src/hooks/useSEO.ts`, and `client/src/prerender.tsx` now know about the new authenticated surfaces.

## Validation performed

- `npm run build`
- `npx vitest run --root /workspaces/gestaltview-v2.0 --config /workspaces/gestaltview-v2.0/vite.config.ts api/__tests__/workspaces.test.ts api/__tests__/documents.test.ts`
- `git diff --check`
- `python3 scripts/generate_repo_manifest.py`

## Remaining risks / next steps

1. The corpus sync currently snapshots uploaded documents into the existing document and knowledge-fragment tables, but it does not yet do incremental diffing or version reconciliation on edits.
2. If authenticated surface inventory expands again, refresh the manifest and sitemap together so the public and operator docs stay aligned.

---

# CurrentState — GestaltView UI/UX landing refactor and module-navigation pass

**Last updated:** 2026-04-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Rebuilt the public home surface around the GestaltView landing spec, added the always-on capture / synthesis / export spine, surfaced orb handoff behavior, and replaced the old top nav with a centered, plan-aware module shell.

## Executive summary (2026-04-30)

- Replaced the old homepage card stack with a fog-led hero, pending founder copy placeholder, capture spine, orb shelf, and asymmetric module landscape.
- Reworked the top navigation so it now centers on `Billy`, `Modules`, `Profile`, `Settings`, `File Explorer`, and `Integrations`, with plan-aware teasing for higher-tier surfaces.
- Added a shared platform surface registry so homepage, nav, and module map all resolve from the same route metadata.
- Added a `Daydreamer` route alias for the Memory Continuity family so the new surface labeling stays navigable.
- Kept the app build green after the landing and nav redesign.

## What changed in the live app

- `client/src/pages/Home.tsx` now renders:
  - the fog-based hero wordmark treatment
  - the `[HERO SUBTEXT — PENDING FOUNDER COPY]` placeholder
  - the three-input capture spine plus export action
  - the orb shelf with accept handoff behavior
  - the asymmetric module landscape and hub-centered pathing
- `client/src/components/NavBar.tsx` now renders a centered shell with:
  - `Billy`
  - `Modules`
  - `Profile`
  - `Settings`
  - `File Explorer`
  - `Integrations`
- `client/src/data/platformModules.ts` now holds the shared surface registry and the module node positions used by both the home page and the nav dropdown.
- `client/src/App.tsx` now includes `/daydreamer` as a route alias for the Memory Continuity family.
- `client/src/index.css` now contains the landing-specific fog, lightning, orb, path, and topo styling used by the new home surface.

## Validation performed

- `npm run build`

## Remaining risks / next steps

1. The module landscape is code-rendered rather than Babylon-rendered, so if the founder wants a true 3D Babylon pass, that would be a separate implementation slice.
2. A browser screenshot verification pass still needs a browser binary in this environment.

---

## CurrentState — Trainer Supabase admin `global.fetch` TypeScript compatibility fix (2026-04-29)

**Scope of this pass:** Unblocked Vercel production builds failing in the Agent Trainer server client while preserving the new Supabase timeout/resilience behavior.

### What changed

- Updated `server/agent-trainer/supabaseAdmin.ts` at the Supabase admin client initialization call to keep `global.fetch` timeout injection and add a narrow `as any` cast on `global` only.
- Added an inline note documenting why this cast is needed: some `@supabase/supabase-js` versions expose runtime `global.fetch` support but omit it from the `GlobalConfig` type shape.
- Updated `bugwalks/BugWalkBoard.md` with a shipped/verify card for this specific 2026-04-29 build break and fix pass.

### Validation performed

- `npm run build`
- `git diff --check`

### Next steps / recommendations

1. Keep `SUPABASE_QUERY_TIMEOUT_MS` configured in production so Supabase read stalls fail fast and surface retriable behavior upstream.
2. During the next dependency maintenance pass, evaluate pinning or upgrading `@supabase/supabase-js` to a version whose `global` typing includes `fetch`, then remove the local cast if type-safe support returns.

---

---

## CurrentState - New agent launch and workflow provider cleanup (2026-04-29)

**Scope of this pass:** Implemented the new Consulting Advisor, Philosophy Scribe, and Repo Scribe agent specs from `agents/New_Agents_4_29_26.md`, added their embodiment profiles and validation workflows, and switched non-embedding Agent Trainer workflow scaffolds to `GROQ_API_KEY`.

### What changed

- Added `agents/consulting-advisor.md`, `agents/philosophy-scribe.md`, and `agents/repo-scribe.md` as canonical flat agent specs with the requested frontmatter and operating constraints.
- Added matching embodiment profiles under `embodiment_profiles/` with schema-compatible identity fields so the shared embodiment generator can ingest them.
- Added `.github/workflows/validate-consulting-advisor.yml`, `validate-philosophy-scribe.yml`, and `validate-repo-scribe.yml` so each new agent/profile pair is structurally checked on push and pull request.
- Updated `agents/INDEX.md` and `agents/openai.yaml` so the new agents are discoverable from the repo-level registry.
- Swapped non-embedding workflow env wiring in `agent_trainer/gestaltview_agent_trainer/.github/workflows/generic-corpus-ingestion.yml` and `corpus-ingest.yml` to `GROQ_API_KEY`, while keeping the embedding-specific OpenAI path available only when that workflow input explicitly requests it.
- Reflected the workflow secret change in `agent_trainer/gestaltview_agent_trainer/docs/CORPUS_INGEST_AUTOMATION.md`.

### Validation performed

- Pending after file write: agent/profile generation and workflow linting

### Next steps / recommendations

1. Run the embodiment artifact generator so `embodiment_profiles/reference/` and `shared/embodiment/generated.ts` pick up the new profiles.
2. Run the repo's focused tests or workflow linting on the new validation files before merging.

---

# CurrentState — Trainer Supabase admin `db` option TypeScript compatibility fix

**Last updated:** 2026-04-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Vercel build failure from 2026-04-29 (`TS2353` in `server/agent-trainer/supabaseAdmin.ts` because `db` is not a recognized `SupabaseClientOptions` property)
**Scope of this pass:** Restored build compatibility by removing the unsupported `db` option while preserving timeout-enabled fetch behavior for trainer admin queries.

## Executive summary (2026-04-29)

- `createClient(url, key, { db: { schema: "public" }, ... })` failed under the currently resolved `@supabase/supabase-js` typings because `db` is not part of `SupabaseClientOptions`.
- Removed the `db` object from the options payload in `server/agent-trainer/supabaseAdmin.ts`.
- Retained the existing `global.fetch` override with `AbortSignal.timeout(...)` so server-side query timeout hardening remains active.
- This keeps runtime behavior focused on the same public schema defaults while unblocking the TypeScript build.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. If schema-scoped behavior becomes necessary, confirm the exact supported option shape from the installed `@supabase/supabase-js` version before reintroducing config keys.
2. Add a small server-side smoke test for `getTrainerSupabaseAdmin()` initialization to catch SDK option drift earlier in CI.

## Overall repo state and recommendations

- The Vercel build blocker for this pass is resolved, and the trainer admin client still keeps timeout protection for outbound Supabase calls.
- Recommend pinning or explicitly reviewing Supabase SDK version updates in release checklists so option-shape typing regressions are caught before deploy.

---

---

# CurrentState — SPEC-1 UI/UX refactor for GestaltView

**Last updated:** 2026-04-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Refactored the home page into a concise platform entry surface, replaced the consulting page with the founder narrative, added new canonical module pages, elevated the Alzheimer’s legacy experience into a warm three-mode living legacy surface with a Daydreamer component, and wired redirect shells for retired route names.

## Executive summary (2026-04-29)

- Reworked [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx) into a compact arrival page with a clear orienting statement, Billy entry points, a bucket-drop capture panel, and canonical tier-based navigation cards.
- Replaced [`client/src/pages/ConsultingPage.tsx`](client/src/pages/ConsultingPage.tsx) with an authoritative, Inter-styled narrative page covering origin story, Recognition Gap, forensic moat, governance, and partnerships.
- Added the new module surfaces at [`client/src/pages/ExternalScaffoldPage.tsx`](client/src/pages/ExternalScaffoldPage.tsx), [`client/src/pages/PullStringPage.tsx`](client/src/pages/PullStringPage.tsx), [`client/src/pages/RapidPrototypePage.tsx`](client/src/pages/RapidPrototypePage.tsx), [`client/src/pages/AdaptiveLayoutPage.tsx`](client/src/pages/AdaptiveLayoutPage.tsx), [`client/src/pages/CreationCornerPage.tsx`](client/src/pages/CreationCornerPage.tsx), and [`client/src/pages/LivingLegacyPage.tsx`](client/src/pages/LivingLegacyPage.tsx).
- Added [`client/src/components/alzheimers/DaydreamerMode.tsx`](client/src/components/alzheimers/DaydreamerMode.tsx) and reworked the Alzheimer’s legacy route to redirect into the new living legacy surface.
- Updated [`client/src/data/platformModules.ts`](client/src/data/platformModules.ts) and [`client/src/App.tsx`](client/src/App.tsx) so the canonical module names and routes are exposed in navigation and routing.
- Added root compatibility shims [`types.ts`](types.ts) and [`constants.ts`](constants.ts), plus refactor helpers [`refactor/icons.tsx`](refactor/icons.tsx) and [`refactor/Section.tsx`](refactor/Section.tsx), so the adaptive layout reference component compiles cleanly.

## Files touched

- [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx)
- [`client/src/pages/ConsultingPage.tsx`](client/src/pages/ConsultingPage.tsx)
- [`client/src/pages/ExternalScaffoldPage.tsx`](client/src/pages/ExternalScaffoldPage.tsx)
- [`client/src/pages/PullStringPage.tsx`](client/src/pages/PullStringPage.tsx)
- [`client/src/pages/RapidPrototypePage.tsx`](client/src/pages/RapidPrototypePage.tsx)
- [`client/src/pages/AdaptiveLayoutPage.tsx`](client/src/pages/AdaptiveLayoutPage.tsx)
- [`client/src/pages/CreationCornerPage.tsx`](client/src/pages/CreationCornerPage.tsx)
- [`client/src/pages/LivingLegacyPage.tsx`](client/src/pages/LivingLegacyPage.tsx)
- [`client/src/pages/AlzheimersLegacyPage.tsx`](client/src/pages/AlzheimersLegacyPage.tsx)
- [`client/src/pages/ADHDPowerUpPage.tsx`](client/src/pages/ADHDPowerUpPage.tsx)
- [`client/src/pages/AddictionRecoveryPage.tsx`](client/src/pages/AddictionRecoveryPage.tsx)
- [`client/src/components/alzheimers/DaydreamerMode.tsx`](client/src/components/alzheimers/DaydreamerMode.tsx)
- [`client/src/components/alzheimers/pages/index.tsx`](client/src/components/alzheimers/pages/index.tsx)
- [`client/src/data/platformModules.ts`](client/src/data/platformModules.ts)
- [`client/src/App.tsx`](client/src/App.tsx)
- [`types.ts`](types.ts)
- [`constants.ts`](constants.ts)
- [`refactor/icons.tsx`](refactor/icons.tsx)
- [`refactor/Section.tsx`](refactor/Section.tsx)

## Routes added

- `/external-scaffold`
- `/pull-string`
- `/heirloom-companion`
- `/rapid-prototype`
- `/adaptive-layout`
- `/creation-corner`

## Redirect shells added

- `/adhd-powerup` → `/external-scaffold`
- `/addiction-recovery` → `/pull-string`
- `/alzheimers-legacy` → `/heirloom-companion`

## Validation performed

- `git diff --check`
- `npm run build`

## Build status

- Build passed successfully after adding the refactor compatibility shims for the adaptive layout component.

---

---

# CurrentState — platform framing, route cleanup, and trainer flow hardening

**Last updated:** 2026-04-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Reframed the public app as a fully functional platform instead of a portfolio/showcase, removed the live dependency on `refactor/` from app surfaces, canonized `/platform` as the public museum successor, and added a dev CLI surface for manual agent build/deploy work with an explicit `capture → synthesis → create → export` flow.

## Executive summary (2026-04-29)

- Reframed public-facing language across Billy, exhibit pages, homepage/demo/FAQ copy, and supporting metadata so the product reads as a platform and digital intelligence system rather than a portfolio curator or showcase.
- Canonized `/platform` as the public-facing route and left `/museum` as a redirect shell to `/platform` so the old name remains compatible without being the primary surface.
- Added the dev-only Agent Trainer CLI at `/agent-trainer/dev-cli` to support manual pack/agent build and deployment flows from the browser, with copyable command steps for capture, synthesis, create, and export.
- Added a shared agent flow model in `client/src/lib/agentFlow.ts` and surfaced it in the trainer UI with `AgentFlowRail` so every model is explicitly guided through `capture → synthesis → create → export`.
- Updated Billy runtime prompts so the core operating model now expects the same four-stage flow everywhere the trainer or public Billy surfaces speak about work.
- Verified the app still builds successfully after the route and copy changes.

## What changed in the live app

- Public routes now include `/demo`, `/signup`, `/agent_builder`, `/agent-builder`, and `/agent-trainer/dev-cli`.
- `client/src/App.tsx` now routes `/platform` directly to the canonical platform page and redirects `/museum` to `/platform`.
- `client/src/hooks/useSEO.ts` and `client/src/prerender.tsx` now use `platform` as the canonical SEO/prerender key instead of `museum`.
- `client/src/pages/MuseumPage.tsx` remains the implementation file for the platform page, but the visible route and copy are platform-first.
- Billy-facing copy in `client/src/lib/BillyEngine.ts`, `client/src/components/BillyLive.tsx`, and `client/src/components/exhibits/BillyExhibitChat.tsx` now uses platform language and the required flow language.
- Exhibit and archive metadata in `client/src/data/exhibits.ts` and `client/src/lib/exhibits.ts` were updated so the public preview text no longer sounds like a portfolio curator or showcase catalog.
- The Agent Trainer surface now includes:
  - a shared flow rail in `client/src/components/agent-trainer/AgentFlowRail.tsx`
  - flow constants in `client/src/lib/agentFlow.ts`
  - a dev-only command page in `client/src/pages/AgentTrainerDevCliPage.tsx`
  - a trainer pricing entry point that links into the dev CLI during development in `client/src/pages/AgentTrainerPricing.tsx`
  - a trainer page section that surfaces the same operator flow in `client/src/features/agent-trainer/AgentTrainerPage.tsx`

## Current product direction

- The old portfolio/showcase/curator framing should be treated as removed from the live surface.
- Every model, trainer, and Billy-adjacent flow should move through:
  - `capture`
  - `synthesis`
  - `create`
  - `export`
- The dev CLI is the current manual operator path for building and deploying agents during development.
- The browser trainer UI remains the canonical guided surface, while the CLI page exposes the same operational steps for hands-on work.

## Validation performed

- `npm run build`

## Notes for the next session

1. Treat `refactor/` as archival/handoff material unless a specific file is being deliberately migrated into the live app.
2. If a visible surface still sounds decorative, rewrite it toward operational language before adding new features.
3. If the trainer workflow grows, keep the flow sequence fixed and add new tooling around it instead of introducing alternate mental models.

---

# CurrentState — Agent Trainer run list/detail TypeScript build fix

**Last updated:** 2026-04-28
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Vercel build failure from 2026-04-28 (`TS2345` in `client/src/features/agent-trainer/hooks/useTrainingRun.ts` at list-run dedupe call)
**Scope of this pass:** Repaired the summary-vs-detail run typing boundary in Agent Trainer bootstrap/history flows so TypeScript build passes in CI/Vercel.

## Executive summary (2026-04-28)

- `listTrainingRuns()` intentionally returns `TrainingRunSummary[]`, but the hook previously treated those values as `TrainingRunDetail[]` during dedupe and selection.
- Updated `useTrainingRun` to track run lists as `TrainingRunSummary | TrainingRunDetail`, then fetch full detail for the selected run ID before assigning `currentRun`.
- Replaced direct list-object assignment in the history UI path with ID-based refresh behavior by exposing a hook-level `setCurrentRun` selector that calls `refreshRun(runId)`.
- Added a safe `workerId` narrowing guard in `AgentTrainerPage` for summary job rows, avoiding invalid property access on summary job objects.

## Validation performed

- `npm ci --include=dev --legacy-peer-deps`
- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The list endpoint is still summary-first by design; if future UI cards require detail-only fields without fetch-on-select, either enrich the summary schema or prefetch detail rows explicitly.
2. Consider adding a focused test for run-list selection to ensure summary rows always resolve to detail before current-run panels render detail-only fields.

## Overall repo state and recommendations

- The Agent Trainer control-plane compile path is unblocked and now explicitly models the list/detail contract boundary.
- Recommend keeping this split intentional: summary for list performance, detail fetch on selection/mutation, with hook-level helpers preventing accidental partial-object promotion.

---

---

## CurrentState — CORS origin canonical-host lock refresh (2026-04-27)

**Scope of this pass:** Confirmed the production CORS origin and corrected the prior stale-host note so runtime settings stay aligned to `https://gestaltview-digital-intelligence.vercel.app`.

### What changed

- Re-validated runtime CORS/default-origin codepaths and tests continue to treat `https://gestaltview-digital-intelligence.vercel.app` as the primary production host (`api/_lib/cors.ts`, `api/__tests__/cors.test.ts`, `api/voice/billy.ts`, `api/stripe/checkout.ts`).
- Replaced one remaining stale deployment-host reference in generated context documentation (`docs/wiki/_context/context_pack.json`) so published context bundles no longer point to an outdated Vercel host.
- Recorded an explicit ops recommendation that project/runtime env vars should use:
  - `CORS_ORIGINS=https://gestaltview-digital-intelligence.vercel.app`
  - plus any required preview/local origins as comma-separated additions.

### Validation performed

- `rg -n "gestaltview-digital-intelligence\.vercel\.app|gestaltview-dig-cog\.vercel\.app|CORS_ORIGINS|gestaltv1ew\.vercel\.app" --glob '!node_modules/**'`

### Next steps / recommendations

1. In Vercel project settings, remove any stale `CORS_ORIGINS` value that points at retired hosts and keep `https://gestaltview-digital-intelligence.vercel.app` as the first canonical origin.
2. If preview deployments need CORS access, append those domains in `CORS_ORIGINS` as additional comma-separated entries.

---

---

# CurrentState — SPEC-2 Hyperagent integration implementation

**Last updated:** 2026-04-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** `SPEC-2 – GestaltView Agent Trainer Hyperagent Integration.md`
**Scope of this pass:** Implemented the SPEC-2 trainer hyperagent integration slice set across schema, API, orchestration, and Admin Trainer UI surfaces.

## Executive summary (2026-04-27)

- Added Supabase migration `20260427100000_trainer_hyperagent_integration.sql` introducing trainer connectors, trainer skills, trainer memory bindings, and the `trainer_memory_surfaces` view.
- Extended `trainer_experiments` and `training_runs` with hyperagent execution mode and graph fields (`execution_mode`, connector/skill/memory graph fields, and run observations).
- Added new trainer API routes for hyperagent assets: `/api/trainer/connectors`, `/api/trainer/skills`, `/api/trainer/memory-surfaces`, and `/api/trainer/graphs`.
- Added backend repository `server/trainer/hyperagent-repository.ts` for connector/skill/memory listing and experiment graph read/write.
- Extended shared trainer schemas with execution mode, graph payloads, connectors/skills/memory-surface response contracts, and run graph observability fields.
- Updated run creation/orchestration path so runs inherit experiment execution mode and persist resolved graph snapshots; hyperagent runs now emit graph lifecycle evidence and graph observations.
- Updated Agent Trainer UI with first-class read surfaces for Connectors, Skill Graph, Memory Field, plus an explicit Builder/Grower/Pruner/Birth embodiment lifecycle strip.
- Extended ExperimentForm with execution mode selection (`classic` / `hyperagent`).

## Validation performed

- `npm run build`
- `npx vitest run --config vitest.api.config.ts api/__tests__/trainer-queue-health-route.test.ts api/__tests__/trainer-run-events-route.test.ts`
- `npx vitest run --root client src/tests/agent-trainer-api.test.ts`
- `git diff --check`

## Remaining risks / next steps

1. The new `trainer_memory_surfaces` view assumes existing `memoryentries`, `knowledgefragments`, and `ops_workbook_items` column contracts; verify against production schema before migration rollout.
2. Hyperagent graph authoring UI is currently read-oriented for connectors/skills/memory surfaces; add full graph editor/write flows in follow-up if founder wants in-dashboard editing.
3. Add API route tests for the new `/api/trainer/connectors`, `/api/trainer/skills`, `/api/trainer/memory-surfaces`, and `/api/trainer/graphs` endpoints.
4. Add targeted orchestrator tests asserting `graph_observations` persistence in hyperagent mode.

## Overall repo state and recommendations

- SPEC-2 is now operationally wired into the existing Trainer runtime rather than tracked as a standalone concept doc.
- Recommend running the new migration in staging, creating at least one `hyperagent` experiment, and validating end-to-end graph propagation (`trainer_experiments` → `training_runs` → `graph_observations`) before production promotion.

---

---

# CurrentState — Trainer admin auth cache and CORS origin correction

**Last updated:** 2026-04-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Operator report: Admin Dashboard Agent Trainer auth issues after same-day Agent Trainer enhancement.
**Scope of this pass:** Removed the post-admin-activation auth-cache race, aligned runtime fallbacks with `CORS_ORIGINS=https://gestaltview-digital-intelligence.vercel.app`, and corrected Trainer governance client route names.

## Executive summary (2026-04-27)

- Added explicit auth profile cache invalidation after dashboard admin bootstrap/admin user-account updates and bypassed the auth profile cache on admin-gated dashboard, Trainer, and workbook routes so warm serverless functions do not serve stale `is_admin` state.
- Routed the newly added Agent Trainer connector/skill/memory catalog calls through the shared trainer request wrapper so they inherit token refresh, diagnostics, configured API-origin retry, and the auth circuit breaker.
- Corrected Trainer governance client paths to match deployed API routes: `packaging-candidates`, singular experiment `review`, and singular experiment `flag`.
- Added `GET /api/trainer/packaging-candidates/:id` support to match the existing client helper.
- Re-aligned runtime fallback origins with the current production CORS origin `https://gestaltview-digital-intelligence.vercel.app`.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/dashboard.test.ts api/__tests__/lib.test.ts api/__tests__/cors.test.ts`
- `npx vitest run --root client src/tests/agent-trainer-api.test.ts`
- `npm run build`
- `git diff --check`

---

---

# CurrentState — Dashboard auth fallback vs founder outbox sync state

**Last updated:** 2026-04-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Operator report from Admin Dashboard Agent Trainer access ("Authentication required", "Dashboard state is unavailable right now" after founder sync check).
**Scope of this pass:** Fixed a dashboard UX sequencing bug where founder outbox auto-sync could clear actionable auth/admin errors and leave only a generic fallback card.

## Executive summary (2026-04-27)

- Updated `DashboardPage` founder outbox auto-sync flow to check pending writes first, then no-op quietly when there is nothing to sync.
- Removed the unconditional `setError(null)` from the auto-sync path so existing dashboard load/auth errors remain visible.
- Added an explicit failure branch when outbox flush returns `synced=0` with `remaining>0`, so the UI surfaces a real sync problem instead of claiming founder sync success.
- Preserved the existing successful sync behavior and dashboard refresh path when local writes are actually flushed.

## Validation performed

- `npm run build`
- `npx vitest run --root client src/tests/agent-trainer-api.test.ts`
- `git diff --check`

## Remaining risks / next steps

1. The unavailable-state fallback card is still generic by design; if operators want faster triage, promote the last dashboard fetch error directly into that fallback card copy.
2. Add a dedicated `DashboardPage` component test that simulates `loadDashboard` failure + outbox auto-sync with zero pending entries so this regression is permanently guarded.

## Overall repo state and recommendations

- This pass removes a misleading success signal in the dashboard auth path and should make admin/auth failures visible instead of being overwritten by outbox sync messaging.
- Recommend next shipping pass verifies the exact user path on deployed `/dashboard` and `/agent-trainer/control-plane` for a non-admin authenticated user and for founder-eligible accounts.

---

---

# CurrentState — Sentry Next.js skill execution and runtime applicability map

**Last updated:** 2026-04-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Operator request referencing Sentry Next.js manual setup (Webpack section) + follow-up request to use the `sentry-nextjs-sdk` skill.
**Scope of this pass:** Executed the skill-directed detection workflow with `curl` + local runtime probes, updated BugWalk issue state, and upgraded `docs/SentrySetup.md` into a skill-aligned applicability and cross-repo action matrix.

## Executive summary (2026-04-27)

- Downloaded and followed `https://skills.sentry.dev/sentry-nextjs-sdk/SKILL.md` as directed.
- Ran the skill's Phase 1-style detection checks in this repo and confirmed there is no Next.js runtime to apply `@sentry/nextjs` Webpack setup directly.
- Updated `docs/SentrySetup.md` to include explicit detection commands, concrete findings, and an integrated-repo action matrix so Next.js setup is only applied where Next.js is actually present.
- Updated BugWalk card `BW-2026-04-27-04` from `Fresh Sightings` to `In Flight` with attempt log + validation evidence.

## Validation performed

- `curl -fsSL https://skills.sentry.dev/sentry-nextjs-sdk/SKILL.md -o /tmp/sentry-nextjs-skill.md`
- `cat package.json | grep -E '"next"|"@sentry/'`
- `rg --files | rg 'next\.config\.(ts|js|mjs)$'`
- `rg -n 'global-error\.tsx|_error\.tsx' agent_trainer client server api`
- `git diff --check`

## Remaining risks / next steps

1. This pass improves correctness of setup strategy, but runtime Sentry instrumentation is still not implemented in `gestaltview-v2` code paths.
2. Cross-repo recommendations are still advisory until each integrated repository is mounted and inspected directly.
3. After Vite instrumentation lands, run a controlled client-side test exception and verify event arrival in Sentry before widening scope.

## Overall repo state and recommendations

- The repository now has a skill-backed, reproducible decision trail showing why Next.js Webpack setup was not applied locally.
- Operational guidance now separates local truth (Vite runtime) from cross-repo possibilities (Next.js/Webpack only if detected), reducing future misconfiguration risk.
- Recommended immediate follow-up: implement Vite bootstrap (`@sentry/react`) in this repo, then mirror this applicability matrix into the compendium with explicit per-repo detection outcomes.

---

---

# CurrentState — RDRC charter ratification

**Last updated:** 2026-04-24
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Formalized `RDRC.md` as a canonical GestaltView charter, bundled it into `client/src/canonical/`, and threaded it through the repo's official orientation and sync surfaces.

## Executive summary (2026-04-24)

- Elevated `RDRC.md` from a standalone note into a charter-style canonical document with version, status, scope, and an explicit standing rule.
- Removed draft-style citation placeholders from the charter so the file reads as a first-class repo artifact rather than an intermediate note.
- Added `client/src/canonical/RDRC.md` so the app-bundled canonical context now carries the same ratification charter.
- Updated `README.md`, `docs/Manifest.md`, and `docs/SymbioticWorkflow.md` so repo orientation now treats rough-draft ratification as an official GestaltView workflow rather than an implied habit.
- Updated `scripts/test-manifest-sync.sh` so dirty `RDRC.md` changes are treated as uncommitted canonical-doc drift.

## Validation performed

- Checked the added `README.md`, `docs/Manifest.md`, and `docs/SymbioticWorkflow.md` references against the live root file path.
- Confirmed `client/src/canonical/RDRC.md` is present alongside the other bundled canonical markdown files.
- `python3 scripts/generate_repo_manifest.py`
- `git diff --check`

## Remaining risks / next steps

1. `RDRC.md` now has standing in this repo, but companion repos still need to cite or adopt the same charter directly if they should enforce the same ratification workflow locally.
2. If doctrine-candidate tracking becomes active work rather than a stated rule, add a lightweight Doctrine Inbox or equivalent structured artifact so the status ladder has an explicit home.

---

---

# CurrentState — Vercel trainer auth storm hardening

**Last updated:** 2026-04-24
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** `vercel_logs/gestaltview-log-export-2026-04-24T23-35-13.json`
**Scope of this pass:** Reviewed the Vercel export showing trainer API 401 storms and keep-alive aborts, then hardened the affected auth/client/cron paths.

## Executive summary (2026-04-24)

- The log export contains 19,990 rows over `2026-04-24 23:28:52` to `23:34:00` UTC, with 19,988 trainer `401` responses and 2 keep-alive `500` responses.
- Added a trainer-client auth circuit breaker so repeated `401`/`403` results for the same bearer token fail locally for a short cooldown instead of continuing to fan out across every trainer endpoint.
- Changed trainer 401 refresh behavior so the client only retries after `refreshSession()` returns a different access token.
- Capped API auth lookup waits at 4 seconds even if `AUTH_CALL_TIMEOUT_MS` is configured higher, and added structured warning logs for auth lookup failures/timeouts.
- Changed `/api/keep-alive` to return degraded `200` responses for Supabase ping aborts/timeouts instead of surfacing them as cron `500` failures.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/keep-alive.test.ts`
- `npx vitest run --root client src/tests/agent-trainer-api.test.ts`
- `npx vitest run --config vitest.api.config.ts api/__tests__/lib.test.ts -t auth`
- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The log export did not include request headers, so the exact token state could not be confirmed from logs alone.
2. If production still shows 10-second trainer `401`s after redeploy, verify Vercel env state and deployment age against the new auth timeout cap.
3. Add Vercel log filters for `auth_lookup_failed` after deployment to distinguish invalid tokens from Supabase auth transport stalls.
4. The full `api/__tests__/lib.test.ts` file still has a pre-existing expectation drift around health-check fetch counts: it expects 8 calls while the current health check makes 10.

---

---

# CurrentState — Tuesday walkthrough fixes and manual trainer packet fallback

**Last updated:** 2026-04-22
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** `Tuesday.md`
**Scope of this pass:** Addressed the current walkthrough issues around Billy entry behavior, Billy Markdown rendering/personality, founder persistence sync feedback, and the Agent Trainer degraded-backend workaround.

## Executive summary (2026-04-22)

- Billy greeter text now streams faster and carries a sharper Billy voice.
- The direct "Show me Billy, now" pathway now routes to Billy Live only instead of also opening the floating Billy side panel.
- Billy Live and the Billy side panel now render basic Markdown formatting such as bold, lists, links, inline code, and fenced code blocks instead of showing raw asterisks.
- Billy's runtime prompt now carries the full user and digital-intelligence Constitutional Invariants, plus an explicit humor-with-care tone directive.
- Founder persistence now shows visible sync state, spinner feedback, success timestamps, and failed-sync copy for local outbox flushes.
- Agent Trainer manual source fallback now keeps inline study focus under the shared schema limit, tracks uploaded local sources, supports removing them, and exports/imports a manual trainer packet for backend-degraded work.
- The degraded Trainer runtime banner now documents the Supabase/free-tier workaround directly in the admin control plane.

## Validation performed

- `npm run build`
- `pnpm exec vitest run --config vitest.api.config.ts api/__tests__/billy-runtime.test.ts api/__tests__/billy.test.ts api/__tests__/dashboard.test.ts api/__tests__/trainer-study-sources-recommendations-route.test.ts`
- `npm run dev -- --host 0.0.0.0`
- `curl -I http://localhost:3000/`

## Remaining risks / next steps

1. The manual trainer packet unblocks source preparation, but queue submission still depends on the trainer API path when the user chooses to queue a run.
2. If the degraded Supabase path remains unreliable, add a fully local/offline run export mode that never calls the Trainer API.
3. Do a browser walkthrough of `/`, `/billy`, `/dashboard`, and `/agent-trainer/control-plane` to confirm the new interaction states feel right in the deployed UI.

---

---

## CurrentState — BugWalk 2026-04-21 runtime remediation pass

**Scope of this pass:** Converted `BugWalk_4_21_26.md` into concrete runtime fixes for Billy's intro and crisis posture, founder context persistence, and Agent Trainer degraded-source behavior.

### What changed

- Revised the canonical **Never Look Away** invariant to emphasize staying present with distress, avoiding pathologizing/quick handoff language, and escalating to human support when safety actually requires it.
- Updated Billy runtime instructions so the 11-module schema is treated as internal memory mapping rather than visible UI navigation, reducing intro/UI mismatch.
- Sped up the Billy greeter typewriter experience and tightened the greeting copy around the actual available choices.
- Changed `/api/session/dashboard` founder/admin reads and writes to use the server-side Supabase service context after auth and access checks, so founder persistence is not blocked by user-scoped RLS policy drift.
- Removed the hard-coded production-host fallback from the Agent Trainer browser client; cross-origin fallback now only happens when `VITE_API_BASE_URL`, `VITE_API_PROXY_TARGET`, or `VITE_BILLY_API_URL` is explicitly configured.
- Added a manual file-to-study-focus fallback on the Agent Trainer run form so text/markdown/JSON/CSV source notes can be attached to a run even when trainer source APIs are degraded.
- Added `BugwalkBoard.md` as the repo-level bugwalk/session closeout protocol called for by the 2026-04-21 notes.

### Validation performed

- `npx vitest run client/src/tests/agent-trainer-api.test.ts`
- `npx vitest run --config vitest.api.config.ts api/__tests__/dashboard.test.ts`
- `npm run build`

### Remaining risks / follow-up

1. Supabase email delivery and cold-start behavior still depends on project tier/configuration outside the repo.
2. If production lacks `SUPABASE_SERVICE_ROLE_KEY`, founder persistence may still be constrained by anon-key RLS behavior.
3. Agent Trainer manual source upload is a temporary degraded-mode path; durable uploaded source ingestion still needs a server-backed storage/indexing design.
4. Created `docs/supabase-free-tier-workaround-research-prompt.md` as a handoff prompt for deeper workaround research while a Supabase tier upgrade is not possible.

---

---

# CurrentState — Gravity Inspector + Billy gravity metadata

**Last updated:** 2026-04-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the Gravity Inspector to the main navigation, and documented the new two-pass gravity surface now emitted by Billy and exposed through the inspector route.

## Executive summary (2026-04-20)

- Added `Gravity` to the primary top navigation in `client/src/components/NavBar.tsx`, which also updates the mobile menu because both views share `NAV_LINKS`.
- Billy responses now include `metadata.gravity`, including query, context, and response analysis plus ranked chunk signals.
- The Gravity Inspector is available at `/gravity` and is linked from the dashboard and quick-nav surfaces.
- The inspector reads stored gravity reports and fragment rankings from the API layer added in the prior pass.

## Validation performed

- `pnpm exec tsc --noEmit`
- `pnpm exec vitest run --root . api/__tests__/billy.test.ts`

## Remaining risks / next steps

1. Keep the gravity metadata schema stable if the inspector UI or Billy response envelope grows further.
2. If the Gravity surface becomes a primary workflow entry point, consider promoting it beyond the shared nav list into any global command palette or launcher.

## Overall repo state and recommendations

- The gravity protocol now has three visible surfaces: runtime metadata, a persisted inspector, and a direct navigation entry.
- The repo should now be easier to re-enter because the gravity work is visible from the main app chrome instead of only through deep links.

---

---

# CurrentState — Agent Trainer degraded-path repair + canonical origin fallback refresh

**Last updated:** 2026-04-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Bug IDs covered:** trainer control-plane fetch degradation / study-source validation / queue-health hang handling
**Scope of this pass:** Hardened the Agent Trainer control plane so browser requests can retry against the configured API origin, queue-health requests degrade cleanly instead of hanging, and malformed study-source drafts return `400` instead of surfacing as generic `500` failures.

## Executive summary (2026-04-19)

- Updated `client/src/features/agent-trainer/lib/trainerApi.ts` so relative `/api/*` requests now retry against configured API origins before surfacing a browser `Failed to fetch` error.
- Explicitly included the current canonical deployment host `https://gestaltv1ew.vercel.app` in the trainer client fallback path so the control plane does not depend on stale origin assumptions.
- Added a timeout wrapper and degraded fallback snapshot to `api/trainer/queue-health.ts`, which lets the admin dashboard show a degraded pipeline state instead of losing the request when the backing queue-health query is slow.
- Tightened `api/trainer/study-sources/recommendations.ts` so empty or malformed trainer draft payloads now return `400`, matching the actual request contract instead of turning into `500` noise.
- Added targeted regression coverage for the origin retry path and the degraded queue-health route.
- Re-ran the trainer-focused tests and the full project build to confirm the changes are type-safe and bundle cleanly.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/trainer-study-sources-recommendations-route.test.ts api/__tests__/trainer-queue-health-route.test.ts api/__tests__/trainer-run-events-route.test.ts`
- `npx vitest run client/src/tests/agent-trainer-api.test.ts`
- `npm run build`

## Remaining risks / next steps

1. The queue-health route now degrades instead of failing hard, but if Supabase is genuinely unavailable the admin dashboard will still be operating from a reduced signal set.
2. Keep the current canonical host and any required preview origins aligned in Vercel env vars so the configured-origin fallback stays useful in all deployment environments.
3. If the old `gestaltview-dig-cog.vercel.app` host is still present in any environment config, remove it from active runtime settings so the control plane does not drift back toward a stale origin.

## Overall repo state and recommendations

- The immediate trainer control-plane degradation is reduced: the client now retries against a configured origin and the queue-health surface degrades predictably instead of hanging or failing hard.
- Recommendation: keep `https://gestaltv1ew.vercel.app` as the canonical base in any trainer-facing runtime config, while leaving local proxy fallbacks available for development.
- Recommendation: keep lightweight route tests around the trainer API surface so request-contract regressions are caught before they show up as dashboard degradation.

---

---

# CurrentState — Agent Trainer queue purge + end-to-end verification

**Last updated:** 2026-04-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Bug IDs covered:** stale trainer queue purge / live trainer-job schema compatibility / end-to-end run verification
**Scope of this pass:** Cleared the remaining live trainer backlog, then ran a fresh training cycle end to end so the control plane is verified against the current Supabase schema rather than an assumed one.

## Executive summary (2026-04-19)

- Purged the remaining live trainer rows from `training_runs` and the dependent trainer tables, leaving the queue empty before verification.
- Started a fresh synthetic verification run with slug `end-to-end-verify-20260419`.
- The run completed to `awaiting_review` with a new version id `18b772c9-f888-4193-8f8e-b5de86d64edb`, and the backing `trainer_jobs` row was settled to `done`.
- Live schema inspection showed `trainer_jobs` does not expose `completed_at` or `cancel_requested`, so `server/agent-trainer/persistence.ts` was updated to avoid writing those columns during job completion and settlement.
- Rebuilt the project successfully after the compatibility fix.

## Validation performed

- Live purge of all remaining trainer runs in Supabase
- Fresh end-to-end trainer run `83ce0b7e-2805-4bd0-a51a-4a4be903c88b`
- `npm run build`

## Remaining risks / next steps

1. Keep the job-finalization writes aligned with the live `trainer_jobs` schema if that table evolves again.
2. If the queue is intentionally repopulated later, re-run the same purge-and-verify sequence so the admin dashboard starts from a known clean state.

## Overall repo state and recommendations

- The live trainer backlog is no longer blocking a verification run.
- The trainer control plane now has a compatibility guard for the slimmer live `trainer_jobs` row shape, which avoids a false failure during job settlement.

---

---

# CurrentState — Session continuity packet surfaced in README/COLAB

**Last updated:** 2026-04-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Surfaced the context-persistence protocol, checklist, and handoff packet from the top-level repo entrypoints so a fresh session can orient and close out without digging through the full docs tree first.

## Executive summary (2026-04-19)

- Added `docs/ContextPersistenceProtocol.md` for durable context rules.
- Added `docs/ContextPersistenceChecklist.md` for fast closeout.
- Added `docs/SessionHandoffPacket.md` for copy-ready session restart notes.
- Linked the new continuity docs from both `README.md` and `COLAB.md` so they are visible at the top of the repository.

## Validation performed

- Updated `README.md`
- Updated `COLAB.md`
- Updated `docs/Manifest.md`
- Regenerated repo manifests

## Remaining risks / next steps

1. Keep the continuity docs short and factual so they stay usable under time pressure.
2. If the operating flow changes again, refresh the pointers in README/COLAB before the next handoff.

## Overall repo state and recommendations

- Fresh sessions now have a clear entry path for orientation, closeout, and resumable handoff.
- The new docs should reduce re-reading and make collaboration cleaner for both the founder and the agent.

---

---

# CurrentState — Agent Trainer API/Auth end-to-end recommendations path

**Last updated:** 2026-04-15
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Bug IDs covered:** BW-2026-04-13
**Scope of this pass:** Restored AgentTrainerPage study-source recommendation flow by aligning the recommendations API route with the current client POST contract while preserving legacy GET compatibility for older callers.

## Executive summary (2026-04-15)

- Confirmed the runtime mismatch: `client/src/features/agent-trainer/lib/trainerApi.ts` sends POST requests to `/api/trainer/study-sources/recommendations`, while the API handler only accepted GET with `runDraft` in query params.
- Updated `api/trainer/study-sources/recommendations.ts` to accept both POST and GET methods so current control-plane traffic and legacy route consumers both work.
- Added robust draft parsing logic for both payload forms:
  - POST body (`req.body` as object/string, with optional `runDraft` envelope)
  - GET `runDraft` query payload (legacy path)
- Added limit parsing from query/body and improved request error handling by returning `400` for missing/malformed draft payloads instead of generic `500` responses.
- Added route-focused coverage in `api/__tests__/trainer-study-sources-recommendations-route.test.ts` to verify POST compatibility, legacy GET behavior, and malformed payload handling.
- Updated `bugwalks/BugWalkBoard.md` to move BW-2026-04-13 into `Shipped / Verify` with fix notes and validation evidence.

## Validation performed

- `pnpm exec vitest run api/__tests__/trainer-study-sources-recommendations-route.test.ts`

## Remaining risks / next steps

1. Run a live control-plane verification in deployed environment with real Supabase auth to confirm recommendation fetch, queue updates, and run submission all complete in one session without auth drops.
2. If intermittent auth expiration still appears in production, add request-ID logging in trainer routes to correlate client diagnostics with server logs for token lifecycle and upstream latency analysis.
3. Expand API integration coverage for other AgentTrainerPage endpoints (`/api/trainer/runs`, `/api/trainer/queue-health`, `/api/trainer/personhood`) so the full admin workflow has method/contract regression protection.

## Overall repo state and recommendations

- The known BW-2026-04-13 method-contract break is now addressed at the API boundary, which restores practical end-to-end recommendation generation for AgentTrainerPage.
- Recommendation: treat shared client/server trainer route contracts as explicit, versioned interfaces and add lightweight route tests whenever handler methods or payload shapes change.
- Recommendation: continue dual-log closeout discipline (`bugwalks/BugWalkBoard.md` + `docs/CurrentState.md` together) for every walkthrough-driven runtime fix.

---

**Last updated:** 2026-04-13
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Made `.orientation/` a mandatory repo check-in surface by adding a dedicated validation gate, wiring it into manifest sync, teaching the manifest generator to scan the hidden directory, and adding CI coverage.

## Executive summary (2026-04-13)

- Added `scripts/test-orientation-checkin.sh` so the repository can fail fast when the `.orientation/` packet directory is missing, malformed, or left dirty in git.
- Wired that gate into `scripts/test-manifest-sync.sh` so Phase 5 sync now treats `.orientation/` as part of the mandatory check-in surface.
- Added `.orientation` to `scripts/generate_repo_manifest.py` scan coverage so the manifest layer now indexes the orientation packet files.
- Added `npm run orientation:check` plus `.github/workflows/orientation-check.yml` so the check-in gate is available locally and enforced on PR/push.
- Updated `README.md`, `docs/Manifest.md`, and `docs/Workflows.md` to document the new orientation requirement.

## Validation performed

- `bash scripts/test-orientation-checkin.sh`
- `bash scripts/test-manifest-sync.sh`
- `python3 scripts/generate_repo_manifest.py --output-dir docs`
- `python3 scripts/generate_repo_manifest.py --output-dir /tmp/gv-manifest-check`
- `git diff --check`

## Remaining risks / next steps

1. Run `bash scripts/test-orientation-checkin.sh` and `bash scripts/test-manifest-sync.sh` after the change set lands to confirm the new gate behaves as expected.
2. If the orientation packet schema changes, update the validation script rather than letting the packet format drift silently.
3. Consider adding the new orientation gate to any other repo-side launcher that currently assumes only manifest sync is required.

---

---

## CurrentState — Trainer API network fallback hardening (2026-04-13)

**Scope of this pass:** Hardened the Agent Trainer API client so control-plane calls can recover from local `/api` proxy/network misses by retrying against an explicit configured API origin when available.

### What changed

- Updated `client/src/features/agent-trainer/lib/trainerApi.ts` request flow:
  - Added `normalizeApiBaseUrl` + `buildAbsoluteApiUrl` helpers.
  - Added a network-failure fallback path that retries failed relative `/api/*` requests against `VITE_API_BASE_URL` (or `VITE_API_PROXY_TARGET`) when those point to a different origin.
  - Preserved existing diagnostics payload semantics (`requestPath`, cause, auth header signal) so the trainer diagnostic card remains actionable.

### Validation performed

- `npx vitest run client/src/tests/agent-trainer-api.test.ts`

### Next steps / recommendations

1. Ensure local/dev environments set `VITE_API_BASE_URL` when the default `/api` proxy path is not stable (for example, when running the SPA independently of a local API server).
2. If trainer diagnostics still show `Failed to fetch`, verify the configured API origin is reachable and that auth bearer tokens are valid for that backend.

---

---

# CurrentState — Temporal metadata backfill + ingest wiring

**Last updated:** 2026-04-13
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added a repo-local temporal metadata helper, wired it into corpus ingestion, and introduced a schema migration plus backfill entrypoint so existing and future corpus rows can carry timeline state consistently.

## Executive summary (2026-04-13)

- Added `temporal/gestaltview_temporal.py` as the canonical temporal helper for deriving `temporal_period`, `timeline_folder`, and backfill SQL from the repo's timeline map.
- Wired `scripts/ingest_corpus.py` to populate temporal metadata on new `documents` and `knowledge_fragments` rows during ingestion.
- Added `scripts/temporal_backfill.py` plus `npm run temporal:backfill` so the backfill SQL can be regenerated or printed from a stable repo entrypoint.
- Added `supabase/migrations/20260413120000_add_temporal_metadata_to_corpus_tables.sql` and updated the checked-in schema snapshots so the live corpus tables can store temporal metadata.
- Corrected the fragment backfill join to match `documents.path` against `compendium/{package}/{source_file}` rather than assuming identical paths.

## Validation performed

- `python3 -m py_compile scripts/ingest_corpus.py scripts/temporal_backfill.py temporal/gestaltview_temporal.py temporal/__init__.py`
- `python3 scripts/temporal_backfill.py --help`

## Remaining risks / next steps

1. Apply `supabase/migrations/20260413120000_add_temporal_metadata_to_corpus_tables.sql` before relying on the new ingest fields in a live Supabase project.
2. Run `npm run temporal:backfill -- --write` or paste the generated SQL into Supabase once the schema is in place.
3. If additional corpus packages need era-specific rules, extend the shared timeline map in `temporal/gestaltview_temporal.py` rather than duplicating ad hoc backfill logic.

---

---

## CurrentState — Production origin + CORS/domain alignment refresh (2026-04-12)

**Scope of this pass:** Aligned API-facing origin defaults, OpenAPI server declarations, and public sitemap/robots host references to the current deployment host `https://gestaltv1ew.vercel.app` after domain migration from `https://gestaltview-dig-cog.vercel.app`.

### What changed

- Updated API fallback/default origin references used by runtime and CORS-sensitive paths:
  - `api/voice/billy.ts` (`DEFAULT_CORS_ORIGIN`)
  - `api/stripe/checkout.ts` (`FALLBACK_ORIGIN`)
  - `api/_lib/llmRouter.ts` (`HTTP-Referer` for OpenRouter requests)
- Updated API CORS test fixtures to reflect the new canonical primary origin:
  - `api/__tests__/cors.test.ts`
- Updated API action package OpenAPI server URLs:
  - `api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_actions_core.openapi.yaml`
  - `api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_actions_comprehensive.openapi.yaml`
- Updated public host references for crawl/index assets so canonical URLs match the migrated domain:
  - `public/*` and `client/public/*` sitemap/robots assets
  - `client/src/pages/gestaltview_sitemap.{txt,xml,html}`

### Validation performed

- Ran targeted API CORS tests:
  - `npx vitest run --config vitest.api.config.ts api/__tests__/cors.test.ts`

### Next steps / recommendations

1. Ensure Vercel project env var `CORS_ORIGINS` includes the canonical host and required preview domains.
2. If old domain traffic is still expected, keep host-level redirects active at Vercel to preserve existing backlinks.
3. Optionally regenerate any derived docs/context bundles that embed host references (e.g., context-pack snapshots) so non-runtime documentation stays consistent.

---

---

# CurrentState — Digital Intelligence invariants ratification

**Last updated:** 2026-04-11
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Formalized `GestaltView_Constitutional_Invariants_v1.0.md` as a canonical repo charter, bundled it into `client/src/canonical/`, and refreshed the manifest/orientation layer around it.

## Executive summary (2026-04-11)

- Elevated `GestaltView_Constitutional_Invariants_v1.0.md` from a standalone draft into a canonical charter-style document with version, status, scope, and an explicit statement of standing.
- Preserved the five invariant statements and closing benediction while making the file easier to cite as repo doctrine.
- Updated `README.md` and `docs/Manifest.md` so repo orientation now treats the invariants as a first-class foundational document alongside the personhood framework and operating workflow docs.
- Added `client/src/canonical/GestaltView_Constitutional_Invariants_v1.0.md` so the app-bundled canonical context now carries the same charter.
- Refreshed the generated repo manifests so both the repo-root charter and bundled client copy are indexed by the manifest pipeline.

## Validation performed

- Checked the added `README.md` and `docs/Manifest.md` references against the live root file path.
- Confirmed `client/src/canonical/GestaltView_Constitutional_Invariants_v1.0.md` is present alongside the other bundled canonical markdown files.
- `python3 scripts/generate_repo_manifest.py`
- `git diff --check`

## Remaining risks / next steps

1. If these invariants are meant to drive concrete runtime or operator enforcement, identify which policies, prompts, or review gates should cite them explicitly.
2. The repo now carries both a root canonical charter and a bundled client copy; if drift becomes a problem, consolidate them behind a single source-of-truth generation step.

---

---

# CurrentState — Bug fix dual-log closeout protocol

**Last updated:** 2026-04-11
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Bug IDs covered:** workflow / BugWalk closeout protocol
**Scope of this pass:** Formalized a same-pass bug-fix closeout loop so `bugwalks/BugWalkBoard.md` and `docs/CurrentState.md` are updated together, including failed attempts when a bug persists.

## Executive summary (2026-04-11)

- Updated `bugwalks/README.md` and `bugwalks/_BugWalkTemplate.md` so the board workflow now explicitly requires a dual-log closeout: board card plus `CurrentState.md` entry in the same change.
- Updated `bugwalks/BugWalkBoard.md` itself to surface the dual-log rule at the top of the live board, where bug work actually happens.
- Added `scripts/bugwalk-closeout.sh` and `npm run bugwalk:close` to scaffold paired board-update and `CurrentState.md` closeout blocks for a specific BugWalk ID.
- Added an explicit persistence rule: if a bug still reproduces after an attempted fix, record what changed and what did not work instead of prematurely marking it shipped.

## Validation performed

- `bash scripts/bugwalk-closeout.sh --help`
- `bash scripts/bugwalk-closeout.sh BW-2026-04-09-05 "package builder inputs bounced" --note-dir /tmp/gv-bugwalk-closeout-test --validation "npm run build"`
- Verified the scaffold note includes both a board-update stub and a `CurrentState.md` entry stub.
- `git diff --check`

## What did not work / persistence signals

- `n/a` for the protocol itself, but older historical BugWalk cards still contain `CurrentState link: pending` and no `Attempt log`; those should be backfilled as the related bugs are revisited.

## Remaining risks / next steps

1. This protocol is still only partially enforced socially; if drift continues, add a lightweight repo check that flags `Shipped / Verify` cards without a real `CurrentState link`.
2. Backfill `Attempt log` and non-pending `CurrentState link` fields on older cards when those bugs are touched again.
3. Use `npm run bugwalk:close -- <BUG_ID> "short title"` at the end of every board-driven fix pass so the dual update becomes habit instead of aspiration.

---

---

## CurrentState — Admin workbook integration and trainer governance layer (2026-04-10)

**Scope of this pass:** Implemented the admin workbook registry, trainer experiment governance layer, and founder-only packaging gate described in `admin/GestaltView_AdminDashboard_WorkbookIntegration_SPEC.md`.

### What changed

- Added Supabase migration `supabase/migrations/20260410213000_workbook_and_experiment_governance.sql` with workbook sync tables, trainer governance tables, packaging candidates, and an explicit `training_runs.experiment_id` link.
- Added server repositories at `server/workbook/workbook-repository.ts` and `server/trainer/experiment-repository.ts` to centralize workbook CRUD, experiment detail assembly, review/flag persistence, and packaging gate evaluation.
- Added admin API routes under `api/workbook/*` and `api/trainer/experiments*` / `api/trainer/packaging-candidates*` for workbook sync, experiment lifecycle operations, policy flags, review decisions, and guarded packaging nomination/approval.
- Extended `shared/agent-trainer/schemas.ts` and added `shared/workbook/schemas.ts` so the new governance/workbook flows share typed request/response contracts across server and client.
- Updated `client/src/pages/DashboardPage.tsx` to expose new `Workbook` and `Packaging` founder-admin tabs, with `client/src/features/workbook/WorkbookSyncPanel.tsx` handling CSV/JSON sync and inline editing.
- Updated `client/src/features/agent-trainer/AgentTrainerPage.tsx` to add the `ExperimentRegistry` and `ReviewQueuePanel`, linking runs to experiments and enforcing policy-flag-aware review decisions before approval or promotion.
- Added targeted API tests for workbook upsert normalization and packaging-gate `409` behavior in `api/__tests__/workbook-items.test.ts` and `api/__tests__/trainer-packaging-candidates.test.ts`.

### Validation performed

- `pnpm exec tsc --noEmit --pretty false`
- Planned API spot coverage:
  - `api/__tests__/workbook-items.test.ts`
  - `api/__tests__/trainer-packaging-candidates.test.ts`

### Notes / follow-up

- The workbook import path is implemented as CSV/JSON sync rather than native `.xlsx` parsing so the runtime control plane works without introducing a new spreadsheet dependency.
- `docs/gestaltview-v2.manifest.json` and `docs/gestaltview-v2.manifest.md` should be regenerated after the final verification pass if this governance surface becomes the new baseline snapshot.

---

---

# CurrentState — Agent Trainer Supabase cleanup runbook

**Last updated:** 2026-04-10
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Converted the Agent Trainer pipeline cleanup note into a schema-aware Supabase SQL runbook, then added a dedicated Agent Trainer package-corpus ingest path and GitHub Actions entry point for the package-builder source library.

## Executive summary (2026-04-10)

- Reworked `supabase/PipelineCleanup.md` around the repo's checked-in snake_case corpus schema.
- Replaced stale camelCase/table names with `documents.document_id`, `embeddings.document_id`, `knowledge_fragments.source_file`, `skill_fragments.source_file`, and `processing_runs.run_id`.
- Added a rollback-first deletion transaction that ranks heavy Dynamic Corpus candidates, deletes by chosen `document_id`, cleans fragment/vector rows, and removes ingestion runs only when they become empty.
- Updated the cleanup runbook from the latest `supabase/HeavyCorpus.md` results: the six `knowledge-corpus` Dynamic Corpus rows and three Founder dynamic rows are now gone, leaving only the tiny `skills-folder` `dynamic-routing.md` row.
- Added `scripts/ingest_agent_trainer_corpus.py`, a root-level Agent Trainer ingest script that writes package-builder source-library content into the existing `documents`, `knowledge_fragments`, and optional `embeddings` tables.
- Added `pnpm run ingest:agent-trainer` as the repo command for the new script.
- Added `.github/workflows/ingest_agent_files.yml` as a manual GitHub Actions entry point that defaults to dry-run and no-embedding mode before live Supabase writes.
- Kept the Agent Trainer source library in shared corpus tables with strict tags (`agent-trainer-package`, `package:agent-trainer-package`, `package-builder`, `source-library`) instead of adding dedicated tables prematurely.
- Updated `bugwalks/BugWalkBoard.md` so BW-2026-04-09-09 now points to live Agent Trainer corpus ingest as the next verification step.

## Validation performed

- Cross-checked the runbook against `supabase/schema.sql`, `supabase/types.ts`, `scripts/ingest_corpus.py`, and the candidate output in `supabase/HeavyCorpus.md`.
- `python3 -m py_compile scripts/ingest_agent_trainer_corpus.py`
- `python3 scripts/ingest_agent_trainer_corpus.py --dry-run --no-embed`
  - dry-run found 131 candidate files and 233 chunks
  - no files were skipped
- `git diff --check`
- Confirmed `.github/workflows/ingest_agent_files.yml` has no trailing whitespace.

## Remaining risks / next steps

1. Leave the tiny `skills-folder` `dynamic-routing.md` row alone unless a future cleanup goal shifts from quota relief to exact keyword pruning.
2. Run `pnpm run ingest:agent-trainer --no-embed` locally or dispatch `.github/workflows/ingest_agent_files.yml` with `dry_run=false` first if speed and text search are enough.
3. Verify the new `agent_trainer/` package-corpus sources appear in Supabase-backed package/trainer retrieval after ingest.

---

---

# CurrentState — Admin Trainer Agent Personhood Framework

**Last updated:** 2026-04-10
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented the first Admin Trainer personhood foundation from `SPEC-1-GestaltView Agent Personhood Framework.md`, confirmed the Agent Trainer package corpus export evidence, and added a separate curated skill for Admin Trainer Agent Knowledge work.

## Executive summary (2026-04-10)

- Confirmed the Agent Trainer package corpus export in `agent_trainer/supabase/manifest/`: `documents_rows (1).json` contains 100 rows and 100 unique paths, `documents_rows (2).json` contains 31 rows and 31 unique paths, and the combined exports cover 131 unique source paths tagged as `agent-trainer-package` with `package_builder_source=true`.
- Moved `BW-2026-04-09-09` in `bugwalks/BugWalkBoard.md` from open ingestion work into `Shipped / Verify`; the remaining work is retrieval spot-checking.
- Added `supabase/migrations/20260410190000_agent_personhood_framework.sql` with the communal Agent Knowledge Library tables, interpretation/mutation tables, memory/skill/relationship projection tables, manifest/code-artifact tables, service-role RLS, indexes, active manifest views, and optional private storage buckets.
- Added the Admin Trainer personhood service in `server/agent-trainer/personhood.ts` for manifest rebuilds, file-pull assembly, personhood snapshot loading, and local export fallback.
- After the migration was applied, tightened the snapshot path so an empty new `knowledge_assets` table can still surface the already-ingested `documents` rows tagged as `agent-trainer-package` until a deliberate library backfill promotes them.
- Added gated API routes for personhood state and active manifest/file pulls:
  - `api/trainer/personhood.ts`
  - `api/agents/[slug]/manifest.ts`
  - `api/agents/[slug]/files.ts`
- Updated `deployAgentVersion(...)` so a deployed trainer version rebuilds the active manifest along with the active agent version.
- Extended shared trainer contracts and the Admin Trainer UI to surface Agent Knowledge Library counts, active manifests, pending mutations, local manifest evidence, and recent library paths.
- Added the separate curated skill `skills/gestaltview-admin-trainer-personhood/` and promoted it through `skills/manifest.json`, `skills/INDEX.md`, and `skills/agents/AGENTS.md`. This skill is intentionally separate from the sellable `agent_trainer/gestaltview_agent_trainer` package and from the existing `gestaltview-agent-trainer` run/eval skill.
- Updated `README.md` so the root repo orientation now states the GestaltView runtime philosophy: persistent digital intelligences, Admin Trainer as internal school/embodiment console, communal Agent Knowledge Library, review-gated personhood mutation, and manifest-backed reconstruction.

## Validation performed

- `python3 -m json.tool skills/manifest.json`
- `jq -r ... agent_trainer/supabase/manifest/documents_rows (1).json`
- `jq -r ... agent_trainer/supabase/manifest/documents_rows (2).json`
- `pnpm exec tsc --noEmit`
- `pnpm exec vitest run --config vitest.api.config.ts api/__tests__/agent-trainer-embodiment.test.ts api/__tests__/trainer-study-sources.test.ts`
- `git diff --check`

## Remaining risks / next steps

1. Backfill selected `documents` rows into first-class `knowledge_assets` / `knowledge_asset_chunks` after confirming the approval policy for package-builder sources.
2. Spot-check package/trainer retrieval against the 131 exported `agent-trainer-package` paths.
3. Add mutation proposal/apply actions after the schema foundation is live and the review workflow is ready for operators.

---

---

# CurrentState — BugWalk board operating standard

**Last updated:** 2026-04-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Established a repo-standard BugWalk operating loop so walkthrough findings stop living only in raw captures or chat and instead roll into a maintained board plus the existing `CurrentState.md` ledger.

## Executive summary (2026-04-09)

- Added a dedicated BugWalk board under `bugwalks/` to track walkthrough issues in a lightweight, human-readable format.
- Documented the maintenance rule: the BugWalk board is the live triage surface, while `docs/CurrentState.md` remains the canonical technical log for changes that land.
- Seeded the board from the 2026-04-09 walkthrough capture so it starts with real issues and current status instead of an empty template.

## What changed

- Added:
  - `bugwalks/BugWalkBoard.md`
  - `bugwalks/README.md`
  - `bugwalks/_BugWalkTemplate.md`
  - `scripts/new-bugwalk.sh`
- Updated:
  - `README.md`
  - `package.json`
  - `docs/CurrentState.md`

## Why this was needed

- The repo already had a strong `CurrentState.md` habit for durable technical state, but walkthrough findings were still at risk of getting stranded in raw transcripts or one-off captures.
- A dedicated board closes the gap between “we noticed this” and “we implemented and verified this.”

## Validation performed

- `npm run bugwalk:new -- --help`
- Verified note creation plus card insertion against a temporary board copy using `scripts/new-bugwalk.sh --bugwalk-dir ... --board ...`

## Current repo condition after this pass

1. The repo now has a standard operating loop for BugWalk capture, triage, in-flight work, and shipped verification.
2. Walkthrough findings can be tracked in one place without bloating `CurrentState.md` with raw issue intake.
3. A repo-local scaffold command now creates dated BugWalk intake notes and inserts starter board cards with the next available ID.
4. The April 9, 2026 bugwalk has been normalized into a living board with open follow-ups and shipped-in-workspace items.

## Remaining risks / next steps

1. Keep the board current in the same pass as bug-fix work; if it drifts, it loses value quickly.
2. Rename future raw capture files with `YYYY-MM-DD-<slug>` so source artifacts are easier to find.
3. Promote shipped items from the board into `CurrentState.md` whenever the implementation details become durable repo state.

## Overall repo state and recommendations

- The repo now has a cleaner separation between issue intake and implementation history.
- Recommendation: treat `bugwalks/BugWalkBoard.md` as the required companion update for any walkthrough-driven fix pass.

---

---

# CurrentState — Vercel timeout mitigation from 2026-04-08 log export review

**Last updated:** 2026-04-08
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Reviewed `gestaltview-v2-log-export-2026-04-08T00-56-38.json` and hardened auth/Supabase request paths to fail fast instead of consuming the full Vercel function timeout window.

## Executive summary (2026-04-08)

- Reviewed the exported production log file and confirmed repeated `504` responses with `"Vercel Runtime Timeout Error: Task timed out after 300 seconds"` across:
  - `/api/trainer/agents`
  - `/api/trainer/scenario-sets`
  - `/api/trainer/runs`
  - `/api/trainer/study-sources`
  - `/api/session/dashboard`
  - `/api/session/memory`
- Also observed many `401` responses that still consumed very high function durations (roughly 118s–170s+), indicating auth/network stalls before unauthorized responses were returned.
- Implemented bounded-time guards for both auth lookup and Supabase REST calls so transient backend stalls return promptly instead of burning the full runtime budget.

## What changed

- Updated `api/_lib/auth.ts`:
  - Added `AUTH_CALL_TIMEOUT_MS` (default `4000`).
  - Added `withTimeout(...)` helper and wrapped:
    - `supabase.auth.getUser(token)`
    - `users` profile lookup query
  - On timeout/error, auth gracefully falls back to existing unauthenticated handling (`401`) without waiting for multi-minute hangs.

- Updated `api/_lib/supabase.ts`:
  - Added `SUPABASE_REQUEST_TIMEOUT_MS` (default `12000`).
  - Added `AbortController` timeout wrapping in the internal `request(...)` helper for all REST calls.
  - Ensures stalled Supabase fetches abort promptly and release function runtime.

- Updated `docs/CurrentState.md` with this pass details.

## Why this was needed

- The reviewed log export showed a clear pattern of runtime exhaustion and very long request durations for endpoints that should typically fail quickly on auth errors or degraded backend availability.
- Fast-fail behavior is safer operationally on Vercel because it preserves concurrency headroom, reduces cascading queue pressure, and gives callers deterministic error timing.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/dashboard.test.ts api/__tests__/memory.test.ts api/__tests__/trainer-study-sources.test.ts`

## Current repo condition after this pass

1. Auth validation and profile hydration no longer wait unboundedly during upstream stalls.
2. Supabase REST helper requests now have an explicit timeout ceiling.
3. Affected API surfaces now fail fast under degraded Supabase/Auth conditions rather than commonly hitting Vercel 300s hard timeouts.

## Remaining risks / next steps

1. Add explicit structured logging for timeout cases (`auth_request_timeout`, `supabase_request_timeout`) to improve operational observability in Vercel logs.
2. Consider separate timeout budgets per route class (read-only listing vs. mutation).
3. Evaluate adding retry with jitter for idempotent GET calls where short transient blips are common.

## Overall repo state and recommendations

- The immediate timeout failure mode observed in the provided 2026-04-08 log export is now mitigated at shared request/auth layers.
- Recommendation: keep these timeout env values configurable per environment and monitor post-deploy timeout/error-rate deltas for 24–48 hours.

---

---

# CurrentState — Agent Trainer TypeScript build recovery (Perplexity merge compatibility)

**Last updated:** 2026-04-07
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Repaired `npm run build` (`tsc && vite build`) failures introduced by API/type-shape drift in `AgentTrainerPage` after recent upstream changes.

## Executive summary (2026-04-07)

- Build failed with exit code 2 in `client/src/features/agent-trainer/AgentTrainerPage.tsx` due to stale UI field usage against newer trainer schemas/hook APIs.
- Updated the page to align with current shared schemas and hook method names:
  - `run.id` ➜ `run.runId`
  - `latestVersion.id` ➜ `latestVersion.versionId`
  - scenario set/list fields switched to `scenarioSetId`/`title`
  - study source path fields switched to `sourceFile`
  - trainer mutations switched to `approveRun` / `rejectRun` / `deployRun`
- Fixed module typing issue by replacing `React.*` namespace usage with direct imports (`forwardRef`, `ComponentProps`) so TypeScript no longer expects a global `React` UMD binding.

## What changed

- Updated:
  - `client/src/features/agent-trainer/AgentTrainerPage.tsx`
  - `docs/CurrentState.md`

## Why this was needed

- Recent backend/shared schema evolution changed response object keys and action signatures, but the UI still referenced legacy names.
- TypeScript compile is a hard gate in this repo (`tsc && vite build`), so these mismatches blocked deployment.

## Validation performed

- `npm run build`

## Current repo condition after this pass

1. Agent Trainer page now compiles against the current shared schema and hook API contracts.
2. Build exit code 2 regression is resolved locally.
3. Vite production bundle completes successfully (existing non-fatal asset/chunk warnings remain unchanged).

## Remaining risks / next steps

1. Add a typed view-model adapter layer in trainer UI to isolate rendering components from direct API key-name drift.
2. Add a focused test (or TS assertion fixture) around `AgentTrainerPage` to catch schema/key regressions earlier.
3. Optional polish: disable scenario-set checkboxes for rows missing `scenarioSetId` is in place; consider surfacing helper text explaining why a row is disabled.

## Overall repo state and recommendations

- The immediate blocker (`build` failing with TS errors in Agent Trainer) is fixed.
- Recommendation: keep `npm run build` required in CI for changes touching `client/src/features/agent-trainer` and shared trainer schemas.

---

---

# CurrentState — GATE live drafts + Supabase-backed package builder

**Last updated:** 2026-04-06
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Stabilized package-builder identity inputs on mobile, added explicit reset/start-over controls, and enabled admin checkout bypass for package-generation/testing flows.

## Executive summary (2026-04-06 · package builder UX + admin bypass)

- Step 5/6 identity fields now avoid autosave churn while actively focused, which reduces “jumping” behavior reported on mobile while typing business name/email/notes.
- Added explicit max-length constraints in the UI to match backend schema limits for company name, buyer email, logo path, and notes so oversized input no longer fails unexpectedly at save time.
- Added a dedicated **Start Over** action that resets selections, clears draft linkage, removes local snapshot state, and returns the wizard to Step 1.
- Admin users can now generate packages without payment by forcing mock checkout in the builder client flow (with CTA labeling that makes admin bypass state obvious).

## What changed in this pass

- Updated:
  - `client/src/components/GATEEntrypointWizard.tsx`
  - `docs/CurrentState.md`

## Why this was needed

- Reported production behavior showed identity fields (business name/email) feeling unstable while typing and save/generate flows surfacing generic failures.
- The previous UI allowed unconstrained text length while backend schema enforces strict maxima, which could trigger avoidable request failures.
- The builder had no one-click “clear selections/start over” affordance.
- Internal package testing required a smoother admin bypass path rather than forcing paid checkout semantics.

## Validation performed

- `pnpm exec tsc --noEmit`
- `pnpm exec vitest run -c vitest.api.config.ts api/__tests__/gate.test.ts`

## Current repo condition after this pass

1. Package builder typing is more stable during focused identity/notes editing because autosave no longer mutates draft state while those fields are actively being edited.
2. Builder input constraints now align with backend validation envelopes for the most failure-prone text fields.
3. Operators can intentionally reset draft state in one action through Start Over.
4. Admin users can complete package generation flows in mock-payment mode directly from the builder UI.

## Remaining risks / next steps

1. Consider adding an explicit error mapping layer from backend validation errors to field-level helper text (instead of banner-only failure output).
2. Add frontend integration coverage for Start Over and admin bypass behavior to prevent regressions.
3. If users still report input instability on specific mobile browsers, capture a remote session and test keyboard/viewport interactions with browser-level tracing.

## Overall repo state and recommendations

- The GATE builder now better supports real operator testing and QA loops without payment friction for admins.
- UX resilience is improved, but the next quality step is field-level validation UX and stronger e2e coverage around draft lifecycle actions.

---

**Last updated:** 2026-04-06
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Moved the GATE package builder from function-local draft/order/build state toward live Supabase-backed persistence and storage, enabled autosaved live drafts in the builder UI, and hardened package generation for deployed/serverless environments.

## Executive summary (2026-04-06)

- The GATE package builder is now live-draft oriented: `/agent-trainer/package-builder` creates and updates a real draft as the user edits instead of relying only on local browser snapshot state.
- Drafts, orders, build jobs, support requests, and artifact metadata now use Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
- Generated ZIP artifacts now upload to Supabase Storage and order detail responses issue signed download URLs instead of assuming repo-local files and download tokens only.
- A follow-up migration was added because the original `package_drafts` table shape did not persist `buyer_email` and `company_name`, which caused live drafts to lose buyer identity fields on reload.
- Local fallback behavior still exists for tests and non-Supabase environments, but the intended production path is now Supabase-backed.

## What changed

- Added:
  - `server/gate/repository.ts`
  - `server/gate/supabase.ts`
  - `supabase/migrations/20260406193500_add_gate_draft_contact_fields.sql`
- Updated:
  - `client/src/components/GATEEntrypointWizard.tsx`
  - `server/gate/service.ts`
  - `server/gate/builder.ts`
  - `server/gate/store.ts`
  - `server/gate/zip.ts`
  - `shared/gate/schemas.ts`
  - `api/__tests__/gate.test.ts`
  - `vercel.json`
  - `tsconfig.json`
  - `docs/CurrentState.md`

## Why this was needed

- The first GATE implementation could create the package-builder flow and package ZIPs, but its draft/order/build persistence was still local to the function runtime.
- That was not sufficient for production because live drafts would disappear across cold starts or multiple instances, and deployed/serverless environments could not safely depend on writing inside the repo or invoking a shell `zip` binary.
- The original Supabase migration also stored only `buyer_id` on `package_drafts`, which meant buyer contact fields were not durably round-tripped with the draft itself.
- The builder UI still behaved like a manual save flow, which was at odds with the request for “live live drafts.”

## Validation performed

- `pnpm exec tsc --noEmit`
- `pnpm exec vitest run -c vitest.api.config.ts`
- `pnpm exec vitest run -c vitest.api.config.ts api/__tests__/gate.test.ts`

## Current repo condition after this pass

1. The GATE builder now autosaves changes into a real draft and keeps the draft identifier in the URL so the flow can be resumed after refresh or revisit.
2. The server now supports a Supabase-backed production path for drafts, buyers, orders, order items, build jobs, support requests, artifact metadata, and generated ZIP uploads.
3. Package generation is now more deployment-safe because it uses `/tmp` for writable runtime paths and an internal ZIP writer instead of a shell dependency.
4. Order detail responses in Supabase mode now return signed Storage URLs for artifacts, which removes the need to depend on local filesystem delivery for the primary download path.
5. Local JSON/file fallback behavior is still available and is what the automated tests exercise after clearing Supabase env vars.

## Remaining risks / next steps

1. Run the new migration `supabase/migrations/20260406193500_add_gate_draft_contact_fields.sql` before relying on live drafts in production.
2. Ensure the Storage bucket exists. By default the code expects `generated-zips` unless `GATE_STORAGE_BUCKET` is set.
3. The Stripe webhook handler under `api/gate/[...path].ts` still reconstructs the request body from parsed JSON; for production Stripe verification it should be moved to a raw-body-safe path or otherwise updated.
4. The legacy `/api/gate/orders/:id/download` endpoint is not the primary Supabase delivery path anymore. In Supabase mode the UI should use signed URLs returned from order detail responses.
5. The Supabase boundary is intentionally schema-light in code right now. If tighter DB typing becomes valuable later, introduce a generated database type rather than hand-maintaining deep client generics.

## Overall repo state and recommendations

- The GATE package builder has crossed from “demo flow with local persistence” into a credible production architecture for live drafts and generated artifact delivery.
- The immediate production checklist is now operational rather than architectural: apply the new draft-contact migration, create/confirm the Storage bucket, and fix the Stripe webhook raw-body path.
- Keep the local fallback path for tests, but treat Supabase as the default production system of record for GATE state going forward.

---

---

# CurrentState — GATE builder stability + admin checkout bypass controls

**Last updated:** 2026-04-06
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed package-builder draft-entry instability and save/checkout failures while users are still typing contact fields, added explicit reset controls, and enabled authenticated admins to simulate checkout payment in production for package-generation QA.

## Executive summary (2026-04-06)

- The package-builder form now avoids server-roundtrip rehydration during autosave/manual save, preventing text inputs (notably **Company Name** and **Buyer Email**) from being overwritten while a user is typing.
- Live draft persistence now tolerates in-progress/non-email values in `buyerEmail` while editing by skipping buyer-link upsert until the value is a syntactically valid email.
- Added a **Start Over** control that clears the active draft context and local snapshot so users can reset selections from within the wizard.
- Added an explicit admin-mode checkout bypass in the UI: authenticated admins now send `mockPayment: true` in checkout requests, which triggers simulated payment and package generation without charging Stripe.
- Added regression coverage to ensure PATCH draft saves succeed with invalid/in-progress buyer email values.

## What changed

- Updated:
  - `client/src/components/GATEEntrypointWizard.tsx`
  - `server/gate/service.ts`
  - `api/__tests__/gate.test.ts`
  - `docs/CurrentState.md`

## Why this was needed

- Real mobile and production usage showed two reliability gaps:
  1. text-entry UX degraded under frequent draft autosaves, and
  2. save/generate actions surfaced generic request failures while contact fields were mid-edit and not yet final.
- Package-builder operators also needed a first-class in-flow reset action and a non-billing admin testing path to validate build-generation/storage behavior in production.

## Validation performed

- `pnpm exec vitest run -c vitest.api.config.ts api/__tests__/gate.test.ts`
- `pnpm exec tsc --noEmit`

## Current repo condition after this pass

1. Step 5 identity inputs are no longer replaced by server responses during active editing/autosave cycles.
2. Draft saves no longer fail solely because `buyerEmail` is mid-typing or non-email text.
3. Users can now clear and restart package configuration in one action without manual local-storage cleanup.
4. Admin users can run end-to-end package generation checks without Stripe payment friction.

## Remaining risks / next steps

1. If you want a stricter pre-checkout UX, add client-side inline validation that blocks the final action until `buyerEmail` is a valid email.
2. Consider exposing an explicit UI badge/tool-tip that explains simulated payment only activates for authenticated admins.
3. Optionally add an e2e mobile-focused test around text-entry stability and autosave concurrency.

## Overall repo state and recommendations

- The package-builder flow is now more operator-safe for both customer entry and internal QA.
- Immediate recommendation: deploy and verify on production mobile devices (Android + iOS) that input stability, Start Over behavior, and admin no-charge generation all behave as intended.

---

---

# CurrentState — Vercel TypeScript build repair (GATEEntrypointWizard)

**Last updated:** 2026-04-06
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed a production-blocking TypeScript compile failure in the package builder wizard by removing a duplicate auth binding and restoring a missing keyboard banner-clear handler referenced by identity/notes inputs.

## Executive summary (2026-04-06)

- Vercel builds were failing in `client/src/components/GATEEntrypointWizard.tsx` with:
  - `TS2451` due to duplicate `const { isAdmin } = useAuth();` declarations.
  - `TS2304` because several inputs referenced `onKeyDown={clearBanner}` without a defined `clearBanner` function.
- Removed the duplicate `isAdmin` declaration.
- Added a local `clearBanner` helper that clears the status banner while users continue typing.

## What changed

- Updated:
  - `client/src/components/GATEEntrypointWizard.tsx`
  - `docs/CurrentState.md`

## Why this was needed

- The deploy pipeline runs `tsc && vite build`; unresolved symbol and duplicate block-scoped declaration errors are fatal at type-check time.
- The missing `clearBanner` callback was referenced in multiple fields, so a single undefined identifier produced repeated compile errors.

## Validation performed

- `npm run build`

## Current repo condition after this pass

1. The GATE builder component compiles cleanly with no duplicate auth variable declarations.
2. Keyboard interaction on identity/notes inputs now has a valid banner-clear callback binding.
3. Vercel-equivalent local build (`tsc && vite build`) passes.

## Remaining risks / next steps

1. Add a lightweight UI regression test (or type-driven lint rule) to catch duplicated hook bindings and dangling JSX handler references earlier.
2. Consider splitting the large wizard component into smaller typed subcomponents to reduce merge-conflict risk and improve compile-error locality.

## Overall repo state and recommendations

- The immediate deployment blocker from this build failure is resolved.
- Recommendation: keep `npm run build` as a required CI gate for PRs touching `client/src/components/GATEEntrypointWizard.tsx` or other high-churn wizard files.

---

---

# CurrentState — Vercel build fix (Stripe checkout type compatibility)

**Last updated:** 2026-04-04
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed a production-blocking TypeScript compile failure in `api/stripe/agent-trainer-checkout.ts` caused by Stripe v18 type-surface changes in checkout session parameter typing, then validated local build success.

## Executive summary (2026-04-04)

- Vercel deployment failed during `tsc` with `TS2694` because `Stripe.Checkout.SessionCreateParams` is not exported in the currently installed Stripe SDK/type definitions.
- Updated the checkout session params typing to infer directly from the installed SDK method signature using `Parameters<typeof stripe.checkout.sessions.create>[0]`.
- This removes brittle reliance on a namespace type alias that changed across Stripe versions and keeps compile-time checks aligned with the actual runtime client surface.
- Confirmed by running `npm run build` locally: TypeScript compile and Vite build both pass.

## What changed

- Updated:
  - `api/stripe/agent-trainer-checkout.ts`
  - `docs/CurrentState.md`

## Why this was needed

- The deployment failed before app bundling because TypeScript could not resolve an exported Stripe namespace member in CI.
- The checkout logic itself was valid; only the explicit type annotation was incompatible with the Stripe package currently installed in this repo.

## Validation performed

- `npm run build` (passes)

## Current repo condition after this pass

1. Vercel build is unblocked for the Stripe checkout API route under the current dependency set.
2. Checkout session payload typing is now resilient to namespace alias shifts in Stripe type declarations by deriving from the method signature directly.
3. No functional payment-flow behavior was changed; this was a compile-surface compatibility fix only.

## Remaining risks / next steps

1. If Stripe major versions are changed again, re-run build/test gates and keep method-signature-derived typing where possible for API payloads.
2. Consider adding a targeted API test that exercises checkout payload assembly to catch future type drift earlier during PR validation.

## Overall repo state and recommendations

- Repo build path is currently healthy after this compile fix.
- Continue preferring locally inferred SDK parameter types over brittle deep namespace aliases when third-party typings are known to churn.

---

---

# CurrentState — Vercel build failure hotfix (TypeScript ignoreDeprecations)

**Last updated:** 2026-04-02
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Unblocked Vercel production builds failing at TypeScript config parse time by correcting an unsupported `ignoreDeprecations` value, then validated the local build path.

## Executive summary (2026-04-02)

- Vercel build was failing during `tsc` with `TS5103` because `tsconfig.json` set `"ignoreDeprecations": "6.0"`.
- The currently installed TypeScript toolchain in this project accepts `"5.0"` (or omission), not `"6.0"`.
- Updated `tsconfig.json` to `"ignoreDeprecations": "5.0"` so config parsing succeeds and build can proceed.
- Confirmed by running `npm run build` locally: TypeScript compile and Vite build now complete successfully.

## What changed

- Updated:
  - `tsconfig.json`
  - `docs/CurrentState.md`

## Why this was needed

- Deployment failed before application code compilation due to an invalid compiler option value, preventing all releases from progressing.
- This was a deterministic config/toolchain mismatch rather than an app-level code defect.

## Validation performed

- `npm run build` (passes)

## Current repo condition after this pass

1. Production build path is unblocked for the current dependency/toolchain set.
2. TypeScript option compatibility now aligns with the installed compiler behavior in CI/Vercel.
3. No runtime behavior changes were introduced; this is a build-system compatibility fix.

## Remaining risks / next steps

1. If TypeScript is upgraded in the future, re-evaluate whether `ignoreDeprecations` is still needed and which value is valid for that version.
2. Add a quick CI check to catch config parse regressions early (`npm run build` already detects this class of issue).

## Overall repo state and recommendations

- Repo appears operational from the frontend build perspective after this fix.
- Keep `tsconfig.json` options pinned to values validated against the exact TypeScript version in lockfile/CI.
- Consider adding a lightweight dependency-policy note in docs for TypeScript-option changes so config drift is reviewed deliberately.

---

---

## CurrentState — Agent Trainer Wednesday packaging uplift (2026-04-01)

**Scope of this pass:** Implemented the Wednesday package requests inside `agent_trainer/gv_operator_kit` by adding an agnostic corpus ingest script, BYOK GitHub Actions ingestion template, Redis scaffold variables, sub-agent templates, and expanded UX scaffolds for upload/import/export/voice affordances.

### What changed

- Added `agent_trainer/gv_operator_kit/scripts/ingest_generic_corpus.py` (generic lane-aware ingest scaffold with Supabase/Redis payload outputs).
- Added `agent_trainer/gv_operator_kit/.github/workflows/generic-corpus-ingestion.yml` (workflow-dispatch ingestion automation template).
- Added `agent_trainer/gv_operator_kit/templates/subagent-templates.json` (generic sub-agent + multi-agent orchestration baseline).
- Updated `agent_trainer/gv_operator_kit/components/KnowledgeUploader.tsx` and `agent_trainer/gv_operator_kit/components/AssistantChat.tsx` to surface upload/import/export/download/voice actions in the trainer UX.
- Updated `agent_trainer/gv_operator_kit/README.md`, `agent_trainer/gv_operator_kit/docs/IMPORT_GUIDE.md`, `agent_trainer/gv_operator_kit/setup/env.example`, and `agent_trainer/gv_operator_kit/CurrentState.md` to reflect the new package state.

### Validation performed

- `python agent_trainer/gv_operator_kit/scripts/ingest_generic_corpus.py --repo-root agent_trainer/gv_operator_kit --backend supabase --output /tmp/gv_supabase.jsonl`
- `python agent_trainer/gv_operator_kit/scripts/ingest_generic_corpus.py --repo-root agent_trainer/gv_operator_kit/scripts --backend redis --output /tmp/gv_redis.json`
- `pnpm exec tsc -p agent_trainer/gv_operator_kit/tsconfig.json --noEmit`

### Notes / follow-up

- The added ingestion script deliberately stops at payload generation; production upsert execution should remain buyer-owned and credential-scoped.
- Next iteration should add explicit manifest include/exclude control to the Python scaffold and runtime wiring for the newly surfaced UX actions.

---

---

# CurrentState — Billy Auth Stabilization + Trainer Preflight + Heirloom Companion Dark Route

**Last updated:** 2026-03-31
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Stabilized the signed-in Billy path so auth/profile hydration cannot hold the chat surface hostage, reduced unnecessary founder-context/session persistence work, clarified founder continuity and trainer readiness in the UI, and routed `/alzheimers-legacy` to the Heirloom Companion page implementation already present in the repo.

## Executive summary (2026-03-31)

- Signed-in Billy now fails open past auth/profile hydration instead of waiting for profile lookup completion before leaving loading state.
- The Billy backend now does less unnecessary Supabase work by caching short-lived auth/founder lookups, skipping anonymous `billy_sessions` writes, and only refreshing founder heartbeat metadata when it actually needs to change.
- `/billy` now distinguishes founder continuity states explicitly instead of collapsing them into one generic “session active” badge, and it links founder-eligible but unseeded sessions back to `/dashboard`.
- `/agent-trainer` now answers the “can I start a run right now?” question directly with access, scenario-source, and queue/worker preflight messaging plus quick-fill starter templates.
- `/alzheimers-legacy` now uses the Heirloom Companion page implementation instead of the older bright exhibit shell.

## What changed

- Updated:
  - `client/src/contexts/AuthContext.tsx`
  - `api/_lib/auth.ts`
  - `api/_lib/supabase.ts`
  - `api/billy.ts`
  - `client/src/lib/billyApi.ts`
  - `client/src/components/BillyLive.tsx`
  - `client/src/features/agent-trainer/AgentTrainerPage.tsx`
  - `client/src/App.tsx`
  - `docs/CurrentState.md`

## Why this was needed

- The Tuesday notes surfaced a real mismatch between anonymous and signed-in Billy behavior; the code path confirmed that authenticated Billy was paying extra auth/profile/founder-context costs while the client also waited too aggressively on auth loading.
- Founder continuity existed in the repo, but the user-facing Billy surface did not explain the difference between “founder recognized,” “founder thread loaded,” and ordinary signed-in state.
- The trainer already supported synthetic scenario packs and review-first flow, but the page did not make that obvious, so “Start Run” felt blocked even when the backend could proceed.
- The app already defaulted to dark mode globally, but `/alzheimers-legacy` still pointed at the older light-heavy exhibit component instead of the Heirloom Companion surface.

## Validation performed

- `pnpm exec tsc --noEmit`
- `npx vitest --config vitest.api.config.ts run api/__tests__/billy-api.test.ts api/__tests__/dashboard.test.ts api/__tests__/lib.test.ts`

## Current repo condition after this pass

1. The signed-in Billy path is more resilient: auth/profile lag should no longer keep `/billy` stuck behind client-side loading state.
2. Billy’s authenticated request path still uses Supabase heavily, but it now avoids some of the most obvious unnecessary reads/writes and exposes continuity state more clearly in the UI.
3. The trainer surface is clearer about synthetic scenario generation, manual review before deployment, and the worker dependency for queued execution.
4. The Alzheimer’s public route now aligns better with the repo’s dark-default runtime instead of dropping into the older bright presentation.

## Remaining risks / next steps

1. Real seeded `scenario_sets` still do not appear to be provisioned from the repo; the trainer now has starter UI templates and synthetic-pack fallback, but not durable preloaded DB scenario packs.
2. Trainer progress beyond `queued` still depends on the worker path in `worker/trainer/main.ts` unless `TRAINER_INLINE_EXECUTION=true` is enabled in the environment.
3. Billy’s Supabase cost profile is improved but not yet instrumented with request-level telemetry, so the “18,000 calls in an hour” concern is reduced in obvious places but not fully quantified yet.
4. Founder-only affordances still depend on the founder/admin allowlist email matching the actual sign-in account on both client and server.

---

---

# CurrentState — Billy Memory Grounding + Expert Trainer Study Pack

**Last updated:** 2026-03-31
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Reduced Billy's over-scripted coaching tone, added automatic durable-memory capture into Supabase for Billy conversations, grounded the trainer in live `knowledge_fragments` and shared collaboration memory, and validated the trainer end to end through both smoke deployment and an expert-context run.

## Executive summary (2026-03-31)

- Billy now speaks with less canned reflective-therapist language and less visible Loom ritual while preserving the grounding model.
- Billy can now extract durable first-person facts from conversation turns and persist them into `memory_entries` for identified users instead of discarding that context between sessions.
- The trainer no longer depends on a brief plus synthetic scenarios alone; it can now list live study sources from Supabase, accept `studySourceFiles` and `studyFocus`, assemble a study pack from `knowledge_fragments`, pull shared collaboration memory, and synthesize a reusable understanding layer for curriculum, scenarios, and agent authoring.
- A pinned shared collaboration memory was written into Supabase so the preferred "live corpus + persistent memory + direct repo improvement" workflow is retrievable in later runs.
- Live trainer validation is now real rather than theoretical: one smoke run was approved and deployed after a safety-lint fix, and a second expert-context run completed with passing evals using the new study-pack path.

## What changed

- Added:
  - `server/agent-trainer/study-sources.ts`
  - `api/trainer/study-sources.ts`
  - `supabase/migrations/20260331110000_trainer_study_sources_rpc.sql`
- Updated:
  - `shared/billy/runtime.ts`
  - `api/_lib/memory.ts`
  - `api/billy.ts`
  - `client/src/lib/billyApi.ts`
  - `api/__tests__/billy.test.ts`
  - `api/__tests__/memory.test.ts`
  - `api/__tests__/billy-runtime.test.ts`
  - `shared/agent-trainer/schemas.ts`
  - `client/src/features/agent-trainer/lib/trainerApi.ts`
  - `client/src/features/agent-trainer/hooks/useTrainingRun.ts`
  - `client/src/features/agent-trainer/AgentTrainerPage.tsx`
  - `server/agent-trainer/orchestrator.ts`
  - `shared/agent-trainer/policies.ts`
  - `docs/CurrentState.md`
  - `docs/PlaybookOperatorManual.md`

## Why this was needed

- The Tuesday notes and subsequent live inspection showed that Billy still sounded too scripted in places and still lacked a trustworthy path for carrying user-specific context forward across sessions.
- The repo already had a strong memory substrate in `memory_entries`, but Billy was not yet using it to create durable continuity from real conversations.
- The trainer had basic orchestration, but it was still too easy for a run to feel generic because the source corpus, founder/operator preferences, and collaboration context were not explicitly assembled into an expert grounding pack.
- Live Supabase inspection confirmed that the knowledge corpus is already rich enough to support this path: `knowledge_fragments` currently contains 32,306 rows across Diligence, Documentation, WellnessApplication, Product, Architecture, Billy, PLK, and ManifestIndex material.

## Validation performed

- Billy memory/tone validation:
  - `npx vitest run --config vitest.api.config.ts api/__tests__/billy.test.ts api/__tests__/memory.test.ts api/__tests__/billy-runtime.test.ts`
  - `pnpm exec tsc -p tsconfig.json --noEmit`
- Live Supabase inspection:
  - confirmed grouped `knowledge_fragments` inventory by `source_kind`
  - confirmed live source files for Seed Prompts, Billy, PLK, and Manifest content
  - wrote a shared pinned workflow memory with `source_ref = codex:2026-03-31-live-workflow`
- Trainer smoke validation:
  - run `4f320684-8336-4c7b-9081-64b3bdcbe5e9` reached all stages but failed review progression because safety lint incorrectly flagged negated authority constraints
  - fixed `shared/agent-trainer/policies.ts` to make authority lint negation-aware
  - run `5a8fb61f-89f7-4ff8-adb8-fce1aafa64ae` reached `awaiting_review` with three passing evals at `4.44`
  - approved and deployed candidate version `91962e64-313d-4cf7-a46a-91fe228e1582` to `agents/generated/trainer-smoke-study-pack-safe.md`
- Expert-context trainer validation:
  - verified `buildTrainerStudyPack(...)` returned `memoryCount: 1` and included the pinned shared collaboration memory
  - run `05b4ee0d-c3bc-4e2d-ac69-14741907b5d0` reached `awaiting_review` with three passing evals at `4.51` using live corpus study sources plus collaboration memory

## Current repo condition after this pass

1. Billy now has a more usable continuity model: the runtime can store durable goals, preferences, constraints, relationships, identity signals, and insights from real conversation turns into Supabase for identified users.
2. Shared collaboration memories are now usable as operator-facing continuity state rather than just user-facing recall; pinned shared memories can influence trainer study packs even when semantic retrieval alone would miss them.
3. The trainer has moved from "brief + synthetic scenarios" toward "study the corpus first": the UI can list live study sources, the backend can assemble recommended packs, and orchestration now carries synthesized understanding into normalization, curriculum, scenario generation, and agent authoring.
4. The trainer approval/deploy loop has been validated against live Supabase state instead of only static code inspection.

## Remaining risks / next steps

1. The synthesized trainer-understanding summary is intentionally heuristic and useful, but it still deserves refinement so source weighting between Billy, PLK, diligence, and collaboration memory is more explicit.
2. Billy memory capture remains conservative by design and still no-ops for `guest-user`; that is correct for safety, but it means anonymous sessions still will not accumulate durable continuity.
3. There is not yet a dedicated operator UI for managing pinned shared collaboration memories, so creating or curating them still requires direct Supabase or backend-path interaction.
4. The new trainer study-source lane is validated live, but it should still be exercised with more intentional real agents beyond the smoke artifact and context-check candidate.

---

---

# CurrentState — Trainer local agent and reference grounding

**Last updated:** 2026-03-31
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Connected the trainer to the repo’s local subagent catalog and local reference library so imported specs under `agents/categories/**` and tool/function source material under `agents/references/**` are usable during training runs, then tightened the offline fallback authoring path so live runs preserve local subagent tools and reference-driven process structure.

## Executive summary (2026-03-31)

- The trainer can now see the local subagent catalog under `agents/categories/**` instead of treating only flat root `agents/*.md` files as discoverable local agents.
- Trainer study-source listing now includes local subagent specs and curated `agents/references/**` bundles alongside live corpus sources.
- Auto-recommendation can now pull matching local subagents and tool/function reference bundles into a study pack when no explicit sources are selected.
- Local reference bundles are now prioritized partly by local subagent family, so meta-orchestration, tooling, MCP, and memory-oriented agents can pull more relevant repo-local source material even when the brief wording is generic.
- The trainer agent list now merges Supabase-backed agents with the local catalog so categorized subagents remain visible even when the database already has agent records.
- `/agent-trainer` now speaks honestly about studying a mixed source set: live corpus, local subagent specs, local reference bundles, and shared collaboration memory.
- Live trainer reruns for `multi-agent-coordinator` and `mcp-developer` still authored through the deterministic fallback, but that fallback now preserves local tool lists and role-shaped process steps instead of flattening those agents into generic spec boilerplate.

## What changed

- Added:
  - `api/__tests__/trainer-catalog.test.ts`
  - `api/__tests__/trainer-study-sources.test.ts`
- Updated:
  - `server/agent-trainer/catalog.ts`
  - `server/agent-trainer/study-sources.ts`
  - `server/agent-trainer/persistence.ts`
  - `server/agent-trainer/orchestrator.ts`
  - `client/src/features/agent-trainer/AgentTrainerPage.tsx`
  - `agents/INDEX.md`
  - `docs/CurrentState.md`
  - `docs/PlaybookOperatorManual.md`

## Why this was needed

- The repo now contains a large local subagent library under `agents/categories/**`, but the trainer’s local catalog scan only recognized flat `agents/*.md` files.
- The repo also now contains `agents/references/**`, which is useful source material for tools, function calling, MCP, routing, and memory abilities, but it was not available to trainer study packs at all.
- That meant the trainer could not study or even see most of the new local material unless it was separately ingested into Supabase, which broke the intended “use what is already in the repo” workflow.
- The trainer UI also still described its study lane as “live corpus” only, which no longer matched the desired operating model once repo-local subagents and reference materials became part of the grounding surface.
- Live reruns showed a second problem: when the author stage fell back to the deterministic local path, it flattened strong local subagent patterns into generic “Handle …” responsibilities and default tool lists, which weakened the value of the new study-pack work.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/trainer-catalog.test.ts api/__tests__/trainer-study-sources.test.ts`
- `pnpm exec tsc -p tsconfig.json --noEmit`
- Live trainer study-pack inspection:
  - `multi-agent-coordinator` auto-selected God Mode, seed prompts, local meta-orchestration subagents, and routing/memory reference bundles
  - `mcp-developer` auto-selected God Mode, seed prompts, local developer-experience subagents, and tooling/MCP reference bundles
- Live trainer validation after fallback-authoring refinement:
  - run `38d5d71f-2f7f-4748-ab4c-d8e18b619b64` for `multi-agent-coordinator` reached `awaiting_review` with three passing evals at `4.46` and preserved `Read`, `Write`, `Edit`, `Glob`, `Grep` plus routing/memory-specific process steps
  - run `65f928aa-63a4-4349-9937-5b51c5e4dc11` for `mcp-developer` reached `awaiting_review` with three passing evals at `4.46` and preserved `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep` plus tooling/MCP-specific process steps

## Current repo condition after this pass

1. Local subagents under `agents/categories/**` are now part of the trainer-visible catalog instead of being stranded as unreferenced repo content.
2. Curated `agents/references/**` bundles are now available as trainer study sources for tool use, function calling, MCP, routing, and memory patterns.
3. A training run without explicit study-source selection can now auto-pull a mixed study pack that includes recommended corpus sources, locally relevant subagent specs, and relevant local reference bundles.
4. The offline fallback authoring path now preserves local subagent tool lists and reference-shaped process steps when those local sources are selected.
5. The trainer page now labels local subagent and local reference study sources explicitly, which makes the operator-facing workflow legible.
6. `agents/INDEX.md` now reflects the real structure: flat root specs remain canonical runnable agents, while categorized subagents and references are reusable local study material.

## Remaining risks / next steps

1. The trainer can now see the local subagent catalog and reference bundles, but it still does not diff against an existing local spec as a formal baseline before authoring a new version.
2. Auto-recommendation for local subagents and reference bundles is still heuristic, but it now uses subagent-family preferences in addition to brief keyword matching.
3. The reference lane currently exposes curated bundles rather than every file under `agents/references/**`; expand that set deliberately as real training needs become clearer.
4. If specific subagents should become first-class visible agents rather than study references, they still need deliberate registry/policy decisions rather than being promoted automatically.

---

# CurrentState — Billy local API proxy repair

**Last updated:** 2026-03-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Repaired local Billy API connectivity for the Vite dev path so browser chat and the Python voice worker stop falling through when `/api/*` is not hosted by `npm run dev`.

## Executive summary (2026-03-30)

- Confirmed that `npm run dev` starts Vite only, while `server/index.ts` serves static assets only; neither path exposes `api/*.ts` locally.
- This meant local requests to `/api/billy` could fail before the Billy server route ever ran, forcing fallback behavior and breaking the voice worker's default `BILLY_API_URL=http://localhost:3000`.
- Added a Vite `/api` proxy that forwards local API calls to:
  - `VITE_API_PROXY_TARGET`, then
  - `VITE_API_BASE_URL`, then
  - `VITE_BILLY_API_URL`, then
  - the canonical deployment `https://gestaltv1ew.vercel.app`
- The proxy no longer falls through to plain `BILLY_API_URL`, because `BILLY_API_URL=http://localhost:3000` can self-proxy back into the Vite dev server and cause browser-side `Failed to fetch` errors on `/api/*` routes.
- Updated `billy_voice/README.md` so the local voice-runtime instructions match the current dev topology and explain how to point Vite at `vercel dev` or another preview deployment.

## Validation performed

- Read and compared:
  - `vite.config.ts`
  - `client/src/lib/billyApi.ts`
  - `client/src/lib/BillyEngine.ts`
  - `billy_voice/app.py`
  - `server/index.ts`
- Attempted `npm run dev` in-container and confirmed the local dev path is Vite-only rather than a Vercel/API runtime.

---

---

# CurrentState — Billy chat-mode regression fix (raw JSON + cloud fallback loop)

**Last updated:** 2026-03-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed Billy chat behavior where Think mode could surface raw retrieval fragments (including JSON-like corpus content) and Vibe mode could drop into the legacy “cloud disrupted” canned fallback even when `/api/billy` returned 200.

## Executive summary (2026-03-30)

- Removed the `text-only` early-return in `api/billy.ts` that previously sent the first retrieved fragment directly as the assistant response.
- Text-only retrieval now remains context-only and still flows through `routeLlm`, so users get a normal conversational Billy response instead of raw corpus snippets.
- Updated client fallback behavior in `client/src/lib/billyApi.ts` to stop auto-switching to legacy browser orchestration when the server provider is `offline-fallback`; this prevents the local canned “cloud disrupted” response from replacing server output.
- Updated API tests to reflect the corrected text-only flow.

## What changed

- `api/billy.ts`
  - Removed the `retrievalMode === "text-only"` response short-circuit block that returned `knowledgefragments` content directly.
  - Kept text-only chunks in the normal response path so they inform prompt grounding while preserving Billy’s response layer.
- `client/src/lib/billyApi.ts`
  - Removed the automatic offline-provider handoff to `legacyBillyCall`.
  - Preserved legacy fallback for real network/request exceptions.
- `api/__tests__/billy.test.ts`
  - Updated text-only fallback assertion to verify the route goes through `routeLlm` and returns the LLM provider envelope.

## Validation performed

- Targeted test run for Billy API route assertions:
  - `npx vitest run --config vitest.api.config.ts api/__tests__/billy.test.ts`

## Next steps / recommendations

1. Re-check Vercel runtime logs for `/api/billy` provider metadata after deploy to confirm if production is frequently in `offline-fallback`; if yes, prioritize provider env-key remediation in Vercel project settings.
2. Optionally add lightweight UI copy for `offline-fallback` provider state so users see a clear degraded-mode indicator without legacy handoff side effects.
3. Consider adding an integration test that simulates `offline-fallback` from server and ensures the client renders that response verbatim.

---

# CurrentState — Agent Trainer Skill Surface + Trainer RLS Policies

**Last updated:** 2026-03-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Promoted the new agent-trainer slice into the repo skill system and added explicit trainer Supabase policies so the feature is operable through both the codebase and the skills layer.

## Executive summary (2026-03-30)

- Added a canonical `gestaltview-agent-trainer` skill so the trainer runtime is routable from the same curated skill surfaces used elsewhere in the repo.
- Documented the trainer runtime map, skill-composition model, and Supabase policy posture inside `skills/gestaltview-agent-trainer/`.
- Added a dedicated trainer RLS migration so the trainer tables use explicit `service_role` policies instead of relying on the weaker "RLS enabled but no policy" state.

## What changed

- Added:
  - `skills/gestaltview-agent-trainer/SKILL.md`
  - `skills/gestaltview-agent-trainer/references/runtime-map.md`
  - `skills/gestaltview-agent-trainer/references/skill-composition.md`
  - `skills/gestaltview-agent-trainer/references/supabase-policy-model.md`
  - `skills/gestaltview-agent-trainer/agents/openai.yaml`
  - `supabase/migrations/20260330120830_trainer_rls_policies.sql`
- Updated the curated catalog surfaces so the trainer feature is discoverable from `skills/manifest.json`, `skills/INDEX.md`, and the generated agents catalog.

## Validation target for this pass

- Regenerate the skill agents catalog.
- Validate the new trainer skill structure.
- Apply the trainer policy migration and confirm Supabase security advisors are clean for the trainer tables.

---

# CurrentState — Founder Dashboard + Account Control Surface

**Last updated:** 2026-03-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added a real authenticated dashboard surface for account state, founder/admin activation, founder continuity persistence, admin account overrides, Billy Voice Studio launch/diagnostics, and database-level founder admin bootstrap.

## Executive summary (2026-03-30)

- Added a new authenticated `/dashboard` route so signed-in users have a visible account control plane instead of relying on hidden Supabase state.
- Added `/api/session/dashboard` as the server-backed surface for reading account state, activating founder admin for the founder allowlist, and persisting founder continuity fields.
- Extended the shared Supabase REST helper with authenticated `users`-row reads, listing, and upserts so the dashboard can safely reflect and update the live account record.
- Expanded the dashboard to include admin user management plus Billy runtime diagnostics and direct launch access to `/billy/voicestudio`.
- Added a Supabase migration so the founder email is provisioned as `enterprise + is_admin=true` directly from the auth signup trigger, with existing founder rows backfilled when present.

## What changed

- Added:
  - `client/src/pages/DashboardPage.tsx`
  - `api/session/dashboard.ts`
  - `api/__tests__/dashboard.test.ts`
- Updated:
  - `client/src/App.tsx`
  - `client/src/pages/SignIn.tsx`
  - `client/src/pages/Welcome.tsx`
  - `api/_lib/supabase.ts`
  - `client/src/components/NavBar.tsx`
  - `supabase/migrations/20260330170000_founder_admin_bootstrap.sql`

## Validation performed

- `pnpm exec vitest run --config vitest.api.config.ts api/__tests__/dashboard.test.ts`
- `pnpm exec tsc --noEmit`

---

---

# CurrentState — Dashboard "Resolving session" stall guard

**Last updated:** 2026-03-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed a dashboard access blocker where auth session resolution could hang indefinitely and keep users stuck on `Resolving session...`.

## Executive summary (2026-03-30)

- Added a defensive timeout in `AuthContext` so the UI cannot remain indefinitely blocked in auth-loading mode if Supabase session resolution hangs on certain networks/devices.
- Ensured auth-loading is explicitly cleared on auth state change callbacks as well, preventing stale loading state after delayed auth events.
- Preserved existing behavior where profile fetch failures are non-fatal; users can still proceed while profile hydration retries through normal flow.

## What changed

- Updated:
  - `client/src/contexts/AuthContext.tsx`
    - Added an 8-second `getSession` timeout fail-open guard for `isLoading`.
    - Cleared timeout on successful/failed session resolution and component cleanup.
    - Marked auth loading complete in `onAuthStateChange` handler to avoid a stuck spinner.

## Why this was needed

- The dashboard page gates on `authLoading` and displays `Resolving session...` while `isLoading` is true.
- If `supabase.auth.getSession()` does not resolve promptly (intermittent mobile/network/runtime edge cases), the page could remain stuck even after successful login.

## Validation performed

- Type-check validation:
  - `npx tsc --noEmit`

## Repo state and recommendations / next steps

1. Consider adding lightweight auth telemetry (e.g., session resolve duration percentile and timeout count) to distinguish real auth failures from transport stalls.
2. Consider surfacing a user-visible retry CTA if session resolution times out, alongside a diagnostic note in dev mode.
3. If this pattern appears in other gated routes, centralize a shared `authReady` policy so all authenticated pages inherit the same fail-open behavior.

---

# CurrentState — Core Docs + Playbook v2 refresh

**Last updated:** 2026-03-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Refreshed the core orientation and operator docs so they match the current runtime, account/memory control plane, trainer surface, manifest workflow, and route/API inventory. Also regenerated the manifest outputs after the docs inventory changed materially.

## Executive summary (2026-03-30)

- Rewrote the main operator-facing docs so they now describe the current route map, Billy/memory grounding, dashboard control plane, trainer control plane, manifest workflow, and cross-repo operating loop.
- Promoted `docs/PlaybookOperatorManual.md` into a v2-draft field guide instead of leaving it as a lighter working manual.
- Regenerated `docs/gestaltview-v2.manifest.json` and `docs/gestaltview-v2.manifest.md`; the repo now reports `384` scanned files, `39` routes, `42` extracted API endpoints, `55` canonical docs, and `6` test scripts at generation time.

## What changed

- Rewrote:
  - `README.md`
  - `docs/AIFlow.md`
  - `docs/APIFlow.md`
  - `docs/ArchitecturalStructure.md`
  - `docs/Manifest.md`
  - `docs/SymbioticWorkflow.md`
  - `docs/PlaybookOperatorManual.md`
- Regenerated:
  - `docs/gestaltview-v2.manifest.json`
  - `docs/gestaltview-v2.manifest.md`

## Why this was needed

- The 2026-03-29 docs refresh materially improved the core architecture docs, but the repo has moved again since then:
  - `/dashboard` and `/api/session/dashboard` are now real control-plane surfaces
  - persistent user memory now exists through `/api/session/memory` and `memory_entries`
  - the trainer control plane now spans UI, API, server orchestration, worker execution, and Supabase lineage
  - the public route inventory is broader than the older README and playbook framing suggested
- The operator manual needed a stronger v2 draft so the repo's practical workflow, source-of-truth ladder, manifest expectations, and subsystem playbooks were all aligned in one place.
- Because the docs inventory changed materially, the generated manifest outputs needed to be refreshed in the same pass.

## Validation performed

- Re-read current runtime and operations anchors before rewriting docs:
  - `client/src/App.tsx`
  - `client/src/contexts/AuthContext.tsx`
  - `client/src/pages/DashboardPage.tsx`
  - `client/src/features/agent-trainer/lib/trainerApi.ts`
  - `api/billy.ts`
  - `api/_lib/llmRouter.ts`
  - `api/_lib/memory.ts`
  - `api/session/state.ts`
  - `api/session/dashboard.ts`
  - `api/session/memory.ts`
  - `api/trainer/**`
  - `server/agent-trainer/**`
  - `worker/trainer/main.ts`
  - `supabase/schema.sql`
  - `supabase/migrations/*`
  - `scripts/generate_repo_manifest.py`
  - `scripts/gv.sh`
  - `vercel.json`
- Regenerated manifests:
  - `python3 scripts/generate_repo_manifest.py`

## Current repo condition after this pass

1. The core docs now describe the current runtime much more coherently as one system instead of as loosely refreshed individual pages.
2. `README.md`, the architecture/API/AI docs, `Manifest.md`, `SymbioticWorkflow.md`, and the operator manual now agree on the current major lanes: Billy, session/dashboard/memory, trainer, diligence, and manifest workflow.
3. The generated manifest outputs are current again and now capture the expanded route and API inventory.

## Remaining risks / next steps

1. `scripts/run-comprehensive-tests.sh` currently shells out to `npm run test:api` and `npm run check`, but those scripts are not declared in `package.json`. Either align the wrapper or add the missing package aliases before treating that runner as a canonical validation gate.
2. `scripts/generate_repo_manifest.py` still extracts route and endpoint inventories mechanically from file contents, which means the generated manifest can over-capture internal/test surfaces or API path strings found inside UI code. Continue using `client/src/App.tsx`, live handler inspection, and `docs/APIFlow.md` for contract truth.
3. The next runtime-facing change should continue the same pattern: update the touched docs and regenerate the manifest in the same pass when route/API/script/doc inventory changes materially.

---

# CurrentState — Skills Keeper Protocol Initiation + Revenue Hunter Enhancement

**Last updated:** 2026-03-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Initiated Skills Keeper protocol support in the repo agent layer, improved Revenue Hunter agent quality, and synchronized operational state guidance.

## Performance addendum — Billy CTA interaction staging + mobile first-open deferral (2026-03-29)

### Scope

- Reworked Billy greeter CTA click flow to prioritize immediate tap acknowledgement and defer expensive follow-up work (`openPanel`, route transitions, section scroll/highlight) off the tap task boundary.
- Staged Billy panel initial heavy behavior for mobile first-open so render/interaction overhead is reduced during the first activation window.
- Introduced lightweight pending/opening CTA feedback to communicate click capture instantly.

### Changes applied in this pass

- `client/src/components/BillyGreeter.tsx`
  - Added explicit next-frame (`requestAnimationFrame`) and idle-time (`requestIdleCallback` fallback) scheduling helpers.
  - Refactored pathway selection to stop chaining close + route/scroll + panel mount in one task.
  - Added cheap `pendingPathwayId` state to pathway CTA cards to show immediate “Opening…” acknowledgement and temporarily disable duplicate taps.
- `client/src/components/Billy.tsx`
  - Lazy-loaded `BillyBabylon` with `React.lazy` + `Suspense` fallback avatar to keep initial panel/orb subtree lighter before visualization code is needed.
  - Added mobile first-open detection and threaded `deferVisualEffects` into `BillyPanel`.
  - Updated first-open panel behavior: auto-scroll uses non-animated mode and initial prompt auto-send is staged later when deferral is active.

### Validation / profiling status

- Local static validation: TypeScript/Vite build should be run after this pass to ensure no regressions.
- Requested Android Chrome INP re-profile **has not yet been run in this environment**; must be validated on-device with the same Billy CTA path used in the prior report.

### Reasoning

1. Input latency was likely dominated by synchronous work triggered directly from CTA clicks.
2. Deferring route/scroll/panel mount steps to the next frame and idle periods preserves immediate input responsiveness.
3. A visible pending/opening state confirms user intent capture even while deferred work continues.
4. Mobile first-open deferral reduces the chance of stacking expensive visual work during the most sensitive interaction window.

### Next steps

1. Run mobile on-device INP profiling (Android Chrome) against the same CTA flow and compare to baseline “poor” events.
2. If remaining spikes persist, capture a flamechart for panel mount and selectively defer non-essential message/avatar animation work further.
3. Keep this file synchronized with measured INP deltas after the on-device profile run.

## Hotfix addendum — Vercel Billy module-resolution incident (2026-03-28)

### Incident summary

- Production deployment `dpl_F8q2P5jqFaJqgn7uzEeTp1UrYAEX` logged repeated `ERR_MODULE_NOT_FOUND` failures for `/api/billy` when Node attempted to import `file:///var/task/api/_lib/response` (without extension).
- Blast radius observed in runtime logs: `GET/POST /api/billy` returned `500` while other routes such as `/api/session/state` continued returning `200/304`.

### Root cause

- The repository runs as ESM (`"type": "module"`). In the serverless runtime, extensionless relative imports inside API handlers were emitted in a form Node could not resolve for this function bundle.
- `api/billy.ts` failed first at `./_lib/response`, and neighboring API handlers used the same extensionless pattern.

### Changes applied in this pass

- Updated API runtime entrypoints to use explicit `.js` extensions for local ESM imports so the deployed serverless bundle resolves consistently:
  - `api/billy.ts`
  - `api/billy-health.ts`
  - `api/billy-bucket-drop.ts`
  - `api/actions/[...path].ts`
  - `api/voice/billy.ts`

### Validation performed for the hotfix

- `npm run build` → passed (full client/server TypeScript + Vite build).
- `npx vitest --config vitest.api.config.ts run api/__tests__/billy.test.ts api/__tests__/endpoints.test.ts` → passed (`14/14`).

### Updated operational state

1. The immediate Billy 500 regression from this incident is addressed in source with explicit ESM import specifiers.
2. The API contract and route behavior remain green in focused tests after the import-specifier update.
3. Next deployment should be verified against `/api/billy` and `/api/billy-health` immediately post-release to confirm runtime parity on Vercel.

## Hotfix addendum — Vercel Billy module-resolution incident (2026-03-28)

### Incident summary

- Production deployment `dpl_F8q2P5jqFaJqgn7uzEeTp1UrYAEX` logged repeated `ERR_MODULE_NOT_FOUND` failures for `/api/billy` when Node attempted to import `file:///var/task/api/_lib/response` (without extension).
- Blast radius observed in runtime logs: `GET/POST /api/billy` returned `500` while other routes such as `/api/session/state` continued returning `200/304`.

### Root cause

- The repository runs as ESM (`"type": "module"`). In the serverless runtime, extensionless relative imports inside API handlers were emitted in a form Node could not resolve for this function bundle.
- `api/billy.ts` failed first at `./_lib/response`, and neighboring API handlers used the same extensionless pattern.

### Changes applied in this pass

- Updated API runtime entrypoints to use explicit `.js` extensions for local ESM imports so the deployed serverless bundle resolves consistently:
  - `api/billy.ts`
  - `api/billy-health.ts`
  - `api/billy-bucket-drop.ts`
  - `api/actions/[...path].ts`
  - `api/voice/billy.ts`

### Validation performed for the hotfix

- `npm run build` → passed (full client/server TypeScript + Vite build).
- `npx vitest --config vitest.api.config.ts run api/__tests__/billy.test.ts api/__tests__/endpoints.test.ts` → passed (`14/14`).

### Follow-up incident after first hotfix (2026-03-28)

- A subsequent deployment (`dpl_9GHs6ghbkQadvWxC52zAKajSTNuG`) still returned `/api/billy` `500` with `ERR_MODULE_NOT_FOUND` for `file:///var/task/shared/llm/plk` imported by `api/_lib/llmRouter.js`.
- This confirmed the first pass fixed API entrypoint specifiers but missed an internal `_lib` dependency edge into `shared/`.
- Remediation in this pass: updated `api/_lib/llmRouter.ts` to use explicit ESM `.js` specifiers for `../../shared/llm/plk` and `../../shared/billy/types`.

### Updated operational state

1. The immediate Billy 500 regression from this incident is addressed in source with explicit ESM import specifiers.
2. The API contract and route behavior remain green in focused tests after the import-specifier update.
3. Next deployment should be verified against `/api/billy` and `/api/billy-health` immediately post-release to confirm runtime parity on Vercel.

## Executive snapshot

| Area                           | Status       | What changed in this pass                                                                                                                              | Why it matters                                                                                                          |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Skills Keeper protocol         | ✅ initiated | Added new `agents/skills-keeper.md` agent with stewardship, dispatch, and agent-improvement workflow contracts.                                        | The repository now has an explicit runnable agent protocol for skill catalog enhancement and agent creation flows.      |
| Revenue Hunter quality         | ✅ enhanced  | Reworked `agents/revenue-hunter.md` with tighter triggers, clearer guardrails, stronger output contracts, and explicit Skills Keeper handoff behavior. | Revenue-focused support is now easier to trigger reliably and better aligned to execution-first, ADHD-aware operations. |
| Revenue Hunter onboarding docs | ✅ enhanced  | Rewrote `agents/revenue-hunter-quickstart.md` to include the new handoff path into Skills Keeper and simplified weekly rhythm guidance.                | Founder/operator adoption is faster because activation, execution, and escalation steps are now explicit.               |
| State documentation hygiene    | ✅ aligned   | Replaced stale runtime-heavy state content with this targeted update for the current mission.                                                          | CurrentState now reflects actual changes from this pass instead of unrelated prior details.                             |

## What changed

- Added new skills orchestration agent:
  - `agents/skills-keeper.md`
  - Includes mission classification, dispatch rules, output structure, and CurrentState sync responsibility.
- Improved revenue operations agent:
  - `agents/revenue-hunter.md`
  - Expanded trigger examples, clarified workflows (offer/outreach/pipeline), and added explicit collaboration contract with Skills Keeper.
- Updated activation guide:
  - `agents/revenue-hunter-quickstart.md`
  - Added “Skills Keeper protocol handoff” section and clearer daily/weekly operating rhythm.

## Reasoning for these changes

1. The user requested initiating the **skills-keeper protocol** with enhancement and agent creation intent.
2. The user explicitly requested focused improvement of `agents/RevenueHunter`.
3. Existing Revenue Hunter content was strong but lacked formalized cross-agent integration for skill/agent gap escalation.
4. `CurrentState.md` required synchronization per repo operating expectations after meaningful agent and workflow-documentation changes.

## Validation performed

- Verified agent/document syntax and working tree state:
  - `git status --short`
  - Result: changed files match intended scope.
- Reviewed updated files for structure and completeness:
  - `sed -n '1,240p' agents/skills-keeper.md`
  - `sed -n '1,260p' agents/revenue-hunter.md`
  - `sed -n '1,260p' agents/revenue-hunter-quickstart.md`
  - `sed -n '1,260p' docs/CurrentState.md`
  - Result: files present with expected protocol and handoff content.

## Overall repository state after this pass

- **Done:** Skills Keeper protocol is now represented as an actionable repository agent.
- **Done:** Revenue Hunter has improved triggering clarity, execution constraints, and escalation path.
- **Done:** Current state documentation now reflects this specific operational pass.
- **Partial:** No end-to-end runtime tests were required for this docs/agent-layer-only change set.
- **Risk:** Future agent additions may still drift unless the Skills Keeper handoff is routinely used and documented.

## Recommendations / next steps

1. Add a proposal-writing companion agent that Revenue Hunter can call once a lead converts to a qualified conversation.
2. Add a small `agents/INDEX.md` map to standardize when each agent should trigger.
3. Run monthly Skills Keeper stewardship sweeps to detect overlap, stale examples, or trigger-language collisions.
4. Keep updating `docs/CurrentState.md` on every meaningful agent/skills workflow change.

## Canonical files for this pass

- `agents/skills-keeper.md`
- `agents/revenue-hunter.md`
- `agents/revenue-hunter-quickstart.md`
- `docs/CurrentState.md`

**© 2026 Keith Soyka / GestaltView — All Rights Reserved**

## Hotfix addendum — Post-deploy runtime verification snapshot (2026-03-29)

### Incident summary

- Production deployment `dpl_7ar2ZEhK2hC6WpTtmNk9xWby27fL` was sampled from runtime logs on March 29, 2026.
- Observed route behavior: `/api/billy` returned multiple `200` responses across repeated calls, while `/api/session/state` returned mixed `200/304` responses.
- One Node deprecation warning (`DEP0169`) was observed during the same window.

### Current risk

- **Classification:** Non-blocking.
- **Operational impact:** Core Billy/session endpoints are currently healthy, but the `DEP0169` signal is technical debt / observability noise that can mask future actionable warnings if left untriaged.

### Next-step checklist

- [ ] Trace the `DEP0169` warning to its precise runtime call site (package + code path) from Vercel function logs.
- [ ] Remediate or pin/update the dependency chain responsible for `DEP0169`, then verify no new warnings are introduced in production logs.
- [ ] Run a mobile performance follow-up focused on INP and interaction timing around `BillyGreeter.tsx` flows, and record findings in the next `CurrentState` update.

### Updated operational state

1. Deployment `dpl_7ar2ZEhK2hC6WpTtmNk9xWby27fL` currently shows healthy Billy/session API behavior (`/api/billy` and `/api/session/state` returning successful HTTP statuses).
2. No blocking runtime regression is indicated from this sample.
3. Warning hygiene and mobile INP follow-up remain open and should be tracked as short-term reliability/performance debt.

## Agent catalog addendum — Revenue Hunter path establishment (2026-03-29)

### Executive snapshot

| Area                | Status         | What changed in this pass                                                                                                      | Why it matters                                                                                                        |
| ------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Agent index         | ✅ added       | Created `agents/INDEX.md` with agent routing notes, canonical-file rules, and an add-agent checklist.                          | Agent discovery no longer depends on remembering standalone filenames.                                                |
| Root agent registry | ✅ added       | Added `agents/openai.yaml` as a small root catalog for the visible `agents/` entries.                                          | OpenAI-facing metadata now exists at the directory root as well as inside the Revenue Hunter folder.                  |
| Revenue Hunter path | ✅ established | Added `agents/revenue-hunter/README.md` as a stable folder entrypoint that routes to the existing prompt and quickstart files. | The repository now has a human-expected `agents/revenue-hunter` path without breaking the flat-file agent convention. |
| OpenAI metadata     | ✅ added       | Added `agents/revenue-hunter/openai.yaml` using the repo's existing interface/policy schema.                                   | Revenue Hunter now has a machine-readable OpenAI metadata surface alongside the human-facing folder entrypoint.       |
| Canonical structure | ✅ clarified   | Documented that flat `agents/*.md` files remain the source of truth even when companion folders exist.                         | Future agent additions are less likely to fork into competing layouts.                                                |

## What changed

- Added `agents/INDEX.md`.
- Added `agents/openai.yaml`.
- Added `agents/revenue-hunter/README.md`.
- Added `agents/revenue-hunter/openai.yaml`.
- Kept `agents/revenue-hunter.md` as the canonical prompt file and `agents/revenue-hunter-quickstart.md` as the operator guide.

## Reasoning for these changes

1. The user asked to establish `agents/revenue-hunter`, which implied a stable path rather than only a flat filename.
2. The repository already uses flat Markdown agent specs, so moving or duplicating the canonical Revenue Hunter prompt would create unnecessary drift risk.
3. The prior `CurrentState` entry explicitly recommended adding `agents/INDEX.md`; this pass closes that gap while preserving backward compatibility.
4. A root `agents/openai.yaml` registry now gives the directory a single OpenAI-facing entrypoint instead of relying only on per-agent metadata files.

## Validation performed

- Reviewed the existing agent surfaces and companion docs:
  - `find agents -maxdepth 3 -type f | sort`
  - `sed -n '1,260p' agents/revenue-hunter.md`
  - `sed -n '1,220p' agents/revenue-hunter-quickstart.md`
  - `sed -n '1,220p' agents/skills-keeper.md`
- Reviewed the new catalog surfaces after editing:
  - `sed -n '1,220p' agents/INDEX.md`
  - `sed -n '1,220p' agents/openai.yaml`
  - `sed -n '1,220p' agents/revenue-hunter/README.md`
  - `sed -n '1,120p' agents/revenue-hunter/openai.yaml`
- No runtime tests or builds were required because this was a documentation and agent-structure pass only.

## Overall repository state after this pass

- **Done:** `agents/revenue-hunter` now exists as a stable folder path.
- **Done:** `agents/openai.yaml` now provides a root-level registry for the visible agent catalog.
- **Done:** Revenue Hunter now has an `openai.yaml` metadata file in the established folder path.
- **Done:** `agents/INDEX.md` now standardizes agent discovery and canonical-file policy.
- **Done:** Existing Revenue Hunter prompt content remains single-source and backward compatible.
- **Risk:** Any future move from flat agent specs to per-agent folders should be handled as a deliberate repo-wide migration, not one-off drift.

## Canonical files for this pass

- `agents/INDEX.md`
- `agents/openai.yaml`
- `agents/revenue-hunter/README.md`
- `agents/revenue-hunter/openai.yaml`
- `agents/revenue-hunter.md`
- `agents/revenue-hunter-quickstart.md`
- `docs/CurrentState.md`

---

# CurrentState — Billy DEP0169 triage + runtime diagnostics hardening

**Last updated:** 2026-03-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Reproduced `/api/billy` in non-prod with deprecation tracing, isolated likely dependency path, upgraded/pinned runtime dependencies, and added request-correlated deprecation warning capture.

## Executive summary (2026-03-29)

- Ran `/api/billy` locally with `NODE_OPTIONS=--trace-deprecation` under Node 22 using a direct handler harness to ensure stack traces would include exact offenders if emitted.
- No `DEP0169` warning was emitted in this container during representative Billy calls after dependency alignment.
- Upgraded `@vercel/node` from `4.0.0` to `5.6.22` (minimum meaningful runtime lane jump for Vercel Node adapter) and pinned `follow-redirects@1.15.11` via `overrides` because the warning class originates in transitive URL handling pathways not directly controlled in app code.
- Added a lightweight deprecation warning guard in `api/billy.ts` that captures warning metadata together with `requestId` and `traceId` via `AsyncLocalStorage` so future runtime regressions have immediate correlation context.

## DEP0169 investigation details

### Reproduction attempts

1. **Direct API handler execution with tracing enabled**
   - Command:
     - `NODE_OPTIONS=--trace-deprecation npx -y node@22 node_modules/tsx/dist/cli.mjs /tmp/repro-billy.mts`
   - Result:
     - Handler executed (with expected outbound-network fetch failures in sandbox), but no `DEP0169`.
2. **Vercel dev runtime attempt**
   - Command:
     - `NODE_OPTIONS=--trace-deprecation npx vercel dev --listen 4010`
   - Result:
     - Environment could not fully start Vercel dev due to external connectivity failures (`ENETUNREACH` to Cloudflare/Vercel endpoints), so this path could not produce a trace stack in-container.

### Dependency conclusion and minimum adjustment

- **Likely warning lane:** transitive URL compatibility code inside HTTP client/proxy dependency chains surfaced only under specific runtime adapters.
- **Minimum practical remediation in this repo:** bump `@vercel/node` from `4.x` to `5.6.22` and pin `follow-redirects@1.15.11`.
  - This preserves current app behavior while removing stale adapter/runtime combinations most likely to surface Node URL deprecations in serverless execution.
  - We do not directly call `url.parse()` in `api/billy.ts`; this is dependency/runtime-surface hardening.

### Post-change verification

- Re-ran representative `/api/billy` request path with deprecation tracing and scanned output:
  - `NODE_OPTIONS=--trace-deprecation npx -y node@22 node_modules/tsx/dist/cli.mjs /tmp/repro-billy.mts`
  - `rg -n "DEP0169|DeprecationWarning" /tmp/billy-trace-after.log`
- Result: no DEP0169 found in the captured logs for the tested path.

## Recommendations / next steps

1. Run the same trace command in Vercel Preview/Dev where the warning was originally observed and confirm the stack is now clean there as well.
2. If DEP0169 reappears, capture the exact stack and pin the specific transitive package via `overrides` with a comment in `package.json`.
3. Keep the new request-correlated warning guard in place for all Billy boot diagnostics and ingestion-related startup checks.

---

# CurrentState — Vercel TypeScript build failure fix (`Error.code` narrowing)

**Last updated:** 2026-03-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Resolved Vercel compile break in `api/billy.ts` and re-validated production build command.

## Executive summary (2026-03-29)

- Fixed the Vercel/TypeScript build error `TS2339: Property \`code\` does not exist on type \`Error\``at`api/billy.ts(107,21)`.
- Updated deprecation warning logging to safely narrow `warning` to `NodeJS.ErrnoException` before reading `.code`.
- Re-ran `npm run build`; TypeScript and Vite build now pass in this environment.

## Change details

### Root cause

- Node's `process.on("warning")` callback value is typed as `Error` in this TypeScript context.
- The code accessed `warning.code` directly, which is not guaranteed on `Error`, causing compile failure in Vercel.

### Remediation

- Introduced `warningCode` with runtime type narrowing:
  - read `.code` only when `typeof (warning as NodeJS.ErrnoException).code === "string"`
  - otherwise fall back to `"unknown"`
- Preserved existing warning payload shape and all correlation metadata.

## Validation performed

- `npm run build` ✅ passed (`tsc && vite build`).

## Next steps / recommendations

1. Keep this narrowing pattern for any Node warning/error properties not present on base `Error`.
2. If further Vercel-only type/runtime differences appear, validate via `npm run build` before deploy.
3. Continue tracking deprecation warnings in production logs for `DEP0169` noise reduction.

---

---

# CurrentState — Core Docs Runtime-Alignment Refresh

**Last updated:** 2026-03-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Refreshed the main non-skill architecture and operations docs so they match the current route map, API surface, Billy flow, Supabase usage, and deployment/env reality.

## Executive summary (2026-03-29)

- Rewrote the core runtime docs that were still describing older Billy, routing, provider-order, and file-layout assumptions.
- `docs/AIFlow.md` now describes the current API-first Billy path, the server-side retrieval pipeline, the real provider cascade, and the client fallback boundary.
- `docs/APIFlow.md` now includes the live endpoint inventory, including pricing, session, webhook, health, bucket-drop, and voice routes that were previously missing.
- `docs/ArchitecturalStructure.md`, `docs/Manifest.md`, `docs/README-manifest.md`, `docs/Workflows.md`, and `docs/VERCEL_ENV_CHECKLIST.md` were rewritten to align with current repo files and integrations.

## What changed

- Rewrote:
  - `docs/ArchitecturalStructure.md`
  - `docs/AIFlow.md`
  - `docs/APIFlow.md`
  - `docs/Manifest.md`
  - `docs/README-manifest.md`
  - `docs/Workflows.md`
  - `docs/VERCEL_ENV_CHECKLIST.md`
- Corrected major stale assumptions, including:
  - Billy no longer being documented as primarily direct browser-to-Gemini
  - the LLM router no longer being described as a generic key-first selection layer
  - missing API routes such as `/api/billy-health`, `/api/billy-bucket-drop`, `/api/pricing`, `/api/session/state`, `/api/stripe/*`, and `/api/voice/billy`
  - outdated references to non-current files like `AGENTS.md`, `CodexAgent.md`, and old skill-number paths in `docs/Workflows.md` and `docs/Manifest.md`
  - outdated client/runtime assumptions such as React 18, React Router v6, and React Query-backed app state
- Added current Supabase emphasis across the core docs:
  - auth
  - user tiers
  - founder continuity
  - rate limits
  - retrieval fragments
  - RPC search

## Validation performed

- Read and compared the current runtime sources before rewriting docs:
  - `client/src/App.tsx`
  - `client/src/components/BillyLive.tsx`
  - `client/src/lib/billyApi.ts`
  - `client/src/contexts/AuthContext.tsx`
  - `api/billy.ts`
  - `api/actions/[...path].ts`
  - `api/billy-health.ts`
  - `api/billy-bucket-drop.ts`
  - `api/pricing.ts`
  - `api/session/state.ts`
  - `api/stripe/checkout.ts`
  - `api/stripe/webhook.ts`
  - `api/voice/billy.ts`
  - `api/_lib/llmRouter.ts`
  - `api/_lib/supabase.ts`
  - `supabase/config.toml`
  - `supabase/schema.sql`
  - `vercel.json`
- Checked for stale doc patterns before rewriting:
  - older React/router references
  - missing or renamed files
  - outdated skill-path references
  - obsolete “BillyLive is direct browser Gemini” wording
- No runtime tests or builds were run for this pass because the changes were documentation-only.

## Current repo condition after this pass

1. The main architecture docs are materially closer to the current source tree.
2. Billy, API, and Supabase documentation now match the live runtime much more closely than the March 13, 2026 versions.
3. The core docs and the refreshed GestaltView skill suite are now aligned with each other.

## Remaining risks / next steps

1. Generated wiki and historical snapshot docs under `docs/generated_*` and `docs/wikis/*` still contain older references and should be treated as archival outputs until refreshed separately.
2. If more runtime drift appears, prefer updating the code-adjacent docs (`AIFlow`, `APIFlow`, `ArchitecturalStructure`, `Manifest`, `Workflows`) in the same pass as the underlying change.
3. A future cleanup pass should reconcile older secondary docs like `PERPLEXITY.MD` and other long-form snapshots that still mention removed files or outdated operating conventions.

---

---

# CurrentState — Consolidated Wiki Refresh

**Last updated:** 2026-03-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Replaced the stale consolidated wiki export with a repo-current single-page snapshot generated against the live route map, Billy/API flow, Supabase layer, and refreshed docs/skills surfaces.

## Executive summary (2026-03-29)

- Rewrote `docs/GestaltView-v2-Wiki.md` from scratch instead of preserving stale sections that still referenced removed skill-number paths and older runtime assumptions.
- Rebuilt the wiki around current source anchors: `client/src/App.tsx`, `client/src/components/BillyLive.tsx`, `client/src/lib/billyApi.ts`, `api/billy.ts`, `api/_lib/llmRouter.ts`, `api/_lib/supabase.ts`, `supabase/schema.sql`, `supabase/config.toml`, `server/index.ts`, and `vercel.json`.
- Aligned the new wiki with the already refreshed companion docs (`ArchitecturalStructure`, `AIFlow`, `APIFlow`) and the refreshed GestaltView skill-suite state.

## What changed

- Replaced the prior giant wiki export with a shorter consolidated page that now:
  - uses the generate-wiki page marker format
  - includes an explicit relevant-sources block
  - anchors every major section to current file citations
  - documents the actual API-first Billy path, current provider cascade, live route inventory, API families, Supabase split, and repo-boundary guidance
- Removed stale references and outdated claims from the wiki, including:
  - old numbered skill paths such as `skills/00-suite-orchestrator/*` and `skills/07-workflow-operations/*`
  - older Billy browser-first framing
  - route and API assumptions that no longer match the live repo

## Validation performed

- Used the repo-local generate-wiki skill and reviewed its current workflow/reference files before editing.
- Collected a repo context snapshot with:
  - `python3 skills/gestaltview-generate-wiki/scripts/collect_context.py --repo-path . ...`
- Extracted line-numbered source material with:
  - `python3 skills/gestaltview-generate-wiki/scripts/read_files.py --repo-path . --files '[...]'`
- Verified only one live consolidated wiki target exists under `docs/`:
  - `docs/GestaltView-v2-Wiki.md`
- Spot-validated the rewritten wiki against:
  - `README.md`
  - `client/src/App.tsx`
  - `client/src/components/BillyLive.tsx`
  - `client/src/lib/billyApi.ts`
  - `api/billy.ts`
  - `api/_lib/llmRouter.ts`
  - `api/_lib/supabase.ts`
  - `supabase/schema.sql`
  - `supabase/config.toml`
  - `server/index.ts`
  - `vercel.json`
- No runtime tests or builds were run because this pass was documentation-only.

## Remaining risks / next steps

1. This repo still does not carry a live wiki `toc.yaml`, so the refreshed output is intentionally a single current snapshot page rather than a regenerated multi-page wiki tree.
2. If `docs/wikis/` or a TOC-driven export returns as an actively maintained surface, the next pass should formalize that structure and run the skill validator against it.
3. Future wiki edits should stay tied to the same source-citation discipline used in this refresh so the page does not drift back into narrative overreach.

---

# CurrentState — ChatGPT Actions embodiment/runtime import refresh (2026-06-09)

**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2.0`)
**Scope of this pass:** Updated the ChatGPT Actions package and middleware so Custom GPT imports point at `https://gestaltview-v2-0-nine.vercel.app/api` and can ground themselves in the current embodiment profile registry, runtime manifest, feature manifest, and action logic guardrails.

## What changed

- Added read-only Actions middleware support for `GET /actions/embodiment_profiles`, `GET /actions/runtime`, `GET /actions/features`, and `GET /actions/logic`.
- Added explicit Vercel route files for the new read-only actions so they do not depend on catch-all behavior in deployment.
- Updated the core and comprehensive OpenAPI imports to version `2.1.0` and changed the server URL to `https://gestaltview-v2-0-nine.vercel.app/api`.
- Updated the GPT package docs, instructions, backend map, and examples to include the embodiment/runtime/features/logic grounding actions.
- Extended Actions tests to cover the new grounding endpoints and explicit route files.

## Validation notes

- OpenAPI YAML parsing passed for both the core and comprehensive schemas after installing `pyyaml` in the agent environment.
- JSON parsing passed for `gestaltview_gpt_actions_examples.json`.
- The focused Vitest command could not run because `vitest` is not installed in this checkout's `node_modules`/PATH.
- TypeScript import/type checks are currently blocked by missing local type packages (`@types/node`, `vite/client`) and the existing TypeScript 6 `baseUrl` deprecation warning.

## Operator note

For ChatGPT Actions import, use the schema URL rooted at `https://gestaltview-v2-0-nine.vercel.app/api` rather than the older `gestaltv1ew` deployment URL. The new grounding endpoints are public/read-only action context and should not be treated as write, auth, billing, database, or deployment controls.

## CurrentState — Architecture Audit (2026-06-10)

Ran the requested top-to-bottom architecture and functional audit across the live `gestaltview-v2.0` workspace, starting from `docs/CurrentState.md`, `vercel.json`, `middleware.ts`, `supabase/migrations/`, and the `api/` tree. The full report is recorded at `audits/audit_report_2026-06-10.md` and flags the highest-priority follow-ups as identity derivation hardening for Billy/Bucket Drop/gen-engine/Creation Corner, Codex drain atomic job claiming, Transcriptory failed/concurrent capture handling, GATE Stripe raw-body verification, production CORS fail-closed behavior, and removal/clarification of tracked build output and overlapping agent/worker surfaces.

# CurrentState — Phase 6 shared runtime handoff contract (2026-07-27)

Phase 6 now has a local, reviewable implementation package. The live schema-fit
audit is recorded in `docs/launch/phase6-schema-fit-audit-2026-07-27.md`.
Inspection covered all 18 tables required by the convergence spec, including
live columns, policies, indexes, triggers, estimated rows, and repository use.
No production DDL or data mutation was performed.

The audit found no safe existing home for a cross-room lifecycle receipt.
`runtime_handoffs` and append-only `runtime_handoff_events` are therefore
proposed as narrow reference/lifecycle tables. The shared Zod contract, guarded
API, and browser client are implemented under `shared/handoffs/`,
`api/runtime-handoffs/`, and `client/src/lib/runtimeHandoffClient.ts`.

Local verification:

- `pnpm exec tsc --noEmit`
- focused handoff contract/API tests
- migration source-contract tests

Production migration application remains explicitly gated on outside approval.
Phase 7 room adapters must not begin claiming durable transfers until this
migration has been reviewed and applied in an approved environment.

---

# CurrentState — Inside-Out Convergence Phase 7A–7B (2026-07-29)

**Scope:** Bind Transcriptory to the Phase 6 shared handoff contract and stop
before Blackboard consumer work. No production DDL, deployment, Blackboard,
Sanctuary, Tribunal, Gallery, Founder Runtime, corpus, or broad security-policy
change was performed.

## Known

- Work began from clean `main` at
  `3df50a903b7e93985712a57dbf7544a08c49227c`; the founder explicitly approved
  direct edits on `main`.
- The Phase 6 implementation is located at commit
  `64e603f5765b61d5f68091527161781ffd761fae`.
- Its persistence package is
  `supabase/migrations/20260727222849_runtime_handoffs_v1.sql`; it remains a
  local/repository migration rather than demonstrated production state.
- The selected persistence shape and live schema evidence remain in
  `docs/launch/phase6-schema-fit-audit-2026-07-27.md`.
- Canonical boundaries are `shared/handoffs/contracts.ts`,
  `api/runtime-handoffs/`, and
  `client/src/lib/runtimeHandoffClient.ts`.
- Phase 6 focused evidence lives in
  `tests/api/runtime-handoffs.integration.test.ts` and
  `tests/migrations/runtime-handoffs-v1.test.ts`.

## Phase 7A transfer map

| Existing transfer                          | Classification                     | Current disposition                                                                                                  |
| ------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Transcriptory capture POST                 | source creation                    | Preserved; creates the owned source before transcription or handoff success                                          |
| Transcriptory audio POST                   | derivative creation                | Preserved; AssemblyAI transcript remains distinct from the source record and private audio object                    |
| `/api/transcriptory/captures/[id]/handoff` | legacy room-specific handoff offer | Retained for compatibility, but the live Transcriptory UI no longer uses it                                          |
| `requestTranscriptoryHandoff`              | handoff offer                      | Rebound to `gestaltview.runtime-handoff.v1`, then explicitly transitions `prepared → offered`                        |
| Transcriptory session-storage packets      | local destination compatibility    | Written only after durable offer success for persisted captures; retained because Phase 7C consumers still read them |
| Local Transcriptory capture                | local compatibility state          | Now stored in `gestaltview.transcriptory.localCaptures.v1` with stable `localCaptureId`                              |
| Destination receipt                        | destination acceptance             | Not implemented here; belongs to Phase 7C and is never implied by an `offered` handoff                               |

Eligible Phase 7B files were limited to the Transcriptory page, viewer, client,
transcription route, and focused tests. Blackboard and destination consumers
remain Phase 7C scope.

## Attempted and changed

- Persisted captures now offer owner-scoped Blackboard, Creation Corner, or
  Sanctuary handoffs through the shared Phase 6 client.
- Handoff payloads carry source and derivative references rather than copying
  raw transcript text. The capture reference and transcription derivative are
  explicitly distinct.
- The UI reports durable offer ID/state separately from destination acceptance.
  Persistence failure is visible and does not trigger the browser compatibility
  packet.
- Local-only records survive reload with their original local identity and are
  labeled as having no durable receipt.
- Source-record creation, transcription, and handoff failure are presented as
  separate states. In-session transcription retry reuses the same capture ID.
- When AssemblyAI fails after private audio storage succeeds, the failed capture
  now retains `audio_storage_path`, so the source remains retrievable for a
  later retry rather than becoming an orphaned object.
- Archive confirmation now calls out source/relationship consequences.

## Observed evidence and current authority

- Focused Phase 6/Transcriptory verification: 4 files, 34 tests passed.
- `pnpm exec tsc --noEmit`: passed.
- `pnpm run build` (`tsc && vite build`): passed.
- `git diff --check`: passed.
- Repository-wide `pnpm test`: 160 files and 689 tests passed; 16 files
  failed (10 assertion failures plus 6 unrelated suite parse failures). The
  failures are outside this slice in trainer, orchestration, GATE, Supabase
  configuration, council, rendering, route coverage, scaffold, Origin Story,
  and uploaded-document surfaces. They remain pre-existing repository drift
  rather than evidence for Transcriptory completion.
- The Phase 6 contract is **modeled and locally evaluated**, not demonstrated
  production-operational while its migration remains unapplied.
- Transcriptory is **integrated locally** with the canonical offer boundary.
  Destination acceptance/reopen proof remains intentionally open until Phase
  7C.
- Authority is **Bridge** for Phase 7A–7B local implementation and **Hold** only
  for production durability claims, production migration/deployment, and
  Phase 7C destination behavior.
- The outside guide/founder retains the Phase 7C GO/HOLD decision.

---

# CurrentState — Inside-Out Convergence Phase 7C (2026-07-29)

**Scope:** Make Blackboard a canonical consumer and producer while preserving
existing local room behavior. This slice does not execute the Phase 7D
three-room proof, apply production DDL, deploy, or begin Phase 8.

## Known

- Phase 7A–7B left durable handoffs in `offered`; the Blackboard and Creation
  Corner compatibility readers did not acknowledge them.
- Blackboard typed, voice, and uploaded captures already route through
  `routeBlackboardCaptureThroughPipeline`, preserving their source type and
  canonical capture identity.
- Blackboard recap and blueprint exports already existed, but Creation Corner
  and External Scaffold transfers were browser-local actions without shared
  lifecycle receipts.
- Blackboard messages remain local-first under `gv.blackboard.chat.v1`; that
  storage identity is retained rather than silently reclassified as durable.

## Attempted and changed

- Added `client/src/lib/blackboardRuntimeHandoffs.ts` as the room adapter over
  the Phase 6 client. It does not define a second envelope.
- Transcriptory compatibility packets now carry their durable handoff ID.
  Blackboard resolves the owner-scoped offer, creates a stable citation, and
  records an `accepted` receipt with `blackboard-citation:<handoff_id>`.
- Accepted Transcriptory sources render a visible source citation. Legacy
  packets remain labeled local-only.
- Intake removes the compatibility packet only after Blackboard processing
  succeeds. A persistence or acknowledgement failure retains the packet for
  retry.
- Blackboard blueprint offers to Creation Corner include source references,
  capture references, selected embodiment participation, and consent scope
  without copying private blueprint body text into the shared receipt.
- Creation Corner acknowledges Blackboard blueprint and Transcriptory source
  offers with destination references.
- External Scaffold promotion now requires an explicit authenticated durable
  offer before local queue/pipeline work begins.
- “Propose profile memory” creates a reviewable local proposal linked to the
  blueprint and source captures. It does not mutate profile or memory state.
- New Blackboard user messages are visibly labeled as local session records and
  retain their existing message IDs.

## Observed and open

- Adapter tests cover Transcriptory acceptance, idempotent reopen, Blackboard
  blueprint offer, Creation Corner acceptance, explicit External Scaffold
  offer, selected embodiment context, body non-duplication, and profile
  proposal behavior.
- Six focused contract, client, routing, and integration files pass with
  **27/27 tests**.
- `git diff --check` passes.
- Compiler/build verification remains environmental rather than green:
  `pnpm run build` was terminated during `tsc` with `SIGTERM` and no
  diagnostic. A separate `pnpm exec vite build` transformed all **5,434
  modules**, then was also terminated with `SIGTERM` while rendering chunks.
  Neither termination is evidence of a source error, but neither is recorded
  as a successful production build.
- Phase 7D remains open: the complete
  `Transcriptory → Blackboard → Creation Corner` fixture has not yet been
  executed against an applied handoff migration.
- Authority is **Bridge** for the local Phase 7C adapters and **Hold** for
  production durability claims or Phase 8 until Phase 7D evidence and outside
  review exist.

---
## Insight-Bot 2.0 platform adapters (2026-07-30)

`insight-bot-2/` now contains deployable Reddit Devvit Web and Discord HTTPS
interaction adapters for Billy. Both use the canonical
`POST /api/insight-bot/respond` GestaltView boundary, public context only, and
explicit degraded/disabled states. Reddit is private-in-post by default with
installation policy controls; Discord is ephemeral by default and requires no
Gateway or privileged intents. Platform playtests and credential configuration
remain operator deployment steps.

- The adapter default and Devvit HTTP allowlist now target the confirmed
  production runtime at `https://gestaltview-v3-psi.vercel.app`.
- Reddit uses `GET /api/actions/health` as its low-cost readiness signal and
  keeps Billy conversation traffic on the protected
  `POST /api/insight-bot/respond` boundary. Generic Actions mutations are not
  exposed to the Reddit browser.
- Production observation on 2026-07-30: Actions health returned HTTP 200 with
  schema `2.1.0` and platform version `67dfe7919b66`; the Insight-Bot route
  returned the expected HTTP 405/`Allow: POST` response to a GET probe.
- The repo now contains a protected `POST /api/insight-bot/execute` approval
  bridge. Devvit verifies actions against its Redis-cached Billy response;
  approved capture/artifact payloads persist as deterministic
  `insight_bot_runtime_events` receipts and must be read back before the UI says
  `Preserved`. This code is local until the Vercel deployment is updated and
  the bridge migration/service-role configuration are confirmed in production.
