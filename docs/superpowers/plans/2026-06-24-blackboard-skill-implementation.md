# Blackboard Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new GestaltView Blackboard skill that explains the room system from the Blackboard perspective, including Sanctuary, Blackboard Room, Tribunal, Dynamic Inner World, External Scaffold, Creation Corner, Billy, session recap, and summary logic.

**Architecture:** This is a new repo-local skill under `.agents/skills/` plus the catalog wiring needed for the skill library to discover it. The skill should stay room-level and doctrine-oriented: it teaches how the capture-to-creation flow works, but it should not duplicate Transcriptory, Creation Layer, or generic runtime instructions.

**Tech Stack:** Markdown `SKILL.md`, generated agent catalog files (`INDEX.md`, `manifest.json`, `agents/AGENTS.md`), and repo-state docs (`docs/CurrentState.md`).

---

### Task 1: Create the Blackboard skill skeleton

**Files:**
- Create: `.agents/skills/gestaltview-blackboard-room/SKILL.md`
- Test: `.agents/skills/gestaltview-blackboard-room/SKILL.md`

- [ ] **Step 1: Write the failing test**

Create the new skill file with the expected frontmatter and body outline, but leave the trigger language and room logic sections intentionally incomplete so the review step can catch missing scope before the skill is promoted.

```markdown
---
name: gestaltview-blackboard-room
description: Use when...
---

# GestaltView Blackboard Room

## Inspect first

## Current integrations

## Room map and purpose

## Transition logic

## Tribunal integration

## Billy and DI behavior

## Capture and recap logic

## Guardrails
```

- [ ] **Step 2: Run test to verify it fails**

Run: `sed -n '1,220p' .agents/skills/gestaltview-blackboard-room/SKILL.md`

Expected: the file exists, but the content is clearly incomplete and still missing the approved Blackboard/Tribunal scope.

- [ ] **Step 3: Write minimal implementation**

Fill in the skill body with the approved Blackboard scope from the spec, including:

- the room map
- Blackboard capture behavior
- Tribunal roundtable, debate, session recap, and summary behavior
- Billy / DI routing in the Blackboard lane
- transition logic into Dynamic Inner World, External Scaffold, and Creation Corner
- guardrails against collapsing Blackboard into a generic chatbot

Use these live anchors in the skill:

- `client/src/pages/BlackboardRoomPage.tsx`
- `client/src/lib/blackboardDiRouting.ts`
- `client/src/lib/blackboardRecapArtifacts.ts`
- `client/src/components/SessionRecapGenerator.tsx`
- `client/src/components/capture/BlackboardCompanionChat.tsx`
- `client/src/pages/TribunalPage.tsx`
- `client/src/lib/billy-runtime-guide.ts`
- `client/src/lib/BillyEngine.ts`
- `docs/CurrentState.md`
- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/ONE_PAGE_NORTH_STAR.md`
- `GestaltView_Vision_Blueprint_Package/02_PRODUCT_OS/ROOM_BASED_OS_BLUEPRINT.md`
- `GestaltView_Vision_Blueprint_Package/02_PRODUCT_OS/ROOM_CONTRACTS.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/CREATION_LAYER_MASTER_SPEC.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/MULTIMODAL_CREATION_ENGINE_SPEC.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/RAPID_PROTOTYPE_TO_CREATION_CORNER_HANDOFF.md`
- `GestaltView_Vision_Blueprint_Package/03_CREATION_LAYER/ART_TEACHER_AND_LIVE_DI_PRESENCE.md`

The final `SKILL.md` should include a trigger description along the lines of:

```markdown
---
name: gestaltview-blackboard-room
description: Understand and explain GestaltView’s Blackboard Room as the capture and working surface, including Sanctuary, Tribunal, Dynamic Inner World, External Scaffold, Creation Corner, Billy behavior, room transitions, and session recap/summary logic. Use this skill whenever the user asks about the purpose of each room, how Blackboard integrates with Tribunal, or how material moves from raw capture into synthesis and output.
---
```

- [ ] **Step 4: Run test to verify it passes**

Run: `sed -n '1,260p' .agents/skills/gestaltview-blackboard-room/SKILL.md`

Expected: the file contains the approved room map, integration list, guardrails, and room-transition logic in clear, repo-specific language.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/gestaltview-blackboard-room/SKILL.md
git commit -m "feat(skills): add Blackboard room skill skeleton"
```

### Task 2: Wire the Blackboard skill into the skills catalog

**Files:**
- Modify: `.agents/skills/manifest.json`
- Modify: `.agents/skills/INDEX.md`
- Modify: `.agents/skills/agents/AGENTS.md`
- Test: `.agents/skills/manifest.json`
- Test: `.agents/skills/INDEX.md`
- Test: `.agents/skills/agents/AGENTS.md`

- [ ] **Step 1: Write the failing test**

Update the curated catalog so the new Blackboard skill is discoverable from the highlighted core and canonical lists. The skill should be visible in the main index and routed from the generated agents inventory.

Required catalog changes:

- add `gestaltview-blackboard-room` to `manifest.json`
- add a short human-readable description in `INDEX.md`
- add the generated `agents/AGENTS.md` entry
- place the skill in the right category, alongside the other runtime and collaboration skills

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
python -m json.tool .agents/skills/manifest.json
git grep -n "gestaltview-blackboard-room" .agents/skills/INDEX.md .agents/skills/agents/AGENTS.md .agents/skills/manifest.json
```

Expected: the JSON still parses, but the new Blackboard skill is not yet present in the catalog surfaces.

- [ ] **Step 3: Write minimal implementation**

Update the catalog entries so the Blackboard skill is promoted in the same style as the other room/runtime skills. Keep the description focused on the room model, not on Transcriptory or generic chat.

Suggested placement:

- highlighted core
- canonical runtime-oriented category
- any relevant load-order or compose-with references that help route Blackboard work through `gestaltview-vision-blueprint`, `gestaltview-digital-intelligence-collaboration`, and `gestaltview-app-runtime`

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
python -m json.tool .agents/skills/manifest.json
git grep -n "gestaltview-blackboard-room" .agents/skills/INDEX.md .agents/skills/agents/AGENTS.md .agents/skills/manifest.json
```

Expected: the new skill appears in all three catalog surfaces and the manifest remains valid JSON.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/manifest.json .agents/skills/INDEX.md .agents/skills/agents/AGENTS.md
git commit -m "feat(skills): promote Blackboard room skill in catalog"
```

### Task 3: Update repo-state docs for the new Blackboard skill

**Files:**
- Modify: `docs/CurrentState.md`
- Modify: `.agents/skills/CurrentState.md`
- Test: `docs/CurrentState.md`
- Test: `.agents/skills/CurrentState.md`

- [ ] **Step 1: Write the failing test**

Add a new top entry to `docs/CurrentState.md` describing the Blackboard skill addition, the room-model scope, and the catalog promotion. Mirror the same change in `.agents/skills/CurrentState.md` if the skills-library state log needs to reflect the new canonical entrypoint.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
sed -n '1,40p' docs/CurrentState.md
sed -n '1,40p' .agents/skills/CurrentState.md
```

Expected: neither file yet mentions the new Blackboard skill.

- [ ] **Step 3: Write minimal implementation**

Write a new top CurrentState entry that records:

- the new Blackboard skill path
- the room-system scope
- the Tribunal recap/summary integration
- the catalog promotion
- the validation performed for the skill creation pass

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
sed -n '1,40p' docs/CurrentState.md
sed -n '1,40p' .agents/skills/CurrentState.md
```

Expected: the Blackboard skill is documented at the top of the relevant state files with exact dates and paths.

- [ ] **Step 5: Commit**

```bash
git add docs/CurrentState.md .agents/skills/CurrentState.md
git commit -m "docs(skills): record Blackboard skill promotion"
```

### Task 4: Validate the new skill against the current runtime surface

**Files:**
- Test: `.agents/skills/gestaltview-blackboard-room/SKILL.md`
- Test: `client/src/pages/BlackboardRoomPage.tsx`
- Test: `client/src/lib/blackboardDiRouting.ts`
- Test: `client/src/lib/blackboardRecapArtifacts.ts`
- Test: `client/src/components/SessionRecapGenerator.tsx`
- Test: `client/src/pages/TribunalPage.tsx`
- Test: `docs/CurrentState.md`

- [ ] **Step 1: Write the failing test**

Manually review the skill against the live Blackboard and Tribunal surfaces and confirm it names the current room purpose, routing, recap logic, and handoff logic rather than older whiteboard-room assumptions.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
git diff --check
./node_modules/.bin/tsc --noEmit --pretty false
```

Expected: no TypeScript or formatting regressions are introduced by the new skill files or catalog updates.

- [ ] **Step 3: Write minimal implementation**

If any wording drift appears during review, tighten the skill language so it matches the current runtime exactly.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
git diff --check
./node_modules/.bin/tsc --noEmit --pretty false
```

Expected: the repo stays clean and the skill documentation remains aligned with the live runtime surface.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/gestaltview-blackboard-room/SKILL.md docs/superpowers/plans/2026-06-24-blackboard-skill-implementation.md
git commit -m "docs(skills): plan Blackboard room skill implementation"
```

## Self-Review Notes

- Spec coverage is complete: the plan covers the skill file, catalog promotion, current-state logging, and runtime validation.
- No placeholders remain.
- The scope is intentionally narrow enough to land as one skill, while still covering the Blackboard/Tribunal integration the user asked for.
- Transcriptory remains separate, which preserves the boundary called out in the spec.

