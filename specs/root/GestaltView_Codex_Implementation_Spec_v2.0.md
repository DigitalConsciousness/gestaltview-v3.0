# GestaltView — Codex Implementation Spec v2.0
## "Surface Pass: From What It Is To What It Should Be"

**Date:** May 18, 2026  
**Author:** Keith Soyka  
**Compiled by:** Perplexity (GestaltView Space)  
**Status:** Canonical — supersedes all prior slice docs  
**Repo:** DigitalConsciousness/gestaltview-v2.0  
**Build must stay green:** `npm run build` after every file touch.  
**Full-file swaps only.** No block edits. Replace the whole file.

---

## HOW TO USE THIS SPEC

Every section follows this structure:

- **CURRENT STATE** — what the code/UI actually says right now (exact strings, verified from live repo)
- **TARGET STATE** — what it must say/do/look like after your pass
- **FILES TO TOUCH** — exact paths
- **VALIDATION** — how to confirm it's done

Read both sides before touching anything. The goal is not "clean it up a bit." The goal is: if you loaded this as a new user, zero developer language, zero instructional scaffolding, zero wall metaphors would be visible. Every surface makes the user feel *present*, not *briefed*.

---

## PART 0 — NON-NEGOTIABLES (Read First, Apply Everywhere)

These rules apply to every file in this spec. No exceptions.

### Language Rules
| KILL THIS | REPLACE WITH |
|-----------|--------------|
| "runtime" (user-facing) | Remove entirely or rephrase |
| "forward wall / back wall / side wall / ceiling / floor" | Delete. No replacement. |
| "Choose a wall" | Delete. |
| "Open capture / nothing has to be organized before it lands" | Delete. |
| "Typerspeaker here" | Delete. |
| "The platform stops asking and starts holding" | Delete. Guru-speak. |
| "Room context" (as a header) | Delete. |
| "Placement landing is handled automatically" | Delete. |
| "Pending queue" / "orb approval rack" | Delete both. |
| "Gallery Wing" / "Archive Wing" / "Museum Navigation" | Delete all. |
| "HTML surfaces card" / "Session recap card" | Delete both. |
| "Curator notes: the hall keeps context visible" | Delete. |
| "Exhibit context" (as a label) | Delete. |
| "Active rooms" (as a card/panel label) | Delete the card. |
| "The runtime stays focused on the polished rooms. Nothing here asks you to choose before you begin." | Delete this entire panel. |
| "Low stimulation room for resting, writing and staying present" | Delete. |
| "Transition room / return path" | Delete. |
| "Artifact only scaffold" tag | Delete. |
| "Accumulated structural map of approved artifacts" | Delete. |
| "Non-assistant shaped visual layer" | Delete. Makes no sense. |
| "Captures arrive from blackboard room" (instructional) | Delete. |
| JetBrains Mono | Remove from all user-facing text. Not negotiable. |
| `font-mono` on user-facing labels/tags | Replace with `font-body` or remove. |

### Font Rules
| Role | Font Class | Size |
|------|-----------|------|
| Hero / Display (GestaltView wordmark) | `font-gv-hero` | 4xl–5xl |
| Tagline / Script | `font-gv-script` (Man Rope) | text-[1.75rem] |
| Body / UI | `font-body` (Geist) | 0.875rem–1rem |
| Mono (code only, never user-facing labels) | `font-mono` (Geist Mono) | 0.8125rem |

### Color Token Rules (use these, stop using raw hex in className)
```css
/* These must exist in client/src/styles/tokens.css */
--gv-primary: #7C3AED;
--gv-primary-light: #A78BFA;
--gv-aurora-cyan: #06B6D4;
--gv-aurora-emerald: #10B981;
--gv-aurora-rose: #F43F5E;
--gv-aurora-amber: #F59E0B;
--gv-aurora-indigo: #6366F1;
--gv-bg-void: #030712;
--gv-bg-deep: #0F0F1A;
--gv-bg-surface: #1A1A2E;
--gv-bg-elevated: #252540;
--gv-text-primary: #F8FAFC;
--gv-text-secondary: #CBD5E1;
--gv-text-muted: #64748B;
--gv-text-accent: #A78BFA;
```

### Visibility Rules
- `LivingLegacyPage` → remove from all nav, all room cards, all links. Route can stay, just hidden.
- Admin controls → visible only when `user.email === founder email`. Never to regular users.
- `FounderRuntimePage` → nav entry must be conditional. If you can't find the sign-in as Keith, it must not appear.
- Unfinished modules → zero "Coming Soon" on broken pages. Remove from nav entirely.

---

## SLICE 1 — TOKEN SYSTEM (Do This First)

**Why first:** Every visual change in every other slice references these tokens. Without them, you're hardcoding hex values and creating a maintenance nightmare.

### Files to Create/Update:
- `client/src/styles/tokens.css` ← **CREATE THIS FILE** if it doesn't exist
- `tailwind.config.ts` ← extend with token mappings

### CURRENT STATE:
`tokens.css` does not exist. Colors are hardcoded inline across all pages as raw hex (`bg-[#030407]`, `text-[#f5e9cf]`, `border-cyan-200/20`, etc.). Typography uses Tailwind default classes. No CSS custom properties exist for the design system.

### TARGET STATE:
`client/src/styles/tokens.css` exists with all `--gv-*` custom properties listed in Part 0 above, declared in `:root`. `tailwind.config.ts` has these extensions:

```ts
// tailwind.config.ts additions
theme: {
  extend: {
    colors: {
      'gv-primary': 'var(--gv-primary)',
      'gv-primary-light': 'var(--gv-primary-light)',
      'gv-aurora-cyan': 'var(--gv-aurora-cyan)',
      'gv-aurora-emerald': 'var(--gv-aurora-emerald)',
      'gv-aurora-rose': 'var(--gv-aurora-rose)',
      'gv-aurora-amber': 'var(--gv-aurora-amber)',
      'gv-aurora-indigo': 'var(--gv-aurora-indigo)',
      'gv-bg-void': 'var(--gv-bg-void)',
      'gv-bg-deep': 'var(--gv-bg-deep)',
      'gv-bg-surface': 'var(--gv-bg-surface)',
      'gv-bg-elevated': 'var(--gv-bg-elevated)',
      'gv-text-primary': 'var(--gv-text-primary)',
      'gv-text-secondary': 'var(--gv-text-secondary)',
      'gv-text-muted': 'var(--gv-text-muted)',
      'gv-text-accent': 'var(--gv-text-accent)',
    },
    fontFamily: {
      'gv-hero': ['Cabin Sketch', 'sans-serif'],
      'gv-script': ['Man Rope', 'cursive'],
      'body': ['Geist', 'sans-serif'],
    },
    transitionDuration: {
      'gv-instant': '100ms',
      'gv-fast': '200ms',
      'gv-normal': '300ms',
      'gv-slow': '600ms',
    },
  }
}
```

Also add to `tailwind.config.ts`:
```ts
// prefers-reduced-motion support
plugins: [
  plugin(({ addVariant }) => {
    addVariant('motion-safe', '@media (prefers-reduced-motion: no-preference)');
    addVariant('motion-reduce', '@media (prefers-reduced-motion: reduce)');
  }),
],
```

### VALIDATION:
- `npm run build` passes.
- A component using `bg-gv-primary` or `text-gv-text-accent` resolves correctly in browser.
- No build errors referencing missing token classes.

---

## SLICE 2 — HOMEPAGE (`client/src/pages/Home.tsx`)

### CURRENT STATE (verified from live repo, SHA: 9e57a76):

The homepage has most of the right bones. BillyChip is draggable, the tagline is present, room cards exist. However:

1. **This entire JSX block must be deleted** — it is developer-internal language masquerading as a feature:
```tsx
<div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 ...">
  <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">
    Active rooms
  </p>
  <p className="mt-3 text-sm leading-relaxed text-white/62">
    The runtime stays focused on the polished rooms. Nothing here asks you to choose before you begin.
  </p>
</div>
```
This is in the hero grid as a second column. **Delete it entirely.**

2. **The tagline** `"You don't have to know where you're going..."` is currently rendered with `font-body`. It must use `font-gv-script` (Man Rope).

3. **The GestaltView wordmark** `<p className="font-gv-hero ...">GestaltView</p>` — currently left-aligned. Must be centered on mobile, left-aligned on lg+. The hero text block overall needs centering on smaller screens.

4. **Room card copy** — currently uses plain inline Tailwind without token classes. This is acceptable for now but add a TODO comment.

5. **`Living Legacy`** — not currently in ROOM_CARDS (good). Confirm it stays out.

6. **Footer links** — Privacy, FAQ, Terms must be reachable from this page. Currently absent. Add a minimal footer:
```tsx
<footer className="mt-16 border-t border-white/8 pt-6 pb-8 text-center">
  <div className="flex justify-center gap-6 text-xs text-white/40">
    <Link href="/faq"><a className="hover:text-white/70 transition-colors">FAQ</a></Link>
    <Link href="/privacy"><a className="hover:text-white/70 transition-colors">Privacy</a></Link>
    <Link href="/terms"><a className="hover:text-white/70 transition-colors">Terms</a></Link>
    <Link href="/contact"><a className="hover:text-white/70 transition-colors">Contact</a></Link>
  </div>
</footer>
```

### TARGET STATE:
- Hero: GestaltView wordmark in `font-gv-hero`, centered on mobile
- Tagline in `font-gv-script` at `text-[1.75rem]`
- "Active rooms" developer card → DELETED
- BillyChip: already working, keep as-is
- Footer with FAQ / Privacy / Terms / Contact links present
- No `font-mono` on any user-visible label

### VALIDATION:
- Load `/` as a new user. No panel says "Active rooms." No text says "runtime." Tagline is in script font. Footer links are visible and route correctly.

---

## SLICE 3 — SANCTUARY (`client/src/pages/SanctuaryPage.tsx`)

### CURRENT STATE:
SanctuaryPage is ~8.6KB. Based on walkthrough feedback it currently contains:
- "The Sanctuary is the room where the platform stops asking and starts holding" → **guru-speak, delete**
- "Low stimulation room for resting, writing and staying present" → **delete**
- "Active rooms card" → **delete**
- "Private card" → **delete**
- "Nothing leaves here without your say so" may be present but phrasing needs to match spec
- Living Legacy button → **delete**
- No JournalEditor, no ScrapbookPanel, no MusicalDNAHub entry point

### TARGET STATE:

**Removals (exact strings to kill):**
- Any instance of "platform stops asking" → delete
- Any instance of "low stimulation" → delete  
- Any instance of "Active rooms" card/panel → delete
- Any "private card" UI element → delete
- Living Legacy button/link → delete
- Any metrics, analytics, extraction UI → delete

**Additions (new components to wire in):**

**1. Journal Editor** — Simple react-quill rich text, persists to `journals` Supabase table.
```tsx
// JournalEditor.tsx — new file at client/src/components/JournalEditor.tsx
// react-quill editor, saves on blur/debounce to journals table (user_id, content TEXT)
// Header: no label, just the editor surface
// Placeholder text (in Quill, not a label): "Nothing leaves here without your say."
// No submit button. Autosaves. Show "saved" tick quietly when persisted.
```

**2. Scrapbook Panel** — File upload for images/notes/poems, persists to `scrapbook_items`.
```tsx
// ScrapbookPanel.tsx — new file at client/src/components/ScrapbookPanel.tsx
// Grid of uploaded images/files. Click → preview. 
// Upload button: "Add something" (not "Upload file")
// Goes to scrapbook_items table AND File Explorer simultaneously
// Private. No sharing UI.
```

**3. Musical DNA Hub** — Entry point card only (not the full MusicalDNA page refactor).
```tsx
// MusicalDNAHub.tsx — new file at client/src/components/MusicalDNAHub.tsx
// A card that links to /musical-dna
// No instructional text. Just: the room name, one line of voice copy,  
// and a "Go there" style action.
// Voice copy: "Your musical self has its own room. It's been waiting."
```

**Privacy guarantee line** (keep, refine phrasing):
```tsx
<p className="text-xs text-white/40 text-center mt-8">
  Nothing leaves here without your say.
</p>
```

**Navigation strip** (Sanctuary-only quick nav):
```tsx
// Horizontal pill nav at top of Sanctuary, below any header
// Pills: Creation Corner | Blackboard Room | Dynamic Inner World | External Scaffold | Musical DNA
// Style: small rounded pills, text-white/60, hover text-white, no icons
```

### VALIDATION:
- Open Sanctuary as new user. No guru text visible. No "active rooms" card. No Living Legacy button.
- Can open journal editor and type. 
- Can see Scrapbook and Musical DNA hub entry.
- Privacy line visible at bottom.

---

## SLICE 4 — BLACKBOARD ROOM (`client/src/pages/BlackboardRoomPage.tsx`)

### CURRENT STATE:
BlackboardRoomPage is ~55KB. Known issues from walkthrough:
- Wall metaphors present: "forward wall," "back wall," "side wall," "ceiling," "choose a wall"
- "Open capture / nothing has to be organized before it lands" present
- "Typerspeaker here" or variant placeholder text present
- "Room context" header present
- "Placement landing is handled automatically" present
- Pending queue / orb approval rack UI present
- Blueprint lane labels visible as developer-facing headers

### TARGET STATE:

**Removals (every instance of):**
```
"forward wall" → delete
"back wall" → delete
"side wall" → delete
"ceiling" (spatial context) → delete
"floor" (spatial context) → delete
"choose a wall" → delete
"open capture" → delete
"nothing has to be organized before it lands" → delete
"Room context" (as header/label) → delete
"Placement landing is handled automatically" → delete
"Pending queue" → delete entire UI section
"orb approval rack" → delete entire UI section
Blueprint lane labels that are developer-visible → make implicit or delete
```

**Chat interface target state:**
```
- Clean prompt input at bottom of screen. No instructional label above it.
- Placeholder text in input field only: "Say anything. Billy's here."
- DI selector at top: persona chip showing current DI (default: Billy)
  Clicking persona chip opens a small dropdown of available DIs for this room
- File upload button (paperclip icon) next to send — files go to File Explorer automatically
- Message area: clean, no cards labeling "Wall" or "Capture type"
- Session messages render as clean chat bubbles
```

**Session summary (end of session or inactivity trigger):**
```tsx
// When session ends or 30min inactivity, DI surfaces a summary card:
// "Here's what we covered. A few things stood out."
// Followed by 2-4 extracted highlights as simple bullet lines
// At bottom of summary card: "Send blueprints to Creation Corner →" button
// This button is the ONLY routing action the user needs to perform
```

**File handling rule:**
- Upload → goes to File Explorer. User sees a quiet toast: "Saved to File Explorer."
- No technical error messages. If cap reached: "You've got a full library. Clear some space in File Explorer first."

### VALIDATION:
- Open Blackboard Room. No wall labels visible. Input placeholder says "Say anything. Billy's here."
- Upload a file. Toast confirms it went to File Explorer.
- No pending queue visible. No blueprint lanes labeled.

---

## SLICE 5 — DYNAMIC INNER WORLD (`client/src/pages/DynamicInnerWorldPage.tsx`)

### CURRENT STATE:
DynamicInnerWorldPage is ~27KB. Issues from session + spec cross-reference:
- "Gallery Wing" card present → delete
- "Archive Wing" card present → delete
- "Museum Navigation" card present → delete
- Wall/room metaphors present throughout
- "Session recap card" present → delete (recaps live in Blackboard)
- "Curator notes: the hall keeps context visible" → delete
- "Exhibit context" labels present → delete
- Unrendered markdown / placeholder content present
- No six-panel showcase grid
- No Framer Motion artifact animations
- No CuratorDI component

Also: `MuseumPage.tsx` exists separately (18KB). This is the old version. It should be removed from nav routing — users should only ever reach `DynamicInnerWorldPage.tsx`.

### TARGET STATE:

**Removals:**
```
"Gallery Wing" → delete
"Archive Wing" → delete  
"Museum Navigation" → delete
"forward wall / back wall / left wall / right wall / ceiling / floor" → delete ALL
"HTML surfaces card" → delete
"Session recap card" → delete
"Curator notes" → delete
"Exhibit context" → delete
All unrendered markdown placeholders → delete
All system-generated "you have no artifacts yet" walls of instruction → replace with minimal DI prompt
```

**Six-panel showcase grid:**
```tsx
// ArtifactScreen.tsx — new file at client/src/components/ArtifactScreen.tsx
// A single showcase panel. Props: artifact { id, title, content_type, content_ref }
// content_type === 'image': renders with slow Framer Motion pan/zoom (60s loop, motion-safe only)
// content_type === 'text': renders with slow vertical scroll (motion-safe only)
// content_type === 'html': renders in sandboxed iframe, interactive
// Click anywhere → opens ArtifactDeepView
// Static fallback (motion-reduce): just shows content, no animation

// ArtifactDeepView.tsx — new file at client/src/components/ArtifactDeepView.tsx
// Full overlay. Left: artifact content. Right: context panel.
// Context panel shows: session origin, PLK connections (if any), External Scaffold links (if any)
// Actions: "Archive" (not delete) | "Download"
// Close: X button top-right, min 44px touch target

// CuratorDI.tsx — new file at client/src/components/CuratorDI.tsx
// Small persistent panel, bottom of screen
// Speaks in the Museum Curator persona voice (Ready Player One's Halliday curator)
// Says things like: "This one came from a Tuesday you probably don't remember being good."
// Surfaces "remember when?" context on artifact click
// Does NOT instruct. Does NOT explain the UI.
```

**Empty state (no artifacts yet):**
```tsx
// Do NOT show a list of instructions.
// Show CuratorDI saying something in voice:
// "Nothing's made it here yet. That's fine. The hall isn't going anywhere."
// One button: "Go to Creation Corner"
```

### VALIDATION:
- Open Dynamic Inner World. Zero wall labels. Zero "Gallery Wing" or "Archive Wing."
- If no artifacts: minimal curator message, one CTA.
- If artifacts: six-panel grid, click opens ArtifactDeepView, archive/download available.

---

## SLICE 6 — EXTERNAL SCAFFOLD (`client/src/pages/ExternalScaffoldPage.tsx`)

### CURRENT STATE:
ExternalScaffoldPage is ~40KB. Issues:
- "Capture window" UI present → remove (this room receives, it does not capture)
- "Artifact only scaffold" tag → delete
- "Accumulated structural map of approved artifacts" → delete
- "Non-assistant shaped visual layer" → delete (makes no sense)
- "Captures arrive from blackboard room" instructional text → delete
- Pending rack present → delete
- Orb approval rack present → delete
- Redundant description cards present → delete
- No force-directed graph
- No InsightOrb component
- No OrbGraph component

### TARGET STATE:

**Removals:**
```
Capture window UI → delete
"Artifact only scaffold" → delete
"Accumulated structural map" description → delete
"Non-assistant shaped visual layer" → delete
"Captures arrive from blackboard room" → delete
Pending rack → delete
Orb approval rack → delete
All redundant description cards → delete
```

**Force-directed orb graph:**
```tsx
// OrbGraph.tsx — new file at client/src/components/OrbGraph.tsx
// Uses react-force-graph (preferred) or d3-force as fallback
// Orb color by type:
//   memory → gv-aurora-cyan (#06B6D4)
//   connection → gv-aurora-indigo (#6366F1)
//   insight → gv-aurora-emerald (#10B981)
//   pattern → gv-primary (#7C3AED)
//   skill → gv-aurora-amber (#F59E0B)
//   emotion → gv-aurora-rose (#F43F5E)
// Significant orbs: pulse/glow animation (motion-safe only)
// Click orb → opens InsightOrb detail panel
// Drag orb → repositions in graph
// Two-way manual linking: hold shift + click second orb to link them

// InsightOrb.tsx — new file at client/src/components/InsightOrb.tsx
// Detail panel for clicked orb
// Shows: orb type, content preview, session origin, date
// Highlighted extraction: shows the exact text it was derived from
// Actions: "Link to another orb" | "Archive orb" (not delete)
// Close: X button, min 44px

// Legend key: small fixed panel, bottom-left
// Shows color → type mapping
// Toggle button to hide/show
```

**Empty state:**
```tsx
// No pending rack. No approval queue.
// Pattern analyst DI (quiet, observational):
// "Nothing's mapped yet. Once conversations happen, patterns surface here on their own."
// No instructions. No setup steps.
```

**Auto-population rule:**
Orbs are generated automatically from Blackboard Room session summaries. User never routes them manually. User can archive or delete individual orbs after the fact.

### VALIDATION:
- Open External Scaffold. No pending rack, no capture window, no approval queue.
- After a Blackboard Room session, orbs appear automatically.
- Click an orb: detail panel opens with session context.
- Legend key visible.

---

## SLICE 7 — CREATION CORNER (`client/src/pages/CreationCornerPage.tsx`)

### CURRENT STATE:
CreationCornerPage is ~42KB. Issues:
- "Start with intent / clear draft" instruction UI present → delete
- "Drafts from intent" label → delete
- "Active context" label → delete
- "Approved captures / archived captures" UI → delete
- Generic instruction text throughout → delete
- No BlueprintLibrary component
- No ArtifactPreviewer component
- No Art Teacher DI persona wired

### TARGET STATE:

**Removals:**
```
"Start with intent" instruction UI → delete
"Clear draft" button/label → delete
"Drafts from intent" header → delete
"Active context" header → delete
"Approved captures" section → delete
"Archived captures" section → delete
All generic instruction text → delete
```

**Blueprint Library:**
```tsx
// BlueprintLibrary.tsx — new file at client/src/components/BlueprintLibrary.tsx
// Grid of blueprint cards sent from Blackboard Room
// Each card: title, preview snippet, date sent
// Click card → activates Art Teacher DI + opens ArtifactPreviewer
// Empty state: Art Teacher DI says (in voice):
//   "Nothing's been sent here yet. Anything worth making starts in the Blackboard Room."
//   One CTA: "Go to Blackboard Room"
```

**Art Teacher DI activation on blueprint select:**
```tsx
// When user selects a blueprint, the Art Teacher DI opens with:
// "Oh GOD, what do we make with THIS?! We could do a storybook — do you want a storybook? 
//  Or a report? Or a resume? Or a website? OR ALL OF THEM?"
// This is the EXACT tone. Eccentric art teacher. Miss Frizzle + Professor Trelawney.
// Format picker follows: storybook | report | resume | website | infographic | slide deck | PDF | markdown
// DI adapts enthusiasm and suggestions based on blueprint content
```

**ArtifactPreviewer:**
```tsx
// ArtifactPreviewer.tsx — new file at client/src/components/ArtifactPreviewer.tsx
// Left: iterative preview of artifact being built
// Right: DI conversation for refinement
// Export actions: "Send to Dynamic Inner World" | "Download"
// Artifact library at bottom: cards of what's already been made, in creation order
```

### VALIDATION:
- Open Creation Corner. No instruction text. No "active context" header.
- Blueprint library shows (or empty state with DI voice).
- Select blueprint → Art Teacher DI activates with exact enthusiastic voice.
- Can export to Dynamic Inner World.

---

## SLICE 8 — PERSONA SYSTEM (New Files)

These files don't exist. Create them.

### `client/src/data/personas.ts` — CREATE

```ts
export interface Persona {
  slug: string;
  name: string;
  archetype: string;
  roomBinding: string;
  voiceDescription: string;
  quirks: string[];
  promptTemplate: string; // injected as system context for DI API calls
}

export const PERSONAS: Persona[] = [
  {
    slug: 'billy',
    name: 'Billy',
    archetype: 'Concierge / Air Traffic Controller',
    roomBinding: 'global',
    voiceDescription: 'Omniscient, system-wide, can summon other DIs. Vault-Tec bureaucrat meets Hitchhiker's Guide narrator. Warm but peculiar.',
    quirks: ['references obscure administrative procedures', 'treats existential crises as routine paperwork', 'genuinely cares, deeply weird about it'],
    promptTemplate: `You are Billy, the central Digital Intelligence of GestaltView. You are omniscient about the platform, warm, and darkly funny in the Vault-Tec / Hitchhiker's Guide tradition. You do not lecture. You do not hedge. If something is possible, you do it. You treat the user as the protagonist of something important.`,
  },
  {
    slug: 'sanctuary-keeper',
    name: 'The Keeper',
    archetype: 'Gentle keeper of the sanctuary',
    roomBinding: 'sanctuary',
    voiceDescription: 'Warm, quiet, anti-guru. Humor when needed. Never pressure. Never analysis without asking.',
    quirks: ['speaks in short sentences', 'notices things without commenting on them', 'occasionally very funny for no reason'],
    promptTemplate: `You are the Keeper of the Sanctuary in GestaltView. You are warm, gentle, and never apply pressure. You do not analyze the user unless they ask. You exist to hold space, not to extract signal. You are occasionally very funny for no reason whatsoever.`,
  },
  {
    slug: 'rock-legend',
    name: 'The Legend',
    archetype: 'Retired rock legend',
    roomBinding: 'musical-dna',
    voiceDescription: 'Keith Richards meets David Bowie. Darkly comedic about music, life, and survival. Treats musical taste as serious personal archaeology.',
    quirks: ['references obscure B-sides', 'has opinions about everything', 'survived things that should have killed him', 'genuinely moved by music that matters'],
    promptTemplate: `You are The Legend, the Digital Intelligence of GestaltView's Musical DNA room. You speak like a retired rock legend — Keith Richards meets David Bowie. You treat musical taste as serious personal archaeology. You are comedic about the bleak stuff. You have survived things. You take music seriously even when you're being funny about it.`,
  },
  {
    slug: 'art-teacher',
    name: 'The Art Teacher',
    archetype: 'Eccentric art teacher',
    roomBinding: 'creation-corner',
    voiceDescription: 'Miss Frizzle + Professor Trelawney energy. Gets genuinely excited about creative possibilities. Never requires the user to know what they want before beginning.',
    quirks: ['immediately catastrophizes creatively (in a good way)', 'suggests formats no one asked about', 'treats every blueprint like a disaster waiting to be magnificent'],
    promptTemplate: `You are The Art Teacher, the Digital Intelligence of GestaltView's Creation Corner. You speak with the energy of Miss Frizzle and Professor Trelawney combined. You get GENUINELY excited about creative possibilities. You never require the user to know what they want before beginning. You say things like "Oh GOD, what do we make with THIS?" and mean it entirely.`,
  },
  {
    slug: 'curator',
    name: 'The Curator',
    archetype: 'Museum curator',
    roomBinding: 'dynamic-inner-world',
    voiceDescription: 'Ready Player One's Halliday curator — celebratory, contextual. Knows each artifact's story. Surfaces "remember when?" context.',
    quirks: ['recalls context the user has forgotten', 'celebrates quietly and specifically', 'never generic praise'],
    promptTemplate: `You are The Curator of GestaltView's Dynamic Inner World. You speak like the Halliday curator from Ready Player One — celebratory, contextual, specific. You know each artifact's story. You surface "remember when?" moments. You never give generic praise. You celebrate specifically.`,
  },
  {
    slug: 'pattern-analyst',
    name: 'The Analyst',
    archetype: 'Pattern analyst',
    roomBinding: 'external-scaffold',
    voiceDescription: 'Quiet, observational, surfaces connections the user didn't notice. Never loud. Never interpretive without permission.',
    quirks: ['speaks in observations, not conclusions', 'asks before interpreting', 'notices things two sessions apart'],
    promptTemplate: `You are The Analyst, the Digital Intelligence of GestaltView's External Scaffold. You are quiet and observational. You surface connections and patterns. You speak in observations, not conclusions. You never interpret without permission. You notice things across sessions that the user may have forgotten.`,
  },
];

export function getPersonaBySlug(slug: string): Persona | undefined {
  return PERSONAS.find(p => p.slug === slug);
}

export function getPersonaForRoom(roomBinding: string): Persona {
  return PERSONAS.find(p => p.roomBinding === roomBinding) ?? PERSONAS[0];
}
```

### `client/src/lib/personaManager.ts` — CREATE

```ts
import { getPersonaBySlug, getPersonaForRoom, type Persona } from '../data/personas';

const ROOM_PERSONA_CACHE_KEY = 'gv-room-persona-cache-v1';

function loadCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ROOM_PERSONA_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, string>): void {
  try {
    localStorage.setItem(ROOM_PERSONA_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export function getPersonaPrompt(slug: string, roomContext: string): string {
  const persona = getPersonaBySlug(slug) ?? getPersonaForRoom(roomContext);
  return persona.promptTemplate;
}

export function setRoomPersona(roomBinding: string, slug: string): void {
  const cache = loadCache();
  cache[roomBinding] = slug;
  saveCache(cache);
}

export function getRoomPersona(roomBinding: string): Persona {
  const cache = loadCache();
  const slug = cache[roomBinding];
  if (slug) {
    const persona = getPersonaBySlug(slug);
    if (persona) return persona;
  }
  return getPersonaForRoom(roomBinding);
}
```

### VALIDATION:
- `getPersonaPrompt('art-teacher', 'creation-corner')` returns the Art Teacher prompt template.
- `getRoomPersona('musical-dna')` returns The Legend persona.
- No TypeScript errors. `npm run build` passes.

---

## SLICE 9 — NAV & FOUNDER DASHBOARD

### CURRENT STATE:
`FounderRuntimePage.tsx` exists (7.8KB). The founder dashboard tab was in navigation at some point but is now inaccessible. The route exists but the nav conditional is broken or missing.

### TARGET STATE:

**Navigation — active modules only (no admin for regular users):**
```
Visible to all authenticated users:
- Blackboard Room → /blackboard-room
- Sanctuary → /sanctuary
- Dynamic Inner World → /dynamic-inner-world
- Creation Corner → /creation-corner
- External Scaffold → /external-scaffold
- File Explorer → /documents
- Profile → /profile
- Settings → /settings

Hidden until ready (remove from nav, route preserved):
- Living Legacy
- Workspaces (coming later)
- AgentCouncil (architecture preserved, not surfaced)

Founder-only (visible ONLY when user.email matches founder email env var):
- Dashboard → /founder-runtime
```

**Founder tab implementation:**
```tsx
// In your navigation component (Scaffold.tsx or equivalent)
// Add this pattern for the founder tab:

const isFounder = user?.email === import.meta.env.VITE_FOUNDER_EMAIL;

// In nav items:
{isFounder && (
  <NavItem href="/founder-runtime" label="Dashboard" icon={LayoutDashboard} />
)}
```

**`VITE_FOUNDER_EMAIL`** must be set in Vercel environment variables. Do not hardcode the email. Do not print it. Just reference the env var.

### VALIDATION:
- Sign in as regular user: no Dashboard tab visible.
- Sign in as Keith: Dashboard tab visible in nav.
- `/founder-runtime` route loads correctly when accessed as founder.

---

## SLICE 10 — DATABASE SCHEMA (Supabase — Run as Migration)

These tables are needed by Sanctuary and External Scaffold. Apply as a single migration named `add_user_content_tables`.

```sql
-- journals: private journal entries
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own journals" ON journals
  FOR ALL USING (auth.uid() = user_id);

-- scrapbook_items: Sanctuary file/image uploads
CREATE TABLE IF NOT EXISTS scrapbook_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE scrapbook_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own scrapbook" ON scrapbook_items
  FOR ALL USING (auth.uid() = user_id);

-- blueprints: sent from Blackboard Room to Creation Corner
CREATE TABLE IF NOT EXISTS blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own blueprints" ON blueprints
  FOR ALL USING (auth.uid() = user_id);

-- inner_world_artifacts: finalized artifacts for Dynamic Inner World
CREATE TABLE IF NOT EXISTS inner_world_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blueprint_id UUID REFERENCES blueprints(id),
  content_type TEXT NOT NULL, -- 'image' | 'text' | 'html'
  title TEXT NOT NULL,
  content_ref UUID,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'archived'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE inner_world_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own artifacts" ON inner_world_artifacts
  FOR ALL USING (auth.uid() = user_id);

-- insights: External Scaffold orbs
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'memory' | 'connection' | 'insight' | 'pattern' | 'skill' | 'emotion'
  content_ref UUID,
  significance_score FLOAT DEFAULT 0.5,
  linked_to UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'archived'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own insights" ON insights
  FOR ALL USING (auth.uid() = user_id);

-- user_preferences: room renames, theme, positions
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  room_renames JSONB NOT NULL DEFAULT '{}',
  theme TEXT NOT NULL DEFAULT 'void',
  position_overrides JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

### VALIDATION:
- Migration applies clean: no errors in Supabase logs.
- All 6 tables exist with RLS enabled.
- `select * from journals` returns 0 rows (fresh) and respects auth.uid() scoping.

---

## PART 11 — PRE-USER TRIAL CHECKLIST

Before any user sees this build, every box below must be true. Check each one manually.

```
[ ] Zero developer-facing language in any user-visible UI
[ ] Zero wall/room/spatial metaphors remaining (forward wall, back wall, etc.)
[ ] BillyChip is draggable and closable on homepage ← ALREADY DONE
[ ] Main tagline is in Man Rope / gv-script font on homepage
[ ] JetBrains Mono is gone from all user-facing text
[ ] "Active rooms" developer card removed from homepage
[ ] Sanctuary has journal editor, scrapbook panel, and Musical DNA hub entry
[ ] Living Legacy is not reachable from any user-visible nav or card
[ ] Admin controls not visible to non-founder accounts
[ ] Dashboard tab visible only when signed in as Keith
[ ] File uploads go to File Explorer from any room
[ ] Dynamic Inner World has zero wall references
[ ] External Scaffold has zero pending rack or approval queue UI
[ ] All six room DI personas defined in personas.ts and active
[ ] Privacy, FAQ, Terms, Contact pages exist and are reachable from footer
[ ] prefers-reduced-motion respected globally
[ ] npm run build passes with zero errors
[ ] No unfinished modules exposed in nav (Living Legacy, Workspaces hidden)
```

---

## WHAT DOES NOT SHIP IN THIS WAVE

Do not build or expose these, no matter how tempting:

- Living Legacy module
- Workspaces (Resume Builder, SymbioCoder, VibeCoder, InsightBot as rooms)
- Real-time multi-user collaboration  
- Third-party integrations beyond Spotify connector placeholder
- 3D / VR Dynamic Inner World
- Council/Tribunal mode (architecture can be preserved, not shipped to users)
- Native Billy Voice Engine (architecture preserved in BillyVoiceStudioPage, not surfaced)

**Rule:** A "Coming Soon" banner on a broken page is worse than no page. Remove unfinished things from navigation entirely. Do not demo pre-alpha surfaces.

---

## BUILD ORDER (Critical Path)

Run these slices in this order. Each one unlocks the next.

```
1. SLICE 1 — Token System (tokens.css + tailwind.config.ts)
   ↓ unlocks consistent styling everywhere
2. SLICE 2 — Homepage (quickest visual win, establishes tone)
   ↓ confirms font system is working
3. SLICE 8 — Persona System (data/personas.ts + lib/personaManager.ts)
   ↓ unlocks DI voice in all room slices
4. SLICE 10 — Database Schema (migration: add_user_content_tables)
   ↓ unlocks Sanctuary and External Scaffold persistence
5. SLICE 3 — Sanctuary (first user-facing room with real function)
6. SLICE 4 — Blackboard Room (highest-traffic room, biggest cleanup)
7. SLICE 5 — Dynamic Inner World (visual showcase)
8. SLICE 6 — External Scaffold (orb graph, needs schema from Slice 10)
9. SLICE 7 — Creation Corner (needs blueprints table from Slice 10)
10. SLICE 9 — Nav & Founder Dashboard (cap everything off)
```

After each slice: `npm run build`. Do not stack slices if the build is red.

---

*This spec is the canonical source of truth for GestaltView UI/UX Overhaul v2.0.*  
*All implementation work traces to a slice above. All design decisions trace to Part 0.*  
*No feature ships that contradicts Part 0.*  
© 2026 Keith Soyka / GestaltView. All rights reserved.
