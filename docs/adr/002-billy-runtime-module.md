# ADR-002: Billy Runtime Module

<!-- © 2026 Keith Soyka / GestaltView -->

**Status:** Accepted
**Date:** 2026-03-13
**Authors:** Keith Soyka, Claude Opus 4.6

---

## Context

Billy — the GestaltView conversational companion — had its runtime logic
(system prompt, package inference, context block assembly, message
building) defined inline in `api/billy.ts`. This made it impossible to
reuse Billy's core behavior in other contexts (Perplexity tools,
Tribunal evaluations, CLI tooling, tests).

## Decision

Extract Billy's runtime into `shared/billy/` as a reusable module:

```
shared/billy/
  ├── types.ts      # BillyMessage, RetrievedChunk, BuildBillyMessagesParams
  ├── runtime.ts    # BILLY_SYSTEM_PROMPT, inferPackageFromQuery,
  │                 # buildContextBlock, buildBillyMessages
  └── index.ts      # Re-exports
```

### Module Responsibilities

| Export | Purpose |
|--------|---------|
| `BILLY_SYSTEM_PROMPT` | Canonical system prompt with PLK awareness, safety rails, corpus grounding instructions |
| `inferPackageFromQuery(query)` | Maps query keywords to GestaltView packages (`adhd`, `recovery`, `memory`, `portfolio`, `core`) |
| `buildContextBlock(chunks, filter, maxChars)` | Assembles retrieved context into a formatted text block for LLM consumption |
| `buildBillyMessages(params)` | Builds the full message array (system + context + user) for LLM calls |

### Refactoring

`api/billy.ts` was refactored to import from `shared/billy/runtime`
instead of defining these functions inline. The API handler now focuses
solely on HTTP concerns (request parsing, Supabase retrieval, response
formatting) while delegating Billy logic to the shared module.

## Consequences

- **Reuse**: Perplexity `run_billy` tool, Tribunal, and future integrations
  can import Billy behavior without depending on the API layer.
- **Testability**: `api/__tests__/billy-runtime.test.ts` tests the shared
  module in isolation with 18 test cases.
- **Single source of truth**: `BILLY_SYSTEM_PROMPT` is defined once —
  changes propagate everywhere.
- **PLK support**: `buildBillyMessages` accepts an optional `plkProfile`
  parameter, enabling PLK-aware Billy across all consumers.

## References

- `shared/billy/runtime.ts` — Core implementation
- `shared/billy/types.ts` — Type definitions
- `api/billy.ts` — Refactored API handler
- `api/__tests__/billy-runtime.test.ts` — Test suite
- ADR-001 for schema context
