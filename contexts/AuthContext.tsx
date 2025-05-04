'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the user type based on your Prisma schema (adjust fields as needed)
interface User {
  id: string;
  email: string;
  full_name: string | null;
  // Add other relevant user fields if necessary
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean; // Add loading state
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until checked

  // Check for persisted user data on initial load (optional, using localStorage)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('authUser'); // Clear corrupted data
    } finally {
       setIsLoading(false); // Finished loading
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    try {
       localStorage.setItem('authUser', JSON.stringify(userData)); // Persist user
    } catch (error) {
        console.error("Failed to save user to localStorage", error);
    }
  };

  const logout = async () => { // Make logout async
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        // Handle logout error (e.g., show a notification)
        console.error('Logout failed:', await response.text());
        // Optionally, still clear client-side state even if server fails?
        // Or maybe show an error message and don't log out locally?
        // For now, we'll proceed to clear local state regardless.
      }

      // Clear client-side state only after successful or handled API call
      setUser(null);
      localStorage.removeItem('authUser'); // Remove persisted user

    } catch (error) {
      console.error("Error during logout API call:", error);
      // Handle network errors, etc.
      // Decide if you still want to clear local state in case of network error
    }
  };

  // Don't render children until loading is complete to avoid flicker
  if (isLoading) {
      return null; // Or a loading spinner component
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};