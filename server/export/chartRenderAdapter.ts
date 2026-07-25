export type ChartSnapshotFormat = "png";

export type ChartSnapshotConfig = Record<string, unknown>;

export type ChartSnapshotRequest = {
  config: ChartSnapshotConfig;
  width?: number;
  height?: number;
  format?: ChartSnapshotFormat;
  backgroundColor?: string;
};

export type NormalizedChartSnapshotRequest = Required<Omit<ChartSnapshotRequest, "config">> & {
  config: ChartSnapshotConfig;
};

export type ChartSnapshotRendererOptions = {
  width: number;
  height: number;
  backgroundColor: string;
};

export type ChartSnapshotRendererInstance = {
  renderToBuffer: (config: ChartSnapshotConfig) => Promise<Buffer>;
};

export type ChartSnapshotRendererFactory = (
  options: ChartSnapshotRendererOptions,
) => Promise<ChartSnapshotRendererInstance>;

export type ChartSnapshotRenderer = {
  renderToBuffer: (request: ChartSnapshotRequest) => Promise<Buffer>;
  renderToDataUrl: (request: ChartSnapshotRequest) => Promise<string>;
};

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 420;
const DEFAULT_BACKGROUND = "#020617";

export function normalizeChartSnapshotRequest(request: ChartSnapshotRequest): NormalizedChartSnapshotRequest {
  return {
    config: request.config,
    width: normalizeDimension(request.width, DEFAULT_WIDTH),
    height: normalizeDimension(request.height, DEFAULT_HEIGHT),
    format: request.format ?? "png",
    backgroundColor: request.backgroundColor ?? DEFAULT_BACKGROUND,
  };
}

export function createChartSnapshotRenderer(options: { factory?: ChartSnapshotRendererFactory } = {}): ChartSnapshotRenderer {
  const factory = options.factory ?? loadChartJsNodeCanvas;
  const instances = new Map<string, Promise<ChartSnapshotRendererInstance>>();

  async function getInstance(request: NormalizedChartSnapshotRequest): Promise<ChartSnapshotRendererInstance> {
    const key = `${request.width}x${request.height}:${request.backgroundColor}`;
    const existing = instances.get(key);
    if (existing) return existing;

    const created = factory({
      width: request.width,
      height: request.height,
      backgroundColor: request.backgroundColor,
    });
    instances.set(key, created);
    return created;
  }

  async function renderToBuffer(request: ChartSnapshotRequest): Promise<Buffer> {
    const normalized = normalizeChartSnapshotRequest(request);
    const renderer = await getInstance(normalized);
    return renderer.renderToBuffer(normalized.config);
  }

  return {
    renderToBuffer,
    async renderToDataUrl(request: ChartSnapshotRequest): Promise<string> {
      const buffer = await renderToBuffer(request);
      return `data:image/png;base64,${buffer.toString("base64")}`;
    },
  };
}

async function loadChartJsNodeCanvas(options: ChartSnapshotRendererOptions): Promise<ChartSnapshotRendererInstance> {
  try {
    const importOptionalDependency = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<{
      ChartJSNodeCanvas: new (options: {
        width: number;
        height: number;
        backgroundColour?: string;
      }) => ChartSnapshotRendererInstance;
    }>;
    const module = await importOptionalDependency("chartjs-node-canvas");
    const ChartJSNodeCanvas = module.ChartJSNodeCanvas as new (options: {
      width: number;
      height: number;
      backgroundColour?: string;
    }) => ChartSnapshotRendererInstance;

    return new ChartJSNodeCanvas({
      width: options.width,
      height: options.height,
      backgroundColour: options.backgroundColor,
    });
  } catch (error) {
    throw new Error(
      `Chart snapshot rendering requires the optional chartjs-node-canvas dependency. ${error instanceof Error ? error.message : ""}`.trim(),
    );
  }
}

function normalizeDimension(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
}
