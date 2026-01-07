import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { IUser } from '../types';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { setUsdToPkrRate } from '../utils/currency';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in and load settings
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      if (storedUser && authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          
          // Load currency settings
          try {
            const settingsResponse = await settingsService.getSettings();
            setUsdToPkrRate(settingsResponse.usdToPkrRate);
          } catch (error) {
            console.error('Failed to fetch settings:', error);
            // Use default rate if settings fetch fails
            setUsdToPkrRate(278.50);
          }
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
    
    // Load currency settings after login
    try {
      const settingsResponse = await settingsService.getSettings();
      setUsdToPkrRate(settingsResponse.usdToPkrRate);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Use default rate if settings fetch fails
      setUsdToPkrRate(278.50);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

