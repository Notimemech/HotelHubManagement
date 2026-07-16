"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, ToggleLeft } from "lucide-react";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { INPUT } from "../components/Input";
import {
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  setRoomStatus,
  listRoomTypes,
  type Room,
  type RoomType,
} from "@/lib/admin-api";

const STATUSES = ["Available", "Occupied", "Maintenance", "Cleaning"];
const STATUS_COLORS: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  Occupied: "bg-blue-100 text-blue-700",
  Maintenance: "bg-orange-100 text-orange-700",
  Cleaning: "bg-purple-100 text-purple-700",
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | "status" | null>(null);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState({ roomCode: "", typeId: "", floor: "", status: "Available" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, t] = await Promise.all([listRooms(), listRoomTypes()]);
      setRooms(r);
      setTypes(t);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ roomCode: "", typeId: types[0]?.typeId ?? "", floor: "", status: "Available" });
    setError(null);
    setModal("add");
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setForm({ roomCode: room.roomCode, typeId: room.typeId, floor: String(room.floor ?? ""), status: room.status });
    setError(null);
    setModal("edit");
  };

  const openStatus = (room: Room) => {
    setEditing(room);
    setError(null);
    setModal("status");
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const dto = { roomCode: form.roomCode, typeId: form.typeId, floor: form.floor ? Number(form.floor) : undefined, status: form.status };
      if (editing) await updateRoom(editing.roomId, dto);
      else await createRoom(dto as Parameters<typeof createRoom>[0]);
      setModal(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const saveStatus = async (newStatus: string) => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      await setRoomStatus(editing.roomId, newStatus);
      setModal(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (room: Room) => {
    if (!confirm(`Xóa phòng ${room.roomCode}?`)) return;
    try {
      await deleteRoom(room.roomId);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (loading) return <p className="text-sm text-zinc-400">Đang tải...</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý phòng</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg cursor-pointer">
          <Plus className="w-4 h-4" /> Thêm phòng
        </button>
      </div>

      <Table
        keyField="roomId"
        rows={rooms}
        columns={[
          { key: "roomCode", label: "Mã phòng" },
          { key: "floor", label: "Tầng", render: (r) => String(r.floor ?? "—") },
          { key: "type", label: "Loại", render: (r) => r.roomType?.typeName ?? "—" },
          {
            key: "status",
            label: "Trạng thái",
            render: (r) => (
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[r.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                {r.status}
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openStatus(r)} className="text-purple-600 hover:text-purple-800 cursor-pointer" title="Đổi trạng thái">
                  <ToggleLeft className="w-4 h-4" />
                </button>
                <button onClick={() => openEdit(r)} className="text-zinc-500 hover:text-zinc-800 cursor-pointer" title="Sửa">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(r)} className="text-red-500 hover:text-red-700 cursor-pointer" title="Xóa">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={modal === "add" || modal === "edit"} onClose={() => setModal(null)} title={modal === "edit" ? "Sửa phòng" : "Thêm phòng"}>
        <div className="space-y-4">
          <Field label="Mã phòng">
            <input value={form.roomCode} onChange={(e) => setForm({ ...form, roomCode: e.target.value })} className={INPUT} />
          </Field>
          <Field label="Loại phòng">
            <select value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} className={INPUT}>
              {types.map((t) => <option key={t.typeId} value={t.typeId}>{t.typeName}</option>)}
            </select>
          </Field>
          <Field label="Tầng">
            <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className={INPUT} placeholder="1" />
          </Field>
          <Field label="Trạng thái">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={INPUT}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button onClick={save} disabled={saving} className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60">
            {saving ? <Spinner className="w-4 h-4 mx-auto" /> : "Lưu"}
          </button>
        </div>
      </Modal>

      <Modal open={modal === "status"} onClose={() => setModal(null)} title="Đổi trạng thái phòng">
        <div className="space-y-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => saveStatus(s)}
              disabled={saving}
              className={`w-full py-2 rounded-lg text-sm font-medium border cursor-pointer ${
                editing?.status === s
                  ? "border-amber-600 bg-amber-50 text-amber-700"
                  : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
              }`}
            >
              {s}
            </button>
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </Modal>
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