import {
  assignPermission,
  createRole,
  deleteRole,
  FetchAllRoles,
  FetchRolePermission,
  UpdateRole,
} from "@/constants/apiEndPoints";
import {
  axiosGet,
  axiosPost,
  axiosPut,
  axiosDelete,
} from "@/constants/api-context";
import { createColumnHelper } from "@tanstack/react-table";
import { createContext, useState, useEffect, useCallback } from "react";
import { ButtonV2 } from "@/components/ui/button-v2";
import { Delete, Edit, IdCard, Trash } from "lucide-react";
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
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";
import { usePermission } from "@/hooks/usePermission";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const { hasWritePermission, hasUpdatePermission, hasDeletePermission } =
    usePermission();

  const getRoles = async () => {
    const data = await axiosGet(FetchAllRoles);
    return data;
  };

  const addRole = async (value) => {
    try {
      const response = await axiosPost(createRole, { name: value.roleName });
      if (response.status === 201) {
        showNotification.success("Role added successfully");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        showNotification.error("Failed to add role");
      }
    } catch (error) {
      showNotification.error("Failed to add role");
    }
  };

  // Create columns for the table
  const columnHelper = createColumnHelper();

  const columns = [
    // Accessor column for "role"
    columnHelper.accessor("name", {
      id: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created On" />
      ),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(), // Format date
    }),

    // Display column for "Edit Role" button
    columnHelper.display({
      id: "editRow",
      header: "Edit Role",
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
                permissionModule="role"
                permissionAction="update"
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
        const [selectAll, setSelectAll] = useState(false);

        const fetchRolePermissions = useCallback(async () => {
          try {
            const response = await axiosPost(FetchRolePermission, {
              name: row.original.name,
            });
            if (response.status === 200) {
              setRolePermissions(response.data.value);
            } else {
              showNotification.error("Failed to fetch permissions");
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

        const handleSelectAll = (checked) => {
          setSelectAll(checked);
          const newPermissions = {};
          rolePermissions?.sections.forEach((section) => {
            newPermissions[section.module._id] = {
              read: checked,
              write: checked,
              update: checked,
              delete: checked,
            };
          });
          setUpdatedPermissions(newPermissions);
        };

        const handleSelectAllForModule = (moduleId, checked) => {
          setUpdatedPermissions((prev) => ({
            ...prev,
            [moduleId]: {
              read: checked,
              write: checked,
              update: checked,
              delete: checked,
            },
          }));
        };

        const handlePermissionChange = (moduleId, permissionType) => {
          setUpdatedPermissions((prev) => {
            const newPermissions = {
              ...prev,
              [moduleId]: {
                ...prev[moduleId],
                [permissionType]: !prev[moduleId][permissionType],
              },
            };

            // If read permission is being disabled, disable all other permissions
            if (permissionType === "read" && !newPermissions[moduleId].read) {
              newPermissions[moduleId].write = false;
              newPermissions[moduleId].update = false;
              newPermissions[moduleId].delete = false;
            }

            return newPermissions;
          });
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
            console.log(response);
            if (response.data.success) {
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
                  permissionModule="role"
                  permissionAction="update"
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
                        <TableHead className="text-center">
                          Select All
                        </TableHead>
                        <TableHead className="text-center">Read</TableHead>
                        <TableHead className="text-center">Write</TableHead>
                        <TableHead className="text-center">Update</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead>All Modules</TableHead>
                        <TableHead className="text-center">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                            className="mx-auto"
                          />
                        </TableHead>
                        <TableHead colSpan={4} />
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
                                checked={
                                  permissions.read &&
                                  permissions.write &&
                                  permissions.update &&
                                  permissions.delete
                                }
                                onCheckedChange={(checked) =>
                                  handleSelectAllForModule(
                                    section.module._id,
                                    checked
                                  )
                                }
                                className="mx-auto"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
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
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Checkbox
                                        checked={permissions.write}
                                        onCheckedChange={() =>
                                          handlePermissionChange(
                                            section.module._id,
                                            "write"
                                          )
                                        }
                                        disabled={!permissions.read}
                                        className="mx-auto"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  {!permissions.read && (
                                    <TooltipContent>
                                      <p>
                                        Enable read permission first to assign
                                        write permission
                                      </p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Checkbox
                                        checked={permissions.update}
                                        onCheckedChange={() =>
                                          handlePermissionChange(
                                            section.module._id,
                                            "update"
                                          )
                                        }
                                        disabled={!permissions.read}
                                        className="mx-auto"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  {!permissions.read && (
                                    <TooltipContent>
                                      <p>
                                        Enable read permission first to assign
                                        update permission
                                      </p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Checkbox
                                        checked={permissions.delete}
                                        onCheckedChange={() =>
                                          handlePermissionChange(
                                            section.module._id,
                                            "delete"
                                          )
                                        }
                                        disabled={!permissions.read}
                                        className="mx-auto"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  {!permissions.read && (
                                    <TooltipContent>
                                      <p>
                                        Enable read permission first to assign
                                        delete permission
                                      </p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
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

    columnHelper.display({
      id: "deleteRole",
      header: "Delete Role",
      cell: ({ row }) => {
        const data = {
          name: row.original.name,
        };
        const handleDelete = async () => {
          try {
            const response = await axiosDelete(deleteRole, { data });
            if (response.status === 204) {
              showNotification.success("Role deleted successfully");
              setRefreshTrigger((prev) => prev + 1);
            } else {
              showNotification.error("Failed to delete role");
            }
          } catch (error) {
            showNotification.error("Failed to delete role");
          }
        };

        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                permissionModule="role"
                permissionAction="delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete the role "{row.original.name}
                  "?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  role "{row.original.name}" and remove all associated
                  permissions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    }),
  ];

  return (
    <RolesAndPermissionsContext.Provider
      value={{ getRoles, addRole, columns, refreshTrigger }}
    >
      {children}
    </RolesAndPermissionsContext.Provider>
  );
}

export { RolesAndPermissionsContext, RolesAndPermissionController };
