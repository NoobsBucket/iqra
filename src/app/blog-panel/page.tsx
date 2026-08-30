import { HeaderNavigationBase } from "@/app/components/application/app-navigation/header-navigation";
import { BlogPanel } from "@/components/blog/blog-panel";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Blog", href: "/blog" },
  { label: "Blog panel", href: "/blog-panel" },
  { label: "Admin", href: "/admin" },
];

export default function BlogPanelPage() {
  return (
    <div className="min-h-screen bg-slate-100 [font-family:var(--font-jost),sans-serif]">
      <HeaderNavigationBase items={navItems} activeUrl="/blog-panel" />
      <BlogPanel />
    </div>
  );
}
