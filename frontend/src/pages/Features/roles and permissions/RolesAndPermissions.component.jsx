import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust the path based on your project structure
import { PlusCircle } from "lucide-react";
import { RolesAndPermissionsContext } from "./RolesAndPermissions.control";
import { showNotification } from "@/core/toaster/toast";
import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,  
        pageIndex: 0   
      }
    },
  });

  const onSubmitNewRole = async (value) => {
    await addRole(value);
    setOpen(false);
    form.reset();
  };
  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-1">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-medium">Roles & Permissions</h2>
        <div className="flex items-center ml-auto mr-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle /> Add Role
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Add Role</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable table={table} />
    </div>
  );
}

export default RolesAndPermissionsComponent;
