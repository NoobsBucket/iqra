import { LessonCard } from "@/components/lesson-card";
import { getLessons } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const lessons = await getLessons();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Video library</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">All lessons</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Explore every video lesson available on the platform.</p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">{lessons.length} lessons</span>
        </div>

        {lessons.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lessons.map((lesson, index) => <LessonCard key={lesson.id} lesson={lesson} index={index} courseId={lesson.course_id ?? lesson.courseId} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No video lessons are available yet.</div>
        )}
      </div>
    </main>
  );
}