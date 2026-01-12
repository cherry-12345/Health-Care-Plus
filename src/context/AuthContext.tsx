'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, AuthTokens, LoginResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'hospital';
  address: {
    city: string;
    state: string;
    pincode: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedTokens = localStorage.getItem('auth_tokens');
      const storedUser = localStorage.getItem('auth_user');

      if (storedTokens && storedUser) {
        try {
          const tokens: AuthTokens = JSON.parse(storedTokens);
          const userData: User = JSON.parse(storedUser);
          
          setAccessToken(tokens.accessToken);
          setUser(userData);

          // Verify token is still valid by fetching user profile
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });

          if (response.data.success) {
            setUser(response.data.data);
          } else {
            // Token might be expired, try refresh
            await refreshTokens();
          }
        } catch (error) {
          // Token expired, try to refresh
          const refreshed = await refreshTokens();
          if (!refreshed) {
            logout();
          }
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post<{ success: boolean; data: LoginResponse }>(
        `${API_URL}/api/auth/login`,
        { email, password }
      );

      if (response.data.success) {
        const { user: userData, accessToken: token, refreshToken } = response.data.data;

        setUser(userData);
        setAccessToken(token);

        localStorage.setItem('auth_tokens', JSON.stringify({ accessToken: token, refreshToken }));
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await axios.post<{ success: boolean; data: LoginResponse }>(
        `${API_URL}/api/auth/register`,
        data
      );

      if (response.data.success) {
        const { user: userData, accessToken: token, refreshToken } = response.data.data;

        setUser(userData);
        setAccessToken(token);

        localStorage.setItem('auth_tokens', JSON.stringify({ accessToken: token, refreshToken }));
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = (): void => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
  };

  const refreshTokens = async (): Promise<boolean> => {
    try {
      const storedTokens = localStorage.getItem('auth_tokens');
      if (!storedTokens) return false;

      const { refreshToken } = JSON.parse(storedTokens);

      const response = await axios.post<{
        success: boolean;
        data: { accessToken: string; refreshToken: string };
      }>(`${API_URL}/api/auth/refresh`, { refreshToken });

      if (response.data.success) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        setAccessToken(newAccessToken);
        localStorage.setItem(
          'auth_tokens',
          JSON.stringify({ accessToken: newAccessToken, refreshToken: newRefreshToken })
        );

        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout,
    refreshTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
