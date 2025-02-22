import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet, axiosDelete } from "@/constants/api-context";
import { FetchAllProducts, DeleteProduct } from "@/constants/apiEndPoints";
import { Edit, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";
import { showNotification } from "@/core/toaster/toast";
import { useNavigate } from "react-router-dom";

const ProductsContext = createContext({});

function ProductsController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  const getProducts = useCallback(async () => {
    const response = await axiosGet(FetchAllProducts);
    return response.data;
  }, []);

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("productImg", {
      header: "Image",
      cell: ({ row }) => (
        <div className="flex items-center py-2">
          <img
            src={row.original.productImg}
            alt={row.original.name}
            className="h-16 w-16 rounded-lg object-cover border shadow-sm"
          />
        </div>
      ),
    }),

    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    }),

    columnHelper.accessor("skuCode", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
    }),

    columnHelper.accessor("category", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ getValue }) => (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          {getValue()}
        </span>
      ),
    }),

    columnHelper.accessor("salePrice", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium text-green-600">
          ₹{getValue().toLocaleString("en-IN")}
        </span>
      ),
    }),

    columnHelper.accessor("alertQuantity", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Alert Qty" />
      ),
      cell: ({ getValue }) => (
        <span className="text-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
          {getValue()}
        </span>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const handleEdit = () => {
          navigate("/product/edit", {
            state: { productSkuCode: row.original.skuCode },
          });
        };

        const handleDelete = async () => {
          try {
            const response = await axiosDelete(`${DeleteProduct}`, {
              data: { skuCode: row.original.skuCode },
            });
            if (response.status === 204) {
              showNotification.success("Product deleted successfully");
              setRefreshTrigger((prev) => prev + 1);
            } else {
              throw new Error("Failed to delete product");
            }
          } catch (error) {
            showNotification.error("Failed to delete product");
          }
        };

        return (
          <div className="flex items-center  gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 "
              onClick={handleEdit}
              permissionModule="product"
              permissionAction="update"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:bg-red-50 hover:text-red-600"
                  permissionModule="product"
                  permissionAction="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this product? This action
                    cannot be undone.
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
    <ProductsContext.Provider
      value={{
        getProducts,
        columns,
        refreshTrigger,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export { ProductsContext, ProductsController };
