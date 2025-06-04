import React, { createContext } from "react";
import { useState, useContext, useEffect } from "react";
import { AddToLs,GetFromLs } from "../localstorage";

const theme=createContext()
export function usetheme(){
  return useContext(theme);
}
export function ThemeProvider({children}){
    const [theme, setTheme] = useState("light");
  useEffect(() => {
    const savedTheme = GetFromLs("app-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    AddToLs("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
 
}