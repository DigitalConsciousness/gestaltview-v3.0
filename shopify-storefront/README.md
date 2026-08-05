# GestaltView Field Vending Station

Standalone Next.js/Vercel storefront for GestaltView's Shopify-backed public
catalog. Shopify owns public artifact products, variants, prices, and later
checkout. The primary GestaltView application remains authoritative for
collaborator requisitions and governed relationship data.

## Local development

Copy the values described in `shopify.env.example.txt` into `.env.local`, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). When Shopify is not
configured, the app intentionally renders the free orientation and custom
requisition fallback paths while keeping paid issuance disabled.

## Vercel environment

- `SHOPIFY_STORE_DOMAIN`: connected `*.myshopify.com` domain.
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: server-only Headless channel token.
- `GESTALTVIEW_APP_URL`: canonical primary application origin.
- `STOREFRONT_PUBLIC_ENABLED`: enables live Shopify catalog retrieval.
- `STOREFRONT_CHECKOUT_ENABLED`: must remain false during Phase 1.

Do not prefix Shopify credentials with `NEXT_PUBLIC_`.

## Project Convergence Sprint commerce boundary

The `$495 USD` Project Convergence Sprint is the first paid bay. Its public
contract is at `/store/project-convergence-sprint`; `/activate` performs a
rate-limited order/email claim after a verified paid event.

The deployment exposes exactly four commerce functions:

- `POST /api/checkout` resolves only the approved Sprint manifest and remains
  disabled unless service-only runtime readiness passes.
- `POST /api/webhook-shopify` reads at most 1 MiB once, verifies those exact raw
  bytes, and then sends one sanitized command to a transactional Supabase RPC.
- `POST /api/claim` issues and consumes one-time, peppered, 30-minute claims.
- `GET /api/health` reports secret-free configuration, schema, offer, capacity,
  and checkout readiness.

Run `npm test`, `npm run lint`, and `npm run build` before commissioning. Apply
`../supabase/migrations/202608040001_storefront_transactional_webhook_and_claims.sql`
through the authorized root Supabase workflow before configuring the preview.
Apply it as a migration file; do not pass its contents inside a shell
double-quoted SQL string, which strips PostgreSQL `$$` function delimiters.

Register only `orders/paid`, `orders/cancelled`, and `refunds/create` against
`/api/webhook-shopify`. The subscribing app and `SHOPIFY_APP_CLIENT_SECRET` must
be the same app. Keep the product draft and `STOREFRONT_CHECKOUT_ENABLED=false`
until a controlled order, duplicate replay, claim, expiry/reissue, refund, and
cancellation pass.

Rollback order is: disable checkout, return the product to draft/archive,
withdraw its runtime mapping, then preserve webhooks and all paid-order history
for later refunds and cancellations.

## Runtime and phase boundary

- The intent-led field station, product inspection drawers, configuration boundary,
  and Shopify Storefront API cart creation are implemented.
- Product metadata is accepted only through explicit app-owned offer and route
  fields with a complete edition/provenance record.
- `STOREFRONT_CHECKOUT_ENABLED` remains the commissioning gate. Cart code being
  present does not authorize payment: checkout stays disabled until webhook
  verification, fulfillment, duplicate-event, refund, activation-receipt, and
  entitlement evidence passes.
- A verified paid webhook creates the receipt. The buyer claims it using the
  Shopify order name and checkout email; claim tokens use URL fragments, are
  never stored in browser storage, and are consumed once.
- Unpublished product families render as plainly unavailable compartments; they
  are not promises of present capability.
- Private embodiment, buyer, requisition, and memory data must never be written
  into Shopify product custom data.
