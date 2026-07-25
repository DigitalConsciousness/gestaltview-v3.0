# Workflows — GestaltView v2

**Last updated:** 2026-03-24

This document defines the practical operating workflow for maintaining `gestaltview-v2`.

---

## 1) Standard operating cycle

1. **Orient**
   - Read `AGENTS.md` and `CurrentState.md`.
   - Confirm whether the task is repo-local or cross-repo.
2. **Inspect reality**
   - Verify current scripts, routes, and files before writing docs/code.
   - Prefer commands over assumptions.
3. **Implement**
   - Make the smallest coherent set of changes.
   - Keep docs and skills aligned with behavior changes.
4. **Validate**
   - Run at least build-level validation.
   - Run targeted checks for changed areas.
5. **Document state**
   - Update `CurrentState.md` with changes, rationale, verification, risks, next steps.
6. **Cross-repo handoff**
   - If follow-up belongs in another repository, leave explicit handoff notes.

---

## 2) Baseline local commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run health
```

Additional utility commands:

```bash
npm run billycheck
npm run manifest
npm run ingest
npm run seed
npm run migrate
```

---

## 3) Validation expectations per change

### Documentation-only changes

- Ensure modified files are internally consistent.
- Ensure ecosystem repo naming is consistent:
  - `gestaltview-v2`
  - `GestaltView-Official-Compendium`
  - `Insight-Bot`
  - `SymbioCoder`
  - `Resume Rockstar`
  - `GAICE`

### Runtime or API changes

At minimum:

```bash
npm run build
npm run health
```

Then run targeted checks for changed subsystem(s), for example Billy routing or ingestion scripts.

---

## 4) CurrentState maintenance protocol

Update `CurrentState.md` whenever work changes repository reality.

Minimum required content:

- What changed.
- Why it changed.
- What was validated (include commands).
- Current repo condition after changes.
- Remaining risks and recommended next steps.

Do not claim production validation unless production was directly checked.

---

## 5) Cross-repo sync workflow

When a task affects ecosystem boundaries:

1. Mark which repo owns implementation.
2. Mark which repo consumes outputs.
3. Capture any contract/handoff note in this repo docs.
4. Avoid claiming file-level certainty for repos not present locally.

Handoff note template:

- **Target repo:**
- **Why it matters:**
- **Likely affected areas:**
- **Recommended next action:**
- **Status in this repo:** mirrored / referenced only / pending

---

## 6) Documentation drift remediation workflow

For broad Markdown refresh requests:

1. Update root orientation docs first (`README.md`, `CurrentState.md`, `Workflows.md`).
2. Update orchestrator skills and cross-repo references.
3. Record inventory and outstanding follow-ups.
4. Treat generated historical docs (`docs/generated_*`) as snapshots, not source-of-truth.

---

## 7) Related docs

- `CurrentState.md`
- `ArchitecturalStructure.md`
- `AIFlow.md`
- `APIFlow.md`
- `Manifest.md`
- `skills/00-suite-orchestrator/SKILL.md`
- `skills/07-workflow-operations/SKILL.md`
