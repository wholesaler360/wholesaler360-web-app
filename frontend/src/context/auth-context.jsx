import { createContext, useContext, useEffect, useState } from "react";
import { getUserData, clearAuthData } from "@/lib/authUtils";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Initialize user data from storage
    const userData = getUserData();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
