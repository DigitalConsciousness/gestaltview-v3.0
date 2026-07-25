import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { PageShell, Surface, Tag } from "../components/kitPrimitives";

export default function AnalyticsPage() {
  return (
    <PageShell
      eyebrow="Analytics"
      title="Find the weak points before buyers do"
      description="The analytics surface should help the operator see what users ask, where the assistant hesitates, and which lane needs the next upload."
      spotlight={
        <Surface
          eyebrow="Focus"
          title="Weak-answer tracing"
          description="Analytics are only useful when they point back to action."
          accent="night"
        >
          <Tag tone="accent">Operator signal</Tag>
        </Surface>
      }
    >
      <AnalyticsDashboard tier="STUDIO" />
    </PageShell>
  );
}
