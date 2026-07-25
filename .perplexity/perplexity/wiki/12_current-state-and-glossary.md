<!-- PAGE_ID: gestaltview_v2_12_current-state-and-glossary -->
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

The README is explicit that `gestaltview-v2` is the live runtime layer, while `GestaltView-Official-Compendium` remains the canonical long-memory corpus and evidence archive. It also lists several active companion repositories, including Insight-Bot, SymbioCoder, Resume Rockstar, and GAICE, and instructs maintainers to document dependencies or handoffs explicitly when a sibling repo is not mounted locally.

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
