import React from "react";
import { Route, Routes } from "react-router-dom";
import { authRoutes, unAuthRoutes } from "./router/routes";
import PublicRoutes from "./router/PublicRoutes";
import AuthenticatedRoutes from "./router/AuthenticatedRoutes";

function AppContainer() {
  return (
    <>
      <Routes>
        {unAuthRoutes?.map((route, id) => (
          <Route
            key={id}
            path={route?.path}
            element={<PublicRoutes>{route?.element}</PublicRoutes>}
          />
        ))}
        {authRoutes?.map((route, id) => (
          <Route
            key={id}
            path={route?.path}
            element={
              <AuthenticatedRoutes>{route?.element}</AuthenticatedRoutes>
            }
          />
        ))}
      </Routes>
    </>
  );
}

export default AppContainer;
