// ─── Replace the top of client/src/components/DiligenceExplorer/index.tsx ───
// Add this import at the top of the existing imports:
import ContinuumTimeline3D from '../ContinuumTimeline3D';

// ─── Change the MainTab type to include 'loom': ───────────────────────────────
type MainTab = 'claims' | 'timeline' | 'loom' | 'record';

// ─── Update tabLabels: ───────────────────────────────────────────────────────
const tabLabels: Record<MainTab, string> = {
  claims:   'Claim Wall',
  timeline: 'Timeline',
  loom:     '3D Loom',
  record:   'Audit Record',
};

// ─── Add inside the rendered tab panels block (after the timeline panel): ────
{tab === 'loom' && (
  <div role="tabpanel" aria-labelledby="tab-loom" id="panel-loom">
    <ContinuumTimeline3D />
  </div>
)}
