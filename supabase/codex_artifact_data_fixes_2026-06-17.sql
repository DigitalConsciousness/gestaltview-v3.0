-- GestaltView Codex artifact data fixes
-- Date: 2026-06-17
-- Safe production posture: no DROP, no DELETE.

-- 1) Mark stale running jobs failed so operators can see timeout failures clearly.
--    Adjust interval if the deployed function timeout differs.
update public.codex_jobs
set
  status = 'failed',
  error = coalesce(error, 'Marked failed by 2026-06-17 Codex audit: job remained running past timeout guard.'),
  updated_at = now(),
  retry_count = coalesce(retry_count, 0) + 1
where status = 'running'
  and updated_at < now() - interval '15 minutes';

-- 2) Backfill missing job rows for pending JSON exports with no codex_jobs row.
insert into public.codex_jobs (
  id,
  artifact_id,
  format,
  status,
  retry_count,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  artifact.id,
  export_item->>'format',
  'pending',
  0,
  now(),
  now()
from public.codex_artifacts artifact
cross join lateral jsonb_array_elements(coalesce(artifact.exports, '[]'::jsonb)) as export_item
where export_item->>'status' = 'pending'
  and export_item->>'format' = 'json'
  and not exists (
    select 1
    from public.codex_jobs job
    where job.artifact_id = artifact.id
      and job.format = export_item->>'format'
  );

-- 3) Surface legacy memory:// exports as failed so they are not mistaken for durable storage.
update public.codex_jobs
set
  status = 'failed',
  error = coalesce(error, 'Legacy memory:// export path is not durable; rerender export to Supabase Storage.'),
  updated_at = now()
where storage_path like 'memory://%'
  and status <> 'failed';

-- 4) Audit current distinct kinds after remediation.
select kind, count(*) as artifact_count
from public.codex_artifacts
group by kind
order by kind;

-- 5) Audit remaining pending exports that still have no job row.
select artifact.id, artifact.kind, export_item->>'format' as format, export_item->>'status' as export_status
from public.codex_artifacts artifact
cross join lateral jsonb_array_elements(coalesce(artifact.exports, '[]'::jsonb)) as export_item
where export_item->>'status' = 'pending'
  and not exists (
    select 1
    from public.codex_jobs job
    where job.artifact_id = artifact.id
      and job.format = export_item->>'format'
  )
order by artifact.created_at desc;
