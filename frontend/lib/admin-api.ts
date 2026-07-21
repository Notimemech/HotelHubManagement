import { apiRequest } from "./api";

// --- Types ---
export interface DashboardSummary {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  topRoomTypes: Array<{ typeName: string; bookings: number }>;
  bookingsByDay: Array<{ date: string; count: number }>;
  recentBookings: Array<{
    bookingId: string;
    customerName: string;
    totalPrice: number;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
  }>;
}

export interface RoomType {
  typeId: string;
  typeName: string;
  description: string | null;
  price: number;
  maxGuests: number;
}

export interface Room {
  roomId: string;
  roomCode: string;
  typeId: string;
  floor: number;
  status: string;
  roomType?: RoomType;
}

export interface Staff {
  staffId: string;
  accountId: string;
  cccd: string;
  fullName: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  role: string;
}

export interface Booking {
  bookingId: string;
  customerId: string;
  bookingDate: string;
  currentVersion: number;
  totalPrice: number;
  status: string;
  customer?: {
    fullName: string;
    phone: string;
    email: string;
  };
  versions?: Array<{
    versionId: string;
    versionNumber: number;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    specialRequest: string | null;
    totalAmountAtThisVersion: number;
    changeReason: string | null;
    staffInCharge?: Staff | null;
    details?: Array<{
      bookingDetailId: string;
      roomId: string;
      price: number;
      nights: number;
      room?: Room;
    }>;
    payments?: Payment[];
  }>;
  payments?: Payment[];
  services?: Array<{
    bookingServiceId: string;
    bookingId: string;
    serviceId: string;
    quantity: number;
    service?: Service;
  }>;
}

export interface Service {
  serviceId: string;
  serviceName: string;
  price: number;
}

export interface Payment {
  paymentId: string;
  bookingId: string;
  versionId: string;
  amount: number;
  method: string;
  status: string;
  paidAt: string | null;
  booking?: Booking;
}

// --- API Calls ---
export function getDashboardSummary(from?: string, to?: string) {
  const query = [from && `from=${from}`, to && `to=${to}`].filter(Boolean).join("&");
  return apiRequest<DashboardSummary>(`/dashboard/summary${query ? `?${query}` : ""}`);
}

// Rooms
export function listRooms() {
  return apiRequest<Room[]>("/rooms");
}
export function createRoom(dto: Omit<Room, "roomId" | "roomType">) {
  return apiRequest<Room>("/rooms", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updateRoom(id: string, dto: Partial<Room>) {
  return apiRequest<Room>(`/rooms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function setRoomStatus(id: string, status: string) {
  return apiRequest<Room>(`/rooms/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
export function assignRoomToCleaner(roomId: string, cleanerStaffId: string) {
  return apiRequest("/housekeeping/assignments", {
    method: "POST",
    body: JSON.stringify({ roomId, cleanerStaffId }),
  });
}
export function deleteRoom(id: string) {
  return apiRequest<{ message: string }>(`/rooms/${id}`, {
    method: "DELETE",
  });
}

// Room Types
export function listRoomTypes() {
  return apiRequest<RoomType[]>("/room-types");
}
export function createRoomType(dto: Omit<RoomType, "typeId">) {
  return apiRequest<RoomType>("/room-types", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updateRoomType(id: string, dto: Partial<RoomType>) {
  return apiRequest<RoomType>(`/room-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function deleteRoomType(id: string) {
  return apiRequest<{ message: string }>(`/room-types/${id}`, {
    method: "DELETE",
  });
}

// Staff
export function listStaff() {
  return apiRequest<Staff[]>("/staff");
}
export function getStaff(id: string) {
  return apiRequest<Staff>(`/staff/${id}`);
}
export function createStaff(dto: Record<string, string | undefined>) {
  return apiRequest<Staff>("/staff/register", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updateStaff(id: string, dto: Partial<Staff> & { password?: string }) {
  return apiRequest<Staff>(`/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function changeStaffRole(id: string, roleName: string) {
  return apiRequest<{ message: string }>(`/staff/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ roleName }),
  });
}

// Bookings
export function listBookings(filter: { status?: string; q?: string; from?: string; to?: string } = {}) {
  const query = Object.entries(filter)
    .filter(([_, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return apiRequest<Booking[]>(`/bookings/admin${query ? `?${query}` : ""}`);
}
export function getBooking(id: string) {
  return apiRequest<Booking>(`/bookings/admin/${id}`);
}
export function checkoutBooking(id: string) {
  return apiRequest<{ message: string }>(`/bookings/admin/${id}/checkout`, {
    method: "POST",
  });
}
export function walkInBooking(dto: Record<string, any>) {
  return apiRequest<{ bookingId: string }>(`/bookings/walk-in`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

// Saler-only booking flows
export type CreateSaleBookingDto = {
  customerFullName: string;
  customerPhone: string;
  customerEmail?: string;
  customerCccd?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomIds: string[];
  specialRequest?: string;
  evidenceImage?: string;
};

export type UpdateSaleBookingDto = {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  roomIds?: string[];
  specialRequest?: string;
  requestEvidenceImage: string;
  changeReason?: string;
};

export function createSaleBooking(dto: CreateSaleBookingDto) {
  return apiRequest<{ message: string; bookingId: string; customerId: string; isNewCustomer: boolean }>(
    `/sale/bookings`,
    { method: "POST", body: JSON.stringify(dto) },
  );
}

export function updateSaleBooking(id: string, dto: UpdateSaleBookingDto) {
  return apiRequest<{ message: string; versionNumber: number; bookingId: string }>(
    `/sale/bookings/${id}`,
    { method: "PUT", body: JSON.stringify(dto) },
  );
}

export function softDeleteBooking(id: string) {
  return apiRequest<{ message: string; bookingId: string }>(
    `/sale/bookings/${id}`,
    { method: "DELETE" },
  );
}

export function cancelBookingForStaff(id: string) {
  return apiRequest<{ message: string; bookingId: string; status: string }>(
    `/sale/bookings/${id}/cancel`,
    { method: "PATCH" },
  );
}

// Services
export function listServices() {
  return apiRequest<Service[]>("/services");
}
export function createService(dto: Omit<Service, "serviceId">) {
  return apiRequest<Service>("/services", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updateService(id: string, dto: Partial<Service>) {
  return apiRequest<Service>(`/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function deleteService(id: string) {
  return apiRequest<{ message: string }>(`/services/${id}`, {
    method: "DELETE",
  });
}

// Payments
export function listPayments(filter: { from?: string; to?: string; status?: string; method?: string; bookingId?: string } = {}) {
  const query = Object.entries(filter)
    .filter(([_, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return apiRequest<{ payments: Payment[]; total: number }>(`/payments/admin${query ? `?${query}` : ""}`);
}
export function getBookingPaymentSummary(bookingId: string) {
  return apiRequest<{ booking: Booking; totalPaid: number; totalServices: number; outstanding: number }>(
    `/payments/admin/booking/${bookingId}/summary`
  );
}
