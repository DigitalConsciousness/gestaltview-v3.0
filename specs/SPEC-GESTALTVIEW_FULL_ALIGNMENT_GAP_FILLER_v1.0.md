# SPEC — GestaltView Full Alignment Gap Filler v1.1

## Post-Overnight Refresh / Cutover Completion Pass

**Target repo:** `DigitalConsciousness/gestaltview-v2.0`
**Previous spec:** `SPEC-GESTALTVIEW_FULL_ALIGNMENT_GAP_FILLER_v1.0`
**Updated from:** `CurrentState.md`, last updated 2026-06-01
**Execution mode:** room-routing cutover, provenance hardening, QA, Supabase persistence activation

---

## 0. What changed overnight

Codex has already completed several major pieces that v1.0 treated as future work:

### Completed / now considered landed

```text
canonical profile-pipeline client seam
lightweight event bus
Model Homes contracts and routing
seven Supabase migration files
trainer package gate hardening
Blackboard canonical capture adapter
Blackboard → Inner World canonical artifact routing
Blackboard → External Scaffold canonical pending-node routing
External Scaffold approve/deny canonical review adapter
focused routing tests
Dynamic Inner World phase-1 deterministic world renderer
Creation Corner route-backed synthesize endpoint
Creation Corner → Dynamic Inner World artifact append
Creation Corner DI assignment corrected to Art Teacher
Dynamic Inner World DI assignment corrected to Curator
Musical DNA Spotify playlist import
Vision Blueprint / Creation Layer skills routing
```

profile-pipeline service is now wired into Blackboard capture and External Scaffold review flows, while preserving local room surfaces; it also records that Supabase RPC persistence is still waiting behind the same adapter after migrations are applied and verified. 

So v1.1 should not ask Codex to rebuild those pieces. It should ask Codex to **finish the remaining cutover boundaries**.

---

# 1. Updated operating frame

Do not restart the architecture.

Do not create a second routing system.

Do not replace the new `profilePipeline` seam.

Do not flatten the new Dynamic Inner World renderer back into a grid.

The current runtime now has the intended shape:

```text
Blackboard Room
  → recordCapture()
  → canonical capture metadata
  → Inner World artifact projection
  → External Scaffold pending node
  → approve / deny through scaffoldRouting
```

The next work is:

```text
Dynamic Inner World
  → createArtifact()
  → provenance envelope
  → Creation Corner routing

Creation Corner
  → createArtifact()
  → provenance envelope
  → Inner World / Scaffold / export

Supabase
  → apply migrations
  → RPC-backed adapter
  → backfill verification
  → cut reads over carefully
```

---

# 2. Updated status table

| Area                             | v1.0 status |            v1.1 status | Remaining work                                             |
| -------------------------------- | ----------: | ---------------------: | ---------------------------------------------------------- |
| Profile-pipeline client seam     |      Needed |                 Landed | Add Supabase RPC backing                                   |
| Event bus                        |      Needed |                 Landed | Use consistently in remaining room promotions              |
| Model Homes                      |      Needed |                 Landed | Wire into actual generation/routing decisions beyond tests |
| Migrations                       |      Needed |            Files added | Apply/inspect in Supabase-backed environment               |
| Blackboard capture               |      Needed |               Cut over | QA upload/audio/image metadata                             |
| External Scaffold approve/deny   |      Needed |               Cut over | Browser QA + release/dormancy path                         |
| Dynamic Inner World renderer     |      Needed |         Phase 1 landed | Provenance + phase-2 museum semantics                      |
| Creation Corner synthesize route |      Needed |               Restored | Provenance + export contract hardening                     |
| Musical DNA Spotify import       |      Needed |                 Landed | Live Spotify QA                                            |
| DI route assignments             |     Partial | Creation/DIW corrected | Broader prompt consumption checks                          |
| Trainer gates                    |      Needed |               Hardened | Package-gate integration QA                                |
| Supabase persistence             |     Planned |         Not active yet | RPC adapter + migration verification                       |
| Browser QA                       |        Open |             Still open | Required next                                              |

---

# 3. Revised priority order

## Priority 1 — Finish room promotion boundaries

Codex should wire **Dynamic Inner World** and **Creation Corner** through the canonical artifact/provenance layer.

Required files to inspect:

```text
client/src/pages/DynamicInnerWorldPage.tsx
client/src/pages/CreationCornerPage.tsx
client/src/lib/profilePipeline/client.ts
client/src/lib/profilePipeline/artifactRouting.ts
client/src/lib/profilePipeline/provenance.ts
client/src/lib/profilePipeline/events.ts
client/src/lib/innerWorldFiles.ts
client/src/features/dynamic-inner-world/world-renderer/*
api/creation-corner/synthesize.ts
shared/gen-engine/*
```

Required behavior:

```text
Dynamic Inner World artifact open/send/export actions create canonical artifact records.
Creation Corner synthesis results create canonical artifact records.
Creation Corner → Dynamic Inner World includes provenance envelope.
Creation Corner → External Scaffold creates pending scaffold node, not only local orb state.
Downloaded/exported artifacts include source/provenance metadata.
No artifact promotion loses original capture IDs.
```

Acceptance checks:

```text
Opening artifact detail does not mutate canonical state.
Sending artifact to Creation Corner preserves source capture/artifact IDs.
Sending Creation Corner output to Inner World creates canonical artifact + local visible artifact.
Sending Creation Corner output to External Scaffold creates pending scaffold node.
Every promotion boundary emits a GestaltEvent.
```

---

## Priority 2 — Attachment metadata QA and canonical attachment fields

Blackboard capture is now routed through `blackboardRouting.ts`, but the latest state notes that file/audio/image upload-specific capture metadata still needs QA. 

Codex should test these capture types:

```text
plain text
voice transcript
audio upload
image upload
video upload
generic file upload
session recap / session promotion
```

If metadata gaps surface, extend the canonical types minimally:

```ts
type CaptureAttachment = {
  attachmentId?: string;
  sourceRef?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  localPreviewUrl?: string;
  remoteUrl?: string;
  transcriptText?: string;
  thumbnailUrl?: string;
};
```

Then attach it under:

```ts
capture.metadata.attachments?: CaptureAttachment[];
artifact.metadata.attachments?: CaptureAttachment[];
provenance.sourceAttachmentRefs?: string[];
```

Do not store raw image/video/audio bytes in profile preferences or capture metadata.

---

## Priority 3 — Supabase migration application and RPC-backed persistence

The migration package exists. The next step is not to write another migration bundle. It is to apply and inspect the existing one.

Required migration files:

```text
20260601000100_profile_pipeline_v1_core.sql
20260601000200_profile_pipeline_v1_rls.sql
20260601000300_profile_pipeline_v1_backfill.sql
20260601000400_profile_pipeline_v1_rpc_helpers.sql
20260601000500_model_homes_v1.sql
20260601000600_resonance_event_bus_v1.sql
20260601000700_route_embodiment_alignment.sql
```

Codex task:

```text
Apply migrations in Supabase-backed environment.
Inspect resulting tables, RLS policies, RPC signatures, and backfill behavior.
Do not cut reads over until writes are verified.
Add RPC persistence behind the existing profilePipeline adapter.
Keep local/in-memory fallback active.
```

Required adapter behavior:

```text
try Supabase RPC
  → on success return canonical row
  → on failure log warning and fall back to local store
  → never block the visible room flow on Supabase failure
```

Required new files or updates:

```text
client/src/lib/profilePipeline/supabaseProfilePipelineStore.ts
client/src/lib/profilePipeline/localProfilePipelineStore.ts
client/src/lib/profilePipeline/store.ts
client/src/lib/profilePipeline/client.ts
api/profile-pipeline/*
```

Acceptance checks:

```text
recordCapture() writes through RPC when authenticated.
createArtifact() writes through RPC when authenticated.
createPendingScaffoldNode() writes through RPC when authenticated.
approve/deny scaffold node updates canonical review state.
Local fallback still passes existing tests when Supabase is unavailable.
No room becomes unusable when Supabase is cold or paused.
```

---

## Priority 4 — Browser QA for the cutover

The latest handoff explicitly calls for browser QA around Blackboard session promotion and External Scaffold approve/deny controls. 

Run rendered QA on:

```text
/blackboard-room
/dynamic-inner-world
/external-scaffold
/creation-corner
/musical-dna
```

Required QA script:

```text
1. Open Blackboard Room.
2. Capture text.
3. Save capture.
4. Send capture to Dynamic Inner World.
5. Confirm artifact appears in Dynamic Inner World renderer.
6. Send capture to External Scaffold.
7. Confirm pending node appears.
8. Approve node.
9. Confirm approved artifact appears and Billy/Tribunal are not visible scaffold nodes.
10. Create artifact in Creation Corner.
11. Send artifact to Dynamic Inner World.
12. Confirm source-linked artifact appears.
13. Send Creation Corner output to External Scaffold.
14. Confirm pending node includes provenance.
15. Import Spotify playlist in Musical DNA if credentials/environment allow.
```

Also verify:

```text
fixed nav does not obscure controls
rack controls remain clickable
mobile bottom sheets are not hidden
Samsung A35-class widths remain usable
DI presence layer does not cover room actions
```

---

## Priority 5 — Dynamic Inner World phase-2 semantics

Phase 1 is landed: deterministic world planner, trusted node registry, renderer, archive vault, search/filter/sorting, resonance rails, mobile corridor, Curator console, and tests.

Do not replace it.

Add phase 2 on top:

```text
tag wings
date/time wings
artifact-type neighborhoods
richer resonance rail hover/focus states
archive-vault interactions
evidence/provenance drawer
artifact source trail
Creation Corner source badge
External Scaffold approval badge
```

Keep the rule:

```text
No arbitrary generated React.
No unsafe runtime code evaluation.
No identity claim without evidence.
```

This preserves the Room Definitions distinction: External Scaffold is accumulated/structural, while Dynamic Inner World is distilled/reflective and evidence-linked. 

---

# 4. Updated “do not do” list

Codex must not:

```text
rebuild the profile pipeline from scratch
create a second event bus
replace the new Dynamic World renderer
move Curator back into Creation Corner
move Art Teacher into Dynamic Inner World
store raw media bytes in localStorage metadata
make Supabase required for first render
remove local fallback before RPC path is verified
auto-approve identity claims
show Billy as a scaffold node
reintroduce Tribunal/persona visuals into External Scaffold
treat Musical DNA imported tracks as Keith-specific defaults
label prompt-only image/audio outputs as generated media
```

The Constitutional Invariants still govern packaging and DI identity boundaries: reproducible frameworks may be packaged, but living/persistent DI identities may not be sold or transferred. 

---

# 5. Updated Codex implementation plan

## Slice A — Dynamic Inner World / Creation Corner canonical artifact promotion

```text
Goal:
Wire all remaining artifact promotion paths through createArtifact(), provenance envelopes, and GestaltEvent emission.

Files:
- client/src/pages/DynamicInnerWorldPage.tsx
- client/src/pages/CreationCornerPage.tsx
- client/src/lib/profilePipeline/client.ts
- client/src/lib/profilePipeline/artifactRouting.ts
- client/src/lib/profilePipeline/provenance.ts
- client/src/lib/profilePipeline/events.ts
- api/creation-corner/synthesize.ts

Validation:
- npm exec vitest run client/src/tests/gen-engine-room-wiring.test.ts client/src/tests/dynamic-world-plan.test.ts client/src/tests/creation-corner-freeform.test.ts client/src/tests/creation-corner-intake-controls.test.tsx
- npm exec -- tsc --noEmit
```

---

## Slice B — Attachment metadata QA

```text
Goal:
Verify text/voice/audio/image/video/file capture metadata survives canonical routing.

Files:
- client/src/pages/BlackboardRoomPage.tsx
- client/src/lib/profilePipeline/blackboardRouting.ts
- client/src/lib/profilePipeline/types.ts
- client/src/components/Scaffold.tsx

Add tests:
- client/src/tests/blackboard-attachment-routing.test.ts
- client/src/tests/profilePipeline.attachments.test.ts

Validation:
- npm exec vitest run client/src/tests/blackboard-profile-pipeline-routing.test.ts client/src/tests/blackboard-attachment-routing.test.ts client/src/tests/profilePipeline.attachments.test.ts
- npm exec -- tsc --noEmit
```

---

## Slice C — Supabase RPC store

```text
Goal:
Add RPC-backed persistence under the existing profilePipeline adapter without breaking local-first behavior.

Files:
- client/src/lib/profilePipeline/store.ts
- client/src/lib/profilePipeline/localProfilePipelineStore.ts
- client/src/lib/profilePipeline/supabaseProfilePipelineStore.ts
- client/src/lib/profilePipeline/client.ts
- api/profile-pipeline/*

Validation:
- Supabase migration apply/inspect
- npm exec vitest run client/src/tests/profilePipeline.capture.test.ts client/src/tests/profilePipeline.provenance.test.ts client/src/tests/external-scaffold-profile-pipeline-routing.test.ts
- npm exec -- tsc --noEmit
```

---

## Slice D — Browser QA / visual clearance

```text
Goal:
Confirm the cutover is visible, usable, and not blocked by nav or overlays.

Routes:
- /blackboard-room
- /dynamic-inner-world
- /external-scaffold
- /creation-corner
- /musical-dna

Validation:
- rendered desktop QA
- rendered mobile QA
- Samsung A35-class width QA
- document screenshots or CurrentState notes
```

---

## Slice E — Dynamic Inner World phase-2 semantics

```text
Goal:
Add museum semantics without breaking deterministic local renderer.

Files:
- client/src/features/dynamic-inner-world/world-renderer/*
- client/src/pages/DynamicInnerWorldPage.tsx
- client/src/components/ArtifactDeepView.tsx

Validation:
- npm exec vitest run client/src/tests/dynamic-world-plan.test.ts
- npm exec -- tsc --noEmit
- npm run build
```

---

# 6. Updated acceptance criteria

v1.1 is complete when:

```text
Dynamic Inner World send/export actions use canonical artifact/provenance routing.
Creation Corner outputs use canonical artifact/provenance routing.
Creation Corner → Inner World creates source-linked artifacts.
Creation Corner → External Scaffold creates pending canonical scaffold nodes.
Blackboard upload/audio/image/video/file capture metadata has been QA-tested.
Attachment metadata is represented without storing raw media bytes in metadata.
Supabase migrations have been applied or inspected in a backed environment.
profilePipeline adapter supports RPC-backed writes with local fallback.
External Scaffold approve/deny/release paths remain visually usable.
Billy and Tribunal/persona nodes remain quarantined from External Scaffold.
Dynamic Inner World phase-1 renderer remains intact.
Dynamic Inner World phase-2 semantics are added incrementally.
Musical DNA Spotify flow gets rendered/live QA where credentials allow.
CurrentState.md is updated with exact files, validation, and remaining risks.
```

---

# 7. Exact Codex prompt for the next pass

m```text
You are working in DigitalConsciousness/gestaltview-v2.0.

Continue SPEC-GESTALTVIEW_FULL_ALIGNMENT_GAP_FILLER, now refreshed to v1.1 after the overnight cutover work.

Do not rebuild the profile pipeline, event bus, Model Homes, Dynamic Inner World renderer, or Creation Corner synthesize route. Those are already landed.

Read first:
- docs/CurrentState.md
- specs/SPEC-GESTALTVIEW_FULL_ALIGNMENT_GAP_FILLER_v1.0.md
- ROOM_DEFINITIONS.md
- CODEX_OUTSIDE_IN_TRANSLATION_LAYER.md
- GestaltView_Constitutional_Invariants_v1.0.md

Current completed state:
- profilePipeline client seam exists
- event bus exists
- Model Homes exists
- seven profile/model/event/route migrations exist
- trainer package gates are hardened
- Blackboard capture now routes through blackboardRouting.ts
- Blackboard saves canonical capture metadata
- Blackboard → Inner World creates canonical artifact metadata while dual-writing local room stores
- Blackboard → External Scaffold creates pending canonical scaffold nodes
- External Scaffold approve/deny uses canonical scaffoldRouting adapter
- Dynamic Inner World phase-1 deterministic world renderer is implemented
- Creation Corner route-backed synthesize endpoint exists
- Creation Corner → Dynamic Inner World appends source-linked artifacts
- Creation Corner maps to Art Teacher
- Dynamic Inner World maps to Curator
- Musical DNA Spotify playlist import exists

Next tasks, in order:

1. Wire Dynamic Inner World and Creation Corner send/export actions through createArtifact(), provenance envelopes, and GestaltEvent emission.
2. Ensure Creation Corner → External Scaffold creates pending canonical scaffold nodes with provenance.
3. QA Blackboard text/voice/audio/image/video/file capture metadata and add attachment fields only if gaps appear.
4. Apply/inspect the migration package in a Supabase-backed environment.
5. Add RPC-backed persistence under the existing profilePipeline adapter while preserving local fallback.
6. Run browser QA for Blackboard session promotion, External Scaffold approve/deny, Dynamic Inner World artifact appearance, Creation Corner routing, and Musical DNA Spotify import.
7. Add Dynamic Inner World phase-2 museum semantics without replacing the deterministic renderer.

Do not:
- create a second routing system
- make Supabase required for first render
- silently delete captures
- auto-approve identity claims
- show Billy as a scaffold node
- reintroduce Tribunal/persona visuals into External Scaffold
- replace the Dynamic Inner World world renderer with a grid
- label prompt-only media outputs as generated media

Validate with:
- npm exec vitest run client/src/tests/blackboard-profile-pipeline-routing.test.ts client/src/tests/external-scaffold-profile-pipeline-routing.test.ts client/src/tests/dynamic-world-plan.test.ts client/src/tests/gen-engine-room-wiring.test.ts client/src/tests/profilePipeline.capture.test.ts client/src/tests/profilePipeline.provenance.test.ts
- npm exec -- tsc --noEmit
- npm run build
- git diff --check

Update docs/CurrentState.md with:
- files changed
- migration/RPC status
- browser QA status
- validation commands
- what remains open
