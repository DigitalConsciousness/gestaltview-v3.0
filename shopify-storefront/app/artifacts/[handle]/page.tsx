import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";

import { EditionMetadata } from "@/app/components/edition-metadata";
import { formatProductPrice, getStorefrontCatalog } from "@/lib/storefront";

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { handle } = await params;
  const product = (await getStorefrontCatalog()).products.find((item) => item.handle === handle);
  return product
    ? { title: `${product.title} · GestaltView Artifact Exchange`, description: product.description }
    : { title: "Edition unavailable · GestaltView" };
}

export default async function ArtifactPage({ params }: PageProps) {
  await connection();
  const { handle } = await params;
  const product = (await getStorefrontCatalog()).products.find((item) => item.handle === handle);
  if (!product?.edition) notFound();

  return (
    <main>
      <div className="atmosphere" aria-hidden="true" />
      <div className="shell deep-shell">
        <nav className="topline"><Link href="/">← Artifact Exchange</Link><span className="system-state"><i /> Issued edition</span></nav>
        <header className="hero deep-hero">
          <p className="eyebrow">Version {product.edition.version} / authored derivative</p>
          <h1>{product.title}</h1>
          <p className="hero-copy">{product.description}</p>
        </header>
        <EditionMetadata edition={product.edition} />
        <section className="provenance">
          <p className="eyebrow">Provenance summary</p>
          <p>{product.edition.provenanceSummary}</p>
        </section>
        <section className="issuance-gate">
          <div><strong>{formatProductPrice(product)}</strong><p>Checkout remains gated until fulfillment and security evidence passes.</p></div>
          <button disabled>Issuance not yet open</button>
        </section>
      </div>
    </main>
  );
}
