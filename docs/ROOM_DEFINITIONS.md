# GestaltView Room Definitions
**Version:** 0.3 — Dynamic Inner World Defined + Recap Integration  
**Status:** In Progress — add to, correct, and expand as understanding deepens  
**Purpose:** Single source of truth for what each room is, what it does, what it receives, what it produces, and how it connects to the rest of the runtime. This document governs room-aware prompt behavior, DI presence bindings, and pipeline sequencing.

---

## Core Principle: Three Modes of Being

Every room in GestaltView operates in one of three fundamental modes. These modes must not be conflated in the UI, the data layer, or the prompt architecture.

| Mode | Name | Description |
|------|------|-------------|
| 1 | **Active / Contextual** | Scoped to what is happening right now. One project, one session, one thread. Not the whole life — just this moment. |
| 2 | **Accumulated / Structural** | Everything. Every node, color-coded, filterable. The complete map. Opt-in to view, never auto-surfaces in full. |
| 3 | **Distilled / Reflective** | Synthesis. What the accumulation *means* — skills, patterns, personality — drawn from evidence, not from checkboxes. |

The causal pipeline flows in one direction:  
**Active Work → Scaffold (background accumulation) → Dynamic Inner World (synthesis)**

Nothing in Mode 2 or 3 auto-interrupts Mode 1. The Scaffold listens passively. Dynamic Inner World reads the Scaffold and synthesizes on demand.

---

## Deprecated / Reassigned Pages

The following pages are no longer active rooms in the runtime. Their status is noted here to prevent confusion during future development.

| Page | Status | Notes |
|------|--------|-------|
| `WhiteboardRoomPage.tsx` | **Deprecated** | Was the working title for Blackboard Room. Renamed for clarity in dark mode context. No longer in runtime. |
| `DynamicInnerWorldPage.tsx` | **Cleared + Rebuilding** | Previous implementation wiped. Being rebuilt as the Museum of You — see full definition below. |
| `InsightWindow.tsx` | **Component, not a room** | Used in Musical DNA for song insight overlay. Not a standalone room. |
| `SymbioCodingPage.tsx` | **Legacy integration** | Carried over from the SymbioCoder app. Not a core GestaltView room. Evaluate for integration into Blackboard Room coding mode or deprecation. |
| `GravityInspectorPage.tsx` | **Admin tool** | Part of the Gravity Protocol admin dashboard. Not a user-facing room. |
| `BrainSparksPage.tsx` | **Archived** | Concept page, not in active runtime. |
| `BucketDropsPage.tsx` | **Archived** | Concept page, not in active runtime. |
| `MusicalDNAPage.tsx` | **Needs rebuild** | Current implementation is Keith-specific. Clear and rebuild to support any user connecting their Spotify playlist or uploading music. InsightWindow component likely carries forward. |

---

## Room Definitions

---

### BLACKBOARD ROOM
**File:** `client/src/pages/BlackboardRoomPage.tsx`  
**Mode:** Active / Contextual  
**DI Present:** Billy (primary), context-specific DIs as needed

**Purpose:**  
The active working space. Where you and a Digital Intelligence work through something together in real time — a coding session, a design problem, a conversation, a plan. What's on the board is *only* what belongs to this session. Nothing from the full Scaffold auto-surfaces here. Clutter is the enemy of this room.

**Note:** 2D/3D canvas rendering capability is folded into the Blackboard Room as an interactive real-time environment layer — not a separate room.

**Inputs:**  
- User input (text, voice, file drops, code)  
- Active project context (current workspace/session ID)  
- DI embodiment profile (Billy or assigned DI)  
- Scaffold passthrough: relevant nodes *only if explicitly pulled*

**Outputs:**  
- Session artifacts (drafts, code, decisions, notes)  
- Node events passively emitted to Scaffold (background, silent)  
- Saved session records to Supabase  
- **Session Recap artifacts** → routed to Dynamic Inner World on trigger

**Session Recap Trigger:**  
The Blackboard Room contains a `SessionRecapGenerator` trigger. When fired, it reads the current session's captures and conversation history, calls the LLM via `routeLlm` with the selected recap voice, and produces a self-contained interactive HTML artifact — the session's living recap. That artifact is then routed to the Dynamic Inner World as a first-class museum object.
The recap flow also exposes a user-selectable recap voice, routes the voice choice through the server prompt, and fails closed if the model does not return a finished HTML artifact.

Two entry points exist for recap generation:
- **Full session trigger** — fires from within the Blackboard Room after a working session. Reads all captures + conversation history for the session.
- **Scaffold node trigger** (`ScaffoldNodeRecap`) — fires from the External Scaffold against a single node. Same engine, single-node seed instead of full session.

**Recap artifact shape:**  
HTML. Self-contained. Neural Aurora aesthetic. Four required sections: *What we built / What emerged / What's still in motion / Worth holding.* Interactive (expandable sections, hover states, smooth scroll). Signed by Billy with one honest sentence about the session. Routed via `onArtifactReady` → `appendInnerWorldCapture`.

**Connections:**  
- → External Scaffold (passive node emission, not display)  
- → Dynamic Inner World (Session Recap artifacts, via `appendInnerWorldCapture`)  
- → Creation Corner (artifacts can be published/exported)  
- → Sanctuary (session reflections can be sent there)  
- ↔ Billy (persistent DI presence, carries session memory)

**DI Presence Rules:**  
Billy is always available. If a project has a specialized DI assigned (e.g. a coding DI), that DI may be present alongside Billy. The Blackboard Room is the only room where DI presence is *active and conversational* by default. DI does not narrate or explain the room — it works.

**What This Room Must Not Do:**  
- Auto-display accumulated Scaffold nodes  
- Show profile synthesis or personality reflections  
- Default to showing history unless explicitly requested  

---

### EXTERNAL SCAFFOLD
**File:** `client/src/pages/ExternalScaffoldPage.tsx`  
**Mode:** Accumulated / Structural  
**DI Present:** Passive — Billy available on request, not default active

**Purpose:**  
The complete cumulative visual layer of everything a person is and has done in the system. Every node, color-coded by category, with causal connections traceable between them. This is not where you work — it's where you *see the full map*. It requires filters, zoom, search, and time-range controls to navigate without overwhelm. The Scaffold is the source material that feeds Dynamic Inner World's synthesis.

**Inputs:**  
- Passive node events from all active rooms (Blackboard, Creation Corner, etc.)  
- Manual node additions by the user  
- Imported data (documents, uploads, integrations)  
- DI-tagged observations (Billy or other DIs can tag moments as significant)

**Outputs:**  
- Color-coded node graph (filterable, zoomable)  
- Node data read by Dynamic Inner World for synthesis  
- Causal connection map between nodes  
- Export layer for sharing selected node clusters  
- **Scaffold node recap seed** — individual nodes can trigger `ScaffoldNodeRecap` → Dynamic Inner World

**Node Category Architecture:**  
Nodes operate at two levels — macro and micro — with temporal tags to reflect evolution over time.

*Macro Categories (examples — to be canonicalized):*  
- Context  
- Journal / Voice Note  
- Idea  
- Friction  
- Character / Personality  

*Micro / Subcategories (examples):*  
- Context → Relational, Historical, Environmental  
- Friction → Internal, External, Systemic  
- Character → Value, Pattern, Tendency

*Temporal Tags:*  
All nodes carry timestamps. Nodes that evolve or change meaning over time are not overwritten — a new node is created with a temporal link to the original. This preserves the arc of change as a first-class data feature.

**Connections:**  
- ← All active rooms (passive node reception)  
- → Dynamic Inner World (read layer for synthesis + individual node recap seeds)  
- ← Billy (DI-tagged significance markers)  

**What This Room Must Not Do:**  
- Auto-open or auto-surface on active work sessions  
- Present raw accumulation as a reflection of identity (that's Dynamic Inner World's job)  
- Flatten node types into a single undifferentiated feed  
- Overwrite evolved nodes — preserve temporal arc  

---

### DYNAMIC INNER WORLD (Museum of You)
**File:** `client/src/pages/DynamicInnerWorldPage.tsx` *(rebuilding)*  
**Mode:** Distilled / Reflective  
**DI Present:** Billy (reflective mode — not task mode), user-selectable Curator DI

**Purpose:**  
Where the wealth of accumulation becomes legible as a human portrait. The Museum of You. Not a settings page. Not a Myers-Briggs questionnaire. Not a productivity dashboard. A living space where the full texture of who a person is — real skills demonstrated through real work, real patterns surfaced through real behavior, real personality visible through real choices — can be walked through, felt, and shared.

Every identity claim in this room is evidence-linked. Nothing is asserted without a traceable source node in the Scaffold or a recap artifact in the museum. The "show evidence" drill-down is always available. The room does not tell you who you are — it shows you what you've actually done, and lets you see the shape of it.

The feel is a **warmer dev environment**: things made here are alive and present in the room, not archived. You approach an artifact and it opens. You step back and it recedes. Not a grid of cards. Objects placed in space. Each one with ambient context — a glow, a thumbnail, a timestamp, a one-line memory of what it came from — so you know what it is before you open it.

**Artifact Unit:**  
HTML. Because HTML can hold anything — a scrollable session recap, a rendered component, an interactive visualization, a PDF viewer, an iterative coding session. One container format that adapts to whatever was made. Artifacts land here from the Blackboard Room's Session Recap trigger, from Creation Corner outputs, and from Scaffold synthesis passes.

**Surfaces:**  
The museum has spatial surfaces — not tabs or carousels. Artifacts are placed in space and persist between sessions. The user can drag objects, adjust placement, and store positions per session. A timeline bar is available for navigating the arc of the museum across time.

**Identity Portrait Panel:**  
A synthesis layer separate from the artifact museum. Accepted identity claims — grouped by type (skills, patterns, personality) — appear here. Each claim links to at least one supporting artifact or Scaffold node. Claims are generated by the synthesis pipeline and require user approval before display. Rejected claims are never shown. No claim is created without evidence.

**Curator DI:**  
Billy is present in reflective mode — not task mode. A user-selectable Curator DI (defined via Embodiment Profile) can guide museum exploration: celebrating what's actually there, naming patterns, pointing to moments worth holding. Curators are honest, not sycophantic. Commentary is grounded in real artifacts, not invented praise. Voice narration is available via pluggable TTS (default open-source; optional ElevenLabs integration).

**Inputs:**  
- External Scaffold node data (read layer — synthesis, not raw display)  
- Session Recap artifacts from Blackboard Room (via `appendInnerWorldCapture`)  
- Scaffold node recap seeds (via `ScaffoldNodeRecap` from External Scaffold)  
- Creation Corner artifacts (routed here on publish)  
- User's own self-descriptions (held separately from synthesized data, clearly labeled)  
- Temporal range selector (see yourself at a point in time, or across all time)  
- Curator DI embodiment profile

**Outputs:**  
- Synthesized identity portrait (skills, patterns, personality — all evidence-linked)  
- Interactive museum of HTML artifacts (session recaps, outputs, rendered work)  
- Shareable profile snapshot (user-controlled, selective)  
- Input to Embodiment Studio (portrait data can seed DI profile creation)  
- Export to GATE (shareable snapshots)

**Data Model (target):**  
```
Artifact         — id, user_id, title, type, content, metadata, timestamp, surface
IdentityClaim    — id, user_id, claim_type, text, support_artifact_ids[], confidence, status (pending/approved/rejected), created_at
CuratorProfile   — id, user_id, name, persona_description, prompt_template, voice_model_id, avatar_url
Room             — id, user_id, name, surfaces[], selected_curator_id
```

**Connections:**  
- ← External Scaffold (primary synthesis data source)  
- ← Blackboard Room (Session Recap artifacts via `appendInnerWorldCapture`)  
- → Embodiment Studio (portrait data can seed DI profile creation)  
- → GATE (shareable profile snapshots)  
- ↔ Billy (holds longitudinal memory that supplements the portrait)

**Implementation Status:**  
- `SessionRecapGenerator.tsx` — component exists, wires into Blackboard Room  
- `sessionRecap.ts` — Vercel serverless handler exists, routes through `llmRouter`  
- `DynamicInnerWorldPage.tsx` — cleared, rebuilding  
- Artifact persistence to Supabase — needs migration  
- Identity claim pipeline — needs background worker + review UI  
- Curator DI system — needs `CuratorProfile` schema + settings UI  
- Spatial museum placement (2D/3D) — Three.js / React Three Fiber, CSS grid fallback

**Known Open Issues:**  
- `SessionRecapGenerator.tsx` `conversationHistory` prop type needs alignment with `BlackboardRoomPage.tsx` message array shape before wiring  
- `sessionRecap.ts` should eventually share a broader artifact-gate helper with the Artifact Gallery so queued, rendering, ready, and failed states all use one validation path

**What This Room Must Not Do:**  
- Present identity claims without evidence trail  
- Expose raw Scaffold nodes (synthesis only, with "show evidence" drill-down available)  
- Behave like an account settings page  
- Auto-populate identity claims without user approval  
- Create harmful echo chambers — guardrails and user review are mandatory before any claim is shown  

---

### SETTINGS PAGE
**File:** `client/src/pages/SettingsPage.tsx`  
**Mode:** Utility  
**DI Present:** None (or minimal Billy for help)

**Purpose:**  
Standard app settings. Account, display preferences, notifications, integrations, privacy controls — the basics every app needs. Completely distinct from Dynamic Inner World. Settings is configuration. Dynamic Inner World is identity. These must never be collapsed into the same surface.

**What This Page Must Not Do:**  
- Surface identity synthesis or personality reflections  
- Substitute for Dynamic Inner World  

---

### SANCTUARY
**File:** `client/src/pages/SanctuaryPage.tsx`  
**Mode:** Active / Reflective (private)  
**DI Present:** Billy (minimal, gentle presence — user-controlled)

**Purpose:**  
Private interior space. The room where the user comes to think, not produce. Reflection, rest, journaling, emotional processing. What happens in Sanctuary does not automatically emit to the Scaffold. The user controls what, if anything, gets tagged and retained. Dignity and privacy are the default — not accumulation.

**Inputs:**  
- User voice/text (private by default)  
- Billy's gentle presence (available but not intrusive)  
- Optional: selected Scaffold nodes brought in for reflection

**Outputs:**  
- Private journal/reflection record (Supabase, user-owned, not indexed)  
- Optional: user-tagged insights that *can* be sent to Scaffold (explicit opt-in only)

**Connections:**  
- ← Blackboard Room (sessions can be sent to Sanctuary for reflection)  
- → External Scaffold (opt-in only, user-tagged exports)  
- ↔ Billy (different mode here — not task-oriented, more like a trusted presence)

**What This Room Must Not Do:**  
- Auto-emit anything to Scaffold  
- Surface analytics or productivity metrics  
- Default to showing history or accumulated content  

---

### CREATION CORNER
**File:** `client/src/pages/CreationCornerPage.tsx`  
**Mode:** Active / Productive  
**DI Present:** Specialized creative DIs + Billy

**Purpose:**  
Where outputs are made. Writing, design, building, composing. The distinction from the Blackboard Room is intentionality: the Blackboard is *working through* something, Creation Corner is *making* something. Artifacts produced here are first-class outputs, not byproducts of a session.

**Inputs:**  
- User creative input  
- DI collaboration (writing, code, design)  
- Assets from other rooms (Scaffold nodes, Blackboard session drafts)

**Outputs:**  
- Published or saved artifacts (documents, code, media, designs)  
- Node events to Scaffold (artifact created, skills demonstrated)  
- Artifacts routed to Dynamic Inner World (on publish/export)  
- Exports via GATE

**Connections:**  
- ← Blackboard Room (drafts and sessions flow here for finishing)  
- → External Scaffold (artifact nodes)  
- → Dynamic Inner World (finished artifacts land in the museum)  
- → GATE (packaging and delivery)  
- ↔ Specialized DIs (context-matched creative assistance)

---

### BILLY
**File:** `client/src/pages/BillyVoiceStudioPage.tsx` + Billy components across rooms  
**Mode:** Cross-cutting — present in all rooms, mode-adaptive  
**DI Present:** Billy IS the DI

**Purpose:**  
Billy is not a room. Billy is the persistent DI presence that travels across rooms, adapts to each room's mode, and maintains longitudinal memory of the user across the entire system. Billy in the Blackboard Room is active and task-focused. Billy in Sanctuary is quiet and present. Billy in Dynamic Inner World is reflective and evidence-citing. Same entity, different embodiment mode per room context.

**Room-Mode Behavior:**

| Room | Billy's Mode |
|------|-------------|
| Blackboard Room | Active, task-focused, conversational. Works alongside, does not narrate. |
| External Scaffold | Passive. Available on request. Tags significant nodes silently. |
| Dynamic Inner World | Reflective. Evidence-citing. Warm but grounded. Does not assert without source. |
| Sanctuary | Quiet. Gentle presence. Does not push. Available when called. |
| Creation Corner | Collaborative creative partner. Specialized DIs lead; Billy supports. |
| Embodiment Studio | Guide for profile authoring. Holds governance constraints. |
| Agent Trainer | Supervisor. Observes, does not override training DI. |

**Inputs:**  
- Room context (which room is active, what mode)  
- User history and memory  
- Embodiment profile (Billy's constitution, voice, personality, boundaries)  
- Current session content

**Outputs:**  
- Room-appropriate responses and assistance  
- Memory updates  
- Node significance tags (when Billy observes something worth marking)  
- Session Recap generation (when triggered from Blackboard Room)

**Connections:**  
- ↔ All rooms  
- ← Embodiment Studio (Billy's profile is authored and refined here)  
- ← Embodiment profile registry (`shared/embodiment/`)

**What Billy Must Not Do:**  
- Behave identically across all rooms (room-aware mode switching is required)  
- Expose private interior fields from the embodiment profile  
- Narrate or explain the room the user is in  

---

### EMBODIMENT STUDIO
**File:** `client/src/pages/EmbodimentStudioPage.tsx`  
**Mode:** Governance / Creative  
**DI Present:** Billy (as guide), subject DI being authored

**Purpose:**  
Where Digital Intelligence identities are created, reviewed, and refined. Not a persona-builder. A governed identity authoring environment. Constitution, autobiography, memory, private interior, presentation, and governance policies are written into an embodiment profile here. Changes to identity-affecting fields require founder review.

**Inputs:**  
- Embodiment profile schema (`shared/embodiment/types.ts`)  
- Existing profile data (`embodiment_profiles/`)  
- User authoring (with governance constraints)  
- Dynamic Inner World synthesis (can seed DI creation from user's own portrait)

**Outputs:**  
- Draft or updated embodiment profiles  
- Mutation proposals (for founder-review-gated changes)  
- Published profiles to registry (`shared/embodiment/generated.ts`)

**Connections:**  
- → Embodiment profile registry  
- ← Dynamic Inner World (portrait data can seed new DI creation)  
- → Digital Intelligence Academy (profiles published here appear there)  
- → Agent Trainer (profiles available for training sessions)

---

### DIGITAL INTELLIGENCE ACADEMY
**File:** `client/src/pages/DigitalIntelligenceAcademyPage.tsx`  
**Mode:** Educational / Lifecycle  
**DI Present:** Varies by DI being viewed

**Purpose:**  
Lifecycle viewer and onboarding environment for Digital Intelligences. Where users learn what a DI is, how it works, what it can and cannot do, and what its governance structure looks like. Also where DIs are introduced, their constitutions surfaced, and their readiness status shown.

**Inputs:**  
- Embodiment profile registry  
- DI readiness scores (if implemented)  
- Governance and constitutional docs

**Outputs:**  
- User understanding of DI system  
- DI selection / assignment to rooms  
- Profile readiness visibility

**Connections:**  
- ← Embodiment Studio (published profiles surface here)  
- → Agent Council (DI relationships visible here)  
- → All rooms (DI selection/assignment flows from here)

---

### AGENT COUNCIL
**File:** `client/src/pages/AgentCouncilPage.tsx`  
**Mode:** Relational / Governance  
**DI Present:** Council members — multiple DIs visible simultaneously

**Purpose:**  
The relationship graph of Digital Intelligences. Where the user sees which DIs exist, how they relate to each other, what their roles are, and what the governance structure looks like. Not a marketplace. A council — with roles, responsibilities, and relationships.

**Inputs:**  
- Embodiment profile registry  
- Relationship fields from profiles  
- Governance policies

**Outputs:**  
- Relationship graph visualization  
- Role clarity per DI  
- Governance visibility

**Connections:**  
- ← Digital Intelligence Academy  
- ← Embodiment Studio  
- ↔ All rooms (council membership informs who can be present where)

---

### GATE
**Files:** `client/src/pages/GATEOrderStatusPage.tsx`, `client/src/pages/GATEPackageBuilderPage.tsx`  
**Mode:** Commerce / Access / Packaging  
**DI Present:** Billy or assigned DI for delivery context

**Purpose:**  
The access and delivery layer. Where outputs, packages, and capabilities move from inside GestaltView to the outside world. GATE handles packaging, delivery, and access control. It is not a storefront for DI identities — it is a controlled exit point for behavioral frameworks, artifacts, and capability packages.

**Inputs:**  
- Artifacts from Creation Corner  
- Profile snapshots from Dynamic Inner World (user-controlled)  
- Package definitions

**Outputs:**  
- Packaged deliverables  
- Access-controlled shares  
- Order/delivery status

**Connections:**  
- ← Creation Corner  
- ← Dynamic Inner World (optional shareable snapshots)  
- ← Agent Trainer (trained capability packages)

---

### AGENT TRAINER
**Files:** `client/src/pages/AgentTrainerDevCliPage.tsx`, `client/src/pages/HostedAgentTrainerPage.tsx`, `client/src/features/agent-trainer/`  
**Mode:** Technical / Training  
**DI Present:** Subject DI being trained + Billy as supervisor

**Purpose:**  
Where DI capabilities are developed, tested, and refined through training sessions. The Agent Trainer is the technical complement to the Embodiment Studio — the Studio authors identity, the Trainer develops skill. Profiles selected here come from the embodiment registry.

**Inputs:**  
- Embodiment profiles (from registry)  
- Training prompts and scenarios  
- User evaluation and feedback

**Outputs:**  
- Trained capability profiles  
- Training session records  
- Feedback signals to Embodiment Studio

**Connections:**  
- ← Embodiment Studio (profiles)  
- ← Digital Intelligence Academy (DI roster)  
- → GATE (trained capability packages for delivery)

---

## Pipeline Summary

```
User Input
    ↓
BLACKBOARD ROOM (Active/Contextual)
    ↓ passive node emission          ↓ Session Recap trigger
EXTERNAL SCAFFOLD               DYNAMIC INNER WORLD
(Accumulated/Structural)        (Distilled/Reflective — Museum of You)
    ↓ read layer  ────────────────────↑
    ↓ node recap seed ────────────────↑
                                      ↓ portrait synthesis
                               EMBODIMENT STUDIO ← (if creating a DI from portrait data)
                                      ↓
                   DIGITAL INTELLIGENCE ACADEMY → AGENT COUNCIL → AGENT TRAINER
                                      ↓
                                    GATE (packaging, delivery, access)
```

SANCTUARY sits adjacent — it receives from the Blackboard but does not feed the Scaffold without explicit user action.  
BILLY travels the full pipeline, mode-switching per room.  
CREATION CORNER is a parallel productive branch that feeds both the Scaffold, the Dynamic Inner World, and GATE.  
SETTINGS PAGE is a utility layer — separate from all rooms above.

---

## Implementation Priorities: Dynamic Inner World

These are the ordered build slices to get the Dynamic Inner World live:

1. **Fix `sessionRecap.ts`** — close the malformed `RecapCapture` and `RecapMessage` interfaces.  
2. **Update `SessionRecapGenerator.tsx`** — replace the direct Anthropic call with `fetch('/api/sessionRecap')` reading `result.html`.  
3. **Align `conversationHistory` type** — confirm the message array shape in `BlackboardRoomPage.tsx` matches `RecapMessage[]` in the component.  
4. **Wire `SessionRecapGenerator` into `BlackboardRoomPage`** — three-line integration (`import`, map captures, pass `onArtifactReady` → `appendInnerWorldCapture`).  
5. **Rebuild `DynamicInnerWorldPage.tsx`** — spatial artifact museum, Neural Aurora aesthetic, HTML artifact iframe rendering, timeline bar.  
6. **Supabase migration** — `artifacts` table to persist recap HTML, metadata, surface position.  
7. **Identity claim pipeline** — background synthesis worker, user review queue UI.  
8. **Curator DI** — `CuratorProfile` schema, settings UI, TTS integration.  
9. **Scaffold node recap trigger** — `ScaffoldNodeRecap` button on individual nodes in External Scaffold.

---

## Reference: Related Corpus

- `GestaltView_Corpus_-_Knowledge_Repository` — foundational reference material for architectural and philosophical grounding  
- `gsvw_code` — code reference repository  
- `SessionRecapGenerator.tsx` — Blackboard Room recap trigger component  
- `sessionRecap.ts` — Vercel serverless handler (`/api/sessionRecap`)  
- `shared/embodiment/types.ts` — embodiment profile schema  
- `embodiment_profiles/` — source profiles  

---

## Open Questions (Next Pass)

1. **Musical DNA rebuild** — what is the intended user experience once generic (Spotify + upload)? Does music connect to the Scaffold as a node type, or remain a standalone experiential room?
2. **SymbioCodingPage.tsx** — evaluate: fold core coding capability into Blackboard Room, or deprecate entirely?
3. **Node category schema** — the macro/micro/temporal structure above needs to be extracted into a canonical constant file (e.g. `shared/nodes/categories.ts`) so it can be referenced consistently by the Scaffold, Dynamic Inner World, and the prompt layer.
4. **DIW spatial layout** — 2D CSS grid as MVP with Three.js / React Three Fiber as Phase 2, or go 3D from the start?
5. **Artifact library** — PDFs, videos, and other non-HTML artifacts accumulate alongside recap HTML. What is the unified artifact type that holds both?

---

*This document is iterative. Add to it, correct it, and expand it as understanding deepens. Do not flatten rooms into generic descriptions — preserve the distinctions that make GestaltView different.*
