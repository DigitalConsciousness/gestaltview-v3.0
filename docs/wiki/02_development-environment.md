<!-- PAGE_ID: gestaltview_v2_02_development-environment -->
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
