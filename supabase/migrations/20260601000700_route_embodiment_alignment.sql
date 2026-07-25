-- Source: supabase_schema.zip/supabase/migrations/20260601000700_route_embodiment_alignment.sql
-- Canonicalized filename: 20260601000700_route_embodiment_alignment.sql

do $$
begin
  if to_regclass('public.embodiment_profiles') is not null then
    alter table public.embodiment_profiles
      add column if not exists orientation_state jsonb not null default '{
        "checkpoint_ref":"orientation/orientation_checkpoint.latest.json",
        "last_absorbed_checkpoint_id":"orientation-checkpoint-latest",
        "absorption_status":"current",
        "needs_reorientation":false,
        "orientation_confidence":0.92
      }'::jsonb;

    update public.embodiment_profiles
    set orientation_state = orientation_state || '{
      "checkpoint_ref":"orientation/orientation_checkpoint.latest.json",
      "last_absorbed_checkpoint_id":"orientation-checkpoint-latest",
      "absorption_status":"current",
      "needs_reorientation":false,
      "orientation_confidence":0.92
    }'::jsonb;
  end if;
end $$;

insert into public.route_embodiment_assignments (route_path, embodiment_profile_slug, display_label, description)
values
  ('/sanctuary', 'sanctuary-keeper', 'Sanctuary Guide', 'Protects private capture and refuge state.'),
  ('/blackboard-room', 'billy', 'Blackboard Room Billy', 'Supports active capture without becoming a scaffold node.'),
  ('/dynamic-inner-world', 'curator', 'Dynamic Inner World Curator', 'Guides the memory museum and artifact inspection.'),
  ('/external-scaffold', 'scaffold-keeper', 'External Scaffold Keeper', 'Stewards approved compressed artifact memory.'),
  ('/creation-corner', 'art-teacher', 'Creation Corner Art Teacher', 'Facilitates intentional and organic synthesis.'),
  ('/profile', 'sanctuary-keeper', 'Profile Keeper', 'Stewards evidence-linked profile continuity.'),
  ('/embodiment-studio', 'repo-scribe', 'Embodiment Studio Scribe', 'Routes mutation proposals through review.'),
  ('/digital-intelligence-academy', 'teacher', 'Digital Intelligence Academy Teacher', 'Teaches DI concepts through approved profiles.')
on conflict (route_path) do update set
  embodiment_profile_slug = excluded.embodiment_profile_slug,
  display_label = excluded.display_label,
  description = excluded.description,
  updated_at = now();
