# GestaltView v2.5 — Runtime UX Spec & Regression Protocol
**Version:** 1.0  
**Date:** 2026-05-26  
**Author:** Keith (voice transcript → formalized by AI assistant)  
**Scope:** Blackboard Room, Creation Corner, External Scaffold, Profile Page  
**Primary Device:** Samsung Galaxy A35 (mobile-first mandate)  
**Codex Task:** Bug walkthrough, fused-input implementation, persona environment system, no-blueprint entry, regression protocol

---

## 0. HOW TO USE THIS DOCUMENT

This is simultaneously a **spec** (what each room is supposed to be) and a **to-do list** (what's broken, missing, or regressing). Every room has:

- **Room State Badge** — the current stability level. DO NOT regress a room past its current badge without Keith's explicit approval.
- **Intent** — what the room is for in plain language.
- **Reads From / Feeds Into** — data pipeline relationships.
- **Active Bugs** — specific, code-grounded issues to fix.
- **Implementation Tasks** — concrete things to build or change.
- **Mobile Checklist** — must all be ✅ before the room can advance to STABLE.
- **Regression Guards** — the specific behaviors that must NEVER break.

---

## 1. ROOM STATE PROTOCOL (GLOBAL)

Every room in GestaltView carries one of four state levels. This is the anti-regression contract.

| State | Badge | Meaning |
|---|---|---|
| `DIRECTION` | 🟡 | Room is going the right way. Core concept is right, some things are broken or incomplete. Safe to touch. |
| `GOOD_FOR_NOW` | 🟢 | Room is working well enough to use. DO NOT regress without approval. Improvements are fine; removals are not. |
| `UNSTABLE` | 🔴 | Room is broken or being overhauled. Not user-facing. Everything is up for grabs. |
| `LOCKED` | 🔒 | Room is finalized for this sprint. No changes without Keith's voice approval. |

### Implementation: `roomState.ts`

Create the file `client/src/lib/roomState.ts`:

```ts
export type RoomStability = "UNSTABLE" | "DIRECTION" | "GOOD_FOR_NOW" | "LOCKED";

export interface RoomStateEntry {
  slug: string;
  label: string;
  stability: RoomStability;
  mobileChecked: boolean;
  captureChecked: boolean;
  notes: string;
  lastUpdated: string; // ISO date
}

export const ROOM_STATES: Record<string, RoomStateEntry> = {
  "blackboard-room": {
    slug: "blackboard-room",
    label: "Blackboard Room",
    stability: "DIRECTION",
    mobileChecked: false,
    captureChecked: false,
    notes: "Beautiful look. Capture and chat are split — needs fusion. Companion panel needs to become a mirror/inspector, not a second input. Persona env shift not yet implemented.",
    lastUpdated: "2026-05-26",
  },
  "creation-corner": {
    slug: "creation-corner",
    label: "Creation Corner",
    stability: "DIRECTION",
    mobileChecked: false,
    captureChecked: false,
    notes: "Art teacher copy is right. BlueprintGenerativeWorkbench blocks when blueprint=null — must open as a freeform conversation instead. Blueprint is one entry point, not the only one.",
    lastUpdated: "2026-05-26",
  },
  "external-scaffold": {
    slug: "external-scaffold",
    label: "External Scaffold",
    stability: "DIRECTION",
    mobileChecked: false,
    captureChecked: false,
    notes: "Previous design was better — do not invent a new one without reviewing prior version. Link mode works on desktop. All orb actions must be reachable via tap. No keyboard-only shortcuts.",
    lastUpdated: "2026-05-26",
  },
  "profile": {
    slug: "profile",
    label: "Profile Page",
    stability: "UNSTABLE",
    mobileChecked: false,
    captureChecked: false,
    notes: "Needs to become a visual representation of what has been curated and kept safe. Summaries, compacted capture clusters, visual identity. Not just form fields.",
    lastUpdated: "2026-05-26",
  },
};

export function getRoomState(slug: string): RoomStateEntry | null {
  return ROOM_STATES[slug] ?? null;
}
```

Add a `<RoomStateBadge slug="blackboard-room" />` component that renders the badge in each room header. This is informational for Keith only — it does not need to be user-visible in production.

---

## 2. MOBILE-FIRST MANDATE

**Device under test:** Samsung Galaxy A35  
**Viewport:** ~360–393px wide  
**Input method:** Touch only — no hardware keyboard, no hover, no mouse

### Global Mobile Rules (apply to ALL rooms)

Every room MUST satisfy all of these before its stability can advance to `GOOD_FOR_NOW`:

- [ ] All interactive elements have a minimum tap target of 44×44px
- [ ] No action is *only* reachable via keyboard shortcut — every shortcut has a visible tap equivalent
- [ ] No action is *only* reachable via hover state
- [ ] Input fields and textareas are large enough to type into without zooming
- [ ] Sticky input elements remain accessible when the virtual keyboard is open (use `dvh` units or `visualViewport` listener)
- [ ] Heavy Babylon.js / WebGL visuals degrade gracefully — if frame rate drops below ~30fps, the canvas dims or collapses to a static gradient; it does not block interaction
- [ ] Drawers, modals, and bottom sheets scroll internally without bouncing the page
- [ ] File upload works via the native file picker (no drag-and-drop only paths)
- [ ] Voice recording (mic button) works on Android Chrome

### Implementation note

In `BabylonHeroCanvas` and `BabylonAtmosphere`, add a frame rate monitor:

```ts
let lowPerfStrikes = 0;
engine.runRenderLoop(() => {
  if (engine.getFps() < 28) {
    lowPerfStrikes++;
    if (lowPerfStrikes > 90) { // ~3 seconds of low FPS
      engine.stopRenderLoop(); // collapse to CSS background
    }
  } else {
    lowPerfStrikes = 0;
  }
  scene.render();
});
```

---

## 3. BLACKBOARD ROOM

**File:** `client/src/pages/BlackboardRoomPage.tsx`  
**Current SHA:** `82263c4e6bedd4a80479db6603d69786e34b28e1`  
**Room State:** 🟡 DIRECTION  
**Mobile Checked:** ❌

### 3.1 Intent

The Blackboard Room is the primary **conversational capture surface**. It is simultaneously:
- A live back-and-forth with a chosen DI (Digital Intelligence) persona
- A continuous stream of saves — every message you send is automatically captured as a `CaptureOrb`
- A session container that can be exported as a blueprint when you're done

It is NOT:
- Two separate things (a capture window AND a chat window)
- A place where you must first generate a blueprint before doing anything useful

### 3.2 Reads From

- `localStorage` via `readSavedCaptures()` / `readInnerWorldCaptures()` (Scaffold)
- `PERSONAS` data
- `personaManager` (current room persona)
- Billy API via `callBillyApi()`
- User file uploads

### 3.3 Feeds Into

- `appendSavedCapture()` → **External Scaffold** (orb pipeline)
- `appendBlueprint()` → **Creation Corner** (blueprint pipeline)
- `appendUserFile()` → **File Explorer / Inner World**
- **Profile Page** (capture counts, session data — future)

### 3.4 Active Bugs / Regressions to Fix

#### BUG-BBR-01: Dual input surfaces feel like two separate tools

**Current state:** `BlackboardCompanionChat` is imported and rendered as a visible companion panel alongside the main chat feed. It has its own framing, copy ("Hold on to whatever"), pending count, and promotion controls. Even though it shares the same `handleSend` and `draft` state, it looks and feels like a second, separate input mode.

**Required fix:** `BlackboardCompanionChat` should become a **session inspector / status mirror**, not a second input surface. It should:
- Show what's been captured this session (count, latest orb title)
- Show pending blueprint status
- Offer "promote to blueprint" and "send to Creation Corner" actions
- NOT have its own text input or "hold on to whatever" framing
- Collapse to a small status bar on mobile by default, expandable via tap

**What NOT to do:** Do not delete `BlackboardCompanionChat`. Refactor its role. The component still has value as a side-panel inspection layer on desktop.

#### BUG-BBR-02: Persona selection changes labels but not the environment

**Current state:** Selecting a different persona updates `selectedPersona.slug`, changes the DI avatar badge color using `persona.auroraColor`, updates the textarea placeholder, and changes the Billy API call's persona param. The `BabylonAtmosphere` mode stays `"blackboard"` regardless.

**Required fix:** When the active persona changes, emit a persona-change signal to the atmosphere layer so the room *feels* different. Not a full page reload — a smooth CSS + Babylon transition.

Implementation approach:
1. Each persona in `PERSONAS` needs two new optional fields: `atmosphereHue: string` (e.g. `"#32b8c6"` for default, `"#a855f7"` for a darker persona) and `atmosphereMood: "cool" | "warm" | "electric" | "grounded"`.
2. In `BlackboardRoomPage`, maintain a `activeAtmosphere` CSS variable that updates when persona changes:
```ts
useEffect(() => {
  document.documentElement.style.setProperty(
    "--bbr-persona-hue",
    selectedPersona.atmosphereHue ?? "#32b8c6"
  );
}, [selectedPersona]);
```
3. The radial-gradient background overlays in the room JSX should reference `var(--bbr-persona-hue)` instead of hardcoded color values.
4. In `BabylonHeroCanvas`, accept a `hue` prop and tint the point light colors accordingly.

**Regression guard:** The default persona MUST restore the default cyan/teal atmosphere. Never make this a one-way change.

#### BUG-BBR-03: Companion chat panel is a separate component on the same page

**Investigation needed:** Search the current JSX render tree for `<BlackboardCompanionChat` and determine exactly where it is rendered and how its props are wired. If it is rendering above or alongside the main chat feed as a visible panel, it must be restructured per BUG-BBR-01. If it is a full second chat interface with its own send capability, that duplication must be eliminated.

### 3.5 Implementation Tasks

| # | Task | Priority | File |
|---|---|---|---|
| T-BBR-01 | Refactor `BlackboardCompanionChat` to inspector/mirror role, remove its own text input | P0 | `BlackboardCompanionChat.tsx` |
| T-BBR-02 | Add `atmosphereHue` + `atmosphereMood` to PERSONAS data | P0 | `client/src/data/personas.ts` |
| T-BBR-03 | Wire persona change → CSS variable → Babylon light tint | P0 | `BlackboardRoomPage.tsx`, `BabylonHeroCanvas` |
| T-BBR-04 | Add `--bbr-persona-hue` CSS variable to all background gradient strings | P1 | `BlackboardRoomPage.tsx` (BBR_STYLES) |
| T-BBR-05 | Add Babylon low-FPS graceful degradation | P1 | `BabylonHeroCanvas` inline |
| T-BBR-06 | Verify all toolbar buttons are ≥44px tap targets on 360px viewport | P1 | `BBR_STYLES` |
| T-BBR-07 | Ensure textarea stays above virtual keyboard on Android (use `dvh` or `visualViewport`) | P0 | `BlackboardRoomPage.tsx` |
| T-BBR-08 | Mic button (voice record) must work on Android Chrome — test and fix permissions flow | P1 | `BlackboardRoomPage.tsx` |

### 3.6 Mobile Checklist

- [ ] Main input textarea stays visible when keyboard opens
- [ ] Persona selector pill is tap-friendly (min 44px height)
- [ ] "End session" button is reachable without scrolling on load
- [ ] Message bubbles are readable at 360px width
- [ ] Mic button works on Android Chrome
- [ ] Babylon canvas does not drop below 28fps for more than 3 seconds (degrades gracefully)
- [ ] All drawer/session-end panels scroll internally

### 3.7 Regression Guards

These must NEVER break:
1. Every sent message MUST produce a `CaptureOrb` via `appendSavedCapture` — no exceptions
2. The Billy API call MUST use the currently selected persona's slug
3. Session messages MUST persist to localStorage between page refreshes
4. "Send blueprint to Creation Corner" toast action MUST route correctly to `/creation-corner`
5. Roundtable mode (multiple personas) MUST still work after all UI changes

---

## 4. CREATION CORNER

**File:** `client/src/pages/CreationCornerPage.tsx`  
**Current SHA:** `cfed83db75bb6d97258755bb9408b29865c0d2cc`  
**Workbench File:** `client/src/components/BlueprintGenerativeWorkbench.tsx`  
**Current SHA:** `55ad255465e9c0006d6e12c3dfd620420328feab`  
**Room State:** 🟡 DIRECTION  
**Mobile Checked:** ❌

### 4.1 Intent

Creation Corner is a **multimodal, generative studio** where creative artifacts are born and evolved. It is:
- A place you can enter at any time, with or without a blueprint
- A live conversation with the Art Teacher persona (and others)
- A system that generates structured outputs (markdown, HTML, code, agent prompts, image prompts, etc.) from ANY input — not just a pre-formed blueprint
- A place where blueprints are one of many possible starting points, not a prerequisite

It is NOT:
- A room that only activates when a blueprint has been sent from somewhere else
- A "come back later" dead end
- Blueprint-only. A raw thought, a photo, a three-word phrase, a voice note transcript — all are valid entry points.

### 4.2 Reads From

- `readBlueprints()` from Scaffold (existing blueprints from BBR or other rooms)
- `loadCreationCornerBlueprintsFromServer()` (remote hydration)
- Direct user input (new: freeform entry mode)
- Multimodal: text, image, voice transcript, file upload (future)

### 4.3 Feeds Into

- `writeBlueprints()` (saves evolved blueprints back)
- `routeBlueprintToRoom()` → Blackboard, Inner World, External Scaffold
- Future: image generation pipeline, code export, publication pipeline

### 4.4 Active Bugs / Regressions to Fix

#### BUG-CC-01: `BlueprintGenerativeWorkbench` blocks entry when blueprint is null

**Current state:**
```tsx
if (!blueprint || !workingBlueprint) {
  return (
    <section ...>
      <div ...>
        Select a blueprint to open the generative workspace.
      </div>
    </section>
  );
}
```
This renders a dead panel when there are no blueprints. The Art Teacher copy above says "bring me whatever you have" but the component immediately says "actually, no."

**Required fix:** When `blueprint` is `null`, render a **Freeform Entry Mode** instead of a blocked panel. This mode should:

1. Show the Art Teacher voice: "No blueprint yet? That's fine. Start anywhere — a thought, a title, three words, a photo. I'll help you shape it."
2. Provide a single large textarea labeled "What are you making?" (or similar)
3. On submit, create a minimal `CaptureBlueprint` from the input:
```ts
const freshBlueprint: CaptureBlueprint = {
  id: createId("blueprint"),
  title: firstLineOfInput,
  summary: fullInput,
  tags: [],
  status: "draft",
  captureCount: 1,
  sourceOrbIds: [],
  outputs: buildCreationCornerOutputs({
    title: firstLineOfInput,
    summary: fullInput,
    tags: [],
    status: "draft",
    note: "",
    sourceMarkdown: fullInput,
    sourceBlueprintJson: "{}",
    sourceCaptureIds: [],
    captureCount: 1,
    sourceRoom: "creation-corner",
  }),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
appendBlueprint(freshBlueprint);
```
4. After creation, the workbench opens with this fresh blueprint selected.

**What NOT to do:** Do not remove the existing workbench — it is excellent once a blueprint exists. Only fix the null-state gate.

#### BUG-CC-02: Art Teacher is a static text block, not an actual live conversation

**Current state:** The "Art Teacher" refinement section in `BlueprintGenerativeWorkbench` shows a `conversation` array that is prepopulated with static strings and updates with hardcoded responses ("Good. I've folded that into the next pass."). It does not call Billy or any DI endpoint.

**Required fix (phased):**
- **Phase 1 (now):** Keep the static conversation but make it feel richer. When the user folds a note, generate a more contextual static response that references the note text. E.g.: "Got it — shifting toward [first 5 words of note]. Check the draft."
- **Phase 2 (next sprint):** Wire the Art Teacher refinement conversation to `callBillyApi()` with persona `"art-teacher"` and `section: "creation-corner"`. This makes it a real DI conversation.

#### BUG-CC-03: No way to upload raw material directly in Creation Corner

**Current state:** The only way to get material into Creation Corner is through a blueprint sent from another room. There is no direct upload or paste in the room itself.

**Required fix:** In Freeform Entry Mode (from BUG-CC-01 fix), add:
- A file attachment button (image, text, PDF) — uses `uploadUserFileToServer` same as Blackboard Room
- A "paste from clipboard" button
- A voice note input (mic) that produces a transcript as the freeform input

### 4.5 Implementation Tasks

| # | Task | Priority | File |
|---|---|---|---|
| T-CC-01 | Replace null-state blocked panel with Freeform Entry Mode | P0 | `BlueprintGenerativeWorkbench.tsx` |
| T-CC-02 | Implement `createFreshBlueprintFromText()` helper | P0 | `BlueprintGenerativeWorkbench.tsx` |
| T-CC-03 | Phase 1: improve static Art Teacher responses to reference note text | P1 | `BlueprintGenerativeWorkbench.tsx` |
| T-CC-04 | Add file upload + paste + mic to freeform entry mode | P1 | `BlueprintGenerativeWorkbench.tsx` |
| T-CC-05 | Verify all output format tabs are tap-friendly on mobile | P1 | `BlueprintGenerativeWorkbench.tsx` |
| T-CC-06 | Ensure "Materialize draft" and "Send to…" buttons are ≥44px on 360px viewport | P1 | `BlueprintGenerativeWorkbench.tsx` |

### 4.6 Mobile Checklist

- [ ] Freeform entry textarea is full-width and large at 360px
- [ ] Output tab strip scrolls horizontally without clipping
- [ ] "Materialize draft" CTA is always visible without scrolling on load
- [ ] Send-to-room buttons are tap-friendly
- [ ] Workbench grid switches to single column at <768px (verify CSS)
- [ ] File attachment via native picker works on Android Chrome

### 4.7 Regression Guards

These must NEVER break:
1. Existing blueprints from Blackboard Room MUST still appear in the library
2. `writeBlueprints()` MUST be called after any blueprint creation or update
3. `gestaltview:creation-blueprints-updated` CustomEvent MUST be dispatched when blueprints change
4. The Art Teacher prompt at the top of the page MUST always show text (never blank)
5. All 9 output format tabs (markdown, HTML, pdfHtml, code, agentPrompt, imagePrompt, marketingCopy, shareCard, json) MUST remain functional

---

## 5. EXTERNAL SCAFFOLD

**File:** `client/src/pages/ExternalScaffoldPage.tsx`  
**Current SHA:** `8b342c182b15788689e4a694127fc07fe7ac3116`  
**Room State:** 🟡 DIRECTION  
**Mobile Checked:** ❌

### 5.1 Intent

External Scaffold is the **pattern and connection layer** — the room where all the orbs that have been captured across sessions surface, link, and become visible as a network. It is:
- A visual map of everything you've captured across rooms
- A place to link orbs to each other, inspect them, archive them, or download them
- Automatic: orbs appear here without the user doing anything special
- A quiet, ambient intelligence layer — the Curator DI lives here, pointing at patterns

It is NOT:
- A place that requires keyboard interaction for any primary action
- A room with complex quick-key UI that doesn't work on mobile

### 5.2 Prior Design Note — DO NOT INVENT FROM SCRATCH

Keith had a prior design for External Scaffold that was "perfect" and got scrapped unintentionally. Before redesigning any visual or interaction layer of this room, **review the corpus repo** (`GestaltView_Corpus_-_Knowledge_Repository`) for prior External Scaffold mockups, screenshots, or documented designs. The prior design should be recovered and used as the reference point. The current implementation is a directionally correct rebuild, but may have lost details.

**Action:** Search corpus for `external scaffold` design docs before touching the visual layer.

### 5.3 Reads From

- `readSavedCaptures()` — from Blackboard Room, Inner World, etc.
- `readApprovedOrbs()` — curator-approved orbs
- `loadArchivedInsightsFromServer()` — remote archived orbs
- `links` localStorage map — orb-to-orb connections

### 5.4 Feeds Into

- `writeArchivedInsights()` / `saveArchivedInsightToServer()` — archive pipeline
- File download (JSON export of individual orbs)
- Future: Blueprint generation from orb clusters

### 5.5 Active Bugs / Regressions to Fix

#### BUG-ES-01: Keyboard-only actions in OrbGraph / InsightOrb

**Current state:** The page-level UI (`ExternalScaffoldPage.tsx`) looks touchable, but `OrbGraph` and `InsightOrb` components almost certainly implement keyboard shortcuts (arrow keys to navigate, hotkeys to link/archive). These are invisible and unusable on mobile.

**Required fix:**
1. Audit `OrbGraph.tsx` and `InsightOrb.tsx` for all `onKeyDown` / `addEventListener('keydown', ...)` handlers.
2. For every keyboard shortcut found, ensure there is a visible tap button that performs the same action.
3. Keyboard shortcuts should be labeled in a "?" or "shortcuts" tooltip that is desktop-only (hidden on `max-width: 768px`).

#### BUG-ES-02: Link mode relies on two sequential taps with no visual confirmation on mobile

**Current state:** Linking works by enabling "Link mode," then tapping an orb as source, then tapping another as target. On desktop this is clear because you can see hover state. On mobile, there is no visual confirmation of which orb is selected as the link source.

**Required fix:** When in link mode and an orb is tapped as source, visually highlight it with a pulsing border or color shift and show a toast: "Source selected — now tap the orb to connect it to."

#### BUG-ES-03: `InsightOrb` panel covers the graph on mobile

**Current state:** `InsightOrb` renders as a fixed-position overlay (`open={Boolean(selectedOrb)}`). On small screens this likely covers the entire viewport, preventing the user from seeing the graph while the orb detail is open.

**Required fix:** On mobile (`max-width: 768px`), `InsightOrb` should render as a bottom sheet (slides up from the bottom, max-height: 70dvh, scrollable internally) rather than a full-screen overlay. The graph should remain partially visible above it.

### 5.6 Implementation Tasks

| # | Task | Priority | File |
|---|---|---|---|
| T-ES-01 | Audit `OrbGraph.tsx` for keyboard-only actions and add tap equivalents | P0 | `OrbGraph.tsx` |
| T-ES-02 | Audit `InsightOrb.tsx` for keyboard-only actions and add tap equivalents | P0 | `InsightOrb.tsx` |
| T-ES-03 | Add link-mode source selection visual feedback + toast on mobile | P1 | `ExternalScaffoldPage.tsx` |
| T-ES-04 | Convert `InsightOrb` to bottom-sheet on mobile | P1 | `InsightOrb.tsx` |
| T-ES-05 | Review corpus for prior External Scaffold design before any visual changes | P0 | Corpus repo |
| T-ES-06 | Ensure "Link mode" toggle button is ≥44px | P1 | `ExternalScaffoldPage.tsx` |

### 5.7 Mobile Checklist

- [ ] All orb interactions are reachable via tap (no keyboard required)
- [ ] Link mode gives visual confirmation of source orb selection
- [ ] `InsightOrb` is a bottom sheet on mobile, not full-screen overlay
- [ ] `OrbGraph` orb nodes have tap areas ≥44px (adjust node size if needed)
- [ ] Archive and download buttons inside `InsightOrb` are tap-friendly
- [ ] "Link mode" toggle and "Home" button are reachable without scrolling

### 5.8 Regression Guards

These must NEVER break:
1. Orbs from `appendSavedCapture()` in Blackboard Room MUST appear here automatically (via storage event)
2. `archiveOrb()` MUST remove the orb from active and persist it to server
3. `downloadOrb()` MUST produce a valid JSON file
4. `SAVED_CAPTURE_EVENT` and `ARCHIVED_INSIGHT_EVENT` listeners MUST remain active
5. Bidirectional linking MUST remain symmetric (A→B AND B→A)

---

## 6. PROFILE PAGE

**File:** `client/src/pages/ProfilePage.tsx`  
**Current SHA:** `11878206ccf21af49acbf525ce9260b5b26d7d13`  
**Room State:** 🔴 UNSTABLE  
**Mobile Checked:** ❌

### 6.1 Intent

The Profile Page is a **visual portrait of what has been curated and kept safe**. It is NOT a settings form. It should feel like looking at a living record of your own mind as it's been captured across sessions. Think:
- Capture volume over time (visual, not a table)
- Topic clusters / themes that have emerged from your orbs
- Most active personas you've engaged
- A compact, beautiful summary of your DI relationship
- Privacy indicators: what is local-only vs. synced vs. visible to others

### 6.2 Implementation Tasks (future sprint — not P0 now)

These tasks are listed here so they are not forgotten and do not get accidentally regressed by premature profile work:

| # | Task | Priority |
|---|---|---|
| T-PRO-01 | Profile Page must NOT become a form. Redesign as visual dashboard. | P1 |
| T-PRO-02 | Read `readSavedCaptures()` to show capture count + type distribution | P1 |
| T-PRO-03 | Read `readBlueprints()` to show blueprint count + most recent | P1 |
| T-PRO-04 | Show active persona history (which DIs you've talked to most) | P2 |
| T-PRO-05 | Visual compaction: tags / themes as a word-cloud or bubble chart | P2 |

### 6.3 Regression Guards

1. Auth (user.id) MUST remain wired — profile data is user-scoped
2. Do not remove any existing Supabase user update logic until the redesign is ready

---

## 7. GLOBAL PIPELINE MAP

```
User Input (text/voice/file)
         │
         ▼
┌─────────────────────┐
│   Blackboard Room   │ ← Primary capture surface
│  (any persona/DI)   │
└─────────┬───────────┘
          │  appendSavedCapture() → CaptureOrb
          │  appendBlueprint()   → CaptureBlueprint
          ▼
┌─────────────────────┐     ┌────────────────────┐
│  External Scaffold  │     │  Creation Corner   │
│  (Orb network +     │     │  (Freeform OR      │
│   pattern layer)    │     │   Blueprint-driven │
│                     │     │   generative work) │
└─────────────────────┘     └────────────────────┘
          │                           │
          │ archiveOrb()              │ routeBlueprintToRoom()
          ▼                           ▼
┌─────────────────────────────────────────────────┐
│               Profile Page                      │
│  (Visual summary of curated self — future)      │
└─────────────────────────────────────────────────┘
```

**Rule:** Creation Corner must be reachable from a cold start (no prior sessions, no blueprints). Its entry point is always open. The same applies to Blackboard Room. No room should require a prerequisite visit to another room before it will open.

---

## 8. CODEX EXECUTION ORDER

This is the suggested order for Codex to work through tasks without causing regressions:

### Sprint 1 — Critical UX fixes (no feature additions)
1. `T-BBR-07` — Fix sticky input for Android virtual keyboard (Blackboard Room)
2. `T-CC-01` + `T-CC-02` — Fix Creation Corner null-state gate (Freeform Entry Mode)
3. `T-ES-01` + `T-ES-02` — Audit and fix keyboard-only actions in Scaffold orb components
4. `T-ES-04` — InsightOrb → bottom sheet on mobile
5. `T-BBR-01` — Refactor BlackboardCompanionChat to inspector/mirror role

### Sprint 2 — Persona environment + atmosphere
6. `T-BBR-02` — Add atmosphereHue + atmosphereMood to PERSONAS
7. `T-BBR-03` + `T-BBR-04` — Wire persona change to CSS variable + Babylon tint
8. `T-BBR-05` — Babylon low-FPS graceful degradation

### Sprint 3 — Mobile polish + regression lock
9. Run all Mobile Checklists for Blackboard, Creation Corner, External Scaffold
10. Update `roomState.ts` entries to reflect new stability levels
11. `T-CC-03` — Improve Art Teacher static responses
12. `T-CC-04` — Add file/paste/mic to Creation Corner freeform entry

---

## 9. VALIDATION COMMANDS

After every change, run:

```bash
npm run build
git diff --check
```

For Blackboard Room changes specifically:
- [ ] Send a message → confirm `CaptureOrb` appears in External Scaffold
- [ ] Send blueprint → confirm it appears in Creation Corner
- [ ] Switch persona → confirm environment color shifts
- [ ] On mobile: confirm textarea stays above keyboard

For Creation Corner changes specifically:
- [ ] Visit with 0 blueprints → confirm Freeform Entry Mode appears (not blocked panel)
- [ ] Create a fresh blueprint from freeform → confirm it persists and workbench opens
- [ ] Visit with existing blueprints → confirm existing workbench works as before

For External Scaffold changes specifically:
- [ ] On mobile: confirm all orb actions reachable via tap
- [ ] Confirm link mode shows source selection feedback
- [ ] Confirm bottom sheet on mobile for InsightOrb

---

## 10. NOTES TO CODEX / AI ASSISTANT

- Keith builds and tests on a **Samsung Galaxy A35**. If something works on desktop but not that device, it is broken.
- Do not invent new visual design for External Scaffold without reviewing the corpus repo for the prior design.
- Do not add new dependencies for animations or UI components — use existing CSS-in-JS patterns already in BBR_STYLES.
- Keyboard shortcuts are progressive enhancement. They should never be the only way to do something.
- Blueprint is ONE entry point to Creation Corner. It is not THE entry point. Fix the gate without removing blueprint support.
- The Art Teacher should feel alive. Static strings are placeholder. Phase 2 should wire real Billy calls.
- Every change must be auditable: update `roomState.ts` `lastUpdated` after each sprint.

---

*End of spec. Version 1.0 — 2026-05-26.*
*Source: GitHub MCP — DigitalConsciousness/gestaltview-v2.0 (live repo, main branch)*
