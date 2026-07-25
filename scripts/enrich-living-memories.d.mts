export interface EnrichmentEvent {
  diSlug: string;
  domain: string;
  content: string;
  memory_type: string;
  significance: number | string;
  retrieval_weight: number | string;
  source: string;
  created_at?: string;
}

export interface LivingMemoryEntry {
  domain: string;
  memoryType: string;
  significance: number | string;
  content: string;
  retrievalWeight: number;
}

export function sortObjectKeys<T>(value: T): T;
export function selectEnrichmentCandidates<T extends { significance: number | string }>(
  events: T[],
  minimumSignificance?: number
): T[];
export function mergeLivingMemoryEntries<
  E extends LivingMemoryEntry,
  T extends EnrichmentEvent,
>(existingEntries: E[], events: T[]): Array<E | LivingMemoryEntry>;
export function main(): Promise<void>;
