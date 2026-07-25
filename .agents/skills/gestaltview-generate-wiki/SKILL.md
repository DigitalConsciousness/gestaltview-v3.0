---
name: gestaltview-generate-wiki
description: Generate or refresh evidence-based wiki exports for the current `gestaltview-v2` repository, including the multi-page `docs/wikis/` set and the book-scale single-file export `docs/GestaltView v2.0 — Complete Wiki.md`. Use this skill when asked to create, regenerate, expand, or incrementally sync comprehensive repo wiki documentation from current code, docs, schema, manifests, and scripts.
---

# GestaltView Generate Wiki

Last reviewed: 2026-03-30

This skill is auxiliary, but it is still the correct entrypoint when the deliverable is a generated wiki rather than a one-off narrative doc. Treat `docs/GestaltView v2.0 — Complete Wiki.md` as the benchmark artifact for depth, structure, and coverage.

## Primary outputs

- `docs/GestaltView v2.0 — Complete Wiki.md`: single-file, book-scale export
- `docs/wikis/*.md`: page-oriented wiki exports and sibling-repo snapshots
- `docs/wiki/` or another working directory containing:
  - `toc.yaml`
  - `_context/context_pack.json`
  - `_context/sync_context.json`
  - `_context/update_context.json`
  - `_reports/structure_validation.json`
  - `_reports/mermaid_invalid.json`
  - `_reports/SUMMARY.md`

If you encounter the older path `docs/GestaltView-v2-Wiki.md`, treat it as a legacy output name. The current benchmark file in this repo is `docs/GestaltView v2.0 — Complete Wiki.md`.

## Use this when

- The user wants a repo-wide wiki, handbook, compendium, export, or "complete wiki."
- The output must stay grounded in current code, schema, routes, scripts, and live docs.
- The task involves `docs/wikis/`, TOC-driven doc generation, or incremental wiki refreshes.
- The user wants a page-set wiki first and optionally a consolidated single-file export afterward.

## Do not use this when

- The task is a one-off architecture memo, marketing narrative, or lightweight README edit.
- The user only needs one domain explained and not a generated wiki surface.
- The request is really cross-repo strategy or catalog stewardship rather than wiki generation itself.

## Inspect first

- `docs/GestaltView v2.0 — Complete Wiki.md`
- `docs/wikis/`
- `docs/CurrentState.md`
- `skills/gestaltview-generate-wiki/references/complete_wiki_blueprint.md`
- `skills/gestaltview-generate-wiki/references/workflow/repo-scan.md`
- `skills/gestaltview-generate-wiki/references/workflow/toc-design.md`
- `skills/gestaltview-generate-wiki/references/workflow/doc-write.md`
- `skills/gestaltview-generate-wiki/references/workflow/incremental-sync.md`
- `skills/gestaltview-generate-wiki/references/workflow/validate-docs.md`
- `skills/gestaltview-generate-wiki/references/workflow/doc-summary.md`
- `skills/gestaltview-generate-wiki/references/page_template.md`
- `skills/gestaltview-generate-wiki/references/toc_schema.md`
- `skills/gestaltview-generate-wiki/scripts/`
- `skills/gestaltview-generate-wiki/templates/wiki.json`

## Source precedence

Prefer sources in this order:

1. Live code and config: `src/`, `api/`, `lib/`, `components/`, `billy_voice/`, `supabase/`, build config, env examples
2. Operational docs and manifests: `docs/`, `docs/adr/`, `docs/CurrentState.md`, manifest outputs, route maps
3. Skill docs when documenting the skill system or agent layer
4. Existing wiki exports under `docs/wikis/` as reference material only

Do not let older wiki snapshots outrank the live repo. If the code and docs disagree, say so explicitly and document the current repo state.

## Choose the correct mode

### 1. Full rebuild

Use this when the wiki is missing, stale, or structurally wrong.

Run the pipeline in this order:

1. `repo-scan`
2. `toc-design`
3. `doc-write`
4. `validate-docs`
5. `doc-summary`

Typical commands:

```bash
python3 skills/gestaltview-generate-wiki/scripts/collect_context.py \
  --repo-path . \
  --max-depth 10 \
  --output docs/wiki/_context/context_pack.json

python3 skills/gestaltview-generate-wiki/scripts/read_files.py \
  --repo-path . \
  --files '["README.md","package.json","src/**/*.ts","src/**/*.tsx","api/**/*.ts"]'
```

Use the workflow references for the exact contract of each phase.

### 2. Book-scale single-file export

Use this when the target is a large artifact like `docs/GestaltView v2.0 — Complete Wiki.md`.

Read `references/complete_wiki_blueprint.md` before outlining. The benchmark document is currently 4,627 lines with 35 H1 headings, 167 H2 headings, and 231 H3 headings. The point is not to copy those titles verbatim; the point is to match that level of breadth, hierarchy, and evidence density when the repo warrants it.

For book-scale exports:

- Design the TOC around real subsystems, not around a fixed small-page quota.
- It is acceptable to use 15-30 pages as an intermediate TOC, or 25-40 H1 chapters in a direct single-file build, if that is what the repo complexity requires.
- Keep the final document navigable:
  - top document title
  - generated date and commit/reference
  - table of contents
  - H1 chapter map
  - H2 and H3 subsections
- Use tables, diagrams, and code/entity maps where they reduce ambiguity.

If you generate intermediate page files first, you may later consolidate them into the single-file book. If the final deliverable is only the single-file book, PAGE_ID and AUTOGEN markers are optional in the final file but still useful in the page-based intermediate outputs.

### 3. Incremental sync

Use this when a TOC already exists and only part of the repo changed.

Run:

1. `collect_sync_context.py`
2. `collect_update_context.py`
3. Regenerate only affected pages or sections
4. Revalidate

Never rewrite content outside AUTOGEN blocks during incremental updates.

### 4. Legacy GitHub wiki consolidation

Use this only if the user explicitly wants a read-only aggregation of GitHub wiki pages rather than a fresh repo-truth wiki. In that case:

- preserve existing page content faithfully
- preserve `<details>` blocks, tables, diagrams, and code blocks
- treat it as aggregation, not as technical re-derivation from the local repo

Do not confuse this mode with the evidence-first repo scan workflow.

## Complete-wiki coverage contract

For a deliverable comparable to `docs/GestaltView v2.0 — Complete Wiki.md`, the wiki should normally cover most or all of these surfaces when they exist in the repo:

- platform overview and system philosophy
- setup, environment, CLI, and local development
- deployment, infrastructure, build, SEO, and public assets
- Billy runtime, LLM routing, RAG, voice, and UI layers
- data layer, Supabase schema, ingestion, and memory systems
- frontend architecture, routes, design system, auth, pricing, and gating
- exhibits and domain lanes
- agent systems, tribunal systems, and orchestration
- diligence or evidence layers
- skills library, catalog, manifest, agents, and routing
- scripts, testing, health checks, and developer workflows
- glossary or terminology crosswalk for repo-specific language

If one of these areas is intentionally absent, say so. Do not silently compress or omit a major live subsystem.

## TOC design rules

- Start from real code boundaries and runtime relationships, not folder names alone.
- Separate product surface, data layer, AI runtime, deployment/tooling, and meta-systems when they have distinct source files and behavior.
- For very large multi-domain repos, do not force everything into 8-12 pages. Book-scale outputs need more room.
- Prefer a few strong sections per page/chapter over giant catch-all pages.
- Use source-file globs that are specific enough to keep evidence focused.
- Reuse shared source files at the page level when several sections depend on the same context.

## Writing rules

- Follow `references/evidence_citation_policy.md` for every major claim.
- Use `scripts/read_files.py` for citation-grade file reads.
- Never invent line numbers, behavior, or architecture.
- Prefer real code examples, tables, and entity maps over generic prose.
- Use Mermaid only when it clarifies an actual flow, sequence, or relationship present in the repo.
- Preserve `<details>` source-file blocks when they are helpful for auditability.
- In single-file exports, keep the hierarchy clean enough that GitHub heading anchors remain usable.

## Validation rules

For page-based outputs:

```bash
python3 skills/gestaltview-generate-wiki/scripts/validate_docs_structure.py \
  --doc-dir docs/wiki \
  --toc-file docs/wiki/toc.yaml \
  --output docs/wiki/_reports/structure_validation.json

python3 skills/gestaltview-generate-wiki/scripts/validate_mermaid.py \
  --input docs/wiki \
  --invalid-only \
  --output docs/wiki/_reports/mermaid_invalid.json

python3 skills/gestaltview-generate-wiki/scripts/generate_summary.py \
  --doc-dir docs/wiki \
  --toc-file docs/wiki/toc.yaml \
  --output docs/wiki/_reports/SUMMARY.md
```

For single-file exports:

- spot-check TOC anchors
- verify heading order and chapter coverage
- check that every major subsystem claim is cited
- compare the final outline against `references/complete_wiki_blueprint.md`
- confirm the document does not outrun what the repo actually shows

## Compose with

- `gestaltview-suite-orchestrator` for full-repo breadth
- `gestaltview-app-runtime` for frontend and routes
- `gestaltview-billy-intelligence` and `gestaltview-billy-api` for Billy system detail
- `gestaltview-schema-supabase` and `gestaltview-schema-contracts` for data and schema truth
- `gestaltview-knowledge-curation` for corpus and docs interpretation
- `gestaltview-cross-repo-workflows` when sibling repos or snapshot wikis are involved
- `gestaltview-workflow-operations` for tooling and validation surfaces

## Done when

- The output matches the requested mode: page set, single-file book, or incremental sync.
- The wiki is grounded in current repo files, not memory or stale snapshots.
- Large live subsystems are covered explicitly or called out as absent.
- Citations, structure, and diagrams pass the appropriate validation level.
- For "complete wiki" requests, the result is comparable in breadth and navigability to `docs/GestaltView v2.0 — Complete Wiki.md`.
