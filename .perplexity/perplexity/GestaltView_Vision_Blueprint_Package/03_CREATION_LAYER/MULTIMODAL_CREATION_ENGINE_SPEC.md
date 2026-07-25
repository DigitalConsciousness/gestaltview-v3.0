# Multimodal Creation Engine Spec

## Purpose

The multimodal creation engine lets GestaltView accept many kinds of material and produce artifacts without flattening source context.

## Supported inputs

- text captures,
- voice transcripts,
- audio files,
- images,
- videos,
- documents,
- code,
- Spotify/music-derived signals,
- screenshots,
- sketches,
- existing blueprints.

## Fusion layers

### Semantic layer

What is this about?

### Emotional/resonance layer

What does this seem to carry, and how certain is that reading?

### Provenance layer

Where did each piece come from?

### PLK layer

How should this sound so it does not become generic?

### Room context layer

Was this private Sanctuary material, active Blackboard work, raw Inner World expression, approved Scaffold memory, or an intentional Creation Corner input?

## Engine outputs

Each generated artifact must include:

- artifact body,
- artifact type,
- source map,
- confidence / uncertainty notes,
- privacy status,
- route options,
- revision history.

## Ambient scan

Ambient scan may identify coherence signals but may not create artifacts without user action.

Signals may include:

- repeated concepts,
- recurring emotional tones,
- unfinished questions,
- source clusters,
- sudden pattern shifts,
- old fragment resonating with new material.

## Safety language

Ambient suggestions should remain tentative.

Use:

> There might be something here.

Avoid:

> I know what this means.

## Data contract

```ts
type CreationSource = {
  id: string;
  sourceType: 'raw_capture' | 'inner_world_artifact' | 'scaffold_artifact' | 'blueprint' | 'file' | 'music_signal' | 'session_recap';
  sourceRoom: string;
  originalRef: string;
  privacyLevel: 'private' | 'user_approved' | 'shareable';
  excerpt?: string;
  mediaRef?: string;
  metadata?: Record<string, unknown>;
};

type CreationArtifact = {
  id: string;
  artifactType: string;
  title: string;
  body: string;
  sourceIds: string[];
  provenanceMap: Record<string, string[]>;
  status: 'draft' | 'approved' | 'exported' | 'archived';
  createdAt: string;
  updatedAt: string;
};
```
