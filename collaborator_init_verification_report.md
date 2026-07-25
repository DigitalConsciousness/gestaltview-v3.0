# Collaborator Init Verification Report

- Generated at UTC: 2026-06-25T01:58:40Z
- Root checked: /workspaces/gestaltview-v2.0

## Required file presence
- PASS: Provisioning service exists at server/collaborators/provision.ts
- PASS: Provisioning API route exists at api/collaborators/provision.ts
- FAIL: Gemini onboarding package JSON missing at orientation/gemini_onboarding_package.v1.json
- FAIL: Gemini onboarding markdown missing at orientation/gemini_onboarding.md
- PASS: Collaborator migration found at supabase/migrations/20260621000000_collaborator_security_rls.sql
- PASS: Collaborator backfill migration found at supabase/migrations/20260413193000_backfill_collaborators.sql
- PASS: Schema snapshot found at supabase/CompleteSchema.sql

## Wiring checks
- FAIL: Auth wrapper exports requireAdmin
- PASS: Provision route uses requireAdmin
- PASS: Provision route calls provisionCollaborator
- PASS: Provision service creates Supabase SDK client
- PASS: Provision service writes onboarding event
- PASS: Provision service writes collaborator role
- PASS: Provision service writes embodiment link
- PASS: Provision service writes collaborator row
- PASS: Provision service syncs agents.collaborator_id when agentId is present

## Schema snapshot checks
- PASS: Schema snapshot includes collaborators table
- PASS: Schema snapshot includes collaborator_roles table
- PASS: Schema snapshot includes collaborator_relationships table
- PASS: Schema snapshot includes collaborator_permissions table
- PASS: Schema snapshot includes collaborator_onboarding_events table
- PASS: Schema snapshot includes collaborator_embodiment_links table
- PASS: Schema snapshot includes agents.collaborator_id column
- FAIL: Schema snapshot includes governed identity snapshot view
- FAIL: Schema snapshot marks governed identity snapshot as security invoker
- PASS: Schema snapshot includes collaborative memory overlay in the governed snapshot

## Collaborator security checks
- PASS: Collaborators table enables RLS in the latest migration
- PASS: Collaborators insert policy exists in the latest migration
- PASS: Collaborators read policy exists in the latest migration
- PASS: Collaborator permissions own-row read policy exists in the latest migration
- PASS: Collaborator relationship ownership policy exists in the latest migration
- PASS: Collaborator onboarding read policy exists in the latest migration
- PASS: Collaborator embodiment link read policy exists in the latest migration

## Gemini package checks
- FAIL: Gemini JSON package declares display name could not be checked because orientation/gemini_onboarding_package.v1.json is missing
- FAIL: Gemini JSON package declares orientation variant could not be checked because orientation/gemini_onboarding_package.v1.json is missing
- FAIL: Gemini JSON package declares external provider could not be checked because orientation/gemini_onboarding_package.v1.json is missing
- FAIL: Gemini markdown onboarding title present could not be checked because orientation/gemini_onboarding.md is missing

## Recommended next live checks
- Apply the collaborator migration in Supabase if not already applied.
- Apply the collaborator backfill migration if you want existing agents provisioned into collaborators automatically.
- Send a POST request to /api/collaborators/provision with an admin bearer token and confirm rows land in collaborators, collaborator_roles, collaborator_onboarding_events, and collaborator_embodiment_links.
- Provision Gemini either via the full API payload or by calling provisionGeminiCollaborator(...) server-side.
- After successful provision, confirm collaborator_relationships contains the Keith ↔ Gemini edge if you passed Keith's collaborator id.

## Summary
- Overall status: FAIL
- Pass count: 28
- Warning count: 0
- Fail count: 9

