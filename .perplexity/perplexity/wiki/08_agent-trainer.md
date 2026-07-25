<!-- PAGE_ID: gestaltview_v2_08_agent-trainer -->
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
