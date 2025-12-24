'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { User } from '@/types/auth.types';
import { authService } from '@/lib/services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, accessToken, startProactiveRefresh } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!accessToken;

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        if (accessToken) {
          await authService.getCurrentUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        useAuthStore.getState().clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    startProactiveRefresh();

  }, [accessToken, startProactiveRefresh]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}