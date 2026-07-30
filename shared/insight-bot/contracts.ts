/**
 * Stable boundary between public Insight-Bot channel adapters and GestaltView.
 * This contract intentionally contains no provider-specific or platform SDK types.
 */

export const INSIGHT_BOT_SCHEMA_VERSION = "2026-07-29" as const;

export const INSIGHT_CHANNELS = [
  "reddit",
  "discord",
  "web",
  "devvit",
  "api",
] as const;
export const INSIGHT_MODES = [
  "respond",
  "reflect",
  "capture",
  "artifact",
] as const;
export const INSIGHT_VISIBILITIES = ["public", "private", "internal"] as const;

export type InsightChannel = (typeof INSIGHT_CHANNELS)[number];
export type InsightMode = (typeof INSIGHT_MODES)[number];
export type InsightVisibility = (typeof INSIGHT_VISIBILITIES)[number];

export interface InsightRuntimeRequest {
  schemaVersion: typeof INSIGHT_BOT_SCHEMA_VERSION;
  requestId: string;
  source: {
    channel: InsightChannel;
    externalMessageId?: string;
    externalConversationId?: string;
    externalUserId?: string;
    subreddit?: string;
    guildId?: string;
    originUrl?: string;
    visibility: InsightVisibility;
  };
  context: {
    originalText: string;
    displayName?: string;
    mode?: InsightMode;
    energyLevel?: number;
    userState?: string;
    publicContextOnly: boolean;
    requestedCapabilities?: string[];
  };
  consent: {
    allowCapture: boolean;
    allowArtifactProposal: boolean;
    allowMemoryUse: boolean;
  };
}

export interface InsightRuntimeResponse {
  schemaVersion: typeof INSIGHT_BOT_SCHEMA_VERSION;
  requestId: string;
  content: string;
  trace: {
    traceId: string;
    provider?: string;
    route?: string;
    generatedAt: string;
    uncertainty?: "low" | "medium" | "high" | "unknown";
    limitations?: string[];
  };
  actions?: Array<
    | {
        kind: "capture";
        status: "proposed";
        originalText: string;
        suggestedContext?: string;
        suggestedAnchor?: string;
        requiresUserApproval: true;
      }
    | {
        kind: "artifact";
        status: "proposed";
        title: string;
        body: string;
        sourceRequestId: string;
        requiresUserApproval: true;
      }
  >;
  safety?: {
    crisisDetected: boolean;
    humanSupportRecommended?: boolean;
    publicPostingAllowed: boolean;
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseInsightRuntimeRequest(value: unknown): InsightRuntimeRequest {
  if (!isObject(value)) throw new Error("Request body must be an object");
  if (value.schemaVersion !== INSIGHT_BOT_SCHEMA_VERSION) {
    throw new Error("Unsupported Insight-Bot schema version");
  }
  if (typeof value.requestId !== "string" || !value.requestId.trim()) {
    throw new Error("requestId is required");
  }
  if (!isObject(value.source) || !isObject(value.context) || !isObject(value.consent)) {
    throw new Error("source, context, and consent are required");
  }
  if (!INSIGHT_CHANNELS.includes(value.source.channel as InsightChannel)) {
    throw new Error("Unsupported source channel");
  }
  if (!INSIGHT_VISIBILITIES.includes(value.source.visibility as InsightVisibility)) {
    throw new Error("Unsupported source visibility");
  }
  if (
    typeof value.context.originalText !== "string" ||
    !value.context.originalText.trim()
  ) {
    throw new Error("context.originalText is required");
  }
  if (value.context.originalText.length > 20_000) {
    throw new Error("context.originalText exceeds 20000 characters");
  }
  if (value.context.publicContextOnly !== true) {
    throw new Error("Insight-Bot requires publicContextOnly");
  }
  if (
    value.context.mode !== undefined &&
    !INSIGHT_MODES.includes(value.context.mode as InsightMode)
  ) {
    throw new Error("Unsupported context mode");
  }
  for (const key of ["allowCapture", "allowArtifactProposal", "allowMemoryUse"]) {
    if (typeof value.consent[key] !== "boolean") {
      throw new Error(`consent.${key} must be boolean`);
    }
  }
  if (value.consent.allowMemoryUse) {
    throw new Error("Insight-Bot cannot use private runtime memory");
  }
  return value as unknown as InsightRuntimeRequest;
}

export function assertInsightRuntimeResponse(
  value: unknown,
): asserts value is InsightRuntimeResponse {
  if (!isObject(value)) throw new Error("Runtime response must be an object");
  if (value.schemaVersion !== INSIGHT_BOT_SCHEMA_VERSION) {
    throw new Error("Unsupported runtime response schema");
  }
  if (
    typeof value.requestId !== "string" ||
    typeof value.content !== "string" ||
    !isObject(value.trace) ||
    typeof value.trace.traceId !== "string" ||
    typeof value.trace.generatedAt !== "string"
  ) {
    throw new Error("Runtime response is missing required content or trace fields");
  }
}

export function toPublicInsightResponse(
  response: InsightRuntimeResponse,
): InsightRuntimeResponse {
  return {
    ...response,
    actions: response.actions?.filter((action) => action.kind !== "artifact"),
  };
}
