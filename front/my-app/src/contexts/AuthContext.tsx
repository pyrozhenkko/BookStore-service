import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type  { User } from '../types';
import { mockUsers } from '../services/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isEmployee: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    // Mock login - in real app, this would call backend API
    const user = mockUsers.find(u => u.email === email);
    
    if (user && !user.isBlocked) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isEmployee = currentUser?.role === 'employee';
  const isCustomer = currentUser?.role === 'customer';
  const isAdmin = currentUser?.role === 'admin';
  const isGuest = currentUser === null;

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      isEmployee,
      isAdmin, 
      isCustomer, 
      isGuest 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
