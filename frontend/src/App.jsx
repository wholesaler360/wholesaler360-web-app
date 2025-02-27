import { BrowserRouter } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import AppContainer from "./AppContainer";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { BrandingProvider } from "./context/BrandingContext";

export const AuthContext = createContext(null);

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <AuthProvider>
          <ThemeProvider>
            <BrandingProvider>
              <Toaster position="top-right" />
              <AppContainer />
            </BrandingProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
