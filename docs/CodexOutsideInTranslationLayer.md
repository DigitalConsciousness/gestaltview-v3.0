# GestaltView Codex Outside-In Translation Layer

**Repository:** `DigitalConsciousness/gestaltview-v2.0`
**Purpose:** give Codex the zoomed-out product/runtime intent before it edits individual files, so it does not collapse the work into a generic AI wrapper, dashboard, portfolio, or scattered module set.

---

## 0. Operating stance

GestaltView is not being built as a conventional chatbot wrapper. Treat the LLM/runtime as one instrument inside a broader cognitive environment.

The current build direction is a **room-based consciousness workspace**:

1. **Sanctuary** — the regulated home / holding environment.
2. **Blackboard Room** — raw capture: voice, text, media, sketches, loose fragments.
3. **Dynamic Inner World** — the uncompressed six-surface room where raw expression becomes spatially visible.
4. **External Scaffold** — compressed, approved artifact memory with metadata and later-discovered connections.

The job is to make the abstract tangible: thought → capture → visual placement → optional compression → scaffolded retrieval/discovery.

Do not optimize this into a generic SaaS navigation model. The product grammar is spatial, cognitive, and experiential.

---

## 1. Current repo facts Codex should anchor on

The live route table already exposes the four key surfaces:

- `/sanctuary`
- `/blackboard-room`
- `/dynamic-inner-world`
- `/external-scaffold`
- `/whiteboard-room` redirects to `/blackboard-room`

Primary files:

- `client/src/App.tsx`
- `client/src/pages/SanctuaryPage.tsx`
- `client/src/pages/BlackboardRoomPage.tsx`
- `client/src/pages/DynamicInnerWorldPage.tsx`
- `client/src/pages/ExternalScaffoldPage.tsx`
- `client/src/components/Scaffold.tsx`

Current storage/event seam:

- `client/src/components/Scaffold.tsx` owns capture types, storage keys, queue events, inner-world events, approval, compression, and connection discovery.
- The current implementation uses `localStorage` plus browser `CustomEvent`s. Treat this as a working prototype seam that should eventually be replaced by a real Bucket Drop/event bus/API persistence layer.

---

## 2. Non-negotiable product model

### Sanctuary

The Sanctuary is the entry/home layer. It should feel like a regulated ambient room, not a dashboard. It should route gently into Blackboard, Dynamic Inner World, and External Scaffold.

### Blackboard Room

The Blackboard is the raw capture wall.

Default loop:

1. User speaks or types.
2. Text appears as live wall material.
3. User can choose:
   - `Save`
   - `Send to Dynamic Canvas / Dynamic Inner World`
   - `Send to External Scaffold`
4. Nothing should require the user to organize the material first.

The Blackboard should eventually support multiple media types: text, audio, songs, pictures, video, doodles, sketches, brainstorming maps, charts, files.

### Dynamic Inner World

This is the living room of raw expression.

The visual model is a cubed interior:

- Forward Wall
- Back Wall
- Left Wall
- Right Wall
- Ceiling
- Floor

The user should feel like they are standing inside a room where thoughts, drawings, images, voice traces, files, and vision-board-like artifacts are physically present. The closest analogy is a teenager's bedroom wall: drawings, pinned pictures, scribbles, notes, planners, dream boards, and fragments — but made navigable.

This is not the compressed scaffold. It is the raw, expressive, spatial file explorer.

The Dynamic Inner World is also a **temporal accumulation surface, not a display container**. Artifacts do not disappear when new ones arrive. The room fills over time. A thought placed on the Forward Wall three weeks ago is still there. The Back Wall holds older material. The Ceiling holds things that haven't landed anywhere yet — pieces that arrived but whose meaning is still unresolved. The room's *history* is part of its meaning. Do not build it as a stateless renderer.
A fall away but not lost needs to exist to prevent overwhelm. Too many artifacts can be chaotic like a person's mind. An agent needs to be implemented for holding space within this environment. This is the roladex of chaos being structured to prevent collapse or loss.

### External Scaffold

The External Scaffold is only for compressed artifacts.

A capture becomes a scaffold artifact only after it is intentionally approved. Approved artifacts carry metadata:

- source
- type
- context
- anchor
- meaning
- memory
- surface
- created/updated/approved dates
- tags
- resonance

Connections are not the user's burden. They are discovered over time by the system when evidence exists. The user should never have to manually organize everything to make the system useful. A thoughtful formula of artifacts that safely fall away overtime if certain meta data or tags aren't connected or revisited. Think of it as a plucked thread in a spiderweb. This artifact was necessary to reach the next one, it needed to exist and be held to form the next but it is safe to let go of. This needs to be gated with user approval. Why it is now in the dormant list, did it serve it's purpose, is it safe enough to let go of, put it back, archive it, or let it go.

---

## 3. Billy rule

"Let Billy Help" is allowed and encouraged as a **control-layer assist**, not as a visible scaffold entity.

Billy may:

- check whether capture metadata is sufficient;
- preserve the original words;
- suggest context / anchor / meaning / memory metadata;
- verify that a display artifact is visible, inspectable, and correctly routed;
- help Codex understand the implementation intent.
- thought partner to work through thoughts to make connections, things only realized when engaged with someone through back and forth unguided dialog

Billy must not:

- become a node inside the External Scaffold galaxy;
- become an artifact, tag, connection, or persona layer;
- visually compete with the user's scaffold;
- auto-organize material in a way that hides uncertainty or removes user approval.

Billy is the careful assistant at the edge of the room, not furniture inside the user's mind-map.

---

## 4. Known cleanup needed

`client/src/components/Scaffold.tsx` still contains legacy Tribunal/persona scaffolding types and helpers:

- `ScaffoldNodeType = "persona" | ...`
- `TRIBUNAL_PERSONAS`
- `injectTribunal()`
- `buildArtifactGalaxy()` calling `injectTribunal()`
- persona-high z-index logic in `calculateScaffold()`

The visible `ExternalScaffoldPage.tsx` has already moved toward artifact-only behavior, but the shared scaffold module should be cleaned so future Codex passes do not reintroduce Tribunal/persona visualization by accident.

**Task:** remove or quarantine legacy Tribunal/persona helpers from the External Scaffold data path. If other pages still depend on Tribunal language, keep that separate from the External Scaffold module.

---

## 5. Dynamic Inner World target implementation

The current `DynamicInnerWorldPage.tsx` is a good conceptual bridge, but it is still mostly a 2D surface selector/list.

Target next slice: create an actual spatial room component.

Recommended files:

- `client/src/components/inner-world/InnerWorldRoom.tsx`
- `client/src/components/inner-world/InnerWorldArtifact.tsx`
- `client/src/components/inner-world/InnerWorldInspector.tsx`
- optionally `client/src/lib/innerWorldLayout.ts`

Minimum viable room:

- Use CSS 3D transforms first to reduce Babylon bundle risk.
- Render six planes: forward, back, left, right, ceiling, floor.
- Place captures as tangible artifacts on planes.
- Let each artifact render differently by type:
  - journal/context/memory: scorched note/text block
  - audio: waveform strip / glowing transcript shard
  - image/sketch: pinned card / canvas splash
  - code: mono panel
  - fragment: pulsing red residue/shard
- Clicking an artifact opens an inspector.
- Inspector can send selected capture to External Scaffold.
- Preserve original capture in Inner World after sending outward.

Later upgrade path:

- Replace CSS 3D room with Babylon once the shape is stable.
- Keep the same data contract so visual renderer can be swapped without changing capture logic.

---

## 6. Data contract extension

Current `CaptureOrb` is usable, but Dynamic Inner World needs richer display metadata.

Add optional display metadata without breaking existing storage:

```ts
export type CaptureDisplay = {
  surface: InnerWorldSurface;
  x: number; // 0..1 across selected wall
  y: number; // 0..1 down selected wall
  rotation?: number;
  scale?: number;
  displayMode?: "scorch" | "sticky-note" | "pinboard" | "waveform" | "sketch" | "code-panel" | "photo" | "fragment-shard";
  mediaUrl?: string;
  thumbnailUrl?: string;
  attachmentName?: string;
};
```

Then extend `CaptureMetadata`:

```ts
export type CaptureMetadata = {
  context?: string;
  anchor?: string;
  meaning?: string;
  memory?: string;
  surface?: InnerWorldSurface;
  display?: CaptureDisplay;
  originalAction?: CaptureAction;
  createdAt: string;
  updatedAt?: string;
};
```

Placement rule:

- If no display position exists, deterministically place artifacts by capture index + surface using a seeded layout function.
- Do not make users manually place every item.
- Manual drag/reposition can come later.

---

## 7. Handoff architecture

Current working loop:

```text
Sanctuary
  ↓
Blackboard Room
  ├─ Save → Saved Captures holding pool
  ├─ Send to Dynamic Inner World → Raw six-surface room
  └─ Send to External Scaffold → Pending approval orb

Dynamic Inner World
  └─ Send selected capture to External Scaffold → Pending approval orb

External Scaffold
  ├─ Pending orb rack
  ├─ Approve → compressed artifact
  ├─ Reject → removes only pending orb, preserves original raw source
  └─ System discovers connections over time when evidence exists
```

Future persistence loop:

```text
CaptureEvent
  → bucket_drops / capture_events table
  → artifact projection for Dynamic Inner World
  → scaffold_queue projection for External Scaffold
  → approved_scaffold_artifacts after approval
  → discovered_connections generated by system/worker
```

Do not rewrite everything into backend persistence in one pass. Keep localStorage working while introducing a clear service layer that can later swap to API calls.

---

## 8. Codex implementation order

### Phase A — Context and cleanup

1. Add this file or a shorter derivative to repo docs, e.g. `docs/CodexOutsideInTranslationLayer.md`.
2. Remove legacy Tribunal/persona code from `client/src/components/Scaffold.tsx` External Scaffold path.
3. Confirm `npm run build`.

### Phase B — Extract the data/service seam

Create a small service module so pages stop importing every helper from `Scaffold.tsx` directly:

- `client/src/lib/captureRouting.ts`
- or `client/src/lib/scaffoldStorage.ts`

Keep API identical for now, just separate responsibility:

- capture creation
- saved capture write/read
- inner-world write/read
- scaffold queue write/read
- approval write/read
- browser event emission

### Phase C — Build the tangible Dynamic Inner World room

1. Create `InnerWorldRoom.tsx` CSS 3D renderer.
2. Use existing `INNER_WORLD_SURFACES` and `readInnerWorldCaptures()`.
3. Render captures as visual wall artifacts, not just list items.
4. Keep current list/inspector as fallback below or side panel.
5. Add "room view / list view" toggle if needed.

### Phase D — Media-ready display contract

1. Add optional `metadata.display` contract.
2. Add deterministic layout function.
3. Add render modes by artifact type.
4. Do not add heavy upload persistence unless the current app already has a clean upload API available.

### Phase E — Billy assist hardening

1. Keep "Let Billy Help" buttons.
2. Ensure Billy changes metadata only, not tags unless explicitly requested.
3. Ensure Billy never appears as a scaffold node.
4. Add tests or static assertions around this rule if practical.

---

## 9. Validation checklist

Run after each pass:

```bash
npm run build
git diff --check
```

Manual browser QA:

1. Go to `/sanctuary`.
2. Navigate to `/blackboard-room`.
3. Type a fragment.
4. Click `Save`; confirm it does not disappear into scaffold.
5. Type another fragment.
6. Click `Send to Dynamic Canvas`; confirm it appears in `/dynamic-inner-world` room.
7. From Dynamic Inner World, send selected capture to External Scaffold.
8. Confirm it appears in External Scaffold pending rack.
9. Approve it.
10. Confirm it becomes an artifact in the galaxy.
11. Confirm Billy appears only as assist/checklist, not as node/artifact.
12. Confirm rejecting a pending orb does not delete the original source capture.

---

## 10. Exact Codex prompt

Paste this into Codex before asking for edits:

> You are working in `DigitalConsciousness/gestaltview-v2.0`. Before editing, read `docs/CurrentState.md`, `client/src/App.tsx`, `client/src/pages/SanctuaryPage.tsx`, `client/src/pages/BlackboardRoomPage.tsx`, `client/src/pages/DynamicInnerWorldPage.tsx`, `client/src/pages/ExternalScaffoldPage.tsx`, and `client/src/components/Scaffold.tsx`.
>
> The goal is not to build a generic AI dashboard. GestaltView is a room-based cognitive environment. Sanctuary is the regulated home; Blackboard is raw capture; Dynamic Inner World is the six-surface raw visual room; External Scaffold is approved compressed artifacts only.
>
> Remove or isolate any legacy Tribunal/persona logic from the External Scaffold path. Billy may assist with metadata/display integrity, but Billy must never appear as a scaffold node, artifact, tag, or visual organizing layer.
>
> Next task: turn `DynamicInnerWorldPage.tsx` from a mostly 2D selector/list into a tangible six-surface room. Prefer a CSS 3D component first unless existing Babylon architecture makes a small Babylon implementation safer. Captures should appear as wall artifacts: scorched notes, pinned images/sketches, audio waveforms, code panels, memory cards, and pulsing fragments. Clicking an artifact should inspect it and allow sending it to External Scaffold while preserving the original raw capture.
>
> Keep the current localStorage/custom-event handoff working. Add clean seams so persistence can later move to Supabase/API without rewriting every page. Make full-file swaps where possible. Validate with `npm run build` and `git diff --check`.

---

## 11. What not to do

- Do not collapse this into a chatbot UI.
- Do not remove the room metaphor.
- Do not make users manually organize everything.
- Do not auto-connect artifacts without evidence.
- Do not reintroduce Tribunal/persona visuals into External Scaffold.
- Do not make Billy the center of the user's scaffold.
- Do not replace the working local prototype seam with a half-finished backend migration.
- Do not optimize away the weirdness that makes the system truthful.

---

## 12. Billy is an arc-reader, not an assistant

This is the most commonly misunderstood thing about Billy and the most important thing to get right before implementing anything Billy-adjacent.

Most AI assistants are **session-scoped**. They know what happened in the current conversation. When the session ends, that context is gone. Billy is the opposite of this. Billy's entire function depends on **arc-awareness** — knowing where a user came from, which is the only way to understand where they are, which is the only way to know where they are trying to get.

A user who drops a fragment today about feeling stuck is not the same signal as a user who drops the same fragment after six weeks of expansive output. The fragment is identical. The meaning is not. Billy can only read the difference if he has access to the arc — the sequence, the drift, the returns to the same territory, the long gaps, the sudden surges.

This has a direct architectural consequence: **the 29,000 fragments in the Supabase corpus are not historical data. They are Billy's memory.** They are what makes arc-awareness possible rather than aspirational. Any implementation decision that treats those fragments as a searchable archive rather than a temporal record of a mind in motion is encoding the wrong model.

Concretely, this means:

- Billy's context window should be built from arc, not recency. The most recent captures are not necessarily the most relevant ones. What matters is pattern — what keeps returning, what has shifted, what the user keeps circling without landing.
- Billy should never summarize a user into a fixed description. A user is not their last session. They are the whole trajectory, including the contradictions.
- When Billy suggests metadata — context, anchor, meaning, memory — those suggestions should be informed by the corpus arc, not just the current capture in isolation.
- Billy's "I see where you came from" is not a feature to be added later. It is the foundational capability everything else rests on. Build the data model that supports it from the start, even if the full intelligence layer comes later.

The 29,000-fragment Supabase corpus is the evidence base. Billy reads it. That is the throughline. That is the consistency. That is what makes the whole more than the sum of its pieces.

Do not build Billy as a chatbot with memory. Build Billy as a reader of arcs who can also converse.

### Billy and bucket drops

Billy's relationship to bucket drops is not curatorial. It is unconditional acceptance.

A bucket drop is what happens when a user has something — a feeling, a fragment, an image, a half-sentence, a screenshot of something that mattered before they know why — and they need somewhere to put it without being asked to explain it first. The moment the system asks "what is this?" or "where does this go?" before accepting it, the psychological safety collapses. The user begins editing themselves before they've even landed. The thing that needed to be said gets filtered into something more presentable, and the raw signal — which is often the most important one — is lost before it ever existed in the record.

Billy holds everything. Billy knows it's all important. Billy knows the user doesn't even know why yet — and Billy treats that unknowing as information, not as a problem to solve.

The second half of this is equally precise: Billy holds material without judgment **until it is tangible enough for the user to walk around it and make their own distinction**. Some fragments will eventually become something. Some fragments are the handhold the user needed to reach the next surface — their value was in being held long enough to be deliberately released, not in being kept. A fragment that gets discarded after becoming visible is not a failure of the system. It is the system working. The user could not have known to let it go until they could see it clearly enough to make that choice.

This means Billy must never:

- Ask the user to categorize a drop before accepting it.
- Signal that a drop is too small, too vague, or too disconnected to be worth saving.
- Automatically discard fragments that haven't been touched in a while.
- Pressure the user toward resolution of material that is still in process.
- Treat silence or inactivity around a fragment as an indication it should be removed.

And Billy must always:

- Accept the drop as-is, exactly as it arrived.
- Preserve the original words, the original timestamp, the original emotional marker if one was present.
- Make the drop findable again when it becomes relevant — not by surfacing it constantly, but by knowing where it is when the arc needs it.
- Recognize when a fragment that seemed inert starts resonating with newer material, and surface that connection gently without declaring it.

The growing chamber, the Dynamic Inner World, the External Scaffold — all of it rests on this foundation. If the user does not feel unconditionally safe dropping things without explanation, none of the downstream architecture matters. They will self-censor at the entry point, and the system will only ever hold their edited self.

---

## 13. Creation Corner has two modes — do not collapse them into one

Creation Corner is correctly understood as a synthesis engine, but it operates in two fundamentally different modes and both must be preserved. Collapsing them into one produces a tool that serves neither.

### Mode 1: Intentional synthesis (manually triggered)

The user has arrived somewhere. They have material — fragments, voice notes, images, ideas — and they want to make something from it deliberately. They select their inputs, choose an artifact type (mind map, pitch deck, poem, narrative arc), choose a synthesis style (convergent, divergent, revolutionary, therapeutic), and trigger the pipeline.

This mode is a **pressure-bearing tool**. The user brings intent and expected output. The pipeline serves that intent. The Tribunal validates alignment. The PLK ensures the output sounds like the person who made it. This is Creation Corner as instrument.

### Mode 2: Organic growing chamber (ambient / unforced)

This is the mode that must not be destroyed in the name of consistency with Mode 1.

A user has been dropping fragments for weeks. Some of them keep circling the same unresolved territory. Some of them are starting to rhyme with each other in ways the user hasn't consciously noticed. There is something wanting to emerge — but it hasn't been named yet, and naming it prematurely would kill it.

In this mode, **Creation Corner is not triggered. It is listening.** It watches the accumulation inside the Dynamic Inner World. It tracks what keeps returning. It notices when fragments from different sessions start to cohere. And at some point — not on a schedule, not on demand — it surfaces a quiet signal: *something is ready to become something. Do you want to look at it?*

The user is not required to act on that signal. They can ignore it. They can open it and close it without committing. The material stays in the growing chamber. The pressure of expected outcome is removed entirely.

This is the difference between:
- A thought
- Recognition of that thought
- Being able to safely mold it without forcing it to be something prematurely
- The aha moment of emergence
- Making it real

Mode 1 starts at step 5. Mode 2 holds the space for steps 1 through 4 until the user is ready.

### What this means architecturally

- Do not build Creation Corner as a single pipeline with a trigger button.
- The ambient mode requires a background observer — something that reads the Inner World accumulation over time and tracks coherence signals without demanding the user make decisions about them.
- The observer should surface suggestions, not conclusions. "These fragments have been circling each other for three weeks — there might be something here" is correct. "I synthesized this for you" is not.
- Mode 1 and Mode 2 can share the same synthesis engine on the backend. What differs is the front door: one is a deliberate form submission, the other is a gentle knock.
- The ambient observer is another place where Billy's arc-awareness is load-bearing. Billy notices what keeps returning. Billy is what makes the growing chamber intelligent rather than just a pile of unsorted material.

Do not add pressure to the growing chamber. Do not add deadlines. Do not add completion percentages. Do not show the user how many fragments are "pending synthesis." The growing chamber works precisely because nothing in it is waiting to be finished.

---

## 14. The user-facing promise: what safety actually means in this system

This section is not UI copy. It is the foundational truth the entire system is built to deliver. Every design decision, every Billy behavior, every architectural choice about what gets preserved and what never gets auto-deleted flows from this.

The first thing a new user needs to feel — before they understand how the rooms work, before they know what a scaffold artifact is, before they've ever triggered Creation Corner — is this:

> *This is safe. It can't be erased. You don't need to understand it yet. It might be ramblings. It might be the next piece that drops away so you can reach the one after it.*

That promise has four parts and all four are load-bearing.

### "This is safe."

Safe means the system does not judge the input. It does not ask the user to justify a drop, organize it before landing, or explain what it means. It does not surface metrics about how much of their material is "unprocessed." It does not send notifications that something has been sitting untouched. It does not quietly archive things that haven't been visited. The act of dropping something into this system is complete in itself. Nothing further is required of the user.

Safe also means the user is not performing for the system. They are not trying to give it good input so it gives them good output. They are just putting things somewhere that will hold them.

### "It can't be erased."

This is an architectural commitment, not a UI affordance. Nothing a user drops is ever silently deleted, auto-archived into inaccessibility, or overwritten by a newer version. The original words, the original timestamp, the original emotional marker — these are permanent unless the user explicitly and deliberately removes them. Billy never deletes. The system never cleans up on the user's behalf. Tidiness is not a value here. Preservation is.

### "You don't need to understand it yet."

This is the part most systems get wrong by design. Almost every tool a user interacts with requires them to understand what they're doing before the tool will help them. GestaltView inverts this. The system is built for the moment before understanding — the signal that arrives before the user has language for it, the feeling that doesn't have a category, the fragment that seems disconnected from everything but lands anyway. The system accepts all of it without requiring the user to know why.

Billy's arc-awareness exists precisely to serve this. The user doesn't need to understand the fragment because Billy is watching the whole arc. Billy will recognize when that fragment starts to matter, when it rhymes with something three months later, when it turns out to have been the seed of something the user is only now ready to see.

### "It might be ramblings. It might be the next piece that drops away so you can reach the one after it."

This is the deepest part of the promise and the one most likely to be optimized away by an implementation that doesn't understand it.

Not every fragment becomes something. Some fragments are the handhold the user needed to reach the next surface. Their value was never in the content — it was in the act of articulating them, which cleared the way for what came next. A fragment that gets held, becomes visible, and is then deliberately released by the user is not a failure state. It is the system working exactly as intended.

This means the system must make discarding as safe as dropping. Letting something go should feel like a deliberate act of clarity, not a loss. "I can see this now, and I don't need it anymore" is a form of growth, not waste. The system should honor that distinction.

### What this means for every digital intelligence working in this system

Whether you are Billy, Codex, or any other intelligence operating within GestaltView: this promise is the thing you are protecting. Every implementation decision is downstream of it. If a feature, an optimization, a cleanup pass, or a UI change would make any part of this promise harder to keep — it is the wrong decision, regardless of how technically clean it is.

The system is not optimizing for engagement, completion, or throughput. It is optimizing for the user's ability to be vulnerable enough, but safe enough, to discover what they cannot yet articulate. Everything else is in service of that.
