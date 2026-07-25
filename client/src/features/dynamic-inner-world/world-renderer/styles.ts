import type { WorldPosition } from "./types";

export function worldTransform(position: WorldPosition): string {
  const rotateX = position.rotateX ?? 0;
  const rotateY = position.rotateY ?? 0;
  const rotateZ = position.rotateZ ?? 0;
  const scale = position.scale ?? 1;

  return `translate3d(${position.x}px, ${position.y}px, ${position.z}px) rotateX(${rotateX}rad) rotateY(${rotateY}rad) rotateZ(${rotateZ}rad) scale(${scale})`;
}

export const typeFilterOptions = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "text", label: "Text" },
  { value: "code", label: "Code" },
  { value: "audio", label: "Audio" },
] as const;
