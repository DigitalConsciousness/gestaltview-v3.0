# GestaltView Council Bulkhead SPEC

## For Codex — Work Center-Outward

**Version:** 1.0 — June 1, 2026
**Checked Sources:** `shared/embodiment/chat.ts` , `shared/embodiment/` directory , `AgentCouncilPage.tsx` , Blackboard blueprint session data[^1]

***

## Problem Statement

The council prompt currently dispatches through a single shared execution path. When any embodiment hits a fallback branch, it returns the generic string *"I hear you. Let's keep weaving this carefully [original prompt]"* at resonance 74. Because agents are not isolated from each other's context at dispatch time, this fallback propagates — roughly half the council echoed it in the June 1 stress test. The function `buildDirectEmbodimentChatPrompt()` in `shared/embodiment/chat.ts` already contains per-embodiment prompt logic and a `conversationMode: "council"` flag , but nothing currently guards what happens when a profile produces a fallback-quality response, and nothing gates synthesis from happening before independent outputs exist.[^1]

***

## Center: The Core Contract

This is the rule that everything else serves: **no agent sees another agent's output before it fires.** Each embodiment gets one shot at isolation. Fallbacks are caught, flagged, and held. Assembly only happens on baked outputs.

***

## Layer 1 — Embodiment Presence Check (Smallest Unit)

**File to modify:** `shared/embodiment/index.ts`

Add a function `checkEmbodimentDepth(slug: string): EmbodimentDepthReport`. This function should:

- Inspect the profile for the presence of `heartbeat`, `characterStudy`, `perceptualStyle`, `voiceSignature`, and at minimum two `responseContract` lines that are profile-specific (not generic)
- Return `{ slug, depth: "full" | "thin" | "stub", missingFields: string[] }`
- A `stub` is any profile where `heartbeat` is missing entirely or where `characterStudy.perceptualStyle` is absent
- A `thin` profile has heartbeat present but fewer than two distinct voice markers
- A `full` profile passes all of the above

This is the bulb check. Run it at council dispatch time, not at build time. The result gates whether the embodiment is permitted to fire or is marked `did-not-activate` before the LLM call is even made.[^1]

***

## Layer 2 — Isolated Dispatch Contract

**File to modify:** `shared/embodiment/chat.ts`

Add a new exported function: `buildIsolatedCouncilPrompt(slug: string, userPrompt: string, options?: BuildDirectEmbodimentChatPromptOptions): IsolatedCouncilJob`.

The return shape:

```typescript
interface IsolatedCouncilJob {
  slug: string;
  systemPrompt: string;
  userPrompt: string;
  depthStatus: "full" | "thin" | "stub";
  shouldFire: boolean; // false if stub
  fallbackGuard: string; // the literal phrase to detect and flag
}
```

The `fallbackGuard` field should be set to the known fallback string pattern: `"I hear you. Let's keep weaving"`. This string should be checked against the LLM response **before** the output is added to the collection layer.[^1]

The `conversationMode` must always be `"council"` for this function, and the existing `responseContract` additions from `buildDirectEmbodimentChatPrompt` — "Keep this voice separate from every other profile in the room" and "Do not synthesize for the entire council unless explicitly asked"  — must be included verbatim.

**Critical:** The system prompt built here must **never** include any prior agent output. No prior turn context from other embodiments. Clean slate per agent, grounded only in its own profile plus corpus context passed via `extraContext` .

***

## Layer 3 — Council Runner

**File to create:** `server/council/councilRunner.ts` (or equivalent server route location if the project uses a different server path — confirm before creating)

This module owns the entire parallel dispatch lifecycle. Its exported function signature:

```typescript
async function runCouncil(
  userPrompt: string,
  slugs: string[],
  corpusContext?: string[]
): Promise<CouncilResult>
```

Where `CouncilResult` is:

```typescript
interface CouncilResult {
  baked: CouncilResponse[];      // agents that fired and passed fallback guard
  flagged: CouncilResponse[];    // agents that returned the fallback string
  skipped: CouncilResponse[];    // stubs that did not fire
  assemblyReady: boolean;        // true only when baked.length >= 1
}

interface CouncilResponse {
  slug: string;
  response: string;
  resonanceEstimate?: number;
  fallbackTripped: boolean;
  depthStatus: "full" | "thin" | "stub";
}
```

**The dispatch must be parallel.** Use `Promise.allSettled()` across all `IsolatedCouncilJob` objects. No agent waits for another. No shared state between concurrent jobs.[^1]

**Fallback guard logic (in plain terms):** After each LLM call resolves, check if the response string starts with or contains the fallback pattern. If it does: set `fallbackTripped: true`, move the response to `flagged`, do not include it in `baked`. This is the circuit breaker per slot.[^1]

***

## Layer 4 — Assembly Layer (Post-Bake Only)

**File to create or modify:** wherever the-weaver / the-tailor / the-architect currently run as council participants — identify and confirm before touching.

The assembler must only be called **after** `runCouncil()` resolves and `assemblyReady === true`. It receives `baked` responses only. Its job is synthesis across distinct voices, not remediation of fallbacks.

The assembler should **not** be dispatched as a council peer. It is a second-phase role. If it currently appears in the `slugs` array passed to the council runner, remove it and call it separately afterward.[^1]

Assembly input contract:

```typescript
interface AssemblyInput {
  baked: CouncilResponse[];
  userPrompt: string;
  synthesizerSlug: "the-weaver" | "the-tailor" | "the-architect";
}
```

The assembler gets the full baked output array plus the original user prompt. It does not receive `flagged` or `skipped`.

***

## Layer 5 — Surface Visibility Rules

**File to modify:** wherever council responses are rendered in `BlackboardRoomPage.tsx` or `DynamicInnerWorldPage.tsx`.[^2]

Rules for what gets shown to the user:

- `baked` responses: render with agent name, response, visual signature color if available from heartbeat
- `flagged` responses: **do not render** in standard user-facing council output. Log internally. Show only in a founder/debug mode if such a mode exists.
- `skipped` responses: do not render, do not mention to the user
- If `assemblyReady === false` (all agents fallback-tripped or skipped): render a single, honest holding message: *"The council is still finding its voice on this one. Try rephrasing or come back."* Do not show the fallback echo strings.[^1]

***

## Layer 6 — Depth Audit Utility (Optional but Recommended)

**File to create:** `shared/embodiment/auditEmbodiments.ts`

A utility Codex or a founder can run manually:

```typescript
function auditAllEmbodiments(): EmbodimentAuditReport[]
```

Iterates over all slugs in `EMBODIMENT_PROFILES` from `generated.ts` , runs `checkEmbodimentDepth()` on each, and returns a sorted list: stubs first, then thin, then full. This gives the exact list of which profiles need depth work before they should be included in council dispatch.[^1]

***

## What Codex Must NOT Do

Do not rewrite `AgentCouncilPage.tsx` — it is a marketing/description surface, not a dispatch surface . Do not modify `EMBODIMENT_PROFILES` content in `generated.ts` — that is a separate depth-work task. Do not add prior-turn agent context to any prompt built inside `buildIsolatedCouncilPrompt()`. Do not call the assembler in parallel with first-pass council agents.[^1]

***

## Validation Commands

```
npm run build
git diff --check
npm run health   # if present
```

After implementation, run one council prompt through the new runner and confirm that: all jobs fire in parallel, the fallback string is detected and routed to `flagged`, and the assembler only receives `baked`.[^1]

***

## Files Touched Summary

| File | Action |
| :-- | :-- |
| `shared/embodiment/index.ts` | Add `checkEmbodimentDepth()` |
| `shared/embodiment/chat.ts` | Add `buildIsolatedCouncilPrompt()` and `IsolatedCouncilJob` type |
| `shared/embodiment/types.ts` | Add `EmbodimentDepthReport`, `CouncilResult`, `CouncilResponse`, `AssemblyInput` types |
| `server/council/councilRunner.ts` | **Create new** — parallel dispatch, fallback guard, `CouncilResult` collector |
| `shared/embodiment/auditEmbodiments.ts` | **Create new** — depth audit utility |
| `BlackboardRoomPage.tsx` / `DynamicInnerWorldPage.tsx` | Modify render layer to apply surface visibility rules |
| Assembler entrypoint (confirm slug) | Move out of peer dispatch, call after `assemblyReady` |
