# Profile Pipeline v1.0

> **Source of truth:** `client/src/lib/profilePipeline/`  
> **Spec anchor:** SPEC-GESTALTVIEW_FULL_ALIGNMENT_GAP_FILLER_v1.0 §7–§9

---

## Overview

The Profile Pipeline is the governed pathway through which user-generated material
(captures, scaffold approvals, identity claims) is promoted to durable artifacts that
live in the Dynamic Inner World. Every promotion event is wrapped in a
**ProvenanceEnvelope** that records the content hash, source capture IDs, pipeline run
ID, and consent state.

The pipeline enforces a strict one-way promotion boundary:

```
Capture Event
    │
    ▼
Profile Pipeline Run
    │  (ProvenanceEnvelope attached here)
    ▼
Artifact (Dynamic Inner World)
    │
    ▼
Scaffold Node (External Scaffold, approval-gated)
    │
    ▼
Creation Corner (forge, synthesis)
```

---

## Key Modules

| Module | Path | Responsibility |
|---|---|---|
| `types.ts` | `client/src/lib/profilePipeline/types.ts` | Canonical type definitions for `CaptureEvent`, `ArtifactRecord`, `ScaffoldNode`, `IdentityClaim`, `ProvenanceEnvelope`, `ProfilePipelineRun` |
| `client.ts` | `client/src/lib/profilePipeline/client.ts` | API client for pipeline RPC calls |
| `captureRouting.ts` | `client/src/lib/profilePipeline/captureRouting.ts` | Routes raw captures to the correct pipeline lane |
| `artifactRouting.ts` | `client/src/lib/profilePipeline/artifactRouting.ts` | Routes approved artifacts to the correct destination room |
| `scaffoldRouting.ts` | `client/src/lib/profilePipeline/scaffoldRouting.ts` | Routes scaffold nodes through the approval queue |
| `provenance.ts` | `client/src/lib/profilePipeline/provenance.ts` | Builds and validates `ProvenanceEnvelope` records |
| `events.ts` | `client/src/lib/profilePipeline/events.ts` | Pipeline-scoped event bus bindings |

---

## ProvenanceEnvelope

Every artifact promotion must include a `ProvenanceEnvelope`:

```typescript
interface ProvenanceEnvelope {
  contentHash: string;          // SHA-256 of the artifact content at promotion time
  sourceCaptureIds: string[];   // IDs of the CaptureEvents that contributed to this artifact
  pipelineRunId: string;        // ID of the ProfilePipelineRun that promoted this artifact
  consentState: "granted" | "pending" | "revoked";
  promotedAt: string;           // ISO 8601 timestamp
  promotedBy: "user" | "system" | "agent";
}
```

**Rule:** A file is not a promoted artifact until it has a valid `ProvenanceEnvelope`
attached. The pipeline will reject any promotion attempt that lacks one.

---

## Canonical Tables

The pipeline reads from and writes to these canonical Supabase tables:

| Table | Purpose |
|---|---|
| `capture_events` | Raw user captures (voice, text, upload, import) |
| `artifacts` | Promoted artifacts (Dynamic Inner World residents) |
| `scaffold_nodes` | Scaffold items awaiting approval |
| `identity_claims` | Governed identity claims with provenance |
| `profile_pipeline_runs` | Audit log of every pipeline execution |

**Legacy tables** (`bucket_drops`, `inner_world_artifacts`, `user_profile_ingestion_runs`,
`user_personality_dimensions`, `di_memory_events`, `billy_sessions`, `memory_entries`)
are **dual-write backfill targets only** during the v1.0 migration window. New code must
not read from them as a source of truth.

---

## Capture Seam

The Sanctuary room is the primary capture entry point. All four capture modalities
route through the pipeline:

| Modality | Component | Pipeline Lane |
|---|---|---|
| Text / Journal | `JournalEditor` | `text-capture` |
| Scrapbook | `ScrapbookPanel` | `media-capture` |
| Voice | `VoiceCaptureButton` | `voice-capture` |
| Upload / Import | `FileImportPanel` | `import-capture` |

Each capture creates a `CaptureEvent` record before any downstream processing begins.

---

## Governance Rules

1. **No promotion without provenance.** Every artifact must have a `ProvenanceEnvelope`.
2. **No identity claim without evidence.** Every `IdentityClaim` must reference at least
   one `CaptureEvent` as evidence.
3. **No DI identity export.** The pipeline may not be used to package or transfer a
   living DI identity. See Constitutional Invariant DI-4.
4. **Consent is required for sharing.** `consentState` must be `"granted"` before any
   artifact is shared outside the user's private interior.
5. **Dual-write during migration only.** Legacy tables receive writes only during the
   v1.0 migration window. After migration is complete, dual-write is disabled.

---

## Change Log

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0.0 | 2026-05-19 | Keith / Manus | Initial canonical doc. Aligned with SPEC §7–§9. |
