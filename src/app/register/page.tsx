import Link from "next/link";
import { HeaderNavigationBase } from "../components/application/app-navigation/header-navigation";
import { RegisterForm } from "../components/register-form";

const navItems = [
	{ label: "Home", href: "/" },
	{ label: "About", href: "/aboutus" },
	{ label: "Courses", href: "/courses" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Blog", href: "/blog" },
	{ label: "Contact", href: "/contactus" },
];

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ course?: string | string[] }> }) {
	const params = await searchParams;
	const selectedCourse = typeof params.course === "string" ? params.course : undefined;

	return (
		<div className="min-h-screen bg-[#f5f7f2] text-black" style={{ fontFamily: "var(--font-jost), sans-serif" }}>
			<HeaderNavigationBase items={navItems} activeUrl="/courses" />
			<main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
				<div className="mb-8 text-center md:text-left">
					<p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Course registration</p>
					<h1 className="mt-3 text-4xl font-black tracking-tight text-black md:text-5xl">Enroll in your dedicated course</h1>
					<p className="mt-4 max-w-2xl text-base leading-7 text-black/60">
						Choose the learning path you want, tell us who you are, and we’ll record your enrollment against the live course catalogue.
					</p>
				</div>
				<RegisterForm selectedCourse={selectedCourse} />
				<div className="mt-8 text-center text-sm text-black/60">
					Already enrolled? <Link href="/login" className="font-bold text-rose-700 hover:text-black">Log in</Link>
				</div>
			</main>
		</div>
	);
}
