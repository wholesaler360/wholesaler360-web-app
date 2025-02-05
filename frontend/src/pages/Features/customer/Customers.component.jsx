import { useContext, useEffect, useState } from "react";
import { CustomerContext } from "./Customers.control";
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

function CustomerComponent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { getCustomers, columns, refreshTrigger } = useContext(CustomerContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getCustomers();
        if (response.success) {
          setData(response.value);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        showNotification.error(error.message || "Failed to fetch customers");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getCustomers, refreshTrigger]);

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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-sm text-muted-foreground">
            Manage your customers and their invoices here.
          </p>
        </div>
        <Button className="h-10" onClick={() => navigate("/customer/add")}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Customer
        </Button>
      </div>

      {isLoading ? (
        <DataTableSkeleton
          columnCount={5}
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

export default CustomerComponent;
