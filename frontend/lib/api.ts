import { tokenStorage } from './auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:3000';

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuthRedirect?: boolean;
};

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  // Avoid endless re-redirects if we are already at /login.
  if (window.location.pathname.startsWith('/login')) return;
  window.location.href = '/login';
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
  };

  const accessToken = tokenStorage.getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });

  if (response.status === 401) {
    tokenStorage.clear();
    if (!opts.skipAuthRedirect) redirectToLogin();
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { message?: string }).message ?? 'Unauthorized';
    throw new ApiError(message, 401);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { message?: string | string[] }).message ??
      `Request failed: ${response.status}`;
    throw new ApiError(
      Array.isArray(message) ? message.join(', ') : message,
      response.status,
    );
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return undefined as unknown as T;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const apiBaseUrl = API_BASE_URL;
