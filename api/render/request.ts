import type { VercelRequest } from "@vercel/node";
import { z } from "zod";

const MAX_SOURCE_CHARS = 2_000_000;

const targetSchema = z.object({
  format: z.string().trim().min(1).max(32).transform((value) => value.toLowerCase()),
  mimeType: z.string().trim().min(1).max(128),
  width: z.number().int().positive().max(16_384).optional(),
  height: z.number().int().positive().max(16_384).optional(),
  quality: z.number().min(0).max(1).optional(),
  destinationIntent: z.string().trim().min(1).max(64).default("preview"),
  required: z.boolean().default(true),
}).strict();

const requestSchema = z.object({
  sourceFamily: z.enum([
    "scene_graph",
    "generated_artifact",
    "codex_artifact",
    "created_artifact",
    "transcriptory",
  ]),
  artifactId: z.string().trim().min(1).max(256).optional(),
  sceneGraph: z.unknown().optional(),
  content: z.string().max(MAX_SOURCE_CHARS).optional(),
  targets: z.array(targetSchema).min(1).max(8).optional(),
  idempotencyKey: z.string().trim().min(1).max(160).optional(),
}).strict();

export type RenderEngineRequest = z.infer<typeof requestSchema>;

export class RenderHttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export function parseRequestBody(req: VercelRequest): RenderEngineRequest {
  let raw: unknown;
  try {
    raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    throw new RenderHttpError(400, "INVALID_JSON", "The request body is not valid JSON.");
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new RenderHttpError(400, "INVALID_REQUEST", "The request body must be an object.");
  }

  const record = raw as Record<string, unknown>;
  const translated =
    !record.sourceFamily && record.graph
      ? {
          sourceFamily: "scene_graph",
          sceneGraph: record.graph,
          targets: record.targets,
          idempotencyKey:
            typeof record.jobId === "string" ? `legacy:${record.jobId}` : undefined,
        }
      : raw;

  const parsed = requestSchema.safeParse(translated);
  if (!parsed.success) {
    throw new RenderHttpError(400, "INVALID_REQUEST", "The render request is invalid.", {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (parsed.data.sourceFamily === "scene_graph") {
    if (!parsed.data.sceneGraph && !parsed.data.content) {
      throw new RenderHttpError(
        400,
        "MISSING_SCENE_GRAPH",
        "scene_graph requests require sceneGraph or content.",
      );
    }
  } else if (!parsed.data.artifactId) {
    throw new RenderHttpError(
      400,
      "MISSING_ARTIFACT_ID",
      `${parsed.data.sourceFamily} requests require artifactId.`,
    );
  }
  return parsed.data;
}
