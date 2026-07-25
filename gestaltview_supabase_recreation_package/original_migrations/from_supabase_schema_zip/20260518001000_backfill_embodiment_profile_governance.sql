insert into public.embodiment_mutation_proposals (
  agent_slug,
  target_path,
  current_value,
  proposed_value,
  mutation_class,
  risk_level,
  status,
  submitted_by,
  reviewed_by,
  review_notes,
  created_at,
  reviewed_at
)
select
  ep.slug,
  format('embodiment_profiles/%s.embodiment.json', ep.slug),
  'null'::jsonb,
  to_jsonb(ep.profile_json),
  'bootstrap_profile_import',
  'low',
  'approved',
  null,
  null,
  'Backfilled from embodiment_profiles.',
  coalesce(ep.updated_at, ep.created_at, now()),
  coalesce(ep.updated_at, ep.created_at, now())
from public.embodiment_profiles ep
where not exists (
  select 1
  from public.embodiment_mutation_proposals emp
  where emp.agent_slug = ep.slug
    and emp.target_path = format('embodiment_profiles/%s.embodiment.json', ep.slug)
    and emp.mutation_class = 'bootstrap_profile_import'
    and emp.review_notes = 'Backfilled from embodiment_profiles.'
);

insert into public.embodiment_review_log (
  proposal_id,
  agent_slug,
  review_decision,
  review_notes,
  reviewed_by,
  created_at
)
select
  emp.id,
  emp.agent_slug,
  'approved',
  'Backfilled from embodiment_profiles.',
  null,
  coalesce(emp.reviewed_at, emp.created_at, now())
from public.embodiment_mutation_proposals emp
join public.embodiment_profiles ep
  on ep.slug = emp.agent_slug
where emp.target_path = format('embodiment_profiles/%s.embodiment.json', ep.slug)
  and emp.mutation_class = 'bootstrap_profile_import'
  and emp.review_notes = 'Backfilled from embodiment_profiles.'
  and not exists (
  select 1
  from public.embodiment_review_log erl
  where erl.proposal_id = emp.id
    and erl.review_decision = 'approved'
    and erl.review_notes = 'Backfilled from embodiment_profiles.'
);
