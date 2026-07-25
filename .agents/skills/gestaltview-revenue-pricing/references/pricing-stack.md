# Pricing Stack

## Implemented offer ladder in repo

- **Core** — $15 monthly / $144 annual
- **Pro** — $39 monthly / $372 annual
- **Enterprise** — contact/custom pricing

## Current promise structure

- Core: Billy memory, ADHD/Brain Sparks access, Resume Rockstar, limited domain lanes
- Pro: everything in Core plus SymbioCoder, deeper responses, full domain lanes, Tapestry Engine, diligence exports
- Enterprise: white-label Billy, custom PLK training, integrations, support, SLA/security review

## Technical surfaces

- Frontend pricing copy and CTA behavior live in `client/src/pages/Pricing.tsx`
- Public price metadata comes from `api/pricing.ts`
- Checkout session creation lives in `api/stripe/checkout.ts`
- Env-backed Stripe IDs are required in `.env.example`
