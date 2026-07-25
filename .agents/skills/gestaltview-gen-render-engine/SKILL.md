---
name: gestaltview-gen-render-engine
description: Inspect, implement, or repair the GestaltView render/artifact pipeline in `gestaltview-di/gestaltview_v3.1` — the path from a semantic source or scene graph to a rendered artifact, Supabase ledger row, private storage object, and Gallery projection. Use this skill whenever a Creation Corner artifact shows raw Markdown/JSON, a filepath string, or duplicated text; whenever `render_jobs`/`render_artifacts` stay empty despite a claimed API success; whenever request/schema/status shapes disagree between client, API, and database; whenever the `repetitionRatio` presentation gate blocks `report_document`/`session_recap` output; or when adding/verifying a render target. Every capability claim must be labeled verified, partial, planned, or unsupported — never assume artifact-class or provider claims are live without checking current repo and Supabase state.
---

# GestaltView Gen & Render Engine

Last reviewed: 2026-07-14, from the "Symbiote Render Repair Package v2.0.0" — a prepared, locally-validated repair package that has **not** been applied to the live repo or Supabase project. Treat everything below as dated findings and a target contract to re-verify, not current fact.

Canonical live scene graph is `nextgen.scene-graph.v1` — not `gsvw-render.v1`. Don't use the latter unless a migration adapter is deliberately built and tested.

This skill is evidence-first: a design doc, dependency name, or artifact-class list is not proof of a live capability. Label every target verified / partial / planned / unsupported and don't silently promote between states.

## Inspect first
- `packages/nextgen-rendering-engine/src/core/types.ts`, `core/artifacts.ts`, `adapters/document.ts`, `adapters/orchestration.ts`, `server.ts` (browser/server split — check `browser.ts` too)
- `api/render/engine.ts`, `request.ts`, `user-id.ts`, `idempotency.ts`, `status.ts`, `promote-to-gallery.ts`
- `client/src/lib/nextGenRenderClient.ts`
- `shared/orchestration/execution.ts` (the `repetitionRatio` presentation gate)
- `supabase/migrations/` for current `render_jobs`/`render_artifacts` schema state
- Live Supabase: `render_jobs`/`render_artifacts` row counts, status CHECK constraint values, RLS policies, bucket privacy on `codex-exports`

## Known contract fractures as of July 2026 (recheck before trusting)
- API generated `rj_...` string IDs for UUID columns, wrote columns absent from the live schema, wrote status `ready` against a constraint that only admitted `completed`, and stringified JSONB fields.
- Storage upload passed `artifact.uri` (a local filepath string) straight to the sink instead of reading the file's bytes — so "artifacts" could just be path text.
- Privileged source lookups (`codex_artifact`, `created_artifact`, `transcriptory`) lacked owner-scope predicates — a broken-object-level-authorization risk even behind a server key.
- Orchestration used `Promise.all`, so one backend rejection erased otherwise-successful sibling artifacts.
- Async targets (PDF/image) were queued with no deployed worker to drain them — phantom jobs that can strand indefinitely.
- The `repetitionRatio` gate (threshold ~0.45) concatenated `content` with `previewHtml` — alternate representations of the *same* text by design — and hard-failed `report_document`/`session_recap` artifacts as a result. The decision layer had already approved the artifact before this gate fired; all 7 blocked runs followed this pattern.
- Markdown fell back to an escaped `<pre>` block unless a rendering strategy was explicitly injected.
- Gallery projection wrote placeholder HTML, used the enum value `creation-corner` where the live enum is `creation_corner`, and was not idempotent.
- At last inspection, `render_jobs` and `render_artifacts` both had 0 rows in the live Supabase project despite APIs returning success responses.

## Target contract (v2 — verify whether/how much is actually applied)
- Request envelope `gestaltview.render-request.v2`: `sourceFamily`, `sceneGraph` (`schema`/`graphId`/`nodes`/`edges`), `targets[]` (`format`/`mimeType`/`destinationIntent`/`required`), optional `idempotencyKey`. Source families: `scene_graph`, `codex_artifact`, `created_artifact`, `generated_artifact` (legacy alias), `transcriptory`.
- Job state machine: `queued → validating → rendering → storing → ready`; terminal `failed`/`cancelled`.
- Idempotency key = contract version + user + source family/ID + normalized formats + scene-graph fingerprint + optional client key; enforce one non-null key per user.
- Target isolation: settled (not `Promise.all`) dispatch; one receipt per target — `success`/`failed`/`unsupported`/`partial`. Never call a target "queued" unless a deployed worker + trigger + retry policy + observable drain actually exist.
- Presentation repair: score repetition independently in `content` vs. the visible text of `previewHtml` — never concatenate them. Block empty content, raw JSON/metadata leakage, partial HTML claimed as complete, invalid ownership/auth. Repair (don't hard-fail) true derivative repetition, keeping the original source untouched.
- Gallery projection: explicit action only, owner-scoped, allowed only from a `ready` job, idempotent by artifact `source_ref`, complete-HTML-only from a trusted deterministic backend, valid `file_room_origin` enum value.

## Capability matrix (re-verify — don't trust this table blindly)
| Target | Maturity |
|---|---|
| Safe Markdown-derived HTML | verified locally / needs production smoke test |
| JSON reference artifacts | partial |
| Mermaid source | partial |
| SVG diagram | partial (placeholder renderer) |
| PDF/PNG/JPEG/WebP | planned — no deployed worker observed |
| Slides/spreadsheets/audio/video/app builders | planned |

## Workflow
1. Re-inspect live repo + Supabase state before trusting anything above — these are dated findings, not durable identity facts.
2. Write an evidence matrix: expected contract vs. repo evidence vs. database evidence vs. observed runtime behavior vs. discrepancy vs. repair.
3. Apply migrations before shipping code that depends on new columns/statuses.
4. Deploy server/package changes with legacy request translation if Creation Corner still sends the old `{ jobId, graph, metadata }` shape.
5. Run `pnpm exec vitest run` on the touched orchestration/api/render test files, `pnpm exec tsc -p packages/nextgen-rendering-engine/tsconfig.json`, `pnpm exec tsc --noEmit`, `pnpm run build`.
6. Authenticated smoke test: one Markdown→HTML request → confirm job row, artifact row, real bytes + SHA-256, signed retrieval, complete visible HTML.
7. Test idempotent retry, owner isolation (two users), one optional-unsupported target alongside one required-success target.
8. Explicit Gallery projection test, then re-run Supabase security/performance advisors.
9. State exactly which of prepared / committed / pushed / PR-opened / merged / deployed / production-verified is true. Don't blur these.

## Compose with
- `gestaltview-schema-supabase`
- `gestaltview-app-runtime`
- `gestaltview-billy-api`
- `gestaltview-context-architecture`

## Done when
- Every capability claim in docs/skill/agent output matches current verified/partial/planned/unsupported status.
- `render_jobs`/`render_artifacts` reflect real durable rows for tested targets, not empty tables.
- Source material stays preserved and undeleted; only disclosed derivatives are deduplicated.
