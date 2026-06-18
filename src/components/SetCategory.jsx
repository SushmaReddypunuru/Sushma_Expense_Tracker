import React, { useState } from 'react';
import { useCategories } from '../context/CategoryContext';

function SetCategory() {
  const { categories, addcategory, deletecategory, updatecategorybudget } = useCategories();

  // Local state for the new category form
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6"); // Default blue
  const [newCategoryType, setNewCategoryType] = useState("expense");   // Default expense

  // Local state for inline editing (category name -> { budget, color, type })
  const [editingRows, setEditingRows] = useState({});

  // Alert/Notification banner state
  const [alertInfo, setAlertInfo] = useState(null);

  const triggerNotification = (message, type = "success") => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 3000);
  };

  // Add category handler
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    const budget = parseFloat(newCategoryBudget) || 0;
    const color = newCategoryColor;
    const type = newCategoryType;

    if (!name) {
      triggerNotification("Category name cannot be empty.", "error");
      return;
    }

    const res = await addcategory(name, budget, color, type);
    if (res.success) {
      triggerNotification(`Category "${name}" added successfully!`);
      setNewCategoryName("");
      setNewCategoryBudget("");
      setNewCategoryColor("#3b82f6");
      setNewCategoryType("expense");
    } else {
      triggerNotification(res.message, "error");
    }
  };

  // Delete category handler
  const handleDeleteClick = async (catName) => {
    if (confirm(`Are you sure you want to delete "${catName}"?`)) {
      const res = await deletecategory(catName);
      if (res.success) {
        triggerNotification(`Category "${catName}" removed successfully.`);
      } else {
        triggerNotification(res.message, "error");
      }
    }
  };

  // Handle local state tracking for editing inline inputs
  const handleEditChange = (catName, field, val) => {
    setEditingRows(prev => {
      const cat = categories.find(c => c.name === catName);
      const current = prev[catName] || { 
        budget: cat.budget.toString(),
        color: cat.color,
        type: cat.type || 'expense'
      };
      return {
        ...prev,
        [catName]: {
          ...current,
          [field]: val
        }
      };
    });
  };

  // Save budget/color/type changes to backend database
  const handleSaveClick = async (catName) => {
    const editState = editingRows[catName];
    if (!editState) return;

    const parsedBudget = parseFloat(editState.budget);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      triggerNotification("Please enter a valid positive budget.", "error");
      return;
    }

    const res = await updatecategorybudget(catName, parsedBudget, editState.color, editState.type);
    if (res.success) {
      triggerNotification(`Category "${catName}" updated successfully.`);
      setEditingRows(prev => {
        const copy = { ...prev };
        delete copy[catName];
        return copy;
      });
    } else {
      triggerNotification(res.message, "error");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="border-b border-brand-border dark:border-dark-border pb-3">
        <h1 className="text-xl md:text-2xl font-bold text-brand-text dark:text-white">
          Manage Categories
        </h1>
      </div>

      {/* Alert Notification */}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Add Category Form */}
        <div className="card-container md:col-span-1">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span>➕</span> Add Category
          </h3>
          
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {/* Category Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Name</label>
              <input 
                type="text" 
                placeholder="Travel, Shopping..." 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="input-field"
              />
            </div>
            
            {/* Category Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Type</label>
              <select 
                value={newCategoryType}
                onChange={(e) => setNewCategoryType(e.target.value)}
                className="input-field cursor-pointer text-xs"
              >
                <option value="expense">Expense Only</option>
                <option value="income">Income Only</option>
                <option value="both">Both (Income & Expense)</option>
              </select>
            </div>
            
            {/* Budget Limit */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-text-gray dark:text-dark-text-gray">Monthly Budget (₹)</label>
              <input 
                type="number" 
                placeholder="Limit amount (0 for none)" 
                value={newCategoryBudget}
                onChange={(e) => setNewCategoryBudget(e.target.value)}
                className="input-field"
                min="0"
              />
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

        {/* Categories list table */}
        <div className="card-container md:col-span-2">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
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
                  const editState = editingRows[c.name];
                  const isEditing = editState !== undefined;
                  
                  const displayBudget = isEditing ? editState.budget : c.budget;
                  const displayColor = isEditing ? editState.color : c.color;
                  const displayType = isEditing ? editState.type : (c.type || 'expense');

                  return (
                    <tr key={c.name} className="hover:bg-gray-50 dark:hover:bg-dark-border/20 transition-colors">
                      
                      {/* Color indicator / color input */}
                      <td className="py-3.5 pr-4">
                        {isEditing ? (
                          <input 
                            type="color" 
                            value={displayColor}
                            onChange={(e) => handleEditChange(c.name, 'color', e.target.value)}
                            className="w-7 h-7 border border-gray-300 dark:border-dark-border rounded cursor-pointer p-0 bg-transparent"
                          />
                        ) : (
                          <span 
                            className="inline-block w-4.5 h-4.5 rounded-full border border-gray-200 dark:border-dark-border shadow-xs"
                            style={{ backgroundColor: displayColor }}
                          ></span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-brand-text dark:text-white">
                        {c.name}
                      </td>
                      
                      {/* Type */}
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <select 
                            value={displayType}
                            onChange={(e) => handleEditChange(c.name, 'type', e.target.value)}
                            className="bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="both">Both</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            displayType === 'income' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : displayType === 'expense' 
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                          }`}>
                            {displayType}
                          </span>
                        )}
                      </td>
                      
                      {/* Budget */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">₹</span>
                          <input 
                            type="number"
                            value={displayBudget}
                            onChange={(e) => handleEditChange(c.name, 'budget', e.target.value)}
                            onFocus={() => {
                              if (!isEditing) {
                                setEditingRows(prev => ({
                                  ...prev,
                                  [c.name]: { budget: c.budget.toString(), color: c.color, type: c.type || 'expense' }
                                }));
                              }
                            }}
                            className="w-24 bg-white dark:bg-[#151d2a] border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            min="0"
                          />
                          
                          {/* Save Button */}
                          {isEditing && (
                            <button 
                              onClick={() => handleSaveClick(c.name)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2.5 py-1 text-xs shadow-xs cursor-pointer font-medium"
                            >
                              Save
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Delete */}
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
  );
}

export default SetCategory;
