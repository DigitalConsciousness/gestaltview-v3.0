# GestaltView Gen-Engine: Profile Portrait Layer
## SPEC v1.0 — Emergent Identity Inference + Rendering Engine

**Status:** Draft for Implementation  
**Date:** June 18, 2026  
**Repo:** `DigitalConsciousness/gestaltview-v2.0`  
**Supabase Project:** `fdqykmefgyuytwnqcthg`

---

## 1. Overview & Purpose

The Profile Portrait Layer is a new artifact type (`profile_portrait`) within the existing gen-engine pipeline. It transforms the accumulated behavioral, linguistic, and emotional data the user has generated across GestaltView's modules into a structured, multi-dimensional psychological portrait — produced by the LLM, validated against a strict contract, stored in Supabase, and rendered in the client.

This is **not** a quiz or self-report instrument. It is an inference engine that reads what the user *has done* — what they've captured, resonated with, said in moments of urgency, annotated, and repeatedly returned to — and synthesizes a portrait that reflects the user back to themselves with more fidelity than they could produce with conscious introspection.

The philosophical foundation is already in the product's DNA: *Linguistic Relativity* (the PLK extracts cognitive architecture from language patterns), *Narrative Therapy* (re-authoring identity through accumulated evidence), and *Second-Order Cybernetics* (the observer — Keith — is inseparable from the system observing him). The Portrait Layer operationalizes all three simultaneously.

### What It Is Not

- It is not a Breeze-style point-in-time assessment replaced by a new point-in-time assessment
- It is not a summary of what the user typed
- It is not a static profile that sits unchanged
- It is not a clinical diagnosis or therapeutic intervention

### What It Is

- A **versioned, longitudinal record** — each portrait captures a moment in the user's becoming, and the delta between versions is the growth record
- A **source-grounded inference** — every dimension maps back to evidence from real user-generated data, not LLM confabulation
- A **living document** — new data triggers new portraits; old portraits are preserved
- A **private-by-default mirror** — the user controls visibility; it is never used for targeting or extraction

---

## 2. Existing Architecture Anchors

This layer plugs into the following already-functioning seams:

| Seam | Location | Role in Portrait Layer |
|------|----------|------------------------|
| Artifact pipeline | `api/gen-engine/artifacts.ts` | New artifact type routed here |
| Artifact contracts | `shared/gen-engine/types.ts` | `ProfilePortraitArtifact` added as 9th kind |
| Validation | `shared/gen-engine/core.ts` | Zod schema validates portrait before storage |
| Bucket Drops | `bucket_drops` table | Primary linguistic + emotional signal source |
| Memory entries | `memory_entries` table | Promoted, weighted signal |
| Consciousness profiles | `consciousness_profiles` table | Existing profile storage — portrait extends this |
| Billy sessions | `billy_sessions` table | Conversational pattern signal |
| Tribunal sessions | `tribunal_sessions` table | Reflective question + response patterns |
| Musical DNA | `musical_dna_analyses` table | Somatic/nervous system signal |
| Users | `users` table | Tier check for cadence entitlement |

No existing tables are dropped or modified destructively. All migrations are additive.

---

## 3. Artifact Contract — `ProfilePortraitArtifact`

### 3.1 TypeScript Type Definition

Add to `shared/gen-engine/types.ts`:

```typescript
export interface ProfilePortraitDimension {
  label: string;                  // e.g. "Linguistic Signature"
  dimensionKey: DimensionKey;     // enum — see below
  synthesis: string;              // 150-400 word narrative from LLM
  confidence: number;             // 0.0 – 1.0
  evidenceCount: number;          // number of source records used
  evidenceSources: EvidenceSource[]; // table + record references
  rawQuotes: string[];            // ≤5 verbatim quotes from user data
  tags: string[];                 // inferred thematic tags
}

export type DimensionKey =
  | 'linguistic_signature'
  | 'cognitive_architecture'
  | 'emotional_landscape'
  | 'somatic_intelligence'
  | 'identity_narrative'
  | 'relational_orientation'
  | 'creative_expression'
  | 'values_and_ethics'
  | 'growth_edges'
  | 'embodied_patterns';

export interface EvidenceSource {
  table: string;                  // e.g. "bucket_drops"
  recordId: string;               // uuid
  capturedAt: string;             // ISO timestamp
  signalType: string;             // e.g. "plk_resonance", "intensity", "raw_text"
}

export interface PortraitMetadata {
  portraitVersion: number;        // monotonic per user
  previousPortraitId: string | null;
  inputDataWindow: {
    from: string;                 // ISO timestamp — oldest record used
    to: string;                   // ISO timestamp — newest record used
  };
  totalSourceRecords: number;
  inferenceModel: string;         // e.g. "claude-3-7-sonnet"
  promptVersion: string;          // semver for the inference prompt
  assemblyCost: {
    bucketDrops: number;
    memoryEntries: number;
    billySessions: number;
    tribunalSessions: number;
    musicalDnaAnalyses: number;
    consciousnessProfileSnapshots: number;
  };
}

export interface ProfilePortraitArtifact {
  kind: 'profile_portrait';
  id: string;                     // uuid
  userId: string;
  subjectId: string | null;
  createdAt: string;
  dimensions: ProfilePortraitDimension[];  // exactly 10
  overarchingNarrative: string;   // 300-600 word holistic synthesis
  thematicClusters: string[];     // 3-7 cross-dimensional themes
  deltaFromPrevious: DeltaRecord | null;  // null on first portrait
  metadata: PortraitMetadata;
}

export interface DeltaRecord {
  previousPortraitId: string;
  dimensionsShifted: Array<{
    dimensionKey: DimensionKey;
    direction: 'deepened' | 'expanded' | 'resolved' | 'emerged' | 'retreated';
    summary: string;
  }>;
  newThemes: string[];
  retiredThemes: string[];
  overallShiftNarrative: string;
}
```

### 3.2 Zod Validation Schema

Add to `shared/gen-engine/core.ts`:

```typescript
import { z } from 'zod';

const DimensionKeySchema = z.enum([
  'linguistic_signature',
  'cognitive_architecture',
  'emotional_landscape',
  'somatic_intelligence',
  'identity_narrative',
  'relational_orientation',
  'creative_expression',
  'values_and_ethics',
  'growth_edges',
  'embodied_patterns',
]);

const EvidenceSourceSchema = z.object({
  table: z.string().min(1),
  recordId: z.string().uuid(),
  capturedAt: z.string().datetime(),
  signalType: z.string().min(1),
});

const DimensionSchema = z.object({
  label: z.string().min(1).max(80),
  dimensionKey: DimensionKeySchema,
  synthesis: z.string().min(100).max(2000),
  confidence: z.number().min(0).max(1),
  evidenceCount: z.number().int().min(1),
  evidenceSources: z.array(EvidenceSourceSchema).min(1).max(50),
  rawQuotes: z.array(z.string()).max(5),
  tags: z.array(z.string()).max(20),
});

const DeltaSchema = z.object({
  previousPortraitId: z.string().uuid(),
  dimensionsShifted: z.array(z.object({
    dimensionKey: DimensionKeySchema,
    direction: z.enum(['deepened', 'expanded', 'resolved', 'emerged', 'retreated']),
    summary: z.string().min(20).max(500),
  })),
  newThemes: z.array(z.string()),
  retiredThemes: z.array(z.string()),
  overallShiftNarrative: z.string().min(50).max(1000),
});

export const ProfilePortraitArtifactSchema = z.object({
  kind: z.literal('profile_portrait'),
  id: z.string().uuid(),
  userId: z.string().min(1),
  subjectId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  dimensions: z.array(DimensionSchema).length(10),
  overarchingNarrative: z.string().min(200).max(3000),
  thematicClusters: z.array(z.string()).min(3).max(7),
  deltaFromPrevious: DeltaSchema.nullable(),
  metadata: z.object({
    portraitVersion: z.number().int().min(1),
    previousPortraitId: z.string().uuid().nullable(),
    inputDataWindow: z.object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    }),
    totalSourceRecords: z.number().int().min(1),
    inferenceModel: z.string().min(1),
    promptVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    assemblyCost: z.object({
      bucketDrops: z.number().int(),
      memoryEntries: z.number().int(),
      billySessions: z.number().int(),
      tribunalSessions: z.number().int(),
      musicalDnaAnalyses: z.number().int(),
      consciousnessProfileSnapshots: z.number().int(),
    }),
  }),
});
```

---

## 4. Input Assembly Layer

The input assembly layer is the most architecturally significant component. It reads across 6 source tables, compresses the data to fit the LLM context window while preserving variance, and annotates every signal with its provenance.

### 4.1 Assembly Strategy

The goal is maximum signal density, not maximum volume. A 10,000-record user has years of behavior; we cannot send all of it. We use a **stratified sampling + recency-weighting** strategy:

1. **All-time top 30 by `plk_resonance_score`** from `bucket_drops` — these are the user's highest-resonance captures regardless of when
2. **Most recent 50** from `bucket_drops` — recency matters; recent language patterns are more current identity
3. **Intensity ≥ 4 captures** (all, up to 100) — high-intensity moments are disproportionately identity-relevant
4. **All promoted memories** from `memory_entries` — these are curated signal by definition
5. **All musical DNA analyses** from `musical_dna_analyses` — somatic nervous system data
6. **Last 20 Billy sessions** — conversational tone and recurring themes
7. **Last 10 tribunal sessions** — reflective questions the user actually asked
8. **Most recent `consciousness_profiles` snapshot** — the existing profile baseline
9. **Any `snapshot` field** from `consciousness_profiles` — PLK-derived patterns

### 4.2 Assembly RPC — `assemble_portrait_input`

New Supabase RPC (defined in Migration 04):

```sql
-- Returns JSON blob of assembled inputs, max ~50K chars
-- Caller passes user_id; function handles all sampling logic
CREATE OR REPLACE FUNCTION assemble_portrait_input(p_user_id text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_bucket_top jsonb;
  v_bucket_recent jsonb;
  v_bucket_intense jsonb;
  v_memories jsonb;
  v_musical jsonb;
  v_billy jsonb;
  v_tribunal jsonb;
  v_cp_snapshot jsonb;
BEGIN
  -- Top resonance bucket drops
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id, 'content', content, 'raw_text', raw_text,
      'plk_resonance_score', plk_resonance_score,
      'intensity', intensity, 'tags', tags,
      'created_at', created_at, 'signal_type', 'top_resonance'
    ) ORDER BY plk_resonance_score DESC
  ) INTO v_bucket_top
  FROM (SELECT * FROM bucket_drops WHERE user_id = p_user_id
        ORDER BY plk_resonance_score DESC LIMIT 30) sub;

  -- Recent bucket drops
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id, 'content', content, 'raw_text', raw_text,
      'intensity', intensity, 'tags', tags, 'module_key', module_key,
      'created_at', created_at, 'signal_type', 'recent'
    ) ORDER BY created_at DESC
  ) INTO v_bucket_recent
  FROM (SELECT * FROM bucket_drops WHERE user_id = p_user_id
        ORDER BY created_at DESC LIMIT 50) sub;

  -- High-intensity bucket drops
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id, 'content', content, 'intensity', intensity,
      'created_at', created_at, 'signal_type', 'high_intensity'
    )
  ) INTO v_bucket_intense
  FROM (SELECT * FROM bucket_drops
        WHERE user_id = p_user_id AND intensity >= 4
        ORDER BY created_at DESC LIMIT 100) sub;

  -- Promoted memories
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id, 'content', content, 'importance_score', importance_score,
      'memory_type', memory_type, 'tags', tags,
      'created_at', created_at, 'signal_type', 'memory'
    ) ORDER BY importance_score DESC
  ) INTO v_memories
  FROM memory_entries WHERE user_id = p_user_id;

  -- Musical DNA
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id, 'song_title', song_title, 'artist', artist,
      'analysis', analysis, 'empowerment_score', empowerment_score,
      'created_at', created_at, 'signal_type', 'musical_dna'
    ) ORDER BY created_at DESC
  ) INTO v_musical
  FROM musical_dna_analyses WHERE user_id = p_user_id;

  -- Recent Billy sessions
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id, 'message', message, 'response', response,
      'mode', mode, 'created_at', created_at, 'signal_type', 'billy'
    ) ORDER BY created_at DESC
  ) INTO v_billy
  FROM (SELECT * FROM billy_sessions WHERE user_id = p_user_id
        ORDER BY created_at DESC LIMIT 20) sub;

  -- Recent tribunal sessions
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id, 'question', question, 'response', response,
      'created_at', created_at, 'signal_type', 'tribunal'
    ) ORDER BY created_at DESC
  ) INTO v_tribunal
  FROM (SELECT * FROM tribunal_sessions WHERE user_id = p_user_id
        ORDER BY created_at DESC LIMIT 10) sub;

  -- Consciousness profile snapshot
  SELECT jsonb_build_object(
    'id', id, 'profile', profile, 'snapshot', snapshot,
    'source_manifest', source_manifest, 'confidence', confidence,
    'created_at', created_at, 'signal_type', 'consciousness_profile'
  ) INTO v_cp_snapshot
  FROM consciousness_profiles
  WHERE user_id = p_user_id
  ORDER BY created_at DESC LIMIT 1;

  v_result := jsonb_build_object(
    'user_id', p_user_id,
    'assembled_at', NOW(),
    'sources', jsonb_build_object(
      'bucket_drops_top_resonance', COALESCE(v_bucket_top, '[]'::jsonb),
      'bucket_drops_recent', COALESCE(v_bucket_recent, '[]'::jsonb),
      'bucket_drops_intense', COALESCE(v_bucket_intense, '[]'::jsonb),
      'memory_entries', COALESCE(v_memories, '[]'::jsonb),
      'musical_dna_analyses', COALESCE(v_musical, '[]'::jsonb),
      'billy_sessions', COALESCE(v_billy, '[]'::jsonb),
      'tribunal_sessions', COALESCE(v_tribunal, '[]'::jsonb),
      'consciousness_profile', COALESCE(v_cp_snapshot, '{}'::jsonb)
    )
  );

  RETURN v_result;
END;
$$;
```

---

## 5. Inference Prompt — `portrait_inference_prompt` v1.0.0

This prompt is versioned in `shared/gen-engine/prompts/portrait-v1.0.0.ts`. The `promptVersion` field in the artifact metadata must always match the actual prompt file used.

```typescript
export const PORTRAIT_INFERENCE_PROMPT_V1 = `
You are the GestaltView Portrait Engine. Your task is to synthesize a user's accumulated behavioral,
linguistic, and emotional data into a structured psychological portrait.

This is NOT a summary. You are producing an inference — a reading of who this person is based on
the evidence of what they have captured, said, felt, and repeatedly returned to.

RULES:
1. Ground every dimension in evidence. If a claim has no supporting data in the provided sources,
   lower the confidence score accordingly. Do not confabulate.
2. Use the user's own language wherever possible. Their words are data, not illustration.
3. Preserve complexity. Do not collapse paradox, ambiguity, or contradiction — name it.
4. The "growth_edges" dimension must name specific, observable patterns — not platitudes.
5. The "overarchingNarrative" must be the kind of paragraph that makes the user feel
   simultaneously seen and surprised. It should reveal something they knew but had not named.
6. All confidence scores are 0.0-1.0. Be honest about low confidence when evidence is thin.
7. rawQuotes must be verbatim from the source data — no paraphrase, no cleaning.
8. Return ONLY valid JSON conforming to the ProfilePortraitArtifact schema.

INPUT DATA:
{ASSEMBLED_INPUT}

PREVIOUS PORTRAIT (if exists):
{PREVIOUS_PORTRAIT_JSON}

OUTPUT the complete ProfilePortraitArtifact JSON now.
`;
```

---

## 6. Inference Trigger Logic

### 6.1 Trigger Conditions

A new portrait is queued when **all** of the following are true:

1. The user has ≥ 25 total records across source tables (first-ever portrait lower threshold)
2. ≥ 30 new records have been created since the last portrait run (subsequent portraits)
3. No `portrait_inference_queue` entry exists for this user with `status IN ('pending', 'processing')`
4. The user's `tier` is not `'free'` — OR it is `'free'` and fewer than 2 portraits exist for this user (free users get 2 lifetime portraits)

### 6.2 Trigger Points

Triggers fire from three locations:

- **Post-Bucket Drop promotion** — after a drop is promoted to memory (`promoted_memory_id` is set)
- **Cadence check RPC** — a server-side scheduled function `maybe_queue_portrait_inference(p_user_id)` callable on login
- **Manual trigger** — user explicitly requests a new portrait from the UI (subject to cooldown: 7-day minimum between manual triggers)

### 6.3 Queue RPC — `maybe_queue_portrait_inference`

```sql
CREATE OR REPLACE FUNCTION maybe_queue_portrait_inference(p_user_id text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_total_records int;
  v_last_portrait_at timestamptz;
  v_new_records_since int;
  v_already_queued boolean;
  v_portrait_count int;
  v_user_tier text;
  v_threshold int;
BEGIN
  -- Get user tier
  SELECT tier INTO v_user_tier FROM users WHERE id = (
    SELECT auth_user_id::text FROM app_users WHERE id = p_user_id LIMIT 1
  );

  -- Count existing portraits
  SELECT COUNT(*) INTO v_portrait_count
  FROM profile_portraits WHERE user_id = p_user_id;

  -- Free tier: max 2 portraits
  IF v_user_tier = 'free' AND v_portrait_count >= 2 THEN
    RETURN false;
  END IF;

  -- Set threshold: lower for first portrait
  v_threshold := CASE WHEN v_portrait_count = 0 THEN 15 ELSE 30 END;

  -- Total source records
  SELECT (
    (SELECT COUNT(*) FROM bucket_drops WHERE user_id = p_user_id) +
    (SELECT COUNT(*) FROM memory_entries WHERE user_id = p_user_id) +
    (SELECT COUNT(*) FROM billy_sessions WHERE user_id = p_user_id) +
    (SELECT COUNT(*) FROM tribunal_sessions WHERE user_id = p_user_id) +
    (SELECT COUNT(*) FROM musical_dna_analyses WHERE user_id = p_user_id)
  ) INTO v_total_records;

  IF v_total_records < 25 THEN RETURN false; END IF;

  -- Check if already queued
  SELECT EXISTS(
    SELECT 1 FROM portrait_inference_queue
    WHERE user_id = p_user_id AND status IN ('pending', 'processing')
  ) INTO v_already_queued;

  IF v_already_queued THEN RETURN false; END IF;

  -- Get last portrait timestamp
  SELECT created_at INTO v_last_portrait_at
  FROM profile_portraits WHERE user_id = p_user_id
  ORDER BY created_at DESC LIMIT 1;

  -- Count new records since last portrait
  SELECT (
    (SELECT COUNT(*) FROM bucket_drops
     WHERE user_id = p_user_id AND created_at > COALESCE(v_last_portrait_at, '1970-01-01')) +
    (SELECT COUNT(*) FROM memory_entries
     WHERE user_id = p_user_id AND created_at > COALESCE(v_last_portrait_at, '1970-01-01')) +
    (SELECT COUNT(*) FROM billy_sessions
     WHERE user_id = p_user_id AND created_at > COALESCE(v_last_portrait_at, '1970-01-01'))
  ) INTO v_new_records_since;

  IF v_portrait_count > 0 AND v_new_records_since < v_threshold THEN
    RETURN false;
  END IF;

  -- Enqueue
  INSERT INTO portrait_inference_queue (user_id, status, created_at, trigger_source)
  VALUES (p_user_id, 'pending', NOW(), 'auto');

  RETURN true;
END;
$$;
```

---

## 7. New Tables

### 7.1 `profile_portraits`

The primary storage table for all portrait artifacts. Extends but does not replace `consciousness_profiles`.

```sql
CREATE TABLE profile_portraits (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               text NOT NULL,
  subject_id            uuid,
  portrait_version      int NOT NULL DEFAULT 1,
  artifact              jsonb NOT NULL,        -- Full ProfilePortraitArtifact JSON
  dimensions_summary    jsonb,                 -- Denormalized: {dimensionKey: {confidence, tags}} for fast queries
  thematic_clusters     text[],
  overall_confidence    numeric(4,3),
  inference_model       text,
  prompt_version        text,
  total_source_records  int,
  input_window_from     timestamptz,
  input_window_to       timestamptz,
  previous_portrait_id  uuid REFERENCES profile_portraits(id),
  delta_summary         jsonb,                 -- DeltaRecord JSON
  status                text NOT NULL DEFAULT 'active',  -- active | archived | failed
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profile_portraits_user_id ON profile_portraits(user_id);
CREATE INDEX idx_profile_portraits_user_version ON profile_portraits(user_id, portrait_version DESC);
CREATE INDEX idx_profile_portraits_created_at ON profile_portraits(created_at DESC);
```

### 7.2 `portrait_inference_queue`

Job queue for async portrait inference runs. The API route pulls from this table and updates status.

```sql
CREATE TABLE portrait_inference_queue (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL,
  status            text NOT NULL DEFAULT 'pending',
                    -- pending | processing | complete | failed | cancelled
  trigger_source    text NOT NULL DEFAULT 'auto',
                    -- auto | manual | admin
  priority          int NOT NULL DEFAULT 5,   -- 1=highest, 10=lowest
  portrait_id       uuid REFERENCES profile_portraits(id),
                    -- populated after successful run
  error_message     text,
  attempts          int NOT NULL DEFAULT 0,
  last_attempted_at timestamptz,
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portrait_queue_status ON portrait_inference_queue(status, priority, created_at);
CREATE INDEX idx_portrait_queue_user ON portrait_inference_queue(user_id, status);
```

### 7.3 `portrait_render_events`

Audit log: every time a portrait is rendered/viewed, timestamped. Used for the growth timeline feature.

```sql
CREATE TABLE portrait_render_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL,
  portrait_id   uuid NOT NULL REFERENCES profile_portraits(id),
  event_type    text NOT NULL DEFAULT 'view',
                -- view | share | export | delta_view
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portrait_render_events_user ON portrait_render_events(user_id, created_at DESC);
```

---

## 8. Migrations — Sequenced

Apply in this exact order. Each migration is independently rollbackable.

### Migration 01 — `create_profile_portraits`

```sql
-- Migration: create_profile_portraits
-- Creates the primary portrait storage table

CREATE TABLE IF NOT EXISTS profile_portraits (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               text NOT NULL,
  subject_id            uuid,
  portrait_version      int NOT NULL DEFAULT 1,
  artifact              jsonb NOT NULL,
  dimensions_summary    jsonb,
  thematic_clusters     text[],
  overall_confidence    numeric(4,3),
  inference_model       text,
  prompt_version        text,
  total_source_records  int,
  input_window_from     timestamptz,
  input_window_to       timestamptz,
  previous_portrait_id  uuid REFERENCES profile_portraits(id),
  delta_summary         jsonb,
  status                text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'failed')),
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_portraits_user_id
  ON profile_portraits(user_id);

CREATE INDEX IF NOT EXISTS idx_profile_portraits_user_version
  ON profile_portraits(user_id, portrait_version DESC);

CREATE INDEX IF NOT EXISTS idx_profile_portraits_created_at
  ON profile_portraits(created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_portrait_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER portrait_updated_at_trigger
  BEFORE UPDATE ON profile_portraits
  FOR EACH ROW EXECUTE FUNCTION update_portrait_updated_at();

COMMENT ON TABLE profile_portraits IS
  'Versioned ProfilePortraitArtifact storage. One row per inference run per user.
   artifact column holds full validated JSON. dimensions_summary is denormalized
   for fast querying without parsing full artifact blob.';
```

### Migration 02 — `create_portrait_inference_queue`

```sql
-- Migration: create_portrait_inference_queue
-- Async job queue for portrait inference runs

CREATE TABLE IF NOT EXISTS portrait_inference_queue (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL,
  status            text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'complete', 'failed', 'cancelled')),
  trigger_source    text NOT NULL DEFAULT 'auto'
    CHECK (trigger_source IN ('auto', 'manual', 'admin')),
  priority          int NOT NULL DEFAULT 5
    CHECK (priority BETWEEN 1 AND 10),
  portrait_id       uuid REFERENCES profile_portraits(id),
  error_message     text,
  attempts          int NOT NULL DEFAULT 0,
  last_attempted_at timestamptz,
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portrait_queue_status
  ON portrait_inference_queue(status, priority, created_at)
  WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_portrait_queue_user
  ON portrait_inference_queue(user_id, status);

CREATE OR REPLACE FUNCTION update_portrait_queue_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER portrait_queue_updated_at_trigger
  BEFORE UPDATE ON portrait_inference_queue
  FOR EACH ROW EXECUTE FUNCTION update_portrait_queue_updated_at();
```

### Migration 03 — `create_portrait_render_events`

```sql
-- Migration: create_portrait_render_events
-- Audit log for portrait view/share events. Powers the growth timeline.

CREATE TABLE IF NOT EXISTS portrait_render_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL,
  portrait_id   uuid NOT NULL REFERENCES profile_portraits(id) ON DELETE CASCADE,
  event_type    text NOT NULL DEFAULT 'view'
    CHECK (event_type IN ('view', 'share', 'export', 'delta_view')),
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portrait_render_events_user
  ON portrait_render_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_portrait_render_events_portrait
  ON portrait_render_events(portrait_id);
```

### Migration 04 — `create_portrait_rpcs`

```sql
-- Migration: create_portrait_rpcs
-- RPCs: assemble_portrait_input, maybe_queue_portrait_inference, get_latest_portrait

-- NOTE: Full function bodies defined in Section 4.2 and 6.3 above.
-- This migration applies both RPCs.

-- assemble_portrait_input: stratified sampling across 6 source tables
-- Returns jsonb blob ready for LLM context injection

-- maybe_queue_portrait_inference: checks all trigger conditions
-- Inserts into portrait_inference_queue if conditions met. Returns boolean.

-- get_latest_portrait: convenience RPC for client
CREATE OR REPLACE FUNCTION get_latest_portrait(p_user_id text)
RETURNS jsonb
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT artifact
  FROM profile_portraits
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY portrait_version DESC
  LIMIT 1;
$$;

-- get_portrait_history: returns list of portraits for timeline view
CREATE OR REPLACE FUNCTION get_portrait_history(p_user_id text)
RETURNS TABLE(
  id uuid,
  portrait_version int,
  overall_confidence numeric,
  thematic_clusters text[],
  total_source_records int,
  input_window_from timestamptz,
  input_window_to timestamptz,
  created_at timestamptz,
  has_delta boolean
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    id, portrait_version, overall_confidence, thematic_clusters,
    total_source_records, input_window_from, input_window_to,
    created_at,
    (previous_portrait_id IS NOT NULL) AS has_delta
  FROM profile_portraits
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY portrait_version DESC;
$$;
```

### Migration 05 — `add_memory_entries_fields`

This migration checks `memory_entries` for fields needed by the portrait assembly layer. If the table does not yet have `importance_score` or `memory_type`, they are added.

```sql
-- Migration: add_memory_entries_fields
-- Defensive — checks column existence before adding

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memory_entries' AND column_name = 'importance_score'
  ) THEN
    ALTER TABLE memory_entries ADD COLUMN importance_score numeric DEFAULT 0.5;
    COMMENT ON COLUMN memory_entries.importance_score IS
      'Normalized importance 0.0-1.0. Used by portrait assembly for sampling priority.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memory_entries' AND column_name = 'memory_type'
  ) THEN
    ALTER TABLE memory_entries ADD COLUMN memory_type text DEFAULT 'general';
    COMMENT ON COLUMN memory_entries.memory_type IS
      'Type classification: general | plk | somatic | narrative | insight';
  END IF;
END $$;
```

### Migration 06 — `portrait_rls_policies`

```sql
-- Migration: portrait_rls_policies
-- RLS: users can only read their own portraits.
-- Service role (API routes) can insert/update.

ALTER TABLE profile_portraits ENABLE ROW LEVEL SECURITY;
ALTER TABLE portrait_inference_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE portrait_render_events ENABLE ROW LEVEL SECURITY;

-- profile_portraits: users read own rows
CREATE POLICY "Users read own portraits"
  ON profile_portraits FOR SELECT
  USING (user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Service role INSERT via API routes — no RLS restriction needed for service_role
-- Client-side never writes directly to profile_portraits

-- portrait_inference_queue: users can read their own queue status (for UI polling)
CREATE POLICY "Users read own queue entries"
  ON portrait_inference_queue FOR SELECT
  USING (user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Users can INSERT a manual trigger queue entry (subject to API-enforced cooldown)
CREATE POLICY "Users insert own queue entries"
  ON portrait_inference_queue FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid() LIMIT 1));

-- portrait_render_events: users can insert their own events and read their own history
CREATE POLICY "Users read own render events"
  ON portrait_render_events FOR SELECT
  USING (user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "Users insert own render events"
  ON portrait_render_events FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid() LIMIT 1));

-- assemble_portrait_input and maybe_queue_portrait_inference are SECURITY DEFINER
-- RPCs — they bypass RLS and run as the function owner. No additional policy needed.
```

---

## 9. API Route — `/api/gen-engine/portrait`

Add to the existing gen-engine route handler in `api/gen-engine/`:

### `POST /api/gen-engine/portrait/run`

Pulls the next `pending` job from `portrait_inference_queue`, assembles input via `assemble_portrait_input`, calls the LLM, validates the artifact, and stores to `profile_portraits`.

```typescript
// api/gen-engine/portrait.ts (new file)

import { ProfilePortraitArtifactSchema } from '@/shared/gen-engine/core';
import { PORTRAIT_INFERENCE_PROMPT_V1 } from '@/shared/gen-engine/prompts/portrait-v1.0.0';
import { supabaseAdmin } from '@/lib/supabase';

export async function runPortraitInference(queueId: string): Promise<string> {
  // 1. Claim the job (set status = 'processing')
  const { data: job } = await supabaseAdmin
    .from('portrait_inference_queue')
    .update({ status: 'processing', last_attempted_at: new Date().toISOString(), attempts: supabaseAdmin.rpc('increment', { x: 1 }) })
    .eq('id', queueId).eq('status', 'pending')
    .select().single();

  if (!job) throw new Error('Job already claimed or not found');

  try {
    // 2. Assemble input
    const { data: assembledInput } = await supabaseAdmin
      .rpc('assemble_portrait_input', { p_user_id: job.user_id });

    // 3. Fetch previous portrait for delta
    const { data: prevPortrait } = await supabaseAdmin
      .from('profile_portraits')
      .select('id, artifact, portrait_version')
      .eq('user_id', job.user_id)
      .eq('status', 'active')
      .order('portrait_version', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 4. Build prompt
    const prompt = PORTRAIT_INFERENCE_PROMPT_V1
      .replace('{ASSEMBLED_INPUT}', JSON.stringify(assembledInput, null, 2))
      .replace('{PREVIOUS_PORTRAIT_JSON}',
        prevPortrait ? JSON.stringify(prevPortrait.artifact, null, 2) : 'null');

    // 5. Call LLM (use existing LLM client from gen-engine)
    const rawResponse = await callLLM({
      systemPrompt: prompt,
      model: 'claude-3-7-sonnet',
      maxTokens: 8000,
      responseFormat: 'json',
    });

    // 6. Parse + validate
    const parsed = JSON.parse(rawResponse);
    const validated = ProfilePortraitArtifactSchema.parse(parsed); // throws if invalid

    // 7. Derive denormalized fields
    const dimensionsSummary = Object.fromEntries(
      validated.dimensions.map(d => [d.dimensionKey, {
        confidence: d.confidence,
        tags: d.tags,
        evidenceCount: d.evidenceCount,
      }])
    );

    const overallConfidence = validated.dimensions.reduce(
      (sum, d) => sum + d.confidence, 0
    ) / validated.dimensions.length;

    // 8. Insert portrait
    const { data: portrait } = await supabaseAdmin
      .from('profile_portraits')
      .insert({
        user_id: job.user_id,
        subject_id: validated.subjectId,
        portrait_version: (prevPortrait?.portrait_version ?? 0) + 1,
        artifact: validated,
        dimensions_summary: dimensionsSummary,
        thematic_clusters: validated.thematicClusters,
        overall_confidence: overallConfidence,
        inference_model: validated.metadata.inferenceModel,
        prompt_version: validated.metadata.promptVersion,
        total_source_records: validated.metadata.totalSourceRecords,
        input_window_from: validated.metadata.inputDataWindow.from,
        input_window_to: validated.metadata.inputDataWindow.to,
        previous_portrait_id: prevPortrait?.id ?? null,
        delta_summary: validated.deltaFromPrevious,
        status: 'active',
      })
      .select().single();

    // 9. Archive previous portrait
    if (prevPortrait) {
      await supabaseAdmin
        .from('profile_portraits')
        .update({ status: 'archived' })
        .eq('id', prevPortrait.id);
    }

    // 10. Complete queue entry
    await supabaseAdmin
      .from('portrait_inference_queue')
      .update({ status: 'complete', portrait_id: portrait!.id })
      .eq('id', queueId);

    return portrait!.id;

  } catch (err) {
    await supabaseAdmin
      .from('portrait_inference_queue')
      .update({ status: 'failed', error_message: String(err) })
      .eq('id', queueId);
    throw err;
  }
}
```

### `GET /api/gen-engine/portrait/status`

Polls queue status for client UI. Returns `{ status, portraitId, estimatedWait }`.

### `GET /api/gen-engine/portrait/latest`

Returns the latest active portrait for the authenticated user. Used by the renderer.

---

## 10. Rendering Engine

### 10.1 Component Architecture

```
ProfilePortraitPage
├── PortraitHeader             — version, date, overall confidence badge
├── OverarchingNarrative       — the 300-600 word holistic synthesis
├── DimensionGrid              — 10 dimension cards
│   └── DimensionCard          — per dimension
│       ├── DimensionLabel
│       ├── ConfidenceMeter
│       ├── SynthesisText
│       ├── RawQuotesBlock     — collapsed by default, user-controlled
│       └── TagCloud
├── ThematicClustersPanel      — the 3-7 cross-dimensional themes
├── DeltaPanel                 — only if deltaFromPrevious exists
│   ├── DeltaShiftSummary
│   ├── NewThemes / RetiredThemes
│   └── OverallShiftNarrative
├── PortraitTimeline           — version history strip
│   └── PortraitTimelineNode   — per version, clickable
└── PortraitMetadataFooter     — source count, window, model (collapsed)
```

### 10.2 Dimension Display Order

The 10 dimensions render in this order — moving from observable surface to deep pattern:

1. `linguistic_signature` — *How they speak*
2. `identity_narrative` — *How they see themselves*
3. `cognitive_architecture` — *How they think*
4. `emotional_landscape` — *How they feel*
5. `somatic_intelligence` — *How their body knows*
6. `relational_orientation` — *How they connect*
7. `creative_expression` — *How they make*
8. `values_and_ethics` — *What they hold sacred*
9. `embodied_patterns` — *What recurs without choosing*
10. `growth_edges` — *Where they are becoming*

`growth_edges` is last deliberately. It is not a deficiency list — it is the forward horizon, and it lands most powerfully after the user has been seen in full.

### 10.3 Confidence Meter Styling

```typescript
// Confidence renders as a subtle horizontal bar, not a number
// Colors pulled from existing design token system:
// 0.0 - 0.4: --color-text-faint (thin data, labeled "Early signal")
// 0.4 - 0.7: --color-text-muted (developing signal, labeled "Building")
// 0.7 - 0.9: --color-primary (strong signal, labeled "Clear")
// 0.9 - 1.0: --color-success  (dense signal, labeled "Well-established")
```

### 10.4 Delta Panel

The delta is the emotional core of the versioning feature. When `deltaFromPrevious` exists, a dedicated panel renders above the dimension grid showing:

- What shifted and in which direction (`deepened`, `expanded`, `resolved`, `emerged`, `retreated`)
- New thematic clusters that did not exist in the previous portrait
- Retired themes — patterns that appear to have resolved or receded
- The `overallShiftNarrative` — the LLM's synthesis of the growth arc between versions

This is the record of becoming. The growth timeline strip below shows all portrait versions as nodes, each clickable to compare.

---

## 11. Portrait Inference Prompt — Dimension Guidance

The LLM must receive explicit guidance for each dimension. These are injected into the prompt:

| Dimension | What to Look For | Key Signal Sources |
|-----------|------------------|--------------------|
| `linguistic_signature` | Recurring syntactic patterns, metaphor clusters, sentence structure, what words appear at moments of highest intensity | `bucket_drops` (raw_text, high plk_resonance_score), `billy_sessions` |
| `cognitive_architecture` | Associative vs. sequential thinking, tolerance for ambiguity, pattern recognition style, how the user connects ideas across domains | All sources — look for cross-domain leaps |
| `emotional_landscape` | Predominant emotional registers, what triggers intensity, what the user avoids naming, emotional vocabulary breadth | `bucket_drops` (intensity ≥ 4), `tribunal_sessions`, `billy_sessions` |
| `somatic_intelligence` | Nervous system awareness, body-based signals, what music does to them and why, physical metaphors in language | `musical_dna_analyses`, somatic language in `bucket_drops` |
| `identity_narrative` | How the user talks about themselves over time — protagonist role, agency level, temporal orientation, how they narrate change | `consciousness_profiles` snapshot, `billy_sessions`, `bucket_drops` |
| `relational_orientation` | How others appear in captures — frequency, named vs. unnamed, roles assigned, what is longed for vs. feared in connection | `bucket_drops`, `tribunal_sessions` |
| `creative_expression` | Forms, modes, and media the user returns to; whether creativity is tool or identity; what blocks vs. unlocks | `bucket_drops` (module_key, specialized_apps), `billy_sessions` |
| `values_and_ethics` | What the user treats as non-negotiable, what makes them angry, what they protect, the ethical frameworks in their language | All sources — look for intensity around principles |
| `growth_edges` | Specific, observable, recurring patterns that create friction — not deficits, but places where becoming is actively happening | All sources — look for repeated themes, unresolved loops |
| `embodied_patterns` | The deepest layer: what recurs without the user choosing it, the autopoietic patterns that are most durable | `consciousness_profiles`, oldest `bucket_drops`, repeated themes across time |

---

## 12. File Map — New Files to Create

```
api/
  gen-engine/
    portrait.ts                     ← New: inference runner, queue handler, API routes

shared/
  gen-engine/
    types.ts                        ← Modified: add ProfilePortraitArtifact types
    core.ts                         ← Modified: add ProfilePortraitArtifactSchema
    prompts/
      portrait-v1.0.0.ts            ← New: versioned inference prompt

client/
  src/
    pages/
      ProfilePortraitPage.tsx       ← New: portrait viewer page
    components/
      portrait/
        PortraitHeader.tsx
        OverarchingNarrative.tsx
        DimensionGrid.tsx
        DimensionCard.tsx
        ConfidenceMeter.tsx
        RawQuotesBlock.tsx
        ThematicClustersPanel.tsx
        DeltaPanel.tsx
        PortraitTimeline.tsx
        PortraitMetadataFooter.tsx
    features/
      portrait/
        usePortrait.ts              ← New: hook — fetches latest, polls queue status
        usePortraitHistory.ts       ← New: hook — fetches timeline
        portraitSlice.ts            ← New: state slice if using Redux

supabase/
  migrations/
    001_create_profile_portraits.sql
    002_create_portrait_inference_queue.sql
    003_create_portrait_render_events.sql
    004_create_portrait_rpcs.sql
    005_add_memory_entries_fields.sql
    006_portrait_rls_policies.sql
```

---

## 13. Open Questions for Keith to Decide

These questions do not block migration application. They affect surface design and entitlement logic only.

1. **Raw quotes opt-in** — Should `rawQuotes` be hidden by default with an explicit "Show my own words" toggle? The quotes are verbatim from the user's own captures, but seeing them pulled out and cited may feel differently than reading them in the original context.

2. **Free tier portrait limit** — The spec sets 2 lifetime portraits for free tier. Should it be 1 (first-look, then upgrade), or unlimited with a cadence throttle (e.g., one per 90 days)?

3. **`growth_edges` visibility** — Growth edges are by definition the rougher material — patterns creating friction. Should this dimension be collapsible by default, with a deliberate "I'm ready to see this" expand gesture?

4. **Portrait as onboarding gate** — Should the first portrait run become a milestone in the Billy onboarding flow, triggered once the user has 15+ bucket drops? This would make portrait generation feel ceremonial rather than incidental.

5. **External sharing** — Is portrait export (PDF, shareable link) in scope for v1? If so, the `portrait_render_events.event_type` already accommodates `'share'` and `'export'`, but the actual export route needs to be designed.

---

## 14. Implementation Order

Apply in this sequence to minimize risk:

1. **Run Migration 01** — creates `profile_portraits` table. No dependencies.
2. **Run Migration 02** — creates `portrait_inference_queue`. Depends on 01 (FK to `profile_portraits`).
3. **Run Migration 03** — creates `portrait_render_events`. Depends on 01.
4. **Run Migration 05** — adds columns to `memory_entries`. Fully defensive, safe at any point.
5. **Implement shared types** — add `ProfilePortraitArtifact` types to `shared/gen-engine/types.ts`.
6. **Implement Zod schema** — add `ProfilePortraitArtifactSchema` to `shared/gen-engine/core.ts`.
7. **Write prompt file** — `shared/gen-engine/prompts/portrait-v1.0.0.ts`.
8. **Run Migration 04** — RPCs depend on tables existing (Migrations 01-03) and can reference the new columns from Migration 05.
9. **Implement API route** — `api/gen-engine/portrait.ts`. Depends on schema and RPCs.
10. **Run Migration 06** — RLS policies. Apply last so tables and RPCs are proven working first.
11. **Build renderer components** — `ProfilePortraitPage` and all child components.
12. **Wire routing** — add `/portrait` route to `App.tsx`.
13. **Validation** — `npm run build`, test queue flow with a seeded user, verify Zod validation rejects malformed LLM output.

---

## 15. Rollback Path

| Step | Rollback Action |
|------|----------------|
| Migration 06 (RLS) | `DROP POLICY` statements for all 5 policies |
| Migration 04 (RPCs) | `DROP FUNCTION assemble_portrait_input`, `DROP FUNCTION maybe_queue_portrait_inference`, `DROP FUNCTION get_latest_portrait`, `DROP FUNCTION get_portrait_history` |
| Migration 03 | `DROP TABLE portrait_render_events` |
| Migration 02 | `DROP TABLE portrait_inference_queue` |
| Migration 01 | `DROP TABLE profile_portraits` — only after Migrations 02/03 are dropped |
| Migration 05 | `ALTER TABLE memory_entries DROP COLUMN importance_score, DROP COLUMN memory_type` — safe, no FK dependencies |
| TypeScript changes | `git revert` on `types.ts`, `core.ts`, new prompt file — zero runtime impact until API route is live |

No existing table is modified destructively by any migration. All rollbacks are safe.

