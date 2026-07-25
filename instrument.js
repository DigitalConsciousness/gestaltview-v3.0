import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export const DEFAULT_SENTRY_DSN =
"https://5aaff3ee31116960cd61b1ae10ca8080@o4511623869300736.ingest.us.sentry.io/4511624024293376";

let initialized = false;

let enabled = false;
let braintrustInitialized = false;
let braintrustEnabled = false;
let braintrustLogger = null;
let braintrustLoggerPromise = null;

function readBoolean(value, fallback) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readSampleRate(value, fallback) {
  const parsed = Number.parseFloat(value ?? "");
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return fallback;
  }

  return parsed;
}

function readProfileLifecycle(value) {
  return value === "manual" ? "manual" : "trace";
}

function readTrimmedEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function mergeIntegrations(configured, additional) {
  const profilingEnabled = readBoolean(process.env.SENTRY_PROFILING_ENABLED, true);

  return (defaults) => {
    const configuredIntegrations =
      typeof configured === "function"
        ? configured(defaults)
        : [...defaults, ...(configured ?? [])];
    const withAdditional =
      typeof additional === "function"
        ? additional(configuredIntegrations)
        : [...configuredIntegrations, ...(additional ?? [])];

    if (!profilingEnabled) {
      return withAdditional;
    }

    return [...withAdditional, nodeProfilingIntegration()];
  };
}

export function initRuntimeSentry(options = {}) {
  const runtime = options.runtime || process.env.SENTRY_RUNTIME || "node";

  if (initialized) {
    Sentry.setTag("runtime", runtime);
    return;
  }

  initialized = true;

  const dsn = process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN || DEFAULT_SENTRY_DSN;
  enabled = readBoolean(process.env.SENTRY_ENABLED, Boolean(dsn));

  Sentry.init({
    dsn,
    enabled,
    environment:
      process.env.SENTRY_ENVIRONMENT ||
      process.env.VERCEL_ENV ||
      process.env.NODE_ENV ||
      "development",
    release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
    sendDefaultPii: readBoolean(process.env.SENTRY_SEND_DEFAULT_PII, true),
    tracesSampleRate: readSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 1.0),
    profileSessionSampleRate: readSampleRate(
      process.env.SENTRY_PROFILE_SESSION_SAMPLE_RATE,
      readBoolean(process.env.SENTRY_PROFILING_ENABLED, true) ? 1.0 : 0,
    ),
    profileLifecycle: readProfileLifecycle(process.env.SENTRY_PROFILE_LIFECYCLE),
    enableLogs: readBoolean(process.env.SENTRY_ENABLE_LOGS, true),
    integrations: mergeIntegrations(
      [Sentry.expressIntegration()],
      options.integrations,
    ),
  });

  Sentry.setTag("runtime", runtime);
}

export function isRuntimeSentryEnabled() {
  return initialized && enabled;
}

export async function initRuntimeBraintrust() {
  if (braintrustInitialized) {
    return braintrustLoggerPromise ?? braintrustLogger;
  }

  braintrustInitialized = true;

  const apiKey = readTrimmedEnv("BRAINTRUST_API_KEY");
  braintrustEnabled = readBoolean(process.env.BRAINTRUST_ENABLED, Boolean(apiKey));

  if (!braintrustEnabled || !apiKey) {
    return null;
  }

  const projectName =
    readTrimmedEnv("BRAINTRUST_PROJECT_NAME") ||
    readTrimmedEnv("VERCEL_PROJECT_NAME") ||
    "GestaltView";

  braintrustLoggerPromise = import("braintrust").then(
    ({ initLogger }) => {
      braintrustLogger = initLogger({
        apiKey,
        projectName,
      });

      return braintrustLogger;
    },
    (error) => {
      braintrustEnabled = false;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Braintrust telemetry disabled: ${message}`);
      return null;
    },
  );

  return braintrustLoggerPromise;
}

export function getBraintrustLogger() {
  return braintrustLogger;
}

export function isBraintrustEnabled() {
  return braintrustInitialized && braintrustEnabled && Boolean(braintrustLogger);
}

export async function traceBraintrust(spanOptions, callback) {
  const logger = await initRuntimeBraintrust();
  if (!logger) {
    return callback(null);
  }

  return logger.traced((span) => callback(span), spanOptions);
}

initRuntimeSentry();
void initRuntimeBraintrust();
