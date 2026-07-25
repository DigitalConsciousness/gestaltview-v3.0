begin;

alter table public.render_jobs
  add column if not exists source_family text,
  add column if not exists source_id text,
  add column if not exists targets jsonb not null default '[]'::jsonb,
  add column if not exists idempotency_key text,
  add column if not exists request_version text not null default 'gestaltview.render-request.v2';

alter table public.render_jobs
  drop constraint if exists render_jobs_targets_array_check,
  drop constraint if exists render_jobs_status_check;

update public.render_jobs
set status = 'ready'
where status = 'completed';

alter table public.render_jobs
  add constraint render_jobs_status_check
  check (
    status = any (
      array[
        'queued'::text,
        'validating'::text,
        'rendering'::text,
        'storing'::text,
        'ready'::text,
        'failed'::text,
        'cancelled'::text
      ]
    )
  ),
  add constraint render_jobs_targets_array_check
  check (jsonb_typeof(targets) = 'array');

create unique index if not exists render_jobs_user_idempotency_key_uidx
  on public.render_jobs (user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists render_jobs_user_status_updated_idx
  on public.render_jobs (user_id, status, updated_at desc);

alter table public.render_artifacts
  add column if not exists mime_type text,
  add column if not exists storage_bucket text not null default 'codex-exports',
  add column if not exists storage_path text,
  add column if not exists byte_size bigint,
  add column if not exists content_hash text,
  add column if not exists target_status text not null default 'success';

update public.render_artifacts
set
  byte_size = coalesce(byte_size, bytes),
  mime_type = coalesce(
    mime_type,
    case lower(format)
      when 'html' then 'text/html; charset=utf-8'
      when 'svg' then 'image/svg+xml'
      when 'json' then 'application/json'
      when 'mmd' then 'text/plain; charset=utf-8'
      when 'pdf' then 'application/pdf'
      when 'png' then 'image/png'
      when 'jpg' then 'image/jpeg'
      when 'jpeg' then 'image/jpeg'
      else 'application/octet-stream'
    end
  )
where byte_size is null or mime_type is null;

alter table public.render_artifacts
  drop constraint if exists render_artifacts_target_status_check;

alter table public.render_artifacts
  add constraint render_artifacts_target_status_check
  check (target_status = any (array['success'::text, 'failed'::text, 'unsupported'::text, 'partial'::text]));

create index if not exists render_artifacts_job_user_created_idx
  on public.render_artifacts (render_job_id, user_id, created_at);

create unique index if not exists inner_world_render_projection_uidx
  on public.inner_world_artifacts (user_id, source_ref)
  where source_ref like 'render-artifact:%';

comment on column public.render_jobs.idempotency_key is
  'Server-derived hash of user, source, scene graph, and requested formats.';
comment on column public.render_jobs.targets is
  'Requested target contracts. Successful, failed, and unsupported receipts live in manifest.';
comment on column public.render_artifacts.storage_path is
  'Private storage object path; clients receive short-lived signed URLs through an authenticated API.';

commit;
