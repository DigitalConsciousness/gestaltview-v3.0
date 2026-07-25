-- Source: live schema reconciliation
-- Purpose: restore the richer bucket_drops promotion pipeline shape used by
-- the live database.

alter table if exists public.bucket_drops
  add column if not exists subject_id uuid,
  add column if not exists module_key text,
  add column if not exists intensity smallint not null default 5,
  add column if not exists plk_resonance_score numeric not null default 0.0,
  add column if not exists specialized_apps text[] not null default '{}'::text[],
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists stage text not null default 'raw',
  add column if not exists promoted_memory_id uuid,
  add column if not exists scored_at timestamp with time zone,
  add column if not exists promoted_at timestamp with time zone;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bucket_drops_intensity_check'
  ) then
    alter table public.bucket_drops
      add constraint bucket_drops_intensity_check
      check (intensity >= 1 and intensity <= 10);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'bucket_drops_plk_resonance_score_check'
  ) then
    alter table public.bucket_drops
      add constraint bucket_drops_plk_resonance_score_check
      check (plk_resonance_score >= 0::numeric and plk_resonance_score <= 1::numeric);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'bucket_drops_stage_check'
  ) then
    alter table public.bucket_drops
      add constraint bucket_drops_stage_check
      check (stage in ('raw', 'scored', 'promoted', 'archived'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'bucket_drops_subject_id_fkey'
  ) then
    alter table public.bucket_drops
      add constraint bucket_drops_subject_id_fkey
      foreign key (subject_id) references public.identity_subjects(subject_id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'bucket_drops_module_key_fkey'
  ) then
    alter table public.bucket_drops
      add constraint bucket_drops_module_key_fkey
      foreign key (module_key) references public.gestaltview_modules(module_key);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'bucket_drops_promoted_memory_id_fkey'
  ) then
    alter table public.bucket_drops
      add constraint bucket_drops_promoted_memory_id_fkey
      foreign key (promoted_memory_id) references public.memory_entries(id);
  end if;
end
$$;

create index if not exists bucket_drops_subject_id_idx
  on public.bucket_drops (subject_id);

create index if not exists bucket_drops_promoted_memory_id_idx
  on public.bucket_drops (promoted_memory_id);
