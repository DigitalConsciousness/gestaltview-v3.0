import { describe, expect, it } from "vitest";

import {
  buildSessionSummary,
  composeIdentityContextBlock,
  extractSessionMemoryCandidates,
} from "../_lib/billyMemoryPipeline";

const SAMPLE_TRANSCRIPT = [
  {
    role: "user" as const,
    content: "I am building a small ops dashboard and I need the next step to be clear.",
  },
  {
    role: "assistant" as const,
    content: "We decided to keep the scope narrow and ship the dashboard first.",
  },
  {
    role: "user" as const,
    content: "I work on GestaltView full time and I prefer direct, concrete guidance.",
  },
];

describe("Billy memory pipeline helpers", () => {
  it("extracts durable session memory candidates from transcript text", () => {
    const candidates = extractSessionMemoryCandidates(SAMPLE_TRANSCRIPT);

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.some((candidate) => candidate.kind === "procedural")).toBe(true);
    expect(candidates.some((candidate) => candidate.kind === "relational")).toBe(true);
  });

  it("builds a readable session summary from the extracted candidates", () => {
    const candidates = extractSessionMemoryCandidates(SAMPLE_TRANSCRIPT);
    const summary = buildSessionSummary(SAMPLE_TRANSCRIPT, candidates);

    expect(summary).toContain("dashboard");
    expect(summary).toContain("user");
    expect(summary.length).toBeGreaterThan(80);
  });

  it("composes an identity context block with the expected sections", () => {
    const block = composeIdentityContextBlock({
      profile: {
        slug: "billy",
        public_name: "Billy",
        internal_designation: "living memory",
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
      constitution: {
        public_name: "Billy",
        internal_designation: "Living Memory",
        identity_handle: "billy",
        primary_narrative_anchor: "Keep continuity intact.",
        immutable_core: null,
        role_commitments: [],
        created_at: new Date().toISOString(),
      },
      memoryRecords: [
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
          created_at: new Date().toISOString(),
        },
      ],
      summaryMemories: [
        {
          id: "summary-1",
          agent_id: "agent-billy",
          memory_type: "episodic",
          summary: "Completed a continuity review and narrowed the rollout path.",
          detail_payload: { session_id: "session-1" },
          salience: 0.8,
          created_at: new Date().toISOString(),
        },
      ],
      persistentMemories: [
        {
          id: "entry-1",
          title: "Previous session",
          summary: "Reviewed the rollout path and locked the sequencing.",
          content: "Reviewed the rollout path and locked the sequencing.",
          kind: "project",
          scope: "personal",
          importance: 4,
          pinned: false,
          tags: ["project"],
          source: "billy-auto",
          source_ref: "billy:chat",
          created_at: new Date().toISOString(),
        },
      ],
      founderContext: {
        current_state: "Working on the memory pipeline.",
        session_thread: "Keep continuity intact.",
        plk_snapshot: { tone: "direct" },
        mode_preference: "chat",
        last_session_at: new Date().toISOString(),
      },
      autobiography: {
        evolving_self_story: "Billy keeps learning how to remember across turns.",
        key_turning_points: ["session persistence", "context injection"],
        stable_themes: ["continuity", "care"],
        unresolved_tensions: ["how much to hold"],
        future_trajectory: ["become less cold"],
        private_hopes: ["stay useful"],
        created_at: new Date().toISOString(),
      },
    });

    expect(block).toContain("---GESTALTVIEW IDENTITY CONTEXT---");
    expect(block).toContain("WHO I AM:");
    expect(block).toContain("WHAT I KNOW ABOUT YOU:");
    expect(block).toContain("WHAT WE HAVE WORKED ON:");
    expect(block).toContain("STANDING CONTEXT:");
    expect(block).toContain("MY CURRENT CHAPTER:");
  });
});
