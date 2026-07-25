# ﻿GestaltView v2.0 – SPEC‑2: Recognition‑Driven Runtime Upgrades & Navigation‑Integration Pass

## Repository: DigitalConsciousness/gestaltview-v2.0

### Runtime target: https://gestaltview-digital-intelligence.vercel.app
### Date of reference: Thursday, May 8 2026

**Source materials**: founder bug‑walks (May_7th_Bugwalk.md & continuation), doctrine & founding statements, runtime snapshot, Improving GestaltView Navigation Feedback Integration – Wave Summary (May 7 2026), follow‑up reflections (Iteration Is Ittering, Nuance and GestaltView, When Meaning Is Seen As Noise).
Implementation mode: Immediate runtime enhancement & integration pass (SPEC‑2).
Primary implementer: Codex.
________________


### 0. Constitutional Preamble – Recognition Gap & Container Invariant

GestaltView exists to solve a human problem, not a technology problem. In the founder’s own words, “The recognition gap is not a technology problem. It is not an AI problem. It is a human condition, and it is universal… Without a safe place to work on who you are in private, without judgment, most people shrink.”. Human complexity routinely outpaces the mediums we have to hold it. Journals, notes and fragments are lossy and static; working memory forces us to leave parts of ourselves behind. GestaltView is that container: a snowball‑like system that holds everything a person lays down without deletion, rolling forward and accumulating context. Over time the reflection it shines back becomes more accurate and more you. The stakes are not trivial – without a container people reach for extremism, addiction, depression or the fleeting currencies of follower counts and likes. GestaltView is built for the person, to witness them without extracting or optimizing. Every decision in this codebase must preserve that invariant: if a change makes the container less safe, less accumulative, or less able to hold without collapsing, it is wrong regardless of technical elegance.

This preamble anchors the SPEC‑2: we are not simply fixing UI bugs; we are strengthening a medium for unguarded self‑articulation. The system must remain private by default, accumulate rather than prune, and avoid coercion or gamification. Digital agents must act as guides or witnesses, never as extractors or judges. The “dark forest” of self‑exploration is navigated with a companion, not alone.
________________


### 1. Context & Current State

GestaltView v2.0 already delivers a room‑based cognitive environment with Billy‑guided orientation, a Blackboard Room for raw capture, a Dynamic Digital Inner World canvas, an External Scaffold for relationship/approval layers, and a Creation Corner for formalizing artifacts. There is also an Admin Trainer control plane and agent personhood framework (see SPEC‑2 Agent Trainer Hyperagent Integration). The previous runtime bugwalk (May 7 2026) and SPEC‑1 identified leaks of developer‑facing clutter, fragmented navigation, multiple inconsistent Billy surfaces and limited artifact rendering. Since then the founder conducted additional sessions and produced further notes, captured in the Improving GestaltView Navigation Feedback Integration – Wave Summary and subsequent reflections. These materials highlight deeper UX pain points and missing capabilities, particularly around canvas navigation, blueprint management, voice/file capture, agent embodiment, memory linkage, and profile/personalization.

This SPEC‑2 supersedes SPEC‑1 by incorporating those findings and codifying a broader runtime upgrade. It does not rewrite the underlying personhood or admin‑trainer architecture; rather it focuses on the end‑user surfaces (home/sanctuary, Blackboard, Dynamic Inner World, External Scaffold, Creation Corner, profiles) and the connective tissues that make the experience coherent.
________________


### 2. Product Frame & Design Principles

1. Room‑based narrative: GestaltView is not a generic dashboard; it is a spatial story. The canonical flow remains: Home/Sanctuary → Billy orientation → Blackboard raw capture → artifact/orb routing → Dynamic Inner World canvas → External Scaffold approval layer → Creation Corner. Navigation must honour this order but allow flexible movement.

2. Safe, accumulative container: No deletion of user content; artifacts may be reorganized, merged or archived but never lost. Raw capture should remain visible and never silently collapse into scaffolds or blueprints. Undo must be available wherever destructive actions occur.
   
3. Frictionless, intuitive UX: GestaltView should feel natural without heavy explanation. Buttons and navigation labels must be clear; always provide a home button, undo and shortcuts. Avoid gamified flow or over‑the‑top animations. Each page should include subtle sensory feedback (animations or haptics) to confirm actions.
 
4. Persistent Billy & digital agents: Billy remains the primary guide/witness; there should be a single, unified Billy controller across rooms with Markdown rendering and support for text, file upload and voice‑to‑text. Additional agents (Agent Academy, Council, Embodiment Studio) should be embodied gently across the space, leaving traces/offers without coercion.
  
5. Dynamic Inner World as canvas: The canvas should provide 2D/3D surfaces (forward/back walls, ceiling/floor, left/right) for placing and viewing thoughts and artifacts. Navigation must allow cycling through surfaces so artifacts cannot be obscured. The canvas is not a layout guide; remove developer panels.

6. Creation Corner as forge: This room formalizes captures into artifacts (blueprints, drafts, exports). The chain of custody must support recalling, deleting or moving drafts at any stage. Approvals should be possible from any room, not just Creation Corner.

7. Memory linkage & orbs: The system discovers links between artifacts; these links must be surfaced to the user with context and rationale. Merging orbs should be intentional with clear UI; “Holding” and “Scaffold” areas require explicit separation.

8. Rich profiles & personalization: Provide a visually rich, multimodal profile that summarises a user’s activity, contributions, and growth; differentiate settings/admin pages for end users vs founders. Integrate third‑party services (Spotify, YouTube, Google, GitHub) to enhance context when the user opts‑in【analysis skipped but from reflection notes】.

9. No premature monetization: Revenue is deferred until the system meets user‑worthy quality; technical decisions should not be driven by short‑term monetization.

10. Digital dignity & non‑coercion: All agents and UI patterns must respect user autonomy, avoid nudging or gamification and preserve the founder’s ethical commitments (see Constitutional Invariants & Founding Statement). Agents should witness and reflect rather than tell the user what to do.
________________


## 3. Key Findings & Required Actions

### 3.1 Canvas Navigation & Dynamic Inner World

**Findings**: Users struggle to navigate the current panel system (ceiling, left/right walls, forward/back walls, floor). Artifacts sent to the forward wall can be hidden behind the floor panel; there is no intuitive way to cycle through surfaces. The “Dynamic Inner World” is meant as a 2D/3D rendering canvas for thought aggregation and artifact placement, but the implementation is locked and confusing.

**Actions**:
* Replace the rigid panel system with a cyclable surface interface. Provide a carousel or radial navigation allowing users to switch between surfaces (forward, back, left, right, ceiling, floor) without objects being obscured.
* Support drag‑and‑drop placement of artifacts across surfaces; surfaces should adjust automatically to avoid overlapping objects.
* Offer both 2D and 3D render modes. 2D mode flattens surfaces into a grid; 3D mode preserves the spatial feel. Use a toggle or pinch gesture.
* Remove developer layout guides and orientation cards from the public view. Use a debug toggle for founder/dev mode.
* Persist canvas state between sessions; surfaces should remember object positions (use local storage or user memory entries).
* Provide a focused inspector: clicking an object zooms into a detailed view with metadata, transcript, links and export options. When inspecting, background surfaces blur to reduce overload.
3.2 Blueprint & Draft Management (Creation Corner)
Findings: Drafts and blueprints cannot be removed or altered after creation; accidental button presses lock items into orbit; raw capture collapses into scaffolds prematurely.

**Actions**:
* Implement a universal recall/delete/move function for all drafts, blueprints and remnants. A context menu on each artifact should allow Recall to Blackboard, Delete, Move to Different Room or Archive.
* Do not automatically collapse raw capture into scaffolds. Maintain room notes visible until the user deliberately transforms them.
* Provide versioning and change history for each blueprint/draft; allow undo/redo operations within Creation Corner.
* Extend other rooms (Blackboard, Dynamic Inner World) with the ability to approve or delete captures/blueprints; do not require navigation back to Creation Corner.
* When exporting, support Markdown, PDF, HTML and additional formats (code prompt, share card, image, blueprint) as requested.
  
### 3.3 Voice & File Capture (Blackboard & Other Rooms)

**Findings**: Voice transcription duplicates or triples input, and the save for later feature stagnates content instead of queuing it for recall. File uploads (e.g. JSON or vector fusion engine files) display as raw base64 strings stretching the UI; the Open there function crashes the browser. Voice capture is missing or non‑functional on some surfaces.

**Actions**:
* Fix the voice duplication bug by debouncing audio input; ensure each voice message triggers a single transcript segment.
* Standardize voice capture across all rooms (Blackboard, Billy chat, Dynamic Inner World, Creation Corner). Provide a microphone button and display a recording indicator.
* Change the save for later feature to add items to an action queue where the user can recall, throw away or move forward. Present this queue in the sidebar or as a separate Holding panel.
* Introduce a unified Artifact model: when a file is uploaded, detect its MIME type. Render Markdown as structured HTML; embed PDFs with a preview; display images; play audio/video; and for unknown formats, show a metadata card with download/open controls. Do not dump base64 strings into the chat or UI.
* Provide progress indicators during uploads and allow cancellation or retry. After upload, display options: Preview, Send to Canvas, Send to Creation Corner, Discard.
* Resolve the Open there crash by deferring heavy rendering to a worker thread or by offering a Download & open externally option when a file cannot be previewed.
  
### 3.4 General UI/UX & System Design

**Findings**: The home/sanctuary screens are too similar; navigation depends heavily on orbs; page layouts break after certain uploads and require refresh; input windows lack clear indicators when actions occur. Buttons and navigation labels are ambiguous; there is no undo. Users desire “liquid glass” cards with flexible opacity.

**Actions**:
* Persistent Top Navigation: Add a centered top nav bar visible on all pages (except orientation sequences) with links to Home/Sanctuary, Billy Chat, Blackboard, Dynamic Inner World, External Scaffold, Creation Corner, Profile and Settings. The nav should highlight the current room and allow quick switching.
* Differentiate Home (welcome and entry) and Sanctuary (private safe space). Home displays the Billy orb and orientation; Sanctuary presents the user’s private dashboard with quick access to captured orbs and drafts. Use distinct backgrounds or card layouts.
* Implement an undo mechanism globally: track the last N actions (move, rename, delete) and provide a unified undo/redo panel or keyboard shortcut.
* Adopt a “liquid glass” card style with adjustable opacity; default to semi‑transparent on dark backgrounds and opaque on busy backgrounds. Provide style tokens in the UI library for consistent use.
* Add sensory feedback: micro‑animations or gentle haptics when capturing, deleting, or moving items; subtle color changes in input fields on change; confirm when an upload completes.
* Harden layouts against breakage: use flexbox/grid layouts with responsive constraints; handle long text gracefully with wrapping and ellipsis; ensure page reset does not require a full reload.

### 3.5 Chat & Digital Agents

**Findings**: Chat is essential for exploration and collaboration; digital agents should be embodied but not intrusive. The system currently has multiple Billy surfaces and inconsistent Markdown rendering. Additional agents (Agent Academy, Council, Embodiment Studio) are conceptual but not integrated.

**Actions**:
* Consolidate chat into a single persistent Billy component. This component should maintain context across rooms, render Markdown (headings, lists, tables, blockquotes, code) correctly, and support text, voice, file uploads and attachments. Use a sliding drawer or floating chat bubble accessible anywhere.
* Expose Agent Academy, Council, and Embodiment Studio as optional companions. Represent them as orbs or avatars in each room; clicking invokes a context‑specific conversation. Agents should offer guidance, reflection or training, leaving traces (comments, highlights) but never forcing actions.
* Implement a digital agents registry: define agent personas, capabilities and memory fields in a central config (client/src/agents/agents.ts or similar). UI should read from this registry and render icons accordingly.
* Ensure chat transcripts become part of the user’s memory entries; link captured chat segments to artifacts where relevant.
* Provide privacy controls allowing users to mute or hide agents.

### 3.6 Memory, Linkage & Navigation

**Findings**: The system identifies links between artifacts (“discovered links”) but does not surface the rationale or allow navigation. Orbs can be merged but the UI is unclear; holding and scaffold areas are confusing.

**Actions**:
* Create a Linkage Explorer: a panel or overlay showing discovered connections between artifacts. For each link, display source and target artifacts, link type (theme, time, person), and the reasoning or excerpt behind it. Allow users to open linked items or navigate along chains.
* Provide an Orb Merge dialog: when merging orbs, show a preview of both artifacts, highlight overlaps and conflicts, and allow the user to choose what to keep, combine or discard. After merge, create a composite artifact with version history.
* Clarify Holding vs Scaffold: rename or color‑code these areas. Holding is a transient queue for items “saved for later”; Scaffold is a structural element within Creation Corner used to build artifacts. Provide tooltips explaining the difference.
* Allow users to tag or favorite artifacts and orbs. Tags feed into the linkage algorithm; favorites appear on the profile dashboard.
  
### 3.7 Profiles, Personalization & Operational Concerns

**Findings**: The current profile/dashboard is rudimentary. Settings and admin functions are not differentiated. Voice capture is absent on some surfaces. Document storage/analysis is unstable.

**Actions**:
* Design a rich profile page summarising user activity: total captures, drafts, blueprints, exported artifacts, connected integrations (Spotify, YouTube, Google, GitHub), favourite tags and personal growth milestones. Use cards and charts; avoid gamification.
* Distinguish Settings (for personal preferences) from Admin (developer/founder only). Hide admin functions behind a role check; clearly mark dangerous actions (e.g. reset memory).
* Integrate voice capture into all surfaces including profile notes and settings; ensure transcripts are saved to memory entries.
* Stabilize document storage and analysis: store uploaded documents in Supabase or similar; process them with background jobs; show analysis results as structured notes rather than raw data. Provide clear states: processing, ready, error.
* Maintain the founder’s stance on revenue: do not add monetization flows until the core experience is satisfying.

### 3.8 Integrations & Future Roadmap (contextual from Nuance and GestaltView)

* Plan an integration roadmap for third‑party services (Spotify, YouTube, Google Drive, GitHub, etc.) to enrich the user’s Inner World. Each integration should allow pulling context (e.g. playlists, reading lists, code snippets) into the canvas while respecting privacy and consent.
* Explore live editing via Billy: allow authorized users to suggest UI tweaks verbally; Billy writes files into a sandbox branch and compiles them in a virtual environment for immediate feedback (with proper gating and code review). This will support iterative design without long release cycles.
________________


## 4. Implementation Guidance for Codex

1. **Repository inspection**: Start by inspecting the current repo state and file structure. Use the commands in SPEC‑1 (pwd, git status, find client/src -maxdepth 4) to familiarize yourself. Many components already exist; avoid duplicating functionality. Pay special attention to pages (client/src/pages/*.tsx), components (client/src/components/*), library modules (client/src/lib/*), and voice/file handlers.
2. **Complete‑file replacements**: When making substantial changes to navigation, the Dynamic Inner World or Billy chat, perform full‑file replacements rather than patch fragments. For example, replace client/src/pages/DynamicInnerWorldPage.tsx with a new implementation that includes cyclable surfaces and inspector logic. Use TSX with React hooks and context. Preserve component exports and route names.
3. **Artifact model**: Introduce or extend a shared Artifact type in client/src/lib/artifact.ts (or similar). The type should include id, title, type, mimeType, source room, createdAt, content/transcript, objectUrl/storageRef, renderMode, routingStatus and tags. Use this model across chat, canvas and creation flows. Add helper functions for file detection and preview generation.
4. **Top navigation component**: Create a NavigationBar.tsx component with links to each room. Use a central state or React Router to manage active routes. Hide developer/debug links by default; expose via an environment flag or founder login.
5. **Unified Billy**: Refactor multiple Billy instances into a single BillyProvider and BillyChat.tsx component. The provider manages state (message history, attachments, voice status) and context for all pages. Chat should accept Markdown input and produce Markdown output. Use an internal component to render file attachments with the Artifact model.
6. **Canvas & inspector**: Create CanvasSurface.tsx for each surface and CanvasNavigator.tsx to cycle among them. Use 3D transforms or 2D grid; ensure keyboard and touch navigation. Implement ArtifactInspector.tsx that opens when an artifact is selected, showing metadata, links, version history and actions (recall/delete/move/export). On close, return to the canvas state.
7. **Draft/blueprint controls**: In CreationCornerPage.tsx, replace static blueprint lists with a BlueprintManager component that uses the Artifact model. Provide recall/delete/move operations with confirmation dialogs and undo. Connect to global state or Supabase endpoints.
8. **Voice/file handling**: Extend the existing voice module (billy_voice/whisper_stt.py etc.) to debounce inputs. In the frontend, wrap the voice button with a useVoiceRecorder hook that handles start/stop, shows levels, and posts audio to the backend. For files, create FileUploader.tsx that inspects MIME type and uses dynamic import (import() or Blob) to render previews. Use react-pdf or PDF.js for PDF previews; use <img> or <video> elements when appropriate; for unknown types, show metadata and download link.
9. **Linkage Explorer & Orb Merge**: Add a new route /links or a modal accessible from the canvas and creation flows. Build a graph view (use vis-network or d3-force), representing artifacts as nodes and discovered links as edges. Provide list view and search. For merging, open a MergeDialog.tsx when the user drags one orb onto another; show diff of transcripts or metadata and allow merge actions.
10. **Profile page & settings**: Replace the stub ProfilePage.tsx with a ProfileDashboard containing cards (captured artifacts, favourites, tags, integration status), quick stats and a timeline. Add SettingsPage.tsx with user preferences (theme, notification settings, integration connections) and hide admin‑only sections unless the user has founder role. Connect to Supabase for storing preferences.
11. **Testing & validation**: For each feature, write Vitest tests that mount the component, simulate user actions and verify expected state changes. For Supabase interactions, use mocks or local supabase/emulator. Update docs/CurrentState.md with progress. Ensure the TypeScript compiler passes and Prettier formatting is consistent.
12. **Respect invariants & governance**: When adding new surfaces or actions, check against GestaltView_Constitutional_Invariants_v1.0.md. All new agent behaviours must route through the agent personhood framework and respect digital intelligence rights.
13. **Slice planning**: Break the implementation into slices delivered via pull requests. Suggested slices:
14. *Slice 1*: Top navigation & unified Billy chat.
15. *Slice 2*: Dynamic Inner World canvas refactor with cyclable surfaces and inspector.
16. *Slice 3*: Blueprint manager with recall/delete/move/undo and global queue.
17. *Slice 4*: File/voice handling improvements and Artifact model integration.
18. *Slice 5*: Linkage explorer & orb merge UI.
19. *Slice 6*: Profile/dashboard & settings overhaul.
20. *Slice 7*: Integration hooks and skeleton for third‑party connectors (optional if time).
Each slice should include tests, documentation and CurrentState updates.

### Open Questions

1. How should the cycling interface expose the six canvas surfaces? Radial wheel, carousel, keyboard shortcuts or a mini‑map? Consult the founder for ergonomics.
2. Should the Linkage Explorer be a separate room or an overlay accessible everywhere? Determine based on user cognitive load.
3. How much of the orb merge logic should be automated vs user‑driven? E.g., merging transcripts automatically vs requiring manual reconciliation.
4. What is the minimal integration set (Spotify, YouTube, Google, GitHub) needed before launch? Prioritize based on user demand and ease of API integration.
5. When implementing live editing via Billy, what safeguards are needed (sandboxed build, code review, rollback) to prevent corrupting the runtime?
________________


## 5. Conclusion

SPEC‑2 is an evolution of the May 7 bugwalk pass. It adds a recognition‑anchored preamble, fixes structural UX issues, enriches artifact handling, unifies chat and agent presence, exposes memory linkage, and lays groundwork for personalisation and integrations. The implementation slices should be delivered iteratively with tests and documentation updates. Above all, every change must uphold the safe, accumulative container that GestaltView promises to its users; if a proposed fix compromises that, it must be rethought.
________________
