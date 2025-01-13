import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  clearAccessToken,
  getAccessToken,
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";

function AuthenticatedRoutes({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const authToken = getAccessToken();
        
        if (!authToken) {
          setIsAuthenticated(false);
          showNotification.error("Please login to continue");
          return;
        }

        setIsAuthenticated(true);
      } catch (e) {
        clearAccessToken();
        setIsAuthenticated(false);
        showNotification.error("Something went wrong. Please login again.");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <React.Suspense fallback={<>Loading...</>}>{children}</React.Suspense>;
}

export default AuthenticatedRoutes;
