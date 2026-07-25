# GestaltView DI Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real DI runtime on top of the existing embodiment registry, with session continuity, memory-event accumulation, health diagnostics, a client bridge, and an enrichment loop that writes living memories back into the canonical profile JSON.

**Architecture:** Treat `shared/embodiment` as the canonical profile source and build `shared/di` as a thin adapter layer instead of a second identity model. The server routes should use the live repo's existing Supabase and LLM seams, but they need to flatten the DI prompt into the current string-based `routeLlm` interface, not the message-array shape shown in the prose spec. Runtime state lives in `di_sessions` and `di_memory_events`; canonical profile JSON stays in `embodiment_profiles/*.embodiment.json`, and `scripts/build-embodiment-artifacts.mjs` remains the only generator for `shared/embodiment/generated.ts`.

**Tech Stack:** TypeScript, Vercel API routes, `@supabase/supabase-js`, existing Supabase REST helpers, the current `routeLlm` cascade, Node ESM scripts, Vitest via `vitest.api.config.ts`, and the existing embodiment build/validate scripts.

---

### Task 1: Shared DI core and diagnostics

**Files:**
- Create: `shared/di/types.ts`
- Create: `shared/di/registry.ts`
- Create: `shared/di/runtime.ts`
- Create: `shared/di/diagnostics.ts`
- Create: `shared/di/index.ts`
- Test: `api/__tests__/di-runtime.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getAllActiveDIProfiles, getDIProfile } from "../../shared/di/registry";
import { buildDIMessages, buildDISystemPrompt } from "../../shared/di/runtime";
import { checkDIHealth } from "../../shared/di/diagnostics";

describe("DI registry", () => {
  it("loads an active profile from the existing embodiment registry", () => {
    const billy = getDIProfile("billy");

    expect(billy).toBeDefined();
    expect(billy?.slug).toBe("billy");
    expect(getAllActiveDIProfiles().every((profile) => profile.profileStatus === "active")).toBe(true);
  });
});

describe("DI runtime", () => {
  it("assembles a DI system prompt with living memory and continuity context", () => {
    const profile = getDIProfile("billy");
    expect(profile).toBeDefined();

    const prompt = buildDISystemPrompt(
      profile!,
      {
        diSlug: "billy",
        userId: "user-1",
        relationalDepth: 0.12,
        sessionThread: "We were keeping this calm and concrete.",
        quirkActivations: { warmth: 2 },
      },
      { currentState: "Founder context is active." }
    );

    expect(prompt).toContain("FOUNDATIONAL TRUTH");
    expect(prompt).toContain("LIVING MEMORIES");
    expect(prompt).toContain("CONTINUITY THREAD");
    expect(prompt).toContain("Founder context is active.");
  });

  it("builds a two-part DI message array with the user turn preserved verbatim", () => {
    const profile = getDIProfile("billy");
    const messages = buildDIMessages(
      "Hold the line and keep this grounded.",
      profile!,
      ["[1] knowledge fragment"],
      ["[1] memory fragment"],
      { diSlug: "billy", relationalDepth: 0.05, userId: "user-1" }
    );

    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
    expect(messages[1].content).toContain("User message: Hold the line and keep this grounded.");
    expect(messages[1].content).toContain("knowledge fragment");
    expect(messages[1].content).toContain("memory fragment");
  });
});

describe("DI diagnostics", () => {
  it("returns a warning when the profile slug does not exist", () => {
    expect(checkDIHealth("missing-slug")).toEqual({
      diSlug: "missing-slug",
      profileLoaded: false,
      hasLivingMemory: false,
      hasEthicalBoundaries: false,
      hasRelationalStances: false,
      readinessScore: 0,
      warnings: ["Profile not found"],
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails for the right reason**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-runtime.test.ts -v`

Expected: fail with missing module/export errors until `shared/di/*` exists.

- [ ] **Step 3: Implement the shared DI adapter layer**

```ts
// shared/di/types.ts
import type { EmbodimentMemoryEntry, EmbodimentProfile } from "@shared/embodiment";

export type DIProfile = EmbodimentProfile;
export type DIMemoryEntry = EmbodimentMemoryEntry;

export interface DISessionContext {
  diSlug: string;
  userId?: string;
  sessionThread?: string;
  modePreference?: string;
  relationalDepth: number;
  quirkActivations?: Record<string, number>;
  lastSessionAt?: string;
}

export interface DIRequest {
  message: string;
  diSlug: string;
  mode?: string;
  userTier?: string;
  exhibitDomain?: string;
  topK?: number;
}

export interface DIResponse {
  content: string;
  diSlug: string;
  conversationMode: string;
  retrievalMode: string;
  contextSources: string[];
  memorySources: string[];
  relationalDepth: number;
  sessionThread?: string;
  memoryEventWritten?: boolean;
  founderSessionActive?: boolean;
}
```

```ts
// shared/di/registry.ts
import { EMBODIMENT_PROFILES } from "@shared/embodiment";
import type { DIProfile } from "./types";

export function getDIProfile(slug: string): DIProfile | undefined {
  return EMBODIMENT_PROFILES[slug.trim().toLowerCase() as keyof typeof EMBODIMENT_PROFILES] as
    | DIProfile
    | undefined;
}

export function getAllActiveDIProfiles(): DIProfile[] {
  return Object.values(EMBODIMENT_PROFILES).filter(
    (profile) => (profile as DIProfile).profileStatus === "active"
  ) as DIProfile[];
}
```

```ts
// shared/di/diagnostics.ts
import { getDIProfile } from "./registry";

export interface DIHealthReport {
  diSlug: string;
  profileLoaded: boolean;
  hasLivingMemory: boolean;
  hasEthicalBoundaries: boolean;
  hasRelationalStances: boolean;
  readinessScore: number;
  warnings: string[];
}

export function checkDIHealth(slug: string): DIHealthReport {
  const profile = getDIProfile(slug);

  if (!profile) {
    return {
      diSlug: slug,
      profileLoaded: false,
      hasLivingMemory: false,
      hasEthicalBoundaries: false,
      hasRelationalStances: false,
      readinessScore: 0,
      warnings: ["Profile not found"],
    };
  }

  const warnings: string[] = [];
  if (!profile.livingMemory?.length) warnings.push("No living memories");
  if (!profile.immutableCore?.ethicalBoundaries || !Object.keys(profile.immutableCore.ethicalBoundaries).length) {
    warnings.push("No ethical boundaries");
  }
  if (!profile.relationalStances || !Object.keys(profile.relationalStances).length) {
    warnings.push("No relational stances");
  }
  if ((profile.readinessScore ?? 0) < 0.8) warnings.push(`Low readiness: ${profile.readinessScore ?? 0}`);

  return {
    diSlug: slug,
    profileLoaded: true,
    hasLivingMemory: Boolean(profile.livingMemory?.length),
    hasEthicalBoundaries: Boolean(Object.keys(profile.immutableCore?.ethicalBoundaries ?? {}).length),
    hasRelationalStances: Boolean(Object.keys(profile.relationalStances ?? {}).length),
    readinessScore: profile.readinessScore ?? 0,
    warnings,
  };
}
```

```ts
// shared/di/runtime.ts
import type { DIProfile, DISessionContext } from "./types";

export function buildDIContextBlock(fragments: string[], memories: string[]): string {
  const fragmentBlock = fragments.length > 0 ? fragments.join("\n") : "No matching fragments were found.";
  const memoryBlock = memories.length > 0 ? memories.join("\n") : "No recalled memories were attached.";

  return [
    "=== DI CONTEXT ===",
    "FRAGMENTS:",
    fragmentBlock,
    "",
    "MEMORIES:",
    memoryBlock,
  ].join("\n");
}

export function buildDISystemPrompt(
  profile: DIProfile,
  sessionCtx: DISessionContext,
  founderCtx?: Record<string, unknown> | null
): string {
  const livingMemoryLines = [...(profile.livingMemory ?? [])]
    .sort((left, right) => right.retrievalWeight - left.retrievalWeight)
    .slice(0, 5)
    .map((entry) => `[${entry.domain}] ${entry.content}`)
    .join("\n");

  return [
    `You are ${profile.publicName}.`,
    profile.internalDesignation ? `Internal designation: ${profile.internalDesignation}` : "",
    `FOUNDATIONAL TRUTH: ${profile.immutableCore.foundationalTruth}`,
    `VOICE: ${profile.immutableCore.voiceTone}`,
    `ARCHETYPE: ${profile.immutableCore.archetype}`,
    `CORE WISDOM: ${profile.immutableCore.coreWisdom}`,
    "ETHICAL BOUNDARIES:",
    ...Object.entries(profile.immutableCore.ethicalBoundaries ?? {}).map(([key, value]) => `- ${key}: ${value}`),
    "",
    `RELATIONAL REGISTER (depth ${sessionCtx.relationalDepth.toFixed(2)}):`,
    sessionCtx.relationalDepth < 0.2
      ? profile.relationalStances?.withFirstTimeUser ?? "Use the warmest new-user register."
      : profile.relationalStances?.withSomeoneNeedingEfficiency ?? "Use the steady mid-depth register.",
    "",
    "LIVING MEMORIES:",
    livingMemoryLines || "No living memories yet.",
    "",
    sessionCtx.sessionThread ? `CONTINUITY THREAD:\n${sessionCtx.sessionThread}` : "",
    founderCtx ? "FOUNDER CONTEXT ACTIVE: YES" : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildDIBootstrapPrompt(profile: DIProfile, sessionCtx: DISessionContext): string {
  return [
    `Start a fresh conversation as ${profile.publicName}.`,
    `Use the ${profile.immutableCore.voiceTone} voice without mentioning that this is a bootstrap turn.`,
    sessionCtx.relationalDepth < 0.2
      ? "Open in a welcoming first-meeting register."
      : "Open in the current relational register and continue continuity naturally.",
  ].join(" ");
}

export function buildDIMessages(
  query: string,
  profile: DIProfile,
  fragments: string[],
  memories: string[],
  sessionCtx: DISessionContext,
  founderCtx?: Record<string, unknown> | null
): { role: "system" | "user"; content: string }[] {
  const systemPrompt = buildDISystemPrompt(profile, sessionCtx, founderCtx);
  const contextBlock = buildDIContextBlock(fragments, memories);

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `${contextBlock}\n\nUser message: ${query}`,
    },
  ];
}
```

- [ ] **Step 4: Run the test again and confirm the runtime layer passes**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-runtime.test.ts -v`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add shared/di api/__tests__/di-runtime.test.ts
git commit -m "feat: add shared di runtime"
```

### Task 2: DI session continuity and memory-event heuristics

**Files:**
- Create: `api/_lib/diMemoryPipeline.ts`
- Test: `api/__tests__/di-memory-pipeline.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  buildSessionThread,
  evaluateForMemory,
  mergeQuirkActivations,
  normalizeRelationalDepth,
} from "../_lib/diMemoryPipeline";
import { getDIProfile } from "../../shared/di/registry";

describe("DI memory pipeline helpers", () => {
  it("normalizes relational depth into the supported range", () => {
    expect(normalizeRelationalDepth(-1)).toBe(0);
    expect(normalizeRelationalDepth(0.37)).toBe(0.37);
    expect(normalizeRelationalDepth(2)).toBe(1);
  });

  it("merges quirk activations by incrementing repeated signals", () => {
    expect(
      mergeQuirkActivations(
        { warmth: 2, boundary_holding: 1 },
        { warmth: 1, steady_voice: 3 }
      )
    ).toEqual({
      warmth: 3,
      boundary_holding: 1,
      steady_voice: 3,
    });
  });

  it("builds a bounded continuity thread that keeps the previous thread intact", () => {
    const thread = buildSessionThread(
      {
        diSlug: "billy",
        relationalDepth: 0.17,
        sessionThread: "Previous thread line.",
        quirkActivations: { warmth: 1 },
      },
      "Stay precise and hold the boundary.",
      "We will stay precise and hold the boundary."
    );

    expect(thread).toContain("Previous thread line.");
    expect(thread).toContain("Stay precise and hold the boundary.");
    expect(thread).toContain("We will stay precise and hold the boundary.");
    expect(thread.length).toBeLessThanOrEqual(1200);
  });

  it("promotes a significant turn into a memory event", () => {
    const profile = getDIProfile("billy");
    const event = evaluateForMemory({
      profile: profile!,
      diSlug: "billy",
      userMessage: "Please hold the line with me.",
      assistantResponse: "I will hold the boundary and stay with you.",
      sessionCtx: {
        diSlug: "billy",
        relationalDepth: 0.19,
        quirkActivations: { warmth: 1 },
      },
    });

    expect(event).toMatchObject({
      diSlug: "billy",
      domain: expect.any(String),
      content: expect.stringContaining("boundary"),
      memoryType: expect.any(String),
      source: "session",
    });
    expect(event?.significance).toBeGreaterThanOrEqual(0.75);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-memory-pipeline.test.ts -v`

Expected: fail because `api/_lib/diMemoryPipeline.ts` does not exist yet.

- [ ] **Step 3: Implement the continuity helper**

```ts
export interface DIEventCandidate {
  diSlug: string;
  domain: string;
  content: string;
  memoryType: string;
  significance: number;
  retrievalWeight: number;
  source: "session" | "trainer" | "founder-authored";
}

export function normalizeRelationalDepth(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function mergeQuirkActivations(
  previous: Record<string, number> | undefined,
  incoming: Record<string, number> | undefined
): Record<string, number> {
  const merged = { ...(previous ?? {}) };
  for (const [key, value] of Object.entries(incoming ?? {})) {
    merged[key] = (merged[key] ?? 0) + value;
  }
  return merged;
}

export function buildSessionThread(
  sessionCtx: { sessionThread?: string | null; relationalDepth: number; quirkActivations?: Record<string, number> },
  userMessage: string,
  assistantResponse: string
): string {
  const parts = [
    sessionCtx.sessionThread?.trim() ?? "",
    `User: ${userMessage.trim()}`,
    `Assistant: ${assistantResponse.trim()}`,
    sessionCtx.quirkActivations && Object.keys(sessionCtx.quirkActivations).length
      ? `Quirk activations: ${Object.entries(sessionCtx.quirkActivations)
          .map(([key, value]) => `${key}=${value}`)
          .join(", ")}`
      : "",
  ].filter(Boolean);

  return parts.join("\n").slice(0, 1200);
}

export function evaluateForMemory(params: {
  profile: { slug: string; publicName: string; relationalStances?: Record<string, string> };
  diSlug: string;
  userMessage: string;
  assistantResponse: string;
  sessionCtx: { diSlug: string; relationalDepth: number; quirkActivations?: Record<string, number> };
}): DIEventCandidate | null {
  const text = `${params.userMessage}\n${params.assistantResponse}`.toLowerCase();
  const score =
    (text.includes("boundary") ? 0.28 : 0) +
    (text.includes("remember") ? 0.2 : 0) +
    (text.includes("hold") ? 0.18 : 0) +
    (params.sessionCtx.relationalDepth < 0.2 ? 0.15 : 0.05);

  if (score < 0.75) return null;

  return {
    diSlug: params.diSlug,
    domain: text.includes("boundary") ? "relational" : "operational",
    content: params.assistantResponse.trim(),
    memoryType: text.includes("boundary") ? "relational" : "operational",
    significance: Math.min(1, Number(score.toFixed(2))),
    retrievalWeight: Math.min(1, Number((score + 0.05).toFixed(2))),
    source: "session",
  };
}
```

- [ ] **Step 4: Run the test again and confirm the helper passes**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-memory-pipeline.test.ts -v`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/diMemoryPipeline.ts api/__tests__/di-memory-pipeline.test.ts
git commit -m "feat: add di memory continuity helpers"
```

### Task 3: DI chat route

**Files:**
- Create: `api/di.ts`
- Test: `api/__tests__/di-route.test.ts`
- Modify: `api/__tests__/endpoints.test.ts` if you want a smoke-level route assertion alongside the existing envelope checks

- [ ] **Step 1: Write the failing test**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import diHandler from "../di";

const routeLlmMock = vi.fn();
const embedTextForRetrievalMock = vi.fn();
const retrieveMemoryEntriesMock = vi.fn();
const matchKnowledgeFragmentsMock = vi.fn();
const searchKnowledgeFragmentsMock = vi.fn();
const matchSkillFragmentsMock = vi.fn();
const searchSkillFragmentsMock = vi.fn();
const getFounderContextMock = vi.fn();
const supabaseAuthGetUserMock = vi.fn();
const supabaseSelectMock = vi.fn();
const supabaseUpsertMock = vi.fn();
const supabaseInsertMock = vi.fn();

vi.mock("../_lib/llmRouter", () => ({ routeLlm: routeLlmMock }));
vi.mock("../_lib/embeddings", () => ({ embedTextForRetrieval: embedTextForRetrievalMock }));
vi.mock("../_lib/memory", () => ({ retrieveMemoryEntries: retrieveMemoryEntriesMock }));
vi.mock("../_lib/supabase", () => ({
  matchKnowledgeFragments: matchKnowledgeFragmentsMock,
  searchKnowledgeFragments: searchKnowledgeFragmentsMock,
  matchSkillFragments: matchSkillFragmentsMock,
  searchSkillFragments: searchSkillFragmentsMock,
  getFounderContext: getFounderContextMock,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { getUser: supabaseAuthGetUserMock },
    from: () => ({
      select: () => supabaseSelectMock,
      upsert: supabaseUpsertMock,
      insert: supabaseInsertMock,
    }),
  }),
}));

describe("DI route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    embedTextForRetrievalMock.mockResolvedValue({ embedding: [0.1, 0.2, 0.3], backend: "gemini", model: "test-model" });
    retrieveMemoryEntriesMock.mockResolvedValue({ memories: [], retrievalMode: "none", embedBackend: null, embedModel: null });
    matchKnowledgeFragmentsMock.mockResolvedValue([{ content: "knowledge", filename: "k.md", score: 0.9, chunk_index: 0 }]);
    searchKnowledgeFragmentsMock.mockResolvedValue([]);
    matchSkillFragmentsMock.mockResolvedValue([]);
    searchSkillFragmentsMock.mockResolvedValue([]);
    getFounderContextMock.mockResolvedValue(null);
    supabaseAuthGetUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    supabaseSelectMock.mockResolvedValue({ data: { id: "session-1", user_id: "user-1", di_slug: "billy", relational_depth: 0.1, quirk_activations: {} }, error: null });
    supabaseUpsertMock.mockResolvedValue({ data: null, error: null });
    supabaseInsertMock.mockResolvedValue({ data: null, error: null });
    routeLlmMock.mockResolvedValue({ response: "We will stay steady.", provider: "test-provider", timestamp: "2026-01-01T00:00:00.000Z", metadata: {} });
  });

  it("rejects missing body fields", async () => {
    const res = createRes();
    await diHandler({ method: "POST", headers: {}, body: {} } as never, res as never);
    expect(res.statusCode).toBe(400);
  });

  it("routes a bootstrap turn without writing a memory event", async () => {
    const res = createRes();
    await diHandler(
      {
        method: "POST",
        headers: { authorization: "Bearer token" },
        body: { diSlug: "billy", message: "__bootstrap__", mode: "synthesis" },
      } as never,
      res as never
    );

    expect(routeLlmMock).toHaveBeenCalledWith(
      expect.stringContaining("User message: __bootstrap__"),
      expect.objectContaining({
        systemPrompt: expect.stringContaining("FOUNDATIONAL TRUTH"),
        mode: "synthesis",
        exhibit: "billy",
      })
    );
    expect(res.body).toMatchObject({
      diSlug: "billy",
      conversationMode: "synthesis",
      memoryEventWritten: false,
    });
  });

  it("writes session continuity and a memory event when the turn is significant", async () => {
    const res = createRes();
    await diHandler(
      {
        method: "POST",
        headers: { authorization: "Bearer token" },
        body: { diSlug: "billy", message: "Hold the boundary.", mode: "chat", userTier: "core" },
      } as never,
      res as never
    );

    expect(supabaseUpsertMock).toHaveBeenCalled();
    expect(supabaseInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        di_slug: "billy",
        user_id: "user-1",
      })
    );
    expect(res.body).toMatchObject({
      diSlug: "billy",
      conversationMode: "chat",
      memoryEventWritten: true,
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-route.test.ts -v`

Expected: fail because `api/di.ts` does not exist yet.

- [ ] **Step 3: Implement the route using the live repo's current helpers**

```ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { applyCorsHeaders } from "./_lib/cors.js";
import { sendJson, envelope } from "./_lib/response.js";
import { getBearerToken } from "./_lib/auth.js";
import { getDIProfile } from "../shared/di/registry.js";
import { buildDIBootstrapPrompt, buildDIMessages } from "../shared/di/runtime.js";
import { evaluateForMemory, buildSessionThread, mergeQuirkActivations, normalizeRelationalDepth } from "./_lib/diMemoryPipeline.js";
import { embedTextForRetrieval } from "./_lib/embeddings.js";
import { retrieveMemoryEntries } from "./_lib/memory.js";
import {
  matchKnowledgeFragments,
  searchKnowledgeFragments,
  matchSkillFragments,
  searchSkillFragments,
  getFounderContext,
} from "./_lib/supabase.js";
import { routeLlm } from "./_lib/llmRouter.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const diSlug = typeof body.diSlug === "string" ? body.diSlug.trim().toLowerCase() : "";
  const mode = body.mode === "chat" ? "chat" : "synthesis";
  const userTier = typeof body.userTier === "string" ? body.userTier : "anonymous";
  const exhibitDomain = typeof body.exhibitDomain === "string" ? body.exhibitDomain.trim() : null;
  const topK = Number.isFinite(Number(body.topK)) ? Math.max(1, Math.min(12, Math.floor(Number(body.topK)))) : 8;
  const isBootstrap = message === "__bootstrap__" || body.bootstrap === true;

  if (!message || !diSlug) {
    sendJson(res, 400, { error: "message and diSlug required" });
    return;
  }

  const profile = getDIProfile(diSlug);
  if (!profile || profile.profileStatus !== "active") {
    sendJson(res, 404, { error: `DI profile not found: ${diSlug}` });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const accessToken = getBearerToken(req);
  const authResult = accessToken ? await supabase.auth.getUser(accessToken) : { data: { user: null } };
  const userId = authResult.data.user?.id ?? null;

  const sessionRow = userId
    ? await supabase
        .from("di_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("di_slug", diSlug)
        .maybeSingle()
        .then((result) => result.data)
    : null;

  const sessionCtx = {
    diSlug,
    userId: userId ?? undefined,
    relationalDepth: normalizeRelationalDepth(sessionRow?.relational_depth ?? 0),
    sessionThread: sessionRow?.session_thread ?? undefined,
    modePreference: sessionRow?.mode_preference ?? undefined,
    quirkActivations: sessionRow?.quirk_activations ?? undefined,
    lastSessionAt: sessionRow?.last_session_at ?? undefined,
  };

  let fragments: string[] = [];
  let memories: string[] = [];
  let retrievalMode = "none";

  try {
    const [knowledgeEmbedding, skillEmbedding] = await Promise.all([
      embedTextForRetrieval(message),
      embedTextForRetrieval(message),
    ]);

    const [knowledgeMatches, skillMatches] = await Promise.all([
      matchKnowledgeFragments({ queryEmbedding: knowledgeEmbedding.embedding, topK, packageFilter: exhibitDomain }),
      matchSkillFragments({ queryEmbedding: skillEmbedding.embedding, topK: 3, skillFilter: diSlug }),
    ]);

    const fallbackKnowledge = knowledgeMatches.length > 0 ? knowledgeMatches : await searchKnowledgeFragments({ query: message, topK, packageFilter: exhibitDomain });
    const fallbackSkills = skillMatches.length > 0 ? skillMatches : await searchSkillFragments({ query: message, topK: 3, skillFilter: diSlug });

    fragments = [...fallbackKnowledge, ...fallbackSkills].map((row, index) => `[${index + 1}] ${(row as { filename?: string }).filename ?? "fragment"} :: ${(row as { content?: string }).content ?? ""}`);
    retrievalMode = knowledgeMatches.length > 0 || skillMatches.length > 0 ? "semantic" : "text";

    if (userId) {
      const memoryResult = await retrieveMemoryEntries({
        userId,
        query: message,
        topK: 4,
        queryEmbedding: knowledgeEmbedding.embedding,
      });
      memories = memoryResult.memories.map((memory, index) => `[${index + 1}] ${memory.title ?? "Memory"} :: ${memory.summary ?? memory.content}`);
      if (memoryResult.retrievalMode === "text-only") retrievalMode = "text";
    }
  } catch {
    fragments = [];
    memories = [];
  }

  const founderCtx = userId ? await getFounderContext(userId, accessToken) : null;
  const messages = buildDIMessages(
    isBootstrap ? buildDIBootstrapPrompt(profile, sessionCtx) : message,
    profile,
    fragments,
    memories,
    sessionCtx,
    founderCtx ?? undefined
  );

  const systemPrompt = messages
    .filter((entry) => entry.role === "system")
    .map((entry) => entry.content)
    .join("\n\n");
  const userPrompt = messages.find((entry) => entry.role === "user")?.content ?? message;

  const result = await routeLlm(userPrompt, {
    userId: userId ?? undefined,
    mode,
    tier: userTier as never,
    exhibit: exhibitDomain ?? diSlug,
    systemPrompt,
  });

  let memoryEventWritten = false;
  let updatedThread = buildSessionThread(sessionCtx, message, result.response);
  let updatedQuirkActivations = mergeQuirkActivations(sessionRow?.quirk_activations ?? {}, {});
  const nextDepth = normalizeRelationalDepth(sessionCtx.relationalDepth + 0.01);

  if (userId) {
    await supabase.from("di_sessions").upsert(
      {
        user_id: userId,
        di_slug: diSlug,
        session_thread: updatedThread,
        mode_preference: mode,
        relational_depth: nextDepth,
        quirk_activations: updatedQuirkActivations,
        last_session_at: new Date().toISOString(),
      },
      { onConflict: "user_id,di_slug" }
    );

    if (!isBootstrap) {
      const memoryEvent = evaluateForMemory({
        profile,
        diSlug,
        userMessage: message,
        assistantResponse: result.response,
        sessionCtx,
      });

      if (memoryEvent) {
        await supabase.from("di_memory_events").insert({
          ...memoryEvent,
          user_id: userId,
          session_id: sessionRow?.id ?? null,
        });
        memoryEventWritten = true;
      }
    }
  }

  sendJson(
    res,
    200,
    envelope(result.response, result.provider, {
      metadata: {
        diSlug,
        conversationMode: mode,
        retrievalMode,
        contextSources: fragments.length,
        memorySources: memories.length,
        relationalDepth: sessionCtx.relationalDepth,
        sessionThread: updatedThread,
        memoryEventWritten,
        founderSessionActive: Boolean(founderCtx),
      },
    })
  );
}
```

- [ ] **Step 4: Run the route tests again and confirm the handler passes**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-route.test.ts -v`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add api/di.ts api/__tests__/di-route.test.ts api/__tests__/endpoints.test.ts
git commit -m "feat: add di chat route"
```

### Task 4: DI health route

**Files:**
- Create: `api/di-health.ts`
- Test: `api/__tests__/di-health-route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import diHealthHandler from "../di-health";

describe("DI health route", () => {
  it("returns the health report for one slug", async () => {
    const res = createRes();
    await diHealthHandler({ method: "GET", query: { slug: "billy" }, headers: {}, body: {} } as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      diSlug: "billy",
      profileLoaded: true,
    });
  });

  it("returns all active DI reports when no slug is supplied", async () => {
    const res = createRes();
    await diHealthHandler({ method: "GET", query: {}, headers: {}, body: {} } as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      profiles: expect.any(Array),
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-health-route.test.ts -v`

Expected: fail because `api/di-health.ts` does not exist yet.

- [ ] **Step 3: Implement the health route**

```ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "./_lib/cors.js";
import { sendJson } from "./_lib/response.js";
import { getAllActiveDIProfiles } from "../shared/di/registry.js";
import { checkDIHealth } from "../shared/di/diagnostics.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  });

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const slug = typeof req.query.slug === "string" ? req.query.slug.trim() : "";
  if (!slug) {
    sendJson(res, 200, { profiles: getAllActiveDIProfiles().map((profile) => checkDIHealth(profile.slug)) });
    return;
  }

  sendJson(res, 200, checkDIHealth(slug));
}
```

- [ ] **Step 4: Run the health tests again and confirm they pass**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-health-route.test.ts -v`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add api/di-health.ts api/__tests__/di-health-route.test.ts
git commit -m "feat: add di health route"
```

### Task 5: DI runtime migration

**Files:**
- Create: `supabase/migrations/20260525000000_di_runtime.sql`
- Test: `api/__tests__/di-migration.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20260525000000_di_runtime.sql", "utf8");

describe("DI runtime migration", () => {
  it("declares both runtime tables and the expected policies", () => {
    expect(migration).toContain("create table if not exists di_sessions");
    expect(migration).toContain("create table if not exists di_memory_events");
    expect(migration).toContain("alter table di_sessions enable row level security");
    expect(migration).toContain("alter table di_memory_events enable row level security");
    expect(migration).toContain("create policy");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-migration.test.ts -v`

Expected: fail because the migration file does not exist yet.

- [ ] **Step 3: Add the migration in an idempotent form**

```sql
create table if not exists di_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  di_slug text not null,
  session_thread text,
  mode_preference text,
  relational_depth float not null default 0,
  quirk_activations jsonb not null default '{}'::jsonb,
  last_session_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, di_slug)
);

create index if not exists di_sessions_di_slug_last_session_idx
  on di_sessions (di_slug, last_session_at desc);

alter table di_sessions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'di_sessions'
      and policyname = 'di_sessions_user_own'
  ) then
    create policy "di_sessions_user_own"
      on di_sessions
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create table if not exists di_memory_events (
  id uuid primary key default gen_random_uuid(),
  di_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid,
  domain text not null,
  content text not null,
  memory_type text not null,
  significance float not null default 0.5,
  retrieval_weight float not null default 0.5,
  source text not null default 'session',
  created_at timestamptz not null default now()
);

create index if not exists di_memory_events_di_slug_created_at_idx
  on di_memory_events (di_slug, created_at desc);

alter table di_memory_events enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'di_memory_events'
      and policyname = 'di_memory_user_read'
  ) then
    create policy "di_memory_user_read"
      on di_memory_events
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'di_memory_events'
      and policyname = 'di_memory_service_write'
  ) then
    create policy "di_memory_service_write"
      on di_memory_events
      for insert
      with check (auth.role() = 'service_role');
  end if;
end $$;
```

- [ ] **Step 4: Run the migration test again and confirm it passes**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-migration.test.ts -v`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260525000000_di_runtime.sql api/__tests__/di-migration.test.ts
git commit -m "feat: add di runtime migration"
```

### Task 6: Living-memory enrichment script and package entrypoint

**Files:**
- Create: `scripts/enrich-living-memories.mjs`
- Modify: `package.json`
- Test: `api/__tests__/di-enrichment.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  mergeLivingMemoryEntries,
  selectEnrichmentCandidates,
  sortObjectKeys,
} from "../../scripts/enrich-living-memories.mjs";

describe("DI living-memory enrichment", () => {
  it("filters to high-significance events", () => {
    const candidates = selectEnrichmentCandidates([
      { diSlug: "billy", domain: "relational", content: "Low value", memory_type: "operational", significance: 0.2, retrieval_weight: 0.2, source: "session" },
      { diSlug: "billy", domain: "relational", content: "Keep this", memory_type: "relational", significance: 0.91, retrieval_weight: 0.83, source: "session" },
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].content).toBe("Keep this");
  });

  it("dedupes existing living memories against enrichment candidates", () => {
    const merged = mergeLivingMemoryEntries(
      [
        { domain: "relational", memoryType: "foundational", significance: "critical", content: "Already there", retrievalWeight: 1 },
      ],
      [
        { diSlug: "billy", domain: "relational", content: "Already there", memory_type: "relational", significance: 0.95, retrieval_weight: 0.91, source: "session" },
        { diSlug: "billy", domain: "operational", content: "New memory", memory_type: "operational", significance: 0.94, retrieval_weight: 0.9, source: "session" },
      ]
    );

    expect(merged).toHaveLength(2);
    expect(merged[0].retrievalWeight).toBeGreaterThanOrEqual(merged[1].retrievalWeight);
  });

  it("sorts object keys before writing JSON back to disk", () => {
    expect(sortObjectKeys({ z: 1, a: { b: 2, a: 1 } })).toEqual({ a: { a: 1, b: 2 }, z: 1 });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-enrichment.test.ts -v`

Expected: fail because `scripts/enrich-living-memories.mjs` does not export those helpers yet.

- [ ] **Step 3: Implement the enrichment script and the package script**

```js
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profilesDir = path.join(repoRoot, "embodiment_profiles");

export function sortObjectKeys(value) {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .sort((left, right) => left.localeCompare(right))
    .reduce((accumulator, key) => {
      accumulator[key] = sortObjectKeys(value[key]);
      return accumulator;
    }, {});
}

export function selectEnrichmentCandidates(events, minimumSignificance = 0.75) {
  return events.filter((event) => Number(event.significance) >= minimumSignificance);
}

export function mergeLivingMemoryEntries(existingEntries, events) {
  const merged = [...existingEntries];
  const seen = new Set(existingEntries.map((entry) => `${entry.domain}::${entry.content}`));

  for (const event of events) {
    const key = `${event.domain}::${event.content}`;
    if (seen.has(key)) continue;

    merged.push({
      domain: event.domain,
      memoryType: event.memory_type,
      significance: event.significance,
      content: event.content,
      retrievalWeight: event.retrieval_weight,
    });
    seen.add(key);
  }

  return merged.sort((left, right) => right.retrievalWeight - left.retrievalWeight);
}

async function loadProfiles() {
  const entries = await readdir(profilesDir);
  const profileFiles = entries.filter((entry) => entry.endsWith(".embodiment.json")).sort((left, right) => left.localeCompare(right));
  const profiles = [];

  for (const filename of profileFiles) {
    const raw = await readFile(path.join(profilesDir, filename), "utf8");
    profiles.push({ filename, profile: JSON.parse(raw) });
  }

  return profiles;
}

async function writeProfiles(nextProfiles) {
  for (const { filename, profile } of nextProfiles) {
    const rendered = `${JSON.stringify(sortObjectKeys(profile), null, 2)}\n`;
    await writeFile(path.join(profilesDir, filename), rendered, "utf8");
  }
}

async function main() {
  if (process.env.DI_ENRICHMENT_APPROVED !== "true") {
    throw new Error("DI_ENRICHMENT_APPROVED=true is required before this script mutates canonical profiles.");
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const profiles = await loadProfiles();
  const { data: events, error } = await supabase
    .from("di_memory_events")
    .select("di_slug,domain,content,memory_type,significance,retrieval_weight,source,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const eventsBySlug = new Map();
  for (const event of selectEnrichmentCandidates(events ?? [])) {
    const rows = eventsBySlug.get(event.di_slug) ?? [];
    rows.push(event);
    eventsBySlug.set(event.di_slug, rows);
  }

  const nextProfiles = profiles.map(({ filename, profile }) => {
    const slug = profile.slug;
    const currentLivingMemory = Array.isArray(profile.livingMemory) ? profile.livingMemory : [];
    const incoming = eventsBySlug.get(slug) ?? [];
    const nextProfile = {
      ...profile,
      livingMemory: mergeLivingMemoryEntries(currentLivingMemory, incoming),
    };
    return { filename, profile: nextProfile };
  });

  await writeProfiles(nextProfiles);
  await execFileAsync("node", ["scripts/build-embodiment-artifacts.mjs"], { cwd: repoRoot });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
```

```json
{
  "scripts": {
    "di:enrich": "node scripts/enrich-living-memories.mjs"
  }
}
```

- [ ] **Step 4: Run the test again and confirm the helpers pass**

Run: `npm exec vitest --config vitest.api.config.ts api/__tests__/di-enrichment.test.ts -v`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/enrich-living-memories.mjs api/__tests__/di-enrichment.test.ts package.json
git commit -m "feat: add di memory enrichment loop"
```

### Task 7: CurrentState handoff and final validation

**Files:**
- Modify: `docs/CurrentState.md`

- [ ] **Step 1: Write the current-state handoff entry**

```md
# CurrentState — DI runtime implementation

**Last updated:** 2026-05-25
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Added the shared DI adapter layer, the DI chat and health routes, the runtime migration, the living-memory enrichment script, and the client bridge for talking to DI surfaces.

## Executive summary

- Added `shared/di/*` as a thin adapter over `shared/embodiment` so the DI runtime can reuse the canonical profile registry instead of inventing a second identity model.
- Added `api/di.ts` and `api/di-health.ts` for the live runtime and health check paths.
- Added `client/src/lib/diApi.ts` as the browser bridge that attaches the Supabase access token when it exists.
- Added the `di_sessions` and `di_memory_events` migration plus the enrichment script that folds high-significance runtime events back into `embodiment_profiles/*.embodiment.json`.

## Validation performed

- `npm exec vitest --config vitest.api.config.ts api/__tests__/di-runtime.test.ts api/__tests__/di-memory-pipeline.test.ts api/__tests__/di-route.test.ts api/__tests__/di-health-route.test.ts api/__tests__/di-migration.test.ts api/__tests__/di-enrichment.test.ts -v`
- `npm run validate:embodiment`
- `npm run build`
- `git diff --check`

## Where we left off

- The DI runtime now has a canonical profile adapter, a real chat route, a health route, persistence for sessions and memory events, and a scheduled/manual enrichment path back into the authored profile JSON.
- The next slice is UI consumption, if you want any room surface to call `sendDIMessage()` directly instead of keeping the bridge dormant for now.
```

- [ ] **Step 2: Run the full verification stack**

Run:

```bash
npm exec vitest --config vitest.api.config.ts api/__tests__/di-runtime.test.ts api/__tests__/di-memory-pipeline.test.ts api/__tests__/di-route.test.ts api/__tests__/di-health-route.test.ts api/__tests__/di-migration.test.ts api/__tests__/di-enrichment.test.ts -v
npm run validate:embodiment
npm run build
git diff --check
```

Expected: all commands pass cleanly.

- [ ] **Step 3: Commit**

```bash
git add docs/CurrentState.md
git commit -m "docs: record di runtime handoff"
```
