# GestaltView v2 Playbook Checklist

> Use this when your brain wants rails instead of riddles.
> Pair with:
> - `docs/PlaybookOperatorManual.md`
> - `docs/PlaybookSpec.md`
> - `docs/CurrentState.md`

---

## 1. 5-minute kickoff

### Read first
- [ ] `README.md`
- [ ] `docs/CurrentState.md`
- [ ] the relevant section of `docs/PlaybookOperatorManual.md`

### Name the lane
- [ ] Billy runtime
- [ ] auth/dashboard
- [ ] exhibit lane
- [ ] trainer
- [ ] diligence/evidence
- [ ] docs/skills
- [ ] deployment/incident

### State the actual problem in one sentence
- [ ] What is broken, missing, drifting, or confusing?

---

## 2. Before you edit anything

- [ ] Confirm the live files that own this behavior
- [ ] Confirm whether the issue is client, API, shared logic, Supabase, or docs
- [ ] Check whether another repo probably owns the next step
- [ ] Check `docs/CurrentState.md` for recent related changes

---

## 3. Change-shape guardrails

- [ ] One main spine for this pass
- [ ] Smallest coherent change set
- [ ] Reversible where possible
- [ ] No hidden assumptions left undocumented
- [ ] No claims of validation before validation exists

---

## 4. Validation quick-pick

### Docs only
- [ ] claims verified against live files
- [ ] stale references fixed
- [ ] no invented tests described

### Client/runtime
- [ ] `npm run build`
- [ ] touched route opens
- [ ] component behavior sanity-checked

### API/Billy
- [ ] `npm run build`
- [ ] focused route or test run where available
- [ ] fallback behavior reviewed
- [ ] response metadata still truthful

### Supabase/schema
- [ ] schema and migrations inspected
- [ ] affected access path inspected
- [ ] policy implications reviewed

### Trainer
- [ ] UI/API/shared/worker/schema alignment checked
- [ ] generated artifact expectations still make sense

### Incident fix
- [ ] exact failing route or endpoint re-tested
- [ ] deploy/runtime-specific assumptions checked

---

## 5. Billy-specific flash card

- [ ] Is the problem in UI, request plumbing, retrieval, router, provider, or fallback?
- [ ] Did retrieval leak raw fragments to the user?
- [ ] Did degraded mode replace a good server response?
- [ ] Did provider posture change without docs changing?

---

## 6. Auth-specific flash card

- [ ] Does session loading terminate correctly?
- [ ] Does sign-in restore the intended destination?
- [ ] Does `/dashboard` reflect server truth?
- [ ] Do founder/admin rules still match migrations?

---

## 7. Exhibit flash card

- [ ] Is the exhibit correctly registered and routed?
- [ ] Does Billy receive the intended domain context?
- [ ] Does context clear when leaving the lane?
- [ ] Are PLK / Never Look Away flags still correct?

---

## 8. Trainer flash card

- [ ] Which layer changed: submission, queueing, scenarios, scoring, approval, deploy?
- [ ] Did shared contracts move with the feature?
- [ ] Did Supabase lineage/policies move too?
- [ ] Did skills or generated outputs need updating?

---

## 9. Release gate

- [ ] touched behavior works
- [ ] minimum meaningful validation ran
- [ ] docs updated where needed
- [ ] `docs/CurrentState.md` updated if repo reality changed
- [ ] cross-repo next steps documented if needed

### Post-release spot checks
- [ ] Billy: `/api/billy` and affected UI
- [ ] Auth: `/signin`, `/auth/callback`, `/dashboard`
- [ ] Pricing: checkout start and success path
- [ ] Trainer: run submission and status visibility
- [ ] Exhibits: affected route plus Billy scoping

---

## 10. Incident triage card

- [ ] Classify blast radius
- [ ] Identify failing layer
- [ ] Fix the narrowest broken layer first
- [ ] Run focused validation
- [ ] Record exact date, symptom, remediation, and follow-up in `docs/CurrentState.md`

---

## 11. Cross-repo handoff card

```md
- Target repo:
- Why it matters:
- Likely affected areas:
- What this repo now assumes:
- Recommended next action:
- Status in this repo: mirrored / referenced only / pending
```

---

## 12. Drift watch

- [ ] Does runtime disagree with prose?
- [ ] Does `llmRouter.ts` disagree with higher-level provider wording?
- [ ] Does env documentation match actual loader paths?
- [ ] Does the wiki still match live files?

---

## 13. Closeout

- [ ] Future-you can tell what changed in under 2 minutes
- [ ] The repo has less ambiguity than before
- [ ] The next step is obvious

---

**© 2026 Keith Soyka / GestaltView — All Rights Reserved**
