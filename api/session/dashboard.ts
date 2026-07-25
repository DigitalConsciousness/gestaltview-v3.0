import type { VercelRequest, VercelResponse } from "@vercel/node";

import { invalidateAuthUserProfileCache, requireAuth, type AuthUser } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  getFounderContext,
  getUserAccount,
  getVoiceProfile,
  listUserAccounts,
  upsertFounderContext,
  upsertUserAccount,
  upsertVoiceProfile,
  type FounderContextUpdate,
  type UserAccountRow,
  type UserAccountUpdate,
  type VoiceProfileUpdate,
} from "../_lib/supabase.js";

const DEFAULT_FOUNDER_ADMIN_EMAILS = ["keithsoyka@gmail.com"];

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function getFounderAdminEmails(): string[] {
  const configured = (process.env.FOUNDER_ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  return configured.length > 0 ? configured : DEFAULT_FOUNDER_ADMIN_EMAILS;
}

function isFounderBootstrapEligible(user: AuthUser): boolean {
  const email = normalizeEmail(user.email);
  if (!email) return false;
  return getFounderAdminEmails().includes(email);
}

function canManageFounderContext(user: AuthUser): boolean {
  return user.isAdmin || isFounderBootstrapEligible(user);
}

async function canManageAdminAccounts(user: AuthUser): Promise<boolean> {
  if (user.isAdmin) {
    return true;
  }

  try {
    const account = await getUserAccount(user.id);
    return account?.is_admin ?? false;
  } catch {
    return false;
  }
}

function fallbackUserAccount(user: AuthUser): UserAccountRow {
  return {
    id: user.id,
    email: user.email,
    tier: user.tier === "anonymous" ? "free" : user.tier,
    subscription_status: "inactive",
    billing_period_start: null,
    billy_query_count: 0,
    is_admin: user.isAdmin,
    grace_until: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  };
}

function trimOptionalText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : "";
}

function sanitizeFounderContextPayload(body: Record<string, unknown>): FounderContextUpdate | null {
  const payload: FounderContextUpdate = {};

  if ("currentState" in body || "current_state" in body) {
    const currentState = trimOptionalText(body.currentState ?? body.current_state, 4000);
    if (currentState !== undefined) {
      payload.current_state = currentState;
    }
  }

  if ("sessionThread" in body || "session_thread" in body) {
    const sessionThread = trimOptionalText(body.sessionThread ?? body.session_thread, 12000);
    if (sessionThread !== undefined) {
      payload.session_thread = sessionThread;
    }
  }

  const modePreference = body.modePreference ?? body.mode_preference;
  if (modePreference === "synthesis" || modePreference === "chat") {
    payload.mode_preference = modePreference;
  }

  const confirmedAdult = body.confirmedAdult ?? body.confirmed_adult;
  if (typeof confirmedAdult === "boolean") {
    payload.confirmed_adult = confirmedAdult;
  }

  const rawPlkSnapshot = body.plkSnapshot ?? body.plk_snapshot;
  if (rawPlkSnapshot === null) {
    payload.plk_snapshot = null;
  } else if (
    rawPlkSnapshot &&
    typeof rawPlkSnapshot === "object" &&
    !Array.isArray(rawPlkSnapshot)
  ) {
    payload.plk_snapshot = rawPlkSnapshot as Record<string, unknown>;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

function parseNullableIsoDate(value: unknown, fieldName: string): { value: string | null } | { error: string } {
  if (value === null) {
    return { value: null };
  }

  if (typeof value !== "string") {
    return { error: `${fieldName} must be a string or null.` };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { value: null };
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return { error: `${fieldName} must be a valid date-time.` };
  }

  return { value: parsed.toISOString() };
}

function sanitizeAdminUserAccountPayload(
  body: Record<string, unknown>
): { targetUserId: string; payload: UserAccountUpdate } | { error: string } {
  const targetUserId =
    typeof body.targetUserId === "string"
      ? body.targetUserId.trim()
      : typeof body.target_user_id === "string"
        ? body.target_user_id.trim()
        : "";

  if (!targetUserId) {
    return { error: "targetUserId is required." };
  }

  const payload: UserAccountUpdate = {};

  if (body.tier === "free" || body.tier === "core" || body.tier === "pro" || body.tier === "enterprise") {
    payload.tier = body.tier;
  }

  const hasSubscriptionStatus = "subscriptionStatus" in body || "subscription_status" in body;
  const subscriptionStatus = hasSubscriptionStatus
    ? body.subscriptionStatus ?? body.subscription_status ?? null
    : undefined;
  if (
    subscriptionStatus === "active" ||
    subscriptionStatus === "inactive" ||
    subscriptionStatus === "past_due" ||
    subscriptionStatus === "canceled" ||
    subscriptionStatus === "trialing" ||
    subscriptionStatus === null
  ) {
    payload.subscription_status = subscriptionStatus;
  }

  if (typeof body.isAdmin === "boolean") {
    payload.is_admin = body.isAdmin;
  } else if (typeof body.is_admin === "boolean") {
    payload.is_admin = body.is_admin;
  }

  if ("graceUntil" in body || "grace_until" in body) {
    const graceUntilInput =
      "graceUntil" in body ? body.graceUntil : body.grace_until;
    const parsed = parseNullableIsoDate(graceUntilInput, "graceUntil");
    if ("error" in parsed) return parsed;
    payload.grace_until = parsed.value;
  }

  if ("billingPeriodStart" in body || "billing_period_start" in body) {
    const billingPeriodStartInput =
      "billingPeriodStart" in body ? body.billingPeriodStart : body.billing_period_start;
    const parsed = parseNullableIsoDate(billingPeriodStartInput, "billingPeriodStart");
    if ("error" in parsed) return parsed;
    payload.billing_period_start = parsed.value;
  }

  return Object.keys(payload).length > 0
    ? { targetUserId, payload }
    : { error: "No valid user account fields were provided." };
}

function parseJsonObject(value: unknown, fieldName: string): Record<string, unknown> | null | { error: string } {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return { error: `${fieldName} must be valid JSON.` };
    }
  }

  return { error: `${fieldName} must be an object or JSON string.` };
}

function sanitizeVoiceProfilePayload(
  body: Record<string, unknown>
): VoiceProfileUpdate | { error: string } {
  const payload: VoiceProfileUpdate = {};

  const profileSlug =
    typeof body.profileSlug === "string"
      ? body.profileSlug.trim()
      : typeof body.profile_slug === "string"
        ? body.profile_slug.trim()
        : "";

  if (profileSlug) {
    payload.profile_slug = profileSlug.slice(0, 120);
  }

  const displayName =
    typeof body.displayName === "string"
      ? body.displayName.trim()
      : typeof body.display_name === "string"
        ? body.display_name.trim()
        : "";
  if (displayName) {
    payload.display_name = displayName.slice(0, 120);
  }

  const providerPreference = body.providerPreference ?? body.provider_preference;
  if (
    providerPreference === "local" ||
    providerPreference === "hf" ||
    providerPreference === "elevenlabs" ||
    providerPreference === "browser" ||
    providerPreference === "deepgram"
  ) {
    payload.provider_preference = providerPreference;
  }

  const ttsModel =
    typeof body.ttsModel === "string"
      ? body.ttsModel.trim()
      : typeof body.tts_model === "string"
        ? body.tts_model.trim()
        : "";
  if (ttsModel) {
    payload.tts_model = ttsModel.slice(0, 120);
  } else if (body.ttsModel === null || body.tts_model === null) {
    payload.tts_model = null;
  }

  const sttModel =
    typeof body.sttModel === "string"
      ? body.sttModel.trim()
      : typeof body.stt_model === "string"
        ? body.stt_model.trim()
        : "";
  if (sttModel) {
    payload.stt_model = sttModel.slice(0, 120);
  } else if (body.sttModel === null || body.stt_model === null) {
    payload.stt_model = null;
  }

  const speakerId =
    typeof body.speakerId === "string"
      ? body.speakerId.trim()
      : typeof body.speaker_id === "string"
        ? body.speaker_id.trim()
        : "";
  if (speakerId) {
    payload.speaker_id = speakerId.slice(0, 120);
  } else if (body.speakerId === null || body.speaker_id === null) {
    payload.speaker_id = null;
  }

  const stylePreset = parseJsonObject(body.stylePreset ?? body.style_preset, "stylePreset");
  if (stylePreset && "error" in stylePreset) return stylePreset;
  if (stylePreset !== null) {
    payload.style_preset = stylePreset;
  }

  const providerConfig = parseJsonObject(body.providerConfig ?? body.provider_config, "providerConfig");
  if (providerConfig && "error" in providerConfig) return providerConfig;
  if (providerConfig !== null) {
    payload.provider_config = providerConfig;
  }

  if (typeof body.fallbackTextOnly === "boolean") {
    payload.fallback_text_only = body.fallbackTextOnly;
  } else if (typeof body.fallback_text_only === "boolean") {
    payload.fallback_text_only = body.fallback_text_only;
  }

  const consentNotes =
    typeof body.consentNotes === "string"
      ? body.consentNotes.trim()
      : typeof body.consent_notes === "string"
        ? body.consent_notes.trim()
        : "";
  if (consentNotes) {
    payload.consent_notes = consentNotes.slice(0, 12000);
  } else if (body.consentNotes === null || body.consent_notes === null) {
    payload.consent_notes = null;
  }

  const reviewStatus = body.reviewStatus ?? body.review_status;
  if (
    reviewStatus === "proposed" ||
    reviewStatus === "auditioned" ||
    reviewStatus === "approved" ||
    reviewStatus === "rejected"
  ) {
    payload.review_status = reviewStatus;
  }

  if ("lastAuditionedAt" in body || "last_auditioned_at" in body) {
    const parsed = parseNullableIsoDate(body.lastAuditionedAt ?? body.last_auditioned_at, "lastAuditionedAt");
    if ("error" in parsed) return parsed;
    payload.last_auditioned_at = parsed.value;
  }

  if ("approvedAt" in body || "approved_at" in body) {
    const parsed = parseNullableIsoDate(body.approvedAt ?? body.approved_at, "approvedAt");
    if ("error" in parsed) return parsed;
    payload.approved_at = parsed.value;
  }

  return payload.profile_slug && payload.display_name
    ? payload
    : { error: "profileSlug and displayName are required." };
}

function hasAnyConfiguredEnv(keys: string[]): boolean {
  return keys.some((key) => Boolean(process.env[key]?.trim()));
}

function hasAllConfiguredEnv(keys: string[]): boolean {
  return keys.every((key) => Boolean(process.env[key]?.trim()));
}

const DEFAULT_VOICE_PROFILE_SLUG = process.env.VOICE_PROFILE_SLUG?.trim() || "billy";

function buildFallbackVoiceProfile(): VoiceProfileUpdate & {
  id: string;
  profile_slug: string;
  display_name: string;
  provider_preference: "local" | "hf" | "elevenlabs" | "browser" | "deepgram";
  tts_model: string | null;
  stt_model: string | null;
  speaker_id: string | null;
  style_preset: Record<string, unknown>;
  fallback_text_only: boolean;
  consent_notes: string | null;
  provider_config: Record<string, unknown>;
  review_status: "proposed" | "auditioned" | "approved" | "rejected";
  last_auditioned_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
} {
  return {
    id: "fallback-billy-voice-profile",
    profile_slug: DEFAULT_VOICE_PROFILE_SLUG,
    display_name: "Billy",
    provider_preference: "deepgram" as const,
    tts_model: process.env.DEEPGRAM_BILLY_TTS_MODEL?.trim() || "aura-2-aries-en",
    stt_model: "nova-3",
    speaker_id: "aries",
    style_preset: {
      warmth: 0.75,
      pace: Number.parseFloat(process.env.DEEPGRAM_BILLY_TTS_SPEED || "0.98"),
      humor: 0.25,
      energy: 0.55,
      clarity: 0.92,
    },
    fallback_text_only: true,
    consent_notes:
      "Stock voice assignment only. Never clone or impersonate a named human reference from the embodiment profile.",
    provider_config: {
      speed: Number.parseFloat(process.env.DEEPGRAM_BILLY_TTS_SPEED || "0.98"),
      live_stt_model: "flux-general-en",
      greeting: "Hey. Good to hear you. What is on your mind?",
    },
    review_status: "proposed" as const,
    last_auditioned_at: null,
    approved_at: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  };
}

async function buildDashboardPayload(user: AuthUser) {
  const degradedReasons: string[] = [];
  let account = fallbackUserAccount(user);

  try {
    account = (await getUserAccount(user.id)) ?? fallbackUserAccount(user);
  } catch (error) {
    degradedReasons.push(
      `user_account_unavailable:${error instanceof Error ? error.message : String(error)}`
    );
  }

  const effectiveUser: AuthUser = {
    ...user,
    email: account.email || user.email,
    tier: account.tier,
    isAdmin: account.is_admin,
  };
  const founderBootstrapEligible = isFounderBootstrapEligible(effectiveUser);
  const founderControlActive = canManageFounderContext(effectiveUser);
  let founderContext = null;
  let adminUsers: UserAccountRow[] = [];
  let voiceProfile: ReturnType<typeof buildFallbackVoiceProfile> = buildFallbackVoiceProfile();

  if (founderControlActive) {
    try {
      founderContext = await getFounderContext(user.id);
    } catch (error) {
      degradedReasons.push(
        `founder_context_unavailable:${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (account.is_admin) {
    try {
      adminUsers = (await listUserAccounts(60)) ?? [];
    } catch (error) {
      degradedReasons.push(
        `admin_users_unavailable:${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  try {
    const persistedVoiceProfile = await getVoiceProfile(DEFAULT_VOICE_PROFILE_SLUG);
    if (persistedVoiceProfile) {
      voiceProfile = {
        ...voiceProfile,
        ...persistedVoiceProfile,
      };
    }
  } catch (error) {
    degradedReasons.push(
      `voice_profile_unavailable:${error instanceof Error ? error.message : String(error)}`
    );
  }

  return {
    ok: true,
    degraded: degradedReasons.length > 0,
    reason: degradedReasons.length > 0 ? "dashboard_partial_supabase_unavailable" : null,
    degradedReasons,
    profile: {
      id: account.id,
      email: account.email,
      tier: account.tier,
      subscriptionStatus: account.subscription_status ?? "inactive",
      billingPeriodStart: account.billing_period_start,
      billyQueryCount: account.billy_query_count,
      isAdmin: account.is_admin,
      graceUntil: account.grace_until,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
    },
    controls: {
      founderBootstrapEligible,
      founderControlActive,
      canAccessAdminTools: account.is_admin,
      adminSeedHint:
        founderBootstrapEligible && !account.is_admin
          ? "Activate founder admin to unlock internal control surfaces."
          : null,
    },
    founderContext: founderContext
      ? {
          currentState: founderContext.current_state ?? "",
          sessionThread: founderContext.session_thread ?? "",
          modePreference: founderContext.mode_preference ?? "synthesis",
          confirmedAdult: founderContext.confirmed_adult ?? false,
          plkSnapshot: founderContext.plk_snapshot ?? {},
          lastSessionAt: founderContext.last_session_at,
          createdAt: founderContext.created_at,
          updatedAt: founderContext.updated_at,
        }
      : null,
    shortcuts: {
      billy: "/billy",
      billyVoiceStudio: "/billy/voicestudio",
      trainer: "/agent-trainer/control-plane",
      metrics: "/metrics-dashboard",
      pricing: "/pricing",
    },
    billyRuntime: {
      liveConsolePath: "/billy",
      voiceStudioPath: "/billy/voicestudio",
      textApiPath: "/api/billy",
      voiceApiPath: "/api/voice/billy",
      healthApiPath: "/api/billy-health",
      textProviders: {
        groq: hasAnyConfiguredEnv(["GROQ_API_KEY"]),
        openai: hasAnyConfiguredEnv(["OPENAI_API_KEY"]),
        openRouter: hasAnyConfiguredEnv(["OPENROUTER_API_KEY"]),
        gemini: hasAnyConfiguredEnv(["GEMINI_API_KEY"]),
        huggingFace: hasAnyConfiguredEnv(["HUGGINGFACE_API_KEY"]),
      },
      voiceStack: {
        deepgram: hasAllConfiguredEnv(["DEEPGRAM_API_KEY"]),
        liveKit: hasAllConfiguredEnv(["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]),
        voiceProfile: hasAnyConfiguredEnv(["VOICE_PROFILE_SLUG"]),
        billyWorker: hasAnyConfiguredEnv(["BILLY_API_URL"]),
      },
    },
    voiceProfile,
    adminUsers: adminUsers.map((row) => ({
      id: row.id,
      email: row.email,
      tier: row.tier,
      subscriptionStatus: row.subscription_status ?? "inactive",
      billingPeriodStart: row.billing_period_start,
      billyQueryCount: row.billy_query_count,
      isAdmin: row.is_admin,
      graceUntil: row.grace_until,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["GET", "PATCH", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const auth = await requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  if (req.method === "GET") {
    sendJson(res, 200, await buildDashboardPayload(auth));
    return;
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as Record<string, unknown>;

    if (body.action === "bootstrap-founder-admin") {
      if (!isFounderBootstrapEligible(auth)) {
        sendJson(res, 403, { error: "Founder admin activation is not available for this account." });
        return;
      }

      const updated = await upsertUserAccount(auth.id, {
        email: auth.email,
        tier: "enterprise",
        subscription_status: "active",
        is_admin: true,
      });

      if (!updated) {
        sendJson(res, 500, { error: "Failed to activate founder admin." });
        return;
      }

      invalidateAuthUserProfileCache(auth.id);
      sendJson(res, 200, await buildDashboardPayload(auth));
      return;
    }

    if (body.action === "update-user-account") {
      if (!(await canManageAdminAccounts(auth))) {
        sendJson(res, 403, { error: "Admin access required for account overrides." });
        return;
      }

      const sanitized = sanitizeAdminUserAccountPayload(body);
      if ("error" in sanitized) {
        sendJson(res, 400, { error: sanitized.error });
        return;
      }

      const existingAccount = await getUserAccount(sanitized.targetUserId);
      if (!existingAccount) {
        sendJson(res, 404, { error: "Target user account was not found." });
        return;
      }

      const updated = await upsertUserAccount(sanitized.targetUserId, sanitized.payload);
      if (!updated) {
        sendJson(res, 500, { error: "Failed to update the selected user account." });
        return;
      }

      invalidateAuthUserProfileCache(sanitized.targetUserId);
      sendJson(res, 200, await buildDashboardPayload(auth));
      return;
    }

    if (body.action === "update-voice-profile") {
      if (!(await canManageAdminAccounts(auth))) {
        sendJson(res, 403, { error: "Admin access required for voice profile overrides." });
        return;
      }

      const sanitized = sanitizeVoiceProfilePayload(body);
      if ("error" in sanitized) {
        sendJson(res, 400, { error: sanitized.error });
        return;
      }

      const updated = await upsertVoiceProfile(sanitized);
      if (!updated) {
        sendJson(res, 500, { error: "Failed to update the voice profile." });
        return;
      }

      sendJson(res, 200, await buildDashboardPayload(auth));
      return;
    }

    sendJson(res, 400, { error: "Unknown dashboard action" });
    return;
  }

  if (req.method === "PATCH") {
    if (!canManageFounderContext(auth)) {
      sendJson(res, 403, { error: "Founder persistence controls require founder or admin access." });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const payload = sanitizeFounderContextPayload(body);
    if (!payload) {
      sendJson(res, 400, { error: "No valid founder context fields were provided." });
      return;
    }

    let saved = false;
    try {
      saved = await upsertFounderContext(auth.id, payload);
    } catch (error) {
      sendJson(res, 503, {
        ok: false,
        degraded: true,
        reason: "founder_context_persistence_unavailable",
        error: error instanceof Error ? error.message : "Failed to persist founder context.",
      });
      return;
    }

    if (!saved) {
      sendJson(res, 503, {
        ok: false,
        degraded: true,
        reason: "founder_context_persistence_unavailable",
        error: "Failed to persist founder context.",
      });
      return;
    }

    sendJson(res, 200, await buildDashboardPayload(auth));
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
}
