import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken } from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";
import { usePermission } from "@/hooks/usePermission";

function AuthenticatedRoutes({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { hasReadPermission } = usePermission();
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const authToken = getAccessToken();

        if (!authToken) {
          setIsAuthenticated(false);
          showNotification.error("Please login to continue");
          return;
        }

        // Check module permission
        const module = location.pathname.split("/")[1] || "dashboard";
        if (!hasReadPermission(module)) {
          showNotification.error(
            "You don't have permission to access this module"
          );
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
  }, [location.pathname, hasReadPermission]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <React.Suspense fallback={<>Loading...</>}>{children}</React.Suspense>;
}

export default AuthenticatedRoutes;
