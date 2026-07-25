-- ============================================================
-- GestaltView — CurrentState.sql
-- Full database health snapshot. Run each section individually
-- in Supabase SQL Editor (select the block, then Ctrl+Enter).
-- Or run all at once — if one errors, the rest still show.
-- ============================================================


-- ============================================================
-- SECTION 1: OVERVIEW
-- Top-level counts across all core tables.
-- ============================================================
SELECT
  (SELECT COUNT(*) FROM documents)                                        AS total_documents,
  (SELECT COUNT(*) FROM knowledge_fragments)                              AS total_fragments,
  (SELECT COUNT(*) FROM knowledge_fragments WHERE embedding IS NOT NULL)  AS fragments_with_embeddings,
  (SELECT COUNT(*) FROM knowledge_fragments WHERE embedding IS NULL)      AS fragments_missing_embeddings,
  (SELECT COUNT(*) FROM processing_runs)                                  AS total_runs,
  (SELECT COUNT(*) FROM processing_runs WHERE status = 'complete')        AS complete_runs,
  (SELECT COUNT(*) FROM processing_runs WHERE status = 'completed')       AS completed_runs,
  (SELECT COUNT(*) FROM processing_runs WHERE status = 'failed')          AS failed_runs,
  (SELECT COUNT(*) FROM skill_fragments)                                  AS total_skill_fragments,
  (SELECT COUNT(*) FROM summaries)                                        AS total_summaries,
  (SELECT COUNT(*) FROM embeddings)                                       AS total_embeddings,
  (SELECT COUNT(*) FROM document_concepts)                                AS total_concepts;


-- ============================================================
-- SECTION 2: ORPHANED DOCUMENTS
-- Documents with no matching knowledge_fragments.
-- These are wasted rows — safe to delete.
-- ============================================================
SELECT
  COUNT(*)              AS orphaned_document_count,
  SUM(d.total_chunks)   AS declared_chunks_never_written,
  pg_size_pretty(
    SUM(LENGTH(COALESCE(d.content, '')))::bigint
  )                     AS wasted_content_size
FROM documents d
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_fragments kf
  WHERE kf.source_file = d.filename
);


-- ============================================================
-- SECTION 3: BROKEN PARTIAL INGESTIONS
-- Documents with < 3 actual fragment rows but declared > 10.
-- Wrote one fragment and stopped. Re-ingest or delete.
-- ============================================================
SELECT
  d.filename,
  d.path,
  COUNT(kf.id)      AS chunk_rows,
  d.total_chunks    AS declared_total_chunks,
  pg_size_pretty(
    LENGTH(COALESCE(d.content, ''))::bigint
  )                 AS content_size,
  d.created_at      AS ingested_at
FROM documents d
LEFT JOIN knowledge_fragments kf ON kf.source_file = d.filename
GROUP BY d.document_id, d.filename, d.path, d.total_chunks, d.content, d.created_at
HAVING COUNT(kf.id) < 3 AND d.total_chunks > 10
ORDER BY d.total_chunks DESC
LIMIT 20;


-- ============================================================
-- SECTION 4: FOREIGN KEY MAP
-- Which tables cascade automatically when a document is deleted.
-- NOTE: knowledge_fragments is NOT in this list — it must be
-- deleted manually before deleting documents.
-- ============================================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name  AS foreign_table,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'documents'
ORDER BY tc.table_name;


-- ============================================================
-- SECTION 5: knowledge_fragments LINK STATUS
-- This table has NO document_id column and no FK to documents.
-- It links via source_file (text match) only.
-- Orphaned fragments = fragments whose source file has no
-- corresponding document row.
-- ============================================================
SELECT
  COUNT(*)                                          AS total_fragments,
  COUNT(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM documents d
    WHERE d.filename = kf.source_file
  ))                                                AS fragments_with_parent_doc,
  COUNT(*) FILTER (WHERE NOT EXISTS (
    SELECT 1 FROM documents d
    WHERE d.filename = kf.source_file
  ))                                                AS orphaned_fragments,
  COUNT(DISTINCT kf.source_file)                    AS distinct_source_files
FROM knowledge_fragments kf;


-- ============================================================
-- SECTION 6: PROCESSING RUNS
-- Last 10 runs, most recent first.
-- ============================================================
SELECT
  run_id,
  LEFT(corpus_root, 70)  AS corpus_root,
  status,
  documents_count,
  chunks_count,
  created_at
FROM processing_runs
ORDER BY created_at DESC
LIMIT 10;


-- ============================================================
-- SECTION 7: TOP 15 SPACE HOGS
-- Documents ranked by declared chunk count.
-- chunk_rows << declared_total_chunks = broken ingestion.
-- ============================================================
SELECT
  d.path,
  d.filename,
  COUNT(kf.id)                                         AS chunk_rows,
  d.total_chunks                                       AS declared_total_chunks,
  pg_size_pretty(
    SUM(COALESCE(LENGTH(kf.content), 0))::bigint
  )                                                    AS total_fragment_size,
  pg_size_pretty(d.file_size_bytes::bigint)            AS original_file_size,
  MIN(d.created_at)                                    AS first_ingested_at
FROM documents d
LEFT JOIN knowledge_fragments kf ON kf.source_file = d.filename
GROUP BY d.document_id, d.path, d.filename, d.total_chunks, d.file_size_bytes
ORDER BY d.total_chunks DESC
LIMIT 15;


-- ============================================================
-- SECTION 8: CORPUS COVERAGE BY PACKAGE
-- Fragments per compendium folder.
-- Shows which packages are actually searchable.
-- ============================================================
SELECT
  SPLIT_PART(d.path, '/', 2)                              AS package,
  COUNT(DISTINCT d.document_id)                           AS documents,
  COUNT(kf.id)                                            AS fragments,
  COUNT(kf.id) FILTER (WHERE kf.embedding IS NOT NULL)    AS embedded_fragments
FROM documents d
LEFT JOIN knowledge_fragments kf ON kf.source_file = d.filename
WHERE d.path LIKE 'compendium/%'
GROUP BY SPLIT_PART(d.path, '/', 2)
ORDER BY fragments DESC;


-- ============================================================
-- SECTION 9: EMBEDDING HEALTH
-- What % of fragments have actual vectors.
-- If pct_embedded < 100, semantic search has blind spots.
-- ============================================================
SELECT
  COUNT(*)                                               AS total_fragments,
  COUNT(*) FILTER (WHERE embedding IS NOT NULL)          AS has_vector,
  COUNT(*) FILTER (WHERE embedding IS NULL)              AS missing_vector,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE embedding IS NOT NULL)
    / NULLIF(COUNT(*), 0), 1
  )                                                      AS pct_embedded
FROM knowledge_fragments;


-- ============================================================
-- SECTION 10: USERS TABLE HEALTH
-- ============================================================
SELECT
  COUNT(*)                                                         AS total_users,
  COUNT(*) FILTER (WHERE tier = 'free')                            AS free_users,
  COUNT(*) FILTER (WHERE tier = 'pro')                             AS pro_users,
  COUNT(*) FILTER (WHERE is_admin = true)                          AS admins,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')  AS new_this_week
FROM users;
