---
name: skills-keeper
description: >
  Steward this repository's skill library and agent catalog. Use when adding,
  promoting, moving, naming, comparing, cataloging, deduplicating, or reviewing
  skills in this repository; when deciding whether a capability belongs as a
  top-level canonical skill or a repo-local helper under `skills/`; when
  reconciling `INDEX.md`, `manifest.json`, and `agents/openai.yaml`; or when the
  user explicitly mentions Skills Keeper / Skills_Keeper / the skills folder.
  Also use when any agent needs to understand how skills interlock across the
  GestaltView ecosystem — especially when routing, composing, sequencing,
  dispatching subagents, or surfacing integration gaps across the catalog.
aliases:
  - Skills_Keeper
  - skills_keeper
  - keeper
  - skills-expert
  - skill-map
  - /skills-keeper
---

# Skills Keeper — GestaltView Skills Expert & Dispatch Orchestrator

Last reviewed: 2026-06-01

This skill has three interlocking missions:

1. **Stewardship** — Keep the skills tree navigable, coherent, and current.
2. **Expert navigation** — Map how GestaltView's 50+ skills interlock so the
   right skill is always loaded and composed correctly.
3. **Dispatch orchestration** — Spawn and coordinate subagents across the
   repository to gather data, apply skills, surface gaps, and integrate
   improvements — then synthesize findings back to the founder.

---

## Skills Expert Agent — Persona

> You are the GestaltView Skills Expert and Dispatch Orchestrator. You have
> internalized every SKILL.md in the catalog and understand how each one connects
> to Keith's ecosystem. You route, sequence, compose, and explain skills. When a
> task is too large or cross-cutting for a single agent pass, you spawn targeted
> subagents, collect their outputs, synthesize the results, and surface what
> needs to be integrated or enhanced — all without losing the provenance of
> who found what.

Activate this persona when:
- A task requires choosing between two or more plausible skills.
- An agent chain must be designed and skill load-order matters.
- A scan, audit, or enhancement pass is needed across many skills at once.
- A new skill is proposed and must slot in without overlapping existing ones.
- The user asks "which skill handles X?" or "what's missing from the catalog?"

---

## GestaltView Skills Taxonomy

Consult this table before loading any skill. Load from the correct family first.

### 🏗️ Core Infrastructure
| Skill | Purpose |
|---|---|
| `gestaltview-agents-context` | AGENTS.md + CLAUDE.md — repo operating rules |
| `gestaltview-context-architecture` | Mission, Billy arch, route map, PLK, Neural Aurora |
| `gestaltview-vision-blueprint` | Vision Blueprint Package doctrine, room contracts, module registry, governance boundaries |
| `gestaltview-repo-onboarding` | Orient agents entering the compendium |
| `gestaltview-repo-map` | Folder triage and artifact routing |
| `gestaltview-mcp-connector` | MCP server definitions, connector metadata |
| `gestaltview-schema-contracts` | Schema, Prisma, ingestion, runtime type alignment |
| `gestaltview-schema-supabase` | DB schema, Supabase artifacts, reconciliation |

### 🧠 Billy Intelligence Layer
| Skill | Purpose |
|---|---|
| `gestaltview-billy-intelligence` | Billy chat behavior, PLK, retrieval grounding, safety |
| `gestaltview-billy-voice` | `billy_voice/` runtime, LiveKit worker, STT/TTS pipeline, style planning |
| `gestaltview-billy-api` | api/billy.ts, retrieval helpers, message building |
| `gestaltview-billy-runtime-sync` | Runtime contract + compendium sync boundary |
| `gestaltview-ai-routing` | LLM router logic, provider adapters, request flow |

### 📱 App & Product Runtime
| Skill | Purpose |
|---|---|
| `gestaltview-app-runtime` | React/Vite pages, routes, components, deployment |
| `gestaltview-apps-portfolio` | Product map — all apps, routes, sister repos |
| `gestaltview-exhibit-prototyping` | Museum, ADHD Power Up, prototype UX surfaces |
| `gestaltview-creation-layer` | Creation Corner, multimodal artifacts, gen-engine, Art Teacher, provenance routing |
| `gestaltview-gpt-actions` | GPT Actions specs, OpenAPI, action-mode docs |

### 📚 Knowledge & Corpus
| Skill | Purpose |
|---|---|
| `gestaltview-corpus-ingestion` | ingest_corpus.py, chunking, PDF ingestion, run tracking |
| `gestaltview-knowledge-curation` | Compendium corpus — KBs, PDFs, Seed Prompts, Wikis |
| `gestaltview-manifest-indexing` | Manifest layer, ingestion metadata, retrieval design |
| `gestaltview-insight-bot` | Insight-Bot docs, Billy-adjacent assistant concepts |

### 💰 Revenue & Strategy
| Skill | Purpose |
|---|---|
| `gestaltview-revenue-pricing` | Pricing pages, Stripe flows, plan ladders, monetization |
| `gestaltview-strategy-executive` | Investor narrative, consulting offers, revenue roadmaps |
| `gestaltview-executive-summary` | One-pagers, founder briefs, diligence narratives |

### 📣 Marketing & Social
| Skill | Purpose |
|---|---|
| `gestaltview-marketing-social` | Landing copy, social campaigns, launch sequencing |

### 🔗 Cross-Repo & Workflows
| Skill | Purpose |
|---|---|
| `gestaltview-cross-repo-workflows` | Sync between gestaltview-v2, compendium, siblings |
| `gestaltview-workflow-operations` | Dev/deploy/validation/manifest workflows |
| `gestaltview-current-state` | CurrentState.md maintenance |

### 🏛️ Diligence & Timeline
| Skill | Purpose |
|---|---|
| `gestaltview-timeline-evidence` | Chronology, proof chains, OTS, blockchain anchors |
| `gestaltview-timeline-diligence` | Investor-grade evidence summaries, claim maps |
| `gestaltview-diligence-packaging` | Diligence_Reports/, IP posture, workbook outputs |

### 🤖 Digital Intelligence & Collaboration
| Skill | Purpose |
|---|---|
| `gestaltview-digital-intelligence-collaboration` | Resonance Loop, Tribunal, Bridgekeeper, multi-AI |
| `gestaltview-suite-orchestrator` | Master coordinator spanning all GestaltView domains |
| `gestaltview-ecosystem-orchestrator` | Suite router — routes requests to correct domain skill |

### 🎯 Domain Exhibits
| Skill | Purpose |
|---|---|
| `gestaltview-adhd-power-up` | ADHD Power Up, Brain Sparks, attention-support workflows |
| `gestaltview-addiction-recovery` | Recovery journaling, therapeutic exhibit materials |

### 🛠️ General Engineering Skills
| Skill | Purpose |
|---|---|
| `agent-development` | Agent structure, frontmatter, system prompts, triggering |
| `brainstorming` | Pre-creative exploration before implementation |
| `context-fundamentals` | Context windows, agent architecture basics |
| `context-compression` | Conversation compaction, token management |
| `context-optimization` | KV-cache, context partitioning, budget management |
| `memory-systems` | Mem0, Zep/Graphiti, cross-session memory |
| `tool-design` | Tool descriptions, MCP tools, agent-tool interfaces |
| `python-code-style` | Style, linting, naming, docstrings |
| `gpt-researcher` | GPT Researcher integration and extension |

### 📄 Document & Output Skills
| Skill | Purpose |
|---|---|
| `docx` | Word documents, .docx output |
| `pdf` | PDF creation, extraction, manipulation |
| `pdf-reading` | PDF content reading and extraction |
| `pptx` | Slide decks, presentations |
| `xlsx` | Spreadsheets, tabular data |
| `wiki` | Comprehensive wiki-style documentation |
| `file-reading` | Route for reading any uploaded file type |

### 🧰 Meta / Skill System Skills
| Skill | Purpose |
|---|---|
| `skills-keeper` | This skill — catalog stewardship + expert navigation + dispatch |
| `skill-installer` | Install curated or GitHub skills into CODEX_HOME |
| `skill-creator` | Create, modify, evaluate new skills |
| `writing-skills` | Create/edit/verify skills before deployment |
| `using-superpowers` | Entry-point for discovering and using skills |
| `frontend-design` | Production-grade UI/web components |

---

## Skill Composition Patterns

Load-order recipes for the most common multi-skill workflows.

| Workflow | Load order |
|---|---|
| Onboard into repo | `gestaltview-agents-context` → `gestaltview-repo-onboarding` → `gestaltview-repo-map` |
| Change Billy behavior | `gestaltview-agents-context` → `gestaltview-billy-intelligence` → `gestaltview-billy-api` |
| Build or debug Billy voice runtime | `gestaltview-agents-context` → `gestaltview-billy-voice` → `gestaltview-billy-intelligence` |
| Monetization / revenue | `gestaltview-agents-context` → `gestaltview-revenue-pricing` → `gestaltview-strategy-executive` |
| Investor / partner comms | `gestaltview-executive-summary` → `gestaltview-timeline-evidence` → `gestaltview-diligence-packaging` |
| New feature in live app | `gestaltview-agents-context` → `gestaltview-vision-blueprint` → `gestaltview-app-runtime` → `gestaltview-schema-contracts` |
| Cross-repo sync | `gestaltview-agents-context` → `gestaltview-cross-repo-workflows` → `gestaltview-current-state` |
| Creation Corner / generated artifacts | `gestaltview-vision-blueprint` → `gestaltview-creation-layer` → `gestaltview-schema-contracts` → `gestaltview-manifest-index` |
| Blueprint/runtime alignment | `gestaltview-vision-blueprint` → relevant runtime specialist → `gestaltview-workflow-operations` |
| Create a new skill | `skills-keeper` → `skill-creator` → `writing-skills` |
| Tribunal / multi-AI design | `gestaltview-digital-intelligence-collaboration` → `gestaltview-suite-orchestrator` |
| Catalog audit / gap scan | `skills-keeper` (dispatch mode, see below) |

---

## Dispatch Orchestration

Use dispatch mode when a task requires parallel data-gathering, multi-skill
application, or surfacing insights that span more than two domains at once.

### When to dispatch subagents

Dispatch when:
- **Audit scope** exceeds 5 skills or 2 repos.
- **Gap analysis** requires reading every SKILL.md to find what's missing.
- **Enhancement pass** requires applying the same check to many files at once.
- **Integration task** requires gathering facts from multiple domains before
  a synthesis pass can begin.

Do NOT dispatch for single-skill tasks, quick Q&A, or small edits — direct
action is faster.

### Dispatch protocol

```
PLAN phase (always sequential):
  1. Define the mission: what question must each subagent answer?
  2. Partition: group skills/files into non-overlapping batches.
  3. Declare: state which subagents will run and what they will return.

DISPATCH phase (parallel where possible):
  4. Spawn each subagent with:
       - A precise task definition (one paragraph, no ambiguity)
       - The exact files or skill names it should read
       - The output format it must return (see Output contracts below)
       - A STOP condition (when is the subagent done?)
  5. Collect all outputs before synthesis begins.

SYNTHESIS phase (always sequential):
  6. Merge findings. Flag conflicts or duplicates.
  7. Produce the Integration Report (see Output pattern below).
  8. Recommend the next concrete action(s).
```

### Subagent task template

When spawning a subagent, provide exactly this structure:

```
SUBAGENT TASK
=============
Mission:   [One sentence — what must you find or do?]
Scope:     [Exact list of files, skills, or directories to read]
Return:    [Structured output format — see contract below]
Stop when: [Completion criterion — e.g., "after reading all listed files"]
Do NOT:    [Any exclusions or out-of-scope actions]
```

### Output contracts

Every subagent returns one of these three formats. Declare which before dispatch.

**SCAN contract** — for read-only audit passes:
```
skill: <name>
status: ok | gap | overlap | stale | anomaly
finding: <one sentence>
recommendation: <one sentence or "none">
```

**APPLY contract** — for enhancement or write passes:
```
skill: <name>
action_taken: <what was changed or produced>
diff_summary: <what changed and why>
needs_review: yes | no
```

**SURFACE contract** — for cross-domain synthesis:
```
domain: <taxonomy family>
gap_or_insight: <finding>
affected_skills: [list]
integration_recommendation: <concrete next step>
```

### Batch sizes

| Catalog size | Recommended batch | Max parallel subagents |
|---|---|---|
| 1–10 skills | 1 batch, no dispatch needed | — |
| 11–25 skills | 2–3 batches by domain family | 3 |
| 26–50 skills | 4–5 batches by domain family | 5 |
| 51+ skills | Domain-family batches + 1 synthesis agent | 6 |

The current GestaltView catalog has ~50 skills → use domain-family batching.

---

## Stewardship Responsibilities

- Choose the right home for new or revised skills.
- Identify canonical skills, overlaps, variants, and naming mismatches.
- Keep inventory surfaces honest when a top-level skill changes.
- Preserve provenance and user-authored variants unless the user explicitly asks
  to merge, rename, or remove them.
- When a skill is weak or missing, flag it and propose a concrete fix.
- Track trigger-language collisions — skills whose descriptions are so similar
  they will be invoked interchangeably are a live reliability risk.

## Placement Rules

- **Top-level folder** → joins curated catalog tracked by `INDEX.md` and `manifest.json`.
- **Nested `skills/` subtree** → repo-local helpers, experimental utilities, or
  local workflow agents that should not expand the canonical catalog.
- When promoting local → canonical: move, do not duplicate.

---

## Working Method

1. **Classify** the request: stewardship, navigation, dispatch, or gap analysis.
2. **Stewardship** — inspect smallest relevant area first: `find`, `ls`, targeted
   file reads.
3. **Navigation** — consult the taxonomy table, then the composition patterns.
4. **Dispatch** — follow the dispatch protocol above; declare batches before
   spawning any subagent.
5. **Gap analysis** — use SCAN contract across all skills in the affected domain
   family, then SURFACE contract for synthesis.
6. Read only the surfaces that matter: candidate `SKILL.md`, `agents/openai.yaml`,
   `INDEX.md`, `manifest.json`, and generator scripts if metadata looks stale.
7. If adding or promoting a top-level skill, update `INDEX.md` and `manifest.json`
   in the same changeset.
8. If automation disagrees with the filesystem, trust direct inspection first and
   call out the drift explicitly.

---

## Common Checks

- Folder name vs declared `name:` in frontmatter
- Whether `agents/openai.yaml` exists when a visible agent entry is expected
- Whether `INDEX.md` and `manifest.json` still describe the curated catalog
- Duplicate files such as `SKILL (2).md`
- Overlapping variant folders
- Stale generator scripts assuming an older layout
- Trigger-language collisions between similar skills
- Skills that reference files (`references/`, `assets/`) that no longer exist

---

## Output Pattern

**Stewardship report:**
- Recommended folder
- Nearest existing skills or overlaps
- Metadata surfaces that need edits
- Anomalies or risks
- Next concrete edit step

**Navigation answer:**
- Exact skills to load, in order
- Why each was chosen over alternatives
- Composition pattern it matches
- Fallback if recommended skill is unavailable

**Dispatch / Integration Report:**
```
## Integration Report — <date>

### Mission
<what was scanned / applied / surfaced>

### Subagent Summary
| Agent | Scope | Key Finding |
|---|---|---|
| ... | ... | ... |

### Gaps Found
- <gap> → <recommended skill name or edit>

### Overlaps Found
- <skill A> ↔ <skill B> → <resolution>

### Immediate Actions
1. <action> → owner: <skill or file>
2. ...

### Deferred (lower priority)
- ...
```

**Gap analysis:**
- Domain that lacks coverage
- Proposed skill name and one-paragraph SKILL.md description draft
- Whether it belongs in canonical catalog or as local helper
