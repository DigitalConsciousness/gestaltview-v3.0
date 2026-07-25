-- GestaltView v2 — Orders, Loom, Concepts, Summaries migration
-- © 2026 Keith Soyka / GestaltView
--
-- Additive migration on top of:
--   20260311162044_new-migration.sql  (core schema)
--   20260319162400_tribunal-tables.sql (tribunal layer)
--
-- Adds:
--   • orders             — Shopify order tracking + magic_token access
--   • order_notes        — notes per order
--   • uploads            — file uploads per order
--   • deliverables       — downloadable delivery zips per order
--   • summaries          — multi-level Loom AI summaries of documents
--   • loom_annotations   — Loom engine annotations on documents
--   • concepts           — canonical knowledge graph concepts (tenant-scoped)
--   • document_concepts  — junction: documents tagged with concepts + weight
--   • annotation_concepts— junction: annotations tagged with concepts
--   • embeddings.run_id  — FK column gap from original migration
--
-- Safe to run against a live DB — all statements are additive / idempotent.
-- Remains in public schema. No search_path changes.

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
-- Revenue layer: Shopify order tracking with passwordless magic_token access.
-- magic_token allows customers to access their deliverables without login.

create table if not exists orders (
  id                uuid        primary key default gen_random_uuid(),
  shopify_order_id  text        unique,
  customer_email    text        not null,
  customer_name     text,
  product_name      text,
  order_status      text        not null default 'pending',
  magic_token       text        unique default gen_random_uuid()::text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── ORDER NOTES ───────────────────────────────────────────────────────────

create table if not exists order_notes (
  id          uuid        primary key default gen_random_uuid(),
  order_id    uuid        not null references orders(id) on delete cascade,
  note        text        not null,
  created_at  timestamptz not null default now()
);

-- ─── UPLOADS ───────────────────────────────────────────────────────────────────
-- Files uploaded by the customer as part of their order (e.g. session recordings,
-- notes, reference materials submitted for processing).

create table if not exists uploads (
  id          uuid        primary key default gen_random_uuid(),
  order_id    uuid        not null references orders(id) on delete cascade,
  file_name   text        not null,
  file_url    text        not null,
  created_at  timestamptz not null default now()
);

-- ─── DELIVERABLES ─────────────────────────────────────────────────────────────
-- Output artifacts delivered back to the customer — zip bundles, PDFs,
-- PLK snapshots, etc. Accessed via magic_token on the orders table.

create table if not exists deliverables (
  id          uuid        primary key default gen_random_uuid(),
  order_id    uuid        not null references orders(id) on delete cascade,
  zip_url     text        not null,
  created_at  timestamptz not null default now()
);

-- ─── SUMMARIES ─────────────────────────────────────────────────────────────────
-- Multi-level Loom AI summaries of documents.
-- level: 'surface' | 'deep' | 'gestalt' — matching the Loom Approach synthesis tiers.

create table if not exists summaries (
  summary_id    uuid        primary key default gen_random_uuid(),
  run_id        uuid        not null references processing_runs(run_id) on delete cascade,
  document_id   uuid        not null references documents(document_id) on delete cascade,
  level         text        not null default 'surface'
                            check (level in ('surface', 'deep', 'gestalt')),
  content       text        not null,
  created_at    timestamptz not null default now()
);

-- ─── LOOM ANNOTATIONS ──────────────────────────────────────────────────────────
-- The Loom engine's annotations produced during a processing run.
-- type: e.g. 'thread', 'resonance', 'paradox', 'bucket_drop', 'breakthrough'
-- content: the annotation body — preserved in whole language, never paraphrased.

create table if not exists loom_annotations (
  annotation_id   uuid        primary key default gen_random_uuid(),
  run_id          uuid        not null references processing_runs(run_id) on delete cascade,
  type            text        not null,
  content         text        not null,
  created_at      timestamptz not null default now()
);

-- ─── CONCEPTS ───────────────────────────────────────────────────────────────────
-- Canonical knowledge graph concepts extracted from documents and annotations.
-- tenant_id: scopes concepts per user/organization.
-- canonical: the normalized concept name used for deduplication and graph traversal.
-- name: the display name as it appeared in the source (preserves whole language).

create table if not exists concepts (
  concept_id    uuid        primary key default gen_random_uuid(),
  tenant_id     uuid        not null,
  name          text        not null,
  canonical     text        not null,
  created_at    timestamptz not null default now(),
  unique (tenant_id, canonical)
);

-- ─── DOCUMENT CONCEPTS (junction) ────────────────────────────────────────────────
-- Many-to-many: documents tagged with concepts.
-- weight: relevance score (0.0–1.0) of this concept within this document.

create table if not exists document_concepts (
  document_id   uuid        not null references documents(document_id) on delete cascade,
  concept_id    uuid        not null references concepts(concept_id) on delete cascade,
  weight        real        not null default 1.0
                            check (weight >= 0.0 and weight <= 1.0),
  primary key (document_id, concept_id)
);

-- ─── ANNOTATION CONCEPTS (junction) ───────────────────────────────────────────────
-- Many-to-many: loom annotations tagged with concepts.

create table if not exists annotation_concepts (
  annotation_id uuid        not null references loom_annotations(annotation_id) on delete cascade,
  concept_id    uuid        not null references concepts(concept_id) on delete cascade,
  primary key (annotation_id, concept_id)
);

-- ─── EMBEDDINGS: add run_id FK (gap from original migration) ────────────────────
-- The ERD shows embeddings.run_id as an FK to processing_runs.
-- Adding it as nullable so existing rows are not broken.

alter table embeddings
  add column if not exists run_id uuid references processing_runs(run_id) on delete set null;

-- ─── INDEXES ───────────────────────────────────────────────────────────────────

-- orders
create index if not exists orders_customer_email_idx     on orders (customer_email);
create index if not exists orders_shopify_order_id_idx   on orders (shopify_order_id);
create index if not exists orders_magic_token_idx        on orders (magic_token);
create index if not exists orders_status_created_idx     on orders (order_status, created_at desc);

-- order_notes
create index if not exists order_notes_order_idx         on order_notes (order_id);

-- uploads
create index if not exists uploads_order_idx             on uploads (order_id);

-- deliverables
create index if not exists deliverables_order_idx        on deliverables (order_id);

-- summaries
create index if not exists summaries_document_idx        on summaries (document_id);
create index if not exists summaries_run_level_idx       on summaries (run_id, level);

-- loom_annotations
create index if not exists loom_annotations_run_idx      on loom_annotations (run_id);
create index if not exists loom_annotations_type_idx     on loom_annotations (type);

-- concepts
create index if not exists concepts_tenant_canonical_idx on concepts (tenant_id, canonical);

-- document_concepts
create index if not exists document_concepts_concept_idx on document_concepts (concept_id);

-- annotation_concepts
create index if not exists annotation_concepts_concept_idx on annotation_concepts (concept_id);

-- embeddings run_id
create index if not exists embeddings_run_idx            on embeddings (run_id);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────────────────

alter table orders              enable row level security;
alter table order_notes         enable row level security;
alter table uploads             enable row level security;
alter table deliverables        enable row level security;
alter table summaries           enable row level security;
alter table loom_annotations    enable row level security;
alter table concepts            enable row level security;
alter table document_concepts   enable row level security;
alter table annotation_concepts enable row level security;

-- ─── POLICIES ──────────────────────────────────────────────────────────────────
-- All using safe DO $$ if not exists pattern.

-- orders: magic_token public read (customer deliverable access without login)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'orders' and policyname = 'Magic token read orders'
  ) then
    create policy "Magic token read orders"
      on orders for select to anon, authenticated
      using (true);
  end if;
end $$;

-- orders: service role full access
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'orders' and policyname = 'Service role full access orders'
  ) then
    create policy "Service role full access orders"
      on orders for all to service_role
      using (true) with check (true);
  end if;
end $$;

-- order_notes: service role only
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'order_notes' and policyname = 'Service role full access order_notes'
  ) then
    create policy "Service role full access order_notes"
      on order_notes for all to service_role
      using (true) with check (true);
  end if;
end $$;

-- uploads: service role only
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'uploads' and policyname = 'Service role full access uploads'
  ) then
    create policy "Service role full access uploads"
      on uploads for all to service_role
      using (true) with check (true);
  end if;
end $$;

-- deliverables: public read (customer downloads via magic_token)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'deliverables' and policyname = 'Public read deliverables'
  ) then
    create policy "Public read deliverables"
      on deliverables for select to anon, authenticated
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'deliverables' and policyname = 'Service role full access deliverables'
  ) then
    create policy "Service role full access deliverables"
      on deliverables for all to service_role
      using (true) with check (true);
  end if;
end $$;

-- summaries: public read
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'summaries' and policyname = 'Public read summaries'
  ) then
    create policy "Public read summaries"
      on summaries for select to anon, authenticated
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'summaries' and policyname = 'Service role full access summaries'
  ) then
    create policy "Service role full access summaries"
      on summaries for all to service_role
      using (true) with check (true);
  end if;
end $$;

-- loom_annotations: public read
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'loom_annotations' and policyname = 'Public read loom_annotations'
  ) then
    create policy "Public read loom_annotations"
      on loom_annotations for select to anon, authenticated
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'loom_annotations' and policyname = 'Service role full access loom_annotations'
  ) then
    create policy "Service role full access loom_annotations"
      on loom_annotations for all to service_role
      using (true) with check (true);
  end if;
end $$;

-- concepts: public read
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'concepts' and policyname = 'Public read concepts'
  ) then
    create policy "Public read concepts"
      on concepts for select to anon, authenticated
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'concepts' and policyname = 'Service role full access concepts'
  ) then
    create policy "Service role full access concepts"
      on concepts for all to service_role
      using (true) with check (true);
  end if;
end $$;

-- document_concepts: public read
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'document_concepts' and policyname = 'Public read document_concepts'
  ) then
    create policy "Public read document_concepts"
      on document_concepts for select to anon, authenticated
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'document_concepts' and policyname = 'Service role full access document_concepts'
  ) then
    create policy "Service role full access document_concepts"
      on document_concepts for all to service_role
      using (true) with check (true);
  end if;
end $$;

-- annotation_concepts: public read
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'annotation_concepts' and policyname = 'Public read annotation_concepts'
  ) then
    create policy "Public read annotation_concepts"
      on annotation_concepts for select to anon, authenticated
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'annotation_concepts' and policyname = 'Service role full access annotation_concepts'
  ) then
    create policy "Service role full access annotation_concepts"
      on annotation_concepts for all to service_role
      using (true) with check (true);
  end if;
end $$;
