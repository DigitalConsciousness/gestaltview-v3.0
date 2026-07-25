// GestaltView v2 — Billy Diagnostics
// © 2026 Keith Soyka / GestaltView

import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import type { BillyDiagnosis, BillyDiagnosisDetails } from "./types";

const REPO_ROOT = process.cwd();

function hasEnv(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(REPO_ROOT, relativePath), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function fileContains(relativePath: string, pattern: RegExp): Promise<boolean> {
  try {
    const content = await readFile(path.join(REPO_ROOT, relativePath), "utf8");
    return pattern.test(content);
  } catch {
    return false;
  }
}

export async function diagnoseBilly(): Promise<BillyDiagnosisDetails> {
  const status: BillyDiagnosis = {
    groq: hasEnv("GROQ_API_KEY"),
    gemini: hasEnv("GOOGLE_API_KEY") || hasEnv("GEMINI_API_KEY"),
    anthropic: hasEnv("ANTHROPIC_API_KEY"),
    openai: hasEnv("OPENAI_API_KEY"),
    supabase: hasEnv("SUPABASE_URL") && hasEnv("SUPABASE_SERVICE_ROLE_KEY"),
    discord: (await fileExists("src/discord/main.ts")) || (await fileExists("src/discord-bot/index.ts")),
    reddit_devvit: (await fileExists("src/billy/billy.reddit.ts")) || (await fileExists("devvit.json")),
    reddit_snoowrap: (await fileExists("src/client/reddit/billyRedditHandler.ts")) || (await fileExists("start-server.sh")),
    slack:
      ((await fileExists("listeners/assistant_message.py")) &&
        (await fileExists("agent/billy_engine.py")) &&
        (await fileExists("agent/supabase_retriever.py"))) ||
      (await fileExists("manifest.json")),
    web_api: await fileExists("api/billy.ts"),
    billyApiSecret: hasEnv("BILLY_API_SECRET"),
    ipGuardActive: await fileContains("client/src/lib/billy-system-prompt.ts", /IP_GUARD|intellectual property|never reproduce/i),
  };

  const details: BillyDiagnosisDetails["details"] = {
    groq: status.groq ? "GROQ_API_KEY is configured." : "Missing GROQ_API_KEY.",
    gemini: status.gemini ? "GOOGLE_API_KEY or GEMINI_API_KEY is configured." : "Missing GOOGLE_API_KEY and GEMINI_API_KEY.",
    anthropic: status.anthropic ? "ANTHROPIC_API_KEY is configured." : "Missing ANTHROPIC_API_KEY for pro/enterprise Anthropic fallback.",
    openai: status.openai ? "OPENAI_API_KEY is configured." : "Missing OPENAI_API_KEY fallback.",
    supabase: status.supabase ? "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured." : "Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY for retrieval.",
    discord: status.discord ? "Discord entrypoint files are present." : "Discord entrypoint files are not present in this repository.",
    reddit_devvit: status.reddit_devvit ? "Reddit Devvit surface files are present." : "Devvit configuration or billy.reddit entrypoint is missing in this repository.",
    reddit_snoowrap: status.reddit_snoowrap ? "Reddit Snoowrap surface files are present." : "Snoowrap polling entrypoint is missing in this repository.",
    slack: status.slack ? "Slack integration files are present." : "Slack deployment files are not present in this repository.",
    web_api: status.web_api ? "api/billy.ts exists." : "api/billy.ts is missing.",
    billyApiSecret: status.billyApiSecret ? "BILLY_API_SECRET is configured." : "Missing BILLY_API_SECRET for protected Billy API operations.",
    ipGuardActive: status.ipGuardActive ? "Billy system prompt includes IP guard language." : "Billy IP guard block was not detected in client/src/lib/billy-system-prompt.ts.",
  };

  return { status, details };
}
