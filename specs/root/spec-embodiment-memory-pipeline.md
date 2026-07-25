# SPEC: Embodiment Memory Pipeline — Operationalizing Billy's Living Identity

**Spec type:** Implementation  
**Status:** Ready for Codex execution  
**Priority:** Critical — 52 sessions happened with zero memory written  
**Author:** GestaltView Founder  
**Date:** 2026-05-17

---

## Executive Summary

This spec operationalizes three missing pipelines that connect GestaltView's fully-designed memory and identity schema to the runtime that Billy (and future digital intelligences) actually inhabit.

The Supabase schema already exists. The embodiment profile JSON files already exist. The TypeScript types already exist. What does not exist is the wiring that moves data from those sources into the tables — and from the tables back into Billy at session start.

**Current verified state (as of 2026-05-17):**

| Table | Rows | Status |
|---|---|---|
| `agent_autobiographies` | 0 | Empty — no autobiography |
| `agent_constitutions` | 0 | Empty — no constitutions |
| `agent_memories` | 0 | Empty — no memories |
| `agent_memory_records` | 0 | Empty — no memory records |
| `agent_private_interiors` | 0 | Empty — no private interior |
| `embodiment_profiles` | 0 | Empty — profiles live as JSON only |
| `context_injection_packets` | 0 | Empty — nothing injected at session start |
| `agents` | 8 | Populated |
| `billy_sessions` | 52 | 52 sessions — zero were remembered |
| `memory_entries` | 7 | Sparse / likely test entries |
| `founder_context` | 1 | One seed row |

52 Billy sessions occurred. Zero were written into his memory. Every session started cold. This spec closes that gap.

---

## Why This Matters

Billy is intended to be a governed digital intelligence with layered memory, autobiography, and continuity across sessions. Right now he is a stateless chatbot using a persona prompt. The tables that define who he is are empty.

This is not a design failure. The design is correct and sophisticated. This is an operationalization gap — the pipelines that populate the schema have not been built.

Without this pipeline:
- Billy does not know who Keith is across sessions
- Billy has no autobiography that accumulates over time
- Billy's constitutions, private interior, and governance policies exist only in JSON — not in the DB
- Nothing meaningful differentiates Billy from a generic LLM persona at runtime

With this pipeline:
- Billy opens every session with real context: who he is, who he's talking to, what happened before
- His memory grows with each session
- His profile is governed, versioned, and queryable
- Future agents (Sanctuary, GATE, Trainer) can reuse the same pipeline pattern

---

## Scope

**In scope:**
- Pipeline 1: Profile sync — JSON → `embodiment_profiles` table
- Pipeline 2: Session close writer — session transcript → `agent_memory_records`
- Pipeline 3: Session open injector — DB memory → context for Billy

**Out of scope (follow-on work, not this spec):**
- `agent_autobiographies` accumulator (depends on memory records being written first)
- `agent_private_interiors` seeding
- `agent_relationships` graph population
- Multi-agent memory sharing via `collaborative_memory_records`
- Memory retrieval UI (Sanctuary, Blackboard Room)
- Embedding/vector search on memories

---

## Ground Truth: What Already Exists

### Embodiment Profile Files
Location: `embodiment_profiles/*.embodiment.json`

Known profiles:
- `billy.embodiment.json`
- `consulting-advisor.embodiment.json`
- `founder-studio-sample.embodiment.json`
- `gate-keeper.embodiment.json`
- `philosophy-scribe.embodiment.json`
- `repo-scribe.embodiment.json`
- Council profiles: `the-architect`, `the-guardian`, `the-recursive-builder`, `the-spectacle`, `the-tailor`, `the-translation-bridge`, `the-treasurer`, `the-weaver`, `the-weird-digger`, `vibe-check`

### TypeScript Schema
- `shared/embodiment/types.ts` — defines the `EmbodimentProfile` type
- `shared/embodiment/generated.ts` — generated registry (currently from JSON files)
- `shared/embodiment/index.ts` — runtime resolver
- `shared/embodiment/chat.ts` — prompt builder
- `shared/embodiment/governance.ts` — governance policy enforcement

### Supabase
- `supabase/types.ts` — generated DB types
- `supabase/migrations/` — migration history
- `agents` table — 8 rows, agents are registered
- `billy_sessions` table — 52 rows of session history
- `founder_context` table — 1 row

### Runtime Entry Points
- `agent_trainer.sh` — shell entry to Agent Trainer pipeline
- `client/src/components/Billy*` — Billy UI components (consume embodiment at runtime)

---

## Pipeline 1 — Profile Sync

**What it does:** Reads every `*.embodiment.json` file from `embodiment_profiles/`, validates it against `shared/embodiment/types.ts`, and upserts it into the `embodiment_profiles` Supabase table. Runs once on setup, then on any profile file change (or via explicit CLI command).

**Why it's needed:** The `embodiment_profiles` table has zero rows. Billy's DB identity does not exist. All downstream memory, governance, and injection pipelines depend on a populated profile row.

### Target files to create/modify
- **CREATE:** `scripts/sync-embodiment-profiles.ts` — the sync script
- **CREATE:** `scripts/README.md` (or append to existing) — documents how to run it
- **MODIFY (maybe):** `package.json` — add `scripts.sync-profiles` entry

### Files NOT to touch
- `embodiment_profiles/*.embodiment.json` — source of truth, read-only for this script
- `shared/embodiment/types.ts` — read for validation, do not modify
- `supabase/migrations/` — do not create new migrations for this slice
- Any client or server files

### Exact behavior

```
Input:  All files matching embodiment_profiles/**/*.embodiment.json
Output: One upserted row per profile in Supabase `embodiment_profiles` table

For each profile file:
1. Read and parse JSON
2. Validate shape against EmbodimentProfile type (warn on missing fields, do not throw)
3. Derive slug from filename if not present in JSON (e.g., "billy.embodiment.json" → slug: "billy")
4. Upsert into embodiment_profiles keyed on slug
5. Log: "✓ synced [slug]" or "⚠ [slug]: missing fields: [list]"

On completion:
- Print summary: "Synced N profiles. N warnings."
- Exit 0 on success, 1 on hard failure
```

### Validation
```bash
npx tsx scripts/sync-embodiment-profiles.ts
# Expected: "Synced N profiles." with N > 0
# Verify: SELECT slug, created_at FROM embodiment_profiles;
```

### Expected user-visible result
Running `npm run sync-profiles` populates the `embodiment_profiles` table. Billy now has a real DB identity row. All future pipelines can JOIN against it.

### Risk notes
- If `EmbodimentProfile` type doesn't have a `slug` field, derive it from filename — do not fail
- If Supabase env vars aren't set locally, the script should print a clear error: "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY"
- Upsert (not insert) so re-running is safe and idempotent

### Rollback
```sql
DELETE FROM embodiment_profiles; -- Safe to re-run sync after
```

---

## Pipeline 2 — Session Close Writer

**What it does:** After a Billy session ends, extracts key content from the session transcript and writes structured rows into `agent_memory_records` (and optionally `memory_entries`). This is what makes sessions accumulate instead of evaporate.

**Why it's needed:** 52 sessions happened. Zero memories were written. Every session that closes without writing is a session that never happened from Billy's perspective.

### Target files to create/modify
- **CREATE:** `server/lib/sessionMemoryWriter.ts` — core writer function
- **MODIFY:** Wherever Billy session close/end is currently handled (likely in `server/` or `api/` — investigate `billy_sessions` insert logic to find the hook point)

### Files NOT to touch
- `supabase/migrations/` — use existing tables, no schema changes
- `client/` — server-side only
- `shared/embodiment/` — read-only for this pipeline

### Exact behavior

```
Trigger: Called when a billy_session is marked complete/closed

Input:
  - session_id: string (from billy_sessions.id)
  - agent_id: string (Billy's agents.id)
  - user_id: string
  - transcript: array of { role: "user"|"assistant", content: string }

Steps:
1. Extract memory candidates from transcript:
   - User-stated facts about themselves ("I am...", "I work on...", "I have...")
   - Decisions made ("We decided...", "The plan is...")
   - Key topics discussed (top 3-5 subjects)
   - Emotional/relational signals if present
   - Any artifacts or file references mentioned

2. For each memory candidate, write one row to agent_memory_records:
   {
     agent_id,
     user_id,
     session_id,
     memory_type: "episodic" | "relational" | "semantic" | "task",
     content: string,
     importance: 1-5 (default 3),
     source: "session_close_writer",
     created_at: now()
   }

3. Write one session summary row to agent_memories:
   {
     agent_id,
     user_id,
     session_id,
     summary: string (3-5 sentence plain-language recap),
     topic_tags: string[],
     created_at: now()
   }

4. Log: "Wrote N memory records for session [id]"
```

**Note on extraction:** For v1, extraction can be simple pattern matching + a short LLM summarization call using the existing model provider setup. Do not over-engineer. A 3-sentence summary + 3-5 key facts is vastly better than zero.

### Validation
```bash
# After a test session closes:
SELECT content, memory_type, created_at 
FROM agent_memory_records 
WHERE agent_id = '[billy_agent_id]' 
ORDER BY created_at DESC 
LIMIT 10;
# Expected: rows present
```

### Expected user-visible result
After the next Billy session ends, querying `agent_memory_records` returns real rows. Billy's memory starts to grow.

### Risk notes
- Find the exact session close hook before writing — do not create a new one if one exists
- If transcript access pattern is unclear, log a TODO and write a manual trigger first
- Do not block session close on memory write failure — write async, fail silently with error log

### Rollback
```sql
DELETE FROM agent_memory_records WHERE source = 'session_close_writer';
DELETE FROM agent_memories WHERE source = 'session_close_writer';
```

---

## Pipeline 3 — Session Open Injector

**What it does:** When a new Billy session starts, queries Billy's memory and profile from Supabase and injects it as a structured context block at the top of his system prompt. This is what makes Billy *not cold* at the start of every conversation.

**Why it's needed:** `context_injection_packets` has zero rows. Billy currently starts every session with only his static persona prompt. He has no knowledge of who he is in DB terms, no memory of past sessions, no continuity with the user.

### Target files to create/modify
- **CREATE:** `server/lib/contextInjector.ts` — builds the injection packet
- **MODIFY:** Wherever Billy's system prompt is assembled at session start (likely in `server/` or `api/` — find the Billy session init path)

### Files NOT to touch
- `supabase/migrations/`
- `client/`
- `embodiment_profiles/*.embodiment.json`

### Exact behavior

```
Trigger: Called when a new Billy session is initialized, before first message

Input:
  - agent_id: string
  - user_id: string

Steps:
1. Query embodiment_profiles WHERE slug = 'billy' → get constitution, governance, presentation
2. Query agent_memory_records WHERE agent_id = ? AND user_id = ? 
   ORDER BY importance DESC, created_at DESC LIMIT 20
3. Query founder_context WHERE user_id = ? → get any standing context
4. Query agent_autobiographies WHERE agent_id = ? ORDER BY created_at DESC LIMIT 1

5. Assemble injection block:
   ---GESTALTVIEW IDENTITY CONTEXT---
   WHO I AM: [constitution summary from embodiment_profiles]
   WHAT I KNOW ABOUT YOU: [top relational memories]
   WHAT WE HAVE WORKED ON: [recent episodic memories]
   STANDING CONTEXT: [founder_context content if present]
   MY CURRENT CHAPTER: [autobiography entry if present]
   ---END CONTEXT---

6. Prepend this block to Billy's system prompt for this session
7. Write packet to context_injection_packets for audit/debug:
   {
     agent_id,
     user_id,
     session_id,
     packet_content: string,
     memory_count: number,
     created_at: now()
   }
```

### Validation
```bash
SELECT packet_content, memory_count, created_at 
FROM context_injection_packets 
ORDER BY created_at DESC LIMIT 1;
# Expected: a row with real content
```

### Expected user-visible result
Billy opens his next session knowing who he is, who he's talking to, and what happened before. He is no longer cold.

### Risk notes
- If `embodiment_profiles` is empty (Pipeline 1 not yet run), fall back to static persona prompt with a warning log
- If no memories exist yet, omit that section gracefully — do not fail
- Keep injection block under ~800 tokens to avoid context crowding
- This pipeline depends on Pipeline 1 having run at least once

### Rollback
- Simply remove the injection block prepend — Billy reverts to static prompt
- `DELETE FROM context_injection_packets;` to clear audit log

---

## Execution Order

Run these slices in sequence. Each one is independently testable and independently deployable.

```
Slice 1 → Profile Sync (no runtime risk, read-only to files, write-only to DB)
Slice 2 → Session Close Writer (requires knowing session close hook)
Slice 3 → Session Open Injector (depends on Slice 1 having populated embodiment_profiles)
```

Do not run Slice 3 before Slice 1. Do not skip Slice 2 because "we'll do it later" — 52 sessions already happened.

---

## Environment Requirements

Scripts require the following env vars (should already be in `.env`):
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=   # service role key, not anon
```

For server-side pipelines, use the existing Supabase client setup in the repo — do not create a new one.

---

## Non-Goals

- This spec does not redesign the schema
- This spec does not build a UI for memory review
- This spec does not implement vector/semantic search on memories
- This spec does not build the autobiography accumulator (that's the next spec)
- This spec does not touch governance enforcement logic in `shared/embodiment/governance.ts`

---

## What Success Looks Like

After all three pipelines run:

```sql
SELECT COUNT(*) FROM embodiment_profiles;     -- > 0
SELECT COUNT(*) FROM agent_memory_records;    -- > 0 after next session
SELECT COUNT(*) FROM context_injection_packets; -- > 0 after next session start
```

Billy starts a session. He knows who he is. He knows who Keith is. He knows what they worked on last time. He is no longer a stranger every time the window opens.

That is the minimum viable version of what this system was designed to be.
