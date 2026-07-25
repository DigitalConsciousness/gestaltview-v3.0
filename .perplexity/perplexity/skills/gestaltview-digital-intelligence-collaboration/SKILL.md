---
name: gestaltview-digital-intelligence-collaboration
description: Operationalize GestaltView's current multi-model collaboration surfaces. Use this skill for Resonance Loop, Tribunal, provenance-aware multi-AI critique, and collaboration patterns that are represented in `gestaltview-v2`.
---

# Digital Intelligence Collaboration

Last reviewed: 2026-03-29

Use this for multi-model and multi-perspective collaboration flows that have runtime or documentation anchors in this repo. It should reflect live pages, shared tribunal helpers, and evidence surfaces rather than abstract collaboration philosophy alone.

## Inspect first
- `client/src/pages/ResonanceLoopPage.tsx`
- `client/src/pages/TribunalPage.tsx`
- `shared/tribunal/evaluate.ts`
- `shared/tribunal/types.ts`
- `docs/BrainTrustIntegration.md`
- `docs/ContinuityStack.md`

## Current integrations
- Collaboration surfaces are public pages and shared helpers, not only documents.
- Tribunal and evidence helpers live under `shared/tribunal/` and intersect with diligence and proof-oriented surfaces.
- Supabase matters only when collaboration outputs, evidence, or user state becomes durable data rather than transient UI logic.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-suite-orchestrator`
- `gestaltview-timeline-evidence`
- `gestaltview-context-architecture`

## Done when
- Collaboration guidance matches the live routed surfaces and helper modules.
- Provenance, storage, and evidence claims are honest about what is and is not persisted.
