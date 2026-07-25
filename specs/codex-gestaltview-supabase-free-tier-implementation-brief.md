# Codex Implementation Brief — GestaltView v2 Supabase Free-Tier Resilience

## What this is

This is a direct implementation brief for stabilizing GestaltView v2 while remaining on the Supabase free tier for now.

The goal is not to redesign the whole stack.
The goal is to make the current Vercel + Supabase runtime degrade gracefully, protect founder continuity, and stop the Agent Trainer from collapsing into generic `Failed to fetch` states when Supabase is slow, paused, or intermittently failing.

## Delivery style

When you make changes, prefer **full-file outputs for touched files** rather than tiny patch fragments.
Keep the implementation low-maintenance, explicit, and readable.
Avoid adding clever abstractions unless they clearly reduce future failure handling work.

## Hard constraints

- Do **not** assume a paid Supabase upgrade is available.
- Prefer same-origin Vercel API routes over additional direct browser-to-Supabase critical-path calls.
- Do **not** introduce abusive or high-frequency keep-alive traffic.
- Keep service-role usage strictly server-side.
- Preserve founder/admin security and user privacy.
- Treat Supabase pause, timeout, and intermittent slowness as a normal runtime condition.
- Keep ops burden appropriate for a solo founder.

## Confirmed repo targets

The repo already exposes the main surfaces that matter here. Work inside the existing lanes first.

### Primary likely edit targets

- `client/src/contexts/AuthContext.tsx`
- `client/src/features/agent-trainer/AgentTrainerPage.tsx`
- `client/src/features/agent-trainer/lib/trainerApi.ts`
- `client/src/lib/billyApi.ts`
- `api/session/dashboard.ts`
- `api/session/memory.ts`
- `api/session/state.ts`
- `api/trainer/study-sources/index.ts`
- `api/trainer/study-sources/recommendations.ts`
- `api/trainer/queue-health.ts`
- `api/billy.ts`
- `api/voice/billy.ts`
- `api/_lib/auth.ts`
- `api/_lib/requestGuard.ts`
- `api/_lib/response.ts`
- `api/_lib/supabase.ts`
- `server/agent-trainer/study-sources.ts`

### Secondary likely edit targets

- `api/__tests__/trainer-study-sources.test.ts`
- `supabase/migrations/20260321100000_founder-context.sql`
- any env example / runtime docs files that need new variables or operational notes

## Confirmed operational reality

Treat these as established facts for implementation:

1. The Agent Trainer weak lane is the study-source recommendation path, not necessarily the entire trainer surface.
2. The raw study-source listing and the recommendations call should be treated as separate failure domains.
3. Founder continuity already has a dedicated persistence surface via `founder_context`.
4. The app already has an auth-side fail-open pattern and should extend that resilience model elsewhere.
5. Billy and trainer flows already use Vercel API routes, so the correct move is to harden those paths instead of bypassing them.

## High-level objective

Implement a resilience layer that achieves all of the following:

1. Founder/admin login remains usable even when Supabase is slow.
2. Founder-context saves do not silently disappear.
3. Billy can continue in degraded mode using last-known-good continuity state.
4. Agent Trainer can still load raw source lists when recommendations fail.
5. The UI surfaces explicit degraded states instead of generic `Failed to fetch`.
6. Critical logic routes through one same-origin API surface where possible.

## The work to do

---

## 1) Build one shared fetch resilience utility on the client

Create or extend a client-side utility used by trainer, auth-adjacent, and Billy-facing calls.

### Required behavior

- request timeout with `AbortController`
- retries with backoff and jitter for safe operations
- retry only on clearly retryable conditions
- preserve non-retryable application errors
- return structured failure metadata instead of forcing raw thrown network errors into the UI

### Expected output shape

Use something like this conceptually:

```ts
export type AppFetchErrorCode =
  | 'timeout'
  | 'network'
  | 'supabase_paused'
  | 'supabase_unavailable'
  | 'upstream_5xx'
  | 'auth_unavailable'
  | 'unknown';

export type AppFetchResult<T> =
  | { ok: true; data: T; degraded?: boolean; meta?: Record<string, unknown> }
  | { ok: false; code: AppFetchErrorCode; message: string; retryable: boolean; meta?: Record<string, unknown> };
```

### First consumers

- `client/src/features/agent-trainer/lib/trainerApi.ts`
- `client/src/lib/billyApi.ts`
- any auth/session bootstrap call path in `AuthContext.tsx`

---

## 2) Split raw trainer sources from trainer recommendations at both API and UI layers

Do **not** let the recommendations call block the entire trainer page.

### API behavior

`/api/trainer/study-sources`
- should stay the fast, minimal, raw source list endpoint
- must return quickly or fail clearly

`/api/trainer/study-sources/recommendations`
- should be treated as an optional enhancement layer
- should have a tighter timeout budget than the base page
- should return structured degraded metadata when unavailable
- should never cause the page to look like all trainer data is dead

### UI behavior

In `AgentTrainerPage.tsx`:
- load raw study sources first
- request recommendations separately
- if recommendations fail, show a specific degraded state
- preserve manual source selection even when recommendations are unavailable
- do not show a global hard failure if raw sources are still present

### Explicit UI states to support

- `healthy`
- `degraded_recommendations_only`
- `degraded_backend_timeout`
- `saved_locally_pending_sync`
- `auth_unavailable_but_fail_open`

---

## 3) Harden the server-side study-source implementation

Inspect and stabilize:

- `api/trainer/study-sources/index.ts`
- `api/trainer/study-sources/recommendations.ts`
- `server/agent-trainer/study-sources.ts`
- any shared Supabase query helpers used by those files

### Required behavior

- enforce query guards for empty or too-short search input
- avoid expensive similarity scans for empty, null, or effectively useless queries
- short-circuit to safe defaults when recommendation inputs are not sufficient
- add server-side timeout protection around slow Supabase calls
- return structured JSON errors rather than allowing malformed or partial responses
- if a last-good cached snapshot exists, return it as degraded data instead of a hard failure

### Strong suspicion to validate

There is reason to suspect the recommendations lane is falling into an expensive search path when query input is empty or too short. Verify and fix that first before blaming the UI.

---

## 4) Add a small circuit breaker around recommendations

Do this on the client, server, or both if it stays simple.

### Expected behavior

- after repeated recommendation failures, stop hammering that endpoint briefly
- use a cooldown window
- while open, show cached/last-good recommendations or a clean fallback message
- raw study sources remain fully usable

This should be implemented narrowly for the fragile lane, not as a global app abstraction unless that truly reduces complexity.

---

## 5) Add local-first founder persistence protection

The founder continuity path needs a safety net.

### Implement

- a local outbox for founder-context writes
- idempotency key support on write requests
- retry-on-reconnect or retry-on-next-session logic
- explicit UI state when a write is stored locally but not yet synced

### Preferred storage

Use IndexedDB for queued structured writes.
Use `localStorage` only for tiny flags or tiny last-known UI state.

### Focus areas

- `api/session/memory.ts`
- `api/session/state.ts`
- `api/session/dashboard.ts`
- any client logic that writes founder continuity state
- Billy bootstrapping paths that read founder continuity state

### Required degraded behavior

If live persistence is unavailable:
- preserve the write locally
- surface `saved locally, pending sync`
- allow Billy/session continuity to boot from last-known-good founder state when possible

---

## 6) Extend fail-open auth behavior into a broader control-plane startup policy

The app already knows how to fail open on auth stalls.
That same philosophy needs to be extended.

### In `AuthContext.tsx` and adjacent startup logic

- preserve a bounded startup wait
- do not leave the UI suspended forever waiting on Supabase
- surface a specific state when auth/session lookup is slow
- allow the app to render enough of the interface to explain the problem
- do not collapse everything into a blank spinner or generic fetch failure

### Important distinction

Rendering in degraded mode is acceptable.
Pretending auth definitely succeeded when it did not is not.

---

## 7) Keep critical flows behind same-origin Vercel API routes

Move or keep these flows server-mediated:

- founder/admin-sensitive reads
- founder-context writes
- trainer recommendations
- trainer control-plane reads that need consistent timeout/error shaping
- any route requiring service-role access or complex fallback behavior

### Avoid

- new direct browser Supabase critical-path calls for fragile control-plane logic
- exposing service-role concerns to the client
- browser-side logic that has to understand too many Supabase-specific failure shapes

The browser should ideally talk to one stable application API surface.

---

## 8) Add a lightweight health endpoint and a visible health panel

Create a minimal same-origin health route such as:

- `/api/health/supabase`

### Endpoint behavior

Do only cheap checks.
No heavy writes.
No trainer recommendation logic.
No embedding work.
No abusive polling.

Return a small structured payload such as:

```json
{
  "ok": true,
  "state": "healthy",
  "latencyMs": 182,
  "degraded": false,
  "checks": {
    "supabase": "ok",
    "auth": "ok",
    "trainerSources": "ok"
  }
}
```

### UI panel behavior

Add a small operator-facing panel or status strip that can expose:

- Supabase health
- auth/session health
- trainer source listing health
- trainer recommendations health
- pending local write count
- last successful founder-context sync time

Keep it utilitarian.
This is an operator instrument, not a marketing surface.

---

## 9) Improve server response shaping

Across the critical Vercel handlers, stop returning vague shapes.

### Preferred response contract

Every critical route should clearly indicate:

- whether the route succeeded
- whether the response is degraded
- a stable machine-readable reason code when degraded
- whether fallback data is being served

### Example

```json
{
  "ok": true,
  "degraded": true,
  "reason": "trainer_recommendations_unavailable",
  "data": [...],
  "fallbackSource": "last_good_snapshot"
}
```

### Focus handlers

- `api/trainer/study-sources/recommendations.ts`
- `api/session/dashboard.ts`
- `api/session/memory.ts`
- `api/billy.ts`
- `api/voice/billy.ts`

---

## 10) Prepare auth email fallback, even if some of it is operational rather than code-only

Code and docs should assume default Supabase email delivery is not reliable enough for founder/admin-critical access.

### Deliverables

- document required env/config for custom SMTP
- add or preserve a founder/admin bootstrap path that is server-only
- make password login fallback possible for founder/admin access if that lane already exists or can be added cleanly
- do not make magic link delivery the only recovery path

If implementation is partly outside the repo, still leave the codebase and docs ready for it.

---

## Suggested implementation order

### Phase 1 — first real grab points

1. `api/trainer/study-sources/recommendations.ts`
2. `server/agent-trainer/study-sources.ts`
3. `client/src/features/agent-trainer/lib/trainerApi.ts`
4. `client/src/features/agent-trainer/AgentTrainerPage.tsx`

Goal: stop the trainer page from falling over when recommendations fail.

### Phase 2 — founder continuity protection

5. `api/session/memory.ts`
6. `api/session/state.ts`
7. `api/session/dashboard.ts`
8. client-side founder continuity write/read paths

Goal: founder-context writes survive intermittent backend failure.

### Phase 3 — shared infrastructure hardening

9. shared client fetch resilience utility
10. `api/_lib/supabase.ts`
11. `api/_lib/auth.ts`
12. `api/_lib/requestGuard.ts`
13. `api/_lib/response.ts`
14. lightweight health endpoint and health UI

Goal: unify timeout/error/degraded behavior across the app.

---

## Acceptance criteria

The work is not done until all of the following are true:

### Trainer

- Agent Trainer loads raw study sources even when recommendations fail.
- Recommendation failures produce a precise degraded state, not a generic browser fetch error.
- Empty or too-short recommendation queries do not trigger expensive backend behavior.
- Recommendation retries are bounded and do not spam the backend.

### Founder continuity

- Founder-context writes never silently vanish.
- Failed writes can be queued locally and retried later.
- Billy can boot from last-known-good continuity state when live reads fail.

### Auth and control plane

- Auth/session startup cannot hang indefinitely.
- The app can render a truthful degraded state instead of spinning forever.
- Sensitive flows stay behind same-origin Vercel API routes.

### Operational visibility

- There is a lightweight health route.
- There is a visible operator-facing status surface for degraded runtime state.

---

## Things to avoid

- Do not add minute-level synthetic wake traffic intended to game free-tier pause behavior.
- Do not turn every failure into one giant global error state.
- Do not add a heavy dependency just to get retry/backoff.
- Do not push service-role logic into the browser.
- Do not redesign the database unless a small targeted fix clearly solves the failure.
- Do not replace Supabase entirely in this pass.

---

## Implementation notes for output back to me

When you respond with the implementation:

1. Start with the exact files you changed.
2. For each file, say why it changed in one or two lines.
3. Prefer full-file replacements for high-impact files.
4. Call out any env vars, dashboard settings, or manual Supabase/Vercel steps separately.
5. Distinguish:
   - code changes completed
   - manual steps still required
   - recommended later improvements not included in this pass

## Final framing

This is a stabilization pass.
Not a platform rewrite.

The correct win condition is:

- the app tells the truth when Supabase is sick,
- founder continuity does not get dropped on the floor,
- the Agent Trainer remains usable when recommendations are degraded,
- and the runtime becomes noticeably harder to break without creating a maintenance burden.
