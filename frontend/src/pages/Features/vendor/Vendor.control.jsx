import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet, axiosDelete } from "@/constants/api-context";
import { FetchAllVendors, DeleteVendor } from "@/constants/apiEndPoints";
import { MoreHorizontal, BookIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";
import { showNotification } from "@/core/toaster/toast";
import { useNavigate } from "react-router-dom";
import { ButtonV2 } from "@/components/ui/button-v2";

export const VendorContext = createContext({});

function VendorController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  const getVendors = useCallback(async () => {
    const response = await axiosGet(FetchAllVendors);
    return response;
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vendor" />
      ),
      cell: ({ row }) => (
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/vendor/${row.original.id}`)}
        >
          {row.original.avatar ? (
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.original.avatar} alt={row.original.name} />
            </Avatar>
          ) : (
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(row.original.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col">
            <span className="font-medium hover:text-primary">
              {row.original.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("mobileNo", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mobile" />
      ),
    }),

    columnHelper.accessor("payableBalance", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance" />
      ),
      cell: ({ getValue }) => (
        <span
          className={`font-medium ${
            getValue() > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          ₹{getValue().toLocaleString("en-IN")}
        </span>
      ),
    }),

    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created On" />
      ),
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <span className="text-muted-foreground text-sm">
            {date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const handleEdit = () => {
          navigate(`/vendor/edit/`, {
            state: { mobileNo: row.original.mobileNo },
          });
        };

        const handleDelete = async () => {
          try {
            const response = await axiosDelete(DeleteVendor, {
              data: { mobileNo: row.original.mobileNo },
            });
            if (response.success) {
              showNotification.success("Vendor deleted successfully");
              setRefreshTrigger((prev) => prev + 1);
            }
          } catch (error) {
            showNotification.error("Failed to delete vendor");
          }
        };

        return (
          <div className="flex items-center gap-2">
            <ButtonV2
              variant="outline"
              effect="ringHover"
              size="sm"
              onClick={() => navigate(`/vendor/ledger/${row.original.id}`)}
            >
              <BookIcon className="h-4 w-4" />
              Ledger
            </ButtonV2>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={handleEdit}>
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleDelete}
                >
                  Delete Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  return (
    <VendorContext.Provider value={{ getVendors, columns, refreshTrigger }}>
      {children}
    </VendorContext.Provider>
  );
}

export default VendorController;
