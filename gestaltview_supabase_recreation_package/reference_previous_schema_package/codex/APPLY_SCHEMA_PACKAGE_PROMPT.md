# Codex Prompt — Apply GestaltView Schema Package Safely

You are working with the GestaltView schema migration package. Do not flatten this into a generic app schema.

Tasks:

1. Read `schema/gestaltview_schema_manifest.json`, `docs/SCHEMA_PORTABILITY_FRAMEWORK.md`, and `docs/MIGRATION_RUNBOOK.md`.
2. Apply migrations in timestamp order.
3. Do not invent enum values, foreign keys, or RLS policies that are not grounded in source or live introspection.
4. Keep seed data separate from schema migrations.
5. If target DB does not support pgvector, use `adapters/split_vector/README.md` and do not remove vector-bearing tables from the source of truth.
6. Run the verification migration after schema apply.
7. Report missing tables/columns and do not claim success if verification returns rows.

Operational priority:

- Preserve continuity first.
- Preserve governance/auditability second.
- Optimize vector/search only after the relational source of truth is stable.
