CREATE TABLE IF NOT EXISTS user_profile_ingestion_runs (
  run_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'complete', 'error')),
  input_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  extracted_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  personality_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_personality_dimensions (
  dimension_id UUID PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES user_profile_ingestion_runs(run_id) ON DELETE CASCADE,
  dimension_key TEXT NOT NULL,
  dimension_label TEXT,
  dimension_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_fragments TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  salience NUMERIC NOT NULL DEFAULT 0 CHECK (salience >= 0 AND salience <= 1),
  mutation_class TEXT NOT NULL DEFAULT 'dynamic' CHECK (mutation_class IN ('immutable', 'stable', 'dynamic')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_ingestion_sources (
  source_link_id UUID PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES user_profile_ingestion_runs(run_id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('journal', 'resume', 'transcript', 'music_dna', 'lived_experience')),
  source_id TEXT,
  source_bucket TEXT,
  raw_text TEXT,
  processing_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_profile_ingestion_runs_user_created_idx
  ON user_profile_ingestion_runs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_personality_dimensions_run_key_idx
  ON user_personality_dimensions(run_id, dimension_key);

CREATE INDEX IF NOT EXISTS profile_ingestion_sources_run_type_idx
  ON profile_ingestion_sources(run_id, source_type);

CREATE TABLE IF NOT EXISTS embodiment_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE,
  embodiment_profile_slug TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS route_embodiment_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path TEXT NOT NULL UNIQUE,
  embodiment_profile_slug TEXT NOT NULL,
  display_label TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO embodiment_modules (module_key, embodiment_profile_slug, display_name, description)
VALUES
  ('dynamic_inner_world', 'curator', 'Dynamic Inner World Curator', 'Guides artifact exploration and self-reflection.'),
  ('profile_display', 'sanctuary-keeper', 'Profile Keeper', 'Stewards memory and identity continuity.'),
  ('resume_rockstar', 'the-weaver', 'Resume Rockstar', 'Shapes career narrative into usable resume artifacts.'),
  ('symbio_coder', 'the-architect', 'Symbio Coder', 'Assists with code structure and technical learning.'),
  ('vibe_coder', 'rock-legend', 'Vibe Coder', 'Connects musical and creative signals to identity.')
ON CONFLICT (module_key) DO UPDATE SET
  embodiment_profile_slug = EXCLUDED.embodiment_profile_slug,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

INSERT INTO route_embodiment_assignments (route_path, embodiment_profile_slug, display_label, description)
VALUES
  ('/dynamic-inner-world', 'curator', 'Dynamic Inner World Curator', 'Guides artifact exploration and self-reflection.'),
  ('/profile', 'sanctuary-keeper', 'Profile Keeper', 'Stewards memory and identity continuity.'),
  ('/workspace/modules/resume-rockstar', 'the-weaver', 'Resume Rockstar', 'Shapes career narrative into usable resume artifacts.'),
  ('/workspace/modules/symbio-coder', 'the-architect', 'Symbio Coder', 'Assists with code structure and technical learning.'),
  ('/workspace/modules/vibe-coder', 'rock-legend', 'Vibe Coder', 'Connects musical and creative signals to identity.'),
  ('/creation-corner', 'art-teacher', 'Creation Corner Art Teacher', 'Facilitates creative expression.'),
  ('/musical-dna', 'rock-legend', 'Music DNA Guide', 'Connects music to identity without flattening it.'),
  ('/sanctuary', 'sanctuary-keeper', 'Sanctuary Guide', 'Provides refuge and grounding.')
ON CONFLICT (route_path) DO UPDATE SET
  embodiment_profile_slug = EXCLUDED.embodiment_profile_slug,
  display_label = EXCLUDED.display_label,
  description = EXCLUDED.description,
  updated_at = now();
