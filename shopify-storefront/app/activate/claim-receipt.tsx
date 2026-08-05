"use client";

import { FormEvent, useEffect, useState } from "react";

type Receipt = {
  state: string;
  headline: string;
  detail: string;
  known_facts: string[];
  unknowns: string[];
  input_preserved: boolean;
  next_action_label: string | null;
};

export function ClaimReceipt() {
  const [message, setMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [working, setWorking] = useState(false);

  async function redeem(token: string | null) {
    if (!token) return;
    setWorking(true);
    try {
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
      });
      const body = await response.json() as { receipt?: Receipt; error?: string };
      if (!response.ok || !body.receipt) throw new Error(body.error || "This claim link could not be verified.");
      setReceipt(body.receipt);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "This claim link could not be verified.");
    } finally {
      setWorking(false);
    }
  }

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (window.location.hash) window.history.replaceState(null, "", "/activate");
    if (token) window.setTimeout(() => void redeem(token), 0);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: form.get("order"), email: form.get("email") }),
      });
      const body = await response.json() as { claimUrl?: string; error?: string };
      if (!response.ok || !body.claimUrl) throw new Error(body.error || "That purchase could not be verified.");
      const claim = new URL(body.claimUrl);
      await redeem(new URLSearchParams(claim.hash.slice(1)).get("token"));
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "That purchase could not be verified.");
      setWorking(false);
    }
  }

  return (
    <>
      <form className="configuration" onSubmit={submit}>
        <label>Shopify order name <small>For example, #1042</small><input name="order" autoComplete="off" maxLength={31} pattern="#[A-Za-z0-9-]{1,30}" required /></label>
        <label>Checkout email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <button className="dispense-button" type="submit" disabled={working}>{working ? "Verifying…" : "Verify purchase"}</button>
      </form>
      <div className="receipt-panel" role="status" aria-live="polite">
        {message ? <p>{message}</p> : null}
        {receipt ? <><p className="eyebrow">Receipt / {receipt.state}</p><h2>{receipt.headline}</h2><p>{receipt.detail}</p><div className="contract-grid"><div><h3>Known</h3><ul>{receipt.known_facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div><div><h3>Still needed</h3><ul>{receipt.unknowns.map((item) => <li key={item}>{item}</li>)}</ul></div></div><p>Next: {receipt.next_action_label || "Contact GestaltView support with your order name."}</p></> : null}
      </div>
    </>
  );
}
