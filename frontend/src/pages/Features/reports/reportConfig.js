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
