// GestaltView v2 — Supabase Manifest Index TypeScript Types
// © 2026 Keith Soyka / GestaltView

export interface AppUser {
  id: string;
  created_at: string;
}

export interface ConsciousnessProfile {
  id: string;
  user_id: string;
  profile: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BucketDrop {
  id: string;
  user_id: string;
  content: string;
  raw_text: string | null;
  capture_context: Record<string, unknown>;
  created_at: string;
}

export interface MusicalDnaAnalysis {
  id: string;
  user_id: string;
  song_title: string;
  artist: string;
  analysis: string | null;
  empowerment_score: number | null;
  created_at: string;
}

export interface TribunalSession {
  id: string;
  user_id: string;
  question: string;
  participants: string[];
  provider: string | null;
  response: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BillySession {
  id: string;
  user_id: string;
  message: string;
  response: string | null;
  provider: string | null;
  mode: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProcessingRun {
  run_id: string;
  tenant_id: string;
  status: string;
  model: string | null;
  corpus_root: string | null;
  documents_count: number;
  chunks_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  document_id: string;
  run_id: string;
  tenant_id: string;
  path: string;
  filename: string;
  hash: string;
  chunk_index: number;
  total_chunks: number;
  file_size_bytes: number | null;
  content: string;
  mime_type: string | null;
  extracted_metadata: Record<string, unknown>;
  provenance: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface Embedding {
  id: string;
  document_id: string;
  model: string;
  embedding: number[];
  created_at: string;
}

export interface KnowledgeFragment {
  id: string;
  content: string;
  content_hash: string | null;
  embedding: number[] | null;
  source_file: string;
  document_type: string;
  chunk_index: number;
  total_chunks: number;
  char_count: number | null;
  tags: string[] | null;
  created_at: string;
}

export interface TribunalEvent {
  id: string;
  question: string;
  candidate_answers: CandidateAnswer[];
  winning_answer_id: string | null;
  verdict_summary: string | null;
  triggering_agent: string | null;
  created_at: string;
}

export interface TribunalEvidence {
  id: string;
  tribunal_event_id: string;
  document_id: string | null;
  fragment_id: string | null;
  weight: number;
  comment: string | null;
  created_at: string;
}

export interface CandidateAnswer {
  id: string;
  provider: string;
  response: string;
  score?: number;
}

export interface MatchKnowledgeFragmentResult {
  id: string;
  content: string;
  source_file: string;
  document_type: string;
  chunk_index: number;
  tags: string[] | null;
  similarity: number;
}

export interface SearchKnowledgeFragmentResult {
  id: string;
  content: string;
  source_file: string;
  document_type: string;
  chunk_index: number;
  tags: string[] | null;
  rank: number;
}

export interface KnowledgeStats {
  document_type: string;
  fragment_count: number;
  total_chars: number;
  file_count: number;
  last_updated: string;
}
