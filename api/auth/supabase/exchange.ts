import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createAuthSessionCookie, hasFounderOrAdminAccess } from "../../_lib/auth.js";
import {
  fetchSupabaseDiscoveryDocument,
  getSupabaseAuthorizeUrl,
  getSupabaseClientId,
  getSupabaseProjectUrl,
  getSupabaseTokenUrl,
  verifySupabaseJwt,
} from "../../_lib/supabaseOidc.js";
import { sendJson } from "../../_lib/response.js";

interface ExchangeRequestBody {
  code?: string;
  codeVerifier?: string;
  redirectUri?: string;
  nonce?: string;
}

interface TokenResponse {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

function readBody(body: unknown): ExchangeRequestBody {
  if (!body || typeof body !== "object") {
    return {};
  }

  return body as ExchangeRequestBody;
}

function readToken(body: TokenResponse): string {
  return body.id_token?.trim() || body.access_token?.trim() || "";
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const projectUrl = getSupabaseProjectUrl();
  const clientId = getSupabaseClientId();

  if (!projectUrl || !clientId) {
    sendJson(res, 500, {
      error: "Supabase OAuth is not configured.",
      details: {
        projectUrlConfigured: Boolean(projectUrl),
        clientIdConfigured: Boolean(clientId),
      },
    });
    return;
  }

  const body = readBody(req.body);
  const code = body.code?.trim() || "";
  const codeVerifier = body.codeVerifier?.trim() || "";
  const redirectUri = body.redirectUri?.trim() || "";
  const nonce = body.nonce?.trim() || "";

  if (!code || !codeVerifier || !redirectUri) {
    sendJson(res, 400, {
      error: "code, codeVerifier, and redirectUri are required.",
    });
    return;
  }

  const discovery = await fetchSupabaseDiscoveryDocument(projectUrl);
  const tokenUrl = getSupabaseTokenUrl(projectUrl) || discovery.token_endpoint;
  const authorizeUrl = getSupabaseAuthorizeUrl(projectUrl) || discovery.authorization_endpoint;

  if (!tokenUrl || !authorizeUrl) {
    sendJson(res, 500, { error: "Supabase OAuth endpoints are unavailable." });
    return;
  }

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
  });

  const tokenPayload = (await tokenResponse.json().catch(() => ({}))) as TokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok) {
    sendJson(res, tokenResponse.status, {
      error: tokenPayload.error_description || tokenPayload.error || "Failed to exchange OAuth code.",
      details: tokenPayload,
    });
    return;
  }

  const jwt = readToken(tokenPayload);
  if (!jwt) {
    sendJson(res, 502, { error: "Supabase did not return a session token." });
    return;
  }

  const claims = await verifySupabaseJwt(jwt, {
    expectedIssuer: discovery.issuer,
    expectedAudience: clientId,
    expectedNonce: nonce || undefined,
  });

  const email = typeof claims.email === "string" ? claims.email : "";
  const userId = claims.sub;

  if (!email) {
    sendJson(res, 502, { error: "Supabase did not return an email address." });
    return;
  }

  const role = hasFounderOrAdminAccess({ email, isAdmin: false }) ? "admin" : "user";
  const cookie = createAuthSessionCookie(email, userId, role);

  res.setHeader("Set-Cookie", cookie);
  sendJson(res, 200, {
    authenticated: true,
    user: {
      id: userId,
      email,
      role,
    },
    provider: "supabase",
  });
}
