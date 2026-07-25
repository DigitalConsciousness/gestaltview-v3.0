# Stripe Subscription Framework Readiness

**Last updated:** 2026-05-05  
**Status:** Framework ready, package/value-proposition inventory pending

This note captures the current billing and subscription structure so future pricing work can reshape the commercial offer without rediscovering the plumbing.

## Current surface split

- `/signup` is the billing bridge.
- `/pricing` is the checkout surface.
- `/login` is the operator gate.
- `/welcome` is the post-checkout return surface.

## Current Stripe flow

1. Visitor chooses a plan on `/signup` or `/pricing`.
2. The pricing page posts `plan`, `interval`, and optional `email` to `/api/stripe/checkout`.
3. Stripe returns a hosted checkout session.
4. Checkout success returns the buyer to `/welcome?session_id=...`.
5. The webhook updates the `users` record with the active tier and subscription state.

## Current supported tiers

- `core`
- `pro`
- `enterprise`

## Env vars that matter

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_CORE_MONTHLY`
- `STRIPE_PRICE_CORE_ANNUAL`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_ANNUAL`
- `GESTALTVIEW_PUBLIC_BASE_URL` or `VERCEL_URL`

## Current implementation anchors

- [`client/src/lib/billing.ts`](/workspaces/gestaltview-v2.0/client/src/lib/billing.ts)
- [`client/src/pages/Signup.tsx`](/workspaces/gestaltview-v2.0/client/src/pages/Signup.tsx)
- [`client/src/pages/SignIn.tsx`](/workspaces/gestaltview-v2.0/client/src/pages/SignIn.tsx)
- [`client/src/pages/Pricing.tsx`](/workspaces/gestaltview-v2.0/client/src/pages/Pricing.tsx)
- [`api/pricing.ts`](/workspaces/gestaltview-v2.0/api/pricing.ts)
- [`api/stripe/checkout.ts`](/workspaces/gestaltview-v2.0/api/stripe/checkout.ts)
- [`api/stripe/webhook.ts`](/workspaces/gestaltview-v2.0/api/stripe/webhook.ts)
- [`docs/VERCEL_ENV_CHECKLIST.md`](/workspaces/gestaltview-v2.0/docs/VERCEL_ENV_CHECKLIST.md)

## What still needs the inventory pass

- Which products are actually sold today versus legacy/demo language still lingering in copy.
- The final value proposition for each plan.
- Any pricing-page restructure needed to separate:
  - individual use
  - founder use
  - team/enterprise use
- Whether any Stripe products should be retired, renamed, or remapped.

## Readiness rule

Do not change the checkout plumbing again until the pricing inventory is complete unless the change is strictly about:

- route wiring
- webhook safety
- env-var correctness
- validation
- subscription state propagation

