import Image from "next/image";
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
        {lesson.is_free && (lesson.video_url ?? lesson.videoUrl) ? (
          <div className="mt-8 overflow-hidden rounded-3xl bg-slate-950">
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
              {(lesson.thumbnail_url ?? lesson.thumbnailUrl) ? (
                <Image src={lesson.thumbnail_url ?? lesson.thumbnailUrl ?? ""} alt={lesson.title} fill className="object-cover opacity-60" sizes="(max-width: 1024px) 100vw, 80vw" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-5xl text-white/75">▶</div>
              )}
              <video
                key={lesson.id}
                controls
                autoPlay
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                playsInline
                preload="metadata"
                poster={lesson.thumbnail_url ?? lesson.thumbnailUrl ?? undefined}
                onContextMenu={(event) => event.preventDefault()}
                className="relative z-10 aspect-video h-full w-full object-cover"
                src={lesson.video_url ?? lesson.videoUrl}
              />
            </div>
          </div>
        ) : !lesson.is_free ? (
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="font-semibold text-amber-900">Enrol in this course to unlock this lesson.</p>
            {lesson.course_id ?? lesson.courseId ? <Link href={`/register?course=${lesson.course_id ?? lesson.courseId}`} className="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700">Enrol in this course</Link> : null}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">This lesson does not have a video URL yet.</div>
        )}
      </article>
    </main>
  );
}