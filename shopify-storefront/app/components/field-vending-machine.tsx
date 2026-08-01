"use client";

import { useMemo, useState } from "react";

import { intents, presentationFor, type IntentId } from "@/lib/offers";
import { formatProductPrice, primaryAppUrl, type StorefrontProduct } from "@/lib/storefront";

type CheckoutState = "ready" | "working" | "failed";

export function FieldVendingMachine({ products, checkoutEnabled }: { products: StorefrontProduct[]; checkoutEnabled: boolean }) {
  const [intent, setIntent] = useState<IntentId | null>(null);
  const [openHandle, setOpenHandle] = useState<string | null>(null);
  const [configuration, setConfiguration] = useState<Record<string, string>>({});
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("ready");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const visibleProducts = useMemo(
    () => products.filter((product) => !intent || presentationFor(product).intents.includes(intent)),
    [intent, products],
  );

  async function beginCheckout(product: StorefrontProduct) {
    const variant = product.variants.find((item) => item.availableForSale);
    if (!variant) return;
    setCheckoutState("working");
    setCheckoutError(null);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, offerHandle: product.handle, configuration }),
      });
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error || "checkout_unavailable");
      window.location.assign(payload.checkoutUrl);
    } catch {
      setCheckoutState("failed");
      setCheckoutError("Shopify checkout could not be opened. Your selections remain here; you can try again or leave safely.");
    }
  }

  return (
    <>
      <section className="intent-station" aria-labelledby="intent-heading">
        <div className="station-label"><span>01</span> Entry station</div>
        <h2 id="intent-heading">What are you trying to make possible?</h2>
        <p>Choose the human outcome first. The machinery can introduce itself later.</p>
        <div className="intent-grid">
          {intents.map((item) => (
            <button key={item.id} type="button" aria-pressed={intent === item.id} onClick={() => setIntent(intent === item.id ? null : item.id)}>
              <strong>{item.label}</strong><span>{item.detail}</span>
            </button>
          ))}
        </div>
        {intent ? <button className="clear-filter" type="button" onClick={() => setIntent(null)}>Show every compartment</button> : null}
      </section>

      <section className="bay-station" aria-labelledby="bays-heading">
        <div className="station-label"><span>02</span> Product bays</div>
        <h2 id="bays-heading">Here is what the machine actually dispenses.</h2>
        <p className="station-intro">No mystery crates. Inputs, boundaries, first receipt, and activation timing are printed on the compartment.</p>
        <div className="bay-grid" aria-live="polite">
          {visibleProducts.map((product, index) => {
            const offer = presentationFor(product);
            const isOpen = openHandle === product.handle;
            const isFree = product.commerceRoute === "free_issue";
            const isRequisition = product.commerceRoute === "gestaltview_requisition";
            const canCheckout = checkoutEnabled && product.commerceRoute === "shopify_checkout" && product.variants.some((variant) => variant.availableForSale);
            return (
              <article className={`product-bay ${isOpen ? "bay-open" : ""}`} key={product.id}>
                <div className="bay-plate"><span>Bay {String(index + 1).padStart(2, "0")}</span><span>{offer.family}</span></div>
                <div className="bay-summary">
                  <div><p className="availability">{canCheckout || isFree || isRequisition ? "Available path" : "Not currently dispensed"}</p><h3>{product.title}</h3></div>
                  <strong className="bay-price">{formatProductPrice(product)}</strong>
                </div>
                <p className="bay-promise">{offer.plainPromise}</p>
                <ul className="dispenses">{offer.dispenses.map((item) => <li key={item}>{item}</li>)}</ul>
                <button className="inspect-button" type="button" aria-expanded={isOpen} onClick={() => { setOpenHandle(isOpen ? null : product.handle); setCheckoutState("ready"); setCheckoutError(null); }}>
                  {isOpen ? "Close inspection panel" : "Inspect this compartment"}<span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen ? (
                  <div className="product-drawer">
                    <div className="contract-grid">
                      <div><h4>What enters</h4><ul>{offer.enters.map((item) => <li key={item}>{item}</li>)}</ul></div>
                      <div><h4>What happens</h4><ul>{offer.happens.map((item) => <li key={item}>{item}</li>)}</ul></div>
                      <div><h4>First receipt</h4><p>{offer.firstReceipt}</p></div>
                      <div><h4>Not included</h4><ul>{offer.exclusions.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    </div>
                    <div className="proof-strip" id="proof"><span>Proof / terms</span><a href={offer.proofHref.startsWith("#") ? offer.proofHref : primaryAppUrl(offer.proofHref)}>{offer.proofLabel} →</a><small>Activation: {offer.activationTime}</small></div>
                    {offer.configuration.length ? <fieldset className="configuration"><legend>Configure only what matters</legend>{offer.configuration.map((field) => <label key={field.id}>{field.label}<select value={configuration[field.id] || field.options[0]} onChange={(event) => setConfiguration((current) => ({ ...current, [field.id]: event.target.value }))}>{field.options.map((option) => <option key={option}>{option}</option>)}</select></label>)}</fieldset> : null}
                    <div className="decision-rail">
                      {isFree ? <a className="dispense-button" href={primaryAppUrl(product.edition?.interactivePath || offer.proofHref)}>Open the free issue →</a> : null}
                      {isRequisition ? <a className="dispense-button" href={primaryAppUrl("/collaborator-requisition")}>Begin a scoped requisition →</a> : null}
                      {canCheckout ? <button className="dispense-button" type="button" disabled={checkoutState === "working"} onClick={() => beginCheckout(product)}>{checkoutState === "working" ? "Shopify is preparing checkout…" : `Continue to Shopify · ${formatProductPrice(product)}`}</button> : null}
                      {!canCheckout && !isFree && !isRequisition ? <p className="unavailable-note">Checkout is not open for this compartment. No payment or configuration was submitted.</p> : null}
                      <p className="boundary-copy">Shopify owns price, cart, payment, taxes, discounts, and its order confirmation. GestaltView receives only the bounded activation event after server verification.</p>
                      {checkoutError ? <p className="checkout-error" role="alert">{checkoutError}</p> : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        {!visibleProducts.length ? <p className="notice">That compartment is not stocked yet. Your intent was not submitted or retained. Try another path or visit the Custom Systems Counter.</p> : null}
      </section>
    </>
  );
}
