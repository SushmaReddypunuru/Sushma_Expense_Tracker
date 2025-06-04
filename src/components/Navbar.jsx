import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../compon css/Navbar.css'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo">The Expense Tracker</span>
        <button className="hamburger" onClick={toggleMenu}>
          ☰
        </button>
      </div>

      <ul className={`nav-list ${isOpen ? 'open' : ''}`}>
        <li><NavLink to="/" onClick={closeMenu}>Home</NavLink></li>
        <li><NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink></li>
        <li><NavLink to="/transactionform" onClick={closeMenu}>Transaction Form</NavLink></li>
        <li><NavLink to="/transactionhistory" onClick={closeMenu}>Transaction History</NavLink></li>
        <li><NavLink to="/categorisation" onClick={closeMenu}>Set Category</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;
