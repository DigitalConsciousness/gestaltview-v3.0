import { INNER_WORLD_SURFACES, type CaptureDisplayMode, type InnerWorldCapture, type InnerWorldSurface } from "@/components/Scaffold";

export type InnerWorldPlacement = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  displayMode: CaptureDisplayMode;
  mediaUrl?: string;
  thumbnailUrl?: string;
};

type GroupedInnerWorldCaptures = Record<InnerWorldSurface, InnerWorldCapture[]>;

const surfaceIds = new Set<InnerWorldSurface>(INNER_WORLD_SURFACES.map((surface) => surface.id));

function isInnerWorldSurface(value: string | undefined): value is InnerWorldSurface {
  return Boolean(value && surfaceIds.has(value as InnerWorldSurface));
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 50;
  }

  if (value >= 0 && value <= 1) {
    return Math.round(value * 100);
  }

  return Math.min(92, Math.max(8, Math.round(value)));
}

function hashNumber(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function inferDisplayMode(capture: InnerWorldCapture): CaptureDisplayMode {
  const explicit = capture.metadata?.display?.displayMode;
  if (explicit) {
    return explicit;
  }

  const type = capture.type.toLowerCase();
  const source = capture.source.toLowerCase();
  const text = capture.text.toLowerCase();

  if (type.includes("audio") || source.includes("voice") || source.includes("transcriptory")) {
    return "waveform";
  }

  if (type.includes("image") || capture.metadata?.display?.thumbnailUrl || capture.metadata?.display?.mediaUrl) {
    return "photo";
  }

  if (type.includes("code") || /```|function\s|const\s|class\s|import\s/.test(text)) {
    return "code-panel";
  }

  if (type.includes("fragment")) {
    return "fragment-shard";
  }

  if (type.includes("journal") || type.includes("memory")) {
    return "sticky-note";
  }

  return "pinboard";
}

export function groupInnerWorldCaptures(captures: InnerWorldCapture[]): GroupedInnerWorldCaptures {
  const grouped = INNER_WORLD_SURFACES.reduce((accumulator, surface) => {
    accumulator[surface.id] = [];
    return accumulator;
  }, {} as GroupedInnerWorldCaptures);

  for (const capture of captures) {
    const surface = isInnerWorldSurface(capture.surface) ? capture.surface : "forward";
    grouped[surface].push(capture);
  }

  return grouped;
}

export function resolveInnerWorldPlacement(capture: InnerWorldCapture, index: number): InnerWorldPlacement {
  const display = capture.metadata?.display;
  const hash = hashNumber(`${capture.id}:${capture.title}:${capture.createdAt}`);
  const column = index % 3;
  const row = Math.floor(index / 3) % 4;

  return {
    x: clampPercent(display?.x ?? 20 + column * 30 + (hash % 9)),
    y: clampPercent(display?.y ?? 24 + row * 18 + (hash % 11)),
    rotation: display?.rotation ?? ((hash % 17) - 8),
    scale: display?.scale ?? Number((0.92 + (hash % 18) / 100).toFixed(2)),
    displayMode: inferDisplayMode(capture),
    mediaUrl: display?.mediaUrl ?? capture.metadata?.attachment?.previewUrl ?? capture.metadata?.attachment?.objectUrl,
    thumbnailUrl: display?.thumbnailUrl ?? capture.metadata?.attachment?.dataUrl,
  };
}
