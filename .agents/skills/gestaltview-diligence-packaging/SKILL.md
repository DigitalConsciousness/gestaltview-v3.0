---
name: gestaltview-diligence-packaging
description: Assemble or refine investor and diligence packages from the evidence surfaces present in `gestaltview-v2`. Use this skill when working on report bundles, exports, explorer outputs, or founder-facing diligence summaries.
---

# GestaltView Diligence Packaging

Last reviewed: 2026-03-29

Use this skill for turning evidence into packages that someone external can actually review. The current repo includes both source report folders and live explorer or API surfaces, and the package should reflect that blend.

## Inspect first
- `Diligence_Reports`
- `diligence/exports`
- `client/src/components/DiligenceExplorer`
- `api/diligence.ts`
- `tools/generate_diligence_report.ts`

## Current integrations
- Diligence packaging bridges static report files, routed UI, and Vercel API responses.
- OTS and timeline evidence may come through dedicated endpoints and explorer components that need to stay in sync with report outputs.
- Supabase is adjacent rather than primary here unless packaging pulls live user, corpus, or stored evidence data.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-timeline-evidence`
- `gestaltview-executive-summary`
- `gestaltview-workflow-operations`

## Done when
- Package guidance matches the current files, exports, and endpoints in this repo.
- Evidence provenance survives the packaging step without being flattened or obscured.
