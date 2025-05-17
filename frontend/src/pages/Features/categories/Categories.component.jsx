import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CategoriesContext } from "./Categories.control";
import { showNotification } from "@/core/toaster/toast";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "@/components/datatable/DataTable";
import { DataTableSkeleton } from "@/components/datatable/DataTableSkeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const addCategorySchema = z.object({
  categoryName: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
});

function CategoriesComponent() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { getCategories, addCategory, columns, refreshTrigger } =
    useContext(CategoriesContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getCategories();
        if (response?.value?.categories) {
          // Update to match your API response structure
          setData(response.value.categories);
        } else {
          setData([]); // Ensure data is always an array
        }
      } catch (error) {
        showNotification.error(error.response?.data?.message || "Failed to fetch categories");
        setData([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getCategories, refreshTrigger]);

  const form = useForm({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      categoryName: "",
    },
  });

  const table = useReactTable({
    data: data || [], // Ensure data is never undefined
    columns,
    getCoreRowModel: getCoreRowModel(), // Add this line
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "createdOn", desc: true }],
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  const onSubmit = async (values) => {
    await addCategory(values);
    setOpen(false);
    form.reset();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your product categories here.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button permissionModule="category" permissionAction="write">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>
                  Enter a name for the new category.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
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
                    <Button type="submit">Add Category</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {isLoading ? (
        <DataTableSkeleton
          columnCount={3}
          rowCount={5}
          searchableColumnCount={1}
          showViewOptions={true}
          cellWidths={["300px", "200px", "100px"]}
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

export default CategoriesComponent;
