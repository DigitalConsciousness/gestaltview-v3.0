#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { GestaltRenderEngine } from '../adapters/orchestration.js';
import type { RenderJob, SceneGraph } from '../core/types.js';

const [, , command, ...args] = process.argv;
const engine = new GestaltRenderEngine();

if (command === 'inspect') {
  console.log(JSON.stringify({ engine: '@gestaltview/nextgen-rendering-engine', capabilities: engine.capabilities() }, null, 2));
} else if (command === 'render') {
  const graphPath = args[0];
  if (!graphPath) throw new Error('Usage: gestalt-render render <scene-graph.json> [outputDirectory]');
  const graph = JSON.parse(await readFile(graphPath, 'utf8')) as SceneGraph;
  const job: RenderJob = { jobId: graph.graphId, graph, outputDirectory: args[1] };
  const rendered = await engine.render(job);
  console.log(JSON.stringify(rendered, null, 2));
  process.exitCode = rendered.ok ? 0 : 1;
} else {
  console.log('Usage: gestalt-render <inspect|render> [args]');
}
