import { createClient } from "@supabase/supabase-js";

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

let cachedClient: any = null;

export function hasGateSupabaseConfig(): boolean {
  return Boolean(
    envValue("SUPABASE_URL", "VITE_SUPABASE_URL") &&
      envValue("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY")
  );
}

export function getGateSupabaseAdmin(): any {
  if (cachedClient) {
    return cachedClient;
  }

  const url = envValue("SUPABASE_URL", "VITE_SUPABASE_URL");
  const key = envValue("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY");

  if (!url || !key) {
    throw new Error(
      "GATE requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for live persistence."
    );
  }

  cachedClient = createClient(url, key);
  return cachedClient;
}

export function getGateStorageBucket(): string {
  return envValue("GATE_STORAGE_BUCKET") || "generated-zips";
}

export function getGateSignedUrlTtlSeconds(): number {
  const raw = envValue("GATE_SIGNED_URL_TTL_SECONDS");
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 3600;
}
