import {
  assignPermission,
  FetchAllRoles,
  FetchRolePermission,
  UpdateRole,
} from "@/constants/apiEndPoints";
import { axiosGet, axiosPost, axiosPut } from "@/constants/api-context";
import { createColumnHelper } from "@tanstack/react-table";
import { createContext, useState, useEffect, useCallback } from "react";
import { ButtonV2 } from "@/components/ui/button-v2";
import { Edit, IdCard } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showNotification } from "@/core/toaster/toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getNumberFromPermissions,
  getPermissionsFromNumber,
} from "@/lib/roleUtils";

const roleFormSchema = z.object({
  roleName: z.string().min(2, {
    message: "Role name must be at least 2 characters.",
  }),
});

// context to manage roles and permissions
const RolesAndPermissionsContext = createContext({});

// RolesAndPermissionController component
function RolesAndPermissionController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getRoles = async () => {
    const data = await axiosGet(FetchAllRoles);
    return data;
  };

  // Create columns for the table
  const columnHelper = createColumnHelper();

  const columns = [
    // Accessor column for "role"
    columnHelper.accessor("name", {
      id: "role",
      header: "Role",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("role")}
            </span>
          </div>
        );
      },
    }),

    // Accessor column for "createdOn"
    columnHelper.accessor("createdAt", {
      id: "createdOn",
      header: "Created On",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(), // Format date
    }),

    // Display column for "Edit Row" button
    columnHelper.display({
      id: "editRow",
      header: "Edit Row",
      cell: ({ row }) => {
        const [open, setOpen] = useState(false);
        const form = useForm({
          resolver: zodResolver(roleFormSchema),
          defaultValues: {
            roleName: row.original.name,
          },
        });

        const updateRole = async (oldName, newName) => {
          try {
            await axiosPut(UpdateRole, { name: oldName, newName });
            showNotification.success("Role updated successfully");
            setRefreshTrigger((prev) => prev + 1);
          } catch (error) {
            showNotification.error("Failed to update role");
          }
        };

        // Reset form with current row data when dialog opens
        useEffect(() => {
          if (open) {
            form.reset({
              roleName: row.original.name,
            });
          }
        }, [open, row.original.name, form]);

        const onSubmitRoleForm = async (values) => {
          await updateRole(row.original.name, values.roleName);
          setOpen(false); // Close dialog after successful submission
          form.reset(); // Reset form
        };

        return (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <ButtonV2
                effect="expandIcon"
                icon={Edit}
                iconPlacement="left"
                className="h-8"
              >
                Edit Role
              </ButtonV2>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Role</DialogTitle>
                <DialogDescription>
                  Make changes to your role here.{" "}
                  <u>Click save when you're done.</u>
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitRoleForm)}
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
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        );
      },
    }),

    // Display column for "Edit Permissions" button
    columnHelper.display({
      id: "editPermissions",
      header: "Edit Permissions",
      cell: ({ row }) => {
        const [open, setOpen] = useState(false);
        const [rolePermissions, setRolePermissions] = useState(null);
        const [updatedPermissions, setUpdatedPermissions] = useState({});

        const fetchRolePermissions = useCallback(async () => {
          try {
            const response = await axiosPost(FetchRolePermission, {
              name: row.original.name,
            });
            if (response.status === 200) {
              setRolePermissions(response.data.value);
            }
          } catch (error) {
            showNotification.error("Failed to fetch permissions");
          }
        }, [row.original.name]);

        useEffect(() => {
          if (open) {
            fetchRolePermissions();
          }
        }, [open, fetchRolePermissions]);

        // Initialize or update permissions when role data is fetched
        useEffect(() => {
          if (rolePermissions?.sections) {
            const initialPermissions = {};
            rolePermissions.sections.forEach((section) => {
              initialPermissions[section.module._id] = getPermissionsFromNumber(
                section.permission
              );
            });
            setUpdatedPermissions(initialPermissions);
          }
        }, [rolePermissions]);

        const handlePermissionChange = (moduleId, permissionType) => {
          setUpdatedPermissions((prev) => ({
            ...prev,
            [moduleId]: {
              ...prev[moduleId],
              [permissionType]: !prev[moduleId][permissionType],
            },
          }));
        };

        const handleSubmit = async () => {
          try {
            const payload = {
              name: row.original.name,
              sections: rolePermissions.sections.map((section) => ({
                module: section.module.name,
                permission: getNumberFromPermissions(
                  updatedPermissions[section.module._id]
                ),
              })),
            };

            const response = await axiosPut(assignPermission, payload);
            if (response.status === 201) {
              showNotification.success("Permissions updated successfully");
            }
            setOpen(false);
          } catch (error) {
            showNotification.error("Failed to update permissions");
          }
        };

        return (
          <>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <ButtonV2
                  variant="outline"
                  className="h-10"
                  effect="hoverUnderline"
                >
                  <IdCard />
                  Edit Permissions
                </ButtonV2>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>
                    Edit Permissions for {row.original.name}
                  </DialogTitle>
                  <DialogDescription>
                    Configure module permissions below.
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Module</TableHead>
                        <TableHead className="text-center">Read</TableHead>
                        <TableHead className="text-center">Write</TableHead>
                        <TableHead className="text-center">Update</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rolePermissions?.sections?.map((section) => {
                        const permissions =
                          updatedPermissions[section.module._id] || {};
                        return (
                          <TableRow key={section.module._id}>
                            <TableCell className="font-medium capitalize">
                              {section.module.name}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                id={`${section.module._id}-read`}
                                checked={permissions.read}
                                onCheckedChange={() =>
                                  handlePermissionChange(
                                    section.module._id,
                                    "read"
                                  )
                                }
                                className="mx-auto"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                id={`${section.module._id}-write`}
                                checked={permissions.write}
                                onCheckedChange={() =>
                                  handlePermissionChange(
                                    section.module._id,
                                    "write"
                                  )
                                }
                                className="mx-auto"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                id={`${section.module._id}-update`}
                                checked={permissions.update}
                                onCheckedChange={() =>
                                  handlePermissionChange(
                                    section.module._id,
                                    "update"
                                  )
                                }
                                className="mx-auto"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                id={`${section.module._id}-delete`}
                                checked={permissions.delete}
                                onCheckedChange={() =>
                                  handlePermissionChange(
                                    section.module._id,
                                    "delete"
                                  )
                                }
                                className="mx-auto"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <DialogFooter>
                  <Button onClick={handleSubmit} type="button">
                    Save permissions
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      },
    }),
  ];

  return (
    <RolesAndPermissionsContext.Provider
      value={{ getRoles, columns, refreshTrigger }}
    >
      {children}
    </RolesAndPermissionsContext.Provider>
  );
}

export { RolesAndPermissionsContext, RolesAndPermissionController };
