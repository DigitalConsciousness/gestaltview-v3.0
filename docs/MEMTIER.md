# MEMTIER — GestaltView Tiered Memory Persistence Strategy

**Version:** 1.0  
**Last updated:** 2026-06-28  
**Status:** Canonical  
**Companion docs:** `docs/ContinuityStack.md`, `docs/ContextPersistenceProtocol.md`, `docs/SessionHandoffPacket.md`

---

## Purpose

MEMTIER is the unified doctrine for what gets remembered in GestaltView, at what fidelity, for how long, and which surfaces can read or write it.

It unifies three previously separate surfaces:
- The **Supabase schema** (storage model)
- The **ContinuityStack** (session persistence logic)
- The **Embodiment Profile system** (identity-scoped constitutional memory)

Without this doctrine, memory decisions are made ad hoc per session. With it, every agent, every surface, and every sync script has a single authoritative answer to: *where does this go?*

---

## The Five Tiers

| Tier | Name | Primary Surface | TTL / Scope | Access |
|------|------|-----------------|-------------|--------|
| **T0** | Ephemeral | React context, in-session state, browser memory | Session only — never persisted | Read/write during session; dropped on close |
| **T1** | Hot Operational | `memory_entries`, `agent_memories` | Rolling window — recent activity | Agent runtime load, burst-read per session start |
| **T2** | Accumulative | `human_memory_records`, `agent_constitutions` | Persistent — grows over time | Long-term identity formation, behavioral drift tracking |
| **T3** | Corpus / Knowledge | `knowledge_fragments`, `documents`, `embeddings`, `skill_fragments` | Immutable once committed | Indexed, vector-retrievable knowledge base |
| **T4** | Embodiment | `embodiment_profiles/*.embodiment.json`, `shared/embodiment/generated.ts`, Supabase embodiment rows | Versioned / canonical | Identity anchors, constitutional memory, GATE-exportable |

---

## Tier Definitions

### T0 — Ephemeral

T0 is the working scratchpad of the current session. It lives entirely in the browser or in-process memory and is intentionally not persisted. This includes:

- Active React state and context
- Unsaved draft inputs
- Live agent working context not yet committed to T1

**Write rule:** Nothing from T0 is persisted automatically. The ContinuityStack handoff checklist (`docs/ContextPersistenceChecklist.md`) is the gate that decides whether a T0 artifact gets promoted to T1 before session close.

**Drop rule:** If it is not explicitly promoted, it is gone. This is by design — T0 is cheap and fast precisely because it carries no durability obligation.

---

### T1 — Hot Operational

T1 is the rolling short-term memory of active agents and recent human sessions. It is read at session start to rehydrate working context and written during and after sessions to preserve operational continuity.

**Supabase tables:**
- `memory_entries` — agent runtime memories, scoped by agent and session
- `agent_memories` — structured agent memory records with source attribution

**Write rule:** Promote from T0 to T1 when the content is needed to resume a session accurately. Use the handoff packet format (`docs/SessionHandoffPacket.md`) to decide what is worth writing.

**Read rule:** Load T1 at session start as the first context hydration pass before any corpus retrieval.

**Retention:** T1 has a rolling retention window. Old entries are eligible for promotion to T2 (if identity-relevant) or archival (if operational-only). Entries that are neither are dropped.

---

### T2 — Accumulative

T2 is long-term identity memory. It records not just what happened but how the agent or human behaved, decided, and changed over time. It is the substrate from which identity continuity is built.

**Supabase tables:**
- `human_memory_records` — structured long-term memory for human users
- `agent_constitutions` — constitutional memory for agents, including `immutable_core` jsonb and `primary_narrative_anchor`
- `human_cognition_profiles` — structured model of how a specific human thinks (attention, working memory, planning, reasoning, language, executive controls, decision policy)

**Write rule:** Promote from T1 to T2 when a memory reflects a pattern, a value, a preference, or a behavioral anchor — not just an event. T2 writes should be deliberate, not automatic.

**Read rule:** T2 is loaded as the identity layer during embodiment resolution — it informs how an agent speaks, decides, and relates, not just what it knows.

**Immutability boundary:** The `immutable_core` column in `agent_constitutions` is structurally protected. It is set at embodiment definition time and is not modified by session-level activity. This is the same protection applied to `shared/embodiment/types.ts` and `shared/embodiment/index.ts` in the repo — the structural contract of what a profile *is* stays locked even as the content accumulates.

---

### T3 — Corpus / Knowledge

T3 is the indexed knowledge base. It holds documents, fragments, embeddings, and skill records that agents retrieve at inference time. It is immutable once committed — entries are versioned or superseded, not edited in place.

**Supabase tables:**
- `documents` — source-of-truth records with `temporal_period` and `timeline_folder` positioning
- `knowledge_fragments` — chunked retrieval surface, vector-capable
- `embeddings` — vector embedding records
- `skill_fragments` — agent skill knowledge, vector-capable
- `knowledge_asset_chunks` — chunked asset records

**Write rule:** T3 is written only through the ingestion pipeline, not through session activity. Ingestion is a deliberate, operator-level action.

**Read rule:** T3 is retrieved via similarity search (pgvector) or metadata filter. It is the RAG layer — agents pull from T3 to answer questions and generate artifact content.

**pgvector activation status:** Vector columns exist on `knowledge_fragments`, `embeddings`, `skill_fragments`, `memory_entries`, `knowledge_asset_chunks`, and `human_memory_records`. IVFFlat indexes are currently commented out in migration `000040_optional_vector_indexes.md`. Full T3 similarity retrieval requires:

1. Choosing embedding dimension consistently across the pipeline (768 or 1536 — do not mix)
2. Choosing distance metric (cosine recommended for normalized embeddings)
3. Running the index activation migration
4. Wiring the T3 retrieval path into agent session start alongside T1 hot load

Until indexes are activated, T3 operates as flat retrieval only (by ID or metadata filter).

---

### T4 — Embodiment

T4 is the deepest and most structurally protected memory tier. It holds the constitutional identity of each Digital Intelligence — the anchors, values, role commitments, and narrative voice that define what an agent *is*, not just what it knows or remembers.

**Three simultaneous representations:**
- `embodiment_profiles/*.embodiment.json` — source of truth in the repo
- `shared/embodiment/generated.ts` — compiled TypeScript export for runtime use
- Supabase embodiment rows — synced via `scripts/sync-embodiment-profiles.ts`

**Write rule (from ContinuityStack):**
1. Update the profile JSON first
2. Validate the profile shape (`scripts/validate-embodiment-profiles.mjs`)
3. Regenerate `shared/embodiment/generated.ts` only if the profile set changed
4. Sync to Supabase only when persistence is intended

**Do not touch without explicit instruction:**
- `shared/embodiment/types.ts`
- `shared/embodiment/index.ts`
- Generated artifacts that have not been intentionally regenerated

**Commerce propagation:** T4 is the only tier that propagates into the GATE commerce pipeline. The `embodiment_profile_slug` column appears in `collaborators`, `trainer_experiments`, and `gate_package_drafts`. What gets trained in T4 becomes what is sold and what the buyer deploys. This makes T4 write discipline the single most consequential governance surface in the system.

---

## The Write-Path Decision Tree

When deciding where a piece of memory belongs, use this sequence:

```
Is this needed only for the current session?
  → T0. Do not persist.

Is this needed to resume the current work accurately in the next session?
  → T1. Write via SessionHandoffPacket before session close.

Does this reflect a pattern, value, behavioral anchor, or identity-relevant truth?
  → T2. Write deliberately — this is identity formation, not operational logging.

Is this a document, knowledge fragment, or retrievable skill record?
  → T3. Write via ingestion pipeline only.

Is this a constitutional anchor, narrative voice element, or exported identity artifact?
  → T4. Write via embodiment profile workflow with validation and sync.
```

---

## The Session Handoff as T0→T1 Gate

The ContinuityStack protocol (`docs/ContinuityStack.md`) and the SessionHandoffPacket (`docs/SessionHandoffPacket.md`) together form the T0→T1 promotion gate. The checklist answers: does this detail belong in durable memory or should it stay ephemeral?

The goal is not to preserve everything. The goal is to preserve the smallest useful amount of truth that lets the next session continue without rediscovering it.

---

## Activation Checklist

| Item | Status | Notes |
|------|--------|-------|
| T0 — Ephemeral (session state) | ✅ Active | React context, browser memory |
| T1 — Hot memory writes | ✅ Active | `memory_entries`, `agent_memories` tables live |
| T1 — Hot memory reads at session start | ⚠️ Partial | Wiring per agent varies |
| T2 — Accumulative writes | ⚠️ Partial | Tables exist; promotion logic not fully automated |
| T3 — Corpus ingestion | ✅ Active | Pipeline live via ingestion domain |
| T3 — pgvector similarity retrieval | ❌ Inactive | Indexes commented out in `000040` migration |
| T3 — Flat retrieval (by ID / metadata) | ✅ Active | Available now |
| T4 — Embodiment profile JSON | ✅ Active | Live in repo |
| T4 — Generated TypeScript export | ✅ Active | `shared/embodiment/generated.ts` |
| T4 — Supabase sync | ✅ Active | `scripts/sync-embodiment-profiles.ts` |
| T4 → GATE commerce propagation | ⚠️ Schema ready | `embodiment_profile_slug` wired in schema; runtime flow in progress |

---

## Related Docs

- [`docs/ContinuityStack.md`](../docs/ContinuityStack.md) — session persistence routing layer
- [`docs/ContextPersistenceProtocol.md`](../docs/ContextPersistenceProtocol.md) — rules for what context rolls forward
- [`docs/ContextPersistenceChecklist.md`](../docs/ContextPersistenceChecklist.md) — fast closeout checklist
- [`docs/SessionHandoffPacket.md`](../docs/SessionHandoffPacket.md) — handoff form for session close
- [`shared/embodiment/types.ts`](../shared/embodiment/types.ts) — embodiment type contract (do not modify without explicit instruction)
- [`scripts/sync-embodiment-profiles.ts`](../scripts/sync-embodiment-profiles.ts) — T4 Supabase sync
- [`scripts/validate-embodiment-profiles.mjs`](../scripts/validate-embodiment-profiles.mjs) — T4 validation
- Supabase migration `000040_optional_vector_indexes.md` — T3 pgvector activation
