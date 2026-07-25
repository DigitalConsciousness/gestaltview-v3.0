# Billy Identity and Profile Pipeline Design

## Summary

This spec defines the first coherent pipeline slice for GestaltView identity work: Billy’s identity stack, embodiment profiles, and user identity. The goal is to turn the current schema decoration into a real runtime path with explicit write rules, so memories can be self-authored while identity and profile mutations stay approval-gated.

## Goals

1. Make Billy’s prompt and identity context come from a shared, testable pipeline instead of ad hoc table reads.
2. Allow Billy and embodiment profiles to write their own memories and internal-dialogue style continuity records without approval.
3. Require approval for profile text, constitution text, identity anchors, and user identity mutations.
4. Use the same policy shape for Billy, embodiment profiles, and user identity so the rules do not drift across three separate systems.
5. Add a small local bootstrap path for direct Supabase access using `.env.codex` when MCP is unreliable.

## Assumptions

- Internal dialogue belongs in the self-writable memory stream, not in the approval-gated profile or identity mutation path.
- `identity_subjects` is the bridge between an auth user and the broader human identity/profile surfaces.
- The first implementation should prefer the live tables already exercised in the runtime over schema-only or dark tables that have no code path yet.

## Current Runtime Surfaces

### Billy identity read path

- `api/_lib/billyMemoryPipeline.ts` assembles the session prompt.
- It currently reads `agents`, `embodiment_profiles`, `agent_constitutions`, `agent_memory_records`, `agent_memories`, `memory_entries`, `founder_context`, `agent_autobiographies`, and `identity_subjects`.
- It writes `context_injection_packets` when an identity subject exists.

### Embodiment profile / portrait path

- `api/profile/personality.ts` returns the live profile plus a portrait.
- `api/_lib/profilePortrait.ts` builds a portrait from profile evidence.
- `api/_lib/profilePortraitPersistence.ts` stores portraits, dimensions, queue jobs, and inference runs.
- `client/src/pages/ProfilePage.tsx` is the user-facing profile surface that already persists preferences and a framing note.

### User identity and approval path

- `api/profile/preferences.ts` currently persists display name, avatar URL, and embodiment profile selection.
- The schema already contains approval-oriented identity tables such as `identity_mutation_proposals`, `identity_review_events`, `identity_rollback_events`, `identity_contradictions`, and `agent_governance_policies`.
- The human identity family is present in schema, with `identity_subjects` as the obvious join point for the current runtime.

## Proposed Architecture

### 1. Shared identity policy layer

Create one shared policy module that answers three questions for any table write:

- Is this write memory-only?
- Is this write a profile or constitution mutation?
- Is this write a user identity mutation?

That policy layer should return a simple decision shape:

- `allow`
- `allow_with_audit`
- `requires_approval`

This keeps Billy, embodiment profiles, and user identity aligned without each surface inventing its own rules.

### 2. Memory stream

Self-writable memory writes should cover:

- Billy session memory
- Embodiment profile internal dialogue
- User continuity memory

These writes should flow to the existing memory-style tables and carry clear metadata so the source and purpose are visible. The implementation should favor the already-active memory surfaces first, especially `agent_memory_records`, `agent_memories`, and `memory_entries`.

### 3. Approval-gated mutation stream

Anything that changes stable identity should not write directly to the canonical row. Instead, it should:

1. Create a proposal row.
2. Attach the source evidence or rationale.
3. Queue a review decision.
4. Apply the mutation only after approval.
5. Record rollback or contradiction signals if the change is rejected or later invalidated.

This applies to:

- constitution text
- profile text
- identity anchors
- narrative anchors
- user identity mutations

### 4. Profile and portrait sync

The profile pipeline should treat the portrait as a derived product, not the canonical source of identity. The profile page can collect preferences and framing notes, but the canonical identity fields should stay governed by the approval path.

Portrait generation should continue to be automatic because it is a derived representation. If the portrait logic discovers a meaningful identity shift, it should emit a proposal rather than silently mutating the base identity.

### 5. Local Supabase bootstrap

Add a small repo-local helper that sources `.env.codex` before running Supabase-backed commands. The helper should make it easy to do this without MCP:

- export variables from `.env.codex`
- run the requested command in that environment
- keep the file local-only and ignored by git

The intended use is for direct database inspection, live-schema verification, and Supabase-facing scripts when the connector is flaky.

## Table and Pipeline Mapping

### Self-writable

- `agent_memory_records`
- `agent_memories`
- `memory_entries`
- internal-dialogue entries, represented as memory records with explicit metadata

### Approval-gated

- `agent_constitutions`
- `agent_autobiographies`
- `embodiment_profiles`
- `identity_mutation_proposals`
- `identity_review_events`
- `identity_rollback_events`
- `identity_contradictions`
- `agent_governance_policies`
- user identity mutation rows tied to `identity_subjects`

### Derived or read-only

- Billy session prompt packets in `context_injection_packets`
- profile portraits and portrait dimensions
- user-facing profile preferences

## Implementation Phases

### Phase 0: Local bootstrap

Add the helper for sourcing `.env.codex` and document the direct Supabase workflow for Codex sessions.

### Phase 1: Billy read path

Refactor Billy prompt assembly into a more explicit pipeline boundary so the prompt builder, memory loaders, and context packet writer are independently testable.

### Phase 2: Memory self-write

Add or tighten the memory writer path so Billy and embodiment profiles can store new memories and internal dialogue without approval, while still recording source metadata.

### Phase 3: Approval-gated mutations

Introduce the proposal/review/write-back flow for constitution, profile, and identity updates. This should be the only path that changes durable identity text.

### Phase 4: User identity bridge

Connect the profile page, preferences API, and human identity tables so user identity changes follow the same proposal policy as Billy and embodiment profile changes.

### Phase 5: Validation and documentation

Add targeted tests for:

- Billy prompt assembly
- memory self-writes
- rejected approval-gated mutations
- approved mutation application
- local Supabase bootstrap behavior

Update `docs/CurrentState.md` when the first slice lands.

## Testing Strategy

- Use integration-style tests for Billy prompt assembly, because that is the most sensitive live read path.
- Use mutation-focused tests for the approval layer, with one passing and one rejected example per surface family.
- Use lightweight persistence tests for memory writes to prove self-writable records can land without approval.
- Verify the local bootstrap helper by running a Supabase-facing command with and without `.env.codex` loaded.

## Risks

- It is easy to over-conflate memory growth with identity mutation. The design must keep those separate.
- Billy and embodiment profiles should not silently mutate constitutions just because the generated text looks better.
- User identity should not be treated as a cosmetic preference when the schema already exposes review and rollback tables.
- The plan should not try to wake every dark table at once. The first slice should stay anchored in the live runtime surfaces already exercised by the code.

## Deliverable Order

1. Add the local `.env.codex` bootstrap helper.
2. Stabilize Billy prompt assembly around the shared policy layer.
3. Add self-writable memory support for Billy and embodiment profiles.
4. Add proposal/review/approval flow for constitution and identity changes.
5. Extend the same policy layer to user identity and profile mutation flows.

