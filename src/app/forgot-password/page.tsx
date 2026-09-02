"use client";

import Link from "next/link";
import { useState } from "react";
import { API_BASE_URL, getApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw await getApiError(response, "Forgot password failed");
      window.location.assign(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not send the password reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-10 text-black md:py-16" style={{ fontFamily: "var(--font-jost), sans-serif" }}>
      <div className="mx-auto max-w-lg rounded-md border border-black/15 bg-white p-7 sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-600">Password recovery</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-black">Forgot your password?</h1>
        <p className="mt-4 text-base font-medium leading-7 text-black/60">Enter your email and we’ll send a secure reset code to your inbox.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <label className="block text-sm font-bold text-black">
            Email address
            <input required value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-2 h-14 w-full rounded-md border border-black/15 bg-white px-4 text-base font-semibold text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-rose-100" placeholder="you@example.com" />
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-md bg-black px-5 py-4 text-base font-black text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </form>

        <div className="mt-7 flex items-center justify-between gap-3 text-sm">
          <Link href="/login" className="font-bold text-rose-700 hover:text-black">Back to login</Link>
          <span className="font-medium text-black/50">We’ll verify your identity</span>
        </div>

        {status && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</p>}
        {error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      </div>
    </main>
  );
}
