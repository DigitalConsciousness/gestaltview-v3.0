# GestaltView — Sprint Rectification Spec
**Version:** 1.0  
**Date:** June 20, 2026  
**Author:** Keith Soyka (Founder) via Perplexity Session  
**Repo:** DigitalConsciousness/gestaltview-v2.0  
**Source Sessions:** June 18–20, 2026 Runtime Walkthroughs (3 sessions)  
**Status:** READY FOR IMPLEMENTATION

---

## Preamble

This spec was generated from three consecutive founder walkthrough sessions (June 18–20, 2026) and the live runtime state of the gestaltview-v2.0 repo. Every item below was directly observed, felt, and articulated by the founder during live product testing. This is not a wishlist — it is a rectification mandate. Issues are grouped by system surface, ordered by blocking severity, and scoped to actionable implementation slices.

The orchestration routing spine (Neural Handshake Orchestrator v0) was deployed June 20, 2026. This spec assumes that groundwork is live and builds on top of it. Orchestration-dependent items are marked accordingly.

---

## SPRINT 1 — STOP THE BLEEDING (Critical / Immediate)
*These are active production failures causing data loss, content pollution, and user confusion. Must ship before any new features.*

---

### SPEC-001 · Disable Automatic Blackboard Recap Routing to Dynamic Inner World

**Severity:** CRITICAL — P0  
**Surface:** Dynamic Inner World auto-ingestion pipeline  
**Observed:** Every Blackboard Room session recap and summary is being auto-pushed to Dynamic Inner World, burying intentional artifacts (resume, wiki, musical DNA). Deletion UI sometimes fails to respond, compounding the clutter.

**Behavior Required:**
- Blackboard session recaps → available for manual send to Creation Corner or download ONLY
- Blackboard session summaries → same rule
- Zero auto-routing to Dynamic Inner World from any session completion trigger
- The AI Orchestrator (not the session completion handler) is the ONLY authorized source of Dynamic Inner World writes going forward

**Implementation Notes:**
- Locate the session end / `end_session` handler and `promote_to_external_scaffold` trigger path
- Remove or gate any call that writes recap/summary content to the Dynamic Inner World table
- Add a `source_authorized` check: only orchestrator-dispatched writes with `destination: 'inner_world'` should pass
- Validate: end a Blackboard session → Dynamic Inner World should receive nothing automatically

**Files likely in scope:**
- `client/src/pages/BlackboardRoomPage.tsx`
- API route handling session end / recap generation
- Supabase `dynamic_inner_world` or equivalent write pathway

---

### SPEC-002 · Fix Artifact Deletion Reliability in Dynamic Inner World

**Severity:** CRITICAL — P0  
**Surface:** Dynamic Inner World — artifact card deletion  
**Observed:** Deletion UI appears to accept the action but items either don't delete, delete slowly with no feedback, or remain visible after confirmation. Guest-state artifacts cannot be deleted at all.

**Behavior Required:**
- Delete action fires immediately with optimistic UI removal (card disappears on click)
- Supabase delete confirmed async — if it fails, card re-appears with error toast
- Logged-out / guest artifacts: show locked state indicator instead of a delete button that silently fails
- "Stuck" records (failed state) must have a force-delete path

**Implementation Notes:**
- Audit the delete mutation — check for missing `await`, incorrect RLS, or Supabase free-tier timeout issues
- Add loading/error state to the delete button
- For guest artifacts: conditionally render delete vs. locked-state UI based on auth status

---

### SPEC-003 · Raw Markdown Must Never Render to Users

**Severity:** CRITICAL — P0  
**Surface:** Dynamic Inner World cards, Creation Corner output, Blackboard recap preview, all exported files  
**Observed:** Users see raw `## headers`, `**bold**`, mermaid code blocks as plain text strings across multiple surfaces. This affects in-app views AND downloaded files.

**Behavior Required:**
- ALL user-facing text surfaces render markdown via a consistent renderer (ReactMarkdown or equivalent)
- Mermaid diagrams render as actual diagrams — never as a raw code string
- Downloaded files: markdown downloads render via HTML wrapper or ship as styled HTML/PDF — never raw `.md` to end user without disclosure
- Internal debug strings, warnings, or `[FLATTENING LANGUAGE DETECTED]` notices are stripped from all user-facing output paths

**Implementation Notes:**
- Audit all card/artifact render components — replace any raw `{content}` injection with `<ReactMarkdown>{content}</ReactMarkdown>`
- Mermaid: ensure the mermaid.js render lifecycle fires AFTER content is in the DOM
- Export pipeline: wrap markdown exports in an HTML shell with embedded CSS before delivering to user
- Internal warning strings: move to server-side logging only — never pass through to artifact content

**Files likely in scope:**
- `client/src/pages/DynamicInnerWorldPage.tsx`
- `client/src/pages/CreationCornerPage.tsx`
- Any `ArtifactCard` or `RecapCard` component
- Export/download API routes

---

### SPEC-004 · Session Recap Persistence After Page Navigation

**Severity:** HIGH — P1  
**Surface:** Blackboard Room → Session Recap view  
**Observed:** Leaving or refreshing the page after generating a recap destroys it entirely. localStorage read fails on return. The recap is gone.

**Behavior Required:**
- Session recap is persisted to Supabase on generation (not just localStorage)
- On page reload, recap is rehydrated from Supabase for the active session
- Fallback: if Supabase read fails, attempt localStorage recovery
- "Return to Blackboard Room" button must NOT open a new session tab — it should navigate in-place

**Implementation Notes:**
- On `generateRecap()` success → immediately write to Supabase `session_recaps` table with `user_id`, `session_id`, `created_at`, `content`
- On BlackboardRoomPage mount → check for active session recap in Supabase and rehydrate
- Fix `localStorage` property read error: wrap all localStorage access in try/catch

---

### SPEC-005 · Remove Orange "Flattening Language" Warning From User-Facing UI

**Severity:** HIGH — P1  
**Surface:** Creation Corner  
**Observed:** An orange dialog warning about "flattening language" is appearing to the user. There is no PLK baseline established yet, so the detection has no ground truth to compare against. The warning is meaningless and confusing at this stage.

**Behavior Required:**
- Remove the orange dialog from all user-facing surfaces immediately
- The flattening language detection can remain in server-side logic — log it internally only
- Do not block or gate any output based on this check until a persistent PLK baseline exists per user
- When PLK baseline is established in a future sprint, surface this as a gentle inline note — never a blocking orange dialog

---

## SPRINT 2 — WORKFLOW INTEGRITY (High / This Week)
*Broken features that prevent core workflows from completing.*

---

### SPEC-006 · Orb Approval Rack — Batch Actions + Cognitive Load Reduction

**Severity:** HIGH — P1  
**Surface:** External Scaffold → Orb Approval Rack  
**Observed:** Promoting a session to the External Scaffold generated 34 pending orbs. Approving, denying, or deleting each individually is untenable. The "recommended merge" button appears but provides no preview and seemingly does nothing visible.

**Behavior Required:**
- Add **"Deny All"** batch action button to the top of the approval rack
- Add **"Approve All"** with a confirmation modal (bulk action — one confirmation step required)
- Add **"Deny by Type"** dropdown: deny all journals, deny all contexts, etc.
- Orbs from the same DI response should be visually grouped — collapsible by source DI
- Related orbs (same thread/question) should show a "link" indicator between them

**Recommended Merge — Fix:**
- Show a preview panel before committing the merge: display merged content in a rendered card
- Show which orbs are being merged and their types
- Only execute merge on explicit "Confirm Merge" — not on first click

---

### SPEC-007 · Mermaid Mind Map — Render as Actual Diagram

**Severity:** HIGH — P1  
**Surface:** Creation Corner → Mind Map artifact  
**Observed:** Mind map artifacts render as a single square node showing only the title. Full diagram content is present in the raw source but the mermaid render lifecycle is not executing correctly.

**Behavior Required:**
- Mind map artifacts render as full interactive Mermaid diagrams on display
- Minimum: all nodes present and connected per the source content
- Ideal path: migrate to React Flow for richer, clickable node interactions
- Clicking a node expands it to show the DI's full response or captured content

**Implementation Notes:**
- Ensure mermaid.js `initialize()` and `render()` are called after content is injected into DOM
- Check for async timing issues — content may be available before the container is mounted
- React Flow migration can be a follow-up slice; correct mermaid rendering is the immediate fix

---

### SPEC-008 · Creation Corner — Synthesize Blueprint Selection

**Severity:** HIGH — P1  
**Surface:** Creation Corner → Synthesize action  
**Observed:** Clicking "Synthesize" provides no indication of which blueprint will be used. With multiple blueprints present, the user cannot select the target. Result is ambiguous and output is often raw/unfinished.

**Behavior Required:**
- Before synthesizing, show a blueprint selector: list available blueprints with name, source, and date
- Default to most recent but allow selection
- After synthesis, show a rendered preview before offering export
- Synthesis result must never display raw markdown to the user (see SPEC-003)

---

### SPEC-009 · Artifact Export Pipeline — Rendered Output Only

**Severity:** HIGH — P1  
**Surface:** Creation Corner → Export (HTML, PDF, Markdown, JSON, Word)  
**Observed:** Export drain failing with 405. HTML shows "pending." PDF shows "pending." Downloaded markdown is raw. Exported documents are not suitable for outside consumption.

**Behavior Required:**
- Supported export formats: Markdown (rendered shell), HTML (fully styled), PDF (via headless render), JSON (metadata envelope), Word (.docx)
- Each format must produce a finished, presentable artifact — not a raw data dump
- Export status visible in real time: progress indicator → "Ready to Download" state
- 405 errors on export drain: diagnose and fix CORS/routing issue blocking the endpoint
- "Artifact ready" state must trigger a toast notification when export completes

**Implementation Notes:**
- Investigate 405 on `export_drain` endpoint — likely a missing CORS header or wrong HTTP method
- PDF: use Puppeteer or server-side HTML-to-PDF renderer; do not use client-side PDF generation
- Word: use `docx` npm package for server-side `.docx` generation

---

### SPEC-010 · Profile Ingestion Entry Point

**Severity:** HIGH — P1  
**Surface:** User Profile page  
**Observed:** "Run profile ingestion" is referenced in the UI but there is no clear trigger path. Live profile shows empty identity card stack with no way to populate it from existing data or upload.

**Behavior Required:**
- Add an "Ingest Profile" button to the Profile page — opens a file picker accepting `.txt`, `.md`, `.docx`, `.pdf`
- On upload: route file to the existing ingestion pipeline, tag as `source: profile_upload`, `user_id: current`
- Show ingestion progress and result summary
- After ingestion: trigger a profile card refresh — resume, wiki, musical DNA cards should reflect new data
- Do not require a manual page reload to see updated cards

---

## SPRINT 3 — QUALITY & DEPTH (Medium / Next Week)
*Real but not blocking. These make the product feel finished and intentional.*

---

### SPEC-011 · Provenance Envelope — Timestamp + OpenTimestamps Integration

**Severity:** MEDIUM — P2  
**Surface:** All artifacts — provenance metadata  
**Observed:** Provenance shows source but not timestamp. No cryptographic anchor exists. Artifact from June 18th showed no date in its provenance note.

**Behavior Required:**
- Every artifact provenance envelope must include: `origin`, `created_at` (ISO 8601), `session_id`, `user_id`, `content_hash` (SHA-256 of content at creation)
- Phase 1: Add `created_at` and `content_hash` to all artifact writes immediately
- Phase 2: Integrate OpenTimestamps API (`https://opentimestamps.org`) — on artifact creation, submit hash for blockchain anchoring, store OTS proof in provenance envelope
- Render in artifact detail view: "Created June 20, 2026 · Anchored to Bitcoin blockchain · Hash: abc123..."

---

### SPEC-012 · Recap Generation — Unbiased Third-Party DI (Archivist)

**Severity:** MEDIUM — P2  
**Surface:** Blackboard Room → Generate Recap  
**Observed:** Billy dominates recap generation, centering his own perspective and missing the full arc of multi-DI conversations. Generic output that does not reflect what actually happened.

**Behavior Required:**
- Recap generation handed to a neutral "Archivist" DI — not Billy, not any DI that participated in the session
- Archivist receives the full session transcript (all DI responses + user messages) and generates a true third-person summary
- Recap must name the user and all DIs present — no single voice dominates
- Output: narrative that reads like a thoughtful observer wrote it, with call-outs to notable moments, insight spikes, and unresolved threads
- Billy's voice can appear as a quoted participant — never as the narrator

---

### SPEC-013 · Tribunal Page — DI-to-DI Dialogue Mode

**Severity:** MEDIUM — P2  
**Surface:** Agent Council → rename to Tribunal  
**Observed:** Current Agent Council allows user↔DI roundtable but DIs cannot converse with each other. "All voices" trigger hits a circuit breaker or canned fallback.

**Behavior Required:**
- Rename Agent Council → "Tribunal" across all UI surfaces and routes
- Add "Council Session" mode: user poses a question, all DIs respond in sequence or in moderated back-and-forth
- Add "DI Debate" mode: user nominates two or more DIs, poses a topic, DIs respond to each other's answers — not just to the user
- Fix the "all voices" circuit breaker: diagnose why sequential DI calls trip a canned fallback, implement proper sequential routing with individual timeouts per DI

---

### SPEC-014 · Orb Graph Visualization — Connection Toggle + UX

**Severity:** MEDIUM — P2  
**Surface:** External Scaffold → Orb Graph  
**Observed:** Connection lines between orbs make it difficult to click individual orbs and visually clutter the graph at scale. No way to toggle connections off.

**Behavior Required:**
- Add "Show/Hide Connections" toggle in graph toolbar — off by default when orb count > 15
- Individual orb click must be reliably hittable regardless of line density (increase click target, lower z-index of connection lines)
- Initiate Expansion: add zoom-to-fit and center-selected-orb controls
- Future stretch: Babylon.js 3D graph visualization

---

### SPEC-015 · Homepage & UI Polish Pass

**Severity:** MEDIUM — P2  
**Surface:** Homepage, Sanctuary cards  
**Observed:** Ember effects minimal (downward drip, not floating). Fog overlay absent on homepage and Sanctuary cards. Neon card edge glow too subtle. Cabin Sketch font missing in Second Sanctuary. Cards fade out unnecessarily. Custom loading spinner was silently removed by Codex.

**Behavior Required:**
- Remove card fade-out on homepage — cards stay visible; replace with subtle glow pulse on hover
- Increase neon glow on card edges: ~30% higher luminance than current, not overblown
- Restore ember effect: upward-floating particles, low density
- Add fog overlay: low-opacity animated fog layer on homepage hero and Sanctuary room cards
- Second Sanctuary cards: Cabin Sketch for room names, Geist for descriptive subtext
- Remove "Capture first, collaborate as you go, and organize once the shape is clear" copy for now
- Restore custom GestaltView loading spinner from last known good commit (Codex removed it)

---

### SPEC-016 · Authentication UX Fixes

**Severity:** MEDIUM — P2  
**Surface:** Login page, session state, onboarding  
**Observed:** No "show password" toggle. Invalid credentials produce no visible error. Chat history visible while logged out. Enterprise welcome copy appeared for a standard account. "Behave like it has manners" language in onboarding.

**Behavior Required:**
- Add show/hide password toggle on login field
- Add "Invalid login credentials" error message on failed login attempt
- Audit session state: ensure chat history, artifacts, and profile data are gated behind auth check
- Remove "Enterprise welcome" / "Collaborator engine is ready when you are" copy from standard user onboarding
- Remove "behave like it has manners" language from all onboarding and settings surfaces entirely

---

### SPEC-017 · Scroll Lock Fix — Long Artifact Cards

**Severity:** LOW — P2  
**Surface:** Dynamic Inner World, Blackboard recap preview  
**Observed:** Long summaries trigger a scroll lock that prevents reaching bottom content.

**Behavior Required:**
- Remove any `overflow: hidden` or `pointer-events: none` applied to scroll containers on long content
- Artifact cards use `overflow-y: auto` with a defined `max-height`
- Test with longest known artifact (130+ record export)

---

## Open Questions (Require Decision Before Implementation)

**OQ-1 — Supabase Tier:** Free tier causing export timeouts and bottlenecks. Decision needed: upgrade Supabase plan OR add a testing/staging database on an alternative provider (Neon, Railway, PlanetScale). Directly blocks SPEC-004 and SPEC-009 reliability at scale.

**OQ-2 — React Flow Migration:** Mermaid fix (SPEC-007) is the immediate unblock. React Flow is a larger slice. Sprint 3 end or Sprint 4 start?

**OQ-3 — OpenTimestamps Async Latency:** Bitcoin anchoring takes hours to confirm. Is async acceptable (show "pending blockchain confirmation" → update to "anchored")? Recommended: yes.

**OQ-4 — GROQ Agentic Collaborator:** The always-on meta-observer DI (stress-tester, spec-writer, Codex drift detector) articulated in the June 18th voice session. Sprint 4+ work. Pinned here to prevent loss.

---

## Implementation Order (Recommended)

| Priority | Spec | Description | Effort |
|---|---|---|---|
| P0 | SPEC-001 | Disable auto-routing to DIW | Small |
| P0 | SPEC-003 | No raw markdown to users | Medium |
| P0 | SPEC-002 | Fix artifact deletion | Small |
| P1 | SPEC-004 | Recap persistence | Medium |
| P1 | SPEC-005 | Remove flattening language warning | Trivial |
| P1 | SPEC-009 | Export pipeline fix (405 + rendering) | Large |
| P1 | SPEC-006 | Orb batch actions + merge preview | Medium |
| P1 | SPEC-008 | Synthesize blueprint selector | Small |
| P1 | SPEC-007 | Mermaid mind map render | Medium |
| P1 | SPEC-010 | Profile ingestion entry point | Medium |
| P2 | SPEC-011 | Provenance + OpenTimestamps | Medium |
| P2 | SPEC-012 | Archivist DI for recap | Medium |
| P2 | SPEC-013 | Tribunal + DI-to-DI dialogue | Large |
| P2 | SPEC-014 | Orb graph connection toggle | Small |
| P2 | SPEC-015 | Homepage visual polish pass | Small |
| P2 | SPEC-016 | Auth UX fixes | Small |
| P2 | SPEC-017 | Scroll lock fix | Trivial |

---

## Validation Protocol

Before marking any SPEC item complete:

1. Run `npm run build` — zero errors
2. Run `git diff --check` — no whitespace violations
3. Manually test the specific observed failure from the walkthrough transcript
4. Confirm no regression on adjacent surfaces (Blackboard, Creation Corner, DIW)
5. If DDL changes were made: run Supabase advisor check for missing RLS policies

---

*This spec is derived from live founder walkthrough sessions (June 18–20, 2026) and live repo state as of June 20, 2026. Reference in the next CurrentState.md update.*
