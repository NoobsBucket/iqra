"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL, getApiError } from "@/lib/api";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get("email") ?? "");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      if (!response.ok) throw await getApiError(response, "Reset failed");
      window.location.assign("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed. Please confirm the email, OTP, and new password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-10 text-black md:py-16" style={{ fontFamily: "var(--font-jost), sans-serif" }}>
      <div className="mx-auto max-w-lg rounded-md border border-black/15 bg-white p-7 sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-600">Password recovery</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-black">Create a new password</h1>
        <p className="mt-4 text-base font-medium leading-7 text-black/60">Enter the code from your email, then choose a strong new password.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input type="hidden" name="email" value={email} readOnly />
          <label className="block text-sm font-bold text-black">
            OTP code
            <input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="mt-2 h-16 w-full rounded-md border border-black/15 bg-white px-4 text-center text-2xl font-black tracking-[0.45em] text-black outline-none transition focus:border-black focus:ring-2 focus:ring-rose-100" placeholder="000000" aria-label="6-digit OTP code" />
          </label>
          <label className="block text-sm font-bold text-black">
            New password
            <input required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" className="mt-2 h-14 w-full rounded-md border border-black/15 bg-white px-4 text-base font-semibold text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-rose-100" placeholder="At least 8 characters" />
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-md bg-black px-5 py-4 text-base font-black text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div className="mt-7 flex items-center justify-between gap-3 text-sm">
          <Link href="/login" className="font-bold text-rose-700 hover:text-black">Back to login</Link>
          <Link href="/forgot-password" className="font-bold text-black/60 hover:text-black">Request new code</Link>
        </div>

        {status && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</p>}
        {error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      </div>
    </main>
  );
}
