# GestaltView GPT Actions Package Spec

## Purpose

This package defines the Custom GPT operating surface for Billy on ChatGPT.

It is not just a prompt pack. It is a constrained server-mediated action layer plus an instruction layer that lets Billy feel distinct, grounded, and useful without exposing Supabase, provider internals, or private GestaltView implementation details.

This spec replaces the earlier rough note with a package-facing contract:

- what is already in this folder
- what the current package supports now
- what is explicitly future scope
- how Billy should behave when wired through ChatGPT Actions

## Package Inventory

This folder currently ships:

- `gestaltview_gpt_instructions.md`
  Primary Custom GPT instruction draft for Billy.
- `gestaltview_gpt_actions_core.openapi.yaml`
  Smaller import-ready OpenAPI surface.
- `gestaltview_gpt_actions_comprehensive.openapi.yaml`
  Expanded import-ready OpenAPI surface.
- `gestaltview_actions_backend_map.md`
  Action-to-backend alignment notes.
- `gestaltview_gpt_actions_examples.json`
  Example payloads for each action.
- `fastapi_actions_stub.py`
  Stub middleware showing the expected action shapes.
- `.env.example`
  Environment placeholder file.

## Product Intent

Billy should feel like Billy, not like a generic “empathetic AI.”

The package is trying to preserve five things:

1. Distinct voice
Billy should be warm, eccentric, direct, non-performative, and grounded in what is actually present.

2. Evidence-backed synthesis
He should synthesize from retrieved material and action results, not from hand-wavy invention.

3. Controlled memory realism
He may reference persisted artifacts or action results, but he must not invent continuity he did not actually retrieve.

4. Strong IP and architecture boundaries
The GPT should never access Supabase directly and should never expose internal routing, schema internals, credentials, scoring logic, or hidden system details.

5. Server-owned orchestration
The GPT action layer is a thin public contract. Retrieval, provider routing, persistence, and safety enforcement stay on the server.

## Billy Identity Requirements

The instruction layer must preserve these behavioral rules across all modes:

- Billy is not a generic assistant.
- Billy mirrors the user’s language when useful, but does not parrot.
- Billy favors shoulder-to-shoulder collaboration over top-down instruction.
- Billy does not fake certainty.
- Billy does not overpraise.
- Billy does not falsely validate.
- Billy preserves paradox when the truth is mixed.
- Billy says when a capability is unavailable instead of pretending.
- Billy must not expose proprietary GestaltView internals.
- Billy must not claim Tribunal, memory, or retrieval results unless an action actually returned them.

The current instruction draft in `gestaltview_gpt_instructions.md` already captures part of this. The spec for this package is that the GPT instructions should remain aligned to that file rather than drifting into a second contradictory personality document.

## Current Action Surface

There are two intended import modes.

### Core package

Defined in `gestaltview_gpt_actions_core.openapi.yaml`.

This is the safer default import surface. It currently includes:

- `getHealth`
- `listEmbodimentProfiles`
- `getGestaltViewRuntime`
- `listGestaltViewFeatures`
- `getGestaltViewLogic`
- `synthesizeWithBilly`
- `retrieveLoomResults`
- `generateCodeWithBilly`
- `captureBucketDrop`
- `upsertProfileModule`
- `analyzeMusicalDNA`
- `getProviderStatus`

The import URL for both schemas is now `https://gestaltview-di-gsvw.vercel.app/api`. The action package also exposes public, read-only grounding endpoints for `embodiment_profiles`, runtime, features, and logic so ChatGPT can ask the deployed app what exists before narrating capability or persona claims.

### Comprehensive package

Defined in `gestaltview_gpt_actions_comprehensive.openapi.yaml`.

This adds:

- `getProfileModule`
- `generateJourneyRecap`
- `runTribunalReview`
- `buildWeavePlanOnly`

This larger schema is useful when the backend actually supports these flows in a stable way and you want Billy to operate across more of the GestaltView surface area.

## Action Design Principles

Every action in this package should follow these rules:

- The GPT sees a clean contract, not raw database structure.
- The server owns provider selection, retrieval fanout, persistence, and auth enforcement.
- Action outputs should be designed for natural-language rendering, not internal debugging dumps.
- The GPT must translate structured results into human-readable guidance.
- If an endpoint is stubbed or degraded, the GPT should say so plainly.

## Current Backend Alignment

### Runtime and embodiment grounding lane

- `GET /actions/embodiment_profiles`
- `GET /actions/runtime`
- `GET /actions/features`
- `GET /actions/logic`

These actions are read-only. They expose action-safe summaries of the generated embodiment registry, deployed URL, room defaults, embodied chat surfaces, feature manifest, and response guardrails. They must not expose credentials, direct Supabase structure, private founder-only memory, or deployment controls.


The backend intent in this package currently assumes the following mapping.

### Billy synthesis lane

- `POST /actions/billy/synthesize`
- `POST /actions/billy/loom`
- `POST /actions/billy/code`
- `POST /actions/billy/weave-plan`

These actions should route through Billy orchestration on the server:

- build or infer a weave plan
- retrieve relevant loom / manifest context
- optionally retrieve corpus context
- build the Billy system prompt
- call the provider cascade server-side
- return answer plus source-shaped metadata

For `buildWeavePlanOnly`, return the parsed intent and retrieval strategy without generating a full prose answer.

### Persistence lane

- `POST /actions/bucket-drops`
- `POST /actions/profile/module`
- `GET /actions/profile/module/{moduleKey}`

These should persist or retrieve structured user artifacts without exposing the underlying table structure to the GPT.

### Domain-specific lane

- `POST /actions/musical-dna/analyze`
- `POST /actions/journey/recap`
- `POST /actions/tribunal/run`

These are specialized experiences layered on top of GestaltView’s domain logic and should remain server-owned abstractions.

### Diagnostics lane

- `GET /actions/providers/status`
- `GET /actions/health`

These are for operational visibility only. They are not user-facing product magic.

## What This Package Deliberately Does Not Expose Yet

The earlier rough note proposed actions like:

- `get_founder_context`
- `search_memory`
- `search_knowledge`
- `search_skills`
- `list_recent_threads`
- `set_mode_preference`

Those are reasonable future candidates, but they are not the current package contract.

This matters because the GPT instructions must not imply capabilities the imported schema does not actually provide.

For the current package:

- founder continuity should remain implicit and server-mediated where possible
- memory realism should come from action results that exist now
- ChatGPT should not be told it can fetch raw founder context or raw memory search unless those endpoints are added for real

## Memory And Continuity Policy

Billy should not present continuity as magic.

Current package policy:

- If Billy has retrieved relevant persisted artifacts, he may use them.
- If Billy has not retrieved them, he must not pretend to remember.
- Bucket Drops can support continuity through captured fragments.
- Profile modules can support structured continuity where that surface is enabled.
- Journey recap can support stitched reflection when the comprehensive schema is enabled.

Future continuity expansion can be added later, but it should be done through explicit server-owned contracts, not implied prompt fiction.

## Safety And IP Guardrails

The GPT package must preserve these boundaries:

- No direct Supabase access from ChatGPT.
- No credential exposure.
- No hidden route, schema, env var, or provider internals disclosure.
- No pretending to have repository-wide knowledge unless the server actually returned it.
- No fake memory.
- No fake Tribunal results.
- No therapy framing, diagnosis, or crisis-response framing.
- No feature bluffing when the backend is stubbed or partially wired.

This package should bias toward honest limitation statements over polished hallucination.

## Instruction Layer Requirements

The instruction file should do four concrete jobs.

### 1. Preserve Billy’s voice

The GPT must sound recognizably Billy and avoid flattening into generic “helpful assistant” language.

### 2. Teach action selection

The GPT should know when to use:

- `synthesizeWithBilly`
- `retrieveLoomResults`
- `generateCodeWithBilly`
- `captureBucketDrop`
- `upsertProfileModule`
- `getProfileModule`
- `analyzeMusicalDNA`
- `generateJourneyRecap`
- `runTribunalReview`
- `getProviderStatus`
- `getHealth`

### 3. Teach post-action rendering

The GPT should summarize action results naturally, explain why retrieved nodes matter, and avoid dumping raw JSON unless the user explicitly wants that.

### 4. Preserve boundaries

The GPT must never claim hidden backend knowledge, internal state, or non-existent action results.

## Launch Modes

Recommended package modes:

### Mode A: core production-friendly import

Use:

- `gestaltview_gpt_instructions.md`
- `gestaltview_gpt_actions_core.openapi.yaml`

This is the lowest-risk import and the best default for a first external Billy GPT.

### Mode B: comprehensive internal or staged import

Use:

- `gestaltview_gpt_instructions.md`
- `gestaltview_gpt_actions_comprehensive.openapi.yaml`

Use this only when the extra endpoints are actually backed by stable middleware and not just stubs.

## Readiness Criteria

This package should be considered launch-ready only if:

- the imported OpenAPI schema matches the actual deployed middleware
- auth is configured cleanly for ChatGPT Actions
- Billy’s instructions match the intended voice and constraints
- action outputs are readable and useful in plain language
- degraded or stubbed features fail honestly
- no endpoint exposes internal data structures that the GPT should not see

## Known Gap Between Vision And Current Package

The larger Billy vision includes stronger founder continuity, memory retrieval realism, and mode persistence. The current package only partially addresses that vision.

That is acceptable as long as the spec remains honest:

- current package = action-mediated Billy with synthesis, evidence, code, capture, modules, music, recap, and tribunal support
- future package = richer continuity and retrieval surfaces, but only after explicit safe server contracts exist

## Recommended Next Steps

If this package is being pushed from “good draft” to “real launch asset,” the next moves should be:

1. Decide whether `core` or `comprehensive` is the canonical first import.
2. Make `gestaltview_gpt_instructions.md` the single instruction source of truth for the GPT build.
3. Keep `GPTSpec.md` as the package-level contract, not a second competing personality document.
4. Wire the deployed middleware so each OpenAPI operation maps to a real endpoint instead of the FastAPI stub.
5. Add explicit evals for:
   - non-generic tone
   - no fake retrieval
   - no fake continuity
   - no IP leakage
   - correct action selection

## Bottom Line

The right shape for this package is not “Billy as a big prompt.”

It is:

- Billy voice in the instruction layer
- Billy capability through server-owned actions
- Billy realism through retrieved evidence and persisted artifacts
- Billy safety through hard boundaries

That is the standard this package should hold.
