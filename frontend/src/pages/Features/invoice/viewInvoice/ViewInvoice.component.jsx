import React, { useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ViewInvoiceContext } from "./ViewInvoice.control";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import html2pdf from "html2pdf.js";

function ViewInvoiceComponent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoice, company, isLoading, fetchInvoice, fetchCompanyDetails } =
    useContext(ViewInvoiceContext);
  const invoiceRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
      fetchCompanyDetails();
    }
  }, [id, fetchInvoice, fetchCompanyDetails]);

  const downloadPDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 10,
      filename: `invoice-${invoice?.invoiceNo || "download"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(opt).save();
  };

  const printInvoice = () => {
    const printContent = document.getElementById("invoice-content");
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice?.invoiceNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .header { display: flex; justify-content: space-between; }
            .company-details, .invoice-details { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
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

  // Calculate subtotal (before tax)
  const subtotal = invoice.products.reduce(
    (sum, product) => sum + (product.amount - product.taxAmount),
    0
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/invoices")}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">
              Invoice Details
            </h2>
          </div>
          <div className="flex gap-2">
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

        <Card className="border shadow-sm">
          <CardContent className="p-6" ref={invoiceRef} id="invoice-content">
            {/* Company header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                {company.logoUrl && (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="h-16 object-contain mb-2"
                  />
                )}
                <h2 className="text-2xl font-bold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Phone: {company.mobileNo}
                </p>
                {company.gstin && (
                  <p className="text-sm text-muted-foreground">
                    GSTIN: {company.gstin}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-md bg-primary/10 text-primary font-medium mb-2">
                  {invoice.invoiceNo}
                </div>
                <p className="text-sm text-muted-foreground">
                  Date: {format(new Date(invoice.invoiceDate), "dd MMM yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Due Date:{" "}
                  {format(new Date(invoice.invoiceDueDate), "dd MMM yyyy")}
                </p>
              </div>
            </div>

            {/* Customer details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{invoice.customerId.name}</p>
            </div>

            {/* Product table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="py-3 text-left font-medium">Product</th>
                    <th className="py-3 text-right font-medium">Qty</th>
                    <th className="py-3 text-right font-medium">Unit Price</th>
                    <th className="py-3 text-right font-medium">Tax</th>
                    <th className="py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.products.map((product, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-800"
                    >
                      <td className="py-4">{product.id.name}</td>
                      <td className="py-4 text-right">{product.quantity}</td>
                      <td className="py-4 text-right">
                        ₹{product.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        ₹{product.taxAmount.toFixed(2)}
                      </td>
                      <td className="py-4 text-right font-medium">
                        ₹{product.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {invoice.totalDiscount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>-₹{invoice.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>₹{invoice.totalTax.toFixed(2)}</span>
                </div>
                {invoice.isRoundedOff &&
                  Math.round(invoice.totalAmount) !== invoice.totalAmount && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">
                        Rounded Off:
                      </span>
                      <span>
                        ₹
                        {(
                          Math.round(invoice.totalAmount) - invoice.totalAmount
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                <Separator className="my-2" />
                <div className="flex justify-between py-2 font-bold">
                  <span>Total:</span>
                  <span>₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
                {invoice.initialPayment > 0 && (
                  <>
                    <div className="flex justify-between py-2 text-green-600">
                      <span>Paid ({invoice.paymentMode}):</span>
                      <span>₹{invoice.initialPayment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-red-600">
                      <span>Balance:</span>
                      <span>
                        ₹
                        {(invoice.totalAmount - invoice.initialPayment).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment details */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Bank Details:</h3>
                <p className="text-sm">Bank: {invoice.bankDetails.bankName}</p>
                <p className="text-sm">
                  Account Number: {invoice.bankDetails.accountNumber}
                </p>
              </div>
              <div className="text-right">
                {invoice.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Notes:</h3>
                    <p className="text-sm">{invoice.description}</p>
                  </div>
                )}
                <div className="mt-8">
                  <p className="text-sm font-semibold">
                    {invoice.signature.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Authorized Signatory
                  </p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            {company.termsAndConditions && (
              <div className="mt-8 pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2">
                  Terms & Conditions:
                </h3>
                <p className="text-xs text-muted-foreground">
                  {company.termsAndConditions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ViewInvoiceComponent;
