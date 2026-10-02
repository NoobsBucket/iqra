import { HeaderNavigationBase } from "@/app/components/application/app-navigation/header-navigation";
import { SeoSettingsDashboard } from "@/components/admin/seo-settings";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Admin", href: "/admin" },
  { label: "SEO Settings", href: "/admin/seo" },
];

export default function SeoPage() {
  return (
    <div className="min-h-screen bg-slate-100 [font-family:var(--font-jost),sans-serif]">
      <HeaderNavigationBase items={navItems} activeUrl="/admin/seo" />
      <SeoSettingsDashboard />
    </div>
  );
}
