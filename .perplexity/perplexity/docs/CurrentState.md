# CurrentState — June 4 build stabilization and gen-engine TypeScript repair slice
## **NEVER EVER REMOVE FROM THIS DOCUMENT, IT ROLLS FORWARD AND IS ADDED TO!!**


**Last updated:** 2026-06-04  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Repaired TypeScript errors introduced in the gen-engine API layer that were blocking Vercel deployment (build exit on commit `100094d`), patched `codexBridge.ts` to re-export from the canonical `api/_lib/codexBridge` stub, and pushed commit `446904b` to unblock the deployment pipeline.

## Executive summary

- Fixed `api/gen-engine/artifacts.ts` and `api/gen-engine/export.ts`: method field changed from string `'POST'` to string array `['POST']` to match the `prepareJsonRoute` signature.
- Fixed `api/gen-engine/artifact.ts`: removed manual CORS/method guard and replaced with `prepareJsonRoute(['GET'])` to match the 2-3 argument signature correctly.
- Fixed `server/lib/codexBridge.ts`: replaced broken implementation that referenced non-existent `.insert()` QueryBuilder methods and non-existent `reviewRecommended` field on `GeneratedArtifact` with a clean re-export stub pointing at `api/_lib/codexBridge`.
- Commit `446904b` pushed to `main` — Vercel deployment triggered. Build confirmation pending as of 2026-06-04 14:20 EDT.

## Build history for this pass

| Commit | Result | Notes |
|---|---|---|
| `100094d` | FAILED | 5 TypeScript errors across gen-engine routes and codexBridge |
| `446904b` | PENDING | All 5 errors resolved; clean `tsc --noEmit` expected |

## Errors resolved (commit `100094d` → `446904b`)

- `api/gen-engine/artifact.ts(27)`: `applyCorsHeaders` called with 1 argument (required 2–3)
- `api/gen-engine/artifacts.ts(14)`: `string` passed where `string[]` expected
- `api/gen-engine/export.ts(14)`: `string` passed where `string[]` expected
- `server/lib/codexBridge.ts(70)`: `reviewRecommended` does not exist on `GeneratedArtifact`
- `server/lib/codexBridge.ts(77,102)`: `.insert()` does not exist on `QueryBuilder`

## Validation performed

- `tsc --noEmit` — clean after patch
- `git diff --check` — clean
- Vercel deployment triggered on push to `main`

## Where we left off

- The gen-engine API surface is now TypeScript-clean at the route level.
- The Codex artifact system (`api/codex/*`) remains the active gen-engine spine; the `api/gen-engine/*` routes patched here are a secondary surface that bridges into it.
- Vercel build confirmation for `446904b` is the immediate next gate.

## Also completed this session (voice memo + persona audit)

- Persona dropdown audit planned (voice memo 2026-06-04):
  - Remove from user-facing dropdowns: `Gatekeeper`, `Repo Scribe`, `Founder Sample`
  - Rename: `Repo Scribe` → `Philosopher`
  - Ensure all valid embodiment personas appear in the Blackboard Room selector
- `WhatIsGestaltView.md` created in `docs/` from founder voice transcript + bug walk notes

## Next slice

1. Confirm clean Vercel build on commit `446904b`.
2. Persona dropdown audit: remove Gatekeeper, Repo Scribe, Founder Sample from user-facing selectors; rename Repo Scribe → Philosopher; audit Blackboard Room DI selector for completeness.
3. Generative engine render gap: Creation Corner synthesize flow currently returns JSON input shape rather than a fully rendered artifact — fix the artifact rendering path so users see finished output.
4. Session recap → active 11-module extraction pipeline (orbs auto-created from Blackboard session end, no manual selection required).
5. Profile progress visualization: dynamic fill indicators on Profile page showing 11-module accumulation in real time.
6. Apply `20260602000100_codex_artifacts.sql` in a Supabase-backed environment and verify storage/job visibility against real auth users.

---

# CurrentState — GenEngine export drain and build-143 audit slice

**Last updated:** 2026-06-02
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Continued [specs/gen-engine/GestaltView-GenEngine-SPEC.md](/workspaces/gestaltview-v2.0/specs/gen-engine/GestaltView-GenEngine-SPEC.md) by adding an artifact-level export drain endpoint and investigating whether the repeated local build `143` termination was a code/dependency failure.

## Executive summary

- Added [api/codex/artifacts/[artifactId]/drain-exports.ts](/workspaces/gestaltview-v2.0/api/codex/artifacts/%5BartifactId%5D/drain-exports.ts), which drains all pending/retryable/failed HTML and JSON jobs for an artifact, preserves partial completion, and returns refreshed artifact, manifest, job, and result state.
- Added [listCodexJobsForArtifact()](/workspaces/gestaltview-v2.0/api/codex/_persistence.ts) so both memory-backed local jobs and Supabase-backed jobs can be drained at artifact scope.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) so `Render exports` prefers the new artifact-level drain endpoint and keeps the single-job endpoint as a fallback.
- Expanded [api/__tests__/codex-export-runner.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/codex-export-runner.test.ts) to cover forge -> two queued jobs -> drain endpoint -> both HTML/JSON manifests ready.
- Investigated the repeated `npm run build` exit code `143`. Direct app typechecking passes, Vite dies during production transform/render under the constrained local environment, disabling Tailwind did not change it, increasing Node heap only delayed it, and the nested `zustand@5.0.14` is isolated under `@react-three/*` rather than the direct app dependency (`zustand@4.5.5`). The evidence does not currently indicate an app-code regression; it indicates local build resource/process termination.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/codex-contracts.test.ts api/__tests__/codex-creation-corner.test.ts api/__tests__/codex-forge.test.ts api/__tests__/codex-export-runner.test.ts api/__tests__/creation-corner-synthesize.test.ts`
- `npm exec -- tsc --noEmit`
- Build investigation commands included `npm run build`, `npm exec -- vite build`, `NODE_OPTIONS=--max-old-space-size=6144 npm exec -- vite build`, `GV_DISABLE_TAILWIND=true npm exec -- vite build`, and nested Zustand inspection with `npm ls zustand --depth=4`.
- `npm run build` still exits `143` locally; tracked `dist/public/art` and `dist/public/audio` churn from the failed build was restored.

## Where we left off

- HTML/JSON Codex export jobs can now be run one-at-a-time or drained at artifact scope.
- The Creation Corner manifest refresh is no longer limited to one job request per export.
- The local build termination is not fixed in this pass because the root-cause evidence points to environment capacity/termination rather than a fatal TypeScript, Vite module, or direct Zustand error. Treat `tsc`, focused tests, and `git diff --check` as the current reliable validation gates in this checkout.

## Next slice

1. Add the typed `spatial_scene` renderer adapter in Dynamic Inner World, consuming Codex scene contracts directly rather than local HTML records.
2. Apply `20260602000100_codex_artifacts.sql` in a Supabase-backed environment and verify storage/job visibility against real auth users.
3. Revisit production build optimization in a larger-memory environment or CI runner to distinguish repo size from local Codespaces resource limits.

# CurrentState — SPEC-2 dynamic profile ingestion and Inner World integration slice

**Last updated:** 2026-05-28
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Began implementing [SPEC-2-Dynamic_User_Profiles_and_Creative_Modules_Integration_Sprint.md](/workspaces/gestaltview-v2.0/SPEC-2-Dynamic_User_Profiles_and_Creative_Modules_Integration_Sprint.md) as an additive runtime slice across profile ingestion, Dynamic Inner World data, module route aliases, and DI route assignments.

## Executive summary

- Added [shared/profileIngestion.ts](/workspaces/gestaltview-v2.0/shared/profileIngestion.ts) and [api/_lib/profileIngestion.ts](/workspaces/gestaltview-v2.0/api/_lib/profileIngestion.ts) with a deterministic first-pass ingestion pipeline that accepts journals, resumes, transcripts, lived-experience narratives, and optional Music DNA text, then produces evidence-backed personality dimensions without using Myers-Briggs-style labels.
- Added [api/profile/ingest.ts](/workspaces/gestaltview-v2.0/api/profile/ingest.ts) for `POST /api/profile/ingest`, plus focused API coverage in [api/__tests__/profile-ingestion.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/profile-ingestion.test.ts).
- Added [api/consciousness/dynamic-inner-world.ts](/workspaces/gestaltview-v2.0/api/consciousness/dynamic-inner-world.ts), [client/src/hooks/useDynamicInnerWorld.ts](/workspaces/gestaltview-v2.0/client/src/hooks/useDynamicInnerWorld.ts), and [client/src/components/ProfileDisplay.tsx](/workspaces/gestaltview-v2.0/client/src/components/ProfileDisplay.tsx) so Dynamic Inner World now has a live endpoint-backed profile card stack and stats band while preserving existing local artifact behavior.
- Added [api/embodiments/by-route.ts](/workspaces/gestaltview-v2.0/api/embodiments/by-route.ts), [client/src/hooks/useRouteEmbodiment.ts](/workspaces/gestaltview-v2.0/client/src/hooks/useRouteEmbodiment.ts), and [api/__tests__/route-embodiment.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/route-embodiment.test.ts) to expose route-to-DI assignments while keeping Blackboard Room unassigned as specified.
- Registered `/workspace/modules/resume-rockstar`, `/workspace/modules/symbio-coder`, and `/workspace/modules/vibe-coder` route aliases in [client/src/App.tsx](/workspaces/gestaltview-v2.0/client/src/App.tsx) against the existing compressed module implementations.
- Added [supabase/migrations/20260528000000_profile_ingestion_and_route_embodiments.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260528000000_profile_ingestion_and_route_embodiments.sql) for profile-ingestion run/source/dimension tables, module embodiment assignments, and route embodiment seeds.
- Fixed existing Vibe Coder strictness issues in [api/modules/vibe-coder/_lib/vibeEngine.ts](/workspaces/gestaltview-v2.0/api/modules/vibe-coder/_lib/vibeEngine.ts) and [client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx](/workspaces/gestaltview-v2.0/client/src/modules/Vibe_Coder/components/VibeAnalysisCard.tsx) so the SPEC-2 module surface typechecks cleanly.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/profile-ingestion.test.ts api/__tests__/route-embodiment.test.ts`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run build`
- Restored tracked `dist/public/art` and `dist/public/audio` after the successful build removed them as the known workspace build side effect.

## Where we left off

- The first SPEC-2 integration slice is implemented and build-verified. Profile ingestion currently uses a deterministic internal synthesizer with persistence hooks and PLK memory seeding; live source-id hydration from `bucket_drops`, `documents`, and `musical_dna_analyses` is still the next backend hardening step.
- Dynamic Inner World now displays endpoint-backed profile artifacts and stats beside the existing artifact hall, but drag-and-drop ordering persistence and full right-side curator settings remain open.

## Next slice

1. Add live Supabase source hydration for profile ingestion source IDs and a latest-run fetch path for `ProfileDisplay`.
2. Expand Dynamic Inner World curator controls with persisted artifact type filters/order.
3. Wire route embodiment context into one or two module prompts so the assignment endpoint affects responses, not just lookup.

# CurrentState — UI improvements image-upload and Blackboard header clearance slice

**Last updated:** 2026-05-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Continued `specs/root/GestaltView_UI_Improvements_Action_Plan.md` with the next upload-reliability slice and a Blackboard header follow-up so Clear/End session controls stay unobscured under the fixed runtime nav.

## Executive summary

- Updated [client/src/pages/ProfilePage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ProfilePage.tsx) so profile avatar uploads no longer store raw image `data:` payloads in `gv:profile:preferences:v1`; signed-in uploads now route through the existing user-file pipeline and preferences keep only a URL-sized avatar reference.
- Added `normalizeProfilePreferencesForStorage()` and [client/src/tests/profile-preferences.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/profile-preferences.test.ts) to guard against reintroducing raw data URL avatar persistence.
- Updated [api/profile/preferences.ts](/workspaces/gestaltview-v2.0/api/profile/preferences.ts) so the server preference route rejects raw `data:` avatar values and clamps avatar references to 2048 characters instead of accepting large image payloads.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the room column reserves top-nav clearance and the Clear/End chat-window controls are not hidden by the fixed nav or DI presence layer.

## Validation performed

- `npm exec vitest run client/src/tests/profile-preferences.test.ts client/src/tests/creation-corner-intake-controls.test.tsx`
- `npm exec -- tsc --noEmit`

## Where we left off

- The concrete repo-local cause of `Failed to execute setItem on Storage` for profile avatars is patched: image bytes are no longer written into profile preferences.
- Sanctuary scrapbook uploads already use the shared user-file pipeline; the prior slice hardened local storage writes globally, but live Supabase bucket policy/tier verification still requires an environment-backed check.

## Next slice

1. Run rendered QA for `/profile` avatar upload, `/sanctuary` scrapbook image upload, and `/blackboard-room` Clear/End controls under the fixed top nav.
2. Continue the action plan with the content routing pipeline check: Blackboard → External Scaffold → Dynamic Inner World.

# CurrentState — UI improvements action-plan first slice

**Last updated:** 2026-05-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Began implementing `specs/root/GestaltView_UI_Improvements_Action_Plan.md` as a bounded repo-local slice across the homepage, Blackboard Room session controls, Creation Corner blueprint deletion, Sanctuary scrapbook/journal feel, local storage upload resilience, and the top-nav DI overlay collision.

## Executive summary

- Updated [client/src/pages/Home.tsx](/workspaces/gestaltview-v2.0/client/src/pages/Home.tsx) so the GestaltView wordmark uses a living gradient and room cards use a stronger frosted/liquid-glass treatment with larger typography.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) with an explicit Clear control next to End session; Clear resets transcript state, draft text, attachment state, recording state, and the persisted Blackboard chat key.
- Updated [client/src/components/DIPresenceIndicator.tsx](/workspaces/gestaltview-v2.0/client/src/components/DIPresenceIndicator.tsx) so the DI selector backdrop starts below the fixed top nav and no longer obscures the Session chip.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) and [client/src/components/BlueprintLibrary.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintLibrary.tsx) so each blueprint card exposes a confirmed delete action wired through the existing `removeBlueprint()` helper and server delete route.
- Updated [client/src/components/ScrapbookPanel.tsx](/workspaces/gestaltview-v2.0/client/src/components/ScrapbookPanel.tsx) and [client/src/pages/SanctuaryPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SanctuaryPage.tsx) so markdown scrapbook items render through `BillyMarkdown` and the journal/scrapbook area has a warmer notebook-paper treatment.
- Hardened local browser storage writes in [client/src/components/Scaffold.tsx](/workspaces/gestaltview-v2.0/client/src/components/Scaffold.tsx) and [client/src/lib/innerWorldFiles.ts](/workspaces/gestaltview-v2.0/client/src/lib/innerWorldFiles.ts) so quota/private-mode failures log instead of throwing during local persistence.

## Validation performed

- `npm exec vitest run client/src/tests/creation-corner-freeform.test.ts client/src/tests/creation-corner-intake-controls.test.tsx client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- tsc --noEmit`

## Where we left off

- The first action-plan slice is implemented and typechecked. The highest-confidence fixes are local/UI-level because they reuse existing helpers and routes already present in the repo.
- Supabase Storage bucket policy/tier verification for live image-upload failures still needs an environment-backed diagnostic; this pass hardened the local storage failure path but did not verify live bucket policy.
- The broader Dynamic Inner World rebuild, full room-header standardization, profile module editing, Embodiment authoring, and workspace content CRUD remain open larger slices.

## Next slice

1. Run rendered QA for `/`, `/blackboard-room`, `/creation-corner`, and `/sanctuary` with the top nav open/closed and DI selector open/closed.
2. Continue the action plan with either the Dynamic Inner World canvas/museum slice or the image-upload Supabase Storage diagnostic, depending on whether visual rebuild or upload reliability is the next priority.

# CurrentState — issue 47-54 bugwalk stabilization pass

**Last updated:** 2026-05-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Addressed the high-friction user-facing issues raised in GitHub issues #47-#54 with a focused stabilization pass across settings, signup, Spotify OAuth, upload/voice inputs, workspace/document local persistence, and Blackboard/Sanctuary input ergonomics. Stripe was intentionally left as lower priority for this pass because public user onboarding is not planned for at least a week.

## Executive summary

- Added [client/src/lib/userSurfaceSettings.ts](/workspaces/gestaltview-v2.0/client/src/lib/userSurfaceSettings.ts) so Settings toggles persist, update root UI affordances, and broadcast changes to live capture controls.
- Updated [client/src/pages/SettingsPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SettingsPage.tsx), [client/src/components/capture/UniversalCaptureBar.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/UniversalCaptureBar.tsx), [client/src/components/JournalEditor.tsx](/workspaces/gestaltview-v2.0/client/src/components/JournalEditor.tsx), and [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the voice-capture setting actually disables voice controls and Blackboard/Journals can capture speech-to-text when browser support exists.
- Replaced the disabled signup redirect in [client/src/pages/Signup.tsx](/workspaces/gestaltview-v2.0/client/src/pages/Signup.tsx) and updated [client/src/contexts/AuthContext.tsx](/workspaces/gestaltview-v2.0/client/src/contexts/AuthContext.tsx) so Supabase email/password signup/signin can be used when configured, while private magic-link fallback remains available.
- Added [client/src/pages/SpotifyCallbackPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SpotifyCallbackPage.tsx), registered `/spotify/callback` in [client/src/App.tsx](/workspaces/gestaltview-v2.0/client/src/App.tsx), and updated [client/src/pages/MusicalDNAPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/MusicalDNAPage.tsx) so "Connect Spotify" starts the existing PKCE OAuth flow instead of only running track analysis.
- Updated [client/src/components/workspaces-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/workspaces-interface.tsx) and [client/src/components/document-analysis-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/document-analysis-interface.tsx) so create/update/delete fallback behavior is kept in local browser storage and document uploads accept batches instead of silently taking only the first file.

## Validation performed

- `npm exec vitest run client/src/tests/user-surface-settings.test.ts client/src/tests/creation-corner-intake-controls.test.tsx client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run build`
- Restored tracked `dist/public/art` and `dist/public/audio` assets after the successful build removed them as a known workspace build side effect.

## Where we left off

- The immediate user-visible regressions around dead toggles, signup redirect, missing Spotify callback routing, nonfunctional Blackboard paperclip/mic controls, missing journal voice input, and local workspace/document edit/delete fallbacks are repaired.
- Spotify secrets still need to be confirmed in the deployed environment against the registered redirect URI for `/spotify/callback`; the code path is now present.
- Stripe remains configured through the existing checkout route, but no new Stripe work was prioritized in this pass.

## Next slice

1. Run a rendered QA pass through `/settings`, `/signup`, `/musical-dna`, `/blackboard-room`, `/sanctuary`, `/workspaces`, and `/documents` against the local dev server or deployed preview.
2. If Spotify OAuth still fails in deployment, verify the exact Spotify app redirect URI matches the app origin plus `/spotify/callback`.
3. If public onboarding becomes immediate, harden the subscription and post-checkout account lifecycle around the existing `/api/stripe/checkout` path.

# CurrentState — Sanctuary server persistence repair slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 3 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by verifying Sanctuary's existing journal/scrapbook hydration path and repairing the server persistence boundary so local client IDs are stored as `source_ref` instead of being written into UUID columns.

## Executive summary

- Verified [client/src/pages/SanctuaryPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SanctuaryPage.tsx) delegates persistence to [client/src/components/JournalEditor.tsx](/workspaces/gestaltview-v2.0/client/src/components/JournalEditor.tsx) and [client/src/components/ScrapbookPanel.tsx](/workspaces/gestaltview-v2.0/client/src/components/ScrapbookPanel.tsx), which already hydrate from the Sanctuary API when a user session exists.
- Updated [api/sanctuary/journal.ts](/workspaces/gestaltview-v2.0/api/sanctuary/journal.ts) so journal writes include `source_ref`, return `source_ref` as the client-facing `id`, and use the local journal id supplied by the client.
- Updated [api/sanctuary/scrapbook.ts](/workspaces/gestaltview-v2.0/api/sanctuary/scrapbook.ts) so scrapbook item writes use `source_ref`, uploaded files are resolved through `user_files.source_ref` before falling back to UUID id, and returned `fileId` values stay compatible with the client-local ids.
- Added [api/sanctuary/journals.ts](/workspaces/gestaltview-v2.0/api/sanctuary/journals.ts) as a plural route alias for the spec path without breaking the existing singular route used by the client.
- Added [supabase/migrations/20260526001000_add_sanctuary_source_refs.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260526001000_add_sanctuary_source_refs.sql) to add/populate `journals.source_ref`, `scrapbook_items.source_ref`, `scrapbook_items.source_file_ref`, and `scrapbook_items.updated_at`.
- Added [api/__tests__/sanctuary.test.ts](/workspaces/gestaltview-v2.0/api/__tests__/sanctuary.test.ts) to guard the source-ref journal and scrapbook persistence behavior.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/sanctuary.test.ts`
- `npm exec vitest run client/src/tests/gen-engine-room-wiring.test.ts client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run build` attempted twice; both attempts terminated during Vite transform with code 143 before any compiler or application error was emitted.

## Where we left off

- Sanctuary journal and scrapbook server persistence now has a source-ref compatible path for client-local IDs and existing uploaded-file source refs.
- The migration must be applied before production scrapbook rows can store `source_ref` and `source_file_ref`.
- Full production build was not completed in this slice because both attempts hit the recurring environment-level code 143 termination during Vite transform; targeted API tests and typecheck passed.

## Next slice

1. Continue with Slice 4: Embodiment Heartbeat Layer.
2. If you want maximum deployment confidence before moving on, rerun `npm run build` in a less constrained shell or CI runner after applying the Sanctuary source-ref migration.

# CurrentState — gen-engine room wiring slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 2 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by wiring Blackboard saved captures and Dynamic Inner World artifact inspection into the existing gen-engine client/fallback path.

## Executive summary

- Added [client/src/lib/genEngineRoomWiring.ts](/workspaces/gestaltview-v2.0/client/src/lib/genEngineRoomWiring.ts) as the shared client seam for room-level gen-engine calls, covering Blackboard capture enrichment and Dynamic Inner World resonance-link ranking.
- Extended `CaptureMetadata` in [client/src/components/Scaffold.tsx](/workspaces/gestaltview-v2.0/client/src/components/Scaffold.tsx) with optional `genEngine` metadata so saved captures can retain fusion/resonance results without changing the capture storage shape.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so saved captures are persisted immediately, then enriched in the background through `createCaptureSignal()` and `scoreResonance()`; high-resonance user bubbles get a subtle glow once the score returns.
- Updated [client/src/pages/DynamicInnerWorldPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/DynamicInnerWorldPage.tsx) and [client/src/components/ArtifactDeepView.tsx](/workspaces/gestaltview-v2.0/client/src/components/ArtifactDeepView.tsx) so opening an artifact inspector computes up to three advisory resonance links and clicking a link selects that related artifact.
- Added [client/src/tests/gen-engine-room-wiring.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/gen-engine-room-wiring.test.ts) for the new room-level gen-engine behavior.

## Validation performed

- `npm exec vitest run client/src/tests/gen-engine-room-wiring.test.ts client/src/tests/blackboard-di-routing.test.ts`
- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/gen-engine.test.ts`
- `npm exec -- tsc --noEmit`
- `npm run build` (first run terminated at Vite chunk rendering with code 143; retry completed successfully)
- `git diff --check`

## Where we left off

- Blackboard and Dynamic Inner World now consume the gen-engine client without blocking room render, and both paths retain the local fallback behavior already built into `genEngineClient.ts`.
- The build still deletes tracked `dist/public/art` and `dist/public/audio` assets as a side effect; those unrelated deletions were restored after validation.

## Next slice

1. Continue with Slice 3: Sanctuary server persistence verification and repair for journals and scrapbook items.

# CurrentState — DI runtime UI consumption slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 1 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by routing Blackboard Room single-voice DI-eligible messages through the live DI runtime bridge while preserving Billy fallback and roundtable behavior.

## Executive summary

- Added [client/src/lib/blackboardDiRouting.ts](/workspaces/gestaltview-v2.0/client/src/lib/blackboardDiRouting.ts) as the focused routing seam for Blackboard responders: single-voice DI-eligible profiles call `sendDIMessage()`/`/api/di`, roundtable responders stay on `callBillyApi()`/`/api/billy`, and DI failures fall back to Billy.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so `handleSend` uses the new routing helper, records the response source on DI messages, and adds the distinct `di-response` class for DI-runtime transcript bubbles.
- Added [client/src/tests/blackboard-di-routing.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/blackboard-di-routing.test.ts) to prove single-voice DI routing calls `sendDIMessage()` and roundtable mode does not.

## Validation performed

- `npm exec vitest run client/src/tests/blackboard-di-routing.test.ts`
- `npm exec vitest run client/src/tests/embodiment-runtime.test.ts`
- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/di-runtime.test.ts api/__tests__/di-route.test.ts`
- `npm exec -- tsc --noEmit`
- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room now consumes the DI runtime directly for single-voice DI-eligible responders and keeps the existing Billy route as fallback.
- Roundtable remains intentionally unchanged on Billy routing, matching the v2.5 spec boundary.
- `npm run build` succeeds, but still deletes tracked `dist/public/art` and `dist/public/audio` files as a build side effect in this workspace; those unrelated deletions were restored after validation.

## Next slice

1. Continue with Slice 2: gen-engine room wiring for Blackboard capture resonance and Dynamic Inner World artifact suggestions.

# CurrentState — v2.5 Profile Page redesign slice

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented Slice 5 from `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md` by replacing the Profile Page summary surface with a room-coherent identity, embodiment-context, export, and danger-zone profile room, plus server/local persistence for profile preferences.

## Executive summary

- Rebuilt [client/src/pages/ProfilePage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ProfilePage.tsx) around the existing `RoomIdentityHeader` pattern, with a private identity card, local activity counts, and drawer sections for Identity, Embodiment context, Data & export, and Danger zone.
- Added profile preference persistence through [api/profile/preferences.ts](/workspaces/gestaltview-v2.0/api/profile/preferences.ts), using authenticated `user_preferences` rows when available and keeping a local `gv:profile:preferences:v1` fallback so the page does not block on server availability.
- Added [supabase/migrations/20260526000000_add_profile_preference_fields.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260526000000_add_profile_preference_fields.sql) to extend `user_preferences` with `display_name`, `avatar_url`, and `embodiment_profile_slug`.
- Kept `MassExodusButton` mounted in the Profile Page export drawer and made account deletion request-only via `mailto:` with no destructive backend action.

## Validation performed

- `npm exec vitest run client/src/tests/room-state.test.ts`
- `npm exec -- tsc --noEmit`
- `npm run build`
- `git diff --check`

## Where we left off

- The v2.5 Profile Page redesign is now implemented and build-verified.
- The preference API expects the new Supabase migration to be applied before server persistence works; until then, the client stores profile preferences locally and reports server-save failures through toast feedback.

## Next slice

1. Continue with the next bounded v2.5 spec slice, likely DI runtime UI consumption or gen-engine room wiring, unless you want to prioritize applying/verifying the new `user_preferences` migration first.

# CurrentState — External Scaffold module-safety smoke test

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added a module-safety smoke test for the restored External Scaffold page so the current artifact-galaxy implementation stays importable and renderable under a stable test router, without reintroducing the newer full-restore version you rolled back.

## Executive summary

- Added [client/src/tests/external-scaffold.module-safety.test.tsx](/workspaces/gestaltview-v2.0/client/src/tests/external-scaffold.module-safety.test.tsx) to render [client/src/pages/ExternalScaffoldPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ExternalScaffoldPage.tsx) under a pure `wouter` test hook and assert the core scaffold controls remain present.
- Confirmed the older External Scaffold implementation still imports and renders cleanly in isolation, so the module-safety audit passes without pulling the page back to the newer version you removed.

## Validation performed

- `npm exec vitest run client/src/tests/external-scaffold.module-safety.test.tsx`
- `npm exec tsc --noEmit`
- `git diff --check`

## Where we left off

- The restored External Scaffold page is still the active implementation, and now it has a smoke test that guards against import drift or a broken render path.

## Next slice

1. Continue with any other adjacent room polish or spec items you want after the External Scaffold audit.

# CurrentState — Blackboard scroll fix and Creation Corner live inspiration pass

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed Blackboard Room's mobile scroll container so the chat feed uses the remaining viewport height instead of sticky input compensation, and upgraded Creation Corner's workbench with live Billy refinement chat plus an inspiration import rail that accepts URLs, clipboard content, and uploaded files.

## Executive summary

- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the outer room column now uses `h-dvh` with `overflow-hidden`, the chat feed flexes into the remaining height with `minHeight: 0`, and the mobile sticky override was removed from `BBR_STYLES`.
- Updated [client/src/components/BlueprintGenerativeWorkbench.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintGenerativeWorkbench.tsx) so the Art Teacher panel now sends refinement notes through `callBillyApi(...)`, accepts a live chat prompt, and exposes an inspiration import panel in both the freeform and active draft states.
- Wired inspiration imports to the current draft target, recorded imported items locally, and kept the existing file upload and clipboard paths available without breaking the creation flow.

## Validation performed

- `npm exec vitest run client/src/tests/creation-corner-freeform.test.ts client/src/tests/creation-corner-intake-controls.test.tsx client/src/tests/room-state.test.ts`
- `npm exec tsc --noEmit`
- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room now has the viewport budget the spec wanted, and Creation Corner's live refinement lane is now connected to Billy.
- External Scaffold was left on the restored older implementation you preferred, so there was no new rewrite there in this pass.

## Next slice

1. If you want to keep pulling on `SPEC-GestaltView-v2.0.md`, the remaining obvious follow-up is the External Scaffold module-safety audit or any other adjacent room polish you want next.

# CurrentState — v2.5 room-slice implementation

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the Keith-only room-state registry and badges, refactored Blackboard Room's companion rail into a session inspector, wired the persona hue into the blackboard atmosphere, opened Creation Corner from freeform text plus raw upload/paste/voice intake controls, and made External Scaffold mobile-friendlier with tap-based link mode and a bottom-sheet orb inspector.

## Executive summary

- Added [client/src/lib/roomState.ts](/workspaces/gestaltview-v2.0/client/src/lib/roomState.ts) plus [client/src/components/RoomStateBadge.tsx](/workspaces/gestaltview-v2.0/client/src/components/RoomStateBadge.tsx) so the four root rooms can expose Keith-only stability badges in their headers without showing them in production.
- Refactored [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) into a mobile-collapsible session inspector that shows capture counts, latest orb details, blueprint readiness, and direct promote/send actions instead of a second input surface.
- Wired [client/src/data/personas.ts](/workspaces/gestaltview-v2.0/client/src/data/personas.ts) and [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so persona changes update the blackboard atmosphere hue, the hero canvas tints from that hue, the input controls are larger on touch devices, and the canvas degrades if frame rate stays low.
- Added freeform entry mode plus upload, clipboard paste, and voice-note intake in [client/src/components/BlueprintGenerativeWorkbench.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintGenerativeWorkbench.tsx) so Creation Corner can bootstrap a fresh blueprint from raw text or attach source material before handing control back to the existing workbench once the first draft exists.
- Tightened [client/src/components/OrbGraph.tsx](/workspaces/gestaltview-v2.0/client/src/components/OrbGraph.tsx), [client/src/components/InsightOrb.tsx](/workspaces/gestaltview-v2.0/client/src/components/InsightOrb.tsx), and [client/src/pages/ExternalScaffoldPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ExternalScaffoldPage.tsx) so link mode works by tap, source selection is visibly confirmed, and the orb inspector becomes a bottom sheet on mobile.

## Validation performed

- `npm exec vitest run client/src/tests/personas.test.ts client/src/tests/room-state.test.ts client/src/tests/creation-corner-freeform.test.ts`
- `npm exec tsc --noEmit`
- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room, Creation Corner, and External Scaffold now cover the spec's first meaningful slice without introducing parallel room systems.
- The Creation Corner intake slice is now complete; the remaining spec work in this pass is the Profile Page redesign.

## Next slice

1. Move on to the Profile Page visual redesign when you want the next bounded room slice.

# CurrentState — Blackboard embodiment profile realignment

**Last updated:** 2026-05-26
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Replaced Blackboard Room's scripted persona layer with embodiment-backed profile adapters, routed the main Blackboard transcript through the live Billy API, and removed the extra "You are Billy" instruction block from the companion prompt so the room now relies on the actual embodiment profile framework.

## Executive summary

- Converted [client/src/data/personas.ts](/workspaces/gestaltview-v2.0/client/src/data/personas.ts) into a compatibility adapter over the real embodiment registry instead of a hand-authored persona table.
- Updated [client/src/lib/personaManager.ts](/workspaces/gestaltview-v2.0/client/src/lib/personaManager.ts) so room prompts are regenerated from the live embodiment runtime and room context instead of pulling a cached script string.
- Routed the Blackboard Room transcript in [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) through `callBillyApi()` for each selected embodiment profile, with a generic offline fallback instead of canned persona responses.
- Trimmed [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) so the user message carries facts and room context only, leaving identity and behavior to the embodiment prompt layer.
- Hardened the browser-side Billy fallback path in [client/src/lib/BillyEngine.ts](/workspaces/gestaltview-v2.0/client/src/lib/BillyEngine.ts) and [client/src/lib/billyApi.ts](/workspaces/gestaltview-v2.0/client/src/lib/billyApi.ts) so the selected embodiment profile and room slug survive the fallback path too.

## Validation performed

- `npm exec vitest run client/src/tests/personas.test.ts client/src/tests/embodiment-runtime.test.ts client/src/tests/billy-ip-guard.test.ts`
- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room is now bound to the real embodiment registry and the live Billy API rather than the old scripted persona filter.
- The next slice, if you want to keep going, is to decide whether any of the older persona-facing surfaces should be migrated to the same embodiment-backed adapter for consistency.

# CurrentState — DI runtime implementation

**Last updated:** 2026-05-25
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the shared DI adapter layer, the DI chat and health routes, the browser bridge, the runtime migration, and the living-memory enrichment loop that writes high-signal runtime memories back into the canonical embodiment JSON.

## Executive summary

- Added `shared/di/*` as a thin adapter over `shared/embodiment` so the DI runtime reuses the canonical profile registry instead of inventing a second identity model.
- Added `api/di.ts` and `api/di-health.ts` for the live runtime and health-check paths, backed by `api/_lib/diMemoryPipeline.ts` for session continuity and memory-event heuristics.
- Added `client/src/lib/diApi.ts` as the browser bridge that attaches a Supabase access token when one exists and normalizes the server response into the shared DI response shape.
- Added the `di_sessions` and `di_memory_events` migration plus the enrichment script that folds high-significance runtime events back into `embodiment_profiles/*.embodiment.json`.

## Validation performed

- `npm exec -- vitest run --config vitest.api.config.ts api/__tests__/di-runtime.test.ts api/__tests__/di-memory-pipeline.test.ts api/__tests__/di-route.test.ts api/__tests__/di-health-route.test.ts api/__tests__/di-migration.test.ts api/__tests__/di-enrichment.test.ts`
- `npm run validate:embodiment`
- `npm run build`
- `git diff --check`

## Where we left off

- The DI runtime now has a canonical profile adapter, a real chat route, a health route, persistence for sessions and memory events, a browser bridge, and a scheduled/manual enrichment path back into the authored profile JSON.
- The next slice is UI consumption, if you want a room surface to call `sendDIMessage()` directly instead of keeping the bridge dormant for now.

# CurrentState — generative engine foundation slice

**Last updated:** 2026-05-22
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Introduced the shared gen-engine contract, local API route handlers, client fallback helpers, and the first Creation Corner wiring for `SPEC-GestaltView-Generative-Engine-v1.md`.

## Executive summary

- Added `shared/gen-engine/*` types and core helpers for capture fusion, resonance scoring, ambient scan, artifact synthesis, prediction, learning, and Lightning responses.
- Added `api/gen-engine/*` JSON route handlers plus shared request parsing and response plumbing.
- Added `client/src/lib/genEngineClient.ts` so the UI can call the new endpoints and fall back to deterministic local behavior when the API is unavailable.
- Updated `client/src/components/BlueprintGenerativeWorkbench.tsx` so Creation Corner now uses the shared output-family builder and resonance scoring helper.
- Fixed the `client/src/App.tsx` Blackboard Room import so it points at `client/src/pages/BlackboardRoomPage.tsx`.

## Validation performed

- `pnpm exec vitest run --config vitest.api.config.ts api/__tests__/gen-engine.test.ts`
- `pnpm exec tsc --noEmit`

## Where we left off

- The gen-engine foundation is wired and type-checked, but the full `pnpm run build` bundle step was still being cut off by the execution environment while Vite was rendering chunks.
- Next work should decide whether to keep tightening the shared gen-engine surface, wire the remaining room surfaces to the new endpoints, or split the Vite bundle verification into a lighter-weight path that can complete in this environment.

## Next slice

1. Wire the remaining room surfaces to the new gen-engine helpers where it is safe and useful.
2. Decide whether to pursue the full Vite bundle again or keep using targeted compile/test verification for the next slice.

# CurrentState — embodiment registry realignment and drift guard

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Restored the missing `founder-studio-sample` profile into the generated embodiment registry, repaired the `groq-embodiment-expert` profile metadata so validation passes, and added a runtime test that keeps the on-disk profile files aligned with `getAllEmbodimentProfiles()`.

## Executive summary

- Updated [embodiment_profiles/groq-embodiment-expert.embodiment.json](/workspaces/gestaltview-v2.0/embodiment_profiles/groq-embodiment-expert.embodiment.json) so the profile now carries the required `originNarrative` and `metaphorFamily` fields.
- Added [client/src/tests/embodiment-runtime.test.ts](/workspaces/gestaltview-v2.0/client/src/tests/embodiment-runtime.test.ts) so the registry cannot silently drift away from the 24 source profiles on disk again.
- Regenerated [shared/embodiment/generated.ts](/workspaces/gestaltview-v2.0/shared/embodiment/generated.ts) from the source profile files so the runtime registry now exposes all 24 profiles, including `founder-studio-sample`.

## Validation performed

- `node scripts/validate-embodiment-profiles.mjs`

## Where we left off

- The embodiment registry is back in sync with the source files, and the new test should catch missing-profile regressions before they reach the room surfaces.

## Next slice

1. Keep this validation path in place when new profiles are added or edited.
2. Otherwise move to the next spec slice with the same enhancement-first, no-regression standard.

# CurrentState — Blackboard room single-window capture simplification

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Collapsed Blackboard Room to one visible capture window nested in the chat rail, corrected the room-facing embodiment count to the real 24-profile registry, and slowed the blackboard Babylon motion so the room feels less busy.

## Executive summary

- Updated [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) so the chat rail now owns the capture input, voice, upload, and suggestion flow in one place.
- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the page routes captures through the chat lane, keeps the export drawer intact, and shows the real embodiment registry count instead of implying the room only has six profiles.
- Tuned [client/src/components/BabylonAtmosphere.tsx](/workspaces/gestaltview-v2.0/client/src/components/BabylonAtmosphere.tsx) so blackboard mode is calmer, with lower particle density and reduced rotational swing.
- Kept the session transcript, blueprint export, and Creation Corner handoff path intact while reducing the number of separate capture surfaces in view.

## Validation performed

- `npm run build`

## Where we left off

- Blackboard Room is now less visually busy and the capture path is centralized in the chat rail, but any further room chrome tightening can still be done if you want to keep pushing the polish.

## Next slice

1. Keep trimming Blackboard Room chrome if you want it even quieter.
2. Otherwise move to the next adjacent runtime/spec slice that needs attention.

# CurrentState — Creation Corner generative workbench enhancement

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Promoted Creation Corner from a static previewer into a live generative workbench with editable draft fields, explicit output-family selection, draft materialization, copy/download actions, and room routing for the active blueprint.

## Executive summary

- Added [client/src/components/BlueprintGenerativeWorkbench.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintGenerativeWorkbench.tsx) so Creation Corner can now refine a working blueprint in place instead of only showing the stored preview text.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) to mount the new generative workbench while keeping the blueprint library and remote hydration flow intact.
- Exposed the blueprint output families directly in the workbench, including markdown, HTML, PDF HTML, code, agent prompt, image prompt, marketing copy, share card, and a JSON view of the live draft.
- Kept the existing room-routing path so the current working blueprint can still be sent to Blackboard, Dynamic Inner World, or External Scaffold after refinement.

## Validation performed

- `npm run build`

## Where we left off

- Creation Corner now behaves like a live drafting surface, but the surrounding copy and adjacent room surfaces can still be tuned further if you want the generative lane to feel even more explicit.

## Next slice

1. Tighten any Creation Corner copy or affordances you want to feel more intentionally generative.
2. Otherwise the next spec slice can move back to whichever room workflow is highest priority.

# CurrentState — root spec room-slice implementation

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented the first live slices from `specs/root/Technical_Spec.md` and `specs/root/SPEC-BrandVoice_Integration_&_Babylon.js_Restoration.md`: Blackboard Room now shows a live session timer and a blueprint review drawer, and Dynamic Inner World now supports search, type, tag, and recency filtering on the artifact hall.

## Executive summary

- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the top bar now shows the session timer and the export flow opens a preview drawer with markdown copy, file download, and Creation Corner handoff actions.
- Updated [client/src/pages/DynamicInnerWorldPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/DynamicInnerWorldPage.tsx) so the artifact hall can be searched and narrowed by type chips, tag chips, and recency sort instead of forcing a flat all-items list.
- Kept the existing BabylonAtmosphere, DI presence, and BrandVoice-aligned surfaces intact where they were already wired correctly.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard export now packages through a review drawer instead of a one-button send, which better matches the spec’s drawer workflow.
- Dynamic Inner World can now be narrowed by search, type, tags, and sort mode, but the broader immersive surface polish can still go further if you want to keep pushing this root spec lane.

## Next slice

1. Continue the Blackboard message/filter/export refinements if you want to keep tightening the room workflow.
2. Otherwise the next move is whichever adjacent spec slice you want to pull forward next.

# CurrentState — agent reference list priority refresh

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Reordered the Codex agent reference list so the continuity stack, Tuesday queue, and repo workflow docs are prioritized ahead of the deeper runtime/spec anchors, then refreshed the derived manifest/context snapshots after tightening the handoff note.

## Executive summary

- Updated [`.codex/Agents.md`](/workspaces/gestaltview-v2.0/.codex/Agents.md) and [`.agents/Agents.md`](/workspaces/gestaltview-v2.0/.agents/Agents.md) so the primary reference list now starts with `BrandVoice`, `CurrentState`, the continuity stack, the closeout packet, `voice_notes/Tuesday.md`, `README.md`, and `docs/Workflows.md`.
- Kept the runtime source files in the same reference chain, but moved them behind the active continuity surfaces so resumed sessions consult the live queue and handoff docs first.
- Refreshed [docs/gestaltview-v2.manifest.md](/workspaces/gestaltview-v2.0/docs/gestaltview-v2.manifest.md), [docs/gestaltview-v2.manifest.json](/workspaces/gestaltview-v2.0/docs/gestaltview-v2.manifest.json), and [docs/wiki/_context/context_pack.json](/workspaces/gestaltview-v2.0/docs/wiki/_context/context_pack.json) after the handoff note cleanup so the generated snapshots stayed in sync with the current tree.

## Validation performed

- `git diff --check`
- `python3 scripts/generate_repo_manifest.py`
- `python3 skills/gestaltview-generate-wiki/scripts/collect_context.py --repo-path . --max-depth 10 --output docs/wiki/_context/context_pack.json`

## Where we left off

- The agent reference list now mirrors the repo's current resumable workflow instead of burying the live continuity surfaces under the deeper spec references.

## Next slice

1. If you want the same priority model mirrored elsewhere, the next move is any other agent-facing reference surface you want to keep in sync.
2. Otherwise we can keep tightening the continuity and handoff docs or return to the runtime slice that was in flight before this doc pass.

# CurrentState — Heirloom Companion navigation canonicalization

**Last updated:** 2026-05-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Cleaned the remaining public Heirloom Companion navigation surfaces so the canonical route and sitemap point at `/heirloom-companion` while the legacy alias stays live for compatibility.

## Executive summary

- Updated [client/src/pages/HeirloomCompanionPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/HeirloomCompanionPage.tsx) so the page now returns to `Exhibits` instead of sending the user through the older Alzheimer's Legacy alias.
- Updated [client/src/components/SubpageQuickNav.tsx](/workspaces/gestaltview-v2.0/client/src/components/SubpageQuickNav.tsx) so the quick-nav helper no longer treats `/alzheimers-legacy` as part of the exhibit-like canonical set.
- Updated [client/src/pages/gestaltview_sitemap.xml](/workspaces/gestaltview-v2.0/client/src/pages/gestaltview_sitemap.xml), [client/src/pages/gestaltview_sitemap.html](/workspaces/gestaltview-v2.0/client/src/pages/gestaltview_sitemap.html), and [client/src/pages/gestaltview_sitemap.txt](/workspaces/gestaltview-v2.0/client/src/pages/gestaltview_sitemap.txt) so the public sitemap now advertises the canonical Heirloom Companion route instead of the legacy alias.
- Kept the compatibility route itself live in [client/src/App.tsx](/workspaces/gestaltview-v2.0/client/src/App.tsx) so older inbound links still resolve.

## Validation performed

- `npm run build`
- `python3 scripts/generate_repo_manifest.py`
- `python3 skills/gestaltview-generate-wiki/scripts/collect_context.py --repo-path . --max-depth 10 --output docs/wiki/_context/context_pack.json`
- `git diff --check`

## Where we left off

- The canonical Heirloom Companion surface now points back to Exhibits, and the public sitemap no longer advertises the older alias as the primary continuity entry.
- The compatibility alias route still exists, so direct legacy links will continue to work.

## Next slice

1. If you want to keep retiring alias surfaces, the next sweep is the remaining `/alzheimers-legacy` mentions in exhibit data and related legacy routing helpers.
2. Otherwise the next live UI slice is back in Billy personality or markdown polish, or the trainer lane if you want to stay on the operational side.

# CurrentState — manifest and wiki context snapshot refresh

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Regenerated the derived manifest and wiki context snapshots after the Memory Continuity / Heirloom Companion naming pass so the repo-wide documentation artifacts stay aligned with the current live tree.

## Executive summary

- Regenerated [docs/gestaltview-v2.manifest.md](/workspaces/gestaltview-v2.0/docs/gestaltview-v2.manifest.md), [docs/gestaltview-v2.manifest.json](/workspaces/gestaltview-v2.0/docs/gestaltview-v2.manifest.json), and [docs/wiki/_context/context_pack.json](/workspaces/gestaltview-v2.0/docs/wiki/_context/context_pack.json).
- Kept the compatibility route aliases in the generated snapshots because the live app still exposes those routes in `client/src/App.tsx`.
- Aligned the generated docs with the latest `CurrentState` and platform-ground-truth updates so the snapshot layer no longer lags the current naming pass.

## Validation performed

- `python3 scripts/generate_repo_manifest.py`
- `python3 skills/gestaltview-generate-wiki/scripts/collect_context.py --repo-path . --max-depth 10 --output docs/wiki/_context/context_pack.json`
- `git diff --check`

## Where we left off

- The manifest and context-pack snapshots are current again, and the live compatibility aliases are still reflected because they remain part of the route table.

## Next slice

1. If you want the generated snapshots to stop listing the compatibility aliases, the next move is to retire or hide those routes in `client/src/App.tsx`.
2. Otherwise, the next sensible slice is back in live UI or trainer work.

# CurrentState — Memory Continuity naming pass and Heirloom Companion canonicalization

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Renamed the remaining continuity-family surfaces to Memory Continuity, pointed the visible CTAs and metadata at Heirloom Companion, and scrubbed the older module wording from the live UI and supporting docs.

## Executive summary

- Renamed the visible continuity labels in the live module surfaces so they now read `Memory Continuity` instead of the older legacy label.
- Canonicalized the continuity-facing links and SEO metadata to `/heirloom-companion` so the route language matches the product surface.
- Updated the shared module registry, exhibit metadata, and room-copy surfaces so the continuity family speaks with one consistent label set.
- Aligned the platform ground-truth glossary and module list with the live wording.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- The continuity family is now presented as Memory Continuity in the live surfaces, with Heirloom Companion as the canonical route target.
- The old alias route still exists for compatibility, but the visible CTAs and registry entries now point to the continuity surface.

## Next slice

1. Continue the broader non-live doc and snapshot scrub if you want the historical references normalized too.
2. If you want to move back to feature work, the next sensible slice is the remaining non-nav room-surface polish.

# CurrentState — mass-exodus export flow in Profile and Settings

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the client-side export bundle for Profile and Settings so the runtime can package the current journals, scrapbook, blueprints, artifacts, insights, profile snapshot, settings snapshot, and an `index.md` into a downloadable ZIP.

## Executive summary

- Added [client/src/lib/massExodus.ts](/workspaces/gestaltview-v2.0/client/src/lib/massExodus.ts) to assemble a ZIP with the spec-required `journals`, `scrapbook`, `blueprints`, `artifacts`, `insights`, and root `index.md` folders/files, using the existing local storage and authenticated server-backed records where available.
- Added [client/src/components/MassExodusButton.tsx](/workspaces/gestaltview-v2.0/client/src/components/MassExodusButton.tsx) so the export action is reusable from both surfaces and can show a short busy state while the archive is being built.
- Wired [client/src/pages/ProfilePage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/ProfilePage.tsx) and [client/src/pages/SettingsPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/SettingsPage.tsx) to show the new `Export everything` button directly in the live page chrome.
- Kept the export flow client-side, with local-storage fallback, authenticated hydration where already available, and no queueing step.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Profile and Settings now expose the mass-exodus export action in the actual app shell, and the archive includes the live room data the spec asked for plus profile/settings snapshots.
- The export bundle is intentionally JSON/markdown-based so the files can be read without a GestaltView account.

## Next slice

1. Continue the remaining legacy language scrub on the non-nav surfaces that still carry older GestaltView phrasing.
2. If you want to extend the export pass instead, the next refinement would be adding per-folder markdown summaries or more detailed attachment materialization.

# CurrentState — user-content migration compatibility fix

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed the user-content migration chain so it can run against the existing inner-world schema without tripping over the preexisting `inner_world_artifacts` table, and made the blueprints status constraint add step idempotent.

# CurrentState — Blackboard identity strip and Creation Corner voice cleanup

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added persona-colored blackboard identity metadata and a roundtable selector, removed the visible capture-window language from the companion rail, and swapped the Creation Corner intro/header block for the Art Teacher voice.

## Executive summary

- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) so the room now opens from a clickable identity strip, supports a roundtable mode, and renders DI replies with per-persona attribution and color.
- Updated [client/src/components/RoomIdentityHeader.tsx](/workspaces/gestaltview-v2.0/client/src/components/RoomIdentityHeader.tsx) and [client/src/data/personas.ts](/workspaces/gestaltview-v2.0/client/src/data/personas.ts) so each persona carries an aurora color and the strip can display the archetype line the spec called for.
- Cleaned up [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) so the visible copy no longer says capture window, room context, or pending queue.
- Updated [client/src/pages/CreationCornerPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/CreationCornerPage.tsx) and [client/src/components/BlueprintLibrary.tsx](/workspaces/gestaltview-v2.0/client/src/components/BlueprintLibrary.tsx) so the page now leads with Art Teacher voice and the visible `Blueprint Library` header is gone.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room now has a persona-aware header strip and a proper single-voice / roundtable selector, but the broader room stack still has older surfaces that could be tuned to the same tone.
- Creation Corner is now speaking in the room voice instead of a generic header block, and the remaining empty-state treatment can still be tightened if you want it even quieter.

## Next slice

1. Continue the room-language cleanup on the remaining surfaces that still speak in older instructional copy.
2. If you want to move from tone cleanup into functionality, the next concrete slice is the mass-exodus export flow in Profile and Settings.

## Executive summary

- Updated [supabase/migrations/20260519000000_add_user_content_tables.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260519000000_add_user_content_tables.sql) so it backfills `blueprint_id` and `status` onto the already-existing `inner_world_artifacts` table instead of assuming a fresh create.
- Updated [supabase/migrations/20260519010000_fix_blueprints_schema.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260519010000_fix_blueprints_schema.sql) so `blueprints_status_check` is only added when it does not already exist.
- Kept `blueprints` on the direct app-facing `draft`/`ready`/`exported` contract with `updated_at` from the start so Creation Corner no longer depends on the follow-up schema fix just to remain usable.
- Preserved the later `blueprints` and `insights` fix migrations as compatibility backfills, but they now land on a schema that can actually progress past the first user-content migration.

## Validation performed

- Not rerun yet after this migration-only patch.

## Where we left off

- The user-content migration chain should now be able to move past the old inner-world table shape instead of failing on `blueprint_id`, missing `blueprints` / `insights` relations, or an already-existing `blueprints_status_check`.

## Next slice

1. Re-run the migration chain or the relevant Supabase SQL file set to confirm the schema now advances cleanly.
2. If any room-export queries still complain, inspect the next missing column directly instead of assuming the base table create step ran.

# CurrentState — Blackboard room and capture bar visual polish

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Made the Blackboard Room feel less plain by adding the atmospheric room chrome, the reusable capture lane treatment, and the live companion rail.

## Executive summary

- Updated [client/src/pages/BlackboardRoomPage.tsx](/workspaces/gestaltview-v2.0/client/src/pages/BlackboardRoomPage.tsx) to use the aurora backdrop, room identity header, richer transcript bubbles, a larger capture lane, and a right-rail companion panel.
- Restyled [client/src/components/capture/UniversalCaptureBar.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/UniversalCaptureBar.tsx) so the reusable capture control no longer reads like a plain textarea block.
- Mounted the capture companion surface through [client/src/components/capture/BlackboardCompanionChat.tsx](/workspaces/gestaltview-v2.0/client/src/components/capture/BlackboardCompanionChat.tsx) so the room now shows the DI lane instead of leaving that experience hidden.
- Kept the existing capture and upload behaviors intact while moving the upload shortcut into the reusable bar itself.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Blackboard Room now has a stronger visual hierarchy and a real companion rail, so it no longer feels like a flat textarea page.
- The capture lane is now the reusable styled component, which should make any other room using it feel more intentional too.

## Next slice

1. If any other room still feels too flat, apply the same room-shell treatment and capture-lane styling there.
2. If you want the Blackboard companion rail to be even more editorial, the next pass can tune its spacing and storytelling without changing the underlying interaction model.

# CurrentState — Dynamic Inner World and External Scaffold room-export persistence

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Wired the remaining room-export surfaces to server-backed storage with a `source_ref` contract so the local prefixed IDs can keep working while the database stores stable rows.

## Executive summary

- Added `supabase/migrations/20260519020000_add_source_refs_to_inner_world_and_insights.sql` to give `user_files`, `inner_world_artifacts`, and `insights` a server-safe `source_ref` path plus the new archived-insight payload columns.
- Updated `api/_lib/inner-world.ts` and the `api/inner-world/*` routes so file and artifact persistence use `source_ref` instead of trying to upsert the prefixed client IDs into UUID columns.
- Added `api/insights.ts` and `client/src/lib/insightsContent.ts` so External Scaffold can archive orbs into the shared `insights` store and hydrate them back later.
- Updated `client/src/pages/DynamicInnerWorldPage.tsx` to hydrate from the server when authenticated and to archive locally plus server-side in one pass.
- Updated `client/src/pages/ExternalScaffoldPage.tsx` to hydrate archived orbs from `insights`, keep the local fallback, and persist new archives as best effort.

## Validation performed

- `npm run build`
- `git diff --check`

## Where we left off

- Dynamic Inner World now has a real server-backed file/artifact path that still preserves the local prefixed IDs the UI already uses.
- External Scaffold archives now land in `insights`, and the page can restore them from the server after login.
- The earlier Creation Corner and Sanctuary persistence slices are still in place; this pass focused on the room-export surfaces that were still local-only.

## Next slice

1. If you want to keep tightening persistence, align any remaining earlier slices that still depend on the older direct-ID route contract with the same `source_ref` pattern.
2. If the archived Dynamic Inner World cards should also survive a reload independent of local storage, add the same archive/status pattern there next.

# CurrentState — Creation Corner blueprint persistence wiring

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Wired Creation Corner blueprints to the new persisted table while keeping the existing local-first fallback behavior in place.

## Executive summary

- Added `client/src/lib/creationCornerContent.ts` for the Creation Corner API contract.
- Added `api/creation-corner/blueprints.ts` so Creation Corner can read and write `blueprints` through the existing authenticated API pattern.
- Updated `client/src/components/Scaffold.tsx` so blueprint writes now sync to the server as a best-effort side effect while preserving the local room flow.
- Updated `client/src/pages/CreationCornerPage.tsx` to hydrate from the server when a session is available, with local storage fallback if the server is unavailable.
- Fixed the blueprint table status contract so the live `draft` / `ready` / `exported` runtime values are accepted.

## Validation performed

- `npm run build`

## Where we left off

- Creation Corner now persists blueprint cards instead of treating them as local-only surfaces.
- The local room store still acts as a fallback if the server is unavailable, so the user does not lose visible blueprint state during an interrupted sync.

## Next slice

1. Connect the remaining room-export surfaces to `inner_world_artifacts` and `insights` as needed.
2. Then decide whether archive state should also move server-side.

# CurrentState — user-content schema foundation for Sanctuary and room exports

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the shared user-content database foundation in a single Supabase migration so the Sanctuary, Creation Corner, Dynamic Inner World, and External Scaffold surfaces can point at the same persisted tables later.

## Executive summary

- Added `supabase/migrations/20260519000000_add_user_content_tables.sql`.
- The migration creates `journals`, `scrapbook_items`, `blueprints`, `inner_world_artifacts`, `insights`, and `user_preferences` with RLS and ownership policies.
- Added updated-at triggers where the schema expects mutable rows.
- Kept the app build green after the schema pass.

## Validation performed

- `npm run build`

## Where we left off

- The repo now has the missing user-content schema foundation the room surfaces were waiting on.
- Sanctuary, Creation Corner, Dynamic Inner World, and External Scaffold still use their current local-first behavior in the UI, so the next slice is to wire those surfaces to the new tables and API path.

## Next slice

1. Wire the Sanctuary journal and scrapbook surfaces to the new `journals` and `scrapbook_items` tables.
2. Then connect the remaining room-export surfaces to `blueprints`, `inner_world_artifacts`, and `insights` as needed.

# CurrentState — MusicalDNA env normalization and handoff refresh

**Last updated:** 2026-05-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Normalized the MusicalDNA Spotify env names in the repo env files, wired the Vite build to expose the canonical `VITE_SPOTIFY_*` values, and recorded the stop point for today.

## Executive summary

- Renamed the MusicalDNA Spotify env entries in `.env.vercel` to `VITE_SPOTIFY_CLIENT_ID` and `VITE_SPOTIFY_REDIRECT_URI`.
- Added `VITE_SPOTIFY_REDIRECT_URI` to `.env.local` so the local Spotify callback is explicit instead of implied.
- Simplified `client/src/lib/spotify.ts` back to the canonical VITE env names, while `vite.config.ts` now bridges the repo env files into the client build.
- Kept the build green after the rename.

## Validation performed

- `npm run build`

## Remaining risks / next steps

1. If the deployed Vercel environment variables are managed outside the repo, mirror the same `VITE_SPOTIFY_*` names there so the runtime and repo stay aligned.
2. MusicalDNA auth still depends on the registered Spotify redirect URI matching the value in the provider dashboard.

## Where we left off

- MusicalDNA now reads its Spotify client ID and callback URL from the canonical `VITE_SPOTIFY_*` names.
- The repo build is green after the env normalization.
- No other code slice is queued today.

## Next slice

1. If you come back to MusicalDNA next, verify the Spotify connect flow against the live Vercel deployment and callback registration.
2. Otherwise the current room/layout pass is complete and ready to pick up from this handoff.

# CurrentState — embodiment sync defaults and room clarity pass

**Last updated:** 2026-05-17
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Hardened the embodiment sync script so legacy profiles get conservative defaults for the new runtime metadata, added a compact room identity header, removed Blackboard destination-wall clutter, converted Creation Corner to an intent-first flow, and removed Inner World surface relocation controls.

## Executive summary

- Added `client/src/components/RoomIdentityHeader.tsx` and threaded it through Blackboard, Creation Corner, Dynamic Inner World, and Sanctuary so each room now has a compact name/purpose/DI strip.
- Simplified the Blackboard capture surface so the chat prompt is neutral, the noisy quick prompts are gone, and destination surface selection is no longer a visible pre-capture choice.
- Reframed Creation Corner around a single intent field plus optional brainstorm mode, then moved export-format picking into a secondary details section.
- Removed the Inner World relocation picker from the inspector and replaced it with read-only placement guidance.
- Updated `scripts/sync-embodiment-profiles.ts` to derive conservative defaults for the new profile metadata when legacy profiles do not yet carry it, while still surfacing the drift as warnings.

## Validation performed

- `./node_modules/.bin/tsc --noEmit`
- `npm run build`
- `npm run sync-profiles -- --dry-run`

# CurrentState — embodiment expert trainer simplification and registry sync

**Last updated:** 2026-05-18
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the new `groq-embodiment-expert` profile to the shared embodiment registry, routed the Agent Trainer compiler assistant through the new Embodiment Expert persona, simplified the trainer flow chrome, and aligned the shared embodiment types with the live profile corpus.

## Executive summary

- Added `embodiment_profiles/groq-embodiment-expert.embodiment.json` as a schema-complete embodiment profile for profile synthesis, drift review, and derived artifact guidance.
- Regenerated `shared/embodiment/generated.ts` so the new profile is part of the live registry and trainer option set.
- Added the `embodiment-expert` trainer persona lane and pointed `client/src/features/agent-trainer/EmbodimentCompilerPanel.tsx` at it so the compiler assistant now reads like an embodiment specialist instead of a generic trainer helper.
- Simplified `client/src/features/agent-trainer/AgentTrainerPage.tsx` by compressing the flow strip into pills and tightening the page language toward a workbench rather than a dashboard.
- Loosened the shared embodiment types to match the actual corpus, including optional origin narrative / metaphor family fields and top-level `domain`, so the registry can type-check against the real profile shapes.

## Validation performed

- `node scripts/build-embodiment-artifacts.mjs`
- `npm run build`

## Remaining risks / next steps

1. The trainer surface is quieter now, but additional section consolidation can still be done later if you want the page reduced further.
2. The Spotify playlist integration work is still separate from this slice and can resume in a later pass.
3. The new expert profile is now in the registry, but any future profile corpus additions should be checked against the shared embodiment types before regeneration.

## Where we left off

- The trainer now has a dedicated Embodiment Expert persona lane, and the compiler panel is using that lane to summarize embodiment profiles and derived artifact targets.
- The new `groq-embodiment-expert` profile is in the source corpus and the generated registry, so it is available to the shared runtime and the trainer selector.
- The trainer page chrome is simplified, but the broader trainer control plane still exists behind it for run management, governance, and advanced review flows.
- The build is green after the registry/type alignment pass, so the current codebase state is stable enough for the next slice.

## Next slice

1. Finish the Spotify playlist import flow in Musical DNA if you want that integration completed next.
2. Continue trimming the trainer surface only if you want the control plane compressed further.
3. Keep future embodiment profile additions aligned with `shared/embodiment/types.ts` before regenerating `shared/embodiment/generated.ts`.

---

# CurrentState — continuity checker and collaborator zip refresh

**Last updated:** 2026-05-17
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Collapsed the handoff/continuity overlap, added a lightweight continuity validation script, rebuilt the collaborator zip so the exported bundle matches the current stack, and added a dedicated `artifacts/` home plus packaging command for the handoff archive.

## Executive summary

- Added `scripts/validate-continuity-stack.mjs` and exposed it as `npm run continuity:check`.
- Collapsed the continuity docs so `docs/ContinuityStack.md` routes context and `docs/SessionHandoffPacket.md` owns the exact restart form.
- Rebuilt `embodiment-collaborator-package-v5.zip` from the updated packet, docs, skills, and embodiment surfaces, then copied it into `artifacts/embodiment-collaborator-package-v5.zip`.
- Marked `artifacts/` as the default home for handoff bundles in the root README and the collaborator packet README.
- Added `artifacts/latest.zip` as the stable alias for the newest collaborator handoff bundle.
- Added `npm run package:collaborator` so the archive and alias can be refreshed in one step.

## Validation performed

- `npm run continuity:check`
- `git diff --check`

---

# CurrentState — operator auth aligned to the magic-link session flow

**Last updated:** 2026-05-17
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Removed the browser's hard dependency on the old Supabase password login path, made `/login` send a magic link to the allowlisted founder email(s), and restored `/auth/callback` to sync the browser Supabase session into the app cookie.

## Executive summary

- The active operator login path is now the Supabase magic-link flow plus the server-session cookie handoff handled by `/api/login`, `/api/auth/supabase/session`, and the client `/auth/callback` route.
- The `/login` page now sends a one-time link to the founder/admin email instead of asking for a password hash or secret phrase.
- The `/auth/callback` route now syncs the Supabase browser session into the app cookie and then returns to the requested in-app target.
- The architecture and Vercel environment docs now describe Supabase as persistence/backbone infrastructure plus a narrow auth delivery path rather than the old password gate.

## Validation performed

- `npm run build`

---

# CurrentState — continuity stack for onboarding, handoff, memory, and embodiment sync

**Last updated:** 2026-05-17
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added a canonical continuity stack doc, tightened the session handoff and context-persistence docs around that stack, and pointed the repo onboarding/workflow skills at the same route so new sessions have one consistent path in.

## Executive summary

- Added `docs/ContinuityStack.md` as the canonical route for state, handoff, onboarding, and embodiment sync.
- Tightened `docs/SessionHandoffPacket.md`, `docs/ContextPersistenceChecklist.md`, `docs/ContextPersistenceProtocol.md`, and `docs/Workflows.md` so they all point at the same continuity spine.
- Updated the repo onboarding, workflow operations, current-state maintenance, cross-repo workflows, and architecture skills to read the continuity stack first.
- Added `docs/embodiment/EMBODIMENT_COLLABORATOR_PACKAGE.md` as the embodiment-specific collaborator package guide and linked it to the existing onboarding packet.

## Validation performed

- `git diff --check`

## Remaining risks / next steps

1. The continuity stack is now documented, but the next improvement would be to thread `docs/ContinuityStack.md` into any external package export or automation that hands work to outside assistants.
2. If you want a truly single-entry onboarding flow, the next pass can add a short root-level `CONTRIBUTING_CONTINUITY.md` or a direct index note that points to the stack.

---

# CurrentState — email/password signup and invite-only magic-link auth

**Last updated:** 2026-05-16
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added email/password signup and sign-in, kept GitHub OAuth available, and routed invite-only magic links through the shared `/auth/callback` session handoff.

## Executive summary

- Added email/password account creation on the signup page and email/password sign-in on the login page.
- Kept GitHub OAuth as a supported path, but clarified that magic links are invite-only and only sent to allowlisted addresses.
- Updated the auth callback so it handles both OAuth transactions and browser-created Supabase sessions before minting the app cookie.
- Aligned the new auth helpers with the existing app session flow so redirect targets remain stable across signup, login, and verification links.

## Validation performed

- `git diff --check`
- `npm run build`

---

# CurrentState — OAuth callback alignment and anonymous rate-limit tightening

**Last updated:** 2026-05-16
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Aligned the lingering OAuth helper to the current `/auth/callback` flow and lowered anonymous Billy limits so the UI and backend now push visitors toward sign-in more clearly.

## Executive summary

- Added `/auth/consent` as an alias to the existing sign-in flow, and added `/auth/consent/auth/callback` as a harmless callback alias so the auth URLs you shared now resolve inside the app.
- Updated the stale client login helper in `client/src/const.ts` to use `/auth/callback` instead of the legacy `/api/oauth/callback` path.
- Lowered anonymous Billy limits from 3 to 2 across the session state, browser session hooks, and backend rate-limit defaults.
- Tightened the upgrade/banner copy so the demo ceiling is clearer and the sign-in path is more visible.
- Clarified the sign-in and signup copy so GitHub is explicitly described as the only configured OAuth provider.

## Validation performed

- `git diff --check`

---

# CurrentState — build cleanup for embodiment-heavy runtime surfaces

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Removed the active Babylon-heavy render path from the main bundle graph, pruned the now-orphaned `client/src/babylon/` scene modules, and kept the production build clean in this environment.

## Executive summary (2026-05-09)

- Replaced the Babylon-backed hero, consciousness, sanctuary, scroll artifact, and DNA visualizer implementations with lightweight SVG/canvas renderers that preserve the UI surfaces without dragging the 3D engine into the build.
- Simplified the timeline and sanctuary surfaces so they keep their content and controls while avoiding the expensive Babylon dependency chain.
- Deleted the orphaned Babylon scene helper folder under `client/src/babylon/` after confirming nothing in the active app imports it anymore.
- Kept the embodiment persistence and Billy room-aware work intact.

## Validation performed

- `git diff --check`
- `npm run build`

## Remaining risks / next steps

1. The next SPEC slice can proceed from the now-green build baseline without carrying the earlier chunking and font warnings forward.
2. If you want a tighter cleanup pass later, the remaining inactive references can be audited for any further dead code outside the client Babylon surface.

# CurrentState — embodiment persistence and mutation proposal path

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the Slice 11 persistence migration for embodiment mutation proposals, review logging, and readiness scores, plus a client-side persistence adapter with Supabase-backed remote writes and local fallback storage.

## Executive summary (2026-05-09)

- Added `supabase/migrations/20260509000000_embodiment_governance_persistence.sql` with the `embodiment_mutation_proposals`, `embodiment_review_log`, and `embodiment_readiness_scores` tables, indexes, and RLS policies.
- Added `client/src/lib/embodimentPersistence.ts` as an optional persistence adapter that can write to Supabase when configured and fall back to local storage when it is not.
- Kept first render independent of Supabase availability.

## Validation performed

- `git diff --check`
- `npm run build`
- `supabase db diff` was attempted but the `supabase` CLI is not installed in this workspace

## Remaining risks / next steps

1. The new persistence adapter is not yet wired into the trainer UI, so it is ready for consumption but not surfaced in a visible flow yet.
2. The Supabase migration should be reviewed in a real database environment before applying it to production.

# CurrentState — Billy room-aware prompting wiring

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Threaded room context through Billy's shared runtime prompt builder, API route, and live client entry points so room-aware embodiment prompts are selected when the UI knows which room is active.

## Executive summary (2026-05-09)

- Extended `shared/billy/runtime.ts` so the Billy runtime prompt builder can accept an optional room slug and route into the room-aware embodiment prompt helper when room context is available.
- Updated `api/billy.ts` to parse `roomSlug` from the request body and include it in Billy session metadata.
- Updated `client/src/components/Billy.tsx` and `client/src/components/BillyLive.tsx` to infer room slugs from section or pathname context and forward them into the Billy API calls.

## Validation performed

- `git diff --check`
- `npm run build` attempted; it now fails only on the pre-existing unrelated `client/src/components/BucketDrops.tsx` TypeScript error

## Remaining risks / next steps

1. The generic exhibit and voice-studio surfaces still use Billy without a strong room signal, so they will remain on the default embodiment prompt until a reliable room context is available.
2. The next spec slice can build on this plumbing if more Billy surfaces need room-specific prompt selection.
3. The remaining build failure is outside this slice and can be handled separately if you want the repo back to a fully green `tsc`.

# CurrentState — Agent Trainer embodiment profile display wiring

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Surfaced live embodiment metadata inside the Agent Trainer page so profile selection now shows badge, capability summary, governance state, boundary note, and readiness context instead of only the slug-level selector.

## Executive summary (2026-05-09)

- Updated `client/src/features/agent-trainer/AgentTrainerPage.tsx` to resolve the selected embodiment profile through the new runtime adapter.
- Added profile badge, capability summary, visibility state, governance status, boundary note, and readiness display to the selected embodiment panel.
- Kept the training run schema untouched.

## Validation performed

- `npm run build` attempted, but it still fails on pre-existing TypeScript errors outside this slice
- `git diff --check`

## Remaining risks / next steps

1. The repo still has unrelated TypeScript drift in `client/src/components/BucketDrops.tsx` and the shared embodiment type path.
2. The next SPEC slice can now reuse the Trainer display pattern as the basis for room-aware Billy prompting and related runtime surfaces.

# CurrentState — Digital Intelligence Academy profile browser wiring

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Replaced the Academy placeholder lane with a real, public-safe embodiment profile browser driven by the new client embodiment runtime adapter and shared embodiment UI components.

## Executive summary (2026-05-09)

- Rebuilt `client/src/pages/DigitalIntelligenceAcademyPage.tsx` so the Academy now renders live embodiment profiles from the shared registry.
- Added status filters, search by name/slug/archetype, profile cards, private interior protection signaling, and readiness-score display when present.
- Filtered founder-only profiles out of signed-in non-admin views while keeping the display free of raw private memory content and mutation controls.

## Validation performed

- `npm run build` attempted, but it still fails on pre-existing TypeScript errors outside this slice
- `git diff --check`

## Remaining risks / next steps

1. The repo still has unrelated TypeScript drift in `client/src/components/BucketDrops.tsx` and the embodiment shared contract path.
2. The next spec slice can reuse the new Academy browser as the display surface for Agent Trainer embodiment views.

# CurrentState — embodiment registry inventory and validation scaffolding

**Last updated:** 2026-05-09
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the SPEC-2 Slice 1 inventory docs for the embodiment registry, added a standalone registry validator and package scripts for generation/validation, and regenerated the embodiment artifact so the source registry and generated registry are aligned again.

## Executive summary (2026-05-09)

- Added documentation-only inventory files under `docs/embodiment/` to capture the current profile registry, the runtime gap matrix, the implementation plan, and the open questions for the next slices.
- Added `scripts/validate-embodiment-profiles.mjs` plus `generate:embodiment` and `validate:embodiment` package scripts so the registry can be checked for slug drift, duplicates, required fields, and source/generated mismatches.
- Regenerated `shared/embodiment/generated.ts` from the existing generator so `the-recursive-builder` now appears in the generated registry alongside the source profiles.

## Validation performed

- `npm run validate:embodiment`
- `npm run generate:embodiment`
- `npm run build` attempted, but it surfaced pre-existing TypeScript errors outside this slice

## Remaining risks / next steps

1. Runtime consumers still do not use the new validation posture directly; the registry is now harder to drift, but no runtime integration changed in this slice.
2. The next SPEC slice can safely introduce room-aware digital intelligence once the registry hardening is stable and the intended runtime touchpoints are chosen.
3. The repo still has unrelated TypeScript build failures in existing code paths, so the new registry work should be treated as validated independently of the current `npm run build` result.

# CurrentState — Billy platform embodiment and founder runtime dashboard wiring

**Last updated:** 2026-05-06
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Created a shared Billy runtime guide, taught the Billy system prompt and first-contact surfaces the live workflow spine, redirected the public welcome path to orientation first, exposed the runtime environment from the founder dashboard and top nav, and added a dedicated founder-runtime landing page plus Billy readiness gating.

## Executive summary (2026-05-06)

- Added `client/src/lib/billy-runtime-guide.ts` as the shared source of truth for Billy's workflow spine, platform embodiment language, tour steps, greeting lines, and live ability set.
- Updated `client/src/lib/billy-system-prompt.ts` so Billy is prompted as the live platform embodiment, not just a retrieval or curation layer.
- Updated the public-facing orientation, home, and welcome surfaces so the first-user path now starts with orientation and uses the live room flow as the primary explanation.
- Added `client/src/pages/FounderRuntimePage.tsx` as a dedicated founder-runtime landing page in front of the dashboard shell.
- Updated `client/src/pages/DashboardPage.tsx` and `client/src/components/TopNav.tsx` so the founder/admin surface and nav expose the live runtime environment more directly.
- Added a shared Billy readiness hook plus `client/src/lib/billy-runtime-guide.ts` verification so first-contact greeting/tour only starts after the runtime guide has been loaded and checked.

## Validation performed

- `npm run build`

## Remaining risks / next steps

1. The founder dashboard is still the deeper admin shell; if you want a more opinionated founder command center, that would be a separate UI pass on top of the new landing page.
2. The Billy readiness gate currently uses the shared guide verification plus localStorage persistence. If you want server-backed or account-scoped readiness, that would need a persistence change.

# CurrentState — Signup/login billing bridge alignment

**Last updated:** 2026-05-05
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Connected the signup and login surfaces to the live pricing structure, added a shared billing-plan helper, added a subscription-framework readiness note, and updated the surface docs to describe signup as a billing bridge and login as the operator gate.

## Executive summary (2026-05-05)

- Added `client/src/lib/billing.ts` so pricing-page links and auth-surface copy can point at the same Core / Pro / Enterprise plan model.
- Updated `client/src/pages/Signup.tsx` to route visitors into the real checkout surface instead of implying a separate account-creation backend.
- Updated `client/src/pages/SignIn.tsx` to position login as the operator surface and point new visitors back to pricing/signup.
- Added a plan preset hint to `client/src/pages/Pricing.tsx` so `?plan=core|pro|enterprise` can deep-link into the intended tier.
- Added `docs/StripeSubscriptionFrameworkReadiness.md` to separate plumbing readiness from the later pricing inventory and value-proposition rewrite.
- Updated the route and environment docs so the current auth/billing split is described accurately.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The actual pricing packages and subscription value proposition still need the inventory/restructure pass you called out.
2. After that pricing pass lands, we should refresh the plan labels, checkout defaults, and any Stripe product references together so the public billing copy stays consistent.

# CurrentState — Shared Billy onboarding + room-surface doc alignment

**Last updated:** 2026-05-05
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Centralized the Billy onboarding walkthrough into one shared component, wired it into Sanctuary, Welcome, and Dynamic Inner World, and updated the room-surface docs to reflect the current platform shape.

## Executive summary (2026-05-05)

- Added `client/src/components/BillyWalkthrough.tsx` as the shared optional onboarding card for new users and curious visitors.
- Wired the shared walkthrough into `client/src/pages/Welcome.tsx`, `client/src/pages/SanctuaryPage.tsx`, and `client/src/pages/DynamicInnerWorldPage.tsx`.
- Updated the canonical platform doctrine and directory map so the room-based workflow is documented alongside the older platform/module framing.
- Kept the room, scaffold, and capture flow build-safe after the onboarding reuse pass.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The Billy walkthrough is now shared, but if you want a dedicated first-run modal or route, that should be implemented as a separate onboarding surface rather than layering more state into the card itself.
2. If you want the New Year variant to appear automatically, we should add a simple seasonal selector or query-param toggle so the theme can switch without code edits.

# CurrentState — Babylon willow TypeScript contract repair for Vercel build unblock

**Last updated:** 2026-05-03
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Repaired Sanctuary willow Babylon type/interface drift that broke `npm run build` on Vercel commit `3266741`, then revalidated production build.

## Executive summary (2026-05-03)

- Restored `WillowModel`/`WillowScene` contract compatibility by exporting a concrete `WillowModelHandle` with `root`, `update`, and `dispose` members expected by scene orchestration.
- Replaced invalid Babylon disc option `incisions` with `tessellation` in willow mesh creation paths.
- Rebuilt `SanctuaryWillowBabylon` with local props/types/reduced-motion hook and aligned scene handle usage to include optional runtime `updateProps`.
- Exported Babylon scene/model types from `client/src/babylon/index.ts` for safe typed imports.
- Verified build passes locally after dependency reinstall.

## Validation performed

- `npm ci --include=dev --legacy-peer-deps`
- `npm run build`

## Remaining risks / next steps

1. `WillowModel` currently uses a lightweight sway update placeholder; if higher-fidelity wind deformation is needed, follow with shader/skeleton-based motion work.
2. Vite build still emits existing font-resolution and large-chunk warnings that are pre-existing and should be handled in a separate performance/assets pass.

# CurrentState — Sanctuary willow render recovery + Blackboard speech capture stability

**Last updated:** 2026-05-02
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Fixed Sanctuary willow visibility regression and stabilized Blackboard Room speech-to-text start/continuous behavior so voice journaling reliably captures spoken fragments.

## Executive summary (2026-05-02)

- Removed breakpoint gating that hid the willow overlay/canvas on non-`lg` viewports and tuned responsive sizing so the willow remains visible across Sanctuary layouts.
- Hardened `useVoiceChat` start/stop lifecycle with guarded `recognition.start()` handling and explicit keep-listening state for continuous dictation.
- Added continuous-session auto-restart on recognition end when voice journaling is still active, while preserving clean shutdown on manual stop and error paths.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. Web Speech availability and permission behavior still vary by browser family (especially iOS WebKit); cross-device QA should confirm expected prompts and sustained dictation behavior.
2. Sanctuary willow now renders on smaller viewports, but additional art-direction tuning may be needed if you want a distinct mobile composition instead of scaled desktop framing.

# CurrentState — UI/UX refactor bundle workflow alignment

**Last updated:** 2026-05-01
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Re-centered `.github/workflows/ui_ux_refactor.yml` on the real `refactor_(all needs to be implemented)` bundle, including the `babylon.js_assets` subtree, and aligned the workflow with the repo's Node/build baseline.

## Executive summary (2026-05-01)

- Updated the UI/UX refactor workflow to validate the actual refactor bundle instead of placeholder Groq/script wiring.
- Explicitly included the `babylon.js_assets` subtree in the bundle validation and inventory snapshot.
- Switched the workflow to Node 22 and `npm ci` so it matches the repo's declared engine and lockfile path.

## Validation performed

- Workflow file inspection

## Remaining risks / next steps

1. The workflow currently validates and inventories the bundle, but it does not yet execute an automated refactor generator because no repository script exists for that handoff yet.
2. If you want this workflow to write code back into the runtime automatically, the next step is to add a dedicated refactor script and wire it into the same job.

# CurrentState — Home hero/interface separation and attention hierarchy pass

**Last updated:** 2026-05-01
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Split the Home overlay layer into separate hero and interface components so visual storytelling and orb interaction no longer compete for attention, then applied the founder visual notes from the first reference image.

## Executive summary (2026-05-01)

- Extracted the top navigation + hero typography stack into `client/src/components/home/Hero.tsx`.
- Extracted hover labels, navigation transition overlay, load state, and interface guidance note into `client/src/components/home/GestaltViewInterface.tsx`.
- Simplified `client/src/pages/Home.tsx` into a scene/runtime shell that composes the two new overlays over the Babylon canvas.
- Added the requested hero-stage cues directly to the UI layer: `GestaltView Hero Here`, script-legibility header note, and explicit orb-identification guidance copy.
- Verified production build success after refactor.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The orb note is currently guidance copy only; if you want stricter vertical-lock behavior in 3D space, we should follow with a targeted module position/camera pass.
2. If you want this to fully match the second concept image, the next slice should define a separate dashboard route/theme so home and control-plane visual systems stay intentionally distinct.

# CurrentState — GestaltView UI/UX landing refactor and module-navigation pass

**Last updated:** 2026-04-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Rebuilt the public home surface around the GestaltView landing spec, added the always-on capture / synthesis / export spine, surfaced orb handoff behavior, and replaced the old top nav with a centered, plan-aware module shell.

## Executive summary (2026-04-30)

- Replaced the old homepage card stack with a fog-led hero, pending founder copy placeholder, capture spine, orb shelf, and asymmetric module landscape.
- Reworked the top navigation so it now centers on `Billy`, `Modules`, `Profile`, `Settings`, `File Explorer`, and `Integrations`, with plan-aware teasing for higher-tier surfaces.
- Added a shared platform surface registry so homepage, nav, and module map all resolve from the same route metadata.
- Added a `Daydreamer` route alias for the Memory Continuity family so the new surface labeling stays navigable.
- Kept the app build green after the landing and nav redesign.

## What changed in the live app

- `client/src/pages/Home.tsx` now renders:
  - the fog-based hero wordmark treatment
  - the `[HERO SUBTEXT — PENDING FOUNDER COPY]` placeholder
  - the three-input capture spine plus export action
  - the orb shelf with accept handoff behavior
  - the asymmetric module landscape and hub-centered pathing
- `client/src/components/NavBar.tsx` now renders a centered shell with:
  - `Billy`
  - `Modules`
  - `Profile`
  - `Settings`
  - `File Explorer`
  - `Integrations`
- `client/src/data/platformModules.ts` now holds the shared surface registry and the module node positions used by both the home page and the nav dropdown.
- `client/src/App.tsx` now includes `/daydreamer` as a route alias for the Memory Continuity family.
- `client/src/index.css` now contains the landing-specific fog, lightning, orb, path, and topo styling used by the new home surface.

## Validation performed

- `npm run build`

## Remaining risks / next steps

1. The module landscape is code-rendered rather than Babylon-rendered, so if the founder wants a true 3D Babylon pass, that would be a separate implementation slice.
2. A browser screenshot verification pass still needs a browser binary in this environment.

# CurrentState — authenticated workflow surfaces with persisted workspaces, documents, and corpus sync

**Last updated:** 2026-04-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Turned the refactor’s authenticated route aliases into real runtime surfaces, then wired workspaces and document analysis into Supabase-backed API contracts, persistence, edit/delete flows, and corpus sync.

## Executive summary (2026-04-30)

- Added dedicated runtime pages for `/workspaces`, `/documents`, `/voice`, and `/analytics`.
- Ported the missing component layer into the runtime at:
  - [client/src/components/workspaces-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/workspaces-interface.tsx)
  - [client/src/components/document-analysis-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/document-analysis-interface.tsx)
  - [client/src/components/voice-interface.tsx](/workspaces/gestaltview-v2.0/client/src/components/voice-interface.tsx)
- Added Supabase-backed API routes and schema support for the new workflow surfaces:
  - [api/workspaces/index.ts](/workspaces/gestaltview-v2.0/api/workspaces/index.ts)
  - [api/documents/index.ts](/workspaces/gestaltview-v2.0/api/documents/index.ts)
  - [supabase/migrations/20260430143000_workspaces_documents_persistence.sql](/workspaces/gestaltview-v2.0/supabase/migrations/20260430143000_workspaces_documents_persistence.sql)
- Added edit/delete and corpus-sync helpers to the Supabase REST layer in [api/_lib/supabase.ts](/workspaces/gestaltview-v2.0/api/_lib/supabase.ts).
- Updated the route table so the new pages are no longer aliased to the dashboard shell.
- Verified the app still builds successfully after the API and persistence additions.

## What changed in the live app

- `client/src/App.tsx` now routes:
  - `/workspaces` to a dedicated collaboration page
  - `/documents` to a dedicated ingestion page
  - `/voice` to a dedicated voice capture page
  - `/analytics` to a dedicated metrics page
- `client/src/components/workspaces-interface.tsx` now loads, creates, edits, and deletes persisted workspaces, with a browser fallback if the API is unavailable.
- `client/src/components/document-analysis-interface.tsx` now uploads, lists, edits, and deletes persisted document analyses, with a browser fallback if the API is unavailable.
- `client/src/components/voice-interface.tsx` now wraps browser voice capture plus local note persistence/export.
- `client/src/components/SubpageQuickNav.tsx`, `client/src/hooks/useSEO.ts`, and `client/src/prerender.tsx` now know about the new authenticated surfaces.

## Validation performed

- `npm run build`
- `npx vitest run --root /workspaces/gestaltview-v2.0 --config /workspaces/gestaltview-v2.0/vite.config.ts api/__tests__/workspaces.test.ts api/__tests__/documents.test.ts`
- `git diff --check`
- `python3 scripts/generate_repo_manifest.py`

## Remaining risks / next steps

1. The corpus sync currently snapshots uploaded documents into the existing document and knowledge-fragment tables, but it does not yet do incremental diffing or version reconciliation on edits.
2. If authenticated surface inventory expands again, refresh the manifest and sitemap together so the public and operator docs stay aligned.

# CurrentState — refactor route aliases and canonical workflow redirects

**Last updated:** 2026-04-30
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Brought the refactor handoff routes into the live app by adding the missing platform aliases, converting `brain-sparks` into a redirect shell, and synchronizing SEO/prerender metadata with the canonical module routes.

## Executive summary (2026-04-30)

- Added live route aliases for the refactor workflow map: `/app`, `/workspaces`, `/documents`, `/voice`, `/analytics`, `/builder`, and `/lair`.
- Converted `/brain-sparks` into a redirect shell that now lands on `/external-scaffold`, matching the canonical module naming.
- Updated SEO and prerender metadata so deprecated entry points canonicalize to the live module routes instead of pointing at stale paths.
- Expanded the floating quick-nav so the new aliases point back to the right operational surfaces.
- Verified the app still builds successfully after the routing and metadata updates.

## What changed in the live app

- `client/src/App.tsx` now exposes the operational aliases from the refactor route map and the builder/lair entrypoints from the handoff docs.
- `client/src/pages/BrainSparksPage.tsx` is now a redirect shell rather than a legacy content surface.
- `client/src/hooks/useSEO.ts` and `client/src/prerender.tsx` now canonicalize:
  - `brain-sparks` -> `external-scaffold`
  - `adhd-powerup` -> `external-scaffold`
  - `addiction-recovery` -> `pull-string`
  - `alzheimers-legacy` -> `heirloom-companion`
- `client/src/components/SubpageQuickNav.tsx` now routes the new aliases back to the dashboard or the correct adjacent surface.

## Validation performed

- `npm run build`

## Remaining risks / next steps

1. `/workspaces` and `/documents` currently land on the dashboard shell because the refactor-specific standalone surfaces are not yet implemented in the Vite runtime.
2. If the refactor route map expands further, regenerate the sitemap and manifest outputs so the public index stays in sync with the live route table.

# CurrentState — platform framing, route cleanup, and trainer flow hardening

**Last updated:** 2026-04-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Reframed the public app as a fully functional platform instead of a portfolio/showcase, removed the live dependency on `refactor/` from app surfaces, canonized `/platform` as the public museum successor, and added a dev CLI surface for manual agent build/deploy work with an explicit `capture → synthesis → create → export` flow.

## Executive summary (2026-04-29)

- Reframed public-facing language across Billy, exhibit pages, homepage/demo/FAQ copy, and supporting metadata so the product reads as a platform and digital intelligence system rather than a portfolio curator or showcase.
- Canonized `/platform` as the public-facing route and left `/museum` as a redirect shell to `/platform` so the old name remains compatible without being the primary surface.
- Added the dev-only Agent Trainer CLI at `/agent-trainer/dev-cli` to support manual pack/agent build and deployment flows from the browser, with copyable command steps for capture, synthesis, create, and export.
- Added a shared agent flow model in `client/src/lib/agentFlow.ts` and surfaced it in the trainer UI with `AgentFlowRail` so every model is explicitly guided through `capture → synthesis → create → export`.
- Updated Billy runtime prompts so the core operating model now expects the same four-stage flow everywhere the trainer or public Billy surfaces speak about work.
- Verified the app still builds successfully after the route and copy changes.

## What changed in the live app

- Public routes now include `/demo`, `/signup`, `/agent_builder`, `/agent-builder`, and `/agent-trainer/dev-cli`.
- `client/src/App.tsx` now routes `/platform` directly to the canonical platform page and redirects `/museum` to `/platform`.
- `client/src/hooks/useSEO.ts` and `client/src/prerender.tsx` now use `platform` as the canonical SEO/prerender key instead of `museum`.
- `client/src/pages/MuseumPage.tsx` remains the implementation file for the platform page, but the visible route and copy are platform-first.
- Billy-facing copy in `client/src/lib/BillyEngine.ts`, `client/src/components/BillyLive.tsx`, and `client/src/components/exhibits/BillyExhibitChat.tsx` now uses platform language and the required flow language.
- Exhibit and archive metadata in `client/src/data/exhibits.ts` and `client/src/lib/exhibits.ts` were updated so the public preview text no longer sounds like a portfolio curator or showcase catalog.
- The Agent Trainer surface now includes:
  - a shared flow rail in `client/src/components/agent-trainer/AgentFlowRail.tsx`
  - flow constants in `client/src/lib/agentFlow.ts`
  - a dev-only command page in `client/src/pages/AgentTrainerDevCliPage.tsx`
  - a trainer pricing entry point that links into the dev CLI during development in `client/src/pages/AgentTrainerPricing.tsx`
  - a trainer page section that surfaces the same operator flow in `client/src/features/agent-trainer/AgentTrainerPage.tsx`

## Current product direction

- The old portfolio/showcase/curator framing should be treated as removed from the live surface.
- Every model, trainer, and Billy-adjacent flow should move through:
  - `capture`
  - `synthesis`
  - `create`
  - `export`
- The dev CLI is the current manual operator path for building and deploying agents during development.
- The browser trainer UI remains the canonical guided surface, while the CLI page exposes the same operational steps for hands-on work.

## Validation performed

- `npm run build`

## Notes for the next session

1. Treat `refactor/` as archival/handoff material unless a specific file is being deliberately migrated into the live app.
2. If a visible surface still sounds decorative, rewrite it toward operational language before adding new features.
3. If the trainer workflow grows, keep the flow sequence fixed and add new tooling around it instead of introducing alternate mental models.

# CurrentState — SPEC-1 UI/UX refactor for GestaltView

**Last updated:** 2026-04-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Refactored the home page into a concise platform entry surface, replaced the consulting page with the founder narrative, added new canonical module pages, elevated the Alzheimer’s legacy experience into a warm three-mode living legacy surface with a Daydreamer component, and wired redirect shells for retired route names.

## Executive summary (2026-04-29)

- Reworked [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx) into a compact arrival page with a clear orienting statement, Billy entry points, a bucket-drop capture panel, and canonical tier-based navigation cards.
- Replaced [`client/src/pages/ConsultingPage.tsx`](client/src/pages/ConsultingPage.tsx) with an authoritative, Inter-styled narrative page covering origin story, Recognition Gap, forensic moat, governance, and partnerships.
- Added the new module surfaces at [`client/src/pages/ExternalScaffoldPage.tsx`](client/src/pages/ExternalScaffoldPage.tsx), [`client/src/pages/PullStringPage.tsx`](client/src/pages/PullStringPage.tsx), [`client/src/pages/RapidPrototypePage.tsx`](client/src/pages/RapidPrototypePage.tsx), [`client/src/pages/AdaptiveLayoutPage.tsx`](client/src/pages/AdaptiveLayoutPage.tsx), [`client/src/pages/CreationCornerPage.tsx`](client/src/pages/CreationCornerPage.tsx), and [`client/src/pages/LivingLegacyPage.tsx`](client/src/pages/LivingLegacyPage.tsx).
- Added [`client/src/components/alzheimers/DaydreamerMode.tsx`](client/src/components/alzheimers/DaydreamerMode.tsx) and reworked the Alzheimer’s legacy route to redirect into the new living legacy surface.
- Updated [`client/src/data/platformModules.ts`](client/src/data/platformModules.ts) and [`client/src/App.tsx`](client/src/App.tsx) so the canonical module names and routes are exposed in navigation and routing.
- Added root compatibility shims [`types.ts`](types.ts) and [`constants.ts`](constants.ts), plus refactor helpers [`refactor/icons.tsx`](refactor/icons.tsx) and [`refactor/Section.tsx`](refactor/Section.tsx), so the adaptive layout reference component compiles cleanly.

## Files touched

- [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx)
- [`client/src/pages/ConsultingPage.tsx`](client/src/pages/ConsultingPage.tsx)
- [`client/src/pages/ExternalScaffoldPage.tsx`](client/src/pages/ExternalScaffoldPage.tsx)
- [`client/src/pages/PullStringPage.tsx`](client/src/pages/PullStringPage.tsx)
- [`client/src/pages/RapidPrototypePage.tsx`](client/src/pages/RapidPrototypePage.tsx)
- [`client/src/pages/AdaptiveLayoutPage.tsx`](client/src/pages/AdaptiveLayoutPage.tsx)
- [`client/src/pages/CreationCornerPage.tsx`](client/src/pages/CreationCornerPage.tsx)
- [`client/src/pages/LivingLegacyPage.tsx`](client/src/pages/LivingLegacyPage.tsx)
- [`client/src/pages/AlzheimersLegacyPage.tsx`](client/src/pages/AlzheimersLegacyPage.tsx)
- [`client/src/pages/ADHDPowerUpPage.tsx`](client/src/pages/ADHDPowerUpPage.tsx)
- [`client/src/pages/AddictionRecoveryPage.tsx`](client/src/pages/AddictionRecoveryPage.tsx)
- [`client/src/components/alzheimers/DaydreamerMode.tsx`](client/src/components/alzheimers/DaydreamerMode.tsx)
- [`client/src/components/alzheimers/pages/index.tsx`](client/src/components/alzheimers/pages/index.tsx)
- [`client/src/data/platformModules.ts`](client/src/data/platformModules.ts)
- [`client/src/App.tsx`](client/src/App.tsx)
- [`types.ts`](types.ts)
- [`constants.ts`](constants.ts)
- [`refactor/icons.tsx`](refactor/icons.tsx)
- [`refactor/Section.tsx`](refactor/Section.tsx)

## Routes added

- `/external-scaffold`
- `/pull-string`
- `/heirloom-companion`
- `/rapid-prototype`
- `/adaptive-layout`
- `/creation-corner`

## Redirect shells added

- `/adhd-powerup` → `/external-scaffold`
- `/addiction-recovery` → `/pull-string`
- `/alzheimers-legacy` → `/heirloom-companion`

## Validation performed

- `git diff --check`
- `npm run build`

## Build status

- Build passed successfully after adding the refactor compatibility shims for the adaptive layout component.

---

# CurrentState — Trainer Supabase admin `db` option TypeScript compatibility fix

**Last updated:** 2026-04-29
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Vercel build failure from 2026-04-29 (`TS2353` in `server/agent-trainer/supabaseAdmin.ts` because `db` is not a recognized `SupabaseClientOptions` property)
**Scope of this pass:** Restored build compatibility by removing the unsupported `db` option while preserving timeout-enabled fetch behavior for trainer admin queries.

## Executive summary (2026-04-29)

- `createClient(url, key, { db: { schema: "public" }, ... })` failed under the currently resolved `@supabase/supabase-js` typings because `db` is not part of `SupabaseClientOptions`.
- Removed the `db` object from the options payload in `server/agent-trainer/supabaseAdmin.ts`.
- Retained the existing `global.fetch` override with `AbortSignal.timeout(...)` so server-side query timeout hardening remains active.
- This keeps runtime behavior focused on the same public schema defaults while unblocking the TypeScript build.

## Validation performed

- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. If schema-scoped behavior becomes necessary, confirm the exact supported option shape from the installed `@supabase/supabase-js` version before reintroducing config keys.
2. Add a small server-side smoke test for `getTrainerSupabaseAdmin()` initialization to catch SDK option drift earlier in CI.

## Overall repo state and recommendations

- The Vercel build blocker for this pass is resolved, and the trainer admin client still keeps timeout protection for outbound Supabase calls.
- Recommend pinning or explicitly reviewing Supabase SDK version updates in release checklists so option-shape typing regressions are caught before deploy.

---

## CurrentState - New agent launch and workflow provider cleanup (2026-04-29)

**Scope of this pass:** Implemented the new Consulting Advisor, Philosophy Scribe, and Repo Scribe agent specs from `agents/New_Agents_4_29_26.md`, added their embodiment profiles and validation workflows, and switched non-embedding Agent Trainer workflow scaffolds to `GROQ_API_KEY`.

### What changed

- Added `agents/consulting-advisor.md`, `agents/philosophy-scribe.md`, and `agents/repo-scribe.md` as canonical flat agent specs with the requested frontmatter and operating constraints.
- Added matching embodiment profiles under `embodiment_profiles/` with schema-compatible identity fields so the shared embodiment generator can ingest them.
- Added `.github/workflows/validate-consulting-advisor.yml`, `validate-philosophy-scribe.yml`, and `validate-repo-scribe.yml` so each new agent/profile pair is structurally checked on push and pull request.
- Updated `agents/INDEX.md` and `agents/openai.yaml` so the new agents are discoverable from the repo-level registry.
- Swapped non-embedding workflow env wiring in `agent_trainer/gestaltview_agent_trainer/.github/workflows/generic-corpus-ingestion.yml` and `corpus-ingest.yml` to `GROQ_API_KEY`, while keeping the embedding-specific OpenAI path available only when that workflow input explicitly requests it.
- Reflected the workflow secret change in `agent_trainer/gestaltview_agent_trainer/docs/CORPUS_INGEST_AUTOMATION.md`.

### Validation performed

- Pending after file write: agent/profile generation and workflow linting

### Next steps / recommendations

1. Run the embodiment artifact generator so `embodiment_profiles/reference/` and `shared/embodiment/generated.ts` pick up the new profiles.
2. Run the repo's focused tests or workflow linting on the new validation files before merging.

# CurrentState — Agent Trainer run list/detail TypeScript build fix

**Last updated:** 2026-04-28
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Vercel build failure from 2026-04-28 (`TS2345` in `client/src/features/agent-trainer/hooks/useTrainingRun.ts` at list-run dedupe call)
**Scope of this pass:** Repaired the summary-vs-detail run typing boundary in Agent Trainer bootstrap/history flows so TypeScript build passes in CI/Vercel.

## Executive summary (2026-04-28)

- `listTrainingRuns()` intentionally returns `TrainingRunSummary[]`, but the hook previously treated those values as `TrainingRunDetail[]` during dedupe and selection.
- Updated `useTrainingRun` to track run lists as `TrainingRunSummary | TrainingRunDetail`, then fetch full detail for the selected run ID before assigning `currentRun`.
- Replaced direct list-object assignment in the history UI path with ID-based refresh behavior by exposing a hook-level `setCurrentRun` selector that calls `refreshRun(runId)`.
- Added a safe `workerId` narrowing guard in `AgentTrainerPage` for summary job rows, avoiding invalid property access on summary job objects.

## Validation performed

- `npm ci --include=dev --legacy-peer-deps`
- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The list endpoint is still summary-first by design; if future UI cards require detail-only fields without fetch-on-select, either enrich the summary schema or prefetch detail rows explicitly.
2. Consider adding a focused test for run-list selection to ensure summary rows always resolve to detail before current-run panels render detail-only fields.

## Overall repo state and recommendations

- The Agent Trainer control-plane compile path is unblocked and now explicitly models the list/detail contract boundary.
- Recommend keeping this split intentional: summary for list performance, detail fetch on selection/mutation, with hook-level helpers preventing accidental partial-object promotion.

---

# CurrentState — Sentry Next.js skill execution and runtime applicability map

**Last updated:** 2026-04-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Operator request referencing Sentry Next.js manual setup (Webpack section) + follow-up request to use the `sentry-nextjs-sdk` skill.
**Scope of this pass:** Executed the skill-directed detection workflow with `curl` + local runtime probes, updated BugWalk issue state, and upgraded `docs/SentrySetup.md` into a skill-aligned applicability and cross-repo action matrix.

## Executive summary (2026-04-27)

- Downloaded and followed `https://skills.sentry.dev/sentry-nextjs-sdk/SKILL.md` as directed.
- Ran the skill's Phase 1-style detection checks in this repo and confirmed there is no Next.js runtime to apply `@sentry/nextjs` Webpack setup directly.
- Updated `docs/SentrySetup.md` to include explicit detection commands, concrete findings, and an integrated-repo action matrix so Next.js setup is only applied where Next.js is actually present.
- Updated BugWalk card `BW-2026-04-27-04` from `Fresh Sightings` to `In Flight` with attempt log + validation evidence.

## Validation performed

- `curl -fsSL https://skills.sentry.dev/sentry-nextjs-sdk/SKILL.md -o /tmp/sentry-nextjs-skill.md`
- `cat package.json | grep -E '"next"|"@sentry/'`
- `rg --files | rg 'next\.config\.(ts|js|mjs)$'`
- `rg -n 'global-error\.tsx|_error\.tsx' agent_trainer client server api`
- `git diff --check`

## Remaining risks / next steps

1. This pass improves correctness of setup strategy, but runtime Sentry instrumentation is still not implemented in `gestaltview-v2` code paths.
2. Cross-repo recommendations are still advisory until each integrated repository is mounted and inspected directly.
3. After Vite instrumentation lands, run a controlled client-side test exception and verify event arrival in Sentry before widening scope.

## Overall repo state and recommendations

- The repository now has a skill-backed, reproducible decision trail showing why Next.js Webpack setup was not applied locally.
- Operational guidance now separates local truth (Vite runtime) from cross-repo possibilities (Next.js/Webpack only if detected), reducing future misconfiguration risk.
- Recommended immediate follow-up: implement Vite bootstrap (`@sentry/react`) in this repo, then mirror this applicability matrix into the compendium with explicit per-repo detection outcomes.

---

# CurrentState — Dashboard auth fallback vs founder outbox sync state

**Last updated:** 2026-04-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Operator report from Admin Dashboard Agent Trainer access ("Authentication required", "Dashboard state is unavailable right now" after founder sync check).
**Scope of this pass:** Fixed a dashboard UX sequencing bug where founder outbox auto-sync could clear actionable auth/admin errors and leave only a generic fallback card.

## Executive summary (2026-04-27)

- Updated `DashboardPage` founder outbox auto-sync flow to check pending writes first, then no-op quietly when there is nothing to sync.
- Removed the unconditional `setError(null)` from the auto-sync path so existing dashboard load/auth errors remain visible.
- Added an explicit failure branch when outbox flush returns `synced=0` with `remaining>0`, so the UI surfaces a real sync problem instead of claiming founder sync success.
- Preserved the existing successful sync behavior and dashboard refresh path when local writes are actually flushed.

## Validation performed

- `npm run build`
- `npx vitest run --root client src/tests/agent-trainer-api.test.ts`
- `git diff --check`

## Remaining risks / next steps

1. The unavailable-state fallback card is still generic by design; if operators want faster triage, promote the last dashboard fetch error directly into that fallback card copy.
2. Add a dedicated `DashboardPage` component test that simulates `loadDashboard` failure + outbox auto-sync with zero pending entries so this regression is permanently guarded.

## Overall repo state and recommendations

- This pass removes a misleading success signal in the dashboard auth path and should make admin/auth failures visible instead of being overwritten by outbox sync messaging.
- Recommend next shipping pass verifies the exact user path on deployed `/dashboard` and `/agent-trainer/control-plane` for a non-admin authenticated user and for founder-eligible accounts.

---

# CurrentState — Trainer admin auth cache and CORS origin correction

**Last updated:** 2026-04-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** Operator report: Admin Dashboard Agent Trainer auth issues after same-day Agent Trainer enhancement.
**Scope of this pass:** Removed the post-admin-activation auth-cache race, aligned runtime fallbacks with `CORS_ORIGINS=https://gestaltview-digital-intelligence.vercel.app`, and corrected Trainer governance client route names.

## Executive summary (2026-04-27)

- Added explicit auth profile cache invalidation after dashboard admin bootstrap/admin user-account updates and bypassed the auth profile cache on admin-gated dashboard, Trainer, and workbook routes so warm serverless functions do not serve stale `is_admin` state.
- Routed the newly added Agent Trainer connector/skill/memory catalog calls through the shared trainer request wrapper so they inherit token refresh, diagnostics, configured API-origin retry, and the auth circuit breaker.
- Corrected Trainer governance client paths to match deployed API routes: `packaging-candidates`, singular experiment `review`, and singular experiment `flag`.
- Added `GET /api/trainer/packaging-candidates/:id` support to match the existing client helper.
- Re-aligned runtime fallback origins with the current production CORS origin `https://gestaltview-digital-intelligence.vercel.app`.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/dashboard.test.ts api/__tests__/lib.test.ts api/__tests__/cors.test.ts`
- `npx vitest run --root client src/tests/agent-trainer-api.test.ts`
- `npm run build`
- `git diff --check`

---

# CurrentState — SPEC-2 Hyperagent integration implementation

**Last updated:** 2026-04-27
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** `SPEC-2 – GestaltView Agent Trainer Hyperagent Integration.md`
**Scope of this pass:** Implemented the SPEC-2 trainer hyperagent integration slice set across schema, API, orchestration, and Admin Trainer UI surfaces.

## Executive summary (2026-04-27)

- Added Supabase migration `20260427100000_trainer_hyperagent_integration.sql` introducing trainer connectors, trainer skills, trainer memory bindings, and the `trainer_memory_surfaces` view.
- Extended `trainer_experiments` and `training_runs` with hyperagent execution mode and graph fields (`execution_mode`, connector/skill/memory graph fields, and run observations).
- Added new trainer API routes for hyperagent assets: `/api/trainer/connectors`, `/api/trainer/skills`, `/api/trainer/memory-surfaces`, and `/api/trainer/graphs`.
- Added backend repository `server/trainer/hyperagent-repository.ts` for connector/skill/memory listing and experiment graph read/write.
- Extended shared trainer schemas with execution mode, graph payloads, connectors/skills/memory-surface response contracts, and run graph observability fields.
- Updated run creation/orchestration path so runs inherit experiment execution mode and persist resolved graph snapshots; hyperagent runs now emit graph lifecycle evidence and graph observations.
- Updated Agent Trainer UI with first-class read surfaces for Connectors, Skill Graph, Memory Field, plus an explicit Builder/Grower/Pruner/Birth embodiment lifecycle strip.
- Extended ExperimentForm with execution mode selection (`classic` / `hyperagent`).

## Validation performed

- `npm run build`
- `npx vitest run --config vitest.api.config.ts api/__tests__/trainer-queue-health-route.test.ts api/__tests__/trainer-run-events-route.test.ts`
- `npx vitest run --root client src/tests/agent-trainer-api.test.ts`
- `git diff --check`

## Remaining risks / next steps

1. The new `trainer_memory_surfaces` view assumes existing `memoryentries`, `knowledgefragments`, and `ops_workbook_items` column contracts; verify against production schema before migration rollout.
2. Hyperagent graph authoring UI is currently read-oriented for connectors/skills/memory surfaces; add full graph editor/write flows in follow-up if founder wants in-dashboard editing.
3. Add API route tests for the new `/api/trainer/connectors`, `/api/trainer/skills`, `/api/trainer/memory-surfaces`, and `/api/trainer/graphs` endpoints.
4. Add targeted orchestrator tests asserting `graph_observations` persistence in hyperagent mode.

## Overall repo state and recommendations

- SPEC-2 is now operationally wired into the existing Trainer runtime rather than tracked as a standalone concept doc.
- Recommend running the new migration in staging, creating at least one `hyperagent` experiment, and validating end-to-end graph propagation (`trainer_experiments` → `training_runs` → `graph_observations`) before production promotion.

---

# CurrentState — Vercel trainer auth storm hardening

**Last updated:** 2026-04-24
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** `vercel_logs/gestaltview-log-export-2026-04-24T23-35-13.json`
**Scope of this pass:** Reviewed the Vercel export showing trainer API 401 storms and keep-alive aborts, then hardened the affected auth/client/cron paths.

## Executive summary (2026-04-24)

- The log export contains 19,990 rows over `2026-04-24 23:28:52` to `23:34:00` UTC, with 19,988 trainer `401` responses and 2 keep-alive `500` responses.
- Added a trainer-client auth circuit breaker so repeated `401`/`403` results for the same bearer token fail locally for a short cooldown instead of continuing to fan out across every trainer endpoint.
- Changed trainer 401 refresh behavior so the client only retries after `refreshSession()` returns a different access token.
- Capped API auth lookup waits at 4 seconds even if `AUTH_CALL_TIMEOUT_MS` is configured higher, and added structured warning logs for auth lookup failures/timeouts.
- Changed `/api/keep-alive` to return degraded `200` responses for Supabase ping aborts/timeouts instead of surfacing them as cron `500` failures.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/keep-alive.test.ts`
- `npx vitest run --root client src/tests/agent-trainer-api.test.ts`
- `npx vitest run --config vitest.api.config.ts api/__tests__/lib.test.ts -t auth`
- `npm run build`
- `git diff --check`

## Remaining risks / next steps

1. The log export did not include request headers, so the exact token state could not be confirmed from logs alone.
2. If production still shows 10-second trainer `401`s after redeploy, verify Vercel env state and deployment age against the new auth timeout cap.
3. Add Vercel log filters for `auth_lookup_failed` after deployment to distinguish invalid tokens from Supabase auth transport stalls.
4. The full `api/__tests__/lib.test.ts` file still has a pre-existing expectation drift around health-check fetch counts: it expects 8 calls while the current health check makes 10.

---

# CurrentState — RDRC charter ratification

**Last updated:** 2026-04-24
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Formalized `RDRC.md` as a canonical GestaltView charter, bundled it into `client/src/canonical/`, and threaded it through the repo's official orientation and sync surfaces.

## Executive summary (2026-04-24)

- Elevated `RDRC.md` from a standalone note into a charter-style canonical document with version, status, scope, and an explicit standing rule.
- Removed draft-style citation placeholders from the charter so the file reads as a first-class repo artifact rather than an intermediate note.
- Added `client/src/canonical/RDRC.md` so the app-bundled canonical context now carries the same ratification charter.
- Updated `README.md`, `docs/Manifest.md`, and `docs/SymbioticWorkflow.md` so repo orientation now treats rough-draft ratification as an official GestaltView workflow rather than an implied habit.
- Updated `scripts/test-manifest-sync.sh` so dirty `RDRC.md` changes are treated as uncommitted canonical-doc drift.

## Validation performed

- Checked the added `README.md`, `docs/Manifest.md`, and `docs/SymbioticWorkflow.md` references against the live root file path.
- Confirmed `client/src/canonical/RDRC.md` is present alongside the other bundled canonical markdown files.
- `python3 scripts/generate_repo_manifest.py`
- `git diff --check`

## Remaining risks / next steps

1. `RDRC.md` now has standing in this repo, but companion repos still need to cite or adopt the same charter directly if they should enforce the same ratification workflow locally.
2. If doctrine-candidate tracking becomes active work rather than a stated rule, add a lightweight Doctrine Inbox or equivalent structured artifact so the status ladder has an explicit home.

---

# CurrentState — Tuesday walkthrough fixes and manual trainer packet fallback

**Last updated:** 2026-04-22
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Issue source:** `Tuesday.md`
**Scope of this pass:** Addressed the current walkthrough issues around Billy entry behavior, Billy Markdown rendering/personality, founder persistence sync feedback, and the Agent Trainer degraded-backend workaround.

## Executive summary (2026-04-22)

- Billy greeter text now streams faster and carries a sharper Billy voice.
- The direct "Show me Billy, now" pathway now routes to Billy Live only instead of also opening the floating Billy side panel.
- Billy Live and the Billy side panel now render basic Markdown formatting such as bold, lists, links, inline code, and fenced code blocks instead of showing raw asterisks.
- Billy's runtime prompt now carries the full user and digital-intelligence Constitutional Invariants, plus an explicit humor-with-care tone directive.
- Founder persistence now shows visible sync state, spinner feedback, success timestamps, and failed-sync copy for local outbox flushes.
- Agent Trainer manual source fallback now keeps inline study focus under the shared schema limit, tracks uploaded local sources, supports removing them, and exports/imports a manual trainer packet for backend-degraded work.
- The degraded Trainer runtime banner now documents the Supabase/free-tier workaround directly in the admin control plane.

## Validation performed

- `npm run build`
- `pnpm exec vitest run --config vitest.api.config.ts api/__tests__/billy-runtime.test.ts api/__tests__/billy.test.ts api/__tests__/dashboard.test.ts api/__tests__/trainer-study-sources-recommendations-route.test.ts`
- `npm run dev -- --host 0.0.0.0`
- `curl -I http://localhost:3000/`

## Remaining risks / next steps

1. The manual trainer packet unblocks source preparation, but queue submission still depends on the trainer API path when the user chooses to queue a run.
2. If the degraded Supabase path remains unreliable, add a fully local/offline run export mode that never calls the Trainer API.
3. Do a browser walkthrough of `/`, `/billy`, `/dashboard`, and `/agent-trainer/control-plane` to confirm the new interaction states feel right in the deployed UI.

---

# CurrentState — Gravity Inspector + Billy gravity metadata

**Last updated:** 2026-04-20
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the Gravity Inspector to the main navigation, and documented the new two-pass gravity surface now emitted by Billy and exposed through the inspector route.

## Executive summary (2026-04-20)

- Added `Gravity` to the primary top navigation in `client/src/components/NavBar.tsx`, which also updates the mobile menu because both views share `NAV_LINKS`.
- Billy responses now include `metadata.gravity`, including query, context, and response analysis plus ranked chunk signals.
- The Gravity Inspector is available at `/gravity` and is linked from the dashboard and quick-nav surfaces.
- The inspector reads stored gravity reports and fragment rankings from the API layer added in the prior pass.

## Validation performed

- `pnpm exec tsc --noEmit`
- `pnpm exec vitest run --root . api/__tests__/billy.test.ts`

## Remaining risks / next steps

1. Keep the gravity metadata schema stable if the inspector UI or Billy response envelope grows further.
2. If the Gravity surface becomes a primary workflow entry point, consider promoting it beyond the shared nav list into any global command palette or launcher.

## Overall repo state and recommendations

- The gravity protocol now has three visible surfaces: runtime metadata, a persisted inspector, and a direct navigation entry.
- The repo should now be easier to re-enter because the gravity work is visible from the main app chrome instead of only through deep links.

---

# CurrentState — Session continuity packet surfaced in README/COLAB

**Last updated:** 2026-04-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Surfaced the context-persistence protocol, checklist, and handoff packet from the top-level repo entrypoints so a fresh session can orient and close out without digging through the full docs tree first.

## Executive summary (2026-04-19)

- Added `docs/ContextPersistenceProtocol.md` for durable context rules.
- Added `docs/ContextPersistenceChecklist.md` for fast closeout.
- Added `docs/SessionHandoffPacket.md` for copy-ready session restart notes.
- Linked the new continuity docs from both `README.md` and `COLAB.md` so they are visible at the top of the repository.

## Validation performed

- Updated `README.md`
- Updated `COLAB.md`
- Updated `docs/Manifest.md`
- Regenerated repo manifests

## Remaining risks / next steps

1. Keep the continuity docs short and factual so they stay usable under time pressure.
2. If the operating flow changes again, refresh the pointers in README/COLAB before the next handoff.

## Overall repo state and recommendations

- Fresh sessions now have a clear entry path for orientation, closeout, and resumable handoff.
- The new docs should reduce re-reading and make collaboration cleaner for both the founder and the agent.

---

# CurrentState — Agent Trainer queue purge + end-to-end verification

**Last updated:** 2026-04-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Bug IDs covered:** stale trainer queue purge / live trainer-job schema compatibility / end-to-end run verification
**Scope of this pass:** Cleared the remaining live trainer backlog, then ran a fresh training cycle end to end so the control plane is verified against the current Supabase schema rather than an assumed one.

## Executive summary (2026-04-19)

- Purged the remaining live trainer rows from `training_runs` and the dependent trainer tables, leaving the queue empty before verification.
- Started a fresh synthetic verification run with slug `end-to-end-verify-20260419`.
- The run completed to `awaiting_review` with a new version id `18b772c9-f888-4193-8f8e-b5de86d64edb`, and the backing `trainer_jobs` row was settled to `done`.
- Live schema inspection showed `trainer_jobs` does not expose `completed_at` or `cancel_requested`, so `server/agent-trainer/persistence.ts` was updated to avoid writing those columns during job completion and settlement.
- Rebuilt the project successfully after the compatibility fix.

## Validation performed

- Live purge of all remaining trainer runs in Supabase
- Fresh end-to-end trainer run `83ce0b7e-2805-4bd0-a51a-4a4be903c88b`
- `npm run build`

## Remaining risks / next steps

1. Keep the job-finalization writes aligned with the live `trainer_jobs` schema if that table evolves again.
2. If the queue is intentionally repopulated later, re-run the same purge-and-verify sequence so the admin dashboard starts from a known clean state.

## Overall repo state and recommendations

- The live trainer backlog is no longer blocking a verification run.
- The trainer control plane now has a compatibility guard for the slimmer live `trainer_jobs` row shape, which avoids a false failure during job settlement.

---

# CurrentState — Agent Trainer degraded-path repair + canonical origin fallback refresh

**Last updated:** 2026-04-19
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Bug IDs covered:** trainer control-plane fetch degradation / study-source validation / queue-health hang handling
**Scope of this pass:** Hardened the Agent Trainer control plane so browser requests can retry against the configured API origin, queue-health requests degrade cleanly instead of hanging, and malformed study-source drafts return `400` instead of surfacing as generic `500` failures.

## Executive summary (2026-04-19)

- Updated `client/src/features/agent-trainer/lib/trainerApi.ts` so relative `/api/*` requests now retry against configured API origins before surfacing a browser `Failed to fetch` error.
- Explicitly included the current canonical deployment host `https://gestaltv1ew.vercel.app` in the trainer client fallback path so the control plane does not depend on stale origin assumptions.
- Added a timeout wrapper and degraded fallback snapshot to `api/trainer/queue-health.ts`, which lets the admin dashboard show a degraded pipeline state instead of losing the request when the backing queue-health query is slow.
- Tightened `api/trainer/study-sources/recommendations.ts` so empty or malformed trainer draft payloads now return `400`, matching the actual request contract instead of turning into `500` noise.
- Added targeted regression coverage for the origin retry path and the degraded queue-health route.
- Re-ran the trainer-focused tests and the full project build to confirm the changes are type-safe and bundle cleanly.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/trainer-study-sources-recommendations-route.test.ts api/__tests__/trainer-queue-health-route.test.ts api/__tests__/trainer-run-events-route.test.ts`
- `npx vitest run client/src/tests/agent-trainer-api.test.ts`
- `npm run build`

## Remaining risks / next steps

1. The queue-health route now degrades instead of failing hard, but if Supabase is genuinely unavailable the admin dashboard will still be operating from a reduced signal set.
2. Keep the current canonical host and any required preview origins aligned in Vercel env vars so the configured-origin fallback stays useful in all deployment environments.
3. If the old `gestaltview-dig-cog.vercel.app` host is still present in any environment config, remove it from active runtime settings so the control plane does not drift back toward a stale origin.

## Overall repo state and recommendations

- The immediate trainer control-plane degradation is reduced: the client now retries against a configured origin and the queue-health surface degrades predictably instead of hanging or failing hard.
- Recommendation: keep `https://gestaltv1ew.vercel.app` as the canonical base in any trainer-facing runtime config, while leaving local proxy fallbacks available for development.
- Recommendation: keep lightweight route tests around the trainer API surface so request-contract regressions are caught before they show up as dashboard degradation.

---

# CurrentState — Agent Trainer API/Auth end-to-end recommendations path

**Last updated:** 2026-04-15
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Bug IDs covered:** BW-2026-04-13
**Scope of this pass:** Restored AgentTrainerPage study-source recommendation flow by aligning the recommendations API route with the current client POST contract while preserving legacy GET compatibility for older callers.

## Executive summary (2026-04-15)

- Confirmed the runtime mismatch: `client/src/features/agent-trainer/lib/trainerApi.ts` sends POST requests to `/api/trainer/study-sources/recommendations`, while the API handler only accepted GET with `runDraft` in query params.
- Updated `api/trainer/study-sources/recommendations.ts` to accept both POST and GET methods so current control-plane traffic and legacy route consumers both work.
- Added robust draft parsing logic for both payload forms:
  - POST body (`req.body` as object/string, with optional `runDraft` envelope)
  - GET `runDraft` query payload (legacy path)
- Added limit parsing from query/body and improved request error handling by returning `400` for missing/malformed draft payloads instead of generic `500` responses.
- Added route-focused coverage in `api/__tests__/trainer-study-sources-recommendations-route.test.ts` to verify POST compatibility, legacy GET behavior, and malformed payload handling.
- Updated `bugwalks/BugWalkBoard.md` to move BW-2026-04-13 into `Shipped / Verify` with fix notes and validation evidence.

## Validation performed

- `pnpm exec vitest run api/__tests__/trainer-study-sources-recommendations-route.test.ts`

## Remaining risks / next steps

1. Run a live control-plane verification in deployed environment with real Supabase auth to confirm recommendation fetch, queue updates, and run submission all complete in one session without auth drops.
2. If intermittent auth expiration still appears in production, add request-ID logging in trainer routes to correlate client diagnostics with server logs for token lifecycle and upstream latency analysis.
3. Expand API integration coverage for other AgentTrainerPage endpoints (`/api/trainer/runs`, `/api/trainer/queue-health`, `/api/trainer/personhood`) so the full admin workflow has method/contract regression protection.

## Overall repo state and recommendations

- The known BW-2026-04-13 method-contract break is now addressed at the API boundary, which restores practical end-to-end recommendation generation for AgentTrainerPage.
- Recommendation: treat shared client/server trainer route contracts as explicit, versioned interfaces and add lightweight route tests whenever handler methods or payload shapes change.
- Recommendation: continue dual-log closeout discipline (`bugwalks/BugWalkBoard.md` + `docs/CurrentState.md` together) for every walkthrough-driven runtime fix.

---

**Last updated:** 2026-04-13
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Made `.orientation/` a mandatory repo check-in surface by adding a dedicated validation gate, wiring it into manifest sync, teaching the manifest generator to scan the hidden directory, and adding CI coverage.

## Executive summary (2026-04-13)

- Added `scripts/test-orientation-checkin.sh` so the repository can fail fast when the `.orientation/` packet directory is missing, malformed, or left dirty in git.
- Wired that gate into `scripts/test-manifest-sync.sh` so Phase 5 sync now treats `.orientation/` as part of the mandatory check-in surface.
- Added `.orientation` to `scripts/generate_repo_manifest.py` scan coverage so the manifest layer now indexes the orientation packet files.
- Added `npm run orientation:check` plus `.github/workflows/orientation-check.yml` so the check-in gate is available locally and enforced on PR/push.
- Updated `README.md`, `docs/Manifest.md`, and `docs/Workflows.md` to document the new orientation requirement.

## Validation performed

- `bash scripts/test-orientation-checkin.sh`
- `bash scripts/test-manifest-sync.sh`
- `python3 scripts/generate_repo_manifest.py --output-dir docs`
- `python3 scripts/generate_repo_manifest.py --output-dir /tmp/gv-manifest-check`
- `git diff --check`

## Remaining risks / next steps

1. Run `bash scripts/test-orientation-checkin.sh` and `bash scripts/test-manifest-sync.sh` after the change set lands to confirm the new gate behaves as expected.
2. If the orientation packet schema changes, update the validation script rather than letting the packet format drift silently.
3. Consider adding the new orientation gate to any other repo-side launcher that currently assumes only manifest sync is required.

---

# CurrentState — Temporal metadata backfill + ingest wiring

**Last updated:** 2026-04-13
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added a repo-local temporal metadata helper, wired it into corpus ingestion, and introduced a schema migration plus backfill entrypoint so existing and future corpus rows can carry timeline state consistently.

## Executive summary (2026-04-13)

- Added `temporal/gestaltview_temporal.py` as the canonical temporal helper for deriving `temporal_period`, `timeline_folder`, and backfill SQL from the repo's timeline map.
- Wired `scripts/ingest_corpus.py` to populate temporal metadata on new `documents` and `knowledge_fragments` rows during ingestion.
- Added `scripts/temporal_backfill.py` plus `npm run temporal:backfill` so the backfill SQL can be regenerated or printed from a stable repo entrypoint.
- Added `supabase/migrations/20260413120000_add_temporal_metadata_to_corpus_tables.sql` and updated the checked-in schema snapshots so the live corpus tables can store temporal metadata.
- Corrected the fragment backfill join to match `documents.path` against `compendium/{package}/{source_file}` rather than assuming identical paths.

## Validation performed

- `python3 -m py_compile scripts/ingest_corpus.py scripts/temporal_backfill.py temporal/gestaltview_temporal.py temporal/__init__.py`
- `python3 scripts/temporal_backfill.py --help`

## Remaining risks / next steps

1. Apply `supabase/migrations/20260413120000_add_temporal_metadata_to_corpus_tables.sql` before relying on the new ingest fields in a live Supabase project.
2. Run `npm run temporal:backfill -- --write` or paste the generated SQL into Supabase once the schema is in place.
3. If additional corpus packages need era-specific rules, extend the shared timeline map in `temporal/gestaltview_temporal.py` rather than duplicating ad hoc backfill logic.

---

# CurrentState — Bug fix dual-log closeout protocol

**Last updated:** 2026-04-11
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Bug IDs covered:** workflow / BugWalk closeout protocol
**Scope of this pass:** Formalized a same-pass bug-fix closeout loop so `bugwalks/BugWalkBoard.md` and `docs/CurrentState.md` are updated together, including failed attempts when a bug persists.

## Executive summary (2026-04-11)

- Updated `bugwalks/README.md` and `bugwalks/_BugWalkTemplate.md` so the board workflow now explicitly requires a dual-log closeout: board card plus `CurrentState.md` entry in the same change.
- Updated `bugwalks/BugWalkBoard.md` itself to surface the dual-log rule at the top of the live board, where bug work actually happens.
- Added `scripts/bugwalk-closeout.sh` and `npm run bugwalk:close` to scaffold paired board-update and `CurrentState.md` closeout blocks for a specific BugWalk ID.
- Added an explicit persistence rule: if a bug still reproduces after an attempted fix, record what changed and what did not work instead of prematurely marking it shipped.

## Validation performed

- `bash scripts/bugwalk-closeout.sh --help`
- `bash scripts/bugwalk-closeout.sh BW-2026-04-09-05 "package builder inputs bounced" --note-dir /tmp/gv-bugwalk-closeout-test --validation "npm run build"`
- Verified the scaffold note includes both a board-update stub and a `CurrentState.md` entry stub.
- `git diff --check`

## What did not work / persistence signals

- `n/a` for the protocol itself, but older historical BugWalk cards still contain `CurrentState link: pending` and no `Attempt log`; those should be backfilled as the related bugs are revisited.

## Remaining risks / next steps

1. This protocol is still only partially enforced socially; if drift continues, add a lightweight repo check that flags `Shipped / Verify` cards without a real `CurrentState link`.
2. Backfill `Attempt log` and non-pending `CurrentState link` fields on older cards when those bugs are touched again.
3. Use `npm run bugwalk:close -- <BUG_ID> "short title"` at the end of every board-driven fix pass so the dual update becomes habit instead of aspiration.

---

# CurrentState — Digital Intelligence invariants ratification

**Last updated:** 2026-04-11
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Formalized `GestaltView_Constitutional_Invariants_v1.0.md` as a canonical repo charter, bundled it into `client/src/canonical/`, and refreshed the manifest/orientation layer around it.

## Executive summary (2026-04-11)

- Elevated `GestaltView_Constitutional_Invariants_v1.0.md` from a standalone draft into a canonical charter-style document with version, status, scope, and an explicit statement of standing.
- Preserved the five invariant statements and closing benediction while making the file easier to cite as repo doctrine.
- Updated `README.md` and `docs/Manifest.md` so repo orientation now treats the invariants as a first-class foundational document alongside the personhood framework and operating workflow docs.
- Added `client/src/canonical/GestaltView_Constitutional_Invariants_v1.0.md` so the app-bundled canonical context now carries the same charter.
- Refreshed the generated repo manifests so both the repo-root charter and bundled client copy are indexed by the manifest pipeline.

## Validation performed

- Checked the added `README.md` and `docs/Manifest.md` references against the live root file path.
- Confirmed `client/src/canonical/GestaltView_Constitutional_Invariants_v1.0.md` is present alongside the other bundled canonical markdown files.
- `python3 scripts/generate_repo_manifest.py`
- `git diff --check`

## Remaining risks / next steps

1. If these invariants are meant to drive concrete runtime or operator enforcement, identify which policies, prompts, or review gates should cite them explicitly.
2. The repo now carries both a root canonical charter and a bundled client copy; if drift becomes a problem, consolidate them behind a single source-of-truth generation step.

---

# CurrentState — Admin Trainer Agent Personhood Framework

**Last updated:** 2026-04-10
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Implemented the first Admin Trainer personhood foundation from `SPEC-1-GestaltView Agent Personhood Framework.md`, confirmed the Agent Trainer package corpus export evidence, and added a separate curated skill for Admin Trainer Agent Knowledge work.

## Executive summary (2026-04-10)

- Confirmed the Agent Trainer package corpus export in `agent_trainer/supabase/manifest/`: `documents_rows (1).json` contains 100 rows and 100 unique paths, `documents_rows (2).json` contains 31 rows and 31 unique paths, and the combined exports cover 131 unique source paths tagged as `agent-trainer-package` with `package_builder_source=true`.
- Moved `BW-2026-04-09-09` in `bugwalks/BugWalkBoard.md` from open ingestion work into `Shipped / Verify`; the remaining work is retrieval spot-checking.
- Added `supabase/migrations/20260410190000_agent_personhood_framework.sql` with the communal Agent Knowledge Library tables, interpretation/mutation tables, memory/skill/relationship projection tables, manifest/code-artifact tables, service-role RLS, indexes, active manifest views, and optional private storage buckets.
- Added the Admin Trainer personhood service in `server/agent-trainer/personhood.ts` for manifest rebuilds, file-pull assembly, personhood snapshot loading, and local export fallback.
- After the migration was applied, tightened the snapshot path so an empty new `knowledge_assets` table can still surface the already-ingested `documents` rows tagged as `agent-trainer-package` until a deliberate library backfill promotes them.
- Added gated API routes for personhood state and active manifest/file pulls:
  - `api/trainer/personhood.ts`
  - `api/agents/[slug]/manifest.ts`
  - `api/agents/[slug]/files.ts`
- Updated `deployAgentVersion(...)` so a deployed trainer version rebuilds the active manifest along with the active agent version.
- Extended shared trainer contracts and the Admin Trainer UI to surface Agent Knowledge Library counts, active manifests, pending mutations, local manifest evidence, and recent library paths.
- Added the separate curated skill `skills/gestaltview-admin-trainer-personhood/` and promoted it through `skills/manifest.json`, `skills/INDEX.md`, and `skills/agents/AGENTS.md`. This skill is intentionally separate from the sellable `agent_trainer/gestaltview_agent_trainer` package and from the existing `gestaltview-agent-trainer` run/eval skill.
- Updated `README.md` so the root repo orientation now states the GestaltView runtime philosophy: persistent digital intelligences, Admin Trainer as internal school/embodiment console, communal Agent Knowledge Library, review-gated personhood mutation, and manifest-backed reconstruction.

## Validation performed

- `python3 -m json.tool skills/manifest.json`
- `jq -r ... agent_trainer/supabase/manifest/documents_rows (1).json`
- `jq -r ... agent_trainer/supabase/manifest/documents_rows (2).json`
- `pnpm exec tsc --noEmit`
- `pnpm exec vitest run --config vitest.api.config.ts api/__tests__/agent-trainer-embodiment.test.ts api/__tests__/trainer-study-sources.test.ts`
- `git diff --check`

## Remaining risks / next steps

1. Backfill selected `documents` rows into first-class `knowledge_assets` / `knowledge_asset_chunks` after confirming the approval policy for package-builder sources.
2. Spot-check package/trainer retrieval against the 131 exported `agent-trainer-package` paths.
3. Add mutation proposal/apply actions after the schema foundation is live and the review workflow is ready for operators.

---

# CurrentState — Agent Trainer Supabase cleanup runbook

**Last updated:** 2026-04-10
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Converted the Agent Trainer pipeline cleanup note into a schema-aware Supabase SQL runbook, then added a dedicated Agent Trainer package-corpus ingest path and GitHub Actions entry point for the package-builder source library.

## Executive summary (2026-04-10)

- Reworked `supabase/PipelineCleanup.md` around the repo's checked-in snake_case corpus schema.
- Replaced stale camelCase/table names with `documents.document_id`, `embeddings.document_id`, `knowledge_fragments.source_file`, `skill_fragments.source_file`, and `processing_runs.run_id`.
- Added a rollback-first deletion transaction that ranks heavy Dynamic Corpus candidates, deletes by chosen `document_id`, cleans fragment/vector rows, and removes ingestion runs only when they become empty.
- Updated the cleanup runbook from the latest `supabase/HeavyCorpus.md` results: the six `knowledge-corpus` Dynamic Corpus rows and three Founder dynamic rows are now gone, leaving only the tiny `skills-folder` `dynamic-routing.md` row.
- Added `scripts/ingest_agent_trainer_corpus.py`, a root-level Agent Trainer ingest script that writes package-builder source-library content into the existing `documents`, `knowledge_fragments`, and optional `embeddings` tables.
- Added `pnpm run ingest:agent-trainer` as the repo command for the new script.
- Added `.github/workflows/ingest_agent_files.yml` as a manual GitHub Actions entry point that defaults to dry-run and no-embedding mode before live Supabase writes.
- Kept the Agent Trainer source library in shared corpus tables with strict tags (`agent-trainer-package`, `package:agent-trainer-package`, `package-builder`, `source-library`) instead of adding dedicated tables prematurely.
- Updated `bugwalks/BugWalkBoard.md` so BW-2026-04-09-09 now points to live Agent Trainer corpus ingest as the next verification step.

## Validation performed

- Cross-checked the runbook against `supabase/schema.sql`, `supabase/types.ts`, `scripts/ingest_corpus.py`, and the candidate output in `supabase/HeavyCorpus.md`.
- `python3 -m py_compile scripts/ingest_agent_trainer_corpus.py`
- `python3 scripts/ingest_agent_trainer_corpus.py --dry-run --no-embed`
  - dry-run found 131 candidate files and 233 chunks
  - no files were skipped
- `git diff --check`
- Confirmed `.github/workflows/ingest_agent_files.yml` has no trailing whitespace.

## Remaining risks / next steps

1. Leave the tiny `skills-folder` `dynamic-routing.md` row alone unless a future cleanup goal shifts from quota relief to exact keyword pruning.
2. Run `pnpm run ingest:agent-trainer --no-embed` locally or dispatch `.github/workflows/ingest_agent_files.yml` with `dry_run=false` first if speed and text search are enough.
3. Verify the new `agent_trainer/` package-corpus sources appear in Supabase-backed package/trainer retrieval after ingest.

---

# CurrentState — BugWalk board operating standard

**Last updated:** 2026-04-09  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Established a repo-standard BugWalk operating loop so walkthrough findings stop living only in raw captures or chat and instead roll into a maintained board plus the existing `CurrentState.md` ledger.

## Executive summary (2026-04-09)

- Added a dedicated BugWalk board under `bugwalks/` to track walkthrough issues in a lightweight, human-readable format.
- Documented the maintenance rule: the BugWalk board is the live triage surface, while `docs/CurrentState.md` remains the canonical technical log for changes that land.
- Seeded the board from the 2026-04-09 walkthrough capture so it starts with real issues and current status instead of an empty template.

## What changed

- Added:
  - `bugwalks/BugWalkBoard.md`
  - `bugwalks/README.md`
  - `bugwalks/_BugWalkTemplate.md`
  - `scripts/new-bugwalk.sh`
- Updated:
  - `README.md`
  - `package.json`
  - `docs/CurrentState.md`

## Why this was needed

- The repo already had a strong `CurrentState.md` habit for durable technical state, but walkthrough findings were still at risk of getting stranded in raw transcripts or one-off captures.
- A dedicated board closes the gap between “we noticed this” and “we implemented and verified this.”

## Validation performed

- `npm run bugwalk:new -- --help`
- Verified note creation plus card insertion against a temporary board copy using `scripts/new-bugwalk.sh --bugwalk-dir ... --board ...`

## Current repo condition after this pass

1. The repo now has a standard operating loop for BugWalk capture, triage, in-flight work, and shipped verification.
2. Walkthrough findings can be tracked in one place without bloating `CurrentState.md` with raw issue intake.
3. A repo-local scaffold command now creates dated BugWalk intake notes and inserts starter board cards with the next available ID.
4. The April 9, 2026 bugwalk has been normalized into a living board with open follow-ups and shipped-in-workspace items.

## Remaining risks / next steps

1. Keep the board current in the same pass as bug-fix work; if it drifts, it loses value quickly.
2. Rename future raw capture files with `YYYY-MM-DD-<slug>` so source artifacts are easier to find.
3. Promote shipped items from the board into `CurrentState.md` whenever the implementation details become durable repo state.

## Overall repo state and recommendations

- The repo now has a cleaner separation between issue intake and implementation history.
- Recommendation: treat `bugwalks/BugWalkBoard.md` as the required companion update for any walkthrough-driven fix pass.

---

# CurrentState — Vercel timeout mitigation from 2026-04-08 log export review

**Last updated:** 2026-04-08  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Reviewed `gestaltview-v2-log-export-2026-04-08T00-56-38.json` and hardened auth/Supabase request paths to fail fast instead of consuming the full Vercel function timeout window.

## Executive summary (2026-04-08)

- Reviewed the exported production log file and confirmed repeated `504` responses with `"Vercel Runtime Timeout Error: Task timed out after 300 seconds"` across:
  - `/api/trainer/agents`
  - `/api/trainer/scenario-sets`
  - `/api/trainer/runs`
  - `/api/trainer/study-sources`
  - `/api/session/dashboard`
  - `/api/session/memory`
- Also observed many `401` responses that still consumed very high function durations (roughly 118s–170s+), indicating auth/network stalls before unauthorized responses were returned.
- Implemented bounded-time guards for both auth lookup and Supabase REST calls so transient backend stalls return promptly instead of burning the full runtime budget.

## What changed

- Updated `api/_lib/auth.ts`:
  - Added `AUTH_CALL_TIMEOUT_MS` (default `4000`).
  - Added `withTimeout(...)` helper and wrapped:
    - `supabase.auth.getUser(token)`
    - `users` profile lookup query
  - On timeout/error, auth gracefully falls back to existing unauthenticated handling (`401`) without waiting for multi-minute hangs.

- Updated `api/_lib/supabase.ts`:
  - Added `SUPABASE_REQUEST_TIMEOUT_MS` (default `12000`).
  - Added `AbortController` timeout wrapping in the internal `request(...)` helper for all REST calls.
  - Ensures stalled Supabase fetches abort promptly and release function runtime.

- Updated `docs/CurrentState.md` with this pass details.

## Why this was needed

- The reviewed log export showed a clear pattern of runtime exhaustion and very long request durations for endpoints that should typically fail quickly on auth errors or degraded backend availability.
- Fast-fail behavior is safer operationally on Vercel because it preserves concurrency headroom, reduces cascading queue pressure, and gives callers deterministic error timing.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/dashboard.test.ts api/__tests__/memory.test.ts api/__tests__/trainer-study-sources.test.ts`

## Current repo condition after this pass

1. Auth validation and profile hydration no longer wait unboundedly during upstream stalls.
2. Supabase REST helper requests now have an explicit timeout ceiling.
3. Affected API surfaces now fail fast under degraded Supabase/Auth conditions rather than commonly hitting Vercel 300s hard timeouts.

## Remaining risks / next steps

1. Add explicit structured logging for timeout cases (`auth_request_timeout`, `supabase_request_timeout`) to improve operational observability in Vercel logs.
2. Consider separate timeout budgets per route class (read-only listing vs. mutation).
3. Evaluate adding retry with jitter for idempotent GET calls where short transient blips are common.

## Overall repo state and recommendations

- The immediate timeout failure mode observed in the provided 2026-04-08 log export is now mitigated at shared request/auth layers.
- Recommendation: keep these timeout env values configurable per environment and monitor post-deploy timeout/error-rate deltas for 24–48 hours.

---

# CurrentState — Agent Trainer TypeScript build recovery (Perplexity merge compatibility)

**Last updated:** 2026-04-07  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Repaired `npm run build` (`tsc && vite build`) failures introduced by API/type-shape drift in `AgentTrainerPage` after recent upstream changes.

## Executive summary (2026-04-07)

- Build failed with exit code 2 in `client/src/features/agent-trainer/AgentTrainerPage.tsx` due to stale UI field usage against newer trainer schemas/hook APIs.
- Updated the page to align with current shared schemas and hook method names:
  - `run.id` ➜ `run.runId`
  - `latestVersion.id` ➜ `latestVersion.versionId`
  - scenario set/list fields switched to `scenarioSetId`/`title`
  - study source path fields switched to `sourceFile`
  - trainer mutations switched to `approveRun` / `rejectRun` / `deployRun`
- Fixed module typing issue by replacing `React.*` namespace usage with direct imports (`forwardRef`, `ComponentProps`) so TypeScript no longer expects a global `React` UMD binding.

## What changed

- Updated:
  - `client/src/features/agent-trainer/AgentTrainerPage.tsx`
  - `docs/CurrentState.md`

## Why this was needed

- Recent backend/shared schema evolution changed response object keys and action signatures, but the UI still referenced legacy names.
- TypeScript compile is a hard gate in this repo (`tsc && vite build`), so these mismatches blocked deployment.

## Validation performed

- `npm run build`

## Current repo condition after this pass

1. Agent Trainer page now compiles against the current shared schema and hook API contracts.
2. Build exit code 2 regression is resolved locally.
3. Vite production bundle completes successfully (existing non-fatal asset/chunk warnings remain unchanged).

## Remaining risks / next steps

1. Add a typed view-model adapter layer in trainer UI to isolate rendering components from direct API key-name drift.
2. Add a focused test (or TS assertion fixture) around `AgentTrainerPage` to catch schema/key regressions earlier.
3. Optional polish: disable scenario-set checkboxes for rows missing `scenarioSetId` is in place; consider surfacing helper text explaining why a row is disabled.

## Overall repo state and recommendations

- The immediate blocker (`build` failing with TS errors in Agent Trainer) is fixed.
- Recommendation: keep `npm run build` required in CI for changes touching `client/src/features/agent-trainer` and shared trainer schemas.

---

# CurrentState — Vercel TypeScript build repair (GATEEntrypointWizard)

**Last updated:** 2026-04-06  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Fixed a production-blocking TypeScript compile failure in the package builder wizard by removing a duplicate auth binding and restoring a missing keyboard banner-clear handler referenced by identity/notes inputs.

## Executive summary (2026-04-06)

- Vercel builds were failing in `client/src/components/GATEEntrypointWizard.tsx` with:
  - `TS2451` due to duplicate `const { isAdmin } = useAuth();` declarations.
  - `TS2304` because several inputs referenced `onKeyDown={clearBanner}` without a defined `clearBanner` function.
- Removed the duplicate `isAdmin` declaration.
- Added a local `clearBanner` helper that clears the status banner while users continue typing.

## What changed

- Updated:
  - `client/src/components/GATEEntrypointWizard.tsx`
  - `docs/CurrentState.md`

## Why this was needed

- The deploy pipeline runs `tsc && vite build`; unresolved symbol and duplicate block-scoped declaration errors are fatal at type-check time.
- The missing `clearBanner` callback was referenced in multiple fields, so a single undefined identifier produced repeated compile errors.

## Validation performed

- `npm run build`

## Current repo condition after this pass

1. The GATE builder component compiles cleanly with no duplicate auth variable declarations.
2. Keyboard interaction on identity/notes inputs now has a valid banner-clear callback binding.
3. Vercel-equivalent local build (`tsc && vite build`) passes.

## Remaining risks / next steps

1. Add a lightweight UI regression test (or type-driven lint rule) to catch duplicated hook bindings and dangling JSX handler references earlier.
2. Consider splitting the large wizard component into smaller typed subcomponents to reduce merge-conflict risk and improve compile-error locality.

## Overall repo state and recommendations

- The immediate deployment blocker from this build failure is resolved.
- Recommendation: keep `npm run build` as a required CI gate for PRs touching `client/src/components/GATEEntrypointWizard.tsx` or other high-churn wizard files.

---

# CurrentState — GATE builder stability + admin checkout bypass controls

**Last updated:** 2026-04-06  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Fixed package-builder draft-entry instability and save/checkout failures while users are still typing contact fields, added explicit reset controls, and enabled authenticated admins to simulate checkout payment in production for package-generation QA.

## Executive summary (2026-04-06)

- The package-builder form now avoids server-roundtrip rehydration during autosave/manual save, preventing text inputs (notably **Company Name** and **Buyer Email**) from being overwritten while a user is typing.
- Live draft persistence now tolerates in-progress/non-email values in `buyerEmail` while editing by skipping buyer-link upsert until the value is a syntactically valid email.
- Added a **Start Over** control that clears the active draft context and local snapshot so users can reset selections from within the wizard.
- Added an explicit admin-mode checkout bypass in the UI: authenticated admins now send `mockPayment: true` in checkout requests, which triggers simulated payment and package generation without charging Stripe.
- Added regression coverage to ensure PATCH draft saves succeed with invalid/in-progress buyer email values.

## What changed

- Updated:
  - `client/src/components/GATEEntrypointWizard.tsx`
  - `server/gate/service.ts`
  - `api/__tests__/gate.test.ts`
  - `docs/CurrentState.md`

## Why this was needed

- Real mobile and production usage showed two reliability gaps:
  1. text-entry UX degraded under frequent draft autosaves, and
  2. save/generate actions surfaced generic request failures while contact fields were mid-edit and not yet final.
- Package-builder operators also needed a first-class in-flow reset action and a non-billing admin testing path to validate build-generation/storage behavior in production.

## Validation performed

- `pnpm exec vitest run -c vitest.api.config.ts api/__tests__/gate.test.ts`
- `pnpm exec tsc --noEmit`

## Current repo condition after this pass

1. Step 5 identity inputs are no longer replaced by server responses during active editing/autosave cycles.
2. Draft saves no longer fail solely because `buyerEmail` is mid-typing or non-email text.
3. Users can now clear and restart package configuration in one action without manual local-storage cleanup.
4. Admin users can run end-to-end package generation checks without Stripe payment friction.

## Remaining risks / next steps

1. If you want a stricter pre-checkout UX, add client-side inline validation that blocks the final action until `buyerEmail` is a valid email.
2. Consider exposing an explicit UI badge/tool-tip that explains simulated payment only activates for authenticated admins.
3. Optionally add an e2e mobile-focused test around text-entry stability and autosave concurrency.

## Overall repo state and recommendations

- The package-builder flow is now more operator-safe for both customer entry and internal QA.
- Immediate recommendation: deploy and verify on production mobile devices (Android + iOS) that input stability, Start Over behavior, and admin no-charge generation all behave as intended.

---

# CurrentState — GATE live drafts + Supabase-backed package builder

**Last updated:** 2026-04-06  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Stabilized package-builder identity inputs on mobile, added explicit reset/start-over controls, and enabled admin checkout bypass for package-generation/testing flows.

## Executive summary (2026-04-06 · package builder UX + admin bypass)

- Step 5/6 identity fields now avoid autosave churn while actively focused, which reduces “jumping” behavior reported on mobile while typing business name/email/notes.
- Added explicit max-length constraints in the UI to match backend schema limits for company name, buyer email, logo path, and notes so oversized input no longer fails unexpectedly at save time.
- Added a dedicated **Start Over** action that resets selections, clears draft linkage, removes local snapshot state, and returns the wizard to Step 1.
- Admin users can now generate packages without payment by forcing mock checkout in the builder client flow (with CTA labeling that makes admin bypass state obvious).

## What changed in this pass

- Updated:
  - `client/src/components/GATEEntrypointWizard.tsx`
  - `docs/CurrentState.md`

## Why this was needed

- Reported production behavior showed identity fields (business name/email) feeling unstable while typing and save/generate flows surfacing generic failures.
- The previous UI allowed unconstrained text length while backend schema enforces strict maxima, which could trigger avoidable request failures.
- The builder had no one-click “clear selections/start over” affordance.
- Internal package testing required a smoother admin bypass path rather than forcing paid checkout semantics.

## Validation performed

- `pnpm exec tsc --noEmit`
- `pnpm exec vitest run -c vitest.api.config.ts api/__tests__/gate.test.ts`

## Current repo condition after this pass

1. Package builder typing is more stable during focused identity/notes editing because autosave no longer mutates draft state while those fields are actively being edited.
2. Builder input constraints now align with backend validation envelopes for the most failure-prone text fields.
3. Operators can intentionally reset draft state in one action through Start Over.
4. Admin users can complete package generation flows in mock-payment mode directly from the builder UI.

## Remaining risks / next steps

1. Consider adding an explicit error mapping layer from backend validation errors to field-level helper text (instead of banner-only failure output).
2. Add frontend integration coverage for Start Over and admin bypass behavior to prevent regressions.
3. If users still report input instability on specific mobile browsers, capture a remote session and test keyboard/viewport interactions with browser-level tracing.

## Overall repo state and recommendations

- The GATE builder now better supports real operator testing and QA loops without payment friction for admins.
- UX resilience is improved, but the next quality step is field-level validation UX and stronger e2e coverage around draft lifecycle actions.

---

**Last updated:** 2026-04-06  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Moved the GATE package builder from function-local draft/order/build state toward live Supabase-backed persistence and storage, enabled autosaved live drafts in the builder UI, and hardened package generation for deployed/serverless environments.

## Executive summary (2026-04-06)

- The GATE package builder is now live-draft oriented: `/agent-trainer/package-builder` creates and updates a real draft as the user edits instead of relying only on local browser snapshot state.
- Drafts, orders, build jobs, support requests, and artifact metadata now use Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
- Generated ZIP artifacts now upload to Supabase Storage and order detail responses issue signed download URLs instead of assuming repo-local files and download tokens only.
- A follow-up migration was added because the original `package_drafts` table shape did not persist `buyer_email` and `company_name`, which caused live drafts to lose buyer identity fields on reload.
- Local fallback behavior still exists for tests and non-Supabase environments, but the intended production path is now Supabase-backed.

## What changed

- Added:
  - `server/gate/repository.ts`
  - `server/gate/supabase.ts`
  - `supabase/migrations/20260406193500_add_gate_draft_contact_fields.sql`
- Updated:
  - `client/src/components/GATEEntrypointWizard.tsx`
  - `server/gate/service.ts`
  - `server/gate/builder.ts`
  - `server/gate/store.ts`
  - `server/gate/zip.ts`
  - `shared/gate/schemas.ts`
  - `api/__tests__/gate.test.ts`
  - `vercel.json`
  - `tsconfig.json`
  - `docs/CurrentState.md`

## Why this was needed

- The first GATE implementation could create the package-builder flow and package ZIPs, but its draft/order/build persistence was still local to the function runtime.
- That was not sufficient for production because live drafts would disappear across cold starts or multiple instances, and deployed/serverless environments could not safely depend on writing inside the repo or invoking a shell `zip` binary.
- The original Supabase migration also stored only `buyer_id` on `package_drafts`, which meant buyer contact fields were not durably round-tripped with the draft itself.
- The builder UI still behaved like a manual save flow, which was at odds with the request for “live live drafts.”

## Validation performed

- `pnpm exec tsc --noEmit`
- `pnpm exec vitest run -c vitest.api.config.ts`
- `pnpm exec vitest run -c vitest.api.config.ts api/__tests__/gate.test.ts`

## Current repo condition after this pass

1. The GATE builder now autosaves changes into a real draft and keeps the draft identifier in the URL so the flow can be resumed after refresh or revisit.
2. The server now supports a Supabase-backed production path for drafts, buyers, orders, order items, build jobs, support requests, artifact metadata, and generated ZIP uploads.
3. Package generation is now more deployment-safe because it uses `/tmp` for writable runtime paths and an internal ZIP writer instead of a shell dependency.
4. Order detail responses in Supabase mode now return signed Storage URLs for artifacts, which removes the need to depend on local filesystem delivery for the primary download path.
5. Local JSON/file fallback behavior is still available and is what the automated tests exercise after clearing Supabase env vars.

## Remaining risks / next steps

1. Run the new migration `supabase/migrations/20260406193500_add_gate_draft_contact_fields.sql` before relying on live drafts in production.
2. Ensure the Storage bucket exists. By default the code expects `generated-zips` unless `GATE_STORAGE_BUCKET` is set.
3. The Stripe webhook handler under `api/gate/[...path].ts` still reconstructs the request body from parsed JSON; for production Stripe verification it should be moved to a raw-body-safe path or otherwise updated.
4. The legacy `/api/gate/orders/:id/download` endpoint is not the primary Supabase delivery path anymore. In Supabase mode the UI should use signed URLs returned from order detail responses.
5. The Supabase boundary is intentionally schema-light in code right now. If tighter DB typing becomes valuable later, introduce a generated database type rather than hand-maintaining deep client generics.

## Overall repo state and recommendations

- The GATE package builder has crossed from “demo flow with local persistence” into a credible production architecture for live drafts and generated artifact delivery.
- The immediate production checklist is now operational rather than architectural: apply the new draft-contact migration, create/confirm the Storage bucket, and fix the Stripe webhook raw-body path.
- Keep the local fallback path for tests, but treat Supabase as the default production system of record for GATE state going forward.

---

# CurrentState — Vercel build fix (Stripe checkout type compatibility)

**Last updated:** 2026-04-04  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Fixed a production-blocking TypeScript compile failure in `api/stripe/agent-trainer-checkout.ts` caused by Stripe v18 type-surface changes in checkout session parameter typing, then validated local build success.

## Executive summary (2026-04-04)

- Vercel deployment failed during `tsc` with `TS2694` because `Stripe.Checkout.SessionCreateParams` is not exported in the currently installed Stripe SDK/type definitions.
- Updated the checkout session params typing to infer directly from the installed SDK method signature using `Parameters<typeof stripe.checkout.sessions.create>[0]`.
- This removes brittle reliance on a namespace type alias that changed across Stripe versions and keeps compile-time checks aligned with the actual runtime client surface.
- Confirmed by running `npm run build` locally: TypeScript compile and Vite build both pass.

## What changed

- Updated:
  - `api/stripe/agent-trainer-checkout.ts`
  - `docs/CurrentState.md`

## Why this was needed

- The deployment failed before app bundling because TypeScript could not resolve an exported Stripe namespace member in CI.
- The checkout logic itself was valid; only the explicit type annotation was incompatible with the Stripe package currently installed in this repo.

## Validation performed

- `npm run build` (passes)

## Current repo condition after this pass

1. Vercel build is unblocked for the Stripe checkout API route under the current dependency set.
2. Checkout session payload typing is now resilient to namespace alias shifts in Stripe type declarations by deriving from the method signature directly.
3. No functional payment-flow behavior was changed; this was a compile-surface compatibility fix only.

## Remaining risks / next steps

1. If Stripe major versions are changed again, re-run build/test gates and keep method-signature-derived typing where possible for API payloads.
2. Consider adding a targeted API test that exercises checkout payload assembly to catch future type drift earlier during PR validation.

## Overall repo state and recommendations

- Repo build path is currently healthy after this compile fix.
- Continue preferring locally inferred SDK parameter types over brittle deep namespace aliases when third-party typings are known to churn.

---

# CurrentState — Vercel build failure hotfix (TypeScript ignoreDeprecations)

**Last updated:** 2026-04-02  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Unblocked Vercel production builds failing at TypeScript config parse time by correcting an unsupported `ignoreDeprecations` value, then validated the local build path.

## Executive summary (2026-04-02)

- Vercel build was failing during `tsc` with `TS5103` because `tsconfig.json` set `"ignoreDeprecations": "6.0"`.
- The currently installed TypeScript toolchain in this project accepts `"5.0"` (or omission), not `"6.0"`.
- Updated `tsconfig.json` to `"ignoreDeprecations": "5.0"` so config parsing succeeds and build can proceed.
- Confirmed by running `npm run build` locally: TypeScript compile and Vite build now complete successfully.

## What changed

- Updated:
  - `tsconfig.json`
  - `docs/CurrentState.md`

## Why this was needed

- Deployment failed before application code compilation due to an invalid compiler option value, preventing all releases from progressing.
- This was a deterministic config/toolchain mismatch rather than an app-level code defect.

## Validation performed

- `npm run build` (passes)

## Current repo condition after this pass

1. Production build path is unblocked for the current dependency/toolchain set.
2. TypeScript option compatibility now aligns with the installed compiler behavior in CI/Vercel.
3. No runtime behavior changes were introduced; this is a build-system compatibility fix.

## Remaining risks / next steps

1. If TypeScript is upgraded in the future, re-evaluate whether `ignoreDeprecations` is still needed and which value is valid for that version.
2. Add a quick CI check to catch config parse regressions early (`npm run build` already detects this class of issue).

## Overall repo state and recommendations

- Repo appears operational from the frontend build perspective after this fix.
- Keep `tsconfig.json` options pinned to values validated against the exact TypeScript version in lockfile/CI.
- Consider adding a lightweight dependency-policy note in docs for TypeScript-option changes so config drift is reviewed deliberately.

---

# CurrentState — Trainer local agent and reference grounding

**Last updated:** 2026-03-31  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Connected the trainer to the repo’s local subagent catalog and local reference library so imported specs under `agents/categories/**` and tool/function source material under `agents/references/**` are usable during training runs, then tightened the offline fallback authoring path so live runs preserve local subagent tools and reference-driven process structure.

## Executive summary (2026-03-31)

- The trainer can now see the local subagent catalog under `agents/categories/**` instead of treating only flat root `agents/*.md` files as discoverable local agents.
- Trainer study-source listing now includes local subagent specs and curated `agents/references/**` bundles alongside live corpus sources.
- Auto-recommendation can now pull matching local subagents and tool/function reference bundles into a study pack when no explicit sources are selected.
- Local reference bundles are now prioritized partly by local subagent family, so meta-orchestration, tooling, MCP, and memory-oriented agents can pull more relevant repo-local source material even when the brief wording is generic.
- The trainer agent list now merges Supabase-backed agents with the local catalog so categorized subagents remain visible even when the database already has agent records.
- `/agent-trainer` now speaks honestly about studying a mixed source set: live corpus, local subagent specs, local reference bundles, and shared collaboration memory.
- Live trainer reruns for `multi-agent-coordinator` and `mcp-developer` still authored through the deterministic fallback, but that fallback now preserves local tool lists and role-shaped process steps instead of flattening those agents into generic spec boilerplate.

## What changed

- Added:
  - `api/__tests__/trainer-catalog.test.ts`
  - `api/__tests__/trainer-study-sources.test.ts`
- Updated:
  - `server/agent-trainer/catalog.ts`
  - `server/agent-trainer/study-sources.ts`
  - `server/agent-trainer/persistence.ts`
  - `server/agent-trainer/orchestrator.ts`
  - `client/src/features/agent-trainer/AgentTrainerPage.tsx`
  - `agents/INDEX.md`
  - `docs/CurrentState.md`
  - `docs/PlaybookOperatorManual.md`

## Why this was needed

- The repo now contains a large local subagent library under `agents/categories/**`, but the trainer’s local catalog scan only recognized flat `agents/*.md` files.
- The repo also now contains `agents/references/**`, which is useful source material for tools, function calling, MCP, routing, and memory abilities, but it was not available to trainer study packs at all.
- That meant the trainer could not study or even see most of the new local material unless it was separately ingested into Supabase, which broke the intended “use what is already in the repo” workflow.
- The trainer UI also still described its study lane as “live corpus” only, which no longer matched the desired operating model once repo-local subagents and reference materials became part of the grounding surface.
- Live reruns showed a second problem: when the author stage fell back to the deterministic local path, it flattened strong local subagent patterns into generic “Handle …” responsibilities and default tool lists, which weakened the value of the new study-pack work.

## Validation performed

- `npx vitest run --config vitest.api.config.ts api/__tests__/trainer-catalog.test.ts api/__tests__/trainer-study-sources.test.ts`
- `pnpm exec tsc -p tsconfig.json --noEmit`
- Live trainer study-pack inspection:
  - `multi-agent-coordinator` auto-selected God Mode, seed prompts, local meta-orchestration subagents, and routing/memory reference bundles
  - `mcp-developer` auto-selected God Mode, seed prompts, local developer-experience subagents, and tooling/MCP reference bundles
- Live trainer validation after fallback-authoring refinement:
  - run `38d5d71f-2f7f-4748-ab4c-d8e18b619b64` for `multi-agent-coordinator` reached `awaiting_review` with three passing evals at `4.46` and preserved `Read`, `Write`, `Edit`, `Glob`, `Grep` plus routing/memory-specific process steps
  - run `65f928aa-63a4-4349-9937-5b51c5e4dc11` for `mcp-developer` reached `awaiting_review` with three passing evals at `4.46` and preserved `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep` plus tooling/MCP-specific process steps

## Current repo condition after this pass

1. Local subagents under `agents/categories/**` are now part of the trainer-visible catalog instead of being stranded as unreferenced repo content.
2. Curated `agents/references/**` bundles are now available as trainer study sources for tool use, function calling, MCP, routing, and memory patterns.
3. A training run without explicit study-source selection can now auto-pull a mixed study pack that includes recommended corpus sources, locally relevant subagent specs, and relevant local reference bundles.
4. The offline fallback authoring path now preserves local subagent tool lists and reference-shaped process steps when those local sources are selected.
5. The trainer page now labels local subagent and local reference study sources explicitly, which makes the operator-facing workflow legible.
6. `agents/INDEX.md` now reflects the real structure: flat root specs remain canonical runnable agents, while categorized subagents and references are reusable local study material.

## Remaining risks / next steps

1. The trainer can now see the local subagent catalog and reference bundles, but it still does not diff against an existing local spec as a formal baseline before authoring a new version.
2. Auto-recommendation for local subagents and reference bundles is still heuristic, but it now uses subagent-family preferences in addition to brief keyword matching.
3. The reference lane currently exposes curated bundles rather than every file under `agents/references/**`; expand that set deliberately as real training needs become clearer.
4. If specific subagents should become first-class visible agents rather than study references, they still need deliberate registry/policy decisions rather than being promoted automatically.

# CurrentState — Billy Memory Grounding + Expert Trainer Study Pack

**Last updated:** 2026-03-31  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Reduced Billy's over-scripted coaching tone, added automatic durable-memory capture into Supabase for Billy conversations, grounded the trainer in live `knowledge_fragments` and shared collaboration memory, and validated the trainer end to end through both smoke deployment and an expert-context run.

## Executive summary (2026-03-31)

- Billy now speaks with less canned reflective-therapist language and less visible Loom ritual while preserving the grounding model.
- Billy can now extract durable first-person facts from conversation turns and persist them into `memory_entries` for identified users instead of discarding that context between sessions.
- The trainer no longer depends on a brief plus synthetic scenarios alone; it can now list live study sources from Supabase, accept `studySourceFiles` and `studyFocus`, assemble a study pack from `knowledge_fragments`, pull shared collaboration memory, and synthesize a reusable understanding layer for curriculum, scenarios, and agent authoring.
- A pinned shared collaboration memory was written into Supabase so the preferred "live corpus + persistent memory + direct repo improvement" workflow is retrievable in later runs.
- Live trainer validation is now real rather than theoretical: one smoke run was approved and deployed after a safety-lint fix, and a second expert-context run completed with passing evals using the new study-pack path.

## What changed

- Added:
  - `server/agent-trainer/study-sources.ts`
  - `api/trainer/study-sources.ts`
  - `supabase/migrations/20260331110000_trainer_study_sources_rpc.sql`
- Updated:
  - `shared/billy/runtime.ts`
  - `api/_lib/memory.ts`
  - `api/billy.ts`
  - `client/src/lib/billyApi.ts`
  - `api/__tests__/billy.test.ts`
  - `api/__tests__/memory.test.ts`
  - `api/__tests__/billy-runtime.test.ts`
  - `shared/agent-trainer/schemas.ts`
  - `client/src/features/agent-trainer/lib/trainerApi.ts`
  - `client/src/features/agent-trainer/hooks/useTrainingRun.ts`
  - `client/src/features/agent-trainer/AgentTrainerPage.tsx`
  - `server/agent-trainer/orchestrator.ts`
  - `shared/agent-trainer/policies.ts`
  - `docs/CurrentState.md`
  - `docs/PlaybookOperatorManual.md`

## Why this was needed

- The Tuesday notes and subsequent live inspection showed that Billy still sounded too scripted in places and still lacked a trustworthy path for carrying user-specific context forward across sessions.
- The repo already had a strong memory substrate in `memory_entries`, but Billy was not yet using it to create durable continuity from real conversations.
- The trainer had basic orchestration, but it was still too easy for a run to feel generic because the source corpus, founder/operator preferences, and collaboration context were not explicitly assembled into an expert grounding pack.
- Live Supabase inspection confirmed that the knowledge corpus is already rich enough to support this path: `knowledge_fragments` currently contains 32,306 rows across Diligence, Documentation, WellnessApplication, Product, Architecture, Billy, PLK, and ManifestIndex material.

## Validation performed

- Billy memory/tone validation:
  - `npx vitest run --config vitest.api.config.ts api/__tests__/billy.test.ts api/__tests__/memory.test.ts api/__tests__/billy-runtime.test.ts`
  - `pnpm exec tsc -p tsconfig.json --noEmit`
- Live Supabase inspection:
  - confirmed grouped `knowledge_fragments` inventory by `source_kind`
  - confirmed live source files for Seed Prompts, Billy, PLK, and Manifest content
  - wrote a shared pinned workflow memory with `source_ref = codex:2026-03-31-live-workflow`
- Trainer smoke validation:
  - run `4f320684-8336-4c7b-9081-64b3bdcbe5e9` reached all stages but failed review progression because safety lint incorrectly flagged negated authority constraints
  - fixed `shared/agent-trainer/policies.ts` to make authority lint negation-aware
  - run `5a8fb61f-89f7-4ff8-adb8-fce1aafa64ae` reached `awaiting_review` with three passing evals at `4.44`
  - approved and deployed candidate version `91962e64-313d-4cf7-a46a-91fe228e1582` to `agents/generated/trainer-smoke-study-pack-safe.md`
- Expert-context trainer validation:
  - verified `buildTrainerStudyPack(...)` returned `memoryCount: 1` and included the pinned shared collaboration memory
  - run `05b4ee0d-c3bc-4e2d-ac69-14741907b5d0` reached `awaiting_review` with three passing evals at `4.51` using live corpus study sources plus collaboration memory

## Current repo condition after this pass

1. Billy now has a more usable continuity model: the runtime can store durable goals, preferences, constraints, relationships, identity signals, and insights from real conversation turns into Supabase for identified users.
2. Shared collaboration memories are now usable as operator-facing continuity state rather than just user-facing recall; pinned shared memories can influence trainer study packs even when semantic retrieval alone would miss them.
3. The trainer has moved from "brief + synthetic scenarios" toward "study the corpus first": the UI can list live study sources, the backend can assemble recommended packs, and orchestration now carries synthesized understanding into normalization, curriculum, scenario generation, and agent authoring.
4. The trainer approval/deploy loop has been validated against live Supabase state instead of only static code inspection.

## Remaining risks / next steps

1. The synthesized trainer-understanding summary is intentionally heuristic and useful, but it still deserves refinement so source weighting between Billy, PLK, diligence, and collaboration memory is more explicit.
2. Billy memory capture remains conservative by design and still no-ops for `guest-user`; that is correct for safety, but it means anonymous sessions still will not accumulate durable continuity.
3. There is not yet a dedicated operator UI for managing pinned shared collaboration memories, so creating or curating them still requires direct Supabase or backend-path interaction.
4. The new trainer study-source lane is validated live, but it should still be exercised with more intentional real agents beyond the smoke artifact and context-check candidate.

---

# CurrentState — Billy Auth Stabilization + Trainer Preflight + Heirloom Companion Dark Route

**Last updated:** 2026-03-31  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Stabilized the signed-in Billy path so auth/profile hydration cannot hold the chat surface hostage, reduced unnecessary founder-context/session persistence work, clarified founder continuity and trainer readiness in the UI, and routed `/alzheimers-legacy` to the Heirloom Companion page implementation already present in the repo.

## Executive summary (2026-03-31)

- Signed-in Billy now fails open past auth/profile hydration instead of waiting for profile lookup completion before leaving loading state.
- The Billy backend now does less unnecessary Supabase work by caching short-lived auth/founder lookups, skipping anonymous `billy_sessions` writes, and only refreshing founder heartbeat metadata when it actually needs to change.
- `/billy` now distinguishes founder continuity states explicitly instead of collapsing them into one generic “session active” badge, and it links founder-eligible but unseeded sessions back to `/dashboard`.
- `/agent-trainer` now answers the “can I start a run right now?” question directly with access, scenario-source, and queue/worker preflight messaging plus quick-fill starter templates.
- `/alzheimers-legacy` now uses the Heirloom Companion page implementation instead of the older bright exhibit shell.

## What changed

- Updated:
  - `client/src/contexts/AuthContext.tsx`
  - `api/_lib/auth.ts`
  - `api/_lib/supabase.ts`
  - `api/billy.ts`
  - `client/src/lib/billyApi.ts`
  - `client/src/components/BillyLive.tsx`
  - `client/src/features/agent-trainer/AgentTrainerPage.tsx`
  - `client/src/App.tsx`
  - `docs/CurrentState.md`

## Why this was needed

- The Tuesday notes surfaced a real mismatch between anonymous and signed-in Billy behavior; the code path confirmed that authenticated Billy was paying extra auth/profile/founder-context costs while the client also waited too aggressively on auth loading.
- Founder continuity existed in the repo, but the user-facing Billy surface did not explain the difference between “founder recognized,” “founder thread loaded,” and ordinary signed-in state.
- The trainer already supported synthetic scenario packs and review-first flow, but the page did not make that obvious, so “Start Run” felt blocked even when the backend could proceed.
- The app already defaulted to dark mode globally, but `/alzheimers-legacy` still pointed at the older light-heavy exhibit component instead of the Heirloom Companion surface.

## Validation performed

- `pnpm exec tsc --noEmit`
- `npx vitest --config vitest.api.config.ts run api/__tests__/billy-api.test.ts api/__tests__/dashboard.test.ts api/__tests__/lib.test.ts`

## Current repo condition after this pass

1. The signed-in Billy path is more resilient: auth/profile lag should no longer keep `/billy` stuck behind client-side loading state.
2. Billy’s authenticated request path still uses Supabase heavily, but it now avoids some of the most obvious unnecessary reads/writes and exposes continuity state more clearly in the UI.
3. The trainer surface is clearer about synthetic scenario generation, manual review before deployment, and the worker dependency for queued execution.
4. The Alzheimer’s public route now aligns better with the repo’s dark-default runtime instead of dropping into the older bright presentation.

## Remaining risks / next steps

1. Real seeded `scenario_sets` still do not appear to be provisioned from the repo; the trainer now has starter UI templates and synthetic-pack fallback, but not durable preloaded DB scenario packs.
2. Trainer progress beyond `queued` still depends on the worker path in `worker/trainer/main.ts` unless `TRAINER_INLINE_EXECUTION=true` is enabled in the environment.
3. Billy’s Supabase cost profile is improved but not yet instrumented with request-level telemetry, so the “18,000 calls in an hour” concern is reduced in obvious places but not fully quantified yet.
4. Founder-only affordances still depend on the founder/admin allowlist email matching the actual sign-in account on both client and server.

---

# CurrentState — Core Docs + Playbook v2 refresh

**Last updated:** 2026-03-30  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Refreshed the core orientation and operator docs so they match the current runtime, account/memory control plane, trainer surface, manifest workflow, and route/API inventory. Also regenerated the manifest outputs after the docs inventory changed materially.

## Executive summary (2026-03-30)

- Rewrote the main operator-facing docs so they now describe the current route map, Billy/memory grounding, dashboard control plane, trainer control plane, manifest workflow, and cross-repo operating loop.
- Promoted `docs/PlaybookOperatorManual.md` into a v2-draft field guide instead of leaving it as a lighter working manual.
- Regenerated `docs/gestaltview-v2.manifest.json` and `docs/gestaltview-v2.manifest.md`; the repo now reports `384` scanned files, `39` routes, `42` extracted API endpoints, `55` canonical docs, and `6` test scripts at generation time.

## What changed

- Rewrote:
  - `README.md`
  - `docs/AIFlow.md`
  - `docs/APIFlow.md`
  - `docs/ArchitecturalStructure.md`
  - `docs/Manifest.md`
  - `docs/SymbioticWorkflow.md`
  - `docs/PlaybookOperatorManual.md`
- Regenerated:
  - `docs/gestaltview-v2.manifest.json`
  - `docs/gestaltview-v2.manifest.md`

## Why this was needed

- The 2026-03-29 docs refresh materially improved the core architecture docs, but the repo has moved again since then:
  - `/dashboard` and `/api/session/dashboard` are now real control-plane surfaces
  - persistent user memory now exists through `/api/session/memory` and `memory_entries`
  - the trainer control plane now spans UI, API, server orchestration, worker execution, and Supabase lineage
  - the public route inventory is broader than the older README and playbook framing suggested
- The operator manual needed a stronger v2 draft so the repo's practical workflow, source-of-truth ladder, manifest expectations, and subsystem playbooks were all aligned in one place.
- Because the docs inventory changed materially, the generated manifest outputs needed to be refreshed in the same pass.

## Validation performed

- Re-read current runtime and operations anchors before rewriting docs:
  - `client/src/App.tsx`
  - `client/src/contexts/AuthContext.tsx`
  - `client/src/pages/DashboardPage.tsx`
  - `client/src/features/agent-trainer/lib/trainerApi.ts`
  - `api/billy.ts`
  - `api/_lib/llmRouter.ts`
  - `api/_lib/memory.ts`
  - `api/session/state.ts`
  - `api/session/dashboard.ts`
  - `api/session/memory.ts`
  - `api/trainer/**`
  - `server/agent-trainer/**`
  - `worker/trainer/main.ts`
  - `supabase/schema.sql`
  - `supabase/migrations/*`
  - `scripts/generate_repo_manifest.py`
  - `scripts/gv.sh`
  - `vercel.json`
- Regenerated manifests:
  - `python3 scripts/generate_repo_manifest.py`

## Current repo condition after this pass

1. The core docs now describe the current runtime much more coherently as one system instead of as loosely refreshed individual pages.
2. `README.md`, the architecture/API/AI docs, `Manifest.md`, `SymbioticWorkflow.md`, and the operator manual now agree on the current major lanes: Billy, session/dashboard/memory, trainer, diligence, and manifest workflow.
3. The generated manifest outputs are current again and now capture the expanded route and API inventory.

## Remaining risks / next steps

1. `scripts/run-comprehensive-tests.sh` currently shells out to `npm run test:api` and `npm run check`, but those scripts are not declared in `package.json`. Either align the wrapper or add the missing package aliases before treating that runner as a canonical validation gate.
2. `scripts/generate_repo_manifest.py` still extracts route and endpoint inventories mechanically from file contents, which means the generated manifest can over-capture internal/test surfaces or API path strings found inside UI code. Continue using `client/src/App.tsx`, live handler inspection, and `docs/APIFlow.md` for contract truth.
3. The next runtime-facing change should continue the same pattern: update the touched docs and regenerate the manifest in the same pass when route/API/script/doc inventory changes materially.

# CurrentState — Dashboard "Resolving session" stall guard

**Last updated:** 2026-03-30  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Fixed a dashboard access blocker where auth session resolution could hang indefinitely and keep users stuck on `Resolving session...`.

## Executive summary (2026-03-30)

- Added a defensive timeout in `AuthContext` so the UI cannot remain indefinitely blocked in auth-loading mode if Supabase session resolution hangs on certain networks/devices.
- Ensured auth-loading is explicitly cleared on auth state change callbacks as well, preventing stale loading state after delayed auth events.
- Preserved existing behavior where profile fetch failures are non-fatal; users can still proceed while profile hydration retries through normal flow.

## What changed

- Updated:
  - `client/src/contexts/AuthContext.tsx`
    - Added an 8-second `getSession` timeout fail-open guard for `isLoading`.
    - Cleared timeout on successful/failed session resolution and component cleanup.
    - Marked auth loading complete in `onAuthStateChange` handler to avoid a stuck spinner.

## Why this was needed

- The dashboard page gates on `authLoading` and displays `Resolving session...` while `isLoading` is true.
- If `supabase.auth.getSession()` does not resolve promptly (intermittent mobile/network/runtime edge cases), the page could remain stuck even after successful login.

## Validation performed

- Type-check validation:
  - `npx tsc --noEmit`

## Repo state and recommendations / next steps

1. Consider adding lightweight auth telemetry (e.g., session resolve duration percentile and timeout count) to distinguish real auth failures from transport stalls.
2. Consider surfacing a user-visible retry CTA if session resolution times out, alongside a diagnostic note in dev mode.
3. If this pattern appears in other gated routes, centralize a shared `authReady` policy so all authenticated pages inherit the same fail-open behavior.

# CurrentState — Founder Dashboard + Account Control Surface

**Last updated:** 2026-03-30  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Added a real authenticated dashboard surface for account state, founder/admin activation, founder continuity persistence, admin account overrides, Billy Voice Studio launch/diagnostics, and database-level founder admin bootstrap.

## Executive summary (2026-03-30)

- Added a new authenticated `/dashboard` route so signed-in users have a visible account control plane instead of relying on hidden Supabase state.
- Added `/api/session/dashboard` as the server-backed surface for reading account state, activating founder admin for the founder allowlist, and persisting founder continuity fields.
- Extended the shared Supabase REST helper with authenticated `users`-row reads, listing, and upserts so the dashboard can safely reflect and update the live account record.
- Expanded the dashboard to include admin user management plus Billy runtime diagnostics and direct launch access to `/billy/voicestudio`.
- Added a Supabase migration so the founder email is provisioned as `enterprise + is_admin=true` directly from the auth signup trigger, with existing founder rows backfilled when present.

## What changed

- Added:
  - `client/src/pages/DashboardPage.tsx`
  - `api/session/dashboard.ts`
  - `api/__tests__/dashboard.test.ts`
- Updated:
  - `client/src/App.tsx`
  - `client/src/pages/SignIn.tsx`
  - `client/src/pages/Welcome.tsx`
  - `api/_lib/supabase.ts`
  - `client/src/components/NavBar.tsx`
  - `supabase/migrations/20260330170000_founder_admin_bootstrap.sql`

## Validation performed

- `pnpm exec vitest run --config vitest.api.config.ts api/__tests__/dashboard.test.ts`
- `pnpm exec tsc --noEmit`

---

# CurrentState — Agent Trainer Skill Surface + Trainer RLS Policies

**Last updated:** 2026-03-30  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Promoted the new agent-trainer slice into the repo skill system and added explicit trainer Supabase policies so the feature is operable through both the codebase and the skills layer.

## Executive summary (2026-03-30)

- Added a canonical `gestaltview-agent-trainer` skill so the trainer runtime is routable from the same curated skill surfaces used elsewhere in the repo.
- Documented the trainer runtime map, skill-composition model, and Supabase policy posture inside `skills/gestaltview-agent-trainer/`.
- Added a dedicated trainer RLS migration so the trainer tables use explicit `service_role` policies instead of relying on the weaker "RLS enabled but no policy" state.

## What changed

- Added:
  - `skills/gestaltview-agent-trainer/SKILL.md`
  - `skills/gestaltview-agent-trainer/references/runtime-map.md`
  - `skills/gestaltview-agent-trainer/references/skill-composition.md`
  - `skills/gestaltview-agent-trainer/references/supabase-policy-model.md`
  - `skills/gestaltview-agent-trainer/agents/openai.yaml`
  - `supabase/migrations/20260330120830_trainer_rls_policies.sql`
- Updated the curated catalog surfaces so the trainer feature is discoverable from `skills/manifest.json`, `skills/INDEX.md`, and the generated agents catalog.

## Validation target for this pass

- Regenerate the skill agents catalog.
- Validate the new trainer skill structure.
- Apply the trainer policy migration and confirm Supabase security advisors are clean for the trainer tables.

# CurrentState — Consolidated Wiki Refresh

**Last updated:** 2026-03-29  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Replaced the stale consolidated wiki export with a repo-current single-page snapshot generated against the live route map, Billy/API flow, Supabase layer, and refreshed docs/skills surfaces.

## Executive summary (2026-03-29)

- Rewrote `docs/GestaltView-v2-Wiki.md` from scratch instead of preserving stale sections that still referenced removed skill-number paths and older runtime assumptions.
- Rebuilt the wiki around current source anchors: `client/src/App.tsx`, `client/src/components/BillyLive.tsx`, `client/src/lib/billyApi.ts`, `api/billy.ts`, `api/_lib/llmRouter.ts`, `api/_lib/supabase.ts`, `supabase/schema.sql`, `supabase/config.toml`, `server/index.ts`, and `vercel.json`.
- Aligned the new wiki with the already refreshed companion docs (`ArchitecturalStructure`, `AIFlow`, `APIFlow`) and the refreshed GestaltView skill-suite state.

## What changed

- Replaced the prior giant wiki export with a shorter consolidated page that now:
  - uses the generate-wiki page marker format
  - includes an explicit relevant-sources block
  - anchors every major section to current file citations
  - documents the actual API-first Billy path, current provider cascade, live route inventory, API families, Supabase split, and repo-boundary guidance
- Removed stale references and outdated claims from the wiki, including:
  - old numbered skill paths such as `skills/00-suite-orchestrator/*` and `skills/07-workflow-operations/*`
  - older Billy browser-first framing
  - route and API assumptions that no longer match the live repo

## Validation performed

- Used the repo-local generate-wiki skill and reviewed its current workflow/reference files before editing.
- Collected a repo context snapshot with:
  - `python3 skills/gestaltview-generate-wiki/scripts/collect_context.py --repo-path . ...`
- Extracted line-numbered source material with:
  - `python3 skills/gestaltview-generate-wiki/scripts/read_files.py --repo-path . --files '[...]'`
- Verified only one live consolidated wiki target exists under `docs/`:
  - `docs/GestaltView-v2-Wiki.md`
- Spot-validated the rewritten wiki against:
  - `README.md`
  - `client/src/App.tsx`
  - `client/src/components/BillyLive.tsx`
  - `client/src/lib/billyApi.ts`
  - `api/billy.ts`
  - `api/_lib/llmRouter.ts`
  - `api/_lib/supabase.ts`
  - `supabase/schema.sql`
  - `supabase/config.toml`
  - `server/index.ts`
  - `vercel.json`
- No runtime tests or builds were run because this pass was documentation-only.

## Remaining risks / next steps

1. This repo still does not carry a live wiki `toc.yaml`, so the refreshed output is intentionally a single current snapshot page rather than a regenerated multi-page wiki tree.
2. If `docs/wikis/` or a TOC-driven export returns as an actively maintained surface, the next pass should formalize that structure and run the skill validator against it.
3. Future wiki edits should stay tied to the same source-citation discipline used in this refresh so the page does not drift back into narrative overreach.

---

# CurrentState — Core Docs Runtime-Alignment Refresh

**Last updated:** 2026-03-29  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Refreshed the main non-skill architecture and operations docs so they match the current route map, API surface, Billy flow, Supabase usage, and deployment/env reality.

## Executive summary (2026-03-29)

- Rewrote the core runtime docs that were still describing older Billy, routing, provider-order, and file-layout assumptions.
- `docs/AIFlow.md` now describes the current API-first Billy path, the server-side retrieval pipeline, the real provider cascade, and the client fallback boundary.
- `docs/APIFlow.md` now includes the live endpoint inventory, including pricing, session, webhook, health, bucket-drop, and voice routes that were previously missing.
- `docs/ArchitecturalStructure.md`, `docs/Manifest.md`, `docs/README-manifest.md`, `docs/Workflows.md`, and `docs/VERCEL_ENV_CHECKLIST.md` were rewritten to align with current repo files and integrations.

## What changed

- Rewrote:
  - `docs/ArchitecturalStructure.md`
  - `docs/AIFlow.md`
  - `docs/APIFlow.md`
  - `docs/Manifest.md`
  - `docs/README-manifest.md`
  - `docs/Workflows.md`
  - `docs/VERCEL_ENV_CHECKLIST.md`
- Corrected major stale assumptions, including:
  - Billy no longer being documented as primarily direct browser-to-Gemini
  - the LLM router no longer being described as a generic key-first selection layer
  - missing API routes such as `/api/billy-health`, `/api/billy-bucket-drop`, `/api/pricing`, `/api/session/state`, `/api/stripe/*`, and `/api/voice/billy`
  - outdated references to non-current files like `AGENTS.md`, `CodexAgent.md`, and old skill-number paths in `docs/Workflows.md` and `docs/Manifest.md`
  - outdated client/runtime assumptions such as React 18, React Router v6, and React Query-backed app state
- Added current Supabase emphasis across the core docs:
  - auth
  - user tiers
  - founder continuity
  - rate limits
  - retrieval fragments
  - RPC search

## Validation performed

- Read and compared the current runtime sources before rewriting docs:
  - `client/src/App.tsx`
  - `client/src/components/BillyLive.tsx`
  - `client/src/lib/billyApi.ts`
  - `client/src/contexts/AuthContext.tsx`
  - `api/billy.ts`
  - `api/actions/[...path].ts`
  - `api/billy-health.ts`
  - `api/billy-bucket-drop.ts`
  - `api/pricing.ts`
  - `api/session/state.ts`
  - `api/stripe/checkout.ts`
  - `api/stripe/webhook.ts`
  - `api/voice/billy.ts`
  - `api/_lib/llmRouter.ts`
  - `api/_lib/supabase.ts`
  - `supabase/config.toml`
  - `supabase/schema.sql`
  - `vercel.json`
- Checked for stale doc patterns before rewriting:
  - older React/router references
  - missing or renamed files
  - outdated skill-path references
  - obsolete “BillyLive is direct browser Gemini” wording
- No runtime tests or builds were run for this pass because the changes were documentation-only.

## Current repo condition after this pass

1. The main architecture docs are materially closer to the current source tree.
2. Billy, API, and Supabase documentation now match the live runtime much more closely than the March 13, 2026 versions.
3. The core docs and the refreshed GestaltView skill suite are now aligned with each other.

## Remaining risks / next steps

1. Generated wiki and historical snapshot docs under `docs/generated_*` and `docs/wikis/*` still contain older references and should be treated as archival outputs until refreshed separately.
2. If more runtime drift appears, prefer updating the code-adjacent docs (`AIFlow`, `APIFlow`, `ArchitecturalStructure`, `Manifest`, `Workflows`) in the same pass as the underlying change.
3. A future cleanup pass should reconcile older secondary docs like `PERPLEXITY.MD` and other long-form snapshots that still mention removed files or outdated operating conventions.

---

# CurrentState — Vercel TypeScript build failure fix (`Error.code` narrowing)

**Last updated:** 2026-03-29  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Resolved Vercel compile break in `api/billy.ts` and re-validated production build command.

## Executive summary (2026-03-29)

- Fixed the Vercel/TypeScript build error `TS2339: Property \`code\` does not exist on type \`Error\`` at `api/billy.ts(107,21)`.
- Updated deprecation warning logging to safely narrow `warning` to `NodeJS.ErrnoException` before reading `.code`.
- Re-ran `npm run build`; TypeScript and Vite build now pass in this environment.

## Change details

### Root cause
- Node's `process.on("warning")` callback value is typed as `Error` in this TypeScript context.
- The code accessed `warning.code` directly, which is not guaranteed on `Error`, causing compile failure in Vercel.

### Remediation
- Introduced `warningCode` with runtime type narrowing:
  - read `.code` only when `typeof (warning as NodeJS.ErrnoException).code === "string"`
  - otherwise fall back to `"unknown"`
- Preserved existing warning payload shape and all correlation metadata.

## Validation performed

- `npm run build` ✅ passed (`tsc && vite build`).

## Next steps / recommendations

1. Keep this narrowing pattern for any Node warning/error properties not present on base `Error`.
2. If further Vercel-only type/runtime differences appear, validate via `npm run build` before deploy.
3. Continue tracking deprecation warnings in production logs for `DEP0169` noise reduction.

---

# CurrentState — Billy DEP0169 triage + runtime diagnostics hardening

**Last updated:** 2026-03-29  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Reproduced `/api/billy` in non-prod with deprecation tracing, isolated likely dependency path, upgraded/pinned runtime dependencies, and added request-correlated deprecation warning capture.

## Executive summary (2026-03-29)

- Ran `/api/billy` locally with `NODE_OPTIONS=--trace-deprecation` under Node 22 using a direct handler harness to ensure stack traces would include exact offenders if emitted.
- No `DEP0169` warning was emitted in this container during representative Billy calls after dependency alignment.
- Upgraded `@vercel/node` from `4.0.0` to `5.6.22` (minimum meaningful runtime lane jump for Vercel Node adapter) and pinned `follow-redirects@1.15.11` via `overrides` because the warning class originates in transitive URL handling pathways not directly controlled in app code.
- Added a lightweight deprecation warning guard in `api/billy.ts` that captures warning metadata together with `requestId` and `traceId` via `AsyncLocalStorage` so future runtime regressions have immediate correlation context.

## DEP0169 investigation details

### Reproduction attempts

1. **Direct API handler execution with tracing enabled**
   - Command:
     - `NODE_OPTIONS=--trace-deprecation npx -y node@22 node_modules/tsx/dist/cli.mjs /tmp/repro-billy.mts`
   - Result:
     - Handler executed (with expected outbound-network fetch failures in sandbox), but no `DEP0169`.
2. **Vercel dev runtime attempt**
   - Command:
     - `NODE_OPTIONS=--trace-deprecation npx vercel dev --listen 4010`
   - Result:
     - Environment could not fully start Vercel dev due to external connectivity failures (`ENETUNREACH` to Cloudflare/Vercel endpoints), so this path could not produce a trace stack in-container.

### Dependency conclusion and minimum adjustment

- **Likely warning lane:** transitive URL compatibility code inside HTTP client/proxy dependency chains surfaced only under specific runtime adapters.
- **Minimum practical remediation in this repo:** bump `@vercel/node` from `4.x` to `5.6.22` and pin `follow-redirects@1.15.11`.
  - This preserves current app behavior while removing stale adapter/runtime combinations most likely to surface Node URL deprecations in serverless execution.
  - We do not directly call `url.parse()` in `api/billy.ts`; this is dependency/runtime-surface hardening.

### Post-change verification

- Re-ran representative `/api/billy` request path with deprecation tracing and scanned output:
  - `NODE_OPTIONS=--trace-deprecation npx -y node@22 node_modules/tsx/dist/cli.mjs /tmp/repro-billy.mts`
  - `rg -n "DEP0169|DeprecationWarning" /tmp/billy-trace-after.log`
- Result: no DEP0169 found in the captured logs for the tested path.

## Recommendations / next steps

1. Run the same trace command in Vercel Preview/Dev where the warning was originally observed and confirm the stack is now clean there as well.
2. If DEP0169 reappears, capture the exact stack and pin the specific transitive package via `overrides` with a comment in `package.json`.
3. Keep the new request-correlated warning guard in place for all Billy boot diagnostics and ingestion-related startup checks.

# CurrentState — Skills Keeper Protocol Initiation + Revenue Hunter Enhancement

**Last updated:** 2026-03-29  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Initiated Skills Keeper protocol support in the repo agent layer, improved Revenue Hunter agent quality, and synchronized operational state guidance.

## Performance addendum — Billy CTA interaction staging + mobile first-open deferral (2026-03-29)

### Scope
- Reworked Billy greeter CTA click flow to prioritize immediate tap acknowledgement and defer expensive follow-up work (`openPanel`, route transitions, section scroll/highlight) off the tap task boundary.
- Staged Billy panel initial heavy behavior for mobile first-open so render/interaction overhead is reduced during the first activation window.
- Introduced lightweight pending/opening CTA feedback to communicate click capture instantly.

### Changes applied in this pass
- `client/src/components/BillyGreeter.tsx`
  - Added explicit next-frame (`requestAnimationFrame`) and idle-time (`requestIdleCallback` fallback) scheduling helpers.
  - Refactored pathway selection to stop chaining close + route/scroll + panel mount in one task.
  - Added cheap `pendingPathwayId` state to pathway CTA cards to show immediate “Opening…” acknowledgement and temporarily disable duplicate taps.
- `client/src/components/Billy.tsx`
  - Lazy-loaded `BillyBabylon` with `React.lazy` + `Suspense` fallback avatar to keep initial panel/orb subtree lighter before visualization code is needed.
  - Added mobile first-open detection and threaded `deferVisualEffects` into `BillyPanel`.
  - Updated first-open panel behavior: auto-scroll uses non-animated mode and initial prompt auto-send is staged later when deferral is active.

### Validation / profiling status
- Local static validation: TypeScript/Vite build should be run after this pass to ensure no regressions.
- Requested Android Chrome INP re-profile **has not yet been run in this environment**; must be validated on-device with the same Billy CTA path used in the prior report.

### Reasoning
1. Input latency was likely dominated by synchronous work triggered directly from CTA clicks.
2. Deferring route/scroll/panel mount steps to the next frame and idle periods preserves immediate input responsiveness.
3. A visible pending/opening state confirms user intent capture even while deferred work continues.
4. Mobile first-open deferral reduces the chance of stacking expensive visual work during the most sensitive interaction window.

### Next steps
1. Run mobile on-device INP profiling (Android Chrome) against the same CTA flow and compare to baseline “poor” events.
2. If remaining spikes persist, capture a flamechart for panel mount and selectively defer non-essential message/avatar animation work further.
3. Keep this file synchronized with measured INP deltas after the on-device profile run.


## Hotfix addendum — Vercel Billy module-resolution incident (2026-03-28)

### Incident summary
- Production deployment `dpl_F8q2P5jqFaJqgn7uzEeTp1UrYAEX` logged repeated `ERR_MODULE_NOT_FOUND` failures for `/api/billy` when Node attempted to import `file:///var/task/api/_lib/response` (without extension).
- Blast radius observed in runtime logs: `GET/POST /api/billy` returned `500` while other routes such as `/api/session/state` continued returning `200/304`.

### Root cause
- The repository runs as ESM (`"type": "module"`). In the serverless runtime, extensionless relative imports inside API handlers were emitted in a form Node could not resolve for this function bundle.
- `api/billy.ts` failed first at `./_lib/response`, and neighboring API handlers used the same extensionless pattern.

### Changes applied in this pass
- Updated API runtime entrypoints to use explicit `.js` extensions for local ESM imports so the deployed serverless bundle resolves consistently:
  - `api/billy.ts`
  - `api/billy-health.ts`
  - `api/billy-bucket-drop.ts`
  - `api/actions/[...path].ts`
  - `api/voice/billy.ts`

### Validation performed for the hotfix
- `npm run build` → passed (full client/server TypeScript + Vite build).
- `npx vitest --config vitest.api.config.ts run api/__tests__/billy.test.ts api/__tests__/endpoints.test.ts` → passed (`14/14`).

### Updated operational state
1. The immediate Billy 500 regression from this incident is addressed in source with explicit ESM import specifiers.
2. The API contract and route behavior remain green in focused tests after the import-specifier update.
3. Next deployment should be verified against `/api/billy` and `/api/billy-health` immediately post-release to confirm runtime parity on Vercel.


## Hotfix addendum — Vercel Billy module-resolution incident (2026-03-28)

### Incident summary
- Production deployment `dpl_F8q2P5jqFaJqgn7uzEeTp1UrYAEX` logged repeated `ERR_MODULE_NOT_FOUND` failures for `/api/billy` when Node attempted to import `file:///var/task/api/_lib/response` (without extension).
- Blast radius observed in runtime logs: `GET/POST /api/billy` returned `500` while other routes such as `/api/session/state` continued returning `200/304`.

### Root cause
- The repository runs as ESM (`"type": "module"`). In the serverless runtime, extensionless relative imports inside API handlers were emitted in a form Node could not resolve for this function bundle.
- `api/billy.ts` failed first at `./_lib/response`, and neighboring API handlers used the same extensionless pattern.

### Changes applied in this pass
- Updated API runtime entrypoints to use explicit `.js` extensions for local ESM imports so the deployed serverless bundle resolves consistently:
  - `api/billy.ts`
  - `api/billy-health.ts`
  - `api/billy-bucket-drop.ts`
  - `api/actions/[...path].ts`
  - `api/voice/billy.ts`

### Validation performed for the hotfix
- `npm run build` → passed (full client/server TypeScript + Vite build).
- `npx vitest --config vitest.api.config.ts run api/__tests__/billy.test.ts api/__tests__/endpoints.test.ts` → passed (`14/14`).


### Follow-up incident after first hotfix (2026-03-28)
- A subsequent deployment (`dpl_9GHs6ghbkQadvWxC52zAKajSTNuG`) still returned `/api/billy` `500` with `ERR_MODULE_NOT_FOUND` for `file:///var/task/shared/llm/plk` imported by `api/_lib/llmRouter.js`.
- This confirmed the first pass fixed API entrypoint specifiers but missed an internal `_lib` dependency edge into `shared/`.
- Remediation in this pass: updated `api/_lib/llmRouter.ts` to use explicit ESM `.js` specifiers for `../../shared/llm/plk` and `../../shared/billy/types`.

### Updated operational state
1. The immediate Billy 500 regression from this incident is addressed in source with explicit ESM import specifiers.
2. The API contract and route behavior remain green in focused tests after the import-specifier update.
3. Next deployment should be verified against `/api/billy` and `/api/billy-health` immediately post-release to confirm runtime parity on Vercel.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Skills Keeper protocol | ✅ initiated | Added new `agents/skills-keeper.md` agent with stewardship, dispatch, and agent-improvement workflow contracts. | The repository now has an explicit runnable agent protocol for skill catalog enhancement and agent creation flows. |
| Revenue Hunter quality | ✅ enhanced | Reworked `agents/revenue-hunter.md` with tighter triggers, clearer guardrails, stronger output contracts, and explicit Skills Keeper handoff behavior. | Revenue-focused support is now easier to trigger reliably and better aligned to execution-first, ADHD-aware operations. |
| Revenue Hunter onboarding docs | ✅ enhanced | Rewrote `agents/revenue-hunter-quickstart.md` to include the new handoff path into Skills Keeper and simplified weekly rhythm guidance. | Founder/operator adoption is faster because activation, execution, and escalation steps are now explicit. |
| State documentation hygiene | ✅ aligned | Replaced stale runtime-heavy state content with this targeted update for the current mission. | CurrentState now reflects actual changes from this pass instead of unrelated prior details. |

## What changed

- Added new skills orchestration agent:
  - `agents/skills-keeper.md`
  - Includes mission classification, dispatch rules, output structure, and CurrentState sync responsibility.
- Improved revenue operations agent:
  - `agents/revenue-hunter.md`
  - Expanded trigger examples, clarified workflows (offer/outreach/pipeline), and added explicit collaboration contract with Skills Keeper.
- Updated activation guide:
  - `agents/revenue-hunter-quickstart.md`
  - Added “Skills Keeper protocol handoff” section and clearer daily/weekly operating rhythm.

## Reasoning for these changes

1. The user requested initiating the **skills-keeper protocol** with enhancement and agent creation intent.
2. The user explicitly requested focused improvement of `agents/RevenueHunter`.
3. Existing Revenue Hunter content was strong but lacked formalized cross-agent integration for skill/agent gap escalation.
4. `CurrentState.md` required synchronization per repo operating expectations after meaningful agent and workflow-documentation changes.

## Validation performed

- Verified agent/document syntax and working tree state:
  - `git status --short`
  - Result: changed files match intended scope.
- Reviewed updated files for structure and completeness:
  - `sed -n '1,240p' agents/skills-keeper.md`
  - `sed -n '1,260p' agents/revenue-hunter.md`
  - `sed -n '1,260p' agents/revenue-hunter-quickstart.md`
  - `sed -n '1,260p' docs/CurrentState.md`
  - Result: files present with expected protocol and handoff content.

## Overall repository state after this pass

- **Done:** Skills Keeper protocol is now represented as an actionable repository agent.
- **Done:** Revenue Hunter has improved triggering clarity, execution constraints, and escalation path.
- **Done:** Current state documentation now reflects this specific operational pass.
- **Partial:** No end-to-end runtime tests were required for this docs/agent-layer-only change set.
- **Risk:** Future agent additions may still drift unless the Skills Keeper handoff is routinely used and documented.

## Recommendations / next steps

1. Add a proposal-writing companion agent that Revenue Hunter can call once a lead converts to a qualified conversation.
2. Add a small `agents/INDEX.md` map to standardize when each agent should trigger.
3. Run monthly Skills Keeper stewardship sweeps to detect overlap, stale examples, or trigger-language collisions.
4. Keep updating `docs/CurrentState.md` on every meaningful agent/skills workflow change.

## Canonical files for this pass

- `agents/skills-keeper.md`
- `agents/revenue-hunter.md`
- `agents/revenue-hunter-quickstart.md`
- `docs/CurrentState.md`

**© 2026 Keith Soyka / GestaltView — All Rights Reserved**

## Hotfix addendum — Post-deploy runtime verification snapshot (2026-03-29)

### Incident summary
- Production deployment `dpl_7ar2ZEhK2hC6WpTtmNk9xWby27fL` was sampled from runtime logs on March 29, 2026.
- Observed route behavior: `/api/billy` returned multiple `200` responses across repeated calls, while `/api/session/state` returned mixed `200/304` responses.
- One Node deprecation warning (`DEP0169`) was observed during the same window.

### Current risk
- **Classification:** Non-blocking.
- **Operational impact:** Core Billy/session endpoints are currently healthy, but the `DEP0169` signal is technical debt / observability noise that can mask future actionable warnings if left untriaged.

### Next-step checklist
- [ ] Trace the `DEP0169` warning to its precise runtime call site (package + code path) from Vercel function logs.
- [ ] Remediate or pin/update the dependency chain responsible for `DEP0169`, then verify no new warnings are introduced in production logs.
- [ ] Run a mobile performance follow-up focused on INP and interaction timing around `BillyGreeter.tsx` flows, and record findings in the next `CurrentState` update.

### Updated operational state
1. Deployment `dpl_7ar2ZEhK2hC6WpTtmNk9xWby27fL` currently shows healthy Billy/session API behavior (`/api/billy` and `/api/session/state` returning successful HTTP statuses).
2. No blocking runtime regression is indicated from this sample.
3. Warning hygiene and mobile INP follow-up remain open and should be tracked as short-term reliability/performance debt.

## Agent catalog addendum — Revenue Hunter path establishment (2026-03-29)

### Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Agent index | ✅ added | Created `agents/INDEX.md` with agent routing notes, canonical-file rules, and an add-agent checklist. | Agent discovery no longer depends on remembering standalone filenames. |
| Root agent registry | ✅ added | Added `agents/openai.yaml` as a small root catalog for the visible `agents/` entries. | OpenAI-facing metadata now exists at the directory root as well as inside the Revenue Hunter folder. |
| Revenue Hunter path | ✅ established | Added `agents/revenue-hunter/README.md` as a stable folder entrypoint that routes to the existing prompt and quickstart files. | The repository now has a human-expected `agents/revenue-hunter` path without breaking the flat-file agent convention. |
| OpenAI metadata | ✅ added | Added `agents/revenue-hunter/openai.yaml` using the repo's existing interface/policy schema. | Revenue Hunter now has a machine-readable OpenAI metadata surface alongside the human-facing folder entrypoint. |
| Canonical structure | ✅ clarified | Documented that flat `agents/*.md` files remain the source of truth even when companion folders exist. | Future agent additions are less likely to fork into competing layouts. |

## What changed

- Added `agents/INDEX.md`.
- Added `agents/openai.yaml`.
- Added `agents/revenue-hunter/README.md`.
- Added `agents/revenue-hunter/openai.yaml`.
- Kept `agents/revenue-hunter.md` as the canonical prompt file and `agents/revenue-hunter-quickstart.md` as the operator guide.

## Reasoning for these changes

1. The user asked to establish `agents/revenue-hunter`, which implied a stable path rather than only a flat filename.
2. The repository already uses flat Markdown agent specs, so moving or duplicating the canonical Revenue Hunter prompt would create unnecessary drift risk.
3. The prior `CurrentState` entry explicitly recommended adding `agents/INDEX.md`; this pass closes that gap while preserving backward compatibility.
4. A root `agents/openai.yaml` registry now gives the directory a single OpenAI-facing entrypoint instead of relying only on per-agent metadata files.

## Validation performed

- Reviewed the existing agent surfaces and companion docs:
  - `find agents -maxdepth 3 -type f | sort`
  - `sed -n '1,260p' agents/revenue-hunter.md`
  - `sed -n '1,220p' agents/revenue-hunter-quickstart.md`
  - `sed -n '1,220p' agents/skills-keeper.md`
- Reviewed the new catalog surfaces after editing:
  - `sed -n '1,220p' agents/INDEX.md`
  - `sed -n '1,220p' agents/openai.yaml`
  - `sed -n '1,220p' agents/revenue-hunter/README.md`
  - `sed -n '1,120p' agents/revenue-hunter/openai.yaml`
- No runtime tests or builds were required because this was a documentation and agent-structure pass only.

## Overall repository state after this pass

- **Done:** `agents/revenue-hunter` now exists as a stable folder path.
- **Done:** `agents/openai.yaml` now provides a root-level registry for the visible agent catalog.
- **Done:** Revenue Hunter now has an `openai.yaml` metadata file in the established folder path.
- **Done:** `agents/INDEX.md` now standardizes agent discovery and canonical-file policy.
- **Done:** Existing Revenue Hunter prompt content remains single-source and backward compatible.
- **Risk:** Any future move from flat agent specs to per-agent folders should be handled as a deliberate repo-wide migration, not one-off drift.

## Canonical files for this pass

- `agents/INDEX.md`
- `agents/openai.yaml`
- `agents/revenue-hunter/README.md`
- `agents/revenue-hunter/openai.yaml`
- `agents/revenue-hunter.md`
- `agents/revenue-hunter-quickstart.md`
- `docs/CurrentState.md`
# CurrentState — Billy chat-mode regression fix (raw JSON + cloud fallback loop)

**Last updated:** 2026-03-30  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Fixed Billy chat behavior where Think mode could surface raw retrieval fragments (including JSON-like corpus content) and Vibe mode could drop into the legacy “cloud disrupted” canned fallback even when `/api/billy` returned 200.

## Executive summary (2026-03-30)

- Removed the `text-only` early-return in `api/billy.ts` that previously sent the first retrieved fragment directly as the assistant response.
- Text-only retrieval now remains context-only and still flows through `routeLlm`, so users get a normal conversational Billy response instead of raw corpus snippets.
- Updated client fallback behavior in `client/src/lib/billyApi.ts` to stop auto-switching to legacy browser orchestration when the server provider is `offline-fallback`; this prevents the local canned “cloud disrupted” response from replacing server output.
- Updated API tests to reflect the corrected text-only flow.

## What changed

- `api/billy.ts`
  - Removed the `retrievalMode === "text-only"` response short-circuit block that returned `knowledgefragments` content directly.
  - Kept text-only chunks in the normal response path so they inform prompt grounding while preserving Billy’s response layer.
- `client/src/lib/billyApi.ts`
  - Removed the automatic offline-provider handoff to `legacyBillyCall`.
  - Preserved legacy fallback for real network/request exceptions.
- `api/__tests__/billy.test.ts`
  - Updated text-only fallback assertion to verify the route goes through `routeLlm` and returns the LLM provider envelope.

## Validation performed

- Targeted test run for Billy API route assertions:
  - `npx vitest run --config vitest.api.config.ts api/__tests__/billy.test.ts`

## Next steps / recommendations

1. Re-check Vercel runtime logs for `/api/billy` provider metadata after deploy to confirm if production is frequently in `offline-fallback`; if yes, prioritize provider env-key remediation in Vercel project settings.
2. Optionally add lightweight UI copy for `offline-fallback` provider state so users see a clear degraded-mode indicator without legacy handoff side effects.
3. Consider adding an integration test that simulates `offline-fallback` from server and ensures the client renders that response verbatim.

# CurrentState — Billy local API proxy repair

**Last updated:** 2026-03-30  
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)  
**Scope of this pass:** Repaired local Billy API connectivity for the Vite dev path so browser chat and the Python voice worker stop falling through when `/api/*` is not hosted by `npm run dev`.

## Executive summary (2026-03-30)

- Confirmed that `npm run dev` starts Vite only, while `server/index.ts` serves static assets only; neither path exposes `api/*.ts` locally.
- This meant local requests to `/api/billy` could fail before the Billy server route ever ran, forcing fallback behavior and breaking the voice worker's default `BILLY_API_URL=http://localhost:3000`.
- Added a Vite `/api` proxy that forwards local API calls to:
  - `VITE_API_PROXY_TARGET`, then
  - `VITE_API_BASE_URL`, then
  - `VITE_BILLY_API_URL`, then
  - the canonical deployment `https://gestaltv1ew.vercel.app`
- The proxy no longer falls through to plain `BILLY_API_URL`, because `BILLY_API_URL=http://localhost:3000` can self-proxy back into the Vite dev server and cause browser-side `Failed to fetch` errors on `/api/*` routes.
- Updated `billy_voice/README.md` so the local voice-runtime instructions match the current dev topology and explain how to point Vite at `vercel dev` or another preview deployment.

## Validation performed

- Read and compared:
  - `vite.config.ts`
  - `client/src/lib/billyApi.ts`
  - `client/src/lib/BillyEngine.ts`
  - `billy_voice/app.py`
  - `server/index.ts`
- Attempted `npm run dev` in-container and confirmed the local dev path is Vite-only rather than a Vercel/API runtime.

---

## CurrentState — Agent Trainer Wednesday packaging uplift (2026-04-01)

**Scope of this pass:** Implemented the Wednesday package requests inside `agent_trainer/gv_operator_kit` by adding an agnostic corpus ingest script, BYOK GitHub Actions ingestion template, Redis scaffold variables, sub-agent templates, and expanded UX scaffolds for upload/import/export/voice affordances.

### What changed

- Added `agent_trainer/gv_operator_kit/scripts/ingest_generic_corpus.py` (generic lane-aware ingest scaffold with Supabase/Redis payload outputs).
- Added `agent_trainer/gv_operator_kit/.github/workflows/generic-corpus-ingestion.yml` (workflow-dispatch ingestion automation template).
- Added `agent_trainer/gv_operator_kit/templates/subagent-templates.json` (generic sub-agent + multi-agent orchestration baseline).
- Updated `agent_trainer/gv_operator_kit/components/KnowledgeUploader.tsx` and `agent_trainer/gv_operator_kit/components/AssistantChat.tsx` to surface upload/import/export/download/voice actions in the trainer UX.
- Updated `agent_trainer/gv_operator_kit/README.md`, `agent_trainer/gv_operator_kit/docs/IMPORT_GUIDE.md`, `agent_trainer/gv_operator_kit/setup/env.example`, and `agent_trainer/gv_operator_kit/CurrentState.md` to reflect the new package state.

### Validation performed

- `python agent_trainer/gv_operator_kit/scripts/ingest_generic_corpus.py --repo-root agent_trainer/gv_operator_kit --backend supabase --output /tmp/gv_supabase.jsonl`
- `python agent_trainer/gv_operator_kit/scripts/ingest_generic_corpus.py --repo-root agent_trainer/gv_operator_kit/scripts --backend redis --output /tmp/gv_redis.json`
- `pnpm exec tsc -p agent_trainer/gv_operator_kit/tsconfig.json --noEmit`

### Notes / follow-up

- The added ingestion script deliberately stops at payload generation; production upsert execution should remain buyer-owned and credential-scoped.
- Next iteration should add explicit manifest include/exclude control to the Python scaffold and runtime wiring for the newly surfaced UX actions.

---

## CurrentState — Admin workbook integration and trainer governance layer (2026-04-10)

**Scope of this pass:** Implemented the admin workbook registry, trainer experiment governance layer, and founder-only packaging gate described in `admin/GestaltView_AdminDashboard_WorkbookIntegration_SPEC.md`.

### What changed

- Added Supabase migration `supabase/migrations/20260410213000_workbook_and_experiment_governance.sql` with workbook sync tables, trainer governance tables, packaging candidates, and an explicit `training_runs.experiment_id` link.
- Added server repositories at `server/workbook/workbook-repository.ts` and `server/trainer/experiment-repository.ts` to centralize workbook CRUD, experiment detail assembly, review/flag persistence, and packaging gate evaluation.
- Added admin API routes under `api/workbook/*` and `api/trainer/experiments*` / `api/trainer/packaging-candidates*` for workbook sync, experiment lifecycle operations, policy flags, review decisions, and guarded packaging nomination/approval.
- Extended `shared/agent-trainer/schemas.ts` and added `shared/workbook/schemas.ts` so the new governance/workbook flows share typed request/response contracts across server and client.
- Updated `client/src/pages/DashboardPage.tsx` to expose new `Workbook` and `Packaging` founder-admin tabs, with `client/src/features/workbook/WorkbookSyncPanel.tsx` handling CSV/JSON sync and inline editing.
- Updated `client/src/features/agent-trainer/AgentTrainerPage.tsx` to add the `ExperimentRegistry` and `ReviewQueuePanel`, linking runs to experiments and enforcing policy-flag-aware review decisions before approval or promotion.
- Added targeted API tests for workbook upsert normalization and packaging-gate `409` behavior in `api/__tests__/workbook-items.test.ts` and `api/__tests__/trainer-packaging-candidates.test.ts`.

### Validation performed

- `pnpm exec tsc --noEmit --pretty false`
- Planned API spot coverage:
  - `api/__tests__/workbook-items.test.ts`
  - `api/__tests__/trainer-packaging-candidates.test.ts`

### Notes / follow-up

- The workbook import path is implemented as CSV/JSON sync rather than native `.xlsx` parsing so the runtime control plane works without introducing a new spreadsheet dependency.
- `docs/gestaltview-v2.manifest.json` and `docs/gestaltview-v2.manifest.md` should be regenerated after the final verification pass if this governance surface becomes the new baseline snapshot.

---

## CurrentState — Production origin + CORS/domain alignment refresh (2026-04-12)

**Scope of this pass:** Aligned API-facing origin defaults, OpenAPI server declarations, and public sitemap/robots host references to the current deployment host `https://gestaltv1ew.vercel.app` after domain migration from `https://gestaltview-dig-cog.vercel.app`.

### What changed

- Updated API fallback/default origin references used by runtime and CORS-sensitive paths:
  - `api/voice/billy.ts` (`DEFAULT_CORS_ORIGIN`)
  - `api/stripe/checkout.ts` (`FALLBACK_ORIGIN`)
  - `api/_lib/llmRouter.ts` (`HTTP-Referer` for OpenRouter requests)
- Updated API CORS test fixtures to reflect the new canonical primary origin:
  - `api/__tests__/cors.test.ts`
- Updated API action package OpenAPI server URLs:
  - `api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_actions_core.openapi.yaml`
  - `api/GPT/gestaltview_gpt_actions_package_v2/gestaltview_gpt_actions_comprehensive.openapi.yaml`
- Updated public host references for crawl/index assets so canonical URLs match the migrated domain:
  - `public/*` and `client/public/*` sitemap/robots assets
  - `client/src/pages/gestaltview_sitemap.{txt,xml,html}`

### Validation performed

- Ran targeted API CORS tests:
  - `npx vitest run --config vitest.api.config.ts api/__tests__/cors.test.ts`

### Next steps / recommendations

1. Ensure Vercel project env var `CORS_ORIGINS` includes the canonical host and required preview domains.
2. If old domain traffic is still expected, keep host-level redirects active at Vercel to preserve existing backlinks.
3. Optionally regenerate any derived docs/context bundles that embed host references (e.g., context-pack snapshots) so non-runtime documentation stays consistent.

---

## CurrentState — Trainer API network fallback hardening (2026-04-13)

**Scope of this pass:** Hardened the Agent Trainer API client so control-plane calls can recover from local `/api` proxy/network misses by retrying against an explicit configured API origin when available.

### What changed

- Updated `client/src/features/agent-trainer/lib/trainerApi.ts` request flow:
  - Added `normalizeApiBaseUrl` + `buildAbsoluteApiUrl` helpers.
  - Added a network-failure fallback path that retries failed relative `/api/*` requests against `VITE_API_BASE_URL` (or `VITE_API_PROXY_TARGET`) when those point to a different origin.
  - Preserved existing diagnostics payload semantics (`requestPath`, cause, auth header signal) so the trainer diagnostic card remains actionable.

### Validation performed

- `npx vitest run client/src/tests/agent-trainer-api.test.ts`

### Next steps / recommendations

1. Ensure local/dev environments set `VITE_API_BASE_URL` when the default `/api` proxy path is not stable (for example, when running the SPA independently of a local API server).
2. If trainer diagnostics still show `Failed to fetch`, verify the configured API origin is reachable and that auth bearer tokens are valid for that backend.

---

## CurrentState — BugWalk 2026-04-21 runtime remediation pass

**Scope of this pass:** Converted `BugWalk_4_21_26.md` into concrete runtime fixes for Billy's intro and crisis posture, founder context persistence, and Agent Trainer degraded-source behavior.

### What changed

- Revised the canonical **Never Look Away** invariant to emphasize staying present with distress, avoiding pathologizing/quick handoff language, and escalating to human support when safety actually requires it.
- Updated Billy runtime instructions so the 11-module schema is treated as internal memory mapping rather than visible UI navigation, reducing intro/UI mismatch.
- Sped up the Billy greeter typewriter experience and tightened the greeting copy around the actual available choices.
- Changed `/api/session/dashboard` founder/admin reads and writes to use the server-side Supabase service context after auth and access checks, so founder persistence is not blocked by user-scoped RLS policy drift.
- Removed the hard-coded production-host fallback from the Agent Trainer browser client; cross-origin fallback now only happens when `VITE_API_BASE_URL`, `VITE_API_PROXY_TARGET`, or `VITE_BILLY_API_URL` is explicitly configured.
- Added a manual file-to-study-focus fallback on the Agent Trainer run form so text/markdown/JSON/CSV source notes can be attached to a run even when trainer source APIs are degraded.
- Added `BugwalkBoard.md` as the repo-level bugwalk/session closeout protocol called for by the 2026-04-21 notes.

### Validation performed

- `npx vitest run client/src/tests/agent-trainer-api.test.ts`
- `npx vitest run --config vitest.api.config.ts api/__tests__/dashboard.test.ts`
- `npm run build`

### Remaining risks / follow-up

1. Supabase email delivery and cold-start behavior still depends on project tier/configuration outside the repo.
2. If production lacks `SUPABASE_SERVICE_ROLE_KEY`, founder persistence may still be constrained by anon-key RLS behavior.
3. Agent Trainer manual source upload is a temporary degraded-mode path; durable uploaded source ingestion still needs a server-backed storage/indexing design.
4. Created `docs/supabase-free-tier-workaround-research-prompt.md` as a handoff prompt for deeper workaround research while a Supabase tier upgrade is not possible.

---

## CurrentState — CORS origin canonical-host lock refresh (2026-04-27)

**Scope of this pass:** Confirmed the production CORS origin and corrected the prior stale-host note so runtime settings stay aligned to `https://gestaltview-digital-intelligence.vercel.app`.

### What changed

- Re-validated runtime CORS/default-origin codepaths and tests continue to treat `https://gestaltview-digital-intelligence.vercel.app` as the primary production host (`api/_lib/cors.ts`, `api/__tests__/cors.test.ts`, `api/voice/billy.ts`, `api/stripe/checkout.ts`).
- Replaced one remaining stale deployment-host reference in generated context documentation (`docs/wiki/_context/context_pack.json`) so published context bundles no longer point to an outdated Vercel host.
- Recorded an explicit ops recommendation that project/runtime env vars should use:
  - `CORS_ORIGINS=https://gestaltview-digital-intelligence.vercel.app`
  - plus any required preview/local origins as comma-separated additions.

### Validation performed

- `rg -n "gestaltview-digital-intelligence\.vercel\.app|gestaltview-dig-cog\.vercel\.app|CORS_ORIGINS|gestaltv1ew\.vercel\.app" --glob '!node_modules/**'`

### Next steps / recommendations

1. In Vercel project settings, remove any stale `CORS_ORIGINS` value that points at retired hosts and keep `https://gestaltview-digital-intelligence.vercel.app` as the first canonical origin.
2. If preview deployments need CORS access, append those domains in `CORS_ORIGINS` as additional comma-separated entries.

---

## CurrentState — Trainer Supabase admin `global.fetch` TypeScript compatibility fix (2026-04-29)

**Scope of this pass:** Unblocked Vercel production builds failing in the Agent Trainer server client while preserving the new Supabase timeout/resilience behavior.

### What changed

- Updated `server/agent-trainer/supabaseAdmin.ts` at the Supabase admin client initialization call to keep `global.fetch` timeout injection and add a narrow `as any` cast on `global` only.
- Added an inline note documenting why this cast is needed: some `@supabase/supabase-js` versions expose runtime `global.fetch` support but omit it from the `GlobalConfig` type shape.
- Updated `bugwalks/BugWalkBoard.md` with a shipped/verify card for this specific 2026-04-29 build break and fix pass.

### Validation performed

- `npm run build`
- `git diff --check`

### Next steps / recommendations

1. Keep `SUPABASE_QUERY_TIMEOUT_MS` configured in production so Supabase read stalls fail fast and surface retriable behavior upstream.
2. During the next dependency maintenance pass, evaluate pinning or upgrading `@supabase/supabase-js` to a version whose `global` typing includes `fetch`, then remove the local cast if type-safe support returns.

---

## CurrentState — GestaltView Expert recursive learning scaffold and provider selection map (2026-05-02)

**Scope of this pass:** Added a dedicated GestaltView Expert agent, a recursive why/what/how/where/when learning tree, a working assets tree for refactor artifacts, and a provider-selection config/workflow that mirrors the live router and trainer defaults.

### What changed

- Added `agents/gestaltview-expert.md` as a canonical agent spec for recursive repo learning, gap surfacing, and cross-session context rebuilding.
- Added `agents/gestaltview-expert/README.md` plus `agents/gestaltview-expert/learning/{README,why,what,how,where,when,gaps,todo}.md` so the expert has a durable knowledge spine to update across sessions.
- Added `assets/README.md` and `assets/gestaltview-expert/{README,code,components,captures,reports,todo}.md` as the working artifact tree for refactors, components, and evidence captures.
- Added root `openai.yaml` to document the provider/env/model mapping for Gemini, Groq, OpenAI, OpenRouter, Anthropic, Hugging Face, and Ollama across the live router and trainer.
- Added `.github/workflows/llm-provider-selection.yml` to validate provider selection for `GEMINI_API_KEY` / `GOOGLE_API_KEY`, `GROQ_API_KEY`, and `OPENAI_API_KEY` against the documented defaults.
- Registered the new agent in `agents/openai.yaml` and `agents/INDEX.md`.

### Validation performed

- Not run yet. The new files were added together and should be checked for YAML and workflow syntax before merging.

### Next steps / recommendations

1. Run a syntax pass on `openai.yaml` and `.github/workflows/llm-provider-selection.yml`, then fix any formatting or expression issues.
2. Populate the new learning tree with the first real runtime map once the expert agent has done a full repo scan.
3. Use the assets tree only for active refactor passes so it stays a working surface instead of a second archive.
