# ADR-001: Manifest Schema Contract

<!-- © 2026 Keith Soyka / GestaltView -->

**Status:** Accepted
**Date:** 2026-03-13
**Authors:** Keith Soyka, Claude Opus 4.6

---

## Context

GestaltView v2 requires a canonical database schema that supports the
Manifest Index (retrieval-grounded context), Billy conversation history,
Tribunal audit trail, user profiles with PLK, and diligence report
storage. Previously, schema lived as implicit Supabase table definitions
with no version-controlled DDL.

## Decision

We introduce `supabase/schema.sql` as the single source of truth for all
database objects, and `supabase/types.ts` as the TypeScript mirror.

### Schema Highlights

| Table | Purpose |
|-------|---------|
| `documents` | Corpus files with metadata and package classification |
| `knowledge_fragments` | Chunked text with pgvector embeddings (1536d) |
| `conversations` | Billy conversation sessions |
| `conversation_messages` | Individual messages within conversations |
| `tribunal_events` | Tribunal evaluation audit log |
| `tribunal_scores` | Per-candidate scores within a tribunal event |
| `profiles` | User profiles with PLK and preferences |
| `diligence_reports` | Generated diligence reports |
| `ai_interactions` | Generic AI interaction log |
| `feedback` | User feedback entries |
| `manifest_index` | Top-level manifest metadata |
| `system_config` | Runtime configuration key-value store |

### Key Design Choices

1. **pgvector for embeddings** — `vector(1536)` columns with IVFFlat
   indexes for cosine similarity search via `match_fragments` RPC.

2. **RLS policies** — Row-Level Security on all user-facing tables.
   Service-role bypass for serverless functions.

3. **Package enum** — `gestalt_package` type constrains document
   classification to `adhd`, `recovery`, `memory`, `portfolio`, `core`.

4. **Timestamps** — All tables use `timestamptz` with `now()` defaults.
   `updated_at` triggers via `moddatetime` extension.

5. **TypeScript types** — `supabase/types.ts` mirrors every table as a
   TypeScript interface, importable by both client and API code.

## Consequences

- All schema changes must go through `supabase/schema.sql` first.
- `supabase/types.ts` must be updated in lockstep with DDL changes.
- `Manifest.md` references the schema section for content indexing guidance.
- Migration tooling (e.g., Supabase CLI `db push`) can consume the DDL directly.

## References

- `supabase/schema.sql` — Canonical DDL
- `supabase/types.ts` — TypeScript interfaces
- `Manifest.md` — Schema reference section
- [pgvector documentation](https://github.com/pgvector/pgvector)
