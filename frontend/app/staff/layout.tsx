"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LogOut, ClipboardList, Wrench, UserCog } from "lucide-react";
import { Spinner } from "../components/Spinner";

const ALLOWED = ["Cleaner", "Maintainer", "Manager"];

const NAV_ITEMS = [
  { href: "/staff/cleaner", label: "Dọn phòng", icon: ClipboardList, roles: ["Cleaner", "Manager"] },
  { href: "/staff/maintainer", label: "Bảo trì", icon: Wrench, roles: ["Maintainer", "Manager"] },
  { href: "/staff/manager", label: "Phân công", icon: UserCog, roles: ["Manager"] },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!ALLOWED.includes(user.role)) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || !ALLOWED.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-amber-600" />
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
              Hotel<span className="text-amber-600">Hub</span>
              <span className="ml-3 text-sm font-normal text-zinc-500">Vận hành</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {visibleNav.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md ${
                      active
                        ? "bg-amber-50 text-amber-800"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
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
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
