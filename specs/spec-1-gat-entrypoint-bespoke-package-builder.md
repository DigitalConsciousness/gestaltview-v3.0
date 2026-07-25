## SPEC-1-GAT-Entrypoint-Bespoke-Package-Builder

### Background

GestaltView Agent Trainer already has the core primitives needed for a buyer-safe commercial product: pricing surfaces, tier definitions, entitlement profiles, operator packs, theme presets, onboarding flows, skills management, knowledge import, and packaging scripts. The current GATEntrypoint.md describes the commercial intent clearly: turn the pricing page into a revenue entry point where buyers configure the exact package they want, pay, and immediately receive a tailored deliverable.

The opportunity is not to build an entirely separate product, but to add a bespoke vending layer on top of the existing Agent Trainer foundation. That layer should let a buyer choose:

* *Tier and seat count*

* *storage/runtime preference (Supabase, Redis, MongoDB)*

* *target surfaces (iOS, Android, Windows, CLI, Web)*

* *use case and relevant skills/tools packs*

* *initial UI preset and branding*

* *optional custom requirements*


Once payment is confirmed, the platform should automatically generate:

1. a package manifest


2. a tailored build artifact set


3. onboarding documents specific to the chosen package


4. a downloadable ZIP


5. a follow-up path for unsupported requests



This spec assumes an MVP optimized for immediate post-purchase deliverables, not full binary compilation for every OS on day one. Native installers are modeled as a later milestone behind a stable package manifest and build pipeline.

### Requirements

*Must Have*

* *Buyer can configure a package from a single entry flow beginning at the pricing page.*

*Package builder supports:*

* *tier*

* *seats*

* *data backend choice: supabase | redis | mongodb*

* *delivery surfaces: ios | android | windows | cli | web*

* *use-case profile*

* *operator packs / source bundles / skill presets*

* *UI preset and light branding inputs*


System validates incompatible combinations before checkout.

Checkout persists the exact configuration attached to the purchase.

After successful payment, package generation starts automatically.

Buyer receives a downloadable ZIP containing:

* *package manifest JSON*

* *selected config files*

* *selected packs/themes/assets*

* *environment template*

* *tailored onboarding manual*

* *install/run instructions*


Order status is visible: draft -> awaiting_payment -> paid -> provisioning -> packaged -> delivered | failed.

Admin can inspect failed builds and regenerate a package.

Unsupported requests are captured as structured notes for direct follow-up.


### Should Have

Recommendation engine suggests relevant packs, bundles, and surfaces from the selected use case.

Package summary and estimated deliverables are shown before checkout.

Buyer can save a draft config before payment.

Generated docs include selected stack, enabled features, excluded features, and next actions.

ZIP download is time-limited and access-controlled.

Buyer receives email confirmation with package summary and delivery link.


### Could Have

Embedded 3D / premium “vending machine” visual UX.

AI-assisted use-case interpreter that maps free-text goals to packs and defaults.

Automatic .exe / platform-native installer generation for approved target combinations.

White-label domain, logo pack ingestion, and theme token export.

Multi-stage build pipeline with queued retries and partial artifact delivery.


### Won’t Have in MVP

Full native compilation for every OS/mobile target.

Arbitrary code generation from free-text feature requests.

Real-time collaborative package editing.

Per-buyer custom infrastructure deployment at checkout time.

Unbounded custom pack synthesis without admin review.


Method

1. Product Method

Implement a new entry flow called GATE Entrypoint as a thin orchestration layer over existing repo capabilities.

It adds four product capabilities:

1. Configurator — collects structured buyer choices.


2. Compatibility + Recommendation Engine — validates combinations and suggests packs.


3. Checkout Orchestrator — stores configuration, creates payment session, and reconciles payment.


4. Artifact Builder — composes a deliverable ZIP and tailored docs from templates plus selected assets.



The existing repo already contains the domain primitives needed:

config/tiers.ts for tier limits/pricing anchors

config/entitlements.ts for feature gating

config/operatorPacks.ts for reusable pack choices

config/themeEngine.ts for theme presets and token exports

api/packs.ts and api/skills.ts for pack/skills handling

scripts/package-kit.sh|ps1 for packaging patterns

onboarding/docs structure that can be repurposed into generated buyer manuals


2. User Journey

1. Buyer lands on pricing page.


2. Buyer clicks Build My Package.


3. Configurator collects choices in steps:

business/use-case

tier and seats

backend

surfaces

packs and add-ons

theme / branding

custom notes



4. Engine computes:

valid combinations

recommended packs

deliverables preview

total price



5. Buyer checks out.


6. Payment webhook marks order as paid.


7. Build job creates manifest, docs, selected assets, and ZIP.


8. ZIP uploaded to private storage.


9. Buyer sees status screen and receives delivery link.



3. Architecture

@startuml
actor Buyer
actor Admin

rectangle "Frontend" {
  [Pricing Page]
  [GATE Configurator]
  [Order Status Page]
}

rectangle "Application API" {
  [Config API]
  [Checkout API]
  [Webhook API]
  [Delivery API]
  [Admin Regenerate API]
}

rectangle "Core Services" {
  [Compatibility Engine]
  [Recommendation Engine]
  [Package Composer]
  [Doc Generator]
}

database "Postgres / Supabase" {
  [buyers]
  [package_drafts]
  [orders]
  [order_items]
  [build_jobs]
  [artifacts]
  [support_requests]
}

collections "Object Storage" {
  [generated-zips]
  [generated-docs]
  [theme-assets]
}

cloud "Payments" {
  [Stripe Checkout]
}

Buyer --> [Pricing Page]
Buyer --> [GATE Configurator]
[GATE Configurator] --> [Config API]
[Config API] --> [Compatibility Engine]
[Config API] --> [Recommendation Engine]
[GATE Configurator] --> [Checkout API]
[Checkout API] --> [Stripe Checkout]
[Stripe Checkout] --> [Webhook API]
[Webhook API] --> [orders]
[Webhook API] --> [build_jobs]
[build_jobs] --> [Package Composer]
[build_jobs] --> [Doc Generator]
[Package Composer] --> [generated-zips]
[Doc Generator] --> [generated-docs]
[Package Composer] --> [artifacts]
Buyer --> [Order Status Page]
[Order Status Page] --> [Delivery API]
[Delivery API] --> [artifacts]
Admin --> [Admin Regenerate API]
[Admin Regenerate API] --> [build_jobs]
@enduml

4. Runtime Choice

For MVP, use:

Next.js app routes or API routes for the web UI and application endpoints

Stripe Checkout + webhooks for purchase flow and payment confirmation

Supabase Postgres for relational order/build state

Supabase Storage for generated ZIPs and docs

background build worker implemented first as an internal job runner triggered by webhook, then promoted to queue workers later


This matches the repo’s existing direction and keeps the first version small enough to ship.

5. Component Design

5.1 Configurator UI

Add a new component family:

components/GATEEntrypointWizard.tsx

components/GATEPackageSummary.tsx

components/GATECompatibilityWarnings.tsx

components/GATEUseCaseSelector.tsx


State model:

type DataBackend = "supabase" | "redis" | "mongodb";
type DeliverySurface = "ios" | "android" | "windows" | "cli" | "web";

interface PackageConfigDraft {
  id: string;
  buyerEmail?: string;
  companyName?: string;
  useCaseSlug: string;
  tier: "SOLO_SPARK" | "STUDIO" | "GROWTH" | "ENTERPRISE";
  seatsRequested: number;
  backend: DataBackend;
  deliverySurfaces: DeliverySurface[];
  operatorPackSlugs: string[];
  sourceBundleSlugs: string[];
  themePresetId: string;
  brandColor?: string;
  logoAssetPath?: string;
  customNotes?: string;
  wantsNativeInstaller: boolean;
}

5.2 Compatibility Engine

Rule-based first, AI-assisted later.

Sample rule model:

interface CompatibilityRule {
  id: string;
  severity: "error" | "warning" | "info";
  when: (draft: PackageConfigDraft) => boolean;
  message: string;
  resolution?: string;
}

Initial rules:

ios or android surface requires web or API access package note in MVP.

redis cannot be selected when buyer expects document storage as primary source of truth.

mongodb requires document-oriented preset and disables some Supabase-native flows.

seatsRequested must fit selected tier unless enterprise override.

native installer request only allowed for windows and cli MVP combinations.

unsupported combo converts checkout CTA into Request Review instead of Pay Now.


5.3 Recommendation Engine

Recommendation sources:

selected use case

selected backend

selected surfaces

existing operatorPacks

future skill taxonomy


Mechanism:

deterministic scoring table first

optional LLM explanation second


Scoring example:

score =
  useCaseMatch * 5 +
  backendAffinity * 3 +
  surfaceAffinity * 2 +
  tierFit * 2;

5.4 Checkout and Order Reconciliation

At checkout creation:

create package_draft

calculate price snapshot

create order

create payment session

attach order_id, draft_id, buyer_email, and config_hash


Webhook flow:

verify webhook signature

on successful payment:

mark order paid

create build_job

enqueue package generation


on generation failure:

retain paid order state

mark build failed

expose regenerate action to admin



5.5 Package Composer

Package Composer transforms a paid order into a ZIP from templates and selected assets.

Build steps:

1. fetch draft + order + entitlements


2. resolve compatibility-adjusted feature set


3. generate package.manifest.json


4. copy selected theme preset/token file


5. copy chosen pack definitions / source bundle exports


6. generate env template based on backend


7. generate docs:

README.md

ONBOARDING.md

DELIVERABLES.md

SUPPORT.md



8. include install scripts:

install.sh

install.ps1



9. zip bundle


10. upload to private storage


11. create signed delivery URL


12. mark build delivered



5.6 Documentation Generator

Use template-driven docs, not free-form generation.

Template inputs:

buyer/company

use case

chosen backend

enabled surfaces

selected packs

theme preset

excluded/not included items

first-run instructions

support escalation


This keeps docs predictable and reduces hallucination risk.

6. Data Model

@startuml
entity buyers {
  *id : uuid
  --
  email : text
  company_name : text
  created_at : timestamptz
}

entity package_drafts {
  *id : uuid
  --
  buyer_id : uuid
  use_case_slug : text
  tier : text
  seats_requested : int
  backend : text
  delivery_surfaces : jsonb
  operator_pack_slugs : jsonb
  source_bundle_slugs : jsonb
  theme_preset_id : text
  brand_color : text
  logo_asset_path : text
  custom_notes : text
  wants_native_installer : bool
  price_snapshot_cents : int
  config_hash : text
  status : text
  created_at : timestamptz
  updated_at : timestamptz
}

entity orders {
  *id : uuid
  --
  buyer_id : uuid
  package_draft_id : uuid
  stripe_checkout_session_id : text
  stripe_payment_intent_id : text
  currency : text
  subtotal_cents : int
  total_cents : int
  payment_status : text
  order_status : text
  paid_at : timestamptz
  created_at : timestamptz
}

entity order_items {
  *id : uuid
  --
  order_id : uuid
  item_type : text
  item_ref : text
  label : text
  quantity : int
  unit_price_cents : int
  metadata : jsonb
}

entity build_jobs {
  *id : uuid
  --
  order_id : uuid
  package_draft_id : uuid
  build_version : int
  status : text
  started_at : timestamptz
  finished_at : timestamptz
  error_code : text
  error_message : text
  retry_count : int
  build_log : jsonb
}

entity artifacts {
  *id : uuid
  --
  build_job_id : uuid
  artifact_type : text
  storage_bucket : text
  storage_path : text
  signed_url_expires_at : timestamptz
  checksum_sha256 : text
  byte_size : bigint
  created_at : timestamptz
}

entity support_requests {
  *id : uuid
  --
  package_draft_id : uuid
  order_id : uuid
  request_type : text
  summary : text
  detail : text
  status : text
  created_at : timestamptz
}

buyers ||--o{ package_drafts
buyers ||--o{ orders
orders ||--o{ order_items
orders ||--o{ build_jobs
build_jobs ||--o{ artifacts
package_drafts ||--o{ support_requests
@enduml

6.1 Suggested SQL Schema

create table buyers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  company_name text,
  created_at timestamptz not null default now()
);

create table package_drafts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references buyers(id) on delete cascade,
  use_case_slug text not null,
  tier text not null,
  seats_requested int not null check (seats_requested > 0),
  backend text not null check (backend in ('supabase','redis','mongodb')),
  delivery_surfaces jsonb not null default '[]'::jsonb,
  operator_pack_slugs jsonb not null default '[]'::jsonb,
  source_bundle_slugs jsonb not null default '[]'::jsonb,
  theme_preset_id text not null,
  brand_color text,
  logo_asset_path text,
  custom_notes text,
  wants_native_installer boolean not null default false,
  price_snapshot_cents int not null default 0,
  config_hash text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references buyers(id) on delete restrict,
  package_draft_id uuid not null references package_drafts(id) on delete restrict,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  currency text not null default 'usd',
  subtotal_cents int not null,
  total_cents int not null,
  payment_status text not null default 'awaiting_payment',
  order_status text not null default 'draft',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  item_type text not null,
  item_ref text,
  label text not null,
  quantity int not null default 1,
  unit_price_cents int not null,
  metadata jsonb not null default '{}'::jsonb
);

create table build_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  package_draft_id uuid not null references package_drafts(id) on delete cascade,
  build_version int not null default 1,
  status text not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  error_code text,
  error_message text,
  retry_count int not null default 0,
  build_log jsonb not null default '[]'::jsonb
);

create table artifacts (
  id uuid primary key default gen_random_uuid(),
  build_job_id uuid not null references build_jobs(id) on delete cascade,
  artifact_type text not null,
  storage_bucket text not null,
  storage_path text not null,
  signed_url_expires_at timestamptz,
  checksum_sha256 text,
  byte_size bigint,
  created_at timestamptz not null default now()
);

create table support_requests (
  id uuid primary key default gen_random_uuid(),
  package_draft_id uuid references package_drafts(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  request_type text not null,
  summary text not null,
  detail text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

7. API Design

Public / Buyer APIs

POST /api/gate/drafts

PATCH /api/gate/drafts/:id

POST /api/gate/drafts/:id/validate

POST /api/gate/checkout

GET /api/gate/orders/:id

GET /api/gate/orders/:id/download


Webhook / Internal APIs

POST /api/gate/webhooks/stripe

POST /api/gate/build-jobs/:id/run

POST /api/gate/build-jobs/:id/regenerate

POST /api/gate/support-request


8. Pricing Method

Price should be deterministic and explainable.

Formula:

total =
  base tier price
  + seat overage
  + backend premium
  + surface premium
  + selected add-ons
  + installer premium (if supported)

9. Build Algorithm

@startuml
start
:Load build_job + order + package_draft;
:Validate paid order and draft status;
if (Config valid?) then (yes)
  :Resolve entitlements;
  :Resolve packs, bundles, theme, backend templates;
  :Generate manifest JSON;
  :Generate docs from templates;
  :Stage package directory;
  :Copy assets and scripts;
  if (Native installer requested and supported?) then (yes)
    :Generate installer payload stub;
  else (no)
    :Write manual install instructions;
  endif
  :Zip staged directory;
  :Upload artifacts to storage;
  :Persist checksum and artifact rows;
  :Mark build_job delivered;
else (no)
  :Mark build_job failed;
  :Persist validation errors;
endif
stop
@enduml

Implementation

Phase 1 — Data and Contracts

1. Add SQL migrations for buyers, drafts, orders, build_jobs, artifacts, support_requests.


2. Create shared TypeScript contracts under api/_lib/contracts.ts for PackageConfigDraft, CompatibilityResult, PriceQuote, BuildJobStatus.


3. Add config modules:

config/gateUseCases.ts

config/gateCompatibility.ts

config/gatePricing.ts




Phase 2 — Frontend Flow

1. Add Build My Package CTA to AgentTrainerPricing.tsx.


2. Create wizard UI with step persistence.


3. Add preview sidebar for selected package, warnings, estimated deliverables, and price.


4. Add draft save and resume logic.



Phase 3 — Checkout

1. Implement POST /api/gate/checkout.


2. Create Checkout Session with order_id, draft_id, and config hash metadata.


3. Redirect to hosted checkout.


4. Add success/cancel return pages.



Phase 4 — Webhook + Build

1. Implement webhook verification.


2. On successful checkout:

mark order paid

create build job

invoke build runner



3. Build runner stages artifacts, zips output, uploads to storage.


4. Create signed delivery URL and persist artifact rows.



Phase 5 — Generated Docs

1. Add docs templates under templates/gate/.


2. Generate:

README.md

ONBOARDING.md

ARCHITECTURE_SUMMARY.md

SUPPORT.md



3. Include exact buyer selections and exclusions.



Phase 6 — Admin and Recovery

1. Add admin build monitor page.


2. Support regenerate and redeliver.


3. Record build logs and failure classes.



Milestones

Milestone 1 — Click-to-Configure

Pricing page links into configurator

draft persistence works

compatibility engine returns deterministic results


Milestone 2 — Paid Order Capture

checkout flow works end to end

order state machine persists correctly

success and cancel pages work


Milestone 3 — Immediate Deliverables

paid orders trigger build job

ZIP generated and uploaded

buyer can download package from status page


Milestone 4 — Tailored Documentation

onboarding manual generated per package

docs reflect backend, surfaces, packs, and theme

support escalation path included


Milestone 5 — Operational Hardening

admin retry/regenerate

signed URLs

checksums

audit trail

failure monitoring


Gathering Results

Success should be evaluated across conversion, fulfillment speed, and support burden.

Product Metrics

configurator completion rate

checkout conversion rate

percentage of buyers receiving ZIP without manual intervention

time from payment confirmation to downloadable artifact

percentage of orders diverted to manual review

attachment rate for premium packs/themes


Operational Metrics

build success rate

average build duration

storage upload failure rate

webhook reconciliation success rate

regenerate frequency


Quality Metrics

docs usefulness score from buyer survey

first-run success rate

support tickets per delivered package

refund rate tied to package mismatch


MVP Exit Criteria

The MVP is successful when:

at least 80% of supported orders are packaged automatically

median delivery time is under 5 minutes after payment confirmation

fewer than 10% of delivered orders require manual clarification

at least one supported path each exists for solo, team, and enterprise-intent buyers