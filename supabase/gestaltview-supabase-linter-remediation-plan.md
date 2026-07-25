# GestaltView — Supabase Linter Remediation Plan
*Generated from 4 linter export files — June 2026*

---

## Triage Summary

| Severity | Category | Count | Pre-Raise Priority |
|---|---|---|---|
| ERROR | `security_definer_view` | 8 views | 🔴 Fix now |
| ERROR | `rls_disabled_in_public` | 10 tables | 🔴 Fix now |
| WARN | `auth_rls_initplan` | ~90 policies | 🟡 Fix before raise |
| WARN | `multiple_permissive_policies` | ~20 policy pairs | 🟡 Fix before raise |
| WARN | `duplicate_index` | 6 pairs | 🟡 Low-risk cleanup |
| INFO | `rls_enabled_no_policy` | 11 tables | 🔵 Review intent |
| INFO | `unindexed_foreign_keys` | ~60 FKs | 🔵 Post-raise |
| INFO | `unused_index` | ~10 indexes | 🔵 Post-raise |

**Bottom line:** The two ERROR categories are what a technical diligence reviewer would flag immediately — exposed tables and security-definer views that bypass RLS. The WARNs are real performance debt but not investor-facing security concerns. Everything else is cleanup.

---

## PRIORITY 1 — Security Errors (Fix Before Any External Access)

### 1a. `rls_disabled_in_public` — 10 tables with no RLS

These tables are exposed to PostgREST with zero row-level security. Any authenticated user can query them directly.

**Deprecated tables** — simplest fix is enable RLS with no policies (implicit deny-all). These tables are dead weight; consider dropping them entirely after enabling RLS.

```sql
-- MIGRATION: 001_fix_rls_disabled_deprecated.sql
-- Deprecated tables: enable RLS → implicit deny-all (no policy = no access)
ALTER TABLE public._deprecated_artifacts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._deprecated_build_jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._deprecated_order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._deprecated_buyers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._deprecated_package_drafts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._deprecated_support_requests  ENABLE ROW LEVEL SECURITY;

-- migration_user_map: admin-only, enable RLS, no policy = service_role only
ALTER TABLE public.migration_user_map ENABLE ROW LEVEL SECURITY;
```

**Active model_home tables** — these need RLS enabled plus actual policies. The consent table in particular (`model_home_consent_grants`) holding no RLS is the most sensitive item in this entire report.

```sql
-- MIGRATION: 002_fix_rls_disabled_model_home.sql
-- Enable RLS on all model_home tables
ALTER TABLE public.model_home_capabilities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_home_assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_home_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_home_evaluations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_home_consent_grants  ENABLE ROW LEVEL SECURITY;

-- ⚠️ POLICY TEMPLATE — adjust user_id / foreign key column name to match your schema
-- These are stubs; replace `user_id` with the actual FK column.

CREATE POLICY "Users read own model_home_capabilities"
  ON public.model_home_capabilities FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users read own model_home_assignments"
  ON public.model_home_assignments FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users manage own model_home_events"
  ON public.model_home_events FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users read own model_home_evaluations"
  ON public.model_home_evaluations FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- CONSENT: read-only for the user; only service_role can insert/update
CREATE POLICY "Users read own consent grants"
  ON public.model_home_consent_grants FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
```

---

### 1b. `security_definer_view` — 8 views bypassing RLS

These views run with the permissions of the view creator, not the querying user. That means RLS on underlying tables is bypassed when users query through them.

**Views flagged:**
- `knowledge_stats`
- `skill_stats`
- `active_agent_manifests`
- `manifest_file_pull`
- `approved_library_assets_by_agent`
- `pending_embodiment_mutations`
- `trainer_memory_surfaces`
- `trainer_queue_health_v`

**Two options depending on intent:**

**Option A — Views are genuinely admin-only** (accessed only via service_role in your backend)  
Revoke SELECT from anon/authenticated roles. SECURITY DEFINER is then harmless because regular users can't query the view at all.

```sql
-- MIGRATION: 003_revoke_security_definer_views.sql
-- Revoke direct client access; these views are backend/admin only
REVOKE SELECT ON public.knowledge_stats                   FROM anon, authenticated;
REVOKE SELECT ON public.skill_stats                       FROM anon, authenticated;
REVOKE SELECT ON public.active_agent_manifests            FROM anon, authenticated;
REVOKE SELECT ON public.manifest_file_pull                FROM anon, authenticated;
REVOKE SELECT ON public.approved_library_assets_by_agent  FROM anon, authenticated;
REVOKE SELECT ON public.pending_embodiment_mutations      FROM anon, authenticated;
REVOKE SELECT ON public.trainer_memory_surfaces           FROM anon, authenticated;
REVOKE SELECT ON public.trainer_queue_health_v            FROM anon, authenticated;
```

**Option B — Views are user-facing** (authenticated users query them directly)  
Switch to security_invoker so the view respects the underlying table's RLS policies. **⚠️ Test after applying — if the view aggregates rows from multiple users it will break for non-admin callers.**

```sql
-- MIGRATION: 003_alt_security_invoker_views.sql
-- Postgres 15+ syntax (Supabase is PG15+)
ALTER VIEW public.knowledge_stats                  SET (security_invoker = on);
ALTER VIEW public.skill_stats                      SET (security_invoker = on);
ALTER VIEW public.active_agent_manifests           SET (security_invoker = on);
ALTER VIEW public.manifest_file_pull               SET (security_invoker = on);
ALTER VIEW public.approved_library_assets_by_agent SET (security_invoker = on);
ALTER VIEW public.pending_embodiment_mutations     SET (security_invoker = on);
ALTER VIEW public.trainer_memory_surfaces          SET (security_invoker = on);
ALTER VIEW public.trainer_queue_health_v           SET (security_invoker = on);
```

**Recommendation:** Use Option A for `active_agent_manifests`, `manifest_file_pull`, `pending_embodiment_mutations`, `trainer_memory_surfaces`, `trainer_queue_health_v` — these are clearly admin/internal views. Use Option B for `knowledge_stats` and `skill_stats` if users are meant to see aggregate stats about their own data.

---

## PRIORITY 2 — Performance Warnings (Before Raise)

### 2a. `auth_rls_initplan` — ~90 policies calling `auth.uid()` per-row

Every RLS policy that calls `auth.uid()` directly causes Postgres to re-evaluate it for every row scanned. Wrapping it in `(select auth.uid())` turns it into an init plan (evaluated once). At current user count this is negligible; at the scale GestaltView is heading toward, it adds up.

**The fix is mechanical — one pattern applied everywhere:**

```sql
-- PATTERN: Replace auth.uid() with (select auth.uid()) in policy expressions
-- Find → Replace in every USING() and WITH CHECK() clause

-- DIAGNOSTIC: Run this to see all affected policies with their current definitions
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual       LIKE '%auth.uid()%'
    OR with_check LIKE '%auth.uid()%'
  )
ORDER BY tablename, policyname;
```

**Known affected tables** (from linter output):
`app_users`, `billy_sessions`, `bucket_drops`, `consciousness_profiles`, `inner_world_artifacts`, `journals`, `scrapbook_items`, `blueprints`, `insights`, `user_preferences`, `di_sessions`, `di_memory_events`, `capture_events`, + ~75 more policies

**Fix pattern for each policy** (replace column name as appropriate):

```sql
-- EXAMPLE: app_users "Users can read own row"
-- Step 1: Drop old policy
DROP POLICY "Users can read own row" ON public.app_users;
-- Step 2: Recreate with select-wrapped auth call
CREATE POLICY "Users can read own row" ON public.app_users
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

-- EXAMPLE: billy_sessions "Users can read own sessions"
DROP POLICY "Users can read own sessions" ON public.billy_sessions;
CREATE POLICY "Users can read own sessions" ON public.billy_sessions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);
```

**Recommended approach:** Run the diagnostic query above to get current `qual` and `with_check` expressions, then do a bulk find-replace of `auth.uid()` → `(select auth.uid())` before regenerating each policy. This is tedious but mechanical. Could write a migration generator script if needed.

---

### 2b. `multiple_permissive_policies` — Duplicate SELECT policies on same table/role

These tables have 2–3 overlapping permissive SELECT policies for `authenticated`. Postgres evaluates all of them per query — an OR chain of policy checks where one would do.

**Affected tables and conflicting policy pairs:**

| Table | Conflicting Policies |
|---|---|
| `profile_pipeline_run_links` | "Users read linked objects for their runs", "Users read own profile_pipeline_run_links" |
| `profile_pipeline_runs` | "Users manage own profile_pipeline_runs", "Users read their own profile_pipeline_runs" |
| `scaffold_nodes` | "Users manage own scaffold_nodes", "Users manage their own scaffold_nodes" (×4 actions) |
| `scenario_sets` | "authenticated read scenario_sets", `ss_select_auth` |
| `scenarios` | "authenticated read scenarios", `sc_select_auth` |
| `skill_fragments` | 3 SELECT policies (one is likely a duplicate from a migration) |
| `skills` | 3 SELECT policies |
| `summaries` | 3 SELECT policies ("Public read summaries", "authenticated read summaries", `sum_select_auth`) |

**Fix:** Consolidate to one policy per table/role/action. For each table, keep the most permissive/correct policy and drop the others.

```sql
-- MIGRATION: 004_deduplicate_policies.sql

-- scaffold_nodes: clearly the same policy created twice under slightly different names
DROP POLICY "Users manage their own scaffold_nodes" ON public.scaffold_nodes;
-- Keeps: "Users manage own scaffold_nodes"

-- summaries: likely accumulated across migrations — keep the most recent
DROP POLICY "Public read summaries"         ON public.summaries;
DROP POLICY "authenticated read summaries"  ON public.summaries;
-- Keeps: sum_select_auth (verify this is the correct/current one)

-- skill_fragments
DROP POLICY "Authenticated read skill fragments"  ON public.skill_fragments;
DROP POLICY "authenticated read skill_fragments"  ON public.skill_fragments;
-- Keeps: sf_select_auth

-- skills
DROP POLICY "Authenticated read skills"    ON public.skills;
DROP POLICY "authenticated read skills"    ON public.skills;
-- Keeps: skills_select_auth

-- ⚠️ Verify the "Keeps" policy before dropping — run pg_policies diagnostic first
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('scaffold_nodes','summaries','skill_fragments','skills','scenarios','scenario_sets');
```

---

### 2c. `duplicate_index` — 6 pairs of identical indexes

Wasted write overhead and storage. Safe to drop one from each pair.

```sql
-- MIGRATION: 005_drop_duplicate_indexes.sql
-- In each pair, the idx_ prefixed or more descriptive name is kept

DROP INDEX CONCURRENTLY IF EXISTS public.loom_annotations_type_idx;
-- Keeps: idx_loom_annotations_type

DROP INDEX CONCURRENTLY IF EXISTS public.memory_entries_embedding_idx;
-- Keeps: idx_memory_entries_embedding

DROP INDEX CONCURRENTLY IF EXISTS public.order_notes_order_idx;
-- Keeps: order_notes_order_id_idx (more specific name)

DROP INDEX CONCURRENTLY IF EXISTS public.provenance_subject_idx;
-- Keeps: provenance_envelopes_subject_idx (table-qualified name)

DROP INDEX CONCURRENTLY IF EXISTS public.session_rate_limits_window_start_idx;
-- Keeps: idx_session_rate_limits_window

DROP INDEX CONCURRENTLY IF EXISTS public.uploads_order_idx;
-- Keeps: uploads_order_id_idx (more specific name)
```

> Use `CONCURRENTLY` to avoid locking tables. Can run against live database.

---

## PRIORITY 3 — Info-Level Items (Review Intent, Post-Raise OK)

### 3a. `rls_enabled_no_policy` — 11 tables locked out entirely

RLS is ON but no policies exist. For a non-service_role caller, these tables return zero rows on SELECT and reject all writes — silently. If your API uses service_role everywhere, this is fine. If any client uses the anon/authenticated key to hit these tables, they'll get unexpected empty results.

**Intentionally locked (admin-only via service_role — no action needed):**
- `corpus_harvest_events`
- `embodiment_modules`
- `embodiment_training_runs`
- `profile_ingestion_sources`
- `signup_allowlist`
- `user_profile_ingestion_runs`

**Needs review — may be silently broken for users:**

| Table | Likely Issue |
|---|---|
| `embodiment_profiles` | Users may need to read their own embodiment profile |
| `user_personality_dimensions` | Users likely need read access |
| `model_homes` | User-facing feature — probably needs policies |
| `collaborator_roles` | Depends on whether collaboration is wired |
| `kv_store_441770b7` | Unknown access pattern |

```sql
-- MIGRATION: 006_rls_no_policy_user_tables.sql
-- Add read policies for tables that users legitimately need to access

-- embodiment_profiles: users read their own
CREATE POLICY "Users read own embodiment profile"
  ON public.embodiment_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- user_personality_dimensions: users read their own
CREATE POLICY "Users read own personality dimensions"
  ON public.user_personality_dimensions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- model_homes: adjust based on your data model
CREATE POLICY "Users read own model home"
  ON public.model_homes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
```

---

### 3b. `unused_index` — Dead indexes on deprecated tables

All flagged unused indexes are on deprecated or low-traffic tables (`_deprecated_support_requests`, `_deprecated_package_drafts`, `trainer_jobs`, `trainer_workers`, `trainer_job_events`, `masterclass_progress`). Safe to drop after the deprecated tables are locked down via RLS.

```sql
-- MIGRATION: 007_drop_unused_indexes.sql
-- All on deprecated tables — safe to drop
DROP INDEX CONCURRENTLY IF EXISTS idx_support_requests_package_draft_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_package_drafts_buyer_email;

-- trainer_* indexes: unused but still active tables — verify before dropping
-- Only drop if trainer jobs are not actively queued by status/lease
DROP INDEX CONCURRENTLY IF EXISTS trainer_jobs_status_retry_created_idx;
DROP INDEX CONCURRENTLY IF EXISTS trainer_jobs_run_idx;
DROP INDEX CONCURRENTLY IF EXISTS trainer_jobs_lease_expires_idx;
DROP INDEX CONCURRENTLY IF EXISTS trainer_workers_status_heartbeat_idx;
DROP INDEX CONCURRENTLY IF EXISTS trainer_job_events_run_created_idx;
DROP INDEX CONCURRENTLY IF EXISTS trainer_job_events_job_created_idx;

-- masterclass_progress: unused — drop unless masterclass feature is active
DROP INDEX CONCURRENTLY IF EXISTS idx_masterclass_progress_user_slug;
DROP INDEX CONCURRENTLY IF EXISTS idx_masterclass_progress_last_session;
```

---

### 3c. `unindexed_foreign_keys` — ~60 FKs without covering indexes

This is the largest INFO category and the lowest urgency. Supabase flags any FK that lacks an index on the referencing column — which would be hit on `JOIN` and `DELETE CASCADE` operations. Most of the flagged tables are on deprecated or low-traffic tables.

**Deferred action:** After the deprecated tables are cleaned up, run the Supabase linter again — much of this list will shrink. The remaining FK indexes on live tables can be added incrementally using `CREATE INDEX CONCURRENTLY` (zero downtime).

---

## Execution Order

```
1. migration_001 — rls_disabled_deprecated       (5 min, no risk)
2. migration_002 — rls_disabled_model_home        (10 min, test after)
3. migration_003 — security_definer_views         (revoke OR invoker — choose per view)
4. migration_004 — deduplicate_policies           (run pg_policies diagnostic first)
5. migration_005 — drop_duplicate_indexes         (CONCURRENTLY, any time)
6. migration_006 — rls_no_policy_user_tables      (10 min, test after)
7. migration_007 — drop_unused_indexes            (CONCURRENTLY, low priority)
8. auth_rls_initplan bulk fix                     (bulk generation pass, then apply)
```

---

## Before Running Any Migration

```sql
-- Verify current state of a specific table
SELECT tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'model_home_consent_grants';

-- Verify current policies on a table
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'model_home_consent_grants';

-- Verify view security mode
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'knowledge_stats';
```

---

*All SQL uses `IF EXISTS` guards where applicable. Run in Supabase SQL Editor or via migration file. Test on a branch before applying to production.*
