import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const tierValues = ["SOLO_SPARK", "STUDIO", "GROWTH", "ENTERPRISE"] as const;
const domainValues = [
  "general",
  "resume",
  "adhd",
  "creative",
  "consulting",
  "custom"
] as const;

export const kitEnvSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    GROQ_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    EMBEDDING_PROVIDER: z.enum(["gemini", "openai"]),
    EMBEDDING_MODEL: z.string().min(1),
    EMBEDDING_DIMENSION: z.enum(["768", "1536"]),
    KIT_NAME: z.string().min(1),
    KIT_DOMAIN: z.enum(domainValues),
    KIT_TIER: z.enum(tierValues),
    KIT_PRIMARY_COLOR: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    // Optional voice integration variables. These are only required when
    // buyers enable speech capture and return paths. They remain optional
    // because most deployments will start without voice providers wired up.
    VOICE_INPUT_PROVIDER: z.string().optional(),
    VOICE_OUTPUT_PROVIDER: z.string().optional(),
    VOICE_CAPTURE_MODE: z.enum(["browser", "webrtc", "telephony"]).optional(),
    VOICE_TRANSCRIPT_BUCKET: z.string().optional(),
    VOICE_WEBHOOK_SECRET: z.string().optional(),

    // Optional Stripe keys. Presence of these signals that the buyer will
    // resell access to the kit. All of them are optional because self‑serve
    // buyers may never integrate with Stripe.
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (!value.GROQ_API_KEY && !value.OPENAI_API_KEY && !value.GEMINI_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one LLM provider key is required.",
        path: ["GROQ_API_KEY"]
      });
    }
  });

export type KitEnv = z.infer<typeof kitEnvSchema>;

export function parseEnvText(text: string): Record<string, string> {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .reduce<Record<string, string>>((accumulator, line) => {
      const separator = line.indexOf("=");

      if (separator < 0) {
        return accumulator;
      }

      const key = line.slice(0, separator).trim();
      const rawValue = line.slice(separator + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      accumulator[key] = value;
      return accumulator;
    }, {});
}

export function loadEnvFile(filePath: string): Record<string, string> {
  const resolvedPath = resolve(filePath);

  if (!existsSync(resolvedPath)) {
    return {};
  }

  return parseEnvText(readFileSync(resolvedPath, "utf8"));
}

export function validateKitEnv(
  input: Record<string, string | undefined>
): KitEnv {
  return kitEnvSchema.parse(input);
}

export function loadAndValidateEnv(
  filePath = ".env.local"
): { env: KitEnv; sourcePath: string } {
  const sourcePath = resolve(filePath);
  const fileEnv = loadEnvFile(sourcePath);
  const mergedEnv = {
    ...fileEnv,
    ...process.env
  };

  return {
    env: validateKitEnv(mergedEnv),
    sourcePath
  };
}

function runCli(): void {
  const candidatePath = process.argv[2] ?? ".env.local";

  try {
    const { env, sourcePath } = loadAndValidateEnv(candidatePath);
    const activeProviders = [
      env.GROQ_API_KEY ? "groq" : null,
      env.OPENAI_API_KEY ? "openai" : null,
      env.GEMINI_API_KEY ? "gemini" : null
    ].filter(Boolean);

    console.log(`Environment looks valid: ${sourcePath}`);
    console.log(`Tier: ${env.KIT_TIER}`);
    console.log(`Domain: ${env.KIT_DOMAIN}`);
    console.log(`Embedding: ${env.EMBEDDING_PROVIDER}/${env.EMBEDDING_MODEL}`);
    console.log(`Providers: ${activeProviders.join(", ")}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment validation failed:");

      for (const issue of error.issues) {
        const path = issue.path.join(".") || "root";
        console.error(`- ${path}: ${issue.message}`);
      }

      process.exitCode = 1;
      return;
    }

    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
