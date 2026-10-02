import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/careers", {
    title: "Join Our Mission | Iqra International",
    description: "Join a mission-led team helping learners grow in Quranic understanding and Islamic knowledge.",
  });
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
