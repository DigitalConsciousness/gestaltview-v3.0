---
name: gestaltview-timeline-evidence
description: Build and defend exact-date, provenance-aware evidence chains using the current proof surfaces in `gestaltview-v2`. Use this skill for OTS handling, claim maps, dated evidence narratives, and proof-oriented diligence work.
---

# Timeline And Evidence

Last reviewed: 2026-03-29

Use this skill when precision matters more than narrative smoothness. Every assertion should be traceable to a local file, endpoint, export, or explicitly named external artifact.

## Inspect first
- `api/diligence/ots.ts`
- `api/diligence.ts`
- `client/src/components/DiligenceExplorer/useOTSData.ts`
- `Diligence_Reports`
- `diligence/exports`

## Current integrations
- OTS and evidence explorer code provide the current live proof surface.
- Generated reports and exports are supporting artifacts that must preserve provenance rather than flatten it.
- Supabase only matters when the evidence chain references stored corpus or user-linked records instead of local files and exports.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-timeline-diligence`
- `gestaltview-diligence-packaging`
- `gestaltview-cross-repo-sync`

## Done when
- Dates, provenance, and supporting artifacts are explicit and traceable.
- No evidence claim relies on unstated or unseen sources.
