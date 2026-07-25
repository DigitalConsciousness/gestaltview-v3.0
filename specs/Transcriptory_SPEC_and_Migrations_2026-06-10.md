# Transcriptory Implementation SPEC + Supabase Migrations

This document is the implementation-ready SPEC for Codex to ship the next Transcriptory slice in GestaltView v2. It is grounded in the live `docs/CurrentState.md` state and the attached Transcriptory planning materials. The guiding product insight is that Transcriptory is not just a transcription utility; it is a cumulative context layer for voice-first, neurodivergent-friendly capture, where articulation can be a process rather than a pre-sanitized output. [conversation_history:1][file:36][file:37]

## Checked sources

- GitHub MCP: `DigitalConsciousness/gestaltview-v2.0/docs/CurrentState.md` (live repo state). [conversation_history:1]
- Attached file: `Transcriptory_Concept_and_Neurodivergent_Collaboration_Insights.docx`. [file:36]
- Attached file: `For_SPEC_6_9_26.md`. [file:37]

## Comparison to CurrentState

`CurrentState.md` already records that a first Transcriptory runtime slice exists: `/api/transcriptory/transcribe` persists raw audio to the private `transcriptory_audio_files` bucket, submits audio to AssemblyAI, writes transcript/enrichment results back to `transcriptory_captures`, and links related captures with a lightweight similarity pass. It also records that Creation Corner and Blackboard Room already have Transcriptory handoff packets wired through the existing source pipeline. [conversation_history:1]

What is still missing is the full product layer that the voice notes describe: a true Transcriptory library surface, richer context assembly over time, a migration-backed schema for transcript sessions and source lineage, searchability, stronger chat/capture interoperability, and a deliberate bridge from Transcriptory into Creation Corner, Blackboard Room, and future Digital Intelligence flows. The notes also frame Transcriptory as a neurodivergent-first articulation surface where raw speech, accumulated context, and progressive refinement matter more than one-shot upload-and-summarize tooling. [file:36][file:37]

## Product intent

Transcriptory should function as a repository for transcripts, with two equivalent first-class inputs: upload an audio file, or record directly inside the feature. The distinguishing behavior is that each transcript becomes part of a cumulative personal knowledge layer that improves future interpretation, summarization, and routing because the system can understand recurring themes, language patterns, and areas of focus over time. [file:36][file:37]

The feature should therefore be treated as a capture-and-context system, not as a single API endpoint. That means Codex should implement four layers together: storage + schema, API orchestration, library/search UI, and cross-page handoff mechanics. `CurrentState.md` confirms layer one exists partially, but the remaining three still need a formal implementation pass. [conversation_history:1]

## Goals

Ship Transcriptory as a coherent product surface that allows authenticated users to record or upload audio, view and manage their transcript library, inspect transcripts and summaries, search by themes/text, and send captures into Creation Corner or Blackboard without JSON leakage or source-shaping distortion. [conversation_history:1][file:36]

Add database structure that supports richer lineage, capture sessions, derived sources, and future embedding/search work without breaking the runtime slice already recorded in `CurrentState.md`. The migrations below are additive and intentionally preserve the existing `transcriptory_captures` table as the canonical capture record. [conversation_history:1]

## Non-goals

This pass does not replace AssemblyAI, does not introduce frontend access to service-role resources, and does not attempt to solve vector retrieval for all product surfaces immediately. It prepares for vector search by creating clear lineage and session boundaries, while keeping the current lightweight related-capture scoring intact until embeddings are added later. [conversation_history:1]

This pass also does not redesign every downstream page. It defines precise integration points for Creation Corner, Blackboard Room, Agent Council, and Universal Capture, but the UI implementation should stay inside current seams rather than doing a greenfield rewrite. [conversation_history:1][file:37]

## Canonical data model

Keep `transcriptory_captures` as the canonical record for one audio-originated or text-originated transcript artifact. A capture is the durable entity users browse in the library and pass to other pages. `CurrentState.md` shows that this table already stores `audio_storage_path`, `raw_transcript`, `duration_seconds`, `summary`, `themes`, `linked_captures`, and `status`, so the new schema should extend around it rather than replacing it. [conversation_history:1]

Add `transcriptory_sessions` to group captures that belong to a common thread, walk, meeting, journaling run, or topic stream. The notes emphasize that context should accumulate as a journey rather than a one-time dump, and sessions are the lightest structure that encodes that temporal continuity. [file:36][file:37]

Add `transcriptory_sources` to record where a capture came from and where it was sent. This supports downstream integrity: Blackboard handoff, Creation Corner rollforward, Universal Capture import, and future provenance/debugging when users ask why a transcript appeared in a given workflow. [conversation_history:1][file:37]

Add optional FTS/search infrastructure against transcript text, summary, and themes so the Transcriptory library is actually navigable. The product notes repeatedly frame the library as an accumulative knowledge base, which becomes unusable if users cannot query it. [file:36][file:37]

## Database migrations

Apply the following SQL in one migration bundle after checking live table compatibility in Supabase. The SQL is additive and assumes `transcriptory_captures` already exists from prior Transcriptory work. [conversation_history:1]

### 20260610000100_transcriptory_sessions_and_sources.sql

```sql
begin;

create table if not exists public.transcriptory_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  description text,
  origin text not null default 'transcriptory' check (origin in ('transcriptory','blackboard','creation_corner','journal','universal_capture','import','api')),
  status text not null default 'active' check (status in ('active','archived','merged')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transcriptory_sessions_user_created_idx
  on public.transcriptory_sessions (user_id, created_at desc);

alter table public.transcriptory_captures
  add column if not exists session_id uuid references public.transcriptory_sessions(id) on delete set null,
  add column if not exists title text,
  add column if not exists transcript_text text,
  add column if not exists transcript_language text,
  add column if not exists source_kind text not null default 'audio' check (source_kind in ('audio','text','imported_audio','imported_text','derived')),
  add column if not exists source_label text,
  add column if not exists processing_provider text,
  add column if not exists transcript_status text not null default 'pending' check (transcript_status in ('pending','processing','ready','failed')),
  add column if not exists error_message text,
  add column if not exists token_estimate integer,
  add column if not exists last_accessed_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.transcriptory_captures
set transcript_text = coalesce(transcript_text, raw_transcript)
where transcript_text is null and raw_transcript is not null;

update public.transcriptory_captures
set transcript_status = case
  when status in ('ready','completed') then 'ready'
  when status in ('failed','error') then 'failed'
  when status in ('processing','queued','pending') then 'processing'
  else transcript_status
end
where transcript_status = 'pending' and status is not null;

create table if not exists public.transcriptory_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  capture_id uuid not null references public.transcriptory_captures(id) on delete cascade,
  source_type text not null check (source_type in ('upload','recording','blackboard_handoff','creation_corner_seed','journal_entry','universal_capture','api_import','manual_text')),
  source_ref text,
  source_page text,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transcriptory_sources_user_capture_idx
  on public.transcriptory_sources (user_id, capture_id, created_at desc);

create index if not exists transcriptory_captures_user_created_idx
  on public.transcriptory_captures (user_id, created_at desc);

create index if not exists transcriptory_captures_user_session_idx
  on public.transcriptory_captures (user_id, session_id, created_at desc);

create index if not exists transcriptory_captures_transcript_status_idx
  on public.transcriptory_captures (transcript_status, created_at desc);

commit;
```

### 20260610000200_transcriptory_search_and_triggers.sql

```sql
begin;

alter table public.transcriptory_captures
  add column if not exists search_document tsvector;

create or replace function public.transcriptory_captures_search_document_fn()
returns trigger
language plpgsql
as $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.summary, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.themes, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.transcript_text, coalesce(new.raw_transcript, ''))), 'C');
  return new;
end;
$$;

update public.transcriptory_captures
set search_document =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(summary, '')), 'A') ||
  setweight(to_tsvector('english', array_to_string(coalesce(themes, '{}'), ' ')), 'B') ||
  setweight(to_tsvector('english', coalesce(transcript_text, coalesce(raw_transcript, ''))), 'C');

create trigger transcriptory_captures_search_document_trigger
before insert or update of title, summary, themes, transcript_text, raw_transcript
on public.transcriptory_captures
for each row
execute function public.transcriptory_captures_search_document_fn();

create index if not exists transcriptory_captures_search_document_idx
  on public.transcriptory_captures using gin (search_document);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

DROP TRIGGER IF EXISTS set_transcriptory_sessions_updated_at ON public.transcriptory_sessions;
create trigger set_transcriptory_sessions_updated_at
before update on public.transcriptory_sessions
for each row execute function public.set_updated_at();

alter table public.transcriptory_sessions enable row level security;
alter table public.transcriptory_sources enable row level security;

drop policy if exists "transcriptory_sessions_select_own" on public.transcriptory_sessions;
create policy "transcriptory_sessions_select_own"
  on public.transcriptory_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "transcriptory_sessions_insert_own" on public.transcriptory_sessions;
create policy "transcriptory_sessions_insert_own"
  on public.transcriptory_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "transcriptory_sessions_update_own" on public.transcriptory_sessions;
create policy "transcriptory_sessions_update_own"
  on public.transcriptory_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transcriptory_sessions_delete_own" on public.transcriptory_sessions;
create policy "transcriptory_sessions_delete_own"
  on public.transcriptory_sessions
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "transcriptory_sources_select_own" on public.transcriptory_sources;
create policy "transcriptory_sources_select_own"
  on public.transcriptory_sources
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "transcriptory_sources_insert_own" on public.transcriptory_sources;
create policy "transcriptory_sources_insert_own"
  on public.transcriptory_sources
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "transcriptory_sources_update_own" on public.transcriptory_sources;
create policy "transcriptory_sources_update_own"
  on public.transcriptory_sources
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transcriptory_sources_delete_own" on public.transcriptory_sources;
create policy "transcriptory_sources_delete_own"
  on public.transcriptory_sources
  for delete
  to authenticated
  using (auth.uid() = user_id);

commit;
```

## API implementation plan

Keep the existing `/api/transcriptory/transcribe` route but normalize it around the expanded schema. When a recording or upload starts, create or reuse a `transcriptory_sessions` row, insert a pending `transcriptory_captures` row with `source_kind`, `source_label`, `processing_provider='assemblyai'`, and `transcript_status='processing'`, then attach a `transcriptory_sources` lineage row that states whether the source was uploaded, recorded, or handed off from another page. This preserves the current runtime path while giving every capture a proper provenance trail. [conversation_history:1][file:37]

Add `GET /api/transcriptory/captures` with pagination, optional `sessionId`, optional text query, optional theme filter, and optional status filter. This route should read only from the authenticated user's captures, order by `created_at desc`, and return a compact library payload that includes id, title, summary, themes, duration, created_at, transcript_status, source_kind, and whether audio is available. The notes describe a real library/repository use case, so the listing route is mandatory. [file:36][file:37]

Add `GET /api/transcriptory/captures/[id]` that returns the full transcript, source lineage, session info, and any linked captures. On read, it should update `last_accessed_at` server-side. This gives Transcriptory a detail view and makes downstream handoffs inspectable, which matters because `CurrentState.md` already identifies source-shaping and preserve-voice problems elsewhere in the product. [conversation_history:1]

Add `POST /api/transcriptory/sessions` and `PATCH /api/transcriptory/sessions/[id]` for creating or renaming context sessions. The notes emphasize accumulation over time; sessions are the minimal control a user needs to keep that accumulation organized without requiring aggressive taxonomy upfront. [file:36]

Add `POST /api/transcriptory/captures/[id]/handoff` that accepts a target of `creation_corner`, `blackboard_room`, or `universal_capture`. This endpoint should write a `transcriptory_sources` row describing the handoff and return the already-normalized payload each destination expects, so page-specific source munging does not reintroduce JSON dumps or flattening. `CurrentState.md` already records that Creation Corner and Blackboard are wired, but this route formalizes the seam and reduces hidden coupling. [conversation_history:1]

## UI implementation plan

Create a dedicated Transcriptory page with three coordinated regions: capture controls at top, a searchable transcript library in the main pane, and a detail drawer or detail pane for the selected transcript. The page should support both record-now and upload-audio flows because the original concept treats those as equal entry points. [file:36][file:37]

The library should default to reverse chronological order, which matches the repo's new reverse-chronological `CurrentState.md` ordering and the founder's workflow of accumulating recent captures as active context. Each row/card should show a title fallback, a short summary, themes, duration, created time, and a visible processing state. [conversation_history:1][file:36]

The detail view should expose the raw transcript, summary, themes, session membership, and source lineage. It should also include action buttons for “Send to Creation Corner,” “Open in Blackboard,” and “Use as Universal Capture source.” The voice notes frame transcripts as bucket drops and contextual lenses, so the transcript detail view should behave like an operational relay point, not a dead-end transcript display. [file:36][file:37]

## Capture shaping rules

Do not pass transcript payloads as JSON-stringified blobs into downstream pages. `CurrentState.md` already documents damage caused by JSON dumping in Creation Corner, and the Transcriptory flow should explicitly avoid recreating that failure mode. Handoff packets should send human-shaped markdown/text, an explicit summary, themes, source ids, and optional quoted excerpts. [conversation_history:1]

For title generation, do not rely on raw JSON-like content or the first few transcript words blindly. The title should prefer an explicit user title, then an LLM/server-generated concise title, then a bounded fallback derived from the summary or first meaningful utterance. This aligns with the repo's recent gen-engine work to guard against JSON-shaped titles. [conversation_history:1]

## Search behavior

Search should query title, summary, themes, and transcript body via the `search_document` tsvector. Results should bias title/summary/theme matches over deep transcript matches so the library feels navigable rather than noisy. This is necessary because the product concept is about long-term contextual accumulation, and that only works if retrieval remains lightweight and interpretable. [file:36]

Add “related captures” as a secondary panel in the detail view using the existing lightweight related-capture scoring already mentioned in `CurrentState.md`. This avoids delaying launch on embeddings while still honoring the “layered journey” product philosophy from the notes. [conversation_history:1][file:36]

## Integrations

### Creation Corner

When a capture is sent to Creation Corner, return normalized markdown that includes: title, 2-4 sentence summary, theme tags, and then a clearly labeled verbatim excerpt block or full transcript block depending on user selection. The point is to preserve raw signal while still giving Creation Corner structure, which directly answers the preserve-voice issues already documented in `CurrentState.md`. [conversation_history:1]

### Blackboard Room

When a capture is sent to Blackboard, inject it as a source packet with visible provenance, not as invisible hidden context. Blackboard should know it is dealing with Transcriptory input and show that source in the room UI. This preserves trust and helps with later debugging when a session summary includes or excludes certain transcript content. [conversation_history:1][file:37]

### Universal Capture / Journal

The voice notes say voice-to-text is mandatory across major pages and that bucket drops are unsanitized multimodal captures. Transcriptory should therefore be treated as the durable library layer behind Universal Capture and Journal voice workflows rather than as a disconnected side feature. Implement the shared adapter seam now by ensuring those pages can create Transcriptory session/capture records even before they fully embed the Transcriptory UI. [file:36][file:37]

## Validation steps for Codex

After implementation, run `npm run build`, `git diff --check`, and `npm run health` if present, consistent with the repo workflow rules. Also run targeted tests for Transcriptory routes and any new page-level API helpers. [conversation_history:1]

At the database level, validate that authenticated users can only access their own `transcriptory_sessions` and `transcriptory_sources`, and confirm that the `transcriptory_audio_files` bucket policies from the earlier Transcriptory slice still work with the new capture/session flow. `CurrentState.md` already identifies that live migrations must be applied before production audio persistence succeeds, so this validation is mandatory rather than optional. [conversation_history:1]

## Files Codex should expect to touch

The exact file list must be verified live before edits, but the implementation will likely involve these surfaces based on `CurrentState.md`: `api/transcriptory/transcribe` and adjacent route files, Transcriptory client page/components, Creation Corner handoff code, Blackboard ingestion code, shared capture/handoff utilities, and `docs/CurrentState.md` for the new implementation entry. The existing Transcriptory tests recorded in `CurrentState.md` should be extended rather than replaced. [conversation_history:1]

## CurrentState entry template

Append a new top entry after implementation in this format:

```md
## CurrentState — Transcriptory library, sessions, search, and handoff normalization (2026-06-10)

**Scope of this pass:** Expanded Transcriptory from a raw transcription endpoint into a first-class capture library with sessions, provenance, search, and normalized downstream handoffs.

### What changed

- Added Supabase migrations for `transcriptory_sessions`, `transcriptory_sources`, capture metadata extensions, and search indexing.
- Added Transcriptory listing/detail/session APIs.
- Added Transcriptory library UI with record/upload, search, detail, and handoff actions.
- Normalized Transcriptory → Creation Corner and Transcriptory → Blackboard payload shaping to avoid JSON-dump regressions.
- Extended Transcriptory tests.

### Validation performed

- `npm run build`
- `git diff --check`
- `npx vitest run ...`
- migration apply / schema verification

### Remaining risks / follow-up

1. Embedding-backed related-capture search can replace lightweight similarity later.
2. Voice adapter unification across all pages still needs its separate pass.
```

## Open decisions that still need Keith confirmation

The implementation is ready to start, but Codex should pause for confirmation if it reaches any of these repo-specific unknowns: the exact route/file path for the current Transcriptory page if it already exists, whether Universal Capture has a canonical source packet type to reuse, whether Journal should create its own Transcriptory session automatically or attach to a default rolling session, and whether transcript detail should default to full transcript display or collapsed excerpt-first display. These are product fit decisions, not blockers to the migrations. [file:36][file:37]
