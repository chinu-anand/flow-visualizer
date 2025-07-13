import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import authService from '../services/authService';

// Set this to true to bypass authentication for local development
const BYPASS_AUTH = true;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AccountInfo | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (BYPASS_AUTH) {
          // In development mode, automatically set as authenticated
          console.log('🔓 Development mode: Authentication bypassed');
          setUser({ name: 'Development User', username: 'dev@example.com' } as AccountInfo);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // Normal authentication flow for production
        await authService.initialize();
        await authService.handleRedirectPromise();
        
        const account = authService.getAccount();
        setUser(account);
        setIsAuthenticated(!!account);
      } catch (error) {
        console.error('Authentication initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async () => {
    await authService.login();
  };

  const logout = () => {
    authService.logout();
  };

  const getAccessToken = async () => {
    return authService.getAccessToken();
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
