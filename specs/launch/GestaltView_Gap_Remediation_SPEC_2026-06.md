# GestaltView v2 — Gap Remediation SPEC
**Version:** 1.0 | **Audit Base:** GAP_AUDIT_2026-06-12 | **Status:** DRAFT

---

## Executive Summary

This specification translates every finding from the June 2026 UI/UX Gap Audit into actionable implementation contracts. Gaps are organized into seven work streams: (1) critical flow failures, (2) stub page implementation, (3) unwired API wiring, (4) dead component triage, (5) routing hygiene, (6) test coverage completion, and (7) API consolidation. Each item carries an owner-ready acceptance criterion so that a developer can pick up a ticket and know exactly when it is done.

The audit identified one **FAIL** flow (Resume Rockstar ATS pipeline), three **PARTIAL** flows (auth → Sanctuary → Billy, Blackboard recap orbs, Musical DNA interview), and two **PASS** flows (Creation Corner synthesis, Billy metadata chips). The single FAIL and all three PARTIALs must be fully green before the next investor or Indiegogo backer demo. Everything else is prioritized by demo-impact and technical debt risk.

---

## Work Stream 1 — Critical Flow Remediation

These are the highest-priority items. Nothing in other work streams ships before these are green.

### 1.1 Resume Rockstar — Score/Enhance Pipeline (FLOW-4, currently FAIL)

**Problem:** `client/src/modules/Resume_Rockstar/SectionEditor` has no Score or Enhance controls. The POST endpoints `/api/modules/resume-rockstar/analyze` and `/api/modules/resume-rockstar/enhance` exist on the server and have passing unit tests, but no client caller invokes them. The E2E test `tests/e2e/resume-rockstar.spec.ts` currently exposes this gap.

**Scope of change:**
- `client/src/modules/Resume_Rockstar/components/SectionEditor.tsx` — add **Score** and **Enhance** buttons to the toolbar.
- On Score: POST to `/api/modules/resume-rockstar/analyze`; render an ATS grade badge (A/B/C/D) and a PLK voice label inline above the section text.
- On Enhance: POST to `/api/modules/resume-rockstar/enhance`; stream/replace section content in-place; preserve metaphor fidelity (unit test `resumeRockstar.test.ts` already covers the contract).
- Add loading/skeleton state during both requests. Display inline error message on failure — no toast.
- On success, show `atsDelta` (e.g., "+12 pts") and `plkDelta` as animated number increments next to the grade badge.

**Acceptance criteria:**
- [ ] `tests/e2e/resume-rockstar.spec.ts` passes end-to-end in CI against mock API.
- [ ] ATS grade badge and PLK label render after Score.
- [ ] Enhanced content replaces raw section text with no JSON bleed-through.
- [ ] `atsDelta` and `plkDelta` animate on mount.
- [ ] Loading spinner shown during both API calls; error state shown on 4xx/5xx.

---

### 1.2 Blackboard Recap Orbs (FLOW-2, currently PARTIAL)

**Problem:** `SessionRecapGenerator` is an import-graph orphan — nothing in the Blackboard Room or Dynamic Inner World imports it. `/api/sessionRecap` is therefore unreachable from any product surface. FLOW-2 (Blackboard → capture → recap orbs) cannot complete.

**Scope of change:**
- Audit `client/src/components/SessionRecapGenerator.tsx`: confirm it is self-contained and functional.
- Import and mount `SessionRecapGenerator` inside `client/src/pages/BlackboardRoomPage.tsx` — rendered as a collapsible bottom panel or a dedicated "Recap" tab within the room's tab bar.
- Wire the panel's trigger to the existing Blackboard capture lifecycle (i.e., after fragments are captured, the Recap panel becomes available).
- The resulting recap orbs must also be passable to `DynamicInnerWorldPage` via the existing `innerWorldFiles` API (`/api/inner-world/artifacts`) so they persist in the user's Inner World.
- If `SessionRecapGenerator` is found to be non-functional on inspection, document what is broken and raise a sub-ticket before proceeding.

**Acceptance criteria:**
- [ ] `SessionRecapGenerator` is reachable from Blackboard Room without direct URL navigation.
- [ ] Submitting a capture payload to `/api/sessionRecap` returns recap content that renders as orbs.
- [ ] Orbs are forwarded to `/api/inner-world/artifacts` and appear in Dynamic Inner World on next load.
- [ ] `tests/e2e/auth.spec.ts` Blackboard smoke test still passes.

---

### 1.3 Musical DNA — Interview Completion (FLOW-5, currently PARTIAL)

**Problem:** The Musical DNA interview overlay opens and analyzes captured tracks through `/api/actions/musical-dna/analyze`, but: (a) it is a structured form, not a chat-style Billy interview as the product contract implies; (b) there is no final "Add to Musical DNA" confirmation action after the last question; the form immediately weaves tracks without user confirmation.

**Design decision required before implementation:**
- **Option A (Chat interview):** Replace or augment the existing form overlay with a Billy chat session (`callBillyApi`) that asks structured musical questions conversationally. On the final exchange, Billy presents a "Add these to your Musical DNA?" confirmation card with track previews.
- **Option B (Structured form + confirmation step):** Keep the current form but add a final review screen showing extracted tracks before committing to `/api/actions/musical-dna/analyze`. Add an explicit "Add to Musical DNA" button on that screen.

**Recommendation:** Option B is lower risk for the current sprint. Option A is the right long-term product expression and should be a follow-up spec.

**Scope of change (Option B, recommended):**
- Add a step-based flow to the interview overlay: existing questions → Review screen → Confirm action.
- Review screen shows captured track list with artist/title chips and a track count summary.
- "Add to Musical DNA" button on review screen POSTs to `/api/actions/musical-dna/analyze` and animates tracks into the playlist.
- "Edit" link on review screen returns to the form.

**Acceptance criteria:**
- [ ] User sees a review/confirmation screen before tracks are committed.
- [ ] "Add to Musical DNA" button is present and functional on review screen.
- [ ] `tests/e2e/musical-dna.spec.ts` passes with the new confirmation step.
- [ ] Existing track analysis payload is unchanged (no API contract breakage).

---

### 1.4 Auth → Sanctuary → Billy Chain (FLOW-1, currently PARTIAL)

**Problem:** The flow depends on a configured Supabase environment and browser cookie path. In an unauthenticated demo state, the chain can silently fail if `VITE_SUPABASE_URL` or the session state endpoint (`/api/session/state`) returns an unexpected response. Loading and error states exist in components but have not been verified to catch all failure modes.

**Scope of change:**
- In `client/src/pages/SanctuaryPage.tsx` — add a graceful degraded state: if auth is missing, show a "Try as Guest" CTA that bypasses auth and loads a read-only Sanctuary experience with a single demo Billy exchange (hard-coded demo persona).
- In `client/src/contexts/AuthContext.tsx` — ensure that a failed `/api/session/state` call does not block rendering of the Sanctuary or Home pages; log the error and fall through to unauthenticated state.
- In `/signup` (`client/src/pages/Signup.tsx`) — this is currently a STUB. At minimum, wire the email/password fields to `supabaseAuth` so the page is not dead on demo.

**Acceptance criteria:**
- [ ] Unauthenticated user can reach Sanctuary and see a demo Billy response without logging in.
- [ ] A failed `/api/session/state` does not produce a blank or broken page.
- [ ] `/signup` submits to Supabase auth and redirects to `/welcome` on success.
- [ ] `tests/e2e/auth.spec.ts` login/callback test still passes.

---

## Work Stream 2 — Stub Page Implementation

Ordered by demo-impact. Pages that appear in primary navigation must be at least demo-complete before any public-facing event.

### 2.1 `/app` Dashboard (High priority)

**File:** `client/src/pages/DashboardPage.tsx` — currently STUB.

**Required:** `/api/session/dashboard` and `/api/session/memory` are wired in the file but the UI renders nothing meaningful. Implement: a greeting header with user display name from session, three KPI tiles (sessions this week, artifacts created, active modules), and a "Recent Activity" feed pulling from session memory. Skeleton loaders during fetch. Empty state if no session data.

**Acceptance criteria:** Dashboard renders real session data for an authenticated user. Empty state shown for new users. Skeleton shown during load.

---

### 2.2 `/profile` (Medium priority)

**File:** `client/src/pages/ProfilePage.tsx` — currently STUB. Both `/api/profile/personality` and `/api/profile/preferences` are already wired.

**Required:** Render personality traits from `/api/profile/personality` as a visual trait grid. Render user preferences from `/api/profile/preferences` as an editable form (toggle/select inputs). Save button POSTs back to preferences endpoint. Avatar upload is out of scope for this sprint.

**Acceptance criteria:** Personality traits display. Preferences form is editable and saves. Error state shown on save failure.

---

### 2.3 `/login` and `/auth/consent` (High priority — blocks all auth flows)

**File:** `client/src/pages/SignIn.tsx` — currently STUB.

**Required:** Email + password login form wired to `supabaseAuth`. Google OAuth button if env has `VITE_GOOGLE_CLIENT_ID`. Redirect to `/welcome` on success, display inline error on failure. `/auth/consent` route should render the same component with a `mode=consent` prop that adjusts copy.

**Acceptance criteria:** User can log in with email/password. Invalid credentials shows inline error. Auth callback (`/auth/callback`) still functions.

---

### 2.4 `/contact` (Low priority — legal/trust signal)

**File:** `client/src/pages/ContactPage.tsx` — STUB.

**Required:** Name, email, and message fields. Submit to a server-side handler or a Supabase edge function that emails Keith. Confirmation message on success.

---

### 2.5 `/privacy` and `/terms` (Low priority — legal baseline)

**Files:** `client/src/pages/PrivacyPage.tsx`, `client/src/pages/Terms.tsx` — both STUB.

**Required:** Static markdown-rendered content. Can be imported from `/docs/legal/` if files exist, or drafted inline. These must not be empty pages if the product is accepting payments via Stripe.

---

### 2.6 `/agent-trainer/pricing` (Medium priority — revenue surface)

**File:** `client/src/pages/AgentTrainerPricing.tsx` — STUB.

**Required:** Pricing tier cards wired to `/api/stripe/agent-trainer-checkout`. Minimum viable: two tiers (Standard, Enterprise), feature comparison table, a Stripe checkout redirect on CTA click.

---

### 2.7 `/agent-trainer/orders/:id` (Medium priority)

**File:** `client/src/pages/GATEOrderStatusPage.tsx` — STUB.

**Required:** Fetch order status from `/api/gate/order` using the `:id` param. Display order state (pending/processing/complete), line items, and a download button when status is complete. Wire download to `/api/gate/order-download`.

---

### 2.8 `/codex` (Medium priority — provenance surface)

**File:** `client/src/pages/CodexPage.tsx` — STUB.

**Required:** Browse interface for Codex artifacts. Wire to `/api/codex/artifacts/[artifactId]`. Artifact list with filter by type/date. Detail panel on selection with provenance metadata. Export button wired to `/api/codex/artifacts/[artifactId]/exports`.

---

### 2.9 Remaining Low-Priority Stubs

The following stubs should be converted to a consistent "Coming Soon" holding page with a subscribe/notify CTA rather than dead white screens. They should be removed from primary navigation until implemented:

- `/transcriptory` — `TranscriptoryPage.tsx`
- `/digital-intelligence-academy` and `/module/agent-academy` — `DigitalIntelligenceAcademyPage.tsx`
- `/embodiment-studio` — `EmbodimentStudioPage.tsx`
- `/agent-council` and `/module/agent-council` — `AgentCouncilPage.tsx`
- `/rapid-prototype` and `/module/rpe` — `RapidPrototypePage.tsx`
- `/adaptive-layout` — `AdaptiveLayoutPage.tsx`
- `/musical-dna` — `MusicalDNAPage.tsx` (STUB route only; the page itself is wired but flagged)
- `/brain-sparks` — `BrainSparksPage.tsx`
- `/brain-sparks-station` — `BrainSparksStation.tsx`

**Acceptance criteria for holding pages:** Each page renders the GestaltView nav/footer, a product name, a single-sentence description, and a "Notify me" email capture field. No blank white screens visible to any user who follows a link.

---

## Work Stream 3 — Unwired API Wiring

Ordered by demo-impact and revenue impact.

### 3.1 Resume Rockstar Analyze + Enhance (Covered under 1.1)

Already specified above. Do not duplicate effort.

---

### 3.2 Musical DNA Billy Chat Endpoints (Covered under 1.3)

Action-style Billy endpoints (`/api/actions/billy/code`, `/api/actions/billy/loom`, `/api/actions/billy/synthesize`) are currently unused. These should be wired as part of the Option A Musical DNA enhancement (future sprint) and documented as blocked until 1.3 is resolved.

---

### 3.3 Session Recap via `/api/sessionRecap` (Covered under 1.2)

Already specified above.

---

### 3.4 Bucket Drops API

**Endpoints:** `/api/billy-bucket-drop`, `/api/actions/bucket-drops`

**Problem:** `BucketDropsPage.tsx` is REAL but no client code calls these action endpoints. The Bucket Drops UI may be operating purely from locally managed state.

**Required:** Audit `client/src/pages/BucketDropsPage.tsx` to determine what data it currently renders. If drops are local-only, wire the POST to `/api/actions/bucket-drops` on drop creation and GET from `/api/billy-bucket-drop` on page load. If the page already handles persistence via another path, document and close the ticket.

---

### 3.5 Transcriptory API

**Endpoints:** `/api/transcriptory/**` capture/session endpoints

**Required:** Blocked on stub page implementation (2.9). Wire capture and session endpoints once `TranscriptoryPage.tsx` moves out of stub status. Do not wire APIs to a stub page.

---

### 3.6 GATE Operational Endpoints

**Endpoints:** `/api/gate/build-job-run`, `/api/gate/build-job-regenerate`, `/api/gate/draft-validate`, `/api/gate/order-download`, `/api/gate/order-redeem`, `/api/gate/support-request`

**Required:** Wire these from the GATE Package Builder and Order Status pages. Specifically:
- `GATEPackageBuilderPage.tsx` — add draft-validate call before checkout submission.
- `GATEOrderStatusPage.tsx` — add order-download and order-redeem actions (per 2.7 above).
- Support request form: add minimal contact modal wired to `/api/gate/support-request`.

---

### 3.7 Trainer Run/Review/Flag/Deploy Endpoints

**Endpoints:** `/api/trainer/**`

**Required:** These are only relevant once the Trainer Control Plane (`/agent-trainer/control-plane`) is the subject of a focused sprint. For now, document as intentionally deferred and add a code comment in `client/src/pages/HostedAgentTrainerPage.tsx` referencing this spec.

---

### 3.8 Profile Ingest

**Endpoint:** `/api/profile/ingest`

**Required:** Once Profile page (2.2) is implemented, add an "Import data" flow that POSTs to this endpoint. Out of scope for current sprint; add a `TODO(spec: 3.8)` comment in `ProfilePage.tsx`.

---

## Work Stream 4 — Dead Component Triage

The audit identified 45+ import-graph orphans. The triage rule is:

- **Reactivate** if the component is needed by a current or near-term spec item.
- **Archive** (move to `client/src/_archive/`) if the component belongs to a feature that is planned but not in this sprint.
- **Delete** if the component has no roadmap path.

### 4.1 Reactivate Immediately

These orphans are directly referenced in spec items above:

| Component | Reactivated by | Action |
|---|---|---|
| `SessionRecapGenerator.tsx` | Spec 1.2 | Import into `BlackboardRoomPage.tsx` |
| `ArtifactExportBar.tsx` | Spec 3.6 | Import into `GATEOrderStatusPage.tsx` |
| `ArtifactPreviewer.tsx` | Spec 2.8 (Codex) | Import into `CodexPage.tsx` |
| `ArtifactRenderer.tsx` | Spec 2.8 (Codex) | Import into `CodexPage.tsx` |
| `InnerWorldArtifactGallery.tsx` | Spec 1.2 | Import into `DynamicInnerWorldPage.tsx` for recap orb display |
| `InnerWorldInspector.tsx` | Spec 1.2 | Import into `DynamicInnerWorldPage.tsx` |
| `InnerWorldRoom.tsx` | Spec 1.2 | Import into `DynamicInnerWorldPage.tsx` |
| `FileUploadDropzone.tsx` | Spec 2.2 (Profile) | Import into `ProfilePage.tsx` avatar/import section |
| `FilePreviewPane.tsx` | Spec 2.8 (Codex) | Import into `CodexPage.tsx` detail panel |
| `ProvenanceDisclosure.tsx` | Spec 2.8 (Codex) | Import into `CodexPage.tsx` detail panel |

---

### 4.2 Archive (Near-Term Roadmap)

Move to `client/src/_archive/` with a `ARCHIVE_REASON.md` comment:

- `UniversalCaptureBar.tsx` — needed for Transcriptory (future sprint)
- `RapidPrototypeEngine.tsx` — needed for `/rapid-prototype` (future sprint)
- `DemoGate.tsx` — needed for free-tier artifact gating (future sprint, ties to free-tier artifact spec)
- `OrbGraph.tsx` — needed for Codex/provenance visualization (future sprint)
- `MuseumNavigator.tsx` — needed if Museum route is resurrected (deferred)
- `SanctuaryStudio.tsx` — needed for Sanctuary expansion (future sprint)
- `SanctuaryWillowBabylon.tsx` — needed for Sanctuary 3D scene (future sprint)
- `RecapPanel.tsx` — potential alternate recap UI; archive pending 1.2 outcome
- `BillyGlitch.tsx` — UX easter egg; archive until Billy polish sprint
- `BlackboardGenEngineActions.tsx` — future Blackboard enhancement; archive
- `SubpageQuickNav.tsx` — needs design decision on nav architecture; archive
- `LifeTapestry.tsx`, `TheoriesMap.tsx` — future exhibit surfaces; archive

---

### 4.3 Delete (No Roadmap Path)

Delete after confirming no dynamic import path exists:

- `ADHDPowerUpStation.tsx` — superseded by `/adhd-powerup` page
- `AddictionRecoveryExhibit.tsx` — superseded by `/addiction-recovery` page
- `AlzheimersLegacyExhibit.tsx` — superseded by `/alzheimers-legacy` page
- `DeadlightsTrackSection.tsx` — no active feature reference
- `WhatThisIs.tsx`, `WhatWasBuilt.tsx`, `TheHuman.tsx`, `TheEvidence.tsx` — superseded by current Home/Demo pages
- `Collaborators.tsx` — no active collaborator surface
- `ExhibitPage.tsx` — superseded by `/exhibits` index
- `LoadingSpinner.tsx` — confirm shadcn/ui has a replacement; delete if confirmed
- `ServicesConsulting.tsx` — superseded by `/consulting` page
- `GeminiAwakening.tsx`, `MuseumPage.tsx`, `WhiteboardRoomPage.tsx`, `SymbioCodingPage.tsx`, `AgentAcademyPage.tsx` — all orphaned page files with no active route

**Before deletion:** run `grep -r "ComponentName" client/src` to confirm no dynamic import or lazy-load reference exists.

---

## Work Stream 5 — Routing Hygiene

### 5.1 Remove Duplicate `/brain-sparks-station` Route

The audit found a duplicate route entry in `client/src/App.tsx` for `/brain-sparks-station`. Remove one entry. Keep the one pointing to `client/src/components/BrainSparksStation.tsx`.

**Acceptance criteria:** `App.tsx` contains exactly one `/brain-sparks-station` route definition.

---

### 5.2 Audit Duplicate `/agent-builder` Routes

Three routes (`/agent_builder`, `/agent-builder`, `/builder`) all point to `AgentBuilder.tsx`. Confirm whether all three are intentional aliases or if `/builder` is a legacy path that should redirect to `/agent-builder`. Add a comment in `App.tsx` documenting the intent.

---

### 5.3 Hide Incomplete Stubs from Navigation

Ensure that stub pages listed in 2.9 are not reachable from the primary navigation (`Scaffold.tsx` or equivalent nav component). They must remain route-defined (for deep-link compatibility) but should not appear in sidebar, top nav, or any in-product link until their implementation spec is complete.

**Implementation pattern:** Use a `FEATURE_FLAGS` constant in `client/src/config/featureFlags.ts` (create if absent). Each flag gates a nav item. Stub routes get `flag: false` by default. This is the single source of truth for nav visibility going forward.

---

### 5.4 `/signup` and `/login` Redirect Audit

Confirm that `/signup` and `/login` redirect to `/welcome` on successful auth and that the redirect chain does not loop. Verify `/auth/consent/auth/callback` (the nested path) is intentional — if it is a duplicate of `/auth/callback`, consolidate.

---

## Work Stream 6 — Test Coverage Completion

The audit added a strong foundation of unit and E2E tests. These items complete the coverage.

### 6.1 Make All E2E Tests Pass

Current status:
- `tests/e2e/resume-rockstar.spec.ts` — **FAILING** (blocked on Spec 1.1)
- `tests/e2e/musical-dna.spec.ts` — **FAILING** (blocked on Spec 1.3)
- `tests/e2e/auth.spec.ts` — PARTIAL (depends on Supabase env; add `--mock-supabase` mode)
- `tests/e2e/billy-chat.spec.ts` — should pass; verify in CI
- `tests/e2e/creation-corner.spec.ts` — should pass; verify in CI

**Required:** After implementing Specs 1.1 and 1.3, both failing E2E tests must pass against mock API. All five E2E tests must be part of the CI gate.

---

### 6.2 Add Dashboard E2E Test

Once `/app` dashboard is implemented (Spec 2.1), add `tests/e2e/dashboard.spec.ts`:
- Authenticated user sees greeting and KPI tiles.
- New user sees empty state (no activity feed items).
- Unauthenticated user is redirected to `/login`.

---

### 6.3 Add Codex E2E Test

Once Codex page is implemented (Spec 2.8), add `tests/e2e/codex.spec.ts`:
- Artifact list renders from mocked `/api/codex/artifacts/[artifactId]`.
- Selecting an artifact opens detail panel with provenance metadata.

---

### 6.4 Playwright Config — Verify Environment Variables

`playwright.config.ts` uses `VITE_API_BASE`, `PLAYWRIGHT_BASE_URL`, and `localhost:5173`. Confirm that the CI pipeline (Vercel preview builds or GitHub Actions) sets these correctly. Add a `.env.test.example` file documenting required test environment variables.

---

## Work Stream 7 — API Consolidation

### 7.1 Collapse Duplicate Resume Endpoints

**Duplicate endpoints:** `/api/modules/resume-rockstar/analyze` + `/api/resume-rockstar/analyze` (and enhance, score-section). The `/api/resume-rockstar/**` paths appear to be legacy. After Spec 1.1 is wired to the module paths, add a deprecation notice to the legacy handlers (`// DEPRECATED: use /api/modules/resume-rockstar/*`) and remove them in the following sprint.

---

### 7.2 Collapse Duplicate Symbio/Vibe Endpoints

**Duplicate endpoints:** `/api/modules/symbio-coder/analyze` vs `/api/symbiocoder/analyze`; similar pattern for vibe-coder.

**Required:** Document which path is canonical (module path preferred). Redirect or delete legacy paths. Do not allow both paths to exist in production indefinitely.

---

### 7.3 Codex Synthesis Route Cleanup

`/api/creation-corner/synthesize` is bypassed by `/api/gen-engine/artifacts`. If the older route is fully superseded, delete the handler and remove any remaining references. If it serves a distinct use case, document it.

---

### 7.4 Gen Engine Export

`/api/gen-engine/export` exists but the client uses a local export helper instead. Decision required:
- **Option A:** Remove the server route if local export is permanent.
- **Option B:** Wire the server route for server-side rendering/PDF export and remove the local helper.

Document the decision in `docs/CurrentState.md`.

---

## Implementation Order (Recommended Sprint Sequence)

| Sprint | Items | Exit Criteria |
|---|---|---|
| **Sprint 1** (Demo-critical) | 1.1, 1.4, 5.3 (feature flags), 2.3 (login/signup), 6.1 (partial) | FLOW-1 and FLOW-4 green; no dead stub pages in nav |
| **Sprint 2** (Flow completion) | 1.2, 1.3, 2.1, 2.2, 6.1 (full), 6.2 | All 6 critical flows green; dashboard and profile live |
| **Sprint 3** (Revenue surfaces) | 2.6, 2.7, 2.8, 3.5, 3.6, 4.1 (reactivations) | GATE order flow demo-complete; Codex browsable |
| **Sprint 4** (Debt clearance) | 4.2, 4.3, 5.1, 5.2, 7.1, 7.2, 7.3, 7.4 | No orphaned components; no duplicate routes or endpoints |
| **Sprint 5** (Coverage + legal) | 2.4, 2.5, 6.3, 6.4, 3.3–3.8 | Privacy/Terms live; full CI gate green |

---

## Open Questions for Keith

1. **Musical DNA chat vs. form (Spec 1.3):** Confirm Option A (full Billy chat interview) or Option B (form + confirmation step) before Sprint 2 begins. [(Answer: So just like a lot of the capture layers throughout GestaltView they are meant to reduce cognitive pressure and overhead. Inference through Journal Entries in allowing a section for entries to link to music for in the moment or nostalgiac stress reduction. Forms or interviews are not the flow I want to have in GestaltView. Dynamic integration between session recaps, file uploads, Creation Corner artifacts, journal entries (with permission) musical DNA, personality and character profiles, resume and skills, hobbies and interests, learning new things module integration)]
2. **Free-tier artifact generation:** `DemoGate.tsx` is currently archived. When should the free-tier artifact pipeline and its cap logic be specced? This affects `DynamicInnerWorldPage` and the Dynamic Inner World free demo concept discussed in prior sessions. [(Answer:I believe we are ready to SPEC demo behavior throughout the runtime now)]
3. **Codex as product vs. internal tool:** Is `/codex` a user-facing browsing surface or an internal provenance audit tool? This changes the UI fidelity required in Spec 2.8. [(Answer: So the name Codex was an accidental misunderstanding when I asked for a SPEC to be made for Codex for the gen-engine. I don't want it to be confused with ChatGPT Codex. As of now this is an internal tool like the gravity protocol layer.)]
4. **`/transcriptory` timeline:** This page is STUB and its API endpoints are unwired. Is there a target sprint for this feature, or should it be indefinitely held behind a feature flag? [(Answer: This feature is meant to be fully deployed and operational within the runtime)]
5. **`/embodiment-studio` and `/agent-council`:** These carry significant product weight conceptually. Are they targeted for v2 or v3? 
[(Answer: So I don't want to restrict working on these by saying v3, I'd like them to be a part of this release with modifications and improvements for v3.)]
