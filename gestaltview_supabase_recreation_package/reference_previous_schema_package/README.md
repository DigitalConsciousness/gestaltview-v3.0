# GestaltView Schema Migration Package

Generated: `2026-06-12T02:31:56+00:00`  
Source: `supabaseSchema.md`  
Source SHA256: `95af30d1a98f922ca55e32ec8f8401ab4a1401e52f60b9262ffcb9e292601df0`

This package turns the exported Supabase schema map into a portable migration kit and a database-selection framework.

## What it contains

```text
gestaltview_schema_migration_package/
  supabase/migrations/            # Apply in timestamp order
  scripts/                        # psql / Supabase CLI wrappers
  tools/                          # Manifest parser + candidate DB scorer
  schema/                         # Canonical machine-readable schema manifest
  docs/                           # Portability framework, runbook, domain map
  adapters/                       # Notes for Postgres, Neon, SQLite/Turso, split vector
  codex/                          # Codex prompt for applying this safely
```

## Migration order

1. `20260611000000_extensions_and_domains.sql` — creates pgcrypto, pgvector when available, fallback domains otherwise
2. `20260611000010_tables.sql`
3. `20260611000020_indexes.sql`
4. `20260611000030_rls_starter.sql`
5. `20260611000040_optional_vector_indexes.sql` — optional/tune first
6. `20260611000090_verify_expected_columns.sql` — verification query

## Important boundary

This package preserves the schema shape visible in the markdown export: tables, columns, primary keys, unique constraints, array types, JSONB fields, and vector fields.

It does **not** invent:

- foreign keys that were not present in the export,
- enum values for custom enum-like types,
- production RLS ownership policies,
- vector dimensions/indexes. If pgvector is unavailable, `vector` is created as a text-domain fallback so the relational shape can still land.

That restraint is intentional. The package is a safe foundation for new database targets, not a fake-perfect reconstruction of constraints the source file did not expose.

## Fast path: Supabase CLI

```bash
cd gestaltview_schema_migration_package
./scripts/apply_supabase_cli.sh /path/to/your/repo
```

That copies migration files into `supabase/migrations/`. Then run your normal Supabase workflow.

## Fast path: direct Postgres URL

```bash
DATABASE_URL="postgresql://..." ./scripts/apply_psql.sh
DATABASE_URL="postgresql://..." ./scripts/verify_psql.sh
```

## Recommended next hardening pass

1. Replace custom TEXT domains with true enums once values are canonical.
2. Add foreign keys from live Supabase introspection or application code.
3. Tighten `vector` columns to `vector(768)` if 768 remains canonical.
4. Add table-specific RLS policies only after ownership columns are confirmed.
5. Add seed data separately from schema migrations.
