import Link from "next/link";
import { notFound } from "next/navigation";
import { getLessons } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = (await getLessons()).find((item) => item.id === lessonId);

  if (!lesson) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <article className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <Link href="/lessons" className="text-sm font-semibold text-slate-600 hover:text-slate-900">← Back to lessons</Link>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-800">{lesson.is_free ? "Free preview" : "Video lesson"}</span>
          {lesson.course_id ?? lesson.courseId ? <Link href={`/courses/${lesson.course_id ?? lesson.courseId}`} className="text-sm font-semibold text-teal-700 hover:text-teal-900">View course</Link> : null}
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight">{lesson.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{lesson.description}</p>
        {lesson.video_url ? (
          <div className="mt-8 overflow-hidden rounded-3xl bg-slate-950">
            <video controls autoPlay className="aspect-video w-full" src={lesson.video_url} />
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">This lesson does not have a video URL yet.</div>
        )}
      </article>
    </main>
  );
}