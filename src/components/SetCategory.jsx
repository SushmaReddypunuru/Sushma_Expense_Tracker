import React, { useState } from 'react';
import { useCategories } from '../context/CategoryContext';
import { AddToLs } from '../localstorage';
import '../compon css/Categerise.css'

function SetCategory() {
  console.log("SetCategory rendered");

  const { categories, addcategory, deletecategory } = useCategories();

  const [newc, setNewc] = useState("");
  const [selectedToDelete, setSelectedToDelete] = useState("");

  const handleChange = (e) => {
    setNewc(e.target.value);
  };

  const handleSubmit = () => {
    if (!newc.trim()) return alert("Category cannot be empty.");
    addcategory(newc.trim());
    setNewc("");
  };

  const handleDeleteChange = (e) => {
    setSelectedToDelete(e.target.value);
  };

  const handleDelete = () => {
    if (!selectedToDelete) return alert("Please select a category to delete.");
    deletecategory(selectedToDelete);
    setSelectedToDelete("");
  };



  return (
    <div className="set-category-container">
      <h1 style={{ textAlign: "center" }}>Categorization</h1>
      <ul>
        {categories.map((cat) => (
          <li key={cat}>{cat}</li>
        ))}
      </ul>

      <h3>Add New Category</h3>
      <input
        name='addnew'
        type='text'
        placeholder='Category'
        onChange={handleChange}
        value={newc}
      />
      <button onClick={handleSubmit}>Add</button>

      <h3>Delete Category</h3>
      <select name="category" value={selectedToDelete} onChange={handleDeleteChange}>
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}

export default SetCategory;
