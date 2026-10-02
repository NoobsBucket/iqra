import type { ReactNode } from "react";
import { HeaderNavigationBase } from "./application/app-navigation/header-navigation";

const navItems = [
	{ label: "Home", href: "/" },
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
		<div className="min-h-screen bg-[#f5f7f2] text-black" style={{ fontFamily: "var(--font-jost), sans-serif" }}>
			<HeaderNavigationBase items={navItems} />
			<main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8 md:py-16">
				<section className="w-full max-w-xl rounded-md border border-black/15 bg-white p-6 sm:p-10 md:p-12">
					<div>
						<div className="mb-8 lg:hidden">
							<span className="text-xs font-bold tracking-[0.18em] text-rose-600 uppercase">Iqra International</span>
						</div>
						<div className="mb-8">
							<p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Your next step</p>
							<h1 className="mt-3 text-4xl font-black tracking-tight text-black md:text-5xl">{title}</h1>
							<p className="mt-4 max-w-md text-base font-medium leading-7 text-black/60">{description}</p>
						</div>
						{children}
						<div className="mt-8 border-t border-black/10 pt-6 text-center text-sm text-black/60">{footer}</div>
					</div>
				</section>
			</main>
		</div>
	);
}
