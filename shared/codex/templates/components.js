// Compiled companion for components.tsx
// Node ESM resolves ./components.js at runtime; this is the runtime target.

export function ArtifactHeroTitle({ artifact }) {
  return { type: "h1", props: {}, children: [artifact.title] };
}

export function LeadParagraph({ children }) {
  return { type: "p", props: {}, children: [children] };
}

export function ArtifactManifestPanel({ artifact }) {
  return {
    type: "dl",
    props: {},
    children: artifact.exports.map((item) => ({
      type: "div",
      props: { key: item.format },
      children: [
        { type: "dt", props: {}, children: [item.format] },
        { type: "dd", props: {}, children: [item.status] },
      ],
    })),
  };
}

export function ProvenanceDrawer({ artifact }) {
  return {
    type: "details",
    props: {},
    children: [
      { type: "summary", props: {}, children: ["Provenance"] },
      {
        type: "ol",
        props: {},
        children: artifact.provenance.map((edge) => ({
          type: "li",
          props: { key: `${edge.sourceType}:${edge.sourceId}:${edge.hash}` },
          children: [`${edge.sourceType}:${edge.sourceId} via ${edge.transform}`],
        })),
      },
    ],
  };
}
