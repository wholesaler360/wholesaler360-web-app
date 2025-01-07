import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/App.jsx";

function PublicRoutes({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoggedIn } = useContext(AuthContext);
  useEffect(() => {
    if (
      localStorage.getItem("accessToken") &&
      localStorage.getItem("accessToken") != null &&
      localStorage.getItem("accessToken") != undefined
    ) {
      setLoggedIn(true);
      navigate("/dashboard");
    }
  }, []);

  return <React.Suspense fallback={<>Loading...</>}>{children}</React.Suspense>;
}

export default PublicRoutes;
