# GestaltView v2 — Gap Remediation SPEC
**Version:** 1.1-Final | **Audit Base:** GAP_AUDIT_2026-06-12 | **Status:** IMPLEMENTATION-READY
**Answers incorporated:** 2026-06-12 (Keith's answered questions file)

---

## Executive Summary

This specification translates every finding from the June 2026 UI/UX Gap Audit into developer-ready implementation contracts, updated with Keith's explicit product decisions. Five open questions from v1.0 are now resolved:

1. **Musical DNA** is not a form or a Billy chat interview — it is a **dynamic ambient capture layer** that infers music preferences from journal entries, session recaps, file uploads, Creation Corner artifacts, and personality/character profiles automatically, with no interview UI of any kind.
2. **Free-tier demo behavior** is to be specced now and deployed in this release. `DemoGate.tsx` is reactivated immediately.
3. **Codex** is an internal provenance/gravity-protocol tool, not a user-facing product surface. It does not need consumer-grade UI fidelity.
4. **Transcriptory** is targeted for full deployment in this release, not held behind a flag.
5. **Embodiment Studio and Agent Council** are targeted for v2 with improvements planned for v3 — not deferred.

The audit identified one **FAIL** (Resume Rockstar ATS pipeline), three **PARTIAL** flows (auth → Sanctuary → Billy; Blackboard recap orbs; Musical DNA), and two **PASS** flows (Creation Corner synthesis; Billy metadata chips). All FAILs and PARTIALs must be green before the next investor or Indiegogo backer demo.

---

## Decision Register

These decisions are locked. Do not re-open them in implementation tickets without Keith's explicit approval.

| # | Question | Decision |
|---|---|---|
| D-1 | Musical DNA: chat vs. form? | **Neither.** Ambient inference only — no interview, no form. See Work Stream 1.3. |
| D-2 | Free-tier artifact demo: when? | **Now.** Spec and deploy in this release. |
| D-3 | Codex: user-facing or internal? | **Internal tool only.** Gravity protocol layer. Lower UI fidelity. |
| D-4 | Transcriptory: hold or ship? | **Ship in this release.** Full deployment, not a flag. |
| D-5 | Embodiment Studio / Agent Council: v2 or v3? | **v2 ship with v3 improvements.** Not deferred. |

---

## Work Stream 1 — Critical Flow Remediation

Nothing in other work streams ships before these are green.

### 1.1 Resume Rockstar — Score/Enhance Pipeline (FLOW-4, FAIL)

**Problem:** `client/src/modules/Resume_Rockstar/SectionEditor` has no Score or Enhance controls. POST endpoints `/api/modules/resume-rockstar/analyze` and `/api/modules/resume-rockstar/enhance` exist with passing unit tests but no client caller invokes them. `tests/e2e/resume-rockstar.spec.ts` currently exposes this gap.

**Scope of change:**
- `client/src/modules/Resume_Rockstar/components/SectionEditor.tsx` — add **Score** and **Enhance** buttons to the toolbar.
- On **Score**: POST to `/api/modules/resume-rockstar/analyze`; render ATS grade badge (A/B/C/D) and PLK voice label inline above section text.
- On **Enhance**: POST to `/api/modules/resume-rockstar/enhance`; stream/replace section content in-place; preserve metaphor fidelity (unit test `resumeRockstar.test.ts` covers the contract).
- Add loading/skeleton state during both requests. Display inline error message on failure — no toast.
- On success, show `atsDelta` (e.g., `+12 pts`) and `plkDelta` as animated number increments next to the grade badge.

**Acceptance criteria:**
- [ ] `tests/e2e/resume-rockstar.spec.ts` passes end-to-end in CI against mock API.
- [ ] ATS grade badge and PLK label render after Score.
- [ ] Enhanced content replaces raw section text with no JSON bleed-through.
- [ ] `atsDelta` and `plkDelta` animate on mount.
- [ ] Loading spinner shown during both API calls; inline error shown on 4xx/5xx.

---

### 1.2 Blackboard Recap Orbs (FLOW-2, PARTIAL)

**Problem:** `SessionRecapGenerator` is an import-graph orphan. Nothing in Blackboard Room or Dynamic Inner World imports it. `/api/sessionRecap` is unreachable from any product surface. FLOW-2 (Blackboard → capture → recap orbs) cannot complete.

**Scope of change:**
- Inspect `client/src/components/SessionRecapGenerator.tsx`: confirm self-contained and functional. If broken, raise a sub-ticket before proceeding.
- Import and mount `SessionRecapGenerator` inside `client/src/pages/BlackboardRoomPage.tsx` — rendered as a collapsible bottom panel or dedicated "Recap" tab within the room's tab bar.
- Wire panel trigger to the existing Blackboard capture lifecycle: Recap panel becomes available after fragments are captured.
- Forward resulting recap orbs to `DynamicInnerWorldPage` via `/api/inner-world/artifacts` so they persist in the user's Inner World.
- Import and wire `InnerWorldArtifactGallery.tsx`, `InnerWorldInspector.tsx`, and `InnerWorldRoom.tsx` into `DynamicInnerWorldPage.tsx` to display orbs (see Work Stream 4.1).

**Acceptance criteria:**
- [ ] `SessionRecapGenerator` is reachable from Blackboard Room without direct URL navigation.
- [ ] Submitting a capture payload to `/api/sessionRecap` returns recap content that renders as orbs.
- [ ] Orbs appear in Dynamic Inner World on next load via `/api/inner-world/artifacts`.
- [ ] `tests/e2e/auth.spec.ts` Blackboard smoke test still passes.

---

### 1.3 Musical DNA — Ambient Inference Rewrite (FLOW-5, PARTIAL → REDESIGN)

**Decision D-1 applied. The interview overlay and form are removed. Musical DNA is an ambient capture layer, not an interaction.**

**Product contract (from Keith):**
Musical DNA is populated through inference across the following signals, with user permission where noted:
- Journal entries that link to music (in-the-moment or nostalgic stress reduction)
- Session recaps (Blackboard/Sanctuary)
- File uploads
- Creation Corner artifacts
- Personality and character profile data
- Resume, skills, hobbies, and interests
- Learning modules integration

**Scope of change:**
- **Remove** the Musical DNA interview overlay entirely from `client/src/pages/MusicalDNAPage.tsx`.
- **Implement** an ambient inference pipeline: a server-side job (or Billy-triggered analysis) that aggregates the signals above and calls `/api/actions/musical-dna/analyze` with an inferred payload rather than a user-submitted form payload.
- **MusicalDNAPage.tsx** becomes a **display surface only**: show the user's evolving Musical DNA as a playlist/mood map, with a history of how each track or cluster was inferred (provenance labels: "from your journal entry on [date]", "inferred from your session recap", etc.).
- Journal entry capture should expose a music-link affordance — a subtle "🎵 link music to this moment" prompt — that adds a track to the inference queue. This is not a form; it is an optional micro-gesture.
- Permission prompt: on first visit to Musical DNA, ask the user a single yes/no: "Allow GestaltView to infer your musical identity from your sessions and journals?" Store consent in user preferences.

**Acceptance criteria:**
- [ ] Interview overlay is removed. No form or structured question flow exists in Musical DNA.
- [ ] `/api/actions/musical-dna/analyze` is called by the ambient inference pipeline, not by a user-submitted form.
- [ ] MusicalDNAPage renders a playlist/mood map populated from inferred tracks.
- [ ] Each displayed track carries a provenance label.
- [ ] Permission consent is captured and stored before any inference runs.
- [ ] `tests/e2e/musical-dna.spec.ts` is updated to test the display surface and inference trigger, not the interview overlay.

**Blocked until:** Session recap pipeline (Spec 1.2) is operational, because session recaps are a primary inference signal.

---

### 1.4 Auth → Sanctuary → Billy Chain (FLOW-1, PARTIAL)

**Problem:** Unauthenticated demo state can silently fail if `VITE_SUPABASE_URL` or `/api/session/state` returns an unexpected response. `/signup` is currently a STUB.

**Scope of change:**
- `client/src/pages/SanctuaryPage.tsx` — add graceful degraded state: if auth is missing, show a "Try as Guest" CTA that bypasses auth and loads a read-only Sanctuary experience with a single demo Billy exchange (hard-coded demo persona). This is the free-tier entry point; align with Spec 1.5 (DemoGate).
- `client/src/contexts/AuthContext.tsx` — a failed `/api/session/state` call must not block rendering of Sanctuary or Home; log the error and fall through to unauthenticated state.
- `client/src/pages/Signup.tsx` — wire email/password fields to `supabaseAuth`. Redirect to `/welcome` on success; display inline error on failure. Google OAuth button if `VITE_GOOGLE_CLIENT_ID` is set.

**Acceptance criteria:**
- [ ] Unauthenticated user can reach Sanctuary and see a demo Billy response without logging in.
- [ ] Failed `/api/session/state` does not produce a blank or broken page.
- [ ] `/signup` submits to Supabase auth and redirects to `/welcome` on success.
- [ ] `tests/e2e/auth.spec.ts` login/callback test still passes.

---

### 1.5 Free-Tier Demo Behavior — DemoGate Reactivation (NEW, from Decision D-2)

**Context:** `DemoGate.tsx` is currently archived. Keith has confirmed the free-tier artifact pipeline and demo behavior spec is ready to build now, targeting `DynamicInnerWorldPage` as the primary demo surface. `RateLimiterBootstrap_SPEC.md` for rate limit of free account users.

**Product contract:**
- Free (unauthenticated or unsubscribed) users can generate **one artifact per session**.
- The artifact is displayed in Dynamic Inner World so the user experiences persistence and spatial presence.
- At session end (or on navigation away), the artifact is **not saved** — the loss event is the conversion trigger.
- A "Save this to your world — unlock GestaltView" CTA appears when the session artifact would be lost.
- Authenticated/subscribed users bypass DemoGate entirely.

**Scope of change:**
- **Reactivate** `client/src/components/DemoGate.tsx` from `_archive/`. Audit its current state before making changes.
- Wrap artifact generation entry points in `DynamicInnerWorldPage.tsx` with DemoGate logic:
  - Check auth state from `AuthContext`.
  - If unauthenticated: allow one artifact generation; set a session flag (`demoArtifactGenerated = true`) in memory (no localStorage — sandbox blocked).
  - On second generation attempt: show DemoGate modal with "Save your world" CTA pointing to `/signup`.
  - On navigation away with a demo artifact present: show a "Your creation will disappear" dismissal prompt with signup CTA.
- **Cap logic:** The cap is one artifact per session, enforced client-side by the session flag. Server-side enforcement (rate limiting by IP or session token) is a follow-up ticket to prevent circumvention.
- Wire DemoGate CTA to `/signup` (Spec 1.4).

**Acceptance criteria:**
- [ ] Unauthenticated user can generate exactly one artifact in Dynamic Inner World.
- [ ] Second generation attempt shows DemoGate modal, not an error.
- [ ] Navigation away from a demo artifact shows a "Your creation will disappear" prompt.
- [ ] Authenticated users see no gate and have no artifact cap.
- [ ] DemoGate modal includes a working CTA to `/signup`.

---

## Work Stream 2 — Stub Page Implementation

Ordered by demo-impact. Pages that appear in primary navigation must be demo-complete before any public-facing event.

### 2.1 `/app` Dashboard (High priority)

**File:** `client/src/pages/DashboardPage.tsx` — STUB. APIs `/api/session/dashboard` and `/api/session/memory` are wired but UI renders nothing meaningful.

**Required:** Greeting header with user display name from session. Three KPI tiles (sessions this week, artifacts created, active modules). "Recent Activity" feed from session memory. Skeleton loaders during fetch. Empty state for new users.

**Acceptance criteria:** Dashboard renders real session data for authenticated user. Empty state for new users. Skeleton during load.

---

### 2.2 `/profile` (Medium priority)

**File:** `client/src/pages/ProfilePage.tsx` — STUB. Both `/api/profile/personality` and `/api/profile/preferences` are wired.

**Required:** Personality traits from `/api/profile/personality` as a visual trait grid. Preferences from `/api/profile/preferences` as an editable form (toggle/select inputs). Save button POSTs to preferences endpoint. Avatar upload is out of scope for this sprint. Add `TODO(spec: 3.8)` comment for profile ingest import flow.

**Acceptance criteria:** Personality traits display. Preferences form is editable and saves. Error state shown on save failure.

---

### 2.3 `/login` and `/signup` (High priority — blocks all auth flows)

**Files:** `client/src/pages/SignIn.tsx`, `client/src/pages/Signup.tsx` — both STUB.

**Required (Login):** Email + password fields wired to `supabaseAuth`. Google OAuth button if `VITE_GOOGLE_CLIENT_ID` set. Redirect to `/welcome` on success. Inline error on failure. `/auth/consent` renders same component with `mode=consent` prop.

**Required (Signup):** See Spec 1.4.

**Acceptance criteria:** User can log in with email/password. Invalid credentials show inline error. Auth callback `/auth/callback` still functions.

---

### 2.4 `/transcriptory` (High priority — ship in this release, per Decision D-4)

**File:** `client/src/pages/TranscriptoryPage.tsx` — STUB. Full deployment target; do not hold behind a flag.

**Required:** Wire capture and session endpoints from `/api/transcriptory/**`. Implement capture UI for recording/uploading transcripts. Session list view with search and filter. Detail view for a single transcript session. Export affordance wired to transcript export endpoint.

**Acceptance criteria:** User can create, view, and export a transcript session. API endpoints are wired and functional. Page is reachable from primary navigation.

---

### 2.5 `/embodiment-studio` (High priority — v2 ship target, per Decision D-5)

**File:** `client/src/pages/EmbodimentStudioPage.tsx` — STUB. Note: `/api/embodiment/list` and `/api/embodiment/upsert` are already wired from this file.

**Required:** Display embodiment list from `/api/embodiment/list`. Allow creation and editing of an embodiment via `/api/embodiment/upsert`. Integrate `useRouteEmbodiment` hook for route-scoped embodiment state. Connect to `SanctuaryStudio.tsx` and `SanctuaryWillowBabylon.tsx` (both in `_archive/` — reactivate as part of this spec).

**Acceptance criteria:** User can view, create, and edit an embodiment. Embodiment is reflected in the active route via `useRouteEmbodiment`. `SanctuaryStudio` and `SanctuaryWillowBabylon` are reactivated and integrated.

---

### 2.6 `/agent-council` and `/module/agent-council` (High priority — v2 ship target, per Decision D-5)

**File:** `client/src/pages/AgentCouncilPage.tsx` — STUB.

**Required:** Define the Agent Council surface before implementation begins. Raise a focused sub-spec for this page's interaction model (council composition, deliberation UI, output surface). Do not implement from guesswork. This spec item is a **pre-implementation design gate** — implementation cannot start without a sub-spec from Keith.

**Acceptance criteria for this sprint:** Sub-spec document drafted and approved by Keith. Page moves out of stub status only after sub-spec approval.

---

### 2.7 `/agent-trainer/pricing` (Medium priority — revenue surface)

**File:** `client/src/pages/AgentTrainerPricing.tsx` — STUB.

**Required:** Two pricing tier cards (Standard, Enterprise). Feature comparison table. Stripe checkout redirect on CTA click via `/api/stripe/agent-trainer-checkout`.

---

### 2.8 `/agent-trainer/orders/:id` (Medium priority)

**File:** `client/src/pages/GATEOrderStatusPage.tsx` — STUB.

**Required:** Fetch order status from `/api/gate/order` using `:id` param. Display order state (pending/processing/complete), line items, and download button when complete. Wire download to `/api/gate/order-download` and redeem to `/api/gate/order-redeem`.

---

### 2.9 `/contact` (Low priority — legal/trust signal)

**File:** `client/src/pages/ContactPage.tsx` — STUB.

**Required:** Name, email, message fields. Submit to server handler or Supabase edge function. Confirmation message on success.

---

### 2.10 `/privacy` and `/terms` (Low priority — legal baseline, required for Stripe payments)

**Files:** `client/src/pages/PrivacyPage.tsx`, `client/src/pages/Terms.tsx` — both STUB.

**Required:** Static markdown-rendered content. Import from `/docs/legal/` if files exist; draft inline otherwise. Must not be empty if accepting Stripe payments.

---

### 2.11 Remaining Low-Priority Stubs — Holding Pages

Convert to consistent "Coming Soon" holding pages with notify/subscribe CTA. Remove from primary navigation until implemented:

- `/digital-intelligence-academy` and `/module/agent-academy`
- `/rapid-prototype` and `/module/rpe`
- `/adaptive-layout`
- `/musical-dna` — stub route only; the ambient inference surface (Spec 1.3) replaces the old page
- `/brain-sparks` and `/brain-sparks-station`
- `/external-scaffold` and `/module/scaffold`

**Holding page spec:** GestaltView nav/footer, product name, single-sentence description, "Notify me" email capture. No blank white screens.

---

## Work Stream 3 — Unwired API Wiring

### 3.1 Resume Rockstar Analyze + Enhance
Covered by Spec 1.1. Do not duplicate.

### 3.2 Musical DNA Ambient Inference Endpoints
Covered by Spec 1.3. `/api/actions/billy/code`, `/api/actions/billy/loom`, and `/api/actions/billy/synthesize` are deferred until the ambient pipeline is operational.

### 3.3 Session Recap via `/api/sessionRecap`
Covered by Spec 1.2. Do not duplicate.

### 3.4 Bucket Drops API

**Endpoints:** `/api/billy-bucket-drop`, `/api/actions/bucket-drops`

**Required:** Audit `client/src/pages/BucketDropsPage.tsx` — determine if drops are currently local-only or persisted via another path. Wire POST to `/api/actions/bucket-drops` on drop creation and GET from `/api/billy-bucket-drop` on page load if not already persisted. Document findings either way.

### 3.5 Transcriptory API
Covered by Spec 2.4. Wire capture and session endpoints as part of Transcriptory page implementation.

### 3.6 GATE Operational Endpoints

**Endpoints:** `/api/gate/build-job-run`, `/api/gate/build-job-regenerate`, `/api/gate/draft-validate`, `/api/gate/order-download`, `/api/gate/order-redeem`, `/api/gate/support-request`

**Required:**
- `GATEPackageBuilderPage.tsx` — add draft-validate call before checkout submission.
- `GATEOrderStatusPage.tsx` — add order-download and order-redeem actions (per Spec 2.8).
- Add minimal contact modal wired to `/api/gate/support-request`.

### 3.7 Trainer Run/Review/Flag/Deploy Endpoints
Intentionally deferred — only relevant when Trainer Control Plane is the subject of a focused sprint. Add `// TODO(spec: 3.7)` comment in `HostedAgentTrainerPage.tsx`.

### 3.8 Profile Ingest
Deferred until Profile page (Spec 2.2) is implemented. Add `TODO(spec: 3.8)` comment in `ProfilePage.tsx`.

### 3.9 Consciousness Reflection Endpoints

**Endpoints:** `/api/actions/chat`, `/api/actions/consciousness/reflect`, `/api/consciousness/[surface]`

**Required:** These are currently unwired. Determine which product surfaces should call these endpoints — likely Sanctuary, Blackboard, and Dynamic Inner World. Wire during the Sprint 2 flow completion pass.

---

## Work Stream 4 — Dead Component Triage

The triage rule: **Reactivate** if needed by current spec. **Archive** (move to `client/src/_archive/` with `ARCHIVE_REASON.md`) if near-term roadmap. **Delete** if no roadmap path.

### 4.1 Reactivate Immediately

| Component | Reactivated by | Action |
|---|---|---|
| `SessionRecapGenerator.tsx` | Spec 1.2 | Import into `BlackboardRoomPage.tsx` |
| `DemoGate.tsx` | Spec 1.5 | Import into `DynamicInnerWorldPage.tsx` |
| `InnerWorldArtifactGallery.tsx` | Spec 1.2 | Import into `DynamicInnerWorldPage.tsx` |
| `InnerWorldInspector.tsx` | Spec 1.2 | Import into `DynamicInnerWorldPage.tsx` |
| `InnerWorldRoom.tsx` | Spec 1.2 | Import into `DynamicInnerWorldPage.tsx` |
| `SanctuaryStudio.tsx` | Spec 2.5 | Import into `EmbodimentStudioPage.tsx` |
| `SanctuaryWillowBabylon.tsx` | Spec 2.5 | Import into `EmbodimentStudioPage.tsx` |
| `ArtifactPreviewer.tsx` | Spec 3.6 / Codex internal | Import into GATE order status or Codex internal view |
| `ArtifactRenderer.tsx` | Spec 3.6 / Codex internal | Same as above |
| `ArtifactExportBar.tsx` | Spec 3.6 | Import into `GATEOrderStatusPage.tsx` |
| `FileUploadDropzone.tsx` | Spec 2.2 | Import into `ProfilePage.tsx` |
| `FilePreviewPane.tsx` | Codex internal (D-3) | Import into internal Codex view |
| `ProvenanceDisclosure.tsx` | Codex internal (D-3) | Import into internal Codex view |
| `UniversalCaptureBar.tsx` | Spec 2.4 (Transcriptory) | Import into `TranscriptoryPage.tsx` |

### 4.2 Archive (Near-Term Roadmap)

Move to `client/src/_archive/` with `ARCHIVE_REASON.md`:

- `OrbGraph.tsx` — Codex/provenance visualization (future sprint)
- `MuseumNavigator.tsx` — Museum route if resurrected (deferred)
- `RecapPanel.tsx` — Alternate recap UI; archive pending Spec 1.2 outcome
- `BillyGlitch.tsx` — UX easter egg; archive until Billy polish sprint
- `BlackboardGenEngineActions.tsx` — Future Blackboard enhancement
- `SubpageQuickNav.tsx` — Pending nav architecture decision
- `LifeTapestry.tsx`, `TheoriesMap.tsx` — Future exhibit surfaces
- `RapidPrototypeEngine.tsx` — For `/rapid-prototype` (future sprint)

### 4.3 Delete (No Roadmap Path)

Run `grep -r "ComponentName" client/src` before deletion to confirm no dynamic import or lazy-load reference exists.

- `ADHDPowerUpStation.tsx` — superseded by `/adhd-powerup` page
- `AddictionRecoveryExhibit.tsx` — superseded by `/addiction-recovery` page
- `AlzheimersLegacyExhibit.tsx` — superseded by `/alzheimers-legacy` page
- `DeadlightsTrackSection.tsx` — no active feature reference
- `WhatThisIs.tsx`, `WhatWasBuilt.tsx`, `TheHuman.tsx`, `TheEvidence.tsx` — superseded by current Home/Demo pages
- `Collaborators.tsx` — no active collaborator surface
- `ExhibitPage.tsx` — superseded by `/exhibits` index
- `LoadingSpinner.tsx` — confirm shadcn/ui replacement exists first
- `ServicesConsulting.tsx` — superseded by `/consulting` page
- `GeminiAwakening.tsx`, `MuseumPage.tsx`, `WhiteboardRoomPage.tsx`, `SymbioCodingPage.tsx`, `AgentAcademyPage.tsx` — orphaned page files with no active route

---

## Work Stream 5 — Routing Hygiene

### 5.1 Remove Duplicate `/brain-sparks-station` Route

Remove one of the two duplicate route entries in `client/src/App.tsx`. Keep the one pointing to `client/src/components/BrainSparksStation.tsx`.

**Acceptance criteria:** `App.tsx` contains exactly one `/brain-sparks-station` route definition.

### 5.2 Resolve `/agent-builder` Route Aliases

Three routes (`/agent_builder`, `/agent-builder`, `/builder`) point to `AgentBuilder.tsx`. Confirm intent. If `/builder` is a legacy path, redirect it to `/agent-builder`. Add a comment in `App.tsx` documenting the canonical path.

### 5.3 Feature Flag Nav Gating (Required before any public-facing event)

Create `client/src/config/featureFlags.ts` if absent. Each flag gates a nav item. Stub routes listed in Spec 2.11 get `flag: false` by default. This is the single source of truth for nav visibility.

```typescript
// client/src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  transcriptory: true,        // Spec 2.4 — ship in this release
  embodimentStudio: true,     // Spec 2.5 — ship in this release
  agentCouncil: false,        // Spec 2.6 — pending sub-spec approval
  digitalIntelligenceAcademy: false,
  rapidPrototype: false,
  adaptiveLayout: false,
  brainSparks: false,
  externalScaffold: false,
} as const;
```

### 5.4 `/signup` and `/login` Redirect Audit

Confirm `/signup` and `/login` redirect to `/welcome` on successful auth with no loop. Verify `/auth/consent/auth/callback` (the nested path) is intentional — if it duplicates `/auth/callback`, consolidate.

---

## Work Stream 6 — Test Coverage Completion

### 6.1 Make All Existing E2E Tests Pass

Current status:
- `tests/e2e/resume-rockstar.spec.ts` — **FAILING** (blocked on Spec 1.1)
- `tests/e2e/musical-dna.spec.ts` — **REQUIRES REWRITE** (interview overlay is removed per Spec 1.3; test must be rebuilt to cover ambient display surface)
- `tests/e2e/auth.spec.ts` — PARTIAL (add `--mock-supabase` mode for CI)
- `tests/e2e/billy-chat.spec.ts` — verify passing in CI
- `tests/e2e/creation-corner.spec.ts` — verify passing in CI

**Required:** After Specs 1.1 and 1.3, all five E2E tests pass against mock API as part of the CI gate.

### 6.2 Add Dashboard E2E Test

After Spec 2.1: `tests/e2e/dashboard.spec.ts`
- Authenticated user sees greeting and KPI tiles.
- New user sees empty state.
- Unauthenticated user is redirected to `/login`.

### 6.3 Add Transcriptory E2E Test

After Spec 2.4: `tests/e2e/transcriptory.spec.ts`
- User can create a transcript session.
- Session appears in session list.
- Export button is present and functional.

### 6.4 Add DemoGate E2E Test

After Spec 1.5: `tests/e2e/demo-gate.spec.ts`
- Unauthenticated user generates one artifact — succeeds.
- Second artifact generation attempt shows DemoGate modal.
- Navigation away with demo artifact shows "Your creation will disappear" prompt.
- Authenticated user bypasses gate entirely.

### 6.5 Playwright Config — CI Environment Variables

Confirm CI pipeline (Vercel preview or GitHub Actions) sets `VITE_API_BASE`, `PLAYWRIGHT_BASE_URL`, and `localhost:5173`. Add `.env.test.example` documenting required test environment variables.

---

## Work Stream 7 — API Consolidation

### 7.1 Collapse Duplicate Resume Endpoints

After Spec 1.1 wires to module paths (`/api/modules/resume-rockstar/*`), deprecate the legacy `/api/resume-rockstar/*` handlers with `// DEPRECATED: use /api/modules/resume-rockstar/*`. Remove in the following sprint.

### 7.2 Collapse Duplicate Symbio/Vibe Endpoints

Module paths (`/api/modules/symbio-coder/*`, `/api/modules/vibe-coder/*`) are canonical. Redirect or delete legacy `/api/symbiocoder/*` and `/api/vibecoder/*` paths. Do not allow both to coexist in production.

### 7.3 Codex Synthesis Route Cleanup

`/api/creation-corner/synthesize` is bypassed by `/api/gen-engine/artifacts`. If fully superseded, delete the handler and all remaining references. If it serves a distinct use case, document it in `docs/CurrentState.md`.

### 7.4 Gen Engine Export Decision

`/api/gen-engine/export` exists but the client uses a local export helper. Decision required before Sprint 4:
- **Option A:** Remove server route if local export is permanent.
- **Option B:** Wire server route for server-side rendering/PDF export and remove local helper.

Document decision in `docs/CurrentState.md`.

---

## Implementation Order — Recommended Sprint Sequence

| Sprint | Items | Exit Criteria |
|---|---|---|
| **Sprint 1** — Demo-critical | 1.1, 1.4, 1.5, 5.3 (feature flags), 2.3 (login/signup), 6.1 (partial) | FLOW-1 and FLOW-4 green; DemoGate live; no dead stubs in nav |
| **Sprint 2** — Flow completion | 1.2, 1.3, 2.1, 2.2, 2.4, 3.9, 6.1 (full), 6.2, 6.3, 6.4 | All critical flows green; Transcriptory live; Dashboard and Profile live |
| **Sprint 3** — v2 surfaces | 2.5, 2.6 (sub-spec gate), 2.7, 2.8, 3.4, 3.5, 3.6, 4.1 (reactivations) | Embodiment Studio and GATE flow demo-complete; Agent Council sub-spec approved |
| **Sprint 4** — Debt clearance | 4.2, 4.3, 5.1, 5.2, 7.1, 7.2, 7.3, 7.4 | No orphaned components; no duplicate routes or endpoints |
| **Sprint 5** — Coverage + legal | 2.9, 2.10, 2.11, 6.5, 3.7, 3.8 | Privacy/Terms live; full CI gate green; all holding pages confirmed |

---

## Remaining Open Item

**Agent Council sub-spec (Spec 2.6):** Before Sprint 3 begins, a focused sub-spec is needed from Keith covering:
- Council composition (which agents, how selected)
- Deliberation UI (how the council surfaces outputs to the user)
- Output surface (where council results appear — Dynamic Inner World, Dashboard, dedicated page)

This is the only item that cannot proceed without a design conversation first.

