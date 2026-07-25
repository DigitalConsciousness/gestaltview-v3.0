import { useSEO } from "@/hooks/useSEO";
import ScaffoldPage from "@/components/scaffold/ScaffoldPage";
import {
  externalScaffoldCards,
  readScaffoldSeedFromLocation,
} from "@/pages/scaffold/externalScaffoldContent";

export default function BrainSparksPage() {
  useSEO({
    title: "External Scaffold Of You | GestaltView",
    description:
      "The intervention lane for executive scaffolding, attention, and clarity.",
    h1: "External Scaffold Of You",
    canonical: "https://gestaltview-v2.vercel.app/external-scaffold",
  });

  const seed = readScaffoldSeedFromLocation();

  return (
    <ScaffoldPage
      badge="intervention"
      eyebrow="Tier 1"
      title="External Scaffold Of You"
      description="This is the intervention lane. It externalizes attention, sequencing, and next-step clarity without flattening the signal."
      seed={seed}
      seedLabel="Seed from Brain Sparks"
      seedCopy="Brain Sparks now lands inside the scaffold shell instead of bouncing through a redirect."
      cards={externalScaffoldCards}
      nextLabel="Rapid Prototype Engine"
      nextHref="/rapid-prototype"
      nextEyebrow="Next module"
      nextTitle="When the mind is held, the work can move."
      nextCopy="Use the scaffold to turn a fragment into an actionable shape, then hand it to the prototype engine when it is ready to become a build slice."
    />
  );
}
