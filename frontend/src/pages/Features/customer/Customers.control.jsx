import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet, axiosDelete } from "@/constants/api-context";
import { FetchAllCustomers, DeleteCustomer } from "@/constants/apiEndPoints";
import { MoreHorizontal, FileText } from "lucide-react";
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

export const CustomerContext = createContext({});

function CustomerController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  const getCustomers = useCallback(async () => {
    const response = await axiosGet(FetchAllCustomers);
    return response.data;
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
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
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
            <span className="font-medium">
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

    columnHelper.accessor("totalNoOFInvoice", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoices" />
      ),
      cell: ({ getValue }) => (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          {getValue()}
        </span>
      ),
    }),

    columnHelper.accessor("receivableBalance", {
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
          navigate(`/customer/edit/`, {
            state: { mobileNo: row.original.mobileNo },
          });
        };

        const handleDelete = async () => {
          try {
            const response = await axiosDelete(DeleteCustomer, {
              data: { mobileNo: row.original.mobileNo },
            });
            if (response.status === 204) {
              showNotification.success("Customer deleted successfully");
              setRefreshTrigger((prev) => prev + 1);
            }
          } catch (error) {
            showNotification.error("Can not delete customer");
          }
        };

        return (
          <div className="flex items-center gap-2">
            <ButtonV2
              variant="outline"
              effect="ringHover"
              size="sm"
              onClick={() => navigate(`/invoice/new/${row.original.id}`)}
              permissionModule="invoice"
              permissionAction="write"
            >
              <FileText className="h-4 w-4" />
              New Invoice
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
                <DropdownMenuItem
                  onClick={handleEdit}
                  permissionModule="customer"
                  permissionAction="update"
                >
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleDelete}
                  permissionModule="customer"
                  permissionAction="delete"
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
    <CustomerContext.Provider value={{ getCustomers, columns, refreshTrigger }}>
      {children}
    </CustomerContext.Provider>
  );
}

export default CustomerController;
