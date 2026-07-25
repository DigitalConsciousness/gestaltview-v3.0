import { describe, expect, it } from "vitest";

import { PERSONAS, getPersonaBySlug } from "@/data/personas";
import { getEmbodimentHeartbeat } from "@/lib/embodimentHeartbeat";
import { getProfileBySlug } from "@/lib/embodimentRuntime";
import { getPersonaPrompt, getRoomPersona } from "@/lib/personaManager";

describe("persona compatibility adapter", () => {
  it("keeps the blackboard voices grounded in the embodiment registry", () => {
    const billy = getPersonaBySlug("billy");
    const artTeacher = getPersonaBySlug("art-teacher");

    expect(billy?.name).toBe("Billy");
    expect(billy?.atmosphereHue).toBe("#32b8c6");
    expect(billy?.promptTemplate).toContain("Embodiment profile: billy");
    expect(artTeacher?.atmosphereMood).toBe("electric");
    expect(artTeacher?.promptTemplate).toContain("Embodiment profile: art-teacher");
    expect(PERSONAS.map((persona) => persona.slug)).toContain("sanctuary-keeper");
    expect(PERSONAS.map((persona) => persona.slug)).toContain("the-symbiote");
    expect(getPersonaBySlug("the-symbiote")?.name).toBe("The Symbiote");
  });

  it("returns the room-aware embodiment prompt through the manager shim", () => {
    const prompt = getPersonaPrompt("billy", "blackboard-room");
    const roomPersona = getRoomPersona("blackboard");

    expect(roomPersona.slug).toBe("billy");
    expect(prompt).toContain("Embodiment profile: billy");
    expect(prompt).toContain("ROOM CONTEXT");
  });

  it("preserves the Symbiote heartbeat in the client runtime", () => {
    const profile = getProfileBySlug("the-symbiote");
    expect(profile).toBeDefined();

    const heartbeat = getEmbodimentHeartbeat(profile!);

    expect(heartbeat.visualSignature.orbStyle).toBe("pulsing-map");
    expect(heartbeat.chatSignature.layoutMode).toBe("implementation-lane");
    expect(heartbeat.chatSignature.messageFrame).toBe("clean-glass");
    expect(heartbeat.chatSignature.responseRhythm).toBe("direct-then-detail");
  });
});
