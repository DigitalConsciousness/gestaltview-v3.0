# GestaltView Core OS — Workflow and Knowledge Synthesis Map

Date: 2026-05-07
Status: integration addendum for `gestaltview-v2.0`

This package locks the current room-based runtime into one coherent product flow while keeping the localStorage/custom-event prototype seam intact for later Supabase/API persistence.

## Operating model

GestaltView is a cognitive OS made of rooms, not a generic assistant wrapper.

```text
Sanctuary
  -> Blackboard Room
  -> Dynamic Inner World
  -> External Scaffold
  -> Creation Corner
```

Billy is the edge guide and arc-reader. Billy may verify capture/display integrity, suggest metadata, and explain the routing path. Billy must not become a scaffold node, artifact, tag, or hidden organizing layer.

## 5W1H runtime frame

| Dimension | Core OS meaning | Runtime surface |
|---|---|---|
| Who | The user, Billy as guide, and any source/capture actor | `CaptureSource`, Billy assist report |
| What | The raw capture, artifact, blueprint, or approved scaffold memory | `CaptureOrb`, `ScaffoldArtifact`, `CaptureBlueprint` |
| Where | The room/surface where the material currently lives | route path, `InnerWorldSurface`, `CaptureDisplay` |
| When | Capture, update, approval, discovery, and export timestamps | `createdAt`, `updatedAt`, `approvedAt`, `discoveredAt` |
| Why | Meaning, context, anchor, memory, approval state | `CaptureMetadata` |
| How | Routing action, service seam, event emission, deterministic layout | `CaptureAction`, storage helpers, browser events |

## Capture lifecycle

```text
CaptureEvent
  -> CaptureOrb
  -> Saved Captures OR Inner World raw room OR External Scaffold pending queue
  -> user/Billy inspection
  -> approve / reject / delete / export / blueprint
  -> approved scaffold artifact
  -> evidence-based connection discovery
```

The rule is capture first, organization second. Rejection removes pending scaffold pressure; it must not delete the original raw source unless the user explicitly chooses deletion.

## Storage/event seam

Current prototype seam:

| Surface | Key/event |
|---|---|
| External Scaffold queue | `gestaltview.externalScaffold.queue.v1`, `gestaltview:scaffold-queue-updated` |
| Approved scaffold artifacts | `gestaltview.externalScaffold.approved.v1`, `gestaltview:scaffold-queue-updated` |
| Dynamic Inner World captures | `gestaltview.dynamicInnerWorld.captures.v1`, `gestaltview:inner-world-updated` |
| Blackboard saved captures | `gestaltview.blackboard.saved.v1`, `gestaltview:blackboard-saved-updated` |
| Creation Corner blueprints | `gestaltview.creationCorner.blueprints.v1`, `gestaltview:creation-blueprints-updated` |

Future persistence should replace these helpers behind `client/src/lib/captureRouting.ts`, not force every page to rewrite its capture logic.

## Included full-file swap-outs

- `client/src/components/Scaffold.tsx`
- `client/src/lib/captureRouting.ts`
- `client/src/lib/innerWorldLayout.ts`
- `client/src/components/inner-world/InnerWorldRoom.tsx`
- `client/src/components/inner-world/InnerWorldArtifact.tsx`
- `client/src/components/inner-world/InnerWorldInspector.tsx`
- `client/src/pages/SanctuaryPage.tsx`
- `client/src/pages/BlackboardRoomPage.tsx`
- `client/src/pages/DynamicInnerWorldPage.tsx`
- `client/src/pages/ExternalScaffoldPage.tsx`
- `client/src/pages/CreationCornerPage.tsx`
- `client/src/components/BillyOnboardingPrompt.tsx`
- `client/src/components/BillyWalkthrough.tsx`
- `client/src/lib/billy-runtime-guide.ts`
- `docs/CodexOutsideInTranslationLayer.md`

## Validation notes

Run from the repo root after overlaying the package:

```bash
npm run build
git diff --check
npm run health # if configured in the active environment
```

Manual QA:

1. Open `/sanctuary`.
2. Go to `/blackboard-room`.
3. Create a text capture and save it.
4. Create another capture and send it to Dynamic Inner World.
5. Confirm `/dynamic-inner-world` renders the six-surface room and the capture persists.
6. Send a selected Inner World capture to External Scaffold.
7. Approve it in `/external-scaffold`.
8. Confirm it becomes a visible scaffold artifact with evidence-only connections.
9. Send the approved artifact to Creation Corner.
10. Export Markdown, HTML, code, image prompt, agent prompt, marketing copy, share card, and PDF-ready HTML.
11. Confirm Billy appears as guide/checklist/orientation, never as a scaffold node.
