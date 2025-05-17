import { createContext, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet, axiosPost } from "@/constants/api-context";
import { FetchAllInventories } from "@/constants/apiEndPoints";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";

const StockContext = createContext({});

// Column definitions separated for better readability
const defineColumns = (onProductClick) => {
  const columnHelper = createColumnHelper();
  return [
    // Product Name Column
    columnHelper.accessor("name", {
      header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
      ),
      cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
      </div>
      ),
    }),

    // SKU Code Column
    columnHelper.accessor("skuCode", {
      header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU Code" />
      ),
      cell: ({ getValue }) => (
      <span className="text-sm">{getValue()}</span>
      ),
    }),

    // Category Column
    columnHelper.accessor("category", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ getValue }) => (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          {getValue()}
        </span>
      ),
    }),

    // Product Image Column
    columnHelper.accessor("productImg", {
      header: "Image",
      size: 100,
      maxSize: 100,
      cell: ({ row }) => (
        <div className="flex items-center py-2">
          <img
            src={row.original.productImg}
            alt={row.original.name}
            className="h-16 w-16 rounded-lg object-cover border shadow-sm"
          />
        </div>
      ),
    }),

    // Stock Quantity Column
    columnHelper.accessor("totalQuantity", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock Quantity" />
      ),
      cell: ({ getValue }) => {
        const quantity = getValue();
        const colorClass =
          quantity === 0
            ? "bg-red-50 text-red-700 ring-red-600/20"
            : "bg-green-50 text-green-700 ring-green-600/20";

        return (
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorClass}`}
          >
            {quantity}
          </span>
        );
      },
    }),

    // Actions Column
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onProductClick(row.original)}
            className="flex items-center gap-1"
          >
            <EyeIcon className="h-4 w-4" />
            View Batches
          </Button>
        </div>
      ),
    }),
  ];
};

function StockController({ children }) {
  // API call handler
  const getStock = useCallback(async () => {
    const response = await axiosGet(FetchAllInventories);
    return response.data;
  }, []);

  // Get all batches for a selected product
  const getBatches = useCallback(async (productId) => {
    const response = await axiosGet(`/batch/fetch/${productId}`);
    return response.data;
  }, []);

  // Update batch selling price
  const updateBatchPrice = useCallback(async (data) => {
    const response = await axiosPost("/batch/changeSellPrice", data);
    return response.data;
  }, []);

  // Context provider value
  const contextValue = {
    getStock,
    getBatches,
    updateBatchPrice,
    defineColumns,
  };

  return (
    <StockContext.Provider value={contextValue}>
      {children}
    </StockContext.Provider>
  );
}

export { StockContext, StockController };
