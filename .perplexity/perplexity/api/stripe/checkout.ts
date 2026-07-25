import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

interface CheckoutBody {
  plan?: string;
  interval?: string;
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface StripeCheckoutConfig {
  stripe: Stripe;
  priceIds: Record<string, string>;
}

const STRIPE_API_VERSION = '2024-12-18.acacia';
const FALLBACK_ORIGIN = 'https://gestaltview-digital-intelligence.vercel.app';

function getCheckoutConfig(): StripeCheckoutConfig {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PRICE_CORE_MONTHLY',
    'STRIPE_PRICE_CORE_ANNUAL',
    'STRIPE_PRICE_PRO_MONTHLY',
    'STRIPE_PRICE_PRO_ANNUAL',
  ] as const;

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Stripe checkout is not configured. Missing env vars: ${missing.join(', ')}`);
  }

  return {
    stripe: new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: STRIPE_API_VERSION,
    }),
    priceIds: {
      core_monthly: process.env.STRIPE_PRICE_CORE_MONTHLY!,
      core_annual: process.env.STRIPE_PRICE_CORE_ANNUAL!,
      pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
      pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    },
  };
}

function getOrigin(req: VercelRequest): string {
  const forwardedProtoHeader = req.headers['x-forwarded-proto'];
  const forwardedHostHeader = req.headers['x-forwarded-host'];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader;
  const forwardedHost = Array.isArray(forwardedHostHeader)
    ? forwardedHostHeader[0]
    : forwardedHostHeader;

  if (req.headers.origin) {
    return req.headers.origin;
  }

  if (forwardedHost) {
    return `${forwardedProto || 'https'}://${forwardedHost}`;
  }

  if (process.env.GESTALTVIEW_PUBLIC_BASE_URL) {
    return process.env.GESTALTVIEW_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return FALLBACK_ORIGIN;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let checkoutConfig: StripeCheckoutConfig;

  try {
    checkoutConfig = getCheckoutConfig();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stripe checkout is not configured';
    console.error('[stripe/checkout] Configuration error:', message);
    return res.status(503).json({ error: message });
  }

  const body = (req.body ?? {}) as CheckoutBody;
  const plan = body.plan;
  const interval = body.interval ?? 'monthly';

  if (!plan) {
    return res.status(400).json({ error: 'Missing required field: plan' });
  }

  const priceKey = `${plan}_${interval}`;
  const priceId = checkoutConfig.priceIds[priceKey];

  if (!priceId) {
    return res.status(400).json({
      error: 'Invalid plan or interval',
      validPlans: Object.keys(checkoutConfig.priceIds),
    });
  }

  const origin = getOrigin(req);

  try {
    const session = await checkoutConfig.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: body.email || undefined,
      success_url: body.successUrl || `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancelUrl || `${origin}/pricing?canceled=true`,
      metadata: { plan, interval },
      subscription_data: {
        metadata: { plan, gestaltview_tier: plan },
      },
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stripe checkout failed';
    console.error('[stripe/checkout] Error:', message);
    return res.status(500).json({ error: message });
  }
}
