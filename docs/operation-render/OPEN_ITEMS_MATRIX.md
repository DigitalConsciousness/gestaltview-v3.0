# Operation Render Open Items Matrix

Date: 2026-07-08
Source inputs: `operation-render-slice-one.zip`, `docs/operation-render/runtime-page-audit.md`, `docs/operation-render/dependency-audit.md`, `docs/operation-render/acceptance-checklist.md`, `docs/CurrentState.md`, and live GitHub repo inspection.

## P0 — sweep blockers / ownership gaps

| Item | Why it matters | Current evidence | Sweep action | Acceptance |
| --- | --- | --- | --- | --- |
| Generated TypeScript registry ownership | Generated files drift if people hand-edit output or blame the file instead of fixing the generator. | `shared/embodiment/generated.ts` is explicitly auto-generated from `embodiment_profiles/*.embodiment.json`. | Add generator `--check`, duplicate slug detection, slug/filename guard, and CI/test command. | Fresh generator run is deterministic; stale generated file fails check; no manual edit needed. |
| Remote Supabase migration not applied | Slice One added schema scaffold locally, but runtime persistence cannot be trusted until remote migration is applied and verified. | CurrentState says Operation Render migration was added locally but not pushed remotely. | Apply migration, verify tables/indexes/RLS, add service/admin write pathway or explicit insert policies. | Remote catalog shows Operation Render tables, indexes, RLS, and expected policies. |
| Dependency audit unfinished | Slice One documents versions but does not perform latest/audit checks. | Dependency audit says latest-version checks were not performed. | Run `pnpm audit --prod`, review lockfile, remove or quarantine suspicious/stale packages only after build verification. | Audit ledger updated with actual results and mitigation notes. |
| Page-wide visual sweep remains pending | Voice page was integrated; most runtime surfaces remain pending or partial. | Runtime page audit marks Home, External Scaffold, Sanctuary, Agent Builder, Settings, and public pages as pending. | Sweep routes in risk order with shared Operation Render tokens and reduced-motion checks. | Every audited page has status, screenshot/manual note, and no build regression. |

## P1 — runtime visuals

| Surface | Current audit status | Required sweep | Risk | Suggested order |
| --- | --- | --- | --- | --- |
| Home | Pending visual sweep | Align shell tokens, hero CTA focus states, shared glass/neon vocabulary. | Medium/high traffic | 1 |
| External Scaffold | Pending | Shared panel hierarchy, empty/error states, focus rings. | Low | 2 |
| Sanctuary | Pending | Apply tokens without losing calm room tone. | Low | 3 |
| Settings | Pending | Add field-continuity and low-bandwidth controls. | Medium | 4 |
| Agent Builder | Pending | Add reasoning/tool-policy indicators near profile configuration. | Medium/admin workflow | 5 |
| FAQ/Demo/Terms/Privacy/Contact | Pending | Normalize backgrounds, focus rings, and glass cards. | Low | 6 |
| Dynamic Inner World | Partial | Reuse artifact depth tokens; reduced-motion around previews. | Medium/artifact regression | 7 |
| Creation Corner | Partial | Shared artifact frame vocabulary; render-later/degraded affordances. | Medium/export regression | 8 |

## P1 — embodiment reasoning and visible trace

| Item | Current state | Sweep action | Acceptance |
| --- | --- | --- | --- |
| Reasoning policy contracts | `shared/operation-render/contracts.ts` exists. | Persist policy resolution in runtime where DI responses are assembled. | Each response can resolve policy by profile/room. |
| Profile policy coverage | `resolveReasoningPolicy()` includes a few defaults only. | Generate or seed policy defaults for every active embodiment profile. | Every profile has a policy row or deterministic fallback. |
| Tool registry | Policy fields exist for browse/GitHub/Supabase/HF, but no central runtime enforcement is proven. | Add tool registry boundary: read-only by default, writes require explicit user confirmation. | Tool calls are logged and permissioned. |
| Visible reasoning UI | `VisibleReasoningTrace` exists. | Wire it to actual reasoning session summaries, evidence cards, assumptions, uncertainty, and tool logs. | Trace displays public evidence without raw hidden chain-of-thought. |
| Citation behavior | Contract supports `citationMode`. | Enforce source attachment for factual/current claims. | Factual external claims include evidence refs. |

## P1 — voice and field continuity

| Item | Current state | Sweep action | Acceptance |
| --- | --- | --- | --- |
| Voice readiness panel | Component exists and Voice page imports it. | Make readiness values env/runtime-driven instead of static defaults. | Voice page reports real provider status. |
| ElevenLabs fallback | Existing API route still fails if key missing. | UI must not fail; route should return clear provider-unavailable state. | Missing key produces fallback message, not blank UI. |
| Local/open voice | Existing repo has LiveKit/Whisper/CosyVoice worker path. | Surface worker status and document startup path. | Local/open voice can be tested independently. |
| Voice profile defaults | Contract and resolver exist. | Seed Billy and all active profiles into `voice_profiles`. | Billy has local preferred voice profile; others inherit browser/text fallback. |
| Offline capture | Contract exists only. | Implement local queue using localStorage/IndexedDB. | Text capture persists after reload while offline. |
| Sync/export | Migration has `field_continuity_events`. | Add sync endpoint and export unsynced queue action. | Queue syncs when online; user can export unsynced items. |
| Degraded mode | Visual audit calls out mobile/heavy render risk. | Add low-bandwidth/degraded mode flag that disables heavy 3D/fog layers. | Heavy render layers can be disabled globally. |

## P2 — validation and docs

| Item | Action | Acceptance |
| --- | --- | --- |
| Sweep validator | Add `scripts/validate-operation-render-sweep.mjs`. | Script fails if core Operation Render files drift/missing. |
| Generated registry check | Replace `scripts/build-embodiment-artifacts.mjs` with check-capable version. | `node scripts/build-embodiment-artifacts.mjs --check` passes on clean repo and fails on stale output. |
| CurrentState update | Add a new CurrentState entry after full sweep. | Entry names what changed, validation run, remaining risk. |
| Audit docs | Update `runtime-page-audit.md`, `dependency-audit.md`, and `acceptance-checklist.md`. | Each checklist item is checked, waived, or linked to follow-up. |
