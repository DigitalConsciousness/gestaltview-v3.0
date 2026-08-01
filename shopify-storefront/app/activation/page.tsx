import Link from "next/link";

import { ActivationReceipt } from "./activation-receipt";

export default function ActivationPage() {
  return <main><div className="atmosphere" aria-hidden="true"/><div className="shell deep-shell"><nav className="topline"><Link href="/">← Field vending station</Link><span className="system-state"><i/> Receipt station</span></nav><header className="hero deep-hero"><p className="eyebrow">Shopify → GestaltView verified boundary</p><h1>Your activation receipt.</h1><p className="hero-copy">Payment confirmation and runtime activation are separate bridges. This station shows exactly which one has completed.</p></header><ActivationReceipt/></div></main>;
}
