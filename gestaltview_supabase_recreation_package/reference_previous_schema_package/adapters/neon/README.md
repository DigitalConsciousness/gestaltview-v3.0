# Neon Adapter

Neon is Postgres-compatible and should use the same SQL migrations.

Notes:
- confirm pgvector availability on the selected Neon plan/branch
- move auth and RLS assumptions into your application or an auth provider
- store files in S3/R2/Supabase Storage rather than inside Postgres
