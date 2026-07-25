# Skill Composition

Last reviewed: 2026-03-30

Use `gestaltview-agent-trainer` as the primary skill whenever the task is trainer-specific. Then compose outward only for adjacent concerns:

- `gestaltview-app-runtime`
  Use when the trainer control plane route, UI state, or app-shell integration changes.

- `gestaltview-schema-supabase`
  Use when trainer migrations, queue functions, RLS policies, or Supabase-backed data flows change.

- `gestaltview-ai-routing`
  Use when model/provider selection, routing policy shape, or provider adapters change.

- `evaluation`
  Use when rubric design, scenario scoring, pass thresholds, or LLM-as-judge behavior changes.

- `agent-development`
  Use when the compiled artifact contract or downstream agent-consumption expectations change.

- `skills-keeper`
  Use when the trainer capability needs catalog promotion, renaming, composition updates, or metadata hygiene across the skill library.

## Common composition recipes

- Control plane plus DB change:
  `gestaltview-agent-trainer` + `gestaltview-app-runtime` + `gestaltview-schema-supabase`

- Provider-routing or eval change:
  `gestaltview-agent-trainer` + `gestaltview-ai-routing` + `evaluation`

- Generated artifact or downstream agent contract change:
  `gestaltview-agent-trainer` + `agent-development`

- Skill-library maintenance after trainer evolution:
  `gestaltview-agent-trainer` + `skills-keeper`

## Anti-patterns

- Do not route generic app work through this skill unless it is trainer-specific.
- Do not duplicate general Supabase or evaluation guidance here when the existing canonical skills already cover it.
- Do not treat generated `agents/generated/*.md` output as the source of truth; the trainer run, version, and canonical spec remain upstream.
