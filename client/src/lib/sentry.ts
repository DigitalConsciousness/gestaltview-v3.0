import type { ErrorInfo } from "react";

type SentryReactModule = typeof import("@sentry/react");

let initialized = false;
let sentry: SentryReactModule | null = null;
let sentryReady: Promise<void> | null = null;

function readBoolean(value: string | boolean | undefined, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === undefined || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readSampleRate(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value ?? "");
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return fallback;
  }

  return parsed;
}

export function initClientSentry(): void {
  if (initialized) {
    return;
  }

  initialized = true;

  const dsn =
    import.meta.env.VITE_SENTRY_DSN ||
    "https://2aee0274ad499e8fe1b0b3c832768eed@o4511623869300736.ingest.us.sentry.io/4511623873822720";
  if (!dsn) {
    return;
  }

  const isDev = import.meta.env.DEV;

  sentryReady = import("@sentry/react")
    .then((Sentry) => {
      sentry = Sentry;
      Sentry.init({
        dsn,
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
        release: import.meta.env.VITE_SENTRY_RELEASE,
        sendDefaultPii: readBoolean(import.meta.env.VITE_SENTRY_SEND_DEFAULT_PII, false),
        tracesSampleRate: readSampleRate(
          import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
          isDev ? 1.0 : 0.1,
        ),
        replaysSessionSampleRate: readSampleRate(
          import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
          isDev ? 1.0 : 0.1,
        ),
        replaysOnErrorSampleRate: readSampleRate(
          import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
          1.0,
        ),
        enableLogs: readBoolean(import.meta.env.VITE_SENTRY_ENABLE_LOGS, true),
        tracePropagationTargets: [
          /^\/api\//,
          "https://gestaltview-digital-intelligence.vercel.app/api",
        ],
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            blockAllMedia: true,
            maskAllText: true,
          }),
          Sentry.consoleLoggingIntegration({
            levels: ["error", "warn"],
          }),
        ],
      });
    })
    .catch((error) => {
      console.warn("[sentry] Failed to initialize browser telemetry:", error);
    });
}

function captureWithSentry(
  Sentry: SentryReactModule,
  error: Error,
  errorInfo: ErrorInfo,
): void {
  Sentry.withScope((scope) => {
    scope.setContext("react", {
      componentStack: errorInfo.componentStack,
    });
    Sentry.captureException(error);
  });
}

export function captureReactError(error: Error, errorInfo: ErrorInfo): void {
  if (!initialized || !import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  if (sentry) {
    captureWithSentry(sentry, error, errorInfo);
    return;
  }

  void sentryReady?.then(() => {
    if (sentry) {
      captureWithSentry(sentry, error, errorInfo);
    }
  });
}
