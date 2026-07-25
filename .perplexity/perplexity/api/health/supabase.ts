import type { VercelRequest, VercelResponse } from "@vercel/node";

import { traceBraintrust } from "../../instrument.js";
import { sendJson } from "../_lib/response.js";
import { listTrainerStudySources } from "../../server/agent-trainer/study-sources.js";

const HEALTH_TIMEOUT_MS = 3_500;

function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutTrailingSlash)) return withoutTrailingSlash;
  if (withoutTrailingSlash.startsWith("//")) return `https:${withoutTrailingSlash}`;
  return `https://${withoutTrailingSlash.replace(/^\/+/, "")}`;
}

function getSupabaseConfig() {
  return {
    url: normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""),
    key:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      "",
  };
}

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      const timer = setTimeout(() => resolve(fallback), ms);
      timer.unref?.();
    }),
  ]);
}

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

async function checkSupabaseRest(): Promise<"ok" | "timeout" | "unconfigured" | "error"> {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) {
    return "unconfigured";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("health_timeout"), HEALTH_TIMEOUT_MS);
  timeout.unref?.();

  try {
    const response = await fetch(`${config.url}/rest/v1/users?select=id&limit=1`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Accept: "application/json",
      },
    });

    return response.ok ? "ok" : "error";
  } catch (error) {
    return error instanceof Error && error.name === "AbortError" ? "timeout" : "error";
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  const startedAt = Date.now();

  return traceBraintrust(
    {
      name: "supabase health",
      type: "task",
      metadata: {
        route: "/api/health/supabase",
        method: req.method,
      },
    },
    async (span: BraintrustSpan | null) => {
      const [supabaseStatus, trainerSources] = await Promise.all([
        checkSupabaseRest(),
        withTimeout(
          listTrainerStudySources(1)
            .then((sources) => (sources.length > 0 ? ("ok" as const) : ("empty" as const)))
            .catch(() => "error" as const),
          HEALTH_TIMEOUT_MS,
          "timeout" as const
        ),
      ]);

      const degraded = supabaseStatus !== "ok" || trainerSources === "timeout" || trainerSources === "error";

      span?.log({
        metadata: {
          supabaseStatus,
          trainerSources,
          degraded,
        },
      });

      sendJson(res, 200, {
        ok: !degraded,
        state: degraded ? "degraded" : "healthy",
        latencyMs: Date.now() - startedAt,
        degraded,
        checks: {
          supabase: supabaseStatus,
          auth: supabaseStatus === "ok" ? "ok" : "unknown",
          trainerSources,
        },
      });
    }
  );
}
