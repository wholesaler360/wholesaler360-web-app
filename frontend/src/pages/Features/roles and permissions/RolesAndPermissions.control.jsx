import { FetchAllRoles } from "@/constants/apiEndPoints";
import { axiosGet } from "@/constants/api-context";
import { createColumnHelper } from "@tanstack/react-table";
import { createContext } from "react";

const RolesAndPermissionsContext = createContext({});

function RolesAndPermissionController({ children }) {
  const getRoles = async () => {
    const data = await axiosGet(FetchAllRoles);
    return data;
  };

  const columnHelper = createColumnHelper();

  const columns = [
    // Accessor column for "role"
    columnHelper.accessor("role", {
      id: "role",
      header: "Role",
      cell: (info) => info.getValue(),
    }),

    // Accessor column for "createdOn"
    columnHelper.accessor("createdOn", {
      id: "createdOn",
      header: "Created On",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(), // Format date
    }),

    // Display column for "Edit Row" button
    columnHelper.display({
      id: "editRow",
      header: "Edit Row",
      cell: ({ row }) => (
        <button onClick={() => handleEditRow(row.original)}>Edit Row</button>
      ),
    }),

    // Display column for "Edit Permissions" button
    columnHelper.display({
      id: "editPermissions",
      header: "Edit Permissions",
      cell: ({ row }) => (
        <button onClick={() => handleEditPermissions(row.original)}>
          Edit Permissions
        </button>
      ),
    }),
  ];

  // Example handlers for button actions
  const handleEditRow = (rowData) => {
    console.log("Edit row:", rowData);
  };

  const handleEditPermissions = (rowData) => {
    console.log("Edit permissions for:", rowData);
  };

  return (
    <RolesAndPermissionsContext.Provider value={{ getRoles, columns }}>
      {children}
    </RolesAndPermissionsContext.Provider>
  );
}

export { RolesAndPermissionsContext, RolesAndPermissionController };
