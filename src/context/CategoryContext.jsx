import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth, API_BASE } from "./AuthContext";

// Create context for categories
const CategoriesContext = createContext();

// Custom hook to consume the categories context
export function useCategories() {
  return useContext(CategoriesContext);
}

// Provider component that manages budget categories and fetches from MySQL backend
export function CategoriesProvider({ children }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  // Fetch categories from the MySQL database whenever a user logs in
  useEffect(() => {
    if (!user) {
      setCategories([]);
      return;
    }
    
    fetch(`${API_BASE}/categories`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories.");
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, [user]);

  // Adds a category on the MySQL database
  const addcategory = async (name, budget = 0, color = "#febd69", type = "expense") => {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, message: "Category name cannot be empty." };

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, budget, color, type }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || "Failed to add category." };

      // Re-fetch categories to sync state
      const freshRes = await fetch(`${API_BASE}/categories`, { credentials: "include" });
      const freshData = await freshRes.json();
      setCategories(freshData);
      return { success: true };
    } catch (err) {
      return { success: false, message: "Network connection error." };
    }
  };

  // Deletes a category from the MySQL database
  const deletecategory = async (name) => {
    try {
      const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(name)}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || "Failed to delete category." };

      setCategories((prev) => prev.filter((c) => c.name !== name));
      return { success: true };
    } catch (err) {
      return { success: false, message: "Network connection error." };
    }
  };

  // Updates the monthly budget limit, color, or type of a category
  const updatecategorybudget = async (name, budget, color, type) => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, budget, color, type }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || "Failed to update category." };

      // Sync state by reloading fresh categories
      const freshRes = await fetch(`${API_BASE}/categories`, { credentials: "include" });
      const freshData = await freshRes.json();
      setCategories(freshData);
      return { success: true };
    } catch (err) {
      return { success: false, message: "Network connection error." };
    }
  };

  return (
    <CategoriesContext.Provider value={{ categories, addcategory, deletecategory, updatecategorybudget }}>
      {children}
    </CategoriesContext.Provider>
  );
}