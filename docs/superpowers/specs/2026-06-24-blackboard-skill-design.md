# Blackboard Skill Design

**Date:** 2026-06-24
**Target skill:** `gestaltview-blackboard-room`
**Purpose:** Define a new GestaltView skill that teaches the Blackboard/Tribunal room system as it exists in the current runtime, including room purpose, transition logic, capture behavior, DI/Billy routing, and Tribunal recap/summary flows.

## Summary

The current GestaltView runtime no longer fits a generic “chat room” mental model. Blackboard Room is the raw capture and working surface, Tribunal is the deliberation surface that now participates in session recap and summary flows, and downstream rooms such as Dynamic Inner World, External Scaffold, and Creation Corner depend on explicit handoff logic. The new Blackboard skill should explain that entire path from the Blackboard perspective.

This skill is intended to help future agents understand:

1. What each room is for.
2. How material moves between rooms.
3. When Billy speaks versus when the DI runtime is used.
4. How Tribunal roundtable and debate behavior produces summaries and recap artifacts.
5. What should be preserved, compressed, synthesized, or exported, and when.

## Skill Boundary

### In scope

- Sanctuary as the arrival and regulation room.
- Blackboard Room as the raw capture and working room.
- Tribunal as the deliberation and recap room.
- Dynamic Inner World as the spatially visible expression room.
- External Scaffold as the approval and compression layer.
- Creation Corner as the artifact-making room.
- Billy as the room-aware witness and guide.
- DI/Billy response routing inside Blackboard and Tribunal-adjacent flows.
- Session recap, summary, and handoff artifacts created from Blackboard and Tribunal work.
- The transition logic that moves material from capture to recap to synthesis to output.

### Out of scope

- Transcriptory storage and ingestion details beyond what Blackboard directly consumes.
- Deep Supabase maintenance unrelated to Blackboard or Tribunal behavior.
- Generic app-runtime guidance that belongs in the broader runtime skill.
- Creation Engine implementation details that are owned by the Creation Layer skill.

## Skill Goal

When a future agent loads this skill, it should leave with a clear operational model of the GestaltView room system from the Blackboard side:

- Blackboard is where raw material lands.
- Tribunal is where multi-DI deliberation and summary work happens.
- Creation Corner is where approved outputs are made.
- External Scaffold is where compression and approval happen.
- Dynamic Inner World is where raw expression becomes spatial and visible.
- Billy is the room-aware witness who adapts to the room instead of collapsing all rooms into one chatbot.

## Design Requirements

### 1. Room map and purpose

The skill must describe each room in plain language and distinguish their roles:

- Sanctuary: arrive, regulate, reflect.
- Blackboard Room: capture raw active work without forcing premature structure.
- Tribunal: deliberate, debate, roundtable, summarize, and recap.
- Dynamic Inner World: make raw expression spatially visible.
- External Scaffold: compress and approve before downstream export.
- Creation Corner: create real outputs from approved material.

### 2. Transition logic

The skill must explain the intended flow between rooms:

`capture as-is -> preserve original signal -> place in a visible room -> let the user walk around it -> compress only by approval -> synthesize only with evidence -> export only with consent`

It should also explain where the flow branches:

- Blackboard -> Tribunal when the user is asking for deliberation, recap, or multi-voice summary.
- Blackboard -> Dynamic Inner World when the material should become spatial and visible.
- Blackboard -> External Scaffold when the material needs compression or approval before export.
- Blackboard -> Creation Corner when the material is ready to become a real output.

### 3. Tribunal integration

The skill must treat Tribunal as part of the Blackboard ecosystem rather than a separate unrelated room.

It should cover:

- Roundtable and debate mode behavior.
- Session recap generation.
- Summary behavior for multi-voice deliberation.
- How Tribunal outputs can become downstream artifacts or handoff material.
- When Tribunal should remain a deliberation space versus when it should hand material into creation or recap workflows.

### 4. Billy and DI behavior

The skill must explain the difference between Billy and the broader DI runtime in the Blackboard flow:

- Billy is a room-aware witness and guide.
- Billy should adapt to the room context rather than flattening every room into chat.
- DI responses may be used in Blackboard depending on the current routing rules.
- Fallback or retry behavior should be described as part of room logic, not hidden as an implementation detail.

### 5. Capture and recap logic

The skill must document the Blackboard capture path and the recap path:

- raw captures remain raw until the user approves further organization.
- session recap and summary are downstream products of Blackboard and Tribunal activity.
- recap artifacts should be described as handoff material that can move into Inner World or creation flows when appropriate.

### 6. Guardrails

The skill must warn against the common failure modes that would break the product:

- Do not collapse Blackboard into a generic chatbot.
- Do not treat Tribunal as a standalone novelty surface.
- Do not force the user to structure material before the system offers safety.
- Do not erase raw capture when summarizing or recapping.
- Do not make export or creation happen without the right approval boundary.

## Recommended Skill Content Structure

The final `SKILL.md` should be organized as:

1. Purpose and trigger guidance.
2. Inspect-first files.
3. Room map and room purposes.
4. Blackboard capture and response logic.
5. Tribunal integration and recap behavior.
6. Handoff logic into Dynamic Inner World, External Scaffold, and Creation Corner.
7. Guardrails and anti-patterns.
8. Compose-with references.

## Proposed Trigger Language

The skill should trigger when the user asks about:

- Blackboard Room.
- room purpose or room transitions.
- raw capture behavior.
- Tribunal roundtable or debate behavior.
- session recap or summary flows.
- Billy behavior in the Blackboard lane.
- how material moves from Blackboard into other rooms.
- the logic of the current room system from the capture side.

Suggested description:

> Understand and explain GestaltView’s Blackboard Room as the capture and working surface, including Sanctuary, Tribunal, Dynamic Inner World, External Scaffold, Creation Corner, Billy behavior, room transitions, and session recap/summary logic. Use this skill whenever the user asks about the purpose of each room, how Blackboard integrates with Tribunal, or how material moves from raw capture into synthesis and output.

## Files the skill should inspect first

- `client/src/pages/BlackboardRoomPage.tsx`
- `client/src/lib/blackboardDiRouting.ts`
- `client/src/lib/blackboardRecapArtifacts.ts`
- `client/src/components/SessionRecapGenerator.tsx`
- `client/src/components/capture/BlackboardCompanionChat.tsx`
- `client/src/lib/transcriptory.ts`
- `client/src/lib/billy-runtime-guide.ts`
- `client/src/lib/BillyEngine.ts`
- `client/src/pages/TribunalPage.tsx`
- `docs/CurrentState.md`
- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/ONE_PAGE_NORTH_STAR.md`
- `GestaltView_Vision_Blueprint_Package/02_PRODUCT_OS/ROOM_BASED_OS_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/02_PRODUCT_OS/ROOM_CONTRACTS.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/CREATION_LAYER_MASTER_SPEC.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/MULTIMODAL_CREATION_ENGINE_SPEC.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/RAPID_PROTOTYPE_TO_CREATION_CORNER_HANDOFF.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/ART_TEACHER_AND_LIVE_DI_PRESENCE.md`

## Non-goals

- This skill does not replace the Creation Layer skill.
- This skill does not replace the Transcriptory skill.
- This skill does not replace the app-runtime skill.
- This skill does not become a generic Billy prompt-design skill.

## Acceptance Criteria

The skill is complete when:

- A future agent can explain the Blackboard/Tribunal room system without reading unrelated docs.
- The skill clearly distinguishes room purpose, transition logic, recap behavior, and downstream handoff.
- The skill’s scope does not bleed into Transcriptory or Creation Layer implementation details.
- The wording matches the current live runtime rather than older whiteboard-room or generic-chat assumptions.
