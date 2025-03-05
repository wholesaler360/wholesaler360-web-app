import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet } from "@/constants/api-context";
import { FetchAllInvoices } from "@/constants/apiEndPoints";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";

export const InvoiceContext = createContext({});

function InvoiceController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getInvoices = useCallback(async () => {
    const response = await axiosGet(FetchAllInvoices);
    return response.data;
  }, []);

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("invoiceNo", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice No" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-medium">{row.getValue("invoiceNo")}</span>
        </div>
      ),
    }),

    columnHelper.accessor("customerName", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
    }),

    columnHelper.accessor("invoiceDate", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice Date" />
      ),
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <span className="text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    }),

    columnHelper.accessor("totalAmount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">
          ₹{getValue().toLocaleString("en-IN")}
        </span>
      ),
    }),

    columnHelper.accessor("initialPayment", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Initial Payment" />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">
          ₹{getValue().toLocaleString("en-IN")}
        </span>
      ),
    }),

    columnHelper.accessor("transactionType", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ getValue }) => {
        const type = getValue();
        return (
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
              type === "credit"
                ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                : "bg-green-50 text-green-700 ring-green-600/20"
            }`}
          >
            {type}
          </span>
        );
      },
    }),

    columnHelper.accessor("paymentMode", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Mode" />
      ),
      cell: ({ getValue }) => (
        <span className="capitalize">{getValue()}</span>
      ),
    }),
  ];

  return (
    <InvoiceContext.Provider value={{ getInvoices, columns, refreshTrigger }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export default InvoiceController;
