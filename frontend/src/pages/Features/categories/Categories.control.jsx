import { createColumnHelper } from "@tanstack/react-table";
import { createContext, useState, useEffect } from "react";
import {
  axiosGet,
  axiosPost,
  axiosPut,
  axiosDelete,
} from "@/constants/api-context";
import { ButtonV2 } from "@/components/ui/button-v2";
import { Edit } from "lucide-react";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";
import { showNotification } from "@/core/toaster/toast";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  CreateCategory,
  DeleteCategory,
  FetchAllCategories,
  UpdateCategory,
} from "@/constants/apiEndPoints";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const CategoriesContext = createContext({});

function CategoriesController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getCategories = async () => {
    const data = await axiosGet(FetchAllCategories); // Replace with your endpoint
    return data;
  };

  const addCategory = async (value) => {
    try {
      const response = await axiosPost(CreateCategory, {
        name: value.categoryName,
      }); // Replace with your endpoint
      if (response.status === 201) {
        showNotification.success("Category added successfully");
        setRefreshTrigger((prev) => prev + 1);
      } else if (response.status === 409) {
        showNotification.error("Category already exists");
      } else {
        throw new Error("Failed to add category");
      }
    } catch (error) {
      showNotification.error("Failed to add category");
    }
  };

  const updateCategory = async (oldName, newName) => {
    try {
      const response = await axiosPut(UpdateCategory, {
        name: oldName,
        newName,
      });
      if (response.status === 200) {
        showNotification.success("Category updated successfully");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      showNotification.error("Failed to update category");
    }
  };

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("name", {
      id: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.original.name} {/* Change from getValue to original.name */}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("createdAt", {
      id: "createdOn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created On" />
      ),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const [open, setOpen] = useState(false);
        const form = useForm({
          resolver: zodResolver(categoryFormSchema),
          defaultValues: {
            categoryName: row.original.name,
          },
        });

        useEffect(() => {
          if (open) {
            form.reset({
              categoryName: row.original.name,
            });
          }
        }, [open, row.original.name, form]);

        const onSubmitEdit = async (values) => {
          await updateCategory(row.original.name, values.categoryName);
          setOpen(false);
          form.reset();
        };

        const data = {
          name: row.original.name,
        };
        const handleDelete = async () => {
          try {
            const response = await axiosDelete(DeleteCategory, { data }); // Replace with your endpoint
            if (response.status === 204) {
              showNotification.success("Category deleted successfully");
              setRefreshTrigger((prev) => prev + 1);
            }
          } catch (error) {
            showNotification.error("Failed to delete category");
          }
        };

        return (
          <div className="flex space-x-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <ButtonV2
                  variant="ghost"
                  size="icon"
                  className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 "
                  permissionModule="category"
                  permissionAction="update"
                >
                  <Edit className="h-4 w-4" />
                </ButtonV2>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Category</DialogTitle>
                  <DialogDescription>
                    Make changes to the category name.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitEdit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="categoryName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <ButtonV2
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  permissionModule="category"
                  permissionAction="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </ButtonV2>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the category and all associated data.
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
          </div>
        );
      },
    }),
  ];

  return (
    <CategoriesContext.Provider
      value={{
        getCategories,
        addCategory,
        updateCategory,
        columns,
        refreshTrigger,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

const categoryFormSchema = z.object({
  categoryName: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
});

export { CategoriesContext, CategoriesController };
