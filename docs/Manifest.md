# Manifest — GestaltView v2

> **Last updated:** 2026-06-22
> **Repo:** `DigitalConsciousness/gestaltview-v2.0`
> **Status:** Active / human-readable repo index

This document is the human-readable companion to the generated manifest outputs:

- `docs/gestaltview-v2.manifest.json`
- `docs/gestaltview-v2.manifest.md`

Use this file to understand what major parts of the repository exist, what the manifest generator actually scans, and when to regenerate those outputs.

---

## 1. What the manifest layer is for

The manifest layer exists to make repo orientation and handoff work easier for humans and tools.

It gives you:

- a file inventory across the main runtime and documentation surfaces
- a route inventory derived from the client runtime
- an API handler inventory derived from `api/`
- a markdown/doc index
- a test inventory covering test files, shell runners, and npm test aliases
- a dependency snapshot
- a git status snapshot at generation time

It does **not** replace direct inspection of live files.

---

## 2. Primary orientation files

| File | Purpose |
|---|---|
| `README.md` | Top-level runtime overview |
| `GestaltView_Constitutional_Invariants_v1.0.md` | Canonical dignity and continuity charter for users and digital intelligences |
| `RDRC.md` | Canonical charter for preserving rough drafts and ratifying doctrine across GestaltView repos |
| `.orientation/gestaltview_orientation_packet.v1.{json,yaml,md}` | Mandatory orientation check-in packet for repo orientation and handoff |
| `COLAB.md` | Collaboration and execution notes |
| `docs/CurrentState.md` | Live operational state log |
| `docs/ContextPersistenceChecklist.md` | One-page closeout checklist for carrying context forward |
| `docs/SessionHandoffPacket.md` | Copy-ready packet for ending one session and starting the next |
| `docs/ContextPersistenceProtocol.md` | Rules for rolling durable context forward between sessions |
| `docs/ArchitecturalStructure.md` | System layers and runtime boundaries |
| `docs/AIFlow.md` | Billy, actions, memory, trainer, and provider routing |
| `docs/APIFlow.md` | API routes and contracts |
| `docs/SymbioticWorkflow.md` | Compendium-to-runtime operating loop |
| `docs/PlaybookOperatorManual.md` | v2 operator field guide |
| `docs/Workflows.md` | Practical operating workflow |
| `docs/Manifest.md` | This file |
| `docs/README-manifest.md` | Notes on generated manifest artifacts |
| `docs/PlaybookSpec.md` | Playbook source spec and operating contract |

---

## 3. What the generator currently scans

`scripts/generate_repo_manifest.py` currently scans these major surfaces:

- repo-root files with supported extensions such as `README.md`, `package.json`, `GestaltView_Constitutional_Invariants_v1.0.md`, and `RDRC.md`
- `.orientation`
- `api`
- `client/src`
- `agent_trainer/gestaltview_agent_trainer/tests`
- `shared`
- `scripts`
- `server`
- `config`
- `docs`
- `tests`
- `supabase/migrations`
- `orientation`

It collects metadata for files with extensions such as:

- `.ts`, `.tsx`, `.js`, `.mjs`
- `.json`
- `.md`, `.mdx`
- `.sh`, `.py`
- `.sql`
- `.css`
- `.toml`, `.yaml`, `.yml`

The generator also extracts:

- route inventory
- API handler inventory
- canonical docs index
- test inventory
- dependency snapshot from `package.json`
- git metadata and dirty-file list

---

## 4. Human-readable repo atlas

### 4.1 Application runtime

| Path | Purpose |
|---|---|
| `client/` | React 19 + Vite frontend |
| `client/src/pages/` | Route-level pages |
| `client/src/components/` | Billy UI, exhibits, diligence explorer, shared UI |
| `client/src/components/inner-world/` | Inner-world room, artifact, and inspector surfaces |
| `client/src/features/agent-trainer/` | Trainer control-plane UI |
| `client/src/contexts/` | Auth and theme providers |
| `client/src/lib/` | Billy client bridge and frontend helpers |
| `client/src/canonical/` | Canonical markdown/context bundled into the app |
| `api/` | Vercel serverless handlers |
| `api/_lib/` | Shared API helpers: auth, cors, embeddings, memory, llmRouter, response, supabase, rate limits |
| `api/gate/` | Package checkout, drafts, orders, support, and webhooks |
| `api/workbook/` | Workbook item and sync routes |
| `shared/` | Billy, PLK, tribunal, and trainer shared modules |
| `server/` | Optional local server + trainer orchestration |
| `worker/` | Trainer execution loop |

### 4.2 Data, schema, and retrieval

| Path | Purpose |
|---|---|
| `supabase/` | Local CLI config, schema snapshots, migrations, snippets |
| `supabase/schema.sql` | Current broad schema snapshot |
| `supabase/migrations/` | Versioned SQL changes |
| `api/_lib/supabase.ts` | App-facing Supabase REST/RPC access layer |
| `api/_lib/memory.ts` | Memory sanitization, ranking, and retrieval helpers |
| `scripts/ingest_corpus.py` | Current corpus-ingestion pipeline |
| `scripts/temporal_backfill.py` | Temporal metadata backfill entrypoint |
| `temporal/gestaltview_temporal.py` | Shared temporal metadata derivation and backfill SQL helper |
| `config/corpus-map.json` | Corpus/source package mapping |

Supabase currently underpins:

- auth and profile reads
- user tiers and rate limits
- founder continuity
- Billy session logging
- bucket drops
- persistent user memory
- knowledge and skill fragment retrieval
- trainer persistence and approvals
- gate orders and package state
- workbook item and sync data

### 4.3 Diligence and evidence surfaces

| Path | Purpose |
|---|---|
| `Diligence_Reports/` | Source diligence bundles and report files |
| `diligence/exports/` | Export assets such as `ots_index.csv` |
| `client/src/components/DiligenceExplorer/` | Live diligence explorer UI |
| `api/diligence.ts` | Diligence dataset API |
| `api/diligence/ots.ts` | OTS index API |

### 4.4 Billy, voice, and trainer surfaces

| Path | Purpose |
|---|---|
| `api/billy.ts` | Billy bootstrap, retrieval, memory grounding, and chat |
| `api/billy-health.ts` | Billy pipeline readiness |
| `api/billy-bucket-drop.ts` | Durable bucket-drop capture |
| `client/src/components/BillyLive.tsx` | Main Billy page experience |
| `client/src/lib/billyApi.ts` | Billy API-first client bridge |
| `shared/billy/` | Shared Billy runtime and diagnostics |
| `api/session/memory.ts` | Persistent memory API |
| `billy_voice/` | Python spoken-runtime worker |
| `api/voice/billy.ts` | ElevenLabs TTS proxy |
| `api/trainer/**` | Trainer API endpoints |
| `server/agent-trainer/**` | Trainer orchestration, providers, persistence |
| `worker/trainer/main.ts` | Trainer job worker |

### 4.5 Operations, docs, and skills

| Path | Purpose |
|---|---|
| `scripts/` | Health checks, CLI, manifest generation, migration, ingestion, validation helpers |
| `tools/` | Billy, diligence, and manifest helper tooling |
| `docs/` | Architecture, workflow, manifest, playbook, and state docs |
| `skills/` | Skill docs and skill-catalog metadata |
| `agents/` | Agent definitions and generated agent inventory surfaces |

---

## 5. Generated manifest outputs

The generated outputs live in:

- `docs/gestaltview-v2.manifest.json`
- `docs/gestaltview-v2.manifest.md`
- `repo_manifest.json` when the corpus-side snapshot is present

Regenerate them with:

```bash
python3 scripts/generate_repo_manifest.py
```

Regenerate when route, API, script, migration, or documentation inventory changed materially.

---

## 6. Known manifest limitations

The manifest generator is useful, but its extraction is mechanical.

Important caveats:

- it captures snapshots, not live behavioral truth
- route extraction is pattern-based and still depends on checking `client/src/App.tsx` for final certainty
- API extraction is file-based; review the handler files before treating the generated endpoint list as a contract
- generated outputs go stale as soon as the repo changes

If the generated manifest conflicts with live code, live code wins.

---

## 7. Relationship to the workflow

The manifest layer is part of the repo's externalized memory and cross-repo handoff discipline.

Use it for:

- fast repo orientation
- machine-readable context for tools/agents
- wiki-generation inputs
- cross-repo handoff summaries
- sanity-checking whether routes, APIs, scripts, and docs are represented

Do not use it as a substitute for:

- checking current runtime code
- validating a route or endpoint contract
- understanding recent operational drift

For those, use:

- `docs/CurrentState.md`
- `docs/ArchitecturalStructure.md`
- `docs/AIFlow.md`
- `docs/APIFlow.md`

---

## 8. Companion repositories

These are part of the active ecosystem but may not be mounted in this workspace:

| Repo | Role |
|---|---|
| `GestaltView_Corpus_-_Knowledge_Repository` | Canonical long-memory corpus and evidence archive |
| `Insight-Bot` | Insight-focused product lane |
| `SymbioCoder` | Coding-assistant lane |
| `Resume Rockstar` | Career/resume lane |
| `GAICE` | Broader ecosystem integration surface |

When a companion repo is not present locally, document it as a handoff or dependency rather than as a confirmed local file tree.
