import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust the path based on your project structure
import { PlusCircle } from "lucide-react";
import { RolesAndPermissionsContext } from "./RolesAndPermissions.control";

function RolesAndPermissionsComponent() {
  const [data, setData] = useState(null);
  const { getRoles } = useContext(RolesAndPermissionsContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRoles();
        if (response) {
          setData(response.value);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    fetchData();
  }, [getRoles]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-1">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-medium">Roles & Permissions</h2>
        <div className="flex items-center ml-auto mr-4">
          <Button>
            <PlusCircle /> Add Role
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RolesAndPermissionsComponent;
