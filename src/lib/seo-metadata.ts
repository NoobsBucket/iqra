import type { Metadata } from "next";
import { getSeoPage } from "@/lib/api";

const defaultSiteOrigin = "https://iqrainternationalislamicinstitute.com";

type SeoMetadataOptions = {
  title: string;
  description: string;
  canonicalPath?: string;
};

export function parseSeoKeywords(value?: string): string[] | undefined {
  const keywords = value?.split(",").map((keyword) => keyword.trim()).filter(Boolean);
  return keywords?.length ? keywords : undefined;
}

export async function getSeoMetadata(path: string, options: SeoMetadataOptions): Promise<Metadata> {
  const record = await getSeoPage(path);
  const title = record?.meta_title ?? options.title;
  const description = record?.meta_description ?? options.description;
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim() || defaultSiteOrigin;
  const canonicalPath = options.canonicalPath ?? path;

  return {
    title,
    description,
    keywords: parseSeoKeywords(record?.meta_keywords),
    robots: record?.robots,
    alternates: {
      canonical: record?.canonical_url ?? new URL(canonicalPath, `${siteOrigin}/`).toString(),
    },
    openGraph: {
      title: record?.og_title ?? title,
      description: record?.og_description ?? description,
      images: record?.og_image ? [record.og_image] : undefined,
    },
  };
}