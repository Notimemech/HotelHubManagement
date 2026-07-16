'use client';

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from './api';
import { adaptLoginResponse, decodeToken, tokenStorage } from './auth';
import type { LoginResponse } from './types';

interface User {
  accountId: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    fields: Record<string, string>,
  ) => Promise<{ message: string; customerId: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readInitialUser(): User | null {
  const token = tokenStorage.getAccessToken();
  if (!token) return null;
  try {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp * 1000 > Date.now()) {
      return {
        accountId: decoded.sub,
        username: decoded.username,
        role: decoded.role,
      };
    }
    tokenStorage.clear();
  } catch {
    tokenStorage.clear();
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(readInitialUser);
  const router = useRouter();

  const login = async (username: string, password: string) => {
    const res = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
      skipAuthRedirect: true,
    });

    const tokens = adaptLoginResponse(res);
    tokenStorage.saveTokens(tokens);

    const decoded = decodeToken(tokens.accessToken);
    const authedUser: User = {
      accountId: decoded?.sub ?? '',
      username: decoded?.username ?? username,
      role: decoded?.role ?? 'User',
    };
    tokenStorage.saveUser(authedUser);
    setUser(authedUser);

    if (['Manager', 'Receptionist', 'Saler'].includes(authedUser.role)) {
      router.push('/admin');
    } else if (['Cleaner', 'Maintainer'].includes(authedUser.role)) {
      router.push('/tasks');
    } else {
      router.push('/dashboard');
    }
  };

  const register = async (fields: Record<string, string>) => {
    return apiFetch<{ message: string; customerId: string }>('/auth/register', {
      method: 'POST',
      body: fields,
    });
  };

  const logout = async () => {
    const refresh = tokenStorage.getRefreshToken();
    try {
      if (refresh) {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: { refreshToken: refresh },
          skipAuthRedirect: true,
        });
      }
    } catch {
      // non-fatal
    } finally {
      tokenStorage.clear();
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading: false, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
