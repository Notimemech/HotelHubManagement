"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "./Sidebar";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Spinner } from "@/app/components/Spinner";
import { useRouter } from "next/navigation";

const ALLOWED = ["Manager", "Receptionist", "Saler"];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && !ALLOWED.includes(user.role)) {
      router.push(user.role === "Cleaner" || user.role === "Maintainer" ? "/tasks" : "/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Spinner className="w-8 h-8 text-amber-600" />
      </div>
    );
  }

  if (!ALLOWED.includes(user.role)) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar role={user.role} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6 shrink-0">
          <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
            Hotel<span className="text-amber-600">Hub</span>
            <span className="ml-2 text-sm font-normal text-zinc-400">Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">{user.username}</p>
              <p className="text-xs font-semibold text-amber-700 bg-amber-50 rounded px-1.5 inline-block">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-md hover:bg-zinc-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-zinc-50 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}