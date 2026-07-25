# Billy Identity And Profile Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Billy, embodiment profiles, and user identity into a governed runtime pipeline where memories and internal dialogue are self-writable, but profile, constitution, and identity changes route through approval.

**Architecture:** Keep the current runtime surfaces, but split them into two explicit lanes. The first lane is self-writable memory and internal dialogue for Billy and embodiment profiles. The second lane is approval-gated mutation for profile text, constitutions, and user identity. A small `.env.codex` bootstrap helper makes direct Supabase access deterministic when MCP is flaky, and the derived portrait path stays read-only while surfacing drift as proposal metadata instead of silently mutating canonical identity rows.

**Tech Stack:** Bash, TypeScript, React 19, Vitest, Vercel API routes, Supabase REST, existing GestaltView shell wrappers.

---

### Task 1: Add a direct Supabase bootstrap helper and wire `.env.codex` into the repo-facing scripts

**Files:**
- Create: `scripts/codex-env.sh`
- Modify: `scripts/gv.sh`
- Modify: `scripts/test-db-schema.sh`
- Modify: `package.json`
- Modify: `scripts/README.md`

- [ ] **Step 1: Write the failing test**

Smoke-test the current state before the helper exists or before it loads `.env.codex`:

```bash
bash scripts/codex-env.sh bash -lc 'printf "%s\n" "${SUPABASE_URL:-missing}"'
```

Expected: `missing` or an empty value, because the helper does not yet source `.env.codex`.

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
bash -n scripts/codex-env.sh
bash scripts/codex-env.sh bash -lc 'printf "%s\n" "${SUPABASE_URL:-missing}"'
```

Expected: the shell helper is absent or still inert, so the bootstrap path does not surface the linked Supabase URL yet.

- [ ] **Step 3: Write the minimal implementation**

Create a small wrapper that sources `.env` and `.env.codex`, then execs the requested command:

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

load_env_file "$REPO_ROOT/.env"
load_env_file "$REPO_ROOT/.env.codex"
load_env_file "$REPO_ROOT/client/.env"

if [[ $# -eq 0 ]]; then
  echo "usage: bash scripts/codex-env.sh <command> [args...]" >&2
  exit 1
fi

exec "$@"
```

Then teach the repo-facing scripts to load `.env.codex` automatically before they talk to Supabase:

```bash
# scripts/gv.sh
load_env_file "$SCRIPT_DIR/.env"
load_env_file "$SCRIPT_DIR/.env.codex"
load_env_file "$SCRIPT_DIR/client/.env"
```

```bash
# scripts/test-db-schema.sh
if [[ -f "$REPO_ROOT/.env.codex" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$REPO_ROOT/.env.codex"
  set +a
fi
```

Add a convenience script so the helper is easy to remember:

```json
{
  "scripts": {
    "codex:env": "bash scripts/codex-env.sh"
  }
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run:

```bash
bash -n scripts/codex-env.sh
bash scripts/codex-env.sh bash -lc 'printf "%s\n" "${SUPABASE_URL:-missing}"'
```

Expected: the linked Supabase URL from `.env.codex` prints successfully.

- [ ] **Step 5: Commit**

```bash
git add scripts/codex-env.sh scripts/gv.sh scripts/test-db-schema.sh package.json scripts/README.md
git commit -m "feat: add codex env bootstrap helper"
```

### Task 2: Introduce a shared identity policy module for memory versus approval-gated writes

**Files:**
- Create: `shared/identityPolicy.ts`
- Modify: `api/_lib/billyMemoryPipeline.ts`
- Modify: `api/_lib/profilePortraitPersistence.ts`
- Test: `api/__tests__/identity-policy.test.ts`

- [ ] **Step 1: Write the failing test**

Write a small policy test that proves the lane split is explicit:

```ts
import { describe, expect, it } from "vitest";
import { decideIdentityWrite } from "../../shared/identityPolicy";

describe("decideIdentityWrite", () => {
  it("allows memory and internal-dialogue writes without approval", () => {
    expect(decideIdentityWrite({ subject: "billy", kind: "memory" })).toEqual({
      action: "allow",
      requiresApproval: false,
      tableTargets: ["agent_memory_records", "agent_memories", "memory_entries"],
    });
  });

  it("requires approval for profile and identity writes", () => {
    expect(decideIdentityWrite({ subject: "user", kind: "identity_anchor" })).toMatchObject({
      action: "requires_approval",
      requiresApproval: true,
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
./node_modules/.bin/vitest run api/__tests__/identity-policy.test.ts -v
```

Expected: the shared policy module does not exist yet, so the test fails on import or missing exports.

- [ ] **Step 3: Write the minimal implementation**

Add a shared policy module that returns a simple decision object:

```ts
export type IdentityWriteSubject = "billy" | "embodiment_profile" | "user";
export type IdentityWriteKind =
  | "memory"
  | "internal_dialogue"
  | "profile_text"
  | "constitution_text"
  | "identity_anchor"
  | "user_identity";

export type IdentityWriteDecision = {
  action: "allow" | "allow_with_audit" | "requires_approval";
  requiresApproval: boolean;
  tableTargets: string[];
};

export function decideIdentityWrite(input: {
  subject: IdentityWriteSubject;
  kind: IdentityWriteKind;
}): IdentityWriteDecision {
  if (input.kind === "memory" || input.kind === "internal_dialogue") {
    return {
      action: "allow",
      requiresApproval: false,
      tableTargets: ["agent_memory_records", "agent_memories", "memory_entries"],
    };
  }

  return {
    action: "requires_approval",
    requiresApproval: true,
    tableTargets: [
      "identity_mutation_proposals",
      "identity_review_events",
      "identity_rollback_events",
      "identity_contradictions",
      "agent_constitutions",
      "agent_autobiographies",
      "embodiment_profiles",
    ],
  };
}
```

Keep `api/_lib/billyMemoryPipeline.ts` and `api/_lib/profilePortraitPersistence.ts` importing the policy helper so every write path uses the same lane decision.

- [ ] **Step 4: Run the test and confirm it passes**

Run:

```bash
./node_modules/.bin/vitest run api/__tests__/identity-policy.test.ts -v
```

Expected: memory writes are allowed, and identity/profile writes are marked approval-gated.

- [ ] **Step 5: Commit**

```bash
git add shared/identityPolicy.ts api/_lib/billyMemoryPipeline.ts api/_lib/profilePortraitPersistence.ts api/__tests__/identity-policy.test.ts
git commit -m "feat: add shared identity write policy"
```

### Task 3: Split Billy and embodiment-profile identity reads from self-writes

**Files:**
- Create: `api/_lib/billyIdentityContext.ts`
- Create: `api/_lib/identityMemoryWriter.ts`
- Modify: `api/_lib/billyMemoryPipeline.ts`
- Modify: `api/billy.ts`
- Test: `api/__tests__/billy-memory-session-prompt.test.ts`
- Test: `api/__tests__/identity-memory-write.test.ts`

- [ ] **Step 1: Write the failing test**

Add a write-path regression that proves Billy and embodiment profiles can write memories and internal dialogue without touching approval tables:

```ts
import { describe, expect, it, vi } from "vitest";
import { recordIdentityMemoryTurn } from "../_lib/identityMemoryWriter";

describe("recordIdentityMemoryTurn", () => {
  it("writes memory records without creating an approval proposal", async () => {
    const insertRow = vi.fn().mockResolvedValue({ error: null });

    await recordIdentityMemoryTurn({
      agentId: "agent-billy",
      userId: "user-1",
      source: "billy-internal-dialogue",
      transcript: [
        { role: "user", content: "Please keep the next step clear." },
        { role: "assistant", content: "I will keep the next step explicit." },
      ],
      insertRow,
    });

    expect(insertRow).toHaveBeenCalledWith("agent_memory_records", expect.objectContaining({
      agent_id: "agent-billy",
      memory_kind: "procedural",
    }));
    expect(insertRow).toHaveBeenCalledWith("agent_memories", expect.objectContaining({
      agent_id: "agent-billy",
    }));
    expect(insertRow).not.toHaveBeenCalledWith("identity_mutation_proposals", expect.anything());
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
./node_modules/.bin/vitest run api/__tests__/identity-memory-write.test.ts -v
```

Expected: the new writer helper does not exist yet, so the test fails on import or missing export.

- [ ] **Step 3: Write the minimal implementation**

Move the read-only prompt assembly helpers into `api/_lib/billyIdentityContext.ts` and keep `api/_lib/billyMemoryPipeline.ts` as the public orchestration entrypoint:

```ts
export async function loadBillyIdentityContext(params: {
  userId: string;
  agentId: string;
}) {
  // load embodiment profile, constitution, autobiographies, memory records,
  // founder context, and identity_subjects
}
```

Add a separate memory writer that records self-authored memories and internal dialogue as memory rows, not identity proposals, for both Billy and embodiment profiles:

```ts
export async function recordIdentityMemoryTurn(params: {
  subject: "billy" | "embodiment_profile";
  agentId: string;
  userId: string;
  source: string;
  transcript: Array<{ role: "user" | "assistant"; content: string }>;
  insertRow?: typeof insertRow;
}) {
  const decision = decideIdentityWrite({ subject: params.subject, kind: "memory" });
  if (decision.action === "requires_approval") {
    throw new Error("Identity memory writes must not require approval.");
  }

  await insertRow("agent_memory_records", {
    agent_id: params.agentId,
    memory_kind: "procedural",
    title: `${params.subject} internal dialogue`,
    summary: params.transcript.at(-1)?.content ?? "",
    source: params.source,
  });

  await insertRow("agent_memories", {
    agent_id: params.agentId,
    memory_type: "internal_dialogue",
    summary: params.transcript.at(-1)?.content ?? "",
    source: params.source,
  });
}
```

Keep `buildBillySessionSystemPrompt` stable, but make it call `loadBillyIdentityContext` instead of reimplementing the fetchers inline.

- [ ] **Step 4: Run the test and confirm it passes**

Run:

```bash
./node_modules/.bin/vitest run api/__tests__/billy-memory-session-prompt.test.ts api/__tests__/identity-memory-write.test.ts -v
```

Expected: Billy still assembles the prompt from live context tables, embodiment-profile memory writes use the same lane, and the new self-write helper persists memory without proposal writes.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/billyIdentityContext.ts api/_lib/identityMemoryWriter.ts api/_lib/billyMemoryPipeline.ts api/billy.ts api/__tests__/billy-memory-session-prompt.test.ts api/__tests__/identity-memory-write.test.ts
git commit -m "feat: split Billy identity reads from self-writes"
```

### Task 4: Route profile and user identity mutations through approval

**Files:**
- Create: `api/_lib/profileIdentityMutations.ts`
- Create: `api/profile/identity-mutations.ts`
- Modify: `api/profile/preferences.ts`
- Modify: `client/src/pages/ProfilePage.tsx`
- Modify: `api/profile/personality.ts`
- Modify: `api/_lib/profilePortrait.ts`
- Modify: `api/_lib/profilePortraitPersistence.ts`
- Modify: `shared/profilePortrait.ts`
- Test: `api/__tests__/profile-identity-mutations.test.ts`
- Test: `api/__tests__/profile-personality.test.ts`
- Test: `client/src/tests/profile-preferences.test.ts`

- [ ] **Step 1: Write the failing test**

Add a mutation test that proves identity-changing edits stage a proposal instead of writing directly to preferences storage:

```ts
import { describe, expect, it, vi } from "vitest";
import { stageIdentityMutationProposal } from "../_lib/profileIdentityMutations";

describe("stageIdentityMutationProposal", () => {
  it("creates an approval proposal for embodiment profile changes", async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: { mutation_id: "mutation-1" }, error: null });
    const supabase = {
      from: () => ({
        insert: insertMock,
        select: () => ({ single: async () => ({ data: { mutation_id: "mutation-1" }, error: null }) }),
      }),
    };

    const result = await stageIdentityMutationProposal({
      supabase: supabase as never,
      subjectId: "subject-1",
      kind: "identity_anchor",
      proposed: { embodimentProfileSlug: "billy" },
      source: "profile-page",
    });

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      mutation_type: "identity_anchor",
      status: "pending",
    }));
    expect(result.mutationId).toBe("mutation-1");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
./node_modules/.bin/vitest run api/__tests__/profile-identity-mutations.test.ts api/__tests__/profile-personality.test.ts client/src/tests/profile-preferences.test.ts -v
```

Expected: the helper and approval route do not exist yet, so the mutation test fails.

- [ ] **Step 3: Write the minimal implementation**

Split `api/profile/preferences.ts` so it only handles display-only preferences such as `displayName` and `avatarUrl`:

```ts
const preferences = normalizeDisplayPreferences((req.body as { preferences?: unknown } | undefined)?.preferences);
await supabase.from("user_preferences").upsert(
  {
    user_id: auth.id,
    display_name: preferences.displayName,
    avatar_url: preferences.avatarUrl,
  },
  { onConflict: "user_id" },
);
```

Add a new approval-gated mutation helper and route for embodiment profile, constitution, and user identity changes:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export async function stageIdentityMutationProposal(params: {
  supabase: SupabaseClient;
  subjectId: string;
  kind: "profile_text" | "constitution_text" | "identity_anchor" | "user_identity";
  proposed: Record<string, unknown>;
  source: string;
}) {
  const targetTable =
    params.kind === "user_identity"
      ? "human_identity_profiles"
      : params.kind === "constitution_text"
        ? "agent_constitutions"
        : "embodiment_profiles";
  const targetPath =
    params.kind === "user_identity"
      ? `identity_subjects/${params.subjectId}.json`
      : params.kind === "constitution_text"
        ? `agents/${params.subjectId}/constitution.json`
        : `embodiment_profiles/${params.subjectId}.embodiment.json`;

  const { data, error } = await params.supabase
    .from("identity_mutation_proposals")
    .insert({
      subject_id: params.subjectId,
      mutation_type: params.kind,
      target_table: targetTable,
      target_path: targetPath,
      proposed_state: params.proposed,
      status: "pending",
      source: params.source,
    })
    .select("mutation_id")
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to stage identity mutation proposal.");
  }

  return { mutationId: data.mutation_id };
}
```

The HTTP route should delegate to that helper, and `client/src/pages/ProfilePage.tsx` should submit identity-changing edits to the proposal endpoint instead of writing directly, while display-only fields still use the preferences endpoint.

Keep `api/profile/personality.ts` read-only, but make `api/_lib/profilePortrait.ts` and `api/_lib/profilePortraitPersistence.ts` emit a proposal hint or audit record when portrait drift crosses a meaningful threshold instead of mutating canonical identity rows directly.

If the derived portrait needs to surface the drift reason to the client, extend `shared/profilePortrait.ts` with an optional read-only hint field:

```ts
export interface ProfilePortrait {
  userId: string;
  version: number;
  portraitTitle: string;
  tagline: string;
  dimensions: ProfilePortraitDimension[];
  overallConfidence: number;
  sourceWindowStart: string;
  sourceWindowEnd: string;
  totalSourceRecords: number;
  inferenceTriggeredBy: "cadence" | "threshold" | "manual";
  inferenceRunId: string;
  proposalHint?: string | null;
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run:

```bash
./node_modules/.bin/vitest run api/__tests__/profile-identity-mutations.test.ts api/__tests__/profile-personality.test.ts client/src/tests/profile-preferences.test.ts -v
```

Expected: display preferences still save, identity-changing edits are staged as proposals, and the personality endpoint stays read-only.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/profileIdentityMutations.ts api/profile/identity-mutations.ts api/profile/preferences.ts client/src/pages/ProfilePage.tsx api/profile/personality.ts api/_lib/profilePortrait.ts api/_lib/profilePortraitPersistence.ts shared/profilePortrait.ts api/__tests__/profile-identity-mutations.test.ts api/__tests__/profile-personality.test.ts client/src/tests/profile-preferences.test.ts
git commit -m "feat: gate profile and identity mutations"
```

### Task 5: Refresh the schema-alignment docs and validate the new pipeline end to end

**Files:**
- Modify: `docs/schema-alignment-gap-map.md`
- Modify: `docs/CurrentState.md`
- Modify: `supabase/GestaltView_Schema_Alignment_Reference.md`
- Modify: `supabase/data_tables/schema_table_summary.csv`
- Test: `git diff --check`
- Test: `./node_modules/.bin/tsc --noEmit --pretty false`
- Test: `./node_modules/.bin/vitest run api/__tests__/billy-memory-session-prompt.test.ts api/__tests__/identity-policy.test.ts api/__tests__/profile-identity-mutations.test.ts api/__tests__/profile-personality.test.ts -v`

- [ ] **Step 1: Write the failing test**

Review the docs and schema-alignment reference before the final commit:

```bash
sed -n '1,220p' docs/schema-alignment-gap-map.md
sed -n '1,80p' docs/CurrentState.md
sed -n '1,120p' supabase/GestaltView_Schema_Alignment_Reference.md
```

Expected: before the implementation lands, the docs still describe the Billy identity slice as a recommendation instead of a verified runtime pipeline.

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
git diff --check
./node_modules/.bin/tsc --noEmit --pretty false
```

Expected: if any code or docs drift was introduced earlier in the slice, this checkpoint catches formatting or type regressions before the closeout.

- [ ] **Step 3: Write the minimal implementation**

Update the gap map and current-state note so they describe the verified runtime surface:

- Billy prompt assembly is now a live read path with a separate self-write lane.
- `agent_memory_records`, `agent_memories`, and `memory_entries` are self-writable.
- `agent_constitutions`, `agent_autobiographies`, `embodiment_profiles`, and user identity mutations are approval-gated.
- `identity_mutation_proposals`, `identity_review_events`, `identity_rollback_events`, and `identity_contradictions` are now active governance surfaces, not decorative schema.

Mirror those changes in the schema alignment reference and the table summary CSV so the generated schema docs no longer treat the wired tables as dormant decoration.

- [ ] **Step 4: Run the test and confirm it passes**

Run:

```bash
git diff --check
./node_modules/.bin/tsc --noEmit --pretty false
./node_modules/.bin/vitest run api/__tests__/billy-memory-session-prompt.test.ts api/__tests__/identity-policy.test.ts api/__tests__/profile-identity-mutations.test.ts api/__tests__/profile-personality.test.ts -v
```

Expected: formatting is clean, TypeScript is clean, and the pipeline tests still pass after the documentation refresh.

- [ ] **Step 5: Commit**

```bash
git add docs/schema-alignment-gap-map.md docs/CurrentState.md supabase/GestaltView_Schema_Alignment_Reference.md supabase/data_tables/schema_table_summary.csv
git commit -m "docs: record Billy identity and profile pipeline alignment"
```
