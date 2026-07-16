"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "../components/Spinner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{9,15}$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.username.trim()) return setError("Vui lòng nhập tên đăng nhập.");
    if (!form.fullName.trim()) return setError("Vui lòng nhập họ và tên.");
    if (form.email && !EMAIL_REGEX.test(form.email)) return setError("Email không hợp lệ.");
    if (form.phone && !PHONE_REGEX.test(form.phone)) return setError("Số điện thoại chỉ chứa 9-15 chữ số.");
    if (form.password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự.");
    if (form.password !== form.confirmPassword) return setError("Mật khẩu xác nhận không khớp.");

    setPending(true);
    try {
      await register({
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim() || "",
        phone: form.phone.trim() || "",
        password: form.password,
      });
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-zinc-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block text-2xl font-bold tracking-tight text-zinc-900">
            Hotel<span className="text-amber-600">Hub</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">Tạo tài khoản</h1>
          <p className="mt-1 text-sm text-zinc-500">Đăng ký để bắt đầu trải nghiệm.</p>
        </div>

        {error && (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Tên đăng nhập *</label>
            <input
              type="text"
              value={form.username}
              onChange={update("username")}
              disabled={pending}
              autoComplete="username"
              className="w-full px-4 py-2.5 rounded-md border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Họ và tên *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={update("fullName")}
              disabled={pending}
              className="w-full px-4 py-2.5 rounded-md border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              disabled={pending}
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-md border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition disabled:opacity-50"
              placeholder="(tùy chọn)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Số điện thoại</label>
            <input
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              disabled={pending}
              autoComplete="tel"
              className="w-full px-4 py-2.5 rounded-md border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition disabled:opacity-50"
              placeholder="(tùy chọn)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Mật khẩu *</label>
            <input
              type="password"
              value={form.password}
              onChange={update("password")}
              disabled={pending}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-md border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Xác nhận mật khẩu *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              disabled={pending}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-md border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold transition disabled:opacity-60 cursor-pointer"
          >
            {pending ? <><Spinner /> Đang đăng ký...</> : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
