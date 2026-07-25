import { MemoryViewer } from "../components/MemoryViewer";
import { PageShell, Surface, Tag } from "../components/kitPrimitives";

export default function MemoryPage() {
  return (
    <PageShell
      eyebrow="Memory"
      title="Preserve continuity without losing control"
      description="Memory should support operator continuity, not become an opaque dumping ground."
      spotlight={
        <Surface
          eyebrow="Focus"
          title="Bounded memory"
          description="Useful continuity only."
          accent="night"
        >
          <Tag tone="warm">Reviewable</Tag>
        </Surface>
      }
    >
      <MemoryViewer tier="STUDIO" />
    </PageShell>
  );
}
