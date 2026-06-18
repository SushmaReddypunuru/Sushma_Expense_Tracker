import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!username.trim() || !password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setLoading(true);
    const res = await login(username.trim(), password);
    setLoading(false);
    
    if (res.success) {
      navigate('/dashboard'); // Redirect to dashboard on login success
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8 animate-fade-in">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center">
        <span className="text-2xl font-bold tracking-tight text-brand-text dark:text-white select-none">
          Expense<span className="text-primary dark:text-dark-primary">Tracker</span>
        </span>
      </div>

      {/* Login Card */}
      <div className="card-container w-full max-w-sm space-y-5">
        <h2 className="text-xl font-bold text-brand-text dark:text-white">Sign In</h2>
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs rounded font-medium flex items-center gap-2">
            <span>⚠️</span>
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold block text-brand-text-gray dark:text-dark-text-gray">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold block text-brand-text-gray dark:text-dark-text-gray">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-2 text-sm font-semibold rounded-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-[10px] text-brand-text-gray dark:text-dark-text-gray leading-tight">
          By signing in, you agree to local storage caching and cookie-based session management policies.
        </p>
      </div>

      {/* Divider */}
      <div className="w-full max-w-sm flex items-center justify-between my-5">
        <span className="w-[30%] border-b border-brand-border dark:border-dark-border"></span>
        <span className="text-xs text-brand-text-gray dark:text-dark-text-gray">New to Expense Tracker?</span>
        <span className="w-[30%] border-b border-brand-border dark:border-dark-border"></span>
      </div>

      {/* Create Account redirect link */}
      <Link to="/signup" className="w-full max-w-sm">
        <button className="w-full btn-secondary py-2 text-xs font-bold border border-brand-border cursor-pointer hover:bg-gray-50 transition-colors">
          Create your Expense Tracker account
        </button>
      </Link>
    </div>
  );
}

export default Login;
