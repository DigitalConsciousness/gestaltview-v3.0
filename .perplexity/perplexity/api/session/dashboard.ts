import type { VercelRequest, VercelResponse } from "@vercel/node";

import { invalidateAuthUserProfileCache, requireAuth, type AuthUser } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  getFounderContext,
  getUserAccount,
  listUserAccounts,
  upsertFounderContext,
  upsertUserAccount,
  type FounderContextUpdate,
  type UserAccountRow,
  type UserAccountUpdate,
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

function hasAnyConfiguredEnv(keys: string[]): boolean {
  return keys.some((key) => Boolean(process.env[key]?.trim()));
}

function hasAllConfiguredEnv(keys: string[]): boolean {
  return keys.every((key) => Boolean(process.env[key]?.trim()));
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
        elevenLabs: hasAllConfiguredEnv(["ELEVENLABS_API_KEY", "ELEVENLABS_BILLY_VOICE_ID"]),
        liveKit: hasAllConfiguredEnv(["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]),
        cosyVoice: hasAnyConfiguredEnv(["COSYVOICE_URL"]),
        whisper: hasAnyConfiguredEnv(["WHISPER_MODEL"]),
        billyWorker: hasAnyConfiguredEnv(["BILLY_API_URL"]),
      },
    },
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
