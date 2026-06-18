import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth, API_BASE } from "./AuthContext";

// Create context for transaction management
const TransactionsContext = createContext();

// Custom hook to consume the transactions context
export function useTransactions() {
  return useContext(TransactionsContext);
}

// Provider component that manages transaction logs on the MySQL backend
export function TransactionProvider({ children }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Queries filtered and sorted transactions from the Python backend
  const fetchTransactions = async (filters = {}) => {
    if (!user) return;
    
    setLoadingTransactions(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.sort_by) params.append("sort_by", filters.sort_by);

      const res = await fetch(`${API_BASE}/transactions?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load transactions.");
      
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Fetch initial transactions on login
  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [user]);

  // Sends a POST request to add a new transaction record
  const addTransaction = async (newT) => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newT),
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok) return { success: false, message: data.error || "Failed to record transaction." };
      
      // Reload lists
      fetchTransactions();
      return { success: true };
    } catch (err) {
      return { success: false, message: "Network connection error." };
    }
  };

  // Sends a DELETE request to delete a transaction record
  const deleteTransaction = async (tra) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${tra.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok) return { success: false, message: data.error || "Failed to delete transaction." };
      
      // Update local state directly
      setTransactions((prev) => prev.filter((t) => t.id !== tra.id));
      return { success: true };
    } catch (err) {
      return { success: false, message: "Network connection error." };
    }
  };

  // Sends a PUT request to update an existing transaction record
  const editTransaction = async (tra) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${tra.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tra),
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok) return { success: false, message: data.error || "Failed to update transaction." };
      
      // Update local state
      setTransactions((prev) =>
        prev.map((t) => (t.id === tra.id ? { ...t, ...tra } : t))
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: "Network connection error." };
    }
  };

  // Computes the current balance: Income - Expense
  const calculateBalance = () => {
    return transactions.reduce((acc, t) => {
      const amt = Number(t.amount) || 0;
      return t.type === "income" ? acc + amt : acc - amt;
    }, 0);
  };

  const balance = calculateBalance();

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        loadingTransactions,
        fetchTransactions,
        addTransaction,
        deleteTransaction,
        editTransaction,
        balance,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}