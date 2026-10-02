"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/app/components/auth-user-provider";
import { MediaUpload } from "@/app/components/admin/media-upload";
import { AdminToastViewport, notifyAdminToast } from "@/app/components/admin/admin-toast";

type SeoRow = {
  id?: string;
  page_name?: string;
  page_path?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  json_ld?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SeoForm = {
  page_name: string;
  page_path: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  robots: string;
  json_ld: string;
};

const emptyForm: SeoForm = {
  page_name: "",
  page_path: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_title: "",
  og_description: "",
  og_image: "",
  canonical_url: "",
  robots: "index,follow",
  json_ld: "",
};

const robotOptions = ["index,follow", "index,nofollow", "noindex,nofollow", "noindex,follow"];

export function SeoSettingsDashboard() {
  const authUser = useAuthUser();
  const [rows, setRows] = useState<SeoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<SeoForm>(emptyForm);
  const [message, setMessage] = useState("");

  const role = authUser?.role?.toLowerCase() ?? "";
  const canAccess = role === "admin" || role === "instructor";

  const metaTitleChars = form.meta_title.length;
  const metaDescriptionChars = form.meta_description.length;

  const loadPages = async () => {
    try {
      const response = await fetch("/api/admin/seo", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const payload: unknown = await response.json();
      const data = payload && typeof payload === "object" && "data" in payload ? (payload as { data?: unknown }).data : payload;
      const items = Array.isArray(data) ? (data as SeoRow[]) : [];
      setRows(items as SeoRow[]);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to load SEO records.";
      setMessage(text);
      notifyAdminToast({ message: text, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canAccess) return;
    void loadPages();
  }, [canAccess]);

  const updateField = <K extends keyof SeoForm>(key: K, value: SeoForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedId(null);
  };

  const savePage = async () => {
    if (!form.page_name.trim() || !form.page_path.trim()) {
      setMessage("Page name and page path are required.");
      notifyAdminToast({ message: "Page name and page path are required.", tone: "error" });
      return;
    }

    if (metaTitleChars > 70) {
      setMessage("Meta title must stay within 70 characters.");
      notifyAdminToast({ message: "Meta title must stay within 70 characters.", tone: "error" });
      return;
    }

    if (metaDescriptionChars > 170) {
      setMessage("Meta description must stay within 170 characters.");
      notifyAdminToast({ message: "Meta description must stay within 170 characters.", tone: "error" });
      return;
    }

    if (form.json_ld.trim()) {
      try {
        JSON.parse(form.json_ld);
      } catch {
        setMessage("JSON-LD must be valid JSON.");
        notifyAdminToast({ message: "JSON-LD must be valid JSON.", tone: "error" });
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        page_name: form.page_name.trim(),
        page_path: form.page_path.trim(),
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        meta_keywords: form.meta_keywords.trim() || null,
        og_title: form.og_title.trim() || null,
        og_description: form.og_description.trim() || null,
        og_image: form.og_image.trim() || null,
        canonical_url: form.canonical_url.trim() || null,
        robots: form.robots || "index,follow",
        json_ld: form.json_ld.trim() || null,
      };

      const response = await fetch(selectedId ? `/api/admin/seo/${selectedId}` : "/api/admin/seo", {
        method: selectedId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        const errorMessage = typeof errorPayload.error === "string"
          ? errorPayload.error
          : typeof errorPayload.message === "string"
            ? errorPayload.message
            : `Request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json().catch(() => payload);
      const savedRecord = result && typeof result === "object" && "id" in result ? (result as SeoRow) : null;

      setRows((current) => {
        if (selectedId && savedRecord?.id) {
          return current.map((row) => (row.id === selectedId ? { ...row, ...savedRecord } : row));
        }
        if (savedRecord?.id) {
          return [savedRecord, ...current];
        }
        return current;
      });

      const successMessage = selectedId ? "SEO page updated successfully." : "SEO page added successfully.";
      setMessage(successMessage);
      notifyAdminToast({ message: successMessage, tone: "success" });
      resetForm();
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Unable to save the SEO page.";
      setMessage(messageText);
      notifyAdminToast({ message: messageText, tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/seo/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
      setRows((current) => current.filter((row) => row.id !== id));
      if (selectedId === id) resetForm();
      const messageText = "SEO page deleted successfully.";
      setMessage(messageText);
      notifyAdminToast({ message: messageText, tone: "success" });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Unable to delete the SEO page.";
      setMessage(messageText);
      notifyAdminToast({ message: messageText, tone: "error" });
    }
  };

  const startEditing = (row: SeoRow) => {
    setSelectedId(row.id ?? null);
    setForm({
      page_name: row.page_name ?? "",
      page_path: row.page_path ?? "",
      meta_title: row.meta_title ?? "",
      meta_description: row.meta_description ?? "",
      meta_keywords: row.meta_keywords ?? "",
      og_title: row.og_title ?? "",
      og_description: row.og_description ?? "",
      og_image: row.og_image ?? "",
      canonical_url: row.canonical_url ?? "",
      robots: row.robots ?? "index,follow",
      json_ld: typeof row.json_ld === "string" ? row.json_ld : row.json_ld ? JSON.stringify(row.json_ld, null, 2) : "",
    });
  };

  const titlePreview = form.meta_title.trim() || form.page_name.trim() || "Page title";
  const descriptionPreview = form.meta_description.trim() || "A brief summary of the page appears here.";
  const searchUrl = form.page_path.trim() || "/";

  if (!canAccess) {
    return <div className="px-4 py-12 text-center text-slate-600">Admin access is required to manage SEO settings.</div>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <AdminToastViewport message={message} />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">SEO</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">SEO Settings</h1>
          </div>
          <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Add page</button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-900">Pages</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{rows.length} total</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3">Path</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Loading SEO pages...</td></tr>
                ) : rows.length ? rows.map((row) => (
                  <tr key={row.id ?? `${row.page_path}-${row.page_name}`} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.page_name ?? "Untitled page"}</td>
                    <td className="px-4 py-3 text-slate-600">{row.page_path ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{row.meta_title ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{row.updated_at ? new Date(row.updated_at).toLocaleDateString() : row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => startEditing(row)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white">Edit</button>
                        <button type="button" onClick={() => row.id && deletePage(row.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No SEO pages found yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-900">{selectedId ? "Edit page" : "Add page"}</h2>
            {selectedId ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Editing</span> : null}
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Page name</span>
                <input value={form.page_name} onChange={(event) => updateField("page_name", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-700" placeholder="Home" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Page path</span>
                <input value={form.page_path} onChange={(event) => updateField("page_path", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-700" placeholder="/courses" />
              </label>
            </div>

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700">Meta title</span>
                <span className={`text-xs ${metaTitleChars > 70 ? "text-rose-600" : "text-slate-500"}`}>{metaTitleChars}/70</span>
              </div>
              <input value={form.meta_title} onChange={(event) => updateField("meta_title", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-700" placeholder="Search title" />
            </label>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {metaTitleChars > 60 ? "Title is approaching the recommended limit." : "Title length is within the recommended range."}
            </div>

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700">Meta description</span>
                <span className={`text-xs ${metaDescriptionChars > 170 ? "text-rose-600" : "text-slate-500"}`}>{metaDescriptionChars}/170</span>
              </div>
              <textarea value={form.meta_description} onChange={(event) => updateField("meta_description", event.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-700" placeholder="Page description" />
            </label>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {metaDescriptionChars > 160 ? "Description length is above the recommended range." : "Description length is within the recommended range."}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Meta keywords</span>
                <input value={form.meta_keywords} onChange={(event) => updateField("meta_keywords", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-700" placeholder="quran, islamic, learning" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Robots</span>
                <select value={form.robots} onChange={(event) => updateField("robots", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-700">
                  {robotOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">OG title</span>
                <input value={form.og_title} onChange={(event) => updateField("og_title", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-700" placeholder="Open Graph title" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Canonical URL</span>
                <input value={form.canonical_url} onChange={(event) => updateField("canonical_url", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-700" placeholder="https://example.com/page" />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">OG description</span>
              <textarea value={form.og_description} onChange={(event) => updateField("og_description", event.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-700" placeholder="Open Graph description" />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <MediaUpload label="Open Graph image" mediaType="image" value={form.og_image} onChange={(value) => updateField("og_image", value)} allowedTypes={["image/jpeg", "image/png", "image/webp"]} maxSize={2 * 1024 * 1024} />
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">JSON-LD</span>
              <textarea value={form.json_ld} onChange={(event) => updateField("json_ld", event.target.value)} rows={6} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs outline-none focus:border-teal-700" placeholder={'{ "@context": "https://schema.org" }'} />
            </label>

            <div className="flex gap-3">
              <button type="button" disabled={saving} onClick={() => void savePage()} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : selectedId ? "Save changes" : "Add page"}</button>
              <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Clear</button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Google preview</h2>
        <div className="mt-4 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-700">Google</p>
          <p className="mt-2 text-lg font-medium text-blue-700">{titlePreview}</p>
          <p className="mt-1 break-all text-xs text-slate-500">{searchUrl}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{descriptionPreview}</p>
        </div>
      </section>
    </main>
  );
}
