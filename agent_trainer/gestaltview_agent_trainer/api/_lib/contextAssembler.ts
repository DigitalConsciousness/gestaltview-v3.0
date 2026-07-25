import type { KnowledgeFragment } from "./contracts";

export interface ContextAssemblerInput {
  fragments: KnowledgeFragment[];
  maxCharacters?: number;
}

function extractSignalWeight(fragment: KnowledgeFragment): number {
  const metadata = fragment.metadata ?? {};
  const gravity = metadata.gravity as Record<string, unknown> | undefined;
  const candidates = [
    metadata.signal_weight,
    metadata.gravity_signal_weight,
    metadata.signalWeight,
    gravity?.signal_weight,
    gravity?.signalWeight
  ];

  for (const candidate of candidates) {
    const numeric = typeof candidate === "number" ? candidate : Number(candidate);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return 0;
}

export function assembleContext({
  fragments,
  maxCharacters = 2400
}: ContextAssemblerInput): string {
  let output = "";
  const orderedFragments = [...fragments].sort((a, b) => {
    const weightDelta = extractSignalWeight(b) - extractSignalWeight(a);
    if (weightDelta !== 0) {
      return weightDelta;
    }

    return a.chunkIndex - b.chunkIndex;
  });

  for (const fragment of orderedFragments) {
    const block =
      `# ${fragment.title}\n` +
      `namespace: ${fragment.namespace}\n` +
      `${fragment.content.trim()}\n\n`;

    if ((output + block).length > maxCharacters) {
      break;
    }

    output += block;
  }

  return output.trim();
}
