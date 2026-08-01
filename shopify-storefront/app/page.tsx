import { connection } from "next/server";

import { FieldVendingMachine } from "./components/field-vending-machine";
import { getStorefrontCatalog, primaryAppUrl } from "@/lib/storefront";

export default async function Home() {
  await connection();
  const catalog = await getStorefrontCatalog();
  return (
    <main>
      <div className="atmosphere" aria-hidden="true" />
      <div className="shell">
        <nav className="topline" aria-label="Primary">
          <a href={primaryAppUrl()} className="wordmark">GestaltView</a>
          <span className="system-state"><i /> Field station · {catalog.source === "shopify" ? "catalog synchronized" : "safe preview inventory"}</span>
        </nav>

        <header className="hero">
          <p className="eyebrow">GestaltView field vending station / original equipment, no mystery crates</p>
          <h1>Useful infrastructure for an unnecessarily difficult civilization.</h1>
          <p className="hero-copy">
            Start with what you are trying to make possible. Inspect what enters, what comes out,
            what remains optional, and what the machine absolutely does not do. Configure only after something fits.
          </p>
          <a className="hero-action" href="#field-station">Find the right compartment <span aria-hidden="true">↓</span></a>
        </header>
        <div id="field-station">{catalog.notice ? <p className="notice" role="status">{catalog.notice} Your choices have not been submitted.</p> : null}<FieldVendingMachine products={catalog.products} checkoutEnabled={catalog.checkoutEnabled} /></div>

        <section id="living-framework" className="release-boundary">
          <p className="eyebrow">Safe exit / continuity boundary</p>
          <h2>You can leave without losing something you never asked us to save.</h2>
          <p>Browsing and configuring this station do not create GestaltView continuity. A paid Shopify order is verified server-side before a bounded activation receipt is created; source material is requested separately and only with consent.</p>
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
