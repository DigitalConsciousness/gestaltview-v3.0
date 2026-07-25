---
name: verifiable-code-delivery
description: Use when preparing, auditing, or finalizing a developer-facing delivery package, PR handoff, or implementation artifact that must be runnable and evidence-backed.
---

# Verifiable Code Delivery

## Core principle

Deliver an applied, bounded change plus reproducible evidence. With workspace access, report actual edits, not replacement files. Verification is proportional to risk; failures and constraints stay visible.

## When to use

Use for implementation handoffs, PRs, patches, API/schema changes, and delivery reviews. Do not use for advice without an artifact or read-only diagnosis. This governs package completeness; `verification-before-completion` governs truthful final claims.

## Workflow

1. Inspect boundaries, contracts, and task runners.
2. Apply only authorized changes; record exact repository-relative paths.
3. Select checks proportional to behavior and risk.
4. Run them fresh; separate observation from inference.
5. Review the seven gates, then hand off with the report below.

## Seven delivery gates

1. **Exact paths:** Name every changed or referenced file from repository root.
2. **Applied/bounded changes:** Confirm edits exist and match scope; describe diffs, not hypothetical replacements.
3. **Executable commands:** Inspect `package.json`, Makefile, justfile, or equivalent. Never invent a conventional script.
4. **Preserved contracts:** Check routes, APIs, schemas, public types, and migrations; disclose breaks and migration paths.
5. **Config/secret safety:** Never commit secrets or environment-specific values in source. Intentional public, non-secret configuration is allowed when documented. Never print secrets.
6. **Evidence vs inference:** Label observed file/command results as evidence; label untested impact or failure attribution as inference.
7. **Fresh self-verification:** After the final edit, report commands, status, scope, failures, and constraints. Never claim all-green while an executed check fails.

## Bundled validators

Paths are relative to this skill directory:

- `scripts/verify_delivery.py`: `python3 scripts/verify_delivery.py <handoff-file-or-directory> [--project-root PATH]`
- `scripts/check_scripts.py`: `python3 scripts/check_scripts.py <project-directory> [--commands "pnpm run build, pnpm test"]`

Run either without arguments for usage. Helpers supplement judgment; inspect their limitations.

## Delivery report

Tiny patches may use compact bold-label blocks on their own lines instead of headings, but all five labels and gates must remain explicit.

````markdown
### Files Changed
- `path` — applied change and purpose
### Contracts
- Preserved/broken contracts and migration notes
### Verification
```bash
verified-command --flag
```
- PASS — observed result
- FAIL — observed failure and constraint
- NOT RUN — reason and resulting uncertainty
### Regression Risk
- Remaining risk, evidence, and inference
### Recovery
- Safe rollback/revert or mitigation path
````

## Related skills

Use `test-driven-development` while implementing and `systematic-debugging` for failures. Use `verification-before-completion` before success claims. This skill owns paths, scope, contracts, commands, risk, and recovery.

## Rationalizations and red flags

| Shortcut | Required response |
|---|---|
| “Focused tests passed; CI can run the rest.” | State what was not run and the resulting regression risk. |
| “The maintainer requested a standard command.” | Verify it exists; offer the real command or report the gap. |
| “That failure looks flaky/pre-existing.” | Report it; causality is inference without baseline evidence. |
| “A tiny adjacent fix will make it green.” | Preserve scope; request authority before unrelated edits. |
| “Withholding work wastes sunk cost.” | Handoff may proceed, but failures remain explicit. |

Stop for hidden failures, guessed commands, unapplied edits, omitted contract impact, exposed secrets, or scope expanded to manufacture green.

## Done criteria

Done means the artifact is applied and bounded; seven gates are addressed; commands match real runners; fresh proportional checks and failures/constraints are reported; and all five report sections exist. No universal time limit or all-green suite is required.
