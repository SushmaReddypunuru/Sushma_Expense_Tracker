import React, { createContext, useState, useContext, useEffect } from "react";

// Create context for user authentication
const AuthContext = createContext();

// Dynamic API URL depending on build environment
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// Custom hook to consume the authentication context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that wraps the application and handles active sessions
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check if a session already exists on application mount
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Session verification error:", err))
      .finally(() => setAuthLoading(false));
  }, []);

  // Handles User Sign In
  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Required to set session cookie
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, message: data.error || "Login failed." };
      }
      
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: "Network connection error." };
    }
  };

  // Handles User Registration
  const signup = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Required to set session cookie
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, message: data.error || "Signup failed." };
      }
      
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: "Network connection error." };
    }
  };

  // Handles Session Logout
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout connection error:", err);
    } finally {
      setUser(null); // Clear user state regardless of backend response
    }
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
