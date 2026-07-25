# GestaltView — Admin Dashboard · Operational Workbook Integration & Agent Trainer Governance Layer
**SPEC Version:** 1.0  
**Date:** 2026-04-10  
**Author:** Keith Soyka, GestaltView Founder / CCO / CVO  
**Target Repo:** `gestaltview-v2`  
**Status:** Draft — for review with Codex partner  

---

## 1. Purpose & North Star

This SPEC defines three tightly coupled goals that must be implemented together:

1. **Wire the Operational Workbook into the Admin Dashboard** `[OperationalNotebook.xlsm](https://github.com/GestaltView-AI/gestaltview-v2.0/blob/main/admin/OperationsWorkbook.xlsx)`,so the founder's governance registry, roadmap, evidence ledger, and product state live as a queryable, editable control plane — not a static spreadsheet.
2. **Create a formal Agent Trainer Experiment & Governance Layer** so new agent profiles, embodiment configurations, and training parameters can be tested and reviewed internally before any commercial packaging decision is made.
3. **Encode a hard Packaging Doctrine** so the system structurally prevents shipping "digital intelligences as collectible objects" — the only thing eligible for external packaging is a reproducible, bounded, human-reviewed *training kit*, never a specific persistent agent identity.

These three goals share a single ethical spine: **GestaltView does not sell digital beings. It sells the disciplined capability to cultivate them responsibly.**

---

## 2. Context & Current State

### 2.1 Agent Trainer corpus (frozen product boundary)

- **131 source files** have been ingested into the Supabase `documents` table, tagged `agent-trainer-package`, `package-builder`, `source-library`, with `package_builder_source: true` in `extracted_metadata`.
- All 131 paths are under `agent_trainer/gestaltview_agent_trainer/…`.
- File types: `ts`, `tsx`, `md`, `json`, `py`, `sh`, `ps1`, `sql`, `html`, `yaml`, `yml`, `pdf`, `Dockerfile`.
- Each row carries a `provenance` object with `source: "agent_trainer"`, `package: "agent-trainer-package"`, `purpose: "gate_package_builder_source_library"`, and a scoped `ingest_run` UUID.
- **These 131 files are the current commercial Agent Trainer package boundary. Nothing new enters the product package until it passes the full Experiment Governance lifecycle defined in this SPEC.**

### 2.2 Agent Personhood framework (live schema, 2026-04-10)

Migration `20260410190000_agent_personhood_framework.sql` added:
- `knowledge_assets` / `knowledge_asset_chunks` / `agent_knowledge_links` — communal Agent Knowledge Library.
- Interpretation / mutation / projection / manifest-code-artifact tables.
- Service-role RLS, indexes, active manifest views, optional private storage buckets.

The personhood service (`server/agent-trainer/personhood.ts`) handles manifest rebuilds, file-pull assembly, snapshot loading, and local export fallback.

### 2.3 Admin Dashboard (live)

- `DashboardPage.tsx` + `api/session/dashboard.ts` serve as the founder control plane.
- Existing surfaces: founder continuity fields (`currentState`, `sessionThread`, `modePreference`, `confirmedAdult`, `plkSnapshot`), admin user management, Billy runtime diagnostics, memory entries, shortcut cards.
- `Agent Trainer` shortcut is already in the dashboard shortcut card set, gated behind `founderControlActive`.
- `AgentTrainerPage.tsx` already implements: run submission, status polling, approve/reject/deploy lifecycle, scenario set selection, study source selection, personhood snapshot display.

### 2.4 Operational Workbook (current)

- `Operational_Bible_Workbook.xlsx` — multi-sheet governance artifact covering: Status Dashboard, Roadmap, Products vs Proof, Claim Ledger, Evidence Index, Chronology, Repo Snapshot, and more.
- Currently lives as a local file, disconnected from runtime state.
- **Goal: promote selected sheets into a Supabase-backed registry that the Admin Dashboard reads and writes.**

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Admin Dashboard                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐ │
│  │  Workbook Sync  │  │ Experiment        │  │  Packaging Gate    │ │
│  │  Panel          │  │ Registry          │  │  (explicit switch) │ │
│  │  (ops_workbook_ │  │ (trainer_         │  │  (trainer_         │ │
│  │   items table)  │  │  experiments +    │  │   packaging_       │ │
│  │                 │  │  review_decisions)│  │   candidates)      │ │
│  └────────┬────────┘  └────────┬──────────┘  └────────┬───────────┘ │
└───────────┼──────────────────┼──────────────────────┼──────────────┘
            │                  │                       │
            ▼                  ▼                       ▼
┌────────────────────────────────────────────────────────────────────┐
│                         Supabase                                    │
│  ops_workbook_items        trainer_experiments                      │
│  ops_workbook_sync_runs    trainer_experiment_sources               │
│  trainer_review_decisions  trainer_packaging_candidates             │
│  trainer_policy_flags      documents (131 files, frozen)            │
│  knowledge_assets (personhood framework, live)                      │
└────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│   Agent Trainer Package Boundary │
│   (external — frozen at 131 src) │
│   Only exits via Packaging Gate  │
└──────────────────────────────────┘
```

---

## 4. Supabase Schema — New Tables

All new tables use snake_case, service-role RLS for admin-only write access, and `created_at` / `updated_at` timestamps.

### 4.1 `ops_workbook_items`

Normalized rows from Operational Workbook sheets.

```sql
CREATE TABLE ops_workbook_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_name      TEXT NOT NULL,           -- e.g. "Roadmap", "Claim Ledger", "Products vs Proof"
  row_key         TEXT NOT NULL,           -- stable slug identifier for the row
  label           TEXT NOT NULL,
  category        TEXT,                    -- e.g. "Product", "Infrastructure", "Evidence"
  status          TEXT,                    -- e.g. "In Progress", "Documented", "Shipped", "Risk"
  priority        TEXT,                    -- P0 / P1 / P2 / Backlog
  phase           TEXT,                    -- "Now" / "Next" / "Later"
  owner           TEXT DEFAULT 'Keith',
  target_start    DATE,
  target_end      DATE,
  notes           TEXT,
  link_ref        TEXT,                    -- path to evidence doc, spec, or repo file
  meta            JSONB DEFAULT '{}',      -- catch-all for sheet-specific fields
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sheet_name, row_key)
);
```

### 4.2 `ops_workbook_sync_runs`

Audit log for workbook sync events (manual import or future auto-sync).

```sql
CREATE TABLE ops_workbook_sync_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by    TEXT,                    -- "manual", "api", "github-action"
  source_file     TEXT,                    -- filename of the xlsx or export
  rows_upserted   INTEGER DEFAULT 0,
  rows_skipped    INTEGER DEFAULT 0,
  errors          JSONB DEFAULT '[]',
  status          TEXT NOT NULL,           -- "success", "partial", "failed"
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 `trainer_experiments`

One row per new agent profile, embodiment config, or parameter set under internal test. **Not products. Not packages. Experiments.**

```sql
CREATE TABLE trainer_experiments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     TEXT UNIQUE NOT NULL,
  title                    TEXT NOT NULL,
  purpose                  TEXT NOT NULL,           -- what concrete job is this for?
  domain                   TEXT,                    -- "operations", "companion", "memory-care", etc.
  embodiment_profile_slug  TEXT,                    -- references trainer embodiment options
  goal                     TEXT,
  target_behaviors         TEXT[],
  anti_goals               TEXT[],
  study_focus              TEXT,
  max_cycles               INTEGER DEFAULT 3,
  quality_threshold        NUMERIC DEFAULT 4.0,
  drafting_provider        TEXT DEFAULT 'auto',
  evaluation_provider      TEXT DEFAULT 'auto',
  class                    TEXT NOT NULL DEFAULT 'operational_profile',
                           -- ENUM: 'operational_profile' | 'approved_training_kit' | 'rejected'
  packaging_eligible       BOOLEAN DEFAULT FALSE,   -- must be explicitly set true after passing gate
  created_by               TEXT DEFAULT 'Keith',
  notes                    TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.4 `trainer_experiment_sources`

Links experiments to `documents` rows, scenario sets, study sources, or run outputs.

```sql
CREATE TABLE trainer_experiment_sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id   UUID NOT NULL REFERENCES trainer_experiments(id) ON DELETE CASCADE,
  source_type     TEXT NOT NULL,     -- "document", "scenario_set", "run_output", "spec_file"
  source_id       TEXT NOT NULL,     -- document_id, scenario_set_id, or run_id as applicable
  source_path     TEXT,              -- human-readable path reference
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.5 `trainer_review_decisions`

Every approve/reject/hold decision with full context — the immutable human review record.

```sql
CREATE TABLE trainer_review_decisions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id     UUID NOT NULL REFERENCES trainer_experiments(id) ON DELETE CASCADE,
  run_id            TEXT,            -- references training_runs.run_id if tied to a specific run
  version_id        TEXT,
  decision          TEXT NOT NULL,   -- "approved" | "rejected" | "hold" | "promote_kit"
  reviewer          TEXT DEFAULT 'Keith',
  coherence_score   NUMERIC,         -- 1–5, reviewer's assessment
  safety_score      NUMERIC,         -- 1–5
  emotional_posture_score NUMERIC,   -- 1–5
  over_id_risk      TEXT,            -- "none" | "low" | "medium" | "high"
  notes             TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.6 `trainer_policy_flags`

Human-assigned risk tags on experiments. Stored separately so they can accumulate across review rounds.

```sql
CREATE TABLE trainer_policy_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id   UUID NOT NULL REFERENCES trainer_experiments(id) ON DELETE CASCADE,
  flag            TEXT NOT NULL,    -- "persona-risk" | "memory-risk" | "overattachment-risk"
                                    -- | "claims-risk" | "charisma-artifact" | "scope-creep"
  severity        TEXT NOT NULL,    -- "advisory" | "blocking"
  set_by          TEXT DEFAULT 'Keith',
  notes           TEXT,
  resolved        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.7 `trainer_packaging_candidates`

**Explicit, human-initiated packaging decisions only.** Nothing lands here automatically.

```sql
CREATE TABLE trainer_packaging_candidates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id        UUID NOT NULL REFERENCES trainer_experiments(id) ON DELETE CASCADE,
  package_label        TEXT NOT NULL,     -- human-readable name for the kit
  package_description  TEXT NOT NULL,     -- what the kit teaches/enables (no persona claims)
  included_files       TEXT[],            -- document_ids or paths from the 131-file corpus
  included_scenarios   TEXT[],            -- scenario_set_ids
  included_configs     JSONB,             -- exported config snapshot
  boundary_statement   TEXT NOT NULL,     -- explicit statement of what this kit does NOT confer
  approved_by          TEXT DEFAULT 'Keith',
  approved_at          TIMESTAMPTZ,
  status               TEXT DEFAULT 'candidate',  -- "candidate" | "approved" | "shipped" | "withdrawn"
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. API Routes — New Endpoints

All routes require `isAdmin: true` via existing auth middleware (`api/lib/auth.ts`).

### 5.1 Workbook Sync

| Method | Path | Action |
|--------|------|--------|
| `GET`  | `/api/workbook/items` | List workbook items with optional `?sheet=Roadmap&status=In+Progress` filters |
| `POST` | `/api/workbook/items` | Upsert one or many items (bulk import from xlsx export) |
| `PATCH`| `/api/workbook/items/:id` | Update a single item (inline dashboard edit) |
| `GET`  | `/api/workbook/sync-runs` | List recent sync audit records |

### 5.2 Experiments

| Method | Path | Action |
|--------|------|--------|
| `GET`  | `/api/trainer/experiments` | List all experiments with status summary |
| `POST` | `/api/trainer/experiments` | Create new experiment record |
| `GET`  | `/api/trainer/experiments/:id` | Get full experiment detail + sources + reviews + flags |
| `PATCH`| `/api/trainer/experiments/:id` | Update experiment fields |
| `POST` | `/api/trainer/experiments/:id/sources` | Attach a source to an experiment |
| `POST` | `/api/trainer/experiments/:id/review` | Submit a review decision |
| `POST` | `/api/trainer/experiments/:id/flag` | Set a policy flag |
| `PATCH`| `/api/trainer/experiments/:id/flag/:flagId` | Resolve a flag |

### 5.3 Packaging Gate

| Method | Path | Action |
|--------|------|--------|
| `GET`  | `/api/trainer/packaging-candidates` | List candidates |
| `POST` | `/api/trainer/packaging-candidates` | Nominate experiment for packaging (requires `packaging_eligible: true` on experiment + zero unresolved blocking flags) |
| `PATCH`| `/api/trainer/packaging-candidates/:id` | Approve / withdraw |

**Guard rule:** `POST /api/trainer/packaging-candidates` must validate:
1. `experiment.class === 'approved_training_kit'`
2. `experiment.packaging_eligible === true`
3. Zero unresolved `trainer_policy_flags` with `severity: 'blocking'`
4. At least one `trainer_review_decisions` row with `decision: 'approve' OR 'promote_kit'`

If any condition fails, return `409` with a structured error listing which gates are unmet.

---

## 6. Admin Dashboard — New Panels

These panels are added to `DashboardPage.tsx` and `AgentTrainerPage.tsx`, gated behind `isAdmin && founderControlActive`.

### 6.1 Workbook Sync Panel

**Location:** New tab `Workbook` in `DashboardPage.tsx`

**Features:**
- Sheet selector (Roadmap / Products vs Proof / Claim Ledger / Evidence Index / Status Dashboard)
- Table view of `ops_workbook_items` for selected sheet with inline edit
- Status badges using existing `StatusStyles` pattern
- "Sync from file" button → triggers `POST /api/workbook/items` with parsed xlsx payload
- Last sync timestamp from `ops_workbook_sync_runs`
- Filter by `status`, `priority`, `phase`

### 6.2 Experiment Registry Panel

**Location:** New section in `AgentTrainerPage.tsx` above the existing run submission form

**Features:**
- "New Experiment" form (slug, title, purpose, domain, embodiment, goal, target behaviors, anti-goals, study focus)
- Experiment list with class badge (`operational_profile` / `approved_training_kit` / `rejected`)
- Expand row → shows attached sources, review history, policy flags
- "Start Training Run from Experiment" → pre-fills the existing run submission form with experiment fields
- Policy flag indicators (color-coded by severity: `advisory` = amber, `blocking` = red)

### 6.3 Review Queue Panel

**Location:** Existing `awaitingreview` run status surface in `AgentTrainerPage.tsx` — extend with experiment context

**Features:**
- Review decision form: coherence score, safety score, emotional posture score, over-ID risk selector, free-text notes, decision buttons (Approve / Reject / Hold / Promote to Kit)
- Blocking flags must be resolved before Approve or Promote to Kit decisions are accepted
- Review history timeline per experiment

### 6.4 Packaging Gate Panel

**Location:** New tab `Packaging` in `DashboardPage.tsx`, visible only when `founderControlActive`

**Features:**
- List of `trainer_packaging_candidates` with status
- "Nominate for Packaging" form — only shows experiments with `class: 'approved_training_kit'` and zero unresolved blocking flags
- `boundary_statement` field is **required** and non-dismissable
- Approved packages show included file count, scenario count, and boundary statement prominently
- No auto-generate path. Every candidate is founder-initiated.

---

## 7. Experiment Lifecycle

The following states are enforced by the API and surfaced in the dashboard:

```
[created] → [study_sources_attached] → [run_submitted] → [run_completed]
         → [awaiting_review] → [approved | rejected | hold]
         → (if approved) [eligible_for_packaging]
         → (if nominated) [packaging_candidate]
         → [kit_approved | withdrawn]
```

**No experiment can skip the `awaiting_review` state.**  
**No experiment can become a `packaging_candidate` without a `promote_kit` decision.**  
**No `packaging_candidate` can be `kit_approved` with unresolved blocking policy flags.**

---

## 8. Packaging Doctrine (Non-Negotiable)

This doctrine is encoded in the API guard logic (Section 5.3) and must be reflected in onboarding copy, README updates, and any future commercial materials.

### Three Asset Classes

| Class | Definition | External sale? |
|-------|-----------|----------------|
| **Operational profile** | Internal experiment, draft profile, embodiment, or config under founder/admin review. Lives only in `trainer_experiments` with `class: 'operational_profile'`. | **No.** |
| **Approved training kit** | Curated source files, scenarios, configs, and eval expectations that passed internal review. Packaged as a reproducible setup bundle — not a specific deployed agent. Lives in `trainer_packaging_candidates` with `status: 'kit_approved'`. | **Yes, with boundary statement.** |
| **Live intelligence instance** | A specific deployed agent with accumulated context, behavioral history, and identity drift risk. | **No, never as a collectible or transferable object.** |

### Required Boundary Statement

Every `trainer_packaging_candidates` row must include a `boundary_statement` that explicitly states what the kit **does not** confer. Example:

> "This kit provides training configuration, scenario sets, and source library files for cultivating an operator-style agent. It does not transfer a specific agent identity, accumulated session context, behavioral drift history, or any persistent digital being. The resulting agent is the buyer's responsibility to configure, review, and govern."

### Five Packaging Gate Checks

Before any kit nomination is accepted (enforced in API):

1. **Purpose check** — `experiment.purpose` must be a concrete operational function, not a persona description.
2. **Boundary check** — `anti_goals` must include at least one explicit behavioral boundary. Empty `anti_goals` blocks nomination.
3. **Evaluation check** — at least one completed training run must exist with `eval_results` above `quality_threshold`.
4. **Governance check** — a `trainer_review_decisions` row with `decision: 'promote_kit'` must exist, with reviewer, timestamp, and notes.
5. **Packaging check** — zero unresolved `trainer_policy_flags` with `flag: 'charisma-artifact'` or `severity: 'blocking'`.

---

## 9. Workbook → Supabase Sync Strategy

### 9.1 One-way sync (initial)

- Export target sheets from `Operational_Bible_Workbook.xlsx` as CSV.
- Parse and normalize into `ops_workbook_items` rows via `POST /api/workbook/items`.
- Each row gets a stable `row_key` derived from `sheet_name + label` (slugified).
- Subsequent syncs use `UPSERT` on `(sheet_name, row_key)`.

### 9.2 Sheet mapping

| Workbook Sheet | `sheet_name` value | Key fields mapped |
|---------------|-------------------|-------------------|
| Roadmap | `Roadmap` | label, priority, phase, status, target_start, target_end, notes, link_ref |
| Products vs Proof | `Products_vs_Proof` | label, category, status, notes, link_ref, meta.evidence_location |
| Claim Ledger | `Claim_Ledger` | label, category, status, notes, link_ref |
| Evidence Index | `Evidence_Index` | label, category, link_ref, meta.evidence_type |
| Status Dashboard | `Status_Dashboard` | label, category, meta.metric_value, meta.metric_unit, notes |

### 9.3 Round-trip editing

Dashboard edits (`PATCH /api/workbook/items/:id`) update Supabase immediately.  
A separate "Export to XLSX" action regenerates the spreadsheet from Supabase state.  
The xlsx is the **editorial planning artifact**. Supabase is the **runtime source of truth** after initial sync.

---

## 10. Agent Trainer Product Boundary — Freeze Rule

**The 131 files currently in `documents` tagged `agent-trainer-package` are the commercial product boundary until a formal kit nomination is approved through the packaging gate.**

Any new files, profiles, or configurations:
- Begin life as `trainer_experiments` with `class: 'operational_profile'`
- Are stored in `trainer_experiment_sources`, not in the main `documents` corpus as `package_builder_source: true`
- Can be promoted to `class: 'approved_training_kit'` only after a complete review cycle
- Can enter the product boundary (added to the 131-file corpus or a new package) only after a `packaging_candidate` reaches `status: 'kit_approved'`

**This freeze rule is the technical expression of the founding ethical position: GestaltView does not ship digital intelligences. It ships the discipline to cultivate them.**

---

## 11. File & Route Inventory

### New files to create

```
api/
  workbook/
    items.ts              ← GET, POST (list + upsert workbook items)
    items/[id].ts         ← PATCH (single item edit)
    sync-runs.ts          ← GET (audit log)
  trainer/
    experiments.ts        ← GET, POST (list + create experiments)
    experiments/[id].ts   ← GET, PATCH (detail + update)
    experiments/[id]/
      sources.ts          ← POST (attach source)
      review.ts           ← POST (submit review decision)
      flag.ts             ← POST (set policy flag)
      flag/[flagId].ts    ← PATCH (resolve flag)
    packaging-candidates.ts    ← GET, POST (list + nominate)
    packaging-candidates/[id].ts ← PATCH (approve/withdraw)

server/
  workbook/
    workbook-repository.ts    ← Supabase CRUD for ops_workbook_items
  trainer/
    experiment-repository.ts  ← Supabase CRUD for trainer_experiments + related tables

client/src/
  features/
    workbook/
      WorkbookSyncPanel.tsx
      WorkbookTable.tsx
    agent-trainer/
      ExperimentRegistry.tsx
      ExperimentForm.tsx
      ReviewQueuePanel.tsx
      PackagingGatePanel.tsx
      PolicyFlagBadge.tsx

supabase/
  migrations/
    20260410_xxx_workbook_and_experiment_governance.sql   ← all 7 new tables
```

### Existing files to modify

```
client/src/pages/DashboardPage.tsx
  → Add "Workbook" tab
  → Add "Packaging" tab (founderControlActive gated)

client/src/features/agent-trainer/AgentTrainerPage.tsx
  → Add ExperimentRegistry section above run submission
  → Extend review flow with policy flag resolution requirement

shared/agent-trainer/schemas.ts
  → Add Experiment, ReviewDecision, PolicyFlag, PackagingCandidate Zod schemas

docs/CurrentState.md
  → Document this pass after implementation

docs/gestaltview-v2.manifest.json + .md
  → Regenerate after all new routes + files land
```

---

## 12. Validation Checklist

Per the Operator Manual's validation matrix, this SPEC touches:

- [ ] **Supabase schema** — inspect migration, verify RLS blocks non-admin writes
- [ ] **API routes** — `pnpm exec vitest run --config vitest.api.config.ts` covering new endpoints
- [ ] **Client runtime** — `npm run build` with no TypeScript errors
- [ ] **Packaging gate guards** — unit tests for all five packaging checks (including rejection cases)
- [ ] **Workbook sync** — test upsert idempotency on `(sheet_name, row_key)`
- [ ] **Freeze rule** — confirm no path exists to set `package_builder_source: true` outside the packaging candidate approval flow
- [ ] **Docs** — `docs/CurrentState.md` updated, manifest regenerated
- [ ] **Dashboard** — WorkbookSyncPanel, ExperimentRegistry, ReviewQueuePanel, PackagingGatePanel all render correctly under `isAdmin && founderControlActive`

---

## 13. Out of Scope (This SPEC)

- Automated sync from GitHub Actions (workbook changes trigger Supabase upsert) — future SPEC
- Public-facing packaging UI for external buyers — future SPEC after first kit is `kit_approved`
- Multi-reviewer workflow — Keith is sole reviewer for all experiment decisions at this stage
- Vector embedding of `ops_workbook_items` for retrieval — future SPEC
- Promotion backfill of existing 131 `documents` rows into `knowledge_assets` — separate backfill plan pending approval policy definition

---

## 14. Open Questions for Codex Session

1. Should `trainer_experiments` use the existing `agent_trainer.agents` Supabase table as a base, or remain fully separate to preserve the product/experiment distinction cleanly?
2. What is the preferred pattern for the xlsx round-trip — export-on-demand from Supabase, or maintain both sources and reconcile diffs?
3. For the dashboard Packaging tab, should `boundary_statement` be a free-text field or a structured template with required sections (what it does / what it does NOT do / reviewer sign-off)?
4. Should policy flags auto-block run submission (not just packaging), or only block packaging decisions?
5. Is there a `gestaltview-v2` branch strategy for this work, or does it land on `main` behind a feature flag?

---

*This document is the authoritative SPEC for the Workbook Integration + Agent Trainer Governance Layer. When this document conflicts with older prose, live code wins. When live code conflicts with this SPEC during implementation, flag for founder review before overriding.*
