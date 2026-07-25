create table if not exists public.gravity_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.kit_users(id) on delete cascade,
  source_title text not null,
  source_uri text null,
  source_type text null,
  source_kind text null,
  source_fingerprint text not null,
  surface_map jsonb not null default '{}'::jsonb,
  gravity_report jsonb not null default '{}'::jsonb,
  signal_weight numeric(5,3) not null default 0,
  confidence text not null default 'noise',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint gravity_reports_confidence_check
    check (confidence in ('high', 'medium', 'low', 'noise')),
  constraint gravity_reports_signal_weight_check
    check (signal_weight >= 0 and signal_weight <= 1)
);

create table if not exists public.gravity_report_fragments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.kit_users(id) on delete cascade,
  gravity_report_id uuid not null references public.gravity_reports(id) on delete cascade,
  knowledge_fragment_id uuid not null references public.knowledge_fragments(id) on delete cascade,
  chunk_index integer not null default 0,
  priority_rank integer not null default 0,
  signal_weight numeric(5,3) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint gravity_report_fragments_unique
    unique (gravity_report_id, knowledge_fragment_id),
  constraint gravity_report_fragments_signal_weight_check
    check (signal_weight >= 0 and signal_weight <= 1)
);

create index if not exists gravity_reports_user_created_idx
  on public.gravity_reports(user_id, created_at desc)
  where deleted_at is null;

create index if not exists gravity_reports_source_fingerprint_idx
  on public.gravity_reports(source_fingerprint)
  where deleted_at is null;

create index if not exists gravity_reports_confidence_idx
  on public.gravity_reports(confidence)
  where deleted_at is null;

create index if not exists gravity_reports_metadata_gin_idx
  on public.gravity_reports
  using gin (metadata jsonb_path_ops);

create index if not exists gravity_report_fragments_user_priority_idx
  on public.gravity_report_fragments(user_id, priority_rank, created_at desc)
  where deleted_at is null;

create index if not exists gravity_report_fragments_report_idx
  on public.gravity_report_fragments(gravity_report_id, priority_rank)
  where deleted_at is null;

create index if not exists gravity_report_fragments_fragment_idx
  on public.gravity_report_fragments(knowledge_fragment_id)
  where deleted_at is null;

create index if not exists gravity_report_fragments_metadata_gin_idx
  on public.gravity_report_fragments
  using gin (metadata jsonb_path_ops);

drop trigger if exists set_gravity_reports_updated_at on public.gravity_reports;
create trigger set_gravity_reports_updated_at
before update on public.gravity_reports
for each row execute function public.set_updated_at();

drop trigger if exists set_gravity_report_fragments_updated_at on public.gravity_report_fragments;
create trigger set_gravity_report_fragments_updated_at
before update on public.gravity_report_fragments
for each row execute function public.set_updated_at();
