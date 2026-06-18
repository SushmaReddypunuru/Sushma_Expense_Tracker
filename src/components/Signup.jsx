import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Form fields state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!username.trim() || !password || !confirmPassword) {
      setErrorMsg("Please fill in all the details.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await signup(username.trim(), password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard'); // Redirect to dashboard on signup success
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 animate-fade-in">
      {/* Brand Logo Header */}
      <div className="mb-6 flex flex-col items-center">
        <span className="text-2xl font-bold tracking-tight text-brand-text dark:text-white select-none">
          Expense<span className="text-primary dark:text-dark-primary">Tracker</span>
        </span>
      </div>

      {/* Register Card */}
      <div className="card-container w-full max-w-sm space-y-5">
        <h2 className="text-xl font-bold text-brand-text dark:text-white">Create Account</h2>

        {/* Error alert banner */}
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold block text-brand-text-gray dark:text-dark-text-gray">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Action Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-2 font-semibold text-sm shadow-sm rounded-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create your account"}
          </button>
        </form>

        <p className="text-[10px] text-brand-text-gray dark:text-dark-text-gray leading-tight">
          By creating an account, you agree to local storage caching and cookie-based session management policies.
        </p>

        {/* Redirect back to Login */}
        <div className="border-t border-brand-border dark:border-dark-border pt-4 text-xs">
          <span className="text-brand-text dark:text-gray-300 font-medium">Already have an account? </span>
          <Link to="/login" className="text-primary hover:text-primary-hover dark:text-dark-primary font-bold hover:underline">
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
