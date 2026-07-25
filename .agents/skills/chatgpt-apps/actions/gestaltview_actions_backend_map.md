# GestaltView Actions Backend Map

This file maps each GPT Action to the uploaded GestaltView schema and Billy engine so implementation stays aligned with the real architecture.

## 1. `POST /actions/billy/synthesize`
**Purpose**
Primary Billy synthesis endpoint.

**Suggested backend flow**
1. Build `WeavePlan` from the request query.
2. Run Loom retrieval across the Manifest.
3. Optionally retrieve corpus chunks from the canonical knowledge store.
4. Build the Billy system prompt.
5. Route through your provider cascade server-side.
6. Return answer + provider + weave plan + loom results.

**Maps to**
- `buildWeavePlan()`
- `queryLoom()`
- `buildBillySystemPrompt()`
- `billyCall()`

## 2. `POST /actions/billy/loom`
**Purpose**
Evidence-shaped response for Manifest/Loom retrieval.

**Implementation note**
Reuse the same underlying flow as synthesize, but bias the response toward `queryLoom()` output and structured explanation.

## 3. `POST /actions/billy/code`
**Purpose**
Billy in code mode.

**Implementation note**
Route the request through the same synthesis pipeline but pin mode to `code` so the system prompt uses the code-oriented instructions.

## 4. `POST /actions/billy/weave-plan`
**Purpose**
Return the parsed Weave Plan without generating a full answer.

**Implementation note**
Useful for debugging or exposing the Context Weaver as a first-class tool.

## 5. `POST /actions/bucket-drops`
**Purpose**
Persist Bucket Drops exactly as they arrived.

**Suggested storage**
Persist to the `bucket_drops` model from the schema. Add server-generated IDs and timestamps.

## 6. `POST /actions/profile/module`
**Purpose**
Create or update module data for `module_0` through `module_12`.

**Suggested storage**
Store either in a normalized profile table or a JSON document layer keyed by `moduleKey`.

## 7. `GET /actions/profile/module/{moduleKey}`
**Purpose**
Read back stored module data.

## 8. `POST /actions/musical-dna/analyze`
**Purpose**
Run the Musical DNA processor and store analysis outputs.

**Suggested storage**
Persist to the `musical_dna_analyses` model.

## 9. `POST /actions/journey/recap`
**Purpose**
Generate a "Journey So Far" style integration recap.

**Suggested backend flow**
Aggregate selected modules, recent Bucket Drops, music cues, and optionally recent synthesis summaries.

## 10. `POST /actions/tribunal/run`
**Purpose**
Draft multi-perspective review.

**Implementation note**
Keep this controlled. A safe first version can fan out to multiple prompts internally and normalize the outputs into a draft consensus object.

## 11. `GET /actions/providers/status`
**Purpose**
Expose provider availability and circuit-breaker state.

## 12. `GET /actions/health`
**Purpose**
Simple health check for the GPT action middleware.

## Suggested deployment pattern
- Put all provider and database credentials on the server.
- Keep the GPT Action layer thin and deterministic.
- Make the Action middleware the single public surface for Custom GPTs.
- Choose one canonical knowledge-store path before production if your repo still contains multiple schema generations.
