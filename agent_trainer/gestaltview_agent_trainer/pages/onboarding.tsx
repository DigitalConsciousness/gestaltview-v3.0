import { CorpusOperationsPanel } from "../components/CorpusOperationsPanel";
import { KnowledgeUploader } from "../components/KnowledgeUploader";
import { OnboardingFlow } from "../components/OnboardingFlow";
import { PageShell, Surface, Tag } from "../components/kitPrimitives";

export default function OnboardingPage() {
  return (
    <PageShell
      eyebrow="Onboarding"
      title="Guide the builder instead of testing them"
      description="The onboarding and setup wizard now lead with one current step, one visible repo-corpus container, and one clear next action so founders are not left guessing how to start."
      spotlight={
        <Surface
          eyebrow="Focus"
          title="Repo-aware setup"
          description="Create the workspace, stage the GitHub repo corpus, review a small first batch, then import with confidence."
          accent="night"
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Tag tone="warm">Repo container first</Tag>
            <Tag tone="soft">Dry-run by default</Tag>
          </div>
        </Surface>
      }
    >
      <OnboardingFlow tier="STUDIO" />
      <KnowledgeUploader tier="STUDIO" />
      <CorpusOperationsPanel tier="STUDIO" />
    </PageShell>
  );
}
