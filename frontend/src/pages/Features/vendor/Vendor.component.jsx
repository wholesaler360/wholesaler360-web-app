import React from "react";
import { useContext, useEffect, useState } from "react";
import { VendorContext } from "./Vendor.control";
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
import { useNavigate } from "react-router-dom";

function VendorComponent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { getVendors, columns, refreshTrigger } = useContext(VendorContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getVendors();
        if (response.success) {
          setData(response.value);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        showNotification.error(error.response?.data?.message || "Failed to fetch vendors");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getVendors, refreshTrigger]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  const handleRowClick = (row) => {
    navigate(`/vendor/details/${row.original.mobileNo}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
          <p className="text-sm text-muted-foreground">
            Manage your vendors and their ledgers here.
          </p>
        </div>
        <Button
          className="h-10"
          onClick={() => navigate("/vendor/add")}
          permissionModule="vendor"
          permissionAction="write"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Vendor
        </Button>
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
            onRowClick={handleRowClick}
          />
        </div>
      )}
    </div>
  );
}

export default VendorComponent;
