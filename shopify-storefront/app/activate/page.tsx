import Link from "next/link";

import { ClaimReceipt } from "./claim-receipt";

export const metadata = { title: "Claim your Sprint — GestaltView", robots: { index: false, follow: false } };

export default function ActivatePage() {
  return <main><div className="atmosphere" aria-hidden="true"/><div className="shell deep-shell"><nav className="topline"><Link href="/store/project-convergence-sprint">← Offer details</Link><span className="system-state"><i/> Verified purchase claim</span></nav><header className="hero deep-hero"><p className="eyebrow">Verified purchase claim</p><h1>Open your Project Convergence Sprint receipt</h1><p className="hero-copy">Use the Shopify order name and checkout email. Details are matched server-side to a verified paid order, and failures remain deliberately generic.</p></header><ClaimReceipt/><section className="release-boundary"><h2>A narrow claim boundary</h2><p>The signed token expires after 30 minutes, travels only in the URL fragment, and is removed before verification. It is never stored in browser storage. Only a peppered hash is persisted.</p><p>Restricted intake access is provided only to the verified checkout email. Do not enter credentials, source material, or project details here.</p></section></div></main>;
}
