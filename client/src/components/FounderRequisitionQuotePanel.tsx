import { useState } from "react";
import { CircleDollarSign, Send } from "lucide-react";

import { approveGateOrderQuote } from "@/lib/gateApi";
import { GlassCard } from "@/components/ui/GlassCard";

const DEFAULT_TERMS =
  "Full payment of the approved quote is due before the build begins. Alternative arrangements require an explicit founder exception.";

export function FounderRequisitionQuotePanel() {
  const [orderId, setOrderId] = useState("");
  const [quoteDollars, setQuoteDollars] = useState("1500");
  const [scopeSummary, setScopeSummary] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(DEFAULT_TERMS);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(quoteDollars);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid quoted amount.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const order = await approveGateOrderQuote(orderId.trim(), {
        totalCents: Math.round(amount * 100),
        scopeSummary,
        paymentTerms,
      });
      setResult(
        `Quote approved for ${order.id}. The buyer's tracked order now exposes secure payment.`
      );
    } catch (quoteError) {
      setError(
        quoteError instanceof Error
          ? quoteError.message
          : "Unable to approve this quote."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard
      glow="cyan"
      intensity="medium"
      className="mt-6 border-white/10 bg-white/[0.05] p-6 md:p-8"
      hover={false}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
          <CircleDollarSign className="size-5" />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300">
            Priority 1 · firm quote
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Release a reviewed requisition for payment.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/62">
            This changes a founder-reviewed order to awaiting payment. The buyer
            keeps the private tracked-order link they received at intake; that page
            will reveal the approved total and secure Stripe checkout.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
            Order ID
          </span>
          <input
            required
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Paste review-requested order ID"
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/35"
          />
        </label>

        <label className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
            Approved total · USD
          </span>
          <input
            required
            min="1"
            step="0.01"
            type="number"
            value={quoteDollars}
            onChange={(event) => setQuoteDollars(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/35"
          />
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
            Firm scope summary
          </span>
          <textarea
            required
            minLength={10}
            value={scopeSummary}
            onChange={(event) => setScopeSummary(event.target.value)}
            placeholder="State the approved collaborator, surfaces, boundaries, delivery, and acceptance criteria."
            className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/35"
          />
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
            Payment terms
          </span>
          <textarea
            required
            value={paymentTerms}
            onChange={(event) => setPaymentTerms(event.target.value)}
            className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/35"
          />
        </label>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="size-4" />
            {submitting ? "Releasing quote…" : "Approve scope and release payment"}
          </button>
          {result ? (
            <p className="mt-3 text-sm text-emerald-200">{result}</p>
          ) : null}
          {error ? (
            <p className="mt-3 text-sm text-rose-200">{error}</p>
          ) : null}
        </div>
      </form>
    </GlassCard>
  );
}
