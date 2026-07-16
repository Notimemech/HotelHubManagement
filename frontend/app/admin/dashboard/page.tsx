"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, CalendarCheck, CreditCard, Users } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { EmptyState } from "../components/EmptyState";
import { getDashboardSummary, type DashboardSummary } from "@/lib/admin-api";

const VND = new Intl.NumberFormat("vi-VN");

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getDashboardSummary();
        if (!cancelled) setData(res);
      } catch {
        // Render empty state if backend missing
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-zinc-400">Đang tải...</p>;
  if (!data) return <EmptyState message="Không có dữ liệu" />;

  const occupancyPct = Math.round(data.occupancyRate * 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Tổng đặt phòng" value={data.totalBookings} />
        <StatCard
          icon={CreditCard}
          label="Doanh thu"
          value={`${VND.format(data.totalRevenue)} đ`}
        />
        <StatCard
          icon={BedDouble}
          label="Công suất phòng"
          value={`${occupancyPct}%`}
          sub="Phòng đang sử dụng"
        />
        <StatCard icon={Users} label="Đặt phòng gần đây" value={data.recentBookings.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Đặt phòng theo ngày</h2>
          {data.bookingsByDay.length === 0 ? (
            <EmptyState />
          ) : (
            <BookingsByDayChart data={data.bookingsByDay} />
          )}
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Top loại phòng</h2>
          {data.topRoomTypes.length === 0 ? (
            <EmptyState />
          ) : (
            <TopRoomTypesBars data={data.topRoomTypes} />
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Đặt phòng gần đây</h2>
        <Table
          keyField="bookingId"
          rows={data.recentBookings}
          onRowClick={(row) => router.push(`/admin/bookings/${row.bookingId}`)}
          columns={[
            { key: "customerName", label: "Khách hàng" },
            {
              key: "checkIn",
              label: "Check-in",
              render: (r) => (r.checkIn ? new Date(r.checkIn).toLocaleDateString("vi-VN") : "—"),
            },
            {
              key: "checkOut",
              label: "Check-out",
              render: (r) => (r.checkOut ? new Date(r.checkOut).toLocaleDateString("vi-VN") : "—"),
            },
            {
              key: "totalPrice",
              label: "Tổng tiền",
              render: (r) => `${VND.format(r.totalPrice)} đ`,
            },
            { key: "status", label: "Trạng thái", render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-zinc-100 text-zinc-500",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${map[status] ?? "bg-zinc-100 text-zinc-600"}`}>
      {status}
    </span>
  );
}

function BookingsByDayChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.slice(-14).map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
          <div
            className="w-full bg-amber-500 rounded-t min-h-[2px] hover:bg-amber-600 transition"
            style={{ height: `${(d.count / max) * 100}%` }}
            title={`${d.date}: ${d.count}`}
          />
          <span className="text-[10px] text-zinc-400 truncate w-full text-center">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function TopRoomTypesBars({ data }: { data: Array<{ typeName: string; bookings: number }> }) {
  const max = Math.max(...data.map((d) => d.bookings), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.typeName}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-700 truncate">{d.typeName}</span>
            <span className="text-zinc-500">{d.bookings}</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${(d.bookings / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}