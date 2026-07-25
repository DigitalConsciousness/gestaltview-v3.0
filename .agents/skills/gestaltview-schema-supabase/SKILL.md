---
name: gestaltview-schema-supabase
description: Navigate the live database, auth, vector-search, storage, and migration surfaces in `gestaltview-v2`. Use this skill when working on `supabase/`, auth profile usage, retrieval tables, or Supabase-backed runtime behavior.
---

# GestaltView Schema Supabase

Last reviewed: 2026-03-29

Use this skill for the actual database and auth surface in this repo. It should point squarely at `supabase/`, current migrations, and the API and client code that consume those tables and RPCs.

## Inspect first
- `supabase/config.toml`
- `supabase/schema.sql`
- `supabase/gestaltview_schema.sql`
- `supabase/GestaltView_Schema_Alignment_Reference.md`
- `supabase/migrations`
- `api/_lib/supabase.ts`
- `client/src/contexts/AuthContext.tsx`
- `scripts/test-db-schema.sh`
- `scripts/init-collaborator-system.sh`

## Current integrations
- Current Supabase footprint includes auth redirect config, `users`, `session_rate_limits`, `founder_context`, retrieval fragment tables, and vector plus RPC search.
- API helpers use direct REST and RPC access while the client uses `@supabase/supabase-js` for auth and profile reads.
- Local CLI config, migration files, MCP config, and app-facing auth flows all need to stay consistent.
- The collaborator family (`collaborators`, `collaborator_roles`, `collaborator_relationships`, `collaborator_permissions`, `collaborator_onboarding_events`, `collaborator_embodiment_links`) is part of the runtime security surface and should stay aligned with the latest migration spine and the schema alignment reference.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.
5. When collaborator provisioning or security changes, confirm the alignment reference and init script still match the live migration path.

## Compose with
- `gestaltview-schema-contracts`
- `gestaltview-billy-api`
- `gestaltview-revenue-pricing`

## Done when
- Docs point at current Supabase tables, RPCs, redirects, and migrations.
- Auth, retrieval, and pricing claims match the code and config.
- Collaborator provisioning and security notes match the live migration spine.
