import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const SUPABASE_PUBLIC_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

let supabaseClient: SupabaseClient | null | undefined;

export function isSupabaseEmailAuthConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY);
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (supabaseClient !== undefined) {
    if (!supabaseClient) {
      throw new Error("Supabase email auth is not configured.");
    }
    return supabaseClient;
  }

  if (!isSupabaseEmailAuthConfigured()) {
    supabaseClient = null;
    throw new Error("Supabase email auth is not configured.");
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return supabaseClient;
}

export type SupabaseCallbackTokens =
  | { kind: "pkce"; code: string }
  | { kind: "implicit"; accessToken: string; refreshToken: string }
  | { kind: "none" };

export function readSupabaseCallbackTokens(url: string): SupabaseCallbackTokens {
  const parsed = new URL(url);
  const code = parsed.searchParams.get("code")?.trim();

  if (code) {
    return { kind: "pkce", code };
  }

  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
  const accessToken = hashParams.get("access_token")?.trim();
  const refreshToken = hashParams.get("refresh_token")?.trim();

  if (accessToken && refreshToken) {
    return { kind: "implicit", accessToken, refreshToken };
  }

  return { kind: "none" };
}

export async function establishBrowserSessionFromCallbackUrl(url = window.location.href): Promise<Session | null> {
  const client = getSupabaseBrowserClient();
  const authClient = client.auth as any;
  const tokens = readSupabaseCallbackTokens(url);

  if (tokens.kind === "pkce") {
    const { data, error } = await authClient.exchangeCodeForSession(tokens.code);
    if (error) {
      throw new Error(error.message);
    }
    return data.session ?? null;
  }

  if (tokens.kind === "implicit") {
    const { data, error } = await authClient.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data.session ?? null;
  }

  const { data, error } = await authClient.getSession();
  if (error) {
    throw new Error(error.message);
  }

  return data.session ?? null;
}

function buildCallbackRedirect(redirectTo: string): string {
  const next = new URL("/auth/callback", window.location.origin);
  next.searchParams.set("redirect", redirectTo);
  return next.toString();
}

export async function signInWithEmailPassword(email: string, password: string): Promise<Session | null> {
  const client = getSupabaseBrowserClient();
  const authClient = client.auth as any;
  const { data, error } = await authClient.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.session ?? null;
}

export async function signInWithGoogle(redirectTo: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  const authClient = client.auth as any;
  const { error } = await authClient.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildCallbackRedirect(redirectTo),
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  redirectTo: string
): Promise<Session | null> {
  const client = getSupabaseBrowserClient();
  const authClient = client.auth as any;
  const { data, error } = await authClient.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildCallbackRedirect(redirectTo),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.session ?? null;
}

export async function requestInviteOnlyMagicLink(
  email: string,
  redirectTo: string
): Promise<void> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      redirectTo: buildCallbackRedirect(redirectTo),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || `Magic-link request failed with status ${response.status}.`);
  }
}

export async function syncBrowserSessionToAppCookie(redirectTo: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  const authClient = client.auth as any;
  const { data, error } = await authClient.getSession();

  if (error) {
    throw new Error(error.message);
  }

  const session = data.session;
  if (!session?.access_token) {
    throw new Error("No Supabase session was found in the browser.");
  }

  const response = await fetch("/api/auth/supabase/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      accessToken: session.access_token,
      redirectTo,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `Session sync failed with status ${response.status}.`);
  }
}
