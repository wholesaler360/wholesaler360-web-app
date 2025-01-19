import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust the path based on your project structure
import { PlusCircle } from "lucide-react";
import { RolesAndPermissionsContext } from "./RolesAndPermissions.control";
import { showNotification } from "@/core/toaster/toast";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTable } from "@/components/datatable/DataTable";

function RolesAndPermissionsComponent() {
  const [data, setData] = useState([]); // Initialize with an empty array
  const { getRoles, columns, refreshTrigger } = useContext(
    RolesAndPermissionsContext
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRoles();
        if (response) {
          setData(response.value.roles);
        }
      } catch (error) {
        showNotification.error("Failed to fetch roles:");
      }
    };
    fetchData();
  }, [getRoles, refreshTrigger]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
  });
  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-1">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-medium">Roles & Permissions</h2>
        <div className="flex items-center ml-auto mr-4">
          <Button>
            <PlusCircle /> Add Role
          </Button>
        </div>
      </div>
      <DataTable table={table} />
    </div>
  );
}

export default RolesAndPermissionsComponent;
