"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface AuthFormProps {
  initialStateProp: 'login' | 'signup';
  onClosePopup: () => void; // Optional: If the form needs to trigger close
}

const AuthForm: React.FC<AuthFormProps> = ({ initialStateProp, onClosePopup }) => {
  const { login } = useAuth(); // Get login function from context
  const [isSignUp, setIsSignUp] = useState(initialStateProp === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Only for sign up
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update isSignUp state if initialStateProp changes while the popup is open
  useEffect(() => {
    setIsSignUp(initialStateProp === 'signup');
    setError(null); // Reset error when switching forms
    // Reset fields when switching forms
    setEmail('');
    setPassword('');
    setFullName('');
  }, [initialStateProp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
    const payload = isSignUp ? { email, password, fullName } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isSignUp ? 'Sign up failed' : 'Sign in failed'));
      }

      if (isSignUp) {
        // Handle successful sign up
        console.log('Sign up successful:', data);
        alert('Sign up successful! Please log in.'); // Simple feedback
        setIsSignUp(false); // Switch to login form
        // Reset fields for login
        setPassword('');
        // Keep email potentially
        // setFullName(''); // Already reset or wasn't used for login
      } else {
        // Handle successful sign in
        console.log('Sign in successful:', data);
        login(data.user); // Use the login function from context
        onClosePopup(); // Close the popup on successful login
      }

    } catch (err: any) {
      console.error(`${isSignUp ? 'Sign up' : 'Sign in'} error:`, err);
      setError(err.message || `An unexpected error occurred during ${isSignUp ? 'sign up' : 'sign in'}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm"> {/* Removed bg-white, rounded-lg, shadow-md, p-6 */}
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              id="fullName"
              type="text"
              placeholder="Your Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={isSignUp}
              disabled={isLoading}
            />
          </div>
        )}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
          <button
            className={`w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="w-full sm:w-auto text-center text-sm text-blue-500 hover:text-blue-800 font-semibold"
            disabled={isLoading}
          >
            {isSignUp ? 'Have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
