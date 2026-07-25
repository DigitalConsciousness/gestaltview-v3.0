# Workflows — GestaltView v2

**Last updated:** 2026-05-07

This document defines the practical working flow for maintaining `gestaltview-v2.0`.

---

## 1) Standard operating cycle

1. **Orient**
   - Read `README.md`, `COLAB.md`, `docs/CurrentState.md`, `docs/ContinuityStack.md`, and the touched runtime docs.
   - Confirm whether the task is repo-local or cross-repo.
2. **Inspect reality**
   - Verify the current files, routes, scripts, handlers, and schema before changing docs or code.
   - Prefer commands and direct file reads over assumptions.
3. **Implement**
   - Make the smallest coherent set of changes.
   - Keep docs and skills aligned with runtime behavior changes.
4. **Validate**
   - Run the lightest meaningful checks for the changed subsystem.
   - Use build-level validation when runtime behavior changed materially.
   - If `.orientation/` changed, run `bash scripts/test-orientation-checkin.sh` before treating the repo as check-in ready.
5. **Document state**
   - Update `docs/CurrentState.md` when repository reality changed.
   - Update `docs/ContinuityStack.md` when the continuity route itself changed.
   - Update `README.md` and the touched architecture/API/workflow docs when runtime behavior changed.
6. **Cross-repo handoff**
   - If follow-up belongs in another repository, leave explicit ownership and next-step notes.

## 1.5) Continuity stack

When the work involves session persistence, onboarding, or collaborator handoff, use `docs/ContinuityStack.md` as the router and `docs/SessionHandoffPacket.md` as the form.

If the task is about embodiment, extend that route into:

1. `GestaltView-Collaboration-Onboarding-Packet/`
2. `embodiment_profiles/`
3. the validation and sync scripts

---

## 2) Baseline local commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run health
npm run orientation:check
npm run manifest
npm run billycheck
npm run gv
```

Additional common commands:

```bash
npm run server
npm run ingest
npm run seed
npm run migrate
npm run trainer:worker
npx tsc --noEmit
```

---

## 3) Validation expectations

### Documentation-only changes

- Check internal consistency of the edited docs.
- Verify any route, API, skill, or schema claim against the live repo.
- Do not claim runtime validation you did not run.
- Keep the README and the runtime docs in sync when you refresh a subsystem.

### Runtime, API, or schema changes

At minimum, prefer:

```bash
npm run build
```

Then add targeted checks for the touched area, for example:

- `npm run health`
- `npm run orientation:check`
- `npm run manifest`
- `scripts/test-apis.sh`
- `scripts/test-billy-routing.sh`
- `scripts/test-db-schema.sh`
- focused Vitest API runs

### Supabase-affecting changes

When auth, pricing, retrieval, or schema behavior changed, also verify against:

- `supabase/config.toml`
- `supabase/schema.sql`
- relevant migration files
- `api/_lib/supabase.ts`
- `client/src/contexts/AuthContext.tsx`

---

## 4) CurrentState protocol

Update `docs/CurrentState.md` whenever work changes repository reality.

Minimum content:

- what changed
- why it changed
- what was validated, with exact commands when possible
- current repo condition after the pass
- remaining risks and recommended next steps

Use exact dates for incidents, deploys, or time-sensitive observations.

---

## 5) Cross-repo handoff workflow

When a task crosses ecosystem boundaries:

1. Mark which repo owns the implementation.
2. Mark which repo consumes the result.
3. Capture the handoff note in local docs if the runtime depends on it.
4. Avoid claiming file-level certainty for repos that are not mounted locally.

Suggested handoff template:

- **Target repo:**
- **Why it matters:**
- **Likely affected areas:**
- **Recommended next action:**
- **Status in this repo:** mirrored / referenced only / pending

---

## 6) Documentation refresh workflow

For broad docs-refresh requests:

1. Update the core runtime docs first:
   - `README.md`
   - `docs/CurrentState.md`
   - `docs/Workflows.md`
   - `docs/ArchitecturalStructure.md`
   - `docs/AIFlow.md`
   - `docs/APIFlow.md`
   - `docs/Manifest.md`
   - `docs/SymbioticWorkflow.md`
   - `docs/PlaybookOperatorManual.md`
2. Refresh any affected skills next.
3. Regenerate manifest outputs only if route/API/script/doc inventory changed materially.
4. Treat generated docs in `docs/generated_*` and older wiki snapshots as historical artifacts, not source-of-truth.

---

## 7) Related docs

- `docs/CurrentState.md`
- `docs/ArchitecturalStructure.md`
- `docs/AIFlow.md`
- `docs/APIFlow.md`
- `docs/Manifest.md`
- `skills/gestaltview-suite-orchestrator/SKILL.md`
- `skills/gestaltview-workflow-operations/SKILL.md`
