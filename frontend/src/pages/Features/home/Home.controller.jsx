import React, { createContext } from "react";

export const HomeContext = createContext({});

function HomeController({ children }) {
  return <HomeContext.Provider value={{}}>{children}</HomeContext.Provider>;
}

export default HomeController;
