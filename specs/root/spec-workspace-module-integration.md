# CODEX SPEC — Workspace/Analysis/Dev Module: Resume Rockstar, Insight Bot & SymbioCoder Integration
## File: `SPEC_workspace_module_integration.md`

---

## Purpose

Integrate three independently-built AI products — **Resume Rockstar v2.1.0**, **Insight Bot v1.5**, and **SymbioCoder v1.0** — as specialised sub-rooms inside GestaltView's `workspace/analysis/dev` module. Each sub-room gets its own page, a dedicated Digital Intelligence, and a documented data flow into the External Scaffold and Dynamic Inner World.

---

## Governing Principles

- Sub-rooms are **Active / Productive** environments. They do not interrupt the Blackboard Room.
- All LLM calls route through GestaltView's existing `llmRouter` (free-first cascade). Sub-room backends may have their own routers, but GestaltView's router is the canonical entry point.
- Identity claims inferred by these tools (skills, traits, coding patterns) are stored as **pending claims** and require explicit user approval before appearing in the Identity Portrait.
- Artefacts published from sub-rooms flow into the External Scaffold, then optionally into the Dynamic Inner World. They never bypass the scaffold.
- Sensitive data (resume content, code, research sessions) stays local-first. No write to cloud storage without user consent.
- Each sub-room introduces a named DI. Billy remains available in a supporting role but is not the primary presence.

---

## Files to Create

| File | Purpose |
|---|---|
| `client/src/pages/ResumeLabPage.tsx` | Resume Rockstar sub-room |
| `client/src/pages/InsightAnalysisPage.tsx` | Insight Bot sub-room |
| `client/src/pages/SymbioCoderPage.tsx` | SymbioCoder sub-room |
| `client/src/components/workspace/CareerCoachDI.tsx` | DI panel for Resume Lab |
| `client/src/components/workspace/ResearcherDI.tsx` | DI panel for Insight Analysis |
| `client/src/components/workspace/DeveloperDI.tsx` | DI panel for SymbioCoder |
| `server/routes/resumeRockstar.ts` | API proxy to Resume Rockstar FastAPI |
| `server/routes/insightBot.ts` | API proxy to Insight Bot Express |
| `server/routes/symbioCoder.ts` | API proxy to SymbioCoder FastAPI |
| `supabase/migrations/YYYYMMDD_workspace_module.sql` | Schema extension for workspace artefacts |

## Files NOT to Touch

- `Scaffold.tsx` (except to register new artefact types if required)
- `DynamicInnerWorldPage.tsx`
- `BlackboardRoomPage.tsx`
- Any existing routing that does not reference the new pages
- Existing embodiment profile files
- `llmRouter` internals

---

## Schema Extension

Add to Supabase via migration:

```sql
-- Resume artefacts
create table if not exists resume_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  content jsonb not null,
  ats_score numeric,
  plk_resonance_score numeric,
  published_to_scaffold boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Insight/analysis sessions
create table if not exists insight_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  platform text check (platform in ('web', 'reddit', 'discord')) default 'web',
  query text,
  result_summary text,
  evidence_nodes jsonb,
  published_to_scaffold boolean default false,
  created_at timestamptz default now()
);

-- Code projects
create table if not exists code_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  language text,
  content text,
  cognitive_state jsonb,
  published_to_scaffold boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pending identity claims from workspace tools
create table if not exists pending_identity_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  source text not null, -- 'resume_rockstar' | 'insight_bot' | 'symbiocoder'
  claim_type text not null, -- 'skill' | 'trait' | 'pattern'
  claim_value text not null,
  evidence_ref uuid, -- FK to relevant artefact
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz default now()
);
```

**RLS:** All tables must have Row Level Security enabled. Users may only read/write their own rows.

---

## Implementation Slices

---

### Slice 1 — Route Registration

Register the three new pages in the GestaltView router:

```tsx
// In router config (exact path TBD based on existing routing pattern)
{ path: "/workspace/resume-lab", element: <ResumeLabPage /> },
{ path: "/workspace/insight-analysis", element: <InsightAnalysisPage /> },
{ path: "/workspace/symbio-coder", element: <SymbioCoderPage /> },
```

Add navigation entries to the workspace/analysis/dev module sidebar or nav panel. Each route is **auth-guarded** using the existing GestaltView auth wrapper.

**Validation:** All three routes resolve without 404. Unauthenticated users are redirected to login.

---

### Slice 2 — Server API Proxies

Create three thin proxy routes in the GestaltView server layer. These forward authenticated requests to the respective microservice backends and handle CORS internally. External origins are never exposed to the client.

**`server/routes/resumeRockstar.ts`** — forwards to Resume Rockstar FastAPI:
```ts
router.post("/api/workspace/resume/enhance", authMiddleware, async (req, res) => {
  const result = await llmRouter.route({
    messages: buildResumePrompt(req.body),
    preferFree: true,
  });
  res.json(result);
});

router.post("/api/workspace/resume/ats-score", authMiddleware, async (req, res) => {
  // Forward to Resume Rockstar ATS Optimizer v2 endpoint
});

router.post("/api/workspace/resume/plk-analysis", authMiddleware, async (req, res) => {
  // Forward to PLK Engine endpoint
});
```

**`server/routes/insightBot.ts`** — forwards to Insight Bot Express:
```ts
router.post("/api/workspace/insight/chat", authMiddleware, async (req, res) => {
  // Route through llmRouter free-first cascade
  // platform: 'web' | 'reddit' | 'discord' from req.body
});
```

**`server/routes/symbioCoder.ts`** — forwards to SymbioCoder FastAPI:
```ts
router.post("/api/workspace/code/generate", authMiddleware, async (req, res) => {
  // Route through llmRouter; pass cognitive_state from req.body if present
});

router.post("/api/workspace/code/debug", authMiddleware, async (req, res) => {});
```

**Validation:** Each proxy route returns 200 with valid JSON when the respective backend is running. Returns 401 for unauthenticated requests. No microservice URLs are exposed in client-side code.

---

### Slice 3 — `ResumeLabPage.tsx`

**Mode:** Active / Productive. Focused on career artefacts.

**Layout:**
- Left panel: Resume editor with live preview and ATS score indicator (6-dimension breakdown from ATS Optimizer v2).
- Right panel: `CareerCoachDI` guidance panel with suggestions, clarifying questions, and a PLK resonance meter visualising narrative resonance.
- Footer actions: "Save Draft" (writes to `resume_profiles`) and "Publish to Scaffold" (sets `published_to_scaffold = true`, emits a Scaffold node event).

**DI Behaviour (`CareerCoachDI`):**
- Persona: warm, direct, evidence-citing Career Coach.
- Does not sycophantically affirm every resume line.
- Asks clarifying questions before rewriting sections.
- Proposes identity claims (skills, traits) as **pending** — never auto-approves.
- Billy is available via a secondary toggle but is not the primary presence.

**Identity Claim Flow:**
When ATS Optimizer or PLK Engine infers a skill or trait, write to `pending_identity_claims` with `source: 'resume_rockstar'` and `status: 'pending'`. Surface a review prompt to the user: "Resume Rockstar identified [skill]. Add to your Identity Portrait?" Approved claims only are forwarded to the portrait layer.

**Validation:**
- Resume saves to `resume_profiles` table.
- "Publish" creates a Scaffold node of type `resume`.
- Pending claims appear in a review queue, not in the live portrait.
- PLK resonance meter renders without crashing when `plk_resonance_score` is null.

---

### Slice 4 — `InsightAnalysisPage.tsx`

**Mode:** Active / Contextual. Distinct from the Blackboard Room.

**Layout:**
- Top bar: Platform switcher (Web / Reddit / Discord). Reddit uses Devvit component renderer if available; otherwise graceful fallback to standard chat.
- Main area: Chat interface with `ResearcherDI`. Each response includes visible citation or evidence node reference.
- Side panel: Insight summary panel showing synthesised research results. LLM routing path shown (which provider responded) for transparency.
- Crisis alert bar: If `crisisDetector` fires, display a banner directing the user to Sanctuary or external resources. Crisis detection must not silently log without user awareness.

**DI Behaviour (`ResearcherDI`):**
- Persona: precise, curious, evidence-grounding Researcher/Analyst.
- Provides references with every substantive claim.
- Asks clarifying questions before summarising ambiguous content.
- Proposes new Scaffold nodes based on observed research patterns — subject to user approval.
- Does not summarise sensitive data into the Dynamic Inner World without explicit user consent.

**Data Handling:**
- Sessions persist to `insight_sessions`.
- MongoDB (from Insight Bot's original stack) may be used locally, but the canonical persistence target is Supabase via GestaltView's existing client.
- Auth: Insight Bot's original repo has no auth. All routes in this sub-room must use GestaltView's Supabase JWT auth. Do not expose unprotected Express routes.

**Validation:**
- Chat sends to `/api/workspace/insight/chat` and receives a response.
- LLM provider name renders in the response footer.
- Crisis banner appears when `crisisDetector` returns a positive signal.
- Session saves to `insight_sessions` table.

---

### Slice 5 — `SymbioCoderPage.tsx`

**Mode:** Active / Productive. Specialised developer IDE inside GestaltView.

**Layout:**
- Main area: Code editor with syntax highlighting (use an existing GestaltView-compatible editor, e.g., CodeMirror or Monaco if already present; do not add a second editor dependency).
- Top bar: Language selector, run/deploy button, provider selector.
- Side panel: `DeveloperDI` with real-time suggestions. Cognitive dashboard (energy, mood, focus) displayed as soft indicators — sourced from SymbioCoder's Consciousness Engine if available, or omitted if not connected.
- Voice controls: STT dictation and TTS playback via existing GestaltView voice adapter if present; otherwise defer to a future slice.

**DI Behaviour (`DeveloperDI`):**
- Persona: grounded, technically precise Developer collaborator.
- Adjusts suggestion complexity based on cognitive state signals if available.
- Does not override or auto-apply code changes without confirmation.
- May suggest linking to Embodiment Studio if user indicates interest in creating a developer persona.
- Captures problem-solving patterns as pending identity claims (coding languages, patterns observed).

**Data Flow:**
- Code saves to `code_projects` table.
- "Publish" routes finished code as an artefact (repository link or inline content) to the External Scaffold.
- Cognitive state is stored in `code_projects.cognitive_state` (JSONB) if provided.

**Validation:**
- Code editor renders and accepts input.
- Generate endpoint returns a completion.
- Publish creates a Scaffold node of type `code`.
- Cognitive state stored correctly in JSONB column.

---

### Slice 6 — Cross-Cutting: Auth, CORS, Environment

**Auth:** All three new server routes use the existing GestaltView `authMiddleware`. No new auth system. The Insight Bot Express backend's unprotected routes must not be exposed directly — all traffic routes through GestaltView's authenticated proxy layer.

**CORS:** Microservice-to-microservice traffic is internal. The only public-facing origin is GestaltView's domain. Set `ALLOWED_ORIGINS` in each microservice to GestaltView's domain only.

**Environment Variables:** Each microservice requires its own `.env`. Add to GestaltView's root `.env.example`:
```
# Resume Rockstar
RESUME_ROCKSTAR_API_URL=http://localhost:8001

# Insight Bot
INSIGHT_BOT_API_URL=http://localhost:8002

# SymbioCoder
SYMBIO_CODER_API_URL=http://localhost:8003
```

**Health Checks:** Each proxy route should call a `/health` endpoint on the microservice at startup and log a warning (not crash) if unreachable.

**Validation:** `GET /api/workspace/resume/health`, `/api/workspace/insight/health`, `/api/workspace/code/health` all return 200 when backends are running. Return 503 with a descriptive message when backends are down.

---

### Slice 7 — DI Embodiment Profile Drafts

For each new DI, create an embodiment profile stub in `embodiment_profiles/`:

```
embodiment_profiles/
  career_coach_di.json
  researcher_di.json
  developer_di.json
```

Minimum required fields per profile (matching `shared/embodiment/types.ts`):
- `slug`
- `name`
- `constitution` (core values, prohibitions)
- `room_binding` (which sub-room they are primary in)
- `prompt_template` (base prompt structure)
- `governance.founder_review_required: true` for identity-affecting fields
- `status: "draft"`

These profiles are **draft** until founder review. They must not be auto-deployed to any runtime surface until status is changed to `active`.

**Validation:** Profiles validate against the TypeScript type in `shared/embodiment/types.ts`. Generator script (if present) includes these profiles in the registry without errors.

---

## Guardrails

| Concern | Rule |
|---|---|
| Identity drift | No auto-write to Identity Portrait. All claims via `pending_identity_claims` with user approval gate. |
| Crisis detection | `crisisDetector` from Insight Bot must surface to the user, not log silently. Route to Sanctuary on positive signal. |
| Sensitive data | Resume content, code, and research sessions are private by default. `published_to_scaffold` defaults to `false`. |
| DI hallucination | All three DIs must have anti-hallucination constraints in their prompt templates. Evidence-citing behaviour is constitutional, not optional. |
| Auth | No sub-room endpoint is reachable without a valid GestaltView session. |

---

## Rollback Notes

- All three pages are new files — deleting them and removing route registrations fully reverts the frontend.
- Schema migration is additive (new tables only) — reversible by dropping the four new tables.
- Server proxy routes are new files — removing them and their registrations fully reverts the backend proxy layer.
- No existing files are modified except for route registration additions.

---

## Expected User-Visible Result

- Three new sub-rooms accessible from the workspace/analysis/dev module.
- Each room has a distinct DI presence, Neural Aurora visual language, and a clear purpose statement on entry.
- Users can draft, score, and publish career artefacts from Resume Lab.
- Users can run multi-platform research sessions with cited responses from Insight Analysis.
- Users can write, generate, and publish code projects from SymbioCoder.
- Identity claims flow to a visible approval queue — never to the portrait silently.
