// shared/billy/types.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
// Single source of truth for all Billy-layer TypeScript types.

export const BILLY_RUNTIME_VERSION = "2.1.0";

// ─── LLM message format ────────────────────────────────────────────────────
export interface BillyMessage {
  role:    "system" | "user" | "assistant";
  content: string;
}

// ─── Corpus chunk (retrieved from Supabase) ────────────────────────────────
export interface RetrievedChunk {
  id?:           string;
  document_id?:  string;
  content:       string;
  filename:      string;
  document_type?: string;
  chunk_index:   number;
  tags?:         string[];
  score?:        number;
  extracted_metadata?: Record<string, unknown>;
}

export interface RetrievedMemoryEntry {
  id: string;
  title?: string | null;
  summary?: string | null;
  content: string;
  kind: string;
  scope: string;
  importance: number;
  pinned: boolean;
  tags?: string[];
  score?: number;
}

export interface RetrievedContext {
  chunks:        RetrievedChunk[];
  retrievalMode: "semantic" | "text" | "text-only" | "none";
  packageFilter: string | null;
}

// ─── buildBillyMessages params ─────────────────────────────────────────────
export interface BuildBillyMessagesParams {
  query:          string;
  fragments:      RetrievedChunk[];
  packageFilter?: string | null;
  memories?:      RetrievedMemoryEntry[];
  plkProfile?:    string;
  gapSignal?:     string;
  systemPrompt?:  string;
}

// ─── RPC param types (used by supabase.ts) ─────────────────────────────────
export interface MatchKnowledgeFragmentsParams {
  queryEmbedding: number[];
  topK?:          number;
  packageFilter?: string | null;
}

export interface SearchKnowledgeFragmentsParams {
  query:          string;
  topK?:          number;
  packageFilter?: string | null;
}

// ─── Billy session tiers ───────────────────────────────────────────────────
export type BillyTier       = "anonymous" | "free" | "core" | "pro" | "enterprise" | "founder";
export type BillyProviderId =
  | "ollama" | "groq" | "gemini" | "anthropic"
  | "openai" | "openrouter" | "huggingface"
  | "offline-fallback";

export interface BillyResponseMetrics {
  provider:        BillyProviderId | string;
  retrievalMode:   "semantic" | "text" | "text-only" | "none";
  contextSources:  number;
  packageFilter:   string | null;
  latencyMs?:      number;
}

// ─── Diagnostics ───────────────────────────────────────────────────────────
export interface BillyDiagnosis {
  groq:            boolean;
  gemini:          boolean;
  anthropic:       boolean;
  openai:          boolean;
  supabase:        boolean;
  discord:         boolean;
  reddit_devvit:   boolean;
  reddit_snoowrap: boolean;
  slack:           boolean;
  web_api:         boolean;
  billyApiSecret:  boolean;
  ipGuardActive:   boolean;
}

export interface BillyDiagnosisDetails {
  status:  BillyDiagnosis;
  details: Record<keyof BillyDiagnosis, string>;
}

// ─── App user & runtime tables ─────────────────────────────────────────────
export interface AppUser {
  id:         string;
  created_at: string;
}

export interface BillySession {
  id:         string;
  user_id:    string;
  message:    string;
  response:   string | null;
  provider:   string | null;
  mode:       string;
  metadata:   Record<string, unknown>;
  created_at: string;
}

export interface BucketDrop {
  id:              string;
  user_id:         string;
  content:         string;
  raw_text:        string | null;
  capture_context: Record<string, unknown>;
  created_at:      string;
}

export interface MusicalDnaAnalysis {
  id:                string;
  user_id:           string;
  song_title:        string;
  artist:            string;
  analysis:          string | null;
  empowerment_score: number | null;
  created_at:        string;
}

export interface TribunalSession {
  id:           string;
  user_id:      string;
  question:     string;
  participants: string[];
  provider:     string | null;
  response:     string | null;
  metadata:     Record<string, unknown>;
  created_at:   string;
}

export interface KnowledgeFragment {
  id:            string;
  content:       string;
  content_hash:  string | null;
  embedding:     number[] | null;
  source_file:   string;
  document_type: string;
  chunk_index:   number;
  total_chunks:  number;
  char_count:    number | null;
  tags:          string[] | null;
  created_at:    string;
}
