import Link from "next/link";
import { connection } from "next/server";

import { EditionMetadata } from "./components/edition-metadata";
import { formatProductPrice, getStorefrontCatalog, primaryAppUrl } from "@/lib/storefront";

const lanes = [
  {
    number: "01",
    title: "Acquire an Artifact",
    copy: "Finished, versioned authored editions. Durable formats first; provenance before polish.",
    href: "#issued-artifacts",
    action: "Inspect issued editions",
    signal: "cyan",
  },
  {
    number: "02",
    title: "Shape a Working Relationship",
    copy: "Describe the work, context, boundaries, and memory agreement. Founder review precedes payment.",
    href: primaryAppUrl("/collaborator-requisition"),
    action: "Open requisition terminal",
    signal: "violet",
  },
  {
    number: "03",
    title: "Enter the Living Framework",
    copy: "Hosted continuity opens only after entitlement, recovery, cancellation, and export are proven.",
    href: "#living-framework",
    action: "Read release boundary",
    signal: "amber",
  },
] as const;

export default async function Home() {
  await connection();
  const catalog = await getStorefrontCatalog();
  const artifacts = catalog.products.filter((product) =>
    ["orientation", "artifact", "studio", "self_serve_package"].includes(product.offerKind),
  );

  return (
    <main>
      <div className="atmosphere" aria-hidden="true" />
      <div className="shell">
        <nav className="topline" aria-label="Primary">
          <a href={primaryAppUrl()} className="wordmark">GestaltView</a>
          <span className="system-state"><i /> Artifact Exchange · Phase 1</span>
        </nav>

        <header className="hero">
          <p className="eyebrow">Public requisition terminal / issued editions</p>
          <h1>Choose what kind of relationship you are entering.</h1>
          <p className="hero-copy">
            Artifacts are durable authored editions. Collaborators are founder-reviewed working
            relationships. Hosted access is a later continuity contract—not a personality subscription.
          </p>
        </header>

        <section aria-labelledby="lanes-heading">
          <div className="section-heading">
            <span>Signal map</span>
            <h2 id="lanes-heading">Three illuminated lanes</h2>
          </div>
          <div className="lane-grid">
            {lanes.map((lane) => (
              <article className={`lane lane-${lane.signal}`} key={lane.number}>
                <span className="lane-number">{lane.number}</span>
                <h3>{lane.title}</h3>
                <p>{lane.copy}</p>
                <a href={lane.href}>{lane.action}<span aria-hidden="true">→</span></a>
              </article>
            ))}
          </div>
        </section>

        <section id="issued-artifacts" className="artifact-section" aria-labelledby="artifact-heading">
          <div className="section-heading">
            <span>Small-batch public shelf</span>
            <h2 id="artifact-heading">Issued editions</h2>
          </div>
          {catalog.notice ? <p className="notice" role="status">{catalog.notice}</p> : null}
          <div className="artifact-list">
            {artifacts.map((product) => (
              <article className="artifact" key={product.id}>
                <div className="artifact-copy">
                  <div className="issued-line">
                    <span>Issued edition</span>
                    <strong>{formatProductPrice(product)}</strong>
                  </div>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  {product.commerceRoute === "free_issue" ? (
                    <a className="primary-action" href={primaryAppUrl(product.edition?.interactivePath || "/orientation")}>Open free issue <span aria-hidden="true">→</span></a>
                  ) : (
                    <Link className="primary-action" href={`/artifacts/${product.handle}`}>Inspect edition <span aria-hidden="true">→</span></Link>
                  )}
                </div>
                {product.edition ? <EditionMetadata edition={product.edition} /> : null}
              </article>
            ))}
          </div>
        </section>

        <section id="living-framework" className="release-boundary">
          <p className="eyebrow">Release boundary / priority 3</p>
          <h2>Living Framework access is deliberately downstream.</h2>
          <p>Hosted access remains unpublished until recurring entitlement, account recovery, cancellation, export, deletion, and support expectations pass end-to-end verification.</p>
        </section>

        <footer>
          <span>GestaltView Artifact Exchange</span>
          <a href={primaryAppUrl("/privacy")}>Privacy</a>
          <a href={primaryAppUrl("/terms")}>Terms</a>
          <a href={primaryAppUrl("/contact")}>Contact</a>
        </footer>
      </div>
    </main>
  );
}
