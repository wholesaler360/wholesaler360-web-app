import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust the path based on your project structure
import { PlusCircle } from "lucide-react";
import { RolesAndPermissionsContext } from "./RolesAndPermissions.control";
import { showNotification } from "@/core/toaster/toast";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card"; // Import ShadCN card
import { Link } from "react-router-dom"; // Import Link for navigation

function RolesAndPermissionsComponent() {
  const [data, setData] = useState([]); // Initialize with an empty array
  const { getRoles, columns } = useContext(RolesAndPermissionsContext);

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
  }, [getRoles]);

  console.log(data);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
      <div className="flex flex-col gap-4">
        <Table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </thead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                <TableCell>
                  <Card>
                    <Button as={Link} to={`/permissions/${row.original.name}`}>
                      Edit
                    </Button>
                  </Card>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default RolesAndPermissionsComponent;
