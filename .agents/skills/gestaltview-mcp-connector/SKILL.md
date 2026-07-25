---
name: gestaltview-mcp-connector
description: Configure and document MCP connector behavior for `gestaltview-v2`. Use this skill when working on local MCP JSON files, connector docs, or environment-aware access to Supabase and other integrated services.
---

# GestaltView MCP Connector

Last reviewed: 2026-03-29

Use this for connector configuration and documentation, not for generic MCP theory. The repo already ships live MCP config files that should be treated as the source of truth.

## Inspect first
- `config/mcp.json`
- `supabase/mcp.json`
- `skills/.mcp.json`
- `skills/gestaltview-mcp-connector/assets/mcp.json`
- `skills/gestaltview-mcp-connector/scripts`

## Current integrations
- Current repo config exposes a Supabase MCP HTTP endpoint with docs, account, database, debugging, functions, development, storage, and branching features.
- The skills tree separately ships a Hugging Face MCP entry under `skills/.mcp.json`, so connector docs should distinguish repo-level and skills-level configs.
- Supabase feature coverage and project-ref details should be copied from the actual JSON files rather than paraphrased from memory.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-schema-supabase`
- `gestaltview-workflow-operations`
- `gestaltview-cross-repo-workflows`

## Done when
- MCP docs and config files match exactly.
- Connector scope, feature flags, and environment notes are explicit.
