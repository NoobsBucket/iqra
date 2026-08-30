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
    <main className="min-h-screen bg-[#eef4f8] px-4 py-10 md:py-16" style={{ fontFamily: "var(--font-jost), sans-serif" }}>
      <div className="mx-auto max-w-lg rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-[0_28px_80px_rgba(15,45,65,0.14)] sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700">Password recovery</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Create a new password</h1>
        <p className="mt-4 text-base font-medium leading-7 text-slate-600">Enter the code from your email, then choose a strong new password.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input type="hidden" name="email" value={email} readOnly />
          <label className="block text-sm font-bold text-slate-800">
            OTP code
            <input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="mt-2 h-16 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-2xl font-black tracking-[0.45em] text-slate-950 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-100" placeholder="000000" aria-label="6-digit OTP code" />
          </label>
          <label className="block text-sm font-bold text-slate-800">
            New password
            <input required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-100" placeholder="At least 8 characters" />
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-sky-700 px-5 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(3,105,161,0.22)] transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div className="mt-7 flex items-center justify-between gap-3 text-sm">
          <Link href="/login" className="font-bold text-sky-700 hover:text-sky-900">Back to login</Link>
          <Link href="/forgot-password" className="font-bold text-slate-600 hover:text-slate-900">Request new code</Link>
        </div>

        {status && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</p>}
        {error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      </div>
    </main>
  );
}
