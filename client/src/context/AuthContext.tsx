import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient, setAccessToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data.data);
    } catch (err) {
      setUser(null);
      setAccessToken('');
    }
  };

  const refreshSession = async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { accessToken, user: userData } = response.data.data;
      setAccessToken(accessToken);
      setUser(userData);
    } catch (err) {
      setUser(null);
      setAccessToken('');
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data.data;
      setAccessToken(accessToken);
      setUser(userData);
    } catch (err) {
      setUser(null);
      setAccessToken('');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/register', { name, email, password });
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setAccessToken('');
      setUser(null);
      setLoading(false);
    }
  };

  // Perform initial session recovery
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshSession();
      } catch (err) {
        // Safe to ignore on initial load
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen to session expiry events from the Axios client
    const handleExpired = () => {
      setUser(null);
      setAccessToken('');
    };

    window.addEventListener('auth-session-expired', handleExpired);
    return () => {
      window.removeEventListener('auth-session-expired', handleExpired);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
