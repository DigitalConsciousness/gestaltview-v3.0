// shared/billy/index.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView

export {
  BILLY_SYSTEM_PROMPT,
  inferPackageFromQuery,
  classifyIntent,
  deduplicateChunks,
  buildContextBlock,
  buildBillyMessages,
} from "./runtime";

export { diagnoseBilly } from "./diagnostics";

export type {
  BillyMessage,
  RetrievedChunk,
  RetrievedContext,
  BuildBillyMessagesParams,
  MatchKnowledgeFragmentsParams,
  SearchKnowledgeFragmentsParams,
  BillyTier,
  BillyProviderId,
  BillyResponseMetrics,
  BillyDiagnosis,
  BillyDiagnosisDetails,
  BillySession,
  BucketDrop,
  MusicalDnaAnalysis,
  TribunalSession,
  KnowledgeFragment,
  AppUser,
} from "./types";

export { BILLY_RUNTIME_VERSION } from "./types";
