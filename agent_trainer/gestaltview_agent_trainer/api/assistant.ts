import { domainPrompts } from "../config/prompts";
import type { ApiResult, AssistantRequest, AssistantResponse, KnowledgeFragment, RouteContext } from "./_lib/contracts";
import { assembleContext } from "./_lib/contextAssembler";
import { generateText } from "./_lib/llmRouter";
import { MemoryRateLimiter } from "./_lib/rateLimiter";
import { searchKnowledge } from "./knowledge";

async function loadFragments(
  context: RouteContext,
  request: AssistantRequest
): Promise<ApiResult<KnowledgeFragment[]>> {
  if (request.preloadedFragments && request.preloadedFragments.length > 0) {
    return {
      data: request.preloadedFragments,
      error: null
    };
  }

  return searchKnowledge(context.env, context.userId, request.message, request.namespace);
}

export async function postAssistant(
  context: RouteContext,
  request: AssistantRequest
): Promise<ApiResult<AssistantResponse>> {
  const rateLimiter = new MemoryRateLimiter();
  const rateLimitResult = rateLimiter.consume(
    `assistant:${context.userId}`,
    20,
    60_000
  );

  if (!rateLimitResult.allowed) {
    return {
      data: null,
      error: {
        message: "Rate limit exceeded for assistant requests.",
        code: "rate_limited"
      }
    };
  }

  const fragmentsResult = await loadFragments(context, request);

  if (fragmentsResult.error || !fragmentsResult.data) {
    return {
      data: null,
      error: fragmentsResult.error ?? {
        message: "Unable to load knowledge fragments."
      }
    };
  }

  const contextPreview = assembleContext({
    fragments: fragmentsResult.data
  });

  const generated = await generateText({
    env: context.env,
    systemPrompt: domainPrompts[request.domain],
    userPrompt: request.message,
    contextText: contextPreview
  });

  return {
    data: {
      reply: generated.text,
      provider: generated.provider,
      model: generated.model,
      contextPreview
    },
    error: null
  };
}
