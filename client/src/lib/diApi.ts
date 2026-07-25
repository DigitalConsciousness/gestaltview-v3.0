import { appFetchJson } from "@/lib/appFetch";
import { getSupabaseBrowserClient } from "@/lib/supabaseAuth";
import type { DIHealthReport, DIRequest, DIResponse } from "@shared/di";

type DiRouteEnvelope = {
  response: string;
  provider: string;
  timestamp: string;
  free?: boolean;
  tokensUsed?: number | null;
  processingTime?: number;
  metadata?: Record<string, unknown>;
  diSlug: string;
  conversationMode: string;
  retrievalMode: string;
  contextSources: string[];
  memorySources: string[];
  relationalDepth: number;
  sessionThread?: string;
  memoryEventWritten?: boolean;
  founderSessionActive?: boolean;
};

async function resolveBrowserAccessToken(): Promise<string | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client.auth.getSession();
    if (error) {
      return null;
    }

    return data.session?.access_token?.trim() || null;
  } catch {
    return null;
  }
}

async function fetchDiJson<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const accessToken = await resolveBrowserAccessToken();
  const headers = new Headers(init.headers ?? {});

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const result = await appFetchJson<T>(path, {
    ...init,
    headers,
    timeoutMs: 12_000,
    retries: 0,
  });

  return result.ok ? result.data : null;
}

export async function sendDIMessage(input: DIRequest): Promise<DIResponse | null> {
  const payload = await fetchDiJson<DiRouteEnvelope>("/api/di", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!payload) {
    return null;
  }

  return {
    content: payload.response,
    diSlug: payload.diSlug,
    conversationMode: payload.conversationMode,
    retrievalMode: payload.retrievalMode,
    contextSources: payload.contextSources,
    memorySources: payload.memorySources,
    relationalDepth: payload.relationalDepth,
    sessionThread: payload.sessionThread,
    memoryEventWritten: payload.memoryEventWritten,
    founderSessionActive: payload.founderSessionActive,
  };
}

export async function getDIHealth(slug?: string): Promise<DIHealthReport | { profiles: DIHealthReport[] } | null> {
  const query = slug ? `?slug=${encodeURIComponent(slug)}` : "";
  return fetchDiJson<DIHealthReport | { profiles: DIHealthReport[] }>(`/api/di-health${query}`, {
    method: "GET",
  });
}
