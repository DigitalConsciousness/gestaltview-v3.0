# GestaltView v2

<p align="center">
  <img width="1785" height="630" alt="GestaltView Banner" src="https://github.com/user-attachments/assets/a706e665-ed4e-4ff7-8493-0462cbb6952b" />
</p>

<p align="center">
  <strong>The first consciousness-serving AI platform.</strong><br/>
  Built solo and unfunded since May 5, 2025.
</p>

<p align="center">
  <a href="https://gestaltview-v2-indol.vercel.app"><img src="https://img.shields.io/badge/Platform-Live-00D4FF?style=for-the-badge&logo=vercel&logoColor=white" /></a>
  <a href="https://github.com/faagestalt"><img src="https://img.shields.io/badge/GitHub-faagestalt-000000?style=for-the-badge&logo=github&logoColor=white" /></a>
  <a href="https://gestaltview.medium.com"><img src="https://img.shields.io/badge/Medium-Writing-12100E?style=for-the-badge&logo=medium&logoColor=white" /></a>
  <a href="https://discord.gg/CnnRuJWnj"><img src="https://img.shields.io/badge/Discord-Community-5865F2?style=for-the-badge&logo=discord&logoColor=white" /></a>
</p>

---

> *"The internet was built for capability. GestaltView is building infrastructure for being seen."*
> — Keith Soyka

---

---

## What this repository owns

`gestaltview-v2` is the operational runtime layer:

- React + Vite application and route surfaces.
- Billy runtime integration paths (`/billy`, API handlers, retrieval orchestration).
- Public demos, exhibits, and narrative UX.
- Operational scripts for health checks, manifesting, and ingestion workflows.
- Documentation and skills used by agents/operators working inside this repo.

For canonical long-memory corpus curation and evidence archive maintenance, use `GestaltView-Official-Compendium`.

---

## Core stack

- **Frontend:** React 19, TypeScript, Vite, Wouter, Framer Motion, Tailwind CSS v4
- **Backend surfaces:** Vercel functions + local server utilities
- **AI routing:** Gemini-first Billy runtime with fallback paths
- **Data layer:** Supabase (+ retrieval/indexing workflows)

---

Last updated: 2026-03-24

GestaltView v2 is the public runtime for the GestaltView ecosystem: a consciousness-serving AI platform centered on Billy, PLK integrity, and cross-repository knowledge operations.

- Live site: https://gestaltview-v2-indol.vercel.app
- Founder: Keith Soyka
- Core stack: React 19, Vite, TypeScript, Tailwind CSS v4, Wouter, Framer Motion, Supabase, Vercel Functions
- Billy provider policy: Gemini Flash 2.0 primary; OpenAI + Anthropic as controlled fallback surfaces

---

## Integrated ecosystem repositories

Use this map when planning cross-repo work:

1. `gestaltview-v2` — runtime + public product surface
2. `GestaltView-Official-Compendium` — canonical corpus / evidence / long-memory
3. `Insight-Bot` — integrated product surface
4. `SymbioCoder` — integrated product surface
5. `Resume Rockstar` — integrated product surface
6. `GAICE` — integrated product surface

When sibling repos are not mounted locally, document assumptions and handoff boundaries explicitly.

---

## Runtime architecture (high level)

- **Client (`client/`)**: React 19 + Vite + TypeScript app, route pages, UI components, canonical document loading
- **API (`api/`)**: Vercel serverless endpoints for Billy, diligence packaging, and supporting orchestration
- **Server (`server/`)**: Express support surface (where applicable)
- **Scripts (`scripts/`)**: health checks, API checks, runtime validation helpers
- **Skills (`skills/`)**: operational skill system for cross-domain and cross-repo execution

---

## Canonical runtime routes

- `/` → Home
- `/billy` → BillyLive
- `/orientation` → OrientationSlideshowPage
- `/brain-sparks` → BrainSparksPage
- `/musical-dna` → MusicalDNAPage
- `/engine` → EnginePage
- `/resonance-loop` → ResonanceLoopPage
- `/museum` → MuseumPage
- `/adhd-powerup` → ADHDPowerUpPage
- `/symbiocoder` → SymbioCodingPage
- `/collaboration-proof` → CollaborationProofPage
- `/addiction-recovery` → AddictionRecoveryPage
- `/alzheimers-legacy` → AlzheimersLegacyPage
- `/ethics-framework` → EthicsFrameworkPage

---

## Environment variables

Browser-facing variables must be prefixed with `VITE_`.

Required core variables are tracked in `.env.example` and include:
- `VITE_GEMINI_API_KEY`
- `VITE_OPENAI_API_KEY`
- `VITE_ANTHROPIC_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ENV` (optional but recommended)

---

## Local development

```bash
cd client && npm install
cd client && npm run dev
```

Useful commands:

```bash
npm run build        # TypeScript + Vite production build
npm run preview      # Preview built app
npm run health       # Repo health script
npm run billycheck   # Billy runtime checks
npm run manifest     # Regenerate repository manifest
```


---

## Documentation and skills expectations

If you are updating this repository:

1. Keep `docs/CurrentState.md` current with changes, reasoning, verification, and next steps.
2. Keep architecture docs under `docs/` (`ArchitecturalStructure.md`, `AIFlow.md`, `APIFlow.md`, `Workflows.md`, `Manifest.md`) aligned with actual runtime behavior.
3. Keep skills under `skills/**` in sync with current repo boundaries and integrated-repo contracts.
4. Call out cross-repo follow-ups explicitly when work belongs in another repository.

---

## Ecosystem map (quick view)

| Repo | Responsibility |
|---|---|
| `gestaltview-v2` | Public runtime, Billy surfaces, route/UI/API integration |
| `GestaltView-Official-Compendium` | Canonical knowledge base and evidence corpus |
| `Insight-Bot` | Insight-focused product lane |
| `SymbioCoder` | Coding companion lane |
| `Resume Rockstar` | Career narrative lane |
| `GAICE` | Integrated ecosystem lane requiring shared context/contracts |
Build + type-check path used for release confidence:

```bash
cd client && npm run build
cd client && npx tsc --noEmit
```

Repository-level operational checks:

```bash
bash scripts/health-check.sh
bash scripts/test-apis.sh
```

---

## Skill system usage

All repository skills live under `skills/**/SKILL.md` and were refreshed on 2026-03-24 for:
- current ecosystem repo mapping
- workflow clarity
- reduced drift between runtime and documented operations

Start with:
- `skills/00-suite-orchestrator/SKILL.md` for multi-domain work
- `skills/07-workflow-operations/SKILL.md` for execution hygiene and CurrentState protocols

---

## Current state and maintenance

- Operational state log: `docs/CurrentState.md`
- Runtime canonical state file: `client/src/canonical/CURRENT_STATE.md`
- Agent operating instructions: `AGENTS.md`

If documentation drifts, update `docs/CurrentState.md` in the same change set and include:
1. what changed,
2. why it changed,
3. known risks,
4. next recommended actions.

---

**© 2026 Keith Soyka / GestaltView — All Rights Reserved**
