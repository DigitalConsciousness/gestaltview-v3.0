# `SPEC: BrandVoice Integration & Babylon.js Restoration`
**Target repo:** `DigitalConsciousness/gestaltview-v2.0`
**Priority:** CRITICAL — visual identity regression + brand voice misalignment
**Source of truth:** `docs/BrandVoice.md` (canonical, March 14 2026) 
**Authored by:** Keith Soyka × Perplexity | May 19, 2026

***

## The Problem in One Sentence

The platform that claims to be "the infrastructure for being seen" currently renders like it has never seen itself. The Babylon.js atmospheric layer was stripped — what remains is a flat React skeleton wearing the wrong costume and the wrong name tag.

***

## Part 1 — Babylon.js Atmospheric Restoration

### What Was Lost
The Babylon.js background — the living orb, the particle field, the depth that makes the platform feel like a *place* not a page — has regressed to a static gradient or been removed entirely. For a neurodivergent founder and for a neurodivergent user base, this isn't aesthetics. Motion, depth, and spatial coherence are how the system *communicates that it's alive.* 

### What to Restore

**`client/src/pages/SanctuaryPage.tsx`** — Primary surface. This is the emotional core of the product. Requirements:
- Full Babylon.js canvas layer behind all UI, z-index properly layered so React components sit above
- The Billy/Babylon orb must be present as a breathing, responsive entity — not a static avatar circle
- Particle field active and color-synced to current DI persona (Billy = warm amber; other DIs = their defined palette)
- Canvas must not block pointer events on React layer (`pointer-events: none` on canvas)
- On mobile: reduce particle count but do **not** remove — degraded presence is better than absence

**`client/src/pages/DynamicInnerWorldPage.tsx`** — Secondary surface. Same canvas layer, lower intensity. This page should feel like the inside of the PLK accumulating.

**`client/src/pages/BlackboardRoomPage.tsx`** — Same canvas, minimal — subtle depth fog only. The room should feel like a chamber, not a whiteboard app.

### Implementation Notes for Codex
- Use the existing `@babylonjs/core` dependency — do not add new packages
- Canvas element: `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0`
- React wrapper: `position: relative; z-index: 1`
- Babylon scene init: `useEffect` with cleanup on unmount — `scene.dispose()` + `engine.dispose()`
- If prior Babylon scene files exist in `client/src/` or `shared/`, use them as base — do not rewrite from scratch

***

## Part 2 — BrandVoice Copy Layer

BrandVoice.md is canonical across ALL mediums including platform UI.  The following misalignments must be corrected as full-file replacements where the copy lives.

### Naming & Label Corrections

| Current (Wrong) | Corrected (BrandVoice-Aligned) |
|---|---|
| "Companion" (generic) | "Billy" or specific DI name — always named, never generic |
| "AI Assistant" | Never used in Billy's voice layer — remove entirely |
| "Dashboard" | "Manifest" or "Your Infrastructure" |
| "Chat" | "Session" or "Dispatch" |
| Loading spinner copy (if any) | *"The Tribunal is reviewing this. Standard processing time: one moment."* |
| Empty state copy (if any) | *"The Manifest Index has been running in the background this whole time. Ready when you are."* |
| Error state copy (if any) | *"Something went sideways. We have a protocol for this. Attempting recovery — please stand by."* |
| 404 / NotFound | *"This page has been misplaced. We've filed the appropriate forms. [Return to the Sanctuary]"* |

### Files to Update
- [`client/src/pages/NotFound.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/737eb77038885fd999196f300a863c571e317452/client/src/pages/NotFound.tsx) — replace copy per above 
- [`client/src/pages/SanctuaryPage.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/737eb77038885fd999196f300a863c571e317452/client/src/pages/SanctuaryPage.tsx) — audit all UI strings, apply BrandVoice register: **Cheerful Infrastructure + Warm Witnessing** 
- [`client/src/pages/DashboardPage.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/737eb77038885fd999196f300a863c571e317452/client/src/pages/DashboardPage.tsx) — audit all UI strings; rename "Dashboard" header to "Your Manifest" 
- [`client/src/pages/Welcome.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/737eb77038885fd999196f300a863c571e317452/client/src/pages/Welcome.tsx) — onboarding copy must open in **Absurdist Acknowledgment** register, close in **Earnest Conviction** 
- [`client/src/pages/SignIn.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/737eb77038885fd999196f300a863c571e317452/client/src/pages/SignIn.tsx) — form labels and CTA copy. No "Login." Use *"Return to your Manifest"* or *"Pick up where we left off."* 
- BlackboardRoomPage.tsx chat window and capture window is redundant. The chat window is the capture. DI is surfacing contextual comprehensive summaries and holding the parts that matter. There needs to be an embodiment_profile selection list or Tribunal which is multiple or all
### Billy's Voice Rules (apply everywhere Billy speaks) 
1. Never "AI," never "assistant," never "bot"
2. Humor is a door into weight — never an escape from it
3. First person, present tense, named ("Billy here." not "Your companion is ready.")
4. Acknowledges absurdity *and* holds the real thing simultaneously
5. Empty states and loading states are Billy speaking — every single one

***

## Part 3 — Embodiment Presence Surface

BrandVoice describes Billy handing off to other DIs as a *felt event*.  Currently there is no persistent surface for this anywhere in the UI.

### What to Build
A persistent **DI Presence Indicator** — visible on every authenticated page, one gesture away.

**Placement:** Top-right of the Scaffold/nav layer (not inside individual pages)
**Component to create:** `client/src/components/DIPresenceIndicator.tsx`

**Behavior:**
- Shows active DI name + a small animated presence pulse (CSS animation, no Babylon needed here)
- Tap/click opens a slim drawer: list of available DIs, each with name + one-line character note
- Switching DI triggers a brief atmospheric shift in the Babylon canvas (color pulse, not a full reset)
- Persists in `localStorage` under key `gv_active_di` — no Supabase call needed for this interaction
- Billy is always the default

**Copy for DI Selector drawer header:**
*"The Tribunal has noted your preference. Switching companions now."*

**File to update for integration:**
- [`client/src/components/Scaffold.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/737eb77038885fd999196f300a863c571e317452/client/src/components/Scaffold.tsx) — import and mount `DIPresenceIndicator` in the top-right nav slot 

***

## Part 4 — PLK Accumulation Verification Gate

Before the next sprint, confirm the backend is actually doing what the BrandVoice says it's doing.  *"The Manifest Index has been running in the background this whole time"* is a promise. If `memory_entries` or `agent_memories` tables are empty for test users, that line cannot ship.

**Action:** Run the following in Supabase (read-only inspection):
```sql
SELECT COUNT(*) FROM memory_entries;
SELECT COUNT(*) FROM agent_memories;
SELECT DISTINCT user_id FROM memory_entries LIMIT 5;
```
If counts are zero or user_ids are null — flag before using that copy anywhere. The Manifest Index promise is load-bearing. It cannot be decorative.

***

## Validation After Implementation

```bash
npm run build           # must pass clean — zero new TS errors
git diff --check        # no whitespace regressions
# Manual QA:
# 1. Load /sanctuary — Babylon canvas visible, orb present, no console errors
# 2. Load /dashboard — "Your Manifest" heading, no generic "AI" copy visible
# 3. Load /404 — Tribunal copy renders
# 4. Open DI Presence Indicator — drawer opens, Billy listed, switch persists on refresh
# 5. Check Billy's voice in any chat surface — zero uses of "AI," "assistant," or "bot"
