import { useContext, useEffect, useState } from "react";
import { PaymentsContext } from "./Payments.control";
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

function PaymentsComponent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { getPayments, columns, refreshTrigger } = useContext(PaymentsContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getPayments();
        if (response.success) {
          setData(response.value);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        showNotification.error(error.message || "Failed to fetch payments");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getPayments, refreshTrigger]);

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
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-sm text-muted-foreground">
            Your all the payments history.
          </p>
        </div>
      </div>

      {isLoading ? (
        <DataTableSkeleton
          columnCount={6}
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

export default PaymentsComponent;
