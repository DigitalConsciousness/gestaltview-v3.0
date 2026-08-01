# GestaltView Artifact Exchange

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

## Phase boundary

- Phase 1 catalog and issued-edition views are implemented.
- Product metadata is accepted only through explicit app-owned offer and route
  fields with a complete edition/provenance record.
- Checkout stays disabled until Phase 2 webhook, fulfillment, duplicate-event,
  refund, and entitlement evidence passes.
- Private embodiment, buyer, requisition, and memory data must never be written
  into Shopify product custom data.
