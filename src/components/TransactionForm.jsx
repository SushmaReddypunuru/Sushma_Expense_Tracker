import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import '../compon css/TransForm.css'

function TransactionForm() {
  const { addTransaction, balance } = useTransactions();
  const { categories } = useCategories();

  const [data, setData] = useState({
    amount: '',
    date: '',
    category: '',
    description: '',
    type: 'expense',
    recurring: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amt = parseFloat(data.amount);
    if (isNaN(amt) || amt <= 0) return alert("Amount must be greater than 0");
    if (!data.date) return alert("Please select a date");
    if (!data.category) return alert("Please choose a category");

    if (data.type === 'expense' && amt > balance) {
      return alert("Insufficient balance for this expense");
    }

    const newTransaction = {
      id: Date.now(),
      ...data,
      amount: amt,
    };

    addTransaction(newTransaction);
    alert("Transaction Sucessful")

    setData({
      amount: '',
      date: '',
      category: '',
      description: '',
      type: 'expense',
      recurring: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h1>Add Transaction</h1>
      
      <select name="type" value={data.type} onChange={handleChange}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <input type="number" name="amount" placeholder="Amount" value={data.amount} onChange={handleChange} />

      <input type="date" name="date" value={data.date} onChange={handleChange} />

      <select name="category" value={data.category} onChange={handleChange}>
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input type="text" name="description" placeholder="Description" value={data.description} onChange={handleChange} />

      <label>
        <input type="checkbox" name="recurring" checked={data.recurring} onChange={handleChange}
        />
        Recurring
      </label>

      <button type="submit">Add</button>
    </form>
  );
}

export default TransactionForm;
