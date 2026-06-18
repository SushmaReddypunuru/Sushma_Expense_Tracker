import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';

function TransactionForm() {
  const { addTransaction, balance, transactions } = useTransactions();
  const { categories } = useCategories();

  // Helper to get today's date string YYYY-MM-DD in local time
  const getTodayDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    return localToday.toISOString().slice(0, 10);
  };

  // Local form inputs state
  const [data, setData] = useState({
    amount: '',
    date: getTodayDateString(),
    category: '',
    description: '',
    type: 'expense',
    recurring: false,
    recurrence_interval: 'monthly',
    tags: '',
  });

  // UI state for custom toast alerts
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Safe category filtering based on transaction type
  const filteredCategories = categories.filter((c) => {
    const catType = c.type || 'expense';
    if (data.type === 'income') {
      return catType === 'income' || catType === 'both';
    } else {
      return catType === 'expense' || catType === 'both';
    }
  });

  // Reset category selection if not valid for the toggled type
  const handleTypeChange = (newType) => {
    setData(prev => {
      const currentCategory = prev.category;
      const cat = categories.find(c => c.name === currentCategory);
      const isValid = cat && ((cat.type || 'expense') === newType || (cat.type || 'expense') === 'both');
      return {
        ...prev,
        type: newType,
        category: isValid ? currentCategory : ''
      };
    });
  };

  // Compute real-time category budget warning
  const getBudgetWarning = () => {
    if (data.type !== 'expense' || !data.category || !data.amount || !data.date) return null;
    
    const amt = parseFloat(data.amount);
    if (isNaN(amt) || amt <= 0) return null;

    const catObj = categories.find(c => c.name === data.category);
    if (!catObj || catObj.budget <= 0) return null;

    // Determine target month and year of the transaction
    const targetDate = new Date(data.date);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    // Sum active month expenses for this category
    const currentMonthSpend = transactions
      .filter((t) => {
        if (t.type !== 'expense' || t.category !== data.category || !t.date) return False;
        const d = new Date(t.date);
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpectedSpend = currentMonthSpend + amt;
    if (totalExpectedSpend > catObj.budget) {
      return {
        limit: catObj.budget,
        current: currentMonthSpend,
        remaining: Math.max(0, catObj.budget - currentMonthSpend),
        excess: totalExpectedSpend - catObj.budget
      };
    }
    return null;
  };

  const budgetWarning = getBudgetWarning();

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const amt = parseFloat(data.amount);
    
    // Validations
    if (isNaN(amt) || amt <= 0) {
      return showNotification("Amount must be a number greater than 0.", "error");
    }
    if (!data.date) {
      return showNotification("Please select a transaction date.", "error");
    }
    if (!data.category) {
      return showNotification("Please choose a category.", "error");
    }

    // Negative balance warning confirmation
    if (data.type === 'expense' && amt > balance) {
      const confirmProceed = window.confirm(
        `This expense of ₹${amt.toFixed(2)} exceeds your current overall balance of ₹${balance.toFixed(2)} (resulting in ₹${(balance - amt).toFixed(2)}). Do you want to proceed?`
      );
      if (!confirmProceed) return;
    }

    const payload = {
      ...data,
      amount: amt,
      tags: data.tags.trim()
    };

    const res = await addTransaction(payload);
    if (res.success) {
      showNotification("Transaction recorded successfully!");
      // Reset form fields
      setData({
        amount: '',
        date: getTodayDateString(),
        category: '',
        description: '',
        type: 'expense',
        recurring: false,
        recurrence_interval: 'monthly',
        tags: '',
      });
    } else {
      showNotification(res.message, "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Title */}
      <div className="border-b border-brand-border dark:border-dark-border pb-3">
        <h1 className="text-xl md:text-2xl font-bold text-brand-text dark:text-white">
          Add Transaction
        </h1>
      </div>

      {/* Alert banner */}
      {notification && (
        <div className={`p-4 rounded-lg border flex items-center justify-between transition-all duration-300 shadow-xs text-sm font-medium ${
          notification.type === 'error' 
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400' 
            : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
        }`}>
          <div className="flex items-center gap-2">
            <span>{notification.type === 'error' ? '⚠️' : '✅'}</span>
            <p>{notification.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setNotification(null)} 
            className="text-xs font-bold hover:underline cursor-pointer opacity-70 focus:outline-none"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="card-container">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Transaction Type Segmented Toggle */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-55 dark:bg-[#151d2a] rounded-lg border border-brand-border dark:border-dark-border">
              <button 
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  data.type === 'income' 
                    ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-xs' 
                    : 'text-brand-text-gray dark:text-dark-text-gray hover:text-brand-text dark:hover:text-white'
                }`}
              >
                📥 Income (Deposit)
              </button>
              <button 
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  data.type === 'expense' 
                    ? 'bg-white dark:bg-dark-card text-rose-600 dark:text-rose-400 shadow-xs' 
                    : 'text-brand-text-gray dark:text-dark-text-gray hover:text-brand-text dark:hover:text-white'
                }`}
              >
                📤 Expense (Spend)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Amount (₹)</label>
            <div className="relative rounded-lg border border-gray-300 dark:border-dark-border overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm bg-gray-55 dark:bg-[#151d2a] border-r border-gray-300 dark:border-dark-border px-2">₹</span>
              <input 
                type="number" 
                name="amount" 
                placeholder="0.00" 
                value={data.amount} 
                onChange={handleChange}
                className="w-full bg-white dark:bg-[#151d2a] pl-10 pr-3 py-2 text-sm text-brand-text dark:text-white focus:outline-none"
                min="0"
                step="any"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Date</label>
            <input 
              type="date" 
              name="date" 
              value={data.date} 
              onChange={handleChange}
              onClick={(e) => e.target.showPicker()}
              className="input-field cursor-pointer"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Category</label>
            <select 
              name="category" 
              value={data.category} 
              onChange={handleChange}
              className="input-field cursor-pointer"
            >
              <option value="">Select Category</option>
              {filteredCategories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Real-time Budget Warning Notice */}
            {budgetWarning && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-700 dark:text-amber-400 text-xs mt-2 animate-fade-in font-medium">
                ⚠️ <strong>Budget Limit Exceeded:</strong> Setting this expense will exceed the monthly category budget limit of ₹{budgetWarning.limit.toFixed(2)} by <strong>₹{budgetWarning.excess.toFixed(2)}</strong>.
                <div className="text-[10px] text-amber-600 dark:text-amber-500/80 mt-1">
                  Current month spending: ₹{budgetWarning.current.toFixed(2)} | Remaining: ₹{budgetWarning.remaining.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Description</label>
            <input 
              type="text" 
              name="description" 
              placeholder="e.g. Starbucks, Electricity Bill" 
              value={data.description} 
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Tags (Comma-separated)</label>
            <input 
              type="text" 
              name="tags" 
              placeholder="e.g. food, travel, work" 
              value={data.tags} 
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Recurring Checkbox Toggle & Interval Dropdown */}
          <div className="space-y-3 py-2 border-t border-brand-border dark:border-dark-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Recurring Item</span>
              
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="recurring" 
                  checked={data.recurring} 
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-250 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-dark-primary"></div>
              </label>
            </div>

            {data.recurring && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Recurrence Interval</label>
                <select 
                  name="recurrence_interval" 
                  value={data.recurrence_interval} 
                  onChange={handleChange}
                  className="input-field cursor-pointer text-xs"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="w-full btn-primary py-2 text-sm font-semibold">
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
