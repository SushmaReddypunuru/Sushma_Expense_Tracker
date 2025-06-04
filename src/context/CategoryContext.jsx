import React, { createContext } from "react";
import { useState, useContext, useEffect } from "react";
import { AddToLs,GetFromLs } from "../localstorage";

const Categories = createContext()
const defaultCategories = ["Salary", "Food", "Utilities", "Entertainment"];

export function useCategories() { return useContext(Categories) }

export function CategoriesProvider({ children }) {

    const [categories, setCategories] = useState(() => {
    const saved = GetFromLs("Categories");
    if (saved && saved.length > 0) {
      return saved; 
    } else {
    
      AddToLs("Categories", defaultCategories);
      return defaultCategories;
    }} )
    if(!categories){setCategories( ["Salary","Food","Entertainment","utilities"])}
    useEffect(() => { AddToLs("Categories", categories) }, [categories])

    const addcategory = (cat) => {
        const trimmed = cat.trim();
        if (!trimmed) return alert("Category cannot be empty.");
        if (categories.includes(trimmed)) return alert("Category already exists!");

        setCategories(prev => [...prev, trimmed]);
    };

    const deletecategory = (cat) => {
        if (!categories.includes(cat)) {
            return alert("Category does not exist");
        }
        setCategories(prev => prev.filter(c => c !== cat));
    };


    return (
        <Categories.Provider value={{ categories, addcategory, deletecategory }}>
            {children}
        </Categories.Provider>
    )

}