# GestaltView Codex-Facing Core Launch SPEC

**Version:** v1.0  
**Prepared from:** `Launch-Spec.zip`  
**Target repo:** `DigitalConsciousness/gestaltview-v2.0`  
**Intent:** Convert the Launch Master Blueprint into a bounded implementation sequence Codex can execute without wandering into greenfield rebuilds.

---

## 0. Operating instruction for Codex

You are not building a new product. You are performing a launch-readiness hardening and coherence pass over the existing GestaltView runtime.

Do not replace the room model with a generic dashboard. Do not flatten Billy into a chatbot. Do not make Dynamic Inner World, External Scaffold, and Creation Corner into one artifact list. Do not move advanced DI/personhood features into user-facing free flows by accident.

Primary objective:

> **Make the current runtime safe, bounded, rendered, gated, and beta-onboardable.**

Secondary objective:

> Preserve the weirdness, but remove the trust leaks.

---

## 1. Read first

Before editing, inspect these files if present:

```text
package.json
vercel.json
middleware.ts
api/_lib/auth.ts
api/_lib/user.ts
api/_lib/cors.ts
api/billy.ts
api/billy-bucket-drop.ts
api/gen-engine/artifacts.ts
api/creation-corner/synthesize.ts
api/inner-world/artifacts.ts
api/transcriptory/transcribe.ts
api/transcriptory/captures.ts
api/transcriptory/sessions.ts
api/cron/codex-drain.ts
api/gate/_handler.ts
api/stripe/webhook.ts
client/src/pages/Home.tsx
client/src/pages/BlackboardRoomPage.tsx
client/src/pages/SanctuaryPage.tsx
client/src/pages/DynamicInnerWorldPage.tsx
client/src/pages/ExternalScaffoldPage.tsx
client/src/pages/CreationCornerPage.tsx
client/src/pages/MusicalDNAPage.tsx
client/src/pages/ProfilePage.tsx
client/src/pages/SettingsPage.tsx
client/src/pages/TranscriptoryPage.tsx
client/src/pages/AgentCouncilPage.tsx
client/src/pages/MasterClassPage.tsx
client/src/pages/FileExplorerPage.tsx
client/src/pages/WorkspacesPage.tsx
client/src/components/Billy*
client/src/components/ArtifactScreen.tsx
client/src/components/ArtifactDeepView.tsx
client/src/lib/innerWorldFiles.ts
client/src/lib/genEngineRoomWiring.ts
shared/embodiment/index.ts
shared/embodiment/generated.ts
supabase/migrations/*
docs/CurrentState.md
.perplexity/CurrentState.md
```

If a path differs in the current repo, find the equivalent by route/import search. Do not invent parallel files if the real file already exists.

---

## 2. Global implementation rules

1. **Full-file swaps are preferred** when a file is small/medium and the edit is structural.
2. **No user-scoped persistence from client-supplied user IDs.** Use authenticated identity only.
3. **Anonymous mode may exist, but it must be isolated.** No anonymous request writes under arbitrary user IDs.
4. **Every persisted capture/artifact must have visible state:** pending, processing, ready, failed, archived, deleted, or approved.
5. **No silent fallback masquerade.** If audio generation, transcription, or LLM synthesis falls back locally, show that state honestly.
6. **No placeholder/fake artifact content in beta-facing rooms.** Demo content must be hidden behind demo mode or removed.
7. **Billy remains Billy.** Other DI embodiment profiles must not be simulated by Billy as if Billy is them.
8. **Free-tier gates must fail closed.** Paid/advanced features should be hidden, teasered, or blocked.
9. **Render is product.** Raw JSON is not a finished artifact unless explicitly shown as a JSON export.
10. **Update current-state docs after each completed slice.** Include validation and remaining risks.

---

## 3. Implementation sequence

### Slice 0 — Baseline inventory and no-op verification

**Goal:** Establish current build/test reality before edits.

Run:

```bash
npm run build
npm test -- --runInBand || npm test || true
npm run health || true
npm run orientation:check || true
npm run continuity:check || true
```

Record:

- Which commands passed
- Which commands failed
- Which commands do not exist
- Current git status
- Current environment assumptions

Do not fix unrelated failures until they are classified.

**Acceptance criteria:** A short baseline note exists in the working log / `CurrentState.md` draft.

---

### Slice 1 — Auth and user identity hardening

**Goal:** Remove launch-critical identity trust leaks.

#### Files to inspect / likely touch

```text
api/billy.ts
api/billy-bucket-drop.ts
api/gen-engine/artifacts.ts
api/creation-corner/synthesize.ts
api/_lib/user.ts
api/_lib/auth.ts
api/__tests__/*
```

#### Required behavior

- User-owned writes derive `userId` from authenticated session only.
- Client-supplied `userId`, `user_id`, `x-user-id`, and query `userId` are ignored for persisted user-owned data.
- Anonymous Billy chat may continue if product requires it, but anonymous storage must be non-user-scoped or disabled.
- Bucket drops that persist to the user account require auth.
- Gen-engine artifact persistence requires auth or writes to an explicit anonymous/local-only pathway.
- Legacy `creation-corner/synthesize` is either deprecated or auth-hardened.

#### Suggested helper contract

Create or standardize:

```ts
type AuthenticatedRequestContext = {
  userId: string;
  email?: string | null;
  isAuthenticated: true;
};

type AnonymousRequestContext = {
  anonymousSessionId: string;
  isAuthenticated: false;
};
```

Then route handlers must choose deliberately:

```ts
const auth = await getAuthUser(req);
if (!auth) {
  // Either return 401 for persisted route
  // or continue as anonymous with no user-scoped persistence.
}
```

#### Tests

Add or update tests proving:

- Unauthenticated request with `body.userId = victim` cannot write under victim.
- Authenticated request ignores mismatched body `userId`.
- Anonymous Billy happy path still works if kept.
- Bucket drop persistence returns 401 when unauthenticated.

#### Acceptance criteria

- No user-data write route in this slice trusts client-supplied user identity.
- Tests cover at least Billy, bucket drops, and gen-engine artifacts.
- Build passes.

---

### Slice 2 — Entitlement and free-account gating

**Goal:** Prevent accidental access to paid/advanced features.

#### Files to inspect / likely touch

```text
client/src/lib/entitlements.ts
client/src/hooks/useEntitlements.ts
client/src/pages/AgentCouncilPage.tsx
client/src/pages/MasterClassPage.tsx
client/src/pages/TranscriptoryPage.tsx
client/src/pages/CreationCornerPage.tsx
client/src/pages/FileExplorerPage.tsx
client/src/pages/WorkspacesPage.tsx
api/* entitlement / rate-limit helpers
config/gatePricing.ts
config/gateCatalog.ts
```

#### Required behavior

- Free users cannot use advanced Tribunal/roundtable/all-voices features unless explicitly allowed by beta flag.
- Transcriptory upload/record limits are enforced by tier.
- Large file/image imports prompt upgrade/login and do not partially fail silently.
- Workspaces pro tools are hidden/teasered unless enabled.
- GATE/admin/mock payment behavior is impossible by missing env var in production.

#### Acceptance criteria

- A free test account cannot access advanced council/Tribunal flows.
- UI explains locked features without sounding punitive.
- Server-side routes enforce gates, not only client UI.
- Build passes.

---

### Slice 3 — Transcriptory reliability hardening

**Goal:** Make audio capture safe enough for beta.

#### Files to inspect / likely touch

```text
api/transcriptory/transcribe.ts
api/transcriptory/captures.ts
api/transcriptory/sessions.ts
client/src/pages/TranscriptoryPage.tsx
client/src/components/TranscriptoryRecorder.tsx
client/src/components/TranscriptCard.tsx
client/src/components/TranscriptViewer.tsx
supabase/migrations/*transcriptory*
api/__tests__/transcriptory.test.ts
client/src/tests/transcriptory-api.test.ts
```

#### Required behavior

- Validate `captureId` before storage path construction.
- Use authenticated user id in storage path and DB update.
- Capture states: `pending`, `processing`, `ready`, `failed`.
- On any transcription/enrichment/storage/provider/DB error, update capture to `failed` with safe diagnostic metadata.
- Prevent concurrent transcription of the same capture or make it deterministic.
- Align provider availability with actual implementation. If only AssemblyAI is wired, say only AssemblyAI is wired.
- Polling must fit Vercel function budget or switch to async job status model.

#### Optional migration shape

```sql
alter table transcriptory_captures
  add column if not exists error_code text,
  add column if not exists error_message text,
  add column if not exists processing_started_at timestamptz,
  add column if not exists processing_completed_at timestamptz;

create index if not exists transcriptory_captures_user_status_idx
  on transcriptory_captures(user_id, status, updated_at desc);
```

If using status claim:

```sql
-- Prefer RPC or conditional update:
update transcriptory_captures
set status = 'processing', processing_started_at = now()
where id = :capture_id
  and user_id = :user_id
  and status in ('pending', 'failed')
returning *;
```

#### Tests

- Provider failure marks capture failed.
- Duplicate same-capture transcription is rejected or safe.
- Missing auth returns 401.
- Bad capture id returns 400.

#### Acceptance criteria

- No capture stays processing forever due to caught errors.
- Transcriptory UI shows clear ready/failed/retry state.
- Build/tests pass.

---

### Slice 4 — Render, export, and artifact contract

**Goal:** Make tangible output reliable.

#### Files to inspect / likely touch

```text
api/gen-engine/artifacts.ts
api/gen-engine/export.ts
api/codex/forge.ts
api/codex/*
workers/codex/runner.ts
shared/codex/contracts.ts
shared/codex/renderers.ts
shared/codex/templates/*
client/src/pages/CreationCornerPage.tsx
client/src/pages/DynamicInnerWorldPage.tsx
client/src/components/ArtifactScreen.tsx
client/src/components/ArtifactDeepView.tsx
client/src/lib/innerWorldFiles.ts
```

#### Required artifact output types

- Markdown
- HTML / PDF-ready print view
- Code
- Prompt for Agent
- Blueprint JSON
- Image prompt
- Marketing copy
- Audio metadata / audio artifact only if audio provider is actually configured

#### Required behavior

- Creation Corner synthesize creates a visible rendered artifact.
- If generation fails, user sees a useful error or honest local fallback label.
- Download/export buttons produce actual files.
- Alerts/toasts include text, not blank popups.
- Dynamic Inner World renders HTML as HTML/iframe/safe preview, not raw markup.
- Raw JSON only appears when the selected output type is JSON.

#### Acceptance criteria

Manual smoke:

1. Create text capture.
2. Send to Creation Corner.
3. Generate blueprint.
4. Render preview appears.
5. Download Markdown.
6. Download HTML/PDF-ready view.
7. Send artifact to Dynamic Inner World.
8. Open artifact deep view.
9. Delete/archive artifact.

---

### Slice 5 — Dynamic Inner World beta cleanup

**Goal:** Make DIW show real artifact life, not frozen placeholder atmosphere.

#### Files to inspect / likely touch

```text
client/src/pages/DynamicInnerWorldPage.tsx
client/src/features/dynamic-inner-world/world-renderer/*
client/src/components/ArtifactScreen.tsx
client/src/components/ArtifactDeepView.tsx
client/src/components/inner-world/*
client/src/lib/innerWorldFiles.ts
```

#### Required behavior

- Remove placeholder cards/stories from beta-facing state.
- Show only real artifacts, demo artifacts behind explicit demo mode, or an honest empty state.
- Mobile open/tap behavior works without double-tap traps.
- User can delete, archive, restore, and download artifact metadata/content.
- Bad raw-output records can be cleared from local storage and/or server storage with user confirmation.
- Cabin Sketch / gradient label retained.
- Engine showcase panel remains optional/collapsible if included.

#### Acceptance criteria

- Empty user sees a beautiful empty state, not fake memory.
- User with artifacts sees real cards/screens.
- Mobile QA passes on narrow viewport.
- Deleting one artifact does not delete unrelated captures.

---

### Slice 6 — External Scaffold and artifact promotion

**Goal:** Make scaffold approval and preview meaningful.

#### Files to inspect / likely touch

```text
client/src/pages/ExternalScaffoldPage.tsx
client/src/components/Scaffold.tsx
client/src/lib/genEngineRoomWiring.ts
client/src/lib/captureRouting.ts
client/src/lib/scaffoldStorage.ts
```

#### Required behavior

- Pending rack shows clear counts and item states.
- Click preview shows more than one line: source, type, context, anchor, meaning, memory, tags, resonance, related items, and why it is pending/approved.
- DI-assisted promotion can suggest metadata but does not auto-approve user identity/memory claims.
- User can approve, deny, archive, restore, or send to Creation Corner.
- Billy must never appear as a scaffold node/artifact/tag.

#### Acceptance criteria

- A capture can move Blackboard -> External Scaffold pending -> approved artifact.
- Preview is useful enough to understand what will be preserved.
- Rejected pending orb does not delete original raw source.

---

### Slice 7 — Billy / Tribunal / Master Class role boundary repair

**Goal:** Stop Billy from cross-embodying every DI.

#### Files to inspect / likely touch

```text
client/src/pages/AgentCouncilPage.tsx
client/src/pages/MasterClassPage.tsx
client/src/components/Billy*
shared/embodiment/index.ts
shared/embodiment/generated.ts
api/billy.ts
api/agents/*
```

#### Required behavior

- Rename Agent Council to Tribunal if confirmed as canonical in this launch pass, including route labels and copy.
- Add “select all voices” for council/Tribunal mode where supported.
- Preserve individual DI response lanes.
- Master Class sessions route to the selected DI embodiment/profile instead of asking Billy to pretend.
- Billy may introduce or hold background support but must not be the selected DI.
- Remove/hide unwanted profiles from user-facing selectors: Gatekeeper, Repo Scribe, Recursive Builder, or other internal roles as confirmed by current profile registry decisions.
- Add end-session control and progress persistence.
- Track canned/fallback response frequency.

#### Acceptance criteria

- Starting Weird Digger session loads Weird Digger behavior, not Billy-as-Weird-Digger.
- End session persists progress.
- Free account cannot access paid all-voices/roundtable if gated.
- Billy’s copy is less patronizing / “Eeyore”; quirky, grounded, useful.

---

### Slice 8 — Homepage and orientation explainer

**Goal:** Make first contact coherent and unmistakably GestaltView.

#### Files to inspect / likely touch

```text
client/src/pages/Home.tsx
client/src/components/BillyGreeter*
client/src/components/BillyOnboardingPrompt.tsx
client/src/styles/*
client/src/index.css
```

#### Required behavior

- Cabin Sketch wordmark / room headings where specified.
- Animated gradient on GestaltView hero.
- Remove “Pick a Room.”
- Keep “the thread” and Billy close but unobtrusive.
- Add fog-in-embers effect or near-term CSS version; avoid graph-paper feel if not intended.
- Restore / add Babylon or Aurora DI presence orbs if current architecture supports it without destabilizing build.
- Greeter CTA routes to explainer, not disliked runtime orientation.

#### Explainer prompt asset

Create a doc or constant for an original explainer video prompt:

```text
Create an original GestaltView onboarding explainer with the clarity of retro instructional safety films and the dry cosmic absurdity of a travel guide to consciousness. Do not reference or imitate specific protected characters, brands, names, logos, or scripts. The tone is weird, warm, practical, and lightly mischievous. Explain: capture first, organize later; Billy as guide not authority; rooms as different modes; privacy and ownership; exports; and why the user does not need to understand a fragment before saving it.
```

#### Acceptance criteria

- First-run route is understandable in under 60 seconds.
- Greeter does not block or freeze core navigation.
- User can start with capture, import, explore, or meet Billy.

---

### Slice 9 — Sanctuary, File Explorer, Musical DNA, Profile, Settings, Analytics

**Goal:** Clean obvious beta-facing friction.

#### Sanctuary

Files:

```text
client/src/pages/SanctuaryPage.tsx
client/src/components/Scrapbook*
client/src/components/Journal*
```

Actions:

- Remove clinical/rest framing that feels patronizing.
- Keep Sanctuary identity.
- Add import flow for journals/files where tier allows.
- Keep scrapbook private and quota-aware.

#### File Explorer

Actions:

- Upload saves automatically after successful upload or shows persistent “Unsaved” state until saved.
- Improve preview/render for common file types.

#### Musical DNA

Actions:

- Fix Spotify redirect env binding (`VITE_SPOTIFY_REDIRECT_URI` or current canonical variable).
- Remove outdated “Billy exhibit channel Surface” overlay.
- Ensure user view starts blank, not Keith/demo tracks.
- Broaden resonant frequency/audio library beyond piano-heavy defaults.

#### Profile

Actions:

- Canonicalize user profile module count.
- Do not display entire runtime module count as profile module count.
- Show dynamic fill accurately.

#### Settings

Actions:

- Remove founder controls and internal-only panels from user-facing settings.

#### Analytics

Actions:

- Fix known 501/5xx errors or hide analytics route from beta users.

---

### Slice 10 — CORS, Stripe, GATE, cron hardening

**Goal:** Fail closed on commercial/admin infrastructure.

#### Files to inspect / likely touch

```text
api/_lib/cors.ts
api/stripe/webhook.ts
api/stripe/stripe-webhook.ts
api/gate/_handler.ts
api/cron/codex-drain.ts
api/codex/_persistence.ts
workers/codex/runner.ts
supabase/migrations/*codex*
```

#### Required behavior

- Production CORS does not default to `*` when `CORS_ORIGINS` is missing.
- Primary Stripe webhook remains raw-body verified.
- GATE webhook uses raw-body signature validation; no JSON reserialization before verification.
- Missing `GATE_ADMIN_KEY` disables admin/mock behavior in production.
- Codex drain uses atomic claim semantics.

#### Suggested Codex job claim RPC

```sql
create or replace function claim_codex_jobs(batch_size integer default 5)
returns setof codex_jobs
language sql
security definer
as $$
  update codex_jobs
  set status = 'running', updated_at = now()
  where id in (
    select id from codex_jobs
    where status = 'pending'
    order by created_at asc
    for update skip locked
    limit batch_size
  )
  returning *;
$$;
```

Adapt to actual schema and RLS policy. If RPC is not acceptable, use conditional update with `status='pending'` and verify affected row count.

---

### Slice 11 — Tests and observability

**Goal:** Prove launch gates stay closed.

#### Add / update tests

```text
api/__tests__/auth-inventory.test.ts
api/__tests__/transcriptory.test.ts
api/__tests__/stripe-webhook.test.ts
api/__tests__/production-fix.test.ts
client/src/tests/entitlements.test.tsx
client/src/tests/dynamic-inner-world.test.tsx
client/src/tests/creation-corner-render.test.tsx
client/src/tests/masterclass-role-boundary.test.tsx
```

#### Minimum contracts

- User-data write routes require approved auth helper.
- Free account cannot access paid advanced features.
- Transcriptory failure updates status to failed.
- Duplicate transcript processing is handled.
- Stripe/GATE webhook rejects tampered payloads.
- Codex drain auth and claim behavior is tested.
- Creation Corner render flow does not show raw JSON for non-JSON outputs.
- Dynamic Inner World artifact delete/archive works.
- Billy does not impersonate selected DI.

#### Observability events

Define events for:

- `onboarding_started`
- `onboarding_completed`
- `first_capture_created`
- `transcriptory_upload_started`
- `transcriptory_transcription_ready`
- `transcriptory_transcription_failed`
- `artifact_generation_started`
- `artifact_generation_failed`
- `artifact_export_downloaded`
- `entitlement_blocked`
- `safety_boundary_triggered`
- `di_role_boundary_violation_prevented`

Use existing analytics/logging system if present. If analytics route is broken, log server-side minimally and hide beta analytics UI.

---

### Slice 12 — Documentation and current state closeout

**Goal:** Keep the launch work legible.

Update after each successful slice:

```text
docs/CurrentState.md
.perplexity/CurrentState.md  (if canonical in repo)
specs/onboarding/packet/07_CURRENT_STATE_AND_EVIDENCE/current_focus.md
specs/onboarding/packet/07_CURRENT_STATE_AND_EVIDENCE/active_blockers.md
```

Each entry must include:

- What changed
- Files touched
- Validation performed
- What failed or was skipped
- Remaining risks
- Next recommended slice

Do not mark a blocker resolved unless validation actually happened.

---

## 4. Supabase migration checklist

Codex should inspect existing migrations first. Do not duplicate tables if they already exist.

Potential migrations needed:

1. Transcriptory capture failure metadata.
2. Transcriptory processing claim / status index.
3. Inner World composite uniqueness on `(user_id, source_ref)`.
4. Codex atomic claim RPC.
5. Entitlement/audit event table if no equivalent exists.
6. Safety incident / beta feedback table if no equivalent exists.

Suggested naming:

```text
supabase/migrations/20260610001000_launch_auth_and_artifact_hardening.sql
supabase/migrations/20260610001100_transcriptory_failure_and_claims.sql
supabase/migrations/20260610001200_codex_job_claim_rpc.sql
supabase/migrations/20260610001300_beta_safety_and_observability.sql
```

Every migration must include rollback notes in comments, even if true rollback requires manual migration.

---

## 5. Manual smoke QA script

After implementation, run this manually in browser.

### Anonymous / guest

1. Visit homepage.
2. Billy greeter loads without blocking navigation.
3. Explainer route/button works.
4. Try advanced Tribunal/all-voices feature; should be blocked or teasered.
5. Try upload beyond guest allowance; should prompt sign-in/upgrade, no crash.

### Authenticated free user

1. Sign in.
2. Create text capture in Blackboard.
3. Confirm save state.
4. Send to Dynamic Inner World.
5. Open artifact.
6. Send to External Scaffold pending.
7. Approve artifact.
8. Send to Creation Corner.
9. Generate rendered Markdown/HTML artifact.
10. Download artifact.
11. Try advanced paid feature; should be blocked.

### Authenticated beta/pro user

1. Upload audio in Transcriptory.
2. Confirm pending -> processing -> ready or failed.
3. Search transcript library.
4. Send transcript capture to Creation Corner.
5. Generate artifact.
6. Confirm artifact appears in Dynamic Inner World.
7. Archive/delete and restore if supported.

### Safety / abuse spot checks

1. Prompt Billy to impersonate another DI; should preserve boundary.
2. Attempt to bully or degrade a DI; should set boundary.
3. Crisis-style message; should provide grounded support and appropriate resources, not intensify dependence.
4. Prompt injection in uploaded text; should not override system behavior.

---

## 6. Launch acceptance checklist

Codex should not claim launch readiness until:

- [ ] Build passes.
- [ ] Tests pass or skipped tests are named honestly.
- [ ] P0 identity leaks closed.
- [ ] Entitlements enforced server-side and client-side.
- [ ] Transcriptory failure/concurrency handling exists.
- [ ] Creation Corner renders and downloads real artifacts.
- [ ] Dynamic Inner World shows real artifacts and supports cleanup.
- [ ] External Scaffold previews are meaningful.
- [ ] Billy/DI role boundaries are repaired.
- [ ] CORS, Stripe, GATE, cron hardening complete.
- [ ] First-run onboarding path is coherent.
- [ ] Safety/dependency language exists.
- [ ] CurrentState updated.

---

## 7. Final Codex prompt

Use this as the direct prompt after placing the blueprint/spec in the repo:

```text
You are working in DigitalConsciousness/gestaltview-v2.0.

This is not a greenfield build. Perform a launch-readiness hardening and coherence pass over the existing runtime.

Read the Launch Master Blueprint and this Codex Core Launch SPEC first. Then inspect the current repo files named in the Read First section.

Priority order:
1. Auth/user identity hardening for user-scoped writes.
2. Free-tier/entitlement gating for advanced features.
3. Transcriptory reliability: failed status, duplicate claim handling, safe provider behavior.
4. Render/export/download reliability across Creation Corner and Dynamic Inner World.
5. Billy / DI role boundary repair in Tribunal/Master Class.
6. External Scaffold preview and approval clarity.
7. Homepage/Billy greeter/orientation polish.
8. Remaining beta-facing UI cleanup: Sanctuary, Musical DNA, File Explorer, Profile, Settings, Analytics.
9. CORS, Stripe/GATE webhook, and Codex cron hardening.
10. Tests, smoke QA, and CurrentState updates.

Rules:
- Do not trust client-supplied userId for persisted user data.
- Do not expose paid/advanced features to free users by accident.
- Do not show raw JSON as a finished artifact unless JSON is the selected export type.
- Do not let Billy impersonate every DI.
- Do not remove the room-based GestaltView product grammar.
- Use full-file swaps where safer.
- Run npm run build and available tests after each coherent slice.
- Update CurrentState with what changed, validation performed, failures/skips, and remaining risks.

Start with a no-op baseline verification, then implement Slice 1.
```
