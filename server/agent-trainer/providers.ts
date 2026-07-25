import { z } from "zod";
import { traceBraintrust } from "../../instrument.js";

import type {
  ProviderKind,
  RoutingPolicy,
  TaskClass,
} from "../../shared/agent-trainer/schemas.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface ChatResult {
  text: string;
  providerSlug: string;
  modelSlug: string;
  latencyMs: number;
  tokensUsed: number | null;
  raw: unknown;
}

export interface StructuredRequest<T> extends ChatRequest {
  schema: z.ZodType<T>;
  schemaName: string;
}

export interface HealthStatus {
  healthy: boolean;
  checkedAt: string;
  message: string;
}

export interface CostEstimate {
  estimatedUsd: number;
  tokenEstimate: number | null;
  basis: string;
}

export interface RegisteredModel {
  providerId?: string | null;
  modelId?: string | null;
  providerSlug: string;
  modelSlug: string;
  apiName: string;
  kind: ProviderKind;
  baseUrl: string;
  supportsStructured: boolean;
  supportsTools: boolean;
  supportsEmbeddings: boolean;
  contextWindow: number | null;
  speedTier: number;
  costTier: number;
  localFirst: boolean;
  enabled: boolean;
  metadata: Record<string, unknown>;
}

export interface ModelAdapter {
  id: string;
  kind: ProviderKind;
  chat(request: ChatRequest, model: RegisteredModel): Promise<ChatResult>;
  structured<T>(request: StructuredRequest<T>, model: RegisteredModel): Promise<T>;
  health(model: RegisteredModel): Promise<HealthStatus>;
  estimate(request: ChatRequest, model: RegisteredModel): Promise<CostEstimate>;
}

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function nowIso(): string {
  return new Date().toISOString();
}

function estimateTokens(messages: ChatMessage[]): number {
  const text = messages.map((message) => message.content).join("\n");
  return Math.max(1, Math.ceil(text.length / 4));
}

function extractJsonBlock(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1];
  if (fenced) return fenced.trim();

  const objectMatch = text.match(/\{[\s\S]*\}$/);
  if (objectMatch) return objectMatch[0].trim();

  return text.trim();
}

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

async function traceModelCall<T>(
  spanName: string,
  metadata: Record<string, unknown>,
  callback: (span: BraintrustSpan | null) => Promise<T>,
): Promise<T> {
  return traceBraintrust(
    {
      name: spanName,
      type: "llm",
      metadata,
    },
    callback,
  );
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = 45_000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

class OfflineAdapter implements ModelAdapter {
  id = "offline";
  kind = "offline" as const;

  async chat(request: ChatRequest, model: RegisteredModel): Promise<ChatResult> {
    const startedAt = Date.now();
    const lastUserMessage =
      [...request.messages].reverse().find((message) => message.role === "user")?.content ??
      "No user prompt provided.";

    return {
      text: [
        "Offline trainer fallback.",
        "Use deterministic scaffolding rather than trusting this as a final model answer.",
        lastUserMessage.slice(0, 500),
      ].join("\n\n"),
      providerSlug: model.providerSlug,
      modelSlug: model.modelSlug,
      latencyMs: Date.now() - startedAt,
      tokensUsed: null,
      raw: { offline: true },
    };
  }

  async structured<T>(request: StructuredRequest<T>, _model: RegisteredModel): Promise<T> {
    throw new Error(`Offline adapter cannot synthesize ${request.schemaName}.`);
  }

  async health(): Promise<HealthStatus> {
    return {
      healthy: true,
      checkedAt: nowIso(),
      message: "Offline fallback available.",
    };
  }

  async estimate(request: ChatRequest): Promise<CostEstimate> {
    return {
      estimatedUsd: 0,
      tokenEstimate: estimateTokens(request.messages),
      basis: "Offline deterministic fallback.",
    };
  }
}

class GroqAdapter implements ModelAdapter {
  id = "groq";
  kind = "groq" as const;

  async chat(request: ChatRequest, model: RegisteredModel): Promise<ChatResult> {
    const apiKey = envValue("GROQ_API_KEY", "VITE_GROQ_API_KEY", "VITE_GROK_API_KEY");
    if (!apiKey) {
      throw new Error("Missing GROQ_API_KEY.");
    }

    return traceModelCall(
      `trainer groq chat ${model.modelSlug}`,
      { provider: model.providerSlug, model: model.modelSlug, kind: model.kind },
      async (span) => {
        span?.log({
          input: request.messages,
          metadata: {
            temperature: request.temperature ?? 0.3,
            maxTokens: request.maxTokens ?? 1800,
            timeoutMs: request.timeoutMs,
          },
        });

        const startedAt = Date.now();
        const response = await fetchWithTimeout(
          `${model.baseUrl.replace(/\/+$/, "")}/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: model.apiName,
              messages: request.messages,
              temperature: request.temperature ?? 0.3,
              max_tokens: request.maxTokens ?? 1800,
            }),
          },
          request.timeoutMs
        );

        if (!response.ok) {
          throw new Error(`Groq chat failed: ${response.status} ${await response.text()}`);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { total_tokens?: number };
        };
        const text = data.choices?.[0]?.message?.content?.trim() || "";

        if (!text) {
          throw new Error("Groq returned an empty response.");
        }

        const result = {
          text,
          providerSlug: model.providerSlug,
          modelSlug: model.modelSlug,
          latencyMs: Date.now() - startedAt,
          tokensUsed: data.usage?.total_tokens ?? null,
          raw: data,
        };

        span?.log({
          output: text,
          metrics: { tokens: result.tokensUsed ?? undefined, latency_ms: result.latencyMs },
          metadata: { provider: model.providerSlug, model: model.modelSlug, status: "success" },
        });

        return result;
      },
    );
  }

  async structured<T>(request: StructuredRequest<T>, model: RegisteredModel): Promise<T> {
    const prompt = [
      ...request.messages,
      {
        role: "user" as const,
        content: [
          `Return only valid JSON matching the ${request.schemaName} schema.`,
          "Do not wrap the response in prose.",
        ].join("\n"),
      },
    ];

    const response = await this.chat({ ...request, messages: prompt }, model);
    const parsed = JSON.parse(extractJsonBlock(response.text));
    return request.schema.parse(parsed);
  }

  async health(model: RegisteredModel): Promise<HealthStatus> {
    if (!envValue("GROQ_API_KEY", "VITE_GROQ_API_KEY", "VITE_GROK_API_KEY")) {
      return {
        healthy: false,
        checkedAt: nowIso(),
        message: "Missing GROQ_API_KEY.",
      };
    }

    return {
      healthy: true,
      checkedAt: nowIso(),
      message: `Groq model ${model.apiName} available.`,
    };
  }

  async estimate(request: ChatRequest, model: RegisteredModel): Promise<CostEstimate> {
    const tokenEstimate = estimateTokens(request.messages);
    return {
      estimatedUsd: Number((tokenEstimate * Math.max(model.costTier, 1) * 0.0000025).toFixed(6)),
      tokenEstimate,
      basis: "Heuristic token estimate for Groq-compatible chat completion.",
    };
  }
}

class OllamaAdapter implements ModelAdapter {
  id = "ollama";
  kind = "ollama" as const;

  async chat(request: ChatRequest, model: RegisteredModel): Promise<ChatResult> {
    return traceModelCall(
      `trainer ollama chat ${model.modelSlug}`,
      { provider: model.providerSlug, model: model.modelSlug, kind: model.kind },
      async (span) => {
        span?.log({
          input: request.messages,
          metadata: {
            temperature: request.temperature ?? 0.2,
            maxTokens: request.maxTokens ?? 1600,
            timeoutMs: request.timeoutMs,
          },
        });

        const startedAt = Date.now();
        const response = await fetchWithTimeout(
          `${model.baseUrl.replace(/\/+$/, "")}/api/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: model.apiName,
              messages: request.messages,
              stream: false,
              options: {
                temperature: request.temperature ?? 0.2,
                num_predict: request.maxTokens ?? 1600,
              },
            }),
          },
          request.timeoutMs
        );

        if (!response.ok) {
          throw new Error(`Ollama chat failed: ${response.status} ${await response.text()}`);
        }

        const data = (await response.json()) as {
          message?: { content?: string };
          prompt_eval_count?: number;
          eval_count?: number;
        };

        const text = data.message?.content?.trim() || "";
        if (!text) {
          throw new Error("Ollama returned an empty response.");
        }

        const result = {
          text,
          providerSlug: model.providerSlug,
          modelSlug: model.modelSlug,
          latencyMs: Date.now() - startedAt,
          tokensUsed:
            (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0) > 0
              ? (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0)
              : null,
          raw: data,
        };

        span?.log({
          output: text,
          metrics: { tokens: result.tokensUsed ?? undefined, latency_ms: result.latencyMs },
          metadata: { provider: model.providerSlug, model: model.modelSlug, status: "success" },
        });

        return result;
      },
    );
  }

  async structured<T>(request: StructuredRequest<T>, model: RegisteredModel): Promise<T> {
    return traceModelCall(
      `trainer ollama structured ${model.modelSlug}`,
      { provider: model.providerSlug, model: model.modelSlug, kind: model.kind, schemaName: request.schemaName },
      async (span) => {
        span?.log({
          input: request.messages,
          metadata: {
            temperature: request.temperature ?? 0.2,
            maxTokens: request.maxTokens ?? 1800,
            timeoutMs: request.timeoutMs,
            schemaName: request.schemaName,
          },
        });

        const startedAt = Date.now();
        const response = await fetchWithTimeout(
          `${model.baseUrl.replace(/\/+$/, "")}/api/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: model.apiName,
              messages: request.messages,
              stream: false,
              format: z.toJSONSchema(request.schema, { target: "draft-7" }),
              options: {
                temperature: request.temperature ?? 0.2,
                num_predict: request.maxTokens ?? 1800,
              },
            }),
          },
          request.timeoutMs
        );

        if (!response.ok) {
          throw new Error(`Ollama structured call failed: ${response.status} ${await response.text()}`);
        }

        const data = (await response.json()) as {
          message?: { content?: string };
        };

        const content = data.message?.content?.trim() || "";
        if (!content) {
          throw new Error(`Ollama returned empty ${request.schemaName} output.`);
        }

        try {
          const parsed = request.schema.parse(JSON.parse(content));
          span?.log({
            output: parsed,
            metrics: { latency_ms: Date.now() - startedAt },
            metadata: {
              provider: model.providerSlug,
              model: model.modelSlug,
              status: "success",
              schemaName: request.schemaName,
            },
          });
          return parsed;
        } catch (error) {
          throw new Error(
            `Ollama returned invalid ${request.schemaName}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      },
    );
  }

  async health(model: RegisteredModel): Promise<HealthStatus> {
    try {
      const response = await fetchWithTimeout(
        `${model.baseUrl.replace(/\/+$/, "")}/api/tags`,
        {
          method: "GET",
        },
        5_000
      );

      return {
        healthy: response.ok,
        checkedAt: nowIso(),
        message: response.ok ? `Ollama reachable for ${model.apiName}.` : `Ollama returned ${response.status}.`,
      };
    } catch (error) {
      return {
        healthy: false,
        checkedAt: nowIso(),
        message: error instanceof Error ? error.message : "Ollama health check failed.",
      };
    }
  }

  async estimate(request: ChatRequest): Promise<CostEstimate> {
    return {
      estimatedUsd: 0,
      tokenEstimate: estimateTokens(request.messages),
      basis: "Local Ollama execution.",
    };
  }
}

export function defaultModelCatalog(): RegisteredModel[] {
  const models: RegisteredModel[] = [];

  const ollamaUrl = envValue("BILLY_OLLAMA_URL", "OLLAMA_BASE_URL", "OLLAMA_HOST", "OLLAMA_URL");
  if (ollamaUrl) {
    models.push({
      providerSlug: "ollama",
      modelSlug: envValue("TRAINER_OLLAMA_MODEL") || "qwen2.5:7b-instruct",
      apiName: envValue("TRAINER_OLLAMA_MODEL") || "qwen2.5:7b-instruct",
      kind: "ollama",
      baseUrl: ollamaUrl,
      supportsStructured: true,
      supportsTools: false,
      supportsEmbeddings: false,
      contextWindow: 32768,
      speedTier: 2,
      costTier: 1,
      localFirst: true,
      enabled: true,
      metadata: {},
    });
  }

  if (envValue("GROQ_API_KEY", "VITE_GROQ_API_KEY", "VITE_GROK_API_KEY")) {
    const model = envValue("GROQ_MODEL", "TRAINER_GROQ_MODEL") || "llama-3.3-70b-versatile";
    models.push({
      providerSlug: "groq",
      modelSlug: model,
      apiName: model,
      kind: "groq",
      baseUrl: "https://api.groq.com/openai/v1",
      supportsStructured: true,
      supportsTools: false,
      supportsEmbeddings: false,
      contextWindow: 32768,
      speedTier: 3,
      costTier: 2,
      localFirst: false,
      enabled: true,
      metadata: {},
    });
  }

  models.push({
    providerSlug: "offline",
    modelSlug: "deterministic-fallback",
    apiName: "deterministic-fallback",
    kind: "offline",
    baseUrl: "",
    supportsStructured: false,
    supportsTools: false,
    supportsEmbeddings: false,
    contextWindow: null,
    speedTier: 5,
    costTier: 0,
    localFirst: true,
    enabled: true,
    metadata: {},
  });

  return models;
}

function adapterForKind(kind: ProviderKind): ModelAdapter {
  if (kind === "ollama") return new OllamaAdapter();
  if (kind === "groq") return new GroqAdapter();
  return new OfflineAdapter();
}

export function scoreModelForTask(
  model: RegisteredModel,
  taskClass: TaskClass,
  policy: RoutingPolicy,
  schemaFailures = 0
): number {
  const structuredRequired =
    taskClass === "structured_generation" ||
    taskClass === "evaluation_judge" ||
    taskClass === "safety_review";

  const capabilityMatch = structuredRequired ? Number(model.supportsStructured) : 1;
  const localPreference = policy.preferLocal && model.localFirst ? 1 : 0;
  const speedScore = Math.max(0, 5 - model.speedTier);
  const costScore = Math.max(0, 5 - model.costTier);
  const healthScore = model.enabled ? 1 : 0;
  const schemaFailurePenalty = structuredRequired ? schemaFailures : 0;

  return capabilityMatch * 5 + localPreference * 3 + healthScore * 2 + speedScore * 2 + costScore * 2 - schemaFailurePenalty * 4;
}

export class ModelGateway {
  constructor(
    private readonly models: RegisteredModel[],
    private readonly policy: RoutingPolicy
  ) {}

  listModels(): RegisteredModel[] {
    return this.models.filter((model) => model.enabled);
  }

  selectModel(taskClass: TaskClass, schemaFailures: Record<string, number> = {}): RegisteredModel {
    const enabled = this.listModels();
    const sorted = enabled
      .map((model) => ({
        model,
        score: scoreModelForTask(model, taskClass, this.policy, schemaFailures[`${taskClass}:${model.modelSlug}`] ?? 0),
      }))
      .sort((a, b) => b.score - a.score);

    return sorted[0]?.model ?? defaultModelCatalog().find((model) => model.kind === "offline")!;
  }

  async health(taskClass: TaskClass): Promise<HealthStatus> {
    const model = this.selectModel(taskClass);
    return adapterForKind(model.kind).health(model);
  }

  async chat(taskClass: TaskClass, request: ChatRequest): Promise<ChatResult> {
    const model = this.selectModel(taskClass);
    return adapterForKind(model.kind).chat(request, model);
  }

  async structured<T>(taskClass: TaskClass, request: StructuredRequest<T>): Promise<{
    value: T;
    model: RegisteredModel;
  }> {
    const model = this.selectModel(taskClass);
    const value = await adapterForKind(model.kind).structured(request, model);
    return { value, model };
  }

  async estimate(taskClass: TaskClass, request: ChatRequest): Promise<CostEstimate> {
    const model = this.selectModel(taskClass);
    return adapterForKind(model.kind).estimate(request, model);
  }
}
