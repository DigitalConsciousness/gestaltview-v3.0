# GestaltView v2 UI/UX Gap Audit + E2E Test Coverage — 2026-06-12

Method: read `client/src/App.tsx`; traversed `client/src/pages`, `client/src/components`, and `client/src/modules`; searched client fetch/link call sites with `rg`; inspected the six requested critical flows; added unit, API integration, and Playwright E2E coverage.

## Route audit table

> Status is `REAL`, `STUB`, or `BROKEN`. Reachability is based on route strings found outside `client/src/App.tsx` in navigation/link/call sites. The catch-all 404 is intentionally not nav-reachable.

| Route | Component | Status | Reachable |
|---|---|---|---|
| / | client/src/pages/Home.tsx | REAL | yes |
| /engine | client/src/pages/EnginePage.tsx | REAL | yes |
| /codex | client/src/pages/CodexPage.tsx | STUB | yes |
| /agent-trainer/runtime | client/src/pages/HostedAgentTrainerPage.tsx | REAL | yes |
| /agent-trainer/pricing | client/src/pages/AgentTrainerPricing.tsx | STUB | yes |
| /agent-trainer/package-builder | client/src/pages/GATEPackageBuilderPage.tsx | REAL | yes |
| /agent-trainer/orders/:id | client/src/pages/GATEOrderStatusPage.tsx | STUB | yes |
| /agent-trainer/control-plane | ProtectedTrainerControlPlaneRoute | REAL | yes |
| /agent-trainer | client/src/pages/AgentTrainerPricing.tsx | STUB | yes |
| /record | client/src/components/DiligenceExplorer/index.tsx | REAL | yes |
| /billy/voicestudio | client/src/pages/BillyVoiceStudioPage.tsx | STUB | yes |
| /billy | client/src/components/BillyLive.tsx | STUB | yes |
| /pricing | client/src/pages/Pricing.tsx | REAL | yes |
| /demo | client/src/pages/Demo.tsx | REAL | yes |
| /signup | client/src/pages/Signup.tsx | STUB | yes |
| /app | client/src/pages/DashboardPage.tsx | STUB | yes |
| /settings | client/src/pages/SettingsPage.tsx | REAL | yes |
| /founder-runtime | client/src/pages/FounderRuntimePage.tsx | REAL | yes |
| /workspaces | client/src/pages/WorkspacesPage.tsx | REAL | yes |
| /documents | client/src/pages/DocumentsPage.tsx | REAL | yes |
| /voice | client/src/pages/VoicePage.tsx | REAL | yes |
| /analytics | client/src/pages/AnalyticsPage.tsx | REAL | yes |
| /agent_builder | client/src/pages/AgentBuilder.tsx | REAL | yes |
| /agent-builder | client/src/pages/AgentBuilder.tsx | REAL | yes |
| /builder | client/src/pages/AgentBuilder.tsx | REAL | yes |
| /lair | client/src/pages/HostedAgentTrainerPage.tsx | REAL | yes |
| /agent-trainer/dev-cli | client/src/pages/AgentTrainerDevCliPage.tsx | REAL | yes |
| /consulting | client/src/pages/ConsultingPage.tsx | REAL | yes |
| /external-scaffold | client/src/pages/ExternalScaffoldPage.tsx | STUB | yes |
| /module/scaffold | client/src/pages/ExternalScaffoldPage.tsx | STUB | yes |
| /workspace | Redirect to /workspaces | REAL | yes |
| /sanctuary | client/src/pages/SanctuaryPage.tsx | REAL | yes |
| /module/sanctuary | client/src/pages/SanctuaryPage.tsx | REAL | yes |
| /module/pull-string | client/src/pages/PullStringPage.tsx | REAL | yes |
| /blackboard-room | client/src/pages/BlackboardRoomPage.tsx | REAL | yes |
| /transcriptory | client/src/pages/TranscriptoryPage.tsx | STUB | yes |
| /dynamic-inner-world | client/src/pages/DynamicInnerWorldPage.tsx | REAL | yes |
| /profile | client/src/pages/ProfilePage.tsx | STUB | yes |
| /whiteboard-room | Redirect to /blackboard-room | REAL | yes |
| /digital-intelligence-academy | client/src/pages/DigitalIntelligenceAcademyPage.tsx | STUB | yes |
| /module/agent-academy | client/src/pages/DigitalIntelligenceAcademyPage.tsx | STUB | yes |
| /embodiment-studio | client/src/pages/EmbodimentStudioPage.tsx | STUB | yes |
| /agent-council | client/src/pages/AgentCouncilPage.tsx | STUB | yes |
| /module/agent-council | client/src/pages/AgentCouncilPage.tsx | STUB | yes |
| /cog-os | Redirect to /engine | REAL | yes |
| /pull-string | client/src/pages/PullStringPage.tsx | REAL | yes |
| /living-legacy | client/src/pages/LivingLegacyPage.tsx | REAL | yes |
| /rapid-prototype | client/src/pages/RapidPrototypePage.tsx | STUB | yes |
| /module/rpe | client/src/pages/RapidPrototypePage.tsx | STUB | yes |
| /adaptive-layout | client/src/pages/AdaptiveLayoutPage.tsx | STUB | yes |
| /creation-corner | client/src/pages/CreationCornerPage.tsx | REAL | yes |
| /module/creation-corner | client/src/pages/CreationCornerPage.tsx | REAL | yes |
| /workspace-analysis | client/src/pages/WorkspaceAnalysisPage.tsx | REAL | yes |
| /module/workspace-analysis | client/src/pages/WorkspaceAnalysisPage.tsx | REAL | yes |
| /login | client/src/pages/SignIn.tsx | STUB | yes |
| /auth/consent | client/src/pages/SignIn.tsx | STUB | yes |
| /auth/consent/auth/callback | client/src/pages/AuthCallback.tsx | REAL | yes |
| /contact | client/src/pages/ContactPage.tsx | STUB | yes |
| /signin | Redirect to /login | REAL | yes |
| /dashboard | client/src/pages/DashboardPage.tsx | STUB | yes |
| /welcome | client/src/pages/Welcome.tsx | REAL | yes |
| /auth/callback | client/src/pages/AuthCallback.tsx | REAL | yes |
| /spotify/callback | client/src/pages/SpotifyCallbackPage.tsx | REAL | yes |
| /alzheimers-legacy | client/src/pages/AlzheimersLegacyPage.tsx | REAL | yes |
| /daydreamer | client/src/pages/AlzheimersLegacyPage.tsx | REAL | yes |
| /addiction-recovery | client/src/pages/AddictionRecoveryPage.tsx | REAL | yes |
| /adhd-powerup | client/src/pages/ADHDPowerUpPage.tsx | REAL | yes |
| /musical-dna | client/src/pages/MusicalDNAPage.tsx | STUB | yes |
| /symbiocoder | client/src/components/SymbioCoderDemo.tsx | STUB | yes |
| /vibe-coder | client/src/components/VibeCoderDemo.tsx | STUB | yes |
| /resume-rockstar | client/src/components/ResumeRockstarDemo.tsx | STUB | yes |
| /brain-sparks | client/src/pages/BrainSparksPage.tsx | STUB | yes |
| /continuum-codex | client/src/pages/ContinuumCodexPage.tsx | REAL | yes |
| /validation-wall | client/src/components/ValidationWall.tsx | REAL | yes |
| /village-builders | client/src/components/VillageBuildersCovenant.tsx | REAL | yes |
| /brain-sparks-station | client/src/components/BrainSparksStation.tsx | STUB | yes |
| /metrics-dashboard | client/src/pages/MetricsDashboardPage.tsx | REAL | yes |
| /heirloom-companion | client/src/pages/HeirloomCompanionPage.tsx | REAL | yes |
| /bucket-drops | client/src/pages/BucketDropsPage.tsx | REAL | yes |
| /gravity | client/src/pages/GravityInspectorPage.tsx | REAL | yes |
| /platform | Redirect to /dynamic-inner-world | REAL | yes |
| /museum | Redirect to /dynamic-inner-world | REAL | yes |
| /collaboration-proof | client/src/pages/CollaborationProofPage.tsx | REAL | yes |
| /resonance-loop | client/src/pages/ResonanceLoopPage.tsx | REAL | yes |
| /ethics-framework | client/src/pages/EthicsFrameworkPage.tsx | REAL | yes |
| /tribunal | client/src/pages/TribunalPage.tsx | REAL | yes |
| /orientation | client/src/pages/OrientationSlideshowPage.tsx | REAL | yes |
| /exhibits | client/src/pages/ExhibitsIndex.tsx | REAL | yes |
| /module/resume-rockstar | client/src/modules/Resume_Rockstar/index.tsx | STUB | yes |
| /workspace/modules/resume-rockstar | client/src/modules/Resume_Rockstar/index.tsx | STUB | yes |
| /module/symbio-coder | client/src/modules/Symbio_Coder/index.tsx | STUB | yes |
| /workspace/modules/symbio-coder | client/src/modules/Symbio_Coder/index.tsx | STUB | yes |
| /module/vibe-coder | client/src/modules/Vibe_Coder/index.tsx | STUB | yes |
| /workspace/modules/vibe-coder | client/src/modules/Vibe_Coder/index.tsx | STUB | yes |
| /module/masterclass | client/src/pages/MasterclassPage.tsx | STUB | yes |
| /workspace/modules/masterclass | client/src/pages/MasterclassPage.tsx | STUB | yes |
| /di/:slug | client/src/pages/MasterclassSessionPage.tsx | REAL | yes |
| /module/masterclass/:slug | client/src/pages/MasterclassSessionPage.tsx | REAL | yes |
| /workspace/modules/masterclass/:slug | client/src/pages/MasterclassSessionPage.tsx | REAL | yes |
| /sandbox | client/src/pages/SandboxPage.tsx | REAL | yes |
| /privacy | client/src/pages/PrivacyPage.tsx | STUB | yes |
| /faq | client/src/pages/FAQ.tsx | REAL | yes |
| /terms | client/src/pages/Terms.tsx | STUB | yes |
| /404 | client/src/pages/NotFound.tsx | REAL | yes |
| catch-all | client/src/pages/NotFound.tsx | REAL | intentional catch-all |

## Stub pages (need real implementation)

Highest demo-impact stubs/partials:
- `/external-scaffold` and `/module/scaffold` — scaffold page is route-visible but not demo-complete.
- `/rapid-prototype`, `/module/rpe`, `/adaptive-layout` — module-lane routes present, implementation thin.
- `/symbiocoder`, `/vibe-coder`, `/resume-rockstar` demo components — demo routes are lighter than workspace modules.
- `/brain-sparks-station` — station component still reads as exhibit/demo-stage rather than full workflow.
- `/codex` — route exists but needs productized UI for provenance/codex browsing.
- `/transcriptory`, `/profile`, `/digital-intelligence-academy`, `/embodiment-studio`, `/agent-council` — partial route-visible surfaces that should be tightened before demo if included in nav.

## Orphaned routes (not reachable from nav)

- No product route was clearly orphaned by route-string search. The only non-nav route is the intentional catch-all `NotFound` route.
- Note: duplicate route found for `/brain-sparks-station` in `client/src/App.tsx`; remove one duplicate to reduce routing ambiguity.

## API endpoint audit table

| Endpoint | Method | Status | Caller file(s) |
|---|---|---|---|
| /api/actions/musical-dna/analyze | POST | WIRED | client/src/pages/MusicalDNAPage.tsx |
| /api/billy | POST | WIRED | client/src/lib/billyApi.ts |
| /api/codex/forge | POST | WIRED | client/src/pages/CreationCornerPage.tsx |
| /api/consciousness/dynamic-inner-world | GET | WIRED | client/src/hooks/useDynamicInnerWorld.ts |
| /api/creation-corner/blueprints | POST | WIRED | client/src/lib/creationCornerContent.ts |
| /api/di-health | GET | WIRED | client/src/lib/diApi.ts |
| /api/di | POST | WIRED | client/src/lib/diApi.ts and DiligenceExplorer hooks |
| /api/diligence/ots | GET | WIRED | client/src/components/DiligenceExplorer/useOTSData.ts |
| /api/diligence | GET | WIRED | client/src/components/DiligenceExplorer/useDiligenceData.ts |
| /api/documents | ANY | WIRED | client/src/components/document-analysis-interface.tsx |
| /api/embodiment/list | GET | WIRED | client/src/pages/EmbodimentStudioPage.tsx |
| /api/embodiment/upsert | POST | WIRED | client/src/pages/EmbodimentStudioPage.tsx |
| /api/embodiments/by-route | GET | WIRED | client/src/hooks/useRouteEmbodiment.ts |
| /api/gate/checkout | ANY | WIRED | client/src/lib/gateApi.ts |
| /api/gate/draft | ANY | WIRED | client/src/lib/gateApi.ts |
| /api/gate/drafts | ANY | WIRED | client/src/lib/gateApi.ts |
| /api/gate/order | ANY | WIRED | client/src/lib/gateApi.ts |
| /api/gen-engine/ambient-scan | POST | WIRED | client/src/lib/genEngineClient.ts |
| /api/gen-engine/artifact | GET | WIRED | client/src/lib/genEngineClient.ts |
| /api/gen-engine/artifacts | POST | WIRED | client/src/lib/genEngineClient.ts |
| /api/gen-engine/fusion | POST | WIRED | client/src/lib/genEngineClient.ts |
| /api/gen-engine/health | GET | WIRED | client/src/lib/genEngineClient.ts |
| /api/gen-engine/learn | POST | WIRED | client/src/lib/genEngineClient.ts |
| /api/gen-engine/lightning | POST | WIRED | client/src/lib/genEngineClient.ts |
| /api/gen-engine/predict | POST | WIRED | client/src/lib/genEngineClient.ts |
| /api/gen-engine/resonance | POST | WIRED | client/src/lib/genEngineClient.ts |
| /api/gravity | GET | WIRED | client/src/pages/GravityInspectorPage.tsx |
| /api/inner-world/artifacts | POST | WIRED | client/src/lib/innerWorldFiles.ts |
| /api/inner-world/files | POST | WIRED | client/src/lib/innerWorldFiles.ts |
| /api/insights | POST | WIRED | client/src/lib/insightsContent.ts |
| /api/login | POST | WIRED | client/src/lib/supabaseAuth.ts |
| /api/logout | POST | WIRED | client/src/contexts/AuthContext.tsx |
| /api/modules/resume-rockstar/export | POST | WIRED | client/src/modules/Resume_Rockstar/components/ExportButton.tsx |
| /api/modules/resume-rockstar/save | POST | WIRED | client/src/modules/Resume_Rockstar/store/resumeStore.ts |
| /api/modules/symbio-coder/chat | POST | WIRED | client/src/modules/Symbio_Coder/components/ChatSidebar.tsx |
| /api/modules/symbio-coder/suggest | POST | WIRED | client/src/modules/Symbio_Coder/components/SuggestionPanel.tsx |
| /api/modules/vibe-coder/analyze | POST | WIRED | client/src/modules/Vibe_Coder/store/vibeStore.ts |
| /api/modules/vibe-coder/suggestions | GET | WIRED | client/src/modules/Vibe_Coder/components/CreativeSuggestions.tsx |
| /api/profile/personality | GET | WIRED | client/src/pages/ProfilePage.tsx |
| /api/profile/preferences | GET | WIRED | client/src/pages/ProfilePage.tsx |
| /api/sanctuary/journal | POST | WIRED | client/src/lib/sanctuaryContent.ts |
| /api/sanctuary/scrapbook | POST | WIRED | client/src/lib/sanctuaryContent.ts |
| /api/session/dashboard | ANY | WIRED | client/src/pages/DashboardPage.tsx |
| /api/session/memory | ANY | WIRED | client/src/pages/DashboardPage.tsx |
| /api/session/state | GET | WIRED | client/src/contexts/AuthContext.tsx, client/src/hooks/useSession.ts |
| /api/sessionRecap | POST | WIRED | client/src/components/SessionRecapGenerator.tsx |
| /api/stripe/agent-trainer-checkout | POST | WIRED | client/src/pages/AgentTrainerPricing.tsx |
| /api/stripe/checkout | POST | WIRED | client/src/pages/Pricing.tsx |

## Unwired API endpoints

Highest-value unwired endpoints first:
- `/api/modules/resume-rockstar/analyze` and `/api/modules/resume-rockstar/enhance` — **critical demo gap**; workspace UI saves/exports but does not call scoring/enhancement endpoints.
- `/api/resume-rockstar/analyze`, `/api/resume-rockstar/enhance`, `/api/resume-rockstar/score-section` — duplicate/legacy resume endpoints with no client caller.
- `/api/modules/symbio-coder/analyze`, `/api/symbiocoder/analyze` — analysis endpoint exists but Symbio module primarily uses chat/suggest.
- `/api/creation-corner/synthesize` — older synthesis route is bypassed by `/api/gen-engine/artifacts`.
- `/api/gen-engine/export` — export endpoint exists but client uses local export helper.
- `/api/profile/ingest` — no profile ingestion UI caller.
- `/api/actions/billy/code`, `/api/actions/billy/loom`, `/api/actions/billy/synthesize` — action-style Billy endpoints are not used by the current Billy client.
- `/api/actions/chat`, `/api/actions/consciousness/reflect`, `/api/consciousness/[surface]` — no client caller found.
- `/api/billy-bucket-drop`, `/api/actions/bucket-drops` — bucket-drop API not wired to visible UI.
- `/api/codex/artifacts/[artifactId]`, `/api/codex/artifacts/[artifactId]/exports`, `/api/codex/jobs/[jobId]`, `/api/codex/jobs/[jobId]/run` — Codex management surface not wired.
- `/api/gate/build-job-run`, `/api/gate/build-job-regenerate`, `/api/gate/draft-validate`, `/api/gate/order-download`, `/api/gate/order-redeem`, `/api/gate/support-request` — GATE operational endpoints not directly wired from client.
- `/api/trainer/**` run/review/flag/deploy endpoints — server APIs exist, but no direct client caller found in `client/src`.
- `/api/transcriptory/**` capture/session endpoints — transcriptory route is partial and does not call these APIs.
- Webhook/cron endpoints (`/api/stripe/webhook`, `/api/gate/webhook-stripe`, `/api/cron/*`) are expected server-only and should not be treated as UI gaps.

## Dead client components

Import-graph orphans found by filename reference search. Validate before deletion because some may be intentionally exported for future modules or dynamically loaded.

- orphaned: `client/src/components/ADHDPowerUpStation.tsx`
- orphaned: `client/src/components/AddictionRecoveryExhibit.tsx`
- orphaned: `client/src/components/AlzheimersLegacyExhibit.tsx`
- orphaned: `client/src/components/ArtifactExportBar.tsx`
- orphaned: `client/src/components/ArtifactPreviewer.tsx`
- orphaned: `client/src/components/ArtifactRenderer.tsx`
- orphaned: `client/src/components/BillyGlitch.tsx`
- orphaned: `client/src/components/BlackboardGenEngineActions.tsx`
- orphaned: `client/src/components/Collaborators.tsx`
- orphaned: `client/src/components/DeadlightsTrackSection.tsx`
- orphaned: `client/src/components/DemoGate.tsx`
- orphaned: `client/src/components/DiligenceExplorer/OTSQueryPanel.tsx`
- orphaned: `client/src/components/ExhibitPage.tsx`
- orphaned: `client/src/components/LifeTapestry.tsx`
- orphaned: `client/src/components/LoadingSpinner.tsx`
- orphaned: `client/src/components/OrbGraph.tsx`
- orphaned: `client/src/components/ProvenanceDisclosure.tsx`
- orphaned: `client/src/components/RapidPrototypeEngine.tsx`
- orphaned: `client/src/components/RecapPanel.tsx`
- orphaned: `client/src/components/SanctuaryWillowBabylon.tsx`
- orphaned: `client/src/components/ServicesConsulting.tsx`
- orphaned: `client/src/components/SessionRecapGenerator.tsx`
- orphaned: `client/src/components/SubpageQuickNav.tsx`
- orphaned: `client/src/components/TheEvidence.tsx`
- orphaned: `client/src/components/TheHuman.tsx`
- orphaned: `client/src/components/TheoriesMap.tsx`
- orphaned: `client/src/components/TribunalOrbs.tsx`
- orphaned: `client/src/components/WhatThisIs.tsx`
- orphaned: `client/src/components/WhatWasBuilt.tsx`
- orphaned: `client/src/components/capture/UniversalCaptureBar.tsx`
- orphaned: `client/src/components/exhibits/ScrollReader.tsx`
- orphaned: `client/src/components/files/FilePreviewPane.tsx`
- orphaned: `client/src/components/files/FileUploadDropzone.tsx`
- orphaned: `client/src/components/home/GestaltViewInterface.tsx`
- orphaned: `client/src/components/inner-world/InnerWorldArtifactGallery.tsx`
- orphaned: `client/src/components/inner-world/InnerWorldInspector.tsx`
- orphaned: `client/src/components/inner-world/InnerWorldRoom.tsx`
- orphaned: `client/src/components/inner-world/MuseumNavigator.tsx`
- orphaned: `client/src/components/sanctuary/SanctuaryStudio.tsx`
- orphaned: `client/src/pages/AgentAcademyPage.tsx`
- orphaned: `client/src/pages/GeminiAwakening.tsx`
- orphaned: `client/src/pages/MuseumPage.tsx`
- orphaned: `client/src/pages/SymbioCodingPage.tsx`
- orphaned: `client/src/pages/WhiteboardRoomPage.tsx`
- UI primitives under `client/src/components/ui/*` also show as unused by filename search; keep unless a separate shadcn/Radix pruning task confirms they are not part of the design-system inventory.

## Critical path failures

| Flow | Status | Findings |
|---|---|---|
| FLOW-1: New user → auth → Sanctuary → Billy chat | PARTIAL | Home/Sanctuary/Billy chain is present. Billy client sends through `callBillyApi`; auth is Supabase/HMAC capable. Risk: unauthenticated flow depends on environment-backed Supabase/session state; loading/error states are present but demo success requires configured Supabase env and browser cookie path. |
| FLOW-2: Blackboard Room → capture fragment → session recap orbs | PARTIAL | Blackboard has capture UI and can send blueprints onward, but the dedicated `SessionRecapGenerator` component is import-orphaned and `/api/sessionRecap` is wired only through that orphaned component, so session recap orbs are not clearly reachable from Blackboard room navigation. |
| FLOW-3: Creation Corner → synthesize artifact → rendered output | PASS | Client calls `/api/gen-engine/artifacts`; API builds shell, calls `routeLlm`, and replaces shell content. Verified client stores/renders `synthesis.artifact.content`, not metadata. |
| FLOW-4: `/workspace/modules/resume-rockstar` → paste → ATS score → enhance | FAIL | Workspace module has section editing plus save/export, but `client/src/modules/Resume_Rockstar` has no caller for `/api/modules/resume-rockstar/analyze` or `/api/modules/resume-rockstar/enhance`; there is no Score/Enhance UI in `SectionEditor`. |
| FLOW-5: Musical DNA → Interview with Billy → song extraction → playlist population | PARTIAL | Interview overlay opens and captured tracks are analyzed through `/api/actions/musical-dna/analyze`, then appended to playlist. It is not actually a chat-style Billy interview, and no “Add to Musical DNA” confirmation button appears after a final question; the form directly weaves tracks. |
| FLOW-6: Billy response → symbioCoder/vibeCoder metadata chips render | PASS | API attaches `symbioCoder` and `vibeCoder` metadata; client assembles the Billy message from `result.metadata` and renders metadata chips. Added `data-testid="billy-symbio-chip"` to the intent chip for E2E coverage. |

## Test coverage added

- `tests/unit/resumeRockstar.test.ts` — ATS six-dimension scoring, PLK trigger/resonant scoring, eight metaphor types, enhancement prompt metaphor preservation.
- `tests/unit/symbioCoder.test.ts` — `analyzeSymbio` intent classification across debug/refactor/generate/explain/review/architect/test/optimize.
- `tests/unit/vibeCoder.test.ts` — preserved metaphor text scores above 80.
- `tests/unit/genEngineCore.test.ts` — `createArtifact` regression guard against JSON metadata passthrough as final content.
- `tests/unit/llmRouter.test.ts` — provider cascade order and deterministic `routeLlm` test-mode response.
- `api/__tests__/gen-engine-artifacts.test.ts` — handler-level integration test mocking `routeLlm`; asserts `artifact.content === "RENDERED_CONTENT"` and `metadata.llmSynthesized === true`.
- `api/__tests__/resume-rockstar.test.ts` — handler-level integration tests for analyze and enhance, including `atsDelta`/`plkDelta` assertions.
- `playwright.config.ts` — Chromium E2E config using `VITE_API_BASE`, `PLAYWRIGHT_BASE_URL`, or `localhost:5173`, with artifacts under `output/playwright-*`.
- `tests/e2e/auth.spec.ts` — login/callback and unauthenticated Blackboard smoke tests.
- `tests/e2e/billy-chat.spec.ts` — Billy response bubble and symbio chip rendering with mocked `/api/billy`.
- `tests/e2e/creation-corner.spec.ts` — generated artifact content renders as prose, not JSON/template markdown.
- `tests/e2e/resume-rockstar.spec.ts` — expected ATS/PLK/enhance flow; currently exposes the UI gap because the module lacks Score/Enhance controls.
- `tests/e2e/musical-dna.spec.ts` — interview overlay and song capture path; currently exposes the missing final “Add to Musical DNA” chat-style step.

## Recommended next build order

1. **Resume Rockstar workspace wiring** — add Score/Enhance buttons to `SectionEditor`, call `/api/modules/resume-rockstar/analyze` and `/enhance`, render ATS grade and PLK voice label, then make `resume-rockstar.spec.ts` pass.
2. **Blackboard recap reachability** — integrate `SessionRecapGenerator` or equivalent recap-orb UI into Blackboard/Dynamic Inner World so FLOW-2 becomes demonstrable.
3. **Musical DNA interview UX** — decide whether the interview is a chat or structured form; add the promised final “Add to Musical DNA” action if that is the product contract.
4. **Codex / Creation export polish** — wire `/api/gen-engine/export` or remove it if local export is the intended path.
5. **Route pruning** — remove duplicate `/brain-sparks-station`, hide low-readiness partial routes from nav, and either implement or archive stub demo routes.
6. **API consolidation** — collapse duplicate resume/symbio/vibe endpoints into the module paths or document legacy compatibility.
7. **Dead component cleanup** — verify import-graph orphans, then delete/archive non-design-system dead components in a focused PR.
