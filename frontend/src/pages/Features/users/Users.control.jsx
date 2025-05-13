import { createContext, useState, useCallback } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet, axiosDelete } from "@/constants/api-context";
import { FetchAllUsers, DeleteUser } from "@/constants/apiEndPoints";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonV2 } from "@/components/ui/button-v2";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { showNotification } from "@/core/toaster/toast";
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

const UsersContext = createContext({});

function UsersController({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  const getUsers = useCallback(async () => {
    const response = await axiosGet(FetchAllUsers);
    return response.data;
  }, []);

  const deleteUser = useCallback(async (mobileNo) => {
    try {
      const response = await axiosDelete(DeleteUser, { data: { mobileNo } });
      if (response.status === 204) {
        showNotification.success("User deleted successfully");
        setRefreshTrigger((prev) => prev + 1);
        return true;
      } else {
        showNotification.error(
          response?.data?.message || "Failed to delete user"
        );
        return false;
      }
    } catch (error) {
      showNotification.error("Error deleting user");
      return false;
    }
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <ButtonV2
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  permissionModule="user"
                  permissionAction="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </ButtonV2>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the user
                    {row.original.name && ` "${row.original.name}"`} and all
                    associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteUser(row.original.mobileNo)}
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
    <UsersContext.Provider
      value={{
        getUsers,
        deleteUser,
        columns,
        refreshTrigger,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export { UsersContext, UsersController };
