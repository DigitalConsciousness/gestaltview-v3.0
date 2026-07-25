# ChatGPT Deep Research Prompt: Supabase Free-Tier Workarounds for GestaltView

Use this prompt with ChatGPT Deep Research or another research-capable model.

---

## Research Task

I need an in-depth, source-cited technical research report on practical workarounds for keeping a Vercel-hosted React/TypeScript application reliable while staying on the Supabase free tier for now.

Current date: April 21, 2026.

Project context:

- App: GestaltView v2 runtime layer.
- Hosting: Vercel.
- Backend style: Vercel serverless API routes plus direct Supabase REST/Supabase JS usage.
- Database/auth provider: Supabase free tier.
- Current pain points:
  - Cold starts or paused/inactive project behavior causing slow or failed API calls.
  - Agent Trainer dashboard intermittently showing browser `Failed to fetch`, especially around trainer sources and persistence APIs.
  - Founder persistence saves can fail or become unreliable.
  - Magic link or verification emails are not reliably arriving.
  - Upgrading the Supabase tier is not possible yet.
- Important runtime needs:
  - Founder/admin login and control-plane access.
  - Reliable founder context persistence for Billy.
  - Agent Trainer source selection/recommendations.
  - Degraded-mode operation when Supabase is slow or unavailable.
  - Low-maintenance setup suitable for a solo founder.

## Research Questions

1. What are the current Supabase free-tier limits and behaviors that can affect reliability?
   - Include project pausing, compute limits, rate limits, auth email constraints, database connection limits, edge/API limits, and any relevant changes as of April 2026.

2. What are legitimate keep-alive or warm-up strategies that comply with Supabase terms?
   - Compare Vercel Cron, GitHub Actions schedules, external uptime monitors, and lightweight app-level health checks.
   - Identify what endpoint patterns are least wasteful.
   - Explain what not to do.

3. What application-level resilience patterns should be implemented?
   - Request timeouts.
   - Retries with backoff and jitter.
   - Circuit breakers.
   - Stale-while-revalidate cache.
   - Local fallback data for read-heavy control-plane screens.
   - Write queues or outbox patterns for persistence writes.
   - Idempotency keys for retries.
   - User-facing degraded-mode status.

4. What should be cached where?
   - Browser localStorage/sessionStorage.
   - Vercel serverless in-memory cache limitations.
   - Vercel KV or other low-cost external stores.
   - Static JSON snapshots committed to the repo.
   - Supabase materialized views/RPC optimization.

5. What are the best workarounds for unreliable Supabase Auth email delivery on a free-tier project?
   - Custom SMTP options.
   - Resend, Postmark, SendGrid, or other transactional email services.
   - Password login fallback.
   - Admin-created or allowlisted founder account bootstrap.
   - Security tradeoffs and minimum safe implementation.

6. How should a Vercel app structure API calls to reduce Supabase failure impact?
   - Server-side service-role API routes vs browser direct Supabase calls.
   - RLS implications.
   - CORS pitfalls with preview deployments.
   - Using one same-origin API surface to avoid cross-origin `Failed to fetch`.
   - Recommended timeout budgets for serverless functions.

7. What are possible temporary alternatives for persistence without replacing Supabase entirely?
   - Append-only JSON files in a private GitHub repo.
   - Vercel Blob.
   - Vercel KV/Redis.
   - Neon/Supabase hybrid.
   - SQLite/libSQL/Turso.
   - IndexedDB/local-first queue with later sync.
   - Compare effort, security, reliability, and cost.

8. What specific mitigations fit these GestaltView flows?
   - Founder context save/read.
   - Billy session continuity.
   - Agent Trainer study-source listing/recommendations.
   - Manual source upload fallback.
   - Admin dashboard health/status panel.
   - Login and founder bootstrap.

## Deliverable Format

Please produce:

1. Executive summary with the top 5 recommended workarounds.
2. A constraints table for Supabase free tier with citations.
3. A prioritized implementation plan:
   - Do now, under 1 day.
   - Do next, 1-3 days.
   - Do later, when budget permits.
4. Architecture recommendations for Vercel + Supabase free tier.
5. Auth/email reliability recommendations.
6. Specific code-level patterns in TypeScript pseudocode where useful.
7. Risk table covering data loss, security, privacy, maintenance load, and user experience.
8. Sources with links, prioritizing official Supabase and Vercel documentation.

## Constraints

- Do not assume Supabase paid upgrade is available.
- Prefer low-cost or free options.
- Prefer minimal operational overhead for a solo founder.
- Avoid workarounds that violate provider terms or create abusive traffic.
- Keep user privacy and founder/admin security central.
- Be explicit about what is confirmed from sources versus inferred.
