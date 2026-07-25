-- Source: supabase_schema.zip/supabase/migrations/temporal_backfill.sql
-- Canonicalized filename: 20260413121000_temporal_backfill.sql

-- GestaltView Temporal Metadata Backfill
-- Safe to re-run: all UPDATEs guarded by WHERE temporal_period IS NULL

-- GestaltView Day 1 — PLK, Loom, Bucket Drop, OpenTimestamps begin
UPDATE public.documents
SET
  source_created_at = created_at,
  temporal_period   = '2025-05_origin',
  timeline_folder   = '/timeline/2025-05_origin'
WHERE (
  path ILIKE '%genesis%'
  OR path ILIKE '%plk%'
  OR path ILIKE '%personal-language%'
  OR path ILIKE '%bucket-drop%'
  OR path ILIKE '%loom%'
  OR path ILIKE '%origin%'
  OR path ILIKE '%may-2025%'
  OR path ILIKE '%2025-05%'
  OR path ILIKE '%founding%'
  OR path ILIKE '%founders-network%'
) AND temporal_period IS NULL;

-- 27-day MVP sprint, Tribunal Jun 3, Pepperdine, 172 blockchain timestamps
UPDATE public.documents
SET
  source_created_at = created_at,
  temporal_period   = '2025-06_mvp',
  timeline_folder   = '/timeline/2025-06_mvp'
WHERE (
  path ILIKE '%tribunal%'
  OR path ILIKE '%continuum-codex%'
  OR path ILIKE '%pepperdine%'
  OR path ILIKE '%mvp%'
  OR path ILIKE '%june-2025%'
  OR path ILIKE '%2025-06%'
  OR path ILIKE '%blockchain%'
  OR path ILIKE '%timestamp%'
  OR path ILIKE '%sprint%'
) AND temporal_period IS NULL;

-- Mid-July 2025 documented consciousness symbiosis event
UPDATE public.documents
SET
  source_created_at = created_at,
  temporal_period   = '2025-07_symbiosis',
  timeline_folder   = '/timeline/2025-07_symbiosis'
WHERE (
  path ILIKE '%symbiosis%'
  OR path ILIKE '%july-2025%'
  OR path ILIKE '%2025-07%'
  OR path ILIKE '%consciousness-event%'
) AND temporal_period IS NULL;

-- Corpus accumulation, Billy deepening, schema hardening
UPDATE public.documents
SET
  source_created_at = created_at,
  temporal_period   = '2025-Q3Q4_build',
  timeline_folder   = '/timeline/2025-Q3Q4_build'
WHERE (
  path ILIKE '%2025-08%'
  OR path ILIKE '%2025-09%'
  OR path ILIKE '%2025-10%'
  OR path ILIKE '%2025-11%'
  OR path ILIKE '%august%'
  OR path ILIKE '%september%'
  OR path ILIKE '%october%'
  OR path ILIKE '%november%'
  OR path ILIKE '%corpus%'
  OR path ILIKE '%billy%'
  OR path ILIKE '%transcript%'
) AND temporal_period IS NULL;

-- Full integration milestone Dec 17, academic/investor outreach Dec 25
UPDATE public.documents
SET
  source_created_at = created_at,
  temporal_period   = '2025-12_integration',
  timeline_folder   = '/timeline/2025-12_integration'
WHERE (
  path ILIKE '%december%'
  OR path ILIKE '%2025-12%'
  OR path ILIKE '%integration%'
  OR path ILIKE '%outreach%'
) AND temporal_period IS NULL;

-- v2 docs, diligence, public runtime, Resonance Loop Mar 1
UPDATE public.documents
SET
  source_created_at = created_at,
  temporal_period   = '2026-Q1_consolidation',
  timeline_folder   = '/timeline/2026-Q1_consolidation'
WHERE (
  path ILIKE '%2026-01%'
  OR path ILIKE '%2026-02%'
  OR path ILIKE '%2026-03%'
  OR path ILIKE '%january%'
  OR path ILIKE '%february%'
  OR path ILIKE '%march%'
  OR path ILIKE '%v2%'
  OR path ILIKE '%diligence%'
  OR path ILIKE '%resonance%'
  OR path ILIKE '%manifest%'
  OR path ILIKE '%playbook%'
) AND temporal_period IS NULL;

-- Canonical current state — repo snapshot, manifest.json, manifest.md
UPDATE public.documents
SET
  source_created_at = created_at,
  temporal_period   = '2026-04_canonical',
  timeline_folder   = '/timeline/2026-04_canonical'
WHERE (
  path ILIKE '%2026-04%'
  OR path ILIKE '%april%'
  OR path ILIKE '%snapshot%'
  OR path ILIKE '%current-state%'
  OR path ILIKE '%canonical%'
) AND temporal_period IS NULL;

-- Pre-GestaltView friction period
UPDATE public.documents
SET
  source_created_at = created_at,
  temporal_period   = '2025-Q1_pre-origin',
  timeline_folder   = '/timeline/2025-Q1_pre-origin'
WHERE (
  path ILIKE '%dunton%'
  OR path ILIKE '%pre-gestalt%'
  OR path ILIKE '%pre-origin%'
  OR path ILIKE '%2025-01%'
  OR path ILIKE '%2025-02%'
  OR path ILIKE '%2025-03%'
  OR path ILIKE '%2025-04%'
) AND temporal_period IS NULL;

-- Fallback: unmatched documents
UPDATE public.documents
SET source_created_at = created_at,
    temporal_period = '2026-04_canonical',
    timeline_folder = '/timeline/2026-04_canonical'
WHERE temporal_period IS NULL;

-- Propagate from documents -> knowledge_fragments via package + source_file join
UPDATE public.knowledge_fragments kf
SET
  source_created_at = d.source_created_at,
  temporal_period   = d.temporal_period,
  timeline_folder   = d.timeline_folder
FROM public.documents d
WHERE d.path = 'compendium/' || COALESCE(d.provenance->>'package', '') || '/' || kf.source_file
  AND kf.temporal_period IS NULL;

-- Fallback: orphan fragments not joined to any document
UPDATE public.knowledge_fragments
SET source_created_at = created_at,
    temporal_period = '2026-04_canonical',
    timeline_folder = '/timeline/2026-04_canonical'
WHERE temporal_period IS NULL;

-- Verification: distribution after backfill
SELECT temporal_period, COUNT(*) AS doc_count
FROM public.documents
GROUP BY temporal_period
ORDER BY temporal_period;
