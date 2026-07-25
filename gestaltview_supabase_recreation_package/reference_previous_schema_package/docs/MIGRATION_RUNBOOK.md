# Migration Runbook

## 0. Preflight

- Create a fresh target database.
- Confirm Postgres version if using Supabase/Neon/Railway/self-hosted.
- Confirm `pgcrypto` and `vector` availability. If `vector` is unavailable, the migration creates a text-domain fallback and real vector search should move to the split-vector adapter.
- Keep seed data separate from schema migration.

## 1. Apply schema

### Supabase CLI

```bash
./scripts/apply_supabase_cli.sh /path/to/target/repo
```

Then run:

```bash
supabase db push
```

### Direct psql

```bash
DATABASE_URL="postgresql://..." ./scripts/apply_psql.sh
```

## 2. Verify

```bash
DATABASE_URL="postgresql://..." ./scripts/verify_psql.sh
```

The verification query should return zero rows. Rows returned mean expected table/column pairs are missing.

## 3. Harden

After baseline creation:

1. Replace text domains with true enums if desired.
2. Add real foreign keys in a separate migration.
3. Tune vector dimensions and indexes.
4. Add RLS policies by ownership group.
5. Add seed data and smoke tests.

## 4. Rollback posture

Because this package creates a new baseline, rollback is target-dependent.
For test databases, drop and recreate. For production, generate reverse migrations after reviewing live dependencies.

Do not run this blindly against a production database with existing data.
