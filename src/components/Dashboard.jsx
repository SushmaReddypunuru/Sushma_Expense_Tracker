import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { usetheme } from '../context/ThemeContext';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const { transactions, balance } = useTransactions();
  const { categories } = useCategories();
  const { theme } = usetheme();

  // Date range selectors (default to current calendar month)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  });

  // Calculate stats within the chosen date range
  const rangeTransactions = transactions.filter(t => t.date >= startDate && t.date <= endDate);

  const rangeIncome = rangeTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  const rangeExpenses = rangeTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  const rangeBalance = rangeIncome - rangeExpenses;

  // Category budget targets (for the selected range)
  const categoryBudgets = categories
    .filter(cat => cat.budget > 0)
    .map(cat => {
      const spent = rangeTransactions
        .filter(t => t.type === 'expense' && t.category === cat.name)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const ratio = (spent / cat.budget) * 100;
      return {
        ...cat,
        spent,
        ratio: Math.min(ratio, 100),
        rawRatio: ratio
      };
    });

  const overlimitAlerts = categoryBudgets.filter(cat => cat.rawRatio >= 100);

  // Pie Chart Data (Expenses by Category for selected range)
  const pieData = rangeTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find((item) => item.name === t.category);
      if (existing) {
        existing.value += parseFloat(t.amount);
      } else {
        const catObj = categories.find(c => c.name === t.category);
        const color = catObj ? catObj.color : '#3b82f6';
        acc.push({ name: t.category, value: parseFloat(t.amount), color });
      }
      return acc;
    }, []);

  // Bar Chart Data (Monthly Income vs Expenses for current year)
  const currentYear = new Date().getFullYear();
  const yearlyTransactions = transactions.filter(t => new Date(t.date).getFullYear() === currentYear);

  const barData = yearlyTransactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      if (t.type === 'income') existing.income += parseFloat(t.amount);
      else existing.expense += parseFloat(t.amount);
    } else {
      acc.push({
        month,
        income: t.type === 'income' ? parseFloat(t.amount) : 0,
        expense: t.type === 'expense' ? parseFloat(t.amount) : 0,
      });
    }
    return acc;
  }, []);

  // Sort months chronologically
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  barData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

  // Recurring Payments list
  const recurringItems = transactions
    .filter(t => t.recurring && t.type === 'expense')
    .reduce((acc, t) => {
      const key = `${t.category}-${t.amount}`;
      if (!acc.find(item => `${item.category}-${item.amount}` === key)) {
        acc.push(t);
      }
      return acc;
    }, []);

  // Theme support colors
  const isDark = theme === 'dark';
  const labelColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f8fafc' : '#0f172a',
    borderRadius: '8px'
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
      
      {/* Title & Date Picker Row */}
      <div className="border-b border-brand-border dark:border-dark-border pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-brand-text dark:text-white">
          Dashboard Summary
        </h1>

        {/* Date Filter Input */}
        <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-lg px-3 py-1.5 shadow-xs">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs focus:outline-none bg-transparent border-none py-0.5"
          />
          <span className="text-gray-300 dark:text-dark-border font-light">to</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs focus:outline-none bg-transparent border-none py-0.5"
          />
        </div>
      </div>

      {/* Overlimit Warning alert */}
      {overlimitAlerts.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-lg space-y-1 text-sm font-medium">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span>⚠️</span>
            <h4>Budget alerts exceeded:</h4>
          </div>
          <ul className="list-disc pl-5 text-xs space-y-1">
            {overlimitAlerts.map(cat => (
              <li key={cat.name}>
                <strong>{cat.name}</strong>: Spent ₹{cat.spent.toFixed(0)} of ₹{cat.budget.toFixed(0)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Simple Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="card-container border border-brand-border dark:border-dark-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-brand-text-gray dark:text-dark-text-gray">Income</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{rangeIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <span className="text-2xl">📥</span>
        </div>

        {/* Expenses Card */}
        <div className="card-container border border-brand-border dark:border-dark-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-brand-text-gray dark:text-dark-text-gray">Expenses</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              ₹{rangeExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <span className="text-2xl">📤</span>
        </div>

        {/* Balance Card */}
        <div className="card-container border border-brand-border dark:border-dark-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-brand-text-gray dark:text-dark-text-gray">Net Balance</span>
            <div className={`text-2xl font-black ${rangeBalance >= 0 ? 'text-primary dark:text-dark-primary' : 'text-rose-600 dark:text-rose-400'}`}>
              ₹{rangeBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <span className="text-2xl">⚖️</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Budgets & Graphs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Budgets Tracker */}
          <div className="card-container">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <span>🎯</span> Monthly Budgets
            </h3>
            
            {categoryBudgets.length === 0 ? (
              <div className="text-center py-4 text-xs text-brand-text-gray dark:text-dark-text-gray">
                No active monthly budgets set.
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBudgets.map(cat => {
                  let colorClass = "bg-emerald-500";
                  if (cat.rawRatio >= 100) colorClass = "bg-rose-500";
                  else if (cat.rawRatio >= 80) colorClass = "bg-amber-500";

                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                          {cat.name}
                        </span>
                        <span className="text-brand-text-gray dark:text-dark-text-gray">
                          ₹{cat.spent.toFixed(0)} / ₹{cat.budget.toFixed(0)}
                        </span>
                      </div>
                      
                      {/* Budget Indicator bar */}
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden flex relative">
                        <div 
                          className={`${colorClass} h-full transition-all duration-300 rounded-full`}
                          style={{ width: `${cat.ratio}%` }}
                        ></div>
                        {cat.rawRatio >= 100 && (
                          <span className="absolute right-2 top-0 text-[8px] font-bold text-white uppercase bg-rose-600 px-1 rounded-sm leading-none">Overlimit</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Graphs */}
          <div className="card-container space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-center text-brand-text-gray dark:text-dark-text-gray">Expenses by Category</h4>
                {pieData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-gray-400">No expense records.</div>
                ) : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={60} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Bar Chart */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-center text-brand-text-gray dark:text-dark-text-gray">Monthly Cash Flow ({currentYear})</h4>
                {barData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-gray-400">No data found.</div>
                ) : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ left: -10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="month" tick={{ fill: labelColor, fontSize: 9 }} />
                        <YAxis tick={{ fill: labelColor, fontSize: 9 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="income" fill="#10b981" name="Income" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="expense" fill="#f43f5e" name="Expenses" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Recurring Alerts */}
        <div className="card-container flex flex-col h-full">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <span>⏰</span> Recurring Alerts
          </h3>

          {recurringItems.length === 0 ? (
            <p className="text-xs text-brand-text-gray dark:text-dark-text-gray py-4 text-center">
              No active recurring items.
            </p>
          ) : (
            <div className="flex-1 divide-y divide-gray-100 dark:divide-dark-border space-y-2">
              {recurringItems.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-brand-text dark:text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categories.find(c => c.name === item.category)?.color || '#3b82f6' }}></span>
                      {item.category}
                    </div>
                    {item.description && (
                      <p className="text-[10px] text-gray-400 italic">"{item.description}"</p>
                    )}
                  </div>
                  <span className="font-bold text-rose-500">
                    - ₹{parseFloat(item.amount).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
