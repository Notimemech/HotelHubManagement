"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter } from "lucide-react";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { INPUT } from "../components/Input";
import { EmptyState } from "../components/EmptyState";
import {
  listBookings,
  walkInBooking,
  type Booking,
} from "@/lib/admin-api";

const VND = new Intl.NumberFormat("vi-VN");
const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-zinc-100 text-zinc-500",
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", from: "", to: "", q: "" });
  const [showWalkIn, setShowWalkIn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBookings(await listBookings(filter));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý đặt phòng</h1>
        <button
          onClick={() => setShowWalkIn(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Walk-in
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
          <Filter className="w-3 h-3" /> Bộ lọc
        </div>
        <Field label="Trạng thái">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className={INPUT}
          >
            <option value="">Tất cả</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </Field>
        <Field label="Từ ngày">
          <input
            type="date"
            value={filter.from}
            onChange={(e) => setFilter({ ...filter, from: e.target.value })}
            className={INPUT}
          />
        </Field>
        <Field label="Đến ngày">
          <input
            type="date"
            value={filter.to}
            onChange={(e) => setFilter({ ...filter, to: e.target.value })}
            className={INPUT}
          />
        </Field>
        <Field label="Tìm khách">
          <input
            placeholder="Tên / SĐT"
            value={filter.q}
            onChange={(e) => setFilter({ ...filter, q: e.target.value })}
            className={INPUT}
          />
        </Field>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Đang tải...</p>
      ) : bookings.length === 0 ? (
        <EmptyState message="Không có đặt phòng nào" />
      ) : (
        <Table
          keyField="bookingId"
          rows={bookings}
          onRowClick={(row) => router.push(`/admin/bookings/${row.bookingId}`)}
          columns={[
            { key: "id", label: "Mã", render: (r) => r.bookingId.slice(0, 8) },
            { key: "customer", label: "Khách", render: (r) => r.customer?.fullName ?? "—" },
            { key: "phone", label: "SĐT", render: (r) => r.customer?.phone ?? "—" },
            {
              key: "checkIn",
              label: "Check-in",
              render: (r) => {
                const v = [...(r.versions ?? [])].sort(
                  (a, b) => b.versionNumber - a.versionNumber,
                )[0];
                return v?.checkIn ? new Date(v.checkIn).toLocaleDateString("vi-VN") : "—";
              },
            },
            {
              key: "checkOut",
              label: "Check-out",
              render: (r) => {
                const v = [...(r.versions ?? [])].sort(
                  (a, b) => b.versionNumber - a.versionNumber,
                )[0];
                return v?.checkOut ? new Date(v.checkOut).toLocaleDateString("vi-VN") : "—";
              },
            },
            {
              key: "totalPrice",
              label: "Tổng tiền",
              render: (r) => `${VND.format(Number(r.totalPrice))} đ`,
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (r) => (
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    STATUS_COLORS[r.status] ?? "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {r.status}
                </span>
              ),
            },
          ]}
        />
      )}

      {showWalkIn && (
        <WalkInModal onClose={() => setShowWalkIn(false)} onCreated={() => { setShowWalkIn(false); load(); }} />
      )}
    </div>
  );
}

function WalkInModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    customerFullName: "",
    customerPhone: "",
    customerEmail: "",
    checkIn: "",
    checkOut: "",
    adults: "1",
    children: "0",
    roomIds: "",
    specialRequest: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await walkInBooking({
        ...form,
        adults: Number(form.adults),
        children: Number(form.children),
        roomIds: form.roomIds.split(",").map((s) => s.trim()).filter(Boolean),
      });
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Tạo đặt phòng walk-in">
      <div className="space-y-3">
        <Field label="Họ tên khách"><input className={INPUT} value={form.customerFullName} onChange={(e) => setForm({ ...form, customerFullName: e.target.value })} /></Field>
        <Field label="SĐT khách"><input className={INPUT} value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} /></Field>
        <Field label="Email (tuỳ chọn)"><input className={INPUT} value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in"><input type="date" className={INPUT} value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} /></Field>
          <Field label="Check-out"><input type="date" className={INPUT} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Người lớn"><input type="number" min={1} className={INPUT} value={form.adults} onChange={(e) => setForm({ ...form, adults: e.target.value })} /></Field>
          <Field label="Trẻ em"><input type="number" min={0} className={INPUT} value={form.children} onChange={(e) => setForm({ ...form, children: e.target.value })} /></Field>
        </div>
        <Field label="Room IDs (phân tách dấu phẩy)"><input className={INPUT} placeholder="uuid,uuid" value={form.roomIds} onChange={(e) => setForm({ ...form, roomIds: e.target.value })} /></Field>
        <Field label="Yêu cầu đặc biệt"><textarea rows={2} className={INPUT + " resize-none"} value={form.specialRequest} onChange={(e) => setForm({ ...form, specialRequest: e.target.value })} /></Field>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button onClick={submit} disabled={saving} className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60">
          {saving ? <Spinner className="w-4 h-4 mx-auto" /> : "Tạo đặt phòng"}
        </button>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1">{label}</label>
      {children}
    </div>
  );
}