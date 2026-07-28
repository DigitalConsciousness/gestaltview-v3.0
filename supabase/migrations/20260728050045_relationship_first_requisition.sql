-- Relationship-first collaborator requisition commerce spine.
-- Tables are server-only: the Vercel API uses service_role and no browser role
-- receives direct table or Storage access.

create table if not exists public.gate_buyers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  created_at timestamptz not null default now()
);

create unique index if not exists gate_buyers_email_lower_uidx
  on public.gate_buyers (lower(email));

create table if not exists public.gate_package_drafts (
  id uuid primary key,
  buyer_id uuid references public.gate_buyers(id) on delete set null,
  buyer_email text,
  company_name text,
  embodiment_profile_slug text not null default 'billy',
  buyer_context jsonb not null default '{"preferredChannels":[],"requestedOutcomes":[]}'::jsonb,
  sidekick_state jsonb not null default '{"session":null,"turns":[],"actions":[],"assetSelections":[],"transformations":[],"manifestHistory":[]}'::jsonb,
  use_case_slug text not null,
  tier text not null,
  seats_requested integer not null check (seats_requested between 1 and 999),
  backend text not null,
  delivery_surfaces text[] not null default '{}',
  operator_pack_slugs text[] not null default '{}',
  source_bundle_slugs text[] not null default '{}',
  theme_preset_id text not null,
  brand_color text,
  logo_asset_path text,
  custom_notes text,
  wants_native_installer boolean not null default false,
  price_snapshot_cents integer not null default 0 check (price_snapshot_cents >= 0),
  config_hash text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gate_orders (
  id uuid primary key,
  customer_email text not null,
  customer_name text,
  product_name text not null default 'GestaltView Bespoke Package',
  buyer_id uuid not null references public.gate_buyers(id) on delete restrict,
  package_draft_id uuid not null references public.gate_package_drafts(id) on delete restrict,
  access_token_hash text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  currency text not null default 'usd',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  payment_status text not null,
  order_status text not null,
  paid_at timestamptz,
  config_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gate_order_items (
  id uuid primary key,
  order_id uuid not null references public.gate_orders(id) on delete cascade,
  item_type text not null,
  item_ref text,
  label text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.gate_build_jobs (
  id uuid primary key,
  order_id uuid not null references public.gate_orders(id) on delete cascade,
  package_draft_id uuid not null references public.gate_package_drafts(id) on delete restrict,
  build_version integer not null check (build_version > 0),
  status text not null,
  started_at timestamptz,
  finished_at timestamptz,
  error_code text,
  error_message text,
  retry_count integer not null default 0 check (retry_count >= 0),
  build_log jsonb not null default '[]'::jsonb,
  unique (order_id, build_version)
);

create table if not exists public.gate_artifacts (
  id uuid primary key,
  build_job_id uuid not null references public.gate_build_jobs(id) on delete cascade,
  artifact_type text not null,
  storage_bucket text not null,
  storage_path text not null,
  signed_url_expires_at timestamptz,
  checksum_sha256 text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  download_token text not null,
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table if not exists public.gate_support_requests (
  id uuid primary key,
  package_draft_id uuid references public.gate_package_drafts(id) on delete set null,
  order_id uuid references public.gate_orders(id) on delete set null,
  request_type text not null,
  summary text not null,
  detail text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists gate_package_drafts_buyer_idx
  on public.gate_package_drafts (buyer_id, updated_at desc);
create index if not exists gate_orders_buyer_idx
  on public.gate_orders (buyer_id, created_at desc);
create index if not exists gate_orders_status_idx
  on public.gate_orders (order_status, updated_at desc);
create index if not exists gate_order_items_order_idx
  on public.gate_order_items (order_id);
create index if not exists gate_build_jobs_order_idx
  on public.gate_build_jobs (order_id, build_version desc);
create index if not exists gate_artifacts_build_idx
  on public.gate_artifacts (build_job_id);
create index if not exists gate_support_requests_order_idx
  on public.gate_support_requests (order_id, created_at);

alter table public.gate_buyers enable row level security;
alter table public.gate_package_drafts enable row level security;
alter table public.gate_orders enable row level security;
alter table public.gate_order_items enable row level security;
alter table public.gate_build_jobs enable row level security;
alter table public.gate_artifacts enable row level security;
alter table public.gate_support_requests enable row level security;

revoke all on table public.gate_buyers from anon, authenticated;
revoke all on table public.gate_package_drafts from anon, authenticated;
revoke all on table public.gate_orders from anon, authenticated;
revoke all on table public.gate_order_items from anon, authenticated;
revoke all on table public.gate_build_jobs from anon, authenticated;
revoke all on table public.gate_artifacts from anon, authenticated;
revoke all on table public.gate_support_requests from anon, authenticated;

grant all on table public.gate_buyers to service_role;
grant all on table public.gate_package_drafts to service_role;
grant all on table public.gate_orders to service_role;
grant all on table public.gate_order_items to service_role;
grant all on table public.gate_build_jobs to service_role;
grant all on table public.gate_artifacts to service_role;
grant all on table public.gate_support_requests to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'generated-zips',
  'generated-zips',
  false,
  52428800,
  array['application/zip']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- The legacy table has no owner column and therefore cannot support a safe
-- anonymous/authenticated read policy. GATE does not use this table.
drop policy if exists "Public read deliverables" on public.deliverables;
revoke select on table public.deliverables from anon, authenticated;
