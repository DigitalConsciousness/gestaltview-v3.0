# Embodiment Collaborator Package

This guide is the operator-facing spine for external collaborators working on `embodiment_profiles/` outside the live GestaltView runtime.

It is intended for:
- human collaborators
- GitHub-connected assistants such as Perplexity or OpenAI
- repo-scoped agents that need concrete intention and target files before they edit anything

## What this package is for

Use this package when the task is:
- create a new embodiment profile
- refine an existing profile's identity, voice, or governance
- validate profile shape and registry consistency
- regenerate shared embodiment artifacts after profile changes
- sync profile rows into Supabase when you have service access

This package is not:
- the live runtime
- a general repo dump
- a place to edit generated artifacts by hand
- a transferable identity export

## Bundle home

When this guide is exported into a collaborator package, place the archive in `artifacts/` by default.

Current bundle target:
- `artifacts/embodiment-collaborator-package-v4.zip`
- `artifacts/latest.zip`

## Source of truth

If the package conflicts with live repo state, the repo wins.

Primary sources:
- `embodiment_profiles/*.embodiment.json`
- `shared/embodiment/types.ts`
- `shared/embodiment/index.ts`
- `scripts/generate-embodiment-registry.ts`
- `scripts/validate-embodiment-profiles.mjs`
- `scripts/build-embodiment-artifacts.mjs`
- `scripts/sync-embodiment-profiles.ts`
- `docs/ContinuityStack.md`

Reference docs:
- `docs/embodiment/EMBODIMENT_INVENTORY.md`
- `docs/embodiment/EMBODIMENT_RUNTIME_GAP_MATRIX.md`
- `docs/ContinuityStack.md`
- `GestaltView-Collaboration-Onboarding-Packet/00_READ_FIRST/PACKET_INDEX.md`
- `GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/route_map.md`
- `GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/table_boundary_guidance.md`

## Target files

When a collaborator is asked to improve embodiment profiles, these are the intended write targets:

- `embodiment_profiles/*.embodiment.json`
- `shared/embodiment/generated.ts` when you intentionally regenerate the registry
- `docs/embodiment/*` when documenting profile intent, gaps, or validation notes
- `scripts/sync-embodiment-profiles.ts` only if sync behavior itself needs a change

Do not edit these by default:
- `shared/embodiment/types.ts`
- `shared/embodiment/index.ts`
- generated artifacts unless the task explicitly includes regeneration

## Workflow

1. Read `docs/ContinuityStack.md`, the packet index, and the embodiment inventory.
2. Identify the profile slug or slugs that are in scope.
3. Read the current JSON profile and any matching docs.
4. Decide whether the change is:
   - identity/content only
   - schema-shape validation
   - registry regeneration
   - Supabase sync
5. Modify the profile JSON first.
6. Run validation before touching generated files.
7. Regenerate `shared/embodiment/generated.ts` only if the profile set changed.
8. Sync to Supabase only when the task explicitly requires persistence.

## Intention model

Give the collaborator a target sentence before asking it to edit:
- "Refine Billy's founder-facing voice without changing the immutable core."
- "Add a new embodiment profile for a specialist collaborator."
- "Fix registry drift caused by changed profile metadata."
- "Sync the current profile set into Supabase."

Then give it the concrete file targets:
- "Edit `embodiment_profiles/billy.embodiment.json` and `scripts/validate-embodiment-profiles.mjs`."
- "Update `shared/embodiment/generated.ts` after regeneration."
- "Refresh `scripts/build-embodiment-artifacts.mjs` only if the output shape changes."

That keeps the assistant from wandering into runtime files that are not part of the embodiment task.

## Validation loop

Recommended order:

```bash
npm run validate:embodiment
npm run embodiments:build
npm run package:collaborator
npm run sync-profiles
```

Use `npm run sync-profiles` only when you want to write the profile set to Supabase.

## Boundary reminders

- Profile JSON files are the canonical authoring surface.
- Generated registry files are derived outputs.
- Runtime prompt builders consume the registry, they do not author it.
- If the collaborator is unsure, it should ask for the smallest missing target instead of guessing.
