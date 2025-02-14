import { BrowserRouter } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import AppContainer from "./AppContainer";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/theme-context";
import { AuthProvider } from "@/context/auth-context";

export const AuthContext = createContext(null);

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <AuthProvider>
          <ThemeProvider>
            <Toaster position="top-right" />
            <AppContainer />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
