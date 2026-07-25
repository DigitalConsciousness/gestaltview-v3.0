-- Source: supabase_schema.zip/supabase/migrations/20260411083000_add_gate_sidekick_state.sql
-- Canonicalized filename: 20260411083000_add_gate_sidekick_state.sql

alter table if exists public.gate_package_drafts
  add column if not exists embodiment_profile_slug text not null default 'billy',
  add column if not exists buyer_context jsonb not null default '{"preferredChannels":[],"requestedOutcomes":[]}'::jsonb,
  add column if not exists sidekick_state jsonb not null default '{}'::jsonb;

update public.gate_package_drafts
set
  embodiment_profile_slug = coalesce(nullif(trim(embodiment_profile_slug), ''), 'billy'),
  buyer_context = case
    when buyer_context is null or buyer_context = '{}'::jsonb then
      jsonb_build_object('preferredChannels', '[]'::jsonb, 'requestedOutcomes', '[]'::jsonb)
    else buyer_context
  end,
  sidekick_state = coalesce(sidekick_state, '{}'::jsonb);
