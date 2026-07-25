import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const OFFERING_ALIASES: Record<string, string> = {
  custom_exhibit: "custom-exhibit",
  knowledge_curation: "knowledge-curation",
  full_deployment: "full-deployment",
};

export function normalizeOffering(value: string): string {
  return OFFERING_ALIASES[value] ?? value;
}

export function offeringToTier(
  value: string
): "core" | "pro" | "enterprise" | null {
  if (value === "solo") return "core";
  if (value === "business") return "pro";
  if (value === "enterprise") return "enterprise";
  return null;
}

// ─────────────────────────────────────────────
// STRIPE PRICE ID MAP
// All IDs are LIVE mode — created April 4, 2026
// ─────────────────────────────────────────────

const PRICE_IDS: Record<string, Record<string, string>> = {
  // ── One-Time Products ──────────────────────
  scaffold: {
    "one-time": "price_1TIbgHPsLBcM8QAjIVf6nsKr", // $2,400 — Productized Floor
  },
  "custom-exhibit": {
    "one-time": "price_1TIbgPPsLBcM8QAjQWMT3jeM", // $2,500 — Custom Exhibit Buildout
  },
  "knowledge-curation": {
    "one-time": "price_1TIbgXPsLBcM8QAjpBNKj4yj", // $450  — Knowledge Curation Session (3hr min)
  },
  "full-deployment": {
    "one-time": "price_1TIbgcPsLBcM8QAjK1kHeXzJ", // $5,000 — Full Platform Deployment
  },

  // ── Subscription Products ──────────────────
  solo: {
    monthly: "price_1TIbgjPsLBcM8QAjcaSBsqeO", // $49/mo  — Solo Track
    annual:  "price_1TIbgqPsLBcM8QAjFUpNApwG", // $468/yr — Solo Track (20% savings)
  },
  business: {
    monthly: "price_1TIbhiPsLBcM8QAjpxzITrE7", // $149/mo  — Business Track
    annual:  "price_1TIbhoPsLBcM8QAjpZrsWA8T", // $1,428/yr — Business Track (20% savings)
  },
  enterprise: {
    monthly: "price_1TIbhtPsLBcM8QAjr5cIdPtN", // $499/mo  — Enterprise Track
    annual:  "price_1TIbhyPsLBcM8QAjSPBDFrZ6", // $4,788/yr — Enterprise Track (20% savings)
  },
};

// ─────────────────────────────────────────────
// COUPON IDS
// ─────────────────────────────────────────────

export const COUPON_IDS = {
  EARLYBIRD20:    "JNULivZQ", // 20% off — one-time use
  ANNUALUPGRADE:  "yHsCrkSL", // 20% off — annual plan upgrade incentive
  BUNDLE500:      "miI0IWEN", // $500 off — bundle discount
  REFERRAL10:     "nosqNcOM", // 10% off — referral reward
};

// ─────────────────────────────────────────────
// PRODUCT IDS (for reference / metadata)
// ─────────────────────────────────────────────

export const PRODUCT_IDS = {
  scaffold:           "prod_UH9zUlcgarfo8A",
  solo:               "prod_UH9zKpzc2LpKRs",
  business:           "prod_UH9zW1HjObjJwE",
  enterprise:         "prod_UH9zk7L5BE5om9",
  customExhibit:      "prod_UH9zd3muDl5A1Y",
  knowledgeCuration:  "prod_UH9z07ezdPUjYG",
  fullDeployment:     "prod_UHA0GUDkqJ3VNS",
};

// ─────────────────────────────────────────────
// CHECKOUT HANDLER
// ─────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    offering,
    billingInterval = "monthly",
    couponCode,
    customerEmail,
    successUrl,
    cancelUrl,
  } = req.body;

  if (!offering) {
    return res.status(400).json({ error: "Missing required field: offering" });
  }

  const normalizedOffering = normalizeOffering(offering);
  const interval =
    normalizedOffering === "scaffold" ||
    normalizedOffering === "custom-exhibit" ||
    normalizedOffering === "knowledge-curation" ||
    normalizedOffering === "full-deployment"
      ? "one-time"
      : billingInterval;

  const priceId = PRICE_IDS[normalizedOffering]?.[interval];

  if (!priceId) {
    return res.status(400).json({
      error: `No price found for offering "${normalizedOffering}" with interval "${interval}"`,
    });
  }

  const isSubscription = interval !== "one-time";
  const resolvedTier = offeringToTier(normalizedOffering);
  const sessionMetadata = {
    product_family: "agent_trainer",
    offering: normalizedOffering,
    billingInterval: interval,
    ...(resolvedTier ? { plan: resolvedTier, gestaltview_tier: resolvedTier } : {}),
  };

  // Resolve solo 7-day trial flag
  const trialDays =
    normalizedOffering === "solo" && interval === "monthly" ? 7 : undefined;

  // Resolve coupon
  let discounts: { coupon: string }[] = [];
  if (couponCode) {
    const couponId =
      COUPON_IDS[couponCode as keyof typeof COUPON_IDS] ?? couponCode;
    discounts = [{ coupon: couponId }];
  }

  try {
    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/agent-trainer/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/agent-trainer/pricing`,
      customer_email: customerEmail,
      allow_promotion_codes: true,
      metadata: sessionMetadata,
    };

    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
    }

    if (isSubscription && trialDays) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
        metadata: sessionMetadata,
      };
    }

    if (!isSubscription) {
      sessionParams.payment_intent_data = {
        metadata: sessionMetadata,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("[agent-trainer-checkout] Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
