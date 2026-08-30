import Link from "next/link";
import { getBlogCategories, getBlogPosts } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const categories = await getBlogCategories();
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Blog</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Insights for your learning journey</h1>
          </div>
          <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300">
            Back home
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {categories.length ? categories.map((category) => (
            <span key={category.id} className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
              {category.name}
            </span>
          )) : (
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200">General</span>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.length ? posts.map((post) => (
            <article key={post.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 h-40 rounded-[1.5rem] bg-gradient-to-br from-teal-100 via-slate-100 to-amber-100" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">{post.category_id ?? "General"}</p>
              <h2 className="mt-3 text-xl font-black text-slate-900">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt ?? post.content.slice(0, 140)}...</p>
              <Link href={`/blog/${post.slug ?? post.id}`} className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
                Read article
              </Link>
            </article>
          )) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 md:col-span-2 xl:col-span-3">
              Blog posts will appear here when the API is connected.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
