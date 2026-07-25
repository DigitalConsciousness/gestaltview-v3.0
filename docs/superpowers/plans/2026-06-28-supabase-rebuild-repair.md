# Supabase Rebuild Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the rebuilt Supabase project with GestaltView's live contracts, harden and deploy the repo-local Edge Functions, and restore trustworthy migration provenance without replaying unsafe historical SQL.

**Architecture:** Preserve the rebuilt project first, then use additive compatibility SQL to bridge legacy table shapes instead of dropping data. Repair application and Edge Function contracts under regression tests, baseline only already-represented historical migrations, apply the two genuinely new migrations, and finish with catalog, advisor, invocation, and runtime verification.

**Tech Stack:** PostgreSQL 17, Supabase CLI/MCP, Deno Edge Functions, TypeScript, Vitest, React/Vercel API runtime.

---

### Task 1: Preserve the pre-repair state

**Files:**
- Create: `artifacts/supabase-db-dump-2026-06-28-*.zip`
- Create: `docs/supabase-rebuild-pre-repair-audit-2026-06-28.md`

- [ ] Run `npm run supabase:dump:zip -- --schema public,storage,auth` with the configured remote database URL.
- [ ] Record the live project reference, Postgres version, migration count, table count, bucket inventory, missing contract objects, and advisor totals without recording credentials.
- [ ] Verify the archive exists, is non-empty, and contains a SQL dump.

### Task 2: Establish failing repair contracts

**Files:**
- Create: `api/__tests__/supabase-rebuild-repair.test.ts`
- Modify: `api/_lib/auth.ts`
- Modify: `supabase/config.toml`
- Modify: `supabase/functions/**/index.ts`

- [ ] Add a Vitest contract that requires auth enrichment to read `public.users`, active per-function JWT configuration in `supabase/config.toml`, `Deno.serve` entrypoints, protected service-role functions, and 768-dimension corpus embeddings.
- [ ] Run `./node_modules/.bin/vitest run api/__tests__/supabase-rebuild-repair.test.ts -v` and confirm failures identify the current `profiles` query, detached function config, module-style handlers, and unprotected corpus worker.
- [ ] Change auth enrichment from `.from("profiles")` to `.from("users")`.
- [ ] Merge the function configuration into `supabase/config.toml` and remove the detached fragment.
- [ ] Convert each `gsvw-*` function to `Deno.serve`, protect service-role endpoints with `GESTALTVIEW_INGEST_SECRET`, pin Supabase imports, and make the corpus worker request 768-dimensional embeddings.
- [ ] Re-run the focused test and confirm it passes.

### Task 3: Harden the ingestion migration

**Files:**
- Modify: `supabase/migrations/20260628000000_gsvw_ingestion_alignment.sql`
- Test: `api/__tests__/supabase-rebuild-repair.test.ts`

- [ ] Extend the failing contract to require idempotent trigger creation, a `security_invoker` view, explicit table grants, and restricted execution of `gsvw_mark_document_seen`.
- [ ] Run the focused test and confirm it fails on the current migration.
- [ ] Make trigger creation replay-safe, set the current-ingestion view to `security_invoker`, restrict the privileged RPC to `service_role`, and grant only the capture permissions required by authenticated users.
- [ ] Re-run the focused contract.

### Task 4: Add legacy-shape and security compatibility SQL

**Files:**
- Create via `supabase migration new`: `supabase/migrations/*_rebuild_compatibility_and_security.sql`
- Test: `api/__tests__/supabase-rebuild-repair.test.ts`

- [ ] Extend the failing contract with the required `identity_subjects`, `human_*`, corpus-harvest, view-security, and privileged-RPC repair markers.
- [ ] Run the focused test and confirm it fails because no repair migration exists.
- [ ] Add an additive migration that preserves legacy JSON columns, renames compatible legacy identifier columns, adds and backfills typed columns, creates `corpus_harvest_events` when absent, converts identified views to `security_invoker`, and revokes anonymous execution from privileged routines.
- [ ] Re-run the focused contract.

### Task 5: Validate locally

**Files:**
- Modify: `scripts/test-db-schema.sh`
- Modify: `docs/CurrentState.md`

- [ ] Update the schema validation list to include the rebuilt runtime's critical identity, ingestion, portrait, transcript, and artifact tables.
- [ ] Run the focused Vitest test, relevant auth tests, TypeScript checking, SQL formatting/static checks, and `git diff --check`.
- [ ] Review the complete diff for credentials, destructive SQL, and unrelated changes.

### Task 6: Reconcile migration history and deploy

**Files:**
- Remote: `supabase_migrations.schema_migrations`
- Remote: public schema and Edge Function registry

- [ ] Compare all pre-repair migration filenames with live objects and mark only represented historical versions as applied using `supabase migration repair`.
- [ ] Push the hardened ingestion migration and compatibility/security migration.
- [ ] Configure required function secrets and confirm secret names without displaying values.
- [ ] Deploy `gsvw-ingest-batch`, `gsvw-runtime-health`, `gsvw-capture-event`, `gsvw-dormancy-review`, and `corpus-harvest-worker` with the intended JWT modes.

### Task 7: Verify live behavior and close out

**Files:**
- Modify: `docs/CurrentState.md`
- Modify: `.perplexity/**` through the standard sync command

- [ ] Query the live catalog for all repaired tables/columns, policies, grants, view options, routine privileges, storage buckets, and migration versions.
- [ ] Invoke authenticated/custom-secret health paths safely and confirm expected authorization failures for unauthenticated calls.
- [ ] Re-run Supabase security and performance advisors and record remaining intentional findings.
- [ ] Run `npm run sync:perplexity` followed by `npm run sync:perplexity:check`.
- [ ] Record exact commands, results, remaining risks, and rollback evidence in `docs/CurrentState.md`.
