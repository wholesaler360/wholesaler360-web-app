import { toSentenceCase } from "./utils";

/**
 * Filters table columns to only those suitable for export
 * (visible accessor columns, excluding action/display-only columns).
 */
export function getExportableColumns(table) {
  const excludedIds = new Set(["actions"]);

  return table.getAllColumns().filter((column) => {
    if (typeof column.accessorFn === "undefined") return false;
    if (!column.getIsVisible()) return false;
    if (excludedIds.has(column.id)) return false;
    return true;
  });
}

/**
 * Extracts a plain-text header name from a column definition.
 */
export function getColumnHeaderText(column) {
  const headerDef = column.columnDef.header;
  if (typeof headerDef === "string") {
    return headerDef;
  }
  return toSentenceCase(column.id);
}

/**
 * Formats a raw cell value for export (handles dates, nulls, etc.).
 */
export function formatCellValue(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }

  return String(value);
}

/**
 * Extracts { headers, rows } from the table's current filtered state.
 * Uses getFilteredRowModel() to get ALL filtered rows (ignoring pagination).
 */
export function extractTableData(table) {
  const columns = getExportableColumns(table);
  const headers = columns.map(getColumnHeaderText);
  const filteredRows = table.getFilteredRowModel().rows;

  const rows = filteredRows.map((row) =>
    columns.map((column) => formatCellValue(row.getValue(column.id))),
  );

  return { headers, rows };
}

function escapeCsvField(field) {
  const str = String(field);
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a CSV file from the table data and triggers a download.
 */
export function exportToCSV(table, filename = "export") {
  const { headers, rows } = extractTableData(table);

  const csvRows = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => row.map(escapeCsvField).join(",")),
  ];

  const csvString = csvRows.join("\n");
  // BOM for correct UTF-8 handling in Excel
  const blob = new Blob(["\uFEFF" + csvString], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Opens a print-friendly window with the table data and triggers the browser print dialog.
 */
export function printTable(table, title = "Table Data") {
  const { headers, rows } = extractTableData(table);

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const dateStr = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { font-size: 18px; margin-bottom: 8px; }
    .meta { font-size: 12px; color: #666; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: 600; }
    tr:nth-child(even) { background-color: #fafafa; }
    @media print {
      body { padding: 0; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">Generated on ${dateStr} &bull; ${rows.length} record${rows.length !== 1 ? "s" : ""}</p>
  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
