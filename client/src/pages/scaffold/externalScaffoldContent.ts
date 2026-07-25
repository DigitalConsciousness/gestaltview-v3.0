import { Bolt, Brain, Clock3 } from "lucide-react";
import type { ScaffoldCard } from "@/components/scaffold/ScaffoldPage";

export const externalScaffoldCards: ScaffoldCard[] = [
  {
    icon: Brain,
    title: "Attention capture",
    copy: "Keep the signal in front of you without forcing a generic workflow.",
  },
  {
    icon: Bolt,
    title: "Fast clarity",
    copy: "Turn the next action into something visible and concrete.",
  },
  {
    icon: Clock3,
    title: "Temporal scaffolding",
    copy: "Anchor time when the internal clock is noisy.",
  },
];

export function readScaffoldSeedFromLocation() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const seed = new URLSearchParams(window.location.search).get("seed")?.trim();
  return seed || undefined;
}
