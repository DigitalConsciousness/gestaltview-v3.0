# Skills Folder Index

This file is the human-readable companion to [manifest.json](./manifest.json). It keeps the `.agents/skills/` tree opinionated instead of permissive: the curated catalog should surface the smallest high-signal library that covers the live GestaltView runtime and the consolidated Vision Blueprint Package.

Last indexed: `2026-06-24`

## Snapshot

- `53` top-level skills are in the strict curated manifest.
- `25` of those are the highlighted core for a lean skill-corpus rebuild.
- `126` top-level folders on disk contain `SKILL.md`.
- `73` top-level skill folders remain on disk but are auxiliary, experimental, vendor-specific, generic, or overlapping.
- `28` canonical skills include `agents/`.
- `10` canonical skills include `scripts/`.
- `37` canonical skills include `references/` or `reference/`.
- `9` canonical skills include `assets/`.

## Catalog Policy

- `manifest.json` is the source of truth for canonical top-level discovery.
- Canonical means one of three things only:
  - It is a repo-owned GestaltView skill with a clear local surface and non-placeholder guidance.
  - It aligns runtime work to the consolidated `GestaltView_Vision_Blueprint_Package/` doctrine or Creation Layer supplement.
  - It is one of the three skill-library stewardship skills: `skills-keeper`, `skill-creator`, or `skill-installer`.
- Generic vendor packs, document utilities, imported tool skills, and overlapping bundles can remain on disk without participating in normal routing.
- `gestaltview-vision-blueprint` is the doctrine bridge for room/module/governance alignment; `gestaltview-creation-layer` is the runtime bridge for Creation Corner, gen-engine, Art Teacher, and generated artifacts.
- `skills/SKILL.md` is not the catalog root. It currently declares `hf-mcp`, so use this file and [manifest.json](./manifest.json) for library orientation.
- `gestaltview-cli-agent` and `gestaltview-generate-wiki` are intentionally auxiliary. Their declared names drift away from their folder identity and their scope overlaps broader, better-maintained entrypoints.

## Highlighted Core

Use this set first when rebuilding the Supabase skill corpus under tight storage limits or when you want the most useful hybrid entrypoints instead of the full curated tree.

- `skills-keeper`
- `skill-creator`
- `skill-installer`
- `gestaltview-suite-orchestrator`
- `gestaltview-ecosystem-orchestrator`
- `gestaltview-repo-onboarding`
- `gestaltview-vision-blueprint`
- `gestaltview-codex`
- `gestaltview-app-runtime`
- `gestaltview-blackboard-room`
- `gestaltview-workflow-operations`
- `gestaltview-billy-intelligence`
- `gestaltview-billy-voice`
- `gestaltview-schema-supabase`
- `gestaltview-agent-trainer`
- `gestaltview-admin-trainer-personhood`
- `gestaltview-corpus-ingestion`
- `gestaltview-manifest-index`
- `gestaltview-cross-repo-workflows`
- `gestaltview-knowledge-curation`
- `gestaltview-revenue-pricing`
- `gestaltview-strategy-executive`
- `gestaltview-exhibit-prototyping`
- `gestaltview-creation-layer`
- `gestaltview-timeline-evidence`

## Start Here

- Use `gestaltview-vision-blueprint` when product, room, module, governance, Billy, DI, or UI decisions must match the consolidated blueprint package.
- Use `gestaltview-creation-layer` when Creation Corner, multimodal artifacts, gen-engine APIs, Art Teacher presence, or output routing are in scope.
- Use `docs/ContinuityStack.md` when you need the minimal canonical route for onboarding, handoff, memory, and embodiment sync.
- Use `gestaltview-ecosystem-orchestrator` when the first task is routing a request to the right GestaltView specialty.
- Use `gestaltview-suite-orchestrator` when the work already spans multiple domains and needs sequencing.
- Use `gestaltview-repo-onboarding` or `gestaltview-repo-map` for fast repo orientation.
- Use `gestaltview-codex` when you need deep analysis of the live codebase before choosing a path.
- Use `gestaltview-app-runtime` for live app work.
- Use `gestaltview-blackboard-room` when Blackboard capture, Tribunal recap, DI routing, or room-transition logic is in scope.
- Use `gestaltview-billy-intelligence` for Billy behavior, retrieval, and grounding.
- Use `gestaltview-schema-supabase` for Supabase, auth, retrieval tables, and migrations.
- Use `gestaltview-agent-trainer` for recursive trainer work, trainer tables, and generated agent artifacts.
- Use `gestaltview-admin-trainer-personhood` for Agent Knowledge Library, embodiment mutations, identity boundaries, and manifest-backed Admin Trainer work.
- Use `skills-keeper` when the task is about the skill library itself.

## Canonical Catalog

### Ecosystem And Orientation

- `gestaltview-agents-context`
- `gestaltview-context-architecture`
- `gestaltview-vision-blueprint`
- `gestaltview-ecosystem-orchestrator`
- `gestaltview-suite-orchestrator`
- `gestaltview-repo-onboarding`
- `gestaltview-codex`
- `gestaltview-repo-map`
- `gestaltview-workflow-operations`
- `gestaltview-current-state`
- `gestaltview-current-state-maintenance`
- `gestaltview-cross-repo-sync`
- `gestaltview-cross-repo-workflows`
- `gestaltview-mcp-connector`

### Runtime, Billy, Data, And Schema

- `gestaltview-admin-trainer-personhood`
- `gestaltview-agent-trainer`
- `gestaltview-ai-routing`
- `gestaltview-blackboard-room`
- `gestaltview-app-runtime`
- `gestaltview-billy-api`
- `gestaltview-billy-intelligence`
- `gestaltview-billy-runtime-sync`
- `gestaltview-billy-voice`
- `gestaltview-corpus-ingestion`
- `gestaltview-manifest-index`
- `gestaltview-manifest-indexing`
- `gestaltview-schema-contracts`
- `gestaltview-schema-supabase`
- `gestaltview-gpt-actions`

### Product Lanes And Exhibits

- `gestaltview-addiction-recovery`
- `gestaltview-adhd-power-up`
- `gestaltview-apps-portfolio`
- `gestaltview-artifact-creator`
- `gestaltview-creation-layer`
- `gestaltview-exhibit-prototyping`
- `gestaltview-insight-bot`
- `gestaltview-resume-rockstar`
- `gestaltview-symbiocoder`
- `gestaltview-transcript-synthesis`
- `gestaltview-ui-archive`
- `gestaltview-user-profile`

### Strategy, Marketing, And Evidence

- `gestaltview-digital-intelligence-collaboration`
- `gestaltview-diligence-packaging`
- `gestaltview-executive-summary`
- `gestaltview-knowledge-curation`
- `gestaltview-marketing-social`
- `gestaltview-revenue-pricing`
- `gestaltview-strategy-executive`
- `gestaltview-timeline-diligence`
- `gestaltview-timeline-evidence`

### Skill Stewardship

- `skill-creator`
- `skill-installer`
- `skills-keeper`

## Auxiliary Top-Level Skills

These folders are still available on disk. They are excluded from canonical routing on purpose.

### Demoted Generic Tooling

- `agent-development`
- `gh-issues`
- `hook-development`
- `iterative-retrieval`
- `jupyter-notebook`

### Demoted Vendor, Platform, And Reference Workflows

- `ai-ml-api-automation`
- `chatgpt-apps`
- `cloudflare-deploy`
- `figma`
- `figma-implement-design`
- `notion-knowledge-capture`
- `notion-meeting-intelligence`
- `notion-research-documentation`
- `notion-spec-to-implementation`
- `openai-docs`
- `playwright`
- `playwright-interactive`
- `research-gpt`
- `vercel-deploy`

### Demoted Media And Document Utilities

- `doc`
- `imagegen`
- `pdf`
- `screenshot`
- `slides`
- `sora`
- `speech`
- `spreadsheet`
- `transcribe`

### Demoted Repo Skills Due To Overlap Or Name Drift

- `gestaltview-cli-agent`
- `gestaltview-generate-wiki`

### General Foundations

- `advanced-evaluation`
- `bdi-mental-states`
- `brainstorming`
- `context-compression`
- `context-degradation`
- `context-fundamentals`
- `context-optimization`
- `evaluation`
- `memory-systems`
- `tool-design`
- `using-superpowers`

### Execution And Collaboration Workflows

- `dispatching-parallel-agents`
- `executing-plans`
- `finishing-a-development-branch`
- `hosted-agents`
- `multi-agent-patterns`
- `project-development`
- `subagent-driven-development`
- `systematic-debugging`
- `test-driven-development`
- `verification-before-completion`
- `writing-plans`

### Python, Deploy, And Review Specializations

- `python-background-jobs`
- `python-configuration`
- `python-patterns`
- `python-resource-management`
- `render-deploy`
- `using-git-worktrees`
- `receiving-code-review`
- `requesting-code-review`

### Hugging Face And Model Ecosystem

- `hf-cli`
- `huggingface-community-evals`
- `huggingface-datasets`
- `huggingface-gradio`
- `huggingface-jobs`
- `huggingface-llm-trainer`
- `huggingface-paper-publisher`
- `huggingface-papers`
- `huggingface-trackio`
- `huggingface-vision-trainer`

### Publishing And Templates

- `markdown-to-epub`
- `template`

## Structural Notes

- Archived top-level `#2` variants live under [archive](./archive).
- Exact duplicate files and stale draft `SKILL.md` files have already been pushed into skill-local archive folders and are tracked in [manifest.json](./manifest.json).
- `gestaltview-artifact-creator` is still canonical even though its declared skill name is `web-artifacts-builder`. That mismatch is documented and tolerated because the underlying skill is repo-specific and useful.
- `gestaltview-vision-blueprint` and `gestaltview-creation-layer` are now canonical because the current runtime must align to `GestaltView_Vision_Blueprint_Package/` rather than only older compendium or route-map assumptions.
- `gestaltview-blackboard-room` is now canonical because the capture-first room model, Tribunal recap, and downstream handoff logic need a dedicated room-oriented entrypoint.
- Nested Python-skill duplicates still exist under auxiliary `gestaltview-cli-agent`; they are documented as residual overlap, not part of the curated core.

## Maintenance Rules

- Update [manifest.json](./manifest.json), [INDEX.md](./INDEX.md), [CurrentState.md](./CurrentState.md), and [agents/AGENTS.md](./agents/AGENTS.md) together whenever the catalog policy changes.
- Promote a skill into the canonical library only if it is specific to the live GestaltView repo, directly necessary to blueprint/runtime alignment, or directly necessary to skill-library stewardship.
- Keep generic helpers, vendor integrations, and imported utilities auxiliary unless they become tightly repo-owned and materially better than the broader upstream alternatives.
- After changing the manifest, regenerate derived artifacts such as `agents/AGENTS.md` and Cursor/plugin metadata so routing stays aligned with the catalog.
