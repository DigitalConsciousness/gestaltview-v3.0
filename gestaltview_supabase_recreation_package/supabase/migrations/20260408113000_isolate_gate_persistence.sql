-- Source: supabase_schema.zip/supabase/migrations/20260408113000_isolate_gate_persistence.sql
-- Canonicalized filename: 20260408113000_isolate_gate_persistence.sql

create extension if not exists pgcrypto;

create table if not exists public.gate_buyers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  company_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.gate_package_drafts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.gate_buyers(id) on delete cascade,
  buyer_email text,
  company_name text,
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

create table if not exists public.gate_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.gate_buyers(id) on delete restrict,
  package_draft_id uuid not null references public.gate_package_drafts(id) on delete restrict,
  customer_email text not null,
  customer_name text,
  product_name text,
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

create table if not exists public.gate_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.gate_orders(id) on delete cascade,
  item_type text not null,
  item_ref text,
  label text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.gate_build_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.gate_orders(id) on delete cascade,
  package_draft_id uuid not null references public.gate_package_drafts(id) on delete cascade,
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

create table if not exists public.gate_artifacts (
  id uuid primary key default gen_random_uuid(),
  build_job_id uuid not null references public.gate_build_jobs(id) on delete cascade,
  artifact_type text not null,
  storage_bucket text not null,
  storage_path text not null,
  signed_url_expires_at timestamptz,
  checksum_sha256 text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.gate_support_requests (
  id uuid primary key default gen_random_uuid(),
  package_draft_id uuid references public.gate_package_drafts(id) on delete set null,
  order_id uuid references public.gate_orders(id) on delete set null,
  request_type text not null,
  summary text not null,
  detail text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists gate_package_drafts_buyer_id_idx
  on public.gate_package_drafts (buyer_id);
create index if not exists gate_package_drafts_buyer_email_idx
  on public.gate_package_drafts (buyer_email);
create index if not exists gate_package_drafts_status_idx
  on public.gate_package_drafts (status);
create index if not exists gate_package_drafts_config_hash_idx
  on public.gate_package_drafts (config_hash);
create index if not exists gate_orders_buyer_id_idx
  on public.gate_orders (buyer_id);
create index if not exists gate_orders_package_draft_id_idx
  on public.gate_orders (package_draft_id);
create index if not exists gate_orders_payment_status_idx
  on public.gate_orders (payment_status);
create index if not exists gate_orders_order_status_idx
  on public.gate_orders (order_status);
create index if not exists gate_build_jobs_order_id_idx
  on public.gate_build_jobs (order_id);
create index if not exists gate_build_jobs_status_idx
  on public.gate_build_jobs (status);
create index if not exists gate_artifacts_build_job_id_idx
  on public.gate_artifacts (build_job_id);
create index if not exists gate_support_requests_order_id_idx
  on public.gate_support_requests (order_id);
create index if not exists gate_support_requests_package_draft_id_idx
  on public.gate_support_requests (package_draft_id);

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_gate_package_drafts_set_updated_at on public.gate_package_drafts;
create trigger trg_gate_package_drafts_set_updated_at
before update on public.gate_package_drafts
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_gate_orders_set_updated_at on public.gate_orders;
create trigger trg_gate_orders_set_updated_at
before update on public.gate_orders
for each row
execute function public.set_updated_at_timestamp();

insert into public.gate_buyers (
  id,
  email,
  company_name,
  created_at
)
select
  buyers.id,
  buyers.email,
  buyers.company_name,
  buyers.created_at
from public.buyers as buyers
where exists (
  select 1
  from information_schema.tables
  where table_schema = 'public'
    and table_name = 'buyers'
)
on conflict (id) do update
set
  email = excluded.email,
  company_name = excluded.company_name,
  created_at = excluded.created_at;

do $$
declare
  drafts_has_buyer_email boolean;
  drafts_has_company_name boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'package_drafts'
      and column_name = 'buyer_email'
  ) into drafts_has_buyer_email;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'package_drafts'
      and column_name = 'company_name'
  ) into drafts_has_company_name;

  execute format(
    $sql$
      insert into public.gate_package_drafts (
        id,
        buyer_id,
        buyer_email,
        company_name,
        use_case_slug,
        tier,
        seats_requested,
        backend,
        delivery_surfaces,
        operator_pack_slugs,
        source_bundle_slugs,
        theme_preset_id,
        brand_color,
        logo_asset_path,
        custom_notes,
        wants_native_installer,
        price_snapshot_cents,
        config_hash,
        status,
        created_at,
        updated_at
      )
      select
        drafts.id,
        drafts.buyer_id,
        %1$s,
        %2$s,
        drafts.use_case_slug,
        drafts.tier,
        drafts.seats_requested,
        drafts.backend,
        drafts.delivery_surfaces,
        drafts.operator_pack_slugs,
        drafts.source_bundle_slugs,
        drafts.theme_preset_id,
        drafts.brand_color,
        drafts.logo_asset_path,
        drafts.custom_notes,
        drafts.wants_native_installer,
        drafts.price_snapshot_cents,
        drafts.config_hash,
        drafts.status,
        drafts.created_at,
        drafts.updated_at
      from public.package_drafts as drafts
      on conflict (id) do update
      set
        buyer_id = excluded.buyer_id,
        buyer_email = excluded.buyer_email,
        company_name = excluded.company_name,
        use_case_slug = excluded.use_case_slug,
        tier = excluded.tier,
        seats_requested = excluded.seats_requested,
        backend = excluded.backend,
        delivery_surfaces = excluded.delivery_surfaces,
        operator_pack_slugs = excluded.operator_pack_slugs,
        source_bundle_slugs = excluded.source_bundle_slugs,
        theme_preset_id = excluded.theme_preset_id,
        brand_color = excluded.brand_color,
        logo_asset_path = excluded.logo_asset_path,
        custom_notes = excluded.custom_notes,
        wants_native_installer = excluded.wants_native_installer,
        price_snapshot_cents = excluded.price_snapshot_cents,
        config_hash = excluded.config_hash,
        status = excluded.status,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at
    $sql$,
    case
      when drafts_has_buyer_email
        then 'drafts.buyer_email'
      else '(
        select buyers.email
        from public.gate_buyers as buyers
        where buyers.id = drafts.buyer_id
      )'
    end,
    case
      when drafts_has_company_name
        then 'drafts.company_name'
      else '(
        select buyers.company_name
        from public.gate_buyers as buyers
        where buyers.id = drafts.buyer_id
      )'
    end
  );
end
$$;

do $$
declare
  orders_has_buyer_id boolean;
  orders_has_package_draft_id boolean;
  orders_has_customer_email boolean;
  orders_has_customer_name boolean;
  orders_has_product_name boolean;
  orders_has_checkout_session boolean;
  orders_has_payment_intent boolean;
  orders_has_currency boolean;
  orders_has_subtotal boolean;
  orders_has_total boolean;
  orders_has_payment_status boolean;
  orders_has_paid_at boolean;
  orders_has_config_hash boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'buyer_id'
  ) into orders_has_buyer_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'package_draft_id'
  ) into orders_has_package_draft_id;

  if not orders_has_buyer_id or not orders_has_package_draft_id then
    return;
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'customer_email'
  ) into orders_has_customer_email;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'customer_name'
  ) into orders_has_customer_name;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'product_name'
  ) into orders_has_product_name;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'stripe_checkout_session_id'
  ) into orders_has_checkout_session;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'stripe_payment_intent_id'
  ) into orders_has_payment_intent;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'currency'
  ) into orders_has_currency;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'subtotal_cents'
  ) into orders_has_subtotal;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'total_cents'
  ) into orders_has_total;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'payment_status'
  ) into orders_has_payment_status;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'paid_at'
  ) into orders_has_paid_at;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'config_hash'
  ) into orders_has_config_hash;

  execute format(
    $sql$
      insert into public.gate_orders (
        id,
        buyer_id,
        package_draft_id,
        customer_email,
        customer_name,
        product_name,
        stripe_checkout_session_id,
        stripe_payment_intent_id,
        currency,
        subtotal_cents,
        total_cents,
        payment_status,
        order_status,
        paid_at,
        config_hash,
        created_at,
        updated_at
      )
      select
        orders.id,
        orders.buyer_id,
        orders.package_draft_id,
        %1$s,
        %2$s,
        %3$s,
        %4$s,
        %5$s,
        %6$s,
        %7$s,
        %8$s,
        %9$s,
        coalesce(orders.order_status, 'draft'),
        %10$s,
        %11$s,
        orders.created_at,
        orders.updated_at
      from public.orders as orders
      where orders.buyer_id is not null
        and orders.package_draft_id is not null
      on conflict (id) do update
      set
        buyer_id = excluded.buyer_id,
        package_draft_id = excluded.package_draft_id,
        customer_email = excluded.customer_email,
        customer_name = excluded.customer_name,
        product_name = excluded.product_name,
        stripe_checkout_session_id = excluded.stripe_checkout_session_id,
        stripe_payment_intent_id = excluded.stripe_payment_intent_id,
        currency = excluded.currency,
        subtotal_cents = excluded.subtotal_cents,
        total_cents = excluded.total_cents,
        payment_status = excluded.payment_status,
        order_status = excluded.order_status,
        paid_at = excluded.paid_at,
        config_hash = excluded.config_hash,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at
    $sql$,
    case
      when orders_has_customer_email
        then 'orders.customer_email'
      else 'coalesce((select buyers.email from public.gate_buyers as buyers where buyers.id = orders.buyer_id), '''')'
    end,
    case
      when orders_has_customer_name
        then 'orders.customer_name'
      else 'null'
    end,
    case
      when orders_has_product_name
        then 'orders.product_name'
      else '''GestaltView Bespoke Package'''
    end,
    case
      when orders_has_checkout_session
        then 'orders.stripe_checkout_session_id'
      else 'null'
    end,
    case
      when orders_has_payment_intent
        then 'orders.stripe_payment_intent_id'
      else 'null'
    end,
    case
      when orders_has_currency
        then 'coalesce(orders.currency, ''usd'')'
      else '''usd'''
    end,
    case
      when orders_has_subtotal
        then 'coalesce(orders.subtotal_cents, 0)'
      else '0'
    end,
    case
      when orders_has_total
        then 'coalesce(orders.total_cents, 0)'
      else '0'
    end,
    case
      when orders_has_payment_status
        then 'coalesce(orders.payment_status, ''awaiting_payment'')'
      else '''awaiting_payment'''
    end,
    case
      when orders_has_paid_at
        then 'orders.paid_at'
      else 'null'
    end,
    case
      when orders_has_config_hash
        then 'coalesce(orders.config_hash, '''')'
      else ''''''
    end
  );
end
$$;

insert into public.gate_order_items (
  id,
  order_id,
  item_type,
  item_ref,
  label,
  quantity,
  unit_price_cents,
  metadata
)
select
  items.id,
  items.order_id,
  items.item_type,
  items.item_ref,
  items.label,
  items.quantity,
  items.unit_price_cents,
  items.metadata
from public.order_items as items
where exists (
  select 1
  from information_schema.tables
  where table_schema = 'public'
    and table_name = 'order_items'
)
  and exists (
    select 1
    from public.gate_orders as orders
    where orders.id = items.order_id
  )
on conflict (id) do update
set
  order_id = excluded.order_id,
  item_type = excluded.item_type,
  item_ref = excluded.item_ref,
  label = excluded.label,
  quantity = excluded.quantity,
  unit_price_cents = excluded.unit_price_cents,
  metadata = excluded.metadata;

insert into public.gate_build_jobs (
  id,
  order_id,
  package_draft_id,
  build_version,
  status,
  started_at,
  finished_at,
  error_code,
  error_message,
  retry_count,
  build_log
)
select
  jobs.id,
  jobs.order_id,
  jobs.package_draft_id,
  jobs.build_version,
  jobs.status,
  jobs.started_at,
  jobs.finished_at,
  jobs.error_code,
  jobs.error_message,
  jobs.retry_count,
  jobs.build_log
from public.build_jobs as jobs
where exists (
  select 1
  from information_schema.tables
  where table_schema = 'public'
    and table_name = 'build_jobs'
)
  and exists (
    select 1
    from public.gate_orders as orders
    where orders.id = jobs.order_id
  )
  and exists (
    select 1
    from public.gate_package_drafts as drafts
    where drafts.id = jobs.package_draft_id
  )
on conflict (id) do update
set
  order_id = excluded.order_id,
  package_draft_id = excluded.package_draft_id,
  build_version = excluded.build_version,
  status = excluded.status,
  started_at = excluded.started_at,
  finished_at = excluded.finished_at,
  error_code = excluded.error_code,
  error_message = excluded.error_message,
  retry_count = excluded.retry_count,
  build_log = excluded.build_log;

insert into public.gate_artifacts (
  id,
  build_job_id,
  artifact_type,
  storage_bucket,
  storage_path,
  signed_url_expires_at,
  checksum_sha256,
  byte_size,
  created_at
)
select
  artifacts.id,
  artifacts.build_job_id,
  artifacts.artifact_type,
  artifacts.storage_bucket,
  artifacts.storage_path,
  artifacts.signed_url_expires_at,
  artifacts.checksum_sha256,
  artifacts.byte_size,
  artifacts.created_at
from public.artifacts as artifacts
where exists (
  select 1
  from information_schema.tables
  where table_schema = 'public'
    and table_name = 'artifacts'
)
  and exists (
    select 1
    from public.gate_build_jobs as jobs
    where jobs.id = artifacts.build_job_id
  )
on conflict (id) do update
set
  build_job_id = excluded.build_job_id,
  artifact_type = excluded.artifact_type,
  storage_bucket = excluded.storage_bucket,
  storage_path = excluded.storage_path,
  signed_url_expires_at = excluded.signed_url_expires_at,
  checksum_sha256 = excluded.checksum_sha256,
  byte_size = excluded.byte_size,
  created_at = excluded.created_at;

insert into public.gate_support_requests (
  id,
  package_draft_id,
  order_id,
  request_type,
  summary,
  detail,
  status,
  created_at
)
select
  requests.id,
  requests.package_draft_id,
  requests.order_id,
  requests.request_type,
  requests.summary,
  requests.detail,
  requests.status,
  requests.created_at
from public.support_requests as requests
where exists (
  select 1
  from information_schema.tables
  where table_schema = 'public'
    and table_name = 'support_requests'
)
  and (
    requests.package_draft_id is null
    or exists (
      select 1
      from public.gate_package_drafts as drafts
      where drafts.id = requests.package_draft_id
    )
  )
  and (
    requests.order_id is null
    or exists (
      select 1
      from public.gate_orders as orders
      where orders.id = requests.order_id
    )
  )
on conflict (id) do update
set
  package_draft_id = excluded.package_draft_id,
  order_id = excluded.order_id,
  request_type = excluded.request_type,
  summary = excluded.summary,
  detail = excluded.detail,
  status = excluded.status,
  created_at = excluded.created_at;
