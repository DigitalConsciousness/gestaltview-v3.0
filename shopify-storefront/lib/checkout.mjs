import { assertExactEnvironment, EXPECTED_STORE_DOMAIN, OFFER } from './offer.mjs';

export function buildCheckout(input, env = process.env) {
  if (env.STOREFRONT_CHECKOUT_ENABLED !== 'true') throw new Error('Checkout is disabled.');
  assertExactEnvironment(env);
  if (input?.handle !== OFFER.handle || input?.manifestVersion !== OFFER.manifestVersion) {
    throw new Error('The requested offer is not approved.');
  }
  const url = new URL(`https://${EXPECTED_STORE_DOMAIN}/cart/46345021718607:1`);
  url.searchParams.set('properties[_gestaltview_offer_handle]', OFFER.handle);
  url.searchParams.set('properties[_gestaltview_manifest_version]', OFFER.manifestVersion);
  return {
    checkoutUrl: url.toString(),
    offer: OFFER.handle,
    manifestVersion: OFFER.manifestVersion,
    linePrice: OFFER.price,
    currency: OFFER.currency,
  };
}

