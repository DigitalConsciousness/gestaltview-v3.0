import { ArrowRight, Boxes, FileText, Fingerprint, Orbit, Radio } from "lucide-react";
import { Link } from "wouter";

import PublicPageFrame from "@/components/PublicPageFrame";
import { useSEO } from "@/hooks/useSEO";
import { useStorefrontCatalog } from "../state/useStorefrontCatalog";
import { EditionMetadata } from "../components/EditionMetadata";
import type { StorefrontProduct } from "@shared/storefront/contracts";

function formatPrice(product: StorefrontProduct): string {
  const price = product.variants[0]?.price;
  if (!price) return product.commerceRoute === "free_issue" ? "Free issue" : "Founder scoped";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: price.currencyCode }).format(Number(price.amount));
}

const lanes = [
  {
    icon: Boxes,
    signal: "cyan",
    title: "Acquire an Artifact",
    copy: "Finished, versioned authored editions. Durable formats first; provenance before polish.",
    href: "#issued-artifacts",
    action: "Inspect issued editions",
  },
  {
    icon: Fingerprint,
    signal: "violet",
    title: "Shape a Working Relationship",
    copy: "Describe the work, context, boundaries, and memory agreement. Keith reviews scope before payment.",
    href: "/collaborator-requisition",
    action: "Open requisition terminal",
  },
  {
    icon: Orbit,
    signal: "amber",
    title: "Enter the Living Framework",
    copy: "Hosted continuity will open only after entitlement, export, cancellation, and support behavior are proven.",
    href: "#living-framework",
    action: "Read release boundary",
  },
] as const;

export default function StorefrontPage() {
  const { catalog, loading, error } = useStorefrontCatalog();
  useSEO({
    title: "Artifact Exchange · GestaltView",
    description: "Issued artifacts, founder-reviewed collaborator requisitions, and the path into the living GestaltView framework.",
    h1: "Choose what kind of relationship you are entering.",
    canonical: "https://gestaltview-di-gsvw.vercel.app/store",
  });

  const artifacts = catalog.products.filter((product) =>
    ["orientation", "artifact", "studio", "self_serve_package"].includes(product.offerKind),
  );

  return (
    <PublicPageFrame
      roomName="Artifact Exchange"
      purpose="Public requisition terminal"
      status="Phase 1 · catalog and flagship route"
      title="Choose what kind of relationship you are entering."
      intro="Artifacts are durable authored editions. Collaborators are founder-reviewed working relationships. Hosted access is a later continuity contract—not a personality subscription."
      secondaryAction={{ href: "/collaborator-requisition", label: "Begin requisition" }}
      contentClassName="space-y-16"
    >
      <section aria-labelledby="storefront-lanes" className="space-y-5">
        <div className="flex items-center gap-3 text-cyan-200/70">
          <Radio aria-hidden="true" className="h-4 w-4" />
          <h2 id="storefront-lanes" className="font-mono text-xs uppercase tracking-[0.24em]">Three illuminated lanes</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {lanes.map(({ icon: Icon, title, copy, href, action, signal }) => (
            <article key={title} className="flex min-h-72 flex-col border border-white/10 bg-[#080c12]/90 p-6 shadow-2xl">
              <Icon aria-hidden="true" className={`h-6 w-6 ${signal === "cyan" ? "text-cyan-300" : signal === "violet" ? "text-violet-300" : "text-amber-300"}`} />
              <h3 className="mt-10 text-2xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">{copy}</p>
              <a href={href} className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-cyan-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                {action} <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="issued-artifacts" aria-labelledby="artifact-shelf" className="scroll-mt-24 space-y-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-cyan-300">Small-batch public shelf</p>
          <h2 id="artifact-shelf" className="mt-2 text-3xl font-semibold">Issued editions</h2>
        </div>
        {(catalog.notice || error) && (
          <p role="status" className="border-l-2 border-amber-300 bg-amber-300/5 px-4 py-3 text-sm leading-6 text-amber-100">
            {error ? "The live catalog could not be reached. Safe launch paths are shown below." : catalog.notice}
          </p>
        )}
        <div aria-live="polite" className="grid gap-5">
          {loading && <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Synchronizing public edition records…</p>}
          {artifacts.map((product) => (
            <article key={product.id} className="grid gap-6 border border-white/10 bg-white/[0.025] p-5 md:grid-cols-[1fr_0.9fr] md:p-7">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">Issued edition</span>
                  <span className="text-sm text-slate-400">{formatPrice(product)}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold">{product.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{product.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {product.commerceRoute === "free_issue" ? (
                    <Link href={product.edition?.interactivePath || "/orientation"} className="inline-flex items-center gap-2 border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-cyan-100">
                      Open free issue <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link href={`/store/artifacts/${product.handle}`} className="inline-flex items-center gap-2 border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-cyan-100">
                      Inspect edition <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
              {product.edition ? <EditionMetadata edition={product.edition} /> : null}
            </article>
          ))}
        </div>
      </section>

      <section id="living-framework" className="scroll-mt-24 border border-amber-200/15 bg-amber-200/[0.035] p-6 sm:p-8">
        <FileText aria-hidden="true" className="h-5 w-5 text-amber-300" />
        <h2 className="mt-5 text-2xl font-semibold">Living Framework access is deliberately downstream.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Hosted access remains unpublished until recurring entitlement, account recovery, cancellation, export, deletion, and support expectations have passed end-to-end verification.</p>
      </section>
    </PublicPageFrame>
  );
}
