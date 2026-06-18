import React, { useState, useEffect } from 'react';
import { useCategories } from '../context/CategoryContext';

const PALETTE = [
  "#7c3aed", // Violet/Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#eab308", // Yellow
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
];

function SetCategory() {
  const { categories, addcategory, deletecategory, updatecategorybudget } = useCategories();

  // Form 1: Add Category state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");
  const [newCategoryColor, setNewCategoryColor] = useState("#7c3aed"); // Default purple
  const [colorInitialized, setColorInitialized] = useState(false);

  // Suggest a professional color that doesn't match existing categories
  const suggestColor = (currentCats = categories) => {
    const existingColors = new Set(currentCats.map(c => c.color.toLowerCase()));
    for (const color of PALETTE) {
      if (!existingColors.has(color.toLowerCase())) {
        return color;
      }
    }
    // Fallback to random color
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  // Suggest default color on initial categories load
  useEffect(() => {
    if (categories.length > 0 && !colorInitialized) {
      setNewCategoryColor(suggestColor(categories));
      setColorInitialized(true);
    }
  }, [categories, colorInitialized]);

  // Form 2: Set Budget Limit state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");

  // Alert/Notification banner state
  const [alertInfo, setAlertInfo] = useState(null);

  const triggerNotification = (message, type = "success") => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 3500);
  };

  // Form 1 Submit handler: Add Category
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    const color = newCategoryColor;
    const type = newCategoryType;

    if (!name) {
      triggerNotification("Category name cannot be empty.", "error");
      return;
    }

    // Creating category sets budget to 0 by default
    const res = await addcategory(name, 0.00, color, type);
    if (res.success) {
      triggerNotification(`Category "${name}" created successfully!`);
      setNewCategoryName("");
      // Reset color to another unique suggestion
      const simulatedCats = [...categories, { name, color, type, budget: 0 }];
      setNewCategoryColor(suggestColor(simulatedCats));
      setNewCategoryType("expense");
    } else {
      triggerNotification(res.message, "error");
    }
  };

  // Form 2 Submit handler: Set Budget Limit
  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    const name = selectedCategory;
    const limit = parseFloat(budgetLimit);

    if (!name) {
      triggerNotification("Please select an existing category.", "error");
      return;
    }
    if (isNaN(limit) || limit < 0) {
      triggerNotification("Please enter a valid positive budget amount.", "error");
      return;
    }

    const res = await updatecategorybudget(name, limit);
    if (res.success) {
      triggerNotification(`Monthly budget for "${name}" set to ₹${limit.toFixed(2)}.`);
      setSelectedCategory("");
      setBudgetLimit("");
    } else {
      triggerNotification(res.message, "error");
    }
  };

  // Delete category handler
  const handleDeleteClick = async (catName) => {
    if (confirm(`Are you sure you want to delete "${catName}"? All transactions in this category will remain, but the category limit will be lost.`)) {
      const res = await deletecategory(catName);
      if (res.success) {
        triggerNotification(`Category "${catName}" removed successfully.`);
        // Reset category selector if active
        if (selectedCategory === catName) {
          setSelectedCategory("");
        }
      } else {
        triggerNotification(res.message, "error");
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="border-b border-brand-border dark:border-dark-border pb-3">
        <h1 className="text-xl md:text-2xl font-bold text-brand-text dark:text-white">
          Category Settings
        </h1>
      </div>

      {/* Alert Notification banner */}
      {alertInfo && (
        <div className={`p-4 rounded-lg border flex items-center justify-between transition-all duration-300 shadow-xs text-sm font-medium ${
          alertInfo.type === 'error' 
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400' 
            : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
        }`}>
          <div className="flex items-center gap-2">
            <span>{alertInfo.type === 'error' ? '⚠️' : '✅'}</span>
            <p>{alertInfo.message}</p>
          </div>
          <button onClick={() => setAlertInfo(null)} className="text-xs font-bold hover:underline cursor-pointer opacity-70">Close</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column containing both forms */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Form 1: Add Category */}
          <div className="card-container">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-brand-text dark:text-white">
              <span>➕</span> Add New Category
            </h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Travel, Shopping..." 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="input-field"
                />
              </div>
              
              {/* Category Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Category Type</label>
                <select 
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value)}
                  className="input-field cursor-pointer text-xs"
                >
                  <option value="expense">Expense (Spend)</option>
                  <option value="income">Income (Deposit)</option>
                  <option value="both">Both (Income & Expense)</option>
                </select>
              </div>

              {/* Color Picker */}
              <div className="space-y-1">
                <label className="text-xs font-bold block text-brand-text-gray dark:text-dark-text-gray font-semibold mb-1">Color Tag</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-8 h-8 border border-gray-300 dark:border-dark-border rounded cursor-pointer p-0 bg-transparent"
                  />
                  <span className="text-xs text-brand-text-gray dark:text-dark-text-gray font-mono">{newCategoryColor}</span>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-2 font-semibold text-sm">
                Create Category
              </button>
            </form>
          </div>

          {/* Form 2: Set Budget Limit */}
          <div className="card-container">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-brand-text dark:text-white">
              <span>🎯</span> Set Budget Limit
            </h3>
            
            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              {/* Select Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Select Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field cursor-pointer text-xs"
                >
                  <option value="">-- Select Existing Category --</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Budget Limit */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Monthly Budget Limit (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 5000 (0 for none)" 
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="input-field"
                  min="0"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-2 font-semibold text-sm">
                Update Budget Limit
              </button>
            </form>
          </div>

        </div>

        {/* Right column: Active Categories list */}
        <div className="lg:col-span-2">
          <div className="card-container">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-brand-text dark:text-white">
              <span>🏷️</span> Active Categories ({categories.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-brand-text-gray dark:text-dark-text-gray font-bold">
                    <th className="pb-3 pr-4">Color</th>
                    <th className="pb-3 px-4">Name</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 px-4">Monthly Budget</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {categories.map((c) => {
                    const displayType = c.type || 'expense';

                    return (
                      <tr key={c.name} className="hover:bg-gray-50 dark:hover:bg-dark-border/20 transition-colors">
                        
                        {/* Color indicator */}
                        <td className="py-3.5 pr-4">
                          <span 
                            className="inline-block w-4.5 h-4.5 rounded-full border border-gray-200 dark:border-dark-border shadow-xs"
                            style={{ backgroundColor: c.color }}
                          ></span>
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4 font-semibold text-brand-text dark:text-white">
                          {c.name}
                        </td>
                        
                        {/* Type */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            displayType === 'income' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : displayType === 'expense' 
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400'
                          }`}>
                            {displayType}
                          </span>
                        </td>
                        
                        {/* Budget */}
                        <td className="py-3.5 px-4 font-medium text-brand-text-gray dark:text-dark-text-gray">
                          {c.budget > 0 ? (
                            <span>₹{c.budget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-650">— (No Limit)</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pl-4 text-right">
                          <button 
                            onClick={() => handleDeleteClick(c.name)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-semibold hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SetCategory;
