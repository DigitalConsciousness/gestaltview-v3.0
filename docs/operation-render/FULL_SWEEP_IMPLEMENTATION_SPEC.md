# Operation Render Full Sweep Implementation Spec

Date: 2026-07-08
Repo: `DigitalConsciousness/gestaltview-v2.0`
Branch target: create a new branch before changes.

## Goal

Complete the open-ended work from Operation Render Slice One without destabilizing existing runtime behavior.

The sweep is not one giant visual overwrite. It is a controlled roll-forward across:

1. generated TypeScript/registry ownership,
2. Supabase migration verification,
3. dependency/build hardening,
4. runtime-wide visual completion,
5. embodiment reasoning/tool-use wiring,
6. visible reasoning trace integration,
7. voice readiness and open/local fallback,
8. field-continuity/offline capture,
9. validation and audit closeout.

## Non-negotiables

- Do not remove working runtime features to satisfy a spec.
- Do not hand-edit generated files as the durable fix.
- Do not expose raw hidden chain-of-thought. Visible reasoning means evidence, assumptions, uncertainty, tool trail, and redaction notices.
- Do not hard-fail user-facing UI when a paid provider key is absent.
- Do not make heavy render layers mandatory on degraded/mobile connectivity.
- Preserve existing exports and public component APIs unless there is a documented reason to change them.

## Slice 0 — branch, baseline, and ownership guard

### Tasks

1. Create a branch, e.g. `operation-render-full-sweep-20260708`.
2. Run baseline checks:
   - `corepack enable`
   - `pnpm install --frozen-lockfile`
   - `pnpm run build`
   - `node scripts/validate-embodiment-profiles.mjs`
   - `pnpm audit --prod`
3. Replace `scripts/build-embodiment-artifacts.mjs` with the proposed check-capable version.
4. Add `scripts/validate-operation-render-sweep.mjs`.
5. Add package scripts if desired:
   - `embodiments:check-generated`
   - `operation-render:validate`
6. Run generated check and operation-render validator.

### Acceptance

- Baseline build result is recorded before visual changes.
- Generated registry drift is now caught by script.
- If generated TypeScript is wrong, the generator/source/schema path owns the fix.

## Slice 1 — Supabase migration remote verification

### Tasks

1. Confirm `supabase/migrations/202607080001_operation_render_reasoning_voice.sql` is applied remotely.
2. Verify tables:
   - `operation_render_audits`
   - `embodiment_reasoning_policies`
   - `reasoning_sessions`
   - `tool_call_audit`
   - `visible_reasoning_cards`
   - `voice_profiles`
   - `voice_session_audit`
   - `field_continuity_events`
3. Verify indexes and RLS are present.
4. Decide write path:
   - service-role API inserts, or
   - explicit authenticated insert policies for user-scoped rows.
5. Seed default policies for active profiles if the runtime expects DB-backed policy reads.

### Acceptance

- Remote database matches migration intent.
- Runtime can write/read user-scoped reasoning, voice, and field-continuity rows through intended paths.
- No fail-open policies are added.

## Slice 2 — dependency and build hardening

### Tasks

1. Update `docs/operation-render/dependency-audit.md` with actual audit output.
2. Confirm dependency versions from `package.json` and lockfile, not memory.
3. Review suspicious/stale packages:
   - `supabase-js` placeholder security package,
   - `types`,
   - `add`,
   - duplicate runtime/dev route dependencies such as `wouter`,
   - visual stack duplication where runtime/dependency placement matters.
4. Do not bump everything at once. Prefer targeted lockfile-safe updates.
5. Verify server-only packages are not pulled into frontend bundles.

### Acceptance

- `pnpm audit --prod` is recorded.
- Any critical/high issues have mitigation or explicit waiver.
- Build still passes.

## Slice 3 — runtime visual sweep

### Tasks

Apply shared Operation Render surface tokens and reduced-motion discipline route-by-route.

Order:

1. Home
2. External Scaffold
3. Sanctuary
4. Settings
5. Agent Builder
6. FAQ/Demo/Terms/Privacy/Contact
7. Dynamic Inner World
8. Creation Corner

For each route:

- Wrap page shell or major sections in `operation-render-shell` when appropriate.
- Use `GlassCard` with `surfaceRole` for consistent depth.
- Normalize focus rings through `operation-render-focus`.
- Keep room-specific tone; do not flatten Sanctuary into neon noise.
- Ensure reduced-motion users are not forced through constant fog/particles.
- Do not rewrite business logic during visual pass unless a bug is blocking the page.

### Acceptance

- Every page in `runtime-page-audit.md` has status updated.
- No route loses existing controls, export actions, or navigation.
- The Voice page remains integrated.

## Slice 4 — reasoning/tool-use runtime wiring

### Tasks

1. Use `resolveReasoningPolicy(profileSlug, roomSlug)` at the DI response assembly boundary.
2. Add a central tool permission registry:
   - `none`
   - `read_only`
   - `bounded_write`
   - `explicit_confirm_write`
3. Log every tool call attempt to `tool_call_audit` or an API-side equivalent.
4. Store reasoning session summaries, assumptions, uncertainty, and evidence refs.
5. Require citations/evidence refs for factual/current external claims.
6. Make missing tools explicit instead of silently pretending.

### Acceptance

- Every profile resolves a policy.
- Tool calls are permissioned and auditable.
- Factual/current claims can attach source refs.
- Raw hidden scratchpad is never exposed.

## Slice 5 — visible reasoning trace integration

### Tasks

1. Build a helper that converts `reasoning_sessions`, `tool_call_audit`, and `visible_reasoning_cards` into `VisibleReasoningTrace` data.
2. Place `VisibleReasoningTrace` in the rooms where it is useful:
   - Billy/Blackboard responses,
   - Agent Builder policy preview,
   - Creation Corner generation results,
   - Dynamic Inner World artifact provenance.
3. Provide compact and expanded modes.
4. Keep humorous/redacted notices optional and never misleading.

### Acceptance

- Trace shows evidence cards, tool trail, assumptions, uncertainty, and redactions.
- Trace never shows raw hidden chain-of-thought.
- Trace gracefully handles no sources/tool calls.

## Slice 6 — voice readiness and open/local voice

### Tasks

1. Make `VoiceReadinessPanel` env/runtime-driven.
2. Surface local/open worker readiness:
   - LiveKit configured,
   - Whisper/faster-whisper path configured,
   - CosyVoice/HF/local TTS status,
   - ElevenLabs fallback status.
3. Keep text-only fallback always available.
4. Seed/resolve `VoiceProfile` for every active embodiment profile.
5. Log voice sessions and interruption counts where available.

### Acceptance

- Missing ElevenLabs key does not hard-fail UI.
- Voice page truthfully reports provider status.
- Billy has local/open preferred voice settings.
- Other profiles inherit safe fallback defaults.

## Slice 7 — field continuity / degraded mode

### Tasks

1. Add offline text capture queue using localStorage or IndexedDB.
2. Persist queue across reload.
3. Add online sync path to `field_continuity_events` or a server API that writes there.
4. Add export unsynced queue action.
5. Add degraded/low-bandwidth setting.
6. Gate heavy render layers under degraded/mobile mode:
   - Babylon/R3F scenes,
   - constant fog/particle systems,
   - large previews,
   - nonessential animation.

### Acceptance

- User can capture text offline.
- Queue persists after reload.
- Queue syncs when online.
- User can export unsynced data.
- Heavy render layers can be disabled.

## Slice 8 — closeout

### Tasks

1. Run:
   - `node scripts/build-embodiment-artifacts.mjs --check`
   - `node scripts/validate-operation-render-sweep.mjs`
   - `node scripts/validate-embodiment-profiles.mjs`
   - `pnpm run build`
   - `pnpm audit --prod`
2. Update:
   - `docs/operation-render/runtime-page-audit.md`
   - `docs/operation-render/dependency-audit.md`
   - `docs/operation-render/acceptance-checklist.md`
   - `docs/CurrentState.md`
3. Record any remaining blockers as explicit follow-up, not vague future work.

### Acceptance

- Audit checklist is no longer a wall of unchecked boxes.
- Remaining work is named, scoped, and owned by the proper subsystem.
- Generated TypeScript ownership is enforced.
