"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { INPUT } from "../components/Input";
import {
  listServices,
  createService,
  updateService,
  deleteService,
  type Service,
} from "@/lib/admin-api";
import { useAuth } from "@/lib/auth-context";

const VND = new Intl.NumberFormat("vi-VN");

export default function ServicesPage() {
  const { user } = useAuth();
  const isManager = user?.role === "Manager";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ serviceName: "", price: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setServices(await listServices());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ serviceName: "", price: "" });
    setError(null);
    setModal("add");
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ serviceName: s.serviceName, price: String(s.price) });
    setError(null);
    setModal("edit");
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const dto = { serviceName: form.serviceName, price: Number(form.price) };
      if (editing) await updateService(editing.serviceId, dto);
      else await createService(dto as Parameters<typeof createService>[0]);
      setModal(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Service) => {
    if (!confirm(`Xóa dịch vụ "${s.serviceName}"?`)) return;
    try {
      await deleteService(s.serviceId);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (loading) return <p className="text-sm text-zinc-400">Đang tải...</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý dịch vụ</h1>
        {isManager && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm dịch vụ
          </button>
        )}
      </div>

      <Table
        keyField="serviceId"
        rows={services}
        columns={[
          { key: "serviceName", label: "Tên dịch vụ" },
          { key: "price", label: "Đơn giá", render: (r) => `${VND.format(Number(r.price))} đ` },
          ...(isManager
            ? [
                {
                  key: "actions",
                  label: "",
                  render: (r: Service) => (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(r)} className="text-zinc-500 hover:text-zinc-800 cursor-pointer">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(r)} className="text-red-500 hover:text-red-700 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />

      {isManager && (
        <Modal
          open={modal !== null}
          onClose={() => setModal(null)}
          title={modal === "edit" ? "Sửa dịch vụ" : "Thêm dịch vụ"}
        >
          <div className="space-y-4">
            <Field label="Tên dịch vụ">
              <input
                value={form.serviceName}
                onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                className={INPUT}
              />
            </Field>
            <Field label="Đơn giá (VND)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={INPUT}
              />
            </Field>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              onClick={save}
              disabled={saving}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60"
            >
              {saving ? <Spinner className="w-4 h-4 mx-auto" /> : "Lưu"}
            </button>
          </div>
        </Modal>
      )}
    </div>
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