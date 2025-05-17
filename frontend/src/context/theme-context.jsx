import { getCurrentTheme, setNewTheme } from "@/lib/authUtils";
import { createContext, useContext, useEffect, useState } from "react";

const themeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getCurrentTheme());

  useEffect(() => {
    const storedTheme = getCurrentTheme();
    setTheme(storedTheme);
    document.documentElement.classList.add(storedTheme);
  }, []);

  const toggleTheme = () => {
    const newThemeName = getCurrentTheme() === "light" ? "dark" : "light";
    const newTheme = newThemeName;
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    setTheme(newTheme);
    setNewTheme(newThemeName);
  };

  return (
    <themeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </themeContext.Provider>
  );
};
export const useTheme = () => useContext(themeContext);
