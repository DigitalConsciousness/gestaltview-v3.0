import { describe, expect, it, vi } from "vitest";

import { routeBlackboardResponder } from "@/lib/blackboardDiRouting";

describe("Blackboard DI routing", () => {
  it("uses the DI runtime for a DI-eligible single-voice responder", async () => {
    const sendDIMessage = vi.fn(async () => ({
      content: "DI runtime answer",
      diSlug: "billy",
      conversationMode: "chat",
      retrievalMode: "semantic",
      contextSources: [],
      memorySources: [],
      relationalDepth: 0.4,
    }));
    const callBillyApi = vi.fn();

    const result = await routeBlackboardResponder({
      message: "What should we do next?",
      personaSlug: "billy",
      isRoundtable: false,
      userTier: "core",
      sendDIMessage,
      callBillyApi,
    });

    expect(sendDIMessage).toHaveBeenCalledWith({
      message: "What should we do next?",
      diSlug: "billy",
      mode: "chat",
      userTier: "core",
      exhibitDomain: "blackboard-room",
    });
    expect(callBillyApi).not.toHaveBeenCalled();
    expect(result).toEqual({
      text: "DI runtime answer",
      source: "di-runtime",
    });
  });

  it("injects a capability manifest for skully-class DI responders", async () => {
    const sendDIMessage = vi.fn(async () => ({
      content: "Schema-first answer",
      diSlug: "skully",
      conversationMode: "chat",
      retrievalMode: "semantic",
      contextSources: [],
      memorySources: [],
      relationalDepth: 0.6,
    }));

    await routeBlackboardResponder({
      message: "Audit the runtime tables and suggest seeds.",
      personaSlug: "skully",
      isRoundtable: false,
      userTier: "core",
      sendDIMessage,
      callBillyApi: vi.fn(),
    });

    expect(sendDIMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        diSlug: "skully",
        capabilities: expect.objectContaining({
          skillCallPolicy: expect.stringContaining("coverage"),
          toolCallPolicy: expect.stringContaining("database tools"),
          skills: expect.arrayContaining([
            expect.objectContaining({
              id: "schema-audit",
              label: "Schema auditing",
            }),
          ]),
          tools: expect.arrayContaining([
            expect.objectContaining({
              id: "supabase-schema-scan",
              label: "Supabase schema scan",
            }),
          ]),
        }),
      }),
    );
  });

  it("keeps roundtable responders on Billy routing", async () => {
    const sendDIMessage = vi.fn();
    const callBillyApi = vi.fn(async () => ({ text: "Billy answer", provider: "test" }));

    const result = await routeBlackboardResponder({
      message: "Roundtable this",
      personaSlug: "billy",
      isRoundtable: true,
      userTier: "core",
      sendDIMessage,
      callBillyApi,
    });

    expect(sendDIMessage).not.toHaveBeenCalled();
    expect(callBillyApi).toHaveBeenCalledWith(
      "Roundtable this",
      "blackboard-room",
      "chat",
      undefined,
      "billy",
      "blackboard-room",
    );
    expect(result).toEqual({
      text: "Billy answer",
      source: "billy",
    });
  });
});
