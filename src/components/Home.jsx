import React from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';

function Home() {
  const { balance, transactions } = useTransactions();

  // Calculate simple statistics for layout panels
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
      
      {/* Dynamic Summary Panel */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-blue-700 text-white p-6 md:p-8 shadow-sm">
        <div className="max-w-xl space-y-3">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Financial Health
          </h1>
          <p className="text-sm text-blue-100">
            Monitor balance metrics, manage active budgets, and audit transactions.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <Link to="/dashboard">
              <button className="bg-white hover:bg-gray-100 text-primary rounded-lg py-2 px-4 font-semibold shadow-sm transition-all duration-250 cursor-pointer">
                View Dashboard
              </button>
            </Link>
            <Link to="/transactionform">
              <button className="bg-primary-hover hover:bg-blue-800 text-white rounded-lg py-2 px-4 font-semibold shadow-sm border border-blue-500 transition-all duration-250 cursor-pointer">
                Add Transaction
              </button>
            </Link>
          </div>
        </div>
        
        {/* Right side floating balance box */}
        <div className="hidden lg:block absolute right-8 bottom-6 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl w-64 text-right">
          <div className="text-xs text-blue-200 uppercase font-bold tracking-wider">Net Balance</div>
          <div className={`text-2xl font-black mt-1 ${balance >= 0 ? 'text-white' : 'text-rose-200'}`}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-blue-200 mt-2">
            Based on {transactions.length} operations
          </div>
        </div>
      </div>

      {/* Grid of Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Savings Ratio */}
        <div className="card-container flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <h3 className="text-base font-bold mb-3">Savings Ratio</h3>
            <div className="h-24 bg-gray-50 dark:bg-gray-800/40 rounded-lg flex flex-col justify-center items-center">
              <div className="text-2xl font-black text-primary dark:text-dark-primary">
                {income > 0 ? `${Math.max(0, Math.round(((income - expenses) / income) * 100))}%` : '0%'}
              </div>
            </div>
          </div>
          <Link to="/dashboard" className="text-xs font-bold text-primary dark:text-dark-primary hover:underline mt-4">
            Analysis Details →
          </Link>
        </div>

        {/* Metric 2: Record New Spend */}
        <div className="card-container flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <h3 className="text-base font-bold mb-3">Record Spend</h3>
            <div className="h-24 bg-gray-50 dark:bg-gray-800/40 rounded-lg flex flex-col justify-center items-center text-2xl">
              📥
            </div>
          </div>
          <Link to="/transactionform" className="text-xs font-bold text-primary dark:text-dark-primary hover:underline mt-4">
            Add Transaction →
          </Link>
        </div>

        {/* Metric 3: Total Logs */}
        <div className="card-container flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <h3 className="text-base font-bold mb-3">Total Operations</h3>
            <div className="h-24 bg-gray-50 dark:bg-gray-800/40 rounded-lg flex flex-col justify-center items-center">
              <div className="text-2xl font-black text-brand-text dark:text-white">
                {transactions.length}
              </div>
            </div>
          </div>
          <Link to="/transactionhistory" className="text-xs font-bold text-primary dark:text-dark-primary hover:underline mt-4">
            View History →
          </Link>
        </div>

        {/* Metric 4: Category Budgets */}
        <div className="card-container flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <h3 className="text-base font-bold mb-3">Budget Targets</h3>
            <div className="h-24 bg-gray-50 dark:bg-gray-800/40 rounded-lg flex flex-col justify-center items-center text-2xl">
              🎯
            </div>
          </div>
          <Link to="/categorisation" className="text-xs font-bold text-primary dark:text-dark-primary hover:underline mt-4">
            Manage Budgets →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;