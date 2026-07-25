insert into public.embodiment_training_runs (
  embodiment_profile_id,
  run_type,
  input_snapshot,
  output_snapshot,
  accepted,
  founder_notes,
  created_at
)
select
  ep.id,
  'export',
  to_jsonb(ep),
  to_jsonb(ep),
  true,
  'Backfilled from embodiment_profiles.',
  coalesce(ep.updated_at, ep.created_at, now())
from public.embodiment_profiles ep
where not exists (
  select 1
  from public.embodiment_training_runs etr
  where etr.embodiment_profile_id = ep.id
    and etr.run_type = 'export'
    and etr.founder_notes = 'Backfilled from embodiment_profiles.'
);

insert into public.embodiment_readiness_scores (
  agent_slug,
  readiness_score,
  readiness_source,
  readiness_rationale,
  created_at
)
select
  ep.slug,
  coalesce(ep.readiness_score, 0),
  'profile_backfill',
  'Backfilled from embodiment_profiles.',
  coalesce(ep.updated_at, ep.created_at, now())
from public.embodiment_profiles ep
where not exists (
  select 1
  from public.embodiment_readiness_scores ers
  where ers.agent_slug = ep.slug
    and ers.readiness_source = 'profile_backfill'
);
