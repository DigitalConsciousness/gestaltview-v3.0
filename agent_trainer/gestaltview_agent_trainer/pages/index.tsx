import { AssistantChat } from "../components/AssistantChat";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { CliWorkbench } from "../components/CliWorkbench";
import { CorpusOperationsPanel } from "../components/CorpusOperationsPanel";
import { PackActivationFlow } from "../components/PackActivationFlow";
import {
  MetricTile,
  PageShell,
  ProgressTrack,
  Surface,
  Tag,
  autoGridStyle,
  compactGridStyle,
  glassCardStyle,
  sectionGridStyle,
  subtleTextStyle
} from "../components/kitPrimitives";
import { ImportBoundaryPanel } from "../components/ImportBoundaryPanel";
import { KnowledgeUploader } from "../components/KnowledgeUploader";
import { MemoryViewer } from "../components/MemoryViewer";
import { OnboardingFlow } from "../components/OnboardingFlow";
import { PackLibrary } from "../components/PackLibrary";
import { PLKWizard } from "../components/PLKWizard";
import { SkillsManager } from "../components/SkillsManager";
import { SourceBundleStudio } from "../components/SourceBundleStudio";
import { VoiceIntegrationPanel } from "../components/VoiceIntegrationPanel";
import {
  corpusTargets,
  nextBuildActions,
  trainerMetrics
} from "../config/trainerBlueprint";
import { getTierDefinition, type KitTierName } from "../config/tiers";

const tier: KitTierName = "STUDIO";

export default function IndexPage() {
  const tierDefinition = getTierDefinition(tier);

  return (
    <PageShell
      eyebrow="GestaltView Agent Trainer"
      title="Train an AI on your world, not ours."
      description={`${tierDefinition.label} tier command center for shaping a buyer-owned assistant across knowledge, code, product, and context. The trainer is the product center. The assistant surface is proof that the training worked.`}
      spotlight={
        <Surface
          eyebrow="System Posture"
          title="Operator-ready package"
          description="This shell is built to feel like a serious operating studio rather than a generic chatbot dashboard."
          accent="night"
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Tag tone="accent">{tierDefinition.label}</Tag>
            <Tag tone="soft">{tierDefinition.seats} seats</Tag>
            <Tag tone="warm">{tierDefinition.fragmentLimit} fragments</Tag>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {corpusTargets.map((target) => (
              <ProgressTrack
                key={target.lane}
                label={target.shortLabel}
                value={target.readinessPercent}
                tone={target.lane === "product" ? "warm" : "accent"}
              />
            ))}
          </div>
        </Surface>
      }
    >
      <div style={sectionGridStyle}>
        <div style={autoGridStyle}>
          {trainerMetrics.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
            />
          ))}
        </div>

        <div style={compactGridStyle}>
          <Surface
            eyebrow="Trainer Thesis"
            title="The trainer is the product"
            description="The commercial value is not in a static dashboard. It is in the buyer's ability to shape a system around their own corpus and then improve it over time."
          >
            <p style={subtleTextStyle}>
              Each lane should make the assistant more grounded, more aligned,
              and more legible to the operator.
            </p>
          </Surface>

          <Surface
            eyebrow="Next Leverage"
            title="Immediate moves"
            description="The home surface should always show the operator what to do next."
            accent="warm"
          >
            <div style={{ display: "grid", gap: 12 }}>
              {nextBuildActions.map((action) => (
                <div key={action} style={{ ...glassCardStyle, padding: 14 }}>
                  {action}
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <AssistantChat tier={tier} kitName="My AI Assistant" />
        <VoiceIntegrationPanel tier={tier} />
        <KnowledgeUploader tier={tier} />

        <div style={compactGridStyle}>
          <CorpusOperationsPanel tier={tier} />
          <ImportBoundaryPanel tier={tier} />
        </div>

        <PackActivationFlow tier={tier} />

        <div style={compactGridStyle}>
          <PackLibrary tier={tier} />
          <CliWorkbench tier={tier} />
        </div>

        <div style={compactGridStyle}>
          <SourceBundleStudio tier={tier} />
          <AnalyticsDashboard tier={tier} />
        </div>

        <div style={compactGridStyle}>
          <SkillsManager tier={tier} />
          <PLKWizard tier={tier} />
          <MemoryViewer tier={tier} />
        </div>

        <OnboardingFlow tier={tier} />
      </div>
    </PageShell>
  );
}
