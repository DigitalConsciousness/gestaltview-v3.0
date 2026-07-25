import type { VercelRequest } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { EmbodimentProfile } from "../../shared/embodiment/types.js";

let cachedClient: SupabaseClient | null = null;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isFounderStudioEnabled(): boolean {
  return process.env.FOUNDER_STUDIO === "true";
}

export function getServiceClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = normalizeText(process.env.SUPABASE_URL) || normalizeText(process.env.VITE_SUPABASE_URL);
  const key = normalizeText(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });

  return cachedClient;
}

export function parseRequestBody(body: unknown): unknown {
  if (typeof body !== "string") {
    return body;
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return {};
  }

  return JSON.parse(trimmed);
}

export function getProfileValidationError(body: unknown): string | null {
  if (!isPlainObject(body)) {
    return "Profile payload must be a JSON object.";
  }

  const profile = body as Partial<EmbodimentProfile>;

  if (!normalizeText(profile.slug)) {
    return "Missing required field: slug";
  }

  if (!normalizeText(profile.publicName)) {
    return "Missing required field: publicName";
  }

  if (!normalizeText(profile.embodimentVersion)) {
    return "Missing required field: embodimentVersion";
  }

  if (!isPlainObject(profile.immutableCore)) {
    return "Missing required field: immutableCore";
  }

  return null;
}

export function normalizeProfilePayload(body: unknown): EmbodimentProfile {
  if (!isPlainObject(body)) {
    throw new Error("Profile payload must be a JSON object.");
  }

  return body as unknown as EmbodimentProfile;
}

export function normalizeSupabaseRowDate(value: string | null | undefined): string {
  return normalizeText(value);
}

export function getRequestOrigin(req: VercelRequest): string | undefined {
  const origin = req.headers.origin;
  return typeof origin === "string" ? origin : undefined;
}
