"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, History, CreditCard, Bell } from "lucide-react";
import { Spinner } from "@/app/components/Spinner";
import {
  getBooking,
  checkoutBooking,
  getBookingPaymentSummary,
  cancelBookingForStaff,
  softDeleteBooking,
  type Booking,
} from "@/lib/admin-api";
import { useAuth } from "@/lib/auth-context";
import { SaleEditModal } from "../_components/SaleEditModal";

const VND = new Intl.NumberFormat("vi-VN");
const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  Confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
  Completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Cancelled: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getBookingPaymentSummary>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [b, s] = await Promise.all([getBooking(id), getBookingPaymentSummary(id)]);
      setBooking(b);
      setSummary(s);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tìm thấy đặt phòng");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleCheckout = async () => {
    if (!booking) return;
    if (!confirm("Xác nhận check-out cho phòng này? Trạng thái sẽ được cập nhật thành Completed.")) return;
    setActioning(true);
    try {
      await checkoutBooking(booking.bookingId);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi check-out");
    } finally {
      setActioning(false);
    }
  };

  const handleCancelSale = async () => {
    if (!booking) return;
    if (!confirm("Bạn có chắc chắn muốn hủy đặt phòng này? Trạng thái sẽ được cập nhật thành Cancelled.")) return;
    setActioning(true);
    try {
      await cancelBookingForStaff(booking.bookingId);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi hủy đặt phòng");
    } finally {
      setActioning(false);
    }
  };

  const handleDeleteSale = async () => {
    if (!booking) return;
    if (!confirm("Bạn có chắc chắn muốn XÓA đặt phòng này (Xóa mềm)?")) return;
    setActioning(true);
    try {
      await softDeleteBooking(booking.bookingId);
      router.push("/admin/bookings");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi xóa đặt phòng");
    } finally {
      setActioning(false);
    }
  };

  if (loading) return <p className="text-sm text-zinc-400">Đang tải...</p>;
  if (error || !booking) return <p className="text-sm text-red-600">{error || "Không tìm thấy thông tin"}</p>;

  const sortedVersions = [...(booking.versions ?? [])].sort(
    (a, b) => b.versionNumber - a.versionNumber
  );
  const latestVersion = sortedVersions[0];

  const allowedCheckout = ["Manager", "Receptionist"].includes(user?.role ?? "");
  const canCheckout = (booking.status === "Confirmed" || booking.status === "Pending") && allowedCheckout;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/bookings")}
          className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">Chi tiết đặt phòng</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
              {booking.status}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">ID: {booking.bookingId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (Left/Center) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Info Card */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Thông tin đặt phòng
            </h2>

            {latestVersion ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500 text-xs">Check-in</p>
                  <p className="font-semibold text-zinc-900 mt-0.5">
                    {new Date(latestVersion.checkIn).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Check-out</p>
                  <p className="font-semibold text-zinc-900 mt-0.5">
                    {new Date(latestVersion.checkOut).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Khách (Người lớn / Trẻ em)</p>
                  <p className="font-semibold text-zinc-900 mt-0.5">
                    {latestVersion.adults} / {latestVersion.children}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Yêu cầu đặc biệt</p>
                  <p className="font-semibold text-zinc-900 mt-0.5">{latestVersion.specialRequest || "Không có"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Không tìm thấy phiên bản đặt phòng.</p>
            )}

            {latestVersion?.details && latestVersion.details.length > 0 && (
              <div className="border-t border-zinc-100 pt-4 space-y-2">
                <p className="text-zinc-500 text-xs">Phòng đã chọn</p>
                <div className="flex flex-wrap gap-2">
                  {latestVersion.details.map((d) => (
                    <span
                      key={d.bookingDetailId}
                      className="inline-block px-3 py-1 bg-zinc-100 text-zinc-800 rounded-md text-xs font-medium"
                    >
                      Phòng {d.room?.roomCode ?? "—"} ({d.room?.roomType?.typeName ?? "—"}) — {d.nights} đêm
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Versions Timeline */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600" />
              Lịch sử phiên bản
            </h2>
            <div className="relative border-l border-zinc-200 pl-4 ml-2 space-y-4 py-2">
              {sortedVersions.map((v) => (
                <div key={v.versionId} className="relative">
                  <div className="absolute -left-[21px] mt-1.5 w-2.5 h-2.5 rounded-full bg-amber-600 border border-white" />
                  <div className="text-xs">
                    <p className="font-semibold text-zinc-900">Phiên bản {v.versionNumber}</p>
                    <p className="text-zinc-400 mt-0.5">Lý do: {v.changeReason || "Không ghi lý do"}</p>
                    <p className="text-zinc-500 mt-0.5">
                      Tổng tiền tại phiên bản này: <span className="font-medium">{VND.format(v.totalAmountAtThisVersion)} đ</span>
                    </p>
                    {v.staffInCharge && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">Thực hiện bởi: {v.staffInCharge.fullName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Guest and Financial Info (Right Sidebar) */}
        <div className="space-y-6">
          {/* Guest Card */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-900">Khách hàng</h2>
            {booking.customer ? (
              <div className="text-sm">
                <p className="font-semibold text-zinc-900">{booking.customer.fullName}</p>
                <p className="text-zinc-500 text-xs mt-1">SĐT: {booking.customer.phone}</p>
                <p className="text-zinc-500 text-xs mt-0.5">Email: {booking.customer.email}</p>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Không có thông tin khách</p>
            )}
          </div>

          {/* Financial Summary Card */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900">Tổng kết thanh toán</h2>
            {summary ? (
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Giá trị gốc</span>
                  <span className="font-medium text-zinc-950">{VND.format(Number(booking.totalPrice) - summary.totalServices)} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dịch vụ thêm</span>
                  <span className="font-medium text-zinc-950">+{VND.format(summary.totalServices)} đ</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-2.5">
                  <span className="text-zinc-700 font-medium">Tổng hóa đơn</span>
                  <span className="font-bold text-zinc-950">{VND.format(Number(booking.totalPrice))} đ</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Đã thanh toán</span>
                  <span className="font-semibold">-{VND.format(summary.totalPaid)} đ</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-2.5 text-red-600 font-semibold">
                  <span>Cần thanh toán</span>
                  <span>{VND.format(summary.outstanding)} đ</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Đang tính toán...</p>
            )}

            {canCheckout && (
              <button
                onClick={handleCheckout}
                disabled={actioning}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {actioning ? <Spinner className="w-4 h-4 mx-auto" /> : "Check-out nhận phòng"}
              </button>
            )}

            {user?.role === "Saler" && (
              <div className="pt-4 mt-2 border-t border-zinc-100 space-y-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Thao tác của Saler</p>
                {(booking.status !== "Cancelled" && booking.status !== "Completed") && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    disabled={actioning}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60"
                  >
                    Sửa đặt phòng (yêu cầu minh chứng)
                  </button>
                )}
                {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                  <button
                    onClick={handleCancelSale}
                    disabled={actioning}
                    className="w-full py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60"
                  >
                    Hủy đặt phòng
                  </button>
                )}
                {booking.status !== "Completed" && (
                  <button
                    onClick={handleDeleteSale}
                    disabled={actioning}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60"
                  >
                    Xóa mềm đặt phòng
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Services Request Card */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" /> Dịch vụ sử dụng
            </h2>
            {booking.services && booking.services.length > 0 ? (
              <div className="space-y-2">
                {booking.services.map((bs) => (
                  <div key={bs.bookingServiceId} className="flex justify-between text-xs py-1 border-b border-zinc-50">
                    <div>
                      <p className="font-semibold text-zinc-800">{bs.service?.serviceName}</p>
                      <p className="text-zinc-400">SL: {bs.quantity} x {VND.format(Number(bs.service?.price))} đ</p>
                    </div>
                    <span className="font-medium text-zinc-900">
                      {VND.format(Number(bs.service?.price ?? 0) * bs.quantity)} đ
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Không có dịch vụ thêm.</p>
            )}
          </div>
        </div>
      </div>
      {showEditModal && booking && (
        <SaleEditModal
          open={showEditModal}
          booking={booking}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => {
            setShowEditModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}