import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCaptureOrb, writeApprovedOrbs, writeScaffoldQueue, type CaptureOrb } from "@/components/Scaffold";
import {
  archiveScaffoldOrb,
  buildScaffoldPreviewDetails,
  readArchivedScaffoldOrbs,
  restoreScaffoldOrb,
} from "@/lib/scaffoldStorage";

function makeOrb(overrides: Partial<CaptureOrb> = {}): CaptureOrb {
  return {
    ...(createCaptureOrb({
      text: "A scaffold preview needs context, anchor, meaning, and memory before approval.",
      source: "blackboard",
      action: "send-to-external-scaffold",
      context: "From a launch-readiness review.",
      anchor: "External Scaffold preview",
      meaning: "Shows what will be preserved.",
      memory: "The source capture stays intact while the scaffold is reviewed.",
      tags: ["scaffold", "preview", "billy"],
      resonance: 82,
    }) as CaptureOrb),
    ...overrides,
  };
}

describe("scaffold storage helpers", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
      dispatchEvent: vi.fn(),
    });
  });

  it("builds a rich scaffold preview without promoting Billy into tags", () => {
    const orb = makeOrb();
    const related = [makeOrb({ id: "related", title: "Related memory", tags: ["scaffold", "preview"] })];

    const preview = buildScaffoldPreviewDetails(orb, {
      state: "pending",
      relatedOrbs: related,
    });

    expect(preview.stateLabel).toBe("Pending review");
    expect(preview.rows.map((row) => row.label)).toEqual([
      "Source",
      "Type",
      "Context",
      "Anchor",
      "Meaning",
      "Memory",
      "Tags",
      "Resonance",
      "Related",
      "Decision",
    ]);
    expect(preview.rows.find((row) => row.label === "Tags")?.value).not.toContain("billy");
    expect(preview.rows.find((row) => row.label === "Related")?.value).toContain("Related memory");
  });

  it("archives and restores scaffold orbs without deleting unrelated queue or approved captures", () => {
    const pending = makeOrb({ id: "pending", status: "pending" });
    const approved = makeOrb({ id: "approved", status: "approved" });
    const keep = makeOrb({ id: "keep", status: "pending" });
    writeScaffoldQueue([pending, keep]);
    writeApprovedOrbs([approved]);

    const afterArchivePending = archiveScaffoldOrb("pending");
    const afterArchiveApproved = archiveScaffoldOrb("approved");

    expect(afterArchivePending.pending.map((orb) => orb.id)).toEqual(["keep"]);
    expect(afterArchiveApproved.approved).toEqual([]);
    expect(readArchivedScaffoldOrbs().map((orb) => orb.id)).toEqual(["approved", "pending"]);

    const afterRestore = restoreScaffoldOrb("pending");

    expect(afterRestore.pending.map((orb) => orb.id)).toEqual(["pending", "keep"]);
    expect(afterRestore.archived.map((orb) => orb.id)).toEqual(["approved"]);
  });
});
