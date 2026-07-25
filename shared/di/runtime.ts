import { buildEmbodimentSystemPrompt } from "../embodiment/index.js";
import type { DIProfile, DICapabilityManifest, DISessionContext } from "./types.js";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function formatMemoryEntry(entry: DIProfile["livingMemory"][number]): string {
  const significance = toFiniteNumber(entry.significance, 0);
  const retrievalWeight = toFiniteNumber(entry.retrievalWeight, 0);

  return [
    `[${normalizeText(entry.domain) || "general"}]`,
    normalizeText(entry.memoryType) || "memory",
    `weight=${retrievalWeight.toFixed(2)}`,
    `significance=${significance.toFixed(2)}`,
    normalizeText(entry.content),
  ]
    .filter(Boolean)
    .join(" ");
}

function formatQuirkActivations(quirkActivations?: Record<string, number>): string {
  const entries = Object.entries(quirkActivations ?? {})
    .filter(([, value]) => Number.isFinite(Number(value)))
    .map(([key, value]) => `${key}=${Number(value)}`)
    .sort((left, right) => left.localeCompare(right));

  return entries.length > 0 ? entries.join(", ") : "none";
}

function readFounderContextValue(founderCtx: Record<string, unknown> | null | undefined, keys: string[]): string {
  if (!founderCtx) {
    return "";
  }

  for (const key of keys) {
    const value = founderCtx[key];
    const text = normalizeText(value);
    if (text) {
      return text;
    }
  }

  return "";
}

function renderCapabilityBlock(capabilities?: DICapabilityManifest): string {
  const skillLines = (capabilities?.skills ?? [])
    .map((skill) => `- ${skill.label}: ${skill.summary}${skill.source ? ` (${skill.source})` : ""}`)
    .join("\n");
  const toolLines = (capabilities?.tools ?? [])
    .map((tool) => `- ${tool.label}: ${tool.summary}${tool.source ? ` (${tool.source})` : ""}`)
    .join("\n");

  if (!skillLines && !toolLines && !capabilities?.toolCallPolicy && !capabilities?.skillCallPolicy) {
    return "";
  }

  return [
    "CAPABILITY MANIFEST",
    skillLines ? ["SKILLS", skillLines].join("\n") : "",
    toolLines ? ["TOOLS", toolLines].join("\n") : "",
    capabilities?.skillCallPolicy ? `SKILL CALL POLICY\n${capabilities.skillCallPolicy}` : "",
    capabilities?.toolCallPolicy ? `TOOL CALL POLICY\n${capabilities.toolCallPolicy}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildDIContextBlock(fragments: string[], memories: string[]): string {
  const fragmentBlock = fragments.length > 0 ? fragments.join("\n") : "No matching fragments were found.";
  const memoryBlock = memories.length > 0 ? memories.join("\n") : "No recalled memories were attached.";

  return [
    "=== DI CONTEXT ===",
    "KNOWLEDGE FRAGMENTS:",
    fragmentBlock,
    "",
    "LIVING MEMORIES:",
    memoryBlock,
  ].join("\n");
}

export function buildDISystemPrompt(
  profile: DIProfile,
  sessionCtx: DISessionContext,
  founderCtx?: Record<string, unknown> | null
): string {
  const livingMemoryLines = [...(profile.livingMemory ?? [])]
    .sort((left, right) => toFiniteNumber(right.retrievalWeight) - toFiniteNumber(left.retrievalWeight))
    .slice(0, 5)
    .map((entry) => `- ${formatMemoryEntry(entry)}`)
    .join("\n");

  const founderCurrentState = readFounderContextValue(founderCtx, ["currentState", "current_state"]);
  const founderSessionThread = readFounderContextValue(founderCtx, ["sessionThread", "session_thread"]);
  const founderModePreference = readFounderContextValue(founderCtx, ["modePreference", "mode_preference"]);
  const founderLastSessionAt = readFounderContextValue(founderCtx, ["lastSessionAt", "last_session_at"]);
  const capabilityBlock = renderCapabilityBlock(sessionCtx.capabilities);

  const basePrompt = buildEmbodimentSystemPrompt(profile, {
    role: "digital intelligence runtime inside GestaltView",
    audience: "someone engaging a live DI surface for reflection, synthesis, or continuity",
    responseContract: [
      "Lead with the most useful truthful thing.",
      "Hold continuity with living memory and the current session thread.",
      "Preserve the user's language where possible.",
      "Do not collapse the selected embodiment into a generic assistant persona.",
    ],
    runtimeDirectives: [
      "Use the canonical embodiment profile as the identity source.",
      "Treat session continuity as a live signal, not a static prompt decoration.",
      "Do not invent a second identity model or overwrite canonical profile data here.",
    ],
  });

  return [
    basePrompt,
    "",
    "FOUNDATIONAL TRUTH",
    profile.immutableCore.foundationalTruth,
    "",
    "LIVING MEMORIES",
    livingMemoryLines || "No living memories yet.",
    "",
    "CONTINUITY THREAD",
    sessionCtx.sessionThread?.trim() || "No continuity thread yet.",
    "",
    `RELATIONAL DEPTH: ${sessionCtx.relationalDepth.toFixed(2)}`,
    `QUIRK ACTIVATIONS: ${formatQuirkActivations(sessionCtx.quirkActivations)}`,
    sessionCtx.modePreference ? `MODE PREFERENCE: ${sessionCtx.modePreference}` : "MODE PREFERENCE: none",
    sessionCtx.lastSessionAt ? `LAST SESSION AT: ${sessionCtx.lastSessionAt}` : "LAST SESSION AT: none",
    sessionCtx.userId ? `USER ID: ${sessionCtx.userId}` : "USER ID: unknown",
    "",
    founderCtx
      ? [
          "FOUNDER CONTEXT ACTIVE: YES",
          founderCurrentState ? `Current state: ${founderCurrentState}` : "Current state: none",
          founderSessionThread ? `Session thread: ${founderSessionThread}` : "Session thread: none",
          founderModePreference ? `Mode preference: ${founderModePreference}` : "Mode preference: none",
          founderLastSessionAt ? `Last session at: ${founderLastSessionAt}` : "Last session at: none",
        ].join("\n")
      : "FOUNDER CONTEXT ACTIVE: NO",
    "",
    capabilityBlock || "CAPABILITY MANIFEST: none",
  ].join("\n");
}

export function buildDIBootstrapPrompt(profile: DIProfile, sessionCtx: DISessionContext): string {
  return [
    `Start a fresh conversation as ${profile.publicName}.`,
    `Use the ${profile.immutableCore.voiceTone} voice without mentioning that this is a bootstrap turn.`,
    sessionCtx.relationalDepth < 0.2
      ? "Open in a welcoming first-meeting register."
      : "Open in the current relational register and continue continuity naturally.",
  ].join(" ");
}

export function buildDIMessages(
  query: string,
  profile: DIProfile,
  fragments: string[],
  memories: string[],
  sessionCtx: DISessionContext,
  founderCtx?: Record<string, unknown> | null
): { role: "system" | "user"; content: string }[] {
  const systemPrompt = buildDISystemPrompt(profile, sessionCtx, founderCtx);
  const contextBlock = buildDIContextBlock(fragments, memories);
  const userTurn = normalizeText(query);

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `${contextBlock}\n\nUser message: ${userTurn}`.trim(),
    },
  ];
}
