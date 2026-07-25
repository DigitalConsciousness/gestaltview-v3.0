---
name: gestaltview-blackboard-room
description: Understand and explain GestaltView's Blackboard Room as the capture and working surface, including Sanctuary, Tribunal, Dynamic Inner World, External Scaffold, Creation Corner, Billy behavior, room transitions, and session recap/summary logic. Use this skill whenever the user asks about the purpose of each room, how Blackboard integrates with Tribunal, or how material moves from raw capture into synthesis and output.
---

# GestaltView Blackboard Room

Last reviewed: 2026-06-24

Use this skill when the task is to explain or modify the Blackboard-side room model of GestaltView. It is the room-level doctrine for the capture path, the deliberation path, and the handoff path that move material from raw expression into approved output.

## Inspect first

- `client/src/App.tsx`
- `client/src/pages/SanctuaryPage.tsx`
- `client/src/pages/BlackboardRoomPage.tsx`
- `client/src/lib/blackboardDiRouting.ts`
- `client/src/lib/blackboardRecapArtifacts.ts`
- `client/src/components/SessionRecapGenerator.tsx`
- `client/src/components/capture/BlackboardCompanionChat.tsx`
- `client/src/pages/TribunalPage.tsx`
- `client/src/lib/billy-runtime-guide.ts`
- `client/src/lib/billy-system-prompt.ts`
- `client/src/lib/BillyEngine.ts`
- `client/src/lib/transcriptory.ts`
- `docs/CurrentState.md`
- `docs/ROOM_DEFINITIONS.md`
- `docs/CodexOutsideInTranslationLayer.md`
- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/ONE_PAGE_NORTH_STAR.md`
- `GestaltView_Vision_Blueprint_Package/02_PRODUCT_OS/ROOM_BASED_OS_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/02_PRODUCT_OS/ROOM_CONTRACTS.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/CREATION_LAYER_MASTER_SPEC.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/MULTIMODAL_CREATION_ENGINE_SPEC.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/RAPID_PROTOTYPE_TO_CREATION_CORNER_HANDOFF.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/ART_TEACHER_AND_LIVE_DI_PRESENCE.md`

## Current integrations

- Sanctuary is the arrival and regulation room.
- Blackboard Room is the raw capture and active working surface.
- Tribunal is the deliberation, debate, roundtable, recap, and summary room that sits adjacent to Blackboard rather than outside the capture path.
- Dynamic Inner World makes raw expression spatially visible.
- External Scaffold compresses, approves, and prepares material for downstream export.
- Creation Corner turns approved material into real outputs.
- Billy is a room-aware witness and guide, not a generic chatbot center.
- DI runtime may answer in Blackboard depending on the routing rules, but the room logic should still distinguish DI, Billy fallback, and retry behavior.
- Session recap artifacts and summary outputs are downstream products of Blackboard and Tribunal activity.

## Room Map

### Sanctuary

Sanctuary is where the user arrives, regulates, and reflects before work becomes structured. It should never be treated like a production workspace or an output factory.

### Blackboard Room

Blackboard is where raw material lands. It is intentionally unforced, capture-first, and tolerant of fragments, sketches, transcripts, notes, and loose thinking.

Blackboard should:

- preserve the original signal
- accept incomplete thought
- avoid premature compression
- keep Billy present as a witness and guide
- hand material to other rooms only when the user or the runtime explicitly asks for it

### Tribunal

Tribunal is the deliberation and summary room. It is integrated with Blackboard because the live runtime now uses it for roundtable, debate, recap, and multi-voice summarization flows.

Tribunal should:

- allow multiple voices to deliberate
- produce recap and summary artifacts when appropriate
- support roundtable and debate behavior
- stay distinct from the raw capture surface even though it belongs to the same room family

### Dynamic Inner World

Dynamic Inner World makes expression spatial and visible. Use it when the material should be experienced as a room or exhibit rather than only as a text stream.

### External Scaffold

External Scaffold is the approval and compression layer. It exists to reduce raw material into a shaped form only after the user has approved the move.

### Creation Corner

Creation Corner is where approved material becomes real output. It is the place for making, not merely discussing.

## Transition Logic

The Blackboard skill must teach the canonical flow:

`capture as-is -> preserve original signal -> place in a visible room -> let the user walk around it -> compress only by approval -> synthesize only with evidence -> export only with consent`

It should also explain the main branches:

- Blackboard -> Tribunal when the user wants deliberation, recap, debate, or roundtable processing.
- Blackboard -> Dynamic Inner World when the material should become spatial and visible.
- Blackboard -> External Scaffold when the material needs compression or approval before export.
- Blackboard -> Creation Corner when the material is ready to become a real output.

## Blackboard Response Logic

In the Blackboard lane, the skill should explain:

- when Billy speaks versus when the DI runtime is used
- how fallback, retry, or pass behavior is handled without collapsing the room into one generic assistant
- how the room remains responsive even if a DI path is unavailable
- why raw capture should remain distinct from synthesized recap

If the task is about code, the skill should inspect `blackboardDiRouting.ts` and the current room page before making changes.

## Tribunal Recap And Summary Logic

The Blackboard skill should explicitly include Tribunal recap and summary behavior because the two rooms are integrated in the current runtime.

The skill should explain:

- roundtable and debate mode behavior
- how a session recap is produced
- how a Tribunal summary differs from raw transcript capture
- when recap artifacts should move downstream into Inner World or Creation Corner
- why recap and summary are handoff products, not replacements for the original conversation

## Guardrails

- Do not collapse Blackboard into a generic chatbot.
- Do not treat Tribunal as a novelty surface detached from the capture path.
- Do not force the user to structure material before the system offers safety.
- Do not erase raw capture when summarizing or recapping.
- Do not make export or creation happen without the right approval boundary.
- Do not absorb Transcriptory storage or ingestion logic into this skill.

## Workflow

1. Read the room and blueprint anchors first.
2. Confirm whether the task is about room purpose, routing, recap, or a code path that supports the Blackboard lane.
3. Keep Blackboard, Tribunal, Dynamic Inner World, External Scaffold, and Creation Corner distinct in language and behavior.
4. Update the matching runtime, docs, and catalog surfaces when the room contract changes.
5. Validate with the lightest meaningful checks for the touched surface.

## Compose with

- `gestaltview-vision-blueprint`
- `gestaltview-digital-intelligence-collaboration`
- `gestaltview-app-runtime`
- `gestaltview-current-state-maintenance`
- `gestaltview-workflow-operations`

## Done when

- A future agent can explain the Blackboard/Tribunal room system without reading unrelated docs.
- The skill clearly distinguishes room purpose, transition logic, recap behavior, and downstream handoff.
- The wording matches the current live runtime rather than older whiteboard-room or generic-chat assumptions.
- Transcriptory and Creation Layer boundaries remain explicit.
