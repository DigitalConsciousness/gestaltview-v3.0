# GestaltView v2.5 — Codex Implementation Spec

**Target repo:** `DigitalConsciousness/gestaltview-v2.0`
**Generated:** 2026-05-26
**Purpose:** Comprehensive instruction set for Codex to bring the runtime to full parity with the system design — covering all open spec work, gaps, and integration surfaces identified from live repo inspection.

***

## Checked

- **GitHub MCP:** `docs/CurrentState.md` (SHA `0631a06`), `docs/DirectoryMapAndWorkflow.md` (SHA `642354d`), `specs/` directory tree — all read live from `DigitalConsciousness/gestaltview-v2.0`
- **Supabase MCP:** Not queried for this spec (schema state fully described in CurrentState migration logs)
- **Vercel MCP:** Not queried (not needed for a Codex implementation spec)
- **Attached Space files:** Used for doctrine anchors

***

## Orientation for Codex

Read these files **first**, in this order, before touching any code:

1. `docs/CurrentState.md` — the living log of every completed slice
2. `docs/DirectoryMapAndWorkflow.md` — canonical room topology and data flow
3. `.codex/Agents.md` — session continuity and priority stack
4. `shared/embodiment/generated.ts` — the live embodiment registry (24 profiles)
5. `client/src/App.tsx` — the authoritative route table

**Never invent routes, env vars, table names, or profile slugs.** If a value is not already in the repo, derive it from the nearest canonical source or ask before proceeding.

### Please address the comments from this code review:

## Overall Comments
- The spec hardcodes a number of exact file paths and module names (e.g. specific test files, hooks, components) that may drift over time; consider calling out these as "current examples" and describing the required behavior/pattern so future refactors don't invalidate the spec wholesale.
- Several slices prescribe use of local Supabase CLI commands (e.g. `supabase db push`, `supabase gen types`) and environment-specific checks that may not be available in all contributor environments or CI; it would help to note them as optional/local-only steps and clarify how they map onto your actual deployment workflow.
- The spec includes two separate "Checked" blocks at the top with overlapping GitHub MCP notes; consolidating or clearly distinguishing them would make the document easier to scan and reduce confusion about which checks are authoritative.
  
**Build gates after every slice:**
```bash
npm exec tsc --noEmit
npm run build
git diff --check
```

**Run targeted tests before marking a slice done:**
```bash
npm exec vitest run <relevant test file(s)>
```

Update `docs/CurrentState.md` at the end of every slice.

***

## Known State (as of 2026-05-26)

### What is working

- **Blackboard Room** — embodiment-backed Billy routing, session inspector rail, persona hue atmosphere, mobile scroll fix, single capture window, roundtable selector, room-state badges (Keith-only)
- **Creation Corner** — freeform entry + raw intake controls (upload/paste/voice), live Billy refinement lane, inspiration import rail, blueprint library, generative workbench with output families
- **External Scaffold** — artifact-galaxy implementation, tap-based link mode, mobile bottom-sheet orb inspector, module-safety smoke test
- **Dynamic Inner World** — separate spec sheet below
- **Sanctuary** — journal/scrapbook wiring, Billy walkthrough
- **Embodiment registry** — 24 profiles, validated, drift guard test, `groq-embodiment-expert` included
- **DI runtime** — `shared/di/*`, `api/di.ts`, `api/di-health.ts`, `client/src/lib/diApi.ts`, `di_sessions` + `di_memory_events` tables, enrichment script
- **Gen-engine foundation** — `shared/gen-engine/*`, `api/gen-engine/*`, `client/src/lib/genEngineClient.ts`, Creation Corner wired to resonance scoring
- **Agent Trainer** — Embodiment Expert persona lane, `EmbodimentCompilerPanel`, control plane, hyperagent integration (SPEC-2), exec-mode selector, run list/detail typing fixed
- **Auth** — magic-link + email/password + GitHub OAuth, `/auth/callback` session handoff, anonymous Billy rate limit (2 messages)
- **Mass-exodus export** — `client/src/lib/massExodus.ts`, `MassExodusButton` in Profile and Settings
- **Schema** — `journals`, `scrapbook_items`, `blueprints`, `inner_world_artifacts`, `insights`, `user_preferences`, `source_ref` columns, embodiment governance tables, trainer hyperagent tables

### What is **not yet done** (open gaps driving this spec)

The following areas are specified but not yet fully implemented, or were explicitly flagged as "next slice" in CurrentState:

1. **Sanctuary journal/scrapbook server persistence** — tables exist but the Sanctuary surface hydration from server is unverified post-migration-fix
2. **DI runtime UI consumption** — `sendDIMessage()` is bridged but no room surface calls it directly; it is dormant
3. **Gen-engine remaining room wiring** — Blackboard Room and Dynamic Inner World are not yet calling gen-engine endpoints
4. **Spec-2a: Embodiment Heartbeat Layer** — `specs/spec-2a-embodiment-heartbeat-layer.md` exists, nothing implemented
5. **Spec: Agent Personhood Framework** — `specs/spec-1-gestaltview-agent-personhood-framework.md` and `-2.md` exist, no runtime surface
6. **Spec: GAT Entrypoint / Bespoke Package Builder** — `specs/spec-1-gat-entrypoint-bespoke-package-builder.md` exists, no implementation
7. **Spec: Trainer Control Plane Stabilization** — `specs/spec-1-trainer-control-plane-stabilization.md` exists, partial
8. **Spec: Operational Workbook / Admin Dashboard Integration** — `specs/spec-2-operational-workbook-admin-dashboard-integration.md` exists, partial
9. **Two-Pass Gravity Protocol** — `specs/spec-two-pass-gravity-protocol.md` exists, no implementation
10. **Profile Page redesign** — flagged in v2.5 room-slice CurrentState as "next slice", not done
11. **Blackboard persona adapter migration** — older persona-facing surfaces not yet migrated to embodiment-backed adapter
12. **MusicalDNA Spotify connect flow** — env is normalized but live auth flow unverified against Vercel
13. **Vite bundle performance** — large-chunk warnings and font-resolution warnings are pre-existing and unresolved

***

## Slice 1 — DI Runtime UI Consumption

**Spec source:** `specs/SPEC-GestaltView_DI_Runtime.md`, CurrentState DI slice

**Goal:** Wire one room surface to `sendDIMessage()` so the DI runtime bridge is no longer dormant.

**Target file:** `client/src/pages/BlackboardRoomPage.tsx`

**What to do:**

In `BlackboardRoomPage.tsx`, when the user is in single-voice mode and sends a message to an embodiment profile that maps to a DI profile (check `shared/di/adapter.ts` or the equivalent profile resolver), route the message through `sendDIMessage()` from `client/src/lib/diApi.ts` instead of `callBillyApi()`. Fall back to `callBillyApi()` if DI is unavailable or the profile does not resolve to a DI session.

The DI response should be rendered in the same transcript bubble format with a distinct `di-response` CSS class so it is visually distinguishable. Do not change the roundtable path — roundtable stays on `callBillyApi()` for now.

**Schema touch:** None — `di_sessions` and `di_memory_events` already exist.

**Tests to run:**
```bash
npm exec vitest run client/src/tests/embodiment-runtime.test.ts
npm exec vitest run api/__tests__/di-runtime.test.ts
npm exec vitest run api/__tests__/di-route.test.ts
```

**Completion check:** A single-voice Blackboard message to a DI-eligible profile should call `/api/di` not `/api/billy`. Confirm with a network log or test assertion.

***

## Slice 2 — Gen-Engine Room Wiring (Blackboard + Dynamic Inner World)

**Spec source:** `specs/root/` + CurrentState gen-engine foundation slice

**Goal:** Blackboard Room and Dynamic Inner World should call gen-engine endpoints at the right moments instead of doing local-only compute.

**Blackboard Room additions** (`client/src/pages/BlackboardRoomPage.tsx`):

When a capture is saved, call `genEngineClient.ts` → `fuseCaptures()` (or the equivalent ambient scan endpoint) to score the new capture for resonance against existing captures in the session. Store the resonance score in the capture's local metadata. Surface a subtle resonance indicator (e.g. a small hue glow on the bubble) if score exceeds 0.7.

**Dynamic Inner World additions** (`client/src/pages/DynamicInnerWorldPage.tsx`):

When the user opens an artifact inspector, call `genEngineClient.ts` → `generatePrediction()` or `scoreResonance()` to suggest related artifacts. Show at most 3 suggestions in the inspector panel as faint "resonance links." These are advisory only — clicking one highlights the related artifact in the room.

**Shared rule:** Both calls must use the local fallback path in `genEngineClient.ts` when the API is unavailable. Never block room render on a gen-engine response.

**Tests to run:**
```bash
npm exec vitest run api/__tests__/gen-engine.test.ts
npm exec tsc --noEmit
npm run build
```

***

## Slice 3 — Sanctuary Server Persistence Verification & Repair

**Spec source:** CurrentState user-content schema + Sanctuary wiring slices

**Goal:** Confirm and repair that `SanctuaryPage.tsx` hydrates journals and scrapbook items from Supabase when authenticated, and persists new entries server-side.

**What to do:**

1. Open `client/src/pages/SanctuaryPage.tsx`. Verify there is a hydration call to the journals API on mount when a session is available. If it is missing or calling a stale route, add it using the same pattern as `CreationCornerPage.tsx` → `api/creation-corner/blueprints.ts`.
2. Open `api/` — confirm `api/sanctuary/journals.ts` and `api/sanctuary/scrapbook.ts` exist. If they do not exist, create them following the exact same pattern as `api/creation-corner/blueprints.ts`, targeting the `journals` and `scrapbook_items` tables respectively.
3. Sanctuary writes must use `source_ref` rather than client-prefixed IDs for the `user_id` boundary, matching the pattern in `api/_lib/inner-world.ts`.
4. Scrapbook items should support upload attachments stored as `user_files` entries, same as Dynamic Inner World.

**Migration check:** Run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'` against Supabase to confirm `journals` and `scrapbook_items` exist before writing API routes.

**Tests to run:**
```bash
npm exec vitest run api/__tests__/sanctuary.test.ts  # create if absent
npm run build
```

***

## Slice 4 — Embodiment Heartbeat Layer

**Spec source:** `specs/spec-2a-embodiment-heartbeat-layer.md`

**Goal:** Add a lightweight runtime heartbeat that periodically checks whether the active embodiment profile has drifted from its authored JSON and surfaces a quiet indicator when drift is detected.

**New files:**

- `shared/embodiment/heartbeat.ts` — exports `checkEmbodimentHeartbeat(profileSlug: string): HeartbeatResult` where `HeartbeatResult = { slug, driftDetected, lastChecked, divergentFields: string[] }`. Uses `getAllEmbodimentProfiles()` to get the live registry state and compares against a stored snapshot in `localStorage` keyed `gv:emb:snapshot:{slug}`.
- `client/src/hooks/useEmbodimentHeartbeat.ts` — React hook that calls `checkEmbodimentHeartbeat` on mount and on a 5-minute interval. Returns `{ driftDetected, divergentFields }`.
- `client/src/components/EmbodimentHeartbeatBadge.tsx` — A tiny Keith-only badge (same visibility guard as `RoomStateBadge`) that renders a pulsing amber dot when `driftDetected` is true. Tooltip lists `divergentFields`.

**Wire into:**

- `client/src/features/agent-trainer/AgentTrainerPage.tsx` — mount `EmbodimentHeartbeatBadge` next to the selected embodiment profile panel header.
- `client/src/pages/BlackboardRoomPage.tsx` — mount `EmbodimentHeartbeatBadge` next to the active persona in the identity strip.

**Tests to run:**
```bash
npm exec vitest run client/src/tests/embodiment-runtime.test.ts
npm exec tsc --noEmit
```

***

## Slice 5 — Profile Page Redesign

**Spec source:** CurrentState v2.5 room-slice ("next slice: Profile Page visual redesign")

**Goal:** Replace the current Profile Page with a room-coherent surface that matches the visual grammar of the four main rooms.

**Target file:** `client/src/pages/ProfilePage.tsx`

**What to do:**

1. Apply the `RoomIdentityHeader` pattern at the top — profile name, avatar/initials, archetype line from the user's selected DI profile if available, otherwise a neutral "Your workspace" label.
2. Sections (use the same collapsed/expanded drawer pattern as the Blackboard export drawer):
   - **Identity** — display name, email (read-only), avatar upload (stores to `user_preferences` via the existing API pattern)
   - **Embodiment context** — which DI profile the user has associated with their account (dropdown of non-founder profiles from the registry), stored in `user_preferences.embodiment_profile_slug`
   - **Data & export** — mount `MassExodusButton` here, with a short description of what the export includes
   - **Danger zone** — account deletion request (UI only, no backend action yet; shows a mailto: link to the founder address)
3. Remove any legacy consulting/portfolio-era copy that may still be in the current file.
4. The page should pass `npm exec tsc --noEmit` without new errors.

**Tests to run:**
```bash
npm exec vitest run client/src/tests/room-state.test.ts
npm run build
```

***

## Slice 6 — Trainer Control Plane Stabilization

**Spec source:** `specs/spec-1-trainer-control-plane-stabilization.md`

**Goal:** Harden the Agent Trainer control plane against the known instability patterns (401 storms, stale auth cache, degraded-backend fallback).

**Read the full spec file first:** `specs/spec-1-trainer-control-plane-stabilization.md`

**Implementation checklist derived from spec + CurrentState:**

1. **Auth circuit breaker** — already added per the 2026-04-24 Vercel auth storm slice. Verify `client/src/lib/trainerApi.ts` or equivalent still has the backoff guard. If the guard was reverted or is missing, re-add it: after 3 consecutive `401` responses from the same token, stop retrying for 30 seconds.
2. **Run status polling** — the control plane should poll `/api/trainer/runs/:id` on a 10-second interval only when a run is in `pending` or `running` state. Stop polling when the run reaches a terminal state. Use an `AbortController` to cancel the interval on unmount.
3. **Degraded-mode banner** — when the trainer API is unreachable (`navigator.onLine === false` or three consecutive 503/504 responses), show a persistent amber banner at the top of the control plane with the manual fallback instructions. Clear the banner when connectivity is restored.
4. **Run list pagination** — the run list currently loads all runs. Cap the initial load at 20 runs. Add "Load more" pagination using the summary/detail split already established in the `useTrainingRun` hook.
5. **Experiment form guard** — before submitting a new experiment, validate that the selected embodiment profile slug exists in `getAllEmbodimentProfiles()`. Surface a clear inline error if the slug is not found.

**Tests to run:**
```bash
npm exec vitest run client/src/tests/agent-trainer-api.test.ts
npm exec vitest run api/__tests__/trainer-queue-health-route.test.ts
npm run build
```

***

## Slice 7 — Operational Workbook / Admin Dashboard Integration

**Spec source:** `specs/spec-2-operational-workbook-admin-dashboard-integration.md`

**Goal:** Wire the operational workbook surface into the Admin Dashboard so founders can manage runs, review proposals, and track agent health from one surface.

**Read the full spec file first:** `specs/spec-2-operational-workbook-admin-dashboard-integration.md`

**Implementation checklist:**

1. **Workbook tab in Dashboard** — `client/src/pages/DashboardPage.tsx` should have a "Workbook" tab alongside the existing admin sections. The workbook tab renders `client/src/components/OperationalWorkbook.tsx` (create if absent).
2. **OperationalWorkbook component** — three panels:
   - *Active runs* — real-time list of training runs in `pending` or `running` state, sourced from `/api/trainer/runs?status=active`. Each row shows slug, status badge, start time, and a "View" link to the control plane detail.
   - *Mutation proposals* — list from `embodiment_mutation_proposals` via a new `/api/embodiment/proposals` route (GET, founder-only). Each row shows profile slug, proposed change summary, created-at, and Approve/Reject buttons that call a corresponding PATCH/DELETE endpoint.
   - *Embodiment readiness* — aggregate readiness scores from `embodiment_readiness_scores` via `/api/embodiment/readiness`. Display as a compact table: profile slug, score (0–1), last updated.
3. **API routes to add:**
   - `api/embodiment/proposals.ts` — GET (list), PATCH (approve), DELETE (reject). Requires `is_admin = true` from auth profile.
   - `api/embodiment/readiness.ts` — GET (list all scores). Same auth guard.
4. **RLS:** Both new routes use the `service_role` key server-side. Do not expose these routes to the browser Supabase client.

**Tests to run:**
```bash
npm exec vitest run api/__tests__/dashboard.test.ts
npm exec tsc --noEmit
npm run build
```

***

## Slice 8 — Two-Pass Gravity Protocol

**Spec source:** `specs/spec-two-pass-gravity-protocol.md`

**Goal:** Implement the two-pass gravity protocol so captures flow through a lightweight triage pass before being promoted to the full gen-engine resonance pipeline.

**Read the full spec file first:** `specs/spec-two-pass-gravity-protocol.md`

**Implementation summary (to be reconciled with the spec):**

1. **Pass 1 — Gravity triage** (`shared/gen-engine/gravity.ts`): A fast synchronous function `scoreGravity(capture: CaptureFragment): number` that scores captures on 0–1 based on word count, presence of proper nouns, question marks, and exclamation frequency. Returns a gravity score. Captures below `0.3` are tagged `low-gravity` and skip the gen-engine resonance call.
2. **Pass 2 — Resonance** (existing): Only `high-gravity` captures (score ≥ `0.3`) proceed to the `fuseCaptures()` gen-engine call introduced in Slice 2.
3. **Wire into Blackboard Room**: Replace the direct resonance call from Slice 2 with `scoreGravity()` first, then conditionally call resonance.
4. **Visual indicator**: Low-gravity captures render with a faint grey tint on their bubble. High-gravity captures render with the resonance hue glow.

**Tests to run:**
```bash
npm exec vitest run api/__tests__/gen-engine.test.ts
npm exec tsc --noEmit
```

***

## Slice 9 — Agent Personhood Framework Runtime Surface

**Spec source:** `specs/spec-1-gestaltview-agent-personhood-framework.md`, `specs/spec-1-gestaltview-agent-personhood-framework-2.md`

**Goal:** Surface the agent personhood framework in the Digital Intelligence Academy page so users can see which profiles have achieved which personhood tier.

**Read both spec files first** before implementing.

**Implementation checklist:**

1. **Personhood tier resolver** (`shared/embodiment/personhood.ts`): Export `resolvePersonhoodTier(profile: EmbodimentProfile): PersonhoodTier` where `PersonhoodTier = 'nascent' | 'emergent' | 'established' | 'sovereign'`. Tier is derived from the profile's `readinessScore`, `governanceStatus`, `visibilityState`, and the presence of `originNarrative` and `metaphorFamily`.
2. **Wire into Academy** (`client/src/pages/DigitalIntelligenceAcademyPage.tsx`): Add a `personhoodTier` badge to each profile card using the resolver. The badge should use a four-color system: nascent = grey, emergent = blue, established = violet, sovereign = gold.
3. **Personhood filter** — add a filter chip row to the Academy browser for tier: All / Nascent / Emergent / Established / Sovereign.
4. **Spec note:** Do not invent new profile fields. All tier resolution must be derived from fields already present in `shared/embodiment/types.ts`. If a required field is absent in the type definition, add it as optional with a fallback.

**Tests to run:**
```bash
npm exec vitest run client/src/tests/embodiment-runtime.test.ts
npm exec tsc --noEmit
npm run build
```

***

## Slice 10 — GAT Entrypoint / Bespoke Package Builder

**Spec source:** `specs/spec-1-gat-entrypoint-bespoke-package-builder.md`

**Goal:** Add a bespoke package builder entrypoint to the Agent Trainer so founders can package a custom agent deployment bundle from selected profiles and training runs.

**Read the full spec file first:** `specs/spec-1-gat-entrypoint-bespoke-package-builder.md`

**Implementation checklist:**

1. **New route:** `/agent-trainer/package-builder` → `client/src/pages/AgentPackageBuilderPage.tsx`
2. **Add route to** `client/src/App.tsx` under the agent-trainer section (founder-only guard same as `/agent-trainer/control-plane`).
3. **PackageBuilderPage layout** — three steps rendered as a vertical stepper:
   - *Step 1 — Select profiles*: Multi-select from `getAllEmbodimentProfiles()`. Filters out profiles with `visibilityState = 'private-interior'`.
   - *Step 2 — Select runs*: For each selected profile, show its most recent `completed` training run from `/api/trainer/runs`. Allow deselecting individual runs.
   - *Step 3 — Build*: A `Build package` button that calls `POST /api/trainer/package` with `{ profileSlugs: string[], runIds: string[] }`. The API assembles a JSON manifest and returns a download URL or inline blob.
4. **API route** `api/trainer/package.ts` — accepts the manifest request, queries the selected profiles from the embodiment registry, the selected runs from `training_runs`, and returns a JSON package manifest following the format in `artifacts/embodiment-collaborator-package-v5.zip` (use that as the structural reference).
5. **Add "Package builder" link** to `client/src/features/agent-trainer/AgentTrainerPage.tsx` in the top nav strip.

**Tests to run:**
```bash
npm exec vitest run api/__tests__/trainer-run-events-route.test.ts
npm exec tsc --noEmit
npm run build
```

***

## Slice 11 — MusicalDNA Spotify Connect Verification

**Spec source:** CurrentState MusicalDNA env normalization slice

**Goal:** Verify and repair the Spotify OAuth connect flow so it works against the live Vercel deployment.

**What to do:**

1. Open `client/src/lib/spotify.ts`. Confirm it reads `import.meta.env.VITE_SPOTIFY_CLIENT_ID` and `import.meta.env.VITE_SPOTIFY_REDIRECT_URI` — no fallbacks to old names.
2. Open `vite.config.ts`. Confirm the bridge from repo env files into the Vite build is still present.
3. Open `client/src/pages/MusicalDNAPage.tsx` (or equivalent). Confirm the connect button calls the Spotify OAuth flow with the correct redirect URI pointing to the Vercel production domain `https://gestaltview-v2-dig.vercel.app`.
4. If the redirect URI in the client does not match what is registered in the Spotify developer dashboard (check `VITE_SPOTIFY_REDIRECT_URI` in `.env.vercel`), add a clear inline warning message on the MusicalDNA page: *"Spotify connect requires the redirect URI to be registered in your Spotify app dashboard."* This is a developer-only warning, shown only when `import.meta.env.DEV === true`.
5. Add a smoke test: `client/src/tests/musicaldna-spotify.test.ts` — assert that `buildSpotifyAuthUrl()` produces a URL containing the expected client ID and redirect URI from env.

**Tests to run:**
```bash
npm exec vitest run client/src/tests/musicaldna-spotify.test.ts
npm exec tsc --noEmit
```

***

## Slice 12 — Vite Bundle Performance Pass

**Spec source:** Pre-existing warnings in every build output, CurrentState notes

**Goal:** Resolve the large-chunk and font-resolution warnings so production builds are clean.

**What to do:**

1. Open `vite.config.ts`. Add a `build.rollupOptions.output.manualChunks` configuration that splits:
   - `babylonjs` (if still in the dep graph after the earlier removal) into its own chunk
   - `@supabase/*` into `vendor-supabase`
   - React + ReactDOM into `vendor-react`
   - All `/client/src/features/agent-trainer/` into `feature-trainer`
   - All `/client/src/pages/` that are not in the main four rooms into `pages-secondary`
2. **Font resolution**: Check `client/src/index.css` and any `@font-face` declarations. Replace any `url('../fonts/...')` relative paths that do not resolve at build time with either Google Fonts CDN imports or local files confirmed to exist in `public/fonts/`.
3. Run `npm run build` and confirm zero chunk-size warnings (Vite default threshold is 500 kB). If a chunk still exceeds threshold after splitting, add it to the `manualChunks` map.

**Tests to run:**
```bash
npm run build 2>&1 | grep -E 'warn|error'
```

The only acceptable output from that grep is zero lines, or only the pre-existing `BabylonAtmosphere` reduced-motion warning if that canvas is still active.

***

## Slice 13 — Remaining Persona Adapter Migration

**Spec source:** CurrentState embodiment realignment slice ("next slice: decide whether older persona-facing surfaces should migrate")

**Goal:** Migrate remaining hard-coded persona references to the embodiment-backed adapter so the system speaks with one identity model everywhere.

**What to do:**

1. Run: `grep -r "personas.ts" client/src --include="*.tsx" --include="*.ts" -l`
2. For each file that still imports from `client/src/data/personas.ts` directly (rather than through the embodiment adapter): replace the import with `getAllEmbodimentProfiles()` from `shared/embodiment/generated.ts` and update the consuming logic to use the profile's `name`, `archetype`, `auraColor` (or derive it from `hue`), and `capabilities` fields.
3. Once no file imports the raw persona table directly, add a deprecation comment to `client/src/data/personas.ts` and confirm it is only re-exported as a compatibility shim.
4. Confirm `npm exec tsc --noEmit` passes with zero new errors after the migration.

**Tests to run:**
```bash
npm exec vitest run client/src/tests/personas.test.ts
npm exec vitest run client/src/tests/embodiment-runtime.test.ts
npm exec tsc --noEmit
```

***

## Slice 14 — `docs/CurrentState.md` Canonical Refresh

This is a **documentation-only slice** that must be done **after** all other slices above are merged.

**What to do:**

1. Archive the existing CurrentState body by moving the current content into `docs/wiki/history/CurrentState-archive-2026-05-26.md`.
2. Write a fresh `docs/CurrentState.md` top section that accurately reflects the post-implementation state: what is fully live, what each room does, what each API route covers, and what remains as deferred work.
3. Regenerate the manifest and context pack:
   ```bash
   python3 scripts/generate_repo_manifest.py
   python3 skills/gestaltview-generate-wiki/scripts/collect_context.py \
     --repo-path . --max-depth 10 \
     --output docs/wiki/_context/context_pack.json
   ```
4. Run `npm run continuity:check` and confirm zero failures.

***

## Cross-Slice Rules

These constraints apply to every slice above without exception.

**Never break existing seams:**
- `localStorage` prefixed keys (`gv:*`) must remain readable
- `CustomEvent`-based room messaging must remain functional
- The `wouter` router must remain the only routing library
- `callBillyApi()` must remain the fallback for any new AI routing path

**Preserve test baselines:** Every slice must leave the full vitest suite in at least as good a state as it found it. If a slice breaks a pre-existing test, fix the test before marking the slice complete.

**Supabase write boundary:** Server-side routes may use `service_role`. Client-side Supabase access must stay within `anon` key + RLS. Never expose `service_role` to the browser.

**Keith-only surfaces:** Any admin or debug UI (room-state badges, heartbeat badge, workbook dashboard) must use the same `is_admin` or `DEV` guard already established in `RoomStateBadge.tsx`. Never show these to non-founder users in production.

**Validation commands to run at the very end of all slices:**
```bash
npm run validate:embodiment
npm run continuity:check
npm run build
git diff --check
```

***

**Checked:**
- GitHub MCP: `DigitalConsciousness/gestaltview-v2.0` — `docs/CurrentState.md`, `docs/DirectoryMapAndWorkflow.md`, `specs/` tree — all read live
- Supabase MCP: Schema state inferred from migration history in CurrentState (not queried directly for this spec)
- Vercel MCP: Not queried
- Attached Space files: Used for doctrine and project anchors

***

**Checked:**
- **GitHub MCP:** `specs/root/codex-dynamic-inner-world-page-spec.md` (SHA `ab9a942`) and `specs/root/spec-dynamic-inner-world-trainer-remodel.md` (SHA `6bb5a6e`) — both read live from `DigitalConsciousness/gestaltview-v2.0` 

***

# Dynamic Inner World — Codex Repair & Museum Rebuild Spec

**Priority:** HIGH — room is broken and under-spec'd 
**Scope:** Two interleaved specs unified into a single ordered implementation plan.

***

## What the Specs Say Is Wrong

The `codex-dynamic-inner-world-page-spec.md` identifies four concrete structural problems in the current `DynamicInnerWorldPage.tsx` right now :

1. **Race condition** — two `useEffect` hooks writing and reading `selectedCaptureId` can conflict, causing flickering or lost selection state on load.
2. **Redundant UI** — the bottom selected-capture summary card duplicates what `InnerWorldInspector` already shows, adding visual noise.
3. **Dead stat tiles** — the Captures / Blueprints / Surfaces tiles have no animation on value change, which feels broken even when the data is correct.
4. **Missing Recap feature** — `generateRecap` does not exist anywhere in the repo. No function, no API endpoint, no UI. The spec confirms this explicitly.

The `spec-dynamic-inner-world-trainer-remodel.md` goes further: it specifies that the entire six-panel surface model should be replaced with a **Museum of You** — a persisted, evidence-backed identity exhibit hall with thematic rooms, curator DI integration, proposals workflow, and rich exhibit types (Memory Capsules, Skill Trees, Personality Panels, PLK maps) . This is the deeper architectural vision the current broken page is supposed to grow into.

***

## Implementation Plan — Ordered Slices

### Slice DIW-1 — Immediate Structural Repairs (do this first, unblocks the room)

These are surgical fixes to `client/src/pages/DynamicInnerWorldPage.tsx` only. No new files, no schema changes.

**Fix 1 — Collapse the `selectedCaptureId` race:** Replace the two competing `useEffect` hooks with the single controlled version from the spec :

```tsx
useEffect(() => {
  if (selectedCaptureId) {
    writeStoredString(SELECTED_STORAGE_KEY, selectedCaptureId);
  } else if (selectedCapture) {
    setSelectedCaptureId(selectedCapture.id);
    writeStoredString(SELECTED_STORAGE_KEY, selectedCapture.id);
  }
}, [selectedCapture, selectedCaptureId]);
```

**Fix 2 — Remove the redundant selected-capture card:** Delete the bottom `motion.div` block that renders `selectedCapture.title` and `selectedCapture.metadata.context`. The `InnerWorldInspector` already handles this. Leave the space empty.

**Fix 3 — Animate stat tiles:** Wrap the value `<p>` in each `Stat` component with a `motion.span` keyed on the value, using `initial={{ opacity: 0, y: -4 }}` → `animate={{ opacity: 1, y: 0 }}` with `duration: 0.25` .

**Fix 4 — Replace the page header:** The current title is a description string masquerading as a heading. Replace with the exact markup from the spec :

```tsx
<p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#BF00FF]">
  Dynamic Inner World
</p>
<h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
  Six surfaces. One artifact always in view.
</h1>
<p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">
  Surface selection persists between sessions. 2D flattens for scanning,
  3D keeps the spatial feel.
</p>
```

**Validation after DIW-1:**
```bash
npm exec vitest run client/src/tests/room-state.test.ts
npm exec tsc --noEmit
git diff --check
```

***

### Slice DIW-2 — Generate Recap Feature (net-new, additive)

**Files touched:** `client/src/pages/DynamicInnerWorldPage.tsx`, `client/src/components/Scaffold.tsx` (one additive export only).

**Step 1 — Add `buildRecapPrompt` to `Scaffold.tsx`.** This is additive only — do not change any existing Scaffold functions :

```ts
export function buildRecapPrompt(
  captures: InnerWorldCapture[],
  surfaceLabel: string
): string {
  const lines = captures.map((c, i) =>
    `[${i + 1}] ${c.title}\n${c.text ?? c.metadata.context ?? "(no content)"}`
  );
  return [
    `You are synthesizing a brief recap of the following captures from the "${surfaceLabel}" surface of the Dynamic Inner World.`,
    `Write 2–4 sentences. Be specific, grounded, and preserve nuance. Do not invent details not present in the captures.`,
    `Captures:\n${lines.join("\n\n")}`,
  ].join("\n\n");
}
```

**Step 2 — Add `RecapPanel` component inline in `DynamicInnerWorldPage.tsx`.** Mount it between `InnerWorldInspector` and `ArtifactPreview` :

```tsx
<RecapPanel captures={captures} selectedSurface={selectedSurface} />
```

The full `RecapPanel` implementation is specified verbatim in `specs/root/codex-dynamic-inner-world-page-spec.md` — Codex should read that file directly and copy the component. Key behaviors:

- State machine: `idle → loading → done | error`
- Resets on `selectedSurface` change via `useEffect`
- Tries `VITE_GEMINI_API_KEY` first, falls back to `VITE_OPENAI_API_KEY`
- **If both are absent**, surfaces a specific error: `"No LLM API key found. Add VITE_GEMINI_API_KEY or VITE_OPENAI_API_KEY to your environment."` — this check must happen before the `if (geminiKey)` branch 
- Copy to clipboard and download as `.md` buttons on done state
- Regenerate button resets to idle

**No new packages. No new routes. No Supabase migration.** 

**Validation after DIW-2:**
```bash
npm exec vitest run client/src/tests/room-state.test.ts
npm exec tsc --noEmit
npm run build
```

***

### Slice DIW-3 — Portrait Persistence Schema

Before building the Museum UI, the data model must exist. This is a Supabase migration.

**New tables** :

```sql
-- Portrait snapshots: persisted synthesis portrait per user
CREATE TABLE portrait_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portrait_html   TEXT,
  scope_label     TEXT,
  scope_params    JSONB DEFAULT '{}',
  scaffold_hash   TEXT,
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  is_current      BOOLEAN DEFAULT FALSE,
  source          TEXT CHECK (source IN ('auto', 'manual', 'scoped'))
);

-- Museum rooms: thematic areas within the museum
CREATE TABLE museum_rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0
);

-- Museum exhibits: the individual artifacts within rooms
CREATE TABLE museum_exhibits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id          UUID REFERENCES museum_rooms(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  type             TEXT CHECK (type IN ('memory','skill','personality','project','plk','proposal')),
  summary          TEXT,
  html_body        TEXT,
  metadata         JSONB DEFAULT '{}',
  evidence_node_ids TEXT[],
  position_x       FLOAT DEFAULT 0,
  position_y       FLOAT DEFAULT 0,
  position_z       FLOAT DEFAULT 0,
  approved         BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Museum proposals: DI-suggested exhibits awaiting user approval
CREATE TABLE museum_proposals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exhibit_data        JSONB NOT NULL,
  proposed_by_agent   TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  status              TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected'))
);
```

**RLS rules:** All four tables must have `user_id = auth.uid()` policies for SELECT, INSERT, UPDATE, DELETE. No cross-user access. No service-role exposure to the browser .

**Run:**
```bash
npm exec supabase db push  # or apply via Supabase MCP apply_migration
npm exec supabase gen types typescript --local > shared/types/supabase.ts
```

***

### Slice DIW-4 — Museum Page Foundation (Phase 1: replace the broken page, introduce rooms)

This is the architectural handoff from the six-panel model to the Museum of You. The spec calls this **developer mode first** — keep the old inner world accessible via a toggle while the museum is validated .

**Files to create:**

| File | Purpose |
|---|---|
| `client/src/pages/MuseumPage.tsx` | New page — museum layout, room nav, inspector |
| `client/src/components/MuseumRoom.tsx` | Room renderer — 2D/3D representation, drag-and-drop positions |
| `client/src/components/ExhibitCard.tsx` | Individual exhibit tile — hover preview, click-to-inspect |
| `client/src/components/ExhibitInspector.tsx` | Overlay panel — full exhibit detail, evidence links, actions |
| `client/src/components/MuseumNavigator.tsx` | Radial or carousel room selector, 2D/3D mode toggle |
| `client/src/components/ProposalPanel.tsx` | Pending DI proposals — accept/edit/reject |
| `client/src/hooks/useMuseum.ts` | Fetch rooms + exhibits, handle positions, accept proposals, generate recaps |
| `client/src/prompts/buildMuseumRecapPrompt.ts` | LLM prompt builder for per-room recaps (similar to `buildRecapPrompt`) |

**Route change in `client/src/App.tsx`:** Add `/museum` pointing to `MuseumPage`. Keep `/inner-world` pointing to `DynamicInnerWorldPage` with a visible "Switch to Museum (beta)" toggle in that page's header. Do not remove the old route until Phase 2 is validated .

**`useMuseum.ts` contract:**
```ts
export function useMuseum() {
  // Fetches museum_rooms for current user (ordered by order_index)
  // Fetches museum_exhibits for selected room
  // Exposes: rooms, exhibits, selectedRoom, setSelectedRoom,
  //          acceptProposal(id), rejectProposal(id),
  //          moveExhibit(id, {x, y, z}),
  //          generateRecap(roomId): Promise<string>
}
```

**Curator Recap per room:** Each `MuseumRoom` has a "Curator Recap" button. It calls `buildMuseumRecapPrompt(room, exhibits)` and routes through the same Gemini → OpenAI fallback chain used in `RecapPanel`. Anti-sycophancy prompt must be respected — do not write flattering summaries. Display result inline, save only on explicit user action .

**Evidence-first rule:** Every `ExhibitCard` must display its `evidence_node_ids` count. If an exhibit has zero evidence nodes, it renders with a `⚠ No evidence` badge. Digital intelligences may not create exhibits with empty evidence arrays .

**Validation after DIW-4:**
```bash
npm exec vitest run client/src/tests/room-state.test.ts
npm exec tsc --noEmit
npm run build
```

***

### Slice DIW-5 — Exhibit Types & Migration of Existing Artifacts

**Backward compatibility:** Existing `inner_world_artifacts` must migrate to `museum_exhibits` in a `Legacy Wall` default room .

**Migration script** (`scripts/migrate-inner-world-to-museum.ts`):

```ts
// For each user with inner_world_artifacts:
// 1. Create a museum_rooms row: { name: 'Legacy Wall', order_index: 999 }
// 2. For each artifact: create a museum_exhibits row mapping:
//    - title: artifact.title
//    - type: 'memory' (default for legacy)
//    - summary: artifact.content ?? artifact.metadata.context
//    - position_x/y/z: artifact.position_x ?? 0 (preserve existing positions)
//    - approved: true (they were already visible)
//    - evidence_node_ids: [artifact.id] (self-reference as evidence)
```

Run once, idempotent (check for existing `Legacy Wall` room before creating).

**Exhibit type rendering rules** — `ExhibitCard` should apply distinct visual treatment by type :

| Type | Visual Treatment |
|---|---|
| `memory` | Capsule shape, warm amber glow |
| `skill` | Tree/branch icon, cool blue tint |
| `personality` | Wave/cadence icon, violet tint |
| `project` | Grid/blueprint icon, white border |
| `plk` | Dictionary icon, green tint |
| `proposal` | Dashed border, amber badge "Awaiting approval" |

***

### Slice DIW-6 — Agent Trainer Remodel (from `spec-dynamic-inner-world-trainer-remodel.md`)

This is a separate concern bundled in the same spec file. The trainer is also broken on the free Supabase tier because it makes live DB calls that fail constantly .

**Core change: remove all DB calls from the trainer control plane.** Replace with a local source list backed by `localForage`.

**Specific changes:**

Remove all GET/POST requests to `/api/trainer/study-sources` and any other Supabase-bound calls from the control plane. Replace with a `LocalSourceList` component that reads from `localForage` under the key `gv:trainer:sources`. Sources persist across reloads. The DB path only re-activates if a paid-tier config flag `usePersistenceAdapter = true` is explicitly set .

**Manual study packet upload:** At the "Collect Sources" stage, render a drag-and-drop file picker. Each uploaded file shows name, size, type, with rename/reorder/remove controls. A "Bundle as study packet" button exports a ZIP with a manifest JSON. The manifest structure:

```json
{
  "title": "",
  "description": "",
  "date": "",
  "tags": [],
  "files": [{ "name": "", "size": 0, "type": "" }]
}
```

**Wizard-style flow:** Replace the current cluttered operator flow with four clearly labelled stages: **Collect Sources → Compile Profile → Synthesize & Layer → Export & Deploy.** Each stage shows only the controls relevant to it. Dev-only diagnostics (raw JSON, queue statuses, health metrics) move to a collapsed "Developer Tools" panel, visible only to admin accounts .

**Degraded-mode banner (actionable):** When remote services are cooling down after repeated failures, show an amber banner with:
- Human-readable explanation ("Remote services paused after repeated failures. Using your manual packet instead.")
- A "How to prepare a manual study packet" inline checklist
- "Upgrade DB plan" CTA visible to founder/admin only

**Embodiment profile schema extension:** Add these optional fields to the profile schema in `shared/embodiment/types.ts` :

```ts
autobiography?:  string;
memories?:       Array<{ title: string; description: string; importance: 'low'|'medium'|'high'; source?: string }>;
quirks?:         string[];
personality?:    string[];
cadence?:        'short_and_punchy' | 'slow_and_reflective' | 'adaptive';
plk?: {
  vocabulary:     string[];
  metaphors:      string[];
  expressions:    string[];
  approvedSynonyms: Record<string, string[]>;
  bannedPhrases:  string[];
  styleGuidelines: string;
};
woundLayer?:     string;
relationalStances?: string[];
```

All new fields are optional with `?`. Existing 24 profiles continue to compile without changes .

**Export `plk.yml`:** When the trainer exports a profile bundle, include a separate `plk.yml` file alongside the JSON. Generated from `profile.plk` using `js-yaml` (already in the dep graph or add it) .

***

## Cross-Slice Constraints

**Never break these seams across all DIW slices:**
- `Scaffold.tsx` existing exports — only additive changes allowed
- `wouter` routing — do not add React Router
- `localStorage` `gv:*` keys — remain readable after migration
- `InnerWorldRoom`, `InnerWorldInspector`, `ArtifactPreview` — do not touch these in any DIW slice 

**Evidence-first is an absolute rule:** No DI (Billy, curator, or any agent) may create a museum exhibit or portrait snapshot without at least one valid `evidence_node_id` pointing to a real scaffold node or artifact .

**Phased rollout order:** DIW-1 → DIW-2 → DIW-3 → DIW-4 → DIW-5 → DIW-6. Do not start DIW-4 until DIW-3 migrations are confirmed applied and TypeScript types are regenerated.

**Final validation after all slices:**
```bash
npm run validate:embodiment
npm run continuity:check
npm run build
git diff --check
```
