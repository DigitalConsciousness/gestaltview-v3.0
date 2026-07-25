// © 2026 Keith Soyka / GestaltView
import { appFetchJson } from "./appFetch";
import {
  billyCall as legacyBillyCall,
  type ExhibitDomain,
  type SynthesisMode,
} from "./BillyEngine";
import type { TwoPassGravityResult } from "../../../shared/gravity/index.js";

export type BillyConversationMode = "synthesis" | "chat";
export type FounderContinuityState =
  | "founder-active"
  | "founder-eligible-unseeded"
  | "session"
  | "anonymous";

export interface BillySessionMetadata {
  conversationMode?: BillyConversationMode;
  embodimentProfileSlug?: string | null;
  roomSlug?: string | null;
  founderSessionActive?: boolean;
  founderEligible?: boolean;
  founderContinuityState?: FounderContinuityState;
  packageFilter?: string | null;
  contextSources?: number;
  retrievalMode?: "semantic" | "text" | "text-only" | "none";
  memorySources?: number;
  memoryRetrievalMode?: "semantic" | "text" | "text-only" | "none";
  memoryCaptureCandidates?: number;
  memoryCaptured?: number;
  sessionThread?: string | null;
  modePreference?: BillyConversationMode | null;
  serverProvider?: string | null;
  clientRecovery?: "legacy-provider" | "local-fallback" | "none";
  continuityFallback?: "last-known-good" | "none";
  embedBackend?: "gemini" | "ollama" | "huggingface" | null;
  embedModel?: string | null;
  founderContext?: {
    currentState?: string | null;
    sessionThread?: string | null;
    modePreference?: BillyConversationMode | null;
    confirmedAdult?: boolean | null;
  } | null;
  gravity?: BillyGravityTurnMetadata | null;
  symbioCoder?: {
    route: string;
    intent: { primary: string; confidence: number; secondary?: string; signals: string[] };
    emotion: { tone: string; intensity: number; signals: string[]; supportMode: string };
    flow: { state: string; momentum: number; contextDepth: number; suggestedPace: string };
    systemPromptFragmentInjected: boolean;
    userPromptFragmentInjected: boolean;
    analysisMs: number;
  } | null;
  vibeCoder?: {
    score: number;
    alignment: string;
    conceptPreservation: number;
    metaphorBonus: number;
    recommendations: string[];
  } | null;
}

export interface BillyGravityChunkSignal {
  documentId: string;
  filename: string;
  documentType: string | null;
  chunkIndex: number;
  retrievalScore: number | null;
  gravitySignalWeight: number;
  confidence: TwoPassGravityResult["gravity_report"]["confidence"];
  loadBearingClaims: string[];
  actualDelta: string;
}

export interface BillyGravityTurnMetadata {
  protocolVersion: string;
  query: TwoPassGravityResult;
  context: TwoPassGravityResult & {
    rankedChunks: BillyGravityChunkSignal[];
  };
  response: TwoPassGravityResult;
}

export interface BillyApiResponse {
  text: string;
  provider: string;
  metadata?: BillySessionMetadata;
}

interface EnvelopeResponse {
  response: string;
  provider: string;
  metadata?: BillySessionMetadata;
}

const BILLY_LAST_GOOD_CONTINUITY_KEY = "gestaltview:billy:last-good-continuity:v1";

const SECTION_TO_ROOM_SLUG: Record<string, string> = {
  sanctuary: "sanctuary",
  "blackboard-room": "blackboard-room",
  "whiteboard-room": "blackboard-room",
  "dynamic-inner-world": "dynamic-inner-world",
  "external-scaffold": "external-scaffold",
  "creation-corner": "creation-corner",
  "digital-intelligence-academy": "digital-intelligence-academy",
  "embodiment-studio": "embodiment-studio",
  "agent-council": "tribunal",
  tribunal: "tribunal",
  billy: "billy",
};

function normalizeRoomSlug(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized || null;
}

function inferRoomSlugFromSection(sectionId: string): string | null {
  const normalized = sectionId.trim().toLowerCase();
  return SECTION_TO_ROOM_SLUG[normalized] ?? null;
}

function readLastGoodBillyContinuity(): BillySessionMetadata | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(BILLY_LAST_GOOD_CONTINUITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { metadata?: BillySessionMetadata };
    return parsed.metadata ?? null;
  } catch {
    return null;
  }
}

function writeLastGoodBillyContinuity(metadata: BillySessionMetadata | undefined): void {
  if (typeof window === "undefined" || !metadata) {
    return;
  }

  try {
    window.localStorage.setItem(
      BILLY_LAST_GOOD_CONTINUITY_KEY,
      JSON.stringify({
        metadata,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Continuity cache is best-effort only.
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  return {};
}

function mapModeToConversation(mode: SynthesisMode | BillyConversationMode): BillyConversationMode {
  return mode === "chat" ? "chat" : "synthesis";
}

function mapModeToLegacy(mode: SynthesisMode | BillyConversationMode): SynthesisMode {
  if (mode === "loom" || mode === "code") {
    return mode;
  }

  return "synthesize";
}

function buildLegacyRecoveryMetadata(
  conversationMode: BillyConversationMode,
  fallbackProvider: string,
  embodimentProfileSlug: string,
  roomSlug: string | null,
  serverMetadata?: BillySessionMetadata,
  serverProvider?: string
): BillySessionMetadata {
  return {
    ...(serverMetadata || {}),
    conversationMode,
    embodimentProfileSlug,
    roomSlug,
    founderSessionActive: serverMetadata?.founderSessionActive ?? false,
    retrievalMode: serverMetadata?.retrievalMode ?? "none",
    serverProvider: serverProvider || null,
    clientRecovery: fallbackProvider === "local-fallback" ? "local-fallback" : "legacy-provider",
    continuityFallback: serverMetadata ? "last-known-good" : "none",
  };
}

export async function bootstrapBillySession(
  preferredMode: BillyConversationMode = "synthesis",
  embodimentProfileSlug = "billy",
  roomSlug?: string | null
): Promise<BillyApiResponse> {
  const headers = await getAuthHeaders();
  const result = await appFetchJson<EnvelopeResponse>("/api/billy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
      body: JSON.stringify({
        bootstrap: true,
        mode: preferredMode,
        embodimentProfileSlug,
        roomSlug: normalizeRoomSlug(roomSlug),
      }),
    timeoutMs: 9_000,
    retries: 1,
    retryUnsafe: true,
  });

  if (!result.ok) {
    const cachedMetadata = readLastGoodBillyContinuity();
    if (cachedMetadata) {
      return {
        text: "Billy continuity is running from the last known good session state while live persistence is unavailable.",
        provider: "local-continuity-cache",
        metadata: {
          ...cachedMetadata,
          conversationMode: preferredMode,
          embodimentProfileSlug,
          roomSlug: normalizeRoomSlug(roomSlug),
          clientRecovery: "local-fallback",
          continuityFallback: "last-known-good",
        },
      };
    }

    throw new Error(`Billy bootstrap failed: ${result.status ?? result.code}`);
  }

  const data = result.data;
  writeLastGoodBillyContinuity(data.metadata);
  return {
    text: data.response,
    provider: data.provider,
    metadata: data.metadata,
  };
}

export async function callBillyApi(
  userMessage: string,
  sectionId: string,
  mode: SynthesisMode | BillyConversationMode,
  exhibitDomain?: ExhibitDomain,
  embodimentProfileSlug = "billy",
  roomSlug?: string | null
): Promise<BillyApiResponse> {
  const conversationMode = mapModeToConversation(mode);
  const legacyMode = mapModeToLegacy(mode);
  const inferredRoomSlug = normalizeRoomSlug(roomSlug) ?? inferRoomSlugFromSection(sectionId);
  const headers = await getAuthHeaders();

  try {
    const result = await appFetchJson<EnvelopeResponse>("/api/billy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        message: userMessage,
        mode: conversationMode,
        section: sectionId,
        exhibitDomain,
        embodimentProfileSlug,
        roomSlug: inferredRoomSlug,
      }),
      timeoutMs: 12_000,
      retries: 1,
      retryUnsafe: true,
    });

    if (!result.ok) {
      throw new Error(`Billy API request failed: ${result.status ?? result.code}`);
    }

    const data = result.data;
    writeLastGoodBillyContinuity(data.metadata);

    return {
      text: data.response,
      provider: data.provider,
      metadata: data.metadata,
    };
  } catch {
    const cachedMetadata = readLastGoodBillyContinuity();
    const fallback = await legacyBillyCall(
      userMessage,
      sectionId,
      legacyMode,
      exhibitDomain,
      embodimentProfileSlug,
      inferredRoomSlug
    );
    return {
      text: fallback.text,
      provider: fallback.provider,
      metadata: buildLegacyRecoveryMetadata(
        conversationMode,
        fallback.provider,
        embodimentProfileSlug,
        inferredRoomSlug,
        cachedMetadata ?? undefined
      ),
    };
  }
}
