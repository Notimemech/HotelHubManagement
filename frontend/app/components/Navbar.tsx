"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LogOut, User, ChevronDown } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
              Hotel<span className="text-amber-600">Hub</span>
            </Link>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <a href="#rooms" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">
              Phòng
            </a>
            <a href="#services" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">
              Dịch vụ
            </a>
            <a href="#footer" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">
              Liên hệ
            </a>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 focus:outline-none cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <span>Tài khoản</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black/5 py-1 z-50">
                    <div className="px-4 py-2 border-b border-zinc-100">
                      <p className="text-xs text-zinc-400">Đăng nhập với</p>
                      <p className="text-sm font-medium text-zinc-900 truncate">{user.username}</p>
                      <p className="text-xs font-semibold text-amber-700 mt-0.5 bg-amber-50 rounded px-1.5 py-0.5 inline-block">
                        {user.role}
                      </p>
                    </div>
                    {user.role !== "User" && (
                      <Link
                        href={["Manager", "Receptionist", "Saler"].includes(user.role) ? "/admin" : "/tasks"}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 w-full text-left"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        Quản lý
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 w-full text-left"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      Trang cá nhân
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 w-full text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-zinc-400" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
