<!-- PAGE_ID: gestaltview_v2_11_deployment-infrastructure -->
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
