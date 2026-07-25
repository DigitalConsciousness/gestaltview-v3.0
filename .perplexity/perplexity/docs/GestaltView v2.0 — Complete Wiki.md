# GestaltView v2.0 — Complete Wiki

Generated: 2026-04-09
Reference commit: `46a35cdd664bd3549ef8d41b793a1d21a51657d9`

## Table of Contents

1. [Overview](#overview)
2. [Development Environment](#development-environment)
3. [Frontend, Auth, And Routing](#frontend-auth-and-routing)
4. [Billy Runtime](#billy-runtime)
5. [Data, Memory, And Retrieval](#data-memory-and-retrieval)
6. [Voice Runtime](#voice-runtime)
7. [GATE Package Builder](#gate-package-builder)
8. [Agent Trainer](#agent-trainer)
9. [Diligence And Tribunal](#diligence-and-tribunal)
10. [Operations, Manifest, And Skills](#operations-manifest-and-skills)
11. [Deployment And Infrastructure](#deployment-and-infrastructure)
12. [Current State And Glossary](#current-state-and-glossary)

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [README.md:28-52](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L28-L52)
- [README.md:54-90](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L54-L90)
- [README.md:122-155](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L122-L155)
- [docs/CurrentState.md:1-59](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L1-L59)
- [package.json:7-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/package.json#L7-L29)

</details>

# Overview

> **Related Pages**: [[Development Environment|02_development-environment.md]], [[Frontend, Auth, And Routing|03_frontend-auth-routing.md]], [[Deployment And Infrastructure|11_deployment-infrastructure.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_01_overview_scope -->
## Platform Scope

`gestaltview-v2` is the public runtime layer for the broader GestaltView ecosystem. The repo explicitly owns the production app surface, Billy interaction flows, authenticated dashboards, exhibit lanes, diligence interfaces, agent-trainer control surfaces, and the repo-local operational scripts and documentation required to run those surfaces coherently. The README also draws a boundary: this repo consumes context from `GestaltView_Corpus_-_Knowledge_Repository`, but it is not the canonical long-memory archive itself.

The current baseline is not static. `docs/CurrentState.md` shows that the repo is being actively hardened at the shared runtime layer, most recently with timeout guards added to auth lookup and Supabase REST access so degraded backends fail fast instead of burning the full Vercel timeout window.

Sources: [README.md:28-42](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L28-L42), [docs/CurrentState.md:1-18](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L1-L18)
<!-- END:AUTOGEN gestaltview_v2_01_overview_scope -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_01_overview_runtime-map -->
## Runtime Map

The repo is organized around a clear runtime split. `client/` holds the React 19 + Vite SPA, `api/` holds Vercel handlers, `shared/` holds Billy, tribunal, and trainer contracts, the Supabase schema and migrations define the persistence layer, and `scripts/`, `docs/`, `skills/`, and `agents/` form the operator layer. The README also names the highest-traffic route families and API families, which makes it a reliable index when inventorying the product surface.

At the package level, the toolchain centers on `vite` for local development, `tsc && vite build` for production builds, a separate trainer worker entrypoint, embodiment artifact generation, health checks, ingestion, migrations, and manifest generation. That script surface matches the repo boundary: this is a live app and operator runtime, not just a frontend shell.

Sources: [README.md:44-90](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L44-L90), [package.json:7-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/package.json#L7-L29)
<!-- END:AUTOGEN gestaltview_v2_01_overview_runtime-map -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_01_overview_doc-rule -->
## Documentation And Maintenance Rule

The repo treats documentation as part of the runtime contract. The README points operators at `docs/CurrentState.md`, the architecture and API flow documents, the manifest, and the operator manual before making assumptions about stability. It also states an explicit maintenance rule: when runtime behavior, route inventory, API inventory, trainer surfaces, or scripts change materially, the corresponding docs and manifest outputs should change in the same pass.

That rule matters because this repository changes across product, AI, and operator layers at once. A useful reading order is: README for boundary and inventory, `CurrentState` for what changed most recently, and then the subsystem pages in this wiki for deeper runtime-specific detail.

Sources: [README.md:122-155](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L122-L155), [docs/CurrentState.md:40-59](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L40-L59)
<!-- END:AUTOGEN gestaltview_v2_01_overview_doc-rule -->

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [README.md:92-120](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L92-L120)
- [package.json:7-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/package.json#L7-L29)
- [.devcontainer/setup.sh:21-87](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/.devcontainer/setup.sh#L21-L87)
- [scripts/gv.sh:3-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L3-L29)
- [vite.config.ts:57-109](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/vite.config.ts#L57-L109)

</details>

# Development Environment

> **Related Pages**: [[Overview|01_overview.md]], [[Operations, Manifest, And Skills|10_operations-manifest-skills.md]], [[Deployment And Infrastructure|11_deployment-infrastructure.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_02_development-environment_bootstrap -->
## Bootstrap And Toolchain

The devcontainer bootstrap installs a fairly opinionated operator environment: system utilities, `ripgrep`, `fzf`, `bat`, `fd`, SQLite, Ollama, global `pnpm`/`tsx`, and a Python stack that includes FastAPI, Supabase, OpenAI/Anthropic/Google SDKs, testing tools, and formatting tools. If `package.json` is present, it also runs `pnpm install`, so a fresh Codespaces-style environment should land with both Node and Python dependencies ready.

The package manifest pins the repo to Node `>=22 <25`, `pnpm@10.18.1`, React 19, Vite 7, TypeScript 5.6, and `tsx` for TypeScript execution outside the browser build. That combination explains why many local workflows assume a modern Node runtime rather than legacy Vercel defaults.

Sources: [.devcontainer/setup.sh:21-69](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/.devcontainer/setup.sh#L21-L69), [package.json:30-142](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/package.json#L30-L142)
<!-- END:AUTOGEN gestaltview_v2_02_development-environment_bootstrap -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_02_development-environment_commands -->
## Local Commands And Repo CLI

The README identifies the baseline loop as `npm install`, `npm run dev`, `npm run build`, `npm run preview`, and `npm run health`, then adds repo-specific commands for `gv`, `billycheck`, manifest generation, embodiment builds, the trainer worker, and API smoke-test scripts. Those commands line up directly with the `package.json` script table rather than being a stale doc-only list.

`scripts/gv.sh` is not a thin wrapper. It bootstraps Billy personality, repo context, skill indexing, checkpointing, bucket capture, and provider fallbacks across Gemini, Groq, Ollama, and OpenAI-style paths. In practice, that script is the operator-facing CLI for working with the repo as a living context surface rather than just a filesystem.

Sources: [README.md:92-115](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L92-L115), [package.json:7-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/package.json#L7-L29), [scripts/gv.sh:3-14](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L3-L14), [scripts/gv.sh:217-276](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L217-L276)
<!-- END:AUTOGEN gestaltview_v2_02_development-environment_commands -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_02_development-environment_proxy -->
## Local Proxy And Working Assumptions

Local `npm run dev` serves the SPA from `client/`, not a full monolith. `vite.config.ts` merges env from both the repo root and `client/`, resolves aliases for `@`, `@shared`, and `@config`, and proxies `/api` to a configurable backend target, defaulting to the deployed Vercel runtime when no local API base is present. That means browser development can run against a remote backend unless the operator deliberately points it somewhere else.

The README makes the same assumption explicit: Vite is the dev root, and `server/index.ts` is only an optional Express server for built assets. The practical outcome is that frontend iteration and backend iteration are loosely coupled by the dev proxy rather than by a single local process.

Sources: [vite.config.ts:57-109](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/vite.config.ts#L57-L109), [README.md:117-120](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L117-L120)
<!-- END:AUTOGEN gestaltview_v2_02_development-environment_proxy -->

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [client/src/App.tsx:78-209](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/App.tsx#L78-L209)
- [client/src/contexts/AuthContext.tsx:9-38](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/contexts/AuthContext.tsx#L9-L38)
- [client/src/contexts/AuthContext.tsx:56-178](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/contexts/AuthContext.tsx#L56-L178)
- [client/src/pages/SignIn.tsx:15-139](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/pages/SignIn.tsx#L15-L139)
- [README.md:54-76](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L54-L76)

</details>

# Frontend, Auth, And Routing

> **Related Pages**: [[Overview|01_overview.md]], [[Billy Runtime|04_billy-runtime.md]], [[Agent Trainer|08_agent-trainer.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_03_frontend-auth-routing_shell -->
## Application Shell And Route Inventory

`client/src/App.tsx` is the frontend route source of truth. The app shell wraps the router with an error boundary, theme provider, auth provider, tooltip provider, Billy provider, and Vercel analytics hooks, then gates the home page behind an opening-ceremony experience while subpages skip straight to the routed surface.

The route inventory is broad and intentionally mixed: core Billy pages, pricing and auth flows, the hosted trainer runtime, package-builder/order views, exhibit lanes, diligence, tribunal, and archive pages. That matches the README claim that `gestaltview-v2` is both the public product surface and the authenticated operator surface.

Sources: [client/src/App.tsx:98-209](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/App.tsx#L98-L209), [README.md:54-76](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L54-L76)
<!-- END:AUTOGEN gestaltview_v2_03_frontend-auth-routing_shell -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_03_frontend-auth-routing_auth -->
## Auth State And Redirect Memory

The auth layer is client-first and Supabase-backed. `AuthContext` creates a browser Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, resolves the current session, hydrates the `users` profile table for tier and admin state, and exposes both password and magic-link sign-in plus a bearer-token header helper for authenticated API calls. It also hard-stops the loading state after eight seconds so the UI cannot hang indefinitely waiting for session resolution.

`SignIn.tsx` preserves redirect intent aggressively. It prefers an explicit `redirect` query param, then session storage, then a same-origin referrer, and only then falls back to `/billy`. Both magic-link and password flows persist that redirect before submission, so returning users land back in the thread or surface they intended to continue instead of being dumped at a generic home page.

Sources: [client/src/contexts/AuthContext.tsx:9-38](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/contexts/AuthContext.tsx#L9-L38), [client/src/contexts/AuthContext.tsx:56-178](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/contexts/AuthContext.tsx#L56-L178), [client/src/pages/SignIn.tsx:15-139](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/pages/SignIn.tsx#L15-L139)
<!-- END:AUTOGEN gestaltview_v2_03_frontend-auth-routing_auth -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_03_frontend-auth-routing_control -->
## Control Surfaces And Product Lanes

Not every route is public in the same way. The internal trainer control plane is protected by a route guard that waits for auth resolution and only grants access to admins or founder-allowlisted emails, redirecting everyone else back to the hosted trainer page. That separation is important: `/agent-trainer` is the public hosted runtime, while `/agent-trainer/control-plane` is an internal operating surface.

Outside the trainer, the app keeps several distinct product lanes live in one SPA: Billy chat and voice, GATE package generation, diligence and tribunal views, and a long list of exhibit pages. The frontend is therefore an orchestration layer over many product domains rather than a narrow chat UI.

Sources: [client/src/App.tsx:66-96](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/App.tsx#L66-L96), [client/src/App.tsx:101-159](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/App.tsx#L101-L159)
<!-- END:AUTOGEN gestaltview_v2_03_frontend-auth-routing_control -->

---

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

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [api/_lib/auth.ts:4-33](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L4-L33)
- [api/_lib/auth.ts:35-159](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L35-L159)
- [api/_lib/supabase.ts:4-21](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/supabase.ts#L4-L21)
- [api/_lib/supabase.ts:229-253](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/supabase.ts#L229-L253)
- [api/_lib/memory.ts:20-132](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/memory.ts#L20-L132)
- [api/_lib/memory.ts:299-590](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/memory.ts#L299-L590)
- [api/session/memory.ts:63-186](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/memory.ts#L63-L186)
- [api/session/dashboard.ts:196-270](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L196-L270)

</details>

# Data, Memory, And Retrieval

> **Related Pages**: [[Billy Runtime|04_billy-runtime.md]], [[Frontend, Auth, And Routing|03_frontend-auth-routing.md]], [[Current State And Glossary|12_current-state-and-glossary.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_05_data-memory-retrieval_supabase -->
## Supabase Access Layer

The shared Supabase helper is deliberately lightweight: it avoids the external SDK in favor of direct REST calls for knowledge fragments, skill fragments, founder context, user accounts, and memory operations. That helper now includes an `AbortController`-based request timeout, defaulting to twelve seconds, so stalled backend calls cannot quietly consume an entire serverless execution window.

Auth follows the same pattern. `api/_lib/auth.ts` creates a service-role Supabase client, caches user-profile lookups for thirty seconds, and wraps both `supabase.auth.getUser()` and the profile lookup query in a four-second timeout. That is the concrete implementation behind the current-state note about fast-fail mitigation.

Sources: [api/_lib/supabase.ts:4-21](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/supabase.ts#L4-L21), [api/_lib/supabase.ts:229-253](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/supabase.ts#L229-L253), [api/_lib/auth.ts:4-33](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L4-L33), [api/_lib/auth.ts:108-159](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L108-L159)
<!-- END:AUTOGEN gestaltview_v2_05_data-memory-retrieval_supabase -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_05_data-memory-retrieval_memory -->
## Persistent Memory Capture And Recall

The memory layer distinguishes memory kinds such as identity, preference, goal, project, relationship, constraint, insight, and note, and separates scopes across `personal`, `session`, and `shared`. Billy auto-capture is conservative: it skips short sentences, questions, and volatile support requests, extracts at most two candidates per turn, derives tags and summaries, embeds them when possible, and stores them as `billy-auto` entries.

Recall uses hybrid retrieval. When an embedding is available, the helper queries both semantic and text search, then merges results with a weighted rank that boosts importance and pinned status. The session memory API exposes that behavior via `GET` search, `POST` create-or-update with embeddings, and `DELETE` removal for authenticated users.

Sources: [api/_lib/memory.ts:20-132](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/memory.ts#L20-L132), [api/_lib/memory.ts:299-590](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/memory.ts#L299-L590), [api/session/memory.ts:63-186](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/memory.ts#L63-L186)
<!-- END:AUTOGEN gestaltview_v2_05_data-memory-retrieval_memory -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_05_data-memory-retrieval_session -->
## Session APIs And Founder Continuity

`/api/session/dashboard` is the authenticated control-plane summary for a user. It returns profile state, founder-bootstrap flags, founder context when the caller is founder-eligible or admin, common runtime shortcuts, and visibility into which Billy text and voice providers are configured in the environment. It can also expose a bounded admin user listing when the current account has admin rights.

Founder continuity is treated as a managed surface rather than an implicit side effect. The dashboard payload carries `currentState`, `sessionThread`, `modePreference`, `confirmedAdult`, and `plkSnapshot`, while the auth helper separately exposes founder/admin allowlisting. Together those pieces provide the durable context that Billy and internal control surfaces can reuse across sessions.

Sources: [api/session/dashboard.ts:17-40](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L17-L40), [api/session/dashboard.ts:196-280](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L196-L280), [api/_lib/auth.ts:85-101](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L85-L101)
<!-- END:AUTOGEN gestaltview_v2_05_data-memory-retrieval_session -->

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [billy_voice/app.py:1-21](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L1-L21)
- [billy_voice/app.py:77-122](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L77-L122)
- [billy_voice/app.py:128-258](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L128-L258)
- [billy_voice/cosyvoice_tts.py:35-126](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/cosyvoice_tts.py#L35-L126)
- [api/voice/billy.ts:11-86](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/voice/billy.ts#L11-L86)
- [api/session/dashboard.ts:250-269](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L250-L269)

</details>

# Voice Runtime

> **Related Pages**: [[Billy Runtime|04_billy-runtime.md]], [[Data, Memory, And Retrieval|05_data-memory-retrieval.md]], [[Deployment And Infrastructure|11_deployment-infrastructure.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_06_voice-runtime_pipeline -->
## Voice Pipeline

The Python voice worker describes the end-to-end path explicitly: LiveKit worker, faster-whisper STT, `api/billy.ts`, CosyVoice TTS, then audio back to the caller. Each voice session owns a lifecycle object that subscribes to participant audio, streams transcripts through STT, interrupts in-flight responses when the user starts speaking again, and preserves a session-context object that can be passed back into the Billy text API on later turns.

That design means the voice stack is not a separate assistant. It is a transport and turn-management layer wrapped around the same Billy text runtime.

Sources: [billy_voice/app.py:1-21](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L1-L21), [billy_voice/app.py:77-122](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L77-L122), [billy_voice/app.py:128-258](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L128-L258)
<!-- END:AUTOGEN gestaltview_v2_06_voice-runtime_pipeline -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_06_voice-runtime_tts -->
## Speech Synthesis Paths

There are two TTS surfaces in the repo. The Python worker uses CosyVoice in instruct mode, streaming 24kHz mono PCM back to LiveKit in 40 ms frames. That path is optimized for the conversational worker and can shape delivery using a style plan before synthesis.

Separately, `api/voice/billy.ts` is a serverless ElevenLabs proxy. It requires an ElevenLabs API key and Billy voice ID, accepts text, forwards it to the ElevenLabs TTS API, and returns `audio/mpeg` with `no-store` caching. In other words, the repo supports both a local/worker voice stack and a direct serverless TTS endpoint.

Sources: [billy_voice/cosyvoice_tts.py:35-126](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/cosyvoice_tts.py#L35-L126), [api/voice/billy.ts:11-86](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/voice/billy.ts#L11-L86)
<!-- END:AUTOGEN gestaltview_v2_06_voice-runtime_tts -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_06_voice-runtime_requirements -->
## Runtime Requirements And Mode Flags

The worker depends on `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `BILLY_API_URL`, `COSYVOICE_URL`, and an optional `BILLY_MODE`. The dashboard payload also reports whether ElevenLabs, LiveKit, CosyVoice, Whisper, and the Billy worker path appear configured, which gives the authenticated control plane a cheap runtime-health view without needing a separate voice admin UI.

Operationally, voice is best read as an overlay on the Billy runtime rather than a separate product lane. The required env and dashboard flags are about transport availability, while the actual conversational intelligence still comes from the Billy API.

Sources: [billy_voice/app.py:13-20](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L13-L20), [api/session/dashboard.ts:250-269](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L250-L269)
<!-- END:AUTOGEN gestaltview_v2_06_voice-runtime_requirements -->

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [shared/gate/schemas.ts:3-68](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L3-L68)
- [shared/gate/schemas.ts:191-320](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L191-L320)
- [shared/gate/engine.ts:30-188](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/engine.ts#L30-L188)
- [client/src/components/GATEEntrypointWizard.tsx:32-318](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/GATEEntrypointWizard.tsx#L32-L318)
- [client/src/lib/gateApi.ts:53-162](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/lib/gateApi.ts#L53-L162)
- [server/gate/service.ts:366-577](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/gate/service.ts#L366-L577)
- [server/gate/service.ts:615-935](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/gate/service.ts#L615-L935)
- [docs/CurrentState.md:161-211](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L161-L211)

</details>

# GATE Package Builder

> **Related Pages**: [[Frontend, Auth, And Routing|03_frontend-auth-routing.md]], [[Operations, Manifest, And Skills|10_operations-manifest-skills.md]], [[Current State And Glossary|12_current-state-and-glossary.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_07_gate-package-builder_contract -->
## Draft Contract And Recommendation Engine

GATE is strongly typed from the start. The shared schemas define draft tiers, delivery surfaces, checkout modes, draft and order statuses, compatibility findings, price breakdowns, build jobs, and artifacts. A package draft carries enough data to describe buyer identity, use case, tier, seats, backend, surfaces, packs, source bundles, theme, notes, and optional installer intent.

The shared engine turns that draft into a richer analysis. It applies use-case defaults, scores operator packs and source bundles, suggests surfaces, produces a price quote, and generates a deliverables preview that already assumes package artifacts like manifests, config files, docs, and installers.

Sources: [shared/gate/schemas.ts:3-68](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L3-L68), [shared/gate/schemas.ts:191-320](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L191-L320), [shared/gate/engine.ts:30-188](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/engine.ts#L30-L188)
<!-- END:AUTOGEN gestaltview_v2_07_gate-package-builder_contract -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_07_gate-package-builder_wizard -->
## Wizard UX And Draft Persistence

The frontend wizard is built around a six-step flow, local snapshot persistence, URL draft synchronization, optimistic hydration from local state, and autosave-aware remote persistence. It stores a local snapshot under `gv-gate-builder-snapshot-v1`, restores it on load, prefers a `draft` query param when present, and avoids unnecessary saves when the serialized draft signature has not changed.

The client API layer is thin on purpose. It exposes draft create, fetch, patch, validate, checkout, order retrieval, artifact access redemption, and build regeneration endpoints, while only attaching the `X-Gate-Admin-Key` header for mock-payment flows. The recent current-state notes show that this surface has been under active UX hardening, especially around autosave stability, reset behavior, and admin no-charge testing.

Sources: [client/src/components/GATEEntrypointWizard.tsx:32-318](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/GATEEntrypointWizard.tsx#L32-L318), [client/src/lib/gateApi.ts:53-162](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/lib/gateApi.ts#L53-L162), [docs/CurrentState.md:161-211](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L161-L211)
<!-- END:AUTOGEN gestaltview_v2_07_gate-package-builder_wizard -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_07_gate-package-builder_checkout -->
## Checkout, Orders, And Build Jobs

Server-side GATE service code manages the full state machine. Draft creation and patching normalize selections and hash the config, checkout turns a validated draft into an order and optional support request, and payment completion either attaches a Stripe session or immediately marks the order paid and creates a build job. The same service keeps draft, order, and build-job state aligned across both Supabase-backed and local-state modes.

Build execution then flips orders and drafts into `provisioning`, composes a package artifact, stores or upserts the artifact, and ends in either `delivered` or `failed` with build-log entries. This is not a marketing upsell screen disguised as code; it is a real package-assembly pipeline with typed persistence and explicit lifecycle states.

Sources: [server/gate/service.ts:366-577](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/gate/service.ts#L366-L577), [server/gate/service.ts:615-935](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/gate/service.ts#L615-L935)
<!-- END:AUTOGEN gestaltview_v2_07_gate-package-builder_checkout -->

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [shared/agent-trainer/schemas.ts:44-145](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/schemas.ts#L44-L145)
- [shared/agent-trainer/schemas.ts:193-347](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/schemas.ts#L193-L347)
- [shared/agent-trainer/embodiment.ts:19-85](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/embodiment.ts#L19-L85)
- [shared/agent-trainer/compiler.ts:50-129](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/compiler.ts#L50-L129)
- [server/agent-trainer/orchestrator.ts:289-360](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/agent-trainer/orchestrator.ts#L289-L360)
- [server/agent-trainer/study-sources.ts:40-65](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/agent-trainer/study-sources.ts#L40-L65)
- [server/agent-trainer/study-sources.ts:139-320](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/agent-trainer/study-sources.ts#L139-L320)
- [api/trainer/_helpers.ts:7-18](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/trainer/_helpers.ts#L7-L18)
- [api/trainer/runs/index.ts:16-50](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/trainer/runs/index.ts#L16-L50)
- [worker/trainer/main.ts:14-57](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/worker/trainer/main.ts#L14-L57)
- [client/src/features/agent-trainer/AgentTrainerPage.tsx:59-104](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/features/agent-trainer/AgentTrainerPage.tsx#L59-L104)
- [client/src/features/agent-trainer/AgentTrainerPage.tsx:205-320](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/features/agent-trainer/AgentTrainerPage.tsx#L205-L320)

</details>

# Agent Trainer

> **Related Pages**: [[Frontend, Auth, And Routing|03_frontend-auth-routing.md]], [[Data, Memory, And Retrieval|05_data-memory-retrieval.md]], [[Operations, Manifest, And Skills|10_operations-manifest-skills.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_08_agent-trainer_contract -->
## Training Contract And Embodiment Defaults

The trainer surface is schema-driven end to end. Shared contracts define agent specs, provider preferences, training briefs, normalized briefs, scenario schemas, rubrics, safety findings, training statuses, version summaries, approvals, deployment artifacts, and run detail payloads. That means the control plane can talk in typed domain objects instead of ad hoc prompt blobs.

Embodiment is built into the trainer rather than added later. Domains map to default embodiment profiles such as `the-weaver`, `billy`, `the-guardian`, and `the-translation-bridge`, and the markdown compiler turns a validated agent spec into a deployable markdown artifact with structured frontmatter plus role, process, output, example, constraint, and handoff sections.

Sources: [shared/agent-trainer/schemas.ts:44-145](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/schemas.ts#L44-L145), [shared/agent-trainer/schemas.ts:193-347](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/schemas.ts#L193-L347), [shared/agent-trainer/embodiment.ts:19-85](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/embodiment.ts#L19-L85), [shared/agent-trainer/compiler.ts:50-129](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/compiler.ts#L50-L129)
<!-- END:AUTOGEN gestaltview_v2_08_agent-trainer_contract -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_08_agent-trainer_pipeline -->
## Orchestration And Study Pack Assembly

The orchestrator normalizes a brief by combining explicit target behaviors with embodiment competencies, study-pack understanding, risk notes, and collaboration preferences. It then turns that into a curriculum with explicit competencies, constraints, and evaluation dimensions instead of jumping straight to model generation.

Study-pack assembly is unusually rich. The trainer can pull source files, local subagent examples, reference bundles for function calling, MCP, routing, and memory patterns, plus shared collaboration memories. The source-guidance rules make those materials operational: each source kind carries principles, voice notes, risk notes, and preferred moves that shape the authored agent instead of just padding the context window.

Sources: [server/agent-trainer/orchestrator.ts:289-360](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/agent-trainer/orchestrator.ts#L289-L360), [server/agent-trainer/study-sources.ts:40-65](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/agent-trainer/study-sources.ts#L40-L65), [server/agent-trainer/study-sources.ts:139-320](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/agent-trainer/study-sources.ts#L139-L320)
<!-- END:AUTOGEN gestaltview_v2_08_agent-trainer_pipeline -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_08_agent-trainer_control-plane -->
## Control Plane, APIs, And Worker Loop

Trainer APIs are locked behind founder-or-admin access. The shared helper enforces that gate, the runs endpoint lists recent runs and accepts new submissions, and inline execution can be toggled by env. When inline execution is off, the separate worker loop polls for jobs, claims one, runs training, and marks completion or failure back into persistence.

The frontend control plane reflects the same model. `AgentTrainerPage` checks the auth context for admin or founder access, loads runs and reference data through `useTrainingRun`, ships structured submit payloads, and exposes canned templates for internal operator, Billy guide, and memory-care companion training runs. In other words, the trainer is an internal operating system, not a hidden settings page.

Sources: [api/trainer/_helpers.ts:7-18](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/trainer/_helpers.ts#L7-L18), [api/trainer/runs/index.ts:16-50](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/trainer/runs/index.ts#L16-L50), [worker/trainer/main.ts:14-57](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/worker/trainer/main.ts#L14-L57), [client/src/features/agent-trainer/AgentTrainerPage.tsx:59-104](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/features/agent-trainer/AgentTrainerPage.tsx#L59-L104), [client/src/features/agent-trainer/AgentTrainerPage.tsx:205-320](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/features/agent-trainer/AgentTrainerPage.tsx#L205-L320)
<!-- END:AUTOGEN gestaltview_v2_08_agent-trainer_control-plane -->

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [api/diligence.ts:79-163](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/diligence.ts#L79-L163)
- [api/diligence.ts:197-279](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/diligence.ts#L197-L279)
- [client/src/components/DiligenceExplorer/index.tsx:18-110](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/DiligenceExplorer/index.tsx#L18-L110)
- [client/src/components/DiligenceExplorer/useDiligenceData.ts:10-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/DiligenceExplorer/useDiligenceData.ts#L10-L29)
- [shared/tribunal/types.ts:4-52](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/tribunal/types.ts#L4-L52)
- [README.md:60-76](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L60-L76)

</details>

# Diligence And Tribunal

> **Related Pages**: [[Frontend, Auth, And Routing|03_frontend-auth-routing.md]], [[Billy Runtime|04_billy-runtime.md]], [[Current State And Glossary|12_current-state-and-glossary.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_09_diligence-tribunal_data -->
## Diligence Data Loading

The diligence endpoint builds a normalized API payload out of CSV and JSON exports from a `DiligenceReports` or `Diligence_Reports` directory. It includes its own CSV parser, a five-minute cache, filename fallback logic, and typed normalization for claims, chronology, skepticism items, evidence index rows, architecture rows, and bundle summaries.

This means `/api/diligence` is effectively an adapter between offline diligence artifacts and the live frontend. The endpoint is designed to be resilient to small naming changes in exported files rather than assuming a single perfect bundle layout.

Sources: [api/diligence.ts:79-163](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/diligence.ts#L79-L163), [api/diligence.ts:197-279](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/diligence.ts#L197-L279)
<!-- END:AUTOGEN gestaltview_v2_09_diligence-tribunal_data -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_09_diligence-tribunal_ui -->
## Explorer UI Surface

The diligence UI loads its entire dataset from `/api/diligence` and presents it through four tabs: claim wall, 2D evidence timeline, 3D loom, and audit record. It also computes quick headline stats such as total indexed files, OTS receipts, claim count, objections, and last update time from the loaded payload.

This surface sits alongside the rest of the public runtime instead of in a separate backoffice app. The README reflects that by listing diligence endpoints directly in the primary API families for the repo.

Sources: [client/src/components/DiligenceExplorer/useDiligenceData.ts:10-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/DiligenceExplorer/useDiligenceData.ts#L10-L29), [client/src/components/DiligenceExplorer/index.tsx:18-110](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/DiligenceExplorer/index.tsx#L18-L110), [README.md:64-76](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L64-L76)
<!-- END:AUTOGEN gestaltview_v2_09_diligence-tribunal_ui -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_09_diligence-tribunal_tribunal -->
## Tribunal Scoring Model

The tribunal layer is represented in shared types rather than a visible end-user flow in the files inspected for this pass. It defines candidate answers, optional context fragments, a verdict object with evidence counts and timestamps, and per-answer scoring dimensions for evidence alignment, PLK resonance, safety, and overall score.

That type shape places tribunal as an adjudication layer that can compare model outputs against evidence and voice fidelity, which fits the repo’s broader emphasis on grounded synthesis over raw single-model output.

Sources: [shared/tribunal/types.ts:4-52](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/tribunal/types.ts#L4-L52)
<!-- END:AUTOGEN gestaltview_v2_09_diligence-tribunal_tribunal -->

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [scripts/gv.sh:3-14](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L3-L14)
- [scripts/gv.sh:72-93](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L72-L93)
- [scripts/gv.sh:100-143](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L100-L143)
- [scripts/gv.sh:199-276](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L199-L276)
- [scripts/gv-health-check.sh:6-10](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv-health-check.sh#L6-L10)
- [scripts/gv-health-check.sh:30-177](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv-health-check.sh#L30-L177)
- [scripts/generate_repo_manifest.py:3-25](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L3-L25)
- [scripts/generate_repo_manifest.py:39-87](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L39-L87)
- [scripts/generate_repo_manifest.py:185-260](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L185-L260)

</details>

# Operations, Manifest, And Skills

> **Related Pages**: [[Development Environment|02_development-environment.md]], [[Agent Trainer|08_agent-trainer.md]], [[Deployment And Infrastructure|11_deployment-infrastructure.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_10_operations-manifest-skills_cli -->
## Repo CLI And Context Refresh

`scripts/gv.sh` positions itself as the repo-aware Billy CLI, not just a shell helper. It loads env from both repo root and `client/`, defines provider defaults and time budgets, verifies core dependencies, and maintains several local artifacts including a checkpoint file, bucket file, rendered Billy personality file, repo context file, forensic log, and skill index.

Its context-refresh path builds a repo briefing by collecting canonical orientation files, a skill inventory, a file-tree snapshot, recent commits, and the active scripts list. That makes operator context generation a first-class repository concern rather than a manual ritual.

Sources: [scripts/gv.sh:3-14](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L3-L14), [scripts/gv.sh:72-93](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L72-L93), [scripts/gv.sh:199-276](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L199-L276)
<!-- END:AUTOGEN gestaltview_v2_10_operations-manifest-skills_cli -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_10_operations-manifest-skills_health -->
## Health Checks And Readiness Gates

`scripts/gv-health-check.sh` encodes a simple but useful operational contract: exit code `0` for fully ready, `1` for degraded-but-usable, and `2` for critical problems. It checks core tools, AI provider keys, Supabase env, Ollama availability, project structure, and git status, then emits a single final verdict.

That script is valuable because the runtime depends on many optional external services. A quick degraded verdict is often the right answer; it tells the operator Billy may still run, but with offline fallback, missing retrieval, or missing local-model capability.

Sources: [scripts/gv-health-check.sh:6-10](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv-health-check.sh#L6-L10), [scripts/gv-health-check.sh:30-177](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv-health-check.sh#L30-L177)
<!-- END:AUTOGEN gestaltview_v2_10_operations-manifest-skills_health -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_10_operations-manifest-skills_manifest -->
## Manifest Generation And Inventory

The repo manifest generator writes both JSON and Markdown manifests to `docs/`, scanning selected directories for file metadata, checksums, categories, route inventory, API endpoints, docs, test scripts, dependency snapshots, and git state. Category inference is rule-based, so the manifest doubles as a structured cross-section of the codebase rather than a flat file listing.

This script is the automation behind the README maintenance rule about regenerating manifest outputs when the route, API, script, or documentation inventory changes materially.

Sources: [scripts/generate_repo_manifest.py:3-25](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L3-L25), [scripts/generate_repo_manifest.py:39-87](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L39-L87), [scripts/generate_repo_manifest.py:185-260](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L185-L260), [README.md:148-154](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L148-L154)
<!-- END:AUTOGEN gestaltview_v2_10_operations-manifest-skills_manifest -->

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [package.json:7-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/package.json#L7-L29)
- [vite.config.ts:17-35](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/vite.config.ts#L17-L35)
- [vite.config.ts:57-109](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/vite.config.ts#L57-L109)
- [vercel.json:1-49](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/vercel.json#L1-L49)
- [.devcontainer/setup.sh:21-87](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/.devcontainer/setup.sh#L21-L87)
- [README.md:92-120](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L92-L120)

</details>

# Deployment And Infrastructure

> **Related Pages**: [[Overview|01_overview.md]], [[Development Environment|02_development-environment.md]], [[Voice Runtime|06_voice-runtime.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_11_deployment-infrastructure_build -->
## Build And Hosting Contract

The deployed build contract is simple: Vercel installs with `npm install --legacy-peer-deps`, runs `npm run build`, and serves `dist/public`. On the repo side, `package.json` defines that build as `tsc && vite build`, which means type correctness remains a deploy gate rather than a lint-only concern.

The Vite config also injects the Meticulous snippet only in non-production environments, keeping the production `index.html` clean while preserving synchronous fetch/XHR interception during local or non-prod recording sessions.

Sources: [package.json:7-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/package.json#L7-L29), [vite.config.ts:17-35](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/vite.config.ts#L17-L35), [vercel.json:1-5](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/vercel.json#L1-L5)
<!-- END:AUTOGEN gestaltview_v2_11_deployment-infrastructure_build -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_11_deployment-infrastructure_proxy -->
## Aliases, Proxying, And Function Routing

Vite resolves `@`, `@shared`, and `@config` aliases, uses `client/` as its root, and proxies `/api` to a normalized backend target derived from several env candidates. This keeps local SPA development compatible with either a local backend or the deployed Vercel runtime.

On the hosting side, `vercel.json` wires specific include-file patterns for Billy, diligence, session, Stripe, GATE, voice, and action handlers, then rewrites friendly GATE URLs such as `/api/gate/drafts/:id` and `/api/gate/orders/:id` onto the actual handler filenames. Everything else falls through to `/index.html`, preserving SPA routing.

Sources: [vite.config.ts:57-109](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/vite.config.ts#L57-L109), [vercel.json:6-49](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/vercel.json#L6-L49)
<!-- END:AUTOGEN gestaltview_v2_11_deployment-infrastructure_proxy -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_11_deployment-infrastructure_bootstrap -->
## Devcontainer Bootstrap

The devcontainer setup is part of infrastructure, not just convenience. It installs the operator tool belt, Ollama, global Node helpers, a Python AI stack, and project dependencies, then optionally creates a `.env` from `.env.example`. The ending banner explicitly points operators at `npm run health` and `npm run ollama:pull`.

Taken together with the Vite proxy and Vercel contract, the repo supports a hybrid workflow: local frontend, optional local AI and voice services, and deployable serverless APIs on the same codebase.

Sources: [.devcontainer/setup.sh:21-87](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/.devcontainer/setup.sh#L21-L87), [README.md:92-120](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L92-L120)
<!-- END:AUTOGEN gestaltview_v2_11_deployment-infrastructure_bootstrap -->

---

<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [docs/CurrentState.md:1-59](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L1-L59)
- [docs/CurrentState.md:63-110](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L63-L110)
- [docs/CurrentState.md:114-211](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L114-L211)
- [README.md:28-42](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L28-L42)
- [README.md:135-146](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L135-L146)
- [shared/billy/runtime.ts:41-103](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/billy/runtime.ts#L41-L103)
- [shared/gate/schemas.ts:21-60](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L21-L60)
- [shared/agent-trainer/schemas.ts:93-115](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/schemas.ts#L93-L115)

</details>

# Current State And Glossary

> **Related Pages**: [[Overview|01_overview.md]], [[Data, Memory, And Retrieval|05_data-memory-retrieval.md]], [[GATE Package Builder|07_gate-package-builder.md]], [[Agent Trainer|08_agent-trainer.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_12_current-state-and-glossary_recent -->
## Recent Operational Deltas

The current-state log shows three especially relevant recent threads. On 2026-04-08, auth and shared Supabase calls were wrapped in explicit timeout ceilings to stop serverless functions from idling into 300-second Vercel failures. On 2026-04-07, the trainer UI was updated to match newer shared schema keys and hook method names so `npm run build` could pass again. On 2026-04-06, the GATE wizard and package-builder flow were stabilized with banner clearing, autosave fixes, reset behavior, and admin mock-payment support.

For operators, that file is the fastest answer to the question “what changed most recently that could invalidate older assumptions?” It is not a changelog of everything, but it is the repo’s explicit running status ledger.

Sources: [docs/CurrentState.md:1-59](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L1-L59), [docs/CurrentState.md:63-110](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L63-L110), [docs/CurrentState.md:114-211](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L114-L211)
<!-- END:AUTOGEN gestaltview_v2_12_current-state-and-glossary_recent -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_12_current-state-and-glossary_boundary -->
## Ecosystem Boundary

The README is explicit that `gestaltview-v2` is the live runtime layer, while `GestaltView_Corpus_-_Knowledge_Repository` remains the canonical long-memory corpus and evidence archive. It also lists several active companion repositories, including Insight-Bot, SymbioCoder, Resume Rockstar, and GAICE, and instructs maintainers to document dependencies or handoffs explicitly when a sibling repo is not mounted locally.

That boundary matters when reading this wiki: the pages here describe the runtime repo itself. Any deeper claim about corpus stewardship, historical evidence, or sibling-repo internals should be traced back to the mounted repo or called out as a dependency.

Sources: [README.md:28-42](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L28-L42), [README.md:135-146](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L135-L146)
<!-- END:AUTOGEN gestaltview_v2_12_current-state-and-glossary_boundary -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_12_current-state-and-glossary_terms -->
## Repo Vocabulary

Within this repo, `PLK` refers to Billy’s personal-language-key discipline of preserving user metaphors and cadence. `Bucket drop` is the practice of quietly catching meaningful details without turning every capture into a ceremony. `Founder continuity` refers to the saved founder context fields that preserve thread, current state, mode preference, and PLK snapshot across sessions.

`GATE` is the typed package-builder and delivery pipeline built around draft, checkout, order, and build-job states. `Agent trainer` is the internal system for turning structured training briefs and study packs into evaluated, embodied agent artifacts. `Diligence` is the evidence and audit surface backed by exported report bundles, while `tribunal` names a scoring model for comparing candidate answers against evidence, PLK resonance, and safety.

Sources: [shared/billy/runtime.ts:41-103](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/billy/runtime.ts#L41-L103), [shared/gate/schemas.ts:21-60](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L21-L60), [shared/agent-trainer/schemas.ts:93-115](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/agent-trainer/schemas.ts#L93-L115)
<!-- END:AUTOGEN gestaltview_v2_12_current-state-and-glossary_terms -->

---
