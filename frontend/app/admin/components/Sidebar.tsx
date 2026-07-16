"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarCheck,
  ConciergeBell,
  CreditCard,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Manager", "Receptionist", "Saler"] },
  { href: "/admin/rooms", label: "Phòng", icon: BedDouble, roles: ["Manager", "Receptionist", "Saler"] },
  { href: "/admin/room-types", label: "Loại phòng", icon: BedDouble, roles: ["Manager"] },
  { href: "/admin/staff", label: "Nhân viên", icon: Users, roles: ["Manager"] },
  { href: "/admin/bookings", label: "Đặt phòng", icon: CalendarCheck, roles: ["Manager", "Receptionist", "Saler"] },
  { href: "/admin/services", label: "Dịch vụ", icon: ConciergeBell, roles: ["Manager"] },
  { href: "/admin/payments", label: "Thanh toán", icon: CreditCard, roles: ["Manager", "Receptionist"] },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-zinc-200 shrink-0 flex flex-col py-4">
      <nav className="flex-1 space-y-0.5 px-2">
        {NAV.filter((item) => item.roles.includes(role)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                active
                  ? "bg-amber-50 text-amber-700 border-l-2 border-amber-600 pl-[10px]"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}