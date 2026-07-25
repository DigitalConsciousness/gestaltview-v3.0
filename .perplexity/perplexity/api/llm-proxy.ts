import { withSentryFetchHandler } from "./_lib/sentry.js";
import { traceBraintrust } from "../instrument.js";

type Provider =
  | "google"
  | "openai"
  | "groq"
  | "openrouter"
  | "huggingface";

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

type ProxyRequest = {
  provider: Provider;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
};

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function callGoogle(model: string, systemPrompt: string, userPrompt: string, temperature: number, maxTokens: number): Promise<string> {
  const apiKey = envValue("GOOGLE_API_KEY", "GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "VITE_GOOGLE_API_KEY");
  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || "";
}

async function callOpenAICompatible(
  provider: "openai" | "groq" | "openrouter",
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
  baseUrl?: string,
): Promise<string> {
  const resolvedBaseUrl =
    baseUrl ??
    (provider === "groq"
      ? "https://api.groq.com/openai/v1"
      : provider === "openrouter"
        ? "https://openrouter.ai/api/v1"
        : envValue("OPENAI_BASE_URL") || "https://api.openai.com/v1");

  const apiKey =
    provider === "groq"
      ? envValue("GROQ_API_KEY", "VITE_GROQ_API_KEY", "VITE_GROK_API_KEY")
      : provider === "openrouter"
        ? envValue("OPENROUTER_API_KEY", "VITE_OPENROUTER_API_KEY")
        : envValue("OPENAI_API_KEY", "VITE_OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error(`Missing ${provider.toUpperCase()} API key.`);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://gestaltview-digital-intelligence.vercel.app";
    headers["X-Title"] = "GestaltView Billy";
  }

  const response = await fetch(`${resolvedBaseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`${provider} ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callHuggingFace(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const apiKey = envValue("HUGGINGFACE_API_KEY", "HF_API_TOKEN", "VITE_HUGGINGFACE_API_KEY", "VITE_HUGGINGFACE_TOKEN");
  if (!apiKey) {
    throw new Error("Missing HUGGINGFACE_API_KEY.");
  }

  const prompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: maxTokens, temperature, return_full_text: false },
    }),
  });

  if (!response.ok) {
    throw new Error(`HuggingFace ${response.status}`);
  }

  const data = (await response.json()) as Array<{ generated_text?: string }> | { generated_text?: string };
  if (Array.isArray(data)) {
    return data[0]?.generated_text?.trim() || "";
  }
  return data.generated_text?.trim() || "";
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = (await req.json()) as Partial<ProxyRequest>;
  if (!body.provider || !body.model || !body.systemPrompt || !body.userPrompt) {
    return jsonResponse({ error: "Missing provider, model, systemPrompt, or userPrompt." }, 400);
  }

  const temperature = typeof body.temperature === "number" ? body.temperature : 0.4;
  const maxTokens = typeof body.maxTokens === "number" ? body.maxTokens : 800;
  const provider = body.provider;
  const model = body.model;
  const systemPrompt = body.systemPrompt;
  const userPrompt = body.userPrompt;
  const baseUrl = body.baseUrl;

  return traceBraintrust(
    {
      name: `browser ${body.provider} call`,
      type: "llm",
      metadata: {
        provider: body.provider,
        model: body.model,
      },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        metadata: {
          provider,
          model,
          temperature,
          maxTokens,
        },
      });

      try {
        let text = "";
        if (provider === "google") {
          text = await callGoogle(model, systemPrompt, userPrompt, temperature, maxTokens);
        } else if (provider === "huggingface") {
          text = await callHuggingFace(model, systemPrompt, userPrompt, temperature, maxTokens);
        } else if (provider === "groq") {
          text = await callOpenAICompatible("groq", model, systemPrompt, userPrompt, temperature, maxTokens, baseUrl);
        } else if (provider === "openrouter") {
          text = await callOpenAICompatible("openrouter", model, systemPrompt, userPrompt, temperature, maxTokens, baseUrl);
        } else {
          text = await callOpenAICompatible("openai", model, systemPrompt, userPrompt, temperature, maxTokens, baseUrl);
        }

        if (!text.trim()) {
          throw new Error("Empty response.");
        }

        span?.log({
          output: text.trim(),
          metadata: {
            provider,
            model,
            status: "success",
          },
        });

        return jsonResponse({ text: text.trim() });
      } catch (error) {
        span?.log({
          metadata: {
            provider,
            model,
            status: "error",
            error: error instanceof Error ? error.message : String(error),
          },
        });
        return jsonResponse(
          { error: error instanceof Error ? error.message : "LLM proxy failed" },
          500,
        );
      }
    },
  );
}

export default withSentryFetchHandler(handler, "/api/llm-proxy");
