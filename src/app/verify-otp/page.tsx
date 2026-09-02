"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL, getApiError } from "@/lib/api";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get("email") ?? "");
  }, []);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) throw await getApiError(response, "OTP verification failed");
      window.location.assign("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The OTP is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw await getApiError(response, "Resend failed");
      setStatus("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not resend the OTP.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-10 text-black md:py-16" style={{ fontFamily: "var(--font-jost), sans-serif" }}>
      <div className="mx-auto max-w-lg rounded-md border border-black/15 bg-white p-7 sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-600">Verify OTP</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-black">Confirm your account</h1>
        <p className="mt-4 text-base font-medium leading-7 text-black/60">Enter the 6-digit code sent to your email address to finish creating your account.</p>

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          <input type="hidden" name="email" value={email} readOnly />
          <label className="block text-sm font-bold text-black">
            OTP code
            <input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="mt-2 h-16 w-full rounded-md border border-black/15 bg-white px-4 text-center text-2xl font-black tracking-[0.45em] text-black outline-none transition focus:border-black focus:ring-2 focus:ring-rose-100" placeholder="000000" aria-label="6-digit OTP code" />
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-md bg-black px-5 py-4 text-base font-black text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={handleResend} className="text-sm font-bold text-rose-700 hover:text-black">Resend code</button>
          <Link href="/login" className="text-sm font-bold text-black/60 hover:text-black">Back to login</Link>
        </div>

        {status && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</p>}
        {error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      </div>
    </main>
  );
}
