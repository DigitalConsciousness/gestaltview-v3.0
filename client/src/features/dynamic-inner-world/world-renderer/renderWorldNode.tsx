import type { WorldNode, WorldRenderContext } from "./types";
import { ArchiveVault } from "./components/ArchiveVault";
import { ArtifactConstellation } from "./components/ArtifactConstellation";
import { CuratorConsole } from "./components/CuratorConsole";
import { EmptyHallState } from "./components/EmptyHallState";
import { ExhibitPod } from "./components/ExhibitPod";
import { ResonanceRail } from "./components/ResonanceRail";
import { SearchControlDeck } from "./components/SearchControlDeck";
import { WorldAtrium } from "./components/WorldAtrium";
import { WorldStatsRibbon } from "./components/WorldStatsRibbon";

export function renderWorldNode(node: WorldNode, context: WorldRenderContext) {
  switch (node.kind) {
    case "world-atrium":
      return <WorldAtrium key={node.id} node={node} context={context} />;
    case "artifact-pod":
      return <ExhibitPod key={node.id} node={node} context={context} />;
    case "artifact-constellation":
      return <ArtifactConstellation key={node.id} node={node} context={context} />;
    case "resonance-rail":
      return <ResonanceRail key={node.id} node={node} context={context} />;
    case "curator-console":
      return <CuratorConsole key={node.id} node={node} context={context} />;
    case "archive-vault":
      return <ArchiveVault key={node.id} node={node} context={context} />;
    case "search-control-deck":
      return <SearchControlDeck key={node.id} node={node} context={context} />;
    case "empty-hall-state":
      return <EmptyHallState key={node.id} node={node} context={context} />;
    case "world-stats-ribbon":
      return <WorldStatsRibbon key={node.id} node={node} context={context} />;
    default:
      return null;
  }
}
