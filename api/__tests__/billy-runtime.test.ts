// GestaltView v2 — Billy Runtime Unit Tests
// © 2026 Keith Soyka / GestaltView
//
// UPDATES (2026-03-19):
// — Fixed BILLY_SYSTEM_PROMPT assertion: prompt contains 'ManifestIndex'
//   (no space) and 'MANIFEST INDEX' (all-caps context header), not
//   'Manifest Index' (mixed case with space).
// — Added tests for classifyIntent() and deduplicateChunks() which were
//   added to runtime.ts on 2026-03-19 but not yet covered.

import { describe, it, expect } from "vitest";
import {
  BILLY_SYSTEM_PROMPT,
  inferPackageFromQuery,
  buildContextBlock,
  buildMemoryBlock,
  buildBillyMessages,
  classifyIntent,
  deduplicateChunks,
} from "../../shared/billy/runtime";
import type { RetrievedChunk, RetrievedMemoryEntry } from "../../shared/billy/types";

// ─── inferPackageFromQuery ────────────────────────────────────────────────

describe("inferPackageFromQuery", () => {
  it("returns 'methods' for PLK-related queries", () => {
    expect(inferPackageFromQuery("What is the PLK system?")).toBe("methods");
    expect(inferPackageFromQuery("personal language key")).toBe("methods");
    expect(inferPackageFromQuery("fingerprint analysis")).toBe("methods");
  });

  it("returns 'methods' for loom/tapestry queries", () => {
    expect(inferPackageFromQuery("How does the Loom approach work?")).toBe("methods");
    expect(inferPackageFromQuery("tapestry engine")).toBe("methods");
  });

  it("returns 'billy-engine' for billy queries", () => {
    expect(inferPackageFromQuery("Tell me about Billy")).toBe("billy-engine");
    expect(inferPackageFromQuery("who are you?")).toBe("billy-engine");
  });

  it("returns 'core-architecture' for architecture queries", () => {
    expect(inferPackageFromQuery("GestaltView architecture")).toBe("core-architecture");
    expect(inferPackageFromQuery("manifest index")).toBe("core-architecture");
  });

  it("returns 'evidence-diligence' for evidence queries", () => {
    expect(inferPackageFromQuery("Pepperdine evidence")).toBe("evidence-diligence");
    expect(inferPackageFromQuery("diligence report")).toBe("evidence-diligence");
  });

  it("returns 'founder-context' for founder queries", () => {
    expect(inferPackageFromQuery("Tell me about Keith")).toBe("founder-context");
    expect(inferPackageFromQuery("founder story")).toBe("founder-context");
  });

  it("returns 'methods' for ADHD queries", () => {
    expect(inferPackageFromQuery("ADHD executive function tips")).toBe("methods");
    expect(inferPackageFromQuery("brain sparks hyperfocus")).toBe("methods");
  });

  it("returns 'methods' for recovery queries", () => {
    expect(inferPackageFromQuery("addiction recovery support")).toBe("methods");
    expect(inferPackageFromQuery("sobriety and resilience")).toBe("methods");
  });

  it("returns 'methods' for Alzheimer's / memory care queries", () => {
    expect(inferPackageFromQuery("alzheimer legacy edition")).toBe("methods");
    expect(inferPackageFromQuery("memory preservation for dementia")).toBe("methods");
  });

  it("returns 'methods' for musical DNA queries", () => {
    expect(inferPackageFromQuery("musical dna emotional signature")).toBe("methods");
    expect(inferPackageFromQuery("playlist as emotional autobiography")).toBe("methods");
  });

  it("returns 'evidence-diligence' for investor / portfolio queries", () => {
    expect(inferPackageFromQuery("investor pitch deck")).toBe("evidence-diligence");
    expect(inferPackageFromQuery("funding valuation market")).toBe("evidence-diligence");
  });

  it("returns null for unmatched queries", () => {
    expect(inferPackageFromQuery("What is the weather today?")).toBeNull();
    expect(inferPackageFromQuery("random question")).toBeNull();
  });
});

// ─── classifyIntent ───────────────────────────────────────────────────────

describe("classifyIntent", () => {
  it("classifies build intents", () => {
    expect(classifyIntent("build a new feature")).toBe("build");
    expect(classifyIntent("create a component")).toBe("build");
    expect(classifyIntent("generate a schema")).toBe("build");
  });

  it("classifies debug intents", () => {
    expect(classifyIntent("fix this error")).toBe("debug");
    expect(classifyIntent("why doesn't this work")).toBe("debug");
    expect(classifyIntent("the build is broken")).toBe("debug");
  });

  it("classifies summarize intents", () => {
    expect(classifyIntent("summarize the architecture")).toBe("summarize");
    expect(classifyIntent("give me an overview")).toBe("summarize");
    expect(classifyIntent("tldr of this document")).toBe("summarize");
  });

  it("classifies plan intents", () => {
    expect(classifyIntent("create a roadmap for the next sprint")).toBe("plan");
    expect(classifyIntent("what should I prioritize")).toBe("plan");
  });

  it("classifies learn intents", () => {
    expect(classifyIntent("explain how the loom works")).toBe("learn");
    expect(classifyIntent("what is PLK")).toBe("learn");
  });

  it("classifies reflect intents", () => {
    expect(classifyIntent("I feel overwhelmed")).toBe("reflect");
    expect(classifyIntent("this is really hard")).toBe("reflect");
  });

  it("falls back to general for ambiguous queries", () => {
    expect(classifyIntent("hello")).toBe("general");
    expect(classifyIntent("thanks")).toBe("general");
  });
});

// ─── deduplicateChunks ────────────────────────────────────────────────────

describe("deduplicateChunks", () => {
  it("removes duplicate document_id + chunk_index pairs, keeping highest score", () => {
    const chunks: RetrievedChunk[] = [
      { document_id: "doc-1", chunk_index: 0, content: "A", filename: "a.md", score: 0.9 },
      { document_id: "doc-1", chunk_index: 0, content: "A", filename: "a.md", score: 0.7 },
      { document_id: "doc-2", chunk_index: 1, content: "B", filename: "b.md", score: 0.8 },
    ];
    const result = deduplicateChunks(chunks);
    expect(result).toHaveLength(2);
    const docOne = result.find((c) => c.document_id === "doc-1");
    expect(docOne?.score).toBe(0.9);
  });

  it("returns chunks sorted by score descending", () => {
    const chunks: RetrievedChunk[] = [
      { document_id: "doc-1", chunk_index: 0, content: "A", filename: "a.md", score: 0.5 },
      { document_id: "doc-2", chunk_index: 0, content: "B", filename: "b.md", score: 0.95 },
      { document_id: "doc-3", chunk_index: 0, content: "C", filename: "c.md", score: 0.75 },
    ];
    const result = deduplicateChunks(chunks);
    expect(result[0].score).toBe(0.95);
    expect(result[1].score).toBe(0.75);
    expect(result[2].score).toBe(0.5);
  });

  it("handles empty array", () => {
    expect(deduplicateChunks([])).toHaveLength(0);
  });
});

// ─── buildContextBlock ────────────────────────────────────────────────────

describe("buildContextBlock", () => {
  const chunks: RetrievedChunk[] = [
    {
      document_id: "doc-1",
      content: "Billy is the GestaltView companion AI.",
      filename: "billy-overview.md",
      score: 0.95,
      chunk_index: 0,
      document_type: "architecture",
    },
    {
      document_id: "doc-2",
      content: "PLK stands for Personal Language Key.",
      filename: "plk-guide.md",
      score: 0.88,
      chunk_index: 1,
      document_type: "methods",
    },
  ];

  it("includes header line", () => {
    const block = buildContextBlock(chunks, null);
    expect(block).toContain("CONTEXT FROM MANIFEST INDEX");
  });

  it("includes package filter when provided", () => {
    const block = buildContextBlock(chunks, "methods");
    expect(block).toContain("Package filter: methods");
  });

  it("includes chunk content with source attribution", () => {
    const block = buildContextBlock(chunks, null);
    expect(block).toContain("architecture/billy-overview.md");
    expect(block).toContain("Billy is the GestaltView companion AI.");
    expect(block).toContain("methods/plk-guide.md");
  });

  it("respects maxChars limit", () => {
    const block = buildContextBlock(chunks, null, 100);
    expect(block.length).toBeLessThanOrEqual(200);
  });

  it("handles empty chunks array", () => {
    const block = buildContextBlock([], null);
    expect(block).toContain("No matching fragments were found");
  });
});

// ─── buildMemoryBlock ─────────────────────────────────────────────────────

describe("buildMemoryBlock", () => {
  const memories: RetrievedMemoryEntry[] = [
    {
      id: "mem-1",
      title: "Morning rhythm",
      summary: "The user writes best before noon and tends to stall after context switching.",
      content: "The user writes best before noon and tends to stall after context switching.",
      kind: "preference",
      scope: "personal",
      importance: 4,
      pinned: true,
      tags: ["workflow", "writing"],
      score: 0.92,
    },
  ];

  it("includes a persistent memory header", () => {
    const block = buildMemoryBlock(memories);
    expect(block).toContain("PERSISTENT MEMORY CONTEXT");
  });

  it("includes memory title and summary", () => {
    const block = buildMemoryBlock(memories);
    expect(block).toContain("Morning rhythm");
    expect(block).toContain("writes best before noon");
  });

  it("handles empty memory arrays", () => {
    const block = buildMemoryBlock([]);
    expect(block).toContain("No recalled memories were attached");
  });
});

// ─── buildBillyMessages ───────────────────────────────────────────────────

describe("buildBillyMessages", () => {
  it("returns system and user messages", () => {
    const messages = buildBillyMessages({
      query: "What is GestaltView?",
      packageFilter: null,
      fragments: [],
    });

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
  });

  it("includes system prompt in system message", () => {
    const messages = buildBillyMessages({
      query: "Test",
      packageFilter: null,
      fragments: [],
    });

    expect(messages[0].content).toContain("Billy");
    expect(messages[0].content).toContain("GestaltView");
  });

  it("includes PLK profile when provided", () => {
    const messages = buildBillyMessages({
      query: "Test",
      packageFilter: null,
      fragments: [],
      plkProfile: "trauma-informed, ADHD-friendly",
    });

    expect(messages[0].content).toContain("PLK Profile active");
    expect(messages[0].content).toContain("trauma-informed");
  });

  it("includes persistent memory context when provided", () => {
    const messages = buildBillyMessages({
      query: "What should I keep in mind?",
      packageFilter: null,
      fragments: [],
      memories: [
        {
          id: "mem-1",
          title: "Noise sensitivity",
          summary: "The user loses focus when Slack notifications stack up.",
          content: "The user loses focus when Slack notifications stack up.",
          kind: "constraint",
          scope: "personal",
          importance: 5,
          pinned: true,
          tags: ["focus"],
        },
      ],
    });

    expect(messages[1].content).toContain("PERSISTENT MEMORY CONTEXT");
    expect(messages[1].content).toContain("Noise sensitivity");
  });

  it("includes user query in user message", () => {
    const messages = buildBillyMessages({
      query: "What is the Loom approach?",
      packageFilter: null,
      fragments: [],
    });

    expect(messages[1].content).toContain("What is the Loom approach?");
  });

  it("includes intent tag in user message", () => {
    const messages = buildBillyMessages({
      query: "explain how the loom works",
      packageFilter: null,
      fragments: [],
    });
    expect(messages[1].content).toContain("[Intent:");
  });
});

// ─── BILLY_SYSTEM_PROMPT ──────────────────────────────────────────────────

describe("BILLY_SYSTEM_PROMPT", () => {
  it("is a non-empty string", () => {
    expect(typeof BILLY_SYSTEM_PROMPT).toBe("string");
    expect(BILLY_SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  it("mentions key concepts", () => {
    // Note: prompt uses 'ManifestIndex' (no space) and the
    // context block header uses 'MANIFEST INDEX' (all-caps).
    // 'GestaltView-Official-Compendium' is the corpus reference.
    expect(BILLY_SYSTEM_PROMPT).toContain("PLK");
    expect(BILLY_SYSTEM_PROMPT).toContain("GestaltView");
    expect(BILLY_SYSTEM_PROMPT).toContain("GestaltView-Official-Compendium");
    expect(BILLY_SYSTEM_PROMPT).toContain("Avoid therapist-script openers");
    expect(BILLY_SYSTEM_PROMPT).toContain("living memory of GestaltView");
  });
});
