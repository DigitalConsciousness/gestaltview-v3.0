# GestaltView Agent Trainer — Package Spec v1.0
# Codex Execution Document
# Author: Keith Soyka / GestaltView
# Target folder: /gv_operator_kit/ (new folder in gestaltview-v2.0 root)
# Status: READY FOR CODEX BUILD
# Last updated: 2026-04-01

---

## OVERVIEW

The GestaltView Agent Trainer is a self-contained, white-label AI operations package
that buyers install into their own Supabase + Vercel environment. It ships as:

  1. A zipped folder (`gestaltview-agent-trainer-v1.0.zip`) containing all source files
  2. A standalone Playbook PDF (doubles as a consulting services brochure)
  3. A Supabase seed SQL file for instant DB bootstrap
  4. A configuration wizard (HTML single-page app) for first-time setup

The package DOES NOT include:
  - GestaltView's internal PLK logic or constitutional invariant code
  - Billy's RRF context assembly algorithm
  - The Tribunal governance layer
  - Any founder-specific operational fields
  - Any hardcoded GestaltView knowledge fragments

The package DOES include:
  - A fully functional AI assistant interface (powered by buyer's own API keys)
  - A knowledge fragment uploader and manager
  - A PLK vocabulary builder (simplified, guided wizard — no raw logic exposed)
  - A skills taxonomy manager
  - Preloadable starter packs for skills, tools, and agent-source bundles
  - A session memory viewer
  - A persistent memory model with user, shared, and pinned continuity concepts
  - A CLI layer for technical operators
  - Cross-platform setup paths for shell, Windows, Docker, and browser-first usage
  - A usage analytics dashboard
  - The Operator Playbook (adapted from internal PlaybookOperatorsManual)
  - A consulting services insert promoting GestaltView customization services

---

## FOLDER STRUCTURE TO CREATE

```
/gv_operator_kit/
├── README.md                          ← Package overview + quick start
├── SPEC.md                            ← This file (Codex instruction document)
├── PLAYBOOK.md                        ← Operator Playbook (client-facing)
├── CONSULTING.md                      ← Consulting services insert
├── LICENSE.md                         ← Commercial license terms
├── CHANGELOG.md                       ← Version history
│
├── setup/
│   ├── setup-wizard.html              ← Browser-based first-time config UI
│   ├── env.example                    ← All required environment variables
│   ├── env.schema.json                ← JSON schema for env validation
│   └── verify-setup.ts                ← CLI script to verify env + Supabase connection
│
├── Dockerfile                         ← Containerized execution path
├── compose.yaml                       ← Simple Docker orchestration
├── .dockerignore                      ← Container build exclusions
│
├── supabase/
│   ├── seed.sql                       ← Full DB bootstrap (all tables)
│   ├── migrations/
│   │   ├── 001_create_kit_users.sql
│   │   ├── 002_create_knowledge_base.sql
│   │   ├── 003_create_skills_registry.sql
│   │   ├── 004_create_session_memory.sql
│   │   ├── 005_create_usage_analytics.sql
│   │   └── 006_create_plk_profiles.sql
│   ├── rls-policies.sql               ← Row Level Security policies
│   └── functions/
│       ├── match_knowledge.sql        ← Vector similarity search RPC
│       └── search_knowledge.sql       ← Keyword search RPC
│
├── api/
│   ├── assistant.ts                   ← Main AI assistant endpoint
│   ├── knowledge.ts                   ← CRUD for knowledge fragments
│   ├── skills.ts                      ← CRUD for skills registry
│   ├── memory.ts                      ← Session memory read/write
│   ├── analytics.ts                   ← Usage event logging
│   ├── plk.ts                         ← PLK profile read/write
│   └── _lib/
│       ├── supabaseClient.ts          ← Supabase client factory
│       ├── llmRouter.ts               ← Simplified provider router (Groq → OpenAI → Gemini)
│       ├── contextAssembler.ts        ← Context builder (simplified top-K)
│       └── rateLimiter.ts             ← Basic request rate limiting
│
├── components/
│   ├── AssistantChat.tsx              ← Chat interface component
│   ├── KnowledgeUploader.tsx          ← Drag-drop knowledge fragment uploader
│   ├── SkillsManager.tsx              ← Skills taxonomy UI
│   ├── PLKWizard.tsx                  ← 5-step vocabulary builder wizard
│   ├── MemoryViewer.tsx               ← Session memory browser
│   ├── AnalyticsDashboard.tsx         ← Usage charts + query stats
│   ├── TierGate.tsx                   ← Feature gating by tier
│   └── OnboardingFlow.tsx             ← First-run onboarding (5 screens)
│
├── pages/
│   ├── index.tsx                      ← Landing / dashboard home
│   ├── assistant.tsx                  ← AI assistant main view
│   ├── knowledge.tsx                  ← Knowledge base manager
│   ├── skills.tsx                     ← Skills registry
│   ├── memory.tsx                     ← Memory browser
│   ├── analytics.tsx                  ← Analytics panel
│   ├── settings.tsx                   ← Config + API key management
│   └── onboarding.tsx                 ← First-run wizard
│
├── config/
│   ├── tiers.ts                       ← Tier definitions (Solo/Studio/Growth/Enterprise)
│   ├── features.ts                    ← Feature flags per tier
│   ├── prompts.ts                     ← Default system prompt templates
│   ├── domains.ts                     ← Supported domain/exhibit presets
│   ├── trainerBlueprint.ts            ← Product-shell trainer copy and mock state
│   └── operatorPacks.ts               ← Preloadable pack catalog
│
├── docs/
│   ├── SETUP_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   ├── SUPABASE_GUIDE.md
│   ├── CLI_GUIDE.md
│   ├── PLATFORM_GUIDE.md
│   ├── CUSTOMIZATION_GUIDE.md
│   ├── PRICING_TIERS.md
│   └── FAQ.md
│
├── scripts/
│   ├── bootstrap.sh                   ← One-command setup
│   ├── bootstrap.ps1                  ← Windows bootstrap
│   ├── package-kit.sh                 ← Creates distributable zip
│   ├── package-kit.ps1                ← Windows zip packaging
│   ├── operator-cli.ts                ← Terminal-friendly operator CLI scaffold
│   ├── serve-setup-wizard.ts          ← Cross-platform local wizard server
│   ├── validate-env.ts
│   └── seed-demo-data.ts
│
└── tests/
    ├── api/
    │   ├── assistant.test.ts
    │   ├── knowledge.test.ts
    │   └── memory.test.ts
    └── setup/
        └── verify-setup.test.ts
```

---

## IP PROTECTION BOUNDARY

### EXCLUDED — stays in core repo only (NEVER copy to this package)

```
shared/billy/runtime.ts          ← Constitutional invariant engine
shared/llm/plk.ts                ← PLK integrity protocol internals
shared/tribunal/**               ← Tribunal governance layer
api/billy.ts (core handler)      ← RRF + 4-stream parallel retrieval
api/_lib/llmRouter.ts (full)     ← Full cascading 6-provider router
.billy_personality.md            ← Billy's internal personality definition
Any knowledge_fragments content  ← Keith's curated knowledge base
Any skill_fragments content      ← Internal skills corpus
```

### INCLUDED — safe to distribute

```
Simplified LLM router (3-provider max, no cascade complexity)
PLK wizard UI (collects vocabulary → stores in Supabase; no processing logic)
Context assembler (simple top-K retrieval, no RRF algorithm)
All Supabase schema (tables/RLS/RPCs — these are generic)
All UI components (chat, uploader, analytics — these are interfaces)
Starter-pack and agent-source bundle scaffolding
CLI scaffolding for technical operators
Docker and cross-platform bootstrap scaffolding
The Operator Playbook concept (client-friendly adaptation)
```

---

## SUPABASE TABLES

| Table | Purpose | Key columns |
|---|---|---|
| `kit_users` | Buyer's end-users | id, email, tier, plk_profile_id |
| `knowledge_fragments` | Uploaded knowledge chunks | id, content, embedding(768), metadata, user_id |
| `skill_fragments` | Skills registry | id, name, description, domain, active |
| `memory_entries` | Session memory | id, user_id, key, value, session_id |
| `usage_events` | Analytics log | id, user_id, event_type, metadata |
| `plk_profiles` | Vocabulary profiles | id, user_id, vocabulary, tone, constraints |
| `tiers` | Tier config | id, name, features, price_monthly, price_annual |

**Requirements for all tables:**
- UUID primary keys
- Row Level Security enabled
- `created_at` / `updated_at` timestamps
- Soft delete (`deleted_at` nullable)

**Memory model guidance:**
- support user memory and shared collaboration memory as distinct concepts
- support pinned continuity for durable facts that must survive wording drift
- keep secrets and unsafe material out of persistent memory

**Vector extension:** pgvector required  
**Embedding dimension:** 768 (Gemini `text-embedding-004`) OR 1536 (OpenAI `text-embedding-3-small`)  
**Match function:** `match_knowledge(query_embedding vector, match_threshold float, match_count int)`

---

## API ENDPOINTS

```
POST /api/assistant          ← Main AI chat (context + memory + skills)
GET  /api/knowledge          ← List fragments (paginated)
POST /api/knowledge          ← Create fragment + generate embedding
PUT  /api/knowledge/:id      ← Update fragment
DELETE /api/knowledge/:id    ← Soft delete
POST /api/knowledge/search   ← Semantic + keyword search
GET  /api/skills             ← List skills
POST /api/skills             ← Create skill
PUT  /api/skills/:id         ← Update skill
DELETE /api/skills/:id       ← Soft delete
GET  /api/memory             ← Get session memory for user
POST /api/memory             ← Write memory entry
DELETE /api/memory/:id       ← Delete memory entry
POST /api/analytics/event    ← Log usage event
GET  /api/analytics/summary  ← Usage summary for dashboard
GET  /api/plk/:user_id       ← Get PLK profile
POST /api/plk                ← Create/update PLK profile
```

Future package-friendly extensions:

```
GET  /api/packs             ← List preloadable starter packs
POST /api/packs/apply       ← Apply a selected pack
GET  /api/memory/shared     ← Read shared collaboration memory
```

## PLATFORM SUPPORT POSTURE

- Linux and macOS: first-class shell workflow
- Windows: first-class PowerShell workflow
- Docker: first-class controlled execution path
- iOS/iPadOS: browser-first and remote-first workflow, not local container hosting

This package should be explicit about what each platform can and cannot realistically do.

---

## TIER SYSTEM

| Tier | Seats | Knowledge | Memory | Queries/mo | Price |
|---|---|---|---|---|---|
| **SOLO_SPARK** | 1 | 100 fragments | 50 entries | 500 | $49 one-time |
| **STUDIO** | 5 | 1,000 fragments | 500 entries | 5,000 | $149/mo or $999/yr |
| **GROWTH** | 25 | 10,000 fragments | 5,000 entries | 50,000 | $449/mo or $3,499/yr |
| **ENTERPRISE** | unlimited | unlimited | unlimited | unlimited | custom |

**Bootstrap discount:** Verified solo/bootstrapped founders (<$250k ARR, no VC) get 20% off STUDIO forever.  
**Founding member pricing:** First 50 buyers of any tier lock in 40% lifetime discount.

---

## ENVIRONMENT VARIABLES (env.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM Providers (at least one required)
GROQ_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=

# Embedding (required for knowledge search)
EMBEDDING_PROVIDER=gemini          # gemini | openai
EMBEDDING_MODEL=text-embedding-004  # or text-embedding-3-small

# Kit Configuration
KIT_NAME=My AI Assistant            # Displayed in UI (white-label)
KIT_DOMAIN=general                  # resume | adhd | creative | general | custom
KIT_TIER=STUDIO                     # SOLO_SPARK | STUDIO | GROWTH | ENTERPRISE
KIT_PRIMARY_COLOR=#01696f           # Hex color for UI theming

# Optional: Stripe (if reselling to end-users)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## PLAYBOOK CHAPTER OUTLINE

1. **Welcome to Your Agent Trainer** — What it does, the philosophy
2. **Setting Up Your Environment** — Supabase, env vars, setup wizard
3. **Building Your Knowledge Base** — What to upload, fragment best practices
4. **Configuring Your AI's Vocabulary** — PLK wizard walkthrough
5. **Managing Skills** — Pre-loaded templates, custom skills
6. **Understanding Memory** — How session memory works, privacy
7. **Reading Your Analytics** — Key metrics, query trends, skill usage
8. **Using Starter Packs and the CLI** — pack selection, source bundles, terminal workflow
9. **Platform Paths** — shell, Windows, Docker, browser-first setup
10. **Customizing for Your Domain** — Branding, presets, prompt templates
- **Appendix A:** Troubleshooting
- **Appendix B:** API Reference Quick Card
- **Appendix C:** GestaltView Consulting Services ← promotional insert
- **Appendix D:** Upgrade Path

---

## CONSULTING SERVICES INSERT (CONSULTING.md)

Included in every kit tier. Positions Keith/GestaltView as the expert
who takes the kit further. Services:

| Service | Price | Deliverable |
|---|---|---|
| Custom Exhibit Buildout | $2,500 flat | Domain exhibit + PLK taxonomy + knowledge curation |
| Knowledge Base Curation | $150/hr (3hr min) | Fragment audit, gap analysis, optimization |
| PLK Deep Dive | $750 flat | 90-min session + full vocabulary profile + 30-day refinement |
| Full Platform Deployment | $5,000 flat | End-to-end setup + team onboarding + 90-day support |
| Enterprise Partnership | Custom | White-label + dedicated instance + retainer |

---

## CODEX BUILD PHASES

```
PHASE 1 — Scaffold         Create all folders + placeholder files + env.example
PHASE 2 — Database         6 migration SQLs + RLS + vector RPCs + seed.sql
PHASE 3 — API Layer        supabaseClient + llmRouter + contextAssembler + all endpoints
PHASE 4 — Components       AssistantChat + KnowledgeUploader + PLKWizard + all UI
PHASE 5 — Pages            All page files + routing
PHASE 6 — Config+Scripts   tiers.ts + features.ts + bootstrap.sh + package-kit.sh
PHASE 7 — Documentation    PLAYBOOK.md + CONSULTING.md + SETUP_GUIDE.md + README.md
PHASE 8 — Tests            API tests + verify-setup + zip integrity check
```

---

## QUALITY GATES (check before marking any phase complete)

- [ ] No imports from parent repo (`../../api/billy`, `../../shared/billy/*`, etc.)
- [ ] All env vars read from `process.env` — no hardcoded values
- [ ] Supabase service role key: server-side only
- [ ] Supabase anon key: client-side only
- [ ] No GestaltView internal terminology in client-facing strings:
  - "Billy" → use `KIT_NAME` env var or "Your AI Assistant"
  - "PLK" → use "Vocabulary Profile"
  - "Tribunal" → not included
  - "Never Look Away" → not included
  - "constitutional invariant" → not included
- [ ] TypeScript strict mode: no `any` types
- [ ] All API routes return `{ data, error }` shape
- [ ] All components accept `tier` prop for feature gating
- [ ] README tested: new developer can set up in < 30 minutes
- [ ] `package-kit.sh` produces a valid, self-contained zip

---

## PACKAGING NOTES

`bootstrap.sh` is the one command buyers run:
```bash
curl -fsSL https://gestaltview.com/kit/bootstrap.sh | bash
```
This installs dependencies, runs `verify-setup.ts`, and opens `setup-wizard.html`.

`KIT_NAME` is the white-label control. Buyer sets:
```
KIT_NAME="ResumeRockstar AI"
```
And it appears throughout the UI without code changes.

`KIT_DOMAIN` presets configure system prompts and demo data:
- `resume` — career coaching, job search, resume optimization
- `adhd` — focus tools, task scaffolding, cognitive support
- `creative` — creative projects, artistic identity, brainstorming
- `general` — multipurpose, no domain bias
- `custom` — buyer writes their own system prompt in settings

The `CONSULTING.md` works as:
- A setup manual appendix for self-serve buyers
- A standalone PDF for sales conversations
- A leave-behind for enterprise pitches
- A credibility document showing depth of thought

---

*This spec is the source of truth for the gv_operator_kit build.*
*All implementation decisions not covered here should default to*
*matching the patterns established in the core gestaltview-v2.0 codebase.*
