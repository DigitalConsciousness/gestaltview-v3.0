import type { TribunalParticipantSummary } from "./types";
import type { TrainerEmbodimentSlug } from "@shared/agent-trainer/embodiment";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMentionPattern(value: string): RegExp {
  const normalized = value.trim();
  const escaped = escapeRegExp(normalized).replace(/\s+/g, "\\s+");

  return new RegExp(`(^|[^\\w])@${escaped}(?=$|[^\\w])`, "i");
}

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function extractTribunalMentions(
  content: string,
  participants: TribunalParticipantSummary[],
): TrainerEmbodimentSlug[] {
  if (!content.trim() || participants.length === 0) {
    return [];
  }

  const hits: TrainerEmbodimentSlug[] = [];

  for (const participant of participants) {
    const candidates = uniqueValues([participant.slug, participant.label]);

    if (candidates.some((candidate) => buildMentionPattern(candidate).test(content))) {
      hits.push(participant.slug);
    }
  }

  return uniqueValues(hits);
}

export function stripTribunalMentions(content: string): string {
  return content.replace(/@\s+/g, "@").trim();
}
