import { BrowserRouter } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import AppContainer from "./AppContainer";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/theme-context";

export const AuthContext = createContext(null);

function App() {  
  return (
    <>
      <BrowserRouter basename="/">
        <ThemeProvider>
          <AuthContext.Provider value={{}}>
            <Toaster position="top-right" />
            <AppContainer />
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
