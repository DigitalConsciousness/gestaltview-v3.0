# Project Convergence Sprint commissioning

## Fixed contract

- Offer: `project-convergence-sprint` / manifest `1.0.0`
- Product: `gid://shopify/Product/8985408208975`
- Variant: `gid://shopify/ProductVariant/46345021718607`
- Price: `$495.00 USD`, one line, quantity one, no discount
- Fulfillment: founder-owned `human_handoff`
- Capacity: Shopify inventory tracking on, overselling off, quantity two

Buyer project material, repository credentials, private URLs, intake narrative,
analysis, and deliverables never enter Shopify or commerce persistence. Initial
intake uses a restricted client workspace shared only with the checkout email;
the commerce record holds no workspace URL.

## Protected-preview checklist

1. Keep the Shopify product draft and checkout disabled.
2. Apply the canonical migration and verify RLS plus service-role-only RPC grants.
3. Configure secrets directly in the protected deployment environment.
4. Confirm `/api/health` reports the exact schema, offer, and capacity.
5. Register only `orders/paid`, `orders/cancelled`, and `refunds/create` using the
   same app whose secret is deployed.
6. Run one controlled checkout with no customer source material.
7. Verify one event, order, activation, and receipt; replay the event ID and a new
   event ID without changing the claim state.
8. Verify claim issuance, one redemption, replay rejection, expiry, safe reissue,
   and generic mismatch responses.
9. Verify refund and cancellation independently; history must remain intact.
10. Disable checkout again. Publication and public checkout need separate approval.

Apply the migration as a file (`supabase db push` through the repository's linked
workflow, or `psql -v ON_ERROR_STOP=1 -f <file>`). Do not interpolate its text
inside a shell double-quoted SQL argument: the shell will remove PostgreSQL's
`$$` function-body delimiters and produce an `AS DECLARE` syntax error. A parse
failure occurs before this transaction commits; correct the invocation and run
the complete file again rather than continuing from an interior statement.

## Recovery

Disable checkout first. Draft or archive the product, withdraw the runtime offer
mapping, and keep webhook handling operational for historical refunds and
cancellations. Never recover by deleting paid orders, events, activations, or
receipts.
