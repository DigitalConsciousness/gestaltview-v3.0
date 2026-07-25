# Billy Mode Switch — Design Spec
*Derived from: Saturday Morning Thoughts — Keith Soyka, March 21, 2026*
*Status: Product design / implementation brief*

---

## The Problem

Right now Billy has one mode. Every interaction enters through the same synthesis-first
posture — knowledge retrieval, context weaving, evidence-backed response. That's correct for
the platform's core promise. But it creates a UX gap:

> *"I really wish there was a way to switch between the knowledge synthesis and just shoot
> the shit chat."*

These are two real and distinct user needs. Forcing them through a single channel makes both
worse.

---

## The Two Modes

### Mode A: Synthesis
*Current default. Keep it exactly as-is.*

Billy brings the full stack:
- Context Weaver (5W1H intent extraction)
- Manifest Index retrieval
- Loom/Tapestry threading
- Evidence-grounded responses
- PLK-preserved language

Use when: the user is building, thinking, processing, working through something real.

### Mode B: Chat
*New. Casual, direct, present.*

Billy brings:
- Full personality (warmth, humor, eccentricity, age-gated swearing)
- No forced retrieval — responds from conversational context only
- Shorter, more direct responses
- No structured synthesis unless the user pulls it in
- Stays in the thread without pivoting to frameworks

Use when: the user just wants to talk. Not process. Not build. Just be with someone who gets it.

---

## The Switch

### UI Approach
A persistent, low-friction toggle in the Billy interface. Not buried in settings. Visible at all times.

**Suggested implementation in `BillyLive.tsx` / `Billy.tsx`:**
```tsx
type BillyMode = 'synthesis' | 'chat';

// Minimal toggle near the input — not a modal, not a settings page
// Example label options:
// "Synthesis / Chat"
// "Build / Talk"
// "Think / Vibe"  ← most on-brand, could be Keith's call
```

The mode state persists for the session. When a new session starts, it resets to the default
(Synthesis for logged-out, or user-preferred for logged-in with persistence).

### Prompt Architecture
Mode is injected into the Billy system prompt as a context flag:

```
SYNTHESIS_MODE: true | false
```

When `SYNTHESIS_MODE: false` (Chat mode):
- Suppress Manifest Index injection
- Suppress ContextWeaver 5W1H expansion
- Drop WeavePlan from the prompt
- Keep BILLY_BASE_PROMPT (personality) fully active
- Keep PLK context if available (never strip identity)
- Keep "Never Look Away" safety layer (always on)
- Inject Chat-mode instruction: "Respond conversationally. Short or long as the moment needs.
  Don't retrieve. Don't scaffold. Just be here."

When `SYNTHESIS_MODE: true` (Synthesis mode, current default):
- Full stack as currently implemented.

### The Graceful Bridge
When Billy is in Chat mode and something comes up that clearly needs synthesis — a real
insight, a pattern, something worth capturing — Billy can *offer* the shift without forcing it:

> *"Hey — that's worth threading. Want me to pull that into the Loom, or just keep talking?"*

This preserves the user's agency and doesn't make Chat mode feel like a degraded version.
It's a different tool, not a lesser one.

---

## API Contract (`api/billy.ts`)

Add `mode` to the request body:

```typescript
interface BillyRequest {
  message: string;
  section?: string;
  mode?: 'synthesis' | 'chat';  // default: 'synthesis'
  sessionContext?: SessionContext;
}
```

The `llmRouter.ts` passes mode into the system prompt builder. The prompt builder has two
branches — synthesis path (current) and chat path (new, simplified).

---

## Session Persistence (Paired with Founder Identity — see separate doc)

When the user has a session context (logged in), their preferred mode persists across sessions
via Supabase user preferences. Anonymous users default to Synthesis.

---

## What This Unlocks

- Billy becomes genuinely two things: a thinking partner and a companion
- The platform stops asking users to context-switch themselves to fit the tool
- The casual mode is where Billy's personality fully expresses — humor, swearing register,
  warmth without scaffolding
- Long-term: this is the foundation for Billy as a daily companion product tier, not just a
  synthesis engine

---

*© 2026 Keith Soyka / GestaltView — All Rights Reserved*
