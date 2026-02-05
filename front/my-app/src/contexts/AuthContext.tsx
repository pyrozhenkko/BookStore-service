import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  balance: number | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUserFromTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isEmployee: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(me: { id: string | number; email: string; name: string; role: string }): User {
  const role = me.role === 'ADMIN' ? 'admin' : me.role === 'EMPLOYEE' ? 'employee' : 'customer';
  return { id: me.id, email: me.email, name: me.name, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setCurrentUser(null);
      setBalance(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authService.getCurrentUser();
      setCurrentUser(toUser(me));
      setBalance(me.balance != null ? Number(me.balance) : null);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setCurrentUser(null);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('oauth-callback')) {
      const params = new URLSearchParams(hash.split('?')[1] || '');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        window.history.replaceState(null, '', window.location.pathname + '#' + window.location.pathname);
        setUserFromTokens(accessToken, refreshToken);
      }
    }
  }, []);

  const setUserFromTokens = useCallback(async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    await fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { accessToken, refreshToken } = await authService.login(email, password);
      await setUserFromTokens(accessToken, refreshToken);
      return true;
    } catch {
      return false;
    }
  }, [setUserFromTokens]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
      setBalance(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const isEmployee = currentUser?.role === 'employee';
  const isCustomer = currentUser?.role === 'customer';
  const isAdmin = currentUser?.role === 'admin';
  const isGuest = currentUser === null;

  return (
    <AuthContext.Provider value={{
      currentUser,
      balance,
      login,
      logout,
      setUserFromTokens,
      refreshUser,
      isEmployee,
      isAdmin,
      isCustomer,
      isGuest,
      isLoading,
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
