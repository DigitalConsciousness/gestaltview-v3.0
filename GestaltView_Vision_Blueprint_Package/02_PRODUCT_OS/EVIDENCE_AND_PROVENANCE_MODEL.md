# Evidence and Provenance Model

## Why provenance matters

GestaltView must not become an echo chamber that invents flattering identity claims. Every reflective claim must be backed by source material.

## Core entities

### RawCapture

Original user input or imported material.

Required fields:

- id
- user_id
- source_room
- input_type
- original_text or media reference
- created_at
- preservation_status
- privacy_level

### InnerWorldArtifact

A visible spatial representation of raw or generated material.

Required fields:

- id
- raw_capture_id or artifact_source_id
- surface
- x/y placement
- display_mode
- title
- preview
- created_at

### ScaffoldArtifact

Approved compressed memory or structural node.

Required fields:

- id
- source_ids
- context
- anchor
- meaning
- memory
- tags
- resonance
- approved_at
- approval_actor

### IdentityClaim

Reflective statement about skills, patterns, values, or tendencies.

Required fields:

- id
- claim_text
- claim_type
- support_artifact_ids
- confidence
- status: pending / approved / rejected
- generated_by
- reviewed_at

### CreationArtifact

An output from Creation Corner.

Required fields:

- id
- artifact_type
- source_ids
- blueprint_id
- output_content or file pointer
- provenance_map
- export_status
- created_at

## Evidence rule

No identity claim without at least one traceable source.

No connection without explanation.

No export without provenance.

No public share without user action.
