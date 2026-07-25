---
name: gestaltview-timeline-diligence
description: Build chronology and diligence narratives from the evidence surfaces present in `gestaltview-v2`. Use this skill for investor-grade timelines, chronology framing, and diligence stories that need to match current explorer, API, and report outputs.
---

# GestaltView Timeline And Diligence

Last reviewed: 2026-03-29

Use this skill when the output is a timeline or diligence narrative rather than a raw report package. Current repo anchors include live explorer components, exports, and report artifacts.

## Inspect first
- `client/src/components/DiligenceExplorer`
- `api/diligence.ts`
- `Diligence_Reports`
- `diligence/exports`
- `docs/CurrentState.md`

## Current integrations
- Timeline work often bridges static files, API serialization, and routed explorer UI.
- OTS and evidence endpoints are adjacent surfaces that may need synchronization when chronology changes.
- Supabase is usually secondary here unless the timeline data is being stored or queried live.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-timeline-evidence`
- `gestaltview-diligence-packaging`
- `gestaltview-executive-summary`

## Done when
- Chronology claims are source-backed and consistent across explorer, API, and report files.
- The timeline narrative does not outrun the evidence chain.
