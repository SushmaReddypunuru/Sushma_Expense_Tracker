import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';

function TransactionHistory() {
  const { transactions, fetchTransactions, deleteTransaction, editTransaction, loadingTransactions, balance } = useTransactions();
  const { categories } = useCategories();
  const location = useLocation();

  // Filter & Search parameters (bound to Python SQL backend API query)
  const [searchT, setSearchT] = useState('');
  const [typef, setTypef] = useState('all');
  const [categF, setCategF] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState('date-desc');

  // Inline Editor states
  const [eid, setEid] = useState(null);
  const [editData, setEditData] = useState({
    amount: '',
    date: '',
    category: '',
    description: '',
    recurring: false,
    tags: '',
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync parameters from Navbar Search
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    
    if (cat) setCategF(cat);
    if (q) setSearchT(decodeURIComponent(q));
  }, [location]);

  // Trigger backend query whenever any filter input modifies (Python filters logic)
  useEffect(() => {
    fetchTransactions({
      search: searchT,
      type: typef,
      category: categF,
      start_date: startDate,
      end_date: endDate,
      sort_by: sortField
    });
  }, [searchT, typef, categF, startDate, endDate, sortField]);

  // Start editor
  const startEditing = (t) => {
    setEid(t.id);
    setEditData({
      amount: t.amount,
      date: t.date,
      category: t.category,
      description: t.description || '',
      recurring: t.recurring,
      tags: t.tags || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save changes
  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    const amt = parseFloat(editData.amount);
    if (isNaN(amt) || amt <= 0) {
      return showNotification("Amount must be greater than 0.", "error");
    }

    const oldTx = transactions.find(t => t.id === id);
    if (oldTx) {
      const oldEffect = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount;
      const newEffect = oldTx.type === 'income' ? amt : -amt;
      const netChange = newEffect - oldEffect;
      if (balance + netChange < 0) {
        const confirmProceed = window.confirm(
          `Saving this edit will result in a negative overall balance of ₹${(balance + netChange).toFixed(2)}. Do you want to proceed?`
        );
        if (!confirmProceed) return;
      }
    }

    const res = await editTransaction({ id, ...editData, amount: amt });
    if (res.success) {
      showNotification("Transaction updated successfully!");
      setEid(null);
      fetchTransactions({
        search: searchT,
        type: typef,
        category: categF,
        start_date: startDate,
        end_date: endDate,
        sort_by: sortField
      });
    } else {
      showNotification(res.message, "error");
    }
  };

  // Delete handler
  const handleDeleteClick = async (t) => {
    if (t.type === 'income' && balance - t.amount < 0) {
      const confirmProceed = window.confirm(
        `Deleting this income transaction will result in a negative overall balance of ₹${(balance - t.amount).toFixed(2)}. Do you want to proceed?`
      );
      if (!confirmProceed) return;
    }

    if (confirm("Are you sure you want to permanently delete this transaction record?")) {
      const res = await deleteTransaction(t);
      if (res.success) {
        showNotification("Transaction deleted successfully.");
      } else {
        showNotification(res.message, "error");
      }
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      return showNotification("No transactions to export.", "error");
    }

    const headers = ["ID", "Type", "Category", "Date", "Description", "Tags", "Amount", "Recurring"];
    const rows = transactions.map(t => [
      t.id,
      t.type.toUpperCase(),
      `"${t.category}"`,
      t.date,
      `"${t.description || ''}"`,
      `"${t.tags || ''}"`,
      t.amount,
      t.recurring ? "YES" : "NO"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("CSV ledger exported successfully!");
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10 print:p-0 print:bg-white print:text-black">
      
      {/* Title */}
      <div className="border-b border-brand-border dark:border-dark-border pb-3 print:hidden">
        <h1 className="text-xl md:text-2xl font-bold text-brand-text dark:text-white">
          Transaction History
        </h1>
      </div>

      {/* Dynamic notifications */}
      {notification && (
        <div className="p-4 rounded-lg border flex items-center justify-between transition-all duration-300 shadow-xs print:hidden bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
          <p>{notification.message}</p>
          <button onClick={() => setNotification(null)} className="text-xs font-bold hover:underline cursor-pointer opacity-70">Close</button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="card-container space-y-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          
          {/* Keyword Search */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Search description/tags</label>
            <input 
              type="text" 
              placeholder="Starbucks, work..." 
              value={searchT} 
              onChange={(e) => setSearchT(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Type</label>
            <select 
              value={typef} 
              onChange={(e) => setTypef(e.target.value)}
              className="input-field text-xs cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Category</label>
            <select 
              value={categF} 
              onChange={(e) => setCategF(e.target.value)}
              className="input-field text-xs cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">From Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">To Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          {/* Sort Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Sort by</label>
            <select 
              value={sortField} 
              onChange={(e) => setSortField(e.target.value)}
              className="input-field text-xs cursor-pointer"
            >
              <option value="date-desc">Date: Newest</option>
              <option value="date-asc">Date: Oldest</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Clear Filters & Exports toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-brand-border dark:border-dark-border text-xs">
          <div className="flex items-center gap-4">
            <span className="text-brand-text-gray dark:text-dark-text-gray font-medium">
              {loadingTransactions ? "Filtering..." : `Found ${transactions.length} rows`}
            </span>
            {(searchT || typef !== 'all' || categF !== 'all' || startDate || endDate) && (
              <button 
                onClick={() => {
                  setSearchT('');
                  setTypef('all');
                  setCategF('all');
                  setStartDate('');
                  setEndDate('');
                  setSortField('date-desc');
                }}
                className="text-primary dark:text-dark-primary font-semibold hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          
          {/* Exports */}
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="btn-secondary py-1 text-xs font-semibold"
            >
              Export to CSV
            </button>
            <button 
              onClick={handleExportPDF}
              className="btn-primary py-1 text-xs font-semibold"
            >
              Print PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Ledger Listing */}
      {transactions.length === 0 ? (
        <div className="card-container text-center py-12 print:border print:border-black">
          <p className="text-sm font-semibold text-brand-text-gray dark:text-dark-text-gray print:text-black">No transaction records found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden print:block text-center space-y-1 mb-6 border-b border-black pb-4">
            <h1 className="text-xl font-bold uppercase tracking-wide">Expense Ledger Report</h1>
            <p className="text-xs text-gray-500">Compiled on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block card-container overflow-hidden !p-0 print:border print:border-black print:rounded-none">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border text-sm print:divide-black">
              <thead className="bg-gray-50 dark:bg-gray-800/40 text-xs font-bold uppercase tracking-wider text-brand-text-gray dark:text-gray-200 print:bg-gray-200 print:text-black">
                <tr>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-left">Tags</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border bg-white dark:bg-dark-card print:divide-black">
                {transactions.map((t) => {
                  const isEditing = eid === t.id;

                  return (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/20 transition-colors print:text-black">
                      {isEditing ? (
                        /* Inline Edit Form */
                        <td colSpan="7" className="p-4 bg-gray-50 dark:bg-dark-bg/40">
                          <form onSubmit={(e) => handleEditSubmit(e, t.id)} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Category</label>
                              <select 
                                name="category" 
                                value={editData.category} 
                                onChange={handleEditChange} 
                                className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                              >
                                {categories
                                  .filter(cat => {
                                    const catType = cat.type || 'expense';
                                    return catType === t.type || catType === 'both';
                                  })
                                  .map((cat) => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                  ))
                                }
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Date</label>
                              <input 
                                type="date" 
                                name="date" 
                                value={editData.date} 
                                onChange={handleEditChange} 
                                className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Description</label>
                              <input 
                                type="text" 
                                name="description" 
                                value={editData.description} 
                                onChange={handleEditChange} 
                                className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Tags</label>
                              <input 
                                type="text" 
                                name="tags" 
                                value={editData.tags} 
                                onChange={handleEditChange} 
                                className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Amount (₹)</label>
                              <input 
                                type="number" 
                                name="amount" 
                                value={editData.amount} 
                                onChange={handleEditChange} 
                                className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                                step="any"
                                min="0.01"
                                required
                              />
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <label className="flex items-center gap-1 text-xs text-brand-text-gray dark:text-dark-text-gray font-semibold select-none cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  name="recurring" 
                                  checked={editData.recurring} 
                                  onChange={handleEditChange}
                                />
                                Recurring
                              </label>
                              
                              <div className="flex gap-2">
                                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer shadow-xs">Save</button>
                                <button type="button" onClick={() => setEid(null)} className="bg-gray-300 hover:bg-gray-400 text-brand-text rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer">Cancel</button>
                              </div>
                            </div>
                          </form>
                        </td>
                      ) : (
                        /* Read-only row */
                        <>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                              t.type === 'income' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 print:bg-transparent print:text-black' 
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 print:bg-transparent print:text-black'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-brand-text dark:text-white">{t.category}</td>
                          <td className="py-3 px-4 text-brand-text-gray dark:text-dark-text-gray">{t.date}</td>
                          <td className="py-3 px-4 italic text-gray-400 max-w-[200px] truncate print:text-black">
                            {t.description ? `"${t.description}"` : '—'}
                          </td>
                          <td className="py-3 px-4">
                            {t.tags ? (
                              <div className="flex flex-wrap gap-1">
                                {t.tags.split(',').map((tag, idx) => (
                                  <span key={idx} className="bg-gray-55 dark:bg-[#2d3748] px-1.5 py-0.5 text-[10px] rounded text-brand-text-gray dark:text-dark-text-gray print:bg-transparent print:text-black print:border">
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : '—'}
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${
                            t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-650 dark:text-rose-400'
                          } print:text-black`}>
                            {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2 print:hidden">
                            <button 
                              onClick={() => startEditing(t)}
                              className="text-primary hover:text-primary-hover dark:text-dark-primary dark:hover:text-dark-primary-hover text-xs font-bold hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(t)}
                              className="text-rose-500 hover:text-rose-700 text-xs font-bold hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (Hidden during prints) */}
          <div className="md:hidden space-y-4 print:hidden">
            {transactions.map((t) => {
              const isEditing = eid === t.id;

              return (
                <div key={t.id} className="card-container space-y-3">
                  {isEditing ? (
                    <form onSubmit={(e) => handleEditSubmit(e, t.id)} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-gray-400">Category</label>
                          <select 
                            name="category" 
                            value={editData.category} 
                            onChange={handleEditChange} 
                            className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                          >
                            {categories
                              .filter(cat => {
                                const catType = cat.type || 'expense';
                                return catType === t.type || catType === 'both';
                              })
                              .map((cat) => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                              ))
                            }
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-gray-400">Date</label>
                          <input 
                            type="date" 
                            name="date" 
                            value={editData.date} 
                            onChange={handleEditChange} 
                            className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Description</label>
                        <input 
                          type="text" 
                          name="description" 
                          value={editData.description} 
                          onChange={handleEditChange} 
                          className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Tags</label>
                        <input 
                          type="text" 
                          name="tags" 
                          value={editData.tags} 
                          onChange={handleEditChange} 
                          className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 items-center">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-gray-400">Amount (₹)</label>
                          <input 
                            type="number" 
                            name="amount" 
                            value={editData.amount} 
                            onChange={handleEditChange} 
                            className="w-full bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none"
                            step="any"
                            min="0.01"
                            required
                          />
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-brand-text-gray dark:text-dark-text-gray font-semibold select-none cursor-pointer mt-4">
                          <input 
                            type="checkbox" 
                            name="recurring" 
                            checked={editData.recurring} 
                            onChange={handleEditChange}
                          />
                          Recurring
                        </label>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer shadow-xs">Save</button>
                        <button type="button" onClick={() => setEid(null)} className="bg-gray-300 hover:bg-gray-400 text-brand-text rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    /* Read-only mobile Card */
                    <>
                      <div className="flex justify-between items-start">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          t.type === 'income' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {t.type}
                        </span>
                        
                        <span className={`font-bold text-lg ${
                          t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="font-semibold text-brand-text dark:text-white">{t.category}</div>
                        <div className="text-xs text-brand-text-gray dark:text-dark-text-gray">{t.date}</div>
                        {t.description && (
                          <p className="text-xs text-gray-450 italic">"{t.description}"</p>
                        )}
                        {t.tags && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {t.tags.split(',').map((tag, idx) => (
                              <span key={idx} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[9px] rounded text-brand-text-gray dark:text-dark-text-gray">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        {t.recurring && (
                          <span className="inline-block bg-primary/10 text-primary text-[9px] font-bold px-1.5 rounded-sm uppercase mt-1">Recurring</span>
                        )}
                      </div>

                      <div className="flex gap-4 justify-end pt-2 border-t border-brand-border dark:border-dark-border">
                        <button 
                          onClick={() => startEditing(t)}
                          className="text-primary hover:text-primary-hover dark:text-dark-primary text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(t)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
