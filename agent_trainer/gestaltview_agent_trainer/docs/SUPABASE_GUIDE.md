# Supabase Guide

## Required Extensions

- `pgcrypto`
- `vector`

## Schema Summary

- `tiers`
- `kit_users`
- `knowledge_fragments`
- `skill_fragments`
- `memory_entries`
- `usage_events`
- `plk_profiles`

## Retrieval Functions

- `match_knowledge(query_embedding, match_threshold, match_count, requesting_user, namespace_filter)`
- `search_knowledge(query_text, requesting_user, namespace_filter, limit_count)`

## RLS Model

- service role: full access
- authenticated users: scoped to rows owned through `kit_users.auth_user_id`

## Recommended Setup Flow

1. Apply `supabase/seed.sql` for a new project.
2. Use the separate migrations for iterative updates.
3. Confirm RLS policies are present.
4. Insert at least one `kit_users` row linked to an authenticated user before testing row-scoped flows.
