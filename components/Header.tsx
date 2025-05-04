'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthPopup from './AuthPopup';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export default function Header() {
  const { user, logout } = useAuth(); // Get user and logout from context
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [initialAuthState, setInitialAuthState] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openPopup = (state: 'login' | 'signup') => {
    setInitialAuthState(state);
    setIsPopupOpen(true);
    setMobileMenuOpen(false); // Close mobile menu when opening popup
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false); // Close mobile menu on logout
  };

  return (
    <header className="bg-slate-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/" className="hover:text-slate-300 transition-colors">Todo App</Link>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden flex items-center focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            {mobileMenuOpen ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            ) : (
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
            )}
          </svg>
        </button>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          {user ? (
            <div className="flex items-center space-x-4">
              <span>Welcome, {user.full_name || user.email}!</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <button onClick={() => openPopup('login')} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded transition-colors">
                Login
              </button>
              <button onClick={() => openPopup('signup')} className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded transition-colors">
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-slate-800 rounded p-4 shadow-inner">
          {user ? (
            <div className="flex flex-col space-y-3">
              <span className="text-center">Welcome, {user.full_name || user.email}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors w-full"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => openPopup('login')} 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors w-full"
              >
                Login
              </button>
              <button 
                onClick={() => openPopup('signup')} 
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors w-full"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
      
      {!user && (
        <AuthPopup isOpen={isPopupOpen} onClose={closePopup} initialState={initialAuthState} />
      )}
    </header>
  );
}