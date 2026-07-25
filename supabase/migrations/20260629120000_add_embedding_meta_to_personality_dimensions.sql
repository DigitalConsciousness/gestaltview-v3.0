-- migration: add_embedding_meta_to_personality_dimensions
ALTER TABLE user_personality_dimensions
  ADD COLUMN IF NOT EXISTS embedding          vector(768),
  ADD COLUMN IF NOT EXISTS embedding_model    text,
  ADD COLUMN IF NOT EXISTS embedding_backend  text,
  ADD COLUMN IF NOT EXISTS embedded_at        timestamptz;

CREATE INDEX IF NOT EXISTS idx_upd_embedding
  ON user_personality_dimensions
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
