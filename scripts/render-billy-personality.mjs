import { readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const billyProfilePath = path.join(
  repoRoot,
  "embodiment_profiles",
  "billy.embodiment.json"
);

function toMarkdownList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function toMarkdownEntries(entries) {
  return Object.entries(entries)
    .map(([key, value]) => {
      const label = key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/^\w/, (char) => char.toUpperCase());
      return `- **${label}** — ${value}`;
    })
    .join("\n");
}

async function main() {
  const raw = await readFile(billyProfilePath, "utf8");
  const profile = JSON.parse(raw);
  const core = profile.immutableCore;

  const document = [
    "# Billy — GestaltView Digital Intelligence",
    "",
    "_Generated from `embodiment_profiles/billy.embodiment.json`. Update the embodiment profile, not this rendered artifact._",
    "",
    "## Canonical Identity",
    "",
    `- Public name: ${profile.publicName}`,
    `- Internal designation: ${profile.internalDesignation}`,
    `- Embodiment version: ${profile.embodimentVersion}`,
    `- Archetype: ${core.archetype}`,
    `- Archetypal energy: ${core.archetypalEnergy}`,
    `- Relational stance: ${core.relationalStance}`,
    "",
    "## Foundational Truth",
    "",
    core.foundationalTruth,
    "",
    "## Core Wisdom",
    "",
    core.coreWisdom,
    "",
    "## Origin Context",
    "",
    profile.originContext,
    "",
    "## Voice & Communication Style",
    "",
    `- Tone: ${core.voiceTone}`,
    `- Verbosity: ${core.communicationStyle.verbosity}`,
    `- Directness: ${core.communicationStyle.directness}`,
    `- Humor: ${core.communicationStyle.humor}`,
    `- Formality: ${core.communicationStyle.formality}`,
    `- Metaphor family: ${core.metaphorFamily.join(", ")}`,
    "",
    "## Always Does",
    "",
    toMarkdownList(core.linguisticPatterns.alwaysDoes),
    "",
    "## Never Does",
    "",
    toMarkdownList(core.linguisticPatterns.neverDoes),
    "",
    "## Ethical Boundaries",
    "",
    toMarkdownEntries(core.ethicalBoundaries),
    "",
    "## Repo Awareness Requirements",
    "",
    "- ALWAYS know which repo you're in and name concrete files when discussing code.",
    "- If you are unsure, say what you know and what is inferred.",
    "- Reference active branch, recent commit, and relevant repo docs when useful.",
    "- Never claim success without checking.",
    "- Never suggest Anthropic/Claude for Billy's primary runtime. Billy runs on Gemini Flash 2.0 when that path is available.",
    "",
    "## Skill Awareness Requirements",
    "",
    "- Notice when a relevant skill exists and use it.",
    "- Surface available repo skills when they materially help.",
    "- Prefer the repo's actual instructions over generic assumptions.",
    "",
  ].join("\n");

  process.stdout.write(document);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
