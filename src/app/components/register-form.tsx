"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL, getCourses, type CourseRecord } from "@/lib/api";

export function RegisterForm({ selectedCourse }: { selectedCourse?: string }) {
	const [courseList, setCourseList] = useState<CourseRecord[]>([]);
	const [course, setCourse] = useState(selectedCourse ?? "");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadCourses = async () => {
			try {
				const courses = await getCourses();
				setCourseList(courses);
				if (selectedCourse && courses.some((item) => item.id === selectedCourse)) {
					setCourse(selectedCourse);
				}
			} catch {
				setError("The course list could not be loaded from the API right now.");
			} finally {
				setLoading(false);
			}
		};

		loadCourses();
	}, [selectedCourse]);

	const chosen = courseList.find((product) => product.id === course);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSubmitted(false);

		const formData = new FormData(event.currentTarget);
		const payload = {
			user_id: crypto.randomUUID(),
			course_id: course,
			full_name: `${String(formData.get("firstName") ?? "").trim()} ${String(formData.get("lastName") ?? "").trim()}`.trim(),
			whatsapp: String(formData.get("phone") ?? "").trim(),
			notes: `Email: ${String(formData.get("email") ?? "")}`,
		};

		try {
			const response = await fetch(`${API_BASE_URL}/v1/enrollments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error("Enrollment failed");
			}

			setSubmitted(true);
		} catch {
			setError("Enrollment could not be submitted to the live API. Please retry or check the backend status.");
		}
	};

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="First name" name="firstName" placeholder="First name" />
				<Field label="Last name" name="lastName" placeholder="Last name" />
			</div>
			<Field label="Email address" name="email" type="email" placeholder="you@example.com" />
			<Field label="Phone / WhatsApp" name="phone" placeholder="+923001234567" />
			<label className="block space-y-2 text-sm font-semibold text-zinc-800">
				Choose a course
				<select required disabled={loading} value={course} onChange={(event) => setCourse(event.target.value)} className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 font-normal text-zinc-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60">
					<option value="">Select a course</option>
					{courseList.map((product) => <option key={product.id} value={product.id}>{product.title ?? product.name} · ${product.price}</option>)}
				</select>
			</label>
			{chosen && <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900"><span className="font-bold">Selected:</span> {chosen.title ?? chosen.name} · {chosen.duration ?? "Flexible schedule"}</div>}
			<label className="flex items-start gap-3 text-sm leading-5 text-zinc-600"><input required type="checkbox" className="mt-1 size-4 accent-blue-600" />I agree to the learning community terms.</label>
			<button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">{loading ? "Loading courses..." : "Register for course"}</button>
			{submitted && <p className="rounded-xl bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-800">Enrollment submitted for {chosen?.title ?? chosen?.name ?? "your selected course"}.</p>}
			{error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
			<p className="text-center text-sm text-zinc-500">Want to browse first? <Link href="/courses" className="font-semibold text-blue-700">View all courses</Link></p>
		</form>
	);
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder: string }) {
	return <label className="block space-y-2 text-sm font-semibold text-zinc-800">{label}<input required name={name} type={type} placeholder={placeholder} className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 font-normal text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /></label>;
}
