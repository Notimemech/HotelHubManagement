import { jwtDecode } from 'jwt-decode';
import {
  DecodedToken,
  LoginResponse,
  RegisterResponse,
  Tokens,
  UserProfile,
} from './types';

const ACCESS_TOKEN_KEY = 'hh.accessToken';
const REFRESH_TOKEN_KEY = 'hh.refreshToken';
const USER_KEY = 'hh.user';

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const tokenStorage = {
  saveTokens(tokens: Tokens): void {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  saveUser(user: UserProfile): void {
    if (!isBrowser()) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  getUser(): UserProfile | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },
  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded) return true;
  // 5s safety window
  return decoded.exp * 1000 - 5_000 <= Date.now();
}

// Adapts the legacy `{ token }` shape into the target Tokens object so callers
// only ever see `{ accessToken, refreshToken }`.
export function adaptLoginResponse(res: LoginResponse): Tokens {
  if (res.accessToken) {
    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken ?? '',
    };
  }
  if (res.token) {
    return { accessToken: res.token, refreshToken: '' };
  }
  return { accessToken: '', refreshToken: '' };
}

export type { LoginResponse, RegisterResponse, Tokens, UserProfile };
