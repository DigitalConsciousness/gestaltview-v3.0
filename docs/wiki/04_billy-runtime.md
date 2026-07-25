<!-- PAGE_ID: gestaltview_v2_04_billy-runtime -->
<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [shared/billy/runtime.ts:27-160](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/billy/runtime.ts#L27-L160)
- [shared/billy/runtime.ts:163-310](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/billy/runtime.ts#L163-L310)
- [shared/llm/plk.ts:1-33](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/llm/plk.ts#L1-L33)
- [api/_lib/llmRouter.ts:4-62](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/llmRouter.ts#L4-L62)
- [api/_lib/llmRouter.ts:94-155](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/llmRouter.ts#L94-L155)
- [api/billy.ts:4-12](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/billy.ts#L4-L12)
- [api/billy.ts:48-149](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/billy.ts#L48-L149)

</details>

# Billy Runtime

> **Related Pages**: [[Frontend, Auth, And Routing|03_frontend-auth-routing.md]], [[Data, Memory, And Retrieval|05_data-memory-retrieval.md]], [[Voice Runtime|06_voice-runtime.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_04_billy-runtime_prompting -->
## Prompting And Embodiment Layer

Billy’s runtime prompt is not a small system string. `shared/billy/runtime.ts` treats Billy as a first-class product embodiment with explicit invariants around PLK preservation, bucket-drop behavior, crisis handling, collaboration posture, and the repo’s internal 11-module schema. The same file also provides a more general runtime addendum for non-Billy embodiments so specialist profiles can operate inside the retrieval-grounded runtime without pretending to be Billy.

That distinction matters because the runtime supports both a canonical Billy persona and alternate embodiment profiles. `buildBillyRuntimeSystemPrompt()` returns the Billy prompt for the default case, but switches to embodiment-profile rendering plus runtime directives for other profiles.

Sources: [shared/billy/runtime.ts:27-160](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/billy/runtime.ts#L27-L160)
<!-- END:AUTOGEN gestaltview_v2_04_billy-runtime_prompting -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_04_billy-runtime_routing -->
## Provider Cascade And Message Assembly

The LLM router uses a fixed cascade of providers, preferring local or cheaper paths first and paid paths last. The declared order is `ollama`, `groq`, `huggingface`, `openrouter`, `gemini`, `anthropic`, then `openai`, with a structured offline fallback if none of them are configured or reachable. System prompt construction also threads mode and user tier into the runtime prompt, and adds PLK shaping when present through the shared `buildPlkSystemPrompt()` helper, which enforces exact-language preservation, trauma-informed phrasing, and ADHD-friendly pacing.

Above that provider layer, `shared/billy/runtime.ts` handles query intent classification, package inference, context-block construction, memory-block construction, and final two-message prompt assembly. The result is a Billy turn model that always has the same high-level shape: retrieval context first, memory context if present, explicit intent tagging, then the user message.

Sources: [api/_lib/llmRouter.ts:4-62](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/llmRouter.ts#L4-L62), [api/_lib/llmRouter.ts:94-155](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/llmRouter.ts#L94-L155), [shared/llm/plk.ts:1-33](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/llm/plk.ts#L1-L33), [shared/billy/runtime.ts:163-310](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/billy/runtime.ts#L163-L310)
<!-- END:AUTOGEN gestaltview_v2_04_billy-runtime_routing -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_04_billy-runtime_api -->
## Billy API Turn Lifecycle

`api/billy.ts` is the server-side Billy turn orchestrator. Its file header explicitly lists the route’s responsibilities: bootstrap greetings, semantic and text retrieval across knowledge and skill fragments, reciprocal-rank fusion merging, degraded text-only fallback, diagnose mode, and founder continuity metadata. The handler also enforces per-turn limits like top-k bounds, maximum context chunks, and separate caps for skill fragments and memory entries.

The same file manages founder appendix building, bootstrap message shaping, continuity-state classification, and request-correlation diagnostics. That makes `/api/billy` more than a chat proxy: it is the runtime coordinator where retrieval, continuity, routing, and response envelopes meet.

Sources: [api/billy.ts:4-12](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/billy.ts#L4-L12), [api/billy.ts:48-149](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/billy.ts#L48-L149)
<!-- END:AUTOGEN gestaltview_v2_04_billy-runtime_api -->

---
