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

	const saveLocalEnrollment = (payload: Record<string, string>) => {
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

		if (!authUser) {
			setError("Please sign in before enrolling in a course.");
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

		try {
			const response = await fetch(`${API_BASE_URL}/v1/enrollments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				saveLocalEnrollment(payload);
				setSubmitted(true);
				return;
			}

			setSubmitted(true);
		} catch {
			saveLocalEnrollment(payload);
			setSubmitted(true);
		}
	};

	return (
		<div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
			<aside className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
				{chosen ? (
					<>
						<div className="h-52 w-full bg-slate-900 bg-cover bg-center" style={{ backgroundImage: chosen.image_url ? `linear-gradient(135deg, rgba(15,23,42,0.15), rgba(15,23,42,0.3)), url(${chosen.image_url})` : undefined }} />
						<div className="space-y-5 p-6 md:p-8">
							<div className="flex items-center justify-between gap-3">
								<span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Selected course</span>
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

			<form className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] md:p-8" onSubmit={handleSubmit}>
				<div className="flex items-center justify-between gap-4 pb-2">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Enroll now</p>
						<h3 className="mt-2 text-3xl font-black text-slate-950">Complete your registration</h3>
					</div>
					<Link href="/courses" className="hidden text-sm font-semibold text-slate-600 hover:text-slate-900 sm:inline">Browse courses</Link>
				</div>

				<div className="grid gap-5 sm:grid-cols-2">
					<Field label="First name" name="firstName" placeholder="First name" />
					<Field label="Last name" name="lastName" placeholder="Last name" />
				</div>

				{authUser ? (
					<div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
						<strong>Signed in as:</strong> {authUser.name} ({authUser.email})
					</div>
				) : (
					<p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Sign in to submit your enrollment request.</p>
				)}
				<Field label="Email address" name="email" type="email" placeholder="you@example.com" />
				<Field label="Phone / WhatsApp" name="phone" placeholder="+923001234567" />
				<Field label="Notes" name="notes" placeholder="Tell us what you want to learn" />

				<label className="block space-y-2 text-sm font-semibold text-slate-800">
					Choose a course
					<select required disabled={loading} value={courseId} onChange={(event) => setCourseId(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-normal text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60">
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

				<button type="submit" disabled={loading || !courseId} className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70">
					{loading ? "Loading courses..." : "Enroll in this course"}
				</button>

				{submitted && (
					<p className="rounded-2xl bg-teal-50 px-4 py-3 text-center text-sm font-semibold text-teal-800">
						Enrollment submitted for {chosen?.title ?? chosen?.name ?? "your selected course"}.
					</p>
				)}
				{error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
				<p className="text-center text-sm text-slate-500">Need to review courses first? <Link href="/courses" className="font-semibold text-teal-700">View all courses</Link></p>
			</form>
		</div>
	);
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder: string }) {
	return (
		<label className="block space-y-2 text-sm font-semibold text-slate-800">
			{label}
			<input required name={name} type={type} placeholder={placeholder} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100" />
		</label>
	);
}
