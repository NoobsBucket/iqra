import Hero from "./components/hero";
import { HeaderNavigationBase } from "./components/application/app-navigation/header-navigation";
import { CategoryRender } from "./components/category-render";
import FeaturedCourse from "./components/FeaturedCourse";
import RandomLessons from "./components/RandomLessons";
import LearningHighlights from "./components/LearningHighlights";
import LearningPaths from "./components/LearningPaths";
import RandomHadith from "./components/RandomHadith";

export const dynamic = "force-dynamic";

const navItems = [
	{ label: "Home", href: "/" },
	{ label: "About", href: "/aboutus" },
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
			<FeaturedCourse />
			<RandomLessons />
			<RandomHadith offset={0} />
			<LearningHighlights />
			<RandomHadith offset={1} showHeadline={false} />
			<LearningPaths />
		</div>
	);
}
