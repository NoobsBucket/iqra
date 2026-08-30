import Link from "next/link";

export type LessonCardProps = {
  lesson: {
    id: string;
    title: string;
    description?: string;
    video_url?: string;
    order_index?: number;
    is_free?: boolean;
  };
  index: number;
  courseId: string;
};

export function LessonCard({ lesson, index, courseId }: LessonCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
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
          {lesson.video_url ? "Video lesson" : "Study guide"}
        </div>
        <Link
          href={`/courses/${courseId}/lessons?lesson=${lesson.id}`}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          View lesson
        </Link>
      </div>
    </article>
  );
}
