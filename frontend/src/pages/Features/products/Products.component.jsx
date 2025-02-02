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
import { showNotification } from "@/core/toaster/toast";
import { Navigate, useNavigate } from "react-router-dom";

export function ProductsComponent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { getProducts, columns, refreshTrigger } = useContext(ProductsContext);
  const navigate = useNavigate(); // Fixed casing

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getProducts();

        // Handle different response structures
        const productsData = response?.value[0]?.product;
        setData(productsData);
      } catch (error) {
        console.log(error);
        showNotification.error("Failed to fetch products");
        setData([]); // Ensure data is always an array
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getProducts, refreshTrigger]);

  const handleAddProduct = () => {
    navigate("/product/add");
  };

  // Move table initialization after data is loaded
  const table = useReactTable({
    data: Array.isArray(data) ? data : [], // Ensure data is always an array
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage your product inventory and details here.
          </p>
        </div>
        <Button
          className="h-10"
          onClick={() => {
            handleAddProduct();
          }}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
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
          className="p-4"
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
