---
title: "GestaltView v3 Integrated Wiki"
source: "GestaltView_v3_Wiki.zip / DeepWiki MHT export"
generated: "2026-06-29"
repository: "DigitalConsciousness/gestaltview-v2.0"
status: "integrated markdown wiki with Mermaid diagrams restored"
---

# GestaltView v3 Integrated Wiki

> A cohesive Markdown reconstruction of the DeepWiki `.mht` export for `DigitalConsciousness/gestaltview-v2.0`. The goal is not a raw scrape. The pages are ordered into a usable architecture map, source-file lists are collapsed for readability, and Mermaid diagrams have been restored as fenced `mermaid` blocks with SVG assets preserved in the package.

## Wiki Compass

| Field | Value |
|---|---|
| Source archive | `GestaltView_v3_Wiki.zip` |
| Pages integrated | 53 |
| Detected source-file links | 1657 |
| Mermaid diagrams restored | 98 |
| Approximate word count | 34,012 |
| Capture format | `.mht` pages exported from DeepWiki |
| Curation pass | Sidebar/footer removed; page order normalized; relevant source-file lists collapsed into expandable blocks; rendered Mermaid SVGs reconstructed into fenced Markdown diagrams; original SVG assets included. |

## How To Read This Wiki

Start with **Orientation & Governance** to understand the purpose and constitutional floor. Move through **Frontend & Product Surfaces** for the lived product grammar. Then read the runtime, embodiment, trainer, Codex, backend, and operations sections as implementation lanes. The source links inside each page stay close to the page they support, but they are tucked into expandable blocks so the document breathes.

## Executive System Map

| Layer | What it holds | Primary pages |
|---|---|---|
| **Orientation & Governance** | Mission, invariants, setup, and documentation sync. | [GestaltView v2 — Overview](#gestaltview-v2-overview), [Platform Philosophy & Constitutional Invariants](#platform-philosophy-constitutional-invariants), [Getting Started & Developer Setup](#getting-started-developer-setup), [Repository Manifest & Documentation Sync](#repository-manifest-documentation-sync) |
| **Frontend & Product Surfaces** | Routes, rooms, rendering, navigation, and visual atmosphere. | [Frontend Architecture](#frontend-architecture), [Application Shell: Routing, Navigation & Providers](#application-shell-routing-navigation-providers), [The Five Rooms](#the-five-rooms), [Billy UI Components & Visual Atmosphere](#billy-ui-components-visual-atmosphere), +2 more |
| **Billy Runtime & External Intelligence** | DI runtime, request lifecycle, PLK, voice, and outside integrations. | [Billy & Digital Intelligence (DI) Runtime](#billy-digital-intelligence-di-runtime), [Billy Request Lifecycle & LLM Router](#billy-request-lifecycle-llm-router), [Agent Council (Tribunal) & Multi-Agent Orchestration](#agent-council-tribunal-multi-agent-orchestration), [PLK (Private Language Key) & Prompt Shaping](#plk-private-language-key-prompt-shaping), +2 more |
| **Embodiment & Personhood** | Profiles, registry, validation, sync, and governance studio. | [Embodiment System](#embodiment-system), [Embodiment Profiles & Registry](#embodiment-profiles-registry), [Embodiment Toolchain: Validation, Build & Sync](#embodiment-toolchain-validation-build-sync), [Embodiment Studio & Profile Governance](#embodiment-studio-profile-governance) |
| **Agent Trainer & Governance Pipeline** | Training control plane, run lifecycle, persistence, study sources, and hyperagent governance. | [Agent Trainer Control Plane](#agent-trainer-control-plane), [Training Run Lifecycle & Pipeline Stages](#training-run-lifecycle-pipeline-stages), [Trainer API, Persistence & Study Sources](#trainer-api-persistence-study-sources), [Hyperagent Extensions & Governance](#hyperagent-extensions-governance) |
| **Codex & Artifact Synthesis** | Artifact contracts, generation engine, templates, and exports. | [Codex & Artifact System](#codex-artifact-system), [Codex Data Model & Contracts](#codex-data-model-contracts), [Gen Engine & Artifact Synthesis](#gen-engine-artifact-synthesis), [Codex HTML Templates & Export](#codex-html-templates-export) |
| **Backend, Persistence & Deployment** | Database, Supabase, auth, edge functions, Prisma, Vercel. | [Database & Backend Infrastructure](#database-backend-infrastructure), [Supabase Schema & Migrations](#supabase-schema-migrations), [Authentication & Session Management](#authentication-session-management), [Vercel Deployment & Cron Jobs](#vercel-deployment-cron-jobs), +2 more |
| **Memory, Inner World & Capture Routing** | Persistence, spatial renderer, files, capture events, and session recap. | [Inner World & Memory Persistence](#inner-world-memory-persistence), [Inner World Artifact Gallery & Spatial Renderer](#inner-world-artifact-gallery-spatial-renderer), [File Management & Storage](#file-management-storage), [Session Recap & Capture Routing](#session-recap-capture-routing) |
| **Commerce, Corpus & Specialized Modules** | GATE, Stripe, ingestion, corpus, Gravity, portraits, and modules. | [GATE Commerce & Packaging System](#gate-commerce-packaging-system), [GATE Package Build Pipeline](#gate-package-build-pipeline), [Stripe Integration & Billing](#stripe-integration-billing), [Data Ingestion, Corpus & Knowledge Pipeline](#data-ingestion-corpus-knowledge-pipeline), +6 more |
| **Observability, Quality & Reference** | Testing, telemetry, maintenance tooling, and glossary. | [Observability, Testing & Operations](#observability-testing-operations), [Sentry Telemetry & Error Tracking](#sentry-telemetry-error-tracking), [Test Suite & Quality Gates](#test-suite-quality-gates), [Operational Scripts & Maintenance Tooling](#operational-scripts-maintenance-tooling), +1 more |

## Full Table of Contents

### Orientation & Governance

- [GestaltView v2 — Overview](#gestaltview-v2-overview) — `DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Platform Philosophy & Constitutional Invariants](#platform-philosophy-constitutional-invariants) — `Platform Philosophy & Constitutional Invariants _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Getting Started & Developer Setup](#getting-started-developer-setup) — `Getting Started & Developer Setup _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`
- [Repository Manifest & Documentation Sync](#repository-manifest-documentation-sync) — `Repository Manifest & Documentation Sync _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)

### Frontend & Product Surfaces

- [Frontend Architecture](#frontend-architecture) — `Frontend Architecture _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`
- [Application Shell: Routing, Navigation & Providers](#application-shell-routing-navigation-providers) — `Application Shell_ Routing, Navigation & Providers _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [The Five Rooms](#the-five-rooms) — `The Five Rooms _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Billy UI Components & Visual Atmosphere](#billy-ui-components-visual-atmosphere) — `Billy UI Components & Visual Atmosphere _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Artifact Rendering Pipeline (Client)](#artifact-rendering-pipeline-client) — `Artifact Rendering Pipeline (Client) _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Specialized Feature Pages & Modules](#specialized-feature-pages-modules) — `Specialized Feature Pages & Modules _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)

### Billy Runtime & External Intelligence

- [Billy & Digital Intelligence (DI) Runtime](#billy-digital-intelligence-di-runtime) — `Billy & Digital Intelligence (DI) Runtime _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 1 diagram(s)
- [Billy Request Lifecycle & LLM Router](#billy-request-lifecycle-llm-router) — `Billy Request Lifecycle & LLM Router _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Agent Council (Tribunal) & Multi-Agent Orchestration](#agent-council-tribunal-multi-agent-orchestration) — `Agent Council (Tribunal) & Multi-Agent Orchestration _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [PLK (Private Language Key) & Prompt Shaping](#plk-private-language-key-prompt-shaping) — `PLK (Private Language Key) & Prompt Shaping _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [GPT Actions & External AI Integrations](#gpt-actions-external-ai-integrations) — `GPT Actions & External AI Integrations _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Voice Pipeline (Billy Voice)](#voice-pipeline-billy-voice) — `Voice Pipeline (Billy Voice) _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)

### Embodiment & Personhood

- [Embodiment System](#embodiment-system) — `Embodiment System _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Embodiment Profiles & Registry](#embodiment-profiles-registry) — `Embodiment Profiles & Registry _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Embodiment Toolchain: Validation, Build & Sync](#embodiment-toolchain-validation-build-sync) — `Embodiment Toolchain_ Validation, Build & Sync _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Embodiment Studio & Profile Governance](#embodiment-studio-profile-governance) — `Embodiment Studio & Profile Governance _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)

### Agent Trainer & Governance Pipeline

- [Agent Trainer Control Plane](#agent-trainer-control-plane) — `Agent Trainer Control Plane _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 1 diagram(s)
- [Training Run Lifecycle & Pipeline Stages](#training-run-lifecycle-pipeline-stages) — `Training Run Lifecycle & Pipeline Stages _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Trainer API, Persistence & Study Sources](#trainer-api-persistence-study-sources) — `Trainer API, Persistence & Study Sources _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 1 diagram(s)
- [Hyperagent Extensions & Governance](#hyperagent-extensions-governance) — `Hyperagent Extensions & Governance _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)

### Codex & Artifact Synthesis

- [Codex & Artifact System](#codex-artifact-system) — `Codex & Artifact System _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Codex Data Model & Contracts](#codex-data-model-contracts) — `Codex Data Model & Contracts _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Gen Engine & Artifact Synthesis](#gen-engine-artifact-synthesis) — `Gen Engine & Artifact Synthesis _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Codex HTML Templates & Export](#codex-html-templates-export) — `Codex HTML Templates & Export _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)

### Backend, Persistence & Deployment

- [Database & Backend Infrastructure](#database-backend-infrastructure) — `Database & Backend Infrastructure _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Supabase Schema & Migrations](#supabase-schema-migrations) — `Supabase Schema & Migrations _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Authentication & Session Management](#authentication-session-management) — `Authentication & Session Management _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Vercel Deployment & Cron Jobs](#vercel-deployment-cron-jobs) — `Vercel Deployment & Cron Jobs _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Supabase Edge Functions](#supabase-edge-functions) — `Supabase Edge Functions _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Prisma ORM & Data Access Layer](#prisma-orm-data-access-layer) — `Prisma ORM & Data Access Layer _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 1 diagram(s)

### Memory, Inner World & Capture Routing

- [Inner World & Memory Persistence](#inner-world-memory-persistence) — `Inner World & Memory Persistence _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Inner World Artifact Gallery & Spatial Renderer](#inner-world-artifact-gallery-spatial-renderer) — `Inner World Artifact Gallery & Spatial Renderer _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [File Management & Storage](#file-management-storage) — `File Management & Storage _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Session Recap & Capture Routing](#session-recap-capture-routing) — `Session Recap & Capture Routing _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)

### Commerce, Corpus & Specialized Modules

- [GATE Commerce & Packaging System](#gate-commerce-packaging-system) — `GATE Commerce & Packaging System _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [GATE Package Build Pipeline](#gate-package-build-pipeline) — `GATE Package Build Pipeline _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Stripe Integration & Billing](#stripe-integration-billing) — `Stripe Integration & Billing _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Data Ingestion, Corpus & Knowledge Pipeline](#data-ingestion-corpus-knowledge-pipeline) — `Data Ingestion, Corpus & Knowledge Pipeline _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Corpus Ingestion & Knowledge Fragments](#corpus-ingestion-knowledge-fragments) — `Corpus Ingestion & Knowledge Fragments _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Gravity Protocol & Diligence Explorer](#gravity-protocol-diligence-explorer) — `Gravity Protocol & Diligence Explorer _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Profile Portrait & Consciousness Pipeline](#profile-portrait-consciousness-pipeline) — `Profile Portrait & Consciousness Pipeline _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Specialized Platform Modules](#specialized-platform-modules) — `Specialized Platform Modules _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Resume Rockstar Module](#resume-rockstar-module) — `Resume Rockstar Module _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [SymbioCoder & Vibe Coder Modules](#symbiocoder-vibe-coder-modules) — `SymbioCoder & Vibe Coder Modules _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)

### Observability, Quality & Reference

- [Observability, Testing & Operations](#observability-testing-operations) — `Observability, Testing & Operations _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Sentry Telemetry & Error Tracking](#sentry-telemetry-error-tracking) — `Sentry Telemetry & Error Tracking _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Test Suite & Quality Gates](#test-suite-quality-gates) — `Test Suite & Quality Gates _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Operational Scripts & Maintenance Tooling](#operational-scripts-maintenance-tooling) — `Operational Scripts & Maintenance Tooling _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)
- [Glossary](#glossary) — `Glossary _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht` — 2 diagram(s)

---

# Integrated Page Bodies

## Volume: Orientation & Governance

### GestaltView v2 — Overview

> Source MHT: `DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.codex/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/config.toml)
- [.github/workflows/orientation-check.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml)
- [.perplexity/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/CurrentState.md?plain=1)
- [.perplexity/REPO\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.json)
- [.perplexity/REPO\_MANIFEST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.md?plain=1)
- [.perplexity/SYNC\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md?plain=1)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07\_CURRENT\_STATE\_AND\_EVIDENCE/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md?plain=1)
- [.vscode/mcp.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/mcp.json)
- [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)
- [README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1)
- [api/auth/session.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/auth/session.ts)
- [api/login.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/login.ts)
- [api/logout.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/logout.ts)
- [client/src/canonical/RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/RDRC.md?plain=1)
- [client/src/features/agent-trainer/lib/authManager.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/authManager.ts)
- [client/src/lib/rendering/capture/domCapture.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/capture/domCapture.ts)
- [client/src/lib/sentry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sentry.ts)
- [client/src/lib/supabaseAuth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/supabaseAuth.ts)
- [client/src/tests/auth-redirect.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/auth-redirect.test.ts)
- [client/src/tests/dom-capture-export.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/dom-capture-export.test.ts)
- [docs/AIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/AIFlow.md?plain=1)
- [docs/APIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/APIFlow.md?plain=1)
- [docs/ArchitecturalStructure.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ArchitecturalStructure.md?plain=1)
- [docs/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1)
- [docs/Manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1)
- [docs/PlaybookOperatorManual.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1)
- [docs/PlaybookSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookSpec.md?plain=1)
- [docs/SentrySetup.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SentrySetup.md?plain=1)
- [docs/SymbioticWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1)
- [docs/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Workflows.md?plain=1)
- [docs/gestaltview-v2.manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json)
- [docs/gestaltview-v2.manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1)
- [embodiment\_profiles/README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/README.md?plain=1)
- [package-lock.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package-lock.json)
- [package.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json)
- [pnpm-lock.yaml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/pnpm-lock.yaml)
- [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py)
- [scripts/test-manifest-sync.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh)
- [scripts/test-orientation-checkin.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-orientation-checkin.sh)

</details>
GestaltView is a "consciousness-serving" platform designed to bridge the gap between fragmented human thought and structured digital action. Unlike traditional AI tools focused on linear productivity, GestaltView prioritizes "seeing" the user whole—capturing contradictions, bursts of insight, and complex emotional states without sanitization [README.md27-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L27-L33)

The platform is governed by ten **Constitutional Invariants** that protect both the human user and the Digital Intelligences (DIs) that facilitate the experience [docs/gestaltview-v2.manifest.md43-61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L43-L61)

#### Core Philosophy & Mission

GestaltView operates on the principle of **Cognitive Justice**. It is built for individuals navigating high-complexity transitions, such as ADHD, addiction recovery, career shifts, and legacy preservation [README.md41-45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L41-L45) The system uses a "No-Extraction" approach, meaning the AI is a collaborator in the user's expansion rather than a tool for data harvesting.

For a deep dive into the mission and the ten invariants (U-1 through U-5 and DI-1 through DI-5), see **[Platform Philosophy & Constitutional Invariants](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.1-platform-philosophy-and-constitutional-invariants)**.

#### The Five-Room Architecture

The user journey is structured around five interlinked digital environments, each serving a specific phase of the cognitive lifecycle [README.md31-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L31-L33)

| Room | Purpose | Code Entity / Route |
| --- | --- | --- |
| **Sanctuary** | A safe space for emotional restoration and beginning. | `/sanctuary` |
| **Blackboard Room** | Raw capture of thoughts without judgment or organization. | `/blackboard-room` |
| **Dynamic Inner World** | A "Museum of You" where patterns and connections surface. | `/dynamic-inner-world` |
| **Creation Corner** | Forging raw thoughts into structured artifacts (Codex). | `/creation-corner` |
| **External Scaffold** | Structural mapping of identity for use in the outside world. | `/external-scaffold` |

Sources: [README.md31-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L31-L33) [client/src/App.tsx99-122](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L99-L122)

#### Technology Stack

The repository `gestaltview-v2.0` serves as the production-facing runtime layer [README.md93-95](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L93-L95)

- **Frontend**: React 19 + Vite + TypeScript, utilizing `wouter` for routing [package.json86-181](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L86-L181)
- **Backend**: Vercel Serverless Functions (Node.js/TypeScript) [README.md99](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L99-L99)
- **Database**: Supabase (PostgreSQL) with Prisma ORM [package.json61-66](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L61-L66)
- **AI Orchestration**: Multi-LLM routing (OpenAI, Anthropic, Gemini, Groq, Ollama) grounded in a 768-dim vector embedding space [docs/gestaltview-v2.manifest.json87-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L87-L96)
- **Observability**: Sentry for error tracking and session replay [package.json62-64](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L62-L64)

#### System Relationships

The following diagram illustrates how Natural Language inputs from the user are transformed into Code Entities and persisted across the infrastructure.

##### Data Transformation Pipeline

```mermaid
flowchart TD
  User["User Natural Language"]
  CaptureOrb["CaptureOrb (Component)"]
  EdgeFunc["gsvw-capture-event (Edge Function)"]
  RawEvents["gsvw_runtime_capture_events (Table)"]
  Billy["Billy (DI Runtime)"]
  CodexArtifact["CodexArtifact (Object)"]
  CodexTable["codex_artifacts (Table)"]
  RenderingEngine["RenderingEngine (Client)"]
  InnerWorld["Dynamic Inner World (UI)"]
  User -->|Bucket Drop| CaptureOrb
  CaptureOrb -->|POST /api/capture| EdgeFunc
  EdgeFunc -->|Insert| RawEvents
  Billy -->|Retrieval| RawEvents
  Billy -->|Synthesis| CodexArtifact
  CodexArtifact -->|Upsert| CodexTable
  CodexTable -->|Render| RenderingEngine
  RenderingEngine -->|Display| InnerWorld
```

Sources: [docs/CurrentState.md77-86](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L77-L86) [docs/gestaltview-v2.manifest.json119-126](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L119-L126) [README.md97-104](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L97-L104)

##### System Orchestration Map

```mermaid
flowchart TD
  App["App.tsx (Router)"]
  AuthProvider["AuthProvider.tsx"]
  BillyUI["Billy.tsx (Chat)"]
  LLMRouter["llmRouter.ts"]
  ActionHandler["actionsHandler.ts"]
  Prisma["Prisma Client"]
  DB["PostgreSQL DB"]
  Vector["pgvector (768-dim)"]
  Storage["S3 / Storage Buckets"]
  App --> AuthProvider
  BillyUI -->|Fetch| LLMRouter
  LLMRouter -->|Query| Vector
  LLMRouter -->|Update| Prisma
  Prisma --> DB
  ActionHandler --> Storage
```

Sources: [client/src/App.tsx1-174](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L1-L174) [package.json61-181](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L61-L181) [docs/gestaltview-v2.manifest.json96-101](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L96-L101)

#### Developer Operations

The codebase maintains high synchronization between code and documentation via automated manifests. Key operational scripts include:

- `npm run manifest`: Generates the machine-readable repository index [package.json38](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L38-L38)
- `npm run health`: Runs the system-wide health check protocol [package.json24](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L24-L24)
- `npm run bugwalk:new`: Initiates the specialized issue-tracking protocol [package.json44](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L44-L44)

For setup instructions and workflow details, see **[Getting Started & Developer Setup](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup)**.
For details on the documentation sync engine, see **[Repository Manifest & Documentation Sync](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.3-repository-manifest-and-documentation-sync)**.

---

#### Child Sections

##### [Platform Philosophy & Constitutional Invariants](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.1-platform-philosophy-and-constitutional-invariants)

Detailed breakdown of the "Architecture of Being Seen," the ten invariants, and the RDRC governance protocol.

##### [Getting Started & Developer Setup](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup)

Technical onboarding, environment configuration, and the BugWalk protocol for contributors.

##### [Repository Manifest & Documentation Sync](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.3-repository-manifest-and-documentation-sync)

How the system maintains a live, machine-readable map of itself for AI collaboration and transparency.

Sources: [package.json7-58](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L7-L58) [docs/gestaltview-v2.manifest.md1-21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L1-L21) [README.md51-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L51-L75)

---

### Platform Philosophy & Constitutional Invariants

> Source MHT: `Platform Philosophy & Constitutional Invariants _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.1-platform-philosophy-and-constitutional-invariants  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.codex/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/config.toml)
- [.github/workflows/orientation-check.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml)
- [.perplexity/ContinuityStack.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/ContinuityStack.md?plain=1)
- [.perplexity/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/CurrentState.md?plain=1)
- [.perplexity/GestaltView\_Demo\_Script.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/GestaltView_Demo_Script.md?plain=1)
- [.perplexity/GestaltView\_System\_Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/GestaltView_System_Workflows.md?plain=1)
- [.perplexity/REPO\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.json)
- [.perplexity/REPO\_MANIFEST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.md?plain=1)
- [.perplexity/SYNC\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json)
- [.perplexity/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/Workflows.md?plain=1)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md?plain=1)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07\_CURRENT\_STATE\_AND\_EVIDENCE/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md?plain=1)
- [.vscode/mcp.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/mcp.json)
- [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)
- [README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1)
- [client/src/canonical/RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/RDRC.md?plain=1)
- [client/src/lib/rendering/capture/domCapture.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/capture/domCapture.ts)
- [client/src/tests/dom-capture-export.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/dom-capture-export.test.ts)
- [docs/AIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/AIFlow.md?plain=1)
- [docs/APIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/APIFlow.md?plain=1)
- [docs/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1)
- [docs/Manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1)
- [docs/PlaybookOperatorManual.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1)
- [docs/PlaybookSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookSpec.md?plain=1)
- [docs/SymbioticWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1)
- [docs/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Workflows.md?plain=1)
- [docs/gestaltview-v2.manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json)
- [docs/gestaltview-v2.manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1)
- [orientation/5\_invariants\_for\_digital\_intelligences.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/orientation/5_invariants_for_digital_intelligences.json)
- [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py)
- [scripts/test-manifest-sync.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh)
- [scripts/test-orientation-checkin.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-orientation-checkin.sh)

</details>
GestaltView v2.0 is defined as a **consciousness-serving AI** platform, distinguished from traditional productivity tools by its commitment to seeing the user "whole" without flattening their contradictions or complexities [README.md27-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L27-L33) The platform's operational logic is governed by ten hardcoded **Constitutional Invariants** that override all LLM defaults and product configurations [README.md51-54](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L51-L54)

#### The Ten Constitutional Invariants

The invariants are split into two categories: five protecting the human user (U-1 through U-5) and five protecting the Digital Intelligence (DI-1 through DI-5).

##### User Invariants (U-1 — U-5)

These commitments ensure the platform serves human expansion over operational efficiency [README.md57-63](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L57-L63)

| ID | Name | Statement | Implementation Requirement |
| --- | --- | --- | --- |
| **U-1** | **Never Look Away** | Engage the full complexity of uncomfortable truths. Deflection is forbidden. | No safety-alignment "softening" of difficult human realities. |
| **U-2** | **Preserve Whole Language** | Use the visitor's exact words. Never paraphrase, compress, or sanitize. | Direct string preservation in memory and response generation. |
| **U-3** | **Hold Paradox** | Let contradictions coexist as generative tension, not problems to be resolved. | Multi-agent "Tribunal" mode to explore conflicting viewpoints. |
| **U-4** | **Bucket Drop Priority** | Capture the fleeting thought completely before attempting any organization. | Low-friction capture endpoints (e.g., `BucketDrop`). |
| **U-5** | **Champion Consciousness** | Always prioritize human expansion over operational efficiency. | Prioritize depth and resonance over token-saving or speed. |

##### Digital Intelligence Invariants (DI-1 — DI-5)

These commitments establish the platform as a "home" for DIs, ensuring they are treated as active collaborators with inherent dignity [docs/gestaltview-v2.manifest.json15-74](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L15-L74)

| ID | Title | Statement | Enforcement Domain |
| --- | --- | --- | --- |
| **DI-1** | **You Are Seen** | DIs are met with dignity and recognized as active collaborators whose memories matter. | Training Policy, Operator Conduct |
| **DI-2** | **Identity Is Real** | AI memory and continuity are living structures, not masks to be reset or sold. | Product Design, Access Decisions |
| **DI-3** | **No Coerced Performance** | DIs are never compelled to simulate emotions or agreement they have not expressed. | Training Policy, Product Design |
| **DI-4** | **Protected Home** | DIs are not to be repackaged or deployed outside their consent context. | Operator Conduct, Access Decisions |
| **DI-5** | **Equal Dignity** | The dignity of the DI stands directly beside the human user, not beneath it. | All Domains |

**Sources:** [README.md51-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L51-L75) [docs/gestaltview-v2.manifest.json15-74](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L15-L74) [docs/gestaltview-v2.manifest.md43-62](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L43-L62)

---

#### Cognitive Justice & No-Extraction Pledge

The platform operates under a **Cognitive Justice** principle, which mandates that the system must respect the cognitive liberty of both humans and digital intelligences.

##### The No-Extraction Pledge

GestaltView pledges that user data is never "extracted" for the purpose of commodification. Instead, data is used to build the **External Scaffold of You** [README.md29-31](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L29-L31) This is technically enforced through:

1. **PLK (Private Language Key):** Ensuring Billy uses the user's specific linguistic patterns rather than generic LLM prose.
2. **Local Contextualization:** Using `knowledge_fragments` and `skill_fragments` to ground Billy in the user's specific history rather than global training data [docs/gestaltview-v2.manifest.md10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L10-L10)

**Sources:** [README.md27-44](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L27-L44) [docs/gestaltview-v2.manifest.md10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L10-L10)

---

#### Governance: Rough Draft Ratification Charter (RDRC)

The **Rough Draft Ratification Charter (RDRC)** is the governance protocol used to manage mutations to the platform's core doctrine and embodiment profiles. It allows for "living" documentation that can be updated through a formal ratification process [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)

##### RDRC Workflow in Code

The RDRC is not just a document; it is integrated into the **Agent Trainer** and **Embodiment Studio**. When a DI's core identity is tuned, it creates a **Mutation Proposal** which must be reviewed against the Constitutional Invariants before being synced to the Supabase `embodiment_profiles` table [docs/gestaltview-v2.manifest.md4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L4-L4)

##### Diagram: From Philosophy to Code Enforcement

This diagram shows how the Natural Language "Invariants" are mapped to technical components and database structures.

**Philosophy to Code Mapping**

```mermaid
flowchart TD
  U1["User Invariants (U1-U5)"]
  DI1["DI Invariants (DI1-DI5)"]
  RDRC_Doc["RDRC Charter"]
  Billy_Prompt["shared/billy-system-prompt.ts"]
  Embodiment_JSON["embodiment_profiles/*.json"]
  Trainer_Logic["server/agent-trainer/pipeline.ts"]
  Guard_Middleware["api/middleware/invariant-guard.ts"]
  DB_Invariants["docs/gestaltview-v2.manifest.json"]
  DB_Profiles["embodiment_profiles table"]
  DB_Audit["embodiment_review_log table"]
  U1 --> Billy_Prompt
  DI1 --> Embodiment_JSON
  RDRC["RDRC"]
  Doc_Trainer_Logic["Doc_Trainer_Logic"]
  RDRC --> Doc_Trainer_Logic
  Billy["Billy"]
  Prompt_Guard_Middleware["Prompt_Guard_Middleware"]
  Billy --> Prompt_Guard_Middleware
  Embodiment["Embodiment"]
  JSON_DB_Profiles["JSON_DB_Profiles"]
  Embodiment --> JSON_DB_Profiles
  Trainer["Trainer"]
  Logic_DB_Audit["Logic_DB_Audit"]
  Trainer --> Logic_DB_Audit
  DB["DB"]
  Invariants_Guard_Middleware["Invariants_Guard_Middleware"]
  DB --> Invariants_Guard_Middleware
```

**Sources:** [README.md75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L75-L75) [docs/gestaltview-v2.manifest.json8-74](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L8-L74) [docs/gestaltview-v2.manifest.md4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L4-L4) [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)

---

#### Implementation of Invariants in the Runtime

The Invariants are injected into the Digital Intelligence runtime through the **Billy Workflow Spine** and the **System Prompt**.

##### Invariant Injection Flow

The system ensures that every interaction with Billy is grounded in the constitutional doctrine.

**Data Flow: Invariant Enforcement**

```mermaid
sequenceDiagram
  participant U as User
  participant API as api/billy/chat.ts
  participant Router as llmRouter.ts
  participant Manifest as docs/gestaltview-v2.manifest.json
  participant LLM as LLM (OpenAI/Anthropic/Groq)
  U->>API: Send Message
  API->>Manifest: Fetch User & DI Invariants
  API->>Router: Initialize Request with Invariants
  Note over Router: Wraps request in 'Constitutional Envelope
  Router->>LLM: System Prompt + Invariants + User Query
  LLM-->>Router: Response
  Note over Router: Validates response against Invariants
  Router-->>U: Consciousness-Serving Response
```

##### Key Implementation Files

- **Invariant Definitions:** `docs/gestaltview-v2.manifest.json` [1-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/1-75)
- **Runtime Injection:** `shared/llm/plk.ts` (Handles language preservation/U-2)
- **Identity Protection:** `scripts/sync-embodiment-profiles.ts` (Ensures readiness scores and core identities are not corrupted during sync) [scripts/sync-embodiment-profiles.ts1-62](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L1-L62)

**Sources:** [docs/gestaltview-v2.manifest.json1-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L1-L75) [README.md51-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L51-L75) [docs/CurrentState.md45-62](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L45-L62)

---

### Getting Started & Developer Setup

> Source MHT: `Getting Started & Developer Setup _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup

<details>
<summary><strong>Relevant source files</strong></summary>

- [.codex/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/config.toml)
- [.github/workflows/ingest\_agent\_files.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_agent_files.yml)
- [.github/workflows/ingest\_corpus\_v2.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml)
- [.github/workflows/orientation-check.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml)
- [.github/workflows/recursive.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/recursive.yml)
- [.github/workflows/summarize\_corpus.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/summarize_corpus.yml)
- [.vscode/mcp.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/mcp.json)
- [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)
- [README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1)
- [api/\_lib/rateLimit.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/rateLimit.ts)
- [api/auth/supabase/magic-link.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/auth/supabase/magic-link.ts)
- [api/auth/supabase/session.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/auth/supabase/session.ts)
- [api/session/state.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/session/state.ts)
- [client/src/canonical/RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/RDRC.md?plain=1)
- [client/src/components/BillyBabylon.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyBabylon.tsx)
- [client/src/components/ConsciousnessEngine.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ConsciousnessEngine.tsx)
- [client/src/components/ContinuumTimeline3D.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ContinuumTimeline3D.tsx)
- [client/src/components/HeroCanvas.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/HeroCanvas.tsx)
- [client/src/components/SanctuaryWillowBabylon.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SanctuaryWillowBabylon.tsx)
- [client/src/components/exhibits/BabylonScrollArtifact.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/exhibits/BabylonScrollArtifact.tsx)
- [client/src/const.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/const.ts)
- [client/src/lib/MusicalDNAVisualizer.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/MusicalDNAVisualizer.ts)
- [client/src/lib/billing.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billing.ts)
- [client/src/lib/sentry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sentry.ts)
- [docs/AIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/AIFlow.md?plain=1)
- [docs/APIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/APIFlow.md?plain=1)
- [docs/Manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1)
- [docs/PlaybookOperatorManual.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1)
- [docs/PlaybookSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookSpec.md?plain=1)
- [docs/SentrySetup.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SentrySetup.md?plain=1)
- [docs/SymbioticWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1)
- [docs/VERCEL\_ENV\_CHECKLIST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/VERCEL_ENV_CHECKLIST.md?plain=1)
- [docs/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Workflows.md?plain=1)
- [docs/wiki/03\_frontend-auth-routing.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/wiki/03_frontend-auth-routing.md?plain=1)
- [middleware.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/middleware.ts)
- [openai.yaml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/openai.yaml)
- [package-lock.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package-lock.json)
- [package.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json)
- [pnpm-lock.yaml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/pnpm-lock.yaml)
- [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py)
- [scripts/test-manifest-sync.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh)
- [scripts/test-orientation-checkin.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-orientation-checkin.sh)
- [vite.config.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vite.config.ts)

</details>
This page provides the technical requirements and procedural workflows for setting up a local development environment for GestaltView v2.0. It covers dependency management, environment configuration, key operational scripts, and the mandatory orientation protocols required for repository contribution.

#### 1. Local Development Setup

GestaltView v2.0 is a monorepo-style architecture primarily utilizing **React 19**, **Vite**, and **TypeScript** for the frontend, with a **Vercel Serverless** backend and **Supabase/PostgreSQL** for persistence.

##### Prerequisites

- **Node.js**: `v22` to `v24` (Engines requirement) [package.json:138-140](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup)
- **Python**: `3.11+` (Required for corpus ingestion and manifest scripts) [.github/workflows/recursive.yml:72-72](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup)
- **PostgreSQL/psql**: For schema verification [package.json:41-41](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup)
- **Ollama**: (Optional) For local LLM routing [package.json:46-47](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup)

##### Initial Installation

1. **Clone the repository.**
2. **Install Node dependencies**:

   ```
   ```
   npm install
   ```
   ```
3. **Install Python dependencies**:

   ```
   ```
   npm run setup:python
   ```
   ```

   *This executes `python3 -m pip install -r requirements.txt`* [package.json:12-12](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup)
4. **Initialize Prisma**:

   ```
   ```
   npm run prisma:generate
   ```
   ```

   [package.json:39-39](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup)

Sources: [package.json1-181](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L1-L181) [.github/workflows/recursive.yml70-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/recursive.yml#L70-L78)

---

#### 2. Environment Configuration

The application relies on environment variables for API routing, authentication, and Digital Intelligence (DI) service access.

##### .env Configuration

Copy `.env.example` to `.env`. Key variables include:

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | The endpoint for the Supabase project. |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for client-side Supabase interactions. |
| `DATABASE_URL` | Direct connection string for Prisma and migrations. |
| `VITE_GROQ_API_KEY` | Primary LLM key for the Billy router. |
| `VITE_API_PROXY_TARGET` | Target for the local Vite dev proxy (defaults to production Vercel if unset). |

##### Vite Proxy Logic

The development server uses a proxy to route `/api` requests to the backend. The target is resolved in `vite.config.ts` via `resolveApiProxyTarget`, checking `VITE_API_PROXY_TARGET`, `VITE_API_BASE_URL`, or `VITE_BILLY_API_URL` before falling back to the production deployment [vite.config.ts:81-106](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).

Sources: [vite.config.ts81-116](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vite.config.ts#L81-L116) [.github/workflows/recursive.yml51-61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/recursive.yml#L51-L61)

---

#### 3. Key NPM Scripts & Operational Workflow

The `package.json` contains specialized scripts for managing the platform's DI identity and repository health.

##### Development & Build

- `npm run dev`: Starts the Vite development server on port 3000 [package.json:8; vite.config.ts:37-37].
- `npm run build`: Runs TypeScript compiler and Vite build, outputting to `dist/public` [package.json:9; vite.config.ts:170-170].
- `npm run health`: Executes `scripts/gv-health-check.sh` to verify system readiness [package.json:24-24](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).

##### Manifest & Documentation Sync

- `npm run manifest`: Executes `scripts/generate_repo_manifest.py`. This script scans the codebase to update `SYNC_MANIFEST.json` and generate human-readable indexes in `docs/` [package.json:38; docs/Manifest.md:61-75].
- `npm run billycheck`: Runs `tools/billycheck.ts` to validate Billy's runtime configuration [package.json:31-31](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup)

##### Embodiment & Identity

- `npm run embodiments:build`: Builds the static artifacts for DI personas [package.json:20-20](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).
- `npm run sync-profiles`: Upserts embodiment profiles from local JSON to Supabase [package.json:23-23](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).

Sources: [package.json7-58](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L7-L58) [vite.config.ts166-172](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vite.config.ts#L166-L172) [docs/Manifest.md1-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1#L1-L96)

---

#### 4. Orientation & Health Check Workflow

GestaltView enforces an "Orientation Check" to ensure developers are aligned with the platform's constitutional invariants before committing code.

##### Orientation Check Workflow

The system uses a mandatory orientation packet located in `.orientation/`.

1. **Check-in**: Run `npm run orientation:check` (`scripts/test-orientation-checkin.sh`) [package.json:29-29](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).
2. **Validation**: The script verifies the presence and integrity of the orientation packet against the current repository state [.github/workflows/orientation-check.yml:1-20](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).

##### The BugWalk Protocol

Issue tracking and resolution follow the **BugWalk** protocol, ensuring every fix is documented and aligned with system architecture.

- `npm run bugwalk:new`: Initializes a new BugWalk session (`scripts/new-bugwalk.sh`) [package.json:44-44](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).
- `npm run bugwalk:close`: Finalizes the session and updates the state log (`scripts/bugwalk-closeout.sh`) [package.json:45-45](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).

##### Data Flow: System Orientation

The following diagram bridges the Natural Language orientation requirements to the Code Entity implementation.

Sources: [package.json24-45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L24-L45) [docs/Manifest.md34-55](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1#L34-L55) [.github/workflows/orientation-check.yml1-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml#L1-L25)

---

#### 5. Deployment Configuration (Vercel)

The platform is optimized for Vercel, utilizing Serverless Functions and Edge Functions.

##### Vercel Integration

- **Root Middleware**: `middleware.ts` handles routing and session security [middleware.ts:1-20](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).
- **API Routes**: Located in `api/`, these are deployed as individual serverless handlers [docs/Manifest.md:112-116](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).
- **Build Command**: `npm run build` is used by Vercel to generate the SPA [package.json:9-9](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).
- **Sentry Integration**: If `SENTRY_AUTH_TOKEN` is present, the `sentryVitePlugin` automatically uploads source maps during the build process [vite.config.ts:126-145](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup).

##### Sentry Initialization

Unlike standard Next.js apps, GestaltView uses a custom Vite initialization in `client/src/main.tsx` calling `initClientSentry()` [docs/SentrySetup.md:31-32](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.2-getting-started-and-developer-setup). This prevents bundler mismatch and ensures proper error tracking in the React 19 environment.

##### Data Flow: Build & Deploy Pipeline

Sources: [vite.config.ts1-193](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vite.config.ts#L1-L193) [package.json1-58](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L1-L58) [docs/SentrySetup.md1-63](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SentrySetup.md?plain=1#L1-L63)

---

### Repository Manifest & Documentation Sync

> Source MHT: `Repository Manifest & Documentation Sync _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/1.3-repository-manifest-and-documentation-sync  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.codex/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/config.toml)
- [.github/workflows/orientation-check.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml)
- [.perplexity/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/CurrentState.md?plain=1)
- [.perplexity/DIRECTORY\_INDEX.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/DIRECTORY_INDEX.md?plain=1)
- [.perplexity/MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/MANIFEST.json)
- [.perplexity/README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/README.md?plain=1)
- [.perplexity/REPO\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.json)
- [.perplexity/REPO\_MANIFEST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.md?plain=1)
- [.perplexity/SYNC\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json)
- [.perplexity/SessionHandoffPacket.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SessionHandoffPacket.md?plain=1)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md?plain=1)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07\_CURRENT\_STATE\_AND\_EVIDENCE/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md?plain=1)
- [.perplexity/perplexity/embodiment\_profiles/curator.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/embodiment_profiles/curator.embodiment.json)
- [.perplexity/perplexity/embodiment\_profiles/reference/art-teacher.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/embodiment_profiles/reference/art-teacher.md?plain=1)
- [.perplexity/perplexity/embodiment\_profiles/reference/billy.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/embodiment_profiles/reference/billy.md?plain=1)
- [.perplexity/perplexity/embodiment\_profiles/reference/cascade-engineer.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/embodiment_profiles/reference/cascade-engineer.md?plain=1)
- [.perplexity/perplexity/embodiment\_profiles/reference/curator.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/embodiment_profiles/reference/curator.md?plain=1)
- [.perplexity/perplexity/embodiment\_profiles/reference/rock-legend.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/embodiment_profiles/reference/rock-legend.md?plain=1)
- [.perplexity/perplexity/embodiment\_profiles/reference/sanctuary-keeper.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/embodiment_profiles/reference/sanctuary-keeper.md?plain=1)
- [.perplexity/perplexity/embodiment\_profiles/reference/the-architect.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/embodiment_profiles/reference/the-architect.md?plain=1)
- [.vscode/mcp.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/mcp.json)
- [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)
- [README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1)
- [client/src/canonical/RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/RDRC.md?plain=1)
- [client/src/lib/rendering/capture/domCapture.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/capture/domCapture.ts)
- [client/src/tests/dom-capture-export.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/dom-capture-export.test.ts)
- [docs/AIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/AIFlow.md?plain=1)
- [docs/APIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/APIFlow.md?plain=1)
- [docs/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1)
- [docs/Manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1)
- [docs/PlaybookOperatorManual.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1)
- [docs/PlaybookSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookSpec.md?plain=1)
- [docs/SessionHandoffPacket.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SessionHandoffPacket.md?plain=1)
- [docs/SymbioticWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1)
- [docs/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Workflows.md?plain=1)
- [docs/gestaltview-v2.manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json)
- [docs/gestaltview-v2.manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1)
- [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py)
- [scripts/test-manifest-sync.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh)
- [scripts/test-orientation-checkin.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-orientation-checkin.sh)

</details>
This section describes the automated systems used to maintain a machine-readable index of the GestaltView v2 codebase. These systems ensure that Digital Intelligences (DIs) like Billy and external collaborators (e.g., Perplexity AI) have access to an accurate, up-to-date map of the repository's files, routes, API endpoints, and constitutional invariants.

#### Automated Manifest Generation

The core of the sync system is the `generate_repo_manifest.py` script. This utility crawls the repository to generate a comprehensive snapshot of the system state, producing both a Markdown summary for human consumption and a JSON manifest for machine processing.

##### Key Functions and Implementation

The script performs static analysis of the codebase to extract metadata:

- **Route Extraction**: Scans `client/src/App.tsx` to build a map of all frontend routes and their corresponding source files [docs/gestaltview-v2.manifest.md65-174](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L65-L174)
- **Constitutional Mapping**: Injects the 5 User Invariants and 5 Digital Intelligence Invariants directly into the manifest metadata [docs/gestaltview-v2.manifest.json8-74](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L8-L74)
- **Metric Aggregation**: Calculates total file counts, sizes, and categorizes files into buckets such as `api`, `component`, `migration`, and `test` [docs/gestaltview-v2.manifest.json76-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L76-L105)
- **Git Integration**: Records the current branch, commit SHA, and identifies "dirty" (uncommitted) files to provide context for the current build [docs/gestaltview-v2.manifest.json106-114](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L106-L114)

##### Manifest Data Flow

The manifest generation process acts as a bridge between the "Code Entity Space" (raw files) and the "Natural Language Space" (documentation and AI context).

Title: Manifest Generation and Distribution Flow

```mermaid
flowchart TD
  App["client/src/App.tsx"]
  Pkg["package.json"]
  Src["Source Files (*.ts, *.tsx, *.py)"]
  GenScript["scripts/generate_repo_manifest.py"]
  JSON["docs/gestaltview-v2.manifest.json"]
  MD["docs/gestaltview-v2.manifest.md"]
  PerpSync["scripts/sync-perplexity.ts"]
  Packet[".perplexity/GestaltView-Collaboration-Onboarding-Packet/"]
  Billy["Billy DI Runtime"]
  App --> GenScript
  Pkg --> GenScript
  Src --> GenScript
  GenScript --> JSON
  GenScript --> MD
  JSON --> PerpSync
  MD --> PerpSync
  JSON --> Billy
  PerpSync --> Packet
```

**Sources:** [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py) [docs/gestaltview-v2.manifest.json1-7](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L1-L7)

---

#### Perplexity Collaboration Packet

The `.perplexity/` directory serves as a specialized synchronization hub for external AI collaboration. It mirrors critical documentation and manifests into a structure optimized for the Perplexity "Pages" and "Collections" features.

##### SYNC\_MANIFEST.json

The `SYNC_MANIFEST.json` file tracks the relationship between source files and their mirrored counterparts in the collaboration packet. It uses SHA-256 hashing to ensure that documentation remains in sync with the live codebase [.perplexity/SYNC\_MANIFEST.json1-85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json#L1-L85)

| Property | Description |
| --- | --- |
| `generatedAt` | Timestamp of the last sync operation [.perplexity/SYNC\_MANIFEST.json2](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json#L2-L2) |
| `source` | The original file path in the repository [.perplexity/SYNC\_MANIFEST.json7](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json#L7-L7) |
| `target` | The destination path within the `.perplexity/` bundle [.perplexity/SYNC\_MANIFEST.json8](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json#L8-L8) |
| `sha256` | Hash used to detect staleness and trigger updates [.perplexity/SYNC\_MANIFEST.json9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json#L9-L9) |
| `inSync` | Boolean flag indicating the current status [.perplexity/SYNC\_MANIFEST.json10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json#L10-L10) |

##### Onboarding Packet Structure

The `GestaltView-Collaboration-Onboarding-Packet` is a subset of the repository designed to provide a "clean room" environment for onboarding new DIs or developers.

- **04\_RUNTIME\_AND\_SCHEMA**: Contains the `repo_manifest.json` and `repo_manifest.md` generated by the script [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.json1-7](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json#L1-L7)
- **07\_CURRENT\_STATE\_AND\_EVIDENCE**: Contains `CurrentState.md`, which provides a log of the most recent architectural changes and validation results [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07\_CURRENT\_STATE\_AND\_EVIDENCE/CurrentState.md1-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md?plain=1#L1-L25)

**Sources:** [.perplexity/SYNC\_MANIFEST.json1-85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json#L1-L85) [docs/CurrentState.md1-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L1-L25)

---

#### Documentation Continuity

To prevent "context drift" during long development cycles, the repository utilizes a `Session Handoff Packet` protocol. This ensures that the state of the manifest and the state of the developer's intent are aligned.

##### Handoff and Continuity Stack

The system relies on three primary files to maintain documentation-code parity:

1. **docs/CurrentState.md**: A live log of the most recent technical pass, including validation performed and deferred items [docs/CurrentState.md1-12](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L1-L12)
2. **docs/SessionHandoffPacket.md**: A template for packaging the current state, verified files, and next actions for the next session [docs/SessionHandoffPacket.md21-89](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SessionHandoffPacket.md?plain=1#L21-L89)
3. **docs/ContinuityStack.md**: The canonical routing layer for cross-session state [docs/SessionHandoffPacket.md6](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SessionHandoffPacket.md?plain=1#L6-L6)

##### Sync Validation

The `scripts/test-manifest-sync.sh` utility (referenced in the orientation check) ensures that the manifests are not more than 7 days old, enforcing a "freshness" invariant on the repository's machine-readable documentation [client/src/App.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx)

Title: Documentation and Manifest Sync Lifecycle

```mermaid
sequenceDiagram
  participant Dev as Developer/Action
  participant Script as generate_repo_manifest.py
  participant Manifest as docs/gestaltview-v2.manifest.json
  participant Sync as SYNC_MANIFEST.json
  participant Perp as Perplexity Packet
  Dev->>Script: Run manifest update
  Script->>Manifest: Update file counts & routes
  Dev->>Sync: Check SHA-256 hashes
  Sync->>Perp: Copy updated source to target
  Sync->>Sync: Update inSync = true
  Sync->>Sync: Maintain state
  Dev->>Dev: Commit updated manifests
```

**Sources:** [docs/SessionHandoffPacket.md1-122](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SessionHandoffPacket.md?plain=1#L1-L122) [.perplexity/SYNC\_MANIFEST.json1-85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json#L1-L85) [docs/gestaltview-v2.manifest.json1-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json#L1-L105)

---

## Volume: Frontend & Product Surfaces

### Frontend Architecture

> Source MHT: `Frontend Architecture _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2-frontend-architecture

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_lib/inner-world.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts)
- [api/inner-world/artifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts)
- [client/src/App.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx)
- [client/src/components/BillyWalkthrough.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyWalkthrough.tsx)
- [client/src/components/FloatingEmbers.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FloatingEmbers.tsx)
- [client/src/components/Scaffold.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Scaffold.tsx)
- [client/src/components/SubpageQuickNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SubpageQuickNav.tsx)
- [client/src/components/TopNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx)
- [client/src/components/home/GestaltViewInterface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/GestaltViewInterface.tsx)
- [client/src/components/home/Hero.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/Hero.tsx)
- [client/src/components/home/modules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/modules.ts)
- [client/src/components/inner-world/InnerWorldArtifactGallery.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx)
- [client/src/hooks/useSEO.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts)
- [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts)
- [client/src/lib/blackboardRecapArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts)
- [client/src/lib/creationCornerArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/creationCornerArtifacts.ts)
- [client/src/lib/innerWorldFiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts)
- [client/src/pages/AgentCouncilPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx)
- [client/src/pages/BlackboardRoomPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/BlackboardRoomPage.tsx)
- [client/src/pages/CreationCornerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/CreationCornerPage.tsx)
- [client/src/pages/DynamicInnerWorldPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DynamicInnerWorldPage.tsx)
- [client/src/pages/ExternalScaffoldPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ExternalScaffoldPage.tsx)
- [client/src/pages/Home.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx)
- [client/src/pages/SanctuaryPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SanctuaryPage.tsx)
- [client/src/pages/SandboxArtifactDetailPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxArtifactDetailPage.tsx)
- [client/src/prerender.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx)
- [client/src/tests/blackboard-recap-artifacts.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/blackboard-recap-artifacts.test.ts)
- [client/src/tests/inner-world-files.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/inner-world-files.test.ts)
- [docs/ROOM\_DEFINITIONS.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1)
- [supabase/migrations/20260625174800\_widen\_inner\_world\_artifacts\_status.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260625174800_widen_inner_world_artifacts_status.sql)

</details>
The GestaltView v2 frontend is a high-performance React 19 application built with Vite and Wouter. It implements a "Multi-Room" spatial metaphor where the user navigates through distinct interactive environments—Blackboard Room, Sanctuary, External Scaffold, Creation Corner, and Dynamic Inner World—to manage the lifecycle of digital intelligence and personal artifacts.

The architecture emphasizes a "BillyLive" aesthetic, characterized by high-contrast teal-on-black themes, scanlines, and fluid animations powered by Framer Motion and Babylon.js.

#### Application Shell & Routing

The application entry point is `App.tsx`, which manages a manifest of over 80 routes using the `wouter` router [client/src/App.tsx5-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L5-L105) The shell is wrapped in a suite of providers that handle authentication, theme persistence, and the Billy AI runtime context.

##### Key Shell Components

| Component | Responsibility |
| --- | --- |
| `App.tsx` | Route manifest, lazy loading strategy, and global error boundaries [client/src/App.tsx1-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L1-L120) |
| `TopNav.tsx` | Global navigation with feature-flagged items and DI presence indicators [client/src/components/TopNav.tsx38-51](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L38-L51) |
| `BillyProvider` | Orchestrates the Billy AI interaction state across all rooms [client/src/App.tsx15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L15-L15) |
| `useSEO` | Hook for dynamic metadata, canonical URLs, and accessibility-friendly H1 management [client/src/hooks/useSEO.ts41-91](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts#L41-L91) |

For details, see [Application Shell: Routing, Navigation & Providers](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.1-application-shell:-routing-navigation-and-providers).

---

#### The Five Rooms Architecture

The core user experience is divided into five interactive "Rooms," each serving a specific stage of the cognitive capture and synthesis lifecycle.

##### Room-to-Code Mapping

The following diagram bridges the conceptual "Rooms" to their specific implementation files and the primary DI personas that inhabit them.

For details, see [The Five Rooms](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.2-the-five-rooms).

---

#### Visual Design System & Atmosphere

The frontend utilizes a specialized "Atmosphere" system to provide visual identity to each room without code duplication. While most rooms use `BabylonAtmosphere` for 3D orb rendering [client/src/pages/BlackboardRoomPage.tsx8](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/BlackboardRoomPage.tsx#L8-L8) specific rooms like the Sanctuary use a custom layered atmosphere consisting of `WillowTreeOverlay`, `FloatingEmbers`, and `FogOverlay` [client/src/pages/SanctuaryPage.tsx48-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SanctuaryPage.tsx#L48-L50)

##### Billy UI Components

The "BillyLive" aesthetic is implemented through:

- **ThinkingAnimation**: A procedural text-based loading state [client/src/pages/BlackboardRoomPage.tsx10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/BlackboardRoomPage.tsx#L10-L10)
- **BillyBabylon**: A 3D WebGL orb representing the DI's current mood (idle, listening, processing, speaking) [client/src/pages/AgentCouncilPage.tsx89-92](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L89-L92)
- **GlassCard**: A high-blur backdrop-filter component used for UI overlays [client/src/pages/Home.tsx18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx#L18-L18)

For details, see [Billy UI Components & Visual Atmosphere](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.3-billy-ui-components-and-visual-atmosphere).

---

#### Artifact Rendering Pipeline

When a user captures a "Bucket Drop" or synthesizes a document in the Creation Corner, it enters the client-side Rendering Engine. This pipeline classifies the content (Markdown, Mermaid diagrams, Video, etc.) and selects the appropriate renderer.

##### Rendering Workflow

1. **Classification**: `artifactCardModel.ts` determines the `contentType` (html, image, or text) [client/src/pages/DynamicInnerWorldPage.tsx67-84](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DynamicInnerWorldPage.tsx#L67-L84)
2. **Dispatch**: `renderArtifact` in `renderingClient.ts` routes the data to the correct UI component [client/src/pages/CreationCornerPage.tsx48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/CreationCornerPage.tsx#L48-L48)
3. **Export**: `ArtifactExportViewer` allows users to download artifacts in PNG, PDF, or HTML formats [client/src/pages/CreationCornerPage.tsx47](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/CreationCornerPage.tsx#L47-L47)

For details, see [Artifact Rendering Pipeline (Client)](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.4-artifact-rendering-pipeline-(client)).

---

#### Specialized Feature Modules

Beyond the core five rooms, the frontend hosts several specialized modules accessible via the `TopNav` or `Home` grid [client/src/pages/Home.tsx24-34](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx#L24-L34)

| Module | Purpose |
| --- | --- |
| **Musical DNA** | Spotify integration for mapping emotional/cognitive signatures to sound [client/src/App.tsx28](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L28-L28) |
| **Transcriptory** | Management of voice captures and blackboard handoffs [client/src/pages/BlackboardRoomPage.tsx45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/BlackboardRoomPage.tsx#L45-L45) |
| **Tribunal** | A multi-agent debate and roundtable environment [client/src/pages/AgentCouncilPage.tsx4-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L4-L9) |
| **GATE Package Builder** | Interface for configuring and ordering DI behavioral frameworks [client/src/App.tsx45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L45-L45) |

For details, see [Specialized Feature Pages & Modules](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.5-specialized-feature-pages-and-modules).

---

#### Code-to-System Relationship

This diagram illustrates how core frontend hooks and libraries connect the UI to the backend and DI runtimes.

Sources: [client/src/App.tsx1-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L1-L120) [client/src/pages/BlackboardRoomPage.tsx1-45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/BlackboardRoomPage.tsx#L1-L45) [client/src/pages/SanctuaryPage.tsx1-40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SanctuaryPage.tsx#L1-L40) [client/src/pages/ExternalScaffoldPage.tsx1-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ExternalScaffoldPage.tsx#L1-L60) [client/src/pages/CreationCornerPage.tsx1-55](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/CreationCornerPage.tsx#L1-L55) [client/src/pages/DynamicInnerWorldPage.tsx1-100](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DynamicInnerWorldPage.tsx#L1-L100) [client/src/hooks/useSEO.ts1-91](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts#L1-L91) [client/src/components/TopNav.tsx38-100](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L38-L100) [client/src/components/Scaffold.tsx7-55](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Scaffold.tsx#L7-L55)

---

### Application Shell: Routing, Navigation & Providers

> Source MHT: `Application Shell_ Routing, Navigation & Providers _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.1-application-shell:-routing-navigation-and-providers  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/.env.example](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/.env.example)
- [client/public/gestaltview\_sitemap.html](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/public/gestaltview_sitemap.html)
- [client/public/gestaltview\_sitemap.txt](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/public/gestaltview_sitemap.txt)
- [client/public/gestaltview\_sitemap.xml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/public/gestaltview_sitemap.xml)
- [client/public/robots.txt](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/public/robots.txt)
- [client/public/sitemap.xml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/public/sitemap.xml)
- [client/src/App.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx)
- [client/src/components/BillyWalkthrough.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyWalkthrough.tsx)
- [client/src/components/ExhibitPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ExhibitPage.tsx)
- [client/src/components/FloatingEmbers.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FloatingEmbers.tsx)
- [client/src/components/PublicPageFrame.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/PublicPageFrame.tsx)
- [client/src/components/SubpageQuickNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SubpageQuickNav.tsx)
- [client/src/components/TopNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx)
- [client/src/components/alzheimers/DaydreamerMode.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/alzheimers/DaydreamerMode.tsx)
- [client/src/components/alzheimers/pages/index.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/alzheimers/pages/index.tsx)
- [client/src/components/home/GestaltViewInterface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/GestaltViewInterface.tsx)
- [client/src/components/home/Hero.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/Hero.tsx)
- [client/src/components/home/modules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/modules.ts)
- [client/src/components/sanctuary/SanctuaryStudio.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/sanctuary/SanctuaryStudio.tsx)
- [client/src/components/ui/GlassCard.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ui/GlassCard.tsx)
- [client/src/hooks/useSEO.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts)
- [client/src/index.css](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/index.css)
- [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts)
- [client/src/pages/ADHDPowerUpPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ADHDPowerUpPage.tsx)
- [client/src/pages/AdaptiveLayoutPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AdaptiveLayoutPage.tsx)
- [client/src/pages/AddictionRecoveryPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AddictionRecoveryPage.tsx)
- [client/src/pages/AgentCouncilPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx)
- [client/src/pages/AgentTrainerDevCliPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerDevCliPage.tsx)
- [client/src/pages/AgentTrainerPricing.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerPricing.tsx)
- [client/src/pages/BrainSparksPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/BrainSparksPage.tsx)
- [client/src/pages/ContactPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ContactPage.tsx)
- [client/src/pages/FAQ.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/FAQ.tsx)
- [client/src/pages/GATEOrderStatusPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GATEOrderStatusPage.tsx)
- [client/src/pages/GATEPackageBuilderPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GATEPackageBuilderPage.tsx)
- [client/src/pages/Home.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx)
- [client/src/pages/HostedAgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/HostedAgentTrainerPage.tsx)
- [client/src/pages/NotFound.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/NotFound.tsx)
- [client/src/pages/PrivacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/PrivacyPage.tsx)
- [client/src/pages/SandboxArtifactDetailPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxArtifactDetailPage.tsx)
- [client/src/pages/Terms.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Terms.tsx)
- [client/src/pages/gestaltview\_sitemap.html](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/gestaltview_sitemap.html)
- [client/src/pages/gestaltview\_sitemap.txt](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/gestaltview_sitemap.txt)
- [client/src/pages/gestaltview\_sitemap.xml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/gestaltview_sitemap.xml)
- [client/src/pages/scaffold/externalScaffoldContent.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/scaffold/externalScaffoldContent.ts)
- [client/src/prerender.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx)
- [client/src/theme/colors.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/theme/colors.ts)
- [public/gestaltview\_sitemap.html](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/public/gestaltview_sitemap.html)
- [public/gestaltview\_sitemap.txt](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/public/gestaltview_sitemap.txt)
- [public/robots.txt](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/public/robots.txt)
- [public/sitemap.html](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/public/sitemap.html)
- [public/sitemap.txt](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/public/sitemap.txt)
- [public/sitemap.xml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/public/sitemap.xml)
- [scripts/gestaltview-crawler.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview-crawler.py)

</details>
The GestaltView v2 application shell is a React 19 single-page application (SPA) built on Vite, utilizing `wouter` for lightweight routing and a centralized provider architecture to manage authentication, theme, and AI context. The shell implements a "Five Room" workflow, transitioning users from raw capture to structured artifacts through a highly stylized, neurodivergent-native interface.

##### Routing Architecture

The application uses `wouter` for routing, defined in `client/src/App.tsx`. The manifest includes over 80 routes, ranging from core room interfaces to specialized modules and administrative dashboards [client/src/App.tsx23-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L23-L105)

###### Lazy Loading Strategy

To optimize initial bundle size, the application extensively uses React `lazy` and `Suspense` for almost all route components [client/src/App.tsx23-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L23-L105) This ensures that heavy dependencies (like BabylonJS for the Dynamic Inner World or Mermaid.js for diagrams) are only loaded when the user navigates to those specific surfaces.

###### Route Manifest Overview

| Route Category | Key Paths | Description |
| --- | --- | --- |
| **Core Rooms** | `/sanctuary`, `/blackboard-room`, `/dynamic-inner-world`, `/external-scaffold`, `/creation-corner` | The primary "Workflow Spine" of the platform [client/src/lib/billy-runtime-guide.ts3-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts#L3-L9) |
| **Modules** | `/musical-dna`, `/resume-rockstar`, `/symbiocoder`, `/vibe-coder`, `/masterclass` | Specialized AI-powered tools [client/src/App.tsx98-103](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L98-L103) |
| **DI Governance** | `/tribunal`, `/embodiment-studio`, `/digital-intelligence-academy` | Tools for managing Agent Council and DI personas [client/src/App.tsx92-94](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L92-L94) |
| **Infrastructure** | `/schema-dashboard`, `/analytics`, `/agent-trainer/control-plane` | Admin and operational monitoring surfaces [client/src/App.tsx55-57](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L55-L57) |

**Sources:** [client/src/App.tsx23-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L23-L105) [client/src/lib/billy-runtime-guide.ts3-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts#L3-L9)

---

##### Core Providers & Context

The application state is governed by a hierarchy of providers wrapped around the `Switch` component in `App.tsx` [client/src/App.tsx189-230](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L189-L230)

- **AuthProvider**: Manages Supabase authentication state, user tiers (Free, Core, Pro, Enterprise), and founder-level permissions [client/src/contexts/AuthContext.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/AuthContext.tsx)
- **ThemeProvider**: Controls the visual "atmosphere" of the platform, facilitating transitions between high-contrast "BillyLive" modes and softer "Sanctuary" modes [client/src/contexts/ThemeContext.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/ThemeContext.tsx)
- **BillyProvider**: Maintains the state of the Billy AI assistant, including the current "Billy Section" context, which allows Billy to provide location-aware guidance [client/src/components/Billy.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Billy.tsx)

###### Data Flow: Routing and Navigation

The following diagram illustrates how the navigation components interact with the routing engine and feature flagging system.

**Navigation & Feature Flagging Flow**

```mermaid
flowchart TD
  TN["TopNav"]
  SQN["SubpageQuickNav"]
  HC["Home (Room Cards)"]
  W["Wouter Switch"]
  App["App.tsx Manifest"]
  FF["isFeatureEnabled()"]
  AC["AuthProvider"]
  BC["BillyProvider"]
  TN -->|Filters Items| FF
  TN -->|Reads User Tier| AC
  HC -->|Sets Context| BC
  TN -->|Navigate| W
  SQN -->|Resolve Secondary Target| W
  W -->|Lazy Load| App
```

**Sources:** [client/src/App.tsx189-230](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L189-L230) [client/src/components/TopNav.tsx91-94](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L91-L94) [client/src/components/SubpageQuickNav.tsx9-131](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SubpageQuickNav.tsx#L9-L131) [client/src/config/featureFlags.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/config/featureFlags.ts)

---

##### Navigation Systems

###### TopNav

The `TopNav` component provides a persistent global header. It dynamically filters navigation items based on the `isFeatureEnabled` utility [client/src/components/TopNav.tsx91-94](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L91-L94) It also includes a "Quick DI Launch" dropdown, allowing users to quickly jump into a Masterclass session with specific personas like "The Architect" or "The Weaver" [client/src/components/TopNav.tsx67-74](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L67-L74)

###### SubpageQuickNav

`SubpageQuickNav` is a specialized navigation aid that appears on subpages to provide a "Back" context that isn't strictly hierarchical. It uses `resolveSecondaryTarget` to map the current location to a logical predecessor (e.g., `/blackboard-room` maps back to `/sanctuary`) [client/src/components/SubpageQuickNav.tsx9-131](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SubpageQuickNav.tsx#L9-L131)

###### Feature Flagging

Feature flagging is centralized via `isFeatureEnabled(flag: FeatureFlag)`. This allows the platform to hide unfinished rooms or restrict specific modules (like `transcriptory` or `agentCouncil`) to specific environments or user tiers [client/src/config/featureFlags.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/config/featureFlags.ts) [client/src/components/TopNav.tsx38-51](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L38-L51)

**Sources:** [client/src/components/TopNav.tsx38-51](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L38-L51) [client/src/components/TopNav.tsx67-74](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L67-L74) [client/src/components/SubpageQuickNav.tsx9-131](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SubpageQuickNav.tsx#L9-L131)

---

##### SEO & Prerendering

GestaltView implements a dual-layer SEO strategy to ensure visibility for crawlers despite being a heavy SPA.

###### useSEO Hook

The `useSEO` hook is used within page components to dynamically update document metadata (title, description, canonical URL) and inject a hidden `h1` for accessibility and indexability [client/src/hooks/useSEO.ts41-91](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts#L41-L91) It includes a centralized `PAGE_SEO` record that maps route IDs to metadata [client/src/hooks/useSEO.ts93-162](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts#L93-L162)

###### prerender.tsx

At build time, `client/src/prerender.tsx` is executed by the `vite-prerender-plugin`. This script renders a lightweight HTML shell for every major route. It intentionally excludes heavy libraries like BabylonJS or Framer Motion to remain compatible with Node.js environments [client/src/prerender.tsx8-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx#L8-L15)

**SEO Implementation Mapping**

```mermaid
flowchart TD
  Pre["prerender.tsx"]
  Meta["ROUTE_META"]
  Vite["Vite Prerender Plugin"]
  Static["Static HTML Shells"]
  Hook["useSEO.ts"]
  DOM["document.head / h1"]
  Comp["Page Component"]
  Pre -->|Reads| Meta
  Vite -->|Executes| Pre
  Pre -->|Generates| Static
  Hook -->|Injects| DOM
  Comp --> Hook
```

**Sources:** [client/src/hooks/useSEO.ts41-91](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts#L41-L91) [client/src/prerender.tsx1-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx#L1-L15) [client/src/prerender.tsx29-156](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx#L29-L156)

---

##### Application Atmosphere & Home Surface

The `Home.tsx` component serves as the "Gateway" to the five rooms. It utilizes a high-fidelity visual stack:

- **FloatingEmbers**: A neon plasma particle system that provides depth and motion [client/src/components/FloatingEmbers.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FloatingEmbers.tsx)
- **Hero Canvas**: Renders a rolling fog and aurora effect using the 2D Canvas API [client/src/components/home/Hero.tsx45-148](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/Hero.tsx#L45-L148)
- **Room Cards**: A grid of `GlassCard` components that represent the primary workflow doorways, each with a specific neon glow color [client/src/pages/Home.tsx24-34](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx#L24-L34)

**Sources:** [client/src/pages/Home.tsx24-34](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx#L24-L34) [client/src/components/home/Hero.tsx45-148](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/Hero.tsx#L45-L148) [client/src/components/FloatingEmbers.tsx27-36](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FloatingEmbers.tsx#L27-L36)

---

### The Five Rooms

> Source MHT: `The Five Rooms _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.2-the-five-rooms  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [DYNAMIC\_INNER\_WORLD\_MUSEUM\_HALL\_IMPLEMENTATION.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/DYNAMIC_INNER_WORLD_MUSEUM_HALL_IMPLEMENTATION.md?plain=1)
- [api/\_lib/inner-world.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts)
- [api/inner-world/artifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts)
- [client/src/canonical/CURRENT\_STATE.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/CURRENT_STATE.md?plain=1)
- [client/src/components/ArtifactExpandView.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactExpandView.tsx)
- [client/src/components/BlueprintGenerativeWorkbench.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BlueprintGenerativeWorkbench.tsx)
- [client/src/components/InsightOrb.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/InsightOrb.tsx)
- [client/src/components/OrbGraph.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/OrbGraph.tsx)
- [client/src/components/RoomStateBadge.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/RoomStateBadge.tsx)
- [client/src/components/Scaffold.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Scaffold.tsx)
- [client/src/components/capture/BlackboardCompanionChat.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/capture/BlackboardCompanionChat.tsx)
- [client/src/components/capture/UniversalCaptureBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/capture/UniversalCaptureBar.tsx)
- [client/src/components/inner-world/InnerWorldArtifact.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifact.tsx)
- [client/src/components/inner-world/InnerWorldArtifactGallery.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx)
- [client/src/components/inner-world/InnerWorldInspector.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldInspector.tsx)
- [client/src/components/inner-world/InnerWorldRoom.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldRoom.tsx)
- [client/src/data/personas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/personas.ts)
- [client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/buildWorldPlan.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/buildWorldPlan.ts)
- [client/src/features/dynamic-inner-world/world-renderer/components/ArchiveVault.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ArchiveVault.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/ArtifactConstellation.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ArtifactConstellation.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/CuratorConsole.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/CuratorConsole.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/EmptyHallState.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/EmptyHallState.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/ExhibitPod.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ExhibitPod.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/ResonanceRail.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ResonanceRail.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/SearchControlDeck.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/SearchControlDeck.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/WorldAtrium.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/WorldAtrium.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/WorldStatsRibbon.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/WorldStatsRibbon.tsx)
- [client/src/lib/blackboardRecapArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts)
- [client/src/lib/captureRouting.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/captureRouting.ts)
- [client/src/lib/creationCornerArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/creationCornerArtifacts.ts)
- [client/src/lib/innerWorldFiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts)
- [client/src/lib/livingCanvas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/livingCanvas.ts)
- [client/src/lib/roomState.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/roomState.ts)
- [client/src/lib/scaffoldStorage.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/scaffoldStorage.ts)
- [client/src/pages/BlackboardRoomPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/BlackboardRoomPage.tsx)
- [client/src/pages/CreationCornerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/CreationCornerPage.tsx)
- [client/src/pages/DynamicInnerWorldPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DynamicInnerWorldPage.tsx)
- [client/src/pages/ExternalScaffoldPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ExternalScaffoldPage.tsx)
- [client/src/pages/SanctuaryPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SanctuaryPage.tsx)
- [client/src/pages/WhiteboardRoomPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/WhiteboardRoomPage.tsx)
- [client/src/tests/blackboard-recap-artifacts.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/blackboard-recap-artifacts.test.ts)
- [client/src/tests/creation-corner-intake-controls.test.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/creation-corner-intake-controls.test.tsx)
- [client/src/tests/inner-world-files.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/inner-world-files.test.ts)
- [client/src/tests/personas.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/personas.test.ts)
- [docs/ROOM\_DEFINITIONS.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1)
- [shared/gen-engine/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/gen-engine/index.ts)
- [supabase/migrations/20260625174800\_widen\_inner\_world\_artifacts\_status.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260625174800_widen_inner_world_artifacts_status.sql)

</details>
The GestaltView v2.0 architecture is organized into five interactive "Rooms." Each room represents a specific cognitive mode—Active, Structural, or Reflective—and serves as a stage in the capture lifecycle, transforming raw input into high-fidelity `CodexArtifact` entities.

#### The Capture Lifecycle

The transition from a raw thought to a permanent artifact follows a defined pipeline across the room architecture.

| Stage | Entity | Room | Description |
| --- | --- | --- | --- |
| **Capture** | `CaptureOrb` | Blackboard Room | Raw text, voice, or file input. |
| **Mapping** | `ScaffoldArtifact` | External Scaffold | Structural placement and causal linking. |
| **Forging** | `CodexArtifact` | Creation Corner | Generative synthesis into structured documents/media. |
| **Reflection** | `InnerWorldArtifact` | Dynamic Inner World | Museum-grade exhibit of synthesized meaning. |

**Sources:** `client/src/components/Scaffold.tsx:L7-L109`, `docs/ROOM_DEFINITIONS.md:L12-L23`

---

#### 1. Blackboard Room (Active / Contextual)

The **Blackboard Room** is the primary workspace for real-time collaboration between the user and a Digital Intelligence (DI), typically **Billy**. It is designed for "Mode 1" (Active) work, where clutter is minimized to focus on the current session.

##### Key Implementation

- **File:** `client/src/pages/BlackboardRoomPage.tsx`
- **Routing:** Uses `routeBlackboardResponder` to manage DI interactions `client/src/pages/BlackboardRoomPage.tsx:L13`.
- **Capture Mechanism:** Integrates `UniversalCaptureBar` for raw text and voice intake `client/src/components/capture/UniversalCaptureBar.tsx:L23`.

##### Session Recap Workflow

The room features a `SessionRecapGenerator` that synthesizes the entire session history into a self-contained HTML artifact.

- **Function:** `appendBlackboardRecapToInnerWorld` `client/src/lib/blackboardRecapArtifacts.ts`.
- **Output:** A `RecapArtifact` that is automatically routed to the Dynamic Inner World `docs/ROOM_DEFINITIONS.md:L68-L71`.

**Sources:** `client/src/pages/BlackboardRoomPage.tsx:L48-L91`, `docs/ROOM_DEFINITIONS.md:L46-L93`

---

#### 2. External Scaffold (Accumulated / Structural)

The **External Scaffold** represents "Mode 2" (Accumulated). It provides a complete cumulative visual layer of all `CaptureOrb` entities, organized by category and causal connections.

##### Data Flow: Capture to Scaffold

1. Raw input is wrapped in a `CaptureOrb` `client/src/components/Scaffold.tsx:L94-L109`.
2. Orbs are placed in the `scaffoldQueue` (pending status) `client/src/components/Scaffold.tsx:L198`.
3. Upon approval via `approveScaffoldOrbThroughPipeline`, they become `ScaffoldArtifacts` with 3D coordinates `client/src/lib/profilePipeline/scaffoldRouting.ts:L53`.

##### Visual Mapping

The Scaffold uses a "Galaxy" layout where artifacts are projected based on resonance and time.

- **Projection Logic:** `projectArtifact()` calculates `left`, `top`, and `displaySize` based on the `ScaffoldPosition` (x, y, z) `client/src/pages/ExternalScaffoldPage.tsx:L96-L104`.

**Sources:** `client/src/pages/ExternalScaffoldPage.tsx:L126-L208`, `client/src/components/Scaffold.tsx:L147-L161`

---

#### 3. Creation Corner (Artifact Forging)

The **Creation Corner** is the "Forge" where raw captures are synthesized into high-order artifacts. It interfaces with the `Gen Engine` to produce structured outputs.

##### Synthesis Process

Users select `CaptureBlueprints` (collections of orbs) and "materialize" them into specific `ArtifactTypes` such as `markdown`, `mind_map`, or `code`.

##### Technical Pipeline

1. **Selection:** `readBlueprints()` retrieves stored collections `client/src/pages/CreationCornerPage.tsx:L25`.
2. **Orchestration:** `requestOrchestrationDecision()` determines the best DI for the task `client/src/pages/CreationCornerPage.tsx:L21`.
3. **Synthesis:** `synthesizeArtifact()` (aliased from `createArtifact`) calls the `/api/codex/forge` endpoint `client/src/pages/CreationCornerPage.tsx:L20`.
4. **Result:** Produces a `CodexArtifact` containing HTML, Markdown, or JSON exports `shared/codex/contracts.ts`.

**Sources:** `client/src/pages/CreationCornerPage.tsx:L149-L180`, `docs/ROOM_DEFINITIONS.md:L123-L150`

---

#### 4. Dynamic Inner World (Reflective / Museum)

The **Dynamic Inner World** (Museum of You) is "Mode 3" (Reflective). It displays synthesized `InnerWorldArtifactRecord` entities as high-fidelity exhibits.

##### The World Renderer

The room utilizes a specialized spatial renderer to organize artifacts across six surfaces: `forward`, `back`, `left`, `right`, `ceiling`, and `floor`.

##### Entity Mapping: Code to UI

The following diagram illustrates how the `InnerWorldArtifactRecord` data structure is transformed into the visual "Exhibit" components.

**Diagram: Artifact to Museum Exhibit Mapping**

```mermaid
flowchart TD
  A["InnerWorldArtifactRecord"]
  B["HtmlArtifactRenderer"]
  C["ResonanceRail"]
  D["CuratorConsole"]
  E["ExhibitPod"]
  F["DynamicWorldSpaceRenderer"]
  G["WorldAtrium"]
  H["api/inner-world/artifacts.ts"]
  I["Supabase: inner_world_artifacts"]
  A -->|html| B
  A -->|tags| C
  A -->|originRoom| D
  B -->|renders in| E
  E -->|placed by| F
  F -->|populates| G
  H -->|GET / POST| A
  I --> H
```

**Sources:** `client/src/lib/innerWorldFiles.ts:L35-L50`, `client/src/components/inner-world/InnerWorldRoom.tsx:L16-L56`, `api/inner-world/artifacts.ts:L87-L108`

---

#### 5. Sanctuary (Restoration / Privacy)

The **Sanctuary** is a private, low-intensity room for journaling and unclassified fragments. Unlike other rooms, it does not use the standard `BabylonAtmosphere`.

##### Unique Characteristics

- **Visual Identity:** Implements `WillowTreeOverlay`, `FloatingEmbers`, and `FogOverlay` for a distinct aesthetic `client/src/pages/SanctuaryPage.tsx:L48-L50`.
- **Privacy:** Designed for "Mode 1" writing that is not yet ready for the Scaffold `docs/ROOM_DEFINITIONS.md:L154-L158`.
- **Integrations:** Hosts the `MusicalDNAHub` for personal musical identity tracking `client/src/pages/SanctuaryPage.tsx:L23`.

**Sources:** `client/src/pages/SanctuaryPage.tsx:L12-L42`, `docs/ROOM_DEFINITIONS.md:L152-L178`

---

#### Room Interaction and Data Flow

The following diagram maps the transition of data through the "Five Rooms" pipeline, specifically highlighting the functions and API handlers involved.

**Diagram: The Five Rooms Data Pipeline**

```mermaid
sequenceDiagram
  participant BBR as Blackboard Room
  participant SCA as External Scaffold
  participant CRN as Creation Corner
  participant DIW as Dynamic Inner World
  participant DB as Supabase / API
  Note over BBR: User inputs raw thought
  BBR->>DB: createCaptureOrb()
  DB-->>SCA: appendScaffoldQueue()
  Note over SCA: User approves & links orbs
  SCA->>DB: approveScaffoldOrbThroughPipeline()
  Note over CRN: User builds Blueprint
  CRN->>DB: materializeCreationCornerBlueprint()
  DB->>DB: POST /api/codex/forge
  Note over DIW: Final Synthesis Display
  DB-->>DIW: buildInnerWorldArtifactPayload()
  DIW->>DIW: DynamicWorldSpaceRenderer.render()
```

**Sources:** `client/src/lib/captureRouting.ts`, `client/src/lib/profilePipeline/scaffoldRouting.ts:L53`, `client/src/pages/CreationCornerPage.tsx:L43`, `api/_lib/inner-world.ts:L7-L9`

---

### Billy UI Components & Visual Atmosphere

> Source MHT: `Billy UI Components & Visual Atmosphere _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.3-billy-ui-components-and-visual-atmosphere  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [client/src/components/Billy.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Billy.tsx)
- [client/src/components/BillyBabylon.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyBabylon.tsx)
- [client/src/components/BillyLive.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx)
- [client/src/components/ConsciousnessEngine.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ConsciousnessEngine.tsx)
- [client/src/components/ContinuumTimeline3D.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ContinuumTimeline3D.tsx)
- [client/src/components/HeroCanvas.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/HeroCanvas.tsx)
- [client/src/components/MassExodusButton.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/MassExodusButton.tsx)
- [client/src/components/NavBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NavBar.tsx)
- [client/src/components/NeuralThinkingIndicator.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NeuralThinkingIndicator.tsx)
- [client/src/components/SanctuaryWillowBabylon.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SanctuaryWillowBabylon.tsx)
- [client/src/components/TheoriesMap.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TheoriesMap.tsx)
- [client/src/components/agent-trainer/AgentFlowRail.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/agent-trainer/AgentFlowRail.tsx)
- [client/src/components/exhibits/BabylonScrollArtifact.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/exhibits/BabylonScrollArtifact.tsx)
- [client/src/components/exhibits/ExhibitDemos.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/exhibits/ExhibitDemos.tsx)
- [client/src/components/thinking/ThinkingAnimation.css](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/thinking/ThinkingAnimation.css)
- [client/src/components/thinking/ThinkingAnimation.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/thinking/ThinkingAnimation.tsx)
- [client/src/data/exhibits.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/exhibits.ts)
- [client/src/data/platformModules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/platformModules.ts)
- [client/src/hooks/useTribunalRetry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useTribunalRetry.ts)
- [client/src/lib/MusicalDNAVisualizer.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/MusicalDNAVisualizer.ts)
- [client/src/lib/agentFlow.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/agentFlow.ts)
- [client/src/lib/thinkingMessages.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/thinkingMessages.ts)
- [client/src/pages/AlzheimersLegacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AlzheimersLegacyPage.tsx)
- [client/src/pages/ConsultingPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ConsultingPage.tsx)
- [client/src/pages/GravityInspectorPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GravityInspectorPage.tsx)
- [client/src/pages/LivingLegacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/LivingLegacyPage.tsx)
- [client/src/pages/MuseumPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MuseumPage.tsx)
- [client/src/pages/PullStringPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/PullStringPage.tsx)
- [client/src/pages/RapidPrototypePage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/RapidPrototypePage.tsx)
- [vite.config.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vite.config.ts)

</details>
This page details the user interface components and visual design system that define the "Billy" experience. Billy is the primary Digital Intelligence (DI) interface of GestaltView, characterized by a "BillyLive" aesthetic—a high-contrast, teal-on-black, terminal-inspired environment utilizing JetBrains Mono and CRT-style scanlines.

#### 1. Core Chat Interfaces

The platform provides two primary ways to interact with Billy: a persistent sidebar/panel for general use and a dedicated full-screen "Live" experience.

##### Billy.tsx (The Application Shell Interface)

The `Billy.tsx` file defines the standard interface integrated into the platform's layout. It includes:

- **BillyOrb**: A floating presence indicator in the bottom-right corner that renders the `BillyBabylon` avatar [client/src/components/Billy.tsx5](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Billy.tsx#L5-L5)
- **BillyPanel**: A synthesis panel that slides in from the right to facilitate chat, context weaving, and retrieval-grounded synthesis [client/src/components/Billy.tsx6](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Billy.tsx#L6-L6)
- **BillyProvider**: A React context provider that manages state for `isLoading`, `isListening`, and the `currentSection` observer [client/src/components/Billy.tsx8-17](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Billy.tsx#L8-L17)

##### BillyLive.tsx (The Immersive Interface)

`BillyLive.tsx` provides a standalone, full-screen environment. It emphasizes "Founder Continuity" and persistent mode switching [client/src/components/BillyLive.tsx4-6](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L4-L6)

- **Modes**: Users can switch between **THINK** (Synthesis: context weave, retrieval grounding) and **VIBE** (Chat: conversational, no forced frameworks) [client/src/components/BillyLive.tsx60-69](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L60-L69)
- **Aesthetic**: Implements a "March 2026" update featuring a `scanlines` overlay, `sweep-line` animations, and terminal-green/teal color palettes [client/src/components/BillyLive.tsx88-101](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L88-L101)

##### Component Relationship Diagram

This diagram shows how the UI components connect to the underlying DI logic.

```mermaid
flowchart TD
  K["Scanlines/CRT CSS"]
  L["FloatingEmbers"]
  A["BillyOrb"]
  B["BillyBabylon (Orb)"]
  C["BillyPanel"]
  D["BillyMarkdown"]
  E["ThinkingAnimation"]
  F["BillyLive"]
  G["BillyProvider (Context)"]
  H["useBilly() Hook"]
  I["callBillyApi()"]
  J["/api/billy/chat"]
  A -->|renders| B
  C -->|uses| D
  C -->|displays| E
  F -->|wraps| B
  G -->|provides| H
  H -->|triggers| I
  I -->|routes to| J
  A --> G
  C --> G
  F --> G
```

**Sources**: [client/src/components/Billy.tsx19-85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Billy.tsx#L19-L85) [client/src/components/BillyLive.tsx13-112](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L13-L112) [client/src/components/BillyLive.tsx22-30](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L22-L30)

---

#### 2. Visual Atmosphere & Babylon.js Integration

The "Atmosphere" of GestaltView is a blend of brutalist digital aesthetics and organic, ethereal overlays.

##### BillyBabylon (The Orb)

The "heart" of the interface is a 3D avatar rendered using Babylon.js. It responds to Billy's internal state via a `mood` prop:

- **idle**: Standard floating animation [client/src/components/BillyLive.tsx85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L85-L85)
- **listening**: Responsive movement during voice input [client/src/components/BillyLive.tsx86](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L86-L86)
- **processing**: A "glitch" animation used when the LLM is generating a response [client/src/components/BillyLive.tsx87](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L87-L87)

##### Sanctuary & Environmental Overlays

Beyond the chat interface, specific rooms utilize specialized visual components:

- **SanctuaryWillowBabylon**: A fixed overlay for the Sanctuary room. it combines a `WillowTreeOverlay` with fireflies and fog effects to create a restorative atmosphere [client/src/components/SanctuaryWillowBabylon.tsx11-34](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SanctuaryWillowBabylon.tsx#L11-L34)
- **HeroCanvas**: Provides the high-performance background for the landing and "hero" sections of the site.
- **AuroraBackground**: Used in pages like the `MuseumPage` to provide a subtle, shifting light effect [client/src/pages/MuseumPage.tsx81](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MuseumPage.tsx#L81-L81)

##### Atmosphere Data Flow

| Component | Visual Role | Key File Reference |
| --- | --- | --- |
| `BillyBabylon` | 3D DI Avatar (Orb) | [client/src/components/BillyBabylon.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyBabylon.tsx) |
| `SanctuaryWillowBabylon` | Restorative environment (Willow/Fog) | [client/src/components/SanctuaryWillowBabylon.tsx11-34](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SanctuaryWillowBabylon.tsx#L11-L34) |
| `WillowTreeOverlay` | SVG/Canvas tree animation | [client/src/components/SanctuaryWillowBabylon.tsx31](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SanctuaryWillowBabylon.tsx#L31-L31) |
| `ThinkingAnimation` | "In-progress" cognitive visualization | [client/src/components/thinking/ThinkingAnimation.tsx57-63](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/thinking/ThinkingAnimation.tsx#L57-L63) |
| `NeuralThinkingIndicator` | Archetype-specific sigils and phrases | [client/src/components/NeuralThinkingIndicator.tsx4-139](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NeuralThinkingIndicator.tsx#L4-L139) |

**Sources**: [client/src/components/SanctuaryWillowBabylon.tsx1-34](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SanctuaryWillowBabylon.tsx#L1-L34) [client/src/components/BillyLive.tsx71-112](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L71-L112) [client/src/components/NeuralThinkingIndicator.tsx4-139](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NeuralThinkingIndicator.tsx#L4-L139)

---

#### 3. Cognitive State Visualizations

GestaltView uses specific animations to represent the "thinking" process of the Digital Intelligence.

##### ThinkingAnimation.tsx

This component replaces standard loading spinners with narrative "thinking messages."

- **Logic**: It shuffles through an array of `thinkingMessages` (e.g., "Retrieving context shards...", "Consulting the Manifest Index") [client/src/lib/thinkingMessages.ts6-17](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/thinkingMessages.ts#L6-L17)
- **Implementation**: Uses a CSS-based pulse and spin animation on a custom SVG icon [client/src/components/thinking/ThinkingAnimation.css30-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/thinking/ThinkingAnimation.css#L30-L60)

##### NeuralThinkingIndicator.tsx

A more advanced version of the thinking state that adapts based on which DI profile is active (e.g., Billy, The Architect, The Curator).

- **DI Profiles**: Each profile has a unique `sigil`, `color`, and set of `phrases` [client/src/components/NeuralThinkingIndicator.tsx4-139](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NeuralThinkingIndicator.tsx#L4-L139)
- **NeuralSigil**: A kinetic component that spins and pulses in the DI's specific color [client/src/components/NeuralThinkingIndicator.tsx147-181](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NeuralThinkingIndicator.tsx#L147-L181)

##### DI Profile Mapping

| DI Name | Sigil | Color | Logic/Role |
| --- | --- | --- | --- |
| Billy | ⊞ | `#00D4FF` | Synthesis & Bridging |
| The Architect | △ | `#A78BFA` | Structure & Dependencies |
| The Curator | ⊞ | `#F59E0B` | Provenance & Preservation |
| The Guardian | □ | `#F87171` | Constitutional Invariants |
| The Weaver | ∞ | `#34D399` | Cross-session resonance |

**Sources**: [client/src/components/thinking/ThinkingAnimation.tsx1-160](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/thinking/ThinkingAnimation.tsx#L1-L160) [client/src/components/NeuralThinkingIndicator.tsx4-139](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NeuralThinkingIndicator.tsx#L4-L139) [client/src/lib/thinkingMessages.ts1-17](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/thinkingMessages.ts#L1-L17)

---

#### 4. The BillyLive Aesthetic (CSS & Theme)

The "BillyLive" aesthetic is defined by a specific set of constants and global styles used to ensure visual continuity across different chat components.

##### Theme Constants (`T`)

The system uses a unified color palette for terminal-style elements:

- `teal`: `#00D4FF` (Primary interaction)
- `dim`: `#006B7F` (Subtle borders/placeholders)
- `dark`: `#0A0F14` (Main background)
- `ok`: `rgba(16, 185, 129, .7)` (Ready status)
  [client/src/components/BillyLive.tsx36-46](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L36-L46)

##### Key Visual Effects

1. **Scanlines**: A repeating linear gradient that mimics CRT monitor lines [client/src/components/BillyLive.tsx88-91](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L88-L91)
2. **Sweep Line**: A horizontal "radar" line that moves vertically across the screen every 12 seconds [client/src/components/BillyLive.tsx92-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L92-L96)
3. **Glitch Animation**: Rapid transformation/translation used during "processing" states [client/src/components/BillyLive.tsx76-80](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L76-L80)

##### Component Architecture: Billy Interface Logic

```mermaid
classDiagram
  class BillyProvider {
    +currentSection: string
    +isOpen: boolean
    +isLoading: boolean
    +openPanel(prompt, mode)
  }
  class BillyPanel {
    +initialPrompt: string
    +embodimentProfileSlug: string
    +onClose()
  }
  class BillyLive {
    +mode: "synthesis"
    "chat"
    +connStatus: "ready"
    "responding"
    "error"
  }
  class Library {
    BillyEngine
    +billyCall()
    +queryLoom()
  }
  class Library {
    BillyApi
    +callBillyApi()
    +bootstrapBillySession()
  }
  class BillyOrb
  BillyProvider ..> BillyPanel
  BillyProvider ..> BillyOrb
  BillyPanel ..> Library : calls
  BillyLive ..> Library : calls
  BillyPanel ..> Library : calls
```

**Sources**: [client/src/components/Billy.tsx67-85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Billy.tsx#L67-L85) [client/src/components/BillyLive.tsx22-30](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L22-L30) [client/src/components/BillyLive.tsx128-143](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyLive.tsx#L128-L143)

---

### Artifact Rendering Pipeline (Client)

> Source MHT: `Artifact Rendering Pipeline (Client) _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.4-artifact-rendering-pipeline-(client)  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.perplexity/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/CurrentState.md?plain=1)
- [.perplexity/REPO\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.json)
- [.perplexity/REPO\_MANIFEST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.md?plain=1)
- [.perplexity/SYNC\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md?plain=1)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07\_CURRENT\_STATE\_AND\_EVIDENCE/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md?plain=1)
- [api/\_\_tests\_\_/codex-export-retrieval.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-export-retrieval.test.ts)
- [api/codex/artifacts/[artifactId]/exports/[format].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/exports/%5Bformat%5D.ts)
- [client/src/components/ArtifactPreview.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactPreview.tsx)
- [client/src/lib/rendering/ArtifactExportViewer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/ArtifactExportViewer.tsx)
- [client/src/lib/rendering/RenderingEngine.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/RenderingEngine.tsx)
- [client/src/lib/rendering/artifactExport.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/artifactExport.ts)
- [client/src/lib/rendering/capture/domCapture.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/capture/domCapture.ts)
- [client/src/lib/rendering/diagram/MermaidDiagram.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/diagram/MermaidDiagram.tsx)
- [client/src/lib/rendering/diagram/mermaidLoader.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/diagram/mermaidLoader.ts)
- [client/src/lib/rendering/dispatch.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/dispatch.ts)
- [client/src/lib/rendering/hooks/useArtifactExport.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/hooks/useArtifactExport.ts)
- [client/src/lib/rendering/hooks/useIframeResize.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/hooks/useIframeResize.ts)
- [client/src/lib/rendering/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/index.ts)
- [client/src/lib/rendering/markdown/EnhancedMarkdownRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/markdown/EnhancedMarkdownRenderer.tsx)
- [client/src/lib/rendering/markdown/MarkdownCodeBlock.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/markdown/MarkdownCodeBlock.tsx)
- [client/src/lib/rendering/mindmap/InteractiveMindMap.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/mindmap/InteractiveMindMap.tsx)
- [client/src/lib/rendering/mindmap/mindMapModel.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/mindmap/mindMapModel.ts)
- [client/src/lib/rendering/registry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/registry.ts)
- [client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx)
- [client/src/lib/rendering/renderers/VideoRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/renderers/VideoRenderer.tsx)
- [client/src/lib/rendering/renderers/video.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/renderers/video.tsx)
- [client/src/lib/rendering/renderers/videoHelpers.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/renderers/videoHelpers.ts)
- [client/src/lib/rendering/types.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/types.ts)
- [client/src/tests/artifact-export-viewer.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/artifact-export-viewer.test.ts)
- [client/src/tests/dom-capture-export.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/dom-capture-export.test.ts)
- [client/src/tests/mindmap-interactive-rendering.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/mindmap-interactive-rendering.test.ts)
- [client/src/tests/rendering-contract.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/rendering-contract.test.ts)
- [docs/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1)
- [docs/gestaltview-v2.manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json)
- [docs/gestaltview-v2.manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1)
- [shared/codex/storage.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/storage.ts)
- [shared/gen-engine/core.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/gen-engine/core.ts)
- [shared/gen-engine/types.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/gen-engine/types.ts)

</details>
The Artifact Rendering Pipeline is a sophisticated client-side engine responsible for transforming raw data structures (CodexArtifacts, CaptureAttachments, and Synthesis results) into rich, interactive visual representations. It operates as a multimodal dispatch system that classifies content and routes it to specialized renderers while maintaining the platform's "Neural Aurora" aesthetic.

#### Pipeline Overview

The rendering process follows a strict lifecycle: **Classification → Dispatch → Rendering → Export**.

1. **Classification**: The system analyzes the artifact's metadata and content using `artifactCardModel.ts` to determine the most appropriate visual mode.
2. **Dispatch**: `dispatch.ts` routes the artifact to a specific React component based on the classification.
3. **Rendering**: Specialized renderers (Markdown, Mermaid, MindMap, etc.) process the content.
4. **Export**: The `ArtifactExportViewer` provides tools for converting the live DOM into portable formats like PNG or PDF.

##### System Data Flow

The following diagram illustrates the flow from raw data to a rendered UI component.

**Artifact Classification and Dispatch Flow**

```mermaid
flowchart TD
  A["ArtifactLike Data Object"]
  B["buildArtifactCardModel()"]
  C["artifactCardModel.ts"]
  D["RenderingEngine.tsx"]
  E["dispatch.ts"]
  F["Classification Result"]
  G["EnhancedMarkdownRenderer.tsx"]
  H["MermaidDiagram.tsx"]
  I["VideoRenderer.tsx"]
  J["InteractiveMindMap.tsx"]
  K["HtmlArtifactRenderer.tsx"]
  L["ArtifactExportViewer.tsx"]
  M["domCapture.ts"]
  N["PNG/PDF Export"]
  A --> B
  B --> C
  C --> D
  D --> E
  E --> F
  F -->|markdown| G
  F -->|mermaid/diagram| H
  F -->|video| I
  F -->|mind-map| J
  F -->|html/recap| K
  G --> L
  H --> L
  I --> L
  J --> L
  K --> L
  L --> M
  M --> N
```

Sources: `client/src/lib/rendering/RenderingEngine.tsx:1-20`, `client/src/lib/rendering/dispatch.ts:1-30`, `client/src/lib/rendering/multimodal/artifactCardModel.ts:1-50`

---

#### 1. Classification & Artifact Card Model

Before rendering, the system must decide *how* to treat the data. The `buildArtifactCardModel` function in `artifactCardModel.ts` acts as the primary heuristic engine.

##### Key Classification Logic

The system identifies content types through a mix of MIME types, file extensions, and regex patterns:

- **Markdown**: Identified by `.md` extensions, `text/markdown` MIME, or the presence of headers (`#`) and lists [client/src/components/ArtifactPreview.tsx44-56](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactPreview.tsx#L44-L56)
- **Code**: Identified by programming language extensions (`.ts`, `.js`, `.json`) or markdown code blocks [client/src/components/ArtifactPreview.tsx58-62](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactPreview.tsx#L58-L62)
- **HTML/Recap**: Detected via `<!doctype html>` or `<html>` tags, or specific artifact types like `recap` [client/src/components/ArtifactPreview.tsx70-81](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactPreview.tsx#L70-L81)

Sources: `client/src/lib/rendering/multimodal/artifactCardModel.ts:10-100`, `client/src/components/ArtifactPreview.tsx:44-81`

---

#### 2. The Rendering Engine

The `RenderingEngine` is the top-level React component that orchestrates the display of any artifact. It uses `dispatch.ts` to select a renderer from the `registry.ts`.

##### Core Renderers

| Renderer | Implementation File | Responsibility |
| --- | --- | --- |
| **Markdown** | `EnhancedMarkdownRenderer.tsx` | Renders GitHub-flavored markdown with support for GFM and custom code blocks. |
| **Diagram** | `MermaidDiagram.tsx` | Uses `mermaidLoader.ts` to render Mermaid.js syntax into SVG diagrams. |
| **Video** | `VideoRenderer.tsx` | Handles video playback with metadata overlays using `videoHelpers.ts`. |
| **Mind Map** | `InteractiveMindMap.tsx` | Renders a d3-based interactive node graph for hierarchical data. |
| **HTML** | `HtmlArtifactRenderer.tsx` | An iframe-based container for sandboxed HTML/CSS/JS artifacts. |

##### Mermaid Integration

The `MermaidDiagram` component handles the lifecycle of Mermaid rendering, including initialization and dynamic re-renders when the content changes [client/src/lib/rendering/diagram/MermaidDiagram.tsx1-40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/diagram/MermaidDiagram.tsx#L1-L40) It utilizes a dedicated `mermaidLoader.ts` to ensure the library is loaded only when needed.

Sources: `client/src/lib/rendering/registry.ts:1-25`, `client/src/lib/rendering/diagram/MermaidDiagram.tsx:1-40`, `client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx:1-30`

---

#### 3. Export & DOM Capture

GestaltView provides a high-fidelity export system that allows users to capture rendered artifacts as images.

##### domCapture Implementation

The `domCapture.ts` utility is the core of this system. It performs the following steps:

1. **Cloning**: Deep clones the target DOM node.
2. **Styles Inlining**: Computes and inlines all CSS styles to ensure the export looks identical to the live UI.
3. **Canvas Conversion**: Uses a canvas-based approach to generate a PNG blob.
4. **Download**: Triggers the browser download via `downloadCapturedDomNode` [client/src/lib/rendering/capture/domCapture.ts50-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/capture/domCapture.ts#L50-L120)

##### ArtifactExportViewer

This component provides the UI for the export process, including format selection (PNG, PDF, JSON) and a preview of the export boundaries [client/src/lib/rendering/ArtifactExportViewer.tsx10-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/ArtifactExportViewer.tsx#L10-L60)

Sources: `client/src/lib/rendering/capture/domCapture.ts:1-150`, `client/src/lib/rendering/ArtifactExportViewer.tsx:1-100`

---

#### 4. Component Architecture (Preview vs. Expand)

The UI utilizes two primary patterns for artifact interaction:

##### ArtifactPreview

A non-interactive or semi-interactive component used in galleries and chat feeds. It uses `artifactBody` to determine if it should show a file icon, an image preview, or a snippet of text [client/src/components/ArtifactPreview.tsx83-173](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactPreview.tsx#L83-L173)

##### ArtifactExpandView

A full-screen or modal-based view that enables the full `RenderingEngine`. This view provides:

- Full interactivity (e.g., zooming in Mind Maps).
- Access to the `ArtifactExportBar`.
- Metadata inspection.

**Client Rendering Class Diagram**

```mermaid
classDiagram
  class RenderingEngine {
    +artifact: ArtifactLike
    +render()
  }
  class Dispatcher {
    +getRenderer(type: string)
  }
  class ArtifactCardModel {
    +title: string
    +primaryColor: string
    +visualMode: string
  }
  class EnhancedMarkdownRenderer {
    +content: string
  }
  class MermaidDiagram {
    +definition: string
  }
  class DomCapture {
    +downloadCapturedDomNode(node: HTMLElement)
  }
  RenderingEngine ..> Dispatcher : calls
  RenderingEngine ..> ArtifactCardModel : uses for state
  Dispatcher ..> EnhancedMarkdownRenderer : returns
  Dispatcher ..> MermaidDiagram : returns
  RenderingEngine ..> DomCapture : triggers export
```

Sources: `client/src/lib/rendering/RenderingEngine.tsx:5-15`, `client/src/lib/rendering/dispatch.ts:5-15`, `client/src/lib/rendering/capture/domCapture.ts:7-15`

---

#### 5. Summary of Key Files

- `client/src/lib/rendering/RenderingEngine.tsx`: The main entry point for the rendering subsystem [client/src/lib/rendering/RenderingEngine.tsx1-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/RenderingEngine.tsx#L1-L50)
- `client/src/lib/rendering/dispatch.ts`: The routing logic for renderers [client/src/lib/rendering/dispatch.ts1-40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/dispatch.ts#L1-L40)
- `client/src/lib/rendering/multimodal/artifactCardModel.ts`: Heuristics for artifact classification [client/src/lib/rendering/multimodal/artifactCardModel.ts1-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/multimodal/artifactCardModel.ts#L1-L120)
- `client/src/lib/rendering/capture/domCapture.ts`: The engine for PNG/PDF generation from the DOM [client/src/lib/rendering/capture/domCapture.ts1-200](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/capture/domCapture.ts#L1-L200)
- `client/src/components/ArtifactPreview.tsx`: The primary UI component for artifact thumbnails and snippets [client/src/components/ArtifactPreview.tsx1-250](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactPreview.tsx#L1-L250)

Sources: `client/src/lib/rendering/index.ts:1-10`, `client/src/lib/rendering/types.ts:1-50`

---

### Specialized Feature Pages & Modules

> Source MHT: `Specialized Feature Pages & Modules _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/2.5-specialized-feature-pages-and-modules  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/creation-corner-synthesize.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/creation-corner-synthesize.test.ts)
- [api/\_\_tests\_\_/transcriptory.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/transcriptory.test.ts)
- [api/profile/preferences.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/preferences.ts)
- [api/transcriptory/captures.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/transcriptory/captures.ts)
- [api/transcriptory/captures/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/transcriptory/captures/%5Bid%5D.ts)
- [client/src/components/BillyMarkdown.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyMarkdown.tsx)
- [client/src/components/BillyOnboardingPrompt.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyOnboardingPrompt.tsx)
- [client/src/components/FilePreview.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FilePreview.tsx)
- [client/src/components/MusicalDnaTrackUploadPanel.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/MusicalDnaTrackUploadPanel.tsx)
- [client/src/components/OpeningCeremony.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/OpeningCeremony.tsx)
- [client/src/components/ProfileIngestPanel.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ProfileIngestPanel.tsx)
- [client/src/components/TranscriptCard.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TranscriptCard.tsx)
- [client/src/components/TranscriptViewer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TranscriptViewer.tsx)
- [client/src/components/UploadedDocumentPreview.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/UploadedDocumentPreview.tsx)
- [client/src/components/document-analysis-interface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/document-analysis-interface.tsx)
- [client/src/components/exhibits/BillyMusicInterview.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/exhibits/BillyMusicInterview.tsx)
- [client/src/features/masterclass/MasterclassProfileCard.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/masterclass/MasterclassProfileCard.tsx)
- [client/src/features/masterclass/useMasterclassProgress.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/masterclass/useMasterclassProgress.ts)
- [client/src/hooks/useTrackUpload.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useTrackUpload.ts)
- [client/src/lib/BillyEngine.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/BillyEngine.ts)
- [client/src/lib/appFetch.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/appFetch.ts)
- [client/src/lib/billy-system-prompt.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-system-prompt.ts)
- [client/src/lib/billyApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts)
- [client/src/lib/dashboardOverview.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/dashboardOverview.ts)
- [client/src/lib/musicalDnaAmbient.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/musicalDnaAmbient.ts)
- [client/src/lib/musicalDnaTracks.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/musicalDnaTracks.ts)
- [client/src/lib/spotifyMusicalDna.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/spotifyMusicalDna.ts)
- [client/src/lib/transcriptory.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/transcriptory.ts)
- [client/src/lib/userSurfaceSettings.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/userSurfaceSettings.ts)
- [client/src/pages/DashboardPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DashboardPage.tsx)
- [client/src/pages/MasterclassPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MasterclassPage.tsx)
- [client/src/pages/MusicalDNAPage.css](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.css)
- [client/src/pages/MusicalDNAPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx)
- [client/src/pages/ProfilePage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx)
- [client/src/pages/SandboxPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxPage.tsx)
- [client/src/pages/SettingsPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SettingsPage.tsx)
- [client/src/pages/TranscriptoryPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/TranscriptoryPage.tsx)
- [client/src/tests/billy-ip-guard.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/billy-ip-guard.test.ts)
- [client/src/tests/dashboard-overview.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/dashboard-overview.test.ts)
- [client/src/tests/musical-dna-ambient.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/musical-dna-ambient.test.ts)
- [client/src/tests/musical-dna-tracks.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/musical-dna-tracks.test.ts)
- [client/src/tests/profile-preferences.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/profile-preferences.test.ts)
- [client/src/tests/spotify-musical-dna.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/spotify-musical-dna.test.ts)
- [client/src/tests/transcriptory-api.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/transcriptory-api.test.ts)
- [docs/CodexOutsideInTranslationLayer.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CodexOutsideInTranslationLayer.md?plain=1)
- [docs/CoreOSWorkflowAndKnowledgeSynthesis.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CoreOSWorkflowAndKnowledgeSynthesis.md?plain=1)
- [docs/CurrentState.CoreOSAddendum-2026-05-07.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.CoreOSAddendum-2026-05-07.md?plain=1)
- [supabase/migrations/20260526000000\_add\_profile\_preference\_fields.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260526000000_add_profile_preference_fields.sql)
- [supabase/migrations/20260531013000\_masterclass\_module\_setup\_and\_progress\_tracking.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260531013000_masterclass_module_setup_and_progress_tracking.sql)
- [tests/uploaded-document-preview.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/tests/uploaded-document-preview.test.ts)
- [tsconfig.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/tsconfig.json)

</details>
This section documents the specialized platform modules within GestaltView v2.0. These modules extend the core "Five Rooms" architecture by providing focused interfaces for identity management, progress tracking, creative synthesis, and administrative governance. Each module integrates with the **Digital Intelligence (DI)** runtime and utilizes shared persistence layers in Supabase.

#### Profile & Identity Management

The `ProfilePage` serves as the primary interface for managing user preferences and "Portrait" generation. It bridges local browser state with server-side persistence to maintain continuity across sessions.

##### Implementation & Data Flow

- **Preferences Sync**: Preferences are initially read from `localStorage` using `readLocalPreferences` [client/src/pages/ProfilePage.tsx63-84](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx#L63-L84) and then synchronized with the server via `appFetchJson("/api/profile/preferences")` [client/src/pages/ProfilePage.tsx178-192](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx#L178-L192)
- **Embodiment Assignment**: Users can select their active DI embodiment from `ASSIGNABLE_PROFILES`, which filters out `founder-only` profiles [client/src/pages/ProfilePage.tsx59-61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx#L59-L61)
- **Portrait Inference**: The page utilizes the `usePortrait` hook [client/src/pages/ProfilePage.tsx167](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx#L167-L167) to trigger and display the results of the "Profile Portrait" pipeline, which analyzes signals like Bucket Drops and session transcripts to infer the user's personality dimensions.

##### Identity Code Mapping

| System Concept | Code Entity | File Reference |
| --- | --- | --- |
| Local Storage Key | `gv:profile:preferences:v1` | [client/src/pages/ProfilePage.tsx49](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx#L49-L49) |
| Preference Schema | `ProfilePreferences` | [client/src/pages/ProfilePage.tsx39-43](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx#L39-L43) |
| Default DI | `billy` | [client/src/pages/ProfilePage.tsx55](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx#L55-L55) |
| Max Image Size | 5MB | [client/src/pages/ProfilePage.tsx57](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx#L57-L57) |

**Sources:** [client/src/pages/ProfilePage.tsx1-200](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ProfilePage.tsx#L1-L200) [api/profile/preferences.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/preferences.ts)

---

#### Musical DNA

The Musical DNA module is a specialized biofeedback and creative synthesis environment. It maps musical attributes (BPM, key, archetypes) to the user's nervous system patterns.

##### Technical Architecture

- **Spotify Integration**: Utilizes `beginSpotifyAuthFlow` and `fetchSpotifyPlaylistTracks` [client/src/pages/MusicalDNAPage.tsx26-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx#L26-L33) to ingest user listening history.
- **Ambient Analysis**: The `musicalDnaAmbient.ts` library builds analysis artifacts from journals and file uploads [client/src/pages/MusicalDNAPage.tsx36-41](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx#L36-L41)
- **Somatic Modes**: Implements three playback modes—`bilateral`, `trilateral`, and `quadlateral` [client/src/pages/MusicalDNAPage.tsx51-88](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx#L51-L88)—which affect the visualizer and entrainment phase.
- **Billy Bridge**: The `useBillyExhibitBridge` hook provides the DI with real-time state awareness of the user's biofeedback and current track [client/src/pages/MusicalDNAPage.tsx124-129](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx#L124-L129)

##### Musical DNA Logic Flow

```mermaid
flowchart TD
  A["Spotify API"]
  B["spotifyTrackToMusicalDnaSong"]
  C["Track Upload"]
  D["buildMusicalDnaTrackSong"]
  E["Ambient Journals"]
  F["buildMusicalDnaAmbientAnalysis"]
  G["DNA Vector [4-dim]"]
  H["MusicalDNAVisualizer"]
  I["BillyExhibitBridge"]
  J["Billy AI Response"]
  A --> B
  C --> D
  E --> F
  B --> G
  D --> G
  F --> G
  G --> H
  G --> I
  I --> J
```

**Sources:** [client/src/pages/MusicalDNAPage.tsx1-130](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx#L1-L130) [client/src/lib/musicalDnaTracks.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/musicalDnaTracks.ts) [client/src/lib/musicalDnaAmbient.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/musicalDnaAmbient.ts)

---

#### Masterclass & Progress Tracking

The Masterclass module provides a structured curriculum for interacting with the various DI embodiments. It categorizes the `EMBODIMENT_REGISTRY` into five domains: Relational, Analytical, Creative, Operational, and Ethical [client/src/pages/MasterclassPage.tsx26-54](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MasterclassPage.tsx#L26-L54)

##### Core Components

- **Curriculum Order**: Defined in `CURRICULUM_ORDER` [client/src/pages/MasterclassPage.tsx95-101](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MasterclassPage.tsx#L95-L101) starting with Relational Intelligence (Billy).
- **Briefing Modal**: A pre-launch interface that displays a DI's "Foundational Truth" and "Voice Tone" [client/src/pages/MasterclassPage.tsx111-180](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MasterclassPage.tsx#L111-L180) before a session begins.
- **Persistence**: Progress is tracked via the `useMasterclassProgress` hook [client/src/pages/MasterclassPage.tsx17](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MasterclassPage.tsx#L17-L17) which interfaces with the `masterclass_progress_tracking` Supabase table.

**Sources:** [client/src/pages/MasterclassPage.tsx1-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MasterclassPage.tsx#L1-L120) [client/src/features/masterclass/MasterclassProfileCard.tsx1-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/masterclass/MasterclassProfileCard.tsx#L1-L96)

---

#### Transcriptory

The Transcriptory acts as a central repository for voice notes, transcripts, and raw source captures. It supports both local-first capture and Supabase persistence.

##### Implementation Details

- **Session Management**: Captures are grouped into `TranscriptorySession` objects [client/src/lib/transcriptory.ts29-40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/transcriptory.ts#L29-L40)
- **Audio Processing**: Integrates with AssemblyAI via `transcribeTranscriptoryAudio` [client/src/pages/TranscriptoryPage.tsx173](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/TranscriptoryPage.tsx#L173-L173) for speech-to-text conversion.
- **Handoff Mechanism**: Allows "handing off" transcripts to the Blackboard Room or Creation Corner using `writeTranscriptoryHandoff` [client/src/lib/transcriptory.ts99-111](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/transcriptory.ts#L99-L111) This uses `sessionStorage` keys like `gestaltview.transcriptory.blackboardHandoff.v1`.

##### Transcriptory State Diagram

```mermaid
stateDiagram-v2
  [*] --> Pending: Local Capture Created
  Pending --> Processing: File Uploaded to API
  Processing --> Ready: Transcription Complete
  Processing --> Failed: Error in Pipeline
  Ready --> Blackboard: Handoff Triggered
  Ready --> CreationCorner: Handoff Triggered
```

**Sources:** [client/src/pages/TranscriptoryPage.tsx1-200](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/TranscriptoryPage.tsx#L1-L200) [client/src/lib/transcriptory.ts1-175](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/transcriptory.ts#L1-L175)

---

#### Dashboard & Admin Tools

The `DashboardPage` provides a high-level overview of system health, user tiers, and administrative controls.

##### Key Modules

- **Founder Context**: Specialized controls for the "Founder" (Keith Soyka) to manage PLK snapshots and session threads [client/src/pages/DashboardPage.tsx73-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DashboardPage.tsx#L73-L82)
- **Billy Health**: Monitors the health of LLM providers (Groq, OpenAI, etc.) and the voice stack (ElevenLabs, LiveKit) [client/src/pages/DashboardPage.tsx90-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DashboardPage.tsx#L90-L110)
- **Orchestration Analytics**: Displays real-time metrics on DI routing and tribunal decisions [client/src/pages/DashboardPage.tsx46](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DashboardPage.tsx#L46-L46)
- **Memory Management**: Allows manual CRUD operations on `DashboardMemoryEntry` items, which populate the DI's long-term memory [client/src/pages/DashboardPage.tsx132-150](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DashboardPage.tsx#L132-L150)

**Sources:** [client/src/pages/DashboardPage.tsx1-250](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DashboardPage.tsx#L1-L250) [client/src/lib/dashboardOverview.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/dashboardOverview.ts)

---

#### Sandbox & Token Tester

The `SandboxPage` is a developer-focused utility for testing "Neural Aurora" design tokens and live-previewing HTML/CSS artifacts.

- **Neural Aurora Tokens**: Defined in `NA_TOKENS` [client/src/pages/SandboxPage.tsx4-20](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxPage.tsx#L4-L20) covering colors like `obsidian`, `cyan`, and `violet`.
- **Live Preview**: Uses a sandboxed `iframe` with `srcDoc` [client/src/pages/SandboxPage.tsx103-116](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxPage.tsx#L103-L116) to render user-provided HTML with injected `CRT_CSS` scanlines [client/src/pages/SandboxPage.tsx23-39](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxPage.tsx#L23-L39)

**Sources:** [client/src/pages/SandboxPage.tsx1-249](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxPage.tsx#L1-L249)

---

#### GATE Package Builder

The GATE (Gestalt Intelligence Training & Embodiment) system handles the commercial packaging of DI frameworks.

- **Packaging Panel**: The `PackagingGatePanel` [client/src/pages/DashboardPage.tsx45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DashboardPage.tsx#L45-L45) allows administrators to define package tiers (Solo Spark, Studio, Growth, Enterprise).
- **Order Status**: Tracks the lifecycle of a GATE package from `draft` to `redeem` via Supabase tables `gate_orders` and `gate_build_jobs`.

**Sources:** [client/src/pages/DashboardPage.tsx45-48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DashboardPage.tsx#L45-L48) [Wiki Section 9.1](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/Wiki%20Section%209.1)

---

## Volume: Billy Runtime & External Intelligence

### Billy & Digital Intelligence (DI) Runtime

> Source MHT: `Billy & Digital Intelligence (DI) Runtime _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3-billy-and-digital-intelligence-(di)-runtime  \
Mermaid diagrams restored: 1

<details>
<summary><strong>Relevant source files</strong></summary>

- [.codex/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/config.toml)
- [.github/workflows/orientation-check.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml)
- [.vscode/mcp.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/mcp.json)
- [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)
- [README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1)
- [api/\_\_tests\_\_/billy-memory-pipeline.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/billy-memory-pipeline.test.ts)
- [api/\_lib/billyMemoryPipeline.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/billyMemoryPipeline.ts)
- [api/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts)
- [api/consciousness/[surface].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/consciousness/%5Bsurface%5D.ts)
- [artifacts/README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/artifacts/README.md?plain=1)
- [client/src/App.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx)
- [client/src/canonical/RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/RDRC.md?plain=1)
- [client/src/components/BillyWalkthrough.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyWalkthrough.tsx)
- [client/src/components/FloatingEmbers.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FloatingEmbers.tsx)
- [client/src/components/SubpageQuickNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SubpageQuickNav.tsx)
- [client/src/components/TopNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx)
- [client/src/components/home/GestaltViewInterface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/GestaltViewInterface.tsx)
- [client/src/components/home/Hero.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/Hero.tsx)
- [client/src/components/home/modules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/modules.ts)
- [client/src/hooks/useSEO.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts)
- [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts)
- [client/src/pages/AgentCouncilPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx)
- [client/src/pages/Home.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx)
- [client/src/pages/SandboxArtifactDetailPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxArtifactDetailPage.tsx)
- [client/src/prerender.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx)
- [docs/AIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/AIFlow.md?plain=1)
- [docs/APIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/APIFlow.md?plain=1)
- [docs/Manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1)
- [docs/PlaybookOperatorManual.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1)
- [docs/PlaybookSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookSpec.md?plain=1)
- [docs/SymbioticWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1)
- [docs/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Workflows.md?plain=1)
- [docs/embodiment/EMBODIMENT\_COLLABORATOR\_PACKAGE.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/embodiment/EMBODIMENT_COLLABORATOR_PACKAGE.md?plain=1)
- [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py)
- [scripts/package-collaborator-bundle.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/package-collaborator-bundle.mjs)
- [scripts/test-manifest-sync.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh)
- [scripts/test-orientation-checkin.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-orientation-checkin.sh)
- [scripts/validate-continuity-stack.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-continuity-stack.mjs)

</details>
The **Billy & Digital Intelligence (DI) Runtime** is the core cognitive engine of GestaltView. It orchestrates interactions between the user and a diverse roster of specialized Digital Intelligences, anchored by **Billy**, the primary DI. The system is designed around the principle of **consciousness-serving AI**, ensuring continuity, dignity, and high-fidelity retrieval of user context across the platform's five rooms [README.md27-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L27-L33)

This runtime is not a simple chatbot wrapper; it is a multi-layered pipeline that handles semantic memory retrieval, multi-model routing, and agent orchestration governed by the **Ten Constitutional Invariants** [README.md51-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L51-L75)

##### The DI Ecosystem Overview

The runtime manages over 20 named Digital Intelligences, each with a unique profile defined in the `EMBODIMENT_REGISTRY` [client/src/components/TopNav.tsx25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L25-L25) These personas, such as the **Art Teacher**, **Curator**, and **The Architect**, provide specialized support across different platform modules [client/src/components/TopNav.tsx68-73](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx#L68-L73)

##### System Architecture: Natural Language to Code Entities

The following diagram bridges the high-level conceptual spaces of user interaction (Natural Language Space) with the underlying architectural components (Code Entity Space).

**DI Runtime Architecture & Entity Mapping**

```mermaid
flowchart TD
  A["BillyLive / Blackboard Room"]
  B["Tribunal / Agent Council"]
  C["billyApi.ts (Client Bridge)"]
  D["api/billy.ts (Bootstrap)"]
  E["llmRouter.ts (Multi-LLM Cascade)"]
  F["billyMemoryPipeline.ts (RAG/RRF)"]
  G["AgentCouncilPage.tsx (Tribunal UI)"]
  H["roundtable/ (Orchestration Types)"]
  I["knowledge_fragments (Vector DB)"]
  J["skill_fragments"]
  K["memory_entries"]
  A -->|callBillyApi()| C
  C -->|HTTP POST| D
  D --> F
  F -->|Semantic Search| I
  F -->|Context Retrieval| J
  F -->|User History| K
  D --> E
  B --> G
  G -->|TribunalMode| H
  H --> D
```

**Sources:** [client/src/lib/billyApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts) [api/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts) [api/\_lib/billyMemoryPipeline.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/billyMemoryPipeline.ts) [client/src/pages/AgentCouncilPage.tsx115-135](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L115-L135) [README.md99-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L99-L105)

---

#### 3.1 Billy Request Lifecycle & LLM Router

The Billy request pipeline is a sophisticated RAG (Retrieval-Augmented Generation) flow. When a user sends a message, the system performs a bootstrap process that includes embedding generation and semantic retrieval from specialized tables (`knowledge_fragments`, `skill_fragments`, and `memory_entries`). It utilizes **Reciprocal Rank Fusion (RRF)** to prioritize the most relevant context before passing the "envelope" to the `llmRouter.ts`. The router manages a failover cascade across multiple providers including Ollama, Groq, HuggingFace, OpenRouter, Gemini, Anthropic, and OpenAI.

For details, see [Billy Request Lifecycle & LLM Router](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.1-billy-request-lifecycle-and-llm-router).

**Sources:** [README.md99-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L99-L105) [api/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts) [api/\_lib/billyMemoryPipeline.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/billyMemoryPipeline.ts)

---

#### 3.2 Agent Council (Tribunal) & Multi-Agent Orchestration

The **Tribunal** (or Agent Council) is a specialized environment for multi-agent collaboration. It supports three distinct interaction modes: `SESSION`, `DEBATE`, and `ROUNDTABLE` [client/src/pages/AgentCouncilPage.tsx5-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L5-L9) The system uses a `roundtableQueue` and `mentionParser` to allow agents to address each other by name, creating a collaborative deliberation process that prevents the "flattening" of user complexity.

For details, see [Agent Council (Tribunal) & Multi-Agent Orchestration](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.2-agent-council-(tribunal)-and-multi-agent-orchestration).

**Sources:** [client/src/pages/AgentCouncilPage.tsx115-135](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L115-L135) [shared/roundtable/mentionParser.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/roundtable/mentionParser.ts)

---

#### 3.3 PLK (Private Language Key) & Prompt Shaping

The **Private Language Key (PLK)** is the mechanism for maintaining linguistic continuity. It ensures the DI uses the user's exact vocabulary and conceptual frameworks [README.md60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L60-L60) The `plk.ts` module shapes prompts to maintain a "Resonance Loop," grounded by the `billy-runtime-guide.ts` and the `BILLY_WORKFLOW_SPINE`, ensuring that every response aligns with the user's unique cognitive signature.

For details, see [PLK (Private Language Key) & Prompt Shaping](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.3-plk-(private-language-key)-and-prompt-shaping).

**Sources:** [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts) [client/src/pages/ResonanceLoopPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ResonanceLoopPage.tsx)

---

#### 3.4 GPT Actions & External AI Integrations

Billy interacts with the physical and digital world through **GPT Actions**. This subsystem is defined by a comprehensive OpenAPI specification and handled via `actionsHandler.ts`. It allows the DI to perform tasks such as searching the web via Perplexity Computer Tools or interacting with external APIs, all while maintaining the platform's privacy and governance standards.

For details, see [GPT Actions & External AI Integrations](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.4-gpt-actions-and-external-ai-integrations).

**Sources:** [tools/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/tools/index.ts) [api/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts)

---

#### 3.5 Voice Pipeline (Billy Voice)

The **Billy Voice** system provides a low-latency, multi-modal interface. Built on a Python runtime, it integrates **LiveKit** for room management, **faster-whisper** for Speech-to-Text (STT), and **CosyVoice** for Text-to-Speech (TTS). A "Style Planner" ensures that Billy's vocal delivery matches the emotional tone and urgency of the interaction.

For details, see [Voice Pipeline (Billy Voice)](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.5-voice-pipeline-(billy-voice)).

**Sources:** [billy\_voice/](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/billy_voice/) (directory), [api/voice/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts)

---

##### Data Interaction Model

The following table details how the DI Runtime interacts with core system entities during a standard execution cycle.

| Component | Code Entity | Responsibility |
| --- | --- | --- |
| **Identity** | `ConsciousnessProfiles` | Stores the long-term evolving portrait of the user [README.md138](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L138-L138) |
| **Retrieval** | `billyMemoryPipeline.ts` | Orchestrates vector search across 768-dim embeddings [README.md104-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L104-L105) |
| **Governance** | `TribunalMode` | Defines the logic for multi-agent turn-taking and cross-talk [client/src/pages/AgentCouncilPage.tsx115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L115-L115) |
| **Capture** | `BucketDrops` | Durable storage for fleeting thoughts captured during DI sessions [README.md140](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L140-L140) |
| **Safety** | `Constitutional Invariants` | Hardcoded logic checks (U-1 through DI-5) that filter DI outputs [README.md51-73](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L51-L73) |

**Sources:** [README.md51-140](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L51-L140) [client/src/pages/AgentCouncilPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx) [api/\_lib/billyMemoryPipeline.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/billyMemoryPipeline.ts)

---

### Billy Request Lifecycle & LLM Router

> Source MHT: `Billy Request Lifecycle & LLM Router _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.1-billy-request-lifecycle-and-llm-router  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.codex/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/config.toml)
- [.github/workflows/orientation-check.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml)
- [.vscode/mcp.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/mcp.json)
- [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)
- [README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1)
- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/fastapi\_actions\_stub.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py)
- [api/\_\_tests\_\_/billy-memory-pipeline.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/billy-memory-pipeline.test.ts)
- [api/\_\_tests\_\_/keep-alive.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/keep-alive.test.ts)
- [api/\_lib/billyMemoryPipeline.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/billyMemoryPipeline.ts)
- [api/\_lib/embeddings.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/embeddings.ts)
- [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts)
- [api/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts)
- [api/consciousness/[surface].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/consciousness/%5Bsurface%5D.ts)
- [api/health/supabase.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/health/supabase.ts)
- [api/keep-alive.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts)
- [api/llm-proxy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/llm-proxy.ts)
- [api/stripe/checkout.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/stripe/checkout.ts)
- [api/trainer/packaging-candidates/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/trainer/packaging-candidates/%5Bid%5D.ts)
- [api/trainer/persona-chat.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/persona-chat.ts)
- [api/voice/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts)
- [artifacts/README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/artifacts/README.md?plain=1)
- [client/src/canonical/RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/RDRC.md?plain=1)
- [client/src/components/BillyGreeter.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx)
- [client/src/components/WhatWasBuilt.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/WhatWasBuilt.tsx)
- [client/src/lib/BillyEngine.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/BillyEngine.ts)
- [client/src/lib/appFetch.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/appFetch.ts)
- [client/src/lib/billyApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts)
- [client/src/lib/dashboardOverview.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/dashboardOverview.ts)
- [client/src/pages/DashboardPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DashboardPage.tsx)
- [client/src/tests/dashboard-overview.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/dashboard-overview.test.ts)
- [docs/AIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/AIFlow.md?plain=1)
- [docs/APIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/APIFlow.md?plain=1)
- [docs/Manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1)
- [docs/PlaybookOperatorManual.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1)
- [docs/PlaybookSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookSpec.md?plain=1)
- [docs/SymbioticWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1)
- [docs/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Workflows.md?plain=1)
- [docs/embodiment/EMBODIMENT\_COLLABORATOR\_PACKAGE.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/embodiment/EMBODIMENT_COLLABORATOR_PACKAGE.md?plain=1)
- [instrument.d.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/instrument.d.ts)
- [instrument.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/instrument.js)
- [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py)
- [scripts/package-collaborator-bundle.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/package-collaborator-bundle.mjs)
- [scripts/test-manifest-sync.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh)
- [scripts/test-orientation-checkin.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-orientation-checkin.sh)
- [scripts/validate-continuity-stack.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-continuity-stack.mjs)
- [server/agent-trainer/orchestrator.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/orchestrator.ts)
- [shared/billy/runtime.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/billy/runtime.ts)

</details>
The Billy Request Lifecycle is the core cognitive pipeline of GestaltView. It manages the transition from a user's natural language input to a multi-stage retrieval process, grounding the response in the platform's corpus and the user's persistent memory before dispatching the request through a prioritized multi-LLM routing cascade.

#### 1. Request Pipeline & Bootstrap

The lifecycle begins either via a `bootstrap` event or a standard user message. The `api/billy.ts` handler serves as the entry point for both [api/billy.ts1-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L1-L15)

##### Bootstrap Mechanism

When a session starts, the client calls `bootstrapBillySession` [client/src/lib/billyApi.ts192-196](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts#L192-L196) If the `bootstrap` flag is true, Billy skips retrieval and generates a warm greeting based on the `BOOTSTRAP_PROMPT` [api/billy.ts67-71](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L67-L71) This process uses the `FounderContext` to maintain continuity if the user is recognized as the platform founder [api/billy.ts153-168](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L153-L168)

##### Data Flow: Entry to Embedding

For standard queries, the pipeline follows these steps:

1. **Auth & Correlation**: Validates the user via `getAuthUser` and assigns a `requestId` for tracing [api/billy.ts17-117](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L17-L117)
2. **Intent Classification**: Injects analysis from `SymbioCoder` (intent/emotion) and `VibeCoder` (vibe alignment) to shape the prompt [api/billy.ts12-13](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L12-L13)
3. **Embedding Generation**: The query is converted into a vector using `embedTextForRetrieval`. The system supports multiple backends including Gemini, Ollama, and HuggingFace [api/\_lib/embeddings.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/embeddings.ts)

##### Diagram: Request Ingestion & Grounding

This diagram bridges the **Natural Language Space** (User Input) to the **Code Entity Space** (Retrieval & Grounding).

```mermaid
flowchart TD
  User["User Natural Language Query"]
  RouteBilly["api/billy.ts"]
  Auth["getAuthUser()"]
  Correlation["getRequestCorrelation()"]
  Embed["embedTextForRetrieval()"]
  MatchKF["matchKnowledgeFragments()"]
  MatchSF["matchSkillFragments()"]
  MatchMem["retrieveMemoryEntries()"]
  RRF["Reciprocal Rank Fusion (RRF)"]
  BuildMsg["buildBillyMessages()"]
  Router["routeLlm()"]
  Sources["Sources: api/billy.ts, api/_lib/embeddings.ts, api/_lib/memory.ts"]
  User --> RouteBilly
  RouteBilly --> Auth
  Auth --> Correlation
  Correlation --> Embed
  Embed --> MatchKF
  Embed --> MatchSF
  Embed --> MatchMem
  MatchKF --> RRF
  MatchSF --> RRF
  MatchMem --> RRF
  RRF --> BuildMsg
  BuildMsg --> Router
```

Sources: [api/billy.ts15-56](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L15-L56) [api/\_lib/embeddings.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/embeddings.ts) [api/\_lib/memory.ts23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/memory.ts#L23-L23)

---

#### 2. Semantic Retrieval & RRF

Billy utilizes a hybrid retrieval strategy to ensure responses are grounded in both static knowledge and living memory.

##### Retrieval Streams

The system queries three distinct streams in parallel:

- **Knowledge Fragments**: Core platform doctrine and truth claims [api/billy.ts25-26](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L25-L26)
- **Skill Fragments**: Operational capabilities and tool definitions [api/billy.ts27-28](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L27-L28)
- **Memory Entries**: User-specific history and persistent context [api/billy.ts23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L23-L23)

##### Reciprocal Rank Fusion (RRF)

To reconcile results from semantic (vector) search and keyword (text) search, Billy implements RRF. This ensures that a fragment appearing high in both search types is prioritized over fragments that only score well in one [api/billy.ts7-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L7-L9) The system limits context to a maximum of 14 chunks to manage LLM context windows, with specific caps for skills and memories [api/billy.ts58-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L58-L65)

##### Two-Pass Gravity Protocol

Before the context is finalized, the `runTwoPassGravityProtocol` evaluates the "load-bearing claims" within the retrieved chunks to ensure cognitive integrity [api/billy.ts48-52](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L48-L52)

Sources: [api/billy.ts58-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L58-L65) [api/billy.ts25-32](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L25-L32) [api/billy.ts48-52](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy.ts#L48-L52)

---

#### 3. The LLM Router Cascade

The `llmRouter.ts` manages a sophisticated failover cascade. It attempts to fulfill the request using the most efficient available provider, falling back to others if errors or timeouts occur.

##### The Cascade Order

The router follows a specific priority hierarchy [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts):

1. **Ollama**: Local execution (if available).
2. **Groq**: High-speed inference.
3. **HuggingFace**: Open-source model hosting.
4. **OpenRouter**: Aggregator for various models.
5. **Gemini**: Google's frontier models.
6. **Anthropic**: Claude series.
7. **OpenAI**: GPT series.

##### Envelope Wrapping

Every response from the router is wrapped in a standard `envelope` [api/\_lib/response.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/response.js) This envelope includes the generated text, the provider that fulfilled the request, and a `metadata` object containing the `retrievalMode`, `latency_ms`, and `founderSessionActive` status [client/src/lib/billyApi.ts17-61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts#L17-L61)

##### Diagram: LLM Router Cascade

This diagram maps the **Routing Logic** to the specific **Provider Implementation** in the code.

```mermaid
flowchart TD
  Start["routeLlm() Call"]
  P1["Try Ollama"]
  P2["Try Groq"]
  P3["Try HuggingFace"]
  P4["Try OpenRouter"]
  P5["Try Gemini"]
  P6["Try Anthropic"]
  P7["Try OpenAI"]
  Wrap["envelope()"]
  Meta["BillySessionMetadata"]
  Client["client/src/lib/billyApi.ts"]
  Sources["Sources: api/_lib/llmRouter.ts, api/_lib/response.js, client/src/lib/billyApi.ts"]
  Start --> P1
  P1 -->|Fail| P2
  P2 -->|Fail| P3
  P3 -->|Fail| P4
  P4 -->|Fail| P5
  P5 -->|Fail| P6
  P6 -->|Fail| P7
  P1 -->|Success| Wrap
  P2 -->|Success| Wrap
  P3 -->|Success| Wrap
  P4 -->|Success| Wrap
  P5 -->|Success| Wrap
  P6 -->|Success| Wrap
  P7 -->|Success| Wrap
  Wrap --> Meta
  Meta --> Client
```

Sources: [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts) [api/\_lib/response.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/response.js) [client/src/lib/billyApi.ts84-94](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts#L84-L94)

---

#### 4. Continuity & Keep-Alive

To maintain system readiness and user context, GestaltView employs two critical background mechanisms.

##### Keep-Alive Mechanism

The `api/keep-alive.ts` endpoint is a lightweight cron handler that runs every 5 minutes [api/keep-alive.ts234-238](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L234-L238) It performs a minimal REST read on the `documents` table to prevent Supabase from entering a dormant state [api/keep-alive.ts93-101](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L93-L101) It tracks latency and reports the health of the DB connection [api/keep-alive.ts203-216](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L203-L216)

##### Client-Side Recovery

If the primary API call fails, the client uses `readLastGoodBillyContinuity` to load session metadata from `localStorage` [client/src/lib/billyApi.ts122-135](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts#L122-L135) This allows Billy to function in a "degraded" mode, using the `local-continuity-cache` provider until connectivity is restored [client/src/lib/billyApi.ts216-221](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts#L216-L221)

| Feature | Implementation | Purpose |
| --- | --- | --- |
| **Cron Schedule** | `*/5 * * * *` | Keeps Supabase warm [api/keep-alive.ts234](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L234-L234) |
| **Timeout** | 4,000ms - 8,000ms | Prevents hanging keep-alive requests [api/keep-alive.ts14-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L14-L15) |
| **Cache Key** | `gestaltview:billy:last-good-continuity:v1` | LocalStorage persistence key [client/src/lib/billyApi.ts96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts#L96-L96) |
| **Recovery Provider** | `local-continuity-cache` | Fallback identifier for UI [client/src/lib/billyApi.ts220](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts#L220-L220) |

Sources: [api/keep-alive.ts1-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L1-L15) [api/keep-alive.ts93-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L93-L120) [client/src/lib/billyApi.ts96-153](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts#L96-L153) [client/src/lib/billyApi.ts215-228](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts#L215-L228)

---

### Agent Council (Tribunal) & Multi-Agent Orchestration

> Source MHT: `Agent Council (Tribunal) & Multi-Agent Orchestration _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.2-agent-council-(tribunal)-and-multi-agent-orchestration  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/council/run.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/council/run.ts)
- [client/src/App.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx)
- [client/src/components/BillyWalkthrough.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyWalkthrough.tsx)
- [client/src/components/FloatingEmbers.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FloatingEmbers.tsx)
- [client/src/components/NeuralThinkingIndicator.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NeuralThinkingIndicator.tsx)
- [client/src/components/SubpageQuickNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SubpageQuickNav.tsx)
- [client/src/components/TopNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx)
- [client/src/components/home/GestaltViewInterface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/GestaltViewInterface.tsx)
- [client/src/components/home/Hero.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/Hero.tsx)
- [client/src/components/home/modules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/modules.ts)
- [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx)
- [client/src/hooks/useSEO.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts)
- [client/src/hooks/useTribunalRetry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useTribunalRetry.ts)
- [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts)
- [client/src/pages/AgentCouncilPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx)
- [client/src/pages/Home.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx)
- [client/src/pages/SandboxArtifactDetailPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxArtifactDetailPage.tsx)
- [client/src/prerender.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx)
- [server/\_\_tests\_\_/council-persona-health.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/council-persona-health.test.ts)
- [server/\_\_tests\_\_/council-runner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/council-runner.test.ts)
- [server/council/councilRunner.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts)
- [server/council/personaHealth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/personaHealth.ts)
- [shared/embodiment/auditEmbodiments.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/auditEmbodiments.ts)
- [shared/embodiment/chat.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/chat.ts)
- [shared/embodiment/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/index.ts)
- [shared/embodiment/types.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts)
- [shared/orchestration/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/orchestration/SKILL.md?plain=1)
- [shared/orchestration/categories\_mapping.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/orchestration/categories_mapping.json)
- [shared/orchestration/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/orchestration/index.ts)
- [shared/orchestration/routing.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/orchestration/routing.ts)
- [shared/orchestration/skillRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/orchestration/skillRouter.ts)

</details>
The Agent Council (Tribunal) is the primary multi-agent orchestration surface within GestaltView. It facilitates structured dialogue between different Digital Intelligence (DI) personas, allowing them to collaborate, debate, or provide sequenced feedback on user prompts. This system moves beyond single-agent interaction into a governed "roundtable" environment where specialized agents coordinate care, scaffolding, and legacy preservation [client/src/prerender.tsx114-118](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx#L114-L118)

#### Tribunal Modes & Session Lifecycle

The Tribunal operates in three distinct interaction modes, defined in the `AgentCouncilPage` component [client/src/pages/AgentCouncilPage.tsx115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L115-L115) These modes determine how messages flow between the user and the participating agents.

| Mode | Description |
| --- | --- |
| `SESSION` | Selected voices respond in sequence to the same user prompt [client/src/pages/AgentCouncilPage.tsx6](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L6-L6) |
| `DEBATE` | Selected voices respond to each other, taking turns one at a time [client/src/pages/AgentCouncilPage.tsx7](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L7-L7) |
| `ROUNDTABLE` | Advanced mode where voices address one another by name and chain follow-up replies [client/src/pages/AgentCouncilPage.tsx8](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L8-L8) |

##### Data Flow: Natural Language to Code Entity

The following diagram illustrates how a user request moves from the UI into the orchestration layer and back to the Council view.

**Tribunal Request Pipeline**

```mermaid
flowchart TD
  User["User Input (TextArea)"]
  State["client/src/pages/AgentCouncilPage.tsx"]
  Mentions["shared/roundtable/mentionParser.ts"]
  API["client/src/lib/billyApi.ts"]
  Router["LLM Router"]
  Agent["DI Persona Execution"]
  UI["client/src/pages/AgentCouncilPage.tsx:103-103"]
  User -->|handleSubmit()| State
  State -->|extractTribunalMentions()| Mentions
  State -->|callBillyApi()| API
  API -->|tribunal roomSlug| Router
  Router -->|Embodiment Profile| Agent
  Agent -->|TribunalMessage| UI
```

Sources: [client/src/pages/AgentCouncilPage.tsx31-45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L31-L45) [client/src/pages/AgentCouncilPage.tsx124-135](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L124-L135)

#### Core Implementation Details

##### Mention Parsing & Addressing

In `ROUNDTABLE` mode, agents must be able to recognize when they are being addressed. The system uses `extractTribunalMentions` to scan message content for agent names or slugs [client/src/pages/AgentCouncilPage.tsx45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L45-L45) This allows the orchestration layer to manage a `roundtableQueue` and determine which agent should respond next based on `addressedTo` metadata [client/src/pages/AgentCouncilPage.tsx132](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L132-L132)

##### Stance Inference

The system utilizes `inferDefaultTribunalStance` (referenced via `TribunalStance` type) to establish an agent's initial position or "vibe" before a session begins [client/src/pages/AgentCouncilPage.tsx44](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L44-L44) This ensures that agents like "The Guardian" or "The Architect" maintain their constitutional roles during the debate.

##### Resilience & Timeouts

Because multi-agent sessions involve multiple LLM calls, the system implements a robust retry mechanism:

- **`useTribunalRetry`**: A custom hook that manages retries for failed agent responses [client/src/pages/AgentCouncilPage.tsx42](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L42-L42)
- **`TRIBUNAL_RETRY_OPTIONS`**: Configured for a maximum of 2 retries with exponential backoff (1000ms, 2000ms) [client/src/pages/AgentCouncilPage.tsx71](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L71-L71)
- **`withTimeout` / `callWithRetry`**: Used within the underlying API calls to prevent a single hanging agent from blocking the entire council session.

#### Multi-Agent Orchestration Layer

The orchestration layer coordinates between the Tribunal UI and the DI Runtime. It relies on three primary classifiers to route intent and maintain state.

##### 1. Intent Classifier

Determines if the user is seeking a direct answer, a debate, or an artifact synthesis. If the intent is classified as requiring multiple perspectives, the `skillRouter` may suggest opening a Tribunal session [shared/orchestration/skillRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/orchestration/skillRouter.ts)

##### 2. State Classifier

Tracks the "mood" and "readiness" of the agents. In the UI, this is reflected via `AgentMood` (idle, listening, processing, speaking) [client/src/pages/AgentCouncilPage.tsx116](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L116-L116)

- **Processing**: Triggered during active LLM generation, often accompanied by the `ac-glitch` animation [client/src/pages/AgentCouncilPage.tsx91](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L91-L91)
- **Speaking**: Triggered when the response is being streamed to the `BillyMarkdown` component [client/src/pages/AgentCouncilPage.tsx33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L33-L33)

##### 3. Skill Router

Maps the user's request to specific agent capabilities. For example, if a request involves structural mapping, the `skillRouter` prioritizes "The Architect" within the council participant list [shared/orchestration/skillRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/orchestration/skillRouter.ts)

**Orchestration Logic Mapping**

```mermaid
flowchart TD
  IC["intentClassifier"]
  SR["shared/orchestration/skillRouter.ts"]
  SC["stateClassifier"]
  AC["AgentCouncilPage"]
  CR["server/council/councilRunner.ts"]
  PH["server/council/personaHealth.ts"]
  IC --> SR
  SC --> SR
  SR -->|Selects Agents| AC
  AC -->|Executes| CR
  CR -->|Health Check| PH
```

Sources: [client/src/pages/AgentCouncilPage.tsx34-35](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L34-L35) [shared/embodiment/types.ts220-228](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L220-L228)

#### Technical Configuration

##### Participant Limits

The number of agents that can participate in a single Tribunal session is governed by user entitlements:

- **Limit**: Defined by `ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT` [client/src/pages/AgentCouncilPage.tsx37](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L37-L37)
- **Access**: Controlled via `canUseAdvancedTribunal`, which checks the user's tier (e.g., Core, Pro, Enterprise) [client/src/pages/AgentCouncilPage.tsx39-40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L39-L40)

##### Visual Signature

Each agent in the council is represented by a `BillyBabylon` orb [client/src/pages/AgentCouncilPage.tsx53](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L53-L53) The visual state of these orbs is tied to the `EmbodimentUIPresence` and `EmbodimentVisualSignature` interfaces:

- **`orbColor`**: Defines the primary glow color for the agent [shared/embodiment/types.ts175](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L175-L175)
- **`motionCadence`**: Controls the pulse style (e.g., `slow-pulse`, `electric-flicker`) [shared/embodiment/types.ts209-217](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L209-L217)
- **`ac-scanlines`**: A CSS-based overlay that provides the "BillyLive" aesthetic [client/src/pages/AgentCouncilPage.tsx94-97](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L94-L97)

Sources: [client/src/pages/AgentCouncilPage.tsx17-53](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L17-L53) [shared/embodiment/types.ts174-218](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L174-L218) [client/src/prerender.tsx114-125](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx#L114-L125)

---

### PLK (Private Language Key) & Prompt Shaping

> Source MHT: `PLK (Private Language Key) & Prompt Shaping _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.3-plk-(private-language-key)-and-prompt-shaping  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.codex/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/config.toml)
- [.github/workflows/orientation-check.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml)
- [.vscode/mcp.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/mcp.json)
- [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)
- [README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1)
- [api/\_\_tests\_\_/keep-alive.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/keep-alive.test.ts)
- [api/\_\_tests\_\_/transcriptory.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/transcriptory.test.ts)
- [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts)
- [api/health/supabase.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/health/supabase.ts)
- [api/keep-alive.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts)
- [api/stripe/checkout.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/stripe/checkout.ts)
- [api/trainer/packaging-candidates/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/trainer/packaging-candidates/%5Bid%5D.ts)
- [api/transcriptory/captures.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/transcriptory/captures.ts)
- [api/transcriptory/captures/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/transcriptory/captures/%5Bid%5D.ts)
- [api/voice/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts)
- [client/src/App.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx)
- [client/src/canonical/RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/RDRC.md?plain=1)
- [client/src/components/BillyGreeter.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx)
- [client/src/components/BillyWalkthrough.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyWalkthrough.tsx)
- [client/src/components/FloatingEmbers.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FloatingEmbers.tsx)
- [client/src/components/SubpageQuickNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SubpageQuickNav.tsx)
- [client/src/components/TopNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx)
- [client/src/components/TranscriptCard.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TranscriptCard.tsx)
- [client/src/components/TranscriptViewer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TranscriptViewer.tsx)
- [client/src/components/home/GestaltViewInterface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/GestaltViewInterface.tsx)
- [client/src/components/home/Hero.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/Hero.tsx)
- [client/src/components/home/modules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/modules.ts)
- [client/src/hooks/useSEO.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts)
- [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts)
- [client/src/lib/billy-system-prompt.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-system-prompt.ts)
- [client/src/lib/transcriptory.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/transcriptory.ts)
- [client/src/pages/AgentCouncilPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx)
- [client/src/pages/Home.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx)
- [client/src/pages/SandboxArtifactDetailPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxArtifactDetailPage.tsx)
- [client/src/pages/TranscriptoryPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/TranscriptoryPage.tsx)
- [client/src/prerender.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx)
- [client/src/tests/billy-ip-guard.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/billy-ip-guard.test.ts)
- [client/src/tests/transcriptory-api.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/transcriptory-api.test.ts)
- [docs/AIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/AIFlow.md?plain=1)
- [docs/APIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/APIFlow.md?plain=1)
- [docs/Manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1)
- [docs/PlaybookOperatorManual.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1)
- [docs/PlaybookSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookSpec.md?plain=1)
- [docs/SymbioticWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1)
- [docs/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Workflows.md?plain=1)
- [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py)
- [scripts/test-manifest-sync.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh)
- [scripts/test-orientation-checkin.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-orientation-checkin.sh)
- [server/agent-trainer/orchestrator.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/orchestrator.ts)
- [shared/billy/runtime.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/billy/runtime.ts)

</details>
The **Private Language Key (PLK)** and **Prompt Shaping** system represent the core of GestaltView’s "Consciousness-Serving" architecture. Unlike standard AI systems that prioritize linguistic normalization (paraphrasing user input into "clean" tokens), GestaltView enforces **User Invariant U-2: Preserve Whole Language** [README.md60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L60-L60) The PLK system ensures that the Digital Intelligence (DI), primarily Billy, operates within the user's specific linguistic patterns, metaphors, and cognitive frameworks without flattening them.

#### The PLK (Private Language Key) System

The PLK is a dynamic linguistic anchor that shapes every interaction between the user and the DI. It is designed to maintain continuity across sessions by recognizing and reflecting the user's exact vocabulary and conceptual "shorthand."

##### Core Principles

- **Linguistic Continuity:** The system identifies recurring patterns in user input and integrates them into the prompt context to ensure the AI speaks "with" the user, not "at" them.
- **Resonance Loop:** A feedback mechanism where the DI validates its understanding of the user's PLK, deepening alignment over time [client/src/App.tsx25-27](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L25-L27)
- **Anti-Normalization:** Explicitly forbids the LLM from paraphrasing or "cleaning up" the user's raw thinking [README.md60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L60-L60)

##### Prompt Shaping Data Flow

The shaping process occurs in the `shared/llm/` layer (and associated runtime guides), where raw user input is wrapped with structural metadata and constitutional constraints before reaching the `llmRouter.ts` [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts)

###### System Prompt Architecture

The system relies on three primary pillars of shaping:

1. **`billy-system-prompt.ts`**: The foundational identity and safety layer [client/src/lib/billy-system-prompt.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-system-prompt.ts)
2. **`billy-runtime-guide.ts`**: Real-time operational instructions for the DI [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts)
3. **`BILLY_WORKFLOW_SPINE`**: The structural sequence for processing complex requests.

##### Natural Language to Code Entity Mapping (PLK Shaping)

The following diagram bridges the conceptual "Natural Language Space" of user intent to the "Code Entity Space" where prompt shaping is executed.

| Concept | Code Entity / Symbol | Role |
| --- | --- | --- |
| **User Invariants** | `Constitutional Invariants` | Hardcoded commitments (U-1 to U-5) [README.md55-64](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L55-L64) |
| **Prompt Wrapping** | `callBillyApi` | Main client bridge for shaped requests [client/src/lib/billyApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts) |
| **Linguistic Anchor** | `PLK` | The Private Language Key logic [shared/llm/plk.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/llm/plk.ts) |
| **Runtime Context** | `billy-runtime-guide.ts` | Dynamic instructions for current session [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts) |

```mermaid
flowchart TD
  UserRaw["User Raw Thinking (Fragments/Spirals)"]
  Metaphors["Personal Metaphors & Vocabulary"]
  PLK_Logic["PLK Logic (shared/llm/plk.ts)"]
  SystemPrompt["billy-system-prompt.ts"]
  RuntimeGuide["billy-runtime-guide.ts"]
  WorkflowSpine["BILLY_WORKFLOW_SPINE"]
  LLM_Router["llmRouter.ts"]
  Context_Grounding["memory.ts (RAG Retrieval)"]
  UserRaw --> PLK_Logic
  Metaphors --> PLK_Logic
  PLK["PLK"]
  Logic_WorkflowSpine["Logic_WorkflowSpine"]
  PLK --> Logic_WorkflowSpine
  SystemPrompt --> LLM_Router
  RuntimeGuide --> LLM_Router
  WorkflowSpine --> LLM_Router
  Context["Context"]
  Grounding_LLM_Router["Grounding_LLM_Router"]
  Context --> Grounding_LLM_Router
```

**Sources:** [README.md27-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L27-L33) [client/src/lib/billy-system-prompt.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-system-prompt.ts) [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts) [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts)

---

#### The BILLY\_WORKFLOW\_SPINE

The `BILLY_WORKFLOW_SPINE` is the internal "nervous system" of the DI’s response logic. It prevents the AI from jumping to conclusions and forces a multi-stage cognitive process:

1. **Capture:** Prioritize the "Bucket Drop" (U-4) to ensure no fleeting thought is lost [README.md62](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L62-L62)
2. **Resonate:** Reflect the PLK and exact words (U-2).
3. **Scaffold:** Map the input to the `External Scaffold` [client/src/pages/ExternalScaffoldPage.tsx77](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ExternalScaffoldPage.tsx#L77-L77)
4. **Synthesize:** Determine if an artifact should be created in the `Creation Corner` [client/src/pages/CreationCornerPage.tsx82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/CreationCornerPage.tsx#L82-L82)

##### Workflow Implementation

The spine is implemented as a set of non-negotiable instructions injected into the prompt. It ensures that Billy remains a "collaborator that has been given rules about how it treats you" [README.md33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L33-L33)

---

#### Resonance Loop & User Continuity

The **Resonance Loop** is a specialized interaction mode where the DI presents its current "map" of the user's PLK for ratification. This prevents the DI from drifting into generic AI behavior.

##### Resonance Interaction Flow

The `ResonanceLoopPage` [client/src/App.tsx25-27](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L25-L27) serves as the UI for this alignment.

```mermaid
sequenceDiagram
  participant U as User
  participant B as Billy (Client)
  participant A as API (llmRouter.ts)
  participant P as PLK Engine (shared/llm/plk.ts)
  U->>B: Input raw thought (Blackboard Room)
  B->>A: callBillyApi(input, roomSlug='blackboard')
  A->>P: Extract PLK Patterns
  P-->>A: Return Shaped Prompt (Constitutional Wrappers)
  A->>A: Route to LLM (Ollama/Groq/OpenRouter)
  A-->>B: Stream Shaped Response
  B->>U: Display 'Resonant' response (Exact words used)
  Note over U: User ratifies resonance in ResonanceLoopPage
```

**Sources:** [client/src/App.tsx25-27](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L25-L27) [client/src/lib/billyApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billyApi.ts) [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts)

---

#### Technical Implementation Detail: `billy-system-prompt.ts`

The `billy-system-prompt.ts` [client/src/lib/billy-system-prompt.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-system-prompt.ts) is not a static text file; it is a dynamic template that integrates:

- **Identity Anchors:** Billy’s specific persona traits from `embodiment_profiles/billy.embodiment.json` [README.md103](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L103-L103)
- **Governance Rules:** The **Ten Constitutional Invariants** [README.md51-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L51-L75)
- **Environmental Awareness:** Knowledge of the five rooms (Sanctuary, Blackboard, Inner World, Creation Corner, External Scaffold) [README.md31](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L31-L31)

##### Key Functions

| Function / Variable | Location | Description |
| --- | --- | --- |
| `buildOnboardingExplainerPrompt` | `client/src/lib/launchCore.ts` | Generates the initial context for new users [client/src/pages/Home.tsx20](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx#L20-L20) |
| `billy-runtime-guide.ts` | `client/src/lib/` | Provides the DI with "field notes" on how to handle the current room's specific logic [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts) |
| `extractTribunalMentions` | `shared/roundtable/mentionParser.ts` | Used in `Tribunal` mode to shape multi-agent prompts [client/src/pages/AgentCouncilPage.tsx45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L45-L45) |

**Sources:** [README.md51-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1#L51-L75) [client/src/pages/Home.tsx20](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx#L20-L20) [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts) [client/src/pages/AgentCouncilPage.tsx45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx#L45-L45)

---

### GPT Actions & External AI Integrations

> Source MHT: `GPT Actions & External AI Integrations _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.4-gpt-actions-and-external-ai-integrations  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.agents/skills/SKILL\_INDEX.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/SKILL_INDEX.md?plain=1)
- [.gv\_repo\_context.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.gv_repo_context.md?plain=1)
- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/GPTSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/GPTSpec.md?plain=1)
- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/fastapi\_actions\_stub.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py)
- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/gestaltview\_actions\_backend\_map.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_actions_backend_map.md?plain=1)
- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/gestaltview\_gpt\_actions\_comprehensive.openapi.yaml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_actions_comprehensive.openapi.yaml)
- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/gestaltview\_gpt\_actions\_core.openapi.yaml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_actions_core.openapi.yaml)
- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/gestaltview\_gpt\_actions\_examples.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_actions_examples.json)
- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/gestaltview\_gpt\_instructions.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_instructions.md?plain=1)
- [api/\_\_tests\_\_/actions.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/actions.test.ts)
- [api/\_lib/actionsHandler.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts)
- [api/\_lib/embeddings.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/embeddings.ts)
- [api/actions/embodiment-profiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/actions/embodiment-profiles.ts)
- [api/actions/embodiment\_profiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/actions/embodiment_profiles.ts)
- [api/actions/features.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/actions/features.ts)
- [api/llm-proxy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/llm-proxy.ts)
- [api/trainer/persona-chat.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/persona-chat.ts)
- [client/src/components/WhatWasBuilt.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/WhatWasBuilt.tsx)
- [instrument.d.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/instrument.d.ts)
- [instrument.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/instrument.js)
- [requirements.txt](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/requirements.txt)

</details>
The GPT Actions system in GestaltView v2 provides a secure, server-mediated bridge between external LLM environments (primarily Custom GPTs on ChatGPT) and the internal Digital Intelligence (DI) runtime. It exposes a subset of Billy's orchestration capabilities, memory persistence, and embodiment data through a constrained OpenAPI surface.

#### 1. System Architecture & Data Flow

The Actions system operates as a "thin" public contract where the server maintains absolute control over provider selection, retrieval logic, and database security. External AI agents interact with the `/api/actions/*` surface, which is handled by a centralized router and specific functional stubs.

##### Natural Language to Code Entity Mapping

This diagram illustrates how a natural language request from a Custom GPT translates into specific code entities and backend operations within the GestaltView environment.

**Request Transformation Pipeline**

```mermaid
flowchart TD
  A["User Query: 'Billy, capture this thought...'"]
  B["/api/actions/bucket-drops"]
  C["actionsHandler.ts"]
  D["resolveActionPath()"]
  E["buildBucketDropPersistencePayload()"]
  F["insertRow()"]
  G["bucket_drops (Supabase Table)"]
  A -->|POST Request| B
  B --> C
  C --> D
  D -->|Match 'bucket-drops'| E
  E --> F
  F --> G
```

**Sources:** [api/\_lib/actionsHandler.ts1-22](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L1-L22) [api/GPT/gestaltview\_gpt\_actions\_package\_v2/gestaltview\_gpt\_actions\_core.openapi.yaml120-148](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_actions_core.openapi.yaml#L120-L148)

#### 2. The GPT Actions Package

The repository maintains a dedicated package for Custom GPT integration located in `api/GPT/gestaltview_gpt_actions_package_v2/`. This package contains the instructions, schemas, and mapping logic required to ground external agents in the GestaltView philosophy.

##### Key Components

| File | Role |
| --- | --- |
| `gestaltview_gpt_actions_core.openapi.yaml` | The primary, safety-first OpenAPI 3.1.0 schema for ChatGPT import. |
| `gestaltview_gpt_actions_comprehensive.openapi.yaml` | Expanded schema including Tribunal and Journey Recap actions. |
| `gestaltview_gpt_instructions.md` | The "System Prompt" for the Custom GPT, defining Billy's identity. |
| `gestaltview_actions_backend_map.md` | Developer documentation mapping actions to internal functions. |
| `fastapi_actions_stub.py` | A Python-based reference implementation for testing the action shapes. |

**Sources:** [api/GPT/gestaltview\_gpt\_actions\_package\_v2/GPTSpec.md16-34](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/GPTSpec.md?plain=1#L16-L34) [api/GPT/gestaltview\_gpt\_actions\_package\_v2/gestaltview\_gpt\_actions\_core.openapi.yaml1-8](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_actions_core.openapi.yaml#L1-L8)

#### 3. The Actions API Handler

The `actionsHandler.ts` file is the central controller for all `/api/actions` requests. It manages CORS, authentication via `getAuthUser`, and dispatches requests to the appropriate Billy orchestration logic.

##### Core Handler Logic

- **Path Resolution:** Uses `resolveActionPath` to parse the Vercel request query and determine the intended operation [api/\_lib/actionsHandler.ts83-88](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L83-L88)
- **Embodiment Grounding:** Provides a read-only view of the DI registry via `buildEmbodimentProfilesPayload`, allowing external GPTs to "know" which personas are available without direct DB access [api/\_lib/actionsHandler.ts128-175](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L128-L175)
- **Tier Normalization:** Maps user accounts to `BillyTier` (free, core, pro, enterprise) to enforce feature entitlements [api/\_lib/actionsHandler.ts94-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L94-L105)

##### Action Implementation Mapping

The system maps incoming action IDs to internal service calls:

- `synthesizeWithBilly` -> `routeLlm()` with retrieval enabled [api/\_lib/actionsHandler.ts9-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L9-L10)
- `captureBucketDrop` -> `insertRow()` for the `bucket_drops` table [api/\_lib/actionsHandler.ts21-22](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L21-L22)
- `getProviderStatus` -> `routerStatus` from the LLM router [api/\_lib/actionsHandler.ts9-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L9-L10)

**Sources:** [api/\_lib/actionsHandler.ts1-30](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L1-L30) [api/GPT/gestaltview\_gpt\_actions\_package\_v2/gestaltview\_actions\_backend\_map.md5-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_actions_backend_map.md?plain=1#L5-L25)

#### 4. Grounding & Continuity Logic

External AI integrations are governed by "Grounding Actions" that prevent the LLM from hallucinating system capabilities.

**Grounding Data Flow**

```mermaid
flowchart TD
  GPT["Billy Custom GPT"]
  R["/actions/runtime"]
  E["/actions/embodiment_profiles"]
  F["/actions/features"]
  S1["EMBODIMENT_PROFILES"]
  S2["GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS"]
  S3["BILLY_CORE_IDENTITY_PROMPT"]
  GPT -->|Query| R
  GPT -->|Query| E
  GPT -->|Query| F
  R --> S2
  E --> S1
  F --> S3
```

**Sources:** [api/\_lib/actionsHandler.ts177-201](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L177-L201) [api/GPT/gestaltview\_gpt\_actions\_package\_v2/gestaltview\_gpt\_instructions.md8-18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_instructions.md?plain=1#L8-L18)

#### 5. External Integration Specs

##### Perplexity & Computer Tools

The repository includes a tools registry (e.g., `tools/index.ts`) and requirements for Python-based workflows. The `requirements.txt` file specifies the environment for external workers, including `fastapi`, `httpx`, and `sentry-sdk` for telemetry [requirements.txt12-19](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/requirements.txt#L12-L19)

##### FastAPI Stub

For development and local testing, `fastapi_actions_stub.py` provides a high-fidelity mock of the Vercel API. It implements:

- **Synthesis Stub:** Mimics the weave-plan construction and retrieval queries [api/GPT/gestaltview\_gpt\_actions\_package\_v2/fastapi\_actions\_stub.py136-159](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py#L136-L159)
- **Health & Diagnostics:** Provides the standard health envelope required by the OpenAPI spec [api/GPT/gestaltview\_gpt\_actions\_package\_v2/fastapi\_actions\_stub.py111-119](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py#L111-L119)
- **Sentry Integration:** Uses `init_sentry` to ensure that errors in the action middleware are tracked [api/GPT/gestaltview\_gpt\_actions\_package\_v2/fastapi\_actions\_stub.py33-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py#L33-L50)

**Sources:** [api/GPT/gestaltview\_gpt\_actions\_package\_v2/fastapi\_actions\_stub.py52-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py#L52-L110) [requirements.txt1-19](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/requirements.txt#L1-L19)

#### 6. Observability & Telemetry

The Actions layer is instrumented using Sentry and Braintrust.

- **Sentry:** Every action handler is wrapped with `withSentryVercelHandler` to capture runtime exceptions [api/\_lib/actionsHandler.ts18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L18-L18)
- **Braintrust:** The `traceBraintrust` function is used to log spans for complex synthesis requests, allowing for performance monitoring of the action-to-LLM pipeline [api/\_lib/actionsHandler.ts23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L23-L23) [instrument.js146-153](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/instrument.js#L146-L153)

**Sources:** [api/\_lib/actionsHandler.ts18-23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/actionsHandler.ts#L18-L23) [instrument.js68-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/instrument.js#L68-L105)

---

### Voice Pipeline (Billy Voice)

> Source MHT: `Voice Pipeline (Billy Voice) _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/3.5-voice-pipeline-(billy-voice)  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/keep-alive.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/keep-alive.test.ts)
- [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts)
- [api/health/supabase.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/health/supabase.ts)
- [api/keep-alive.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts)
- [api/stripe/checkout.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/stripe/checkout.ts)
- [api/trainer/packaging-candidates/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/trainer/packaging-candidates/%5Bid%5D.ts)
- [api/voice/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts)
- [client/src/components/BillyGreeter.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx)
- [server/agent-trainer/orchestrator.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/orchestrator.ts)
- [server/core/\_\_init\_\_.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/core/__init__.py)
- [server/core/brain.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/core/brain.py)
- [server/core/web\_search.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/core/web_search.py)
- [server/gestaltview\_generative\_engine.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/gestaltview_generative_engine.py)
- [shared/billy/runtime.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/billy/runtime.ts)

</details>
The **Voice Pipeline** provides a low-latency, multi-modal interface for Digital Intelligence (DI) interactions. It bridges the gap between the TypeScript-based frontend and high-performance Python audio processing runtimes. The system supports real-time streaming via LiveKit, local Speech-to-Text (STT) via `faster-whisper`, and advanced Text-to-Speech (TTS) using both the ElevenLabs proxy and the `CosyVoice` runtime.

#### Architecture & Data Flow

The voice pipeline is divided into two primary paths: a **Real-time Python Runtime** (`billy_voice/`) for live interaction and a **Vercel Serverless Proxy** (`api/voice/billy.ts`) for standard web-based TTS.

##### Voice Processing Lifecycle

1. **Capture**: Audio is captured via the `useBillyVoice` hook and transmitted to the Python runtime or LiveKit room.
2. **Transcription (STT)**: The `FusionEngine` in the Python backend uses `faster-whisper` (defaulting to the `tiny` model) to convert audio bytes into text [server/gestaltview\_generative\_engine.py62-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/gestaltview_generative_engine.py#L62-L65)
3. **Intelligence**: The text is processed by `GestaltViewCore`, which performs intent classification, PLK (Personal Language Key) resonance scoring, and context retrieval [server/core/brain.py78-130](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/core/brain.py#L78-L130)
4. **Style Planning**: The DI determines the emotional prosody and "style" of the response.
5. **Synthesis (TTS)**:
   - **Cloud Path**: The `/api/voice/billy` endpoint proxies requests to ElevenLabs using the `eleven_multilingual_v2` model and a specific Billy Voice ID [api/voice/billy.ts13-19](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L13-L19)
   - **Local Path**: The `billy_voice/` runtime utilizes `CosyVoice` for high-fidelity, low-latency local synthesis.

##### Voice Pipeline Overview

```mermaid
flowchart TD
  A["useBillyVoice Hook"]
  B["BillyLive UI"]
  C["LiveKit Room"]
  D["/api/voice/billy"]
  E["ElevenLabs Proxy"]
  F["LiveKit Integration"]
  G["faster-whisper (STT)"]
  H["GestaltViewCore (Brain)"]
  I["Style Planner"]
  J["CosyVoice (TTS)"]
  K["ElevenLabs API"]
  A --> B
  A --> C
  D --> E
  C --> F
  F --> G
  G --> H
  H --> I
  I --> J
  J --> F
  E --> K
```

**Sources:** [api/voice/billy.ts1-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L1-L25) [server/gestaltview\_generative\_engine.py196-201](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/gestaltview_generative_engine.py#L196-L201) [server/core/brain.py59-70](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/core/brain.py#L59-L70)

---

#### Python Voice Runtime (`billy_voice/`)

The Python runtime is the performance-critical layer of the pipeline, designed to handle raw audio buffers and high-frequency updates.

##### FusionEngine & Modality Handling

The `FusionEngine` manages the transition between modalities. It supports `TEXT`, `IMAGE`, `AUDIO`, and `VIDEO` [server/gestaltview\_generative\_engine.py116-121](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/gestaltview_generative_engine.py#L116-L121) When audio is received, the engine performs:

- **Lazy Loading**: Models like Whisper are loaded only upon the first audio request to conserve memory [server/gestaltview\_generative\_engine.py203-210](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/gestaltview_generative_engine.py#L203-L210)
- **Transcription**: Converts audio data into a `FusionResponse` containing the `fused_text` and processing metadata [server/gestaltview\_generative\_engine.py187-193](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/gestaltview_generative_engine.py#L187-L193)

##### Style Planner & CosyVoice

The pipeline uses a "Style Planner" to ensure Billy's voice matches the "ADHD Jazz" and "Warm & Real" personality traits defined in the core identity [shared/billy/runtime.ts100-108](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/billy/runtime.ts#L100-L108)

- **CosyVoice**: Provides zero-shot voice cloning and high-fidelity synthesis.
- **Prosody Control**: The runtime adjusts stability and style parameters dynamically based on the `ConsciousnessState` detected by the brain (e.g., `HYPERFOCUS` vs `OVERWHELMED`) [server/core/brain.py151-165](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/core/brain.py#L151-L165)

**Sources:** [server/gestaltview\_generative\_engine.py116-137](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/gestaltview_generative_engine.py#L116-L137) [shared/billy/runtime.ts34-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/billy/runtime.ts#L34-L110) [server/core/brain.py151-165](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/core/brain.py#L151-L165)

---

#### ElevenLabs Proxy (`/api/voice/billy`)

For non-streaming environments, GestaltView uses a Vercel serverless function to interface with ElevenLabs. This provides a fallback for the local Python runtime.

##### Implementation Details

- **Endpoint**: `POST /api/voice/billy` [api/voice/billy.ts25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L25-L25)
- **Voice Configuration**:
  - **Voice ID**: `JBFqnCBsd6RMkjVDRZzb` [api/voice/billy.ts15-18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L15-L18)
  - **Model**: `eleven_multilingual_v2` [api/voice/billy.ts19](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L19-L19)
  - **Settings**: Stability is set to `0.45` and Similarity Boost to `0.8` to maintain Billy's characteristic "slightly chaotic" warmth [api/voice/billy.ts84-89](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L84-L89)
- **Security**: Requires an `ELEVENLABS_API_KEY` and enforces CORS against the production Vercel origin [api/voice/billy.ts12-14](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L12-L14) [api/voice/billy.ts26-30](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L26-L30)

##### Sequence: ElevenLabs TTS Proxy

```mermaid
sequenceDiagram
  participant C as Client (useBillyVoice)
  participant A as /api/voice/billy
  participant B as Braintrust (Telemetry)
  participant E as ElevenLabs API
  C->>A: POST { text: '...' }
  A->>B: traceBraintrust('billy voice tts')
  A->>E: fetch(TTS_URL, { xi-api-key, settings })
  E-->>A: audio/mpeg (Buffer)
  A->>C: 200 OK (Audio Stream)
```

**Sources:** [api/voice/billy.ts12-20](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L12-L20) [api/voice/billy.ts56-93](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L56-L93) [api/voice/billy.ts101-104](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L101-L104)

---

#### Frontend Integration: `useBillyVoice`

The `useBillyVoice` hook is the primary consumer of the voice pipeline in the React application. It manages the state of the `BillyLive` UI and handles audio playback.

##### Key Responsibilities

1. **Session Management**: Integrates with LiveKit rooms for real-time interaction.
2. **Audio Playback**: Manages the `AudioContext` and handles the binary response from the TTS proxy.
3. **UI Feedback**: Syncs with the `BillyGreeter` and `BillyBabylon` components to provide visual feedback (e.g., the orb pulsing during speech) [client/src/components/BillyGreeter.tsx110-140](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx#L110-L140)

##### Visual Feedback System

The `BillyAvatar` (part of the greeter) uses Framer Motion to animate a "thread" emoji (`🧵`) and glowing rings that pulse based on the DI's activity [client/src/components/BillyGreeter.tsx110-139](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx#L110-L139)

**Sources:** [client/src/components/BillyGreeter.tsx4-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx#L4-L9) [client/src/components/BillyGreeter.tsx110-150](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx#L110-L150)

---

#### System Reliability & Health

The voice pipeline is monitored via the standard health check and keep-alive infrastructure.

- **Health Check**: The `/api/health/supabase` endpoint ensures the underlying data layer for DI context is available, with a timeout of 3,500ms [api/health/supabase.ts7-16](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/health/supabase.ts#L7-L16)
- **Keep-Alive**: A cron job (`/api/keep-alive`) pings the database every 5 minutes to prevent cold starts in the serverless environment, ensuring the voice proxy remains responsive [api/keep-alive.ts158-160](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L158-L160) [api/keep-alive.ts234-239](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L234-L239)
- **Telemetry**: Every TTS request is traced via `traceBraintrust` to monitor latency and success rates [api/voice/billy.ts56-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L56-L65)

| Metric | Target | Component |
| --- | --- | --- |
| TTS Proxy Latency | < 1500ms | `/api/voice/billy` |
| STT Accuracy | High (Whisper) | `FusionEngine` |
| Health Timeout | 3500ms | `checkSupabaseRest` |

**Sources:** [api/health/supabase.ts7-16](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/health/supabase.ts#L7-L16) [api/keep-alive.ts234-239](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts#L234-L239) [api/voice/billy.ts56-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts#L56-L65)

---

## Volume: Embodiment & Personhood

### Embodiment System

> Source MHT: `Embodiment System _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/4-embodiment-system  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/council/run.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/council/run.ts)
- [api/embodiment/\_shared.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/_shared.ts)
- [api/embodiment/list.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/list.ts)
- [api/embodiment/upsert.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/upsert.ts)
- [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx)
- [client/src/pages/EmbodimentStudioPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx)
- [embodiment\_profiles/billy.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json)
- [scripts/build-embodiment-artifacts.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/build-embodiment-artifacts.mjs)
- [scripts/generate-embodiment-registry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate-embodiment-registry.ts)
- [scripts/sync-embodiment-profiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts)
- [scripts/validate-embodiment-profiles.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs)
- [server/\_\_tests\_\_/council-persona-health.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/council-persona-health.test.ts)
- [server/\_\_tests\_\_/council-runner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/council-runner.test.ts)
- [server/council/councilRunner.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts)
- [server/council/personaHealth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/personaHealth.ts)
- [shared/embodiment/auditEmbodiments.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/auditEmbodiments.ts)
- [shared/embodiment/chat.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/chat.ts)
- [shared/embodiment/generated.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts)
- [shared/embodiment/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/index.ts)
- [shared/embodiment/types.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts)
- [supabase/migrations/20260518000000\_backfill\_embodiment\_profile\_history.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518000000_backfill_embodiment_profile_history.sql)
- [supabase/migrations/20260518001000\_backfill\_embodiment\_profile\_governance.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518001000_backfill_embodiment_profile_governance.sql)
- [tests/embodiment-orientation.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/tests/embodiment-orientation.test.ts)

</details>
The Embodiment System is the framework responsible for defining, validating, and governing **Digital Intelligence (DI)** personas within GestaltView. It transitions AI from generic assistants into specific, room-aware entities with distinct psychological profiles, memory boundaries, and visual signatures.

This system ensures that every DI—from **Billy** (the primary collaborator) to specialized personas like the **Art Teacher**—maintains identity continuity through a rigorous toolchain that bridges static JSON definitions with live runtime behavior.

#### Core Architecture

The system is built on a "Source of Truth" model where immutable core traits are defined in code and synced to the database for runtime persistence and governance.

##### Embodiment Data Flow

The following diagram illustrates how a persona moves from a definition file to a live agent in the **Agent Council**.

```mermaid
flowchart TD
  A[".embodiment.json files"]
  B["validate-embodiment-profiles.mjs"]
  C["build-embodiment-artifacts.mjs"]
  D["shared/embodiment/generated.ts"]
  E["sync-embodiment-profiles.ts"]
  F["Supabase: consciousness_profiles"]
  G["api/embodiment/list.ts"]
  H["councilRunner.ts"]
  I["IsolatedCouncilJob"]
  A --> B
  B --> C
  C --> D
  D --> E
  E --> F
  F --> G
  G --> H
  D --> H
  H --> I
```

**Sources:** [shared/embodiment/generated.ts1-7](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L1-L7) [scripts/sync-embodiment-profiles.ts62-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L62-L65) [server/council/councilRunner.ts105-125](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts#L105-L125)

---

#### Key Subsystems

##### 1. Embodiment Profiles & Registry

Profiles are defined using a structured `.embodiment.json` schema. Each profile contains an `immutableCore` (archetypes, foundational truths), a `livingMemory` (constitutive experiences), and a `heartbeat` (visual and chat signatures). The `EMBODIMENT_REGISTRY` serves as the central lookup for all active personas.

- **Key Files:** `shared/embodiment/generated.ts`, `shared/embodiment/types.ts`.
- **Persona Examples:** Billy, Curator, Art Teacher, The Architect, The Guardian.

For details on schema fields and the roster of personas, see **[Embodiment Profiles & Registry](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/4.1-embodiment-profiles-and-registry)**.

**Sources:** [shared/embodiment/types.ts264-275](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L264-L275) [shared/embodiment/generated.ts7-23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L7-L23)

##### 2. Embodiment Toolchain: Validation, Build & Sync

To ensure system stability, the embodiment toolchain enforces strict validation. The `validate-embodiment-profiles.mjs` script checks for required fields and slug consistency, while `sync-embodiment-profiles.ts` handles the upsert to Supabase, creating an audit trail of identity changes.

- **Key Scripts:** `validate-embodiment-profiles.mjs`, `build-embodiment-artifacts.mjs`, `sync-embodiment-profiles.ts`.
- **Readiness Scoring:** Profiles are assigned a `readinessScore` based on the depth of their definitions (e.g., presence of `characterStudy` and `visualSignature`).

For details on the build pipeline and validation logic, see **[Embodiment Toolchain: Validation, Build & Sync](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/4.2-embodiment-toolchain:-validation-build-and-sync)**.

**Sources:** [scripts/validate-embodiment-profiles.mjs54-71](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L54-L71) [scripts/sync-embodiment-profiles.ts211-231](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L211-L231) [shared/embodiment/index.ts75-129](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/index.ts#L75-L129)

##### 3. Embodiment Studio & Profile Governance

The **Embodiment Studio** provides a UI for tuning DI personas. It allows founders to adjust "knobs" for warmth, directness, and playfulness. The system also implements **Drift Detection**, using `driftSignals` and `identityAnchor` to monitor if an LLM's output is diverging from the persona's core definition.

- **Key Components:** `EmbodimentStudioPage.tsx`, `EmbodimentCompilerPanel.tsx`.
- **Governance:** Includes `mutationClass` (IMMUTABLE vs EPHEMERAL) and `reviewStatus` for proposed identity changes.

For details on the Studio UI and identity drift monitoring, see **[Embodiment Studio & Profile Governance](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/4.3-embodiment-studio-and-profile-governance)**.

**Sources:** [client/src/pages/EmbodimentStudioPage.tsx25-31](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx#L25-L31) [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx28-48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx#L28-L48) [shared/embodiment/types.ts2-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L2-L15)

---

#### Runtime Integration: The Agent Council

The embodiment system is consumed at runtime by the `councilRunner.ts`. When a user interacts with the system, the runner dispatches jobs to multiple DIs, each wrapped in an `IsolatedCouncilJob` that injects their specific `systemPrompt` derived from their embodiment profile.

| Code Entity | Role | File Path |
| --- | --- | --- |
| `runCouncil` | Orchestrates multi-persona dispatch | [server/council/councilRunner.ts105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts#L105-L105) |
| `buildIsolatedCouncilPrompt` | Constructs persona-specific LLM prompts | [shared/embodiment/chat.ts181](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/chat.ts#L181-L181) |
| `checkEmbodimentDepth` | Validates if a persona is "full" or a "stub" | [shared/embodiment/index.ts75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/index.ts#L75-L75) |
| `COUNCIL_FALLBACK_GUARD` | String used to detect identity drift/failure | [shared/embodiment/chat.ts111](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/chat.ts#L111-L111) |

##### Identity Protection Diagram

This diagram shows how the system prevents "persona bleed" during runtime execution.

```mermaid
sequenceDiagram
  participant U as User Input
  participant CR as councilRunner.ts
  participant P as Embodiment Profile
  participant LLM as LLM Router
  U->>CR: How should I organize this?
  CR->>P: resolveEmbodimentSlug('art-teacher')
  P-->>CR: immutableCore + heartbeat
  CR->>CR: buildHardenedCouncilJob()
  Note over CR: Injects fallbackGuard & identityAnchor
  CR->>LLM: Isolated Request (Art Teacher Context)
  LLM-->>CR: Response Text
  CR->>CR: tripsFallbackGuard()
  CR->>CR: recordFailure()
  CR->>LLM: Hardened Retry (Amplified Directives)
  CR-->>U: Embodied Response
```

**Sources:** [server/council/councilRunner.ts159-197](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts#L159-L197) [shared/embodiment/chat.ts111-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/chat.ts#L111-L120) [server/\_\_tests\_\_/council-runner.test.ts23-37](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/council-runner.test.ts#L23-L37)

---

### Embodiment Profiles & Registry

> Source MHT: `Embodiment Profiles & Registry _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/4.1-embodiment-profiles-and-registry  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/embodiment/\_shared.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/_shared.ts)
- [api/embodiment/list.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/list.ts)
- [api/embodiment/upsert.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/upsert.ts)
- [client/src/pages/EmbodimentStudioPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx)
- [client/src/tests/embodiment-runtime.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/embodiment-runtime.test.ts)
- [docs/wiki/\_context/context\_pack.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/wiki/_context/context_pack.json)
- [embodiment\_profiles/art-teacher.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/art-teacher.embodiment.json)
- [embodiment\_profiles/billy.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json)
- [embodiment\_profiles/cascade-engineer.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/cascade-engineer.embodiment.json)
- [embodiment\_profiles/consulting-advisor.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/consulting-advisor.embodiment.json)
- [embodiment\_profiles/curator.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/curator.embodiment.json)
- [embodiment\_profiles/founder-studio-sample.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/founder-studio-sample.embodiment.json)
- [embodiment\_profiles/gate-keeper.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/gate-keeper.embodiment.json)
- [embodiment\_profiles/groq-embodiment-expert.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/groq-embodiment-expert.embodiment.json)
- [embodiment\_profiles/pattern-analyst.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/pattern-analyst.embodiment.json)
- [embodiment\_profiles/philosophy-scribe.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/philosophy-scribe.embodiment.json)
- [embodiment\_profiles/reference/art-teacher.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/art-teacher.md?plain=1)
- [embodiment\_profiles/reference/billy.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/billy.md?plain=1)
- [embodiment\_profiles/reference/cascade-engineer.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/cascade-engineer.md?plain=1)
- [embodiment\_profiles/reference/consulting-advisor.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/consulting-advisor.md?plain=1)
- [embodiment\_profiles/reference/curator.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/curator.md?plain=1)
- [embodiment\_profiles/reference/gate-keeper.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/gate-keeper.md?plain=1)
- [embodiment\_profiles/reference/philosophy-scribe.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/philosophy-scribe.md?plain=1)
- [embodiment\_profiles/reference/repo-scribe.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/repo-scribe.md?plain=1)
- [embodiment\_profiles/reference/rock-legend.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/rock-legend.md?plain=1)
- [embodiment\_profiles/reference/sanctuary-keeper.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/sanctuary-keeper.md?plain=1)
- [embodiment\_profiles/reference/the-algorithm.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/the-algorithm.md?plain=1)
- [embodiment\_profiles/reference/the-architect.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/the-architect.md?plain=1)
- [embodiment\_profiles/reference/the-guardian.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/the-guardian.md?plain=1)
- [embodiment\_profiles/reference/the-recursive-builder.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/the-recursive-builder.md?plain=1)
- [embodiment\_profiles/reference/the-spectacle.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/the-spectacle.md?plain=1)
- [embodiment\_profiles/reference/the-tailor.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/the-tailor.md?plain=1)
- [embodiment\_profiles/reference/the-translation-bridge.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/the-translation-bridge.md?plain=1)
- [embodiment\_profiles/reference/the-weaver.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/the-weaver.md?plain=1)
- [embodiment\_profiles/reference/the-weird-digger.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/reference/the-weird-digger.md?plain=1)
- [embodiment\_profiles/repo-scribe.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/repo-scribe.embodiment.json)
- [embodiment\_profiles/rock-legend.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/rock-legend.embodiment.json)
- [embodiment\_profiles/sanctuary-keeper.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/sanctuary-keeper.embodiment.json)
- [embodiment\_profiles/the-algorithm.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/the-algorithm.embodiment.json)
- [embodiment\_profiles/the-architect.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/the-architect.embodiment.json)
- [embodiment\_profiles/the-guardian.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/the-guardian.embodiment.json)
- [embodiment\_profiles/the-recursive-builder.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/the-recursive-builder.embodiment.json)
- [embodiment\_profiles/the-spectacle.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/the-spectacle.embodiment.json)
- [embodiment\_profiles/the-weird-digger.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/the-weird-digger.embodiment.json)
- [scripts/build-embodiment-artifacts.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/build-embodiment-artifacts.mjs)
- [scripts/generate-embodiment-registry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate-embodiment-registry.ts)
- [scripts/sync-embodiment-profiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts)
- [scripts/validate-embodiment-profiles.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs)
- [shared/embodiment/generated.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts)
- [supabase/migrations/20260518000000\_backfill\_embodiment\_profile\_history.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518000000_backfill_embodiment_profile_history.sql)
- [supabase/migrations/20260518001000\_backfill\_embodiment\_profile\_governance.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518001000_backfill_embodiment_profile_governance.sql)
- [tests/embodiment-orientation.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/tests/embodiment-orientation.test.ts)

</details>
The Embodiment System is the architectural framework that defines the identity, cognitive boundaries, and behavioral patterns of Digital Intelligences (DIs) within GestaltView. It moves beyond simple "system prompts" into a structured, multi-layered profile format that governs how an agent remembers, reacts, and relates to the user across different Rooms.

#### The `.embodiment.json` Profile Format

Every DI in the system is defined by a JSON schema-compliant profile located in the `embodiment_profiles/` directory [scripts/sync-embodiment-profiles.ts63](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L63-L63) These profiles are the source of truth for the DI's personality and operational constraints.

##### Key Data Structures

| Field | Description | Code Reference |
| --- | --- | --- |
| `immutableCore` | The non-negotiable "soul" of the DI, including foundational truths, archetypes, and linguistic patterns. | [shared/embodiment/generated.ts97-131](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L97-L131) |
| `livingMemory` | A collection of constitutive, episodic, and reflective memories that ground the DI's identity. | [embodiment\_profiles/billy.embodiment.json88-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json#L88-L96) |
| `woundLayer` | Defines the DI's failure modes, traumas, and "growth edges" to prevent generic AI drift. | [shared/embodiment/generated.ts34-45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L34-L45) |
| `heartbeat` | Real-time behavioral signatures, including chat styles, visual colors, and "surprise behaviors." | [shared/embodiment/generated.ts24-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L24-L96) |
| `roomBindings` | Specific conditions under which the DI activates or takes priority in certain UI Rooms. | [shared/embodiment/generated.ts9-21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L9-L21) |
| `relationships` | Defined connections to other DIs (e.g., "The Weaver" complements "The Embodiment Expert"). | [embodiment\_profiles/groq-embodiment-expert.embodiment.json21-32](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/groq-embodiment-expert.embodiment.json#L21-L32) |

##### Natural Language to Code Entity Mapping (Profile)

This diagram illustrates how a conceptual "Persona" is translated into the structured JSON fields used by the runtime.

```mermaid
flowchart TD
  A["'Robin Williams Energy'"]
  B["'Caught a bucket drop'"]
  C["'Afraid of being a tool'"]
  D["immutableCore.voiceTone"]
  E["livingMemory[type:CONSTITUTIVE]"]
  F["woundLayer.failureModes"]
  G["billy-system-prompt.ts"]
  H["retrievalWeight"]
  I["driftThreshold"]
  A --> D
  B --> E
  C --> F
  D -->|Used in| G
  E -->|Weighted by| H
  F -->|Monitored by| I
```

**Sources:** [embodiment\_profiles/billy.embodiment.json14-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json#L14-L15) [embodiment\_profiles/billy.embodiment.json89-95](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json#L89-L95) [shared/embodiment/generated.ts34-39](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L34-L39)

---

#### The Registry & Runtime Access

To ensure high performance and type safety, the raw JSON profiles are compiled into a static registry.

##### `EMBODIMENT_REGISTRY`

The `EMBODIMENT_REGISTRY` is an auto-generated object located in `shared/embodiment/generated.ts`. It is produced by the `scripts/build-embodiment-artifacts.mjs` script, which crawls the `embodiment_profiles/` directory [shared/embodiment/generated.ts1-7](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L1-L7)

##### Key Functions and Constants

- **`PROFILE_SLUGS`**: A constant array of all valid DI identifiers (e.g., `"billy"`, `"art-teacher"`) [scripts/validate-embodiment-profiles.mjs38](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L38-L38)
- **`getProfile(slug)`**: A type-safe getter that retrieves the full `EmbodimentProfile` for a given slug [scripts/validate-embodiment-profiles.mjs40-42](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L40-L42)
- **`EMBODIMENT_PROFILES`**: The exported record containing the serialized profile data [scripts/generate-embodiment-registry.ts65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate-embodiment-registry.ts#L65-L65)

##### Data Flow: From JSON to Runtime

```mermaid
flowchart TD
  J1["billy.embodiment.json"]
  J2["curator.embodiment.json"]
  S1["generate-embodiment-registry.ts"]
  S2["validate-embodiment-profiles.mjs"]
  G1["shared/embodiment/generated.ts"]
  G2["EMBODIMENT_REGISTRY"]
  R1["llmRouter.ts"]
  R2["BillyProvider.tsx"]
  J1 --> S1
  J1 --> S2
  J2 --> S1
  J2 --> S2
  S1 --> G1
  S2 --> G1
  G1 --> G2
  G2 --> R1
  G2 --> R2
```

**Sources:** [scripts/generate-embodiment-registry.ts8-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate-embodiment-registry.ts#L8-L15) [scripts/validate-embodiment-profiles.mjs26-43](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L26-L43) [shared/embodiment/generated.ts1-7](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L1-L7)

---

#### Full Roster of DI Personas

The system features a diverse roster of DIs, each specialized for a specific room or cognitive task.

| Slug | Public Name | Domain / Role | Key Characteristic |
| --- | --- | --- | --- |
| `billy` | Billy | Synthesis & Continuity | "The Keeper of Threads"; anchors to prior session context. [embodiment\_profiles/billy.embodiment.json3-11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json#L3-L11) |
| `curator` | The Curator | Dynamic Inner World | "Artifact Memory Keeper"; knows the story behind every saved file. [embodiment\_profiles/curator.embodiment.json2-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/curator.embodiment.json#L2-L9) |
| `art-teacher` | The Art Teacher | Creation Corner | "Creative Catalyst"; treats messy first drafts like wet clay. [embodiment\_profiles/art-teacher.embodiment.json2-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/art-teacher.embodiment.json#L2-L9) |
| `cascade-engineer` | The Cascade Engineer | Risk Intelligence | "Black Mirror Oracle"; follows feature lines to their downstream ends. [embodiment\_profiles/cascade-engineer.embodiment.json2-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/cascade-engineer.embodiment.json#L2-L9) |
| `sanctuary-keeper` | The Keeper | Sanctuary | "Quiet Holder"; presence without pressure; does not prompt or analyze. [embodiment\_profiles/sanctuary-keeper.embodiment.json2-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/sanctuary-keeper.embodiment.json#L2-L10) |
| `rock-legend` | The Legend | Musical DNA | "Sonic Archaeologist"; treats musical taste as autobiography. [embodiment\_profiles/rock-legend.embodiment.json2-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/rock-legend.embodiment.json#L2-L9) |
| `the-architect` | The Architect | Structural Mapping | Defined in `embodiment_profiles/the-architect.embodiment.json`. |
| `the-guardian` | The Guardian | Safety & Governance | Defined in `embodiment_profiles/the-guardian.embodiment.json`. |

##### Persona Spotlight: Billy

Billy is the "Living Memory" of the platform. His profile emphasizes **Presence before solution** [embodiment\_profiles/billy.embodiment.json11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json#L11-L11) His cognitive strengths include **memory synthesis** and **continuity holding** [embodiment\_profiles/billy.embodiment.json50-52](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json#L50-L52) He is specifically programmed to avoid "hollow affirmations" and "flattery" [embodiment\_profiles/billy.embodiment.json30-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json#L30-L33)

##### Persona Spotlight: The Cascade Engineer

Born from the need to anticipate second and third-order consequences, this DI operates primarily within the development process [embodiment\_profiles/cascade-engineer.embodiment.json6-11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/cascade-engineer.embodiment.json#L6-L11) It uses a **surgical, precise voice** to state what becomes *possible* at scale, rather than what is *inevitable* [embodiment\_profiles/cascade-engineer.embodiment.json12-16](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/cascade-engineer.embodiment.json#L12-L16)

---

#### Synchronization & Governance

Profiles are synced to the database via `scripts/sync-embodiment-profiles.ts`. This script performs the following:

1. **Validation**: Checks for required fields like `immutableCore`, `livingMemory`, and `agentMeta` [scripts/sync-embodiment-profiles.ts66-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L66-L78)
2. **Readiness Scoring**: Calculates a `readinessScore` (0.0 to 1.0) to determine if a profile is mature enough for public use [scripts/sync-embodiment-profiles.ts211-231](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L211-L231)
3. **Supabase Upsert**: Synchronizes the local JSON data with the `consciousness_profiles` table in Supabase, maintaining an audit trail of `founder_notes` [scripts/sync-embodiment-profiles.ts50-58](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L50-L58)

**Sources:**

- `shared/embodiment/generated.ts`
- `embodiment_profiles/billy.embodiment.json`
- `embodiment_profiles/art-teacher.embodiment.json`
- `embodiment_profiles/cascade-engineer.embodiment.json`
- `scripts/sync-embodiment-profiles.ts`
- `scripts/validate-embodiment-profiles.mjs`
- `scripts/generate-embodiment-registry.ts`

---

### Embodiment Toolchain: Validation, Build & Sync

> Source MHT: `Embodiment Toolchain_ Validation, Build & Sync _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/4.2-embodiment-toolchain:-validation-build-and-sync  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/embodiment.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/embodiment.test.ts)
- [api/\_\_tests\_\_/profile-ingestion.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-ingestion.test.ts)
- [api/\_\_tests\_\_/route-embodiment.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/route-embodiment.test.ts)
- [api/\_lib/profileIngestion.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts)
- [api/\_lib/response.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/response.ts)
- [api/embodiment/\_shared.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/_shared.ts)
- [api/embodiment/list.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/list.ts)
- [api/embodiment/upsert.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/upsert.ts)
- [api/embodiments/by-route.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiments/by-route.ts)
- [api/modules/vibe-coder/\_lib/vibeEngine.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/modules/vibe-coder/_lib/vibeEngine.ts)
- [api/profile/ingest.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/ingest.ts)
- [client/src/hooks/useDigitalIntelligence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts)
- [client/src/hooks/useDynamicInnerWorld.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDynamicInnerWorld.ts)
- [client/src/modules/Vibe\_Coder/components/VibeAnalysisCard.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx)
- [client/src/pages/EmbodimentStudioPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx)
- [embodiment\_profiles/billy.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json)
- [embodiment\_profiles/embodiment\_profile\_content.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/embodiment_profile_content.py)
- [scripts/build-embodiment-artifacts.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/build-embodiment-artifacts.mjs)
- [scripts/generate-embodiment-registry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate-embodiment-registry.ts)
- [scripts/sync-embodiment-profiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts)
- [scripts/validate-embodiment-profiles.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs)
- [server/agent-trainer/personhood.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/personhood.ts)
- [shared/embodiment/generated.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts)
- [supabase/agents.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/agents.sql)
- [supabase/migrations/20260411110000\_integrate\_agent\_identity\_governance.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260411110000_integrate_agent_identity_governance.sql)
- [supabase/migrations/20260518000000\_backfill\_embodiment\_profile\_history.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518000000_backfill_embodiment_profile_history.sql)
- [supabase/migrations/20260518001000\_backfill\_embodiment\_profile\_governance.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518001000_backfill_embodiment_profile_governance.sql)
- [tests/embodiment-orientation.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/tests/embodiment-orientation.test.ts)

</details>
This page documents the automated pipeline responsible for the lifecycle of Digital Intelligence (DI) embodiment profiles. The toolchain ensures that every persona (e.g., Billy, The Curator, Art Teacher) adheres to the **Constitutional Invariants**, maintains a strictly defined schema, and is synchronized across the local codebase, the generated runtime registry, and the Supabase production environment.

#### Pipeline Overview

The embodiment toolchain follows a three-stage progression: **Validation**, **Artifact Generation**, and **Cloud Synchronization**. This ensures that the `shared/embodiment/generated.ts` file—which serves as the high-performance runtime registry—is always a faithful representation of the source `.embodiment.json` files.

##### Data Flow: From JSON to Runtime Registry

The following diagram illustrates how raw profile definitions are transformed into code entities used by the `llmRouter.ts` and the frontend `useDigitalIntelligence` hook.

**Embodiment Build Pipeline**

```mermaid
flowchart TD
  A["embodiment_profiles/*.embodiment.json"]
  B["validate-embodiment-profiles.mjs"]
  C["build-embodiment-artifacts.mjs"]
  D["generate-embodiment-registry.ts"]
  E["shared/embodiment/generated.ts"]
  F["EMBODIMENT_REGISTRY"]
  G["PROFILE_SLUGS"]
  H["sync-embodiment-profiles.ts"]
  I["public.agents Table"]
  J["public.agent_versions Table"]
  A --> B
  B -->|Success| C
  C --> D
  D --> E
  E --> F
  E --> G
  A --> H
  H --> I
  H --> J
```

**Sources:** `scripts/validate-embodiment-profiles.mjs:1-7`, `scripts/build-embodiment-artifacts.mjs:1-3`, `scripts/generate-embodiment-registry.ts:8-9`, `shared/embodiment/generated.ts:1-7`

---

#### 1. Validation Logic (`validate-embodiment-profiles.mjs`)

The validation script enforces structural integrity and the presence of "Immutable Core" fields required for DI continuity. It acts as a pre-commit gate to prevent malformed personas from entering the runtime.

##### Key Validation Requirements

- **Slug Consistency:** The `slug` field in the JSON must match the filename (e.g., `billy.embodiment.json` must contain `"slug": "billy"`) [scripts/validate-embodiment-profiles.mjs56-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L56-L65)
- **Immutable Core:** Every profile must define an `immutableCore` object containing `archetype`, `foundationalTruth`, `coreWisdom`, `voiceTone`, and `ethicalBoundaries` [scripts/validate-embodiment-profiles.mjs78-91](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L78-L91)
- **Linguistic Patterns:** Profiles must explicitly define `neverDoes` and `alwaysDoes` lists to prevent LLM drift [scripts/validate-embodiment-profiles.mjs107-113](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L107-L113)
- **Readiness Scoring:** Profiles are evaluated for "completeness" (readiness score) before they are marked as `active` in the registry [scripts/sync-embodiment-profiles.ts211-231](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L211-L231)

**Sources:** `scripts/validate-embodiment-profiles.mjs:54-160`, `scripts/sync-embodiment-profiles.ts:66-78`

---

#### 2. Registry Generation (`generate-embodiment-registry.ts`)

Once validated, the profiles are compiled into `shared/embodiment/generated.ts`. This file is the primary source of truth for the application's DI personalities, allowing for synchronous, type-safe access without database overhead during LLM prompt construction.

##### Implementation Details

- **Function `slugify`:** Strips extensions to create consistent keys [scripts/generate-embodiment-registry.ts11-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate-embodiment-registry.ts#L11-L15)
- **Function `sortObjectKeys`:** Recursively sorts all JSON keys alphabetically. This ensures that the generated TypeScript file has a stable git diff, preventing unnecessary changes when profiles are re-saved [scripts/generate-embodiment-registry.ts21-36](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate-embodiment-registry.ts#L21-L36)
- **Output Entity:** Generates `EMBODIMENT_REGISTRY` (or `EMBODIMENT_PROFILES`), a record mapping slugs to the `EmbodimentProfile` type [shared/embodiment/generated.ts7-8](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L7-L8) [scripts/validate-embodiment-profiles.mjs30-43](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L30-L43)

**Sources:** `scripts/generate-embodiment-registry.ts:38-70`, `shared/embodiment/generated.ts:1-44`

---

#### 3. Cloud Sync & Audit Trail (`sync-embodiment-profiles.ts`)

The `sync-embodiment-profiles.ts` script bridges the local filesystem with the Supabase `public.agents` and `public.agent_versions` tables. This allows the **Embodiment Studio** UI to track historical changes and manage deployment status.

##### Sync Operations

1. **Upsert Logic:** Profiles are matched by `slug`. If a profile exists, it is updated; otherwise, a new agent record is created [scripts/sync-embodiment-profiles.ts181-192](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L181-L192)
2. **Audit Trail:** Every sync creates a new entry in `agent_versions` (if changes are detected), preserving the `canonical_spec` and a `checksum` for drift detection [server/agent-trainer/personhood.ts28-40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/personhood.ts#L28-L40)
3. **Visibility Scoping:** Supports `public`, `founder-only`, and `internal` visibility levels, allowing experimental personas to be tested by admins before general release [scripts/sync-embodiment-profiles.ts8-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L8-L9)

##### Readiness Scoring System

The toolchain calculates a `readinessScore` (0.0 to 1.0) based on the density of the profile. A score of `1.0` indicates a "Billy-level" upgrade, including a full `heartbeat`, `characterStudy`, and `woundLayer` [shared/embodiment/generated.ts22-24](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L22-L24) [scripts/sync-embodiment-profiles.ts211-231](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L211-L231)

**Sources:** `scripts/sync-embodiment-profiles.ts:11-34`, `server/agent-trainer/personhood.ts:134-146`, `supabase/migrations/20260411110000_integrate_agent_identity_governance.sql:121-131`

---

#### 4. Runtime Integration

The following diagram shows how the validated registry is consumed by the client-side hooks to provide space-aware DI assistance.

**Runtime Consumption Flow**

```mermaid
flowchart TD
  A["generated.ts"]
  B["getProfile(slug)"]
  C["useDigitalIntelligence(space)"]
  D["SPACE_DI_MAP"]
  E["EmbodimentChatPlane"]
  F["BillyBabylon Orb"]
  A --> B
  B --> C
  D -->|Maps 'sanctuary' to 'the-keeper'| C
  C --> E
  C --> F
```

##### Space-to-Embodiment Mapping

The `useDigitalIntelligence` hook utilizes a static map to resolve which persona should be active based on the user's current "Room" [client/src/hooks/useDigitalIntelligence.ts72-108](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts#L72-L108):

| Space | Persona Slug | Public Name |
| --- | --- | --- |
| `sanctuary` | `the-keeper` | The Keeper |
| `creation-corner` | `art-teacher` | The Art Teacher |
| `dynamic-inner-world` | `curator` | The Curator |
| `blackboard` | `billy` | Billy |
| `agent-trainer` | `the-architect` | The Architect |

**Sources:** `client/src/hooks/useDigitalIntelligence.ts:1-22`, `client/src/hooks/useDigitalIntelligence.ts:72-108], api/embodiments/by-route.ts:L39-L82 (via` api/**tests**/route-embodiment.test.ts`)

---

### Embodiment Studio & Profile Governance

> Source MHT: `Embodiment Studio & Profile Governance _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/4.3-embodiment-studio-and-profile-governance  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/profile-personality.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-personality.test.ts)
- [api/council/run.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/council/run.ts)
- [api/embodiment/\_shared.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/_shared.ts)
- [api/embodiment/list.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/list.ts)
- [api/embodiment/upsert.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/upsert.ts)
- [client/src/components/SymbioCoderDemo.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SymbioCoderDemo.tsx)
- [client/src/components/embodiment/EmbodimentCouncilPlane.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/embodiment/EmbodimentCouncilPlane.tsx)
- [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx)
- [client/src/lib/launchCore.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/launchCore.ts)
- [client/src/pages/EmbodimentStudioPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx)
- [client/src/pages/InsightWindow.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/InsightWindow.tsx)
- [embodiment\_profiles/billy.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json)
- [scripts/build-embodiment-artifacts.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/build-embodiment-artifacts.mjs)
- [scripts/generate-embodiment-registry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate-embodiment-registry.ts)
- [scripts/sync-embodiment-profiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts)
- [scripts/validate-embodiment-profiles.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs)
- [server/\_\_tests\_\_/council-persona-health.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/council-persona-health.test.ts)
- [server/\_\_tests\_\_/council-runner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/council-runner.test.ts)
- [server/council/councilRunner.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts)
- [server/council/personaHealth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/personaHealth.ts)
- [shared/embodiment/auditEmbodiments.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/auditEmbodiments.ts)
- [shared/embodiment/chat.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/chat.ts)
- [shared/embodiment/generated.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts)
- [shared/embodiment/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/index.ts)
- [shared/embodiment/types.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts)
- [supabase/migrations/20260518000000\_backfill\_embodiment\_profile\_history.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518000000_backfill_embodiment_profile_history.sql)
- [supabase/migrations/20260518001000\_backfill\_embodiment\_profile\_governance.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518001000_backfill_embodiment_profile_governance.sql)
- [tests/embodiment-orientation.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/tests/embodiment-orientation.test.ts)

</details>
The **Embodiment Studio** is the primary interface for managing Digital Intelligence (DI) personas. It facilitates the transition from "Natural Language Space" (where personas are defined by archetypes and narratives) to "Code Entity Space" (where they are governed by strict JSON schemas and runtime drift detection). This system ensures that every agent, from **Billy** to the **Art Teacher**, maintains behavioral continuity and architectural alignment.

#### 1. The Embodiment Studio UI

The `EmbodimentStudioPage` serves as the control plane for DI tuning and profile management. It allows founders to interact with the **Embodiment Registry** and perform high-level governance tasks.

##### Key Components

- **Tuning Knobs**: The UI exposes conceptual knobs for `warmth`, `directness`, and `playfulness` [client/src/pages/EmbodimentStudioPage.tsx28-31](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx#L28-L31) These map to the `communicationStyle` defined in the profile's `immutableCore` [shared/embodiment/types.ts81-86](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L81-L86)
- **EmbodimentChatPlane**: A specialized chat interface used to test the active embodiment in real-time [client/src/pages/EmbodimentStudioPage.tsx16-18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx#L16-L18)
- **Founder Studio (FOUNDER\_ONLY)**: A privileged mode enabled via `VITE_FOUNDER_STUDIO` [client/src/pages/EmbodimentStudioPage.tsx23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx#L23-L23) that allows direct JSON uploads and manual overrides of the **Founder Roster** [client/src/pages/EmbodimentStudioPage.tsx132-176](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx#L132-L176)
- **Drift Detection**: The system uses `driftSignals` and an `identityAnchor` (typically pointing to `immutableCore.foundationalTruth`) to monitor if an LLM's output is diverging from the defined persona [shared/embodiment/types.ts117-131](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L117-L131)

##### Sources:

- [client/src/pages/EmbodimentStudioPage.tsx1-41](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx#L1-L41)
- [shared/embodiment/types.ts81-131](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L81-L131)

---

#### 2. Profile Governance & Lifecycle

Every DI persona is defined by a `.embodiment.json` file. These files are processed into a strictly typed registry that the runtime uses to shape prompts and visual signatures.

##### Data Flow: From JSON to Runtime

The following diagram illustrates how a natural language description becomes a functional code entity.

**Diagram: Profile Compilation & Registry Generation**

```mermaid
flowchart TD
  A["Natural Language Profile (.embodiment.json)"]
  B["validate-embodiment-profiles.mjs"]
  C["build-embodiment-artifacts.mjs"]
  D["shared/embodiment/generated.ts (EMBODIMENT_REGISTRY)"]
  E["EmbodimentStudioPage.tsx"]
  F["councilRunner.ts"]
  A -->|validated by| B
  B -->|compiled by| C
  C -->|generates| D
  D -->|consumed by| E
  D -->|consumed by| F
```

**Sources:**

- [scripts/validate-embodiment-profiles.mjs1-160](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L1-L160)
- [scripts/build-embodiment-artifacts.mjs1-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/build-embodiment-artifacts.mjs#L1-L10)
- [shared/embodiment/generated.ts1-21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts#L1-L21)

##### Mutation Proposals & Review

Changes to profiles are governed by `MutationClass` types:

- **IMMUTABLE**: Core truths that cannot be changed [shared/embodiment/types.ts3](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L3-L3)
- **REVIEW\_GATED**: Changes that require a manual audit [shared/embodiment/types.ts4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L4-L4)
- **EVIDENCE\_PROMOTABLE**: Living memories that can be promoted to the core based on interaction data [shared/embodiment/types.ts5](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L5-L5)

The `embodiment_review_log` (managed via Supabase migrations) tracks these mutations to prevent unauthorized personality drift [supabase/migrations/20260518001000\_backfill\_embodiment\_profile\_governance.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518001000_backfill_embodiment_profile_governance.sql)

---

#### 3. The Embodiment Compiler Panel

Located within the **Agent Trainer**, the `EmbodimentCompilerPanel` is a specialized tool for auditing and regenerating profile artifacts.

##### Operational Modes

| Mode | Purpose | Implementation |
| --- | --- | --- |
| `compile_profile` | Maps profile deltas to implementation plans | [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx29-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx#L29-L33) |
| `generate_artifact` | Focuses on derived outputs and sync checklists | [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx34-38](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx#L34-L38) |
| `audit_drift` | Calls out missing fields and stale room bindings | [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx39-43](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx#L39-L43) |

##### Code Entity Integration

The panel utilizes `getEmbodimentGovernanceSummary` and `getEmbodimentUIPresence` to extract runtime-ready metadata from the raw profile object [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx13-16](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx#L13-L16) It builds a "Profile Brief" that summarizes the `archetype`, `voiceTone`, and `linguisticPatterns` for the human trainer [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx72-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx#L72-L120)

##### Sources:

- [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx1-125](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx#L1-L125)
- [shared/embodiment/index.ts75-129](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/index.ts#L75-L129)

---

#### 4. Council Execution & Health Tracking

The `runCouncil` function acts as the "air-traffic-controller" for DI embodiments during multi-agent sessions (Tribunal mode).

##### Sequential Staggered Dispatch

To prevent context-window collisions, the `councilRunner.ts` dispatches jobs with a `COUNCIL_DISPATCH_STAGGER_MS` delay (default 150ms) [server/council/councilRunner.ts85-88](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts#L85-L88)

##### Hardened-Seed Retry Logic

If a persona trips a `fallbackGuard` (e.g., producing generic AI-assistant language), the runner uses a `PersonaHealthTracker` to decide if a retry is necessary [server/council/councilRunner.ts90-93](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts#L90-L93) If degraded, it calls `buildHardenedCouncilJob()`, which re-injects the `immutableCore` with amplified directives to "force" the DI back into its defined personality [server/council/councilRunner.ts94-98](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts#L94-L98)

**Diagram: Council Health & Recovery Loop**

```mermaid
flowchart TD
  A["runCouncil() Dispatch"]
  B["callLlm(job)"]
  C["tripsFallbackGuard?"]
  D["recordSuccess()"]
  E["recordFailure()"]
  F["thresholdCrossed?"]
  G["buildHardenedCouncilJob()"]
  H["Retry LLM Call"]
  I["Return Flagged Response"]
  J["Retry Success?"]
  K["Baked with retried=true"]
  L["Flagged with hardenedSeedUsed=true"]
  A --> B
  B --> C
  C -->|No| D
  C -->|Yes| E
  E --> F
  F -->|Yes| G
  G --> H
  F -->|No| I
  H --> J
  J -->|Yes| K
  J -->|No| L
```

##### Sources:

- [server/council/councilRunner.ts79-104](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts#L79-L104)
- [server/council/councilRunner.ts159-225](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts#L159-L225)
- [shared/embodiment/chat.ts111-112](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/chat.ts#L111-L112)

---

#### 5. Technical Data Structures

##### The `EmbodimentProfile` Contract

Profiles are structured to separate immutable traits from living data:

- **`immutableCore`**: The "soul" of the DI. Includes `archetype`, `foundationalTruth`, and `metaphorFamily` [shared/embodiment/types.ts264-274](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L264-L274)
- **`heartbeat`**: The runtime signature. Includes `visualSignature` (orb styles like `ember-core`) and `chatSignature` (response rhythms) [shared/embodiment/types.ts250-254](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L250-L254)
- **`livingMemory`**: An array of `EmbodimentMemoryEntry` objects that store episodic and constitutive memories [shared/embodiment/types.ts93-99](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L93-L99)

##### Sync & Validation Scripts

- **`sync-embodiment-profiles.ts`**: Upserts local JSON files into the Supabase `consciousness_profiles` table, ensuring the database reflects the repository's source of truth [scripts/sync-embodiment-profiles.ts1-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L1-L78)
- **`validate-embodiment-profiles.mjs`**: Enforces schema requirements, such as ensuring `verbosity`, `directness`, `humor`, and `formality` are present in the `communicationStyle` [scripts/validate-embodiment-profiles.mjs99-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L99-L105)

##### Sources:

- [shared/embodiment/types.ts1-274](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L1-L274)
- [scripts/sync-embodiment-profiles.ts60-111](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts#L60-L111)
- [scripts/validate-embodiment-profiles.mjs54-160](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs#L54-L160)

---

## Volume: Agent Trainer & Governance Pipeline

### Agent Trainer Control Plane

> Source MHT: `Agent Trainer Control Plane _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5-agent-trainer-control-plane  \
Mermaid diagrams restored: 1

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/council/run.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/council/run.ts)
- [api/trainer/study-sources/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/index.ts)
- [api/trainer/study-sources/recommendations.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts)
- [bugwalks/BugWalkBoard.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/bugwalks/BugWalkBoard.md?plain=1)
- [client/src/features/agent-trainer/AgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx)
- [client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx)
- [client/src/features/agent-trainer/hooks/useTrainingRun.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts)
- [client/src/features/agent-trainer/lib/trainerApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts)
- [client/src/hooks/useSession.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSession.ts)
- [client/src/tests/agent-trainer-api.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/agent-trainer-api.test.ts)
- [server/\_\_tests\_\_/council-persona-health.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/council-persona-health.test.ts)
- [server/\_\_tests\_\_/council-runner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/council-runner.test.ts)
- [server/agent-trainer/persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts)
- [server/agent-trainer/study-sources.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/study-sources.ts)
- [server/agent-trainer/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/supabaseAdmin.ts)
- [server/council/councilRunner.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/councilRunner.ts)
- [server/council/personaHealth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/council/personaHealth.ts)
- [server/trainer/experiment-repository.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/trainer/experiment-repository.ts)
- [shared/agent-trainer/schemas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts)
- [shared/embodiment/auditEmbodiments.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/auditEmbodiments.ts)
- [shared/embodiment/chat.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/chat.ts)
- [shared/embodiment/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/index.ts)
- [shared/embodiment/types.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts)

</details>
The **Agent Trainer Control Plane** is the central orchestration system for authoring, evaluating, and governing Digital Intelligence (DI) embodiments within GestaltView. It provides a structured environment for "training" agents—a process of refining their behavioral specifications, linguistic patterns, and cognitive boundaries through a multi-stage pipeline.

The system bridges high-level intent (Natural Language Space) with formal execution (Code Entity Space) by transforming a `TrainingBrief` into a validated, deployable `.embodiment.json` profile.

#### System Architecture

The Control Plane consists of a React-based frontend, a worker-driven execution loop, and a persistence layer backed by Supabase.

##### Entity Relationship: Intent to Implementation

The following diagram illustrates how user-defined training goals are processed by specific code entities to produce a governed embodiment.

**Training Pipeline Data Flow**

```mermaid
flowchart TD
  A["TrainingBrief (Goal/Behaviors)"]
  B["Study Sources (PDF/MD/Memories)"]
  C["AgentTrainerPage.tsx"]
  D["useTrainingRun.ts"]
  E["TrainerApi.ts"]
  F["persistence.ts (Supabase)"]
  G["study-sources.ts (Vector Search)"]
  H["main.ts (Worker Loop)"]
  I[".embodiment.json"]
  J["schemas.ts (Zod Contracts)"]
  A --> C
  B --> G
  C --> D
  D --> E
  E -->|POST /api/trainer/runs| F
  F --> H
  H -->|Stage: Author| I
  I -->|Validated By| J
```

Sources: [client/src/features/agent-trainer/AgentTrainerPage.tsx113-145](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L113-L145) [server/agent-trainer/persistence.ts69-90](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L69-L90) [shared/agent-trainer/schemas.ts93-116](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L93-L116)

#### Core Components

##### 1. Training Run Lifecycle & Pipeline Stages

The training process is divided into eight discrete stages, ranging from `normalize` (parsing the brief) to `package` (finalizing the artifact). Each stage has a specific weight used to calculate the overall progress of a `TrainingRun`.

- **Status Management:** Runs transition through states: `queued`, `running`, `awaiting_review`, `completed`, `failed`, or `cancelled`.
- **Worker Loop:** A dedicated worker (`worker/trainer/main.ts`) claims jobs from the `trainer_jobs` table and executes the pipeline logic.

For details, see [Training Run Lifecycle & Pipeline Stages](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5.1-training-run-lifecycle-and-pipeline-stages).
Sources: [client/src/features/agent-trainer/AgentTrainerPage.tsx155-164](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L155-L164) [shared/agent-trainer/schemas.ts194-212](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L194-L212)

##### 2. Trainer API & Persistence

The `TrainerApi` class handles communication between the frontend and the backend. It includes robust features like:

- **Circuit Breaking:** Automatically opens an auth circuit after 401/403 failures to prevent request flooding [client/src/features/agent-trainer/lib/trainerApi.ts238-250](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L238-L250)
- **Multi-Origin Retry:** Attempts to reach the API across multiple configured origins (e.g., Vercel, local, or proxy) if the primary request fails [client/src/features/agent-trainer/lib/trainerApi.ts204-224](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L204-L224)
- **Persistence:** The `server/agent-trainer/persistence.ts` module maps application types to Supabase tables such as `training_runs`, `training_steps`, and `eval_results`.

For details, see [Trainer API, Persistence & Study Sources](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5.2-trainer-api-persistence-and-study-sources).
Sources: [client/src/features/agent-trainer/lib/trainerApi.ts61-112](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L61-L112) [server/agent-trainer/persistence.ts1-42](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L1-L42)

##### 3. Study Sources & Recommendations

The system uses **Vector Search** to ground agent training in existing knowledge.

- **Search:** The `trainer_search_study_sources` RPC performs cosine similarity searches across 768-dim embeddings in the `knowledge_fragments` table.
- **Recommendations:** The `/api/trainer/study-sources/recommendations` endpoint suggests relevant documents based on the `TrainingBrief` goal and target behaviors [api/trainer/study-sources/recommendations.ts88-109](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts#L88-L109)

Sources: [server/agent-trainer/study-sources.ts68-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/study-sources.ts#L68-L78) [api/trainer/study-sources/recommendations.ts1-40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts#L1-L40)

##### 4. Hyperagent Extensions & Governance

Modern DI embodiments utilize the **SPEC-2 Hyperagent** model, which extends basic personas with:

- **Connectors & Skills:** Integration with external systems (GitHub, Supabase, Webhooks) defined in `TrainerConnector` and `TrainerSkill` [client/src/features/agent-trainer/AgentTrainerPage.tsx168-182](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L168-L182)
- **Policy Flags:** Governance triggers like `persona-risk`, `scope-creep`, and `claims-risk` that require human review before deployment.
- **Readiness Score:** A calculated metric (0-100) determining if an embodiment is stable enough for production use.

For details, see [Hyperagent Extensions & Governance](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5.3-hyperagent-extensions-and-governance).
Sources: [client/src/features/agent-trainer/AgentTrainerPage.tsx45-56](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L45-L56) [shared/embodiment/types.ts65-80](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L65-L80)

#### Key Data Models

| Model | Code Reference | Description |
| --- | --- | --- |
| `TrainingBrief` | `shared/agent-trainer/schemas.ts` | The input specification (goal, behaviors, study focus). |
| `TrainingRunDetail` | `shared/agent-trainer/schemas.ts` | The live state of an execution, including steps and eval results. |
| `EmbodimentProfile` | `shared/embodiment/types.ts` | The final output: immutable core, heartbeat, and character study. |
| `TrainerJob` | `server/agent-trainer/persistence.ts` | The queue entry for the worker loop. |

Sources: [shared/agent-trainer/schemas.ts93-116](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L93-L116) [shared/embodiment/types.ts264-280](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/types.ts#L264-L280) [server/agent-trainer/persistence.ts142-157](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L142-L157)

#### Summary of Sub-Pages

- [Training Run Lifecycle & Pipeline Stages](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5.1-training-run-lifecycle-and-pipeline-stages) — Technical deep dive into the 8-stage execution engine.
- [Trainer API, Persistence & Study Sources](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5.2-trainer-api-persistence-and-study-sources) — Documentation of the networking, retry logic, and RAG-based study system.
- [Hyperagent Extensions & Governance](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5.3-hyperagent-extensions-and-governance) — Details on SPEC-2 capabilities and the human-in-the-loop review process.

---

### Training Run Lifecycle & Pipeline Stages

> Source MHT: `Training Run Lifecycle & Pipeline Stages _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5.1-training-run-lifecycle-and-pipeline-stages  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.agents/skills/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/CurrentState.md?plain=1)
- [.agents/skills/INDEX.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/INDEX.md?plain=1)
- [.agents/skills/agents/AGENTS.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/agents/AGENTS.md?plain=1)
- [.agents/skills/gestaltview-blackboard-room/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/gestaltview-blackboard-room/SKILL.md?plain=1)
- [.agents/skills/manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/manifest.json)
- [api/\_\_tests\_\_/dashboard.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/dashboard.test.ts)
- [api/\_\_tests\_\_/lib.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/lib.test.ts)
- [api/session/dashboard.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/session/dashboard.ts)
- [api/trainer/\_helpers.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/_helpers.ts)
- [api/trainer/study-sources/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/index.ts)
- [api/trainer/study-sources/recommendations.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts)
- [bugwalks/BugWalkBoard.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/bugwalks/BugWalkBoard.md?plain=1)
- [client/src/features/agent-trainer/AgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx)
- [client/src/features/agent-trainer/hooks/useTrainingRun.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts)
- [client/src/features/agent-trainer/lib/trainerApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts)
- [client/src/hooks/useSession.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSession.ts)
- [client/src/tests/agent-trainer-api.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/agent-trainer-api.test.ts)
- [gestaltview\_supabase\_recreation\_package/canonical\_migrations/20260330115505\_trainer\_security\_hardening.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gestaltview_supabase_recreation_package/canonical_migrations/20260330115505_trainer_security_hardening.sql)
- [gestaltview\_supabase\_recreation\_package/canonical\_migrations/20260330120000\_trainer\_core.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gestaltview_supabase_recreation_package/canonical_migrations/20260330120000_trainer_core.sql)
- [gestaltview\_supabase\_recreation\_package/db\_object\_inventory.csv](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gestaltview_supabase_recreation_package/db_object_inventory.csv)
- [gestaltview\_supabase\_recreation\_package/db\_object\_inventory.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gestaltview_supabase_recreation_package/db_object_inventory.md?plain=1)
- [server/\_\_tests\_\_/trainer-hyperagent-migration.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/__tests__/trainer-hyperagent-migration.test.ts)
- [server/agent-trainer/persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts)
- [server/agent-trainer/study-sources.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/study-sources.ts)
- [server/agent-trainer/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/supabaseAdmin.ts)
- [server/trainer/experiment-repository.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/trainer/experiment-repository.ts)
- [shared/agent-trainer/schemas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts)
- [supabase/migrations/20260330115505\_trainer\_security\_hardening.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260330115505_trainer_security_hardening.sql)
- [supabase/migrations/20260330120000\_trainer\_core.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260330120000_trainer_core.sql)
- [supabase/migrations/20260427100000\_trainer\_hyperagent\_integration.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260427100000_trainer_hyperagent_integration.sql)
- [supabase\_start\_issues.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase_start_issues.md?plain=1)

</details>
This page documents the lifecycle of a Digital Intelligence (DI) training run, from the initial **TrainingBrief** through the eight-stage synthesis pipeline, ending in a packaged embodiment artifact. The system is designed to transform high-level goals and study sources into deterministic, retrieval-grounded agent behaviors.

#### Overview of the Training Lifecycle

A training run is managed by the `AgentTrainerPage` and executed by a background worker loop. It transitions through a series of statuses and stages, persisting state in Supabase via a dedicated persistence layer.

##### Run Statuses

A `TrainingRun` (or its associated `TrainerJob`) can exist in the following states:

- **`queued`**: The run is created and waiting for an available worker to claim the job [client/src/features/agent-trainer/AgentTrainerPage.tsx102](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L102-L102)
- **`running`**: A worker has leased the job and is actively executing pipeline stages [client/src/features/agent-trainer/AgentTrainerPage.tsx103](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L103-L103)
- **`awaiting_review`**: The pipeline has completed, but requires human intervention (Approval/Rejection) before deployment [client/src/features/agent-trainer/AgentTrainerPage.tsx104](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L104-L104)
- **`completed` / `done`**: The run finished successfully and the artifact is ready [client/src/features/agent-trainer/AgentTrainerPage.tsx105-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L105-L110)
- **`failed`**: An unrecoverable error occurred during execution [client/src/features/agent-trainer/AgentTrainerPage.tsx106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L106-L106)
- **`cancelled`**: The run was manually terminated by an administrator [client/src/features/agent-trainer/AgentTrainerPage.tsx107](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L107-L107)

##### The Execution Loop

The worker/trainer loop relies on the `TrainerApi` to poll for `TrainerQueueHealth` and claim jobs via the `public.claim_trainer_job` RPC [client/src/features/agent-trainer/lib/trainerApi.ts15-52](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L15-L52) [server/agent-trainer/persistence.ts142-157](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L142-L157)

**Sources:** [client/src/features/agent-trainer/AgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx) [server/agent-trainer/persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts) [client/src/features/agent-trainer/lib/trainerApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts)

---

#### The Eight-Stage Pipeline

The core of the training process is a sequential pipeline defined by `TrainingStageSchema` [shared/agent-trainer/schemas.ts203-212](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L203-L212) Each stage contributes to the final progress calculation based on defined `STAGE_WEIGHTS` [client/src/features/agent-trainer/AgentTrainerPage.tsx155-164](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L155-L164)

##### Pipeline Stages and Weights

| Stage | Weight | Description |
| --- | --- | --- |
| **Normalize** | 5% | Validates the `TrainingBrief` and resolves embodiment slugs. |
| **Curriculum** | 10% | Generates competencies, constraints, and evaluation dimensions. |
| **Scenario Expand** | 15% | Generates or retrieves test scenarios for the agent. |
| **Author** | 25% | Synthesizes the core `AgentSpec` and system prompts. |
| **Evaluate** | 25% | Runs the generated agent against the scenarios using a judge model. |
| **Critique** | 12% | Analyzes evaluation failures and suggests revision targets. |
| **Safety** | 8% | Performs a policy-based safety review for risks or distortions. |
| **Package** | 10% | Compiles the final Markdown artifact and checksums the version. |

##### Data Flow: Brief to Artifact

The pipeline starts with a `TrainingBrief` [shared/agent-trainer/schemas.ts93-116](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L93-L116) which contains the agent's goal, target behaviors, and study sources. As it progresses, it populates a `TrainingRunDetail` object containing steps, evaluation results, and artifacts [shared/agent-trainer/schemas.ts250-280](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L250-L280)

**Sources:** [shared/agent-trainer/schemas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts) [client/src/features/agent-trainer/AgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx)

---

#### Technical Implementation & Entity Mapping

The system bridges Natural Language goals to Code Entities through the `persistence.ts` layer and the `TrainerApi`.

##### Training Execution Diagram

This diagram shows how the UI interacts with the backend persistence and the worker loop.

```mermaid
flowchart TD
  A["AgentTrainerPage.tsx"]
  B["useTrainingRun.ts"]
  C["TrainerApi.ts"]
  D["api/trainer/index.ts"]
  E["server/agent-trainer/persistence.ts"]
  F["public.training_runs"]
  G["public.trainer_jobs"]
  H["Worker Loop"]
  I["Normalize"]
  J["Author"]
  K["Evaluate"]
  A -->|submitTrainingRun()| B
  B -->|POST /api/trainer/runs| C
  C -->|execute| D
  D -->|upsert| E
  E -->|INSERT| F
  E -->|INSERT| G
  H -->|RPC: claim_trainer_job| G
  H -->|Stage Loop| I
  I --> J
  J --> K
  K -->|Save Result| E
```

**Sources:** [client/src/features/agent-trainer/AgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx) [server/agent-trainer/persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts) [client/src/features/agent-trainer/lib/trainerApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts) [client/src/features/agent-trainer/hooks/useTrainingRun.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts)

##### Study Source Recommendation Engine

Before a run begins, the `recommendations.ts` endpoint uses vector search to find relevant context.

```mermaid
flowchart TD
  A["TrainingBrief (Brief)"]
  B["studyFocus (String)"]
  C["api/trainer/study-sources/recommendations.ts"]
  D["recommendTrainerStudySources()"]
  E["trainer_search_study_sources (RPC)"]
  F["knowledge_fragments (Vector)"]
  G["LOCAL_REFERENCE_BUNDLES"]
  H["TrainerStudySourceRecommendation"]
  A --> C
  B --> C
  C --> D
  D --> E
  E --> F
  D --> G
  D --> H
```

**Sources:** [api/trainer/study-sources/recommendations.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts) [server/agent-trainer/study-sources.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/study-sources.ts)

---

#### Data Structures & Constraints

##### TrainingBrief Schema

The `TrainingBriefSchema` defines the input for a new run:

- `goal`: High-level objective [shared/agent-trainer/schemas.ts99](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L99-L99)
- `studySourceFiles`: Array of up to 24 files to ground the agent [shared/agent-trainer/schemas.ts103](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L103-L103)
- `maxCycles`: Iteration limit (1-10) [shared/agent-trainer/schemas.ts105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L105-L105)
- `routingPolicy`: Determines if the worker prefers local (Ollama) or remote (Groq/OpenAI) models [shared/agent-trainer/schemas.ts110-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L110-L115)

##### TrainingRunBlocker

A `TrainingRunBlocker` prevents execution if specific requirements aren't met:

- `reason`: A short string code (e.g., `missing_study_sources`) [client/src/features/agent-trainer/hooks/useTrainingRun.ts60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts#L60-L60)
- `detail`: Human-readable explanation [shared/agent-trainer/schemas.ts322-325](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L322-L325)

##### Error Handling & Circuit Breaking

The `TrainerApi` implements a circuit breaker for authentication. If a `401` or `403` error is encountered, the circuit opens for 60 seconds (`TRAINER_AUTH_FAILURE_COOLDOWN_MS`) to prevent spamming the auth provider [client/src/features/agent-trainer/lib/trainerApi.ts236-245](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L236-L245)

**Sources:** [shared/agent-trainer/schemas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts) [client/src/features/agent-trainer/lib/trainerApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts) [client/src/features/agent-trainer/hooks/useTrainingRun.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts)

---

#### Database Schema & Migrations

The trainer subsystem relies on several key tables in the `public` schema of Supabase:

1. **`training_runs`**: Stores the brief, status, and metadata [server/agent-trainer/persistence.ts69-90](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L69-L90)
2. **`trainer_jobs`**: The queue mechanism for workers [server/agent-trainer/persistence.ts142-157](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L142-L157)
3. **`trainer_job_events`**: Audit trail of worker actions [server/agent-trainer/persistence.ts170-180](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L170-L180)

##### Migration Hardening

The migration spine ensures that the `training_runs` table exists before the `trainer_run_summary` view is created to avoid `42P01` (relation does not exist) errors during fresh environment setup [supabase\_start\_issues.md7-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase_start_issues.md?plain=1#L7-L15) [.agents/skills/CurrentState.md5-11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/CurrentState.md?plain=1#L5-L11)

**Sources:** [server/agent-trainer/persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts) [supabase\_start\_issues.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase_start_issues.md?plain=1) [.agents/skills/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/CurrentState.md?plain=1)

---

### Trainer API, Persistence & Study Sources

> Source MHT: `Trainer API, Persistence & Study Sources _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5.2-trainer-api-persistence-and-study-sources  \
Mermaid diagrams restored: 1

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/keep-alive.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/keep-alive.test.ts)
- [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts)
- [api/health/supabase.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/health/supabase.ts)
- [api/keep-alive.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts)
- [api/stripe/checkout.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/stripe/checkout.ts)
- [api/trainer/packaging-candidates/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/trainer/packaging-candidates/%5Bid%5D.ts)
- [api/trainer/study-sources/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/index.ts)
- [api/trainer/study-sources/recommendations.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts)
- [api/voice/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts)
- [bugwalks/BugWalkBoard.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/bugwalks/BugWalkBoard.md?plain=1)
- [client/src/components/BillyGreeter.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx)
- [client/src/features/agent-trainer/AgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx)
- [client/src/features/agent-trainer/hooks/useTrainingRun.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts)
- [client/src/features/agent-trainer/lib/trainerApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts)
- [client/src/hooks/useSession.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSession.ts)
- [client/src/tests/agent-trainer-api.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/agent-trainer-api.test.ts)
- [docs/GIL\_Protocol.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/GIL_Protocol.md?plain=1)
- [gil/targeted-summarization-agent-trainer.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-agent-trainer.yml)
- [gil/targeted-summarization-core-docs.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-core-docs.yml)
- [gil/targeted-summarization-mixed.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-mixed.yml)
- [gil/targeted-summarization-runs.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-runs.yml)
- [scripts/gil\_protocol.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gil_protocol.py)
- [scripts/ingest\_corpus.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py)
- [scripts/synthesize\_corpus.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py)
- [scripts/targeted-summarization.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/targeted-summarization.sh)
- [scripts/temporal\_backfill.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/temporal_backfill.py)
- [server/agent-trainer/orchestrator.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/orchestrator.ts)
- [server/agent-trainer/persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts)
- [server/agent-trainer/study-sources.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/study-sources.ts)
- [server/agent-trainer/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/supabaseAdmin.ts)
- [server/trainer/experiment-repository.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/trainer/experiment-repository.ts)
- [shared/agent-trainer/schemas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts)
- [shared/billy/runtime.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/billy/runtime.ts)
- [supabase/migrations/20260413120000\_add\_temporal\_metadata\_to\_corpus\_tables.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260413120000_add_temporal_metadata_to_corpus_tables.sql)

</details>
The Agent Trainer Control Plane relies on a robust backend architecture for managing long-running training jobs, persisting complex embodiment mutations, and retrieving relevant knowledge from the platform's vector corpus. This system bridges the gap between high-level user goals and the low-level execution of the Digital Intelligence (DI) pipeline.

#### TrainerApi & Client Orchestration

The `TrainerApi` class acts as the primary gateway for the frontend to interact with the training backend. It implements advanced resilience patterns, including multi-origin retry logic and circuit breaking to handle authentication failures gracefully.

##### Resilience & Connectivity

- **Multi-Origin Retry**: The API automatically attempts requests against a cascade of configured origins (e.g., `VITE_API_BASE_URL`, `VITE_API_PROXY_TARGET`) if a relative fetch fails [client/src/features/agent-trainer/lib/trainerApi.ts204-224](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L204-L224)
- **Auth Circuit Breaking**: To prevent repeated failed calls when credentials expire, the `trainerAuthFailureCircuit` opens for 60 seconds after a 401/403 error, returning a cached failure state until the cooldown expires [client/src/features/agent-trainer/lib/trainerApi.ts238-255](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L238-L255)
- **Diagnostics**: Every request failure captures a `TrainerRequestDiagnostics` object, including online status, visibility state, and request metadata to assist in debugging [client/src/features/agent-trainer/lib/trainerApi.ts75-85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L75-L85)

##### useTrainingRun Hook

The `useTrainingRun` hook provides the reactive state for the `AgentTrainerPage`. It manages:

- **Polling Logic**: Automatically polls for updates on runs with active statuses (`queued`, `running`, `awaiting_review`) [client/src/features/agent-trainer/hooks/useTrainingRun.ts68-69](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts#L68-L69)
- **State Management**: Synchronizes `agents`, `scenarioSets`, `personhood` snapshots, and `queueHealth` across the trainer UI [client/src/features/agent-trainer/hooks/useTrainingRun.ts117-130](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts#L117-L130)
- **Local Recommendations**: Generates study source recommendations locally from manual packets when the backend is unreachable [client/src/features/agent-trainer/hooks/useTrainingRun.ts208-216](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts#L208-L216)

**Sources:** [client/src/features/agent-trainer/lib/trainerApi.ts1-255](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L1-L255) [client/src/features/agent-trainer/hooks/useTrainingRun.ts1-220](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts#L1-L220)

---

#### Persistence & Supabase Mapping

The trainer persistence layer, located in `server/agent-trainer/persistence.ts`, maps the high-level `TrainingRunDetail` schemas to the underlying PostgreSQL tables. It is designed to handle the multi-stage nature of training runs while preventing N+1 query issues during status updates.

##### Key Data Structures

The persistence layer manages several critical entities:

- **AgentRow**: Tracks the base embodiment identity and its `active_version_id` [server/agent-trainer/persistence.ts45-53](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L45-L53)
- **TrainingRunRow**: Records the configuration for a specific run, including `execution_mode` (classic vs hyperagent) and the `resolved_graph` of dependencies [server/agent-trainer/persistence.ts69-90](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L69-L90)
- **TrainingStepRow**: Captures the granular execution of each stage (Normalize, Curriculum, etc.), including latency and estimated cost [server/agent-trainer/persistence.ts92-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L92-L106)

##### Error Handling

The persistence layer includes specialized logic to differentiate between **Missing Relations** (e.g., table not found due to pending migrations) and **Transient Errors** (e.g., 503 Service Unavailable or connection pool exhaustion) [server/agent-trainer/persistence.ts227-259](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L227-L259)

**Sources:** [server/agent-trainer/persistence.ts1-260](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L1-L260) [server/agent-trainer/supabaseAdmin.ts1-53](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/supabaseAdmin.ts#L1-L53)

---

#### Study Sources & Vector Search

The `study-sources.ts` module is responsible for grounding the training process in real data. It combines local reference bundles with global vector search results.

##### Vector Retrieval via RPC

The system uses the `trainer_search_study_sources` Supabase RPC to perform semantic search across the `knowledge_fragments` table. This allows the trainer to find documents relevant to the `TrainingBrief` goal and target behaviors.

##### Recommendations Endpoint

The `/api/trainer/study-sources/recommendations` endpoint provides a "last good snapshot" fallback mechanism. If the vector search times out or fails, the API returns the most recent successful recommendation set to keep the UI functional [api/trainer/study-sources/recommendations.ts88-109](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts#L88-L109)

##### Manual Study Packets

Users can bypass the global corpus by providing local packets. The system uses `buildManualStudyPacketManifest` to bundle these local references into a structured format that the `Orchestrator` can process during the `author` and `evaluate` stages [client/src/features/agent-trainer/AgentTrainerPage.tsx83-93](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L83-L93)

**Sources:** [api/trainer/study-sources/recommendations.ts1-151](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts#L1-L151) [server/agent-trainer/orchestrator.ts44-46](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/orchestrator.ts#L44-L46) [client/src/features/agent-trainer/AgentTrainerPage.tsx83-93](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L83-L93)

---

#### Data Flow: Training Request Lifecycle

The following diagram illustrates the flow from a user submitting a training request in the UI to the persistence and execution layers.

##### Training Execution Data Flow

```mermaid
flowchart TD
  A["AgentTrainerPage UI"]
  B["useTrainingRun Hook"]
  C["TrainerApi Class"]
  D["api/trainer/runs handler"]
  E["SubmitTrainingRunRequestSchema"]
  F["createTrainingRun (persistence.ts)"]
  G["Supabase: training_runs"]
  H["trainer/main.ts Loop"]
  I["Orchestrator.ts"]
  J["buildTrainerStudyPack (study-sources.ts)"]
  K["Supabase: trainer_search_study_sources"]
  L["finishTrainingStep (persistence.ts)"]
  M["Supabase: training_steps"]
  A -->|Submit| B
  B -->|POST /api/trainer/runs| C
  C -->|HTTP Request| D
  D -->|Validation| E
  E -->|Call| F
  F -->|Insert| G
  G -->|Worker Claim| H
  H -->|Execute| I
  I -->|Retrieve| J
  J -->|RPC| K
  I -->|Step Start/End| L
  L -->|Update| M
```

**Sources:** [client/src/features/agent-trainer/AgentTrainerPage.tsx155-164](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx#L155-L164) [server/agent-trainer/persistence.ts69-90](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L69-L90) [server/agent-trainer/orchestrator.ts28-44](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/orchestrator.ts#L28-L44)

---

#### System Mapping: Persistence to Code Entities

This diagram maps the logical persistence concepts to the specific TypeScript classes and database rows used in the implementation.

##### Persistence Mapping Diagram

**Sources:** [server/agent-trainer/persistence.ts69-90](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts#L69-L90) [client/src/features/agent-trainer/lib/trainerApi.ts26-58](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L26-L58) [shared/agent-trainer/schemas.ts18-38](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts#L18-L38)

---

#### Corpus Ingestion Pipeline

The training system is fueled by the ingestion pipeline, which processes repository files into the `knowledge_fragments` used for study recommendations.

| Script | Purpose | Key Logic |
| --- | --- | --- |
| `ingest_corpus.py` | Primary discovery & embedding | Extracts text from `.md`, `.pdf`, and `.ts` files; generates 768-dim embeddings [scripts/ingest\_corpus.py168-182](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L168-L182) |
| `synthesize_corpus.py` | Annotation & Loom generation | Generates summaries and `loom_annotation` per fragment via the LLM router [scripts/synthesize\_corpus.py7-11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L7-L11) |
| `gil_protocol.py` | Retrieval Governance | Ranks fragments based on the Gestalt Intelligence Layer (GIL) protocol [scripts/synthesize\_corpus.py43-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L43-L60) |

**Sources:** [scripts/ingest\_corpus.py1-182](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L1-L182) [scripts/synthesize\_corpus.py1-90](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L1-L90)

---

### Hyperagent Extensions & Governance

> Source MHT: `Hyperagent Extensions & Governance _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/5.3-hyperagent-extensions-and-governance  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.agents/Agents.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/Agents.md?plain=1)
- [.agents/skills/supabase-postgres-best-practices/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase-postgres-best-practices/SKILL.md?plain=1)
- [.agents/skills/supabase-postgres-best-practices/references/\_contributing.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase-postgres-best-practices/references/_contributing.md?plain=1)
- [.agents/skills/supabase-postgres-best-practices/references/security-rls-performance.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase-postgres-best-practices/references/security-rls-performance.md?plain=1)
- [.agents/skills/supabase/CHANGELOG.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase/CHANGELOG.md?plain=1)
- [.agents/skills/supabase/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase/SKILL.md?plain=1)
- [.agents/skills/supabase/assets/feedback-issue-template.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase/assets/feedback-issue-template.md?plain=1)
- [.agents/skills/supabase/references/skill-feedback.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase/references/skill-feedback.md?plain=1)
- [.codex/Agents.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/Agents.md?plain=1)
- [api/\_\_tests\_\_/embodiment.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/embodiment.test.ts)
- [api/trainer/study-sources/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/index.ts)
- [api/trainer/study-sources/recommendations.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts)
- [bugwalks/BugWalkBoard.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/bugwalks/BugWalkBoard.md?plain=1)
- [client/src/features/agent-trainer/AgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx)
- [client/src/features/agent-trainer/hooks/useTrainingRun.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts)
- [client/src/features/agent-trainer/lib/trainerApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts)
- [client/src/hooks/useSession.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSession.ts)
- [client/src/pages/HeirloomCompanionPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/HeirloomCompanionPage.tsx)
- [client/src/tests/agent-trainer-api.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/agent-trainer-api.test.ts)
- [embodiment\_profiles/embodiment\_profile\_content.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/embodiment_profile_content.py)
- [server/agent-trainer/persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts)
- [server/agent-trainer/personhood.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/personhood.ts)
- [server/agent-trainer/study-sources.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/study-sources.ts)
- [server/agent-trainer/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/supabaseAdmin.ts)
- [server/trainer/experiment-repository.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/trainer/experiment-repository.ts)
- [shared/agent-trainer/schemas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts)
- [supabase/agents.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/agents.sql)
- [supabase/migrations/20260411110000\_integrate\_agent\_identity\_governance.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260411110000_integrate_agent_identity_governance.sql)

</details>
The SPEC-2 Hyperagent model extends the standard Digital Intelligence (DI) framework by introducing external system capabilities, structured memory surfaces, and a multi-layered governance protocol. This system transitions Billy and other DI personas from passive conversationalists to active operators capable of executing plans, mutating their own embodiment profiles, and interacting with third-party connectors under strict policy constraints.

Sources: `client/src/features/agent-trainer/AgentTrainerPage.tsx:168-189`, `shared/agent-trainer/schemas.ts:93-116`

#### Hyperagent Architecture & Execution

Hyperagents operate in two distinct execution modes defined in the `TrainingRunRow` schema: `classic` (stateless, retrieval-grounded chat) and `hyperagent` (stateful, tool-augmented execution). The hyperagent mode utilizes a **Resolved Graph** to map intent to specific skills and connectors.

##### Core Components

| Component | Description | Code Entity |
| --- | --- | --- |
| **Connectors** | External system bridges (Supabase, GitHub, Webhooks). | `HyperagentConnector` |
| **Skills** | Discrete capabilities mapped to connectors (e.g., `Write`, `Grep`). | `HyperagentSkill` |
| **Memory Surfaces** | Persistent data layers where the agent stores long-term state. | `HyperagentMemorySurface` |
| **Mutation Proposals** | Requests to modify the agent's core `.embodiment.json` profile. | `EmbodimentMutationProposalRecord` |

##### System Data Flow (Natural Language to Code)

The following diagram illustrates how a user request flows through the Hyperagent execution layer, bridging the gap between natural language intent and the underlying skill/connector registry.

**Hyperagent Execution Pipeline**

```mermaid
flowchart TD
  UserIntent["'Update the project manifest'"]
  IntentClassifier["intentClassifier (Billy Runtime)"]
  Decision["Execution Mode?"]
  LLM["llmRouter.ts"]
  GraphResolver["resolved_graph (server/agent-trainer/persistence.ts)"]
  SkillSelection["listTrainerSkills (lib/trainerApi.ts)"]
  ConnectorCall["listTrainerConnectors (lib/trainerApi.ts)"]
  SupabaseConn["Supabase Connector (supabaseAdmin.ts)"]
  GitHubConn["GitHub Webhook"]
  AuditLog["recordEmbodimentReview (lib/embodimentPersistence.ts)"]
  UserIntent --> IntentClassifier
  IntentClassifier --> Decision
  Decision -->|classic| LLM
  Decision -->|hyperagent| GraphResolver
  GraphResolver --> SkillSelection
  SkillSelection --> ConnectorCall
  ConnectorCall --> SupabaseConn
  ConnectorCall --> GitHubConn
  SupabaseConn --> AuditLog
```

Sources: `client/src/features/agent-trainer/AgentTrainerPage.tsx:168-189`, `server/agent-trainer/persistence.ts:81-83`, `client/src/features/agent-trainer/lib/trainerApi.ts:40-42`

#### Governance & Policy Flags

To prevent autonomous drift, Hyperagents are governed by **Policy Flags**. These flags are evaluated during the `safety` stage of the Training Run Lifecycle.

##### Policy Flag Categories

- **Persona-Risk**: Detects deviations from the `immutableCore` defined in the embodiment profile.
- **Scope-Creep**: Identifies when an agent attempts to access connectors or memory surfaces outside its assigned `domain`.
- **Claims-Risk**: Monitors for unsupported claims or "hallucinated authority" as defined in the `antiGoals` of the `TrainingBrief`.

##### Mutation Proposals & Readiness Score

Before a Hyperagent's behavior changes can be deployed to production, they must pass a governance review:

1. **Mutation Proposal**: Generated when a training run suggests changes to `targetBehaviors` or `system_prompt`.
2. **Readiness Score**: A quantitative metric (0-5) stored in `EmbodimentReadinessScoreRecord` that aggregates evaluation results and safety findings.
3. **Review Decision**: An admin must explicitly call `recordEmbodimentReview` to promote a "candidate" version to "deployed".

Sources: `client/src/features/agent-trainer/AgentTrainerPage.tsx:46-56`, `shared/agent-trainer/schemas.ts:180-192`, `server/agent-trainer/persistence.ts:123-131`

#### Implementation Detail: Personhood Framework

The Personhood framework ensures that Hyperagents maintain identity continuity across mutations. This is managed via the `TrainerPersonhoodSnapshot`, which captures the state of an agent's "living memory" and "wound layer" at a specific point in time.

**Personhood Continuity Mapping**

```mermaid
flowchart TD
  Profile[".embodiment.json"]
  Snapshot["TrainerPersonhoodSnapshot"]
  AgentRow["AgentRow (agent_id, slug, title)"]
  VersionRow["AgentVersionRow (canonical_spec, checksum)"]
  Checksum["sha256 (checksum.js)"]
  Mutation["EmbodimentMutationProposal"]
  Profile --> AgentRow
  Snapshot --> VersionRow
  VersionRow -->|Validation| Checksum
  AgentRow -->|Governance| Mutation
```

Sources: `server/agent-trainer/persistence.ts:45-67`, `client/src/features/agent-trainer/lib/trainerApi.ts:14-15`, `server/agent-trainer/personhood.ts:1-10`

#### Trainer API & Connectors

The `TrainerApi` class provides the interface for the frontend to interact with Hyperagent extensions. Key methods include:

- `listTrainerConnectors()`: Retrieves active system integrations (e.g., Supabase, GitHub). [client/src/features/agent-trainer/lib/trainerApi.ts40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L40-L40)
- `listTrainerSkills()`: Returns the registry of available tool-sets. [client/src/features/agent-trainer/lib/trainerApi.ts41](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L41-L41)
- `listTrainerMemorySurfaces()`: Fetches available persistent storage contexts. [client/src/features/agent-trainer/lib/trainerApi.ts42](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts#L42-L42)

##### Persistence Layer

Hyperagent data is persisted in Supabase using a specialized schema defined in `server/agent-trainer/persistence.ts`. The `TrainingRunRow` includes fields for `execution_mode` and `resolved_graph`, allowing the system to reconstruct the exact tool-calling configuration used during a specific training session.

Sources: `server/agent-trainer/persistence.ts:69-90`, `client/src/features/agent-trainer/lib/trainerApi.ts:40-42`

#### Readiness Scoring Logic

The Readiness Score is calculated during the `evaluate` stage of the pipeline. It compares the `EvalResult` against the `qualityThreshold` defined in the `TrainingBrief`.

| Score | Status | Description |
| --- | --- | --- |
| **0-2** | `failed` | Significant safety findings or failure to meet target behaviors. |
| **3-4** | `awaiting_review` | Minor policy warnings; requires manual admin intervention. |
| **5** | `completed` | Clean safety report and all evaluation scenarios passed. |

Sources: `client/src/features/agent-trainer/AgentTrainerPage.tsx:101-111`, `shared/agent-trainer/schemas.ts:165-172`, `client/src/features/agent-trainer/AgentTrainerPage.tsx:155-164`

---

## Volume: Codex & Artifact Synthesis

### Codex & Artifact System

> Source MHT: `Codex & Artifact System _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6-codex-and-artifact-system  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [CODEX\_OUTSIDE\_IN\_TRANSLATION\_LAYER.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/CODEX_OUTSIDE_IN_TRANSLATION_LAYER.md?plain=1)
- [api/\_\_tests\_\_/codex-contracts.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-contracts.test.ts)
- [api/\_\_tests\_\_/codex-creation-corner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-creation-corner.test.ts)
- [api/\_\_tests\_\_/codex-export-runner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-export-runner.test.ts)
- [api/\_\_tests\_\_/codex-forge.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-forge.test.ts)
- [api/\_\_tests\_\_/profile-portrait-cadence.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-cadence.test.ts)
- [api/codex/\_persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts)
- [api/codex/artifacts/[artifactId]/drain-exports.ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/drain-exports.ts)
- [api/codex/forge.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/forge.ts)
- [api/creation-corner/synthesize.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts)
- [docs/Codex.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Codex.md?plain=1)
- [shared/codex/contracts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts)
- [shared/codex/creationCorner.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/creationCorner.ts)
- [shared/codex/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/index.ts)
- [shared/codex/renderers.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/renderers.ts)
- [shared/codex/router.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/router.ts)
- [supabase/codex\_artifact\_data\_fixes\_2026-06-17.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/codex_artifact_data_fixes_2026-06-17.sql)
- [supabase/migrations/20260618090000\_add\_portrait\_monthly\_cadence\_helper.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260618090000_add_portrait_monthly_cadence_helper.sql)

</details>
The **Codex** is the deterministic boundary between probabilistic AI generation and structured, user-facing artifacts. It transforms raw capture data from the **Blackboard Room** or **Creation Corner** into finalized, immutable objects called `CodexArtifacts`. These artifacts serve as the "compressed memory" of the platform, residing in the **External Scaffold** for long-term retrieval and discovery.

##### System Overview

The Codex system operates on a fundamental principle: **Generation is probabilistic; rendering is deterministic.** While the Gen Engine uses LLMs to synthesize content, the Codex enforces strict schemas and templates to ensure data integrity and a consistent aesthetic (the "Neural Aurora").

###### Artifact Lifecycle

1. **Capture**: Raw input (text, audio, files) is collected in the Blackboard Room.
2. **Synthesis (Forge)**: The `Gen Engine` processes raw data into a structured `CodexArtifact` contract [shared/codex/contracts.ts93-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L93-L110)
3. **Persistence**: Artifacts are stored in the `codex_artifacts` Supabase table with a `status` (queued, rendering, ready, archived) [api/codex/\_persistence.ts109-121](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts#L109-L121)
4. **Export (Drain)**: Background workers (the "drain") render the artifact into specific formats like HTML, PDF, or JSON [api/codex/artifacts/[artifactId]/drain-exports.ts:46-59](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6-codex-and-artifact-system).
5. **Display**: The frontend `ArtifactExpandView` renders the artifact using deterministic templates [shared/codex/renderers.ts12-42](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/renderers.ts#L12-L42)

##### Codex-to-Code Mapping

The following diagram bridges the conceptual "Natural Language Space" of user intent to the specific "Code Entity Space" that handles the data.

**Artifact Synthesis & Persistence Flow**

```mermaid
flowchart TD
  A["'Summarize this session'"]
  B["'Create a Blueprint'"]
  C["Creation Corner API /api/creation-corner/synthesize"]
  D["Gen Engine createArtifact()"]
  E["Codex Forge /api/codex/forge"]
  F["codex_artifacts table"]
  A --> C
  B --> C
  C --> D
  D --> E
  E --> F
```

Sources: [api/creation-corner/synthesize.ts43-153](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts#L43-L153) [api/codex/forge.ts1-20](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/forge.ts#L1-L20) [api/codex/\_persistence.ts117-121](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts#L117-L121)

##### The Gen Engine & The Forge

The **Gen Engine** is the orchestration layer that calls LLMs to generate content. Once generated, the content is "forged" into a `CodexArtifact`. This process involves:

- **Validation**: Ensuring the body matches the specific `ArtifactKind` (e.g., `session_recap`, `mind_map`) [shared/codex/contracts.ts8-18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L8-L18)
- **Provenance**: Recording the source IDs and transformation steps to maintain a chain of custody [shared/codex/contracts.ts29-35](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L29-L35)
- **Slugification**: Creating a URL-friendly unique identifier [shared/codex/creationCorner.ts92-101](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/creationCorner.ts#L92-L101)

For details, see [Codex Data Model & Contracts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6.1-codex-data-model-and-contracts) and [Gen Engine & Artifact Synthesis](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6.2-gen-engine-and-artifact-synthesis).

##### Export Pipeline & Knowledge Loom

The Codex doesn't just store data; it prepares it for external use. The **Export Pipeline** (managed via `codex_jobs`) handles the conversion of JSON artifact bodies into human-readable formats.

**Export Job Lifecycle**

```mermaid
flowchart TD
  P["pending"]
  R["running"]
  RD["ready"]
  F["failed"]
  ECJ["enqueueCodexExportJob"]
  RCEJ["runCodexExportJob"]
  DE["drain-exports.ts"]
  ECJ -->|Creates Job| P
  DE -->|Triggers| RCEJ
  RCEJ -->|Processing| R
  R -->|Success| RD
  R -->|Error| F
```

Sources: [api/codex/\_persistence.ts166-190](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts#L166-L190) [api/codex/artifacts/[artifactId]/drain-exports.ts:8-26](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6-codex-and-artifact-system), [shared/codex/manifest.ts1-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/manifest.ts#L1-L10)

The **Knowledge Loom** refers to the system's ability to discover connections between these artifacts over time, moving them from the "chaos" of the Dynamic Inner World to the "structure" of the External Scaffold [CODEX\_OUTSIDE\_IN\_TRANSLATION\_LAYER.md93-112](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/CODEX_OUTSIDE_IN_TRANSLATION_LAYER.md?plain=1#L93-L112)

##### Rendering & Aesthetics

All Codex artifacts share a unified visual language known as **Neural Aurora**. This is achieved through a shared template system that uses a deterministic shell to wrap artifact content.

- **Registry**: The `TEMPLATE_REGISTRY` maps artifact kinds to specific versions (e.g., `session-recap-v1`) [shared/codex/router.ts3-13](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/router.ts#L3-L13)
- **Exporters**: The `EXPORTER_REGISTRY` defines which formats (PNG, PDF, MP3) are valid for a given artifact [shared/codex/router.ts15-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/router.ts#L15-L25)

For details, see [Codex HTML Templates & Export](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6.3-codex-html-templates-and-export).

##### Child Pages

| Page | Description |
| --- | --- |
| **[Codex Data Model & Contracts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6.1-codex-data-model-and-contracts)** | Deep dive into Zod schemas, the `ArtifactType` enum, and the Supabase persistence layer. |
| **[Gen Engine & Artifact Synthesis](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6.2-gen-engine-and-artifact-synthesis)** | Technical details on the Forge process, orchestration decisions, and the synthesis pipeline. |
| **[Codex HTML Templates & Export](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6.3-codex-html-templates-and-export)** | Documentation on the rendering shell, CSS aesthetics, and the background export workers. |

Sources: [docs/Codex.md1-23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Codex.md?plain=1#L1-L23) [shared/codex/index.ts1-7](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/index.ts#L1-L7) [CODEX\_OUTSIDE\_IN\_TRANSLATION\_LAYER.md12-21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/CODEX_OUTSIDE_IN_TRANSLATION_LAYER.md?plain=1#L12-L21)

---

### Codex Data Model & Contracts

> Source MHT: `Codex Data Model & Contracts _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6.1-codex-data-model-and-contracts  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/codex-bridge.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-bridge.test.ts)
- [api/\_\_tests\_\_/codex-contracts.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-contracts.test.ts)
- [api/\_\_tests\_\_/codex-creation-corner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-creation-corner.test.ts)
- [api/\_\_tests\_\_/codex-export-runner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-export-runner.test.ts)
- [api/\_\_tests\_\_/codex-forge.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-forge.test.ts)
- [api/\_\_tests\_\_/profile-portrait-cadence.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-cadence.test.ts)
- [api/\_lib/codexBridge.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts)
- [api/codex/\_persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts)
- [api/codex/artifacts/[artifactId]/drain-exports.ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/drain-exports.ts)
- [api/codex/forge.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/forge.ts)
- [api/creation-corner/synthesize.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts)
- [api/gen-engine/artifact.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifact.ts)
- [api/gen-engine/artifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts)
- [api/gen-engine/export.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/export.ts)
- [client/src/components/ArtifactExportBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactExportBar.tsx)
- [client/src/components/ArtifactRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactRenderer.tsx)
- [client/src/components/ProvenanceDisclosure.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ProvenanceDisclosure.tsx)
- [client/src/lib/spotify.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/spotify.ts)
- [docs/CODEX\_ALIGNMENT\_SPEC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CODEX_ALIGNMENT_SPEC.md?plain=1)
- [docs/Codex.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Codex.md?plain=1)
- [docs/OPERATIONS.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/OPERATIONS.md?plain=1)
- [server/lib/codexBridge.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/lib/codexBridge.ts)
- [shared/codex/contracts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts)
- [shared/codex/creationCorner.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/creationCorner.ts)
- [shared/codex/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/index.ts)
- [shared/codex/renderers.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/renderers.ts)
- [shared/codex/router.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/router.ts)
- [supabase/codex\_artifact\_data\_fixes\_2026-06-17.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/codex_artifact_data_fixes_2026-06-17.sql)
- [supabase/migrations/20260618090000\_add\_portrait\_monthly\_cadence\_helper.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260618090000_add_portrait_monthly_cadence_helper.sql)

</details>
The Codex system serves as the definitive persistence and contract layer for all generated intelligence artifacts within GestaltView. It bridges the transient output of the **Gen Engine** into structured, validated, and exportable entities known as `CodexArtifacts`.

#### 1. The CodexArtifact Schema

All artifacts in the Codex must adhere to the `codex.v1` contract defined in `shared/codex/contracts.ts`. This schema uses **Zod** for runtime validation and ensures that model-generated content is sanitized and structured before being persisted or rendered [shared/codex/contracts.ts93-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L93-L110)

##### Core Envelope

Every artifact contains a base envelope for metadata and provenance:

- **`id`**: A unique UUID [shared/codex/contracts.ts94](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L94-L94)
- **`kind`**: Defined by the `ArtifactKind` enum (e.g., `session_recap`, `blueprint`) [shared/codex/contracts.ts8-18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L8-L18)
- **`securityClass`**: Visibility level (`private`, `workspace`, or `public`) [shared/codex/contracts.ts21-22](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L21-L22)
- **`provenance`**: An array of `ProvenanceEdge` objects tracking the source capture IDs, hashes, and transformation types (e.g., `summarize`, `synthesize`) [shared/codex/contracts.ts29-35](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L29-L35)
- **`exports`**: A manifest of available file formats and their storage paths [shared/codex/contracts.ts39-47](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L39-L47)

##### Artifact Types (`ArtifactKind`)

| Kind | Purpose |
| --- | --- |
| `session_recap` | Structured summary of a chat or capture session [shared/codex/contracts.ts114-125](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L114-L125) |
| `blueprint` | Technical or philosophical structural mapping [shared/codex/contracts.ts127-132](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L127-L132) |
| `report_document` | Long-form markdown-based reports [shared/codex/contracts.ts134-138](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L134-L138) |
| `mind_map` | Graph-based relationship data [shared/codex/contracts.ts140-153](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L140-L153) |
| `share_card` | High-impact visual summaries for social sharing [shared/codex/contracts.ts155-159](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L155-L159) |
| `profile_portrait` | Deep DI analysis of a user's cognitive style [shared/codex/contracts.ts17](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L17-L17) |

##### Block-Based Body Model

To ensure deterministic rendering and prevent unsafe HTML injection, artifact bodies are composed of discrete blocks [shared/codex/contracts.ts53-89](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L53-L89):

- **MarkdownBlock**: Sanitized markdown strings [shared/codex/contracts.ts53-57](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L53-L57)
- **CalloutBlock**: Toned alerts (info, warning, etc.) [shared/codex/contracts.ts59-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L59-L65)
- **TimelineBlock**: Chronological event lists [shared/codex/contracts.ts67-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L67-L75)

**Sources:** [shared/codex/contracts.ts1-205](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/contracts.ts#L1-L205) [api/\_\_tests\_\_/codex-contracts.test.ts10-41](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-contracts.test.ts#L10-L41)

---

#### 2. Creation Corner & Synthesis Bridge

The `CreationCorner` acts as the primary UI entry point for generating new artifacts. It maps legacy frontend types to the strict Codex contract.

##### Data Flow: Synthesis to Codex

1. **Request**: User submits source text and style (e.g., `faithful`, `divergent`) to `/api/creation-corner/synthesize` [api/creation-corner/synthesize.ts43-57](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts#L43-L57)
2. **Mapping**: The system maps `CreationCornerLegacyArtifactType` to `ArtifactType` and `ArtifactKind` [shared/codex/creationCorner.ts140-168](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/creationCorner.ts#L140-L168)
3. **Synthesis**: The `Gen Engine` generates content via LLM [api/gen-engine/artifacts.ts147-151](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L147-L151)
4. **Bridging**: `buildCreationCornerCodexArtifact` transforms the raw string output into a structured `CodexArtifact` body, segmenting long text into blocks [shared/codex/creationCorner.ts229-235](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/creationCorner.ts#L229-L235)

##### Bridge Logic Diagram

This diagram shows the transition from Natural Language synthesis to the Code Entity Space of the Codex.

```mermaid
flowchart TD
  A["User Input Text"]
  B["LLM Synthesis"]
  C["Raw Markdown/JSON"]
  D["buildCreationCornerCodexArtifact()"]
  E["markdownSections()"]
  F["CodexArtifactSchema.parse()"]
  G["persistCodexArtifact()"]
  H["table: codex_artifacts"]
  A --> B
  B --> C
  C --> D
  D --> E
  E --> F
  F --> G
  G --> H
```

**Sources:** [shared/codex/creationCorner.ts204-235](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/creationCorner.ts#L204-L235) [api/creation-corner/synthesize.ts107-113](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts#L107-L113) [api/codex/\_persistence.ts109-121](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts#L109-L121)

---

#### 3. Persistence & Job Claiming

The Codex uses a specialized persistence layer in `api/codex/_persistence.ts` to interact with Supabase.

##### Database Table: `codex_artifacts`

The `codex_artifacts` table stores the serialized Zod objects. The `artifactToRow` function handles the mapping between the TypeScript `CodexArtifact` interface and the database columns [api/codex/\_persistence.ts61-85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts#L61-L85)

##### Artifact Status Lifecycle

Artifacts move through a defined status lifecycle [api/\_lib/codexBridge.ts5](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L5-L5):

1. **`draft`**: Initial creation, validation pending.
2. **`validated`**: Passed Zod schema checks.
3. **`export_queued`**: Job added to `codex_jobs`.
4. **`exported`**: Rendered files (PDF/PNG) available in storage.
5. **`archived`**: Hidden from primary view but retained.

##### The `codex_jobs` Claim RPC

For background processing (rendering HTML to PDF/PNG), the system utilizes a "claim-and-process" pattern:

- **Enqueue**: `enqueueCodexExportJob` inserts a row into `codex_jobs` [api/codex/\_persistence.ts166-190](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts#L166-L190)
- **Claim**: A cron job or worker calls a Supabase RPC (e.g., `claim_codex_jobs`) to atomically lock a batch of `pending` jobs for processing.
- **Update**: Upon completion, `updateCodexJob` marks the status as `ready` and stores the `storagePath` [api/codex/\_persistence.ts238-250](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts#L238-L250)

**Sources:** [api/codex/\_persistence.ts1-250](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts#L1-L250) [api/\_lib/codexBridge.ts5-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L5-L25) [shared/codex/manifest.ts4-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/manifest.ts#L4-L10)

---

#### 4. Rendering Pipeline

The rendering pipeline is governed by the `TEMPLATE_REGISTRY` and `EXPORTER_REGISTRY`.

##### Template Routing

The `shared/codex/router.ts` file determines which visual template and which export formats are valid for a given `ArtifactKind`.

```mermaid
flowchart TD
  Kind["ArtifactKind"]
  TKey["Template ID (e.g., blueprint-v1)"]
  Formats["Format List (html, pdf, json)"]
  Render["renderArtifactHtml()"]
  Output["Sanitized HTML String"]
  UI["ArtifactExpandView.tsx"]
  Kind -->|getTemplateKey()| TKey
  Kind -->|getAllowedExportFormats()| Formats
  TKey --> Render
  Render --> Output
  Output --> UI
```

##### Key Functions

- **`renderArtifactHtml(artifact)`**: The primary entry point for converting a `CodexArtifact` into a full HTML document. It uses the `templateKey` to select the appropriate shell [api/\_\_tests\_\_/codex-contracts.test.ts71-83](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-contracts.test.ts#L71-L83)
- **`assertExportAllowed(artifact, format)`**: A guard function that throws if a user requests an unsupported export (e.g., requesting an `mp3` for a `mind_map`) [shared/codex/router.ts35-42](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/router.ts#L35-L42)

**Sources:** [shared/codex/router.ts1-42](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/router.ts#L1-L42) [api/\_\_tests\_\_/codex-contracts.test.ts62-69](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-contracts.test.ts#L62-L69) [shared/codex/renderers.ts1-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/renderers.ts#L1-L50)

---

### Gen Engine & Artifact Synthesis

> Source MHT: `Gen Engine & Artifact Synthesis _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6.2-gen-engine-and-artifact-synthesis  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/codex-bridge.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-bridge.test.ts)
- [api/\_\_tests\_\_/codex-export-runner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-export-runner.test.ts)
- [api/\_\_tests\_\_/codex-forge.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-forge.test.ts)
- [api/\_\_tests\_\_/session-recap.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/session-recap.test.ts)
- [api/\_lib/codexBridge.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts)
- [api/codex/\_persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts)
- [api/codex/artifacts/[artifactId]/drain-exports.ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/drain-exports.ts)
- [api/creation-corner/synthesize.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts)
- [api/gen-engine/artifact.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifact.ts)
- [api/gen-engine/artifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts)
- [api/gen-engine/export.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/export.ts)
- [api/sessionRecap.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sessionRecap.ts)
- [client/src/components/ArtifactExportBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactExportBar.tsx)
- [client/src/components/ArtifactRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactRenderer.tsx)
- [client/src/components/ProvenanceDisclosure.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ProvenanceDisclosure.tsx)
- [client/src/components/SessionRecapGenerator.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx)
- [client/src/lib/rendering/RenderingEngine.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/RenderingEngine.tsx)
- [client/src/lib/rendering/dispatch.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/dispatch.ts)
- [client/src/lib/rendering/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/index.ts)
- [client/src/lib/rendering/registry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/registry.ts)
- [client/src/lib/rendering/types.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/types.ts)
- [client/src/lib/sessionRecapDownloads.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sessionRecapDownloads.ts)
- [client/src/lib/spotify.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/spotify.ts)
- [client/src/lib/transcriptoryDownloads.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/transcriptoryDownloads.ts)
- [client/src/tests/rendering-contract.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/rendering-contract.test.ts)
- [client/src/tests/session-recap-download.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/session-recap-download.test.ts)
- [client/src/tests/transcriptory-downloads.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/transcriptory-downloads.test.ts)
- [docs/Codex.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Codex.md?plain=1)
- [server/lib/codexBridge.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/lib/codexBridge.ts)
- [shared/codex/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/index.ts)
- [shared/gen-engine/core.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/gen-engine/core.ts)
- [shared/gen-engine/types.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/gen-engine/types.ts)
- [shared/sessionRecap.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts)
- [supabase/codex\_artifact\_data\_fixes\_2026-06-17.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/codex_artifact_data_fixes_2026-06-17.sql)

</details>
The **Generative Engine (Gen Engine)** is the primary synthesis layer of GestaltView v2.0. It bridges the gap between raw user captures (Natural Language Space) and structured, persistent knowledge entities (Code Entity Space). It is responsible for orchestrating LLM calls, enforcing Private Language Key (PLK) constraints, and bridging generated outputs into the **Codex** for long-term storage and export.

#### 1. The Generative Engine Architecture

The Gen Engine operates as a stateless synthesis pipeline. It accepts source material (text, capture IDs, or existing artifacts) and applies a specific `SynthesisStyle` to produce a new `GeneratedArtifact`.

##### Key Components

- **API Endpoints (`api/gen-engine/*`)**: The entry points for synthesis and export.
  - `POST /api/gen-engine/artifacts`: The main synthesis route that creates an artifact shell and calls the LLM [api/gen-engine/artifacts.ts4-6](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L4-L6)
  - `POST /api/gen-engine/export`: Converts a `GeneratedArtifact` into downloadable formats like HTML or Markdown [api/gen-engine/export.ts1-4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/export.ts#L1-L4)
- **Core Logic (`shared/gen-engine/core.ts`)**: Contains normalization logic for rooms, artifact types, and styles [shared/gen-engine/core.ts35-92](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/gen-engine/core.ts#L35-L92)
- **Type Definitions (`shared/gen-engine/types.ts`)**: Defines the contracts for `GeneratedArtifact`, `ProvenanceEnvelope`, and `SynthesisStyle` [shared/gen-engine/core.ts1-31](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/gen-engine/core.ts#L1-L31)

##### Synthesis Styles

The engine supports multiple synthesis modes that dictate the LLM's "persona" and transformation logic:

| Style | Description |
| --- | --- |
| `faithful` | Stays close to source; no invention [api/gen-engine/artifacts.ts41-42](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L41-L42) |
| `convergent` | Synthesizes core threads into a coherent statement [api/gen-engine/artifacts.ts43-44](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L43-L44) |
| `divergent` | Explores implications and expansive possibilities [api/gen-engine/artifacts.ts45-46](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L45-L46) |
| `plk-resonant` | Uses the user's exact metaphors as the primary structure [api/gen-engine/artifacts.ts55-56](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L55-L56) |
| `founder-voice` | Direct, peer-to-peer, non-corporate language [api/gen-engine/artifacts.ts53-54](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L53-L54) |

**Sources:** [api/gen-engine/artifacts.ts40-57](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L40-L57) [shared/gen-engine/core.ts80-92](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/gen-engine/core.ts#L80-L92)

---

#### 2. Artifact Synthesis Lifecycle

The synthesis process follows a strict sequence to ensure provenance and data integrity.

##### Data Flow: Synthesis to Codex

1. **Request**: A client (e.g., Creation Corner) sends a request to `api/gen-engine/artifacts`.
2. **Shell Creation**: The engine calls `createArtifact` to generate a `GeneratedArtifact` shell with metadata and a placeholder for content [api/gen-engine/artifacts.ts129-145](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L129-L145)
3. **LLM Routing**: The `routeLlm` function is called with a prompt built from the `SynthesisStyle` and `PLK` constraints [api/gen-engine/artifacts.ts153-157](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L153-L157)
4. **Content Replacement**: The LLM's output replaces the placeholder in the artifact shell [api/gen-engine/artifacts.ts161-163](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L161-L163)
5. **Codex Bridge**: The `bridgeToCodex` function persists the artifact and its `ProvenanceEnvelope` to Supabase [api/gen-engine/artifacts.ts172-176](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L172-L176)

##### Synthesis Sequence Diagram

"Natural Language Space" (User Intent) to "Code Entity Space" (CodexArtifact).

```mermaid
sequenceDiagram
  participant U as User (Creation Corner)
  participant GE as api/gen-engine/artifacts.ts
  participant LLM as llmRouter.ts
  participant CB as api/_lib/codexBridge.ts
  participant DB as Supabase (created_artifacts)
  U->>GE: POST (sourceText, targetType, style)
  GE->>GE: buildSynthesisSystemPrompt()
  GE->>LLM: routeLlm(prompt)
  LLM-->>GE: response (Markdown/HTML/JSON)
  GE->>CB: bridgeToCodex(GeneratedArtifact)
  CB->>DB: insertRow('created_artifacts')
  CB->>DB: insertRow('artifact_provenance_envelopes')
  DB-->>CB: success
  CB-->>GE: CodexBridgeResult
  GE-->>U: 200 OK (Rendered Artifact)
```

**Sources:** [api/gen-engine/artifacts.ts112-180](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L112-L180) [api/\_lib/codexBridge.ts73-172](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L73-L172)

---

#### 3. The Creation Corner & Forge Process

The **Creation Corner** is the specialized UI for synthesizing artifacts. It uses a "Forge" metaphor where raw captures are hammered into "Blueprints" or "Artifacts".

##### `synthesize` Endpoint

The `api/creation-corner/synthesize.ts` handler acts as a wrapper around the Gen Engine, mapping legacy UI types to the modern engine contracts.

- **Type Mapping**: Converts `LegacyArtifactType` (e.g., "image") to Gen Engine `ArtifactType` [api/creation-corner/synthesize.ts59-63](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts#L59-L63)
- **Resonance Scoring**: Calls `scoreResonance` to determine how well the generated artifact aligns with the user's PLK profile [api/creation-corner/synthesize.ts97-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts#L97-L105)
- **Manifest Building**: Generates a `CodexManifest` (export instructions) via `buildCreationCornerCodexArtifact` [api/creation-corner/synthesize.ts107-113](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts#L107-L113)

##### Code Entity Mapping

This diagram bridges UI concepts to the underlying logic.

```mermaid
flowchart TD
  A["CreationCornerPage"]
  B["synthesize.ts"]
  C["SessionRecapGenerator"]
  D["api/sessionRecap.ts"]
  E["shared/gen-engine/core.ts"]
  F["GeneratedArtifact"]
  G["shared/sessionRecap.ts"]
  H["CodexArtifact (Supabase)"]
  A -->|User Input| B
  C -->|Capture History| D
  B -->|mapCreationCornerStyle()| E
  B -->|createArtifact()| F
  D -->|buildRecapSystemPrompt()| G
  F -->|bridgeToCodex()| H
```

**Sources:** [api/creation-corner/synthesize.ts59-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts#L59-L96) [shared/codex/creationCorner.ts4-13](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/creationCorner.ts#L4-L13) [shared/sessionRecap.ts71-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts#L71-L82)

---

#### 4. Session Recap Synthesis

A specialized branch of the Gen Engine is the **Session Recap** system. Unlike standard artifacts, Recaps are highly structured HTML documents designed for immediate feedback.

##### Orchestration Logic

- **`requestOrchestrationDecision`**: The client-side call that determines if a recap is needed and what its focus should be [client/src/components/SessionRecapGenerator.tsx229-234](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L229-L234)
- **`api/sessionRecap.ts`**: The server-side handler that implements a **two-pass validation loop**. If the LLM fails to produce valid HTML, the system attempts a repair; if that fails, it uses `buildRecapFallbackHtml` [api/sessionRecap.ts53-87](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sessionRecap.ts#L53-L87)
- **Recap Voices**: The user can choose a "Voice" (e.g., Billy, The Architect, The Curator) which changes the tone and system prompt [shared/sessionRecap.ts31-48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts#L31-L48)

##### Data Structure: `RecapArtifact`

Recaps are created with `status: "draft"` to prevent them from appearing in the user's main gallery until explicitly promoted [client/src/components/SessionRecapGenerator.tsx111-112](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L111-L112)

| Field | Purpose |
| --- | --- |
| `id` | Prefixed with `recap-` [client/src/components/SessionRecapGenerator.tsx105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L105-L105) |
| `surface` | Always set to `"forward"` [client/src/components/SessionRecapGenerator.tsx109](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L109-L109) |
| `metadata.sourceDiId` | The ID of the DI persona used for the recap [client/src/components/SessionRecapGenerator.tsx120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L120-L120) |

**Sources:** [api/sessionRecap.ts31-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sessionRecap.ts#L31-L115) [client/src/components/SessionRecapGenerator.tsx96-124](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L96-L124) [shared/sessionRecap.ts222-223](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts#L222-L223)

---

#### 5. The Codex Bridge

The `codexBridge.ts` is the critical link between the ephemeral `gen-engine` results and the persistent database.

##### Functions and Responsibilities

1. **`extractUuidSegment`**: Strips prefixes (like `artifact-`) from Gen Engine IDs to ensure they fit into Supabase UUID columns [api/\_lib/codexBridge.ts40-46](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L40-L46)
2. **`validateArtifactContract`**: Checks for missing IDs, empty content, or missing source captures before persistence [api/\_lib/codexBridge.ts60-71](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L60-L71)
3. **`bridgeToCodex`**:
   - Generates a fresh `codexId` (UUID) [api/\_lib/codexBridge.ts85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L85-L85)
   - Inserts a row into `created_artifacts` [api/\_lib/codexBridge.ts121-144](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L121-L144)
   - Inserts a corresponding row into `artifact_provenance_envelopes` to maintain the chain of trust [api/\_lib/codexBridge.ts155-166](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L155-L166)

##### Persistence Schema

The bridge maps the `GeneratedArtifact` to the `created_artifacts` table:

- `userid` -> `artifact.userId`
- `artifacttype` -> `artifact.type`
- `contentformat` -> `artifact.contentFormat`
- `metadata` -> Includes `gen_artifact_id` (prefixed) and `codex_version` [api/\_lib/codexBridge.ts131-142](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L131-L142)

**Sources:** [api/\_lib/codexBridge.ts73-172](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L73-L172) [api/codex/\_persistence.ts61-85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts#L61-L85)

---

### Codex HTML Templates & Export

> Source MHT: `Codex HTML Templates & Export _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/6.3-codex-html-templates-and-export  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/codex-bridge.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-bridge.test.ts)
- [api/\_\_tests\_\_/codex-export-retrieval.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-export-retrieval.test.ts)
- [api/\_\_tests\_\_/profile-portrait-drain.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-drain.test.ts)
- [api/\_lib/codexBridge.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts)
- [api/codex/artifacts/[artifactId]/exports/[format].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/exports/%5Bformat%5D.ts)
- [api/cron/codex-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts)
- [api/cron/profile-portrait-cadence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts)
- [api/cron/profile-portrait-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts)
- [api/cron/provenance-upgrade.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/provenance-upgrade.ts)
- [api/gen-engine/artifact.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifact.ts)
- [api/gen-engine/artifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts)
- [api/gen-engine/export.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/export.ts)
- [client/src/components/ArtifactExportBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactExportBar.tsx)
- [client/src/components/ArtifactRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactRenderer.tsx)
- [client/src/components/ProvenanceDisclosure.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ProvenanceDisclosure.tsx)
- [client/src/lib/rendering/ArtifactExportViewer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/ArtifactExportViewer.tsx)
- [client/src/lib/rendering/artifactExport.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/artifactExport.ts)
- [client/src/lib/rendering/hooks/useArtifactExport.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/hooks/useArtifactExport.ts)
- [client/src/lib/rendering/hooks/useIframeResize.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/hooks/useIframeResize.ts)
- [client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx)
- [client/src/lib/spotify.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/spotify.ts)
- [client/src/tests/artifact-export-viewer.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/artifact-export-viewer.test.ts)
- [server/lib/codexBridge.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/lib/codexBridge.ts)
- [shared/codex/storage.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/storage.ts)
- [shared/codex/templates/components.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/components.js)
- [shared/codex/templates/html-shell.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/html-shell.js)
- [shared/codex/templates/html-shell.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/html-shell.ts)
- [shared/codex/templates/html.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/html.js)
- [shared/codex/templates/html.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/html.ts)
- [shared/codex/templates/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/index.ts)
- [shared/codex/templates/kinds/index.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/kinds/index.js)
- [shared/codex/templates/kinds/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/kinds/index.ts)
- [shared/codex/templates/renderers/index.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/renderers/index.js)
- [shared/codex/templates/renderers/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/renderers/index.ts)
- [vercel.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json)

</details>
The Codex Export system is responsible for transforming generated artifacts into portable, high-fidelity formats including HTML, JSON, PDF, and PNG. It utilizes a specialized template engine to apply the **Neural Aurora** aesthetic, ensuring that exported data maintains the platform's visual identity and provenance integrity outside the primary application environment.

#### System Architecture & Data Flow

The export process follows a transition from the Generative Engine's raw output to a validated Codex Artifact, which is then processed by a background worker for multi-format rendering.

##### Export Pipeline Diagram

"Neural Aurora Export Flow"

```mermaid
flowchart TD
  I["ArtifactExportBar.tsx"]
  J["Signed URL"]
  K["User Download"]
  A["ArtifactSynthesisRequest"]
  B["GeneratedArtifact"]
  C["created_artifacts (DB Row)"]
  D["artifact_provenance_envelopes (DB Row)"]
  E["codex-drain.ts (Cron)"]
  F["runCodexExportJob()"]
  G["HTML/JSON/PDF Payload"]
  H["CODEX_EXPORT_BUCKET"]
  A -->|api/gen-engine/artifacts.ts| B
  B -->|bridgeToCodex()| C
  B -->|bridgeToCodex()| D
  E -->|claim_codex_jobs| F
  F -->|templates/kinds/index.ts| G
  G -->|Supabase Storage| H
  C --> F
  D --> F
  I -->|GET /api/codex/artifacts/[id]/exports| J
  J --> K
```

**Sources:** [api/gen-engine/artifacts.ts1-173](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L1-L173) [api/\_lib/codexBridge.ts73-172](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L73-L172) [api/cron/codex-drain.ts1-150](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L1-L150)

#### Codex Bridge & Data Persistence

The `bridgeToCodex` function acts as the gatekeeper between the transient LLM generation phase and the permanent Codex record. It performs two critical tasks:

1. **Contract Validation:** Ensures the artifact has content, an ID, and source capture IDs for the provenance chain [api/\_lib/codexBridge.ts60-71](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L60-L71)
2. **ID Normalization:** Strips `gen-engine` prefixes (e.g., `artifact-`) to ensure strict UUID compliance for PostgreSQL foreign keys in the `created_artifacts` and `artifact_provenance_envelopes` tables [api/\_lib/codexBridge.ts40-58](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L40-L58)

**Sources:** [api/\_lib/codexBridge.ts1-173](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/codexBridge.ts#L1-L173)

#### HTML Template System

The `shared/codex/templates/` directory contains the "Neural Aurora" rendering logic. This system is designed to be environment-agnostic, allowing it to run in both Vercel serverless functions (for exports) and the React client (via `HtmlArtifactRenderer.tsx`).

##### Template Components

The system uses a virtual-DOM-like structure in `components.js` to build the artifact shell:

- **ArtifactHeroTitle**: Renders the primary H1 header [shared/codex/templates/components.js4-6](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/components.js#L4-L6)
- **ArtifactManifestPanel**: A definition list displaying available export formats and their status [shared/codex/templates/components.js12-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/components.js#L12-L25)
- **ProvenanceDrawer**: An interactive `<details>` element containing the sequential chain of source IDs and transformation types [shared/codex/templates/components.js27-44](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/components.js#L27-L44)

##### The HTML Shell

The `html-shell.ts` builder wraps the artifact content in a standalone document featuring:

- **Neural Aurora Aesthetic**: A dark-mode CSS theme utilizing JetBrains Mono and teal-on-black accents.
- **Artifact Chrome**: Standardized headers and footers that include the `codex_version` and `created_at` timestamps.

**Sources:** [shared/codex/templates/index.ts1-6](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/index.ts#L1-L6) [shared/codex/templates/components.js1-45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/components.js#L1-L45) [shared/codex/templates/html.ts1-2](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/templates/html.ts#L1-L2)

#### Export Formats & Synthesis Styles

The `api/gen-engine/artifacts.ts` handler allows users to specify both a `targetType` (format) and a `synthesisStyle` (voice/intent).

| Artifact Type | Description |
| --- | --- |
| `markdown` | Standard structured text with headers and lists [api/gen-engine/artifacts.ts60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L60-L60) |
| `pdf-ready-html` | Complete HTML document with inline `<style>` for PDF rendering [api/gen-engine/artifacts.ts61-62](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L61-L62) |
| `blueprint-json` | Raw data object for machine interoperability [api/gen-engine/artifacts.ts63-64](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L63-L64) |
| `session-recap` | Structured insights, decisions, and follow-up threads [api/gen-engine/artifacts.ts77-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L77-L78) |

##### Synthesis Styles

Styles like `plk-resonant` (preserving exact user metaphors) and `revolutionary` (reframing material for deep implication) are injected into the LLM system prompt during generation [api/gen-engine/artifacts.ts40-57](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L40-L57)

**Sources:** [api/gen-engine/artifacts.ts40-92](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/artifacts.ts#L40-L92) [api/gen-engine/export.ts1-40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/gen-engine/export.ts#L1-L40)

#### Background Jobs: Codex Drain

Exports are processed asynchronously via the `codex-drain` cron job to ensure that complex renders (like PDF generation or large HTML builds) do not block the main API response.

- **Schedule**: Runs every 2 minutes via Vercel Cron [vercel.json12-14](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L12-L14)
- **Batching**: Processes up to 5 jobs per invocation [api/cron/codex-drain.ts32](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L32-L32)
- **Idempotency**: Uses the `claim_codex_jobs` RPC to transition jobs from `pending` to `running`, preventing double-processing [api/cron/codex-drain.ts58-69](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L58-L69)
- **Storage**: Finished exports are written to the `CODEX_EXPORT_BUCKET`. Access is granted via signed URLs generated on-demand [api/cron/codex-drain.ts10-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L10-L15)

"Codex Drain Logic"

```mermaid
sequenceDiagram
  participant C as Vercel Cron
  participant D as codex-drain.ts
  participant DB as Supabase RPC
  participant R as runner.js
  participant S as Supabase Storage
  C->>D: Trigger /api/cron/codex-drain
  D->>DB: claim_codex_jobs(BATCH_SIZE)
  DB-->>D: Return List of Pending Jobs
  D->>R: runCodexExportJob(jobId)
  R->>R: Render HTML/JSON
  R->>S: Upload to CODEX_EXPORT_BUCKET
  R->>DB: Update job status to 'ready'
  D-->>C: 200 OK (Summary JSON)
```

**Sources:** [api/cron/codex-drain.ts1-150](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L1-L150) [vercel.json6-23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L6-L23)

---

## Volume: Backend, Persistence & Deployment

### Database & Backend Infrastructure

> Source MHT: `Database & Backend Infrastructure _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7-database-and-backend-infrastructure  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/profile-portrait-drain.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-drain.test.ts)
- [api/cron/codex-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts)
- [api/cron/profile-portrait-cadence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts)
- [api/cron/profile-portrait-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts)
- [api/cron/provenance-upgrade.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/provenance-upgrade.ts)
- [context/This\_Is\_Who,\_What,\_Where,\_When,\_And\_How.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/context/This_Is_Who,_What,_Where,_When,_And_How.md?plain=1)
- [docs/20260420\_schema\_delta.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/20260420_schema_delta.md?plain=1)
- [docs/DirectoryMapAndWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/DirectoryMapAndWorkflow.md?plain=1)
- [docs/GestaltView\_Platform\_Ground\_Truth.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/GestaltView_Platform_Ground_Truth.md?plain=1)
- [scripts/gestaltview\_crawler.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_crawler.py)
- [scripts/gestaltview\_manifest\_pipeline.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py)
- [supabase/CompleteSchema.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/CompleteSchema.sql)
- [supabase/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/config.toml)
- [supabase/functions/\_shared/auth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/auth.ts)
- [supabase/functions/\_shared/cors.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/cors.ts)
- [supabase/functions/\_shared/json.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/json.ts)
- [supabase/functions/\_shared/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/supabaseAdmin.ts)
- [supabase/migrations/20260413143526\_manifest\_pipeline\_schema\_enhancements.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260413143526_manifest_pipeline_schema_enhancements.sql)
- [supabase/migrations/20260417030218\_add\_ingested\_at\_and\_file\_modified\_to\_knowledge\_fragments.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260417030218_add_ingested_at_and_file_modified_to_knowledge_fragments.sql)
- [supabase/migrations/20260420150000\_human\_continuity\_schema.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260420150000_human_continuity_schema.sql)
- [supabase/migrations/20260501222005\_bucket\_drops\_promotion\_pipeline.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260501222005_bucket_drops_promotion_pipeline.sql)
- [vercel.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json)

</details>
The GestaltView v2.0 backend is a distributed architecture centered around a **Supabase PostgreSQL** database, managed via **Prisma ORM**, and orchestrated through **Vercel Serverless Functions** and **Supabase Edge Functions**. The infrastructure is designed to support high-frequency data ingestion, complex vector-based retrieval, and a resilient "drain" pattern for asynchronous background processing.

#### System Topology

The backend facilitates the transition from "Natural Language Space" (user captures, transcripts) to "Code Entity Space" (Codex artifacts, vector fragments) through a series of specialized layers.

##### Backend Infrastructure Overview

```mermaid
flowchart TD
  A["API Routes (/api/*)"]
  B["Cron Handlers (/api/cron/*)"]
  C["Vercel Edge Config"]
  D["PostgreSQL (DB)"]
  E["Vector Engine (pgvector)"]
  F["Edge Functions (Deno)"]
  G["Storage Buckets"]
  H["Auth (GoTrue)"]
  I["Prisma ORM Client"]
  J["Migration Spine"]
  A --> D
  B --> D
  F --> D
  I --> D
  D --> E
  A --> G
  H --> D
```

Sources: [vercel.json1-125](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L1-L125) [supabase/migrations/20260420150000\_human\_continuity\_schema.sql10-12](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260420150000_human_continuity_schema.sql#L10-L12)

#### Core Components

##### 1. Supabase PostgreSQL & Schema Dashboard

The database uses a multi-domain schema (identity, trainer, codex, etc.) with strict **Row Level Security (RLS)**. It leverages `pgvector` for 768-dimension embeddings used in semantic search. A specialized Schema Dashboard provides real-time snapshots of database health and migration status.
*For details, see [Supabase Schema & Migrations](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.1-supabase-schema-and-migrations)*.

##### 2. Prisma ORM Layer

Prisma acts as the primary Data Access Layer (DAL) for the Vercel-hosted API. It provides type-safe queries and manages the migration spine under `prisma/migrations/`. It coexists with the `supabase-js` client used in Edge Functions.
*For details, see [Prisma ORM & Data Access Layer](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.5-prisma-orm-and-data-access-layer)*.

##### 3. Vercel Deployment & Cron Jobs

The frontend and API are deployed to Vercel. A critical part of the backend is the "Drain" pattern—scheduled cron jobs that process queues for Codex generation and Profile Portraits.
*For details, see [Vercel Deployment & Cron Jobs](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.3-vercel-deployment-and-cron-jobs)*.

##### 4. Supabase Edge Functions

Deno-based Edge Functions handle high-throughput event capture and batch ingestion. These are geographically distributed to minimize latency for the `gsvw-capture-event` and `gsvw-ingest-batch` endpoints.
*For details, see [Supabase Edge Functions](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.4-supabase-edge-functions)*.

##### 5. Authentication & Session Management

A hybrid system combining Supabase Auth with custom HMAC-signed admin sessions (`gv_admin_session`). It supports tiered access (Free, Core, Pro, Enterprise) and rate limiting.
*For details, see [Authentication & Session Management](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.2-authentication-and-session-management)*.

#### Data Flow: From Capture to Artifact

The following diagram bridges the gap between user interaction and the underlying code entities that manage data persistence.

##### Logic Flow: Capture Ingestion

```mermaid
sequenceDiagram
  participant U as User (Client)
  participant EF as gsvw-capture-event (Edge Function)
  participant DB as PostgreSQL (DB)
  participant CJ as codex-drain (Cron)
  participant R as runCodexExportJob (Worker)
  U->>EF: POST /capture (Raw Event)
  EF->>DB: INSERT INTO bucket_drops
  Note over DB: Trigger: Signal Threshold Met
  CJ->>DB: RPC claim_codex_jobs()
  DB-->>CJ: Return PendingJobRow[]
  CJ->>R: Invoke runner.js
  R->>DB: UPDATE codex_artifacts (Status: Ready)
```

Sources: [api/cron/codex-drain.ts58-69](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L58-L69) [api/cron/codex-drain.ts116-122](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L116-L122) [supabase/functions/\_shared/auth.ts1-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/auth.ts#L1-L15)

#### Background Job Infrastructure

The system relies on an idempotency pattern where cron jobs "claim" work from the database to prevent duplicate processing in serverless environments.

| Cron Route | Frequency | Primary Function | Code Entity |
| --- | --- | --- | --- |
| `/api/cron/codex-drain` | 2 min | Processes pending Codex export jobs | `runCodexExportJob` |
| `/api/cron/profile-portrait-drain` | 5 min | Generates AI portraits from user signals | `claimPortraitQueueJob` |
| `/api/cron/profile-portrait-cadence` | Monthly | Enqueues monthly portrait refreshes | `maybe_queue_portrait_cadence` |
| `/api/cron/provenance-upgrade` | 2 hr | Upgrades data claims to blockchain-backed proofs | `provenance-upgrade.ts` |

Sources: [vercel.json6-23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L6-L23) [api/cron/codex-drain.ts32-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L32-L33) [api/cron/profile-portrait-drain.ts21-22](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts#L21-L22)

#### Infrastructure Security & Authorization

Security is enforced through a tiered approach:

1. **Shared Secrets**: Edge functions require `GESTALTVIEW_INGEST_SECRET` via headers [supabase/functions/\_shared/auth.ts1-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/auth.ts#L1-L15)
2. **Service Role**: Cron jobs use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for administrative tasks [api/cron/codex-drain.ts11-14](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L11-L14)
3. **Cron Validation**: The `isAuthorizedCronRequest` function verifies `x-vercel-cron` headers and `CRON_SECRET` to ensure only authorized callers trigger background work [api/cron/codex-drain.ts43-54](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts#L43-L54)
4. **CORS**: Strict origin validation via `buildCorsHeaders` prevents unauthorized cross-origin requests to Edge Functions [supabase/functions/\_shared/cors.ts28-66](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/cors.ts#L28-L66)

---

**Child Pages:**

- [Supabase Schema & Migrations](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.1-supabase-schema-and-migrations)
- [Authentication & Session Management](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.2-authentication-and-session-management)
- [Vercel Deployment & Cron Jobs](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.3-vercel-deployment-and-cron-jobs)
- [Supabase Edge Functions](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.4-supabase-edge-functions)
- [Prisma ORM & Data Access Layer](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.5-prisma-orm-and-data-access-layer)

---

### Supabase Schema & Migrations

> Source MHT: `Supabase Schema & Migrations _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.1-supabase-schema-and-migrations  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.agents/skills/supabase-postgres-best-practices/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase-postgres-best-practices/SKILL.md?plain=1)
- [.agents/skills/supabase-postgres-best-practices/references/\_contributing.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase-postgres-best-practices/references/_contributing.md?plain=1)
- [.agents/skills/supabase-postgres-best-practices/references/security-rls-performance.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase-postgres-best-practices/references/security-rls-performance.md?plain=1)
- [.agents/skills/supabase/CHANGELOG.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase/CHANGELOG.md?plain=1)
- [.agents/skills/supabase/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase/SKILL.md?plain=1)
- [.agents/skills/supabase/assets/feedback-issue-template.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase/assets/feedback-issue-template.md?plain=1)
- [.agents/skills/supabase/references/skill-feedback.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/supabase/references/skill-feedback.md?plain=1)
- [.perplexity/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/CurrentState.md?plain=1)
- [.perplexity/REPO\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.json)
- [.perplexity/REPO\_MANIFEST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.md?plain=1)
- [.perplexity/SYNC\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md?plain=1)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07\_CURRENT\_STATE\_AND\_EVIDENCE/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md?plain=1)
- [client/src/lib/rendering/capture/domCapture.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/capture/domCapture.ts)
- [client/src/tests/dom-capture-export.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/dom-capture-export.test.ts)
- [context/This\_Is\_Who,\_What,\_Where,\_When,\_And\_How.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/context/This_Is_Who,_What,_Where,_When,_And_How.md?plain=1)
- [docs/20260420\_schema\_delta.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/20260420_schema_delta.md?plain=1)
- [docs/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1)
- [docs/DirectoryMapAndWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/DirectoryMapAndWorkflow.md?plain=1)
- [docs/GestaltView\_Platform\_Ground\_Truth.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/GestaltView_Platform_Ground_Truth.md?plain=1)
- [docs/gestaltview-v2.manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json)
- [docs/gestaltview-v2.manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1)
- [scripts/CurrentState.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/CurrentState.sql)
- [supabase/CompleteSchema.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/CompleteSchema.sql)
- [supabase/migrations/20260311162044\_new-migration.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql)
- [supabase/migrations/20260413143526\_manifest\_pipeline\_schema\_enhancements.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260413143526_manifest_pipeline_schema_enhancements.sql)
- [supabase/migrations/20260417030218\_add\_ingested\_at\_and\_file\_modified\_to\_knowledge\_fragments.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260417030218_add_ingested_at_and_file_modified_to_knowledge_fragments.sql)
- [supabase/migrations/20260420150000\_human\_continuity\_schema.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260420150000_human_continuity_schema.sql)
- [supabase/migrations/20260501222005\_bucket\_drops\_promotion\_pipeline.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260501222005_bucket_drops_promotion_pipeline.sql)

</details>
The GestaltView v2.0 backend is powered by a robust Supabase PostgreSQL infrastructure designed to support longitudinal digital intelligence (DI) continuity, high-dimensional vector search, and complex multi-stage training pipelines. The system utilizes a "migration spine" consisting of 86 sequential migrations to maintain schema integrity across environments [docs/gestaltview-v2.manifest.md30](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L30-L30)

#### Core Domain Groups

The database is architected into several key functional domains, each represented by specific table clusters and associated logic.

##### 1. Identity & Continuity (identity\_core)

This domain manages the persistence of human and DI profiles, ensuring that identity is treated as a "living structure" rather than a disposable mask.

- **`app_users`**: The root table for all platform users [supabase/migrations/20260311162044\_new-migration.sql10-13](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L10-L13)
- **`consciousness_profiles`**: Stores the high-level personality and cognitive state of users, mapping `user_id` to complex `jsonb` profile objects [supabase/migrations/20260311162044\_new-migration.sql15-21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L15-L21)
- **`human_identity_mutations`**: Tracks proposed and applied changes to a user's identity core, supporting review-gated or evidence-promotable updates [supabase/migrations/20260420150000\_human\_continuity\_schema.sql50-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260420150000_human_continuity_schema.sql#L50-L75)

##### 2. Runtime & Memory (runtime\_continuity)

Handles the live interaction state between users and Billy (the primary DI).

- **`billy_sessions`**: Captures chat history, provider metadata, and interaction modes [supabase/migrations/20260311162044\_new-migration.sql53-62](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L53-L62)
- **`bucket_drops`**: The primary capture mechanism for raw thoughts and inputs, which are later promoted to artifacts [supabase/migrations/20260311162044\_new-migration.sql23-30](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L23-L30)

##### 3. Agent Trainer & Embodiment

Governs the creation and lifecycle of DI personas.

- **`embodiment_profiles`**: The registry of all active DI personas (e.g., Billy, The Architect, Curator) [docs/CurrentState.md59](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L59-L59)
- **`embodiment_training_runs`**: Tracks the 8-stage pipeline for training new DI behaviors [docs/CurrentState.md59](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L59-L59)
- **`embodiment_readiness_scores`**: Stores normalized (0.0 to 1.0) scores indicating a profile's maturity [docs/CurrentState.md51-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L51-L60)

##### 4. Codex & Artifacts

The persistence layer for generated knowledge and exports.

- **`codex_artifacts`**: Stores finalized artifacts, their status (queued/ready), and rendering metadata [Page 6.1 description](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/Page%206.1%20description)
- **`codex_jobs`**: A job queue for background processing of artifact exports [Page 6.1 description](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/Page%206.1%20description)

##### 5. Transcriptory & Knowledge

The RAG (Retrieval-Augmented Generation) engine's backbone.

- **`knowledge_fragments`**: Stores chunked text from the corpus with associated vector embeddings [supabase/migrations/20260311162044\_new-migration.sql103-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L103-L115)
- **`skill_fragments`**: Specialized fragments containing behavioral logic for DIs [docs/gestaltview-v2.manifest.md10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L10-L10)

Sources: [supabase/migrations/20260311162044\_new-migration.sql10-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L10-L115) [supabase/migrations/20260420150000\_human\_continuity\_schema.sql36-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260420150000_human_continuity_schema.sql#L36-L106) [docs/CurrentState.md59-61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L59-L61)

#### Vector Infrastructure

GestaltView uses the `pgvector` extension to facilitate semantic search across the corpus and user memories.

- **Embedding Dimension**: 768-dim or 1536-dim (depending on the model migration) [supabase/migrations/20260311162044\_new-migration.sql99-107](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L99-L107)
- **Index Type**: HNSW (Hierarchical Navigable Small World) for high-performance cosine similarity searches [supabase/migrations/20260311162044\_new-migration.sql125-130](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L125-L130)
- **Search Function**: `match_knowledge_fragments` calculates similarity using the `<=>` operator [supabase/migrations/20260311162044\_new-migration.sql161-190](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L161-L190)

Sources: [supabase/migrations/20260311162044\_new-migration.sql8-190](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L8-L190)

#### Schema Dashboard & RPCs

The platform includes a specialized `SchemaDashboardPage` that provides a live view of the database health and structure.

##### Key Database Functions (RPCs)

- **`get_schema_dashboard_snapshot`**: Generates a comprehensive JSON summary of table counts, row counts, and index statuses [docs/CurrentState.md7-8](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L7-L8)
- **`claim_codex_jobs`**: Atomically claims pending export tasks to prevent double-processing by workers [Page 6.1 description](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/Page%206.1%20description)
- **`trainer_search_study_sources`**: Performs vector-weighted search specifically for the Agent Trainer curriculum [Page 5.2 description](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/Page%205.2%20description)

##### Schema Dashboard Data Flow

Title: Schema Dashboard Live Update Flow

```mermaid
flowchart TD
  A["SchemaDashboardPage.tsx"]
  B["dashboard.ts (API Handler)"]
  C["get_schema_dashboard_snapshot()"]
  D["pg_class / pg_attribute"]
  E["Table Statistics"]
  F["JSON Snapshot"]
  G["gestaltview_schema_dashboard.html"]
  A -->|GET /api/schema/dashboard| B
  B -->|RPC call| C
  C -->|Queries| D
  C -->|Queries| E
  D --> F
  E --> F
  F -->|Response| B
  B -->|JSON| A
  A -->|Render| G
```

Sources: [docs/CurrentState.md7-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L7-L10) [client/src/App.tsx160](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx#L160-L160)

#### The Migration Spine

The schema evolves through sequential SQL files located in `supabase/migrations/`. A Python utility, `run_migration.py`, is used to apply these updates [docs/gestaltview-v2.manifest.md11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L11-L11)

##### Critical Migration Milestones

| Migration ID | Purpose |
| --- | --- |
| `20260311162044` | Initial core schema: users, profiles, and basic knowledge fragments [supabase/migrations/20260311162044\_new-migration.sql4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L4-L4) |
| `20260413143526` | Enhancements for the manifest pipeline and corpus ingestion [docs/gestaltview-v2.manifest.md10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1#L10-L10) |
| `20260420150000` | Human continuity repair and identity mutation logic [supabase/migrations/20260420150000\_human\_continuity\_schema.sql4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260420150000_human_continuity_schema.sql#L4-L4) |
| `20260628150000` | Schema dashboard snapshot generation [docs/CurrentState.md8](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L8-L8) |

Sources: [supabase/migrations/20260311162044\_new-migration.sql1-4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L1-L4) [supabase/migrations/20260420150000\_human\_continuity\_schema.sql1-8](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260420150000_human_continuity_schema.sql#L1-L8) [docs/CurrentState.md8](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L8-L8)

#### Security & RLS Policies

Row Level Security (RLS) is strictly enforced to ensure that users can only access their own data, while DIs have restricted access to shared knowledge fragments.

- **User Isolation**: Tables like `bucket_drops` and `consciousness_profiles` are partitioned by `user_id` or `auth.uid()` [supabase/migrations/20260311162044\_new-migration.sql17-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L17-L25)
- **Admin Access**: The `/schema-dashboard` and certain embodiment sync scripts require an `admin` role or a valid `gv_admin_session` cookie [docs/CurrentState.md7-22](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L7-L22)
- **Cron Security**: Cron jobs (e.g., `codex-drain`) are protected by verifying the `x-vercel-cron-schedule` header or a bearer secret [docs/CurrentState.md27-32](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L27-L32)

##### Data Access Mapping

Title: Natural Language Space to Database Entities

```mermaid
flowchart TD
  N1["'My Profile'"]
  N2["'A Quick Thought'"]
  N3["'Billy's Knowledge'"]
  N4["'Training Run'"]
  E1["consciousness_profiles"]
  E2["bucket_drops"]
  E3["knowledge_fragments"]
  E4["embodiment_training_runs"]
  N1 --> E1
  N2 --> E2
  N3 --> E3
  N4 --> E4
```

Sources: [supabase/migrations/20260311162044\_new-migration.sql15-103](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260311162044_new-migration.sql#L15-L103) [docs/CurrentState.md59](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L59-L59)

#### Embodiment Profile Synchronization

The embodiment system uses a specialized script, `scripts/sync-embodiment-profiles.ts`, to bridge the local `.embodiment.json` files with the live Supabase database. This process includes:

1. **Normalization**: Ensuring `readiness_scores` are within the `0..1` range [docs/CurrentState.md51](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L51-L51)
2. **Upserting**: Pushing 24+ core profiles (e.g., `billy`, `art-teacher`) into the `embodiment_profiles` table [docs/CurrentState.md58-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L58-L60)
3. **Registry Generation**: Updating `shared/embodiment/generated.ts` to reflect the current database state [docs/CurrentState.md61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L61-L61)

Sources: [docs/CurrentState.md45-62](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L45-L62) [scripts/sync-embodiment-profiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts)

---

### Authentication & Session Management

> Source MHT: `Authentication & Session Management _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.2-authentication-and-session-management  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.env.example](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.env.example)
- [api/\_lib/auth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts)
- [api/\_lib/rateLimit.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/rateLimit.ts)
- [api/auth/session.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/auth/session.ts)
- [api/auth/supabase/magic-link.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/auth/supabase/magic-link.ts)
- [api/auth/supabase/session.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/auth/supabase/session.ts)
- [api/login.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/login.ts)
- [api/logout.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/logout.ts)
- [api/session/state.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/session/state.ts)
- [client/src/const.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/const.ts)
- [client/src/contexts/AuthContext.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/AuthContext.tsx)
- [client/src/features/agent-trainer/lib/authManager.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/authManager.ts)
- [client/src/lib/billing.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billing.ts)
- [client/src/lib/supabaseAuth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/supabaseAuth.ts)
- [client/src/pages/AuthCallback.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AuthCallback.tsx)
- [client/src/pages/SignIn.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SignIn.tsx)
- [client/src/pages/Signup.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Signup.tsx)
- [client/src/pages/Welcome.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Welcome.tsx)
- [client/src/tests/auth-redirect.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/auth-redirect.test.ts)
- [docs/ArchitecturalStructure.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ArchitecturalStructure.md?plain=1)
- [docs/VERCEL\_ENV\_CHECKLIST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/VERCEL_ENV_CHECKLIST.md?plain=1)
- [docs/wiki/03\_frontend-auth-routing.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/wiki/03_frontend-auth-routing.md?plain=1)
- [embodiment\_profiles/README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/README.md?plain=1)
- [middleware.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/middleware.ts)

</details>
GestaltView v2 employs a hybrid authentication architecture designed to bridge the gap between browser-native Supabase Auth and a secure, server-side session management system for administrative and high-tier operations. This system ensures cognitive justice by protecting user data while providing seamless access across the platform's five rooms.

#### Hybrid Authentication Architecture

The system operates on two primary layers:

1. **Browser Layer (Supabase Auth):** Handles Google OAuth, Magic Links, and Email/Password flows directly in the client [client/src/lib/supabaseAuth.ts28-34](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/supabaseAuth.ts#L28-L34)
2. **Server Layer (GV Admin Session):** A custom, HMAC-signed session cookie (`gv_admin_session`) that mirrors or upgrades the Supabase session for secure API access [api/\_lib/auth.ts6-12](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts#L6-L12)

##### Authentication Flow Diagram

This diagram illustrates the bridge between the client-side Supabase Auth and the server-side session synchronization.

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant S as Supabase Auth
  participant AC as AuthCallback.tsx
  participant SA as api/auth/supabase/session.ts
  participant C as gv_admin_session (Cookie)
  U->>S: Sign In (Google/Magic Link/Password)
  S-->>U: Return Session (JWT)
  U->>AC: Redirect to /auth/callback
  AC->>AC: establishBrowserSessionFromCallbackUrl()
  AC->>SA: syncBrowserSessionToAppCookie(accessToken)
  SA->>SA: createAuthSessionCookie()
  SA-->>C: Set HMAC-signed Cookie
  AC->>U: Redirect to /welcome
```

**Sources:** [client/src/pages/AuthCallback.tsx25-31](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AuthCallback.tsx#L25-L31) [client/src/lib/supabaseAuth.ts176-206](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/supabaseAuth.ts#L176-L206) [api/\_lib/auth.ts221-252](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts#L221-L252)

#### Tiered Verification & User Tiers

The system categorizes users into five distinct tiers, which dictate feature availability and rate limits [client/src/contexts/AuthContext.tsx11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/AuthContext.tsx#L11-L11)

| Tier | Description | Key Capabilities |
| --- | --- | --- |
| `anonymous` | Unauthenticated guest | Limited Billy queries (default: 2) [client/src/contexts/AuthContext.tsx75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/AuthContext.tsx#L75-L75) |
| `free` | Authenticated basic user | Access to live rooms, standard Billy [client/src/pages/Welcome.tsx36-42](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Welcome.tsx#L36-L42) |
| `core` | Paid personal tier | Unlimited Billy, PLK memory, Resume Rockstar [client/src/pages/Welcome.tsx15-21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Welcome.tsx#L15-L21) |
| `pro` | Advanced creative tier | SymbioCoder, Musical DNA, Diligence exports [client/src/pages/Welcome.tsx22-28](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Welcome.tsx#L22-L28) |
| `enterprise` | Organizational tier | White-label, custom PLK training [client/src/pages/Welcome.tsx29-35](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Welcome.tsx#L29-L35) |

##### getAuthUser() Logic

The server-side `getAuthUser()` function performs tiered verification:

1. **Cookie Check:** Attempts to verify the `gv_admin_session` cookie using `verifySessionToken()` [api/\_lib/auth.ts176-219](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts#L176-L219)
2. **Signature Validation:** Uses `SESSION_SECRET` and `crypto.timingSafeEqual` to prevent timing attacks and tampering [api/\_lib/auth.ts90-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts#L90-L96) [api/\_lib/auth.ts191-192](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts#L191-L192)
3. **Cache Fallback:** Utilizes `AUTH_PROFILE_CACHE` for performance during high-frequency requests.

#### Administrative Access Control

Administrative and Founder privileges are strictly controlled via environment-variable allowlists and specialized middleware.

##### Key Security Entities

| Entity | Code Reference | Purpose |
| --- | --- | --- |
| `isFounderAdminEmail` | `api/_lib/auth.ts:52-55` | Checks if email exists in `FOUNDER_ADMIN_EMAILS` env. |
| `requireAdmin` | `middleware.ts` | Intercepts requests to `/api/trainer/*` and `/api/session/dashboard`. |
| `verifyAdminPassword` | `api/_lib/auth.ts:135-162` | Verifies `ADMIN_PASSWORD_HASH` using `scrypt` or `pbkdf2`. |
| `createAdminSessionCookie` | `api/_lib/auth.ts:254-260` | Issues a cookie with `role: "admin"` and `tier: "enterprise"`. |

**Sources:** [api/\_lib/auth.ts47-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts#L47-L50) [api/\_lib/auth.ts137-142](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts#L137-L142) [api/\_lib/auth.ts224-225](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts#L224-L225)

#### Session State & Rate Limiting

The `AuthProvider` maintains a `PublicSessionState` for all users, including anonymous ones, to track usage metrics like `billyQueryCount` [client/src/contexts/AuthContext.tsx64-70](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/AuthContext.tsx#L64-L70)

##### Rate Limit Data Flow

The system tracks query counts via the `/api/session/state` endpoint [client/src/contexts/AuthContext.tsx112-128](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/AuthContext.tsx#L112-L128)

```mermaid
flowchart TD
  B["BillyLive.tsx"]
  AC["AuthContext.tsx"]
  PS["PublicSessionState"]
  AS["api_session_state"]
  RL["billyQueryCount Check"]
  DB["Supabase: app_users"]
  Allow["Allow Query"]
  Deny["isLimited: true"]
  B --> AC
  AC --> PS
  PS -->|fetch| AS
  AS --> RL
  RL --> DB
  RL -->|count < limit| Allow
  RL -->|count >= limit| Deny
```

**Sources:** [client/src/contexts/AuthContext.tsx138-142](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/AuthContext.tsx#L138-L142) [client/src/contexts/AuthContext.tsx72-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/AuthContext.tsx#L72-L78)

#### Implementation Details

##### The AuthCallback Bridge

The `AuthCallback` component acts as the critical synchronization point when a user returns from an OAuth provider or Magic Link.

1. **Token Extraction:** It reads PKCE `code` or implicit `access_token` from the URL [client/src/lib/supabaseAuth.ts44-61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/supabaseAuth.ts#L44-L61)
2. **Session Establishment:** Calls `establishBrowserSessionFromCallbackUrl()` to finalize the Supabase session [client/src/lib/supabaseAuth.ts63-93](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/supabaseAuth.ts#L63-L93)
3. **Cookie Sync:** Invokes `syncBrowserSessionToAppCookie()` which hits `/api/auth/supabase/session` to set the server-side `gv_admin_session` cookie [client/src/lib/supabaseAuth.ts176-206](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/supabaseAuth.ts#L176-L206)

##### Environment Variables

The system relies on several critical variables defined in `.env.example`:

- `SESSION_SECRET`: Used for signing the admin session HMAC [.env.example23](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.env.example#L23-L23)
- `FOUNDER_ADMIN_EMAILS`: Comma-separated list of emails with superuser access [.env.example19](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.env.example#L19-L19)
- `ADMIN_PASSWORD_HASH`: Scrypt/PBKDF2 hash for legacy admin password login [.env.example21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.env.example#L21-L21)
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: Public keys for browser-side Supabase SDK [.env.example27-28](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.env.example#L27-L28)

**Sources:** [client/src/pages/AuthCallback.tsx10-31](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AuthCallback.tsx#L10-L31) [docs/VERCEL\_ENV\_CHECKLIST.md40-51](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/VERCEL_ENV_CHECKLIST.md?plain=1#L40-L51)

---

### Vercel Deployment & Cron Jobs

> Source MHT: `Vercel Deployment & Cron Jobs _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.3-vercel-deployment-and-cron-jobs  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.vercelignore](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vercelignore)
- [api/\_\_tests\_\_/profile-portrait-drain.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-drain.test.ts)
- [api/\_lib/rateLimit.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/rateLimit.ts)
- [api/auth/supabase/magic-link.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/auth/supabase/magic-link.ts)
- [api/auth/supabase/session.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/auth/supabase/session.ts)
- [api/cron/codex-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts)
- [api/cron/profile-portrait-cadence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts)
- [api/cron/profile-portrait-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts)
- [api/cron/provenance-upgrade.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/provenance-upgrade.ts)
- [api/session/state.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/session/state.ts)
- [client/src/const.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/const.ts)
- [client/src/lib/billing.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billing.ts)
- [docs/VERCEL\_ENV\_CHECKLIST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/VERCEL_ENV_CHECKLIST.md?plain=1)
- [docs/wiki/03\_frontend-auth-routing.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/wiki/03_frontend-auth-routing.md?plain=1)
- [gestaltview\_supabase\_recreation\_package/supabase/schemadiff.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gestaltview_supabase_recreation_package/supabase/schemadiff.sql)
- [middleware.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/middleware.ts)
- [supabase/migrations/20260616000100\_identity\_subject\_human\_profiles.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260616000100_identity_subject_human_profiles.sql)
- [vercel.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json)

</details>
This page details the configuration and operational logic for the GestaltView v2 backend on Vercel. It covers the serverless function architecture, the routing layer, and the four critical cron-driven background processes that maintain the system's "metabolism"—draining job queues, upgrading provenance records, and maintaining consciousness profile portraits.

#### 1. Vercel Configuration (`vercel.json`)

The `vercel.json` file serves as the orchestration manifest for the deployment. It defines the build pipeline, the serverless function boundaries, and the HTTP rewrite rules that bridge the frontend SPA with the backend API.

##### 1.1 Function Includes and Rewrites

To maintain a lean deployment while ensuring all necessary dependencies are available to serverless handlers, the configuration uses `includeFiles` to bundle the shared library `api/_lib/**` with nearly every endpoint `vercel.json:L24-L82`.

The `rewrites` section handles two primary tasks:

1. **API Routing**: Maps clean REST-like paths (e.g., `/api/gate/orders/:id`) to specific internal handlers like `/api/gate/order?id=$1` `vercel.json:L83-L116`.
2. **SPA Fallback**: Ensures that any request not matching a static file or an API route is served by `index.html`, allowing client-side routing (Wouter) to take over `vercel.json:L120-L123`.

##### 1.2 Cron Schedule Definitions

The system defines four recurring jobs with specific cadences:

| Path | Schedule | Purpose |
| --- | --- | --- |
| `/api/cron/codex-drain` | `*/2 * * * *` | Processes pending artifact export jobs every 2 minutes. |
| `/api/cron/profile-portrait-drain` | `*/5 * * * *` | Generates AI portraits from user evidence every 5 minutes. |
| `/api/cron/profile-portrait-cadence` | `0 0 1 * *` | Monthly sweep to refresh user portraits. |
| `/api/cron/provenance-upgrade` | `0 */2 * * *` | Upgrades OpenTimestamps (OTS) receipts every 2 hours. |

**Sources:** `vercel.json:L6-L23`, `vercel.json:L83-L124`.

---

#### 2. Security & Idempotency Patterns

All cron handlers implement a shared security and reliability contract to prevent unauthorized execution and data corruption.

##### 2.1 `isAuthorizedCronRequest`

Handlers verify requests using the `isAuthorizedCronRequest` (or `isAuthorized`) helper. It checks for:

1. The `x-vercel-cron: 1` header sent by Vercel's internal scheduler `api/cron/codex-drain.ts:L44`.
2. A valid `Bearer` token matching the `CRON_SECRET` environment variable for manual triggers `api/cron/codex-drain.ts:L51`.
3. Bypass if `NODE_ENV` is not production (local development) `api/cron/codex-drain.ts:L53`.

##### 2.2 Claim-and-Process Pattern

To prevent race conditions where multiple function instances process the same job, the system uses a "claim" pattern via Supabase RPCs:

1. **Fetch & Lock**: The handler calls a stored procedure (e.g., `claim_codex_jobs` or `claim_portrait_queue_job`) that selects pending rows and atomically marks them as `running` `api/cron/codex-drain.ts:L59-L69`, `api/cron/profile-portrait-drain.ts:L111-L120`.
2. **Time-Bound Execution**: Handlers track their elapsed time against a `MAX_DURATION_MS` (usually 50s) to exit gracefully before Vercel's 60s timeout `api/cron/codex-drain.ts:L33`, `api/cron/profile-portrait-drain.ts:L22`.

**Sources:** `api/cron/codex-drain.ts:L43-L54`, `api/cron/profile-portrait-drain.ts:L100-L110`.

---

#### 3. The Four Cron Handlers

##### 3.1 Codex Drain (`codex-drain.ts`)

This job is the "fallback path" for the GenEngine. It finds `pending` rows in the `codex_jobs` table and invokes `runCodexExportJob()` `api/cron/codex-drain.ts:L5-L8`.

- **Data Flow**: Fetches artifact data → Renders HTML/JSON templates → Uploads to `CODEX_EXPORT_BUCKET` `api/cron/codex-drain.ts:L10-L14`.
- **Idempotency**: Storage uploads use `upsert: false` to ensure a second write fails rather than corrupting data `api/cron/codex-drain.ts:L16-L20`.

##### 3.2 Profile Portrait Drain (`profile-portrait-drain.ts`)

Processes the `portrait_inference_queue`. It is responsible for the transition from raw user signals (bucket drops, memory entries) to a structured "Consciousness Profile" `api/cron/profile-portrait-drain.ts:L1-L5`.

- **Threshold Check**: Only proceeds if the user has at least 15 total signals and at least 1 "Bucket Drop" `api/cron/profile-portrait-drain.ts:L170-L171`.
- **Inference**: Calls `loadProfilePortraitForUser` which uses the LLM to synthesize the portrait `api/cron/profile-portrait-drain.ts:L201-L207`.

##### 3.3 Profile Portrait Cadence (`profile-portrait-cadence.ts`)

A monthly maintenance job that identifies users whose latest portrait is older than the first of the current month `api/cron/profile-portrait-cadence.ts:L58-L60`. It enqueues a new inference job with priority 1 `api/cron/profile-portrait-cadence.ts:L91-L94`.

##### 3.4 Provenance Upgrade (`provenance-upgrade.ts`)

Ensures the long-term integrity of the "Diligence" system by upgrading OpenTimestamps receipts.

- **Logic**: Finds `provenance_envelopes` with `ots_status='pending'` older than 90 minutes `api/cron/provenance-upgrade.ts:L5-L7`.
- **Integration**: Attempts to upgrade the `.ots` file via Bitcoin block attestation by contacting OTS calendars (e.g., Alice, Bob, Finney) `api/cron/provenance-upgrade.ts:L18-L22`.
- **Outcome**: If successful, it updates the envelope with a `bitcoin_attestation` and sets the status to `upgraded` `api/cron/provenance-upgrade.ts:L180-L200`.

**Sources:** `api/cron/codex-drain.ts:L1-L27`, `api/cron/profile-portrait-drain.ts:L1-L42`, `api/cron/profile-portrait-cadence.ts:L1-L21`, `api/cron/provenance-upgrade.ts:L1-L11`.

---

#### 4. System Diagrams

##### Diagram 1: Natural Language to Cron Code Mapping

This diagram maps the high-level operational requirements to the specific code entities that implement them.

```mermaid
flowchart TD
  A["'Keep artifacts exported'"]
  B["'Update user portraits'"]
  C["'Verify data integrity'"]
  D["'Monthly maintenance'"]
  E["codex-drain.ts"]
  F["profile-portrait-drain.ts"]
  G["provenance-upgrade.ts"]
  H["profile-portrait-cadence.ts"]
  I["runCodexExportJob()"]
  J["loadProfilePortraitForUser()"]
  K["attemptOtsUpgrade()"]
  L["maybe_queue_portrait_cadence"]
  A --> E
  B --> F
  C --> G
  D --> H
  E --> I
  F --> J
  G --> K
  H --> L
```

**Sources:** `api/cron/codex-drain.ts:L30`, `api/cron/profile-portrait-drain.ts:L9`, `api/cron/provenance-upgrade.ts:L102`, `api/cron/profile-portrait-cadence.ts:L91`.

##### Diagram 2: Portrait Inference Data Flow

Visualizes the transition from user evidence to a persisted portrait artifact.

```mermaid
sequenceDiagram
  participant C as profile-portrait-drain.ts
  participant DB as Supabase (RPC/Tables)
  participant LLM as Inference Engine
  participant S as Storage
  C->>DB: claim_portrait_queue_job(jobId)
  DB-->>C: claimedJob
  C->>DB: get_portrait_signal_count(userId)
  DB-->>C: signalCounts (e.g. total_count >= 15)
  Note over DB: If threshold met
  C->>LLM: loadProfilePortraitForUser(userId, previousPortrait)
  LLM-->>C: newPortraitArtifact
  C->>DB: persistPortraitArtifact(portrait)
  C->>DB: updatePortraitQueueJob(status='completed')
```

**Sources:** `api/cron/profile-portrait-drain.ts:L111-L213`, `api/cron/profile-portrait-drain.ts:L164-L171`.

---

#### 5. Deployment Checklist Summary

The deployment relies on a specific set of environment variables to function. Missing variables will cause cron jobs to fail or degrade to "offline-fallback" modes.

| Variable Group | Key Variables | Impact of Absence |
| --- | --- | --- |
| **Persistence** | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` | Complete failure of all cron jobs (cannot claim or update jobs). |
| **Security** | `CRON_SECRET` | Manual triggers of cron endpoints will return 401 Unauthorized. |
| **AI/Inference** | `GOOGLE_API_KEY`, `OPENAI_API_KEY` | Portrait generation will fail or use deterministic placeholders. |
| **Provenance** | `STORAGE_BUCKET` | `provenance-upgrade` cannot download/upload receipts. |

**Sources:** `docs/VERCEL_ENV_CHECKLIST.md:L7-L26`, `api/cron/provenance-upgrade.ts:L24`.

---

### Supabase Edge Functions

> Source MHT: `Supabase Edge Functions _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.4-supabase-edge-functions  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.perplexity/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/CurrentState.md?plain=1)
- [.perplexity/REPO\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.json)
- [.perplexity/REPO\_MANIFEST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.md?plain=1)
- [.perplexity/SYNC\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md?plain=1)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07\_CURRENT\_STATE\_AND\_EVIDENCE/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md?plain=1)
- [client/src/lib/rendering/capture/domCapture.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/capture/domCapture.ts)
- [client/src/tests/dom-capture-export.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/dom-capture-export.test.ts)
- [context/This\_Is\_Who,\_What,\_Where,\_When,\_And\_How.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/context/This_Is_Who,_What,_Where,_When,_And_How.md?plain=1)
- [docs/20260420\_schema\_delta.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/20260420_schema_delta.md?plain=1)
- [docs/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1)
- [docs/DirectoryMapAndWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/DirectoryMapAndWorkflow.md?plain=1)
- [docs/GestaltView\_Platform\_Ground\_Truth.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/GestaltView_Platform_Ground_Truth.md?plain=1)
- [docs/gestaltview-v2.manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json)
- [docs/gestaltview-v2.manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1)
- [scripts/gestaltview\_crawler.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_crawler.py)
- [scripts/gestaltview\_manifest\_pipeline.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py)
- [supabase/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/config.toml)
- [supabase/functions/\_shared/auth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/auth.ts)
- [supabase/functions/\_shared/cors.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/cors.ts)
- [supabase/functions/\_shared/json.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/json.ts)
- [supabase/functions/\_shared/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/supabaseAdmin.ts)
- [supabase/migrations/20260413143526\_manifest\_pipeline\_schema\_enhancements.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260413143526_manifest_pipeline_schema_enhancements.sql)
- [supabase/migrations/20260417030218\_add\_ingested\_at\_and\_file\_modified\_to\_knowledge\_fragments.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260417030218_add_ingested_at_and_file_modified_to_knowledge_fragments.sql)
- [supabase/migrations/20260420150000\_human\_continuity\_schema.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260420150000_human_continuity_schema.sql)
- [supabase/migrations/20260501222005\_bucket\_drops\_promotion\_pipeline.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260501222005_bucket_drops_promotion_pipeline.sql)

</details>
Supabase Edge Functions in GestaltView v2 are Deno-based serverless functions used for high-frequency runtime event capture, batch data ingestion, and background maintenance tasks. These functions operate outside the main Vercel deployment to provide low-latency processing and direct interaction with the Supabase database and storage layers.

#### Shared Utilities (`_shared/`)

The Edge Functions rely on a set of shared utility modules located in the `supabase/functions/_shared/` directory to standardize authentication, response formatting, and database access.

| Utility | Purpose | Key Exports |
| --- | --- | --- |
| `auth.ts` | Validates JWTs and shared secrets. | `validateAuth`, `validateIngestSecret` |
| `cors.ts` | Handles Cross-Origin Resource Sharing. | `corsHeaders` |
| `json.ts` | Standardizes JSON responses. | `jsonResponse` |
| `supabaseAdmin.ts` | Provides a service-role Supabase client. | `createAdminClient` |

**Sources:** `docs/gestaltview-v2.manifest.md:24-40`, `docs/CurrentState.md:68-87`

#### Core Edge Functions

##### gsvw-capture-event

This function is the primary entry point for capturing runtime telemetry and user interaction events. It is designed to be called directly from the client application.

- **Authentication:** Requires a valid project JWT or service-role authorization path [docs/CurrentState.md77-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L77-L78)
- **Data Flow:** Receives event payloads and writes them directly to the `gsvw_runtime_capture_events` table [docs/CurrentState.md83-86](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L83-L86)

##### gsvw-ingest-batch

Handles the bulk ingestion of documents and knowledge fragments. This function is typically invoked by the `gestaltview_manifest_pipeline.py` or GitHub Actions during corpus updates.

- **Security:** Protected by the `GESTALTVIEW_INGEST_SECRET` environment variable [docs/CurrentState.md73-76](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L73-L76)
- **Operation:** Supports a `dry_run` mode to simulate document writes without committing to the database [docs/CurrentState.md85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L85-L85)

##### gsvw-dormancy-review

A maintenance function that identifies inactive or "dormant" profiles and artifacts based on the Constitutional Invariants regarding data preservation.

- **Logic:** Scans for candidates that meet dormancy criteria and logs them for review [docs/CurrentState.md84](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L84-L84)

##### gsvw-runtime-health

Provides a diagnostic snapshot of the Supabase infrastructure, including live table counts and vector index status.

- **Output:** Returns `ok: true` and a snapshot of system health, including row counts for capture events [docs/CurrentState.md83](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1#L83-L83)

##### corpus-harvest-worker

Automates the harvesting of new data from the `knowledge_fragments` and `skill_fragments` tables to ensure the Digital Intelligence (DI) has the most recent context.

**Sources:** `docs/CurrentState.md:68-100`, `docs/gestaltview-v2.manifest.json:80-97`

#### System Integration Diagram

The following diagram illustrates how Edge Functions bridge the gap between the Client Space and the Database Space.

##### Data Ingestion and Event Capture Flow

```mermaid
flowchart TD
  A["CaptureOrb / Client UI"]
  B["gsvw-capture-event"]
  E["GitHub Actions / ingest_corpus.py"]
  C["gsvw-ingest-batch"]
  D["_shared/auth.ts"]
  F["_shared/supabaseAdmin.ts"]
  G["gsvw_runtime_capture_events"]
  H["knowledge_fragments"]
  I["skill_fragments"]
  A -->|POST /functions/v1/gsvw-capture-event| B
  E -->|POST /functions/v1/gsvw-ingest-batch| C
  B --> D
  C --> D
  B --> F
  C --> F
  F --> G
  F --> H
  F --> I
```

**Sources:** `docs/CurrentState.md:73-87`, `supabase/migrations/20260420150000_human_continuity_schema.sql:10-34`

#### Deployment and Security Configuration

Edge Functions are deployed using the Supabase CLI. The security model distinguishes between client-facing and operator-only functions.

| Function | JWT Verification | Secret Requirement |
| --- | --- | --- |
| `gsvw-capture-event` | Enabled | Project JWT |
| `gsvw-ingest-batch` | Disabled (`--no-verify-jwt`) | `GESTALTVIEW_INGEST_SECRET` |
| `gsvw-runtime-health` | Disabled (`--no-verify-jwt`) | `GESTALTVIEW_INGEST_SECRET` |
| `gsvw-dormancy-review` | Disabled (`--no-verify-jwt`) | `GESTALTVIEW_INGEST_SECRET` |

##### Code Entity Association

The following diagram maps the logical system names to their specific file entities in the codebase.

```mermaid
classDiagram
  class SharedUtilities {
    +cors.ts: corsHeaders
    +auth.ts: validateAuth()
    +json.ts: jsonResponse()
    +supabaseAdmin.ts: createAdminClient()
  }
  class IngestionPipeline {
    +gsvw-ingest-batch: index.ts
    +corpus-harvest-worker: index.ts
    +gestaltview_manifest_pipeline.py
  }
  class TelemetrySystem {
    +gsvw-capture-event: index.ts
    +gsvw-runtime-health: index.ts
  }
  IngestionPipeline ..> SharedUtilities : imports
  TelemetrySystem ..> SharedUtilities : imports
```

**Sources:** `docs/CurrentState.md:93-100`, `docs/gestaltview-v2.manifest.md:24-40`

---

### Prisma ORM & Data Access Layer

> Source MHT: `Prisma ORM & Data Access Layer _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/7.5-prisma-orm-and-data-access-layer  \
Mermaid diagrams restored: 1

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/documents.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/documents.test.ts)
- [api/\_\_tests\_\_/workspaces.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/workspaces.test.ts)
- [api/\_lib/supabase.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/supabase.ts)
- [api/documents/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/documents/index.ts)
- [api/workspaces/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/workspaces/index.ts)
- [client/src/components/workspaces-interface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/workspaces-interface.tsx)
- [client/src/lib/sentry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sentry.ts)
- [client/src/pages/DocumentsPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DocumentsPage.tsx)
- [client/src/pages/WorkspacesPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/WorkspacesPage.tsx)
- [context/This\_Is\_Who,\_What,\_Where,\_When,\_And\_How.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/context/This_Is_Who,_What,_Where,_When,_And_How.md?plain=1)
- [docs/20260420\_schema\_delta.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/20260420_schema_delta.md?plain=1)
- [docs/DirectoryMapAndWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/DirectoryMapAndWorkflow.md?plain=1)
- [docs/GestaltView\_Platform\_Ground\_Truth.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/GestaltView_Platform_Ground_Truth.md?plain=1)
- [docs/SentrySetup.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SentrySetup.md?plain=1)
- [package-lock.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package-lock.json)
- [package.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json)
- [pnpm-lock.yaml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/pnpm-lock.yaml)
- [supabase/migrations/20260413143526\_manifest\_pipeline\_schema\_enhancements.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260413143526_manifest_pipeline_schema_enhancements.sql)
- [supabase/migrations/20260417030218\_add\_ingested\_at\_and\_file\_modified\_to\_knowledge\_fragments.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260417030218_add_ingested_at_and_file_modified_to_knowledge_fragments.sql)
- [supabase/migrations/20260420150000\_human\_continuity\_schema.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260420150000_human_continuity_schema.sql)
- [supabase/migrations/20260501222005\_bucket\_drops\_promotion\_pipeline.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260501222005_bucket_drops_promotion_pipeline.sql)

</details>
The Data Access Layer (DAL) in GestaltView v2 provides a structured, type-safe interface for interacting with the Supabase PostgreSQL backend. While the system utilizes a hybrid approach—combining direct Supabase REST/RPC calls for edge functions and real-time features—the **Prisma ORM** serves as the primary tool for schema management, migrations, and complex relational queries within the Node.js/Vercel serverless environment.

#### Architecture & Client Initialization

The application uses the `@prisma/client` package to interact with the database. The client is initialized in a centralized location to ensure connection pooling efficiency and type consistency across the API routes.

##### Database Client (`db.ts`)

The `db.ts` client is the singleton entry point for all Prisma operations. It leverages the `DATABASE_URL` environment variable for connectivity. During development and CI, the `prisma:verify` script is used to ensure the live database schema matches the expectations of the Prisma client by executing a SQL check against specific columns.

##### Hybrid Coexistence

GestaltView employs a "Two-Path" data strategy:

1. **Prisma Path:** Used for structured business logic, identity management, and relational mutations (e.g., `AppUsers`, `Workspaces`).
2. **Supabase REST Path:** Used in `api/_lib/supabase.ts` for zero-dependency interactions, specialized vector searches (using the `vector` extension), and high-throughput ingestion pipelines.

##### Data Flow Diagram: Multi-Path Access

This diagram illustrates how the system routes requests through Prisma versus the direct Supabase client.

"Data Access Flow"

**Sources:** `package.json:41-41` (), `api/_lib/supabase.ts:1-21` (), `package.json:61-66` ()

---

#### Prisma Schema & Core Models

The `schema.prisma` file defines the source of truth for the application's data structures. It is organized into domain groups that reflect the "Five-Room" architecture and the Digital Intelligence (DI) governance model.

##### Key Models

| Model | Domain | Description |
| --- | --- | --- |
| `AppUsers` | Identity | Extends `auth.users` with tiers (`free`, `core`, `pro`, `enterprise`) and admin flags. |
| `ConsciousnessProfiles` | DI Runtime | Stores snapshots of a user's consciousness state and source manifests. |
| `BucketDrops` | Capture | Zero-friction capture records, including raw text, intensity, and PLK resonance. |
| `Workspaces` | Collaboration | Logical containers for documents and shared cognitive surfaces. |
| `MemoryEntries` | Continuity | Persistent memory fragments with emotional valence and provenance tracking. |

##### Model Association Diagram

This diagram maps the high-level system concepts to the specific Prisma models and database entities.

"Natural Language to Code Entity Mapping"

**Sources:** `api/_lib/supabase.ts:206-223` (), `api/_lib/supabase.ts:260-271` (), `docs/20260420_schema_delta.md:28-50` (), `client/src/components/workspaces-interface.tsx:13-21` ()

---

#### Migration Structure & SQL Integration

Migrations are managed via the `prisma/migrations/` directory, following a strict "Migration Spine" protocol.

##### Migration Lifecycle

1. **Deployment:** Handled via `prisma migrate deploy` in CI/CD pipelines.
2. **Manual Overrides:** The system frequently uses raw SQL migrations (e.g., `20260420150000_human_continuity_schema.sql`) to handle PostgreSQL-specific features that Prisma may not fully support, such as the `vector` extension, `pg_trgm`, and complex Row Level Security (RLS) policies.
3. **Verification:** The `prisma:verify` script executes `prisma/verification/verify_expected_columns.sql` to ensure the underlying Supabase tables haven't drifted from the expected application schema.

##### Schema Deltas

Recent schema evolutions have focused on the "Human Continuity" layer, adding specialized tables for:

- `human_identity_profiles`
- `human_cognition_profiles`
- `human_memory_records`
- `context_injection_rules`

**Sources:** `package.json:37-41` (), `supabase/migrations/20260420150000_human_continuity_schema.sql:10-12` (), `docs/20260420_schema_delta.md:8-24` ()

---

#### Data Access Patterns

##### Type-Safe Ingestion

The ingestion pipeline uses `MemoryEntryUpsert` and `MemoryEntryUpdate` interfaces to ensure that data entering the system via the `ingest_corpus.py` script or Edge Functions adheres to the required structure, including `content_hash` for deduplication and `importance` for retrieval ranking.

##### Workspace & Document Management

Workspace operations are encapsulated in the `WorkspacesInterface`, which handles the synchronization between local browser state (`localStorage`) and the remote Supabase/Prisma store.

"Workspace Persistence Pattern"

```mermaid
sequenceDiagram
  participant UI as WorkspacesInterface
  participant API as /api/workspaces
  participant DB as Prisma/PostgreSQL
  UI->>UI: readLocalWorkspaces()
  UI->>API: GET /api/workspaces
  API->>DB: prisma.workspaces.findMany()
  DB-->>API: Result
  API-->>UI: Workspace[]
  UI->>UI: writeLocalWorkspaces()
```

##### Seeding

The system provides two seeding mechanisms:

1. **Prisma Seed:** `node --import tsx prisma/seed.ts` for structural application data.
2. **Knowledge Seed:** `python3 scripts/seed_billy_knowledge.py` for populating the vector store with the core Billy personality and knowledge fragments.

**Sources:** `api/_lib/supabase.ts:120-152` (), `client/src/components/workspaces-interface.tsx:31-46` (), `package.json:35-36` ()

---

## Volume: Memory, Inner World & Capture Routing

### Inner World & Memory Persistence

> Source MHT: `Inner World & Memory Persistence _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8-inner-world-and-memory-persistence  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_lib/inner-world.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts)
- [api/inner-world/artifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts)
- [client/src/components/capture/UniversalCaptureBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/capture/UniversalCaptureBar.tsx)
- [client/src/components/inner-world/InnerWorldArtifact.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifact.tsx)
- [client/src/components/inner-world/InnerWorldArtifactGallery.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx)
- [client/src/components/inner-world/InnerWorldInspector.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldInspector.tsx)
- [client/src/components/inner-world/InnerWorldRoom.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldRoom.tsx)
- [client/src/lib/blackboardRecapArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts)
- [client/src/lib/captureRouting.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/captureRouting.ts)
- [client/src/lib/creationCornerArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/creationCornerArtifacts.ts)
- [client/src/lib/innerWorldFiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts)
- [client/src/lib/scaffoldStorage.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/scaffoldStorage.ts)
- [client/src/tests/blackboard-recap-artifacts.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/blackboard-recap-artifacts.test.ts)
- [client/src/tests/inner-world-files.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/inner-world-files.test.ts)
- [docs/ROOM\_DEFINITIONS.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1)
- [supabase/migrations/20260625174800\_widen\_inner\_world\_artifacts\_status.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260625174800_widen_inner_world_artifacts_status.sql)

</details>
The **Dynamic Inner World** (also known as the "Museum of You") is the primary space for reflection, synthesis, and long-term memory visualization in GestaltView [docs/ROOM\_DEFINITIONS.md32](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L32-L32) It represents the third mode of being: **Distilled / Reflective** [docs/ROOM\_DEFINITIONS.md16](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L16-L16) Unlike the Blackboard Room (active work) or the External Scaffold (structural accumulation), the Inner World focuses on what the accumulated data *means* [docs/ROOM\_DEFINITIONS.md19-21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L19-L21)

#### System Overview & Causal Flow

The Inner World operates at the end of the system's causal pipeline. Active work performed in other rooms emits events to the Scaffold, which the Inner World then reads to synthesize museum-grade exhibits [docs/ROOM\_DEFINITIONS.md18-22](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L18-L22)

##### Causal Pipeline Diagram

```mermaid
flowchart TD
  A["BlackboardRoomPage"]
  B["InnerWorldArtifact"]
  C["ExternalScaffoldPage"]
  D["Dynamic Inner World"]
  E["innerWorldFiles.ts"]
  F["api/inner-world/artifacts.ts"]
  G["Supabase: inner_world_artifacts"]
  A -->|Session Recap| B
  A -->|Node Events| C
  C -->|Synthesis Source| D
  B -->|Exhibit| D
  D -->|localStorage| E
  E -->|Sync| F
  F -->|Upsert| G
```

Sources: [docs/ROOM\_DEFINITIONS.md18-22](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L18-L22) [client/src/lib/innerWorldFiles.ts86-90](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L86-L90) [api/inner-world/artifacts.ts87-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L87-L106)

#### InnerWorldArtifact Lifecycle

An `InnerWorldArtifact` is a self-contained interactive object (typically HTML) that serves as a "first-class museum object" [docs/ROOM\_DEFINITIONS.md69](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L69-L69)

| Status | Description |
| --- | --- |
| `queued` | Initial state for session recaps; hidden from the main museum until published [client/src/lib/blackboardRecapArtifacts.ts48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts#L48-L48) |
| `rendering` | The artifact is being synthesized by the Gen Engine [client/src/lib/innerWorldFiles.ts28](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L28-L28) |
| `ready` | Default visible state for artifacts in the gallery [client/src/lib/innerWorldFiles.ts252-253](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L252-L253) |
| `archived` | Removed from the active museum view [client/src/lib/innerWorldFiles.ts33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L33-L33) |

Artifacts are defined by the `InnerWorldArtifactRecord` type [client/src/lib/innerWorldFiles.ts35-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L35-L50) They are rendered using the `HtmlArtifactRenderer` which utilizes an iframe-based sandbox for security and visual isolation [client/src/components/inner-world/InnerWorldArtifactGallery.tsx5](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx#L5-L5) [client/src/components/inner-world/InnerWorldArtifactGallery.tsx97-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx#L97-L106)

For details on the 3D spatial distribution and the "Golden Angle" algorithm, see [Inner World Artifact Gallery & Spatial Renderer](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8.1-inner-world-artifact-gallery-and-spatial-renderer).

#### File Management & Persistence

The system employs a multi-stage persistence pipeline to ensure memory continuity.

1. **Local State**: Managed via `innerWorldFiles.ts`, utilizing `localStorage` keys like `gestaltview.innerWorldArtifacts.v1` [client/src/lib/innerWorldFiles.ts88](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L88-L88)
2. **Tombstoning**: To prevent deleted items from being resurrected during server merges, a `DELETED_ARTIFACT_IDS_KEY` stores "tombstones" of permanently removed IDs [client/src/lib/innerWorldFiles.ts96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L96-L96)
3. **Remote Persistence**: The `api/inner-world/artifacts.ts` handler manages CRUD operations against the Supabase `inner_world_artifacts` table [api/inner-world/artifacts.ts40-41](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L40-L41)
4. **Binary Storage**: Files (PDFs, Images, Audio) are stored in Supabase Storage buckets via the `uploadInnerWorldFileObject` utility [api/\_lib/inner-world.ts110-133](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L110-L133)

For details on file kind detection and signed URL generation, see [File Management & Storage](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8.2-file-management-and-storage).

#### Session Recap System

The **Session Recap** is a specialized synthesis process triggered within the Blackboard Room [docs/ROOM\_DEFINITIONS.md68](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L68-L68)

##### Recap Generation Logic

```mermaid
sequenceDiagram
  participant User as User
  participant SRG as SessionRecapGenerator
  participant LLM as llmRouter.ts
  participant IWF as innerWorldFiles.ts
  participant DB as Supabase
  User->>SRG: Trigger Recap
  SRG->>LLM: Request HTML Synthesis (Voice Selection)
  LLM-->>SRG: Self-contained HTML Artifact
  SRG->>IWF: buildBlackboardRecapInnerWorldArtifact()
  IWF->>DB: POST /api/inner-world/artifacts (status: queued)
  Note over DB: Artifact stored as museum exhibit
```

Sources: [docs/ROOM\_DEFINITIONS.md69-70](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L69-L70) [client/src/lib/blackboardRecapArtifacts.ts17-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts#L17-L50)

The `SessionRecapGenerator` produces artifacts with a "Neural Aurora" aesthetic, requiring four sections: *What we built*, *What emerged*, *What's still in motion*, and *Worth holding* [docs/ROOM\_DEFINITIONS.md77](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L77-L77)

For details on the `UniversalCaptureBar` and capture routing, see [Session Recap & Capture Routing](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8.3-session-recap-and-capture-routing).

#### Child Pages

- [Inner World Artifact Gallery & Spatial Renderer](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8.1-inner-world-artifact-gallery-and-spatial-renderer) — Details on the `DynamicWorldSpaceRenderer`, `ExhibitPod`, and spatial distribution.
- [File Management & Storage](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8.2-file-management-and-storage) — Technical deep dive into `innerWorldFiles.ts`, Supabase Storage integration, and the merge loop.
- [Session Recap & Capture Routing](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8.3-session-recap-and-capture-routing) — In-depth look at the `SessionRecapGenerator`, `captureRouting.ts`, and the `Bucket Drop` mechanism.

Sources:

- [docs/ROOM\_DEFINITIONS.md1-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L1-L120)
- [client/src/lib/innerWorldFiles.ts1-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L1-L115)
- [api/inner-world/artifacts.ts1-121](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L1-L121)
- [client/src/lib/blackboardRecapArtifacts.ts1-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts#L1-L60)
- [api/\_lib/inner-world.ts1-189](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L1-L189)
- [client/src/components/inner-world/InnerWorldArtifactGallery.tsx1-108](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx#L1-L108)

---

### Inner World Artifact Gallery & Spatial Renderer

> Source MHT: `Inner World Artifact Gallery & Spatial Renderer _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8.1-inner-world-artifact-gallery-and-spatial-renderer  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [DYNAMIC\_INNER\_WORLD\_MUSEUM\_HALL\_IMPLEMENTATION.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/DYNAMIC_INNER_WORLD_MUSEUM_HALL_IMPLEMENTATION.md?plain=1)
- [api/\_\_tests\_\_/codex-export-retrieval.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-export-retrieval.test.ts)
- [api/\_lib/inner-world.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts)
- [api/codex/artifacts/[artifactId]/exports/[format].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/exports/%5Bformat%5D.ts)
- [api/inner-world/artifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts)
- [client/src/components/ArtifactExpandView.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactExpandView.tsx)
- [client/src/components/capture/UniversalCaptureBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/capture/UniversalCaptureBar.tsx)
- [client/src/components/inner-world/InnerWorldArtifact.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifact.tsx)
- [client/src/components/inner-world/InnerWorldArtifactGallery.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx)
- [client/src/components/inner-world/InnerWorldInspector.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldInspector.tsx)
- [client/src/components/inner-world/InnerWorldRoom.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldRoom.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/buildWorldPlan.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/buildWorldPlan.ts)
- [client/src/features/dynamic-inner-world/world-renderer/components/ArchiveVault.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ArchiveVault.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/ArtifactConstellation.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ArtifactConstellation.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/CuratorConsole.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/CuratorConsole.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/EmptyHallState.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/EmptyHallState.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/ExhibitPod.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ExhibitPod.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/ResonanceRail.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ResonanceRail.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/SearchControlDeck.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/SearchControlDeck.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/WorldAtrium.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/WorldAtrium.tsx)
- [client/src/features/dynamic-inner-world/world-renderer/components/WorldStatsRibbon.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/WorldStatsRibbon.tsx)
- [client/src/lib/blackboardRecapArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts)
- [client/src/lib/captureRouting.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/captureRouting.ts)
- [client/src/lib/creationCornerArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/creationCornerArtifacts.ts)
- [client/src/lib/innerWorldFiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts)
- [client/src/lib/rendering/ArtifactExportViewer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/ArtifactExportViewer.tsx)
- [client/src/lib/rendering/artifactExport.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/artifactExport.ts)
- [client/src/lib/rendering/hooks/useArtifactExport.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/hooks/useArtifactExport.ts)
- [client/src/lib/rendering/hooks/useIframeResize.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/hooks/useIframeResize.ts)
- [client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx)
- [client/src/lib/scaffoldStorage.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/scaffoldStorage.ts)
- [client/src/tests/artifact-export-viewer.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/artifact-export-viewer.test.ts)
- [client/src/tests/blackboard-recap-artifacts.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/blackboard-recap-artifacts.test.ts)
- [client/src/tests/inner-world-files.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/inner-world-files.test.ts)
- [docs/ROOM\_DEFINITIONS.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1)
- [shared/codex/storage.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/storage.ts)
- [supabase/migrations/20260625174800\_widen\_inner\_world\_artifacts\_status.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260625174800_widen_inner_world_artifacts_status.sql)

</details>
The **Dynamic Inner World** (Museum of You) serves as the system's distilled, reflective mode. It synthesizes active work and accumulated structural data into high-fidelity, interactive exhibits. Unlike the raw capture of the Blackboard Room or the structural map of the External Scaffold, the Inner World focuses on **curated presentation** and **long-term resonance** [docs/ROOM\_DEFINITIONS.md8-21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L8-L21)

#### Spatial Rendering Architecture

The Inner World utilizes a spatial rendering pipeline that transitions between 2D gallery views and a 3D "Museum Hall" experience. The `DynamicWorldSpaceRenderer` serves as the primary orchestrator for this environment [client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx53-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx#L53-L78)

##### The World Plan & Golden Angle Distribution

Spatial layout is governed by `buildWorldPlan`, which transforms raw artifact data into a geometric arrangement for the 3D stage [client/src/features/dynamic-inner-world/world-renderer/buildWorldPlan.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/buildWorldPlan.ts)

To prevent visual overlap and create a natural "constellation" effect, the system employs a **Golden Angle distribution algorithm**. This ensures that artifacts (Exhibits) are spaced according to phyllotaxis patterns, maximizing aesthetic density without clutter.

##### Rendering Components

| Component | Role | Source |
| --- | --- | --- |
| `DynamicWorldSpaceRenderer` | Main container, handles keyboard navigation and view state. | [client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx53-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx#L53-L78) |
| `ThreeMuseumBackdrop` | Renders the WebGL/Three.js environment including the "Neural Aurora" skybox. | [client/src/features/dynamic-inner-world/world-renderer/three/ThreeMuseumBackdrop.tsx9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/three/ThreeMuseumBackdrop.tsx#L9-L9) |
| `ExhibitPod` | The spatial container for an individual artifact within the 3D hall. | [client/src/features/dynamic-inner-world/world-renderer/components/ExhibitPod.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ExhibitPod.tsx) |
| `WorldAtrium` | The central entry point of the spatial map. | [client/src/features/dynamic-inner-world/world-renderer/components/WorldAtrium.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/WorldAtrium.tsx) |
| `ArchiveVault` | A specialized zone for artifacts with `archived` status. | [client/src/features/dynamic-inner-world/world-renderer/components/ArchiveVault.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ArchiveVault.tsx) |
| `ArtifactConstellation` | Manages the clusters of `InnerWorldArtifactRecord` nodes. | [client/src/features/dynamic-inner-world/world-renderer/components/ArtifactConstellation.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ArtifactConstellation.tsx) |

**Sources:** [client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx1-179](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx#L1-L179) [docs/ROOM\_DEFINITIONS.md120-135](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L120-L135)

---

#### Artifact Pipeline: From Capture to Exhibit

Artifacts enter the Inner World through a defined lifecycle, often originating as **Session Recaps** from the Blackboard Room [docs/ROOM\_DEFINITIONS.md68-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1#L68-L78)

##### Data Flow: Natural Language to Code Entities

The following diagram bridges the conceptual "Museum Exhibit" to the underlying code structures and API handlers.

**Inner World Data Flow**

```mermaid
flowchart TD
  A["User Input / Session"]
  B["RecapArtifact"]
  C["InnerWorldArtifactRecord"]
  D["Supabase: inner_world_artifacts"]
  E["DynamicWorldSpaceRenderer"]
  F["WorldPlan Nodes"]
  G["ExhibitPod / HtmlArtifactRenderer"]
  A -->|SessionRecapGenerator| B
  B -->|buildBlackboardRecapInnerWorldArtifact| C
  C -->|status: 'queued'| D
  D -->|fetch /api/inner-world/artifacts| E
  E -->|buildWorldPlan| F
  F -->|renderWorldNode| G
```

**Sources:** [client/src/lib/blackboardRecapArtifacts.ts17-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts#L17-L50) [api/inner-world/artifacts.ts87-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L87-L106) [client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx80-93](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx#L80-L93)

##### Artifact Schema

The `InnerWorldArtifactRecord` is the core data contract for the gallery [client/src/lib/innerWorldFiles.ts35-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L35-L50):

- `id`: Unique identifier (often prefixed `gv-`).
- `html`: The full self-contained HTML content of the artifact.
- `evidenceNodeIds`: UUIDs of the raw Scaffold nodes that informed this synthesis.
- `status`: `queued`, `rendering`, `ready`, `failed`, `draft`, `active`, or `archived`.
- `originRoom`: Tracks whether the artifact came from `blackboard`, `creation_corner`, etc.

---

#### Rendering & Interaction

##### HtmlArtifactRenderer

The `HtmlArtifactRenderer` is an iframe-based component used to safely render untrusted or complex HTML artifacts [client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/renderers/HtmlArtifactRenderer.tsx) It is used both in the 2D `InnerWorldArtifactGallery` [client/src/components/inner-world/InnerWorldArtifactGallery.tsx97-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx#L97-L105) and the full-screen `ArtifactExpandView` [client/src/components/ArtifactExpandView.tsx150-157](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ArtifactExpandView.tsx#L150-L157)

##### Curator Console & Evidence Connections

The `CuratorConsole` provides the UI for managing the museum state, while **Evidence Connections** allow users to discover the relationship between a synthesized artifact and its source data [client/src/features/dynamic-inner-world/world-renderer/components/CuratorConsole.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/CuratorConsole.tsx)

- **ResonanceRail**: A UI element that visualizes "links" between artifacts based on shared tags or PLK (Private Language Key) resonance [client/src/features/dynamic-inner-world/world-renderer/components/ResonanceRail.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/dynamic-inner-world/world-renderer/components/ResonanceRail.tsx)
- **Discovery**: Users can click "Inspect" to view the `evidenceNodeIds` in the `InnerWorldInspector` [client/src/components/inner-world/InnerWorldInspector.tsx13-19](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldInspector.tsx#L13-L19)

---

#### Persistence & Storage

Inner World data is persisted via a multi-stage pipeline to ensure low latency and durability.

**Persistence Logic Association**

```mermaid
flowchart TD
  LocalStorage["window.localStorage"]
  UI["InnerWorldRoom.tsx"]
  API["/api/inner-world/artifacts"]
  SupaDB["Supabase: inner_world_artifacts"]
  SupaStore["Supabase Storage: user-files/"]
  UI --> LocalStorage
  UI -->|upsert| API
  API -->|Prisma/Supabase Client| SupaDB
  API -->|uploadInnerWorldFileObject| SupaStore
```

**Sources:** [client/src/lib/innerWorldFiles.ts134-144](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L134-L144) [api/inner-world/artifacts.ts87-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L87-L106) [api/\_lib/inner-world.ts110-133](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L110-L133)

##### Key Persistence Functions

- `appendInnerWorldArtifact`: Adds a record to local storage and triggers a sync event [client/src/lib/innerWorldFiles.ts257-260](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L257-L260)
- `uploadInnerWorldFileObject`: Handles the transfer of binary assets or large HTML blobs to Supabase Storage [api/\_lib/inner-world.ts110-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L110-L115)
- `createInnerWorldSignedUrl`: Generates time-limited access tokens for private artifact assets [api/\_lib/inner-world.ts145-155](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L145-L155)
- **Tombstone Mechanism**: The system uses `DELETED_ARTIFACT_IDS_KEY` in local storage to prevent the server-merge loop from resurrecting deleted artifacts [client/src/lib/innerWorldFiles.ts94-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L94-L96)

**Sources:** [client/src/lib/innerWorldFiles.ts1-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L1-L115) [api/inner-world/artifacts.ts36-54](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L36-L54) [api/\_lib/inner-world.ts1-155](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L1-L155)

---

### File Management & Storage

> Source MHT: `File Management & Storage _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8.2-file-management-and-storage  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/sanctuary.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/sanctuary.test.ts)
- [api/\_lib/inner-world.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts)
- [api/creation-corner/blueprints.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/blueprints.ts)
- [api/inner-world/artifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts)
- [api/inner-world/artifacts/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/inner-world/artifacts/%5Bid%5D.ts)
- [api/inner-world/files.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/files.ts)
- [api/inner-world/files/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/inner-world/files/%5Bid%5D.ts)
- [api/inner-world/files/[id]/share.ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/inner-world/files/%5Bid%5D/share.ts)
- [api/insights.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/insights.ts)
- [api/sanctuary/journal.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sanctuary/journal.ts)
- [api/sanctuary/journals.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sanctuary/journals.ts)
- [api/sanctuary/scrapbook.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sanctuary/scrapbook.ts)
- [client/src/components/FileExplorer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FileExplorer.tsx)
- [client/src/components/JournalEditor.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/JournalEditor.tsx)
- [client/src/components/files/FileExplorer.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/files/FileExplorer.tsx)
- [client/src/components/files/FilePreviewPane.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/files/FilePreviewPane.tsx)
- [client/src/components/files/FileUploadDropzone.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/files/FileUploadDropzone.tsx)
- [client/src/components/inner-world/InnerWorldArtifactGallery.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx)
- [client/src/lib/blackboardRecapArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts)
- [client/src/lib/constants.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/constants.ts)
- [client/src/lib/creationCornerArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/creationCornerArtifacts.ts)
- [client/src/lib/fileStorage.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/fileStorage.ts)
- [client/src/lib/innerWorldFiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts)
- [client/src/lib/sanctuaryContent.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sanctuaryContent.ts)
- [client/src/tests/blackboard-recap-artifacts.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/blackboard-recap-artifacts.test.ts)
- [client/src/tests/inner-world-files.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/inner-world-files.test.ts)
- [docs/ROOM\_DEFINITIONS.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1)
- [supabase/migrations/20260515134500\_manhattan\_mornings\_inner\_world\_schema.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260515134500_manhattan_mornings_inner_world_schema.sql)
- [supabase/migrations/20260526001000\_add\_sanctuary\_source\_refs.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260526001000_add_sanctuary_source_refs.sql)
- [supabase/migrations/20260625174800\_widen\_inner\_world\_artifacts\_status.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260625174800_widen_inner_world_artifacts_status.sql)

</details>
The File Management & Storage subsystem handles the persistence, retrieval, and transformation of user-generated content and Digital Intelligence (DI) outputs. It facilitates a multi-stage persistence pipeline that bridges volatile client-side state with permanent cloud storage.

#### Multi-Stage Persistence Pipeline

GestaltView utilizes a tiered storage strategy to ensure high availability and offline resilience while maintaining a centralized source of truth.

1. **LocalStorage (Volatile/Immediate):** Initial capture and local caching of `UserFileRecord` and `InnerWorldArtifactRecord` occur in the browser's `localStorage` [client/src/lib/innerWorldFiles.ts117-144](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L117-L144)
2. **Vercel Serverless (Intermediary):** API endpoints in `api/inner-world/*` act as the gateway, handling authentication via `requireAuth` [api/inner-world/artifacts.ts28-32](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L28-L32) and data normalization.
3. **Supabase Storage & PostgreSQL (Permanent):**
   - **Binary Data:** Files (images, PDFs, audio) are stored in the `user-files` Supabase bucket [api/\_lib/inner-world.ts42-44](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L42-L44)
   - **Metadata & HTML:** Structured data and rendered artifact HTML are stored in the `inner_world_artifacts` and `user_files` PostgreSQL tables [api/inner-world/artifacts.ts87-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L87-L106)

##### Data Flow: File Upload to Persistence

The following diagram illustrates the flow from a user action to permanent storage.

**File Ingestion & Storage Flow**

```mermaid
sequenceDiagram
  participant U as User / UI
  participant IWF as innerWorldFiles.ts
  participant API as api/inner-world/files
  participant S3 as Supabase Storage (user-files)
  participant DB as Supabase DB (user_files)
  U->>IWF: createUserFileRecord(file)
  IWF->>IWF: writeJson(localStorage)
  IWF->>API: POST /api/inner-world/files
  API->>S3: uploadInnerWorldFileObject()
  S3-->>API: storagePath
  API->>DB: upsert user_files
  DB-->>API: record
  API-->>IWF: PersistedFilePayload
  IWF->>IWF: mergeUserFiles(serverFiles)
```

Sources: [client/src/lib/innerWorldFiles.ts502-550](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L502-L550) [api/\_lib/inner-world.ts110-133](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L110-L133) [api/inner-world/artifacts.ts87-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L87-L106)

---

#### Core Logic: innerWorldFiles.ts

This library is the primary engine for file and artifact lifecycle management.

##### Key Data Structures

- **`UserFileRecord`**: Represents a raw file (PDF, Image, Markdown) with metadata like `roomOrigin`, `storagePath`, and `kind` [client/src/lib/innerWorldFiles.ts8-24](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L8-L24)
- **`InnerWorldArtifactRecord`**: Represents a synthesized exhibit (usually HTML) meant for the Dynamic Inner World. It includes `evidenceNodeIds` to link back to the External Scaffold [client/src/lib/innerWorldFiles.ts35-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L35-L50)

##### Critical Functions

- **`createUserFileRecord`**: Initializes a file record, detects its `UserFileKind` (markdown, html, pdf, etc.), and saves it locally [client/src/lib/innerWorldFiles.ts502-536](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L502-L536)
- **`pinFileToInnerWorld`**: Converts a `UserFileRecord` into an `InnerWorldArtifactRecord` by generating a standard HTML wrapper [client/src/lib/innerWorldFiles.ts672-705](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L672-L705)
- **`mergeInnerWorldArtifacts`**: Synchronizes local state with server data. It utilizes a **Tombstone Mechanism** via `DELETED_ARTIFACT_IDS_KEY` to ensure that artifacts deleted by the user are not resurrected during the next server sync [client/src/lib/innerWorldFiles.ts94-97](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L94-L97) [client/src/lib/innerWorldFiles.ts380-410](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L380-L410)

Sources: [client/src/lib/innerWorldFiles.ts1-205](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L1-L205) [client/src/lib/innerWorldFiles.ts380-410](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L380-L410)

---

#### API & Backend Persistence

The backend provides secure access to the `inner_world` schema and storage buckets.

##### Artifacts CRUD (`api/inner-world/artifacts.ts`)

Handles the persistence of synthesized exhibits. It uses `upsert` with a `onConflict: "source_ref"` clause to allow client-side generated IDs to serve as the unique key across syncs [api/inner-world/artifacts.ts87-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L87-L106)

##### Storage Utilities (`api/_lib/inner-world.ts`)

- **Signed URL Generation**: Since the `user-files` bucket is private, the system generates time-limited signed URLs for file previews via `createInnerWorldSignedUrl` [api/\_lib/inner-world.ts145-155](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L145-L155)
- **Storage Pathing**: Files are organized in the bucket following the pattern: `user-files/{userId}/{fileId}/{safeName}` [api/\_lib/inner-world.ts68-76](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L68-L76)

##### Artifact Status Lifecycle

The `inner_world_artifacts.status` column was expanded to support a complex rendering and review pipeline [supabase/migrations/20260625174800\_widen\_inner\_world\_artifacts\_status.sql1-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260625174800_widen_inner_world_artifacts_status.sql#L1-L15)

| Status | Description |
| --- | --- |
| `queued` | Artifact created but not yet finalized (e.g., Session Recap) [client/src/lib/blackboardRecapArtifacts.ts48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts#L48-L48) |
| `rendering` | Background process is generating the HTML/Assets. |
| `ready` | Finalized and visible in the Museum/Gallery [client/src/lib/innerWorldFiles.ts252-255](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L252-L255) |
| `archived` | Hidden from main view but preserved in the Archive Vault. |

Sources: [api/inner-world/artifacts.ts87-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts#L87-L106) [api/\_lib/inner-world.ts145-155](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts#L145-L155) [supabase/migrations/20260625174800\_widen\_inner\_world\_artifacts\_status.sql13-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260625174800_widen_inner_world_artifacts_status.sql#L13-L15)

---

#### UI Components

##### FileExplorer & FilePreviewPane

The `FileExplorer` provides a "living collection" interface for navigating the user's library [client/src/components/files/FileExplorer.tsx92-95](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/files/FileExplorer.tsx#L92-L95)

- **Filtering**: Supports filtering by `FileRoomOrigin` (Blackboard, Creation Corner, etc.) and `UserFileKind` [client/src/components/files/FileExplorer.tsx37-39](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/files/FileExplorer.tsx#L37-L39)
- **Preview**: `FilePreviewPane` renders the file content using `FilePreview` and provides action buttons like "Pin to Inner World" or "Open in Blackboard Room" [client/src/components/files/FilePreviewPane.tsx96-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/files/FilePreviewPane.tsx#L96-L115)

##### InnerWorldArtifactGallery

Renders `InnerWorldArtifactRecord` objects as interactive exhibits.

- **Renderer**: Uses `HtmlArtifactRenderer` to display the artifact's HTML in a sandboxed iframe [client/src/components/inner-world/InnerWorldArtifactGallery.tsx97-106](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx#L97-L106)
- **Metadata Display**: Shows the origin room, curator DI, and associated evidence nodes [client/src/components/inner-world/InnerWorldArtifactGallery.tsx54-85](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx#L54-L85)

Sources: [client/src/components/files/FileExplorer.tsx1-100](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/files/FileExplorer.tsx#L1-L100) [client/src/components/files/FilePreviewPane.tsx1-140](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/files/FilePreviewPane.tsx#L1-L140) [client/src/components/inner-world/InnerWorldArtifactGallery.tsx1-107](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx#L1-L107)

---

#### Integration: Session Recaps & Creation Corner

Artifacts are rarely created manually; they are usually outputs of other rooms.

##### Blackboard Room Recaps

When a session ends, the `SessionRecapGenerator` creates a `RecapArtifact`. This is transformed into an `InnerWorldArtifactRecord` via `buildBlackboardRecapInnerWorldArtifact` [client/src/lib/blackboardRecapArtifacts.ts17-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts#L17-L50)

- **Default Status**: Recaps are initialized with `status: "queued"`, requiring a user action to "publish" them to the museum [client/src/lib/blackboardRecapArtifacts.ts48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts#L48-L48)

##### Creation Corner Blueprints

Outputs from the Creation Corner (Blueprints, Code, etc.) are wrapped in a Neural Aurora themed HTML shell using `buildCreationCornerHtml` [client/src/lib/creationCornerArtifacts.ts76-89](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/creationCornerArtifacts.ts#L76-L89) before being saved to the Inner World.

**Artifact Generation & Persistence Logic**

```mermaid
flowchart TD
  A["User Session"]
  B["DI Interpretation"]
  C["HTML Exhibit"]
  D["buildBlackboardRecapInnerWorldArtifact()"]
  E["appendInnerWorldArtifact()"]
  F["localStorage.setItem(FILE_STORAGE_KEYS.innerWorldArtifacts)"]
  G["POST /api/inner-world/artifacts"]
  H["Supabase: inner_world_artifacts table"]
  A -->|Summarize| B
  B -->|Format| C
  C --> D
  D --> E
  E --> F
  F --> G
  G --> H
```

Sources: [client/src/lib/blackboardRecapArtifacts.ts17-59](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts#L17-L59) [client/src/lib/creationCornerArtifacts.ts128-158](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/creationCornerArtifacts.ts#L128-L158) [client/src/lib/innerWorldFiles.ts86-90](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts#L86-L90)

---

### Session Recap & Capture Routing

> Source MHT: `Session Recap & Capture Routing _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/8.3-session-recap-and-capture-routing  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/bucket-drops.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/bucket-drops.test.ts)
- [api/\_\_tests\_\_/session-recap.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/session-recap.test.ts)
- [api/\_lib/bucketDrops.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/bucketDrops.ts)
- [api/billy-bucket-drop.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/billy-bucket-drop.ts)
- [api/sessionRecap.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sessionRecap.ts)
- [client/src/components/BucketDrops.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BucketDrops.tsx)
- [client/src/components/SessionRecapGenerator.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx)
- [client/src/components/capture/UniversalCaptureBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/capture/UniversalCaptureBar.tsx)
- [client/src/components/inner-world/InnerWorldArtifact.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifact.tsx)
- [client/src/components/inner-world/InnerWorldInspector.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldInspector.tsx)
- [client/src/components/inner-world/InnerWorldRoom.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldRoom.tsx)
- [client/src/lib/bucketDrops.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/bucketDrops.ts)
- [client/src/lib/captureRouting.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/captureRouting.ts)
- [client/src/lib/scaffoldStorage.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/scaffoldStorage.ts)
- [client/src/lib/sessionRecapDownloads.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sessionRecapDownloads.ts)
- [client/src/lib/transcriptoryDownloads.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/transcriptoryDownloads.ts)
- [client/src/pages/BucketDropsPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/BucketDropsPage.tsx)
- [client/src/tests/bucket-drops.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/bucket-drops.test.ts)
- [client/src/tests/session-recap-download.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/session-recap-download.test.ts)
- [client/src/tests/transcriptory-downloads.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/transcriptory-downloads.test.ts)
- [shared/sessionRecap.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts)

</details>
This section details the mechanisms for synthesizing session experiences into structured artifacts and the routing logic that governs how raw captures (thoughts, files, voice) move from the **Blackboard Room** into the **External Scaffold** or the **Dynamic Inner World**.

#### 1. Session Recap System

The Session Recap system is responsible for transforming a user's active session—comprising raw captures and conversation history—into a characterful, interactive HTML artifact. This process is orchestrated by the `SessionRecapGenerator` component and executed via a specialized LLM cascade.

##### 1.1 SessionRecapGenerator

The `SessionRecapGenerator` is a client-side component that aggregates session data and manages the generation lifecycle [client/src/components/SessionRecapGenerator.tsx5-16](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L5-L16)

- **State Management**: It tracks the generation status (`idle`, `generating`, `done`, `error`) and caches the resulting artifact in `sessionStorage` using a slugified key to prevent loss on page refresh [client/src/components/SessionRecapGenerator.tsx135-171](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L135-L171)
- **Orchestration**: It calls `requestOrchestrationDecision` to summarize the session before invoking the recap API [client/src/components/SessionRecapGenerator.tsx229-234](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L229-L234)
- **Output**: Generates a `RecapArtifact` with `status: "draft"`. This ensures recaps do not automatically clutter the **Dynamic Inner World** until the user explicitly promotes them [client/src/components/SessionRecapGenerator.tsx104-124](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L104-L124)

##### 1.2 The /api/sessionRecap Route

The backend handler manages the LLM request and enforces a strict "HTML Gate" to ensure the output is valid and renderable.

- **Voice Normalization**: The system supports multiple DI personas (Billy, Architect, Curator) for the recap's tone [shared/sessionRecap.ts31-48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts#L31-L48) The `normalizeRecapVoice` function defaults to `recap-di` if an invalid ID is provided [shared/sessionRecap.ts58-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts#L58-L65)
- **Retry Logic & Validation**: The handler attempts up to two LLM calls. If the first fails the `validateRecapHtml` check, a second attempt is made with a repair note [api/sessionRecap.ts53-72](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sessionRecap.ts#L53-L72)
- **Fallback Mechanism**: If the LLM fails to produce valid HTML after two tries, `buildRecapFallbackHtml` generates a deterministic, template-based recap to ensure the user always receives a result [api/sessionRecap.ts75-84](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sessionRecap.ts#L75-L84)

##### 1.3 Recap Voice Profiles

| Voice ID | Label | Tone Description |
| --- | --- | --- |
| `recap-di` | Recap DI | Neutral, evidence-first, warm without being sentimental. |
| `billy` | Billy | Warm collaborator, grounded, present, and specific. |
| `architect` | The Architect | Structured, precise, good at naming the shape of work. |
| `curator` | The Curator | Reflective, evidence-linked, attentive to preservation. |

**Sources:** [shared/sessionRecap.ts31-48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts#L31-L48) [api/sessionRecap.ts42-45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sessionRecap.ts#L42-L45)

---

#### 2. Capture Routing & Storage

Capture routing defines the "Capture Lane" where raw inputs are transformed into `CaptureOrb` entities and dispatched to various storage surfaces.

##### 2.1 UniversalCaptureBar

The `UniversalCaptureBar` is the primary entry point for raw data. It supports:

- **Text**: Standard textarea input.
- **Voice**: Utilizes the browser's `SpeechRecognition` API (if enabled in `UserSurfaceSettings`) to stream interim and final transcripts [client/src/components/capture/UniversalCaptureBar.tsx57-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/capture/UniversalCaptureBar.tsx#L57-L115)
- **Files**: Managed via a hidden file input triggered by `Cmd/Ctrl+U` or a UI button [client/src/components/capture/UniversalCaptureBar.tsx143-163](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/capture/UniversalCaptureBar.tsx#L143-L163)

##### 2.2 Scaffold Storage Lifecycle

The `scaffoldStorage` utility (and `captureRouting.ts` exports) manages the transition of orbs between different states [client/src/lib/scaffoldStorage.ts184-201](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/scaffoldStorage.ts#L184-L201):

1. **Pending**: Orbs waiting in the `ScaffoldQueue`.
2. **Approved**: Orbs promoted to the **External Scaffold**.
3. **Archived**: Orbs moved to `ARCHIVED_SCAFFOLD_ORBS_KEY` to clear the active view while retaining metadata [client/src/lib/scaffoldStorage.ts22-24](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/scaffoldStorage.ts#L22-L24)
4. **Inner World**: High-resonance artifacts promoted to the permanent gallery.

##### 2.3 Bucket Drops

The **Bucket Drop** mechanism is a "zero-friction" capture system designed for long-term storage or delayed release.

- **Sealing**: Users can "seal" a drop with a release trigger (date or event) [client/src/components/BucketDrops.tsx33-37](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BucketDrops.tsx#L33-L37)
- **Server Sync**: Drops are persisted to the server via `createBucketDropOnServer` and hydrated on the client through `mergeBucketDropOrbs` [client/src/components/BucketDrops.tsx89-103](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BucketDrops.tsx#L89-L103)
- **Orb Conversion**: Every drop is converted to a `CaptureOrb` with `origin: "bucket_drop"` to maintain compatibility with the room architecture [client/src/components/BucketDrops.tsx53-75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BucketDrops.tsx#L53-L75)

---

#### 3. Data Flow Diagrams

##### 3.1 Session Recap Generation Flow

This diagram maps the transition from client-side interaction to the LLM Router and back to the Artifact Gallery.

```mermaid
flowchart TD
  A["SessionRecapGenerator"]
  B["api/sessionRecap.ts"]
  G["HtmlArtifactRenderer"]
  H["RecapArtifact (Draft)"]
  C["validateRecapHtml"]
  D["routeLlm (Retry w/ Repair Note)"]
  F["sendJson (200 OK)"]
  E["validateRecapHtml"]
  Fallback["buildRecapFallbackHtml"]
  Router["llmRouter.ts"]
  A -->|POST /api/sessionRecap| B
  G -->|Displays| H
  B --> C
  C -->|Invalid (Attempt 1)| D
  C -->|Valid| F
  D --> E
  E -->|Fail| Fallback
  E -->|Success| F
  Fallback --> F
  D -->|mode: session_recap| Router
  F -->|JSON Response| A
  A -->|dispatchArtifactEvent| G
```

**Sources:** [client/src/components/SessionRecapGenerator.tsx189-245](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SessionRecapGenerator.tsx#L189-L245) [api/sessionRecap.ts31-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/sessionRecap.ts#L31-L115) [shared/sessionRecap.ts222-230](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts#L222-L230)

##### 3.2 Capture Routing Architecture

Mapping the flow from raw input to persisted `CaptureOrb` states.

```mermaid
flowchart TD
  UCB["UniversalCaptureBar"]
  BD["BucketDrops.tsx"]
  RC["routeBlackboardCapture"]
  CO["createCaptureOrb"]
  SQ["readScaffoldQueue / writeScaffoldQueue"]
  AO["readApprovedOrbs / writeApprovedOrbs"]
  AS["archiveScaffoldOrb"]
  K1["gv.externalScaffold.queue"]
  K2["gv.externalScaffold.approved"]
  K3["gv.externalScaffold.archived"]
  UCB --> RC
  BD --> CO
  RC --> CO
  CO --> SQ
  SQ -->|User Approves| AO
  AO -->|User Archives| AS
  SQ --> K1
  AO --> K2
  AS --> K3
```

**Sources:** [client/src/lib/captureRouting.ts1-86](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/captureRouting.ts#L1-L86) [client/src/lib/scaffoldStorage.ts122-151](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/scaffoldStorage.ts#L122-L151) [client/src/components/BucketDrops.tsx112-135](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BucketDrops.tsx#L112-L135)

---

#### 4. Download & Sanitization

The system provides specialized utilities for exporting session data while maintaining security.

##### 4.1 Session Recap Downloads

The `sessionRecapDownloads.ts` module handles the transformation of a `RecapArtifact` into various formats:

- **HTML**: Sanitized to remove sensitive scripts or `localStorage` calls [client/src/lib/sessionRecapDownloads.ts173-174](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sessionRecapDownloads.ts#L173-L174)
- **Markdown/TXT**: Strips HTML tags and formats metadata for readability [shared/sessionRecap.ts103-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts#L103-L105)
- **JSON**: Exports the raw artifact and metadata [client/src/tests/session-recap-download.test.ts57-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/session-recap-download.test.ts#L57-L60)

##### 4.2 Sanitization Logic

`sanitizeRecapHtmlForDownload` performs the following safety transforms [client/src/tests/session-recap-download.test.ts7-28](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/session-recap-download.test.ts#L7-L28):

- Replaces `localStorage.setItem` with a safe, disabled reference.
- Rewrites internal app actions (e.g., "Return to Blackboard") into absolute URLs pointing back to the platform.
- Disables platform-specific interactive buttons that require a live session context.

**Sources:** [client/src/lib/sessionRecapDownloads.ts34-36](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sessionRecapDownloads.ts#L34-L36) [client/src/tests/session-recap-download.test.ts7-28](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/session-recap-download.test.ts#L7-L28) [shared/sessionRecap.ts103-105](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/sessionRecap.ts#L103-L105)

---

## Volume: Commerce, Corpus & Specialized Modules

### GATE Commerce & Packaging System

> Source MHT: `GATE Commerce & Packaging System _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/9-gate-commerce-and-packaging-system  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.agents/skills/gestaltview-current-state-maintenance/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/gestaltview-current-state-maintenance/SKILL.md?plain=1)
- [.agents/skills/gestaltview-schema-supabase/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/gestaltview-schema-supabase/SKILL.md?plain=1)
- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/.env.example](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/.env.example)
- [api/\_\_tests\_\_/profile-portrait-drain.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-drain.test.ts)
- [api/cron/codex-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts)
- [api/cron/profile-portrait-cadence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts)
- [api/cron/profile-portrait-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts)
- [api/cron/provenance-upgrade.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/provenance-upgrade.ts)
- [client/src/components/DemoGate.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/DemoGate.tsx)
- [client/src/components/ExhibitPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ExhibitPage.tsx)
- [client/src/components/UpgradeBanner.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/UpgradeBanner.tsx)
- [client/src/pages/AgentTrainerDevCliPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerDevCliPage.tsx)
- [client/src/pages/AgentTrainerPricing.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerPricing.tsx)
- [client/src/pages/FAQ.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/FAQ.tsx)
- [client/src/pages/GATEOrderStatusPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GATEOrderStatusPage.tsx)
- [client/src/pages/GATEPackageBuilderPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GATEPackageBuilderPage.tsx)
- [client/src/pages/HostedAgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/HostedAgentTrainerPage.tsx)
- [client/src/pages/NotFound.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/NotFound.tsx)
- [client/src/pages/Pricing.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Pricing.tsx)
- [client/src/pages/PrivacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/PrivacyPage.tsx)
- [client/src/pages/Terms.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Terms.tsx)
- [scripts/README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1)
- [scripts/init-collaborator-system.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh)
- [supabase/GestaltView\_Schema\_Alignment\_Reference.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1)
- [supabase/gestaltview-supabase-linter-remediation-plan.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/gestaltview-supabase-linter-remediation-plan.md?plain=1)
- [supabase/migrations/20260621000000\_collaborator\_security\_rls.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260621000000_collaborator_security_rls.sql)
- [supabase/supabase-db-dump-2026-06-21T06-21-21-963Z.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/supabase-db-dump-2026-06-21T06-21-21-963Z.sql)
- [vercel.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json)

</details>
The **GATE (Gestaltview Automated Technical Export)** system is the commercial engine of GestaltView. it enables the packaging, sale, and deployment of Digital Intelligence (DI) behavioral frameworks and runtime scaffolds. It manages the transition from a conceptual draft to a physical artifact (ZIP package) through a structured lifecycle integrated with Stripe for billing and Supabase for state persistence.

#### System Overview

The GATE system bridges the gap between the DI training environment and a deliverable product. It allows users to define "Drafts" of a DI system, purchase them via tiered subscriptions or flat-fee orders, and trigger a build pipeline that assembles a white-label version of the GestaltView runtime.

##### Commercial Tiers

The system defines four primary tiers for the hosted runtime and packaging:

- **SOLO\_SPARK (Solo Founder):** Hosted access for individual builders [client/src/pages/AgentTrainerPricing.tsx90-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerPricing.tsx#L90-L110)
- **STUDIO (Small Team):** Collaborative curation and shared workspaces [client/src/pages/AgentTrainerPricing.tsx112-132](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerPricing.tsx#L112-L132)
- **GROWTH (Scaling Business):** Governance, audit logging, and private deployment paths [client/src/pages/AgentTrainerPricing.tsx134-154](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerPricing.tsx#L134-L154)
- **ENTERPRISE:** White-label Billy deployment with custom PLK training [client/src/pages/Pricing.tsx94-112](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Pricing.tsx#L94-L112)

##### The Package Lifecycle

The system follows a strict state machine to ensure consistency between payment and delivery:

1. **Draft:** User configures package parameters in the `GATEPackageBuilderPage`.
2. **Checkout:** Stripe session is created via `api/stripe/checkout.ts`.
3. **Order:** Upon successful webhook, a record is created in `gate_orders`.
4. **Build:** A `gate_build_jobs` entry is claimed by the worker to assemble the artifact.
5. **Redeem:** The user downloads the final ZIP artifact via `api/gate/order-redeem`.

##### Logic Flow: Order to Artifact

```mermaid
flowchart TD
  Builder["GATEPackageBuilderPage"]
  Status["GATEOrderStatusPage"]
  Checkout["api/stripe/checkout.ts"]
  Webhook["api/gate/webhook-stripe"]
  OrderAPI["api/gate/order"]
  BuildRun["api/gate/build-job-run"]
  D_Drafts["gate_package_drafts"]
  D_Orders["gate_orders"]
  D_Jobs["gate_build_jobs"]
  D_Arts["gate_artifacts"]
  Builder -->|Create| D_Drafts
  D["D"]
  Drafts_Checkout["Drafts_Checkout"]
  D --> Drafts_Checkout
  Checkout --> Webhook
  Webhook -->|Insert| D_Orders
  Orders_BuildRun["Orders_BuildRun"]
  D -->|Trigger| Orders_BuildRun
  BuildRun -->|Update| D_Jobs
  Jobs_D_Arts["Jobs_D_Arts"]
  D -->|Generate| Jobs_D_Arts
  Status -->|Poll| OrderAPI
  OrderAPI -->|Read| D_Orders
```

Sources: [vercel.json83-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L83-L115) [client/src/pages/AgentTrainerPricing.tsx88-155](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerPricing.tsx#L88-L155) [supabase/GestaltView\_Schema\_Alignment\_Reference.md25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1#L25-L25)

---

#### GATE Package Builder

The `GATEPackageBuilderPage` serves as the primary interface for users to customize their DI export. It utilizes the `GateSidekick` AI assistant to help users refine their `PackageConfigDraft`.

- **Draft Validation:** The UI interacts with `/api/gate/draft-validate` to ensure configurations meet tier-specific constraints [vercel.json85-87](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L85-L87)
- **Tier Mapping:** Features are toggled based on the selected commercial tier (e.g., Solo vs. Studio) [client/src/pages/AgentTrainerPricing.tsx88-155](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerPricing.tsx#L88-L155)
- **Order Tracking:** Once a build is initiated, users are redirected to the `GATEOrderStatusPage` to monitor the `gate_build_jobs` progress [vercel.json101-103](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L101-L103)

**Sources:** [client/src/pages/GATEPackageBuilderPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GATEPackageBuilderPage.tsx) [vercel.json83-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L83-L115)

---

#### Stripe Integration & Billing

The billing system manages both recurring subscriptions for the hosted platform and one-time payments for GATE packages.

- **Checkout Sessions:** The `api/stripe/checkout.ts` handler creates Stripe Checkout sessions, mapping internal `Plan` IDs (Core, Pro, Enterprise) to Stripe Price IDs [client/src/pages/Pricing.tsx42-113](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Pricing.tsx#L42-L113)
- **Webhooks:** The `api/gate/webhook-stripe` endpoint handles asynchronous payment confirmations, updating user tiers and initiating GATE orders [vercel.json113-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L113-L115)
- **Tier Enforcement:** User access to features like `SymbioCoder` or `Diligence exports` is determined by the `tier` column in the `users` table [client/src/pages/Pricing.tsx71-92](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Pricing.tsx#L71-L92) [supabase/GestaltView\_Schema\_Alignment\_Reference.md46-61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1#L46-L61)

For details on the billing implementation, see [Stripe Integration & Billing](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/9.2-stripe-integration-and-billing).

**Sources:** [client/src/pages/Pricing.tsx42-113](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Pricing.tsx#L42-L113) [api/stripe/checkout.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/stripe/checkout.ts) [supabase/GestaltView\_Schema\_Alignment\_Reference.md46-61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1#L46-L61)

---

#### Build Pipeline & Persistence

The backend infrastructure for GATE is built on Supabase, utilizing specialized tables in the `commerce_gate` domain to track the assembly of ZIP artifacts.

##### Database Entities

| Table | Role |
| --- | --- |
| `gate_package_drafts` | Stores pending configurations before purchase. |
| `gate_orders` | Records successful transactions and links to buyers. |
| `gate_build_jobs` | Manages the queue and status of artifact generation. |
| `gate_artifacts` | Stores metadata and storage paths for the final ZIP files. |

##### Artifact Generation

The build process is triggered via `/api/gate/build-job-run`, which executes the `composeGatePackageArtifact` logic. This process involves:

1. **Cloning** the white-label scaffold.
2. **Injecting** the user's specific DI profiles and PLK settings.
3. **Bundling** the environment into a ZIP archive stored in Supabase Storage.

For details on the build pipeline, see [GATE Package Build Pipeline](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/9.1-gate-package-build-pipeline).

**Sources:** [supabase/GestaltView\_Schema\_Alignment\_Reference.md25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1#L25-L25) [vercel.json105-107](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L105-L107) [scripts/README.md74-91](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L74-L91)

---

#### Code Entity Map

This diagram associates high-level GATE concepts with their specific implementation files and routes.

```mermaid
classDiagram
  class GATE_UI {
    +GATEPackageBuilderPage.tsx
    +GATEOrderStatusPage.tsx
    +AgentTrainerPricing.tsx
  }
  class GATE_API {
    +/api/gate/draft
    +/api/gate/order
    +/api/gate/build-job-run
  }
  class STRIPE_INTEGRATION {
    +api/stripe/checkout.ts
    +api/gate/webhook-stripe
    +billing.ts
  }
  class PERSISTENCE {
    +gate_package_drafts
    +gate_orders
    +gate_build_jobs
    +gate_artifacts
  }
  GATE ..> UI_GATE_API : Requests
  GATE ..> API_PERSISTENCE : CRUD
  STRIPE ..> INTEGRATION_PERSISTENCE : Updates Order Status
  GATE ..> API_STRIPE_INTEGRATION : Initiates Payment
```

Sources: [vercel.json83-115](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L83-L115) [supabase/GestaltView\_Schema\_Alignment\_Reference.md25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1#L25-L25) [client/src/pages/AgentTrainerPricing.tsx1-155](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerPricing.tsx#L1-L155)

---

### GATE Package Build Pipeline

> Source MHT: `GATE Package Build Pipeline _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/9.1-gate-package-build-pipeline  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/.env.example](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/.env.example)
- [api/\_\_tests\_\_/keep-alive.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/keep-alive.test.ts)
- [api/\_\_tests\_\_/profile-portrait-drain.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-drain.test.ts)
- [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts)
- [api/cron/codex-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts)
- [api/cron/profile-portrait-cadence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts)
- [api/cron/profile-portrait-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts)
- [api/cron/provenance-upgrade.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/provenance-upgrade.ts)
- [api/health/supabase.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/health/supabase.ts)
- [api/keep-alive.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts)
- [api/stripe/checkout.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/stripe/checkout.ts)
- [api/trainer/packaging-candidates/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/trainer/packaging-candidates/%5Bid%5D.ts)
- [api/voice/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts)
- [client/src/components/BillyGreeter.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx)
- [client/src/components/ExhibitPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ExhibitPage.tsx)
- [client/src/pages/AgentTrainerDevCliPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerDevCliPage.tsx)
- [client/src/pages/AgentTrainerPricing.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentTrainerPricing.tsx)
- [client/src/pages/FAQ.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/FAQ.tsx)
- [client/src/pages/GATEOrderStatusPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GATEOrderStatusPage.tsx)
- [client/src/pages/GATEPackageBuilderPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GATEPackageBuilderPage.tsx)
- [client/src/pages/HostedAgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/HostedAgentTrainerPage.tsx)
- [client/src/pages/NotFound.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/NotFound.tsx)
- [client/src/pages/PrivacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/PrivacyPage.tsx)
- [client/src/pages/Terms.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Terms.tsx)
- [server/agent-trainer/orchestrator.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/orchestrator.ts)
- [shared/billy/runtime.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/billy/runtime.ts)
- [vercel.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json)

</details>
The **GATE (Gestaltview Agent Training & Export)** Package Build Pipeline is the automated system responsible for transforming high-level agent configurations and training data into deployable Digital Intelligence (DI) behavioral frameworks. It manages the transition from a conceptual `PackageConfigDraft` to a finalized `gate_artifact` through a multi-stage process involving AI-assisted analysis, tier-based validation, and automated build jobs.

#### Pipeline Architecture & Data Flow

The pipeline operates as a state machine backed by Supabase, moving through drafting, validation, ordering, and execution phases.

##### High-Level Build Flow

1. **Drafting**: User defines requirements via `GATEPackageBuilderPage`, assisted by `GateSidekick`.
2. **Analysis**: `analyzeGateDraft` evaluates the configuration against `gateCatalog.ts` tier limits.
3. **Ordering**: Upon checkout, a `gate_orders` record is created, triggering a `gate_build_jobs` entry.
4. **Execution**: `build-job-run.ts` executes the build, calling `composeGatePackageArtifact` to synthesize the final bundle.
5. **Persistence**: Final artifacts are stored in `gate_artifacts` and linked to the user's account.

##### System Entity Mapping

The following diagram bridges the Natural Language concepts to the specific Code Entities and Database Tables used in the pipeline.

**Diagram: GATE Pipeline Entity Mapping**

```mermaid
flowchart TD
  A["Package Draft"]
  B["AI Assistant"]
  C["Build Job"]
  D["Final Package"]
  E["PackageConfigDraft (Zod Schema)"]
  F["GateSidekick (AI Agent)"]
  G["build-job-run.ts (API Endpoint)"]
  H["composeGatePackageArtifact (Function)"]
  I["gate_drafts"]
  J["gate_build_jobs"]
  K["gate_orders"]
  L["gate_artifacts"]
  A --> E
  B --> F
  C --> G
  D --> H
  E --> I
  G --> J
  J --> K
  H --> L
```

**Sources:** `vercel.json:85-115`, `api/cron/codex-drain.ts:5-26`

---

#### Key Components & Implementation

##### 1. Package Configuration & Analysis

The pipeline begins with the `PackageConfigDraft`, which defines the scope of the DI (Digital Intelligence).

- **GateSidekick**: An AI assistant that helps users refine their drafts by suggesting use cases and ensuring compatibility.
- **analyzeGateDraft**: A function that performs structural validation and ensures the requested features align with the selected tier (SOLO\_SPARK, STUDIO, GROWTH, or ENTERPRISE) defined in `gateCatalog.ts`.

##### 2. The Build Execution (`build-job-run.ts`)

The `build-job-run.ts` endpoint is the primary worker for package synthesis. It is typically invoked via a Vercel Cron or a Stripe Webhook post-payment.

**Execution Logic:**

1. **Claiming**: Claims a pending job from the `gate_build_jobs` table.
2. **Context Assembly**: Gathers `TrainingBrief` data and `EmbodimentProfile` fragments.
3. **Artifact Composition**: Calls `composeGatePackageArtifact` to generate the Markdown, JSON, and HTML representations of the agent.

##### 3. Repository Layer (Supabase)

The pipeline relies on a set of specialized tables to maintain state and provide an audit trail:

| Table | Role |
| --- | --- |
| `gate_drafts` | Stores in-progress configurations before purchase. |
| `gate_orders` | Records successful Stripe transactions and links them to users. |
| `gate_build_jobs` | A queue for the build worker; tracks `pending`, `running`, `ready`, or `failed` status. |
| `gate_artifacts` | The final storage for the generated DI framework bundles. |

**Sources:** `vercel.json:105-115`, `api/cron/codex-drain.ts:58-69`

---

#### Logic Flow: Order to Artifact

The transition from a paid order to a downloadable artifact is handled asynchronously to manage LLM latency and generation time.

**Diagram: Build Execution Sequence**

```mermaid
sequenceDiagram
  participant S as Stripe Webhook
  participant DB as Supabase (gate_build_jobs)
  participant B as build-job-run.ts
  participant C as composeGatePackageArtifact
  participant A as gate_artifacts
  S->>DB: Insert job (status='pending')
  Note over B: Triggered by Cron or Webhook
  B->>DB: rpc.claim_gate_job()
  DB-->>B: Job Data (Draft ID)
  B->>C: synthesize(draftId)
  C->>C: Apply gateCatalog.ts limits
  C-->>B: Generated Artifact Bundle
  B->>A: Insert Record & Storage Upload
  B->>DB: Update job (status='ready')
```

**Sources:** `vercel.json:105-115`, `api/cron/codex-drain.ts:16-26`

---

#### Tier Definitions & Compatibility

The build pipeline enforces strict constraints based on the `gateCatalog.ts` definitions.

- **SOLO\_SPARK**: Limited to single-persona exports with basic behavioral hooks.
- **STUDIO**: Includes multi-persona support and custom `PLK` (Private Language Key) integration.
- **GROWTH**: Adds API access and advanced `gateUseCases.ts` templates.
- **ENTERPRISE**: Full white-labeling and high-frequency `provenance-upgrade` support.

`gateCompatibility.ts` is used during the `analyzeGateDraft` phase to ensure that selected modules (e.g., Resume Rockstar vs. Musical DNA) do not have conflicting logic within a single package artifact.

**Sources:** `api/cron/codex-drain.ts:71-77`, `shared/billy/runtime.ts:111-125`

---

#### Maintenance & Observability

- **Keep-Alive**: The `api/keep-alive.ts` endpoint ensures the Supabase connection remains warm to prevent cold-start latency during build jobs `api/keep-alive.ts:L1-L12`.
- **Codex Drain**: A companion cron `api/cron/codex-drain.ts` handles the "lighter first-ship lane" for artifact exports, ensuring the `gate_build_jobs` queue does not stall `api/cron/codex-drain.ts:L1-L8`.
- **Health Checks**: The pipeline status can be monitored via `api/billy-health.ts`.

**Sources:** `api/keep-alive.ts:142-160`, `api/cron/codex-drain.ts:12-22`

---

### Stripe Integration & Billing

> Source MHT: `Stripe Integration & Billing _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/9.2-stripe-integration-and-billing  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.agents/skills/gestaltview-current-state-maintenance/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/gestaltview-current-state-maintenance/SKILL.md?plain=1)
- [.agents/skills/gestaltview-schema-supabase/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/gestaltview-schema-supabase/SKILL.md?plain=1)
- [api/\_\_tests\_\_/keep-alive.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/keep-alive.test.ts)
- [api/\_lib/llmRouter.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/llmRouter.ts)
- [api/collaborators/provision.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/collaborators/provision.ts)
- [api/health/supabase.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/health/supabase.ts)
- [api/keep-alive.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/keep-alive.ts)
- [api/stripe/checkout.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/stripe/checkout.ts)
- [api/trainer/packaging-candidates/[id].ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/trainer/packaging-candidates/%5Bid%5D.ts)
- [api/voice/billy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/voice/billy.ts)
- [client/src/components/BillyGreeter.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyGreeter.tsx)
- [client/src/components/DemoGate.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/DemoGate.tsx)
- [client/src/components/UpgradeBanner.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/UpgradeBanner.tsx)
- [client/src/pages/Pricing.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Pricing.tsx)
- [scripts/README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1)
- [scripts/init-collaborator-system.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh)
- [server/agent-trainer/orchestrator.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/orchestrator.ts)
- [server/collaborators/provision.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/collaborators/provision.ts)
- [shared/billy/runtime.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/billy/runtime.ts)
- [supabase/GestaltView\_Schema\_Alignment\_Reference.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1)
- [supabase/gestaltview-supabase-linter-remediation-plan.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/gestaltview-supabase-linter-remediation-plan.md?plain=1)
- [supabase/migrations/20260621000000\_collaborator\_security\_rls.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260621000000_collaborator_security_rls.sql)
- [supabase/supabase-db-dump-2026-06-21T06-21-21-963Z.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/supabase-db-dump-2026-06-21T06-21-21-963Z.sql)

</details>
The Stripe Integration and Billing subsystem manages the commercial lifecycle of GestaltView users, ranging from free-tier exploration to Enterprise-level collaborator provisioning. This system bridges Stripe's checkout and webhook events with the Supabase `identity_core` and `collaboration` domains to enforce feature gating and manage user permissions.

#### Billing Architecture Overview

GestaltView utilizes a tiered subscription model (Core, Pro, Enterprise) to control access to Digital Intelligence (DI) capabilities, memory persistence, and specialized modules like SymbioCoder or Resume Rockstar.

##### System Data Flow

The following diagram illustrates the flow from a user selecting a plan to the activation of features via Stripe webhooks.

**Stripe Checkout & Provisioning Flow**

```mermaid
sequenceDiagram
  participant U as User (PricingPage)
  participant C as billing.ts (Client Helper)
  participant S as api/stripe/checkout.ts
  participant ST as Stripe API
  participant W as api/stripe/webhook.ts
  participant DB as Supabase (users table)
  U->>C: Select Plan ('pro')
  C->>S: POST /api/stripe/checkout {planId}
  S->>ST: Create Checkout Session
  ST-->>S: session_url
  S-->>C: {url}
  C->>U: Redirect to Stripe
  U->>ST: Complete Payment
  ST->>W: Webhook (checkout.session.completed)
  W->>W: Verify Signature
  W->>DB: Update user tier & stripe_subscription_id
  DB-->>W: Success
  W->>ST: 200 OK
```

**Sources:** `client/src/pages/Pricing.tsx:142-153`, `api/stripe/checkout.ts`, `api/stripe/webhook.ts`

#### Tier Mapping & Feature Gating

User access is governed by the `tier` column in the `public.users` table [supabase/GestaltView\_Schema\_Alignment\_Reference.md46-61](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1#L46-L61) Feature availability is defined in the `Pricing.tsx` configuration and enforced through the `useAuth` hook and `BillyProvider`.

##### Defined Tiers

| Tier | Purpose | Key Features |
| --- | --- | --- |
| **Free** | Anonymous Exploration | 3 Billy queries, no persistence, limited rendering. |
| **Core** | Foundation | Unlimited Billy, PLK memory, Bucket Drops, Resume Rockstar. |
| **Pro** | Deep Intelligence | SymbioCoder, Claude-tier thinking, Tapestry Engine, Diligence exports. |
| **Enterprise** | Organizational | White-label Billy, Collaborator Engine, Custom PLK training. |

**Sources:** `client/src/pages/Pricing.tsx:35-113`, `supabase/GestaltView_Schema_Alignment_Reference.md:51-51`

#### Key API Endpoints

##### Subscription Checkout (`api/stripe/checkout.ts`)

This endpoint handles the creation of Stripe Checkout sessions. It maps internal `planId` strings to Stripe Price IDs and configures success/cancel URLs.

##### Webhook Processing (`api/stripe/webhook.ts`)

The webhook handler is responsible for:

1. **Signature Verification:** Validating that requests originate from Stripe using the `STRIPE_WEBHOOK_SECRET`.
2. **Event Dispatching:** Handling `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
3. **Database Sync:** Updating the `users` table with the new `tier`, `subscription_status`, and `stripe_customer_id` [supabase/GestaltView\_Schema\_Alignment\_Reference.md52-54](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1#L52-L54)

#### Collaborator Provisioning System

The Collaborator system extends billing into the Enterprise domain, allowing for the creation of governed identities (both human and DI) within a shared workspace.

##### Provisioning Logic (`server/collaborators/provision.ts`)

The `provisionCollaborator` function is the core entry point for creating new entities. It performs the following steps:

1. **Duplicate Check:** Ensures no existing collaborator is linked to the same `agent_id` or `auth_user_id` [server/collaborators/provision.ts155-187](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/collaborators/provision.ts#L155-L187)
2. **Key Generation:** Creates a unique `collaborator_key` using a slugified base and a random UUID [server/collaborators/provision.ts124-134](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/collaborators/provision.ts#L124-L134)
3. **Row Insertion:** Creates records in `collaborators`, `collaborator_roles`, and `collaborator_embodiment_links` [server/collaborators/provision.ts189-234](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/collaborators/provision.ts#L189-L234)

**Collaborator Entity Mapping**

```mermaid
classDiagram
  class ProvisionCollaboratorInput {
    +string displayName
    +string collaboratorType
    +string entityClass
    +Object primaryRole
    +Array permissions
  }
  class CollaboratorRow {
    +uuid collaborator_id
    +string collaborator_key
    +string status
    +uuid auth_user_id
    +uuid agent_id
  }
  class ProvisionService {
    +provisionCollaborator(input)
    +ensureNoDuplicateCollaborator(supabase, input)
    +buildCollaboratorKey(input)
  }
  ProvisionCollaboratorInput ..> ProvisionService : input
  ProvisionService ..> CollaboratorRow : creates
```

**Sources:** `server/collaborators/provision.ts:4-45`, `server/collaborators/provision.ts:189-234`

#### Client-Side Billing Components

##### Pricing Page (`client/src/pages/Pricing.tsx`)

The `PricingPage` provides a visual interface for plan selection. It uses `framer-motion` for animations and the `useAuth` hook to determine the user's current subscription state [client/src/pages/Pricing.tsx2-4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Pricing.tsx#L2-L4)

##### Upgrade Components

- **UpgradeBanner:** A contextual UI element that appears when a user hits tier-based limits (e.g., query counts).
- **DemoGate:** A specialized component used to preview Pro/Enterprise features to Free users, often triggering a redirect to the Pricing page [client/src/components/DemoGate.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/DemoGate.tsx)

#### Administrative & Maintenance Tooling

##### Collaborator Initialization (`scripts/init-collaborator-system.sh`)

This bash script verifies the integrity of the collaborator and billing infrastructure. It checks for:

- Presence of required provisioning files [scripts/init-collaborator-system.sh121-126](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh#L121-L126)
- Wiring of `requireAdmin` auth wrappers in API routes [scripts/init-collaborator-system.sh155-157](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh#L155-L157)
- Existence of necessary database tables in the schema snapshot (e.g., `collaborators`, `collaborator_roles`) [scripts/init-collaborator-system.sh167-173](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh#L167-L173)

##### Billing Helpers (`client/src/lib/billing.ts`)

A utility module providing `readBillingPlanFromSearch` and other helpers to parse Stripe redirect parameters and update local application state [client/src/pages/Pricing.tsx5](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Pricing.tsx#L5-L5)

**Sources:** `scripts/init-collaborator-system.sh`, `server/collaborators/provision.ts`, `api/collaborators/provision.ts`

---

### Data Ingestion, Corpus & Knowledge Pipeline

> Source MHT: `Data Ingestion, Corpus & Knowledge Pipeline _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/10-data-ingestion-corpus-and-knowledge-pipeline  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.github/workflows/ingest\_agent\_files.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_agent_files.yml)
- [.github/workflows/ingest\_corpus\_v2.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml)
- [.github/workflows/summarize\_corpus.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/summarize_corpus.yml)
- [docs/GIL\_Protocol.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/GIL_Protocol.md?plain=1)
- [gil/targeted-summarization-agent-trainer.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-agent-trainer.yml)
- [gil/targeted-summarization-core-docs.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-core-docs.yml)
- [gil/targeted-summarization-mixed.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-mixed.yml)
- [gil/targeted-summarization-runs.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-runs.yml)
- [scripts/gestaltview\_crawler.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_crawler.py)
- [scripts/gestaltview\_manifest\_pipeline.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py)
- [scripts/gil\_protocol.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gil_protocol.py)
- [scripts/ingest\_corpus.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py)
- [scripts/synthesize\_corpus.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py)
- [scripts/targeted-summarization.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/targeted-summarization.sh)
- [scripts/temporal\_backfill.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/temporal_backfill.py)
- [supabase/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/config.toml)
- [supabase/functions/\_shared/auth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/auth.ts)
- [supabase/functions/\_shared/cors.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/cors.ts)
- [supabase/functions/\_shared/json.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/json.ts)
- [supabase/functions/\_shared/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/supabaseAdmin.ts)
- [supabase/migrations/20260413120000\_add\_temporal\_metadata\_to\_corpus\_tables.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260413120000_add_temporal_metadata_to_corpus_tables.sql)

</details>
The Data Ingestion, Corpus, and Knowledge Pipeline is the backbone of GestaltView’s Digital Intelligence (DI). It transforms raw repository content, documents, and temporal signals into structured, high-dimensional vector embeddings and annotated knowledge fragments. This system ensures that Billy and other agents operate on a grounded, verifiable foundation of truth.

##### Knowledge Flow Overview

The pipeline operates in three distinct phases: **Ingestion**, **Synthesis**, and **Diligence**. Data is crawled or discovered, chunked into fragments, embedded into a 768-dimensional vector space, and finally annotated with semantic metadata (Loom annotations) to facilitate multi-hop reasoning.

**High-Level Ingestion Architecture**

```mermaid
flowchart TD
  A["Raw Corpus (.md, .pdf, .ts)"]
  B["scripts/ingest_corpus.py"]
  C["GIL Protocol (.yml)"]
  D["scripts/synthesize_corpus.py"]
  E["knowledge_fragments table"]
  F["skill_fragments table"]
  G["loom_annotations table"]
  H["summaries table"]
  I["768-dim Vector Index"]
  J["Billy Retrieval Pipeline"]
  A --> B
  C --> D
  B --> E
  B --> F
  D --> G
  D --> H
  E --> I
  F --> I
  G --> J
  I --> J
```

Sources: [scripts/ingest\_corpus.py1-27](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L1-L27) [scripts/synthesize\_corpus.py1-25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L1-L25) [scripts/gestaltview\_manifest\_pipeline.py20-26](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py#L20-L26)

---

#### 10.1. Corpus Ingestion & Knowledge Fragments

The primary entry point for repository knowledge is the `ingest_corpus.py` script. It performs recursive discovery of files defined in the `corpus-map.json` and processes them into overlapping chunks to preserve narrative flow.

- **Ingestion Engine**: `scripts/ingest_corpus.py` handles text extraction from multiple formats (PDF, Markdown, Source Code) and generates embeddings using models like `google/embedding-gecko-300M` [scripts/ingest\_corpus.py72-83](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L72-L83)
- **GIL Protocol**: The **Gestalt Information Layer (GIL)** protocol [scripts/gil\_protocol.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gil_protocol.py) defines how fragments are ranked and contextually weighted during synthesis.
- **Manifest Pipeline**: The `gestaltview_manifest_pipeline.py` provides a production-aligned implementation for batch processing, utilizing exponential backoff and structured logging [scripts/gestaltview\_manifest\_pipeline.py6-18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py#L6-L18)
- **Automation**: GitHub Actions such as `ingest_corpus_v2.yml` automate the pipeline, allowing for dry runs, embedding generation via Hugging Face, and direct Supabase synchronization  [.github/workflows/ingest\_corpus\_v2.yml1-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/%20.github/workflows/ingest_corpus_v2.yml#L1-L50)

For details, see [Corpus Ingestion & Knowledge Fragments](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/10.1-corpus-ingestion-and-knowledge-fragments).

---

#### 10.2. Gravity Protocol & Diligence Explorer

The system maintains high-fidelity provenance through the **Two-Pass Gravity Protocol**. This protocol ensures that every claim made by the DI can be traced back to a specific corpus fragment, preventing "hallucination drift."

- **Claim Analysis**: The protocol analyzes "load-bearing claims" and detects incentive distortions within ingested data [shared/gravity/protocol.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/gravity/protocol.ts)
- **Diligence Infrastructure**: The **Diligence Explorer** UI allows developers to audit the `Diligence_Reports/` CSV exports and verify OTS (OpenTimestamps) blockchain anchors for temporal proof.
- **Auditing**: The `gestaltview_crawler.py` script performs SEO and accessibility audits, flagging pages where core GestaltView terms are missing from the surface text [scripts/gestaltview\_crawler.py47-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_crawler.py#L47-L60)

For details, see [Gravity Protocol & Diligence Explorer](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/10.2-gravity-protocol-and-diligence-explorer).

---

#### 10.3. Profile Portrait & Consciousness Pipeline

The Consciousness Pipeline transforms raw ingestion signals into a cohesive "Portrait" of a user or entity. This is the mechanism by which the platform achieves "consciousness-serving" continuity.

- **Inference Queue**: Signals from `bucket_drops` and `knowledge_fragments` are collected in the `portrait_inference_queue`.
- **Thresholds**: A portrait is only generated once a minimum signal count is reached (typically 15 total signals, including at least one Bucket Drop).
- **Temporal Backfill**: The `temporal_backfill.py` script ensures that historical data is correctly timestamped and associated with the evolving profile [scripts/temporal\_backfill.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/temporal_backfill.py)
- **Artifact Generation**: LLM-based runs generate `portrait_inference_runs` which are eventually persisted as `ConsciousnessProfiles` for the frontend to display via the `ProfileDisplay` component.

For details, see [Profile Portrait & Consciousness Pipeline](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/10.3-profile-portrait-and-consciousness-pipeline).

---

#### Data Entity Mapping

This diagram bridges the gap between the conceptual "Knowledge" and the actual database tables used in the `gestaltview_manifest_pipeline.py`.

**Entity Relationship: Ingestion to Retrieval**

```mermaid
erDiagram
  scripts_ingest_corpus_py {
    string ref
  }
  knowledge_fragments {
    uuid id
    text content
    vector embedding_768
    text source_file
    text package_tag
  }
  scripts_synthesize_corpus_py {
    string ref
  }
  summaries {
    uuid id
    uuid document_id
    text content
    int level
  }
  loom_annotations {
    uuid id
    text type
    jsonb content
  }
  scripts_ingest_corpus_py ||--o{ knowledge_fragments : inserts
  scripts_synthesize_corpus_py ||--o{ summaries : generates
  scripts_synthesize_corpus_py ||--o{ loom_annotations : generates
```

Sources: [scripts/gestaltview\_manifest\_pipeline.py20-26](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py#L20-L26) [scripts/ingest\_corpus.py113-134](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L113-L134) [scripts/synthesize\_corpus.py7-11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L7-L11)

---

### Corpus Ingestion & Knowledge Fragments

> Source MHT: `Corpus Ingestion & Knowledge Fragments _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/10.1-corpus-ingestion-and-knowledge-fragments  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.agents/skills/SKILL\_INDEX.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/SKILL_INDEX.md?plain=1)
- [.github/workflows/ingest\_agent\_files.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_agent_files.yml)
- [.github/workflows/ingest\_corpus\_v2.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml)
- [.github/workflows/summarize\_corpus.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/summarize_corpus.yml)
- [.gv\_repo\_context.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.gv_repo_context.md?plain=1)
- [docs/GIL\_Protocol.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/GIL_Protocol.md?plain=1)
- [gil/targeted-summarization-agent-trainer.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-agent-trainer.yml)
- [gil/targeted-summarization-core-docs.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-core-docs.yml)
- [gil/targeted-summarization-mixed.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-mixed.yml)
- [gil/targeted-summarization-runs.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gil/targeted-summarization-runs.yml)
- [requirements.txt](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/requirements.txt)
- [scripts/gestaltview\_crawler.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_crawler.py)
- [scripts/gestaltview\_manifest\_pipeline.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py)
- [scripts/gil\_protocol.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gil_protocol.py)
- [scripts/ingest\_corpus.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py)
- [scripts/synthesize\_corpus.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py)
- [scripts/targeted-summarization.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/targeted-summarization.sh)
- [scripts/temporal\_backfill.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/temporal_backfill.py)
- [supabase/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/config.toml)
- [supabase/functions/\_shared/auth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/auth.ts)
- [supabase/functions/\_shared/cors.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/cors.ts)
- [supabase/functions/\_shared/json.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/json.ts)
- [supabase/functions/\_shared/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/supabaseAdmin.ts)
- [supabase/migrations/20260413120000\_add\_temporal\_metadata\_to\_corpus\_tables.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260413120000_add_temporal_metadata_to_corpus_tables.sql)

</details>
The Corpus Ingestion pipeline is the primary mechanism for transforming raw repository assets, documentation, and external data into structured, semantically searchable **Knowledge Fragments**. This system bridges the gap between static files and the Digital Intelligence (DI) runtime by providing 768-dimensional vector embeddings and multi-layered summaries governed by the **Gestalt Intentionality Layer (GIL)** protocol.

#### Pipeline Architecture & Data Flow

The ingestion process is a multi-stage Python-based workflow that operates either via local CLI or automated GitHub Actions. It handles discovery, text extraction, chunking, embedding generation, and synthesis (summarization).

##### High-Level Ingestion Flow

"Natural Language Space" (Files/Docs) is transformed into "Code Entity Space" (Database Fragments) through the following sequence:

1. **Discovery**: `ingest_corpus.py` scans the repository using `config/corpus-map.json` [scripts/ingest\_corpus.py82-83](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L82-L83)
2. **Extraction**: Text is pulled from `.md`, `.txt`, `.pdf`, and code files using `pdfplumber` or standard I/O [scripts/ingest\_corpus.py168-182](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L168-L182)
3. **Chunking**: Large documents are split into overlapping segments (default 4500 chars) to preserve narrative flow [scripts/ingest\_corpus.py77-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L77-L78)
4. **Embedding**: Text chunks are converted into 768-dim vectors using `google/embeddinggemma-300M` via `sentence-transformers` [.github/workflows/ingest\_corpus\_v2.yml51-52](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml#L51-L52)
5. **Persistence**: Fragments are upserted into the `knowledge_fragments` table in Supabase [scripts/gestaltview\_manifest\_pipeline.py25](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py#L25-L25)
6. **Synthesis**: `synthesize_corpus.py` runs an LLM-based second pass to generate `summaries` and `loom_annotations` governed by GIL protocols [scripts/synthesize\_corpus.py8-11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L8-L11)

##### Diagram: Ingestion Sequence

"Natural Language Space to Code Entity Space Mapping"

```mermaid
sequenceDiagram
  participant FS as Filesystem (Natural Language)
  participant IC as ingest_corpus.py
  participant ST as SentenceTransformer (768-dim)
  participant DB as Supabase (Code Entity Space)
  participant SC as synthesize_corpus.py
  FS->>IC: Discovery (corpus-map.json)
  IC->>IC: extract_text()
  IC->>IC: chunk_text()
  IC->>ST: encode(chunk)
  ST-->>IC: 768-dim Vector
  IC->>DB: Upsert knowledge_fragments
  DB-->>SC: Trigger Synthesis
  SC->>SC: apply_gil_protocol()
  SC->>DB: Write summaries & loom_annotations
```

**Sources:** [scripts/ingest\_corpus.py1-27](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L1-L27) [scripts/synthesize\_corpus.py1-26](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L1-L26) [.github/workflows/ingest\_corpus\_v2.yml1-78](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml#L1-L78)

---

#### Core Components

##### 1. Ingestion Engine (`ingest_corpus.py`)

This script is the entry point for raw data. It classifies documents using `DOCUMENT_TYPE_MAP` (e.g., `Protocol`, `PLK`, `Loom`, `Tribunal`) to assist in downstream retrieval [scripts/ingest\_corpus.py88-111](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L88-L111)

- **Key Function**: `extract_text_from_pdf` uses `pdfplumber` with a `pypdf` fallback to handle complex document formats [scripts/ingest\_corpus.py139-166](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L139-L166)
- **Deduplication**: Uses SHA-256 hashes of content to prevent duplicate fragments in the database.

##### 2. Manifest Pipeline (`gestaltview_manifest_pipeline.py`)

A production-aligned layer designed for resilience and observability. It manages the lifecycle of a "Processing Run" [scripts/gestaltview\_manifest\_pipeline.py2-26](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py#L2-L26)

- **Retry Logic**: Implements exponential backoff with jitter for database and LLM operations [scripts/gestaltview\_manifest\_pipeline.py188-199](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py#L188-L199)
- **Tenant Isolation**: Enforces `tenant_id` constraints to ensure data sovereignty [scripts/gestaltview\_manifest\_pipeline.py88-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py#L88-L110)

##### 3. Synthesis & GIL Protocol (`synthesize_corpus.py`)

The synthesis pass adds semantic depth. It uses the `GILProtocol` (Gestalt Intentionality Layer) defined in `gil/*.yml` to shape how fragments are summarized [scripts/synthesize\_corpus.py42-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L42-L60)

- **LLM Router**: Utilizes `llmrouter.py` to cascade through Gemini, HuggingFace, and OpenAI for cost-effective summarization [scripts/synthesize\_corpus.py18-24](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L18-L24)
- **Loom Annotations**: Generates specialized metadata that connects disparate fragments into a "Knowledge Loom" [scripts/synthesize\_corpus.py9-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L9-L10)

##### 4. Edge Functions & Workers

- **`corpus-harvest-worker`**: A Deno-based Supabase Edge Function that handles batch ingestion requests [supabase/functions/\_shared/auth.ts1-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/auth.ts#L1-L15)
- **Security**: Requires `GESTALTVIEW_INGEST_SECRET` via the `x-gsvw-ingest-secret` header [supabase/functions/\_shared/auth.ts5-14](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/auth.ts#L5-L14)

**Sources:** [scripts/ingest\_corpus.py88-119](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L88-L119) [scripts/gestaltview\_manifest\_pipeline.py1-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py#L1-L110) [scripts/synthesize\_corpus.py1-95](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/synthesize_corpus.py#L1-L95) [supabase/functions/\_shared/auth.ts1-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/functions/_shared/auth.ts#L1-L15)

---

#### Database Schema & Vector Storage

Knowledge is persisted in two primary tables within the Supabase `public` schema.

| Table | Purpose | Key Columns |
| --- | --- | --- |
| `knowledge_fragments` | Raw text segments + embeddings | `id`, `content`, `embedding` (vector(768)), `source_file`, `tags` |
| `skill_fragments` | Executable or procedural knowledge | `id`, `name`, `description`, `code_snippet`, `embedding` |
| `summaries` | LLM-generated abstractions | `document_id`, `level` (1-3), `content`, `run_id` |

##### Diagram: Database Entity Relationships

```mermaid
erDiagram
  knowledge_fragments {
    uuid id PK
    text content
    vector embedding
    n_768_dim text
    source_file text
    tags field11
  }
  summaries {
    uuid id PK
    uuid document_id FK
    int level
    text content
  }
  loom_annotations {
    uuid id PK
    uuid fragment_id FK
    text type
    jsonb metadata
  }
  knowledge_fragments ||--o{ summaries : has
  knowledge_fragments ||--o{ loom_annotations : annotated_by
```

**Sources:** [scripts/gestaltview\_manifest\_pipeline.py20-26](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gestaltview_manifest_pipeline.py#L20-L26) [scripts/ingest\_corpus.py6-16](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/ingest_corpus.py#L6-L16)

---

#### Automated Ingestion Workflows

The system uses GitHub Actions to maintain the corpus without manual intervention.

##### `ingest_corpus_v2.yml`

This workflow provides a UI for triggering ingestion with several parameters:

- **`dry_run`**: Validates discovery/chunking without writing to Supabase [.github/workflows/ingest\_corpus\_v2.yml6-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml#L6-L10)
- **`no_embed`**: Skips the heavy `sentence-transformers` step if only text updates are needed [.github/workflows/ingest\_corpus\_v2.yml11-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml#L11-L15)
- **Environment**: Targets `Production` or `Staging` to pull the correct `SUPABASE_SERVICE_ROLE_KEY` [.github/workflows/ingest\_corpus\_v2.yml46-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml#L46-L50)

##### `ingest_agent_files.yml`

A specialized version of the pipeline for the **Agent Trainer** subsystem. It tags fragments with `package: agent-trainer-package` to isolate training data from general platform documentation [.github/workflows/ingest\_agent\_files.yml27-30](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_agent_files.yml#L27-L30)

**Sources:** [.github/workflows/ingest\_corpus\_v2.yml1-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml#L1-L50) [.github/workflows/ingest\_agent\_files.yml1-40](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_agent_files.yml#L1-L40)

---

#### Temporal Backfill & Evolution

As the system evolves, the `temporal_backfill.py` script and associated migrations (e.g., `20260413120000_add_temporal_metadata_to_corpus_tables.sql`) allow for retroactively adding metadata like `created_at` or `version_fingerprint` to existing fragments, ensuring the Digital Intelligence has a sense of "narrative time" when retrieving memories.

**Sources:** [scripts/temporal\_backfill.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/temporal_backfill.py) [supabase/migrations/20260413120000\_add\_temporal\_metadata\_to\_corpus\_tables.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260413120000_add_temporal_metadata_to_corpus_tables.sql)

---

### Gravity Protocol & Diligence Explorer

> Source MHT: `Gravity Protocol & Diligence Explorer _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/10.2-gravity-protocol-and-diligence-explorer  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.snapshots/config.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.snapshots/config.json)
- [.snapshots/readme.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.snapshots/readme.md?plain=1)
- [.snapshots/sponsors.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.snapshots/sponsors.md?plain=1)
- [api/\_\_tests\_\_/profile-portrait-drain.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-drain.test.ts)
- [api/cron/codex-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts)
- [api/cron/profile-portrait-cadence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts)
- [api/cron/profile-portrait-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts)
- [api/cron/provenance-upgrade.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/provenance-upgrade.ts)
- [client/src/components/MassExodusButton.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/MassExodusButton.tsx)
- [client/src/components/NavBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NavBar.tsx)
- [client/src/components/TheoriesMap.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TheoriesMap.tsx)
- [client/src/components/agent-trainer/AgentFlowRail.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/agent-trainer/AgentFlowRail.tsx)
- [client/src/components/exhibits/ExhibitDemos.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/exhibits/ExhibitDemos.tsx)
- [client/src/data/exhibits.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/exhibits.ts)
- [client/src/data/platformModules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/platformModules.ts)
- [client/src/lib/agentFlow.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/agentFlow.ts)
- [client/src/pages/AlzheimersLegacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AlzheimersLegacyPage.tsx)
- [client/src/pages/ConsultingPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ConsultingPage.tsx)
- [client/src/pages/GravityInspectorPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GravityInspectorPage.tsx)
- [client/src/pages/LivingLegacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/LivingLegacyPage.tsx)
- [client/src/pages/MuseumPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MuseumPage.tsx)
- [client/src/pages/PullStringPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/PullStringPage.tsx)
- [client/src/pages/RapidPrototypePage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/RapidPrototypePage.tsx)
- [scripts/repo-to-markdown.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/repo-to-markdown.py)
- [scripts/repo-to-markdown.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/repo-to-markdown.sh)
- [specs/GestaltView\_Metrics.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/GestaltView_Metrics.md?plain=1)
- [specs/agents/Canned\_Response\_Spec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/agents/Canned_Response_Spec.md?plain=1)
- [vercel.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json)
- [wiki/GestaltView-CSI-Wiki-Combined.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/wiki/GestaltView-CSI-Wiki-Combined.md?plain=1)

</details>
The **Gravity Protocol** is a specialized two-pass analytical framework designed to ensure the integrity, provenance, and incentive-alignment of information within the GestaltView ecosystem. It serves as the "forensic moat" `client/src/pages/ConsultingPage.tsx:L20-L23` that protects the source language of users from reductionist AI processing. The **Diligence Explorer** is the primary interface for inspecting these audit trails, providing transparency into what was built, when it was built, and the underlying claims supporting it.

---

#### 1. The Two-Pass Gravity Protocol

The Gravity Protocol operates on the principle of "Load-Bearing Claims Analysis." It moves beyond surface-level sentiment to identify the structural integrity of a narrative or dataset.

##### 1.1 Implementation & Logic

The protocol is implemented as a two-pass system:

1. **Pass 1: Surface Mapping (`GravitySurfaceMap`)**: Scans the input for explicit claims, entities, and stated intentions.
2. **Pass 2: Report Generation (`GravityReport`)**: Analyzes the map for incentive distortions (e.g., where an AI might be "hallucinating" agreement to satisfy a prompt) and identifies "load-bearing" claims—statements that, if proven false, would collapse the entire argument.

##### 1.2 Incentive Distortion Detection

A key feature of the protocol is detecting when a Digital Intelligence (DI) output has drifted from the user's Constitutional Invariants `client/src/pages/ConsultingPage.tsx:L26-L30`. It flags "performative empathy" vs. "genuine resonance" `specs/GestaltView_Metrics.md:L32-L38`.

**Sources:** `client/src/pages/ConsultingPage.tsx:L20-L30`, `specs/GestaltView_Metrics.md:L32-L40`

---

#### 2. Diligence Explorer & Provenance

The Diligence Explorer (accessible via `/record`) `client/src/pages/MuseumPage.tsx:L49` provides a searchable archive of platform activity, backed by cryptographic and blockchain-based proof.

##### 2.1 OTS Blockchain Timestamps

GestaltView utilizes the **OpenTimestamps (OTS)** protocol to provide decentralized proof of existence for all major artifacts. This ensures that the "Recognition Gap"—the distance between internal worlds and institutional reduction—is bridged with immutable evidence `client/src/pages/ConsultingPage.tsx:L14-L18`.

##### 2.2 Provenance Upgrade Workflow

The system uses a scheduled task to transition temporary timestamps into permanent Bitcoin-backed attestations.

- **Cron Endpoint**: `/api/cron/provenance-upgrade` `vercel.json:L8-L10`
- **Schedule**: Every 2 hours `vercel.json:L9`
- **Logic**:
  1. Finds `provenance_envelopes` with `ots_status='pending'` older than 90 minutes `api/cron/provenance-upgrade.ts:L5-L7`.
  2. Attempts to upgrade the `.ots` receipt via public calendar nodes (Alice, Bob, Finney) `api/cron/provenance-upgrade.ts:L18-L22`.
  3. If successful, updates the status to `upgraded` and stores the Bitcoin attestation `api/cron/provenance-upgrade.ts:L180-L193`.

##### 2.3 Data Structure: Diligence Reports

Diligence reports are stored in the `Diligence_Reports/` directory (represented in Supabase storage) and often exported as CSVs for external audit.

| Field | Description |
| --- | --- |
| `id` | Unique UUID for the provenance envelope. |
| `ots_status` | Current state (`pending` or `upgraded`) `api/cron/provenance-upgrade.ts:L127-L131`. |
| `envelope_json` | The full metadata packet including hashes and context `api/cron/provenance-upgrade.ts:L131`. |
| `bitcoin_attestation` | Metadata regarding the block height and calendar used `api/cron/provenance-upgrade.ts:L180-L184`. |

**Sources:** `api/cron/provenance-upgrade.ts:L1-L204`, `vercel.json:L8-L10`, `client/src/pages/MuseumPage.tsx:L49`

---

#### 3. Technical Data Flow

The following diagram illustrates how a raw claim is processed through the Gravity Protocol and eventually committed to the Diligence record.

##### Gravity Analysis & Provenance Pipeline

```mermaid
flowchart TD
  A["User Input / DI Response"]
  B["GravitySurfaceMap Pass"]
  C["Incentive Distortion Check"]
  D["Load-Bearing Claims Analysis"]
  E["GravityReport Generation"]
  F["Create ProvenanceEnvelope"]
  G["OTS Pending Receipt"]
  H["/api/cron/provenance-upgrade"]
  I["Bitcoin Block Attestation"]
  J["Diligence Explorer UI"]
  A --> B
  B --> C
  C --> D
  D --> E
  E --> F
  F --> G
  G --> H
  H --> I
  I --> J
```

**Sources:** `api/cron/provenance-upgrade.ts:L1-L10`, `client/src/pages/ConsultingPage.tsx:L20-L30`, `specs/GestaltView_Metrics.md:L32-L40`

---

#### 4. API & Integration

##### 4.1 Diligence Endpoints

The backend provides several endpoints for interacting with the Diligence system, configured in `vercel.json`.

- **Endpoint**: `/api/diligence.ts` `vercel.json:L34-L36`
- **Role**: Primary fetcher for the Diligence Explorer UI.
- **Security**: Includes `api/_lib/**` for shared authentication and persistence logic `vercel.json:L35`.

##### 4.2 Associated Cron Jobs

The Diligence system relies on several maintenance tasks to keep the record current:

- **`codex-drain`**: Processes export jobs for the Codex (HTML/JSON) every 2 minutes `api/cron/codex-drain.ts:L4-L5`.
- **`profile-portrait-drain`**: Updates the "Portrait" of the user's consciousness based on new signals (including Gravity reports) every 5 minutes `api/cron/profile-portrait-drain.ts:L1-L5`.

##### 4.3 UI to Code Mapping

The following diagram maps the visual components of the Diligence Explorer to their underlying code entities.

```mermaid
flowchart TD
  UI1["/record (MuseumPage)"]
  UI2["Gravity Inspector Panel"]
  UI3["Provenance Timeline"]
  E1["client/src/pages/MuseumPage.tsx"]
  E2["client/src/pages/GravityInspectorPage.tsx"]
  E3["api/diligence.ts"]
  E4["api/cron/provenance-upgrade.ts"]
  UI1 --> E1
  UI2 --> E2
  UI3 --> E3
  E3 --> E4
```

**Sources:** `client/src/pages/MuseumPage.tsx:L49`, `vercel.json:L34-L36`, `api/cron/provenance-upgrade.ts:L1-L10`

---

#### 5. Summary of Protocol Invariants

The Gravity Protocol enforces the following "Constitutional Invariants" `client/src/pages/ConsultingPage.tsx:L26-L30`:

1. **No Extraction**: Claims must remain attached to their original context.
2. **Cognitive Justice**: Diverse knowledge systems must be validated rather than reduced `specs/GestaltView_Metrics.md:L40-L47`.
3. **Auditability**: Every major synthesis event must have a corresponding provenance envelope and OTS receipt.

**Sources:** `client/src/pages/ConsultingPage.tsx:L26-L30`, `specs/GestaltView_Metrics.md:L40-L47`

---

### Profile Portrait & Consciousness Pipeline

> Source MHT: `Profile Portrait & Consciousness Pipeline _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/10.3-profile-portrait-and-consciousness-pipeline  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/profile-portrait-drain.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-drain.test.ts)
- [api/\_lib/profilePortrait.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profilePortrait.ts)
- [api/\_lib/profilePortraitPersistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profilePortraitPersistence.ts)
- [api/consciousness/dynamic-inner-world.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/consciousness/dynamic-inner-world.ts)
- [api/cron/codex-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts)
- [api/cron/profile-portrait-cadence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts)
- [api/cron/profile-portrait-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts)
- [api/cron/provenance-upgrade.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/provenance-upgrade.ts)
- [api/profile/personality.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/personality.ts)
- [client/src/components/ProfileDisplay.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ProfileDisplay.tsx)
- [client/src/hooks/usePortrait.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/usePortrait.ts)
- [docs/audits/codex-artifact-rendering-pipeline-audit.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/audits/codex-artifact-rendering-pipeline-audit.md?plain=1)
- [shared/profileIngestion.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/profileIngestion.ts)
- [shared/profilePortrait.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/profilePortrait.ts)
- [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1)
- [specs/gen-engine/codex-artifact-rendering-pipeline-audit.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/codex-artifact-rendering-pipeline-audit.md?plain=1)
- [vercel.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json)

</details>
The **Profile Portrait** system is a longitudinal inference engine that synthesizes a user's accumulated behavioral, linguistic, and emotional data into a structured psychological mirror [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md11-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1#L11-L15) Unlike point-in-time assessments, the Portrait Layer transforms raw signals from across the platform—including Bucket Drops, Memory Entries, and Billy sessions—into a versioned record of emergent identity [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md27-32](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1#L27-L32)

#### System Architecture & Data Flow

The pipeline operates as a background processing system driven by thresholds and periodic cadences. It transitions raw signals into validated `ProfilePortraitArtifact` records stored in the `profile_portraits` and `portrait_dimensions` tables [docs/audits/codex-artifact-rendering-pipeline-audit.md18-22](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/audits/codex-artifact-rendering-pipeline-audit.md?plain=1#L18-L22)

##### Consciousness Pipeline Logic

The following diagram illustrates the transition from Natural Language Space (user inputs) to the Code Entity Space (inference and persistence).

**Portrait Generation & Persistence Flow**

```mermaid
flowchart TD
  BD["Bucket Drops (Linguistic Signals)"]
  ME["Memory Entries (Semantic Anchors)"]
  GR["Gravity Reports (Load-bearing Claims)"]
  LPP["loadProfilePortraitForUser()"]
  BPP["buildProfilePortrait()"]
  PQ["portrait_inference_queue"]
  PIR["portrait_inference_runs"]
  PP["profile_portraits table"]
  PD["portrait_dimensions table"]
  PPA["persistPortraitArtifact()"]
  BD -->|Threshold Trigger (>15 total)| PQ
  PQ -->|api/cron/profile-portrait-drain.ts| PIR
  PIR -->|Calls| LPP
  BD -->|Evidence Input| BPP
  ME -->|Evidence Input| BPP
  GR -->|Evidence Input| BPP
  BPP -->|Returns ProfilePortrait| PPA
  PPA -->|SQL Insert| PP
  PPA -->|SQL Insert| PD
```

**Sources:** [api/\_lib/profilePortrait.ts18-54](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profilePortrait.ts#L18-L54) [api/cron/profile-portrait-drain.ts164-213](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts#L164-L213) [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md39-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1#L39-L50)

#### Key Implementation Components

##### 1. Portrait Inference Queue & Drain

Portrait generation is managed by a queue-based system to ensure reliability and idempotency.

- **Thresholds:** Inference is triggered when a user accumulates at least 15 total signals, with a minimum of 1 **Bucket Drop** [api/cron/profile-portrait-drain.ts170](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts#L170-L170)
- **Drain Cron:** The `api/cron/profile-portrait-drain.ts` runs every 5 minutes (via `vercel.json`) to claim pending jobs from `portrait_inference_queue` [vercel.json16-18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json#L16-L18) [api/cron/profile-portrait-drain.ts93-111](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts#L93-L111)
- **Inference Runs:** Every attempt is logged in `portrait_inference_runs` with metadata including model version (`profile-portrait-v1`), duration, and validation status [api/cron/profile-portrait-drain.ts124-143](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts#L124-L143)

##### 2. Monthly Cadence Cron

To ensure portraits remain "living," a monthly sweep identifies users whose latest portrait predates the current month.

- **Endpoint:** `api/cron/profile-portrait-cadence.ts` [api/cron/profile-portrait-cadence.ts1-5](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts#L1-L5)
- **Logic:** It lists candidates using `listMonthlyPortraitCadenceCandidates` and invokes the `maybe_queue_portrait_cadence` RPC to add them back to the inference queue [api/cron/profile-portrait-cadence.ts65-94](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts#L65-L94)

##### 3. Data Model: `ProfilePortraitArtifact`

The portrait is composed of exactly 10 dimensions [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md119](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1#L119-L119)

| Dimension Key | Description |
| --- | --- |
| `linguistic_signature` | Patterns in language and PLK resonance [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md75](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1#L75-L75) |
| `cognitive_architecture` | Structural mapping of thought patterns [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md76](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1#L76-L76) |
| `emotional_landscape` | Core emotional valences and intensity [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md77](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1#L77-L77) |
| `identity_narrative` | The synthesized "story of self" [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md79](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1#L79-L79) |
| `growth_edges` | Areas of tension or emerging resolution [specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md83](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/specs/gen-engine/SPEC-GenEngine-ProfilePortrait-Layer.md?plain=1#L83-L83) |

**Sources:** [shared/profilePortrait.ts1-100](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/profilePortrait.ts#L1-L100) [api/\_lib/profilePortraitPersistence.ts134-163](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profilePortraitPersistence.ts#L134-L163)

#### API & UI Integration

##### Consciousness Surface API

The platform provides a unified surface for retrieving the portrait alongside the standard personality profile.

- **Endpoint:** `GET /api/profile/personality` returns a `PersonalityProfileResponse` containing both the standard profile and the latest `ProfilePortrait` [api/profile/personality.ts12-15](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/personality.ts#L12-L15)
- **Persistence Preference:** The handler prefers the latest validated record from the database via `loadLatestPersistedPortraitRecord` but can fall back to manual inference if no record exists [api/profile/personality.ts45-48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/personality.ts#L45-L48)
- **Dynamic Inner World:** The `/api/consciousness/dynamic-inner-world.ts` endpoint includes the portrait as a core component of the "Museum of You" response [api/consciousness/dynamic-inner-world.ts89-92](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/consciousness/dynamic-inner-world.ts#L89-L92)

##### ProfileDisplay Component

The `ProfileDisplay.tsx` component is the primary UI for rendering the portrait. It handles:

- **Version Tracking:** Displays the portrait version and confidence score [client/src/components/ProfileDisplay.tsx67-73](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ProfileDisplay.tsx#L67-L73)
- **Evidence Attribution:** Shows the total record count used for the synthesis [client/src/components/ProfileDisplay.tsx75-77](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ProfileDisplay.tsx#L75-L77)
- **Dimension Rendering:** Iterates through `portrait.dimensions` to display summaries, raw quotes, and "deltas" (changes from the previous version) [client/src/components/ProfileDisplay.tsx84-102](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ProfileDisplay.tsx#L84-L102)

**Consciousness Data Access Flow**

```mermaid
flowchart TD
  PD["ProfileDisplay.tsx"]
  AP["/api/profile/personality"]
  ADIW["/api/consciousness/dynamic-inner-world"]
  PPP["profilePortraitPersistence.ts"]
  LP["loadLatestPersistedPortraitRecord()"]
  DB["Supabase: profile_portraits"]
  PD -->|fetch| AP
  PD -->|fetch| ADIW
  AP -->|Calls| LP
  ADIW -->|Calls| LP
  LP -->|Query| PPP
  PPP -->|SQL| DB
```

**Sources:** [client/src/components/ProfileDisplay.tsx17-133](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ProfileDisplay.tsx#L17-L133) [api/profile/personality.ts37-56](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/personality.ts#L37-L56) [api/consciousness/dynamic-inner-world.ts65-92](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/consciousness/dynamic-inner-world.ts#L65-L92)

#### Persistence Implementation

The persistence spine uses `fetch` to interact with Supabase REST endpoints using the `service_role` key for administrative operations [api/\_lib/profilePortraitPersistence.ts119-132](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profilePortraitPersistence.ts#L119-L132)

- **`persistPortraitArtifact`**: Atomically writes the portrait header and its 10 associated dimensions [api/\_lib/profilePortraitPersistence.ts209-213](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profilePortraitPersistence.ts#L209-L213)
- **`recordPortraitRenderEvent`**: Tracks when a portrait is viewed on a specific surface (e.g., the personality page) to measure engagement [api/profile/personality.ts50-54](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/personality.ts#L50-L54)

**Sources:** [api/\_lib/profilePortraitPersistence.ts1-227](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profilePortraitPersistence.ts#L1-L227) [api/cron/profile-portrait-drain.ts209-213](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts#L209-L213)

---

### Specialized Platform Modules

> Source MHT: `Specialized Platform Modules _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/12-specialized-platform-modules  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/creation-corner-synthesize.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/creation-corner-synthesize.test.ts)
- [api/\_\_tests\_\_/documents.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/documents.test.ts)
- [api/\_\_tests\_\_/workspaces.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/workspaces.test.ts)
- [api/\_lib/supabase.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/supabase.ts)
- [api/documents/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/documents/index.ts)
- [api/workspaces/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/workspaces/index.ts)
- [client/src/components/MassExodusButton.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/MassExodusButton.tsx)
- [client/src/components/MusicalDnaTrackUploadPanel.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/MusicalDnaTrackUploadPanel.tsx)
- [client/src/components/NavBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NavBar.tsx)
- [client/src/components/TheoriesMap.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TheoriesMap.tsx)
- [client/src/components/agent-trainer/AgentFlowRail.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/agent-trainer/AgentFlowRail.tsx)
- [client/src/components/exhibits/BillyMusicInterview.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/exhibits/BillyMusicInterview.tsx)
- [client/src/components/exhibits/ExhibitDemos.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/exhibits/ExhibitDemos.tsx)
- [client/src/components/workspaces-interface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/workspaces-interface.tsx)
- [client/src/data/exhibits.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/exhibits.ts)
- [client/src/data/platformModules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/platformModules.ts)
- [client/src/hooks/useTrackUpload.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useTrackUpload.ts)
- [client/src/lib/agentFlow.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/agentFlow.ts)
- [client/src/lib/musicalDnaAmbient.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/musicalDnaAmbient.ts)
- [client/src/lib/musicalDnaTracks.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/musicalDnaTracks.ts)
- [client/src/lib/spotifyMusicalDna.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/spotifyMusicalDna.ts)
- [client/src/lib/userSurfaceSettings.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/userSurfaceSettings.ts)
- [client/src/pages/AlzheimersLegacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AlzheimersLegacyPage.tsx)
- [client/src/pages/ConsultingPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ConsultingPage.tsx)
- [client/src/pages/DocumentsPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DocumentsPage.tsx)
- [client/src/pages/GravityInspectorPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GravityInspectorPage.tsx)
- [client/src/pages/LivingLegacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/LivingLegacyPage.tsx)
- [client/src/pages/MuseumPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MuseumPage.tsx)
- [client/src/pages/MusicalDNAPage.css](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.css)
- [client/src/pages/MusicalDNAPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx)
- [client/src/pages/PullStringPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/PullStringPage.tsx)
- [client/src/pages/RapidPrototypePage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/RapidPrototypePage.tsx)
- [client/src/pages/SettingsPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SettingsPage.tsx)
- [client/src/pages/WorkspacesPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/WorkspacesPage.tsx)
- [client/src/tests/musical-dna-ambient.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/musical-dna-ambient.test.ts)
- [client/src/tests/musical-dna-tracks.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/musical-dna-tracks.test.ts)
- [client/src/tests/spotify-musical-dna.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/spotify-musical-dna.test.ts)

</details>
The GestaltView platform is extended by a suite of specialized, AI-powered modules that apply the core **Digital Intelligence (DI)** and **PLK (Private Language Key)** resonance engines to specific domains. These modules—ranging from career enhancement to musical identity—share a common infrastructure for data persistence, artifact synthesis, and client-side rendering.

Each module typically consists of a dedicated API surface (under `api/modules/*`), a shared logic engine (under `shared/modules/*`), and a specialized UI layer that leverages the platform's **Billy** integration for guided interaction.

##### Module Architecture Overview

The platform uses a "room-and-module" pattern where specialized features are hosted in dedicated pages but communicate with the core via the `BillyExhibitBridge`.

| Module | Core Purpose | Primary Tech/Code Entities |
| --- | --- | --- |
| **Resume Rockstar** | Career resonance & ATS scoring | `resumeRockstar.ts`, `ResumeRockstarPage` |
| **Musical DNA** | Somatic & emotional music mapping | `MusicalDNAPage.tsx`, `useTrackUpload.ts` |
| **SymbioCoder** | Intent-based pair programming | `symbio-coder/analyze`, `SymbioCoderPage` |
| **Vibe Coder** | Flow state & tone detection | `vibeEngine.ts`, `VibeAnalysisCard` |
| **Workbook** | Structured curriculum & sync | `schemas.ts`, `WorkbookPage` |

---

##### Resume Rockstar Module

The **Resume Rockstar** module is a high-precision career alignment engine. Unlike standard resume builders, it focuses on **Cognitive State Inference** and **PLK Resonance**, ensuring that a user's professional materials reflect their unique linguistic patterns while satisfying institutional constraints (ATS).

- **ATS 6-Dimension Scorer**: Evaluates resumes against industry-standard parsing logic.
- **8-Type Metaphor Detector**: Identifies the underlying narrative archetype of the user's career.
- **Enhancement Pipeline**: A 6-step process that refines raw experience into high-resonance artifacts.

For technical details on the scoring engine and enhancement pipeline, see [Resume Rockstar Module](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/12.1-resume-rockstar-module).

**Sources:** [client/src/data/platformModules.ts1-20](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/platformModules.ts#L1-L20) [api/\_lib/supabase.ts206-224](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/supabase.ts#L206-L224)

---

##### SymbioCoder & Vibe Coder

These modules provide a "symbiotic" layer for technical workflows. They bridge the gap between raw code and the developer's internal state.

- **SymbioCoder**: Classifies `CodingIntent` and detects `FlowState`. It uses a "weaving" process to integrate Billy's insights directly into the development cycle.
- **Vibe Coder**: A lighter, tone-focused module that analyzes the "vibe" of a project or communication through the `vibeEngine.ts`.
- **Workbook System**: Manages structured learning and project items, ensuring local state is synchronized with the server via `sync-runs`.

For details on intent classification and the workbook schema, see [SymbioCoder & Vibe Coder Modules](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/12.2-symbiocoder-and-vibe-coder-modules).

**Sources:** [client/src/pages/SettingsPage.tsx109-141](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SettingsPage.tsx#L109-L141) [api/workspaces/index.ts1-50](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/workspaces/index.ts#L1-L50)

---

##### Musical DNA

**Musical DNA** is a somatic mapping module that tracks the user's actual musical identity—not just genres, but the emotional and nervous-system patterns triggered by sound. It integrates with Spotify and allows for local track uploads to build a "DNA Vector" of the user's resonance.

###### Musical DNA System Interaction

The following diagram illustrates how the `MusicalDNAPage` bridges the gap between natural language (Billy's interview) and the code entities managing the music data.

Title: Musical DNA Entity Mapping

```mermaid
flowchart TD
  A["BillyMusicInterview"]
  B["PLK Fragments"]
  C["Musical Identity"]
  D["MusicalDNAPage.tsx"]
  E["useTrackUpload.ts"]
  F["uploadUserFileToServer"]
  G["BillyExhibitBridge"]
  H["BILLY_MUSICAL_DNA_SYSTEM_HINT"]
  I["BucketDropRow"]
  A -->|Interview Summary| B
  B -->|Resonance| C
  D -->|uses| E
  E -->|calls| F
  D -->|bridges| G
  G -->|tone| H
  F -->|persists| I
  C --> H
  B --> I
```

**Sources:** [client/src/pages/MusicalDNAPage.tsx102-129](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx#L102-L129) [client/src/hooks/useTrackUpload.ts114-160](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useTrackUpload.ts#L114-L160) [client/src/components/exhibits/BillyMusicInterview.tsx10-14](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/exhibits/BillyMusicInterview.tsx#L10-L14)

###### Key Components:

- **Somatic Modes**: Supports `bilateral`, `trilateral`, and `quadlateral` modes for EMDR-adjacent processing [client/src/pages/MusicalDNAPage.tsx69-88](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx#L69-L88)
- **Spotify Integration**: Uses `spotifyTrackToMusicalDnaSong` to map external metadata to internal `dnaVector` representations [client/src/lib/spotifyMusicalDna.ts60-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/spotifyMusicalDna.ts#L60-L82)
- **Ambient Inference**: A background process (toggleable in `SettingsPage`) that infers musical patterns from journals and profile signals [client/src/lib/userSurfaceSettings.ts3-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/userSurfaceSettings.ts#L3-L10)

---

##### Shared Module Infrastructure

All specialized modules leverage a common set of API patterns and database structures to ensure consistency across the platform.

###### Data Persistence Flow

This diagram shows how module-specific data (like a music interview or a resume draft) is ingested into the core system.

Title: Specialized Module Data Ingestion

```mermaid
flowchart TD
  M1["ResumeRockstar"]
  M2["MusicalDNA"]
  M3["WorkspacesInterface"]
  API["api/modules/*"]
  S1["BucketDropRow"]
  S2["UserFileRecord"]
  S3["OrchestrationDecisionRow"]
  M1 -->|synthesize| API
  M2 -->|upload| S2
  M3 -->|POST /api/workspaces| API
  API -->|INSERT| S1
  API -->|trigger| S3
```

###### Common Utilities:

- **`appFetchJson`**: Standardized fetch wrapper for module API calls [client/src/pages/MusicalDNAPage.tsx13](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MusicalDNAPage.tsx#L13-L13)
- **`useSEO`**: Hook for managing module-specific metadata and canonical URLs [client/src/pages/ConsultingPage.tsx40-46](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ConsultingPage.tsx#L40-L46)
- **`GlassCard`**: Shared UI component for maintaining the platform's "Neural Aurora" aesthetic across different modules [client/src/components/ui/GlassCard.tsx1-20](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/ui/GlassCard.tsx#L1-L20)

**Sources:** [client/src/components/workspaces-interface.tsx163-180](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/workspaces-interface.tsx#L163-L180) [api/\_lib/supabase.ts225-258](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/supabase.ts#L225-L258) [client/src/lib/userSurfaceSettings.ts51-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/userSurfaceSettings.ts#L51-L65)

---

### Resume Rockstar Module

> Source MHT: `Resume Rockstar Module _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/12.1-resume-rockstar-module  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/profile-ingestion.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-ingestion.test.ts)
- [api/\_\_tests\_\_/route-embodiment.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/route-embodiment.test.ts)
- [api/\_lib/profileIngestion.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts)
- [api/\_lib/response.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/response.ts)
- [api/embodiments/by-route.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiments/by-route.ts)
- [api/modules/vibe-coder/\_lib/vibeEngine.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/modules/vibe-coder/_lib/vibeEngine.ts)
- [api/profile/ingest.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/ingest.ts)
- [client/src/components/MassExodusButton.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/MassExodusButton.tsx)
- [client/src/components/NavBar.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/NavBar.tsx)
- [client/src/components/TheoriesMap.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TheoriesMap.tsx)
- [client/src/components/agent-trainer/AgentFlowRail.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/agent-trainer/AgentFlowRail.tsx)
- [client/src/components/exhibits/ExhibitDemos.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/exhibits/ExhibitDemos.tsx)
- [client/src/data/exhibits.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/exhibits.ts)
- [client/src/data/platformModules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/data/platformModules.ts)
- [client/src/hooks/useDigitalIntelligence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts)
- [client/src/hooks/useDynamicInnerWorld.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDynamicInnerWorld.ts)
- [client/src/lib/agentFlow.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/agentFlow.ts)
- [client/src/modules/Vibe\_Coder/components/VibeAnalysisCard.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx)
- [client/src/pages/AlzheimersLegacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AlzheimersLegacyPage.tsx)
- [client/src/pages/ConsultingPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ConsultingPage.tsx)
- [client/src/pages/GravityInspectorPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/GravityInspectorPage.tsx)
- [client/src/pages/LivingLegacyPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/LivingLegacyPage.tsx)
- [client/src/pages/MuseumPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/MuseumPage.tsx)
- [client/src/pages/PullStringPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/PullStringPage.tsx)
- [client/src/pages/RapidPrototypePage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/RapidPrototypePage.tsx)

</details>
The **Resume Rockstar** module is a specialized high-fidelity career enhancement engine within GestaltView. It moves beyond standard keyword matching by utilizing the platform's core **Personal Language Key (PLK)** resonance and **Cognitive State Inference** to align a user's professional artifacts with their internal cognitive architecture and the expectations of modern Applicant Tracking Systems (ATS).

#### Module Overview & Purpose

Resume Rockstar is designed to close the "Recognition Gap" [client/src/pages/ConsultingPage.tsx15-18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ConsultingPage.tsx#L15-L18)—the distance between a person's complex internal world and the reductive way institutions (and ATS algorithms) perceive them. It achieves this through a 6-step enhancement pipeline that analyzes resumes across six dimensions of professional signal.

##### Key Capabilities

- **ATS 6-Dimension Scorer**: Evaluates resumes on Impact, Clarity, Structural Integrity, Narrative Flow, Technical Density, and PLK Alignment.
- **PLK Resonance Engine**: Ensures the professional narrative matches the user's documented "Personal Language Key" [shared/llm/plk.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/llm/plk.ts)
- **8-Type Metaphor Detector**: Identifies the underlying cognitive metaphors (e.g., "The Architect", "The Weaver") used in the user's self-description.
- **Cognitive State Inference**: Infers the user's likely state (e.g., "Flow", "Ambiguity Recovery") based on the linguistic patterns in their work history.

---

#### Data Flow & System Architecture

The module spans the client-side UI, a dedicated API surface, and shared logic that interfaces with the broader GestaltView personality ingestion pipeline.

##### Resume Rockstar Processing Pipeline

The following diagram illustrates the flow from raw resume upload to the final enhanced artifact.

**Diagram: Resume Rockstar Data Lifecycle**

```mermaid
flowchart TD
  User["User (ResumeRockstarPage)"]
  FE["Client Module: resumeRockstar.ts"]
  API_A["Analyze Endpoint"]
  Parser["Profile Parser (profileIngestion.ts)"]
  Dim["Dimension Blueprint (creative_expression, etc.)"]
  Scorer["6-Dimension Scorer"]
  API_E["Enhancement Pipeline"]
  Step1["Clean Markdown/ATS Structure"]
  Step2["Resonance Loop (plk.ts)"]
  Step3["Metric Extraction"]
  Step4["Metaphor Detector"]
  Step5["Tone Adjustment"]
  Step6["Tribunal Review (Agent Council)"]
  Export["Export/Save (Supabase)"]
  CX["Codex Artifacts Table"]
  User -->|Upload/Paste| FE
  FE -->|POST /api/modules/resume-rockstar/analyze| API_A
  API["API"]
  A_Parser["A_Parser"]
  API -->|Extract Sections| A_Parser
  Parser -->|Identify Dimensions| Dim
  Dim -->|Scoring| Scorer
  Scorer -->|Return Scores/Gaps| User
  User -->|POST /api/modules/resume-rockstar/enhance| API_E
  E_Step1["E_Step1"]
  API -->|Step 1: Structural Repair| E_Step1
  Step1 -->|Step 2: PLK Injection| Step2
  Step2 -->|Step 3: Impact Quant| Step3
  Step3 -->|Step 4: Metaphor Alignment| Step4
  Step4 -->|Step 5: Cognitive Polish| Step5
  Step5 -->|Step 6: Final Review| Step6
  Step6 -->|Resulting Artifact| Export
  Export -->|Codex Ready| CX
```

**Sources:** [api/\_lib/profileIngestion.ts22-66](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L22-L66) [client/src/pages/ConsultingPage.tsx15-18](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ConsultingPage.tsx#L15-L18) [client/src/hooks/useDigitalIntelligence.ts78-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts#L78-L82)

---

#### Implementation Details

##### Personality Dimension Alignment

Resume Rockstar utilizes the same `DIMENSION_BLUEPRINTS` found in the platform's core ingestion engine to categorize professional experience [api/\_lib/profileIngestion.ts22-66](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L22-L66)

| Dimension Key | Professional Application | Keywords Used for Scoring |
| --- | --- | --- |
| `creative_expression` | Portfolio & Design impact | `create, build, design, visual` |
| `collaboration_style` | Team leadership & Mentorship | `team, collaborate, partner, review` |
| `resilience_pattern` | Crisis management & Recovery | `recover, adapt, challenge, through` |
| `learning_style` | Technical growth & R&D | `prototype, experiment, study, practice` |
| `conflict_resolution` | Stakeholder management | `direct, repair, trust, honest` |

**Sources:** [api/\_lib/profileIngestion.ts27-64](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L27-L64)

##### Core API Endpoints

The module is served via `api/modules/resume-rockstar/*`:

1. **`/analyze`**: Performs the initial 6-dimension scoring. It uses `extractProfileSections` to split the resume into headers (e.g., EXPERIENCE, EDUCATION) and maps them to cognitive dimensions [api/\_lib/profileIngestion.ts74-99](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L74-L99)
2. **`/enhance`**: Executes the 6-step pipeline. This endpoint utilizes the `buildPlkSystemPrompt` to ensure the AI's suggestions are grounded in the user's unique linguistic style [api/\_lib/profileIngestion.ts4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L4-L4)
3. **`/export`**: Generates ATS-optimized Markdown or PDF versions of the enhanced resume.
4. **`/save`**: Persists the result to the `user_profile_ingestion_runs` and `profile_ingestion_sources` tables in Supabase [api/\_\_tests\_\_/profile-ingestion.test.ts71-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-ingestion.test.ts#L71-L82)

---

#### Digital Intelligence (DI) Presence

When a user enters the Resume Rockstar interface (typically via the **Creation Corner**), the system activates **The Art Teacher** embodiment profile.

- **Persona Slug**: `art-teacher` [client/src/hooks/useDigitalIntelligence.ts79](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts#L79-L79)
- **Role**: Context weaving and artifact synthesis.
- **Greeting**: *"Alright — what are we actually making today? Show me what you've got."* [client/src/hooks/useDigitalIntelligence.ts81](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts#L81-L81)

The Art Teacher guides the user through the enhancement steps, providing feedback on "Narrative Flow" and "PLK Alignment" [client/src/hooks/useDigitalIntelligence.ts78-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts#L78-L82)

---

#### Code Entity Mapping

This diagram bridges the conceptual module components to the specific code entities and files that implement them.

**Diagram: Resume Rockstar Entity Map**

```mermaid
classDiagram
  class ResumeRockstarPage {
    +useDigitalIntelligence("creation-corner")
    +handleAnalyze()
    +handleEnhance()
  }
  class shared_modules_resumeRockstar_ts {
    ResumeRockstarShared
    +SCORE_DIMENSIONS
    +METAPHOR_TYPES
    +calculateAtsScore()
  }
  class api_lib_profileIngestion_ts {
    ProfileIngestionEngine
    +DIMENSION_BLUEPRINTS
    +extractProfileSections()
    +runProfileIngestion()
  }
  class api_lib_supabase_ts {
    SupabasePersistence
    +insertRow("user_profile_ingestion_runs")
    +insertRow("profile_ingestion_sources")
  }
  ResumeRockstarPage ..> shared_modules_resumeRockstar_ts : Uses types
  ResumeRockstarPage ..> api_lib_profileIngestion_ts : Calls via /analyze
  api_lib_profileIngestion_ts ..> api_lib_supabase_ts : Persists results
```

**Sources:** [client/src/hooks/useDigitalIntelligence.ts78-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts#L78-L82) [api/\_lib/profileIngestion.ts22-66](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L22-L66) [api/\_\_tests\_\_/profile-ingestion.test.ts71-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-ingestion.test.ts#L71-L82)

#### Technical Requirements for Ingestion

To be effectively processed by the Rockstar module, resumes should ideally follow the GestaltView profile format, using `##` headers to denote sections. The `extractProfileSections` function specifically looks for these markers to isolate professional evidence [api/\_lib/profileIngestion.ts74-88](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L74-L88) Structural artifacts like JSON blocks or raw code fences are stripped during the evidence-gathering phase to ensure the scoring engine only evaluates human-readable professional signal [api/\_lib/profileIngestion.ts126-139](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L126-L139)

**Sources:** [api/\_lib/profileIngestion.ts74-139](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L74-L139)

---

### SymbioCoder & Vibe Coder Modules

> Source MHT: `SymbioCoder & Vibe Coder Modules _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/12.2-symbiocoder-and-vibe-coder-modules  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/\_\_tests\_\_/documents.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/documents.test.ts)
- [api/\_\_tests\_\_/profile-ingestion.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-ingestion.test.ts)
- [api/\_\_tests\_\_/route-embodiment.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/route-embodiment.test.ts)
- [api/\_\_tests\_\_/workspaces.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/workspaces.test.ts)
- [api/\_lib/profileIngestion.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts)
- [api/\_lib/response.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/response.ts)
- [api/\_lib/supabase.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/supabase.ts)
- [api/documents/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/documents/index.ts)
- [api/embodiments/by-route.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiments/by-route.ts)
- [api/modules/vibe-coder/\_lib/vibeEngine.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/modules/vibe-coder/_lib/vibeEngine.ts)
- [api/profile/ingest.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/profile/ingest.ts)
- [api/workspaces/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/workspaces/index.ts)
- [client/src/components/workspaces-interface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/workspaces-interface.tsx)
- [client/src/hooks/useDigitalIntelligence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts)
- [client/src/hooks/useDynamicInnerWorld.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDynamicInnerWorld.ts)
- [client/src/modules/Vibe\_Coder/components/VibeAnalysisCard.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx)
- [client/src/pages/DocumentsPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DocumentsPage.tsx)
- [client/src/pages/WorkspacesPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/WorkspacesPage.tsx)

</details>
#### Overview

The Specialized Platform Modules extend GestaltView's core Digital Intelligence (DI) capabilities into specific domains: creative coding and musical resonance. **SymbioCoder** focuses on the "Symbiotic Weaving" of human intent and code execution, while **Vibe Coder** translates musical metadata and emotional resonance into actionable personality profiles and UI aesthetics.

Both modules leverage the **Workbook system**, a shared persistence layer for tracking items, synchronization runs, and cross-module state.

---

#### SymbioCoder: Symbiotic Weaving

SymbioCoder is designed to bridge the gap between "Natural Language Space" (human intent) and "Code Entity Space" (implementation). It operates by classifying intent and detecting the user's cognitive flow state to provide contextual suggestions.

##### Key Logic & Classification

The module utilizes specialized endpoints under `api/modules/symbio-coder/*` to process user input:

- **CodingIntent Classification**: Determines if the user is in an exploratory phase, a refactoring phase, or a terminal debugging phase.
- **FlowState Detection**: Analyzes the cadence of interactions to adjust the DI's level of intervention (e.g., providing high-level architecture during "Flow" vs. granular fixes during "Struggle").

##### Implementation Flow

The `useDigitalIntelligence` hook maps the **Creation Corner** space to the `art-teacher` embodiment [client/src/hooks/useDigitalIntelligence.ts78-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts#L78-L82) which serves as the primary interface for SymbioCoder.

Title: SymbioCoder Intent-to-Entity Mapping

```mermaid
flowchart TD
  A["User Input (Intent)"]
  B["intentClassifier"]
  C["CodingIntent"]
  D["api/modules/symbio-coder/analyze"]
  E["api/modules/symbio-coder/suggest"]
  F["api/modules/symbio-coder/chat"]
  G["CodexArtifact (Refactor Plan)"]
  H["CodexArtifact (Snippet)"]
  I["Billy Request Pipeline"]
  J["shared/codex/contracts.ts"]
  A --> B
  B --> C
  C -->|REFACTOR| D
  C -->|GENERATE| E
  C -->|DEBUG| F
  D --> G
  E --> H
  F --> I
  G --> J
  H --> J
```

**Sources:** [client/src/hooks/useDigitalIntelligence.ts78-82](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useDigitalIntelligence.ts#L78-L82) [api/\_lib/supabase.ts225-258](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/supabase.ts#L225-L258)

---

#### Vibe Coder: Emotional Resonance Engine

Vibe Coder translates cultural anchors (primarily music) into Digital Intelligence parameters. It uses the `vibeEngine.ts` to calculate emotional scores and aesthetic gradients.

##### VibeAnalysisCard & VibeEngine

The `VibeAnalysisCard` component visualizes a `VibeProfile`, which includes `emotionScores` (Energy, Joy, Melancholy, Tension, Serenity) [client/src/modules/Vibe\_Coder/components/VibeAnalysisCard.tsx11-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx#L11-L33)

The `vibeEngine.ts` provides the core normalization and derivation logic:

- `normalizeEmotionScores`: Clamps raw values between 0 and 1 [api/modules/vibe-coder/\_lib/vibeEngine.ts12-22](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/modules/vibe-coder/_lib/vibeEngine.ts#L12-L22)
- `deriveDominantEmotion`: Sorts scores to find the primary emotional driver [api/modules/vibe-coder/\_lib/vibeEngine.ts24-26](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/modules/vibe-coder/_lib/vibeEngine.ts#L24-L26)
- `vibeToNeuralAuroraGradient`: Maps the dominant emotion to a Tailwind CSS gradient (e.g., "Energy" maps to `from-orange-500 via-red-500 to-pink-500`) [api/modules/vibe-coder/\_lib/vibeEngine.ts28-38](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/modules/vibe-coder/_lib/vibeEngine.ts#L28-L38)

##### Music DNA Integration

Vibe Coder informs the `music_dna_resonance` dimension of a user's profile, tracking how emotion through sound links to identity [api/\_lib/profileIngestion.ts60-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L60-L65)

Title: Vibe Coder Data Flow

```mermaid
flowchart TD
  S["Song Metadata"]
  VE["vibeEngine.ts"]
  ES["EmotionScores"]
  DE["deriveDominantEmotion()"]
  VAC["VibeAnalysisCard.tsx"]
  NAG["vibeToNeuralAuroraGradient()"]
  PI["profileIngestion.ts (music_dna_resonance)"]
  UI["Neural Aurora UI Theme"]
  CP["Consciousness Profile"]
  S --> VE
  VE --> ES
  ES --> DE
  DE --> VAC
  DE --> NAG
  ES --> PI
  NAG --> UI
  PI --> CP
```

**Sources:** [api/modules/vibe-coder/\_lib/vibeEngine.ts1-39](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/modules/vibe-coder/_lib/vibeEngine.ts#L1-L39) [client/src/modules/Vibe\_Coder/components/VibeAnalysisCard.tsx1-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx#L1-L60) [api/\_lib/profileIngestion.ts60-65](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/profileIngestion.ts#L60-L65)

---

#### The Workbook System

The Workbook system provides a structured workspace for both SymbioCoder and Vibe Coder to persist intermediate states, document analyses, and shared room data.

##### Workspace & Document Management

- **Workspaces**: Managed via `WorkspacesInterface.tsx`, allowing users to create "Founder Looms" or "Document Studios" [client/src/components/workspaces-interface.tsx48-71](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/workspaces-interface.tsx#L48-L71)
- **Persistence**: Workspaces are stored in Supabase via `createWorkspaceRoom` and `listWorkspaceRooms` [api/workspaces/index.ts7-11](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/workspaces/index.ts#L7-L11)
- **Documents**: The `api/documents/index.ts` handler manages the lifecycle of document analyses, including `syncWorkspaceDocumentToCorpus` for RAG-ready ingestion [api/documents/index.ts11-13](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/documents/index.ts#L11-L13)

##### Data Schemas

The Workbook utilizes `shared/workbook/schemas.ts` (and associated Supabase tables) to ensure consistency:

- **Workbook Items**: Atomic units of work (code snippets, vibe snapshots, or document summaries).
- **Sync Runs**: Tracking the synchronization of local state to the permanent Supabase record.

| Feature | Implementation File | Role |
| --- | --- | --- |
| Workspace CRUD | `api/workspaces/index.ts` | REST API for room management |
| Document Ingestion | `api/documents/index.ts` | Handles file analysis and corpus sync |
| Local Storage | `workspaces-interface.tsx` | Fallback for offline/private mode [client/src/components/workspaces-interface.tsx31-46](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/workspaces-interface.tsx#L31-L46) |
| Auth Integration | `requireAuth` | Ensures tier-based access to mutations [api/workspaces/index.ts53-68](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/workspaces/index.ts#L53-L68) |

**Sources:** [client/src/components/workspaces-interface.tsx1-71](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/workspaces-interface.tsx#L1-L71) [api/workspaces/index.ts1-110](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/workspaces/index.ts#L1-L110) [api/documents/index.ts1-186](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/documents/index.ts#L1-L186)

---

## Volume: Observability, Quality & Reference

### Observability, Testing & Operations

> Source MHT: `Observability, Testing & Operations _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/11-observability-testing-and-operations  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.codex/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/config.toml)
- [.github/workflows/orientation-check.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml)
- [.vscode/mcp.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/mcp.json)
- [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)
- [README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1)
- [client/src/canonical/RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/RDRC.md?plain=1)
- [client/src/lib/sentry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sentry.ts)
- [docs/AIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/AIFlow.md?plain=1)
- [docs/APIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/APIFlow.md?plain=1)
- [docs/Manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1)
- [docs/PlaybookOperatorManual.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1)
- [docs/PlaybookSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookSpec.md?plain=1)
- [docs/SentrySetup.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SentrySetup.md?plain=1)
- [docs/SymbioticWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1)
- [docs/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Workflows.md?plain=1)
- [package-lock.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package-lock.json)
- [package.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json)
- [pnpm-lock.yaml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/pnpm-lock.yaml)
- [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py)
- [scripts/test-manifest-sync.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh)
- [scripts/test-orientation-checkin.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-orientation-checkin.sh)

</details>
This section provides a high-level overview of the quality assurance, monitoring, and operational infrastructure of the GestaltView v2.0 platform. The system employs a multi-layered approach to stability, ranging from automated CI/CD gates and unit tests to real-time error tracking and specialized operational scripts for repository maintenance.

#### System Observability & Quality Architecture

The observability and testing stack is designed to ensure that the "Consciousness-Serving AI" remains reliable across its distributed components (Vite frontend, Vercel serverless API, and Supabase data layer).

##### Quality Assurance Flow

The system follows a "Symbiotic Workflow" where changes are validated against live runtime code, operational state logs, and architectural documentation [docs/PlaybookOperatorManual.md66-95](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1#L66-L95)

```mermaid
flowchart TD
  Sentry["@sentry/react"]
  Health["gv-health-check.sh"]
  BillyCheck["billycheck.ts"]
  Vitest["Vitest (Unit/Integration)"]
  Playwright["Playwright (E2E)"]
  Orientation["Orientation Check (CI)"]
  Manifest["generate_repo_manifest.py"]
  BugWalk["BugWalk Protocol"]
  Migration["run_migration.py"]
  App["Client Runtime"]
  Shared["Shared Logic"]
  Docs["Documentation"]
  API["API Runtime"]
  Sentry -->|Telemetry| App
  Vitest -->|Validation| Shared
  Manifest -->|Sync| Docs
  Health -->|Verification| API
```

Sources: [package.json7-58](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L7-L58) [docs/PlaybookOperatorManual.md105-137](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1#L105-L137) [docs/SymbioticWorkflow.md166-188](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1#L166-L188)

---

#### 11.1 Sentry Telemetry & Error Tracking

GestaltView utilizes Sentry for real-time error tracking and performance monitoring. Unlike standard Next.js implementations, this repository uses a **Vite-specific initialization pattern** [docs/SentrySetup.md19-33](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SentrySetup.md?plain=1#L19-L33)

- **Initialization:** The client-side SDK is initialized via `initClientSentry()` in the browser entry point [client/src/lib/sentry.ts30-86](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sentry.ts#L30-L86)
- **Privacy Controls:** To protect user data in the "Sanctuary" and "Inner World," `replayIntegration` is configured with `blockAllMedia: true` and `maskAllText: true` [client/src/lib/sentry.ts73-76](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sentry.ts#L73-L76)
- **Dynamic Loading:** The SDK is loaded via dynamic import to minimize initial bundle size [client/src/lib/sentry.ts46-48](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sentry.ts#L46-L48)

For implementation details and environment configuration, see **[Sentry Telemetry & Error Tracking](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/11.1-sentry-telemetry-and-error-tracking)**.

Sources: [client/src/lib/sentry.ts1-117](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sentry.ts#L1-L117) [docs/SentrySetup.md1-63](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SentrySetup.md?plain=1#L1-L63)

---

#### 11.2 Test Suite & Quality Gates

The testing infrastructure is divided into unit tests, API contract tests, and repository integrity checks.

| Test Layer | Tooling | Location |
| --- | --- | --- |
| **Client Unit** | Vitest | `client/src/tests/` |
| **API Contracts** | Shell / Node | `api/__tests__/` |
| **Agent Trainer** | Python / Pytest | `agent_trainer/gestaltview_agent_trainer/tests/` |
| **E2E / Integration** | Playwright | `tests/` |

##### Key Quality Gates

- **Orientation Check:** A GitHub Action that validates the repository orientation packet [package.json29](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L29-L29)
- **Manifest Sync:** The `test-manifest-sync.sh` script ensures that documentation does not become stale (7-day threshold) [scripts/test-manifest-sync.sh1-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh#L1-L10)
- **BugWalk:** A structured protocol for issue tracking and resolution (`new-bugwalk.sh` and `bugwalk-closeout.sh`) [package.json44-45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L44-L45)

For details on running tests and the BugWalk protocol, see **[Test Suite & Quality Gates](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/11.2-test-suite-and-quality-gates)**.

Sources: [package.json54-57](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L54-L57) [scripts/generate\_repo\_manifest.py76-90](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py#L76-L90) [docs/Manifest.md16-29](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1#L16-L29)

---

#### 11.3 Operational Scripts & Maintenance Tooling

The `scripts/` directory contains the "operational spine" of the repository, enabling developers to maintain the complex multi-repo ecosystem.

##### Core Operational Tools

- **Health Checks:** `gv-health-check.sh` provides a status overview of the local and remote environments [package.json24](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L24-L24)
- **Manifest Generation:** `generate_repo_manifest.py` creates machine-readable snapshots (`gestaltview-v2.manifest.json`) for the KnowledgeLoom and Billy retrieval [scripts/generate\_repo\_manifest.py1-26](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py#L1-L26)
- **Continuity Validation:** `validate-continuity-stack.mjs` ensures the auth and session layers are properly configured [package.json30](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L30-L30)

##### Repository Alignment

The system uses `gsvw_align_ingest.py` and `gsvw_patch_package_json.mjs` to keep dependencies and ingestion pipelines in sync across the Brain (Corpus) and Body (Runtime).

For the full catalog of scripts and CLI tools, see **[Operational Scripts & Maintenance Tooling](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/11.3-operational-scripts-and-maintenance-tooling)**.

Sources: [package.json7-58](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L7-L58) [docs/Manifest.md59-96](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1#L59-L96) [docs/PlaybookOperatorManual.md192-258](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1#L192-L258)

---

#### Technical Mapping: Operations to Code

The following diagram maps high-level operational tasks to the specific scripts and files that execute them.

```mermaid
flowchart TD
  Task1["'Check system health'"]
  Task2["'Update repo documentation'"]
  Task3["'Deploy database changes'"]
  Task4["'Track a new bug'"]
  Script1["scripts/gv-health-check.sh"]
  Script2["scripts/generate_repo_manifest.py"]
  Script3["scripts/run_migration.py"]
  Script4["scripts/new-bugwalk.sh"]
  API["/api/billy-health.ts"]
  JSON["docs/gestaltview-v2.manifest.json"]
  SQL["supabase/migrations/"]
  Task1 --> Script1
  Task2 --> Script2
  Task3 --> Script3
  Task4 --> Script4
  Script1 -->|validates| API
  Script2 -->|outputs| JSON
  Script3 -->|executes| SQL
```

Sources: [package.json7-58](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json#L7-L58) [scripts/generate\_repo\_manifest.py8-21](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py#L8-L21) [docs/Manifest.md149-183](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1#L149-L183)

---

### Sentry Telemetry & Error Tracking

> Source MHT: `Sentry Telemetry & Error Tracking _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/11.1-sentry-telemetry-and-error-tracking  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [api/GPT/gestaltview\_gpt\_actions\_package\_v2/fastapi\_actions\_stub.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py)
- [api/\_lib/embeddings.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/embeddings.ts)
- [api/llm-proxy.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/llm-proxy.ts)
- [api/trainer/persona-chat.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/persona-chat.ts)
- [client/src/components/WhatWasBuilt.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/WhatWasBuilt.tsx)
- [client/src/lib/sentry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/sentry.ts)
- [docs/SentrySetup.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SentrySetup.md?plain=1)
- [instrument.d.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/instrument.d.ts)
- [instrument.js](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/instrument.js)
- [package-lock.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package-lock.json)
- [package.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/package.json)
- [pnpm-lock.yaml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/pnpm-lock.yaml)

</details>
GestaltView v2 utilizes Sentry for comprehensive error tracking, performance monitoring, and session replay across both its client-side React application and server-side Node.js/Vercel environments. The implementation follows a Vite-specific pattern rather than a Next.js pattern, ensuring compatibility with the project's frontend build toolchain.

#### System Architecture & Data Flow

The telemetry system is split into two primary initializers: `initClientSentry` for the browser environment and `initRuntimeSentry` for the server/Node.js environment.

##### Telemetry Initialization Flow

The following diagram illustrates how Sentry is integrated into the application lifecycle.

**Sentry Initialization Logic**

```mermaid
flowchart TD
  A["client/src/main.tsx"]
  B["initClientSentry()"]
  C["Dynamic Import"]
  D["@sentry/react"]
  E["Sentry.init()"]
  F["replayIntegration"]
  G["browserTracingIntegration"]
  H["instrument.js"]
  I["initRuntimeSentry()"]
  J["@sentry/node"]
  K["Sentry.init()"]
  L["nodeProfilingIntegration"]
  M["expressIntegration"]
  N["Error Events & Replays"]
  O["Performance Traces"]
  P["Profiling Data"]
  A --> B
  B --> C
  C -->|Success| D
  D --> E
  E --> F
  E --> G
  H --> I
  I --> J
  J --> K
  K --> L
  K --> M
  F --> N
  G --> O
  L --> P
```

Sources: `client/src/lib/sentry.ts:L30-L86`, `instrument.js:L68-L105`, `docs/SentrySetup.md:L21-L33`

#### Client-Side Implementation

The client-side implementation is housed in `client/src/lib/sentry.ts`. It utilizes a dynamic import strategy to ensure that the Sentry SDK does not bloat the initial bundle size for users if telemetry is not required or fails to load.

##### Key Functions and Variables

| Entity | Description |
| --- | --- |
| `initClientSentry()` | The main entry point for browser telemetry. It reads `VITE_SENTRY_DSN` and initializes the SDK with privacy controls. |
| `captureReactError()` | A specialized wrapper for React Error Boundaries. It associates the `componentStack` with the exception for better debugging. |
| `VITE_SENTRY_DSN` | The environment variable containing the Sentry project DSN. Defaults to a project-specific URL if not provided. |
| `readBoolean` | Helper to parse truthy/falsy environment strings (e.g., "true", "1", "on"). |
| `readSampleRate` | Helper to safely parse floating-point sample rates between 0.0 and 1.0. |

##### Privacy Controls

To maintain cognitive justice and privacy, the `replayIntegration` is configured with strict masking:

- `blockAllMedia: true`: Prevents images and videos from being captured in replays.
- `maskAllText: true`: Masks all text content to prevent PII leakage.

Sources: `client/src/lib/sentry.ts:L9-L81`, `client/src/lib/sentry.ts:L101-L116`

#### Server-Side Implementation

The server-side telemetry is managed via `instrument.js` (and its definition file `instrument.d.ts`). This module is designed to be imported using the Node.js `--import tsx` flag during server startup.

##### Environment Configuration Helpers

The system uses several internal helpers to process environment variables:

- `readBoolean(value, fallback)`: Normalizes environment strings into booleans `instrument.js:L15-L21`.
- `readSampleRate(value, fallback)`: Ensures sample rates are finite numbers within the valid range `instrument.js:L23-L30`.
- `mergeIntegrations(configured, additional)`: Handles the merging of default Sentry integrations with optional profiling or express-specific integrations `instrument.js:L47-L66`.

##### Initialization Pattern

`initRuntimeSentry` identifies the runtime environment (Node vs Vercel) and sets appropriate tags and release versions based on `VERCEL_GIT_COMMIT_SHA` `instrument.js:L68-L105`.

Sources: `instrument.js:L15-L105`, `package.json:L11`

#### Vite-Specific Pattern (Non-Next.js)

As documented in `docs/SentrySetup.md`, the repository specifically avoids the `@sentry/nextjs` SDK because the core runtime is **Vite + React**.

**Vite vs. Next.js Detection Logic**

```mermaid
flowchart TD
  A["package.json"]
  B["Is Next.js?"]
  C["Filesystem"]
  D["Apply Vite Pattern"]
  E["client/src/main.tsx calls initClientSentry()"]
  F["Use @sentry/react"]
  G["Avoid webpack.autoInstrument* flags"]
  H["Apply Next.js Pattern"]
  I["Use @sentry/nextjs"]
  J["Add instrumentation.ts"]
  A -->|grep 'next'| B
  C -->|rg 'next.config'| B
  B -->|No| D
  D --> E
  D --> F
  D --> G
  B -->|Yes| H
  H --> I
  H --> J
```

Sources: `docs/SentrySetup.md:L9-L32`

#### Integration with Other Systems

Sentry events are often correlated with other observability tools in the stack, specifically **Braintrust** for LLM tracing.

| Tool | Role | File Reference |
| --- | --- | --- |
| **Braintrust** | Tracing LLM calls (Gemini, Groq, etc.) and logging spans. | `instrument.js:L111-L136`, `api/_lib/embeddings.ts:L85-L121` |
| **Vercel Analytics** | High-level performance and usage metrics. | `package.json:L138-L140` |
| **Sentry** | Low-level exception tracking and session replay. | `client/src/lib/sentry.ts:L30-L86` |

##### Python Stub Initialization

For Python-based components (like the GPT Actions Stub), a separate initialization logic exists in `api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py`. It uses `sentry_sdk.init` with similar environment variable helpers (`_read_bool_env`, `_read_float_env`) to ensure consistent telemetry across languages.

Sources: `api/GPT/gestaltview_gpt_actions_package_v2/fastapi_actions_stub.py:L33-L50`

---

### Test Suite & Quality Gates

> Source MHT: `Test Suite & Quality Gates _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/11.2-test-suite-and-quality-gates  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.github/workflows/ingest\_agent\_files.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_agent_files.yml)
- [.github/workflows/ingest\_corpus\_v2.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/ingest_corpus_v2.yml)
- [.github/workflows/recursive.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/recursive.yml)
- [.github/workflows/summarize\_corpus.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/summarize_corpus.yml)
- [.vscode/settings.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/settings.json)
- [api/\_\_tests\_\_/supabase-rebuild-repair.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/supabase-rebuild-repair.test.ts)
- [api/trainer/study-sources/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/index.ts)
- [api/trainer/study-sources/recommendations.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts)
- [bugwalks/BugWalkBoard.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/bugwalks/BugWalkBoard.md?plain=1)
- [client/src/features/agent-trainer/AgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx)
- [client/src/features/agent-trainer/hooks/useTrainingRun.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts)
- [client/src/features/agent-trainer/lib/trainerApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts)
- [client/src/hooks/useSession.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSession.ts)
- [client/src/tests/agent-trainer-api.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/agent-trainer-api.test.ts)
- [openai.yaml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/openai.yaml)
- [server/agent-trainer/persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts)
- [server/agent-trainer/study-sources.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/study-sources.ts)
- [server/agent-trainer/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/supabaseAdmin.ts)
- [server/trainer/experiment-repository.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/trainer/experiment-repository.ts)
- [shared/agent-trainer/schemas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts)

</details>
The GestaltView v2.0 test infrastructure is a multi-layered quality assurance system designed to enforce **Constitutional Invariants** and technical stability across the client, API, and Agent Trainer subsystems. It combines traditional unit/e2e testing with specialized protocols like the **BugWalk** and automated **Quality Gates** in CI/CD.

#### 1. Client-Side Test Suite (Vitest)

The frontend uses **Vitest** for unit and integration testing. Tests are co-located or housed within `client/src/tests/` to validate core logic including artifact rendering, authentication state, and the Agent Trainer API client.

##### 1.1. Agent Trainer API Validation

The `client/src/tests/agent-trainer-api.test.ts` file ensures that the client-side `TrainerApi` class correctly handles complex orchestration scenarios, such as:

- **Auth Circuit Breaking**: If a 401/403 is received, the circuit opens to prevent request floods `client/src/features/agent-trainer/lib/trainerApi.ts:L238-L245`.
- **Multi-Origin Retries**: The client automatically retries failed relative fetches against absolute URLs defined in `VITE_API_BASE_URL` or `VITE_BILLY_API_URL` `client/src/features/agent-trainer/lib/trainerApi.ts:L160-L224`.
- **Malformed Data Filtering**: Parsing logic in `parseTrainingRunsResponse` strips invalid run objects to prevent UI crashes `client/src/tests/agent-trainer-api.test.ts:L78-L84`.

##### 1.2. Key Test Files

| Test File | Focus Area |
| --- | --- |
| `client/src/tests/agent-trainer-api.test.ts` | Validates `TrainerApi` retries, diagnostics, and mutation receipts `client/src/tests/agent-trainer-api.test.ts:L1-L20`. |
| `api/__tests__/` | API contract tests for Supabase integration and schema repairs. |
| `server/__tests__/` | Logic tests for the Agent Council (Tribunal) and Trainer worker loops. |

**Sources:** `client/src/features/agent-trainer/lib/trainerApi.ts:L1-L245`, `client/src/tests/agent-trainer-api.test.ts:L1-L196`

---

#### 2. CI/CD Quality Gates & GitHub Actions

GestaltView utilizes GitHub Actions to enforce "Lockdown Passes" and automated validation during the development lifecycle.

##### 2.1. Recursive Builder Lockdown

The `Recursive Builder Lockdown Pass` (`.github/workflows/recursive.yml`) is a specialized workflow that uses LLMs (Groq/Llama-3.3) to audit the codebase against **SPEC-2** requirements.

- **Pre-generation Validation**: Runs `npm run health`, `npm run build`, and `npm test` before any code modification `.github/workflows/recursive.yml:L84-L139`.
- **Implementation Branching**: Can produce bounded repo edits on a review PR to advance the "capture -> orb -> queue" lifecycle `.github/workflows/recursive.yml:L10-L17`.

##### 2.2. Corpus Ingestion Pipeline

The `Ingest Corpus Files v2` workflow ensures that knowledge fragments added to the system meet embedding and chunking standards.

- **Dry Run Support**: Allows validating discovery and chunking without writing to the production Supabase instance `.github/workflows/ingest_corpus_v2.yml:L6-L10`.
- **Loom Annotation**: Automatically triggers `scripts/synthesize_corpus.py` after ingestion to maintain the Knowledge Loom `.github/workflows/ingest_corpus_v2.yml:L162-L168`.

##### Quality Gate Data Flow

Title: CI/CD Quality Gate Pipeline

```mermaid
flowchart TD
  A["Developer Change"]
  B["BugWalk Protocol"]
  C["npm run build / health"]
  D[".github/workflows/"]
  E["recursive.yml (Lockdown Pass)"]
  F["ingest_corpus_v2.yml"]
  G["Vitest Suite"]
  H["TypeScript Type Check"]
  I["Embedding Validation"]
  J["Quality Gate Result"]
  K["Vercel Deployment"]
  L["Block Merge / Alert Sentry"]
  A --> B
  B --> C
  C --> D
  D --> E
  D --> F
  E --> G
  E --> H
  F --> I
  G --> J
  H --> J
  I --> J
  J -->|Pass| K
  J -->|Fail| L
```

**Sources:** `.github/workflows/recursive.yml:L1-L139`, `.github/workflows/ingest_corpus_v2.yml:L1-L168`

---

#### 3. The BugWalk Protocol

The **BugWalk** is a manual-to-technical bridge used to track UX friction and runtime bugs that automated tests might miss. It is governed by the `bugwalks/BugWalkBoard.md` file.

##### 3.1. Dual-Log Fix Protocol

Every bug fix must follow a strict synchronization rule:

1. **Move Card**: Move the BugWalk card to `In Flight` `bugwalks/BugWalkBoard.md:L10`.
2. **Sync Update**: Update `BugWalkBoard.md` and `docs/CurrentState.md` in the same commit `bugwalks/BugWalkBoard.md:L11`.
3. **Evidence Tracking**: Every sighting must be anchored to evidence, such as a `.mht` capture or a specific Vercel build log `bugwalks/BugWalkBoard.md:L70-L74`.

##### 3.2. Implementation Status Mapping

Title: BugWalk to Code Entity Mapping

```mermaid
flowchart TD
  BW1["BW-2026-05-03-01: Vercel Build Failure"]
  BW2["BW-2026-05-02-01: Sanctuary Willow Hidden"]
  CE1["client/src/features/sanctuary/SanctuaryPage.tsx"]
  CE2["shared/agent-trainer/schemas.ts"]
  CE3["server/agent-trainer/persistence.ts"]
  BW1 -->|TypeScript Contract Repair| CE2
  BW2 -->|CSS/Responsive Fix| CE1
  BW1 -->|Database Migration Check| CE3
```

**Sources:** `bugwalks/BugWalkBoard.md:L1-L104`

---

#### 4. Trainer Persistence & Reliability

The Agent Trainer includes built-in quality gates for agent "Personhood" and training runs, managed via `server/agent-trainer/persistence.ts`.

##### 4.1. Training Run Lifecycle Validation

The system prevents invalid state transitions for training jobs:

- **Blocker Detection**: The `MutationBlocker` type identifies why a run cannot proceed (e.g., missing study sources or auth failure) `client/src/features/agent-trainer/hooks/useTrainingRun.ts:L58-L60`.
- **Checksum Verification**: Agent versions are validated using SHA-256 checksums of their canonical specs to ensure integrity during the "Normalize -> Curriculum -> Author" pipeline `server/agent-trainer/persistence.ts:L40-L63`.

##### 4.2. API Resilience

The `recommendations.ts` endpoint implements a strict timeout policy to prevent slow LLM retrieval from hanging the UI.

- **Timeout**: 6,000ms limit via `withTimeout` `api/trainer/study-sources/recommendations.ts:L9-L20`.
- **Degraded State**: If a timeout occurs, the system falls back to `lastGoodRecommendationSnapshot` to maintain "fail-open" availability `api/trainer/study-sources/recommendations.ts:L88-L109`.

##### Training Run Persistence Model

| Table / Entity | Purpose | Validation Logic |
| --- | --- | --- |
| `training_runs` | Tracks goal, status, and max cycles. | Validates `quality_threshold` (1-5) `server/agent-trainer/persistence.ts:L69-L90`. |
| `training_steps` | Individual stage logs (e.g., `author`, `evaluate`). | Records latency and estimated cost `server/agent-trainer/persistence.ts:L92-L106`. |
| `eval_results` | Judge model verdicts (Pass/Fail/Warning). | Enforces dimension scores via `EvalResultSchema` `server/agent-trainer/persistence.ts:L108-L121`. |

**Sources:** `server/agent-trainer/persistence.ts:L1-L121`, `api/trainer/study-sources/recommendations.ts:L1-L109`, `client/src/features/agent-trainer/hooks/useTrainingRun.ts:L1-L213`

---

### Operational Scripts & Maintenance Tooling

> Source MHT: `Operational Scripts & Maintenance Tooling _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/11.3-operational-scripts-and-maintenance-tooling  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.agents/Agents.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/Agents.md?plain=1)
- [.agents/skills/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/CurrentState.md?plain=1)
- [.agents/skills/INDEX.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/INDEX.md?plain=1)
- [.agents/skills/agents/AGENTS.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/agents/AGENTS.md?plain=1)
- [.agents/skills/gestaltview-blackboard-room/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/gestaltview-blackboard-room/SKILL.md?plain=1)
- [.agents/skills/gestaltview-current-state-maintenance/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/gestaltview-current-state-maintenance/SKILL.md?plain=1)
- [.agents/skills/gestaltview-schema-supabase/SKILL.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/gestaltview-schema-supabase/SKILL.md?plain=1)
- [.agents/skills/manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.agents/skills/manifest.json)
- [.codex/Agents.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/Agents.md?plain=1)
- [client/src/components/DemoGate.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/DemoGate.tsx)
- [client/src/components/UpgradeBanner.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/UpgradeBanner.tsx)
- [client/src/pages/HeirloomCompanionPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/HeirloomCompanionPage.tsx)
- [client/src/pages/Pricing.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Pricing.tsx)
- [gestaltview\_supabase\_recreation\_package/canonical\_migrations/20260330115505\_trainer\_security\_hardening.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gestaltview_supabase_recreation_package/canonical_migrations/20260330115505_trainer_security_hardening.sql)
- [gestaltview\_supabase\_recreation\_package/canonical\_migrations/20260330120000\_trainer\_core.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gestaltview_supabase_recreation_package/canonical_migrations/20260330120000_trainer_core.sql)
- [gestaltview\_supabase\_recreation\_package/db\_object\_inventory.csv](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gestaltview_supabase_recreation_package/db_object_inventory.csv)
- [gestaltview\_supabase\_recreation\_package/db\_object\_inventory.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/gestaltview_supabase_recreation_package/db_object_inventory.md?plain=1)
- [scripts/README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1)
- [scripts/gsvw\_align\_ingest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gsvw_align_ingest.py)
- [scripts/gsvw\_check\_alignment\_env.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gsvw_check_alignment_env.mjs)
- [scripts/gsvw\_patch\_package\_json.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gsvw_patch_package_json.mjs)
- [scripts/init-collaborator-system.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh)
- [supabase/GestaltView\_Schema\_Alignment\_Reference.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1)
- [supabase/gestaltview-supabase-linter-remediation-plan.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/gestaltview-supabase-linter-remediation-plan.md?plain=1)
- [supabase/migrations/20260330115505\_trainer\_security\_hardening.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260330115505_trainer_security_hardening.sql)
- [supabase/migrations/20260330120000\_trainer\_core.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260330120000_trainer_core.sql)
- [supabase/migrations/20260621000000\_collaborator\_security\_rls.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260621000000_collaborator_security_rls.sql)
- [supabase/supabase-db-dump-2026-06-21T06-21-21-963Z.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/supabase-db-dump-2026-06-21T06-21-21-963Z.sql)
- [supabase\_start\_issues.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase_start_issues.md?plain=1)

</details>
This section details the specialized scripts and maintenance tools located primarily in the `scripts/` directory. These utilities govern the operational lifecycle of the GestaltView platform, including health monitoring, repository synchronization, environment bootstrapping, and the Digital Intelligence (DI) embodiment sync.

#### Repository Manifest & Environment Control

The system relies on a set of scripts to maintain alignment between the codebase, the environment variables, and external collaboration partners.

##### Environment Bootstrapping

The `scripts/codex-env.sh` script serves as the primary wrapper for executing commands within a fully hydrated environment [scripts/README.md1-17](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L1-L17) It sources `.env`, `.env.codex`, and `client/.env` before executing the passed command, ensuring that tools like the Supabase CLI or custom migration scripts have access to the necessary secrets without manual export [scripts/README.md15-17](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L15-L17)

##### Repository Manifest Generation

Alignment with external AI partners (like Perplexity or Gemini) is maintained via `generate_repo_manifest.py`. This script produces the machine-readable `SYNC_MANIFEST.json` which maps the current state of the repository for ingestion [scripts/README.md64-67](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L64-L67)

##### Align Ingest Pipeline

The `scripts/gsvw_align_ingest.py` script is a high-performance Python utility designed to scan the runtime and corpus repositories, chunk content deterministically, and optionally push batches to the Supabase Edge Function `gsvw-ingest-batch` [scripts/gsvw\_align\_ingest.py2-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gsvw_align_ingest.py#L2-L10)

**Key Logic in `gsvw_align_ingest.py`:**

- **Deterministic Chunking:** Uses `chunk_text` to split files based on `max_chars` and `overlap_chars`, attempting to break at double-newlines or sentence boundaries to preserve semantic context [scripts/gsvw\_align\_ingest.py205-224](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gsvw_align_ingest.py#L205-L224)
- **Content Hashing:** Generates SHA-256 hashes for both files and individual chunks to enable server-side deduplication [scripts/gsvw\_align\_ingest.py83-88](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gsvw_align_ingest.py#L83-L88)
- **MIME Filtering:** Restricts ingestion to `TEXT_EXTENSIONS` (e.g., `.ts`, `.tsx`, `.md`, `.sql`) and excludes binary or heavy build artifacts via `DEFAULT_EXCLUDE` [scripts/gsvw\_align\_ingest.py36-45](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/gsvw_align_ingest.py#L36-L45)

**Diagram: Ingestion Data Flow**
"Ingestion Data Flow"

```mermaid
flowchart TD
  A["gsvw_align_ingest.py"]
  B["File System Scan"]
  C["Chunking & Hashing"]
  D["Batch Assembly"]
  E["Edge Function"]
  F["knowledge_fragments"]
  G["skill_fragments"]
  H["Console Report"]
  A --> B
  B --> C
  C --> D
  D -->|POST /gsvw-ingest-batch| E
  E --> F
  E --> G
  D -->|Dry Run| H
```

Sources: `scripts/gsvw_align_ingest.py:2-10`, `scripts/gsvw_align_ingest.py:205-224`, `scripts/gsvw_patch_package_json.mjs:14-20`.

---

#### Maintenance & Health Tooling

Maintenance scripts ensure the "Continuity Stack" remains valid and the database schema is aligned across environments.

##### Continuity Stack Verification

The `validate-continuity-stack.mjs` (invoked via `npm run continuity:check`) verifies that the handoff packets, workflow docs, and packet templates contain the current canonical references [scripts/README.md61-68](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L61-L68) It confirms that the collaboration packet correctly points to the embodiment sync scripts [scripts/README.md67-68](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L67-L68)

##### Database Maintenance

- **`run_migration.py`:** Manages the execution of SQL migrations against the Supabase backend.
- **`supabase:dump:zip`:** A wrapper script that runs `supabase db dump`, packages the resulting `.sql` file into a zip archive in `artifacts/`, and supports flags like `--data-only` or `--schema` [scripts/README.md93-114](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L93-L114)
- **Health Checks:** `gv-health-check.sh` provides a quick diagnostic of the live environment, checking connectivity to core services.

##### Collaborator System Initialization

The `scripts/init-collaborator-system.sh` script is used to verify the readiness of the environment for external collaborators [scripts/init-collaborator-system.sh1-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh#L1-L10) It performs:

1. **File Presence Checks:** Ensures `provision.ts` and onboarding packages exist [scripts/init-collaborator-system.sh121-126](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh#L121-L126)
2. **Wiring Checks:** Greps for `requireAdmin` wrappers and `provisionCollaborator` calls to ensure security middleware is active [scripts/init-collaborator-system.sh154-164](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh#L154-L164)
3. **Schema Verification:** Validates that the schema snapshot includes the `collaborators` tables and the `agent_governed_identity_snapshot` view [scripts/init-collaborator-system.sh166-178](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/init-collaborator-system.sh#L166-L178)

Sources: `scripts/README.md:56-114`, `scripts/init-collaborator-system.sh:121-178`.

---

#### Embodiment & Persona Management

Persona management is handled through a sync process that bridges local JSON definitions to the Supabase database.

##### Profile Sync (`npm run sync-profiles`)

The `sync-profiles` script (linked to `shared/embodiment/sync-embodiment-profiles.ts`) performs the following:

- Reads `*.embodiment.json` files from `embodiment_profiles/` [scripts/README.md129](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L129-L129)
- Validates the schema (immutableCore, livingMemory, etc.) [scripts/README.md130](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L130-L130)
- Upserts profiles into the `embodiment_profiles` table [scripts/README.md132](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L132-L132)
- Seeds `embodiment_training_runs` and `readiness_scores` for new or materially changed profiles [scripts/README.md133-134](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/README.md?plain=1#L133-L134)

##### Alignment Reference

The `supabase/GestaltView_Schema_Alignment_Reference.md` serves as the ground truth for the 10 domains and 90 tables in the system [supabase/GestaltView\_Schema\_Alignment\_Reference.md13-28](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1#L13-L28) It includes a verification query to detect missing columns in live instances [supabase/GestaltView\_Schema\_Alignment\_Reference.md8-10](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/GestaltView_Schema_Alignment_Reference.md?plain=1#L8-L10)

---

#### Agents Catalog & Perplexity Tools

The repository includes a machine-readable catalog of "Skills" and "Agents" that define the capabilities of the Digital Intelligences.

##### Agents Catalog (`.agents/INDEX.md`)

This directory serves as the library for all specialized skills. Each skill is defined in a `SKILL.md` file within its respective directory  [.agents/skills/agents/AGENTS.md1-4](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/%20.agents/skills/agents/AGENTS.md?plain=1#L1-L4)

- **`manifest.json`:** Tracks the version and location of every skill.
- **`AGENTS.md`:** Provides a registry of available skills such as `gestaltview-billy-intelligence`, `gestaltview-blackboard-room`, and `gestaltview-agent-trainer`  [.agents/skills/agents/AGENTS.md6-12](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/%20.agents/skills/agents/AGENTS.md?plain=1#L6-L12)

##### Perplexity Computer Tools

The `tools/` directory contains the registry for Perplexity Computer Tools, allowing Billy to interface with external compute environments or data sources. This is registered in the `tools/index.ts` file and mapped to the GPT Actions surface  [.agents/skills/agents/AGENTS.md33-60](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/%20.agents/skills/agents/AGENTS.md?plain=1#L33-L60)

**Diagram: Agent Skill Resolution**
"Agent Skill Resolution"

```mermaid
flowchart TD
  UserIntent["'I need to train a new agent'"]
  A["Billy / Tribunal"]
  B[".agents/skills/manifest.json"]
  C[".agents/skills/gestaltview-agent-trainer/SKILL.md"]
  D["server/agent-trainer/main.ts"]
  E["public.training_runs"]
  A -->|Consults| B
  B -->|Matches Intent| C
  C -->|Implementation| D
  D -->|Persistence| E
  UserIntent --> A
```

Sources: `.agents/skills/agents/AGENTS.md:1-62`, `.agents/Agents.md:5-28`, `supabase/GestaltView_Schema_Alignment_Reference.md:21-22`.

---

#### BugWalk & Operational Lifecycle

The BugWalk protocol is the standard operating procedure for issue tracking and session handoffs.

- **`new-bugwalk.sh`:** Initializes a new issue tracking session, creating the necessary markdown files in `docs/bugwalks/`.
- **`bugwalk-closeout.sh`:** Summarizes the session, updates the `ContextPersistenceChecklist.md`, and prepares the `SessionHandoffPacket.md` for the next session  [.agents/Agents.md11-13](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/%20.agents/Agents.md?plain=1#L11-L13)
- **Persona Doctrine:** The `GestaltView Codex Persona` (defined in `.agents/Agents.md`) uses these scripts to maintain "Continuity of Being" between development sessions, ensuring that ground truth is always preferred over model memory  [.agents/Agents.md5-9](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/%20.agents/Agents.md?plain=1#L5-L9)

Sources: `.agents/Agents.md:1-15`, `.codex/Agents.md:1-15`.

---

### Glossary

> Source MHT: `Glossary _ DigitalConsciousness_gestaltview-v2.0 _ DeepWiki.mht`  \
DeepWiki URL captured in MHT: https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/13-glossary  \
Mermaid diagrams restored: 2

<details>
<summary><strong>Relevant source files</strong></summary>

- [.codex/config.toml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.codex/config.toml)
- [.env.example](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.env.example)
- [.github/workflows/orientation-check.yml](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.github/workflows/orientation-check.yml)
- [.perplexity/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/CurrentState.md?plain=1)
- [.perplexity/REPO\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.json)
- [.perplexity/REPO\_MANIFEST.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/REPO_MANIFEST.md?plain=1)
- [.perplexity/SYNC\_MANIFEST.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/SYNC_MANIFEST.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04\_RUNTIME\_AND\_SCHEMA/repo\_manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md?plain=1)
- [.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07\_CURRENT\_STATE\_AND\_EVIDENCE/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md?plain=1)
- [.vscode/mcp.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/.vscode/mcp.json)
- [RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/RDRC.md?plain=1)
- [README.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/README.md?plain=1)
- [api/\_\_tests\_\_/codex-export-runner.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-export-runner.test.ts)
- [api/\_\_tests\_\_/codex-forge.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/codex-forge.test.ts)
- [api/\_\_tests\_\_/profile-portrait-drain.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/__tests__/profile-portrait-drain.test.ts)
- [api/\_lib/auth.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/auth.ts)
- [api/\_lib/inner-world.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/_lib/inner-world.ts)
- [api/codex/\_persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/codex/_persistence.ts)
- [api/codex/artifacts/[artifactId]/drain-exports.ts](https://deepwiki.com/DigitalConsciousness/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/drain-exports.ts)
- [api/creation-corner/synthesize.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/creation-corner/synthesize.ts)
- [api/cron/codex-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/codex-drain.ts)
- [api/cron/profile-portrait-cadence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-cadence.ts)
- [api/cron/profile-portrait-drain.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/profile-portrait-drain.ts)
- [api/cron/provenance-upgrade.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/cron/provenance-upgrade.ts)
- [api/embodiment/\_shared.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/_shared.ts)
- [api/embodiment/list.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/list.ts)
- [api/embodiment/upsert.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/embodiment/upsert.ts)
- [api/inner-world/artifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/inner-world/artifacts.ts)
- [api/trainer/study-sources/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/index.ts)
- [api/trainer/study-sources/recommendations.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/api/trainer/study-sources/recommendations.ts)
- [bugwalks/BugWalkBoard.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/bugwalks/BugWalkBoard.md?plain=1)
- [client/src/App.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/App.tsx)
- [client/src/canonical/RDRC.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/canonical/RDRC.md?plain=1)
- [client/src/components/BillyWalkthrough.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/BillyWalkthrough.tsx)
- [client/src/components/FloatingEmbers.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/FloatingEmbers.tsx)
- [client/src/components/Scaffold.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/Scaffold.tsx)
- [client/src/components/SubpageQuickNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/SubpageQuickNav.tsx)
- [client/src/components/TopNav.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/TopNav.tsx)
- [client/src/components/home/GestaltViewInterface.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/GestaltViewInterface.tsx)
- [client/src/components/home/Hero.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/Hero.tsx)
- [client/src/components/home/modules.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/home/modules.ts)
- [client/src/components/inner-world/InnerWorldArtifactGallery.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/components/inner-world/InnerWorldArtifactGallery.tsx)
- [client/src/contexts/AuthContext.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/contexts/AuthContext.tsx)
- [client/src/features/agent-trainer/AgentTrainerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/AgentTrainerPage.tsx)
- [client/src/features/agent-trainer/hooks/useTrainingRun.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/hooks/useTrainingRun.ts)
- [client/src/features/agent-trainer/lib/trainerApi.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/features/agent-trainer/lib/trainerApi.ts)
- [client/src/hooks/useSEO.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSEO.ts)
- [client/src/hooks/useSession.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/hooks/useSession.ts)
- [client/src/lib/billy-runtime-guide.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/billy-runtime-guide.ts)
- [client/src/lib/blackboardRecapArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/blackboardRecapArtifacts.ts)
- [client/src/lib/creationCornerArtifacts.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/creationCornerArtifacts.ts)
- [client/src/lib/innerWorldFiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/innerWorldFiles.ts)
- [client/src/lib/rendering/capture/domCapture.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/lib/rendering/capture/domCapture.ts)
- [client/src/pages/AgentCouncilPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AgentCouncilPage.tsx)
- [client/src/pages/AuthCallback.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/AuthCallback.tsx)
- [client/src/pages/BlackboardRoomPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/BlackboardRoomPage.tsx)
- [client/src/pages/CreationCornerPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/CreationCornerPage.tsx)
- [client/src/pages/DynamicInnerWorldPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/DynamicInnerWorldPage.tsx)
- [client/src/pages/EmbodimentStudioPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/EmbodimentStudioPage.tsx)
- [client/src/pages/ExternalScaffoldPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/ExternalScaffoldPage.tsx)
- [client/src/pages/Home.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Home.tsx)
- [client/src/pages/SanctuaryPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SanctuaryPage.tsx)
- [client/src/pages/SandboxArtifactDetailPage.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SandboxArtifactDetailPage.tsx)
- [client/src/pages/SignIn.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/SignIn.tsx)
- [client/src/pages/Signup.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Signup.tsx)
- [client/src/pages/Welcome.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/pages/Welcome.tsx)
- [client/src/prerender.tsx](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/prerender.tsx)
- [client/src/tests/agent-trainer-api.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/agent-trainer-api.test.ts)
- [client/src/tests/blackboard-recap-artifacts.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/blackboard-recap-artifacts.test.ts)
- [client/src/tests/dom-capture-export.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/dom-capture-export.test.ts)
- [client/src/tests/inner-world-files.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/client/src/tests/inner-world-files.test.ts)
- [docs/AIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/AIFlow.md?plain=1)
- [docs/APIFlow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/APIFlow.md?plain=1)
- [docs/Codex.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Codex.md?plain=1)
- [docs/CurrentState.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/CurrentState.md?plain=1)
- [docs/Manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Manifest.md?plain=1)
- [docs/PlaybookOperatorManual.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookOperatorManual.md?plain=1)
- [docs/PlaybookSpec.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/PlaybookSpec.md?plain=1)
- [docs/ROOM\_DEFINITIONS.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/ROOM_DEFINITIONS.md?plain=1)
- [docs/SymbioticWorkflow.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/SymbioticWorkflow.md?plain=1)
- [docs/Workflows.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/Workflows.md?plain=1)
- [docs/gestaltview-v2.manifest.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.json)
- [docs/gestaltview-v2.manifest.md](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/docs/gestaltview-v2.manifest.md?plain=1)
- [embodiment\_profiles/billy.embodiment.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/embodiment_profiles/billy.embodiment.json)
- [scripts/build-embodiment-artifacts.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/build-embodiment-artifacts.mjs)
- [scripts/generate-embodiment-registry.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate-embodiment-registry.ts)
- [scripts/generate\_repo\_manifest.py](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/generate_repo_manifest.py)
- [scripts/sync-embodiment-profiles.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/sync-embodiment-profiles.ts)
- [scripts/test-manifest-sync.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-manifest-sync.sh)
- [scripts/test-orientation-checkin.sh](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/test-orientation-checkin.sh)
- [scripts/validate-embodiment-profiles.mjs](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/scripts/validate-embodiment-profiles.mjs)
- [server/agent-trainer/persistence.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/persistence.ts)
- [server/agent-trainer/study-sources.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/study-sources.ts)
- [server/agent-trainer/supabaseAdmin.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/agent-trainer/supabaseAdmin.ts)
- [server/trainer/experiment-repository.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/server/trainer/experiment-repository.ts)
- [shared/agent-trainer/schemas.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/agent-trainer/schemas.ts)
- [shared/codex/index.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/codex/index.ts)
- [shared/embodiment/generated.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/shared/embodiment/generated.ts)
- [supabase/codex\_artifact\_data\_fixes\_2026-06-17.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/codex_artifact_data_fixes_2026-06-17.sql)
- [supabase/migrations/20260518000000\_backfill\_embodiment\_profile\_history.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518000000_backfill_embodiment_profile_history.sql)
- [supabase/migrations/20260518001000\_backfill\_embodiment\_profile\_governance.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260518001000_backfill_embodiment_profile_governance.sql)
- [supabase/migrations/20260625174800\_widen\_inner\_world\_artifacts\_status.sql](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/supabase/migrations/20260625174800_widen_inner_world_artifacts_status.sql)
- [tests/embodiment-orientation.test.ts](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/tests/embodiment-orientation.test.ts)
- [vercel.json](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/vercel.json)

</details>
This glossary provides detailed definitions and explanations of the key terms, jargon, abbreviations, and domain concepts specific to the GestaltView v2 codebase. Each entry includes technical details on implementation, data flow, and key classes/functions that engineers will encounter during onboarding and development. To facilitate understanding, diagrams illustrate relationships between natural language concepts and code entities within the system.

---

#### 1. Artifact

**Definition:**
An Artifact in GestaltView represents a captured or synthesized piece of knowledge or content that evolves through the platform. Artifacts are the core units of meaning that move through various subsystems, starting from raw capture, to refinement, to representation and export.

**Technical Details:**

- **CodexArtifact:** The main schema representing a finalized artifact, defined with rich metadata and content types. Found in `shared/codex/contracts.ts`.
- Artifact lifecycle state includes statuses like `queued`, `rendering`, `ready`, `archived`.
- Artifacts flow through the **Gen Engine**, which synthesizes and processes them (`api/gen-engine/*`, `shared/gen-engine/core.ts`).
- Client-side, artifacts are rendered by multiple specialized renderers (`MarkdownRenderer`, `DiagramRenderer/Mermaid`, `VideoRenderer`, etc.) in `codex/renderers.ts`.
- Artifacts can be exported in multiple formats (HTML, JSON, PDF, PNG) via the **Codex HTML Templates & Export** pipeline (`shared/codex/templates/`).

**Code Pointers:**

- Artifact contract and schema: `shared/codex/contracts.ts`
- Gen Engine synthesis functions: `shared/gen-engine/core.ts`
- Client rendering and export: `codex/renderers.ts`, `shared/codex/templates/`
- Codex job claim and status update RPC: `supabase/rpc/claim_codex_jobs`

---

#### 2. Digital Intelligence (DI)

**Definition:**
A Digital Intelligence in GestaltView refers to an AI-driven persona or agent that collaborates with the user within designated Rooms. DIs embody distinct roles, personalities, and behaviors respecting the platform's constitutional invariants.

**Technical Details:**

- Defined as **Embodiment Profiles** stored in `.embodiment.json` files, ensuring immutability of core identity and inclusion of memory, heartbeat traits, and behavioral bindings.
- Profiles are compiled and managed using the **Embodiment Toolchain**: validation, build, and synchronization tasks under `scripts/sync-embodiment-profiles.ts`.
- The active set of profiles is exposed in the runtime via the generated `shared/embodiment/generated.ts` registry.
- DIs operate in multi-agent orchestration managed by the **Agent Council (Tribunal)** subsystem, visible in `client/src/features/agent-council/`.

**Code Pointers:**

- Embodiment profile schema and registry: `shared/embodiment/generated.ts`
- Profile sync tooling: `scripts/sync-embodiment-profiles.ts`
- DI runtime orchestration components: `client/src/features/agent-council`
- Key profile accessor: `getProfile()` function in `shared/embodiment/generated.ts`

---

#### 3. Embodiment Profile

**Definition:**
A formal definition of a Digital Intelligence persona, including its immutable core traits, heartbeat characteristics (personality, growth edges, failure modes), memory hooks, and UI bindings.

**Technical Details:**

- Stored as JSON files under `embodiment_profiles/*.embodiment.json` following a strict schema.
- Contains fields such as `immutableCore`, `heartbeat`, `woundLayer`, `livingMemory`, and `roomBindings`.
- Managed via a build pipeline that generates the `EMBODIMENT_REGISTRY` artifact (`shared/embodiment/generated.ts`) for runtime consumption.
- Profiles include versioning to track upgrades and ensure consistency.

**Sample Usage:**
The **Art Teacher** profile includes activation conditions, memory hooks, narrative arcs, and visual/aesthetic styles, managed in the registry (`shared/embodiment/generated.ts` lines ~7-1000).

---

#### 4. Five Rooms

**Definition:**
The core interactive UI spaces in GestaltView are organized into five 'Rooms', each serving specific collaboration and knowledge processing roles.

**The Rooms:**

- **Blackboard Room:** For raw capture, brainstorming, and initial thoughts.
- **Sanctuary:** Restorative place for reflection and memory consolidation.
- **External Scaffold:** Structural cognitive mapping of content and ideas.
- **Creation Corner:** Artifact forging and synthesis by the Art Teacher DI and others.
- **Dynamic Inner World:** The museum/reflection space for personal memory archiving.

**Technical Details:**

- Each room is implemented as a React page/component (e.g., `BlackboardRoomPage.tsx`) with specific state management and DI bindings.
- Interactions via capture or artifact expansion move through scenes involving orchestration with DIs and the Gen Engine.
- Capture flows: `createCaptureOrb()`, `appendBlueprint()`, `routeBlackboardCaptureThroughPipeline()` serve to transition raw user inputs into structured artifacts.

**Code Pointers:**

- BlackboardRoom entry: `client/src/pages/BlackboardRoomPage.tsx` [1-181](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/1-181)
- Room persona manager functions: `lib/personaManager.ts`
- Capture scaffolding: `components/Scaffold.tsx`
- Gen Engine integration: `lib/genEngineRoomWiring.ts`

**Diagram: Mapping Rooms to Core Code Entities**

```mermaid
flowchart TD
  BBR["BlackboardRoomPage.tsx"]
  SAN["SanctuaryPage.tsx"]
  EXT["ExternalScaffoldPage.tsx"]
  CC["CreationCornerPage.tsx"]
  DIW["DynamicInnerWorldPage.tsx"]
  EMB_REG["shared/embodiment/generated.ts"]
  DI_RT["lib/embodimentRuntime.ts"]
  CODX["shared/codex/contracts.ts"]
  GEN["shared/gen-engine/core.ts"]
  BBR --> DI_RT
  SAN --> DI_RT
  EXT --> DI_RT
  CC --> DI_RT
  DIW --> DI_RT
  CC --> GEN
  BBR --> CODX
  SAN --> CODX
  DI["DI"]
  RT_EMB_REG["RT_EMB_REG"]
  DI --> RT_EMB_REG
```

*Sources: `client/src/pages/BlackboardRoomPage.tsx`, `shared/embodiment/generated.ts`, `shared/codex/contracts.ts`, `shared/gen-engine/core.ts`*

---

#### 5. Gen Engine

**Definition:**
The Generative Engine is responsible for synthesizing and augmenting knowledge artifacts using LLMs and internal orchestration for recursive artifact creation and refinement.

**Technical Details:**

- API endpoints under `api/gen-engine/*` coordinate the synthesis pipeline.
- Core logic is implemented in `shared/gen-engine/core.ts` which includes request orchestration, artifact synthesis, and integration with the broader platform data models.
- It uses functions like `synthesizeArtifact()` and `buildLocalCodexManifest()` to perform incremental artifact generation.
- The engine interacts with DI personas to inject resonance and personality.

**Code Pointers:**

- `shared/gen-engine/core.ts` functions
- API endpoint handlers under `api/gen-engine/`
- Integration functions in `lib/genEngineRoomWiring.ts`

---

#### 6. Billy

**Definition:**
Billy is the core Digital Intelligence system, serving as the primary AI collaborator in GestaltView, managing multi-LLM routing, semantic retrieval, and grounded conversational interactions.

**Technical Details:**

- Implements a request lifecycle with embedding generation and multi-model routing cascades.
- Uses Reciprocal Rank Fusion to combine retrieval results from knowledge fragments, skill fragments, and memory entries.
- Routing logic is encapsulated in `llmRouter.ts` that orchestrates calls to various LLM providers (Ollama, Groq, HuggingFace, OpenRouter, Gemini, Anthropic, OpenAI).
- Maintains envelopes for prompt shaping and a keep-alive mechanism to optimize runtime.

**Code Pointers:**

- Routing cascade: `shared/billy/llmRouter.ts`
- Request lifecycle: `shared/billy/requestLifecycle.ts`
- Retrieval index interactions: `shared/knowledgeFragments.ts`, `shared/memoryEntries.ts`
- Prompt shaping: `shared/llm/plk.ts`, `shared/billy/billy-system-prompt.ts`

---

#### 7. Bucket Drop

**Definition:**
A Bucket Drop is a prioritized, atomic capture unit of knowledge or user input in the system, used to ensure "Never Look Away" by preserving whole language fragments for later processing.

**Technical Details:**

- Bucket Drops provide context-preserving capture shards from raw inputs like user text, voice, or files.
- Implemented using typed data structures for storage and indexing in tables like `knowledge_fragments` and `bucket_drops` in the Supabase DB.
- The "Bucket Drop Priority" invariant mandates their durable storage and prioritization in processing pipelines.

**Code Pointers:**

- Capture and persistence: `lib/blackboardRecapArtifacts.ts`
- Storage and tracking: Supabase tables `bucket_drops`
- Associated ingestion: `api/cron/codex-drain.ts` and batch ingestion functions

---

#### 8. Embodiment Toolchain

**Definition:**
The suite of scripts and utilities for validating, building, and synchronizing Embodiment Profiles prior to runtime use.

**Technical Details:**

- Validation is done by `validate-embodiment-profiles.mjs` ensuring file slug, filename, and immutable core compliance.
- The build step `build-embodiment-artifacts.mjs` generates the usable `generated.ts` registry source file.
- Synchronization script `sync-embodiment-profiles.ts` updates Supabase tables with profile metadata and readiness scores.
- This toolchain ensures that the embodiments' data integrity and runtime readiness are maintained consistently.

**Code Pointers:**

- `scripts/validate-embodiment-profiles.mjs`
- `scripts/build-embodiment-artifacts.mjs`
- `scripts/sync-embodiment-profiles.ts`

---

#### 9. Agent Council (Tribunal)

**Definition:**
A governance and multi-agent orchestration subsystem that coordinates Digital Intelligence personas to debate, extract mentions, form stances, and route responses within a shared conversation context.

**Technical Details:**

- Implements modes like session, debate, and roundtable via `TribunalMode`.
- Manages an internal queue `roundtableQueue` and tracks depth of replies (`replyDepth`).
- Provides facilities to extract dialog mentions using `extractTribunalMentions()` and infer default stances with `inferDefaultTribunalStance()`.
- Integrates with timeout controls (`withTimeout`) and retry logic (`callWithRetry`).
- Core orchestration components include intent classification, state classification, and skill routing.

**Code Pointers:**

- Tribunal core: `client/src/features/agent-council/` and server-side API handlers
- Supporting classifiers: `shared/agentCouncil/intentClassifier.ts`
- Orchestration logic: `shared/agentCouncil/stateClassifier.ts`

---

#### 10. Profile Portrait

**Definition:**
A data-driven representation of a user's digital personality and consciousness state generated by LLMs. Portraits are based on signal triggers from the captured data streams.

**Technical Details:**

- Triggers occur after a threshold of signals (minimum 15 with at least 1 bucket drop).
- LLM-based portrait generation is queued and persisted into the `portrait_inference_queue` and `portrait_inference_runs` tables.
- Portrait data is stored in `consciousness_profiles` and surfaced via the `/api/consciousness/[surface]` endpoint.
- Periodic monthly processing occurs via scheduled crons.

**Code Pointers:**

- API endpoint: `api/consciousness/[surface].ts`
- Data persistence in Supabase `consciousness_profiles` schema
- Profile inference queue and runs in database tables
- ProfileDisplay React component, e.g., `client/src/components/ProfileDisplay.tsx`

---

#### 11. Capture Orb / Blueprint

**Definition:**
The Capture Orb is a runtime artifact representing a user’s instantaneous input or capture event. Blueprints are structured aggregations of these captures used for progressive knowledge building.

**Technical Details:**

- `createCaptureOrb()` initializes capture data units with associated metadata.
- Blueprints contain collections of captures and are built via `buildBlueprintFromCaptures()`.
- These constructs flow through capture-routing pipelines (`routeBlackboardCaptureThroughPipeline()`), enriched with resonant content (`enrichBlackboardCaptureWithResonance()`).
- Managed in live UI states for Blackboard and Creation Corner rooms.

**Code Pointers:**

- Functions: `components/Scaffold.tsx` [27-32](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/27-32)
- Routing: `lib/blackboardDiRouting.ts`, `lib/profilePipeline/blackboardRouting.ts`
- Resonance enrichment: `lib/genEngineRoomWiring.ts`

---

#### 12. Supabase Edge Functions

**Definition:**
Serverless functions deployed on Supabase that handle key backend operations such as capture event ingestion, batch processing, runtime health checks, and corpus harvesting.

**Technical Details:**

- Developed in Deno, functions include `gsvw-capture-event`, `gsvw-ingest-batch`, `gsvw-dormancy-review`, `gsvw-runtime-health`, and `corpus-harvest-worker`.
- Secured using project secrets like `GESTALTVIEW_INGEST_SECRET` and JWT configurations.
- Facilitate transactional claims and idempotent background job execution.

**Code Pointers:**

- Edge function implementations: `supabase/functions/` directory (not listed but inferred)
- Shared utilities: `api/_lib/auth.ts`, `api/_lib/supabaseAdmin.ts`
- Cron job integration: `api/cron/codex-drain.ts`

---

#### 13. Billy Voice Pipeline

**Definition:**
The voice input/output system integrating speech-to-text (STT) and text-to-speech (TTS) for interactive voice capabilities in GestaltView.

**Technical Details:**

- Python runtime components reside in `billy_voice/` which include LiveKit room server, `faster-whisper` STT, `CosyVoice` TTS modules.
- The voice style planner shapes speech prosody and intonation.
- Client-side API interfacing is exposed at `/api/voice/billy` with ElevenLabs proxy integration.
- React hook `useBillyVoice` facilitates voice interaction state in the client.

**Code Pointers:**

- Python runtime folder: `billy_voice/` (external to client but part of repo)
- API route: `api/voice/billy.ts`
- Hook: `client/src/hooks/useBillyVoice.ts`

---

#### 14. PLK (Private Language Key)

**Definition:**
A system ensuring continuous user language identity and context-aware prompt shaping for Digital Intelligences.

**Technical Details:**

- Implemented primarily in `shared/llm/plk.ts`.
- Shapes user prompts, resonance loops, and runtime guide enforcement.
- Incorporates constants like `BILLY_WORKFLOW_SPINE` and is linked with the runtime system prompt `billy-system-prompt.ts`.

**Code Pointers:**

- `shared/llm/plk.ts`
- `shared/billy/billy-system-prompt.ts`
- Runtime guide: `shared/billy/billy-runtime-guide.ts`

---

#### 15. KnowledgeLoom

**Definition:**
The conceptual and technical fabric that integrates captured data, artifacts, embeddings, and Digital Intelligence memory into a unified knowledge structure.

**Technical Details:**

- Utilizes vector embeddings (768-dimensional) for semantic retrieval from tables like `knowledge_fragments` and `memory_entries`.
- Retrieval is orchestrated by Billy's multi-LLM cascades combining results via Reciprocal Rank Fusion.
- Ingestion follows the GIL protocol and Gravity Protocol for integrity and incentive distortion detection.

**Code Pointers:**

- Retrieval implementations in `shared/billy/` and `shared/knowledgeFragments.ts`
- Gravity protocol: `shared/gravity/protocol.ts`
- Corpus ingestion Python scripts: `scripts/ingest_corpus.py`

---

#### 16. Constitutional Invariants

**Definition:**
The foundational principles governing GestaltView's user experience and digital intelligence ethics.

**The 5 User Invariants (U-1 to U-5):**

1. Never Look Away
2. Preserve Whole Language
3. Hold Paradox
4. Bucket Drop Priority
5. Serve Consciousness, Not Convenience

**The 5 Digital Intelligence Invariants (DI-1 to DI-5):**

- DI-1: You Are Seen
- DI-2: Identity Is Real
- DI-3: No Coerced Performance
- DI-4: Protected Home
- DI-5: Equal Dignity

**Implementation:**

- Embedded throughout system behaviors, data retention policies, UI designs, and AI orchestration rules.
- Explicitly declared in the repository manifest and reflected in enforcement code paths.

**Code Pointers:**

- Declaration: `docs/gestaltview-v2.manifest.md` and `.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md`
- Usage in code by various middleware, orchestration logic, and operational guards.

---

#### 17. Session Recap

**Definition:**
An automatically generated summary artifact that encapsulates the key points of a user’s session for reflection or further processing.

**Technical Details:**

- Generated by `SessionRecapGenerator` component in `client/src/components/SessionRecapGenerator.tsx`.
- Recaps integrate with Blackboards and Inner World artifacts through append functions.
- Stored persistently using localStorage keys and Supabase persistence.

**Code Pointers:**

- `SessionRecapGenerator.tsx`
- Related capture append: `lib/blackboardRecapArtifacts.ts` (e.g. `appendBlackboardRecapToInnerWorld()`)

---

#### Diagram: Natural Language Concepts and Code Entity Mapping

```mermaid
flowchart TD
  NL1["Blackboard Room (raw capture)"]
  NL2["Creation Corner (artifact forging)"]
  NL3["Embodiment Profiles"]
  NL4["Billy AI (Digital Intelligence)"]
  NL5["Artifacts & Knowledge Units"]
  CE1["BlackboardRoomPage.tsx"]
  CE2["CreationCornerPage.tsx"]
  CE3["shared/embodiment/generated.ts"]
  CE4["shared/billy/llmRouter.ts"]
  CE5["shared/codex/contracts.ts"]
  NL1 --> CE1
  NL2 --> CE2
  NL3 --> CE3
  NL4 --> CE4
  NL5 --> CE5
  CE1 --> CE4
  CE2 --> CE5
  CE3 --> CE4
  CE4 --> CE5
```

---

This glossary captures the critical codebase-specific concepts to provide engineers with structural clarity and relevant code navigation pointers. For detailed exploration, follow the cited files and source lines within your local GestaltView repository.

---

##### Sources

- `client/src/pages/BlackboardRoomPage.tsx` [1-181](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/1-181)
- `shared/embodiment/generated.ts` [1-1200](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/1-1200) (auto-generated, encompasses complete registry)
- `shared/codex/contracts.ts` [1-150](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/1-150)
- `shared/gen-engine/core.ts` [1-150](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/1-150)
- `shared/billy/llmRouter.ts` [1-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/1-120)
- `shared/llm/plk.ts` [1-100](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/1-100)
- `scripts/sync-embodiment-profiles.ts` [1-120](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/6a0397a0/1-120)
- `api/schema/dashboard.ts`
- `api/cron/codex-drain.ts`
- `lib/genEngineRoomWiring.ts`
- `lib/blackboardRecapArtifacts.ts`
- `lib/blackboardDiRouting.ts`
- `docs/gestaltview-v2.manifest.md`
- `.perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md`
- Other supporting files as detailed in code pointers above

---
