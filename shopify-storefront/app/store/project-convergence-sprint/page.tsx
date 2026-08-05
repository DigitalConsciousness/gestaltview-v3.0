import Link from "next/link";

import { SprintCheckoutAction } from "./sprint-checkout-action";

export const metadata = {
  title: "Project Convergence Sprint — GestaltView",
  description: "A founder-led, evidence-backed convergence pass for one scattered project.",
};

export default function ProjectConvergenceSprintPage() {
  return (
    <main>
      <div className="atmosphere" aria-hidden="true" />
      <div className="shell deep-shell">
        <nav className="topline" aria-label="Primary">
          <Link href="/">← Field vending station</Link>
          <Link href="/activate">Claim a paid Sprint</Link>
        </nav>

        <header className="hero deep-hero">
          <p className="eyebrow">Founder-led service · Founding rate</p>
          <h1>Project Convergence Sprint</h1>
          <p className="hero-copy">Your project is probably not missing another idea. It is missing a trustworthy view of the ideas, evidence, code, decisions, and unfinished bridges already present. The Project Convergence Sprint turns that spread into one usable system map and the next implementation-ready thing.</p>
          <p><strong className="bay-price">$495 USD</strong> · one-time founding rate</p>
          <SprintCheckoutAction />
        </header>

        <section className="release-boundary" aria-labelledby="who-heading">
          <p className="eyebrow">Who it is for</p>
          <h2 id="who-heading">Real work spread across too many places</h2>
          <p>This is for a person with a real project, research lane, codebase, or product direction distributed across repositories, documents, notes, systems, and unresolved decisions—with no trustworthy single view.</p>
        </section>

        <section className="contract-grid" aria-label="Inputs and process">
          <div><p className="eyebrow">What enters</p><h2>One bounded project</h2><ul><li>One project or product lane</li><li>Up to three repositories</li><li>Up to 25 documents or equivalent material</li><li>Current decisions, constraints, and desired outcome</li><li>One primary decision-maker</li></ul></div>
          <div><p className="eyebrow">What happens</p><h2>An evidence-backed convergence pass</h2><p>Keith Soyka leads the review. Existing facts stay separate from inference; contradictions, missing bridges, and unresolved decisions are explicit before a path is recommended.</p><p>There is one consolidated clarification round.</p></div>
        </section>

        <section className="release-boundary" aria-labelledby="deliverables-heading">
          <p className="eyebrow">What comes back</p>
          <h2 id="deliverables-heading">A coherent blueprint and something ready to implement</h2>
          <ol><li>An evidence-calibrated map of what exists.</li><li>Contradictions, missing bridges, and unresolved decisions separated explicitly.</li><li>One coherent system or product blueprint.</li><li>A prioritized 30-day execution path.</li><li>One implementation-ready artifact chosen during intake.</li><li>One final review and handoff session of up to 45 minutes.</li></ol>
        </section>

        <section className="contract-grid" aria-label="Scope and timing">
          <div><p className="eyebrow">Scope boundary</p><h2>What is excluded</h2><p>Implementation, unlimited material, guaranteed inclusion of every idea, and automatic source import are excluded. Material beyond the published bounds pauses for explicit re-scoping.</p><p>No project material enters GestaltView merely because payment occurred.</p></div>
          <div><p className="eyebrow">Timing</p><h2>Five business days after intake acceptance</h2><p>The clock begins only after required material is received, accessible, within scope, and explicitly accepted. Payment alone does not start it.</p><p>One project. The number of browser tabs involved is not being entered into evidence at this time.</p></div>
        </section>

        <section className="contract-grid" aria-label="Credit and next steps">
          <div><p className="eyebrow">Custom-build credit</p><h2>The full $495 can carry forward</h2><p>The fee is credited once toward a qualifying custom build contracted within 30 calendar days after delivery. It has no cash value, cannot exceed the build price, and cannot combine with another Sprint credit.</p></div>
          <div><p className="eyebrow">After payment</p><h2>Verification before project access</h2><p>A verified paid order creates a receipt and private claim path. Intake is reviewed before acceptance or a written re-scope/refund choice. Never submit passwords, access tokens, or project material through the claim form.</p></div>
        </section>

        <section className="contract-grid" aria-label="Refund and privacy">
          <div id="refund"><h2>Refund</h2><p>Before intake acceptance, a full refund is available on request. After acceptance but before substantive work, Keith may offer a full refund or agreed reschedule. Later decisions are manual and proportional. If the project cannot responsibly fit, you choose a full refund or written re-scope.</p></div>
          <div id="privacy"><h2>Privacy</h2><p>Shopify handles checkout and payment. Commerce records keep bounded order identity, a hashed email, offer identity, and fulfillment state. Source documents, raw intake, credentials, private source links, analysis, and deliverables stay outside Shopify and commerce persistence.</p></div>
        </section>
      </div>
    </main>
  );
}
