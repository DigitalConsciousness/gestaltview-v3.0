# Not Good July 8 — Runtime Hotfix Sweep

## Read this first

This is not a polish pass. This is a broken-contract pass.

The runtime is currently violating the product promise in multiple places:

- artifacts are rendered as strings or fail to render;
- render endpoints are 500ing in production;
- Inner World data exists but the gallery/API fails;
- Creation Corner creates drafts/jobs but artifacts do not reliably become gallery-visible;
- Transcriptory captures can get stuck forever in `processing`;
- profile ingestion reports `complete` while storing no evidence fragments;
- Billy is falling into canned therapeutic language;
- Tribunal is interpreting song lyrics as generic personal crisis material;
- Musical DNA upload can fail without a clear “this did not actually land” state.

The fix is not “make it prettier.”
The fix is to restore the spine:

```text
capture → recognize signal → preserve original → render appropriately → route artifact → gallery-visible → user can inspect/export
```

## Non-negotiable behavior gates

### Gate 1 — No silent string fallback for artifact surfaces

If an artifact has markdown, HTML, scene graph JSON, or render-package JSON, the UI must route it through a renderer/viewer, not dump it into a string card.

Allowed fallback:

```text
Renderer unavailable. Source preserved. Open raw / retry render / export source.
```

Forbidden fallback:

```text
Show huge unrendered JSON/Markdown blob as the final artifact.
```

### Gate 2 — No `complete` ingestion without evidence

Profile ingestion may not report meaningful completion unless:

- source rows persist, or the response states `persistence: partial`;
- at least one evidence fragment is attached per high-salience dimension;
- extracted chunks > 0 for long profile uploads;
- source type is accepted by the DB check constraint.

### Gate 3 — Tribunal cultural preflight

Before Tribunal or multi-DI deliberation interprets a short evocative text as user emotion, run a cultural/music recognition pass.

For the Alice in Chains case, the system should say something like:

```text
That appears to be from Alice in Chains — “Would?”.
Want a music/meaning read, a lyric-memory capture, or a Tribunal discussion?
```

Do not deliberate for eight minutes and return generic “growth and setback” content.

### Gate 4 — Billy tone policy

Billy must not use canned therapeutic filler as a default apology/comfort phrase.

Hard-ban phrases:

- “I know this is hard”
- “That sounds hard”
- “I’m sorry you’re going through this” unless the user is actually describing distress
- “This is a courageous step” unless grounded in the user’s words
- “journey of self-discovery” as generic filler
- “no judgment” when no judgment was implied

Billy should name the actual state:

```text
This didn’t land. The system treated a lyric like a therapy prompt. That’s the bug.
```

### Gate 5 — Local-first upload honesty

Manual song uploads must be accepted locally first or clearly rejected. Remote persistence can be a sync layer, not a blocker that makes the user wonder whether the upload happened.

States:

```ts
"selected" | "local_ready" | "syncing" | "synced" | "failed_remote" | "rejected"
```

## Hotfix order

1. `api/render/decide.ts`
2. `api/render/engine.ts`
3. `vercel.json` includeFiles for render routes
4. Supabase schema patch for `inner_world_artifacts.origin_di_id`, `profile_ingestion_sources.source_type`, stale Transcriptory resets
5. `api/transcriptory/transcribe.ts` claim logic
6. `api/transcriptory/captures.ts` default upload capture status
7. `api/_lib/profileIngestion.ts` evidence extraction and source type normalization
8. Artifact Gallery / Inner World viewer hydration
9. Billy tone guard
10. Tribunal cultural recognition preflight
11. Musical DNA local-first upload status
12. Pending animation upgrade

## Validation commands

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run build
pnpm test -- --runInBand || true
git diff --check
```

## Manual QA script

1. Paste a short known song lyric fragment into Tribunal.
2. Confirm it recognizes the music signal before interpretation.
3. Create Transcriptory audio capture.
4. Confirm it becomes `pending`, then `processing`, then `ready` or `failed` with visible error.
5. Upload a local song in Musical DNA.
6. Confirm local track appears immediately with sync status.
7. Create a Creation Corner artifact.
8. Confirm HTML renders, job status progresses, and the artifact appears in Artifact Gallery.
9. Open Dynamic Inner World.
10. Confirm top display renders cards/components, not raw JSON/string blobs.
