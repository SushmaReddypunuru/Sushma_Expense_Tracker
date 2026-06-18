import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { usetheme } from '../context/ThemeContext';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

// Simple, small, uniform tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-lg p-2 shadow-md text-[10px] font-semibold text-brand-text dark:text-white max-w-xs animate-fade-in">
        {label && <div className="font-bold border-b border-brand-border dark:border-dark-border pb-1 mb-1 text-brand-text dark:text-white">{label}</div>}
        <div className="space-y-1">
          {payload.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center gap-3">
              <span className="text-brand-text-gray dark:text-dark-text-gray capitalize">{item.name || item.dataKey}:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">₹{parseFloat(item.value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PRESETS = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Prev Year', value: 'prev_year' },
  { label: 'Custom', value: 'custom' },
];

function Dashboard() {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { theme } = usetheme();

  // Unified Date Range Selector
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  });
  const [activePreset, setActivePreset] = useState('month');

  // Date Math Helper
  const getPresetDates = (preset) => {
    const today = new Date();
    let start = '';
    let end = '';
    
    if (preset === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(today.getFullYear(), today.getMonth(), diff);
      const sunday = new Date(today.getFullYear(), today.getMonth(), diff + 6);
      start = monday.toISOString().slice(0, 10);
      end = sunday.toISOString().slice(0, 10);
    } else if (preset === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    } else if (preset === 'year') {
      start = new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 10);
      end = new Date(today.getFullYear(), 11, 31).toISOString().slice(0, 10);
    } else if (preset === 'prev_year') {
      start = new Date(today.getFullYear() - 1, 0, 1).toISOString().slice(0, 10);
      end = new Date(today.getFullYear() - 1, 11, 31).toISOString().slice(0, 10);
    }
    return { start, end };
  };

  const applyPreset = (preset) => {
    const dates = getPresetDates(preset);
    setActivePreset(preset);
    if (preset !== 'custom') {
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    setActivePreset('custom');
  };
  const handleEndDateChange = (val) => {
    setEndDate(val);
    setActivePreset('custom');
  };

  // Calculate statistics within the chosen date range
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
        const color = catObj ? catObj.color : '#7c3aed';
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

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
      
      {/* Title & Unified Date Picker Row */}
      <div className="border-b border-brand-border dark:border-dark-border pb-3 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-brand-text dark:text-white">
          Dashboard Summary
        </h1>

        {/* Date Filter Input with Presets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => applyPreset(p.value)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  activePreset === p.value 
                    ? 'bg-primary text-white shadow-xs' 
                    : 'bg-gray-100 hover:bg-gray-200 text-brand-text-gray dark:bg-dark-border dark:text-dark-text-gray dark:hover:bg-gray-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          
          {/* Date picker inputs */}
          <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-lg px-2.5 py-1 shadow-xs">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => handleStartDateChange(e.target.value)}
              onClick={(e) => e.target.showPicker()}
              className="text-[10px] font-bold focus:outline-none bg-transparent border-none py-0.5 cursor-pointer"
            />
            <span className="text-gray-300 dark:text-dark-border font-light text-[10px]">to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => handleEndDateChange(e.target.value)}
              onClick={(e) => e.target.showPicker()}
              className="text-[10px] font-bold focus:outline-none bg-transparent border-none py-0.5 cursor-pointer"
            />
          </div>
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
              <div className="space-y-4">
                <div className="border-b border-brand-border dark:border-dark-border pb-2 text-center">
                  <h4 className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Expenses by Category</h4>
                </div>

                {pieData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-gray-400">No expense records.</div>
                ) : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          dataKey="value" 
                          nameKey="name" 
                          outerRadius={55} 
                          labelLine={false} 
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius * 1.25;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text
                                x={x}
                                y={y}
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                className="text-[10px] font-semibold fill-brand-text-gray dark:fill-dark-text-gray"
                              >
                                {`${name} (${(percent * 100).toFixed(0)}%)`}
                              </text>
                            );
                          }}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
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
                        <Tooltip content={<CustomTooltip />} />
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
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categories.find(c => c.name === item.category)?.color || '#7c3aed' }}></span>
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
