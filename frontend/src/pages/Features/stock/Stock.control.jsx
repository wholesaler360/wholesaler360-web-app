import { createContext, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet } from "@/constants/api-context";
import { FetchAllInventories } from "@/constants/apiEndPoints";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";

const StockContext = createContext({});

function StockController({ children }) {
  const getStock = useCallback(async () => {
    const response = await axiosGet(FetchAllInventories);
    return response;
  }, []);

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("productInfo.name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product Name" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.productInfo.name}</span>
            <span className="text-sm text-muted-foreground">
              {row.original.productInfo.skuCode}
            </span>
          </div>
        ),
      }),

      columnHelper.accessor("productInfo.category", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ getValue }) => (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {getValue()}
          </span>
        ),
      }),

    columnHelper.accessor("productInfo.productImg", {
      header: "Image",
      size: 100,
      maxSize: 100,
      cell: ({ row }) => (
        <div className="flex items-center py-2">
          <img
            src={row.original.productInfo.productImg}
            alt={row.original.productInfo.name}
            className="h-16 w-16 rounded-lg object-cover border shadow-sm"
          />
        </div>
      ),
    }),

    

   

    columnHelper.accessor("productInfo.totalQuantity", {
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
  ];

  return (
    <StockContext.Provider
      value={{
        getStock,
        columns,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export { StockContext, StockController };
