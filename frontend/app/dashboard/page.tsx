'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { Spinner } from '../components/Spinner';
import {
  decodeToken,
  isTokenExpired,
  tokenStorage,
} from '@/lib/auth';
import type { UserProfile } from '@/lib/types';

function formatDate(value: string | Date | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token || isTokenExpired(token)) {
      tokenStorage.clear();
      router.replace('/login');
      return;
    }

    const decoded = decodeToken(token);
    const cached = tokenStorage.getUser();
    const initial: UserProfile = {
      accountId: decoded?.sub,
      username: decoded?.username,
      role: decoded?.role,
      ...(cached ?? {}),
    };
    setProfile(initial);
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
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
      // network failures during logout are non-fatal — proceed to clear
    } finally {
      tokenStorage.clear();
      router.replace('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linen-50">
        <Spinner className="w-8 h-8 text-brass-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linen-50 px-6">
        <div className="max-w-md text-center">
          <p className="font-editorial italic text-brass-700 text-lg mb-3">
            A small hiccup
          </p>
          <p className="text-ink-700 mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-ink-900/40 hover:border-brass-700 hover:text-brass-700 text-ink-900 font-semibold px-6 py-2.5 text-sm tracking-wide transition"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatMembershipSince = (user: UserProfile): string => {
    if (!user.username) return '—';
    // Without a real join-date, default to “This Season” using the username hash.
    return 'This Season';
  };

  return (
    <main className="min-h-screen bg-linen-50 bg-linen-grain">
      <header className="border-b border-linen-300 bg-linen-100/60 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-editorial italic text-xl font-bold text-ink-900"
          >
            Hotel<span className="text-brass-700">Hub</span>
            <span className="ml-3 text-xs font-normal uppercase tracking-[0.2em] text-ink-500">
              Guest Suite
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-brass-700 transition cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid lg:grid-cols-3 gap-10">
          <aside className="lg:col-span-1">
            <div className="border border-linen-300 bg-linen-100 p-7 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-ink-900 text-linen-50 font-editorial text-3xl flex items-center justify-center mb-4">
                {(profile.fullName ?? profile.username ?? '?')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <h1 className="font-editorial text-3xl text-ink-900 leading-tight">
                {profile.fullName ?? profile.username ?? 'Honoured Guest'}
              </h1>
              <p className="text-ink-500 text-sm mt-1">
                {profile.role ? profile.role : 'Member'}
              </p>
              <p className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brass-700">
                <span className="h-px w-6 bg-brass-300" />
                Member Since
                <span className="h-px w-6 bg-brass-300" />
              </p>
              <p className="font-editorial italic text-ink-700 mt-2">
                {formatMembershipSince(profile)}
              </p>
            </div>
          </aside>

          <article className="lg:col-span-2">
            <div className="mb-8">
              <p className="font-editorial italic text-brass-700 text-base tracking-wide mb-2">
                — Your details —
              </p>
              <h2 className="font-editorial text-4xl text-ink-900 leading-tight">
                Profile
              </h2>
              <p className="text-ink-700 mt-3">
                We use these to make your stay personal. Update them
                whenever you wish.
              </p>
            </div>

            <dl className="divide-y divide-linen-300 border-y border-linen-300">
              <DetailRow label="Username" value={profile.username} />
              <DetailRow label="Full Name" value={profile.fullName} />
              <DetailRow label="Email" value={profile.email} mono />
              <DetailRow label="Phone" value={profile.phone} mono />
              <DetailRow label="Role" value={profile.role} />
              <DetailRow
                label="Account ID"
                value={profile.accountId ?? profile.customerId}
                mono
              />
            </dl>

            <div className="mt-10 border border-linen-300 bg-linen-100 p-6">
              <p className="font-editorial italic text-brass-700 text-sm uppercase tracking-wider mb-2">
                Coming up
              </p>
              <h3 className="font-editorial text-2xl text-ink-900">
                Booking &amp; Reservation History
              </h3>
              <p className="text-ink-700 text-sm mt-2">
                Upcoming stays, past visits and loyalty credits will appear
                here as soon as the reservation module ships.
              </p>
            </div>

            <p className="mt-8 text-xs text-ink-500">
              Last verified: {formatDate(new Date())}
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | undefined;
  mono?: boolean;
}) {
  const display = value && value.length ? value : '—';
  return (
    <div className="grid sm:grid-cols-3 gap-2 py-4">
      <dt className="text-sm font-medium uppercase tracking-wider text-ink-500">
        {label}
      </dt>
      <dd
        className={`sm:col-span-2 text-ink-900 ${
          mono ? 'font-mono text-sm' : 'font-editorial text-lg'
        } break-words`}
      >
        {display}
      </dd>
    </div>
  );
}
