<!-- PAGE_ID: gestaltview_v2_01_overview -->
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

`gestaltview-v2` is the public runtime layer for the broader GestaltView ecosystem. The repo explicitly owns the production app surface, Billy interaction flows, authenticated dashboards, exhibit lanes, diligence interfaces, agent-trainer control surfaces, and the repo-local operational scripts and documentation required to run those surfaces coherently. The README also draws a boundary: this repo consumes context from `GestaltView-Official-Compendium`, but it is not the canonical long-memory archive itself.

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
