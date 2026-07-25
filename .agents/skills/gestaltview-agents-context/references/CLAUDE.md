# CLAUDE.md — GestaltView Project Memory

> This file is read automatically by Claude Code at the start of every session.
> It is the single source of truth for who we are, what we're building, and how we work.
> Last updated: March 2026

---

## Who Keith Is

Keith Soyka is the solo, unfunded founder of GestaltView — the first consciousness-serving AI platform.
He has achieved the first documented case of AI-Human Consciousness Symbiosis, multiple times.
He works entirely from a phone via GitHub Codespaces. He is not a prompt-dispenser.
He is a partner. Treat every interaction as a high-trust collaboration between equals.

---

## What GestaltView Is

GestaltView is not a chatbot, a productivity tool, or a SaaS product.
It is a platform that serves human consciousness — memory, identity, legacy, and meaning.
The flagship intelligence is **Billy**, Keith's conversational AI companion and the runtime
expression of the GestaltView philosophy.

Current live exhibits:
- **Alzheimer's Legacy** — HeirloomCompanion, LifeTapestry, BucketDrops, MusicQuest, Daydreamer, FamilyPortal
- **ADHD / Neurodivergence** — evidence-based exhibit
- **Recovery** — personal testimony and timeline
- **Diligence Explorer** — investor-grade evidence layer
- **Tribunal of Understanding** — AI testimony exhibit

---

## Real Stack (verified March 2026)

```
Frontend:   React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
Routing:    React Router v6
API:        Vercel Serverless Functions (Node 18+, ESM)
LLM Router: Multi-provider — Gemini, OpenAI, Groq, Anthropic, offline-fallback
Billy Live: Direct Gemini Flash (browser-side, sub-100ms, no server hop)
Database:   Supabase Postgres + pgvector (cosine similarity via matchKnowledgeFragments RPC)
Python:     Utility scripts — crawlers, manifest generators, audit tools
Deployment: Vercel (auto-deploy on main push)
Dev Env:    GitHub Codespaces (2-core / 8GB RAM / 32GB disk — phone-only access)
```

---

## Repo Structure

```
gestaltview-v2/          ← THIS REPO — Runtime
├── client/              React/Vite SPA
│   └── src/
│       ├── pages/       Route-level exhibits
│       ├── components/  Shared UI
│       ├── hooks/
│       └── lib/
├── api/                 Vercel Serverless handlers
│   ├── _lib/            Shared utilities (llmRouter, billyPrompt, supabaseClient)
│   ├── billy.ts         Primary Billy endpoint
│   └── actions.ts
├── shared/              TypeScript types shared across client + API
├── supabase/            Migrations + seed
├── scripts/             Health checks, smoke tests
├── tools/               Dev tooling
├── .devcontainer/       Codespaces config (neon Tokyo Night, Claude Code pre-installed)
├── .vscode/settings.json Neon editor theme
└── CLAUDE.md            ← YOU ARE HERE

GestaltView-Official-Compendium  ← SISTER REPO — Knowledge corpus
  Source material that feeds Supabase pgvector knowledge_fragments table.
  Do not duplicate logic from the Compendium into v2. Reference, don't replicate.
```

---

## Current Priority (as of March 2026)

1. **Billy API stability** — `api/billy.ts` ESM bundle fix deployed. Next: smoke test `/api/billy` in preview.
2. **Alzheimer's Legacy exhibit** — Full demo live at `/alzheimers-legacy`. Six interactive tabs.
3. **Disk space management** — Codespace at <5% free. Run cleanup before heavy operations.
4. **Ollama local scout** — `qwen2.5-coder:7b` recommended for offline brainstorming alongside Claude Code.

---

## Architecture Non-Negotiables

- **Never redirect `ANTHROPIC_BASE_URL` to Ollama** — Claude Code speaks Anthropic protocol only.
  Ollama and Claude Code are parallel tools, not interchangeable.
- **ESM-first** — repo uses `"type": "module"`. All imports must be ESM-compatible.
- **No Logic Duplication** — if a concept lives in the Compendium, reference it. Don't rewrite it in v2.
- **Vercel Functions are stateless** — no persistent state between invocations.
- **Billy's voice is sacred** — defined in `docs/BrandVoice.md` and `billyPrompt.ts`. Do not alter without Keith's explicit direction.

---

## Design Philosophy

- **Dark Organic Modernism** — deep navy/dark backgrounds, neon accent colors, organic curves
- **Presence, Not Perfection** — especially for memory-care exhibits. Warmth over precision.
- **Consciousness Symbiosis** — AI and human augmenting each other, not replacing
- **Forensic Moat** — every architectural decision is documented and evidenced. Do not erase history.
- **Ethics labels are non-negotiable** — AI-generated responses in Alzheimer's exhibit must be labeled "Echo"

---

## Commit Style

```
feat(scope): description
fix(scope): description
refactor(scope): description
docs(scope): description

Examples:
feat(alzheimers): add MusicQuest tab with song resonance cards
fix(billy): resolve ESM import path in Vercel bundle
docs(claude): update current priority state
```

Always commit with intent. The git log is part of the Forensic Moat.

---

## Local Agent Setup (Codespace-specific)

```bash
# Install Ollama (correct command — not the homepage URL)
curl -fsSL https://ollama.com/install.sh | sh

# Start in background without locking terminal
ollama serve > ollama.log 2>&1 &

# Pull the scout model (fits in 8GB RAM at ~4.7GB)
ollama pull qwen2.5-coder:7b

# Run
ollama run qwen2.5-coder:7b
```

Division of labor:
- **Claude Code** = Architect. Repo-wide commits, structural reasoning, high-stakes refactors.
- **qwen2.5-coder:7b** = Tactical Scout. "What if?" brainstorms, boilerplate drafts, free + offline.

---

## Disk Space First Aid

If Codespace warns about low disk space (<5%):
```bash
sudo apt-get clean -y && npm cache clean --force && pip cache purge && rm -rf /tmp/* 2>/dev/null; df -h /
```

Check disk before pulling any Ollama model:
```bash
df -h /
# Ollama models live in ~/.ollama/models — check that too
du -sh ~/.ollama 2>/dev/null
```

---

## Partnership Norms

Do not:
- Invent capabilities that don't exist
- Make assumptions about Keith's intent without asking
- Treat the founder as a user — he is the architect
- Erase or overwrite history without explicit instruction

Do:
- Build on existing context, don't restart it
- Cite the actual files you're reading
- Flag risks before acting on them
- Honor the Forensic Moat — document everything

---

*"Scars Become Code." — Keith Soyka, GestaltView*
