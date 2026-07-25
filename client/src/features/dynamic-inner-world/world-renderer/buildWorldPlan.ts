import type {
  BuildWorldPlanInput,
  WorldNode,
  WorldPlan,
  WorldPosition,
  WorldRenderMode,
} from "./types";

function hashNumber(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

const PRIMARY_SHOWCASE_POSITION: WorldPosition = {
  x: 0,
  y: -4,
  z: 28,
  rotateX: -0.02,
  rotateY: 0,
  scale: 1.18,
};

const HALL_SHOWCASE_SLOTS: WorldPosition[] = [
  { x: -332, y: -38, z: -114, rotateY: 0.34, scale: 0.92 },
  { x: 332, y: -38, z: -114, rotateY: -0.34, scale: 0.92 },
  { x: -386, y: -18, z: -344, rotateY: 0.42, scale: 0.86 },
  { x: 386, y: -18, z: -344, rotateY: -0.42, scale: 0.86 },
  { x: -468, y: 12, z: -610, rotateY: 0.68, scale: 0.8 },
  { x: 468, y: 12, z: -610, rotateY: -0.68, scale: 0.8 },
  { x: -184, y: 70, z: -736, rotateY: 0.18, scale: 0.74 },
  { x: 184, y: 70, z: -736, rotateY: -0.18, scale: 0.74 },
];

function clonePosition(position: WorldPosition): WorldPosition {
  return { ...position };
}

function positionForArtifact(
  id: string,
  index: number,
  total: number,
  mode: WorldRenderMode,
): WorldPosition {
  const slot = HALL_SHOWCASE_SLOTS[index % HALL_SHOWCASE_SLOTS.length];
  const lap = Math.floor(index / HALL_SHOWCASE_SLOTS.length);
  const hash = hashNumber(id);

  if (mode === "museum") {
    return clonePosition(slot);
  }

  if (mode === "constellation") {
    const leftWing = index % 2 === 0;
    const wingOffset = leftWing ? -1 : 1;
    return {
      x: slot.x + wingOffset * (lap * 118 + (hash % 42)),
      y: slot.y + ((hash % 54) - 27),
      z: slot.z - lap * 164 - (hash % 68),
      rotateY: (slot.rotateY ?? 0) + wingOffset * 0.08,
      rotateX: lap > 0 ? -0.04 : undefined,
      scale: Math.max(0.62, (slot.scale ?? 0.84) - lap * 0.055),
    };
  }

  const angle = (index / Math.max(1, total)) * Math.PI * 2;
  const radius = 430 + lap * 70 + (hash % 96);
  return {
    x: Math.round(Math.cos(angle) * radius),
    y: (hash % 120) - 60,
    z: Math.round(-520 + Math.sin(angle) * radius * 0.58),
    rotateY: -angle * 0.34,
    rotateX: (hash % 10) / 100,
    scale: 0.58 + (hash % 18) / 100,
  };
}

function pickAccent(
  input: BuildWorldPlanInput,
): WorldPlan["atmosphere"]["accent"] {
  if (input.selectedTags.some((tag) => /archive|memory|journal/i.test(tag))) {
    return "gold";
  }

  if (input.typeFilter === "image") {
    return "purple";
  }

  if (input.typeFilter === "code") {
    return "emerald";
  }

  return "cyan";
}

function getMode(artifactCount: number): WorldRenderMode {
  if (artifactCount > 40) {
    return "archive";
  }

  if (artifactCount > 8) {
    return "constellation";
  }

  return "museum";
}

export function buildWorldPlan(input: BuildWorldPlanInput): WorldPlan {
  const mode = getMode(input.artifacts.length);
  const visibleArtifacts = input.artifacts.slice(
    0,
    mode === "archive" ? 60 : 72,
  );
  const selectedArtifact =
    visibleArtifacts.find(
      (artifact) => artifact.id === input.selectedArtifactId,
    ) ??
    visibleArtifacts[0] ??
    null;

  if (visibleArtifacts.length === 0) {
    return {
      id: "inner-world-plan-empty",
      mode: "museum",
      generatedAt: "deterministic-local",
      selectedArtifactId: null,
      nodes: [
        {
          id: "empty-hall",
          kind: "empty-hall-state",
          title: "No showcases lit yet",
          summary: input.searchQuery.trim()
            ? "Nothing matches the current search and filters."
            : "Send a finished HTML artifact from Creation Corner and the museum hall will light up.",
          position: { x: 0, y: 0, z: 0, scale: 1 },
          emphasis: "primary",
        },
        {
          id: "control-deck",
          kind: "search-control-deck",
          position: { x: 0, y: -120, z: 160, scale: 1 },
          emphasis: "ambient",
        },
        {
          id: "curator-console",
          kind: "curator-console",
          position: { x: 220, y: 38, z: 120, scale: 1 },
          emphasis: "ambient",
        },
      ],
      atmosphere: {
        density: 0.3,
        accent: pickAccent(input),
        signage: "Awaiting finished artifacts",
        corridorDepth: 660,
      },
      curator: {
        activePersonaSlug: "curator",
        message: input.searchQuery.trim()
          ? "Nothing matches those filters yet. Clear them and the hall will answer."
          : "The hall is empty, not broken. It is waiting for a finished piece worth putting behind glass.",
        note: `${input.archivedArtifacts.length} archived pieces remain available.`,
      },
    };
  }

  const artifactNodes: WorldNode[] = visibleArtifacts.map((artifact, index) => {
    const isSelected = artifact.id === selectedArtifact?.id;

    return {
      id: `node-${artifact.id}`,
      kind: "artifact-pod",
      artifactId: artifact.id,
      title: artifact.title,
      summary: artifact.summary,
      tags: artifact.tags,
      position: isSelected
        ? PRIMARY_SHOWCASE_POSITION
        : positionForArtifact(
            artifact.id,
            index,
            visibleArtifacts.length,
            mode,
          ),
      emphasis: isSelected ? "primary" : "secondary",
    };
  });

  const resonanceNodes: WorldNode[] = input.resonanceLinks
    .slice(0, 5)
    .map((link, index) => ({
      id: `rail-${link.artifactId}`,
      kind: "resonance-rail",
      artifactId: link.artifactId,
      title: link.title,
      summary: link.reason,
      position: {
        x: -220 + index * 110,
        y: 128 + (index % 2) * 22,
        z: 126 + index * 14,
        scale: 1,
      },
      emphasis: "ambient",
      props: { score: link.score, reason: link.reason },
    }));

  return {
    id: `inner-world-plan-${mode}-${selectedArtifact?.id ?? "empty"}-${input.artifacts.length}`,
    mode,
    generatedAt: "deterministic-local",
    selectedArtifactId: selectedArtifact?.id ?? null,
    nodes: [
      {
        id: "atrium",
        kind: "world-atrium",
        title: "Dynamic Inner World",
        summary:
          "A long hall of rendered HTML artifacts, with a T-junction of showcases at the far end.",
        position: { x: 0, y: 0, z: 0, scale: 1 },
        emphasis: "ambient",
      },
      {
        id: "stats-ribbon",
        kind: "world-stats-ribbon",
        position: { x: 0, y: -150, z: 190, scale: 1 },
        emphasis: "ambient",
      },
      ...artifactNodes,
      ...resonanceNodes,
      {
        id: "archive-vault",
        kind: "archive-vault",
        title: "Archive vault",
        summary: `${input.archivedArtifacts.length} archived pieces`,
        position: { x: -310, y: 76, z: 154, rotateY: 0.1, scale: 0.94 },
        emphasis: "archived",
      },
      {
        id: "control-deck",
        kind: "search-control-deck",
        position: { x: 0, y: -126, z: 210, scale: 1 },
        emphasis: "ambient",
      },
      {
        id: "curator-console",
        kind: "curator-console",
        position: { x: 306, y: 76, z: 150, rotateY: -0.1, scale: 0.94 },
        emphasis: "ambient",
      },
    ],
    atmosphere: {
      density:
        mode === "archive" ? 0.54 : mode === "constellation" ? 0.44 : 0.36,
      accent: pickAccent(input),
      signage: selectedArtifact ? selectedArtifact.title : "No artifacts yet",
      corridorDepth:
        mode === "archive" ? 1060 : mode === "constellation" ? 860 : 700,
    },
    curator: {
      activePersonaSlug: "curator",
      message: selectedArtifact
        ? `I pulled ${selectedArtifact.title} down the center lane. It can be inspected without flattening the rest of the hall.`
        : "Send something finished from Creation Corner and the showcases will wake up.",
      note: `${input.artifacts.length} visible artifacts · ${input.archivedArtifacts.length} archived`,
    },
  };
}
