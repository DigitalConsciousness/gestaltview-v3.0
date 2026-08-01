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

## Runtime and phase boundary

- The intent-led field station, product inspection drawers, configuration boundary,
  and Shopify Storefront API cart creation are implemented.
- Product metadata is accepted only through explicit app-owned offer and route
  fields with a complete edition/provenance record.
- `STOREFRONT_CHECKOUT_ENABLED` remains the commissioning gate. Cart code being
  present does not authorize payment: checkout stays disabled until webhook
  verification, fulfillment, duplicate-event, refund, activation-receipt, and
  entitlement evidence passes.
- Unpublished product families render as plainly unavailable compartments; they
  are not promises of present capability.
- Private embodiment, buyer, requisition, and memory data must never be written
  into Shopify product custom data.
