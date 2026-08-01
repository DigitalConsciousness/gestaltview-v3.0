# Shopify storefront Phase 0 offer and security audit

Date: 2026-08-01  
Scope: repository evidence only; no connected-store, Vercel, Stripe, or production Supabase mutation was performed.

## Canonical offer map

| Offer | Canonical route | Authority | Launch state |
|---|---|---|---|
| Orientation Dossier | `/orientation`, issued from `/store` | GestaltView public content | Available without account or payment |
| Paid authored artifacts | `/store/artifacts/:handle` | Shopify public catalog | Catalog/deep view only; checkout gated for Phase 2 |
| Custom GestaltView Collaborator | `/collaborator-requisition` | GATE + founder review + Stripe | Flagship requisition route |
| Existing consulting narrative | `/consulting` | GestaltView informational content | Context only; CTA routes to requisition |
| Hosted access | `/agent-trainer/runtime` | Existing runtime | Not offered by the storefront; commercial launch deferred |

Legacy `/pricing`, `/agent-trainer`, and `/agent-trainer/pricing` routes now converge on `/store`. The large legacy pricing components remain in source for evidence and later reconciliation, but are no longer canonical public offer records.

## Price and promise inventory

- `Pricing.tsx` contains Core/Pro constants and Stripe checkout behavior.
- `AgentTrainerPricing.tsx` contains hosted tiers, a $2,400 ZIP offer, consulting offers from $150/hour through $5,000+, and direct checkout behavior.
- `ServicesConsulting.tsx` contains $297, $1,500–$5,000, and $10,000–$50,000+ legacy ranges.
- The approved storefront record supersedes those public promises: orientation is free; the Field Manual target is $29 after Shopify publication; Studio is $89 only after entitlement security; custom collaborator work is founder-scoped at $1,500–$5,000+.

Prices for Shopify-backed artifacts are never read from these React constants. The storefront adapter reads variant prices from Shopify and rejects products lacking explicit app-owned route metadata or required edition provenance.

## Supabase and private-buyer audit

Migration `20260728050045_relationship_first_requisition.sql` is the current GATE security boundary. It enables RLS on buyer, draft, order, item, build, artifact, and support tables; revokes `anon` and `authenticated`; grants service-role access only; makes generated ZIP storage private; and removes the unsafe public `deliverables` policy.

The audit does not establish that this migration is applied in production. Production migration status, two-identity denial evidence, storage signing behavior, Shopify plan eligibility, and GATE/Stripe health remain release blockers.

## Data separation

The Phase 1 Shopify query allowlists title, handle, description, featured image, variants/prices, and three app-owned public metadata fields. It does not request buyer data, Supabase identifiers, embodiment profiles, biographies, memory material, access tokens, internal manifests, or Admin API objects.

## Commissioning checklist

1. Link `shopify.app.toml` to the connected app with Shopify CLI and replace generated app/origin values.
2. Deploy definitions before writing any product values.
3. Create test products and populate explicit `offer_kind`, `commerce_route`, and complete edition references.
4. Configure only server-side variables from `config/shopify.env.example` in Vercel.
5. Keep `STOREFRONT_CHECKOUT_ENABLED=false` until Phase 2 is separately authorized and verified.
6. Verify the connected Shopify plan supports checkout and publish required store policies.
7. Apply and test the approved GATE migration in the intended Supabase environment with two identities.

## Phase 0 disposition

Repository offer routing and the modeled security posture are reconciled. External operational facts remain unobserved, so the Phase 2 gate remains closed.
