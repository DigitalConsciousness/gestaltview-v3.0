# Phase 6 schema-fit audit — 2026-07-27

**Project inspected:** `dzrxepbgetinldcknior`  
**Scope:** live `public` columns, RLS flags/policies, indexes, triggers, estimated
rows, and repository writer/reader paths. No live DDL or data mutation was
performed.

## Decision

Create one narrow `runtime_handoffs` lifecycle receipt table and one
`runtime_handoff_events` audit table. None of the existing tables can safely
carry the shared lifecycle:

- source tables must continue to preserve their room-owned content;
- artifact/projection/approval tables describe different domain facts;
- `orchestration_decisions` is a service-owned routing decision log, has a text
  owner identifier, and is not user-readable under its current policies;
- `gsvw_runtime_capture_events` is capture telemetry and currently permits a
  nullable owner on insert;
- Tribunal events/evidence currently have public-read policies and cannot carry
  private cross-room context.

The new tables store references, minimal derivative context, lifecycle,
acknowledgement/failure, and transition evidence only. They do not foreign-key
to or cascade-delete any source table.

## Live schema-fit matrix

| Table                           | Current purpose / fact kind                          | Source owner and live RLS                             | Current writer / reader paths                     | Reusable handoff fields                                      | Additive need / duplication risk                                                           |
| ------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `capture_events`                | Preserved universal capture source                   | `user_id uuid`; owner-all plus service-all            | profile ingestion and capture components/APIs     | room, source type, consent, metadata, immutable `capture_id` | Reference it. Lifecycle fields would turn a source ledger into workflow state.             |
| `gsvw_runtime_capture_events`   | Runtime capture/telemetry event                      | nullable `user_id`; owner select, insert permits null | runtime capture ingestion and dashboards          | module/action/source surface/event ID                        | Reference only. Nullable owner and telemetry semantics are unsafe for receipts.            |
| `orchestration_decisions`       | Routing decision                                     | `user_id text`; service-role only                     | `api/orchestrator/decide.ts`, analytics           | destination, trigger, decision payload                       | Later link by reference. It cannot represent explicit destination acceptance.              |
| `transcriptory_captures`        | Raw audio/text capture plus transcription derivative | `user_id uuid`; owner-all                             | Transcriptory capture/transcribe APIs and page    | capture ID, session, source kind/status                      | Reference capture; copying transcript/voice into a handoff would duplicate private source. |
| `transcriptory_sessions`        | Transcriptory session source/container               | `user_id uuid`; owner CRUD                            | Transcriptory session APIs/page                   | session ID, origin/status                                    | Reference only; no cross-room lifecycle.                                                   |
| `transcriptory_sources`         | Source/provenance link for a capture                 | `user_id uuid`; owner CRUD                            | Transcriptory APIs including legacy handoff route | capture ID, source type/ref/page                             | Useful typed source reference; not a destination receipt.                                  |
| `journals`                      | Sanctuary journal source                             | `user_id uuid`; owner-all; one row/user               | Sanctuary journal API/page                        | journal ID and `source_ref`                                  | Reference only. Handoff state would overload the private journal.                          |
| `scrapbook_items`               | Sanctuary scrapbook source/reference                 | `user_id uuid`; owner-all                             | Sanctuary scrapbook API/page                      | item ID, file/source refs                                    | Reference only; preserve source after receipt deletion.                                    |
| `tribunal_sessions`             | Tribunal deliberation source/result                  | `user_id text`; RLS enabled but **no policies**       | server Tribunal runtime                           | session ID, participants, metadata                           | Requires Phase 9 owner/policy repair; unsuitable for the shared private receipt.           |
| `tribunal_events`               | Tribunal verdict event                               | no owner column; public read plus service-all         | Tribunal runtime                                  | event ID, question/verdict                                   | Public-read semantics prohibit private handoff payloads.                                   |
| `tribunal_evidence`             | Evidence link for Tribunal event                     | no owner column; public read plus service-all         | Tribunal runtime                                  | event/document/fragment IDs                                  | Reference only; not a workflow receipt.                                                    |
| `created_artifacts`             | Creation Corner artifact/source derivative           | nullable `userid`; service-only                       | Creation Corner/gen-engine APIs                   | artifact ID, source IDs, destination                         | Reference artifact. Destination intent is not acceptance.                                  |
| `artifact_provenance_envelopes` | Artifact integrity/provenance receipt                | no owner; service-only                                | artifact/gen-engine persistence                   | artifact ID/hashes/transform                                 | Integrity receipt must not be repurposed as room workflow.                                 |
| `codex_artifacts`               | Codex artifact source/derivative                     | `user_id uuid`; owner insert/select/update            | Codex bridge/persistence                          | ID, source IDs, provenance                                   | Reference only; status is artifact status, not handoff lifecycle.                          |
| `render_jobs`                   | Render lifecycle job                                 | nullable `user_id`; owner insert/select/update        | render engine/status                              | job ID, source room, graph ID                                | Reference only. Render lifecycle cannot represent every room.                              |
| `render_artifacts`              | Stored-byte render receipt                           | nullable `user_id`; owner insert/select               | render engine/status/projection                   | artifact ID, job ID, format/storage/hash                     | Reference receipt; never copy its trusted-byte claim.                                      |
| `inner_world_artifacts`         | Explicit projection                                  | `user_id uuid`; owner-all                             | Inner World APIs/client, render projection        | projection ID and unique `source_ref`                        | Destination entity reference after completion; not generic workflow.                       |
| `approvals`                     | Run/version approval decision                        | `approver_user_id uuid`; service-only                 | gated run/version workflows                       | approval ID, decision                                        | Separate governance fact; linking may be useful, overloading is not.                       |

## Local persistence package

The proposed migration
`supabase/migrations/20260727222849_runtime_handoffs_v1.sql` provides:

- exact contract, room, intent, and state constraints;
- unique `(owner_id, idempotency_key)` plus a material fingerprint;
- owner/state, source, destination/state, and freshness indexes;
- owner-predicated RLS for authenticated reads;
- server/service-role writes without placing a secret in the browser or
  allowing a browser to forge transition evidence;
- immutable owner and immutable source identity after acceptance;
- database-enforced lifecycle edges;
- append-only transition evidence generated by a trigger;
- no relationship from receipt deletion to any source table.

## Risks carried forward

- Production migration application remains an outside approval gate.
- The existing Transcriptory handoff endpoint still emits an ephemeral,
  room-specific shape; Phase 7 should adapt it to the canonical client.
- Tribunal ownership/RLS drift is confirmed and belongs to Phase 9.
- Several legacy tables use service-only policies or nullable/text ownership.
  The handoff API therefore resolves a UUID owner server-side and filters every
  service-role query by that owner.
