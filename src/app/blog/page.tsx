import Link from "next/link";
import { getBlogCategories, getBlogPosts } from "@/lib/api";
import { HeaderNavigationBase } from "../components/application/app-navigation/header-navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/aboutus" },
  { label: "Courses", href: "/courses" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contactus" },
];

export default async function BlogPage() {
  const categories = await getBlogCategories();
  const posts = await getBlogPosts();

  return (
    <>
      <HeaderNavigationBase items={navItems} activeUrl="/blog" />
      <main className="min-h-screen bg-[#f5f7f2] px-5 py-14 font-medium text-[#102b2a] [font-family:var(--font-jost),sans-serif] md:px-10 md:py-20 [&_h1]:font-bold [&_h2]:font-bold [&_a]:font-medium">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 border-b border-[#dce5df] pb-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#9b7d2c]">The Iqra journal</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">Ideas for a life of learning.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#536866] md:text-lg">Thoughtful guidance, reflections, and practical insights for your Quran and Islamic studies journey.</p>
          </div>
          <div className="rounded-[2rem] bg-[#102b2a] p-7 text-white shadow-[0_20px_55px_rgba(16,43,42,0.14)]"><p className="text-3xl leading-relaxed" dir="rtl">وَقُلْ رَبِّ زِدْنِي عِلْمًا</p><p className="mt-4 text-sm text-white/65">“My Lord, increase me in knowledge.” <span className="text-[#d9c989]">20:114</span></p></div>
        </div>

        <div className="mb-10 flex flex-wrap items-center gap-3">
          <span className="mr-2 text-xs font-bold uppercase tracking-[0.2em] text-[#536866]">Explore topics</span>
          {categories.length ? categories.map((category) => (
              <span key={category.id} className="rounded-full border border-[#cbd9d2] bg-white px-4 py-2 text-sm font-semibold text-[#31514c] transition hover:border-[#9b7d2c]">
              {category.name}
            </span>
          )) : (
            <span className="rounded-full border border-[#cbd9d2] bg-white px-4 py-2 text-sm font-semibold text-[#31514c]">General</span>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.length ? posts.map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-[2rem] border border-[#dce5df] bg-white shadow-[0_14px_45px_rgba(16,43,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,43,42,0.12)]">
              <Link href={`/blog/${post.slug ?? post.id}`} className="block">
                {post.cover_image ? <img src={post.cover_image} alt="" className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-56 items-end bg-[linear-gradient(135deg,#d9ebe1,#f4eac6)] p-6"><span className="text-5xl text-[#31514c]/40">✦</span></div>}
                <div className="p-6"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b7d2c]">{categories.find((category) => category.id === post.category_id)?.name ?? "General"}</p><h2 className="mt-3 text-2xl font-black leading-tight text-[#102b2a]">{post.title}</h2><p className="mt-4 line-clamp-3 text-sm leading-7 text-[#536866]">{post.excerpt ?? `${post.content.slice(0, 140)}...`}</p><span className="mt-6 inline-flex items-center text-sm font-bold text-[#197052]">Read article <span className="ml-2 transition group-hover:translate-x-1">→</span></span></div>
              </Link>
            </article>
          )) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 md:col-span-2 xl:col-span-3">
              Blog posts will appear here when the API is connectedd.
            </div>
          )}
        </div>
      </div>
      </main>
    </>
  );
}
