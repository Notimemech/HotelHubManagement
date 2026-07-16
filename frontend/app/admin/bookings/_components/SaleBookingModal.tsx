"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/admin/components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { INPUT } from "@/app/admin/components/Input";
import {
  createSaleBooking,
  listRooms,
  type Room,
} from "@/lib/admin-api";

const PHONE_RE = /^[0-9+\-\s]{8,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_B64 = 13_500_000;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function SaleBookingModal({ open, onClose, onCreated }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [form, setForm] = useState({
    customerFullName: "",
    customerPhone: "",
    customerEmail: "",
    customerCccd: "",
    checkIn: todayIso(),
    checkOut: todayIso(),
    adults: "1",
    children: "0",
    roomIds: [] as string[],
    specialRequest: "",
  });
  const [evidenceB64, setEvidenceB64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingRooms(true);
    listRooms()
      .then((rs) => setRooms(rs ?? []))
      .finally(() => setLoadingRooms(false));
  }, [open]);

  const roomLabel = useMemo(
    () =>
      new Map(
        rooms.map((r) => [
          r.roomId,
          `${r.roomCode}${r.roomType ? ` (${r.roomType.typeName})` : ""}`,
        ]),
      ),
    [rooms],
  );

  function field<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setEvidenceB64(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result.length > MAX_B64) {
        setError("Ảnh quá lớn (>10MB). Vui lòng chọn ảnh nhỏ hơn.");
        setEvidenceB64(null);
        return;
      }
      setEvidenceB64(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  function validate(): string | null {
    if (!form.customerFullName.trim()) return "Họ tên khách là bắt buộc";
    if (!PHONE_RE.test(form.customerPhone))
      return "SĐT phải khớp /^[0-9+\\-\\s]{8,20}$/";
    if (form.customerEmail && !EMAIL_RE.test(form.customerEmail))
      return "Email không hợp lệ";
    if (!form.checkIn || !form.checkOut) return "Chọn ngày check-in / check-out";
    if (form.checkIn < todayIso()) return "Check-in phải >= hôm nay";
    if (form.checkOut <= form.checkIn) return "Check-out phải sau check-in";
    const adults = Number(form.adults);
    const children = Number(form.children);
    if (!Number.isInteger(adults) || adults < 1) return "Người lớn phải >= 1";
    if (!Number.isInteger(children) || children < 0) return "Trẻ em phải >= 0";
    if (form.roomIds.length < 1) return "Chọn ít nhất 1 phòng";
    return null;
  }

  async function submit() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createSaleBooking({
        customerFullName: form.customerFullName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail || undefined,
        customerCccd: form.customerCccd || undefined,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: Number(form.adults),
        children: Number(form.children),
        roomIds: form.roomIds,
        specialRequest: form.specialRequest || undefined,
        evidenceImage: evidenceB64 ?? undefined,
      });
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  function toggleRoom(id: string) {
    setForm((f) => {
      const has = f.roomIds.includes(id);
      return {
        ...f,
        roomIds: has ? f.roomIds.filter((x) => x !== id) : [...f.roomIds, id],
      };
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Tạo booking hộ khách (Saler)">
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <Field label="Họ tên khách *">
          <input
            className={INPUT}
            value={form.customerFullName}
            onChange={(e) => field("customerFullName", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SĐT *">
            <input
              className={INPUT}
              placeholder="0901234567"
              value={form.customerPhone}
              onChange={(e) => field("customerPhone", e.target.value)}
            />
          </Field>
          <Field label="CCCD">
            <input
              className={INPUT}
              value={form.customerCccd}
              onChange={(e) => field("customerCccd", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Email">
          <input
            type="email"
            className={INPUT}
            value={form.customerEmail}
            onChange={(e) => field("customerEmail", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in *">
            <input
              type="date"
              min={todayIso()}
              className={INPUT}
              value={form.checkIn}
              onChange={(e) => field("checkIn", e.target.value)}
            />
          </Field>
          <Field label="Check-out *">
            <input
              type="date"
              min={form.checkIn || todayIso()}
              className={INPUT}
              value={form.checkOut}
              onChange={(e) => field("checkOut", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Người lớn *">
            <input
              type="number"
              min={1}
              className={INPUT}
              value={form.adults}
              onChange={(e) => field("adults", e.target.value)}
            />
          </Field>
          <Field label="Trẻ em">
            <input
              type="number"
              min={0}
              className={INPUT}
              value={form.children}
              onChange={(e) => field("children", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Chọn phòng *">
          {loadingRooms ? (
            <p className="text-xs text-zinc-500">Đang tải phòng...</p>
          ) : rooms.length === 0 ? (
            <p className="text-xs text-zinc-500">Không có phòng nào</p>
          ) : (
            <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-md p-2 space-y-1">
              {rooms.map((r) => {
                const checked = form.roomIds.includes(r.roomId);
                const disabled = r.status !== "Available" && !checked;
                return (
                  <label
                    key={r.roomId}
                    className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer hover:bg-zinc-50 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleRoom(r.roomId)}
                    />
                    <span>
                      {roomLabel.get(r.roomId) ?? r.roomId.slice(0, 8)}
                      {r.status !== "Available" ? ` — ${r.status}` : ""}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </Field>
        <Field label="Yêu cầu đặc biệt">
          <textarea
            rows={2}
            className={INPUT + " resize-none"}
            value={form.specialRequest}
            onChange={(e) => field("specialRequest", e.target.value)}
          />
        </Field>
        <Field label="Ảnh bill (tuỳ chọn)">
          <input
            type="file"
            accept="image/*"
            className={INPUT}
            onChange={onFileChange}
          />
          {evidenceB64 && (
            <img
              src={evidenceB64}
              alt="evidence"
              className="mt-2 h-20 rounded border border-zinc-200 object-cover"
            />
          )}
        </Field>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          onClick={submit}
          disabled={saving}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60"
        >
          {saving ? <Spinner className="w-4 h-4 mx-auto" /> : "Tạo booking"}
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
