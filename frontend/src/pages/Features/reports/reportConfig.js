import {
  FetchAllCustomers,
  FetchAllVendors,
  FetchAllProducts,
  FetchAllInvoices,
  FetchAllPurchases,
  FetchAllPayments,
  FetchAllInventories,
} from "@/constants/apiEndPoints";

export const REPORT_TYPES = {
  invoices: {
    label: "Invoices",
    endpoint: FetchAllInvoices,
    dateField: "invoiceDate",
    columns: [
      { key: "invoiceNo", header: "Invoice No" },
      { key: "customerName", header: "Customer" },
      { key: "invoiceDate", header: "Date", type: "date" },
      { key: "totalAmount", header: "Total Amount", type: "currency" },
      { key: "initialPayment", header: "Initial Payment", type: "currency" },
      { key: "transactionType", header: "Type" },
      { key: "paymentMode", header: "Payment Mode" },
    ],
    summaryFields: [
      { label: "Total Invoices", type: "count" },
      { label: "Total Amount", type: "sum", key: "totalAmount" },
      { label: "Total Received", type: "sum", key: "initialPayment" },
      {
        label: "Outstanding",
        type: "computed",
        compute: (data) => {
          const total = data.reduce((s, r) => s + (Number(r.totalAmount) || 0), 0);
          const paid = data.reduce((s, r) => s + (Number(r.initialPayment) || 0), 0);
          return total - paid;
        },
      },
    ],
  },
  purchases: {
    label: "Purchases",
    endpoint: FetchAllPurchases,
    dateField: "purchaseDate",
    columns: [
      { key: "purchaseNo", header: "Purchase No" },
      { key: "vendorName", header: "Vendor" },
      { key: "purchaseDate", header: "Date", type: "date" },
      { key: "totalAmount", header: "Total Amount", type: "currency" },
      { key: "initialPayment", header: "Initial Payment", type: "currency" },
      { key: "transactionType", header: "Type" },
      { key: "paymentMode", header: "Payment Mode" },
    ],
    summaryFields: [
      { label: "Total Purchases", type: "count" },
      { label: "Total Amount", type: "sum", key: "totalAmount" },
      { label: "Total Paid", type: "sum", key: "initialPayment" },
      {
        label: "Outstanding",
        type: "computed",
        compute: (data) => {
          const total = data.reduce((s, r) => s + (Number(r.totalAmount) || 0), 0);
          const paid = data.reduce((s, r) => s + (Number(r.initialPayment) || 0), 0);
          return total - paid;
        },
      },
    ],
  },
  payments: {
    label: "Payments",
    endpoint: FetchAllPayments,
    dateField: "createdAt",
    columns: [
      { key: "createdAt", header: "Date", type: "date" },
      {
        key: "name",
        header: "Name",
        accessor: (row) => row.customerName || row.vendorName,
      },
      { key: "amount", header: "Amount", type: "currency" },
      { key: "transactionType", header: "Type" },
      { key: "paymentMode", header: "Payment Mode" },
      { key: "description", header: "Description" },
    ],
    summaryFields: [
      { label: "Total Transactions", type: "count" },
      {
        label: "Total Credit",
        type: "computed",
        compute: (data) =>
          data
            .filter((r) => r.transactionType === "credit")
            .reduce((s, r) => s + (Number(r.amount) || 0), 0),
      },
      {
        label: "Total Debit",
        type: "computed",
        compute: (data) =>
          data
            .filter((r) => r.transactionType === "debit")
            .reduce((s, r) => s + (Number(r.amount) || 0), 0),
      },
      {
        label: "Net Amount",
        type: "computed",
        compute: (data) => {
          const credit = data
            .filter((r) => r.transactionType === "credit")
            .reduce((s, r) => s + (Number(r.amount) || 0), 0);
          const debit = data
            .filter((r) => r.transactionType === "debit")
            .reduce((s, r) => s + (Number(r.amount) || 0), 0);
          return credit - debit;
        },
      },
    ],
  },
  customers: {
    label: "Customers",
    endpoint: FetchAllCustomers,
    dateField: "createdAt",
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "mobileNo", header: "Mobile" },
      { key: "totalNoOFInvoice", header: "Invoices" },
      { key: "receivableBalance", header: "Balance", type: "currency" },
      { key: "createdAt", header: "Created On", type: "date" },
    ],
    summaryFields: [
      { label: "Total Customers", type: "count" },
      { label: "Total Receivable", type: "sum", key: "receivableBalance" },
      { label: "Total Invoices", type: "sum", key: "totalNoOFInvoice" },
    ],
  },
  vendors: {
    label: "Vendors",
    endpoint: FetchAllVendors,
    dateField: "createdAt",
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "mobileNo", header: "Mobile" },
      { key: "payableBalance", header: "Balance", type: "currency" },
      { key: "createdAt", header: "Created On", type: "date" },
    ],
    summaryFields: [
      { label: "Total Vendors", type: "count" },
      { label: "Total Payable", type: "sum", key: "payableBalance" },
    ],
  },
  products: {
    label: "Products",
    endpoint: FetchAllProducts,
    dateField: null,
    responseExtractor: (data) => data.value?.[0]?.product || [],
    columns: [
      { key: "name", header: "Product Name" },
      { key: "skuCode", header: "SKU Code" },
      { key: "category", header: "Category" },
      { key: "salePrice", header: "Sale Price", type: "currency" },
      { key: "alertQuantity", header: "Alert Qty" },
    ],
    summaryFields: [
      { label: "Total Products", type: "count" },
      {
        label: "Avg. Sale Price",
        type: "computed",
        compute: (data) => {
          if (!data.length) return 0;
          return data.reduce((s, r) => s + (Number(r.salePrice) || 0), 0) / data.length;
        },
      },
      {
        label: "Low Stock Items",
        type: "computed",
        compute: (data) =>
          data.filter((r) => Number(r.alertQuantity) > 0).length,
        format: "number",
      },
    ],
  },
  stock: {
    label: "Stock",
    endpoint: FetchAllInventories,
    dateField: null,
    responseExtractor: (data) => data.value?.product || [],
    columns: [
      { key: "name", header: "Product Name" },
      { key: "skuCode", header: "SKU Code" },
      { key: "category", header: "Category" },
      { key: "totalQuantity", header: "Quantity" },
    ],
    summaryFields: [
      { label: "Total Products", type: "count" },
      { label: "Total Stock Qty", type: "sum", key: "totalQuantity", format: "number" },
      {
        label: "Out of Stock",
        type: "computed",
        compute: (data) =>
          data.filter((r) => !r.totalQuantity || Number(r.totalQuantity) === 0).length,
        format: "number",
      },
    ],
  },
};

export const REPORT_TYPE_OPTIONS = [
  { value: "invoices", label: "Invoices" },
  { value: "purchases", label: "Purchases" },
  { value: "payments", label: "Payments" },
  { value: "customers", label: "Customers" },
  { value: "vendors", label: "Vendors" },
  { value: "products", label: "Products" },
  { value: "stock", label: "Stock" },
];
