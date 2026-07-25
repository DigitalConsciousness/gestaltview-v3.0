# GestaltView Runtime Schema Alignment Specification

This document summarizes a **schema audit** performed on the GestaltView Supabase schema (v3.0) and outlines the steps necessary to align the live runtime with the canonical data model.  The audit classified each table into one of five categories—**Active**, **Thin**, **Schema‑Only**, **Dark**, or **Deprecated**—based on how heavily the current codebase references it and whether it is a required foreign‑key target.  These recommendations respect the canonical design intent of the GestaltView schema, which is to model human continuity, digital‐intelligence identity, evidence & mutation, training & governance, and commerce & delivery【turn68file0†L19-L87】.

## 1 Overview of the Unified Schema

The GestaltView unified schema categorizes tables into five conceptual domains: **Human Continuity**, **Digital Intelligence**, **Evidence and Mutation**, **Training and Governance**, and **Commerce and Delivery**【turn68file0†L19-L87】.  The design intent is to persist a human user’s continuity, capture each digital intelligence’s identity, treat memories and context as first‑class artifacts, and provide a replayable context injection mechanism【turn68file0†L104-L112】.

### **Please use `supabase/supabase-db-dump-2026-06-21T06-21-21-963Z.sql` as the most up to date and comprehensive state of the GestaltView schema**

*FOUNDER RECOMMENDATION*:
 >Utilize the superpowers skill to create and end to end plan of aligning the runtime with the Supabase DB Schema

During the audit we extracted the Supabase schema and computed the number of source‑code references for each table.  Tables that are regularly read or written were flagged as **Active**; those with only minimal usage were marked **Thin**; tables referenced only by foreign keys but not yet touched by the runtime were labelled **Schema‑Only**; tables with no code references or foreign‑key dependencies are considered **Dark**; and tables prefixed with `_deprecated_` are **Deprecated** and safe to drop.

### 1.1 Summary Statistics

| Status        | Description                                                    | Count | Percentage |
|---------------|----------------------------------------------------------------|------:|-----------:|
| **Active**    | Tables used heavily by the runtime (≥ 3 code references)       | 16    | 18%       |
| **Thin**      | Lightly used (≤ 2 references)                                  | 8     | 9%        |
| **Schema‑Only** | Referenced only via foreign keys, not yet used in code      | 21    | 24%       |
| **Dark**      | Defined in the schema but untouched by code or foreign keys     | 36    | 41%       |
| **Deprecated**| Legacy tables prefixed with `_deprecated_`; drop when possible | 7     | 8%        |

## 2 Active Tables

These tables form the backbone of the current runtime and should be preserved.  They correspond to user management (`users`, `app_users`), agent identity (`agents`, `agent_memories`, `agent_memory_records`), knowledge storage (`documents`, `embeddings`, `knowledge_fragments`, `processing_runs`), session mechanics (`memory_entries`, `bucket_drops`, `billy_sessions`, `musical_dna_analyses`), and skill management (`skills`, `skill_fragments`).  The canonical relationships in the unified schema—such as `agents.owner_user_id → auth.users.id` or `memory_entries.user_id → app_users.id`【turn68file0†L90-L97】—must remain intact.

### Recommendations

1. **Document and test all active table interfaces.** Ensure that each table has clearly defined CRUD endpoints in the API layer.  Add unit tests if absent.
2. **Enforce referential integrity.** Confirm that all foreign keys linking active tables remain enforced and cascade appropriately.  For example, deleting an `agents` row should cascade to its dependent `agent_versions` and `agent_memories`.
3. **Index frequently queried columns.** Consider adding indexes on `memory_entries.user_id`, `documents.owner_user_id` and other high‑traffic columns to maintain performance.

## 3 Thin Tables

Thin tables are referenced in a handful of places but lack comprehensive coverage.  They include entities such as `agent_autobiographies`, `agent_constitutions`, `approvals`, `scenarios`, `training_runs`, `concepts`, `summaries` and `tribunal_sessions`.  Many of these tables live in the **Agent Trainer** or **Agent Personhood** domains【turn68file0†L35-L48】【turn68file0†L64-L76】.

### Recommendations

1. **Audit existing use‑cases.** Verify that the limited usage aligns with the intended design.  For instance, `agent_constitutions` should record the guiding principles for each digital intelligence.
2. **Determine whether to expand or deprecate.** If a thin table is essential for future features (e.g., `tribunal_sessions` for governance), plan to build the missing queries and UI components.  Otherwise, consider merging its responsibilities into an existing active table or marking it as deprecated.

## 4 Schema‑Only Tables

These tables appear in the schema primarily as foreign‑key targets but are not yet used by runtime code.  Examples include `agent_manifests`, `agent_relationship_edges`, `knowledge_assets`, `knowledge_interpretations`, `agent_versions`, `scenario_sets`, `trainer_experiments`, `collaborative_spaces`, `gate_orders` and `app_users` (which currently acts only as a compatibility shim)【turn68file0†L35-L48】【turn68file0†L64-L76】.  Their presence indicates planned features (knowledge curation, training experiments, commerce flows) that have not been implemented in the current code.

### Recommendations

1. **Review design intent.** Consult the unified schema design to confirm the purpose of each schema‑only table.  For instance, `knowledge_interpretations` and `knowledge_assets` correspond to evidence and mutation flows【turn68file0†L50-L61】.
2. **Prioritize implementation.** Determine which of these tables support near‑term product goals.  For those, create migration scripts, API routes and front‑end components to bring them online.
3. **Stabilize or remove unused FKs.** For tables with no immediate plans, freeze the schema and document them as reserved.  Remove unused foreign keys to reduce maintenance overhead if necessary.

## 5 Dark Tables

Dark tables are defined but unused—there are no code references and no foreign‑key relationships.  They encompass a variety of **Agent Personhood** attributes (`agent_preference_nodes`, `agent_private_interiors`, `agent_governance_policies`, etc.), unused **Training** metadata (`trainer_jobs`, `trainer_packaging_candidates`), and unused **Commerce** artefacts (`gate_artifacts`, `gate_support_requests`) among others.

### Recommendations

1. **Archive dark tables.** Move dark tables into a separate schema (e.g., `archive`) or snapshot them for potential reactivation.  This reduces clutter in the main schema while preserving historical design.
2. **Remove from migrations.** Exclude dark tables from future migrations and local development deployments.  They can be reintroduced via feature branches if a use‑case emerges.
3. **Communicate with stakeholders.** Inform product owners and engineers that these tables are dormant.  If any feature depends on them, raise a flag before removal.

## 6 Deprecated Tables

Tables prefixed with `_deprecated_` represent legacy commerce workflows and should be removed.  According to the unified schema, the **Commerce & Delivery** domain now uses the `gate_` tables for buyers, orders, drafts and artefacts【turn68file0†L78-L86】.

### Recommendations

1. **Drop from database.** Remove deprecated tables from Supabase and ensure that no code references remain.
2. **Purge stale data.** Before dropping, export data if needed for compliance or archival reasons.
3. **Clean up references.** Remove or migrate any triggers, functions or views that reference deprecated tables.

## 7 Implementation Plan

To align the runtime schema with the unified design and audit results, follow this phased plan:

1. **Documentation & Governance**
   - Publish this audit in the repository under `docs/` and link it from the [GestaltView Unified Schema](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/main/schema/framework/GestaltView%20Unified%20Schema.md) page.
   - Adopt an operational rule: if the live schema and an older document disagree, the live schema wins【turn68file0†L100-L101】.

2. **Refactoring & Cleanup**
   - Identify and remove all deprecated tables from the Supabase instance.
   - Create a migration that moves dark tables into an `archive` schema and updates the codebase to ignore them.
   - For each schema‑only table, decide whether to implement associated functionality or remove the foreign key.

3. **Feature Development**
   - Prioritize development on thin tables that align with near‑term product goals (e.g., `agent_constitutions`, `tribunal_sessions`).
   - Implement missing CRUD APIs and front‑end components for schema‑only tables deemed essential.

4. **Testing & Validation**
   - Write integration tests to verify referential integrity and correct behaviour of all active tables.
   - Add regression tests to ensure removed tables do not break existing features.

## 8 Deliverables

The accompanying `schema_alignment_report.csv` lists every table with its domain, column count, foreign‑key reference count, number of source‑code references, and classification (Active, Thin, Schema‑Only, Dark, or Deprecated).  This CSV can be used to generate visualizations or to plan migration scripts.

By following this specification, the GestaltView runtime will be aligned with its schema design, unused clutter will be removed, and future development can proceed on a solid, well‑documented foundation.