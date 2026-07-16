'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { Spinner } from '../components/Spinner';
import {
  adaptLoginResponse,
  decodeToken,
  tokenStorage,
} from '@/lib/auth';
import type { LoginResponse } from '@/lib/types';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === '1';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) return setError('Please enter your username.');
    if (!password) return setError('Please enter your password.');

    setPending(true);
    try {
      const res = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { username: username.trim(), password },
        skipAuthRedirect: true,
      });

      const tokens = adaptLoginResponse(res);
      if (!tokens.accessToken) throw new Error('Server returned no access token.');

      tokenStorage.saveTokens(tokens);

      const decoded = decodeToken(tokens.accessToken);
      if (decoded) {
        tokenStorage.saveUser({
          accountId: decoded.sub,
          username: decoded.username,
          role: decoded.role,
        });
      }

      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError('Login failed. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-linen-50 bg-linen-grain">
      <aside className="hidden lg:block lg:w-1/2 relative bg-ink-900 text-linen-50">
        <div className="absolute inset-0 px-14 py-20 flex flex-col justify-between">
          <div>
            <p className="font-editorial italic text-brass-100 text-lg mb-3">
              HotelHub
            </p>
            <h1 className="font-editorial text-5xl leading-[1.05]">
              Welcome back <br />
              <span className="italic text-brass-100">to the house</span>.
            </h1>
          </div>
          <p className="font-editorial italic text-brass-100/80 max-w-sm leading-relaxed">
            “We do not greet guests. We greet neighbours whose table is set.”
          </p>
        </div>
      </aside>

      <section className="flex-1 flex items-center justify-center px-6 py-14 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="font-editorial italic text-2xl font-bold text-ink-900"
            >
              Hotel<span className="text-brass-700">Hub</span>
            </Link>
          </div>

          <h2 className="font-editorial text-4xl text-ink-900 mb-2 text-center">
            Sign in
          </h2>
          <p className="text-ink-500 text-center mb-10 text-sm">
            Continue your story with us.
          </p>

          {registered && (
            <div className="mb-6 rounded-md border border-brass-300 bg-brass-50 px-4 py-3 text-sm text-ink-900">
              Registration successful. Please sign in to continue.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={pending}
                className="w-full px-4 py-2.5 rounded-md border border-linen-300 bg-linen-50 focus:border-brass-500 focus:ring-2 focus:ring-brass-100 focus:outline-none transition disabled:opacity-50"
                placeholder="username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={pending}
                className="w-full px-4 py-2.5 rounded-md border border-linen-300 bg-linen-50 focus:border-brass-500 focus:ring-2 focus:ring-brass-100 focus:outline-none transition disabled:opacity-50"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-ink-900 hover:bg-ink-700 text-linen-50 font-semibold transition disabled:opacity-60 cursor-pointer tracking-wide"
            >
              {pending ? (
                <>
                  <Spinner className="w-5 h-5 text-linen-50" /> Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-700">
            First-time guest?{' '}
            <Link
              href="/register"
              className="font-semibold text-brass-700 hover:text-brass-500 transition"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linen-50">
          <Spinner className="w-8 h-8 text-brass-700" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
