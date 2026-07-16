"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";
import { Spinner } from "../components/Spinner";

const ALLOWED = ["Manager", "Receptionist", "Saler"];

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && !ALLOWED.includes(user.role)) {
      router.push(user.role === "Cleaner" || user.role === "Maintainer" ? "/tasks" : "/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
            Hotel<span className="text-amber-600">Hub</span>
            <span className="ml-3 text-sm font-normal text-zinc-500">Admin Area</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">{user.username}</p>
              <p className="text-xs text-amber-700 font-semibold">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-md hover:bg-zinc-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="rounded-2xl bg-white border border-zinc-200 p-10 text-center">
          <p className="text-amber-700 text-sm font-semibold tracking-widest uppercase mb-2">Quản trị</p>
          <h1 className="text-3xl font-bold text-zinc-900 mb-3">Khu vực quản lý</h1>
          <p className="text-zinc-500 max-w-md mx-auto">
            Chào mừng {user.username}. Khu vực quản trị sẽ được phát triển trong giai đoạn tiếp theo (quản lý phòng, đặt phòng, khách hàng...).
          </p>
        </div>
      </main>
    </div>
  );
}
