# Implementation Slices

## Slice 0 — Context lock

Add this package into repo docs. Ensure Codex reads it before edits.

## Slice 1 — Shared capture model

Create or stabilize:

- `CaptureEvent`
- `CaptureOrb`
- `InnerWorldArtifact`
- `ScaffoldArtifact`
- `CreationArtifact`
- `Blueprint`
- `SourceProvenance`

## Slice 2 — Service seam

Extract capture routing into:

- `client/src/lib/captureRouting.ts`
- `client/src/lib/scaffoldStorage.ts`
- `client/src/lib/innerWorldStorage.ts`
- `client/src/lib/creationArtifacts.ts`

Keep current browser storage working.

## Slice 3 — Blackboard capture wall

Add multimodal-ready controls:

- text,
- voice,
- audio upload,
- image upload,
- video upload,
- file upload,
- transcript edit,
- save,
- route to Inner World,
- route to Scaffold queue,
- merge into blueprint.

## Slice 4 — Dynamic Inner World room

Build CSS 3D room first:

- six planes,
- deterministic placement,
- type-specific artifact rendering,
- inspector,
- route selected artifact to Scaffold,
- preserve raw source after routing.

## Slice 5 — External Scaffold approval lifecycle

Implement:

- pending orb rack,
- view,
- approve,
- reject,
- delete pending only,
- archive dormant,
- restore,
- metadata editor,
- connection explanation.

## Slice 6 — Creation Corner artifact forge

Implement:

- source selector,
- blueprint builder,
- output lanes,
- provenance viewer,
- local download,
- send to Inner World,
- send to Scaffold,
- route to GATE.

## Slice 7 — Ambient emergence

Add non-invasive coherence scan:

- detect clusters,
- surface gentle suggestions,
- no auto-generation,
- no pressure counters,
- no completion metrics.

## Slice 8 — Billy room-aware layer

Implement room mode context and copy patterns.

## Slice 9 — Supabase persistence

Move from local prototype to tables only after seams are stable.

## Slice 10 — Governance and packaging

Ensure DI identities are not sold or transferred. Package reproducible frameworks and artifacts only.
