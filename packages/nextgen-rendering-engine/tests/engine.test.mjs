import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GestaltRenderEngine, validateSceneGraph } from '../dist/index.js';

const graph = JSON.parse(await readFile(new URL('../examples/mixed-content.scene.json', import.meta.url), 'utf8'));

test('validates the mixed-content GestaltView scene graph', () => {
  assert.deepEqual(validateSceneGraph(graph), []);
});

test('renders through the orchestration engine and emits artifacts', async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), 'gestalt-render-'));
  const engine = new GestaltRenderEngine();
  const rendered = await engine.render({ jobId: 'test-render', graph, outputDirectory });
  assert.equal(rendered.ok, true);
  assert.ok(rendered.artifacts.length >= 5);
  assert.ok(rendered.manifest.backendCount >= 4);
});
