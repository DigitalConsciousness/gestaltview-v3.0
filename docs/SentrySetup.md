# Sentry setup baseline and Vite applicability map

**Last updated:** 2026-06-25

## Why this document exists

An operator request referenced Sentry's **Next.js Webpack** setup guidance. Per the `sentry-nextjs-sdk` skill workflow, we first ran detection to determine whether this repository is actually a Next.js runtime before applying that setup.

## Phase 1 detection snapshot (run locally)

From repository root:

```bash
cat package.json | grep -E '"next"|"@sentry/'
rg --files | rg 'next\.config\.(ts|js|mjs)$'
rg -n 'global-error\.tsx|_error\.tsx' agent_trainer client server api
```

### Detection result

- `gestaltview-v2` root runtime is **Vite + React**, not Next.js.
- No root `next.config.*` file is present.
- No local App Router / Pages Router error-boundary files (`global-error.tsx` / `_error.tsx`) were found.
- Therefore, Next.js-specific Webpack setup (for `@sentry/nextjs`) is **not directly applicable** in this repository's active runtime.

## Applicability boundary

- Use the Sentry Next.js Webpack guide **only** in repositories that actually run Next.js with Webpack.
- Do **not** apply Webpack-only flags (`webpack.excludeServerRoutes`, `webpack.autoInstrument*`, `webpack.reactComponentAnnotation`, `webpack.unstable_sentryWebpackPluginOptions`) to this Vite runtime.
- For this repository, use a Vite-compatible Sentry path (`@sentry/react` bootstrap and optional Vite build plugin in CI).
- The live client bootstrap is already in `client/src/main.tsx`, which calls `initClientSentry()` before React renders.
- `client/src/lib/sentry.ts` now initializes the browser SDK with the provided DSN fallback and console log capture for drain-log use.

## Action plan by integrated repository

| Repository | Current action | Notes |
|---|---|---|
| `gestaltview-v2` (this repo) | Client bootstrap live | Vite entrypoint initializes browser Sentry and can be overridden by `VITE_SENTRY_DSN` |
| `GestaltView-Official-Compendium` | Mirror state note only | Documentation handoff; no runtime instrumentation here |
| `Insight-Bot` | Pending direct repo inspection | Apply Next.js Webpack setup only if Next.js is confirmed |
| `SymbioCoder` | Pending direct repo inspection | Apply Next.js Webpack setup only if Next.js is confirmed |
| `Resume Rockstar` | Pending direct repo inspection | Prior docs suggest possible Next.js frontend; verify before changes |
| `GAICE` | Pending direct repo inspection | Apply Next.js Webpack setup only if Next.js is confirmed |

## Skill-aligned Next.js checklist (for repos where Next.js is confirmed)

1. Install SDK: `npm install @sentry/nextjs --save`.
2. Add runtime files:
   - `instrumentation-client.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`
   - `instrumentation.ts`
3. Wrap `next.config.*` with `withSentryConfig(...)`.
4. Add `app/global-error.tsx` (App Router) or `pages/_error.tsx` (Pages Router).
5. Configure source-map upload token (`SENTRY_AUTH_TOKEN`) for builds.
6. Verify client/server/edge event capture in Sentry dashboard.

## Recommendations and next steps

1. **This repo:** keep the DSN in `VITE_SENTRY_DSN` when deploying so the fallback can stay local-only safety instead of the canonical source of truth.
2. **Cross-repo:** run the same detection commands inside each integrated repo before applying Next.js guidance.
3. **Compendium:** publish a short "applicability matrix" so future sessions avoid bundler/runtime mismatch.
