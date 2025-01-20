import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet, axiosDelete } from "@/constants/api-context"
import { FetchAllProducts, DeleteProduct } from "@/constants/apiEndPoints";
import { ButtonV2 } from "@/components/ui/button-v2";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const ProductsContext = createContext({});

function ProductsController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const getProducts = useCallback(async () => {
    const response = await axiosGet(FetchAllProducts);
    return response;
  }, []);

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("productImg", {
      header: "Image",
      cell: ({ row }) => (
        <img 
          src={row.original.productImg} 
          alt={row.original.name}
          className="h-10 w-10 rounded-md object-cover"
        />
      ),
    }),
    
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
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
    }),

    columnHelper.accessor("salePrice", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ getValue }) => `₹${getValue()}`,
    }),

    columnHelper.accessor("alertQuantity", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Alert Qty" />
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const handleDelete = async () => {
          try {
            const response = await axiosDelete(`${DeleteProduct}`, {data: {skuCode: row.original.skuCode}});
            if(response.status === 204){
                toast({
                    title: "Success",
                    description: "Product deleted successfully",
                  });
                  setRefreshTrigger(prev => prev + 1);
            }
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to delete product",
            });
          }
        };

        return (
          <div className="flex gap-2">
            <ButtonV2
              effect="expandIcon"
              icon={Edit}
              iconPlacement="left"
              className="h-8"
            >
              Edit
            </ButtonV2>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this product? This action cannot be undone.
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
    <ProductsContext.Provider value={{ getProducts, columns, refreshTrigger }}>
      {children}
    </ProductsContext.Provider>
  );
}

export { ProductsContext, ProductsController };
