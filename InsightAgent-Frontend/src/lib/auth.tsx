'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from './api';

// Helper to set cookie from client-side
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  tier: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          // Sync cookie with localStorage token so middleware stays in sync
          setCookie('accessToken', token, 7);
        } catch (error) {
          // Token invalid, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          deleteCookie('accessToken');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Redirect authenticated users away from auth pages (client-side)
  // This replaces the middleware redirect which can't validate tokens
  useEffect(() => {
    if (!isLoading && user && (pathname === '/login' || pathname === '/register')) {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    
    // Store in both localStorage and cookies
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setCookie('accessToken', data.accessToken, 7);
    setUser(data.user);
    
    // Redirect to the page they were trying to access, or home
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    router.push(from || '/');
  };

  const register = async (email: string, password: string, name?: string) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    
    // Store in both localStorage and cookies
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setCookie('accessToken', data.accessToken, 7);
    setUser(data.user);
    
    router.push('/');
  };

  const logout = () => {
    // Clear both localStorage and cookies
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    deleteCookie('accessToken');
    setUser(null);
    router.push('/login');
  };



  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
