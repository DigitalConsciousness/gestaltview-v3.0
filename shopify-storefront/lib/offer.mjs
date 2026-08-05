export const EXPECTED_STORE_DOMAIN = 'vercel-store-fa16b8a7-rc5epai7.myshopify.com';
export const EXPECTED_PRODUCT_GID = 'gid://shopify/Product/8985408208975';
export const EXPECTED_VARIANT_GID = 'gid://shopify/ProductVariant/46345021718607';

export const OFFER = Object.freeze({
  title: 'GestaltView Project Convergence Sprint',
  handle: 'project-convergence-sprint',
  manifestVersion: '1.0.0',
  price: '495.00',
  currency: 'USD',
  activationMode: 'human_handoff',
  activationScope: Object.freeze({
    service: 'project_convergence_sprint',
    price_usd_cents: 49500,
    delivery_window_business_days: 5,
    delivery_clock_starts: 'intake_accepted',
    project_limit: 1,
    repository_limit: 3,
    document_limit: 25,
    clarification_rounds: 1,
    handoff_minutes: 45,
    implementation_included: false,
    custom_build_credit_usd_cents: 49500,
    custom_build_credit_window_days: 30,
    source_material_import_requires_consent: true,
    fulfillment_owner: 'founder',
  }),
});

const PRODUCT_ID = EXPECTED_PRODUCT_GID.split('/').at(-1);
const VARIANT_ID = EXPECTED_VARIANT_GID.split('/').at(-1);

export function toShopifyGid(type, value) {
  if (typeof value === 'string' && value.startsWith(`gid://shopify/${type}/`)) return value;
  const numeric = String(value ?? '');
  return /^\d+$/.test(numeric) ? `gid://shopify/${type}/${numeric}` : null;
}

function lineProperties(line) {
  const entries = Array.isArray(line?.properties)
    ? line.properties.map((property) => [property.name ?? property.key, property.value])
    : Object.entries(line?.properties ?? {});
  return Object.fromEntries(entries.filter(([key]) => typeof key === 'string'));
}

export function matchesApprovedOfferIdentity(line) {
  if (!line || toShopifyGid('Product', line.product_id) !== EXPECTED_PRODUCT_GID) return null;
  if (toShopifyGid('ProductVariant', line.variant_id) !== EXPECTED_VARIANT_GID) return null;
  if (String(line.product_id).split('/').at(-1) !== PRODUCT_ID) return null;
  if (String(line.variant_id).split('/').at(-1) !== VARIANT_ID) return null;
  const properties = lineProperties(line);
  if (properties._gestaltview_offer_handle !== OFFER.handle) return null;
  if (properties._gestaltview_manifest_version !== OFFER.manifestVersion) return null;
  return OFFER;
}

function isZeroMoney(value) {
  if (value == null) return true;
  const amount = Number(value);
  return Number.isFinite(amount) && amount === 0;
}

export function resolveApprovedLine(line, currency) {
  if (!matchesApprovedOfferIdentity(line)) return null;
  if (line.quantity !== 1) return null;
  if (String(line.price) !== OFFER.price || currency !== OFFER.currency) return null;
  const discountedAmounts = [
    line.discounted_total,
    line.discounted_total_set?.shop_money?.amount,
    line.final_line_price,
    line.line_price,
  ].filter((value) => value != null);
  if (discountedAmounts.some((value) => String(value) !== OFFER.price)) return null;
  if (!isZeroMoney(line.total_discount)) return null;
  if (!isZeroMoney(line.total_discount_set?.shop_money?.amount)) return null;
  if (Array.isArray(line.discount_allocations) && line.discount_allocations.length > 0) return null;
  if (line.discount_allocations && !Array.isArray(line.discount_allocations)
    && Object.keys(line.discount_allocations).length > 0) return null;
  return OFFER;
}

export function assertExactEnvironment(env) {
  if (
    env.SHOPIFY_STORE_DOMAIN !== EXPECTED_STORE_DOMAIN ||
    env.SHOPIFY_PRODUCT_GID !== EXPECTED_PRODUCT_GID ||
    env.SHOPIFY_VARIANT_GID !== EXPECTED_VARIANT_GID
  ) throw new Error('Storefront configuration does not match the approved offer identity.');
}
