import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getCourseLessons } from "@/lib/api";
import { LessonCard } from "@/components/lesson-card";
import { CourseReviews } from "@/components/course-reviews";
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

  return (
    <>
      <HeaderNavigationBase items={navItems} activeUrl="/courses" />
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
              <div className="mb-5 flex h-64 items-center justify-center rounded-[2rem] text-6xl shadow-inner" style={{ background: course.thumbBg ?? "linear-gradient(135deg,#E6F4F4,#C5E8E8)" }}>
                {course.emoji ?? "📖"}
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
