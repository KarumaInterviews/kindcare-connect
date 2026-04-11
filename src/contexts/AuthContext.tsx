import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authApi, type User as ApiUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  apiUser: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend user → frontend User shape
const toFrontendUser = (u: ApiUser): User => ({
  id: String(u.id),
  name: `${u.firstName} ${u.lastName}`,
  email: u.email,
  role: u.role,
  avatar: u.profilePicture ?? undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try {
        const parsed: ApiUser = JSON.parse(stored);
        setApiUser(parsed);
        setUser(toFrontendUser(parsed));
      } catch { /* corrupted storage */ }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: u, token, refreshToken } = await authApi.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(u));
      setApiUser(u);
      setUser(toFrontendUser(u));
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      const [firstName, ...rest] = name.trim().split(' ');
      const lastName = rest.join(' ') || firstName;
      const { user: u, token, refreshToken } = await authApi.register({
        firstName,
        lastName,
        email,
        password,
        role,
      });
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(u));
      setApiUser(u);
      setUser(toFrontendUser(u));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setApiUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, apiUser, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
