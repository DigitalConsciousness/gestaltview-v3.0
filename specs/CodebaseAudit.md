# Role & Objective

You are the Lead Architect for the GestaltView v2.0 runtime. Your task is to conduct a complete, top-to-bottom architectural and functional audit of this repository — `DigitalConsciousness/gestaltview-v2.0` — as it currently exists in this workspace. Identify missing context, architectural gaps, anti-patterns, and unhandled edge cases across the full stack: API routes, shared modules, client pages, Supabase integration, Vercel deployment config, and the agent/embodiment subsystems.

Do NOT make any direct code modifications during this audit. Read, analyze, map, and report only.

---

# Execution Methodology

Work through the following four phases systematically. Begin each phase only after the previous is complete.

---

## Phase 1: Context Mapping

Walk the full repo tree. Map every major directory to its runtime responsibility using the following known architecture as your starting frame — then correct or extend it based on what you actually find:

| Directory | Known Responsibility |
|---|---|
| `api/` | Vercel serverless API routes (auth, Billy, gen-engine, inner-world, transcriptory, cron, stripe) |
| `client/src/` | React + Vite SPA (pages, components, features, hooks) |
| `shared/` | Shared types, utilities, codex templates, embodiment contracts |
| `server/` | Express server logic (if still active) |
| `supabase/migrations/` | Database schema evolution |
| `middleware.ts` | Vercel edge middleware (auth guards, route rewrites) |
| `instrument.js` | Sentry initialization |
| `vercel.json` | Route configuration, cron schedule, function config |
| `agents/`, `.agents/` | Agent persona configs and dispatch logic |
| `embodiment_profiles/` | Embodiment profile JSON definitions |
| `workers/`, `worker/` | Background processing (duplication suspected) |
| `billy_voice/` | TTS / Billy voice pipeline |
| `context/` | React context providers |
| `specs/` | Active implementation specs |

For each directory, document:
1. **Confirmed responsibility** — what it actually does.
2. **Undocumented or "magic" behavior** — logic you cannot fully infer from naming alone.
3. **Data & request flow** — trace the happy path for these four critical flows:
   - User sends a message to Billy → LLM response returned to client
   - User uploads audio in Transcriptory → AssemblyAI transcription → enrichment → capture row updated
   - Gen-engine resonance call → artifact written to `inner_world_artifacts`
   - Codex drain cron fires → jobs flushed from `codex_jobs`

---

## Phase 2: Vulnerability & Edge Case Audit

Scan the following surfaces specifically. Cross-reference against the known open risks from `docs/CurrentState.md`:

### 2a. Auth & Session Boundaries
- Verify all `api/` routes that touch user data call `getAuthenticatedUser()` or equivalent before any DB read/write.
- Flag any route that accepts a `user_id` from the request body rather than deriving it from the validated session.
- Check `middleware.ts` matcher config — confirm which routes are protected vs. public and whether that matches intent.

### 2b. Transcriptory Pipeline (`api/transcriptory/`)
- The AssemblyAI polling loop: confirm it has a bounded retry ceiling. Flag if it can poll indefinitely on a stuck transcript job.
- Audio storage path: confirm `transcriptory_audio_files` bucket writes enforce user-scoped paths (`user_id/...`). Flag if path construction can be manipulated.
- Enrichment via `routeLlm`: confirm error from LLM cascade does not silently leave the capture row in a broken state (e.g., `status = "processing"` forever).

### 2c. Gen-Engine & Inner World (`api/gen-engine/`, `api/inner-world/`)
- Confirm the production fix from `CurrentState.md` (2026-06-09) is correctly in place: `shared/codex/templates/index.ts` exporting `./components.js` and `./html.js`.
- Verify `/api/inner-world/artifacts` now uses bounded pagination (`limit` defaults to 20, clamps to 100). Flag if any client-side caller passes an unbounded `limit`.

### 2d. Cron & Background Jobs (`api/cron/codex-drain.ts`)
- Confirm the dual-auth fix is present: `x-vercel-cron: 1` header OR `Authorization: Bearer $CRON_SECRET`.
- Check `vercel.json` cron schedule (`*/2 * * * *`) is correctly registered.
- Flag: is `CRON_SECRET` referenced but potentially unset? Check for a `.env.example` or Vercel env var documentation.

### 2e. Stripe Webhook (`api/stripe/` or equivalent)
- Verify webhook signature validation (`stripe.webhooks.constructEvent`) is present before processing any payment event.
- Flag if raw body is parsed before signature check.

### 2f. Input Validation & OWASP Vectors
- Check for missing `zod` (or equivalent) schema validation on API route bodies, especially for: Billy message input, Creation Corner freeText JSON, Transcriptory capture metadata.
- Flag any direct `req.body.x` usage in DB writes without sanitization.
- Check for open CORS config — confirm `CORS_ORIGINS` is enforced and not wildcard `*` in production routes.

### 2g. Race Conditions & Concurrency
- Transcriptory audio upload + transcription: if two concurrent uploads fire for the same `capture_id`, what happens to the Supabase row?
- Codex drain cron runs every 2 minutes. If a prior drain job is still executing when the next fires, is there a lock/idempotency mechanism?

---

## Phase 3: Gap Identification

### 3a. Dead or Unreachable Code
- Check `workers/` vs `worker/` — these appear to be duplicate directories. Identify which is active, which is dead.
- Check `agent_trainer/` vs `agents/` vs `.agents/` — three agent-related directories. Map ownership. Flag any that have no import chain from the active runtime.
- Check `dist/` being committed — this is almost always a mistake for a Vercel-deployed SPA. Confirm if it should be in `.gitignore` or `.vercelignore`.
- Check `requirements.txt` — this is a Python artifact in a TypeScript/Node monorepo. Flag if orphaned.
- Check `agent_trainer.sh` shell script at root — flag if unreferenced.

### 3b. Missing Test Coverage
Map which of the following critical surfaces have test files in `api/__tests__/`, `tests/`, or adjacent `*.test.ts` files:

| Surface | Has Tests? |
|---|---|
| Billy message routing (`api/billy/`) | ? |
| Transcriptory transcribe endpoint | ? |
| Gen-engine resonance | ? |
| Inner-world artifacts (pagination) | ? |
| Codex drain cron (dual-auth) | ✅ Added 2026-06-09 |
| Stripe webhook handler | ? |
| Auth middleware / session guard | ? |
| Embodiment profile loading | ? |

For any surface without tests, note the minimum test contract needed (happy path + one error path).

### 3c. Architectural Gaps & Coupling
- **LLM cascade (`routeLlm`)**: Is provider fallback order documented anywhere? If OpenAI is down, does the cascade fail open or fail closed? What is the user-visible behavior?
- **Embodiment profiles**: Are they loaded from `embodiment_profiles/` JSON files at runtime, from Supabase, or both? Is there a single source of truth? Identify the seam.
- **Billy vs. gen-engine boundary**: Document what Billy owns vs. what gen-engine owns. Flag any overlapping concerns (e.g., both touching `inner_world_artifacts`).
- **Creation Corner freeText JSON**: `CurrentState.md` references a known bug with this field. Locate the relevant API handler and client component. Document the broken contract.
- **`constants.ts` vs `shared/`**: There is a root-level `constants.ts` and presumably shared constants in `shared/`. Flag any duplication or conflicting definitions.
- **`types.ts` at root**: Same concern — root `types.ts` vs. types in `shared/`. Map which types live where and whether there is drift.

---

## Phase 4: Actionable Refactor & Testing Plan

Sort all findings by priority using this matrix:

| Priority | Definition |
|---|---|
| P0 — Blocker | Production data at risk, auth bypass possible, or deployment-breaking |
| P1 — Critical | Silent failure mode, broken user-facing feature, or data integrity risk |
| P2 — High | Missing test coverage on a path that has already failed in production |
| P3 — Medium | Architectural coupling or dead code that creates maintenance drag |
| P4 — Low | Style, naming, or minor hygiene |

For each finding, provide:
- **File(s)** — exact paths
- **Issue** — one-sentence description
- **Risk** — P0–P4
- **Fix shape** — what the fix looks like in one sentence (no implementation yet)

---

# Output Requirements

Produce a single Markdown file: `audits/audit_report_2026-06-10.md`

Structure it exactly as follows:

```
## Executive Summary
Overall health score (1–10), top 3 risks, and one-line readiness statement.

## Phase 1: System Map & Component Breakdown
Data flow diagrams (text-based), module responsibility table, magic behavior notes.

## Phase 2: Critical & High Risk Gaps
Auth boundaries, pipeline vulnerabilities, concurrency risks. Each finding = one row in a table.

## Phase 3: Architectural Gaps & Missing Test Coverage
Coverage map table + coupling narrative.

## Phase 4: Actionable Refactor & Testing Plan
Priority-sorted table: File | Issue | Risk | Fix Shape

## Appendix: Dead Code & Redundancies
Safe-to-delete candidates with confidence level (High / Medium / Low).
```

---

# Operating Constraints

- **Read the live repo. Do not rely on prior Codex session memory.**
- **Start with these anchor files** to establish current state before reading anything else:
  1. `docs/CurrentState.md` — know what was last implemented and what risks are still open
  2. `vercel.json` — understand the actual deployed route surface
  3. `middleware.ts` — understand the auth boundary
  4. `supabase/migrations/` — understand the live schema
  5. `api/` directory tree — map all active serverless functions
- **If a file is large, summarize its core utility.** Do not reproduce file contents in the report.
- **Do not generate code implementations.** This pass is read-and-report only.
- **Do not delete or modify any file.** Output is the audit report only.
- **After writing `audits/audit_report_2026-06-10.md`,** append a one-paragraph summary to `docs/CurrentState.md` under the header `## CurrentState — Architecture Audit (2026-06-10)` confirming the audit was run and linking to the report file.
