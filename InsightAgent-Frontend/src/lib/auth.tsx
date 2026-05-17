'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import api from './api';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  creditsBalance: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  register: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchLocalUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setLocalUser(data.user);
    } catch (error) {
      console.error('Failed to fetch local user details from backend:', error);
      setLocalUser(null);
    }
  };

  // Sync with Clerk session
  useEffect(() => {
    const syncUser = async () => {
      if (!clerkLoaded) return;

      if (clerkUser) {
        setIsLoading(true);
        // User is logged in with Clerk. Fetch/sync local PostgreSQL user details (including credits)
        await fetchLocalUser();
      } else {
        setLocalUser(null);
      }
      setIsLoading(false);
    };

    syncUser();
  }, [clerkUser, clerkLoaded]);

  // Redirect authenticated users away from auth pages (client-side)
  useEffect(() => {
    if (!isLoading && localUser && (pathname?.startsWith('/login') || pathname?.startsWith('/register'))) {
      router.push('/');
    }
  }, [localUser, isLoading, pathname, router]);

  const login = () => {
    router.push('/login');
  };

  const register = () => {
    router.push('/register');
  };

  const logout = async () => {
    setIsLoading(true);
    await signOut();
    setLocalUser(null);
    setIsLoading(false);
    router.push('/login');
  };

  const refreshUser = async () => {
    if (clerkUser) {
      await fetchLocalUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: localUser,
        isLoading: isLoading || !clerkLoaded,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
