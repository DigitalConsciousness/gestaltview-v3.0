import type { GestaltSceneGraph, GestaltSceneNode } from "./sceneGraph";

type ArtifactLike = {
  id?: string;
  title?: string;
  name?: string;
  type?: string;
  format?: string;
  content?: unknown;
  data?: unknown;
  markdown?: string;
  html?: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export type ArtifactViewModel =
  | {
      id: string;
      title: string;
      kind: "json_scene_graph";
      sceneGraph: Record<string, unknown>;
    }
  | {
      id: string;
      title: string;
      kind: "html" | "markdown" | "raw";
      content: unknown;
    };

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48) || "artifact";

export function artifactViewModelFromArtifact(artifact: ArtifactLike): ArtifactViewModel {
  const label = artifact.title ?? artifact.name ?? artifact.id ?? "artifact";
  const format = String(artifact.format ?? artifact.type ?? "").toLowerCase();
  const data = artifact.data ?? artifact.content;

  if (
    format.includes("json") &&
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    (data as Record<string, unknown>).schema === "nextgen.scene-graph.v1"
  ) {
    return {
      id: String(artifact.id ?? "artifact"),
      title: label,
      kind: "json_scene_graph",
      sceneGraph: data as Record<string, unknown>,
    };
  }

  if (typeof artifact.html === "string" && artifact.html.trim().startsWith("<")) {
    return {
      id: String(artifact.id ?? "artifact"),
      title: label,
      kind: "html",
      content: artifact.html,
    };
  }

  if (typeof artifact.markdown === "string" || typeof artifact.source === "string") {
    return {
      id: String(artifact.id ?? "artifact"),
      title: label,
      kind: "markdown",
      content: artifact.markdown ?? artifact.source ?? "",
    };
  }

  return {
    id: String(artifact.id ?? "artifact"),
    title: label,
    kind: "raw",
    content: data,
  };
}

export function artifactsToSceneGraph(artifacts: ArtifactLike[], graphId = "gestaltview_artifact_scene"): GestaltSceneGraph {
  const nodes: GestaltSceneNode[] = [
    { id: "export_main", type: "ExportRequest", name: "GestaltView artifact export", props: { roots: ["doc_main"], targets: [{ format: "html", uri: `out/${graphId}.html` }, { format: "json", uri: `out/${graphId}.json` }] } },
    { id: "doc_main", type: "Document", name: "GestaltView artifact packet", props: { format: "interactive-report", title: graphId } },
  ];

  const edges = [{ id: "edge_export_doc", type: "contains" as const, from: "export_main", to: "doc_main", props: { order: 0 } }];

  artifacts.forEach((artifact, index) => {
    const format = String(artifact.format ?? artifact.type ?? "").toLowerCase();
    const base = slug(String(artifact.id ?? artifact.title ?? artifact.name ?? `artifact_${index + 1}`));
    const id = `${base}_${index + 1}`;
    const label = artifact.title ?? artifact.name ?? `Artifact ${index + 1}`;
    let node: GestaltSceneNode;

    if (format.includes("diagram") || format.includes("mermaid")) {
      node = { id, type: "Diagram", name: label, props: { diagramType: "mermaid", source: String(artifact.source ?? artifact.content ?? artifact.data ?? "") }, metadata: artifact.metadata };
    } else if (format.includes("chart")) {
      node = { id, type: "Chart", name: label, props: { chartType: "bar", data: artifact.data ?? artifact.content ?? {} }, metadata: artifact.metadata };
    } else if (format.includes("html") || artifact.html) {
      node = { id, type: "DOMSnapshot", name: label, props: { html: String(artifact.html ?? artifact.content ?? "") }, metadata: artifact.metadata };
    } else {
      node = { id, type: "Markdown", name: label, props: { source: String(artifact.markdown ?? artifact.source ?? artifact.content ?? artifact.data ?? "") }, metadata: artifact.metadata };
    }

    nodes.push(node);
    edges.push({ id: `edge_doc_${id}`, type: "contains", from: "doc_main", to: id, props: { order: index + 1 } });
  });

  return { schema: "nextgen.scene-graph.v1", graphId, nodes, edges, metadata: { generatedBy: "artifactsToSceneGraph" } };
}
