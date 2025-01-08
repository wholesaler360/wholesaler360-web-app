import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/App.jsx";
import { ACCESS_TOKEN_KEY } from "@/constants/globalConstants";

function PublicRoutes({ children }) {
  const navigate = useNavigate();
  const { setLoggedIn } = useContext(AuthContext);
  useEffect(() => {
    if (
      localStorage.getItem(`${ACCESS_TOKEN_KEY}`) &&
      localStorage.getItem(`${ACCESS_TOKEN_KEY}`) != null &&
      localStorage.getItem(`${ACCESS_TOKEN_KEY}`) != undefined
    ) {
      setLoggedIn(true);
      navigate("/");
    }
  }, []);

  return <React.Suspense fallback={<>Loading...</>}>{children}</React.Suspense>;
}

export default PublicRoutes;
