---
name: gestaltview-revenue-pricing
description: Design and maintain GestaltView monetization in `gestaltview-v2`. Use this skill for tier boundaries, pricing UI, Stripe flows, upgrade prompts, and the user-tier logic that is currently wired into the repo.
---

# Revenue And Pricing

Last reviewed: 2026-03-29

Use this skill when monetization touches the live runtime. This is one of the places where Supabase is directly part of the current implementation and should be treated as a first-class dependency.

## Inspect first
- `client/src/pages/Pricing.tsx`
- `api/pricing.ts`
- `api/stripe/checkout.ts`
- `api/stripe/webhook.ts`
- `api/_lib/rateLimit.ts`
- `client/src/components/UpgradeBanner.tsx`

## Current integrations
- Stripe checkout and webhook handlers plus env-backed price metadata drive purchase flows and billing updates.
- Supabase `users` rows, user tiers, and session limits back entitlement-like behavior and access expectations.
- Frontend pricing, auth, and upgrade surfaces must agree on tier names and promises.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-strategy-executive`
- `gestaltview-schema-supabase`
- `gestaltview-app-runtime`

## Done when
- Pricing copy, Stripe handlers, and tier logic agree.
- Supabase user-tier impacts are explicit rather than implied.
