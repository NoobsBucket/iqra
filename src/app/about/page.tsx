import type { Metadata } from "next";
import { HeaderNavigationBase } from "../components/application/app-navigation/header-navigation";
import { getSeoMetadata } from "@/lib/seo-metadata";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contactus" },
];

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/about", {
    title: "About Us | Iqra International Islamic Institute",
    description: "Learn about Iqra International Islamic Institute and our approach to accessible Quranic and Islamic studies education.",
  });
}

export default function AboutPage() {
  return (
    <>
      <HeaderNavigationBase items={navItems} activeUrl="/about" />
      <main className="min-h-screen bg-[#f5f7f2] px-5 py-14 text-[#102b2a] [font-family:var(--font-jost),sans-serif] md:px-10 md:py-20">
        <article className="mx-auto max-w-5xl border-b border-[#dce5df] pb-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b7d2c]">About Iqra</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">Learn with purpose, grow with understanding.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#536866]">
            Iqra International Islamic Institute supports learners through structured online Quranic and Islamic studies, practical learning paths, and guidance designed for different stages of life.
          </p>
        </article>
      </main>
    </>
  );
}