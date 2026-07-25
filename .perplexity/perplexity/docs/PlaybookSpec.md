# Playbook Spec — GestaltView v2

> **Repo:** `DigitalConsciousness/gestaltview-v2.0`
> **Status:** Draft v1
> **Intended audience:** founder, collaborators, coding agents, future operators
> **Primary goal:** define how work should move through this repository without drift, breakage, or context loss

---

## 1. Purpose

This playbook defines the operating contract for `gestaltview-v2.0`.

It exists to make four things true at the same time:

1. The public runtime stays stable while moving quickly.
2. Billy, retrieval, auth, pricing, diligence, and trainer surfaces evolve without silent drift.
3. Documentation and skills stay synchronized with runtime truth.
4. Cross-repository work is explicitly handed off instead of implied.

This repository is not just a website. It is the production-facing runtime layer for GestaltView, including the public app surface, Billy interaction paths, serverless API routes, Supabase-backed state, and adjacent operational tooling.

---

## 2. What this repository owns

`gestaltview-v2.0` owns the live runtime and operator-facing implementation layer for:

- public React + Vite application routes and UX
- Billy runtime surfaces and related API orchestration
- authenticated account and dashboard flows
- pricing, Stripe, and session-tier behavior
- diligence and exhibit access surfaces
- voice proxy paths and local voice-adjacent helpers
- scaffold, inner-world, sanctuary, and creation-corner capture/synthesis surfaces
- gate, workbook, workspaces, documents, consciousness, and persona-routing surfaces
- the new `/agent-trainer` control plane and trainer runtime slice
- repo-local scripts, manifests, docs, and skills used to operate the system

This repository does **not** automatically own canonical long-memory corpus maintenance for the wider ecosystem. When work belongs in another GestaltView repository, the handoff must be explicit.

---

## 3. Source-of-truth hierarchy

When files disagree, use this precedence order:

1. **Live runtime code**
   - `client/src/**`
   - `api/**`
   - `shared/**`
   - `supabase/**`
   - `vite.config.ts`
   - `vercel.json`
2. **Current state log**
   - `docs/CurrentState.md`
3. **Architecture and workflow docs**
   - `docs/ArchitecturalStructure.md`
   - `docs/AIFlow.md`
   - `docs/APIFlow.md`
   - `docs/Manifest.md`
   - `docs/SymbioticWorkflow.md`
   - `docs/Workflows.md`
4. **Repository README and agent instructions**
   - `README.md`
   - `COLAB.md`
5. **Generated or archival docs**
   - wiki exports
   - generated manifests
   - historical snapshots

### Rule
If a doc conflicts with code, update the doc in the same change set or record the mismatch in `docs/CurrentState.md`.

---

## 4. Runtime map

### 4.1 Client lane
Owns route surfaces, UX, theme, navigation, Billy UI, exhibit pages, dashboard/auth pages, and trainer control plane UI.

Primary anchors:
- `client/src/App.tsx`
- `client/src/components/**`
- `client/src/pages/**`
- `client/src/features/agent-trainer/**`
- `client/src/lib/**`
- `client/src/contexts/**`

### 4.2 API lane
Owns serverless request handling, Billy orchestration, session/account state, pricing, voice, diligence, actions routing, and trainer endpoints.

Primary anchors:
- `api/billy.ts`
- `api/_lib/**`
- `api/session/**`
- `api/stripe/**`
- `api/voice/**`
- `api/diligence/**`
- `api/trainer/**`

### 4.3 Shared runtime lane
Owns shared Billy logic, PLK-aware prompt shaping, trainer contracts, and common types used across client/server boundaries.

Primary anchors:
- `shared/billy/**`
- `shared/llm/plk.ts`
- `shared/tribunal/**`
- `shared/agent-trainer/**`

### 4.4 Data lane
Owns Supabase schema, migrations, auth-adjacent policy, retrieval fragments, founder continuity, trainer tables, and billing-linked state.

Primary anchors:
- `supabase/schema.sql`
- `supabase/migrations/**`
- `api/_lib/supabase.ts`
- `client/src/contexts/AuthContext.tsx`

### 4.5 Operations lane
Owns scripts, manifest generation, health checks, ingestion, repo validation, and skill/system documentation.

Primary anchors:
- `scripts/**`
- `tools/**`
- `docs/**`
- `skills/**`
- `agents/**`

---

## 5. Operating principles

1. **Runtime truth before narrative comfort**  
   Do not preserve older positioning or docs when the code has changed.

2. **Smallest coherent change set**  
   Make the smallest complete change that leaves the repo in a stable state.

3. **Docs move with code**  
   If runtime behavior changes, update docs and state logs in the same pass.

4. **Cross-repo boundaries are explicit**  
   Do not silently assume another GestaltView repo was changed or is locally mounted.

5. **Validation claims must be exact**  
   Only report checks that were actually run.

6. **Protect founder ergonomics**  
   Favor clear, boring, recoverable patterns over brittle cleverness.

7. **Preserve GestaltView identity**  
   Do not genericize the platform voice, PLK posture, or Neural Aurora design language.

---

## 6. Standard operating cycle

Every change should follow this sequence unless there is an incident requiring direct stabilization first.

### Step 1. Orient
Read the local operating context before touching code:
- `README.md`
- `COLAB.md`
- `docs/CurrentState.md`
- relevant architecture/workflow docs for the touched subsystem

### Step 2. Inspect reality
Verify the current implementation in the actual files before editing docs or proposing fixes.

### Step 3. Implement
Make the smallest coherent set of changes required to solve the problem.

### Step 4. Validate
Run the lightest meaningful checks for the touched subsystem.

### Step 5. Document state
Update `docs/CurrentState.md` when repository reality changed.

### Step 6. Handoff if needed
If the next step belongs elsewhere, leave a clear target-repo handoff note.

---

## 7. Change classes and required validation

### 7.1 Documentation-only changes
Minimum expectations:
- verify claims against live files
- correct stale references
- avoid implying tests were run if they were not

### 7.2 Client/runtime changes
Minimum expectations:
- `npm run build`
- targeted route or component sanity checks when applicable
- confirm imports resolve

### 7.3 API or Billy changes
Minimum expectations:
- `npm run build`
- focused API or Vitest checks where available
- verify provider behavior, fallback posture, and response-envelope integrity

### 7.4 Supabase-affecting changes
Minimum expectations:
- inspect schema + relevant migrations
- inspect `api/_lib/supabase.ts`
- verify policy implications
- confirm related client auth/session behavior still matches the data model

### 7.5 Trainer changes
Minimum expectations:
- align UI, API, shared contracts, worker path, and Supabase tables/policies
- confirm `agents/generated/` output behavior remains deterministic
- update skill/catalog surfaces if the trainer capability changed materially

---

## 8. Playbooks by subsystem

## 8.1 Billy runtime playbook

Use for:
- `client/src/components/Billy*`
- `client/src/lib/billyApi.ts`
- `api/billy.ts`
- `api/_lib/llmRouter.ts`
- retrieval, founder continuity, provider routing, bucket drops

Checklist:
1. Confirm whether the issue is client-side, API-side, provider-side, retrieval-side, or env/deploy-side.
2. Verify the server path first before changing client fallback behavior.
3. Preserve metadata-rich response envelopes.
4. Keep retrieval context separate from accidental raw-fragment user output unless explicitly intended.
5. Validate degraded mode intentionally, especially `offline-fallback` behavior.
6. Record any provider-cascade, embedding, or env-policy change in `CurrentState` and architecture docs.

Definition of done:
- Billy returns coherent user-facing responses
- provider/fallback behavior is understood, not accidental
- retrieval and continuity behavior remain grounded
- related docs match runtime reality

## 8.2 Auth + dashboard playbook

Use for:
- `client/src/contexts/AuthContext.tsx`
- `client/src/pages/SignIn.tsx`
- `client/src/pages/DashboardPage.tsx`
- `api/session/**`
- user-tier and founder/admin bootstrap flows

Checklist:
1. Confirm whether the issue is browser auth state, Supabase session state, profile hydration, or server-backed dashboard logic.
2. Protect fail-open/fail-safe behavior around loading states and auth resolution.
3. Verify founder/admin rules against current migration logic.
4. Validate both anonymous and signed-in paths.

Definition of done:
- users can sign in, recover session state, and reach the intended account surface
- loading spinners do not trap the user indefinitely
- founder/admin state is explicit and reproducible

## 8.3 Agent trainer playbook

Use for:
- `/agent-trainer`
- `client/src/features/agent-trainer/**`
- `api/trainer/**`
- `server/agent-trainer/**`
- `shared/agent-trainer/**`
- `worker/trainer/main.ts`
- trainer migrations and policies

Checklist:
1. Read the trainer spec and skill surfaces first.
2. Identify whether the change affects submission, orchestration, queueing, eval, approvals, deployment, or generated artifact output.
3. Keep UI, API, worker, shared contracts, and Supabase lineage aligned.
4. Treat RLS and service-role-only posture as part of the feature, not an afterthought.
5. Update generated-agent and catalog surfaces if trainer output semantics changed.

Definition of done:
- the trainer path is coherent from run submission to deploy artifact
- state lineage is traceable
- security posture is explicit
- docs and skills recognize the trainer as a first-class subsystem

## 8.4 Diligence and exhibits playbook

Use for:
- `api/diligence/**`
- `diligence/**`
- `Diligence_Reports/**`
- exhibit and archive pages

Checklist:
1. Confirm whether data comes from local exports, API aggregation, or UI rendering.
2. Prefer resilient local-file reads and caching over introducing unnecessary new backend complexity.
3. Distinguish canonical evidence assets from display formatting layers.
4. Record any changed data expectations or inventory assumptions.

Definition of done:
- evidence surfaces still render meaningful, stable output
- data-source assumptions are explicit
- docs do not overstate backend guarantees that do not exist

## 8.5 Docs and skills sync playbook

Use for:
- `docs/**`
- `skills/**`
- `agents/**`
- manifest/catalog refresh work

Checklist:
1. Start from live runtime files, not older docs.
2. Refresh core docs before secondary or generated docs.
3. Update `CurrentState.md` when the repo’s operational reality changed.
4. Treat generated snapshots as downstream outputs, not canonical truth.

Definition of done:
- major docs agree with runtime
- skill paths and agent paths reflect actual repo state
- stale references are either corrected or marked as archival

---

## 9. Release playbook

Before shipping a meaningful runtime change:

1. Run the minimum relevant validation.
2. Confirm route/API imports resolve under ESM expectations.
3. Confirm env assumptions match actual deploy surfaces.
4. Confirm related docs are updated.
5. Record noteworthy risks, follow-ups, or degraded-mode behavior in `docs/CurrentState.md`.
6. For Billy-related releases, check `/api/billy` and `/api/billy-health` soon after deploy.
7. For auth/dashboard releases, verify `/dashboard`, sign-in flow, and session restoration.
8. For trainer releases, verify submission, queue, and approval/deploy surfaces.

---

## 10. Incident playbook

Use when production or preview behavior is broken.

### Sequence
1. Classify the blast radius.
2. Identify whether the break is client, API, env, provider, Supabase, or deploy-runtime specific.
3. Stabilize the narrowest failing layer first.
4. Re-run focused validation.
5. Record the incident in `docs/CurrentState.md` with:
   - exact date
   - symptom
   - root cause or current hypothesis
   - remediation
   - what was validated
   - next checks after deploy

### Common incident classes in this repo
- ESM import-specifier/runtime resolution failures
- Billy provider fallback confusion
- auth session resolution stalls
- Supabase policy drift
- local Vite dev path not matching deployed API topology

---

## 11. Cross-repo handoff contract

When the work extends beyond `gestaltview-v2.0`, document:

- **Target repo**
- **Why it matters**
- **Likely affected areas**
- **Recommended next action**
- **Status in this repo**: mirrored / referenced only / pending

Never imply a sibling repo was changed unless that repo was actually inspected and modified.

---

## 12. Definition of done

A task is complete only when all of the following are true:

1. The relevant runtime behavior or documentation issue is actually resolved.
2. Validation has been run at the appropriate level and reported honestly.
3. `docs/CurrentState.md` is updated when repository reality changed.
4. Cross-repo follow-up is explicitly documented when needed.
5. No new source-of-truth contradiction was introduced without being called out.

---

## 13. Known drift to watch immediately

These are active mismatches or likely confusion points that future operators should resolve carefully.

### 13.1 Provider-policy drift
Some higher-level docs and operator guidance still describe Billy as Gemini-primary with limited fallbacks, while the current runtime router uses a free-first cascade (`ollama -> groq -> huggingface -> openrouter -> gemini -> anthropic -> openai`).

**Rule:** treat `api/_lib/llmRouter.ts` as runtime truth until docs are reconciled.

### 13.2 Environment-template drift
Repository guidance references `.env.example`, but operators should verify the actual maintained env template path before relying on docs alone.

**Rule:** validate env references against the live repo tree before documenting setup steps.

### 13.3 Historical doc gravity
This repo carries strong narrative and archival layers. Older snapshots can sound authoritative while being operationally stale.

**Rule:** when in doubt, prefer current code + `CurrentState.md` over historical prose.

---

## 14. Recommended next refinement pass

A strong v2 of this playbook should:

1. add a small machine-readable checklist matrix by subsystem
2. add explicit owner tags for each major runtime lane
3. reconcile provider-policy wording across `README.md`, `COLAB.md`, and runtime docs
4. formalize the actual env-template location and keep it under source control
5. add a release-verification table for preview vs production

---

**© 2026 Keith Soyka / GestaltView — All Rights Reserved**
