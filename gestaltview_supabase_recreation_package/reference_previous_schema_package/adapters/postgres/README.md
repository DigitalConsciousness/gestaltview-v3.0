# Postgres / Supabase Adapter

Use the root `supabase/migrations` files directly.

Supported:
- uuid
- jsonb
- timestamptz
- arrays
- pgvector when extension is available
- domains for custom enum-like types

Hardening steps:
- convert domains to enums/check constraints after values are canonical
- add FKs from `docs/FOREIGN_KEY_CANDIDATES.md` after review
- add RLS policies by ownership group
