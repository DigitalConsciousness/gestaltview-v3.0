create extension if not exists pgcrypto;

create table if not exists buyers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  company_name text,
  created_at timestamptz not null default now()
);

create table if not exists package_drafts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references buyers(id) on delete cascade,
  use_case_slug text not null,
  tier text not null check (tier in ('SOLO_SPARK', 'STUDIO', 'GROWTH', 'ENTERPRISE')),
  seats_requested integer not null check (seats_requested > 0),
  backend text not null check (backend in ('supabase', 'redis', 'mongodb')),
  delivery_surfaces jsonb not null default '[]'::jsonb,
  operator_pack_slugs jsonb not null default '[]'::jsonb,
  source_bundle_slugs jsonb not null default '[]'::jsonb,
  theme_preset_id text not null,
  brand_color text,
  logo_asset_path text,
  custom_notes text,
  wants_native_installer boolean not null default false,
  price_snapshot_cents integer not null default 0,
  config_hash text not null,
  status text not null default 'draft' check (
    status in (
      'draft',
      'saved',
      'awaiting_payment',
      'paid',
      'provisioning',
      'packaged',
      'delivered',
      'failed',
      'review_requested'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references buyers(id) on delete restrict,
  package_draft_id uuid not null references package_drafts(id) on delete restrict,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  currency text not null default 'usd',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  payment_status text not null default 'awaiting_payment' check (
    payment_status in ('draft', 'awaiting_payment', 'paid', 'review_requested', 'failed')
  ),
  order_status text not null default 'draft' check (
    order_status in (
      'draft',
      'awaiting_payment',
      'paid',
      'provisioning',
      'packaged',
      'delivered',
      'failed',
      'review_requested'
    )
  ),
  paid_at timestamptz,
  config_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  item_type text not null,
  item_ref text,
  label text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists build_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  package_draft_id uuid not null references package_drafts(id) on delete cascade,
  build_version integer not null default 1,
  status text not null default 'queued' check (
    status in ('queued', 'running', 'packaged', 'delivered', 'failed')
  ),
  started_at timestamptz,
  finished_at timestamptz,
  error_code text,
  error_message text,
  retry_count integer not null default 0,
  build_log jsonb not null default '[]'::jsonb
);

create table if not exists artifacts (
  id uuid primary key default gen_random_uuid(),
  build_job_id uuid not null references build_jobs(id) on delete cascade,
  artifact_type text not null,
  storage_bucket text not null,
  storage_path text not null,
  signed_url_expires_at timestamptz,
  checksum_sha256 text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  created_at timestamptz not null default now()
);

create table if not exists support_requests (
  id uuid primary key default gen_random_uuid(),
  package_draft_id uuid references package_drafts(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  request_type text not null,
  summary text not null,
  detail text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists idx_package_drafts_buyer_id on package_drafts (buyer_id);
create index if not exists idx_package_drafts_status on package_drafts (status);
create index if not exists idx_package_drafts_config_hash on package_drafts (config_hash);
create index if not exists idx_orders_buyer_id on orders (buyer_id);
create index if not exists idx_orders_package_draft_id on orders (package_draft_id);
create index if not exists idx_orders_order_status on orders (order_status);
create index if not exists idx_build_jobs_order_id on build_jobs (order_id);
create index if not exists idx_build_jobs_status on build_jobs (status);
create index if not exists idx_artifacts_build_job_id on artifacts (build_job_id);
create index if not exists idx_support_requests_order_id on support_requests (order_id);
create index if not exists idx_support_requests_package_draft_id on support_requests (package_draft_id);

create or replace function set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_package_drafts_set_updated_at on package_drafts;
create trigger trg_package_drafts_set_updated_at
before update on package_drafts
for each row
execute function set_updated_at_timestamp();

drop trigger if exists trg_orders_set_updated_at on orders;
create trigger trg_orders_set_updated_at
before update on orders
for each row
execute function set_updated_at_timestamp();
