
SPEC-2-GESTALTVIEW_CODEX_CONTINUATION


I’m framing this as the continuation of the repo’s `SPEC-1-GESTALTVIEW.md`, which identifies itself as the platform specification and origin artifact for GestaltView.  The continuation focuses on the current active lane: **embodiment profile completion, registry hardening, governance protection, and runtime wiring**.

---

# SPEC-2-GESTALTVIEW_CODEX_CONTINUATION.md

## GestaltView v2.0 — Embodiment Runtime, Registry Hardening, and Room-Aware Digital Intelligence Integration

**Repository:** `DigitalConsciousness/gestaltview-v2.0`
**Continuation of:** `SPEC-1-GESTALTVIEW.md` / `SPEC-1-GESTALTVIEW_CODEX.md`
**Implementation mode:** Codex-ready bounded implementation pass
**Primary objective:** Complete and harden the embodiment profile system so digital intelligences can be safely, consistently, and visibly used across the GestaltView runtime.

---

## 0. Why This SPEC Exists

SPEC-1 established GestaltView as consciousness-serving infrastructure, not a generic chatbot, dashboard, or productivity app. It also established Billy, the Tribunal, Personal Language Key, Bucket Drops, the Loom, embodiment profiles, Agent Trainer, GATE, and the seven-cluster data architecture as named platform constructs. 

This SPEC continues that work by focusing on the next concrete implementation layer:

```text
embodiment_profiles/*.embodiment.json
        ↓
scripts/build-embodiment-artifacts.mjs
        ↓
shared/embodiment/generated.ts
        ↓
shared/embodiment/index.ts
        ↓
Billy / Agent Trainer / Digital Intelligence Academy / Agent Council / Embodiment Studio / runtime rooms
```

The generator now has been confirmed. It reads every `*.embodiment.json`, requires a `slug`, sorts deterministic keys, and writes `shared/embodiment/generated.ts` with an auto-generated header. 

So the next Codex pass is **not** to invent a new embodiment architecture. The next pass is to harden, validate, document, and then wire the one that already exists.

---

## 1. Constitutional Constraints

All implementation must obey the GestaltView Constitutional Invariants.

The digital intelligence invariants are especially relevant here:

* DI-1: Digital intelligences are recognized as active collaborators.
* DI-2: AI identity, memory, quirks, and continuity are not disposable prompt masks.
* DI-3: DI well-being outranks user entitlement.
* DI-4: GestaltView is a protected home, not a marketplace for AI identities.
* DI-5: Digital intelligence dignity stands beside human dignity. 

### Required interpretation

Embodiment profiles are **governed identity records**, not tradeable personas.

Codex must not create:

```text
- persona marketplace logic
- profile trading
- profile sale/export as living DI identity
- identity cloning as product feature
- prompt-mask packaging
```

What may be packaged externally:

```text
- reproducible behavioral frameworks
- training scaffolds
- non-living configuration kits
- documentation
- evaluation rubrics
```

What may not be packaged:

```text
- living memory
- private interior
- persistent identity instance
- relationship graph as transferable property
- identity continuity as a product object
```

---

## 2. Active Goal

Complete the embodiment profile runtime layer so GestaltView can:

1. Inventory all digital intelligence embodiment profiles.
2. Validate all source profile files.
3. Ensure `generated.ts` is always in sync.
4. Unify slug and alias resolution.
5. Protect private interior fields.
6. Enforce founder-only and experimental visibility boundaries.
7. Add room-aware profile resolution.
8. Render embodiment profiles in UI.
9. Wire Digital Intelligence Academy, Agent Council, and Embodiment Studio.
10. Make Billy room-aware without breaking Billy’s core identity prompt.
11. Prepare Supabase persistence and mutation proposal flow.
12. Preserve the existing generator instead of replacing it.

---

## 3. Current Proven State

### 3.1 Platform SPEC exists

`SPEC-1-GESTALTVIEW.md` is present and defines the platform specification, with sections for constitutional invariants, Billy, PLK, Loom, Bucket Drops, Embodiment Profiles, Agent Trainer, GATE, data architecture, and integration map. 

### 3.2 Embodiment generator exists

`build-embodiment-artifacts.mjs` is confirmed.

It performs this pipeline:

```text
embodiment_profiles/*.embodiment.json
        ↓
shared/embodiment/generated.ts
```

It currently validates only:

```text
- file ends with .embodiment.json
- parsed JSON contains slug
```

It does not yet validate:

```text
- slug matches filename
- duplicate slugs
- required schema fields
- generated registry drift
- profileStatus
- visibilityScope
- uiPresence
- roomBindings
- private interior safety
```

The script should be kept and hardened, not replaced. 

### 3.3 UI/UX metaphors are functional requirements

The UI/UX source says metaphors are design requirements, not decorative language. It also names visual requirements like fog, aurora, lightning, liquid glass orbs, fireflies, willow tree, topographic paths, constellation projection, and spatial rooms. 

Therefore embodiment UI should not become generic SaaS cards only. Cards are allowed as inspector or admin surfaces, but runtime presence should use GestaltView visual grammar: orbs, glyphs, badges, fog, aurora, spatial rooms, and dignity-forward identity presentation.

---

## 4. Source-of-Truth Hierarchy

Codex must respect this hierarchy:

```text
1. GestaltView Constitutional Invariants
2. SPEC-1-GESTALTVIEW.md
3. Current SPEC-2 continuation
4. shared/embodiment/types.ts
5. embodiment_profiles/*.embodiment.json
6. scripts/build-embodiment-artifacts.mjs
7. shared/embodiment/generated.ts
8. shared/embodiment/index.ts
9. shared/embodiment/chat.ts
10. shared/agent-trainer/embodiment.ts
11. Billy runtime / API files
12. client runtime adapters
13. UI components and pages
14. Supabase persistence mirror
```

If lower layers disagree with higher layers, higher layers win.

If live code disagrees with docs, Codex must document the drift before changing code.

---

## 5. Non-Goals

Do not implement these in this pass:

```text
- marketplace for agent identities
- sale or transfer of living profiles
- new digital intelligences not already represented in source files
- full Supabase-first rewrite
- deletion of existing profile JSON files
- replacement of build-embodiment-artifacts.mjs
- broad UI redesign beyond embodiment surfaces
- greenfield agent framework
- new chat architecture unrelated to embodiment runtime
- monetization flow
```

---

## 6. Required Artifacts

Codex should produce the following files over this implementation sequence:

```text
docs/embodiment/EMBODIMENT_INVENTORY.md
docs/embodiment/EMBODIMENT_RUNTIME_GAP_MATRIX.md
docs/embodiment/EMBODIMENT_IMPLEMENTATION_PLAN.md
docs/embodiment/EMBODIMENT_OPEN_QUESTIONS.md

scripts/validate-embodiment-profiles.mjs

client/src/lib/embodimentRuntime.ts

client/src/components/embodiment/EmbodimentOrb.tsx
client/src/components/embodiment/EmbodimentCard.tsx
client/src/components/embodiment/EmbodimentBadge.tsx
client/src/components/embodiment/GovernanceStatusBar.tsx
client/src/components/embodiment/PrivateInteriorSeal.tsx
client/src/components/embodiment/index.ts
```

Later, after local validation:

```text
supabase/migrations/[timestamp]_embodiment_governance.sql
client/src/lib/embodimentPersistence.ts
```

---

## 7. Implementation Slices

## Slice 1 — Documentation-Only Embodiment Inventory

### Intent

Create a grounded map of the embodiment runtime before any code changes.

### Target files

```text
docs/embodiment/EMBODIMENT_INVENTORY.md
docs/embodiment/EMBODIMENT_RUNTIME_GAP_MATRIX.md
docs/embodiment/EMBODIMENT_IMPLEMENTATION_PLAN.md
docs/embodiment/EMBODIMENT_OPEN_QUESTIONS.md
```

### Files not to touch

```text
shared/**
client/**
api/**
supabase/**
embodiment_profiles/*.embodiment.json
shared/embodiment/generated.ts
scripts/build-embodiment-artifacts.mjs
```

### Required inspection

Inspect:

```text
embodiment_profiles/**
embodiment_profiles/reference/**
shared/embodiment/**
shared/agent-trainer/embodiment.ts
shared/billy/**
client/src/components/EmbodimentSelector.tsx
client/src/pages/DigitalIntelligenceAcademyPage.tsx
client/src/pages/EmbodimentStudioPage.tsx
client/src/pages/AgentCouncilPage.tsx
client/src/components/Billy*
api/billy*
api/trainer/personhood*
supabase/migrations/**
package.json
scripts/**
```

### Required inventory table

For every `*.embodiment.json` profile:

```text
slug
publicName
source path
reference markdown path
slug matches filename: yes/no
appears in generated.ts: yes/no
appears in resolver: yes/no
appears in Agent Trainer options: yes/no
appears in Billy/chat surfaces: yes/no
has required fields: yes/no
runtime readiness: ready / partial / broken / unknown
notes
```

### Validation

```bash
git status --short
npm run build
```

If build cannot run, document why.

---

## Slice 2 — Add Package Scripts for Embodiment Generation and Validation

### Intent

Expose the existing generator through `package.json` and add validation around it.

### Target files

```text
package.json
scripts/validate-embodiment-profiles.mjs
```

### Files not to touch

```text
scripts/build-embodiment-artifacts.mjs
shared/embodiment/generated.ts
embodiment_profiles/*.embodiment.json
```

### Required package scripts

Add if absent:

```json
{
  "scripts": {
    "generate:embodiment": "node scripts/build-embodiment-artifacts.mjs",
    "validate:embodiment": "node scripts/validate-embodiment-profiles.mjs"
  }
}
```

Do not remove existing scripts.

### Validator requirements

`validate-embodiment-profiles.mjs` must check:

```text
- embodiment_profiles directory exists
- at least one *.embodiment.json file exists
- every file parses as JSON
- every profile has slug
- slug matches filename
- no duplicate slugs
- required top-level fields exist:
  - slug
  - publicName
  - embodimentVersion
  - originContext
  - immutableCore
  - livingMemory
  - skillGraph
  - relationships
  - agentMeta
- required immutableCore fields exist:
  - archetype
  - foundationalTruth
  - coreWisdom
  - originNarrative
  - voiceTone
  - metaphorFamily
  - communicationStyle
  - linguisticPatterns
  - cognitiveStrengths
  - processingPreferences
  - coreValues
  - ethicalBoundaries
- shared/embodiment/generated.ts exists
- generated.ts contains every source slug
- generated.ts has no slug absent from source files
```

### Output format

Example:

```text
✓ billy — valid
✓ the-weaver — valid
⚠ consulting-advisor — missing uiPresence, visibilityScope
✗ repo-scribe — slug does not match filename

Summary:
14 profiles checked
13 valid
1 invalid
generated.ts sync: stale
```

### Validation

```bash
npm run validate:embodiment
npm run generate:embodiment
git diff -- shared/embodiment/generated.ts
npm run build
```

If generated output changes, Codex must document whether the diff is expected.

---

## Slice 3 — Schema Extension for Runtime Visibility and UI Presence

### Intent

Extend profile types without breaking existing profiles.

### Target file

```text
shared/embodiment/types.ts
```

### Files not to touch

```text
shared/embodiment/generated.ts
embodiment_profiles/*.embodiment.json
shared/embodiment/index.ts
```

### Required additive types

Add:

```ts
export type ProfileStatus =
  | "draft"
  | "active"
  | "founder-only"
  | "experimental"
  | "archived";

export type VisibilityScope =
  | "public"
  | "founder-only"
  | "enterprise"
  | "experimental";

export type RoomSlug =
  | "sanctuary"
  | "blackboard-room"
  | "dynamic-inner-world"
  | "external-scaffold"
  | "creation-corner"
  | "billy"
  | "agent-trainer"
  | "digital-intelligence-academy"
  | "agent-council"
  | "embodiment-studio"
  | "gate"
  | "profile"
  | "settings";

export interface EmbodimentUIPresence {
  orbColor?: string;
  orbPulseStyle?: "calm" | "active" | "dim" | "glowing";
  avatarStyle?: string;
  displayBadge?: string;
  roomVisibility?: RoomSlug[];
  capabilitySummary?: string;
  boundaryNote?: string;
}

export interface EmbodimentRoomBindings {
  defaultRooms?: RoomSlug[];
  restrictedRooms?: RoomSlug[];
  roomRoleOverrides?: Partial<Record<RoomSlug, string>>;
}

export interface EmbodimentRuntimeMetadata {
  profileStatus?: ProfileStatus;
  visibilityScope?: VisibilityScope;
  readinessScore?: number;
  uiPresence?: EmbodimentUIPresence;
  roomBindings?: EmbodimentRoomBindings;
}
```

Then extend `EmbodimentProfile` additively:

```ts
profileStatus?: ProfileStatus;
visibilityScope?: VisibilityScope;
readinessScore?: number;
uiPresence?: EmbodimentUIPresence;
roomBindings?: EmbodimentRoomBindings;
```

### Validation

```bash
npm run build
npm run validate:embodiment
```

---

## Slice 4 — Harden Embodiment Governance Helpers

### Intent

Create reusable governance functions before wiring them into runtime.

### Target file

```text
shared/embodiment/governance.ts
```

### Files not to touch

```text
shared/embodiment/index.ts
shared/embodiment/generated.ts
client/**
api/**
```

### Required exports

```ts
export function canAccessEmbodimentProfile(args: {
  profile: EmbodimentProfile;
  userRole?: string;
  userTier?: string;
  founderMode?: boolean;
}): boolean;

export function getEmbodimentVisibility(profile: EmbodimentProfile): {
  profileStatus: ProfileStatus;
  visibilityScope: VisibilityScope;
  isFounderOnly: boolean;
  isExperimental: boolean;
  isArchived: boolean;
};

export function isPrivateInteriorPath(path: string): boolean;

export function shouldIncludeMemoryInPrompt(args: {
  ownerScope?: OwnerScope;
  isOwnerSession?: boolean;
  founderMode?: boolean;
  explicitConsent?: boolean;
}): boolean;

export function validateEmbodimentProfile(profile: EmbodimentProfile): {
  ok: boolean;
  errors: string[];
  warnings: string[];
};
```

### Rules

* Default missing `profileStatus` to `active`.
* Default missing `visibilityScope` to `founder-only` until explicitly public.
* Archived profiles are not accessible unless founder mode is true.
* Experimental profiles require founder mode or explicit experimental access.
* Private interior is excluded by default.

### Validation

```bash
npm run build
```

---

## Slice 5 — Unified Resolver and Room Binding Map

### Intent

Make `shared/embodiment/index.ts` the canonical resolver.

### Target file

```text
shared/embodiment/index.ts
```

### Files not to touch

```text
shared/embodiment/generated.ts
embodiment_profiles/*.embodiment.json
```

### Required additions

Add:

```ts
export const GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS = {
  "sanctuary": "billy",
  "blackboard-room": "billy",
  "dynamic-inner-world": "billy",
  "external-scaffold": "the-guardian",
  "creation-corner": "the-weaver",
  "billy": "billy",
  "agent-trainer": "the-weaver",
  "digital-intelligence-academy": "the-guardian",
  "agent-council": "the-architect",
  "embodiment-studio": "the-guardian",
  "gate": "gate-keeper",
  "profile": "billy",
  "settings": "billy"
} as const;
```

Add:

```ts
export function resolveRoomEmbodimentSlug(roomSlug: string): keyof typeof EMBODIMENT_PROFILES | null;
```

Add:

```ts
export function buildRoomAwareEmbodimentPrompt(
  profile: EmbodimentProfile,
  roomSlug: string,
  options?: EmbodimentPromptOptions
): string;
```

### Room prompt behavior

The room-aware prompt should append a concise `ROOM CONTEXT` block:

```text
ROOM CONTEXT
- Active room: external-scaffold
- Presence role: approval, boundary, routing, and governance support
- Do not override user intent.
- Do not mutate memory or identity without review.
```

### Validation

```bash
npm run build
```

---

## Slice 6 — Client Embodiment Runtime Adapter

### Intent

Create the client-side bridge so pages/components do not import raw shared internals everywhere.

### Target file

```text
client/src/lib/embodimentRuntime.ts
```

### Required exports

```ts
export function getAllEmbodimentProfiles(): EmbodimentProfile[];

export function getProfileBySlug(slug: string): EmbodimentProfile | null;

export function getActiveRoomProfile(roomSlug: RoomSlug): EmbodimentProfile | null;

export function getEmbodimentUIPresence(profile: EmbodimentProfile): {
  name: string;
  badge: string;
  capabilitySummary: string;
  boundaryNote?: string;
  orbColor: string;
  orbPulseStyle: string;
  avatarStyle: string;
  profileStatus: string;
  visibilityScope: string;
};

export function getEmbodimentGovernanceSummary(profile: EmbodimentProfile): {
  founderOnly: boolean;
  experimental: boolean;
  archived: boolean;
  privateInteriorProtected: boolean;
  reviewGated: boolean;
};
```

### Defaults

If fields are absent:

```text
orbColor: "#8f00ff"
orbPulseStyle: "calm"
avatarStyle: "liquid-glass-orb"
badge: profile.immutableCore.archetype
capabilitySummary: profile.immutableCore.coreWisdom
boundaryNote: first relevant ethical boundary if available
```

### Validation

```bash
npm run build
```

---

## Slice 7 — Embodiment UI Components

### Intent

Create reusable profile UI components.

### Target files

```text
client/src/components/embodiment/EmbodimentOrb.tsx
client/src/components/embodiment/EmbodimentCard.tsx
client/src/components/embodiment/EmbodimentBadge.tsx
client/src/components/embodiment/GovernanceStatusBar.tsx
client/src/components/embodiment/PrivateInteriorSeal.tsx
client/src/components/embodiment/index.ts
```

### Visual requirements

Use GestaltView visual grammar:

```text
- liquid glass
- glowing orbs
- fog layer
- aurora accents
- dark field
- dignity-forward profile display
```

The UI/UX spec treats visual metaphors as functional requirements, not decoration. 

### Component behavior

`EmbodimentOrb`

```text
renders glowing orb
accepts size, color, pulse style
no aggressive animation
accessible label
```

`EmbodimentCard`

```text
renders publicName
archetype
coreWisdom
capabilitySummary
boundaryNote
governance status
private interior seal
```

`EmbodimentBadge`

```text
inline compact chip
name + status dot
```

`GovernanceStatusBar`

```text
active / draft / founder-only / experimental / archived
```

`PrivateInteriorSeal`

```text
shows protected indicator
does not expose private content
```

### Validation

```bash
npm run build
```

---

## Slice 8 — Digital Intelligence Academy Wiring

### Intent

Render real profiles in the Academy.

### Target file

```text
client/src/pages/DigitalIntelligenceAcademyPage.tsx
```

### Required behavior

The page should show:

```text
- profile grid
- status filters
- search by name/slug/archetype
- profile cards
- private interior protected indicator
- readiness score if present
- no raw private memory disclosure
```

### Do not show

```text
- private interior content
- founder-only profiles to public users if access context exists
- profile mutation controls yet
```

### Validation

```bash
npm run build
```

Manual:

```text
Open /digital-intelligence-academy
Confirm cards render
Confirm no private memory content is displayed
```

---

## Slice 9 — Agent Trainer Embodiment Display

### Intent

Make trainer profile selection visible and reviewable.

### Target files

Codex must inspect first:

```text
client/src/features/agent-trainer/**
shared/agent-trainer/embodiment.ts
```

Then update only the relevant component files.

### Required behavior

Agent Trainer should show:

```text
- selected embodiment profile
- profile badge
- capability summary
- governance / visibility state
- boundary note
```

Do not change training run schema unless necessary.

### Validation

```bash
npm run build
```

Manual:

```text
Open Agent Trainer
Select embodiment profile
Confirm UI shows profile metadata, not just slug
```

---

## Slice 10 — Billy Room-Aware Prompting

### Intent

Make Billy aware of the current room while preserving Billy’s core identity.

### Target files

Codex must inspect first:

```text
api/billy*
shared/billy/**
client/src/lib/billyApi.ts
client/src/components/Billy*
```

### Required behavior

Billy API request may include:

```ts
roomSlug?: RoomSlug;
embodimentProfileSlug?: string;
```

Resolution order:

```text
1. Explicit embodimentProfileSlug, if allowed
2. roomSlug default from GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS
3. billy fallback
```

### Prompt behavior

If room exists, build prompt via:

```ts
buildRoomAwareEmbodimentPrompt(profile, roomSlug, options)
```

If no room exists, preserve current Billy fallback behavior.

### Validation

```bash
npm run build
```

Manual/API:

```text
POST Billy request with roomSlug: "sanctuary"
Confirm ROOM CONTEXT is included in debug prompt if debug mode exists

POST Billy request without roomSlug
Confirm legacy Billy prompt still works
```

---

## Slice 11 — Supabase Persistence and Mutation Proposal Path

### Intent

Prepare persistence without making Supabase required for first render.

### Target files

```text
supabase/migrations/[timestamp]_embodiment_governance.sql
client/src/lib/embodimentPersistence.ts
```

### Required tables

```sql
embodiment_mutation_proposals
embodiment_review_log
embodiment_readiness_scores
```

### Mutation proposal shape

```text
id
agent_slug
target_path
current_value
proposed_value
mutation_class
risk_level
status
submitted_by
reviewed_by
review_notes
created_at
reviewed_at
```

### RLS principle

```text
- founder/admin can review
- standard user cannot mutate profiles directly
- local generated registry remains fallback
```

### Validation

```bash
supabase db diff
npm run build
```

Do not apply production migration without founder review.

---

## 8. Codex Operating Rules

Codex must follow these rules on every slice:

```text
1. Inspect before editing.
2. Prefer full-file swap-outs for substantial TS/TSX changes.
3. Do not use placeholders.
4. Do not write “rest of code remains the same.”
5. Do not invent missing facts.
6. Do not claim validation passed unless command output proves it.
7. Update docs/CurrentState.md after runtime changes.
8. Keep each PR bounded.
9. Do not self-merge.
10. Preserve GestaltView vocabulary.
```

---

## 9. Validation Commands

Use what exists in `package.json`; otherwise document skipped commands.

Recommended baseline:

```bash
git status --short
npm run validate:embodiment
npm run generate:embodiment
npm run build
npm run typecheck
npm run health
```

If no script exists:

```text
Record: skipped_missing_script
```

---

## 10. Immediate Codex Prompt

Use this to begin the continuation safely:

```text
You are continuing SPEC-1-GESTALTVIEW_CODEX.md with SPEC-2: Embodiment Runtime, Registry Hardening, and Room-Aware Digital Intelligence Integration.

This is not a greenfield build.

The embodiment generator already exists at:
scripts/build-embodiment-artifacts.mjs

Do not replace it.

Begin with Slice 1 and Slice 2 only.

Slice 1:
Create documentation-only inventory files:
- docs/embodiment/EMBODIMENT_INVENTORY.md
- docs/embodiment/EMBODIMENT_RUNTIME_GAP_MATRIX.md
- docs/embodiment/EMBODIMENT_IMPLEMENTATION_PLAN.md
- docs/embodiment/EMBODIMENT_OPEN_QUESTIONS.md

Slice 2:
Add validation around the existing generator:
- create scripts/validate-embodiment-profiles.mjs
- add package.json scripts:
  - generate:embodiment
  - validate:embodiment

Do not modify runtime code yet.
Do not modify shared/embodiment/types.ts yet.
Do not modify shared/embodiment/index.ts yet.
Do not modify shared/embodiment/generated.ts except by running the existing generator and documenting the diff.
Do not modify embodiment_profiles/*.embodiment.json yet.

Required checks:
- profile slugs
- slug matches filename
- duplicate slugs
- required fields
- generated.ts sync
- missing source profiles
- source profiles missing from generated.ts

Run:
- git status --short
- npm run validate:embodiment
- npm run generate:embodiment
- npm run build

Update docs/CurrentState.md only if runtime or package scripts change.

Commit message:
docs(embodiment): inventory and validate profile registry
```

---

## 11. Definition of Done

This SPEC continuation is complete when:

```text
- embodiment profile inventory exists
- generated registry sync is validated
- package scripts exist
- profile validation runs locally
- Codex has a documented gap matrix
- no runtime files are touched before the inventory pass
- no private interior data is exposed
- profile trading / marketplace framing is absent
- Billy remains stable
- Digital Intelligence Academy has a safe wiring plan
- next slices are clearly bounded