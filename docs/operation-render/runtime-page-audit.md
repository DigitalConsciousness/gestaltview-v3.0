# Operation Render Runtime Page Audit

Date: 2026-07-08

This audit starts the runtime-wide Operation Render pass from `operation_render_holistic_specs.zip`. It records the first integration slice and leaves explicit follow-up status instead of pretending every page was visually refactored in one risky sweep.

| Page | Current surface | Render upgrade needed | Risk | Status |
| --- | --- | --- | --- | --- |
| Home | Marketing/runtime entry surface with existing GestaltView neon language | Align shell tokens with Operation Render variables and ensure hero CTAs use glass/neon focus states | Medium; high traffic route | Partially upgraded in this pass; heavy motion now drops in degraded mode |
| Dynamic Inner World | Museum/artifact-heavy route already wired to NextGen preview language | Reuse artifact depth tokens and reduced-motion behavior around previews | Medium; artifact regressions possible | Partially upgraded before this pass |
| Creation Corner | Render/export workflow with local scene graph preview | Wrap generated outputs in a shared artifact frame vocabulary and surface render-later/degraded affordances | Medium; export pipeline must not regress | Partially upgraded before this pass |
| External Scaffold | Structured output/document room | Apply shared panel hierarchy and empty/error states | Low | Pending |
| Sanctuary | Softer onboarding/safety room | Use the same underlying tokens without losing the calm room tone | Low | Pending |
| Agent Builder | Trainer/control-plane surfaces | Add reasoning/tool policy indicators where profile configuration is shown | Medium; admin workflows | Pending |
| Voice Page | Dedicated browser voice interface route | Add voice capability/readiness panel and fallback messaging | Low | Integrated in this slice |
| Settings | Account/configuration surfaces | Add Operation Render field-continuity and low-bandwidth controls | Medium; settings semantics | Integrated in this pass |
| FAQ/Demo/Terms/Privacy/Contact | Public informational pages | Normalize backgrounds, focus rings, and glass cards so they are not visually orphaned | Low | Pending |

## First slice notes

- `client/src/styles/operation-render.css` now defines shared visual tokens, surface utilities, focus rings, and reduced-motion guards.
- `GlassCard` now accepts a backward-compatible `surfaceRole` prop for `ambient`, `active`, `artifact`, and `critical` depth roles.
- `LoadingSpinner` now uses Operation Render class hooks and respects reduced-motion users.
- `VisibleReasoningTrace` and `VoiceReadinessPanel` provide first runtime surfaces for safe reasoning visibility and voice fallback transparency.
