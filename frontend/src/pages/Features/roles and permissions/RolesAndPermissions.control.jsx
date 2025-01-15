import { FetchAllRoles } from "@/constants/apiEndPoints";
import { axiosGet } from "@/context/api-context";
import { createContext } from "react";

const RolesAndPermissionsContext = createContext({});

function RolesAndPermissionController({ children }) {
  const getRoles = async () => {
    const data = await axiosGet(FetchAllRoles);
    return data;
  };

  return (
    <RolesAndPermissionsContext.Provider value={{ getRoles }}>
      {children}
    </RolesAndPermissionsContext.Provider>
  );
}

export { RolesAndPermissionsContext, RolesAndPermissionController };
