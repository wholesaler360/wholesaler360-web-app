import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearAccessToken, clearAuthData, getAccessToken } from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";
import { usePermission } from "@/hooks/usePermission";
import { authRoutes } from "./routes";

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

        // Find the current route configuration
        const currentRoute = authRoutes.find(route => route.path === location.pathname);
        
        // Check permission if route requires it
        if (currentRoute?.permission) {
          if (!hasReadPermission(currentRoute.permission)) {
            showNotification.error("You don't have permission to access this module");
            clearAccessToken();
            clearAuthData();
            setIsAuthenticated(false);
            return;
          }
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
