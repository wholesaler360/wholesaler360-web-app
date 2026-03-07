import html2pdf from "html2pdf.js";
import { getCompanyDetails } from "@/lib/authUtils";

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

function formatCurrency(num) {
  return `₹${Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function computeSummary(data, summaryFields) {
  if (!summaryFields) return [];
  return summaryFields.map((field) => {
    let value;
    if (field.type === "count") {
      value = data.length;
    } else if (field.type === "sum") {
      value = data.reduce((s, r) => s + (Number(r[field.key]) || 0), 0);
    } else if (field.type === "computed") {
      value = field.compute(data);
    }
    const formatted =
      field.format === "number"
        ? String(value)
        : field.type === "count"
          ? String(value)
          : formatCurrency(value);
    return { label: field.label, value: formatted };
  });
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

function getCompanyHtml() {
  const company = getCompanyDetails();
  if (!company) return { nameHtml: "", detailsHtml: "" };

  const name = company.name || "";
  const lines = [];
  if (company.address) {
    const a = company.address;
    const parts = [a.addressLine1, a.addressLine2].filter(Boolean);
    if (parts.length) lines.push(parts.join(", "));
    const cityLine = [a.city, a.state, a.pincode].filter(Boolean).join(", ");
    if (cityLine) lines.push(cityLine);
  }
  if (company.mobileNo) lines.push(`Phone: ${company.mobileNo}`);
  if (company.gstin) lines.push(`GSTIN: ${company.gstin}`);

  return {
    nameHtml: escapeHtml(name),
    detailsHtml: lines.map((l) => escapeHtml(l)).join("<br/>"),
    logoUrl: company.logoUrl || "",
  };
}

function buildReportHtml(data, config, title, dateRange) {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const generatedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const company = getCompanyHtml();
  const summaryItems = computeSummary(data, config.summaryFields);
  const headers = config.columns.map((col) => col.header);
  const rows = data.map((row) =>
    config.columns.map((col) => formatValue(getCellValue(row, col), col.type)),
  );

  let dateRangeStr = "";
  if (dateRange && dateRange.from) {
    const fromStr = dateRange.from.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const toStr = dateRange.to
      ? dateRange.to.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : fromStr;
    dateRangeStr = `${fromStr} — ${toStr}`;
  }

  const summaryHtml = summaryItems.length
    ? `<div class="summary">
        ${summaryItems
          .map(
            (item) => `<div class="summary-card">
            <div class="summary-label">${escapeHtml(item.label)}</div>
            <div class="summary-value">${escapeHtml(item.value)}</div>
          </div>`,
          )
          .join("")}
      </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 0; }
    .page { padding: 32px; max-width: 1200px; margin: 0 auto; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid #1a1a1a; margin-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .company-logo { width: 52px; height: 52px; border-radius: 8px; object-fit: contain; }
    .company-name { font-size: 20px; font-weight: 700; text-transform: capitalize; margin-bottom: 2px; }
    .company-details { font-size: 11px; color: #555; line-height: 1.6; }
    .header-right { text-align: right; }
    .report-title { font-size: 22px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; }
    .report-meta { font-size: 11px; color: #555; margin-top: 6px; line-height: 1.6; }

    /* Summary */
    .summary { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .summary-card { flex: 1; min-width: 140px; background: #f8f9fa; border: 1px solid #e2e5e9; border-radius: 8px; padding: 14px 16px; }
    .summary-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .summary-value { font-size: 18px; font-weight: 700; color: #1a1a1a; }

    /* Table */
    .table-section { margin-bottom: 24px; }
    .table-title { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    thead th { background: #1a1a1a; color: #fff; font-weight: 600; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th:first-child { border-radius: 6px 0 0 0; }
    thead th:last-child { border-radius: 0 6px 0 0; }
    tbody td { padding: 9px 12px; border-bottom: 1px solid #eee; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:last-child td:first-child { border-radius: 0 0 0 6px; }
    tbody tr:last-child td:last-child { border-radius: 0 0 6px 0; }

    /* Footer */
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 10px; color: #999; }

    /* Print */
    @media print {
      body { padding: 0; }
      .page { padding: 0; }
      @page { margin: 12mm; size: landscape; }
      .summary-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${company.logoUrl && company.logoUrl !== "/" ? `<img src="${company.logoUrl}" class="company-logo" />` : ""}
        <div>
          <div class="company-name">${company.nameHtml || "Company"}</div>
          <div class="company-details">${company.detailsHtml}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="report-title">${escapeHtml(config.label)} Report</div>
        <div class="report-meta">
          ${dateRangeStr ? `Period: ${escapeHtml(dateRangeStr)}<br/>` : ""}
          Generated: ${generatedDate} at ${generatedTime}<br/>
          Records: ${rows.length}
        </div>
      </div>
    </div>

    ${summaryHtml}

    <div class="table-section">
      <div class="table-title">Detailed Records</div>
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map(
                    (row) =>
                      `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
                  )
                  .join("")
              : `<tr><td colspan="${headers.length}" style="text-align:center;padding:24px;color:#999;">No records found</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <div class="footer">
      <div>This is a system-generated report.</div>
      <div>${escapeHtml(config.label)} Report &bull; ${generatedDate}</div>
    </div>
  </div>
</body>
</html>`;
}

// ── CSV Export ────────────────────────────────────────────────────

export function exportReportToCSV(data, config, filename = "report") {
  const summaryItems = computeSummary(data, config.summaryFields);
  const headers = config.columns.map((col) => col.header);
  const rows = data.map((row) =>
    config.columns.map((col) => formatValue(getCellValue(row, col), col.type)),
  );

  const csvLines = [];

  // Summary section
  if (summaryItems.length) {
    csvLines.push("--- Summary ---");
    summaryItems.forEach((item) => {
      csvLines.push(`${escapeCsvField(item.label)},${escapeCsvField(item.value)}`);
    });
    csvLines.push("");
  }

  // Data section
  csvLines.push(headers.map(escapeCsvField).join(","));
  rows.forEach((row) => {
    csvLines.push(row.map(escapeCsvField).join(","));
  });

  const csvString = csvLines.join("\n");
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

// ── Print ─────────────────────────────────────────────────────────

export function printReport(data, config, title = "Report", dateRange) {
  const html = buildReportHtml(data, config, title, dateRange);
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(
    html + "<script>window.onload = function() { window.print(); }</script>",
  );
  printWindow.document.close();
}

// ── PDF Export ─────────────────────────────────────────────────────

export function exportReportToPDF(data, config, title = "Report", dateRange) {
  const html = buildReportHtml(data, config, title, dateRange);

  const container = document.createElement("div");
  container.innerHTML = html;
  const bodyContent = container.querySelector("body");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = bodyContent ? bodyContent.innerHTML : html;

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `${config.label.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };

  html2pdf().set(opt).from(wrapper).save();
}
