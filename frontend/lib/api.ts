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
