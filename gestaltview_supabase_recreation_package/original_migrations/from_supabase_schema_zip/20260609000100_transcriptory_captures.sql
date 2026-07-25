-- Transcriptory: voice/audio capture repository.


-- Create table (idempotent)
CREATE TABLE IF NOT EXISTS public.transcriptory_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  title text,
  duration_seconds integer,
  audio_storage_path text,
  raw_transcript text,
  summary text,
  themes text[] NOT NULL DEFAULT '{}',
  linked_captures uuid[] NOT NULL DEFAULT '{}',
  linked_blackboard_session uuid,
  linked_creation_corner_artifact uuid,
  context_weight double precision NOT NULL DEFAULT 1.0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'transcribing', 'ready', 'error'))
);

CREATE INDEX IF NOT EXISTS transcriptory_captures_user_created_idx
  ON public.transcriptory_captures (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS transcriptory_captures_user_status_idx
  ON public.transcriptory_captures (user_id, status);

ALTER TABLE public.transcriptory_captures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own transcriptory captures"
  ON public.transcriptory_captures;

CREATE POLICY "Users can manage their own transcriptory captures"
  ON public.transcriptory_captures
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Correct trigger function syntax
CREATE OR REPLACE FUNCTION public.set_transcriptory_captures_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transcriptory_captures_set_updated_at
  ON public.transcriptory_captures;

CREATE TRIGGER transcriptory_captures_set_updated_at
BEFORE UPDATE ON public.transcriptory_captures
FOR EACH ROW
EXECUTE FUNCTION public.set_transcriptory_captures_updated_at();
