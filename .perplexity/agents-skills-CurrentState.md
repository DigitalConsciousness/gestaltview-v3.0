# CurrentState — Supabase trainer start/import now resolves `training_runs` in the correct migration order

**Last updated:** 2026-06-24
**Owner context:** GestaltView v2 skills library (`.agents/skills/`) and Supabase trainer runtime
**Scope of this pass:** Fixed the trainer migration spine so `public.trainer_run_summary` is created after `public.training_runs`, eliminating the fresh-import `42P01` error and keeping the recreation-package canonical migrations aligned.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Trainer migration order | fixed | Removed the premature view definition from the hardening migration and moved it into the core trainer migration with `security_invoker = true`. | Fresh Supabase imports no longer fail when the summary view is created before `training_runs` exists. |
| Canonical recreation package | aligned | Mirrored the migration fix in `gestaltview_supabase_recreation_package/canonical_migrations`. | The package copy stays consistent with the live `supabase/migrations` spine. |
| Issue note | updated | Rewrote `supabase_start_issues.md` to record the resolution instead of only the failure log. | The start-issue handoff now shows both root cause and repaired state. |

## What changed in this pass

- Updated the trainer migration spine:
  - `supabase/migrations/20260330115505_trainer_security_hardening.sql`
  - `supabase/migrations/20260330120000_trainer_core.sql`
- Mirrored the same fix in the canonical recreation package:
  - `gestaltview_supabase_recreation_package/canonical_migrations/20260330115505_trainer_security_hardening.sql`
  - `gestaltview_supabase_recreation_package/canonical_migrations/20260330120000_trainer_core.sql`
- Rewrote the issue note:
  - `supabase_start_issues.md`

## Validation performed

- `git diff --check`

# CurrentState — Blackboard room skill and catalog routing now match the live room model

**Last updated:** 2026-06-24
**Owner context:** GestaltView v2 skills library (`.agents/skills/`) and Blackboard / Tribunal runtime
**Scope of this pass:** Added `gestaltview-blackboard-room` as a canonical room-contract skill and wired it into the curated catalog so capture, Tribunal recap, DI routing, and downstream handoff have a dedicated entrypoint.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Blackboard room skill | added | Added `gestaltview-blackboard-room/SKILL.md` with room map, DI routing, and recap logic. | Future agents now have a room-specific doctrine instead of inferring Blackboard from generic chat guidance. |
| Catalog surfaces | aligned | Updated `manifest.json`, `INDEX.md`, and `agents/AGENTS.md`, and refreshed the curated counts. | The skills catalog now exposes Blackboard through the same discovery surfaces as the other canonical runtime skills. |
| Repo-state notes | synced | Added this note to the live `CurrentState` surfaces. | The top-of-file state record now matches the current room contract. |

## What changed in this pass

- Added the new GestaltView Blackboard Room skill:
  - `.agents/skills/gestaltview-blackboard-room/SKILL.md`
- Updated the catalog surfaces:
  - `.agents/skills/manifest.json`
  - `.agents/skills/INDEX.md`
  - `.agents/skills/agents/AGENTS.md`
- Synced the current-state note:
  - `docs/CurrentState.md`

## Validation performed

- `python3 -m json.tool .agents/skills/manifest.json`
- `git diff --check`

# CurrentState — Vision Blueprint skills runtime alignment

**Last updated:** 2026-06-01
**Owner context:** GestaltView v2 skills library (`.agents/skills/`) and Vision Blueprint runtime package
**Scope of this pass:** Promoted the consolidated Vision Blueprint Package and Creation Layer supplement into first-class skill routing so future agents align product, room, Billy, DI, and artifact-generation work to the current runtime doctrine.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Vision Blueprint routing | added | Added `gestaltview-vision-blueprint` as the canonical doctrine bridge for room contracts, module language, governance, UI, Billy, and DI boundaries. | Agents now load the consolidated blueprint package before making direction-setting runtime decisions. |
| Creation Layer routing | added | Added `gestaltview-creation-layer` for Creation Corner, gen-engine APIs, Art Teacher presence, generated artifacts, provenance, consent, and destination routing. | Creation work is no longer flattened into generic artifact generation or prompt-form behavior. |
| Catalog surfaces | aligned | Updated `manifest.json`, `INDEX.md`, `agents/AGENTS.md`, `skills-keeper`, and core runtime/orchestration skills. | The skill catalog now matches the current runtime and blueprint package rather than only older route-map assumptions. |

## What changed in this pass

- Added the new canonical skills:
  - `.agents/skills/gestaltview-vision-blueprint/SKILL.md`
  - `.agents/skills/gestaltview-creation-layer/SKILL.md`
- Updated catalog and generated routing surfaces:
  - `.agents/skills/manifest.json`
  - `.agents/skills/INDEX.md`
  - `.agents/skills/agents/AGENTS.md`
- Updated core routing skills so onboarding, architecture, app runtime, ecosystem orchestration, suite orchestration, and Skills Keeper all point at the blueprint/runtime spine.

## Validation performed

- `python -m json.tool .agents/skills/manifest.json`
- `python scripts/validate_skill_catalog.py`
- `git diff --check`

---

# CurrentState — email/password signup and invite-only magic-link auth

**Last updated:** 2026-05-16
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`) and local workflow memory
**Scope of this pass:** Added email/password signup and sign-in, kept GitHub OAuth available, and routed invite-only magic links through the shared `/auth/callback` session handoff.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Email/password auth | added | Added email/password signup on `Signup.tsx` and email/password sign-in on `SignIn.tsx`. | Normal users now have a direct credential-based path instead of being limited to GitHub-only access. |
| Invite-only magic links | added | Added an allowlisted magic-link path for invited addresses. | Magic-link access stays controlled and can be used for assisted onboarding without opening public self-service invites. |
| Callback handling | aligned | Updated the callback page so it can finish OAuth transactions or sync a browser-issued Supabase session into the app cookie. | OAuth, password, and verification-link flows now converge on the same redirect and session state. |

## What changed in this pass

- Updated:
  - `client/src/pages/SignIn.tsx`
  - `client/src/pages/Signup.tsx`
  - `client/src/pages/AuthCallback.tsx`
  - `client/src/lib/supabaseAuth.ts`
  - `api/auth/supabase/session.ts`
  - `api/auth/supabase/magic-link.ts`
- Saved the same workflow note in:
  - `/home/codespace/.codex/memories/gestaltview-v2.md`

## Validation performed

- `git diff --check`
- `npm run build`

---

# CurrentState — GestaltView Codex skill and catalog alignment

**Last updated:** 2026-05-16
**Owner context:** GestaltView v2 skills library (`skills/`) and local workflow memory
**Scope of this pass:** Added a dedicated `gestaltview-codex` skill for deep repo analysis and wired it into the canonical catalog and generated agents inventory.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Codex analysis skill | added | Added `skills/gestaltview-codex/SKILL.md`, `references/codebase-analysis.md`, and `agents/openai.yaml`. | Codex now has a repo-specific operating lens for deep analysis, layer mapping, and durable handoffs. |
| Catalog wiring | aligned | Updated `skills/manifest.json`, `skills/INDEX.md`, and `skills/agents/AGENTS.md`. | The new skill is discoverable from the curated catalog, highlighted core, and generated agents inventory. |
| Workflow memory | synced | Recorded the same workflow update in the local memory file. | The next session can recover the current operating loop without rediscovering the same analysis. |

## What changed in this pass

- Added the new GestaltView Codex skill:
  - `skills/gestaltview-codex/SKILL.md`
  - `skills/gestaltview-codex/references/codebase-analysis.md`
  - `skills/gestaltview-codex/agents/openai.yaml`
- Updated the catalog surfaces:
  - `skills/manifest.json`
  - `skills/INDEX.md`
  - `skills/agents/AGENTS.md`
- Saved the same workflow note in:
  - `/home/codespace/.codex/memories/gestaltview-v2.md`

## Validation performed

- `python3 -m json.tool skills/manifest.json`
- `git diff --check`

---

# CurrentState — GestaltView skill/runtime alignment and memory sync

**Last updated:** 2026-05-16
**Owner context:** GestaltView v2 skills library (`skills/`) and local workflow memory
**Scope of this pass:** Aligned the core GestaltView skill entrypoints with the current runtime orientation loop and saved the same workflow note in the local memory store.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Onboarding and workflow skills | aligned | Updated the core GestaltView skill entrypoints to point at `Tuesday.md` plus the current context-persistence docs. | New work starts from the same live issue queue and handoff trail instead of reconstructing context from stale memory. |
| Current-state maintenance | aligned | Tightened the skills-state and runtime-state guidance so they reference the same operational truth surfaces. | The repository keeps one factual log of what changed, why it changed, and what still needs attention. |
| Local memory | synced | Wrote the current workflow note into the local GestaltView memory file. | The next session can recover the current orientation path quickly without rediscovering it from scratch. |

## What changed in this pass

- Updated the following skills to match the current runtime orientation loop:
  - `skills/gestaltview-repo-onboarding/SKILL.md`
  - `skills/gestaltview-workflow-operations/SKILL.md`
  - `skills/gestaltview-context-architecture/SKILL.md`
  - `skills/gestaltview-suite-orchestrator/SKILL.md`
  - `skills/gestaltview-current-state-maintenance/SKILL.md`
  - `skills/gestaltview-app-runtime/SKILL.md`
- Saved the same workflow note in:
  - `/home/codespace/.codex/memories/gestaltview-v2.md`

## Validation performed

- `git diff --check`

---

# CurrentState — Admin Trainer Personhood Skill Promotion

**Last updated:** 2026-04-10
**Owner context:** GestaltView v2 skills library (`skills/`)
**Scope of this pass:** Added a curated Admin Trainer personhood skill so Agent Knowledge Library and manifest-backed embodiment work has a separate routing entrypoint from the sellable GestaltView Agent Trainer package.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Admin Trainer personhood skill | added | Added `skills/gestaltview-admin-trainer-personhood/SKILL.md` and `agents/openai.yaml`. | Future Agent Knowledge Library, identity-boundary, mutation, and manifest work can load the right context without overloading the package-trainer skill. |
| Catalog promotion | aligned | Updated `skills/manifest.json`, `skills/INDEX.md`, and `skills/agents/AGENTS.md`. | The new skill is discoverable from the curated catalog and highlighted core set. |
| Boundary clarity | explicit | The skill states that it is separate from `agent_trainer/gestaltview_agent_trainer` and from generic trainer run/eval work. | The Admin Trainer framework stays an internal GestaltView ecosystem capability instead of being confused with the product package. |

## What changed in this pass

- Added:
  - `skills/gestaltview-admin-trainer-personhood/SKILL.md`
  - `skills/gestaltview-admin-trainer-personhood/agents/openai.yaml`
- Updated:
  - `skills/manifest.json`
  - `skills/INDEX.md`
  - `skills/agents/AGENTS.md`
- Promoted `gestaltview-admin-trainer-personhood` into:
  - the highlighted core list,
  - `entrypoints.admin_trainer_personhood`,
  - the `runtime_billy_data_and_schema` category.

## Validation performed

- `python3 -m json.tool skills/manifest.json`
- `git diff --check`

---

# CurrentState — Persistent Memory Knowledge Base MVP

**Last updated:** 2026-03-30  
**Owner context:** GestaltView v2 runtime (`api/`, `shared/`, `supabase/`)  
**Scope of this pass:** Added a first-pass persistent memory layer for Billy that is curated and user-scoped instead of auto-ingesting every chat turn.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Supabase memory store | ✅ added | Added `memory_entries` plus `match_memory_entries` and `search_memory_entries` in schema + migration surfaces. | Billy now has a dedicated knowledge base for user memory instead of overloading `founder_context`. |
| Server memory API | ✅ added | Added `api/session/memory.ts` for authenticated list/search/create/delete flows. | Persistent memory can be curated deliberately through a real API surface. |
| Billy runtime integration | ✅ wired | Billy now retrieves memory hits separately from compendium chunks and injects them into the prompt as `PERSISTENT MEMORY CONTEXT`. | User-specific continuity can inform replies without pretending personal memory is part of the public corpus. |
| Quality posture | ✅ intentional | Memory capture is explicit and deduped by content hash; there is no blind “save every message” summarizer yet. | This avoids building a redundant, generic sludge layer on day one. |

## What changed in this pass

- Added shared embedding and memory helpers:
  - `api/_lib/embeddings.ts`
  - `api/_lib/memory.ts`
- Extended the Supabase REST helper with:
  - `matchMemoryEntries`
  - `searchMemoryEntries`
  - `listMemoryEntries`
  - `upsertMemoryEntry`
  - `deleteMemoryEntry`
- Added the authenticated memory route:
  - `api/session/memory.ts`
- Updated Billy prompt assembly so persistent memory is carried as a separate block, not mixed into the Manifest Index corpus.
- Added the schema and migration source of truth:
  - `supabase/schema.sql`
  - `supabase/migrations/20260330193000_persistent_memory_entries.sql`

## Reasoning

- `founder_context` is good for founder continuity but too narrow and too structurally shallow to serve as a real memory bank.
- Storing memory in a dedicated table with `kind`, `scope`, `importance`, `pinned`, tags, and a dedupe hash creates a higher-quality foundation than stuffing more JSON into one founder row.
- The right MVP is curated capture plus retrieval. Auto-summarizing every Billy turn would generate exactly the low-signal, repetitive content this repo is trying to eliminate from its knowledge layers.

# CurrentState — Skill Corpus Reset + Strict Catalog Curation

**Last updated:** 2026-03-30  
**Owner context:** GestaltView v2 skills library (`skills/`)  
**Scope of this pass:** Cleared the live skill corpus in Supabase, re-cut the curated skills library around repo-specific and stewardship-only entrypoints, and defined a smaller highlighted core for the next re-ingestion pass instead of letting the whole on-disk tree flow back into `skill_fragments`.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Skill corpus reset | ✅ done | Deleted all rows from `skill_fragments`; `skill_stats` dropped to zero automatically because it is a view over `skill_fragments`. | The live skill corpus is now empty and ready for a deliberate rebuild instead of accumulating stale or redundant fragments. |
| Canonical catalog | ✅ tightened | Reduced the curated manifest from `78` top-level skills to `48` strict canonical entries. | Generic vendor packs, media utilities, and overlapping bundles no longer participate in normal routing. |
| Highlighted rebuild core | ✅ defined | Added a `20`-skill highlighted core in `skills/manifest.json` and reflected it in `skills/INDEX.md`. | The next ingestion pass can start from high-signal hybrid entrypoints instead of trying to ingest the entire library. |
| Overlap handling | ✅ clarified | Demoted `gestaltview-cli-agent` and `gestaltview-generate-wiki` from the curated manifest because their declared names drift and their scope overlaps cleaner entrypoints. | The strict library is less redundant and less confusing without deleting useful material from disk. |

## What changed in this pass

- Cleared `skill_fragments` in Supabase.
- Verified that `skill_stats` is a `VIEW`, not a writable base table, and that it now reads `0` rows because `skill_fragments` is empty.
- Confirmed `skills` was already empty and remains empty.
- Rewrote `skills/manifest.json` to:
  - reduce the canonical catalog to repo-specific GestaltView skills plus the three skill-stewardship skills,
  - move generic/vendor/media/document utility skills into explicit auxiliary groups,
  - add a `highlighted_core` list for storage-conscious rebuilds,
  - and document the demotion of `gestaltview-cli-agent` and `gestaltview-generate-wiki`.
- Rewrote `skills/INDEX.md` so the human-facing catalog now matches the strict manifest policy and the highlighted-core rebuild path.

## Reasoning

- `Monday.md` makes the intent clear: the goal is not to keep every skill-shaped thing in circulation. The goal is to empty the current skill corpus and rebuild from "ideal highlighted" top-tier hybrids that keep the good content while dropping redundant nonsense.
- The existing manifest had already separated canonical versus auxiliary material, but it still treated too many generic or imported skills as first-class catalog entries.
- `skill_stats` turned out to be a projection of `skill_fragments`, not an independent writable table. The honest reset is therefore to clear `skill_fragments` and verify that the view empties.
- A strict manifest plus a highlighted-core shortlist gives two useful layers:
  - a repo-owned canonical library for routing and generators,
  - and a smaller rebuild set for free-tier Supabase housekeeping.

## Validation performed

- Verified live table types:
  - `select table_name, table_type from information_schema.tables where table_schema = 'public' and table_name in ('skill_fragments','skill_stats');`
  - Result: `skill_fragments` = `BASE TABLE`, `skill_stats` = `VIEW`
- Verified the `skill_stats` definition:
  - `select definition from pg_views where schemaname='public' and viewname='skill_stats';`
  - Result: aggregates directly from `skill_fragments`
- Cleared the skill corpus:
  - `delete from skill_fragments;`
- Verified live row counts after reset:
  - `select 'skill_fragments' as name, count(*) as row_count from skill_fragments union all select 'skill_stats' as name, count(*) as row_count from skill_stats union all select 'skills' as name, count(*) as row_count from skills;`
  - Result: all three returned `0`

## Recommendations / next steps

1. Rebuild `skill_fragments` from the `highlighted_core` set first, not from the full on-disk tree.
2. Use `skills-keeper` to merge the highest-value auxiliary ideas back into broader hybrid entrypoints instead of re-promoting generic skills one-by-one.
3. If a future skill needs to rejoin the curated manifest, require a clear local surface, a non-placeholder `SKILL.md`, and a reason it beats the broader generic alternative.
4. Regenerate the derived agent/plugin catalog surfaces after this manifest cut so generated routing follows the new policy.

# CurrentState — Agent Trainer Skill Base + Trainer RLS Policy Alignment

**Last updated:** 2026-03-30  
**Owner context:** GestaltView v2 skills library (`skills/`)  
**Scope of this pass:** Added a canonical trainer skill for the new agent-trainer slice, promoted it through the curated catalog, and aligned the trainer Supabase posture with explicit service-role policies instead of leaving the trainer tables as RLS-enabled-with-no-policy.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Trainer skill routing | ✅ added | Added `skills/gestaltview-agent-trainer/` with a canonical `SKILL.md`, references, and `agents/openai.yaml`. | The trainer is now a first-class skill target instead of an implementation that only exists in code and migrations. |
| Skill composition | ✅ clarified | The new trainer skill explicitly composes `gestaltview-app-runtime`, `gestaltview-schema-supabase`, `gestaltview-ai-routing`, `evaluation`, `agent-development`, and `skills-keeper`. | Future trainer work can load the right adjacent context without duplicating guidance across skills. |
| Catalog promotion | ✅ aligned | Updated `skills/manifest.json`, `skills/INDEX.md`, and the generated agents catalog so the trainer appears in curated entrypoints. | The feature is now discoverable from the normal skill-library surfaces. |
| Supabase trainer posture | ✅ tightened | Added an explicit trainer RLS-policy migration to grant `service_role` access on trainer tables. | Supabase advisors should now reflect the intended server-only access model rather than warning about policy gaps. |

## What changed in this pass

- Added `skills/gestaltview-agent-trainer/SKILL.md`.
- Added trainer reference docs:
  - `skills/gestaltview-agent-trainer/references/runtime-map.md`
  - `skills/gestaltview-agent-trainer/references/skill-composition.md`
  - `skills/gestaltview-agent-trainer/references/supabase-policy-model.md`
- Added trainer agent metadata:
  - `skills/gestaltview-agent-trainer/agents/openai.yaml`
- Promoted the trainer skill into the curated manifest and human index:
  - `skills/manifest.json`
  - `skills/INDEX.md`
- Planned the generated agent-catalog refresh so `skills/agents/AGENTS.md` stays aligned with the promoted trainer skill.
- Added the explicit trainer policy migration:
  - `supabase/migrations/20260330120830_trainer_rls_policies.sql`

## Reasoning

- The trainer feature already existed in code, UI, APIs, worker runtime, and Supabase migrations, but it did not yet exist as a reusable skill entrypoint.
- This repo already has strong canonical skills for app runtime, Supabase, routing, and evaluation. The right move is to compose them around a trainer-specific entrypoint instead of scattering trainer guidance across unrelated skill files.
- The remaining Supabase advisor findings were informational `rls_enabled_no_policy` notices on trainer tables. Explicit `service_role` policies make the intent legible and reduce drift between runtime design and database posture.

## Validation target for this pass

- Regenerate `skills/agents/AGENTS.md` after the manifest update.
- Run the skill quick validator on `skills/gestaltview-agent-trainer`.
- Apply the new trainer policy migration to Supabase and re-run security advisors.

# CurrentState — GestaltView Skill Suite Runtime-Alignment Refresh

**Last updated:** 2026-03-29  
**Owner context:** GestaltView v2 skills library (`skills/`)  
**Scope of this pass:** Rewrote every top-level `gestaltview-*` skill in `skills/` so the suite now reflects the current `gestaltview-v2` runtime, route map, API layer, cross-repo boundaries, and Supabase integration surfaces instead of older compendium-era assumptions.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| GestaltView skill coverage | ✅ refreshed | All `46` top-level `gestaltview-*` skills were rewritten and stamped `Last reviewed: 2026-03-29`. | The suite now describes the current repo rather than a mix of runtime truth and historical archive framing. |
| Runtime anchoring | ✅ aligned | Each skill now points at live repo anchors such as `client/src/App.tsx`, `api/`, `shared/`, `scripts/`, `docs/`, and `supabase/`. | Operators can open the right files first instead of routing through stale conceptual directories. |
| Supabase integration clarity | ✅ aligned | Skills that touch auth, retrieval, rate limits, pricing, founder context, or migrations now explicitly reference `supabase/`, `api/_lib/supabase.ts`, `client/src/contexts/AuthContext.tsx`, and related validation surfaces where relevant. | The suite now reflects the actual data layer and no longer treats Supabase as an afterthought. |
| Cross-repo honesty | ✅ improved | Skills that still depend on `GestaltView-Official-Compendium` or sibling repos now frame those as explicit handoffs or integration boundaries. | The catalog now distinguishes local certainty from cross-repo assumptions. |
| Concept-vs-implementation accuracy | ✅ improved | Skills like `gestaltview-user-profile`, `gestaltview-insight-bot`, `gestaltview-resume-rockstar`, and `gestaltview-symbiocoder` now say what is actually implemented locally versus what remains a lane, demo, or reference surface. | This reduces catalog drift and prevents overclaiming product maturity. |

## What changed in this pass

- Rewrote all `46` top-level `skills/gestaltview-*/SKILL.md` files against the live `gestaltview-v2` repository structure.
- Replaced compendium-era or archive-era phrasing in the GestaltView suite with repo-current runtime guidance.
- Standardized the top-level structure of each GestaltView skill so every file now includes:
  - a repo-current description,
  - a `Last reviewed: 2026-03-29` marker,
  - `Inspect first`,
  - `Current integrations`,
  - `Workflow`,
  - `Compose with`,
  - and `Done when`.
- Added explicit route, API, script, shared-module, and Supabase anchor files to the GestaltView skill suite.
- Corrected skill guidance around limited or partial local implementations:
  - `gestaltview-user-profile` now reflects the current lightweight Supabase auth/tier/profile layer instead of implying a full modular profile engine.
  - `gestaltview-current-state` now positions itself as the compendium-facing mirror skill, while `gestaltview-current-state-maintenance` owns active `gestaltview-v2` repo-state updates.
  - Portfolio-lane skills now distinguish demo or routed presence from fully mounted sibling-repo implementations.
- Preserved existing declared skill names even where folder/name mismatches still exist, because this pass was documentation and routing-quality work rather than manifest or generator surgery.

## Reasoning

- The repository-level docs and runtime files were already more current than many of the individual GestaltView skill documents. The skill suite had therefore become a weak link in repository orientation.
- The user explicitly asked for the current GestaltView skills to reflect the present state of the platform and its integrations, including Supabase.
- The most visible drift pattern was archive-first language that no longer matched the actual `gestaltview-v2` route map, Billy runtime, pricing flows, or Supabase schema.
- A standardized skill shape makes future maintenance easier because every GestaltView skill now answers the same practical questions:
  - what this skill is for now,
  - which files to inspect first,
  - which live integrations matter,
  - which companion skills to compose with,
  - and what "done" should mean.

## Validation performed

- Rewrote the suite in one controlled pass:
  - `node /tmp/refresh_gestaltview_skills.mjs`
  - Result: wrote all top-level `gestaltview-*` skill files in `skills/`
- Verified the number of GestaltView skill folders on disk:
  - `find skills -maxdepth 1 -type d -name 'gestaltview-*' | wc -l`
  - Result: `46`
- Verified all refreshed GestaltView skill files now carry the new review stamp:
  - `grep -R "Last reviewed: 2026-03-29" skills/gestaltview-*/* | wc -l`
  - Result: `46`
- Spot-checked representative rewritten skills across runtime, data, and cross-repo categories:
  - `sed -n '1,220p' skills/gestaltview-billy-intelligence/SKILL.md`
  - `sed -n '1,220p' skills/gestaltview-schema-supabase/SKILL.md`
  - `sed -n '1,220p' skills/gestaltview-app-runtime/SKILL.md`
  - `sed -n '1,220p' skills/gestaltview-user-profile/SKILL.md`
  - `sed -n '1,220p' skills/gestaltview-cross-repo-sync/SKILL.md`
  - Result: content reflects current repo surfaces and Supabase boundaries
- Reviewed aggregate change size:
  - `git diff --stat -- skills/gestaltview-* skills/CurrentState.md`
  - Result before updating this file: all `46` GestaltView skill files changed in the expected scope

## Overall skills state now

1. The GestaltView skill suite is materially closer to the live `gestaltview-v2` repository than it was before this pass.

2. Supabase is now treated as a core integration surface across the relevant skills instead of being inconsistently referenced.

3. Cross-repo boundaries are more honest.
   Companion repos are now described as handoffs, dependencies, or reference surfaces when that is the truth.

4. Concept-heavy skills are less misleading.
   The suite now says when something is currently a route, a demo, a doc surface, a helper layer, or merely a future lane.

5. The suite is easier to maintain.
   A shared structure across the GestaltView skills means future refresh passes can be smaller and more mechanical.

## Recommendations / next steps

1. Keep updating GestaltView skill files when runtime reality changes.
   Triggers include route additions, API contract changes, pricing-tier changes, Supabase migration changes, and meaningful repo-boundary shifts.

2. Consider a later catalog pass for declared-name mismatches.
   `gestaltview-cli-agent` and `gestaltview-artifact-creator` still preserve older declared skill names for compatibility.

3. Revisit older architecture docs separately.
   Some repo docs outside `skills/` still describe older routing, provider-order, or runtime assumptions and should be refreshed in a dedicated documentation pass.

4. Keep `skills/CurrentState.md` updated whenever broad skill-suite changes happen.
   This file should remain the live operational log for catalog-level reality, not just for archival or manifest structure changes.

## Canonical files for this pass

- `skills/CurrentState.md`
- `skills/gestaltview-addiction-recovery/SKILL.md`
- `skills/gestaltview-adhd-power-up/SKILL.md`
- `skills/gestaltview-agents-context/SKILL.md`
- `skills/gestaltview-ai-routing/SKILL.md`
- `skills/gestaltview-app-runtime/SKILL.md`
- `skills/gestaltview-apps-portfolio/SKILL.md`
- `skills/gestaltview-artifact-creator/SKILL.md`
- `skills/gestaltview-billy-api/SKILL.md`
- `skills/gestaltview-billy-intelligence/SKILL.md`
- `skills/gestaltview-billy-runtime-sync/SKILL.md`
- `skills/gestaltview-billy-voice/SKILL.md`
- `skills/gestaltview-cli-agent/SKILL.md`
- `skills/gestaltview-context-architecture/SKILL.md`
- `skills/gestaltview-corpus-ingestion/SKILL.md`
- `skills/gestaltview-cross-repo-sync/SKILL.md`
- `skills/gestaltview-cross-repo-workflows/SKILL.md`
- `skills/gestaltview-current-state/SKILL.md`
- `skills/gestaltview-current-state-maintenance/SKILL.md`
- `skills/gestaltview-digital-intelligence-collaboration/SKILL.md`
- `skills/gestaltview-diligence-packaging/SKILL.md`
- `skills/gestaltview-ecosystem-orchestrator/SKILL.md`
- `skills/gestaltview-executive-summary/SKILL.md`
- `skills/gestaltview-exhibit-prototyping/SKILL.md`
- `skills/gestaltview-generate-wiki/SKILL.md`
- `skills/gestaltview-gpt-actions/SKILL.md`
- `skills/gestaltview-insight-bot/SKILL.md`
- `skills/gestaltview-knowledge-curation/SKILL.md`
- `skills/gestaltview-manifest-index/SKILL.md`
- `skills/gestaltview-manifest-indexing/SKILL.md`
- `skills/gestaltview-marketing-social/SKILL.md`
- `skills/gestaltview-mcp-connector/SKILL.md`
- `skills/gestaltview-repo-map/SKILL.md`
- `skills/gestaltview-repo-onboarding/SKILL.md`
- `skills/gestaltview-resume-rockstar/SKILL.md`
- `skills/gestaltview-revenue-pricing/SKILL.md`
- `skills/gestaltview-schema-contracts/SKILL.md`
- `skills/gestaltview-schema-supabase/SKILL.md`
- `skills/gestaltview-strategy-executive/SKILL.md`
- `skills/gestaltview-suite-orchestrator/SKILL.md`
- `skills/gestaltview-symbiocoder/SKILL.md`
- `skills/gestaltview-timeline-diligence/SKILL.md`
- `skills/gestaltview-timeline-evidence/SKILL.md`
- `skills/gestaltview-transcript-synthesis/SKILL.md`
- `skills/gestaltview-ui-archive/SKILL.md`
- `skills/gestaltview-user-profile/SKILL.md`
- `skills/gestaltview-workflow-operations/SKILL.md`

---

# CurrentState — Skills Catalog Stewardship And Archive Normalization

**Last updated:** 2026-03-28  
**Owner context:** GestaltView v2 skills library (`skills/`)  
**Scope of this pass:** Established a dedicated live state document for the skills tree after catalog audit, canonical-vs-auxiliary separation, overlap cleanup, archival of retired variants, archival of stale duplicate drafts, and generator alignment.

## Executive snapshot

| Area | Status | What changed in this pass | Why it matters |
|---|---|---|---|
| Catalog policy | ✅ aligned | `skills/manifest.json` and `skills/INDEX.md` now treat `76` top-level skill folders as canonical while documenting `118` top-level `SKILL.md` folders on disk and `42` auxiliary top-level skills outside the curated allowlist. | The skills catalog is now explicit instead of silently depending on every folder in `skills/`. |
| Generator behavior | ✅ aligned | `skills/scripts/skill_inventory.py` now uses the curated manifest as the top-level allowlist and skips later duplicate declared names. | Generated outputs now stay stable even when archival or overlapping folders still exist on disk. |
| Agent routing metadata | ✅ aligned | `skills/agents/AGENTS.md` was regenerated and now points `skill-creator` at `skill-creator/SKILL.md` without duplicate entries from archived variants. | Agents no longer route through stale `skills-creator` or `#2` paths. |
| Variant archival | ✅ aligned | The top-level `gestaltview-digital-intelligence-collaboration-#2` and `gestaltview-marketing-social-#2` folders were moved under `skills/archive/variants/`. | Retired variants remain available for provenance without participating in normal routing or discovery. |
| Duplicate file cleanup | ✅ aligned | Exact duplicate reference/config files were moved into skill-local `archive/duplicates/`, and stale `SKILL (2).md` drafts were moved into skill-local `archive/drafts/`. | Active skill roots no longer contain ambiguous duplicate files. |
| CurrentState discipline | ✅ established | `skills/CurrentState.md` now exists and `skills/INDEX.md` now treats it as the live operational log for the skills tree. | Future skill-library changes have a dedicated place to record reality, risks, and next steps. |
| Residual overlap | ⚠ documented | Nested `python-*` and `render-deploy` skills still exist under `gestaltview-cli-agent`, and `skills/SKILL.md` still declares `hf-mcp`. | Remaining complexity is intentional and documented rather than hidden drift. |

## What changed in this pass

- Added `skills/CurrentState.md` as the live operational state document for the `skills/` subtree.
- Updated `skills/INDEX.md` so the index and this CurrentState document work as companion surfaces: the index is the stable map and `CurrentState.md` is the live state log.
- Updated `skills/manifest.json` so archive metadata now records:
  - root archived variant skill directories,
  - exact duplicate archived files,
  - archived skill-draft files,
  - and an empty `duplicate_files_present` anomaly list for the live tree.
- Updated `skills/scripts/skill_inventory.py` so `manifest.json` is the curated top-level allowlist, uncataloged top-level skills are detectable, and later duplicate declared names are ignored during collection.
- Regenerated `skills/agents/AGENTS.md` so generated skill routing matches canonical paths and no longer prefers duplicate or stale folders.
- Renamed `skills/skills-creator` to `skills/skill-creator` to align folder naming with the declared skill name and generated routing.
- Moved retired top-level `#2` variants to:
  - `skills/archive/variants/gestaltview-digital-intelligence-collaboration-#2`
  - `skills/archive/variants/gestaltview-marketing-social-#2`
- Moved exact duplicate leftover files into skill-local archive locations under:
  - `skills/gestaltview-context-architecture/archive/duplicates/`
  - `skills/gestaltview-gpt-actions/archive/duplicates/`
- Moved stale draft skill files into skill-local archive locations under:
  - `skills/gestaltview-context-architecture/archive/drafts/`
  - `skills/gestaltview-gpt-actions/archive/drafts/`
  - `skills/gestaltview-marketing-social/archive/drafts/`
  - `skills/gestaltview-suite-orchestrator/archive/drafts/`
- Added Python cache ignores in `.gitignore` so `__pycache__/` output from local inventory work does not keep polluting repository status.

## Reasoning

- The skills tree now functions as a curated subsystem, not just a loose folder collection. The catalog therefore needs both a stable structural map and a live operational status log.
- `skills/INDEX.md` is good for navigation and canonical placement rules, but it is not the right surface for per-pass state, risks, verification, or pending cleanup. A dedicated `skills/CurrentState.md` closes that gap.
- Variant and duplicate material should be preserved for provenance when useful, but it should not remain beside canonical files where it can confuse routing, generators, or future cleanup passes.
- Generated outputs should be driven by explicit policy. Using `manifest.json` as the allowlist and deduping by declared skill name makes the agent inventory deterministic.
- A small `.gitignore` cleanup is justified because CurrentState maintenance depends on clean signal. If every validation run leaves noisy Python cache files behind, state-tracking becomes less trustworthy.

## Validation performed

- Parsed the catalog manifest:
  - `python3 -m json.tool skills/manifest.json`
  - Result: passed
- Verified there are no live duplicate skill drafts at the active skill-root level:
  - `find skills -maxdepth 2 -name 'SKILL (2).md' | sort`
  - Result: no output
- Verified archived draft-skill paths:
  - `find skills -path '*/archive/drafts/*' -type f | sort`
  - Result: four archived draft files present under skill-local archive folders
- Verified active `CurrentState` references before creating this file:
  - `find . -name 'CurrentState.md' -o -name 'CURRENTSTATE.md' | sort`
  - Result before this file: only `docs/CurrentState.md` existed
- Verified generated skill routing after inventory changes:
  - `python3 skills/scripts/generate_agents.py`
  - Result: wrote `skills/agents/AGENTS.md` with `78` skills total (`76` canonical top-level skills plus `2` repo-local helpers)
- Verified Python cache noise is now ignored:
  - `git status --short .gitignore skills/scripts/__pycache__`
  - Result: only `.gitignore` remains tracked in status

## Overall skills state now

1. The top-level skills catalog is now intentionally curated.
   `skills/manifest.json` is the source of truth for canonical top-level skill discovery, while auxiliary top-level skills remain documented but excluded from generated outputs.

2. Active routing is materially cleaner than before this pass.
   `skill-creator` is the canonical path, duplicate declared names are handled deterministically, and archived `#2` variants no longer compete with canonical folders.

3. Historical leftovers are preserved but isolated.
   Retired skill directories live under `skills/archive/variants/`, while file-level leftovers live under skill-local `archive/drafts/` and `archive/duplicates/` folders.

4. The skills subtree now has its own live state document.
   `skills/CurrentState.md` should be updated whenever the skill catalog, archive layout, routing defaults, or generator behavior changes in a meaningful way.

5. Some complexity remains by design.
   The nested `gestaltview-cli-agent` duplicates and the standalone `skills/SKILL.md` / `hf-mcp` entrypoint are still present, but they are now explicitly documented instead of silently shaping behavior.

## Recommendations / next steps

1. Update `skills/CurrentState.md` whenever skill-library reality changes.
   Triggers include new canonical skills, archive moves, folder renames, generator changes, overlap-routing changes, and meaningful catalog-policy edits.

2. Commit the current skills cleanup as one coherent changeset.
   The rename, archive moves, manifest/index updates, and generator alignment should stay together in history.

3. Periodically review the `42` auxiliary top-level skills.
   Decide whether each should stay auxiliary, be promoted into the canonical manifest, or be archived.

4. Revisit nested duplicate skills under `gestaltview-cli-agent`.
   If they are still needed, keep the routing preference documented. If not, either rename them to avoid declared-name collisions or convert them into references instead of live nested skills.

5. Keep `skills/SKILL.md` explicitly out of catalog-entrypoint assumptions unless it is renamed or moved.
   Right now it is a standalone `hf-mcp` skill document, not a root index.

## Canonical files for this pass

- `.gitignore`
- `skills/CurrentState.md`
- `skills/INDEX.md`
- `skills/manifest.json`
- `skills/scripts/skill_inventory.py`
- `skills/agents/AGENTS.md`
- `skills/archive/README.md`
- `skills/archive/variants/gestaltview-digital-intelligence-collaboration-#2/`
- `skills/archive/variants/gestaltview-marketing-social-#2/`
- `skills/gestaltview-context-architecture/archive/duplicates/`
- `skills/gestaltview-context-architecture/archive/drafts/`
- `skills/gestaltview-gpt-actions/archive/duplicates/`
- `skills/gestaltview-gpt-actions/archive/drafts/`
- `skills/gestaltview-marketing-social/archive/drafts/`
- `skills/gestaltview-suite-orchestrator/archive/drafts/`
- `skills/skill-creator/`

**© 2026 Keith Soyka / GestaltView — All Rights Reserved**
