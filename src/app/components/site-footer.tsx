'use client'
import { useEffect, useState } from "react";
import { BookOpen, Mail, Phone } from "lucide-react";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/api";
import { UntitledLogo } from "./foundations/logo/untitledui-logo";

const links = [
	{ label: "Courses", href: "/courses" },
	{ label: "About us", href: "/aboutus" },
	{ label: "Blog", href: "/blog" },
	{ label: "Contact", href: "/contactus" },
];

export function SiteFooter() {
	const [siteName, setSiteName] = useState(DEFAULT_SETTINGS.site_name ?? "Iqra International");
	const [footerTagline, setFooterTagline] = useState(DEFAULT_SETTINGS.footer_tagline ?? "Structured Quran and Islamic learning with qualified scholars and a welcoming community.");
	const [siteEmail, setSiteEmail] = useState(DEFAULT_SETTINGS.site_email ?? "hello@iqrainternational.com");
	const [sitePhone, setSitePhone] = useState(DEFAULT_SETTINGS.site_phone ?? "+1 (000) 000-0000");
	const [footerCopyright, setFooterCopyright] = useState(DEFAULT_SETTINGS.footer_copyright ?? "© 2025 Iqra International. All rights reserved.");

	useEffect(() => {
		let isMounted = true;

		getSettings()
			.then((settings) => {
				if (!isMounted) return;
				setSiteName(settings.site_name ?? DEFAULT_SETTINGS.site_name ?? "Iqra International");
				setFooterTagline(settings.footer_tagline ?? DEFAULT_SETTINGS.footer_tagline ?? "Structured Quran and Islamic learning with qualified scholars and a welcoming community.");
				setSiteEmail(settings.site_email ?? DEFAULT_SETTINGS.site_email ?? "hello@iqrainternational.com");
				setSitePhone(settings.site_phone ?? DEFAULT_SETTINGS.site_phone ?? "+1 (000) 000-0000");
				setFooterCopyright(settings.footer_copyright ?? DEFAULT_SETTINGS.footer_copyright ?? "© 2025 Iqra International. All rights reserved.");
			})
			.catch(() => undefined);

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<footer className="bg-[#071b2b] text-white [font-family:var(--font-jost),sans-serif]">
			<div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 md:py-16">
				<div>
					<a href="/" className="inline-flex items-center gap-3 text-white">
						<UntitledLogo className="h-6 brightness-0 invert" />
						<span className="text-lg font-bold tracking-[0.08em] uppercase">{siteName}</span>
					</a>
					<p className="mt-5 max-w-sm text-sm leading-7 text-white/65">{footerTagline}</p>
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
						<a href={`mailto:${siteEmail}`} className="inline-flex items-center gap-2 transition hover:text-[#f1d27b]"><Mail className="size-4 text-[#d6a63a]" /> {siteEmail}</a>
						<a href={`tel:${sitePhone}`} className="inline-flex items-center gap-2 transition hover:text-[#f1d27b]"><Phone className="size-4 text-[#d6a63a]" /> {sitePhone}</a>
					</div>
				</div>
			</div>
			<div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45 md:px-8">{footerCopyright}</div>
		</footer>
	);
}
         