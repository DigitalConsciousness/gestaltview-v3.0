import { createPublicKey, createVerify, type JsonWebKey as CryptoJsonWebKey } from "node:crypto";

export interface SupabaseOidcDiscoveryDocument {
  issuer: string;
  jwks_uri: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
}

export interface SupabaseOidcJwk {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
}

export interface SupabaseOidcJwks {
  keys: SupabaseOidcJwk[];
}

export interface VerifiedSupabaseJwtClaims {
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  nonce?: string;
}

const discoveryCache = new Map<string, Promise<SupabaseOidcDiscoveryDocument>>();
const jwksCache = new Map<string, Promise<SupabaseOidcJwks>>();

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function decodeJson<T>(segment: string): T | null {
  try {
    return JSON.parse(base64UrlDecode(segment).toString("utf8")) as T;
  } catch {
    return null;
  }
}

function normalizeSupabaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return null;
  }
}

export function getSupabaseProjectUrl(): string | null {
  return normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
}

export function getSupabaseClientId(): string {
  return (
    process.env.SUPABASE_OAUTH_CLIENT_ID ||
    process.env.VITE_SUPABASE_OAUTH_CLIENT_ID ||
    ""
  ).trim();
}

export function getSupabaseIssuerUrl(projectUrl = getSupabaseProjectUrl()): string | null {
  return projectUrl ? `${projectUrl}/auth/v1` : null;
}

export function getSupabaseAuthorizeUrl(projectUrl = getSupabaseProjectUrl()): string | null {
  return projectUrl ? `${projectUrl}/auth/v1/authorize` : null;
}

export function getSupabaseTokenUrl(projectUrl = getSupabaseProjectUrl()): string | null {
  return projectUrl ? `${projectUrl}/auth/v1/oauth/token` : null;
}

export async function fetchSupabaseDiscoveryDocument(
  projectUrl = getSupabaseProjectUrl()
): Promise<SupabaseOidcDiscoveryDocument> {
  const issuer = getSupabaseIssuerUrl(projectUrl);
  if (!issuer) {
    throw new Error("SUPABASE_URL is not configured.");
  }

  const cacheKey = issuer;
  const existing = discoveryCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const pending = (async () => {
    const response = await fetch(`${issuer}/.well-known/openid-configuration`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to load Supabase discovery document (${response.status}).`);
    }

    const data = (await response.json()) as Partial<SupabaseOidcDiscoveryDocument>;
    if (!data.issuer || !data.jwks_uri) {
      throw new Error("Supabase discovery document is missing required fields.");
    }

    return {
      issuer: data.issuer,
      jwks_uri: data.jwks_uri,
      authorization_endpoint: data.authorization_endpoint,
      token_endpoint: data.token_endpoint,
    };
  })();

  discoveryCache.set(cacheKey, pending);
  return pending;
}

export async function fetchSupabaseJwks(issuer = getSupabaseIssuerUrl()): Promise<SupabaseOidcJwks> {
  if (!issuer) {
    throw new Error("SUPABASE_URL is not configured.");
  }

  const discovery = await fetchSupabaseDiscoveryDocument();
  const cacheKey = discovery.jwks_uri;
  const existing = jwksCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const pending = (async () => {
    const response = await fetch(discovery.jwks_uri, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to load Supabase JWKS (${response.status}).`);
    }

    const data = (await response.json()) as Partial<SupabaseOidcJwks>;
    if (!Array.isArray(data.keys)) {
      throw new Error("Supabase JWKS payload is invalid.");
    }

    return { keys: data.keys };
  })();

  jwksCache.set(cacheKey, pending);
  return pending;
}

function verifyJwtWithRsa(jwt: string, jwk: SupabaseOidcJwk): boolean {
  if (jwk.kty !== "RSA" || jwk.alg !== "RS256") {
    return false;
  }

  try {
    const [headerPart, payloadPart, signaturePart] = jwt.split(".");
    if (!headerPart || !payloadPart || !signaturePart) {
      return false;
    }

    const key = createPublicKey({ key: jwk as CryptoJsonWebKey, format: "jwk" });
    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${headerPart}.${payloadPart}`);
    verifier.end();
    return verifier.verify(key, base64UrlDecode(signaturePart));
  } catch {
    return false;
  }
}

export async function verifySupabaseJwt(
  jwt: string,
  options: {
    expectedIssuer?: string;
    expectedAudience?: string;
    expectedNonce?: string;
  } = {}
): Promise<VerifiedSupabaseJwtClaims> {
  const [headerPart, payloadPart, signaturePart] = jwt.split(".");
  if (!headerPart || !payloadPart || !signaturePart) {
    throw new Error("Token is not a valid JWT.");
  }

  const header = decodeJson<{ alg?: string; kid?: string }>(headerPart);
  const payload = decodeJson<VerifiedSupabaseJwtClaims>(payloadPart);
  if (!header || !payload) {
    throw new Error("Token payload could not be decoded.");
  }

  const discovery = await fetchSupabaseDiscoveryDocument();
  const expectedIssuer = options.expectedIssuer || discovery.issuer;
  const expectedAudience = options.expectedAudience?.trim() || getSupabaseClientId();

  if (!expectedAudience) {
    throw new Error("SUPABASE_OAUTH_CLIENT_ID is not configured.");
  }

  if (payload.iss !== expectedIssuer) {
    throw new Error("Token issuer did not match the Supabase project.");
  }

  const audienceMatches = Array.isArray(payload.aud)
    ? payload.aud.includes(expectedAudience)
    : payload.aud === expectedAudience;
  if (!audienceMatches) {
    throw new Error("Token audience did not match the OAuth client.");
  }

  if (payload.exp * 1000 <= Date.now()) {
    throw new Error("Token has expired.");
  }

  if (options.expectedNonce && payload.nonce !== options.expectedNonce) {
    throw new Error("Token nonce did not match the original request.");
  }

  const jwks = await fetchSupabaseJwks();
  const jwk = jwks.keys.find((key) => key.kid === header.kid);
  if (!jwk) {
    throw new Error("No matching Supabase signing key was found.");
  }

  if (!verifyJwtWithRsa(jwt, jwk)) {
    throw new Error("Supabase JWT signature verification failed.");
  }

  return payload;
}
