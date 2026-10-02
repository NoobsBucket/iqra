import { CategoryRender } from "../components/category-render";
import { HeaderNavigationBase } from "../components/application/app-navigation/header-navigation";

export const dynamic = "force-dynamic";

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
