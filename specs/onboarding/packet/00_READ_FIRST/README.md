# GestaltView Collaboration & Onboarding Packet

## Purpose
This packet is the governed entrypoint for human collaborators and digital intelligences working with GestaltView.

It is designed to:
- establish constitutional and operational boundaries
- provide fast orientation into the live runtime, schema, skills, and current state
- reduce reintroduction tax across handoffs
- keep machine-readable and human-readable context aligned

## This packet is not
- a raw dump of every repo file
- a transferable digital identity
- a substitute for live repo state, runtime policy, or RLS

## Source-of-truth order
1. `04_RUNTIME_AND_SCHEMA/repo_manifest.json`
2. `07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md`
3. `02_ORIENTATION/orientation_checkpoint.latest.json`
4. `02_ORIENTATION/orientation_delta.current.json`
5. `03_SKILLS_AND_ROUTING/skills_INDEX.md`
6. `docs/ContinuityStack.md` in the runtime repo when you need the canonical session restart path
7. `artifacts/README.md` in the runtime repo when you need the default bundle home

## First files to read
- `01_GOVERNANCE_FOUNDATION/GestaltView_Constitutional_Invariants.md`
- `02_ORIENTATION/orientation_checkpoint.latest.json`
- `03_SKILLS_AND_ROUTING/routing_guide.md`
- `04_RUNTIME_AND_SCHEMA/repo_manifest.md`
- `07_CURRENT_STATE_AND_EVIDENCE/current_focus.md`
- `docs/ContinuityStack.md`
- `artifacts/README.md`

## Core rule
Work from evidence, not assumption.
If live state and packet state disagree, live state wins until the packet is updated.

When the task is embodiment-specific, the packet should point the collaborator at:

- `embodiment_profiles/*.embodiment.json`
- `scripts/validate-embodiment-profiles.mjs`
- `scripts/build-embodiment-artifacts.mjs`
- `scripts/sync-embodiment-profiles.ts`

## Packet metadata
- Generated: 2026-04-14T22:48:38+00:00
- Repo: gestaltview-v2
- Version: 2.0
- Routes: 45
- API endpoints: 103
- Canonical docs: 88
