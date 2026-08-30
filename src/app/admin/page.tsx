import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { HeaderNavigationBase } from "@/app/components/application/app-navigation/header-navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Admin", href: "/admin" },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <HeaderNavigationBase items={navItems} activeUrl="/admin" />
      <AdminDashboard />
    </div>
  );
}
