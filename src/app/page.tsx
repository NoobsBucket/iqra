import type { Metadata } from "next";
import Hero from "./components/hero";
import { HeaderNavigationBase } from "./components/application/app-navigation/header-navigation";
import { CategoryRender } from "./components/category-render";
import FeaturedCourse from "./components/FeaturedCourse";
import RandomLessons from "./components/RandomLessons";
import LearningHighlights from "./components/LearningHighlights";
import LearningPaths from "./components/LearningPaths";
import RandomHadith from "./components/RandomHadith";
import { getSeoMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	return getSeoMetadata("/", {
		title: "Iqra International",
		description: "Learn Quranic and Islamic studies through structured online courses.",
	});
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
