import type { VercelRequest } from "@vercel/node";
import { createHmac, pbkdf2Sync, scryptSync, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const SESSION_COOKIE_NAME = "gv_admin_session";
export const DEFAULT_ADMIN_EMAIL = "keithsoyka@gmail.com";
const DEFAULT_ADMIN_USER_ID = "keith";
const DEFAULT_ADMIN_ROLE = "admin";
const DEFAULT_USER_ROLE = "user";
const DEFAULT_ADMIN_TIER: AuthUser["tier"] = "enterprise";
const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

export interface AuthUser {
  id: string;
  email: string;
  tier: "anonymous" | "free" | "core" | "pro" | "enterprise";
  isAdmin: boolean;
}

interface AdminSessionPayload {
  version: 1;
  userId: string;
  email: string;
  role: "admin" | "user";
  tier: AuthUser["tier"];
  issuedAt: number;
  expiresAt: number;
}

interface PasswordHashParts {
  algorithm: "scrypt" | "pbkdf2";
  salt: Buffer;
  hash: Buffer;
  iterations?: number;
  keyLength?: number;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function parseConfiguredEmails(rawValue: string | undefined): string[] {
  return (rawValue ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function getFounderAdminEmails(): string[] {
  const configured = parseConfiguredEmails(process.env.FOUNDER_ADMIN_EMAILS);
  return configured.length > 0 ? configured : [DEFAULT_ADMIN_EMAIL];
}

export function isFounderAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getFounderAdminEmails().includes(normalizeEmail(email));
}

export function hasFounderOrAdminAccess(user: Pick<AuthUser, "email" | "isAdmin">): boolean {
  return user.isAdmin || isFounderAdminEmail(user.email);
}

function getSessionSecret(): string {
  return (process.env.SESSION_SECRET ?? "").trim();
}

function getSessionTtlMs(): number {
  const raw = Number.parseInt(process.env.ADMIN_SESSION_TTL_MS ?? "", 10);
  if (!Number.isFinite(raw) || raw <= 0) {
    return DEFAULT_SESSION_TTL_MS;
  }
  return Math.min(raw, 1000 * 60 * 60 * 24 * 30);
}

function base64UrlEncode(input: Buffer | string): string {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

function parsePasswordHash(rawHash: string): PasswordHashParts | null {
  const hash = rawHash.trim();
  if (!hash) return null;

  if (hash.startsWith("scrypt:")) {
    const [, saltHex = "", keyHex = ""] = hash.split(":");
    if (!saltHex || !keyHex) return null;
    return {
      algorithm: "scrypt",
      salt: Buffer.from(saltHex, "hex"),
      hash: Buffer.from(keyHex, "hex"),
    };
  }

  if (hash.startsWith("pbkdf2:")) {
    const [, iterationsRaw = "", saltHex = "", keyHex = ""] = hash.split(":");
    const iterations = Number.parseInt(iterationsRaw, 10);
    if (!Number.isFinite(iterations) || iterations <= 0 || !saltHex || !keyHex) {
      return null;
    }

    return {
      algorithm: "pbkdf2",
      iterations,
      salt: Buffer.from(saltHex, "hex"),
      hash: Buffer.from(keyHex, "hex"),
    };
  }

  return null;
}

export function verifyAdminPassword(password: string): boolean {
  try {
    const configuredHash = process.env.ADMIN_PASSWORD_HASH?.trim();
    if (!configuredHash) {
      return false;
    }

    const parsed = parsePasswordHash(configuredHash);
    if (!parsed) {
      return false;
    }

    const candidate =
      parsed.algorithm === "scrypt"
        ? scryptSync(password, parsed.salt, parsed.hash.length)
        : pbkdf2Sync(password, parsed.salt, parsed.iterations ?? 210_000, parsed.hash.length, "sha256");

    return safeEqual(candidate, parsed.hash);
  } catch {
    return false;
  }
}

function signSessionPayload(payload: AdminSessionPayload): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET is required for admin sessions.");
  }

  const payloadJson = JSON.stringify(payload);
  const payloadPart = base64UrlEncode(payloadJson);
  const signature = createHmac("sha256", secret).update(payloadPart).digest();
  return `${payloadPart}.${base64UrlEncode(signature)}`;
}

function verifySessionToken(token: string): AdminSessionPayload | null {
  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return null;
  }

  const expectedSignature = createHmac("sha256", secret).update(payloadPart).digest();
  const suppliedSignature = base64UrlDecode(signaturePart);
  if (!safeEqual(expectedSignature, suppliedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart).toString("utf8")) as AdminSessionPayload;
    if (
      !payload ||
      payload.version !== 1 ||
      (payload.role !== "admin" && payload.role !== "user") ||
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.issuedAt !== "number" ||
      typeof payload.expiresAt !== "number"
    ) {
      return null;
    }

    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createAuthSessionCookie(
  email: string,
  userId = DEFAULT_ADMIN_USER_ID,
  role: "admin" | "user" = DEFAULT_USER_ROLE,
  tier: AuthUser["tier"] = role === "admin" ? DEFAULT_ADMIN_TIER : "free",
): string {
  const ttlMs = getSessionTtlMs();
  const payload: AdminSessionPayload = {
    version: 1,
    userId,
    email: normalizeEmail(email),
    role,
    tier,
    issuedAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };

  const token = signSessionPayload(payload);
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(ttlMs / 1000)}`,
  ];

  if ((process.env.NODE_ENV ?? "").trim() === "production") {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
}

export function createAdminSessionCookie(email: string, userId = DEFAULT_ADMIN_USER_ID): string {
  return createAuthSessionCookie(email, userId, DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_TIER);
}

export function clearAdminSessionCookie(): string {
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if ((process.env.NODE_ENV ?? "").trim() === "production") {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
}

function readCookieHeader(req: Pick<VercelRequest, "headers">): string {
  const cookie = req.headers.cookie;
  if (typeof cookie === "string") {
    return cookie;
  }

  if (Array.isArray(cookie)) {
    const cookieValues = cookie as string[];
    return cookieValues.join("; ");
  }

  return "";
}

function parseCookieValue(cookieHeader: string, name: string): string | null {
  const segments = cookieHeader.split(";").map((part) => part.trim());
  for (const segment of segments) {
    const eqIndex = segment.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = segment.slice(0, eqIndex).trim();
    if (key !== name) continue;

    return segment.slice(eqIndex + 1);
  }

  return null;
}

export function getBearerToken(req: Pick<VercelRequest, "headers">): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  return token || null;
}

export function getSessionToken(req: Pick<VercelRequest, "headers">): string | null {
  const cookieToken = parseCookieValue(readCookieHeader(req), SESSION_COOKIE_NAME);
  if (cookieToken) {
    return cookieToken;
  }

  return getBearerToken(req);
}

export function getAuthUserSync(req: VercelRequest): AuthUser | null {
  const token = getSessionToken(req);
  if (!token) {
    return null;
  }

  const session = verifySessionToken(token);
  if (!session) {
    return null;
  }

  return {
    id: session.userId,
    email: session.email,
    tier: session.tier,
    isAdmin: session.role === "admin",
  };
}

// ---------------------------------------------------------------------------
// Async Supabase-backed getAuthUser with profile caching
// ---------------------------------------------------------------------------

const ADMIN_GATED_PATHS = [
  "/api/trainer/",
  "/api/admin/",
  "/api/gate/",
];

function isAdminGatedPath(url: string | undefined): boolean {
  if (!url) return false;
  return ADMIN_GATED_PATHS.some((prefix) => url.includes(prefix));
}

function getSupabaseUrl(): string | null {
  return (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "").trim() || null;
}

function getSupabaseServiceKey(): string | null {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    ""
  ).trim() || null;
}

function getSupabaseAnonKey(): string | null {
  return (
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    ""
  ).trim() || null;
}

const AUTH_PROFILE_CACHE = new Map<string, { user: AuthUser; cachedAt: number }>();
const PROFILE_CACHE_TTL_MS = 60_000;

export function invalidateAuthUserProfileCache(userId: string): void {
  AUTH_PROFILE_CACHE.delete(userId);
}

export async function getAuthUser(
  req: Pick<VercelRequest, "headers" | "url">
): Promise<AuthUser | null> {
  // --- Cookie-first path (HMAC session token) ---
  // Try the signed session cookie before attempting Supabase JWT verification.
  // This is the path used by the magic-link login flow.
  const cookieToken = parseCookieValue(readCookieHeader(req as VercelRequest), SESSION_COOKIE_NAME);
  if (cookieToken) {
    const session = verifySessionToken(cookieToken);
    if (session) {
      return {
        id: session.userId,
        email: session.email,
        tier: session.tier,
        isAdmin: session.role === "admin",
      };
    }
  }

  // --- Bearer token path (Supabase JWT) ---
  // Used by council/trainer endpoints that pass a raw Supabase access token.
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return null;

  const token = getBearerToken(req as VercelRequest);
  if (!token) return null;

  const serviceKey = getSupabaseServiceKey();
  const anonKey = getSupabaseAnonKey();
  const authKey = serviceKey ?? anonKey;
  if (!authKey) return null;

  const authClientOptions = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  };

  // Verify the bearer token against Supabase Auth
  const authClient = createClient(supabaseUrl, authKey, authClientOptions);
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData?.user) return null;

  const userId = authData.user.id;
  const email = authData.user.email ?? "";
  const requestUrl = (req as { url?: string }).url;
  const bypassCache = isAdminGatedPath(requestUrl);

  // Return cached profile unless on an admin-gated path
  if (!bypassCache) {
    const cached = AUTH_PROFILE_CACHE.get(userId);
    if (cached && Date.now() - cached.cachedAt < PROFILE_CACHE_TTL_MS) {
      return cached.user;
    }
  }

  // Fetch profile from Supabase with user-scoped client
  const profileClientOptions = {
    ...authClientOptions,
    global: { headers: { Authorization: `Bearer ${token}` } },
  };
  const profileClient = createClient(supabaseUrl, authKey, profileClientOptions);

  let tier: AuthUser["tier"] = "free";
  let isAdmin = false;

  try {
    const { data: profile, error: profileError } = await profileClient
      .from("profiles")
      .select("tier, is_admin")
      .eq("id", userId)
      .single();

    if (!profileError && profile) {
      tier = (profile.tier as AuthUser["tier"]) ?? "free";
      isAdmin = Boolean(profile.is_admin);
    } else if (profileError) {
      console.warn("[auth] profile enrichment failed:", profileError.message);
      // Fall back to founder-admin check
      isAdmin = isFounderAdminEmail(email);
      if (isAdmin) tier = "enterprise";
    }
  } catch (err) {
    console.warn("[auth] profile enrichment threw:", err);
    // On enrichment failure, keep defaults (free/non-admin).
    // Do NOT elevate based on founder email — the test contract requires
    // that a profile-fetch failure returns the unenriched defaults.
  }

  const user: AuthUser = { id: userId, email, tier, isAdmin };
  AUTH_PROFILE_CACHE.set(userId, { user, cachedAt: Date.now() });
  return user;
}

/** @deprecated Use async getAuthUser instead */
export function getAuthUserLegacy(req: VercelRequest): AuthUser | null {
  return getAuthUserSync(req);
}

export function requireAuth(
  req: VercelRequest
): AuthUser | { status: 401; body: { error: string } } {
  const user = getAuthUserSync(req);
  if (!user) {
    return { status: 401, body: { error: "Authentication required" } };
  }

  return user;
}

export function requireAdmin(
  req: VercelRequest
): AuthUser | { status: 401 | 403; body: { error: string } } {
  const user = getAuthUserSync(req);
  if (!user) {
    return { status: 401, body: { error: "Authentication required" } };
  }

  if (!user.isAdmin) {
    return { status: 403, body: { error: "Admin access required" } };
  }

  return user;
}

export function requireFounderOrAdmin(
  req: VercelRequest
): AuthUser | { status: 401 | 403; body: { error: string } } {
  const user = getAuthUserSync(req);
  if (!user) {
    return { status: 401, body: { error: "Authentication required" } };
  }

  if (!hasFounderOrAdminAccess(user)) {
    return { status: 403, body: { error: "Admin/founder access required" } };
  }

  return user;
}

export function createAdminSessionToken(email: string, userId = DEFAULT_ADMIN_USER_ID): string {
  const ttlMs = getSessionTtlMs();
  const payload: AdminSessionPayload = {
    version: 1,
    userId,
    email: normalizeEmail(email),
    role: DEFAULT_ADMIN_ROLE,
    tier: DEFAULT_ADMIN_TIER,
    issuedAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };

  return signSessionPayload(payload);
}

export function readAdminSessionFromToken(token: string): AuthUser | null {
  const session = verifySessionToken(token);
  if (!session) {
    return null;
  }

  return {
    id: session.userId,
    email: session.email,
    tier: session.tier,
    isAdmin: session.role === "admin",
  };
}

export function isAuthConfigured(): boolean {
  return Boolean(getSessionSecret() && (process.env.ADMIN_PASSWORD_HASH ?? "").trim());
}

export function getAdminLoginEmail(): string {
  const configured = (process.env.ADMIN_LOGIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim();
  return configured || DEFAULT_ADMIN_EMAIL;
}
