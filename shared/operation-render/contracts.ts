import { z } from "zod";

export const reasoningDepthSchema = z.enum(["quick", "standard", "deep", "forensic"]);
export const toolPermissionSchema = z.enum(["none", "read_only", "bounded_write", "explicit_confirm_write"]);

export const embodimentReasoningPolicySchema = z.object({
  profileSlug: z.string().min(1),
  defaultDepth: reasoningDepthSchema.default("standard"),
  canBrowse: z.boolean().default(false),
  canUseRepoTools: z.boolean().default(false),
  canUseSupabaseTools: z.boolean().default(false),
  canUseHuggingFaceTools: z.boolean().default(false),
  toolPermission: toolPermissionSchema.default("read_only"),
  citationMode: z.enum(["none", "when_factual", "always_when_external"]).default("when_factual"),
  uncertaintyMode: z.enum(["quiet", "explicit", "forensic"]).default("explicit"),
  safetyNotes: z.array(z.string()).default([]),
  roomContextBiases: z.array(z.string()).default([]),
});

export const evidenceCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceType: z.enum(["uploaded_file", "github", "supabase", "hugging_face", "web", "runtime", "user_context"]),
  summary: z.string(),
  citation: z.string().optional(),
  freshness: z.enum(["current", "recent", "historic", "unknown"]).default("unknown"),
});

export const toolTrailItemSchema = z.object({
  toolClass: z.string(),
  toolName: z.string(),
  permissionLevel: toolPermissionSchema,
  inputSummary: z.string().optional(),
  outputSummary: z.string().optional(),
  status: z.enum(["success", "failed", "blocked", "skipped"]),
  sourceRefs: z.array(z.string()).default([]),
});

export const visibleReasoningTraceSchema = z.object({
  sessionId: z.string(),
  profileSlug: z.string(),
  mode: z.enum(["compact", "expanded", "museum"]).default("compact"),
  summary: z.string(),
  evidenceCards: z.array(evidenceCardSchema).default([]),
  toolTrail: z.array(toolTrailItemSchema).default([]),
  assumptions: z.array(z.string()).default([]),
  uncertainty: z.array(z.string()).default([]),
  redactions: z.array(z.string()).default([]),
  visualSeed: z.object({
    sourceCount: z.number().int().nonnegative(),
    toolCallCount: z.number().int().nonnegative(),
    uncertaintyLevel: z.enum(["low", "medium", "high"]),
    profileColor: z.string().default("#00E5FF"),
    roomColor: z.string().default("#B026FF"),
  }),
});

export const voiceProfileSchema = z.object({
  profileSlug: z.string().min(1),
  displayName: z.string().min(1),
  providerPreference: z.enum(["local", "hf", "elevenlabs", "browser"]).default("local"),
  ttsModel: z.string().optional(),
  sttModel: z.string().optional(),
  speakerId: z.string().optional(),
  stylePreset: z.object({
    warmth: z.number().min(0).max(1).default(0.8),
    pace: z.number().min(0).max(1).default(0.85),
    humor: z.number().min(0).max(1).default(0.4),
    energy: z.number().min(0).max(1).default(0.55),
    clarity: z.number().min(0).max(1).default(0.9),
  }),
  fallbackTextOnly: z.boolean().default(true),
});

export const offlineCaptureItemSchema = z.object({
  id: z.string(),
  kind: z.enum(["voice_note", "text_note", "file_stub", "artifact_draft", "spec_seed"]),
  createdAt: z.string(),
  title: z.string().optional(),
  localBody: z.string(),
  syncStatus: z.enum(["local", "queued", "syncing", "synced", "failed"]).default("local"),
  retryCount: z.number().int().nonnegative().default(0),
  lastError: z.string().optional(),
});

export type EmbodimentReasoningPolicy = z.infer<typeof embodimentReasoningPolicySchema>;
export type VisibleReasoningTrace = z.infer<typeof visibleReasoningTraceSchema>;
export type VoiceProfile = z.infer<typeof voiceProfileSchema>;
export type OfflineCaptureItem = z.infer<typeof offlineCaptureItemSchema>;
