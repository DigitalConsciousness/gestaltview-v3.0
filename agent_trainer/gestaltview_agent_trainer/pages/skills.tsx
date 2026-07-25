import { SkillsManager } from "../components/SkillsManager";
import { PageShell, Surface, Tag } from "../components/kitPrimitives";

export default function SkillsPage() {
  return (
    <PageShell
      eyebrow="Skills"
      title="Define useful behavior without leaking the core"
      description="Skills should package domain behavior in a buyer-safe way and leave protected orchestration behind the curtain."
      spotlight={
        <Surface
          eyebrow="Focus"
          title="Behavior tracks"
          description="Teach the assistant what kinds of work matter most."
          accent="night"
        >
          <Tag tone="accent">Ship-safe</Tag>
        </Surface>
      }
    >
      <SkillsManager tier="STUDIO" />
    </PageShell>
  );
}
