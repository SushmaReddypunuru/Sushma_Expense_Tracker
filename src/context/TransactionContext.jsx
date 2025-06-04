import React, { createContext } from "react";
import { useState, useContext, useEffect } from "react";
import { AddToLs, GetFromLs } from "../localstorage";

const Transactions = createContext()

export function useTransactions() { return useContext(Transactions) }

export function TransactionProvider({ children }) {

    const [transactions, setTransactions] = useState(() => GetFromLs("Transactions") || [])
    useEffect(() => { AddToLs("Transactions", transactions) }, [transactions])

    const addTransaction = (newT) => {
        const exists = transactions.some(t => t.id === newT.id);
        if (exists) {
            alert("Transaction already exists!");
            return;
        }
        setTransactions(prev => [...prev, newT]);
    };

    const deleteTransaction = (tra) => {
        setTransactions(prev => prev.filter(t => t.id !== tra.id));
    };

    const editTransaction = (tra) => {
        setTransactions((prev) =>
            prev.map((t) =>
                t.id === tra.id ? tra : t
            ))
    }
    const calculateBalance = () => {
        return transactions.reduce((acc, t) => acc + Number(t.amount), 0);
    };

    const balance = calculateBalance();


    return (
        <Transactions.Provider value={{ transactions, addTransaction, deleteTransaction,editTransaction,balance }}>
            {children}
        </Transactions.Provider>
    )

}