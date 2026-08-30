"use client";

import Link from "next/link";
import { useState } from "react";
import { API_BASE_URL, getApiError } from "@/lib/api";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
	const isLogin = mode === "login";
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSubmitted(false);
		setLoading(true);

		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "").trim();
		const password = String(formData.get("password") ?? "").trim();

		try {
			if (isLogin) {
				const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				});

				if (!response.ok) {
					throw await getApiError(response, "Login failed");
				}

				const loginResult = (await response.json()) as Record<string, unknown>;
				const user = (loginResult.user as Record<string, unknown> | undefined) ?? loginResult;
				const userId = user.id ?? user.uuid ?? user.user_id ?? loginResult.user_id;
				if (userId) {
					localStorage.setItem(
						"iqra-user",
						JSON.stringify({
							id: String(userId),
							name: String(user.name ?? user.full_name ?? user.username ?? user.email ?? "Account"),
							email: typeof user.email === "string" ? user.email : "",
						}),
					);
					window.dispatchEvent(new Event("iqra-user-changed"));
				}

				window.location.assign("/");
				return;
			}

			const name = String(formData.get("name") ?? "").trim();
			const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});

			if (!response.ok) {
				throw await getApiError(response, "Registration failed");
			}

			window.location.assign(`/verify-otp?email=${encodeURIComponent(email)}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : isLogin ? "Login failed." : "Registration failed.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			{!isLogin && <Field label="Full name" name="name" type="text" placeholder="Your full name" />}
			<Field label="Email address" name="email" type="email" placeholder="you@example.com" />
			<Field label="Password" name="password" type="password" placeholder="Enter your password" />
			{isLogin && (
				<div className="flex items-center justify-between gap-3">
					<Link href="/signup" className="text-sm font-semibold text-blue-700 hover:text-blue-800">Create an account</Link>
					<Link href="/forgot-password" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Forgot password?</Link>
				</div>
			)}
			<button type="submit" disabled={loading} className="flex h-14 w-full items-center justify-center rounded-2xl bg-sky-700 px-5 text-base font-black text-white shadow-[0_10px_24px_rgba(3,105,161,0.22)] transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-70">
				{loading ? (isLogin ? "Logging in..." : "Creating account...") : isLogin ? "Log in" : "Create account"}
			</button>
			{submitted && <p className="rounded-xl bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-800">{isLogin ? "Logged in successfully." : "Account created successfully."}</p>}
			{error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
		</form>
	);
}

function Field({ label, name, type, placeholder }: { label: string; name: string; type: string; placeholder: string }) {
	return (
		<label className="block space-y-2 text-sm font-bold text-slate-800">
			{label}
			<input required name={name} type={type} placeholder={placeholder} className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-100" />
		</label>
	);
}
