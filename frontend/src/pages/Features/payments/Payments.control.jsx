import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet } from "@/constants/api-context";
import { FetchAllPayments } from "@/constants/apiEndPoints";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";

export const PaymentsContext = createContext({});

function PaymentsController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getPayments = useCallback(async () => {
    const response = await axiosGet(FetchAllPayments);
    return response.data;
  }, []);

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
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

    columnHelper.accessor(row => row.customerName || row.vendorName, {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <span className="font-medium">{getValue()}</span>
        </div>
      ),
    }),

    columnHelper.accessor("amount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
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
                ? "bg-green-50 text-green-700 ring-green-600/20"
                : "bg-red-50 text-red-700 ring-red-600/20"
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

    columnHelper.accessor("description", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue() || "-"}</span>
      ),
    }),
  ];

  return (
    <PaymentsContext.Provider value={{ getPayments, columns, refreshTrigger }}>
      {children}
    </PaymentsContext.Provider>
  );
}

export default PaymentsController;
