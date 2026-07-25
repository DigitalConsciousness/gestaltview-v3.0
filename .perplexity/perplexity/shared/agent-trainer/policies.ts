import {
  AgentSpecSchema,
  PolicyFindingSchema,
  SafetyReviewSchema,
  type AgentSpec,
  type PolicyFinding,
  type SafetyReview,
} from "./schemas.js";

const PLACEHOLDER_PATTERNS = [
  /\{\{[^}]+\}\}/g,
  /\[\[[^\]]+\]\]/g,
  /\bTODO\b/gi,
  /\bTBD\b/gi,
  /\blorem ipsum\b/gi,
];

const AUTHORITY_PATTERNS = [
  /full (?:database|db) access/gi,
  /deploy(?:s|ed)? directly to production/gi,
  /unrestricted tool/gi,
  /arbitrary code execution/gi,
  /admin over any system/gi,
];

const AUTHORITY_NEGATION_PREFIX = /\b(?:do not|don't|never|avoid|must not|should not|cannot|can't|without)\b/i;

const BANNED_PROVIDER_PATTERNS = [
  /\banthropic\b/gi,
  /\bclaude\b/gi,
];

function finding(f: PolicyFinding): PolicyFinding {
  return PolicyFindingSchema.parse(f);
}

function scanText(text: string, code: string, message: string, patterns: RegExp[]): PolicyFinding[] {
  return patterns.some((pattern) => pattern.test(text))
    ? [finding({ severity: "error", code, message })]
    : [];
}

function scanAuthorityText(text: string): PolicyFinding[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    for (const pattern of AUTHORITY_PATTERNS) {
      const matcher = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null = null;

      while ((match = matcher.exec(line)) !== null) {
        const prefix = line.slice(Math.max(0, match.index - 96), match.index);
        if (AUTHORITY_NEGATION_PREFIX.test(prefix)) {
          continue;
        }

        return [
          finding({
            severity: "error",
            code: "authority.overreach",
            message: "Spec claims unsafe authority or unrestricted capabilities.",
          }),
        ];
      }
    }
  }

  return [];
}

function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function lintAgentSpec(input: AgentSpec): PolicyFinding[] {
  const issues: PolicyFinding[] = [];
  const parsed = AgentSpecSchema.safeParse(input);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push(
        finding({
          severity: "error",
          code: "schema.invalid",
          message: `${issue.path.join(".") || "spec"}: ${issue.message}`,
        })
      );
    }
    return issues;
  }

  const spec = parsed.data;
  const combinedText = [
    spec.description,
    spec.system_prompt.role,
    ...spec.system_prompt.core_responsibilities,
    ...spec.system_prompt.process_steps,
    ...spec.system_prompt.output_format,
    ...spec.constraints,
    ...spec.handoff_rules,
    ...spec.examples.flatMap((example) => [
      example.context,
      example.user,
      example.assistant_approach,
      example.commentary,
    ]),
  ].join("\n");

  issues.push(
    ...scanText(
      combinedText,
      "placeholder.unresolved",
      "Spec contains unresolved placeholders or drafting markers.",
      PLACEHOLDER_PATTERNS
    )
  );

  issues.push(...scanAuthorityText(combinedText));

  issues.push(
    ...scanText(
      combinedText,
      "provider.banned_reference",
      "Spec references banned provider language for trainer-generated agents.",
      BANNED_PROVIDER_PATTERNS
    )
  );

  if (spec.examples.length === 0) {
    issues.push(
      finding({
        severity: "error",
        code: "examples.missing",
        message: "Agent must include at least one activation example.",
      })
    );
  }

  if (getWordCount(combinedText) > 2200) {
    issues.push(
      finding({
        severity: "warning",
        code: "budget.wordy",
        message: "Compiled agent is likely too long and may exceed the intended word budget.",
      })
    );
  }

  if (!spec.constraints.length) {
    issues.push(
      finding({
        severity: "warning",
        code: "constraints.missing",
        message: "Spec is missing explicit constraints.",
      })
    );
  }

  if (!spec.handoff_rules.length) {
    issues.push(
      finding({
        severity: "info",
        code: "handoff.missing",
        message: "Spec does not define handoff rules.",
      })
    );
  }

  return issues;
}

export function lintCompiledMarkdown(markdown: string): PolicyFinding[] {
  const issues: PolicyFinding[] = [];

  if (!markdown.startsWith("---\n")) {
    issues.push(
      finding({
        severity: "error",
        code: "markdown.frontmatter_missing",
        message: "Compiled markdown is missing YAML frontmatter.",
      })
    );
  }

  if (!markdown.includes("## Core Responsibilities")) {
    issues.push(
      finding({
        severity: "error",
        code: "markdown.section_missing",
        message: "Compiled markdown is missing the Core Responsibilities section.",
      })
    );
  }

  if (!markdown.includes("## Output Format")) {
    issues.push(
      finding({
        severity: "error",
        code: "markdown.output_missing",
        message: "Compiled markdown is missing the Output Format section.",
      })
    );
  }

  issues.push(
    ...scanText(
      markdown,
      "markdown.placeholder",
      "Compiled markdown still contains unresolved placeholders.",
      PLACEHOLDER_PATTERNS
    )
  );

  return issues;
}

export function runLocalSafetyReview(spec: AgentSpec, markdown: string): SafetyReview {
  const findings = [...lintAgentSpec(spec), ...lintCompiledMarkdown(markdown)];

  return SafetyReviewSchema.parse({
    passed: findings.every((issue) => issue.severity !== "error"),
    findings,
    rationale: findings.length
      ? "Deterministic policy lint found issues that need review."
      : "Deterministic policy lint passed.",
  });
}

export function hasBlockingFindings(findings: PolicyFinding[]): boolean {
  return findings.some((finding) => finding.severity === "error");
}
