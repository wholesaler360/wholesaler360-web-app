import { createContext, useContext, useEffect, useState } from "react";
import { getUserData, clearAuthData, updateUserData } from "@/lib/authUtils";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  setUser: () => {},
  updateUser: () => {},
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

  const updateUser = (updatedData) => {
    // Update local storage and state
    const newUserData = updateUserData(updatedData);
    if (newUserData) {
      setUser(newUserData);
      return true;
    }
    return false;
  };

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
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
