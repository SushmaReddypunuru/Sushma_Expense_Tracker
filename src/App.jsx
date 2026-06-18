import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CategoriesProvider } from './context/CategoryContext'
import { TransactionProvider } from './context/TransactionContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Import components
import Navbar from './components/Navbar'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import TransactionForm from './components/TransactionForm'
import TransactionHistory from './components/TransactionHistory'
import SetCategory from './components/SetCategory'
import Login from './components/Login'
import Signup from './components/Signup'

function AppContent() {
  const { user, authLoading } = useAuth();

  // Show a loading spinner while session verification is active
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary dark:border-dark-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text dark:bg-dark-bg dark:text-dark-text transition-colors duration-200">
      {/* Navbar is only rendered for logged-in users */}
      {user && <Navbar />}
      
      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <Routes>
          {user ? (
            // 1. Authenticated User Routes
            <>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactionform" element={<TransactionForm />} />
              <Route path="/transactionhistory" element={<TransactionHistory />} />
              <Route path="/categorisation" element={<SetCategory />} />
              
              {/* Redirect any other path to Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            // 2. Unauthenticated Guest Routes
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Redirect any other path to Login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </main>
      
      {/* Dark/Light Footer */}
      <footer className="bg-white dark:bg-dark-card text-brand-text-gray dark:text-dark-text-gray text-center py-5 border-t border-brand-border dark:border-dark-border mt-auto transition-colors duration-200">
        <p className="text-xs font-semibold tracking-wide">Expense Tracker | Smart Personal Finance</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    // Wrap entire app in providers
    <ThemeProvider>
      <AuthProvider>
        <CategoriesProvider>
          <TransactionProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TransactionProvider>
        </CategoriesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App