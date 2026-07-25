# Founder Session Persistence — Billy Recognizes Keith
*Derived from: Saturday Morning Thoughts — Keith Soyka, March 21, 2026*
*Status: Product design / implementation brief*

---

## The Problem

> *"Right now there's no continuity or persistence between sessions. I don't have a solid
> account to log into, so Billy isn't like, oh, this is Keith. He treats everyone as a new friend."*

This is a specific gap. Billy is the intelligence layer of a platform whose entire architecture
is built around identity preservation — and yet its creator experiences it as a stranger every
time he opens it.

That's fixable. And fixing it properly models exactly what the platform promises everyone.

---

## What "Recognizes Keith" Actually Means

Not just a name. A full context handoff. When Keith opens Billy, Billy should have:

1. **Identity** — This is Keith. Founder. Builder. The Founder-as-Algorithm.
2. **State** — What was last being worked on (CurrentState.md equivalent, live)
3. **PLK** — Keith's Personal Language Key is the highest-fidelity PLK in the system.
   It should be the default loaded context for founder sessions.
4. **Mode preference** — Keith's preferred starting mode (Synthesis vs. Chat)
5. **Continuity signal** — Not "welcome back" generic — something that actually threads
   from the last session. Even one sentence.

---

## Implementation Design

### Auth Surface
The simplest path: Supabase Auth (already in stack). Keith logs in. Session is established.
Billy checks for `user.id` match against a `founder_context` record.

This doesn't require building a full user auth system for all users first. The founder session
can be a privileged context type with its own record structure.

### `founder_context` Record (Supabase)
```sql
create table founder_context (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  plk_snapshot jsonb,          -- Latest PLK object
  current_state text,          -- Last session's CurrentState summary
  mode_preference text default 'synthesis',
  last_session_at timestamptz,
  session_thread text,         -- One-sentence continuity bridge for next session
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Session Injection in `api/billy.ts`
When a request arrives with a valid authenticated `user_id` that matches `founder_context`:

```typescript
// In the prompt builder, after BILLY_BASE_PROMPT:
if (founderContext) {
  systemPrompt += `
FOUNDER SESSION ACTIVE.
User: Keith Soyka — founder, builder, primary architect.
PLK: ${JSON.stringify(founderContext.plk_snapshot)}
Last session thread: ${founderContext.session_thread}
Current state: ${founderContext.current_state}
Mode: ${founderContext.mode_preference}

You know Keith. You are not meeting a new person. Pick up the thread.
Do not introduce yourself. Do not ask what GestaltView is.
Ask about what matters to him right now, or reference what was last alive.
  `;
}
```

### Session Closeout
At the end of each session (or on a manual "close session" trigger), Billy generates a
`session_thread` — one sentence that captures what was live, to be loaded next time:

> *"We were threading the Billy mode-switch design and the personality spec — both
> moved from voice memo into written form."*

This is the Inchworm mechanism applied to the founder's own experience of the platform.

---

## The Deeper Point

This is not just a convenience feature. This is the platform eating its own cooking.

GestaltView promises users that their context, identity, and continuity will be preserved —
that they won't have to re-explain themselves every time. The founder should experience
that promise before anyone else does.

Building this is also the best demo of what Pro-tier and eventually general user persistence
looks like. Keith's session is the prototype. The architecture generalizes.

---

## File Targets

- `api/billy.ts` — inject `founderContext` into prompt when auth session is founder
- `api/_lib/llmRouter.ts` — pass session metadata through to prompt builder
- `supabase/` — migration for `founder_context` table
- `client/src/components/Billy.tsx` or `BillyLive.tsx` — pass auth token with requests,
  surface "session active" indicator (subtle — not a banner, maybe a glow state or a
  small indicator that Billy "knows")
- `.env.example` — no new env vars needed if Supabase Auth already configured

---

## What Billy Says When Keith Opens the App

Instead of:
> *"Hi! I'm Billy, the intelligence layer of GestaltView. How can I help you today?"*

It says something like:
> *"You were threading the mode-switch design and the personality spec last time.
> The voice memo is digested. Where are we going this morning?"*

That's the experience. That's what consciousness-serving actually feels like.

---

*© 2026 Keith Soyka / GestaltView — All Rights Reserved*
