# CurrentState Addendum — Core OS Room Workflow Lock

Date: 2026-05-07
Status: packaged for integration

## What changed

- Added a complete shared capture/scaffold contract in `client/src/components/Scaffold.tsx`.
- Added `client/src/lib/captureRouting.ts` as a stable service seam for future Supabase/API persistence.
- Added a deterministic Dynamic Inner World layout layer that supports 0..1 display coordinates while remaining compatible with older 0..100 prototype values.
- Added a CSS 3D-style six-surface room renderer and artifact renderer.
- Included full page swap-outs for Sanctuary, Blackboard Room, Dynamic Inner World, External Scaffold, and Creation Corner.
- Included Billy onboarding/runtime guide files so Billy can explain the flow without becoming a scaffold entity.
- Copied the outside-in Codex translation layer into `docs/CodexOutsideInTranslationLayer.md`.

## Product boundary preserved

Billy may assist with metadata, display integrity, and routing explanation. Billy is explicitly not added as a tag, scaffold artifact, visual node, or hidden organizer.

External Scaffold remains the approved compressed artifact layer. Dynamic Inner World remains raw spatial expression. Blackboard remains capture-first. Creation Corner remains output/export.

## Validation performed in package environment

- Static TypeScript check was run against the scaffold contract and layout modules with local module stubs.
- Full `npm run build` was not run here because the complete repository was accessible through the GitHub connector and partial uploaded zips, but not cloneable into the sandbox network environment.

## Required repo-root validation after applying

```bash
npm run build
git diff --check
```

Run `npm run health` if available in the active repo environment.
