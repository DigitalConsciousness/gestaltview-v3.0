# Repository Guidelines

## Project Structure & Module Organization
`client/src/` contains the React 19 + Vite frontend, with routes in `pages/`, reusable UI in `components/`, shared client logic in `lib/`, and product-specific work in `features/` and `modules/`. `api/` holds Vercel-style endpoints, `server/` and `worker/` contain backend runtime code, and `shared/` is the contract layer used across client and server. Tests live in `tests/` with end-to-end coverage under `tests/e2e/`. Operational assets live in `scripts/`, `tools/`, `docs/`, and `supabase/`. Treat `embodiment_profiles/*.embodiment.json` as canonical sources and regenerate derived artifacts after edits.

## Build, Test, and Development Commands
Use `pnpm`; `pnpm-lock.yaml` is the lockfile of record.

- `pnpm dev` starts the Vite app on port 5173.
- `pnpm run server` runs the Node/TS server entrypoint.
- `pnpm run build` performs TypeScript checks and a production Vite build.
- `pnpm test` runs the Vitest suite.
- `pnpm test:coverage` generates V8 coverage for `config/`, `shared/`, and `server/`.
- `pnpm exec playwright test` runs browser E2E specs from `tests/e2e/`.
- `pnpm run validate:embodiment` and `pnpm run embodiments:build` validate and regenerate embodiment artifacts.

## Coding Style & Naming Conventions
TypeScript is strict-mode ESM. Follow existing 2-space indentation and double-quoted imports. Use `PascalCase` for React components and pages, `camelCase` for utilities, and `useX` for hooks. Keep shared contracts in `shared/` instead of duplicating types across runtimes. Path aliases such as `@/` and `@shared/` are configured in `tsconfig.json`. Prettier is installed; match existing formatting before submitting.

## Testing Guidelines
Unit and integration tests use Vitest and are typically named `*.test.ts`; Playwright browser specs use `tests/e2e/*.spec.ts`. Keep new tests close to the behavior they protect and prefer focused coverage for routing, profile pipelines, and shared runtime logic. Run `pnpm test` before opening a PR, and add `pnpm exec playwright test` for UI, route, or auth changes.

## Commit & Pull Request Guidelines
Recent history leans toward concise, imperative subjects, often with Conventional Commit prefixes like `feat:`. Keep commits scoped and descriptive. PRs should explain user impact, note any schema, embodiment, or environment changes, and include screenshots for visible UI updates. When repo behavior or operator workflow changes, update `docs/CurrentState.md` in the same branch.
