# SPEC: Transcriptory Feature + UX/Workflow Pass
**Date:** 2026-06-09
**Author:** Keith Soyka (voice transcripts) / Perplexity (synthesis)
**Status:** Ready for Codex implementation
**Source material:** `For_SPEC_6_9_26.md` (voice transcript batch) × `docs/CurrentState.md` (live repo state)
**Target repo:** `DigitalConsciousness/gestaltview-v2.0`

---

## Executive Summary

This SPEC covers two parallel tracks derived from Keith's June 8–9 voice monologues, cross-referenced against the live `CurrentState.md`:

**Track 1 — New Feature: The Transcriptory**
A first-class voice-capture and transcript repository feature: upload or record audio → transcribe → accumulate layered personal context → feed into GestaltView's Digital Intelligence system over time.

**Track 2 — UX/Workflow Debt Pass**
A targeted sweep of existing pages and integrations that were called out explicitly in the voice notes and whose gaps align with open items already tracked in `CurrentState.md`.

These two tracks can be implemented in parallel by separate Codex sessions. Track 2 items are largely self-contained UI/integration fixes; Track 1 is a new surface that plugs into the existing capture/ingestion pipeline.

---

## Repo State at Time of This SPEC

Checked against `docs/CurrentState.md` as of 2026-06-09:

| Area | Current State |
|---|---|
| Production deploy | Stalled — last prod deploy May 31. Vercel team-invite wall blocking auto-deploy from `main`. PRs #74 and #75 need to reach prod. |
| Gen-engine / Creation Corner | Routes exist; `/api/gen-engine/artifacts` and `/api/gen-engine/resonance` returned non-OK in most recent pass. Provider cascade (Groq → HuggingFace) unverified in prod. |
| Speech-to-text adapter | Browser default; causing errors. Custom Billy-voice adapter not yet wired. |
| Blackboard Room | Summarization can leak Billy session scaffolding into Creation Corner source material. Filtering added in last pass but not fully verified end-to-end. |
| Agent Council | Canned responses (e.g., "I hear you") surfacing. PersonaATC circuit breaker added; needs UI-level confirmation it is blocking. |
| Codex artifacts → DIW | Mirror worker added in last pass; `innerWorldMirrored` flag exists. Live user test unverified. |
| Homepage | Cards flat; hero lacks tagline and animation. |
| Sanctuary Page | Too clinical; willow tree asset not yet incorporated. Ember personalization not implemented. |
| Musical DNA Page | URI/Spotify dev API variable misconfigured. |
| Voice-to-text (global) | Not consistently implemented across all pages. |

---

---

# TRACK 1 — The Transcriptory Feature

## Problem Statement

Keith's primary capture workflow is: record voice note → upload to Wave for transcription → paste or upload transcript to Perplexity/Codex for analysis. Each step is an external tool hop, and the accumulated context lives nowhere inside GestaltView. Every new session requires re-introducing prior captures from scratch ("the reintroduction tax"). The Transcriptory eliminates this friction by making GestaltView itself the transcription destination, and by threading all captures into the user's growing Digital Intelligence context layer.

## Design Philosophy

Voice notes are bucket drops — multimodal, unsanitized captures that surface thoughts before the user knows how to frame them. The Transcriptory must preserve that rawness. It should never sanitize, reframe, or editorialize the source material without explicit user instruction. The feature's primary job is **faithful capture + accumulating context**, not immediate synthesis.

Layered context is the product. A transcript submitted today becomes richer in the system's interpretation over time as more captures accumulate — not because the system rewrites old transcripts, but because it builds a semantic map of the user's language, domains, and recurring themes that improves future transcription descriptions and summaries.

---

## T1.1 — New Page: Transcriptory

### Route
`/transcriptory`

### Entry Points
- Top-level nav (new item, after Blackboard Room or in Capture cluster)
- Floating action button on Sanctuary Page
- "Send to Transcriptory" action from any capture modal

### Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│  TRANSCRIPTORY                    [Record ●] [Upload ↑]      │
│  Your voice. Accumulated.                                     │
├──────────────────────────────────────────────────────────────┤
│  ACTIVE SESSION (if recording)                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  🔴 Recording — 04:23          [Pause] [Stop + Save]   │  │
│  │  Live waveform visualizer                              │  │
│  └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  TRANSCRIPT LIBRARY                     [Filter ▾] [Search]  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Jun 9 · Transcriptory Concept + NYC Walk   [▸ Open]   │  │
│  │  Duration: 30 min · Themes: Product, ADHD, Workflow    │  │
│  │  Linked to: Blackboard Room · Creation Corner          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Jun 8 · Safety, Trauma, Urban Life            [▸ Open] │  │
│  │  Duration: 22 min · Themes: PTSD, NYC, Self-expression │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Components Required

- `client/src/pages/TranscriptoryPage.tsx` — new page
- `client/src/components/TranscriptoryRecorder.tsx` — audio capture + waveform
- `client/src/components/TranscriptCard.tsx` — individual transcript entry in library
- `client/src/components/TranscriptViewer.tsx` — full transcript with summary panel, action buttons

---

## T1.2 — Audio Upload Flow

### Behavior
1. User clicks **Upload ↑**
2. File picker opens: accepts `.mp3`, `.mp4`, `.m4a`, `.wav`, `.webm`, `.ogg`
3. File uploads to Supabase Storage bucket `transcriptory_audio` under `user_id/timestamp_filename`
4. Upload triggers transcription job (see T1.5)
5. Progress toast: "Transcribing… this may take a moment"
6. On completion: new `TranscriptCard` appears at top of library

### File Size Guidance
Display "Large files (>50MB) may take several minutes" inline in the file picker. No hard block — let the job queue handle it gracefully.

---

## T1.3 — In-App Recording Flow

### Behavior
1. User clicks **Record ●**
2. Browser requests microphone permission (handle denial gracefully with inline instruction)
3. Recording starts: waveform visualizer renders, elapsed timer increments
4. User can **Pause** / **Resume**
5. **Stop + Save** ends recording:
   - Audio blob assembled in browser memory
   - Uploaded to `transcriptory_audio` Supabase bucket
   - Transcription job triggered (same as upload path)
6. While recording is active, page shows the ACTIVE SESSION panel above the library

### Technical Notes
- Use `MediaRecorder` API with `audio/webm;codecs=opus` as preferred MIME; fallback to `audio/ogg`
- Do NOT use browser's default speech recognition (`SpeechRecognition` Web API) — this is the existing bug Keith flagged. Use the custom Billy-voice adapter (see T1.5)
- Chunk recording into 10s blobs and reassemble to handle long sessions without memory pressure

---

## T1.4 — Supabase Schema: Transcriptory

```sql
-- New table: transcriptory_captures
CREATE TABLE transcriptory_captures (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  title        TEXT,
  duration_seconds INTEGER,
  audio_storage_path TEXT,              -- Supabase storage path
  raw_transcript TEXT,                  -- verbatim transcription output
  summary      TEXT,                    -- DI-generated thematic summary
  themes       TEXT[],                  -- extracted theme tags
  linked_captures UUID[],               -- cross-links to other captures
  linked_blackboard_session UUID,       -- optional FK to blackboard sessions
  linked_creation_corner_artifact UUID, -- optional FK to codex_artifacts
  context_weight FLOAT DEFAULT 1.0,     -- accumulating context signal (future use)
  status       TEXT DEFAULT 'pending'  -- pending | transcribing | ready | error
);

-- RLS: users own their own captures
ALTER TABLE transcriptory_captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own captures"
  ON transcriptory_captures
  FOR ALL
  USING (auth.uid() = user_id);
```

Apply as a migration:
```
npm run migrate -- --name=add_transcriptory_captures
```

---

## T1.5 — Transcription Engine

### Preferred Implementation
Use the existing Billy-voice speech-to-text adapter (the one Keith flagged as "the good one" — located in `shared/billy/` or equivalent). If that adapter wraps a Whisper-compatible API endpoint, route audio through it.

### Fallback Chain
1. **Billy adapter** (primary — custom, high-quality)
2. **OpenAI Whisper via Groq** (if Groq env var present) — `POST /api/transcriptory/transcribe`
3. **HuggingFace Whisper** (free tier — if Groq unavailable)
4. **Local browser Web Speech API** — explicitly disabled (the flagged bug). Do not fall through to this.

### API Route
`POST /api/transcriptory/transcribe`
```typescript
// Body: FormData with `file` (audio blob) + `capture_id`
// Returns: { transcript: string, duration_seconds: number, provider: string }
```

After transcription completes:
1. Update `transcriptory_captures` row: `raw_transcript`, `duration_seconds`, `status = 'ready'`
2. Trigger DI summary generation (see T1.6)

---

## T1.6 — Accumulating Context Layer

This is the core differentiator. After each transcript is saved:

1. **Summary generation**: Call gen-engine or LLM router with the raw transcript + user's existing `transcriptory_captures` theme history. Produce:
   - A 2–4 sentence thematic summary
   - A `themes[]` array (domain tags: e.g., "Product", "ADHD", "Workflow", "NYC", "Collaboration")

2. **Context accumulation**: The themes array feeds into a per-user `transcriptory_context_profile` (stored in `agent_memories` or a new `transcriptory_context` table). Over time this profile becomes a semantic fingerprint used by:
   - Future transcription summaries (richer, more domain-aware)
   - Blackboard Room chat (DI can reference recent captures in context)
   - Creation Corner (captures available as source material)

3. **Cross-linking**: After summary, run a lightweight similarity check against other `transcriptory_captures` for this user. Suggest related captures as "linked" entries in the viewer.

### Implementation Notes
- Summary generation should use the same LLM provider cascade as gen-engine (Groq → HuggingFace → local)
- Do NOT pass the full raw transcript to the LLM for summary — truncate to first 8,000 tokens if necessary
- Context accumulation is non-blocking: update themes and links asynchronously after the transcript is ready

---

## T1.7 — Transcript Viewer Panel

When a user opens a transcript card:

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Transcriptory                                    │
│                                                             │
│  Jun 9 · Transcriptory Concept + NYC Walk                   │
│  30 min · Themes: Product, ADHD, Workflow, NYC              │
│                                                             │
│  ┌─ SUMMARY ──────────────────────────────────────────────┐ │
│  │  Keith introduces the Transcriptory feature concept... │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ RAW TRANSCRIPT ───────────────────────────────────────┐ │
│  │  [Scrollable verbatim text with timestamps]            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ ACTIONS ──────────────────────────────────────────────┐ │
│  │  [Send to Blackboard] [Send to Creation Corner]        │ │
│  │  [Copy Transcript] [Download .txt] [Delete]            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ LINKED CAPTURES ──────────────────────────────────────┐ │
│  │  Jun 8 · AI Workflows (similarity: 87%)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Send to Blackboard** — injects the transcript summary + raw text as a context packet into the current or a new Blackboard Room session (same mechanism as existing bucket drop / capture injection).

**Send to Creation Corner** — passes summary + selected raw text as `freeText` source material to `CreationCornerPage.tsx` (see T2.4 for the anti-flattening requirement).

---

## T1.8 — Nav Integration

Add "Transcriptory" to the primary navigation:

- **Desktop**: Add to left sidebar nav between Blackboard Room and Creation Corner
- **Mobile**: Add to bottom tab bar or hamburger menu
- **Icon**: Microphone + document overlap (or a waveform-to-text icon)
- **Route**: `/transcriptory`

Register in `client/src/App.tsx` router.

---

---

# TRACK 2 — UX/Workflow Debt Pass

## T2.1 — Homepage: Hero Animation + Tagline

**File:** `client/src/pages/` (homepage component, check App.tsx for exact route)

**Changes:**
1. Add the tagline under the hero:
   > *You don't have to know where you're going. Just know you're not alone in getting there.*
   - Font: soft cursive (suggest `Dancing Script` or `Pacifico` via Google Fonts at `--text-xl` scale)
   - Style: subtle traveling gradient animation (keyframe left-to-right gradient shift on the text using `background-clip: text`)

2. Add a dynamic hero animation behind or alongside the main hero element:
   - Floating ember particles (use existing ember system from Agent Council Page if available, or a lightweight CSS particle implementation)
   - Keep subtle — ambiance, not distraction
   - Must respect `prefers-reduced-motion`

3. Cards on homepage are "flat" — add `box-shadow: var(--shadow-sm)` and a `:hover` elevation to `var(--shadow-md)` with a `transform: translateY(-2px)` transition.

---

## T2.2 — Sanctuary Page: Nature Graphics + Ember Personalization

**File:** `client/src/pages/SanctuaryPage.tsx`

**Changes:**
1. Import/integrate the willow tree graphic Keith generated via Notebook LM. (Keith has this asset — prompt him for the file path or URL before implementing. If unavailable, generate a comparable SVG glowing willow tree inline.)

2. Add ember particle background (same system as ACP or homepage) with user-controllable ember color:
   - Color picker or preset swatches (3–5 options) persisted to `agent_memories` or Supabase user profile
   - Default: warm amber

3. Remove or de-emphasize clinical whitespace. Add organic texture — consider a subtle SVG noise filter overlay (`feTurbulence` at `opacity: 0.03`) on the background surface.

4. Ensure every chat/journal input on Sanctuary has voice-to-text enabled (see T2.6 for the speech adapter fix).

---

## T2.3 — Agent Council Page: Ember Embers + Anti-Canned-Response Confirmation

**File:** `client/src/pages/AgentCouncilPage.tsx` (and `client/src/lib/PersonaATC.ts`)

**Changes:**
1. Add electric neon floating embers visual layer to ACP. These should be neon-tinted (cyan/electric blue/magenta), distinct from the warm amber embers on Sanctuary and Homepage. This creates per-page visual identity.

2. Confirm PersonaATC circuit breaker is actively blocking canned responses before they reach the council transcript. Add a visible (but unobtrusive) indicator when a response is blocked:
   - Small `⚡ Response filtered` badge inline in transcript, styled as a muted system message
   - NOT a toast — inline, contextual

3. **Eliminate "I hear you"** and all similar therapeutic-validation openers from any persona's response. The `PersonaATC.ts` flag list should include at minimum:
   - `"I hear you"`
   - `"I understand how you feel"`
   - `"That must be really hard"`
   - `"It sounds like you're feeling"`
   - `"I'm here for you"` (as a standalone opener)
   Add these to the blocklist in `PersonaATC.ts`.

4. **Session Recap generation**: Add a "Generate Session Recap" button at the end of a council session. This produces a summary of the council exchange and stores it. Add a "Send Recap to Creation Corner" action on the resulting recap.

---

## T2.4 — Blackboard Room: Embodiment Profile Dropdown + ACP Portal Button

**File:** `client/src/pages/BlackboardRoomPage.tsx`

**Changes:**
1. Add an **Embodiment Profile selector** dropdown at the top of the Blackboard Room chat panel. Populates from existing embodiment profiles. Persists selection per session. When a profile is selected, it injects the profile context into the DI prompt for that session (same mechanism as existing embodiment injection, just surfaced in the UI).

2. Add a **"Open Agent Council"** button (or icon-link) in the Blackboard Room header bar. Opens ACP — either as a new tab/route push or as a side-panel overlay. Preserves current Blackboard session state when navigating away.

3. Verify (and fix if still needed) that `summarizeMessages()` and `buildSummaryBlueprint()` exclude:
   - Billy preamble / opening companionship scaffolding lines
   - Offline fallback messages (`"Local fallback is active…"`)
   - Any turn matching PersonaATC's blocklist
   This was addressed in the last CurrentState pass — confirm the filtering is active end-to-end and add a test if one doesn't exist.

---

## T2.5 — Creation Corner: Fix freeText Source Injection

**File:** `client/src/pages/CreationCornerPage.tsx`

**Problem (from CurrentState.md):** Creation Corner was passing a stringified `CaptureBlueprint` JSON object when `freeText` was empty, causing the LLM to receive template-shaped language as if it were user-authored content.

**Fix:**
1. When `freeText` is empty or whitespace-only, do NOT stringify the blueprint as a fallback. Instead, either:
   a. Prompt the user to add source material before forging, OR
   b. Send only the explicit fields that contain human-authored language (title, description, any user-typed notes)

2. Never pass JSON object literals as the `freeText` parameter. If the blueprint needs to travel to the LLM, it must be serialized into a human-readable prose summary first.

3. Add a **"Source Preview"** panel in Creation Corner that shows exactly what text will be sent as source material before the user hits Forge. This surfaces the bug visually and lets the user correct it before generation.

4. Transcriptory integration: when a transcript is sent to Creation Corner via "Send to Creation Corner" (T1.7), it arrives as clean `freeText` (summary + selected raw text), not a blueprint object.

---

## T2.6 — Speech-to-Text Adapter: Bypass Browser Default

**Files:** Speech adapter location — likely `shared/billy/` or a client-side hook. Confirm exact path before editing.

**Problem:** The browser's default `SpeechRecognition` Web API is producing errors across journal, Blackboard Room, and other inputs that have voice-to-text enabled (or should have it enabled).

**Fix:**
1. Locate the existing custom Billy-voice speech adapter. Confirm it is the one Keith described as "the good one."
2. Replace all usages of `window.SpeechRecognition` / `window.webkitSpeechRecognition` with the custom adapter.
3. The adapter should be encapsulated as a React hook: `useSpeechToText()` — returns `{ transcript, isListening, startListening, stopListening, error }`.
4. Apply `useSpeechToText()` consistently across:
   - Blackboard Room chat input
   - Sanctuary journal input
   - Creation Corner freeText input
   - Transcriptory recorder (T1.3)
   - Any other page-level chat or text input
5. Handle microphone permission denial gracefully: show an inline prompt ("Microphone access is needed for voice input — please allow it in your browser settings") rather than a silent failure.

---

## T2.7 — Musical DNA Page: Spotify URI Fix

**File:** Musical DNA page component (confirm exact path in repo).

**Problem:** Spotify dev API URI configuration is misconfigured. Keith has the correct values set up in the Spotify Developer Dashboard but the wrong Vercel environment variable name is being referenced.

**Fix:**
1. Confirm the exact Vercel env var name for the Spotify redirect URI (likely `VITE_SPOTIFY_REDIRECT_URI` or `SPOTIFY_REDIRECT_URI`).
2. Cross-reference against the value set in the Spotify Developer Dashboard for the registered app.
3. Ensure the redirect URI is whitelisted in the Spotify app settings AND matches the value in the env var exactly (including trailing slash, if any).
4. Add a `console.warn` in dev mode if the env var is missing or obviously wrong (e.g., localhost URI in production).

**Note for Codex:** Do not hardcode the URI value. Name the variable and instruct Keith to confirm the value from his Spotify dashboard.

---

## T2.8 — Global Voice-to-Text Audit

Every page with a text input or chat interface must have voice-to-text. This is not optional — it is a core accessibility requirement and a product principle.

**Audit checklist (confirm each has `useSpeechToText()` wired):**
- [ ] `BlackboardRoomPage.tsx` — chat input
- [ ] `SanctuaryPage.tsx` — journal input + chat input
- [ ] `CreationCornerPage.tsx` — freeText input
- [ ] `TranscriptoryPage.tsx` — recorder (new, T1.3)
- [ ] `AgentCouncilPage.tsx` — any user input field
- [ ] `DynamicInnerWorldPage.tsx` — if any text input present
- [ ] `ExternalScaffoldPage.tsx` — if any text input present
- [ ] Notebook/journal pages — all inputs

For each missing instance, wire `useSpeechToText()` and add the microphone icon button adjacent to the input field.

---

---

# Acceptance Criteria

## Track 1: Transcriptory
- [ ] `/transcriptory` route exists and renders in production
- [ ] User can upload an audio file and receive a transcript in the library
- [ ] User can record audio in-browser and receive a transcript in the library
- [ ] Browser default `SpeechRecognition` is not used anywhere in the transcription path
- [ ] Transcripts are stored in `transcriptory_captures` Supabase table under the correct `user_id`
- [ ] RLS is active — users cannot read each other's captures
- [ ] Each completed transcript has a DI-generated summary and at least one theme tag
- [ ] "Send to Blackboard" and "Send to Creation Corner" actions work end-to-end
- [ ] Transcriptory appears in nav (desktop sidebar and mobile nav)
- [ ] `docs/CurrentState.md` updated to record Transcriptory as implemented

## Track 2: UX Pass
- [ ] Homepage has the tagline in soft cursive with traveling gradient
- [ ] Homepage cards have hover elevation
- [ ] Sanctuary Page has willow tree graphic and ember color personalization
- [ ] ACP has electric neon embers and filtered canned responses with inline badge
- [ ] "I hear you" and equivalent phrases are blocked in PersonaATC
- [ ] Session Recap generation exists on ACP with "Send to Creation Corner" action
- [ ] Blackboard Room has Embodiment Profile dropdown
- [ ] Blackboard Room has "Open Agent Council" button
- [ ] Creation Corner does not send JSON blueprint as freeText under any condition
- [ ] Creation Corner has Source Preview panel
- [ ] All voice inputs use custom Billy adapter, not browser default
- [ ] Musical DNA page Spotify URI misconfiguration is resolved or instructions provided for Keith to confirm the env var value
- [ ] All page inputs audited for voice-to-text coverage
- [ ] `docs/CurrentState.md` updated after each completed workstream

---

# Validation Commands

After each implementation slice, run:

```bash
npx tsc --noEmit
npm run build
npx vitest run
npm run sync:perplexity
```

For Transcriptory specifically, also verify:
```bash
# Confirm new table exists
# (run in Supabase dashboard SQL editor or via MCP)
SELECT COUNT(*) FROM transcriptory_captures;

# Confirm RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'transcriptory_captures';
```

---

# Open Questions for Keith to Confirm Before Codex Starts

1. **Willow tree asset** — Where is the Notebook LM–generated willow tree graphic? File path, URL, or can you re-export it?
(Answer: Pending)
2. **Billy speech adapter location** — Confirm exact file path of the custom adapter ("the good one").
(Answer: billy_voice)
3. **Spotify URI** — What is the exact redirect URI registered in your Spotify Developer Dashboard for this app?
(Answer: https://gestaltview-v2-0-nine.vercel.app/spotify/callback)
4. **Transcriptory in nav** — Should it appear in the primary nav immediately, or start as a feature behind a flag until it's fully tested?
(Answer: Immediate)
5. **Transcriptory audio storage** — Are you okay with audio files persisting in Supabase Storage long-term, or should there be a cleanup policy (e.g., delete raw audio after 30 days, keep transcript)?
(Answer: transcriptory_audio_files storage bucket in Supabas)
---

# `docs/CurrentState.md` Entry to Append After This SPEC Is Accepted

```markdown
---

# CurrentState — SPEC: Transcriptory + UX Pass (2026-06-09)

**Last updated:** 2026-06-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Spec-only. No code changes. Captures the Transcriptory feature concept from Keith's June 8–9 voice monologues and cross-references with open UX/workflow items from prior CurrentState entries into a single actionable Codex SPEC.

## New feature added to backlog
- **Transcriptory** (`/transcriptory`) — voice upload/record → transcription → accumulating context repository. See `SPEC_Transcriptory_And_UX_Pass_6_9_26.md`.

## UX debt items captured
- Homepage tagline + hero animation
- Sanctuary willow tree + ember personalization
- ACP neon embers + canned response blocking confirmation + Session Recap
- Blackboard Room embodiment profile dropdown + ACP portal button
- Creation Corner freeText JSON bug fix + Source Preview panel
- Global speech adapter audit (bypass browser default)
- Musical DNA Spotify URI fix
- Global voice-to-text coverage audit

## Follow-up
- Keith to answer 5 open questions before Codex starts (see SPEC)
- After Codex completes Track 1: run `npm run sync:perplexity` and append a new CurrentState entry
- After Codex completes Track 2: same
```
