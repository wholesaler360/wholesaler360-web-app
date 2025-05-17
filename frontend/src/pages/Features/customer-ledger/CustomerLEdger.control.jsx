import { createContext, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet, axiosPost } from "@/constants/api-context";
import {
  FetchCustomerLedgers,
  CreateCustomerLedger,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";

const CustomerLedgerContext = createContext({});

function CustomerLedgerController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getLedgerEntries = async (customerId) => {
    try {
      const response = await axiosGet(`${FetchCustomerLedgers}/${customerId}`);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch customer ledger"
        );
      }
    } catch (error) {
      throw new Error(error.message || "Failed to fetch customer ledger");
    }
  };

  const createLedgerEntry = async (data) => {
    try {
      const response = await axiosPost(CreateCustomerLedger, data);
      if (response.data?.success) {
        showNotification.success("Ledger entry created successfully");
        setRefreshTrigger((prev) => prev + 1);
        return response.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to create ledger entry"
        );
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to create ledger entry");
      throw error;
    }
  };

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      },
    }),

    columnHelper.accessor("date", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ledger Date" />
      ),
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      },
    }),

    columnHelper.accessor("transactionType", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ getValue }) => (
        <span
          className={`capitalize font-medium ${
            getValue() === "debit" ? "text-red-600" : "text-green-600"
          }`}
        >
          {getValue()}
        </span>
      ),
    }),

    columnHelper.accessor("amount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row, getValue }) => (
        <span
          className={`font-medium ${
            row.original.transactionType === "debit"
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          ₹{getValue().toLocaleString("en-IN")}
        </span>
      ),
    }),

    columnHelper.accessor("paymentMode", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Mode" />
      ),
      cell: ({ getValue }) => <span className="capitalize">{getValue()}</span>,
    }),

    columnHelper.accessor("receivableBalance", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Receivable Balance" />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">
          ₹{getValue().toLocaleString("en-IN")}
        </span>
      ),
    }),

    columnHelper.accessor("description", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
    }),

    
  ];

  return (
    <CustomerLedgerContext.Provider
      value={{
        getLedgerEntries,
        columns,
        createLedgerEntry,
        refreshTrigger,
      }}
    >
      {children}
    </CustomerLedgerContext.Provider>
  );
}

export { CustomerLedgerContext, CustomerLedgerController };
