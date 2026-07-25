---
name: gestaltview-marketing-social
description: Develop GestaltView's public-facing messaging using the current product and runtime reality in `gestaltview-v2`. Use this skill for landing-page copy, launch messaging, SEO framing, and social content that must stay aligned with what is actually built.
---

# Marketing And Social

Last reviewed: 2026-03-29

Use this for external language that still has to survive technical review. Marketing copy should be grounded in current routes, product lanes, pricing, and Billy capabilities rather than in aspirational summaries alone.

## Inspect first
- `README.md`
- `client/src/pages/Home.tsx`
- `client/src/components/HeroSection.tsx`
- `client/src/pages/Pricing.tsx`
- `docs/BrandVoice.md`
- `scripts/inject-seo.mjs`

## Current integrations
- Marketing copy is anchored by live routes, exhibits, pricing, and Billy surfaces.
- API, auth, and checkout realities constrain what can be promised in public messaging.
- Supabase, AI, and persistence claims should only appear when the underlying runtime path actually exists.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-executive-summary`
- `gestaltview-apps-portfolio`
- `gestaltview-revenue-pricing`

## Done when
- Public-facing language tracks the current product surface and technical reality.
- Claims about AI, data, pricing, or access are supportable from the codebase.
