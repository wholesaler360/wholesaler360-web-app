import { createContext, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet, axiosPost } from "@/constants/api-context";
import { FetchVendorLedgers, CreateVendorLedger } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";

const VendorLedgerContext = createContext({});

function VendorLedgerController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getLedgerEntries = async (vendorId) => {
    try {
      const response = await axiosPost(FetchVendorLedgers, { vendorId });
      if (response.data?.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to fetch vendor ledger");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to fetch vendor ledger");
    }
  };

  const createLedgerEntry = async (data) => {
    try {
      const response = await axiosPost(CreateVendorLedger, data);
      if (response.data?.success) {
        showNotification.success("Ledger entry created successfully");
        setRefreshTrigger(prev => prev + 1);
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to create ledger entry");
      }
    } catch (error) {
      showNotification.error(error.message || "Failed to create ledger entry");
      throw error;
    }
  };

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("date", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
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
      cell: ({ getValue }) => (
        <span className="capitalize">{getValue()}</span>
      ),
    }),

    columnHelper.accessor("payableBalance", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payable Balance" />
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
    <VendorLedgerContext.Provider value={{ 
      getLedgerEntries, 
      columns, 
      createLedgerEntry,
      refreshTrigger 
    }}>
      {children}
    </VendorLedgerContext.Provider>
  );
}

export { VendorLedgerContext, VendorLedgerController };
