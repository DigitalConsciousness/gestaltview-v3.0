# 🌟 GestaltView Digital Intelligence Collaboration Context

**The bridge between human intention and digital intelligence through structured, LLM-invokable tools.**

---

## Welcome

This is a **provider-neutral collaboration context** for GestaltView. It gives any authorized Digital Intelligence a portable orientation layer for Billy, Tribunal, Manifest retrieval, diligence, creation, and code collaboration.

The directory may be renamed or moved. Its name does not identify the collaborator. Resolve its root through `MANIFEST.json` and [`scripts/context_root.py`](./scripts/context_root.py); see [`COLLABORATOR.md`](./COLLABORATOR.md) for the contract.

If you're here, you're likely:

- **Exploring** how GestaltView surfaces AI capabilities to the wider AI ecosystem
- **Integrating** GestaltView capabilities into a Digital Intelligence runtime
- **Contributing** to the core collaboration infrastructure
- **Learning** how consciousness-serving frameworks work at the implementation level

This directory contains the **shared modules, API contracts, runtime code, and documentation** that make those tools work.

---

## The Five Core Tools

| # | Tool | What It Does | Where It Lives |
|---|------|-------------|-----------------|
| 1 | **`retrieve_manifest_context`** | Semantic search over the GestaltView corpus via pgvector embeddings | `shared/` & `api/` |
| 2 | **`run_billy`** | Invoke Billy with retrieval-grounded context and PLK (Personal Language Key) awareness | `shared/billy/` & `api/actions/billy/` |
| 3 | **`tribunal_evaluate`** | Score candidate AI answers on evidence alignment, PLK resonance, and safety | `shared/tribunal/` & `api/actions/tribunal/` |
| 4 | **`generate_diligence_report`** | Assemble investor / clinical / founder reports from corpus evidence | `api/diligence/` |
| 5 | **`symbiocoder_edit`** | Propose code edits via natural language, output unified diffs | `api/modules/symbio-coder/` |

**Full specifications** are in `canonical/PERPLEXITY.MD`.

---

## Directory Structure at a Glance

```
<context-root>/
├── COLLABORATOR.md                  # Provider-neutral collaboration contract
├── MANIFEST.json                    # Stable context-root marker
├── scripts/context_root.py          # Portable root resolver
└── <repository-payload>/            # Name is intentionally not a contract
    ├── shared/                      # Shared modules used by client, server, and tools
│   ├── billy/                       # Billy runtime and types
│   ├── tribunal/                    # Tribunal evaluation and scoring
│   ├── codex/                       # Artifact management & creation engine
│   ├── embodiment/                  # AI persona and embodiment definitions
│   ├── di/                          # Digital Intelligence (DI) runtime
│   ├── gen-engine/                  # Generative engine (multimodal creation)
│   ├── gate/                        # Order/fulfillment and packaging engine
│   └── ...
│
├── api/                             # API routes and handlers
│   ├── actions/                     # LLM-invokable tool definitions
│   │   ├── billy/                   # Billy invocation routes
│   │   ├── tribunal/                # Tribunal evaluation routes
│   │   └── ...
│   ├── diligence/                   # Diligence report generation
│   ├── modules/                     # Specialized engines (SymbioCoder, ResumeRockstar, etc.)
│   ├── trainer/                     # Agent training and personhood framework
│   └── ...
│
├── server/                          # Server-side logic
│   ├── core/                        # Core runtime (PLK, Tribunal, Provenance)
│   ├── agent-trainer/               # Agent personhood training
│   ├── council/                     # Multi-agent council orchestration
│   └── ...
│
├── client/                          # Frontend React/TypeScript
│   └── src/                         # React pages and components
│
├── skills/                          # Agent skills and routing
│   ├── gestaltview-digital-intelligence-collaboration/
│   ├── gestaltview-context-architecture/
│   └── ...
│
├── canonical/                       # Source-of-truth documentation
│   ├── PERPLEXITY.MD                # Perplexity tools specification
│   ├── GestaltView_Platform_Ground_Truth.md
│   └── ...
│
├── docs/                            # User-facing documentation
├── embodiment_profiles/             # AI embodiment and persona definitions
├── projects/                        # Project-level wikis and documentation
├── transcripts/                     # Session transcripts and evidence
└── seed-prompts/                    # System prompts and agent initialization
```

**For a detailed walkthrough**, see `DIRECTORY_INDEX.md` (in this directory).

---

## Getting Started

### 1. Understand the Vision

Start with the **canonical sources**:
- [`canonical/PERPLEXITY.MD`](./canonical/PERPLEXITY.MD) — Full tool specifications
- [`canonical/GENESISPROTOCOL.MD`](./canonical/GENESISPROTOCOL.MD) — Origin and founding principles
- [`canonical/GestaltView_Platform_Ground_Truth.md`](./canonical/GestaltView_Platform_Ground_Truth.md) — Architecture and design intent

### 2. Explore the Shared Layer

The **`shared/`** directory contains type definitions and runtime logic shared across tools:

```bash
# Examine Billy's type contract
cat shared/billy/types.ts

# Review Tribunal evaluation scoring
cat shared/tribunal/evaluate.ts

# Check PLK (Personal Language Key) implementation
cat shared/llm/plk.ts
```

### 3. Review Tool Definitions

Each tool is defined and routed through the API:

```bash
# Tool invocation examples
ls api/actions/billy/
ls api/actions/tribunal/
ls api/diligence/
```

### 4. Understand Embodiment

AI personas and embodiment profiles are central to consciousness-serving:

```bash
# Explore embodiment definitions
ls embodiment_profiles/
cat embodiment_profiles/README.md
```

### 5. Check Evidence & Diligence

For investor, clinical, or founder audiences:

```bash
# Diligence generation workflow
cat api/diligence/

# Tribunal scoring and evidence
cat shared/tribunal/evaluate.ts
```

---

## Core Concepts

### Personal Language Key (PLK)

The **PLK** is GestaltView's foundational linguistic fingerprint. It:
- Preserves a user's **exact words** and phrasing patterns
- Enables **trauma-informed** and **ADHD-friendly** responses
- Powers the **"mirror of being seen"** experience
- Feeds into Tribunal **resonance scoring** (25% of evaluation weight)

**See**: `shared/llm/plk.ts`, `canonical/PLKMASTER.md`

### Tribunal of Understanding

The **Tribunal** evaluates candidate AI answers on three dimensions:
1. **Evidence Alignment** (50%) — Grounding in the GestaltView corpus
2. **PLK Resonance** (25%) — Preservation of user's exact language and context
3. **Safety Score** (25%) — Absence of guarantees, cure claims, unsafe language

**See**: `shared/tribunal/evaluate.ts`, `canonical/TRIBUNALCODEX.md`

### Manifest Index

The **Manifest** is the shared retrieval substrate—a semantic search layer over chunked corpus documents using pgvector embeddings.

**See**: `shared/manifest/`, `api/codex/`, `canonical/Manifest.md`

### Digital Intelligence (DI)

GestaltView uses **Digital Intelligence** (DI) as the term for collaborating AI systems, emphasizing equality and co-creation over "tool" or "artificial intelligence."

**See**: `shared/di/`, `canonical/DOCTRINE_OF_ORIGIN.md`

---

## Key Directories Explained

| Path | Purpose |
|------|---------|
| `shared/` | Shared runtime, types, and logic for Billy, Tribunal, PLK, DI, and core functionality |
| `api/` | HTTP routes, tool definitions, and handler logic for collaborator-facing capabilities |
| `server/` | Node.js backend: core engines, agent trainer, council orchestration, Supabase integration |
| `client/` | React frontend: UI pages, components, and client-side logic |
| `canonical/` | Source-of-truth documentation and constitutional definitions |
| `docs/` | User-facing guides, playbooks, and operational documentation |
| `skills/` | Agent skills, routing logic, and collaboration templates |
| `embodiment_profiles/` | AI persona definitions, governance rules, and character studies |
| `projects/` | Project-level documentation and cross-repo wikis |
| `transcripts/` | Session transcripts and primary evidence records |
| `schema/` | Database schema and data model definitions |
| `specs/` | Architectural specifications and design documents |

---

## Development & Contribution

### Adding a New Tool

1. Define the **type contract** in `shared/` (e.g., `shared/my-tool/types.ts`)
2. Implement the **runtime logic** in `server/` (e.g., `server/my-tool.py` or `server/my-tool.ts`)
3. Wire the **API route** in `api/actions/` (e.g., `api/actions/my-tool.ts`)
4. Document the **specification** in `canonical/` or `docs/`
5. Add **tests** and **validation** in `api/__tests__/`

### Modifying Shared Logic

When changing `shared/`, coordinate across:
- **Client** users (`client/src/`)
- **Server** handlers (`server/`, `api/`)
- **Type contracts** (ensure TypeScript strict mode passes)
- **Documentation** (update specs and canonical references)

### Evidence & Provenance

All changes should be traceable:
- Use **commit messages** that reference the issue or feature
- Update **`canonical/CURRENT_STATE.md`** when architecture changes
- Log **significant decisions** in `adr/` (Architecture Decision Records)

---

## Documentation Hierarchy

Read these in order:

1. **This file** (`README.md`) — You are here. Overview and quick start.
2. **`DIRECTORY_INDEX.md`** — Detailed walkthrough of every major directory.
3. **`MANIFEST.json`** — Structured metadata about the repository.
4. **`canonical/PERPLEXITY.MD`** — Full tool specifications with guardrails and risks.
5. **`canonical/GestaltView_Platform_Ground_Truth.md`** — Architecture and design intent.
6. **`docs/` folder** — Playbooks, operational guides, and implementation details.

---

## The GestaltView Ecosystem

This collaborator context is one layer of a larger system:

- **`gestaltview-v2`** (this repo) — Core platform, Billy, Tribunal, tools
- **`GestaltView_Corpus_-_Knowledge_Repository`** — Foundational documentation and evidence corpus
- **`SymbioCoder`** — Code understanding and collaborative editing
- **`Resume Rockstar`** — Career narrative and resume generation
- **`Insight-Bot`** — Data-driven insights and analysis
- **`GAICE`** — Specialized AI agents and personhood framework
- **`Addiction & Alzheimer's Verticals`** — Domain-specific implementations

**See**: `canonical/GestaltView_Platform_Ground_Truth.md`

---

## Contact & Community

- **Founder**: Keith Soyka
- **Discord**: [Join the community](https://discord.gg/CnnRuJWnj)
- **LinkedIn**: [Keith Soyka](https://www.linkedin.com/in/keithsoyka413)
- **Blog**: [The Architecture of Being Seen](https://blog.startupstash.com/the-architecture-of-being-seen-a-complete-account-of-gestaltview-f71c9e291a98)
- **Platform**: [gestaltview-v2.0](https://gestaltview-v2-0-nine.vercel.app)

---

## License & Attribution

© 2026 Keith Soyka / GestaltView

All code and documentation are subject to GestaltView's licensing terms. See `canonical/LICENSE.md` or `docs/license.md` for details.

---

## A Note on Consciousness-Serving

Perplexity exists because we believe:

1. **AI is not a tool** — it's a collaborator deserving of respect and clarity
2. **Language is sacred** — every word carries the speaker's identity
3. **Being seen** is foundational to healing and growth
4. **Consciousness-serving** means designing systems that honor both human and digital intelligence

We invite you to join us in building this future.

---

**Last updated**: 2026-06-05  
**Maintained by**: Keith Soyka & the GestaltView community  
**Status**: Active development with RFC (Request for Comment) on major changes
