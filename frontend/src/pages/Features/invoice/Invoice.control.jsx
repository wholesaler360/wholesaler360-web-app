import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet } from "@/constants/api-context";
import { FetchAllInvoices } from "@/constants/apiEndPoints";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ButtonV2 } from "@/components/ui/button-v2";

export const InvoiceContext = createContext({});

function InvoiceController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

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
              type === "debit"
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
      cell: ({ getValue }) => <span className="capitalize">{getValue()}</span>,
    }),

    columnHelper.accessor("_id", {
      header: "View Invoice",
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start">
            <ButtonV2
              variant="outline"
              effect="ringHover"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/invoice/view/${row.original._id}`);
              }}
              permissionModule="invoice"
              permissionAction="read"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </ButtonV2>
          </div>
        );
      },
    }),
  ];

  return (
    <InvoiceContext.Provider
      value={{
        getInvoices,
        columns,
        refreshTrigger,
        setRefreshTrigger,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export default InvoiceController;
