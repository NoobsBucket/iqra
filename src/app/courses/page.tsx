import type { Metadata } from "next";
import { CategoryRender } from "../components/category-render";
import { HeaderNavigationBase } from "../components/application/app-navigation/header-navigation";
import { getSeoPage, getSettings } from "@/lib/api";

export const dynamic = "force-dynamic";

async function resolveCourseIndexMetadata(): Promise<Metadata> {
	const [seoRecord, settings] = await Promise.all([getSeoPage("/courses"), getSettings()]);
	const defaultTitle = settings.default_meta_title ?? "Browse Quran and Islamic Courses | Iqra International";
	const defaultDescription = settings.default_meta_description ?? "Explore online Quran, Arabic, and Islamic studies courses designed for practical learning.";
	const title = seoRecord?.meta_title ?? defaultTitle;
	const description = seoRecord?.meta_description ?? defaultDescription;
	const keywords = seoRecord?.meta_keywords ? seoRecord.meta_keywords.split(",").map((item) => item.trim()).filter(Boolean) : settings.default_meta_keywords ? settings.default_meta_keywords.split(",").map((item) => item.trim()).filter(Boolean) : ["courses", "quran", "islamic studies"];
	return {
		title,
		description,
		keywords,
		robots: seoRecord?.robots ?? "index,follow",
		alternates: { canonical: seoRecord?.canonical_url ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://iqrainternationalislamicinstitute.com"}/courses` },
		openGraph: {
			title: seoRecord?.og_title ?? title,
			description: seoRecord?.og_description ?? description,
			images: seoRecord?.og_image ? [seoRecord.og_image] : undefined,
		},
	};
}

export async function generateMetadata(): Promise<Metadata> {
	return resolveCourseIndexMetadata();
}

const navItems = [
	{ label: "Home", href: "/" },
	{ label: "Courses", href: "/courses" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Blog", href: "/blog" },
	{ label: "Contact", href: "/contactus" },
];

export default function CoursesPage() {
	return (
		<div className="min-h-screen bg-[#f8fafc]">
			<HeaderNavigationBase items={navItems} activeUrl="/courses" />
			<CategoryRender />
		</div>
	);
}
