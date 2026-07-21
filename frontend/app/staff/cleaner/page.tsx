"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, completeRoomCleaning } from "@/lib/api";
import { Spinner } from "../../components/Spinner";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Assignment {
  assignmentId: string;
  roomId: string;
  assignedAt: string;
  room?: { roomId: string; roomCode: string; status: string };
}

interface Template {
  templateId: string;
  templateType: string;
  itemName: string;
}

export default function CleanerPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<Assignment | null>(null);
  const [templateType, setTemplateType] = useState("");
  const [evidenceImage, setEvidenceImage] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, t] = await Promise.all([
        apiRequest<Assignment[]>("/housekeeping/my-assignments"),
        apiRequest<Template[]>("/housekeeping/templates"),
      ]);
      setAssignments(a.filter((assignment) => assignment.room?.status === "Cleaning"));
      setTemplates(t);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom) return;
    setError(null);
    setSuccess(null);

    if (!UUID_PATTERN.test(activeRoom.roomId)) {
      setError("Thông tin phòng không hợp lệ.");
      return;
    }
    if (!templateType.trim()) {
      setError("Vui lòng chọn checklist.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/housekeeping/logs", {
        method: "POST",
        body: JSON.stringify({
          roomId: activeRoom.roomId,
          templateType: templateType.trim(),
          evidenceImage: evidenceImage || undefined,
          notes: notes || undefined,
        }),
      });
      await completeRoomCleaning(activeRoom.roomId);
      setSuccess("Đã ghi nhận checklist và phòng đã sẵn sàng.");
      setActiveRoom(null);
      setTemplateType("");
      setEvidenceImage("");
      setNotes("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="w-8 h-8 text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-amber-700 text-sm font-semibold tracking-widest uppercase mb-1">
          Cleaner
        </p>
        <h1 className="text-3xl font-bold text-zinc-900">Phòng được phân công</h1>
        <p className="text-zinc-500 mt-1">Chào {user?.username}. Ghi nhận checklist dọn phòng.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="rounded-2xl bg-white border border-zinc-200 p-10 text-center text-zinc-500">
          Bạn chưa được phân công phòng nào.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <div
              key={a.assignmentId}
              className="rounded-xl bg-white border border-zinc-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-zinc-900">
                  {a.room?.roomCode ?? a.roomId.slice(0, 6)}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                  {a.room?.status ?? "—"}
                </span>
              </div>
              <button
                onClick={() => setActiveRoom(a)}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md cursor-pointer"
              >
                Ghi checklist
              </button>
            </div>
          ))}
        </div>
      )}

      {activeRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={submit}
            className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-bold text-zinc-900">
              Checklist phòng {activeRoom.room?.roomCode}
            </h2>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Template
              </label>
              <select
                value={templateType}
                onChange={(e) => {
                  setTemplateType(e.target.value);
                  setError(null);
                }}
                required
                disabled={submitting}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">-- Chọn --</option>
                {templates.map((t) => (
                  <option key={t.templateId} value={t.templateType}>
                    {t.itemName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                URL ảnh minh chứng
              </label>
              <input
                type="url"
                value={evidenceImage}
                onChange={(e) => {
                  setEvidenceImage(e.target.value);
                  setError(null);
                }}
                placeholder="https://..."
                disabled={submitting}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setError(null);
                }}
                rows={3}
                disabled={submitting}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveRoom(null)}
                disabled={submitting}
                className="px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-md cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Đang lưu..." : "Ghi nhận và hoàn tất"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ponytail: one submit action covers checklist plus room completion; no separate workflow screen.
