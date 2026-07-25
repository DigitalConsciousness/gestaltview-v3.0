import React from 'react';
import GestaltRenderSurface from './GestaltRenderSurface';
import { mixedContentSceneGraph } from '../../lib/rendering/sampleScenes';

export function NextGenRenderDemo() {
  return <GestaltRenderSurface graph={mixedContentSceneGraph} />;
}

export default NextGenRenderDemo;
