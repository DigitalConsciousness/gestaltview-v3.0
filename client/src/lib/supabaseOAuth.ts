import { consumeStoredAuthRedirect, persistAuthRedirect } from "./authRedirect";

export type SupabaseOAuthMode = "signin" | "signup";
export type SupabaseOAuthProvider = "github" | string;

export interface SupabaseOAuthTransaction {
  state: string;
  nonce: string;
  codeVerifier: string;
  redirectTo: string;
  mode: SupabaseOAuthMode;
  provider: SupabaseOAuthProvider;
  createdAt: number;
}

export interface SupabaseOAuthSession {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    role: "admin" | "user";
  };
  provider?: string;
}

const STORAGE_KEY = "gv_supabase_oauth_txn";
const CALLBACK_PATH = "/auth/callback";

function getSupabaseBaseUrl(): string {
  const value = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!value) {
    throw new Error("VITE_SUPABASE_URL is not configured.");
  }

  return value.replace(/\/+$/g, "");
}

function getSupabaseClientId(): string {
  const value = import.meta.env.VITE_SUPABASE_OAUTH_CLIENT_ID?.trim();
  if (!value) {
    throw new Error("VITE_SUPABASE_OAUTH_CLIENT_ID is not configured.");
  }

  return value;
}

function getRedirectUri(): string {
  return `${window.location.origin}${CALLBACK_PATH}`;
}

function randomBytes(length = 32): Uint8Array {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return buffer;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Base64Url(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return base64UrlEncode(new Uint8Array(digest));
}

function createRandomToken(length = 32): string {
  return base64UrlEncode(randomBytes(length));
}

function readTransaction(storage: Storage | null | undefined): SupabaseOAuthTransaction | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SupabaseOAuthTransaction;
    if (
      typeof parsed.state !== "string" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.codeVerifier !== "string" ||
      typeof parsed.redirectTo !== "string" ||
      typeof parsed.mode !== "string" ||
      typeof parsed.createdAt !== "number"
    ) {
      return null;
    }

    return {
      ...parsed,
      provider: typeof parsed.provider === "string" && parsed.provider.trim() ? parsed.provider : "github",
    };
  } catch {
    return null;
  }
}

function writeTransaction(storage: Storage | null | undefined, txn: SupabaseOAuthTransaction): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(txn));
  } catch {
    throw new Error("Unable to persist the Supabase auth transaction.");
  }
}

function clearTransaction(storage: Storage | null | undefined): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore cleanup failures.
  }
}

function buildAuthorizeUrl(params: {
  redirectUri: string;
  codeChallenge: string;
  state: string;
  nonce: string;
  provider: SupabaseOAuthProvider;
}): string {
  const url = new URL(`${getSupabaseBaseUrl()}/auth/v1/authorize`);
  url.searchParams.set("client_id", getSupabaseClientId());
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("provider", params.provider);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  return url.toString();
}

export function isSupabaseOAuthConfigured(): boolean {
  try {
    return Boolean(import.meta.env.VITE_SUPABASE_URL?.trim() && import.meta.env.VITE_SUPABASE_OAUTH_CLIENT_ID?.trim());
  } catch {
    return false;
  }
}

export function persistSupabaseOAuthRedirect(redirectTo: string): void {
  persistAuthRedirect(sessionStorage, redirectTo);
}

export async function beginSupabaseOAuthFlow(
  mode: SupabaseOAuthMode,
  redirectTo: string,
  provider: SupabaseOAuthProvider = "github"
): Promise<void> {
  const codeVerifier = createRandomToken(48);
  const state = createRandomToken(24);
  const nonce = createRandomToken(24);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const transaction: SupabaseOAuthTransaction = {
    state,
    nonce,
    codeVerifier,
    redirectTo,
    mode,
    provider,
    createdAt: Date.now(),
  };

  writeTransaction(sessionStorage, transaction);
  persistAuthRedirect(sessionStorage, redirectTo);
  window.location.assign(
    buildAuthorizeUrl({
      redirectUri: getRedirectUri(),
      codeChallenge,
      state,
      nonce,
      provider,
    })
  );
}

export function readSupabaseOAuthTransaction(): SupabaseOAuthTransaction | null {
  return readTransaction(sessionStorage);
}

export function clearSupabaseOAuthTransaction(): void {
  clearTransaction(sessionStorage);
}

export async function completeSupabaseOAuthFlow(
  search: string
): Promise<{ redirectTo: string; session: SupabaseOAuthSession }> {
  const params = new URLSearchParams(search);
  const error = params.get("error");
  if (error) {
    throw new Error(params.get("error_description") || error);
  }

  const code = params.get("code")?.trim() || "";
  const state = params.get("state")?.trim() || "";
  if (!code) {
    throw new Error("Missing OAuth code in the callback URL.");
  }

  const transaction = readSupabaseOAuthTransaction();
  if (!transaction) {
    throw new Error("No pending Supabase OAuth transaction was found.");
  }

  if (transaction.state !== state) {
    throw new Error("The OAuth callback did not match the original request.");
  }

  const redirectUri = getRedirectUri();
  const response = await fetch("/api/auth/supabase/exchange", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      code,
      codeVerifier: transaction.codeVerifier,
      redirectUri,
      nonce: transaction.nonce,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    details?: unknown;
  } & Partial<SupabaseOAuthSession>;

  if (!response.ok) {
    throw new Error(payload.error || `OAuth exchange failed with status ${response.status}.`);
  }

  if (!payload.authenticated || !payload.user) {
    throw new Error("OAuth exchange completed without an authenticated session.");
  }

  clearSupabaseOAuthTransaction();
  consumeStoredAuthRedirect(sessionStorage, transaction.redirectTo);

  return {
    redirectTo: transaction.redirectTo,
    session: payload as SupabaseOAuthSession,
  };
}
