# GestaltView App Runtime skill — layered audit receipt

## Audit frame

- **Target:** `.agents/skills/gestaltview-app-runtime/SKILL.md` and its translation of the live GestaltView v3 browser runtime.
- **Decision this informs:** Whether the runtime skill can safely guide current routed UI work, and what refinement is warranted.
- **Scope and time boundary:** Repository-local evidence inspected on 2026-07-28; no preview or production deployment was exercised.
- **Current-state sources:** `AGENTS.md`, `package.json`, `client/src/App.tsx`, `client/src/contexts/AuthContext.tsx`, `api/_lib/llmRouter.ts`, `api/billy.ts`, `shared/billy/diagnostics.ts`, and `docs/CurrentState.md`.
- **Origin and lineage sources:** `README.md`, `docs/ArchitecturalStructure.md`, the pre-refinement runtime skill, and the consolidated Vision Blueprint acceptance checklist.
- **Unavailable evidence:** Production browser traces, production Supabase state, and end-user outcome evidence.
- **Assumption:** “Use these skills on the Runtime” authorizes a repo-local audit and refinement of the canonical runtime operating skill, not a production mutation.

## Supported orientation

The prior skill correctly identified the React/Vite routed application and its client/API/Supabase adjacency, but it was **modeled guidance**, not a sufficiently bounded runtime contract. It named the repository as `gestaltview-v2`, loaded broad directories by default, privileged Billy files for unrelated runtime work, and did not require evidence to distinguish a rendered UI, executed request, durable result, or reopenable state. The live source supports revising those instructions; external operational outcomes remain unverified.

## Thread findings

### Repository and routing identity

- **Source fact / locator:** The repository and user instruction identify GestaltView v3, while the prior skill description said `gestaltview-v2`; `client/src/App.tsx` is the current Wouter route registry and `package.json` defines React 19/Vite commands.
- **Originating need / invariant:** Runtime work must begin at the user's actual route without confusing a historical repository label for current authority.
- **Current behavior and evidence:** The prior skill pointed to the correct route file but carried stale naming. Evidence is **direct artifact evidence**; the skill was **integrated** in the catalog but its repository identity had drifted.
- **Alignment / tension:** Route ownership aligned; current-version language did not.
- **Authority:** **Revise** the scoped skill language while preserving route-first orientation.
- **Next evidence state:** Use the revised skill on a future runtime patch and confirm it selects the direct route/import path before broader context.

### Context selection and ownership boundaries

- **Source fact / locator:** `client/src/App.tsx` registers many independent product routes; `api/_lib/llmRouter.ts` serves multiple handlers, while Billy-specific guide/prompt files are only one runtime lane.
- **Originating need / invariant:** Give collaborators enough context to trace a user path without saturating every task with Billy or entire component/page directories.
- **Current behavior and evidence:** The prior “Inspect first” list loaded two whole directories and Billy-specific files for all runtime tasks. This is **direct artifact evidence** of a **modeled** instruction, not evidence that every agent actually over-loaded context.
- **Alignment / tension:** The files are relevant to some work, but the unconditional sequence obscured ownership and specialist routing.
- **Authority:** **Bridge** with progressive target-route → direct import → crossed-boundary inspection and explicit non-triggers.
- **Next evidence state:** Observe context selection on representative UI-only, auth, Billy, and schema-crossing requests.

### Operational proof and user-visible claims

- **Source fact / locator:** `docs/CurrentState.md` already distinguishes intercepted browser proof from real Supabase/storage/RLS proof in the render pipeline handoff; the prior skill only required routes, components, and API wiring to “match.”
- **Originating need / invariant:** A working-looking surface must not imply execution, persistence, or external success without the corresponding receipt.
- **Current behavior and evidence:** The older done condition did not separate exists, executes, persists, reopens, and behaves. Evidence is **governed repository evidence plus direct skill text**; runtime outcome remains **not evaluated** in this audit.
- **Alignment / tension:** The old workflow requested meaningful validation, but lacked evidence classes and could permit an intercepted E2E to overstate production capability.
- **Authority:** **Revise** the output and done contracts; **hold** only external success claims when production evidence is absent.
- **Next evidence state:** A future visible-flow run should report unit/build/browser evidence separately and label data as mocked, local, preview, or production.

### Initiative, safety, and continuity

- **Source fact / locator:** The prior skill said to update runtime/docs together but did not state authority for deployments, destructive migrations, credentials, disagreement, or a recoverable learning receipt.
- **Originating need / invariant:** Enable useful reversible work while preserving user decision rights, security, provenance, and next-cycle continuity.
- **Current behavior and evidence:** These boundaries were **absent from the modeled contract**; this does not establish unsafe past behavior.
- **Authority:** **Bridge** with explicit repo-local initiative, scoped holds/blocks, and Known / Attempted / Observed / Changed receipts.
- **Next evidence state:** Confirm a later run continues local diagnosis when production authority is missing, while holding only the consequential external action.

## Open decision field

- **What is here:** A large routed React/Vite runtime, explicit auth/provider/data boundaries, and a canonical runtime skill that had correct anchors but an underspecified operating contract.
- **What it is reaching toward:** Evidence-calibrated work from route entry through recoverable user outcome.
- **What is supported:** Current source structure and the need for narrower progressive inspection, specialist routing, evidence classes, initiative limits, and continuity receipts.
- **What remains open:** Whether the refined skill improves behavior across repeated real runtime tasks; production outcomes were not tested.
- **What must be preserved:** Route-first live-code authority, blueprint invariants when applicable, focused validation, and durable CurrentState handoff.
- **Recommended foothold:** Install/catalog both new meta-skills, refine the runtime skill now, then forward-test it on the next representative runtime change.
- **Meaningful alternative:** Keep the runtime skill unchanged and use the audit only as guidance; this avoids contract churn but preserves the identified drift and ambiguity.
- **Decision holder:** The repository owner retains production, deployment, data, and long-term skill-policy decisions.

## Known / Attempted / Observed / Changed

- **Known:** The two user-provided archives, current skill catalog, runtime route registry, package scripts, auth boundary, LLM router, and CurrentState evidence language were inspected.
- **Attempted:** Applied the layered audit's faithful-translation and demonstrated-operation passes to the canonical runtime skill, then applied the refinement collaboration-contract checks.
- **Observed:** The package was structurally valid and useful but stale in repository naming, overly broad in default context, Billy-biased, and weak on proof/authority/continuity distinctions.
- **Changed:** Refined the runtime skill, installed both new skills as canonical catalog entries, and recorded this receipt. Confidence is high for source-level findings and intentionally absent for untested production outcomes.
