alter table public.user_files
  add column if not exists filename text,
  add column if not exists file_type text,
  add column if not exists file_size_bytes bigint,
  add column if not exists uploaded_at timestamptz;

alter table public.inner_world_artifacts
  add column if not exists content_type text,
  add column if not exists content_ref jsonb,
  add column if not exists display_order integer not null default 0;

update public.user_files
set
  filename = coalesce(filename, name),
  file_type = coalesce(file_type, mime_type),
  file_size_bytes = coalesce(file_size_bytes, size_bytes),
  uploaded_at = coalesce(uploaded_at, created_at)
where filename is null
   or file_type is null
   or file_size_bytes is null
   or uploaded_at is null;

update public.inner_world_artifacts
set
  content_type = coalesce(content_type, 'inline-html'),
  content_ref = coalesce(content_ref, jsonb_build_object('source_file_id', source_file_id)),
  display_order = coalesce(display_order, 0);

comment on table public.user_files is 'Service-role backed file metadata for the Blackboard Room and Inner World. RLS is enforced; user-scoped access only.';
comment on table public.inner_world_artifacts is 'Service-role backed artifact metadata for the Dynamic Inner World. RLS is enforced; user-scoped access only.';
