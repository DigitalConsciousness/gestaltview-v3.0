import { describe, expect, it } from "vitest";
import type {
  EmbodimentChatSignature,
  EmbodimentUIPresence,
  EmbodimentVisualSignature,
} from "./types.js";

const symbioteChatSignature = {
  layoutMode: "implementation-lane",
  messageFrame: "clean-glass",
  responseRhythm: "direct-then-detail",
} satisfies EmbodimentChatSignature;

const symbioteVisualSignature = {
  orbStyle: "pulsing-map",
} satisfies EmbodimentVisualSignature;

const symbioteUiPresence = {
  orbPulseStyle: "steady",
} satisfies EmbodimentUIPresence;

describe("embodiment profile contract", () => {
  it("admits the canonical Symbiote presentation tokens", () => {
    expect(symbioteChatSignature.layoutMode).toBe("implementation-lane");
    expect(symbioteChatSignature.messageFrame).toBe("clean-glass");
    expect(symbioteChatSignature.responseRhythm).toBe("direct-then-detail");
    expect(symbioteVisualSignature.orbStyle).toBe("pulsing-map");
    expect(symbioteUiPresence.orbPulseStyle).toBe("steady");
  });
});
