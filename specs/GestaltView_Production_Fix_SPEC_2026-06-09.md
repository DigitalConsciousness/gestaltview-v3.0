# GestaltView v2 — Critical Production Fix SPEC
## Deployment: `dpl_2wU58k4EQbGMcEj4nZ2BtVfcdbw7` · June 9, 2026

---

## Executive Summary

Three production failures are preventing the entire gen-engine pipeline from functioning.
All three are diagnosed from live Vercel logs (exported 2026-06-09T19:20:11Z) and live
repo inspection. No guesswork. Fix them in order — Fix 1 unblocks artifact synthesis
entirely, Fix 2 unblocks the job drain queue, Fix 3 cleans up a security deprecation.
Fix 4 is a performance hardening task that should follow.

**Impact matrix:**

| Fix | Severity | Impact if unresolved | Est. effort |
|-----|----------|----------------------|-------------|
| F1 — Missing `components` extension | 🔴 FATAL | 100% of gen-engine resonance calls crash on boot | ~20 min |
| F2 — `codex-drain` cron 401 | 🔴 FATAL | Job queue never drains, no artifacts ever export | ~10 min |
| F3 — `url.parse()` deprecation | 🟡 WARNING | Security risk, future Node crash | ~15 min |
| F4 — `inner-world/artifacts` 83s GET | 🟠 PERF | Timeout risk under any load | ~30 min |

---

## Fix 1 — `ERR_MODULE_NOT_FOUND: shared/codex/templates/components`

### Root Cause

**File:** `shared/codex/templates/index.ts`

Current content (confirmed live):
```ts
export * from "./components";
export * from "./html";
```

The file `components.tsx` EXISTS in the repo at `shared/codex/templates/components.tsx`
(SHA: `8b018c336783c87bb0c80d617893ba9c92ac1541`).

The problem: Node.js ESM resolver in production (`/var/task/`) cannot resolve
`"./components"` → `components.tsx` because **`.tsx` is not a valid ESM extension**
in the Node runtime. The resolver tries:
  - `./components`        — not found
  - `./components.js`     — not found
  - `./components/index.js` — not found
  → FATAL: `ERR_MODULE_NOT_FOUND`

It never tries `.tsx` because that is a TypeScript-only extension stripped at compile
time. This means the compiled JS in `/var/task/` contains `export * from "./components"`
with no `.js` extension, and the file at `./components.js` does not exist because the
TypeScript compiler did not emit `components.tsx` as `components.js`.

### Why This Happened

`components.tsx` uses JSX (React). If the `tsconfig` for the `shared/` directory does
not include `jsx` compilation, or if the Vercel build only compiles `.ts` files and
skips `.tsx`, the output `components.js` is never emitted. The import exists, the
output does not.

### Fix

**Option A — Rename `components.tsx` → `components.ts`** (preferred if no JSX is used)

Inspect `shared/codex/templates/components.tsx`. If it contains no JSX syntax (no
angle-bracket tags, no `React.createElement`), rename it to `components.ts`. The build
will then emit `components.js` correctly.

```bash
# Verify first:
cat shared/codex/templates/components.tsx
```

**Option B — Ensure `shared/` tsconfig includes JSX emission** (if JSX is required)

If `components.tsx` does use JSX, verify `tsconfig.json` (or `tsconfig.shared.json`)
includes:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "dist",
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["shared/**/*.tsx", "shared/**/*.ts"]
}
```

AND verify the Vercel build command compiles the `shared/` directory. If the build
only targets `api/` and `client/`, `shared/*.tsx` files will never emit `.js`.

**Option C — Add explicit `.js` extension to the import** (surgical fallback)

If options A/B are blocked, update `shared/codex/templates/index.ts` to use the
explicit compiled extension:
```ts
// shared/codex/templates/index.ts
export * from "./components.js";   // tells ESM resolver exactly what to look for
export * from "./html.js";
```
This only works if the compiled `components.js` actually exists in `/var/task/`.
Combine with Option A or B to ensure the file is emitted.

### Validation

After deploying the fix, hit the endpoint directly:
```bash
curl -X POST https://gestaltview-v2-0-nine.vercel.app/api/gen-engine/resonance \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","prompt":"test"}' \
  -w "\nHTTP %{http_code}\n"
```
Expected: HTTP 200 or 400 (bad input) — any response other than 500 confirms the
module is loading.

---

## Fix 2 — `codex-drain` Cron Returns 401 on Every Invocation

### Root Cause

**File:** `api/cron/codex-drain.ts`

Current auth logic (confirmed live):
```ts
const isCron = req.headers["x-vercel-cron"] === "1";
if (!isCron && process.env.NODE_ENV === "production") {
  res.status(401).json({ error: "unauthorized" });
  return;
}
```

The cron fires from `vercel-cron/1.0` user-agent. Vercel's cron infrastructure
sets `x-vercel-cron: 1` on invocations **only when the request originates from
Vercel's own cron scheduler on the same deployment**.

The log shows cron requests hitting:
```
gestaltview-v2-0-rmbuomtx9-rogue-dynamic.vercel.app
```
...which is a **preview/rogue-dynamic deployment alias**, not the canonical
production deployment. Vercel's cron jobs are bound to the deployment that
defines them in `vercel.json`. If `vercel.json` defines the cron but the cron
is being scheduled against a preview alias, the `x-vercel-cron` header may not
be set (or may be set to a different value) for non-canonical deployments.

Result: `isCron` is `false`, `NODE_ENV` is `"production"`, → 401 every time.

### Fix

**Step 1 — Verify `vercel.json` cron config points to correct path:**
```json
{
  "crons": [
    {
      "path": "/api/cron/codex-drain",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

**Step 2 — Add `CRON_SECRET` as a fallback auth mechanism** (belt-and-suspenders):

Update `api/cron/codex-drain.ts` auth block to accept EITHER the Vercel cron
header OR a matching bearer secret:

```ts
const isCronHeader = req.headers["x-vercel-cron"] === "1";
const cronSecret = process.env.CRON_SECRET;
const authHeader = req.headers["authorization"];
const isBearerMatch = cronSecret
  ? authHeader === `Bearer ${cronSecret}`
  : false;

if (!isCronHeader && !isBearerMatch && process.env.NODE_ENV === "production") {
  res.status(401).json({ error: "unauthorized" });
  return;
}
```

**Step 3 — Set `CRON_SECRET` env var in Vercel:**

In Vercel Dashboard → Project → Settings → Environment Variables:
- Name: `CRON_SECRET`
- Value: any strong random string (generate with `openssl rand -hex 32`)
- Environments: ✅ Production ✅ Preview ✅ Development

**Step 4 — Verify `NODE_ENV` is set:**

Confirm `NODE_ENV=production` is set in Vercel env vars for production. If it is
missing, the 401 guard never fires (which actually means cron would work — but
every public request would also work, which is insecure).

### Validation

After deploying, check Vercel function logs for `/api/cron/codex-drain`. Within
2 minutes of deploy, you should see:
```json
{ "status": "idle", "processed": 0, "results": [] }
```
or if jobs are queued:
```json
{ "status": "drained", "processed": N, "ready": N, ... }
```
Any 200 response confirms the auth check is passing.

You can also manually trigger:
```bash
curl -X GET https://gestaltview-v2-0-nine.vercel.app/api/cron/codex-drain \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -w "\nHTTP %{http_code}\n"
```

---

## Fix 3 — `url.parse()` Security Deprecation in `dynamic-inner-world`

### Root Cause

**File:** `api/consciousness/dynamic-inner-world.ts` (exact line TBD — run grep)

```bash
grep -n "url.parse" api/consciousness/dynamic-inner-world.ts
```

Node.js emits `[DEP0169]` on every invocation:
```
DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors
that have security implications. Use the WHATWG URL API instead.
```

This is currently a warning. It will become an error in a future Node LTS and
can introduce URL parsing inconsistencies that may have security implications
(SSRF, header injection via malformed URLs).

### Fix

Replace `url.parse()` with the WHATWG `URL` constructor:

```ts
// BEFORE:
import url from "url";
const parsed = url.parse(someUrlString);
const pathname = parsed.pathname;
const query = parsed.query;

// AFTER:
const parsed = new URL(someUrlString, "https://base.invalid"); // base needed for relative URLs
const pathname = parsed.pathname;
const query = Object.fromEntries(parsed.searchParams);
```

If the `url` import is used only for `url.parse`, remove the import entirely after
the replacement.

### Validation

After deploying, hit the endpoint and verify no `[DEP0169]` warning appears in
Vercel function logs:
```bash
curl "https://gestaltview-v2-0-nine.vercel.app/api/consciousness/dynamic-inner-world?userId=test"
```
Check Vercel logs — the deprecation warning line should be absent.

---

## Fix 4 — `api/inner-world/artifacts` 83-Second Response Time

### Root Cause

An 83-second GET response on `/api/inner-world/artifacts` observed in logs.
Vercel function timeout is 300s on Pro plan but this is dangerously slow for
any user-facing call. Most likely causes:

1. **Missing database index** on the query filter column (e.g., `user_id` on the
   artifacts table with no index → full table scan).
2. **N+1 query** — fetching artifact rows then making per-row supabase calls for
   related data (manifests, exports, etc.) in a loop.
3. **No query limit/pagination** — fetching all rows for a user with no `limit`.

### Investigation Steps

```bash
# Check what columns are indexed on relevant tables:
# (run in Supabase SQL editor)
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('codex_jobs', 'inner_world_artifacts', 'codex_export_manifests')
ORDER BY tablename, indexname;
```

### Fix

**Step 1 — Add missing indexes** (apply as Supabase migration):

```sql
-- Migration: add_artifact_query_indexes
-- Ensure fast lookups on the most common query patterns

CREATE INDEX IF NOT EXISTS idx_inner_world_artifacts_user_id
  ON inner_world_artifacts(user_id);

CREATE INDEX IF NOT EXISTS idx_inner_world_artifacts_user_created
  ON inner_world_artifacts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_codex_jobs_artifact_id
  ON codex_jobs(artifact_id);

CREATE INDEX IF NOT EXISTS idx_codex_jobs_status
  ON codex_jobs(status);

CREATE INDEX IF NOT EXISTS idx_codex_jobs_status_created
  ON codex_jobs(status, created_at ASC);
```

**Step 2 — Add pagination to the API route:**

In `api/inner-world/artifacts.ts`, ensure the Supabase query uses `limit` and
`offset` (or cursor-based pagination):

```ts
const limit = Math.min(Number(req.query.limit) || 20, 100);
const offset = Number(req.query.offset) || 0;

const { data, error } = await supabase
  .from("inner_world_artifacts")
  .select("id, title, format, status, created_at, codex_jobs(id, status, format)")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .range(offset, offset + limit - 1);
```

**Step 3 — Verify no N+1 pattern:**

Check that related data (export manifests, job statuses) is fetched via a single
JOIN query or a single `select` with nested resource syntax — not a per-row loop.

### Validation

After deploying indexes and query fix, measure response time:
```bash
time curl "https://gestaltview-v2-0-nine.vercel.app/api/inner-world/artifacts?userId=YOUR_ID"
```
Target: under 500ms for a user with ≤100 artifacts.

---

## Deployment Order

Execute in this exact sequence to avoid partial states:

```
1. Fix 1 (components module)     → deploy → verify resonance returns non-500
2. Fix 2 (cron 401)              → deploy → verify drain returns 200 within 2 min
3. Fix 3 (url.parse)             → deploy → verify no DEP0169 in logs
4. Fix 4 (indexes + pagination)  → apply migration → deploy → verify <500ms GET
```

Fixes 1+2+3 can be batched into a single commit if desired. Fix 4 requires a
Supabase migration to run first, then a deploy — do it separately.

---

## Files to Touch

| File | Fix | Change type |
|------|-----|-------------|
| `shared/codex/templates/components.tsx` | F1 | Rename to `.ts` OR verify JSX emit |
| `shared/codex/templates/index.ts` | F1 | Add `.js` extensions to exports |
| `api/cron/codex-drain.ts` | F2 | Add CRON_SECRET bearer fallback |
| `vercel.json` | F2 | Verify cron path config |
| `api/consciousness/dynamic-inner-world.ts` | F3 | Replace `url.parse()` → `new URL()` |
| `api/inner-world/artifacts.ts` | F4 | Add limit/pagination |
| Supabase migration | F4 | Add 5 indexes |
| Vercel env vars (dashboard) | F2 | Add `CRON_SECRET` |

---

## Post-Deploy Smoke Test Checklist

- [ ] `POST /api/gen-engine/resonance` → HTTP 200/400 (not 500)
- [ ] `GET /api/cron/codex-drain` (with bearer) → HTTP 200 `{ "status": "idle" }` or `"drained"`
- [ ] Vercel cron logs show 200 within 2 minutes of deploy
- [ ] `GET /api/consciousness/dynamic-inner-world?userId=X` → no `[DEP0169]` in logs
- [ ] `GET /api/inner-world/artifacts?userId=X` → response under 1s
- [ ] Creation Corner synthesize → artifact appears in DIW within 1 cron cycle (2 min)

---

*Generated: 2026-06-09 — Source: live Vercel log export + live GitHub repo inspection*
*Deployment: `dpl_2wU58k4EQbGMcEj4nZ2BtVfcdbw7` · Project: `prj_qMxBteDOPnocaXtsoY5hmFaYYw8S`*
