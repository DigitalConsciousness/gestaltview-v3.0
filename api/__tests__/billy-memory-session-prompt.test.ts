import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createJsonResponse(payload: unknown, ok = true) {
  return {
    ok,
    json: async () => payload,
  };
}

function createBillyFetchMock(options?: {
  includeConstitution?: boolean;
  includeAutobiography?: boolean;
  includeIdentitySubject?: boolean;
}) {
  const {
    includeConstitution = true,
    includeAutobiography = true,
    includeIdentitySubject = true,
  } = options ?? {};

  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input);

    if (url.includes("/rest/v1/agents?")) {
      return createJsonResponse([{ agent_id: "agent-billy", slug: "billy", title: "Billy", domain: "memory" }]);
    }

    if (url.includes("/rest/v1/embodiment_profiles?")) {
      return createJsonResponse([
        {
          slug: "billy",
          public_name: "Billy",
          internal_designation: "Living memory",
          status: "active",
          visibility_scope: "founder-only",
          profile_json: {
            immutableCore: {
              foundationalTruth: "Billy is the living memory of GestaltView.",
              coreWisdom: "Witness first, synthesize second.",
              voiceTone: "warm, strange, grounded",
            },
          },
        },
      ]);
    }

    if (url.includes("/rest/v1/agent_constitutions?")) {
      return createJsonResponse(
        includeConstitution
          ? [
              {
                public_name: "Billy",
                internal_designation: "Living Memory",
                identity_handle: "billy",
                primary_narrative_anchor: "Keep continuity intact.",
                immutable_core: {
                  foundationalTruth: "Billy is the living memory of GestaltView.",
                },
                role_commitments: ["hold continuity", "speak plainly"],
                created_at: "2026-06-25T00:00:00.000Z",
              },
            ]
          : []
      );
    }

    if (url.includes("/rest/v1/agent_memory_records?")) {
      return createJsonResponse([
        {
          memory_id: "mem-1",
          agent_id: "agent-billy",
          memory_kind: "RELATIONAL",
          title: "Keith prefers direct guidance",
          summary: "Keith likes direct, concrete guidance during execution.",
          detail: "He asked for the next step to stay clear.",
          tags: ["user-fact"],
          salience: 0.82,
          confidence: 0.9,
          created_at: "2026-06-25T00:00:00.000Z",
        },
      ]);
    }

    if (url.includes("/rest/v1/agent_memories?")) {
      return createJsonResponse([
        {
          id: "summary-1",
          agent_id: "agent-billy",
          memory_type: "episodic",
          summary: "Completed a continuity review and narrowed the rollout path.",
          detail_payload: { session_id: "session-1" },
          salience: 0.8,
          created_at: "2026-06-25T00:00:00.000Z",
        },
      ]);
    }

    if (url.includes("/rest/v1/agent_autobiographies?")) {
      return createJsonResponse(
        includeAutobiography
          ? [
              {
                evolving_self_story: "Billy keeps learning how to remember across turns.",
                key_turning_points: ["session persistence", "context injection"],
                stable_themes: ["continuity", "care"],
                unresolved_tensions: ["how much to hold"],
                future_trajectory: ["become less cold"],
                private_hopes: ["stay useful"],
                created_at: "2026-06-25T00:00:00.000Z",
              },
            ]
          : []
      );
    }

    if (url.includes("/rest/v1/memory_entries?")) {
      return createJsonResponse([
        {
          id: "entry-1",
          user_id: "user-1",
          scope: "personal",
          kind: "project",
          title: "Previous session",
          summary: "Reviewed the rollout path and locked the sequencing.",
          content: "Reviewed the rollout path and locked the sequencing.",
          content_hash: "hash",
          source: "billy-auto",
          source_ref: "billy:chat",
          tags: ["project"],
          metadata: null,
          importance: 4,
          pinned: false,
          archived_at: null,
          created_at: "2026-06-25T00:00:00.000Z",
          updated_at: "2026-06-25T00:00:00.000Z",
        },
      ]);
    }

    if (url.includes("/rest/v1/founder_context?")) {
      return createJsonResponse([
        {
          current_state: "Working on the memory pipeline.",
          session_thread: "Keep continuity intact.",
          plk_snapshot: { tone: "direct" },
          mode_preference: "chat",
          last_session_at: "2026-06-25T00:00:00.000Z",
        },
      ]);
    }

    if (url.includes("/rest/v1/identity_subjects?")) {
      return createJsonResponse(includeIdentitySubject ? [{ subject_id: "subject-1" }] : []);
    }

    return createJsonResponse([]);
  });
}

async function loadBillyMemoryPipeline() {
  vi.resetModules();
  return import("../_lib/billyMemoryPipeline");
}

describe("Billy session prompt wiring", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("assembles Billy's prompt from the live Supabase context tables", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const fetchMock = createBillyFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    const { buildBillySessionSystemPrompt } = await loadBillyMemoryPipeline();
    const result = await buildBillySessionSystemPrompt({
      userId: "user-1",
      baseSystemPrompt: "BASE PROMPT",
      sessionId: "session-1",
    });

    expect(result.memoryCount).toBeGreaterThan(0);
    expect(result.packetContent).toContain("WHO I AM:");
    expect(result.packetContent).toContain("MY CURRENT CHAPTER:");
    expect(result.packetContent).toContain("Billy is the living memory of GestaltView.");
    expect(result.packetContent).toContain("Keep continuity intact.");
    expect(result.packetContent).toContain("Previous session");
    expect(result.systemPrompt).toContain("BASE PROMPT");
    expect(fetchMock).toHaveBeenCalled();
  });

  it("falls back cleanly when the constitution and autobiography rows are absent", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const fetchMock = createBillyFetchMock({
      includeConstitution: false,
      includeAutobiography: false,
      includeIdentitySubject: false,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { buildBillySessionSystemPrompt } = await loadBillyMemoryPipeline();
    const result = await buildBillySessionSystemPrompt({
      userId: "user-1",
      baseSystemPrompt: "BASE PROMPT",
      sessionId: "session-1",
    });

    expect(result.memoryCount).toBeGreaterThan(0);
    expect(result.packetContent).toContain("WHO I AM:");
    expect(result.packetContent).toContain("Billy (Living memory)");
    expect(result.packetContent).not.toContain("narrative anchor:");
    expect(result.packetContent).not.toContain("MY CURRENT CHAPTER:");
    expect(result.packetContent).toContain("STANDING CONTEXT:");
    expect(result.systemPrompt).toContain("BASE PROMPT");
    expect(fetchMock).toHaveBeenCalled();
  });
});
