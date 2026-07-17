"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/admin/components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { INPUT } from "@/app/admin/components/Input";
import {
  updateSaleBooking,
  listRooms,
  type Booking,
  type Room,
} from "@/lib/admin-api";

const MAX_B64 = 13_500_000;

function formatIsoDate(dStr: string | null | Date): string {
  if (!dStr) return "";
  const d = new Date(dStr);
  return d.toISOString().slice(0, 10);
}

interface Props {
  open: boolean;
  booking: Booking;
  onClose: () => void;
  onUpdated: () => void;
}

export function SaleEditModal({ open, booking, onClose, onUpdated }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const latestVer = useMemo(() => {
    const vers = booking.versions ?? [];
    if (vers.length === 0) return null;
    return [...vers].sort((a, b) => b.versionNumber - a.versionNumber)[0];
  }, [booking]);

  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    adults: "1",
    children: "0",
    roomIds: [] as string[],
    specialRequest: "",
    changeReason: "",
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

    if (latestVer) {
      setForm({
        checkIn: formatIsoDate(latestVer.checkIn),
        checkOut: formatIsoDate(latestVer.checkOut),
        adults: String(latestVer.adults ?? 1),
        children: String(latestVer.children ?? 0),
        roomIds: latestVer.details?.map((d) => d.roomId) ?? [],
        specialRequest: latestVer.specialRequest ?? "",
        changeReason: "",
      });
      setEvidenceB64(null);
    }
  }, [open, latestVer]);

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
    if (!form.checkIn || !form.checkOut) return "Chọn ngày check-in / check-out";
    if (form.checkOut <= form.checkIn) return "Check-out phải sau check-in";
    const adults = Number(form.adults);
    const children = Number(form.children);
    if (!Number.isInteger(adults) || adults < 1) return "Người lớn phải >= 1";
    if (!Number.isInteger(children) || children < 0) return "Trẻ em phải >= 0";
    if (form.roomIds.length < 1) return "Chọn ít nhất 1 phòng";
    if (!evidenceB64) return "Ảnh minh chứng yêu cầu đổi là bắt buộc";
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
      await updateSaleBooking(booking.bookingId, {
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: Number(form.adults),
        children: Number(form.children),
        roomIds: form.roomIds,
        specialRequest: form.specialRequest || undefined,
        requestEvidenceImage: evidenceB64!,
        changeReason: form.changeReason || undefined,
      });
      onUpdated();
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
    <Modal open={open} onClose={onClose} title="Sửa booking có evidence (Saler)">
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in *">
            <input
              type="date"
              className={INPUT}
              value={form.checkIn}
              onChange={(e) => field("checkIn", e.target.value)}
            />
          </Field>
          <Field label="Check-out *">
            <input
              type="date"
              min={form.checkIn}
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
                // In edit mode, allow rooms already in current booking version even if they are 'Booked' / 'Occupied'
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
                      {r.status !== "Available" && !checked ? ` — ${r.status}` : ""}
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
        <Field label="Lý do thay đổi">
          <input
            className={INPUT}
            placeholder="Saler cập nhật theo yêu cầu khách"
            value={form.changeReason}
            onChange={(e) => field("changeReason", e.target.value)}
          />
        </Field>
        <Field label="Ảnh minh chứng đổi (BẮT BUỘC) *">
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
          {saving ? <Spinner className="w-4 h-4 mx-auto" /> : "Cập nhật booking"}
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
