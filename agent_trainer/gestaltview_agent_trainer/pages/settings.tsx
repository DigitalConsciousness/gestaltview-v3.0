import { PLKWizard } from "../components/PLKWizard";
import { ThemeStudio } from "../components/ThemeStudio";
import { VoiceIntegrationPanel } from "../components/VoiceIntegrationPanel";
import {
  PageShell,
  Surface,
  Tag,
  compactGridStyle
} from "../components/kitPrimitives";

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Vocabulary"
      title="Shape voice, terms, and boundaries"
      description="The settings layer should let the buyer align the assistant to their language and working style without exposing proprietary language systems."
      spotlight={
        <Surface
          eyebrow="Focus"
          title="Alignment layer"
          description="This is where the system stops sounding generic."
          accent="night"
        >
          <Tag tone="accent">Operator voice</Tag>
        </Surface>
      }
    >
      <div style={compactGridStyle}>
        <ThemeStudio tier="STUDIO" />
        <PLKWizard tier="STUDIO" />
        <VoiceIntegrationPanel tier="STUDIO" />
      </div>
    </PageShell>
  );
}
