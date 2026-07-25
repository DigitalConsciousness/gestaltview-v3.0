# GestaltView Supabase Recreation Package

Generated: 2026-06-16T12:34:22+00:00

This package is built from the uploaded `supabase_schema.zip` primary source plus the older `supabase.zip` reference archive. It is meant to recreate a fresh Supabase/Postgres instance for GestaltView with the current migration spine, schema snapshots, seed scaffolds, verification queries, and deployment scripts.

## What is inside

```text
gestaltview_supabase_recreation_package/
  supabase/
    config.toml
    migrations/                 # canonical, Supabase CLI-ready migrations
    seed.sql
    functions/                  # copied edge functions, if present
  canonical_migrations/         # same canonical migrations for psql master deploy
  original_migrations/
    from_supabase_schema_zip/   # exact original latest migration files
    from_supabase_zip/          # exact older reference migration files
  schema_snapshots/             # CompleteSchema, FULL_PUBLIC_SCHEMA, generated types, etc.
  visual/                       # ERD / graph / schema visualization artifacts
  seeds/                        # founder/admin seed templates
  scripts/                      # apply/verify helpers
  db_object_inventory.csv
  db_object_inventory.md
  migration_order.csv
  migration_order.json
  master_deploy.sql
  verify_after_deploy.sql
  seed.sql
  .env.example
```

## Current package inventory

- Canonical migrations: **74**
- Parsed DB objects: **745**
  - extension: 36
  - function: 66
  - index: 288
  - policy: 108
  - table: 154
  - trigger: 40
  - type: 42
  - view: 11


## Strongest path: Supabase CLI

From the package root:

```bash
cp .env.example .env
# Fill in Supabase values as needed.
supabase login
# This package is currently linked to ltajayfzlaevchxngkrm.
supabase link --project-ref ltajayfzlaevchxngkrm
supabase start
supabase db reset
```

After local reset passes, push to a new linked remote project:

```bash
supabase db push
# Optional after schema is proven safe:
supabase db push --include-seed
```

## Direct psql path

Use this when you have a direct database URL and want a deterministic SQL apply without the Supabase CLI:

```bash
export DATABASE_URL='postgresql://postgres.ltajayfzlaevchxngkrm:<YOUR_DATABASE_PASSWORD>@db.ltajayfzlaevchxngkrm.supabase.co:5432/postgres'
./scripts/apply_psql.sh
./scripts/apply_seed_psql.sh
./scripts/verify_psql.sh
```

Or manually:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f master_deploy.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f seed.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f verify_after_deploy.sql
```

`master_deploy.sql` uses psql `\i` include commands. Do not paste it into the Supabase Dashboard SQL Editor as one file.

## Founder/admin seed

The package does **not** create `auth.users` rows. Create or sign into the founder account through Supabase Auth first. Then run one of these:

```bash
FOUNDER_EMAIL='founder@example.com' ./scripts/apply_seed_psql.sh
```

Or edit and run:

```text
seeds/seed_founder_admin_template.sql
```

Replace `__FOUNDER_EMAIL__` with the founder Auth email before running it.

## Deployment order

1. Create a new Supabase project.
2. Confirm the project supports the needed extensions: `pgcrypto`, `vector`, and `pg_trgm`.
3. Apply migrations through Supabase CLI or `master_deploy.sql`.
4. Run `verify_after_deploy.sql`.
5. Create/sign into founder Auth account.
6. Run founder/admin seed if needed.
7. Add runtime environment variables to Vercel / local `.env`.
8. Reconnect the app to the new `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and service role key where server-side code requires it.
9. Re-ingest corpus data only after schema and RLS are verified.

## Important boundaries

- This package recreates database structure and project-owned SQL objects. It does not restore production Auth users, storage object bytes, API secrets, or existing row data unless those are explicitly seeded/imported later.
- `auth` and `storage` are Supabase-managed schemas. The migrations reference them and add triggers/policies where needed; they do not recreate Supabase internals.
- Original migrations are preserved for audit. Canonical migrations normalize filenames for safer ordering.
- If a migration fails because a referenced legacy object is missing, check `original_migrations/` and `schema_snapshots/` before editing. The repo has multiple historical schema layers by design.

## Files to inspect first

- `migration_order.csv`
- `db_object_inventory.csv`
- `master_deploy.sql`
- `verify_after_deploy.sql`
- `schema_snapshots/CompleteSchema.sql`
- `schema_snapshots/FULL_PUBLIC_SCHEMA_4_29_26.sql`

## When using the Supabase Dashboard SQL Editor

Use individual canonical migration files from `supabase/migrations/` in order. The Dashboard cannot process psql include commands from `master_deploy.sql`.

## After rebuild

Run the app against the new project with a clean user, then test:

- sign up / magic link / auth user trigger
- `public.users` row creation
- memory / corpus reads
- trainer study-source RPCs
- artifact creation
- Transcriptory capture/session/source flow
- storage upload/download policies
- service-role-only admin paths
