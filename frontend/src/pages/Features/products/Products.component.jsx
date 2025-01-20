import { useContext, useEffect, useState } from "react";
import { ProductsContext } from "./Products.control";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import { DataTable } from "@/components/datatable/DataTable";
import { DataTableSkeleton } from "@/components/datatable/DataTableSkeleton";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";

export function ProductsComponent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { getProducts, columns, refreshTrigger } = useContext(ProductsContext);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getProducts();
        if (response.success) {
          setData(response.value.product);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch products",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getProducts, refreshTrigger, toast]);

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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <DataTableSkeleton
          columnCount={7}
          rowCount={5}
          searchableColumnCount={1}
          filterableColumnCount={0}
          showViewOptions={true}
        />
      ) : (
        <DataTable
          table={table}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      )}
    </div>
  );
}

