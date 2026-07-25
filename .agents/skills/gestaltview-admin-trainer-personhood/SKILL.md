---
name: gestaltview-admin-trainer-personhood
description: Establish and maintain the Admin Trainer's Agent Knowledge Library, personhood framework, embodiment mutation workflow, and manifest-backed agent package model in `gestaltview-v2`. Use this skill for Agent Knowledge Library tables, admin-only uploads, knowledge interpretation, memory/skill/relationship projection, immutable identity boundaries, code artifact review, and active agent manifest file-pull behavior. This is separate from the sellable GestaltView Agent Trainer package and from generic trainer run/eval work.
---

# GestaltView Admin Trainer Personhood

Last reviewed: 2026-04-10

Use this skill when the work is about the Admin Trainer as an internal school and embodiment console for persistent digital intelligences. This skill owns the Agent Knowledge Library and personhood framework. It does not own the packaged `agent_trainer/gestaltview_agent_trainer` product bundle, and it should not collapse communal knowledge into live agent state without a reviewable projection step.

## Inspect First

- `SPEC-1-GestaltView Agent Personhood Framework.md`
- `supabase/migrations/20260410190000_agent_personhood_framework.sql`
- `api/trainer/`
- `server/agent-trainer/`
- `shared/agent-trainer/`
- `client/src/features/agent-trainer/AgentTrainerPage.tsx`
- `skills/gestaltview-agent-trainer/SKILL.md`
- `skills/gestaltview-schema-supabase/SKILL.md`

## Current Integrations

- The Admin Trainer stays gated to founder/admin operators.
- Communal knowledge belongs in Supabase-backed library assets and chunks, not directly inside active agent identity.
- Per-agent embodiment lives through links, interpretations, mutations, memories, skills, relationships, code artifacts, versions, and manifests.
- `agents` remains the stable identity handle table; `agent_versions` remains the deployable embodiment lineage table.
- Active manifests are the file-pullable reconstruction contract for runtime/export consumers.
- Generated or uploaded TypeScript artifacts require review before being attached to an active manifest.

## Workflow

1. Separate the request boundary: product package work goes to `gestaltview-agent-trainer`; personhood, Agent Knowledge Library, manifest rebuilds, and Admin Trainer embodiment management stay here.
2. Inspect the spec and live schema/API/UI anchors before editing. Treat the spec as product intent and the checked-in code as implementation truth.
3. Preserve the immutable identity boundary. Identity proposals must be explicit mutations with elevated review; memory, skill, and relationship updates should not silently patch core identity.
4. Keep communal library ingestion, interpretation, agent projection, embodiment mutation, and runtime retrieval as separate layers.
5. When schema changes land, update shared contracts, server persistence, API routes, admin UI visibility, and `docs/CurrentState.md` in the same pass.
6. Rebuild or inspect active manifests whenever approved mutations or deployed versions change an agent's file-pullable package.
7. Validate with the lightest meaningful checks for the touched surface, usually TypeScript plus focused schema/API tests.

## Compose With

- `gestaltview-agent-trainer` for bounded training runs, evals, approvals, and generated markdown artifacts.
- `gestaltview-schema-supabase` for migrations, RLS, indexes, storage, and service-role posture.
- `gestaltview-manifest-index` for retrieval tables, embeddings, and search RPC behavior.
- `gestaltview-knowledge-curation` for source-library organization and canon hygiene.
- `gestaltview-digital-intelligence-collaboration` for relationship-aware multi-agent philosophy.
- `skills-keeper` when catalog placement or skill routing changes.

## Done When

- The Admin Trainer keeps communal knowledge separate from individualized embodiment.
- Agent growth is reviewable through interpretations, mutations, version lineage, and manifest entries.
- Active manifests can reconstruct the agent's identity, mutable profile, memories, skills, relationships, assets, prompts, and code refs.
- Unapproved drafts are not exposed to runtime/file-pull consumers.
- Catalog and CurrentState surfaces explain that this skill is distinct from the packaged Agent Trainer product.
