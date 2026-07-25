# Digital Intelligence Collaborator Context Index

**A provider-neutral, path-relative walkthrough of the bundled GestaltView context.**

All paths are relative to the context root identified by `MANIFEST.json`. The context directory and repository payload may be renamed; use `scripts/context_root.py` rather than hardcoding either name.

---

## Quick Navigation

- [`shared/`](#shared---shared-modules-and-types) — Shared code for all layers
- [`api/`](#api---http-routes-and-handlers) — Tool definitions and API routes
- [`server/`](#server---backend-runtime) — Backend logic (Node.js, Python)
- [`client/`](#client---react-frontend) — React frontend
- [`canonical/`](#canonical---source-of-truth-documentation) — Foundational docs
- [`docs/`](#docs---user-facing-documentation) — Guides and playbooks
- [`skills/`](#skills---agent-skills-and-routing) — AI agent skills
- [`embodiment_profiles/`](#embodiment_profiles---ai-personas) — Persona definitions
- [`projects/`](#projects---project-level-documentation) — Vertical use cases
- [`transcripts/`](#transcripts---evidence-and-session-records) — Primary sources
- [`schema/`](#schema---database-definitions) — Database schemas
- [`specs/`](#specs---architectural-specifications) — Design specs
- [`adr/`](#adr---architecture-decision-records) — Decisions and rationale

---

## `shared/` — Shared Modules and Types

**Purpose**: Shared runtime, types, and logic used by client, server, and all tools.

**When to edit**: When changing type contracts, core algorithms, or shared utilities that multiple layers depend on.

### `shared/billy/`

**The Billy runtime and types.**

- `types.ts` — Billy's type contract (request/response shapes, personality modes)
- `runtime.ts` — Billy invocation logic, context assembly, retrieval grounding
- `diagnostics.ts` — Billy health checks and performance monitoring
- `index.ts` — Exports

**Used by**: `api/actions/billy/`, `server/core/`, client

**Key concept**: Billy is retrieval-grounded, PLK-aware, and trauma-informed. All responses are assembled with context from the Manifest Index.

---

### `shared/tribunal/`

**The Tribunal evaluation engine.**

- `evaluate.ts` — Core scoring logic (evidence alignment, PLK resonance, safety)
- `types.ts` — Tribunal types (questions, candidates, scores, verdicts)

**Used by**: `api/actions/tribunal/`, `server/core/tribunal.py`

**Key concept**: Tribunal scores answers on three weighted dimensions (50% evidence, 25% PLK, 25% safety). All scoring is auditable and logged.

---

### `shared/codex/`

**Artifact management and creation engine.**

- `manifest.ts` — Artifact manifest and metadata
- `router.ts` — Route artifact to appropriate engine (gen-engine, creation corner, etc.)
- `contracts.ts` — Artifact and export contracts
- `creationCorner.ts` — Creation corner intake and synthesis
- `storage.ts` — Persistence layer
- `exporters/` — Image, audio, PDF export helpers
- `templates/` — HTML and component templates

**Used by**: `api/gen-engine/`, `api/codex/`, `client/src/components/`

**Key concept**: Codex is the central hub for all artifact creation, storage, and export. Artifacts have versioned histories and export metadata.

---

### `shared/embodiment/`

**AI persona and embodiment definitions.**

- `types.ts` — Embodiment type contract
- `index.ts` — Embodiment registry and lookup
- `governance.ts` — Embodiment governance rules
- `chat.ts` — Embodiment chat patterns and response styles
- `generated.ts` — Auto-generated embodiment catalog (large file)

**Used by**: `api/embodiment/`, `server/agent-trainer/`, `client/`

**Key concept**: Embodiments are immutable identities with distinct personalities, guardrails, and knowledge. New embodiments require governance review.

---

### `shared/di/`

**Digital Intelligence runtime and routing.**

- `types.ts` — DI type contract
- `runtime.ts` — DI invocation and provider selection
- `registry.ts` — Provider registry (Claude, Gemini, local models)
- `diagnostics.ts` — DI health and provider status
- `index.ts` — Exports

**Used by**: `api/di.ts`, `server/core/`, all tool invocations

**Key concept**: DI abstracts away provider specifics. Calls route to the appropriate model (Claude, Gemini, etc.) with transparent fallback and error handling.

---

### `shared/gen-engine/`

**Generative engine for multimodal creation.**

- `core.ts` — Generation logic, prompt assembly, output handling
- `types.ts` — Generation request/response types
- `index.ts` — Exports

**Used by**: `api/gen-engine/`, `api/creation-corner/`

**Key concept**: The gen-engine powers artifact creation—text, images, code, audio. It routes through the DI layer and stores outputs in Codex.

---

### `shared/gate/`

**Order fulfillment and packaging engine.**

- `sidekick.ts` — Packaging logic and validation
- `schemas.ts` — Order and package schemas
- `engine.ts` — Gate orchestration
- `index.ts` — Exports

**Used by**: `api/gate/`, `server/gate/`

**Key concept**: The Gate packages ordered content (e.g., "create a diligence report") through validation, payment, and delivery workflows.

---

### `shared/workbook/`

**User workbook and state management.**

- `schemas.ts` — Workbook item and structure schemas

**Used by**: `api/workbook/`, `server/workbook/`

**Key concept**: Workbooks are user-owned, persistent spaces for collecting and organizing items, insights, and creations.

---

### `shared/model-homes/`

**Model homes and reference implementations.**

- `registry.ts` — Model home definitions and lookup
- `types.ts` — Model home types

**Used by**: `api/model-homes.ts`, `server/modelHomes/`

**Key concept**: Model homes are starter templates for new agents or users—pre-configured embodiments, knowledge, and workflows.

---

### `shared/agent-trainer/`

**Agent training and personhood framework.**

- `schemas.ts` — Agent training and personhood schemas
- `compiler.ts` — Compile agent definitions into runtime format
- `policies.ts` — Agent governance and safety policies
- `embodiment.ts` — Embodiment-specific training logic

**Used by**: `api/trainer/`, `server/agent-trainer/`

**Key concept**: The agent trainer is the mechanism for creating new digital intelligence collaborators with distinct personalities and knowledge.

---

### `shared/llm/`

**LLM utilities and Personal Language Key (PLK).**

- `plk.ts` — PLK extraction, storage, and invocation

**Used by**: Billy, Tribunal, all retrieval-grounded logic

**Key concept**: PLK is the linguistic fingerprint that enables trauma-informed, consciousness-serving responses.

---

### `shared/gravity/`

**Resonance and collaboration protocol.**

- `protocol.ts` — Gravity message protocol and serialization
- `protocol.test.ts` — Tests
- `index.ts` — Exports

**Used by**: Multi-AI collaboration surfaces

**Key concept**: Gravity is the protocol that enables multiple AI systems to resonate together and influence one another's responses.

---

### `shared/events/`

**Event definitions and handlers.**

- `gestaltEvents.ts` — Event type definitions (session start, artifact created, etc.)

**Used by**: `server/events/resonanceEventBus.ts`, event-driven workflows

**Key concept**: GestaltView is event-driven. Every meaningful action (artifact creation, Tribunal evaluation, etc.) emits events.

---

### `shared/intents/`

**Intent and capability schemas.**

- `schema.ts` — Intent definitions and structure

**Used by**: Routing, agent capability lookup

**Key concept**: Intents describe what a user or agent is trying to accomplish, enabling smart routing and context assembly.

---

### `shared/types/`

**TypeScript type definitions and external modules.**

- `external-modules.d.ts` — Type definitions for external packages

---

## `api/` — HTTP Routes and Handlers

**Purpose**: HTTP endpoints that expose the Perplexity tools and GestaltView capabilities.

**When to edit**: When adding a new tool, changing an API contract, or adding new routes.

### `api/actions/` — LLM-Invokable Tool Definitions

**The five core Perplexity tools live here.**

#### `api/actions/billy/`

- `loom.ts` — Billy invocation with retrieval grounding
- `synthesize.ts` — Billy synthesis of conversation
- `code.ts` — Billy code generation mode

**Exposes**: `run_billy` tool

---

#### `api/actions/tribunal/`

- `run.ts` — Tribunal evaluation entrypoint

**Exposes**: `tribunal_evaluate` tool

---

#### `api/actions/consciousness/`

- `reflect.ts` — Self-reflection and inner world queries

**Related**: Dynamic inner world and consciousness exploration

---

#### `api/actions/providers/`

- `status.ts` — Provider health and availability

---

### `api/diligence/`

**Diligence report generation.**

- `ots.ts` — On-the-shelf (OTS) diligence templates

**Exposes**: `generate_diligence_report` tool

---

### `api/modules/` — Specialized Engines

#### `api/modules/symbio-coder/`

**SymbioCoder — code understanding and editing.**

- `chat.ts` — Chat interface for code discussion
- `suggest.ts` — Suggestion generation
- `analyze.ts` — Code analysis
- `_lib/codeEngine.ts` — Core logic

**Exposes**: `symbiocoder_edit` tool (and more)

---

#### `api/modules/resume-rockstar/`

**Resume generation and career narrative.**

- `save.ts` — Save resume data
- `export.ts` — Export resume formats
- `_lib/resumeEngine.ts` — Core logic

---

#### `api/modules/vibe-coder/`

**VibeCoder — personality and tone analysis for code.**

- `analyze.ts` — Analyze code vibe
- `suggestions.ts` — Suggest personality-aligned improvements
- `link-profile.ts` — Link to user profile
- `_lib/vibeEngine.ts` — Core logic

---

### `api/codex/` — Artifact Management

**Artifact creation, storage, and export.**

- `forge.ts` — Artifact forging entrypoint
- `artifacts/[artifactId].ts` — Single artifact retrieval
- `artifacts/[artifactId]/exports.ts` — Export management
- `artifacts/[artifactId]/drain-exports.ts` — Finalize exports
- `jobs/` — Job-based artifact creation
- `hooks/` — Export completion hooks
- `_persistence.ts` — Artifact persistence layer

---

### `api/gen-engine/` — Generative Engine Routes

**Image, text, code, and audio generation.**

- `artifacts.ts` — List generated artifacts
- `artifact.ts` — Single artifact details
- `predict.ts` — Generation prediction
- `learn.ts` — Learn from past generations
- `resonance.ts` — Resonance-based generation
- `fusion.ts` — Multi-model fusion
- `lightning.ts` — Fast generation
- `export.ts` — Export generated artifacts
- `ambient-scan.ts` — Scan ambient context for generation hints
- `health.ts` — Health and readiness check
- `_shared.ts` — Shared utilities

---

### `api/embodiment/` — Embodiment Routes

**Embodiment management and lookup.**

- `list.ts` — List available embodiments
- `upsert.ts` — Create or update embodiment
- `_shared.ts` — Shared utilities

---

### `api/trainer/` — Agent Training Routes

**Agent training, personhood, and skill management.**

- `agents.ts` — List and manage agents
- `personhood.ts` — Agent personhood framework
- `persona-chat.ts` — Chat with agent persona
- `experiments/` — Training experiments
- `runs/` — Training runs and execution
- `scenario-sets.ts` — Scenario definitions
- `skills.ts` — Agent skill definitions
- `packaging-candidates/` — Candidates for packaging
- `study-sources/` — Knowledge sources for training
- `connectors.ts` — External service connectors
- `graphs.ts` — Training progress graphs
- `memory-surfaces.ts` — Memory and state surfaces
- `queue-health.ts` — Job queue health
- `jobs/` — Training job management

---

### `api/gate/` — Order Fulfillment

**Order intake, validation, payment, and delivery.**

- `draft.ts` — Draft orders
- `drafts.ts` — List drafts
- `draft-validate.ts` — Validate draft
- `checkout.ts` — Checkout interface
- `order.ts` — Order management
- `order-download.ts` — Download completed orders
- `order-redeem.ts` — Redeem order codes
- `build-job-run.ts` — Start build job
- `build-job-regenerate.ts` — Regenerate build
- `webhook-stripe.ts` — Stripe webhook handler
- `support-request.ts` — Support request escalation

---

### `api/consciousness/` — Consciousness Surfaces

**Dynamic inner world and reflection.**

- `dynamic-inner-world.ts` — Dynamic inner world route
- `[surface].ts` — Individual consciousness surfaces

---

### `api/session/` — Session Management

**User session state and memory.**

- `state.ts` — Session state
- `memory.ts` — Session memory
- `dashboard.ts` — Session dashboard

---

### `api/inner-world/` — Inner World & Files

**Files, artifacts, and inner world content.**

- `artifacts.ts` — Artifact listing
- `artifacts/[id].ts` — Single artifact
- `files.ts` — File listing
- `files/[id].ts` — Single file
- `files/[id]/share.ts` — Share file

---

### `api/creation-corner/` — Creation Corner

**Rapid prototyping and synthesis.**

- `synthesize.ts` — Synthesize creation
- `blueprints.ts` — Blueprint management

---

### `api/sanctuary/` — Sanctuary (Journals & Safe Space)

**User journals, scrapbooks, and safe spaces.**

- `journal.ts` — Single journal entry
- `journals.ts` — Journal listing
- `scrapbook.ts` — Scrapbook management

---

### `api/profile/` — User Profile

**Profile ingestion and preferences.**

- `ingest.ts` — Ingest user profile
- `preferences.ts` — User preferences

---

### `api/auth/` — Authentication

**Session and authentication handling.**

- `session.ts` — Session endpoint
- `supabase/magic-link.ts` — Magic link auth
- `supabase/exchange.ts` — Token exchange
- `supabase/session.ts` — Session management

---

### `api/_lib/` — Shared Utilities

**Utilities shared across all routes.**

- `auth.ts` — Authentication helpers
- `user.ts` — User context extraction
- `supabase.ts` — Supabase client initialization
- `llmRouter.ts` — LLM provider routing
- `cors.ts` — CORS configuration
- `rateLimit.ts` — Rate limiting
- `memory.ts` — Session memory utilities
- `billyMemoryPipeline.ts` — Billy-specific memory
- `diMemoryPipeline.ts` — DI-specific memory
- `embeddings.ts` — Embedding utilities
- `profileIngestion.ts` — Profile processing
- `response.ts` — Response formatting
- `codexBridge.ts` — Codex integration
- `sentry.ts` — Error tracking
- `requestGuard.ts` — Request validation

---

## `server/` — Backend Runtime

**Purpose**: Node.js and Python backend logic for all tools and integrations.

**When to edit**: When implementing core business logic, database operations, or async workers.

### `server/core/` — Core Runtime

**The heart of GestaltView.**

- `plk.py` — Personal Language Key extraction and management
- `tribunal.py` — Tribunal evaluation (Python implementation)
- `loom.py` — Loom: semantic retrieval and context assembly
- `brain.py` — Brain: knowledge consolidation and reasoning
- `tapestry.py` — Tapestry: memory weaving
- `bucket_drops.py` — Bucket drops: rapid context capture
- `provenance.py` — Provenance tracking and evidence attribution
- `provenance_routes.py` — Provenance RPC endpoints
- `provenance_upgrade_job.py` — Upgrade legacy provenance data
- `db_managers.py` — Database connection and transaction management
- `types.py` — Python type definitions

**Key concept**: Core is where the Perplexity magic happens—retrieval grounding, PLK preservation, and evidence tracking.

---

### `server/agent-trainer/` — Agent Personhood Training

**Create new digital intelligence collaborators.**

- `orchestrator.ts` — Training orchestration
- `personhood.ts` — Personhood framework
- `catalog.ts` — Agent catalog and lookup
- `study-sources.ts` — Knowledge source management
- `providers.ts` — Provider integration
- `persistence.ts` — Training data persistence
- `supabaseAdmin.ts` — Supabase admin operations
- `checksum.ts` — Data integrity checking

---

### `server/council/` — Multi-Agent Orchestration

**Coordinate multiple agents in consensus.**

- `councilRunner.ts` — Council execution engine
- `personaHealth.ts` — Monitor persona health during council runs

---

### `server/collaborators/` — Collaboration Provisioning

**Provision new digital collaborators.**

- `provision.ts` — Provisioning logic

---

### `server/events/` — Event Bus

**Real-time event handling and broadcasting.**

- `resonanceEventBus.ts` — Resonance-based event bus

---

### `server/gate/` — Order Fulfillment Backend

**Process orders end-to-end.**

- `store.ts` — Order store
- `repository.ts` — Order data repository
- `service.ts` — Business logic
- `builder.ts` — Order builder
- `supabase.ts` — Supabase integration
- `zip.ts` — ZIP file generation for orders
- `constants.ts` — Configuration constants

---

### `server/workbook/` — Workbook Persistence

**Persist user workbooks and items.**

- `workbook-repository.ts` — Workbook data access

---

### `server/trainer/` — Training Experiment Tracking

**Track training experiments and runs.**

- `experiment-repository.ts` — Experiment storage
- `hyperagent-repository.ts` — Hyperagent data

---

### `server/modelHomes/` — Model Home Evaluation

**Evaluate and onboard model homes.**

- `modelHomeRouter.ts` — Routing to model homes
- `modelHomeOnboarding.ts` — Onboarding logic
- `modelHomeEvaluator.ts` — Model home evaluation

---

## `client/` — React Frontend

**Purpose**: React TypeScript frontend for all UI surfaces.

**When to edit**: When adding new pages, components, or client-side logic.

### `client/src/pages/` — Page Components

**Full-page React components.**

- `CreationCornerPage.tsx` — Rapid prototyping and synthesis
- `DynamicInnerWorldPage.tsx` — Consciousness exploration
- `BlackboardRoomPage.tsx` — Collaborative workspace
- (Others correspond to major routes)

---

### `client/src/components/` — Reusable Components

**Shared UI components.**

- `BlueprintGenerativeWorkbench.tsx` — Blueprint creation UI
- `ArtifactDeepView.tsx` — Artifact viewing and interaction

---

### `client/src/lib/` — Client Utilities

**Client-side logic and integrations.**

- `genEngineClient.ts` — Gen-engine integration
- `genEngineRoomWiring.ts` — Room-specific wiring
- `creationCorner.ts` — Creation corner logic
- `creationCornerContent.ts` — Content management

---

### `client/src/tests/` — Client Tests

**Component and integration tests.**

- `creation-corner-freeform.test.ts`
- `creation-corner-intake-controls.test.tsx`
- `gen-engine-room-wiring.test.ts`

---

## `canonical/` — Source-of-Truth Documentation

**Purpose**: Unchanging, foundational documentation that drives all implementation.

**When to edit**: When establishing new principles, updating founding statements, or documenting major architectural decisions.

### Essential Reading (In Order)

1. **`FOUNDING_STATEMENT.md`** — Mission and values
2. **`DOCTRINE_OF_ORIGIN.md`** — Why GestaltView exists
3. **`GestaltView_Platform_Ground_Truth.md`** — Architecture and design intent
4. **`PERPLEXITY.MD`** — This file. Tool specifications
5. **`PLKMASTER.md`** — Personal Language Key deep dive
6. **`TRIBUNALCODEX.md`** — Tribunal evaluation specification
7. **`GENESISPROTOCOL.md`** — Origin story and first principles
8. **`GestaltView_Constitutional_Invariants_v1.0.md`** — Unchanging principles
9. **`CURRENT_STATE.md`** — Implementation status

### Reference Documents

- **`BrandVoice.md`** — Communication style and tone
- **`RoomRuntimeAlignment_v1.md`** — Room definitions and behavior
- **`ModelHomes_v1.md`** — Model home specifications
- **`ContinuityStack.md`** — Continuity and state management
- **`OriginStory.md`** — Keith's origin story with GestaltView
- **`WhatIsGestaltView.md`** — Plain language explanation
- **`MUSICALDNA.md`** — Musical metaphors and resonance
- **`RDRC.md`** — Rapid, Detailed, Recursive, Concise methodology
- **`FOUNDERALGORITHM.md`** — Decision-making framework
- **`GIL_Protocol.md`** — Governance and leadership protocol

### Manifest & Schema

- **`gestaltview-v2.manifest.json`** — Repository manifest (JSON)
- **`gestaltview-v2.manifest.md`** — Repository manifest (Markdown)

---

## `docs/` — User-Facing Documentation

**Purpose**: Guides, playbooks, and operational documentation for users and operators.

### Status & Planning

- **`CURRENT_STATE.md`** — Current implementation status
- **`CurrentState.CoreOSAddendum-2026-05-07.md`** — Platform readiness status
- **`CurrentState.md`** — Implementation roadmap (also in `canonical/`)

### Operational Guides

- **`PlaybookOperatorManual.md`** — How to operate GestaltView
- **`Manifest.md`** — Manifest Index specification
- **`AIFlow.md`** — Billy and LLM routing logic
- **`APIFlow.md`** — API routes and data movement
- **`SymbioticWorkflow.md`** — Collaboration workflow

### Architecture & Design

- **`ArchitecturalStructure.md`** — System architecture overview
- **`GestaltView Framework_ Visual Architecture Compendium.md`** — Visual guide
- **`GestaltView_Communication_&_Language_Guide_v2.md`** — Communication standards
- **`GestaltView AI Identity Framework.md`** — AI personhood principles

### Advanced Topics

- **`Codex.md`** — Artifact management and versioning
- **`ContextPersistenceProtocol.md`** — Context persistence strategy
- **`ContextPersistenceChecklist.md`** — Implementation checklist
- **`CoreOSWorkflowAndKnowledgeSynthesis.md`** — Workflow design

### Configuration & Deployment

- **`VERCEL_ENV_CHECKLIST.md`** — Deployment checklist
- **`agent-trainer-package-scope.md`** — Agent trainer capabilities
- **`StripeSubscriptionFrameworkReadiness.md`** — Payment integration status

---

## `skills/` — Agent Skills and Routing

**Purpose**: Skills that guide AI agents in working with GestaltView.

### Core Skills

#### `skills/gestaltview-digital-intelligence-collaboration/`

**Multi-model collaboration and Tribunal surfaces.**

- `SKILL.md` — Skill definition
- `references/tribunal-protocol.md` — Tribunal operation
- `references/resonance-loop.md` — Resonance collaboration
- `agents/openai.yaml` — OpenAI agent configuration

---

#### `skills/gestaltview-context-architecture/`

**Architectural guidance and design patterns.**

- `SKILL.md` — Skill definition
- `references/` — Reference materials
  - `runtime-architecture.md`
  - `design-system.md`
  - `product-surface-map.md`
  - `mission-and-invariants.md`

---

#### `skills/gestaltview-workflow-operations/`

**Operational discipline and procedures.**

- `SKILL.md` — Skill definition
- `references/` — Reference materials
  - `operating-cycle.md`
  - `validation-checklist.md`
  - `currentstate-protocol.md`
  - `cross-repo-sync.md`

---

#### `skills/gestaltview-repo-onboarding/`

**Repository orientation and first steps.**

- `SKILL.md` — Skill definition
- `references/repo-map.md` — Repository map

---

#### `skills/gestaltview-cross-repo-workflows/`

**Coordination across sister repositories.**

- `SKILL.md` — Skill definition
- `references/` — Reference materials
  - `integrated-repos.md`
  - `workflow-checklists.md`

---

## `embodiment_profiles/` — AI Personas

**Purpose**: Definitions of distinct AI personas and characters.

### Core Personas (as `.embodiment.json` files)

- **`billy.embodiment.json`** — Billy, the companion
- **`the-guardian.embodiment.json`** — Protective, safety-focused
- **`the-architect.embodiment.json`** — Design and structure
- **`the-weaver.embodiment.json`** — Narrative and continuity
- **`the-algorithm.embodiment.json`** — Data and logic
- **`curator.embodiment.json`** — Knowledge curation
- **`repo-scribe.embodiment.json`** — Documentation and recording
- **`philosophy-scribe.embodiment.json`** — Conceptual thinking
- **`pattern-analyst.embodiment.json`** — Pattern recognition
- **`cascade-engineer.embodiment.json`** — Process optimization
- **`vibe-check.embodiment.json`** — Tone and resonance
- **`the-tailor.embodiment.json`** — Customization
- **`the-translation-bridge.embodiment.json`** — Language translation
- **`the-weird-digger.embodiment.json`** — Creative exploration

### Governance & Documentation

- **`embodiment/EMBODIMENT_INVENTORY.md`** — Complete inventory
- **`embodiment/EMBODIMENT_IMPLEMENTATION_PLAN.md`** — Implementation status
- **`embodiment/EMBODIMENT_GOVERNANCE_RULES.md`** — Governance framework
- **`embodiment/EMBODIMENT_HEARTBEAT_SPEC.md`** — Health checking
- **`character_studies/`** — In-depth persona analyses

### Model-Specific

- **`embodiment/PROFILE_DISTINCTIVENESS_MATRIX.md`** — What makes each persona unique

---

## `projects/` — Vertical Use Cases

**Purpose**: Domain-specific implementations and documentation.

### Available Verticals

- **`Insight-Bot_v1.7.1.md`** — Data insights and analytics
- **`Resume_Rockstar_v2.0_11_17_25.md`** — Career narrative and resume generation
- **`SymbioCoder.md`** — Code understanding and collaborative editing
- **`Addiction_&_Alzheimers.md`** — Recovery and memory preservation (two use cases)
- **`ADHD_Power_Up.md`** — ADHD-friendly tools and pacing
- **`GestaltView_ADHD_MVP_v2.0.md`** — ADHD MVP specifications
- **`Neural-Handshake.md`** — Human-AI handshake protocol
- **`VibeCober.md`** — Personality and vibe analysis

---

## `transcripts/` — Evidence and Session Records

**Purpose**: Chronological evidence of GestaltView's development and operation.

### Foundational Transcripts

- **`Seven Month Emergence Of GestaltView.md`** — The foundational transcript
- **`Keith_Soyka_And_The_Genesis_Of_GestaltView.md`** — Origin story
- **`Keith-Soyka-4am-Ramblings-9-19-25.md`** — Raw voice notes
- **`Keith_Soyka_Transcript.md`** — Recorded sessions

---

## `schema/` — Database Definitions

**Purpose**: Supabase PostgreSQL schema and data models.

- **`CurrentSchema(after_incorrect).sql`** — Current schema
- **`currentPublicschema(before_correct).sql`** — Previous schema version

---

## `specs/` — Architectural Specifications

**Purpose**: Detailed design specifications for systems and subsystems.

- **`ROOM_DEFINITIONS.md`** — Room specification
- **`RoomRuntimeAlignment_v1.md`** — Room behavior alignment
- **`SPEC-DynamicInnerWorld-GenerativeWorldRenderer.md`** — Dynamic inner world
- **`SPEC-GestaltView-Generative-Engine-v1.md`** — Generative engine spec
- **`GenerativeEngineIntegration.md`** — Integration guide
- **`CodexOutsideInTranslationLayer.md`** — Codex translation layer
- **`SPEC-2-Dynamic_User_Profiles_and_Creative_Modules_Integration_Sprint.md`** — User profile integration

---

## `adr/` — Architecture Decision Records

**Purpose**: Record important architectural decisions and rationale.

- **`001-manifest-schema-contract.md`** — Manifest Index contract decision
- **`002-billy-runtime-module.md`** — Billy runtime architecture
- **`003-perplexity-computer-tools.md`** — Perplexity tool design

---

## `scripts/` — Utility Scripts

**Purpose**: Build and operational scripts.

- **`README.md`** — Script documentation
- **`build-embodiment-artifacts.mjs`** — Generate embodiment artifacts
- **`sync-embodiment-profiles.ts`** — Sync embodiments with database
- **`validate-continuity-stack.mjs`** — Validate continuity logic

---

## `seed-prompts/` — System Prompts and Initialization

**Purpose**: System prompts and seed configurations for agents.

- **`God Mode Seed Prompt For Keith Soyka.md`** — Complete system prompt
- **`Third Revised GestaltView Master Seed Prompt for Your AI Collaborator Friend.md`** — System prompt iteration
- **`Genesis Seed Prompts and Backwards Engineering.md`** — Prompt engineering guide
- **`Developer OverRide User Seed Prompt Version 1.5.md`** — Developer mode prompt
- **`Creators Keith Soyka Seed Prompt 5-12-202.md`** — Creator-specific prompt

---

## `GestaltView_Vision_Blueprint_Package/` — Product Specification

**Purpose**: Comprehensive product and feature specification.

- **`03_CREATION_LAYER/`**
  - `CREATION_LAYER_MASTER_SPEC.md` — Creation layer specification
  - `MULTIMODAL_CREATION_ENGINE_SPEC.md` — Multimodal engine details
  - `ART_TEACHER_AND_LIVE_DI_PRESENCE.md` — Art teacher role
  - `RAPID_PROTOTYPE_TO_CREATION_CORNER_HANDOFF.md` — Workflow integration

---

## `wiki/` — Consolidated Wiki

**Purpose**: Generated wiki documentation (auto-generated from source).

- **`01_overview.md`** through **`12_current-state-and-glossary.md`** — Numbered wiki sections
- **`_context/`** — Context snapshots and sync data
- **`_reports/`** — Validation and structure reports

---

## `.agents/` — AI Agent Configurations

**Purpose**: Agent and skill definitions for AI collaborators.

- **`skills/gestaltview-artifact-creator/`**
  - `scripts/creation_corner_engine.py` — Python creation engine
  - `scripts/creation_corner.py` — Creation corner logic
  - `references/ultimate_creation_corner_v2.tsx` — React reference implementation

---

## `wikis/` — Vertical-Specific Wikis

**Purpose**: Generated wiki documentation for each vertical.

- **`Resume_Rockstar-wiki-v1.md`**
- **`GestaltView-Official-Compendium-v1-wiki-v1.md`**
- **`Addiction-Recovery-wiki-v1.md`**
- **`Creation_Corner-wiki-v1.md`**
- **`Alzheimers-Legacy-wiki-v1.md`**
- **`RPE-wiki-v1.md`**
- **`GestaltView_Diligence_Workbook_Filler-wiki-v1.md`**
- **`GestaltView-AICE-wiki-v1.md`**
- **`Musical-DNA-wiki-v1.md`**
- **`SymbioCoder_v2.0-wiki-v1.md`**
- **`Insight-Bot-wiki-v1.md`**
- **`ADHD_Power_Up-wiki-v1.md`**

---

## `GestaltView-Collaboration-Onboarding-Packet/` — Onboarding Materials

**Purpose**: Complete onboarding package for new collaborators (human or DI).

- **`00_READ_FIRST/`** — Start here
  - `README.md` — Packet overview
  - `PACKET_INDEX.md` — Navigation guide
  - `PACKET_MANIFEST.json` — Structured metadata
  - `CHANGELOG.md` — Update history

- **`01_GOVERNANCE_FOUNDATION/`** — Trust and governance
  - `GestaltView_Constitutional_Invariants.md`
  - `Collaboration_Boundaries.md`
  - `Trust_Model.md`
  - `Packaging_Gate_Checks.md`

- **`02_ORIENTATION/`** — Orientation and setup
  - Collaborator schema and provisioning specs
  - Orientation checkpoints
  - Embodiment templates

- **`03_SKILLS_AND_ROUTING/`** — Skills and capabilities
  - Skill catalog and routing
  - Highlighted core skills
  - Auxiliary vs canonical guide

- **`04_RUNTIME_AND_SCHEMA/`** — Technical details
  - API surface and routes
  - Database schema and boundaries
  - Memory models
  - Manifest and data domains

- **`05_AGENT_PERSONHOOD_AND_TRAINER/`** — Agent creation
  - Agent personhood framework
  - Admin trainer personhood
  - Knowledge library model
  - Mutation review lifecycle

- **`06_COLLABORATION_TEMPLATES/`** — Templates and checklists
  - Task brief template
  - Evidence log template
  - Handoff template
  - Onboarding checklists

- **`07_CURRENT_STATE_AND_EVIDENCE/`** — Status and proof
  - Current focus and blockers
  - Known risks
  - Verification reports
  - CurrentState.md

- **`08_APPENDICES/`** — Reference
  - Glossary
  - File inventory
  - Source-of-truth map
  - Import instructions

---

## `superpowers/plans/` — Planning Documents

**Purpose**: Planning and roadmap documents.

- **`2026-05-25-gestaltview-di-runtime.md`** — DI runtime planning

---

## Reading Order for New Collaborators

If you're new to Perplexity / GestaltView, read in this order:

1. **This file** — You are here. Understand the directory structure.
2. **`README.md`** — Back to the root level README for quick start.
3. **`canonical/FOUNDING_STATEMENT.md`** — Mission and values.
4. **`canonical/DOCTRINE_OF_ORIGIN.md`** — Why this exists.
5. **`canonical/GestaltView_Platform_Ground_Truth.md`** — How it works.
6. **`canonical/PERPLEXITY.MD`** — The five tools.
7. **`GestaltView-Collaboration-Onboarding-Packet/00_READ_FIRST/README.md`** — For collaborators.
8. **`docs/CURRENT_STATE.md`** — What's implemented and what's not.
9. **Explore by interest** — Pick a subsystem and dive in.

---

## Contributing & Modifications

When you modify files in Perplexity:

1. **Update the relevant source files** in their subsystems
2. **Update `canonical/CURRENT_STATE.md`** if architecture changes
3. **Update `docs/`** if user-facing behavior changes
4. **Run tests** in `api/__tests__/` and `server/__tests__/`
5. **Consider whether your change affects** the Manifest Index, Tribunal, or core contracts
6. **Add evidence** to `transcripts/` or `adr/` if significant

---

## Quick Reference: Key Files by Use Case

### "I need to understand Billy"
→ `shared/billy/types.ts`, `api/actions/billy/loom.ts`, `canonical/GestaltView_Platform_Ground_Truth.md`

### "I need to understand Tribunal"
→ `shared/tribunal/evaluate.ts`, `canonical/TRIBUNALCODEX.md`, `canonical/PERPLEXITY.MD#3`

### "I need to understand PLK"
→ `shared/llm/plk.ts`, `canonical/PLKMASTER.md`, `canonical/PERPLEXITY.MD#plk-significance`

### "I need to implement a new tool"
→ `canonical/PERPLEXITY.MD`, `api/actions/billy/` as reference, then add to `api/actions/my-tool/`

### "I need to add a new embodiment"
→ `embodiment_profiles/README.md`, sample `.embodiment.json` file, `shared/embodiment/types.ts`

### "I need to train a new agent"
→ `api/trainer/`, `server/agent-trainer/`, `GestaltView-Collaboration-Onboarding-Packet/05_AGENT_PERSONHOOD_AND_TRAINER/`

### "I need to understand the database"
→ `schema/CurrentSchema.sql`, `docs/Manifest.md`, `canonical/GestaltView_Platform_Ground_Truth.md`

### "I need to deploy or operate"
→ `docs/PlaybookOperatorManual.md`, `docs/VERCEL_ENV_CHECKLIST.md`, `canonical/CURRENT_STATE.md`

---

**Last updated**: 2026-06-05  
**Total directories**: ~80 major directories  
**Total files**: 500+ files across code, docs, and evidence  
**Status**: Active development  

This directory index will be updated as the platform evolves. For the latest, always check `README.md` and `canonical/CURRENT_STATE.md`.
