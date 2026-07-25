import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { WorldPlan } from "../types";
import { buildThreeMuseumSceneItems } from "./buildThreeMuseumSceneItems";

const BrowserThreeMuseumScene = lazy(() => import("./BrowserThreeMuseumScene"));

type ThreeMuseumBackdropProps = {
  plan: WorldPlan;
  reducedMotion: boolean;
};

export function ThreeMuseumBackdrop({ plan, reducedMotion }: ThreeMuseumBackdropProps) {
  const [canUseCanvas, setCanUseCanvas] = useState(false);
  const items = useMemo(() => buildThreeMuseumSceneItems(plan.nodes), [plan.nodes]);

  useEffect(() => {
    setCanUseCanvas(typeof window !== "undefined" && items.length > 0);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" data-gv-three-museum="true" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.18),rgba(3,7,18,0.84))]" />
      {canUseCanvas ? (
        <Suspense fallback={<div className="absolute inset-0 bg-cyan-950/10" />}>
          <BrowserThreeMuseumScene items={items} reducedMotion={reducedMotion} />
        </Suspense>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(103,232,249,0.18),transparent_34%),linear-gradient(180deg,rgba(3,7,18,0.2),rgba(3,7,18,0.86))]" />
      )}
    </div>
  );
}
