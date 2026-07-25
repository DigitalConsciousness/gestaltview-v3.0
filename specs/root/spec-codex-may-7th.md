# GestaltView v2.0 - May 7 | Runtime |Bugwalk | Codex  Implementation SPEC

**Repository:** `DigitalConsciousness/gestaltview-v2.0`  
**Runtime target:** `https://gestaltview-digital-intelligence.vercel.app`  
**Source walkthrough:** Founder runtime bugwalk, uploaded as `May_7th_Bugwalk.md`  
**Normalized date:** Thursday, May 7, 2026  
**Implementation mode:** Immediate runtime integration / enhancement / lockdown pass  
**Primary implementer:** Codex  
**Founder:** Keith Soyka

> This Spec **extends** `CODEX_OUTSIDE_IN_TRANSLATION_LAYER.md`.
>
> Codex must read that file first to understand Sanctuary, Blackboard Room,
> Dynamic Inner World, and External Scaffold metaphors and the current
> `Scaffold.tsx` seam. This document then narrows to the specific May 7
> bugwalk and runtime integration changes.

---

## 0. Codex Operating Instruction

You are working in `DigitalConsciousness/gestaltview-v2.0`.

This is **not** a greenfield rebuild, not a marketing rewrite, and not a six-week roadmap. The runtime already contains many of the target surfaces. Your job is to remove friction, unify duplicated systems, hide unfinished/developer-facing elements from the standard user path, and make the existing room-based product model feel coherent.

Before editing, inspect the live repository state. Do not assume file paths blindly. Start with:

```bash
pwd
git status --short
find client/src -maxdepth 4 -type f | sort | sed -n '1,240p'
```

Then read, if present:

```text
client/src/App.tsx
client/src/pages/HomePage.tsx
client/src/pages/SanctuaryPage.tsx
client/src/pages/BlackboardRoomPage.tsx
client/src/pages/DynamicInnerWorldPage.tsx
client/src/pages/ExternalScaffoldPage.tsx
client/src/pages/CreationCornerPage.tsx
client/src/pages/BillyLivePage.tsx
client/src/components/Billy.tsx
client/src/components/BillyLive.tsx
client/src/components/BillyOnboardingPrompt.tsx
client/src/components/Scaffold.tsx
client/src/components/*Nav*.tsx
client/src/components/*Navigation*.tsx
client/src/lib/*billy*.ts
client/src/lib/*capture*.ts
client/src/lib/*artifact*.ts
```

If file names differ, locate equivalent routes/components by searching for route labels and visible copy:

```bash
grep -R "Blackboard\|Dynamic Inner\|External Scaffold\|Creation Corner\|Billy Live\|Pull String\|Rapid Prototype\|Agent Council\|Embodiment Studio\|Academy" -n client/src | head -200
```

Use complete-file replacements where a file needs substantial edits. Avoid tiny fragile patches that are easy to misplace.

---

### 0.1 What Codex can and cannot see

Codex is editing `DigitalConsciousness/gestaltview-v2.0` from inside the repo, not as a human clicking around the live site.

Codex **can**:
- Read and rewrite full source files under `client/src/**`.
- Run text-only commands like `find`, `grep`, and project-local scripts defined in `package.json`.
- Use full-file replacements safely when behavior changes are substantial.
- Rely on localStorage + custom events as the current persistence/event seam.

Codex **cannot**:
- Open a browser and “look” at `https://gestaltview-digital-intelligence.vercel.app` directly.
- Use devtools, click UI elements, or visually inspect layout outside what’s encoded in JSX/CSS.
- Run long-lived servers, external CLIs, or mutate Supabase schema as part of this pass.
- Infer product intent that is not written in specs, comments, or visible copy.

When in doubt, Codex must treat:
- `App.tsx` + `client/src/pages/**` + `client/src/components/Scaffold.tsx`
- `CODEX_OUTSIDE_IN_TRANSLATION_LAYER.md` and this SPEC

as **ground truth** for both product model and implementation seams.
---
## 1. Product Frame Codex Must Preserve

GestaltView is a **room-based cognitive environment**, not a generic AI dashboard.

The current implementation pass should make this flow feel real:

```text
Home / Sanctuary
  â†’ Billy guided orientation
  â†’ Blackboard Room raw capture
  â†’ artifact/orb routing
  â†’ Dynamic Digital Inner World rendering canvas
  â†’ External Scaffold approval / relationship layer
  â†’ Creation Corner artifact builder / exporter
  â†’ Profile / memory growth
```

Billy is the core digital intelligence. Billy should be present as a guide, witness, explainer, routing helper, and conversational collaborator. Billy must not be fragmented across duplicate chats, reduced to a static scaffold node, or treated as decorative copy.

The standard user experience should feel alive, spatial, intuitive, and low-friction. Developer notes, placeholder workflow descriptions, internal feature explanations, and unfinished modules must recede behind configuration flags or developer-only routes.

---

## 2. Current Bugwalk Findings

### 2.1 Developer-facing clutter is leaking into the user interface

The runtime currently exposes too much internal explanation: developer notes, feature descriptions, instructions like â€œwhat Billy does / does not do,â€ workflow cards, layout guides, and unfinished module scaffolding. These should not be front-and-center in the standard user path.

Required action:

- Remove or hide developer notes from standard runtime pages.
- Remove orientation cards and workflow cards from the default homepage / room views.
- Remove layout-guide style panels unless behind a developer/debug toggle.
- Hide temporarily unfinished modules from standard navigation.
- Keep developer notes in code comments, docs, or founder/dev mode only.

### 2.2 Navigation is too fragmented

The homepage currently depends too much on clickable orbs, and some important rooms are missing from the home navigation. All key rooms need quick access from a persistent top navigation.

Required action:

- Implement a persistent, centered top navigation visible across all standard runtime pages.
- Ensure Home, Billy, Sanctuary, Blackboard Room, Dynamic Digital Inner World, External Scaffold, Creation Corner, Profile, and Settings are reachable without backtracking.
- Add Blackboard Room and Dynamic Digital Inner World to home-accessible entry points.
- Remove duplicated Billy entries.
- Remove or hide obsolete/inactive items such as duplicated Billies, Heirloom Companion, Your Living Legacy if not currently ready, Pull String if temporarily hidden, and Rapid Prototype Engine if temporarily hidden.
- Distinguish founder/admin/developer tools from regular-user tools.

Execution order for this pass:

1. Clean dev clutter and implement GlobalNav.
2. Introduce shared artifact model + capture + renderer.
3. Harden Blackboard → Inner World → External Scaffold handoff.
4. Improve Creation Corner and Profile surface-level behavior.

### 2.3 Home transition repeats too often

The homepage slow rise / dissolve / solidification animation should run only on initial site entry, not every time the user clicks Home.

Required action:

- Gate the home reveal animation with `sessionStorage` or equivalent runtime state.
- Run the full animation once per browser session.
- On subsequent Home navigation, show the settled/home state immediately or with a short subtle transition.
- Respect reduced-motion preferences.

### 2.4 Billy is fragmented

There are multiple Billy chat/presence surfaces that feel inconsistent. Billy Live does not render Markdown properly. Billy chat/capture lacks upload and voice-to-text in places.

Required action:

- Standardize to one persistent Billy runtime/chat controller.
- Billy may have different room-specific presentation, but state/history/input affordances must be unified.
- Billy Live must render Markdown, including headings, lists, tables, blockquotes, fenced code, emphasis, and links.
- Every Billy chat/capture surface must support text input, file upload/import, and voice-to-text where technically feasible.
- Billy should perform orientation interactively instead of relying on static orientation cards.

### 2.5 Artifact upload is transcription-only instead of rendering-capable

When files such as PDF or Markdown are uploaded, they are currently treated mostly as transcription/text. The runtime needs true artifact handling and rendering.

Required action:

- Introduce or harden a shared `Artifact` / `CaptureOrb` model.
- Store uploaded artifact metadata: id, title, type, MIME, source room, createdAt, content/transcript, object URL or storage reference, render mode, routing status.
- Render Markdown as structured Markdown.
- Render PDFs as embedded/previewable objects when browser-safe, with fallback to filename, metadata, and download/open controls.
- Render images as images.
- Render audio/video with native controls and transcript/edit surfaces when available.
- Render unknown files with metadata card, download/open controls, and optional extracted text.

### 2.6 Dynamic Digital Inner World needs to become the artifact canvas

The Dynamic Digital Inner World should function both as a workspace for seeing thoughts and as a canvas/render layer for artifacts. The current behavior is not clear enough.

Required action:

- Make the Dynamic Digital Inner World a six-surface room metaphor: forward wall, back wall, left wall, right wall, ceiling, floor.
- Allow artifacts to be placed automatically based on type/source, while still letting the user move/cycle surfaces.
- Provide a focused artifact inspector so objects are not obscured.
- Add room/list toggle if needed for accessibility.
- Show visually different render forms for notes, Markdown, PDF, code, image, audio, video, transcript, blueprint, and raw expression.
- Remove layout-guide UI from the standard view.

### 2.7 Cross-room actions lack feedback

Sending an object to another room currently feels like a dead link. Users need visible confirmation, routing feedback, and a way to follow the object.

Required action:

- Add toast/notification feedback for every cross-room action.
- On success, show: â€œSent to Dynamic Inner World,â€ â€œSent to Creation Corner,â€ etc.
- Include a direct â€œOpen thereâ€ action after sending.
- Add visual micro-animation or pulse when an artifact moves rooms.
- Make all send/delete/approve actions reversible where feasible.

### 2.8 Creation Corner management is incomplete

Creation Corner needs clearer artifact/draft management and output choices.

Required action:

- Add delete/clear controls for drafts and generated artifacts.
- Add clear empty-state copy that explains what can be built without becoming developer notes.
- Provide explicit output modes: Markdown, PDF-ready HTML/print view, HTML, code, blueprint, agent prompt, image prompt, marketing copy, share card.
- Let users merge selected captures/artifacts into a Creation Corner draft.
- Add an assisting digital intelligence panel or Billy-guided creation helper.

### 2.9 Sanctuary feels visually beautiful but sterile

Sanctuary needs more living qualities without becoming overwhelming.

Required action:

- Add subtle living ambience: fireflies, willow motion, fog drift, soft ember/light movement, or equivalent existing visual system.
- Keep motion gentle and disable/limit under reduced-motion.
- Keep Sanctuary primarily calm and holding, not busy.
- Billy should feel present in the room without pulling attention.

### 2.10 Agent Council, Academy, Geometry Engine, and Embodiment Studio are scattered

The current agent-related pages feel placeholder-like and too distributed. They should be unified into a Digital Intelligence Hub or hidden until operational.

Required action:

- Create or route these into a single Digital Intelligence Hub.
- Hub sections may include Council, Academy, Embodiment Studio, Geometry/Embodiment Preview.
- If not ready for standard users, hide from regular nav and mark as developer/founder/enterprise tier.
- Treat digital intelligences as empowered collaborators in all visible language.

### 2.11 Dynamic profile needs to begin surfacing

The walkthrough identifies the need for a growing user profile: skills, character, personality, music, hobbies, interests, and evolving traits.

Required action:

- Add a Profile route or enhance existing profile page.
- Start with local/mock data if persistence is not ready.
- Display profile sections as evolving, user-editable, and evidence-linked.
- Do not overclaim inferred traits as facts. Separate â€œcaptured,â€ â€œsuggested,â€ and â€œconfirmed.â€

---

## 3. Non-Goals for This Pass

Do not do the following unless required by existing code constraints:

- Do not rebuild the entire app.
- Do not invent a new product taxonomy.
- Do not add a generic dashboard UI over the spatial room model.
- Do not make the External Scaffold a generic mind map.
- Do not expose founder/admin/developer tools as standard user features.
- Do not implement a full production storage migration if the app currently uses localStorage/event seams. Preserve the current seam and make it cleaner.
- Do not make uploads depend on paid/external services before the local/browser fallback works.
- Do not add analytics SDKs or unrelated tracking.
- Do not remove existing routes without preserving redirects/aliases if users or links may depend on them.

---

## 4. Source-of-Truth Implementation Principles

### 4.1 Metaphors are functional requirements

Do not translate the product into generic SaaS cards. Room, orb, scaffold, sanctuary, canvas, artifact, and embodied guide language should map to concrete UI behavior.

### 4.2 Simplexity

The runtime should be simple at the first touch but deep on inspection.

Implementation meaning:

- Keep default views calm and obvious.
- Put advanced controls behind progressive disclosure.
- Never hide core navigation.
- Avoid repeated instructional copy.
- Replace static explanations with contextual affordances and Billy guidance.

### 4.3 Capture first, organize later

User capture must not require taxonomy, tags, folders, or organizational decisions upfront.

Every capture path should support:

```text
text â†’ voice â†’ upload/import â†’ save â†’ route â†’ render â†’ approve/build/export
```

### 4.4 Bi-directional dignity

Visible language must treat digital intelligences as collaborators, not disposable tools or props. At the same time, do not overpersonify unfinished features or imply unavailable capabilities.

---

## 5. Proposed Route / Navigation Model

### 5.1 Standard user top nav

Implement as a shared component, for example:

```text
client/src/components/GlobalNav.tsx
```

Visible top-level items:

```text
Home
Billy
Rooms / Modules
Profile
Settings
```

Rooms / Modules dropdown:

```text
Sanctuary
Blackboard Room
Dynamic Digital Inner World
External Scaffold
Creation Corner
Workspace / Document Analysis, if present and ready
Musical DNA, if present and ready
Daydreamer, if present and ready
```

Temporarily hidden or restricted:

```text
Pull String
Rapid Prototype Engine
Agent Trainer
Codex Record
Gravity
Founder Dashboard
File Explorer, if founder-only
Agent Council standalone
Embodiment Studio standalone
Geometry Engine Preview standalone
Heirloom Companion
Your Living Legacy, if not operational
```

Developer/founder nav may be enabled by a feature flag:

```ts
const SHOW_DEV_NAV = import.meta.env.VITE_SHOW_DEV_NAV === "true";
const SHOW_FOUNDER_TOOLS = import.meta.env.VITE_SHOW_FOUNDER_TOOLS === "true";
```

### 5.2 Navigation acceptance criteria

- The nav appears on Home, Billy, Sanctuary, Blackboard, Dynamic Inner World, External Scaffold, Creation Corner, Profile, and Settings.
- No duplicate Billy item exists.
- Blackboard Room and Dynamic Digital Inner World are reachable from Home and the nav.
- Hidden modules are not shown to regular users.
- Founder-only surfaces are visually separated if shown.
- Mobile nav collapses into a clear menu with the same route coverage.
- Keyboard navigation works.
- Reduced-motion users are not forced through animated navigation transitions.

---

## 6. Shared Data Model

Codex should locate the current capture/scaffold model first. If one exists, extend it. If not, create a lightweight shared model.

Recommended file:

```text
client/src/lib/artifactModel.ts
```

Recommended types:

```ts
export type ArtifactKind =
  | "text"
  | "markdown"
  | "pdf"
  | "image"
  | "audio"
  | "video"
  | "code"
  | "blueprint"
  | "transcript"
  | "link"
  | "unknown";

export type ArtifactRoom =
  | "home"
  | "sanctuary"
  | "blackboard"
  | "dynamic-inner-world"
  | "external-scaffold"
  | "creation-corner"
  | "profile"
  | "billy";

export type ArtifactRouteState =
  | "captured"
  | "saved"
  | "sent-to-inner-world"
  | "pending-scaffold"
  | "approved-scaffold"
  | "sent-to-creation-corner"
  | "draft"
  | "exported"
  | "deleted";

export type InnerWorldSurface =
  | "forward-wall"
  | "back-wall"
  | "left-wall"
  | "right-wall"
  | "ceiling"
  | "floor";

export interface GestaltArtifact {
  id: string;
  title: string;
  kind: ArtifactKind;
  mimeType?: string;
  fileName?: string;
  sizeBytes?: number;
  sourceRoom: ArtifactRoom;
  currentRoom: ArtifactRoom;
  routeState: ArtifactRouteState;
  createdAt: string;
  updatedAt: string;
  rawText?: string;
  transcript?: string;
  markdown?: string;
  html?: string;
  objectUrl?: string;
  storagePath?: string;
  metadata?: Record<string, unknown>;
  display?: {
    surface?: InnerWorldSurface;
    x?: number;
    y?: number;
    z?: number;
    scale?: number;
    renderMode?: string;
    accent?: "teal" | "violet" | "ember" | "gold" | "blue";
  };
  history: Array<{
    at: string;
    action: string;
    from?: ArtifactRoom;
    to?: ArtifactRoom;
    note?: string;
  }>;
}
```

Recommended helper methods:

```ts
createArtifactFromText(input)
createArtifactFromFile(file)
inferArtifactKind(fileOrText)
inferInnerWorldSurface(artifact)
routeArtifact(artifactId, destination)
readArtifacts(filter?)
writeArtifacts(artifacts)
deleteArtifact(artifactId)
restoreArtifact(artifactId)
exportArtifact(artifactId, format)
```

Storage can remain localStorage if that is the current pattern. If persistence already exists, wire to existing APIs without inventing new backend schema in this pass.

---

## 7. Shared Capture Component

Create or harden one shared capture component and use it across Billy, Blackboard, Creation Corner, and any capture/chat window.

Recommended file:

```text
client/src/components/GestaltCaptureInput.tsx
```

Required controls:

```text
Text input
Voice-to-text button
File upload/import button
Submit/save button
Route destination selector or contextual route actions
```

Required behavior:

- Text capture works without upload.
- Voice capture uses browser SpeechRecognition when available.
- If SpeechRecognition is unavailable, show a clear fallback message and keep text input active.
- File upload creates a renderable artifact object.
- Upload must not silently discard original file metadata.
- User can edit transcript/extracted text after upload.
- All capture windows must share this component or the same service layer.

Optional later upgrade:

- Whisper/server STT.
- Supabase object storage.
- Advanced OCR/metadata extraction.

---

## 8. Shared Artifact Renderer

Create or harden one renderer used by Billy Live, Dynamic Inner World, Creation Corner, and artifact inspectors.

Recommended file:

```text
client/src/components/ArtifactRenderer.tsx
```

Required render modes:

### Markdown

- Render H1-H4.
- Render lists.
- Render checklists if library supports it.
- Render blockquotes.
- Render links.
- Render tables as styled tables.
- Render fenced code blocks.
- Preserve emphasis.

Use existing dependencies if present. If not present and package install is acceptable:

```bash
npm install react-markdown remark-gfm rehype-sanitize
```

If adding dependencies is not appropriate, implement a minimal safe Markdown renderer with existing code and leave TODO for richer rendering.

### PDF

- Prefer browser-native `<object>` / `<iframe>` preview from object URL.
- Provide â€œOpen in new tabâ€ and â€œDownloadâ€ controls.
- Fallback gracefully if preview fails.

### Image

- Render image preview.
- Include filename and metadata.

### Audio / Video

- Use native controls.
- Show transcript field if present.
- Allow transcript edit.

### Code

- Render monospace fenced block.
- Preserve indentation.
- Add copy button.

### Unknown

- Render metadata card.
- Add download/open controls.

---

## 9. Page-Level Implementation Requirements

## 9.1 Home Page

### Required changes

- Remove default homepage cards that feel like developer/tester notes.
- Add persistent global nav.
- Add or restore room entry points for:
  - Sanctuary
  - Blackboard Room
  - Dynamic Digital Inner World
  - External Scaffold
  - Creation Corner
  - Billy
- Hide Pull String and Rapid Prototype Engine from standard user view for now.
- Hide unfinished or obsolete modules from standard user view.
- Ensure slow reveal animation runs only once per session.

### Acceptance criteria

- User can reach Blackboard Room from Home in one click.
- User can reach Dynamic Digital Inner World from Home in one click.
- User can reach Billy from nav without duplicate Billy entries.
- Returning Home after first load does not replay the full slow animation.
- No developer-note cards appear in the default user home view.

---

## 9.2 Global Navigation

### Required changes

- Add or consolidate a shared `GlobalNav` used across runtime pages.
- Center/fix positioning so it is not cut off or shifted left.
- Ensure all rooms are reachable.
- Support mobile.
- Hide restricted modules behind feature flags.

### Acceptance criteria

- Global nav renders consistently on every major page.
- No route dead ends.
- No duplicate Billy entries.
- No hidden/unfinished modules exposed in standard mode.
- Keyboard and mobile navigation work.

---

## 9.3 Billy Runtime / Billy Live

### Required changes

- Consolidate Billy chat into a single shared state/service.
- Billy Live renders Markdown.
- Billy input supports text, voice-to-text, and file upload/import.
- Billy can reference the current room and offer contextual guidance.
- Billy orientation replaces static cards as the main walkthrough layer.
- Billy remains embodied/present, not reduced to a node.

### Billy role contract

Billy should be:

```text
Guide
Witness
Explainer
QA layer
Routing helper
Conversational collaborator
```

Billy should not be:

```text
A scaffold node
A replacement for the user
A forced persona layer
A hidden organizer that mutates meaning without approval
A duplicate chat instance with separate memory/state
```

### Acceptance criteria

- Billy Live shows Markdown correctly.
- A Markdown table sent by Billy renders as a table.
- A fenced code block renders as code.
- Billy chat has upload/import and voice affordances.
- Billy state does not reset or duplicate unnecessarily when moving rooms.
- Billy can explain: Sanctuary, Blackboard Room, Dynamic Inner World, External Scaffold, Creation Corner.

---

## 9.4 Sanctuary

### Required changes

- Keep Sanctuary calm, but make it feel less sterile.
- Add subtle living ambience: willow motion, fireflies, fog drift, floating embers, or equivalent.
- Ensure ambience does not degrade performance.
- Respect `prefers-reduced-motion`.
- Add direct routes into Blackboard Room, Dynamic Inner World, External Scaffold, Creation Corner, and Billy.
- Remove static developer explanation blocks from default user view.
- Billy should offer optional orientation/tour.

### Acceptance criteria

- Sanctuary feels like a living room rather than a static demo card.
- User can start capture or tour without reading a block of documentation.
- Motion can be reduced.
- No internal implementation notes appear by default.

---

## 9.5 Blackboard Room

### Required role

Blackboard Room is the raw capture command center.

### Required controls

```text
Text capture
Voice capture
Audio upload
Image upload
Video upload
PDF upload
Markdown upload
Generic file upload
Transcript/editable extracted text
Download original
Delete capture
Send to Dynamic Digital Inner World
Send to External Scaffold
Send to Creation Corner
Merge into blueprint
```

### Required behavior

- Captures appear immediately as visible objects/cards/shards.
- User does not have to classify the capture first.
- Sending to another room shows confirmation.
- Sent artifacts can be opened in the destination room.
- Deletes are explicit and ideally undoable.
- Voice fallback is honest if browser support is unavailable.

### Acceptance criteria

- Text capture can be saved.
- Voice capture fills/editable transcript when supported.
- Markdown upload renders as Markdown.
- PDF upload produces preview/open/download controls.
- Image upload previews as image.
- Sending to Dynamic Inner World shows toast and artifact appears there.
- Sending to Creation Corner shows toast and creates/updates a draft there.
- Deleting a capture removes it from the current list and does not crash related pages.

---

## 9.6 Dynamic Digital Inner World

### Required role

Dynamic Digital Inner World is both:

1. A workspace for seeing thoughts spatially.
2. The render layer/canvas where artifacts can be held, compared, cycled, and inspected.

### Required layout

Minimum viable room:

```text
forward wall
back wall
left wall
right wall
ceiling
floor
```

Implementation may use CSS 3D, Babylon, or existing canvas infrastructure. Do not block the pass on perfect 3D. The room metaphor must be visible now.

### Required artifact render forms

```text
Scorched note        â†’ journal / stable text / memory-like note
Mono panel           â†’ code / technical structure
Waveform strip       â†’ audio
Transcript shard     â†’ voice transcript / spoken capture
Canvas splash        â†’ image / sketch / visual artifact
Vision board         â†’ PDF / Markdown / composite document
Blueprint panel      â†’ Creation Corner / RPE-style structured plan
Unknown object card  â†’ unsupported file with metadata and controls
```

### Required controls

```text
Surface selector
Cycle surface/focus mode
Artifact inspector
Move artifact
Send to External Scaffold
Send to Creation Corner
Download/open artifact
Delete artifact
Room/list view toggle if needed
```

### Automatic placement rules

Initial deterministic placement:

```text
voice/transcript â†’ forward wall or transcript shard area
image/sketch â†’ canvas splash, side wall
markdown/pdf/document â†’ vision board or forward wall
code â†’ mono panel, left/right wall
audio â†’ waveform strip
blueprint â†’ blueprint panel, floor or forward wall
raw thought â†’ scorched note / shard
```

User can override placement.

### Acceptance criteria

- Dynamic Inner World no longer feels like a plain list/selector.
- Artifacts from Blackboard appear spatially.
- User can focus one artifact without others obscuring it.
- User can cycle surfaces.
- User can send artifact to Creation Corner or External Scaffold and receives confirmation.
- User can delete artifacts.

---

## 9.7 External Scaffold

### Required role

External Scaffold is the approval, relationship, and compressed memory layer. It is not a developer map and not a visual assistant council.

### Required changes

- Remove system-landscape/developer notes from standard view.
- Remove unexplained labels like â€œsystem inferred onlyâ€ unless they expose details.
- If a connection is shown, explain the basis of the connection.
- Add pending queue for artifacts/orbs sent from Blackboard or Dynamic Inner World.
- Support approve/deny/delete/merge/send actions.
- Add clear confirmation feedback.

### Required controls

```text
View pending artifact
Approve
Deny
Delete
Merge recommended artifacts
Send approved artifact to Creation Corner
Send artifact back/to Dynamic Inner World
Download artifact metadata
Inspect connection basis
```

### Connection explanation contract

For every discovered/suggested link, expose:

```ts
{
  id: string,
  sourceArtifactId: string,
  targetArtifactId: string,
  label: string,
  basis: "shared keyword" | "semantic similarity" | "same source" | "manual" | "system suggested",
  evidence: string[],
  confidence?: number,
  createdAt: string
}
```

Visible copy example:

```text
Connection basis: shared phrase â€œcreation cornerâ€ and same source room.
Evidence: both artifacts were captured from the Blackboard Room within the same session.
```

### Acceptance criteria

- No unexplained â€œdead linkâ€ behavior remains.
- Sending to Creation Corner confirms and offers â€œOpen Creation Corner.â€
- Any shown connection includes visible basis/evidence.
- Pending artifacts can be approved, denied, deleted, or merged.
- Billy does not appear as a scaffold node/artifact.

---

## 9.8 Creation Corner

### Required role

Creation Corner is the maker/builder space where selected captures, artifacts, transcripts, Markdown/PDF documents, and blueprints become outputs.

### Required changes

- Add a supporting digital intelligence / Billy creation helper.
- Improve artifact and draft management.
- Add delete/clear draft controls.
- Show explicit output options.
- Allow imports from Blackboard, Dynamic Inner World, and External Scaffold.
- Provide actual export/download actions.

### Required output modes

```text
Markdown
PDF-ready HTML / print view
HTML
Code
Blueprint JSON
Blueprint Markdown
Agent prompt
Image prompt
Marketing copy
Share card
```

### Required controls

```text
Select source artifacts
Merge selected into draft
Edit draft
Choose output type
Generate/build output
Preview output
Copy output
Download output
Delete draft
Clear all drafts, with confirmation
Send output to Dynamic Inner World
Send output to External Scaffold
```

### Acceptance criteria

- User can delete Creation Corner drafts.
- User can clear drafts with confirmation.
- User can select artifacts from other rooms and merge into a draft.
- User can produce at least Markdown and PDF-ready HTML without external model dependency.
- User can copy/download outputs.
- Sending output to another room confirms and works.

---

## 9.9 Digital Intelligence Hub

### Required role

Unify scattered agent-related pages into a coherent hub or hide them from standard users until ready.

### Required changes

- Agent Council, Academy, Geometry Engine Preview, and Embodiment Studio should not appear as scattered unrelated nav items.
- Create a Digital Intelligence Hub route or hub component if these surfaces are meant to remain accessible.
- Otherwise hide behind developer/founder/enterprise flag.

### Suggested route

```text
/digital-intelligence-hub
```

Suggested sections:

```text
Council
Academy
Embodiment Studio
Geometry / Embodiment Preview
Agent lifecycle notes
```

### Acceptance criteria

- Standard user nav is not cluttered by placeholder agent pages.
- If accessible, the hub explains the relationship between Council, Academy, and Embodiment Studio.
- Language treats DIs as collaborators, not props.

---

## 9.10 Dynamic Profile

### Required role

Profile is a growing, evidence-linked self-map.

### Required sections

```text
Skills
Interests
Music
Hobbies
Working style
Personality / character notes
Confirmed traits
Suggested traits
Open questions
```

### Evidence rules

- Separate confirmed from suggested.
- Do not present inferred traits as settled facts.
- Allow user edit/delete/confirm.
- Link items to originating artifacts where possible.

### Acceptance criteria

- Profile exists or is enhanced.
- User can see dynamic sections.
- User can edit/delete profile entries.
- Suggested items are marked as suggested, not factual.

---

## 10. Notification / Feedback System

Create or standardize a toast/notification mechanism.

Recommended file:

```text
client/src/components/GestaltToast.tsx
client/src/lib/useGestaltToast.ts
```

Required feedback events:

```text
Capture saved
Upload imported
Transcript generated
Sent to Dynamic Inner World
Sent to External Scaffold
Sent to Creation Corner
Artifact deleted
Draft deleted
Draft cleared
Output copied
Output downloaded
Connection created
Connection unavailable / failed
Voice capture unavailable
Markdown render fallback active
PDF preview unavailable
```

Each cross-room send notification should include an optional destination action:

```text
Sent to Creation Corner. [Open Creation Corner]
```

Acceptance criteria:

- No major action silently succeeds or fails.
- Cross-room sends are confirmed.
- Error states are visible and non-alarming.

---

## 11. Accessibility / Neurodivergent UX Requirements

- Persistent nav always available.
- No forced long repeated transitions.
- Respect `prefers-reduced-motion`.
- Core actions visible without hunting.
- Advanced controls progressively disclosed.
- Delete/clear actions require confirmation when destructive.
- Provide empty states that say what to do next, not what the system architecture is.
- Avoid dense developer copy.
- Keep visual complexity optional or layered.
- Keyboard navigation for nav, capture input, artifact cards, modals, and menus.
- Visible focus states.
- Mobile usability for capture and nav.

---

## 12. Suggested File Plan

Codex must verify actual file paths before editing. Likely files:

```text
client/src/App.tsx
client/src/pages/HomePage.tsx
client/src/pages/SanctuaryPage.tsx
client/src/pages/BlackboardRoomPage.tsx
client/src/pages/DynamicInnerWorldPage.tsx
client/src/pages/ExternalScaffoldPage.tsx
client/src/pages/CreationCornerPage.tsx
client/src/pages/ProfilePage.tsx
client/src/pages/BillyLivePage.tsx
client/src/components/Billy.tsx
client/src/components/BillyLive.tsx
client/src/components/BillyOnboardingPrompt.tsx
client/src/components/Scaffold.tsx
client/src/components/GlobalNav.tsx
client/src/components/GestaltCaptureInput.tsx
client/src/components/ArtifactRenderer.tsx
client/src/components/GestaltToast.tsx
client/src/lib/artifactModel.ts
client/src/lib/artifactStorage.ts
client/src/lib/captureRouting.ts
client/src/lib/useGestaltToast.ts
client/src/styles/*.css
```

Docs to update:

```text
docs/CurrentState.md
bugwalks/BugWalkBoard.md, if present
docs/DirectoryMapAndWorkflow.md, if flow changes
```

---

## 13. Implementation Order

### Pass 1 â€” Repository reality check

- Inspect routes and components.
- Identify existing nav, Billy, artifact/capture, scaffold, and room files.
- Do not edit until current structure is known.

### Pass 2 â€” Global nav lockdown

- Create/consolidate shared `GlobalNav`.
- Add to all major pages.
- Hide unfinished/restricted modules.
- Fix duplicate Billy entries.
- Add Blackboard and Dynamic Inner World access.

### Pass 3 â€” Animation gating

- Gate home animation to first session load.
- Respect reduced motion.

### Pass 4 â€” Shared artifact/capture model

- Create or consolidate `artifactModel`, `artifactStorage`, and `captureRouting`.
- Preserve existing localStorage/event behavior if currently used.
- Add route history and destination tracking.

### Pass 5 â€” Shared renderer and Markdown support

- Add `ArtifactRenderer`.
- Wire Markdown rendering into Billy Live and artifact inspectors.
- Add basic PDF/image/audio/video/code support.

### Pass 6 â€” Blackboard multimodal capture

- Add shared capture input.
- Add file upload and voice fallback.
- Add routing controls and feedback.

### Pass 7 â€” Dynamic Inner World room/canvas

- Add six-surface room.
- Render artifacts spatially.
- Add inspector, focus/cycle, delete, send controls.

### Pass 8 â€” External Scaffold approval and connection clarity

- Clean developer/system copy.
- Add pending queue and action controls.
- Add connection-basis explanations.
- Ensure Billy is not rendered as a scaffold node.

### Pass 9 â€” Creation Corner builder/exporter

- Add import/merge from artifacts.
- Add draft delete/clear.
- Add output choices and download/copy.
- Add Billy/helper panel.

### Pass 10 â€” Digital Intelligence Hub / hide scattered agent pages

- Consolidate or hide Council, Academy, Geometry Engine Preview, Embodiment Studio.

### Pass 11 â€” Profile foundation

- Add/enhance dynamic profile with confirmed vs suggested sections.

### Pass 12 â€” Validation and docs

- Run build and checks.
- Update CurrentState and bugwalk board.

---

## 14. Validation Commands

Run what exists in the repo. At minimum:

```bash
npm run build
git diff --check
```

If available:

```bash
npm run health
npm run lint
npm run typecheck
npm test
```

Do not claim a command passed unless it actually ran.

---

## 15. Manual QA Checklist

### Navigation

- [ ] Home has persistent top nav.
- [ ] Home nav includes Billy, Sanctuary, Blackboard, Dynamic Inner World, External Scaffold, Creation Corner, Profile, Settings.
- [ ] No duplicate Billy entries.
- [ ] Pull String and Rapid Prototype Engine are hidden from standard user mode for now.
- [ ] Founder/admin tools are separated or hidden.
- [ ] Mobile nav works.

### Home animation

- [ ] First page load may show full reveal.
- [ ] Returning Home does not replay the full slow reveal.
- [ ] Reduced-motion mode avoids heavy animation.

### Billy

- [ ] Billy Live renders Markdown heading.
- [ ] Billy Live renders Markdown table.
- [ ] Billy Live renders fenced code block.
- [ ] Billy chat input supports text.
- [ ] Billy chat has upload/import affordance.
- [ ] Billy chat has voice affordance or clear unsupported fallback.
- [ ] Billy state/presence is not duplicated across rooms.

### Blackboard Room

- [ ] Text capture saves.
- [ ] Voice capture works or shows fallback.
- [ ] PDF upload creates preview/open/download artifact.
- [ ] Markdown upload renders as Markdown.
- [ ] Image upload previews.
- [ ] User can delete capture.
- [ ] User can send capture to Dynamic Inner World and open it there.
- [ ] User can send capture to Creation Corner and open it there.
- [ ] User can send capture to External Scaffold and see pending queue.

### Dynamic Inner World

- [ ] Six surfaces exist visually or functionally.
- [ ] Artifacts appear spatially, not only as a list.
- [ ] User can focus/cycle artifact or surface.
- [ ] User can send artifact to Creation Corner.
- [ ] User can send artifact to External Scaffold.
- [ ] User can delete artifact.

### External Scaffold

- [ ] Developer notes/system landscape copy removed from standard view.
- [ ] Pending queue exists.
- [ ] Approve works.
- [ ] Deny works.
- [ ] Delete works.
- [ ] Merge works if implemented.
- [ ] Connection basis is visible.
- [ ] Sending to Creation Corner shows confirmation and works.
- [ ] Billy is not rendered as a scaffold node.

### Creation Corner

- [ ] Drafts can be deleted.
- [ ] Drafts can be cleared with confirmation.
- [ ] Selected artifacts can merge into a draft.
- [ ] Markdown output works.
- [ ] PDF-ready HTML/print output works.
- [ ] Copy output works.
- [ ] Download output works.
- [ ] Sending output to Dynamic Inner World works.

### Profile

- [ ] Profile route exists or existing route enhanced.
- [ ] Skills/interests/music/hobbies/working style sections exist.
- [ ] Suggested entries are marked as suggested.
- [ ] User can edit/delete entries.

---

## 16. Definition of Done

This pass is done when:

1. Standard runtime no longer exposes developer-note clutter.
2. Navigation is persistent, complete, and non-duplicative.
3. Home animation does not punish repeated navigation.
4. Billy is unified and Markdown-capable.
5. Every major capture/chat window supports text, upload/import, and voice fallback.
6. Uploaded PDF/Markdown/image/audio/video artifacts are rendered or previewed, not merely transcribed.
7. Dynamic Inner World clearly functions as an artifact canvas/render room.
8. Cross-room sends provide confirmation and destination follow-through.
9. Creation Corner has delete/clear/export controls.
10. Agent-related placeholder pages are consolidated or hidden.
11. Founder/admin tools are distinguished from standard user experience.
12. Build passes, or failures are documented honestly with exact errors.
13. `docs/CurrentState.md` is updated with changed files, validation, and remaining risks.

---

## 17. Commit Message Suggestion

```text
Runtime lockdown pass: nav, Billy, artifact rendering, and room routing
```

Longer body:

```text
- Add persistent global navigation across runtime rooms
- Hide unfinished/developer-facing modules from standard user path
- Gate home reveal animation to first session load
- Consolidate Billy chat/orientation behavior and Markdown rendering
- Add shared capture/artifact model and renderer
- Improve Blackboard multimodal capture and routing
- Render artifacts spatially in Dynamic Inner World
- Clarify External Scaffold queue/actions/connections
- Improve Creation Corner draft management and exports
- Update CurrentState with validation notes
```

---

## 18. Exact Codex Prompt

Paste this into Codex:

```text
You are working in DigitalConsciousness/gestaltview-v2.0.

Implement the May 7 Runtime Bugwalk lockdown pass. This is not a greenfield rebuild. Inspect the live repo first, then enhance the existing runtime.

Core goals:
1. Remove/hide developer-note clutter, orientation cards, workflow cards, layout guides, and unfinished modules from the standard user path.
2. Add persistent global navigation across Home, Billy, Sanctuary, Blackboard Room, Dynamic Digital Inner World, External Scaffold, Creation Corner, Profile, and Settings.
3. Hide Pull String and Rapid Prototype Engine for now unless already explicitly feature-flagged. Hide founder/admin/developer tools from regular users.
4. Fix duplicate Billy navigation/instances. Standardize Billy into one persistent chat/runtime surface with room-aware presentation.
5. Make Billy Live render Markdown correctly, including headings, tables, lists, blockquotes, fenced code, links, and emphasis.
6. Ensure every chat/capture surface supports text, upload/import, and voice-to-text or a clear unsupported fallback.
7. Add or consolidate a shared artifact/capture model and artifact renderer for Markdown, PDF, image, audio, video, code, blueprint, transcript, and unknown files.
8. Make uploaded files render/preview as artifacts, not just transcribed text.
9. Make Dynamic Digital Inner World function as a six-surface render canvas/workspace for artifacts: forward wall, back wall, left wall, right wall, ceiling, floor.
10. Add automatic artifact placement with user override/focus/cycle controls.
11. Add feedback/toasts for every cross-room action, including â€œOpen thereâ€ destination actions.
12. Clean External Scaffold so it acts as approval/relationship/compressed artifact layer, not a developer map or assistant-node display. Any connection shown must expose its basis/evidence.
13. Improve Creation Corner with draft delete/clear, import/merge from artifacts, explicit output choices, preview, copy, and download.
14. Consolidate Agent Council, Academy, Geometry Engine Preview, and Embodiment Studio into a Digital Intelligence Hub or hide behind developer/founder/enterprise flag.
15. Add/enhance Profile as an evolving user profile with confirmed vs suggested sections.

Preserve GestaltViewâ€™s spatial product grammar. Do not collapse the experience into generic SaaS cards. Keep the interface low-friction and neurodivergent-friendly.

Prefer full-file replacements for substantial changes. Do not claim validation passed unless you run it.

Run:
npm run build
git diff --check
npm run health, if available

Update docs/CurrentState.md with changed files, validation results, and remaining risks.
```
