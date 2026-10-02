"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/app/components/auth-user-provider";
import { MediaUpload } from "@/app/components/admin/media-upload";
import { AdminToastViewport } from "@/app/components/admin/admin-toast";
import { API_BASE_URL, type BlogCategoryRecord, type BlogPostRecord } from "@/lib/api";

const defaultBlogForm = {
  title: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category_id: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
};

async function apiRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export function BlogPanel() {
  const authUser = useAuthUser();
  const [blogCategories, setBlogCategories] = useState<BlogCategoryRecord[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostRecord[]>([]);
  const [form, setForm] = useState(defaultBlogForm);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [categories, posts] = await Promise.all([
        apiRequest<BlogCategoryRecord[]>('/v1/blog/categories').catch(() => []),
        apiRequest<BlogPostRecord[]>('/v1/blog').catch(() => []),
      ]);

      setBlogCategories(categories);
      setBlogPosts(posts);
    } catch {
      setMessage("The blog service is currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!form.title.trim() || !form.content.trim() || !form.category_id) {
        setMessage("Enter a title and content, then select a blog category.");
        return;
      }

      if (!selectedPostId && !authUser?.id) {
        setMessage("You must be signed in to create a blog post.");
        return;
      }

      const payload = {
        ...(selectedPostId ? {} : { created_by: authUser?.id }),
        title: form.title,
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image: form.cover_image || null,
        category_id: form.category_id,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      };

      if (selectedPostId) {
        const updated = await apiRequest<BlogPostRecord>(`/v1/blog/${selectedPostId}`, "PATCH", payload);
        setBlogPosts((current) => current.map((post) => (post.id === selectedPostId ? updated : post)));
        setMessage("Blog post updated successfully.");
      } else {
        const created = await apiRequest<BlogPostRecord>("/v1/blog", "POST", payload);
        setBlogPosts((current) => [created, ...current]);
        setMessage("Blog post created successfully.");
      }

      setForm(defaultBlogForm);
      setSelectedPostId(null);
      void loadData();
    } catch {
      setMessage("Unable to save the blog post right now.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest<void>(`/v1/blog/${id}`, "DELETE");
      setBlogPosts((current) => current.filter((post) => post.id !== id));
      setMessage("Blog post deleted.");
    } catch {
      setMessage("Unable to delete the blog post.");
    }
  };

  const handleEdit = (post: BlogPostRecord) => {
    setSelectedPostId(post.id);
    setForm({
      title: post.title ?? "",
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      cover_image: post.cover_image ?? "",
      category_id: post.category_id ?? "",
      meta_title: post.meta_title ?? "",
      meta_description: post.meta_description ?? "",
      meta_keywords: post.meta_keywords ?? "",
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminToastViewport message={message} />
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">Blog panel</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">Create and manage blog posts</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm(defaultBlogForm);
                setSelectedPostId(null);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              New post
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Title</span>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-600"
                placeholder="Post title"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Category</span>
              <select
                value={form.category_id}
                onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-600"
              >
                <option value="">Select category</option>
                {blogCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Excerpt</span>
              <input
                value={form.excerpt}
                onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-600"
                placeholder="Short summary"
              />
            </label>

            <div className="md:col-span-2">
              <MediaUpload label="Cover image" mediaType="image" value={form.cover_image} onChange={(cover_image) => setForm((current) => ({ ...current, cover_image }))} />
            </div>

            <label className="md:col-span-2 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Content</span>
              <textarea
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                rows={8}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-600"
                placeholder="Write the article content..."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Meta title</span>
              <input
                value={form.meta_title}
                onChange={(event) => setForm((current) => ({ ...current, meta_title: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-600"
                placeholder="SEO title"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Meta keywords</span>
              <input
                value={form.meta_keywords}
                onChange={(event) => setForm((current) => ({ ...current, meta_keywords: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-600"
                placeholder="keyword, keyword, keyword"
              />
            </label>

            <label className="md:col-span-2 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Meta description</span>
              <textarea
                value={form.meta_description}
                onChange={(event) => setForm((current) => ({ ...current, meta_description: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-600"
                placeholder="Search description"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void handleSubmit()}
            className="mt-6 inline-flex rounded-xl bg-sky-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {selectedPostId ? "Update post" : "Create post"}
          </button>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">All blog posts</h2>

          <div className="mt-5 space-y-3">
            {blogPosts.length ? (
              blogPosts.map((post) => (
                <div key={post.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{post.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{post.excerpt ?? "No excerpt"}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(post)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(post.id)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                No blog posts yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
