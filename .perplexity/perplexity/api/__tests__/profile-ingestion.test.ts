import { beforeEach, describe, expect, it, vi } from "vitest";

const insertRowMock = vi.fn();
const upsertMemoryEntryMock = vi.fn();

vi.mock("../_lib/supabase", () => ({
  insertRow: insertRowMock,
  upsertMemoryEntry: upsertMemoryEntryMock,
}));

async function loadPipeline() {
  vi.resetModules();
  return import("../_lib/profileIngestion");
}

describe("profile ingestion pipeline", () => {
  beforeEach(() => {
    insertRowMock.mockReset();
    upsertMemoryEntryMock.mockReset();
    insertRowMock.mockResolvedValue(true);
    upsertMemoryEntryMock.mockResolvedValue({ id: "memory-1" });
  });

  it("synthesizes dimensions with evidence from raw profile sources", async () => {
    const { runProfileIngestion } = await loadPipeline();

    const result = await runProfileIngestion(
      {
        userId: "11111111-1111-4111-8111-111111111111",
        sources: {
          journals: [
            "I build creative systems through writing, music, and visual design. I collaborate best when the next step is concrete.",
          ],
          resume: "Built production TypeScript systems and led prototype reviews with direct feedback.",
          livedExperience: {
            narrative: "Hard seasons taught me to recover through structure and keep building through ambiguity.",
          },
        },
      },
      { persist: false },
    );

    expect(result.status).toBe("complete");
    expect(result.personalityProfile.dimensions.length).toBeGreaterThan(0);
    expect(result.personalityProfile.dimensions.map((dimension) => dimension.dimensionKey)).toContain(
      "creative_expression",
    );
    expect(result.metadata.sourcesProcessed).toBe(3);
    expect(insertRowMock).not.toHaveBeenCalled();
  });

  it("persists run, sources, dimensions, and PLK fragments when enabled", async () => {
    const { runProfileIngestion } = await loadPipeline();

    const result = await runProfileIngestion({
      userId: "11111111-1111-4111-8111-111111111111",
      sources: {
        transcripts: [
          "When conflict appears I prefer direct repair, clear boundaries, and honest collaboration with the team.",
        ],
      },
      includeInPLK: true,
    });

    expect(result.metadata.persistence).toBe("stored");
    expect(insertRowMock).toHaveBeenCalledWith(
      "user_profile_ingestion_runs",
      expect.objectContaining({ run_id: result.runId, status: "complete" }),
    );
    expect(insertRowMock).toHaveBeenCalledWith(
      "profile_ingestion_sources",
      expect.objectContaining({ source_type: "transcript" }),
    );
    expect(insertRowMock).toHaveBeenCalledWith(
      "user_personality_dimensions",
      expect.objectContaining({ dimension_key: expect.any(String) }),
    );
    expect(upsertMemoryEntryMock).toHaveBeenCalled();
  });
});
