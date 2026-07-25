import { AssistantChat } from "../components/AssistantChat";
import { VoiceIntegrationPanel } from "../components/VoiceIntegrationPanel";
import {
  PageShell,
  Surface,
  Tag,
  sectionGridStyle
} from "../components/kitPrimitives";

export default function AssistantPage() {
  return (
    <PageShell
      eyebrow="Assistant Surface"
      title="Proof that the training worked"
      description="This page is where the operator tests whether the assistant can synthesize the right corpus lanes under real pressure."
      spotlight={
        <Surface
          eyebrow="Focus"
          title="Validation mode"
          description="Use real prompts, not toy prompts."
          accent="night"
        >
          <Tag tone="accent">Grounded</Tag>
        </Surface>
      }
    >
      <div style={sectionGridStyle}>
        <AssistantChat tier="STUDIO" kitName="My AI Assistant" />
        <VoiceIntegrationPanel tier="STUDIO" />
      </div>
    </PageShell>
  );
}
