# RateLimiterBootstrap.ts — Implementation Spec
**GestaltView v2.0 · Free-Tier Synthesis & Render Rate Limiting**
*Authored: 2026-06-12 · Owner: Keith / DigitalConsciousness*

---

## Purpose

This spec defines `server/lib/RateLimiterBootstrap.ts` — a single, authoritative rate-limiting layer for GestaltView's free-tier synthesis and Dynamic Inner World render pipeline.

The design principle is **compassionate constraint**: free users get a real taste of the magic — enough to understand what they're missing — without the system ever running at a loss. Every limit is human-readable, never punishing, and always paired with a path forward.

---

## Mental Model

Three resources are metered for free/anonymous users:

| Resource | What it represents | Why it costs money |
|---|---|---|
| **Synthesis** | A `/api/gen-engine/artifacts` or `/api/codex/forge` call that invokes an LLM | ~$0.005–$0.02/call in API tokens |
| **Render** | Displaying a synthesized artifact inside the Dynamic Inner World | Negligible alone, but unbounded renders = unbounded synthesis retries |
| **Session cap** | Total metered actions within a rolling 24-hour window | Protects against multi-session drain from a single free account |

Paid tiers (`core`, `pro`, `enterprise`) bypass all limits. This file is only enforced for `free` and `anonymous` tiers.

---

## File Location

```
server/
  lib/
    RateLimiterBootstrap.ts   ← this file
  middleware/
    rateLimitMiddleware.ts    ← thin Express wrapper that imports and applies this
```

---

## Daily Budget Constants

These are the only numbers to change when you update the free-tier offer. Every limit flows from this single config object — never hardcode values in middleware or route handlers.

```typescript
// server/lib/RateLimiterBootstrap.ts

export const FREE_TIER_BUDGET = {
  // How many synthesis calls a free user may make in a 24-hour window
  synthesisPerDay: 3,

  // How many Dynamic Inner World renders a free user may trigger per day
  // (synthesis + render counted separately so a re-render of an existing
  //  artifact doesn't consume a synthesis credit)
  rendersPerDay: 5,

  // Hard ceiling across ALL metered actions in a single day
  // (failsafe: even if synthesis + render counts stay under their individual
  //  caps, total actions cannot exceed this)
  totalActionsPerDay: 6,

  // Rolling window in milliseconds (24 hours)
  windowMs: 24 * 60 * 60 * 1000,

  // Grace: if the system is in a degraded state (Supabase/Redis unavailable),
  // fail open and allow this many actions before hard-blocking
  degradedModeAllowance: 2,
} as const;
```

**Tuning guide:** At $0.01/synthesis average, 3 syntheses/day/free-user = $0.03/day/user. At 1,000 active free users that's $30/day in API cost — well under a $1,000/month threshold. When you have real usage data, revisit `synthesisPerDay` first.

---

## Storage Backend

Use **Supabase** (already wired) as the primary store, with an **in-memory fallback map** for degraded/offline states. Do NOT introduce Redis as a new dependency for this — the existing Supabase client is sufficient.

### Supabase Table: `rate_limit_buckets`

```sql
-- Migration: add_rate_limit_buckets
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key      TEXT NOT NULL,        -- userId for authed users, hashed IP for anonymous
  action_type   TEXT NOT NULL,        -- 'synthesis' | 'render' | 'action'
  window_start  TIMESTAMPTZ NOT NULL, -- start of the current 24h window
  count         INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_key, action_type, window_start)
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_rlb_user_key_window
  ON rate_limit_buckets (user_key, window_start);

-- RLS: service role only — this table is never exposed to the client
ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON rate_limit_buckets
  USING (auth.role() = 'service_role');
```

---

## Core Types

```typescript
export type MeterableAction = 'synthesis' | 'render' | 'action';

export type RateLimitResult =
  | { allowed: true;  remaining: Record<MeterableAction, number>; windowResetAt: Date }
  | { allowed: false; reason: RateLimitReason; retryAfter: Date; friendlyMessage: string };

export type RateLimitReason =
  | 'synthesis_daily_cap'
  | 'render_daily_cap'
  | 'total_daily_cap'
  | 'degraded_allowance_exhausted';
```

---

## `RateLimiterBootstrap` Class

```typescript
export class RateLimiterBootstrap {
  private supabase: SupabaseClient;
  // In-memory fallback: key = `${userKey}:${actionType}`, value = count
  private degradedStore = new Map<string, number>();
  private isDegraded = false;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  // ─────────────────────────────────────────────
  // PRIMARY: Call this before any synthesis or render
  // ─────────────────────────────────────────────
  async checkAndIncrement(
    userKey: string,       // userId or sha256(ip + date-salt)
    action: MeterableAction,
    tier: 'free' | 'anonymous'
  ): Promise<RateLimitResult> {
    // Paid tiers are never metered — this should not be called for them,
    // but this guard makes it safe if called accidentally
    if (!['free', 'anonymous'].includes(tier)) {
      return this._unlimitedResult();
    }

    try {
      const result = await this._checkSupabase(userKey, action);
      this.isDegraded = false;
      return result;
    } catch (err) {
      // Supabase unavailable — fall back to in-memory, fail open with reduced allowance
      console.warn('[RateLimiter] Supabase unavailable, falling back to degraded mode', err);
      this.isDegraded = true;
      return this._checkDegraded(userKey, action);
    }
  }

  // ─────────────────────────────────────────────
  // READ-ONLY: Returns remaining counts without incrementing
  // Used by the client to render the usage indicator
  // ─────────────────────────────────────────────
  async peek(userKey: string): Promise<Record<MeterableAction, number> | null> {
    try {
      const windowStart = this._windowStart();
      const { data } = await this.supabase
        .from('rate_limit_buckets')
        .select('action_type, count')
        .eq('user_key', userKey)
        .eq('window_start', windowStart.toISOString());

      if (!data) return null;

      const counts = { synthesis: 0, render: 0, action: 0 } as Record<MeterableAction, number>;
      for (const row of data) counts[row.action_type as MeterableAction] = row.count;

      return {
        synthesis: Math.max(0, FREE_TIER_BUDGET.synthesisPerDay - counts.synthesis),
        render:    Math.max(0, FREE_TIER_BUDGET.rendersPerDay    - counts.render),
        action:    Math.max(0, FREE_TIER_BUDGET.totalActionsPerDay - counts.action),
      };
    } catch {
      return null; // non-fatal
    }
  }

  // ─────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────

  private async _checkSupabase(
    userKey: string,
    action: MeterableAction
  ): Promise<RateLimitResult> {
    const windowStart = this._windowStart();
    const windowResetAt = new Date(windowStart.getTime() + FREE_TIER_BUDGET.windowMs);

    // Upsert the specific action bucket
    const { data: actionRow, error: actionErr } = await this.supabase
      .from('rate_limit_buckets')
      .upsert(
        { user_key: userKey, action_type: action, window_start: windowStart.toISOString(), count: 1 },
        { onConflict: 'user_key,action_type,window_start', ignoreDuplicates: false }
      )
      .select('count')
      .single();

    if (actionErr) throw actionErr;

    // Upsert the aggregate action bucket
    const { data: totalRow, error: totalErr } = await this.supabase
      .from('rate_limit_buckets')
      .upsert(
        { user_key: userKey, action_type: 'action', window_start: windowStart.toISOString(), count: 1 },
        { onConflict: 'user_key,action_type,window_start', ignoreDuplicates: false }
      )
      .select('count')
      .single();

    if (totalErr) throw totalErr;

    const actionCount = actionRow.count as number;
    const totalCount  = totalRow.count  as number;

    // Check caps in order of specificity
    if (action === 'synthesis' && actionCount > FREE_TIER_BUDGET.synthesisPerDay) {
      return this._blockedResult('synthesis_daily_cap', windowResetAt,
        `You've used your ${FREE_TIER_BUDGET.synthesisPerDay} free synthesis sessions for today. Your next session resets at ${this._formatReset(windowResetAt)}.`);
    }
    if (action === 'render' && actionCount > FREE_TIER_BUDGET.rendersPerDay) {
      return this._blockedResult('render_daily_cap', windowResetAt,
        `You've rendered ${FREE_TIER_BUDGET.rendersPerDay} artifacts in your Inner World today. Come back at ${this._formatReset(windowResetAt)} — or unlock unlimited renders with a plan.`);
    }
    if (totalCount > FREE_TIER_BUDGET.totalActionsPerDay) {
      return this._blockedResult('total_daily_cap', windowResetAt,
        `You've made the most of your free session today. Everything resets at ${this._formatReset(windowResetAt)}.`);
    }

    const remaining: Record<MeterableAction, number> = {
      synthesis: Math.max(0, FREE_TIER_BUDGET.synthesisPerDay    - actionCount),
      render:    Math.max(0, FREE_TIER_BUDGET.rendersPerDay      - (action === 'render' ? actionCount : 0)),
      action:    Math.max(0, FREE_TIER_BUDGET.totalActionsPerDay - totalCount),
    };

    return { allowed: true, remaining, windowResetAt };
  }

  private _checkDegraded(userKey: string, action: MeterableAction): RateLimitResult {
    const key = `${userKey}:${action}`;
    const count = (this.degradedStore.get(key) ?? 0) + 1;
    this.degradedStore.set(key, count);

    const resetAt = new Date(Date.now() + FREE_TIER_BUDGET.windowMs);

    if (count > FREE_TIER_BUDGET.degradedModeAllowance) {
      return this._blockedResult('degraded_allowance_exhausted', resetAt,
        "We're having a moment with our systems. You've used your session allowance — please try again shortly.");
    }

    return {
      allowed: true,
      remaining: {
        synthesis: FREE_TIER_BUDGET.degradedModeAllowance - count,
        render:    FREE_TIER_BUDGET.degradedModeAllowance - count,
        action:    FREE_TIER_BUDGET.degradedModeAllowance - count,
      },
      windowResetAt: resetAt,
    };
  }

  private _windowStart(): Date {
    const now = new Date();
    // Normalize to midnight UTC for clean 24h windows
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  private _formatReset(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  }

  private _blockedResult(reason: RateLimitReason, retryAfter: Date, friendlyMessage: string): RateLimitResult {
    return { allowed: false, reason, retryAfter, friendlyMessage };
  }

  private _unlimitedResult(): RateLimitResult {
    const far = new Date(Date.now() + FREE_TIER_BUDGET.windowMs);
    return { allowed: true, remaining: { synthesis: -1, render: -1, action: -1 }, windowResetAt: far };
  }
}
```

---

## Middleware Wrapper

```typescript
// server/middleware/rateLimitMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { RateLimiterBootstrap, MeterableAction } from '../lib/RateLimiterBootstrap';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const limiter = new RateLimiterBootstrap(supabase);

// Derive an anonymous user key from IP + day salt
// Never stored in plaintext — privacy-safe
function anonymousKey(req: Request): string {
  const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  const daySalt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return 'anon:' + createHash('sha256').update(ip + daySalt).digest('hex').slice(0, 16);
}

export function rateLimitSynthesis(req: Request, res: Response, next: NextFunction) {
  return applyLimit(req, res, next, 'synthesis');
}

export function rateLimitRender(req: Request, res: Response, next: NextFunction) {
  return applyLimit(req, res, next, 'render');
}

async function applyLimit(req: Request, res: Response, next: NextFunction, action: MeterableAction) {
  // @ts-expect-error — session is attached by authMiddleware upstream
  const tier = req.session?.tier ?? 'anonymous';

  // Paid users pass through immediately
  if (!['free', 'anonymous'].includes(tier)) return next();

  // @ts-expect-error
  const userId: string | undefined = req.session?.userId;
  const userKey = userId ? `user:${userId}` : anonymousKey(req);

  const result = await limiter.checkAndIncrement(userKey, action, tier as 'free' | 'anonymous');

  if (!result.allowed) {
    return res.status(429).json({
      error: 'rate_limited',
      reason: result.reason,
      friendlyMessage: result.friendlyMessage,
      retryAfter: result.retryAfter.toISOString(),
    });
  }

  // Attach remaining counts to response headers so the client can update its UI
  res.setHeader('X-RateLimit-Synthesis-Remaining', result.remaining.synthesis);
  res.setHeader('X-RateLimit-Render-Remaining',    result.remaining.render);
  res.setHeader('X-RateLimit-Action-Remaining',    result.remaining.action);
  res.setHeader('X-RateLimit-Reset',               result.windowResetAt.toISOString());

  next();
}
```

---

## Route Integration

Apply the middleware to exactly these routes. Do NOT apply globally — paid endpoints should never hit the limiter.

```typescript
// In server/api/gen-engine/artifacts.ts (or your Express router)
import { rateLimitSynthesis } from '../../middleware/rateLimitMiddleware';

router.post('/api/gen-engine/artifacts', rateLimitSynthesis, handleArtifacts);
router.post('/api/codex/forge',          rateLimitSynthesis, handleCodexForge);
router.post('/api/creation-corner/synthesize', rateLimitSynthesis, handleSynthesize);

// In server/api/inner-world routes
import { rateLimitRender } from '../../middleware/rateLimitMiddleware';

router.post('/api/inner-world/artifacts', rateLimitRender, handleInnerWorldArtifact);
```

---

## Client: `useRateLimit` Hook

```typescript
// client/src/hooks/useRateLimit.ts
// Reads rate limit headers from the last synthesis/render response
// and surfaces the remaining counts to the UI

import { useState, useCallback } from 'react';

export interface RateLimitState {
  synthesisRemaining: number | null;
  renderRemaining: number | null;
  windowResetAt: Date | null;
  isBlocked: boolean;
  blockReason: string | null;
  friendlyMessage: string | null;
}

const INITIAL: RateLimitState = {
  synthesisRemaining: null,
  renderRemaining: null,
  windowResetAt: null,
  isBlocked: false,
  blockReason: null,
  friendlyMessage: null,
};

export function useRateLimit() {
  const [state, setState] = useState<RateLimitState>(INITIAL);

  // Call this after every synthesis/render fetch() call
  const ingestResponse = useCallback((response: Response, body?: unknown) => {
    const synth  = response.headers.get('X-RateLimit-Synthesis-Remaining');
    const render = response.headers.get('X-RateLimit-Render-Remaining');
    const reset  = response.headers.get('X-RateLimit-Reset');

    if (response.status === 429) {
      const b = body as { friendlyMessage?: string; reason?: string } | undefined;
      setState(prev => ({
        ...prev,
        isBlocked: true,
        blockReason: b?.reason ?? 'rate_limited',
        friendlyMessage: b?.friendlyMessage ?? 'You've reached your daily limit. Come back tomorrow or unlock a plan.',
      }));
      return;
    }

    setState({
      synthesisRemaining: synth  != null ? parseInt(synth,  10) : null,
      renderRemaining:    render != null ? parseInt(render, 10) : null,
      windowResetAt:      reset  ? new Date(reset) : null,
      isBlocked: false,
      blockReason: null,
      friendlyMessage: null,
    });
  }, []);

  const clear = useCallback(() => setState(INITIAL), []);

  return { ...state, ingestResponse, clear };
}
```

---

## Client: Usage Indicator Component

A subtle, always-visible indicator in the Dynamic Inner World and Creation Corner for free users. **Never guilt-tripping — just honest.**

```typescript
// client/src/components/FreeTierUsageBar.tsx

import React from 'react';
import { useRateLimit } from '../hooks/useRateLimit';
import { useSession } from '../hooks/useSession';

interface Props {
  context: 'synthesis' | 'render';
}

export function FreeTierUsageBar({ context }: Props) {
  const { isPaid } = useSession();
  const { synthesisRemaining, renderRemaining, windowResetAt, isBlocked, friendlyMessage } = useRateLimit();

  // Paid users see nothing
  if (isPaid) return null;

  const remaining = context === 'synthesis' ? synthesisRemaining : renderRemaining;
  const cap       = context === 'synthesis' ? 3 : 5; // mirrors FREE_TIER_BUDGET

  // Still loading
  if (remaining === null) return null;

  if (isBlocked) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300 space-y-1">
        <p className="font-medium">You've used all your free sessions today.</p>
        {friendlyMessage && <p className="text-amber-400/70 text-xs">{friendlyMessage}</p>}
        {windowResetAt && (
          <p className="text-xs text-amber-400/50">
            Resets at {windowResetAt.toLocaleTimeString()}
          </p>
        )}
        <a
          href="/pricing"
          className="inline-block mt-2 text-xs font-semibold text-amber-300 underline underline-offset-2"
        >
          Unlock unlimited →
        </a>
      </div>
    );
  }

  const usedPct = ((cap - remaining) / cap) * 100;
  const colorClass = remaining <= 1
    ? 'bg-amber-500'
    : remaining <= 2
    ? 'bg-teal-500'
    : 'bg-teal-600';

  return (
    <div className="space-y-1.5 text-xs text-gray-400">
      <div className="flex justify-between">
        <span>{context === 'synthesis' ? 'Free syntheses' : 'Free renders'} today</span>
        <span className={remaining <= 1 ? 'text-amber-400 font-semibold' : ''}>
          {remaining} / {cap} remaining
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-gray-800">
        <div
          className={`h-1 rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${usedPct}%` }}
        />
      </div>
      {remaining <= 1 && (
        <a href="/pricing" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">
          Upgrade for unlimited →
        </a>
      )}
    </div>
  );
}
```

---

## DemoGate Integration

The existing `DemoGate.tsx` needs one new variant added and its `shouldGate` logic updated to read from `useRateLimit`:

```typescript
// Add to GATE_COPY in DemoGate.tsx:
'synthesis-limit': {
  title: "You've created your free artifact today",
  description:
    "You've used your complimentary synthesis sessions. Your Inner World holds what you built — come back tomorrow for more, or unlock a plan to synthesize without limits.",
  cta: 'Unlock Unlimited Synthesis',
  requiredTier: 'core',
},
'render-limit': {
  title: "Your free renders are used up today",
  description:
    "You've previewed your artifacts in the Inner World. To keep building and rendering without a daily ceiling, GestaltView Core has you.",
  cta: 'Unlock the Inner World',
  requiredTier: 'core',
},
```

```typescript
// In DynamicInnerWorldPage.tsx and CreationCornerPage.tsx:
const { isBlocked, blockReason } = useRateLimit();

<DemoGate
  variant={blockReason === 'render_daily_cap' ? 'render-limit' : 'synthesis-limit'}
  overlay
  isActive={isBlocked && !isPaid}
>
  {/* the synthesis/render UI */}
</DemoGate>
```

---

## Session State Extension

Add rate limit data to the `/api/session/state` response so the client can pre-populate the usage bar on page load (without waiting for a synthesis call):

```typescript
// server/api/session/state.ts — extend response shape
import { limiter } from '../../middleware/rateLimitMiddleware';

// Inside the handler, after resolving userId/tier:
const peek = await limiter.peek(userKey);

return res.json({
  tier,
  queryCount,
  queryLimit,
  remaining,
  isLimited,
  userId,
  // NEW:
  rateLimits: peek ?? null,
});
```

Extend `SessionState` in `useSession.ts`:

```typescript
export interface SessionState {
  // ... existing fields
  rateLimits?: {
    synthesis: number;
    render:    number;
    action:    number;
  } | null;
}
```

---

## Supabase Migration Name

```
20260612_add_rate_limit_buckets
```

Run via Supabase MCP `apply_migration` before deploying the server changes.

---

## Environment Variables Required

No new secrets needed. The limiter uses the existing `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to client). Confirm this variable is present in Vercel production environment before deploying.

---

## Testing Checklist

- [ ] `synthesisPerDay` cap blocks correctly on the 4th call within the same UTC day
- [ ] `rendersPerDay` cap is independent — exhausting renders does not block synthesis
- [ ] `totalActionsPerDay` hard ceiling triggers before individual caps if hit first
- [ ] Paid tier (`core`, `pro`, `enterprise`) bypasses all checks — zero DB writes
- [ ] Anonymous users are keyed by hashed IP — no PII stored
- [ ] Degraded mode (Supabase down) fails open with `degradedModeAllowance` calls, then blocks
- [ ] `X-RateLimit-*` headers present on allowed responses
- [ ] 429 response body includes `friendlyMessage` and `retryAfter`
- [ ] `FreeTierUsageBar` renders correctly at 3/3, 2/3, 1/3, 0/3 remaining
- [ ] `DemoGate` overlay fires when `isBlocked === true` on relevant pages
- [ ] Window resets at midnight UTC — not 24h rolling from first action

---

## Open Questions for Keith

1. **Anonymous vs. signed-in free:** Should anonymous users get the same `synthesisPerDay: 3` as signed-in free users, or a lower number (e.g., 1) to encourage account creation? Current spec treats them equally.

2. **Carry-over:** If a free user only uses 1 synthesis today, do unused credits carry to tomorrow? Current spec: **no carry-over** — windows reset daily. Simpler to reason about and easier to explain.

3. **Indiegogo backer override:** Should early backers who are on a "free" tier by billing status get a higher limit as a goodwill gesture? If yes, add a `backer` tier to `UserTier` in `useSession.ts` and exempt it in the middleware.

4. **Abuse vector — VPN IP rotation:** Hashed IP keys are effective for casual use but not for determined bad actors. If abuse becomes real, add a `device_fingerprint` column to `rate_limit_buckets` as a secondary key. Not worth the complexity now.

