import React from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';

function Home() {
  const { balance, transactions } = useTransactions();
  const { categories } = useCategories();

  // Helper to parse date without timezone shifting issues
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return { year, month: month - 1, day }; // JS month is 0-indexed
  };

  // Determine current month & year in user local time
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[currentMonth];

  // Filter transactions for the current month
  const currentMonthTransactions = transactions.filter(t => {
    const parsed = parseLocalDate(t.date);
    if (!parsed) return false;
    return parsed.year === currentYear && parsed.month === currentMonth;
  });

  // Calculate aggregates for current month
  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const monthlyExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const savingsAmount = monthlyIncome - monthlyExpense;
  const savingsRatio = monthlyIncome > 0
    ? Math.round((savingsAmount / monthlyIncome) * 100)
    : 0;

  // Budget calculations
  const budgetedCategories = categories.filter((c) => c.budget > 0);
  const activeBudgetCount = budgetedCategories.length;

  const categorySpendMap = {};
  currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categorySpendMap[t.category] = (categorySpendMap[t.category] || 0) + t.amount;
    });

  // Compile active warnings (spent >= 80% of budget)
  const budgetAlerts = budgetedCategories
    .map((c) => {
      const spend = categorySpendMap[c.name] || 0;
      const usagePercent = (spend / c.budget) * 100;
      return {
        category: c.name,
        budget: c.budget,
        spend,
        usagePercent,
        color: c.color || '#3b82f6',
      };
    })
    .filter((alert) => alert.usagePercent >= 80)
    .sort((a, b) => b.usagePercent - a.usagePercent);

  // Overall budget utilization percentage
  const totalBudgetedLimit = budgetedCategories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpentOnBudgeted = budgetedCategories.reduce((sum, c) => sum + (categorySpendMap[c.name] || 0), 0);
  const overallBudgetUsagePercent = totalBudgetedLimit > 0
    ? Math.round((totalSpentOnBudgeted / totalBudgetedLimit) * 100)
    : 0;

  // Get last 3 transactions
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentTransactions = sortedTransactions.slice(0, 3);

  // Category color finder
  const getCategoryColor = (catName) => {
    const cat = categories.find((c) => c.name === catName);
    return cat ? cat.color : '#94a3b8';
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10 max-w-7xl mx-auto">
      
      {/* Financial Health Summary Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#5c2d91] via-[#4c1d95] to-[#2e1065] text-white p-6 md:p-8 shadow-md">
        <div className="max-w-xl space-y-3">
          <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full backdrop-blur-xs">
            Overview Ledger
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Financial Health
          </h1>
          <p className="text-sm text-purple-100 max-w-md">
            Review your cash flow indices, watch real-time category alerts, and balance targets.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <Link to="/transactionform">
              <button className="bg-white hover:bg-gray-55 text-purple-900 rounded-lg py-2 px-4 font-semibold text-sm shadow-sm hover:shadow active:translate-y-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                ➕ Add Transaction
              </button>
            </Link>
            <Link to="/categorisation">
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg py-2 px-4 font-semibold text-sm shadow-sm hover:shadow active:translate-y-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                ⚙️ Category Limits
              </button>
            </Link>
          </div>
        </div>

        {/* Right side floating balance box */}
        <div className="hidden lg:block absolute right-8 bottom-6 bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl w-64 text-right">
          <div className="text-xs text-purple-200 uppercase font-bold tracking-wider">Net Balance</div>
          <div className={`text-2xl font-black mt-1 ${balance >= 0 ? 'text-white' : 'text-rose-200'}`}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-purple-200/80 mt-2">
            Based on {transactions.length} operations
          </div>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Savings Ratio */}
        <div className="card-container flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-gray dark:text-dark-text-gray">Savings Ratio</h3>
              <span className="text-lg">📊</span>
            </div>
            <div className="py-2">
              <div className="text-3xl font-black text-primary dark:text-dark-primary">
                {savingsRatio}%
              </div>
              <p className="text-xs text-brand-text-gray dark:text-dark-text-gray mt-1">
                {savingsAmount >= 0 ? 'Saved' : 'Overspent by'} ₹{Math.abs(savingsAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })} this month
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-dark-border h-1.5 rounded-full overflow-hidden mt-4">
            <div 
              className="bg-primary dark:bg-dark-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, savingsRatio))}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Monthly Income */}
        <div className="card-container flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-gray dark:text-dark-text-gray">Monthly Income</h3>
              <span className="text-lg">📥</span>
            </div>
            <div className="py-2">
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-brand-text-gray dark:text-dark-text-gray mt-1">
                Total inflows in {currentMonthName}
              </p>
            </div>
          </div>
          <Link to="/dashboard" className="text-xs font-bold text-primary dark:text-dark-primary hover:underline mt-4 block">
            Analysis Details →
          </Link>
        </div>

        {/* Metric 3: Monthly Expenses */}
        <div className="card-container flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-gray dark:text-dark-text-gray">Monthly Expenses</h3>
              <span className="text-lg">📤</span>
            </div>
            <div className="py-2">
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
                ₹{monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-brand-text-gray dark:text-dark-text-gray mt-1">
                Total outflows in {currentMonthName}
              </p>
            </div>
          </div>
          <Link to="/transactionhistory" className="text-xs font-bold text-primary dark:text-dark-primary hover:underline mt-4 block">
            View Ledger History →
          </Link>
        </div>

        {/* Metric 4: Category Budgets */}
        <div className="card-container flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-gray dark:text-dark-text-gray">Category Budgets</h3>
              <span className="text-lg">🎯</span>
            </div>
            <div className="py-2">
              <div className="text-3xl font-black text-brand-text dark:text-white">
                {activeBudgetCount}
              </div>
              <p className="text-xs text-brand-text-gray dark:text-dark-text-gray mt-1">
                Active limits set ({overallBudgetUsagePercent}% utilized)
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-dark-border h-1.5 rounded-full overflow-hidden mt-4">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                overallBudgetUsagePercent >= 100 
                  ? 'bg-rose-500' 
                  : overallBudgetUsagePercent >= 80 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallBudgetUsagePercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Section split: Recent Activity Ledger & Budget Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Recent Activity (2/3 width) */}
        <div className="lg:col-span-2 card-container">
          <div className="flex justify-between items-center mb-5 pb-2 border-b border-brand-border dark:border-dark-border">
            <h3 className="text-sm font-bold flex items-center gap-2 text-brand-text dark:text-white">
              <span>⏰</span> Recent Activity
            </h3>
            <Link 
              to="/transactionhistory" 
              className="text-xs font-semibold text-primary dark:text-dark-primary hover:underline"
            >
              See All History →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-sm text-brand-text-gray dark:text-dark-text-gray italic">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-brand-text-gray dark:text-dark-text-gray font-bold border-b border-gray-100 dark:border-dark-border">
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 px-4">Category</th>
                    <th className="pb-2 px-4">Date</th>
                    <th className="pb-2 px-4">Description</th>
                    <th className="pb-2 pl-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {recentTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-55/50 dark:hover:bg-dark-border/10 transition-colors">
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.type === 'income' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-brand-text dark:text-white flex items-center gap-2">
                        <span 
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getCategoryColor(t.category) }}
                        ></span>
                        {t.category}
                      </td>
                      <td className="py-3 px-4 text-xs text-brand-text-gray dark:text-dark-text-gray">
                        {t.date}
                      </td>
                      <td className="py-3 px-4 text-brand-text-gray dark:text-dark-text-gray italic max-w-[150px] truncate">
                        {t.description ? `"${t.description}"` : '—'}
                      </td>
                      <td className={`py-3 pl-4 text-right font-bold ${
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Active Budget Alerts (1/3 width) */}
        <div className="lg:col-span-1 card-container">
          <h3 className="text-sm font-bold mb-4 pb-2 border-b border-brand-border dark:border-dark-border flex items-center gap-2 text-brand-text dark:text-white">
            <span>⚠️</span> Budget Notifications
          </h3>

          {budgetAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-brand-text-gray dark:text-dark-text-gray">
              <span className="text-3xl mb-2">✅</span>
              <p className="text-xs font-semibold">All category budgets are healthy!</p>
              <p className="text-[10px] text-gray-400 mt-0.5">No categories have exceeded 80% usage.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetAlerts.map((alert) => {
                const isOver = alert.usagePercent >= 100;
                return (
                  <div key={alert.category} className="space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-semibold text-brand-text dark:text-white flex items-center gap-1.5">
                          <span 
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: alert.color }}
                          ></span>
                          {alert.category}
                        </span>
                        <span className="text-[10px] text-brand-text-gray dark:text-dark-text-gray block mt-0.5">
                          ₹{alert.spend.toLocaleString('en-IN', { maximumFractionDigits: 0 })} of ₹{alert.budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <span className={`font-bold ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {Math.round(alert.usagePercent)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-150 dark:bg-dark-border h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, alert.usagePercent)}%` }}
                      ></div>
                    </div>

                    {isOver ? (
                      <p className="text-[10px] font-medium text-rose-500/95">
                        ⚠️ Limit exceeded by ₹{(alert.spend - alert.budget).toLocaleString('en-IN', { maximumFractionDigits: 0 })}!
                      </p>
                    ) : (
                      <p className="text-[10px] font-medium text-amber-500/95">
                        ⏳ Approaching limit (₹{(alert.budget - alert.spend).toLocaleString('en-IN', { maximumFractionDigits: 0 })} left)
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Home;