---
name: gestaltview-gpt-actions
description: Work on GPT Actions specifications, OpenAPI materials, and action-facing contract documentation inside the compendium. Use when editing or explaining files in `GPT Actions/`, API contract notes, or docs that describe action modes and request/response behavior.
updated: 2026-03-24
---

# GestaltView GPT Actions

Last reviewed: 2026-03-24

Use this skill for action-spec and action-contract tasks.

## Safe workflow

1. Inspect `GPT Actions/` and relevant API documentation.
2. Determine whether the task concerns:
   - action schema/spec files,
   - OpenAPI compatibility,
   - route behavior documentation,
   - or portfolio/demo packaging.
3. Preserve exact field names and request/response semantics when editing specs.
4. If an action surface depends on Billy/runtime behavior, cross-check `AIFlow.md`, `APIFlow.md`, and relevant API code.

## Documentation rules

- Distinguish implemented action behavior from aspirational concepts.
- Use exact mode names, route names, and payload keys.
- Flag integration uncertainty rather than guessing.

## Read next

Load `references/actions-map.md` before editing action-related files.
