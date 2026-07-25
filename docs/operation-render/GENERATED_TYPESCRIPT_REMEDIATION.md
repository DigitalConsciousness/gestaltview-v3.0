# Generated TypeScript Remediation Spec

## Principle

A generated TypeScript file is not a blame target. If `shared/embodiment/generated.ts` has an issue, the owner surface is the generator, the source JSON, and the validation path.

Do not hand-edit `shared/embodiment/generated.ts` except as a temporary emergency patch. The durable fix is always one of:

1. correct the source `*.embodiment.json`,
2. correct `scripts/build-embodiment-artifacts.mjs`,
3. correct `shared/embodiment/types.ts`,
4. add or repair validation that catches the drift before runtime.

## Current observed baseline

- `shared/embodiment/generated.ts` declares itself auto-generated.
- Its source of truth is `embodiment_profiles/*.embodiment.json`.
- It is regenerated with `node scripts/build-embodiment-artifacts.mjs`.
- The current generator parses JSON, sorts object keys, writes the registry, and exports `PROFILE_SLUGS`.

## Open risk

The current generator is useful but too trusting. It should not silently allow:

- duplicate profile slugs,
- profile slug that does not match filename,
- malformed JSON with low-context error output,
- stale generated output checked into repo,
- registry drift after profile edits,
- missing CI/build check for generated artifacts.

## Proposed remediation

Replace `scripts/build-embodiment-artifacts.mjs` with the file in `patches/scripts/build-embodiment-artifacts.mjs`.

Key improvements:

- `--check` mode compares rendered output with the committed generated file.
- Duplicate slugs fail loudly.
- Filename/slug mismatch fails loudly.
- Missing slug fails loudly.
- Output remains deterministic.
- The generated module still exports the same public contract: `EMBODIMENT_REGISTRY`, `EMBODIMENT_PROFILES`, `PROFILE_SLUGS`, and `getProfile()`.
- Adds `hasProfile()` as a safe helper for arbitrary strings.

## Recommended package.json additions

Add these scripts after the replacement lands:

```json
{
  "embodiments:check-generated": "node scripts/build-embodiment-artifacts.mjs --check",
  "operation-render:validate": "node scripts/validate-operation-render-sweep.mjs"
}
```

## Validation sequence

```bash
node scripts/build-embodiment-artifacts.mjs --check
node scripts/validate-embodiment-profiles.mjs
node scripts/validate-operation-render-sweep.mjs
pnpm run build
```

## Acceptance

- A stale `shared/embodiment/generated.ts` fails the generated check.
- A duplicate slug fails before writing output.
- A filename/slug mismatch fails before writing output.
- Generated output is deterministic across repeated runs.
- No runtime code depends on manually edited generated output.
