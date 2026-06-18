import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usetheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { theme, toggleTheme } = usetheme();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    closeSidebar();
    setIsDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-dark-card border-b border-brand-border dark:border-dark-border sticky top-0 z-50 print:hidden transition-colors duration-200">
      {/* Top Bar for Desktop & Mobile Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Mobile Hamburger Button */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 text-brand-text-gray dark:text-dark-text-gray hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors focus:outline-none"
          aria-label="Toggle Navigation Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Brand Logo */}
        <NavLink to="/" onClick={closeSidebar} className="flex items-center gap-1.5 select-none">
          <span className="text-xl font-bold tracking-tight text-brand-text dark:text-white">
            Expense<span className="text-primary dark:text-dark-primary">Tracker</span>
          </span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-lg hover:text-primary dark:hover:text-dark-primary transition-all duration-200 ${isActive ? 'text-primary dark:text-dark-primary bg-primary/5 dark:bg-dark-primary/10' : 'text-brand-text-gray dark:text-dark-text-gray'}`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-lg hover:text-primary dark:hover:text-dark-primary transition-all duration-200 ${isActive ? 'text-primary dark:text-dark-primary bg-primary/5 dark:bg-dark-primary/10' : 'text-brand-text-gray dark:text-dark-text-gray'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/transactionform" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-lg hover:text-primary dark:hover:text-dark-primary transition-all duration-200 ${isActive ? 'text-primary dark:text-dark-primary bg-primary/5 dark:bg-dark-primary/10' : 'text-brand-text-gray dark:text-dark-text-gray'}`
            }
          >
            Add Transaction
          </NavLink>
          <NavLink 
            to="/transactionhistory" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-lg hover:text-primary dark:hover:text-dark-primary transition-all duration-200 ${isActive ? 'text-primary dark:text-dark-primary bg-primary/5 dark:bg-dark-primary/10' : 'text-brand-text-gray dark:text-dark-text-gray'}`
            }
          >
            History
          </NavLink>
          <NavLink 
            to="/categorisation" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-lg hover:text-primary dark:hover:text-dark-primary transition-all duration-200 ${isActive ? 'text-primary dark:text-dark-primary bg-primary/5 dark:bg-dark-primary/10' : 'text-brand-text-gray dark:text-dark-text-gray'}`
            }
          >
            Categories
          </NavLink>
        </nav>

        {/* Right Side Tools (Theme Toggler & Profile Dropdown) */}
        <div className="flex items-center gap-2">
          {/* Theme Toggler */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-brand-text-gray dark:text-dark-text-gray hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-all focus:outline-none"
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            )}
          </button>

          {/* User Profile Dropdown */}
          {user && (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors focus:outline-none"
              >
                <span>{user.username}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {/* Desktop dropdown menu */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-xl shadow-lg py-1.5 z-20 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border text-xs text-gray-400 font-bold uppercase tracking-wider">
                      User Options
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Slide-out Navigation Drawer */}
      <div className="md:hidden">
        {/* Overlay backdrop */}
        <div 
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 z-40 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={closeSidebar}
        ></div>

        {/* Sliding Sidebar Container */}
        <div 
          className={`fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-white dark:bg-dark-card border-r border-brand-border dark:border-dark-border p-5 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Header area */}
          <div className="flex items-center justify-between pb-5 border-b border-brand-border dark:border-dark-border mb-6">
            <span className="text-lg font-bold tracking-tight text-brand-text dark:text-white">
              Navigation
            </span>
            <button 
              onClick={closeSidebar}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg focus:outline-none"
              aria-label="Close Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Nav List links */}
          <nav className="flex-1 space-y-2 text-sm font-medium">
            <NavLink 
              to="/" 
              onClick={closeSidebar}
              className={({ isActive }) => 
                `block py-2.5 px-4 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' : 'text-brand-text-gray hover:bg-gray-100 dark:text-dark-text-gray dark:hover:bg-gray-800'}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/dashboard" 
              onClick={closeSidebar}
              className={({ isActive }) => 
                `block py-2.5 px-4 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' : 'text-brand-text-gray hover:bg-gray-100 dark:text-dark-text-gray dark:hover:bg-gray-800'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/transactionform" 
              onClick={closeSidebar}
              className={({ isActive }) => 
                `block py-2.5 px-4 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' : 'text-brand-text-gray hover:bg-gray-100 dark:text-dark-text-gray dark:hover:bg-gray-800'}`
              }
            >
              Add Transaction
            </NavLink>
            <NavLink 
              to="/transactionhistory" 
              onClick={closeSidebar}
              className={({ isActive }) => 
                `block py-2.5 px-4 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' : 'text-brand-text-gray hover:bg-gray-100 dark:text-dark-text-gray dark:hover:bg-gray-800'}`
              }
            >
              History
            </NavLink>
            <NavLink 
              to="/categorisation" 
              onClick={closeSidebar}
              className={({ isActive }) => 
                `block py-2.5 px-4 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' : 'text-brand-text-gray hover:bg-gray-100 dark:text-dark-text-gray dark:hover:bg-gray-800'}`
              }
            >
              Categories
            </NavLink>
          </nav>

          {/* Footer User logout trigger */}
          {user && (
            <div className="pt-4 border-t border-brand-border dark:border-dark-border mt-auto space-y-3">
              <div className="px-4 text-xs text-brand-text-gray dark:text-dark-text-gray">
                Logged in as: <span className="font-bold text-brand-text dark:text-white">{user.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left py-2.5 px-4 rounded-lg text-sm font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
