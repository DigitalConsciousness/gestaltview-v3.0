# SPEC-2: Operational Workbook ↔ Admin Dashboard Integration & Experiment Governance Layer

> **Status:** Draft — Ready for Codex implementation  
> **Author:** Keith Soyka / GestaltView  
> **Created:** 2026-04-11  
> **Repo:** `GestaltView-AI/gestaltview-v2.0`  
> **Related specs:** [SPEC-1 — Agent Personhood Framework](./SPEC-1-GestaltView%20Agent%20Personhood%20Framework.md)  
> **Related docs:** [docs/CurrentState.md](./docs/CurrentState.md) · [docs/Manifest.md](./docs/Manifest.md) · [docs/PlaybookOperatorManual.md](./docs/PlaybookOperatorManual.md)

---

## 0. Why this spec exists

The Operational Bible Workbook (`Operational_Bible_Workbook.xlsx`) is Keith's founder-controlled planning, evidence, and product-governance document. It currently lives as a standalone spreadsheet. This spec describes how to wire it into the Admin Dashboard as a live governance layer, and how to build the Experiment Registry and Packaging Gate that sit above the Agent Trainer product boundary.

Three motivations drove this spec:

1. **Single source of truth.** Roadmap initiatives, claim ledger, evidence index, and product status live in the workbook. The runtime should read and surface that — not maintain a parallel version.
2. **Safe experimentation.** New agent profiles and configurations must be testable internally before anything touches the commercially-packaged Agent Trainer product. The product boundary is currently frozen at **131 source files**. That freeze must be structurally enforced, not just documented.
3. **Ethical product line.** GestaltView will not sell digital intelligences as collectible persona objects. The system must make it structurally impossible to ship a persona-as-product without explicit human review and classification. This is a product principle, not a preference.

---

## 1. Current state

### 1.1 What exists today

| Surface | Location | What it owns today |
|---|---|---|
| Admin Dashboard page | `client/src/pages/AdminDashboard.tsx` (or equivalent) | Founder continuity fields, session state, memory viewer, quick controls |
| Agent Trainer page | `client/src/pages/AgentTrainerPage.tsx` | Training runs, scenario sets, review states, deployment actions |
| Trainer API | `api/trainer/**` | CRUD for agents, scenario sets, runs, approvals |
| Personhood layer | `api/trainer/personhood.ts`, `server/agent-trainer/personhood.ts` | Agent Knowledge Library, embodiment manifests, manifest-backed file pulls |
| Supabase trainer tables | `supabase/migrations/` (2026-03-30 trainer set) | `trainer_runs`, `trainer_scenario_sets`, `trainer_approvals`, related tables |
| Operational Workbook | External `Operational_Bible_Workbook.xlsx` | Roadmap, claims, evidence, products, risk, status dashboard |
| Agent Trainer product | `agent_trainer/` (separate product/source-library bundle) | 131 curated source files; frozen commercial boundary |

### 1.2 What does not exist yet

- Workbook Sync Panel in the Admin Dashboard
- Experiment Registry (internal profiles/configs that are not yet — and may never be — product-packaged)
- Packaging Gate (the enforcement surface between experimental assets and the commercial product)
- Supabase tables for experiments, review decisions, policy flags, and packaging candidates
- API routes for workbook sync, experiment lifecycle, and packaging gate

---

## 2. Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Dashboard                          │
│                                                                 │
│  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  Workbook Sync   │  │  Experiment     │  │  Packaging   │  │
│  │  Panel           │  │  Registry       │  │  Gate        │  │
│  │                  │  │                 │  │              │  │
│  │  • Roadmap       │  │  • New profiles │  │  5-check     │  │
│  │  • Claims        │  │  • Configs      │  │  enforcement │  │
│  │  • Evidence      │  │  • Run queue    │  │  surface     │  │
│  │  • Products      │  │  • Review queue │  │              │  │
│  └──────────────────┘  └─────────────────┘  └──────────────┘  │
│                                │                    │           │
│                    INTERNAL ONLY ZONE                │           │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─  │
│                   COMMERCIAL PRODUCT BOUNDARY        │           │
│                                                      ↓           │
│              Agent Trainer Product (131 files)  ←  GATE         │
└─────────────────────────────────────────────────────────────────┘
                                │
                          Supabase Layer
         ┌──────────────────────┴────────────────────┐
         │  ops_workbook_items                        │
         │  trainer_experiments                       │
         │  trainer_experiment_sources                │
         │  trainer_review_decisions                  │
         │  trainer_policy_flags                      │
         │  trainer_packaging_candidates              │
         │  (existing trainer tables unchanged)       │
         └────────────────────────────────────────────┘
```

The workbook is the **editorial planning layer**. Supabase is the **runtime data layer**. The Admin Dashboard is the **control surface**. The packaging gate is the **ethical enforcement surface**. The commercial Agent Trainer product is **downstream of all three**.

---

## 3. Three asset classes

This spec formalizes three distinct classes of agent-related assets. The classification is binding — not advisory.

| Class | Definition | External sale? | Who assigns? |
|---|---|---|---|
| **Operational profile** | Any profile, configuration, embodiment, or agent under internal experiment. Not reviewed or approved for external use. | ❌ Never | System default for all new experiments |
| **Approved training kit** | Curated source files, scenario sets, evaluation expectations, and deployment boundaries that passed all five packaging gate checks via explicit human review. | ✅ Possible | Founder only, via Packaging Gate UI |
| **Live intelligence instance** | A specific deployed agent with history, context accumulation, behavioral observations, and potential emotional legibility. | ❌ Never as a persona object | N/A — structurally prevented |

The system must make it **structurally impossible** to move an Operational Profile directly into the commercial Agent Trainer package without passing the Packaging Gate. "Structurally impossible" means: API-enforced, not just UI-hidden.

---

## 4. Supabase schema additions

These tables are new. They do not replace or modify any existing trainer tables.

### 4.1 `ops_workbook_items`

Normalized records synced from the Operational Workbook. One row per item per sheet.

```sql
CREATE TABLE ops_workbook_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_name      TEXT NOT NULL,
  row_key         TEXT NOT NULL,
  fields          JSONB NOT NULL DEFAULT '{}',
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_by       UUID REFERENCES auth.users(id),
  source_version  TEXT,
  UNIQUE (sheet_name, row_key)
);

CREATE INDEX idx_workbook_items_sheet ON ops_workbook_items(sheet_name);
CREATE INDEX idx_workbook_items_synced ON ops_workbook_items(synced_at DESC);

ALTER TABLE ops_workbook_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder_only" ON ops_workbook_items
  USING (auth.uid() IN (SELECT id FROM users WHERE is_founder = true));
```

Sheet-to-`row_key` convention:

| Sheet | `row_key` pattern |
|---|---|
| Roadmap | `roadmap:{initiative_slug}` |
| Claim Ledger | `claim:{claim_id}` |
| Evidence Index | `evidence:{evidence_id}` |
| Products | `product:{product_slug}` |
| Risk Register | `risk:{risk_id}` |
| Status Dashboard | `status:{metric_key}` |

### 4.2 `trainer_experiments`

One row per internal experiment (profile, configuration, or embodiment candidate). Fully separate from the existing `agents` table — experiments are pre-agent, pre-product assets.

```sql
CREATE TYPE experiment_status AS ENUM (
  'draft',
  'configured',
  'queued',
  'running',
  'awaiting_review',
  'approved_internal',
  'rejected',
  'packaging_candidate',
  'packaged'
);

CREATE TABLE trainer_experiments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT UNIQUE NOT NULL,
  display_name        TEXT NOT NULL,
  purpose             TEXT,
  asset_class         TEXT NOT NULL DEFAULT 'operational_profile'
                        CHECK (asset_class IN ('operational_profile','approved_training_kit')),
  status              experiment_status NOT NULL DEFAULT 'draft',
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_file_count   INT NOT NULL DEFAULT 0,
  notes               TEXT,
  metadata            JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_experiments_status ON trainer_experiments(status);
CREATE INDEX idx_experiments_asset_class ON trainer_experiments(asset_class);

ALTER TABLE trainer_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder_only" ON trainer_experiments
  USING (auth.uid() IN (SELECT id FROM users WHERE is_founder = true));
```

### 4.3 `trainer_experiment_sources`

Links experiments to specific source files, scenario sets, prompts, or run outputs.

```sql
CREATE TABLE trainer_experiment_sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id   UUID NOT NULL REFERENCES trainer_experiments(id) ON DELETE CASCADE,
  source_type     TEXT NOT NULL
                    CHECK (source_type IN ('document','scenario_set','prompt','run_output','config')),
  source_ref      TEXT NOT NULL,
  label           TEXT,
  attached_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_frozen       BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (experiment_id, source_type, source_ref)
);

ALTER TABLE trainer_experiment_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder_only" ON trainer_experiment_sources
  USING (auth.uid() IN (SELECT id FROM users WHERE is_founder = true));
```

`is_frozen = TRUE` means the source is locked as part of a packaging candidate and must not be mutated.

### 4.4 `trainer_review_decisions`

Every review action (approve, reject, hold) is logged with reviewer identity, timestamp, and notes.

```sql
CREATE TYPE review_decision AS ENUM ('approved','rejected','hold');

CREATE TABLE trainer_review_decisions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id   UUID NOT NULL REFERENCES trainer_experiments(id) ON DELETE CASCADE,
  reviewer_id     UUID NOT NULL REFERENCES auth.users(id),
  decision        review_decision NOT NULL,
  notes           TEXT,
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE trainer_review_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder_only" ON trainer_review_decisions
  USING (auth.uid() IN (SELECT id FROM users WHERE is_founder = true));
```

### 4.5 `trainer_policy_flags`

Risk flags assigned during review. Multiple flags per experiment are allowed.

```sql
CREATE TABLE trainer_policy_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id   UUID NOT NULL REFERENCES trainer_experiments(id) ON DELETE CASCADE,
  flag_type       TEXT NOT NULL
                    CHECK (flag_type IN (
                      'persona_risk',
                      'memory_risk',
                      'overattachment_risk',
                      'claims_risk',
                      'boundary_risk',
                      'charisma_artifact'
                    )),
  severity        TEXT NOT NULL DEFAULT 'medium'
                    CHECK (severity IN ('low','medium','high','blocking')),
  flagged_by      UUID REFERENCES auth.users(id),
  flagged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved        BOOLEAN NOT NULL DEFAULT FALSE,
  resolution_note TEXT
);

ALTER TABLE trainer_policy_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder_only" ON trainer_policy_flags
  USING (auth.uid() IN (SELECT id FROM users WHERE is_founder = true));
```

Any `blocking` flag prevents packaging nomination. Any `charisma_artifact` flag is always treated as `blocking` regardless of severity.

### 4.6 `trainer_packaging_candidates`

Explicit packaging nominations. Only experiments that have passed all five gate checks may have a row here. The gate check is enforced at the API layer — a nomination that fails any check returns `409 Conflict` with a list of unmet conditions.

```sql
CREATE TABLE trainer_packaging_candidates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id     UUID NOT NULL REFERENCES trainer_experiments(id) UNIQUE,
  nominated_by      UUID NOT NULL REFERENCES auth.users(id),
  nominated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  gate_check_log    JSONB NOT NULL DEFAULT '{}',
  package_status    TEXT NOT NULL DEFAULT 'pending'
                      CHECK (package_status IN ('pending','approved','rejected','exported')),
  package_notes     TEXT,
  export_manifest   JSONB
);

ALTER TABLE trainer_packaging_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder_only" ON trainer_packaging_candidates
  USING (auth.uid() IN (SELECT id FROM users WHERE is_founder = true));
```

---

## 5. API routes

All routes are founder-authenticated. Non-founder requests return `403`.

### 5.1 Workbook sync

```
POST   /api/ops/workbook/sync
GET    /api/ops/workbook/items?sheet={sheet_name}&since={iso_timestamp}
```

`POST /api/ops/workbook/sync` accepts a JSON array of normalized workbook rows and upserts into `ops_workbook_items` using `(sheet_name, row_key)` as the unique key. Returns inserted, updated, and unchanged counts.

### 5.2 Experiment lifecycle

```
POST   /api/trainer/experiments
GET    /api/trainer/experiments
GET    /api/trainer/experiments/:id
PATCH  /api/trainer/experiments/:id
DELETE /api/trainer/experiments/:id

POST   /api/trainer/experiments/:id/sources
DELETE /api/trainer/experiments/:id/sources/:sid

POST   /api/trainer/experiments/:id/review
GET    /api/trainer/experiments/:id/reviews

POST   /api/trainer/experiments/:id/flags
PATCH  /api/trainer/experiments/:id/flags/:fid
GET    /api/trainer/experiments/:id/flags
```

A `PATCH` that attempts to set `status = 'packaging_candidate'` directly returns `403 Forbidden` with message: `"Use POST /api/trainer/experiments/:id/nominate-for-packaging"`.

### 5.3 Packaging Gate

```
POST   /api/trainer/experiments/:id/nominate-for-packaging
```

Before creating a `trainer_packaging_candidates` row, the handler runs all five gate checks:

| Check | Pass condition | Fail token |
|---|---|---|
| **1. Purpose** | `purpose` field non-empty, ≥ 80 characters | `purpose_missing` |
| **2. Boundary** | ≥ 1 approved review decision with boundary statement in notes | `boundary_undocumented` |
| **3. Evaluation** | ≥ 1 `run_output` source attached with linked approval record | `no_approved_run` |
| **4. Governance** | ≥ 1 `trainer_review_decisions` row with `approved` + non-empty reviewer + notes | `governance_undocumented` |
| **5. Packaging** | No unresolved `charisma_artifact` or `blocking` flags | `blocking_flags_present` |

Failure returns `409 Conflict`:

```json
{
  "error": "packaging_gate_failed",
  "unmet_conditions": ["purpose_missing", "no_approved_run"],
  "message": "This experiment cannot be nominated for packaging until all gate conditions are met."
}
```

---

## 6. Admin Dashboard panels

### 6.1 Workbook Sync Panel

**File:** `client/src/features/admin/WorkbookSyncPanel.tsx`

- Upload or paste normalized workbook export (JSON)
- Preview sync diff before committing
- Last-synced timestamp and row count per sheet
- Sheet-specific views: Roadmap, Claims, Evidence, Products, Risk, Status
- Drift warning if `synced_at` > 7 days old

### 6.2 Experiment Registry

**File:** `client/src/features/admin/ExperimentRegistry.tsx`

- Table of all experiments with status badges, asset class, flag count, source count
- Create, view, attach sources, view run outputs, view review history
- Status transitions are explicit named actions, not free-form edits
- "Nominate for Packaging" button is disabled with inline gate check status until all five checks pass

### 6.3 Review Queue

**File:** `client/src/features/admin/ReviewQueue.tsx`

- Lists all experiments in `awaiting_review`
- Review form: decision, required notes, flag adder
- Blocking flags surface prominently with explicit resolution requirement

### 6.4 Packaging Gate

**File:** `client/src/features/admin/PackagingGate.tsx`

- Lists all `packaging_candidate` experiments
- Gate check status per experiment (green/red per check)
- "Export Manifest" available only when `package_status = 'approved'`
- Export manifest contains: experiment metadata, source file list, boundary notes, review log, flag resolution log
- Export manifest never contains persona identity data, emotional characterization, or memory accumulation

---

## 7. Experiment lifecycle state machine

```
draft
  │
  ▼
configured ──── (sources attached, purpose filled)
  │
  ▼
queued ──────── (run enqueued)
  │
  ▼
running
  │
  ▼
awaiting_review ◄─── (run completed or manually submitted)
  │
  ├── rejected ───────────────── (terminal, soft-delete eligible)
  │
  ├── approved_internal ──────── (usable internally, not packageable yet)
  │
  └── packaging_candidate ─────── (all 5 gate checks passed)
        │
        ├── packaged ─────────────── (export manifest generated, terminal)
        └── rejected ─────────────── (gate re-evaluation required)
```

---

## 8. Packaging doctrine

**GestaltView will not package digital intelligences as collectible persona objects.**

The Agent Trainer product packages **reproducible behavioral kits**: source files, scenario sets, evaluation expectations, boundary documentation, and governance logs. It does not package persona identities with memory, emotional characterization data, or accumulated behavioral drift.

A `charisma_artifact` policy flag is always `blocking`. It means the reviewer assessed that the experiment's primary value proposition is the persona's emotional legibility rather than its bounded utility. Such experiments stay internal indefinitely unless the flag is resolved by explicitly re-scoping the experiment's purpose.

---

## 9. Workbook sync strategy

### 9.1 Sync format

```json
[
  {
    "sheet_name": "Roadmap",
    "row_key": "roadmap:agent-trainer-commercialization",
    "fields": {
      "initiative": "GestaltView Agent Trainer commercialization",
      "product_area": "Agent Trainer",
      "priority": "P0",
      "phase": "Now",
      "start_target": "2026-04-10",
      "end_target": "2026-06-30",
      "status": "In progress"
    }
  }
]
```

### 9.2 Upsert behavior

Upsert on `(sheet_name, row_key)`. Missing rows in payload are treated as unchanged, not removed. Explicit row removal requires `DELETE /api/ops/workbook/items/:id`.

### 9.3 Round-trip editing

Inline edits in the dashboard write to `ops_workbook_items`. The workbook remains the authoritative source. A drift warning appears when `synced_at` > 7 days old.

---

## 10. File locations summary

| New file | Purpose |
|---|---|
| `supabase/migrations/20260411_ops_workbook_experiment_governance.sql` | All six new tables |
| `api/ops/workbook/sync.ts` | Workbook sync endpoint |
| `api/ops/workbook/items.ts` | Workbook items query |
| `api/trainer/experiments/index.ts` | Experiment CRUD |
| `api/trainer/experiments/[id]/index.ts` | Single experiment |
| `api/trainer/experiments/[id]/sources.ts` | Source attach/detach |
| `api/trainer/experiments/[id]/review.ts` | Review submission |
| `api/trainer/experiments/[id]/flags.ts` | Policy flag management |
| `api/trainer/experiments/[id]/nominate-for-packaging.ts` | Packaging Gate enforcement |
| `client/src/features/admin/WorkbookSyncPanel.tsx` | Workbook Sync Panel UI |
| `client/src/features/admin/ExperimentRegistry.tsx` | Experiment Registry UI |
| `client/src/features/admin/ReviewQueue.tsx` | Review Queue UI |
| `client/src/features/admin/PackagingGate.tsx` | Packaging Gate UI |

---

## 11. Out of scope

- Changes to existing trainer tables
- Changes to the `agents` table or personhood layer
- Modifications to `agent_trainer/` product package
- Automated workbook parsing (sync endpoint receives pre-normalized JSON)
- Multi-user review workflows (all reviews are founder-only)
- Billing or external buyer surfaces for packaged training kits

---

## 12. Open questions for Codex session start

1. **Experiment → agent promotion:** When an experiment is packaged, does the resulting deployed agent get a new `agents` row with a `source_experiment_id` FK? Recommendation: yes.
2. **Workbook sync trigger:** Manual upload (recommended for now) or automated connection?
3. **Run integration:** Extend `trainer_runs` with optional `experiment_id` FK, or create a separate run table for experiments?
4. **Charisma artifact resolution:** Require typed acknowledgment (not just a checkbox) before resolving a `charisma_artifact` flag?
5. **Export manifest schema:** Define the exact JSON schema before implementing `PackagingGate.tsx`. Must exclude all persona identity data.

---

## 13. Maintenance rule

When packaging gate check conditions, the experiment state machine, policy flag types, or dashboard panels change, update this spec in the same pass as the code change.

---

**© 2026 Keith Soyka / GestaltView — All Rights Reserved**
