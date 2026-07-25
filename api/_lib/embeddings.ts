// api/_lib/embeddings.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// Shared embedding helper for Billy retrieval and persistent memory indexing.

import { traceBraintrust } from "../../instrument.js";

export type EmbedBackend = "gemini" | "ollama" | "huggingface" | null;

export interface EmbedResult {
  embedding: number[] | null;
  backend: EmbedBackend;
  model: string | null;
}

const GEMINI_EMBED_MODEL = "text-embedding-004";
const HUGGINGFACE_EMBED_MODEL = "google/embeddinggemma-300m";

function getExpectedEmbeddingDimensions(): number | null {
  const raw = process.env.BILLY_EMBED_DIMENSIONS;
  if (!raw?.trim()) return null;

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function extractEmbeddingVector(payload: unknown): number[] | null {
  if (Array.isArray(payload)) {
    if (payload.every((value) => typeof value === "number")) {
      return payload as number[];
    }

    const firstRow = payload[0];
    if (Array.isArray(firstRow) && firstRow.every((value) => typeof value === "number")) {
      return firstRow as number[];
    }

    return null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  return (
    extractEmbeddingVector(record.embedding) ||
    extractEmbeddingVector(record.embeddings) ||
    extractEmbeddingVector(record.data)
  );
}

function normalizeEmbedding(embedding: number[] | null): number[] | null {
  if (!embedding || embedding.length === 0) return null;

  const expectedDimensions = getExpectedEmbeddingDimensions();
  if (expectedDimensions && embedding.length !== expectedDimensions) {
    return null;
  }

  const norm = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(norm) || norm === 0) {
    return embedding;
  }

  return embedding.map((value) => value / norm);
}

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

async function embedWithGemini(text: string): Promise<EmbedResult> {
  const apiKey =
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    "";

  if (!apiKey || !text.trim()) {
    return { embedding: null, backend: "gemini", model: GEMINI_EMBED_MODEL };
  }

  const model = GEMINI_EMBED_MODEL;
  return traceBraintrust(
    {
      name: "gemini embedding call",
      type: "task",
      metadata: { backend: "gemini", model },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({ input: text, metadata: { backend: "gemini", model } });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: `models/${model}`,
            content: { parts: [{ text }] },
          }),
        }
      );

      if (!response.ok) {
        const result = { embedding: null, backend: "gemini" as const, model };
        span?.log({ metadata: { ...result, status: "error", httpStatus: response.status } });
        return result;
      }

      const payload = (await response.json()) as { embedding?: { values?: number[] } };
      const result = {
        embedding: normalizeEmbedding(payload.embedding?.values ?? null),
        backend: "gemini" as const,
        model,
      };
      span?.log({ output: result.embedding?.length ?? 0, metadata: { ...result, status: "success" } });
      return result;
    },
  );
}

async function embedWithOllama(text: string): Promise<EmbedResult> {
  const baseUrl = (process.env.BILLY_OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
  const model = process.env.BILLY_EMBED_MODEL || "embeddinggemma";
  return traceBraintrust(
    {
      name: "ollama embedding call",
      type: "task",
      metadata: { backend: "ollama", model, baseUrl },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({ input: text, metadata: { backend: "ollama", model, baseUrl } });

      const response = await fetch(`${baseUrl}/api/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          input: text,
        }),
      });

      if (!response.ok) {
        const result = { embedding: null, backend: "ollama" as const, model };
        span?.log({ metadata: { ...result, status: "error", httpStatus: response.status } });
        return result;
      }

      const payload = (await response.json()) as {
        embeddings?: number[][];
        embedding?: number[];
      };
      const result = {
        embedding: normalizeEmbedding(payload.embedding ?? payload.embeddings?.[0] ?? null),
        backend: "ollama" as const,
        model,
      };
      span?.log({ output: result.embedding?.length ?? 0, metadata: { ...result, status: "success" } });
      return result;
    },
  );
}

async function embedWithHuggingFace(text: string): Promise<EmbedResult> {
  const apiKey =
    process.env.HUGGINGFACE_API_KEY ||
    process.env.HF_API_TOKEN ||
    process.env.VITE_HUGGINGFACE_API_KEY ||
    process.env.VITE_HUGGINGFACE_TOKEN ||
    "";

  const model =
    process.env.HF_MODEL ||
    process.env.HF_EMBED_MODEL ||
    process.env.HUGGINGFACE_EMBED_MODEL ||
    process.env.HUGGINGFACE_MODEL ||
    (process.env.BILLY_EMBED_MODEL?.includes("/") ? process.env.BILLY_EMBED_MODEL : "") ||
    HUGGINGFACE_EMBED_MODEL;

  if (!apiKey || !text.trim()) {
    return { embedding: null, backend: "huggingface", model };
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const body = JSON.stringify({
    inputs: `task: search result | query: ${text}`,
    options: { wait_for_model: true },
  });
  const candidateUrls = [
    `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`,
    `https://api-inference.huggingface.co/models/${model}`,
  ];

  return traceBraintrust(
    {
      name: "huggingface embedding call",
      type: "task",
      metadata: { backend: "huggingface", model, candidateUrls },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({ input: text, metadata: { backend: "huggingface", model, candidateUrls } });

      for (const url of candidateUrls) {
        const response = await fetch(url, {
          method: "POST",
          headers,
          body,
        });

        if (!response.ok) {
          continue;
        }

        const payload = (await response.json()) as unknown;
        const embedding = normalizeEmbedding(extractEmbeddingVector(payload));
        if (embedding) {
          const result = {
            embedding,
            backend: "huggingface" as const,
            model,
          };
          span?.log({ output: embedding.length, metadata: { ...result, status: "success", matchedUrl: url } });
          return result;
        }
      }

      const result = { embedding: null, backend: "huggingface" as const, model };
      span?.log({ metadata: { ...result, status: "fallback" } });
      return result;
    },
  );
}

export async function embedTextForRetrieval(text: string): Promise<EmbedResult> {
  const backend = (process.env.BILLY_EMBED_BACKEND || "").trim().toLowerCase();
  if (backend === "ollama") {
    return embedWithOllama(text);
  }
  if (backend === "hf" || backend === "huggingface") {
    return embedWithHuggingFace(text);
  }
  if (
    !backend &&
    (
      process.env.HF_API_TOKEN ||
      process.env.HUGGINGFACE_API_KEY ||
      process.env.VITE_HUGGINGFACE_API_KEY ||
      process.env.VITE_HUGGINGFACE_TOKEN ||
      process.env.BILLY_EMBED_MODEL?.includes("/")
    )
  ) {
    return embedWithHuggingFace(text);
  }
  return embedWithGemini(text);
}
