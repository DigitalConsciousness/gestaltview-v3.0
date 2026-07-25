# SPEC — Slice 2: UI/UX Room Clarity & Noise Reduction

**Status:** Ready for Codex execution  
**Owner:** Keith Soyka / DigitalConsciousness  
**Repo:** gestaltview-v2.0  
**Last updated:** May 17, 2026  
**Source:** UI/UX Specifications transcript, May 17, 2026

---

## Purpose

The current UI carries noise that contradicts GestaltView's core premise: that the platform gets out of the way and lets discovery happen. This slice targets three specific problems:

1. **Cluttered chat/capture surface** — the Blackboard Room is polluted with metaphysical prompts, surface choices, and UI chrome that interrupts flow state.
2. **Missing room definitions** — each room (Blackboard, Creation Corner, Inner World, Sanctuary) does not clearly communicate what it is, why the user is there, and what they can do. Users are thrown into rooms without orientation.
3. **Cognitive load in the Creation Corner** — the current flow asks the user to make too many explicit choices upfront (format, surface, destination) rather than letting the digital intelligence infer and suggest.

This slice is **UI surgery**, not architecture. It does not change data models, embodiment runtime, or agent behavior. It removes noise and sharpens signal.

---

## Principles

- **Unencumbered capture first.** The Blackboard Room exists for one thing: open-ended, unguided capture. Everything else is secondary.
- **DI surfaces realizations. Users decide what to keep.** The digital intelligence handles cognitive triage. The user retains full control over saving.
- **Rooms have a single clear purpose.** No room should require explanation. Its name, empty state, and ambient prompt should communicate its purpose instantly.
- **Creation Corner is intent-first.** Users express what they want to make in plain language. The platform figures out the format.
- **No orphaned UI elements.** Every visible element on screen must be traceable to a user need. If it cannot be justified, it is removed.
- **Neurodivergent UX standard.** Low friction. Predictable. No surprise interruptions. No modal walls. No "before you go..." prompts.

---

## Rooms in Scope

| Room | Core Purpose | Primary Failure Mode (Current) |
|------|-------------|-------------------------------|
| Blackboard Room | Open-ended capture and flow-state chat | Cluttered with prompts and chrome; "what is this trying to say to the room?" style noise |
| Creation Corner | Structured creation: blueprints, decks, stories, brainstorms | Asks user to choose format/surface upfront; DI not available throughout |
| Dynamic Inner World | Visual museum of the user's ongoing work, profile, and memory | Too many placement choices confuse users; feels like a configuration panel |
| Sanctuary | Restorative, low-stimulation space | (Defer to separate slice — out of scope here) |

---

## Files to Touch

Codex must audit and identify exact file paths before modifying. Expected targets based on repo structure:

| Expected File | Action |
|--------------|--------|
| `client/src/pages/BlackboardRoomPage.tsx` (or equivalent) | Remove noisy prompts; clarify session controls |
| `client/src/pages/CreationCornerPage.tsx` (or equivalent) | Replace format picker with intent input; wire DI presence |
| `client/src/components/Billy*.tsx` (or equivalent) | Ensure Billy/DI is available in both rooms without requiring explicit invocation |
| `client/src/components/RoomDefinition*.tsx` (or equivalent) | Add or refine room identity headers (name, purpose, DI presence indicator) |
| Any component rendering "what is this trying to say to the room?" or similar metaphysical prompt text | Delete or replace with neutral ambient text |

## Files NOT to Touch

- `shared/embodiment/**` — DI identity system; separate slice
- `server/` — no backend changes in this slice
- `supabase/` — no schema changes
- `client/src/pages/EmbodimentStudioPage.tsx` — separate slice
- `client/src/pages/AgentCouncilPage.tsx` — separate slice
- `client/src/pages/DigitalIntelligenceAcademyPage.tsx` — separate slice
- Navigation/routing structure — do not rename routes or change URL paths

---

## Blackboard Room: Required Changes

### Remove
- All metaphysical/woo-woo prompts visible to the user in the chat window (e.g., "what is this trying to say to the room?", "surface this to the inner world", or any automated suggestion that appears mid-conversation without user request)
- Any UI element that requires the user to choose a destination surface before they have finished capturing

### Keep / Clarify
- The chat input field — full width, prominent, no competing UI within the chat window's primary zone
- Session controls (Save Session / Summarize Session) — accessible but not intrusive. Placement: bottom toolbar or collapsed header, not floating over the chat
- Multimodal input affordances (file/image upload, voice) — present but visually secondary to the text input

### Add
- **Session significance indicator** — a subtle ambient signal (e.g., a small glowing dot or count in the session header) that the DI has noted things of significance in the current session. This surfaces DI awareness without interrupting flow. Clicking it reveals a panel: "Here's what stood out this session — save any of these?"
- **Bucket Drop confirmation** — after the user ends a session or closes the window, a single optional prompt: "Save this session?" with options: Save All, Save Highlights Only (DI-curated), Discard. No forced save. No auto-routing to surfaces.

### Ambient Empty State (when chat is empty)
Replace any guiding prompt text with a single, calm line that communicates the room's purpose without directing behavior. Example:
> *"This is your space. Say anything."*

No sub-prompts. No feature callouts. No "try asking about..."

---

## Creation Corner: Required Changes

### Remove
- Any upfront format/surface picker (e.g., "Do you want code? HTML? A slide deck? A document?")
- Any selection grid requiring the user to choose an output type before expressing intent

### Keep / Clarify
- A single open input field: the user describes what they want to make in plain language
- The ability to see works-in-progress in this room (the "museum" surface — ongoing projects, not configuration panels)

### Add
- **Intent-first flow:** User types or speaks what they want. DI responds with a brief interpretation and a proposed direction — not a choice menu. Example:
  > User: "I've been circling something about my product philosophy and I'm blocked."
  > DI: "Let's map it out. I'll start with what I've heard you say about it — tell me what feels closest to the block."
- **Brainstorm mode:** When the user signals they're stuck or wants to explore, the DI can offer an exploded connection view — a visual or listed set of routes the idea could go. This is offered, not imposed.
- **DI always present:** A persistent, minimal DI indicator in the Creation Corner. The user does not need to invoke it. It is already there, reading context, ready to respond.

### Non-invasive creation flow
The DI should never ask: "Where do you want to send this?" until the user has finished creating. Once creation is done, it can offer: "Want to add this to your Inner World? Here's where it would fit." One suggestion. User accepts or dismisses.

---

## Dynamic Inner World: Required Changes

### Remove
- Placement/surface choice UI ("Put it on the left? Right? Front? Top?")
- Any modal or panel that requires the user to configure a surface position before viewing their work

### Philosophy
The Inner World is a **museum, not a configuration panel.** Surfaces are curated by the platform based on what the user has done, not assigned by the user manually. The user explores; they don't build display cases.

### Surfaces (rendered automatically based on user activity)
These surfaces should appear and populate without user intervention:

| Surface | Populates From |
|---------|---------------|
| Dynamic User Profile | Accumulates from all sessions; builds in real time |
| Active Project Status | Surfaces from Creation Corner in-progress work |
| Resume Builder | Extracts skills, outputs, and accomplishments from sessions |
| Personality Profile | Synthesized by DI from patterns across sessions |
| Generative Journey Art | Interpretive visuals generated from session history |

None of these require the user to "send" anything. They update as the user works.

### What the user CAN control
- Which surfaces are visible (toggle on/off per surface type)
- Whether a specific session artifact is included (manual review on request)
- Privacy level per surface (private / shared)

---

## Room Identity Headers

Every room must have a minimal identity header visible at the top of the page. It should contain:

1. **Room name** — single word or short phrase, prominent
2. **One-line room purpose** — plain language, never metaphysical
3. **Active DI indicator** — which digital intelligence is present in this room, with a subtle visual presence (name + avatar glyph, not a banner)
4. **Room status** (optional) — e.g., "Session in progress · 23 min" or "3 things noted this session"

This header should not take more than ~40px of vertical space. It is orientation, not decoration.

---

## Visual Language Constraints

All UI changes must conform to the GestaltView visual system:

- **Neural aurora** and **liquid glass** aesthetics — surfaces feel alive but not distracting
- **Soft presence** — DI indicators are glowing but subtle; they do not demand attention
- **No harsh borders** — use surface elevation (shadow, translucency) over hard lines
- **Low-stimulation defaults** — high contrast only for the primary input/action; everything else recedes
- **Neurodivergent UX** — no surprise interruptions, no time-sensitive prompts, no information that cannot be dismissed or deferred

---

## Validation

After completing this slice, the following should be true:

- [ ] Opening the Blackboard Room presents a clean chat window with no visible metaphysical or directive prompts
- [ ] The session save flow requires no more than one explicit user action after capture is complete
- [ ] The DI significance indicator appears after at least one meaningful exchange without any user action
- [ ] The Creation Corner input accepts plain-language intent and the DI responds without asking the user to choose a format
- [ ] The Dynamic Inner World surfaces appear populated (or in empty state with warm message) without requiring placement configuration
- [ ] All four rooms have a visible room identity header under 40px
- [ ] `npx tsc --noEmit` passes with no new errors introduced
- [ ] No existing route or URL path has changed

---

## Risk Notes

- Some of the "noisy prompt" UI may be driven by server-side or DI-generated content, not hardcoded strings. Codex must trace the source before deleting. If prompt text comes from the embodiment/chat layer, flag it for Slice 3 rather than deleting it from the UI.
- The Creation Corner "format picker" may be load-bearing for some current output flows. If removing it breaks an output path, Codex should comment out (not delete) and leave a `// TODO: replace with intent-first flow` marker.
- The Inner World surface removal of placement UI must not delete the underlying surface rendering logic — only the configuration modal/picker. Surfaces should still render; they just populate automatically.

---

## Rollback Notes

- All changes are UI-layer only. Git revert on any modified component file restores prior state.
- No data changes, no schema changes, no API changes.
- If the DI significance indicator requires a new API endpoint (to retrieve session notes), scope that work as a follow-on task and leave a placeholder component instead.

---

## Non-Goals for This Slice

- Do NOT implement DI persona switching UI (Slice 4+)
- Do NOT build the Session Recap writer (covered in session persistence spec)
- Do NOT create the generative art pipeline for Inner World surfaces
- Do NOT modify embodiment profile runtime or prompt building
- Do NOT add new pages or routes
- Do NOT touch Sanctuary, GATE, Agent Council, or Embodiment Studio
