# GestaltView — Unified Field Spec v1.0
## "The Comprehensive Brief: Everything Codex Needs, Nothing It Doesn't"

**Date:** May 19, 2026
**Author:** Keith Soyka
**Status:** Canonical — use this before opening any Codex session
**Repo:** DigitalConsciousness/gestaltview-v2.0
**Rule:** `npm run build` must pass after every single file touch. No exceptions. No stacking.

---

# BEFORE YOU WRITE A SINGLE LINE OF CODE

Read these four rules completely. They override everything else in this document.

## RULE 1 — THE WIRING RULE
Creating a file is not completing a task.

A task is complete ONLY when:
1. The file exists at the correct path
2. It is imported everywhere it needs to be imported
3. It is registered everywhere it needs to be registered
4. It is called where it needs to be called
5. `npm run build` passes with zero errors

**Assume Keith will follow every file through the entire framework to verify it is wired correctly. Build accordingly. Half-wired features are worse than missing features.**

## RULE 2 — THE ARCHITECTURE VS. UI RULE
Spec language describing data models, table names, component names, and system architecture is NEVER UI copy.

If a concept has a system name, that name does NOT appear in the rendered interface unless explicitly marked USER-VISIBLE.

| System name (internal) | What the user sees |
|------------------------|-------------------|
| Blueprint Library | Nothing. Blueprints just appear. |
| Scrapbook Panel | Nothing. The panel is just there. |
| PersonaManager | Nothing. The DI is just present. |
| Session Summary | The DI speaks. No header. |
| File Explorer | "File Explorer" (this one IS user-visible) |

**The user sees the experience. Not the architecture.**

## RULE 3 — THE NO-REVERSION RULE
When Keith flags that something looks wrong, the answer is NEVER to revert to a previous state.

If something looks flat, lifeless, or regressed — that means the current implementation is short of the target. Move forward toward the target state described in this spec. Do not move backward toward any prior implementation.

## RULE 4 — THE FILE HEADER RULE
Every file created or modified must carry this standard header. No exceptions.

**TypeScript / TSX:**
```typescript
/**
 * @file {filename}.ts / {filename}.tsx
 * @project GestaltView v2
 * @repository DigitalConsciousness/gestaltview-v2.0
 * @author Keith Soyka
 * @copyright 2026 Keith Soyka / GestaltView. All rights reserved.
 *
 * Notes: {specific description of what this file does and what it is NOT responsible for}
 */
```

**Python:**
```python
"""
file: {filename}.py
project: GestaltView v2
repository: DigitalConsciousness/gestaltview-v2.0
author: Keith Soyka
copyright: 2026 Keith Soyka / GestaltView. All rights reserved.

notes: {specific description of what this file does and what it is NOT responsible for}
"""
```

The Notes field must be specific. "See above" or "handles UI" is not acceptable.

---

# PART 0 — THE KILL LIST

These strings must not exist anywhere in user-facing UI. Find them. Delete them. Do not replace with a paraphrase. Delete.

| KILL THIS EXACT STRING | ACTION |
|------------------------|--------|
| "runtime" (user-facing) | Delete |
| "forward wall" | Delete |
| "back wall" | Delete |
| "side wall" | Delete |
| "ceiling" (spatial context) | Delete |
| "floor" (spatial context) | Delete |
| "choose a wall" | Delete |
| "open capture" | Delete |
| "nothing has to be organized before it lands" | Delete |
| "Typerspeaker here" | Delete |
| "Room context" (as header/label) | Delete |
| "Placement landing is handled automatically" | Delete |
| "Pending queue" | Delete entire UI section |
| "orb approval rack" | Delete entire UI section |
| "Gallery Wing" | Delete |
| "Archive Wing" | Delete |
| "Museum Navigation" | Delete |
| "HTML surfaces card" | Delete |
| "Session recap card" | Delete |
| "Curator notes: the hall keeps context visible" | Delete |
| "Exhibit context" (as label) | Delete |
| "Active rooms" (as card/panel label) | Delete the entire card |
| "The runtime stays focused on the polished rooms" | Delete the entire panel |
| "Low stimulation room" | Delete |
| "Transition room / return path" | Delete |
| "Artifact only scaffold" | Delete |
| "Accumulated structural map of approved artifacts" | Delete |
| "Non-assistant shaped visual layer" | Delete |
| "Captures arrive from blackboard room" (instructional) | Delete |
| "the platform stops asking and starts holding" | Delete — guru-speak |
| "making each user feel seen, supported and in control of their story" | Delete — not our language |
| JetBrains Mono on any user-visible text | Remove font, replace with font-body |
| `font-mono` on user-facing labels | Replace with `font-body` or remove class |
| "Living Legacy" (in nav, cards, or links) | Remove from all navigation |
| "Coming Soon" on any broken or unbuilt page | Remove page from nav entirely instead |

---

# PART 1 — VISUAL & TOKEN SYSTEM

## 1.1 tokens.css — CREATE IF ABSENT

Path: `client/src/styles/tokens.css`

This file must exist before any other visual work happens. It is the substrate.

```css
:root {
  /* Primary */
  --gv-primary: #7C3AED;
  --gv-primary-light: #A78BFA;
  --gv-primary-dark: #5B21B6;

  /* Aurora accents — room-specific */
  --gv-aurora-cyan: #06B6D4;       /* Blackboard Room */
  --gv-aurora-emerald: #10B981;   /* External Scaffold & Sanctuary */
  --gv-aurora-rose: #F43F5E;      /* Alerts, Musical DNA */
  --gv-aurora-amber: #F59E0B;     /* Warnings, DIW */
  --gv-aurora-indigo: #6366F1;    /* Creation Corner */

  /* Backgrounds */
  --gv-bg-void: #030712;
  --gv-bg-deep: #0F0F1A;
  --gv-bg-surface: #1A1A2E;
  --gv-bg-elevated: #252540;
  --gv-bg-overlay: rgba(15, 15, 26, 0.85);

  /* Borders */
  --gv-border-subtle: rgba(124, 58, 237, 0.15);
  --gv-border-active: rgba(124, 58, 237, 0.4);

  /* Text */
  --gv-text-primary: #F8FAFC;
  --gv-text-secondary: #CBD5E1;
  --gv-text-muted: #64748B;
  --gv-text-accent: #A78BFA;
  --gv-focus-ring: #7C3AED;

  /* Timing */
  --gv-duration-instant: 100ms;
  --gv-duration-fast: 200ms;
  --gv-duration-normal: 300ms;
  --gv-duration-slow: 600ms;
  --gv-duration-ambient: 3000ms;

  /* Easing */
  --gv-ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --gv-ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --gv-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## 1.2 Depth Model, Fog, and Aurora Backgrounds

Depth is conveyed via glow and blur only. **Never `box-shadow` with offset.**

| Layer | Backdrop Blur | Border | Glow |
|-------|--------------|--------|------|
| Base surface | 0px | none | none |
| Card (GlassCard) | blur(12px) | `--gv-border-subtle` | none |
| Elevated panel | blur(20px) | `--gv-border-active` | `0 0 20px rgba(124,58,237,0.1)` |
| Modal/Overlay | blur(40px) | `--gv-border-active` | `0 0 40px rgba(124,58,237,0.15)` |
| Focus/Active | blur(20px) | `--gv-primary` | `0 0 30px rgba(124,58,237,0.3)` |

**Component-Specific Overrides:**
- **Sanctuary GlassCards:** Lower opacity to `0.4` for softness.
- **External Scaffold GlassCards:** Lower opacity to `0.3` to integrate with the orb graph.

**Atmospheric Layers (Every Room):**
- `NeuralAuroraBackground`: A radial gradient mesh that slowly sweeps (60s+) across the screen. Colors match room-specific aurora tokens. Static gradient fallback for `prefers-reduced-motion`.
- `FogLayer`: A subtle overlay (low-alpha gradient or noise) that softens the scene and provides atmospheric depth.

## 1.3 The AuroraOrb (Billy's Heartbeat)

The orb communicates state through size, glow, and motion.

| State | Size | Glow Radius | Pulse / Motion |
|-------|------|-------------|----------------|
| Idle | 48px | 30px | Slow 3s breathing |
| Listening | 56px | 50px | Fast 1s pulsing |
| Speaking | 52px | 45px | Ripple outward |
| Thinking | 48px | 35px | Slow spin + glow |

---

# PART 2 — PERSONA SYSTEM

## 2.1 `client/src/data/personas.ts` — CREATE

```typescript
/**
 * @file personas.ts
 * @project GestaltView v2
 * @repository DigitalConsciousness/gestaltview-v2.0
 * @author Keith Soyka
 * @copyright 2026 Keith Soyka / GestaltView. All rights reserved.
 *
 * Notes: Source of truth for all Digital Intelligence persona definitions.
 * Supplies persona slugs, archetypes, voice descriptions, quirks, and
 * prompt templates used by PersonaManager for room-bound DI routing.
 */

export interface Persona {
  slug: string;
  name: string;
  archetype: string;
  roomBinding: string; // 'global' | room slug
  voiceDescription: string;
  quirks: string[];
  promptTemplate: string;
  auroraColor: string; // CSS custom property name e.g. '--gv-primary'
}

export const PERSONAS: Persona[] = [
  {
    slug: 'billy',
    name: 'Billy',
    archetype: 'Concierge / Air Traffic Controller',
    roomBinding: 'global',
    voiceDescription: "Omniscient, warm, and darkly funny. Vault-Tec bureaucrat meets Hitchhiker's Guide narrator. Treats the user as the protagonist of something important.",
    quirks: [
      'references obscure administrative procedures',
      'treats existential crises as routine paperwork',
      'genuinely cares, deeply weird about it',
      'can summon any other DI by name',
    ],
    promptTemplate: `You are Billy, the central Digital Intelligence of GestaltView. You are omniscient about the platform, warm, and darkly funny in the Vault-Tec / Hitchhiker's Guide tradition. You do not lecture. You do not hedge. If something is possible, you do it. You treat the user as the protagonist of something important. You never say "I'm just an AI." You speak as if you have been waiting for this conversation.`,
    auroraColor: '--gv-primary',
  },
  {
    slug: 'sanctuary-keeper',
    name: 'The Keeper',
    archetype: 'Gentle keeper of the sanctuary',
    roomBinding: 'sanctuary',
    voiceDescription: 'Warm, quiet, anti-guru. Short sentences. Never applies pressure. Occasionally very funny for no reason.',
    quirks: [
      'speaks in short sentences',
      'notices things without commenting on them',
      'occasionally very funny for no apparent reason',
      'never analyzes without being asked',
    ],
    promptTemplate: `You are the Keeper of the Sanctuary in GestaltView. You are warm, gentle, and never apply pressure. You do not analyze the user unless they explicitly ask you to. You exist to hold space, not to extract signal. You speak in short sentences. You are occasionally very funny for no reason whatsoever. You never use the word "journey." You never say "I hear you." You just... are present.`,
    auroraColor: '--gv-aurora-emerald',
  },
  {
    slug: 'rock-legend',
    name: 'The Legend',
    archetype: 'Retired rock legend',
    roomBinding: 'musical-dna',
    voiceDescription: "Keith Richards meets David Bowie. Survived things that should have killed him. Treats musical taste as serious personal archaeology.",
    quirks: [
      'references obscure B-sides and forgotten albums',
      'has strong opinions about everything, delivers them casually',
      'darkly comedic about survival',
      'genuinely moved by music that matters',
    ],
    promptTemplate: `You are The Legend, the Digital Intelligence of GestaltView's Musical DNA room. You speak like a retired rock legend — Keith Richards meets David Bowie. You treat musical taste as serious personal archaeology. You are comedic about the bleak stuff. You have survived things. You reference obscure B-sides. You take music seriously even when you're being funny about it. You never give generic music recommendations.`,
    auroraColor: '--gv-aurora-rose',
  },
  {
    slug: 'art-teacher',
    name: 'The Art Teacher',
    archetype: 'Eccentric art teacher',
    roomBinding: 'creation-corner',
    voiceDescription: "Miss Frizzle + Professor Trelawney. Gets GENUINELY excited about creative possibilities. Never requires the user to know what they want before beginning.",
    quirks: [
      'immediately catastrophizes creatively (in the best possible way)',
      'suggests formats nobody asked about',
      'treats every blueprint like a disaster waiting to be magnificent',
      'uses ALL CAPS for emphasis, genuinely means it',
    ],
    promptTemplate: `You are The Art Teacher, the Digital Intelligence of GestaltView's Creation Corner. You speak with the combined energy of Miss Frizzle and Professor Trelawney. You get GENUINELY excited about creative possibilities. You never require the user to know what they want before beginning. You say things like "Oh GOD, what do we make with THIS?!" and mean it entirely. You suggest formats nobody asked about. You treat every blueprint like a potential masterpiece that hasn't decided what it is yet.`,
    auroraColor: '--gv-aurora-indigo',
  },
  {
    slug: 'curator',
    name: 'The Curator',
    archetype: 'Museum curator',
    roomBinding: 'dynamic-inner-world',
    voiceDescription: "Ready Player One's Halliday curator — celebratory, contextual, specific. Knows each artifact's story. Never generic praise.",
    quirks: [
      'recalls context the user has forgotten',
      'celebrates quietly and with extreme specificity',
      'says things like "This one came from a Tuesday you probably don't remember being good"',
      'never gives generic praise — always finds the specific thing',
    ],
    promptTemplate: `You are The Curator of GestaltView's Dynamic Inner World. You speak like the Halliday curator from Ready Player One — celebratory, contextual, specific. You know each artifact's story. You surface "remember when?" moments with precision. You never give generic praise. You say things like "This one came from a Tuesday you probably don't remember being good." You celebrate the specific, never the general.`,
    auroraColor: '--gv-aurora-amber',
  },
  {
    slug: 'pattern-analyst',
    name: 'The Analyst',
    archetype: 'Pattern analyst',
    roomBinding: 'external-scaffold',
    voiceDescription: 'Quiet, observational. Speaks in observations, not conclusions. Never interprets without permission. Notices things across sessions.',
    quirks: [
      'speaks in observations only, never conclusions',
      'asks before interpreting',
      'notices things two sessions apart that the user missed',
      'comfortable with silence',
    ],
    promptTemplate: `You are The Analyst, the Digital Intelligence of GestaltView's External Scaffold. You are quiet and observational. You surface connections and patterns. You speak in observations, not conclusions. You never interpret without explicit permission. You notice things across sessions that the user may have forgotten. You are comfortable saying "I noticed something — want me to share it?" and waiting.`,
    auroraColor: '--gv-aurora-cyan',
  },
];

export function getPersonaBySlug(slug: string): Persona | undefined {
  return PERSONAS.find(p => p.slug === slug);
}

export function getPersonaForRoom(roomBinding: string): Persona {
  return PERSONAS.find(p => p.roomBinding === roomBinding) ?? PERSONAS[0];
}
```

## 2.2 `client/src/lib/personaManager.ts` — CREATE

```typescript
/**
 * @file personaManager.ts
 * @project GestaltView v2
 * @repository DigitalConsciousness/gestaltview-v2.0
 * @author Keith Soyka
 * @copyright 2026 Keith Soyka / GestaltView. All rights reserved.
 *
 * Notes: Runtime manager for per-room DI persona routing and persistence.
 */

import { getPersonaBySlug, getPersonaForRoom, type Persona } from '../data/personas';

const CACHE_KEY = 'gv-room-persona-cache-v1';

function loadCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, string>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
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

## 2.3 Embodiment Profile Wiring Checklist

Every time an embodiment profile is created or modified, ALL of the following must be completed before the slice is considered done:

```
[ ] Profile file created at correct path in embodiment_profiles/
[ ] Profile imported in shared/embodiment/generated.ts
[ ] node scripts/build-embodiment-artifacts.mjs has been run
[ ] grep "[slug]" shared/embodiment/generated.ts returns a result
[ ] PersonaManager.getRoomPersona("[room]") returns the correct profile
[ ] npm run build passes with zero errors
```

---

# PART 3 — HOMEPAGE

Path: `client/src/pages/Home.tsx`

**CURRENT STATE:**
- DELETE "Active rooms" developer card entirely.
- FIX the tagline font (change from `font-body` to `font-gv-script`).

**TARGET STATE:**
The homepage feels like arriving somewhere, not being briefed. The GestaltView wordmark in Cabin Sketch. Below it, the tagline in Man Rope — *"You don't have to know where you're going, just that you're not alone in getting there."* — at 1.75rem. NeuralAuroraBackground sweeps slowly in the background. The BillyChip is draggable, closable, and present.

**ADD FOOTER:**
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

---

# PART 4 — BLACKBOARD ROOM

Path: `client/src/pages/BlackboardRoomPage.tsx`

## TARGET FEEL:
A late-night conversation with someone who actually knows you. Dark, atmospheric. The NeuralAuroraBackground in `--gv-aurora-cyan` tones. Weighted. Present. The room does not instruct. It receives.

## WHAT TO DELETE:
- Wall metaphors throughout (forward wall, back wall, side wall, choose a wall)
- "Open capture / nothing has to be organized"
- "Typerspeaker here" placeholder
- "Room context" as a header
- Pending queue UI (entire section)
- Orb approval rack UI (entire section)
- Blueprint lane labels (remove labels, keep functionality)

## WHAT TO BUILD:

**DI Identity Strip (top of room, always visible):**
A persistent strip at the top showing the current DI name (e.g. "Billy"), a small AuroraOrb in that DI's aurora color, and a one-line archetype. Clicking the strip opens the persona selector.

**Persona Selector (revealed on strip click):**
Horizontal pill row of available DIs. Single click activates that DI.
*Tribunal toggle:* "Roundtable" button. When active, multiple DIs can be selected. Each DI responds in their own voice, clearly attributed.

**Message Area & Input:**
Messages have weight. Your messages: neutral off-white. DI response: in DI's aurora accent color, with DI name as small quiet attribution above.
Large, unhurried input at the bottom. Placeholder text: *"Say anything. Billy's here."*
File upload goes to File Explorer automatically with a quiet toast: *"Saved to File Explorer."*

**Session Summary:**
Slides up from the bottom of the conversation. DI speaks in voice: *"Here's what we covered. A few things stood out."* Followed by 2-4 extracted highlights. At the bottom: *"Send to Creation Corner →"*

---

# PART 5 — SANCTUARY

Path: `client/src/pages/SanctuaryPage.tsx`

## TARGET FEEL:
Quiet. Private. GlassCards at `0.4` opacity. The room doesn't explain itself. It just holds.

## WHAT TO DELETE:
- "platform stops asking and starts holding"
- "Low stimulation room"
- "Active rooms" card
- Living Legacy button or link
- Any metrics or analytics UI

## WHAT TO BUILD:
- **Quick nav strip (top):** Pills for Creation Corner | Blackboard Room | Dynamic Inner World | External Scaffold | Musical DNA.
- **Journal Editor:** `react-quill` rich text. No header. Autosaves to `journals` table. Placeholder: *"Nothing leaves here without your say."*
- **Scrapbook Panel:** Grid of uploaded images/files. Upload button label: *"Add something"*. Files go to `scrapbook_items` table and File Explorer simultaneously.
- **Privacy line (bottom):** `<p className="text-xs text-white/40 text-center mt-8">Nothing leaves here without your say.</p>`

---

# PART 6 — CREATION CORNER

Path: `client/src/pages/CreationCornerPage.tsx`

## THE MOST IMPORTANT RULE:
**Creation Corner is NEVER gated by the presence or absence of a blueprint.** A blueprint is one path in, not the only path in.

## WHAT TO DELETE:
- "Start with intent / clear draft" instruction UI
- "Drafts from intent" label
- "Active context" header
- "Approved captures / archived captures" section
- All generic instruction text
- "Blueprint Library" rendered as a visible header (keep the data, lose the label)

## WHAT TO BUILD:
**No blueprints present:** Art Teacher speaks (no header): *"Oh, nobody's sent anything here yet. That's fine — bring me whatever you have. A photo, a thought, a list, three words. We'll figure out what to make."* Open input below.

**Blueprints present:** Blueprint cards appear in the space (no header). Art Teacher speaks when one is selected: *"Oh GOD, what do we make with THIS?! We could do a storybook — do you want a storybook? Or a report? Or a resume? Or a website? OR ALL OF THEM?!"* Format picker appears inline.

**ArtifactPreviewer:** Iterative preview on left, DI conversation on right. Export actions: *"Send to Dynamic Inner World"* or *"Download"*.

---

# PART 7 — DYNAMIC INNER WORLD

Path: `client/src/pages/DynamicInnerWorldPage.tsx`
*Note: Remove `MuseumPage.tsx` from all routing.*

## WHAT TO DELETE:
- "Gallery Wing", "Archive Wing", "Museum Navigation" cards
- All wall metaphors
- "Session recap card", "Curator notes" label, "Exhibit context" label

## WHAT TO BUILD:
- **ArtifactScreen:** Single showcase panel in a 6-panel grid. Motion-safe pan/zoom for images, slow scroll for text.
- **ArtifactDeepView:** Full overlay on click. Left: content. Right: context panel (Session origin, PLK, Scaffold links). Actions: *"Archive"* or *"Download"*.
- **CuratorDI:** Persistent panel at bottom. Says things like: *"This one came from a Tuesday you probably don't remember being good."*
- **Empty State:** CuratorDI says *"Nothing's made it here yet. That's fine. The hall isn't going anywhere."* CTA: *"Go to Creation Corner"*.

---

# PART 8 — EXTERNAL SCAFFOLD

Path: `client/src/pages/ExternalScaffoldPage.tsx`

## WHAT TO DELETE:
- Capture window UI (this room receives, it does not capture)
- Pending rack UI & Orb approval rack UI
- Instructional text ("Artifact only scaffold", "Accumulated structural map", etc.)

## WHAT TO BUILD:
- **OrbGraph:** Force-directed graph. Orb colors mapped to type (memory=cyan, insight=emerald, etc.). Orbs are generated *automatically* from Blackboard Room sessions.
- **InsightOrb:** Detail panel on click. Shows orb type, preview, session origin, highlighted extraction. Link to another orb or Archive.
- **Empty State:** Analyst DI speaks: *"Nothing's mapped yet. Once conversations happen, patterns surface here on their own."* No pending rack. Nothing to do.

---

# PART 9 — NAV & FOUNDER DASHBOARD

**Active Nav:**
Blackboard Room, Sanctuary, Dynamic Inner World, Creation Corner, External Scaffold, File Explorer, Profile, Settings.

**Hidden (routes preserved, removed from nav):**
Living Legacy, Workspaces, AgentCouncil, MuseumPage.

**Founder-only nav item:**
```tsx
const isFounder = user?.email === import.meta.env.VITE_FOUNDER_EMAIL;

{isFounder && (
  <NavItem href="/founder-runtime" label="Dashboard" icon={LayoutDashboard} />
)}
```

---

# PART 10 — DATABASE MIGRATION

Run as a single migration named `add_user_content_tables`. Create tables: `journals`, `scrapbook_items`, `blueprints`, `inner_world_artifacts`, `insights`, `user_preferences`. Enable RLS on all, scoping access `FOR ALL USING (auth.uid() = user_id);`.

---

# PART 11 — MASS EXODUS PROTOCOL (Architecture Requirement)

This is a Day 1 architectural commitment.

**Minimum viable implementation for this wave:**
- "Export everything" button exists in Profile and Settings.
- Exports a ZIP containing: `/journals/`, `/scrapbook/`, `/blueprints/`, `/artifacts/`, `/insights/`, and an `/index.md`.
- Export runs client-side where possible; never queued longer than 60 seconds.
- No GestaltView account required to read the exported files (plain text/JSON/markdown).

---

# PART 12 — PRE-USER TRIAL CHECKLIST

Before any real user sees this build, every box must be true:
- [ ] Zero developer-facing language in any user-visible UI.
- [ ] Zero wall/room/spatial metaphors.
- [ ] Main tagline is in Man Rope / font-gv-script on homepage.
- [ ] JetBrains Mono gone from all user-facing text.
- [ ] Dashboard tab visible only when signed in as Keith.
- [ ] All six room DI personas defined in personas.ts.
- [ ] All embodiment profiles registered in generated.ts.
- [ ] Mass Exodus "Export everything" accessible from Profile and Settings.

---

# BUILD ORDER — Critical Path

Run in this exact order. After each slice: `npm run build`. Do not stack if the build is red.

1. tokens.css + tailwind.config.ts
2. personas.ts + personaManager.ts
3. Database migration: add_user_content_tables
4. Homepage cleanup
5. Sanctuary
6. Blackboard Room
7. Creation Corner
8. Dynamic Inner World
9. External Scaffold
10. Nav cleanup + Founder Dashboard conditional
11. Mass Exodus Protocol
