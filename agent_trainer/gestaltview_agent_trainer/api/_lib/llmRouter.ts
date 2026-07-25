import type { OperatorKitEnv } from "./supabaseClient";

export interface SelectedProvider {
  provider: "groq" | "openai" | "gemini";
  model: string;
}

export interface GenerateTextInput {
  env: OperatorKitEnv;
  systemPrompt: string;
  userPrompt: string;
  contextText: string;
}

export interface GenerateTextResult extends SelectedProvider {
  text: string;
}

/**
 * Choose the first available provider based on which API keys are present.
 * The order of precedence is Groq → OpenAI → Gemini. If none of these
 * providers are configured the function will throw. The returned model names
 * represent sensible defaults for each platform and can be overridden at the
 * environment level in the future by expanding this function to read
 * user‐provided model identifiers.
 */
export function selectProvider(env: OperatorKitEnv): SelectedProvider {
  // Groq takes priority because its models generally offer fast throughput
  // and lower cost relative to comparable OpenAI tiers. If a Groq API key
  // exists we default to the llama‑3 family. See:
  // https://console.groq.com/docs/api-reference/chat-completions
  if (env.GROQ_API_KEY) {
    return {
      provider: "groq",
      model: "llama-3.3-70b-versatile"
    };
  }

  // Fall back to OpenAI if the caller has an OpenAI key but no Groq key.
  // The mini GPT‑4 model is a reasonable default that balances latency and cost.
  if (env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      model: "gpt-4.1-mini"
    };
  }

  // Finally, use Gemini if no other provider keys are present. Gemini requires
  // specifying a model name when constructing the API endpoint; here we
  // default to the “gemini‑pro” class which supports general purpose chat.
  if (env.GEMINI_API_KEY) {
    return {
      provider: "gemini",
      model: "gemini-pro"
    };
  }

  throw new Error("No LLM provider key is configured.");
}

/**
 * Generate a response using the configured LLM provider. This function wraps
 * the network calls to Groq, OpenAI, or Gemini in a unified interface. It
 * assembles a simple chat prompt consisting of the system prompt, an optional
 * context preview, and the user’s message. In case of network errors or
 * unexpected response formats the function falls back to a clear error
 * message instead of failing silently.
 */
export async function generateText(
  input: GenerateTextInput
): Promise<GenerateTextResult> {
  const { provider, model } = selectProvider(input.env);
  const systemPrompt = input.systemPrompt;
  // The context is trimmed and appended before the user prompt. If no
  // retrieval context exists the user prompt stands alone.
  const contextPrefix = input.contextText ? `${input.contextText}\n\n` : "";
  const userPrompt = input.userPrompt;

  // Helper that returns a placeholder response when the provider call fails.
  const fallback = (reason: string): GenerateTextResult => ({
    provider,
    model,
    text: `[${provider} error] ${reason}`
  });

  try {
    if (provider === "groq" || provider === "openai") {
      // Both Groq and OpenAI are OpenAI‑compatible chat endpoints. The only
      // difference is the host URL and API key header. See Groq docs:
      // https://console.groq.com/docs/api-reference/chat-completions
      const baseUrl = provider === "groq"
        ? "https://api.groq.com/openai/v1"
        : "https://api.openai.com/v1";
      const apiKey = provider === "groq"
        ? input.env.GROQ_API_KEY!
        : input.env.OPENAI_API_KEY!;
      const url = `${baseUrl}/chat/completions`;
      const body = JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${contextPrefix}${userPrompt}` }
        ],
        // Non‑streamed responses make this helper easier to use from the UI.
        stream: false
      });
      // Use global fetch if available; cast to any to avoid TypeScript missing types
      const response = await (globalThis.fetch as any)(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body
      });
      if (!response.ok) {
        return fallback(`Upstream responded with ${response.status}`);
      }
      const data = (await response.json()) as any;
      const text: string | undefined =
        data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;
      if (!text) {
        return fallback("No text in completion response");
      }
      return { provider, model, text };
    }
    if (provider === "gemini") {
      // The Gemini REST API uses Google’s generative language service. The
      // endpoint format differs slightly and requires the API key as a query
      // parameter. See:
      // https://ai.google.dev/docs/gemini-api?hl=en#generate-content
      const apiKey = input.env.GEMINI_API_KEY!;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;
      const body = JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\n${contextPrefix}${userPrompt}`
              }
            ]
          }
        ]
      });
      const response = await (globalThis.fetch as any)(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
      if (!response.ok) {
        return fallback(`Upstream responded with ${response.status}`);
      }
      const data = (await response.json()) as any;
      const text: string | undefined =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return fallback("No text in completion response");
      }
      return { provider, model, text };
    }
    // Should never reach here because selectProvider only returns supported providers.
    return fallback(`Unsupported provider '${provider}'`);
  } catch (error) {
    if (error instanceof Error) {
      return fallback(error.message);
    }
    return fallback("Unknown error calling LLM provider");
  }
}
