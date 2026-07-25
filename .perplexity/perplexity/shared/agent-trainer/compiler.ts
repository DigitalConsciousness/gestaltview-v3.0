import { AgentSpecSchema, type AgentExample, type AgentSpec } from "./schemas.js";

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeList(items: string[]): string[] {
  return items
    .map((item) => item.trim())
    .filter(Boolean);
}

function yamlScalar(value: string): string {
  if (!value.includes("\n") && !/[#:>"'[\]{}]/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

function yamlBlock(key: string, value: string): string[] {
  const lines = value.trim().split("\n").map((line) => `  ${line}`);
  return [`${key}: |-`, ...lines];
}

function renderExample(example: AgentExample): string {
  return [
    "<example>",
    `Context: ${example.context}`,
    `user: ${example.user}`,
    `assistant: ${example.assistant_approach}`,
    "<commentary>",
    example.commentary,
    "</commentary>",
    "</example>",
  ].join("\n");
}

function renderNumbered(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function renderBulleted(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

export function normalizeAgentSpec(input: AgentSpec): AgentSpec {
  const parsed = AgentSpecSchema.parse(input);

  return {
    ...parsed,
    title: parsed.title?.trim() || titleFromSlug(parsed.name),
    domain: parsed.domain.trim(),
    description: parsed.description.trim(),
    model: parsed.model.trim(),
    tools: normalizeList(parsed.tools),
    examples: parsed.examples.map((example) => ({
      context: example.context.trim(),
      user: example.user.trim(),
      assistant_approach: example.assistant_approach.trim(),
      commentary: example.commentary.trim(),
    })),
    system_prompt: {
      role: parsed.system_prompt.role.trim(),
      core_responsibilities: normalizeList(parsed.system_prompt.core_responsibilities),
      process_steps: normalizeList(parsed.system_prompt.process_steps),
      output_format: normalizeList(parsed.system_prompt.output_format),
    },
    constraints: normalizeList(parsed.constraints),
    handoff_rules: normalizeList(parsed.handoff_rules),
    tags: normalizeList(parsed.tags).sort((a, b) => a.localeCompare(b)),
  };
}

export function compileAgentMarkdown(input: AgentSpec): string {
  const spec = normalizeAgentSpec(input);
  const frontmatter = [
    "---",
    `name: ${yamlScalar(spec.name)}`,
    `title: ${yamlScalar(spec.title ?? titleFromSlug(spec.name))}`,
    `domain: ${yamlScalar(spec.domain)}`,
    ...yamlBlock("description", spec.description),
    `model: ${yamlScalar(spec.model)}`,
    `color: ${spec.color}`,
    "tools:",
    ...spec.tools.map((tool) => `  - ${yamlScalar(tool)}`),
    ...(spec.tags.length
      ? ["tags:", ...spec.tags.map((tag) => `  - ${yamlScalar(tag)}`)]
      : []),
    "---",
  ];

  const sections = [
    `You are the **${spec.title ?? titleFromSlug(spec.name)}**.`,
    "",
    spec.system_prompt.role,
    "",
    "## Core Responsibilities",
    renderNumbered(spec.system_prompt.core_responsibilities),
    "",
    "## Process Steps",
    renderNumbered(spec.system_prompt.process_steps),
    "",
    "## Output Format",
    renderBulleted(spec.system_prompt.output_format),
  ];

  if (spec.examples.length > 0) {
    sections.push("", "## Activation Examples", spec.examples.map(renderExample).join("\n\n"));
  }

  if (spec.constraints.length > 0) {
    sections.push("", "## Constraints", renderBulleted(spec.constraints));
  }

  if (spec.handoff_rules.length > 0) {
    sections.push("", "## Handoff Rules", renderBulleted(spec.handoff_rules));
  }

  return [...frontmatter, "", ...sections].join("\n").trimEnd() + "\n";
}

export function compileAgentArtifactPath(input: AgentSpec): string {
  const spec = normalizeAgentSpec(input);
  return `agents/generated/${spec.name}.md`;
}
