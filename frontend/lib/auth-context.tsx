"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { apiRequest } from "./api";

interface DecodedToken {
  sub: string;
  username: string;
  role: string;
  exp: number;
}

interface User {
  accountId: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (fields: Record<string, string>) => Promise<{ message: string; customerId: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readInitialUser(): User | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp * 1000 > Date.now()) {
      return {
        accountId: decoded.sub,
        username: decoded.username,
        role: decoded.role,
      };
    }
    localStorage.removeItem("token");
  } catch {
    localStorage.removeItem("token");
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(readInitialUser);
  const router = useRouter();

  const login = async (username: string, password: string) => {
    const res = await apiRequest<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    const token = res.accessToken;
    localStorage.setItem("token", token);
    const decoded = jwtDecode<DecodedToken>(token);
    const authedUser = {
      accountId: decoded.sub,
      username: decoded.username,
      role: decoded.role,
    };
    setUser(authedUser);

    if (authedUser.role === "Manager" || authedUser.role === "Receptionist" || authedUser.role === "Saler") {
      router.push("/admin");
    } else if (authedUser.role === "Cleaner" || authedUser.role === "Maintainer") {
      router.push("/tasks");
    } else {
      router.push("/");
    }
  };

  const register = async (fields: Record<string, string>) => {
    return apiRequest<{ message: string; customerId: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(fields),
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
