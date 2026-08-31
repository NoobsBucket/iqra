"use client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

export const USER_STORAGE_KEY = "iqra-user";
const USER_CHANGED_EVENT = "iqra-user-changed";

function syncAuthState(user: AuthUser | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.dispatchEvent(new Event(USER_CHANGED_EVENT));
    return;
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(USER_CHANGED_EVENT));
}

function normalizeUser(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const candidate = record.user && typeof record.user === "object" ? (record.user as Record<string, unknown>) : record;

  const id = typeof candidate.id === "string" ? candidate.id : typeof candidate.user_id === "string" ? candidate.user_id : "";
  const name = typeof candidate.name === "string" ? candidate.name : typeof candidate.full_name === "string" ? candidate.full_name : "Account";
  const email = typeof candidate.email === "string" ? candidate.email : "";

  if (!id && !email) return null;

  return {
    id: String(id || email),
    name,
    email,
    role: typeof candidate.role === "string" ? candidate.role : undefined,
    avatar:
      typeof candidate.avatar === "string"
        ? candidate.avatar
        : typeof candidate.avatar_url === "string"
          ? candidate.avatar_url
          : undefined,
  };
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const payload = data as { error?: string; message?: string };
    throw new Error(payload.error ?? payload.message ?? "Request failed");
  }

  return data as T;
}

export async function login(email: string, password: string) {
  const result = await postJson<{ user?: AuthUser; data?: AuthUser }>("/api/auth/login", { email, password });
  const user = normalizeUser(result) ?? normalizeUser(result.user ?? result.data ?? null);
  syncAuthState(user);
  return { user: user ?? { id: "", name: "", email: "" } };
}

export async function register(name: string, email: string, password: string) {
  return postJson<{ message: string }>("/api/auth/register", { name, email, password });
}

export async function verifyOtp(email: string, otp: string) {
  const result = await postJson<{ user?: AuthUser; data?: AuthUser }>("/api/auth/verify-otp", { email, otp });
  const user = normalizeUser(result) ?? normalizeUser(result.user ?? result.data ?? null);
  syncAuthState(user);
  return { user: user ?? { id: "", name: "", email: "" } };
}

export async function resendOtp(email: string) {
  return postJson<{ message: string }>("/api/auth/resend-otp", { email });
}

export async function forgotPassword(email: string) {
  return postJson<{ message: string }>("/api/auth/forgot-password", { email });
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  return postJson<{ message: string }>("/api/auth/reset-password", {
    email,
    otp,
    new_password: newPassword,
  });
}

export async function logout() {
  try {
    await postJson<{ ok: boolean }>("/api/auth/logout", {});
  } finally {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      document.cookie.split(";").forEach((cookie) => {
        const eq = cookie.indexOf("=");
        const name = eq > -1 ? cookie.slice(0, eq).trim() : cookie.trim();
        if (!name) return;
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax; ${window.location.protocol === "https:" ? "Secure;" : ""}`;
      });
      window.dispatchEvent(new Event(USER_CHANGED_EVENT));
    }
  }

  return { ok: true };
}
