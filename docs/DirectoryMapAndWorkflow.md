# GestaltView Directory Map and Workflow

This map is the shortest useful orientation for the current room-based build.

## Core surfaces

```text
client/src/pages/
├─ SanctuaryPage.tsx
├─ BlackboardRoomPage.tsx
├─ DynamicInnerWorldPage.tsx
└─ ExternalScaffoldPage.tsx
```

## What each module does

### `client/src/pages/SanctuaryPage.tsx`

- Entry and regulation room.
- Sets the tone for the workspace.
- Routes users toward capture, the inner world, and the external scaffold.

### `client/src/pages/BlackboardRoomPage.tsx`

- Raw capture surface.
- Holds typed and voice fragments before they are organized.
- Lets the user route a capture to saving, the Dynamic Inner World, or the External Scaffold queue.

### `client/src/pages/DynamicInnerWorldPage.tsx`

- Six-surface spatial room for uncompressed captures.
- Uses the room component to place artifacts on forward, back, left, right, ceiling, and floor surfaces.
- Lets users inspect a selected capture, optionally run Billy assist, and send the capture to the External Scaffold without destroying the original.

### `client/src/pages/ExternalScaffoldPage.tsx`

- Approved-artifact surface.
- Holds pending orbs, approved artifacts, and discovered connections.
- Billy may help check display integrity, but Billy never becomes a node or a visual artifact.

### `client/src/components/Scaffold.tsx`

- Shared capture model and persistence seam.
- Owns capture creation, storage keys, queue helpers, inner-world writes, scaffold writes, Billy assist reports, and external scaffold projection.
- Keeps localStorage and CustomEvent prototype behavior working until the storage layer is swapped.

### `client/src/components/inner-world/InnerWorldRoom.tsx`

- The visible room renderer for the Dynamic Inner World.
- Lays out the six surfaces and places captures as tangible artifacts.
- Lets the user change surfaces, inspect artifacts, and keep the room spatial instead of list-based.

### `client/src/components/inner-world/InnerWorldArtifact.tsx`

- Renders an individual capture artifact.
- Chooses a visual mode from the artifact type.
- Supports notes, waveforms, image cards, code panels, and fragment shards.

### `client/src/lib/innerWorldLayout.ts`

- Deterministic placement helper for the room.
- Uses capture identity and type to compute surface, x/y placement, scale, rotation, and display mode.
- Honors explicit placement metadata if the capture already has it.

### `client/src/components/BillyWalkthrough.tsx`

- Shared optional onboarding card for new users and curious visitors.
- Used in Sanctuary, Welcome, and the Dynamic Inner World.
- Supports both the regular platform tour and a New Year-style seasonal variant.

## Workflow

```text
Sanctuary
  ↓
Blackboard Room
  ├─ Save → saved capture pool
  ├─ Send to Dynamic Inner World → six-surface raw room
  └─ Send to External Scaffold → pending orb queue

Dynamic Inner World
  ├─ inspect capture
  ├─ optionally run Billy assist
  └─ send selected capture to External Scaffold

External Scaffold
  ├─ inspect pending orb
  ├─ approve → compressed artifact
  └─ reject → removes only the pending queue item
```

## Billy onboarding walkthrough

Optional for new users:

1. Land in the Sanctuary and orient to the room.
2. Open the Blackboard Room and capture raw material without trying to structure it first.
3. Move something into the Dynamic Inner World and inspect where it landed.
4. Use Billy only to check metadata integrity or display clarity.
5. Send the capture to the External Scaffold only when it is intentionally ready to compress.
6. Approve the pending orb if it should become a scaffold artifact.

Billy stays as a helper at the edge of the room, not as a visible scaffold entity.
