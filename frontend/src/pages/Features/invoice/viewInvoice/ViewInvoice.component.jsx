import React, { useContext, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ViewInvoiceContext } from "./ViewInvoice.control";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Printer, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import html2pdf from "html2pdf.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ViewInvoiceComponent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    invoice,
    company,
    isLoading,
    signatures,
    selectedSignature,
    setSelectedSignature,
    fetchInvoice,
    fetchCompanyDetails,
    fetchSignatures,
  } = useContext(ViewInvoiceContext);
  const invoiceRef = useRef(null);

  const location = useLocation();
  const shouldPrint =
    new URLSearchParams(location.search).get("print") === "true";

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
      fetchCompanyDetails();
      fetchSignatures();
    }
  }, [id, fetchInvoice, fetchCompanyDetails, fetchSignatures]);

  useEffect(() => {
    if (shouldPrint && invoice && !isLoading) {
      console.log("Auto-triggering print for invoice:", invoice.invoiceNo);
      const timer = setTimeout(() => {
        try {
          printInvoice();
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch (err) {
          console.error("Error auto-printing:", err);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint, invoice, isLoading]);

  const downloadPDF = () => {
    const element = invoiceRef.current;

    // Clone the element to avoid modifying the actual DOM
    const clonedElement = element.cloneNode(true);

    // Force dark text on light background for PDF regardless of theme
    const styles = document.createElement("style");
    styles.innerHTML = `
      body, .invoice-container { /* Apply to a common container */
        background-color: white !important;
      }
      * {
        color: #212529 !important; /* Darker text color */
        border-color: #dee2e6 !important; /* Consistent border color */
      }
      .text-muted { color: #6c757d !important; }
      .bg-light { background-color: #f8f9fa !important; }
      .text-primary { color: #0d6efd !important; }
      .text-success { color: #198754 !important; }
      .text-danger { color: #dc3545 !important; }
      /* Add any other specific overrides if needed */
    `;
    clonedElement.prepend(styles);

    // Reduce internal padding for PDF if needed
    const invoiceContainerForPdf =
      clonedElement.querySelector(".invoice-container");
    if (invoiceContainerForPdf) {
      // Example: Reduce padding for PDF. Adjust as needed.
      // invoiceContainerForPdf.style.padding = '10px';
    }

    const opt = {
      margin: [0, 0], // Reduced PDF margins (Top/Bottom, Left/Right in mm)
      filename: `invoice-${invoice?.invoiceNo || "download"}.pdf`,
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(clonedElement).set(opt).save();
  };

  const printInvoice = () => {
    try {
      const printContent = document.getElementById("invoice-content");
      if (!printContent) {
        console.error("Print content element not found");
        return;
      }

      const WinPrint = window.open("", "", "width=900,height=650");
      if (!WinPrint) {
        alert("Please allow pop-ups to print the invoice");
        return;
      }

      WinPrint.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice?.invoiceNo}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              body {
                font-family: 'Inter', sans-serif;
                margin: 20px;
                color: #212529; /* Darker base text color */
                line-height: 1.6;
                font-size: 10pt; /* Base font size for print */
                background-color: white;
              }
              
              .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #dee2e6; /* Light border for the whole invoice */
              }

              .header-section, .from-to-section, .items-section-print, .totals-section-print, .footer-section-print {
                margin-bottom: 20px;
              }

              .header-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                Primary color accent */
                padding-bottom: 15px;
              }
              .header-section .company-logo { max-height: 60px; margin-bottom: 10px; }
              .header-section .invoice-details { text-align: right; }
              .header-section .invoice-title { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
              .header-section .invoice-meta p { margin: 2px 0; font-size: 0.9em; }

              .from-to-section {
                display: flex;
                justify-content: space-between;
                gap: 20px; /* Gap between From and To columns */
              }
              .from-to-section > div { width: 48%; } /* Each column takes roughly half width */
              .from-to-section h3 {
                font-size: 1.1em;
                font-weight: 600;
                margin-bottom: 8px;
                border-bottom: 1px solid #ccc;
                padding-bottom: 5px;
              }
              .from-to-section p { margin: 3px 0; font-size: 0.9em; }

              .items-section-print table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              .items-section-print th, .items-section-print td {
                border: 1px solid #dee2e6;
                padding: 8px;
                text-align: left;
                font-size: 0.9em;
              }
              .items-section-print th { background-color: #f8f9fa; font-weight: 600; }
              .items-section-print .text-right { text-align: right; }

              .totals-section-print {
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
              }
              .totals-section-print .totals-box {
                width: 300px; /* Adjust as needed */
              }
              .totals-section-print .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                font-size: 0.9em;
              }
              .totals-section-print .summary-row.total {
                font-weight: bold;
                font-size: 1em;
                border-top: 2px solid #212529;
                margin-top: 5px;
                padding-top: 5px;
              }
              .totals-section-print .text-success { color: #198754 !important; }
              .totals-section-print .text-danger { color: #dc3545 !important; }
              
              .footer-section-print {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #dee2e6;
                font-size: 0.85em;
              }
              .footer-section-print .grid-container {
                display: grid;
                grid-template-columns: 1fr 1fr; /* Two columns for bank details and signature */
                gap: 20px;
              }
              .footer-section-print h4 { font-size: 1em; font-weight: 600; margin-bottom: 8px; }
              .footer-section-print .signature-area { text-align: right; }
              .footer-section-print .signature-image { max-height: 40px; margin-bottom: 5px; margin-left: auto; display: block; }
              .footer-section-print .terms-conditions { margin-top: 20px; white-space: pre-line; }

              .page-break-avoid { page-break-inside: avoid; }
              
              @media print {
                body { margin: 0; padding: 10mm; font-size: 9pt; }
                .invoice-container { border: none; padding: 0; }
                .header-section { border-bottom-color: #007bff; } /* Ensure primary color prints */
                .header-section .company-name { color: #007bff; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);

      WinPrint.document.close();
      WinPrint.focus();

      setTimeout(() => {
        WinPrint.print();
        setTimeout(() => WinPrint.close(), 500);
      }, 500);
    } catch (e) {
      console.error("Error printing invoice:", e);
      alert("There was a problem printing the invoice. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!invoice || !company) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <p className="text-lg font-medium">Invoice not found</p>
        <Button variant="outline" onClick={() => navigate("/invoices")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const subtotal = invoice.products.reduce(
    (sum, product) => sum + (product.amount - product.taxAmount),
    0
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/invoices")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              Invoice Details
            </h1>
          </div>
          <div className="flex gap-2">
            {signatures && signatures.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {selectedSignature
                      ? selectedSignature.name
                      : "Select Signature"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {signatures.map((signature) => (
                    <DropdownMenuItem
                      key={signature._id}
                      onClick={() => setSelectedSignature(signature)}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={signature.signatureUrl}
                          alt={signature.name}
                          className="w-6 h-6 object-contain"
                        />
                        <span>{signature.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="outline"
              onClick={printInvoice}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={downloadPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="border shadow-sm dark:border-zinc-700">
          <CardContent
            className="p-3 sm:p-3"
            ref={invoiceRef}
            id="invoice-content"
          >
            <div className="invoice-container p-4 sm:p-6 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 print:bg-white print:text-black">
              {/* Section 1: Header */}
              <div className="header-section flex flex-col sm:flex-row justify-between items-start pb-4 mb-6">
                <div className="company-info">
                  {company.logoUrl && (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="company-logo h-12 sm:h-16 object-contain mb-2"
                    />
                  )}
                </div>
                <div className="invoice-details text-left sm:text-right mt-4 sm:mt-0">
                  <h1 className="invoice-title text-3xl sm:text-4xl font-extrabold uppercase mb-1">
                    INVOICE
                  </h1>
                  <div className="invoice-meta text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-700">
                    <p>
                      <span className="font-semibold">Invoice #:</span>{" "}
                      {invoice.invoiceNo}
                    </p>
                    <p>
                      <span className="font-semibold">Date Issued:</span>{" "}
                      {format(new Date(invoice.invoiceDate), "dd MMM yyyy")}
                    </p>
                    <p>
                      <span className="font-semibold">Date Due:</span>{" "}
                      {format(new Date(invoice.invoiceDueDate), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: From & To */}
              <div className="from-to-section grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="page-break-avoid">
                  <h3 className="text-lg font-semibold mb-2 pb-1 border-b dark:border-zinc-700 print:border-gray-300">
                    From:
                  </h3>
                  <p className="font-semibold text-base">{company.name}</p>
                  {company.address && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                      {company.address.street}, {company.address.city},{" "}
                      {company.address.state} - {company.address.zipCode}
                    </p>
                  )}
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                    Phone: {company.mobileNo}
                  </p>
                  {company.email && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                      Email: {company.email}
                    </p>
                  )}
                  {company.gstin && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                      GSTIN: {company.gstin}
                    </p>
                  )}
                </div>
                <div className="page-break-avoid">
                  <h3 className="text-lg font-semibold mb-2 pb-1 border-b dark:border-zinc-700 print:border-gray-300">
                    To:
                  </h3>
                  <p className="font-semibold text-base">
                    {invoice.customerId.name}
                  </p>
                  {invoice.customerId.address && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                      {invoice.customerId.address}
                    </p>
                  )}
                  {invoice.customerId.email && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                      Email: {invoice.customerId.email}
                    </p>
                  )}
                  {invoice.customerId.phone && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                      Phone: {invoice.customerId.phone}
                    </p>
                  )}
                  {invoice.customerId.gstin && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                      GSTIN: {invoice.customerId.gstin}
                    </p>
                  )}
                </div>
              </div>

              {/* Section 3: Items Table */}
              <div className="items-section-print page-break-avoid mb-8">
                <h3 className="text-lg font-semibold mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-zinc-600 dark:text-zinc-400 print:text-gray-700">
                    <thead className="text-xs text-zinc-700 dark:text-zinc-300 uppercase bg-zinc-100 dark:bg-zinc-800 print:bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          #
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Item
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                          Qty
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                          Rate
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                          Tax
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.products.map((product, index) => (
                        <tr
                          key={index}
                          className="border-b dark:border-zinc-700 print:border-gray-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3">{index + 1}</td>
                          <th
                            scope="row"
                            className="px-4 py-3 font-medium text-zinc-900 dark:text-white print:text-black whitespace-nowrap"
                          >
                            {product.id.name}
                          </th>
                          <td className="px-4 py-3 text-right">
                            {product.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">
                            ₹
                            {(product.amount - product.taxAmount) /
                              product.quantity.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            ₹{product.taxAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            ₹{product.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Totals */}
              <div className="totals-section-print flex justify-end mb-8 page-break-avoid">
                <div className="totals-box w-full sm:w-auto sm:min-w-[280px] text-sm">
                  <div className="summary-row flex justify-between py-1.5 px-2">
                    <span className="text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                      Subtotal:
                    </span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.totalDiscount > 0 && (
                    <div className="summary-row flex justify-between py-1.5 px-2">
                      <span className="text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                        Discount:
                      </span>
                      <span>-₹{invoice.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-row flex justify-between py-1.5 px-2">
                    <span className="text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                      Tax:
                    </span>
                    <span>₹{invoice.totalTax.toFixed(2)}</span>
                  </div>
                  {invoice.isRoundedOff &&
                    Math.abs(
                      Math.round(invoice.totalAmount) - invoice.totalAmount
                    ) > 0.001 && (
                      <div className="summary-row flex justify-between py-1.5 px-2">
                        <span className="text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                          Rounded Off:
                        </span>
                        <span>
                          ₹
                          {(
                            Math.round(invoice.totalAmount) -
                            invoice.totalAmount
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                  <div className="summary-row total flex justify-between py-2 px-2 mt-2 border-t-2 border-zinc-300 dark:border-zinc-700 print:border-gray-400">
                    <span className="font-bold text-base">Total:</span>
                    <span className="font-bold text-base">
                      ₹{invoice.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  {invoice.initialPayment > 0 && (
                    <>
                      <div className="summary-row flex justify-between py-1.5 px-2 mt-1">
                        <span className="text-green-600 dark:text-green-500 print:text-green-700 font-semibold">
                          Paid ({invoice.paymentMode}):
                        </span>
                        <span className="text-green-600 dark:text-green-500 print:text-green-700 font-semibold">
                          ₹{invoice.initialPayment.toFixed(2)}
                        </span>
                      </div>
                      <div className="summary-row flex justify-between py-1.5 px-2 text-red-600 dark:text-red-500 print:text-red-700 font-bold text-base">
                        <span>Balance Due:</span>
                        <span>
                          ₹
                          {(
                            invoice.totalAmount - invoice.initialPayment
                          ).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 5: Notes, Bank Details, Signature */}
              <div className="footer-section-print pt-6 border-t dark:border-zinc-700 print:border-gray-300">
                <div className="grid-container grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="page-break-avoid">
                    {invoice.description && (
                      <div className="mb-4">
                        <h4 className="text-base font-semibold mb-1">Notes:</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 print:text-gray-600 whitespace-pre-line">
                          {invoice.description}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-semibold mb-1">
                        Bank Details:
                      </h4>
                      <p className="text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                          Bank:
                        </span>{" "}
                        {invoice.bankDetails.bankName}
                      </p>
                      <p className="text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                          Account No:
                        </span>{" "}
                        {invoice.bankDetails.accountNumber}
                      </p>
                      <p className="text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400 print:text-gray-600">
                          IFSC:
                        </span>{" "}
                        {invoice.bankDetails.ifsc || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="signature-area text-left md:text-right page-break-avoid">
                    <h4 className="text-base font-semibold mb-1 text-left md:text-right">
                      Authorized Signatory:
                    </h4>
                    {selectedSignature && (
                      <img
                        src={selectedSignature.signatureUrl}
                        alt="Signature"
                        className="signature-image h-12 sm:h-14 object-contain mt-4 mb-1 ml-0 md:ml-auto"
                      />
                    )}
                    <p className="font-medium mt-2">
                      {selectedSignature
                        ? selectedSignature.name
                        : invoice.signature?.name || ""}
                      {/* Fallback to empty string instead of company.name for signatory if no specific signature */}
                    </p>
                  </div>
                </div>

                {/* Section 6: Terms & Conditions */}
                {company.termsAndConditions && (
                  <div className="terms-conditions mt-8 pt-4 border-t dark:border-zinc-700 print:border-gray-300 page-break-avoid">
                    <h4 className="text-base font-semibold mb-1">
                      Terms & Conditions:
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 print:text-gray-500 whitespace-pre-line">
                      {company.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ViewInvoiceComponent;
