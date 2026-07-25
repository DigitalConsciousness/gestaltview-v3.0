// © 2026 Keith Soyka — GestaltView
import { useEffect, useMemo } from "react";
import type { ExhibitContext } from "@/lib/BillyEngine";

export interface BillyExhibitContext extends ExhibitContext {}

export type BillyExhibitBridgePacket = Record<string, unknown> & {
  context: BillyExhibitContext;
  payload: Record<string, unknown>;
  updatedAt: string;
};

export interface UseBillyExhibitBridgeOptions {
  context: BillyExhibitContext;
  payload: Record<string, unknown>;
}

export const useBillyExhibitBridge = ({
  context,
  payload,
}: UseBillyExhibitBridgeOptions): BillyExhibitBridgePacket => {
  const packet = useMemo<BillyExhibitBridgePacket>(
    () => ({
      context,
      payload,
      updatedAt: new Date().toISOString(),
    }),
    [context, payload],
  );

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("gestaltview:billy-exhibit-bridge", {
        detail: packet,
      }),
    );
  }, [packet]);

  return packet;
};

export default useBillyExhibitBridge;
