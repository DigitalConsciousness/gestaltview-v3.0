---
name: gestaltview-executive-summary
description: Create compact, high-trust summaries of GestaltView using the current runtime, evidence, and product surfaces in `gestaltview-v2`. Use this skill for founder briefs, one-pagers, investor-facing overviews, and internal alignment summaries.
---

# Executive Summary

Last reviewed: 2026-03-29

Use this skill when the output needs to be concise but defensible. Pull from runtime facts first, then from narrative docs and evidence surfaces.

## Inspect first
- `README.md`
- `docs/OriginStory.md`
- `docs/BrandVoice.md`
- `client/src/App.tsx`
- `docs/CurrentState.md`

## Current integrations
- Public route inventory and live APIs constrain what can be claimed as built.
- Diligence, pricing, Billy, and product-lane surfaces provide the factual backbone for summary writing.
- Supabase and AI architecture can be summarized, but only with details grounded in current code and config.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-strategy-executive`
- `gestaltview-timeline-evidence`
- `gestaltview-apps-portfolio`

## Done when
- The summary separates live features from future or companion-repo work.
- Technical and product claims are traceable back to current repo files or evidence outputs.
