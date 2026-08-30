import type { ReactNode } from "react";
import { HeaderNavigationBase } from "./application/app-navigation/header-navigation";

const navItems = [
	{ label: "Home", href: "/" },
	{ label: "About", href: "/aboutus" },
	{ label: "Courses", href: "/courses" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Blog", href: "/blog" },
	{ label: "Contact", href: "/contactus" },
];

export function AuthShell({
	title,
	description,
	children,
	footer,
}: {
	title: string;
	description: string;
	children: ReactNode;
	footer: ReactNode;
}) {
	return (
		<div className="min-h-screen bg-[#eef4f8]" style={{ fontFamily: "var(--font-jost), sans-serif" }}>
			<HeaderNavigationBase items={navItems} />
			<main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8 md:py-16">
				<section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_28px_80px_rgba(15,45,65,0.14)] lg:grid-cols-[0.9fr_1.1fr]">
					<div className="relative hidden min-h-[580px] overflow-hidden bg-[#075985] p-10 text-white lg:flex lg:flex-col lg:justify-between">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_36%),linear-gradient(145deg,#1d4ed8,#0f3b91)]" />
						<div className="relative">
							<span className="text-sm font-bold tracking-[0.18em] uppercase">Iqra International</span>
							<h2 className="mt-8 max-w-sm text-5xl font-black leading-[1.05] tracking-tight">A thoughtful place to begin learning.</h2>
						</div>
						<p className="relative max-w-sm text-sm leading-7 text-blue-100">Join a growing learning community with courses designed for steady progress and meaningful practice.</p>
					</div>
					<div className="p-6 sm:p-10 md:p-14 lg:p-16">
						<div className="mb-8 lg:hidden">
							<span className="text-xs font-bold tracking-[0.18em] text-blue-700 uppercase">Iqra International</span>
						</div>
						<div className="mb-8">
							<h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h1>
							<p className="mt-4 max-w-md text-base font-medium leading-7 text-slate-600">{description}</p>
						</div>
						{children}
						<div className="mt-8 border-t border-zinc-100 pt-6 text-center text-sm text-zinc-600">{footer}</div>
					</div>
				</section>
			</main>
		</div>
	);
}
