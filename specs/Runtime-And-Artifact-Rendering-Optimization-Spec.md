# GestaltView v2.0 — Runtime & Artifact Rendering Optimization Spec
**Version:** 1.0
**Date:** June 21, 2026
**Source:** Skill-Suite-for-AI.pdf (Founder Notes → Implementation Translation)
**Repo:** DigitalConsciousness/gestaltview-v2.0
**Status:** READY FOR IMPLEMENTATION

---

## Purpose & Scope

This specification translates the founder's notes on Optimizing GestaltView Runtime and Artifact Rendering into actionable requirements and implementation steps for the `gestaltview-v2.0` repository. It draws on the existing room definitions, session recap API, runtime guide, and design principles within the repository to ensure continuity with the current platform while addressing four core pain points:

1. Outdated documentation
2. Clutter in the Dynamic Inner World
3. Inconsistent artifact rendering
4. Insufficient orchestration of multiple Digital Intelligences (DIs)

**Goal:** Deliver a deterministic, evidence-linked workflow where only finished, high-quality artifacts surface to users and where the experience feels warm and immersive rather than chaotic.

---

## Background

GestaltView is organized into three fundamental modes:

| Mode | Name | Description |
|---|---|---|
| Mode 1 | Active / Contextual | Raw capture — Blackboard Room |
| Mode 2 | Accumulated / Structural | Passive accumulation — External Scaffold |
| Mode 3 | Distilled / Reflective | Synthesis — Dynamic Inner World (Museum of You) |

The runtime flows in a single direction: **Active Work → Scaffold → Dynamic Inner World**. The Blackboard Room is the capture surface; the External Scaffold passively accumulates nodes; the Dynamic Inner World synthesizes those nodes into interactive exhibits; and Creation Corner exports finished work. Billy guides users through this workflow and protects capture integrity.

**Two critical issues observed in real use:**

1. **Clutter and unrendered content in the Dynamic Inner World:** Unrendered summaries, raw JSON, and incomplete mind-maps leak from the Blackboard Room directly into the museum. This violates the causal pipeline (nothing from Mode 1 should surface in Mode 3 unless intentionally routed) and makes the museum feel cluttered and unpolished.

2. **Inconsistent rendering and DI orchestration:** Recaps and summaries vary in quality; minimal mind-maps are produced when the wrong DI is assigned; error messages appear in the UI; and there is no way for users to choose which DI provides a recap.

---

## Section 1 — Updated Runtime Rules

### Rule 1.1 · Enforce the Causal Pipeline

The runtime must preserve the one-way flow: **Active Work → Scaffold → Dynamic Inner World**.

- No raw captures or summaries from the Blackboard Room may be injected into the Dynamic Inner World
- Session artifacts enter the museum only through explicit triggers (e.g., `SessionRecapGenerator` or publishing via Creation Corner)
- The AI Orchestrator is the **only** authorized source of Dynamic Inner World writes

### Rule 1.2 · Define "Finished Artifact"

An artifact is **finished** when it meets the HTML-based shape described in the recap spec:

- Interactive and visually rich
- Contains all four required sections: *What we built*, *What emerged*, *What's still in motion*, *Worth holding*
- Rendered with Neural Aurora aesthetics (`#0a0a0f` background, cyan `#12D6FF`, violet `#BF00FF`)

Only finished artifacts are eligible for museum placement.

### Rule 1.3 · Unified Markdown Rendering

The rendering pipeline must convert **all** markdown or plain-text outputs into HTML before surfacing them. Requirement #5 in the recap API forbids leaving markdown syntax in the final artifact. This rule is elevated to a **runtime-wide constraint**.

- All user-facing text surfaces render via consistent renderer (ReactMarkdown or equivalent)
- Mermaid diagrams render as actual diagrams — never as raw code strings
- Downloaded files: wrap in HTML shell with embedded CSS — never deliver raw `.md` to user without disclosure
- Internal warning strings (e.g., `[FLATTENING LANGUAGE DETECTED]`) are stripped from all user-facing output paths

### Rule 1.4 · Artifact Provenance Tagging

Every artifact must carry metadata indicating its origin. Required fields:

- `origin_room` — which room produced it
- `source_di` — which DI generated it
- `created_at` — ISO 8601 timestamp
- `context_nodes` — count of connected Scaffold nodes
- `content_hash` — SHA-256 of content at creation time
- `session_id` — originating session

The `InnerWorldArtifactGallery` component already presents these fields; this pattern must be reused in the new Artifact Gallery for staging.

---

## Section 2 — Artifact Lifecycle & the Artifact Gallery

### 2.1 · Introduction of an Artifact Gallery

The **Artifact Gallery** acts as an intermediate staging area between Mode 1 and Mode 3. It accepts raw or partially rendered outputs from the Blackboard Room, Creation Corner, and other rooms — but does **not** display them in the museum. Users can review, manage, delete, or request rendering of these items.

**Artifact Status States:**

| Status | Meaning |
|---|---|
| `queued` | Newly created, awaiting rendering |
| `rendering` | Sent to the rendering pipeline |
| `failed` | Rendering error occurred |
| `ready` | Finished — eligible for museum promotion |

**Key behaviors:**

- **Queueing & status:** Newly created artifacts enter the gallery with status `queued`
- **Manual promotion:** Only artifacts marked `ready` may be promoted to the Dynamic Inner World via explicit UI action ("Publish to Museum")
- **Batch operations:** Provide bulk delete and bulk promote actions
- **Metadata & provenance:** Show origin room, DI, date, and context nodes — same pattern as `InnerWorldArtifactGallery`

### 2.2 · Rendering Pipeline Improvements

The rendering pipeline must be overseen by an orchestration layer — the **Render Supervisor** — that ensures only fully rendered outputs are published.

**Render Supervisor responsibilities:**

1. **Centralize build logic:** Move recap prompt construction from client side into the server (`api/sessionRecap.ts` already begins this). All aesthetic requirements, section headings, interactive elements, and typography must be defined in one place. No client-side calls to specific providers.

2. **Detect incomplete outputs:** Implement validations before marking an artifact `ready`:
   - Check for presence of required HTML tags
   - Verify all four required sections exist
   - Confirm absence of raw markdown syntax
   - Confirm no internal warning strings in output

3. **Standardize formats:**
   - HTML container → canonical format for museum artifacts
   - PDF / MD / DOCX → downloadable attachments
   - Images → for diagrams and mind-maps

4. **Fail-safe gating:** If the LLM returns raw JSON or a code block instead of HTML:
   - Mark artifact as `failed`
   - Record the error internally (never display to user)
   - Provide a **"Retry rendering"** action that triggers a new attempt
   - Allow manual editing before re-queuing

---

## Section 3 — Digital Intelligence (DI) Orchestration

### 3.1 · Assigning the Right DI to Each Content Type

The orchestrator must assign tasks to the most suitable DI based on content type. The DI Skill Suite maps output categories to specific model orientations (GPT, Gemini, Claude):

| Output Category | Recommended Model | Rationale |
|---|---|---|
| Rich Rendering / Interactive HTML | Claude | Writing quality, HTML structure |
| Documents / Long-form Narrative | Claude | Writing quality |
| Code / Data Analysis | GPT | Built-in interpreter |
| Creative / Poetic / Metaphoric | Claude | Nuance and voice |
| Visual / Diagram description | Gemini | Multimodal strength |
| Data / Analysis / Structured | GPT | Reasoning and precision |
| Context-Aware / Conversational | Claude | Contextual continuity |

Incorporate this mapping into the orchestrator so recap prompts and rendering tasks are routed to the DI best equipped to handle the content.

### 3.2 · User-Selectable Recap Voices

Users should be able to choose which DI synthesizes a recap.

- Add a DI selector to the Blackboard Room
- Default to an agnostic summarizer ("Recap DI")
- Allow selection of a specific DI for personalized tone
- Orchestrator calls the selected DI via the existing `llmRouter`
- DI signature is embedded in the artifact metadata

### 3.3 · Multi-Agent Processing Feedback (Tribunal)

Replace the static three-dot loader in the Tribunal with a rich animation that explains which DI is processing and in what sequence.

**Required behavior:**
- Show which DI is currently processing
- Show processing sequence (e.g., "Billy → The Architect → The Curator...")
- Use animated icons or avatars to represent each DI
- Progress indicator shows aggregation across multiple voices
- Each DI's response must be clearly labeled
- Overlapping error messages must not be displayed — errors caught by orchestrator, logged silently, retry offered to user

### 3.4 · Auto-Retry on Canned / Blocked Responses

- If a DI returns a canned fallback response, automatically retry with exponential backoff (max 3 attempts per DI)
- Silent retry — no user-facing error during retry window
- Only show a polite retry message when all attempts fail
- Fallback chain: if primary DI exhausts retries → route to a fallback DI of the same content-type category
- Do not expose internal error strings (e.g., `[canned fallback detected]`) to the user under any circumstances

---

## Section 4 — Session Recap & Summaries

### 4.1 · Server-Side Prompt Centralization

- Continue centralizing recap prompt within `api/sessionRecap.ts`
- Remove any client-side calls to specific providers
- Environment-based provider selection
- Accept a `di` parameter to choose the rendering DI

### 4.2 · Interactive HTML Spec Adherence

Recaps must always include:
- All four required sections (*What we built*, *What emerged*, *What's still in motion*, *Worth holding*)
- Interactive elements
- Neural Aurora aesthetics
- Timeline bar if timestamps are available
- `@import` for specified fonts

### 4.3 · Synthesis Quality Controls

Extend the recap generator to summarize not just captures but also:
- Mind-maps
- Diagrams
- Documents

Pass additional capture metadata into the prompt. Use the DI mapping (Section 3.1) to ensure the right model processes each capture type.

### 4.4 · Summaries vs. Recaps

| Type | Format | Default Location | Museum Eligible |
|---|---|---|---|
| Summary | Lightweight, non-interactive | Artifact Gallery | No |
| Recap | Full interactive HTML | Artifact Gallery → Museum | Yes (when `ready`) |

### 4.5 · Evidence Links

Recaps must include "show evidence" drill-downs that link back to the original Scaffold nodes or captures. Every identity claim must be evidence-linked.

---

## Section 5 — UI / UX & Atmosphere Enhancements

### 5.1 · Neural Aurora Aesthetic

Apply consistently across the runtime:

- **Color palette:** `#0a0a0f` background, cyan `#12D6FF`, violet `#BF00FF`
- **Cards:** subtle pulsating neon borders (hover: ~30% higher luminance, not overblown)
- **Fog overlay:** low-opacity animated fog layer on homepage hero and Sanctuary room cards — lightweight, swirling, does not obscure content
- **Ember effect:** upward-floating particles, low density
- **Cabin Sketch** for room names in Second Sanctuary; **Geist** for descriptive subtext
- All animations must have a reduced-motion fallback (`useReducedMotion` hook already exists in artifact gallery component)

### 5.2 · Dynamic Inner World Surfaces

- Respect the museum specification: artifacts are placed **in space**, not in a grid
- Implement the six-surface room renderer (0..1 coordinate placement for artifacts)
- Provide drag-and-drop placement
- Provide a timeline slider for navigation
- Curator DI selection for museum voice narration

### 5.3 · Top-Level Navigation

Consolidate navigation into a consistent bar with icons and labels for:

- Sanctuary
- Blackboard Room
- External Scaffold
- Dynamic Inner World
- Creation Corner
- Artifact Gallery *(new)*
- Tribunal

Avoid developer terminology. Follow the design system's emphasis on friendly, legible copy.

### 5.4 · Error Handling

- Replace generic error banners (e.g., `"canned response blocked"`) with gentle toasts or inline messages
- Errors from LLM providers are caught by the orchestrator and logged silently
- UI offers a retry action — never exposes internal error messages

### 5.5 · Accessibility

- Maintain accessible color contrast across Neural Aurora palette
- Keyboard navigation and ARIA labels on all interactive elements
- Voice narration in the museum has captions and can be toggled
- Motion-reduced variants for all animations

---

## Section 6 — Implementation Plan

### Phase 1 · Documentation & Contracts

1. **Update Runtime Guide:** Revise `client/src/lib/billy-runtime-guide.ts` and `docs/ROOM_DEFINITIONS.md`
   - Emphasize the one-way pipeline
   - Define the Artifact Gallery
   - Clarify that only finished artifacts enter the museum

2. **Add Artifact Status Schema:** Define a TypeScript `ArtifactStatus` enum:
   ```typescript
   type ArtifactStatus = 'queued' | 'rendering' | 'ready' | 'failed';
   ```
   Extend `InnerWorldArtifactRecord` to include `status` and `originDiId` fields. Update Supabase schema accordingly.

3. **Write API docs:** Create `docs/artifact-lifecycle.md` describing gallery API endpoints:
   - `POST /api/artifacts` — enqueue artifact
   - `PATCH /api/artifacts/:id` — update status
   - `GET /api/artifacts` — list by status

---

### Phase 2 · Backend Services

1. **Artifact Gallery API:** Implement `api/artifacts.ts` (Vercel serverless) with full CRUD operations. Use `captureRouting.ts` seam for persistence.

2. **Render Supervisor Worker:** Create `server/renderSupervisor.ts`
   - Watches the gallery queue
   - Calls recap generator or other renderers
   - Validates outputs against HTML spec
   - Updates artifact status

3. **Update `sessionRecap.ts`:**
   - Fix interface syntax TODOs
   - Accept `di` parameter for rendering DI selection
   - Ensure function returns only HTML

4. **Supabase migrations:** Add tables/fields for:
   - `artifacts` (with status, provenance fields)
   - `identity_claims`
   - `curator_profiles`
   - `artifact_statuses`

---

### Phase 3 · Front-End Components

1. **Artifact Gallery UI:** Build `client/src/pages/ArtifactGalleryPage.tsx`
   - Design patterns match `InnerWorldArtifactGallery`
   - Status filters
   - Bulk actions (delete, promote)
   - Promotion controls ("Publish to Museum")

2. **Revamped Dynamic Inner World:**
   - Spatial museum with drag-and-drop
   - Timeline bar
   - Curator DI selection
   - Six-surface renderer integration

3. **Blackboard Room Enhancements:**
   - Remove the redundant "all voices" dropdown below Babylon animation
   - Add recap DI selector (defaults to "Recap DI", user-selectable)
   - Add Tribunal portal card
   - Add "Send to Gallery" button for captures and quick summaries
   - Move DI selection inline with the chat input row (per-message dropdown)

4. **Tribunal Animations:**
   - Replace three-dot loader with contextual DI processing animation
   - Show DI avatars/icons with processing state
   - Show sequence and progress across multiple voices
   - Auto-retry on blocked responses (silent, max 3 attempts)

5. **Home & Sanctuary Atmosphere:**
   - Neon glow + fog overlays via CSS keyframes and `filter: blur()`
   - Setting in `SettingsPage` to toggle fog/animations
   - Restore custom GestaltView loading spinner (was silently removed by Codex)

---

### Phase 4 · Orchestrator & DI Integration

1. **DI Skill Suite integration:** Import category→DI mapping. Implement routing logic in orchestration layer — select DI based on content type when synthesizing or rendering.

2. **Recap voice selection:** Persist the user's chosen recap DI per session. Include DI signature in artifact metadata.

3. **Error & retry logic:**
   - Centralize error handling
   - Auto-retry with fallback DI on canned response or failure
   - Only show polite message to user when all retries fail
   - Never expose internal error strings

---

### Phase 5 · Validation & QA

1. **Unit tests:**
   - Render supervisor (detecting incomplete HTML)
   - Artifact status transitions
   - DI routing
   - API endpoints

2. **End-to-end tests (Cypress or Playwright):**
   - Simulate: capture → recap → gallery management → museum promotion
   - Assert: raw captures never appear in the museum

3. **User testing:**
   - Qualitative sessions with neurodivergent users per design spec
   - Verify neon glow/fog atmosphere and multi-agent animations improve comprehension and engagement

---

## Validation Protocol

Before marking any item complete:

1. Run `npm run build` — zero errors
2. Run `git diff --check` — no whitespace violations
3. Manually test the specific failure scenario
4. Confirm no regression on adjacent surfaces (Blackboard, Creation Corner, DIW, Tribunal)
5. If DDL changes: run Supabase advisor check for missing RLS policies

---

## Cross-Reference with RectificationSpec_v1.md

| This Spec | RectificationSpec_v1 | Overlap |
|---|---|---|
| Section 1.1 (Causal pipeline) | SPEC-001 | Same root issue — auto-routing to DIW |
| Section 1.3 (Unified rendering) | SPEC-003 | Raw markdown must never reach users |
| Section 2.1 (Artifact Gallery) | SPEC-006 (partial) | Staging and batch operations |
| Section 3.3 (Tribunal animation) | SPEC-013, SPEC-015 | Multi-agent feedback + animation restore |
| Section 3.4 (Auto-retry) | SPEC-013 | Circuit breaker fix for sequential DI calls |
| Section 4 (Recap) | SPEC-012 (Archivist DI) | Neutral recap generator |
| Section 5.1 (Atmosphere) | SPEC-015 | Homepage visual polish |
| Phase 3.3 (Blackboard cleanup) | SPEC-013 | Remove all-voices dropdown |

---

*This spec was derived from Skill-Suite-for-AI.pdf (June 21, 2026). Cross-reference with RectificationSpec_v1.md (June 20, 2026) before implementation to avoid duplicate work. Both specs are additive — this one covers rendering pipeline and artifact lifecycle in greater depth.*
