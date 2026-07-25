import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "../_lib/cors.js";
import { routeLlm } from "../_lib/llmRouter.js";
import { sendJson, envelope } from "../_lib/response.js";
import { getUserId } from "../_lib/user.js";
import { traceBraintrust } from "../../instrument.js";
import {
  buildEmbodiedChatSystemPrompt,
  resolveEmbodiedChatProfile,
} from "../../shared/embodiment/chat.js";

interface ConsciousnessChatHistoryEntry {
  role?: string;
  content?: string;
  text?: string;
}

interface ConsciousnessChatRequestBody {
  message?: string;
  context?: Record<string, unknown>;
  history?: ConsciousnessChatHistoryEntry[];
  embodimentProfileSlug?: string;
}

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

function normalizeSurface(req: VercelRequest): string {
  const candidate = req.query.surface;

  if (Array.isArray(candidate)) {
    return candidate.join("/");
  }

  return typeof candidate === "string" ? candidate : "";
}

function compactValue(value: unknown, maxLength = 320): string {
  const raw =
    typeof value === "string"
      ? value
      : JSON.stringify(value);

  const normalized = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function formatRuntimeContext(
  context: Record<string, unknown> | undefined
): string[] {
  if (!context) {
    return [];
  }

  return Object.entries(context)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 8)
    .map(([key, value]) => `${key}: ${compactValue(value)}`);
}

function formatHistory(
  history: ConsciousnessChatHistoryEntry[] | undefined
): string[] {
  if (!Array.isArray(history) || history.length === 0) {
    return [];
  }

  return history
    .slice(-6)
    .map((entry) => {
      const role = typeof entry.role === "string" ? entry.role : "message";
      const contentCandidate =
        typeof entry.content === "string"
          ? entry.content
          : typeof entry.text === "string"
          ? entry.text
          : "";
      const content = compactValue(contentCandidate, 240);
      return content ? `${role}: ${content}` : "";
    })
    .filter(Boolean);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-User-Id"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const surface = normalizeSurface(req);
  const body = (req.body ?? {}) as ConsciousnessChatRequestBody;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    sendJson(res, 400, { error: "message is required" });
    return;
  }

  let resolved;
  try {
    resolved = resolveEmbodiedChatProfile(surface, body.embodimentProfileSlug);
  } catch (error) {
    sendJson(res, 404, {
      error: error instanceof Error ? error.message : "Unknown embodied chat surface",
    });
    return;
  }

  const extraContext = [
    ...formatRuntimeContext(body.context),
    ...formatHistory(body.history).map((entry) => `Recent history :: ${entry}`),
  ];

  const systemPrompt = buildEmbodiedChatSystemPrompt(surface, {
    embodimentProfileSlug: body.embodimentProfileSlug,
    extraContext,
  });

  const llm = await traceBraintrust(
    {
      name: `consciousness ${resolved.surface}`,
      type: "task",
      metadata: {
        surface: resolved.surface,
        embodimentProfileSlug: resolved.resolvedEmbodimentSlug,
      },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({
        input: message,
        metadata: {
          surface: resolved.surface,
          embodimentProfileSlug: resolved.resolvedEmbodimentSlug,
        },
      });

      return routeLlm(message, {
        userId: getUserId(req, body as Record<string, unknown>),
        mode: `consciousness:${resolved.surface}`,
        exhibit: resolved.surface,
        systemPrompt,
      });
    },
  );

  const responseBody = {
    ...envelope(llm.response, llm.provider, {
      free: llm.free,
      tokensUsed: llm.tokensUsed ?? null,
      processingTime: llm.processingTime ?? 0,
      metadata: {
        ...(llm.metadata || {}),
        surface: resolved.surface,
        embodimentProfileSlug: resolved.resolvedEmbodimentSlug,
      },
    }),
    content: llm.response,
  };

  sendJson(res, 200, responseBody);
}
