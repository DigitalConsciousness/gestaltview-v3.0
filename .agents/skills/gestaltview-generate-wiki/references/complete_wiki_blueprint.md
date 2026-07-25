# Complete Wiki Blueprint

Last compared against benchmark: 2026-03-30

Benchmark artifact:
- `docs/GestaltView v2.0 — Complete Wiki.md`

Benchmark snapshot:
- 4,627 lines
- 35 H1 headings
- 167 H2 headings
- 231 H3 headings

Use this reference when the user asks for a "complete wiki," "full repo handbook," or similarly book-scale output. The goal is not title-by-title imitation. The goal is equivalent breadth, structural clarity, and evidence density.

## Output contract

1. Start with a top-level document title.
2. Include generated date and repo commit or ref.
3. Add a table of contents that covers the major H1 and H2 sections.
4. Organize the body into H1 chapters with H2 and H3 subsections.
5. Ground major claims in live files with inline citations and section-level source summaries.
6. Use diagrams only where they clarify a real system relationship.
7. Use tables for APIs, config, schemas, tiering, routes, manifests, or CLI surfaces.
8. End with a glossary or terminology crosswalk when the repo has specialized language.

## Coverage families

### Platform and environment

- Platform overview
- System philosophy
- Tech stack
- Repository structure
- Major subsystem relationships
- Getting started and development environment
- Environment variables
- Local setup and tooling
- CLI and developer workflow
- Proxy and API interaction

### Deployment and infrastructure

- Infrastructure overview
- Hosting and deployment flow
- Build pipeline
- Environment handling
- Security and CORS
- Public assets and SEO

### Billy core architecture

- Billy AI architecture overview
- RAG pipeline
- Provider cascade and LLM routing
- BillyEngine or equivalent client intelligence layer
- UI interaction surfaces
- Voice runtime

### Data and knowledge systems

- Supabase or database layer
- Schema and RPC/function surface
- Knowledge corpus ingestion
- Memory and persistent user context
- Retrieval assembly and prompt construction

### Frontend and product surface

- Frontend application architecture
- Routes and page structure
- Design system and visual identity
- Authentication and session model
- Pricing, subscriptions, and feature gating

### Domain and exhibit surface

- Exhibit architecture
- Domain lanes or product variants
- Specialized exhibits
- Demo modes and safety boundaries

### Agent and orchestration systems

- Agent trainer systems
- Tribunal or multi-agent logic
- Agent definitions
- Orchestration patterns
- Skills and routing layer

### Diligence and evidence systems

- Evidence architecture
- Data models and persistence
- Timeline, anchoring, or diligence workflows

### Tooling and health

- Scripts and operational tooling
- Testing strategy
- Health checks
- Manifest and context-management files

### Reference layer

- Glossary
- Terminology crosswalk
- Child sections or related-page map where useful

## GestaltView v2 benchmark chapter map

The current benchmark file groups the repo into chapters like these:

- `GestaltView v2 — Platform Overview`
- `Getting Started & Development Environment`
- `Deployment & Infrastructure`
- `Billy AI Agent — Core Architecture`
- `RAG Pipeline & Knowledge Retrieval`
- `LLM Router & Provider Cascade`
- `BillyEngine — Client-Side Intelligence`
- `Billy UI Components & Interaction Modes`
- `Billy Voice Runtime`
- `Data Layer — Supabase & Knowledge Corpus`
- `Database Schema & Supabase Tables`
- `Knowledge Corpus Ingestion Pipeline`
- `Memory System & Persistent User Context`
- `Frontend Application`
- `Routing & Page Structure`
- `Design System & Visual Identity`
- `Authentication & User Session`
- `Pricing, Subscriptions & Feature Gating`
- `Exhibits & Domain Lanes`
- `Exhibit Architecture & BillyExhibitChat`
- `Neurodivergence & Wellness Exhibits`
- `Musical DNA Exhibit`
- `Developer & Productivity Exhibits`
- `Agent Trainer & Tribunal System`
- `Agent Trainer`
- `Tribunal of Understanding`
- `Diligence Explorer & Evidence Layer`
- `Skills Library & Agent Orchestration`
- `Skills Catalog & Manifest`
- `Agent Definitions & Orchestration Patterns`
- `Scripts, Tooling & Health Checks`
- `gv.sh CLI & Developer Workflow`
- `Testing & Health Check Infrastructure`
- `Glossary`

Your exact chapter list can differ, but if the repo contains systems at this level of distinctness, the final wiki should expose them as first-class chapters or pages instead of burying them in generic catch-all sections.

## Construction rules

- One chapter should answer one coherent question.
- Separate runtime architecture from data architecture when they use different files, flows, or owners.
- Separate product surfaces from internal tooling when the audience benefits from that split.
- Include code/entity maps when the system boundary is otherwise hard to follow.
- Include "related child pages" or "child sections" only if they improve navigation.
- If generating from intermediate page files, keep the page outputs machine-editable and the final single-file export human-readable.

## Anti-patterns

- Compressing a multi-domain platform into a handful of generic pages.
- Repeating old wiki phrasing without re-verifying the live repo.
- Letting sibling-repo snapshots outrank current local code.
- Writing architecture claims without file-backed citations.
- Using diagrams as decoration instead of as explanatory tools.
