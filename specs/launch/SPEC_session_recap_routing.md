# SPEC: Session Recap Routing — Creation Corner Lock

**Version:** 1.0  
**Date:** 2026-06-12  
**Repo:** `DigitalConsciousness/gestaltview-v2.0`  
**Status:** Ready for implementation  
**Priority:** Sprint 1 — Demo-critical routing correctness  

---

## Overview

Session recaps are a first-party GestaltView artifact type that document the cognitive and creative work of a user session. They belong permanently in **Creation Corner** — the workshop where artifacts are forged and kept. The **Dynamic Inner World** is a spatial rendering surface for scene-based artifacts (`spatial_scene`, images, mind maps); it is architecturally incorrect as a session recap destination.

Currently, the routing system allows a session recap to be sent to Inner World either by user selection in the Destination picker or by any future code path that pre-sets `destination === "dynamic_inner_world"`. This spec closes that gap with a type-level guard, a UI-layer filter, and a server-side validation fence.

---

## Problem Statement

### Root Cause

`handleSynthesize()` in `CreationCornerPage.tsx` branches on `destination === "dynamic_inner_world"` **without checking `artifactType`**. The condition is type-agnostic — any artifact, including `session_recap`, will be passed to `appendResultToInnerWorld()` if the user selects that destination.

```typescript
// Current code — no type guard
if (destination === "dynamic_inner_world") {
  appendResultToInnerWorld(data, user?.id ?? "anonymous");
  toast.success("Sent spatial scene to Dynamic Inner World.");
}
```

### Secondary Risk

The `DESTINATIONS` picker in the UI renders all five destination options regardless of which artifact type is selected. A user can freely pick `"→ Inner World"` while `session_recap` is the active artifact type. There is no visual or logical constraint.

### Tertiary Risk

`mapCreationCornerDestination()` in `shared/codex/creationCorner.ts` maps `"dynamic_inner_world"` → `"dynamic-inner-world"` for any input. The shared type layer has no knowledge of which `ArtifactType` values are incompatible with which `ArtifactDestination` values.

---

## Affected Files

| File | Layer | Change Type |
|------|-------|-------------|
| `client/src/pages/CreationCornerPage.tsx` | UI + routing logic | Guard + UI filter |
| `shared/codex/creationCorner.ts` | Shared types | Incompatibility constant |
| `server/creation_corner_engine.py` | Server validation | Destination override rule |

---

## Specification

### 1. Shared Layer — Incompatible Destination Map

**File:** `shared/codex/creationCorner.ts`

Add a compile-time constant that declares which artifact types must never reach which destinations. This becomes the single source of truth for all layers.

```typescript
/**
 * DESTINATION_BLOCKLIST
 * Artifact types that must never be routed to specific destinations.
 * Used by UI (filter picker), client routing guard, and server validation.
 */
export const DESTINATION_BLOCKLIST: Partial<
  Record<CreationCornerLegacyArtifactType, CreationCornerLegacyDestination[]>
> = {
  session_recap: ["dynamic_inner_world"],
  agent_prompt:  ["dynamic_inner_world"],
  marketing_copy: ["dynamic_inner_world"],
};

/**
 * Returns true if the given artifactType is allowed to route to destination.
 */
export function isDestinationAllowed(
  artifactType: CreationCornerLegacyArtifactType,
  destination: CreationCornerLegacyDestination,
): boolean {
  return !(DESTINATION_BLOCKLIST[artifactType] ?? []).includes(destination);
}

/**
 * Returns the safe destination for a given artifactType + requested destination.
 * Falls back to "creation_corner" if the pairing is blocked.
 */
export function resolveDestination(
  artifactType: CreationCornerLegacyArtifactType,
  requested: CreationCornerLegacyDestination,
): CreationCornerLegacyDestination {
  return isDestinationAllowed(artifactType, requested) ? requested : "creation_corner";
}
```

**Why include `agent_prompt` and `marketing_copy` in the blocklist?**  
Neither maps to a `spatial_scene` Codex body. Sending them to Inner World would call `appendResultToInnerWorld()` on an artifact with no scene geometry — a silent no-op at best, a runtime error at worst. The blocklist makes the intent explicit now before those artifact types get their own routing work.

---

### 2. Client Layer — UI Destination Filter

**File:** `client/src/pages/CreationCornerPage.tsx`

**Import the new helper:**

```typescript
import {
  // existing imports...
  isDestinationAllowed,
  resolveDestination,
} from "@shared/codex/creationCorner";
```

**Filter the Destination picker based on `artifactType`:**

Replace the existing destination button map:

```tsx
// BEFORE
{DESTINATIONS.map((d) => (
  <button key={d.value} onClick={() => setDestination(d.value)} ... >
    {d.label}
  </button>
))}
```

```tsx
// AFTER — filter out blocked destinations for the current artifactType
{DESTINATIONS
  .filter((d) => isDestinationAllowed(artifactType, d.value))
  .map((d) => (
    <button key={d.value} onClick={() => setDestination(d.value)} ... >
      {d.label}
    </button>
  ))
}
```

**Reset destination when artifactType changes to avoid stale selection:**

Add a `useEffect` that resets `destination` whenever `artifactType` changes and the current destination is now blocked:

```typescript
useEffect(() => {
  if (!isDestinationAllowed(artifactType, destination)) {
    setDestination("creation_corner");
  }
}, [artifactType]);
```

Place this effect alongside the other `useEffect` hooks in the component, after the blueprint hydration block.

---

### 3. Client Layer — Routing Guard in `handleSynthesize`

**File:** `client/src/pages/CreationCornerPage.tsx`

Replace the destination routing block at the bottom of `handleSynthesize()`:

```typescript
// BEFORE
if (destination === "dynamic_inner_world") {
  try {
    appendResultToInnerWorld(data, user?.id ?? "anonymous");
    toast.success("Sent spatial scene to Dynamic Inner World.");
  } catch (routeError: any) {
    toast.info(routeError.message ?? "Artifact stayed in Creation Corner with its Codex manifest.");
  }
} else {
  toast.success("Artifact synthesized.");
}
```

```typescript
// AFTER — type-guarded routing
const safeDestination = resolveDestination(artifactType, destination);

if (safeDestination === "dynamic_inner_world") {
  try {
    appendResultToInnerWorld(data, user?.id ?? "anonymous");
    toast.success("Sent spatial scene to Dynamic Inner World.");
  } catch (routeError: any) {
    toast.info(routeError.message ?? "Artifact stayed in Creation Corner with its Codex manifest.");
  }
} else {
  // Destination was either explicitly creation_corner, or was silently corrected
  // from an invalid dynamic_inner_world selection (should not occur after UI fix,
  // but this is the defence-in-depth layer).
  if (safeDestination !== destination) {
    // Destination was corrected — inform the user without alarming them
    toast.success("Session Recap forged and saved to Creation Corner.");
  } else {
    toast.success("Artifact synthesized.");
  }
}
```

---

### 4. Server Layer — Validation Fence

**File:** `server/creation_corner_engine.py`

Add a destination normalisation step at the top of the synthesis handler, before any artifact generation begins. This prevents any client bug or API misuse from routing a session recap to Inner World even if the client-side guards are somehow bypassed.

```python
# ── Incompatible destination overrides ──────────────────────────────────────
# Maps artifact_type → list of destinations that must be redirected to fallback.
DESTINATION_BLOCKLIST: dict[str, list[str]] = {
    "session-recap":   ["dynamic-inner-world"],
    "agent-prompt":    ["dynamic-inner-world"],
    "marketing-copy":  ["dynamic-inner-world"],
}

DESTINATION_FALLBACK = "creation-corner"


def resolve_destination(artifact_type: str, requested: str) -> str:
    """
    Return the safe destination for the given artifact_type + requested destination.
    Falls back to DESTINATION_FALLBACK if the pairing is blocked.
    """
    blocked = DESTINATION_BLOCKLIST.get(artifact_type, [])
    if requested in blocked:
        logger.warning(
            "Destination override: %s is not a valid destination for artifact_type=%s. "
            "Redirecting to %s.",
            requested,
            artifact_type,
            DESTINATION_FALLBACK,
        )
        return DESTINATION_FALLBACK
    return requested
```

Call `resolve_destination()` immediately after parsing the incoming request body, before passing `destination` to any synthesis or routing logic:

```python
# In the synthesis endpoint handler:
artifact_type = body.get("targetType", "markdown")
destination   = resolve_destination(artifact_type, body.get("destination", "creation-corner"))
```

---

## Acceptance Criteria

### Functional

- [ ] Selecting `session_recap` in the Output Format grid causes `"→ Inner World"` to disappear from the Destination picker immediately, without page reload.
- [ ] If a user had `"→ Inner World"` selected and then switches artifact type to `session_recap`, the destination picker resets to `"Keep here"` automatically.
- [ ] Synthesizing a `session_recap` with any destination value never calls `appendResultToInnerWorld()`.
- [ ] The success toast reads **"Session Recap forged and saved to Creation Corner."** when a recap is synthesized (not the generic "Artifact synthesized.").
- [ ] All other artifact types (`markdown`, `mind_map`, `image`, etc.) continue to offer `"→ Inner World"` as a valid destination with no regression.
- [ ] `agent_prompt` and `marketing_copy` artifact types also have `"→ Inner World"` removed from their Destination pickers (bonus, covered by the same blocklist).

### Server-Side

- [ ] A direct POST to `/api/creation-corner/synthesize` (or equivalent) with `targetType: "session-recap"` and `destination: "dynamic-inner-world"` returns a `200` with the artifact routed to `creation-corner`, and a `destination_override` warning in the response body.
- [ ] The server logs a `WARNING`-level entry when a destination override fires.

### Regression

- [ ] `mind_map` → `"→ Inner World"` still works and routes to `appendInnerWorldArtifact`.
- [ ] `image_prompt` → `"→ Inner World"` still works.
- [ ] Blueprint handoff from Blackboard (`TRANSCRIPTORY_BLACKBOARD_HANDOFF_KEY`) continues to land in Creation Corner unchanged.
- [ ] `npm run build` passes with zero TypeScript errors after the shared type changes.

---

## Implementation Order

1. **`shared/codex/creationCorner.ts`** — add `DESTINATION_BLOCKLIST`, `isDestinationAllowed`, `resolveDestination`. This is the foundation; the other two layers depend on it.
2. **`client/src/pages/CreationCornerPage.tsx`** — import helpers, add `useEffect` reset, add filter to Destination picker, update `handleSynthesize` routing block.
3. **`server/creation_corner_engine.py`** — add `DESTINATION_BLOCKLIST` dict, `resolve_destination()` function, call it in the synthesis handler.
4. Run `npm run build` — verify zero errors.
5. Manual smoke test: select `session_recap`, confirm Inner World disappears from picker. Synthesize, confirm Creation Corner toast.

---

## Out of Scope

- Changing how session recaps are *displayed* inside Creation Corner (future UX sprint).
- Adding session recaps to the Dynamic Inner World as a linked reference card (intentional future feature — requires its own spec and a `spatial_scene` body shape for recap metadata).
- The free-tier artifact pipeline cap (separate spec, depends on `DemoGate.tsx` reactivation).
- Routing for `share_card` → Inner World (currently allowed; correctness TBD in a future audit).

---

## Notes

The `codexBodyForKind("session_recap")` implementation in `shared/codex/creationCorner.ts` already produces a structured body with `summary`, `decisions`, `nextActions`, `openLoops`, and `sections` — all Creation Corner–native fields. There is no `spatial_scene` geometry in this body, which confirms at the data-model level that Inner World was never the intended destination. This spec formalises what the data model already implies.

This doc is a goldmine — it's a voice-captured session that contains five clear, actionable threads. Here's the full breakdown:

***

## What's In This Document

This is a transcript + summary from a founder session — Keith walking through the release teaser vision and the two hard blockers standing between now and a shippable demo video.

***

## The Two Blockers (Stop Everything)


Keith got further than ever — the Google Account chooser appeared — but after selecting the email, it hard-crashes to a white screen with "URI incorrect configuration." This means the redirect URI registered in the Spotify Developer Dashboard doesn't match the URL the app is actually calling from. The auxiliary/preview domain (the one Keith accidentally discovered works enough to get *to* the auth screen) is almost certainly not in the allowlist. Every Vercel env var was already audited and applied — so the fix is almost certainly on the **Spotify Dev API side**: add the exact production URL *and* the auxiliary preview URL to the allowed redirect URIs, not in Vercel.

**Blocker 2 — Database Objects Not Retrievable** 

Objects are rendering (they're being created and probably stored) but can't be pulled back from Supabase storage into the UI. This is the single biggest blocker for the Dynamic Inner World demo — you can't show an exhibit hall with no exhibits. This needs a live Supabase query audit to see what's being written vs. what the read query expects.

***

## Three Design Decisions That Need To Be Locked In Code Now

**1. Recap Generator → Creation Corner / Archive, NOT Dynamic Inner World**

The Recap Generator is producing beautiful HTML output (both preview pane and downloadable). Right now it's routing those outputs to the Dynamic Inner World automatically. The policy going forward is explicit: **only finalized, fully rendered artifacts go to the Dynamic Inner World.** Recap outputs are intermediate — they belong in Creation Corner or Archive. This is a routing fix, not a UI redesign.

**2. Creation Corner "Synthesize" = "ta-da" moment only**

When a user hits Synthesize in the Forge, the only thing that should appear is the polished rendered artifact. No raw JSON, no blueprint strings, no loose recap summaries cluttering the panel. The "right rail" JSON output should be suppressed from the user-facing view entirely. The experience should feel like a reveal, not a debug console.

**3. Dynamic Inner World spatial metaphor is now formally defined** 
Keith gave the definitive spatial spec verbally:
- Narrow corridor/alley ~13–14ft wide
- Left and right walls: staggered "bus shelter" / oversized poster displays, each ~8ft tall × 4ft wide
- Each display = one promoted artifact, fully interactive (Google Canvas / Claude artifacts behavior — live interaction in the frame, not just a screenshot)
- Only promoted/finalized artifacts appear here — nothing intermediate

This is the canonical render spec for the Dynamic Inner World and should be documented as such in `docs/CurrentState.md`.

***

## The Demo Strategy (Smart Pivot)

Since the two blockers prevent a full feature walkthrough right now, the plan is: **seed the Dynamic Inner World with hand-crafted demo artifacts** — resumes, HTML PDFs, beautiful HTML builds — to get the room looking and functioning correctly for the video. This is the right call. The Multimodal Sandbox (already being enhanced) is the workbench for building those demo pieces.

***

## The Explainer Video / Voiceover

The teaser (50 seconds, opening ceremony + music) already exists. The next asset needed is a **voiceover script** that explains the runtime — one that can double as the explainer video narration. Keith wants it paced so it can be rearranged. That script should be built around the Dynamic Inner World spatial metaphor above, the "ta-da" artifact reveal, and the three core verticals (SymbioCoder, VibeCoder, Resume Rockstar).

***

## Immediate Action Stack

| Priority | Action | Where |
|----------|--------|--------|
| 🔴 P0 | Add all Vercel/preview domain URIs to Spotify Dev API allowlist | Spotify Developer Dashboard |
| 🔴 P0 | Audit Supabase read query for artifact retrieval — compare write shape vs. read query | Supabase MCP |
| 🟠 P1 | Redirect Recap Generator output → Creation Corner / Archive (not DIW) | Routing logic in gen-engine |
| 🟠 P1 | Suppress raw JSON / blueprint output from Creation Corner Synthesize panel | UI/UX — right rail component |
| 🟡 P2 | Seed Dynamic Inner World with 3–5 hand-crafted demo artifacts | Multimodal Sandbox → promote to DIW |
| 🟡 P2 | Write explainer/voiceover script centered on DIW spatial metaphor | Docs / script file |
| 🟡 P2 | Document DIW spatial spec formally in CurrentState.md | docs/CurrentState.md |

Perfect forensics. Now I have everything. The exact commit `8efe4e9` from today at 14:15 UTC is what wiped it — **261 lines deleted** from `MusicalDNAPage.tsx`, specifically: *"Removed the Billy interview overlay and manual Spotify analysis form."* 

The good news: `MusicalDNAPage.tsx` still exists (it was modified, not deleted), `spotifyMusicalDna.ts` still exists, the ambient inference layer is additive on top. This is a **restore + extend**, not a rebuild.

Here's the precise spec for Codex:

***

## SPEC: Musical DNA — Manual Track Upload + HTML Rendered Artifacts
**Target commit baseline:** `8efe4e9` (ambient inference) layered onto `fe79e98` (pre-ambient state)
**Files touched:** `MusicalDNAPage.tsx`, new `useTrackUpload.ts` hook, new API route `api/musical-dna/upload.ts`, `musicalDnaAmbient.ts` (minor addition), `App.tsx` (route wire)

***

### Part 1 — Restore Manual Song Upload

The ambient inference commit explicitly removed *"the manual Spotify analysis form"* and *"Billy interview overlay."*  The manual upload UI needs to come back as a **parallel path** — not a replacement for ambient inference, which stays. The page should present two modes side by side:

**Mode A — Ambient (existing, keep as-is):** Consent toggle already wired to `musicalDnaAmbientInference` in `userSurfaceSettings`. Don't touch this.

**Mode B — Manual Upload (restore + upgrade):**

```
MusicalDNAPage.tsx — Section to restore/add:

<ManualTrackUploadPanel>
  ├── Drag-and-drop zone  (accept: audio/*, .mp3 .wav .flac .aac .m4a)
  ├── OR file picker button
  ├── After file selected:
  │     ├── Track title input        (pre-filled from filename, editable)
  │     ├── Artist input             (optional)
  │     ├── Why this track? textarea (optional — feeds Billy context)
  │     └── [Add to My Musical DNA] button
  └── Uploaded tracks list (persisted, scrollable)
        └── Each item: artwork placeholder | title | artist | "Remove" X
```

**Hook — `client/src/hooks/useTrackUpload.ts` (new file):**
```typescript
// Responsibilities:
// 1. Accept File object from drag/drop or input
// 2. Validate: file is audio/* AND size < 50MB (free tier cap)
// 3. Upload to Supabase Storage bucket: 'musical-dna-uploads/{userId}/{uuid}.{ext}'
// 4. On success, write row to musical_dna_tracks table (see schema below)
// 5. Return { tracks, upload, remove, isUploading, error }
```

**Supabase table — `musical_dna_tracks` (new migration):**
```sql
create table musical_dna_tracks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  title       text not null,
  artist      text,
  note        text,                        -- "Why this track?" field
  storage_key text not null,               -- Supabase Storage path
  source      text default 'manual_upload', -- or 'ambient_inferred'
  created_at  timestamptz default now()
);
alter table musical_dna_tracks enable row level security;
create policy "users own their tracks"
  on musical_dna_tracks for all using (auth.uid() = user_id);
```

**API route — `api/musical-dna/upload.ts` (new file):**
```
POST /api/musical-dna/upload
Body: multipart/form-data { file, title, artist?, note?, userId }
- Validates file mime + size
- Streams to Supabase Storage (service role)
- Inserts row into musical_dna_tracks
- Returns { track: MusicalDnaTrack }
```

**Feed into ambient inference:** In `musicalDnaAmbient.ts`, the `synthesizeFromContext()` function currently reads journals + recap artifacts. Add a new signal source:
```typescript
// Add to context assembly:
const uploadedTracks = await getMusicalDnaTracks(userId);
// Include titles + notes in the synthesis prompt as:
// "User's manually uploaded tracks: [title] — [note]"
```

**Feature flag:** In `client/src/config/featureFlags.ts` (which already exists from commit `9ac4bcf`) :
```typescript
MANUAL_TRACK_UPLOAD: true   // flip to false to hide panel without code removal
```

***

### Part 2 — HTML Rendered Artifacts

This covers the `DynamicInnerWorldPage` artifact rendering spec, which connects directly to the multi-modal sandbox added in commit `97ab845` (*"Implemented useCreateArtifact hook... HTML, Python, and Three.js support"*). 

**The gap:** Artifacts generated by the gen-engine are stored and surfaced in the Dynamic Inner World as orbs, but when a user taps/clicks an orb, the HTML content inside is not being *rendered* — it's displayed as raw text or not at all.

**What Codex needs to implement:**

**`InnerWorldArtifactViewer.tsx` (new component):**
```
When user opens an artifact orb:
├── If artifact.type === 'html' or artifact.content starts with '<':
│     └── Render in sandboxed <iframe srcdoc={content}>
│           - sandbox="allow-scripts allow-same-origin"
│           - No allow-top-navigation, no allow-forms (security)
│           - Width: 100%, Height: auto with resize observer
│           - Dark/light mode: inject CSS var bridge into iframe head
│
├── If artifact.type === 'markdown':
│     └── Render with existing markdown renderer (already in codebase)
│
├── If artifact.type === 'code' (Python/JS/Three.js):
│     └── Syntax-highlighted code block + "Open in Sandbox" button
│           → routes to /sandbox?artifactId={id}  (SandboxPage already exists)
│
└── Fallback: plain text with monospace font
```

**`useArtifactRenderer.ts` (new hook):**
```typescript
// Detects artifact render type from:
// 1. artifact.type field
// 2. artifact.content sniffing (starts with '<!DOCTYPE', '<html', '```')
// Returns: 'html' | 'markdown' | 'code' | 'plaintext'
```

**Security note for Codex:** The `srcdoc` approach (not `src`) means no external requests. The iframe gets no `allow-same-origin` if the content is user-generated (only for trusted gen-engine output). Add a comment flagging this distinction.

**Musical DNA artifact connection:** When a Musical DNA track profile is generated (ambient or manual), the gen-engine should produce an HTML artifact — a styled "track card" — that lands in the Dynamic Inner World. This is the free-tier wow moment discussed previously.

```
Gen-engine prompt addition (musicalDnaAmbient.ts → synthesizeFromContext):
"Generate an HTML artifact: a styled musical identity card showing the user's 
inferred sonic signature. Include: mood palette (CSS color swatches), 
genre fingerprint (visual tag cloud), listening archetype label, 
and 2-3 sentence poetic summary. Style: dark glassmorphism, animated gradient border."
```

This artifact flows through the existing `useCreateArtifact` hook → `created_artifacts` table → Dynamic Inner World orb. No new pipeline needed — the seam already exists from `97ab845`. 

***

### Acceptance Criteria

| Scenario | Expected |
|---|---|
| User drags MP3 onto upload zone | Progress indicator → track appears in list |
| File > 50MB | Error: "Max 50MB for audio uploads" |
| Non-audio file dropped | Error: "Audio files only (.mp3, .wav, .flac, .aac, .m4a)" |
| User adds note to track | Note persists, feeds into ambient synthesis |
| User removes a track | Row deleted from DB, storage object deleted |
| Ambient inference runs | Uploaded track titles + notes appear in synthesis context |
| HTML artifact orb tapped in DIW | Renders in sandboxed iframe, not raw text |
| Musical DNA generation completes | HTML "sonic identity card" artifact appears in DIW |
| `MANUAL_TRACK_UPLOAD: false` | Upload panel hidden, ambient-only mode |

***

### Files Codex Touches

| File | Action |
|---|---|
| `client/src/pages/MusicalDNAPage.tsx` | Restore manual upload panel as Mode B |
| `client/src/hooks/useTrackUpload.ts` | **New** |
| `client/src/features/dynamic-inner-world/InnerWorldArtifactViewer.tsx` | **New** |
| `client/src/hooks/useArtifactRenderer.ts` | **New** |
| `client/src/lib/musicalDnaAmbient.ts` | Add uploaded tracks to context assembly |
| `client/src/config/featureFlags.ts` | Add `MANUAL_TRACK_UPLOAD` flag |
| `api/musical-dna/upload.ts` | **New** |
| `supabase/migrations/YYYYMMDD_musical_dna_tracks.sql` | **New** |
