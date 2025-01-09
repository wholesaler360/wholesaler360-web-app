import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN_KEY } from "@/constants/globalConstants";
import { showNotification } from "@/core/toaster/toast";

function PublicRoutes({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (
      localStorage.getItem(`${ACCESS_TOKEN_KEY}`) &&
      localStorage.getItem(`${ACCESS_TOKEN_KEY}`) != null &&
      localStorage.getItem(`${ACCESS_TOKEN_KEY}`) != undefined
    ) {
      showNotification.error("You are already logged in");
      navigate("/");
    }
  }, []);

  return <React.Suspense fallback={<>Loading...</>}>{children}</React.Suspense>;
}

export default PublicRoutes;
