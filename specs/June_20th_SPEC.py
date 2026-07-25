
spec = """# GestaltView — Sprint Rectification Spec
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
- Audit all card/artifact render components — replace any `{content}` raw injection with `<ReactMarkdown>{content}</ReactMarkdown>`
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
- The flattening language detection can remain in server-side logic — log it internally
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
- Add **"Approve All"** with a confirmation modal (this is a bulk action — one confirmation step)
- Add **"Deny by Type"** dropdown: deny all journals, deny all contexts, etc.
- Orbs from the same DI response should be visually grouped — collapsible by source DI
- Related orbs (same thread/question) should show a "link" indicator between them

**Recommended Merge — Fix:**
- Show a preview panel before committing the merge: display the merged content in a readable, rendered card
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
- Clicking a node expands it to show the DI's full response or the captured content

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
- After synthesis, show a rendered preview of the output before offering export
- Synthesis result must never display raw markdown to the user (see SPEC-003)

---

### SPEC-009 · Artifact Export Pipeline — Rendered Output Only

**Severity:** HIGH — P1  
**Surface:** Creation Corner → Export (HTML, PDF, Markdown, JSON, Word)  
**Observed:** Export drain failing with 405. HTML shows "pending." PDF shows "pending." Downloaded markdown is raw. Exported documents are not suitable for outside consumption.

**Behavior Required:**
- Supported export formats: Markdown (rendered shell), HTML (fully styled), PDF (via headless render), JSON (metadata envelope), Word (.docx)
- Each format must produce a finished, presentable artifact — not a raw data dump
- Export status must be visible in real time: progress indicator → "Ready to Download" state
- 405 errors on export drain: diagnose and fix CORS/routing issue blocking the endpoint from the frontend
- "Artifact ready" state must be clearly communicated — toast notification when export completes

**Implementation Notes:**
- Investigate the 405 on `export_drain` endpoint — likely a missing CORS header or wrong HTTP method in the route definition
- PDF: use Puppeteer or a server-side HTML-to-PDF renderer; do not attempt client-side PDF generation
- Word: use `docx` npm package for server-side `.docx` generation

---

### SPEC-010 · Profile Ingestion Entry Point

**Severity:** HIGH — P1  
**Surface:** User Profile page  
**Observed:** "Run profile ingestion" is mentioned in the UI but there is no clear trigger path. Live profile shows empty identity card stack with no way to populate it from existing data or upload.

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
- Phase 2: Integrate OpenTimestamps API (`https://opentimestamps.org`) — on artifact creation, submit hash for blockchain anchoring and store the OTS proof in the provenance envelope
- Render provenance in artifact detail view: "Created June 18, 2026 · Anchored to Bitcoin blockchain · Hash: abc123..."

---

### SPEC-012 · Recap Generation — Unbiased Third-Party DI

**Severity:** MEDIUM — P2  
**Surface:** Blackboard Room → Generate Recap  
**Observed:** Billy dominates recap generation, centering his own perspective and missing the full arc of multi-DI conversations. Recap reads as generic and does not reflect what actually happened in the session.

**Behavior Required:**
- Recap generation is handed to a neutral "Archivist" DI — not Billy, not any DI that participated in the session
- The Archivist DI receives the full session transcript (all DI responses + user messages) and generates a true third-person summary
- Recap must name the user and all DIs present — no single voice dominates
- Output: a narrative that reads like a thoughtful observer wrote it, with specific call-outs to notable moments, insight spikes, and unresolved threads
- Billy's voice can be included as a quoted participant — not as the narrator

---

### SPEC-013 · Tribunal Page — DI-to-DI Dialogue

**Severity:** MEDIUM — P2  
**Surface:** Agent Council → rename to Tribunal  
**Observed:** Current Agent Council allows user↔DI roundtable but DIs cannot converse with each other. The "all voices" trigger hits what appears to be a circuit breaker or canned fallback response rather than routing through individual DI endpoints.

**Behavior Required:**
- Rename Agent Council → "Tribunal" across all UI surfaces and routes
- Add a "Council Session" mode: user poses a question, all DIs respond in sequence OR in a moderated back-and-forth
- Add a "DI Debate" mode: user nominates two or more DIs, poses a topic, DIs respond to each other's answers — not just to the user
- Fix the "all voices" circuit breaker: diagnose why sequential DI calls trip a canned fallback and implement proper sequential routing with individual timeouts

---

### SPEC-014 · Orb Graph Visualization — Connection Toggle + UX

**Severity:** MEDIUM — P2  
**Surface:** External Scaffold → Orb Graph  
**Observed:** Connection lines between orbs make it difficult to click individual orbs and visually clutter the graph. No way to toggle connections off.

**Behavior Required:**
- Add a "Show/Hide Connections" toggle in the graph toolbar — off by default when orb count > 15
- Individual orb click should be reliably hittable regardless of line density (increase click target, lower z-index of connection lines)
- Initiate Expansion: should also offer zoom-to-fit and center-selected-orb controls
- Future: explore Babylon.js for 3D graph visualization as a stretch goal

---

### SPEC-015 · Homepage & UI Polish Pass

**Severity:** MEDIUM — P2  
**Surface:** Homepage, Sanctuary cards  
**Observed:** Ember effects minimal (dripping rain appearance, not floating embers). Fog overlay absent on homepage and Sanctuary cards. Neon card edge glow too subtle. Cabin Sketch font missing in Second Sanctuary. Cards fade out unnecessarily.

**Behavior Required:**
- Remove card fade-out on homepage — cards stay visible at all times; replace with subtle glow pulse on hover
- Increase neon glow on card edges: target luminance ~30% higher than current, avoid overblown
- Restore ember effect: upward-floating particles, low density, not downward drip
- Add fog overlay: low-opacity animated fog layer on homepage hero and Sanctuary room cards
- Second Sanctuary cards: apply Cabin Sketch for room names, Geist for descriptive subtext
- Remove "Capture first, collaborate as you go, and organize once the shape is clear" copy for now
- Restore custom loading spinner (Codex removed it — restore from last known good commit)

---

### SPEC-016 · Authentication UX Fixes

**Severity:** MEDIUM — P2  
**Surface:** Login page, session state  
**Observed:** No "show password" toggle. Invalid credentials produce no visible error. Session state inconsistency: chat history visible while logged out. Enterprise welcome copy appeared for standard account.

**Behavior Required:**
- Add show/hide password toggle on login field
- Add "Invalid login credentials" error message on failed login attempt
- Audit session state: ensure chat history, artifacts, and profile data are gated behind auth check
- Remove "Enterprise welcome" / "Collaborator engine is ready when you are" copy from standard user onboarding
- "Behave like it has manners" language: remove entirely from all surfaces

---

## SPEC-017 · Scroll Lock Fix — Long Artifact Cards

**Severity:** MEDIUM — P2  
**Surface:** Dynamic Inner World, Blackboard recap preview  
**Observed:** Long summaries trigger a scroll lock that prevents reaching bottom content.

**Behavior Required:**
- Remove any `overflow: hidden` or `pointer-events: none` applied to scroll containers on long content
- Ensure artifact cards use `overflow-y: auto` with a defined `max-height`
- Test with the longest known artifact (130+ record export)

---

## OPEN QUESTIONS (Require Decision Before Implementation)

**OQ-1 — Supabase Tier:** Free tier is causing export timeouts and bottlenecks. Decision needed: upgrade Supabase plan OR add a testing/staging database on an alternative provider (PlanetScale, Railway, Neon). This blocks SPEC-004 and SPEC-009 reliability at scale.

**OQ-2 — React Flow Migration:** Mermaid fix (SPEC-007) is the immediate unblock. React Flow migration is a larger slice. Is this Sprint 3 or Sprint 4? Recommend Sprint 3 end or Sprint 4 start.

**OQ-3 — OpenTimestamps API Cost:** OpenTimestamps is free for Bitcoin anchoring but has latency (hours to confirm). Is async anchoring acceptable (show "pending blockchain confirmation" then update to "anchored")? Recommend yes.

**OQ-4 — GROQ Agentic Collaborator:** The always-on meta-observer DI (stress-tester, spec-writer, Codex drift detector) was articulated in the June 18th voice note. This is Sprint 4+ work. Noted here to prevent it from being forgotten.

---

## IMPLEMENTATION ORDER (Recommended)

| Priority | Spec | Effort | Blocking |
|---|---|---|---|
| P0 | SPEC-001 | Small | Everything in DIW |
| P0 | SPEC-003 | Medium | All artifact surfaces |
| P0 | SPEC-002 | Small | DIW usability |
| P1 | SPEC-004 | Medium | Recap persistence |
| P1 | SPEC-005 | Trivial | UX trust |
| P1 | SPEC-009 | Large | Export pipeline |
| P1 | SPEC-006 | Medium | Orb workflow |
| P1 | SPEC-008 | Small | CC workflow |
| P1 | SPEC-007 | Medium | Mind map |
| P1 | SPEC-010 | Medium | Profile ingestion |
| P2 | SPEC-011 | Medium | Provenance |
| P2 | SPEC-012 | Medium | Recap quality |
| P2 | SPEC-013 | Large | Tribunal |
| P2 | SPEC-014 | Small | Graph UX |
| P2 | SPEC-015 | Small | Visual polish |
| P2 | SPEC-016 | Small | Auth UX |
| P2 | SPEC-017 | Trivial | Scroll lock |

---

## Validation Protocol

Before marking any SPEC item complete:
1. Run `npm run build` — zero errors
2. Run `git diff --check` — no whitespace violations
3. Manually test the specific observed failure from the walkthrough transcript
4. Confirm no regression on adjacent surfaces (especially: Blackboard, Creation Corner, DIW)
5. If DDL changes were made: run Supabase advisor check for missing RLS policies

---

*This spec is derived from live founder sessions and live repo state as of June 20, 2026. It should be committed to `.perplexity/` or `docs/` and referenced in the next CurrentState.md update.*
"""

output_path = "/root/output/GestaltView_Rectification_SPEC_v1.md"
with open(output_path, "w") as f:
    f.write(spec)

print(f"Spec written: {len(spec)} characters, {spec.count('SPEC-')} spec items")
print(f"Saved to: {output_path}")
