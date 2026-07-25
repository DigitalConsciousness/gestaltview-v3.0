#!/usr/bin/env node
/**
 * GestaltView Agent Trainer — Stripe Product Setup Script v0.1.0
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node stripe-setup.js
 *   STRIPE_SECRET_KEY=sk_live_... node stripe-setup.js
 *
 * Safe to re-run. Existing products, prices, and coupons are detected by
 * product name and lookup key rather than duplicated.
 */
import Stripe from "stripe";

const STRIPE_API_VERSION = "2024-12-18.acacia";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: STRIPE_API_VERSION,
});

const PRODUCTS = [
  {
    name: "GestaltView Agent Trainer — Productized Floor",
    type: "good",
    statement_descriptor: "GESTALTVIEW GAT",
    description:
      "The complete white-label AI assistant scaffold. A hardened, client-safe deployment layer for training and deploying AI assistants grounded in your proprietary corpus, vocabulary, and operating context. Includes Four-Lane Corpus Model, Personal Language Kit, Go-Live Readiness Scoring, and CLI + Setup Wizard onboarding paths.",
    unit_label: "license",
    metadata: {
      version: "v0.1.0",
      delivery: "zip_download",
      track: "scaffold",
    },
    prices: [
      {
        nickname: "Productized Floor — One-Time",
        unit_amount: 240000,
        currency: "usd",
        lookup_key: "gat_scaffold_v010",
        tax_behavior: "exclusive",
        metadata: { offering: "scaffold", billing: "one_time" },
      },
    ],
  },
  {
    name: "GestaltView Agent Trainer — Solo Track",
    type: "service",
    statement_descriptor: "GESTALTVIEW SOLO",
    description:
      "Single-seat access to the GAT platform. Optimized for individual operators: fast setup, one workspace, personal corpus management, and PLK voice configuration. Includes CLI and Setup Wizard access.",
    unit_label: "seat",
    metadata: {
      track: "solo",
      seats: "1",
    },
    prices: [
      {
        nickname: "Solo Monthly",
        unit_amount: 4900,
        currency: "usd",
        lookup_key: "gat_solo_monthly",
        tax_behavior: "exclusive",
        recurring: { interval: "month" },
        metadata: { offering: "solo", billing: "monthly", recommended_trial_days: "7" },
      },
      {
        nickname: "Solo Annual",
        unit_amount: 46800,
        currency: "usd",
        lookup_key: "gat_solo_annual",
        tax_behavior: "exclusive",
        recurring: { interval: "year" },
        metadata: { offering: "solo", billing: "annual" },
      },
    ],
  },
  {
    name: "GestaltView Agent Trainer — Business Track",
    type: "service",
    statement_descriptor: "GESTALTVIEW BIZ",
    description:
      "Team-focused access to the GAT platform. Includes shared workspaces, reusable Operator Packs, collaborative corpus curation, shared memory continuity, and multi-seat management.",
    unit_label: "seat",
    metadata: {
      track: "business",
      seats: "up_to_10",
    },
    prices: [
      {
        nickname: "Business Monthly",
        unit_amount: 14900,
        currency: "usd",
        lookup_key: "gat_biz_monthly",
        tax_behavior: "exclusive",
        recurring: { interval: "month" },
        metadata: { offering: "business", billing: "monthly" },
      },
      {
        nickname: "Business Annual",
        unit_amount: 142800,
        currency: "usd",
        lookup_key: "gat_biz_annual",
        tax_behavior: "exclusive",
        recurring: { interval: "year" },
        metadata: { offering: "business", billing: "annual" },
      },
    ],
  },
  {
    name: "GestaltView Agent Trainer — Enterprise Track",
    type: "service",
    statement_descriptor: "GESTALTVIEW ENT",
    description:
      "Enterprise-grade access with governance controls, policy enforcement, multi-workspace management, audit logging, and priority support. Designed for organizations requiring strict IP boundaries and scaled AI deployments.",
    unit_label: "workspace",
    metadata: {
      track: "enterprise",
    },
    prices: [
      {
        nickname: "Enterprise Monthly",
        unit_amount: 49900,
        currency: "usd",
        lookup_key: "gat_ent_monthly",
        tax_behavior: "exclusive",
        recurring: { interval: "month" },
        metadata: { offering: "enterprise", billing: "monthly" },
      },
      {
        nickname: "Enterprise Annual",
        unit_amount: 478800,
        currency: "usd",
        lookup_key: "gat_ent_annual",
        tax_behavior: "exclusive",
        recurring: { interval: "year" },
        metadata: { offering: "enterprise", billing: "annual" },
      },
    ],
  },
  {
    name: "GAT Consulting — Custom Exhibit Buildout",
    type: "service",
    statement_descriptor: "GESTALTVIEW CONSULT",
    description:
      "Professional service: creation of domain-specific UI surfaces, vocabulary profiles, and domain preset configuration tailored to the buyer's industry and brand identity.",
    unit_label: "project",
    metadata: {
      service_type: "exhibit_buildout",
    },
    prices: [
      {
        nickname: "Custom Exhibit Buildout — Fixed",
        unit_amount: 250000,
        currency: "usd",
        lookup_key: "gat_consult_exhibit",
        tax_behavior: "exclusive",
        metadata: { offering: "custom_exhibit", billing: "one_time" },
      },
    ],
  },
  {
    name: "GAT Consulting — Knowledge Curation",
    type: "service",
    statement_descriptor: "GESTALTVIEW KC",
    description:
      "Rigorous corpus audit and fragmentation strategy for maximum retrieval accuracy. Includes lane analysis, document prioritization, chunk optimization, and weak-zone tracing. Billed per hour of engagement.",
    unit_label: "hour",
    metadata: {
      service_type: "knowledge_curation",
    },
    prices: [
      {
        nickname: "Knowledge Curation — Per Hour",
        unit_amount: 15000,
        currency: "usd",
        lookup_key: "gat_consult_kc_hr",
        tax_behavior: "exclusive",
        metadata: { offering: "knowledge_curation", billing: "per_hour" },
      },
    ],
  },
  {
    name: "GAT Consulting — Full Platform Deployment",
    type: "service",
    statement_descriptor: "GESTALTVIEW FPD",
    description:
      "Complete end-to-end service: technical installation, environment configuration, corpus import, QA benchmarking, go-live readiness verification, and launch support.",
    unit_label: "deployment",
    metadata: {
      service_type: "full_deployment",
    },
    prices: [
      {
        nickname: "Full Platform Deployment — Fixed",
        unit_amount: 500000,
        currency: "usd",
        lookup_key: "gat_consult_fpd",
        tax_behavior: "exclusive",
        metadata: { offering: "full_deployment", billing: "one_time" },
      },
    ],
  },
  {
    name: "GAT Consulting — Enterprise Engagement",
    type: "service",
    statement_descriptor: "GESTALTVIEW EE",
    description:
      "Strategic advisory service for enterprise deployments. Covers governance architecture, policy planning, multi-workspace scaling, compliance requirements, and executive stakeholder alignment.",
    unit_label: "engagement",
    metadata: {
      service_type: "enterprise_engagement",
    },
    prices: [
      {
        nickname: "Enterprise Engagement — Starting Price",
        unit_amount: 500000,
        currency: "usd",
        lookup_key: "gat_consult_ee_base",
        tax_behavior: "exclusive",
        metadata: { offering: "enterprise_engagement", billing: "custom" },
      },
    ],
  },
];

const COUPONS = [
  {
    id: "EARLYBIRD20",
    name: "Early Bird — 20% Off Launch Promo",
    percent_off: 20,
    duration: "once",
  },
  {
    id: "ANNUALUPGRADE",
    name: "Annual Plan Incentive — 20% Off",
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

function escapeSearchValue(value) {
  return value.replace(/["\\]/g, "\\$&");
}

async function findExistingProductByName(name) {
  const search = await stripe.products.search({
    query: `name:"${escapeSearchValue(name)}"`,
    limit: 1,
  });

  return search.data[0] ?? null;
}

async function upsertProduct(definition) {
  const existing = await findExistingProductByName(definition.name);

  if (existing) {
    console.log(`  = Product exists: ${existing.name} (${existing.id})`);
    return existing;
  }

  const product = await stripe.products.create({
    name: definition.name,
    type: definition.type,
    statement_descriptor: definition.statement_descriptor,
    description: definition.description,
    unit_label: definition.unit_label,
    metadata: definition.metadata,
  });

  console.log(`  + Product created: ${product.name} (${product.id})`);
  return product;
}

async function upsertPrice(productId, definition) {
  const existingPrices = await stripe.prices.list({
    lookup_keys: [definition.lookup_key],
    active: true,
    limit: 1,
  });

  const existing = existingPrices.data[0];

  if (existing) {
    console.log(`    = Price exists: ${definition.lookup_key} (${existing.id})`);
    return existing;
  }

  const price = await stripe.prices.create({
    product: productId,
    nickname: definition.nickname,
    unit_amount: definition.unit_amount,
    currency: definition.currency,
    lookup_key: definition.lookup_key,
    tax_behavior: definition.tax_behavior,
    metadata: definition.metadata,
    ...(definition.recurring ? { recurring: definition.recurring } : {}),
  });

  console.log(`    + Price created: ${definition.lookup_key} (${price.id})`);
  return price;
}

async function upsertCoupon(definition) {
  try {
    const existing = await stripe.coupons.retrieve(definition.id);
    console.log(`  = Coupon exists: ${definition.id} (${existing.id})`);
    return existing;
  } catch {
    const coupon = await stripe.coupons.create(definition);
    console.log(`  + Coupon created: ${definition.id} (${coupon.id})`);
    return coupon;
  }
}

async function main() {
  console.log("\nGestaltView Agent Trainer — Stripe setup\n");
  console.log(
    `Mode: ${process.env.STRIPE_SECRET_KEY.startsWith("sk_live_") ? "LIVE" : "TEST"}`
  );
  console.log("");

  const createdPrices = [];

  for (const productDefinition of PRODUCTS) {
    const product = await upsertProduct(productDefinition);

    for (const priceDefinition of productDefinition.prices) {
      const price = await upsertPrice(product.id, priceDefinition);
      createdPrices.push({
        lookupKey: priceDefinition.lookup_key,
        id: price.id,
        amount: priceDefinition.unit_amount,
        recurring: priceDefinition.recurring?.interval ?? "one_time",
      });
    }
  }

  console.log("\nCoupons");
  for (const couponDefinition of COUPONS) {
    await upsertCoupon(couponDefinition);
  }

  console.log("\nLookup keys");
  for (const entry of createdPrices) {
    const formattedAmount =
      entry.recurring === "one_time"
        ? `$${(entry.amount / 100).toFixed(2)} one-time`
        : `$${(entry.amount / 100).toFixed(2)}/${entry.recurring}`;

    console.log(`  ${entry.lookupKey.padEnd(28)} ${formattedAmount.padEnd(20)} ${entry.id}`);
  }

  console.log("\nNext steps");
  console.log("  1. Verify products and prices in Stripe Dashboard -> Products");
  console.log("  2. Enable Stripe Tax if needed and confirm tax behavior");
  console.log("  3. Point /api/stripe/agent-trainer-checkout at this account with STRIPE_SECRET_KEY");
  console.log("  4. Add a webhook endpoint if you want post-checkout fulfillment or billing sync");
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
