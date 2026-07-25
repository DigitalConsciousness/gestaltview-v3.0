# BugWalk Board

**Last updated:** 2026-05-03
**Board owner:** GestaltView runtime repo (`gestaltview-v2`)  
**Primary source capture:** `bugwalks/Bugwalk.mht`  
**Operating rule:** `BugWalkBoard.md` is the live walkthrough board. `docs/CurrentState.md` is the canonical implementation log. Every bug-fix pass ends with updates to both files.

## Dual-Log Fix Protocol

1. When a bug-fix pass starts, move the card to `In Flight`.
2. When the pass ends, update this board card and `docs/CurrentState.md` in the same change.
3. Add an `Attempt log` once code or config has been tried.
4. If the bug still reproduces, keep it open and record what did not work in both places.
5. Do not leave `Shipped / Verify` cards with `CurrentState link: pending` after the fix pass is done.

## Fresh Sightings

### BW-2026-04-09-08 — Billy voice studio still needs a real operator flow

- `Status:` Fresh Sightings
- `Surface:` Billy voice studio
- `Symptom:` The studio needs to be editable, accessible, and cheap to tinker with instead of feeling like a static proof surface.
- `Impact:` Voice experimentation is harder than it should be, which slows iteration and makes the feature feel less real.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Frontend / voice
- `Next move:` Define the minimum editable controls, sandbox path, and low-cost prototype loop.
- `Evidence:` `bugwalks/Bugwalk.mht`

### BW-2026-04-09-10 — Mobile chat composer still has interaction friction

- `Status:` Fresh Sightings
- `Surface:` Billy chat surfaces
- `Symptom:` The walkthrough called out the Billy chip hovering over send and inconsistent mobile Enter/send behavior on at least some chat screens.
- `Impact:` This is exactly the kind of micro-friction that makes mobile chat feel broken.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Frontend
- `Next move:` Audit composer layout and submit behavior across Billy chat variants, especially mobile viewports.
- `Evidence:` `bugwalks/Bugwalk.mht`

### BW-2026-04-09-11 — GATE key fulfillment still needs end-to-end verification

- `Status:` Fresh Sightings
- `Surface:` GATE issued-key redeem/download flow
- `Symptom:` Request and validate failures were called out in the walkthrough. The local redeem route fix removes one obvious failure point, but the full create-order to redeem to download-or-email flow still needs verification.
- `Impact:` Users cannot trust package delivery unless the fulfillment path is proven end to end.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Backend / ops
- `Next move:` Run an end-to-end issued-key flow check in a deployed environment and confirm download or email fulfillment.
- `Evidence:` `bugwalks/Bugwalk.mht`, `vercel.json`

### BW-2026-04-27-04 — Sentry guidance mismatch between Next.js Webpack docs and this Vite runtime

- `Status:` In Flight
- `Surface:` Observability / Sentry setup
- `Symptom:` The current request references Sentry's Next.js Webpack setup guide, but `gestaltview-v2` is a Vite React runtime and has no active Sentry initialization path in `client/src`.
- `Impact:` Following Next.js-specific Webpack options directly here risks configuration drift, while production error telemetry remains partially or fully uninstrumented.
- `Source:` 2026-04-27 operator request with Sentry Next.js Webpack setup reference
- `Owner:` Frontend / observability
- `Attempt log:` Followed the `sentry-nextjs-sdk` skill detection workflow via `curl` + local repo probes; confirmed no Next.js runtime in this repo and expanded a repo-scoped setup matrix instead of applying Next.js Webpack options blindly.
- `Next move:` Implement the Vite runtime bootstrap here, then run per-repo detection in integrated repos before any Next.js/Webpack-specific changes.
- `Validation:` `cat package.json | grep -E '"next"|"@sentry/'`; `rg --files | rg 'next\.config\.(ts|js|mjs)$'`; `rg -n 'global-error\.tsx|_error\.tsx' agent_trainer client server api`
- `Evidence:` `package.json`, `vite.config.ts`, `client/src/main.tsx`, `docs/SentrySetup.md`

## Shipped / Verify

### BW-2026-05-03-01 — Vercel build failed on Sanctuary willow Babylon type drift

- `Status:` Shipped / Verify
- `Surface:` Sanctuary Babylon render stack (`/sanctuary`)
- `Symptom:` Vercel build failed with TypeScript errors from `WillowModel`, `WillowScene`, and `SanctuaryWillowBabylon` contract drift (`WillowModelHandle` missing/export drift, invalid Babylon `incisions` option, missing prop/type declarations).
- `Impact:` Deployment blocked at compile step (`npm run build`).
- `Source:` 2026-05-03 Vercel build log (`Commit: 3266741`)
- `Owner:` Frontend
- `Fix:` Reintroduced explicit `WillowModelHandle` contract with `root/update/dispose`, switched disc option to `tessellation`, aligned scene handle typing/update path, and restored missing Sanctuary component types/hooks.
- `Attempt log:` Reproduced from reported log signatures, patched Babylon module contracts, reinstalled dependencies, and reran production build.
- `Validation:` `npm ci --include=dev --legacy-peer-deps`; `npm run build`
- `CurrentState link:` `docs/CurrentState.md` entry "Babylon willow TypeScript contract repair for Vercel build unblock"

### BW-2026-05-02-01 — Sanctuary willow hidden off large breakpoints + Blackboard speech journaling dropped sessions

- `Status:` Shipped / Verify
- `Surface:` Sanctuary (`/sanctuary`) + Blackboard Room (`/whiteboard-room`)
- `Symptom:` Willow tree did not render in Sanctuary on non-large viewport layouts, and speech-to-text sessions in Blackboard Room could fail to start cleanly or stop capturing after recognition ended.
- `Impact:` Sanctuary lost a key environmental anchor, and voice journaling felt unreliable for spoken fragment capture.
- `Source:` 2026-05-02 operator report
- `Owner:` Frontend
- `Fix:` Removed `hidden lg:block` gating from willow wrapper/overlay and added responsive sizing offsets; hardened `useVoiceChat` start/stop/error lifecycle, added guarded recognition start handling, and auto-restart when continuous listening remains active.
- `Attempt log:` Traced Sanctuary willow render chain and Whiteboard voice toggle flow, then patched responsive visibility and SpeechRecognition lifecycle handling in the shared voice hook.
- `Validation:` `npm run build`; `git diff --check`
- `CurrentState link:` `docs/CurrentState.md` entry "Sanctuary willow render recovery + Blackboard speech capture stability"


### BW-2026-05-01-01 — Home hero and orb interface competed for attention

- `Status:` Shipped / Verify
- `Surface:` Public Home (`/`)
- `Symptom:` Hero copy, navigation, and orb interaction overlays competed in one monolithic page component, making visual hierarchy and handoff clarity harder to tune.
- `Impact:` Landing readability and orb selection confidence were reduced during first-visit scanning.
- `Source:` 2026-05-01 operator request with hero/interface split + visual notes
- `Owner:` Frontend
- `Fix:` Split Home overlays into `Hero.tsx` and `GestaltViewInterface.tsx`, then surfaced the requested hero/subheader and orb-identification guidance copy in the dedicated interface layer.
- `Attempt log:` Extracted overlay regions from `Home.tsx`, kept Babylon scene/runtime logic in page shell, rebuilt and type-checked full app.
- `Validation:` `npm run build`; `git diff --check`
- `CurrentState link:` `docs/CurrentState.md` entry "Home hero/interface separation and attention hierarchy pass"


### BW-2026-04-29-01 — Trainer Supabase admin client build failed on unsupported `db` option typing

- `Status:` Shipped / Verify
- `Surface:` Agent Trainer server / Supabase admin client
- `Symptom:` Vercel build failed with `TS2353` in `server/agent-trainer/supabaseAdmin.ts` stating `'db' does not exist in type 'SupabaseClientOptions'`.
- `Impact:` Production deployment blocked at TypeScript compile step for all new releases.
- `Source:` 2026-04-29 Vercel build log (`Commit: 49b0c27`)
- `Owner:` Backend / Agent Trainer
- `Fix:` Removed the unsupported `db` client option from `createClient(...)` and kept the timeout-enabled `global.fetch` override for query timeout resilience.
- `Attempt log:` Reproduced with `npm run build`, confirmed the compile failure line, removed the incompatible option, and re-ran the full build.
- `Validation:` `npm run build`; `git diff --check`
- `CurrentState link:` `docs/CurrentState.md` entry "Trainer Supabase admin `db` option TypeScript compatibility fix"

### BW-2026-04-28-01 — Vercel build failed on TrainingRun summary/detail type mismatch

- `Status:` Shipped / Verify
- `Surface:` Agent Trainer hook typing + run history selection UX
- `Symptom:` `npm run build` failed in `useTrainingRun.ts` because list endpoint summaries were passed into helpers typed for full `TrainingRunDetail`, and history list selections attempted to set detail state directly from summary rows.
- `Impact:` Production deploy failed during TypeScript compilation (`TS2345`/`TS2339`) and blocked release.
- `Source:` 2026-04-28 Vercel build log (`Commit: 04d78d2`)
- `Owner:` Frontend / Agent Trainer
- `Fix:` Updated the hook to treat list payloads as summary-or-detail list items, fetch full details for the selected run before setting `currentRun`, and route list-row selection through `refreshRun(runId)` instead of assigning partial objects directly.
- `Attempt log:` Reproduced the compile error locally, patched `useTrainingRun` + history row worker metadata guard, and re-ran full production build.
- `Validation:` `npm ci --include=dev --legacy-peer-deps`; `npm run build`; `git diff --check`
- `CurrentState link:` `docs/CurrentState.md` entry "Agent Trainer run list/detail TypeScript build fix"

### BW-2026-04-27-03 — Dashboard fallback masked the real admin/auth failure path

- `Status:` Shipped / Verify
- `Surface:` Admin Dashboard auth + founder outbox sync banner
- `Symptom:` The dashboard could show `Authenticated / Admin inactive / Founder synced` while still rendering `Dashboard state is unavailable right now`, with no actionable error visible.
- `Impact:` Operators got a misleading state: the fallback card looked like a generic reload issue even when the underlying admin/auth request failed.
- `Source:` 2026-04-27 operator report ("Authentication required" and unavailable dashboard state after founder sync check)
- `Owner:` Frontend / dashboard auth UX
- `Fix:` Updated founder-outbox auto-sync so it no longer clears existing dashboard errors when there is no pending local write, and added an explicit failure branch when pending writes remain unsynced after a flush attempt.
- `Attempt log:` Traced dashboard load + outbox-flush sequencing and confirmed the sync effect was resetting error state before the fallback card rendered.
- `Validation:` `npm run build`; `npx vitest run --root client src/tests/agent-trainer-api.test.ts`; `git diff --check`
- `CurrentState link:` `docs/CurrentState.md` entry "Dashboard auth fallback vs founder outbox sync state"


### BW-2026-04-27-02 — Agent Trainer admin auth cache raced dashboard changes

- `Status:` Shipped / Verify
- `Surface:` Admin Dashboard + Agent Trainer governance APIs
- `Symptom:` Ops handoff flagged Agent Trainer auth issues after today's Trainer enhancement and confirmed `CORS_ORIGINS=https://gestaltview-digital-intelligence.vercel.app`.
- `Impact:` Dashboard admin activation or user override could leave the API auth profile cache holding stale `is_admin=false`; Trainer then returned `403` and the client auth circuit could keep the control plane blocked for another cooldown window.
- `Source:` 2026-04-27 operator request
- `Owner:` API / ops
- `Fix:` Invalidated the API auth profile cache after dashboard admin changes, bypassed that cache on admin-gated routes, routed new hyperagent catalog calls through the shared Trainer API wrapper, corrected Trainer governance route names, and aligned runtime fallback origins to `https://gestaltview-digital-intelligence.vercel.app`.
- `Attempt log:` Audited the same-day hyperagent additions, dashboard admin bootstrap flow, auth cache, and Trainer client route map; found both stale admin cache and route-name drift.
- `Validation:` `npx vitest run --config vitest.api.config.ts api/__tests__/dashboard.test.ts api/__tests__/lib.test.ts api/__tests__/cors.test.ts`; `npx vitest run --root client src/tests/agent-trainer-api.test.ts`; `npm run build`; `git diff --check`
- `CurrentState link:` `docs/CurrentState.md` entry "Trainer admin auth cache and CORS origin correction"


### BW-2026-04-27-01 — SPEC-2 hyperagent integration remained design-only

- `Status:` Shipped / Verify
- `Surface:` Agent Trainer control plane + trainer runtime
- `Symptom:` The SPEC-2 connector/skill/memory hyperagent model existed as implementation-ready documentation but was not fully wired into runtime and admin surfaces.
- `Impact:` Trainer governance had limited visibility into connector and memory routing primitives needed for embodiment lifecycle operations.
- `Source:` `SPEC-2 – GestaltView Agent Trainer Hyperagent Integration.md`
- `Owner:` Admin trainer / backend / frontend
- `Fix:` Added hyperagent schema and run graph fields, new trainer connector/skill/memory APIs, orchestration graph observations, and Admin Trainer read surfaces for Connectors, Skill Graph, Memory Field, and lifecycle strip.
- `Attempt log:` Implemented migration, shared schema contracts, new API handlers/repository, orchestrator graph persistence path, and Agent Trainer UI panels.
- `Validation:` `npm run build`; `npx vitest run --config vitest.api.config.ts api/__tests__/trainer-queue-health-route.test.ts api/__tests__/trainer-run-events-route.test.ts`; `npx vitest run --root client src/tests/agent-trainer-api.test.ts`
- `CurrentState link:` `docs/CurrentState.md` entry "SPEC-2 Hyperagent integration implementation"

### BW-2026-04-13 — Agent Trainer Page API/Auth recommendations flow broke on method mismatch

- `Status:` Shipped / Verify
- `Surface:` Agent Trainer runtime (`/agent-trainer/control-plane`)
- `Symptom:` Study-source recommendations failed with diagnostics indicating a failed pre-response fetch.
- `Impact:` AgentTrainerPage could not complete the recommendation step reliably, blocking practical training runs.
- `Source:` BugWalk note from 2026-04-13
- `Owner:` API / auth integration
- `Fix:` `/api/trainer/study-sources/recommendations` now accepts both POST body payloads (current client contract) and legacy GET `runDraft` query payloads.
- `Attempt log:` Added request parsing for POST and GET, added limit parsing from query/body, and returned `400` for missing run draft payloads so failures are actionable instead of opaque `500`s.
- `Validation:` `pnpm exec vitest run api/__tests__/trainer-study-sources-recommendations-route.test.ts`
- `CurrentState link:` `docs/CurrentState.md` entry "Agent Trainer API/Auth end-to-end recommendations path"

### BW-2026-04-09-09 — Agent trainer package corpus needs explicit ingestion path

- `Status:` Shipped / Verify
- `Surface:` GATE package assembly
- `Symptom:` The repo already contains the agent-trainer files users are paying for, but the walkthrough flagged that those assets may not yet be flowing into Supabase-backed package assembly reliably.
- `Impact:` Package generation can look complete in the UI while still missing real deliverables downstream.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Backend / retrieval
- `Next move:` Spot-check package/trainer retrieval against the exported `agent-trainer-package` source paths; ingestion/export evidence is now present.
- `Evidence:` `bugwalks/Bugwalk.mht`, `scripts/ingest_agent_trainer_corpus.py`, `.github/workflows/ingest_agent_files.yml`, `package.json`, `agent_trainer/supabase/manifest/documents_rows (1).json`, `agent_trainer/supabase/manifest/documents_rows (2).json`
- `Validation:` `documents_rows (1).json` has 100 rows and 100 unique paths; `documents_rows (2).json` has 31 rows and 31 unique paths; combined exports cover 131 unique paths, package `agent-trainer-package`, and `package_builder_source=true`.
- `CurrentState link:` `docs/CurrentState.md` entry "Admin Trainer Agent Personhood Framework"

### BW-2026-04-09-01 — Browser TTS autoplay was jarring

- `Status:` Shipped / Verify
- `Surface:` Billy voice replies
- `Symptom:` Browser-generated TTS played by default and felt abrupt.
- `Impact:` Surprise audio is hostile UX, especially on first load.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Frontend
- `Next move:` Verify fresh-browser behavior on Billy, Billy Live, and Voice Studio.
- `Evidence:` `client/src/hooks/useBillyVoicePreference.ts`, `client/src/components/Billy.tsx`, `client/src/components/BillyLive.tsx`, `client/src/pages/BillyVoiceStudioPage.tsx`
- `Validation:` `pnpm exec tsc --noEmit`
- `CurrentState link:` pending next implementation log entry

### BW-2026-04-09-02 — Dropdowns rendered behind windows and overlays

- `Status:` Shipped / Verify
- `Surface:` Select menus
- `Symptom:` Dropdowns could open behind higher-z overlays.
- `Impact:` Key controls looked broken even when the data/state logic was fine.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Frontend
- `Next move:` Verify select menus inside high-z Billy and modal contexts.
- `Evidence:` `client/src/components/ui/select.tsx`
- `Validation:` `pnpm exec tsc --noEmit`
- `CurrentState link:` pending next implementation log entry

### BW-2026-04-09-03 — Agent Trainer public landing dropped users into the wrong surface

- `Status:` Shipped / Verify
- `Surface:` Agent Trainer route flow
- `Symptom:` `/agent-trainer` opened the hosted runtime page first instead of the public pricing and package-entry surface.
- `Impact:` Users were being asked to step into runtime/auth flows before getting the intended commercial framing.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Frontend
- `Next move:` Verify `/agent-trainer` lands on pricing and `/agent-trainer/runtime` carries the hosted runtime.
- `Evidence:` `client/src/App.tsx`, `client/src/pages/AgentTrainerPricing.tsx`, `client/src/pages/HostedAgentTrainerPage.tsx`
- `Validation:` `pnpm exec tsc --noEmit`
- `CurrentState link:` pending next implementation log entry

### BW-2026-04-09-04 — Hosted runtime page had internal-facing copy and dead-weight UI

- `Status:` Shipped / Verify
- `Surface:` Hosted Agent Trainer page
- `Symptom:` The page exposed internal “separate from the founder control plane” copy and a non-executable validation console surface.
- `Impact:` It made the experience feel internally oriented instead of product oriented.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Frontend
- `Next move:` Verify the removed copy stays out and the runtime page now orients from pricing.
- `Evidence:` `client/src/pages/HostedAgentTrainerPage.tsx`
- `Validation:` `pnpm exec tsc --noEmit`
- `CurrentState link:` pending next implementation log entry

### BW-2026-04-09-05 — Package builder selections and inputs bounced while typing

- `Status:` Shipped / Verify
- `Surface:` GATE package builder
- `Symptom:` Tier, theme, company name, and buyer email fields bounced, flickered, or reverted while editing.
- `Impact:` High-friction input behavior breaks trust fast, especially on mobile and for neurodivergent users.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Frontend / backend
- `Next move:` Verify that autosave no longer rehydrates draft data into actively edited inputs.
- `Evidence:` `client/src/components/GATEEntrypointWizard.tsx`
- `Validation:` `pnpm exec tsc --noEmit`
- `CurrentState link:` pending next implementation log entry

### BW-2026-04-09-06 — Sign-up only exposed magic link and not password setup

- `Status:` Shipped / Verify
- `Surface:` Authentication
- `Symptom:` Users could not create an email/password account directly from sign-in.
- `Impact:` The auth flow felt incomplete and confusing.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Auth / frontend
- `Next move:` Verify account creation, confirmation, and sign-in flows in Supabase-backed environments.
- `Evidence:` `client/src/contexts/AuthContext.tsx`, `client/src/pages/SignIn.tsx`
- `Validation:` `pnpm exec tsc --noEmit`
- `CurrentState link:` pending next implementation log entry

### BW-2026-04-09-07 — Pages lacked consistent back and home navigation

- `Status:` Shipped / Verify
- `Surface:` Demos, codex, and trainer subpages
- `Symptom:` Users could get stranded on showcase pages with no clear way back.
- `Impact:` This creates needless navigation anxiety and makes the site feel unfinished.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Frontend
- `Next move:` Spot-check the routed pages covered by the shared quick-nav component.
- `Evidence:` `client/src/components/SubpageQuickNav.tsx`, `client/src/App.tsx`, `client/src/pages/GATEPackageBuilderPage.tsx`, `client/src/pages/HostedAgentTrainerPage.tsx`
- `Validation:` `pnpm exec tsc --noEmit`
- `CurrentState link:` pending next implementation log entry

### BW-2026-04-09-12 — Metrics page was decorative instead of operational

- `Status:` Shipped / Verify
- `Surface:` Metrics dashboard
- `Symptom:` The walkthrough called the metrics surface “fluff” and asked for stuck-ops visibility with real controls.
- `Impact:` Operators cannot use vanity metrics to run the system.
- `Source:` 2026-04-09 walkthrough capture
- `Owner:` Frontend / ops
- `Next move:` Verify the dashboard shows actionable state for auth-gated and non-auth users.
- `Evidence:` `client/src/components/GestaltViewMetricsDashboard.tsx`
- `Validation:` `pnpm exec tsc --noEmit`
- `CurrentState link:` pending next implementation log entry
