# Operation Render Dependency Audit

Date: 2026-07-08

This is the first dependency-health ledger required by the Operation Render Holistic Upgrade. Versions are taken from the current `package.json`; latest-version checks were not performed in this offline/local implementation slice, so the follow-up action is explicit.

| Runtime dependency | Actual import usage | Current version | Latest checked version | Risk | Action |
| --- | --- | --- | --- | --- | --- |
| `@supabase/supabase-js` | API/client Supabase access throughout runtime | `^2.49.8` | Not checked in this slice | Core auth/data path; do not replace casually | Keep; audit with `pnpm audit --prod` before dependency bump |
| `@supabase/server` | Server-side Supabase helpers | `^1.2.0` | Not checked in this slice | Server-only dependency must stay out of frontend bundles | Keep; verify bundle boundaries during build |
| `wouter` | Client routing links/pages | `^3.7.1` | Not checked in this slice | Duplicate dependency/devDependency drift should be avoided | Keep one runtime dependency; remove duplicate only after lockfile review |
| `@babylonjs/core`, `@babylonjs/loaders`, `@babylonjs/materials` | 3D/rendering experiments and artifact surfaces | `^8.40.1` | Not checked in this slice | Heavy client payload on degraded/mobile mode | Keep optional; gate heavy scenes behind degraded/low-bandwidth mode |
| `three`, `@react-three/fiber`, `@react-three/drei` | 3D/runtime render surfaces | `^0.181.2`, `^9.4.0`, `^10.7.7` | Not checked in this slice | Heavy visual layer; mobile performance risk | Keep optional; lazy-load where possible |
| `@vitejs/plugin-react` | Vite React build plugin | `latest` | Not checked in this slice | `latest` reduces reproducibility | Pin after lockfile/deploy verification |
| `typescript` | Build/typecheck | `^5.9.3` | Not checked in this slice | Build compatibility with React/Vite | Keep; verify with `tsc --noEmit` |
| `framer-motion` | Existing glass/neon motion and spinner effects | `^11.18.2` | Not checked in this slice | Motion accessibility and bundle size | Keep; reduced-motion guards added in this slice |
| `fflate` | Zip/export support | `^0.8.3` | Not checked in this slice | Needed for field-continuity export path | Keep |
| `zod` | Shared runtime schemas/contracts | `^4.1.12` | Not checked in this slice | Shared contract dependency | Keep |

## 2026-07-08 audit run

Initial command: `pnpm audit --prod`

Initial result: failed with **35 production vulnerabilities** reported: **3 critical**, **16 high**, **15 moderate**, and **1 low**. The highest-risk chains were concentrated in unused or stale dependency paths:

- `sql > lodash` (`lodash` prototype-pollution advisories, including critical/high/moderate findings).
- `psql > winston > request > form-data/qs/hawk/mime` (deprecated `request` chain with critical/high findings).
- `psql > yaml-config > js-yaml/argparse/underscore` (critical/high/moderate YAML/underscore findings).
- `@prisma/client > prisma > @prisma/dev > @hono/node-server` (moderate serveStatic bypass).
- `@sentry/node > @opentelemetry/core` (moderate unbounded memory allocation).
- `braintrust > esbuild` (low Windows dev-server arbitrary file-read advisory).

Remediation completed in the dependency-hardening follow-up:

- Removed unused/stale direct packages: `psql`, `sql`, `supabase-js`, `types`, `add`, and `braintrust`.
- Preserved Braintrust tracing as a fail-soft optional runtime path via dynamic SDK loading instead of requiring the vulnerable SDK in the production dependency graph.
- Updated build/audit tooling dependencies and lockfiles, including `@vercel/node`, `@vitejs/plugin-react`, `vite`, `pnpm`, and patched override pins for vulnerable transitive packages.
- Final audit state: `npm audit`, `npm audit --omit=dev`, `pnpm audit`, and `pnpm audit --prod` all report zero known vulnerabilities.

## Follow-up checks

- Run `pnpm audit --prod` and document any remaining critical/high vulnerabilities with mitigation.
- Confirm whether `@vitejs/plugin-react` should be pinned instead of using `latest`.
- Verify server-only packages are not entering the frontend bundle.
- Review duplicated or stale visual packages only after the Operation Render UI slices are complete.
