import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link, useRoute } from "wouter";

import PublicPageFrame from "@/components/PublicPageFrame";
import { EditionMetadata } from "../components/EditionMetadata";
import { useStorefrontCatalog } from "../state/useStorefrontCatalog";

export default function ArtifactEditionPage() {
  const [, params] = useRoute<{ handle: string }>("/store/artifacts/:handle");
  const { catalog, loading, error } = useStorefrontCatalog();
  const product = catalog.products.find((item) => item.handle === params?.handle);

  if (loading) return <main className="min-h-screen bg-[#05070b] p-10 text-slate-300">Loading issued edition…</main>;
  if (!product || !product.edition) {
    return (
      <PublicPageFrame roomName="Artifact Exchange" purpose="Edition lookup" status="Not issued" title="This edition is not available." intro={error ? "The catalog could not be reached. Return to the exchange and try again." : "The edition is unpublished or its required provenance record is incomplete."}>
        <Link href="/store" className="inline-flex items-center gap-2 text-cyan-200"><ArrowLeft className="h-4 w-4" /> Return to the exchange</Link>
      </PublicPageFrame>
    );
  }

  const price = product.variants[0]?.price;
  return (
    <PublicPageFrame roomName="Artifact Exchange" purpose="Issued edition deep view" status={`Version ${product.edition.version}`} title={product.title} intro={product.description} secondaryAction={{ href: "/store", label: "All editions" }} contentClassName="space-y-6">
      <EditionMetadata edition={product.edition} />
      <section className="border border-violet-200/15 bg-violet-300/[0.035] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-200">Provenance summary</p>
        <p className="mt-3 text-sm leading-7 text-slate-200">{product.edition.provenanceSummary}</p>
      </section>
      <section className="flex flex-col gap-4 border border-amber-200/15 bg-[#080c12] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold">{price ? new Intl.NumberFormat(undefined, { style: "currency", currency: price.currencyCode }).format(Number(price.amount)) : "Issuance pending"}</p>
          <p className="mt-1 text-sm text-slate-400">Checkout remains gated until Phase 2 fulfillment and security evidence passes.</p>
        </div>
        <button type="button" disabled aria-describedby="checkout-gate" className="inline-flex cursor-not-allowed items-center justify-center gap-2 border border-white/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
          <LockKeyhole aria-hidden="true" className="h-4 w-4" /> Issuance not yet open
        </button>
        <span id="checkout-gate" className="sr-only">Purchasing is not enabled during the public catalog phase.</span>
      </section>
    </PublicPageFrame>
  );
}
