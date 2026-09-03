"use client";

import Link from "next/link";
import { useState } from "react";
import { API_BASE_URL, getApiError, normalizeApiUrl } from "@/lib/api";

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
					credentials: "include",
					body: JSON.stringify({ email, password }),
				});

				const loginResult = (await response.json().catch(() => ({}))) as Record<string, unknown>;
				const loginMessage =
					typeof loginResult.message === "string"
						? loginResult.message
						: typeof loginResult.error === "string"
							? loginResult.error
							: "";
				const nestedUser = (loginResult.user as Record<string, unknown> | undefined) ?? loginResult;
				const roleValue =
					typeof nestedUser.role === "string"
						? nestedUser.role
						: typeof nestedUser.user_role === "string"
							? nestedUser.user_role
							: typeof nestedUser.role_name === "string"
								? nestedUser.role_name
								: "user";
				const role = roleValue.toLowerCase();
				const loginFailed =
					Boolean(loginResult.success === false) ||
					/invalid|incorrect|wrong|failed|not found|unauthorized/i.test(loginMessage) ||
					(!response.ok && !/verify.*email|email.*verify/i.test(loginMessage));

				if (!response.ok || loginFailed) {
					const apiError = await getApiError(response, loginMessage || "Login failed");
					const verificationError = /verify.*email|email.*verify/i.test(apiError.message);

					if (verificationError) {
						window.location.assign(`/verify-otp?email=${encodeURIComponent(email)}`);
						return;
					}

					throw apiError;
				}

				const user = (loginResult.user as Record<string, unknown> | undefined) ?? loginResult;
				const userId = user.id ?? user.uuid ?? user.user_id ?? loginResult.user_id;
				const normalizedAvatar = normalizeApiUrl(
					typeof user.avatar_url === "string"
						? user.avatar_url
						: typeof user.avatar === "string"
							? user.avatar
							: typeof user.profile_image === "string"
								? user.profile_image
								: typeof user.profile_picture === "string"
									? user.profile_picture
									: undefined
				);
				if (!userId && !loginResult.token && !loginResult.access_token && !loginResult.session) {
					throw new Error("Login response was incomplete.");
				}

				if (userId) {
					const authUser = {
						id: String(userId),
						name: String(user.name ?? user.full_name ?? user.username ?? user.email ?? "Account"),
						email: typeof user.email === "string" ? user.email : "",
						avatar: normalizedAvatar,
						role: role,
					};

					localStorage.setItem("iqra-user", JSON.stringify(authUser));
					const secure = window.location.protocol === "https:" ? "; Secure" : "";
					document.cookie = `iqra-role=${encodeURIComponent(role)}; path=/; SameSite=Lax${secure}`;
					window.dispatchEvent(new Event("iqra-user-changed"));
				}

				window.location.assign("/");
				return;
			}

			const name = String(formData.get("name") ?? "").trim();
			const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
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
			<button type="submit" disabled={loading} className="flex h-14 w-full items-center justify-center rounded-md bg-black px-5 text-base font-black text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-70">
				{loading ? (isLogin ? "Logging in..." : "Creating account...") : isLogin ? "Log in" : "Create account"}
			</button>
			{isLogin && <a href="/api/auth/google" className="flex h-14 w-full items-center justify-center gap-3 rounded-md border border-black/15 bg-white px-5 text-base font-bold text-black transition hover:border-black/35 hover:bg-slate-50"><GoogleMark /> Continue with Google</a>}
			{submitted && <p className="rounded-xl bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-800">{isLogin ? "Logged in successfully." : "Account created successfully."}</p>}
			{error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
		</form>
	);
}

function GoogleMark() {
	return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5"><path fill="#4285F4" d="M21.6 12.23c0-.7-.06-1.37-.18-2H12v3.79h5.38a4.6 4.6 0 0 1-1.99 3.02v2.5h3.22c1.89-1.74 2.99-4.3 2.99-7.31Z" /><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.46l-3.22-2.5c-.9.6-2.05.96-3.39.96-2.61 0-4.83-1.76-5.62-4.13H3.05v2.58A9.99 9.99 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.38 13.87A6 6 0 0 1 6.06 12c0-.65.11-1.28.32-1.87V7.55H3.05A10 10 0 0 0 2 12c0 1.61.39 3.13 1.05 4.45l3.33-2.58Z" /><path fill="#EA4335" d="M12 6c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 2.93 14.7 2 12 2a9.99 9.99 0 0 0-8.95 5.55l3.33 2.58C7.17 7.76 9.39 6 12 6Z" /></svg>;
}

function Field({ label, name, type, placeholder }: { label: string; name: string; type: string; placeholder: string }) {
	return (
		<label className="block space-y-2 text-sm font-bold text-slate-800">
			{label}
			<input required name={name} type={type} placeholder={placeholder} className="h-14 w-full rounded-md border border-black/15 bg-white px-4 text-base font-semibold text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-rose-100" />
		</label>
	);
}
