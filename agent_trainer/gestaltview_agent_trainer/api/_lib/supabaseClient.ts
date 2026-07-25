import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface OperatorKitEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GROQ_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  EMBEDDING_PROVIDER: "gemini" | "openai";
  EMBEDDING_MODEL: string;
  EMBEDDING_DIMENSION: "768" | "1536";
  KIT_NAME: string;
  KIT_DOMAIN: string;
  KIT_TIER: string;
  KIT_PRIMARY_COLOR: string;

  /**
   * Optional voice input provider identifier. When provided the UI may
   * surface voice capture affordances. This value is intentionally a free
   * string so buyers can supply their own provider names.
   */
  VOICE_INPUT_PROVIDER?: string;
  /**
   * Optional voice output provider identifier for text‑to‑speech. If set
   * the assistant can route generated responses through this provider and
   * return audio in addition to text.
   */
  VOICE_OUTPUT_PROVIDER?: string;
  /**
   * Capture mode for voice. Acceptable values are "browser", "webrtc",
   * or "telephony". This allows the setup wizard to present the right
   * instructions for capturing audio.
   */
  VOICE_CAPTURE_MODE?: "browser" | "webrtc" | "telephony";
  /**
   * Storage bucket for raw transcripts. Buyers should configure this
   * variable if they wish to persist transcripts outside of the assistant’s
   * memory model.
   */
  VOICE_TRANSCRIPT_BUCKET?: string;
  /**
   * Secret used by the voice webhook to verify callbacks from the speech
   * provider. Not used in the UI directly.
   */
  VOICE_WEBHOOK_SECRET?: string;

  /**
   * Optional Stripe secret key. Presence of this and the related keys
   * indicates that the buyer intends to resell the kit to end users.
   */
  STRIPE_SECRET_KEY?: string;
  /**
   * Optional Stripe webhook secret for validating events.
   */
  STRIPE_WEBHOOK_SECRET?: string;
  /**
   * Optional publishable key for client‑side checkout flows.
   */
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
}

function requireValue(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${label}`);
  }

  return value;
}

export function createPublicClient(env: OperatorKitEnv): SupabaseClient {
  return createClient(
    requireValue(env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requireValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export function createServiceRoleClient(env: OperatorKitEnv): SupabaseClient {
  return createClient(
    requireValue(env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requireValue(env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY")
  );
}
