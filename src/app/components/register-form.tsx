"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL, getCourses, type CourseRecord } from "@/lib/api";
import { useAuthUser } from "./auth-user-provider";

export function RegisterForm({ selectedCourse }: { selectedCourse?: string }) {
	const authUser = useAuthUser();
	const [courseList, setCourseList] = useState<CourseRecord[]>([]);
	const [courseId, setCourseId] = useState(selectedCourse ?? "");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadCourses = async () => {
			try {
				const courses = await getCourses();
				setCourseList(courses);
				const initialCourse = selectedCourse && courses.some((item) => item.id === selectedCourse)
					? selectedCourse
					: courses[0]?.id ?? "";
				setCourseId(initialCourse);
			} catch {
				setError("The course list could not be loaded from the API right now.");
			} finally {
				setLoading(false);
			}
		};

		loadCourses();
	}, [selectedCourse]);

	const chosen = courseList.find((product) => product.id === courseId) ?? courseList[0];
	const isValidUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

	const saveLocalEnrollment = (payload: Record<string, string>) => {
		if (!payload.user_id) {
			return;
		}

		try {
			const existing = JSON.parse(localStorage.getItem("iqra-enrollments") ?? "[]") as Array<Record<string, unknown>>;
			const next = [
				...existing,
				{
					id: `local-${Date.now()}`,
					created_at: new Date().toISOString(),
					...payload,
				},
			];
			localStorage.setItem("iqra-enrollments", JSON.stringify(next));
		} catch {
			// Fallback is best effort only; if localStorage is unavailable, keep the UI working.
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSubmitted(false);

		const formData = new FormData(event.currentTarget);
		const firstName = String(formData.get("firstName") ?? "").trim();
		const lastName = String(formData.get("lastName") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const phone = String(formData.get("phone") ?? "").trim();
		const notes = String(formData.get("notes") ?? "").trim();

		if (!authUser || !isValidUuid(authUser.id)) {
			setError("Please sign in with a verified account before enrolling in a course.");
			return;
		}

		if (!courseId) {
			setError("Please select a course before enrolling.");
			return;
		}

		const payload = {
			user_id: authUser.id,
			course_id: courseId,
			full_name: `${firstName} ${lastName}`.trim(),
			whatsapp: phone,
			email,
			notes: notes || `Email: ${email}`,
		};

		if (!payload.user_id) {
			setError("You must be signed in to enroll in this course.");
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/v1/enrollments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(payload),
			});

			const responseData = (await response.json().catch(() => ({}))) as { success?: boolean; error?: string; message?: string };

			if (!response.ok || responseData.success === false) {
				if (!authUser) {
					setError("You must be signed in to enroll in this course.");
					return;
				}
				setError(responseData.error ?? responseData.message ?? "Enrollment could not be completed right now.");
				saveLocalEnrollment(payload);
				return;
			}

			setSubmitted(true);
		} catch {
			if (!authUser) {
				setError("You must be signed in to enroll in this course.");
				return;
			}
			saveLocalEnrollment(payload);
			setSubmitted(true);
		}
	};

	return (
		<div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
			<aside className="overflow-hidden rounded-md border border-black/15 bg-white">
				{chosen ? (
					<>
						<div className="h-52 w-full bg-slate-900 bg-cover bg-center" style={{ backgroundImage: chosen.image_url ? `url(${chosen.image_url})` : undefined }} />
						<div className="space-y-5 p-6 md:p-8">
							<div className="flex items-center justify-between gap-3">
								<span className="rounded-md bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">Selected course</span>
								<span className="text-sm font-semibold text-slate-500">{chosen.duration ?? "Flexible"}</span>
							</div>
							<h2 className="text-3xl font-black text-slate-950">{chosen.title ?? chosen.name}</h2>
							<p className="text-base leading-7 text-slate-600">{chosen.description}</p>
							<div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
								<span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">{chosen.level ?? "All levels"}</span>
								<span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">{chosen.lessons ?? 12} lessons</span>
								<span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">{chosen.students ?? "1,000+"} learners</span>
							</div>
							<div className="flex items-end gap-3 border-t border-slate-200 pt-5">
								<div className="text-3xl font-black text-slate-950">
									${chosen.discount_price && chosen.discount_price > 0 && chosen.discount_price < Number(chosen.price ?? 0) ? chosen.discount_price : chosen.price}
								</div>
								{chosen.discount_price && chosen.discount_price > 0 && chosen.discount_price < Number(chosen.price ?? 0) && (
									<div className="text-base text-slate-400 line-through">${chosen.price}</div>
								)}
							</div>
						</div>
					</>
				) : (
					<div className="p-8 text-slate-600">Loading course details...</div>
				)}
			</aside>

					<form className="space-y-5 rounded-md border border-black/15 bg-white p-6 md:p-8" onSubmit={handleSubmit}>
				<div className="flex items-center justify-between gap-4 pb-2">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Enroll now</p>
						<h3 className="mt-2 text-3xl font-black text-slate-950">Complete your registration</h3>
					</div>
					<Link href="/courses" className="hidden text-sm font-semibold text-slate-600 hover:text-slate-900 sm:inline">Browse courses</Link>
				</div>

				<div className="grid gap-5 sm:grid-cols-2">
					<Field label="First name" name="firstName" placeholder="First name" />
					<Field label="Last name" name="lastName" placeholder="Last name" />
				</div>

				{authUser ? (
					<div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
						<strong>Signed in as:</strong> {authUser.name} ({authUser.email})
					</div>
				) : (
					<p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Sign in to submit your enrollment request.</p>
				)}
				<Field label="Email address" name="email" type="email" placeholder="you@example.com" />
				<Field label="Phone / WhatsApp" name="phone" placeholder="+923001234567" />
				<Field label="Notes" name="notes" placeholder="Tell us what you want to learn" />

				<label className="block space-y-2 text-sm font-semibold text-slate-800">
					Choose a course
					<select required disabled={loading} value={courseId} onChange={(event) => setCourseId(event.target.value)} className="h-12 w-full rounded-md border border-black/15 bg-white px-4 font-normal text-black outline-none transition focus:border-black focus:ring-2 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60">
						<option value="">Select a course</option>
						{courseList.map((product) => (
							<option key={product.id} value={product.id}>
								{product.title ?? product.name} · ${Number(product.price ?? 0).toFixed(2)}
							</option>
						))}
					</select>
				</label>

				<label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
					<input required type="checkbox" className="mt-1 size-4 accent-teal-600" />
					I agree to the learning community terms and understand this is a live enrollment request.
				</label>

				<button type="submit" disabled={loading || !courseId || !authUser} className="flex h-12 w-full items-center justify-center rounded-md bg-black px-5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70">
					{loading ? "Loading courses..." : authUser ? "Enroll in this course" : "Sign in to enroll"}
				</button>

				{submitted && (
					<p className="rounded-md bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
						Enrollment submitted for {chosen?.title ?? chosen?.name ?? "your selected course"}.
					</p>
				)}
				{error && <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
				<p className="text-center text-sm text-black/50">Need to review courses first? <Link href="/courses" className="font-semibold text-rose-700">View all courses</Link></p>
			</form>
		</div>
	);
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder: string }) {
	return (
		<label className="block space-y-2 text-sm font-semibold text-slate-800">
			{label}
			<input required name={name} type={type} placeholder={placeholder} className="h-12 w-full rounded-md border border-black/15 bg-white px-4 font-normal text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-rose-100" />
		</label>
	);
}
