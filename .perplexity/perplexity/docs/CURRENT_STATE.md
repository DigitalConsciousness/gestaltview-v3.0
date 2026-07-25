# CURRENT STATE — Living Temporal Key
## Canonical Type: CurrentState
## GestaltView Orientation Spine — Load First
## Last Updated: May 2026

This document is the temporal anchor. It answers: where are we in the arc?
Without this, every AI session begins in a vacuum. With this, continuity is possible.

## Where We Are

GestaltView v2 is in integration-hardening mode. The recent work centered on the scaffold landscape:
Sanctuary is the home/entry layer, Blackboard Room is the raw capture layer, Dynamic Inner World is the
six-surface raw visual room, and External Scaffold is the compressed artifact galaxy.

The new room wiring is live in the client router, with `/whiteboard-room` kept as a redirecting alias so
older links do not break while the copy and navigation settle on Blackboard Room.

## What Changed Most Recently

1. **Scaffold handoff bundle implemented**
   - Added `client/src/pages/BlackboardRoomPage.tsx`.
   - Added `client/src/pages/DynamicInnerWorldPage.tsx`.
   - Updated `client/src/pages/ExternalScaffoldPage.tsx` to align with the artifact-only scaffold flow.
   - Kept `client/src/pages/SanctuaryPage.tsx` aligned with the new room names and navigation.

2. **Router and metadata updated**
   - `/blackboard-room` now routes to Blackboard Room.
   - `/dynamic-inner-world` now routes to Dynamic Inner World.
   - `/whiteboard-room` now redirects to `/blackboard-room`.
   - SEO and prerender metadata now point at the Blackboard Room canonical path.

3. **Scaffold compatibility layer expanded**
   - `client/src/components/Scaffold.tsx` now carries both the shared capture/storage seam and the lightweight galaxy helpers.
   - The module still uses browser `localStorage` plus custom events as the working integration seam.

4. **Legacy copy sweep partially completed**
   - User-facing references in the council and Billy framing now say Blackboard Room.
   - The legacy room route remains only as a compatibility alias.

## Why These Changes Matter

- **The handoff is now navigable:** users can move through Sanctuary, Blackboard Room, Dynamic Inner World, and External Scaffold without guessing the intended path.
- **The scaffold logic is connected:** captures can be saved, routed to the inner world, or queued for scaffold approval using one shared seam.
- **Legacy links are preserved:** older room URLs continue to work, but the visible product language now points to Blackboard Room.

## Current Risks / Open Gaps

1. Some legacy references still exist in generated docs and migration-related text.
2. `WhiteboardRoomPage.tsx` remains in the tree as a compatibility artifact, even though the router now redirects away from it.
3. The scaffold seam is still browser storage plus custom events, not the eventual server-backed system.
4. The new room set is wired, but the larger app still contains other historical naming surfaces that may need a later cleanup pass.

## Recommended Next Steps (Execution Order)

1. Remove or regenerate remaining docs that still refer to the legacy room name if you want the repo narrative fully renamed.
2. Decide whether the legacy `WhiteboardRoomPage.tsx` file should stay as an alias artifact or be removed in a later cleanup.
3. Replace the localStorage/event seam with the real persistence/event bus when the downstream storage layer is ready.

## Operational Reality

The platform is still converging, but this slice is now wired and build-verified. The scaffold handoff is
no longer a design note; it is part of the runnable client.
