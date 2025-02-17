import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  clearAccessToken,
  clearAuthData,
  getAccessToken,
} from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";
import { usePermission } from "@/hooks/usePermission";

function AuthenticatedRoutes({ children, permission }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { hasReadPermission } = usePermission();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const authToken = getAccessToken();
        if (!authToken) {
          setIsAuthenticated(false);
          showNotification.error("Please login to continue");
          return;
        }

        // Check permission if required
        if (permission && !hasReadPermission(permission)) {
          showNotification.error(
            "You don't have permission to access this module"
          );
          clearAccessToken();
          clearAuthData();
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
      } catch (e) {
        setIsAuthenticated(false);
        showNotification.error("Something went wrong. Please login again.");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [permission, hasReadPermission]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <React.Suspense fallback={<>Loading...</>}>{children}</React.Suspense>;
}

export default AuthenticatedRoutes;
