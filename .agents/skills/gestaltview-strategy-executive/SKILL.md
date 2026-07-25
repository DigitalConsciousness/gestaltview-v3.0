---
name: gestaltview-strategy-executive
description: Shape GestaltView's commercial and strategic narrative using the current runtime, pricing, and evidence surfaces in `gestaltview-v2`. Use this skill for investor framing, partner narrative, milestone strategy, and commercialization language that must stay technically honest.
---

# GestaltView Strategy And Executive Summary

Last reviewed: 2026-03-29

Use this skill for commercial framing that still has to survive implementation review. It is not permission to oversell undeployed lanes or repo-external work as if it were already live here.

## Inspect first
- `README.md`
- `docs/OriginStory.md`
- `docs/paradox-financial-integrity-framing.md`
- `client/src/pages/Pricing.tsx`
- `docs/CurrentState.md`

## Current integrations
- Strategy must reconcile live routes, pricing tiers, Billy capabilities, and evidence surfaces.
- Diligence and marketing materials should be consistent with strategic claims rather than drifting into different stories.
- Supabase, AI, and platform details can support the strategy only when they are grounded in the current codebase.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-executive-summary`
- `gestaltview-revenue-pricing`
- `gestaltview-timeline-diligence`

## Done when
- Strategy language distinguishes live, pilot, and future stages.
- Claims remain supportable from current repo evidence.
