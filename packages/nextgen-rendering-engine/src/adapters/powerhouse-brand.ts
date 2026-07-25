/**
 * POWERHOUSE BRAND ASSETS BACKEND
 *
 * Renders brand artifacts: Logo, banner, digital business card, color palette.
 * Generates SVG-based brand assets with style variations.
 */

import type { RenderDiagnostic } from '../core/types.js';
import { result, writeTextArtifact } from '../core/artifacts.js';
import { PowerhouseBaseBackend } from './powerhouse-base.js';
import type {
  PowerhouseCapabilityManifest,
  PowerhouseRenderJob,
  PowerhouseRenderResult,
  TargetResult,
} from '../core/types-powerhouse.js';

interface BrandData {
  companyName: string;
  tagline?: string;
  logo?: {
    text?: string;
    icon?: string;
    style?: 'minimal' | 'bold' | 'elegant' | 'playful' | 'tech';
  };
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography?: {
    heading: string;
    body: string;
  };
  banner?: {
    width: number;
    height: number;
    text?: string;
  };
  businessCard?: {
    name: string;
    title: string;
    email?: string;
    phone?: string;
    website?: string;
  };
}

export class PowerhouseBrandBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-brand',
    kind: 'brand',
    displayName: 'Powerhouse Brand Assets Generator',
    artifactClasses: ['brand'],
    supportedNodeTypes: ['Brand'],
    supportedFormats: ['html', 'svg', 'png'],
    executionMode: 'in-process',
    sourceProjects: ['canvas-api'],
    strengths: ['SVG brand assets', 'Color palette', 'Business card', 'Banner'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const brandNodes = graph.nodes.filter(n => n.type === 'Brand');
    if (brandNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_BRAND_NODES',
          message: 'Brand artifact requires at least one Brand node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No brand nodes found')),
      };
    }

    const brandData = brandNodes[0].props as unknown as BrandData;

    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, brandData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.brand.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, companyName: brandData.companyName },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('html', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('html', errorMessage));
        diagnostics.push({
          code: 'HTML_RENDER_FAILED',
          message: `HTML rendering failed: ${errorMessage}`,
          severity: 'fatal',
          stage: 'render',
        });
      }
    }

    if (this.wantsTarget(job, 'svg')) {
      try {
        const svg = this.renderLogoSvg(brandData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.brand.logo.svg`,
          svg,
          'svg',
          { artifactClass: graph.artifactClass },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('svg', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('svg', errorMessage));
      }
    }

    if (this.wantsTarget(job, 'png')) {
      targetResults.push(this.unsupportedTarget('png', 'PNG export requires Puppeteer (async path)'));
    }

    const fatal = diagnostics.some(d => d.severity === 'fatal');

    return {
      ok: !fatal,
      jobId: job.jobId,
      artifacts,
      diagnostics,
      manifest: {
        capability: this.capability,
        artifactClass: graph.artifactClass,
        companyName: brandData.companyName,
        targetCount: targetResults.length,
      },
      powerhouseArtifacts: artifacts.map(a => ({
        ...a,
        artifactClass: graph.artifactClass,
        provenance: graph.provenance,
      })),
      targetResults,
    };
  }

  private renderLogoSvg(data: BrandData): string {
    const colors = data.colors || { primary: '#818cf8', secondary: '#6366f1', accent: '#a5b4fc', background: '#0f0f11', text: '#e2e8f0' };
    const logoText = data.logo?.text || data.companyName;
    const style = data.logo?.style || 'minimal';

    const fontWeights: Record<string, string> = {
      minimal: '300',
      bold: '800',
      elegant: '400',
      playful: '700',
      tech: '600',
    };

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <rect width="400" height="120" fill="${colors.background}" rx="8"/>
  <text x="200" y="70" text-anchor="middle" font-family="system-ui, sans-serif" font-size="36" font-weight="${fontWeights[style]}" fill="${colors.primary}">${this.escapeXml(logoText)}</text>
  ${data.tagline ? `<text x="200" y="95" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="${colors.text}" opacity="0.7">${this.escapeXml(data.tagline)}</text>` : ''}
</svg>`;
  }

  private renderToHtml(title: string, data: BrandData): string {
    const escapedTitle = this.escapeHtml(title);
    const colors = data.colors || { primary: '#818cf8', secondary: '#6366f1', accent: '#a5b4fc', background: '#0f0f11', text: '#e2e8f0' };
    const typography = data.typography || { heading: 'system-ui, sans-serif', body: 'system-ui, sans-serif' };
    const logoSvg = this.renderLogoSvg(data);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <style>
    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --bg: ${colors.background};
      --text: ${colors.text};
    }
    * { box-sizing: border-box; margin: 0; }
    body {
      font-family: ${typography.body};
      background: var(--bg);
      color: var(--text);
      padding: 2rem;
    }
    h1 { font-family: ${typography.heading}; color: var(--primary); margin-bottom: 2rem; }
    h2 { color: var(--primary); margin: 2rem 0 1rem; font-size: 1.25rem; border-bottom: 1px solid #2e2e38; padding-bottom: 0.5rem; }
    .section { margin-bottom: 3rem; }
    .logo-preview { background: var(--bg); border: 1px solid #2e2e38; border-radius: 8px; padding: 2rem; display: inline-block; }
    .color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .color-swatch { border-radius: 8px; overflow: hidden; border: 1px solid #2e2e38; }
    .color-swatch .preview { height: 80px; }
    .color-swatch .info { padding: 0.75rem; background: #1a1a1e; }
    .color-swatch .name { font-weight: 600; font-size: 0.875rem; }
    .color-swatch .hex { color: #94a3b8; font-size: 0.75rem; font-family: monospace; }
    .banner-preview { border: 1px solid #2e2e38; border-radius: 8px; overflow: hidden; }
    .banner {
      width: ${data.banner?.width || 1200}px;
      height: ${data.banner?.height || 300}px;
      max-width: 100%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-family: ${typography.heading};
    }
    .business-card {
      width: 350px;
      height: 200px;
      background: #1a1a1e;
      border: 1px solid #2e2e38;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .business-card .name { font-size: 1.25rem; font-weight: 700; color: var(--primary); }
    .business-card .title { color: #94a3b8; font-size: 0.875rem; }
    .business-card .contact { font-size: 0.75rem; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>

  <div class="section">
    <h2>Logo</h2>
    <div class="logo-preview">${logoSvg}</div>
  </div>

  <div class="section">
    <h2>Color Palette</h2>
    <div class="color-grid">
      ${Object.entries(colors).map(([name, hex]) => `
        <div class="color-swatch">
          <div class="preview" style="background: ${hex};"></div>
          <div class="info">
            <div class="name">${name}</div>
            <div class="hex">${hex}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  ${data.banner ? `
  <div class="section">
    <h2>Banner</h2>
    <div class="banner-preview">
      <div class="banner">${this.escapeHtml(data.banner.text || data.companyName)}</div>
    </div>
  </div>` : ''}

  ${data.businessCard ? `
  <div class="section">
    <h2>Business Card</h2>
    <div class="business-card">
      <div>
        <div class="name">${this.escapeHtml(data.businessCard.name)}</div>
        <div class="title">${this.escapeHtml(data.businessCard.title)}</div>
      </div>
      <div class="contact">
        ${data.businessCard.email ? `<div>${this.escapeHtml(data.businessCard.email)}</div>` : ''}
        ${data.businessCard.phone ? `<div>${this.escapeHtml(data.businessCard.phone)}</div>` : ''}
        ${data.businessCard.website ? `<div>${this.escapeHtml(data.businessCard.website)}</div>` : ''}
      </div>
    </div>
  </div>` : ''}
</body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  private escapeXml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }
}
