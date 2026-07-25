import { getOnboardingTasksForSegment, type OnboardingTaskDefinition } from "../api/onboarding";
import { getSegmentForTier } from "../config/segments";
import type { KitTierName } from "../config/tiers";
import {
  corpusContainerBlueprint,
  corpusReviewChecklist,
  guidedWorkflowGuardrails
} from "../config/trainerBlueprint";
import {
  Surface,
  Tag,
  autoGridStyle,
  codeChipStyle,
  glassCardStrongStyle,
  glassCardStyle,
  glassNightCardStyle,
  kitFonts,
  subtleTextStyle
} from "./kitPrimitives";

interface OnboardingFlowProps {
  tier: KitTierName;
}

const taskGuidance: Record<
  string,
  {
    operatorAction: string;
    doneWhen: string;
    whyItMatters: string;
  }
> = {
  create_workspace: {
    operatorAction: "Name the workspace and the first agent so the system can anchor every later artifact to something concrete.",
    doneWhen: "You can point to the workspace, the first agent, and who owns the setup.",
    whyItMatters: "This step removes ambiguity about what is being built before settings and imports begin."
  },
  stage_corpus_container: {
    operatorAction: "Point to the GitHub repo and generate the container with incoming, staged, review, and manifest folders.",
    doneWhen: "A repo-specific scaffold exists and the operator has a visible place to drop repo exports and buyer docs.",
    whyItMatters: "This is the moment the messy pile of files becomes an organized knowledge workspace."
  },
  connect_supabase: {
    operatorAction: "Add the project URL and keys, then verify the target storage is ready for live corpus writes.",
    doneWhen: "The operator knows the runtime can write safely once the first dry run is approved.",
    whyItMatters: "The storage layer should never be the surprise discovered after a successful dry import."
  },
  connect_provider: {
    operatorAction: "Choose the provider chain that will power guided setup, evaluations, and later assistant behavior.",
    doneWhen: "At least one model is available and the operator knows which runtime is active.",
    whyItMatters: "A guided setup needs a working model before it can coach the user through source review."
  },
  review_sources: {
    operatorAction: "Sort sources into knowledge, code, product, or context, then approve a small first batch.",
    doneWhen: "There is a reviewed source count, a batch plan, and no oversized surprises waiting in the queue.",
    whyItMatters: "This step prevents the entire repo from being pushed into the vector store without inspection."
  },
  import_corpus: {
    operatorAction: "Import only the reviewed first batch and capture what landed in each lane.",
    doneWhen: "The operator has a manifest-backed first ingest with lane coverage and follow-up work clearly visible.",
    whyItMatters: "A small successful import teaches the workflow better than a giant failed one."
  },
  choose_lane_focus: {
    operatorAction: "Choose the lane that should become production-ready first based on current signal strength.",
    doneWhen: "The next best upload or fix is obvious instead of buried in a dashboard.",
    whyItMatters: "This turns a broad corpus project into a single sensible next milestone."
  },
  select_theme: {
    operatorAction: "Polish the interface only after the corpus path feels stable enough to demo confidently.",
    doneWhen: "The setup feels owned and legible without distracting from ingestion or readiness work.",
    whyItMatters: "Visual polish should support confidence, not compete with the technical setup."
  },
  run_evals: {
    operatorAction: "Run benchmark prompts and measure readiness before any publish motion begins.",
    doneWhen: "The operator can see whether the assistant is genuinely ready or still weak in a lane.",
    whyItMatters: "This is the guardrail that keeps momentum from turning into premature launch."
  },
  configure_governance: {
    operatorAction: "Capture policy, retention, and audit rules for governed rollouts.",
    doneWhen: "Security and compliance expectations are stated before launch artifacts move downstream.",
    whyItMatters: "Enterprise setups fail when governance is treated as an afterthought."
  },
  publish_agent: {
    operatorAction: "Choose the go-live target only after readiness clears the threshold.",
    doneWhen: "The handoff or publish summary explains what is live, why it is ready, and what still needs care.",
    whyItMatters: "The last step should feel deliberate, not like the operator clicked through a wizard."
  }
};

function getStepStatusLabel(index: number): { label: string; tone: "accent" | "soft" | "warm" } {
  if (index === 0) {
    return { label: "Current", tone: "accent" };
  }

  if (index === 1) {
    return { label: "Next", tone: "warm" };
  }

  return { label: "Queued", tone: "soft" };
}

function getGuidance(task: OnboardingTaskDefinition) {
  return (
    taskGuidance[task.task_id] ?? {
      operatorAction: "Complete the step with the smallest useful input set.",
      doneWhen: "The operator knows what changed and what comes next.",
      whyItMatters: task.description
    }
  );
}

export function OnboardingFlow({ tier }: OnboardingFlowProps) {
  const recommendedSegment = getSegmentForTier(tier);
  const guidedTasks = getOnboardingTasksForSegment(recommendedSegment).filter(
    (task) => task.task_id !== "recommend_segment"
  );
  const currentTask = guidedTasks[0]!;
  const nextTask = guidedTasks[1] ?? null;
  const containerPreview = [
    ".gsvw/repo-corpus/acme-repo/",
    "  incoming/github/",
    "  incoming/files/",
    "  staged/knowledge/",
    "  staged/code/",
    "  staged/product/",
    "  staged/context/",
    "  review/seed-plan.md",
    "  manifests/import-manifest.template.json"
  ].join("\n");

  return (
    <Surface
      eyebrow="Guided Setup"
      title="One clear onboarding step at a time"
      description={`Current tier: ${tier}. This flow keeps the buyer on a single visible path: create the workspace, stage the repo corpus container, review a small batch, then import with confidence.`}
      accent="warm"
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Tag tone="accent">{recommendedSegment}</Tag>
        <Tag tone="soft">Web + CLI stay in sync</Tag>
        <Tag tone="warm">Dry-run first</Tag>
      </div>

      <div
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, 0.8fr)"
        }}
      >
        <div style={{ ...glassCardStrongStyle, gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Tag tone="accent">Current step</Tag>
            {nextTask ? <Tag tone="warm">Next: {nextTask.title}</Tag> : null}
          </div>
          <strong style={{ fontSize: "1.18rem" }}>{currentTask.title}</strong>
          <p style={subtleTextStyle}>{getGuidance(currentTask).operatorAction}</p>
          <div style={autoGridStyle}>
            <div style={glassCardStyle}>
              <span style={{ fontWeight: 700 }}>Why it matters</span>
              <p style={subtleTextStyle}>{getGuidance(currentTask).whyItMatters}</p>
            </div>
            <div style={glassCardStyle}>
              <span style={{ fontWeight: 700 }}>Done when</span>
              <p style={subtleTextStyle}>{getGuidance(currentTask).doneWhen}</p>
            </div>
          </div>
        </div>

        <div style={{ ...glassNightCardStyle, gap: 14 }}>
          <Tag tone="warm">Repo corpus container</Tag>
          <p style={{ ...subtleTextStyle, color: "rgba(239,250,247,0.82)" }}>
            The setup now creates a visible staging area for repo exports and buyer-owned corpus files before any import runs.
          </p>
          <code
            style={{
              ...codeChipStyle,
              whiteSpace: "pre-wrap",
              lineHeight: 1.7
            }}
          >
            {containerPreview}
          </code>
          <p style={{ ...subtleTextStyle, color: "rgba(239,250,247,0.82)" }}>
            CLI path: <code style={{ fontFamily: kitFonts.mono }}>./gv.sh repo stage owner/repo</code>
          </p>
        </div>
      </div>

      <div style={autoGridStyle}>
        {guidedWorkflowGuardrails.map((guardrail) => (
          <div key={guardrail} style={glassCardStyle}>
            <Tag tone="soft">Guardrail</Tag>
            <p style={subtleTextStyle}>{guardrail}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {guidedTasks.map((task, index) => {
          const status = getStepStatusLabel(index);
          const guidance = getGuidance(task);

          return (
            <div key={task.task_id} style={{ ...glassCardStyle, gap: 14 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Tag tone={status.tone}>{status.label}</Tag>
                <Tag tone="soft">Step {index + 1}</Tag>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <strong style={{ fontSize: "1.08rem" }}>{task.title}</strong>
                <p style={subtleTextStyle}>{task.description}</p>
              </div>
              <div style={autoGridStyle}>
                <div style={glassCardStyle}>
                  <span style={{ fontWeight: 700 }}>Operator does</span>
                  <p style={subtleTextStyle}>{guidance.operatorAction}</p>
                </div>
                <div style={glassCardStyle}>
                  <span style={{ fontWeight: 700 }}>Done when</span>
                  <p style={subtleTextStyle}>{guidance.doneWhen}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={autoGridStyle}>
        <div style={glassCardStyle}>
          <Tag tone="accent">Source review checklist</Tag>
          <div style={{ display: "grid", gap: 8 }}>
            {corpusReviewChecklist.map((item) => (
              <span key={item} style={subtleTextStyle}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div style={glassCardStyle}>
          <Tag tone="warm">Container zones</Tag>
          <div style={{ display: "grid", gap: 8 }}>
            {corpusContainerBlueprint.slice(0, 4).map((zone) => (
              <div key={zone.path} style={{ display: "grid", gap: 4 }}>
                <strong>{zone.label}</strong>
                <span style={subtleTextStyle}>
                  <code style={{ fontFamily: kitFonts.mono }}>{zone.path}</code> {zone.summary}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Surface>
  );
}
