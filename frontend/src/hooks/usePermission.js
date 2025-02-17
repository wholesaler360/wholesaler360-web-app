import { useCallback } from "react";
import { getStoredPermissions } from "@/lib/authUtils";

export const usePermission = () => {
  const checkPermission = useCallback((module, action) => {
    const permissions = getStoredPermissions();
    return permissions?.[module]?.[action] || false;
  }, []);

  const hasReadPermission = useCallback(
    (module) => {
      return checkPermission(module, "read");
    },
    [checkPermission]
  );

  const hasWritePermission = useCallback(
    (module) => {
      return checkPermission(module, "write");
    },
    [checkPermission]
  );

  const hasUpdatePermission = useCallback(
    (module) => {
      return checkPermission(module, "update");
    },
    [checkPermission]
  );

  const hasDeletePermission = useCallback(
    (module) => {
      return checkPermission(module, "delete");
    },
    [checkPermission]
  );

  return {
    checkPermission,
    hasReadPermission,
    hasWritePermission,
    hasUpdatePermission,
    hasDeletePermission,
  };
};
