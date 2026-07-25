# Operation Render Acceptance Checklist

## Build / Install

- [x] Generated registry / sweep guard integrated: `node scripts/build-embodiment-artifacts.mjs --check` and `npm run operation-render:validate` both pass.

- [ ] `corepack enable`
- [x] `pnpm install --frozen-lockfile` — completed; warned that local Node v20.20.2 is below the repo engine `>=22 <25`, and pnpm ignored selected package build scripts pending `pnpm approve-builds`.
- [x] `pnpm run build` — completed successfully after dependency installation restored missing local type packages.
- [ ] `pnpm run health || true`
- [x] `node scripts/validate-embodiment-profiles.mjs` — validated 24 profiles and generated registry.
- [x] `pnpm audit --prod` — now reports zero known vulnerabilities after dependency hardening; `npm audit` and `pnpm audit` also report zero known vulnerabilities.

## Runtime Visuals

- [x] Home uses Operation Render visual language enough to respect degraded-mode and motion-reduction settings.
- [ ] Dynamic Inner World artifact surfaces use upgraded frames.
- [ ] Creation Corner canvas/artifact exports use shared artifact frame.
- [ ] External Scaffold has coherent glass/depth system.
- [ ] Sanctuary keeps softer tone but shares underlying surface tokens.
- [ ] Settings/FAQ/Terms/Privacy are not visually orphaned.
- [x] Loading states use `LoadingSpinner` or upgraded equivalent.
- [x] Reduced-motion mode disables constant fog/particle breathing.

## Embodiment Reasoning

- [ ] Every embodiment profile has a reasoning policy.
- [ ] Tool access is resolved through a registry, not profile prompt free-for-all.
- [ ] GitHub/Supabase/HF/web calls are logged.
- [ ] Sources are attached when factual/current claims are made.
- [ ] Uncertainty and inference are separated from fact.

## Visible Reasoning Trace

- [ ] Trace shows evidence cards.
- [ ] Trace shows tool trail.
- [ ] Trace shows assumptions and uncertainty.
- [ ] Trace uses redacted/humorous private-scratchpad notices.
- [ ] Trace never exposes raw hidden chain-of-thought.

## Voice

- [x] Voice Page reports provider readiness.
- [ ] Missing ElevenLabs key does not hard-fail UI.
- [ ] Local/open path status is visible.
- [ ] Billy has a valid voice profile.
- [ ] Other profiles can inherit defaults.

## Field Continuity

- [x] User can capture text offline, persist after reload, sync when online, export unsynced local queue, and disable heavy render layers in degraded mode.
