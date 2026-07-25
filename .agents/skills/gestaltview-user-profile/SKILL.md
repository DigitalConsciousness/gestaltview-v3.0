---
name: gestaltview-user-profile
description: Work on the user profile and tier context that actually exists in `gestaltview-v2`. Use this skill for Supabase-auth-backed profile reads, tier and subscription state, session identity, and honest framing of what profile functionality is implemented today.
---

# GestaltView User Profile

Last reviewed: 2026-03-29

Use this skill carefully: the current repo only implements a lightweight auth, profile, and tier layer, not the full modular dynamic profile system some older docs imply.

## Inspect first
- `client/src/contexts/AuthContext.tsx`
- `api/_lib/user.ts`
- `api/session/state.ts`
- `api/_lib/rateLimit.ts`
- `supabase/migrations/001_rate_limits_and_users.sql`
- `supabase/types.ts`

## Current integrations
- Current profile reality is Supabase auth plus a `users` table with tier, admin, query-count, and subscription fields.
- Session state and tier gating feed Billy, pricing, and upgrade flows.
- No full modular profile engine exists locally unless the task explicitly implements it in this repo.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-schema-supabase`
- `gestaltview-revenue-pricing`
- `gestaltview-app-runtime`

## Done when
- Docs distinguish implemented profile basics from future profile concepts.
- All user and tier assumptions match current Supabase and API code.
