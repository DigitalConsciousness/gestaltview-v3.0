import { CorpusOperationsPanel } from "../components/CorpusOperationsPanel";
import { ImportBoundaryPanel } from "../components/ImportBoundaryPanel";
import { KnowledgeUploader } from "../components/KnowledgeUploader";
import {
  PageShell,
  Surface,
  Tag,
  compactGridStyle,
  sectionGridStyle
} from "../components/kitPrimitives";

export default function KnowledgePage() {
  return (
    <PageShell
      eyebrow="Corpus Manager"
      title="Shape what the assistant knows"
      description="The corpus manager should make uploads, lane assignment, and quality tracing obvious to the operator."
      spotlight={
        <Surface
          eyebrow="Focus"
          title="Curate, do not dump"
          description="Strong retrieval starts with a clean corpus."
          accent="night"
        >
          <Tag tone="warm">Four-lane model</Tag>
        </Surface>
      }
    >
      <div style={sectionGridStyle}>
        <KnowledgeUploader tier="STUDIO" />
        <div style={compactGridStyle}>
          <CorpusOperationsPanel tier="STUDIO" />
          <ImportBoundaryPanel tier="STUDIO" />
        </div>
      </div>
    </PageShell>
  );
}
