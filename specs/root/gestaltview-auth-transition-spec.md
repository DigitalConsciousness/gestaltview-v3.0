# GestaltView Auth Transition Spec

## 1. Purpose
Replace the current brittle session/auth lookup path with a minimal, single-user login flow that matches the actual operating reality of GestaltView: one primary operator, local administrative access, and no need for multi-user identity orchestration yet.

## 2. Problem Statement
The existing logs show repeated 401 responses driven by auth lookup timeouts rather than application logic errors. The current design adds latency, failure modes, and cognitive overhead without delivering meaningful value for the present N=1 usage pattern.

## 3. Goals
- Provide a fast, reliable login gate for Keith only.
- Eliminate remote auth dependencies and auth lookup timeouts.
- Preserve a clear path to future multi-user auth if needed.
- Reduce 401 noise and stop trainer/session routes from fighting the auth layer.
- Keep implementation small, explicit, and easy to reason about.

## 4. Non-Goals
- No OAuth providers.
- No magic links.
- No multi-tenant RBAC system.
- No invite flows.
- No session history, audit console, or user directory for now.
- No redesign of trainer business logic beyond auth touchpoints.

## 5. Recommended Target Architecture
### 5.1 Overview
Use a single password-protected login page backed by a server-side password hash stored in an environment variable. On success, issue an HTTP-only signed cookie that represents a valid admin session. Protect all private routes with lightweight middleware that checks the cookie locally.

### 5.2 Core Components
- `/login` page: simple password entry.
- `/api/login`: verifies password and sets session cookie.
- `/api/logout`: clears session cookie.
- `middleware.ts`: guards protected pages and API routes.
- `auth.ts` or equivalent helper: centralizes cookie verification and session shape.
- Protected app routes: trainer, session, dashboard, memory, and any admin surfaces.

### 5.3 Session Model
Session can be as small as:
```ts
{
  userId: "keith",
  role: "admin",
  issuedAt: number,
  expiresAt: number
}
```
The cookie should be HTTP-only, secure in production, SameSite=Lax or Strict depending on UX needs, and signed so it cannot be forged.

## 6. Security Requirements
- Password must never be stored in plaintext.
- Store only a hash in `ADMIN_PASSWORD_HASH`.
- Store signing key in `SESSION_SECRET`.
- Session cookie must be HTTP-only.
- Session cookie must be Secure in production.
- Session cookie must have an expiration.
- All auth checks must happen server-side.
- Login failures should not leak whether the password is close or incorrect.
- Keep the auth surface minimal enough to inspect quickly during debugging.

## 7. Route Behavior
### 7.1 Public Routes
- `/login`
- `/api/login`
- `/api/logout`
- any static marketing pages if they exist

### 7.2 Protected Routes
- app shell routes
- `/api/session/*`
- `/api/trainer/*`
- any dashboard, memory, personhood, experiments, queue-health, and packaging routes

### 7.3 Failure Behavior
- Unauthenticated page requests redirect to `/login`.
- Unauthenticated API requests return 401 with a concise JSON body.
- Auth infrastructure errors should return a distinct 5xx response, not 401.

## 8. Implementation Plan
### Phase 1: Stabilize the boundary
- Identify all existing session/auth helpers.
- Remove any remote auth lookup or timeout-based identity resolution from the critical path.
- Replace it with a local cookie verification helper.
- Make all protected routes depend on the new helper only.

### Phase 2: Build the login flow
- Add `/login` UI.
- Add `/api/login` with password verification.
- Add `/api/logout`.
- Add signed cookie issuance and deletion.
- Confirm the user lands in the app immediately after login.

### Phase 3: Wrap the app
- Add middleware that checks the cookie before protected pages and API routes.
- Redirect browsers to `/login`.
- Return 401 JSON for API calls.
- Remove any redundant per-route auth lookups.

### Phase 4: Clean up polling and session noise
- Gate trainer polling behind known-good session state.
- Stop background requests from firing before auth is confirmed.
- Replace auth timeout logs with a small number of meaningful, high-signal events.

### Phase 5: Future-proofing
- Keep a tiny auth interface abstraction so a future multi-user provider can be swapped in.
- Avoid spreading auth assumptions through unrelated business logic.

## 9. Acceptance Criteria
- Keith can log in with one password and access the app.
- Page reloads preserve access until cookie expiry or logout.
- Protected routes redirect or return 401 when logged out.
- No route depends on a remote auth lookup to determine current user.
- 401 storms caused by auth lookup timeouts disappear.
- Trainer and session routes no longer spam auth-related warnings under normal use.
- Logout reliably clears access.

## 10. Observability
Track these metrics after rollout:
- number of login attempts
- number of successful logins
- number of failed logins
- number of unauthenticated redirects
- number of auth-related 5xx errors
- number of 401s on protected routes
- number of session lookup calls per page load

## 11. Rollout Strategy
- Implement behind a branch or feature flag if possible.
- Validate login/logout on local and production-like environments.
- Verify protected routes work with refreshed pages and direct navigation.
- Confirm cron/keep-alive routes remain public and unaffected.
- Remove old auth code only after the new path is stable.

## 12. Risks
- If middleware is too broad, it may accidentally block public assets or health checks.
- If the session secret is mishandled, cookies could become invalid across deployments.
- If the cookie scope is wrong, app navigation may appear broken even though login succeeded.
- If old auth checks remain in parallel, the system may still throw confusing 401s.

## 13. Recommended Design Choice
For the current phase, the best choice is a single-password, cookie-based login with local verification only. It preserves enough security for a solo founder environment while removing the failure-prone complexity that is currently hurting you.
