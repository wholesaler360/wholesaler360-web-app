import { useContext, useEffect, useState, useCallback } from "react";
import { StockContext } from "./Stock.control";
import { DataTable } from "@/components/datatable/DataTable";
import { DataTableSkeleton } from "@/components/datatable/DataTableSkeleton";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { showNotification } from "@/core/toaster/toast";
import { BatchList } from "./components/BatchList";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export function StockComponent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { getStock, defineColumns } = useContext(StockContext);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBackClick = () => {
    setSelectedProduct(null);
  };

  const columns = defineColumns(handleProductClick);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getStock();
        setData(response?.value?.product || []);
      } catch (error) {
        console.error("Failed to fetch stock:", error);
        showNotification.error(error.response?.data?.message || "Failed to fetch stock");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getStock]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  if (selectedProduct) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="h-8 w-8"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {selectedProduct.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              SKU: {selectedProduct.skuCode} | Category:{" "}
              {selectedProduct.category}
            </p>
          </div>
        </div>
        <BatchList productId={selectedProduct.id} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Stock</h2>
        <p className="text-sm text-muted-foreground">
          Monitor and manage your product stock levels.
        </p>
      </div>

      {isLoading ? (
        <DataTableSkeleton
          columnCount={4}
          rowCount={5}
          searchableColumnCount={1}
          filterableColumnCount={0}
          showViewOptions={true}
        />
      ) : (
        <div className="relative">
          <DataTable
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      )}
    </div>
  );
}
