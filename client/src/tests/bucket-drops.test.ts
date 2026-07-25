import { describe, expect, it } from "vitest";
import { createCaptureOrb } from "@/components/Scaffold";
import {
  buildBucketDropCaptureContext,
  bucketDropRecordToOrb,
  mergeBucketDropOrbs,
  type BucketDropServerRecord,
} from "@/lib/bucketDrops";

describe("bucket drop helpers", () => {
  it("builds a capture context that preserves bucket drop metadata", () => {
    const context = buildBucketDropCaptureContext(
      {
        recipient: "Future self",
        releaseDate: "2026-07-01",
        releaseTrigger: "birthday",
        isSealed: true,
      },
      "text",
      "drop-123",
    );

    expect(context).toMatchObject({
      bucketDrop: {
        recipient: "Future self",
        releaseDate: "2026-07-01",
        releaseTrigger: "birthday",
        isSealed: true,
        contentType: "text",
      },
      id: "drop-123",
      source: "typed",
      tags: ["bucket-drop", "text", "sealed"],
    });
  });

  it("hydrates a server row into a bucket drop orb", () => {
    const record: BucketDropServerRecord = {
      id: "drop-123",
      userId: "user-1",
      content: "Keep this note close.",
      rawText: "Keep this note close.",
      captureContext: {
        bucketDrop: {
          recipient: "Future self",
          releaseDate: "2026-07-01",
          releaseTrigger: "birthday",
          isSealed: true,
          contentType: "text",
        },
        source: "typed",
      },
      createdAt: "2026-06-12T00:00:00.000Z",
      intensity: 6,
      plkResonanceScore: 0.72,
      specializedApps: [],
      tags: ["bucket-drop", "text", "sealed"],
      stage: "captured",
      subjectId: null,
      moduleKey: null,
      promotedMemoryId: null,
      scoredAt: null,
      promotedAt: null,
    };

    const orb = bucketDropRecordToOrb(record);

    expect(orb).not.toBeNull();
    expect(orb).toMatchObject({
      id: "drop-123",
      text: "Keep this note close.",
      createdAt: "2026-06-12T00:00:00.000Z",
      metadata: {
        bucketDrop: {
          recipient: "Future self",
          releaseDate: "2026-07-01",
          releaseTrigger: "birthday",
          isSealed: true,
          contentType: "text",
        },
      },
    });
  });

  it("keeps remote bucket drops while preserving local non-bucket captures", () => {
    const localMemo = createCaptureOrb({
      text: "A note that belongs elsewhere",
      source: "typed",
      type: "memory",
      action: "save",
    })!;
    const localBucket = bucketDropRecordToOrb({
      id: "local-drop",
      userId: "user-1",
      content: "Offline bucket drop",
      rawText: "Offline bucket drop",
      captureContext: {
        bucketDrop: {
          recipient: "Future self",
          isSealed: true,
          contentType: "text",
        },
      },
      createdAt: "2026-06-11T00:00:00.000Z",
      intensity: 5,
      plkResonanceScore: 0.5,
      specializedApps: [],
      tags: ["bucket-drop"],
      stage: "captured",
      subjectId: null,
      moduleKey: null,
      promotedMemoryId: null,
      scoredAt: null,
      promotedAt: null,
    })!;
    const remoteBucket = bucketDropRecordToOrb({
      id: "remote-drop",
      userId: "user-1",
      content: "Remote bucket drop",
      rawText: "Remote bucket drop",
      captureContext: {
        bucketDrop: {
          recipient: "Future self",
          isSealed: true,
          contentType: "text",
        },
      },
      createdAt: "2026-06-12T00:00:00.000Z",
      intensity: 7,
      plkResonanceScore: 0.8,
      specializedApps: [],
      tags: ["bucket-drop"],
      stage: "captured",
      subjectId: null,
      moduleKey: null,
      promotedMemoryId: null,
      scoredAt: null,
      promotedAt: null,
    })!;

    const merged = mergeBucketDropOrbs([localMemo, localBucket], [remoteBucket]);

    expect(merged.map((orb) => orb.id)).toEqual(["remote-drop", "local-drop", localMemo.id]);
    expect(merged[0]).toMatchObject({ id: "remote-drop" });
    expect(merged[2]).toMatchObject({ id: localMemo.id });
  });
});
