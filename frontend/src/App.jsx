import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import AppContainer from "./AppContainer";

export const AuthContext = createContext(null);

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (
      localStorage.getItem("authToken") != undefined &&
      localStorage.getItem("authToken") != null
    ) {
      setLoggedIn(true);
    }
  });

  return (
    <>
      <BrowserRouter basename="/">
        <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
          <AppContainer />
        </AuthContext.Provider>
      </BrowserRouter>
    </>
  );
}

export default App;
