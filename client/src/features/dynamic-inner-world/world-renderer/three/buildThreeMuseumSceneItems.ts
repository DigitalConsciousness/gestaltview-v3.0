import type { WorldNode } from "../types";

export type ThreeMuseumSceneItem = {
  id: string;
  artifactId: string;
  label: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  active: boolean;
  color: string;
};

const MAX_SCENE_ITEMS = 14;
const POSITION_DIVISOR = 50;

function roundSceneValue(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function buildThreeMuseumSceneItems(nodes: WorldNode[]): ThreeMuseumSceneItem[] {
  return nodes
    .filter((node) => node.kind === "artifact-pod" && node.artifactId)
    .slice(0, MAX_SCENE_ITEMS)
    .map((node) => {
      const active = node.emphasis === "primary";
      const baseScale = node.position.scale ?? 1;

      return {
        id: node.id,
        artifactId: node.artifactId!,
        label: node.title ?? "Untitled artifact",
        position: [
          roundSceneValue(node.position.x / POSITION_DIVISOR),
          roundSceneValue(node.position.y / POSITION_DIVISOR),
          roundSceneValue(node.position.z / POSITION_DIVISOR),
        ],
        rotationY: node.position.rotateY ?? 0,
        scale: active ? 1.28 : Math.max(0.54, roundSceneValue(baseScale)),
        active,
        color: active ? "#67e8f9" : "#a78bfa",
      };
    });
}
