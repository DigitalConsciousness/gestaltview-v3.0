import { describe, expect, it, vi } from "vitest";

import {
  isCannedTribunalResponse,
  isTribunalPassSignal,
  retryTribunalResponse,
} from "@/lib/tribunalResponseGuard";

describe("tribunal response guard", () => {
  it("passes the explicit pass signal through without treating it as canned", () => {
    expect(isTribunalPassSignal(" [pass] ")).toBe(true);
    expect(isCannedTribunalResponse(" [pass] ")).toBe(false);
  });

  it("returns silence after exhausting canned fallback retries", async () => {
    vi.useFakeTimers();

    const resultPromise = retryTribunalResponse(
      async () => "[canned fallback detected] try again later",
      { maxRetries: 2, backoffMs: [100, 200] },
    );

    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.text).toBeNull();
    expect(result.exhausted).toBe(true);
    expect(result.attempts).toBe(3);
    vi.useRealTimers();
  });

  it("returns the first clean response", async () => {
    const fetchTurn = vi
      .fn()
      .mockResolvedValueOnce("[canned fallback detected] try again later")
      .mockResolvedValueOnce(
        "A real response with actual substance that is long enough to clear the persona fallback floor and preserve the turn.",
      );

    const result = await retryTribunalResponse(fetchTurn, {
      maxRetries: 2,
      backoffMs: [0, 0],
    });

    expect(result.text).toBe(
      "A real response with actual substance that is long enough to clear the persona fallback floor and preserve the turn.",
    );
    expect(result.exhausted).toBe(false);
    expect(result.attempts).toBe(2);
  });
});
