import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async (force = false) => {
    // If already loaded and not forcing refresh, skip
    if (categories.length > 0 && !force) return;

    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }, [categories.length]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refreshCategories = () => fetchCategories(true);

  return (
    <CategoriesContext.Provider value={{ categories, loading, refreshCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
