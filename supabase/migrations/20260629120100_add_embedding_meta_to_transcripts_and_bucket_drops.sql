-- migration: create_transcripts_and_embedding_index

-- Ensure transcripts table exists
CREATE TABLE IF NOT EXISTS public.transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- You can add/adjust other transcript columns here later as needed
  embedding vector(768),
  embedding_model text,
  embedding_backend text,
  embedded_at timestamptz
);

-- Index for vector similarity (only if embedding column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transcripts'
      AND column_name = 'embedding'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_transcripts_embedding
      ON public.transcripts
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
  END IF;
END $$;
