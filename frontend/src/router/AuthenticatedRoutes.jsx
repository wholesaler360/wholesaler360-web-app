import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN_KEY } from "@/constants/globalConstants";
import { clearAccessToken } from "@/lib/authUtils";
import { showNotification } from "@/core/toaster/toast";

function AuthenticatedRoutes({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const current_time = new Date().getTime() / 1000;

  useEffect(() => {
    try {
      const authToken = localStorage.getItem(`${ACCESS_TOKEN_KEY}`);
      if (!authToken) {
        setIsAuthenticated(false);
        showNotification.error("Please login to continue");
        return;
      }

      const { exp } = jwtDecode(authToken);
      if (exp < current_time) {
        clearAccessToken();
        setIsAuthenticated(false);
        showNotification.error("Session Expired");
      }
    } catch (e) {
      clearAccessToken();
      setIsAuthenticated(false);
      showNotification.error("Something went wrong. Please login again.");
    }
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <React.Suspense fallback={<>Loading...</>}>{children}</React.Suspense>;
}

export default AuthenticatedRoutes;