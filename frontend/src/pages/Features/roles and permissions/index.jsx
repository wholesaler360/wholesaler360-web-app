import React from "react";
import RolesAndPermissionsComponent from "./RolesAndPermissions.component";
import { RolesAndPermissionController } from "./RolesAndPermissions.control";

function RolesAndPermissions() {
  return (
    <>
      <RolesAndPermissionController>
      <RolesAndPermissionsComponent />
      </RolesAndPermissionController>
    </>
  );
}

export default RolesAndPermissions;
