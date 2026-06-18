import React, { createContext, useState, useContext, useEffect } from "react";
import { AddToLs, GetFromLs } from "../localstorage";

// Create context for global application theme
const ThemeContext = createContext();

// Custom hook to consume the theme context
export function usetheme() {
  return useContext(ThemeContext);
}

// Provider component that wraps the app and manages the dark/light mode state
export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    // Retrieve theme from LocalStorage or default to light mode
    return GetFromLs("app-theme") || "light";
  });

  useEffect(() => {
    // Apply appropriate class on documentElement (html element) for Tailwind dark mode
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Persist active theme in LocalStorage
    AddToLs("app-theme", themeMode);
  }, [themeMode]);

  // Toggle function between light and dark modes
  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}