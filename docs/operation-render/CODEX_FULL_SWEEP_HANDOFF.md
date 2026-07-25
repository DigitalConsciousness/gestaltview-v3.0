# Codex Handoff — Operation Render Full Sweep

Please implement the next full sweep from Operation Render Slice One in `DigitalConsciousness/gestaltview-v2.0`.

## Prime directive

Roll forward. Enhance and never remove working behavior. Treat generated-file problems as generator/source/validation problems, not as “someone else’s generated mess.”

## Start here

Read these first:

- `docs/operation-render/runtime-page-audit.md`
- `docs/operation-render/dependency-audit.md`
- `docs/operation-render/acceptance-checklist.md`
- `docs/CurrentState.md` top Operation Render section
- `shared/operation-render/contracts.ts`
- `shared/operation-render/policies.ts`
- `supabase/migrations/202607080001_operation_render_reasoning_voice.sql`
- `scripts/build-embodiment-artifacts.mjs`
- `shared/embodiment/generated.ts`

## Apply these prep patch files

- Replace `scripts/build-embodiment-artifacts.mjs` with `patches/scripts/build-embodiment-artifacts.mjs`.
- Add `scripts/validate-operation-render-sweep.mjs` from `patches/scripts/validate-operation-render-sweep.mjs`.

Optional package scripts:

```json
{
  "embodiments:check-generated": "node scripts/build-embodiment-artifacts.mjs --check",
  "operation-render:validate": "node scripts/validate-operation-render-sweep.mjs"
}
```

## Work slices

1. Baseline build/check/audit.
2. Generated TypeScript registry guard.
3. Supabase migration remote verification and policy/write-path decision.
4. Dependency audit actualization.
5. Page-wide visual sweep from the runtime page audit.
6. Reasoning/tool-use runtime wiring.
7. Visible reasoning trace data integration.
8. Voice readiness/status integration.
9. Offline field-continuity queue and degraded mode.
10. Closeout docs/checklist/CurrentState.

## Validation

Run at minimum:

```bash
corepack enable
pnpm install --frozen-lockfile
node scripts/build-embodiment-artifacts.mjs --check
node scripts/validate-operation-render-sweep.mjs
node scripts/validate-embodiment-profiles.mjs
pnpm run build
pnpm audit --prod
```

If any command fails because of pre-existing unrelated errors, do not shrug. Record the exact file, reason, and whether it blocks Operation Render. If it is a generated TypeScript or registry issue, fix the generator/source/validator path.

## Closeout

Update:

- `docs/operation-render/runtime-page-audit.md`
- `docs/operation-render/dependency-audit.md`
- `docs/operation-render/acceptance-checklist.md`
- `docs/CurrentState.md`

Every open item should become one of: completed, blocked with evidence, waived with reason, or next-slice with a precise owner surface.
