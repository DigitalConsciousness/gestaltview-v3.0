---
name: gestaltview-symbiocoder
description: Work on the SymbioCoder lane as it currently appears in `gestaltview-v2`. Use this skill for the routed demo, supporting docs, helper tooling, and ecosystem-level positioning of SymbioCoder inside the current app.
---

# GestaltView SymbioCoder

Last reviewed: 2026-03-29

Use this skill for the current in-repo representation of SymbioCoder: a routed or demo-oriented lane plus supporting docs and tool(s), not a fully mounted separate product repo.

## Inspect first
- `client/src/components/SymbioCoderDemo.tsx`
- `client/src/components/VibeCoderDemo.tsx`
- `client/src/pages/SymbioCodingPage.tsx`
- `tools/symbiocoder_edit.ts`
- `docs/wikis/SymbioCoder_v2.0-wiki-v1.md`

## Current integrations
- Current presence is UI and tooling oriented rather than a full in-repo product subsystem.
- Pricing or tier gating can become relevant through the same auth and billing surfaces used elsewhere in the app.
- Supabase only becomes part of SymbioCoder if stored user state or retrieval-backed flows are implemented locally.

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
- Live demo and tool status is accurately described.
- Future product claims are labeled instead of being passed off as current local implementation.
