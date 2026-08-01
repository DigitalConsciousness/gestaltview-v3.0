-- Shopify-to-GestaltView commerce and activation spine v1.
-- Shopify remains payment authority. These records contain order identity,
-- bounded offer activation state, and receipts; they do not contain user source
-- material or grant runtime access by themselves.

create table public.storefront_offers (
  id uuid primary key default gen_random_uuid(),
  manifest_version text not null default '1.0.0',
  handle text not null unique,
  family text not null,
  activation_mode text not null check (activation_mode in ('download', 'runtime', 'human_handoff', 'hybrid')),
  runtime_provisioning_key text,
  review_status text not null default 'draft' check (review_status in ('draft', 'review', 'approved', 'retired')),
  activation_scope jsonb not null default '{}'::jsonb,
  voice_profile text not null default 'cheerful_infrastructure',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.storefront_offer_proofs (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.storefront_offers(id) on delete cascade,
  proof_ref text not null,
  label text not null,
  provenance_status text not null default 'proposed' check (provenance_status in ('observed', 'inferred', 'proposed', 'verified', 'retired')),
  created_at timestamptz not null default now(),
  unique (offer_id, proof_ref)
);

create table public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'shopify' check (platform = 'shopify'),
  shop_domain text not null,
  external_order_id text not null,
  order_name text,
  buyer_email_hash text,
  currency text,
  total_amount numeric(14,2) check (total_amount is null or total_amount >= 0),
  financial_status text,
  status text not null default 'verified_paid' check (status in ('verified_paid', 'partially_refunded', 'refunded', 'cancelled', 'disputed')),
  paid_at timestamptz,
  cancelled_at timestamptz,
  raw_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_domain, external_order_id)
);

create table public.activation_requests (
  id uuid primary key default gen_random_uuid(),
  commerce_order_id uuid not null references public.commerce_orders(id) on delete restrict,
  offer_id uuid references public.storefront_offers(id) on delete restrict,
  offer_handle text not null,
  manifest_version text not null,
  claim_token_hash text,
  runtime_provisioning_key text,
  activation_scope jsonb not null default '{}'::jsonb,
  status text not null check (status in ('pending_consent', 'ready', 'working', 'active', 'partial', 'blocked', 'failed', 'revoked')),
  status_detail text not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz,
  activated_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (commerce_order_id, offer_handle, claim_token_hash)
);

create unique index activation_requests_claim_token_uidx
  on public.activation_requests (claim_token_hash)
  where claim_token_hash is not null;

create table public.activation_receipts (
  id uuid primary key default gen_random_uuid(),
  activation_request_id uuid not null unique references public.activation_requests(id) on delete restrict,
  public_receipt_id uuid not null default gen_random_uuid() unique,
  claim_token_hash text,
  state text not null check (state in ('ready', 'pending', 'partial', 'blocked', 'failed', 'revoked')),
  headline text not null,
  detail text not null,
  known_facts jsonb not null default '[]'::jsonb,
  unknowns jsonb not null default '[]'::jsonb,
  input_preserved boolean not null default false,
  next_action_label text,
  next_action_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index activation_receipts_claim_token_uidx
  on public.activation_receipts (claim_token_hash)
  where claim_token_hash is not null;

create table public.commerce_event_log (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'shopify' check (platform = 'shopify'),
  shop_domain text not null,
  external_event_id text not null,
  topic text not null,
  payload_sha256 text not null,
  status text not null default 'processing' check (status in ('processing', 'processed', 'ignored', 'failed')),
  attempt_count integer not null default 1 check (attempt_count > 0),
  error_code text,
  error_detail text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_domain, external_event_id)
);

create index commerce_orders_status_idx on public.commerce_orders (status, updated_at desc);
create index activation_requests_status_idx on public.activation_requests (status, updated_at);
create index commerce_event_log_status_idx on public.commerce_event_log (status, updated_at);

alter table public.storefront_offers enable row level security;
alter table public.storefront_offer_proofs enable row level security;
alter table public.commerce_orders enable row level security;
alter table public.activation_requests enable row level security;
alter table public.activation_receipts enable row level security;
alter table public.commerce_event_log enable row level security;

revoke all on public.storefront_offers, public.storefront_offer_proofs, public.commerce_orders,
  public.activation_requests, public.activation_receipts, public.commerce_event_log from anon, authenticated;
grant select, insert, update, delete on public.storefront_offers, public.storefront_offer_proofs,
  public.commerce_orders, public.activation_requests, public.activation_receipts, public.commerce_event_log to service_role;

comment on table public.commerce_orders is 'Verified Shopify order identity only; never stores user source material.';
comment on table public.activation_requests is 'Idempotent bounded provisioning request; purchase alone does not authorize source-material import.';
comment on table public.activation_receipts is 'Server-read user receipt. Direct browser table access is intentionally revoked.';
