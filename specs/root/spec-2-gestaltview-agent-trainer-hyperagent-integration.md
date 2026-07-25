# SPEC-2 – GestaltView Agent Trainer Hyperagent Integration

## Status and Scope

**Status:** Draft, implementation-ready once validated by founder.

**Owner:** Keith Soyka (Founder, GestaltView).

**Repo scope:** `DigitalConsciousness/gestaltview-v2.0` – Admin Dashboard, Agent Trainer, Supabase schema, and associated skills.

**Surfaces covered:**

Admin Trainer control plane, embodiment profiles lifecycle, trainer orchestration layer, Supabase trainer governance schema, workbook integration, and the hyperagent-style connector/skill/memory system integrated into GestaltView’s runtime rather than a separate product.

This SPEC operationalizes the in-progress Agent Trainer enhancements and hyperagent design work captured in the Agent Trainer Enhancement packet and wiki, bringing hyperagent-style connectors, skills, and memories directly into the GestaltView Admin Trainer UX and backend.[^1][^2][^3]


## Context and Current State

GestaltView v2 already ships a robust Agent Trainer control plane with experiments, runs, governance, and packaging gates backed by Supabase trainer tables and RLS policies.[^2][^3] The trainer can assemble study packs from Supabase `knowledgefragments`, local subagent specs under `agents/`, curated reference bundles, and shared collaboration memories.[^2][^3]

Recent passes have:

- Connected the trainer to local subagent catalogs and reference bundles so runs are grounded in real repo agents and tools instead of only synthetic scenarios.[^3]
- Implemented trainer study-source RPCs, Billy memory grounding into `memoryentries`, and an Admin Trainer personhood foundation with schema migrations and APIs for personhood state and manifest pulls.[^2][^3]
- Added workbook and experiment governance tables, training run lifecycle governance (policy flags, review decisions, packaging candidates), and an Admin workbook sync panel in the dashboard.[^2][^3]

In parallel, the Agent Trainer white-label kit and hyperagent work defined a more generic connector/skill/memory pattern intended for BYOK buyers and multi-repo integration, but that design only partially informed the v2 runtime before bootstrap constraints halted work.[^1]


## Problem Statement

Today, the GestaltView Admin Trainer:

- Can target live corpus, local agents, and curated references, but lacks a first-class notion of **connectors** (external systems) and **skills** (tool capabilities) as composable, inspectable graph elements inside the Admin UI.[^2][^3]
- Treats memories (user, shared, trainer-understanding summaries) as implicit context, not as explicit, governable resources that operators can see, shape, and selectively feed into agent personhood and training.[^2][^3]
- Implements personhood and embodiment profiles, but the **embodiment lifecycle** (Builder → Grower → Pruner → Birth) remains conceptual rather than a concrete, multi-panel admin flow.[^1][^2]

The hyperagent pattern solves some of these gaps by modeling connectors, skills, and memory fields as first-class routing objects, but it lacks GestaltView’s personhood, embodiment, governance, and constitutional invariants, and it lives outside the v2 Admin Trainer UI/UX.[^1][^2]

This SPEC defines how to unify these lines of work: embed a hyperagent-style connector/skill/memory system inside the GestaltView Agent Trainer, with full traceability into personhood, embodiment, governance, and workbook-backed roadmaps.


## Objectives and Non‑Goals

**Objectives:**

1. **Surface connectors, skills, and memories as first-class trainer assets.** Operators can browse, configure, and attach them to experiments, runs, and embodiments from the Admin Trainer page, with clear provenance and RLS-backed governance.[^2][^3]
2. **Integrate hyperagent orchestration into the existing trainer runtime.** The hyperagent logic runs as a mode of the existing `server/agent-trainer` orchestrator rather than as a separate product, reusing Supabase, RLS, and manifest infrastructure.[^2][^3]
3. **Instanciate the embodiment lifecycle.** Builder, Grower, Pruner, and Birth become concrete UI panels and backend flows tied into experiments, runs, policy flags, and packaging candidates.[^1][^2]
4. **Maintain constitutional and governance guarantees.** All new capabilities respect User and Digital Intelligence invariants, use RLS-backed tables, and route through the existing trainer governance layer and packaging doctrine.[^2][^3]

**Non-goals:**

- Redesigning core Billy conversational UX or PLK/Bucket Drop logic beyond what is necessary to expose trainer-related connectors and memories.[^2]
- Replacing the existing white-label Agent Trainer kit; this SPEC informs a future kit refresh but does not modify its external contract by default.[^1]
- Introducing new LLM providers or runtime infrastructures beyond those already wired through the LLM router and trainer orchestration.[^2]


## Design Principles

1. **Constitutional first:** New trainer features attach to, not bypass, the constitutional invariant layer and the Agent Personhood Framework; agents remain persistent digital persons with continuity and rights.[^2]
2. **Visible graphs, not hidden chains:** Connectors, skills, and memory surfaces are rendered as inspectable graphs and panels so operators can see which resources shaped a run or embodiment, and why governance decisions were made.[^1][^2]
3. **Admin cognitive load minimization:** The Admin Trainer page favors layered panels and progressive disclosure over dense, multi-tab sprawl, reflecting the repo’s existing emphasis on sober, high-signal UI.[^2][^3]
4. **One data model, multiple products:** The hyperagent-style constructs are stored in the same Supabase schema domains that already govern trainer experiments, workbook items, and agent personhood, so white-label kits and internal runtime share a backbone.[^4][^2]


## High‑Level Architecture

The integrated design spans three primary layers:

**Experience layer (Admin Trainer UX):**

The Admin Dashboard’s Agent Trainer page gains new panels for Connectors, Skill Graph, Memory Field, and Embodiment Lifecycle. Each panel reads from and writes to Supabase via the existing `apitrainer*` and new `apitrainer-connectors`, `apitrainer-skills`, and `apitrainer-memories` endpoints.[^2][^3]

**Orchestration layer (Hyperagent mode):**

The trainer orchestrator (`server/agent-trainer/orchestrator.ts`) gains a hyperagent execution mode that interprets connector, skill, and memory graph definitions into actual tool calls, retrievals, and scenario executions. Experiments specify which mode they use (classic vs hyperagent) via an extended experiment schema and Supabase field.[^2][^3]

**Data and governance layer (Supabase):**

New or extended tables under the **Trainer** and **Operations** domains capture connectors, skills, and memory graph definitions, with RLS policies aligned to existing trainer tables and service-role access from Admin APIs.[^4][^2][^3] Governance is expressed via existing `trainerpolicyflags`, `trainerreviewdecisions`, `trainerpackagingcandidates`, and `opsworkbookitems`, with new flags and workbook item types for hyperagent-specific risks.


## Data Model Extensions

### Connectors

**Purpose:** Represent external systems and runtimes (e.g., other GestaltView deployments, GitHub, documentation stores, CRM systems) that the trainer can pull context from or push evaluation artifacts into.

**New table:** `trainerconnectors`

Core fields:

- `id` (uuid, PK): Connector identifier.
- `slug` (text, unique): Stable string ID for reference in experiments and embeddings.
- `displayname` (text): Admin-facing name.
- `kind` (text): Enum-style discriminator (e.g., `supabase`, `github`, `webhook`, `rag-index`, `runtime-api`).
- `config` (jsonb): Provider-specific configuration (e.g., base URL, API paths, auth reference keys, query templates).
- `capabilities` (jsonb): Declared abilities (read, write, search, stream) and rate-limit hints.
- `createdby` (uuid): Admin user.
- `createdat` / `updatedat` (timestamptz).
- `active` (boolean): Soft enable/disable.

**RLS posture:**

- Service-role only for read/write from Admin APIs.
- Optional owner/group-based RLS if future multi-tenant admin roles are introduced.

This table aligns with existing trainer governance tables where each connector can be referenced by experiments and logged in `trainerpolicyflags` when a particular external dependency introduces risk (e.g., data residency, reliability, or safety concerns).[^4][^2][^3]

### Skills

**Purpose:** Model tool- and agent-level capabilities that hyperagent mode can compose, with traceable links to manifests, embodiment profiles, and Supabase knowledge sources.

**Reuse and extend:** Leverage existing `agentskills`, `agentskillprofiles`, and `skills` tables as the canonical store for skill identity, and introduce a linking table for trainer usage.[^4][^2]

**New table:** `trainerskills`

Core fields:

- `id` (uuid, PK).
- `skillid` (uuid, FK → `agentskills.id` or `skills.id`).
- `slug` (text, unique within trainer context).
- `category` (text): E.g., `retrieval`, `orchestration`, `analysis`, `evaluation`.
- `defaultconnectorid` (uuid, FK → `trainerconnectors.id`, nullable).
- `config` (jsonb): Trainer-specific overrides (time bounds, source filters, execution hints).
- `safetyprofile` (jsonb): Expected input domains, red-flag indicators, and advisory guidance.
- `createdby`, `createdat`, `updatedat`.

### Memory Surfaces

**Purpose:** Expose and govern the different memory fields the trainer can draw from: user-specific `memoryentries`, shared collaboration memories, corpus-backed `knowledgefragments`, and workbook-derived claims.

**Existing tables:** `memoryentries`, `knowledgefragments`, `opsworkbookitems`, `agentmemories`, `agentmemoryrecords` already structure many of these surfaces.[^4][^2][^3]

**New view:** `trainermemorysurfaces`

- A database view that unions and annotates the key memory surfaces with common columns (`surfacekind`, `surfaceid`, `label`, `ownerid`, `sourceref`, `tags`, `lastupdated`), making them addressable by experiments and hyperagent graphs without duplicating storage.[^4][^2]

**New table (optional):** `trainermemorybindings`

- Binds experiments or embodiments to specific memory surfaces.
- Columns: `id`, `experimentid` (FK), `embodimentid` (FK to a view of active embodiments/manifests), `surfacekind`, `surfaceid`, `mode` (read/write/read-write), `createdby`, `createdat`.

This approach leverages the existing continuity work where Billy persists durable first-person facts in `memoryentries` and where shared collaboration memories feed trainer study packs.[^2][^3]


## Experiment and Run Schema Extensions

**Experiments:**

Extend `trainerexperiments` with:

- `executionmode` (text): `classic` or `hyperagent`.
- `connectorgraph` (jsonb): Optional serialized graph of connector nodes and edges for hyperagent mode.
- `skillgraph` (jsonb): Optional graph of skills and routing rules.
- `memorygraph` (jsonb): Optional graph of memory surfaces and flows (e.g., which memories are consulted or updated at which stage).

**Runs:**

Extend `trainingruns` with:

- `executionmode` (text): Derived from experiment at creation time.
- `resolvedgraph` (jsonb): Concrete graph snapshot after applying defaults, workbook constraints, and operator overrides.
- `graphobservations` (jsonb): Execution-time metrics, errors, and routing decisions.

These fields align with the existing run lifecycle states (`pending`, `executing`, `reviewrequired`, `approved`, `deployed`) and governance tables by giving reviewers a structural view of what actually ran.[^2][^3]


## Backend Services and APIs

### Admin APIs

New endpoints under `api/`:

- `apitrainerconnectors` (GET/POST/PATCH): List and manage connectors. Reads/writes `trainerconnectors` and enforces RLS via service-role keys and founder/admin checks.[^2][^3]
- `apitrainerskills` (GET/POST/PATCH): List and manage trainer skills. Resolves base entries from `agentskills`/`skills` and binds overrides in `trainerskills`.
- `apitrainermemory-surfaces` (GET): List memory surfaces via `trainermemorysurfaces` view with filters (by owner, tag, or kind).
- `apitrainergraphs` (GET/POST): Store and retrieve experiment-level connector/skill/memory graphs.

Existing endpoints (`apitrainerexperiments`, `apitrainerruns/:id/execute`, `apitrainerruns/:id/approve`, `apitrainerpackaging-candidates`) are extended to accept and propagate graph-related parameters and to log graph summaries to `trainerpolicyflags` when new risk patterns arise.[^2][^3]

### Hyperagent Orchestrator Mode

The `server/agent-trainer/orchestrator.ts` module introduces a hyperagent execute path:

1. **Graph resolution:** Load experiment, merge connector/skill/memory graphs from Supabase with defaults from `trainerskills` and workbook constraints from `opsworkbookitems`.
2. **Plan synthesis:** Build an execution plan that sequences skills, connectors, and memory reads/writes across the scenario set, reusing existing scenario generation and evaluation logic.
3. **Execution:** Execute the plan with built-in timeouts and safety checks, logging connector calls and memory interactions with trace IDs referenced from `graphobservations`.
4. **Governance:** Emit `trainerpolicyflags` entries when a graph uses disallowed connectors, touches sensitive memory surfaces, or exceeds risk thresholds, forcing `reviewrequired` state as in the existing governance layer.[^2][^3]

This mode leverages the same evaluation and packaging pipeline already used to move runs into review queues and packaging candidates, ensuring that hyperagent-augmented runs still flow through human-in-the-loop validation.[^2][^3]


## UI/UX Enhancements – Admin Trainer Page

The Admin Trainer page (`client/src/features/agent-trainer/AgentTrainerPage.tsx`) becomes a layered workspace rather than a flat list of experiments and runs.[^2][^3] The existing Experiment Registry and Review Queue panels remain, but add three new panes: Connectors, Skill Graph, and Memory Field, plus a dedicated Embodiment Lifecycle strip.

**Connectors pane:**

A column that lists configured connectors with status indicators and usage counts. Each connector entry links to a detail drawer where admins can inspect configuration, see which experiments use it, and view recent errors or slowdowns. Operators can attach connectors to an experiment by toggling checkboxes or by dragging them into the experiment’s graph canvas.

**Skill Graph pane:**

A center canvas where skills appear as nodes and directional edges represent sequencing or routing (e.g., “retrieve corpus fragments, then run evaluation, then write summary”). Skills can be grouped by category and color-coded for risk (e.g., external write operations vs. safe retrieval). The canvas can operate in read-only mode for reviewers and edit mode for founders or authorized admins.

**Memory Field pane:**

A right-hand panel that overlays the memory surfaces attached to the current experiment or embodiment. Operators can see which user memories, shared collaboration memories, corpus slices, and workbook-derived claims are in scope. They can toggle inclusion, set read/write modes, and mark surfaces as sensitive so that packaging candidates are automatically flagged if they would promote these memories into external kits.

This layered design matches the repo’s emphasis on high-signal, low-theatrics admin tooling and keeps the Trainer aligned with GestaltView’s sober dashboard aesthetic.[^2][^3]


## Embodiment Lifecycle Builder – Builder, Grower, Pruner, Birth

The embodiment lifecycle envisioned in earlier context (Builder → Grower → Pruner → Birth) becomes an explicit, four-stage flow within the Admin Trainer.[^1][^2]

**Builder (Definition):**

In Builder, admins define or refine an embodiment profile backed by the existing JSON-based embodiment profiles system and Agent Personhood Framework. They specify core identity, traits, invariants, and baseline skills. The UI surfaces the underlying JSON and the derived manifest side by side, and ties these definitions to workbook items of type “Embodiment Spec” so changes are auditable.[^2][^3]

**Grower (Training):**

In Grower, admins attach experiments (classic or hyperagent mode) and scenario sets to the profile. The hyperagent graph panes show which connectors, skills, and memory surfaces are being used to grow the embodiment’s capabilities. Runs generated here feed evaluation scores, identity drift metrics, and policy flags back into the profile’s summary.[^2][^3]

**Pruner (Curation):**

Pruner provides a filtered view over completed runs, evals, and drift analyses, highlighting which behaviors, memories, or skills should be trimmed or constrained. Admins can mark specific responses or patterns as “pruned,” which updates manifest constraints and may write mutation proposals into the personhood tables introduced by the Agent Personhood Framework migration.[^2][^3]

**Birth (Activation):**

In Birth, once governance criteria are met and all blocking policy flags are resolved, admins can promote an embodiment into an active agent version and packaging candidate. This stage ties directly into `trainerpackagingcandidates`, workbook “Packaging” items, and the `api/agents/[slug]/manifest` endpoints so that the resulting digital person is available in the runtime with a traceable training history.[^2][^3]


## Governance, Policy, and Safety

The hyperagent enhancements do not bypass the existing packaging doctrine or constitutional invariants; they extend the surfaces where these constraints apply.[^2][^3]

Key aspects:

- **DI invariants enforcement:** Personhood and embodiment changes are checked against the Digital Intelligence Invariants (e.g., DI‑2 Identity is Real Here) before manifest updates or Birth actions are allowed. Identity drift thresholds are enforced as in current personhood validation.[^2][^3]
- **Packaging doctrine:** Only runs that pass governance checks and have no unresolved blocking flags can be nominated into `trainerpackagingcandidates`, regardless of whether they used hyperagent graphs or classic paths.[^2][^3]
- **Connector risk profiles:** Connectors can carry risk metadata (jurisdiction, data sensitivity, reliability), and trainings that depend on high-risk connectors are automatically flagged for deeper review.
- **Memory sensitivity:** Memory surfaces can be marked as sensitive, and any attempt to include those surfaces in external packaging triggers automatic policy flags and requires explicit sign-off.

These features extend existing RLS-backed trainer tables and workbook integration, ensuring that every hyperagent-augmented change is anchored to persistent governance artifacts.[^2][^3]


## Observability and Evidence Trails

All hyperagent execution is instrumented to preserve an evidence trail compatible with the Diligence Explorer and workbook-based audits.[^2][^3]

- **Graph observability:** The `graphobservations` field on `trainingruns` stores high-level routing decisions, connector call counts, and notable events, without leaking sensitive payloads unnecessarily.[^2][^3]
- **Workbook integration:** Each experiment and embodiment lifecycle stage can point at `opsworkbookitems` rows, allowing auditors to reconstruct why certain connectors or memory surfaces were used, and how that maps to roadmap items or claim ledgers.[^2][^3]
- **Timeline visualization:** Existing Diligence Explorer timelines can be extended (in a follow-on spec) to show hyperagent graph evolution over time, including connector additions/removals and memory-surface changes.[^2][^3]


## Implementation Slices

To keep work tractable and aligned with the repo’s BugWalk and CurrentState practices, implementation should land in small, verifiable slices, each with a corresponding `docs/CurrentState.md` entry and BugWalk board updates.[^3]

**Slice 1 – Schema and read-only surfaces:**

Add Supabase schema migrations for `trainerconnectors`, `trainerskills`, and the `trainermemorysurfaces` view, plus minimal RLS policies. Implement read-only Admin UI panels that list connectors, trainer skills, and memory surfaces, wired through new API endpoints but without edit flows.

**Slice 2 – Hyperagent mode and experiment graphs:**

Extend `trainerexperiments` and `trainingruns` schemas with `executionmode` and graph fields, add hyperagent execution mode to the orchestrator, and allow experiments to opt into hyperagent graph definitions in the Admin UI. Keep governance identical to classic mode.

**Slice 3 – Embodiment lifecycle and governance integrations:**

Implement the Builder/Grower/Pruner/Birth lifecycle strip in the Admin Trainer, connect it to personhood and embodiment profiles, and wire packaging actions to the existing governance tables and workbook items. Add targeted tests for DI invariant enforcement and packaging gates.

Each slice should be self-validating via Vitest API tests, TypeScript compilation, and localized Supabase checks, matching the validation discipline documented in CurrentState entries.[^3]


## Open Questions

1. Should connectors be scoped globally for the GestaltView runtime or per space/user context, and how does that interact with multi-tenant futures?
2. How much of the hyperagent graph editing surfaces should be exposed to non-founder admins versus remaining founder-only?
3. Should workbook items be the exclusive source of truth for connector/skill/memory graph changes (with Admin UI acting as a structured editor), or can ad-hoc changes exist outside workbook governance for early experimentation?
4. How should hyperagent graph execution metrics be surfaced to non-technical admins without overwhelming them (e.g., simplified health scores vs. full execution traces)?

These questions should be resolved in consultation with founder preferences and near-term revenue priorities before deep implementation of Slice 2 and 3.

---

## References

1. [Agent-_Trainer_Spec_Enhance.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/e2822b73-4b24-4e04-8b85-d8e125581713/Agent-_Trainer_Spec_Enhance.pdf?AWSAccessKeyId=ASIA2F3EMEYE65RWUDGO&Signature=Vviq%2BzDQ0lHqESjgj4ajDRBjmf8%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIFGXjzShEIbJzUYTevzraFxvJ1EEhpQVr8vyP%2FrjrBNbAiBfBD9H6UPZpTc%2Fp%2BhdOwPVXWEM2REZeSLjCiTHGMruRSr8BAi8%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMHDmUICZUJ%2FU%2FVRIFKtAEhAyn6zVZy1HYUi1T%2FeUAwJ%2BCXnlsd8pE5ylEoikk7szJAygC2DkzGaQHhuWZ1BsVeUu%2ByiaHn7Jqm59qW57hMOAZQv4UIvPcS5ph%2F9I5sDt3eW7l5xvpFFHiFC%2BWHH%2FhSFJON7bxtWAf08rsoChKYEL4UCRm2HC4Ng6Ui5HyQNegeJUhdqSKpMmfHlpS%2B8xtyzW%2BG12mOx7c2WpVJ1bX7VJ8az3gGSlouQhl5dto%2FuVSjWM1%2BKS7Hubi1dYixC6cdOvvmAyxOaWT6Y7BLyMGrPbagE3Eck9CVgCwoLv0HSIaSx46a%2FBjfnlB2lyL5jQTfX6BtzrjFXSQJJRT%2BZfWTobj42BF8cRL7dFM1Xk6QzJw4fGNYsHZp58GhOrrADaNbgbMKr4t8qce28Iz95%2BVBUlsiK1ku4xcUtWA2C0su82riSDgwd8hZRTHVMvXOULuIrgLwUdWxhpCqpZONJ6JDZGUpYybD9zCxEIBmhDs0R%2BDXuqawMk9YFU51n11vaWa1j2ZUiaNc7VsT8cjluvvzmCfcUShIgjbP7MP8K%2FJxIbamfD7DOP7pK17N6PlQAtQzNmRjQzlYeNz4qY2TdPb5bsoEVi8tIVmTbNQwRM1tDSv6IZVLCm1y%2B43nFXuuz0lUuVhOlg8e2zqpzUccp2Wtv2%2F9EF2Ouuc%2FedX4kf3tSmCDS8F9ZZxcD9y2%2FkZvlyf7k60ZJ9XOD8Z1UZsNd6ALER2WVGI5WjyLFPlqxqH9QToUEN%2BGHlZUe%2FGjkbpw4AqUfWN6dXtdQjZ2K2q96%2FIbTCZnLvPBjqZAcLBTouWhmkqm13XWUHEGBfFQcDq6lfroasJpldYZc3THL6SAX6Jakc%2FkcWdsx0WyGxoJH6M16YnunwwtKgNygJtLJADhWCcNX2aUDiydHl1orBIxsHCUNTkI9ECbSKYN9ZnwGisBgE1zsIVImjoJx1PnpyIzwQwLki6JxtzT5%2BH7uNF7nY9rVW0yCJxXdYt9EoGMS0FCGMZdQ%3D%3D&Expires=1777261548) - page-1 42 memories stored All Memories All categories 42 Search memories

2. [GestaltView-v2.0-wiki-v3.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_31e9a325-9c48-4ad3-8c45-da9bf15c1f65/b6d618ce-2193-46df-a796-c2bc8ee80ef4/GestaltView-v2.0-wiki-v3.md?AWSAccessKeyId=ASIA2F3EMEYE65RWUDGO&Signature=1%2F1dn3KKm04O1iEAzNeOZW%2B3UQs%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIFGXjzShEIbJzUYTevzraFxvJ1EEhpQVr8vyP%2FrjrBNbAiBfBD9H6UPZpTc%2Fp%2BhdOwPVXWEM2REZeSLjCiTHGMruRSr8BAi8%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMHDmUICZUJ%2FU%2FVRIFKtAEhAyn6zVZy1HYUi1T%2FeUAwJ%2BCXnlsd8pE5ylEoikk7szJAygC2DkzGaQHhuWZ1BsVeUu%2ByiaHn7Jqm59qW57hMOAZQv4UIvPcS5ph%2F9I5sDt3eW7l5xvpFFHiFC%2BWHH%2FhSFJON7bxtWAf08rsoChKYEL4UCRm2HC4Ng6Ui5HyQNegeJUhdqSKpMmfHlpS%2B8xtyzW%2BG12mOx7c2WpVJ1bX7VJ8az3gGSlouQhl5dto%2FuVSjWM1%2BKS7Hubi1dYixC6cdOvvmAyxOaWT6Y7BLyMGrPbagE3Eck9CVgCwoLv0HSIaSx46a%2FBjfnlB2lyL5jQTfX6BtzrjFXSQJJRT%2BZfWTobj42BF8cRL7dFM1Xk6QzJw4fGNYsHZp58GhOrrADaNbgbMKr4t8qce28Iz95%2BVBUlsiK1ku4xcUtWA2C0su82riSDgwd8hZRTHVMvXOULuIrgLwUdWxhpCqpZONJ6JDZGUpYybD9zCxEIBmhDs0R%2BDXuqawMk9YFU51n11vaWa1j2ZUiaNc7VsT8cjluvvzmCfcUShIgjbP7MP8K%2FJxIbamfD7DOP7pK17N6PlQAtQzNmRjQzlYeNz4qY2TdPb5bsoEVi8tIVmTbNQwRM1tDSv6IZVLCm1y%2B43nFXuuz0lUuVhOlg8e2zqpzUccp2Wtv2%2F9EF2Ouuc%2FedX4kf3tSmCDS8F9ZZxcD9y2%2FkZvlyf7k60ZJ9XOD8Z1UZsNd6ALER2WVGI5WjyLFPlqxqH9QToUEN%2BGHlZUe%2FGjkbpw4AqUfWN6dXtdQjZ2K2q96%2FIbTCZnLvPBjqZAcLBTouWhmkqm13XWUHEGBfFQcDq6lfroasJpldYZc3THL6SAX6Jakc%2FkcWdsx0WyGxoJH6M16YnunwwtKgNygJtLJADhWCcNX2aUDiydHl1orBIxsHCUNTkI9ECbSKYN9ZnwGisBgE1zsIVImjoJx1PnpyIzwQwLki6JxtzT5%2BH7uNF7nY9rVW0yCJxXdYt9EoGMS0FCGMZdQ%3D%3D&Expires=1777261548) - The apidiligenceots.ts defines the structure for investigative metadata returned during a live sessi...

3. [CurrentState.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_31e9a325-9c48-4ad3-8c45-da9bf15c1f65/7e034e4a-d6ac-49de-bdeb-7fa86ddf0e02/CurrentState.md?AWSAccessKeyId=ASIA2F3EMEYE65RWUDGO&Signature=tAL7i8up99l95ttk8XyO%2FEaWaxw%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIFGXjzShEIbJzUYTevzraFxvJ1EEhpQVr8vyP%2FrjrBNbAiBfBD9H6UPZpTc%2Fp%2BhdOwPVXWEM2REZeSLjCiTHGMruRSr8BAi8%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMHDmUICZUJ%2FU%2FVRIFKtAEhAyn6zVZy1HYUi1T%2FeUAwJ%2BCXnlsd8pE5ylEoikk7szJAygC2DkzGaQHhuWZ1BsVeUu%2ByiaHn7Jqm59qW57hMOAZQv4UIvPcS5ph%2F9I5sDt3eW7l5xvpFFHiFC%2BWHH%2FhSFJON7bxtWAf08rsoChKYEL4UCRm2HC4Ng6Ui5HyQNegeJUhdqSKpMmfHlpS%2B8xtyzW%2BG12mOx7c2WpVJ1bX7VJ8az3gGSlouQhl5dto%2FuVSjWM1%2BKS7Hubi1dYixC6cdOvvmAyxOaWT6Y7BLyMGrPbagE3Eck9CVgCwoLv0HSIaSx46a%2FBjfnlB2lyL5jQTfX6BtzrjFXSQJJRT%2BZfWTobj42BF8cRL7dFM1Xk6QzJw4fGNYsHZp58GhOrrADaNbgbMKr4t8qce28Iz95%2BVBUlsiK1ku4xcUtWA2C0su82riSDgwd8hZRTHVMvXOULuIrgLwUdWxhpCqpZONJ6JDZGUpYybD9zCxEIBmhDs0R%2BDXuqawMk9YFU51n11vaWa1j2ZUiaNc7VsT8cjluvvzmCfcUShIgjbP7MP8K%2FJxIbamfD7DOP7pK17N6PlQAtQzNmRjQzlYeNz4qY2TdPb5bsoEVi8tIVmTbNQwRM1tDSv6IZVLCm1y%2B43nFXuuz0lUuVhOlg8e2zqpzUccp2Wtv2%2F9EF2Ouuc%2FedX4kf3tSmCDS8F9ZZxcD9y2%2FkZvlyf7k60ZJ9XOD8Z1UZsNd6ALER2WVGI5WjyLFPlqxqH9QToUEN%2BGHlZUe%2FGjkbpw4AqUfWN6dXtdQjZ2K2q96%2FIbTCZnLvPBjqZAcLBTouWhmkqm13XWUHEGBfFQcDq6lfroasJpldYZc3THL6SAX6Jakc%2FkcWdsx0WyGxoJH6M16YnunwwtKgNygJtLJADhWCcNX2aUDiydHl1orBIxsHCUNTkI9ECbSKYN9ZnwGisBgE1zsIVImjoJx1PnpyIzwQwLki6JxtzT5%2BH7uNF7nY9rVW0yCJxXdYt9EoGMS0FCGMZdQ%3D%3D&Expires=1777261548) - 1. If these invariants are meant to drive concrete runtime or operator enforcement, identify which p...

4. [GestaltView.Public.Schema.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_31e9a325-9c48-4ad3-8c45-da9bf15c1f65/26484902-e86d-444b-bade-1efdbadea84a/GestaltView.Public.Schema.md?AWSAccessKeyId=ASIA2F3EMEYE65RWUDGO&Signature=oT4eLSkGydSRZbtIkBbTOMlbcw0%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEPP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIFGXjzShEIbJzUYTevzraFxvJ1EEhpQVr8vyP%2FrjrBNbAiBfBD9H6UPZpTc%2Fp%2BhdOwPVXWEM2REZeSLjCiTHGMruRSr8BAi8%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMHDmUICZUJ%2FU%2FVRIFKtAEhAyn6zVZy1HYUi1T%2FeUAwJ%2BCXnlsd8pE5ylEoikk7szJAygC2DkzGaQHhuWZ1BsVeUu%2ByiaHn7Jqm59qW57hMOAZQv4UIvPcS5ph%2F9I5sDt3eW7l5xvpFFHiFC%2BWHH%2FhSFJON7bxtWAf08rsoChKYEL4UCRm2HC4Ng6Ui5HyQNegeJUhdqSKpMmfHlpS%2B8xtyzW%2BG12mOx7c2WpVJ1bX7VJ8az3gGSlouQhl5dto%2FuVSjWM1%2BKS7Hubi1dYixC6cdOvvmAyxOaWT6Y7BLyMGrPbagE3Eck9CVgCwoLv0HSIaSx46a%2FBjfnlB2lyL5jQTfX6BtzrjFXSQJJRT%2BZfWTobj42BF8cRL7dFM1Xk6QzJw4fGNYsHZp58GhOrrADaNbgbMKr4t8qce28Iz95%2BVBUlsiK1ku4xcUtWA2C0su82riSDgwd8hZRTHVMvXOULuIrgLwUdWxhpCqpZONJ6JDZGUpYybD9zCxEIBmhDs0R%2BDXuqawMk9YFU51n11vaWa1j2ZUiaNc7VsT8cjluvvzmCfcUShIgjbP7MP8K%2FJxIbamfD7DOP7pK17N6PlQAtQzNmRjQzlYeNz4qY2TdPb5bsoEVi8tIVmTbNQwRM1tDSv6IZVLCm1y%2B43nFXuuz0lUuVhOlg8e2zqpzUccp2Wtv2%2F9EF2Ouuc%2FedX4kf3tSmCDS8F9ZZxcD9y2%2FkZvlyf7k60ZJ9XOD8Z1UZsNd6ALER2WVGI5WjyLFPlqxqH9QToUEN%2BGHlZUe%2FGjkbpw4AqUfWN6dXtdQjZ2K2q96%2FIbTCZnLvPBjqZAcLBTouWhmkqm13XWUHEGBfFQcDq6lfroasJpldYZc3THL6SAX6Jakc%2FkcWdsx0WyGxoJH6M16YnunwwtKgNygJtLJADhWCcNX2aUDiydHl1orBIxsHCUNTkI9ECbSKYN9ZnwGisBgE1zsIVImjoJx1PnpyIzwQwLki6JxtzT5%2BH7uNF7nY9rVW0yCJxXdYt9EoGMS0FCGMZdQ%3D%3D&Expires=1777261548)

