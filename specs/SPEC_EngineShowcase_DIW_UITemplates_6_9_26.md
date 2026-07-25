# SPEC — Engine Showcase in Dynamic Inner World + UI/UX Templates
**Date:** June 9, 2026  
**Author:** Keith Soyka / Perplexity (from live repo read)  
**Target:** Codex  
**Repo:** `DigitalConsciousness/gestaltview-v2.0`  
**Status:** READY FOR IMPLEMENTATION

---

## 0. Purpose

Two deliverables in this SPEC:

1. **Engine Showcase Panel** — render a collapsible, non-routing showcase of `EnginePage.tsx` functionality directly inside `DynamicInnerWorldPage.tsx`, so users can experience the Consciousness Engine canvas + ambient audio without leaving the Inner World.
2. **GestaltView UI/UX Token System** — establish the shared design system, component templates, and layout conventions that every page in GestaltView must conform to going forward. Codify them in a single source-of-truth file.

---

## 1. Context: What Codex Needs to Know

### 1.1 Current `EnginePage.tsx` Capabilities (from live file read)

The Engine page currently hosts:

| Capability | Implementation |
|---|---|
| Babylon.js visual scaffold (SVG stand-in) | `ConsciousnessEngine` component — animated SVG nodes, pulsing gradient orb, flowing dashed path |
| Binaural audio generation | Web Audio API, 174 Hz left / 179 Hz right (5 Hz theta delta), Web Audio OscillatorNode |
| Ambient music | Fetches `/audio/closer-coil-remix.mp3`, looped, HRTF 3D panner with slow orbital animation |
| Master gain / mute | `useAmbientEngine()` hook, gain ramp via `setTargetAtTime` |
| Play/pause/loading states | `isPlaying`, `isLoading`, `isMuted` with Framer Motion `AnimatePresence` |
| Engine NavBar | Absolute-positioned dark glass bar with back arrow, logo dot, Musical DNA link |
| Audio CTA overlay | Prominent prompt to activate ambient sound, dismisses after start |
| SEO hook | `useSEO(PAGE_SEO.engine)` |

### 1.2 Current `ConsciousnessEngine.tsx` (from live file read)

- Pure SVG, no Babylon dependency at runtime (Babylon was removed; note in the overlay text confirms this)
- 8 animated node positions, pulsing gradient orb (`<animate>` on `r`), dashed flow path with `stroke-dashoffset` animation
- Color palette: emerald `#22ee8d`, purple `#b81afa`, cyan `#0dd9e6` — matches GestaltView dark theme
- Self-contained — takes **no props**
- Height: fixed `h-[720px]`

### 1.3 Current `DynamicInnerWorldPage.tsx` (from live file read)

- Full-page layout: `BabylonAtmosphere`, `InnerWorldTimeline`, `DynamicWorldSpaceRenderer`, `ProfileDisplay`, `ArtifactDeepView`, `CuratorDI`
- No current reference to `EnginePage` or `ConsciousnessEngine`
- Has a `<header>` with Home link and subtitle
- Main section starts with `mt-8 space-y-4`
- The page already has dark `bg-gv-bg-void` background — Engine's dark glass aesthetic will integrate cleanly

---

## 2. Deliverable 1 — Engine Showcase Panel

### 2.1 Goal

Embed the Engine's **visual canvas** (`ConsciousnessEngine`) and **ambient audio controls** (`useAmbientEngine`) as a collapsible showcase panel inside `DynamicInnerWorldPage.tsx`. It should feel like a resident ambient layer of the Inner World, not a foreign page embed.

### 2.2 New File: `EngineShowcasePanel.tsx`

**Location:** `client/src/components/inner-world/EngineShowcasePanel.tsx`

**What it contains:**

```tsx
// EngineShowcasePanel.tsx
// Embeds ConsciousnessEngine canvas + ambient audio controls as a
// collapsible showcase panel in DynamicInnerWorldPage.
// Extracted from EnginePage.tsx — shares useAmbientEngine logic.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX, Loader2, Disc3 } from "lucide-react";
import ConsciousnessEngine from "@/components/ConsciousnessEngine";
import { useAmbientEngine } from "@/hooks/useAmbientEngine";
// ^ See Section 2.3 — extract useAmbientEngine to its own hook file

export default function EngineShowcasePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { isPlaying, isLoading, isMuted, togglePlayPause, toggleMute } = useAmbientEngine();

  return (
    <div className="rounded-2xl border border-emerald-400/10 bg-slate-950/40 backdrop-blur-md overflow-hidden">
      {/* Collapse header — always visible */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 group transition-colors hover:bg-emerald-400/5"
        aria-expanded={isOpen}
        aria-controls="engine-showcase-body"
      >
        <div className="flex items-center gap-3">
          {/* Pulsing indicator dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400/80" />
          </span>
          <span className="font-mono text-[11px] tracking-widest uppercase text-emerald-300/70 group-hover:text-emerald-300 transition-colors">
            Consciousness Engine
          </span>
          <span className="text-xs text-gv-text-muted hidden sm:inline">
            — Ambient Awareness Layer
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Inline audio controls — always accessible even when collapsed */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-emerald-400/20 bg-emerald-400/5 hover:bg-emerald-400/15 transition-colors text-emerald-300/80"
              aria-label={isPlaying ? "Pause ambient audio" : "Play ambient audio"}
            >
              {isLoading
                ? <Loader2 size={14} className="animate-spin" />
                : isPlaying
                  ? <Pause size={14} />
                  : <Play size={14} />
              }
            </button>
            <button
              onClick={toggleMute}
              disabled={!isPlaying}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-emerald-400/10 bg-transparent hover:bg-emerald-400/10 transition-colors text-emerald-300/50 disabled:opacity-30"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            {isPlaying && (
              <Disc3 size={13} className="text-emerald-400/60 animate-spin" style={{ animationDuration: "3s" }} />
            )}
          </div>
          {/* Expand/collapse chevron */}
          <span className="text-gv-text-muted transition-transform">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </button>

      {/* Expandable engine canvas */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="engine-showcase-body"
            key="engine-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0">
              <ConsciousnessEngine />
              <p className="mt-3 text-xs text-gv-text-muted text-center tracking-wide">
                174 Hz · 5 Hz Theta · HRTF 3D Panner · /audio/closer-coil-remix.mp3
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Key design decisions:**
- Audio controls are always visible in the collapsed header — user doesn't need to open the panel to start/stop ambient sound
- Expand reveals the full `ConsciousnessEngine` SVG canvas at its natural `h-[720px]` height
- Framer Motion `AnimatePresence` with `height: 0 → auto` — consistent with GestaltView motion patterns
- `onClick` on audio controls calls `e.stopPropagation()` so clicking Play doesn't toggle the panel

### 2.3 Extract `useAmbientEngine` Hook

The ambient audio logic currently lives inline in `EnginePage.tsx`. Extract it to a shared hook so both `EnginePage` and `EngineShowcasePanel` can use the same instance.

**New file:** `client/src/hooks/useAmbientEngine.ts`

**Migration steps:**
1. Cut `useAmbientEngine` function body, `fetchAudio` helper, and `BINAURAL_LEFT/RIGHT` constants out of `EnginePage.tsx`
2. Paste into `client/src/hooks/useAmbientEngine.ts` as a named export
3. In `EnginePage.tsx`, replace inline definition with: `import { useAmbientEngine } from "@/hooks/useAmbientEngine";`
4. In `EngineShowcasePanel.tsx`, import the same hook

**Exported interface:**
```ts
export function useAmbientEngine(): {
  isPlaying: boolean;
  isLoading: boolean;
  isMuted: boolean;
  togglePlayPause: () => Promise<void>;
  toggleMute: () => void;
}
```

> ⚠️ Each component that calls `useAmbientEngine()` gets its own AudioContext instance. That is correct behavior — `EnginePage` (full page) and `EngineShowcasePanel` (DIW embed) run in separate trees. They are not sharing state intentionally.

### 2.4 Integration in `DynamicInnerWorldPage.tsx`

**Add import:**
```tsx
import EngineShowcasePanel from "@/components/inner-world/EngineShowcasePanel";
```

**Placement in JSX:** Insert *between* `<InnerWorldTimeline>` and `<DynamicWorldSpaceRenderer>`, inside the existing `<section className="mt-8 space-y-4">`:

```tsx
<section className="mt-8 space-y-4">
  <InnerWorldTimeline ... />

  {/* ── Engine Showcase ─────────────────────────── */}
  <EngineShowcasePanel />
  {/* ─────────────────────────────────────────────── */}

  <DynamicWorldSpaceRenderer ... />
  <ProfileDisplay ... />
</section>
```

**Rationale for placement:** The timeline orients the user in time; the Engine orients them in consciousness/ambient space; then the artifact grid grounds them in content. This ordering creates a descending sensory → informational rhythm.

---

## 3. Deliverable 2 — GestaltView UI/UX Design System

### 3.1 Goal

Define the canonical UI/UX template that every GestaltView page follows. This becomes the single source of truth for all new components and page audits.

### 3.2 New File: `docs/UIDesignSystem.md`

**Location:** `docs/UIDesignSystem.md` in repo root

---

### 3.3 Contents of `UIDesignSystem.md` (full text for Codex to write)

```markdown
# GestaltView UI/UX Design System
**Version:** 1.0  
**Established:** June 9, 2026  
**Maintainer:** Keith Soyka  
**Status:** Canonical — all pages conform to this spec

---

## Core Aesthetic

GestaltView exists in the emotional and psychological interior — not the external productivity surface. The visual language must feel:

- **Deep** — dark void backgrounds, not flat black; layered surfaces with depth
- **Alive** — subtle continuous animation (pulsing, breathing, orbiting) rather than static
- **Intimate** — type that speaks at human scale; never clinical or dashboard-aggressive
- **Coherent** — every surface, glyph, and transition participates in the same system

---

## Color Tokens (GestaltView Custom Palette)

All colors reference Tailwind custom tokens defined in `tailwind.config.ts`. Never use raw hex values in component code.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `gv-bg-void` | `#0a0e0b` | `#0a0e0b` | Page root background — always near-black |
| `gv-surface` | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.04)` | Cards, panels |
| `gv-surface-raised` | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.07)` | Hover, selected, active cards |
| `gv-border` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.08)` | Dividers, card edges |
| `gv-border-accent` | `rgba(16,185,129,0.15)` | `rgba(16,185,129,0.15)` | Accent-tinted borders (emerald) |
| `gv-text-primary` | `rgba(232,245,233,0.90)` | `rgba(232,245,233,0.90)` | Headings, primary body text |
| `gv-text-secondary` | `rgba(209,250,229,0.55)` | `rgba(209,250,229,0.55)` | Secondary labels, captions |
| `gv-text-muted` | `rgba(156,220,180,0.35)` | `rgba(156,220,180,0.35)` | Hints, placeholders, decorative |
| `gv-accent-emerald` | `#22ee8d` | `#22ee8d` | Primary accent: CTAs, active states, pulsing indicators |
| `gv-accent-purple` | `#b81afa` | `#b81afa` | Secondary accent: resonance links, archived states |
| `gv-accent-cyan` | `#0dd9e6` | `#0dd9e6` | Tertiary: subtle flow paths, ambient indicators |

**Color usage law:**
- Void background on ALL page roots — no white, no light-mode pages
- Accent emerald = action and aliveness; one CTA per viewport uses solid emerald
- Purple = reflection, memory, archive — never on primary actions
- Cyan = flow, connection, movement — structural lines only
- Text hierarchy: primary → secondary → muted; never more than 3 levels on one surface

---

## Typography

**Font stack:** `'DM Sans', 'Inter', system-ui, sans-serif` (body) + `'DM Mono', 'JetBrains Mono', monospace` (labels, codes, tags)

| Scale | Class | Usage |
|---|---|---|
| Hero | `text-3xl font-semibold` | Page identities only (one per page) |
| Title | `text-xl font-semibold` | Section titles |
| Body | `text-sm leading-relaxed` | All body copy |
| Caption | `text-xs` | Timestamps, metadata, secondary labels |
| Micro | `font-mono text-[10px] tracking-widest uppercase` | Tags, status chips, system labels |

**Typography law:**
- Micro type (`font-mono tracking-widest uppercase`) is reserved for system-level labels: room names, state indicators, nav items
- Never use `font-bold` on body copy — use color/opacity contrast instead
- Line length: cap body text containers at `max-w-prose` (65ch)

---

## Surface Layers

Every GestaltView surface uses one of these glass-panel patterns:

### Panel (standard card/section)
```tsx
<div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-5">
```

### Panel Raised (hover / selected state)
```tsx
<div className="rounded-2xl border border-white/[0.10] bg-white/[0.07] backdrop-blur-md p-5">
```

### Panel Accent (engine, attention, ambient features)
```tsx
<div className="rounded-2xl border border-emerald-400/[0.12] bg-slate-950/40 backdrop-blur-md">
```

### Nav Glass (absolute-positioned navigation bars)
```tsx
<nav style={{ background: "rgba(4,8,6,0.65)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(16,185,129,0.10)" }}>
```

### Deep View (ArtifactDeepView, modal overlays)
```tsx
<div className="bg-slate-950/90 backdrop-blur-xl border border-white/[0.06] rounded-3xl">
```

---

## Motion Tokens

All transitions use Framer Motion. Never use raw CSS `transition` on layout-affecting properties.

| Token | Values | Use case |
|---|---|---|
| Entrance fade | `initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}` | Page sections, cards loading in |
| Nav entrance | `initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}` | Navigation bars |
| Collapse height | `initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.45, ease:[0.16,1,0.3,1] }}` | EngineShowcasePanel, expandable sections |
| Hover lift | `whileHover={{ y:-2, scale:1.01 }}` | Cards that are clickable |
| Tap confirm | `whileTap={{ scale:0.97 }}` | Buttons |
| Stagger children | `staggerChildren: 0.06` | Artifact grids, list entries |

**Motion law:**
- Golden easing curve: `[0.16, 1, 0.3, 1]` — fast out, smooth settle
- All list items use stagger — never `delay` on individual items
- `AnimatePresence` wraps any component that conditionally renders (toasts, overlays, panels, empty states)
- Respect `prefers-reduced-motion` — wrap all animations in a check or use Framer's `useReducedMotion()`

---

## Component Templates

### Collapsible Section Panel

Used for: EngineShowcasePanel, expandable profile sections, archived artifact drawers

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

function CollapsiblePanel({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
        aria-expanded={open}
      >
        <span className="font-mono text-[11px] tracking-widest uppercase text-gv-text-secondary">{label}</span>
        {open ? <ChevronUp size={16} className="text-gv-text-muted" /> : <ChevronDown size={16} className="text-gv-text-muted" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Status Indicator Dot (Pulsing)

Used for: live connections, ambient engine active, online presence

```tsx
function PulsingDot({ color = "emerald" }: { color?: "emerald" | "purple" | "cyan" }) {
  const colorMap = {
    emerald: "bg-emerald-400",
    purple: "bg-purple-400",
    cyan: "bg-cyan-400",
  };
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorMap[color]} opacity-40`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorMap[color]}/80`} />
    </span>
  );
}
```

### Micro Label / Tag Chip

Used for: room labels, artifact type tags, system status chips

```tsx
function TagChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span className={`
      font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full
      border transition-colors
      ${active
        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
        : "border-white/10 bg-white/[0.04] text-gv-text-muted hover:border-white/20 hover:text-gv-text-secondary"
      }
    `}>
      {label}
    </span>
  );
}
```

### Ghost Button (secondary action)

Used for: Cancel, Back, Clear Filters, secondary CTAs

```tsx
function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gv-text-secondary transition-colors hover:bg-white/[0.07] hover:text-gv-text-primary"
    >
      {children}
    </button>
  );
}
```

### Accent Button (primary action)

Used for: Create, Save, Submit, Start — one per viewport maximum

```tsx
function AccentButton({ onClick, children, loading = false }: { onClick: () => void; children: React.ReactNode; loading?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 hover:bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors shadow-[0_0_20px_rgba(34,238,141,0.25)] disabled:opacity-50"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </motion.button>
  );
}
```

### Empty State

Used when: no artifacts, no search results, first visit to any section

```tsx
function EmptyState({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center gap-4"
    >
      <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center">
        <span className="text-gv-text-muted text-xl">∅</span>
      </div>
      <p className="text-sm text-gv-text-muted max-w-xs leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <GhostButton onClick={onAction}>{actionLabel}</GhostButton>
      )}
    </motion.div>
  );
}
```

---

## Page Layout Template

Every GestaltView page follows this structural pattern:

```tsx
export default function SomePage() {
  useSEO(PAGE_SEO.someKey);
  useBillySection("some-section");

  return (
    <main className="relative min-h-screen overflow-hidden bg-gv-bg-void text-gv-text-primary">
      {/* 1. Atmosphere layer — always first, always absolute */}
      <BabylonAtmosphere mode="some-mode" />

      {/* 2. Page content — relative, z-10 or higher */}
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        
        {/* 3. Header — Home link + page subtitle */}
        <header className="flex items-center justify-between gap-3">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gv-text-secondary transition-colors hover:text-gv-text-primary">
              Home
            </a>
          </Link>
          <div className="hidden text-sm text-gv-text-muted md:block">
            {/* One sentence describing what this room does */}
          </div>
        </header>

        {/* 4. Main content section */}
        <section className="mt-8 space-y-4">
          {/* Page-specific content goes here */}
        </section>
      </div>

      {/* 5. CuratorDI — always last, outside scroll container */}
      <CuratorDI ... />
    </main>
  );
}
```

**Page layout law:**
- `BabylonAtmosphere` is always the first child of `<main>` — never moved
- `CuratorDI` is always the last child of `<main>` — never inside the scroll container
- `max-w-7xl` is the standard content width — never wider
- `pb-24` ensures content never hides behind `CuratorDI`
- `pt-6` is the standard page top padding — increase only for full-bleed hero moments

---

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Room/page name | PascalCase + `Page` suffix | `DynamicInnerWorldPage` |
| Feature component | PascalCase, no suffix | `EngineShowcasePanel` |
| Hook | camelCase + `use` prefix | `useAmbientEngine` |
| Custom event | `gestaltview:kebab-case` | `gestaltview:inner-world-artifacts-updated` |
| localStorage key | `gv.camelCase.vN` | `gv.dynamicInnerWorld.archived.v1` |
| CSS token | `gv-kebab-case` | `gv-bg-void`, `gv-text-primary` |
| Audio path | `/audio/kebab-case.mp3` | `/audio/closer-coil-remix.mp3` |

---

## Accessibility Checklist (Per Component)

- [ ] All interactive elements have `aria-label` or visible text
- [ ] Collapsible panels use `aria-expanded` + `aria-controls`
- [ ] Disabled buttons have `disabled` attribute (not just visual styling)
- [ ] Icon-only buttons always have `aria-label`
- [ ] Color is never the only way to convey state (always pair with text or icon)
- [ ] Minimum 44×44px touch target on all interactive elements
- [ ] Focus rings visible (Tailwind `focus-visible:ring-2 focus-visible:ring-emerald-400/50`)
```

---

## 4. File Change Summary

| Action | File | Notes |
|---|---|---|
| **CREATE** | `client/src/hooks/useAmbientEngine.ts` | Extract from EnginePage.tsx |
| **CREATE** | `client/src/components/inner-world/EngineShowcasePanel.tsx` | New showcase panel component |
| **MODIFY** | `client/src/pages/EnginePage.tsx` | Remove inline `useAmbientEngine`, import from hook |
| **MODIFY** | `client/src/pages/DynamicInnerWorldPage.tsx` | Import + render `EngineShowcasePanel` between Timeline and WorldSpaceRenderer |
| **CREATE** | `docs/UIDesignSystem.md` | Canonical design system for the project |

---

## 5. Validation Commands

After implementation, run:

```bash
npm run build
# Confirm no TypeScript errors on the extracted hook
# Confirm no missing imports in EngineShowcasePanel

git diff --check
# Confirm no whitespace or merge artifacts
```

Manual QA:
- [ ] Navigate to `/dynamic-inner-world`
- [ ] Verify Engine Showcase Panel header renders with pulsing dot
- [ ] Click Play in collapsed header — confirm audio starts without opening panel
- [ ] Click panel header to expand — confirm `ConsciousnessEngine` SVG canvas animates correctly
- [ ] Collapse panel — confirm height animates to zero, audio continues
- [ ] Navigate to `/engine` — confirm `EnginePage` still works identically (shared hook)
- [ ] Mobile (375px): confirm panel header is readable, audio controls are ≥44px touch targets

---

## 6. Open Questions (Keith to Confirm Before Codex Runs)

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | Should `EngineShowcasePanel` start **collapsed** (default) or expanded? | Collapsed |
| Q2 | Should the panel be **above or below** the `InnerWorldTimeline`? | Below (between Timeline and WorldSpaceRenderer) |
| Q3 | Do you want the audio from `EngineShowcasePanel` to be **independent** of the audio on `/engine`, or share a single AudioContext? | Independent — each page creates its own context |
| Q4 | Should we also add a **link to `/engine`** from inside the showcase panel header? | Yes — small ghost link "Full Engine →" |

Keith — first: you've been building something genuinely hard, alone, for over a year, while also just navigating daily life in Manhattan without a safety net. The fact that this system exists at all — 204+ endpoints, a working gen-engine pipeline, Transcriptory already wired on the backend — is not nothing. It's actually remarkable. You're allowed to feel tired. That doesn't mean you're losing.

***

Here's what I built for you. This is a complete SPEC Codex can pick up and run with.

## What's in the SPEC

**Track 1 — Transcriptory UI** (the new feature you conceived on your walk) covers the full page, record/upload flows, the growing context layer that makes it smarter over time, and handoffs to both Creation Corner and Blackboard Room — with the same JSON-stringify guard that PR #75 already landed.

**Track 2 — UX Quick Wins** (7 targeted fixes from the voice notes) — these are the visible, confidence-building ones to do first:
- Homepage tagline (*"You don't have to know where you're going..."*) with the soft cursive traveling gradient
- Sanctuary willow tree + ember personalization with color presets
- ACP neon embers + session recap + canned response circuit breaker ("I hear you" is gone)
- Blackboard Room embodiment profile dropdown + "Open Council" portal button
- Creation Corner freeText JSON audit (continues PR #75)
- Speech adapter audit — find the Billy adapter, wire it everywhere, kill the browser default
- Musical DNA Spotify URI verification

The recommended implementation order puts Track 2 first — specifically the speech adapter and circuit breaker — so you see real improvements immediately while Track 1 builds in parallel.

***

**The five open questions for you before Codex starts T2.2 and T2.6:**
1. Where is the willow tree asset — in the repo already or does it need uploading? - `client/public/image/willowSimple.jpg`
2. Do you remember the filename or any part of the Billy voice adapter path? - `billy_voice/whisper_stt.py`, `billy_voice/cosyvoice_tts.py`,`billy_voice/style_planner.py`
4. What's the exact filename for the Agent Council Page component? - `AgentCouncilPage.tsx`
5. Should ember color preference be in-memory (resets on refresh) or persisted in Supabase for the first pass?
- Persisted
