import html2pdf from "html2pdf.js";

function getCellValue(row, col) {
  if (col.accessor) return col.accessor(row);
  return row[col.key];
}

function formatValue(value, type) {
  if (value === null || value === undefined) return "";
  if (type === "date") {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  if (type === "currency") {
    return `₹${Number(value).toLocaleString("en-IN")}`;
  }
  return String(value);
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtmlTable(data, config, title) {
  const dateStr = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const headers = config.columns.map((col) => col.header);
  const rows = data.map((row) =>
    config.columns.map((col) => formatValue(getCellValue(row, col), col.type)),
  );

  return `<!DOCTYPE html>
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
    @media print { body { padding: 0; } @page { margin: 1cm; } }
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
</body>
</html>`;
}

export function exportReportToCSV(data, config, filename = "report") {
  const headers = config.columns.map((col) => col.header);
  const rows = data.map((row) =>
    config.columns.map((col) => formatValue(getCellValue(row, col), col.type)),
  );

  const csvRows = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => row.map(escapeCsvField).join(",")),
  ];
  const csvString = csvRows.join("\n");
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

export function printReport(data, config, title = "Report") {
  const html = buildHtmlTable(data, config, title);
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(
    html + "<script>window.onload = function() { window.print(); }</script>",
  );
  printWindow.document.close();
}

export function exportReportToPDF(data, config, title = "Report") {
  const html = buildHtmlTable(data, config, title);

  const container = document.createElement("div");
  container.innerHTML = html;
  const bodyContent = container.querySelector("body");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = bodyContent ? bodyContent.innerHTML : html;

  const opt = {
    margin: 10,
    filename: `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };

  html2pdf().set(opt).from(wrapper).save();
}
