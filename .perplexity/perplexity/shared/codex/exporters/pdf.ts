export type PdfExportRequest = {
  html: string;
  outputPath: string;
};

export async function exportPdfFromHtml(_request: PdfExportRequest): Promise<void> {
  throw new Error("PDF export requires a Puppeteer worker dependency and must run in the durable Codex export lane.");
}
