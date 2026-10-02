import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSeoMetadata } from "@/lib/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/contact", {
    title: "Contact Iqra International",
    description: "Contact the Iqra team to ask about courses, guidance, and personalised learning support.",
    canonicalPath: "/contactus",
  });
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}