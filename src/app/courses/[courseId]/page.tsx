import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getCourseLessons, getSeoPage, getSettings } from "@/lib/api";
import { LessonCard } from "@/components/lesson-card";
import { CourseReviews } from "@/components/course-reviews";
import { HeaderNavigationBase } from "../../components/application/app-navigation/header-navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contactus" },
];

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  const [course, seoRecord, settings] = await Promise.all([getCourseById(courseId), getSeoPage(`/courses/${courseId}`), getSettings()]);
  const fallbackTitle = course?.meta_title ?? course?.title ?? "Course";
  const fallbackDescription = course?.meta_description ?? course?.description ?? "Learn with structured, practical guidance.";
  const title = course?.meta_title ?? seoRecord?.meta_title ?? fallbackTitle;
  const description = course?.meta_description ?? seoRecord?.meta_description ?? fallbackDescription;
  const keywords = course?.meta_keywords ? course.meta_keywords.split(",").map((item) => item.trim()).filter(Boolean) : seoRecord?.meta_keywords ? seoRecord.meta_keywords.split(",").map((item) => item.trim()).filter(Boolean) : settings.default_meta_keywords ? settings.default_meta_keywords.split(",").map((item) => item.trim()).filter(Boolean) : ["course", "islamic learning"];

  return {
    title,
    description,
    keywords,
    robots: seoRecord?.robots ?? "index,follow",
    alternates: { canonical: seoRecord?.canonical_url ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://iqrainternationalislamicinstitute.com"}/courses/${courseId}` },
    openGraph: {
      title: seoRecord?.og_title ?? course?.meta_title ?? course?.title ?? title,
      description: seoRecord?.og_description ?? course?.meta_description ?? description,
      images: course?.image_url ? [course.image_url] : seoRecord?.og_image ? [seoRecord.og_image] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const lessons = await getCourseLessons(courseId);
  const seoRecord = await getSeoPage(`/courses/${courseId}`);
  const jsonLdValue = seoRecord?.json_ld ?? course.json_ld;
  const jsonLdScript = typeof jsonLdValue === "string" ? jsonLdValue : jsonLdValue ? JSON.stringify(jsonLdValue) : "";

  return (
    <>
      <HeaderNavigationBase items={navItems} activeUrl="/courses" />
      {jsonLdScript ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} /> : null}
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link href="/courses" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
              ← Back to courses
            </Link>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-800">
              {course.level ?? "All levels"}
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 overflow-hidden rounded-[2rem] shadow-inner" style={{ background: course.thumbBg ?? "linear-gradient(135deg,#E6F4F4,#C5E8E8)" }}>
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="h-64 w-full object-cover" />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-slate-100 text-lg font-semibold uppercase tracking-[0.22em] text-slate-500">Course</div>
                )}
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{course.description}</p>
            </div>

            <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
                <span>Rating</span>
                <span className="font-bold text-amber-500">★ {course.rating ?? "4.9"}</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
                <span>Students</span>
                <span className="font-bold text-slate-900">{course.students ?? "1,000+"}</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
                <span>Lessons</span>
                <span className="font-bold text-slate-900">{course.lessons ?? lessons.length ?? 12}</span>
              </div>
              <div className="mb-6 flex items-end gap-2">
                <span className="text-4xl font-black text-slate-900">${course.price}</span>
                {course.originalPrice ? <span className="pb-1 text-lg text-slate-400 line-through">${course.originalPrice}</span> : null}
              </div>

              <div className="space-y-3">
                <Link href={`/register?course=${course.id}`} className="block rounded-2xl bg-slate-900 px-5 py-3 text-center text-base font-semibold text-white transition hover:bg-teal-700">
                  Enrol now
                </Link>
                <Link href={`/courses/${course.id}/lessons`} className="block rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-base font-semibold text-slate-900 transition hover:border-slate-300">
                  View lessons
                </Link>
              </div>
            </aside>
          </div>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-2xl font-black text-slate-900">Course lessons</h2>
          {lessons.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lessons.map((lesson, index) => (
                <LessonCard key={lesson.id} lesson={lesson} index={index} courseId={course.id} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              No lessons available yet for this course.
            </div>
          )}
        </section>

        <CourseReviews 
          courseId={course.id}
          averageRating={typeof (course as unknown as { average_rating?: number }).average_rating === "number" ? (course as unknown as { average_rating?: number }).average_rating : Number(course.rating ?? 4.9)}
          totalStudents={typeof (course as unknown as { total_students?: number }).total_students === "number" ? (course as unknown as { total_students?: number }).total_students : 1000}
        />
      </div>
      </main>
    </>
  );
}
