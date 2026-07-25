import { Renderer, RenderedArtifact } from './types';
import { escapeHtml } from '../codex/templates/renderers/index.js';

type AudioInput = string | {
  script?: string;
  voice?: string;
  body?: {
    script?: string;
    voice?: string;
  };
};

function extractScript(input: AudioInput): string {
  if (typeof input === 'string') return input;
  return input.script ?? input.body?.script ?? '';
}

function extractVoice(input: AudioInput): string {
  if (typeof input === 'string') return 'default';
  return input.voice ?? input.body?.voice ?? 'default';
}

/**
 * AudioRenderer converts plain text into audio formats (WAV / MP3) by
 * calling a self-hosted TTS service.  The service endpoint is resolved
 * from environment variables in this priority order:
 *
 *  1. ORPHEUS_TTS_URL  — Orpheus-FastAPI self-hosted (default port 8000)
 *  2. COQUI_TTS_URL    — Coqui TTS HTTP API
 *  3. TTS_SERVICE_URL  — generic fallback endpoint
 *
 * Both Orpheus-FastAPI and Coqui accept:
 *   POST /tts  { text: string, voice: string, format: "wav" | "mp3" }
 *   → audio/wav  or  audio/mpeg
 *
 * If no TTS_URL env var is set, or if the request fails, the renderer
 * falls back gracefully to the HTML preview so the pipeline never
 * hard-blocks.
 *
 * Environment variables (add to Vercel project settings):
 *   ORPHEUS_TTS_URL=https://your-orpheus-instance.com
 *   COQUI_TTS_URL=https://your-coqui-instance.com
 */
export class AudioRenderer implements Renderer<AudioInput> {
  public readonly kind = 'audio';

  public formats(): string[] {
    return ['html', 'json', 'wav', 'mp3'];
  }

  public async render(input: AudioInput, format: string): Promise<RenderedArtifact> {
    if (!this.formats().includes(format)) {
      throw new Error(`AudioRenderer does not support format: ${format}`);
    }

    const script = extractScript(input);
    const voice = extractVoice(input);

    if (format === 'html') {
      return { format: 'html', data: this.buildHtmlPreview(script) };
    }

    if (format === 'json') {
      return {
        format: 'json',
        data: JSON.stringify(
          { type: 'audio_narration', script, voice, length: script.length },
          null,
          2,
        ),
      };
    }

    // WAV / MP3 — attempt TTS service call
    const ttsUrl = this.resolveTtsUrl();

    if (ttsUrl && script.trim()) {
      try {
        const audioBuffer = await this.callTtsService(ttsUrl, script, voice, format);
        return { format, data: audioBuffer };
      } catch (err) {
        console.warn('[AudioRenderer] TTS service call failed, falling back to script bytes:', err);
      }
    }

    // Graceful fallback: return script text as UTF-8 bytes
    return { format, data: Buffer.from(script, 'utf-8') };
  }

  // ─── TTS service ───────────────────────────────────────────────────────────

  private resolveTtsUrl(): string | null {
    return (
      process.env['ORPHEUS_TTS_URL'] ??
      process.env['COQUI_TTS_URL'] ??
      process.env['TTS_SERVICE_URL'] ??
      null
    );
  }

  private async callTtsService(
    baseUrl: string,
    text: string,
    voice: string,
    format: 'wav' | 'mp3' | string,
  ): Promise<Buffer> {
    const endpoint = `${baseUrl.replace(/\/$/, '')}/tts`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, format }),
    });

    if (!res.ok) {
      throw new Error(`TTS service responded ${res.status}: ${await res.text()}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // ─── HTML preview ─────────────────────────────────────────────────────────

  private buildHtmlPreview(script: string): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Audio Script Preview</title>
  <style>
    :root { --gv-bg: #0f0f11; --gv-surface: #1a1a1e; --gv-border: #2e2e38;
            --gv-text: #e2e8f0; --gv-muted: #94a3b8; --gv-accent: #818cf8; }
    body  { margin: 0; padding: 2rem; background: var(--gv-bg); color: var(--gv-text);
            font-family: system-ui, sans-serif; max-width: 760px; margin-inline: auto; }
    h1    { font-size: 1.4rem; color: var(--gv-accent); margin-bottom: 1rem; }
    .badge { display: inline-block; background: var(--gv-surface); border: 1px solid var(--gv-border);
             border-radius: 9999px; padding: 0.15rem 0.6rem; font-size: 0.75rem;
             color: var(--gv-muted); margin-bottom: 1rem; }
    .script { background: var(--gv-surface); border: 1px solid var(--gv-border);
              border-radius: 8px; padding: 1.25rem; line-height: 1.8;
              white-space: pre-wrap; word-break: break-word; }
    .hint { margin-top: 1rem; font-size: 0.8rem; color: var(--gv-muted); }
  </style>
</head>
<body>
  <h1>🎤 Audio Script</h1>
  <span class="badge">TTS Preview — set ORPHEUS_TTS_URL or COQUI_TTS_URL to enable live audio export</span>
  <div class="script">${escapeHtml(script)}</div>
  <p class="hint">Word count: ${script.split(/\s+/).filter(Boolean).length}</p>
</body>
</html>`;
  }
}
