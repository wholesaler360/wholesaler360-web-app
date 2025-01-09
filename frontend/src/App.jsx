import { BrowserRouter } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import AppContainer from "./AppContainer";
import { Toaster } from "sonner";


export const AuthContext = createContext(null);

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <AuthContext.Provider value={{}}>
          <Toaster position="top-right" />
          <AppContainer />
        </AuthContext.Provider>
      </BrowserRouter>
    </>
  );
}

export default App;
