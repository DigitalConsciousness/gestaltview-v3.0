import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  appendBlueprint,
  BLUEPRINT_EVENT,
  readBlueprints,
  type CaptureBlueprint,
} from "@/components/Scaffold";

const BLUEPRINT: CaptureBlueprint = {
  id: "blackboard-blueprint-1",
  title: "Blackboard Summary",
  summary: "A blueprint sent from the Blackboard Room.",
  sourceOrbIds: ["capture-1"],
  captureCount: 1,
  tags: ["blackboard"],
  status: "ready",
  createdAt: "2026-07-25T00:00:00.000Z",
  updatedAt: "2026-07-25T00:00:00.000Z",
  outputs: {
    markdown: "# Blackboard Summary",
    html: "",
    code: "",
    agentPrompt: "",
    imagePrompt: "",
    marketingCopy: "",
    shareCard: "",
    pdfHtml: "",
  },
};

describe("Creation Corner blueprint handoff", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    const dispatchEvent = vi.fn();

    vi.stubGlobal(
      "CustomEvent",
      class<T> {
        type: string;
        detail: T;

        constructor(type: string, init?: CustomEventInit<T>) {
          this.type = type;
          this.detail = init?.detail as T;
        }
      },
    );
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
      dispatchEvent,
      setTimeout,
      clearTimeout,
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));
  });

  it("persists the blueprint and identifies it as the active handoff", () => {
    appendBlueprint(BLUEPRINT);

    expect(readBlueprints()[0]?.id).toBe(BLUEPRINT.id);
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: BLUEPRINT_EVENT,
        detail: { blueprintId: BLUEPRINT.id },
      }),
    );
  });
});
