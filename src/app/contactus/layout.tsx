import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSeoPage, getSettings } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const [seoRecord, settings] = await Promise.all([getSeoPage("/contactus"), getSettings()]);
  const defaultTitle = settings.default_meta_title ?? "Contact Iqra International";
  const defaultDescription = settings.default_meta_description ?? "Contact the Iqra team to ask about courses, guidance, and personalised learning support.";
  const title = seoRecord?.meta_title ?? defaultTitle;
  const description = seoRecord?.meta_description ?? defaultDescription;
  const keywords = seoRecord?.meta_keywords ? seoRecord.meta_keywords.split(",").map((item) => item.trim()).filter(Boolean) : settings.default_meta_keywords ? settings.default_meta_keywords.split(",").map((item) => item.trim()).filter(Boolean) : ["contact", "support", "islamic courses"];

  return {
    title,
    description,
    keywords,
    robots: seoRecord?.robots ?? "index,follow",
    alternates: { canonical: seoRecord?.canonical_url ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://iqrainternationalislamicinstitute.com"}/contactus` },
    openGraph: {
      title: seoRecord?.og_title ?? title,
      description: seoRecord?.og_description ?? description,
      images: seoRecord?.og_image ? [seoRecord.og_image] : undefined,
    },
  };
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}