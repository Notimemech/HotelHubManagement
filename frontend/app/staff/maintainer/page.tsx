"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";
import { Spinner } from "../../components/Spinner";

interface Assignment {
  assignmentId: string;
  issueId: string;
  assignedAt: string;
  issue?: {
    issueId: string;
    description: string;
    status: string;
    room?: { roomCode: string };
  };
}

export default function MaintainerPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Assignment | null>(null);
  const [finishImage, setFinishImage] = useState("");
  const [finishVideo, setFinishVideo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Assignment[]>("/maintenance/my-issues");
      setAssignments(data);
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
    if (!active) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest(`/maintenance/issues/${active.issueId}/prove`, {
        method: "POST",
        body: JSON.stringify({
          finishImage: finishImage || undefined,
          finishVideo: finishVideo || undefined,
        }),
      });
      setSuccess("Đã đánh dấu hoàn thành.");
      setActive(null);
      setFinishImage("");
      setFinishVideo("");
      load();
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
          Maintainer
        </p>
        <h1 className="text-3xl font-bold text-zinc-900">Sự cố được phân công</h1>
        <p className="text-zinc-500 mt-1">Chào {user?.username}. Xử lý các issue đang chờ.</p>
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
          Bạn chưa được phân công issue nào.
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a) => (
            <div
              key={a.assignmentId}
              className="rounded-xl bg-white border border-zinc-200 p-5 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-zinc-900">
                    Phòng {a.issue?.room?.roomCode ?? "—"}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      a.issue?.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : a.issue?.status === "Resolved"
                          ? "bg-green-100 text-green-800"
                          : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {a.issue?.status ?? "—"}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 truncate">
                  {a.issue?.description}
                </p>
              </div>
              {a.issue?.status !== "Resolved" && (
                <button
                  onClick={() => setActive(a)}
                  className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md cursor-pointer"
                >
                  Xử lý xong
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={submit}
            className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-bold text-zinc-900">Hoàn thành xử lý</h2>
            <p className="text-sm text-zinc-600">{active.issue?.description}</p>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                URL ảnh hoàn thành
              </label>
              <input
                type="url"
                value={finishImage}
                onChange={(e) => setFinishImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                URL video (tuỳ chọn)
              </label>
              <input
                type="url"
                value={finishVideo}
                onChange={(e) => setFinishVideo(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setActive(null)}
                className="px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-md cursor-pointer"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Đang lưu..." : "Xác nhận hoàn thành"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
