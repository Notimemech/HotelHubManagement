"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, KeyRound, UserCog } from "lucide-react";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { useAuth } from "@/lib/auth-context";
import {
  listStaff,
  createStaff,
  updateStaff,
  changeStaffRole,
  type Staff,
} from "@/lib/admin-api";

const STAFF_ROLES = ["Manager", "Receptionist", "Saler", "Cleaner", "Maintainer"];

export default function StaffPage() {
  const { user } = useAuth();
  const isManager = user?.role === "Manager";

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | "role" | null>(null);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    cccd: "",
    phone: "",
    address: "",
    birthDate: "",
    role: "Receptionist",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStaff(await listStaff());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!isManager) {
    return <p className="text-sm text-zinc-500">Bạn không có quyền truy cập trang này.</p>;
  }

  const openAdd = () => {
    setEditing(null);
    setForm({
      username: "",
      password: "",
      fullName: "",
      cccd: "",
      phone: "",
      address: "",
      birthDate: "",
      role: "Receptionist",
      isActive: true,
    });
    setError(null);
    setModal("add");
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setForm({
      username: s.username,
      password: "",
      fullName: s.fullName,
      cccd: s.cccd,
      phone: s.phone ?? "",
      address: s.address ?? "",
      birthDate: s.birthDate ? s.birthDate.slice(0, 10) : "",
      role: s.role ?? "Receptionist",
      isActive: s.isActive,
    });
    setError(null);
    setModal("edit");
  };

  const openRole = (s: Staff) => {
    setEditing(s);
    setForm((f) => ({ ...f, role: s.role ?? "Receptionist" }));
    setError(null);
    setModal("role");
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateStaff(editing.staffId, {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          birthDate: form.birthDate || undefined,
          isActive: form.isActive,
          ...(form.password ? { password: form.password } : {}),
        } as Parameters<typeof updateStaff>[1]);
      } else {
        await createStaff({
          username: form.username,
          password: form.password,
          fullName: form.fullName,
          cccd: form.cccd,
          phone: form.phone,
          address: form.address,
          birthDate: form.birthDate || undefined,
          role: form.role,
        });
      }
      setModal(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const saveRole = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      await changeStaffRole(editing.staffId, form.role);
      setModal(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-zinc-400">Đang tải...</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý nhân viên</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Thêm nhân viên
        </button>
      </div>

      <Table
        keyField="staffId"
        rows={staff}
        columns={[
          { key: "fullName", label: "Họ tên" },
          { key: "username", label: "Tài khoản" },
          { key: "phone", label: "SĐT", render: (r) => r.phone ?? "—" },
          { key: "role", label: "Vai trò", render: (r) => r.role || "—" },
          {
            key: "isActive",
            label: "Trạng thái",
            render: (r) => (
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  r.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {r.isActive ? "Hoạt động" : "Vô hiệu"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => openRole(r)}
                  className="text-amber-600 hover:text-amber-800 cursor-pointer"
                  title="Đổi vai trò"
                >
                  <UserCog className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(r)}
                  className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  title="Sửa"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "edit" ? "Sửa nhân viên" : "Thêm nhân viên"}
      >
        <div className="space-y-4">
          {!editing && (
            <Field label="Tài khoản">
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className={INPUT}
              />
            </Field>
          )}
          <Field label="Mật khẩu (để trống nếu không đổi)">
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={INPUT}
              placeholder={editing ? "••••••" : ""}
            />
          </Field>
          <Field label="Họ tên">
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={INPUT}
            />
          </Field>
          {!editing && (
            <Field label="CCCD">
              <input
                value={form.cccd}
                onChange={(e) => setForm({ ...form, cccd: e.target.value })}
                className={INPUT}
              />
            </Field>
          )}
          <Field label="SĐT">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={INPUT}
            />
          </Field>
          <Field label="Địa chỉ">
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={INPUT}
            />
          </Field>
          <Field label="Ngày sinh">
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className={INPUT}
            />
          </Field>
          {!editing && (
            <Field label="Vai trò">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={INPUT}
              >
                {STAFF_ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          )}
          {editing && (
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Đang hoạt động
            </label>
          )}
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

      <Modal open={modal === "role"} onClose={() => setModal(null)} title={`Đổi vai trò — ${editing?.fullName ?? ""}`}>
        <div className="space-y-4">
          <Field label="Vai trò mới">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={INPUT}
            >
              {STAFF_ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            onClick={saveRole}
            disabled={saving}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60"
          >
            {saving ? <Spinner className="w-4 h-4 mx-auto" /> : "Cập nhật vai trò"}
          </button>
        </div>
      </Modal>
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