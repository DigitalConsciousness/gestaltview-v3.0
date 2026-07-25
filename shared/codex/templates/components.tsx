import type { ReactNode } from "react";

import type { CodexArtifact } from "../contracts.js";

export function ArtifactHeroTitle({ artifact }: { artifact: CodexArtifact }): ReactNode {
  return <h1>{artifact.title}</h1>;
}

export function LeadParagraph({ children }: { children: string }): ReactNode {
  return <p>{children}</p>;
}

export function ArtifactManifestPanel({ artifact }: { artifact: CodexArtifact }): ReactNode {
  return (
    <dl>
      {artifact.exports.map((item) => (
        <div key={item.format}>
          <dt>{item.format}</dt>
          <dd>{item.status}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProvenanceDrawer({ artifact }: { artifact: CodexArtifact }): ReactNode {
  return (
    <details>
      <summary>Provenance</summary>
      <ol>
        {artifact.provenance.map((edge) => (
          <li key={`${edge.sourceType}:${edge.sourceId}:${edge.hash}`}>
            {edge.sourceType}:{edge.sourceId} via {edge.transform}
          </li>
        ))}
      </ol>
    </details>
  );
}
