"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "../components/Spinner";

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) return setError("Vui lòng nhập tên đăng nhập.");
    if (!password) return setError("Vui lòng nhập mật khẩu.");

    setPending(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:block lg:w-1/2 relative bg-zinc-900">
        <Image
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
          alt="HotelHub lobby"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent flex flex-col justify-end p-12 text-white">
          <p className="text-amber-400 font-semibold tracking-widest uppercase text-sm mb-2">
            HotelHub
          </p>
          <h1 className="text-4xl font-bold leading-tight">
            Chào mừng trở lại <br /> với trải nghiệm 5 sao
          </h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-900">
              Hotel<span className="text-amber-600">Hub</span>
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-zinc-900 mb-2">Đăng nhập</h2>
          <p className="text-zinc-500 mb-8">Chào mừng bạn quay lại. Vui lòng nhập thông tin tài khoản.</p>

          {registered && (
            <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={pending}
                className="w-full px-4 py-2.5 rounded-md border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition disabled:opacity-50"
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={pending}
                className="w-full px-4 py-2.5 rounded-md border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition disabled:opacity-50"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold transition disabled:opacity-60 cursor-pointer"
            >
              {pending ? (
                <>
                  <Spinner /> Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-600">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-amber-700 hover:text-amber-800">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner className="w-8 h-8 text-amber-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
