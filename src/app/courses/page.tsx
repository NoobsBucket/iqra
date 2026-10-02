import type { Metadata } from "next";
import { CategoryRender } from "../components/category-render";
import { HeaderNavigationBase } from "../components/application/app-navigation/header-navigation";
import { getSeoMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	return getSeoMetadata("/courses", {
		title: "Browse Quran and Islamic Courses | Iqra International",
		description: "Explore online Quran, Arabic, and Islamic studies courses designed for practical learning.",
	});
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
