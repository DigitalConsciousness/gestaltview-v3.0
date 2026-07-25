---
name: gestaltview-insight-bot
description: Work on the Insight-Bot lane as it currently exists in `gestaltview-v2`. Use this skill for the local insight window surface, supporting docs, and portfolio-level framing of Insight-Bot inside the ecosystem.
---

# GestaltView Insight-Bot

Last reviewed: 2026-03-29

Use this skill for the current in-repo representation of Insight-Bot: a lightweight runtime surface plus docs and wiki material, not a fully mounted standalone product.

## Inspect first
- `client/src/pages/InsightWindow.tsx`
- `client/src/pages/InsightWindow.css`
- `docs/wikis/Insight-Bot-wiki-v1.md`
- `README.md`

## Current integrations
- Current runtime presence is page-based and relatively light compared with Billy or the exhibit lanes.
- Portfolio and strategy docs should frame Insight-Bot as live, partial, or conceptual based on what the local files actually implement.
- Supabase, auth, or billing only matter here if the lane becomes gated or persistent.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-apps-portfolio`
- `gestaltview-app-runtime`
- `gestaltview-strategy-executive`

## Done when
- Live versus concept status is honest and consistent across docs and code.
- Any route, gating, or persistence claim maps back to local source files.
