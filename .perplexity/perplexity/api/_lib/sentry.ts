import * as Sentry from "@sentry/node";
import type { NodeOptions } from "@sentry/node";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  initRuntimeSentry,
  isRuntimeSentryEnabled,
} from "../../instrument.js";

type VercelHandler<ExtraArgs extends unknown[] = []> = (
  req: VercelRequest,
  res: VercelResponse,
  ...extraArgs: ExtraArgs
) => Promise<void> | void;

type FetchHandler = (req: Request) => Promise<Response> | Response;

interface InitOptions {
  runtime: string;
  integrations?: NodeOptions["integrations"];
}

interface HandlerOptions {
  captureHandledResponseErrors?: boolean;
  runtime?: string;
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getRequestUrl(req: VercelRequest): URL | null {
  const rawUrl = req.url || "/";
  const host = firstHeader(req.headers.host) || "localhost";

  try {
    return new URL(rawUrl, /^https?:\/\//i.test(rawUrl) ? undefined : `https://${host}`);
  } catch {
    return null;
  }
}

function getFetchRequestUrl(req: Request): URL | null {
  try {
    return new URL(req.url);
  } catch {
    return null;
  }
}

function describeBody(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    return {
      error: typeof record.error === "string" ? record.error : undefined,
      status: typeof record.status === "string" ? record.status : undefined,
    };
  }

  return {
    body: typeof body === "string" ? body.slice(0, 300) : undefined,
  };
}

export function initNodeSentry(options: InitOptions): void {
  initRuntimeSentry(options);
}

export function isNodeSentryEnabled(): boolean {
  return isRuntimeSentryEnabled();
}

export function captureApiResponseError(status: number, body: unknown): void {
  initNodeSentry({ runtime: "vercel-api" });

  if (!isNodeSentryEnabled() || status < 500) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("runtime", "vercel-api");
    scope.setTag("http.status_code", String(status));
    scope.setContext("response", describeBody(body));
    Sentry.captureMessage(`API response returned ${status}`, "error");
  });
}

export function withSentryVercelHandler<ExtraArgs extends unknown[]>(
  handler: VercelHandler<ExtraArgs>,
  routeName: string,
  options: HandlerOptions = {},
): VercelHandler<ExtraArgs> {
  const runtime = options.runtime || "vercel-api";
  initNodeSentry({ runtime });

  return async (req, res, ...extraArgs) => {
    const method = req.method || "GET";
    const url = getRequestUrl(req);
    const path = url?.pathname || routeName;

    return Sentry.withIsolationScope(async (scope) => {
      scope.setTag("api.route", routeName);
      scope.setTag("runtime", runtime);
      scope.setTag("http.method", method);
      scope.setContext("request", {
        method,
        path,
        query: url?.search || "",
        userAgent: firstHeader(req.headers["user-agent"]),
      });

      return Sentry.startSpan(
        {
          name: `${method} ${routeName}`,
          op: "http.server",
          forceTransaction: true,
          attributes: {
            "http.request.method": method,
            "url.path": path,
            "sentry.source": "route",
          },
        },
        async (span) => {
          try {
            await handler(req, res, ...extraArgs);
            const statusCode = res.statusCode || 200;
            Sentry.setHttpStatus(span, statusCode);

            if (options.captureHandledResponseErrors !== false && statusCode >= 500) {
              Sentry.captureMessage(`${method} ${routeName} returned ${statusCode}`, "error");
            }
          } catch (error) {
            Sentry.captureException(error);
            Sentry.setHttpStatus(span, 500);
            await Sentry.flush(2_000);
            throw error;
          }
        },
      );
    });
  };
}

export function withSentryFetchHandler(
  handler: FetchHandler,
  routeName: string,
  options: HandlerOptions = {},
): FetchHandler {
  const runtime = options.runtime || "vercel-fetch-api";
  initNodeSentry({ runtime });

  return async (req) => {
    const method = req.method || "GET";
    const url = getFetchRequestUrl(req);
    const path = url?.pathname || routeName;

    return Sentry.withIsolationScope(async (scope) => {
      scope.setTag("api.route", routeName);
      scope.setTag("runtime", runtime);
      scope.setTag("http.method", method);
      scope.setContext("request", {
        method,
        path,
        query: url?.search || "",
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return Sentry.startSpan(
        {
          name: `${method} ${routeName}`,
          op: "http.server",
          forceTransaction: true,
          attributes: {
            "http.request.method": method,
            "url.path": path,
            "sentry.source": "route",
          },
        },
        async (span) => {
          try {
            const response = await handler(req);
            Sentry.setHttpStatus(span, response.status);

            if (options.captureHandledResponseErrors !== false && response.status >= 500) {
              Sentry.captureMessage(
                `${method} ${routeName} returned ${response.status}`,
                "error",
              );
            }

            return response;
          } catch (error) {
            Sentry.captureException(error);
            Sentry.setHttpStatus(span, 500);
            await Sentry.flush(2_000);
            throw error;
          }
        },
      );
    });
  };
}

export function withSentryCronMonitor<T>(
  monitorSlug: string,
  callback: () => T,
  config: Parameters<typeof Sentry.withMonitor>[2],
): T {
  initNodeSentry({ runtime: "vercel-cron" });

  if (!isNodeSentryEnabled()) {
    return callback();
  }

  return Sentry.withMonitor(monitorSlug, callback, config);
}
