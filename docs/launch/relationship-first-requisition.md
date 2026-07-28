# Priority 1 Launch: Relationship-First Collaborator Requisition

Status: implementation branch; production migration not yet applied.

## Approved commercial path

Written or voice-oriented intake → founder review → firm scope and quote → full payment by default → governed collaborator build → tracked delivery and acceptance.

Alternative payment terms remain explicit, case-by-case exceptions.

## Reused commercial spine

Priority 1 uses the existing GATE machinery rather than creating another checkout lane:

- package draft and compatibility analysis
- buyer and order records
- Stripe Checkout and verified webhook
- build jobs and collaborator package assembly
- private ZIP artifact storage
- tracked order and delivery page

Priority 2 (self-serve ZIP) can later relax the founder-review gate for eligible packages. Priority 3 (hosted subscription) can reuse buyer, identity, entitlement, and delivery records without changing the first-sale promise.

## Identity boundary

The buyer shapes the work, relationship, context, memory contract, deployment, and delivery. The experience exposes embodiment profile, character study, biography, skills, quirks, provenance, boundaries, and learning rules for review. It does not describe a persistent identity as a commodity.

## Security boundary

- Browser roles receive no direct access to GATE tables or the artifact bucket.
- Order status requires an unguessable buyer token; only its SHA-256 hash is persisted.
- Stripe webhook verification remains mandatory.
- Generated ZIPs are stored in a private Supabase bucket.
- The legacy public deliverables policy is removed because the table has no ownership column.

## Environment contract

Required in the production runtime:

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_GATE_WEBHOOK_SECRET
- GATE_ADMIN_KEY
- GATE_STORAGE_BUCKET=generated-zips

Optional:

- GATE_SIGNED_URL_TTL_SECONDS (defaults to 3600)

## Deployment gate

Do not advertise or accept live payments until:

1. migration is applied and security advisors are reviewed;
2. Stripe webhook endpoint is configured for the deployed domain;
3. one test-mode purchase completes checkout → webhook → build → private artifact → authorized download;
4. order status without a buyer token returns 401;
5. the production deployment passes the focused GATE tests and build.
