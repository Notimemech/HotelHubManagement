"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  changePassword,
  getCustomerProfile,
  getMyStaffProfile,
  isStaffRole,
  updateCustomerProfile,
  updateMyStaffProfile,
  type CustomerProfile,
  type StaffProfile,
} from "@/lib/api";
import { Navbar } from "../components/Navbar";
import { Spinner } from "../components/Spinner";

const PHONE_RE = /^[0-9+\-\s]{8,20}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const INPUT =
  "w-full px-3 py-2 text-sm rounded-md border border-zinc-300 bg-white text-zinc-900 " +
  "placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

type Tab = "info" | "password";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProfileBody role={user.role} />
      </div>
    </div>
  );
}

function ProfileBody({ role }: { role: string }) {
  const [tab, setTab] = useState<Tab>("info");
  const isStaff = isStaffRole(role);

  return (
    <>
      <div className="mb-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Trang chủ
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Trang cá nhân</h1>
        <p className="text-sm text-zinc-500">
          Quản lý thông tin tài khoản {isStaff ? "nhân viên" : "của bạn"}.
        </p>
        <span className="mt-3 inline-block text-xs font-semibold text-amber-700 bg-amber-50 rounded px-2 py-1">
          {role}
        </span>
      </div>

      <div className="flex gap-1 border-b border-zinc-200 mb-6">
        <TabButton active={tab === "info"} onClick={() => setTab("info")}>
          Thông tin cá nhân
        </TabButton>
        <TabButton active={tab === "password"} onClick={() => setTab("password")}>
          Đổi mật khẩu
        </TabButton>
      </div>

      {tab === "info" ? (
        isStaff ? <StaffInfoForm /> : <CustomerInfoForm />
      ) : (
        <PasswordForm />
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition cursor-pointer ${
        active
          ? "border-amber-600 text-amber-700"
          : "border-transparent text-zinc-500 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}

function CustomerInfoForm() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCustomerProfile()
      .then((p) => {
        setProfile(p);
        setFullName(p.fullName ?? "");
        setAvatar(p.avatar ?? "");
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!fullName.trim()) return setError("Họ tên không được để trống.");
    if (avatar && avatar.length > 255)
      return setError("URL ảnh đại diện tối đa 255 ký tự.");

    const dto: { fullName: string; avatar?: string } = {
      fullName: fullName.trim(),
    };
    if (avatar.trim()) dto.avatar = avatar.trim();

    setSaving(true);
    try {
      const updated = await updateCustomerProfile(dto);
      setProfile(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="w-6 h-6 text-amber-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-zinc-200 p-6">
      <Field label="Họ và tên" required>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={INPUT}
          maxLength={100}
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          value={profile?.email ?? ""}
          readOnly
          className={`${INPUT} bg-zinc-50 cursor-not-allowed`}
        />
      </Field>
      <Field label="Số điện thoại">
        <input
          type="text"
          value={phone || profile?.phone || ""}
          onChange={(e) => setPhone(e.target.value)}
          className={INPUT}
          readOnly
          placeholder="Liên hệ lễ tân để thay đổi"
          maxLength={20}
        />
      </Field>
      <Field label="Ảnh đại diện (URL)">
        <input
          type="url"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className={INPUT}
          placeholder="https://..."
          maxLength={255}
        />
      </Field>

      <Alert error={error} success={success} />

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}

function StaffInfoForm() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMyStaffProfile()
      .then((p) => {
        setProfile(p);
        setFullName(p.fullName ?? "");
        setPhone(p.phone ?? "");
        setAddress(p.address ?? "");
        setBirthDate(p.birthDate ? p.birthDate.slice(0, 10) : "");
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!fullName.trim()) return setError("Họ tên không được để trống.");
    if (phone && !PHONE_RE.test(phone))
      return setError("Số điện thoại không hợp lệ (8-20 ký tự, chỉ gồm số, +, -, khoảng trắng).");
    if (birthDate && !ISO_DATE_RE.test(birthDate))
      return setError("Ngày sinh phải theo định dạng YYYY-MM-DD.");

    const dto: Record<string, string> = { fullName: fullName.trim() };
    if (phone.trim()) dto.phone = phone.trim();
    if (address.trim()) dto.address = address.trim();
    if (birthDate) dto.birthDate = birthDate;

    setSaving(true);
    try {
      const updated = await updateMyStaffProfile(dto);
      setProfile(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="w-6 h-6 text-amber-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-zinc-200 p-6">
      <Field label="CCCD">
        <input
          type="text"
          value={profile?.cccd ?? ""}
          readOnly
          className={`${INPUT} bg-zinc-50 cursor-not-allowed`}
        />
      </Field>
      <Field label="Họ và tên" required>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={INPUT}
          maxLength={100}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Số điện thoại">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={INPUT}
            maxLength={20}
          />
        </Field>
        <Field label="Ngày sinh">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={INPUT}
          />
        </Field>
      </div>
      <Field label="Địa chỉ">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={INPUT}
          maxLength={255}
        />
      </Field>

      <Alert error={error} success={success} />

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!oldPassword) return setError("Vui lòng nhập mật khẩu hiện tại.");
    if (newPassword.length < 6)
      return setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
    if (newPassword !== confirm) return setError("Mật khẩu xác nhận không khớp.");
    if (oldPassword === newPassword)
      return setError("Mật khẩu mới phải khác mật khẩu hiện tại.");

    setSaving(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đổi mật khẩu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-zinc-200 p-6 max-w-md">
      <Field label="Mật khẩu hiện tại" required>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className={INPUT}
          autoComplete="current-password"
        />
      </Field>
      <Field label="Mật khẩu mới" required>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={INPUT}
          autoComplete="new-password"
          minLength={6}
        />
      </Field>
      <Field label="Xác nhận mật khẩu mới" required>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={INPUT}
          autoComplete="new-password"
          minLength={6}
        />
      </Field>

      <Alert error={error} success={success} />

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
      >
        {saving ? "Đang đổi..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Alert({
  error,
  success,
}: {
  error: string | null;
  success: boolean;
}) {
  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (success) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Cập nhật thành công.
      </div>
    );
  }
  return null;
}