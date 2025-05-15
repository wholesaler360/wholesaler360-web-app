import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet } from "@/constants/api-context";
import { FetchAllPurchases } from "@/constants/apiEndPoints";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";

export const PurchasesContext = createContext({});

function PurchasesController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getPurchases = useCallback(async () => {
    const response = await axiosGet(FetchAllPurchases);
    return response.data;
  }, []);

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("purchaseNo", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Purchase No" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-medium">{row.getValue("purchaseNo")}</span>
        </div>
      ),
    }),

    columnHelper.accessor("vendorName", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vendor" />
      ),
      id: "vendorName",
    }),

    columnHelper.accessor("purchaseDate", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Purchase Date" />
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
      cell: ({ getValue }) => <span className="capitalize">{getValue()}</span>,
    }),
  ];

  return (
    <PurchasesContext.Provider
      value={{ getPurchases, columns, refreshTrigger, setRefreshTrigger }}
    >
      {children}
    </PurchasesContext.Provider>
  );
}

export default PurchasesController;
