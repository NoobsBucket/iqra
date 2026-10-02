import type { Metadata } from "next";
import { getSeoPage, getSettings } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const [seoRecord, settings] = await Promise.all([getSeoPage("/careers"), getSettings()]);
  const defaultTitle = settings.default_meta_title ?? "Join Our Mission | Iqra International";
  const defaultDescription = settings.default_meta_description ?? "Join a mission-led team helping learners grow in Quranic understanding and Islamic knowledge.";
  const title = seoRecord?.meta_title ?? defaultTitle;
  const description = seoRecord?.meta_description ?? defaultDescription;

  return {
    title,
    description,
    keywords: seoRecord?.meta_keywords ? seoRecord.meta_keywords.split(",").map((item) => item.trim()).filter(Boolean) : settings.default_meta_keywords ? settings.default_meta_keywords.split(",").map((item) => item.trim()).filter(Boolean) : ["careers", "islamic learning"],
    robots: seoRecord?.robots ?? "index,follow",
    alternates: { canonical: seoRecord?.canonical_url ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://iqrainternationalislamicinstitute.com"}/careers` },
    openGraph: {
      title: seoRecord?.og_title ?? title,
      description: seoRecord?.og_description ?? description,
      images: seoRecord?.og_image ? [seoRecord.og_image] : undefined,
    },
  };
}

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Careers</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Join our mission</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">
          We are building a better learning experience for learners who want meaningful, practical, and spiritually grounded education.
        </p>
      </div>
    </main>
  );
}
