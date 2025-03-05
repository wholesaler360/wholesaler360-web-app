import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet } from "@/constants/api-context";
import { FetchAllUsers } from "@/constants/apiEndPoints";
import { Edit, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UsersContext = createContext({});

function UsersController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  const getUsers = useCallback(async () => {
    const response = await axiosGet(FetchAllUsers);
    return response.data;
  }, []);

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("avatar", {
      header: "Avatar",
      cell: ({ row }) => (
        <Avatar className="h-12 w-12">
          <AvatarImage src={row.original.avatar} alt={row.original.name} />
          <AvatarFallback>{row.original.name[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      ),
    }),

    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium capitalize">{row.original.name}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor("mobileNo", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mobile" />
      ),
    }),

    columnHelper.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 capitalize">
          {row.original.role}
        </span>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const handleEdit = () => {
          const userDataForEdit = {
            ...row.original,
            role: row.original.role, // Ensure role is passed correctly
          };
          navigate("/user/edit", {
            state: { userData: userDataForEdit },
          });
        };

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:text-blue-600 hover:bg-blue-50"
              onClick={handleEdit}
              permissionModule="user"
              permissionAction="update"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  return (
    <UsersContext.Provider
      value={{
        getUsers,
        columns,
        refreshTrigger,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export { UsersContext, UsersController };
