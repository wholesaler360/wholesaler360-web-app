import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust the path based on your project structure
import { PlusCircle } from "lucide-react";
import { RolesAndPermissionsContext } from "./RolesAndPermissions.control";
import { showNotification } from "@/core/toaster/toast";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "@/components/datatable/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTableSkeleton } from "@/components/datatable/DataTableSkeleton";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";

const addRoleSchema = z.object({
  roleName: z.string().min(2, {
    message: "Role name must be at least 2 characters.",
  }),
});

function RolesAndPermissionsComponent() {
  const [data, setData] = useState([]); // Initialize with an empty array
  const [open, setOpen] = useState(false);
  const { getRoles, addRole, columns, refreshTrigger } = useContext(
    RolesAndPermissionsContext
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingRole, setIsAddingRole] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getRoles();
        if (response) {
          setData(response.value.roles);
        }
      } catch (error) {
        showNotification.error(error.response?.data?.message || "Failed to fetch roles:");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getRoles, refreshTrigger]);

  const form = useForm({
    resolver: zodResolver(addRoleSchema),
    defaultValues: {
      roleName: "",
    },
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: "createdOn", desc: true }],
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  const onSubmitNewRole = async (value) => {
    try {
      setIsAddingRole(true);
      await addRole(value);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding role:", error);
    } finally {
      setIsAddingRole(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Roles and Permissions
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage roles and permissions for your users here.
          </p>
        </div>
        <div className="flex items-center ml-auto mr-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="h-10"
                permissionModule="role"
                permissionAction="write"
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Role</DialogTitle>
                <DialogDescription>
                  Enter the role name you want to add.{" "}
                  <u>
                    You can assign the permission to the user once the role is
                    created
                  </u>
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitNewRole)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="roleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isAddingRole} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isAddingRole}>
                      {isAddingRole ? "Adding..." : "Add Role"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {isLoading ? (
        <DataTableSkeleton
          columnCount={5}
          rowCount={5}
          searchableColumnCount={1}
          filterableColumnCount={0}
          showViewOptions={true}
          cellWidths={["200px", "150px", "150px", "150px", "100px"]}
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

export default RolesAndPermissionsComponent;
