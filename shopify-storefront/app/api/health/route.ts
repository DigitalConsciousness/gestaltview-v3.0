import {
  EXPECTED_PRODUCT_GID,
  EXPECTED_STORE_DOMAIN,
  EXPECTED_VARIANT_GID,
} from "@/lib/offer.mjs";
import { createSupabaseRepository, STOREFRONT_SCHEMA_VERSION } from "@/lib/supabase.mjs";

export const runtime = "nodejs";

function validUrl(value: unknown, allowLocalhost = false) {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" || (
      allowLocalhost && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export function healthStatusForEnvironment(env: NodeJS.ProcessEnv) {
  const supabaseSecret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
  const configured = Boolean(
    env.SHOPIFY_STORE_DOMAIN === EXPECTED_STORE_DOMAIN
    && env.SHOPIFY_PRODUCT_GID === EXPECTED_PRODUCT_GID
    && env.SHOPIFY_VARIANT_GID === EXPECTED_VARIANT_GID
    && (env.SHOPIFY_APP_CLIENT_SECRET?.length || 0) >= 16
    && validUrl(env.SUPABASE_URL)
    && supabaseSecret.length >= 20
    && (env.STOREFRONT_CLAIM_TOKEN_PEPPER?.length || 0) >= 32
    && validUrl(env.STOREFRONT_ORIGIN, process.env.NODE_ENV !== "production")
    && ["true", "false", undefined].includes(env.STOREFRONT_CHECKOUT_ENABLED)
  );
  return {
    status: configured ? "configuration_valid" : "configuration_required",
    checkoutEnabled: false,
    offer: "project-convergence-sprint",
    manifestVersion: "1.0.0",
    schemaVersion: STOREFRONT_SCHEMA_VERSION,
    migrationRequired: "202608040001_storefront_transactional_webhook_and_claims.sql",
  };
}

export async function GET() {
  const base = healthStatusForEnvironment(process.env);
  if (base.status !== "configuration_valid") {
    return Response.json(base, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  let ready = false;
  try {
    ready = await createSupabaseRepository(process.env).checkRuntimeReadiness();
  } catch {
    ready = false;
  }
  const status = {
    ...base,
    status: ready ? "ready" : "migration_required",
    checkoutEnabled: ready && process.env.STOREFRONT_CHECKOUT_ENABLED === "true",
  };
  return Response.json(status, {
    status: ready ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
