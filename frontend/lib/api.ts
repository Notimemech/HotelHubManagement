const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message ?? res.statusText;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return data as T;
}

export function completeRoomCleaning(roomId: string) {
  return apiRequest(`/housekeeping/rooms/${roomId}/complete`, {
    method: "PATCH",
  });
}

// ---- Profile helpers ----

export interface CustomerProfile {
  customerId: string;
  accountId: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface StaffProfile {
  staffId: string;
  accountId: string;
  cccd: string;
  fullName: string;
  birthDate?: string | null;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerProfile {
  fullName?: string;
  avatar?: string;
}

export interface UpdateStaffProfile {
  fullName?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
}

export const STAFF_ROLES = [
  "Manager",
  "Receptionist",
  "Saler",
  "Cleaner",
  "Maintainer",
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const isStaffRole = (role: string): role is StaffRole =>
  (STAFF_ROLES as readonly string[]).includes(role);

export function getCustomerProfile() {
  return apiRequest<CustomerProfile>("/customers/profile");
}

export function updateCustomerProfile(dto: UpdateCustomerProfile) {
  return apiRequest<CustomerProfile>("/customers/profile", {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function getMyStaffProfile() {
  return apiRequest<{ staff: StaffProfile }>("/staff/me").then((r) => r.staff);
}

export function updateMyStaffProfile(dto: UpdateStaffProfile) {
  return apiRequest<{ staff: StaffProfile }>("/staff/me", {
    method: "PATCH",
    body: JSON.stringify(dto),
  }).then((r) => r.staff);
}

export function changePassword(oldPassword: string, newPassword: string) {
  return apiRequest<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}
