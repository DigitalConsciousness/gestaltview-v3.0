import { callBillyApi, type BillyApiResponse } from "@/lib/billyApi";
import { sendDIMessage } from "@/lib/diApi";
import { getDIProfile, type DIRequest, type DIResponse } from "@shared/di";

export type BlackboardResponderSource = "di-runtime" | "billy";

export type BlackboardResponderResult = {
  text: string;
  source: BlackboardResponderSource;
};

type CallBillyApi = typeof callBillyApi;
type SendDIMessage = typeof sendDIMessage;

type RouteBlackboardResponderInput = {
  message: string;
  personaSlug: string;
  isRoundtable: boolean;
  userTier?: string;
  sendDIMessage?: SendDIMessage;
  callBillyApi?: CallBillyApi;
};

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function buildCapabilityManifest(personaSlug: string): DIRequest["capabilities"] {
  const normalized = personaSlug.trim().toLowerCase();

  if (normalized === "skully" || normalized === "groq-embodiment-expert") {
    return {
      skills: [
        {
          id: "schema-audit",
          label: "Schema auditing",
          summary: "Inspect table coverage, foreign keys, and schema drift without inventing missing structure.",
          source: "DI embodiment",
        },
        {
          id: "seed-planning",
          label: "Seed planning",
          summary: "Design deterministic seed packs that exercise tables safely and incrementally.",
          source: "DI embodiment",
        },
        {
          id: "runtime-growth",
          label: "Runtime growth mapping",
          summary: "Translate live behavior into table, relation, and metric growth opportunities.",
          source: "DI embodiment",
        },
      ],
      tools: [
        {
          id: "supabase-schema-scan",
          label: "Supabase schema scan",
          summary: "Read the live schema, identify empty tables, and prioritize coverage gaps.",
          source: "Supabase",
          inputShape: ["schema snapshot", "seed objective"],
          outputShape: ["coverage report", "seed plan"],
        },
        {
          id: "seed-synthesizer",
          label: "Seed synthesizer",
          summary: "Generate safe insert bundles and fixture shapes for runtime tables.",
          source: "Runtime",
          inputShape: ["target tables", "sample rows", "constraints"],
          outputShape: ["seed SQL", "fixture JSON"],
        },
      ],
      skillCallPolicy: "Call schema and seed skills when the conversation asks for coverage, table growth, or runtime population. Prefer explicit table facts over assumptions.",
      toolCallPolicy: "Only invoke database tools when the selected DI has an explicit schema task, and keep writes additive, reversible, and scoped to the requested tables.",
    };
  }

  return undefined;
}

async function callBillyResponder(
  message: string,
  personaSlug: string,
  callBilly: CallBillyApi,
): Promise<BlackboardResponderResult> {
  const response: BillyApiResponse = await callBilly(
    message,
    "blackboard-room",
    "chat",
    undefined,
    personaSlug,
    "blackboard-room",
  );

  return {
    text: normalizeText(response.text),
    source: "billy",
  };
}

function buildDIRequest(message: string, personaSlug: string, userTier?: string): DIRequest {
  return {
    message,
    diSlug: personaSlug,
    mode: "chat",
    userTier,
    exhibitDomain: "blackboard-room",
    capabilities: buildCapabilityManifest(personaSlug),
  };
}

function responseText(response: DIResponse | null): string {
  return normalizeText(response?.content);
}

export async function routeBlackboardResponder({
  message,
  personaSlug,
  isRoundtable,
  userTier,
  sendDIMessage: sendDI = sendDIMessage,
  callBillyApi: callBilly = callBillyApi,
}: RouteBlackboardResponderInput): Promise<BlackboardResponderResult> {
  if (isRoundtable || !getDIProfile(personaSlug)) {
    return callBillyResponder(message, personaSlug, callBilly);
  }

  try {
    const diResponse = await sendDI(buildDIRequest(message, personaSlug, userTier));
    const text = responseText(diResponse);

    if (text) {
      return {
        text,
        source: "di-runtime",
      };
    }
  } catch {
    // The room must stay responsive if /api/di is unavailable.
  }

  return callBillyResponder(message, personaSlug, callBilly);
}
