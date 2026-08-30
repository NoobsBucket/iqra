import { BookOpen, Mail, Phone } from "lucide-react";
import { UntitledLogo } from "./foundations/logo/untitledui-logo";

const links = [
	{ label: "Courses", href: "/courses" },
	{ label: "About us", href: "/aboutus" },
	{ label: "Blog", href: "/blog" },
	{ label: "Contact", href: "/contactus" },
];

export function SiteFooter() {
	return (
		<footer className="bg-[#071b2b] text-white [font-family:var(--font-jost),sans-serif]">
			<div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 md:py-16">
				<div>
					<a href="/" className="inline-flex items-center gap-3 text-white">
						<UntitledLogo className="h-6 brightness-0 invert" />
						<span className="text-lg font-bold tracking-[0.08em] uppercase">Iqra International</span>
					</a>
					<p className="mt-5 max-w-sm text-sm leading-7 text-white/65">Structured Quran and Islamic learning with qualified scholars and a welcoming community.</p>
				</div>
				<div>
					<h2 className="text-sm font-bold tracking-[0.14em] text-[#f1d27b] uppercase">Explore</h2>
					<nav className="mt-4 flex flex-col items-start gap-3 text-sm text-white/70">
						{links.map((link) => <a key={link.href} href={link.href} className="transition hover:text-[#f1d27b]">{link.label}</a>)}
					</nav>
				</div>
				<div>
					<h2 className="text-sm font-bold tracking-[0.14em] text-[#f1d27b] uppercase">Learn with us</h2>
					<div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
						<span className="inline-flex items-center gap-2"><BookOpen className="size-4 text-[#d6a63a]" /> Quran learning paths</span>
						<a href="mailto:hello@iqrainternational.com" className="inline-flex items-center gap-2 transition hover:text-[#f1d27b]"><Mail className="size-4 text-[#d6a63a]" /> hello@iqrainternational.com</a>
						<a href="tel:+10000000000" className="inline-flex items-center gap-2 transition hover:text-[#f1d27b]"><Phone className="size-4 text-[#d6a63a]" /> +1 (000) 000-0000</a>
					</div>
				</div>
			</div>
			<div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45 md:px-8">© {new Date().getFullYear()} Iqra International. All rights reserved.</div>
		</footer>
	);
}
