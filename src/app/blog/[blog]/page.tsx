import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/api";
import { HeaderNavigationBase } from "../../components/application/app-navigation/header-navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/aboutus" },
  { label: "Courses", href: "/courses" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contactus" },
];

export async function generateMetadata({ params }: { params: Promise<{ blog: string }> }): Promise<Metadata> {
  const { blog } = await params;
  const post = await getBlogPost(blog);
  return {
    title: post?.meta_title ?? post?.title ?? "Blog article",
    description: post?.meta_description ?? post?.excerpt ?? post?.content.slice(0, 160),
    keywords: post?.meta_keywords?.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    openGraph: post ? { title: post.meta_title ?? post.title, description: post.meta_description ?? post.excerpt, images: post.cover_image ? [post.cover_image] : undefined } : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ blog: string }>;
}) {
  const { blog } = await params;
  const post = await getBlogPost(blog);

  if (!post) notFound();

  return (
    <>
      <HeaderNavigationBase items={navItems} activeUrl="/blog" />
      <main className="min-h-screen bg-[#f5f7f2] px-5 py-12 font-medium text-[#102b2a] [font-family:var(--font-jost),sans-serif] md:px-10 md:py-20 [&_h1]:font-bold [&_a]:font-medium">
        <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#dce5df] bg-white shadow-[0_24px_70px_rgba(16,43,42,0.09)]">
          {post.cover_image ? <img src={post.cover_image} alt={post.title} className="max-h-[34rem] w-full object-cover" /> : <div className="h-48 bg-[linear-gradient(135deg,#d9ebe1,#f4eac6)] md:h-64" />}
          <div className="px-6 py-8 md:px-14 md:py-12">
            <Link href="/blog" className="text-sm font-bold text-[#197052] transition hover:text-[#9b7d2c]">← Back to journal</Link>
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.25em] text-[#9b7d2c]">Journal article</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">{post.title}</h1>
            {post.excerpt ? <p className="mt-6 max-w-3xl text-xl leading-9 text-[#536866]">{post.excerpt}</p> : null}
            <div className="my-10 h-px bg-[#dce5df]" />
            <div className="max-w-3xl whitespace-pre-wrap text-base leading-8 text-[#31514c] md:text-lg">{post.content}</div>
          </div>
        </article>
      </main>
    </>
  );
}
