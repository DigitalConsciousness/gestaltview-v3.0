# ADR-003: Perplexity Computer Tools

<!-- © 2026 Keith Soyka / GestaltView -->

**Status:** Accepted
**Date:** 2026-03-13
**Authors:** Keith Soyka, Claude Opus 4.6

---

## Context

GestaltView's capabilities (Billy, Tribunal, Manifest retrieval, diligence
reports, code editing) needed to be exposed as structured, LLM-invokable
functions for Perplexity Computer integration. Without a formal tool
registry, external agents had no standardized way to invoke GestaltView
functionality.

## Decision

Create a `.Perplexity/tools/` directory with 5 tool definition files plus
a central registry index.

### Tool Architecture

```
.Perplexity/tools/
  ├── index.ts                        # Central registry + type exports
  ├── retrieve_manifest_context.ts    # Semantic search over Manifest Index
  ├── run_billy.ts                    # Billy conversation invocation
  ├── tribunal_evaluate.ts            # Tribunal multi-answer evaluation
  ├── generate_diligence_report.ts    # Diligence report assembly
  └── symbiocoder_edit.ts             # AI-proposed code edits
```

### Design Principles

1. **Definition-only files** — Each tool file exports a `definition`
   object with `name`, `description`, `parameters`, `risks`, and
   `guardrails`. No runtime implementation in the tool files themselves.

2. **Typed interfaces** — Every tool has TypeScript interfaces for input
   and output, enabling type-safe integration.

3. **Central registry** — `index.ts` exports a `TOOL_REGISTRY` const
   array and a `ToolName` union type for compile-time tool name validation.

4. **Risks and guardrails** — Every tool explicitly declares its risk
   profile and safety constraints, following GestaltView's
   consciousness-serving ethos.

### Tool Summary

| Tool | Key Input | Provider | Safety Profile |
|------|-----------|----------|----------------|
| `retrieve_manifest_context` | `query`, `topK`, `packageFilter` | Supabase pgvector | Read-only, capped results |
| `run_billy` | `query`, `plkProfile`, `provider` | Claude / Gemini | Corpus-grounded, no cure claims |
| `tribunal_evaluate` | `question`, `candidateAnswers[]` | Claude Opus 4.6 | Logged, auditable, min 2 candidates |
| `generate_diligence_report` | `topic`, `audience`, `level` | Claude Opus 4.6 | Validated vs aspirational distinction |
| `symbiocoder_edit` | `repo`, `filePath`, `instructions` | Claude Opus 4.6 | Advisory diff only, no write access |

## Consequences

- External Perplexity agents can discover and invoke GestaltView tools
  via the structured registry.
- `PERPLEXITY.MD` documents all tools with parameter tables, output
  shapes, risks, and guardrails.
- Adding a new tool requires: (1) create definition file, (2) add to
  `index.ts` exports and `TOOL_REGISTRY`, (3) document in `PERPLEXITY.MD`.
- Tool implementations live in the API layer or shared modules — the
  `.Perplexity/tools/` files are contracts, not implementations.

## References

- `.Perplexity/tools/index.ts` — Tool registry
- `PERPLEXITY.MD` — Full tool documentation
- `shared/billy/` — Billy runtime (ADR-002)
- `shared/tribunal/` — Tribunal evaluation engine
- `api/_lib/llmRouter.ts` — LLM provider routing
