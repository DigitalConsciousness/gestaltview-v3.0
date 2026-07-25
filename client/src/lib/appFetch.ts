export type AppFetchErrorCode =
  | "timeout"
  | "network"
  | "supabase_paused"
  | "supabase_unavailable"
  | "upstream_5xx"
  | "auth_unavailable"
  | "unknown";

export type AppFetchResult<T> =
  | {
      ok: true;
      data: T;
      status: number;
      degraded?: boolean;
      meta?: Record<string, unknown>;
    }
  | {
      ok: false;
      code: AppFetchErrorCode;
      message: string;
      retryable: boolean;
      status: number | null;
      data?: unknown;
      meta?: Record<string, unknown>;
    };

export interface AppFetchJsonOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryUnsafe?: boolean;
  retryBaseDelayMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_RETRY_BASE_DELAY_MS = 250;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function methodAllowsRetry(method: string, retryUnsafe: boolean): boolean {
  if (retryUnsafe) return true;
  return method === "GET" || method === "HEAD" || method === "OPTIONS";
}

function classifyHttpFailure(status: number, payload: unknown): AppFetchErrorCode {
  const serialized = JSON.stringify(payload ?? {}).toLowerCase();
  if (status === 401 || status === 403) return "auth_unavailable";
  if (serialized.includes("paused")) return "supabase_paused";
  if (serialized.includes("supabase") || serialized.includes("pgrst")) return "supabase_unavailable";
  if (status >= 500) return "upstream_5xx";
  return "unknown";
}

function payloadMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function errorCodeForCaught(error: unknown): AppFetchErrorCode {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "timeout";
  }

  if (error instanceof Error && error.name === "AbortError") {
    return "timeout";
  }

  return "network";
}

function retryDelay(attempt: number, baseDelayMs: number): number {
  const jitter = Math.floor(Math.random() * 120);
  return baseDelayMs * 2 ** attempt + jitter;
}

export async function appFetchJson<T>(
  input: RequestInfo | URL,
  options: AppFetchJsonOptions = {}
): Promise<AppFetchResult<T>> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = 0,
    retryUnsafe = false,
    retryBaseDelayMs = DEFAULT_RETRY_BASE_DELAY_MS,
    ...init
  } = options;
  const method = String(init.method ?? "GET").toUpperCase();
  const retryAllowed = methodAllowsRetry(method, retryUnsafe);
  const maxAttempts = Math.max(0, retries) + 1;
  let lastFailure: AppFetchResult<T> | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId =
      timeoutMs > 0
        ? window.setTimeout(() => controller.abort("request_timeout"), timeoutMs)
        : null;

    try {
      const response = await fetch(input, {
        ...init,
        credentials: init.credentials ?? "include",
        signal: init.signal ?? controller.signal,
      });
      const payload = (await response.json().catch(() => ({}))) as T;

      if (response.ok) {
        return {
          ok: true,
          data: payload,
          status: response.status,
          degraded:
            Boolean((payload as { degraded?: unknown })?.degraded) ||
            Boolean((payload as { ok?: unknown })?.ok === false),
          meta:
            payload && typeof payload === "object"
              ? ((payload as { meta?: Record<string, unknown> }).meta ?? undefined)
              : undefined,
        };
      }

      const retryable = retryAllowed && RETRYABLE_STATUS_CODES.has(response.status);
      lastFailure = {
        ok: false,
        code: classifyHttpFailure(response.status, payload),
        message: payloadMessage(payload, `Request failed: ${response.status}`),
        retryable,
        status: response.status,
        data: payload,
      };
    } catch (error) {
      const code = errorCodeForCaught(error);
      lastFailure = {
        ok: false,
        code,
        message:
          code === "timeout"
            ? "The request timed out before the server responded."
            : error instanceof Error
              ? error.message
              : "The request failed before a response was received.",
        retryable: retryAllowed,
        status: null,
        meta: { cause: error instanceof Error ? error.message : String(error) },
      };
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }

    if (!lastFailure.retryable || attempt >= maxAttempts - 1) {
      break;
    }

    await delay(retryDelay(attempt, retryBaseDelayMs));
  }

  return (
    lastFailure ?? {
      ok: false,
      code: "unknown",
      message: "The request failed.",
      retryable: false,
      status: null,
    }
  );
}
