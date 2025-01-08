import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN_KEY } from "@/constants/globalConstants";
import { clearAccessToken } from "@/lib/authUtils";

function AuthenticatedRoutes({ children }) {
  const current_time = new Date().getTime() / 1000;
  try {
    const authToken = localStorage.getItem(`${ACCESS_TOKEN_KEY}`);
    const { exp } = jwtDecode(authToken);
    if (exp < current_time) {
      clearAccessToken();
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return <React.Suspense fallback={<>Loading...</>}>{children}</React.Suspense>;
}

export default AuthenticatedRoutes;
