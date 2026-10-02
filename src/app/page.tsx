import type { Metadata } from "next";
import Hero from "./components/hero";
import { HeaderNavigationBase } from "./components/application/app-navigation/header-navigation";
import { CategoryRender } from "./components/category-render";
import FeaturedCourse from "./components/FeaturedCourse";
import RandomLessons from "./components/RandomLessons";
import LearningHighlights from "./components/LearningHighlights";
import LearningPaths from "./components/LearningPaths";
import RandomHadith from "./components/RandomHadith";
import { getSeoPage, getSettings } from "@/lib/api";

export const dynamic = "force-dynamic";

async function resolvePageMetadata(path: string, fallbackTitle: string, fallbackDescription: string) {
	const [seoRecord, settings] = await Promise.all([getSeoPage(path), getSettings()]);
	const defaultTitle = settings.default_meta_title ?? fallbackTitle;
	const defaultDescription = settings.default_meta_description ?? fallbackDescription;
	const metadataTitle = seoRecord?.meta_title ?? seoRecord?.og_title ?? defaultTitle;
	const metadataDescription = seoRecord?.meta_description ?? seoRecord?.og_description ?? defaultDescription;
	const openGraphTitle = seoRecord?.og_title ?? metadataTitle ?? fallbackTitle;
	const openGraphDescription = seoRecord?.og_description ?? metadataDescription ?? fallbackDescription;
	const canonicalUrl = seoRecord?.canonical_url ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://iqrainternationalislamicinstitute.com"}${path === "/" ? "" : path}`;
	const keywords = seoRecord?.meta_keywords
		? seoRecord.meta_keywords.split(",").map((item) => item.trim()).filter(Boolean)
		: settings.default_meta_keywords
			? settings.default_meta_keywords.split(",").map((item) => item.trim()).filter(Boolean)
			: ["online quran", "islamic learning", "course platform"];

	return {
		title: metadataTitle || fallbackTitle,
		description: metadataDescription || fallbackDescription,
		keywords,
		robots: seoRecord?.robots ?? "index,follow",
		alternates: { canonical: canonicalUrl },
		openGraph: {
			title: openGraphTitle,
			description: openGraphDescription,
			images: seoRecord?.og_image ? [seoRecord.og_image] : undefined,
		},
	};
}

export async function generateMetadata(): Promise<Metadata> {
	const meta = await resolvePageMetadata("/", "Iqra International", "Learn Quranic and Islamic studies through structured online courses.");
	return {
		...meta,
		title: meta.title,
		description: meta.description,
		keywords: meta.keywords,
		robots: meta.robots,
		alternates: meta.alternates,
		openGraph: meta.openGraph,
	};
}

const navItems = [
	{ label: "Home", href: "/" },
	{ label: "Courses", href: "/courses" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Blog", href: "/blog" },
	{ label: "Contact", href: "/contactus" },
];

export default function Home() {
	return (
		<div>
			<HeaderNavigationBase items={navItems} activeUrl="/" />
			<Hero />
			<CategoryRender limit={6} />
			<RandomHadith offset={0} />
			<FeaturedCourse />
			<RandomLessons />
			<RandomHadith offset={1} showHeadline={false} />
		</div>
	);
}
