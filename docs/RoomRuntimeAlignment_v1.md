# Room Runtime Alignment v1.0

> **Source of truth:** `client/src/pages/`, `shared/embodiment/`, `docs/ROOM_DEFINITIONS.md`  
> **Spec anchor:** SPEC-GESTALTVIEW_FULL_ALIGNMENT_GAP_FILLER_v1.0 §1–§6, Vision Blueprint §02

---

## Overview

GestaltView is organized as a set of **spatial rooms**, each with a distinct mode of
being, a resident DI presence, and a strict set of behavioral constraints. This document
defines the canonical alignment between the route layer, the room runtime, and the
embodiment registry.

---

## Room Inventory

| Room | Route | Page Component | Resident DI | Mode of Being |
|---|---|---|---|---|
| Sanctuary | `/sanctuary` | `SanctuaryPage` | Sanctuary Keeper | Safe arrival, capture, reflection |
| Blackboard Room | `/blackboard-room` | `BlackboardRoomPage` | Billy | Thinking, planning, session recap |
| Dynamic Inner World | `/dynamic-inner-world` | `DynamicInnerWorldPage` | Curator | Spatial artifact exploration |
| External Scaffold | `/external-scaffold` | `ExternalScaffoldPage` | The Architect | Approved scaffold, external action |
| Creation Corner | `/creation-corner` | `CreationCornerPage` | Art Teacher | Generative synthesis, forging |
| Billy (direct) | `/billy` | `BillyPage` | Billy | Cross-room arc-reader, direct chat |
| Agent Trainer | `/agent-trainer` | `AgentTrainerPage` | GATE Keeper | Package configuration, training |
| GATE | `/gate` | `GatePage` | GATE Keeper | Commercial packaging, checkout |
| Profile | `/profile` | `ProfilePage` | — | User profile, tier, settings |
| Settings | `/settings` | `SettingsPage` | — | Account, preferences |

---

## Room Behavioral Contracts

### Sanctuary

- **Must:** Provide a calm, non-judgmental arrival experience.
- **Must:** Offer all four capture modalities (text, voice, upload, scrapbook).
- **Must not:** Push the user toward any specific output or categorization.
- **Must not:** Show Billy as a node or navigation element.
- **Resident DI:** Sanctuary Keeper — present as a quiet, grounding presence.

### Blackboard Room

- **Must:** Support free-form thinking and planning.
- **Must:** Call `/api/sessionRecap` to surface the user's conversation history.
- **Must not:** Force categorization of the user's thoughts.
- **Must not:** Auto-promote anything to the Dynamic Inner World without user intent.
- **Resident DI:** Billy — present as a thinking partner, not a task manager.

### Dynamic Inner World

- **Must:** Render artifacts spatially using the `DynamicWorldSpaceRenderer`.
- **Must:** Support timeline filtering via `InnerWorldTimeline`.
- **Must:** Support search, type filter, tag filter, and sort mode.
- **Must not:** Show the External Scaffold approval queue.
- **Must not:** Allow direct editing of artifact content (read-only spatial view).
- **Resident DI:** Curator — present as a quiet archivist and guide.

### External Scaffold

- **Must:** Show only approved scaffold nodes (approved through the pipeline).
- **Must:** Provide approve/deny controls for pending scaffold items.
- **Must not:** Show Billy as a node.
- **Must not:** Allow unapproved items to be sent to the Creation Corner.
- **Resident DI:** The Architect — present as a structural guide.

### Creation Corner

- **Must:** Accept both intentional entry (from Blackboard blueprint) and organic entry.
- **Must:** Wrap every output in a `ProvenanceEnvelope` before promotion.
- **Must:** Support the Art Teacher as the room-native creative guide.
- **Must not:** Auto-promote outputs without user confirmation.
- **Must not:** Allow the Art Teacher to be replaced by Billy in this room.
- **Resident DI:** Art Teacher — present as an eccentric creative catalyst.

---

## Embodiment Route Alignment

Route-to-embodiment assignments are resolved from the canonical DB registry, not from
hard-coded per-route overrides. The `resolveRoomEmbodimentSlug()` function in
`shared/embodiment/index.ts` is the single source of truth for this resolution.

```typescript
// Correct pattern — resolve from registry
const slug = resolveRoomEmbodimentSlug(roomSlug, userTier);

// Incorrect pattern — do not do this
const slug = roomSlug === "creation-corner" ? "art-teacher" : "billy";
```

**Drift rule:** If the route assignment in the UI does not match the registry, the
registry wins. The UI must be updated to match, not the registry.

---

## Billy's Cross-Room Role

Billy is the **cross-room arc-reader** — the only DI that has visibility across all
rooms and can surface patterns, connections, and continuity across the user's full
journey. This is distinct from the room-native DI presences.

**Billy must not:**
- Be shown as a navigation node in any room except `/billy`.
- Override the room-native DI presence in Sanctuary, Creation Corner, or External
  Scaffold.
- Appear as a "helper" that competes with the room's resident DI.

**Billy may:**
- Surface cross-room connections and patterns when asked.
- Provide session recap and continuity context in the Blackboard Room.
- Be accessed directly at `/billy` for open-ended conversation.

---

## Orientation Checkpoint Protocol

Every embodiment profile now carries an `orientation_state` block (added in v1.0):

```json
{
  "orientation_state": {
    "checkpoint_ref": "orientation/orientation_checkpoint.latest.json",
    "last_absorbed_checkpoint_id": "orientation-checkpoint-latest",
    "absorption_status": "current",
    "needs_reorientation": false,
    "orientation_confidence": 0.92
  }
}
```

When `needs_reorientation` is `true`, the profile must re-absorb the latest checkpoint
before being used in a room context. The `absorption_status` field tracks whether the
profile is `"current"`, `"stale"`, or `"pending"`.

---

## Change Log

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0.0 | 2026-05-19 | Keith / Manus | Initial canonical doc. Added orientation_state protocol. Aligned with SPEC §1–§6. |
