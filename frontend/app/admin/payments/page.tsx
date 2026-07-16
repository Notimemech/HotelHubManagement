"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Filter, DollarSign } from "lucide-react";
import { Table } from "../components/Table";
import { Spinner } from "@/app/components/Spinner";
import { EmptyState } from "../components/EmptyState";
import {
  listPayments,
  type Payment,
} from "@/lib/admin-api";

const VND = new Intl.NumberFormat("vi-VN");
const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Paid: "bg-emerald-100 text-emerald-700",
  Failed: "bg-red-100 text-red-700",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", method: "", from: "", to: "", bookingId: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPayments(filter);
      setPayments(res.payments);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý thanh toán</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white rounded-xl border border-zinc-200 p-4 flex flex-wrap gap-3 items-end">
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
              <option>Paid</option>
              <option>Failed</option>
            </select>
          </Field>
          <Field label="Phương thức">
            <input
              placeholder="Ví dụ: Cash, Transfer"
              value={filter.method}
              onChange={(e) => setFilter({ ...filter, method: e.target.value })}
              className={INPUT}
            />
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
        </div>

        {/* Sum summary card */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-0.5 font-medium">Doanh thu lọc được</p>
            <p className="text-2xl font-bold text-zinc-900 tabular-nums">{VND.format(total)} đ</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Đang tải...</p>
      ) : payments.length === 0 ? (
        <EmptyState message="Không tìm thấy thanh toán nào" />
      ) : (
        <Table
          keyField="paymentId"
          rows={payments}
          columns={[
            { key: "id", label: "Mã giao dịch", render: (p) => p.paymentId.slice(0, 8) },
            { key: "bookingId", label: "Mã đặt phòng", render: (p) => p.bookingId.slice(0, 8) },
            { key: "customer", label: "Khách hàng", render: (p) => p.booking?.customer?.fullName ?? "—" },
            {
              key: "amount",
              label: "Số tiền",
              render: (p) => `${VND.format(Number(p.amount))} đ`,
            },
            { key: "method", label: "Phương thức" },
            {
              key: "paidAt",
              label: "Ngày thanh toán",
              render: (p) => (p.paidAt ? new Date(p.paidAt).toLocaleDateString("vi-VN") : "—"),
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (p) => (
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    STATUS_COLORS[p.status] ?? "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {p.status}
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}

const INPUT = "w-full px-3 py-2 text-sm rounded-md border border-zinc-300 focus:border-amber-500 focus:outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1">{label}</label>
      {children}
    </div>
  );
}