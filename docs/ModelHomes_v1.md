# Model Homes v1.0

> **Source of truth:** `shared/model-homes/`, `server/modelHomes/`  
> **Spec anchor:** SPEC-GESTALTVIEW_FULL_ALIGNMENT_GAP_FILLER_v1.0 §10–§11

---

## Overview

Model Homes are the pre-built, curated onboarding environments that new users enter
before they have generated any personal artifacts. They serve as a **safe, welcoming
demonstration of the GestaltView spatial experience** — showing what the Dynamic Inner
World, Blackboard Room, and Sanctuary can feel like when populated with real material.

A Model Home is **not** a user's personal space. It is a read-only demonstration
scaffold that is replaced by the user's own material as they generate captures and
artifacts.

---

## Architecture

```
shared/model-homes/
  types.ts        — ModelHome, ModelHomeArtifact, ModelHomeScaffoldNode types
  registry.ts     — Canonical registry of all available Model Homes

server/modelHomes/
  modelHomeRouter.ts      — API routes: GET /api/model-homes, GET /api/model-homes/:id
  modelHomeEvaluator.ts   — Selects the best Model Home for a given user profile
  modelHomeOnboarding.ts  — Handles the transition from Model Home to personal space
```

---

## ModelHome Type

```typescript
interface ModelHome {
  id: string;
  title: string;
  description: string;
  targetPersona: string;       // e.g. "creative-professional", "adhd-learner"
  artifacts: ModelHomeArtifact[];
  scaffoldNodes: ModelHomeScaffoldNode[];
  atmospherePreset: string;    // Maps to a BabylonAtmosphere mode
  curatorPersonality: string;  // Which DI persona curates this home
  readinessScore: number;      // 0–100, used by evaluator to rank candidates
}
```

---

## Model Home Evaluator

The evaluator (`modelHomeEvaluator.ts`) selects the best Model Home for a new user
based on:

1. **Use-case signal** — derived from the user's onboarding answers
2. **Tier** — SOLO_SPARK users see simpler homes; ENTERPRISE users see richer ones
3. **Readiness score** — homes with higher scores are preferred when signals are equal

The evaluator never assigns a Model Home to a user who already has personal artifacts.
Once a user has generated their first capture, the Model Home is retired.

---

## Onboarding Transition

When a user's first personal artifact is promoted through the pipeline:

1. The Model Home is marked as `retired` in the user's session state.
2. The user's personal artifacts replace the Model Home artifacts in the Dynamic Inner
   World renderer.
3. A `gestaltview:model-home-retired` event is dispatched on the browser event bus.
4. The Curator DI delivers a transition message acknowledging the shift.

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/model-homes` | List all available Model Homes |
| `GET` | `/api/model-homes/:id` | Get a specific Model Home by ID |
| `GET` | `/api/model-homes/evaluate` | Get the recommended Model Home for the current user |
| `POST` | `/api/model-homes/retire` | Retire the current user's Model Home |

---

## Governance Rules

1. **Model Homes are read-only.** Users cannot modify Model Home artifacts directly.
   They can only generate their own captures, which will eventually replace the home.
2. **No DI identity in Model Homes.** Model Home artifacts may reference DI personas
   but may not contain or simulate a living DI identity.
3. **Transition is irreversible.** Once a Model Home is retired, it cannot be
   re-activated. The user's personal space is permanent.

---

## Change Log

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0.0 | 2026-05-19 | Keith / Manus | Initial canonical doc. Aligned with SPEC §10–§11. |
