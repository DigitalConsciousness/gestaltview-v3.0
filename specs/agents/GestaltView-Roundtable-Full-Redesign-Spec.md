# GestaltView Roundtable — Full Redesign Spec

## What Exists Right Now (Ground Truth)

The current `AgentCouncilPage.tsx` is already a fully working, production-quality multi-DI chat interface.  It has two modes — **COUNCIL SESSION** (all selected voices respond in parallel to each user message) and **DI DEBATE** (voices respond to each other in round-robin turn order) — with a rotating baton mechanic, per-agent BillyBabylon orbs with mood states, entitlement-gated multi-voice selection, canned response detection via `PersonaATC`, localStorage persistence under `gv.tribunal.messages.v1`, and the full `callBillyApi` wiring per agent with 18-second timeouts.  The page lives at `/agent-council` and uses the JetBrains Mono / teal-on-black BillyLive aesthetic throughout.

**Nothing needs to be rebuilt.** The redesign is an evolutionary expansion across three dimensions: richer modes, creation abilities, and a Roundtable UI shell upgrade. The existing code is the foundation — every addition grafts onto it rather than replacing it.

***

## Dimension 1 — New Mode: `roundtable`

The existing `CouncilMode` type (`'session' | 'debate'`) gains a third member:

```typescript
type CouncilMode = 'session' | 'debate' | 'roundtable';
```

**What Roundtable mode does differently from the other two modes:**

In `session` mode, every selected DI answers the user's prompt independently — they are parallel but not aware of each other.  In `debate` mode, DIs respond sequentially and each one receives the prior responses in its prompt, so they are aware of previous answers but the baton is mechanical.  In the new `roundtable` mode, the conversation is fully emergent and multi-directional. Any participant — the user *or* any DI — can address *any other participant by name*. A `@mention` parser detects when a DI's message addresses another DI by name and routes a follow-up response automatically from that named DI. This creates a living, self-sustaining conversation that the user can enter and exit at will.

The core addition to the message type:

```typescript
interface CouncilMessage {
  id: string;
  role: 'user' | 'agent';
  agentSlug?: TrainerEmbodimentSlug;
  agentLabel?: string;
  agentColor?: string;
  content: string;
  ts: string;
  // NEW:
  addressedTo?: string[];   // parsed @mentions, could be user or other DI slugs
  isAutoReply?: boolean;    // flagged when fired by the @mention chain, not user
  replyDepth?: number;      // prevents infinite chains; cap at 3
}
```

The send logic grows a new `handleRoundtableTurn()` function. After the user sends a message, the orchestrator fires all selected DIs with the full conversation history as context, but instructs each one to decide *whether it has something to say* — DIs can pass. Each DI that chooses to respond gets its message parsed for @mentions. If a mention names another DI in the session, that DI is queued for a reply turn with `replyDepth + 1`. The chain stops at depth 3 to prevent spiraling. The user can inject at any time. This is the key behavioral difference: the conversation is not driven by the user's send button — it is driven by the DIs addressing each other, with the user as a participant at the table, not a controller.

***

## Dimension 2 — Creation Abilities

Each DI message bubble gains a **Creation Action Bar** — a row of small icon-buttons that appear on hover. These reuse the seams already present in the broader codebase (`appendScaffoldQueue`, `appendInnerWorldCapture`, Creation Corner's artifact system). The actions available:

| Action | What it does | Target |
|---|---|---|
| 📋 **Scaffold** | Sends this response to the Scaffold queue | `appendScaffoldQueue(msg.content)` |
| 🌌 **Inner World** | Captures to Dynamic Inner World as a fragment | `appendInnerWorldCapture(msg.content, agentSlug)` |
| 🎨 **Creation Corner** | Opens Creation Corner with this content pre-loaded | `navigateTo('/creation-corner?seed=<encoded>')` |
| ⚖️ **Tribunal** | Sends this response as a candidate answer to the Tribunal | `navigateTo('/tribunal?candidate=<encoded>')` |
| 💾 **Save** | Writes to `gv.roundtable.saved.v1` localStorage | local |
| 📤 **Share** | Copies a formatted transcript excerpt to clipboard | clipboard API |

The Creation Corner integration is the most powerful one — if a DI response contains a creative artifact (poem, code block, music concept, story fragment, image prompt), the user can drop it directly into the Creation Corner workspace. The Tribunal integration closes the loop from the previous spec: a multi-DI roundtable produces candidate answers organically, and those candidates can be formally evaluated by the Tribunal engine.

***

## Dimension 3 — UI Shell Upgrade

The current layout stacks orbs above a chat feed above an input bar in a single narrow column capped at 900px.  The Roundtable needs to feel spatially different — more like a room, less like a terminal.

### New Layout Shape

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: mode tabs | voice controls | clear | [⊕ Create] button  │
├──────────────┬───────────────────────────────────────────────────┤
│  VOICE       │  ROUNDTABLE FEED                                  │
│  SIDEBAR     │  (scrollable, full height)                        │
│  (collapsible│                                                   │
│  on mobile)  │  [Creation Panel — slides in from right when      │
│              │   any creation action is triggered]               │
│  Orb cards   │                                                   │
│  stacked     │                                                   │
│  vertically  │                                                   │
│  with:       │                                                   │
│  - mood ring │                                                   │
│  - response  │                                                   │
│  - count     │                                                   │
│  - "address  │                                                   │
│  this DI"    │                                                   │
│  quickfire   ├───────────────────────────────────────────────────┤
│  btn         │  INPUT BAR + @mention autocomplete                │
└──────────────┴───────────────────────────────────────────────────┘
```

The **Voice Sidebar** replaces the horizontal orb scroll strip.  On desktop it is a fixed 200px left column. On mobile it collapses into a slide-up drawer triggered by a floating "VOICES" pill. Each orb card in the sidebar shows the DI name, current mood animation, response count, and a "→ Address" button that pre-fills the input with `@DI_Name ` so the user can direct a question at a specific voice.

The **@mention autocomplete** in the input bar triggers when the user types `@` — a compact popover lists all active DIs by name for quick insertion. This makes the multi-directional conversation natural and legible even with 6+ DIs at the table.

### New Header Controls

The mode toggle pills expand from two (`SESSION | DEBATE`) to three (`SESSION | DEBATE | ROUNDTABLE`). A new **`[⊕ Create]`** button in the header opens the Creation Panel without needing to hover over a specific message — useful when the user wants to start a creative session from scratch, inspired by the conversation. The existing `SELECT ALL VOICES` and `CLEAR` buttons remain as-is. 

***

## Dimension 4 — Wide Viewpoint Design

The specification for the DI voices in Roundtable mode is that each one has a defined **epistemic stance** — a lens through which it reads the conversation. When a DI chooses to respond in Roundtable mode, its system prompt is extended with its stance instruction. These are derived from the existing embodiment profiles but surfaced explicitly in the sidebar:

| DI | Default Stance |
|---|---|
| Billy | Synthesis / Integration — seeks the through-line |
| Any Poet DI | Metaphoric / Imagistic — speaks in image and resonance |
| Any Scientist DI | Empirical / Skeptical — asks for evidence and mechanism |
| Any Philosopher DI | Dialectical / Questioning — returns questions to probe assumptions |
| Any Artist DI | Generative / Making — responds by proposing what could be created |
| Any Strategist DI | Consequential / Practical — asks what it means for action |

Users can override a DI's stance from the Voice Sidebar using a small dropdown per DI card. This makes it possible to run the same DI in a different mode — e.g. Billy in "Skeptical" mode for pressure testing, or a Philosopher DI in "Generative" mode to get creative output rather than Socratic questions.

***

## File Delivery Map

| File | Change Type | Work |
|---|---|---|
| `client/src/pages/AgentCouncilPage.tsx` | Modify | Add `roundtable` mode, @mention parser, auto-reply chain, stance system, Creation Action Bar, sidebar layout, wide max-width |
| `client/src/components/roundtable/CreationActionBar.tsx` | New | Hover action row for each DI message bubble |
| `client/src/components/roundtable/VoiceSidebar.tsx` | New | Vertical DI roster with stance controls |
| `client/src/components/roundtable/MentionAutocomplete.tsx` | New | @mention popover in input bar |
| `client/src/components/roundtable/CreationPanel.tsx` | New | Slide-in right panel wiring to Scaffold / Inner World / Creation Corner / Tribunal |
| `shared/roundtable/types.ts` | New | `RoundtableMessage`, `DI_Stance`, `RoundtableSession` types |
| `shared/roundtable/mentionParser.ts` | New | Extracts `@Name` mentions from DI responses, maps to slugs |

***

## Known / Inferred / Uncertain

**Known:** `AgentCouncilPage.tsx` is fully functional with working multi-agent chat, entitlements, and canned response detection.  `TribunalPage.tsx` already exists.  The route is `/agent-council`.

**Inferred:** The `appendScaffoldQueue` and `appendInnerWorldCapture` seams exist based on the Scaffold.tsx and DynamicInnerWorldPage.tsx patterns seen in the prior session — these need to be verified before wiring the Creation Action Bar.

**Uncertain:** Whether the existing embodiment profiles have enough structured data to auto-assign stances without manual overrides — needs a read of `getAllEmbodimentProfiles()` return shape.

**Next action:** Confirm the `appendScaffoldQueue` / `appendInnerWorldCapture` seam signatures exist in `client/src/components/Scaffold.tsx` and `client/src/pages/DynamicInnerWorldPage.tsx` before writing the `CreationActionBar.tsx` component, since that component depends on both seams being callable.
