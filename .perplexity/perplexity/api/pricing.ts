import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Returns the active Stripe price structure from environment variables.
 * Used by the frontend to display current prices without hardcoding.
 * Safe to expose — only contains public price metadata, no secret keys.
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  // Verify required env vars are present
  const required = [
    'STRIPE_PRICE_CORE_MONTHLY',
    'STRIPE_PRICE_CORE_ANNUAL',
    'STRIPE_PRICE_PRO_MONTHLY',
    'STRIPE_PRICE_PRO_ANNUAL',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('[api/pricing] Missing env vars:', missing);
    // Return structure with null IDs — frontend handles gracefully
    return res.status(200).json({
      configured: false,
      missing,
      prices: {},
    });
  }

  return res.status(200).json({
    configured: true,
    missing: [],
    prices: {
      core_monthly: {
        priceId: process.env.STRIPE_PRICE_CORE_MONTHLY,
        amount: 1500,
        currency: 'usd',
        interval: 'month',
        tier: 'core',
      },
      core_annual: {
        priceId: process.env.STRIPE_PRICE_CORE_ANNUAL,
        amount: 14400,
        currency: 'usd',
        interval: 'year',
        tier: 'core',
      },
      pro_monthly: {
        priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
        amount: 3900,
        currency: 'usd',
        interval: 'month',
        tier: 'pro',
      },
      pro_annual: {
        priceId: process.env.STRIPE_PRICE_PRO_ANNUAL,
        amount: 37200,
        currency: 'usd',
        interval: 'year',
        tier: 'pro',
      },
    },
  });
}
