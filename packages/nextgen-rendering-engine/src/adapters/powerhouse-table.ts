/**
 * POWERHOUSE TABLE BACKEND
 *
 * Renders table artifacts: Interactive data tables with sorting, filtering, export.
 * Supports sync HTML preview and async CSV/XLSX export.
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

interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  sortable?: boolean;
  filterable?: boolean;
}

interface TableData {
  columns: TableColumn[];
  rows: Record<string, any>[];
  title?: string;
}

export class PowerhouseTableBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-table',
    kind: 'table',
    displayName: 'Powerhouse Table Renderer',
    artifactClasses: ['table'],
    supportedNodeTypes: ['Table'],
    supportedFormats: ['html', 'csv', 'xlsx'],
    executionMode: 'in-process',
    sourceProjects: ['ag-grid', 'sheetjs'],
    strengths: ['Interactive tables', 'Sorting and filtering', 'Multi-format export'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const tableNodes = graph.nodes.filter(n => n.type === 'Table');
    if (tableNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_TABLE_NODES',
          message: 'Table artifact requires at least one Table node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No table nodes found')),
      };
    }

    const tableData = tableNodes[0].props as unknown as TableData;

    // Render HTML (sync preview)
    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, tableData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.table.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, rowCount: tableData.rows.length },
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

    // CSV export (sync)
    if (this.wantsTarget(job, 'csv')) {
      try {
        const csv = this.renderToCsv(tableData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.table.csv`,
          csv,
          'csv',
          { artifactClass: graph.artifactClass },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('csv', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('csv', errorMessage));
      }
    }

    // XLSX export (async - requires SheetJS)
    if (this.wantsTarget(job, 'xlsx')) {
      targetResults.push(this.unsupportedTarget('xlsx', 'XLSX export requires SheetJS (async path)'));
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
        rowCount: tableData.rows.length,
        columnCount: tableData.columns.length,
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

  private renderToHtml(title: string, data: TableData): string {
    const escapedTitle = this.escapeHtml(title);
    const columnsJson = JSON.stringify(data.columns, null, 2);
    const rowsJson = JSON.stringify(data.rows, null, 2);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <style>
    :root {
      --gv-bg: #0f0f11;
      --gv-surface: #1a1a1e;
      --gv-border: #2e2e38;
      --gv-text: #e2e8f0;
      --gv-muted: #94a3b8;
      --gv-accent: #818cf8;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 2rem;
      background: var(--gv-bg);
      color: var(--gv-text);
    }
    h1 {
      color: var(--gv-accent);
      margin-bottom: 1rem;
    }
    .controls {
      margin-bottom: 1rem;
    }
    .controls input {
      padding: 0.5rem;
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 4px;
      color: var(--gv-text);
      width: 300px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: #1e1e2a;
      color: var(--gv-accent);
      padding: 0.75rem;
      text-align: left;
      cursor: pointer;
      user-select: none;
      border-bottom: 2px solid var(--gv-border);
    }
    th:hover {
      background: #252535;
    }
    th.sortable::after {
      content: ' ↕';
      opacity: 0.5;
    }
    th.sort-asc::after {
      content: ' ↑';
      opacity: 1;
    }
    th.sort-desc::after {
      content: ' ↓';
      opacity: 1;
    }
    td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--gv-border);
    }
    tr:hover {
      background: #1e1e2a;
    }
    .pagination {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    .pagination button {
      padding: 0.5rem 1rem;
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 4px;
      color: var(--gv-text);
      cursor: pointer;
    }
    .pagination button:hover {
      background: #1e1e2a;
    }
    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  <div class="controls">
    <input type="text" id="filter" placeholder="Filter rows...">
  </div>
  <table id="dataTable">
    <thead>
      <tr id="headerRow"></tr>
    </thead>
    <tbody id="tableBody"></tbody>
  </table>
  <div class="pagination">
    <button id="prevBtn" disabled>Previous</button>
    <span id="pageInfo"></span>
    <button id="nextBtn">Next</button>
  </div>
  <script>
    const columns = ${columnsJson};
    const rows = ${rowsJson};
    const pageSize = 20;
    let currentPage = 1;
    let filteredRows = [...rows];
    let sortColumn = null;
    let sortDirection = 'asc';

    function renderHeader() {
      const headerRow = document.getElementById('headerRow');
      headerRow.innerHTML = columns.map(col => {
        const sortable = col.sortable !== false;
        const sortClass = sortColumn === col.id ? (sortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : '';
        return \`<th class="\${sortable ? 'sortable' : ''} \${sortClass}" data-column="\${col.id}">\${col.label}</th>\`;
      }).join('');
      
      headerRow.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.column));
      });
    }

    function renderTable() {
      const tbody = document.getElementById('tableBody');
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageRows = filteredRows.slice(start, end);
      
      tbody.innerHTML = pageRows.map(row => {
        return '<tr>' + columns.map(col => {
          const value = row[col.id];
          return \`<td>\${value !== undefined ? value : ''}</td>\`;
        }).join('') + '</tr>';
      }).join('');
      
      updatePagination();
    }

    function updatePagination() {
      const totalPages = Math.ceil(filteredRows.length / pageSize);
      document.getElementById('pageInfo').textContent = \`Page \${currentPage} of \${totalPages}\`;
      document.getElementById('prevBtn').disabled = currentPage === 1;
      document.getElementById('nextBtn').disabled = currentPage === totalPages;
    }

    function sortTable(columnId) {
      if (sortColumn === columnId) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = columnId;
        sortDirection = 'asc';
      }
      
      const col = columns.find(c => c.id === columnId);
      filteredRows.sort((a, b) => {
        let valA = a[columnId];
        let valB = b[columnId];
        
        if (col.type === 'number') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      currentPage = 1;
      renderHeader();
      renderTable();
    }

    function filterRows(query) {
      query = query.toLowerCase();
      filteredRows = rows.filter(row => {
        return columns.some(col => {
          const value = String(row[col.id] || '').toLowerCase();
          return value.includes(query);
        });
      });
      currentPage = 1;
      renderTable();
    }

    document.getElementById('filter').addEventListener('input', (e) => {
      filterRows(e.target.value);
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      const totalPages = Math.ceil(filteredRows.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });

    renderHeader();
    renderTable();
  </script>
</body>
</html>`;
  }

  private renderToCsv(data: TableData): string {
    const headers = data.columns.map(col => this.escapeCsv(col.label)).join(',');
    const rows = data.rows.map(row => {
      return data.columns.map(col => {
        const value = row[col.id];
        return this.escapeCsv(String(value ?? ''));
      }).join(',');
    });
    return [headers, ...rows].join('\n');
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replaceAll('"', '""')}"`;
    }
    return value;
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
