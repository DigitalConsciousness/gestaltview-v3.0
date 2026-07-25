import type { CodexArtifact } from "../contracts.js";

export type AudioExportRequest = {
  artifact: Extract<CodexArtifact, { kind: "audio_narration" }> | Extract<CodexArtifact, { kind: "session_recap" }>;
  format: "mp3" | "wav";
};

export async function exportAudioNarration(_request: AudioExportRequest): Promise<Buffer> {
  throw new Error("Audio export requires a TTS/FFmpeg worker adapter and must run in the durable Codex export lane.");
}
