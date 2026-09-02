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
  courseTitle?: string;
};

export function LessonCard({ lesson, index, courseId, courseTitle }: LessonCardProps) {
  const videoUrl = lesson.video_url;
  const thumbnailUrl = lesson.thumbnail_url ?? lesson.thumbnailUrl;
  const lessonHref = lesson.is_free
    ? courseId ? `/courses/${courseId}/lessons?lesson=${lesson.id}` : `/lessons/${lesson.id}`
    : courseId ? `/register?course=${courseId}` : "/courses";

  return (
    <article className="overflow-hidden rounded-md border border-black/15 bg-white transition hover:-translate-y-0.5 hover:border-black/35">
      <div className="relative aspect-video bg-slate-950">
        {thumbnailUrl ? <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" /> : videoUrl ? <video muted preload="metadata" className="h-full w-full object-cover" src={videoUrl} /> : <div className="flex h-full items-center justify-center text-5xl">▶</div>}
        <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Video lesson</span>
      </div>
      <div className="p-5 max-sm:p-3">
      <div className="mb-4 flex items-center justify-between gap-3 max-sm:mb-2">
        <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-800">
          Lesson {index + 1}
        </span>
        <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
          {lesson.is_free ? "Free" : "Premium"}
        </span>
      </div>

      <h3 className="mb-2 text-xl font-bold text-slate-900 max-sm:line-clamp-1 max-sm:text-base">{lesson.title}</h3>
      {courseTitle ? <p className="mb-2 line-clamp-1 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{courseTitle}</p> : null}
      <p className="mb-4 text-sm leading-6 text-slate-600 max-sm:mb-3 max-sm:line-clamp-2 max-sm:text-xs max-sm:leading-5">
        {lesson.description || "Learn the core ideas and practice the required skills in a focused lesson."}
      </p>

      <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-4 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 max-sm:pt-3">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          {lesson.order_index ? `Lesson ${lesson.order_index}` : "On demand lesson"}
        </div>
        <Link
          href={lessonHref}
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 max-sm:px-2 max-sm:py-1.5 max-sm:text-xs"
        >
          {lesson.is_free ? "View lesson" : "Enrol to unlock"}
        </Link>
      </div>
      </div>
    </article>
  );
}
