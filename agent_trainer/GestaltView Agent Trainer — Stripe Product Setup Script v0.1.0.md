#!/usr/bin/env node
/**
 * GestaltView Agent Trainer — Stripe Product Setup Script v0.1.0
 * ─────────────────────────────────────────────────────────────
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node stripe-setup.js   ← test first
 *   STRIPE_SECRET_KEY=sk_live_... node stripe-setup.js   ← go live
 *
 * Requirements:
 *   npm install stripe
 *
 * Safe to re-run — existing products/prices/coupons are detected and skipped.
 */
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

const log  = (msg) => console.log(`  ✓  ${msg}`);
const warn = (msg) => console.warn(`  ⚠  ${msg}`);
const fail = (msg) => console.error(`  ✗  ${msg}`);

// ── Product Definitions ──────────────────────────────────────────────────────

const PRODUCTS = [
  {
    key: "scaffold",
    name: "GestaltView Agent Trainer — Productized Floor",
    statement_descriptor: "GESTALTVIEW GAT",
    description: "The complete white-label AI assistant scaffold. A hardened, client-safe deployment layer for training and deploying AI assistants grounded in your proprietary corpus, vocabulary, and operating context. Includes Core Cybernetics stack, Four-Lane Corpus Model, Personal Language Kit (PLK), Go-Live Readiness Scoring, CLI + Setup Wizard, Supabase schema with RLS, Operator Packs, sub-agent templates, multi-agent templates, corpus ingestion scripts, and smoke tests.",
    unit_label: "license",
    metadata: { version: "v0.1.0", delivery: "zip_download", track: "scaffold" },
    prices: [
      {
        nickname: "Productized Floor — One-Time",
        unit_amount: 240000,
        currency: "usd",
        lookup_key: "gat_scaffold_v010",
        tax_behavior: "exclusive",
        metadata: { tier: "scaffold", billing: "one_time" },
      },
    ],
  },
  {
    key: "solo",
    name: "GestaltView Agent Trainer — Solo Track",
    statement_descriptor: "GESTALTVIEW SOLO",
    description: "Single-seat access to the GAT platform for individual operators: one workspace, personal corpus management, PLK voice configuration, CLI and Setup Wizard access, session memory, and basic analytics.",
    unit_label: "seat",
    metadata: { track: "solo", seats: "1" },
    prices: [
      {
        nickname: "Solo Monthly",
        unit_amount: 4900,
        currency: "usd",
        lookup_key: "gat_solo_monthly",
        tax_behavior: "exclusive",
        recurring: { interval: "month", trial_period_days: 7 },
        metadata: { tier: "solo", billing: "monthly" },
      },
      {
        nickname: "Solo Annual",
        unit_amount: 46800,
        currency: "usd",
        lookup_key: "gat_solo_annual",
        tax_behavior: "exclusive",
        recurring: { interval: "year" },
        metadata: { tier: "solo", billing: "annual" },
      },
    ],
  },
  {
    key: "business",
    name: "GestaltView Agent Trainer — Business Track",
    statement_descriptor: "GESTALTVIEW BIZ",
    description: "Team-focused access for up to 10 seats. Includes shared workspaces, reusable Operator Packs, collaborative corpus curation, shared memory continuity, multi-seat management, and advanced analytics.",
    unit_label: "seat",
    metadata: { track: "business", seats: "up_to_10" },
    prices: [
      {
        nickname: "Business Monthly",
        unit_amount: 14900,
        currency: "usd",
        lookup_key: "gat_biz_monthly",
        tax_behavior: "exclusive",
        recurring: { interval: "month" },
        metadata: { tier: "business", billing: "monthly" },
      },
      {
        nickname: "Business Annual",
        unit_amount: 142800,
        currency: "usd",
        lookup_key: "gat_biz_annual",
        tax_behavior: "exclusive",
        recurring: { interval: "year" },
        metadata: { tier: "business", billing: "annual" },
      },
    ],
  },
  {
    key: "enterprise",
    name: "GestaltView Agent Trainer — Enterprise Track",
    statement_descriptor: "GESTALTVIEW ENT",
    description: "Enterprise-grade access with governance controls, policy enforcement, unlimited workspaces, IP boundary controls, multi-workspace management, audit logging, priority support, and custom scoping via Stripe Quotes.",
    unit_label: "workspace",
    metadata: { track: "enterprise" },
    prices: [
      {
        nickname: "Enterprise Monthly",
        unit_amount: 49900,
        currency: "usd",
        lookup_key: "gat_ent_monthly",
        tax_behavior: "exclusive",
        recurring: { interval: "month" },
        metadata: { tier: "enterprise", billing: "monthly" },
      },
      {
        nickname: "Enterprise Annual",
        unit_amount: 478800,
        currency: "usd",
        lookup_key: "gat_ent_annual",
        tax_behavior: "exclusive",
        recurring: { interval: "year" },
        metadata: { tier: "enterprise", billing: "annual" },
      },
    ],
  },
  {
    key: "exhibit",
    name: "GAT Consulting — Custom Exhibit Buildout",
    statement_descriptor: "GESTALTVIEW CONSULT",
    description: "Professional service: domain-specific UI surfaces, vocabulary profiles (PLK), and domain preset configuration tailored to the buyer's industry and brand identity.",
    unit_label: "project",
    metadata: { service_type: "exhibit_buildout" },
    prices: [
      {
        nickname: "Custom Exhibit Buildout — Fixed",
        unit_amount: 250000,
        currency: "usd",
        lookup_key: "gat_consult_exhibit",
        tax_behavior: "exclusive",
        metadata: { service: "exhibit_buildout", billing: "one_time" },
      },
    ],
  },
  {
    key: "knowledge_curation",
    name: "GAT Consulting — Knowledge Curation",
    statement_descriptor: "GESTALTVIEW KC",
    description: "Corpus audit and fragmentation strategy for maximum retrieval accuracy. Lane analysis, document prioritization, chunk optimization, and weak zone tracing. 3-hour minimum engagement.",
    unit_label: "hour",
    metadata: { service_type: "knowledge_curation" },
    prices: [
      {
        nickname: "Knowledge Curation — Per Hour",
        unit_amount: 15000,
        currency: "usd",
        lookup_key: "gat_consult_kc_hr",
        tax_behavior: "exclusive",
        metadata: { service: "knowledge_curation", billing: "per_hour" },
      },
    ],
  },
  {
    key: "full_deployment",
    name: "GAT Consulting — Full Platform Deployment",
    statement_descriptor: "GESTALTVIEW FPD",
    description: "Complete end-to-end: technical installation, environment configuration, corpus import, QA benchmarking, go-live readiness verification, and launch support.",
    unit_label: "deployment",
    metadata: { service_type: "full_deployment" },
    prices: [
      {
        nickname: "Full Platform Deployment — Fixed",
        unit_amount: 500000,
        currency: "usd",
        lookup_key: "gat_consult_fpd",
        tax_behavior: "exclusive",
        metadata: { service: "full_deployment", billing: "one_time" },
      },
    ],
  },
  {
    key: "enterprise_engagement",
    name: "GAT Consulting — Enterprise Engagement",
    statement_descriptor: "GESTALTVIEW EE",
    description: "Strategic advisory for enterprise deployments: governance architecture, policy planning, multi-workspace scaling, compliance requirements, and executive alignment. Starting price; custom scoping via Stripe Quotes.",
    unit_label: "engagement",
    metadata: { service_type: "enterprise_engagement" },
    prices: [
      {
        nickname: "Enterprise Engagement — Starting Price",
        unit_amount: 500000,
        currency: "usd",
        lookup_key: "gat_consult_ee_base",
        tax_behavior: "exclusive",
        metadata: { service: "enterprise_engagement", billing: "custom" },
      },
    ],
  },
];

// ── Coupon Definitions ───────────────────────────────────────────────────────

const COUPONS = [
  {
    id: "EARLYBIRD20",
    name: "Early Bird — 20% Off Launch Promo",
    percent_off: 20,
    duration: "once",
    max_redemptions: 500,
  },
  {
    id: "ANNUALUPGRADE",
    name: "Annual Plan Incentive — 20% Off for 12 Months",
    percent_off: 20,
    duration: "repeating",
    duration_in_months: 12,
  },
  {
    id: "BUNDLE500",
    name: "Scaffold + Full Deployment Bundle — $500 Off",
    amount_off: 50000,
    currency: "usd",
    duration: "once",
  },
  {
    id: "REFERRAL10",
    name: "Referral Program — 10% Off",
    percent_off: 10,
    duration: "once",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function upsertProduct(def) {
  const search = await stripe.products.search({ query: `name:"${def.name}"`, limit: 1 });
  if (search.data.length > 0) {
    warn(`Product already exists: ${def.name}`);
    return search.data[0];
  }
  const product = await stripe.products.create({
    name: def.name,
    description: def.description,
    statement_descriptor: def.statement_descriptor,
    unit_label: def.unit_label,
    metadata: def.metadata,
  });
  log(`Created product: ${product.name}  (${product.id})`);
  return product;
}

async function upsertPrice(productId, pd) {
  // Try to find existing price by lookup_key
  try {
    const existing = await stripe.prices.retrieve(pd.lookup_key);
    warn(`Price already exists: ${pd.nickname}  (${existing.id})`);
    return existing;
  } catch (_) {
    // Not found — create it
  }

  const params = {
    product: productId,
    nickname: pd.nickname,
    unit_amount: pd.unit_amount,
    currency: pd.currency,
    lookup_key: pd.lookup_key,
    tax_behavior: pd.tax_behavior,
    metadata: pd.metadata ?? {},
  };

  if (pd.recurring) {
    const { trial_period_days, ...rec } = pd.recurring;
    params.recurring = rec;
    // trial_period_days belongs on the price for Stripe Checkout, not recurring
    if (trial_period_days) {
      params.recurring.trial_period_days = trial_period_days;
    }
  }

  const price = await stripe.prices.create(params);
  log(`Created price: ${pd.nickname}  (${price.id})`);
  return price;
}

async function upsertCoupon(def) {
  try {
    await stripe.coupons.retrieve(def.id);
    warn(`Coupon already exists: ${def.id}`);
    return;
  } catch (_) {}

  const params = {
    id: def.id,
    name: def.name,
    duration: def.duration,
  };
  if (def.percent_off) params.percent_off = def.percent_off;
  if (def.amount_off)  { params.amount_off = def.amount_off; params.currency = def.currency; }
  if (def.duration_in_months) params.duration_in_months = def.duration_in_months;
  if (def.max_redemptions) params.max_redemptions = def.max_redemptions;

  await stripe.coupons.create(params);
  log(`Created coupon: ${def.id} — ${def.name}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  GestaltView Agent Trainer — Stripe Setup v0.1  ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  if (!process.env.STRIPE_SECRET_KEY) {
    fail("STRIPE_SECRET_KEY environment variable is not set.");
    fail("Usage: STRIPE_SECRET_KEY=sk_test_... node stripe-setup.js");
    process.exit(1);
  }

  const isLive = process.env.STRIPE_SECRET_KEY.startsWith("sk_live_");
  console.log(`  Mode: ${isLive ? "🔴 LIVE — changes are real" : "🟡 TEST — safe to run"}\n`);
  if (isLive) {
    console.log("  ⚠  Running in LIVE mode. Products will be visible to customers.");
    console.log("  ⚠  Ensure you have tested in TEST mode first.\n");
  }

  const summary = [];

  console.log("── Products & Prices ──────────────────────────────────────────────");
  for (const def of PRODUCTS) {
    try {
      const product = await upsertProduct(def);
      for (const pd of def.prices) {
        const price = await upsertPrice(product.id, pd);
        summary.push({
          lookup: pd.lookup_key,
          id: price.id,
          amount: pd.unit_amount,
          interval: pd.recurring?.interval ?? "one_time",
          nickname: pd.nickname,
        });
      }
    } catch (e) {
      fail(`Error on product "${def.name}": ${e.message}`);
    }
  }

  console.log("\n── Coupons ────────────────────────────────────────────────────────");
  for (const def of COUPONS) {
    try {
      await upsertCoupon(def);
    } catch (e) {
      fail(`Error on coupon "${def.id}": ${e.message}`);
    }
  }

  console.log("\n── Price Summary (copy these IDs for Payment Links) ───────────────");
  for (const s of summary) {
    const amt = s.interval === "one_time"
      ? `$${(s.amount / 100).toFixed(2)} one-time  `
      : `$${(s.amount / 100).toFixed(2)}/${s.interval}`;
    console.log(`  ${s.lookup.padEnd(28)} ${amt.padEnd(22)} ${s.id}`);
  }

  console.log(`
── Next Steps ──────────────────────────────────────────────────────
  1. Dashboard → Products
     Verify all 8 products are listed and active.

  2. Dashboard → Payment Links
     Create one Payment Link per product (or per price for subscriptions).
     For each link:
       ✓ Enable "Promotion codes" (checkbox in link settings)
       ✓ Enable "Collect tax automatically" (Stripe Tax)
       ✓ Set custom success URL → https://gestaltview.com/thank-you
       ✓ Set custom cancel URL  → https://gestaltview.com/pricing

  3. Dashboard → Settings → Tax
     Enable Stripe Tax for automatic US + international tax collection.

  4. Dashboard → Settings → Billing → Customer Portal
     Enable: plan upgrades, cancellation, invoice history, payment method update.
     Set portal URL in your site's account section.

  5. Dashboard → Developers → Webhooks → Add endpoint
     URL: https://gestaltview.com/api/stripe/webhook
     Events to listen for:
       • checkout.session.completed
       • customer.subscription.created
       • customer.subscription.updated
       • customer.subscription.deleted
       • invoice.paid
       • invoice.payment_failed
     Copy signing secret → STRIPE_WEBHOOK_SECRET in .env.local

  6. Dashboard → Settings → Radar
     Enable fraud protection (recommended for scaffold + deployment purchases).

  7. Dashboard → Settings → Revenue Recovery
     Enable Smart Retries and dunning email sequence.
`);
}

main().catch((e) => {
  fail(e.message);
  process.exit(1);
});
JSEOF
echo "stripe-setup.js written: $(wc -c < ~/output/stripe-setup.js) bytes"
stripe-setup.js written: 15535 bytes

$ cat > ~/output/stripe-webhook.ts << 'TSEOF'
/**
 * GestaltView Agent Trainer — Stripe Webhook Handler
 * ────────────────────────────────────────────────────
 * File:   api/stripe/webhook.ts   (Vercel / Next.js Pages Router)
 * .env.local requires:
 *   STRIPE_SECRET_KEY=sk_live_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 *
 * Install: npm install stripe micro
 */
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";

// Disable Next.js body parsing — Stripe needs the raw body to verify the signature
export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// ── Metadata helpers ─────────────────────────────────────────────────────────

function getKitTier(object: Stripe.Subscription | Stripe.Checkout.Session): string {
  return (object.metadata as Record<string, string>)?.kit_tier ?? "solo";
}

// ── Webhook Handler ──────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Verify Stripe signature
  let event: Stripe.Event;
  try {
    const raw = await buffer(req);
    event = stripe.webhooks.constructEvent(
      raw,
      req.headers["stripe-signature"] as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // 2. Route event
  try {
    switch (event.type) {

      // ── One-time purchase OR new subscription via Checkout ──────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email   = session.customer_details?.email ?? "unknown";
        const mode    = session.mode; // "payment" | "subscription"

        if (mode === "payment") {
          // One-time purchase: Productized Floor, Consulting services
          console.log(`[checkout.completed] one-time purchase | ${email} | session:${session.id}`);
          // TODO: Trigger download link delivery via email service (Resend, Postmark, etc.)
          // await sendDownloadEmail(email, session.id);
        } else if (mode === "subscription") {
          // New subscription created via Checkout
          const tier = getKitTier(session);
          console.log(`[checkout.completed] subscription | tier:${tier} | ${email}`);
          // TODO: Provision access in Supabase
          // await supabase.from("kit_users").upsert({
          //   email,
          //   stripe_customer_id: session.customer as string,
          //   tier,
          //   status: "active",
          // });
        }
        break;
      }

      // ── Subscription lifecycle ───────────────────────────────────────────────
      case "customer.subscription.created": {
        const sub  = event.data.object as Stripe.Subscription;
        const tier = getKitTier(sub);
        console.log(`[subscription.created] tier:${tier} | customer:${sub.customer}`);
        // TODO: await supabase.from("kit_users").update({ tier, status: "active" })
        //         .eq("stripe_customer_id", sub.customer as string);
        break;
      }

      case "customer.subscription.updated": {
        const sub      = event.data.object as Stripe.Subscription;
        const prevSub  = event.data.previous_attributes as Partial<Stripe.Subscription>;
        const tier     = getKitTier(sub);
        const isCancel = sub.cancel_at_period_end && !prevSub?.cancel_at_period_end;
        const isResume = !sub.cancel_at_period_end && prevSub?.cancel_at_period_end;

        if (isCancel) {
          console.log(`[subscription.updated] cancellation scheduled | customer:${sub.customer}`);
        } else if (isResume) {
          console.log(`[subscription.updated] cancellation reversed | customer:${sub.customer}`);
        } else {
          console.log(`[subscription.updated] tier:${tier} | customer:${sub.customer}`);
        }
        // TODO: sync tier change to Supabase
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`[subscription.deleted] customer:${sub.customer}`);
        // TODO: Revoke platform access
        // await supabase.from("kit_users").update({ tier: null, status: "cancelled" })
        //   .eq("stripe_customer_id", sub.customer as string);
        // TODO: Trigger offboarding/win-back email
        break;
      }

      // ── Invoice events ───────────────────────────────────────────────────────
      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        const amt = (inv.amount_paid / 100).toFixed(2);
        console.log(`[invoice.paid] $${amt} | ${inv.customer_email} | invoice:${inv.id}`);
        // TODO: Log revenue event for analytics
        // TODO: Update billing_period_end for access gating
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        console.warn(`[invoice.payment_failed] ${inv.customer_email} | attempt:${inv.attempt_count}`);
        // TODO: Flag account in Supabase (grace period logic)
        // TODO: Stripe Revenue Recovery handles dunning emails if enabled in Dashboard
        break;
      }

      default:
        // Unhandled event type — log and ignore
        console.log(`[webhook] unhandled event: ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (err: any) {
    console.error(`[webhook] handler error [${event.type}]:`, err.message);
    return res.status(500).json({ error: "Internal handler error" });
  }
}
TSEOF
echo "stripe-webhook.ts written: $(wc -c < ~/output/stripe-webhook.ts) bytes"
stripe-webhook.ts written: 6472 bytes

$ cat > ~/output/package.json << 'EOF'
{
  "name": "gestaltview-agent-trainer-stripe",
  "version": "0.1.0",
  "description": "Stripe product setup + webhook for GestaltView Agent Trainer",
  "type": "module",
  "scripts": {
    "setup:test": "STRIPE_SECRET_KEY=$STRIPE_TEST_KEY node stripe-setup.js",
    "setup:live": "STRIPE_SECRET_KEY=$STRIPE_LIVE_KEY node stripe-setup.js"
  },
  "dependencies": {
    "micro": "^10.0.1",
    "stripe": "^16.0.0"
  },
  "devDependencies": {
    "@types/micro": "^7.3.7",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "engines": { "node": ">=18" }
}
