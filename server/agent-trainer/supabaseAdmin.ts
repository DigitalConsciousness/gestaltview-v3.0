import { createClient } from "@supabase/supabase-js";

let cachedClient: any = null;

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function hasTrainerSupabaseConfig(): boolean {
  return Boolean(
    envValue("SUPABASE_URL", "VITE_SUPABASE_URL") &&
      envValue("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY")
  );
}

export function getTrainerSupabaseAdmin(): any {
  if (cachedClient) {
    return cachedClient;
  }

  // Prefer the pooler URL (PgBouncer, port 6543) when available to avoid
  // exhausting Postgres direct connections in serverless environments.
  const url = envValue("SUPABASE_DB_URL", "SUPABASE_URL", "VITE_SUPABASE_URL");
  const key = envValue("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY");

  if (!url || !key) {
    throw new Error("Trainer requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  cachedClient = createClient(url, key, {
    // Some @supabase/supabase-js versions ship GlobalConfig typings that omit
    // `fetch` even though the runtime supports it.
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, {
          ...init,
          signal: AbortSignal.timeout(
            Number(process.env.SUPABASE_QUERY_TIMEOUT_MS ?? 25_000)
          ),
        }),
    } as any,
  }) as any;

  return cachedClient;
}
