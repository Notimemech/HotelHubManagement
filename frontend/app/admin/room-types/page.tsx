"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { INPUT } from "../components/Input";
import {
  listRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  type RoomType,
} from "@/lib/admin-api";

const VND = new Intl.NumberFormat("vi-VN");

export default function RoomTypesPage() {
  const [types, setTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [form, setForm] = useState({ typeName: "", price: "", maxGuests: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTypes(await listRoomTypes());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ typeName: "", price: "", maxGuests: "2", description: "" });
    setError(null);
    setModal("add");
  };

  const openEdit = (t: RoomType) => {
    setEditing(t);
    setForm({ typeName: t.typeName, price: String(t.price), maxGuests: String(t.maxGuests), description: t.description ?? "" });
    setError(null);
    setModal("edit");
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const dto = {
        typeName: form.typeName,
        price: Number(form.price),
        maxGuests: form.maxGuests ? Number(form.maxGuests) : 2,
        description: form.description || undefined,
      };
      if (editing) await updateRoomType(editing.typeId, dto);
      else await createRoomType(dto as Parameters<typeof createRoomType>[0]);
      setModal(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t: RoomType) => {
    if (!confirm(`Xóa loại phòng "${t.typeName}"?`)) return;
    try {
      await deleteRoomType(t.typeId);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (loading) return <p className="text-sm text-zinc-400">Đang tải...</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Loại phòng</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg cursor-pointer">
          <Plus className="w-4 h-4" /> Thêm loại phòng
        </button>
      </div>

      <Table
        keyField="typeId"
        rows={types}
        columns={[
          { key: "typeName", label: "Tên loại phòng" },
          { key: "price", label: "Giá / đêm", render: (r) => `${VND.format(Number(r.price))} đ` },
          { key: "maxGuests", label: "Tối đa khách" },
          { key: "description", label: "Mô tả", render: (r) => r.description ?? "—" },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(r)} className="text-zinc-500 hover:text-zinc-800 cursor-pointer"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(r)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "edit" ? "Sửa loại phòng" : "Thêm loại phòng"}>
        <div className="space-y-4">
          <Field label="Tên loại phòng"><input value={form.typeName} onChange={(e) => setForm({ ...form, typeName: e.target.value })} className={INPUT} /></Field>
          <Field label="Giá / đêm (VND)"><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={INPUT} /></Field>
          <Field label="Tối đa khách"><input type="number" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: e.target.value })} className={INPUT} /></Field>
          <Field label="Mô tả"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={INPUT + " resize-none"} rows={2} /></Field>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button onClick={save} disabled={saving} className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60">
            {saving ? <Spinner className="w-4 h-4 mx-auto" /> : "Lưu"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-zinc-600 mb-1">{label}</label>{children}</div>;
}