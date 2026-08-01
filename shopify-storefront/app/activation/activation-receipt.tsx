"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Receipt = {
  public_receipt_id: string;
  state: string;
  headline: string;
  detail: string;
  known_facts: string[];
  unknowns: string[];
  input_preserved: boolean;
  next_action_label: string | null;
  next_action_path: string | null;
};

export function ActivationReceipt() {
  const [state, setState] = useState<"working" | "ready" | "missing" | "failed">("working");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadReceipt() {
      await Promise.resolve();
      const stored = localStorage.getItem("gestaltview:lastActivationClaim");
      if (!stored) { setState("missing"); return; }
      let token = "";
      try { token = String((JSON.parse(stored) as { token?: unknown }).token || ""); } catch { setState("missing"); return; }
      try {
        const response = await fetch(`/api/activation-receipt?token=${encodeURIComponent(token)}`, { headers: { Accept: "application/json" }, signal: controller.signal });
        const payload = await response.json() as { receipt?: Receipt };
        if (response.status === 404) { setState("missing"); return; }
        if (!response.ok || !payload.receipt) throw new Error("receipt_unavailable");
        setReceipt(payload.receipt); setState("ready");
      } catch {
        if (!controller.signal.aborted) setState("failed");
      }
    }
    void loadReceipt();
    return () => controller.abort();
  }, []);

  if (state === "working") return <p className="notice" role="status">Receipt synchronization is underway. Your buyer-held claim remains in this browser.</p>;
  if (state === "missing") return <div className="receipt-panel"><p className="eyebrow">Receipt not found</p><h2>No activation receipt is attached to this browser yet.</h2><p>This can mean checkout was not completed, Shopify has not delivered the verified event yet, or this is a different browser. No source material was imported.</p><Link href="/">Return to the field station</Link></div>;
  if (state === "failed") return <div className="receipt-panel"><p className="eyebrow">External boundary</p><h2>The receipt service is temporarily unavailable.</h2><p>Your claim remains in this browser. Try again later or contact GestaltView support; do not purchase again solely to create another receipt.</p><button type="button" onClick={() => window.location.reload()}>Try receipt lookup again</button></div>;
  return receipt ? <div className="receipt-panel"><p className="eyebrow">Activation receipt / {receipt.state}</p><h2>{receipt.headline}</h2><p>{receipt.detail}</p><div className="contract-grid"><div><h4>Known</h4><ul>{receipt.known_facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div><div><h4>Not yet known</h4><ul>{receipt.unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul></div></div><p className="boundary-copy">Source material preserved: {receipt.input_preserved ? "yes" : "no source material was supplied"}.</p>{receipt.next_action_path && receipt.next_action_label ? <a className="dispense-button" href={receipt.next_action_path}>{receipt.next_action_label} →</a> : null}</div> : null;
}
