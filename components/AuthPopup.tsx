'use client';

import React from 'react';
import AuthForm from './AuthForm';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialState: 'login' | 'signup';
}

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose, initialState }) => {
  if (!isOpen) return null;

  // Prevent closing when clicking inside the popup content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-white bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out" // Added padding and transition
      onClick={onClose} // Close when clicking the overlay
    >
      <div
        className="bg-white rounded-lg shadow-xl relative max-w-md w-full p-6" // Added padding
        onClick={handleContentClick} // Prevent closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors" // Adjusted position and styling
          aria-label="Close"
        >
          &times;
        </button>
        {/* Optional: Add a title here if needed */}
        {/* <h2 className="text-xl font-semibold mb-4 text-center">{initialState === 'login' ? 'Login' : 'Sign Up'}</h2> */}
        <AuthForm initialStateProp={initialState} onClosePopup={onClose} />
      </div>
    </div>
  );
};

export default AuthPopup;
