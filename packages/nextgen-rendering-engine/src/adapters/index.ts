/**
 * POWERHOUSE BARREL EXPORT
 *
 * Exports all powerhouse backends and utilities for easy import.
 */

import { PowerhouseAgentStudioBackend } from './powerhouse-agent-studio.js';
import { PowerhouseAppBackend } from './powerhouse-app.js';
import { PowerhouseAudioBackend } from './powerhouse-audio.js';
import { PowerhouseBrandBackend } from './powerhouse-brand.js';
import { PowerhouseCanvasBackend } from './powerhouse-canvas.js';
import { PowerhouseChartBackend } from './powerhouse-chart.js';
import { PowerhouseComponentBackend } from './powerhouse-component.js';
import { PowerhouseDocumentBackend } from './powerhouse-document.js';
import { PowerhouseImageBackend } from './powerhouse-image.js';
import { PowerhouseMindmapBackend } from './powerhouse-mindmap.js';
import { PowerhousePitchBackend } from './powerhouse-pitch.js';
import { PowerhousePromptBackend } from './powerhouse-prompt.js';
import { PowerhouseSlideBackend } from './powerhouse-slide.js';
import { PowerhouseStorybookBackend } from './powerhouse-storybook.js';
import { PowerhouseTableBackend } from './powerhouse-table.js';
import { PowerhouseVideoBackend } from './powerhouse-video.js';
import { PowerhouseWikiBackend } from './powerhouse-wiki.js';

// Core types
export * from '../core/types-powerhouse.js';

// Validation
export { validatePowerhouseSceneGraph, buildPowerhouseSceneGraph } from '../core/validation-powerhouse.js';

// Base backend
export { PowerhouseBaseBackend } from './powerhouse-base.js';

// Orchestrator
export { PowerhouseOrchestrator, createPowerhouseRenderJob } from './powerhouse-orchestrator.js';
export type { PowerhouseOrchestratorConfig, PowerhouseOrchestratorResponse } from './powerhouse-orchestrator.js';

// Concrete backends
export { PowerhouseDocumentBackend } from './powerhouse-document.js';
export { PowerhouseChartBackend } from './powerhouse-chart.js';
export { PowerhouseMindmapBackend } from './powerhouse-mindmap.js';
export { PowerhouseSlideBackend } from './powerhouse-slide.js';
export { PowerhouseTableBackend } from './powerhouse-table.js';
export { PowerhouseImageBackend } from './powerhouse-image.js';
export { PowerhouseWikiBackend } from './powerhouse-wiki.js';
export { PowerhouseAppBackend } from './powerhouse-app.js';
export { PowerhouseCanvasBackend } from './powerhouse-canvas.js';
export { PowerhouseVideoBackend } from './powerhouse-video.js';
export { PowerhouseAudioBackend } from './powerhouse-audio.js';
export { PowerhouseComponentBackend } from './powerhouse-component.js';
export { PowerhouseAgentStudioBackend } from './powerhouse-agent-studio.js';
export { PowerhouseStorybookBackend } from './powerhouse-storybook.js';
export { PowerhousePitchBackend } from './powerhouse-pitch.js';
export { PowerhouseBrandBackend } from './powerhouse-brand.js';
export { PowerhousePromptBackend } from './powerhouse-prompt.js';

// Factory function to create all backends
export function createAllPowerhouseBackends() {
  return [
    new PowerhouseDocumentBackend(),
    new PowerhouseChartBackend(),
    new PowerhouseMindmapBackend(),
    new PowerhouseSlideBackend(),
    new PowerhouseTableBackend(),
    new PowerhouseImageBackend(),
    new PowerhouseWikiBackend(),
    new PowerhouseAppBackend(),
    new PowerhouseCanvasBackend(),
    new PowerhouseVideoBackend(),
    new PowerhouseAudioBackend(),
    new PowerhouseComponentBackend(),
    new PowerhouseAgentStudioBackend(),
    new PowerhouseStorybookBackend(),
    new PowerhousePitchBackend(),
    new PowerhouseBrandBackend(),
    new PowerhousePromptBackend(),
  ];
}
