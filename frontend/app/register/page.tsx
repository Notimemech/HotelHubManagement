'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { Spinner } from '../components/Spinner';
import type { RegisterResponse } from '@/lib/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{9,15}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,50}$/;

type FormState = {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const emptyForm: FormState = {
  username: '',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const update = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const validate = (): string | null => {
    if (!USERNAME_REGEX.test(form.username))
      return 'Username must be 3–50 characters (letters, digits, or underscores).';
    if (!form.fullName.trim()) return 'Please enter your full name.';
    if (form.email && !EMAIL_REGEX.test(form.email))
      return 'Email is not valid.';
    if (form.phone && !PHONE_REGEX.test(form.phone))
      return 'Phone must contain 9–15 digits.';
    if (form.password.length < 6)
      return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword)
      return 'Confirm password does not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    try {
      await apiFetch<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: {
          username: form.username.trim(),
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          password: form.password,
        },
      });
      router.push('/login?registered=1');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError('Registration failed. Please try again.');
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
              Open <br /> <span className="italic text-brass-100">our doors.</span>
            </h1>
          </div>
          <p className="font-editorial italic text-brass-100/80 max-w-sm leading-relaxed">
            “Hospitality is the slowest of arts — and the most human.”
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
            Create an account
          </h2>
          <p className="text-ink-500 text-center mb-10 text-sm">
            Reserve suites, receive curated experiences.
          </p>

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
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={update('username')}
                disabled={pending}
                autoComplete="username"
                className="w-full px-4 py-2.5 rounded-md border border-linen-300 bg-linen-50 focus:border-brass-500 focus:ring-2 focus:ring-brass-100 focus:outline-none transition disabled:opacity-50"
                placeholder="e.g. nora.thuy"
              />
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={update('fullName')}
                disabled={pending}
                autoComplete="name"
                className="w-full px-4 py-2.5 rounded-md border border-linen-300 bg-linen-50 focus:border-brass-500 focus:ring-2 focus:ring-brass-100 focus:outline-none transition disabled:opacity-50"
                placeholder="Nora Thuy"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-ink-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  disabled={pending}
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-md border border-linen-300 bg-linen-50 focus:border-brass-500 focus:ring-2 focus:ring-brass-100 focus:outline-none transition disabled:opacity-50"
                  placeholder="optional"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-ink-700 mb-1.5"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  disabled={pending}
                  autoComplete="tel"
                  className="w-full px-4 py-2.5 rounded-md border border-linen-300 bg-linen-50 focus:border-brass-500 focus:ring-2 focus:ring-brass-100 focus:outline-none transition disabled:opacity-50"
                  placeholder="optional"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={update('password')}
                disabled={pending}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-md border border-linen-300 bg-linen-50 focus:border-brass-500 focus:ring-2 focus:ring-brass-100 focus:outline-none transition disabled:opacity-50"
                placeholder="at least 6 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                disabled={pending}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-md border border-linen-300 bg-linen-50 focus:border-brass-500 focus:ring-2 focus:ring-brass-100 focus:outline-none transition disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-ink-900 hover:bg-ink-700 text-linen-50 font-semibold transition disabled:opacity-60 cursor-pointer tracking-wide"
            >
              {pending ? (
                <>
                  <Spinner className="w-5 h-5 text-linen-50" /> Creating
                  account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-700">
            Already a member?{' '}
            <Link
              href="/login"
              className="font-semibold text-brass-700 hover:text-brass-500 transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
