-- Source: supabase_schema.zip/supabase/migrations/vector_sim_source.sql
-- Canonicalized filename: 20260331110001_vector_sim_source.sql

-- Drop the existing function to prevent signature conflicts during the swap
DROP FUNCTION IF EXISTS public.trainer_search_study_sources(
    text,
    vector,
    float8,
    integer
);

CREATE OR REPLACE FUNCTION trainer_search_study_sources(
    query_text text,
    query_embedding vector(768),
    match_threshold float DEFAULT 0.5,
    match_limit int DEFAULT 20
)
RETURNS TABLE (
    fragment_id uuid,
    content text,
    source_file text,
    document_type text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Short-circuit: If the search query is empty or less than 3 characters, 
    -- bypass the heavy vector scan and return the most recently added fragments.
    IF length(trim(query_text)) < 3 THEN
        RETURN QUERY
        SELECT
            kf.id as fragment_id,
            kf.content,
            kf.source_file,
            kf.document_type,
            1.0::float AS similarity -- Assign perfect similarity for the default state
        FROM public.knowledge_fragments kf
        ORDER BY kf.created_at DESC
        LIMIT match_limit;
        
        RETURN;
    END IF;

    -- Standard Execution: Perform the vector cosine similarity search (<=>)
    RETURN QUERY
    SELECT
        kf.id as fragment_id,
        kf.content,
        kf.source_file,
        kf.document_type,
        1 - (kf.embedding <=> query_embedding) AS similarity
    FROM public.knowledge_fragments kf
    WHERE 1 - (kf.embedding <=> query_embedding) > match_threshold
    ORDER BY kf.embedding <=> query_embedding
    LIMIT match_limit;
END;
$$;
