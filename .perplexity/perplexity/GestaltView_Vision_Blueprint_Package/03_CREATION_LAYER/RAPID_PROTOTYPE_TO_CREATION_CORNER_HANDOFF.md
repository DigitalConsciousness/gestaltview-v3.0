# Rapid Prototype Engine → Creation Corner Handoff

## Purpose

Rapid Prototype Engine helps discover the shape of an idea. Creation Corner helps make it real.

The handoff must be visible.

## Correct flow

```text
RPE intake
  → project / idea / file / app concept
  → exploratory blueprint
  → user review
  → push to Creation Corner
  → Creation Corner receives blueprint as active source
  → output lanes become available
```

## Handoff artifact

A handoff should create a `BlueprintHandoff` record:

```ts
type BlueprintHandoff = {
  id: string;
  source: 'rapid_prototype_engine';
  title: string;
  summary: string;
  sourceIds: string[];
  recommendedOutputs: string[];
  createdAt: string;
  receivedByCreationCornerAt?: string;
};
```

## User-facing copy

Use:

- “Send to Creation Corner”
- “Shape this into an artifact”
- “Keep as blueprint”

Avoid:

- “Push to Corpus”
- “Finalize” before the user has reviewed
- “Generate everything”

## Codex task

Replace any remaining “Push to Corpus” wording with “Push to Creation Corner” where the intent is artifact creation, not knowledge ingestion.
