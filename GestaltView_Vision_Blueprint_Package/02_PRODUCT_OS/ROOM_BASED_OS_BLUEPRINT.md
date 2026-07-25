# Room-Based OS Blueprint

## Three modes of being

| Mode | Room examples | Purpose |
|---|---|---|
| Active / Contextual | Blackboard Room, Creation Corner | What is happening now |
| Accumulated / Structural | External Scaffold | What has been approved and connected over time |
| Distilled / Reflective | Dynamic Inner World, Museum of You | What the accumulation means when evidence is reviewed |

These modes must not be collapsed. Mode 2 and Mode 3 must not interrupt Mode 1.

## Core room flow

```text
Sanctuary
  ↓
Blackboard Room
  ├─ Save raw capture
  ├─ Send to Dynamic Inner World
  └─ Send to External Scaffold pending queue

Dynamic Inner World
  ├─ place raw artifacts on six surfaces
  ├─ inspect without compressing
  └─ send selected artifacts outward when ready

External Scaffold
  ├─ approve / reject / merge / archive
  ├─ preserve metadata and provenance
  └─ expose evidence to synthesis layers

Creation Corner
  ├─ deliberate synthesis
  ├─ ambient emergence
  ├─ artifact generation
  └─ export / route to GATE / return to Inner World
```

## Room-level contracts

Every room needs:

- clear mode,
- default privacy posture,
- allowed inputs,
- allowed outputs,
- DI presence rule,
- what must never happen there,
- routing targets,
- persistence expectations.

## The handoff rule

Each handoff must be visible enough that the user knows what happened, but quiet enough that the system does not become bureaucratic.

Bad handoff:

```text
Saved to memory.
```

Better handoff:

```text
Held raw in the Inner World. Not compressed into your Scaffold yet.
```

## Current implementation stance

Keep local prototype seams working while creating cleaner service boundaries. Do not replace working localStorage / CustomEvent handoffs with incomplete backend persistence in one pass.

## Future persistence model

```text
CaptureEvent
  → raw_capture_store
  → inner_world_projection
  → scaffold_queue_projection
  → approved_scaffold_artifact
  → artifact / identity / creation outputs
  → GATE package when explicitly exported
```
