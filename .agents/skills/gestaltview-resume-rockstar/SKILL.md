---
name: gestaltview-resume-rockstar
description: Work on the Resume Rockstar lane as it currently appears in `gestaltview-v2`. Use this skill for the routed demo, supporting docs, pricing or tier framing, and ecosystem-level placement of Resume Rockstar.
---

# GestaltView Resume Rockstar

Last reviewed: 2026-03-29

Use this for the current in-repo representation of Resume Rockstar: a routed demo plus supporting context, not a fully separate mounted repo implementation inside this workspace.

## Inspect first
- `client/src/components/ResumeRockstarDemo.tsx`
- `client/src/App.tsx`
- `docs/wikis/Resume_Rockstar-wiki-v1.md`
- `api/pricing.ts`

## Current integrations
- Current runtime presence is the demo route and any pricing or tier framing around it.
- Supabase tiers and billing can become part of this lane if access is gated or subscription-backed.
- Cross-repo or future-product claims must be labeled clearly rather than treated as already implemented locally.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-apps-portfolio`
- `gestaltview-revenue-pricing`
- `gestaltview-app-runtime`

## Done when
- Live lane status is honest and aligned across demo, docs, and pricing surfaces.
- Any gating or persistence claim maps back to local code.
