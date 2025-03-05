import { useContext, useEffect, useState } from "react";
import { UsersContext } from "./Users.control";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
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

export function UsersComponent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { getUsers, columns, refreshTrigger } = useContext(UsersContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getUsers();
        setData(response?.value || []);
      } catch (error) {
        console.error(error);
        showNotification.error("Failed to fetch users");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getUsers, refreshTrigger]);

  const handleAddUser = () => {
    navigate("/user/add");
  };

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
    <div className="flex flex-1 flex-col gap-4 p-4 ">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their account permissions here.
          </p>
        </div>
        <Button
          className="h-10"
          onClick={handleAddUser}
          permissionModule="user"
          permissionAction="write"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add User
        </Button>
      </div>

      {isLoading ? (
        <DataTableSkeleton
          columnCount={5}
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
