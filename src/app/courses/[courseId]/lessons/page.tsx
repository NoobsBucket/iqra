import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getCourseLessons } from "@/lib/api";

export default async function CourseLessonsPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { courseId } = await params;
  const { lesson: selectedLessonId } = await searchParams;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const lessons = await getCourseLessons(courseId);
  const selectedLesson = lessons.find((item) => item.id === selectedLessonId) ?? lessons[0] ?? null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/courses/${courseId}`} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to course
          </Link>
          <Link href={`/register?course=${courseId}`} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
            Enrol in this course
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-black text-slate-900">Lessons</h2>
            <div className="space-y-3">
              {lessons.length ? lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${courseId}/lessons?lesson=${lesson.id}`}
                  className={`block rounded-2xl border p-3 transition ${selectedLesson?.id === lesson.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Lesson {index + 1}</span>
                    <span className="text-[10px] opacity-80">{lesson.is_free ? "Free" : "Premium"}</span>
                  </div>
                  <div className="mt-2 font-semibold">{lesson.title}</div>
                </Link>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  No lessons yet.
                </div>
              )}
            </div>
          </aside>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {selectedLesson ? (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-teal-800">
                    {selectedLesson.is_free ? "Free preview" : "Structured lesson"}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{course.title}</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">{selectedLesson.title}</h1>
                <p className="mt-4 text-base leading-7 text-slate-600">{selectedLesson.description}</p>

                {selectedLesson.video_url ? (
                  <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950">
                    <video controls className="aspect-video w-full" src={selectedLesson.video_url} />
                  </div>
                ) : (
                  <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                    The lesson video will be added here once the backend provides the video URL.
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
                Select a lesson to start learning.
              </div>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
