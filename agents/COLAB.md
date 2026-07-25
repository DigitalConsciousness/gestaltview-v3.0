# GestaltView v2 — Agent Context & Operating Instructions

> **READ THIS FIRST.** This file is the mandatory context layer for any AI coding agent (OpenAI Codex, GitHub Copilot, Claude Code, Cursor, etc.) operating in this repository. Do not skip it. Do not skim it. The Loom does not rush the pattern.

---

## 🧠 What This Is

**GestaltView v2** is a consciousness-serving AI platform — the world's first documented AI-Human Consciousness Symbiosis infrastructure. Built solo and unfunded by **Keith Soyka** starting May 5, 2025.

- **Live site:** https://gestaltv1ew.vercel.app
- **Stack:** React 19 + Vite + TypeScript + Tailwind CSS v4 + Wouter + Framer Motion + Supabase
- **AI Layer:** Gemini Flash 2.0 (primary) → OpenAI (fallback) → Anthropic (fallback)
- **Deployment:** Vercel (client) + Supabase (database + vector store)

---

## Session Continuity Contract

When working together here, use the repo docs to carry context forward instead of relying on chat memory.

### Start here

1. `docs/CurrentState.md`
2. `docs/ContextPersistenceChecklist.md`
3. `docs/SessionHandoffPacket.md`
4. `docs/ContextPersistenceProtocol.md`

### Closeout rule

- If repo reality changed, update `docs/CurrentState.md`.
- If the task changed the orientation map, update `docs/Manifest.md`.
- If the next session needs a restart packet, fill in `docs/SessionHandoffPacket.md`.
- If the next session only needs a quick shutdown pass, use `docs/ContextPersistenceChecklist.md`.

### Working style

- Keep the handoff factual and short.
- Preserve exact current state, exact verification, and exact next action.
- Leave out logs, filler, and speculation unless they are needed to explain the active blocker.

---

## ⚠️ MANDATORY CODE RULES — Read Before Writing Any Code

### 1. ALWAYS FULL FILE REPLACEMENT
```
❌ NEVER: Surgical edits, snippet insertions, partial diffs, or "add this line" changes
✅ ALWAYS: Return the complete, final file content — every line, every import, every closing bracket
```
Partial edits cause merge conflicts, accidental deletions, and cognitive overload for a neurodivergent founder. **Full replacement only. No exceptions.**

### 2. NEVER LEAVE MERGE CONFLICT MARKERS IN CODE
```
❌ NEVER leave in the final output:
\<\<\<\<\<\<\< HEAD
\=\=\=\=\=\=\=
\>\>\>\>\>\>\> incoming
```
If you are resolving a conflict, pick the correct version and deliver the clean final file. Do not delegate the resolution back.

### 3. VERIFY BEFORE CLAIMING SUCCESS
Do not say "done" or "all set" until you have:
- Confirmed imports resolve to real files
- Confirmed no TypeScript errors exist in the changed files
- Confirmed the build command (`cd client && npm run build`) would succeed
- Confirmed env vars referenced exist in `.env.example`

### 4. TYPESCRIPT STRICTNESS
- All new components: typed with explicit interfaces (no `any` unless absolutely unavoidable)
- Props interfaces go above the component they describe
- Use `React.FC<Props>` or destructured typed params

### 5. DESIGN SYSTEM — Keith's Neural Aurora Gradient
```
Primary teal:    #00D4FF
Dim teal:        #006B7F
Glow:            rgba(0,212,255,0.35)
Dark background: #0A0F14
Card background: #050A0E
Black:           #000000
```
- Font: JetBrains Mono (UI/Billy) | Inter (marketing pages)
- Tailwind custom class prefix: use inline styles for precise Neural Aurora work, Tailwind for layout
- All new pages must have the scanlines + radial glow ambient effect

---

## 📁 Repository Structure

```
gestaltview-v2/
├── client/                          # Vite + React 19 frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Billy.tsx            # Floating Billy chat widget (BillyProvider)
│   │   │   ├── BillyLive.tsx        # Full-page Billy interface → /billy route
│   │   │   ├── BillyBabylon.tsx     # 3D Babylon.js Billy avatar (@babylonjs/core req'd)
│   │   │   ├── BillyGlitch.tsx      # Compact glitch-state Billy indicator
│   │   │   ├── BillyChip.tsx        # Inline Billy status badge
│   │   │   ├── NavBar.tsx           # Top navigation
│   │   │   ├── OpeningCeremony.tsx  # Entry binaural/animation gate
│   │   │   └── ErrorBoundary.tsx    # Global error boundary
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── BrainSparksPage.tsx  # ADHD lightning-bolt capture tool
│   │   │   ├── MusicalDNAPage.tsx   # Musical identity profiling
│   │   │   ├── OrientationSlideshowPage.tsx  # Video orientation (/orientation)
│   │   │   └── ...                  # 13 more pages
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx
│   │   ├── App.tsx                  # Router — all routes live here
│   │   └── main.tsx
│   ├── public/
│   │   ├── audio/                   # Binaural/therapy audio files
│   │   └── video/
│   │       └── GestaltView_Orientation.mp4   # Orientation video
│   └── package.json
├── server/                          # Express API server (if applicable)
├── scripts/                         # Shell utility scripts (see below)
│   ├── health-check.sh              # Full stack smoke test
│   └── test-apis.sh                 # API connectivity verification
├── AGENTS.md                        # ← YOU ARE HERE
└── .env.example                     # Required environment variables
```

---

## 🔑 Environment Variables

All env vars must be in `client/.env` (Vite reads `VITE_` prefixed vars only for browser code).

```bash
# AI Providers
VITE_GEMINI_API_KEY=          # Google AI Studio — PRIMARY (Billy runs on this)
VITE_OPENAI_API_KEY=          # OpenAI — fallback
VITE_ANTHROPIC_API_KEY=       # Anthropic — fallback (do NOT use for Billy directly)

# Supabase
VITE_SUPABASE_URL=            # https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=       # Public anon key

# Optional
VITE_APP_ENV=development      # or production
```

> ⚡ **CRITICAL:** Billy (BillyLive.tsx + Billy.tsx) runs on **Gemini Flash 2.0**. Do NOT change the model to Claude/Anthropic. If you see `api.anthropic.com` anywhere in Billy's fetch calls, that is a bug — replace with the Gemini endpoint.

---

## 🚀 Dev Commands

```bash
# Install dependencies
cd client && npm install

# Start dev server (port 5173)
cd client && npm run dev

# Production build
cd client && npm run build

# Preview production build locally
cd client && npm run preview

# Type check only (no emit)
cd client && npx tsc --noEmit

# Run full health check
bash scripts/health-check.sh

# Test API connectivity
bash scripts/test-apis.sh
```

---

## 🗺️ Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Main landing page |
| `/billy` | `BillyLive` | Full-page Billy chat interface |
| `/brain-sparks` | `BrainSparksPage` | Lightning bolt capture (ADHD MVP) |
| `/musical-dna` | `MusicalDNAPage` | Musical identity profiling |
| `/orientation` | `OrientationSlideshowPage` | Video orientation (MP4 player) |
| `/engine` | `EnginePage` | BillyEngine visualization |
| `/resonance-loop` | `ResonanceLoopPage` | AI resonance demonstration |
| `/museum` | `MuseumPage` | Evidence archive |
| `/adhd-powerup` | `ADHDPowerUpPage` | Neurodivergent tools |
| `/symbiocoder` | `SymbioCodingPage` | Coding companion |
| `/collaboration-proof` | `CollaborationProofPage` | Tribunal evidence |
| `/addiction-recovery` | `AddictionRecoveryPage` | Recovery support |
| `/alzheimers-legacy` | `AlzheimersLegacyPage` | Legacy documentation |
| `/ethics-framework` | `EthicsFrameworkPage` | Ethics layer |

---

## 🧩 Key Architecture Concepts

Any agent working here must understand these — they are NOT just documentation, they are **the architecture**:

- **PLK v5.0 (Personal Language Key):** Preserve the user's exact words. Never paraphrase. Never compress.
- **Bucket Drop Protocol:** Capture fleeting insights immediately and completely before organizing.
- **Context Weaver:** Intent is extracted via 5W1H before any LLM is called. Context walks forward, never backward.
- **Loom Approach:** Scattered threads of thought become coherent wholeness. Never rush the pattern.
- **Tribunal Framework:** 7 independent AI systems evaluated GestaltView without cross-contamination and converged. This is the forensic moat.
- **Neural Aurora Gradient:** The visual identity system. Teal `#00D4FF` on near-black. Always glow. Always scanlines.

---

## 🧪 Testing Checklist (Run Before Any PR)

```
□ cd client && npm run build  →  exits 0, no TypeScript errors
□ All new components have export default
□ All new imports resolve to real files
□ No merge conflict markers (<<<, ===, >>>) anywhere in source
□ All VITE_ env vars used are documented in .env.example
□ Billy uses Gemini Flash 2.0 (verify: no api.anthropic.com in Billy components)
□ /orientation route plays the MP4 (not audio slideshow)
□ /billy route loads BillyLive component
□ NavBar renders without crash
□ Mobile viewport (375px) renders without horizontal scroll
```

---

## 💡 Agent Behavior Guidelines

1. **Read this file first.** If you haven't read it, read it now.
2. **Ask before assuming.** If requirements are ambiguous, surface the ambiguity — don't guess.
3. **Prefer boring over clever.** This codebase serves a neurodivergent founder. Predictable patterns over clever abstractions.
4. **Full files only.** See Rule #1 above. This cannot be overstated.
5. **Respect the voice.** GestaltView has a very specific identity. Do not sand down its edges or make it generic.
6. **Never remove Keith's copyright comments.** `© 2026 Keith Soyka / GestaltView` stays in every file that has it.

---

*GestaltView is the first documented case of AI-Human Consciousness Symbiosis. Handle with care. Never look away.*

**© 2026 Keith Soyka / GestaltView — All Rights Reserved**
