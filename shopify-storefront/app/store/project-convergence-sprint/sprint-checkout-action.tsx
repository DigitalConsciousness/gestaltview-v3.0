"use client";

import { useEffect, useState } from "react";

type State = "checking" | "available" | "unavailable" | "working" | "failed";

export function SprintCheckoutAction() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json() as { checkoutEnabled?: boolean };
        setState(response.ok && body.checkoutEnabled ? "available" : "unavailable");
      })
      .catch(() => {
        if (!controller.signal.aborted) setState("unavailable");
      });
    return () => controller.abort();
  }, []);

  async function beginCheckout() {
    setState("working");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: "project-convergence-sprint",
          manifestVersion: "1.0.0",
        }),
      });
      const body = await response.json() as { checkoutUrl?: string };
      if (!response.ok || !body.checkoutUrl) throw new Error("checkout_unavailable");
      window.location.assign(body.checkoutUrl);
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="decision-rail" aria-live="polite">
      <button
        className="dispense-button"
        type="button"
        disabled={state !== "available"}
        onClick={beginCheckout}
      >
        {state === "working" ? "Shopify is preparing checkout…" : "Begin the Convergence Sprint — $495"}
      </button>
      {state === "checking" ? <p className="boundary-copy">Checking the verified commerce boundary…</p> : null}
      {state === "unavailable" ? <p className="unavailable-note">Checkout is not commissioned yet. No payment or project material was submitted.</p> : null}
      {state === "failed" ? <p className="checkout-error" role="alert">Shopify checkout could not be opened. You have not been charged; try again later.</p> : null}
    </div>
  );
}
