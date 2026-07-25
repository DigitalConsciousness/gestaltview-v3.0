import { promises as fs } from "node:fs";
import path from "node:path";

import { AgentSummarySchema, type AgentSummary } from "../../shared/agent-trainer/schemas.js";

const AGENTS_DIR = path.resolve(process.cwd(), "agents");
const EXCLUDED_BASENAMES = new Set(["INDEX.md", "README.md"]);

export interface LocalAgentCatalogEntry {
  slug: string;
  title: string;
  domain: string;
  description: string;
  filePath: string;
  categorySlug: string | null;
  categoryTitle: string | null;
  model: string | null;
  tools: string[];
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function parseScalar(frontmatter: string, key: string): string | null {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1] ? stripQuotes(match[1]) : null;
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function categorySlugFromFolder(folderName: string): string {
  return folderName.replace(/^\d+-/, "");
}

function summarizeDescription(value: string | null): string {
  if (!value) return "";
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.split("Examples:")[0]?.trim() ?? cleaned;
}

function parseToolList(value: string | null): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((tool) => tool.trim()).filter(Boolean))];
}

function parseFrontmatter(markdown: string): Record<string, string> | null {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = match[1];
  return {
    name: parseScalar(frontmatter, "name") ?? "",
    title: parseScalar(frontmatter, "title") ?? "",
    domain: parseScalar(frontmatter, "domain") ?? "",
    description: summarizeDescription(parseScalar(frontmatter, "description")),
    model: parseScalar(frontmatter, "model") ?? "",
    tools: parseScalar(frontmatter, "tools") ?? "",
  };
}

function inferCategory(relativePath: string): {
  categorySlug: string | null;
  categoryTitle: string | null;
} {
  const parts = relativePath.split("/");
  if (parts[0] !== "agents" || parts[1] !== "categories" || parts.length < 4) {
    return { categorySlug: null, categoryTitle: null };
  }

  const categorySlug = categorySlugFromFolder(parts[2] || "");
  return {
    categorySlug: categorySlug || null,
    categoryTitle: categorySlug ? titleFromSlug(categorySlug) : null,
  };
}

function inferDomain(frontmatter: Record<string, string> | null, categorySlug: string | null): string {
  const domain = frontmatter?.domain?.trim();
  if (domain) {
    return domain;
  }

  return categorySlug || "general";
}

function sourcePriority(relativePath: string): number {
  if (relativePath.startsWith("agents/categories/")) {
    return 1;
  }

  if (relativePath.startsWith("agents/") && relativePath.split("/").length === 2) {
    return 3;
  }

  return 2;
}

function compareCatalogEntries(left: LocalAgentCatalogEntry, right: LocalAgentCatalogEntry): number {
  const priorityDelta = sourcePriority(right.filePath) - sourcePriority(left.filePath);
  if (priorityDelta !== 0) return priorityDelta;

  const leftCategory = left.categoryTitle ?? "";
  const rightCategory = right.categoryTitle ?? "";
  const categoryDelta = leftCategory.localeCompare(rightCategory);
  if (categoryDelta !== 0) return categoryDelta;

  return left.title.localeCompare(right.title);
}

function isCatalogAgentMarkdown(relativePath: string): boolean {
  const normalized = toPosixPath(relativePath);
  const baseName = path.posix.basename(normalized);

  if (!normalized.endsWith(".md")) return false;
  if (EXCLUDED_BASENAMES.has(baseName)) return false;
  if (baseName.endsWith("-quickstart.md")) return false;
  if (normalized.startsWith("agents/generated/")) return false;
  if (normalized.startsWith("agents/tools/")) return false;
  if (normalized.startsWith("agents/") && normalized.split("/").length > 2 && !normalized.startsWith("agents/categories/")) {
    return false;
  }

  return true;
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  let entries: Array<{ name: string; isDirectory: () => boolean; isFile: () => boolean }> = [];

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(absolutePath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const relativePath = toPosixPath(path.relative(process.cwd(), absolutePath));
    if (isCatalogAgentMarkdown(relativePath)) {
      files.push(relativePath);
    }
  }

  return files;
}

function normalizeSourceFile(sourceFile: string): string | null {
  const absolutePath = path.resolve(process.cwd(), sourceFile);
  const relativePath = toPosixPath(path.relative(process.cwd(), absolutePath));
  const agentsPrefix = `${toPosixPath(path.relative(process.cwd(), AGENTS_DIR))}/`;

  if (!relativePath.startsWith(agentsPrefix) && relativePath !== toPosixPath(path.relative(process.cwd(), AGENTS_DIR))) {
    return null;
  }

  return relativePath;
}

function buildCatalogEntry(relativePath: string, markdown: string): LocalAgentCatalogEntry {
  const frontmatter = parseFrontmatter(markdown);
  const { categorySlug, categoryTitle } = inferCategory(relativePath);
  const slug = frontmatter?.name?.trim() || path.posix.basename(relativePath, ".md");

  return {
    slug,
    title: frontmatter?.title?.trim() || titleFromSlug(slug),
    domain: inferDomain(frontmatter, categorySlug),
    description: frontmatter?.description?.trim() || "",
    filePath: relativePath,
    categorySlug,
    categoryTitle,
    model: frontmatter?.model?.trim() || null,
    tools: parseToolList(frontmatter?.tools ?? null),
  };
}

async function scanLocalAgentCatalog(): Promise<LocalAgentCatalogEntry[]> {
  const files = await walkMarkdownFiles(AGENTS_DIR);
  if (files.length === 0) {
    return [];
  }

  const parsedEntries = await Promise.all(
    files.map(async (relativePath) => {
      const absolutePath = path.resolve(process.cwd(), relativePath);
      const markdown = await fs.readFile(absolutePath, "utf8");
      return buildCatalogEntry(relativePath, markdown);
    })
  );

  const deduped = new Map<string, LocalAgentCatalogEntry>();
  for (const entry of parsedEntries) {
    const existing = deduped.get(entry.slug);
    if (!existing || sourcePriority(entry.filePath) > sourcePriority(existing.filePath)) {
      deduped.set(entry.slug, entry);
    }
  }

  return [...deduped.values()].sort(compareCatalogEntries);
}

export function isLocalAgentSourceFile(sourceFile: string): boolean {
  const normalized = normalizeSourceFile(sourceFile);
  return Boolean(normalized && isCatalogAgentMarkdown(normalized));
}

export async function listLocalAgentEntries(): Promise<LocalAgentCatalogEntry[]> {
  return scanLocalAgentCatalog();
}

export async function listLocalAgentCatalog(): Promise<AgentSummary[]> {
  const entries = await scanLocalAgentCatalog();

  return entries.map((entry) =>
    AgentSummarySchema.parse({
      slug: entry.slug,
      title: entry.title,
      domain: entry.domain,
      status: "draft",
      activeVersionId: null,
      source: "local",
    })
  );
}

export async function findLocalAgentEntryBySourceFile(sourceFile: string): Promise<LocalAgentCatalogEntry | null> {
  const normalized = normalizeSourceFile(sourceFile);
  if (!normalized || !isCatalogAgentMarkdown(normalized)) {
    return null;
  }

  const entries = await scanLocalAgentCatalog();
  return entries.find((entry) => entry.filePath === normalized) ?? null;
}

export async function loadLocalAgentMarkdown(slug: string): Promise<string | null> {
  const entries = await scanLocalAgentCatalog();
  const entry = entries.find((candidate) => candidate.slug === slug);
  if (!entry) {
    return null;
  }

  return loadLocalAgentMarkdownBySourceFile(entry.filePath);
}

export async function loadLocalAgentMarkdownBySourceFile(sourceFile: string): Promise<string | null> {
  const normalized = normalizeSourceFile(sourceFile);
  if (!normalized || !isCatalogAgentMarkdown(normalized)) {
    return null;
  }

  try {
    return await fs.readFile(path.resolve(process.cwd(), normalized), "utf8");
  } catch {
    return null;
  }
}
