import { describe, expect, it } from "vitest";
import { mergeSanctuaryRecords } from "./contracts";

describe("mergeSanctuaryRecords", () => {
  it("retains local-only and remote-only records", () => {
    const result = mergeSanctuaryRecords(
      [{ id: "local", updatedAt: "2026-07-30T01:00:00.000Z" }],
      [{ id: "remote", updatedAt: "2026-07-30T02:00:00.000Z" }],
    );
    expect(result.records.map((record) => record.id)).toEqual([
      "remote",
      "local",
    ]);
    expect(result.conflicts).toEqual([]);
  });

  it("keeps the latest visible version and both recoverable conflict versions", () => {
    const local = {
      id: "journal-1",
      content: "local words",
      updatedAt: "2026-07-30T03:00:00.000Z",
    };
    const remote = {
      id: "journal-1",
      content: "remote words",
      updatedAt: "2026-07-30T02:00:00.000Z",
    };
    const result = mergeSanctuaryRecords([local], [remote]);
    expect(result.records).toEqual([local]);
    expect(result.conflicts[0]).toMatchObject({
      sourceRef: "journal-1",
      local,
      remote,
    });
  });
});
