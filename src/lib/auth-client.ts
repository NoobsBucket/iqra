"use client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const payload = data as { error?: string };
    throw new Error(payload.error ?? "Request failed");
  }

  return data as T;
}

export async function login(email: string, password: string) {
  return postJson<{ user: AuthUser }>("/api/auth/login", { email, password });
}

export async function register(name: string, email: string, password: string) {
  return postJson<{ message: string }>("/api/auth/register", { name, email, password });
}

export async function verifyOtp(email: string, otp: string) {
  return postJson<{ user: AuthUser }>("/api/auth/verify-otp", { email, otp });
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
  return postJson<{ ok: boolean }>("/api/auth/logout", {});
}
