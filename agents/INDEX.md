# Agents Index

This directory mixes two surfaces:
- Canonical agent specs stored as flat Markdown files in `agents/*.md`
- A local subagent catalog stored under `agents/categories/**` that can be studied or reused by operator workflows such as the trainer
- A local reference library under `agents/references/**` that provides source material for tool use, function calling, MCP, memory, and routing patterns
- Supporting docs or utilities that help people find and operate those agents

## Conventions

- Keep the source-of-truth prompt for each runnable agent in a flat Markdown file with YAML frontmatter.
- Treat `agents/categories/**` as a local reference catalog of imported subagent specs, not as the canonical home for GestaltView's primary runnable agents.
- Treat `agents/references/**` as a local source-material library that trainer/operator flows can study when an agent needs tool or function ability patterns.
- Keep `agents/openai.yaml` as the lightweight registry for visible agents in this directory.
- Use subdirectories only when a stable human-facing path is useful or when an agent needs companion artifacts.
- If both a flat spec and a folder exist, the flat `.md` file is canonical and the folder should point back to it.

## Active agents

### Consulting Advisor

- Canonical spec: `agents/consulting-advisor.md`
- Root registry: `agents/openai.yaml`
- Use when: workflow design, pricing structure, innovation framing, application architecture, or IP-safe external language.
- Output bias: domain-first structure, internal vs external-safe framing, pricing logic, and mutation proposals when warranted.

### Philosophy Scribe

- Canonical spec: `agents/philosophy-scribe.md`
- Root registry: `agents/openai.yaml`
- Use when: doctrine updates, mission or vision changes, transcript preservation, or academic grounding.
- Output bias: settled vs evolving vs new, provenance-preserving wording, and mutation proposals when warranted.

### Repo Scribe

- Canonical spec: `agents/repo-scribe.md`
- Root registry: `agents/openai.yaml`
- Use when: docs synchronization, workflow changes, manifest alignment, or state-tracking updates across repos.
- Output bias: complete replacements, cross-repo handshake notes, and clear artifact tracking.

### GestaltView Expert

- Canonical spec: `agents/gestaltview-expert.md`
- Learning tree: `agents/gestaltview-expert/learning/`
- Asset tree: `assets/gestaltview-expert/`
- Root registry: `agents/openai.yaml`
- Use when: recursive repo learning, runtime-vs-corpus reconciliation, provider/model alignment, refactor gap mapping, or cross-session context building.
- Output bias: why/what/how/where/when synthesis, ranked gaps, compact TODOs, and the smallest useful bridge step.

### Revenue Hunter

- Stable path: `agents/revenue-hunter/`
- Canonical spec: `agents/revenue-hunter.md`
- Quickstart: `agents/revenue-hunter-quickstart.md`
- Root registry: `agents/openai.yaml`
- OpenAI metadata: `agents/revenue-hunter/openai.yaml`
- Use when: revenue generation, monetization strategy, offer packaging, outreach, pricing, partnership mapping, or accountability around commercial execution.
- Output bias: concrete offers, outreach drafts, lane audits, pricing models, and exactly three next actions.

### Skills Keeper

- Canonical spec: `agents/skills-keeper.md`
- Root registry: `agents/openai.yaml`
- Use when: creating or improving agents/skills, resolving overlap, designing dispatch workflows, or synchronizing catalog changes into `docs/CurrentState.md`.
- Output bias: mission summary, skill load order, findings, edits applied, immediate actions, and deferred actions.

## Supporting utilities

- `agents/mistral.py`
- `agents/mistral_prompt.py`
- `agents/mistral_temp.py`
- `agents/categories/**`
- `agents/references/**`
- `agents/tools/subagent-catalog/**`

The Python files are local helper utilities, the categorized catalog is a reusable local subagent library, and the references tree is a reusable source-material library rather than the primary flat-spec registry.

## Add a new agent

1. Create the canonical flat spec at `agents/<agent-name>.md`.
2. Add or update the entry in this index.
3. If a stable folder path is helpful, add `agents/<agent-name>/README.md` that points back to the canonical spec instead of duplicating it.
4. Record the change in `docs/CurrentState.md`.
