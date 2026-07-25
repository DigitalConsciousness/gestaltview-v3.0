import { Renderer, RenderedArtifact } from './types';
import { MarkdownRenderer } from './markdown.js';

/**
 * PdfRenderer converts Markdown or raw HTML into PDF or PNG buffers.
 *
 * Requires puppeteer + @sparticuz/chromium (serverless).
 *
 * HONEST FALLBACK: If headless rendering fails, the target is marked FAILED.
 * HTML bytes are NEVER returned labeled as PDF/PNG.
 * If an HTML artifact was also requested, it is returned correctly labeled.
 */
export class PdfRenderer implements Renderer<string> {
  public readonly kind = 'pdf';

  private readonly markdownRenderer = new MarkdownRenderer();

  public formats(): string[] {
    return ['pdf', 'png'];
  }

  public async render(input: string, format: string): Promise<RenderedArtifact> {
    if (format !== 'pdf' && format !== 'png') {
      throw new Error(`PdfRenderer only supports 'pdf' and 'png' formats, received: ${format}`);
    }

    const htmlInput = input.trimStart().startsWith('<')
      ? input
      : ((await this.markdownRenderer.render(input, 'html')).data as string);

    try {
      const buffer = await this.renderWithPuppeteer(htmlInput, format as 'pdf' | 'png');
      return { format, data: buffer };
    } catch (err) {
      // NEVER return HTML bytes labeled as PDF/PNG.
      // Throw so the caller can mark this target as failed.
      throw new Error(
        `PdfRenderer: ${format.toUpperCase()} render failed. ` +
        `Install puppeteer + @sparticuz/chromium and set PUPPETEER_EXECUTABLE_PATH. ` +
        `HTML bytes were NOT returned as ${format}. Cause: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // ─── Puppeteer headless render ──────────────────────────────────────────

  private async renderWithPuppeteer(
    html: string,
    format: 'pdf' | 'png',
  ): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const puppeteer = await import('puppeteer' as any);
    const puppeteerModule = puppeteer.default ?? puppeteer;

    const launchOptions: Record<string, unknown> = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    };

    const execPath = process.env['PUPPETEER_EXECUTABLE_PATH'];
    if (execPath) {
      launchOptions['executablePath'] = execPath;
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chromium = await import('@sparticuz/chromium' as any);
        const chromiumModule = chromium.default ?? chromium;
        launchOptions['executablePath'] = await chromiumModule.executablePath();
        launchOptions['args'] = [...(launchOptions['args'] as string[]), ...chromiumModule.args];
        launchOptions['defaultViewport'] = chromiumModule.defaultViewport;
      } catch {
        // No @sparticuz/chromium — Puppeteer will use its bundled Chromium
      }
    }

    const browser = await puppeteerModule.launch(launchOptions);

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      if (format === 'png') {
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: true,
        });
        return Buffer.from(screenshot);
      }

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
        displayHeaderFooter: false,
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
