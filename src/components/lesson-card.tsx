import Link from "next/link";

export type LessonCardProps = {
  lesson: {
    id: string;
    title: string;
    description?: string;
    video_url?: string;
    thumbnail_url?: string;
    thumbnailUrl?: string;
    order_index?: number;
    is_free?: boolean;
    course_id?: string;
    courseId?: string;
  };
  index: number;
  courseId?: string;
};

export function LessonCard({ lesson, index, courseId }: LessonCardProps) {
  const videoUrl = lesson.video_url;
  const thumbnailUrl = lesson.thumbnail_url ?? lesson.thumbnailUrl;
  const lessonHref = courseId ? `/courses/${courseId}/lessons?lesson=${lesson.id}` : `/lessons/${lesson.id}`;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-video bg-slate-950">
        {thumbnailUrl ? <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" /> : videoUrl ? <video muted preload="metadata" className="h-full w-full object-cover" src={videoUrl} /> : <div className="flex h-full items-center justify-center text-5xl">▶</div>}
        <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Video lesson</span>
      </div>
      <div className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-800">
          Lesson {index + 1}
        </span>
        <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
          {lesson.is_free ? "Free" : "Premium"}
        </span>
      </div>

      <h3 className="mb-2 text-xl font-bold text-slate-900">{lesson.title}</h3>
      <p className="mb-4 text-sm leading-6 text-slate-600">
        {lesson.description || "Learn the core ideas and practice the required skills in a focused lesson."}
      </p>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          {lesson.order_index ? `Lesson ${lesson.order_index}` : "On demand lesson"}
        </div>
        <Link
          href={lessonHref}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          View lesson
        </Link>
      </div>
      </div>
    </article>
  );
}
