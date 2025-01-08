import { BrowserRouter } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import AppContainer from "./AppContainer";
import { ACCESS_TOKEN_KEY } from "./constants/globalConstants";

export const AuthContext = createContext(null);

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (
      localStorage.getItem(`${ACCESS_TOKEN_KEY}`) != undefined &&
      localStorage.getItem(`${ACCESS_TOKEN_KEY}`) != null
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
