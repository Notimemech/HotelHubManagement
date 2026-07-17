"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Spinner } from "../../components/Spinner";

interface Staff {
  staffId: string;
  fullName: string;
  role: string;
}

interface Room {
  roomId: string;
  roomCode: string;
  status: string;
}

interface Issue {
  issueId: string;
  description: string;
  status: string;
  room?: { roomCode: string };
}

export default function ManagerPage() {
  const [tab, setTab] = useState<"housekeeping" | "maintenance">("housekeeping");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [cleaners, setCleaners] = useState<Staff[]>([]);
  const [maintainers, setMaintainers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickedRoom, setPickedRoom] = useState<string>("");
  const [pickedIssue, setPickedIssue] = useState<string>("");
  const [pickedCleaner, setPickedCleaner] = useState<string>("");
  const [pickedMaintainer, setPickedMaintainer] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsData, issuesData, staffData] = await Promise.all([
        apiRequest<Room[]>("/rooms"),
        apiRequest<Issue[]>("/maintenance/issues"),
        apiRequest<Staff[]>("/staff"),
      ]);
      setRooms(roomsData);
      setIssues(issuesData);
      setCleaners(staffData.filter((s) => s.role === "Cleaner"));
      setMaintainers(staffData.filter((s) => s.role === "Maintainer"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const assignRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedRoom || !pickedCleaner) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest("/housekeeping/assignments", {
        method: "POST",
        body: JSON.stringify({
          roomId: pickedRoom,
          cleanerStaffId: pickedCleaner,
        }),
      });
      setSuccess("Đã gán phòng cho Cleaner.");
      setPickedRoom("");
      setPickedCleaner("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const assignIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedIssue || !pickedMaintainer) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest("/maintenance/assignments", {
        method: "POST",
        body: JSON.stringify({
          issueId: pickedIssue,
          maintainerStaffId: pickedMaintainer,
        }),
      });
      setSuccess("Đã gán issue cho Maintainer.");
      setPickedIssue("");
      setPickedMaintainer("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
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
          Manager
        </p>
        <h1 className="text-3xl font-bold text-zinc-900">Phân công công việc</h1>
      </div>

      <div className="flex gap-1 border-b border-zinc-200">
        <button
          onClick={() => setTab("housekeeping")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === "housekeeping"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-zinc-600 hover:text-zinc-900 cursor-pointer"
          }`}
        >
          Dọn phòng ({cleaners.length} cleaners)
        </button>
        <button
          onClick={() => setTab("maintenance")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === "maintenance"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-zinc-600 hover:text-zinc-900 cursor-pointer"
          }`}
        >
          Bảo trì ({maintainers.length} maintainers)
        </button>
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

      {tab === "housekeeping" ? (
        <div className="rounded-2xl bg-white border border-zinc-200 p-6">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Gán phòng cho Cleaner</h2>
          <form onSubmit={assignRoom} className="grid gap-4 sm:grid-cols-3">
            <select
              value={pickedRoom}
              onChange={(e) => setPickedRoom(e.target.value)}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((r) => (
                <option key={r.roomId} value={r.roomId}>
                  {r.roomCode} ({r.status})
                </option>
              ))}
            </select>
            <select
              value={pickedCleaner}
              onChange={(e) => setPickedCleaner(e.target.value)}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn Cleaner --</option>
              {cleaners.map((s) => (
                <option key={s.staffId} value={s.staffId}>
                  {s.fullName}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md disabled:opacity-50 cursor-pointer"
            >
              {busy ? "Đang lưu..." : "Phân công"}
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-zinc-200 p-6">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Gán issue cho Maintainer</h2>
          <form onSubmit={assignIssue} className="grid gap-4 sm:grid-cols-3">
            <select
              value={pickedIssue}
              onChange={(e) => setPickedIssue(e.target.value)}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn issue --</option>
              {issues
                .filter((i) => i.status === "Pending")
                .map((i) => (
                  <option key={i.issueId} value={i.issueId}>
                    {i.room?.roomCode ?? "?"} — {i.description.slice(0, 40)}
                  </option>
                ))}
            </select>
            <select
              value={pickedMaintainer}
              onChange={(e) => setPickedMaintainer(e.target.value)}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn Maintainer --</option>
              {maintainers.map((s) => (
                <option key={s.staffId} value={s.staffId}>
                  {s.fullName}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md disabled:opacity-50 cursor-pointer"
            >
              {busy ? "Đang lưu..." : "Phân công"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
