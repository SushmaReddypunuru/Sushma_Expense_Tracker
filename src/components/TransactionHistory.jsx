import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import '../compon css/TransHis.css'

function TransactionHistory() {
  const { transactions, deleteTransaction, editTransaction } = useTransactions();
  const { categories } = useCategories();

  const [eid, setEid] = useState(null);
  const [editData, setEditData] = useState({
    amount: '',
    date: '',
    category: '',
    description: '',
    recurring: false,
  });

  const startEditing = (t) => {
    setEid(t.id);
    setEditData({
      amount: t.amount,
      date: t.date,
      category: t.category,
      description: t.description,
      recurring: t.recurring,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSubmit = (e, id) => {
    e.preventDefault();
    editTransaction({ id, ...editData });
    setEid(null);
  };




  const [searchT, setSearchT] = useState('');
  const [typef, setTypef] = useState('all');
  const [categF, setCategF] = useState('all');


  const filterTransact = transactions.filter((t) => {
    if (typef !== 'all' && t.type !== typef) return false;
    if (categF !== 'all' && t.category !== categF) return false;
    if (
      searchT &&
      !( t.category.toLowerCase().includes(searchT.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchT.toLowerCase()))
      )
    )
      return false;
    return true;
  })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="transaction-history-container">
      <h1>Transaction History</h1>
 
        {/*Search and filter */}
        <div className="filters">
          {/* Search */}
        <input type="text" placeholder="Search category/description" value={searchT} onChange={(e) => setSearchT(e.target.value)}
        />
        {/* Filter 1.Type */}
        <select value={typef} onChange={(e) => setTypef(e.target.value)}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        {/* Filter 2.Category */}
        <select value={categF} onChange={(e) => setCategF(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={ cat} value={cat}>{cat}</option>
          ))}
        </select>
        </div>
      

      {/* History result */}
      {filterTransact.length === 0 ? (
        <p>No transactions to display.</p>
      ) : (
        <ul className="transaction-list">
          {filterTransact.map((t) => (
            <li key={t.id} className="transaction-item">
              {eid === t.id ? (
                <form onSubmit={(e) => handleEditSubmit(e, t.id)} className="edit-form">
                  <label>Amount:
                  <input type="number" name="amount" value={editData.amount} onChange={handleEditChange} required/>
                  </label>
                  <br />
                  <label>Date:
                    <input type="date" name="date" value={editData.date} onChange={handleEditChange} required/>
                  </label>
                  <br />
                  <label>Category:
                    <select name="category" value={editData.category} onChange={handleEditChange} required>
                      {categories.map((cat) => (
                        <option key={cat.id || cat} value={cat.name || cat}>
                          {cat.name || cat}
                        </option>
                      ))}
                    </select>
                  </label>
                  <br />
                  <label>Description:
                    <input type="text" name="description" value={editData.description} onChange={handleEditChange}/>
                  </label>
                  <br />
                  <label>Recurring:
                    <input type="checkbox" name="recurring" checked={editData.recurring} onChange={handleEditChange}/>
                  </label>
                  <br />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEid(null)}>Cancel</button>
                </form>
              ) : (
                <div>
                  <strong>{t.type.toUpperCase()}:</strong> ₹{parseFloat(t.amount).toFixed(2)}
                  <br />
                  <em>{t.category}</em> on {new Date(t.date).toLocaleDateString()}
                  <br />
                  <span>Description:{t.description}</span>
                  <br />
                  {t.recurring && <span>(Recurring)</span>}
                  <br />
                  <button onClick={() => deleteTransaction(t)}>Delete</button>
                  <button onClick={() => startEditing(t)}>Edit</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TransactionHistory;
