import React from "react";
import { Navigate } from "react-router-dom";

function AuthenticatedRoutes({ children }) {
  const current_time = new Date().getTime() / 1000;
  try {
    const authToken = localStorage.getItem("authToken");
    const { exp } = jwt_decode(authToken);
    if (exp < current_time) {
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return <React.Suspense fallback={<>Loading...</>}>{children}</React.Suspense>;
}

export default AuthenticatedRoutes;
