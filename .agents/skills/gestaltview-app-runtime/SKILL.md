---
name: gestaltview-app-runtime
description: Use when changing or diagnosing GestaltView v3 routed React UI, component behavior, browser-to-API wiring, auth-aware flows, deployment behavior, or user-visible runtime documentation.
---

# GestaltView App Runtime

Last reviewed: 2026-07-28

Own the browser-visible application boundary. Preserve the user's path from route entry through UI state, API execution, durable result, and recovery; do not treat a rendered component or declared endpoint as proof that the complete path works.

## Collaboration contract

- **Responsibility:** Build, debug, and document routed React/Vite behavior and its immediate client/API contracts.
- **Non-trigger:** Route provider internals to `gestaltview-ai-routing`, database or RLS changes to `gestaltview-schema-supabase`, shared payload evolution to `gestaltview-schema-contracts`, and multi-domain product decisions to `gestaltview-suite-orchestrator`.
- **Source authority:** Trust current code and reproducible traces first, `docs/CurrentState.md` for durable handoff, and blueprint material for intended room/module invariants. Never let an older narrative overrule the live path.
- **Initiative:** Inspect and make reversible repo-local changes without micromanagement. Propose, rather than apply, production data changes, deployments, credential changes, purchases, or destructive migrations unless explicitly authorized.
- **Disagreement:** Challenge unsupported capability claims, hidden auth assumptions, unsafe provenance loss, and UI states that imply persistence or success before an execution receipt exists.
- **Output:** Leave a coherent patch or diagnosis, focused validation evidence, explicit limitations, and a continuity receipt when repository reality changes.

## Read progressively

1. Start with `AGENTS.md`, the target route/component, its direct imports, and the matching route in `client/src/App.tsx`.
2. Read `package.json` and the narrow test surface needed to reproduce or validate the behavior.
3. If the path crosses a boundary, trace the exact client call into `api/`, `server/`, `shared/`, or `supabase/`; load the matching specialist skill rather than the whole subsystem.
4. Read the relevant room/module contract in `GestaltView_Vision_Blueprint_Package/` only when product intention or acceptance behavior is at issue.
5. Consult `docs/CurrentState.md` for recent evidence and update it only when the operating truth or workflow changes.

## Runtime evidence path

For each material behavior, distinguish:

- **Exists:** route, component, handler, contract, or schema is present;
- **Executes:** the browser request reaches a real local or approved external boundary;
- **Persists:** a durable state change or artifact receipt remains;
- **Reopens:** the user can retrieve, review, retry, or resume it;
- **Behaves:** an observable result matches the intended experience.

Label mocks, intercepted E2E responses, local previews, and declarations as such. They can prove UI contracts, but not production persistence, provider behavior, storage bytes, or RLS.

## Workflow

1. Frame the user path, intended decision, affected boundary, and evidence currently available.
2. Reproduce the smallest failing or missing behavior before editing; for new behavior, establish an executable expectation first.
3. Preserve route aliases, auth loading states, decision ownership, provenance, and reversible recovery unless the task explicitly changes them.
4. Make the smallest coherent change at the owning boundary. Keep shared contracts in `shared/` instead of duplicating types.
5. Validate in layers: focused unit/integration test, TypeScript/build check, then Playwright for visible route, auth, or browser-flow changes.
6. For a perceptible UI change, capture a screenshot. State whether it uses mocked, local, preview, or production data.
7. Record **Known / Attempted / Observed / Changed** in `docs/CurrentState.md` when the run changes durable repo truth; include exact commands, limitations, and the next evidence gate.

## Holds and blocks

- **Hold** only the consequential action when credentials, consent, production authority, provenance, reversibility, or critical evidence is missing. Continue safe local investigation.
- **Block** deception, fabricated success, destructive provenance loss, serious security exposure, dignity violations, or unsafe irreversible action.
- Do not block experimentation merely because a feature is novel, partial, or not externally evaluated.

## Compose with

- `gestaltview-codex` for system-level orientation and change-scope analysis.
- `gestaltview-vision-blueprint` for room, module, governance, and experience invariants.
- `gestaltview-billy-api` or `gestaltview-ai-routing` for Billy/provider execution.
- `gestaltview-schema-contracts` and `gestaltview-schema-supabase` for payload, persistence, auth, and RLS boundaries.
- `gestaltview-workflow-operations` for validation and handoff discipline.

## Done when

- The affected route and direct client/API path agree at the current source boundary.
- Evidence labels distinguish present code, local execution, intercepted tests, durable persistence, and external operation.
- Auth, loading, failure, retry, and reopen behavior are handled where relevant.
- Focused checks pass, broader limitations are named, and visible changes have an appropriately labeled screenshot.
- The next cycle can recover what was known, attempted, observed, and changed without rediscovering the same path.
